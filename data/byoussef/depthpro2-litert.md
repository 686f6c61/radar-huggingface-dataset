# byoussef/DepthPro2-litert

## Resumen

DepthPro2-litert es una conversión no oficial del modelo Depth Pro 2 de Apple a formato LiteRT (`.tflite`), realizada por el usuario byoussef. El modelo original resuelve la estimación de profundidad monocular métrica: a partir de una única fotografía RGB produce un mapa de profundidad en metros, sin necesidad de datos de calibración adicionales más allá de la longitud focal. Esta conversión permite ejecutar el modelo sobre GPU mediante LiteRT, tanto en navegador con LiteRT.js y WebGPU como en Python con el runtime `ai-edge-litert`, lo que habilita inferencia de profundidad en el propio dispositivo (edge y web) sin depender de servicios en la nube.

La relevancia de esta conversión radica en que acerca un modelo de profundidad de investigación a entornos de despliegue ligeros: el repositorio incluye tres variantes en `.tflite` (S, B y un módulo de campo de visión) con pesos de entre 95 y 387 MB, pensadas para ejecutarse en GPU de consumo y navegadores modernos. El modelo base es `apple/DepthPro2`, del que esta versión es una cuantización/conversión, no un modelo entrenado desde cero.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica, es un modelo de visión) ni los idiomas soportados, ya que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de estimación de profundidad monocular (conversión a LiteRT/TFLite del modelo apple/DepthPro2); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 480x854 RGB) |
| Tipos de cuantizacion | Conversión a `.tflite`; ejecución en float16 o float32 según soporte de `shader-f16` en GPU |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apple-amlr (licencia del modelo Apple; ver enlace en la model card) |
| Formato de pesos | `.tflite` (LiteRT) |

## Arquitectura y entrenamiento

Se trata de una conversión del modelo Depth Pro 2 de Apple a LiteRT, no de un modelo entrenado de nuevo. La model card no detalla la arquitectura interna del modelo base (tipo de backbone, número de capas o parámetros), por lo que esa información no está disponible en la documentación proporcionada. El modelo resuelve la tarea de estimación de profundidad monocular métrica: recibe una imagen RGB en float32 con forma (1, 3, 480, 854) y devuelve un mapa de profundidad inversa de (1, 480, 854), del que se obtiene la profundidad en metros mediante `f_px / (854 * inverse_depth)`.

El repositorio incluye tres ficheros: `depthpro2-s_480x854.tflite` (variante S, 98 MB), `depthpro2-b_480x854.tflite` (variante B, 387 MB, más nítida y unas 2,5 veces más lenta) y `depthpro2-fov_480x832.tflite` (módulo de campo de visión, 95 MB, que estima los ángulos horizontal y vertical para calcular la longitud focal cuando la foto no la incluye). Las variantes L y H+ del modelo original no están incluidas porque LiteRT.js 2.6.0 no pudo cargar la L (1,3 GB). La conversión emplea precisión float16 cuando la GPU soporta `shader-f16` y float32 en caso contrario.

## Capacidades

