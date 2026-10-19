# midlyn/indobert-clickbait-id

## Resumen

indobert-clickbait-id es un modelo de clasificación de texto en indonesio desarrollado por el usuario midlyn. Consiste en un fine-tuning de IndoBERT base p1 (`indobenchmark/indobert-base-p1`), un transformer encoder de tipo BERT con 124.442.882 parámetros, para detectar titulares de noticias con clickbait. El modelo resuelve una clasificación binaria: etiqueta un titular como `clickbait` o `non-clickbait`. Se entrenó sobre el dataset CLICK-ID y se evaluó en un conjunto de prueba de 1.496 titulares, con una accuracy de 0,7266 y un F1 macro de 0,6982.

Su relevancia es acotada: se trata de un modelo de investigación creado para una tesis (skripsi), no de un sistema validado para producción. Aun así, puede ser útil como baseline para experimentos de detección de clickbait en indonesio, un idioma con menos recursos que el inglés. La longitud máxima de entrada es de 64 tokens, adecuada para titulares, y el repositorio usa safetensors con un tamaño de 0,5 GB. No se especifica licencia ni se han publicado descargas o valoraciones de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder); modelo base IndoBERT base p1 |
| Parametros totales | 124.442.882 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 64 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificación de texto binaria (`clickbait` / `non-clickbait`) |
| Modelo base | `indobenchmark/indobert-base-p1` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, según la etiqueta `bert` del repositorio y el modelo base IndoBERT base p1. No se detallan en la información proporcionada el número de capas, las dimensiones ocultas ni el número de cabezas de atención; se trata de un modelo base de 124,4 millones de parámetros. El fine-tuning se realizó sobre CLICK-ID, un dataset de titulares de noticias en indonesio etiquetados de forma binaria como clickbait o non-clickbait. La model card indica que las etiquetas provienen de anotadores humanos que no siempre coinciden, lo que introduce ruido en el objetivo de aprendizaje.

No se especifica el número total de ejemplos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; por la naturaleza de la tarea, se trata de un entrenamiento supervisado estándar de clasificación. La longitud máxima se fijó en 64 tokens. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Clasificación binaria de titulares en indonesio: devuelve una etiqueta (`clickbait` o `non-clickbait`) y una puntuación de confianza.
- Entrada limitada a 64 tokens; no procesa documentos largos ni titulares que superen ese límite sin truncarlos.
- No es un modelo generativo: no produce texto libre, resúmenes ni respuestas conversacionales.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni para razonamiento multi-paso.
- Monolingüe: solo indonesio (`id`).
- No tiene modo thinking, visión, audio ni capacidades multimodales.
- Adecuado para inferencia por lotes en pipelines de clasificación.

## Casos de uso

- Moderación de portales de noticias: clasificar automáticamente titulares entrantes y marcar los que superen un umbral de clickbait para revisión editorial. Los 64 tokens cubren titulares típicos y el modelo puede ejecutarse en CPU.
- Análisis de calidad periodística: procesar un corpus histórico de titulares indonesios y calcular la proporción de clickbait por medio o sección, usando la etiqueta predicha como variable de análisis.
- Investigación académica: servir como baseline en estudios sobre clickbait en indonesio, comparando su accuracy y F1 macro con otros clasificadores entrenados sobre CLICK-ID.
- Priorización en verificación de hechos: ordenar titulares sospechosos para que los verificadores revisen primero los de mayor probabilidad de clickbait, reduciendo el volumen de revisión manual.
- Integración en un CMS: alertar a editores en el momento de publicar si el titular se clasifica como clickbait, con un umbral configurable según la política editorial.
- Filtrado en agregadores de noticias: penalizar o etiquetar titulares sensacionalistas en un feed personalizado, combinando la puntuación del modelo con otras señales.
- Docencia y experimentación: ejemplo práctico de fine-tuning de IndoBERT para tareas de NLP en indonesio, reproducible con la librería transformers.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Conjunto |
|---|---|---|---|
| CLICK-ID test | Accuracy | 0,7266 | 1.496 titulares |
| CLICK-ID test | F1 macro | 0,6982 | 1.496 titulares |

No se han publicado otros resultados de benchmarks ni comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- Parámetros: 124,4 millones. El peso en FP32 ocupa aproximadamente 498 MB; en FP16, unos 249 MB; en INT8, unos 124 MB. Son estimaciones teóricas a partir del número de parámetros, no medidas publicadas por el autor.
- VRAM estimada para inferencia: menos de 1 GB en FP16, incluyendo overhead. Cabe en CPU y en cualquier GPU consumer con 2 GB o más de VRAM.
- GPU recomendadas: no se requiere GPU dedicada. Para lotes grandes, cualquier GPU moderna (GTX 1650, RTX 3060, etc.) es suficiente. A100 o H100 no son necesarias.
- Opciones de despliegue: pipeline de transformers, HuggingFace Inference Endpoints (el repositorio tiene la etiqueta `endpoints_compatible`), text-embeddings-inference (etiqueta `text-embeddings-inference`), ONNX Runtime o conversión a GGUF para llama.cpp. vLLM y TGI están orientados a modelos generativos y no se documentan para este pipeline.
- Latencia y throughput: no se han publicado medidas. Por el tamaño del modelo, la inferencia en CPU es viable para lotes moderados, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indobert-clickbait-id | 124.442.882 | 64 tokens | Clasificación binaria de clickbait | no disponible | HuggingFace (0 descargas, 0 likes) |
| indobertbenchmark/indobert-base-p1 | no disponible (arquitectura BERT base) | no disponible | Modelo base de representaciones | no disponible | HuggingFace |
| Otros clasificadores de clickbait en indonesio | no disponible | no disponible | Clasificación de clickbait | no disponible | no disponible |

No se han publicado comparativas con otros modelos en la información disponible. La única comparación posible es con el modelo base IndoBERT base p1, que no está fine-tuneado para clickbait y carece de métricas publicadas en esta ficha.

## Limitaciones y advertencias

- Solo admite indonesio (`id`); no es multilingüe.
- Longitud máxima de 64 tokens: los titulares más largos se truncan, lo que puede perder información.
- Rendimiento moderado: accuracy de 0,7266 y F1 macro de 0,6982 en el conjunto de prueba; falla en aproximadamente uno de cada cuatro casos.
- Las etiquetas del dataset provienen de anotadores humanos con desacuerdo, por lo que el modelo aprende una noción subjetiva de clickbait y sus predicciones no son verdad absoluta.
- No hay información sobre sesgos políticos, de género o de otro tipo, ni sobre la distribución del dataset de entrenamiento.
- Licencia no especificada: no se puede asumir uso comercial sin verificar los términos.
- Sin validación externa, descargas ni likes: no hay evidencia de generalización fuera de CLICK-ID.
- Riesgo de sobreajuste al estilo de los titulares del dataset; el rendimiento puede degradarse en otros medios o géneros.
- No es un modelo generativo; no debe usarse para generar titulares ni texto libre.
- No hay información sobre calibración de probabilidades; los umbrales de decisión deben validarse en el caso de uso concreto.

## Enlaces

- HuggingFace: https://huggingface.co/midlyn/indobert-clickbait-id
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p1
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
