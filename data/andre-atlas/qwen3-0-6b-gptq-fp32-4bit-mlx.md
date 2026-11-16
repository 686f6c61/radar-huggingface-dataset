# andre-atlas/Qwen3-0.6B-GPTQ-fp32-4bit-mlx

## Resumen

Qwen3-0.6B-GPTQ-fp32-4bit-mlx es una cuantizacion post-entrenamiento en 4 bits del modelo Qwen/Qwen3-0.6B, publicada por el desarrollador independiente andre-atlas (Andre Acioli) como artefacto de un proyecto de investigacion sobre cuantizacion para edge AI. El modelo no es un entrenamiento nuevo, sino una version comprimida del Qwen3-0.6B original pensada para ejecutarse en Apple Silicon mediante la libreria MLX. Resuelve el problema de desplegar un LLM pequeno en hardware de consumo con memoria unificada limitada, reduciendo el peso en disco de 1,20 GB a 0,39 GB (3,1x mas pequeno).

La relevancia tecnica del artefacto esta en su metodologia: emplea GPTQ con acumulacion de la matriz Hessiana (X^T X) en float32 en lugar de bfloat16, lo que segun el autor elimina los fallos de `NaN` en la perplexidad que aparecen en capas tardias de modelos de 3B a 4B con la implementacion estandar de `mlx-lm 0.32.2`. Es, por tanto, tanto un modelo utilizable como una pieza de evidencia empirica sobre el proceso de cuantizacion.

