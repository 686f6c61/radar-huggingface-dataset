# leobo09263013/qwen25

## Resumen

Qwen2.5-VL-7B — AURA CE es un ajuste fino completo (full fine-tuning) del modelo multimodal Qwen2.5-VL-7B-Instruct, publicado por el usuario leobo09263013 en Hugging Face. El modelo parte de la revisión `6e6556e8ce728c7b3e438d75ebf04ec93403dc19` del modelo base de Qwen y se ha entrenado durante una época con el objetivo AURA de selección de respuestas y entropía cruzada ponderada, descrito en el propio repositorio.

La intervención sobre el modelo base es acotada: solo se entrena el modelo de lenguaje, mientras que la torre de visión y el proyector multimodal permanecen congelados. Se añade un token especial `<|silent|>` (ID 151665) que representa respuestas silenciosas intencionales del asistente, y que permanece visible al decodificar con `skip_special_tokens=True`. El resultado es un checkpoint de inferencia listo para Transformers, no un modelo nuevo desde cero.

Es relevante porque documenta una receta reproducible de ajuste fino sobre un VLM de 7B con un objetivo de pérdida personalizado (AURA), orientado a modelar respuestas silenciosas o abstenciones. No obstante, el autor no ha publicado evaluación en held-out, por lo que su rendimiento real frente al modelo base está por determinar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL: torre de visión + proyector + LLM decoder) |
| Parametros totales | 848.896 (según safetensors; corresponde a los tensores del checkpoint, no al recuento completo del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura estándar de Qwen2.5-VL: una torre de visión, un proyector multimodal que alinea representaciones visuales con el espacio del lenguaje y un decoder tipo transformer. En este ajuste solo se actualizan los pesos del modelo de lenguaje; la torre de visión y el proyector quedan congelados. El entrenamiento se realizó con BF16, FlashAttention 2 y DeepSpeed ZeRO-3 sobre 32 GPUs, con batch por dispositivo 1, acumulación de gradiente 2 y batch global 64.

El conjunto de entrenamiento son 174.618 muestras retenidas de una mezcla de diez fuentes denominada AURA, excluyendo ejemplos completos de más de 15.000 tokens. Se ejecutó una época con 2.729 pasos de optimizador, learning rate 1e-5, schedule coseno, warmup ratio 0.1 y semilla 42. El muestreo de vídeo fue a 1 FPS con un máximo de 30 fotogramas por vídeo y un presupuesto de píxeles de 301.056 para imagen y vídeo. La innovación técnica principal es el objetivo AURA: en muestras con respuestas silenciosas se retienen los tramos silenciosos y el tramo final no silencioso, y los tokens silenciosos retenidos reciben un peso de 1 dividido por su recuento en el micro-batch; las muestras sin tokens silenciosos usan entropía cruzada ordinaria. No se empleó focal loss. La pérdida de entrenamiento del paso final fue 0,5704, con media de los últimos 100 pasos de 0,581653 y media global de 0,634191.

## Capacidades

- Generación de texto conversacional multimodal a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Comprensión de vídeo con muestreo a 1 FPS y hasta 30 fotogramas por vídeo.
- Razonamiento visual y respuesta a preguntas sobre imágenes, heredado de Qwen2.5-VL-7B-Instruct.
- Emisión del token `<|silent|>` como respuesta silenciosa intencional, manejable de forma explícita por aplicaciones posteriores.
- Soporte multilingüe limitado a inglés y chino según la model card.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no documentadas en la información proporcionada (se heredan, en su caso, del modelo base).
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Moderación con abstención explícita: el token `<|silent|>` permite que el modelo exprese "no responder" de forma estructurada, útil en pipelines donde una respuesta vacía debe distinguirse de un fallo, manejando el token en la capa de aplicación.
- Análisis de imágenes en documentación técnica: al conservar la torre de visión de Qwen2.5-VL, puede describir capturas, diagramas y figuras en flujos de revisión automatizada.
- Procesamiento de vídeo de vigilancia o monitorización: el muestreo a 1 FPS con hasta 30 fotogramas encaja en resúmenes de clips cortos de hasta 30 segundos.
- Asistentes conversacionales bilingües inglés-chino: adecuado para productos dirigidos a esos dos mercados, no para castellano sin evaluación adicional.
- Investigación sobre objetivos de pérdida: el repositorio incluye `aura_loss.py` y `training_summary.json`, lo que lo convierte en una referencia para reproducir el entrenamiento con AURA CE.
- Fine-tuning posterior: al ser un checkpoint completo en safetensors con Transformers 4.57.1, sirve como punto de partida para nuevos ajustes con el mismo objetivo, adjuntando explícitamente el hook de AURA.
- Prototipado de sistemas que requieren decidir cuándo no responder: útil en atención al cliente o asistentes médicos preliminares donde la abstención es preferible a una respuesta inventada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación final no se ha ejecutado y que las métricas reportadas (pérdida de entrenamiento de 0,5704 en el paso final) son métricas de entrenamiento, no puntuaciones de evaluación en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16-17 GB solo para pesos (el repositorio ocupa 16,6 GB), más memoria para activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con `device_map="auto"`.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con cuidado en la longitud de contexto; en GPUs de 16 GB requeriría cuantización, no documentada en el repositorio.
- Opciones de despliegue: Transformers (probado con 4.57.1 y PyTorch 2.6.0), text-generation-inference (según tags del repositorio) y endpoints compatibles; no se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| leobo09263013/qwen25 (AURA CE) | 848.896 tensores en safetensors (base 7B) | no disponible | imagen-texto y vídeo | apache-2.0 | no (solo pérdida de entrenamiento) |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | no disponible en la información | imagen-texto y vídeo | apache-2.0 | sí, según el autor del modelo base |
| Qwen2.5-VL (serie) | 3B, 7B, 72B (según colección) | no disponible en la información | imagen-texto y vídeo | apache-2.0 | sí, según la colección oficial |
| Qwen2.5 (serie de lenguaje) | 0,5B a 72B | no disponible en la información | solo texto | apache-2.0 | sí, según la colección oficial |

## Limitaciones y advertencias

- No hay evaluación en held-out: el rendimiento y el comportamiento de respuesta silenciosa requieren evaluación posterior por parte de quien lo despliegue.
- El token `<|silent|>` permanece visible al decodificar con `skip_special_tokens=True`; las aplicaciones deben gestionarlo explícitamente para no filtrarlo al usuario final.
- El modelo hereda los sesgos y limitaciones de Qwen2.5-VL-7B-Instruct, incluidos los posibles sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación inherente a los modelos generativos; el objetivo AURA busca mitigar respuestas no deseadas, pero no hay evidencia publicada de su eficacia.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- El repositorio contiene solo pesos de inferencia; no incluye estados del optimizador ni checkpoints intermedios, lo que dificulta reanudar el entrenamiento exactamente.
- Para continuar el entrenamiento con AURA CE hay que adjuntar explícitamente el hook; la metadata de `config.json` no activa la pérdida personalizada por sí sola.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-VL-7B-Instruct por si añaden restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leobo09263013/qwen25
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Colección Qwen2.5-VL: https://huggingface.co/collections/Qwen/qwen25-vl
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
