# itsmdshahin/clame-fraud-detection

## Resumen

CLAME (Cloud Learning & AI Monitoring Engine) es un artefacto de clasificacion tabular para deteccion de fraude en tarjetas de credito, publicado en Hugging Face por itsmdshahin (Md. Shahinur Rahman, Universidad de Bradford, junto con Md. Abdullah Al Sami). No es un modelo de lenguaje ni una red neuronal: es un pipeline clasico de scikit-learn compuesto por `StandardScaler`, SMOTE y un `RandomForestClassifier` de 50 arboles, empaquetado con `joblib` junto con un modelo retador basado en XGBoost.

El modelo resuelve un problema de clasificacion binaria fuertemente desbalanceada: identificar transacciones fraudulentas en el dataset europeo de tarjetas de ULB/Worldline (284.807 transacciones de septiembre de 2013, con solo un 0,167 % de fraude tras eliminar duplicados). Su relevancia es principalmente academica y docente: reproduce los resultados de un trabajo de curso sobre IA aplicada a deteccion de fraude y demuestra un flujo completo de entrenamiento con SMOTE, umbral de revision ajustado por F2 y una politica de decision con humano en el bucle.

El repositorio es muy ligero (0,0 GB declarados) y no contiene pesos en formato de red neuronal, sino un diccionario serializado con los pipelines, umbrales y la lista de caracteristicas. No dispone de licencia declarada, no declara idiomas y no es un sistema de produccion segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + SMOTE + RandomForestClassifier (campeon); XGBClassifier (retador) |
| Parametros totales | No disponible (modelo basado en arboles; 50 estimadores en el campeon, 300 en el retador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion tabular; 31 caracteristicas de entrada) |
| Tipos de cuantizacion | No disponible (serializacion joblib; no hay cuantizacion de pesos) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | `clame_bundle.joblib` (diccionario con pipelines, umbrales y features), `metrics.json`, `samples.json` |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura de transformer ni de red neuronal profunda. Se trata de un pipeline de `imblearn` que encadena `StandardScaler`, sobremuestreo sintetico SMOTE y un clasificador de bosque aleatorio con 50 estimadores. El modelo retador sustituye el bosque por XGBoost con 300 estimadores, profundidad maxima 6, tasa de aprendizaje 0,1, `subsample` 0,8 y `colsample_bytree` 0,8. SMOTE se aplica unicamente durante el ajuste, por lo que el conjunto de test no se contamina.

Los datos de entrenamiento proceden del dataset ULB/Worldline de tarjetas europeas (284.807 transacciones de septiembre de 2013). Tras eliminar 1.081 duplicados quedan 283.726 filas, de las cuales 473 son fraudulentas (0,167 %). Las caracteristicas son `Time`, `V1`–`V28` (anonimizadas mediante PCA por el proveedor del dataset), `Amount` y una variable derivada `Hour = (Time/3600) % 24`, lo que da 31 caracteristicas. La particion es estratificada 80/20 con `random_state=42`. El umbral de revision se selecciona maximizando F2 sobre predicciones out-of-fold de 3 folds, sin usar el conjunto de test. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, por no aplicar a este tipo de modelo.

## Capacidades

- Clasificacion binaria tabular de transacciones como fraudulenta o legitima, con probabilidad de fraude mediante `predict_proba`.
- Deteccion sobre datos desbalanceados gracias al sobremuestreo SMOTE en entrenamiento.
- Politica de decision en tres niveles: `APPROVE` (score < 0,36), `REVIEW` (0,36 ≤ score < 0,5, o discrepancia con el retador) y `HOLD` (score ≥ 0,5).
- Mecanismo de doble modelo (campeon y retador) para marcar casos ambiguos cuando el XGBoost supera el umbral y el bosque aleatorio no.
- Serializacion portable mediante `joblib`, cargable con `huggingface_hub.hf_hub_download`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; su entrada es exclusivamente numerica.

## Casos de uso

