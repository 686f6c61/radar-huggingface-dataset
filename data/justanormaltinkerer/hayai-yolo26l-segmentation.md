# JustANormalTinkerer/hayai-yolo26l-segmentation

## Resumen

Hayai YOLO26l-segmentation es un modelo de segmentación de instancias especializado en el análisis de maquetación de páginas de manga japonés en blanco y negro. Lo desarrolla el usuario JustANormalTinkerer y está construido sobre la arquitectura YOLO26l-seg, con 204 capas y 27.906.840 parámetros. Su función es detectar y segmentar a nivel de píxel cuatro clases de elementos de maquetación: texto de diálogo o rótulos, onomatopeyas, bocadillos y viñetas.

El modelo resuelve un problema concreto en el procesamiento automatizado de cómics japoneses: separar estructura y contenido para tareas posteriores como traducción automática, limpieza de páginas, OCR o catalogación. Se ha entrenado y evaluado sobre el subconjunto de imágenes Manga109-s (87 títulos, 8.124 imágenes, 349.180 anotaciones) combinado con las anotaciones de Manga109-segmentation v3.0.0.

Es relevante por su especialización: frente a detectores genéricos, ofrece máscaras de segmentación ajustadas a las particularidades del manga (trazos, tramas, bocadillos irregulares) y un rendimiento medido en validación con mAP50 de caja de 0,937 y mAP50 de máscara de 0,915. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato ONNX. La licencia declarada es AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26l-seg (204 capas) |
| Parametros totales | 27.906.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: manga japonés en blanco y negro) |
| Licencia | AGPL-3.0 (declarada como "other" con license_name agl3.0) |
| Formato de pesos | ONNX |
| Tarea | Detección de objetos y segmentación de instancias |
| Cómputo | 139,8 GFLOPs |
| Clases | text, onomatopoeia, bubble, panel |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26l-seg, una variante de la familia YOLO orientada a segmentación de instancias que predice simultáneamente cajas delimitadoras y máscaras a nivel de píxel. La variante "l" (large) cuenta con 204 capas, 27.906.840 parámetros y 139,8 GFLOPs por inferencia. No se dispone de información detallada sobre la composición exacta del backbone, la cabeza de segmentación ni innovaciones específicas de atención o decodificación en la documentación proporcionada.

El entrenamiento se realizó sobre el subconjunto de imágenes Manga109-s, con 6.696 imágenes de entrenamiento, 722 de validación y 706 de prueba, usando las anotaciones de Manga109-segmentation v3.0.0. No se especifican en la información disponible el número de épocas, la función de pérdida, el régimen de aumento de datos ni si hubo ajuste fino adicional. Tampoco se documentan detalles sobre el preentrenamiento base de YOLO26l-seg utilizado como punto de partida.

## Capacidades

- Detección de objetos con cajas delimitadoras para cuatro clases de maquetación de manga: texto, onomatopeya, bocadillo y viñeta.
- Segmentación de instancias con máscaras a nivel de píxel para cada clase detectada.
- Distinción entre texto de diálogo o rótulos y efectos de sonido estilizados.
- Localización de bocadillos de diálogo y límites de viñetas, útil para reconstruir el orden de lectura.
- Inferencia rápida: aproximadamente 6,4 ms por imagen en una RTX 2000 Ada (0,1 ms de preprocesado, 5,8 ms de inferencia y 0,5 ms de posprocesado).
- Ejecución mediante pesos ONNX, lo que facilita el despliegue en distintos runtimes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento, al tratarse de un modelo puramente visual de segmentación.

## Casos de uso

