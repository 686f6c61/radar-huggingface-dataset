# abulhawa/industrial-component-anomaly-detection-models

## Resumen

Industrial Component Anomaly Detection — Model Artifacts es un repositorio de artefactos publicado por el usuario abulhawa que recopila pesos entrenados, métricas, mapas de calor de anomalías y visualizaciones de cuatro paneles procedentes del proyecto industrial-component-anomaly-detection. No es un modelo generativo ni un modelo de lenguaje: es un archivo de resultados y pesos para detección de anomalías visuales en componentes industriales, evaluado sobre las 15 categorías del conjunto de datos MVTec AD bajo un protocolo propio denominado fair-eval-v1.

El archivo contiene cuatro configuraciones: un autoencoder convolucional entrenado con Keras (keras_cae), artefactos de evaluación de PatchCore, y salidas de evaluación basadas en DINOv2 y DINOv3 con clasificador 1-NN sobre características de una única capa. Los directorios de DINOv2 y DINOv3 contienen únicamente resultados de evaluación y metadatos (metadata.json); no incluyen los pesos de los encoders preentrenados, y tampoco se distribuye el conjunto de datos MVTec AD original. El tamaño del repositorio es de 2,6 GB y la librería declarada es keras.

Su relevancia es doble: por un lado, ofrece una comparativa reproducible entre enfoques clásicos de detección de anomalías industriales (autoencoder, PatchCore, características DINO con 1-NN) con métricas homogéneas; por otro, publica los artefactos completos (huellas, configuraciones, evidencia de particiones) para auditar los resultados. En la fecha de actualización registrada (23 de septiembre de 2026) el repositorio acumulaba 0 descargas y 0 likes, y no ofrece endpoint de inferencia alojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro configuraciones: autoencoder convolucional (keras_cae); PatchCore (banco de memoria de características con vecino más cercano); DINOv2 con 1-NN sobre una única capa; DINOv3 con 1-NN sobre una única capa |
| Parametros totales | no disponible (no se publican recuentos de parámetros; los pesos DINOv2/DINOv3 no están incluidos en el archivo) |
| Parametros activos | no aplica (ninguna configuración es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (tarea de visión por computador; sin capacidades lingüísticas) |
| Licencia | Mixta, nombre declarado mixed-upstream-terms. Donde apliquen, las imágenes derivadas de MVTec, superposiciones, artefactos de evaluación y modelos entrenados con MVTec AD se distribuyen bajo CC BY-NC-SA 4.0. Tratar como no comercial salvo que se establezcan derechos más amplios por separado |
| Formato de pesos | Pesos de Keras en `keras_cae/` (formato de fichero exacto no especificado); `patchcore/`, `dinov2/` y `dinov3/` contienen artefactos de evaluación y metadatos JSON, no pesos de encoder |
| Tarea | Detección de anomalías a nivel de imagen y localización a nivel de píxel |
| Libreria | keras |
| Tamano del repositorio | 2,6 GB |
| Fecha de publicacion | Creado el 2026-09-23; actualizado el 2026-09-23 |
| Descargas / likes | 0 / 0 |
| Endpoint de inferencia | no disponible (el repositorio solo almacena artefactos descargables) |

## Arquitectura y entrenamiento

El archivo agrupa cuatro pipelines distintos. El autoencoder convolucional de Keras se entrena con imágenes normales y detecta anomalías por error de reconstrucción. PatchCore construye un banco de memoria de características locales con un backbone preentrenado y puntúa anomalías mediante búsqueda del vecino más cercano. Las configuraciones DINOv2 y DINOv3 emplean características de una sola capa del encoder con un clasificador 1-NN. En las cuatro configuraciones el régimen es de una clase: se dispone únicamente de muestras normales para el ajuste del detector, que es el escenario estándar en inspección industrial, donde los defectos reales son raros y heterogéneos.

Los datos de entrenamiento y evaluación son las 15 categorías de MVTec AD (Bottle, Cable, Capsule, Carpet, Grid, Hazelnut, Leather, Metal Nut, Pill, Screw, Tile, Toothbrush, Transistor, Wood y Zipper). El archivo no incluye el conjunto de datos original ni los pesos preentrenados de DINOv2/DINOv3. Los umbrales de decisión para el F1 de imagen se eligen a partir de datos normales de validación, y las medias publicadas son medias no ponderadas sobre las 15 categorías bajo el protocolo fair-eval-v1. Los detalles metodológicos se documentan en la documentación del proyecto y en el informe técnico enlazado.

Como innovaciones destacables de la publicación cabe señalar el uso de AUPIMO como métrica de localización a nivel de píxel orientada a bajos falsos positivos, la inclusión de mapas de calor de anomalías y visualizaciones de cuatro paneles, y la trazabilidad mediante metadata.json por modelo con huellas, configuración y evidencia de particiones. El autor advierte de que algunas cifras del informe técnico difieren ligeramente de los metadatos y curvas archivados, y recomienda usar los ficheros por modelo para los valores exactos.

## Capacidades

- Detección de anomalías a nivel de imagen: clasificación normal/anómalo con umbral calibrado sobre validación normal, evaluada con F1 y AUROC.
- Localización de anomalías a nivel de píxel: generación de mapas de calor y puntuación mediante AUPIMO, orientada a localizar el defecto con baja tasa de falsos positivos.
- Evaluación por categoría: resultados desglosados para las 15 categorías de MVTec AD, lo que permite analizar el comportamiento en texturas (Carpet, Grid, Leather, Wood) frente a objetos (Screw, Transistor, Metal Nut, Cable).
- Reproducibilidad y auditoría: cada modelo incluye metadata.json con configuración, evidencia de particiones y huellas.
- Comparación interna entre cuatro familias de métodos bajo un protocolo común (fair-eval-v1).
- No dispone de generación de texto ni de capacidades de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de visión-lenguaje: es un detector visual sin componente lingüístico.
- No incluye modo de razonamiento explícito (thinking mode), ni entrada/salida de audio.

## Casos de uso

- Inspección de calidad en línea de producción: el detector se aplica a imágenes de piezas recién fabricadas y emite una puntuación de anomalía por imagen; la configuración DINOv2 single layer 1-NN alcanza un F1 medio de 0,941 y un AUROC de 0,979 sobre las 15 categorías de MVTec AD, lo que la sitúa como la opción por defecto del archivo para este escenario.
- Localización de defectos para revisión humana: los mapas de calor y las visualizaciones de cuatro paneles permiten señalar la región sospechosa, de modo que un operario confirme o descarte la alerta en lugar de revisar la pieza completa.
- Selección de arquitectura antes de desplegar: el archivo compara cuatro configuraciones con métricas homogéneas, de modo que un equipo puede decidir entre un enfoque de reconstrucción (CAE) y enfoques basados en características preentrenadas (PatchCore, DINOv2, DINOv3) en función de los requisitos de precisión y coste computacional.
- Inspección de texturas frente a objetos: los resultados por categoría permiten elegir el método adecuado según el tipo de pieza; por ejemplo, DINOv2 obtiene F1 de 0,989 en Carpet y 0,995 en Metal Nut, mientras que PatchCore destaca en Bottle (0,962) y Capsule (0,982).
- Prototipado con recursos limitados: el autoencoder convolucional de Keras se entrena únicamente con imágenes normales y sus pesos son la única pieza entrenada incluida en el archivo, lo que facilita experimentos de reconstrucción sin depender de encoders preentrenados de terceros.
- Análisis de falsos positivos en producción: el umbral se calibra con datos normales de validación y la métrica AUPIMO mide la localización con baja tasa de falsos positivos, lo que permite ajustar el punto de operación antes de automatizar el rechazo de piezas.
- Investigación y reproducibilidad: los metadata.json con huellas, configuración y evidencia de particiones permiten reconstruir el protocolo fair-eval-v1 y verificar los resultados publicados en el informe técnico.
- Auditoría de un pipeline interno de control de calidad: al disponer de artefactos de evaluación por categoría, un equipo puede contrastar su propio detector contra estas referencias numéricas en las mismas 15 categorías.

## Benchmarks y rendimiento

Resultados publicados en la model card, medias no ponderadas sobre las 15 categorías de MVTec AD bajo el protocolo fair-eval-v1. El F1 de imagen usa umbrales elegidos a partir de datos normales de validación; AUROC de imagen y AUPIMO de píxel resumen el ranking y la localización con baja tasa de falsos positivos.

| Configuracion | Categorias | Image F1 ↑ | Image AUROC ↑ | Pixel AUPIMO ↑ |
|---|---:|---:|---:|---:|
| DINOv2, single layer 1-NN original | 15 | 0.941 | 0.979 | 0.602 |
| DINOv3, single layer 1-NN | 15 | 0.932 | 0.978 | 0.680 |
| PatchCore | 15 | 0.929 | 0.971 | 0.603 |
| Keras CAE | 15 | 0.496 | 0.722 | 0.059 |

Resultados por categoría de PatchCore y CAE (instantánea del informe técnico, con PR-AUC de imagen calculado a partir de las curvas disponibles en ese momento):

| Categoria | PatchCore F1 | PatchCore PR-AUC | PatchCore AUPIMO | CAE F1 | CAE PR-AUC | CAE AUPIMO |
|---|---:|---:|---:|---:|---:|---:|
| Bottle | 0.962 | 1.000 | 0.982 | 0.992 | 1.000 | 0.507 |
| Cable | 0.933 | 0.985 | 0.511 | 0.154 | 0.624 | 0.000 |
| Capsule | 0.982 | 0.996 | 0.563 | 0.476 | 0.917 | 0.052 |
| Carpet | 0.926 | 0.994 | 0.796 | 0.635 | 0.835 | 0.003 |
| Grid | 0.916 | 0.986 | 0.506 | 0.602 | 0.901 | 0.077 |
| Hazelnut | 0.971 | 0.999 | 0.863 | 0.500 | 0.902 | 0.033 |
| Leather | 0.898 | 0.998 | 0.972 | 0.786 | 0.892 | 0.075 |
| Metal Nut | 0.963 | 0.998 | 0.760 | 0.243 | 0.825 | 0.002 |
| Pill | 0.891 | 0.982 | 0.293 | 0.395 | 0.923 | 0.030 |
| Screw | 0.796 | 0.983 | 0.380 | 0.421 | 0.887 | 0.005 |
| Tile | 0.951 | 0.993 | 0.685 | 0.132 | 0.727 | 0.001 |
| Toothbrush | 0.923 | 0.949 | 0.414 | 0.735 | 0.922 | 0.054 |
| Transistor | 0.916 | 0.976 | 0.427 | 0.657 | 0.758 | 0.005 |
| Wood | 0.952 | 0.995 | 0.642 | 0.182 | 0.955 | 0.008 |
| Zipper | 0.962 | 0.985 | 0.251 | 0.513 | 0.940 | 0.025 |
| **Mean (report)** | **0.929** | **0.988** | **0.603** | **0.495** | **0.867** | **0.058** |

Resultados por categoría de DINOv2 y DINOv3 (AUROC a nivel de imagen, AUPIMO a nivel de píxel):

| Categoria | DINOv2 F1 | DINOv2 AUROC | DINOv2 AUPIMO | DINOv3 F1 | DINOv3 AUROC | DINOv3 AUPIMO |
|---|---:|---:|---:|---:|---:|---:|
| Bottle | 0.992 | 1.000 | 0.900 | 0.992 | 1.000 | 0.889 |
| Cable | 0.906 | 0.960 | 0.496 | 0.957 | 0.992 | 0.719 |
| Capsule | 0.854 | 0.945 | 0.123 | 0.888 | 0.982 | 0.521 |
| Carpet | 0.989 | 0.998 | 0.960 | 0.937 | 0.996 | 0.969 |
| Grid | 0.958 | 1.000 | 0.981 | 0.926 | 0.989 | 0.839 |
| Hazelnut | 0.979 | 0.996 | 0.605 | 0.979 | 0.999 | 0.823 |
| Leather | 0.953 | 1.000 | 1.000 | 0.968 | 1.000 | 1.000 |
| Metal Nut | 0.995 | 1.000 | 0.539 | 0.984 | 1.000 | 0.891 |
| Pill | 0.936 | 0.974 | 0.561 | 0.964 | 0.981 | 0.449 |
| Screw | 0.849 | 0.876 | 0.266 | 0.732 | 0.860 | 0.012 |
| Tile | 0.988 | 1.000 | 0.964 | 0.982 | 1.000 | 0.941 |
| Toothbrush | 0.968 | 0.994 | 0.139 | 0.938 | 0.986 | 0.701 |
| Transistor | 0.811 | 0.958 | 0.113 | 0.854 | 0.929 | 0.270 |
| Wood | 0.960 | 0.989 | 0.687 | 0.916 | 0.982 | 0.580 |
| Zipper | 0.975 | 0.992 | 0.695 | 0.970 | 0.981 | 0.588 |
| **Mean (archive)** | **0.941** | **0.979** | **0.602** | **0.932** | **0.978** | **0.680** |

Notas del autor sobre estos datos: para DINOv2 se usa el baseline original excluyendo los experimentos mejorados; para DINOv3 se usa el último resultado baseline archivado por categoría, y Bottle y Cable cuentan además con una ejecución anterior. Los valores por categoría, hashes de modelo, configuración y evidencia de particiones están en cada metadata.json. El autor indica explícitamente que estos resultados no establecen el rendimiento sobre otros datos de producción.

## Requisitos de hardware

- VRAM para inferencia: no disponible. La model card no publica cifras de memoria ni de latencia.
- GPU recomendadas: no disponible. No se especifican modelos de GPU ni requisitos mínimos.
- Compatibilidad con GPU de consumo: no disponible como dato explícito. El autoencoder convolucional de Keras es la configuración más ligera del archivo, pero no se publican sus parámetros ni su huella de memoria; las configuraciones DINOv2 y DINOv3 dependen de encoders preentrenados que no están incluidos en el repositorio y deben obtenerse por separado.
- Opciones de despliegue: la librería declarada es keras, por lo que los pesos del CAE son consumibles desde el ecosistema Keras/TensorFlow. El repositorio no ofrece endpoint de inferencia alojado; solo almacena artefactos descargables. Para PatchCore y para las variantes DINO habría que reconstruir el pipeline a partir de la documentación del proyecto y de los encoders originales.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 2,6 GB, incluyendo pesos entrenados, métricas, mapas de calor de anomalías y visualizaciones de cuatro paneles.

## Comparativa con modelos similares

La comparación interna entre las cuatro configuraciones del propio archivo, con datos de la model card:

| Configuracion | Enfoque | Image F1 medio | Image AUROC medio | Pixel AUPIMO medio | Pesos incluidos | Licencia |
|---|---|---:|---:|---:|---|---|
| DINOv2 single layer 1-NN | Características preentrenadas + 1-NN | 0.941 | 0.979 | 0.602 | No (solo evaluación y metadatos) | Mixta, uso no comercial |
| DINOv3 single layer 1-NN | Características preentrenadas + 1-NN | 0.932 | 0.978 | 0.680 | No (solo evaluación y metadatos) | Mixta, uso no comercial |
| PatchCore | Banco de memoria de parches + vecino más cercano | 0.929 | 0.971 | 0.603 | Artefactos de evaluación | Mixta, uso no comercial |
| Keras CAE | Autoencoder convolucional por reconstrucción | 0.496 | 0.722 | 0.059 | Sí (pesos entrenados) | Mixta, uso no comercial |

Alternativas externas mencionadas en la búsqueda web: el artículo indexado en IEEE describe un marco híbrido que combina PaDiM y PatchCore para la detección de anomalías en piezas industriales, si bien no se dispone de sus cifras en la información proporcionada. La encuesta accesible en IJSAT revisa conjuntos de datos de referencia, métricas de evaluación y direcciones futuras (IA explicable, aprendizaje híbrido, sistemas adaptativos escalables); tampoco se dispone de resultados numéricos comparables en la información proporcionada. Para el resto de alternativas de la misma categoría: no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: el archivo es de procedencia mixta y no existe una única licencia permisiva aplicable a todos los ficheros. Donde apliquen, las imágenes derivadas de MVTec AD, superposiciones, artefactos de evaluación y modelos entrenados con MVTec AD se distribuyen bajo CC BY-NC-SA 4.0. Debe tratarse como no comercial salvo que se hayan establecido derechos más amplios por separado. Es imprescindible revisar LICENSE.md, que contiene términos específicos por ruta.
- Contenido incompleto: no se incluye el conjunto de datos MVTec AD original ni los pesos preentrenados de los encoders DINOv2 y DINOv3. Los directorios de DINO contienen solo salidas de evaluación y metadatos, por lo que no es posible ejecutar esas configuraciones únicamente con este repositorio.
- Ausencia de endpoint: el repositorio almacena artefactos descargables y no proporciona servicio de inferencia alojado.
- Validez externa limitada: el propio autor advierte de que los resultados de benchmark no establecen el rendimiento sobre otros datos de producción. MVTec AD es un conjunto con condiciones de captura controladas y 15 categorías concretas, por lo que el comportamiento en líneas reales con iluminación variable, oclusiones o nuevos tipos de pieza no está caracterizado.
- Rendimiento desigual por categoría: el CAE cae a F1 de 0,132 en Tile, 0,154 en Cable, 0,182 en Wood y 0,243 en Metal Nut. La localización a nivel de píxel también es débil en varias categorías: DINOv3 obtiene AUPIMO de 0,012 en Screw y PatchCore de 0,251 en Zipper, 0,293 en Pill y 0,380 en Screw.
- Caída de DINOv3 frente a DINOv2 en casos concretos: en Screw, DINOv3 baja a F1 de 0,732 (frente a 0,849) y en Grid a 0,926 (frente a 0,958), pese a mejorar el AUPIMO medio global (0,680 frente a 0,602).
- Discrepancias entre artefactos: los valores del informe técnico difieren ligeramente de los metadatos y curvas archivados; el autor recomienda usar los ficheros por modelo para los valores exactos.
- Riesgo de falsos positivos y falsos negativos: al ser un detector de una clase entrenado con muestras normales, no existe una noción de "alucinación" textual, pero sí de alertas erróneas; el umbral de decisión debe recalibrarse con datos normales del entorno de despliegue.
- Trazabilidad escasa en el ecosistema: 0 descargas y 0 likes en la fecha registrada, sin pipeline de HuggingFace declarado, lo que dificulta contrastar su uso real por terceros.
- Idiomas: no aplica. No hay capacidades lingüísticas ni multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abulhawa/industrial-component-anomaly-detection-models
- Licencia del archivo: https://huggingface.co/abulhawa/industrial-component-anomaly-detection-models/blob/main/LICENSE.md
- Proyecto original en GitHub: https://github.com/foersben/industrial-component-anomaly-detection/
- Documentación de detección de anomalías: https://foersben.github.io/industrial-component-anomaly-detection/data_science/
- Resultados detallados de experimentos DINOv2: https://foersben.github.io/industrial-component-anomaly-detection/data_science/dinov2_experiment_results/
- Informe técnico (fuente LaTeX): https://github.com/foersben/industrial-component-anomaly-detection/blob/main/docs/latex/technical_report/report.tex
- Repositorio del autor: https://github.com/abulhawa/anomaly-detection
- Descripción del proyecto por el autor: https://github.com/abulhawa/anomaly-detection/blob/main/Anomaly%20Detection%20in%20Industrial%20Components.md
- Artículo en IEEE sobre detección de anomalías en componentes industriales (marco híbrido PaDiM + PatchCore): https://ieeexplore.ieee.org/document/11354319
- PDF de la encuesta sobre detección de anomalías con visión por computador: https://www.ijsat.org/papers/2025/2/6154.pdf
- Ficha de la encuesta en IJSAT: https://www.ijsat.org/research-paper.php?id=6154