- Estimación de profundidad monocular métrica a partir de una sola imagen RGB, con salida en metros.
- Estimación del campo de visión (horizontal y vertical en grados) para fotos sin longitud focal conocida, mediante el módulo FOV.
- Ejecución en GPU vía LiteRT, tanto en navegador (LiteRT.js + WebGPU) como en Python (`ai-edge-litert` con acelerador GPU o CPU).
- Dos variantes de calidad/velocidad (S y B) para ajustar el compromiso entre nitidez y latencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Reconstrucción 3D y fotogrametría ligera: usar el mapa de profundidad métrica de una foto para generar nubes de puntos o mallas aproximadas en el navegador, sin subir imágenes a un servidor.
- Realidad aumentada en web: estimar la profundidad de la escena desde la cámara en tiempo real (S tarda unos 50 ms por fotograma en GPU de escritorio) para colocar objetos virtuales con oclusión coherente.
- Edición fotográfica con desenfoque de profundidad: aplicar efectos de bokeh sintético o separación de primer plano y fondo a partir del mapa de profundidad en metros.
- Automoción y robótica de bajo coste: estimación de distancia a obstáculos en prototipos con cámara monocular, aprovechando la salida métrica y la ejecución en GPU embebida mediante LiteRT.
- Procesamiento en el dispositivo por privacidad: aplicaciones de móvil o escritorio que necesitan profundidad sin enviar imágenes a la nube, usando el runtime LiteRT en CPU (unos 300 ms por fotograma para S con 8 hilos).
- Medición de distancias en imágenes: calcular el tamaño real de objetos o la distancia a ellos combinando la profundidad métrica y el módulo FOV para fotos sin EXIF de focal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta datos de velocidad: la variante S tarda unos 50 ms por fotograma en una GPU NVIDIA de escritorio y unos 300 ms en CPU con 8 hilos (2 s con un solo hilo); la variante B tarda aproximadamente 2,5 veces más que S.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los ficheros es de 98 MB (S), 387 MB (B) y 95 MB (FOV).
- GPU recomendadas: cualquier GPU con soporte de delegado GPU de LiteRT; se menciona una GPU NVIDIA de escritorio para los 50 ms por fotograma.
- GPU de consumo: sí, cabe en GPU de consumo dado el reducido tamaño de los modelos; LiteRT.js limita la memoria a unos 700 MB de modelos compilados.
- Navegadores: Chrome y Firefox funcionan con WebGPU; Safari 27.2 falla al compilar dos shaders de LiteRT.js y devuelve resultados incorrectos.
- Despliegue: LiteRT.js (navegador, WebGPU) y `ai-edge-litert` en Python (GPU o CPU); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: S ~50 ms/fotograma en GPU NVIDIA de escritorio, ~300 ms en CPU con 8 hilos; B ~2,5 veces más lenta.
- Memoria: LiteRT.js aborta al acumular unos 700 MB de modelos compilados; para alternar float32/float16 en B hay que llamar a `model.delete()` antes de compilar la otra variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DepthPro2-litert (este) | no disponible | no aplica | `.tflite` (LiteRT) | apple-amlr | Hugging Face (conversión no oficial) |
| apple/DepthPro2 (original) | no disponible | no aplica | no disponible en la información | apple-amlr | Hugging Face (oficial) |
| Otras alternativas de profundidad monocular | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: el autor no está afiliado a Apple y Apple no respalda esta versión; para producción conviene evaluar el modelo oficial.
- Licencia apple-amlr: es necesario revisar los términos de la licencia del modelo Apple antes de cualquier uso comercial; la model card enlaza a `LICENSE_MODEL` en el repositorio oficial.
- Solo se incluyen las variantes S, B y FOV; las variantes L y H+ no están disponibles por limitaciones de carga en LiteRT.js.
- El módulo FOV debe ejecutarse en float32: en float16 la longitud focal (y con ella todas las profundidades) puede desviarse hasta un 2 %.
- El redimensionado de la imagen debe ser bilineal: un filtro más nítido altera la longitud focal hasta un 4 %.
- Safari 27.2 no es compatible con la compilación de shaders de LiteRT.js y devuelve resultados incorrectos.
- La profundidad es infinita donde la profundidad inversa es 0 (por ejemplo, el cielo); hay que tratar esos valores en el posprocesado.
- No se dispone de datos sobre sesgos, alucinaciones o rendimiento cuantitativo en benchmarks, por lo que no es posible evaluar su precisión frente al modelo original con la información aportada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/byoussef/DepthPro2-litert
- Modelo base oficial: https://huggingface.co/apple/DepthPro2
- Código oficial: https://github.com/apple-aiml-research/ml-depth-pro-2
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
- LiteRT.js (web): https://ai.google.dev/edge/litert/web
