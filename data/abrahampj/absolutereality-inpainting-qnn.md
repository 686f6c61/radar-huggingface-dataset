# AbrahamPJ/absolutereality-inpainting-qnn

## Resumen

Este repositorio contiene la conversión del modelo de inpainting AbsoluteReality 1.6525 (desarrollado por Lykon) a binarios de contexto QNN (Qualcomm Neural Network) para su ejecución en la NPU (HTP) de los procesadores Snapdragon. El trabajo lo realiza AbrahamPJ y está diseñado específicamente para integrarse en DreamUI, una aplicación de edición de imágenes que ejecuta el modelo completamente en el dispositivo.

El modelo resuelve el problema de ejecutar inpainting de alta calidad sin conexión a la nube, aprovechando la aceleración por hardware de los Snapdragon. Frente a otras conversiones, esta versión implementa un inpainting real de 9 canales en la capa convolucional de entrada del UNet, lo que permite eliminar objetos y rellenar regiones comprendiendo el contexto enmascarado, en lugar de limitarse a fusionar latentes. Se ofrecen dos variantes de compilación: una orientada a chips de gama alta (8 Gen 2 o superior) con 8 MB de VTCM, y otra reducida (`_min`) para hardware con solo 2 MB de VTCM, lo que amplía la compatibilidad a más dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (UNet de inpainting de 9 canales, VAE y CLIP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resoluciones de 512x512, 512x768 y 768x512) |
| Tipos de cuantizacion | w8a16 (UNet y VAE) |
| Idiomas soportados | no disponible (el tokenizador CLIP está incluido, pero no se especifican idiomas) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | Binarios QNN (`.bin`), MNN (`.mnn`) y JSON de tokenizador |

## Arquitectura y entrenamiento

No se trata de un modelo reentrenado, sino de una conversión del checkpoint original `Lykon/absolute-reality-1.6525-inpainting` a formato ejecutable por la NPU de Qualcomm mediante la herramienta QAIRT 2.49. La arquitectura subyacente es la de Stable Diffusion, con un UNet modificado para inpainting que acepta 9 canales de entrada: 4 del latente ruidoso, 1 de la máscara y 4 del latente de la imagen enmascarada. Esto permite al modelo razonar sobre el hueco y su entorno.

La cuantización es w8a16, compartida entre ambas variantes (solo cambia la configuración del grafo). El repositorio incluye el codificador de texto CLIP (compilado a MNN) y el VAE completo, lo que lo hace autocontenido. Según las mediciones del autor, el codificador de texto de AbsoluteReality no es bit-idéntico al de DreamShaper (0 de 196 tensores idénticos) y el VAE difiere (máxima diferencia absoluta de 0.057), por lo que no se pueden compartir componentes entre ambas familias sin degradar los resultados.

## Capacidades

- Inpainting guiado por texto completamente offline, ejecutado en la NPU del Snapdragon.
- Inpainting real de 9 canales: elimina objetos y rellena regiones comprendiendo el contexto, no mediante fusión de latentes.
- Pipeline de image-to-image (según el tag de HuggingFace) y text-to-image.
- Resoluciones soportadas: 512x512, 512x768 y 768x512 para la variante `_8gen2`; únicamente 512x512 para la variante `_min`.
- Incluye tokenizador, codificador de texto, VAE y UNet autocontenidos.
- Dos modos de compilación para adaptarse a distintos niveles de hardware HTP (dsp_arch v73 con 8 MB VTCM y dsp_arch v68 con 2 MB VTCM).

## Casos de uso

- Edición fotográfica local en móviles: eliminar objetos no deseados (personas, cables, sombras) de una fotografía directamente en el dispositivo, sin necesidad de conexión a internet.
- Aplicaciones de privacidad y confidencialidad: procesar imágenes sensibles (documentos, rostros) en el propio terminal, garantizando que los datos no salen del dispositivo.
- Restauración de imágenes antiguas: rellenar regiones dañadas, rasgadas o con manchas mediante una máscara y una instrucción de texto.
- Cambio de elementos en una escena: sustituir el fondo, la ropa de una persona o un objeto concreto indicando la máscara y un prompt descriptivo, gracias a la comprensión contextual del UNet de 9 canales.
- Integración en DreamUI: servir como motor de inpainting para una aplicación de edición de imágenes que busque una alternativa local a los servicios de pago por API.
- Prototipado de aplicaciones de IA generativa en Android: validar flujos de trabajo de edición de imágenes en dispositivos Snapdragon sin depender de servidores externos, usando la variante `_min` para garantizar compatibilidad con una gama más amplia de chips.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU o HumanEval) por tratarse de un modelo de generación de imágenes. El autor sí proporciona mediciones propias de rendimiento y calidad en un Samsung S25 Ultra (512x512, 20 pasos, denoise 1.0, semilla 12345). La puntuación se basa en la fracción de píxeles puros negros o blancos dentro de la máscara (valores más bajos indican mejor relleno).

