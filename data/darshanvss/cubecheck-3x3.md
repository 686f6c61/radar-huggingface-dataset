# darshanvss/cubecheck-3x3

## Resumen

CubeCheck 3×3 es un conjunto de tres redes neuronales pequenas desarrolladas por darshanvss que verifican el estado de un cubo de Rubik 3×3 desordenado a partir de una unica vista de camara. El sistema detecta si hay un cubo en la imagen, localiza sus siete esquinas visibles y lee los 27 adhesivos (stickers) para determinar los colores de las caras, con el objetivo de que un scrambler pueda comprobar que la secuencia de mezcla aplicada es correcta. Las redes alimentan la web check.cubing.in, donde se ejecutan directamente en el navegador mediante ONNX Runtime.

El modelo no es un LLM ni un transformer generativo: es un pipeline de vision por computador compuesto por dos U-Net pequenas (finder y refiner, 2,5 M de parametros cada una) para la deteccion de esquinas y una CNN con dos capas transformer (0,7 M de parametros) para la clasificacion de stickers. El repositorio ocupa 0,0 GB y los pesos se distribuyen en formato PyTorch (.pt) y ONNX.

Su relevancia radica en la especializacion: resuelve una tarea concreta de vision con modelos de menos de 6 M de parametros en total, entrenados exclusivamente con datos sinteticos (32.800 renders 3D) y con resultados reportados de 99,0 % de stickers leidos correctamente y 99,2 % de scrambles identificados correctamente en el conjunto de prueba sintetico. La licencia AGPL-3.0 impone obligaciones de compartir codigo en servicios en red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Finder y refiner: U-Net pequena. Reader: CNN pequena + 2 capas transformer |
| Parametros totales | 5,7 M (2,5 M finder + 2,5 M refiner + 0,7 M reader) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada finder/refiner 256×256 px, reader 3 caras de 72×72 px) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos PyTorch y exportaciones ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, weights_only=True) y ONNX (.onnx con meta.json) |

## Arquitectura y entrenamiento

El pipeline se divide en tres etapas. El finder procesa el fotograma completo a 256×256 y predice la presencia de un cubo y la posicion aproximada de sus siete esquinas visibles. El refiner toma un recorte a 256×256 y localiza esas siete esquinas con precision subpixel. El reader recibe tres caras enderezadas de 72×72 px y clasifica cada uno de los 27 stickers en una de seis clases de color o en la clase "cubierto"; combina una CNN pequena con dos capas transformer. Los tres modelos son de proposito especifico y no comparten un tronco comun.

El entrenamiento es exclusivamente sintetico: 32.800 renders 3D a 1280×720 de un cubo 3×3 en habitaciones aleatorizadas, sostenido en mano o sobre mesas, con etiquetas exactas de las siete esquinas y de cada sticker. La composicion es de 20.000 cubos desordenados, 6.000 casi resueltos, 5.000 sin cubo y 1.800 reservados para prueba. Los fondos son fotografias CC0 de Poly Haven y los efectos de camara se anaden en tiempo de entrenamiento. El finder se entreno 60 epocas y el refiner 100 epocas en una NVIDIA A40 (48 s por epoca, aproximadamente 2,2 horas en total), partiendo de los pesos de la version anterior; el reader requirio unos 75 minutos en un portatil Apple M-series. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Deteccion de presencia de cubo en un fotograma completo y localizacion aproximada de las siete esquinas visibles.
- Refinamiento subpixel de las esquinas del cubo a partir de un recorte.
- Clasificacion de los 27 stickers de tres caras enderezadas en seis colores o en la clase "cubierto".
- Verificacion de scrambles: identifica si la secuencia de mezcla aplicada coincide con la esperada y detecta movimientos deslizados.
- Ejecucion en navegador mediante ONNX Runtime, sin backend de servidor.
- Exportacion a ONNX para despliegue en cualquier entorno compatible con ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni vision general: es un modelo de vision especializado en cubos 3×3.

## Casos de uso

