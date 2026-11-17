# Raghav-Singhal/1pp-0.98b-v2-filt-seed42-sft

## Resumen
El modelo `1pp-0.98b-v2-filt-seed42-sft` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un transformer decoder de estilo Llama con 981.545.472 parámetros (aproximadamente 0,98B), entrenado sobre el corpus crudo de 1PP (documentos DCLM-edu) y posteriormente sometido a un ajuste supervisado (SFT) sobre una mezcla de 400.000 conversaciones. Su propósito no es ser un asistente de uso general, sino servir como baseline "filtrado" dentro de una escalera de escalado que compara distintas condiciones de entrenamiento sobre el mismo flujo de datos.

La condición "Filtered" consiste en mantener en contexto los documentos marcados por un clasificador de seguridad (gte, puntuado por fragmento) pero sin aplicarles pérdida: 3.869.498 documentos (4,6%) quedaron marcados con una puntuación máxima de al menos 3. El resto de documentos se entrenan igual que en la ejecución cruda. De este modo, el modelo permite aislar el efecto del filtrado por pérdida frente al filtrado por eliminación de datos, manteniendo el empaquetado de secuencias byte a byte idéntico al de la ejecución de referencia.

Es relevante ahora porque forma parte de una comparativa controlada de recetas de preentrenamiento a escala sub-1B, con contexto de 4.096 tokens, optimizador Muon y un tokenizador basado en SmolLM2. Al estar publicado con licencia Apache 2.0 y pesos en safetensors, es reutilizable como punto de partida para experimentos de alineación y como referencia para estudiar el impacto del filtrado de datos con pérdida enmascarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones publicadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
La arquitectura es un decoder transformer denso de 24 capas con dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV (GQA con head dim 128), sin QK-norm ni biases, con embeddings de entrada y salida no atados. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos.

El preentrenamiento cubre 18.779 pasos sobre el flujo alineado por paso de la ejecución cruda (39,38B posiciones de token), con batch global de 512 × 4.096 tokens. Se usa el optimizador Muon (escalado por forma, LR matricial 0,005) junto con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La innovación metodológica es la condición "Filtered": los documentos marcados por el clasificador gte permanecen en las secuencias (en contexto) pero no contribuyen a la pérdida, mientras que el empaquetado de datos es idéntico al de la ejecución cruda. La pérdida de validación del modelo base es 2,507 sobre texto de documento, 2,646 sobre texto de asistente y 2,683 sobre texto de usuario.

El SFT se realiza durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas a constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se emplea la misma pila que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La pérdida de SFT en held-out es 2,056 sobre tokens de asistente (1.998 conversaciones reservadas).

## Capacidades
- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4.096 tokens.
- Seguimiento de instrucciones adquirido mediante SFT sobre mezclas con trazas de constitución y datos de seguridad.
- Generación de código y matemáticas a nivel básico, limitada por el tamaño del modelo y por la composición del corpus DCLM-edu.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso con planificación.
- Capacidades multilingües limitadas al inglés, según la etiqueta de idioma del modelo.
- No dispone de modo "thinking" explícito, visión, audio ni otras modalidades.

## Casos de uso
- Investigación sobre filtrado de datos: comparar este modelo con `1pp-0.98b-v2-raw-seed42-base` para medir el efecto de enmascarar la pérdida en documentos marcados por un clasificador de seguridad, manteniendo el mismo flujo de datos y el mismo número de pasos.
- Baseline de ablación en escaleras de escalado: usar el checkpoint como referencia sub-1B en experimentos que varíen la receta de SFT (LR, mezcla de datos, número de épocas) sin tocar el preentrenamiento.
- Estudio de alineación y seguridad: analizar cómo influye la mezcla `sp-sft-safety-180k` en las respuestas del modelo frente a documentos marcados como inseguros durante el preentrenamiento.
- Generación de texto controlada en inglés: prototipos de completado de documentos y conversación breve con prompts en formato ChatML, aprovechando la ventana de 4.096 tokens para contexto de varios turnos.
- Evaluación de recetas con Muon: reproducir el pipeline de entrenamiento (Muon + Adam selectivo, warmup y decaimiento concretos) como referencia para validar implementaciones del optimizador en modelos de ~1B.
- Docencia y experimentación académica: servir como modelo pequeño y abierto (Apache 2.0) para prácticas de fine-tuning y evaluación de pérdida en held-out sin requerir infraestructura de gran escala.
- Verificación de conversión de pesos: usar la comprobación publicada de pérdida HF frente a Megatron (2,0555 en segmentos [3, 4] de sft_val) como test de integridad al portar el modelo a otros frameworks.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Base, texto de documento | Pérdida por token | 2,507 |
| Base, texto de asistente | Pérdida por token | 2,646 |
| Base, texto de usuario | Pérdida por token | 2,683 |
| SFT, held-out (tokens de asistente) | Pérdida | 2,056 |
| SFT, sft_val segmentos [3, 4] | Pérdida HF vs. Megatron | 2,0555 vs. 2,0555 (diff. 0,0000) |

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2 GB solo para pesos (0,98B × 2 bytes), más caché KV y activaciones; en la práctica, entre 3 y 5 GB según longitud de contexto y batch.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto completo; A100, H100, L40S o RTX 4090 sobran para este tamaño y permiten batches grandes.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; al ser un modelo Llama estándar en safetensors, es convertible a GGUF para llama.cpp/Ollama y compatible con vLLM, aunque el autor no documenta estas rutas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-filt-seed42-sft | 981.545.472 | 4.096 | Apache 2.0 | Hugging Face (transformers, safetensors) | Baseline filtrado con SFT; pérdida SFT held-out 2,056 |
| 1pp-0.98b-v2-raw-seed42-base | No disponible (misma escala, ~0,98B) | 4.096 | No disponible en la información | Hugging Face | Ejecución cruda de referencia; misma receta sin filtrado por pérdida |
| SmolLM2 (familia, referencia por tokenizador) | No disponible en la información | No disponible en la información | No disponible en la información | Hugging Face | Comparte vocabulario de 49.152 tokens; no se aportan datos comparativos de rendimiento |

## Limitaciones y advertencias
- El propio autor indica que es un artefacto de investigación de EPFL DLAB y no un asistente de propósito general; no debe desplegarse como producto sin evaluación adicional.
- Solo soporta inglés; cualquier uso en otros idiomas queda fuera del alcance declarado.
- Ventana de contexto de 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a un modelo de ~1B entrenado sobre corpus educativo y ajustado con mezclas sintéticas; no se documentan evaluaciones de factualidad.
- Sesgos potenciales derivados del corpus DCLM-edu y de las mezclas de SFT, sin análisis publicado de sesgos.
- El filtrado por pérdida deja documentos marcados por el clasificador de seguridad dentro del contexto de entrenamiento; aunque no reciben gradiente, pueden influir en la distribución de contexto y en el comportamiento del modelo.
- No se documentan políticas de uso aceptable ni evaluaciones de seguridad más allá de la inclusión de `sp-sft-safety-180k` en el SFT.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de evaluación de riesgos desaconseja producción sin validación propia.
- No hay versiones cuantizadas ni artefactos GGUF publicados por el autor; la conversión corre por cuenta del usuario.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-filt-seed42-sft
- Modelo de referencia crudo: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
