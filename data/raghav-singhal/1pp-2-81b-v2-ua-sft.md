# Raghav-Singhal/1pp-2.81b-v2-ua-sft

## Resumen

1pp-2.81b-v2-ua-sft es un modelo de lenguaje de 2.807 millones de parámetros publicado por Raghav-Singhal como parte del proyecto One Persona Pretraining (1PP), un artefacto de investigación del laboratorio DLAB de la EPFL. No es un asistente de propósito general: se trata de un modelo de escala ("scaling ladder") diseñado para estudiar cómo afectan las condiciones de preentrenamiento a las propiedades del modelo final. En concreto, esta variante corresponde a la condición "rewritten conversations, user+assistant loss" con semilla 28, y ha pasado por un proceso de ajuste supervisado (SFT) sobre 400.000 conversaciones.

El modelo emplea una arquitectura decoder estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000 y embeddings no atados. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`.

La relevancia de este modelo es metodológica más que práctica: forma parte de una matriz de 4 tamaños (0,58B, 0,98B, 1,66B y 2,81B) × 3 condiciones × 3 semillas, todos entrenados desde cero sobre el mismo flujo de datos alineado por pasos, con 20,3 tokens de asistente por parámetro. Esto permite aislar el efecto de la condición de preentrenamiento y de la inicialización de parámetros en el comportamiento final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 2.807.699.328 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 24 capas con atención multi-cabeza agrupada (21 cabezas de consulta y 7 de clave/valor, dimensión de cabeza 128), FFN SwiGLU de 10.752 unidades, normalización RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida no atados. No incorpora biases ni QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre las conversaciones 1PP reescritas a partir de los documentos originales, con pérdida tanto en los turnos de usuario como de asistente (condición "user+assistant loss"). Se entrenaron los primeros 53.709 pasos del flujo alineado por pasos de 1PP, lo que equivale a 112,64B posiciones de token, con batch global de 512 × 4.096 tokens y máscara de atención entre documentos. El optimizador combina Muon (escalado por forma, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, desviación típica de inicialización 0,0078 y precisión bf16. La pérdida de validación final sobre 2.433 documentos retenidos fue de 1,351 en texto de asistente, 1,269 en texto de usuario y 3,044 en texto de documento.

El SFT consistió en una época sobre una mezcla de 400.000 conversaciones: 98.500 multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft` (pista con citas a constitución), 271.600 de `dlab-spp/sp-sft-normal-300k` tras eliminar duplicados del primer conjunto, y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se empleó el mismo stack que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,001, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida SFT retenida sobre 1.998 conversaciones fue de 1,734 en tokens de asistente, y los pesos de Hugging Face se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0000 en esa métrica.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Diálogo multiturno, entrenado explícitamente sobre conversaciones multiturno y con pérdida en turnos de usuario y asistente durante el preentrenamiento.
- Seguimiento de formato de chat mediante la plantilla `chat_template` incluida, que renderiza exactamente el formato visto en entrenamiento.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- Razonamiento y código: no se documentan capacidades específicas ni evaluaciones en estas áreas.
- Tool calling / function calling: no documentado ni entrenado explícitamente.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio de ablación de condiciones de preentrenamiento: el modelo sirve como punto de la matriz 4 tamaños × 3 condiciones × 3 semillas para medir el efecto de la condición "rewritten conversations, user+assistant loss" frente a las otras dos condiciones, manteniendo constante el flujo de datos y variando solo el texto de los documentos y la máscara de pérdida.
- Análisis de escalado ("scaling ladder"): al estar entrenado con 20,3 tokens de asistente por parámetro y compartir flujo de datos alineado por pasos con los otros tamaños (0,58B, 0,98B, 1,66B), permite trazar curvas de pérdida y comportamiento frente al número de parámetros.
- Réplica de experimentos de investigación: la verificación entre pesos HF y checkpoint Megatron (diferencia 0,0000 en pérdida de validación) facilita reproducir los resultados del estudio principal con los pesos publicados.
- Evaluación de la influencia de la semilla: al existir variantes con semillas 28, 42 y 1234 que solo difieren en la inicialización de parámetros (mismo orden de batches), el modelo permite medir la varianza entre semillas en métricas de validación y generación.
- Generación de conversaciones sintéticas en inglés para experimentos controlados: su entrenamiento sobre conversaciones reescritas con pérdida en ambos turnos lo hace adecuado para producir diálogos de referencia en entornos de investigación, no para producción.
- Análisis de la mezcla de SFT: al estar ajustado sobre una mezcla documentada (model-raising, sp-sft-normal y sp-sft-safety), permite estudiar el efecto de cada subconjunto en la pérdida retenida y en el comportamiento conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación preentrenamiento (2.433 documentos) | Pérdida por token, texto de asistente | 1,351 |
| Validación preentrenamiento (2.433 documentos) | Pérdida por token, texto de usuario | 1,269 |
| Validación preentrenamiento (2.433 documentos) | Pérdida por token, texto de documento | 3,044 |
| Validación preentrenamiento (2.433 documentos) | Pérdida en tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,350 |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 1,734 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | Pérdida HF / referencia / diferencia absoluta | 1,7340 / 1,7340 / 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (tamaño del repo), más activaciones y caché KV; en la práctica se recomienda reservar al menos 8-10 GB para contexto completo de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 2,8-3 GB de pesos; en 4 bits: alrededor de 1,4-1,8 GB. No se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10, A100, H100). Para bf16 con contexto completo, una RTX 4090 o A100 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en cuantización de 4-8 bits en tarjetas de 6-8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama/vLLM si se generan conversiones GGUF o se carga el checkpoint safetensors, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-sft | 2,81B | 4.096 | Apache 2.0 | Hugging Face (transformers, safetensors) | Artefacto de investigación 1PP, solo inglés, sin benchmarks publicados |
| 1pp-1.7b-* (escalón 1,66B del mismo estudio) | 1,66B | 4.096 | Apache 2.0 | Colección 1pp en Hugging Face | Mismo flujo de datos y condiciones; permite comparación directa de escalado |
| SmolLM2 (1,7B) | 1,7B | 8.192 (según versión) | Apache 2.0 | Hugging Face | Comparte vocabulario (49.152) con este modelo; asistente de propósito general con benchmarks publicados |
| Llama 3.2 1B/3B | 1,2B / 3,2B | 128K | Llama 3.2 Community License | Hugging Face, Ollama, vLLM | Asistente generalista multilingüe con tool calling; licencia con restricciones de uso comercial |

