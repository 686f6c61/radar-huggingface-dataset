# select-ai/fall-detection

## Resumen

El modelo `select-ai/fall-detection`, denominado por su autor "XGBoost Priority 1 Fall Detection Classifier", es un clasificador binario de gradient boosting (`xgboost.XGBClassifier`) que distingue entre los estados `Fall` (caída) y `Normal` a partir de características geométricas extraídas de keypoints corporales. No es un modelo generativo ni un transformer: se trata de un clasificador tabular que se sitúa al final de una cadena de visión por computador cuyo componente de percepción (un estimador de pose YOLO26x-Pose) queda fuera del alcance del repositorio.

El problema que aborda es el cambio de dominio (domain shift) en la detección de caídas sobre cámaras de videovigilancia. Según la model card, un clasificador entrenado sobre coordenadas de keypoints en crudo alcanzaba un 92,22 % de exactitud en una partición estándar de train/test, pero caía a un 66,83 % sobre metraje real de CCTV. La causa se atribuye a tres factores: sensibilidad al ángulo y altura de cámara, oclusión de extremidades por multitudes o mobiliario, y pérdida de ratios posturales relativos. La solución propuesta es una representación de 56 características que incorpora cinco variables diseñadas específicamente para ser invariantes a la instalación de la cámara.

La relevancia del modelo es, por tanto, metodológica más que de escala: documenta con detalle un contrato de entrada estricto (51 features de keypoints más bounding box), las fórmulas exactas de las cinco características derivadas y la separación entre el input que recibe el script y el DataFrame de 56 columnas que consume realmente XGBoost. El autor reporta 91,00 % de exactitud en el conjunto de test estándar, 92,67 % de exactitud y 90,91 % de F1 en evaluación sobre CCTV real, y hasta 98,05 % de precisión en eventos de caída con un umbral de probabilidad estricto. El repositorio se marca como interno y el modelo como "experimental" (con la grafía "experimantal" en el original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (`xgboost.XGBClassifier`), clasificación binaria |
| Parametros totales | no disponible (la model card no indica número de árboles, profundidad ni número de hojas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador tabular; la entrada es una fila de 56 características) |
| Tipos de cuantizacion | no disponible (no aplica a gradient boosting tabular) |
| Idiomas soportados | no disponible (no aplica: la entrada son características numéricas de keypoints, no texto) |
| Licencia | no disponible |
| Formato de pesos | Pickle de XGBoost (`.pkl`): `models/xgboost_priority1_fall_model.pkl` |
| Nombre del modelo | XGBoost Priority 1 Fall Detection Classifier |
| Version | `v1` (Experiment 01) |
| Estado declarado | `experimantal` (grafía original); repositorio marcado como "internal" |
| Tarea | Clasificación binaria: `Fall` / `Normal` |
| Entrada del contrato (upstream) | 51 features de keypoints (`x_i, y_i, conf_i` para i = 0…16) + bounding box `(x1, y1, x2, y2)` en un DataFrame de pandas |
| Entrada del modelo (tras `run.py`) | DataFrame de 56 columnas (`(n, 56)`) |
| Salida | `Fall` si `P(Fall) >= 0.70`, en caso contrario `Normal` |
| Libreria | xgboost |
| Tamano del repositorio | 0,0 GB segun HuggingFace (redondeado; el tamano exacto del artefacto no esta disponible) |
| Fecha de referencia de la model card | 2026-09-21 |
| Fecha de creacion en HuggingFace | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de gradient boosting implementado con `xgboost.XGBClassifier` en modo de clasificación binaria. El modelo no procesa píxeles, fotogramas ni ficheros CSV directamente: su entrada efectiva es un `pandas.DataFrame` en memoria con forma `(n, 56)`, donde las posiciones 1 a 51 corresponden a las coordenadas y confidencias de 17 keypoints normalizadas respecto al bounding box, y las posiciones 52 a 56 son cinco características calculadas dentro de `scripts/run.py`. La model card insiste en que el CSV es solo un formato de transporte hacia el DataFrame y nunca se entrega al modelo.

Las cinco características derivadas, que constituyen la aportación técnica central, se calculan con estas fórmulas: `aspect_ratio` = `w / h` a partir del bounding box; `nose_relative_y` = `(Y_nose - y1) / h` usando el keypoint 0; `torso_angle`, el ángulo en grados entre la recta cadera-media → hombro-medio y el eje Y vertical, a partir de los keypoints 5, 6, 11 y 12 más el bounding box; `norm_com_y`, la coordenada Y del centro de masas ponderada por confianza, `(Σ(Y_i·conf_i)/Σ(conf_i) - y1)/h`, sobre todos los keypoints visibles; y `head_hip_v_dist` = `(Y_hip_mid - Y_nose) / h` con los keypoints 0, 11 y 12. El autor clasifica estas variables como "Priority 1 CCTV-invariant features" y les atribuye la mejora de robustez frente a cambios de cámara.

En cuanto a los datos de entrenamiento, la model card no especifica el número de muestras, la composición del dataset, el origen del metraje, la distribución de clases ni si hubo ajuste de hiperparámetros o calibración de probabilidades. Tampoco se documenta ninguna fase de RLHF, DPO u optimización preferencial, algo esperable en un clasificador supervisado tabular. El pipeline declara explícitamente que todo lo relativo a la extracción de pose (upstream) queda fuera del alcance del repositorio.

## Capacidades

- Clasificación binaria de caídas: produce `Fall` o `Normal` a partir de 56 características numéricas, con umbral de decisión fijo en `P(Fall) >= 0.70`.
- Robustez a variaciones de instalación de cámara: las cinco características derivadas buscan ser invariantes a pitch, altura de montaje y distancia focal, según la justificación del autor.
- Tolerancia a oclusión parcial: los keypoints con confianza inferior a 0,50 se codifican como `NaN` en `x`/`y`, y el modelo puede predecir siempre que la fila tenga al menos cinco keypoints válidos.
- Extracción de características integrada: `scripts/run.py` deriva `aspect_ratio`, `nose_relative_y`, `torso_angle`, `norm_com_y` y `head_hip_v_dist` a partir del contrato de entrada, de modo que el componente upstream no necesita calcularlas.
- Salida probabilística: expone `predict_proba`, lo que permite aplicar umbrales distintos de 0,70 para priorizar precisión o exhaustividad.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No tiene modo "thinking", visión propia, audio ni generación de texto: la percepción visual corresponde a un YOLO26x-Pose externo.
- Una fila equivale a una persona y a una predicción; no hay seguimiento de identidad entre fotogramas.

## Casos de uso

- Monitorización de residencias de mayores y centros geriátricos: el clasificador se alimenta de las detecciones de un YOLO-Pose que ya esté desplegado sobre las cámaras del centro, y emite alertas cuando `P(Fall) >= 0.70`. Su utilidad aquí radica en que las cinco características invariantes reducen los falsos positivos provocados por cambios de plano entre habitaciones o por mobiliario que oculta las piernas.
- Vigilancia hospitalaria en plantas de riesgo: pacientes con movilidad reducida o riesgo de caída nocturna pueden monitorizarse con las cámaras ya instaladas, sin necesidad de sensores vestibles, usando el contrato de 51 features más bounding box que el pipeline espera.
- Triaje de alertas en un centro de control: dado que el modelo devuelve probabilidad, un operador puede fijar un umbral estricto para maximizar precisión (el autor reporta hasta 98,05 % de precisión en eventos de caída) y reducir el volumen de revisiones manuales, a costa de perder sensibilidad.
- Análisis retrospectivo de grabaciones: al ser un modelo tabular, el cuello de botella es la extracción de pose, no la clasificación, por lo que resulta viable reprocesar metraje archivado para auditar incidentes y generar estadísticas de siniestralidad por franja horaria o zona.
- Espacios públicos y transporte: estaciones, aeropuertos o grandes superficies pueden emplearlo como segunda etapa sobre un detector de personas existente, aprovechando la tolerancia a oclusiones descrita por el autor para entornos con aglomeraciones.
- Teleasistencia domiciliaria con cámara: en viviendas de personas mayores que acepten un dispositivo de visión, el clasificador permite disparar avisos automáticos a familiares o servicios de emergencia, con la salvedad de que el repositorio no incluye el componente de captura ni de pose.
- Investigación en detección de caídas: sirve como referencia reproducible para estudiar el efecto del cambio de dominio, ya que documenta el contraste entre un baseline de keypoints crudos (66,83 % en CCTV real) y la representación ingenierizada.
- Reducción de coste computacional en el borde: al tratarse de un modelo de gradient boosting tabular, la clasificación es órdenes de magnitud más barata que un modelo de visión, lo que permite ejecutarla en el mismo servidor o dispositivo que ya corre el estimador de pose.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente. No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval o GSM8K) porque no aplican a este tipo de modelo.

| Metrica | Conjunto de evaluacion | Valor |
|---|---|---|
| Exactitud (accuracy) | Test estandar | 91,00 % |
| Exactitud (accuracy) | CCTV real | 92,67 % |
| F1 | CCTV real | 90,91 % |
| Precision en eventos de caida (umbral estricto) | No especificado | hasta 98,05 % |
| Exactitud del baseline con keypoints crudos | Test estandar | 92,22 % |
| Exactitud del baseline con keypoints crudos | CCTV real | 66,83 % |
| Exactitud del modelo con caracteristicas ingenierizadas | CCTV real | 88,36 %+ |

Advertencia sobre los datos: la model card presenta dos cifras distintas para el rendimiento en CCTV real. En el apartado de descripcion se afirma "92,67 % accuracy / 90,91 % F1 on real-world CCTV evaluation", mientras que en el apartado del problema se indica que la representacion de 56 caracteristicas mejora la exactitud en mundo real hasta "88,36 %+". La discrepancia no se explica en la informacion disponible y deberia aclararse con el autor antes de citar cualquiera de las dos cifras.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El modelo es un clasificador tabular de gradient boosting, por lo que la inferencia puede ejecutarse en CPU; no se documenta ningún requisito de GPU para la etapa de clasificación.
- GPU recomendadas: no aplica para la etapa XGBoost. La GPU (o un acelerador equivalente) es relevante para el componente upstream YOLO26x-Pose, cuyos requisitos no se detallan en el repositorio.
- Encaje en GPU de consumo: la clasificación en sí no requiere GPU; cualquier equipo capaz de ejecutar el estimador de pose puede alojar también el clasificador.
- Tamano del artefacto: el repositorio ocupa 0,0 GB segun HuggingFace, lo que sitúa el fichero `.pkl` por debajo de las centésimas de gigabyte. El tamano exacto no está disponible.
- Opciones de despliegue: el repositorio describe un script propio, `scripts/run.py`, que construye el DataFrame de 56 columnas y llama a `XGBoost.predict_proba`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia de LLM, y ninguno de ellos aplica a este modelo.
- Dependencias de despliegue: un entorno de Python con `xgboost` y `pandas` para el clasificador, más el pipeline upstream de YOLO26x-Pose que entrega las 51 features y el bounding box.
- Latencia y throughput: no disponibles.
- Aceleracion por hardware: no se documenta soporte de GPU (`device="cuda"`, `tree_method="gpu_hist"` o similares) para el clasificador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada. La unica comparacion documentada es interna, contra el baseline de keypoints crudos sobre el que se construye la mejora.

| Modelo | Entrada | Exactitud test estandar | Exactitud CCTV real | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `select-ai/fall-detection` (56 features) | 51 keypoints + bbox, con 5 features derivadas en `run.py` | 91,00 % | 92,67 % (frente a 88,36 %+ en otro apartado de la card) | no disponible | Repositorio HuggingFace, marcado como interno y experimental |
| Baseline de keypoints crudos (descrito en la misma model card) | Coordenadas de keypoints sin ingenieria de caracteristicas | 92,22 % | 66,83 % | no disponible | No se publica como artefacto independiente |
| Otros clasificadores de deteccion de caidas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado experimental: la propia model card etiqueta el modelo como "experimantal" (sic) y como version `v1` de un "Experiment 01". No debe tratarse como un componente validado para produccion sin una evaluacion propia.
- Visibilidad interna: el repositorio se declara "internal", aunque es accesible publicamente en HuggingFace. Conviene confirmar con el autor si el artefacto y el codigo asociado pueden reutilizarse.
- Licencia no especificada: al no indicarse licencia, no hay autorizacion explicita para uso comercial, modificacion ni redistribucion. Es un bloqueo juridico relevante para cualquier despliegue en produccion.
- Dependencia de un componente upstream no incluido: el rendimiento real depende por completo del estimador YOLO26x-Pose, que queda fuera del alcance del repositorio y no esta versionado ni evaluado aqui. Un cambio de version del extractor de pose invalida las metricas reportadas.
- Riesgo de falsos negativos y falsos positivos: es un clasificador binario sobre un umbral fijo de 0,70. No se documentan la matriz de confusion completa, la sensibilidad (recall) ni el area bajo la curva ROC, por lo que no puede evaluarse el equilibrio entre ambos tipos de error.
- Umbral no justificado: la eleccion de `P(Fall) >= 0.70` no viene acompanada de un analisis de costes que explique por que ese valor y no otro.
- Dependencia de la oclusion: si una fila no alcanza cinco keypoints validos, la prediccion se omite. En escenas muy congestionadas o con mobiliario alto, la tasa de omision puede ser significativa. Las caracteristicas `norm_com_y` y `torso_angle` dependen de keypoints que la propia model card identifica como frecuentemente ocluidos (rodillas y tobillos).
- Sin seguimiento de identidad: cada fila es una persona y una prediccion, sin tracking entre fotogramas. Esto impide modelar la dinamica temporal de la caida (velocidad de descenso, permanencia en el suelo) y puede generar alertas repetidas para el mismo evento.
- Sin informacion sobre sesgos: no se documentan la composicion demografica del dataset de entrenamiento, la distribucion de clases, ni el rendimiento desagregado por edad, complexion, genero, indumentaria o condicion de movilidad. No puede descartarse un sesgo sistematico en colectivos infrarrepresentados.
- Ambito de aplicacion limitado: el modelo ha sido disenado y evaluado con camaras CCTV. No hay evidencia de que generalice a camaras de movil, webcams, vision nocturna infrarroja o angulos cenitales extremos.
- Discrepancia en las metricas publicadas: como se senala en la seccion de benchmarks, la model card ofrece dos cifras incompatibles para la exactitud en CCTV real (92,67 % y 88,36 %+). Cualquier afirmacion de rendimiento deberia verificarse contra el conjunto de evaluacion original.
- Discrepancia entre exactitud alta en test y utilidad clinica o operativa: las metricas de exactitud no equivalen a reduccion de incidentes; no se aportan datos de validacion prospectiva en un entorno real.
- Riesgo de privacidad y cumplimiento normativo: el sistema opera sobre imagenes de personas en espacios potencialmente sensibles (residencias, hospitales), lo que exige evaluacion de impacto en proteccion de datos (RGPD y, si procede, normativa sectorial) independientemente del rendimiento del clasificador.
- No aplican riesgos de alucinacion en el sentido de los modelos generativos: el modelo no produce texto libre. El riesgo equivalente es la clasificacion erronea silenciosa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/select-ai/fall-detection
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible (se menciona `scripts/run.py` y `models/xgboost_priority1_fall_model.pkl`, pero sin URL publica)
- Demo: no disponible

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo. Corresponden a sitios comerciales y diccionarios (`sonepar-select.fr`, `dictionnaire.lerobert.com`, `selectour.com`, `comdewouf.fr`, `larousse.fr`) y no aportan informacion tecnica, papers ni repositorios vinculados a `select-ai/fall-detection`.
