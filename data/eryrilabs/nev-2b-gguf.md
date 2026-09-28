# EryriLabs/Nev-2B-GGUF

## Resumen

Nev es un modelo de decisión ("decision model") de 1.880 millones de parámetros publicado por EryriLabs, distribuido en formato GGUF bajo licencia Apache 2.0. Se trata de un ajuste fino de Qwen/Qwen3.5-2B-Base entrenado para una única tarea: leer un prompt que enumera opciones etiquetadas con letras (A, B, C...) y colocar su probabilidad de siguiente token sobre la letra correcta. No genera texto libre; su salida es una distribución de probabilidad sobre las opciones disponibles.

La relevancia de Nev está en su enfoque de calibración y en su integración con el ecosistema Jev. Cada archivo GGUF del repositorio incorpora su propia calibración ajustada sobre las log-probabilidades de ese archivo concreto, almacenada como dato en los metadatos del propio GGUF (clave `nev.calibration`), de modo que un archivo Q4 y un archivo Q8 no comparten temperaturas. El repositorio incluye además un shim en Python que expone un endpoint compatible con Jev (`POST /v1/systemone`) sobre un servidor llama.cpp o sobre Ollama.

Según la model card, el modelo se entrenó sobre las distribuciones completas de opciones de otros modelos de decisión abiertos (Mapika/decider-4b v2 y crh225/Plumb-4B), no solo sobre sus respuestas más probables; trata los niveles de una pregunta de puntuación como categorías ordenadas y devuelve un valor esperado; y aplica una corrección del sesgo hacia determinadas letras basada en PriDe (arXiv 2309.03882). El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la información sobre benchmarks numéricos e idiomas soportados no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ajuste fino de Qwen/Qwen3.5-2B-Base); detalles especificos no disponibles |
| Parametros totales | 1.881.825.088 (~1,88 B), dato real de safetensors |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens en el ejemplo de despliegue del autor; maximo nativo no disponible |
| Tipos de cuantizacion | Q8_0 confirmado (nev-Q8_0.gguf); el tag imatrix sugiere cuantizaciones adicionales, lista completa no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base: 1.881.825.088 parametros) |

## Arquitectura y entrenamiento

Nev parte de Qwen/Qwen3.5-2B-Base mediante ajuste fino. La arquitectura subyacente corresponde a la del modelo base (transformer denso de ~1,88 B de parámetros), aunque la model card no detalla la configuración interna (número de capas, cabezas, dimensión oculta, tipo de atención). El modelo está especializado en una tarea de clasificación: dado un contexto y una pregunta con opciones etiquetadas por letras, emite la probabilidad del siguiente token, que corresponde a la letra de la opción. El prompt termina justo después de un paréntesis `(`, sin espacio ni salto de línea, de modo que ese paréntesis es el último token de entrada.

