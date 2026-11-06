# Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-sft

## Resumen

El modelo `1pp-0.98b-v2-ua-rawanneal-sft` es un modelo de lenguaje de 981,5 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como escalón intermedio en una "escalera" de escalado controlado que estudia cómo distintas condiciones de preentrenamiento afectan al comportamiento del modelo final.

La arquitectura es un decoder estilo Llama de 24 capas con hidden size de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (GQA con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y ausencia de sesgos y de QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

Su relevancia es metodológica: forma parte de la escalera v2, que combina cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) con tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234), entrenando cada configuración desde cero sobre un flujo de datos alineado por paso. Esta variante concreta aplica un "raw anneal": parte del run base hasta el paso 16.902 (último paso a learning rate máximo) y ejecuta el cooldown sobre conversaciones 1PP en lugar de documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 981.545.472 (981,5 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; los pesos se publican en safetensors en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,0 GB); compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención de consultas agrupadas (12 cabezas de consulta y 4 de clave/valor), normalización RMSNorm y RoPE con base 10.000. Los embeddings de entrada y la capa de salida no están atados y no se emplean sesgos ni QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. El entrenamiento se realizó en bf16 con Megatron, usando el optimizador Muon (escalado por forma, learning rate matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas).

El preentrenamiento corresponde a la variante "raw anneal": el run base se entrena sobre los documentos originales de DCLM-edu durante los primeros 16.902 pasos y, en el cooldown (los últimos 1.877 de 18.779 pasos), se sustituyen los documentos por las conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre los turnos de usuario y asistente. Los corpora están alineados por paso, de modo que cada paso de cooldown contiene las conversaciones derivadas del documento que el run base vio en ese mismo paso. El lote global es de 512 secuencias × 4.096 tokens con enmascaramiento de atención entre documentos; el warmup es de 1.181 pasos, seguido de fase constante y decaimiento lineal hasta 1/100 en los últimos 1.877 pasos, con weight decay 0,1 y desviación típica de inicialización 0,0103. En total se cubren 39,38B posiciones de token, lo que equivale a 20,3 tokens de asistente por parámetro, la misma proporción que el resto de escalones de la escalera.

Posteriormente se aplica un SFT de una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. El SFT usa el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28 y lote global de 128 × 4.096 con decaimiento lineal a 1/10 tras un warmup del 3 %. La pérdida de validación reportada es de 1,638 sobre texto de asistente, 1,522 sobre texto de usuario y 3,021 sobre texto de documento (2.433 documentos reservados); la pérdida de SFT en conversaciones reservadas es de 1,975.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Conversación multiturno: el SFT se realizó sobre una mezcla mayoritariamente multiturno (98,5k conversaciones del track con citas de constitución).
- Alineación de seguridad básica: parte del SFT proviene de un conjunto específico de seguridad (`sp-sft-safety-180k`).
- Razonamiento y código: no se documentan evaluaciones específicas ni capacidades destacadas más allá de la generación de texto; el autor lo describe explícitamente como artefacto de investigación y no como asistente de propósito general.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Estudio de escalado controlado: el modelo sirve como escalón de 0,98B en la escalera v2, permitiendo comparar curvas de pérdida entre condiciones de preentrenamiento y semillas con el mismo flujo de datos alineado por paso. Es su uso principal y el previsto por el autor.
- Ablación de la condición de cooldown: al compararlo con `1pp-0.98b-v2-ua-sft` (run 1PP completo) y con `1pp-0.98b-v2-raw-base`, permite aislar el efecto de sustituir documentos por conversaciones en la fase de anneal, manteniendo el resto de hiperparámetros constante.
- Reproducibilidad de experimentos: las semillas 28, 42 y 1234 y los registros de Weights & Biases permiten replicar el entrenamiento y verificar la estabilidad de las conclusiones frente a la inicialización.
- Investigación sobre datos sintéticos conversacionales: el modelo se entrenó sobre conversaciones reescritas a partir de documentos educativos, por lo que es útil para estudiar cómo la reescritura conversacional afecta al aprendizaje en modelos pequeños.
- Fine-tuning académico con recursos limitados: con 981,5 M de parámetros y pesos en bf16 (unos 2 GB), cabe en una única GPU de consumo para experimentos de ajuste fino con LoRA o QLoRA.
- Evaluación de la fidelidad de la conversión de pesos: el autor verifica los pesos de Hugging Face contra el checkpoint de Megatron recalculando pérdidas de validación (diferencia absoluta de 0,0001), lo que lo convierte en un caso de referencia para pipelines de conversión Megatron → transformers.
- Generación de texto en inglés en entornos con restricciones de memoria: su tamaño reducido permite desplegarlo en CPU o en GPUs modestas para pruebas de formato ChatML y de parada en `<|im_end|>`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente (2.433 documentos reservados) | 1,638 |
| Texto de usuario | 1,522 |
| Texto de documento | 3,021 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,623 |
| SFT reservado (1.998 conversaciones, tokens de asistente) | 1,975 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | 1,9755 vs. 1,9754 (diferencia absoluta 0,0001) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 3 y 4 GB para secuencias de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB. El autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias y estarían sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo recientes con 6 GB o más.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI más allá de la compatibilidad declarada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-0.98b-v2-ua-rawanneal-sft` (este) | 981,5 M | 4.096 | Apache 2.0 | Artefacto de investigación; solo inglés; sin benchmarks públicos |
| `1pp-0.98b-v2-ua-sft` | 981,5 M (misma arquitectura) | 4.096 | Apache 2.0 | Run 1PP completo, sin variante raw anneal; comparación directa de condición |
| `1pp-0.98b-v2-raw-base` | 981,5 M (misma arquitectura) | 4.096 | Apache 2.0 | Run base sin cooldown sobre conversaciones; punto de partida del anneal |
| SmolLM2 (familia, 135M–1,7B) | 135 M–1,7 B | Hasta 8.192 en algunos tamaños | Apache 2.0 | Modelo de propósito general de Hugging Face; comparte tokenizador, pero con benchmarks publicados y soporte multilingüe |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y naturaleza del artefacto.

## Limitaciones y advertencias

- El propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB) y no como asistente de propósito general; no debería usarse en producción como chatbot.
- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo o conversaciones muy extensas.
- No se han publicado evaluaciones de sesgo, toxicidad, alucinación ni seguridad más allá de la inclusión de un conjunto de SFT de seguridad; se desconoce su comportamiento en dominios sensibles.
- El formato de chat no admite turno de sistema: los modelos nunca vieron uno, por lo que inyectar instrucciones de sistema puede degradar la calidad de las respuestas.
- Riesgo de alucinación no cuantificado; al ser un modelo de menos de 1B de parámetros, la tasa esperable es alta en tareas de conocimiento factual.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de benchmarks y de garantías de calidad hace desaconsejable su uso comercial directo.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se publican pesos cuantizados (GGUF, GPTQ, AWQ) ni recetas de despliegue probadas más allá de transformers y TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-sft
- Run 1PP completo (comparación): https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-sft
- Run base sin cooldown conversacional: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
