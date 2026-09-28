# ngdghfdc/head-bbox-gold

## Resumen

head-bbox-gold es un modelo de decisión (decision-model) afinado a partir de `convaiinnovations/laya` por el usuario ngdghfdc, dentro del proyecto examflow. Su única tarea es el control de calidad (QC) de cajas delimitadoras (bounding boxes), clasificando cada caso en una de seis categorías: `ok`, `shifted`, `overlapping`, `cut-off`, `wrong-size` y `duplicate`. Resuelve un problema muy concreto de los pipelines de visión artificial: separar las anotaciones correctas de las defectuosas sin intervención humana, en una sola pasada de encoder.

El modelo cuenta con 421.293.830 parámetros (~421 M) según los pesos reales en safetensors, y se distribuye bajo licencia Apache-2.0 con un tamaño de repositorio de 1,7 GB. La model card declara que el fine-tune es completo (full fine-tune) sobre el checkpoint base de Laya y que la inferencia se realiza en una única pasada de encoder, del orden de milisegundos en GPU.

Es relevante ahora porque aborda un cuello de botella habitual en la anotación de datos de detección de objetos: la verificación automática de la coherencia de las cajas antes de que entren en un conjunto de entrenamiento. No obstante, su propio autor advierte de que se ha entrenado con datos sintéticos y de que debe usarse como capa de señalización, nunca como juez final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión basado en encoder (fine-tune de `convaiinnovations/laya`); detalles internos no disponibles |
| Parametros totales | 421.293.830 (~421 M) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuye `model.safetensors`) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `convaiinnovations/laya`, una librería y familia de modelos de decisión con licencia Apache-2.0. La model card indica que trabaja en una sola pasada de encoder, con latencias del orden de milisegundos en GPU, y que la salida es una elección discreta entre seis etiquetas de QC de bounding boxes. No se detalla en la información disponible el número de capas, la dimensión del modelo, el tipo de atención ni la composición exacta del dataset base de Laya.

El entrenamiento se realizó íntegramente con recursos gratuitos (dos GPU T4 de Kaggle), durante 3 épocas, con learning rate 2e-5, batch de 8 y precisión bf16, sobre 2.000 casos "gold" de verdad de construcción (incluyendo trampas de reflow coherente) y sin solapamiento con el conjunto de evaluación. Para evitar el colapso de prior, se barajó el orden de las opciones por muestra y se usaron tres variantes de instrucción. La evaluación se hizo sobre un conjunto sintético retenido (n=180), con una puntuación de 1,0000 frente a 0,872 de la heurística de referencia (+12,8 puntos porcentuales).

## Capacidades

- Clasificación de bounding boxes en seis categorías de QC: `ok`, `shifted`, `overlapping`, `cut-off`, `wrong-size` y `duplicate`.
- Uso de características v2 de deriva de caja de referencia (reference-box drift) y coherencia, incluidos trampas de reflow coherente.
- Inferencia en una sola pasada de encoder, con latencia declarada del orden de milisegundos en GPU.
- Integración vía la librería `laya` mediante la API `Agent`, con predicción basada en un estado y un diccionario de pregunta/criterios de tipo `choice`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo emite una única decisión discreta).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; la tarea es de decisión sobre cajas, no de generación de texto abierto.

## Casos de uso

