# krystv/decision-q1-2b

## Resumen

`krystv/decision-q1-2b` es un adaptador LoRA (junto con una cabeza de decisión conjunta) publicado por el usuario krystv sobre el modelo base `unsloth/Qwen3.5-2B`. Su propósito no es la generación de texto libre, sino convertir un modelo de lenguaje de 2B parámetros en un "respondedor" de una sola pasada y calibrado para preguntas tipadas: `choice` (elección entre opciones), `score` (puntuación), `noul` (sin opciones, respuesta abierta) y `box` (localización de regiones en imagen, presumiblemente mediante rejillas de cajas).

El repositorio tiene un tamaño de 0,2 GB, coherente con un adaptador LoRA más su runner de inferencia (`decision_engine.py`, servido también como `inference/`) y una interfaz de escritorio Tk (`gui_qwen3_5_2b_decision_studio.py`, no publicada). La model card describe el flujo de publicación mediante `push_to_hub.py` y menciona elementos internos estables como `DecisionEngine`, `ZONE9_GEOMETRY`, las rejillas de cajas y `refine_box_with_image_salience`, lo que sugiere una integración con visión para el modo `box`.

La información pública disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de benchmarks, y el modelo no registra descargas ni interacciones en el momento de la consulta. La ficha se limita, por tanto, a lo que puede inferirse de la model card y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA con cabeza de decisión conjunta sobre transformer decoder `unsloth/Qwen3.5-2B`; arquitectura interna del base no detallada en la información disponible |
| Parametros totales | No disponible (el base es de 2B; el adaptador LoRA no declara su recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); runner en Python (`decision_engine.py`) |

## Arquitectura y entrenamiento

El modelo se distribuye como un adaptador LoRA más una "joint decision head" que se acopla a `unsloth/Qwen3.5-2B`. La model card no detalla la arquitectura interna del base (número de capas, dimensiones, mecanismo de atención) ni la composición del dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de alineación como RLHF o DPO. La única información funcional es que el sistema está diseñado para responder en una sola pasada a preguntas tipadas, lo que implica un esquema de salida estructurado y presumiblemente una calibración de las puntuaciones.

El modo `box` y la función `refine_box_with_image_salience` sugieren que el pipeline incorpora procesamiento de imágenes (posiblemente mediante rejillas de cajas y mapas de saliencia) para localizar regiones, aunque no se especifica si el modelo base tiene capacidades de visión nativas o si el runner realiza el preprocesado de forma externa. No hay información sobre innovaciones técnicas adicionales como decodificación especulativa, atención lineal o entrenamiento con datos sintéticos.

## Capacidades

- Respuesta a preguntas tipadas en cuatro modos: `choice` (selección entre opciones), `score` (asignación de una puntuación calibrada), `noul` (respuesta abierta sin opciones) y `box` (localización de regiones).
- Salida calibrada en una sola pasada, orientada a la toma de decisiones más que a la generación libre de texto.
- Procesamiento de imagen para el modo `box`, con refinamiento de cajas mediante saliencia visual (`refine_box_with_image_salience`).
- Ejecución local mediante `decision_engine.py`, con modo benchmark y servidor HTTP integrado.
- Interfaz de escritorio opcional (Tk) no publicada en el Hub.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni soporte multilingüe.

## Casos de uso

- Clasificación de respuestas en pipelines de anotación: el modo `choice` permite seleccionar una opción entre un conjunto cerrado, útil para etiquetado automático de datos con una sola pasada y menor coste que la generación libre.
- Puntuación automática de candidatos: el modo `score` asigna una puntuación calibrada, aplicable a ranking de respuestas, evaluación de calidad de textos o filtrado previo en sistemas de recuperación.
- Respuesta abierta controlada: el modo `noul` permite obtener respuestas sin restricción de opciones, adecuado para preguntas de formato libre donde no se dispone de un conjunto predefinido de alternativas.
- Localización de regiones en imagen: el modo `box` con `refine_box_with_image_salience` permite detectar y refinar áreas de interés, útil en tareas de recorte automático, inspección visual o preanotación de datasets de visión.
- Servicio HTTP local de decisión: el runner puede desplegarse como servidor para integrar el modelo en aplicaciones que necesiten respuestas tipadas de baja latencia sin depender de APIs externas.
- Evaluación comparativa interna: el modo `--benchmark` del runner permite medir el comportamiento del modelo frente a otros sistemas de decisión en tareas controladas.
- Prototipado de asistentes con interfaz de escritorio: la GUI Tk (no publicada) sugiere un uso en entornos de escritorio para pruebas interactivas del motor de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al tratarse de un adaptador LoRA sobre un base de 2B parámetros, la inferencia en precisión completa requeriría del orden de 5-6 GB, y en cuantización de 4 bits podría situarse en torno a 2-3 GB, aunque estas cifras son estimaciones no confirmadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño del base, cabría esperar funcionamiento en GPU de consumo como RTX 3060/4060 en adelante, pero no hay confirmación.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del base (2B), aunque no se documenta.
- Opciones de despliegue: el autor proporciona `decision_engine.py` con servidor HTTP integrado; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| krystv/decision-q1-2b | Base 2B + LoRA | No disponible | No disponible | safetensors (LoRA) | Respuesta tipada calibrada, modo `box` con visión |
| unsloth/Qwen3.5-2B | 2B | No disponible | No disponible | safetensors | Modelo base sobre el que se aplica el adaptador |
| Alternativas de clasificación/decisión de 2B | No disponible | No disponible | No disponible | No disponible | No se dispone de comparables documentados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; es un riesgo relevante para producción.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- No hay resultados de benchmarks ni métricas de calibración publicadas, pese a que el modelo se presenta como "calibrado".
- El repositorio no registra descargas ni interacciones, lo que dificulta evaluar su madurez y validación por la comunidad.
- El tamaño de 0,2 GB corresponde al adaptador, no al modelo completo; es necesario descargar el base `unsloth/Qwen3.5-2B` por separado.
- La dependencia de nombres internos estables (`DecisionEngine`, `ZONE9_GEOMETRY`, rejillas de cajas) sugiere una API frágil ante cambios.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- El modo `box` depende de procesamiento de imagen cuyo funcionamiento interno no está especificado; su fiabilidad es desconocida.
- No se documentan limitaciones de contexto ni restricciones de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/krystv/decision-q1-2b
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.
