# Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-sft

## Resumen

1pp-2.81b-v2-raw-seed1234-sft es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), un artefacto de investigación del laboratorio DLAB de la EPFL. No se trata de un asistente de propósito general, sino de un escalón (rung) dentro de una escalera de escalado (ladder v2) diseñada para estudiar experimentalmente el efecto de la composición de datos de preentrenamiento en el comportamiento del modelo. Concretamente, este checkpoint corresponde a la condición "documentos originales" (raw), semilla 1234, tras un ajuste supervisado (SFT).

La arquitectura es un decoder estilo Llama de 24 capas, dimensión oculta 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. Es un modelo monolingüe en inglés y se distribuye bajo licencia Apache 2.0 en formato safetensors compatible con transformers.

Su relevancia es metodológica más que de producto: forma parte de un conjunto de 36 modelos (cuatro tamaños × tres condiciones × tres semillas) entrenados desde cero sobre un flujo de datos alineado por pasos, lo que permite comparaciones controladas entre condiciones y semillas. El modelo fue re-entrenado en su fase SFT el 2026-11-21 tras detectar que la versión anterior colapsaba fuera del formato de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers; repositorio de 11,2 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder densa de estilo Llama, con 24 capas, atención multi-cabeza con 21 cabezas de consulta y 7 de clave/valor (GQA con ratio 3:1), normalización RMSNorm, activación SwiGLU en la FFN y RoPE con base 10.000. No emplea QK-norm ni sesgos, y los embeddings de entrada y salida no están atados. La longitud de secuencia durante el entrenamiento es de 4.096 tokens con enmascaramiento de atención entre documentos.

El preentrenamiento usa los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Este checkpoint cubre los primeros 53.709 pasos del flujo alineado por pasos de 1PP (112,64B posiciones de token), que corresponden a los primeros pasos del pase principal de 31.777 pasos del estudio. El lote global es de 512 × 4.096 tokens. El optimizador es Muon (con escalado por forma y LR de matriz 0,005) para las matrices, y Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100. Weight decay 0,1, desviación estándar de inicialización 0,0078 y precisión bf16. La pérdida de validación final sobre 2.433 documentos retenidos es de 2,307 sobre texto de documento, 2,478 sobre texto de asistente y 2,728 sobre texto de usuario.

El ajuste supervisado (SFT) se realizó durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó la misma pila que en el preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), con LR de matriz 0,001, semilla 28, lote global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida SFT retenida sobre tokens de asistente en 1.998 conversaciones es de 1,835. La verificación de los pesos HF contra el checkpoint de Megatron arroja una diferencia absoluta de 0,0000 en la pérdida de validación.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla ChatML sin turno de sistema.
- Respuesta a instrucciones y conversaciones multiturno, gracias al ajuste supervisado sobre una mezcla de 400.000 conversaciones.
- Razonamiento básico y respuesta a preguntas de conocimiento general (el autor reporta resultados en PIQA, ARC-Easy y TriviaQA cercanos a sus modelos hermanos).
- Generación de texto libre sobre documentos, ya que la condición de preentrenamiento usa documentos originales con pérdida sobre todos los tokens.
- Capacidad limitada de seguir el formato de chat: fuera de la plantilla ChatML el modelo puede producir respuestas sin sentido en hasta un 40% de los casos (según la puerta de validación del autor).
- No dispone de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido documentados.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: el modelo sirve como punto de comparación controlado frente a sus hermanos de la misma escalera (mismas semillas y condiciones), permitiendo aislar el efecto de la condición "documentos originales" en el comportamiento final.
- Estudios de reproducibilidad y escalado: al entrenarse desde cero con un flujo de datos alineado por pasos y tres semillas, es adecuado para analizar la varianza entre inicializaciones y validar hallazgos de scaling laws a escala de 2,81B parámetros.
- Evaluación de metodologías de SFT: la comparación entre la versión colapsada (LR 0,002) y la corregida (LR 0,001) permite estudiar el efecto de la tasa de aprendizaje en la estabilidad del ajuste fino y en la degradación fuera de distribución.
- Generación de texto condicionada a documentos en inglés: con 4.096 tokens de contexto y pérdida sobre documentos completos, puede emplearse en tareas de continuación o resumen de pasajes cortos en un entorno de investigación.
- Conversación de dominio acotado en inglés: útil como banco de pruebas para evaluar la calidad de respuestas de un modelo pequeño (2,8B) entrenado con una mezcla SFT específica, sin pretensiones de producción.
- Análisis de sesgos y seguridad: al incluir una muestra del conjunto `sp-sft-safety-180k`, puede utilizarse para estudiar cómo el filtrado de seguridad en el SFT afecta a las respuestas del modelo en comparación con sus variantes.
- Referencia para destilación o ajuste posterior: su licencia Apache 2.0 y su tamaño contenido permiten usarlo como base para experimentos académicos de fine-tuning adicional.

