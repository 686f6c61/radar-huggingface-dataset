# litert-community/Idol

## Resumen

Idol es un modelo de imagen a 3D (image-to-3D) que convierte una sola fotografía de un objeto en un Gaussian splat tridimensional, incluyendo las caras que la imagen original nunca mostró. El modelo original lo desarrolla speridlabs y esta versión concreta la publica la comunidad litert-community como grafos LiteRT (formato `.tflite`) para su ejecución on-device en Android mediante `CompiledModel`, empleando la GPU del teléfono.

La ficha corresponde a una conversión cuantizada del modelo base `speridlabs/idol`, que incorpora el LoRA `speridlabs/idol-turbo` (5 pasos de denoising, sin guidance). El paquete incluye el denoiser, los decodificadores de octree y gaussiano, el encoder VAE de FLUX.2 y el eliminador de fondo BiRefNet; el encoder de imágenes DINOv3 se distribuye aparte en un repositorio con acceso restringido y licencia propia.

Su relevancia radica en que demuestra la viabilidad de generar representaciones 3D de alta fidelidad íntegramente en un smartphone, sin conexión a la nube: en un Galaxy S26 produce un splat de 65.536 gaussianas en 158 s (primer procesamiento tras arrancar, teléfono frío) y de 262.144 gaussianas en 267 s con la variante `262k/`. El repositorio ocupa 6,1 GB y se publica bajo licencia Apache 2.0, aunque el encoder DINOv3 gated condiciona el uso completo del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-red: denoiser (difusion) con LoRA idol-turbo, decodificador de octree, decodificador gaussiano, encoder VAE FLUX.2, eliminador de fondo BiRefNet y encoder DINOv3 (repo aparte) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a 3D, no de texto) |
| Tipos de cuantizacion | FP16 en GPU; FP16 con acumulacion fp32 en la variante `262k/`; int8 probado pero no ejecutable en las GPU de los telefonos probados |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 (el encoder DINOv3 tiene licencia propia y acceso restringido) |
| Formato de pesos | LiteRT (`.tflite`), grafos para `CompiledModel`; salida en `.ply` |
| Resolucion de entrada | 1.024 x 1.024 (la variante 512 x 512 queda por debajo del umbral de calidad de 25 dB PSNR) |
| Salida | Gaussian splat de 65.536 gaussianas (2.048 anchors) por defecto; 262.144 gaussianas (8.192 anchors) en `262k/` |
| Pasos de denoising | 5, sin guidance (LoRA idol-turbo) |
| Tamano del repositorio | 6,1 GB |

## Arquitectura y entrenamiento

El pipeline es una cadena de redes independientes convertidas a grafos LiteRT. La imagen de entrada pasa primero por BiRefNet (ejecutado en CPU) para eliminar el fondo, después por el encoder DINOv3 (ViT-H/16+, en repositorio gated separado) y por el encoder VAE de FLUX.2, que proyectan la imagen a un espacio latente. Sobre ese latente opera el denoiser de difusión con el LoRA idol-turbo en 5 pasos y sin classifier-free guidance, seguido de un decodificador de octree que estructura la geometría y un decodificador gaussiano que emite las gaussianas finales, escritas a disco como `.ply`.

La innovación técnica principal es la compilación on-device: en la variante por defecto, los bloques 1–22 del denoiser comparten un único grafo y los seis grafos intermedios del decodificador gaussiano comparten otro, de modo que la app copia los pesos de cada bloque antes de la llamada y solo compila una vez por foto (19 grafos compilados durante el primer procesamiento, 20 s). La variante `262k/` usa un grafo por bloque y precisión FP16 con acumulación fp32, lo que mejora la fidelidad (41,4–46,6 dB PSNR frente a 32,3–34,4 dB) a costa de velocidad. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación del modelo original.

## Capacidades