- Control de calidad en pipelines de anotación de imágenes: cada bounding box generada por un anotador o por un modelo se pasa por head-bbox-gold, que devuelve una etiqueta (`ok`, `shifted`, `overlapping`, `cut-off`, `wrong-size`, `duplicate`) para decidir si se acepta o se rechaza antes de incorporarla al dataset.
- Señal previa al revisor humano: como capa de despacho (dispatcher/signal layer), el modelo marca los casos dudosos y solo estos se envían a revisión humana, reduciendo el coste de QC. La model card exige abstenerse por debajo de un umbral tau.
- Detección de duplicados en conjuntos de detección de objetos: la clase `duplicate` permite filtrar anotaciones repetidas que inflarían artificialmente el dataset de entrenamiento de un detector.
- Verificación de reflow coherente en documentos: los casos "gold construction-truth" con reflow coherente que se usaron en entrenamiento corresponden a un escenario donde la reordenación del contenido puede desplazar cajas; el modelo sirve para validar que la caja sigue siendo correcta tras el reflow.
- Auto-etiquetado y active learning: al puntuar cajas candidatas, se puede priorizar qué muestras etiquetar o revisar manualmente, alimentando un bucle de mejora del dataset.
- Filtrado previo al entrenamiento de detectores: integrar el modelo como paso de validación en un pipeline de datos evita que anotaciones defectuosas (`shifted`, `cut-off`, `wrong-size`) contaminen el entrenamiento de un modelo de detección.
- Monitorización de deriva en producción: si un sistema que genera cajas en producción empieza a producir más `shifted` o `overlapping` de lo habitual, la distribución de etiquetas del modelo puede usarse como señal de alerta sobre cambios en los datos de entrada.

## Benchmarks y rendimiento

| Evaluacion | head-bbox-gold | Heuristica | Diferencia |
|---|---|---|---|
| Evaluacion sintetica retenida (n=180) | 1.0000 | 0.872 | +12,8 pp |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.), que ademas no serian aplicables a un modelo de decision de QC de bounding boxes.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de ~421 M de parametros, en fp16/bf16 los pesos ocupan aproximadamente 0,85 GB; sumando activaciones y overhead, el modelo cabe holgadamente en GPUs de consumo (estimacion propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM libre deberia ser suficiente; el autor entreno en 2 x T4 de Kaggle y declara latencias de milisegundos en GPU.
- GPU de consumo: si, cabe en tarjetas de consumo habituales (por ejemplo, RTX 3060, 4060, 4090 y equivalentes), dado el reducido numero de parametros.
- Opciones de despliegue: la via documentada es la libreria `laya` (`from laya import Agent`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor declara una unica pasada de encoder "~ms on GPU"; no se publican cifras concretas de throughput ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ngdghfdc/head-bbox-gold | 421.293.830 | No disponible | 1.0000 en eval sintetica (n=180) | Apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| convaiinnovations/laya (base) | No disponible en la informacion | No disponible | No disponible | Apache-2.0 | HuggingFace |
| Otros modelos de QC de bounding boxes | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de terceros en la informacion proporcionada. La unica referencia directa es el checkpoint base `convaiinnovations/laya`, del que este modelo es un fine-tune.

## Limitaciones y advertencias

- Distribucion sintetica: la model card advierte explicitamente de que el entrenamiento y la evaluacion son sinteticos; demuestra que el bucle funciona, no la precision en el mundo real.
- Confianza sin calibrar: la temperatura por cabeza no esta calibrada hasta que se reajusta (per-head refit); el checkpoint base incluye temperaturas invalidas, por lo que hay que reajustarlas antes de fiarse de la confianza.
- No debe actuar como juez final: el autor lo define como capa de despacho o de senal, con obligacion de abstenerse por debajo del umbral tau.
- Sesgos conocidos: no disponibles, pero al entrenarse sobre datos sinteticos de construccion puede heredar los sesgos de esa distribucion.
- Riesgo de alucinacion: en un modelo de decision discreta, el equivalente es una clasificacion erronea confiada; la falta de calibracion agrava este riesgo.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se desconoce la licencia y condiciones de las dependencias de la libreria `laya` mas alla de la del propio checkpoint.
- Caveat de produccion: con 0 descargas y 0 likes, el modelo no tiene validacion externa ni comunidad que lo respalde; conviene tratarlo como experimental.
- Formato seguro: se distribuye `model.safetensors`, sin pickle ni ejecucion de codigo al cargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngdghfdc/head-bbox-gold
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
