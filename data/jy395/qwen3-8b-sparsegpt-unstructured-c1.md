# jy395/Qwen3-8B-sparsegpt-unstructured-c1

## Resumen

Qwen3-8B-sparsegpt-unstructured-c1 es un checkpoint comprimido del modelo Qwen/Qwen3-8B, publicado por el autor jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones comprimidas que acompanan al articulo academico "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", presentado en ICAIF '26. El modelo aplica una poda no estructurada del 50 % mediante SparseGPT sobre los pesos del Qwen3-8B original, manteniendo los pesos almacenados en formato denso (es decir, la esparsidad no reduce el tamano del checkpoint ni acelera la inferencia por si misma).

El modelo base Qwen3-8B es un transformer decoder-only de 8.190.735.360 parametros (segun los safetensors del repo), desarrollado por Alibaba Qwen, con capacidades de generacion de texto, razonamiento, codigo y modo "thinking". Este checkpoint concreto se ha calibrado sobre el corpus C1 (WikiText-2, texto generico), lo que lo convierte en la variante de referencia "generica" frente a las calibradas con datos financieros dentro del estudio.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigacion reproducible sobre compresion post-entrenamiento de LLMs en el dominio financiero; por otro, sirve como punto de comparacion para evaluar si la calibracion con datos de dominio (financieros) mejora la recuperacion de rendimiento tras la poda respecto a la calibracion generica. El repo ocupa 16,4 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con poda no estructurada SparseGPT al 50 % (pesos almacenados densos) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantizacion | no disponible (el checkpoint esta en formato compressed-tensors con poda; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

El modelo parte del Qwen3-8B, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parametros. Sobre el se aplica SparseGPT, un metodo de poda post-entrenamiento de una sola pasada que elimina el 50 % de los pesos de forma no estructurada, resolviendo un problema de reconstruccion capa a capa mediante la aproximacion de la inversa de la matriz Hessiana. La poda se realiza con la libreria llm-compressor del proyecto vLLM. Los pesos podados se almacenan en formato denso, por lo que el checkpoint conserva el mismo numero de parametros (8,19 B) y no se beneficia de ahorro de memoria ni de aceleracion por esparsidad salvo que el runtime explote explicitamente el patron.

La calibracion se hizo sobre el corpus C1 (WikiText-2, texto generico), con 128 secuencias de 2048 tokens (262.144 tokens en total), protocolo de consumo completo del corpus, `max_seq_length=2048` y semilla 42. El script de reproduccion es `scripts/quantization/sparsegpt_unstructured.py` con `--calib-path data/calibration_datasets/c1_wikitext.jsonl`. No se documenta en la informacion disponible si hubo entrenamiento adicional, RLHF o DPO especifico para este checkpoint; se trata de una compresion post-entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del Qwen3-8B base.
- Razonamiento y modo "thinking" (heredado de la familia Qwen3; no verificado especificamente en este checkpoint).
- Generacion de codigo y matematicas (capacidades del modelo base, no reevaluadas en la informacion disponible).
- Soporte de tool calling / function calling (heredado del modelo base; no verificado tras la poda).
- Capacidades multilingues: no disponibles en la informacion proporcionada para este checkpoint.
- Uso como artefacto de investigacion para estudiar el impacto de la calibracion en la compresion de LLMs financieros.
- Carga directa en vLLM y transformers mediante el formato compressed-tensors.

## Casos de uso

- Investigacion sobre compresion post-entrenamiento: sirve como configuracion de referencia (calibracion generica) para comparar con las variantes calibradas con datos financieros del mismo estudio y medir la perdida de rendimiento atribuible a la calibracion.
- Reproducibilidad academica: permite reproducir los resultados del articulo ICAIF '26 ejecutando la suite de evaluacion de diez tareas financieras incluida en el repositorio de codigo.
- Despliegue en vLLM para experimentos de inferencia a escala: el checkpoint carga directamente en vLLM, lo que facilita servirlo con batching continuo en entornos de investigacion.
- Analisis de sensibilidad a la poda: util para estudiar que capas o componentes del Qwen3-8B son mas sensibles a una poda no estructurada del 50 % cuando la calibracion es generica.
- Baseline en pipelines de evaluacion financiera: punto de partida para medir la degradacion en tareas como analisis de sentimiento financiero, extraccion de entidades o respuesta a preguntas sobre informes, antes de aplicar tecnicas de recuperacion.
- Docencia y formacion: ejemplo practico de flujo llm-compressor + compressed-tensors + vLLM para ensenar compresion de modelos en cursos de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluacion del repositorio de codigo (diez tareas financieras) y al articulo ICAIF '26 para los resultados completos, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (BF16/FP16): aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- Al estar los pesos almacenados densos, la poda no reduce la huella de memoria; se necesita el mismo espacio que el Qwen3-8B sin podar.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado; en GPUs de 16 GB requeriria cuantizacion adicional no incluida en este checkpoint.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors) y transformers con `device_map="auto"`. No se documenta soporte GGUF ni Ollama para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Qwen3-8B-sparsegpt-unstructured-c1 | 8,19 B | no disponible | Poda SparseGPT 50 % no estructurada, calibracion WikiText-2 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible | Sin compresion | Apache 2.0 | Hugging Face |
| Otras variantes del mismo estudio (calibracion financiera) | 8,19 B | no disponible | Poda SparseGPT 50 % con calibracion de dominio | Apache 2.0 | Coleccion Hugging Face de jy395 |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparacion se limita a parametros, licencia y esquema de compresion.

## Limitaciones y advertencias

- La poda no estructurada al 50 % con pesos almacenados densos no aporta ahorro de memoria ni aceleracion en runtimes estandar; el beneficio es exclusivamente de investigacion.
- La calibracion con texto generico (WikiText-2) puede degradar mas el rendimiento en tareas financieras que las variantes calibradas con datos de dominio, segun la hipotesis central del articulo.
- Riesgo de alucinacion inherente al modelo base Qwen3-8B, potencialmente agravado por la poda.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad especificas para este checkpoint.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue equivalente al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento tras la compresion.
- No se documenta soporte de cuantizacion adicional (GGUF, AWQ, GPTQ) para este checkpoint concreto.
- Fecha de creacion en Hugging Face (2026-10-31) posterior a la fecha actual de referencia; verificar disponibilidad real del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/jy395/Qwen3-8B-sparsegpt-unstructured-c1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Articulo (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de codigo: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/sparsegpt_unstructured.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa (30 configuraciones): https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
