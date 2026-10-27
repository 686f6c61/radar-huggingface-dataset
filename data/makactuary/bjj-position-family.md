# makactuary/bjj-position-family

## Resumen

`makactuary/bjj-position-family` es un clasificador tabular entrenado con scikit-learn que predice a cuál de ocho familias de posición de jiu-jitsu brasileño (standing, full_guard, half_guard, side_control, butterfly, turtle, back, mount) corresponde un keyframe de dos practicantes. La entrada es un esqueleto 3D de dos personas con 23 articulaciones cada una; las features son distancias entre articulaciones intra e inter-practicante más alturas de articulaciones, de modo que la representación es invariante a la posición en el espacio, a la orientación y al orden en que se listan los luchadores.

No es un modelo de lenguaje ni una red neuronal: es un bosque aleatorio serializado con joblib, entrenado sobre 351 posiciones extraídas de GrappleMap, el mapa de técnicas de grappling de Eelis van der Weegen (dominio público), a través del dataset `makactuary/grapplemap-bjj-graph`. Las etiquetas son los propios tags de GrappleMap y se descartaron las posiciones con más de un tag candidato, lo que reduce el ruido pero también el tamaño del corpus.

Su relevancia es acotada y muy específica: sirve como bloque de etiquetado automático dentro de pipelines de análisis de poses de grappling, especialmente sobre datos sintéticos o de captura de movimiento derivados de GrappleMap. Con 0 descargas y 0 likes en el momento de la consulta, no hay validación independiente por parte de la comunidad; las únicas métricas disponibles son las del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bosque aleatorio (scikit-learn, `random_forest`), clasificación tabular multoclase |
| Parametros totales | no disponible (la model card no documenta número de árboles ni profundidad) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un único keyframe de 2 x 23 x 3 coordenadas |
| Tipos de cuantizacion | no disponible; artefacto serializado con joblib, sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible; el modelo no procesa texto, las etiquetas de salida están en inglés |
| Licencia | `other` con `license_name: public-domain-dedication`, referida a la licencia de GrappleMap; el código de ejemplo (`grapplemap_models.py`) es MIT |
| Formato de pesos | joblib (`model.joblib`) |
| Versión de la librería | scikit-learn 1.9.1 |
| Número de clases | 8 familias de posición |
| Features de entrada | distancias entre articulaciones intra e inter-practicante y alturas de articulaciones |
| Dataset de entrenamiento | `makactuary/grapplemap-bjj-graph`, derivado de GrappleMap |
| Tamaño del repositorio | 0.0 GB (según metadatos de HuggingFace) |
| Pipeline declarado | `tabular-classification` |

## Arquitectura y entrenamiento

El modelo es un clasificador de bosque aleatorio sobre un vector de features geométricas construido a partir de un keyframe de GrappleMap (2 jugadores x 23 articulaciones x 3D). El diseño de features es la decisión técnica central: en lugar de coordenadas absolutas, se usan distancias entre articulaciones dentro del mismo practicante y entre practicantes, más alturas de articulaciones. Eso elimina la dependencia de la traslación, la rotación alrededor del eje vertical y del orden de los jugadores, lo que hace que un mismo control se represente de forma parecida aunque el keyframe esté authorado con otra orientación. No se documenta en la model card el número de árboles, la profundidad máxima, el criterio de impureza ni el número exacto de features resultantes.

El corpus son 351 posiciones etiquetadas con un único tag de GrappleMap: standing 117, full_guard 48, half_guard 50, side_control 43, butterfly 36, turtle 24, back 18 y mount 15. Hay un desbalance notable (la clase mayoritaria multiplica por casi ocho a la minoritaria). Para evitar fuga de información entre variantes de la misma posición, el autor agrupó por la primera palabra del nombre de la posición: reservó un 25 % de los grupos como conjunto de test y seleccionó el modelo mediante `GroupKFold(5)` sobre el resto. No se menciona uso de RLHF, aumentación de datos ni ajuste fino posterior; tampoco hay etapa de calibración de probabilidades documentada.

## Capacidades

- Clasificación de un keyframe de dos practicantes en una de ocho familias de posición de grappling.
- Invariancia a traslación, orientación y orden de los jugadores gracias al uso exclusivo de distancias y alturas relativas.
- Entrada puramente geométrica: no requiere imágenes, vídeo ni texto, solo el esqueleto 3D.
- Salida de clase única (multiclase, no multietiqueta): no identifica simultáneamente subposiciones ni transiciones.
- Integración sencilla en Python mediante `joblib.load` y `huggingface_hub.hf_hub_download`.
- Soporte de tool calling / function calling: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): no.

## Casos de uso

- Etiquetado automático de secuencias de GrappleMap: aplicar el clasificador keyframe a keyframe sobre las animaciones del repositorio original para segmentar una secuencia completa en familias de posición y generar anotaciones de entrenamiento para modelos de pose más grandes.
- Pre-etiquetado con revisión humana en pipelines de análisis de combate: usar la predicción como primera pasada sobre datos de captura de movimiento y reservar la revisión manual para las clases con F1 bajo (butterfly 0.67, turtle 0.57), reduciendo el coste de anotación.
- Herramienta didáctica interactiva: dado un esqueleto 3D authorado por un instructor, mostrar en tiempo real a qué familia pertenece la posición mientras se construye la técnica, aprovechando la invariancia a orientación para no exigir una cámara o un encuadre concretos.
- Investigación en deportes de grappling: calcular la distribución de tiempo por familia de posición en un conjunto de secuencias y comparar perfiles entre practicantes o estilos, con la advertencia de que los datos de origen son sintéticos.
- Componente de un motor táctico mayor: el repositorio `quantix-martial-arts-engine` del mismo autor sugiere que este clasificador actúa como etapa de reconocimiento dentro de una arquitectura de análisis jerárquico; puede encadenarse con módulos posteriores de transición o de evaluación de control.
- Filtro de calidad de datos de pose: detectar keyframes mal authorados o mal etiquetados comparando la etiqueta declarada con la predicción del modelo, como control de consistencia sobre el dataset `grapplemap-bjj-graph`.
- Prototipado rápido en CPU: al no requerir GPU, permite experimentar con representaciones de features (distancias, alturas, normalizaciones) en portátiles antes de invertir en modelos de visión.

