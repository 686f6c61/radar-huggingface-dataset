# DominicTWHV/Horizon-1-Text-Large

## Resumen

Horizon-1-Text-Large es un modelo de clasificación de texto (no generativo) especializado en moderación de contenido y seguridad, desarrollado por el usuario DominicTWHV. Se trata de un fine-tuning de `answerdotai/ModernBERT-large`, la variante grande de la familia ModernBERT presentada por Answer.AI y LightOn a finales de 2024, que sustituye la atención clásica por atención con rotación posicional (RoPE) y mecanismos de atención local/global combinados, permitiendo contextos largos con un coste computacional contenido. El modelo resultante conserva la arquitectura encoder-only de ModernBERT y añade una cabeza de clasificación multi-etiqueta con siete categorías de daño.

El modelo resuelve un problema concreto: la detección automática de contenido abusivo, fraudulento o peligroso en inglés, con un único clasificador que cubre simultáneamente estafa (scam), violencia, acoso, discurso de odio, toxicidad, obscenidad y genocidio. Forma parte del ecosistema Cockatoo, una plataforma de moderación de contenido del mismo autor, y se presenta como sucesor de Constellation-One-Text con mejoras notables en recall para violencia y discurso de odio.

Es relevante ahora porque los clasificadores de seguridad basados en encoders modernos ofrecen una alternativa mucho más barata en inferencia que los LLM generativos usados como moderadores, manteniendo una calidad competitiva en tareas de clasificación acotadas. Con casi 396 millones de parámetros, un repositorio de 2,8 GB y pesos exportados a ONNX (FP32 e INT8), está pensado para desplegarse en producción a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT-large), con atención local/global y RoPE |
| Parametros totales | 395.838.471 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ModernBERT soporta hasta 8192 tokens, pero el autor no lo especifica) |
| Tipos de cuantizacion | ONNX FP32 y ONNX INT8 (el autor advierte que INT8 es "bastante lossy") |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (con caveat por el dataset `lmsys/toxic-chat`, ver limitaciones) |
| Formato de pesos | safetensors, ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `answerdotai/ModernBERT-large`, un encoder transformer de 395 millones de parámetros que incorpora innovaciones respecto a BERT clásico: codificaciones posicionales rotatorias (RoPE), alternancia de capas con atención local (ventana corta) y atención global, y capas de normalización y activaciones más eficientes. La cabeza de clasificación es multi-etiqueta con siete clases (`scam`, `violence`, `harassment`, `hate_speech`, `toxicity`, `obscenity`, `genocide`); la clase `genocide` es nueva respecto a Constellation-One.

El entrenamiento se realizó sobre un dataset agregado de 232.000 entradas procedente de cinco fuentes: `ealvaradob/phishing-dataset`, `ucberkeley-dlab/measuring-hate-speech`, `cardiffnlp/tweet_eval`, `lmsys/toxic-chat` y `tasksource/jigsaw_toxicity`. El autor aplica fusión de etiquetas mediante operación OR y `merge_labels` en caso de conflicto, sin intervención manual en la sanitización. Se usaron pérdidas asimétricas (γ- = 3,5, γ+ = 0,5, clipping = 0,05), optimizador AdamW (betas 0,9/0,999, eps 1e-8), decaimiento de learning rate por capas (LLRD) con factor 0,98, 3 épocas, batch efectivo de 128 (32 × 2 de acumulación × 2 GPUs), learning rate 5e-5, weight decay 0,1, warmup ratio 0,1, bf16, tf32 y FlashAttention-2. El entrenamiento se ejecutó en dos NVIDIA A40 mediante el servidor `Cockatoo_ML_Training`.

## Capacidades