- Generación de representaciones 3D en formato Gaussian splat a partir de una única fotografía de un objeto.
- Inferencia de geometría no observada: completa las caras laterales y traseras del objeto que la foto no muestra.
- Ejecución íntegra on-device en Android mediante LiteRT `CompiledModel`, sin conexión a la nube.
- Aceleración por GPU del teléfono en FP16 para denoiser, encoders y decodificadores; BiRefNet en CPU.
- Eliminación automática de fondo integrada (BiRefNet) antes del pipeline 3D.
- Dos modos de calidad/coste configurables: 65.536 gaussianas (rápido) y 262.144 gaussianas (mayor fidelidad).
- Salida exportable a `.ply`, compatible con visores y herramientas de Gaussian splatting.
- No soporta tool calling, agentes, texto, visión general ni audio: es un modelo especializado de imagen a 3D.

## Casos de uso

- Digitalización de productos para comercio electrónico: un vendedor fotografía un objeto con el móvil y obtiene un splat 3D navegable para la ficha de producto, sin estudio ni infraestructura de servidor; el tiempo de 158 s en un Galaxy S26 es aceptable para un flujo asíncrono.
- Catalogación de patrimonio y arqueología de campo: los investigadores generan modelos 3D de piezas in situ desde una sola foto, con la ventaja de que el proceso ocurre en el dispositivo y no requiere subir imágenes a servicios externos.
- Creación de assets para videojuegos y realidad aumentada: artistas técnicos convierten referencias fotográficas en splats base que después retocan en herramientas de edición 3D, usando la variante `262k/` cuando prima la fidelidad (41,4–46,6 dB PSNR).
- Aplicaciones móviles de captura 3D para consumidor: integración del sample Android en apps de fotografía o modelado, aprovechando que el pipeline completo cabe en un teléfono con 5,42 GiB de memoria residente máxima y 5,73 GiB de memoria GPU máxima.
- Prototipado rápido en realidad mixta: generar representaciones 3D de objetos físicos para anclarlas en escenas AR desde el propio visor o móvil, sin backend.
- Educación y demostraciones técnicas: el repositorio incluye un runner en Python y una app Android de ejemplo que sirven para ilustrar pipelines de difusión y Gaussian splatting on-device en cursos y talleres.
- Archivado de colecciones personales: fotografía única de objetos domésticos para crear un catálogo 3D navegable, con la ventaja de que la inferencia no requiere cuentas ni cuotas de API.

## Benchmarks y rendimiento

Los datos publicados son de latencia y fidelidad, no de benchmarks académicos estándar.

| Metrica (Galaxy S26, SM-S942Q, LiteRT 2.3.0) | Forma por defecto | Forma `262k/` |
|---|---|---|
| Foto a `.ply` (primer procesamiento, teléfono frío) | 158 s | 267 s |
| Foto a `.ply` (teléfono caliente, estado térmico 3) | 329–351 s | 339–449 s |
| PSNR de render 4 vistas frente a la salida por defecto del autor (umbral 25 dB) | 32,3–34,4 dB | 41,4–46,6 dB |
| Gaussianas por splat | 65.536 (2.048 anchors) | 262.144 (8.192 anchors) |
| Precision GPU | FP16 | FP16 con acumulacion fp32 |

Desglose por etapa de la forma por defecto en el primer procesamiento: eliminación de fondo 7,4 s (CPU), encoder DINOv3 10,6 s, encoder VAE 5,2 s, denoiser 5 pasos 119,8 s, decodificador de octree 9,1 s, decodificador gaussiano 5,5 s, escritura PLY 0,1 s. Compilación de grafos: 1 grafo al arrancar (2 s) y 19 durante la foto (20 s). Memoria residente máxima 5,42 GiB; memoria GPU máxima 5,73 GiB. En Pixel 11 Pro el primer procesamiento tarda 343 s (forma por defecto).

## Requisitos de hardware

