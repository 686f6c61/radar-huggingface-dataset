# CharyZeng/MiniMax-M3-4layer

## Resumen

MiniMax-M3-4layer es una variante reducida del modelo multimodal MiniMax-M3, publicado por el usuario CharyZeng en Hugging Face. Se trata de una versión truncada a 4 capas del modelo original MiniMax-M3 de MiniMaxAI, un modelo multimodal nativo de arquitectura MoE con aproximadamente 428B de parámetros totales y ~23B activados en el modelo completo. Esta variante conserva 18.823.012.608 parámetros según los metadatos de safetensors, lo que la convierte en una versión experimental significativamente más pequeña, posiblemente destinada a pruebas, depuración o estudio de la arquitectura.

El problema que aborda la familia MiniMax-M3 es la eficiencia en contextos de un millón de tokens mediante MiniMax Sparse Attention (MSA), un operador de atención dispersa que reduce drásticamente el cómputo de atención frente a GQA. El modelo original ofrece aceleraciones de 9x en prefill y 15x en decode respecto a M2 a 1M de contexto. Es relevante ahora porque combina multimodalidad nativa (texto, imagen y vídeo) con rendimiento de nivel frontera en benchmarks agénticos de código y colaboración.

Debe advertirse que esta ficha describe la variante de 4 capas del repositorio CharyZeng/MiniMax-M3-4layer, no el modelo oficial MiniMaxAI/MiniMax-M3. La variante no tiene model card propia y hereda la documentación del modelo original, por lo que muchas especificaciones concretas de esta versión truncada no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal nativo (minimax_m3_vl), variante truncada a 4 capas |
| Parametros totales | 18.823.012.608 (~18,8B, en esta variante) |
| Parametros activos | no disponible (en el modelo completo M3: ~23B de ~428B) |
| Longitud de contexto | no disponible (el modelo completo M3: 1M tokens) |
| Tipos de cuantizacion | no disponible (el modelo completo soporta MXFP4/MXFP8 via ATOM/ROCm) |
| Idiomas soportados | no disponible |
| Licencia | other (minimax-community) |
| Formato de pesos | safetensors (37,7 GB de tamano de repo) |

## Arquitectura y entrenamiento

La familia MiniMax-M3 emplea una arquitectura transformer de mezcla de expertos (MoE) con multimodalidad nativa: el modelo se entrena desde el primer paso con datos mixtos de texto, imagen y vídeo, lo que permite una fusion semantica mas profunda que los enfoques de adaptador posterior. La innovacion tecnica central es MiniMax Sparse Attention (MSA), un operador de atencion dispersa disenado para contextos de un millon de tokens que reduce el computo por token a 1/20 frente a M2, con aceleraciones de 9x en prefill y 15x en decode a 1M de contexto.

