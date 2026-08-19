# AbrahamPJ/absolutereality-openpose-control-inpaint-qnn

## Resumen

AbsoluteReality OpenPose Control-Inpaint QNN es una conversión del modelo de difusión AbsoluteReality 1.6525 inpainting, combinado con la rama de ControlNet OpenPose, adaptada para ejecución íntegra en la NPU de chips Snapdragon de Qualcomm. El modelo, publicado por AbrahamPJ, resuelve el problema de ejecutar inpainting guiado por pose en dispositivos móviles sin depender de la nube, con latencias de unos 6 segundos para 512×512 píxeles y 20 pasos en un Samsung S25 Ultra. Su relevancia radica en que demuestra la viabilidad de cargas de trabajo de difusión complejas (UNet de 16 entradas) en hardware de consumo, abriendo la puerta a aplicaciones de edición fotográfica locales y privadas.

Arquitectónicamente, el modelo emplea un UNet de 16 canales de entrada que combina el latente de inpainting de 9 canales con 13 residuales de ControlNet (12 de down-block y 1 de mid-block). Esto permite que el modelo reciba simultáneamente la máscara de repintado y un esqueleto OpenPose como guía. El texto se procesa mediante una rama separada en MNN que se ejecuta en CPU. El repositorio pesa 1,3 GB e incluye los binarios cuantizados en w8a16 para la NPU, así como el VAE codificador y decodificador propios de AbsoluteReality.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + ControlNet OpenPose + VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no de texto) |
| Tipos de cuantizacion | w8a16, per-channel, NHWC IO |
| Idiomas soportados | no disponible (el texto se procesa via CLIP, presumiblemente ingles) |
| Licencia | CreativeML OpenRAIL-M (base) + licencia de ControlNet (OpenRAIL) |
| Formato de pesos | .bin (QNN para NPU), .mnn (MNN para CPU) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un reentrenamiento. Los pesos originales provienen de Lykon/absolute-reality-1.6525-inpainting (base) y de lllyasviel/control_v11p_sd15_openpose (rama de control). La conversión se realizó con QAIRT 2.49, aplicando cuantización w8a16 por canal y formato NHWC. La innovación principal es el diseño del UNet de 16 entradas: 9 canales corresponden al latente de inpainting (imagen, máscara y ruido) y 13 canales adicionales reciben los residuales de ControlNet. Esto permite dos modos de funcionamiento: si se omite la imagen de control, la rama de ControlNet se salta por completo y el modelo actúa como un inpainting estándar de 9 canales, sin coste computacional adicional. El texto se procesa con CLIP en MNN, ejecutándose en CPU.

## Capacidades

- Inpainting guiado por pose: acepta una imagen, una máscara (blanco = repintar) y un esqueleto OpenPose opcional a 512×512 para dirigir la generación.
- Inpainting sin control: si no se proporciona imagen de control, funciona como un inpainting clásico de 9 canales.
- Generación de imágenes a partir de texto con el VAE de AbsoluteReality, con calidad fotográfica.
- Ejecución on-device en NPU de Snapdragon, sin conexión a internet.
- Dos modos de operación en un único modelo, con omisión dinámica de la rama de ControlNet.

## Casos de uso