- Verificacion de scrambles en competiciones no oficiales: el sistema procesa una unica vista de camara y confirma si el cubo coincide con el scramble esperado, con una tasa reportada de 99,2 % de acierto y sin falsos positivos en el conjunto sintetico.
- Asistencia a scramblers: la web check.cubing.in permite al scrambler capturar el cubo y recibir una confirmacion o una peticion de "re-check", reduciendo errores humanos en la aplicacion de la secuencia.
- Deteccion de movimientos deslizados: el modelo identifica scrambles con un movimiento mal aplicado (99,1 % en pruebas), util para auditar la ejecucion de la secuencia.
- Aplicaciones web sin backend: al exportarse a ONNX y ejecutarse en el navegador, el pipeline puede integrarse en herramientas de cubing sin infraestructura de servidor ni costes de inferencia en la nube.
- Investigacion en vision sintetica: el modelo sirve como referencia para entrenar detectores de keypoints con datos puramente renderizados y etiquetas exactas, con curvas de entrenamiento publicadas en los ficheros `*_log.json`.
- Reentrenamiento y extension a otros puzzles: el codigo y la documentacion de entrenamiento permiten adaptar el pipeline a 4×4 y superiores, aunque el dataset aun no esta publicado.
- Clasificacion de estados de cubo en herramientas de analisis: el reader puede reutilizarse para extraer la configuracion de colores de tres caras en aplicaciones de reconocimiento de estado.

## Benchmarks y rendimiento

Resultados sobre 1.000 renders sinteticos reservados con efectos de camara aleatorios severos, fotogramas individuales:

| Metrica | Resultado |
|---|---|
| Cubo encontrado | 994 / 1.000 |
| Fotogramas sin cubo clasificados erroneamente como "cubo" | 0 / 300 |
| Error de esquinas del refiner | mediana 0,78 px; percentil 95 de 3,6 px |
| Stickers leidos correctamente | 99,0 % |
| Scramble verdadero identificado correctamente | 99,2 % (sin falsos positivos; el resto indica "re-check") |
| Movimiento deslizado detectado | 99,1 % |

No se han publicado resultados en fotografias reales. No se han publicado resultados de benchmarks en la informacion disponible para tareas estandar (MMLU, HumanEval, GSM8K), ya que el modelo no es un LLM.

## Requisitos de hardware

- Inferencia muy ligera: los tres modelos suman 5,7 M de parametros y los ficheros ONNX ocupan 22,7 MB en total, por lo que caben en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una NVIDIA A40 y el reader se entreno en un Apple M-series. Para inferencia no se requiere GPU dedicada.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en navegador con WebGPU/WebAssembly via ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (navegador y servidor), PyTorch para Python y reentrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo se ejecuta en el navegador en la web check.cubing.in, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de deteccion de keypoints y clasificacion de stickers especificos para cubos de Rubik 3×3 con los que establecer una comparativa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Herramienta de apoyo para que un scrambler compruebe un scramble; no es una herramienta oficial de la WCA ni sustituye la verificacion del propio scrambler.
- Solo cubre cubos 3×3 con el esquema de colores estandar de la WCA; los cubos sin stickers y los esquemas de color no habituales no han sido probados.
- Entrenado exclusivamente con renders sinteticos: la precision en webcams reales, con luz fuertemente coloreada o desenfoque de movimiento intenso, puede ser inferior. No hay resultados publicados en fotografias reales.
- Requiere que una esquina del cubo apunte a la camara para que se vean tres caras; otras orientaciones no estan soportadas.
- El dataset de entrenamiento no esta publicado, lo que limita la reproducibilidad y el reentrenamiento sin datos propios en el mismo formato.
- Licencia AGPL-3.0: si se usan los pesos en un servicio accesible por red, es obligatorio compartir el codigo fuente con los usuarios.
- Riesgo de clasificacion erronea de stickers bajo condiciones de iluminacion o blur no representadas en el entrenamiento sintetico; el sistema mitiga parte del riesgo indicando "re-check" en lugar de forzar una respuesta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darshanvss/cubecheck-3x3
- Codigo, entrenamiento y evaluacion: https://github.com/darshanvss/cubecheck
- Demo en navegador: https://check.cubing.in
- Documentacion de entrenamiento: https://github.com/darshanvss/cubecheck/blob/main/docs/training.md
- Documentacion del dataset: https://github.com/darshanvss/cubecheck/blob/main/docs/dataset.md
- Fondos CC0 utilizados: https://polyhaven.com
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
