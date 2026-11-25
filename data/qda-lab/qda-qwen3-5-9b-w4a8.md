# qda-lab/QDA-Qwen3.5-9B-W4A8

## Resumen

QDA-Qwen3.5-9B-W4A8 es una version cuantizada del modelo multimodal Qwen/Qwen3.5-9B, desarrollada por el laboratorio qda-lab. Se trata de una cuantizacion W4A8: pesos en enteros de 4 bits agrupados de 128 en 128 y activaciones en coma flotante de 8 bits (FP8) dinamicas. El resultado reduce el peso del modelo de 19,3 GB en BF16 a 9,0 GB, un factor de 2,1x, conservando segun el autor el 98,0% de la precision del modelo original.

El modelo base es un transformer de 9.653.104.368 parametros (aproximadamente 9,65 mil millones) con capacidad de procesamiento de imagen y texto (pipeline image-text-to-text), lo que lo situa en la categoria de modelos multimodales de talla media. La cuantizacion se realizo con GPTQ sobre una copia rotada con transformada de Hadamard, con la rotacion plegada en los pesos para evitar transformaciones en tiempo de ejecucion, y los escalares de grupo se ajustaron por destilacion.

Su relevancia practica es doble: por un lado, demuestra que la cuantizacion agresiva de pesos a 4 bits con activaciones FP8 puede mantener el rendimiento en tareas de razonamiento, matematicas y codigo con una perdida media de solo 1,5 puntos; por otro, reduce los requisitos de memoria de un modelo de casi 10 mil millones de parametros a un umbral que permite desplegarlo en una sola GPU de 80 GB con margen amplio. La contrapartida es una restriccion de hardware estricta: el kernel W4A8 de vLLM exige GPUs NVIDIA Hopper (sm90), es decir, H100 o H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), modelo base Qwen3.5 |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8: pesos INT4 en grupos de 128, activaciones FP8 dinamicas; GPTQ con rotacion Hadamard plegada; escalares de grupo ajustados por destilacion |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B original, un transformer multimodal capaz de procesar entradas de imagen y texto y generar texto. La model card no detalla la composicion del dataset de preentrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO en el modelo base; esa informacion corresponde a la documentacion de Qwen/Qwen3.5-9B y no se reproduce aqui.

La innovacion tecnica de esta version reside en el pipeline de cuantizacion. Los pesos se cuantizan a INT4 con GPTQ sobre una copia del modelo a la que se aplica una transformada de Hadamard; la rotacion se pliega en los propios pesos, de modo que en inferencia no hay coste adicional de transformacion. Las activaciones se cuantizan a FP8 de forma dinamica. Posteriormente, los escalares de grupo se afinan mediante destilacion (paso `scale_kd`, 120 rondas de unos 90 segundos cada una) sobre una H100 de 80 GB. El proceso completo se selecciono mediante busqueda automatizada del framework QDA, descrito en el paper arXiv:2611.23388. La reproducibilidad esta documentada: una reconstruccion desde la receta produce pesos no identicos bit a bit, con una divergencia KL de 0,01399 frente al original (un +0,04% respecto al checkpoint publicado).

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento matematico avanzado: evaluado en AIME 2025 (84,3) y HMMT Feb 2026 (66,9) en modo thinking.
- Razonamiento cientifico de nivel doctorado: GPQA-Diamond con 80,7.
- Generacion de codigo: LiveCodeBench con 68,5.
- Seguimiento de instrucciones: IFBench con 64,1.
- Conocimiento general y razonamiento multidisciplinar: MMLU-Pro con 80,2.
- Modo thinking: el razonamiento termina en el token ``, segun la configuracion de evaluacion del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo mantiene 84,3 en AIME 2025 tras la cuantizacion, por lo que es adecuado para tutoria o verificacion de demostraciones donde se necesita un modelo de 9B desplegable en una sola GPU Hopper con 9 GB de pesos.
- Analisis de documentos cientificos con imagenes: al ser image-text-to-text, puede procesar figuras, tablas y graficos junto al texto, util para revision de literatura o extraccion de datos de papers.
- Generacion de codigo en pipelines internos: con 68,5 en LiveCodeBench, sirve para autocompletado, generacion de tests o revision de parches en entornos donde el coste de memoria es critico.
- Evaluacion de instrucciones complejas: su 64,1 en IFBench lo hace util para tareas de formateo estricto, extraccion estructurada y transformacion de datos con restricciones.
- Despliegue en infraestructura Hopper existente: al requerir solo sm90 y 9 GB de pesos, permite servir un modelo multimodal de 9B en una H100 compartida con otros servicios mediante vLLM.
- Investigacion en cuantizacion: la receta, los datos de calibracion y el pipeline QDA estan publicados, lo que permite reproducir el proceso, modificarlo o usarlo como referencia para cuantizar otros modelos Qwen.
- Prototipado de asistentes multimodales: la reduccion de 19,3 GB a 9,0 GB facilita iterar en una unica GPU sin renunciar a capacidades de vision y razonamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor, en modo thinking, pass@1 promediado sobre 1 a 32 semillas con los mismos ajustes para ambos modelos:

