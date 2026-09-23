# Mrdhnto/Manga-Bubble-YOLO

## Resumen

Manga-Bubble-YOLO es un detector de objetos de tipo one-stage especializado en la localizacion de globos de dialogo y regiones de texto en paginas de manga. Lo desarrolla Mrdhnto (Riski Mardhianto) y se publica bajo licencia Apache 2.0. El modelo parte de la arquitectura YOLO26 de Ultralytics y emplea una cabeza de prediccion end-to-end (head-to-head) que elimina la necesidad de aplicar Non-Maximum Suppression durante la inferencia, lo que simplifica el postprocesado y reduce la latencia.

Se distribuye en dos variantes de distinto tamano: YOLO26n, con 2,4 millones de parametros, y YOLO26s, con 9,5 millones. Ambas se entrenaron durante 100 epocas sobre un corpus compuesto de 5.595 imagenes a una resolucion de entrada de 1280x1280 pixeles. La relevancia practica del modelo esta en servir como etapa de deteccion previa a un pipeline OCR de manga, un dominio donde la densidad de texto, los globos irregulares y la mezcla de idiomas complican los detectores genericos.

El repositorio ocupa aproximadamente 0,1 GB e incluye pesos en formato PyTorch y ONNX. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional, sino que devuelve cajas delimitadoras con clase y confianza sobre imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector one-stage con cabeza end-to-end sin NMS |
| Parametros totales | 2,4 M (YOLO26n) y 9,5 M (YOLO26s) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1280x1280 px) |
| Tipos de cuantizacion | el tag del repositorio indica una variante cuantizada de Ultralytics/YOLO26; el detalle de precisiones (INT8, FP16) no esta disponible |
| Idiomas soportados | no aplica a idioma de modelo; datos de entrenamiento en japones, ingles y vietnamita |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

La arquitectura es YOLO26, un detector de una sola etapa en el que la cabeza de prediccion funciona de extremo a extremo. Segun la model card, esta cabeza head-to-head evita el paso de Non-Maximum Suppression, de modo que la salida es directamente un conjunto fijo de detecciones. La entrada se estandariza a 1280x1280 pixeles, una resolucion alta que el autor justifica por la presencia de globos de texto pequenos. La salida ONNX tiene forma (1, 300, 6), es decir, hasta 300 detecciones por imagen con seis valores por caja.

El entrenamiento se realizo durante 100 epocas con early stopping (paciencia de 10), batch de 8, learning rate inicial de 1e-4 y dispositivo CUDA, sobre una Nvidia Tesla T4. El conjunto de datos suma 5.595 imagenes divididas en 80 % entrenamiento (4.416), 10 % validacion (579) y 10 % test (600). Procede de tres fuentes: aproximadamente 3.000 imagenes de Manga109-s (escaneos oficiales de alta calidad), unas 2.000 de Mangadex-EN (traducciones de aficionados al ingles) y unas 1.000 de Mangadex-VI (traducciones al vietnamita). Parte de las imagenes de Mangadex se descarto por errores de descarga o limites de la API. La anotacion de la porcion de Mangadex se automatizo con la herramienta Magi. No se documenta uso de RLHF ni DPO, algo esperable en un detector de objetos. El dataset no se publica por motivos de derechos de autor.

## Capacidades

- Deteccion de globos de dialogo y regiones de texto en paginas de manga, con una unica clase de salida ("Text").
- Inferencia sin Non-Maximum Suppression gracias a la cabeza end-to-end de YOLO26.
- Ejecucion en dos regimenes de precision: el backend de Ultralytics sobre PyTorch y el runtime de ONNX para despliegue sin dependencia de PyTorch.
- Procesamiento de manga en japones, ingles y vietnamita, segun la composicion del conjunto de entrenamiento.
- Entrada a 1280x1280 px, pensada para textos pequenos y densos.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es un modelo puramente perceptivo.
- No realiza reconocimiento optico de caracteres (OCR) por si mismo; solo localiza las regiones donde despues se aplicaria un motor OCR.
- No soporta vision generalista ni descripcion de imagenes: su salida se limita a cajas delimitadoras con confianza.

## Casos de uso

- Digitalizacion y traduccion de manga: el detector localiza los globos de dialogo y entrega recortes a un motor OCR y a un sistema de traduccion, automatizando el flujo de escaneo a texto.
- Reconocimiento optico de caracteres sobre manga: al aislar las regiones de texto, reduce el ruido de fondo y mejora la precision del OCR respecto a aplicar el reconocedor sobre la pagina completa.
- Rotulacion automatica de corpus: sirve como primer paso para etiquetar paginas nuevas de forma semiautomatica, generando cajas que despues se revisan a mano.
- Preprocesado de pipelines de lectura asistida: alimenta visores o lectores que resaltan los globos y permiten navegar por ellos, util en aplicaciones de accesibilidad.
- Indexacion y busqueda de contenido: las cajas detectadas permiten segmentar paginas por viñeta y asociar transcripciones a regiones concretas para busquedas posteriores.
- Moderacion y clasificacion de paginas escaneadas: la densidad y distribucion de globos puede usarse como senal auxiliar para distinguir tipos de pagina o detectar escaneos defectuosos.
- Integracion en servicios de bajo coste: con 2,4 M de parametros en la variante nano y tiempos de unos 11 ms por imagen en una Tesla T4, es viable procesar volumenes grandes en hardware modesto o incluso en CPU.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test (600 imagenes):

