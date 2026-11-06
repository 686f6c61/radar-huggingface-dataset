# LiquidAI/d1-3B-MLX-4bit

## Resumen

d1-3B es un modelo de decisión desarrollado por Liquid AI que responde preguntas con nombre y tipo sobre un estado (texto, JSON o imágenes) en un único paso hacia delante, sin generar tokens. A diferencia de un modelo conversacional al uso, no produce texto libre: recibe un conjunto de preguntas tipadas (`noul`/`bool`, `choice`, `score`) y devuelve directamente la respuesta con sus probabilidades y un nivel de confianza. Esto lo sitúa en la categoría de modelos "system-one" orientados a clasificación calibrada y enrutamiento, no a generación.

Este repositorio concreto es la exportación a MLX en 4 bits para Apple Silicon del checkpoint original `LiquidAI/d1-3B`, pensada para ejecutarse con `mlx-vlm` 0.7.8 o superior. El modelo tiene 3.123.483.888 parámetros totales y una torre de visión que le permite tratar una imagen como el estado completo sobre el que se hacen las preguntas (pipeline `image-text-to-text`). Soporta 16 idiomas, entre ellos el castellano.

Su relevancia práctica está en que ofrece una alternativa determinista y de coste fijo (cero tokens de salida) a usar un LLM generativo para tareas de clasificación, moderación, enrutamiento o extracción de etiquetas, con probabilidades explícitas para poder calibrar umbrales en producción. La licencia es `lfm1.0` (marcada como "other"), por lo que conviene revisar sus términos antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (etiqueta `lfm2_vl`; transformer multimodal con torre de visión, proyector y modelo de lenguaje) |
| Parámetros totales | 3.123.483.888 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits (este repo); existen exportaciones MLX en 8 bits y float16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | `lfm1.0` (identificador `other`) |
| Formato de pesos | safetensors (MLX, 4 bits; torre de visión, proyector y norms en float16) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo base como `LiquidAI/d1-3B`, con la etiqueta de arquitectura `lfm2_vl` y la familia `lfm2.5`. Se trata, por tanto, de un modelo multimodal con una torre de visión, un proyector hacia el espacio del modelo de lenguaje y un tronco lingüístico. La innovación central no es la arquitectura en sí, sino el modo de inferencia: el modelo responde preguntas tipadas sobre un estado en un solo paso hacia delante, con cero tokens generados, y expone probabilidades por opción en lugar de una secuencia de texto.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card sí documenta el proceso de cuantización: el checkpoint original está en bfloat16 y se convierte con `mlx-vlm` a float16, 8 bits o 4 bits (grupo de 64). La torre de visión y el proyector nunca se cuantizan, y las partes no cuantizadas de las exportaciones cuantizadas se mantienen en float16. Según el autor, float16 es la precisión recomendada porque reproduce las respuestas del checkpoint original en float32 (desviación de probabilidad en torno a 1e-5) y porque en GPUs de Apple calcula con más precisión a la misma velocidad.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: `noul`/`bool` (probabilidad de sí), `choice` (etiqueta elegida entre criterios con descripción) y `score` (nivel esperado dentro de una escala con leyenda).
- Procesamiento de estado multimodal: el estado puede ser texto, JSON o una o varias imágenes.
- Salida calibrada: cada respuesta `choice` incluye `value`, `probabilities` y `metadata.confidence`; cada `score` incluye `value`, `probabilities` y `legend`; cada `noul` incluye `probability`.
- Múltiples preguntas por llamada: se pueden evaluar varios criterios nombrados sobre el mismo estado en una sola pasada.
- Multilingüismo en 16 idiomas, incluido el español.
- Despliegue como servidor con endpoint `/v1/decisions` mediante `mlx-vlm server`, aceptando imágenes por URL, ruta o data URI base64.
- Uso por línea de comandos con `python -m mlx_vlm decide`.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso en el sentido habitual.

## Casos de uso

- Enrutamiento de tickets de soporte: definir preguntas `choice` con criterios como "billing", "technical" o "fraud" y obtener la etiqueta con probabilidades para derivar el caso al equipo correcto; el modelo evalúa varias preguntas (equipo, urgencia, petición de reembolso) en una sola pasada.
- Moderación y clasificación de contenido: usar preguntas `noul` para decidir si un texto o una imagen infringe una política, aprovechando la probabilidad devuelta para fijar umbrales y revisar solo los casos dudosos.
- Extracción de señales estructuradas de JSON: dado un payload de formulario o de evento, responder preguntas tipadas sobre campos y valores sin necesidad de generar texto ni de parsear salidas libres.
- Triaje de imágenes en pipelines de visión: pasar una foto como estado completo y preguntar por categorías (por ejemplo, número de objetos o presencia de un elemento) con opciones discretas y su distribución de probabilidad.
- Priorización de colas de atención: combinar una pregunta `score` de urgencia con una `choice` de categoría para ordenar trabajo entrante de forma determinista y con coste de salida cero.
- Enrutamiento y guardarraíles en agentes: usar el modelo como clasificador previo que decide si una consulta debe ir a un LLM grande, a una herramienta concreta o a revisión humana, manteniendo la latencia y el coste acotados.
- Procesamiento local en Apple Silicon: al ser una exportación MLX de 4 bits (2,37 GB), encaja en flujos de clasificación en Mac con memoria limitada, sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una prueba de concordancia entre precisiones (no un benchmark de exactitud), con 104 respuestas de texto y 41 de imagen comparadas contra el checkpoint original en float32:

