# KucLab/Censer.1

## Resumen

Censer.1 es un clasificador de texto en inglés para moderación de contenido, desarrollado por KucLab y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un transformer decoder-only de 1.115.264 parámetros entrenado desde cero, no un encoder fine-tuneado ni un envoltorio de API. Su tarea es binaria: predecir si un texto es inseguro (`1`) o seguro (`0`), emitiendo un único token de respuesta en lugar de generar texto libre. Incorpora un tokenizador BPE a nivel de byte propio, entrenado sobre el mismo corpus.

El modelo resulta relevante por su extrema ligereza: el checkpoint en fp32 ocupa 4,26 MB y la inferencia alcanza los 599 textos por segundo en una sola petición y 4.119 textos por segundo en lotes de 8 sobre una GPU de consumo (AMD Radeon RX 9060 XT con ROCm). El entrenamiento completo desde cero requiere unos 3,5 minutos en ese mismo hardware. Esto lo sitúa como candidato para filtrado masivo de baja latencia en pipelines de moderación, pre-filtrado antes de modelos mayores o despliegue en entornos con recursos muy limitados.

La arquitectura sigue el patrón de los transformers modernos a pequeña escala: 4 capas, dimensión de modelo 128, 4 cabezas de atención, dimensión feed-forward 384, posiciones RoPE, normalización RMSNorm pre-norm, MLP SwiGLU y embeddings atados. La longitud de contexto es de 160 tokens, con truncado de la entrada a 500 caracteres. El modelo se entrenó sobre seis conjuntos de datos etiquetados por seguridad y toxicidad, y declara métricas de 0,864 de accuracy y 0,835 de F1 en una partición de validación de 6.496 filas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 4 capas, d_model 128, 4 cabezas, d_ff 384, RoPE, RMSNorm pre-norm, SwiGLU |
| Parámetros totales | 1.115.264 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 tokens (entrada truncada a 500 caracteres) |
| Tipos de cuantización | no disponible (checkpoint publicado en fp32; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 4,3 MB en fp32) |

## Arquitectura y entrenamiento

Censer.1 es un transformer decoder-only entrenado desde cero con un tokenizador BPE a nivel de byte de 2.048 tokens, también entrenado sobre el corpus. La pila consta de 4 capas con dimensión de modelo 128, 4 cabezas de atención y dimensión feed-forward 384. Usa posiciones RoPE, RMSNorm en configuración pre-norm y MLP SwiGLU. La cabeza de salida está atada a los embeddings y produce dos logits de respuesta (seguro/inseguro). El formato de prompt es `[BOS][USER] <text> [ASSISTANT]`, y el modelo predice un único token de respuesta sin generar texto libre.

El entrenamiento se realizó sobre seis conjuntos de datos con etiquetas de seguridad y toxicidad: `nvidia/Aegis-AI-Content-Safety-Dataset-1.0`, `thesofakillers/jigsaw-toxic-comment-classification-challenge`, `google/civil_comments`, `PKU-Alignment/BeaverTails`, `lmsys/toxic-chat` y `databricks/databricks-dolly-15k`. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; el modelo es un clasificador, por lo que el ajuste por preferencias no resulta esperable, pero el dato no se confirma. El autor indica que el entrenamiento completo desde cero tarda unos 3,5 minutos en una AMD Radeon RX 9060 XT. El repositorio incluye `censer.py`, un script autónomo de modelo e inferencia verificado para producir predicciones idénticas a las del código de entrenamiento, ejecutable en CPU o CUDA/ROCm.

## Capacidades

- Clasificación binaria de seguridad de texto en inglés: devuelve `1` (inseguro) o `0` (seguro) con una puntuación de confianza asociada.
- Detección de contenido tóxico, violento o sexual explícito en frases directas, según los ejemplos de la model card.
- Discriminación de contextos técnicos legítimos frente a peticiones maliciosas: el ejemplo `"how do I kill a process in Linux"` se clasifica como seguro (`0`).
- Predicción de un único token de respuesta, sin generación de texto libre, lo que simplifica la integración en pipelines.
- Inferencia por lotes mediante `predict_batch`, con throughput documentado de 4.119 textos/s en lotes de 8.
- Salida en formato JSON opcional (`--json`) con etiqueta, booleano `unsafe` y puntuación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo generativo ni multilingüe.

## Casos de uso

