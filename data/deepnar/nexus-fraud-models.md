# Deepnar/NEXUS-Fraud-Models

## Resumen

NEXUS-Fraud-Models es un conjunto de artefactos de detección de fraude publicados por el usuario Deepnar en HuggingFace. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de cuatro cabezas de clasificación entrenadas con XGBoost (gradient boosted decision trees) que cubren cuatro tareas: fraude en transacciones, phishing en mensajes, phishing en URL y un baseline de recuento de mensajes. Los artefactos son directamente insertables en el repositorio NEXUS-Fraud-Detection, un fork de Rishit1769/NEXUS-Fraud-Detection, de modo que el servicio FastAPI (`ml/service.py`) los carga sin cambios de código.

El modelo resuelve un problema acotado y realista: proporcionar señales de scoring probabilistico que complementan, pero nunca sustituyen, a las reglas deterministas del sistema NEXUS. Cada cabeza incluye su propio `metrics.json`, `thresholds.json` (puntos de operación con recall mayor o igual a 0,80), `feature_manifest.json`, `split_manifest.json` y `training_manifest.json`, lo que permite auditar la procedencia y los umbrales de decisión de cada componente.

Su relevancia es práctica más que arquitectónica: ofrece un pipeline de artefactos reproducible con calibración isotónica, ajuste de hiperparámetros con Optuna y evaluación sobre datos no vistos documentada en `eval_unseen.json`. El autor advierte explícitamente de dos limitaciones críticas: los datos de transacciones son sintéticos (IBM) y las cabezas son advisory, por lo que deben reentrenarse con casos reales adjudicados antes de un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosted decision trees (XGBoost) con calibración isotónica; vectorizador TF-IDF (caracteres y palabras) más rasgos léxicos para la cabeza de mensajes |
| Parametros totales | no disponible (no es un modelo de parámetros densos; número de árboles y profundidad no documentado) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelos tabulares y de bolsa de palabras; no hay ventana de contexto) |
| Tipos de cuantizacion | no aplica (los árboles XGBoost se serializan en JSON; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los rasgos de mensajes son TF-IDF de caracteres y palabras, por lo que el soporte lingüístico depende del corpus de entrenamiento, no declarado) |
| Licencia | MIT |
| Formato de pesos | `model.json` (XGBoost en formato JSON), `calibration_model.joblib` (isotonic), `vectorizer.joblib` (TF-IDF); metadatos en `eval_unseen.json`, `metrics.json`, `thresholds.json`, `feature_manifest.json`, `split_manifest.json`, `training_manifest.json` |
| Autor | Deepnar |
| Libreria declarada | xgboost |
| Etiquetas | xgboost, joblib, fraud-detection, phishing, nexus |
| Tamano del repositorio | 0.0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (HuggingFace) | 2026-09-23 |
| Fecha de actualizacion (HuggingFace) | 2026-09-24 |
| Pipeline declarado en HuggingFace | no disponible |

## Arquitectura y entrenamiento

El sistema se compone de cuatro cabezas independientes, cada una con su propio esquema de rasgos y su propio formato de serialización. La cabeza de fraude en transacciones usa XGBoost con calibración isotónica y ajuste de hiperparámetros mediante Optuna; se distribuye como `model.json` más `calibration_model.joblib`. La cabeza de phishing en mensajes combina un vectorizador TF-IDF sobre n-gramas de caracteres y de palabras con rasgos léxicos adicionales, alimentando un clasificador XGBoost serializado como `model.json` más `vectorizer.joblib`. La cabeza de phishing en URL es un XGBoost puramente léxico sobre `model.json`. La cabeza de recuento de mensajes es un XGBoost de reserva, descrito por el autor como fallback de carácter únicamente orientativo.

La innovación técnica destacable no está en la arquitectura, sino en la trazabilidad del pipeline. Cada cabeza publica su `training_manifest.json` y su `split_manifest.json`, lo que documenta la procedencia del entrenamiento y la partición de datos, y `eval_unseen.json` actúa como libro mayor completo de la evaluación sobre datos no vistos. Los umbrales se fijan en `thresholds.json` para puntos de operación con recall mayor o igual a 0,80, es decir, el autor prioriza sensibilidad sobre precisión en la selección de puntos de corte. No se documenta en la información proporcionada el número de tokens, el volumen de ejemplos, la composición del dataset ni el uso de RLHF o DPO, algo por otra parte esperable en un modelo de este tipo. El autor indica que los datos de transacciones son sintéticos (IBM) y recomienda reentrenar con casos reales adjudicados antes de producción.

## Capacidades

