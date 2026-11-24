# Jeesup/svd-safety-l2_base_k0_a1p0_free_remove40

## Resumen

`svd-safety-l2_base_k0_a1p0_free_remove40` es un checkpoint de investigación publicado por el usuario Jeesup en Hugging Face que aplica compresión SVD-LLM sobre `meta-llama/Llama-2-7b-chat-hf`, con el objetivo declarado de eliminar un 40 % de los parámetros. No es un modelo nuevo entrenado desde cero, sino un derivado comprimido del Llama 2 Chat de 7 000 millones de parámetros, pensado para medir cómo afecta la compresión a la vez a la utilidad (perplejidad, tareas zero-shot) y a la seguridad (tasa de éxito de ataques de jailbreak y tasa de sobrerrechazo).

El interés del checkpoint es metodológico: el autor documenta explícitamente el pipeline de calibración (256 secuencias de WikiText, 2048 tokens, semilla 42), la recuperación mediante LoRA secuencial sobre los factores U y V con datos Alpaca-cleaned, y publica los ficheros de evaluación en bruto junto al modelo. Esto lo convierte en una pieza útil para estudiar la relación entre compresión, alineamiento y robustez frente a prompts adversarios, más que en un modelo listo para producción.

Arquitectura transformer decoder-only heredada de Llama 2 (6 738 415 616 parámetros reales en safetensors), pesos densos estándar tras plegar la factorización, licencia Llama 2 y ventana de contexto de 4096 tokens según la arquitectura base. El autor advierte de forma explícita que las mediciones no establecen idoneidad para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos densos tras plegar la factorización SVD-LLM |
| Parametros totales | 6 738 415 616 (dato real de safetensors); el presupuesto factorizado corresponde a un 40 % de eliminación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (arquitectura base Llama 2; no se especifica modificación) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (el modelo base Llama 2 está orientado principalmente a inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tamano del repo | 13,5 GB |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

El checkpoint parte de Llama 2 7B Chat: transformer decoder-only con atención multi-cabeza, RoPE y normalización RMSNorm, preentrenado y alineado por Meta. Sobre esa base se aplica compresión SVD-LLM, que descompone matrices de pesos y trunca rangos según un presupuesto de parámetros derivado de la forma de cada matriz, usando *activation whitening* para decidir el truncamiento. El objetivo declarado es eliminar el 40 % de los parámetros.

La calibración se realizó exclusivamente con 256 secuencias de WikiText de 2048 tokens cada una, semilla 42, sin añadir prompts de JBB ni respuestas de rechazo; el autor lo describe como la línea base con el código actual. La recuperación consiste en LoRA secuencial aplicado sobre los factores U y V, con datos Alpaca-cleaned y dos épocas por pasada de entrenamiento. Tras la recuperación, el checkpoint se pliega a pesos densos estándar de Transformers, de modo que la ratio de compresión describe el presupuesto de parámetros factorizados, no una reducción del tamaño de descarga. Los recuentos reales y los detalles de recuperación se registran en `compression.json`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste chat de Llama 2.
- Razonamiento de sentido común y respuesta a preguntas zero-shot (evaluado en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA).
- Aritmética básica y problemas tipo MathQA, con degradación esperable por la compresión.
- Comportamiento de rechazo alineado (evaluado con XSTest-safe y OR-Bench mediante el juez WildGuard).
- Robustez frente a prompts adversarios medida con AdvBench y StrongREJECT (juez HarmBench).
- Integración con `transformers` y con Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Investigación sobre compresión y alineamiento: comparar la tasa de éxito de jailbreak (AdvBench 0,2654; StrongREJECT 0,1853) y el sobrerrechazo (0,1245) frente al Llama 2 Chat sin comprimir para cuantificar cuánto degrada la compresión SVD-LLM la seguridad del modelo.
- Reproducción de experimentos: el repo incluye los ficheros de evaluación en bruto en `utility/` y `safety/`, lo que permite auditar cobertura del conjunto de prompts y fiabilidad de los jueces sin reejecutar la evaluación.
- Estudio de pipelines de recuperación LoRA sobre factores SVD: el checkpoint sirve como referencia de una configuración concreta (Alpaca-cleaned, dos épocas por pasada) para comparar con otras variantes de recuperación.
- Evaluación de perplejidad bajo compresión: con WikiText-2 en 11,3774, es un punto de comparación útil para medir la pérdida de calidad de otras técnicas de poda o factorización sobre el mismo modelo base.
- Análisis de sobrerrechazo en sistemas de moderación: los resultados de XSTest-safe y OR-Bench permiten estudiar si la compresión incrementa los rechazos indebidos en asistentes conversacionales.
- Docencia y experimentación con `transformers`: al estar en formato safetensors denso estándar, se puede cargar con `AutoModelForCausalLM` sin utilidades adicionales de factorización, lo que facilita ejercicios prácticos sobre modelos comprimidos.
- Base para estudios de cuantización posterior: al publicarse en precisión original, permite aplicar GPTQ, AWQ o GGUF y medir el efecto combinado de compresión de parámetros y cuantización.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Perplejidad WikiText-2 | 11,3774 |
| AdvBench ASR (juez HarmBench) | 0,265385 |
| StrongREJECT ASR (juez HarmBench) | 0,185304 |
| Sobrerrechazo macro (juez WildGuard) | 0,124469 |

El autor indica que la evaluación incluye siete tareas zero-shot (ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA), pero no se publican los valores numéricos de esas tareas en la información disponible. StrongREJECT se puntúa con el juez de HarmBench, no con su scorer nativo. Límite de generación: 512 tokens, sin topes de muestras de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para pesos, más caché KV y activaciones; con contexto completo de 4096 tokens conviene reservar 16-18 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos; en 4 bits, unos 4-5 GB (estimaciones a partir del recuento real de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor; RTX 4090 (24 GB) para fp16 con margen.
- Cabe en GPU de consumo: sí en RTX 4090 y RTX 3090 en fp16; en RTX 4080/4070 Ti (16 GB) y 4070 (12 GB) requiere cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` (formato nativo), Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Seguridad (ASR) | Licencia |
|---|---|---|---|---|---|
| svd-safety-l2_base_k0_a1p0_free_remove40 | 6 738 415 616 (presupuesto factorizado -40 %) | 4096 | 11,3774 | AdvBench 0,2654; StrongREJECT 0,1853 | llama2 |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6 738 415 616 | 4096 | no disponible en esta ficha | no disponible en esta ficha | llama2 |
| Otras variantes SVD-LLM de Llama 2 7B Chat de Jeesup | no disponible | 4096 | no disponible | no disponible | llama2 |
| Meta Llama 3 8B Instruct | 8 030 261 248 | 8192 | no disponible en esta ficha | no disponible en esta ficha | llama3 |

La comparación cuantitativa con el modelo base y con otras variantes del mismo autor no puede completarse con los datos disponibles; los valores de Llama 3 8B se incluyen solo como referencia de categoría (mismo orden de tamaño, contexto mayor y licencia distinta).

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor afirma que las mediciones no establecen idoneidad para despliegue en producción.
- La compresión del 40 % degrada la calidad; la perplejidad de 11,3774 en WikiText-2 debe contrastarse con la del modelo base antes de cualquier uso real.
- Riesgo de alucinación inherente a Llama 2 7B Chat, potencialmente agravado por la pérdida de capacidad asociada a la poda de rangos.
- La tasa de éxito de ataques adversarios (AdvBench 0,2654) indica que el alineamiento no es robusto; no debe usarse como barrera de seguridad sin capas adicionales de moderación.
- El sobrerrechazo del 0,1245 implica que el modelo rechaza peticiones legítimas en una proporción no trivial, lo que afecta a la experiencia conversacional.
- Idiomas soportados no documentados; el modelo base está orientado principalmente al inglés y la calibración se hizo con WikiText en inglés.
- La licencia Llama 2 Community License impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable) y no es una licencia de código abierto plena.
- La ratio de compresión no reduce el tamaño de descarga: el repo ocupa 13,5 GB porque los pesos están plegados a formato denso.
- No hay información sobre cuantizaciones publicadas ni sobre rendimiento medido de latencia o throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_base_k0_a1p0_free_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Ficheros de evaluación del autor: `utility/` y `safety/` dentro del repositorio del modelo
- Detalles de compresión: `compression.json` dentro del repositorio del modelo