| Repositorio | Pesos | Tamaño | Misma respuesta top | Δp máximo | Δp medio |
|---|---|---:|---:|---:|---:|
| d1-3B-MLX-fp16 | float16 | 6,25 GB | 145/145 | 0,005 | 0,0006 |
| d1-3B-MLX-8bit | 8 bits (LM); visión, proyector y norms en float16 | 3,72 GB | 144/145 | 0,015 | 0,0020 |
| d1-3B-MLX-4bit | 4 bits (LM); visión, proyector y norms en float16 | 2,37 GB | 142/145 | 0,212 | 0,0276 |

Las tres respuestas top que cambian en 4 bits eran casi empates, con el segundo candidato del runner en float32 a menos de 0,1 de distancia.

## Requisitos de hardware

- Inferencia en Apple Silicon exclusivamente: la librería es MLX y el modelo está pensado para `mlx-vlm` 0.7.8 o superior; no hay soporte documentado para CUDA en esta exportación.
- Memoria: el repo ocupa 4,8 GB y los pesos 4 bits pesan 2,37 GB; la variante 8 bits ocupa 3,72 GB y la float16, 6,25 GB.
- Cabe en equipos Apple Silicon de gama consumer con memoria unificada suficiente; el autor no especifica mínimos por chip.
- Despliegue: `mlx-vlm` como biblioteca Python, como CLI (`python -m mlx_vlm decide`) o como servidor HTTP (`python -m mlx_vlm server --decision-model ...`) con endpoint `/v1/decisions`.
- No se documentan latencia ni throughput estimados. Al no generar tokens, el coste de salida es cero por diseño, pero no se aportan cifras de tiempo por petición.
- GPU recomendadas (A100, H100, RTX 4090) y opciones como vLLM, llama.cpp, Ollama o TGI: no disponibles para esta exportación MLX.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de d1-3B que permitan una comparación cuantitativa con alternativas. A continuación se comparan únicamente aspectos verificables de formato y despliegue frente a las otras precisiones del mismo modelo, que son las alternativas directas documentadas:

| Modelo | Parámetros | Contexto | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|---|
| d1-3B-MLX-4bit | 3,12 B | No disponible | MLX safetensors 4 bits | 2,37 GB | lfm1.0 | Mayor deriva de calibración (Δp máx. 0,212) |
| d1-3B-MLX-8bit | 3,12 B | No disponible | MLX safetensors 8 bits | 3,72 GB | lfm1.0 | Deriva reducida (Δp máx. 0,015) |
| d1-3B-MLX-fp16 | 3,12 B | No disponible | MLX safetensors float16 | 6,25 GB | lfm1.0 | Precisión recomendada por el autor |
| d1-3B (original) | 3,12 B | No disponible | PyTorch (referencia float32) | No disponible | lfm1.0 | Checkpoint de referencia |

Frente a modelos generativos de tamaño similar, la diferencia conceptual es que d1-3B no produce texto: no es sustituible por un chat model en tareas de generación abierta, y a la inversa un LLM general no ofrece de forma nativa probabilidades calibradas por etiqueta en una sola pasada. No se dispone de datos para comparar exactitud con clasificadores dedicados.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para producir texto libre, resúmenes ni diálogo abierto; solo responde preguntas tipadas predefinidas.
- La cuantización a 4 bits mueve las probabilidades hasta 0,212 (frente a 0,015 en 8 bits); si la calibración importa, el autor recomienda 8 bits o float16.
- Solo hay soporte MLX para Apple Silicon en esta exportación; no se documenta despliegue en CUDA ni en otros runtimes.
- No se han publicado datos de entrenamiento, composición del dataset ni proceso de alineación, lo que dificulta evaluar sesgos conocidos.
- Riesgo de alucinación no caracterizado: al no generar texto, el fallo típico sería una etiqueta o probabilidad mal calibrada, no una invención textual, pero no hay benchmarks de exactitud publicados.
- Longitud de contexto no disponible: no se puede planificar el uso con estados largos sin verificarlo empíricamente.
- Licencia `lfm1.0` bajo identificador `other`: es necesario leer el archivo `LICENSE` del repositorio antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- El repositorio tiene un volumen de adopción bajo (934 descargas, 3 likes) en el momento de la consulta, lo que limita la evidencia de la comunidad sobre su comportamiento en producción.
- El autor advierte que la prueba de precisiones es un "smoke test" de concordancia, no una evaluación de exactitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-3B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Exportación MLX float16: https://huggingface.co/LiquidAI/d1-3B-MLX-fp16
- Exportación MLX 8 bits: https://huggingface.co/LiquidAI/d1-3B-MLX-8bit
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Sitio de Liquid AI: https://www.liquid.ai/
- Paper referenciado en los tags: arXiv:2511.23404
