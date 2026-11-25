# sentientsai/yolo26s

## Resumen

yolo26s es un modelo de deteccion de objetos derivado de Ultralytics YOLO26, publicado por Sentients AI como componente del plugin Vision Core para Unreal Engine. Detecta 80 clases de objetos (personas, vehiculos, animales, objetos cotidianos) devolviendo para cada instancia una caja delimitadora, una etiqueta y una puntuacion de confianza. El modelo se distribuye exclusivamente en formato ONNX, con una version fp32 de 36,5 MiB y una version fp16 de 18,3 MiB optimizada para TensorRT.

El modelo no es un entrenamiento original de Sentients: los pesos proceden del checkpoint `yolo26s.pt` de Ultralytics (revision `070ac3c51435`), y Sentients aplica un proceso de exportacion con formas fijas, media precision y un grafo reescrito para su ejecucion en distintos runtimes (CPU, DirectML, TensorRT, HLSL). La integracion en Unreal Engine se realiza mediante la enumeracion `EVisionModel::ObjectDetectionYolo26s`, que consume `CoreImageInput` y produce `CoreDetectionOutput`.

Su relevancia practica radica en la verificacion criptografica: los ficheros estan fijados por SHA-256 en el catalogo firmado `sentientsai/sentients-catalog`, de modo que el plugin descarga exclusivamente bytes que coinciden con el hash publicado. Es un modelo pequeno, orientado a inferencia en tiempo real dentro de motores de videojuegos y aplicaciones de vision embebida, no a investigacion de vanguardia en deteccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (familia Ultralytics YOLO, red neuronal convolucional de deteccion en una etapa); variante "s" (small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | fp32 y fp16 (dos ficheros ONNX publicados) |
| Idiomas soportados | no disponible (las etiquetas de clase son las 80 clases estandar de deteccion, presumiblemente en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`yolo26s.onnx` fp32, 36,5 MiB; `yolo26s.fp16.onnx` fp16, 18,3 MiB) |

## Arquitectura y entrenamiento

El modelo es una red de deteccion de objetos en una sola etapa de la familia YOLO26 de Ultralytics, en su variante de tamano "s" (small). La informacion disponible no detalla la composicion interna de la arquitectura (backbone, neck, cabezas de deteccion) ni el esquema de asignacion de etiquetas o la funcion de perdida empleada. Tampoco se especifican el numero de parametros, la resolucion de entrada nativa ni el conjunto de datos de entrenamiento (se asume COCO por las 80 clases declaradas, pero no se confirma en la documentacion).

El trabajo propio de Sentients consiste en la exportacion: genera un grafo ONNX con formas fijas para runtimes que las requieren, produce una variante en media precision (fp16) para TensorRT y reescribe el grafo para que pueda ejecutarse en los runtimes objetivo (CPU, DirectML, TensorRT, HLSL). Los ficheros resultantes se publican con hash SHA-256 fijo y se referencian desde el catalogo firmado, garantizando inmutabilidad de los binarios. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni destilacion.

## Capacidades

- Deteccion de objetos en imagenes con 80 clases (personas, coches, animales, tazas, telefonos, libros, entre otras).
- Salida por instancia compuesta de caja delimitadora, etiqueta de clase y puntuacion de confianza.
- Inferencia rapida en GPU ("fast on any graphics card" segun el autor) y aproximadamente 60 ms por imagen en CPU.
- Ejecucion en multiples runtimes: CPU, DirectML, TensorRT y HLSL.
- Integracion nativa en Unreal Engine mediante el plugin Vision Core (entrada `CoreImageInput`, salida `CoreDetectionOutput`).
- Verificacion de integridad por SHA-256 contra el catalogo firmado de Sentients.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision multimodal, audio ni modo de razonamiento extendido; es un detector de objetos puro.

## Casos de uso

- Vision por computador en videojuegos con Unreal Engine: el modelo se invoca desde el plugin Vision Core como `EVisionModel::ObjectDetectionYolo26s` para detectar objetos en fotogramas capturados, habilitando mecanicas que reaccionan a lo que aparece en pantalla.
- Analisis de escenas en tiempo real en aplicaciones de escritorio: la variante fp32 ONNX se ejecuta sobre DirectML o CPU, permitiendo procesar flujos de video con latencias de decenas de milisegundos sin GPU dedicada.
- Despliegue en produccion con TensorRT: la variante fp16 de 18,3 MiB esta pensada para TensorRT, lo que reduce el uso de memoria y aprovecha la aceleracion en GPUs NVIDIA para pipelines de video en directo.
- Automatizacion de etiquetado y pre-anotacion de datasets: el detector genera cajas y etiquetas iniciales que un revisor humano corrige, acelerando la construccion de conjuntos de datos propios.
- Moderacion y filtrado de contenido visual: la deteccion de personas y objetos concretos permite activar reglas simples sobre imagenes subidas por usuarios (por ejemplo, presencia de personas en capturas).
- Sistemas de conteo y monitorizacion: conteo de vehiculos, personas u objetos en camaras fijas, con la salida de detecciones por fotograma procesada por logica de negocio externa.
- Prototipado rapido en entornos sin soporte de PyTorch: al ser ONNX puro, se integra en aplicaciones C++, C# o Python mediante ONNX Runtime sin dependencias del ecosistema de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es una latencia aproximada de 60 ms por imagen en CPU; no se especifican mAP, precision por clase ni throughput en GPU.

## Requisitos de hardware

- VRAM estimada: muy reducida; el fichero fp32 ocupa 36,5 MiB y el fp16 18,3 MiB, por lo que la memoria de pesos es inferior a 50 MiB en ambos casos. La VRAM total dependera de la resolucion de entrada y del runtime, no disponible en la documentacion.
- GPU recomendadas: cualquier GPU compatible con TensorRT para la variante fp16; GPUs con soporte DirectML (familia AMD/Intel/NVIDIA en Windows) para la variante fp32. El autor afirma que es "rapido en cualquier tarjeta grafica".
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 4090, RTX 3060, e incluso iGPUs con DirectML), dado el tamano del modelo.
- Opciones de despliegue: ONNX Runtime (CPU y DirectML), TensorRT (variante fp16), HLSL y el plugin Vision Core de Unreal Engine. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision.
- Latencia y throughput: aproximadamente 60 ms por imagen en CPU segun el autor; sin datos de latencia en GPU ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / resolucion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| yolo26s (este modelo) | no disponible | imagen | no disponible | AGPL-3.0 | ONNX fp32/fp16 | Hugging Face (sentientsai/yolo26s) |
| YOLO26 (Ultralytics, checkpoint original) | no disponible | imagen | no disponible | AGPL-3.0 (presumible, segun Ultralytics) | PyTorch (.pt) | Hugging Face (Ultralytics/YOLO26) |
| Alternativas de deteccion de la misma categoria | no disponible | imagen | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el checkpoint original de Ultralytics del que deriva; no se dispone de datos de otros detectores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al tratarse de un detector entrenado sobre un conjunto estandar de 80 clases, hereda los sesgos de representacion de dicho conjunto (no confirmado en la documentacion).
- Alucinacion: en deteccion de objetos el riesgo se manifiesta como falsos positivos y cajas mal localizadas; no se aportan metricas de precision o recall para cuantificarlo.
- Contexto e idioma: no aplica ventana de contexto; las etiquetas de clase estan en el idioma del conjunto de entrenamiento original (presumiblemente ingles) y no se documenta soporte multilingue.
- Licencia: AGPL-3.0 impone obligaciones copyleft fuertes; el uso comercial en productos distribuidos o en servicios de red requiere evaluar el cumplimiento de la AGPL, y la licencia del checkpoint original de Ultralytics debe verificarse por separado.
- Inmutabilidad: los ficheros se publican con hash fijo y no se actualizan; cualquier correccion se publica bajo un nombre nuevo, lo que exige gestionar versiones en el catalogo.
- Dependencia del ecosistema Sentients: la integracion documentada esta orientada al plugin Vision Core y al catalogo firmado; fuera de ese entorno, el uso requiere cargar el ONNX directamente con un runtime compatible.
- Sin datos de parametros, entrenamiento ni benchmarks: dificulta la comparacion objetiva con otros detectores y la estimacion de calidad en dominios especificos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sentientsai/yolo26s
- Catalogo firmado de Sentients: https://huggingface.co/sentientsai/sentients-catalog
- Checkpoint original de Ultralytics: https://huggingface.co/Ultralytics/YOLO26
