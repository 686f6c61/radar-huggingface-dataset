# PureTensorAI/Jais-3-7B-NVFP4A16

## Resumen

Jais-3-7B-NVFP4A16 es una cuantización de pesos en 4 bits del modelo Jais-3-7B (inception42), publicada por PureTensorAI. Se trata de un checkpoint W4A16: los pesos de las capas `Linear` se almacenan en formato NVFP4 (valores E2M1 con una escala FP8 E4M3 por grupo de 16 y una escala FP32 por tensor), mientras que embeddings, cabeza de salida, normalizaciones y activaciones permanecen en BF16. El resultado es un archivo de 8,01 GB frente a los 18,00 GB del BF16 original.

El modelo base es un transformer de 36 bloques con 8.999.178.240 parámetros totales, especializado en árabe e inglés y con plantilla de chat que exige un campo de razonamiento (`reasoning_content`) en los turnos del asistente. La cuantización se realizó con GPTQ sobre 2.048 muestras de calibración (1.024 pares de instrucción en árabe de `arbml/CIDAR` y 1.024 de `mlabonne/open-perfectblend`), usando llm-compressor 0.15.0 y compressed-tensors 0.20.1.

Su relevancia es doble: demuestra que la cuantización NVFP4 con GPTQ preserva la calidad del BF16 en árabe (ArabicMMLU cae solo 0,13 puntos, no significativo) y ofrece una mejora de throughput de aproximadamente 2,08x en vLLM sobre GPUs Blackwell con el kernel `MarlinNvFp4LinearKernel`. Es una release de prueba, no afiliada a los autores del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 36 bloques (Jais-3) |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos 4-bit E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; GPTQ (`block_size` 128, `dampening_frac` 0.01, `actorder` static) |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors `nvfp4-pack-quantized` |
| Modelo base | inception42/Jais-3-7B |
| Tamano del repo | 8,0 GB (frente a 18,00 GB en BF16) |
| Capas cuantizadas | Pesos de todas las capas `Linear` de los 36 bloques |
| Capas en BF16 | Embeddings de tokens, cabeza de salida, todas las normalizaciones y activaciones |
| Herramientas | llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0, torch 2.14.1 |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base inception42/Jais-3-7B, un transformer decoder-only de 36 bloques y ~9B parámetros. La cuantización aplica GPTQ únicamente a los pesos de las capas `Linear`, manteniendo en BF16 los embeddings de tokens, la cabeza de salida, todas las normalizaciones y todas las activaciones (esquema W4A16). El formato de almacenamiento es compressed-tensors `nvfp4-pack-quantized` con esquema `NVFP4A16`.

La calibración usó 2.048 muestras con formato de chat de hasta 2.048 tokens cada una: 1.024 pares de instrucción y respuesta en árabe (primeras filas de `arbml/CIDAR`) y 1.024 de `mlabonne/open-perfectblend`. Como la plantilla de chat del modelo base exige un campo `reasoning_content` en los turnos del asistente, durante la calibración y evaluación se pasó un `reasoning_content` vacío. No se realizó entrenamiento adicional ni ajuste fino: es exclusivamente una compresión de pesos.

## Capacidades

- Generación de texto conversacional en árabe e inglés, heredadas del modelo base Jais-3-7B.
- Razonamiento y resolución de problemas matemáticos (evaluado en GSM8K con 84,08 de exact match).
- Conocimiento general y académico en inglés (MMLU 72,75) y en árabe (ArabicMMLU 68,38).
- Soporte de plantilla de chat con campo de razonamiento (`reasoning_content`) en los turnos del asistente.
- Inferencia eficiente en motores con kernel de pesos FP4 (vLLM con `MarlinNvFp4LinearKernel`).
- No se dispone de información sobre tool calling, function calling, capacidades de agente, visión o audio en la documentación proporcionada.

## Casos de uso

- Asistencia conversacional en árabe: el modelo puede mantener diálogos multi-turno en árabe con calidad prácticamente idéntica al BF16 (ArabicMMLU 68,38 frente a 68,51), lo que lo hace adecuado para atención al cliente y asistentes virtuales en ese idioma.
- Despliegue en producción con vLLM: al servirse con `vllm serve PureTensorAI/Jais-3-7B-NVFP4A16 --trust-remote-code` sobre GPUs Blackwell, ofrece aproximadamente 2,08x de throughput frente al BF16 en flujo único y 8 concurrentes, y 1,86x con 32 concurrentes, reduciendo coste por token.
- Razonamiento matemático en árabe e inglés: con GSM8K en 84,08 de exact match, es utilizable en asistentes educativos o de resolución de problemas donde el ahorro de memoria y el throughput importan.
- Reducción de huella de almacenamiento y descarga: el archivo de 8,01 GB frente a 18,00 GB del BF16 facilita su distribución en entornos con ancho de banda limitado o almacenamiento restringido, incluso cuando se carga en Transformers (donde los pesos se expanden a 16 bits en memoria).
- Evaluación comparativa de técnicas de cuantización: sirve como referencia reproducible para estudiar el impacto de NVFP4A16 con GPTQ en modelos bilingües árabe-inglés, con métricas de KL y pruebas pareadas McNemar publicadas.
- Prototipado e investigación en PLN árabe: al estar bajo Apache-2.0, puede integrarse en pipelines de investigación y experimentación sin restricciones comerciales adicionales.

