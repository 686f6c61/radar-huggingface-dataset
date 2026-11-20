# puretensor/Jais-3-32B-NVFP4A16

## Resumen

Jais-3-32B-NVFP4A16 es una cuantización de 4 bits de los pesos del modelo Jais-3-32B de inception42, publicada por PureTensor. Se trata de un checkpoint W4A16 (pesos en 4 bits, activaciones en 16 bits) generado con GPTQ y el formato `nvfp4-pack-quantized` de compressed-tensors, orientado a servir el modelo con mayor eficiencia en GPUs Blackwell mediante el kernel FP4 de vLLM. El modelo base es un transformer decoder-only de la familia Jais-3, especializado en árabe e inglés, con aproximadamente 20.700 millones de parámetros reales en safetensors pese a la denominación comercial "32B".

La relevancia de esta publicación es doble: por un lado, reduce el peso en disco y en memoria de 69,56 GB (BF16) a 23,25 GB, manteniendo una calidad muy cercana al original; por otro, es una de las pocas cuantizaciones NVFP4 documentadas con evaluación rigurosa (MMLU, ArabicMMLU, GSM8K, perplejidad y divergencia KL) sobre un modelo bilingüe árabe-inglés. El autor la describe explícitamente como una "test release" no afiliada a los autores del modelo original.

La ficha se centra en el checkpoint cuantizado; los datos de arquitectura y entrenamiento del modelo base se indican como no disponibles cuando la información proporcionada no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Jais-3), 64 bloques transformer; detalles internos del base no disponibles |
| Parametros totales | 20.686.443.968 (según safetensors); denominación comercial "32B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16: pesos 4-bit E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ `block_size` 128, `dampening_frac` 0.01, `actorder` estático |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized`; requiere `trust_remote_code` |

## Arquitectura y entrenamiento

El checkpoint cuantiza únicamente los pesos de todas las capas `Linear` de los 64 bloques transformer del modelo base. Se mantienen en BF16 las embeddings de tokens, la cabeza de salida, todas las normalizaciones y todas las activaciones. La cuantización se realizó con GPTQ sobre los pesos BF16 oficiales, usando llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1.

La calibración empleó 2.048 muestras en formato chat de hasta 2.048 tokens cada una: 1.024 pares instrucción-respuesta en árabe (primeras filas de `arbml/CIDAR`) y 1.024 de `mlabonne/open-perfectblend`. La plantilla de chat del modelo base exige un campo de razonamiento en los turnos del asistente; para calibración y evaluación se pasó un `reasoning_content` vacío. No se dispone de información sobre la arquitectura interna del base (tipo de atención, datos de preentrenamiento, uso de RLHF/DPO) más allá de lo indicado.

## Capacidades

- Generación de texto conversacional en árabe e inglés, con plantilla de chat propia que incluye campo de razonamiento (`reasoning_content`).
- Razonamiento matemático: 92,95 de exact match en GSM8K, prácticamente idéntico al BF16.
- Conocimiento general y académico bilingüe: MMLU 80,59 y ArabicMMLU 76,71.
- Modo de razonamiento explícito mediante el campo `reasoning_content` de la plantilla del modelo base.
- Compatible con el servidor de vLLM y con el kernel weight-only FP4 (`MarlinNvFp4LinearKernel`) en GPUs Blackwell.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistencia conversacional en árabe: el modelo puede mantener diálogos multi-turno con la plantilla de chat nativa y un campo de razonamiento, adecuado para atención al cliente en mercados arabófonos.
- Generación de resúmenes y reescritura bilingüe: con calidad cercana al BF16 en MMLU y ArabicMMLU, sirve para tareas de comprensión y síntesis de documentos en árabe e inglés.
- Razonamiento matemático en producción: su GSM8K de 92,95 permite integrarlo en pipelines de resolución de problemas aritméticos y verificación de cálculos.
- Evaluación comparativa de cuantizaciones: al publicar métricas detalladas (KL, perplejidad, McNemar), es útil como referencia para estudiar el impacto de NVFP4 en modelos bilingües.
- Despliegue de bajo coste en GPUs Blackwell: el formato NVFP4A16 con vLLM ofrece 2,4-2,85x de throughput frente a BF16, útil para servir cargas concurrentes con menor huella de memoria.
- Investigación en eficiencia de inferencia: sirve para medir la degradación de calidad de GPTQ/NVFP4 en un modelo de ~20.700 millones de parámetros con datos de calibración bilingües.

## Benchmarks y rendimiento

