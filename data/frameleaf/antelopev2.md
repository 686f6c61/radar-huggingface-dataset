# frameleaf/antelopev2

## Resumen

Antelopev2 es un paquete de modelos de deteccion y reconocimiento facial publicado originalmente por InsightFace y redistribuido en este repositorio de Hugging Face por el usuario frameleaf. No se trata de un modelo de lenguaje, sino de un conjunto de redes neuronales especializadas en localizar rostros en imagenes y extraer embeddings faciales para tareas de verificacion e identificacion. El repositorio empaqueta los pesos en formato ONNX y esta orientado explicitamente a su uso con Immich, una biblioteca de fotos autoalojada que emplea estos modelos para agrupar caras por persona.

El paquete incluye unicamente los modelos de deteccion y reconocimiento; segun la propia model card, no se incluyen los modelos de alineacion facial ni de otras tareas del ecosistema InsightFace. El tamano del repositorio es de 1,2 GB, coherente con varios ficheros ONNX de deteccion y reconocimiento empaquetados conjuntamente. La licencia es la de InsightFace, marcada como "other" con enlace a los terminos del proyecto original, lo que condiciona su uso comercial.

Su relevancia actual es practica: Immich es uno de los proyectos de autoalojamiento de fotos con mas traccion de la comunidad open source, y este repositorio ofrece una via directa para obtener los pesos que el sistema espera, sin depender de descargas desde servidores de terceros. No obstante, al ser una redistribucion con cero descargas y cero likes en el momento de la consulta, conviene tratar la procedencia con cautela y verificar los hashes frente a la fuente original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales convolucionales para deteccion y reconocimiento facial (familia InsightFace, pesos en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | InsightFace (marcada como "other", con enlace a los terminos del proyecto original) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de cada submodelo. Por la familia a la que pertenece (InsightFace antelopev2), se trata de redes convolucionales para deteccion de caras y de un modelo de reconocimiento que genera embeddings faciales normalizados, habitualmente entrenado con funciones de perdida basadas en margen angular sobre datasets de identidades a gran escala. La model card no especifica el numero de tokens, la composicion del dataset ni si hubo etapas de refinamiento posteriores.

El repositorio no documenta innovaciones tecnicas concretas ni variantes de decodificacion. La unica indicacion funcional es que se excluyen los modelos de alineacion facial y de otras tareas, de modo que el paquete cubre deteccion y reconocimiento pero no el pipeline completo de preprocesado que algunos flujos de InsightFace asumen.

## Capacidades

- Deteccion de rostros en imagenes, con localizacion de caras y puntos de referencia asociados al detector.
- Extraccion de embeddings faciales para comparacion por similitud coseno.
- Verificacion de identidad (misma persona o no) a partir de dos recortes faciales.
- Agrupacion o clustering de caras por persona, que es el uso principal en Immich.
- Procesamiento por lotes de bibliotecas fotograficas completas.
- Integracion en pipelines de vision por computador mediante runtime ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de modalidad de audio.

## Casos de uso

- Organizacion automatica de bibliotecas fotograficas en Immich: el paquete proporciona los modelos de deteccion y reconocimiento que Immich consume para detectar caras y agruparlas por persona, evitando depender de descargas externas.
- Etiquetado de archivos personales a gran escala: se recorre un directorio de imagenes, se detectan caras y se generan embeddings que permiten buscar todas las fotos de un individuo concreto.
- Verificacion de identidad en flujos internos: comparar el embedding de una selfie con el de una foto de referencia y aplicar un umbral de similitud para aceptar o rechazar.
- Deduplicacion de retratos en catalogos: agrupar recortes faciales repetidos en un archivo digital o en un DAM (digital asset management) para consolidar metadatos.
- Analitica de presencia en eventos: contar caras detectadas por imagen y estimar el numero de personas distintas mediante clustering de embeddings, sin identificar individuos.
- Prototipado de sistemas de control de acceso en entornos de laboratorio: usar los embeddings como entrada de un clasificador propio entrenado con las identidades del equipo.
- Preprocesado para otros modelos de vision: emplear los recortes y embeddings faciales como caracteristicas de entrada en pipelines de analisis de expresiones o de calidad de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (1,2 GB) y la naturaleza de los modelos de reconocimiento facial, la inferencia cabe holgadamente en GPUs de consumo, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA y runtime ONNX (por ejemplo, gama RTX o superior) es suficiente en la practica para lotes pequenos.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; tambien es viable en CPU para volumenes moderados.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), integracion nativa con Immich, y cualquier framework que cargue modelos ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Uso previsto |
|---|---|---|---|---|
| Antelopev2 (este repositorio) | Deteccion y reconocimiento facial | ONNX | InsightFace ("other") | Immich y pipelines propios |
| InsightFace buffalo_l | Deteccion y reconocimiento facial | ONNX | InsightFace ("other") | Uso general con InsightFace |
| FaceNet / MTCNN | Deteccion y reconocimiento facial | TensorFlow / varios | MIT o similar segun implementacion | Investigacion y produccion |
| Dlib face recognition | Deteccion y reconocimiento facial | Varios | Boost | Integracion en aplicaciones C++/Python |

La comparativa se limita a la categoria funcional, ya que no se dispone de datos de rendimiento de antelopev2 en la informacion proporcionada. La diferencia practica frente a buffalo_l es el empaquetado especifico para Immich y la ausencia de modelos de alineacion en este repositorio.

## Limitaciones y advertencias

- Es un modelo de vision, no de lenguaje: no genera texto ni admite prompts.
- No incluye modelos de alineacion facial, por lo que ciertos flujos de InsightFace que los requieren no funcionaran solo con este repositorio.
- La licencia InsightFace esta marcada como "other"; es imprescindible revisar los terminos del proyecto original antes de cualquier uso comercial.
- El reconocimiento facial biometrico esta sujeto a normativa estricta (RGPD en la UE, entre otras); su uso sobre personas identificables requiere base legal y evaluacion de impacto.
- Riesgo de sesgo: los modelos de reconocimiento facial muestran historicamente tasas de error desiguales segun demografia; no se documentan evaluaciones de equidad en este repositorio.
- Riesgo de falsos positivos y negativos en la agrupacion, especialmente con caras ocluidas, angulos extremos, baja iluminacion o resolucion reducida.
- Repositorio redistribuido por un tercero con cero descargas y cero likes: conviene verificar la integridad de los ficheros frente a la fuente oficial de InsightFace.
- No se documentan versiones, hashes ni procedencia exacta de los pesos en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/frameleaf/antelopev2
- Proyecto InsightFace en GitHub: https://github.com/deepinsight/insightface/tree/master
- Licencia de InsightFace: https://github.com/deepinsight/insightface/tree/master/python-package#license
- Immich: https://immich.app/
