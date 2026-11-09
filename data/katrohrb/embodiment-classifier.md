# katrohrb/embodiment-classifier

## Resumen

El embodiment classifier es un modelo de clasificación de texto a nivel de oración desarrollado por katrohrb (Katrin Rohrbacher, vinculada al proyecto de investigación en humanidades digitales sobre embodiment en narrativa). Se trata de un fine-tuning de `roberta-base` que asigna a cada oración de prosa de ficción en inglés una de 11 categorías relacionadas con la representación del cuerpo y la experiencia sensorial en la narración: movimiento de personajes, tacto con materiales, expresiones faciales, percepción visual, gestos, etc.

El modelo resuelve un problema específico de las humanidades digitales y los estudios literarios: la necesidad de anotar de forma automática y a escala corpus de narrativa que describan la corporeidad y la sensorialidad, una tarea que hasta ahora requería anotación manual con acuerdos entre anotadores limitados (kappa de Cohen de 0,760). Con 124,6 millones de parámetros y una ventana de contexto propia de RoBERTa (512 tokens), es un modelo pequeño, entrenado exclusivamente en inglés y orientado a un pipeline de clasificación de oraciones, no a generación.

Es relevante ahora porque ofrece una herramienta reproducible y abierta (licencia CC-BY-4.0, código y anotaciones publicados) para la investigación empírica sobre embodiment en literatura, con un rendimiento en test (micro-F1 0,805) próximo al techo de acuerdo humano, y porque su publicación está asociada a un artículo aceptado en CHR 2027.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base, fine-tuned para clasificación) |
| Parametros totales | 124.654.091 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de roberta-base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-base`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 124,6 millones de parámetros, y añade una cabeza de clasificación para 11 etiquetas. La tarea es de clasificación a nivel de oración sobre prosa de ficción en inglés, con las categorías `no_rel`, `character_move`, `haptic_material`, `character_feltness`, `facial_expr`, `sight_human`, `book_paratext`, `haptic_human_animal`, `sight_material`, `segmentation_error` y `gesture`. La etiqueta `segmentation_error` indica que el esquema contempla explícitamente errores de segmentación del corpus de origen.

La model card no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste adicionales (RLHF, DPO u otras, poco habituales en clasificación). Sí documenta la evaluación: conjunto de test reservado de n=580 oraciones, con micro-F1 de 0,805 (IC [0,772, 0,835]) y macro-F1 de 0,797; validación cruzada de 5 folds con 0,808 ± 0,022. El techo de acuerdo entre anotadores humanos se sitúa en un kappa de Cohen de 0,760, lo que contextualiza el rendimiento del modelo respecto a la subjetividad inherente a la tarea.

## Capacidades

- Clasificación de oraciones de ficción narrativa en inglés en 11 categorías de embodiment.
- Detección de movimiento de personajes (`character_move`), gestos (`gesture`) y expresiones faciales (`facial_expr`).
- Distinción entre experiencias hápticas con materiales (`haptic_material`) y con humanos o animales (`haptic_human_animal`).
- Detección de percepción visual de humanos (`sight_human`) y de materiales (`sight_material`).
- Detección de interioridad corporal del personaje (`character_feltness`).
- Identificación de paratexto de libro (`book_paratext`) y de errores de segmentación (`segmentation_error`).
- Etiqueta de no relevancia (`no_rel`) para oraciones sin contenido de embodiment.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking: es un clasificador de una sola pasada.
- Capacidad multilingüe: no; entrenado y evaluado solo en inglés.

## Casos de uso

- Anotación a escala de corpus literarios: procesar novelas completas oración a oración para cuantificar la densidad de descripciones corporales y sensoriales por autor, género o periodo, sustituyendo la anotación manual con un F1 cercano al acuerdo humano.
- Estudios de recepción y estilística computacional: comparar la distribución de categorías (por ejemplo, proporción de `haptic_material` frente a `sight_human`) entre subcorpus para caracterizar estilos narrativos.
- Construcción de datasets anotados para investigación: usar el modelo como preanotador en un flujo de anotación asistida, revisando manualmente solo las predicciones de baja confianza.
- Humanidades digitales y docencia: generar materiales didácticos y ejercicios sobre embodiment en narrativa a partir de las etiquetas predichas sobre textos de dominio público.
- Filtrado y curación de corpus: descartar oraciones marcadas como `segmentation_error` o `book_paratext` en pipelines de limpieza de corpus narrativos antes de otros análisis.
- Investigación en narratología empírica: contrastar hipótesis sobre la presencia de corporeidad en distintos géneros (novela victoriana, ficción contemporánea) con métricas agregadas reproducibles.
- Reproducibilidad académica: servir de referencia para replicar el artículo de CHR 2027, ya que el código, el codebook y las anotaciones gold están publicados en el repositorio del proyecto.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Micro-F1 (test reservado, n=580) | 0,805 (IC 95%: 0,772–0,835) |
| Macro-F1 (test reservado) | 0,797 |
| Validación cruzada 5 folds | 0,808 ± 0,022 |
| Techo de acuerdo entre anotadores (kappa de Cohen) | 0,760 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124,6 M de parámetros); menos de 0,3 GB con cuantización a int8, aunque el autor no documenta variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3060 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, ONNX Runtime, TorchScript o `optimum`; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| katrohrb/embodiment-classifier | 124,6 M | 512 tokens | Clasificación de embodiment en 11 clases | CC-BY-4.0 | Hugging Face |
| FacebookAI/roberta-base | 124,6 M | 512 tokens | Modelo base de lenguaje (masked LM) | MIT | Hugging Face |
| Alternativas de clasificación de embodiment en narrativa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información disponible otros clasificadores públicos especializados en embodiment narrativo con los que comparar directamente. El modelo base `roberta-base` sirve como referencia de arquitectura y tamaño, pero no es un clasificador de la misma tarea.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés: no se espera un rendimiento fiable en otros idiomas.
- Dominio restringido a prosa de ficción narrativa; su comportamiento en otros géneros (noticias, ensayo, poesía) no está documentado.
- Ventana de contexto de 512 tokens: las oraciones más largas se truncan, lo que puede afectar a la clasificación.
- Riesgo de sesgo derivado del corpus de entrenamiento (autores, periodos y géneros concretos no documentados en la model card); las predicciones pueden no generalizar a tradiciones literarias no representadas.
- La tarea es intrínsecamente subjetiva: el techo de acuerdo humano (kappa 0,760) implica que existe un margen de desacuerdo irreducible que el modelo también refleja.
- La etiqueta `segmentation_error` está pensada para detectar fallos de segmentación del corpus de origen; en textos bien segmentados puede generar falsos positivos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos exactos y citar el artículo asociado.
- Modelo de investigación con solo 4 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación en producción fuera del contexto académico.
- No es un modelo generativo: no debe usarse para generar texto, responder preguntas ni como asistente conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/katrohrb/embodiment-classifier
- Repositorio de código, codebook y anotaciones: https://github.com/katrin-rohrbacher/embodiment-paper
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Artículo asociado: Rohrbacher, K., Reincke, J. & Mahlberg, M. (2027). Modeling Embodiment in Narrative Fiction. Proceedings of the Conference on Computational Humanities Research (CHR 2027), Manchester. Aceptado, en prensa.