La comparación con SmolLM2 y Llama 3.2 es únicamente orientativa por tamaño y licencia: este modelo no es un asistente de propósito general y no publica resultados en MMLU, HumanEval, GSM8K ni similares, por lo que no es posible una comparación de rendimiento directa.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un asistente de propósito general; no debe desplegarse en producción como tal.
- Idioma: solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Contexto limitado a 4.096 tokens, inferior al de asistentes generalistas contemporáneos.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, lo que impide estimar su calidad real frente a alternativas.
- Sin turno de sistema: el modelo nunca vio un turno de sistema durante el entrenamiento; introducirlo puede degradar el comportamiento.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo pequeño entrenado sobre conversaciones reescritas, es esperable un riesgo alto en conocimiento factual.
- Sesgos: no se documentan análisis de sesgo; la mezcla de SFT incluye un subconjunto de seguridad (`sp-sft-safety-180k`) pero no se reportan evaluaciones de alineamiento o toxicidad.
- Licencia Apache 2.0: permite uso comercial, pero al no ser un asistente generalista y carecer de evaluaciones, el uso comercial no está respaldado por garantías de calidad.
- Reproducibilidad: la verificación HF vs Megatron solo cubre la pérdida de validación SFT, no el comportamiento generativo.
- Fecha de creación del repositorio (2026-11-06) y cero descargas/likes: ecosistema mínimo, sin conversiones GGUF ni integraciones de terceros documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
