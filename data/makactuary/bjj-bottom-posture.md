# makactuary/bjj-bottom-posture

## Resumen

`makactuary/bjj-bottom-posture` es un clasificador tabular entrenado con scikit-learn que predice la postura del practicante que está abajo en una posición de jiu-jitsu brasileño (BJJ) a partir de un esqueleto 3D de dos personas. Las tres clases posibles son supino (tumbado boca arriba), girado hacia dentro (*turned in*) y sentado. El autor es `makactuary` y el modelo se publica como un artefacto `joblib` de scikit-learn 1.9.1, no como una red neuronal.

El modelo no procesa texto ni imágenes: consume un keyframe de GrappleMap (2 jugadores × 23 articulaciones × 3 dimensiones) y lo transforma en un vector de características geométricas —distancias articulares intra e inter-jugador y alturas de articulaciones— que resulta invariante a la traslación, a la orientación y al orden en que se listen los dos practicantes. Resuelve, por tanto, un problema acotado de etiquetado automático de posturas dentro del dominio del grappling.

Su relevancia es doble: por un lado sirve como pieza de anotación para construir grafos de transiciones sobre la base de datos GrappleMap; por otro, es un ejemplo de clasificación tabular con ingeniería de características geométricas invariantes, reutilizable como referencia metodológica en analítica deportiva. El conjunto de entrenamiento es pequeño (351 posiciones etiquetadas) y el propio autor advierte que el modelo no se ha validado sobre vídeo real ni sobre poses 2D.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random forest de scikit-learn (clasificación tabular, no red neuronal) |
| Parámetros totales | No disponible (no se publica número de árboles ni profundidad) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la entrada es un único keyframe) |
| Tipos de cuantización | No aplica (artefacto `joblib`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponible (sin entrada ni salida en lenguaje natural) |
| Licencia | `public-domain-dedication` para los pesos; código de inferencia MIT |
| Formato de pesos | `joblib` (`model.joblib`) |

## Arquitectura y entrenamiento

El clasificador es un random forest de scikit-learn entrenado sobre características tabulares derivadas de la geometría del esqueleto, no sobre las coordenadas en bruto. La función de extracción de características vive en `grapplemap_models.py` (repo `000MAK/quantix-martial-arts-engine`) y calcula distancias entre articulaciones dentro de cada jugador y entre ambos, además de alturas de articulaciones. Esa construcción hace que la predicción no dependa de la posición absoluta de los atletas en la escena, de hacia dónde miran ni de cuál de los dos aparece primero en el keyframe.

Los datos proceden de GrappleMap, el mapa de técnicas de BJJ/grappling de Eelis van der Weegen (dominio público), distribuido en el dataset `makactuary/grapplemap-bjj-graph`. Las etiquetas son las etiquetas propias de GrappleMap y se descartaron las posiciones con más de una etiqueta candidata, quedando 351 posiciones: 243 supino, 64 girado hacia dentro y 44 sentado. No se documenta ningún proceso de RLHF/DPO ni ajuste fino adicional; el autor indica que el modelo se seleccionó mediante `GroupKFold(5)`, agrupando por la primera palabra del nombre de la posición para reducir la fuga entre variantes de la misma técnica. No se publican detalles sobre el número de árboles, la profundidad máxima ni el resto de hiperparámetros.

## Capacidades

- Clasificación de la postura del practicante inferior en tres clases discretas: `supine`, `turned_in` y `seated`.
- Invariancia geométrica: las características no dependen de la traslación, la rotación ni del orden de los dos jugadores en la entrada.
- Entrada tabular derivada de un keyframe de GrappleMap (2 × 23 articulaciones × 3D).
- Inferencia determinista y de coste muy bajo, apta para etiquetar lotes grandes de keyframes en CPU.
- Integración sencilla en pipelines de Python vía `joblib.load` y `huggingface_hub`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.

## Casos de uso

- **Anotación de la base de datos GrappleMap**: recorrer los keyframes de una colección y asignar automáticamente la postura del jugador inferior, generando metadatos que alimenten un grafo de transiciones entre posiciones.
- **Preetiquetado de corpus de poses sintéticas**: clasificar por lotes esqueletos generados o exportados desde herramientas de animación para reducir el trabajo de revisión manual antes de un etiquetado definitivo.
- **Analítica de entrenamiento sobre vídeo con pose estimation 3D**: en un pipeline que estime esqueletos 3D cuadro a cuadro, usar el modelo como clasificador de postura inferior para calcular tiempo en supino, girado o sentado por round (con la salvedad de que no se ha validado sobre metraje real).
- **Visor interactivo de técnicas**: resaltar en una aplicación de visualización de GrappleMap el estado del practicante inferior en cada fotograma clave, facilitando la navegación por secuencias.
- **Segmentación previa de datasets de grappling**: separar clips o secuencias según la postura del bottom para construir subconjuntos equilibrados por clase antes de entrenar otros modelos.
- **Base para modelos de predicción de transiciones**: usar la etiqueta de postura como variable de entrada en un modelo posterior que estime la probabilidad de barrido, sumisión o reversal desde una posición concreta.
- **Referencia metodológica en docencia**: ejemplo reproducible de ingeniería de características invariantes a rotación y traslación sobre datos de esqueleto, útil en cursos de aprendizaje automático aplicado a deporte.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Macro-F1 en validación cruzada agrupada de 5 folds (random forest, estimación principal) | 0,80 ± 0,05 |
| Macro-F1 en split único retenido (103 posiciones) | 0,87 |
| Accuracy en split único retenido | 0,89 |
| Accuracy del baseline de clase mayoritaria | 0,75 |
| F1 clase `supine` (split retenido) | 0,93 |
| F1 clase `turned_in` (split retenido) | 0,69 |
| F1 clase `seated` (split retenido) | 1,00 |

El autor advierte explícitamente que el split retenido resultó más fácil que la media y que la cifra de validación cruzada (0,80 ± 0,05) debe leerse como estimación principal. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un random forest sobre un vector de características de pocas decenas de dimensiones; no requiere GPU.
- VRAM estimada: no disponible, y en la práctica innecesaria; el tamaño del repositorio es de 0,0 GB (redondeado), coherente con un artefacto `joblib` de pocos megabytes.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente. No se han publicado medidas de latencia ni throughput.
- Despliegue: carga directa con `joblib.load` en Python, servido típicamente detrás de FastAPI, Flask o un job por lotes; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Dependencias: scikit-learn 1.9.1 (versión con la que se entrenó) y la función `features(keyframe)` del repositorio de código del autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados para esta tarea concreta (clasificación de postura de BJJ a partir de esqueletos 3D). La comparación cuantitativa con alternativas queda, por tanto, no disponible.

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `makactuary/bjj-bottom-posture` | Clasificación de postura inferior en 3 clases | No disponible (random forest) | No aplica | Public domain dedication (pesos) / MIT (código) | HuggingFace |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- GrappleMap es un mapa de técnicas escrito a mano, no partidos grabados: el modelo no se ha evaluado sobre metraje real ni sobre poses estimadas a partir de vídeo 2D.
- El conjunto de datos es muy pequeño (351 posiciones) y las clases están desequilibradas (243 / 64 / 44), lo que se traduce en una variabilidad notable entre particiones (± 0,05 en macro-F1) y en un F1 de solo 0,69 para `turned_in`.
- El agrupamiento por la primera palabra del nombre de la posición reduce, pero no elimina, la fuga de información entre posiciones estrechamente relacionadas.
- Las etiquetas dependen de las anotaciones de GrappleMap; los errores o ambigüedades en esas etiquetas se propagan al clasificador. Las posiciones con más de una etiqueta candidata se excluyeron, de modo que el modelo no cubre esos casos.
- El modelo solo distingue tres posturas del practicante inferior; no identifica la postura del superior, la técnica concreta ni el estado de la transición.
- Sin capacidades de lenguaje, tool calling ni razonamiento: no debe presentarse como asistente ni integrarse en flujos conversacionales.
- Licencia: los pesos se publican bajo `public-domain-dedication` y el código de inferencia bajo MIT, pero conviene verificar la licencia del código de extracción de características y de GrappleMap antes de un uso comercial.
- No hay resultados publicados de robustez frente a ruido en la estimación de pose, oclusiones o errores de tracking, algo crítico si se pretende usar sobre vídeo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makactuary/bjj-bottom-posture
- Dataset de entrenamiento: https://huggingface.co/datasets/makactuary/grapplemap-bjj-graph
- Repositorio de código (incluye `grapplemap_models.py`, MIT): https://github.com/000MAK/quantix-martial-arts-engine
- GrappleMap (Eelis van der Weegen): https://github.com/Eelis/GrappleMap
- Licencia de GrappleMap: https://github.com/Eelis/GrappleMap/blob/master/LICENSE