| Benchmark | BF16 | Este checkpoint | Cambio | Prueba pareada |
|---|---:|---:|---:|---|
| ArabicMMLU (14.455 preguntas) | 77,36 | 76,71 | -0,65 | 344 perdidas, 249 ganadas, p = 1e-4 |
| GSM8K (1.319 problemas) | 93,03 | 92,95 | -0,08 | 27 perdidas, 26 ganadas, p = 1,00 |
| MMLU (14.042 preguntas) | 81,08 | 80,59 | -0,49 | 274 perdidas, 206 ganadas, p = 2e-3 |
| WikiText-2 perplejidad (131.072 tokens) | 7,63 | 7,78 | +0,15 | — |

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top-1 que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test (inglés) | 131.072 | 0,026 | 0,25 | 92,8% |
| Chat (`ultrachat_200k`, 256 conversaciones) | 238.748 | 0,048 | 0,81 | 94,0% |
| Árabe (`arbml/CIDAR`, 256 pares) | 64.040 | 0,037 | 0,55 | 93,4% |
| WikiText-2 sin token de inicio | 130.944 | 0,048 | 0,45 | 90,9% |

Rendimiento en vLLM 0.34.0 sobre una GPU Blackwell (compute capability 12.0): GSM8K vía API de completions 93,18 frente a 93,10 en BF16; throughput 2,85x (un stream), 2,70x (8 concurrentes) y 2,40x (32 concurrentes) con generaciones greedy de 256 tokens.

## Requisitos de hardware

- Peso en disco y memoria: 23,25 GB en NVFP4A16 frente a 69,56 GB en BF16.
- En vLLM con kernel FP4 se mantiene el ahorro de memoria; en Transformers los pesos se expanden a 16 bits al cargar, por lo que solo se ahorra disco y descarga y se necesita tanta VRAM como el BF16.
- GPU recomendadas: NVIDIA Blackwell (compute capability 12.0) para aprovechar el kernel `MarlinNvFp4LinearKernel`; no se documenta soporte en otras arquitecturas.
- No se confirma que quepa en GPUs de consumo; el tamaño de 23,25 GB excede la VRAM de la mayoría de tarjetas consumer.
- Despliegue: `vllm serve puretensor/Jais-3-32B-NVFP4A16 --trust-remote-code`, o Transformers con `compressed-tensors` instalado y `trust_remote_code=True`.
- Throughput medido: 2,4-2,85x frente a BF16 según concurrencia; la latencia absoluta no se publica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| puretensor/Jais-3-32B-NVFP4A16 | 20.686 M | no disponible | apache-2.0 | safetensors NVFP4A16 | Este checkpoint |
| inception42/Jais-3-32B (BF16) | ~32B nominales | no disponible | apache-2.0 | safetensors BF16 | Base; 69,56 GB, MMLU 81,08 |
| puretensor/Jais-3-7B-NVFP4A16 | ~7B | no disponible | apache-2.0 | safetensors NVFP4A16 | Misma receta; MMLU -0,8, ArabicMMLU -0,1, GSM8K -1,5 |
| puretensor/Jais-3-3.7B-NVFP4A16 | ~3,7B | no disponible | apache-2.0 | safetensors NVFP4A16 | Misma receta; MMLU -4,0, ArabicMMLU +0,3, GSM8K -0,2 |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Es una "test release" no afiliada ni respaldada por los autores del modelo base.
- En Transformers los pesos se expanden a 16 bits al cargar: no hay ahorro de VRAM, solo de disco y descarga.
- Degradación medible frente a BF16: -0,65 en ArabicMMLU y -0,49 en MMLU (estadísticamente significativas), +0,15 de perplejidad en WikiText-2.
- Las filas de KL para árabe y chat comparten familia de dataset con la calibración (filas distintas), por lo que son optimistas; la propia model card lo advierte.
- Las puntuaciones de benchmark pueden variar uno o dos puntos entre distintas calibraciones de la misma receta; los resultados corresponden a una sola calibración.
- Solo se documentan árabe e inglés; no hay datos de otros idiomas.
- No se documenta longitud de contexto, sesgos conocidos ni tasas de alucinación.
- Requiere `trust_remote_code=True` y, en Transformers, el paquete `compressed-tensors`.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/puretensor/Jais-3-32B-NVFP4A16
- Modelo base: https://huggingface.co/inception42/Jais-3-32B
- Cuantización 7B hermana: https://huggingface.co/puretensor/Jais-3-7B-NVFP4A16
- Cuantización 3.7B hermana: https://huggingface.co/puretensor/Jais-3-3.7B-NVFP4A16
- Dataset de calibración árabe: `arbml/CIDAR` (Hugging Face)
- Dataset de calibración inglés: `mlabonne/open-perfectblend` (Hugging Face)
- Dataset de chat para KL: `HuggingFaceH4/ultrachat_200k` (Hugging Face)