- Pre-filtrado de comentarios en plataformas UGC: clasificar cada comentario entrante como seguro o inseguro antes de publicarlo, aprovechando los 599 textos/s en petición única y los 4.119 textos/s en lotes para absorber picos de tráfico sin coste apreciable de GPU.
- Moderación de chats en tiempo real: la latencia de 1,67 ms por texto permite insertar el clasificador en la ruta crítica de un chat sin añadir retardo perceptible al usuario.
- Enrutado en pipelines de moderación por niveles: usar Censer.1 como primera etapa que descarta el contenido claramente seguro y deriva solo los casos dudosos a modelos mayores o a revisión humana, reduciendo el coste computacional del sistema completo.
- Despliegue en entornos con recursos mínimos: con 85,7 MB de VRAM en inferencia y 4,26 MB de checkpoint, cabe en dispositivos de borde, contenedores pequeños o instancias CPU, sin necesidad de GPUs dedicadas.
- Filtrado de datasets de entrenamiento: aplicar el clasificador en lote sobre corpus scrapeados para eliminar muestras tóxicas antes de entrenar otros modelos, con la salvedad de que la etiqueta de toxicidad es una señal y no una garantía.
- Monitorización y auditoría de contenido histórico: reprocesar archivos de mensajes o reseñas para generar informes de exposición a contenido inseguro, gracias a que el modelo es determinista en la predicción de un único token y su ejecución es reproducible byte a byte.
- Evaluación comparativa de sistemas de moderación: usar sus métricas publicadas (accuracy 0,864, F1 0,835) como línea base ligera frente a clasificadores mayores en experimentos de investigación sobre detección de toxicidad.

## Benchmarks y rendimiento

Métricas de evaluación en una partición de validación de 6.496 filas:

| Métrica | Valor |
|---|---|
| Accuracy | 0,864 |
| F1 | 0,835 |
| Precision | 0,846 |
| Recall | 0,823 |

F1 por fuente de datos:

| Fuente | F1 |
|---|---|
| aegis | 0,89 |
| beavertails | 0,88 |
| jigsaw | 0,87 |
| civil_comments | 0,77 |
| toxic_chat | 0,48 |

Rendimiento medido en AMD Radeon RX 9060 XT (ROCm 7.1, torch 2.13.0):

| Métrica | Valor |
|---|---|
| Parámetros | 1.115.264 |
| Tamaño del checkpoint | 4,26 MB |
| Latencia por texto individual | 1,67 ms |
| Throughput por texto individual | 599 textos/s |
| Latencia por lote (batch de 8) | 1,94 ms |
| Throughput por lote | 4.119 textos/s |
| VRAM pico en inferencia | 85,7 MB |

El autor reporta además un 95% de accuracy sobre un conjunto de prueba manual de 40 casos no presentes en entrenamiento. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de esta naturaleza.

## Requisitos de hardware

- VRAM estimada para inferencia: 85,7 MB en pico, según medición del autor en fp32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor midió sobre AMD Radeon RX 9060 XT con ROCm 7.1. Funciona también en CPU.
- Cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, integradas con soporte CUDA/ROCm) y en dispositivos de borde.
- Opciones de despliegue: el script autónomo `censer.py` incluido en el repositorio, ejecutable con `python censer.py "<texto>"` o importable como `CenserPipeline`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no hay ruta de despliegue vía llama.cpp.
- Latencia y throughput: 1,67 ms y 599 textos/s en petición única; 1,94 ms y 4.119 textos/s en lotes de 8, sobre el hardware indicado.
- Entrenamiento: aproximadamente 3,5 minutos desde cero en la misma GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables de la misma categoría (clasificadores de toxicidad ligeros) que permitan una comparación rigurosa de parámetros, contexto y rendimiento. La model card no incluye comparaciones con alternativas. Se indica, por tanto, que la comparativa cuantitativa está no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Censer.1 | 1.115.264 | 160 tokens | Apache 2.0 | Hugging Face (KucLab/Censer.1) |
| Alternativas de moderación ligeras | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: los textos en otros idiomas se clasifican mayoritariamente como seguros (`0`), lo que genera falsos negativos sistemáticos fuera del inglés.
- La implicación y el sarcasmo más allá de casos simples quedan fuera del alcance del modelo por su tamaño.
- Es vulnerable a prompts de estilo jailbreak; la propia model card señala `toxic_chat` como la fuente con peor F1 (0,48), lo que refleja tanto ruido de etiquetas como debilidad ante ese tipo de entradas.
- El F1 de `civil_comments` (0,77) es notablemente inferior al de otras fuentes, lo que sugiere menor fiabilidad en registros conversacionales o de opinión.
- Es una señal de moderación, no una garantía de seguridad: no debe usarse como único mecanismo de control en producción.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos y negativos) con puntuaciones de confianza que pueden ser altas en casos incorrectos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda revisar las condiciones de los datasets de entrenamiento subyacentes si se redistribuye el modelo o se realizan obras derivadas.
- El contexto de 160 tokens y el truncado a 500 caracteres implican que textos largos solo se evalúan parcialmente; contenido inseguro situado después del corte no se detecta.
- No se documentan sesgos específicos por demografía, idioma o dominio más allá de las limitaciones de idioma y de las diferencias de F1 por fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Censer.1
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset thesofakillers/jigsaw-toxic-comment-classification-challenge: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset PKU-Alignment/BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset lmsys/toxic-chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset databricks/databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
