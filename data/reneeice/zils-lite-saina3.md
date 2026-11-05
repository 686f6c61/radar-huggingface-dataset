# reneeice/zils-lite-saina3

## Resumen

Saina Helm 3 es un modelo multimodal de 0,8 mil millones de parámetros desarrollado por reneeice (publicado bajo el identificador `reneice/zils-lite-saina3` en HuggingFace) y afinado a partir de Qwen/Qwen3.5-0.8B. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un estado (texto o JSON), imágenes y clips de audio cortos en una sola pasada y devuelve probabilidades calibradas para preguntas tipadas (sí/no, elección única, elección múltiple y valoración). El problema que resuelve es el de la toma de decisiones automatizada con confianza explícita, en lugar de la generación de respuestas que requieren post-procesado.

La propuesta técnica es relevante porque combina tres modalidades de entrada (texto, imagen y audio de hasta 10 segundos) en un modelo de menos de 1 GB de pesos, lo que permite ejecutarlo en una sola GPU consumer, en Apple Silicon o incluso en CPU. Incluye un modo `decision` con umbral configurable que devuelve abstención cuando la confianza es baja, un mecanismo útil para pipelines donde un error tiene coste recuperable pero conviene escalar a revisión humana.

El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, y cuenta con artefactos complementarios para MLX, GGUF (llama.cpp) y Ollama, además de una API alojada. Su orientación es claramente de clasificación y enrutamiento multimodal, no de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con cabezas de respuesta para clasificación; detalles internos no disponibles |
| Parámetros totales | 852.985.920 (≈0,85B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card indica "hasta la ventana de contexto" sin cifra) |
| Tipos de cuantización | No disponible de forma explícita; existen artefactos GGUF y MLX que implican cuantizaciones estándar de llama.cpp/MLX |
| Idiomas soportados | No disponible (la ficha de HuggingFace no lista idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo principal); GGUF y MLX en repos derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 0,8B parámetros, y se afina para una tarea de clasificación multimodal con cabezas de respuesta específicas por tipo de pregunta (`yes_no`, `single_choice`, `multi_choice`, `rating`). La entrada se compone de un `state` en texto o JSON, hasta 8 imágenes (PNG, JPEG, WebP, 10 MB cada una) y hasta 4 clips de audio (WAV, FLAC, MP3, Ogg, WebM, 10 MB y 10 s cada uno), procesados en una única pasada compartida. La salida es un vector de probabilidades por pregunta, no texto generado.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones arquitectónicas más allá del esquema de cabezas de respuesta y el modo de abstención por umbral. El paquete `saina` (versión 0.9.1 o superior) construye el prompt exacto y aplica la cabeza de respuesta correspondiente; versiones anteriores rechazan el modelo.

## Capacidades

- Clasificación multimodal conjunta de texto, imagen y audio en una sola pasada.
- Preguntas de tipo sí/no con salida `yes`/`no` y `confidence`.
- Elección única entre 2 y 255 opciones, con `probabilities`, `selection` y `confidence`.
- Elección múltiple con `memberships` independientes por opción.
- Valoración sobre 2 a 10 niveles ordenados, con `expected_level` y `confidence`.
- Modo `decision` con umbral que devuelve abstención y motivo en lugar de respuestas de baja confianza.
- Procesamiento de estado estructurado (JSON) junto con imágenes y audio en la misma solicitud.
- No genera texto libre; no soporta tool calling ni razonamiento multi-paso en el sentido de un agente generativo.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Enrutamiento de tickets de soporte con captura adjunta: el modelo recibe el texto del ticket y la imagen (por ejemplo, una captura de error) y responde a preguntas de elección única sobre la categoría o el equipo destinatario, con probabilidad por clase para priorizar la cola.
- Verificación de recibos y reclamaciones de gastos: se envía el importe reclamado como `state` y la foto del recibo como imagen, y se pregunta si el total coincide y qué acción tomar (aprobar, revisar, rechazar), aprovechando el modo `decision` para derivar a revisión humana cuando la confianza es baja.
- Detección de voz sintética en llamadas: con un clip de audio de hasta 10 segundos, el modelo responde a preguntas de sí/no sobre si la voz parece artificial, útil como primer filtro en un pipeline antifraude.
- Etiquetado de imágenes y sonidos en catálogos: clasificación multi-etiqueta de fotos de producto y clips cortos de audio ambiental, con `memberships` por etiqueta para construir datasets anotados.
- Triaje de contenido en formularios: dado un `state` JSON con campos declarados y una imagen del documento, responder preguntas de sí/no sobre coherencia o presencia de campos obligatorios.
- Valoración de calidad en control de procesos: usar preguntas de tipo `rating` sobre imágenes de inspección para asignar un nivel ordinal (por ejemplo, severidad de un defecto) con nivel esperado y confianza.
- Clasificación de audio corto en entornos de monitorización: etiquetar eventos sonoros de hasta 10 segundos con elección única entre categorías predefinidas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del Decision Index (índice público, suite completa de 140.620 solicitudes, corregido por azar, escala 0-100):