## Benchmarks y rendimiento

| Evaluación | Macro-F1 | Accuracy | Notas |
|---|---|---|---|
| Validación cruzada agrupada de 5 folds (`random_forest`), estimación principal | 0.67 ± 0.12 | no disponible | Grupos por primera palabra del nombre de la posición |
| Split único reservado (85 posiciones) | 0.85 | 0.89 | El autor advierte que este split resultó más fácil de lo habitual |
| Baseline de clase mayoritaria | no disponible | 0.24 | Referencia de accuracy sobre el split reservado |

| Clase | F1 en el split reservado |
|---|---|
| standing | 0.90 |
| full_guard | 0.97 |
| half_guard | 0.87 |
| side_control | 0.92 |
| butterfly | 0.67 |
| turtle | 0.57 |
| back | 0.92 |
| mount | 1.00 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, visión o razonamiento: no son aplicables a este modelo.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna.
- ¿Cabe en consumer GPU / CPU? Sí, es un artefacto de scikit-learn que se carga en memoria principal; el repositorio declara 0.0 GB de tamaño, pero el tamaño exacto del `.joblib` no se documenta.
- Memoria RAM: no disponible de forma explícita; acotada por el tamaño del bosque y del vector de features, ambos pequeños.
- Opciones de despliegue: `joblib.load` + scikit-learn 1.9.1 en un script de Python, servible detrás de FastAPI, Flask o como función en un pipeline por lotes. vLLM, llama.cpp, Ollama y TGI no aplican.
- Latencia y throughput: no disponibles; no hay medición publicada. Al evaluarse sobre decenas o centenares de features numéricas en CPU, la inferencia por muestra es del orden de microsegundos a pocos milisegundos, pero se trata de una expectativa, no de un dato medido.
- Dependencia crítica: la versión de scikit-learn usada en la deserialización debe ser compatible con 1.9.1; cambios de versión pueden romper la carga del `joblib`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificación de familias de posición de grappling a partir de esqueletos 3D). La model card no cita alternativas ni publica comparaciones contra otros clasificadores. Como referencia interna, la única comparación disponible es contra el baseline trivial del propio autor:

| Referencia | Macro-F1 | Accuracy | Contexto |
|---|---|---|---|
| Este modelo (split reservado) | 0.85 | 0.89 | 85 posiciones retenidas por grupo |
| Este modelo (CV agrupada 5 folds) | 0.67 ± 0.12 | no disponible | Estimación principal según el autor |
| Baseline de clase mayoritaria | no disponible | 0.24 | Mismo split reservado |
| Otros modelos de la categoría | no disponible | no disponible | No identificados en la información disponible |

## Limitaciones y advertencias

- GrappleMap es un mapa de técnicas authorado a mano, no combates grabados: el modelo no ha sido validado sobre vídeo real ni sobre poses estimadas a partir de vídeo 2D, por lo que su uso en producción con metraje de combate no está respaldado.
- Corpus muy pequeño (351 posiciones) y con clases de 15 a 18 ejemplos (mount, back), lo que produce intervalos de confianza amplios y una variabilidad de ±0.12 en Macro-F1 según el split.
- El agrupamiento por primera palabra del nombre reduce la fuga entre variantes, pero no la elimina: posiciones estrechamente relacionadas con nombres distintos pueden seguir compartiendo información.
- Rendimiento notablemente inferior en butterfly (0.67) y turtle (0.57); conviene no automatizar esas clases sin revisión humana.
- El split reservado (0.85) es sistemáticamente más optimista que la validación cruzada (0.67); usar 0.67 como expectativa realista.
- El modelo devuelve una única etiqueta por keyframe, sin probabilidades calibradas documentadas ni información sobre incertidumbre por muestra.
- No procesa texto ni imágenes; no admite tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa de ese tipo es un error de categoría.
- Riesgo de alucinación en el sentido habitual: no aplica, pero sí existe riesgo de clasificación errónea silenciosa, sin señal de aviso, en posiciones ambiguas o poco representadas.
- Licencia: el campo de HuggingFace es `other` con `public-domain-dedication`, remitiendo a la licencia de GrappleMap; conviene verificar el texto exacto del enlace antes de un uso comercial, y ten en cuenta que el código de ejemplo es MIT mientras que los pesos del modelo no declaran una licencia estándar (Apache-2.0, MIT) de forma explícita.
- Seguridad: `joblib.load` deserializa objetos Python; cargar artefactos `.joblib` de procedencia no verificada puede ejecutar código arbitrario. Fija la revisión y verifica el hash del fichero.
- Sin descargas ni likes, no hay evidencia de uso independiente ni de robustez fuera del conjunto del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makactuary/bjj-position-family
- Dataset de entrenamiento: https://huggingface.co/datasets/makactuary/grapplemap-bjj-graph
- GrappleMap (repositorio original de Eelis van der Weegen): https://github.com/Eelis/GrappleMap
- Licencia de GrappleMap: https://github.com/Eelis/GrappleMap/blob/master/LICENSE
- Código del motor y extracción de features (`grapplemap_models.py`): https://github.com/000MAK/quantix-martial-arts-engine