El modelo base Qwen3-0.6B es un transformer decoder-only de la familia Qwen3 de Alibaba, con 596.049.920 parametros totales. Esta cuantizacion conserva la licencia Apache-2.0 del original y esta orientada a generacion de texto y conversacion en dispositivos Apple. No se dispone de informacion sobre la longitud de contexto efectiva tras la cuantizacion en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizado con GPTQ |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits en pesos (group size 64); embeddings en 6 bits (group size 64) |
| Idiomas soportados | no disponibles (evaluado solo en ingles segun el autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del transformer decoder-only Qwen3-0.6B. No hay entrenamiento adicional: se aplica GPTQ capa por capa con un amortiguamiento (damping) del 1%, pesos a 4 bits con group size 64 y embeddings a 6 bits con group size 64. La calibracion usa los datos por defecto de `mlx-lm`, con secuencias de 512 tokens y semilla 0. El proceso de cuantizacion tardo 3345 segundos en un MacBook Pro con Apple M5 Pro y 24 GB de memoria unificada, ejecutando `mlx-lm 0.32.2` y `mlx 0.32.4`.

La innovacion tecnica destacable es la acumulacion de la Hessiana en float32. Segun el autor, la implementacion estandar de GPTQ en `mlx-lm 0.32.2` acumula X^T X en bfloat16, y en modelos de 3B a 4B el redondeo hace que la Hessiana de algunas capas tardias pierda la semidefinicion positiva, produciendo perplexidad `NaN`. Acumular en float32 elimina el fallo: los 10 trabajos del estudio (4 y 3 bits, 5 modelos) completaron con 0 `NaN`. No se documenta en la informacion disponible el numero de tokens de entrenamiento del modelo base ni si este paso por RLHF o DPO; esos datos corresponden al Qwen3-0.6B original y no se detallan aqui.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-0.6B.
- Razonamiento basico y respuesta a instrucciones a escala de 0,6B de parametros.
- Generacion de codigo y matematicas elementales, limitadas por el tamano del modelo base.
- Capacidades multilingues del modelo base: no documentadas en esta ficha; la evaluacion del autor se hizo solo en ingles.
- Tool calling / function calling: no documentado en la informacion proporcionada para esta cuantizacion.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de GPU dedicada.

## Casos de uso

- Prototipado local en Mac: el modelo permite probar pipelines de generacion de texto en un MacBook con memoria unificada, usando `mlx_lm.generate` o la API de Python de `mlx-lm`, sin necesidad de GPU NVIDIA ni servicios en la nube.
- Investigacion en cuantizacion: sirve como artefacto reproducible para comparar GPTQ con Hessiana en float32 frente a RTN, AWQ, DWQ y K-quants dentro del estudio del autor, con perplexidad y precision zero-shot medibles.
- Asistentes embebidos de baja latencia: al ocupar 0,39 GB en disco y caber holgadamente en memoria unificada de 24 GB, es adecuado para tareas de autocompletado o respuestas cortas en aplicaciones de escritorio.
- Generacion de texto offline: util para entornos sin conectividad donde se requiere un modelo pequeno que quepa en un portatil y no dependa de API externa.
- Filtrado y clasificacion de texto en local: tareas de etiquetado, resumen corto o reescritura que no exijan razonamiento complejo y puedan tolerar la perdida de calidad de la cuantizacion.
- Educacion y demos: permite mostrar el funcionamiento de un LLM cuantizado en una charla o taller sobre Apple Silicon y MLX, con cifras concretas de tamano y perplexidad.
- Base para experimentos de decodificacion especulativa: al ser un modelo pequeno, puede actuar como modelo borrador en tecnicas de speculative decoding sobre modelos mayores en el mismo dispositivo.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en un MacBook Pro (Apple M5 Pro, 24 GB de memoria unificada) con `mlx-lm 0.32.2` y `mlx 0.32.4`. Perplexidad sobre WikiText-2 test con ventanas de 2048 tokens; precision como media de ARC-Easy, ARC-Challenge, HellaSwag, PIQA y Winogrande en zero-shot con lm-eval.

| Metrica | fp16 (original) | Este modelo (4 bits) |
|---|---|---|
| Tamano en disco | 1,20 GB | 0,39 GB (3,1x menor) |
| Perplexidad WikiText-2 (menor es mejor) | 20,97 | 22,58 |
| Precision media zero-shot, 5 tareas | 0,5215 | 0,4958 |
| Retencion de perplexidad Q = PPL(fp16) / PPL(cuantizado) | 1,000 | 0,9285 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K para esta cuantizacion.

## Requisitos de hardware

- VRAM/memoria: el modelo ocupa 0,39 GB en disco; en memoria unificada necesita aproximadamente esa cifra mas el overhead de MLX y el contexto, por lo que cabe en cualquier Mac con Apple Silicon.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra). El autor midio en un M5 Pro con 24 GB.
- GPU de consumo: si, en cualquier Mac con chip Apple Silicon; no esta pensado para GPU NVIDIA ni AMD.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate` y API de Python). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es especifico de MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato temporal es el de cuantizacion (3345 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3-0.6B-GPTQ-fp32-4bit-mlx (este) | 596 M | no disponible | 4 bits GPTQ (pesos), 6 bits (embeddings) | Apache-2.0 | Apple Silicon (MLX) |
| Qwen/Qwen3-0.6B (original) | 596 M | no disponible | fp16 | Apache-2.0 | Multiples |
| Otras cuantizaciones de Qwen3-0.6B (GGUF, AWQ) | 596 M | no disponible | 4 u 8 bits | Apache-2.0 | llama.cpp, vLLM, etc. |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables para establecer una comparacion cuantitativa mas alla de la tabla de benchmarks del propio autor.

## Limitaciones y advertencias

- Solo funciona con MLX en Apple Silicon; no es portable a GPU NVIDIA, AMD ni a entornos CUDA.
- La cuantizacion degrada la calidad respecto al original: perplexidad de 22,58 frente a 20,97 y precision media zero-shot de 0,4958 frente a 0,5215.
- Los resultados provienen de una unica semilla de calibracion y se evaluaron solo en ingles; la generalizacion a otros idiomas o dominios no esta verificada.
- Hereda todos los sesgos y limitaciones del modelo base Qwen3-0.6B, incluido el riesgo de alucinacion propio de un modelo de 0,6B de parametros.
- No se documentan capacidades de tool calling ni de agente para esta cuantizacion; conviene validarlas antes de usarla en produccion.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion al modelo base y al autor de la cuantizacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andre-atlas/Qwen3-0.6B-GPTQ-fp32-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Proyecto de investigacion Edge AI & Quantization: https://github.com/Andre-Atlas/edge-ai-quantization
- Documento de diagnostico de la cuantizacion: https://github.com/Andre-Atlas/edge-ai-quantization/blob/main/experimentos/LOGICA-QUANTIZACAO.md
- Perfil del autor: https://github.com/Andre-Atlas
