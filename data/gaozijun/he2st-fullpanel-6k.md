# gaozijun/he2st-fullpanel-6k

## Resumen

`gaozijun/he2st-fullpanel-6k` es un modelo publicado en HuggingFace por el usuario gaozijun, orientado a histopatología y transcriptómica espacial. Las etiquetas del repositorio (`histopathology`, `spatial-transcriptomics`, `xenium`, `single-cell`) sitúan el modelo en el ámbito de la predicción de expresión génica a partir de imágenes de tejido, un problema habitual en patología computacional: obtener un perfil transcriptómico virtual a partir de una tinción H&E sin necesidad de secuenciación espacial. El nombre del repositorio sugiere un mapeo H&E a transcriptómica espacial (`he2st`) con panel completo (`fullpanel`) y un panel de aproximadamente 6000 genes (`6k`), si bien esta interpretación no está confirmada por documentación oficial en la información disponible.

El modelo tiene 795.550.833 parámetros (dato real extraído del fichero safetensors), lo que lo sitúa en la categoría de ~0,8 mil millones de parámetros, y el repositorio ocupa 3,2 GB. Se distribuye en formato safetensors bajo PyTorch y con licencia marcada como `other`. El acceso es restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de poder descargar los pesos.

La relevancia actual del modelo radica en el interés creciente por los métodos de transcriptómica espacial virtual, que permiten reutilizar grandes archivos de imágenes histológicas ya digitalizadas para inferir expresión génica. No obstante, el repositorio no incluye en la información disponible tarjeta de modelo detallada, resultados de evaluación ni documentación de entrenamiento, por lo que su evaluación rigurosa requiere acceso al repositorio y revisión de los términos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la informacion proporcionada) |
| Parametros totales | 795.550.833 (~795,5 M), dato real del fichero safetensors |
| Parametros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible; no aplica a un modelo de imagen/transcriptomica |
| Tipos de cuantizacion | no documentados; el tamano del repo (3,2 GB) es coherente con pesos en fp32 (795,5 M x 4 bytes ≈ 3,18 GB) |
| Idiomas soportados | no aplica (modelo no linguistico segun sus etiquetas) |
| Licencia | other (condiciones no detalladas en la informacion disponible) |
| Formato de pesos | safetensors (libreria pytorch) |

Otros datos del repositorio: tamano de 3,2 GB, acceso restringido (gated), 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-21 y actualizado el 2026-10-21.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura en la documentacion proporcionada. Las etiquetas del repositorio (`pytorch`, `histopathology`, `spatial-transcriptomics`, `xenium`, `single-cell`) y el nombre `he2st` apuntan a un modelo multimodal que relaciona imagenes de tejido teñido con perfiles de expresion genica, y el volumen de parametros (~795 M) es compatible con un codificador de imagen de tipo Vision Transformer acompanado de cabezas de regresion, pero esta descripcion es una hipotesis por analogia con la literatura del area y no un dato confirmado del repositorio.

Tampoco se dispone de informacion sobre el numero de tokens o muestras de entrenamiento, la composicion del dataset, la procedencia de las imagenes (por ejemplo, si son capturas Xenium u otra plataforma de transcriptomica espacial), ni sobre si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO, que por otra parte no son habituales en este tipo de modelos de regresion. No se han identificado innovaciones tecnicas documentadas (atencion lineal, decodificacion especulativa, destilacion u otras) en la informacion disponible.

## Capacidades

- Prediccion de expresion genica a partir de imagenes histologicas: la combinacion de etiquetas `histopathology` y `spatial-transcriptomics` sugiere la inferencia de perfiles de expresion sobre imagenes de tejido, aunque no se detalla el formato de entrada y salida.
- Cobertura de panel completo: la etiqueta `fullpanel` y el sufijo `6k` apuntan a un panel de genes amplio (posiblemente en torno a 6000 genes), sin confirmacion documental.
- Datos de tipo Xenium y single-cell: las etiquetas `xenium` y `single-cell` indican que el modelo se ha desarrollado en el contexto de plataformas de transcriptomica espacial de resolucion subcelular y de datos de celula unica.
- Generacion de texto: no disponible; no hay indicios de que el modelo sea linguistico.
- Razonamiento, codigo y matematicas: no disponible; no es el proposito declarado del modelo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): vision segun las etiquetas; no se documenta ningun modo de razonamiento explicito ni capacidades de audio.

## Casos de uso