| Benchmark | BF16 (19,3 GB) | QDA W4A8 (9,0 GB) | Perdida |
|---|---|---|---|
| AIME 2025 | 85,3 | 84,3 | -1,0 |
| HMMT Feb 2026 | 67,5 | 66,9 | -0,6 |
| GPQA-Diamond | 81,8 | 80,7 | -1,1 |
| IFBench | 67,0 | 64,1 | -2,9 |
| MMLU-Pro | 81,2 | 80,2 | -1,0 |
| LiveCodeBench | 70,7 | 68,5 | -2,2 |
| Media | 75,6 | 74,1 | -1,5 |

Ajustes de evaluacion: temperatura 1,0, top-p 0,95, top-k 20, min-p 0, presence penalty 1,5, repetition penalty 1,0; max new tokens de 81.920 (32.768 en MMLU-Pro); thinking activado; MTP y decodificacion especulativa desactivados.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 9,0 GB solo para pesos; el total depende de la longitud de contexto y del cache KV.
- GPU soportadas: exclusivamente NVIDIA Hopper (sm90), es decir, H100 o H200, porque el kernel W4A8 de vLLM requiere compute capability 9.0.
- GPU consumer: no compatible. Las RTX 4090 (sm89) y anteriores no cumplen el requisito de compute capability.
- Despliegue: vLLM (`vllm serve qda-lab/QDA-Qwen3.5-9B-W4A8`); compatible con transformers y con el formato compressed-tensors.
- Construccion y cuantizacion: 1x H100 de 80 GB, con el paso de destilacion de escalares en 120 rondas de unos 90 segundos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| QDA-Qwen3.5-9B-W4A8 | 9,65B | no disponible | Safetensors W4A8 | Apache-2.0 | Solo Hopper (sm90) |
| Qwen/Qwen3.5-9B (BF16) | 9,65B | no disponible | Safetensors BF16 | Apache-2.0 | Amplico abanico de GPUs |
| Qwen3.5-9B en otras cuantizaciones (GGUF, AWQ) | 9,65B | no disponible | GGUF / AWQ | Apache-2.0 | Consumer y datacenter |

La comparativa se limita al modelo base y a sus variantes de cuantizacion, ya que la informacion proporcionada no incluye datos de otros modelos de la misma categoria. La ventaja del W4A8 es el tamano (9,0 GB frente a 19,3 GB) con una perdida media de 1,5 puntos; la desventaja es la dependencia exclusiva de Hopper, que lo descarta para GPUs consumer y para generaciones anteriores de datacenter.

## Limitaciones y advertencias

- Restriccion de hardware severa: solo funciona en H100 y H200 (sm90); no es desplegable en RTX 4090, A100 ni GPUs consumer.
- Perdida de precision no uniforme: la mayor caida se da en IFBench (-2,9 puntos) y LiveCodeBench (-2,2), por lo que el seguimiento estricto de instrucciones y la generacion de codigo son las areas mas afectadas.
- Reproducibilidad no exacta: una reconstruccion desde la receta no genera pesos identicos bit a bit; el autor reporta una divergencia KL de 0,01399.
- Sesgos: no documentados en la informacion proporcionada; hereda los del modelo base Qwen3.5-9B.
- Alucinacion: no se han publicado tasas de alucinacion especificas para esta version.
- Idiomas: no se especifica la cobertura linguistica; debe verificarse en la model card del modelo base.
- Licencia: Apache-2.0, igual que el modelo base, lo que permite uso comercial; conviene revisar igualmente las condiciones del modelo original Qwen3.5-9B.
- Dependencia de vLLM: el uso previsto esta ligado al kernel W4A8 de vLLM; otros runtimes pueden no soportar este formato de cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W4A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Receta de cuantizacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Qwen3.5-9B-W4A8/qwen3.5-9b-w4a8.yaml
- Datos de calibracion y destilacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.5-9B-W4A8
