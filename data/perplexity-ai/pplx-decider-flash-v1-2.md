# perplexity-ai/pplx-decider-flash-v1.2

## Resumen

pplx-decider-flash-v1.2 es un modelo de clasificación y decisión desarrollado por Perplexity AI, afinado a partir de Qwen/Qwen3.5-4B. No es un modelo generativo de texto libre: recibe un «estado» (texto, JSON o imágenes) junto con una o varias preguntas tipadas (`choice`, `noul`, `score`) y devuelve la opción elegida, la distribución de probabilidad sobre las alternativas, un nivel esperado y una confianza. Es la versión reducida de pplx-decider-v1.2 (27B), con el mismo formato de petición conjunta y la misma API, pero con unos 4.540 millones de parámetros, aproximadamente una séptima parte del tamaño del modelo grande.

Su interés técnico está en la destilación: se entrenó sobre las peticiones de entrenamiento de los modelos de decisión de 27B, aprendiendo las distribuciones de probabilidad completas de los profesores y no solo sus respuestas, y combinando varias ejecuciones de entrenamiento mediante *model soup* (promediado de pesos). Según la model card, conserva buena parte del Decision Index y de las puntuaciones de visión del modelo de 27B, y la destilación incluso mejora en tareas de decisión que quedaron fuera de todo el entrenamiento.