## Benchmarks y rendimiento

El autor no publica una tabla de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos numéricos reportados son pérdidas de validación y una verificación de pesos:

| Metrica | Valor |
|---|---|
| Pérdida de validación (documento, checkpoint final) | 2,307 |
| Pérdida de validación (texto de asistente) | 2,478 |
| Pérdida de validación (texto de usuario) | 2,728 |
| Pérdida SFT retenida (tokens de asistente, 1.998 conversaciones) | 1,835 |
| Diferencia HF vs. Megatron (pérdida validación SFT) | 0,0000 |
| PIQA / ARC-Easy / TriviaQA | cualitativamente "cercanos a sus modelos hermanos"; sin cifras publicadas |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 5,6 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 8 y 12 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 3 GB de pesos; en 4 bits, en torno a 1,5-2 GB (aunque el autor no publica variantes GGUF ni cuantizadas oficiales).
- GPU recomendadas para bf16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB); también cabe en GPUs consumer de 16 GB como RTX 4080 o 4060 Ti 16 GB con margen para contexto corto.
- Cabe en GPU consumer: sí, en RTX 4090, 4080, 3090 y modelos con 12-16 GB o más, especialmente con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp si se generan conversiones GGUF, aunque no están documentadas por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-seed1234-sft | 2,81B | 4.096 | Apache 2.0 | en | Artefacto de investigación; sin benchmarks estándar publicados |
| SmolLM2-1.7B (referencia por tokenizador) | 1,7B | 8.192 (según versión) | Apache 2.0 | en (multilingüe parcial) | Modelo de propósito general de Hugging Face; no es comparable en metodología |
| Llama 3.2 1B / 3B | 1,2B / 3,2B | 128k | Llama 3.2 Community License | multilingüe | Asistentes de propósito general con benchmarks publicados |
| Qwen2.5-3B | 3,1B | 32.768 | Apache 2.0 | multilingüe | Modelo de propósito general con benchmarks publicados |

La comparación directa con modelos de propósito general no es del todo justa: este checkpoint es un artefacto de investigación sin evaluación estándar publicada, por lo que su rendimiento en tareas de usuario final no está caracterizado más allá de las pérdidas de validación y de la puerta cualitativa del autor.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Fuera de la plantilla ChatML, el modelo puede producir respuestas sin sentido en hasta un 40% de las preguntas seguras (según la validación del autor); la versión anterior colapsaba completamente.
- El modelo nunca vio un turno de sistema; introducir uno puede degradar la calidad de las respuestas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Monolingüe en inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a un modelo de 2,8B sin RLHF ni evaluaciones de fidelidad publicadas.
- Sesgos potenciales derivados de DCLM-edu y de las mezclas SFT utilizadas; no se documentan auditorías de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su uso en producción sin una evaluación propia exhaustiva.
- El repositorio conserva en su historial los pesos de la versión SFT colapsada (LR 0,002); es importante fijar la revisión correcta al descargar.
- No se publican variantes cuantizadas oficiales ni plantillas de despliegue más allá de transformers y TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
