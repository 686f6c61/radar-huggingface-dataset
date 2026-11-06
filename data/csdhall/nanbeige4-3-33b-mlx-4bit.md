# csdhall/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una conversión comunitaria del modelo Nanbeige/Nanbeige4.3-33B al formato MLX en cuantización afín de 4 bits con tamaño de grupo 64, realizada por el usuario csdhall. El modelo original es un transformer denso de 33.118.977.024 parámetros (33,1 mil millones) desarrollado por Nanbeige, orientado a generación de texto y conversación, con soporte para inglés y chino. Esta variante está pensada específicamente para ejecución local en Apple Silicon mediante la librería MLX.

La relevancia de esta conversión radica en que reduce el peso del checkpoint BF16 original a aproximadamente 18,65 GB, lo que permite ejecutar un modelo de 33B en equipos Mac con memoria unificada alta (el autor validó con 128 GiB). El modelo base anuncia una longitud de contexto de 524.288 tokens, aunque el propio autor de la conversión advierte que la operación a esa longitud no está verificada y que solo se probaron capacidades de 16.384, 32.768 y 65.536 tokens.

La licencia declarada es Apache-2.0, heredada del modelo fuente. Esta ficha describe tanto las características del modelo base como las particularidades y limitaciones específicas de esta conversión cuantizada para MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (según tags: llama; detalles del modelo base no disponibles) |
| Parámetros totales | 33.118.977.024 (33,1B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens anunciados por el modelo fuente; operación no verificada más allá de 65.536 tokens en esta conversión |
| Tipos de cuantización | 4 bits afín (affine), group size 64 (esta variante); el modelo fuente está en BF16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), ~18,65 GB |

## Arquitectura y entrenamiento

Esta variante es una cuantización afín de 4 bits con tamaño de grupo 64, generada directamente desde el checkpoint oficial BF16 de Nanbeige/Nanbeige4.3-33B (revisión `c1093c501cc6460427c0ac634db7223d0450c0ee`). No se partió de una cuantización de menor precisión ni se aplicó fine-tuning: la conversión es puramente de compresión de pesos. Los safetensors BF16 originales siguen disponibles en el repositorio del editor.

No se dispone de información detallada sobre la arquitectura interna del modelo base (tipo de atención, número de capas, dimensión oculta) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. Los tags de Hugging Face indican la familia "llama", lo que sugiere una arquitectura transformer decoder-only estándar, pero este dato no se confirma con documentación técnica del editor. El autor de la conversión declara que las pruebas de validación en Metal de Apple cubrieron corrección, paridad de tokenizador, comparaciones numéricas frente a BF16 nativo y pruebas de recuperación en capacidades de 16.384, 32.768 y 65.536 tokens, usando cachés KV en BF16 sin caché deslizante ni rotatoria.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento y respuesta a instrucciones (pipeline text-generation, tag conversational).
- Soporte de plantilla de chat incluida en el repositorio (chat template).
- Ejecución local en Apple Silicon mediante MLX y mlx-lm.
- Capacidad de contexto largo teórica de hasta 524.288 tokens (no verificada en esta conversión).
- No se documentan capacidades de visión, audio, tool calling ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistencia conversacional local en Mac: el modelo puede gestionar diálogos multi-turno en inglés y chino ejecutándose íntegramente en un Mac con memoria unificada suficiente (validado con 128 GiB), sin depender de servicios en la nube.
- Procesamiento de documentos largos en chino e inglés: con la ventana de contexto anunciada de 524.288 tokens, aunque en la práctica conviene limitarse a los 65.536 tokens validados, se pueden resumir o analizar contratos, informes o artículos extensos.
- Prototipado de aplicaciones de IA en entornos Apple: desarrolladores que quieran probar un modelo de 33B en Xcode o scripts Python con MLX sin GPU dedicada.
- Generación de texto creativo y redacción bilingüe: artículos, correos y contenido marketing en inglés y chino con un modelo de tamaño medio-grande.
- Investigación sobre cuantización: esta variante sirve como referencia para estudiar la degradación de calidad de una cuantización 4-bit afín frente al BF16 original en tareas de recuperación y generación.
- Extracción de información y preguntas sobre corpus: tareas de question answering sobre bases documentales bilingües ejecutadas localmente por motivos de privacidad.
- Evaluación de despliegues MLX en producción interna: equipos que quieran estandarizar inferencia en Mac Studio o MacBook Pro con memoria unificada alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión solo documenta pruebas de validación internas (corrección, paridad de tokenizador, comparación numérica frente a BF16 y pruebas de recuperación a 16.384, 32.768 y 65.536 tokens) sin cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM/memoria unificada: el payload pesa ~18,65 GB, pero el autor advierte que el requisito real de memoria unificada es mayor por el sistema operativo, la caché KV y los buffers del runtime. Validado en un Mac con 128 GiB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada alta (Mac Studio, MacBook Pro con chip Max/Ultra). No se ha probado MLX CUDA, por lo que no hay recomendación validada para GPU NVIDIA.
- ¿Cabe en GPU de consumo? En GPUs NVIDIA de consumo no está validado (MLX CUDA no probado). En Apple Silicon, sí en configuraciones de memoria unificada alta.
- Opciones de despliegue: MLX 0.32.4 y mlx-lm 0.32.2 (versiones validadas); comando `python -m mlx_lm.generate`. No aplica el parche de llama.cpp para GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/plataforma |
|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-4bit (esta variante) | 33,1B | 524.288 anunciados (65.536 validados) | Apache-2.0 | MLX 4-bit, Apple Silicon |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1B | 524.288 anunciados | Apache-2.0 | BF16 safetensors |
| Alternativas de ~30B en MLX | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada. La comparación más directa y fiable es con el checkpoint BF16 original del que deriva esta conversión.

## Limitaciones y advertencias

- La operación a 524.288 tokens no está verificada; el autor solo validó hasta 65.536 tokens. Contextos mayores requieren pruebas de viabilidad y calidad independientes.
- Es una conversión comunitaria, no una release oficial del editor; no constituye una certificación de seguridad de comportamiento.
- La cuantización 4-bit puede degradar la calidad frente al BF16 original; el autor documenta comparaciones numéricas pero no benchmarks downstream exhaustivos.
- Riesgo de respuestas inexactas o sesgadas inherente al modelo base; no se ha auditado el dataset de entrenamiento original.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- Requiere versiones específicas de software (MLX 0.32.4, mlx-lm 0.32.2); otras versiones no están validadas.
- No se ejecutó código generado ni acciones reales de herramientas durante la validación.
- La licencia Apache-2.0 la declara el editor del modelo fuente; conviene revisar `LICENSE` y `conversion_NOTICE.txt` del repositorio.
- El repositorio puede aparecer antes de completarse la subida de pesos; verificar la integridad con `conversion_manifest.json` (SHA-256 y tamaño de cada archivo).

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/csdhall/Nanbeige4.3-33B-MLX-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Revisión concreta del modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