| Variante | dsp_arch | VTCM | Puntuacion (fraccion de pixeles B/N) | Tiempo de inferencia |
|---|---|---|---|---|
| `_8gen2` | v73 | 8 MB | 0.0144 | 3796 ms |
| `_min` | v68 | 2 MB | 0.0092 | 9689 ms |

Según el autor, la variante `_min` produce resultados indistinguibles de la `_8gen2`, aunque tarda aproximadamente 2.6 veces más.

## Requisitos de hardware

- Variante `_8gen2`: requiere un Snapdragon 8 Gen 2 o superior (dsp_arch v73, socModel 43) y 8 MB de VTCM. Ejemplos válidos incluyen el S25 Ultra.
- Variante `_min`: requiere dsp_arch v68 y 2 MB de VTCM, lo que permite ejecutarse en una gama más amplia de HTP de Qualcomm.
- Advertencia importante: la VTCM no está implícita en la generación comercial del chip. Por ejemplo, el Snapdragon 8s Gen 3 (SM8635) es más nuevo que un 8 Gen 2 pero carece de 8 MB de VTCM.
- Requisito obligatorio de ejecución fp16: ambas variantes llevan la marca `contextBlobVersion 4.0.4` e incluyen un requisito de ejecución fp16. Si el dispositivo no soporta esta característica, el modelo se rechaza al cargar con el error `Request feature fp16 enable with value 1 unsupported`. Esto se ha reportado en el chip SM8735.
- Despliegue: los binarios QNN se ejecutan únicamente en la NPU (HTP), no en GPU o CPU. La integración de referencia es la aplicación DreamUI.
- Tamaño del repositorio: 6.5 GB (los archivos comprimidos pesan alrededor de 1 GB cada uno).

## Comparativa con modelos similares

| Modelo | Formato | Ejecucion | Inpainting | Compatibilidad | Licencia |
|---|---|---|---|---|---|
| AbsoluteReality Inpainting (QNN) | QNN / MNN | NPU Snapdragon | 9 canales real | 8 Gen 2+ (8 MB VTCM) o v68 (2 MB VTCM) | creativeml-openrail-m |
| DreamShaper Inpaint (QNN, mencionado en el README) | QNN | NPU Snapdragon | No especificado (comparte CLIP/VAE con otros) | No especificado | No disponible |
| Stable Diffusion Inpainting estándar | PyTorch / ONNX | GPU / CPU | Latent blending (limitado) | Hardware genérico | creativeml-openrail-m |

La comparativa se basa en las notas del autor: AbsoluteReality y DreamShaper pertenecen a familias de checkpoints distintas, por lo que no pueden compartir CLIP ni VAE sin degradar la calidad. La principal ventaja frente a una implementación estándar de Stable Diffusion es la ejecución en NPU y el inpainting real de 9 canales, que supera las limitaciones del latent blending.

## Limitaciones y advertencias

- Requiere hardware Qualcomm con soporte HTP y QNN; no funciona en GPU, CPU ni en dispositivos de otros fabricantes.
- El requisito de ejecución fp16 es innegociable y provoca fallos de carga en dispositivos que no lo soporten (por ejemplo, SM8735), independientemente de la variante elegida.
- La VTCM no se deduce de la generación comercial del chip: un Snapdragon 8s Gen 3 puede carecer de los 8 MB necesarios para la variante `_8gen2`.
- La variante `_min` está limitada a la resolución 512x512; no incluye los parches para 512x768 ni 768x512.
- El modelo se ejecuta únicamente hacia adelante (forward only), sin soporte para entrenamiento o fine-tuning en el dispositivo.
- Licencia creativeml-openrail-m: permite uso comercial, pero prohíbe usos ilegales o dañinos y no ofrece garantías. Es recomendable revisar los términos completos antes de integrarlo en un producto.
- No se dispone de información sobre sesgos del modelo, riesgos de alucinación visual o limitaciones idiomáticas, ya que el autor no las documenta en la ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AbrahamPJ/absolutereality-inpainting-qnn
- Aplicacion DreamUI (GitHub): https://github.com/AbrahamPaulJ/dreamui
- Modelo base (Lykon/absolute-reality-1.6525-inpainting): https://huggingface.co/Lykon/absolute-reality-1.6525-inpainting
