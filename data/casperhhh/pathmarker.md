# Casperhhh/PathMarker

## Resumen

PathMarker es un modelo de segmentación semántica de imágenes especializado en histopatología, publicado por el usuario Casperhhh en Hugging Face bajo una licencia derivada de la licencia SAM (Segment Anything Model). El modelo está diseñado para la tarea de image-segmentation dentro del pipeline de Hugging Face, con aplicación directa en el análisis de imágenes de tejidos patológicos.

El repositorio tiene un tamaño de 3,3 GB y el acceso está restringido (gated), por lo que es necesario aceptar las condiciones de uso en Hugging Face antes de poder descargar los pesos. La fecha de creación indicada es 2026-11-26 y la última actualización 2026-11-26, lo que sugiere un lanzamiento muy reciente.

No se dispone de información pública sobre la arquitectura interna, el número de parámetros, la longitud de contexto (no aplica a un modelo de segmentación de imagen), los datos de entrenamiento ni los resultados de benchmarks en la información proporcionada. La ficha se completa con los datos disponibles y se marcan explícitamente como "no disponible" aquellos campos que no han sido publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de imagen; posible base SAM por la licencia, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | sam-license (licencia del Segment Anything Model) |
| Formato de pesos | no disponible |
| Tarea (pipeline) | image-segmentation |
| Dominio | pathology, histopathology, semantic-segmentation |
| Tamano del repositorio | 3,3 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. Por la etiqueta de licencia (sam-license) y la tarea declarada (semantic-segmentation sobre imágenes de histopatología), es plausible que se trate de un modelo derivado o inspirado en la familia Segment Anything, pero este extremo no está confirmado en los metadatos del repositorio.

Tampoco se dispone de datos sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, el uso de técnicas de ajuste fino supervisado, RLHF/DPO (no aplicables a segmentación) ni innovaciones técnicas destacables como decodificación especulativa o atención lineal. Toda esta sección queda marcada como no disponible.

## Capacidades

- Segmentación semántica de imágenes de histopatología (tejidos patológicos).
- Segmentación de imágenes en general según la tarea declarada en el pipeline de Hugging Face (image-segmentation).
- Etiquetas específicas de dominio: pathology, histopathology, semantic-segmentation, image-segmentation.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado capacidad multilingüe (no aplica a un modelo de visión).
- No se ha documentado modo "thinking", visión multimodal conversacional, audio ni otras capacidades especiales más allá de la segmentación.

## Casos de uso

- Análisis de biopsias digitalizadas: el modelo puede segmentar regiones de tejido en imágenes de portaobjetos completos (whole-slide images) para delimitar áreas de interés antes de un análisis morfométrico.
- Asistencia en patología computacional: integración en pipelines de preprocesado para separar tejido de fondo, artefactos o regiones necróticas en muestras histológicas.
- Investigación en histología cuantitativa: cálculo de áreas y proporciones de tejido segmentado para estudios morfométricos reproducibles.
- Preetiquetado para anotación humana: generar máscaras iniciales que un patólogo revise y corrija, reduciendo el coste de anotación en conjuntos de datos de patología.
- Control de calidad de preparaciones: detección de regiones mal teñidas, pliegues o artefactos mediante la comparación de la segmentación esperada frente a la obtenida.
- Docencia y formación: visualización de segmentaciones sobre imágenes histológicas para explicar estructuras y regiones tisulares.
- Integración en visores de patología digital: superponer máscaras de segmentación en herramientas de visualización para facilitar la inspección de muestras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 3,3 GB, por lo que se puede inferir que los pesos en precisión original rondan ese orden de magnitud, pero no se confirma el número de parámetros ni la precisión de almacenamiento.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es plausible que quepa en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 con 24 GB), pero este extremo no está confirmado.
- Compatibilidad con GPU de consumo: no confirmada; depende de la arquitectura real y de los requisitos del pipeline de segmentación.
- Opciones de despliegue: no se han documentado; al ser un modelo de segmentación de imagen, no aplican vLLM, llama.cpp ni Ollama. Podría integrarse mediante la librería `transformers` si el modelo expone una clase compatible, pero no está confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| PathMarker (Casperhhh) | Segmentación semántica en histopatología | no disponible | no aplica | sam-license | Gated |
| Segment Anything (SAM) | Segmentación de imágenes general | no disponible en esta ficha | no aplica | SAM license | Abierto |
| Otros modelos de segmentación histopatológica | Segmentación en patología | no disponible | no aplica | variable | variable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas. Los datos de rendimiento, parámetros y disponibilidad de los modelos comparables no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de su descarga.
- Licencia sam-license: es una licencia específica del ecosistema SAM; conviene revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de una licencia permisiva estándar.
- Dominio muy específico (histopatología): su comportamiento fuera de imágenes de tejidos patológicos no está documentado y probablemente sea deficiente.
- Sin datos de entrenamiento ni evaluación publicados: no es posible valorar su precisión, robustez ante distintas tinciones, escáneres o resoluciones.
- Riesgo de sesgo por dominio: si el conjunto de entrenamiento está sesgado hacia ciertos tipos de tejido, tinción o fabricante de escáner, el rendimiento puede degradarse en muestras diferentes.
- Riesgo de alucinación de máscaras: como todo modelo de segmentación, puede producir segmentaciones plausibles pero incorrectas; requiere validación humana en contextos clínicos.
- Sin métricas de benchmarks: no se puede comparar objetivamente con alternativas.
- Uso clínico: no debe emplearse como herramienta diagnóstica sin validación regulatoria y supervisión profesional.
- Idiomas: no aplica, pero la documentación del modelo no está disponible en castellano ni en otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/Casperhhh/PathMarker
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
