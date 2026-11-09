# Daemons-Q/qsh-finance-aml-mlp-large

## Resumen

qsh-finance-aml-mlp-large es un perceptrón multicapa (MLP) de muy pequeno tamano (12.610 parametros) desarrollado por Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostracion de orquestacion quantum-safe. El modelo resuelve una tarea de clasificacion tabular binaria: deteccion de blanqueo de capitales (anti-money laundering, AML) sobre el corpus sintetico IBM AMLworld HI-Small. Su interes no reside en la precision bruta, sino en que sus capas lineales se ejecutan bajo cifrado homomorfico CKKS y sus funciones de activacion ReLU y el argmax bajo computacion multipartita (MPC), lo que lo convierte en una pieza de referencia para medir el coste de la inferencia cifrada en un caso financiero.

La arquitectura es una red densa de cuatro capas [32, 128, 64, 2] con activacion ReLU, entrenada sobre 32 caracteristicas de ingenieria derivadas de las transacciones de AMLworld. Se publica en formato ONNX y esta pensada para ejecutarse en el navegador mediante onnxruntime-web. El modelo se distribuye como "tier model" dentro de una familia de variantes de distinto coste computacional para el mismo caso de uso.

Es relevante ahora porque ejemplifica una linea de trabajo emergente: modelos deliberadamente pequenos y auditables cuyo objetivo es demostrar privacidad en inferencia (el dato nunca se descifra) en dominios regulados como el financiero. No obstante, el propio autor lo declara como prueba de concepto de investigacion, no como sistema de produccion, y sus metricas sobre la clase minoritaria quedan muy por debajo de las lineas base publicadas para el mismo corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso [32, 128, 64, 2] con activacion ReLU |
| Parametros totales | 12.610 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular; entrada de 32 caracteristicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | CDLA-Sharing-1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un perceptron multicapa completamente conectado con dimensiones [32, 128, 64, 2]: recibe 32 caracteristicas de ingenieria (agregados por cuenta derivados de AMLworld) y produce dos logits para clasificacion binaria. Las capas lineales estan disenadas para ejecutarse bajo el esquema de cifrado homomorfico CKKS, mientras que las ReLU y el argmax se delegan a MPC. Esta separacion responde a la restriccion practica de que CKKS solo soporta operaciones lineales y polinomiales de forma eficiente, por lo que las no linealidades requieren un protocolo interactivo.

El entrenamiento se realizo sobre la ventana de ajuste del split del proyecto (2.843.872 transacciones), con validacion sobre 710.969 y test sobre 1.523.504. Se usaron pesos de clase para compensar el fuerte desbalance (aproximadamente 1 transaccion de blanqueo por cada 981) y no se aplico destilacion desde el modelo profesor; la semilla se selecciono sobre la ventana de validacion y el registro incluye la metrica de todas las semillas. El tiempo de entrenamiento medido fue de 101,5 segundos. El dataset IBM AMLworld HI-Small es enteramente sintetico, generado por IBM con un modelo de mundo virtual multiagente, y cubre diez dias (1-10 de septiembre de 2022), aunque la ventana de test del proyecto se extiende hasta el 18 de septiembre por filas de cola incluidas por el creador del corpus.

## Capacidades

- Clasificacion binaria tabular de transacciones o cuentas como sospechosas o no sospechosas de blanqueo de capitales.
- Inferencia sobre datos cifrados: capas lineales bajo CKKS y no linealidades bajo MPC, sin descifrar la entrada en ningun punto del pipeline.
- Ejecucion en navegador mediante onnxruntime-web, lo que permite despliegue del lado del cliente sin exposicion del dato.
- Acuerdo con el modelo profesor (teacher_agreement) de 0,998254 sobre las etiquetas evaluadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador tabular puro.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Evaluacion del coste de inferencia cifrada en un dominio financiero: el modelo sirve como referencia para medir latencia y sobrecarga de CKKS + MPC en una red de 12.610 parametros antes de escalar a arquitecturas mayores.
- Demostracion de privacidad en scoring de riesgo: una entidad podria puntuar una cuenta sin que el proveedor del servicio de inferencia vea los datos subyacentes, gracias al pipeline CKKS/MPC.
- Prototipo de deteccion de blanqueo sobre datos sinteticos: util para validar pipelines de caracteristicas y protocolos de evaluacion antes de disponer de datos reales, dado que no existe un corpus comercial de transacciones reales de blanqueo.
- Despliegue en navegador para auditoria interactiva: al estar en ONNX y ejecutarse con onnxruntime-web, permite demostraciones donde el usuario mantiene el control del dato.
- Comparacion de tiers de coste: al formar parte de una familia de variantes, permite contrastar el compromiso entre tamano del modelo y coste de inferencia cifrada en el mismo caso de uso.
- Docencia e investigacion en cifrado homomorfico aplicado: caso concreto y reproducible para estudiar la separacion entre operaciones lineales (CKKS) y no lineales (MPC) en una red neuronal.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| accuracy | 0,997466 |
| auprc | 0,127404 |
| auprc_baseline | 0,00152346 |
| auroc | 0,924834 |
| minority_class_f1 | 0,206414 |
| max_of_seeds_minority_f1 | 0,206414 |
| median_of_seeds_minority_f1 | 0,185361 |
| min_of_seeds_minority_f1 | 0,132521 |
| precision | 0,197405 |
| recall | 0,216286 |
| teacher_agreement | 0,998254 |
| n_train | 2.843.872 |
| n_val | 710.969 |
| n_test | 1.523.504 |
| wall_clock_s | 101,5 |