- Docencia y reproduccion de investigacion: sirve para replicar la Tabla 4.3 del trabajo de curso sobre deteccion de fraude, comparando bosque aleatorio y XGBoost bajo el mismo pipeline con SMOTE.
- Prototipado de sistemas de scoring de fraude: permite montar rapidamente un servicio de inferencia que devuelva probabilidad de fraude a partir de las 31 caracteristicas del dataset, util como base antes de pasar a un sistema real.
- Evaluacion de tecnicas de desbalanceo: el bundle incluye campeon y retador con el mismo preprocesado, lo que facilita comparar el efecto de SMOTE y del tipo de clasificador en metricas como PR-AUC.
- Simulacion de politicas de decision con humano en el bucle: los umbrales 0,36 y 0,5 permiten probar flujos de aprobacion, revision manual y retencion de transacciones en un entorno de laboratorio.
- Analisis de compromiso entre recall y falsas alarmas: con 7 falsos positivos y 73 fraudes detectados a umbral 0,5, es adecuado para estudiar el coste operativo de distintas politicas de revision.
- Integracion en demos y dashboards: el repositorio incluye una API y un dashboard publicos (clame.onrender.com y el Space de Hugging Face) que muestran como exponer el modelo como servicio HTTP para pruebas.
- Formacion en MLOps basica: el uso de `requirements.txt` con versiones exactas y la advertencia sobre incompatibilidades de scikit-learn ilustran la gestion de dependencias en el despliegue de modelos serializados.

## Benchmarks y rendimiento

Resultados en el conjunto de test (56.651 legitimas, 95 fraudulentas), segun la model card:

| Modelo | Umbral | Precision | Recall | F1 | ROC-AUC | PR-AUC | Detectadas | Falsas alarmas |
|---|---|---|---|---|---|---|---|---|
| RF + SMOTE (campeon) | 0,50 | 0,913 | 0,768 | 0,834 | 0,942 | 0,806 | 73 | 7 |
| RF + SMOTE (campeon) | 0,36 (revision) | 0,862 | 0,789 | 0,824 | 0,942 | 0,806 | 75 | 12 |
| XGBoost + SMOTE (retador) | 0,50 | 0,750 | 0,789 | 0,769 | 0,974 | 0,814 | 75 | 25 |

Estos valores coinciden con la Tabla 4.3 del trabajo citado (RF + SMOTE: precision 0,911, recall 0,758, F1 0,828, ROC-AUC 0,942, PR-AUC 0,806, 7 falsas alarmas).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y el bundle ocupa practicamente nada (repositorio declarado de 0,0 GB).
- GPU recomendadas: no aplica; no hay inferencia en GPU ni necesidad de aceleradores.
- Compatibilidad con GPU de consumo: irrelevante; cualquier CPU moderna puede ejecutar el pipeline.
- Opciones de despliegue: carga directa con `joblib` en Python, servicio HTTP mediante la API incluida en el repositorio fuente (FastAPI segun la documentacion enlazada) y el Space de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Requisito critico: versiones exactas de las librerias en `requirements.txt`; una version distinta de scikit-learn puede impedir la carga del bundle.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CLAME RF + SMOTE (este modelo) | Bosque aleatorio + SMOTE | 50 estimadores | No aplica (31 features) | F1 0,834; ROC-AUC 0,942; PR-AUC 0,806 | No disponible | Hugging Face y GitHub |
| CLAME XGBoost + SMOTE (retador incluido) | Gradient boosting + SMOTE | 300 estimadores, profundidad 6 | No aplica | F1 0,769; ROC-AUC 0,974; PR-AUC 0,814 | No disponible | Incluido en el mismo bundle |
| Otros detectores de fraude tabulares publicos | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada.

## Limitaciones y advertencias

- Los datos cubren solo dos dias de septiembre de 2013; los patrones de fraude cambian con el tiempo, por lo que es obligatorio reentrenar con datos recientes antes de cualquier uso real.
- Las caracteristicas `V1`–`V28` estan anonimizadas mediante PCA, lo que limita la explicabilidad ante clientes y reguladores.
- Se escapa aproximadamente 1 de cada 4 fraudes con el umbral de 0,5 (recall 0,768).
- El propio autor lo describe como artefacto de investigacion y curso, no como sistema de fraude de produccion.
- Un despliegue real debe cumplir el RGPD del Reino Unido, la Data Protection Act 2018 y PCI DSS; la API de CLAME no almacena datos de tarjeta ni valores de caracteristicas.
- No hay licencia declarada, lo que impide determinar las condiciones de uso comercial.
- La carga del bundle es sensible a la version de scikit-learn; una version distinta puede provocar fallos.
- No se documentan sesgos especificos, pero el dataset subyacente esta limitado a tarjetas europeas de 2013 y puede no representar otras poblaciones o geografias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsmdshahin/clame-fraud-detection
- Demo en vivo (dashboard + API): https://clame.onrender.com
- Documentacion de la API: https://clame.onrender.com/docs
- Dashboard en Hugging Face Spaces: https://huggingface.co/spaces/itsmdshahin/clame
- Codigo fuente en GitHub: https://github.com/itsmdshahin/clame