- Inferencia diseñada para GPU móvil Android; no se publican requisitos de VRAM para escritorio.
- Memoria residente máxima medida: 5,42 GiB (VmHWM) y 5,73 GiB de memoria GPU (kgsl) en Galaxy S26.
- Dispositivos validados: Samsung Galaxy S26 (SM-S942Q) y Google Pixel 11 Pro.
- No cabe en GPU de consumidor de escritorio en el sentido habitual: el formato es LiteRT para Android, no safetensors ni GGUF para PyTorch.
- El denoiser no compiló para la NPU del Galaxy S26; la ejecución en CPU sola resultó más lenta que en GPU.
- Los pesos int8 no se ejecutaron en las GPU de los teléfonos probados.
- Despliegue mediante LiteRT 2.3.0 y `CompiledModel`, con la app Android de ejemplo incluida en `android/` y un runner en Python para el mismo pipeline.
- El encoder DINOv3 requiere descarga aparte desde un repositorio gated con licencia propia.
- Latencia fuertemente dependiente del estado térmico: el reloj de GPU cae de 1.300 a 500 MHz durante la primera foto y a 222–282 MHz tras 12 minutos de ejecuciones consecutivas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| litert-community/Idol (esta ficha) | Imagen a 3D, on-device Android | no disponible | no aplica | Gaussian splat 65.536 / 262.144 | Apache 2.0 (DINOv3 aparte) | LiteRT `.tflite` en Hugging Face |
| speridlabs/idol | Imagen a 3D, PyTorch | no disponible | no aplica | Gaussian splat 262.144 por defecto | no disponible en la informacion | Hugging Face |
| speridlabs/idol-turbo | LoRA sobre idol | no disponible | no aplica | Gaussian splat | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de imagen a 3D en la información proporcionada; la única comparación publicada es interna, entre la forma por defecto y la forma `262k/` de este mismo repositorio.

## Limitaciones y advertencias

- Solo procesa una imagen de un objeto; no está pensado para escenas, personas ni entradas de vídeo.
- Fidelidad limitada en la forma por defecto: 32,3–34,4 dB PSNR frente a la salida del autor, por encima del umbral de 25 dB pero lejos de los 41,4–46,6 dB de `262k/`.
- Fuerte dependencia térmica: el rendimiento se degrada de 158 s a 329–351 s con el teléfono caliente, y la latencia puede más que duplicarse.
- A 512 x 512 la calidad cae por debajo del umbral (13,5–22,9 dB), por lo que la resolución de entrada debe ser 1.024 x 1.024.
- Los pesos int8 no se ejecutaron en las GPU probadas; la cuantización a int8 no es una opción viable en este despliegue.
- El denoiser no compiló para la NPU del Galaxy S26; la aceleración por NPU no está disponible.
- El encoder DINOv3 está en un repositorio gated con licencia propia, lo que condiciona la reproducibilidad completa del pipeline y el uso comercial.
- Licencia Apache 2.0 para el resto del paquete, pero la licencia del modelo base y del LoRA original no se detalla en la información disponible.
- Riesgo de geometría inventada en las caras no observadas: el modelo infiere las vistas ocultas y puede producir detalles plausibles pero incorrectos.
- Solo validado en dos dispositivos (Galaxy S26 y Pixel 11 Pro); el comportamiento en otros SoC no está documentado.
- No dispone de capacidades de texto, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Idol
- Modelo base: https://huggingface.co/speridlabs/idol
- LoRA turbo: https://huggingface.co/speridlabs/idol-turbo
- Encoder DINOv3 (gated): https://huggingface.co/litert-community/DINOv3-ViT-H16plus-Idol-LiteRT
- Model card de la primera release (commit e7ee1226): https://huggingface.co/litert-community/Idol/blob/e7ee12262a3ed622fa44fb8df8ff4f335dd77064/README.md
- Imagen de ejemplo (Pexels, Komet Flicker): https://www.pexels.com/photo/plant-in-silver-flowerpot-20324601/