| Modelo | Clase | Precision | Recall | mAP@50 | mAP@50-95 | Parametros |
|---|---|---|---|---|---|---|
| YOLO26n | Text | 0,929 | 0,863 | 0,947 | 0,765 | 2,4 M |
| YOLO26s | Text | 0,937 | 0,893 | 0,961 | 0,802 | 9,5 M |

Velocidad de inferencia medida en una Nvidia Tesla T4: aproximadamente 11,0 ms por imagen para la variante nano y 27,5 ms por imagen para la variante small. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no especificada por el autor. Por el tamano del modelo (2,4 M y 9,5 M de parametros) y la resolucion de entrada de 1280x1280 px, el consumo de memoria es muy reducido y en la practica esta dominado por las activaciones de la imagen de entrada, no por los pesos.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en GPUs de centro de datos (Tesla T4, A100, H100). El autor aporta medidas precisamente sobre una Tesla T4.
- Es viable la inferencia en CPU mediante ONNX Runtime, dado el reducido numero de parametros, aunque con mayor latencia que en GPU.
- Opciones de despliegue: Ultralytics sobre PyTorch, ONNX Runtime, exportacion a TensorRT o a otros backends compatibles con el ecosistema Ultralytics. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia conocida: 11,0 ms por imagen (nano) y 27,5 ms por imagen (small) en Tesla T4. El throughput no esta publicado, pero puede derivarse de esos tiempos.
- Configuracion de inferencia recomendada por el autor: imgsz=1280 y conf=0,25.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Clase | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Manga-Bubble-YOLO (YOLO26n) | YOLO26 | 2,4 M | Text | apache-2.0 | HuggingFace (repo Mrdhnto) |
| Manga-Bubble-YOLO (YOLO26s) | YOLO26 | 9,5 M | Text | apache-2.0 | HuggingFace (repo Mrdhnto) |
| ebhon/YOLO-manga-bubble-detector | YOLOv8 | no disponible | globos, cajas de narracion, elementos de UI y texto | no disponible | GitHub |
| Manga Bubble v3 (MAANA, Roboflow) | no disponible | no disponible | globos de manga | no disponible | Roboflow Universe (2.399 imagenes anotadas) |

Las cifras de mAP del modelo de la ficha corresponden a la clase unica "Text", mientras que el proyecto de ebhon distingue varias clases (globos, narracion, UI, texto), por lo que la comparacion directa de metricas no es posible con los datos disponibles. Existe ademas una copia o espejo del repositorio bajo el identificador Kiuyha/Manga-Bubble-YOLO, del que la model card enlaza imagenes de ejemplo.

## Limitaciones y advertencias

- Entrenado sobre una unica clase ("Text"); no separa globos de dialogo, cajas de narracion ni rotulos, lo que limita su uso en tareas que requieran esa distincion.
- El autor advierte que parte de las imagenes de Mangadex se descarto por errores de descarga y limites de la API, por lo que el corpus final es menor que el inicialmente previsto y puede tener sesgos hacia determinados generos o estilos graficos.
- La mezcla de escaneos oficiales y traducciones de aficionados introduce variabilidad en calidad de imagen, tipografia y limpieza de las paginas.
- El dataset no se publica por derechos de autor, lo que dificulta reproducir el entrenamiento o auditar la composicion real de los datos.
- Riesgo de falsos negativos en globos con texto muy pequeno, tipografias poco frecuentes o layouts experimentales no representados en el corpus.
- Como todo detector de objetos, puede devolver cajas fragmentadas o fusionadas cuando varios globos estan muy proximos.
- La licencia Apache 2.0 permite uso comercial, pero persisten dudas sobre los derechos de las obras de manga usadas para entrenar; el propio autor cita preocupaciones de copyright al no liberar el dataset.
- El repositorio registra 0 descargas y 0 "likes", y la fecha de actualizacion indicada no ha sido validada por fuentes independientes, por lo que la madurez y el mantenimiento del proyecto no estan contrastados.
- No se documentan sesgos demograficos ni linguisticos mas alla de la procedencia del corpus (japones, ingles, vietnamita). El rendimiento en otros idiomas o en manga de otros mercados no esta medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mrdhnto/Manga-Bubble-YOLO
- Perfil del autor: https://huggingface.co/Mrdhnto
- Copia o espejo del repositorio: https://huggingface.co/Kiuyha/Manga-Bubble-YOLO
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Dataset Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- Paper de Manga109 (IEEE MultiMedia, 2020): https://doi.org/10.1109/mmul.2020.2987895
- Paper de Magi (arXiv:2408.00298): https://arxiv.org/abs/2408.00298
- Proyecto similar con YOLOv8: https://github.com/ebhon/YOLO-manga-bubble-detector
- Dataset Manga Bubble v3 en Roboflow: https://universe.roboflow.com/maana/manga-bubble-pqdou/dataset/3
- Documentacion de Ultralytics: https://docs.ultralytics.com/
