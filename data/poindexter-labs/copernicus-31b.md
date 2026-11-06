# Poindexter-Labs/Copernicus-31B

## Resumen

Copernicus-31B es un modelo de decisión ("system-one") desarrollado por Poindexter Labs, con aproximadamente 31.273 millones de parámetros (31,27B) según los pesos en safetensors. Su propósito no es la generación libre de texto, sino producir decisiones estructuradas a partir de contexto en lenguaje natural: seleccionar una opción de un conjunto explícito (`choice`), evaluar una proposición booleana (`noul`) o puntuar un ítem contra una rúbrica ordenada (`score`). Se sirve mediante un endpoint compatible con `/v1/systemone`, implementado en los ficheros de referencia `copernicus_server.py` y `copernicus_layout.py`.

El modelo se etiqueta como `gemma4` y `image-text-to-text`, lo que sugiere una base derivada de la familia Gemma 4 con capacidad multimodal de entrada (imagen y texto), aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento. La interfaz está pensada para que la aplicación no tenga que interpretar respuestas en formato libre: el servidor devuelve claves seleccionadas, distribuciones de probabilidad y valores de confianza.

Su relevancia actual radica en el nicho de enrutamiento de agentes, selección de herramientas, clasificación estructurada y flujos de verificación, donde una salida probabilística tipada es más útil que texto generativo. La licencia Apache 2.0 facilita su adopción comercial, si bien el autor advierte explícitamente de que la idoneidad para producción debe establecerse mediante evaluación específica de la tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado `gemma4`, multimodal image-text-to-text; detalles internos no publicados) |
| Parámetros totales | 31.273.088.876 (31,27B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 62,6 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de las etiquetas del repositorio: `gemma4`, `image-text-to-text` y `multimodal`. Esto indica una base de la familia Gemma 4 con entrada de imagen y texto, adaptada a una tarea de clasificación (`pipeline_tag: text-classification`) bajo el paradigma que el autor denomina "decision-index" y "system-one". No se publican detalles sobre número de capas, tipo de atención, mecanismo de fusión multimodal ni configuración del tokenizador.

Tampoco hay información sobre el corpus de entrenamiento (número de tokens, composición, proporción de datos multimodales), ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado específico para las tareas de decisión. La única indicación operativa es la interfaz de decisión con tres tipos de respuesta (`choice`, `noul`, `score`) y la referencia a un backend SGLang con parámetro `--box-coords yxyx`, lo que apunta a soporte de coordenadas de cajas delimitadoras en la ruta multimodal. Cualquier afirmación adicional sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no está respaldada por la información disponible.

## Capacidades

- Toma de decisiones estructuradas mediante tres tipos de consulta: `choice` (selección entre opciones con distribución de probabilidad), `noul` (probabilidad de que una proposición sea verdadera) y `score` (puntuación esperada y probabilidades por nivel sobre una rúbrica ordenada).
- Entrada multimodal imagen-texto según las etiquetas del repositorio, con soporte de coordenadas de cajas en formato `yxyx` en el adaptador SGLang.
- Evaluación de estados estructurados (por ejemplo, objetos JSON con campos de negocio) y de conversaciones como contexto de decisión.
- Salida con valores de confianza por respuesta, útil para umbrales y escalado humano en pipelines automatizados.
- Servido mediante API HTTP compatible con `/v1/systemone`, con endpoints `/health` y `/v1/models`.
- Compatible con dos backends: Transformers en proceso (solo texto) y SGLang como motor de inferencia separado.
- Capacidad de generación libre de texto: no documentada; el pipeline declarado es clasificación, no generación.
- Soporte de tool calling, agentes multi-paso, matemáticas o código: no documentado como capacidad nativa; el modelo está orientado a emitir decisiones que un orquestador externo puede usar para enrutar herramientas.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y una pregunta `choice` con criterios por equipo (facturación, identidad, técnico); devuelve la clave seleccionada y su distribución de probabilidad, lo que permite derivar a revisión humana cuando la confianza cae por debajo de un umbral.
- Selección de herramientas en agentes: dado el historial de conversación y un catálogo de herramientas descritas como criterios, el modelo emite una decisión `choice` sobre qué herramienta invocar, con probabilidades que el orquestador puede usar para reintentar o pedir confirmación.
- Verificación de condiciones de negocio: con un estado estructurado (por ejemplo, `payment_received` y `items_available`), una consulta `noul` responde si un pedido puede enviarse, devolviendo la probabilidad de `true` como señal para el sistema de gestión de pedidos.
- Priorización con rúbricas: una consulta `score` con niveles ordenados ("baja", "media", "alta") permite obtener una puntuación esperada de urgencia sobre inventario u operaciones, útil para colas de trabajo con ordenación automática.
- Evaluación de evidencia en flujos de verificación: el modelo puede contrastar un estado (documento, extracto, conversación) contra proposiciones y devolver probabilidades, integrándose en pipelines de revisión con escalado a humano.
- Clasificación estructurada en prototipos de investigación: al exponer distribuciones completas en lugar de una única etiqueta, facilita el análisis de calibración y la comparación de políticas de decisión antes de fijar umbrales en producción.
- Moderación o triaje con imagen: gracias a la ruta multimodal image-text-to-text y al soporte de coordenadas de cajas en el backend SGLang, puede evaluar contenido visual junto con texto en tareas de triaje, siempre que se valide la calidad de la fusión multimodal para el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un checkpoint de 31,27B en safetensors ocupa 62,6 GB en el repositorio; en FP16/BF16 requiere del orden de 62 GB solo para pesos, más memoria para activaciones y caché KV. En cuantización de 8 bits bajaría a unos 31 GB y en 4 bits a unos 16 GB, pero el autor no publica variantes cuantizadas ni cifras validadas.
- GPU recomendadas: no especificadas. Por tamaño, un despliegue en precisión completa exige múltiples aceleradores (por ejemplo, varias A100/H100); no hay datos del autor sobre configuraciones probadas.
- GPU de consumo: no confirmado. Un modelo de este tamaño no cabe en una RTX 4090 (24 GB) en FP16; solo sería viable con cuantizaciones agresivas no publicadas oficialmente.
- Opciones de despliegue: Transformers en proceso (backend `hf`, solo texto) y SGLang como motor separado (backend `sglang`, con soporte de coordenadas `yxyx`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural, se indican alternativas de tamaño y propósito cercanos, sin cifras de benchmark:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Copernicus-31B | 31,27B | No disponible | Apache 2.0 | Decisiones estructuradas (`choice`/`noul`/`score`), multimodal |
| Gemma 2 27B | 27B | No disponible en esta ficha | Gemma license | Generación de texto de propósito general |
| Qwen2.5 32B | 32,5B | No disponible en esta ficha | Apache 2.0 (variantes) | Generación de texto, código y matemáticas |
| Mistral Small 24B | 24B | No disponible en esta ficha | Apache 2.0 | Generación de texto de propósito general |

La comparación de rendimiento, contexto y calidad de decisión frente a estas alternativas requiere evaluación propia; no hay datos publicados por el autor.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés (`en`); el rendimiento en castellano u otros idiomas no está documentado.
- Calibración: el propio autor advierte de que las probabilidades del ejemplo de la model card son ilustrativas y no deben tratarse como estimaciones de calibración validadas.
- Producción: la model card indica explícitamente que la idoneidad para cualquier caso de uso productivo debe establecerse mediante evaluación específica de la tarea.
- Contexto: la longitud máxima de contexto no se publica, lo que impide planificar conversaciones largas o estados extensos con garantías.
- Generación: el pipeline declarado es clasificación; no hay evidencia de calidad en generación libre, razonamiento multi-paso o código.
- Multimodalidad: aunque se etiqueta como image-text-to-text, no se detalla el alcance ni la calidad de la comprensión de imagen; el backend Transformers documentado es solo texto.
- Sesgos y alucinación: no se publica información sobre sesgos conocidos ni sobre tasas de alucinación. Al emitir decisiones probabilísticas, un umbral mal ajustado puede producir automatizaciones erróneas silenciosas.
- Adopción: el repositorio registra 12 descargas y 0 likes en el momento de la consulta, sin ecosistema de terceros ni variantes cuantizadas, lo que limita el soporte comunitario.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones heredadas de la base `gemma4` si el checkpoint deriva de pesos con licencia propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Poindexter-Labs/Copernicus-31B
- Sitio web de Poindexter Labs: https://www.poindexterlabs.ai/
- Referencia de API en la model card: sección "API Reference" del README del repositorio de Hugging Face
- Implementación de referencia: `copernicus_server.py` y `copernicus_layout.py` (incluidos en el repositorio del modelo)
- SGLang (motor de inferencia alternativo): no se proporciona enlace en la información disponible