El entrenamiento introduce varias innovaciones según el autor. Primero, Nev se destiló a partir de las distribuciones completas de opciones de los modelos de decisión abiertos Mapika/decider-4b v2 y crh225/Plumb-4B, en lugar de limitarse a sus etiquetas mayoritarias. Segundo, las preguntas de tipo puntuación se tratan como niveles ordenados y el modelo devuelve tanto el nivel más probable como un valor esperado. Tercero, se incorpora un término de consistencia entre dos órdenes de opciones durante el entrenamiento, y el endpoint puede promediar sobre varios órdenes tras dividir por un prior de letra ajustado en validación (corrección inspirada en PriDe, arXiv 2309.03882). Por último, cada archivo GGUF lleva temperaturas ajustadas sobre sus propias log-probabilidades, leídas a través de llama-server, y esa calibración se almacena como dato en los metadatos (`nev.calibration`) en lugar de plegarse en los pesos. La model card no indica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Clasificación de decisiones con salida probabilística: asigna una probabilidad a cada opción etiquetada con letra y devuelve la más probable, en lugar de texto libre.
- Preguntas tipadas ("typed questions"): el prompt define explícitamente las opciones y su semántica (por ejemplo, `(A) billing`, `(B) technical`, `(C) sales`).
- Preguntas de puntuación con niveles ordenados: responde con el nivel más probable y con un valor esperado calculado sobre la distribución ordenada.
- Calibración por archivo: cada cuantización (Q4, Q8, etc.) incluye sus propias temperaturas ajustadas, aplicadas sobre las log-probabilidades leídas en tiempo de ejecución.
- Corrección del sesgo de letra: entrenamiento con consistencia entre órdenes de opciones y capacidad del endpoint de promediar sobre varios órdenes descontando un prior de letra.
- Banda de confianza en la respuesta: el endpoint asocia a cada respuesta una indicación de aceptar, revisar o derivar a un modelo mayor.
- Servicio compatible con Jev: expone `POST /v1/systemone` y `GET /health` sobre llama-server u Ollama.
- Compatibilidad con llama.cpp y Ollama: los GGUF se ejecutan en ambos runtimes.
- Generación de texto libre: no soportada (el modelo no escribe texto).
- Tool calling / function calling, razonamiento multi-paso, agentes, visión, audio y modo thinking: no documentados en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: dado un mensaje de cliente y una lista cerrada de equipos (facturación, técnico, ventas), el modelo devuelve la probabilidad de cada equipo en una sola pasada de forward, lo que permite umbralizar y derivar automáticamente los casos de baja confianza a revisión humana.
- Triaje de alertas en producción: clasificar un incidente entre severidades o equipos propietarios usando la banda de confianza del endpoint para decidir entre actuar, revisar o escalar.
- Moderación con política explícita: evaluar si un texto incumple una política concreta presentando las opciones como categorías y usando la probabilidad como medida de evidencia, no como juicio binario rígido.
- Puntuación ordinal en encuestas o feedback: tratar escalas tipo Likert como niveles ordenados y obtener un valor esperado, útil para agregar métricas sin asumir distancias arbitrarias entre niveles.
- Componente de un sistema mayor tipo Jev: actuar como "system one" rápido y barato dentro de una arquitectura que deriva los casos dudosos a un modelo mayor, aprovechando la banda de confianza para decidir la derivación.
- Autoetiquetado y filtrado de datasets: usar las distribuciones de probabilidad sobre opciones para seleccionar o priorizar ejemplos en función de la confianza, en lugar de descartar todo lo que no coincide con la etiqueta mayoritaria.
- Clasificación local y privada: al ser un GGUF de ~1,88 B ejecutable en llama.cpp u Ollama, permite procesar texto sensible en infraestructura propia sin llamadas a APIs externas, útil en dominios con requisitos de confidencialidad.
- Comparación A/B de redacciones: presentar dos o más variantes como opciones y usar la probabilidad asignada para seleccionar la respuesta preferida por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar. Sí menciona una encuesta ("survey") distribuida con el repositorio, con secciones 3.1 a 3.6, que documenta las afirmaciones diferenciales del autor frente a otros modelos de decisión abiertos, pero sin resultados numéricos reproducidos en la información proporcionada. Con 0 descargas y 0 likes, tampoco existe validación comunitaria pública en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del recuento de parámetros): aproximadamente 2,0-2,5 GB para el archivo Q8_0 con contexto moderado; por debajo de 1,5 GB para cuantizaciones de 4 bits. Estas cifras son estimaciones y no aparecen publicadas en la model card.
- El repositorio completo ocupa 6,3 GB, pero solo es necesario descargar el archivo de cuantización que se vaya a usar.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Un modelo de este tamaño también puede ejecutarse íntegramente en CPU con llama.cpp.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer actuales, incluso con cuantizaciones de 8 bits.
- Opciones de despliegue confirmadas por el autor: llama.cpp (`llama-server -m nev-Q8_0.gguf -c 8192 --port 8080`), Ollama (`ollama run hf.co/EryriLabs/Nev-2B-GGUF:Q8_0`) y el shim Python incluido en el repositorio (requiere Python 3.12 o superior, `fastapi`, `uvicorn` y `gguf`; no requiere `torch` ni `transformers`), que escucha en `http://127.0.0.1:8090`.
- vLLM, TGI y otros servidores: no documentados en la información disponible.
- Latencia y throughput: no publicados. Dado que la inferencia se realiza con `n_predict=1`, cada decisión corresponde a un único paso de forward, por lo que la latencia por consulta es del orden de un solo token generado; no se proporcionan medidas concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EryriLabs/Nev-2B-GGUF | 1,88 B | 8192 en el ejemplo de despliegue | Apache 2.0 | GGUF en HuggingFace, compatible con llama.cpp y Ollama | Calibracion por archivo en metadatos, endpoint /v1/systemone |
| Mapika/decider-4b v2 | No disponible | No disponible | No disponible | No disponible | Usado como profesor de destilacion por Nev |
| crh225/Plumb-4B | No disponible | No disponible | No disponible | No disponible | Usado como profesor de destilacion por Nev |
| JevK5 | No disponible | No disponible | No disponible | No disponible | Segun el autor, destila de modelos de chat generales; sirve la forma /v1/systemone desde PyTorch |
| JEV-9B | No disponible | No disponible | No disponible | No disponible | Segun el autor, destila del Jev cerrado |
| decider-2b | No disponible | No disponible | No disponible | No disponible | Publica un unico conjunto de temperaturas segun la encuesta del autor |

Las diferencias señaladas por el autor (destilación sobre distribuciones completas de opciones, niveles ordinales con valor esperado, calibración por archivo almacenada como dato, corrección de prior de letra y endpoint compatible con Jev sobre llama-server/Ollama) proceden de la propia model card y de la encuesta incluida en el repositorio, por lo que deben tratarse como afirmaciones del autor y no como resultados verificados de forma independiente.

## Limitaciones y advertencias

- El modelo no genera texto libre. No es adecuado para tareas de generación, resumen, traducción ni diálogo abierto.
- La tarea está acotada a responder sobre un conjunto de opciones predefinido en el prompt; fuera de ese formato su comportamiento no está documentado.
- La model card está escrita en primera persona por el autor y todas las afirmaciones diferenciales (secciones 3.1 a 3.6) se presentan con "receipts" internos, es decir, referencias a la encuesta del propio repositorio, no a evaluaciones externas.
- No hay resultados de benchmarks publicados ni validación comunitaria independiente (0 descargas, 0 likes en el momento de la consulta).
- Idiomas soportados no disponibles: se desconoce el comportamiento multilingüe y si el ajuste fino se realizó únicamente en inglés.
- Riesgo de alucinación y de calibración deficiente fuera de la distribución de entrenamiento: aunque el modelo emite probabilidades, estas solo son fiables si la calibración ajustada se aplica correctamente y el prompt sigue el formato exacto (terminar justo después del paréntesis, sin espacio ni salto de línea).
- El sesgo de preferencia por determinadas letras de respuesta existe y se mitiga con entrenamiento en consistencia de órdenes y con la corrección de prior; la corrección del endpoint requiere promediar sobre varios órdenes, algo que no hace una llamada directa al runtime sin el shim.
- Las temperaturas de calibración son específicas de cada archivo: usar el shim con un `--gguf` distinto al modelo realmente servido produce probabilidades mal calibradas.
- Con muchas opciones, algunas letras pueden faltar en la lista de log-probabilidades devuelta por el runtime si se solicita un `n_probs` demasiado bajo; el ejemplo usa `n_probs: 40` en llama-server y `top_logprobs: 20` en Ollama.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-2B-Base puede tener sus propias condiciones, no detalladas en la información proporcionada.
- Fecha de publicación declarada: 2026-09-28, versión 0.1.0. Es un lanzamiento inicial sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EryriLabs/Nev-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Paper de referencia citado para la corrección de prior (PriDe): https://arxiv.org/abs/2309.03882
- Encuesta incluida en el repositorio (secciones 3.1 a 3.6): disponible dentro del propio repositorio de HuggingFace, no se proporciona URL independiente
- Modelos de decisión citados como profesores de destilación: Mapika/decider-4b v2 y crh225/Plumb-4B (URLs concretas no disponibles en la información proporcionada)
- Sitio de Eryri Labs: https://www.eryrilabs.com/
- Repositorio IBM/gguf (resultado de búsqueda sobre formato GGUF, no relacionado directamente con Nev): https://github.com/IBM/gguf
- GGUF Loader (resultado de búsqueda sobre runtimes GGUF): https://github.com/GGUFloader/gguf-loader
- Índice de modelos GGUF: https://huggingface.co/models?library=gguf
- Directorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
