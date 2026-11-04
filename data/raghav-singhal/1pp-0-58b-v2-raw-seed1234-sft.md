# Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-sft

## Resumen

1pp-0.58b-v2-raw-seed1234-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como peldaño inferior de una escalera de escalado (ladder v2) que compara sistemáticamente distintas condiciones de preentrenamiento sobre datos de documentos originales frente a datos sintéticos o reescritos.

El modelo emplea una arquitectura decoder de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con SwiGLU y atención con 9 cabezas y 3 cabezas KV (GQA), con una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token de padding. Se entrenó desde cero sobre 23,29 mil millones de posiciones de token, equivalente a 20,3 tokens de asistente por parámetro, y posteriormente recibió un ajuste supervisado (SFT) sobre 400.000 conversaciones.

La relevancia del modelo es metodológica: forma parte de un conjunto de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de datos y tres semillas (28, 42 y 1234), todos entrenados sobre el mismo flujo de datos alineado por pasos. Esto permite aislar el efecto de la condición de datos y de la inicialización de parámetros con un control experimental poco habitual en modelos abiertos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, 24 capas, hidden 1.152, FFN 4.608 (SwiGLU), RMSNorm, RoPE base 10.000, sin QK-norm, sin biases, embeddings no atados |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ con herramientas estándar) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), repositorio de 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención de 9 cabezas y 3 cabezas KV (head dim 128, GQA), FFN SwiGLU de 4.608, RMSNorm, RoPE con base 10.000 y embeddings no atados. No incorpora QK-norm ni biases. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento usó los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`, y máscara de atención cruzada entre documentos. Se cubrieron los primeros 11.106 pasos del flujo alineado por pasos de 1PP (23,29B posiciones de token), con batch global de 512 × 4.096 tokens. El optimizador combina Muon (matrix LR 0,005 con shape scaling) para las matrices y Adam para el resto de parámetros (LR 3e-3 para embeddings, capa de salida y normas), con warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos retenidos fue de 2,615 sobre texto de documento y 2,801 sobre texto de asistente.

El SFT consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se empleó el mismo stack (Megatron, Muon), ChatML sin turno de sistema, pérdida solo en turnos de asistente, matrix LR 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida SFT retenida sobre tokens de asistente (1.998 conversaciones) fue de 2,189, verificada contra el checkpoint de Megatron con diferencia absoluta de 0,0000.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multi-turno dentro de la ventana de 4.096 tokens.
- Ajuste de estilo y contenido sobre la mezcla SFT, que incluye un track de constituciones citadas y un subconjunto de seguridad.
- Generación de código y matemáticas: no documentada explícitamente por el autor; el modelo no se presenta como especializado en estas tareas.
- Tool calling / function calling: no disponible; el modelo nunca vio un turno de sistema y no se documenta soporte de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Multilingüismo: limitado a inglés; el vocabulario SmolLM2 cubre otros idiomas pero el entrenamiento es monolingüe.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre escalado de datos de preentrenamiento: el modelo sirve como peldaño de 0,58B en la ladder v2 para comparar condiciones de datos (documentos originales frente a otras variantes) manteniendo constante el flujo de entrenamiento y la inicialización; se usa midiendo pérdida de validación por token sobre los mismos conjuntos retenidos.
- Réplica de experimentos de control de semilla: al existir las semillas 28, 42 y 1234 con idéntico orden de batches, permite estimar la varianza de inicialización en métricas de validación y en evaluaciones posteriores al SFT.
- Estudio de dinámica de SFT en modelos pequeños: con 400k conversaciones y pérdida documentada de 2,189, es un punto de referencia para analizar cómo el ajuste supervisado modifica la distribución de salida de un modelo preentrenado sobre documentos.
- Evaluación de seguridad en modelos de juguete: el subconjunto de seguridad de 30k conversaciones permite estudiar la transferencia de comportamientos de rechazo en un modelo de 0,58B y compararla con los peldaños superiores de la ladder.
- Prototipado de pipelines de evaluación de conversación: su plantilla ChatML sin sistema y sus tokens EOS bien definidos (`<|im_end|>` id 2, `<|endoftext|>` id 0) facilitan integrarlo en harnesses de evaluación automática sin adaptadores adicionales.
- Generación de texto controlada en entornos con recursos muy limitados: con 1,2 GB en bf16 y 580M de parámetros, puede ejecutarse en CPU o en GPU de gama baja para pruebas de formato, tokenización y plantillas, aunque no está pensado como asistente de producción.
- Docencia y experimentación con optimizadores: el uso de Muon junto a Adam con hiperparámetros publicados lo convierte en un caso reproducible para estudiar estabilidad de entrenamiento a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación preentrenamiento (2.433 documentos retenidos) | Pérdida por token, texto de asistente | 2,801 |
| Validación preentrenamiento (2.433 documentos retenidos) | Pérdida por token, texto de usuario | 2,802 |
| Validación preentrenamiento (2.433 documentos retenidos) | Pérdida por token, texto de documento | 2,615 |
| Validación preentrenamiento (condición raw_doc_eod(8+5)) | Pérdida ponderada por share de entrenamiento | 2,616 |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 2,189 |

No se reportan MMLU, HumanEval, GSM8K ni evaluaciones de generación abierta.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, menos de 3 GB para secuencias de 4.096 tokens.
- VRAM estimada en fp16/bf16 con batch pequeño: 2-3 GB; en cuantización de 8 bits, en torno a 0,7-1 GB; en 4 bits, en torno a 0,4-0,6 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 3060, RTX 4090) es suficiente; para serving con concurrencia, A10G, L4 o A100 con vLLM.
- Cabe holgadamente en GPU consumer y también en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; conversión a GGUF para llama.cpp u Ollama no está publicada pero es factible con las herramientas estándar.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-raw-seed1234-sft | 580M | 4.096 | en | Apache 2.0 | Artefacto de investigación, sin benchmarks publicados |
| SmolLM2-360M | 360M | 8.192 (según model card pública) | en y multilingüe | Apache 2.0 | Asistente generalista con benchmarks publicados; contexto mayor |
| Qwen2.5-0.5B | 494M | 32.768 (según model card pública) | multilingüe | Apache 2.0 | Asistente generalista, soporte de tool calling y contexto mucho mayor |
| Llama 3.2-1B | 1.240M | 131.072 (según model card pública) | multilingüe | Llama 3.2 Community License | Asistente generalista con contexto muy superior y restricciones de licencia |

La comparación relevante para este modelo no es de rendimiento en tareas, sino de propósito: los tres alternativos son asistentes generalistas con evaluaciones publicadas, mientras que 1pp-0.58b es un control experimental con contexto corto y sin benchmarks. Para cualquier uso de producción, los alternativos son preferibles; para reproducibilidad experimental, este modelo ofrece un diseño controlado que los otros no tienen.

## Limitaciones y advertencias

- El propio autor lo describe como artefacto de investigación y no como asistente de propósito general; no debe desplegarse en producción orientada a usuarios.
- No se han publicado benchmarks de calidad, seguridad ni sesgos; el rendimiento real en tareas downstream es desconocido.
- Ventana de contexto de solo 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenamiento monolingüe en inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será pobre.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducir uno puede degradar el formato de salida.
- Riesgo de alucinación elevado por tamaño y por el dominio de preentrenamiento (DCLM-edu), con posible sesgo hacia registro académico y enciclopédico.
- El SFT incluye un subconjunto de seguridad de 30k conversaciones, pero no se documenta ninguna evaluación de alineación o de tasas de rechazo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluaciones hace desaconsejable dicho uso sin una validación propia exhaustiva.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado más allá de la model card.
- La verificación de pesos solo cubre la pérdida SFT en un segmento; no hay verificación de comportamiento generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multi-turno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
