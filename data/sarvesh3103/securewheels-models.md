# Sarvesh3103/securewheels-models

## Resumen

SecureWheels es un conjunto de modelos de aprendizaje automatico clasico, no un modelo de lenguaje. Se distribuye como tres artefactos serializados con `joblib` (Random Forest, XGBoost e Isolation Forest) entrenados para deteccion de fraude en seguros de automovil sobre datos tabulares. Lo desarrolla Sarvesh Sudhir Kulkarni como proyecto de fin de carrera (B.Tech) y se publica bajo licencia MIT en Hugging Face, con el codigo de aplicacion en un repositorio de GitHub separado.

El problema que aborda es la clasificacion binaria de siniestros como fraudulentos o legitimos en un contexto de fuerte desbalance de clases, combinando dos clasificadores supervisados con pesos calibrados y un detector no supervisado de anomalias. La combinacion se formula como una puntuacion de ensemble ponderada: 0,45 por la probabilidad del Random Forest, 0,45 por la de XGBoost y 0,10 por la del Isolation Forest, con un umbral de decision ajustado a 0,40 en lugar de 0,50.

Es relevante como referencia practica de integracion de modelos tabulares clasicos en un pipeline de scoring de seguros, y como ejemplo de triangulacion supervisado/no supervisado para cubrir fraude conocido y anomalias no etiquetadas. No es un transformer, no procesa texto libre ni imagenes, y su ambito de aplicacion esta limitado al esquema de caracteristicas con el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres modelos tabulares: Random Forest, XGBoost e Isolation Forest |
| Parametros totales | no disponible (no aplica; modelos de arboles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de una fila por siniestro) |
| Tipos de cuantizacion | no disponible (no aplica; artefactos `joblib`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `joblib` (scikit-learn / XGBoost serializados) |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de triangulacion con tres componentes. El Random Forest usa 200 estimadores con ponderacion de clases balanceada y captura interacciones no lineales entre caracteristicas y patrones historicos de alta varianza. El XGBoost es un conjunto de arboles de decision potenciados por gradiente, optimizado con `scale_pos_weight = 15.67` para compensar el desbalance de clases y centrado en casos limite. El Isolation Forest es un detector no supervisado con factor de contaminacion de 0,06, pensado para anomalias novedosas no presentes en el conjunto etiquetado.

La puntuacion final se calcula como `0.45 * P_RF + 0.45 * P_XGB + 0.10 * S_IF`, con umbral de decision de 0,40 (sensible al coste). La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset, el esquema completo de caracteristicas ni si hubo calibracion de probabilidades posterior. Las entradas del ejemplo incluyen variables categoricas como `Month`, `Make`, `AccidentArea`, `PolicyType`, `VehiclePrice`, `Deductible`, `DriverRating`, `PastNumberOfClaims` y `BasePolicy`, lo que sugiere un dataset tabular de siniestros de automocion con codificacion categorica previa.

## Capacidades

- Clasificacion binaria de siniestros de automovil como fraudulentos o legitimos, con salida de probabilidad calibrada por ensemble.
- Deteccion de anomalias no supervisada mediante Isolation Forest, orientada a patrones de fraude no vistos en el entrenamiento.
- Manejo explicito de desbalance de clases mediante ponderacion balanceada en Random Forest y `scale_pos_weight` en XGBoost.
- Umbral de decision ajustable (0,40 por defecto) para operar en regimen sensible al coste.
- Inferencia sobre datos tabulares con caracteristicas categoricas y numericas segun el esquema del ejemplo de la model card.
- Serializacion portable con `joblib`, cargable directamente en Python con scikit-learn y XGBoost.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Triaje de siniestros en aseguradoras: el ensemble puntua cada parte con una probabilidad de fraude y permite derivar los casos por encima del umbral 0,40 a revision manual, reduciendo carga operativa en los casos de bajo riesgo.
- Deteccion de fraude conocido en produccion: el Random Forest y el XGBoost capturan patrones historicos etiquetados, adecuados para scoring por lotes de carteras de polizas con el mismo esquema de caracteristicas.
- Deteccion de fraude de dia cero: el Isolation Forest aporta una senal no supervisada sobre siniestros atipicos, util para marcar casos que no encajan en los patrones etiquetados y priorizar su investigacion.
- Priorizacion de investigaciones en la unidad antifraude: la puntuacion combinada permite ordenar la cola de casos por riesgo y asignar esfuerzo de investigacion donde el retorno esperado es mayor.
- Simulacion de escenarios de suscripcion: modificando variables como `Deductible`, `DriverRating` o `PastNumberOfClaims` puede estimarse como varia el riesgo estimado antes de emitir una poliza.
- Integracion en un servicio de scoring via API: los tres artefactos `joblib` pueden cargarse en un microservicio Python que reciba un JSON con los campos del siniestro y devuelva la puntuacion calibrada.
- Proyecto academico y baseline reproducible: sirve como referencia docente de ensemble supervisado/no supervisado con metricas documentadas y licencia permisiva.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Metrica | Random Forest | XGBoost | Isolation Forest | Ensemble de 3 modelos |
|---|---|---|---|---|
| Accuracy | 96,84 % | 97,12 % | no aplica (no supervisado) | 97,39 % |
| ROC-AUC | 0,9841 | 0,9882 | 0,8120 | 0,9916 |
| Recall (fraude) | 88,50 % | 89,80 % | 68,20 % | 91,20 % |
| Precision (fraude) | no disponible por modelo | no disponible por modelo | no disponible por modelo | 82,40 % |
| Umbral de decision | 0,50 | 0,50 | 0,50 | 0,40 (sensible al coste) |

No se especifica en la informacion disponible el conjunto de test, el numero de muestras, la particion train/validation/test ni el metodo de validacion cruzada empleado.

## Requisitos de hardware

- Inferencia en CPU: los tres modelos son arboles de decision serializados y no requieren GPU; la carga y el scoring se ejecutan en CPU con scikit-learn y XGBoost.
- Memoria RAM: no disponible; depende del tamano de los artefactos `joblib`, que no se detalla (el repositorio figura con 0,0 GB).
- GPU recomendadas: no aplica; XGBoost puede usar GPU opcionalmente, pero no es necesario para este volumen.
- Cabe en cualquier equipo de consumo: si, incluidos portatiles y entornos de contenedor de baja capacidad, siempre que se disponga de Python y las dependencias.
- Opciones de despliegue: carga directa con `joblib` en Python, microservicio con FastAPI o Flask, empaquetado en contenedor Docker, o exportacion a ONNX si se requiere portabilidad entre runtimes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SecureWheels (este modelo) | Ensemble RF + XGBoost + Isolation Forest | no disponible | no aplica | ROC-AUC 0,9916; recall 91,20 % | MIT | Hugging Face |
| XGBoost solo (referencia interna) | Gradient boosting | no disponible | no aplica | ROC-AUC 0,9882; recall 89,80 % | Apache 2.0 (libreria) | Disponible como componente |
| Random Forest solo (referencia interna) | Bagging de arboles | no disponible | no aplica | ROC-AUC 0,9841; recall 88,50 % | BSD (scikit-learn) | Disponible como componente |
| Isolation Forest solo (referencia interna) | Deteccion de anomalias no supervisada | no disponible | no aplica | ROC-AUC 0,8120; recall 68,20 % | BSD (scikit-learn) | Disponible como componente |

No se dispone de comparacion con otros ensembles publicos de deteccion de fraude en seguros de automocion en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito restringido: solo acepta el esquema tabular con el que fue entrenado; no procesa texto libre, imagenes ni audio, y no es un modelo generativo.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje, pero las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento.
- Sesgos potenciales: al entrenarse con datos historicos de siniestros, puede reproducir sesgos presentes en las decisiones pasadas de la aseguradora, incluyendo variables sensibles como `Sex`, `MaritalStatus` o `AgeOfPolicyHolder`; su uso en produccion exige revision de cumplimiento normativo.
- Desbalance de clases: el rendimiento depende del umbral 0,40 y de `scale_pos_weight = 15.67`; cambios en la prevalencia de fraude requieren recalibracion.
- Generalizacion limitada: no hay informacion sobre el origen, tamano ni periodo temporal del dataset de entrenamiento, por lo que no puede garantizarse su validez en otras carteras o paises.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no exime de las obligaciones regulatorias del sector asegurador.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion independiente.
- Sin documentacion sobre calibracion de probabilidades, validacion temporal ni pruebas de robustez frente a datos adversarios.

## Enlaces

- Hugging Face: https://huggingface.co/Sarvesh3103/securewheels-models
- Repositorio GitHub del proyecto: https://github.com/sarv3103/securewheels-insurance
- Perfil del autor: https://huggingface.co/Sarvesh3103