- Transcriptomica espacial virtual en archivos historicos: dado un corte teñido con H&E ya digitalizado, el modelo permitiria estimar un perfil de expresion genica sin realizar el ensayo de secuenciacion espacial, lo que abarata estudios retrospectivos sobre biobancos.
- Descubrimiento de biomarcadores: al generar perfiles de expresion virtuales sobre cohortes amplias de laminas, se pueden buscar asociaciones entre morfologia del tejido y genes de interes sin coste de reactivos por muestra.
- Priorizacion de muestras para secuenciacion: usar la prediccion del modelo como cribado previo para seleccionar que laminas merece la pena enviar a un ensayo Xenium o de secuenciacion espacial real.
- Control de calidad y armonizacion de cohortes: comparar la expresion predicha con la observada para detectar laminas anomalas, artefactos de tincion o desviaciones de lote entre centros.
- Preentrenamiento de codificadores de patologia: reutilizar el modelo como extractor de caracteristicas morfologicas en tareas posteriores de clasificacion de subtipos tumorales, grading o prediccion de supervivencia.
- Investigacion en biologia del microambiente tumoral: analizar la relacion entre morfologia del estroma y programas de expresion genica en regiones concretas del tejido.
- Aumento de datos para entrenamiento de otros modelos: generar pares imagen-perfil sinteticos o aumentados para robustecer pipelines de aprendizaje en patologia computacional.
- Docencia y prototipado: escenarios de laboratorio seco para explorar la relacion morfologia-transcriptoma sin acceso a plataformas de secuenciacion espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB en fp32 (tamano del repo), en torno a 1,6 GB en fp16 y unos 0,8 GB en int8, asumiendo que la conversion sea viable; son estimaciones aritmeticas a partir del numero de parametros, no medidas publicadas.
- GPU recomendadas: el modelo cabe con holgura en GPUs de consumo; una RTX 4090, RTX 3090, RTX 4080 o incluso una RTX 3060 de 12 GB deberian ser suficientes para inferencia en fp32 o fp16. Para procesar lotes grandes de laminas de resolucion completa (WSI) el cuello de botella sera la memoria para teselas y el almacenamiento, no los pesos.
- Cabe en GPU de consumo: si, segun el calculo anterior; no se dispone de mediciones reales de consumo en produccion.
- Opciones de despliegue: no documentadas en el repositorio. Al ser un modelo PyTorch en safetensors, el uso previsible es mediante `transformers` (si existe integracion), carga directa con PyTorch o exportacion a ONNX; no hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, que en principio no aplican a un modelo de imagen y regresion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, ni de resultados del propio modelo que permitan establecer una comparacion cuantitativa. La comparacion con alternativas del area de transcriptomica espacial virtual requeriria identificar publicaciones y pesos de referencia, datos que no se han podido obtener en la busqueda realizada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gaozijun/he2st-fullpanel-6k | 795,5 M | no aplica | no disponible | other | HuggingFace, gated |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de documentacion: no hay tarjeta de modelo detallada, ni descripcion de arquitectura, datos de entrenamiento o metodologia de evaluacion en la informacion disponible; esto impide validar el comportamiento del modelo antes de usarlo.
- Riesgo de sobreajuste a la plataforma: las etiquetas mencionan Xenium y single-cell, de modo que la prediccion podria degradarse en laminas teñidas con protocolos distintos, escaneres diferentes o tejidos no representados en el entrenamiento.
- Sesgo de dominio: cualquier modelo entrenado con un conjunto limitado de tejidos u hospitales puede fallar en poblaciones, tinciones o tipos histologicos poco frecuentes.
- Riesgo de predicciones plausibles pero incorrectas: en un modelo de regresion de expresion genica, la salida puede ser numericamente coherente y biologicamente falsa; no debe usarse con fines clinicos o diagnosticos sin validacion experimental.
- Licencia `other`: las condiciones de uso comercial, redistribucion y uso derivado no estan detalladas en la informacion disponible y deben revisarse en el repositorio antes de cualquier despliegue en produccion.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y la integracion automatizada en pipelines.
- Idiomas: no aplica, al no tratarse de un modelo linguistico; no debe esperarse soporte de texto.
- Ausencia de benchmarks: sin metricas publicadas no es posible afirmar calidad predictiva ni comparar con el estado del arte.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, actualizado el mismo dia de su creacion; no hay senales de mantenimiento ni de comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/gaozijun/he2st-fullpanel-6k
- La busqueda web realizada no ha devuelto enlaces relevantes al modelo (los resultados obtenidos corresponden a ChatGPT y no guardan relacion con esta ficha). No se dispone de papers, blogs, repositorios de codigo ni demos adicionales.
