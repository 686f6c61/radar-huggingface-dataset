# saggamer/orchestrator-v1.5-GGUF

## Resumen

Orchestrator v1.5 GGUF es una exportación experimental en formato GGUF del modelo agéntico Orchestrator v1.5, desarrollado por el usuario saggamer en el contexto del ecosistema Kira Superapp. Se trata de un modelo de lenguaje de aproximadamente 7.666 millones de parámetros (según los safetensors del repo base) que incorpora una arquitectura de mezcla de expertos (MoE) de baja dimensión sobre un backbone de tipo Gemma 4 E4B. El modelo conserva cinco "bancos de canales" entrenados (control, browser, MCP, coding y presentation) que se seleccionan al cargar el runtime, no por turno.

La relevancia de esta ficha es doble. Por un lado, documenta una propuesta poco habitual: un modelo base compartido con adaptadores de expertos enrutados por capas específicas (capas 39 a 41 del decoder, 16 expertos por capa, 2 activos por token). Por otro, advierte de una restricción crítica: el GGUF solo funciona con un runtime llama.cpp parcheado por el autor ("Kira-patched llama.cpp") y no es compatible con llama.cpp estándar, LM Studio ni Ollama.

El modelo se distribuye bajo licencia Apache 2.0, está etiquetado como experimental y solo declara soporte para inglés. No se han publicado resultados de benchmarks en la información disponible, y el propio autor indica que las verificaciones incluidas son pruebas de conversión y humo funcional, no evaluaciones de capacidad agéntica o de navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Gemma 4 E4B y mezcla de expertos de baja dimensión (MoE) en capas 39-41 del decoder |
| Parametros totales | 7.666.139.690 |
| Parametros activos | 16 expertos por capa en capas 39-41, 2 seleccionados por token (no se especifica el total de parámetros activos) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 4096`) |
| Tipos de cuantizacion | Backbone en GGUF Q8_0; bancos de adaptadores y routers en F32. El base original era MLX affine 4-bit |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con runtime propietario parcheado); base original en MLX |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone Gemma 4 E4B Instruction (modelo de Google) convertido a MLX y posteriormente dequantizado a GGUF Q8_0. Sobre ese backbone se añaden cinco bancos de adaptadores de expertos de baja dimensión (control, browser, MCP, coding y presentation), cada uno con 16 expertos en cada una de las capas 39, 40 y 41 del decoder, de los cuales se seleccionan 2 por token mediante routers con softmax. Los pesos de expertos y routers se conservan en F32 bit a bit respecto al original. El grafo personalizado implementa la FFN compartida más las proyecciones de expertos de baja dimensión, evaluadas en sus posiciones originales antes y después de las no linealidades, no promediadas en un adaptador estático.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor indica explícitamente que cambiar el formato de archivo no aporta nueva formación ni ganancia de capacidad, y que las diferencias numéricas respecto a MLX son posibles por los kernels de codificación y cómputo. La selección de canal se realiza al cargar el runtime (por defecto `control`, modificable con `--override-kv kira.channel=str:browser|mcp|coding|presentation`); el enrutamiento automático de tareas entre canales requiere un controlador anfitrión y no está soportado por el CLI incluido.

## Capacidades

- Generación de texto conversacional en inglés sobre el backbone Gemma 4 E4B.
- Planificación estructurada de herramientas mediante gramática GBNF (`source/kira-tool-plan.gbnf`) para el esquema JSON de ruta/propósito de Kira; la gramática restringe el formato, pero el modelo elige ruta y propósito.
- Cinco bancos de canal entrenados: control, browser, MCP, coding y presentation, seleccionables al cargar el runtime.
- Soporte de decodificación con razonamiento (`--reasoning off` en el ejemplo) y modo de un solo turno (`--single-turn`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No incluye proyectores de visión ni audio: es una exportación solo texto.
- Las capacidades de ejecución de navegador, conexiones MCP, creación de PDF, permisos, memoria y orquestación Diagonal son funciones de la aplicación Kira Superapp, no del GGUF por sí mismo.

## Casos de uso

- Exploración e inspección de arquitecturas MoE enrutadas: el modelo permite examinar cómo se comportan routers y expertos de baja dimensión en capas concretas, gracias a que los pesos F32 se conservan bit a bit y el runtime y el código de evaluación son inspeccionables.
- Planificación de rutas de herramientas en un pipeline agéntico: usando la gramática GBNF se puede forzar la salida JSON de ruta/propósito para que un controlador externo decida qué herramienta invocar; adecuado porque el modelo fue entrenado con el banco de control y el esquema está documentado.
- Integración en la Kira Superapp como backend alternativo de chat local: el modelo encaja en el flujo conversacional de la aplicación, que aporta herramientas, memoria y permisos; útil para probar la pila completa en Apple Silicon con el runtime incluido.
- Pruebas de conversión y validación de formatos: sirve como caso de estudio para verificar la fidelidad de una conversión MLX affine 4-bit a GGUF Q8_0 con adaptadores F32, comparando salidas con el bundle MLX original.
- Desarrollo de asistentes de codificación experimentales: el banco `coding` puede seleccionarse al cargar el runtime para tareas de generación de código en inglés dentro de un entorno controlado; adecuado para prototipos, no para producción sin evaluación adicional.
- Investigación sobre selección de canal y enrutamiento: permite estudiar el efecto de cambiar de banco (`control`, `browser`, `mcp`, `coding`, `presentation`) sobre las mismas entradas, ya que el canal se fija en carga y el comportamiento es reproducible.
- Evaluación de decodificación restringida: útil para medir la tasa de fallos de parseo en salidas greedy frente a salidas con gramática, dado que el autor documenta tres respuestas con dos puntos iniciales en su suite de humo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que `verification.json` contiene comprobaciones de conversión y humo funcional medidas, no puntuaciones de benchmarks agénticos o de navegador, y que no se reclama ninguna ganancia de capacidad por el cambio de formato.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 8,6 GB y el archivo principal es Q8_0, por lo que se necesita aproximadamente ese orden de magnitud de memoria unificada o VRAM; no se dispone de cifras oficiales por cuantización adicional.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime incluido es para macOS ARM64 (Apple Silicon) y fue probado en un Apple M4.
- Compatibilidad con GPU de consumo: no confirmada; el autor solo documenta ejecución en Apple Silicon con su runtime parcheado.
- Opciones de despliegue: únicamente el runtime Kira-patched llama.cpp incluido (`runtime-macos-arm64.tar.gz`) o compilando llama.cpp en el commit exacto de `source/LLAMA_CPP_REVISION` con el parche `source/kira-upcycling.patch`. No es compatible con llama.cpp estándar, LM Studio ni Ollama.
- Requisito de sistema: macOS 27 o superior para el binario incluido; para otras versiones o hardware hay que compilar el código fuente suministrado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orchestrator v1.5 GGUF | 7,67 B (MoE en capas 39-41) | no disponible | Apache 2.0 | GGUF con runtime parcheado | Experimental, solo inglés, cinco bancos de canal |
| Gemma 4 E4B (upstream) | no disponible en la información | no disponible | términos de Google (ver THIRD_PARTY_NOTICES) | MLX y otros | Modelo base instruction citado como componente upstream |
| Orchestrator v1.5 (base MLX) | 7,67 B | no disponible | Apache 2.0 | MLX | Bundle soportado por Kira Superapp; backend de referencia |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El GGUF no funciona con llama.cpp estándar, LM Studio ni Ollama; requiere el runtime parcheado del autor o compilar el parche correspondiente.
- El binario incluido exige macOS 27 o superior y se probó en un Apple M4; no hay soporte documentado para otras plataformas sin compilación manual.
- Es una exportación solo texto: no incluye proyectores de visión ni audio.
- Solo declara soporte de inglés.
- El canal se fija al cargar el runtime; el cambio automático entre canales por turno requiere un controlador anfitrión que no se incluye.
- La decodificación greedy sin restricciones produjo tres respuestas JSON de planificación de herramientas con dos puntos iniciales en la suite de humo; se requiere decodificación restringida con gramática para esa interfaz.
- El backbone se dequantizó desde MLX affine 4-bit a Q8_0, lo que limita cuantizaciones más agresivas y no recupera la precisión perdida en el base original.
- Pueden aparecer diferencias numéricas respecto a MLX por los kernels de codificación y cómputo.
- Las funciones de navegador, MCP, PDF, permisos, memoria y orquestación son de la aplicación Kira Superapp, no del modelo; no se deben atribuir al GGUF.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo experimental sin benchmarks publicados, no hay evidencia de capacidad de nivel frontera.
- Uso comercial: la licencia Apache 2.0 aplica al proyecto, pero los términos y atribuciones de Gemma 4 E4B y su conversión MLX siguen vigentes según `THIRD_PARTY_NOTICES.md`; conviene revisarlos antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saggamer/orchestrator-v1.5-GGUF
- Modelo base: https://huggingface.co/saggamer/orchestrator-v1.5
- Kira Superapp: https://kira-superapp.vercel.app/
- GitHub e instalación: https://github.com/saggamer/KIRA-Superapp
- Código de Diagonal Browser: https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser
