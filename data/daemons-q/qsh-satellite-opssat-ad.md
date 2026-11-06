# Daemons-Q/qsh-satellite-opssat-ad

## Resumen

OPS-SAT segment anomaly detector es un modelo de clasificación tabular publicado por Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación con criptografía post-cuántica. El modelo detecta anomalías en segmentos de telemetría del satélite OPS-SAT de la ESA, a partir de 18 características por segmento más una columna de metadatos (`sampling`), sumando 19 variables de entrada. Se distribuye en formato ONNX y está pensado para ejecutarse también en el navegador mediante onnxruntime-web.

Técnicamente no es un modelo de lenguaje ni una red neuronal profunda: son árboles con gradient boosting entrenados sobre el conjunto de datos público OPS-SAT-AD, que contiene 2.123 segmentos anotados de 9 canales, con un 20,4 % de segmentos anómalos. La relevancia del artefacto no está en la arquitectura, sino en su empaquetado: pesos ligeros, corpus redistribuible bajo CC BY 4.0 y ejecución local sin dependencias de servidor, lo que encaja en escenarios de privacidad y verificación reproducible.

El autor declara explícitamente que se trata de una prueba de concepto de investigación y no de un sistema de producción, y advierte de que la partición train/test del benchmark es aleatoria estratificada y no temporal, por lo que las métricas no miden generalización en el tiempo. Además, el propio autor señala que el grafo ONNX exportado obtiene una accuracy de 0,9509 frente a la 0,9660 registrada para el modelo de scikit-learn original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient-boosted trees (clasificador tabular) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 19 características) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX |
| Pipeline | tabular-classification |
| Caracteristicas de entrada | 19 (18 features por segmento + columna `sampling`) |
| Tamano del repositorio | 0,0 GB (según Hugging Face) |
| Libreria | onnx / onnxruntime-web |

## Arquitectura y entrenamiento

El modelo es un conjunto de árboles potenciados por gradiente aplicado a clasificación binaria de segmentos de telemetría. La entrada son 18 características publicadas por segmento más la columna de metadatos `sampling`; la salida es la probabilidad de que el segmento sea anómalo. No hay tokenización, atención ni capas transformer: el artefacto es un grafo ONNX exportado desde un modelo de scikit-learn, según indica el propio autor.

El entrenamiento se realizó sobre el dataset OPS-SAT-AD (Ruszczak et al., Scientific Data 12, 710, 2025), con 1.594 segmentos de entrenamiento y 529 de test, y una tasa de anomalías en test del 21,36 %. La partición es la del propio benchmark: aleatoria estratificada, no temporal. El autor indica que el tiempo de entrenamiento medido fue de 7,5 segundos. No se documentan técnicas de aumento de datos, búsqueda de hiperparámetros ni calibración adicional más allá de lo que refleja el código en `scripts/train/`, que no está incluido en la información disponible.

## Capacidades

- Clasificación binaria de segmentos de telemetría de satélite como normales o anómalos.
- Procesamiento de 19 variables tabulares por instancia (18 features + `sampling`).
- Ejecución en navegador mediante onnxruntime-web, sin backend de inferencia dedicado.
- Distribución en un único grafo ONNX de tamaño reducido, apto para despliegue en entornos con recursos limitados.
- Reproducibilidad del corpus: el conjunto de test puede redistribuirse junto con los pesos por la licencia CC BY 4.0 del dataset.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Monitorización de telemetría de CubeSats: el modelo clasifica segmentos de los 9 canales de OPS-SAT y marca los que presentan patrones anómalos, lo que permite priorizar la revisión manual de los segmentos con mayor probabilidad de fallo.
- Detección de anomalías en el borde (edge): al ejecutarse vía ONNX Runtime en el propio segmento o en una estación terrena con pocos recursos, evita enviar telemetría cruda a un servidor central.
- Validación en el navegador: integración en paneles web de operaciones mediante onnxruntime-web, de forma que el analista pueda puntuar segmentos descargados sin que estos salgan de su equipo.
- Reproducción de benchmarks académicos: sirve como referencia ejecutable del conjunto OPS-SAT-AD para comparar nuevas propuestas contra las métricas publicadas por Ruszczak et al.
- Prototipado de pipelines de detección de anomalías: al ser un modelo ligero y de entrenamiento rápido (7,5 s), es útil como línea base en experimentos de clasificación tabular antes de escalar a modelos más costosos.
- Docencia y demostraciones de privacidad: el autor lo enmarca en una demostración de orquestación con criptografía post-cuántica, por lo que puede usarse para ilustrar flujos de inferencia local sin exponer datos.
- Filtrado previo en sistemas de alertas: los segmentos con alta probabilidad de anomalía pueden enrutarse a un analista humano, reduciendo el volumen de revisiones.