- Clasificación multi-etiqueta de texto en inglés en siete categorías de seguridad: estafa, violencia, acoso, discurso de odio, toxicidad, obscenidad y genocidio.
- Detección de phishing y contenido fraudulento (derivada del dataset `ealvaradob/phishing-dataset`).
- Moderación de conversaciones y mensajes generados por usuarios (entrenado parcialmente con `lmsys/toxic-chat`).
- Alta sensibilidad (recall elevado) configurable mediante umbrales por categoría; el autor proporciona umbrales ajustados por categoría para maximizar F1 macro.
- Capacidad de operar como filtro previo o posterior a sistemas generativos (pre-moderation y post-moderation).
- No soporta tool calling, agentes, generación de texto, razonamiento multi-paso ni visión: es un clasificador puro.
- Multilingüe: limitado a inglés.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo clasifica cada mensaje en las siete categorías con umbrales ajustables; el operador puede fijar umbrales estrictos para `hate_speech` o `genocide` y más laxos para `toxicity`, aprovechando el recall alto por defecto.
- Filtrado de spam y phishing en formularios de contacto o correo entrante: la categoría `scam` alcanza F1 de 0,9167 en la evaluación ajustada, adecuada como primera línea de defensa antes de un análisis más costoso.
- Moderación de salidas de un chatbot o LLM: colocar Horizon-1 como clasificador posterior sobre las respuestas generadas permite bloquear contenido tóxico o violento antes de mostrarlo al usuario, con coste de inferencia muy bajo gracias a los pesos ONNX INT8.
- Detección de acoso en comunidades de soporte o plataformas de mensajería: la categoría `harassment` alcanza F1 de 0,8761 con umbral ajustado, con recall de 0,9240, útil para priorizar revisiones humanas.
- Enrutado de contenido a revisión humana: usando el score de confianza por categoría, el sistema puede escalar solo los casos dudosos a moderadores, reduciendo la carga manual.
- Investigación en seguridad de contenido: el modelo sirve como baseline reproducible para comparar clasificadores de moderación, dado que el autor publica métricas detalladas por categoría y comparación con Constellation-One.
- Filtrado en pipelines de anotación de datasets: pre-etiquetar grandes volúmenes de texto en inglés para acelerar la curación de datasets de seguridad antes de la revisión manual.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a la partición de evaluación zero-shot (no presente en entrenamiento), con media macro. Se presentan dos configuraciones: umbral por defecto (0,5) y umbral ajustado por categoría.

**Umbral por defecto (0,5):**

| Categoría | Umbral | F1 |
|---|---|---|
| scam | 0,5 | 0,8758 |
| violence | 0,5 | 0,6891 |
| harassment | 0,5 | 0,8279 |
| hate_speech | 0,5 | 0,6581 |
| toxicity | 0,5 | 0,6430 |
| obscenity | 0,5 | 0,6428 |
| genocide | 0,5 | 0,5630 |
| **Media** | - | **0,7000** |

**Umbral ajustado:**

| Categoría | Umbral | F1 | Delta vs. defecto |
|---|---|---|---|
| scam | 0,7129 | 0,9131 | +0,0373 |
| violence | 0,6238 | 0,7252 | +0,0361 |
| harassment | 0,6535 | 0,8712 | +0,0433 |
| hate_speech | 0,6040 | 0,7082 | +0,0501 |
| toxicity | 0,6238 | 0,7371 | +0,0941 |
| obscenity | 0,6238 | 0,7309 | +0,0881 |
| genocide | 0,6337 | 0,5929 | +0,0299 |
| **Media** | - | **0,7541** | **+0,0541** |

**Comparación con Constellation-One (ambos ajustados):**

| Métrica | Constellation-One | Horizon-1 | Delta |
|---|---|---|---|
| Loss | 0,1603 | 0,0245 | -0,1358 |
| Precisión global | 0,6940 | 0,6809 | -0,0131 |
| Recall global | 0,8151 | 0,8554 | +0,0403 |
| F1 global | 0,7475 | 0,7448 | -0,0027 |
| F1 scam | 0,9360 | 0,9167 | -0,0194 |
| F1 violence | 0,5995 | 0,7348 | +0,1353 |
| F1 harassment | 0,8524 | 0,8761 | +0,0237 |
| F1 hate_speech | 0,6211 | 0,7061 | +0,0850 |
| F1 toxicity | 0,7415 | 0,7204 | -0,0211 |
| F1 obscenity | 0,7345 | 0,6990 | -0,0355 |
| F1 genocide | N/A | 0,5604 | N/A |

