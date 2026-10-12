# general-forecast/kumo-tabular-large-classifier

## Resumen

Kumo Tabular large classifier es la conversión a safetensors del clasificador tabular `large/classifier.pt` publicado por NVIDIA dentro del repositorio `nvidia/Kumo-Tabular` (revisión `3c3e10bbdb590ace29e7026847f92db3c603096d`). El artefacto lo distribuye la organización general-forecast con el objetivo declarado de facilitar su uso desde la librería `gfi` (generalforecast/gfi). Los pesos no se han modificado respecto al original; solo cambia el formato de serialización y el nombre de los parámetros, que se mantienen tal y como aparecen en el modelo PyTorch de NVIDIA.

Se trata de un modelo especializado en datos tabulares con capacidad de in-context learning, según las etiquetas de la model card (`tabular`, `in-context-learning`, `kumo-tabular`). La red emite probabilidades de clase sobre un máximo de 10 clases, por lo que su función es la clasificación supervisada de registros tabulares. Cuenta con 213.668.602 parámetros y un repositorio de 0,9 GB, lo que lo sitúa en la gama de modelos ligeros que pueden ejecutarse en hardware modesto.

Su relevancia actual radica en que permite reproducir el clasificador tabular de NVIDIA en un stack que consume safetensors directamente, sin depender de PyTorch como formato de pesos. Al derivar de un modelo base publicado por NVIDIA bajo OpenMDW 1.1, la ficha resulta útil para equipos que ya trabajan con Kumo Tabular y quieren integrarlo en la librería `gfi`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre de la arquitectura se almacena en `config.json`, campo `architecture_name`, según la model card) |
| Parametros totales | 213.668.602 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no orientado a texto) |
| Licencia | OpenMDW 1.1 (etiquetada como `license: other` con `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo más allá de que los pesos corresponden a `MODEL_KWARGS["large"]` de la librería `structured-data-models` de NVIDIA, y que su nombre de arquitectura y sus dimensiones se recogen en el `config.json` del repositorio convertido. No se detalla si se trata de un transformer, de un esquema de atención lineal, de un modelo de tipo mixture-of-experts o de otra familia. El dato objetivo disponible es el recuento de parámetros: 213.668.602.

Tampoco se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de ajuste por refuerzo (RLHF, DPO u otras). La model card únicamente indica que la red emite probabilidades de clase sobre un máximo de 10 clases y que los pesos son idénticos a los del modelo original de NVIDIA, por lo que cualquier detalle de entrenamiento habría que consultarlo en la documentación de `nvidia/Kumo-Tabular` y del repositorio NVIDIA/structured-data-models.

## Capacidades

- Clasificación tabular: genera probabilidades de clase para registros de datos tabulares, con un máximo de 10 clases objetivo.
- In-context learning sobre datos tabulares: la etiqueta `in-context-learning` de la model card indica que el modelo está diseñado para inferir tareas a partir del contexto de filas aportado, sin reentrenamiento.
- Conversión de pesos fiel: los pesos se conservan sin cambios respecto al modelo de NVIDIA, por lo que el comportamiento del clasificador original se mantiene.
- Carga mediante safetensors: el repositorio incluye `model.safetensors` y `config.json`, pensados para la librería `gfi`.
- No se documenta generación de texto, razonamiento en lenguaje natural, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documenta ningún modo especial (thinking mode, audio, etc.).

## Casos de uso

- Puntuación de riesgo de crédito: el modelo puede asignar probabilidades de impago a solicitudes descritas en formato tabular, integrándose en un motor de decisión que aplique umbrales sobre las probabilidades emitidas.
- Detección de fraude en transacciones: al trabajar con registros tabulares y hasta 10 clases, permite clasificar operaciones en categorías de riesgo y priorizar su revisión manual.
- Predicción de abandono de clientes (churn): clasificación de clientes en segmentos de permanencia o baja a partir de variables de uso, facturación y antigüedad.
- Triaje clínico sobre datos estructurados: clasificación de pacientes en categorías de gravedad a partir de analíticas y variables demográficas registradas en tablas.
- Cualificación de leads comerciales: etiquetado de contactos entrantes en categorías de conversión para enrutarlos al equipo adecuado.
- Mantenimiento predictivo industrial: clasificación de lecturas de sensores en estados de funcionamiento normal, degradado o fallo inminente, a partir de la tabla de medidas por equipo.
- Control de calidad en fabricación: asignación de lotes a categorías de defecto según las variables medidas en línea de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud, AUC, F1 ni comparaciones con otros clasificadores tabulares, y los resultados de la búsqueda web no aportan datos técnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en FP32 y unos 0,43 GB en FP16/BF16, calculados a partir de los 213.668.602 parámetros. El tamaño del repositorio (0,9 GB) es coherente con pesos en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; no se requiere hardware de clase A100 o H100 para este modelo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4090) y, con toda probabilidad, también en CPU, dado el reducido número de parámetros.
- Opciones de despliegue: la model card menciona la librería `gfi` de generalforecast como destino de la conversión. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible. No se han publicado cifras en la información proporcionada.

## Comparativa con modelos similares

Comparativa disponible únicamente frente al modelo del que deriva, dado que la información proporcionada no incluye datos de otros clasificadores tabulares.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| general-forecast/kumo-tabular-large-classifier | 213.668.602 | no disponible | OpenMDW 1.1 | safetensors | Conversión para `gfi`; pesos sin cambios; hasta 10 clases |
| nvidia/Kumo-Tabular (large/classifier.pt) | no disponible | no disponible | OpenMDW 1.1 | PyTorch (`classifier.pt`) | Modelo base de la conversión; misma red y mismos pesos |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación tabular con in-context learning) en los materiales facilitados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta análisis de sesgo ni de equidad.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de calibración incorrecta de las probabilidades de clase en dominios alejados de los datos de entrenamiento del modelo original.
- Límite de clases: la red emite probabilidades sobre un máximo de 10 clases; tareas con más categorías quedan fuera de su alcance tal y como se describe.
- Limitación de contexto e idioma: no se documenta longitud de contexto ni soporte de idiomas; es un modelo tabular, no lingüístico.
- Restricciones de licencia: se distribuye bajo OpenMDW 1.1 y la model card conserva el aviso de copyright de NVIDIA y el texto de licencia en el fichero `LICENSE`. Conviene revisar OpenMDW 1.1 antes de un uso comercial, ya que la etiqueta de HuggingFace figura como `license: other`.
- Trazabilidad: los pesos no han sido modificados, por lo que cualquier limitación del modelo original de NVIDIA se hereda íntegramente.
- Advertencia para producción: el repositorio registra 0 descargas y 0 valoraciones, y la librería `gfi` es específica del ecosistema generalforecast; conviene validar el pipeline de carga y la paridad numérica con el modelo PyTorch original antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/general-forecast/kumo-tabular-large-classifier
- Modelo base: https://huggingface.co/nvidia/Kumo-Tabular
- Librería gfi: https://github.com/generalforecast/gfi
- Repositorio de NVIDIA structured-data-models: https://github.com/NVIDIA/structured-data-models
