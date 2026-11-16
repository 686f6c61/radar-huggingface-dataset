# andre-atlas/Qwen3-1.7B-GPTQ-fp32-4bit-mlx

## Resumen

Qwen3-1.7B-GPTQ-fp32-4bit-mlx es una cuantizacion post-entrenamiento a 4 bits del modelo Qwen/Qwen3-1.7B, desarrollada por Andre Acioli (andre-atlas) para su ejecucion en Apple Silicon mediante la libreria MLX. El artefacto forma parte de un proyecto de investigacion pre-registrado sobre cuantizacion post-entrenamiento (RTN, GPTQ, AWQ, DWQ y K-quants) de modelos pequenos (0,6B a 4B) en un dispositivo edge real. El modelo conserva la licencia Apache-2.0 del modelo base y ocupa 1,06 GB en disco frente a los 3,45 GB del original en fp16.

La innovacion tecnica principal es el uso de una matriz Hessiana acumulada en float32 durante el proceso GPTQ, en lugar del bfloat16 que emplea la implementacion estandar de `mlx-lm 0.32.2`. Este cambio elimina los valores NaN en la perplexidad que aparecian en los modelos de 3B a 4B del estudio, donde el redondeo hacia perder la semidefinicion positiva de la Hessiana en capas tardias. El resultado es un artefacto de 4 bits con grupo de 64 y embeddings de 6 bits, evaluado en un MacBook Pro con Apple M5 Pro y 24 GB de memoria unificada.