- Edición fotográfica en movil: un usuario puede borrar un objeto no deseado de una foto y repintar la zona con una pose especifica (por ejemplo, recolocar una figura humana) directamente en el dispositivo, sin enviar la imagen a la nube.
- Creacion de contenido para redes sociales: generar variaciones de una imagen base manteniendo la composicion y la pose de una persona, ideal para creadores que necesitan ajustes rapidos desde el telefono.
- Prototipado de diseno de moda: sobre una foto de una prenda, se puede modificar la pose del maniqui o del modelo usando un esqueleto OpenPose, y el modelo repinta la zona con la nueva pose.
- Asistencia a fotografia de producto: reemplazar el fondo o elementos de una imagen de producto manteniendo la pose del objeto, con resultados realistas gracias al VAE de AbsoluteReality.
- Aplicaciones de realidad aumentada: generar texturas o elementos 3D guiados por pose que se integran en escenas capturadas por la camara del dispositivo.
- Herramientas de accesibilidad: permitir a usuarios sin conocimientos de edicion realizar retoques complejos (eliminar personas, cambiar poses) mediante una interfaz sencilla que genere el esqueleto OpenPose automaticamente en un servidor o localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible, al tratarse de un modelo de generacion de imagenes. Los unicos datos de rendimiento proporcionados por el autor son tiempos de inferencia medidos en un Samsung S25 Ultra (SM8750, HTP v79) con resolucion 512×512 y 20 pasos:

| Modo | Tiempo |
|---|---|
| Inpainting guiado por pose | ~6,0 s |
| Inpainting sin control | ~5,1 s |

## Requisitos de hardware

- Requiere un SoC Snapdragon con NPU compatible con fp16 y dsp_arch v73 (8 Gen 2 o superior). Chips sin soporte fp16 rechazan el modelo en la carga.
- No se especifica VRAM; la inferencia se realiza en NPU, no en GPU.
- El texto (CLIP) se ejecuta en CPU mediante MNN, por lo que se necesita una CPU razonable.
- Despliegue recomendado mediante el servidor C++ del proyecto local-dream (xororz/local-dream), que incluye el pipeline de conversion y el runtime.
- Latencia medida: ~6,0 s para 20 pasos a 512×512 con control de pose; ~5,1 s sin control. No se indican throughput ni latencia por token.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas equivalentes. Como referencia cualitativa:

| Modelo | Tipo | Hardware objetivo | Licencia |
|---|---|---|---|
| AbsoluteReality OpenPose Control-Inpaint QNN | SD1.5 + ControlNet inpainting | NPU Snapdragon 8 Gen 2+ | CreativeML OpenRAIL-M |
| Lykon/absolute-reality-1.6525-inpainting | SD1.5 inpainting | GPU (CUDA) | CreativeML OpenRAIL-M |
| lllyasviel/control_v11p_sd15_openpose | ControlNet SD1.5 | GPU (CUDA) | OpenRAIL |

La principal diferencia es que este modelo esta optimizado para NPU movil, mientras que las alternativas requieren GPU de escritorio o servidor. No se han encontrado otros modelos QNN de inpainting con ControlNet publicados en HuggingFace.

## Limitaciones y advertencias

- No realiza deteccion de pose en el dispositivo: la imagen de control debe ser un esqueleto OpenPose precalculado a 512×512, no una foto. Si no se dispone de un detector de pose, hay que generarlo externamente.
- Compatibilidad restringida: el modelo solo funciona en chips Snapdragon 8 Gen 2 o posteriores que reporten soporte fp16. En otros dispositivos, la carga falla.
- Es una conversion, no un reentrenamiento: no se han ajustado los pesos, por lo que las limitaciones de los modelos originales (sesgos, alucinaciones visuales) se mantienen.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones de uso responsable (no generar contenido ilegal o dañino). La rama de ControlNet tiene su propia licencia OpenRAIL, que tambien aplica.
- No se especifican idiomas soportados; el texto se procesa via CLIP, que funciona mejor en ingles. No se garantiza un rendimiento multilingue.
- El repositorio no incluye documentacion sobre el pipeline completo de ejecucion (preprocesado de la imagen, generacion del latente, etc.), lo que puede dificultar la integracion en proyectos propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AbrahamPJ/absolutereality-openpose-control-inpaint-qnn
- Modelo base (Lykon): https://huggingface.co/lykon-models/absolute-realism-1.6525-inpainting
- ControlNet OpenPose (lllyasviel): https://huggingface.co/lllyasviel/control_v11p_sd15_openpose
- Proyecto local-dream (conversion y runtime): https://github.com/xororz/local-dream
