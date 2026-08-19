# AbrahamPJ/chilloutmix-inpainting-qnn

## Resumen

ChilloutMix Inpainting — Qualcomm QNN/HTP build es una conversión del checkpoint de inpainting ChilloutMix (basado en Stable Diffusion 1.5) compilado para ejecutarse íntegramente en el Hexagon NPU de Qualcomm mediante el runtime QNN. El autor, AbrahamPJ, lo ha diseñado para su aplicación DreamUI, permitiendo generación de imágenes de inpaint en el dispositivo sin conexión a red. Incluye el UNet de inpainting de 9 canales, un CLIP y un VAE, todos convertidos a formato QNN.

El modelo se distribuye en dos variantes: una optimizada para Snapdragon 8 Gen 2 y posteriores (dsp arch v73, VTCM 8 MB) y otra para HTP más antiguos o recortados (dsp arch v68, VTCM 2 MB), esta última aproximadamente 2,4 veces más lenta. La licencia es incierta: el checkpoint original no declara ninguna, y la herramienta de conversión (Local Dream) tiene licencia CC BY-NC 4.0, por lo que el uso comercial es problemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion 1.5 para inpainting (9 canales) + CLIP + VAE, compilado a QNN/HTP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion) |
| Tipos de cuantizacion | QNN: activaciones 16 bits, pesos por canal (bitwidth no especificado), bias 32 bits |
| Idiomas soportados | no disponibles |
| Licencia | unstated-upstream (sin licencia declarada; asuncion no verificada de CreativeML OpenRAIL-M) |
| Formato de pesos | .bin (context binary QNN), .mnn (CLIP), .json (tokenizer) |

## Arquitectura y entrenamiento

El modelo es una compilacion del checkpoint ChilloutMix Inpainting, una fusion comunitaria basada en Stable Diffusion 1.5. El UNet de inpainting acepta 9 canales de entrada (latente, imagen enmascarada y mascara) para rellenar regiones especificas de una imagen. No se ha realizado entrenamiento adicional; el proceso de conversion a QNN con QAIRT 2.49 incluyo calibracion con 400 filas capturadas interceptando `unet.forward` (lo que garantiza el orden de concatenacion y el escalado correctos), `--act_bitwidth 16`, pesos por canal y `--bias_bitwidth 32`. La cuantizacion del camino del timestep se verifico contra onnxruntime, con 36/36 tensores dentro de 0.997–1.34 de su rango real.

## Capacidades

- Generacion de imagenes de inpainting (rellenado de regiones enmascaradas) a resolucion 512x512.
- Ejecucion completamente en el dispositivo, sin conexion a red en inferencia.
- Compilado para el Hexagon NPU de Qualcomm, no requiere GPU externa.
- Incluye CLIP y VAE propios, por lo que no depende de componentes externos.
- Dos variantes de compilacion para distintos niveles de hardware Qualcomm.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo de difusion, no un LLM).

## Casos de uso

- Edicion de fotos en movil: el usuario selecciona una region y el modelo la rellena con contenido coherente, gracias a su ejecucion local y baja latencia en Snapdragon 8 Gen 2 (4055 ms para 20 pasos a 512x512).
- Restauracion de imagenes antiguas: se puede enmascarar zonas danadas o rotas y el modelo reconstruye los detalles faltantes, funcionando sin conexion.
- Eliminacion de objetos no deseados: enmascarar un objeto (persona, texto, etc.) y el modelo genera un fondo plausible en esa zona.
- Creacion de variaciones de una region especifica: el usuario puede re-generar solo una parte de la imagen manteniendo el resto intacto, util para diseno grafico rapido.
- Prototipado de aplicaciones de edicion fotografica en dispositivos Android: los desarrolladores pueden integrar este modelo en apps que requieran procesamiento local de imagenes sin depender de servidores.
- Demostraciones de IA en el borde: sirve como ejemplo de despliegue de Stable Diffusion en hardware movil de gama alta, mostrando viabilidad de generacion de imagenes en el dispositivo.

## Benchmarks y rendimiento

Los unicos datos publicados provienen de la model card, medidos en un Samsung S25 Ultra a 512x512 con 20 pasos (seed 12345, denoise 1.0):

| Variante | extreme_frac (umbral < 0.15) | Tiempo (ms) |
|---|---|---|
| `_8gen2` | 0.0956 | 4055 |
| `_min` | 0.0789 | 9569 |

No se han publicado resultados de benchmarks comparativos con otros modelos de difusion en la informacion disponible.

## Requisitos de hardware

- Qualcomm Snapdragon con Hexagon NPU compatible con HTP (DSP arch v73 para `_8gen2`, v68 para `_min`).
- La variante `_8gen2` requiere VTCM de 8 MB; la `_min` solo 2 MB.
- Ambos builds exigen soporte de ejecucion fp16 en el dispositivo; si no esta disponible, el modelo se rechaza con el error `Request feature fp16 enable with value 1 unsupported`.
- No requiere GPU externa ni VRAM tradicional; utiliza la memoria del NPU.
- Despliegue previsto mediante la aplicacion DreamUI (https://github.com/AbrahamPaulJ/dreamui).
- No se dispone de datos de latencia en otros dispositivos ni de throughput en servidores.

## Comparativa con modelos similares

No hay una comparativa directa publicada con otros modelos de difusion para NPU. Como referencia, el modelo original `5w4n/chilloutmix-inpainting` es el checkpoint PyTorch sin compilar, que requiere GPU y no es portable a movil. Otros proyectos como Stable Diffusion en Core ML (Apple) o TensorFlow Lite no son directamente comparables por su soporte de hardware diferente. La informacion disponible no incluye benchmarks frente a alternativas.

## Limitaciones y advertencias

- Licencia incierta: el checkpoint original no declara licencia; la herramienta de conversion (Local Dream) es CC BY-NC 4.0, lo que impide uso comercial sin autorizacion explicita.
- Requiere hardware Qualcomm especifico (Snapdragon 8 Gen 2 o superior para la variante rapida); en otros SoC no funcionara.
- El requisito de fp16 excluye dispositivos que no lo soporten, incluso con la variante `_min`.
- Rendimiento limitado en HTP antiguos (9569 ms en `_min` en S25 Ultra), lo que puede ser inaceptable para aplicaciones en tiempo real.
- Al ser un modelo de difusion, no tiene capacidades de razonamiento, tool calling ni procesamiento de lenguaje.
- No se documentan sesgos ni riesgos de alucinacion especificos; como cualquier modelo de generacion de imagenes, puede producir contenido no deseado o inexacto en regiones complejas.
- Los archivos comprimidos deben mantenerse intactos; no re-comprimir ni re-subir bajo el mismo nombre, segun indica el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbrahamPJ/chilloutmix-inpainting-qnn
- Checkpoint original: https://huggingface.co/5w4n/chilloutmix-inpainting
- DreamUI (aplicacion): https://github.com/AbrahamPaulJ/dreamui
- Local Dream (herramienta de conversion): https://github.com/xororz/local-dream
- Pagina de ChilloutMix en Civitai: https://civitai.com/tag/chilloutmix
