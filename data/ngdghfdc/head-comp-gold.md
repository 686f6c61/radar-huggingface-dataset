# ngdghfdc/head-comp-gold

## Resumen

head-comp-gold es un modelo de decisión para clasificación de completitud de respuestas, publicado por el usuario ngdghfdc en HuggingFace. Se trata de un fine-tune completo del checkpoint convaiinnovations/laya (Apache-2.0) especializado en una única tarea: etiquetar una respuesta en una de cuatro clases —`complete`, `half-answer`, `blank` y `overflow-to-margin`— en una sola pasada de encoder, con latencia declarada del orden de milisegundos en GPU. El modelo tiene 421.293.830 parámetros y se distribuye en formato safetensors.

El problema que resuelve es de enrutamiento y señalización dentro de flujos de agentes y de corrección de exámenes (el autor lo enmarca en "examflow"). No genera texto ni mantiene conversaciones: emite una decisión que un dispatcher puede consumir para decidir si una respuesta es aceptable, está a medias, está en blanco o se desborda del margen. Es, por tanto, una pieza de infraestructura más que un modelo generativo.

Su relevancia es limitada y muy acotada: el propio autor advierte que se entrenó sobre una distribución sintética, que la confianza no está calibrada y que no debe usarse como juez final. El repositorio no tiene descargas ni likes en el momento de redactar esta ficha y no aporta datos sobre idiomas, contexto ni benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision basado en encoder, fine-tune de convaiinnovations/laya; detalles internos del checkpoint base no disponibles |
| Parametros totales | 421.293.830 (421 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos safetensors completos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sin pickle ni ejecucion de codigo al cargar) |
| Tarea | Clasificacion de completitud: `complete`, `half-answer`, `blank`, `overflow-to-margin` |
| Libreria de carga | laya (`Agent(model_id_or_path=...)`) |
| Tamano del repositorio | 1,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor describe el modelo como un clasificador que opera en una única pasada de encoder, lo que implica una arquitectura tipo transformer encoder y una cabecera de clasificación sobre cuatro opciones. No se documenta ni la profundidad, ni la dimensionalidad, ni el vocabulario, ni la longitud de contexto del checkpoint base convaiinnovations/laya. El modelo se carga mediante la librería `laya` y el autor proporciona un ejemplo de uso con `agent.predict(state, {...})`, donde el estado se acompaña de la pregunta, su tipo y los criterios de decisión.

El entrenamiento se realizó íntegramente en dos GPU T4 de Kaggle (coste declarado de 0 dólares) con full fine-tune de 3 épocas, learning rate 2e-5, batch size 8 y precisión bf16. El conjunto de entrenamiento son 2.000 casos de verdad de construcción (gold construction-truth), con trampas de respuesta concisa y sin solapamiento con el conjunto de evaluación. Para evitar el colapso hacia el prior de clase, el autor baraja el orden de las opciones por muestra y utiliza tres variantes de instrucción. No se menciona RLHF, DPO ni ninguna otra fase de alineamiento.

## Capacidades

- Clasificación de respuestas en cuatro categorías mutuamente excluyentes: completa, media respuesta, en blanco y desbordamiento al margen.
- Inferencia en una sola pasada de encoder, con latencia declarada del orden de milisegundos en GPU.
- Salida orientada a enrutamiento: pensada para alimentar un dispatcher o una capa de señal, no para generar texto.
- Soporte de instrucciones y criterios variables en la llamada de predicción (el ejemplo de la model card pasa criterios por opción).
- Robustez frente al orden de opciones y a variantes de instrucción, por el diseño del entrenamiento.
- No documenta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento.

## Casos de uso

- Enrutamiento en pipelines de agentes: cada respuesta generada por un LLM se envía a head-comp-gold y el resultado (`complete`, `half-answer`, `blank`, `overflow-to-margin`) determina si se acepta, se reintenta o se escala a otro modelo. Es adecuado porque la decisión cuesta una pasada de encoder en lugar de una generación completa.
- Pre-filtro de calidad en corrección automática de exámenes: el modelo marca las respuestas en blanco o desbordadas del margen antes de invocar a un corrector semántico más caro, reduciendo el volumen que llega a las etapas siguientes.
- Capa de abstención con umbral: integrado con un umbral tau, el sistema deriva a revisión humana todo lo que quede por debajo, tal y como recomienda el autor. Sirve para no automatizar decisiones ambiguas.
- Triaje de colas de anotación: ordenar un lote de respuestas por clase de completitud permite que los revisores humanos empiecen por los casos "half-answer", que son los que requieren intervención.
- Control de bucles de auto-corrección: cuando una respuesta se clasifica como incompleta, el orquestador puede reenviar la pregunta al generador con una instrucción de completado, usando la etiqueta como señal de realimentación.
- Optimización de coste por muestreo en cascada: las respuestas clasificadas como completas se aceptan con el modelo pequeño, y solo las dudosas pasan al modelo grande, reduciendo el gasto de inferencia en producción.
- Detección de desbordamiento en digitalización de documentos: en un flujo de OCR más clasificación, la clase `overflow-to-margin` identifica respuestas que exceden el espacio previsto en el formulario, un caso útil para validación de formatos.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son sobre su propia evaluación sintética retenida. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark estándar.

