# saggamer/orchestrator-v1.5-GGUF

## Resumen

Orchestrator v1.5 es un modelo experimental de tipo mixture-of-experts desarrollado por el usuario saggamer, pensado como backend local para la aplicación Kira Superapp en Apple Silicon. Parte de una base instructiva Gemma 4 E4B (convertida a MLX) y le añade cinco bancos de adaptadores enrutados por tarea: control, browser, MCP, coding y presentation. El modelo resuelve el problema de orquestar tareas agénticas de múltiples pasos en local, combinando un backbone compartido con expertos de bajo rango seleccionados por token. Esta ficha describe la exportación GGUF del modelo, publicada como `saggamer/orchestrator-v1.5-GGUF`.

La exportación GGUF contiene el backbone y los cinco canales entrenados, con 16 expertos en cada una de las capas del decodificador 39 a 41 y dos expertos seleccionados por token. El backbone se codifica en Q8_0 (tras dequantizar desde el MLX original en 4-bit afín), mientras que los bancos de adaptadores y routers se conservan en F32 bit a bit. El modelo tiene 7.666.139.690 parámetros totales y un tamaño de repositorio de 8,6 GB.

Es relevante ahora porque demuestra un patrón de "upcycling" de un modelo denso pequeño hacia un MoE con enrutado por tarea, manteniendo un único backbone en lugar de duplicar cinco modelos completos. Ahora bien, es una exportación experimental con requisitos estrictos de runtime: no funciona con llama.cpp estándar, LM Studio ni Ollama, y requiere el binario parcheado que el autor distribuye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE de bajo rango sobre Gemma 4 E4B; 16 expertos en capas 39-41, 2 seleccionados por token |
| Parametros totales | 7.666.139.690 |
| Parametros activos | no disponible (el autor no publica el recuento de activos) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 4096`) |
| Tipos de cuantizacion | Backbone GGUF Q8_0; adaptadores y routers en F32 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con runtime parcheado propio); modelo base en MLX |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder derivado de Gemma 4 E4B al que se le incorpora un esquema MoE de bajo rango: un FFN compartido más proyecciones de expertos de bajo rango seleccionadas por token. Concretamente, hay 16 expertos en cada una de las capas del decodificador 39 a 41, y se seleccionan dos por token. Los logits del router seleccionado pasan por una softmax. El autor documenta una simplificación matemática: como cada referencia de experto congelado es igual al FFN compartido, la expresión `shared + 0.5 * sum(w * (expert-reference))` se reduce a `0.5 * (shared + sum(w * expert))`. Las actualizaciones de bajo rango se evalúan en sus posiciones originales antes y después de las no linealidades, no se promedian en un adaptador estático.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO. El modelo base MLX ya estaba en cuantización afín de 4 bits; en esta exportación el backbone se dequantiza y se recodifica como GGUF Q8_0, lo que limita cuantizaciones más agresivas pero no recupera la precisión perdida en el base original. Los cinco bancos de adaptadores y routers se preservan en F32 bit a bit. La innovación destacable es el enrutado por canal (control, browser, MCP, coding, presentation) sobre un único backbone, seleccionable al cargar el runtime mediante `--override-kv kira.channel=str:browser` (o `mcp`, `coding`, `presentation`); el canal por defecto es control. El enrutado automático de tareas entre turnos requiere un controlador anfitrión y no lo hace el CLI autónomo.

## Capacidades

- Generación de texto conversacional en inglés sobre la base instructiva Gemma 4 E4B.
- Cinco canales de comportamiento entrenados: control, browser, MCP, coding y presentation, seleccionables al cargar el runtime.
- Planificación estructurada de herramientas mediante la gramática `kira-tool-plan.gbnf`, que restringe la salida al esquema JSON de ruta y propósito de Kira.
- Soporte de tool calling y function calling a nivel de planificación (el modelo elige ruta y propósito; la ejecución la realiza el controlador anfitrión).
- Razonamiento multi-paso y tareas agénticas acotadas por el controlador de ejecución de Kira (ejecución de navegador, conexiones MCP, creación de PDF, permisos y memoria son funciones de la aplicación, no del GGUF).
- Capacidades multilingües: solo inglés declarado.
- Sin soporte de visión ni audio: es una exportación solo texto, sin proyectores.
- Modo de razonamiento desactivable en el ejemplo de ejecución (`--reasoning off`).

## Casos de uso

- Asistencia local en Apple Silicon: el modelo puede ejecutarse en un Mac con M4 mediante el runtime parcheado incluido, ofreciendo conversación y planificación sin salir del dispositivo, lo que resulta adecuado para escenarios de privacidad.
- Planificación de rutas de herramientas: usando la gramática `kira-tool-plan.gbnf` con `llama-completion`, el modelo genera JSON de ruta y propósito que un controlador externo puede validar y ejecutar, útil para pipelines de agentes con validación estricta de esquema.
- Automatización de navegador asistida: el canal browser está entrenado para tareas de navegación, y el controlador de Kira devuelve observaciones al modelo para continuar el bucle; encaja en flujos de extracción y rellenado de formularios supervisados.
- Integración con servidores MCP: el canal mcp permite al modelo planificar llamadas a herramientas expuestas por servidores Model Context Protocol, adecuado para entornos de desarrollo que ya usan MCP.
- Asistencia de programación: el canal coding está orientado a tareas de código dentro del ecosistema Kira, útil para generar y revisar fragmentos en flujos de trabajo locales.
- Generación de presentaciones: el canal presentation está entrenado para tareas de creación de contenido de presentaciones, aprovechable en flujos de documentación y elaboración de materiales.
- Investigación sobre upcycling MoE: al preservar routers y expertos en F32 y publicar el parche de llama.cpp y el código de conversión, sirve como referencia reproducible para estudiar enrutado por tarea sobre un backbone denso pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que `verification.json` contiene comprobaciones de conversión y pruebas funcionales limitadas (smoke tests), no puntuaciones de benchmarks agénticos o de navegador, y que no se reclama ninguna ganancia de capacidad por cambiar de formato. En la suite fija de smoke tests, la decodificación greedy en crudo añadió dos puntos al inicio de tres respuestas JSON de planificación de herramientas, que seleccionaron las rutas correctas pero fallaron el parseo estricto; por ello se exige decodificación restringida para esa interfaz.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 8,6 GB; el backbone en Q8_0 más adaptadores en F32 requiere en torno a esa cifra de memoria unificada para cargar el modelo completo.
- GPU recomendadas: el runtime distribuido es para macOS ARM64 (Apple Silicon); probado en un Apple M4. No se documentan requisitos para GPU NVIDIA o AMD.
- Cabe en consumer GPU: no hay información sobre GPUs de consumo tipo RTX 4090; el soporte documentado es exclusivamente Apple Silicon con macOS 27 o superior.
- Opciones de despliegue: únicamente el runtime parcheado `runtime-macos-arm64.tar.gz` incluido, o bien compilar llama.cpp en el commit exacto de `source/LLAMA_CPP_REVISION` aplicando `source/kira-upcycling.patch` con CMake. No es compatible con llama.cpp estándar, LM Studio ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| orchestrator-v1.5-GGUF | 7.666.139.690 | no disponible | apache-2.0 | GGUF con runtime propio | MoE de bajo rango, 5 canales, solo Apple Silicon |
| Gemma 4 E4B (base) | no disponible | no disponible | terminos de Google | amplia | Modelo denso instructivo upstream; sin canales ni enrutado |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparación cuantitativa con otros MoE de tamaño similar no está disponible en la información proporcionada. El único punto de referencia documentado es Gemma 4 E4B, del que este modelo hereda el backbone y al que añade los cinco bancos de adaptadores enrutados.

## Limitaciones y advertencias

- Requiere el runtime parcheado del autor: no funciona con llama.cpp estándar, LM Studio ni Ollama, lo que limita su portabilidad y su uso en infraestructura existente.
- Solo Apple Silicon: el binario distribuido es macOS ARM64, requiere macOS 27 o superior y se probó en un Apple M4; para otro hardware hay que compilar desde el código fuente.
- Solo inglés: el campo de idiomas declara únicamente `en`.
- Solo texto: no incluye proyectores de visión ni audio.
- Las funciones de navegador, MCP, PDF, permisos, memoria y orquestación Diagonal son características de la aplicación Kira, no del GGUF; abrir el modelo en un CLI de generación de texto no las proporciona.
- El enrutado automático entre canales requiere un controlador anfitrión; el CLI autónomo no cambia de canal entre turnos.
- La decodificación greedy sin restricciones produjo fallos de parseo en la suite de smoke tests de planificación de herramientas; se exige decodificación restringida por gramática para esa interfaz, y el autor no reclama cero regresiones en salida no restringida.
- La cuantización Q8_0 del backbone no recupera la precisión perdida en el base MLX original de 4 bits, y limita cuantizaciones más agresivas.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor no publica evaluaciones de fiabilidad más allá de los smoke tests.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia apache-2.0 para el modelo, pero los términos y la atribución de Google para Gemma 4 E4B y su conversión MLX siguen aplicándose según `THIRD_PARTY_NOTICES.md`; conviene revisarlos antes de un uso comercial.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/saggamer/orchestrator-v1.5-GGUF
- Modelo base en Hugging Face: https://huggingface.co/saggamer/orchestrator-v1.5
