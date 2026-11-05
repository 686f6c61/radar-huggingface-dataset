# singhabhishekkk/apprentice-4b-clinc150

## Resumen

Apprentice 4B, CLINC150 intents es un adaptador LoRA para Qwen3.5-4B (cuantizado a 4 bits en formato MLX) especializado en clasificación de intenciones sobre el conjunto CLINC150. Lo desarrolla el autor independiente singhabhishekkk mediante la herramienta Apprentice, ejecutada en un Mac con Apple Silicon el 4 de noviembre de 2026. El modelo resuelve un problema muy concreto: asignar una de 150 intenciones en dominio a una consulta de usuario en inglés, sin generar texto libre.

La particularidad tecnica es que el repositorio no contiene solo el adaptador LoRA, sino tambien una cabeza logistica (`head_L32.npz`) que lee la intencion directamente del estado oculto del modelo en el ultimo token del prompt, en la capa 32, sin decodificacion autoregresiva. Esto convierte el sistema en un clasificador de baja latencia que aprovecha el conocimiento del modelo base sin pagar el coste de generar tokens.

Es relevante ahora porque demuestra un patron de uso eficiente de modelos generativos como extractores de representaciones para tareas discriminativas: el adaptador genera respuestas con un 93,3% de exactitud, pero la cabeza sobre el estado oculto alcanza el 95,6%, superando tambien al surrogate clasico de TRACER (92,4%) reportado en el paper citado. El modelo base es Qwen3.5-4B, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3.5-4B) + cabeza logistica sobre estado oculto de la capa 32 |
| Parametros totales | No disponible (el adaptador LoRA cubre 16 capas; el modelo base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (OptiQ-4bit de mlx-community) para el modelo base; adaptador en safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (MLX LoRA) y `head_L32.npz` (cabeza logistica NumPy) |

## Arquitectura y entrenamiento

El sistema se compone de dos piezas sobre `mlx-community/Qwen3.5-4B-OptiQ-4bit`. La primera es un adaptador LoRA entrenado sobre 16 capas del transformer, durante dos epocas, con batch 1, learning rate 1e-5 y semilla 42, sobre 20 ejemplos por intencion de CLINC150 en configuracion `plus` (clase fuera de dominio eliminada, 150 intenciones en dominio). La segunda es una cabeza logistica de 150 clases que opera sobre el estado residual final tras la capa 32 en el ultimo token del prompt: se estandariza la representacion con `scaler_mean` y `scaler_scale`, se aplica la matriz `coef` (150 x 2560) mas el `intercept` (150) y se pasa por softmax. No hay decodificacion en este camino.

La cabeza se entreno con 4.500 filas doradas (las 3.000 de fine-tuning mas 1.500 que el ajuste nunca vio), con el hiperparametro C elegido por validacion cruzada de 5 pliegues solo sobre esas filas. El fichero `head_L32.npz` incluye un `adapter_sha256` calculado sobre los dos ficheros del adaptador (ruta relativa ordenada y luego bytes), lo que permite verificar la correspondencia entre cabeza y adaptador. Todo el pipeline es reproducible desde el repositorio `tasks/intent-classification` del benchmark del autor.

## Capacidades

- Clasificacion de intenciones en ingles sobre 150 clases en dominio de CLINC150.
- Clasificacion sin decodificacion mediante la cabeza logistica sobre el estado oculto de la capa 32, con latencia muy inferior a la generacion.
- Generacion de la etiqueta de intencion como texto mediante el adaptador LoRA (93,3% de exactitud en test).
- Estimacion de confianza calibrada: el sistema permite umbralizar y derivar peticiones no cubiertas, con una cota de riesgo selectivo medida.
- Ejecucion local en Apple Silicon mediante MLX.
- No soporta deteccion de fuera de dominio (explicitamente no entrenada ni reclamada).
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso como capacidades entrenadas en este adaptador.

## Casos de uso

- Enrutamiento de consultas en un asistente conversacional: el clasificador asigna cada mensaje del usuario a uno de los 150 intents para dirigirlo al flujo o al backend adecuado, con la cabeza logistica en lugar de generacion para minimizar latencia.
- Triaje con abstención: usando la confianza de la cabeza y la cota de riesgo selectivo al 5%, se derivan a revision humana o a un fallback generico las peticiones de baja confianza, manteniendo un error realizado del 1,2-1,4% entre las respuestas aceptadas.
- Prototipado rapido en local sobre un Mac: al ejecutarse con MLX y pesos de 4 bits, permite iterar sobre un clasificador de intents sin GPU dedicada ni servicio externo.
- Etiquetado asistido de datos: preanotar grandes volumenes de consultas en ingles con las 150 intenciones para su posterior revision, aprovechando el 95,6% de exactitud en test.
- Router de bajo coste en pipelines de atencion al cliente: sustituir llamadas a un LLM generativo por una pasada de forward y una capa lineal cuando la tarea sea solo determinar la intencion.
- Base para fine-tuning sobre dominios propios: el adaptador y la cabeza sirven como punto de partida reproducible (semilla, hiperparametros y script de exportacion documentados) para reentrenar sobre un conjunto de intents especifico de una organizacion.
- Verificacion de integridad en despliegue: el `adapter_sha256` embebido en la cabeza permite comprobar en produccion que adaptador y clasificador se corresponden.

## Benchmarks y rendimiento

Resultados sobre el split publico de test en dominio (4.500 filas, 150 intenciones, exact match):

| Sistema | Exactitud | Ejecutor |
|---|---|---|
| Cabeza sobre este adaptador, sin decodificacion | 95,6 | Apprentice |
| Respuesta generada por este adaptador | 93,3 | Apprentice |
| Surrogate clasico de TRACER (split propio; manejo de fuera de dominio puede diferir) | 92,4 | arXiv 2604.14531 |

Rendimiento con umbralizacion por confianza (cota de riesgo selectivo con objetivo del 5%, medida sobre filas que el umbral nunca vio):

| Metrica | Valor |
|---|---|
| Peticiones retenidas | 89-92% en tres splits |
| Error realizado entre respuestas retenidas | 1,2-1,4% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base se distribuye en 4 bits (OptiQ-4bit), lo que situa su huella en el orden de pocos GB, pero no se detalla la cifra exacta.
- GPU recomendadas: no disponible; el autor documenta ejecucion en un Mac con Apple Silicon mediante MLX, no en GPU NVIDIA.
- Cabeza en consumer GPU: el clasificador es una capa lineal de 150 x 2560 mas estandarizacion, trivial en cualquier hardware; el coste dominante es el forward del modelo base.
- Opciones de despliegue: MLX (libreria declarada en el repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras; la cabeza evita la decodificacion autoregresiva, por lo que una inferencia requiere una unica pasada de forward sobre el prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apprentice 4B, CLINC150 intents | 4B (base) + LoRA + cabeza | No disponible | Clasificacion de intents con cabeza sobre estado oculto | Apache-2.0 | HuggingFace, 0 descargas |
| TRACER (surrogate clasico) | No disponible | No disponible | Clasificacion clasica de intents | No disponible | Paper arXiv 2604.14531 |
| Qwen3.5-4B (base) | 4B | No disponible | LLM generativo generalista | Apache-2.0 | HuggingFace |
| Clasificadores CLINC150 especializados (BERT y similares) | No disponible en esta ficha | No disponible | Fine-tuning supervisado de encoder | No disponible | No disponible |

La comparacion con TRACER no es estrictamente equivalente: el 92,4% procede de un split propio del paper y su tratamiento de fuera de dominio puede diferir, mientras que el 95,6% de Apprentice se mide sobre el split publico en dominio.

## Limitaciones y advertencias

- Solo ingles: el modelo base y el dataset son en ingles; no hay capacidades multilingues entrenadas.
- Sin deteccion de fuera de dominio: el autor elimina la clase OOS de CLINC150 y declara explicitamente que no se entrena ni se reclama. Las consultas ajenas a las 150 intenciones se forzaran a una de ellas.
- Ambito estrecho: es un clasificador de 150 intents de un dataset academico, no un asistente general; no debe usarse para generacion abierta.
- Calibracion dependiente de la distribucion: la cota de riesgo selectivo es "una promesa sobre trafico parecido a las filas de calibracion"; con deriva de dominio el error realizado puede superar el 1,2-1,4% medido.
- Entrenamiento minimo: una familia de modelos, un portatil y dos epocas; no hay validacion en multiples entornos ni estudios de robustez.
- Sesgos: no se documentan analisis de sesgo; al derivar de Qwen3.5-4B y de CLINC150, puede heredar sesgos de ambos.
- Riesgo de alucinacion: bajo en el camino de la cabeza (clasificacion cerrada), pero presente en el camino generativo del adaptador, que puede producir etiquetas fuera del conjunto.
- Licencia: Apache-2.0 permite uso comercial, pero CLINC150 es CC BY 3.0 y requiere atribucion; el autor indica "Built with Qwen (Apache-2.0)".
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia; sin senales de adopcion ni mantenimiento.
- Dependencia de MLX: el adaptador esta en formato MLX, lo que limita su uso directo fuera de Apple Silicon sin conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/singhabhishekkk/apprentice-4b-clinc150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version cuantizada del base: https://huggingface.co/mlx-community/Qwen3.5-4B-OptiQ-4bit
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
- Paper TRACER: https://arxiv.org/abs/2604.14531
- Repositorio de benchmark y tarea de clasificacion de intents: https://github.com/singhabhishekkk/apprentice-benchmark/tree/main/tasks/intent-classification
- Herramienta Apprentice: https://runapprentice.com
