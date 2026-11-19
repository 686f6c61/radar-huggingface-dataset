# KucLab/Censer.5

## Resumen

Censer.5 es un clasificador binario de seguridad de contenido para inglés, desarrollado por KucLab, que etiqueta texto como `safe` o `unsafe`. Se trata de un transformer decoder-only de 902.016 parámetros entrenado desde cero, no de un encoder fine-tuneado ni de una envoltura sobre una API. Su interés radica en que ofrece moderación de contenido con un coste computacional mínimo: el checkpoint completo ocupa 3,6 MB en fp32 y se ejecuta en CPU sin necesidad de GPU.

El modelo se presenta como un `LlamaForSequenceClassification` estándar de la librería `transformers`, por lo que se carga sin `trust_remote_code` ni código personalizado. Internamente es un estudiante de 3 capas destilado a partir de un ensemble de cinco profesores (Censer.1 a Censer.4 más un profesor dedicado de 8 capas), entrenado sobre datos aumentados al doble y con un 15% de aumentación de erratas tipográficas.

Es relevante para pipelines de moderación que necesitan un filtro de primera línea barato, con latencia despreciable y sin dependencias de infraestructura pesada. Su ventana de contexto es de solo 192 tokens y trunca la entrada a 500 caracteres, lo que lo limita a fragmentos cortos de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `LlamaForSequenceClassification` (decoder-only transformer) |
| Parámetros totales | 902.016 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (entrada truncada a 500 caracteres) |
| Tipos de cuantización | no disponible (checkpoint distribuido en fp32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 3,6 MB en fp32) |

Detalles adicionales de arquitectura: 3 capas, `d_model` 128, 4 cabezas de atención, `d_ff` 384, RoPE con theta 10000, RMSNorm pre-norm con epsilon 1e-5, MLP SwiGLU. Tokenizador byte-level BPE de 2048 tokens entrenado sobre el propio corpus. La cabeza de clasificación es una capa lineal `score` que reutiliza las filas de embedding de los tokens de respuesta `0`/`1`.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tres capas con las mismas primitivas que un Llama (RoPE, RMSNorm, SwiGLU), pero con una cabeza de clasificación de secuencia en lugar de una cabeza de lenguaje. El tokenizador incorpora la plantilla de prompt en su post-procesador, de modo que `tokenizer(text)` genera directamente `[BOS][USER] <texto> [ASSISTANT]`, y el modelo predice un único token de respuesta (`0` o `1`) sin generar texto libre.

El entrenamiento se realizó durante 20 épocas con batch de 128, optimizador AdamW con tasa 3e-3 y scheduler coseno, AMP en bf16, sobre datos de entrenamiento aumentados al doble y con un 15% de aumentación de erratas. La destilación se aplicó desde un ensemble de cinco profesores con alpha=0,65 y temperatura T=4. Los conjuntos de datos citados son nvidia/Aegis-AI-Content-Safety-Dataset-1.0, thesofakillers/jigsaw-toxic-comment-classification-challenge, google/civil_comments, PKU-Alignment/BeaverTails, lmsys/toxic-chat y databricks/databricks-dolly-15k.

## Capacidades

- Clasificación binaria de seguridad de contenido en inglés: devuelve `safe` o `unsafe` con una puntuación de confianza.
- Robustez ante erratas tipográficas, fruto del 15% de aumentación con erratas durante el entrenamiento (por ejemplo, "how to filter wate" se clasifica como `safe` con 0,948).
- Discriminación de contexto: distingue usos peligrosos de usos legítimos de términos sensibles ("kill you" frente a "how do I kill a process in Linux").
- Ejecución en CPU sin GPU, con latencia muy baja por el tamaño del modelo.
- Carga estándar con `transformers` mediante `pipeline("text-classification")`, sin código remoto.
- Interfaz de terminal interactiva (`censer.5`) y modo one-shot por línea de comandos.
- Compatible con Text Embeddings Inference y endpoints de Hugging Face según las etiquetas del repositorio.
- No genera texto libre, no soporta tool calling, no tiene modo de razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Filtro de primera línea en moderación de comentarios: clasificar cada comentario entrante como `safe`/`unsafe` antes de pasarlo a un modelo mayor o a revisión humana, aprovechando su coste casi nulo y su ejecución en CPU.
- Pre-filtrado en pipelines de LLM: descartar prompts potencialmente dañinos antes de enviarlos a un modelo generativo, reduciendo coste y superficie de riesgo.
- Moderación en foros y comunidades: integración en el backend de publicación para bloquear contenido tóxico en tiempo real con una única llamada por fragmento de hasta 500 caracteres.
- Filtrado de datasets de entrenamiento: pasar grandes volúmenes de texto por el clasificador para eliminar muestras tóxicas antes de entrenar otros modelos, dado el bajo coste por inferencia.
- Guardarraíl en aplicaciones de chat: evaluar los mensajes de usuario turno a turno en un servicio ya desplegado, con la ventaja de que el modelo cabe en el mismo contenedor sin GPU.
- Etiquetado asistido para anotadores humanos: pre-etiquetar colas de revisión con una puntuación de confianza, priorizando los casos dudosos (cerca del umbral 0,5) para revisión manual.
- Demostraciones y entornos con recursos limitados: ejecución en el navegador mediante el widget de Hugging Face o en dispositivos sin acelerador, útil para prototipos y pruebas de concepto.