El modelo resuelve el problema de desplegar un LLM conversacional de 1,7B parametros en hardware Apple con un consumo de memoria reducido y una perdida de calidad medida y documentada: la perplexidad en WikiText-2 pasa de 16,72 a 18,23 y la retencion de perplexidad es de 0,9173, mientras que la precision media zero-shot en cinco tareas apenas baja de 0,6133 a 0,6108.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits en pesos con group size 64; embeddings a 6 bits con group size 64; GPTQ con Hessiana en float32 y damping del 1% |
| Idiomas soportados | no disponible (evaluacion realizada solo en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del transformer decoder-only Qwen3-1.7B, no un modelo entrenado desde cero. La cuantizacion se aplica capa por capa con GPTQ, acumulando la Hessiana (XᵀX) en float32 con un damping del 1%. Los pesos se cuantizan a 4 bits con group size 64, mientras que los embeddings se mantienen a 6 bits con group size 64. La calibracion utiliza los datos por defecto de `mlx-lm`, con secuencias de 512 tokens y semilla 0, y el proceso completo tarda 300 segundos en el dispositivo de referencia (Apple M5 Pro, 24 GB de memoria unificada, `mlx-lm 0.32.2`, `mlx 0.32.4`).

La innovacion destacable es el diagnostico y la correccion del fallo de NaN en la perplexidad: en la implementacion estandar de GPTQ de `mlx-lm`, la Hessiana se acumula en bfloat16 y, en modelos de 3B a 4B, el redondeo hace que la Hessiana de algunas capas tardias pierda la semidefinicion positiva, produciendo perplexidades NaN. Acumular la Hessiana en float32 elimina el fallo: los 10 trabajos del estudio (4 y 3 bits, 5 modelos) completaron con 0 NaN. No se dispone de informacion sobre el dataset de preentrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-1.7B.
- Razonamiento y respuesta a instrucciones en el formato del modelo base.
- Generacion de codigo y matematicas: capacidades propias de la familia Qwen3, aunque no se documentan evaluaciones especificas en esta cuantizacion.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este artefacto concreto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la evaluacion se realizo unicamente en ingles.
- Modo thinking: no documentado en la informacion proporcionada para esta cuantizacion.
- Vision y audio: no soportados (modelo de texto).

## Casos de uso

- Prototipado local en Mac: el modelo permite ejecutar un LLM de 1,7B en un portatil Apple Silicon con 1,06 GB en disco, ideal para experimentar con generacion de texto sin depender de la nube ni de GPUs dedicadas.
- Asistentes conversacionales embebidos: al ocupar poco espacio y ejecutarse con MLX en memoria unificada, se puede integrar en aplicaciones de escritorio macOS para tareas de chat y resumen con baja latencia.
- Investigacion en cuantizacion: sirve como artefacto reproducible para comparar GPTQ con Hessiana fp32 frente a otras tecnicas (RTN, AWQ, DWQ, K-quants) en el rango de 0,6B a 4B, tal como plantea el proyecto Edge AI & Quantization.
- Generacion de texto en pipelines de CI o scripts locales: la API de `mlx-lm` permite invocarlo desde Python (`load` y `generate`) para tareas de generacion, clasificacion o extraccion en entornos de desarrollo con Apple Silicon.
- Educacion y demos: su tamano reducido y su licencia Apache-2.0 facilitan su uso en talleres y materiales docentes sobre cuantizacion y despliegue edge.
- Evaluacion de calidad post-cuantizacion: con las metricas publicadas (perplexidad en WikiText-2 y precision zero-shot en cinco tareas) se puede usar como referencia para validar si la perdida de calidad es aceptable en una aplicacion concreta.

## Benchmarks y rendimiento

Resultados medidos en MacBook Pro (Apple M5 Pro, 24 GB de memoria unificada), `mlx-lm 0.32.2` y `mlx 0.32.4`:

| Metrica | fp16 (original) | Este modelo (4 bits) |
|---|---|---|
| Tamano en disco | 3,45 GB | 1,06 GB (3,3x menor) |
| Perplexidad WikiText-2 (menor es mejor) | 16,72 | 18,23 |
| Precision media zero-shot en 5 tareas | 0,6133 | 0,6108 |
| Retencion de perplexidad Q = PPL(fp16) / PPL(cuantizado) | 1,000 | 0,9173 |

- Perplexidad: test de WikiText-2, ventanas de 2.048 tokens.
- Precision: media de ARC-Easy, ARC-Challenge, HellaSwag, PIQA y Winogrande (lm-eval, zero-shot).
- No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 1,1 GB de pesos en disco; en ejecucion con MLX se recomienda al menos 4-6 GB de memoria unificada para margen de contexto y buffers, aunque el dato exacto de memoria pico no esta disponible.
- GPU recomendadas: Apple Silicon (serie M1, M2, M3, M4, M5); el estudio de referencia uso un Apple M5 Pro con 24 GB.
- Cabe en GPU consumer: si, en cualquier Mac con Apple Silicon; no esta pensado para GPUs NVIDIA o AMD, ya que el formato es MLX.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate` y API Python `load`/`generate`); no compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada; solo se documenta un tiempo de cuantizacion de 300 s en el dispositivo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-GPTQ-fp32-4bit-mlx (este) | 1,72B | no disponible | 4 bits GPTQ, MLX | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base fp16) | 1,72B | no disponible | fp16 | Apache-2.0 | Hugging Face |
| Qwen3-0.6B | 0,6B | no disponible | fp16 y variantes | Apache-2.0 | Hugging Face |
| Qwen3-4B | 4B | no disponible | fp16 y variantes | Apache-2.0 | Hugging Face |

Los modelos de la familia Qwen3 comparten licencia y disponibilidad, pero este artefacto se distingue por su formato MLX de 4 bits y su reduccion de tamano de 3,3x. No se dispone de datos de benchmarks comparativos con otras cuantizaciones (AWQ, DWQ, K-quants) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona con MLX en Apple Silicon; no es portable a CUDA, ROCm ni CPU generica en su formato actual.
- La cuantizacion reduce la calidad respecto al modelo original: la perplexidad sube de 16,72 a 18,23 y la retencion de perplexidad es de 0,9173.
- Los resultados provienen de una unica semilla de calibracion y se evaluaron unicamente en ingles; el comportamiento en otros idiomas no esta verificado.
- Hereda todos los sesgos y limitaciones del modelo base Qwen3-1.7B, incluido el riesgo de alucinacion propio de los LLM de este tamano.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion al modelo base y al autor de la cuantizacion.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad ni con un historial de uso en produccion.
- No se documentan capacidades de tool calling, agentes ni modo thinking para este artefacto concreto.

## Enlaces

- Hugging Face: https://huggingface.co/andre-atlas/Qwen3-1.7B-GPTQ-fp32-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Proyecto de investigacion: https://github.com/Andre-Atlas/edge-ai-quantization
- Documentacion del diagnostico de cuantizacion: https://github.com/Andre-Atlas/edge-ai-quantization/blob/main/experimentos/LOGICA-QUANTIZACAO.md
- Perfil del autor: https://github.com/Andre-Atlas