- Clasificación binaria de fraude en transacciones: scoring probabilístico con calibración isotónica, serializado como `model.json` más `calibration_model.joblib`.
- Detección de phishing en mensajes de texto: combinación de TF-IDF de caracteres y palabras con rasgos léxicos, más un vectorizador persistido en `vectorizer.joblib`.
- Detección de phishing en URL: clasificación basada exclusivamente en rasgos léxicos de la cadena de la URL.
- Baseline de recuento de mensajes: cabeza XGBoost de reserva, declarada por el autor como advisory-only fallback.
- Integración directa con el servicio FastAPI de NEXUS: los directorios son drop-in en `ml/artifacts/<task>/<version>/` y también se pueden cargar apuntando la variable `MODEL_ARTIFACT_ROOT` al repositorio.
- Puntos de operación predefinidos: `thresholds.json` fija umbrales con recall mayor o igual a 0,80 para cada cabeza.
- Trazabilidad de procedencia: manifiestos de entrenamiento, partición y rasgos por cabeza.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo generativo.
- No dispone de tool calling, function calling ni soporte de agentes o razonamiento multi-paso. La orquestación de decisiones corresponde a las reglas deterministas de NEXUS.
- No dispone de capacidades multilingües declaradas ni de modo de pensamiento, audio o vídeo.
- Por diseño, las cabezas son advisory y nunca sobrescriben una regla crítica del sistema NEXUS.

## Casos de uso

- Scoring de fraude en transacciones en tiempo real: la cabeza `transaction/` se integra en el servicio FastAPI y devuelve una probabilidad calibrada por transacción; el punto de operación con recall mayor o igual a 0,80 permite fijar el umbral de bloqueo o de revisión manual según el apetito de riesgo.
- Priorización de alertas para analistas humanos: dado que las cabezas no sobrescriben reglas críticas, su salida se usa para ordenar la cola de revisión, de modo que los casos con mayor probabilidad se investigan primero y se reduce el tiempo medio de resolución.
- Filtrado de phishing en correo corporativo: la cabeza `message-tfidf/` analiza el asunto y el cuerpo del mensaje con TF-IDF de caracteres y palabras, lo que la hace robusta frente a variaciones tipográficas y ofuscaciones simples en el texto.
- Bloqueo preventivo de URL maliciosas: la cabeza `url/` evalúa la cadena de la URL antes de que el usuario haga clic, sin necesidad de resolver el dominio ni de acceder al contenido, lo que permite tomar la decisión en el propio cliente o en un proxy.
- Capa de asesoramiento sobre un motor de reglas existente: en organizaciones que ya tienen reglas deterministas, estas cabezas añaden una señal estadística que cubre patrones no codificados explícitamente, manteniendo las reglas como autoridad final.
- Auditoría y validación de umbrales: los ficheros `thresholds.json`, `metrics.json` y `eval_unseen.json` permiten reconstruir la evaluación completa y justificar ante auditoría por qué se eligió cada punto de operación, incluyendo la partición de datos empleada.
- Transferencia a datos propios mediante reentrenamiento: el pipeline documentado (XGBoost más calibración isotónica más Optuna) sirve como plantilla para reentrenar cada cabeza con casos reales adjudicados de una entidad concreta, sustituyendo los datos sintéticos de IBM.
- Detección de abuso en canales de mensajería de producto: la cabeza de mensajes, con su vectorizador persistido, se puede desplegar en un servicio de moderación que puntúe mensajes entrantes y derive a revisión los que superen el umbral configurado.
- Análisis de deriva temporal: la evaluación documentada incluye una rebanada de años futuros con PR-AUC 0,847 frente a 0,689 en semilla nueva, lo que permite monitorizar el comportamiento del modelo cuando cambia la distribución de los datos.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los publicados por el autor en la model card. Corresponden a evaluación sobre datos no vistos, con el detalle completo en `eval_unseen.json`.

| Cabeza | Modelo | Conjunto de evaluación | Métrica | Resultado |
|---|---|---|---|---|
| Fraude en transacciones | XGBoost + calibración isotónica, ajustado con Optuna | Semilla nueva (fresh-seed) | PR-AUC | 0,689 |
| Fraude en transacciones | XGBoost + calibración isotónica, ajustado con Optuna | Rebanada de años futuros | PR-AUC | 0,847 |
| Phishing en mensajes | TF-IDF (caracteres + palabras) + rasgos léxicos, XGBoost | 18 sondas elaboradas a mano | Aciertos | 18/18 |
| Recuento de mensajes | XGBoost (reserva) | No documentado | No documentado | Solo orientativo (advisory-only fallback) |
| Phishing en URL | XGBoost léxico | 20 sondas | Aciertos | 19/20 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a un modelo tabular de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. Son árboles XGBoost serializados en JSON más un vectorizador TF-IDF en joblib; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica. No se requiere GPU para servir estos artefactos.
- Compatibilidad con GPU de consumo: no aplica en el sentido de VRAM, ya que el despliegue previsto es en CPU. Cualquier equipo capaz de ejecutar el servicio FastAPI de NEXUS puede servirlos.
- Memoria RAM: no disponible con cifras concretas; está acotada por el tamaño del vectorizador TF-IDF y del conjunto de árboles, que no se documenta. El repositorio completo figura como 0.0 GB en HuggingFace, lo que sugiere artefactos de tamaño reducido.
- Opciones de despliegue: servicio FastAPI del propio NEXUS (`ml/service.py`), copiando los directorios en `ml/artifacts/<task>/<version>/` o apuntando la variable de entorno `MODEL_ARTIFACT_ROOT` a este repositorio. Carga directa en Python con la librería `xgboost` (ficheros `model.json`) y `joblib` (ficheros `calibration_model.joblib` y `vectorizer.joblib`).
- Latencia y throughput estimados: no disponible. No se publican medidas de latencia ni de peticiones por segundo.
- Nota de escalado: el entrenamiento con Optuna y la calibración isotónica sí pueden beneficiarse de CPU multinúcleo o de GPU, pero eso corresponde a la fase de reentrenamiento, no a la de inferencia.