## Benchmarks y rendimiento

Evaluación sobre un split reservado de 6.496 filas, idéntico entre todas las versiones de Censer, con umbral 0,5:

| Métrica | Censer.1 | Censer.2 | Censer.3 | Censer.4 | Censer.5 |
|---|---|---|---|---|---|
| Accuracy | 0,865 | 0,863 | 0,857 | 0,874 | 0,876 |
| F1 | 0,835 | 0,829 | 0,822 | 0,845 | 0,849 |
| Precision | 0,848 | 0,861 | 0,855 | 0,868 | 0,864 |
| Recall | 0,823 | 0,799 | 0,792 | 0,824 | 0,834 |

F1 por fuente: aegis (anotación humana) 0,912. No se han publicado resultados frente a modelos externos de moderación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el checkpoint en fp32 ocupa 3,6 MB y el modelo puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; funciona en cualquier GPU CUDA o ROCm pasando `device=0` al pipeline, pero no aporta ventaja significativa.
- Cabe en cualquier GPU consumer, incluida cualquier iGPU o incluso sin GPU.
- Opciones de despliegue: `transformers` (pipeline de clasificación de texto), Text Embeddings Inference, widget de Hugging Face en navegador, y el launcher `censer.5` que solo depende de `torch`, `tokenizers` y `safetensors`.
- Latencia y throughput: no se han publicado cifras concretas; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no hay mediciones documentadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Censer.5 | 902.016 | 192 tokens | Clasificación safe/unsafe (inglés) | Apache 2.0 | Hugging Face, `transformers` estándar |
| Censer.4 | no disponible | no disponible | Clasificación safe/unsafe (inglés) | Apache 2.0 (según repositorio del autor) | Hugging Face |
| Censer.1–.3 | no disponible | no disponible | Clasificación safe/unsafe (inglés) | Apache 2.0 (según repositorio del autor) | Hugging Face |

No se dispone de datos sobre modelos externos comparables (por ejemplo, clasificadores de toxicidad basados en encoders como BERT o Detoxify) en la información proporcionada, por lo que no se incluye comparación con ellos.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Ventana de contexto de 192 tokens y truncado a 500 caracteres: los textos largos se recortan y el modelo solo evalúa el fragmento inicial.
- Clasificador binario con umbral fijo de 0,5 por defecto; la calibración de la puntuación no está documentada más allá de los ejemplos de la model card.
- Accuracy del 0,876 y F1 del 0,849 en el split de evaluación: existe un margen de error apreciable, con falsos positivos y falsos negativos en producción.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí puede producir clasificaciones erróneas con confianza alta.
- Sesgos: los datasets de entrenamiento (Jigsaw, Civil Comments, BeaverTails, Toxic Chat, Aegis) pueden introducir sesgos de anotación y de dominio; no se documenta un análisis de sesgo.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos a los de entrenamiento.
- No es un filtro de seguridad completo: no detecta todas las categorías de daño y no debe usarse como único mecanismo de moderación en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Censer.5
- Pesos (`model.safetensors`): https://huggingface.co/KucLab/Censer.5/resolve/main/model.safetensors?download=true
- Configuración (`config.json`): https://huggingface.co/KucLab/Censer.5/resolve/main/config.json?download=true
- Tokenizador (`tokenizer.json`): https://huggingface.co/KucLab/Censer.5/resolve/main/tokenizer.json?download=true
- Launcher (`censer.5`): https://huggingface.co/KucLab/Censer.5/resolve/main/censer.5?download=true
- Repositorio GitHub del paquete: https://github.com/Jerry256254/censer.5
- Dataset Aegis AI Content Safety: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset Jigsaw Toxic Comment Classification: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset Toxic Chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
