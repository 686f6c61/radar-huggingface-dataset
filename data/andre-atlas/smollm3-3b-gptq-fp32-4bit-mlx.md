# andre-atlas/SmolLM3-3B-GPTQ-fp32-4bit-mlx

## Resumen

SmolLM3-3B-GPTQ-fp32-4bit-mlx es una cuantizacion post-entrenamiento en 4 bits del modelo HuggingFaceTB/SmolLM3-3B, publicada por Andre Acioli (andre-atlas) como artefacto de su proyecto de investigacion "Edge AI & Quantization". El modelo esta empaquetado en formato MLX para ejecutarse en Apple Silicon y emplea GPTQ con acumulacion de la matriz Hessiana en float32, una decision tecnica que evita los valores NaN que aparecen al cuantizar modelos de 3B-4B con la implementacion estandar de `mlx-lm 0.32.2`, que acumula en bfloat16.

El modelo base SmolLM3-3B es un transformer denso de aproximadamente 3.075 millones de parametros desarrollado por Hugging Face. Esta variante cuantizada reduce el peso en disco de 6,17 GB a 1,81 GB (3,4 veces menor) manteniendo una perplejidad en WikiText-2 de 9,47 frente a 9,12 del original fp16, es decir, una retencion del 96,3 por ciento. La precision media zero-shot en cinco tareas cae de 0,7057 a 0,6806.