- Traducción automática de manga: el modelo aísla bocadillos y texto de diálogo, lo que permite recortar regiones, aplicar OCR y sustituir el texto traducido sin alterar viñetas ni onomatopeyas. La segmentación de máscaras ayuda a rellenar y reescribir respetando la forma del bocadillo.
- Limpieza y redibujado de páginas (scanlation): las máscaras de texto y onomatopeyas permiten eliminar el texto original y reconstruir el fondo con técnicas de inpainting, manteniendo intactas las viñetas y los trazos del dibujo.
- Catalogación y análisis de archivos de manga: la detección de viñetas y bocadillos facilita indexar páginas por estructura, contar elementos por página o extraer metadatos de maquetación para bibliotecas digitales.
- Reordenación y lectura asistida: a partir de las cajas de viñetas y bocadillos se puede inferir el orden de lectura de la página y generar versiones accesibles o adaptadas a lectores con necesidades específicas.
- Extracción de texto para búsqueda: combinado con un motor OCR, el modelo localiza las regiones de texto y onomatopeyas para construir índices de búsqueda sobre el contenido de un volumen.
- Preprocesado para modelos de visión-lenguaje: las máscaras y cajas sirven como entrada estructurada para sistemas de comprensión de cómics, separando regiones de diálogo de las ilustraciones.
- Control de calidad en pipelines editoriales: la detección automática de bocadillos y viñetas permite verificar maquetaciones, detectar páginas con elementos fuera de lugar o automatizar revisiones por lotes.

## Benchmarks y rendimiento

Resultados de evaluación en el split de validación (722 imágenes, 32.927 instancias), según la model card:

| Clase | Imágenes | Instancias | Box P | Box R | Box mAP50 | Box mAP50-95 | Mask P | Mask R | Mask mAP50 | Mask mAP50-95 |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 722 | 32.927 | 0,926 | 0,913 | 0,937 | 0,846 | 0,918 | 0,895 | 0,915 | 0,623 |
| text | 711 | 10.797 | 0,962 | 0,961 | 0,983 | 0,914 | 0,946 | 0,939 | 0,956 | 0,449 |
| onomatopoeia | 655 | 4.724 | 0,788 | 0,722 | 0,791 | 0,565 | 0,772 | 0,679 | 0,730 | 0,368 |
| bubble | 702 | 9.404 | 0,975 | 0,983 | 0,987 | 0,945 | 0,975 | 0,982 | 0,986 | 0,783 |
| panel | 720 | 8.002 | 0,978 | 0,984 | 0,988 | 0,962 | 0,977 | 0,981 | 0,987 | 0,891 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 27,9 millones de parámetros y pesos ONNX de un repositorio de 0,1 GB, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 2000 Ada es la referencia medida por el autor (6,4 ms por imagen). Por tamaño, debería funcionar en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque no se han publicado cifras para estas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con varios GB de VRAM; no se especifica el mínimo exacto.
- Opciones de despliegue: al distribuirse en ONNX, puede ejecutarse con ONNX Runtime, TensorRT (previa conversión) u otros runtimes compatibles con ONNX. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 6,4 ms por imagen en RTX 2000 Ada (0,1 ms preprocesado, 5,8 ms inferencia, 0,5 ms posprocesado). No se dispone de throughput agregado por lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Cualitativamente, podría compararse con detectores de maquetación de manga genéricos o con variantes YOLO-seg de otros tamaños, pero no se aportan cifras para establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | mAP50 (caja) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hayai YOLO26l-segmentation | 27,9 M | no aplica | 0,937 | AGPL-3.0 | Hugging Face (ONNX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especificidad de dominio: entrenado exclusivamente con manga japonés en blanco y negro; el rendimiento puede degradarse en webtoons a color, cómics occidentales o guiones no japoneses.
- Ambigüedad en efectos de sonido: exclamaciones cortas dentro de bocadillos o símbolos decorativos pueden clasificarse erróneamente como onomatopeya; las onomatopeyas dibujadas a mano complejas presentan menor precisión de máscara (mask mAP50-95 de 0,368) que elementos estructurados como bocadillos (0,783) y viñetas (0,891).
- Rendimiento desigual por clase: la clase onomatopeya es la más débil en todas las métricas (box mAP50 de 0,791, mask mAP50 de 0,730), lo que exige revisión humana en pipelines que dependan de ella.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso comercial o la integración en servicios en red requieren revisar el cumplimiento y la distribución del código fuente derivado.
- Sin datos de sesgo, alucinación o multilingüismo: al ser un modelo visual, no aplican riesgos de generación de texto, pero no se documentan análisis de sesgo en la selección de títulos de Manga109-s.
- Ausencia de información sobre cuantización y requisitos mínimos de hardware: conviene validar el rendimiento en el hardware objetivo antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/JustANormalTinkerer/hayai-yolo26l-segmentation
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
- Dataset Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- Dataset Manga109-segmentation: https://huggingface.co/datasets/mayocream/manga109-segmentation
