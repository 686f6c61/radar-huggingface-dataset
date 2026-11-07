# mrx-31415/auto-seek

## Resumen

Auto Seek es un modelo de clasificacion de imagenes derivado de CLIP ViT-B/32, publicado por el usuario mrx-31415 en Hugging Face. No es un modelo de lenguaje ni un sistema multimodal generativo: se trata de un clasificador binario-multietiqueta que puntua fotogramas individuales de video para determinar si el contenido principal de la pieza ya ha comenzado. Su proposito concreto es alimentar el plugin Auto Seek del servidor multimedia autoalojado Stash, que lo emplea para localizar el punto exacto donde arranca el contenido tras la introduccion y permitir asi el salto automatico de la intro durante la reproduccion.

El modelo parte del codificador de imagenes de CLIP ViT-B/32 con pesos LAION-2B (laion/CLIP-ViT-B-32-laion2B-s34B-b79K) y fue afinado entrenando los tres ultimos bloques del transformer y dos capas de salida pequenas sobre fotogramas de una biblioteca privada, etiquetados a partir de marcadores de capitulo y revisados manualmente. El resultado se distribuye como un unico archivo ONNX de 89 MB con pesos cuantizados a int8, lo que lo hace extremadamente ligero y desplegable incluso en hardware modesto.

Es relevante por su enfoque pragmatico: reutiliza un backbone contrastivo bien conocido, lo adapta a una tarea especifica de segmentacion temporal de video mediante muestreo de escenas y busqueda por biseccion, y lo empaqueta en un formato ONNX autocontenido (la normalizacion de CLIP forma parte del grafo). La licencia MIT facilita su integracion en proyectos de codigo abierto, aunque su ambito de aplicacion es deliberadamente estrecho y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (codificador de imagenes, transformer ViT) con cabezas de clasificacion adicionales; exportado en ONNX opset 17 |
| Parametros totales | no disponible (el backbone ViT-B/32 ronda los 88 M de parametros, pero el autor no declara el total tras el afinado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 224 × 224 × 3 mas un vector de posicion de 3 valores) |
| Tipos de cuantizacion | pesos int8 con cuantizacion dinamica; unico artefacto publicado de 89 MB |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de salida son numericas) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo `auto-seek-clip3-v1.onnx`, opset 17) |

Detalles de entrada y salida declarados por el autor:

| Tensor | Tipo | Forma | Descripcion |
|---|---|---|---|
| `pixels` | uint8 | N × 224 × 224 × 3 | RGB, cuadrado central del fotograma con el lado corto escalado a 224 |
| `q` | float32 | N × 3 | posicion en el video (proporcion de su longitud, minutos desde el inicio, duracion en horas) |
| `started` | float32 | N | probabilidad de que el contenido principal haya comenzado |
| `acts` | float32 | N × 10 | distribucion de categorias de actividad (funcionalidad futura; v1 usa solo `started`) |

## Arquitectura y entrenamiento

La base es el codificador de imagenes de CLIP ViT-B/32 con pesos LAION-2B, un Vision Transformer que divide la imagen en parches de 32 × 32 pixeles y los procesa mediante atencion multi-cabeza. Sobre esa representacion, el autor anade una entrada auxiliar de posicion temporal (`q`, tres valores float32) y dos cabezas de salida: una escalar (`started`) y otra de diez categorias (`acts`). El afinado consistio en entrenar los tres ultimos bloques del transformer junto con dos capas de salida pequenas, manteniendo el resto del backbone congelado. La normalizacion propia de CLIP esta incorporada dentro del grafo ONNX, de modo que los bytes crudos de `ffmpeg -f rawvideo -pix_fmt rgb24` pueden alimentar directamente el tensor `pixels`.

Los datos de entrenamiento provienen de fotogramas de una biblioteca privada, etiquetados a partir de marcadores de capitulo y verificados manualmente; el material de entrenamiento no se distribuye y no se declara el numero de tokens, imagenes ni la composicion del dataset. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision. La innovacion tecnica destacable es el pipeline de inferencia descrito en la model card: el plugin muestrea una escena en varios puntos, escanea el tramo donde `started` cambia y aplica biseccion hasta localizar el primer fotograma que supera el umbral. Los pesos estan cuantizados dinamicamente, por lo que el autor recomienda puntuar un fotograma por llamada para obtener resultados independientes del tamano de lote.

## Capacidades

