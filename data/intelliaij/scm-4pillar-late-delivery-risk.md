# intelliaij/scm-4pillar-late-delivery-risk

## Resumen

SCM 4-Pillar Late-Delivery Risk es un clasificador binario de gradient boosting implementado con LightGBM que estima la probabilidad de que un pedido se entregue con retraso. Lo publica el usuario intelliaij en Hugging Face y se entrena sobre el dataset publico DataCo Smart Supply Chain, con 144.415 pedidos para entrenamiento y 36.104 para evaluacion. Las variables de entrada se organizan en cuatro "pilares" de gestion de cadena de suministro: planificacion de demanda, gestion de inventario, logistica y distribucion, y un proxy de colaboracion con proveedores.

El modelo no es un modelo de lenguaje ni un transformer: es un clasificador tabular clasico, por lo que no tiene ventana de contexto, tokenizador, pesos en safetensors ni cuantizacion en el sentido habitual. Su relevancia es practica: la prediccion anticipada de retrasos es un caso de uso clasico de analitica de cadena de suministro con retorno operativo directo, y este repositorio ofrece un punto de partida reproducible sobre un dataset abierto muy utilizado en docencia e investigacion.

Las metricas declaradas por el autor son AUC-ROC 0,785, exactitud del 72 %, precision 0,80 y recall 0,64 para la clase "tardia". El propio autor restringe el uso a fines educativos y de investigacion y advierte de que el pilar de colaboracion con proveedores se construye con un proxy, no con datos reales de KPI de proveedor, por lo que no debe emplearse en decisiones operativas sin validacion adicional. El repositorio no declara licencia ni idiomas, y su tamano aparece como 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre arboles de decision, histogram-based y crecimiento leaf-wise) |
| Parametros totales | no disponible (no se publican numero de arboles, hojas ni profundidad) |
| Longitud de contexto | no aplicable: la entrada es un vector de caracteristicas tabulares por pedido, de dimension no publicada |
| Tipos de cuantizacion | no disponible (no aplicable: LightGBM no utiliza cuantizacion de pesos al estilo de los modelos neuronales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; la libreria declarada es lightgbm y el tamano del repositorio figura como 0.0 GB, por lo que no se confirma que los artefactos del modelo esten publicados |
| Tarea | clasificacion tabular binaria (entrega tardia frente a entrega puntual) |
| Dataset de entrenamiento | DataCo Smart Supply Chain |
| Volumen de entrenamiento | 144.415 pedidos de entrenamiento y 36.104 de evaluacion |
| Entrada | vector de caracteristicas derivadas de los cuatro pilares de SCM |
| Salida | probabilidad o etiqueta binaria de riesgo de entrega tardia |
| Autor | intelliaij |
| Fecha de creacion en Hugging Face | 2026-09-23 (segun metadatos del repositorio) |
| Fecha de ultima actualizacion | 2026-09-23 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador LightGBM, es decir, un ensamblado de arboles de decision entrenado con gradient boosting sobre histogramas de caracteristicas. LightGBM crece los arboles por hoja (leaf-wise) en lugar de por nivel, lo que reduce el numero de divisiones necesarias para alcanzar una perdida dada en datos tabulares de dimension moderada. Al ser un modelo de arboles, no hay atencion, ni embeddings, ni fase de RLHF o DPO; el ajuste se realiza minimizando una funcion de perdida de clasificacion binaria sobre el conjunto de entrenamiento.

La informacion disponible no detalla hiperparametros (learning rate, numero de arboles, profundidad, regularizacion L1/L2, submuestreo de filas y columnas), ni el proceso de seleccion de caracteristicas, ni si hubo busqueda de hiperparametros o validacion cruzada. Tampoco se especifica el reparto exacto de clases ni el metodo de particion entre entrenamiento y prueba. La innovacion declarada es de ingenieria de caracteristicas: organizar las variables en cuatro pilares de SCM (planificacion de demanda, gestion de inventario, logistica y distribucion, y un proxy de colaboracion con proveedores). El autor reconoce explicitamente que este cuarto pilar se construye a partir de una tasa historica de retrasos agregada a nivel de departamento, y no de KPI reales de proveedor, porque el dataset de origen no contiene campos como identificador de proveedor, lead time o indicadores de calidad.

## Capacidades

- Clasificacion binaria tabular: estima si un pedido tiene riesgo de entrega tardia a partir de un vector de caracteristicas precalculadas.
- Puntuacion por lotes: puede aplicarse sobre tablas de pedidos completas, lo que permite priorizar revisiones manuales por probabilidad estimada.
- Interpretabilidad mediante importancia de variables y valores SHAP, propia de los modelos de arboles, util para auditar que caracteristicas dominan la prediccion.
- No dispone de generacion de texto, razonamiento en lenguaje natural, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni uso como agente.
- No soporta razonamiento multi-paso ni modos de pensamiento.
- No tiene capacidades multilingues: no procesa texto libre, solo variables tabulares.
- No se ha publicado informacion sobre capacidad de recalibrado, versionado de caracteristicas o monitorizacion de deriva.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles del enfoque, pero dado que el propio autor restringe el uso a fines educativos y de investigacion, cualquiera de ellos exigiria validacion con datos propios antes de pasar a produccion.

- Priorizacion de pedidos en riesgo para revision manual: el modelo asigna una probabilidad de retraso a cada pedido abierto y el equipo de operaciones revisa primero los de mayor puntuacion, aprovechando la precision de 0,80 declarada para la clase tardia y reduciendo el volumen de revisiones.
- Prototipo docente de analitica de cadena de suministro: sirve como ejemplo completo de pipeline tabular (ingenieria de caracteristicas, entrenamiento, evaluacion con AUC-ROC y analisis de errores) en cursos de ciencia de datos aplicada.
- Reproduccion y comparacion de resultados en investigacion: al estar construido sobre el dataset DataCo, permite contrastar tecnicas de ingenieria de caracteristicas o de seleccion de modelos frente a una linea base documentada.
- Simulacion de escenarios logisticos: variando caracteristicas como modo de envio, region o antiguedad del pedido, se puede observar como cambia la probabilidad estimada, sin implicar decisiones reales.
- Analisis de importancia de variables para hipotesis de negocio: extraer que pilares y que caracteristicas pesan mas en el riesgo permite generar hipotesis sobre cuellos de botella logisticos, siempre que se contrasten con datos operativos.
- Integracion como senal auxiliar en un sistema de alertas: en un entorno controlado, la puntuacion del modelo podria alimentar un panel de monitorizacion de retrasos, con umbrales ajustados segun el coste relativo de falsos positivos y falsos negativos.
- Estudio de sesgo y equidad en scoring operativo: al ser un modelo interpretable, es adecuado para analizar si determinadas regiones, departamentos o modos de envio reciben sistematicamente puntuaciones de riesgo mas altas.

## Benchmarks y rendimiento

Metricas declaradas por el autor en la model card, evaluadas sobre 36.104 pedidos retenidos:

| Metrica | Valor |
|---|---|
| AUC-ROC | 0,785 |
| Exactitud (accuracy) | 72 % |
| Precision (clase tardia) | 0,80 |
| Recall (clase tardia) | 0,64 |
| F1 (clase tardia) | ~0,71 (valor derivado de precision y recall; el autor no lo publica) |

No se han publicado resultados de benchmarks comparativos frente a otros modelos en la informacion disponible. Tampoco se indica la tasa base de entregas tardias en el conjunto de evaluacion, dato imprescindible para interpretar una exactitud del 72 % frente a una linea base trivial.

## Requisitos de hardware

- VRAM para inferencia: no aplicable; LightGBM ejecuta la inferencia en CPU por defecto. No hay dato publicado sobre uso de memoria.
- GPU recomendadas: no aplicable en la configuracion estandar. LightGBM admite entrenamiento e inferencia en GPU con compilaciones especificas (GPU build, Treelite), pero no hay informacion de que este modelo se haya entrenado o desplegado asi.
- Cabe en GPU de consumo: no aplica; el modelo cabe en CPU. Cualquier portatil con Python y la libreria lightgbm puede ejecutarlo.
- Memoria RAM: no disponible. Como referencia orientativa, no confirmada por el autor, la carga en pandas de un conjunto del orden del dataset de origen (mas de 180.000 filas con decenas de columnas) suele requerir del orden de pocos GB de RAM; conviene verificar con los ficheros reales.
- Opciones de despliegue: servicio Python con FastAPI o Flask, serializacion nativa de LightGBM (.txt o .pkl), exportacion a ONNX con skl2onnx o onnxmltools y ejecucion con ONNX Runtime, compilacion con Treelite, y orquestacion con MLflow, BentoML o SageMaker. Para volúmenes muy grandes, procesamiento distribuido con Spark mediante SynapseML o MMLSpark.
- Latencia y throughput: no disponibles. Dependen del numero de arboles, la profundidad y el hardware, y el autor no publica ninguna cifra.

## Comparativa con modelos similares

No hay resultados publicados de otros modelos sobre este mismo conjunto de datos en la informacion disponible, por lo que la comparacion se limita a caracteristicas metodologicas.

| Modelo | Tipo | Parametros | Contexto | Rendimiento en este dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| scm-4pillar-late-delivery-risk (intelliaij) | LightGBM, clasificacion tabular binaria | no disponible | no aplicable | AUC-ROC 0,785; exactitud 72 %; precision 0,80; recall 0,64 | no disponible | repositorio de Hugging Face con 0 descargas y 0 likes |
| XGBoost o CatBoost sobre las mismas caracteristicas | Gradient boosting tabular | no disponible | no aplicable | no disponible | licencia del framework, no del modelo | alternativas genericas, no publicadas para este dataset |
| Regresion logistica sobre las mismas caracteristicas | Modelo lineal | no disponible | no aplicable | no disponible | no disponible | linea base habitual, no publicada para este dataset |
| Analisis de la literatura (Springer, 2025) sobre prediccion de retrasos | Machine learning aplicado a cadena de suministro | no disponible | no aplicable | no disponible | no disponible | capitulo de libro indexado |
| Proyecto SupplyChain-LateDeliveryRisk (GitHub, Pegah-Ardehkhani) | Analisis y prediccion con varios modelos de ML | no disponible | no aplicable | no disponible | no disponible | repositorio publico |

## Limitaciones y advertencias

- El propio autor indica que el modelo es para uso educativo y de investigacion y que no debe emplearse en decisiones operativas reales sin validacion adicional.
- El pilar de colaboracion con proveedores no usa datos reales de proveedor: se aproxima mediante la tasa historica de retrasos a nivel de departamento, porque el dataset de origen carece de campos como supplier_id, lead time o indicadores de calidad. Esto limita la capacidad del modelo para capturar riesgo especifico de proveedor.
- Riesgo de alucinacion: no aplica en sentido estricto porque el modelo no genera lenguaje. El riesgo equivalente es el error de clasificacion, con una precision de 0,80 y un recall de 0,64 en la clase tardia, es decir, aproximadamente un tercio de los retrasos reales no se detectarian con el umbral evaluado.
- La exactitud del 72 % no puede interpretarse sin conocer la tasa base de retrasos en el conjunto de prueba, dato no publicado. Si la clase tardia fuese mayoritaria, una linea base trivial podria acercarse a esa cifra.
- No se documentan hiperparametros, criterio de particion de datos ni validacion cruzada, lo que dificulta reproducir el resultado y estimar su varianza.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Tampoco se declaran idiomas, algo irrelevante aqui porque la entrada es tabular.
- El repositorio figura con 0 descargas, 0 likes y un tamano de 0.0 GB, sin evidencia de adopcion ni confirmacion de que los artefactos del modelo esten efectivamente publicados.
- No hay informacion sobre el sesgo del dataset DataCo ni sobre su representatividad geografica o sectorial; los patrones aprendidos pueden no transferirse a otras cadenas de suministro.
- No se ha publicado ninguna estrategia de recalibrado, monitorizacion de deriva ni versionado de caracteristicas, pasos imprescindibles en cualquier despliegue real.
- Los metadatos indican una fecha de creacion de 2026-09-23; conviene verificar este dato antes de citar el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intelliaij/scm-4pillar-late-delivery-risk
- Articulo en Colab.ws (Supply Chain Analytics to Predict the Risk of Late Delivery): https://colab.ws/articles/10.1007%2F978-981-96-2647-2_6
- Articulo en ResearchGate: https://www.researchgate.net/publication/392475713_Supply_Chain_Analytics_to_Predict_the_Risk_of_Late_Delivery_A_Machine_Learning_Approach
- Capitulo en Springer: https://link.springer.com/chapter/10.1007/978-981-96-2647-2_6
- PDF del capitulo en Springer: https://link.springer.com/content/pdf/10.1007/978-981-96-2647-2_6
- Proyecto en GitHub (SupplyChain-LateDeliveryRisk, Pegah-Ardehkhani): https://github.com/Pegah-Ardehkhani/SupplyChain-LateDeliveryRisk