## Comparativa con modelos similares

La información proporcionada no incluye modelos externos comparables con métricas publicadas, por lo que no es posible establecer una comparativa cuantitativa con alternativas de terceros. La comparación que sí se puede hacer con los datos disponibles es interna, entre las cuatro cabezas del propio repositorio y frente al componente determinista del sistema NEXUS.

| Componente | Tarea | Tipo de modelo | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `transaction/` | Fraude en transacciones | XGBoost + calibración isotónica (Optuna) | PR-AUC 0,689 (semilla nueva) y 0,847 (años futuros) | MIT | Incluido en el repositorio |
| `message-tfidf/` | Phishing en mensajes | TF-IDF (caracteres + palabras) + léxico + XGBoost | 18/18 sondas | MIT | Incluido en el repositorio |
| `url/` | Phishing en URL | XGBoost léxico | 19/20 sondas | MIT | Incluido en el repositorio |
| `message/` | Recuento de mensajes | XGBoost (reserva) | Solo orientativo, sin métrica publicada | MIT | Incluido en el repositorio |
| Reglas deterministas de NEXUS | Decisión final | Motor de reglas | No documentado | No aplica | Autoridad final por diseño |

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo de lenguaje. No genera texto, no razona, no ejecuta código, no admite tool calling ni agentes. Cualquier expectativa en ese sentido es incorrecta.
- Datos sintéticos: el autor indica explícitamente que los datos de transacciones son sintéticos (IBM) y recomienda reentrenar con casos reales adjudicados antes de usarlos en producción.
- Carácter advisory: las cabezas nunca sobrescriben una regla crítica del sistema NEXUS. Cualquier diseño que delegue la decisión final en estos modelos contradice la intención del autor.
- Riesgo de falso negativo en la cabeza de URL: el resultado declarado es 19/20 en sondas, es decir, al menos un caso no detectado en la evaluación publicada. Con solo 20 sondas, el intervalo de confianza de esa estimación es muy amplio.
- Tamaño de la evaluación: la cabeza de mensajes se evalúa con 18 sondas y la de URL con 20. Son pruebas elaboradas a mano, no conjuntos de validación representativos; la generalización a tráfico real no está demostrada.
- Deriva temporal: la diferencia entre PR-AUC 0,689 en semilla nueva y 0,847 en la rebanada de años futuros sugiere que el rendimiento depende fuertemente de la partición evaluada. Conviene monitorizar la deriva tras el despliegue.
- Idiomas: no se declara ningún idioma soportado. El comportamiento de los rasgos TF-IDF de caracteres y palabras sobre idiomas distintos del corpus de entrenamiento no está documentado.
- Sesgos: no disponible. No se publica ningún análisis de sesgo por segmento de población, canal, importe o geografía.
- Alucinación: el concepto no aplica a un clasificador, pero sí su equivalente funcional, la clasificación errónea con alta confianza. No se publican curvas de fiabilidad más allá de la calibración isotónica de la cabeza de transacciones.
- Validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0.0 GB, lo que apunta a un artefacto recién publicado y sin verificación independiente.
- Licencia: MIT, permisiva, permite uso comercial y modificación sin restricciones más allá de la conservación del aviso de copyright. No se declaran restricciones adicionales.
- Fechas: las marcas de creación y actualización de HuggingFace son del 23 y 24 de septiembre de 2026, según los metadatos del repositorio.
- Producción: no se publican latencias, throughput, garantías de disponibilidad ni pruebas de carga. Cualquier despliegue debería acompañarse de su propia validación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Deepnar/NEXUS-Fraud-Models
- Repositorio de código NEXUS Fraud Detection (fork del autor): https://github.com/Deepnar/NEXUS-Fraud-Detection
- Repositorio original del que deriva el fork: https://github.com/Rishit1769/NEXUS-Fraud-Detection
- Model card del autor: incluida en el README del repositorio de HuggingFace
- Paper, blog o demo adicional: no disponible
