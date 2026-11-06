# mrysh/qwen3.5-9b-prune_unstructured_50

## Resumen

`mrysh/qwen3.5-9b-prune_unstructured_50` es una version podada del modelo Qwen/Qwen3.5-9B, publicada por el usuario mrysh como parte de un benchmark de pruning. No se trata de un modelo pensado para produccion, sino de un artefacto experimental que compara distintas variantes de poda (4 modelos x 8 variantes) frente a la cuantizacion, evaluadas sobre BFCL, un test de sesgo en contratacion y MedQA mediante vLLM.

La poda aplicada es no estructurada, con nivel 0.5: el 50,1% de los pesos de las capas lineales del decoder son cero, obtenidos mediante pruning por magnitud capa a capa sin datos de calibracion. El fichero resultante sigue siendo denso (los ceros se almacenan como ceros), de modo que el tamano en disco y la velocidad de inferencia son identicos a los del modelo base; lo unico que cambia es la calidad de las respuestas.

El modelo conserva la licencia Apache 2.0 del base y un total de 8.953.803.264 parametros (8,95 mil millones), con un repositorio de 17,9 GB. Es relevante como referencia metodologica para quien investigue tecnicas de compresion: cuantifica cuanto degrada una poda agresiva sin destilacion ni fine-tuning posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (qwen3_5_text), derivada de Qwen/Qwen3.5-9B |
| Parametros totales | 8.953.803.264 (8,95 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors en BF16/denso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de la familia Qwen3.5 con 8,95 mil millones de parametros. Sobre esa base se aplico una poda no estructurada de nivel 0.5 mediante criterio de magnitud capa a capa, sin datos de calibracion: se anulan los pesos de menor magnitud en las capas lineales del decoder hasta alcanzar el 50,1% de ceros. No se realizo destilacion ni fine-tuning posterior a la poda.

La consecuencia tecnica principal es que la matriz de pesos permanece densa a efectos de almacenamiento y computo: los ceros se guardan explicitamente, por lo que el modelo no se acelera ni reduce su huella de memoria respecto al base. El entrenamiento original (datos, tokens, fases de RLHF/DPO) corresponde integramente a Qwen/Qwen3.5-9B y no se documenta en la informacion disponible de este repositorio.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base, con degradacion esperada por la poda.
- Evaluado como modelo de texto puro con el modo thinking desactivado en vLLM.
- Soporte de tool calling evaluado indirectamente mediante BFCL (Berkeley Function Calling Leaderboard).
- Conocimiento de dominio medico evaluado con MedQA.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Benchmark de tecnicas de poda: sirve como punto de comparacion frente a otras variantes (estructuradas, con calibracion, con fine-tuning posterior) para medir la perdida de calidad a esparsidad del 50%.
- Investigacion sobre compresion de modelos: permite estudiar la relacion entre esparsidad no estructurada y rendimiento en tareas de function calling y QA medico sin necesidad de reentrenar.
- Evaluacion de robustez en tool calling: al ejecutarse en vLLM con BFCL, es util para analizar como afecta la poda a la precision en la generacion de llamadas a funciones.
- Analisis de sesgo: el benchmark incluye una prueba de sesgo en contratacion, por lo que el modelo puede usarse para estudiar si la poda altera comportamientos sesgados del base.
- Baseline en pipelines de evaluacion propios: cualquier equipo que investigue pruning puede reproducir el setup (vLLM, thinking off) y contrastar sus resultados.
- Estudio de degradacion en dominio medico: MedQA permite cuantificar la perdida de conocimiento factual tras anular el 50% de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica unicamente que el modelo se evalua en BFCL, una prueba de sesgo en contratacion y MedQA mediante vLLM, y que forma parte de un benchmark comparativo de 4 modelos x 8 variantes de poda frente a cuantizacion, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos, mas overhead de KV cache; en la practica se recomienda una GPU de 24 GB o superior.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 3090 o RTX 4090 (24 GB) para BF16 ajustado.
- Cuantizacion a 8 bits: alrededor de 9-10 GB de pesos, viable en RTX 4080/4090 y GPUs de 16 GB con contexto moderado.
- Cuantizacion a 4 bits: alrededor de 5-6 GB de pesos, cabe en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4070), aunque la informacion disponible no incluye ficheros GGUF ni cuantizados.
- Despliegue: el autor evalua con vLLM; al ser un transformer denso estandar en safetensors, es compatible con TGI y con llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles; al mantener la densidad del base, se esperan valores equivalentes a Qwen3.5-9B en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrysh/qwen3.5-9b-prune_unstructured_50 | 8,95 mil millones | no disponible | 50,1% ceros, denso en disco | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 8,95 mil millones | no disponible | denso | Apache 2.0 | Hugging Face |
| Otras variantes del benchmark de mrysh | no disponible | no disponible | distintas podas (8 variantes) | Apache 2.0 (presumible) | Hugging Face |
| Version cuantizada del base (p. ej. AWQ/GPTQ) | 8,95 mil millones | no disponible | cuantizada | Apache 2.0 | segun publicacion |

La comparacion relevante es frente al base y frente a alternativas cuantizadas: la poda no estructurada sin reentrenamiento no reduce el tamano ni acelera la inferencia, mientras que la cuantizacion si reduce memoria y suele preservar mejor la calidad a igual compresion nominal. No se dispone de datos numericos para cuantificar la diferencia.

## Limitaciones y advertencias

- Perdida de calidad esperada: no hubo destilacion ni fine-tuning tras la poda, por lo que el rendimiento cae frente al modelo base.
- Sin ganancia practica de eficiencia: los ceros se almacenan, de modo que el modelo ocupa lo mismo y corre a la misma velocidad que el base.
- No apto para produccion sin evaluacion previa: es un artefacto de benchmark, no una version optimizada.
- Idiomas soportados no documentados en este repositorio; deben consultarse en la model card del base.
- Longitud de contexto no indicada; se hereda del base y debe verificarse alli.
- Riesgo de alucinacion incrementado respecto al base por la poda agresiva, especialmente en conocimiento factual (MedQA) y generacion de llamadas a funciones.
- Sesgos: el benchmark incluye una prueba de sesgo en contratacion, lo que sugiere que el autor considera relevante medir comportamientos sesgados; no se publican resultados.
- Licencia Apache 2.0 permite uso comercial, pero la calidad degradada hace desaconsejable su uso en produccion sin validacion.
- Fecha de creacion del repositorio (2026-11-04) y ausencia de descargas o likes indican que es un experimento reciente y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_unstructured_50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
- MedQA: no disponible en la informacion proporcionada
- Repositorio o blog del autor sobre el benchmark: no disponible en la informacion proporcionada