Esta variante concreta reduce el modelo a 4 capas, con lo que conserva 18,8B de parametros totales. No hay informacion sobre el proceso de destilacion o truncado empleado, ni sobre si los pesos provienen del modelo original sin reentrenamiento. Los detalles del entrenamiento del modelo completo (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada; el detalle tecnico esta en el informe arXiv:2606.13392.

## Capacidades

- Comprension y generacion multimodal: procesamiento de texto, imagen y video (pipeline image-text-to-text), segun las capacidades de la familia M3.
- Generacion de codigo: la familia M3 esta optimizada para tareas de programacion y benchmarks agenticos de largo horizonte.
- Capacidades agenticas: etiquetada para agentes y razonamiento multi-paso (cowork).
- Tres modos de razonamiento mediante el parametro `thinking`: `enabled` (razonamiento siempre activo), `adaptive` (el modelo decide cuando razonar) y `disabled` (minimiza latencia y maximiza throughput).
- Soporte conversacional (tag conversational).
- Nota importante: al tratarse de una version truncada a 4 capas, es probable que el rendimiento real en estas capacidades este muy degradado respecto al modelo completo; no hay evaluaciones publicadas de esta variante.

## Casos de uso

- Investigacion de arquitectura MoE: al conservar solo 4 capas y 18,8B de parametros, permite estudiar la estructura interna de M3 (routing de expertos, MSA) en hardware accesible sin cargar los 428B del modelo completo.
- Depuracion y desarrollo de infraestructura de inferencia: util para probar integraciones con SGLang, vLLM o Transformers sobre la clase de modelo minimax_m3_vl antes de desplegar el modelo completo.
- Prototipado de pipelines multimodales: permite validar el formato de entrada de imagen/video y los esquemas de prompt del modelo con un coste de memoria muy inferior.
- Analisis de pesos y mecanica de atencion dispersa: el tamano reducido facilita inspeccionar los patrones de MSA y la distribucion de activaciones por capa.
- Evaluacion comparativa de truncado: sirve como sujeto de estudio para medir cuanto rendimiento se pierde al eliminar capas en modelos MoE grandes.
- Generacion de datos sinteticos de calibracion: puede emplearse para probar cuantizacion (MXFP4/MXFP8) y perfiles de memoria antes de aplicarla al modelo completo.

No se recomienda su uso en produccion para tareas de lenguaje o vision: no hay evidencia de que una version de 4 capas mantenga capacidades utiles de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante de 4 capas. El modelo completo MiniMax-M3 se describe como de "nivel frontera" en benchmarks agenticos de largo horizonte (coding y cowork), pero no se incluyen cifras concretas en la model card, solo una figura de benchmark sin datos numericos extraibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 18,8B de parametros en safetensors (37,7 GB de repo, presumiblemente BF16), se necesitan alrededor de 38-40 GB solo para los pesos; cabe en una A100/H100 de 40-80 GB o en 2x RTX 4090 (48 GB totales) con offloading. Con cuantizacion a 4 bits cabria en una sola RTX 4090 (~12-14 GB), aunque no hay cuantizaciones publicadas para esta variante.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, o combinaciones de GPUs consumer (2x RTX 3090/4090) con KTransformers o unsloth para offloading a CPU.
- Consumer GPU: no cabe en una sola GPU de 24 GB en precision completa; si con cuantizacion agresiva no disponible oficialmente para esta variante.
- Opciones de despliegue: Transformers (soporte nativo de minimax_m3_vl), vLLM, SGLang, KTransformers, unsloth y ATOM (ROCm, MXFP4/MXFP8) para la familia M3; esta variante al ser custom_code puede requerir adaptaciones.
- Latencia y throughput: no disponibles para esta variante. Para referencia, el modelo completo M3 reduce el computo por token a 1/20 frente a M2 a 1M de contexto.
- Parametros de inferencia recomendados (familia M3): `temperature=1.0`, `top_p=0.95`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| MiniMax-M3-4layer (esta variante) | ~18,8B | no disponible | no disponible | Si (por herencia) | minimax-community |
| MiniMax-M3 (completo) | ~428B | ~23B | 1M | Si, nativa | minimax-community |
| Qwen3-VL-30B-A3B | ~30B | ~3B | no disponible | Si | Apache 2.0 |
| Llama 4 Scout | ~109B | ~17B | 10M | Si, nativa | Llama 4 Community |

La comparativa se ofrece a titulo orientativo para la familia de modelos MoE multimodales; esta variante de 4 capas no compite en rendimiento con ninguno de ellos y su valor es experimental.

## Limitaciones y advertencias

- Variante no oficial: el repositorio es de un tercero (CharyZeng), no de MiniMaxAI. Con 0 descargas y 0 likes, no hay validacion comunitaria ni evidencia de que funcione correctamente.
- Truncado a 4 capas: el rendimiento en lenguaje, codigo y multimodalidad esta presumiblemente muy degradado; no usar en produccion.
- Model card heredada: la documentacion corresponde al modelo completo M3; muchas especificaciones de esta variante (contexto, cuantizacion, idiomas) son desconocidas.
- Licencia minimax-community (other): requiere revisar el archivo LICENSE para conocer las condiciones exactas de uso comercial; no es una licencia permisiva estandar.
- Custom code: el modelo requiere codigo personalizado de transformers, lo que introduce riesgo de ejecucion de codigo arbitrario al confiar en repositorios remotos.
- Alucinaciones y sesgos: al igual que cualquier LLM, el modelo puede generar contenido incorrecto o sesgado; no hay evaluaciones de sesgo publicadas para esta variante.
- Los datos de entrenamiento del modelo completo no estan detallados en la informacion disponible, por lo que no puede evaluarse la composicion del corpus ni posibles contaminaciones de benchmarks.

## Enlaces

- Repositorio de la variante: https://huggingface.co/CharyZeng/MiniMax-M3-4layer
- Modelo oficial MiniMax-M3: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Organizacion MiniMaxAI en Hugging Face: https://huggingface.co/MiniMaxAI
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.13392
- Paper en Hugging Face: https://huggingface.co/papers/2606.13392
- GitHub de MiniMax-M3: https://github.com/MiniMax-AI/MiniMax-M3
- GitHub de MiniMax Sparse Attention (MSA): https://github.com/MiniMax-AI/MSA
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/LICENSE
- MiniMax Code: https://agent.minimax.io/
- API de MiniMax: https://platform.minimax.io/
- Documentacion Transformers (minimax_m3_vl): https://huggingface.co/docs/transformers/model_doc/minimax_m3_vl
- Recetas vLLM: https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3
- Cookbook SGLang: https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3
- Tutorial KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/MiniMax-M3-Tutorial.md
- Tutorial unsloth: https://unsloth.ai/docs/models/minimax-m3
- Guia ATOM (MXFP4/MXFP8): https://github.com/ROCm/ATOM/blob/main/recipes/MiniMax-M3.md
- MiniMax en ModelScope: https://modelscope.cn/organization/minimax
