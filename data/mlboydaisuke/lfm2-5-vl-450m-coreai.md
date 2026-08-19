# mlboydaisuke/LFM2.5-VL-450M-CoreAI

## Resumen

LFM2.5-VL-450M-CoreAI es una conversión a Apple Core AI (el sucesor de Core ML presentado en WWDC26) del modelo vision-language LFM2.5-VL-450M de Liquid AI. El resultado es un bundle de 658 MB que ejecuta inferencia de imagen a texto en dispositivos Apple con iOS 27 o macOS 27, pensado para integrarse dentro de una aplicación como modelo de captioning o triaje visual. El desarrollo lo firma mlboydaisuke, que ha adaptado los pesos originales al formato `.aimodel` con soporte para el motor `coreai-pipelined` de Apple.

El modelo combina un vision tower SigLIP2-NaFlex con un decoder híbrido LFM2 de convoluciones y atención (10 capas convolucionales cortas + 6 capas de atención GQA, hidden size 1024, vocabulario de 65 536 tokens). Con 450 millones de parámetros, no es un modelo de razonamiento: no abre el modo `thinking` en la generación. Su relevancia actual radica en permitir inferencia visual on-device con latencias de decenas de milisegundos, sin conexión a la nube y con privacidad total de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-NaFlex vision tower + proyector + decoder LFM2 híbrido (10 conv cortas + 6 capas GQA attention) |
| Parametros totales | 450 millones (segun nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (vision tower), int8lin (decoder); int4 no publicado |
| Idiomas soportados | No disponibles |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | `.aimodel` (Apple Core AI), safetensors en el modelo base original |

## Arquitectura y entrenamiento

El modelo base LFM2.5-VL-450M de Liquid AI es una evolución de LFM2-VL-450M con entrenamiento de refuerzo extendido para mejorar el seguimiento de instrucciones, capacidades de grounding y soporte de function calling. La arquitectura del decoder es híbrida: combina capas convolucionales de ventana corta con capas de atención GQA, lo que reduce el coste computacional frente a un transformer puro. El vision tower SigLIP2-NaFlex genera 256 tokens de imagen mediante un grid de parches 32×32 (con unshuffle 2×) y un proyector que mapea a 1024 dimensiones. La conversión a Core AI no modifica los pesos; solo reempaqueta el modelo en dos bundles secuenciales: uno para la torre visual (fp16) y otro para el decoder (int8lin), con una entrada estática `image_embeds` que conecta ambos.

El bundle fija una resolución de entrada de 512×512 píxeles con un grid de parches 32×32, que es el `max_image_tokens` del checkpoint original. El modelo NaFlex original selecciona un grid por imagen y mantiene la relación de aspecto, pero esta conversión estira las imágenes no cuadradas a 512×512, lo que puede afectar a la fidelidad en imágenes panorámicas o verticales.

## Capacidades

- Generación de texto descriptivo a partir de imágenes: responde a preguntas de nivel escena (qué hay, dónde está, qué colores dominan).
- Captioning de imágenes con salida en lenguaje natural.
- Soporte de function calling (segun el blog de Liquid AI para el modelo base).
- Capacidades de grounding (segun el blog de Liquid AI).
- Seguimiento de instrucciones mejorado respecto a LFM2-VL-450M.
- No es un modelo de razonamiento: no genera cadenas de pensamiento ni abre el modo `thinking`.
- No soporta entrada de audio ni video; solo imagen fija + texto.
- Multilingüismo no confirmado en la informacion disponible.

## Casos de uso

- Captioning automatico en apps de fotografia: el modelo puede generar descripciones de escenas en tiempo real (33,6 ms por imagen en iPhone 17 Pro) para etiquetar o buscar fotos localmente.
- Triaje visual en aplicaciones de productividad: clasificar imagenes por contenido (documentos, personas, objetos) sin enviar datos a la nube, gracias a su tamaño de 658 MB que cabe dentro de una app.
- Asistente de accesibilidad: describir el entorno a personas con discapacidad visual mediante la camara del dispositivo, con latencia de decodificacion de 112 tokens/s en iPhone 17 Pro.
- Automatizacion de metadatos en gestores de archivos: generar titulos y descripciones para imagenes almacenadas en el dispositivo, aprovechando el soporte de function calling para integrarse con otras herramientas.
- Moderacion de contenido on-device: detectar categorias visuales (violencia, desnudos, etc.) en apps de mensajeria, manteniendo la privacidad al no subir las imagenes.
- Asistente de compras en retail: reconocer productos y generar descripciones para inventarios o catalogos, con el modelo ejecutandose en terminales de punto de venta con Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor solo incluye metricas de rendimiento de inferencia (latencias y throughput) y verificaciones de numerica (coseno de similitud y token-exactitud), pero no resultados de tareas como MMLU, HumanEval o VQAv2.

## Requisitos de hardware

- Requiere iOS 27 o macOS 27 beta, ya que Core AI se distribuye con el sistema operativo.
- En Mac con chip M4 Max: 18,0 ms por imagen para el vision tower (fp16) y 387,2 tokens/s de decodificacion (text core, int8lin).
- En iPhone 17 Pro (AOT h18p): 33,6 ms por imagen para el vision tower y 112,0 tokens/s de decodificacion con el bundle completo (imagen vinculada).
- El primer encode de la torre visual paga ~860 ms de compilacion on-device; se recomienda un encode dummy al cargar el modelo.
- No aplica a GPUs de escritorio convencionales (NVIDIA, AMD); el formato `.aimodel` es exclusivo de Apple Silicon.
- Despliegue mediante `llm-runner` de Apple (repositorio `apple/coreai-models`) con los parches del `coreai-model-zoo` para estados convolucionales y entradas estaticas.
- El bundle usa el motor `coreai-pipelined` de Apple sin kernels personalizados, lo que simplifica la integracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-450M-CoreAI (este) | 450M | No disponible | Si (SigLIP2) | lfm1.0 | .aimodel |
| LFM2-VL-450M (anterior) | 450M | No disponible | Si | lfm1.0 | safetensors |
| LFM2.5-1.2B-CoreAI (mencionado en la model card) | 1.2B | No disponible | No (solo texto) | lfm1.0 | .aimodel |

La comparativa se limita a los modelos de la misma familia mencionados en la informacion proporcionada. No se dispone de datos de otros VLM compactos como Phi-3.5-vision o MiniCPM-V para una comparacion directa.

## Limitaciones y advertencias

- Resolucion fija de 512×512: las imagenes no cuadradas se estiran, lo que puede distorsionar la geometria y afectar a la descripcion.
- Errores en geometria fina: el modelo acierta en preguntas de nivel escena pero falla en detalles de posicionamiento o relaciones espaciales precisas.
- Cuantizacion int4 no publicada: en las pruebas del autor, 0 de 9 casos de validacion fueron token-exactos y el fallo se manifiesta como deriva fluida (por ejemplo, "cocina italiana" en lugar de "cocina rustica"). No se recomienda usar int4 con modelos de este tamano.
- No es un modelo de razonamiento: no genera cadenas de pensamiento ni resuelve tareas que requieran inferencia multi-paso.
- La decodificacion con el bundle VLM completo no es token-identica a fp32: en una prueba, el modelo omitio un adjetivo en una descripcion ("dos gatos atigrados" → "dos gatos"), aunque los tokens entre ambas bifurcaciones son identicos.
- Licencia lfm1.0: es una licencia propia de Liquid AI; se debe revisar si permite uso comercial y redistribucion antes de integrar el modelo en un producto.
- Requiere versiones beta de iOS/macOS, lo que limita su despliegue en entornos de produccion estables.
- El primer encode de la torre visual incurre en ~860 ms de compilacion; si no se calienta con un encode dummy, la primera imagen del usuario sufre esa latencia.

## Enlaces

- Modelo convertido en HuggingFace: https://huggingface.co/mlboydaisuke/LFM2.5-VL-450M-CoreAI
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-vl-450m
- Blog de Liquid AI sobre LFM2.5-VL-450M: https://www.liquid.ai/blog/lfm2-5-vl-450m
- Repositorio coreai-model-zoo (codigo de conversion y parches): https://github.com/john-rocky/coreai-model-zoo
- Repositorio de ejemplos de Liquid AI: https://github.com/Liquid4All/cookbook