- Clasificacion binaria de fotogramas: estima la probabilidad (`started`) de que el contenido principal haya comenzado en un fotograma dado.
- Clasificacion multietiqueta auxiliar: produce una distribucion (`acts`) sobre 10 categorias de actividad, reservada para una version futura del plugin.
- Localizacion temporal de inicio de contenido: combinada con el muestreo y la biseccion del plugin, permite detectar el punto de arranque del contenido en un video.
- Deteccion de limites de intro: capacidad practica derivada de la anterior, orientada al salto automatico de introducciones.
- Entrada de posicion temporal: acepta metadatos del video (proporcion de longitud, minutos desde el inicio, duracion en horas) junto al fotograma, lo que aporta contexto temporal a la puntuacion.
- Inferencia via ONNX Runtime: el grafo es autocontenido (normalizacion CLIP incluida) y acepta bytes RGB crudos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, soporte de agentes ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Salto automatico de intro en servidores multimedia: el caso principal. El plugin Auto Seek muestrea escenas del video, escanea el tramo donde `started` cambia y bisecciona hasta el primer fotograma por encima del umbral, de modo que el reproductor puede saltar la introduccion sin intervencion manual.
- Etiquetado y curacion de bibliotecas autoalojadas: integrado en Stash, permite marcar puntos de inicio de contenido de forma masiva sobre colecciones existentes, reduciendo la revision manual de cada archivo.
- Preprocesado de pipelines de video: al puntuar un fotograma por llamada con un grafo ONNX de 89 MB, puede insertarse como etapa ligera en flujos de `ffmpeg` para recortar cabeceras antes de tareas posteriores (transcodificacion, indexacion, analisis).
- Segmentacion temporal asistida: la salida `acts` (10 categorias) puede emplearse en una version futura para clasificar actividades dentro del video y construir indices por tipo de escena.
- Prototipado de investigacion en vision aplicada: sirve como ejemplo reproducible de afinado parcial de un backbone CLIP congelado y exportacion ONNX con normalizacion embebida, util para experimentos de clasificacion de fotogramas.
- Despliegue en hardware de gama baja: por su tamano (89 MB, int8) y su naturaleza de clasificador de una sola imagen, puede ejecutarse en CPU o en GPUs consumer pequenas dentro de servicios domoticos o NAS.
- Filtrado previo en herramientas de catalogacion: descartar rapidamente fotogramas irrelevantes (pausas, cabeceras) antes de pasarlos a modelos de vision mas costosos.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). El unico dato de rendimiento declarado es una metrica de tarea: sobre 196 videos reservados con puntos de inicio verificados manualmente, la busqueda del plugin acierta dentro de un margen de 60 segundos respecto al inicio elegido a mano en aproximadamente el 79 % de los casos.

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Precision del inicio dentro de 60 s | ~79 % | 196 videos reservados con inicio verificado manualmente |
| MMLU, HumanEval, GSM8K u otros | no disponible | no aplica (modelo de vision) |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el artefacto ONNX pesa 89 MB con pesos int8 y procesa una imagen de 224 × 224 por llamada, por lo que cabe holgadamente en menos de 1 GB de memoria en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o DirectML), incluidas GTX 1050/1650, RTX 2060/3060/4090, A100 y H100; el modelo no aprovecha la capacidad de GPUs de gama alta por su tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y tambien en CPU; el autor recomienda puntuar un fotograma por llamada por la cuantizacion dinamica.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integracion como plugin de Stash, uso directo desde Python con `onnxruntime`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; al ser un clasificador de una imagen por llamada, la latencia depende del backend y del hardware, pero el coste por fotograma es bajo en terminos relativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Auto Seek (este modelo) | no disponible (backbone ViT-B/32) | imagen 224 × 224 + vector de posicion | ~79 % de inicio dentro de 60 s en 196 videos | MIT | Hugging Face, ONNX |
| laion/CLIP-ViT-B-32-laion2B-s34B-b79K | ~88 M (backbone) | imagen 224 × 224 | no disponible en esta ficha | MIT | Hugging Face |
| CLIP ViT-B/32 original (OpenAI) | ~88 M | imagen 224 × 224 | no disponible en esta ficha | MIT | Hugging Face / OpenCLIP |
| Modelos de deteccion de escenas genericos (p. ej. TransNetV2) | no disponible | fotogramas de video | no disponible en esta ficha | varía | repositorios publicos |

La comparacion directa es limitada: Auto Seek es un derivado afinado de CLIP ViT-B/32 para una tarea especifica (inicio de contenido), mientras que los alternativos citados resuelven tareas distintas (representacion imagen-texto o deteccion de cortes de escena). No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Analiza fotogramas individuales: una pausa o personas aun vestidas cuando el contenido ya ha comenzado pueden hacer que elija un inicio demasiado tardio; desnudo sin accion puede hacer que lo elija demasiado pronto.
- Afinado sobre una unica coleccion privada: puede rendir peor en material muy distinto del usado en entrenamiento.
- Modelo de investigacion, igual que su base: el autor advierte explicitamente que no debe usarse para nada mas alla de funciones de conveniencia como saltar una intro.
- Etiqueta `not-for-all-audiences`: el repositorio esta marcado como no apto para todo publico, lo que condiciona su uso en entornos sensibles.
- Sesgos conocidos: no se documentan sesgos especificos; al derivar de CLIP LAION-2B, hereda los sesgos de representacion de ese dataset, aunque no se detallan en la model card.
- Riesgo de alucinacion: no aplica en el sentido generativo; el riesgo equivalente es la clasificacion erronea de fotogramas (falsos positivos y negativos en `started`).
- Limitaciones de contexto o idioma: no procesa texto ni multiples idiomas; la entrada es exclusivamente visual mas un vector de posicion temporal.
- Restricciones de licencia: MIT, tanto para este archivo como para los pesos base de LAION y OpenCLIP; se permite uso comercial con atribucion, pero el autor no ofrece garantias.
- Caveat para produccion: la cuantizacion dinamica obliga a puntuar un fotograma por llamada para resultados reproducibles; el material de entrenamiento no se distribuye y no hay evaluacion independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrx-31415/auto-seek
- Repositorio del plugin: https://github.com/mrx-31415/stash-curator
- Servidor multimedia Stash: https://stashapp.cc
- Modelo base CLIP ViT-B/32 LAION-2B: https://huggingface.co/laion/CLIP-ViT-B-32-laion2B-s34B-b79K
- Calendario de lanzamientos de modelos de IA (resultado de busqueda): https://www.scriptbyai.com/ai-model-release-calendar/