## Benchmarks y rendimiento

Calidad medida con lm-evaluation-harness 0.4.13 (sin plantilla de chat, GSM8K con flexible-extract), usando BF16 como referencia y el checkpoint recargado desde disco:

| Benchmark | BF16 | Este checkpoint | Cambio | Prueba pareada |
|---|---:|---:|---:|---|
| ArabicMMLU, accuracy (14.455 preguntas) | 68,51 | 68,38 | -0,13 | 565 perdidas, 546 ganadas, p = 0,59 |
| GSM8K, exact match (1.319 problemas) | 85,60 | 84,08 | -1,52 | 70 perdidas, 50 ganadas, p = 0,08 |
| MMLU, accuracy (14.042 preguntas) | 73,54 | 72,75 | -0,79 | 465 perdidas, 353 ganadas, p = 1e-4 |
| WikiText-2, perplejidad (131.072 tokens) | 10,13 | 10,42 | +0,29 | — |

Divergencia KL (distribución completa del siguiente token, teacher-forced, ventanas de 1.024 tokens):

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test (inglés) | 131.072 | 0,038 | 0,33 | 90,4% |
| Chat (`HuggingFaceH4/ultrachat_200k`, `test_sft`, 256 conversaciones, inglés) | 238.748 | 0,076 | 1,11 | 91,3% |
| Árabe (`arbml/CIDAR`, 256 pares desde la fila 9.000) | 64.040 | 0,057 | 0,71 | 90,8% |

Rendimiento en vLLM 0.34.0 sobre una GPU NVIDIA Blackwell (compute capability 12.0) con kernel `MarlinNvFp4LinearKernel`:

| Métrica | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K vía completions API (flexible-extract) | 85,44 | 84,23 |
| Throughput, flujo único | 1,00x | 2,08x |
| Throughput, 8 concurrentes | 1,00x | 2,08x |
| Throughput, 32 concurrentes | 1,00x | 1,86x |

El throughput corresponde a generaciones greedy de 256 tokens fijos y variará en otro hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 8,01 GB; en vLLM con kernel FP4 la memoria de pesos se mantiene empaquetada, por lo que se puede servir con aproximadamente 10-12 GB de VRAM incluyendo caché KV (estimación orientativa, no publicada por el autor).
- En Transformers los pesos se expanden a 16 bits al cargar, por lo que la VRAM necesaria se aproxima a la del BF16 (~18 GB de pesos) y el ahorro es solo de disco y descarga.
- GPU recomendadas: NVIDIA Blackwell (compute capability 12.0) es la plataforma validada por el autor para el kernel `MarlinNvFp4LinearKernel` de vLLM. No se ha documentado el comportamiento en GPUs Hopper (H100) ni Ada (RTX 4090) en la información proporcionada.
- Cabe en GPU de consumo solo si se dispone de soporte de kernel FP4; no hay datos publicados al respecto.
- Opciones de despliegue: vLLM (recomendado, con `--trust-remote-code`) y Transformers con `compressed-tensors` instalado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,08x frente a BF16 en flujo único y 8 concurrentes, 1,86x con 32 concurrentes, medido en una estación de trabajo Blackwell con generaciones de 256 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PureTensorAI/Jais-3-7B-NVFP4A16 | ~9B (8,99B) | No disponible | Apache-2.0 | safetensors NVFP4A16 | Cuantización W4A16 del Jais-3-7B; ~2x throughput en vLLM sobre Blackwell |
| inception42/Jais-3-7B (BF16) | ~9B (8,99B) | No disponible | Apache-2.0 | safetensors BF16 | Modelo base de referencia; 18,00 GB, calidad ligeramente superior en MMLU |
| Otras cuantizaciones del mismo base | ~9B | No disponible | Apache-2.0 (presumible) | No disponible | No se dispone de datos publicados en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría (bilingües árabe-inglés de ~9B) en la documentación proporcionada.

## Limitaciones y advertencias

- En Transformers los pesos se expanden a 16 bits al cargar; la ganancia de velocidad solo se materializa en motores con kernel de pesos FP4, como vLLM.
- Una sola tirada de calibración, sin semillas repetidas. No se evaluaron seguridad, dialectos ni contexto largo sobre el modelo cuantizado.
- El autor advierte que las puntuaciones de benchmark pueden moverse uno o dos puntos entre calibraciones de la misma receta; la diferencia en MMLU es real para este archivo pero pequeña.
- Es necesario mantener el comportamiento por defecto del tokenizador: todo el texto de calibración y los benchmarks comienzan con el token de inicio de texto, que este tokenizador añade por defecto. El modelo de 0,9B de la misma familia, cuyo tokenizador no lo añade, falló completamente en prompts sin ese token al cuantizarse de la misma forma. No se ha probado este checkpoint sin el token de inicio de texto.
- Las filas de KL de árabe y chat comparten familia de dataset con los datos de calibración (filas distintas), por lo que esos valores son favorables; ArabicMMLU, MMLU y WikiText no están relacionados con la calibración.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; se heredan los del modelo base.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones comerciales adicionales conocidas.
- Release de prueba no afiliada ni respaldada por los autores del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/PureTensorAI/Jais-3-7B-NVFP4A16
- Modelo base: https://huggingface.co/inception42/Jais-3-7B
- Dataset de calibración árabe: https://huggingface.co/datasets/arbml/CIDAR
- Dataset de calibración inglés: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