## Benchmarks y rendimiento

Métricas medidas por el autor sobre la partición de test del benchmark (529 segmentos):

| Metrica | Valor |
|---|---|
| accuracy | 0,96597 |
| anomaly_rate_test | 0,21361 |
| auc_pr | 0,96811 |
| auc_pr_baseline | 0,21361 |
| auroc | 0,98815 |
| f1 | 0,91892 |
| n_features | 19 |
| n_test_segments | 529 |
| n_train_segments | 1594 |
| wall_clock_s | 7,5 |

Comparación con las líneas base publicadas por Ruszczak et al. (Scientific Data 12, 2025), sobre la misma partición de test:

| Modelo | AUC PR | F1 | MCC |
|---|---|---|---|
| FCNN (mejor de 30 algoritmos) | 0,979 | 0,946 | 0,932 |
| XGBOD | 0,975 | no disponible | no disponible |
| RF+ICCS | 0,963 | no disponible | no disponible |
| OPS-SAT segment anomaly detector (este modelo) | 0,96811 | 0,91892 | no disponible |

El autor indica que el grafo ONNX exportado obtiene accuracy 0,9509 sobre los mismos 529 segmentos, frente a 0,9660 del modelo de scikit-learn original. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el modelo es un grafo ONNX de árboles, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; el modelo puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso en CPU, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), onnxruntime-web en navegador; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput: no disponibles; el único dato temporal es el tiempo de entrenamiento (7,5 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | AUC PR | F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPS-SAT segment anomaly detector | Gradient-boosted trees, ONNX | 0,96811 | 0,91892 | CC BY 4.0 | Hugging Face |
| FCNN (Ruszczak et al.) | Red neuronal densa | 0,979 | 0,946 | no disponible en la información | Publicado en el paper |
| XGBOD (Ruszczak et al.) | Gradient boosting para anomalías | 0,975 | no disponible | no disponible en la información | Publicado en el paper |
| RF+ICCS (Ruszczak et al.) | Random forest + ICCS | 0,963 | no disponible | no disponible en la información | Publicado en el paper |

La comparación es directa porque los cuatro modelos se evalúan sobre la misma partición de test del benchmark OPS-SAT-AD. El modelo de este repositorio queda por debajo del FCNN y del XGBOD en AUC PR, y por encima del RF+ICCS. No se dispone de datos de MCC para este modelo.

## Limitaciones y advertencias

- El autor declara explícitamente que es una prueba de concepto de investigación, no un sistema de producción.
- La partición train/test es aleatoria estratificada, no temporal: las métricas no miden generalización sobre el tiempo, algo crítico en telemetría de satélite donde los regímenes operativos cambian.
- El grafo ONNX exportado rinde peor que el modelo original de scikit-learn (accuracy 0,9509 frente a 0,9660), por lo que las métricas de la model card no describen exactamente el artefacto distribuido.
- El modelo no se evalúa bajo cifrado en ningún flujo del proyecto; el propio autor lo aclara.
- El rendimiento está por debajo de la línea base publicada (FCNN, AUC PR 0,979), por lo que no constituye el estado del arte en la tarea.
- No hay información sobre sesgos, calibración de probabilidades ni comportamiento ante distribución desplazada.
- No se documentan idiomas ni capacidades de texto: es un modelo estrictamente tabular.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero obliga a citar a los autores del dataset y del modelo; el autor no ofrece garantías.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo.
- El dataset está fijado a la versión 1 de Zenodo (registro 12588359); la versión 2 cambia los ficheros y añade un fichero LICENSE, por lo que la reproducibilidad depende de usar la versión correcta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-satellite-opssat-ad
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Paper del benchmark: https://doi.org/10.1038/s41597-025-05035-3
- Dataset en Zenodo (versión 1): https://doi.org/10.5281/zenodo.12588359
