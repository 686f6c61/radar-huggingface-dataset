# dhruvv1402/penumbra-nids

## Resumen

Penumbra NIDS es un conjunto de detectores de intrusiones de red basados en aprendizaje automatico supervisado y de novedad, publicado por el autor dhruvv1402 en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de tres clasificadores tabulares serializados con `joblib` que emplean `scikit-learn`: un bosque aleatorio de 300 arboles combinado con una cabeza de deteccion de novedades entrenada unicamente con trafico benigno. El objetivo es alimentar un SOC (centro de operaciones de seguridad) con alertas, sin bloquear trafico en ningun momento.

El repositorio agrupa tres variantes entrenadas sobre conjuntos de datos de referencia en seguridad de redes: UNSW-NB15, NSL-KDD y CICIDS2017 (limitado a los dias de lunes a miercoles, dejando jueves y viernes como conjunto de retencion). Cada detector se calibra con un umbral orientado a una tasa de falsos positivos objetivo sobre filas benignas no vistas durante el entrenamiento, un detalle relevante para entornos de produccion donde el ruido de alertas es critico.

Su relevancia es practica mas que de investigacion: ofrece artefactos listos para cargar en un pipeline de deteccion, junto con muestras de flujos de prueba, informes de evaluacion y un fichero de tecnicas MITRE ATT&CK que alimenta un copiloto de triaje. El tamano del repositorio (0,2 GB) y el uso de `scikit-learn` lo sitúan en un rango de despliegue muy ligero comparado con modelos neuronales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bosque aleatorio de 300 arboles (scikit-learn) + cabeza de deteccion de novedades entrenada con trafico benigno |
| Parametros totales | no disponible (modelo de arboles, no aplica el concepto de parametros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular por flujo de red) |
| Tipos de cuantizacion | no disponible (serializacion `joblib`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto de usuario; el fichero ATT&CK esta en ingles) |
| Licencia | MIT |
| Formato de pesos | `detector.joblib` (pickle de `penumbra.models.detector.PenumbraDetector`) + `metadata.json` |

## Arquitectura y entrenamiento

Cada variante es un `PenumbraDetector` que combina un bosque aleatorio de 300 arboles para la clasificacion supervisada de trafico con una cabeza de novedad entrenada exclusivamente con filas benignas. Los umbrales de decision se fijan por separado para alcanzar una tasa de falsos positivos objetivo sobre filas benignas retenidas, lo que permite ajustar la sensibilidad operativa sin reentrenar. Los conjuntos de entrenamiento son UNSW-NB15, NSL-KDD y CICIDS2017 (lunes a miercoles), con jueves y viernes de CICIDS2017 reservados como prueba.

No se documenta en la informacion disponible el numero de flujos de entrenamiento, la composicion exacta del dataset, ni si hubo tecnicas de aumento o balanceo de clases. El repositorio incluye `metadata.json` con la version del registro, las caracteristicas empleadas y los umbrales, ademas de informes de evaluacion en `reports/` y muestras de flujos retenidos en `samples/`. La carga se realiza mediante `PenumbraDetector.load(<dir>)` con las versiones fijadas en el `uv.lock` del repositorio, lo que implica una dependencia estricta del entorno de ejecucion.

## Capacidades

- Clasificacion de flujos de red como benignos o maliciosos mediante un bosque aleatorio de 300 arboles.
- Deteccion de novedad (anomalias) entrenada solo con trafico benigno, complementaria al clasificador supervisado.
- Umbrales calibrados por tasa de falsos positivos objetivo, ajustables segun el apetito de riesgo del SOC.
- Generacion de alertas para un SOC sin bloqueo activo de trafico (modo solo deteccion).
- Recuperacion de texto de tecnicas MITRE ATT&CK desde `data/interim/attack_techniques.jsonl` para el copiloto de triaje.
- Soporte de tres dominios de datos distintos (UNSW-NB15, NSL-KDD, CICIDS2017).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; no es un modelo generativo.

## Casos de uso

- Monitorizacion pasiva en un SOC: el detector clasifica flujos de red y emite alertas sin bloquear trafico, adecuado para despliegues donde se prioriza la observabilidad sobre la respuesta automatica.
- Triaje asistido con MITRE ATT&CK: el copiloto recupera tecnicas del fichero `attack_techniques.jsonl` para contextualizar cada alerta y ayudar al analista a priorizar.
- Evaluacion comparativa de detectores: los tres conjuntos (UNSW-NB15, NSL-KDD, CICIDS2017) permiten contrastar el rendimiento del mismo enfoque en dominios con distribuciones de ataque distintas.
- Despliegue en entornos con recursos limitados: al ser un modelo de arboles serializado en `joblib`, se ejecuta en CPU sin GPU y con huella de memoria reducida frente a alternativas neuronales.
- Investigacion y docencia en deteccion de intrusiones: el repositorio incluye muestras retenidas e informes de evaluacion que facilitan la reproducibilidad de experimentos.
- Ajuste de sensibilidad operativa: los umbrales calibrados por tasa de falsos positivos permiten adaptar el detector a politicas de alerta mas o menos estrictas sin reentrenar.
- Integracion en pipelines de validacion: los flujos de `samples/` sirven como conjunto de regresion para verificar que una actualizacion del detector no degrada la deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `docs/EVALUATION.md` y `docs/MODEL_CARD.md` del repositorio para la evaluacion, el metodo y las debilidades conocidas, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere aceleracion por GPU.
- Cabe en cualquier equipo consumer: el repositorio completo ocupa 0,2 GB y el modelo cargado en memoria es un bosque de 300 arboles.
- Opciones de despliegue: carga directa con `scikit-learn` y `joblib` mediante `PenumbraDetector.load(<dir>)`, respetando las versiones fijadas en `uv.lock`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Datasets | Licencia | Disponibilidad |
|---|---|---|---|---|
| Penumbra NIDS | Bosque aleatorio + deteccion de novedad | UNSW-NB15, NSL-KDD, CICIDS2017 | MIT | Hugging Face y GitHub |
| Detectores basados en redes neuronales para NIDS | MLP, CNN, LSTM | Depende del autor | Variable | Variable |
| Reglas de IDS (Snort, Suricata) | Basados en firmas | No aplica | GPL/varias | Amplia |

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Los pickles ejecutan codigo al cargarse: solo deben cargarse ficheros verificados por el usuario.
- Dependencia estricta de las versiones fijadas en `uv.lock`; cambios de version de `scikit-learn` pueden romper la compatibilidad del artefacto.
- CICIDS2017 se entrena solo con lunes a miercoles; el rendimiento sobre trafico de jueves y viernes (retenido) puede diferir y debe validarse.
- El modelo esta disenado para alertar, no para bloquear; no debe usarse como unico mecanismo de respuesta automatica.
- No se documentan sesgos, tasas de alucinacion (no aplica a un clasificador) ni limitaciones de idioma en la informacion disponible.
- La licencia MIT permite uso comercial, pero el texto de MITRE ATT&CK incluido esta sujeto a los terminos de uso de The MITRE Corporation.
- No se han publicado cifras de rendimiento en la informacion disponible; la validacion en el entorno objetivo es imprescindible antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/dhruvv1402/penumbra-nids
- Repositorio GitHub: https://github.com/dhruvv1402/penumbra-nids
- Documentacion de evaluacion: `docs/EVALUATION.md` en el repositorio
- Model card del repositorio: `docs/MODEL_CARD.md` en el repositorio