Está pensado para escenarios donde la latencia y el coste pesan más que los últimos puntos de precisión: enrutado de peticiones, moderación, etiquetado automático, extracción de señales estructuradas a partir de texto e imágenes, o evaluación de candidatos en pipelines de búsqueda y agentes. La licencia declarada es Apache 2.0, aunque el acceso al repositorio requiere autenticación según la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabeza de lectura (*readout*) para clasificación; código propio (`custom-code`) sobre `qwen3_5` |
| Parámetros totales | 4.539.265.536 (~4,54 B) según safetensors |
| Parámetros activos | No aplica (no se documenta como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos publicados son safetensors en BF16 (la model card indica unos 9 GiB de pesos BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB, librería PyTorch) |
| Modelo base | Qwen/Qwen3.5-4B (fine-tune) |
| Tarea (*pipeline*) | text-classification (con soporte de imagen) |
| Entradas admitidas | `state` como `str`, `dict` o `list` (serializado a JSON) + lista opcional de imágenes (ruta, data URI base64 o `PIL.Image`) |
| Tipos de pregunta | `choice` (1 a 255 opciones), `noul` (probabilidad de verdadero), `score` (2 a 255 niveles ordenados) |
| Salidas | `choice`/`noul`/`score`, `probabilities`, `confidence`, `legend`; `logits()` expone los logits brutos por opción |
| Descargas / likes | 224 descargas, 17 likes |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de unos 4,54 B de parámetros, y se especializa mediante fine-tune en una tarea de lectura: el estado y las preguntas se concatenan en una única secuencia con un formato de plantilla, y el modelo puntúa cada opción válida bajo códigos de respuesta (`A`, `B`, …) en el orden en que se proporcionan. Las respuestas se obtienen de los logits de esas opciones; no hay decodificación autoregresiva (`output_tokens` es siempre 0 en la respuesta de `usage`). El soporte multimodal proviene del modelo base y permite adjuntar imágenes de hasta 1,6 MP en las evaluaciones publicadas.

El entrenamiento combina dos técnicas declaradas por el autor: destilación de los modelos de decisión de 27B sobre sus propias peticiones de entrenamiento, donde el alumno aprende las distribuciones de probabilidad completas de los profesores en lugar de únicamente la etiqueta ganadora, y *model souping*, es decir, promediado de pesos de varias ejecuciones de entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card sí indica un efecto secundario interesante: la destilación mejora el rendimiento en tareas de decisión reservadas (*held out*) de todo el entrenamiento.

Un detalle de diseño relevante es que todas las preguntas de una petición comparten secuencia y se atienden entre sí. En este modelo de 4B el autor recomienda enviar una pregunta por petición como opción por defecto, porque agrupar solo ayuda cuando las preguntas son facetas estrechamente acopladas de una misma decisión.

## Capacidades

- Clasificación de texto en opciones cerradas (`choice`) con hasta 255 alternativas, devolviendo probabilidad por opción y confianza.
- Preguntas booleanas (`noul`) con probabilidad de verdadero; útil para filtros y *gating*.
- Puntuación ordinal (`score`) sobre 2 a 255 niveles, devolviendo el nivel esperado (índice) y la distribución completa.
- Procesamiento de múltiples preguntas sobre un mismo estado, con 1 o más preguntas por petición.
- Soporte multimodal: imágenes adjuntas al estado, con evaluación específica hasta 1,6 MP (Vision Decision Index).
- Acceso a logits brutos mediante `decider.logits(requests)`, útil para ranking con el margen `true - false` de una pregunta `noul`, que no se satura en empates como las probabilidades.
- Procesamiento por lotes: `decide` acepta una lista de peticiones y devuelve una lista de respuestas en el mismo orden.
- Validación de esquema: las peticiones mal formadas lanzan `pplx_decider.RequestError` antes de ejecutar cómputo.
- No incluye generación de texto libre, tool calling, razonamiento multi-paso ni modo «thinking»; es un clasificador de un solo paso con salida estructurada.

## Casos de uso

- Enrutado de tickets de soporte: una pregunta `choice` con criterios `billing`, `support`, `sales` sobre el texto del ticket asigna el equipo correcto con probabilidad y confianza, como muestra el ejemplo de la model card.
- Priorización y triaje: combinar una pregunta `noul` («¿está el cliente bloqueado ahora?») con una pregunta `score` de frustración permite ordenar la cola de atención sin ningún modelo generativo intermedio.
- Moderación y etiquetado de contenido: clasificación multi-etiqueta usando preguntas `noul` independientes, una por categoría, aprovechando que el modelo es más preciso con una pregunta por petición en la mayoría de tareas multi-pregunta.
- Enrutado en pipelines RAG o de agentes: decidir si una consulta requiere recuperación, qué índice consultar o si la respuesta recuperada es suficiente, con umbrales ajustables sobre la probabilidad devuelta.
- Extracción de señales estructuradas en ETL: convertir texto libre o JSON serializado en campos cerrados y escalas ordinales, con distribuciones que permiten propagar incertidumbre aguas abajo.
- Clasificación de documentación e imágenes de producto: al admitir imágenes, puede etiquetar capturas, formularios o fotos de producto junto con su texto asociado en una sola petición.
- Evaluación y ranking de candidatos: usar `logits()` y el margen de una pregunta `noul` para ordenar alternativas (por ejemplo, respuestas de otro modelo) sin los empates que producen las probabilidades saturadas.
- Control de calidad en simuladores o flujos de tareas: según la model card, agrupar los pasos de una misma tarea en una petición aporta +3,4 puntos frente a enviarlos por separado en su simulador de electrodomésticos.

## Benchmarks y rendimiento

Los únicos datos publicados son los del Decision Index 0.3 (público) del propio autor. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de propósito general en la información disponible.

| Decision Index 0.3 (público) | Flash v1.2, petición conjunta | Flash v1.2, una pregunta por petición | pplx-decider-v1.2 (27B), conjunta |
|---|---:|---:|---:|
| Knowledge | **42,0** | 41,4 | 56,3 |
| Language | 63,3 | **65,0** | 72,8 |
| Retrieval | 64,8 | **65,2** | 68,4 |
| Tools | 76,7 | **80,9** | 84,4 |
| Arts | **46,8** | **46,8** | 56,2 |
| **Overall Decision Index** | 58,88 | **60,05** | 68,09 |

El total usa la ponderación de la suite, no la media simple de categorías. En la mayoría de tareas multi-pregunta el modelo es más preciso con una pregunta por petición; en el resto de benchmarks ambos modos empatan.

| Vision Decision Index 0.3 (público, imágenes hasta 1,6 MP) | Flash v1.2 | pplx-decider-v1.2 (27B) |
|---|---:|---:|
| Overall | 72,53 | 77,43 |

| Efecto de agrupar preguntas | Diferencia (conjunta vs. una por petición) |
|---|---:|
| SATA-Bench (seleccionar todas las que apliquen, una pregunta por opción) | +6,6 |
| Simulador de electrodomésticos (pasos de una misma tarea) | +3,4 |

## Requisitos de hardware

- VRAM: la model card indica espacio para unos 9 GiB de pesos en BF16 más memoria de trabajo; en la práctica, 12-16 GiB de VRAM cubren la inferencia en BF16 con imágenes pequeñas.
- GPU recomendadas: cualquier GPU CUDA con 16 GiB o más (RTX 4090, RTX A6000, L40S, A100 40 GB, H100). El ejemplo oficial usa `device="cuda"` sin más configuración.
- GPU de consumo: sí cabe en tarjetas de gama alta para consumidor; 16 GiB es el objetivo seguro, y 12 GiB puede ser justo al procesar imágenes grandes o lotes.
- Despliegue: no se documenta soporte para vLLM, TGI, llama.cpp u Ollama; el modelo requiere su propio paquete (`pip install ./source`, o `pip install "./source[fast]"` para la ruta rápida), con `requirements.txt` que fija torch, transformers, safetensors, pillow, torchvision y huggingface-hub, y `requirements-fast.txt` para el modo rápido.
- Entorno: Python 3.12 o superior y token de Hugging Face con acceso al repositorio, que la model card describe como privado.
- Latencia y throughput: no disponibles. Al no haber decodificación autoregresiva (`output_tokens` = 0), el coste por petición es una sola pasada forward sobre el estado más las preguntas.

## Comparativa con modelos similares

| Modelo | Parámetros | Overall Decision Index | Vision Index | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| pplx-decider-flash-v1.2 | ~4,54 B | 58,88 (conjunta) / 60,05 (una por petición) | 72,53 | Apache 2.0 | Repo con acceso autenticado, 224 descargas |
| pplx-decider-v1.2 | ~27 B (unas 7 veces el flash) | 68,09 (conjunta) | 77,43 | No disponible en la información | Referenciado en la model card |
| Qwen/Qwen3.5-4B (base) | ~4 B (el flash tiene 4,54 B) | No disponible | No disponible | No disponible en la información | Público en Hugging Face |

Frente al 27B, el flash pierde sobre todo en Knowledge (42,0 frente a 56,3) y Arts (46,8 frente a 56,2), mientras que en Retrieval y Tools la diferencia es mucho menor (64,8 frente a 68,4 y 76,7 frente a 84,4). En visión la brecha es de unos 4,9 puntos. No se dispone de comparaciones con otros clasificadores o *deciders* de tamaño similar.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, no hace tool calling ni razonamiento multi-paso. Cualquier expectativa de «chat» o de respuestas abiertas queda fuera de su contrato.
- Solo admite respuestas dentro del conjunto de opciones o niveles proporcionado (máximo 255), de modo que la calidad depende del diseño de los criterios y de sus descripciones.
- Idiomas soportados no documentados; no hay garantía explícita de rendimiento en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible; los estados muy largos (por ejemplo, documentos completos dentro de `state`) pueden exceder la ventana y provocar la división de la petición en varias secuencias (`usage.sequences`).
- Sesgos: no se publica ninguna evaluación de sesgo, toxicidad ni equidad. Al ser un clasificador que enruta o puntúa personas y contenidos, conviene auditar los umbrales por subgrupo antes de producción.
- Calibración: las probabilidades pueden saturarse y producir empates; el autor recomienda usar el margen de logits (`true - false`) para ranking en lugar de las probabilidades.
- Riesgo de degradación en preguntas agrupadas: en este tamaño, agrupar preguntas distintas suele empeorar la precisión; hay que reservar la petición conjunta para facetas acopladas de una misma decisión.
- Licencia Apache 2.0 declarada, pero el modelo base Qwen3.5-4B y el acceso al repositorio (descrito como privado, con token) deben verificarse antes de un uso comercial o de una redistribución de pesos.
- Dependencia de código propio (`custom-code`): requiere `trust_remote_code` o la instalación del paquete del repositorio, con versiones de torch y transformers fijadas, lo que complica el despliegue en entornos gestionados.
- No hay benchmarks estándar ni evaluación independiente; todas las cifras proceden del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo de referencia (27B): https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perplexity AI: https://www.perplexity.ai/
- Perplexity AI en Wikipedia: https://fr.wikipedia.org/wiki/Perplexity_AI
- Guía de inicio de Perplexity: https://www.perplexity.ai/fr/hub/getting-started
