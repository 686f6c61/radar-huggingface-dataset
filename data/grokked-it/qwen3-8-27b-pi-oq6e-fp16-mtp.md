# grokked-it/Qwen3.8-27B-pi-oQ6e-fp16-mtp

## Resumen

Qwen3.8-27B-pi-oQ6e-fp16-mtp es una cuantización de 6 bits del modelo Qwen3.8-27B, publicada por el usuario grokked-it para su ejecución en Apple Silicon mediante la librería MLX. Sobre los pesos oficiales en BF16 del modelo base se ha fusionado el adaptador LoRA de tipo pi (entrenado con aprendizaje por refuerzo para el agente de programación pi, de earendil-works), y el conjunto resultante se ha cuantizado con oMLX 0.8.0 en el nivel oQ6e. El checkpoint conserva el modelo de lenguaje, el codificador de visión y la cabeza de predicción multi-token (MTP).

El modelo resuelve el problema de desplegar un LLM multimodal de 27.800 millones de parámetros en hardware de Apple con un tamaño de repositorio de 24,8 GB, manteniendo precisión mixta (44 tensores elevados a 8 bits) y una media estimada de 6,87 bits efectivos por peso. Es relevante para desarrolladores que trabajan con MLX y necesitan un modelo orientado a agentes y generación de código con capacidades de imagen-texto en un equipo local.

La licencia es Apache-2.0, heredada del modelo base y del adaptador. No se han publicado resultados de benchmarks sobre este checkpoint cuantizado: el autor solo reporta una prueba de humo (una finalización de código y una llamada a herramienta) en oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con codificador de visión y cabeza MTP; no se detalla la configuración interna |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e de oMLX: 6 bits afines con grupo de tamaño 64, 44 tensores elevados a 8 bits, escalas y sesgos en FP16; imatrix sobre `oqe_code_multilingual` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 24,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con codificador de visión y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa interna. Sobre los pesos oficiales en BF16 se fusionó el adaptador LoRA del repositorio harness-hub/Qwen3.8-27B-pi-adapted (rango 32, alpha 64, aplicado a 256 capas lineales del modelo de lenguaje) mediante la fórmula W' = W + 2·B·A, calculada en float32 y almacenada de nuevo en BF16, shard a shard. El codificador de visión y la cabeza MTP permanecen sin cambios respecto al modelo base.

La cuantización se realizó con oMLX 0.8.0 en nivel oQ6e, con precisión mixta guiada por la sensibilidad de cada capa, matriz de importancia calculada sobre el conjunto de calibración `oqe_code_multilingual` (128 muestras de 512 tokens, adaptativo) y refinamiento específico para código. El adaptador original fue entrenado con aprendizaje por refuerzo para el agente de programación pi; su model card documenta el método y los resultados de benchmark, medidos sobre el modelo sin cuantizar.

## Capacidades

- Generación de texto conversacional multi-turno.
- Generación y finalización de código, con ajuste específico para el agente pi.
- Razonamiento y matemáticas (capacidad heredada del modelo base; sin métricas publicadas en esta ficha).
- Procesamiento de imagen y texto (pipeline image-text-to-text, con codificador de visión incluido).
- Llamadas a herramientas en el formato del modelo base.
- Uso en flujos de agentes y razonamiento multi-paso.
- Decodificación especulativa mediante la cabeza MTP.
- Modo thinking desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`; el autor del adaptador recomienda desactivarlo.
- Capacidades multilingües: no disponible (no se detalla la cobertura de idiomas).

## Casos de uso

- Asistencia de programación en local: el adaptador pi está entrenado con RL para tareas de agente de código, por lo que el modelo puede integrarse en editores o CLIs que requieran finalización y refactorización sin salir del equipo Apple.
- Agentes autónomos con llamadas a herramientas: el formato de tool calls del modelo base permite encadenar acciones (lectura de ficheros, ejecución de comandos, consultas a APIs) en bucles multi-paso.
- Análisis de capturas y diagramas: al incluir codificador de visión, puede recibir imágenes junto a texto, por ejemplo para describir interfaces, extraer texto de capturas o interpretar diagramas técnicos.
- Prototipado rápido en MLX: al estar empaquetado para MLX y ocupar 24,8 GB, permite validar pipelines multimodales en un Mac con memoria unificada suficiente antes de pasar a producción.
- Generación de documentación técnica: con thinking desactivado y temperatura 0,8, el modelo produce respuestas directas adecuadas para resúmenes y descripciones de código.
- Evaluación de adaptadores y cuantizaciones: sirve como referencia para comparar el efecto de la fusión LoRA y la cuantización oQ6e frente al modelo base en tareas de código.
- Automatización de tareas de terminal: su orientación a agentes permite construir asistentes que interpreten salidas de comandos y propongan correcciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ejecutó ningún benchmark sobre este checkpoint cuantizado y que solo superó una prueba de humo en oMLX (una finalización de código y una llamada a herramienta). Los resultados del adaptador pi, medidos sobre el modelo sin cuantizar, figuran en la model card de harness-hub/Qwen3.8-27B-pi-adapted y no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 24,8 GB, por lo que se necesita al menos esa cantidad de memoria unificada más el margen para el contexto y el runtime de MLX; en la práctica, un Mac con 32 GB o más.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (familias M-series Pro, Max y Ultra); no está pensado para GPUs NVIDIA ni CUDA.
- GPU de consumo: no aplica en el sentido habitual; en Apple Silicon cabe en equipos con 32 GB o más de memoria unificada.
- Despliegue: oMLX o cualquier cargador MLX que soporte la arquitectura Qwen3.5. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La cabeza MTP aceptó el 93 % de sus tokens borrador en la prueba de humo (dos peticiones cortas, no una medición).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| grokked-it/Qwen3.8-27B-pi-oQ6e-fp16-mtp | 27,78 mil millones | no disponible | oQ6e (6 bits, 6,87 bits efectivos) | Apache-2.0 | MLX / Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | no disponible | BF16 | Apache-2.0 | Multiplataforma |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,78 mil millones | no disponible | BF16 (adaptador LoRA) | Apache-2.0 | Multiplataforma |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se ha ejecutado ningún benchmark sobre este checkpoint cuantizado; la única validación es una prueba de humo de dos peticiones.
- La cabeza MTP se entrenó contra el backbone original, no contra el adaptado; su tasa de aceptación del 93 % procede de una prueba no representativa.
- La fusión redondea a BF16 antes de cuantizar, lo que introduce una pérdida adicional respecto al adaptador original.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los LLM.
- Cobertura de idiomas y longitud de contexto: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar el fichero LICENSE y las condiciones del modelo base y del adaptador.
- Para producción: al no haber métricas, se recomienda evaluar el modelo en el dominio concreto antes de desplegarlo; el autor sugiere thinking desactivado y temperatura 0,8 con top-p 1,0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grokked-it/Qwen3.8-27B-pi-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador pi: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- oMLX: https://github.com/jundot/omlx
- Agente pi: https://github.com/earendil-works/pi
