# ishikaa/acquisition_student_original_combine_WGM_MP_q3_gemma9b_5000

## Resumen

`ishikaa/acquisition_student_original_combine_WGM_MP_q3_gemma9b_5000` es un checkpoint de la familia Gemma 2, publicado en Hugging Face por el usuario `ishikaa`. A pesar del nombre, que sugiere un proceso de destilación o adquisición de conocimiento ("acquisition_student"), no existe documentación técnica que confirme esa interpretación: la model card es la plantilla automática de `transformers` sin ningún apartado cumplimentado. El modelo se distribuye con la arquitectura declarada `gemma2`, licencia no especificada y sin idiomas declarados.

El dato más fiable disponible es el recuento real de parámetros en los pesos `safetensors`: 9.241.705.984 parámetros (aproximadamente 9,2 mil millones), lo que lo sitúa en la horquilla de Gemma 2 9B. El repositorio ocupa 18,5 GB, coherente con pesos en precisión de 16 bits (bf16/fp16). El sufijo `q3` del nombre apunta a una posible cuantización de 3 bits, pero el tamaño del repo no respalda esa hipótesis, por lo que debe tratarse como un identificador sin verificar.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint de la familia Gemma 2 con un origen no aclarado; por otro, sirve de advertencia sobre modelos publicados sin model card, sin licencia explícita y sin evaluación, que no deberían usarse en producción sin auditoría previa. No hay información pública sobre el dataset de entrenamiento, el proceso de ajuste ni los resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma2 (familia Gemma 2, transformer decoder-only) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE según los tags) |
| Longitud de contexto | no disponible (Gemma 2 9B soporta hasta 8.192 tokens en su versión canónica, no confirmado en este checkpoint) |
| Tipos de cuantizacion | no disponible (el sufijo `q3` del nombre no está verificado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 18,5 GB |
| Pipeline | text-generation |
| Tags | transformers, safetensors, gemma2, text-generation, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura declarada en los tags es `gemma2`, es decir, un transformer decoder-only de la familia Gemma 2 de Google. Gemma 2 introduce en sus versiones canónicas innovaciones como atención con ventana deslizante alternada (sliding-window attention intercalada con atención global), normalización RMSNorm con pre y post-normalización, y activaciones GeGLU. No obstante, no hay confirmación de que este checkpoint conserve esas características ni de que sea un ajuste directo de Gemma 2 9B.

No se dispone de información sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o SFT. El nombre del repositorio (`acquisition_student_original_combine_WGM_MP_q3_gemma9b_5000`) sugiere un experimento de destilación o de combinación de pesos ("combine", "WGM", "MP") sobre una base Gemma 9B, con un paso de cuantización a 3 bits ("q3") y posiblemente 5.000 pasos de entrenamiento ("5000"). Todo ello es especulación a partir del identificador: no hay model card, paper ni blog que lo respalde.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y el pipeline `text-generation`.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, lo que permite desplegarlo en infraestructura de Hugging Face Inference Endpoints.
- Capacidades concretas de razonamiento, código, matemáticas o tool calling: no disponibles (no documentadas).
- Soporte multilingüe: no disponible (no se declaran idiomas).
- Modo de pensamiento, visión, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Experimentación e investigación: el modelo puede cargarse con `transformers` para reproducir o auditar el checkpoint, compararlo con Gemma 2 9B canónico y determinar qué cambió respecto al original.
- Evaluación de checkpoints sin model card: sirve como caso de estudio para pipelines internos de validación que detecten modelos sin licencia, sin idiomas declarados y sin benchmarks antes de aprobarlos.
- Generación de texto conversacional en prototipos cerrados: dado el tag `conversational`, puede probarse en demos internas de chat, siempre con revisión humana y sin exposición pública.
- Despliegue en Hugging Face Inference Endpoints: la compatibilidad declarada con `endpoints_compatible` y `text-generation-inference` permite levantar un endpoint gestionado para pruebas de latencia y throughput.
- Base para ajuste fino supervisado: al ser un transformer de 9,2B en safetensors, puede recibir SFT o LoRA en dominios concretos, aunque la licencia indeterminada impide confirmar si el uso comercial está permitido.
- Comparación de técnicas de compresión: si el sufijo `q3` se confirma, el checkpoint puede usarse para medir la degradación de calidad de una cuantización a 3 bits frente a los pesos originales en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 18,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB para contextos cortos y 40-48 GB para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB. En consumer, RTX 4090 (24 GB) puede alojar los pesos en bf16 con contextos moderados; RTX 3090 (24 GB) queda al límite.
- Si el checkpoint está realmente cuantizado a 3 bits (no verificado), los pesos ocuparían en torno a 3,5-4 GB y cabrían en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070, etc.), pero el tamaño del repo (18,5 GB) no lo respalda.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag), Hugging Face Inference Endpoints (tag `endpoints_compatible`). No hay confirmación de soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`ishikaa/...gemma9b_5000`) | 9,24B | no disponible | no disponible | Hugging Face, safetensors | Sin model card ni evaluación |
| Gemma 2 9B (Google) | 9,24B | 8.192 tokens | Gemma Terms of Use | Hugging Face, Kaggle | Modelo canónico con benchmarks publicados |
| Llama 3.1 8B (Meta) | 8,03B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, Meta | Contexto mucho mayor, amplia adopción |
| Mistral 7B v0.3 (Mistral AI) | 7,24B | 32.000 tokens | Apache 2.0 | Hugging Face | Licencia permisiva, buen rendimiento por tamaño |

La comparación con Gemma 2 9B es la más directa por número de parámetros y arquitectura declarada; sin embargo, este checkpoint no aporta evidencia de conservar las capacidades del original. Frente a Llama 3.1 8B y Mistral 7B, la diferencia principal es la falta de documentación y de licencia clara, no el tamaño.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no disponible: no se puede asumir uso comercial permitido; la licencia de Gemma 2 original (Gemma Terms of Use) no se hereda automáticamente si el checkpoint es un derivado no autorizado.
- Riesgo de alucinación: desconocido, pero al no haber evaluación no puede descartarse un comportamiento degradado respecto a Gemma 2 9B.
- Idiomas no declarados: no hay garantía de soporte multilingüe ni de calidad en castellano.
- Contexto no confirmado: no se puede asumir la ventana de 8.192 tokens de Gemma 2 9B sin verificar la configuración del checkpoint.
- Sufijo `q3` no verificado: el tamaño del repo (18,5 GB) es incompatible con una cuantización real a 3 bits; el nombre puede ser engañoso.
- Origen incierto: el nombre sugiere destilación o combinación de pesos, prácticas que pueden violar los términos de uso del modelo base.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.
- No apto para producción sin auditoría previa de pesos, licencia y comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishikaa/acquisition_student_original_combine_WGM_MP_q3_gemma9b_5000
- Gemma 2 (modelo base de referencia): https://huggingface.co/google/gemma-2-9b
- Documentación de Gemma 2 en Google: https://ai.google.dev/gemma/docs/gemma-2
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
