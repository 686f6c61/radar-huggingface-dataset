# molbal/miniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes desarrollado por MiniMaxAI, distribuido en este repositorio por el usuario molbal en formato GGUF cuantizado para su uso en ComfyUI. El modelo es capaz de generar imágenes a partir de texto y de editar una o varias imágenes de referencia con el mismo checkpoint, lo que lo convierte en una herramienta versátil para flujos de trabajo de difusión tanto generativos como de edición.

El modelo cuenta con 20.113.670.232 parámetros (aproximadamente 20,1 mil millones) según los pesos en safetensors del modelo base. Utiliza el codificador de texto MiniMax H3, basado en Qwen3-VL, y está diseñado para renderizar imágenes de unos 16 megapíxeles en solo 6 pasos de muestreo sin classifier-free guidance (CFG = 1), lo que reduce drásticamente el coste computacional de la inferencia frente a modelos de difusión tradicionales que requieren decenas de pasos.

Este repositorio es relevante porque ofrece cuantizaciones GGUF (Q4_K_M y Q8_0) que permiten ejecutar un modelo de 20 mil millones de parámetros en hardware de consumo, integrado en ComfyUI mediante el nodo `UnetLoaderGGUFDynamicVRAM`. La licencia es la MiniMax H3 Image Community License Agreement, que impone restricciones para uso comercial a gran escala y para servicios alojados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto-a-imagen y edición de imágenes (detalles internos no disponibles) |
| Parámetros totales | 20.113.670.232 (según safetensors del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (13,4 GiB), Q8_0 (20,7 GiB) en formato GGUF |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Image Community License Agreement |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo de difusión (si es un transformer de difusión, un UNet o un híbrido). Lo que sí se especifica es que emplea el codificador de texto MiniMax H3, basado en Qwen3-VL, para procesar las indicaciones textuales. El modelo opera con un muestreador SamplerLCM con `s_noise` que decae de 1,1 a 0,9, un scheduler simple y 6 pasos de muestreo sin rama de guiado (CFG = 1), lo que sugiere el uso de técnicas de destilación o consistencia para reducir el número de pasos necesarios.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El modelo base está publicado por MiniMaxAI bajo la referencia `MiniMaxAI/MiniMax-H3-Image`, y este repositorio se limita a ofrecer cuantizaciones GGUF del mismo.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de salida configurable entre aproximadamente 4 MP y 20 MP, con 16 MP como punto óptimo.
- Edición de imágenes: acepta una o varias imágenes de referencia y las modifica según la indicación textual, refiriéndose a ellas como `<Picture 1>`, `<Picture 2>`, etc.
- Renderizado en 6 pasos de muestreo sin classifier-free guidance, lo que reduce el coste de inferencia.
- Soporte de resoluciones comunes: 4096 x 4096 (1:1), 4736 x 3552 (4:3), 5472 x 3072 (16:9) y 3552 x 4736 (3:4).
- Mejor rendimiento con indicaciones largas y descriptivas (sujeto, vestimenta, lugar, iluminación, encuadre), incluyendo términos fotográficos para obtener aspecto realista.
- Integración con ComfyUI mediante el nodo `UnetLoaderGGUFDynamicVRAM` del paquete `comfyui-gguf-reboot`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- Generación de imágenes de alta resolución para producción editorial: el modelo puede crear imágenes de 16 MP (por ejemplo, 4096 x 4096) en 6 pasos, adecuadas para impresión o web de alta calidad, con indicaciones detalladas que describan iluminación y encuadre.
- Edición de fotografías de producto: usando una imagen de referencia (`<Picture 1>`) y una indicación textual, se pueden cambiar fondos, ajustar iluminación o modificar elementos del producto sin reentrenar el modelo.
- Creación de material para redes sociales y marketing: con resoluciones 16:9 (5472 x 3072) y 4:3 (4736 x 3552), el modelo genera banners y creatividades adaptadas a distintos formatos en un solo paso de muestreo rápido.
- Prototipado de conceptos visuales en estudios de diseño: la generación en 6 pasos permite iterar rápidamente sobre variaciones de una idea, usando indicaciones largas para controlar estilo y composición.
- Edición multi-referencia para composición: al aceptar varias imágenes de referencia, se pueden combinar elementos de distintas fuentes (por ejemplo, un sujeto de una imagen y un fondo de otra) en una sola salida coherente.
- Flujos de trabajo en ComfyUI para artistas técnicos: la integración mediante GGUF y el nodo de VRAM dinámica permite desplegar el modelo en estaciones de trabajo con GPU de consumo, incorporándolo a pipelines de generación por lotes.
- Restauración o variación de imágenes existentes: el modo de edición permite tomar una imagen de referencia y generar variaciones manteniendo la identidad del sujeto, útil para catálogos o series visuales consistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M ocupa 13,4 GiB y la Q8_0 20,7 GiB en disco; a ello hay que sumar la VRAM del codificador de texto (Qwen3-VL 32B en NVFP4 o INT8) y del VAE de imagen, por lo que se requiere margen adicional de VRAM.
- GPU recomendadas: el codificador de texto NVFP4 (`qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`) funciona de forma nativa en tarjetas RTX 50-series; en otras GPU se debe usar la variante INT8 (`qwen3vl_32b_minimax_h3_int8_convrot.safetensors`).
- ¿Cabe en GPU de consumo? La cuantización Q4_K_M (13,4 GiB) es la opción para VRAM ajustada, pero el conjunto modelo + codificador de texto + VAE probablemente supera los 24 GB de las RTX 4090, por lo que se recomienda el nodo `UnetLoaderGGUFDynamicVRAM` para gestionar la VRAM de forma dinámica.
- Opciones de despliegue: ComfyUI con el paquete `comfyui-gguf-reboot` y el nodo `UnetLoaderGGUFDynamicVRAM`; se requieren además el codificador de texto y el VAE en las carpetas `models/text_encoders/` y `models/vae/` respectivamente.
- Latencia y throughput: no disponibles; el modelo está diseñado para 6 pasos de muestreo, lo que reduce el tiempo frente a modelos de 20-50 pasos, pero no se publican cifras concretas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo generativo entrenado con datos a gran escala, es probable que herede sesgos de sus datos de entrenamiento.
- Riesgo de alucinación visual: no cuantificado; los modelos de difusión pueden generar elementos incoherentes o no solicitados, especialmente con indicaciones ambiguas o cortas.
- Limitaciones de contexto o idioma: no se especifican los idiomas soportados; el codificador de texto basado en Qwen3-VL sugiere capacidad multilingüe, pero no se confirma.
- Restricciones de licencia: la MiniMax H3 Image Community License Agreement exige aprobación escrita por parte de MiniMax si los ingresos anuales superan 1 millón de USD o si se ofrece el modelo como servicio alojado a terceros. Es una licencia distinta de la de MiniMax H3.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria extensa; conviene verificar la calidad de las cuantizaciones antes de usarlas en entornos críticos.
- Dependencia de componentes externos: requiere descargar el codificador de texto y el VAE desde repositorios de Comfy-Org, y el nodo de carga GGUF de un paquete de terceros (`comfyui-gguf-reboot`), lo que añade puntos de fallo en la cadena de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/molbal/miniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Cuantización Q4_K_M: https://huggingface.co/molbal/miniMax-H3-Image-GGUF/blob/main/minimax_h3_image-Q4_K_M.gguf
- Cuantización Q8_0: https://huggingface.co/molbal/miniMax-H3-Image-GGUF/blob/main/minimax_h3_image-Q8_0.gguf
- Codificador de texto NVFP4: https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors
- Codificador de texto INT8: https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_int8_convrot.safetensors
- VAE de imagen: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/resolve/main/vae/minimax_h3_image_vae_fp16.safetensors
- Nodo ComfyUI GGUF: https://registry.comfy.org/publishers/molbal/nodes/comfyui-gguf-reboot
- Workflow texto-a-imagen: workflows/minimax_h3_image_t2i-gguf.json (en el repositorio)
- Workflow de edición de imagen: workflows/minimax_h3_image_edit-gguf.json (en el repositorio)