Lineas base publicadas citadas por el autor (no medidas en este repositorio):

| Referencia | Metrica (minority-class F1) |
|---|---|
| GFP + XGBoost (Altman et al., NeurIPS 2023) | 0,6323 |
| GFP + LightGBM (Altman et al., NeurIPS 2023) | 0,6286 |
| PNA (Altman et al., NeurIPS 2023) | 0,5677 |
| Multi-FraudGT (Bilgi y Atasu, TMLR 2026) | 0,7581 |
| MEGA-PNA (Bilgi y Atasu, TMLR 2026) | 0,7401 |
| MEGA-GenAgg (Bilgi y Atasu, TMLR 2026) | 0,7448 |
| Multi-PNA (Bilgi y Atasu, TMLR 2026) | 0,6735 |

El autor senala que la comparacion directa con estas lineas base no es homogenea: aquellas usan patrones de subgrafo por transaccion o paso de mensajes, mientras que estas 32 caracteristicas son agregados por cuenta. La comparacion que el autor considera significativa es con su propio profesor de gradient boosting sobre las mismas caracteristicas: AUPRC de 0,1274 frente a 0,1233 del profesor en la misma ventana de test.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en precision nativa (12.610 parametros); el cuello de botella no es la memoria sino el coste criptografico.
- GPU recomendadas: no aplica en el sentido habitual; el modelo cabe en cualquier CPU. Para el pipeline CKKS/MPC, el rendimiento depende de la implementacion criptografica, no de la GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; puede ejecutarse en navegador.
- Opciones de despliegue: ONNX Runtime, onnxruntime-web (navegador) y el stack criptografico del proyecto QSMPC-QKD-QHE-AI-Hybrid para inferencia cifrada.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el tiempo de entrenamiento (101,5 s); no se reportan cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Minority-class F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-finance-aml-mlp-large | 12.610 | no aplica | 0,2064 | CDLA-Sharing-1.0 | Hugging Face (ONNX) |
| GFP + XGBoost (Altman et al.) | no disponible | no aplica | 0,6323 | no disponible | referencia bibliografica |
| MEGA-PNA (Bilgi y Atasu) | no disponible | no aplica | 0,7401 | no disponible | referencia bibliografica |
| Multi-FraudGT (Bilgi y Atasu) | no disponible | no aplica | 0,7581 | no disponible | referencia bibliografica |

La comparacion no es homogenea en protocolo ni en caracteristicas de entrada, tal como advierte el propio autor. Los modelos de la literatura operan sobre subgrafos por transaccion o paso de mensajes, mientras que este MLP usa agregados por cuenta. En la dimension de privacidad, este modelo es el unico de la tabla disenado para inferencia cifrada.

## Limitaciones y advertencias

- Rendimiento muy bajo en la clase minoritaria: minority-class F1 de 0,2064, frente a 0,6323 de la linea base publicada y 0,7581 del techo publicado. No es apto para produccion en deteccion de blanqueo.
- La accuracy de 0,9975 es enganosa dado el desbalance extremo (aproximadamente 1 positivo por cada 981 transacciones); el autor lo advierte y por eso reporta AUPRC y F1 de minoritaria junto a ella.
- El corpus de entrenamiento es enteramente sintetico (IBM AMLworld HI-Small); el propio IBM declara que todos los datos son sinteticos. El rendimiento sobre datos reales es desconocido.
- La ventana de test se extiende mas alla del rango nominal del dataset (hasta el 18 de septiembre frente a los diez dias declarados); 655 de las 1.108 filas de cola son de blanqueo y representan el 28,2% de los positivos del test, lo que infla las metricas respecto a una ventana sin cola.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos con precision y recall en torno a 0,20.
- Sin soporte multilingue ni de lenguaje natural: solo procesa las 32 caracteristicas tabulares para las que fue entrenado.
- Licencia CDLA-Sharing-1.0: permite uso comercial pero impone obligaciones de comparticion de datos; conviene revisar los terminos antes de integrarlo en un producto.
- Publicado explicitamente como prueba de concepto de investigacion, no como sistema de produccion.
- Sin descargas ni likes en el momento de la consulta; sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-finance-aml-mlp-large
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset IBM AMLworld HI-Small: https://www.kaggle.com/datasets/ealtman2019/ibm-transactions-for-anti-money-laundering-aml
- Paper de referencia del dataset (Altman et al., NeurIPS 2023 D&B): no disponible como enlace directo en la informacion proporcionada
- Paper de referencia de benchmarks (Bilgi y Atasu, MEGA, TMLR 2026): arXiv:2412.00241