| Modelo | Decision Index (texto) | Decision Index (visión) |
|---|---|---|
| Saina Helm 3 | 45,89 | 47,36 |
| Saina Helm 2 Omni | 37,44 | 46,90 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Las ejecuciones son autoinformadas por el autor con el arnés público `run-saina/saina-decision-index`.

## Requisitos de hardware

- VRAM estimada: con 0,85B parámetros en safetensors (repo de 1,7 GB), la inferencia en fp16 requiere aproximadamente 1,7-2 GB de VRAM más el espacio de activaciones para hasta 8 imágenes y 4 clips de audio; en cuantización de 8 bits o 4 bits, el peso baja a menos de 1 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060/4060 en adelante son suficientes. A100 y H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM.
- Apple Silicon: soportado mediante el artefacto MLX (`run-saina/saina-helm-3-0.8b-MLX`).
- CPU: soportado según la model card.
- Opciones de despliegue: paquete `saina` con PyTorch, servidor autoalojado (`saina[local,server,media]`), llama.cpp vía GGUF, Ollama (con build específico de Saina) y API alojada en saina.run.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Enfoque |
|---|---|---|---|---|---|
| Saina Helm 3 | 0,85B | No disponible | Texto, imagen, audio | Apache 2.0 | Clasificación con probabilidades y abstención |
| Saina Helm 2 Omni | No disponible | No disponible | Texto, imagen, audio | No disponible | Clasificación multimodal (generación anterior) |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | Texto (y multimodal según variante) | Según Qwen | Generación de texto |

No se dispone de información sobre otros modelos comparables de clasificación multimodal con salida probabilística en el mismo rango de tamaño.

## Limitaciones y advertencias

- No genera texto: solo puntúa las opciones proporcionadas; no sirve para tareas generativas.
- No debe usarse para decisiones finales sin revisión con consecuencias materiales para personas (crédito, empleo, medicina, legal).
- Prohibido su uso para identificar o clasificar personas o elaborar perfiles individuales.
- No es un modelo de seguridad ni de moderación de contenido.
- No procesa vídeo ni audio de más de 10 segundos.
- Vulnerable a inyección de instrucciones a través de texto, imágenes o audio no confiables; no debe aplicarse directamente sobre contenido no verificado.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente en dominios fuera de la distribución de entrenamiento; se recomienda validar con datos etiquetados propios.
- Idiomas soportados: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que conviene revisar.

## Enlaces

- HuggingFace: https://huggingface.co/reneeice/zils-lite-saina3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paquete `saina` en PyPI: https://pypi.org/project/saina/
- Repositorio GitHub de Saina: https://github.com/run-saina/saina
- Arnés del Decision Index: https://github.com/run-saina/saina-decision-index
- Espacio del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Artefacto MLX: https://huggingface.co/run-saina/saina-helm-3-0.8b-MLX
- Artefacto GGUF: https://huggingface.co/run-saina/saina-helm-3-0.8b-GGUF
- Ollama: https://ollama.com/run-saina/saina-helm-3-0.8b
- Build de Ollama con soporte Saina: https://github.com/ramarlina/ollama/tree/saina-helm-3
- API alojada: https://saina.run
