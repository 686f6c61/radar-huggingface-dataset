# GJOE/kompass-followup-model

## Resumen

GJOE/kompass-followup-model es un cross-encoder de clasificación de texto desarrollado por GJOE, publicado con licencia Apache-2.0. Su tarea es determinar si un artículo de noticias que ya pertenece a una misma historia reporta un nuevo desarrollo respecto a un artículo anterior. El modelo toma como entrada dos artículos y devuelve una probabilidad de que el segundo constituya un nuevo capítulo de la historia.

Está construido a partir de `deepset/gbert-base`, un modelo BERT bilingüe alemán, y fue ajustado sobre un dataset denominado `development_relation_training_v2`. El repositorio incluye pesos en formato ONNX además del modelo original de PyTorch, y está preparado para ejecutarse en el navegador con `transformers.js`. El tamaño del repositorio es de 0.4 GB, lo que sugiere un modelo BERT base de ~110 millones de parámetros, aunque este dato no se confirma en la información disponible.

El modelo es relevante para sistemas de segmentación de cobertura periodística en alemán, especialmente como un componente de veto dentro de pipelines que combinan heurísticas temporales y clasificación semántica. No se trata de un detector autónomo, sino de una pieza que evita abrir capítulos cuando dos artículos separados por horas son en realidad la misma información repetida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (`deepset/gbert-base`), pipeline de clasificación de secuencias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 únicamente; el modelo cuantizado INT8 no se publica |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch, ONNX (fp32), compatible con `transformers.js` |

## Arquitectura y entrenamiento

El modelo es un cross-encoder que procesa pares de textos mediante una arquitectura BERT de tipo `gbert-base`. Cada par se compone de `text_a` (el artículo anterior) y `text_b` (el artículo posterior), y la salida se clasifica en dos etiquetas: `SAME_DEVELOPMENT` y `NEW_STEP`. La probabilidad de que exista un nuevo desarrollo se obtiene mediante `softmax(logits)[1]`. El modelo es direccional: el orden de los argumentos altera la respuesta, ya que fue entrenado para asumir que el primer texto es siempre el más antiguo.

El ajuste fino se realizó sobre el dataset `development_relation_training_v2`, cuyas características concretas no se detallan en la información disponible. La evaluación se llevó a cabo sobre seis historias periodísticas alemanas con aproximadamente 250 artículos en total, etiquetados por un único anotador a partir de los titulares. Tres historias se usaron para ajustar el modelo y tres para validación hold-out. No se mencionan técnicas de RLHF, DPO ni otras innovaciones de entrenamiento. El diseño de inferencia en producción recomienda combinar el modelo con un umbral temporal: se crea un nuevo capítulo si el intervalo desde el artículo anterior es de al menos 4 horas y `p(NEW_STEP) >= 0.05`.

## Capacidades

- Clasificación binaria de pares de artículos periodísticos en alemán sobre una misma historia.
- Detección de nuevos desarrollos dentro de la cobertura continuada de una noticia.
- Funciona como veto: puede bloquear la apertura de un capítulo cuando la información es una copia repetida de una wire.
- Soporta inferencia en navegador mediante `transformers.js` y carga desde Hugging Face.
- No soporta tool calling, function calling, visión, audio ni razonamiento avanzado multi-step.
- Capacidad multilingüe limitada exclusivamente al alemán.

## Casos de uso

- Segmentación de cobertura periodística en sistemas de archivo: el modelo, combinado con un umbral temporal, permite dividir la cobertura de una misma noticia en capítulos temáticos. Es adecuado porque evita crear capítulos duplicados cuando dos artículos separados por horas son la misma información repetida.
- Cronologías de noticias continuadas (breaking news): los editores pueden usar el modelo para marcar cuándo un artículo posterior introduce un desarrollo genuinamente nuevo, en lugar de simplemente repetir la información. El umbral de 4 horas proporciona una primera señal, y el modelo actúa como filtro fino.
- Agregadores de noticias y resúmenes de prensa: para crear resúmenes por capítulos de una historia, el modelo permite identificar los puntos de ruptura relevantes y agrupar los artículos más antiguos bajo un mismo episodio.
- Monitorización de medios de comunicación: en el seguimiento continuado de una historia, el modelo puede etiquetar cada artículo como continuación o nuevo avance, facilitando la generación de informes sobre la evolución de un tema.
- Enriquecimiento de feeds RSS: un sistema que consume noticias en alemán puede usar el modelo para clasificar artículos entrantes dentro de una misma temática como `SAME_DEVELOPMENT` o `NEW_STEP`, permitiendo priorizar los nuevos desarrollos.
- Validación en pipelines de procesamiento de lenguaje natural: dado que el modelo funciona mejor como veto que como detector, puede colocarse tras una regla temporal en un pipeline de segmentación para reducir falsos positivos en la creación de capítulos.

## Benchmarks y rendimiento

La información disponible incluye métricas F1 evaluadas sobre las historias de validación, comparando el modelo con enfoques heurísticos. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Configuracion | F1 |
|---|---|
| Modelo nulo (un capítulo por historia) | 0.450 |
| Modelo solo (sin umbral temporal) | 0.396 |
| Umbral temporal solo (gap >= 4h) | 0.703 |
| Modelo + umbral temporal (ambos) | 0.778 |
| Peor historia en hold-out | 0.600 |

Además, el modelo card indica que la cuantización INT8 no se publica porque, en el punto de operación de 0.05, invierte 14 de 250 decisiones. Esto es relevante para la estabilidad en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporciona explícitamente. Dado que el repositorio tiene 0.4 GB, el modelo ocupa aproximadamente esa cantidad en disco y puede ejecutarse en GPU de consumo con al menos 2 GB de VRAM.
- GPU recomendadas: no disponible; al ser un modelo BERT base, es viable en GPUs de consumo como RTX 3060 o inferiores, así como en CPU.
- Compatibilidad con GPU de consumo: sí, se espera que funcione en configuraciones de escritorio.
- Opciones de despliegue: `transformers.js` para navegador, ONNX Runtime, Hugging Face Transformers para Python.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría que permitan una comparativa directa. El único punto de referencia disponible son los métodos heurísticos presentados en la propia evaluación del modelo: el umbral temporal solo alcanzó un F1 de 0.703, el modelo nulo 0.450, y la combinación de ambos 0.778.

## Limitaciones y advertencias

- Uso aislado: el modelo por sí solo obtiene un F1 de 0.396, inferior al modelo nulo. Debe combinarse necesariamente con un umbral temporal (gap >= 4h) para obtener un resultado útil.
- Sesgo de etiquetado: las etiquetas fueron creadas por un único anotador a partir de titulares, lo que introduce subjetividad y potencial sesgo humano.
- Riesgo de subsegmentación: el modelo tiende a dividir de menos cuando la cobertura es continua, es decir, cuando hay artículos muy seguidos en el tiempo.
- Direccionalidad estricta: intercambiar `text_a` y `text_b` altera la salida; los argumentos deben seguir el orden cronológico de los artículos.
- Ausencia de cuantización INT8: el modelo publicado es solo fp32. Si se usa `transformers.js` sin especificar `quantized: false`, la carga fallará de forma ruidosa por diseño.
- Alcance lingüístico: el modelo está limitado al alemán y no soporta otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero los resultados en producción pueden verse comprometidos si no se aplica la heurística temporal especificada.

## Enlaces

- Hugging Face: https://huggingface.co/GJOE/kompass-followup-model
- No se han encontrado enlaces adicionales relevantes en la búsqueda web (los resultados obtenidos corresponden a recursos ajenos al modelo).
