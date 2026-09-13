# metaevo-ai/ahd-9b-appworld

## Resumen

ahd-9b-appworld es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, publicado por el usuario metaevo-ai en HuggingFace. Se trata de un modelo de lenguaje de tipo causal con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones), distribuido en pesos safetensors con un tamaño de repositorio de 20,1 GB, lo que es coherente con un almacenamiento en bfloat16. La licencia declarada es Apache-2.0 y el modelo se presenta como un fine-tune completo del checkpoint base, no como un modelo entrenado desde cero.

El problema concreto que resuelve no está documentado en la model card. El identificador incluye el sufijo "appworld", que sugiere un ajuste orientado a tareas de agente sobre entornos de aplicaciones, aunque el autor no especifica el conjunto de datos, el procedimiento ni el objetivo de entrenamiento. La relevancia de esta ficha es, por tanto, limitada: el modelo se publicó el 12 de septiembre de 2026 y en el momento de la consulta acumula 0 descargas y 0 "likes", sin benchmarks publicados ni documentación técnica más allá de un ejemplo de uso con transformers y un comando de despliegue con vLLM.

El dato más informativo de la model card es el comando de vLLM, que activa el tool calling (`--enable-auto-tool-choice --tool-call-parser qwen3_xml`) y fija `--max-model-len 65536`. Esto indica que el modelo está preparado para function calling con el parser XML de la familia Qwen3 y que se espera desplegarlo con una ventana de 65.536 tokens, si bien el autor no confirma que esa sea la longitud de contexto nativa del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal; el tag `qwen3_5` indica la familia arquitectónica del config de transformers. No se detallan capas, cabezas ni tipo de atención |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | 65.536 tokens según el comando de despliegue de vLLM de la model card; no confirmado explícitamente como contexto nativo |
| Tipos de cuantizacion | No disponible. Los pesos publicados están en safetensors (precisión completa, bfloat16 presumiblemente); no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño de repositorio: 20,1 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo único verificable es que se trata de un fine-tune de Qwen/Qwen3.5-9B, un transformer causal de la familia Qwen3.5, y que el repositorio incluye el tag de arquitectura `qwen3_5`, empleado por transformers para instanciar la clase de modelo correspondiente. Con 9,65 mil millones de parámetros en bfloat16, el peso teórico de los pesos ronda los 19,3 GB, cifra consistente con los 20,1 GB que ocupa el repositorio (el resto corresponde a tokenizer, configuraciones y metadatos).

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO, SFT supervisado u otro procedimiento, ni sobre innovaciones técnicas como decodificación especulativa, atención lineal o híbrida. El sufijo "appworld" del identificador apunta a un ajuste sobre tareas de agente tipo AppWorld (interacción multi-paso con APIs de aplicaciones), pero esto es una inferencia a partir del nombre y no está confirmado en la documentación. Tampoco se documenta qué significa el prefijo "ahd".

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base Qwen3.5-9B.
- Soporte de tool calling / function calling: el comando de vLLM de la model card activa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_xml`, lo que implica que el modelo emite llamadas a herramientas en el formato XML de la familia Qwen3.
- Uso en agentes: el parser de tool calling y el sufijo "appworld" apuntan a un ajuste orientado a flujos de agente multi-paso, aunque no se documenta el alcance real de esta capacidad.
- Ventana de contexto larga: el despliegue de referencia configura 65.536 tokens, lo que permite manejar historiales extensos de conversación o de acciones de agente.
- Capacidades multilingües: no disponibles. El modelo base Qwen suele ser multilingüe, pero no se declara ningún listado de idiomas para este fine-tune.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El repositorio no declara ningún pipeline ni modalidad adicional.

## Casos de uso

- Agentes que operan sobre APIs de aplicaciones: el modelo puede emitir llamadas a funciones en formato XML Qwen3 y encadenar varios pasos dentro de un bucle de agente. Es el caso de uso que sugiere el identificador del repositorio, aunque no hay evaluaciones publicadas que lo respalden.
- Automatización de tareas con historial largo: con una ventana configurada de 65.536 tokens, permite mantener en contexto el estado completo de una sesión de agente (resultados de herramientas, errores previos, plan) sin truncar.
- Asistente conversacional multi-turno autoalojado: al ser Apache-2.0 y de 9,65B, se puede desplegar en infraestructura propia sin dependencia de APIs externas ni coste por token.
- Generación de código asistida por herramientas: el soporte de function calling permite integrarlo en flujos donde el modelo consulta linters, ejecutores de tests o APIs de repositorios antes de devolver código.
- Extracción estructurada de datos: se puede guiar al modelo para que devuelva llamadas a funciones con argumentos tipados, útil para poblar bases de datos a partir de texto no estructurado.
- Base para ajustes específicos de dominio: al ser un fine-tune Apache-2.0 y de tamaño medio, sirve como punto de partida para nuevos ajustes con LoRA o QLoRA sobre datos propios.
- Investigación sobre ajuste fino para agentes: útil para reproducir o comparar recetas de fine-tuning sobre Qwen3.5-9B, siempre que se validen con benchmarks propios, dado que no hay resultados publicados.
- Procesamiento por lotes en servidor: vLLM permite servir el modelo con batching continuo para tareas de generación a gran escala, siempre que la VRAM disponible lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench, ni de benchmarks de agentes como AppWorld, SWE-bench o WebArena. Tampoco hay comparaciones con el modelo base Qwen/Qwen3.5-9B que permitan cuantificar el efecto del ajuste fino. Cualquier afirmación sobre el rendimiento de este modelo carecería de respaldo empírico.

## Requisitos de hardware

- VRAM para inferencia en bfloat16/fp16: aproximadamente 19,3 GB solo para los pesos, más la caché KV. Con contexto largo (decenas de miles de tokens) el consumo puede superar los 24 GB. Cálculo estimado a partir del número de parámetros; no publicado por el autor.
- VRAM con cuantización de 8 bits: del orden de 10-11 GB para los pesos, más caché KV.
- VRAM con cuantización de 4 bits: del orden de 5,5-7 GB para los pesos, más caché KV. Requiere generar previamente una variante GGUF, GPTQ o AWQ, ya que el repositorio solo publica safetensors.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten servir el modelo en bfloat16 con contexto amplio y batching.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede cargar los pesos en bfloat16, pero con margen muy ajustado para contextos largos; una RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) requiere cuantización a 8 o 4 bits. Tarjetas de 8 GB no son viables sin cuantización agresiva y reducción de contexto.
- Memoria unificada: equipos Apple Silicon con 32 GB o más pueden ejecutar el modelo en formato MLX o GGUF cuantizado, no con los pesos safetensors originales.
- Opciones de despliegue: vLLM es la ruta documentada por el autor, con `--enable-auto-tool-choice --tool-call-parser qwen3_xml --max-model-len 65536`. También es posible cargarlo con transformers (`AutoModelForCausalLM` con `dtype="bfloat16"` y `device_map="auto"`). Para llama.cpp, Ollama o TGI sería necesario convertir los pesos, algo que no se proporciona.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, latencia de primer token ni rendimiento bajo batching.

## Comparativa con modelos similares

La comparación es exclusivamente de especificaciones, ya que no existen benchmarks publicados de ahd-9b-appworld que permitan comparar rendimiento real.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| metaevo-ai/ahd-9b-appworld | 9,65B | 65.536 tokens (configuración de despliegue, no confirmada como nativa) | Apache-2.0 | HuggingFace, safetensors (20,1 GB) |
| Qwen/Qwen3.5-9B (modelo base) | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace |
| Qwen2.5-7B | ~7,6B | 128K tokens | Apache-2.0 | HuggingFace |
| Llama-3.1-8B | ~8,0B | 128K tokens | Llama 3.1 Community License | HuggingFace |
| Gemma-2-9B | ~9,2B | 8K tokens | Gemma Terms of Use | HuggingFace |

Nota: los datos de Qwen2.5-7B, Llama-3.1-8B y Gemma-2-9B proceden de su documentación pública y se incluyen únicamente como referencia de categoría (modelos densos de 7-9B parámetros). No implican ninguna comparación de calidad con ahd-9b-appworld, para el que no hay métricas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: la model card no describe datos de entrenamiento, hiperparámetros, composición del dataset ni metodología, lo que impide auditar sesgos o evaluar la idoneidad para un dominio concreto.
- Sin benchmarks publicados: no hay ninguna evidencia empírica de que el fine-tune mejore a su modelo base en tareas de agente o en cualquier otra tarea. El ajuste podría incluso degradar capacidades generales por sobreajuste al dominio de destino.
- Riesgo de alucinación: no cuantificado. Al no haber evaluaciones, se desconoce la tasa de fabricación de contenido, especialmente crítica en flujos de agente donde el modelo invoca herramientas con argumentos.
- Sesgos conocidos: no disponibles. Sin información sobre la composición del corpus de ajuste no es posible anticipar sesgos de género, idioma, cultura o dominio.
- Limitaciones de idioma: no se declara ningún idioma soportado. Aunque el modelo base Qwen suele tener cobertura multilingüe, no hay confirmación para este fine-tune, y el ajuste sobre datos de una tarea concreta puede haber reducido el rendimiento en idiomas distintos del inglés.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución sin royalties, pero conviene verificar que la licencia del modelo base Qwen3.5-9B sea compatible y que el fine-tune herede las mismas condiciones. La model card no incluye avisos adicionales.
- Formato único: solo se distribuyen pesos safetensors. No hay cuantizaciones GGUF, GPTQ ni AWQ, lo que obliga a convertir si se quiere desplegar en hardware de consumo o con llama.cpp/Ollama.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar experiencias de otros usuarios.
- Fecha de publicación: los metadatos indican creación y última actualización el 12 de septiembre de 2026. Un repositorio con una única revisión y sin actividad posterior sugiere que no ha recibido mantenimiento.
- Caveat de producción: con esta información, el modelo no debería desplegarse en entornos críticos sin una evaluación propia previa sobre el caso de uso objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/metaevo-ai/ahd-9b-appworld
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de vLLM (referencia para las opciones `--enable-auto-tool-choice`, `--tool-call-parser` y `--max-model-len` usadas en la model card): https://docs.vllm.ai
- Búsqueda web: no se han encontrado resultados relevantes. Los únicos enlaces devueltos por la búsqueda apuntan a transfermarkt.de (foros y fichas de fútbol) y no guardan ninguna relación con el modelo.