El autor reporta además recall bruto de 0,94 y precisión bruta de 0,566 (frente a 0,605 de Constellation-One). No se han publicado resultados en benchmarks estándar de la literatura (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,6 GB de pesos (396 M parámetros × 4 bytes), más overhead de activaciones y runtime; en la práctica, 2-3 GB.
- VRAM estimada en ONNX INT8: aproximadamente 0,4 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; NVIDIA T4, L4, RTX 3060 en adelante son suficientes. Para entrenamiento o fine-tuning se usaron dos NVIDIA A40.
- Cabe en GPU consumer: sí, en todas las GPU modernas (RTX 3060, 4060, 4090, etc.), e incluso en CPU con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (pesos INT8 y FP32 publicados en el repo), Hugging Face Transformers con `AutoModelForSequenceClassification`, y servidores de inferencia tipo TGI o vLLM para clasificación (aunque para un encoder de este tamaño, ONNX Runtime o un servidor ligero suele ser más eficiente).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño y formato, se espera latencia de milisegundos por secuencia en GPU moderna, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-1-Text-Large | 395,8 M | no disponible | Clasificación multi-etiqueta de seguridad (7 clases) | Apache-2.0 (con caveat) | Hugging Face, ONNX |
| Constellation-One-Text | no disponible | no disponible | Clasificación de seguridad (6 clases, sin genocide) | no disponible | Hugging Face |
| answerdotai/ModernBERT-large | 395 M | 8192 tokens | Encoder base (no clasificador de seguridad) | Apache-2.0 | Hugging Face |
| Clasificadores tipo Toxic-BERT / Detoxify | ~110 M | 512 tokens | Clasificación de toxicidad (Jigsaw) | varía (a menudo Apache-2.0 o CC) | Hugging Face |

Frente a Constellation-One, Horizon-1 mejora recall global (+0,0403) y F1 en violencia (+0,1353) y discurso de odio (+0,0850), a costa de ligeras pérdidas en obscenidad y toxicidad. Frente a Toxic-BERT, Horizon-1 cubre más categorías (incluye scam y genocide) y usa un encoder más moderno, aunque no hay comparación directa publicada por el autor.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otras lenguas no está respaldado.
- El dataset `lmsys/toxic-chat` está licenciado bajo CC-BY-NC-4.0, lo que según el propio autor implica que el modelo **no puede usarse legalmente con fines comerciales** pese a la licencia Apache-2.0 del repo. Este caveat es crítico para producción.
- El modelo es "trigger-happy": tiende a marcar contenido como dañino con más frecuencia que Constellation-One; el autor recomienda ajustar umbrales en producción para controlar falsos positivos.
- La categoría `genocide` tiene precisión baja (0,3972 en la evaluación ajustada) y F1 de 0,5604; no es fiable como clasificador autónomo para esa categoría.
- No se ha realizado sanitización manual del dataset; pueden existir etiquetas ruidosas o conflictivas que afecten a la calibración.
- Riesgo de sesgos heredados de los datasets de origen (Jigsaw, TweetEval, Measuring Hate Speech), que sobrerrepresentan ciertos registros lingüísticos (tuits, foros) y pueden penalizar dialectos o variedades no estándar.
- Los pesos ONNX INT8 son "bastante lossy" según el autor; para precisión se recomienda FP32.
- No es un modelo generativo: no puede explicar sus decisiones ni generar texto; su uso requiere un sistema externo para la gestión de umbrales y la revisión.
- No hay datos publicados sobre latencia, throughput ni comportamiento en dominios distintos a los de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DominicTWHV/Horizon-1-Text-Large
- Modelo predecesor Constellation-One-Text: https://huggingface.co/DominicTWHV/Constellation-One-Text
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Visor hfviewer del modelo: https://hfviewer.com/DominicTWHV/Horizon-1-Text-Large
- Repositorio de entrenamiento: https://github.com/DominicTWHV/Cockatoo_ML_Training
- Métricas públicas en Cockatoo: https://cockatoo.dev/machine-learning.html
- Plataforma Cockatoo: https://cockatoo.dev/
- Pesos ONNX INT8: https://huggingface.co/DominicTWHV/Horizon-1-Text-Large/tree/main/onnx/8-bit
- Pesos ONNX FP32: https://huggingface.co/DominicTWHV/Horizon-1-Text-Large/tree/main/onnx/base
- Paper ModernBERT (referencia de arquitectura): https://arxiv.org/abs/2412.13663
- Paper de referencia sobre medición de discurso de odio: https://arxiv.org/abs/2009.10277
- Paper de referencia sobre toxicidad: https://arxiv.org/abs/2310.17389
