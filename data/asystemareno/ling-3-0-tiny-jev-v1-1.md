# AsystemAReno/Ling-3.0-tiny-JEV-v1.1

## Resumen

Ling-3.0-tiny-JEV-v1.1 es un adaptador LoRA de rango 16 publicado por el usuario AsystemAReno sobre el modelo base inclusionAI/Ling-3.0-tiny, un modelo de mezcla de expertos (MoE) con 7.900 millones de parametros totales y aproximadamente 1.300 millones activados por token. El adaptador se ha entrenado con la herramienta AReno para tareas de decision JEV (JevBench), un formato de evaluacion que plantea preguntas de tipo eleccion multiple, si/no y puntuacion sobre un estado o contexto dado.

El interes del adaptador reside en su enfoque: en lugar de generar texto libre, reutiliza la cabeza de lenguaje original del modelo base para puntuar los tokens correspondientes a las etiquetas candidatas, aplicando atencion bidireccional en las capas de atencion completa. El objetivo de entrenamiento combina entropia cruzada de profesor, supervision Brier y una recompensa diferenciable inspirada en las reglas de decision de JevBench. Es, por tanto, un modelo de decision mas que un modelo conversacional.

La relevancia actual es limitada pero especifica: se trata de un artefacto experimental de un autor individual, sin descargas ni validacion externa, orientado a un benchmark concreto (JevBench) y a un stack de servicio propio (AReno). No debe confundirse con un modelo de proposito general ni con un lanzamiento oficial de InclusionAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre transformer MoE; atencion bidireccional en capas de atencion completa |
| Parametros totales | 7,9B en el modelo base; el adaptador LoRA es de rango 16 (numero de parametros del adaptador no disponible) |
| Parametros activos | ~1,3B por token (modelo base MoE) |
| Longitud de contexto | 4096 tokens (segun `label_jev_config.json`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json`; requiere los pesos base por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre inclusionAI/Ling-3.0-tiny, un modelo de mezcla de expertos con 7,9B parametros totales y unos 1,3B activos por token. La innovacion del adaptador es el modo de atencion: las capas de atencion completa operan de forma bidireccional, lo que permite al modelo considerar el contexto completo del estado y las preguntas al puntuar etiquetas, en lugar de generar secuencialmente como en un decoder causal estandar. El adaptador tiene rango 16 y se sirve mediante AReno con soporte de LM-label JEV.

El entrenamiento combina tres senales: entropia cruzada de profesor sobre los tokens de etiqueta, supervision Brier (calibracion de probabilidades) y una recompensa diferenciable inspirada en las reglas de decision de JevBench. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO convencional; el esquema descrito es una forma de ajuste supervisado con recompensa diferenciable, no un pipeline RLHF clasico.

## Capacidades

- Resolucion de preguntas de tipo `choice` (eleccion multiple entre etiquetas candidatas).
- Preguntas `noul` (si/no) mediante puntuacion de tokens de etiqueta.
- Preguntas de tipo `score` (puntuacion).
- Puntuacion calibrada de etiquetas reutilizando la cabeza de lenguaje del modelo base.
- Modo de atencion bidireccional sobre el contexto de estado y preguntas.
- Servicio via API HTTP (`POST /v1/systemone`) con AReno, en backend CUDA o MLX.
- No se documentan capacidades de generacion libre, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Toma de decisiones acotadas con etiquetas predefinidas: el adaptador puntua opciones discretas (por ejemplo, horas de salida, categorias) sobre un estado textual, adecuado cuando el conjunto de respuestas es finito y conocido de antemano.
- Clasificacion binaria con calibracion: las preguntas `noul` permiten obtener probabilidades calibradas (supervision Brier) para decisiones si/no en pipelines de triaje.
- Evaluacion de agentes en entornos tipo JevBench: util para reproducir o comparar resultados en el benchmark JevBench con el protocolo de etiquetas documentado.
- Prototipado de modelos de decision sobre Apple Silicon: el backend MLX de AReno permite ejecutar el adaptador en equipos con chip Apple sin GPU dedicada.
- Experimentacion con atencion bidireccional en modelos MoE: sirve como referencia para investigar el efecto de la atencion bidireccional en tareas de puntuacion de etiquetas.
- Integracion en un servicio interno de decision: el endpoint `/v1/systemone` acepta estado y preguntas tipadas, lo que facilita encapsular la logica de decision en un microservicio.
- Comparacion de calibracion entre modelos de 7-8B: los resultados locales de JevBench permiten situar el adaptador frente a otros modelos del mismo rango de parametros.

## Benchmarks y rendimiento

Resultados locales declarados por el autor sobre las 231 preguntas publicas de JevBench, con atencion completa bidireccional y temperatura 1:

| Metrica | Valor |
|---|---|
| Accuracy | 77,06% (178/231) |
| Intelligence | 46,69 |
| Calibration | 75,78 |
| Capability | 61,24 |

El autor indica que Ling 3.0 Tiny obtiene el mayor valor de Capability entre los modelos de 7B a menos de 9B mostrados en su comparativa, pero que Benchmark Heaven no le ha asignado ranking. El resto de puntuaciones y rankings de la comparativa proceden de la instantanea del 20 de noviembre de 2026 de Benchmark Heaven; los valores concretos de los modelos comparados no se incluyen en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base tiene 7,9B parametros totales, por lo que en FP16 requeriria del orden de 16 GB solo para pesos, mas overhead de atencion y del adaptador. Cifras exactas no publicadas.
- GPU recomendadas: no disponibles; el autor solo indica soporte de backend CUDA y MLX.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del base (7,9B) es plausible en GPUs de 24 GB en cuantizacion, pero no hay datos publicados que lo confirmen.
- Despliegue: exclusivamente mediante AReno (`areno serve --sgl-jev --bi-attn --backend cuda|mlx`), con `--model-path` apuntando a los pesos base y `--lora-adapter-path` al directorio del adaptador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-tiny-JEV-v1.1 | 7,9B (base) + LoRA r16 | ~1,3B | 4096 | no disponible | Hugging Face, 0 descargas |
| inclusionAI/Ling-3.0-tiny | 7,9B | ~1,3B | no disponible | no disponible | Hugging Face (base) |
| Otros modelos 7-8B de JevBench | 7B a <9B | no disponible | no disponible | no disponible | segun Benchmark Heaven |

El autor afirma que Ling 3.0 Tiny lidera en Capability entre los modelos de 7-8B de su comparativa, pero no se aportan los valores de los competidores ni sus nombres en la informacion disponible. No se dispone de comparaciones con alternativas de la misma categoria fuera de JevBench.

## Limitaciones y advertencias

- Modelo de decision, no de proposito general: no genera texto libre ni se documentan capacidades conversacionales, de codigo o de razonamiento abierto.
- Dependencia total de AReno: requiere una build con soporte de LM-label JEV y atencion bidireccional; no funciona con stacks de inferencia estandar.
- Requiere descargar por separado los pesos base de inclusionAI/Ling-3.0-tiny; el repositorio solo contiene el adaptador.
- Contexto limitado a 4096 tokens, lo que restringe estados y preguntas largas.
- Resultados de benchmark locales y autodeclarados, sin ranking externo en Benchmark Heaven y sin validacion independiente.
- Cero descargas y cero likes en el momento de la ficha: sin evidencia de uso en produccion.
- Licencia no especificada: no se puede confirmar el uso comercial ni las obligaciones de atribucion; verificar la licencia del modelo base antes de cualquier despliegue.
- Riesgo de sobreajuste al formato JevBench y a las reglas de decision concretas del benchmark.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue.
- Sin datos de sesgos, alucinacion o robustez fuera del benchmark.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AsystemAReno/Ling-3.0-tiny-JEV-v1.1
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Benchmark Heaven (JevBench): https://benchmarkheaven.com/jev-models
