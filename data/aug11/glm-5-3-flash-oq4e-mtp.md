# aug11/GLM-5.3-Flash-oQ4e-mtp

## Resumen

GLM-5.3-Flash-oQ4e-mtp es una cuantizacion mixta en formato MLX del modelo zai-org/GLM-5.3-Flash, un modelo de mezcla de expertos (MoE) nativamente multimodal desarrollado por Zhipu AI (zai-org). El checkpoint original combina 320B parametros totales con 18B parametros activos por token, e integra un codificador de vision y una cabeza de prediccion multi-token (MTP). Esta version, publicada por el usuario aug11, reduce el peso a 4,629 bits por peso de media mediante la herramienta oQ (oMLX v0.7.1), lo que permite ejecutar un modelo de esta escala en hardware Apple Silicon con memoria unificada.

La relevancia de esta ficha radica en que demuestra la viabilidad de cuantizar modelos MoE multimodales de gran tamano preservando el codificador de vision y la cabeza MTP, algo poco habitual en checkpoints cuantizados de esta magnitud. El resultado ocupa 173,157 GiB en disco (185,926 GB de repositorio), con la mayor parte de los pesos en 4 bits afines con grupo de 64, y solo un 2,3% de los pesos en 8 bits y un 0,2% en BF16/FP32 para preservar capas sensibles.

El modelo esta pensado para inferencia en el ecosistema MLX (Apple), con pipeline image-text-to-text, y se distribuye bajo licencia MIT, lo que facilita su uso comercial. No obstante, la informacion publicada por el autor es exclusivamente tecnica sobre la cuantizacion; no se aportan datos de entrenamiento, benchmarks ni evaluaciones de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal con atencion dispersa y lineal, y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 321.323.031.390 (321,323B) |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e mixta: affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit, BF16 y FP32; media efectiva 4,629 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), cuantizacion mixta |
| Tamano del repositorio | 185,926 GB (173,157 GiB) |
| Componentes incluidos | Backbone de lenguaje (313,327B), codificador de vision (0,564B), cabeza MTP (7,433B) |
| Libreria | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE nativamente multimodal con 320B parametros totales y 18B activos. Segun la model card del checkpoint cuantizado, combina atencion dispersa y atencion lineal, e incorpora Manifold-Constrained Hyper-Connections (mHC), una innovacion arquitectonica que el autor menciona pero no detalla. Incluye tres componentes diferenciados: el backbone de lenguaje, un codificador de vision de 0,564B parametros y una cabeza de prediccion multi-token (MTP) de 7,433B parametros, que habilita decodificacion especulativa o prediccion de varios tokens por paso.

Sobre el entrenamiento del modelo original no se proporciona informacion en la documentacion disponible: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. La cuantizacion oQ4e, aplicada con oMLX v0.7.1, asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y reajusta escala y sesgo mediante minimos cuadrados ponderados. La distribucion resultante concentra el 96,991% de los pesos logicos en 4 bits afines (grupo 64), el 2,346% en 8 bits y el 0,189% en BF16, con un 0,027% en FP32.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline conversational).
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text), gracias al codificador de vision incluido.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, aunque no se documentan evaluaciones especificas.
- Prediccion multi-token (MTP): la cabeza incluida permite decodificacion especulativa para acelerar la generacion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas figura como no disponible.
- Modo thinking, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX permite ejecutar un MoE de 320B en equipos con memoria unificada amplia (Mac Studio con 192 GB o superior), usando la libreria mlx y el formato cuantizado de 4,629 bits/peso.
- Prototipado de asistentes multimodales: al incluir codificador de vision, se puede construir un asistente que reciba imagenes y texto y responda en conversacion, con el pipeline image-text-to-text ya definido.
- Investigacion sobre cuantizacion mixta: el checkpoint sirve como referencia reproducible para estudiar el impacto de la asignacion de bits por sensibilidad (oQ4e) en un MoE multimodal de gran escala.
- Evaluacion de decodificacion especulativa: la cabeza MTP incluida permite medir ganancias de throughput con prediccion multi-token frente a decodificacion autoregresiva estandar.
- Despliegue de bajo coste energetico en estaciones de trabajo Apple: el formato MLX y la cuantizacion reducen el peso a 173 GiB, facilitando su ejecucion en hardware de consumo profesional frente al modelo original en BF16.
- Fine-tuning o adaptacion posterior (LoRA/QLoRA) sobre el checkpoint cuantizado: util para equipos que quieran especializar el modelo en dominios concretos sin partir del modelo completo en precision alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint cuantizado solo documenta la distribucion de bits y el desglose de almacenamiento, sin metricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 173,157 GiB en disco; para inferencia en MLX se necesita memoria unificada al menos equivalente, mas overhead de activaciones y cache KV (no cuantificado en la informacion disponible).
- GPU recomendadas: hardware Apple Silicon con memoria unificada de 192 GB o superior (por ejemplo, Mac Studio M2 Ultra o M3 Ultra con 192 GB). No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: no en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.); requiere memoria unificada de gama alta en Apple Silicon.
- Opciones de despliegue: libreria mlx (formato nativo del checkpoint). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ4e-mtp (este) | 321,323B | 18B | no disponible | MIT | MLX safetensors cuantizado |
| zai-org/GLM-5.3-Flash (base) | ~320B | 18B | no disponible | MIT | safetensors (precision original) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (MoE multimodal de ~320B) en la documentacion proporcionada, por lo que la comparativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- La cuantizacion a 4,629 bits/peso puede introducir degradacion de calidad respecto al modelo base; no se aportan evaluaciones que cuantifiquen esa perdida.
- No se documentan sesgos conocidos del modelo base ni del checkpoint cuantizado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingue concreto.
- Longitud de contexto no disponible: limita la planificacion de casos de uso con ventanas largas.
- Restricciones de licencia: MIT permite uso comercial, pero conviene verificar el fichero LICENSE del repositorio y las condiciones del modelo base.
- Compatibilidad limitada: el formato MLX solo es utilizable en el ecosistema Apple; no hay pesos GGUF ni safetensors estandar para CUDA.
- El modelo tiene solo 69 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- La cabeza MTP y el codificador de vision estan incluidos, pero no se documenta como usarlos en inferencia ni su impacto en latencia.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/aug11/GLM-5.3-Flash-oQ4e-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- PR de cuantizacion oQe mejorada: https://github.com/jundot/omlx/pull/4385