| Evaluacion | Metrica | head-comp-gold | Baseline heuristico |
|---|---|---|---|
| Held-out sintetico (n=160) | Precision (accuracy) | 0,9688 | 0,900 |

La mejora declarada respecto al heurístico es de 6,9 puntos porcentuales. El autor insiste en que esta evaluación procede de una distribución sintética y que demuestra que el bucle de entrenamiento funciona, no la precisión en el mundo real. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 421 M de parametros, no confirmada por el autor): en FP32 en torno a 1,7 GB, en FP16/BF16 en torno a 0,84 GB y en INT8 en torno a 0,42 GB. Al no distribuirse versiones cuantizadas, los valores INT son estimaciones aritmeticas.
- Cabe en cualquier GPU de consumo actual: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 o superiores. Tambien es plausible su ejecucion en CPU, aunque el autor solo declara latencias en GPU.
- GPU profesionales: A100, H100 o L4 no son necesarias para inferencia dado el tamano del modelo; el entrenamiento declarado se hizo con dos T4 de 16 GB en Kaggle.
- Opciones de despliegue documentadas: unicamente la libreria `laya`, cargando el repositorio por identificador o ruta. No hay instrucciones para vLLM, llama.cpp, Ollama, TGI ni ONNX.
- Latencia y throughput: el autor declara "~ms on GPU" por pasada, sin cifras concretas de tokens por segundo ni de peticiones concurrentes. No disponible mas detalle.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar con modelos de la misma categoria. La tabla recoge las referencias mencionadas en la model card, con los campos no documentados marcados como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| head-comp-gold | 421 M | no disponible | 0,9688 en eval sintetico propio (n=160) | Apache-2.0 | HuggingFace, 0 descargas |
| convaiinnovations/laya (base) | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| Baseline heuristico | No aplica | No aplica | 0,900 en el mismo eval | No aplica | No distribuido |

No se conocen otros modelos comparables de clasificacion de completitud de respuestas dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Distribucion sintetica: el autor advierte explicitamente de que el modelo demuestra el bucle de entrenamiento, no la precision en datos reales. El 0,9688 procede de un conjunto sintetico retenido de 160 ejemplos.
- Confianza sin calibrar: el autor indica que las temperaturas del checkpoint base son invalidas y que es necesario reajustarlas por cabeza antes de fiarse de las probabilidades. Hasta entonces, la confianza no debe usarse como criterio de decision.
- No es juez final: debe actuar como capa de dispatcher o de senal, con abstencion por debajo de un umbral tau. Usarlo como decision final en produccion no esta respaldado por el autor.
- Sesgos: no se documentan analisis de sesgo. Al ser un clasificador de cuatro clases, el riesgo principal es el colapso hacia la clase mayoritaria, mitigado en entrenamiento con barajado de opciones pero no verificado en evaluacion externa.
- Riesgo de error de clasificacion: un falso `complete` deja pasar respuestas incompletas, y un falso `half-answer` genera reintentos innecesarios. No es un modelo generativo, por lo que el riesgo de alucinacion de texto no aplica, pero si el de etiquetado erroneo.
- Idiomas: no disponibles. No hay ninguna indicacion sobre si el modelo funciona fuera del ingles.
- Contexto: no disponible. Se desconoce la longitud maxima de entrada admitida.
- Licencia: Apache-2.0 permite uso comercial y modificacion sin restricciones adicionales documentadas. Al derivar de convaiinnovations/laya, conviene verificar que la licencia del checkpoint base se mantiene en la practica.
- Validacion externa nula: cero descargas y cero likes, sin evaluaciones independientes ni informes de terceros.
- Metadatos anomalos: el repositorio figura creado y actualizado el 27 de septiembre de 2026, con una diferencia de siete minutos entre ambas marcas, lo que apunta a un artefacto de metadatos o a una fecha mal registrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngdghfdc/head-comp-gold
- Checkpoint base: https://huggingface.co/convaiinnovations/laya
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada.