Su relevancia actual es doble: por un lado, demuestra que es posible cuantizar a 4 bits modelos de 3B en hardware de consumo Apple sin degradacion catastrofica; por otro, documenta un fallo reproducible del GPTQ estandar en MLX y su solucion practica (Hessiana en fp32 con 1 por ciento de damping), lo que resulta util para cualquiera que quiera replicar el pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base SmolLM3-3B) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ 4 bits (grupo 64) en pesos; embeddings a 6 bits (grupo 64) |
| Idiomas soportados | no disponible (evaluado solo en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del SmolLM3-3B original: un transformer denso de unos 3.075 millones de parametros. Sobre esa base, esta publicacion aplica cuantizacion post-entrenamiento GPTQ capa por capa, con acumulacion de la Hessiana (XᵀX) en float32, damping del 1 por ciento, pesos a 4 bits con tamano de grupo 64 y embeddings a 6 bits con grupo 64. La calibracion usa los datos por defecto de `mlx-lm`, con secuencias de 512 tokens y semilla 0; el proceso completo tardo 815 segundos en un MacBook Pro con Apple M5 Pro y 24 GB de memoria unificada.

La innovacion tecnica destacable no esta en el entrenamiento (no hay RLHF ni DPO en esta fase, es solo cuantizacion) sino en el diagnostico del fallo del GPTQ estandar: al acumular la Hessiana en bfloat16, algunas capas tardias pierden la semidefinicion positiva y el modelo cuantizado devuelve perplejidad NaN. Acumular en float32 elimina el problema y permitio completar los 10 trabajos del estudio (4 y 3 bits, 5 modelos) con cero NaN. El modelo base SmolLM3-3B si incorpora tecnicas de entrenamiento propias de Hugging Face, pero esos detalles no se recogen en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y continuacion de prompts, en pipeline `text-generation`.
- Razonamiento basico y respuesta a preguntas, medido en ARC-Easy, ARC-Challenge, HellaSwag, PIQA y Winogrande.
- Capacidad multilingue: no disponible (la evaluacion se hizo solo en ingles).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Inferencia local en Apple Silicon mediante MLX, pensada para edge AI.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con `mlx_lm` y generar texto en un portatil Apple Silicon sin GPU dedicada, aprovechando los 1,81 GB en disco y la memoria unificada.
- Investigacion en cuantizacion: replicar el pipeline GPTQ con Hessiana fp32 para estudiar la retencion de calidad a 4 bits en modelos de 3B-4B, comparando con RTN, AWQ, DWQ y K-quants.
- Evaluacion comparativa de tecnicas de compresion: usar este artefacto como referencia cuantizada frente al fp16 original en tareas zero-shot (ARC, HellaSwag, PIQA, Winogrande).
- Generacion de texto en entornos con memoria limitada: el modelo cabe en 24 GB de memoria unificada con holgura, lo que permite ejecutarlo junto con otras cargas en un MacBook Pro.
- Asistente conversacional offline: al ser un modelo de 3B en 4 bits, puede integrarse en aplicaciones de escritorio que requieran privacidad y no dependan de la nube.
- Docencia y demostraciones de edge AI: sirve para ilustrar en clase el impacto de la cuantizacion (perplejidad 9,12 frente a 9,47; precision 0,7057 frente a 0,6806) con un caso real y reproducible.
- Validacion de pipelines de cuantizacion en CI: comprobar que un pipeline GPTQ produce pesos sin NaN y con retencion de perplejidad superior al 96 por ciento antes de desplegar.

## Benchmarks y rendimiento

Resultados medidos en MacBook Pro (Apple M5 Pro, 24 GB de memoria unificada), `mlx-lm 0.32.2` y `mlx 0.32.4`:

| Metrica | fp16 (original) | Este modelo |
|---|---|---|
| Tamano en disco | 6,17 GB | 1,81 GB (3,4x menor) |
| Perplejidad WikiText-2 (menor es mejor) | 9,12 | 9,47 |
| Precision media zero-shot, 5 tareas | 0,7057 | 0,6806 |
| Retencion de perplejidad Q = PPL(fp16) / PPL(cuantizado) | 1,000 | 0,9631 |

Notas: perplejidad sobre WikiText-2 test con ventanas de 2.048 tokens; precision media de ARC-Easy, ARC-Challenge, HellaSwag, PIQA y Winogrande en lm-eval zero-shot. No se han publicado resultados desglosados por tarea ni comparaciones con otros modelos cuantizados en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 1,8 GB de pesos en disco; en memoria unificada se necesita algo mas para el contexto y los buffers de inferencia (el autor lo ejecuto en 24 GB sin problema). Estimacion practica: 3-4 GB de memoria unificada para inferencia comoda.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5) con memoria unificada; el autor uso un M5 Pro de 24 GB.
- GPU consumer: si, cabe en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; no es compatible con CUDA ni con GPUs NVIDIA por el formato MLX.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate` y API Python `load`/`generate`). No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada (solo se documenta el tiempo de cuantizacion, 815 s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| SmolLM3-3B-GPTQ-fp32-4bit-mlx (este) | 3,075 B | no disponible | GPTQ 4 bits (Hessiana fp32) | Apache-2.0 | MLX safetensors |
| HuggingFaceTB/SmolLM3-3B (base) | 3,075 B | no disponible | fp16 | Apache-2.0 | safetensors |
| Otras variantes cuantizadas de SmolLM3-3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento de alternativas comparables (RTN, AWQ, DWQ o K-quants sobre el mismo modelo base), por lo que la comparacion cuantitativa con otros artefactos queda como no disponible.

## Limitaciones y advertencias

- Solo funciona con MLX en Apple Silicon; no es portable a CUDA, ROCm ni CPUs x86.
- La cuantizacion degrada la calidad respecto al original: perplejidad 9,47 frente a 9,12 y precision media 0,6806 frente a 0,7057.
- Los resultados provienen de una unica semilla de calibracion y se evaluaron solo en ingles; el comportamiento multilingue no esta verificado.
- Hereda todos los sesgos y limitaciones del modelo base SmolLM3-3B, incluido el riesgo de alucinacion propio de un modelo de 3B.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y atribuir correctamente a Hugging Face y a Andre Acioli.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria del artefacto.
- No se documenta la longitud de contexto efectiva tras la cuantizacion ni el impacto en tool calling o agentes.
- El fallo de NaN del GPTQ estandar en `mlx-lm 0.32.2` afecta a este rango de tamanos; si se replica el pipeline con otra version, hay que verificar que la Hessiana se acumule en fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andre-atlas/SmolLM3-3B-GPTQ-fp32-4bit-mlx
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio del proyecto: https://github.com/Andre-Atlas/edge-ai-quantization
- Documentacion del diagnostico de cuantizacion: https://github.com/Andre-Atlas/edge-ai-quantization/blob/main/experimentos/LOGICA-QUANTIZACAO.md
- Perfil del autor: https://github.com/Andre-Atlas
