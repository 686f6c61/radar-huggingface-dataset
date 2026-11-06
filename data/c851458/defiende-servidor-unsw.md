# c851458/defiende-servidor-unsw

## Resumen

Defiende el servidor — v2 (e4_hgb_threshold) es un clasificador binario tabular para deteccion de intrusiones en conexiones de red, entrenado sobre el dataset academico UNSW-NB15. Lo desarrolla el usuario c851458 en el contexto de un curso de MLOps, y su interes no reside en la innovacion algorítmica sino en la trazabilidad del pipeline: versionado de codigo, datos (DVC), experimentos (MLflow) y artefactos reproducibles. No es un modelo de lenguaje ni una red neuronal: es un `Pipeline` de scikit-learn serializado con `joblib`.

La solucion emplea un `HistGradientBoostingClassifier` con 300 iteraciones, learning rate 0,1 y 63 hojas maximas, precedido de un preprocesamiento que aplica one-hot encoding a las variables categoricas `proto`, `service` y `state` con frecuencia minima 20. La decision final no usa el corte por defecto de 0,5, sino un umbral calibrado de 0,6574, seleccionado en validacion bajo la politica `max_recall_at_fpr` con un FPR maximo del 5 %.

Su relevancia actual es pedagogica y de referencia metodologica: muestra como empaquetar un modelo tabular con metricas honestas, umbral ajustado solo con validacion y evaluacion unica sobre test, algo poco habitual en repositorios academicos. La model card advierte explicitamente de que no es un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con `HistGradientBoostingClassifier` (arboles de decision con boosting por gradiente) |
| Parametros totales | no disponible (no se reporta numero de nodos ni hojas totales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de una fila de caracteristicas) |
| Tipos de cuantizacion | no aplica; serializacion `joblib` (pickle) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (no se especifican terminos concretos) |
| Formato de pesos | `model.joblib` (Pipeline completo de scikit-learn), `config.json`, `requirements.txt` |
| Hiperparametros | `max_iter=300`, `learning_rate=0.1`, `max_leaf_nodes=63`, `early_stopping=false` |
| Preprocesamiento | `scale=false`, `log1p=false`, `min_frequency=20`, one-hot de `proto`, `service`, `state` |
| Umbral de decision | 0,6574 (`y_pred = 1` si `score_attack >= 0.6574`) |
| Dataset | UNSW-NB15 (particiones publicadas de entrenamiento y test) |
| Filas de entrenamiento / validacion | 139.166 / 35.235 |
| Filas de test | 82.332 |
| Version de scikit-learn | 1.7.2 (Python 3.10.12) |
| SHA256 del modelo | `689fb002a0eaa577af78ee78cec88043a53e93fc17ae96a4f8aba4c93dda03e9` |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingClassifier` de scikit-learn, un algoritmo de gradient boosting sobre arboles de decision con binning historico de caracteristicas, disenado para entrenamiento eficiente en CPU sobre datos tabulares. El pipeline incluye un transformador previo que aplica one-hot encoding a las variables categoricas `proto`, `service` y `state`, agrupando categorias poco frecuentes mediante `min_frequency=20`. No se aplica escalado ni transformacion logaritmica a las variables numericas.

Los datos provienen de UNSW-NB15, un dataset de trafico de red capturado en laboratorio en 2015 con etiquetas binarias (normal frente a ataque) y categorias de ataque. Se usan las particiones publicadas: el archivo de entrenamiento se divide en train (139.166 filas) y validacion (35.235 filas) mediante agrupacion por entradas identicas con semilla 2026, excluyendo las columnas `id`, `attack_cat` y `label`. Se eliminaron 940 filas con entradas identicas y etiquetas contradictorias. El umbral de decision se selecciono unicamente sobre validacion maximizando el recall con un FPR acotado al 5 %, y el test publicado (82.332 filas) se evaluo una sola vez. No hay RLHF, DPO ni ninguna fase de ajuste por preferencias, al no tratarse de un modelo generativo.

## Capacidades

- Clasificacion binaria de conexiones de red en normal (0) o ataque (1), con salida de probabilidad (`predict_proba`) y umbral configurable.
- Deteccion de intrusiones sobre caracteristicas tabulares derivadas de flujos de red (duracion, bytes, puertos, TTL, estado del protocolo, entre otras).
- Ajuste del punto de operacion mediante umbral externo, lo que permite priorizar recall o precision segun la politica de seguridad.
- Reproducibilidad completa: el repositorio incluye hashes de datos (DVC), run de MLflow, commit de codigo y SHA256 del artefacto.
- Integracion sencilla en pipelines Python via `joblib` y `huggingface_hub.snapshot_download`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Docencia y practicas de MLOps: sirve como ejemplo completo de versionado de datos con DVC, registro de experimentos en MLflow y publicacion de artefactos con trazabilidad de hashes.
- Prototipado de un IDS (sistema de deteccion de intrusiones) en laboratorio: se puede conectar a un extractor de caracteristicas tipo UNSW-NB15 para clasificar flujos y comparar contra reglas heuristicas.
- Evaluacion de politicas de umbral en seguridad: el modelo permite estudiar el compromiso entre recall (0,9678 en test) y FPR (0,1920 en test) moviendo el umbral sin reentrenar.
- Baseline para experimentos comparativos: cualquier propuesta nueva (redes neuronales, modelos de gradient boosting alternativos) puede contrastarse contra estas metricas y este pipeline reproducible.
- Analisis de artefactos de captura: util para estudiar como variables como `sttl` o `ct_state_ttl` dominan la prediccion por sesgos de la captura original, un ejercicio de auditoria de datos.
- Integracion en un servicio batch de scoring: el script `predict.py` acepta un CSV de entrada y produce un CSV de salida, lo que facilita pruebas de extremo a extremo en un pipeline de datos.
- Referencia para auditoria de modelos tabulares: la model card documenta matriz de confusion, umbral, hashes y limitaciones, lo que lo convierte en un caso de estudio de documentacion rigurosa.

## Benchmarks y rendimiento

Metricas reportadas por el autor sobre validacion (35.235 filas) y test (82.332 filas) del dataset UNSW-NB15:

| Metrica | Validacion | Test |
|---|---|---|
| Recall (ataque) | 0,9605 | 0,9678 |
| Precision (ataque) | 0,9771 | 0,8606 |
| FPR | 0,0500 | 0,1920 |
| Macro-F1 | 0,9506 | 0,8929 |
| Accuracy | 0,9572 | 0,8960 |
| TN | 10.398 | 29.895 |
| FP | 547 | 7.105 |
| FN | 960 | 1.459 |
| TP | 23.330 | 43.873 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. La caida de precision (0,9771 a 0,8606) y el aumento del FPR (0,05 a 0,1920) entre validacion y test indican una brecha de generalizacion relevante que el autor no cuantifica con intervalos de confianza.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un pipeline de scikit-learn con arboles de decision; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- GPU recomendadas: no aplica.
- Memoria RAM: no disponible de forma explicita; un `HistGradientBoostingClassifier` con 300 iteraciones y 63 hojas por arbol ocupa del orden de decenas de MB en memoria, aunque el dato exacto no se publica.
- Cabe en cualquier equipo consumer: portatil convencional, Raspberry Pi o contenedor con recursos minimos.
- Opciones de despliegue: scripts Python con `joblib` y `scikit-learn` 1.7.2; el repositorio incluye `predict.py` y `requirements.txt`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiende el servidor — v2 (e4_hgb_threshold) | Gradient boosting tabular (scikit-learn) | no disponible | no aplica | other | Hugging Face, repo de 0,0 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de deteccion de intrusiones sobre UNSW-NB15 en los datos proporcionados, por lo que no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Dataset historico de 2015 con trafico sintetico de laboratorio: no demuestra eficacia sobre trafico de red real ni actual.
- Variables como `sttl` y `ct_state_ttl` son altamente predictivas por artefactos de la captura, lo que puede inflar las metricas y no trasladarse a entornos reales.
- Aproximadamente el 10 % de las filas de test tienen entradas identicas a train o validacion, de modo que el test no es completamente nuevo.
- Brecha notable entre validacion y test: el FPR pasa de 0,05 a 0,1920 y la precision de 0,9771 a 0,8606, lo que sugiere sobreajuste al umbral calibrado en validacion.
- El modelo esta entrenado con una unica particion y un unico umbral; no se reportan intervalos de confianza ni validacion cruzada.
- Licencia `other` sin terminos explicitos: no se puede asumir uso comercial sin consultar al autor.
- `joblib` usa pickle: cargar el artefacto solo desde fuentes confiables y con la misma version de scikit-learn (1.7.2) para evitar incompatibilidades o ejecucion de codigo arbitrario.
- No es un sistema de deteccion listo para produccion, tal y como declara el propio autor.
- No procesa texto ni datos no tabulares; no dispone de capacidades generativas, de vision ni multilingues.
- Riesgo de sesgo por desbalanceo y por la composicion de las particiones originales de UNSW-NB15, no analizado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c851458/defiende-servidor-unsw
- Dataset UNSW-NB15 (particiones publicadas referenciadas en la card): no se incluye URL directa en la informacion disponible
- Run de MLflow: `c5503f3f886f4309927f98bac0288479` (identificador, sin URL publica en la informacion disponible)
- Codigo (commit Git): `057957069ef92fba2a9ebef2c8b70f61fd405c48` (identificador, sin URL de repositorio en la informacion disponible)
- Datos DVC: originales `688fd73cceff08e318906ecd85de60c4.dir`, preparados `5832cbec6fbaff34eaf128c733c18932.dir` (identificadores, sin URL publica en la informacion disponible)
