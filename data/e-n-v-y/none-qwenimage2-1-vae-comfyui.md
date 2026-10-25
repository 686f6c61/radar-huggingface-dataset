# e-n-v-y/None-qwenimage2.1-vae-comfyui

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una conversión al formato ComfyUI del VAE `None-qwenimage2.1-vae`, un ajuste fino del decodificador de Qwen Image 2.1. Lo publica el usuario e-n-v-y y su aportación técnica es el cambio de nomenclatura de parámetros de Diffusers al layout WanVAE que espera ComfyUI, además de la traducción al inglés de la model card original. El checkpoint convertido corresponde al paso 750 del entrenamiento realizado por None1082 sobre `madebyollin/texture-fix-vae-for-qwen-image-2.1`.

El problema que aborda es un artefacto concreto de la decodificación: la rejilla periódica de 8 píxeles (horizontal y vertical) y el patrón diagonal de 4 píxeles que aparecen en texturas finas como el pelaje. Según la model card, ambos patrones se originan en las primeras SiLU de `up_blocks.2` y `up_blocks.3` del decodificador. El ajuste de 750 pasos reduce la rejilla sin deteriorar el detalle, mientras que el paso 1000, descartado, volvía a hacerla visible y rompía una de las imágenes de muestra.

Es relevante para quien genere imágenes con Qwen Image 2.1 en ComfyUI y necesite texturas más limpias sin reentrenar nada: se instala como un VAE más y se carga con **Load VAE**. Conviene tener en cuenta que es un experimento de la comunidad, que el propio conversor no evaluó la calidad en GPU y que la licencia es la Qwen Research License Agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder latente (VAE) para Qwen Image 2.1; clase Diffusers `AutoencoderKLQwenImage21`, convertido al layout WanVAE de ComfyUI |
| Parametros totales | no disponible (el checkpoint contiene 238 tensores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye únicamente FP32, sin cuantización |
| Idiomas soportados | no aplica (modelo de visión, no de texto) |
| Licencia | `qwen-research` (Qwen Research License Agreement); etiquetada como `other` en HuggingFace |
| Formato de pesos | safetensors (FP32, layout ComfyUI/WanVAE) |
| Canales latentes | 64 |
| Canales de salida | 4 (RGBA) |
| Compresión espacial | 16x |
| Checkpoint | paso 750 del ajuste sobre Texture-Fix |
| Tamaño del repositorio | 1,4 GB |
| SHA256 convertido | `b292a4b7ff650212d9f68c934cd25b152a423cb1638712f8597234d09169631c` |
| SHA256 de origen | `ac06699880139dcdcf3375213ce3d80f743dc0cad31746fc1955ad275e8ec8ee` |
| Revision de origen | `cc3e2a52473cdbc70d7dded664d2f3e1a58eabc0` |

## Arquitectura y entrenamiento

La arquitectura es la del decodificador de Qwen Image 2.1: un autoencoder latente con 64 canales de entrada, 4 canales de salida en RGBA y un factor de compresión espacial de 16x. La conversión no altera la arquitectura ni los pesos: se renombraron los parámetros de Diffusers al layout WanVAE de ComfyUI y se insertaron dimensiones temporales singleton en las convoluciones correspondientes. Los 238 tensores conservan sus valores FP32 originales, sin cuantización ni entrenamiento adicional. La verificación local incluyó carga estricta del state-dict (todas las claves coinciden), codificación y decodificación en CPU FP32 de una imagen RGBA de 32x32 con salidas finitas, y coincidencia exacta tensor a tensor con el fichero de origen.

El entrenamiento documentado es un experimento de comunidad sobre el decodificador. El punto de partida es `madebyollin/texture-fix-vae-for-qwen-image-2.1`, a su vez un ajuste no oficial de Qwen Image 2.1, y se entrenaron solo las etapas `up_blocks.2` y `up_blocks.3` durante 750 pasos, con una función de pérdida fotográfica más fuerte y la restricción de mantener la nitidez igual o superior a Texture-Fix. Un intento previo de 5000 pasos desde los pesos oficiales no eliminó la rejilla de 8 píxeles, y debilitar la pérdida fotográfica provocaba deriva de contenido. En el paso 750 la rejilla se atenúa y el pelaje se conserva; la SiLU sigue imprimiendo el patrón, pero las convoluciones posteriores lo mantienen fuera del RGB. No se modificó la implementación del decodificador de producción.

## Capacidades

- Codificación y decodificación de imágenes RGB/RGBA hacia y desde un espacio latente de 64 canales, con compresión espacial 16x.
- Sustitución directa del VAE en flujos de trabajo de Qwen Image 2.1 dentro de ComfyUI, mediante el nodo **Load VAE**.
- Reducción de artefactos periódicos en texturas de alta frecuencia: atenuación de la rejilla de 8 píxeles y del patrón diagonal de 4 píxeles descritos en la model card.
- Salida en RGBA, lo que permite conservar canal alfa en el proceso de decodificación.
- Compatibilidad con los pesos originales de Diffusers: el repositorio incluye instrucciones para cargar el modelo de origen con `AutoencoderKLQwenImage21`.
- No soporta tool calling ni function calling: no es un modelo generativo de texto.
- No soporta agentes, razonamiento multi-paso ni modo *thinking*.
- No tiene capacidades multilingües, de audio ni de vídeo.
- No incorpora cuantizaciones GGUF, int8 ni fp16 publicadas por el autor.

## Casos de uso

- **Generación de imágenes fotorrealistas de animales y materiales textiles con Qwen Image 2.1**: el ajuste ataca específicamente el patrón reticulado que aparece en el pelaje, por lo que mejora la percepción de detalle en primeros planos sin cambiar el resto del pipeline.
- **Sustitución del VAE en workflows existentes de ComfyUI**: al estar en layout WanVAE, se copia en `ComfyUI/models/vae/` y se selecciona en **Load VAE**, sin tocar el grafo de generación ni los nodos de muestreo.
- **Investigación sobre artefactos de decodificación**: sirve como caso de estudio reproducible de cómo un patrón periódico se origina en las activaciones SiLU de etapas concretas del decodificador y puede suprimirse entrenando solo esas etapas.
- **Comparativas A/B de decodificadores**: la model card documenta la comparación cualitativa entre el decodificador oficial, Texture-Fix y los pasos 750 y 1000 sobre el mismo latente, lo que facilita replicar la evaluación con otras semillas.
- **Pipelines de img2img y upscaling**: al compartir espacio latente de 64 canales y compresión 16x con el VAE de Qwen Image 2.1, puede integrarse en etapas de refinado y escalado donde el detalle fino importa.
- **Entrenamiento de LoRAs o ajustes sobre Qwen Image 2.1**: usar un decodificador con menos artefactos reduce el ruido introducido en la fase de decodificación al evaluar visualmente los resultados intermedios.
- **Auditoría de conversiones Diffusers a ComfyUI**: el repositorio documenta hashes SHA256 de origen y destino y un procedimiento de verificación tensor a tensor, útil como plantilla para conversiones similares.
- **Despliegue en entornos con poco espacio**: el fichero completo ocupa 1,4 GB en FP32, lo que permite tener varias variantes de VAE disponibles en disco en una sola máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La model card solo aporta una comparación visual cualitativa sobre el mismo latente y la misma imagen de prueba:

| Decodificador | Rejilla de 8 px | Patron diagonal de 4 px | Nitidez del pelaje | Observaciones |
|---|---|---|---|---|
| Decodificador oficial de Qwen Image 2.1 | Presente, con trama horizontal y vertical | Presente | Suavizada | Referencia de partida |
| Texture-Fix (madebyollin) | Persiste | No documentado | Mayor que el oficial | Suprime el patrón de parpadeo más fino |
| Este checkpoint (paso 750) | Atenuada | No documentado | Igual o superior a Texture-Fix | Checkpoint publicado |
| Paso 1000 (descartado) | Más visible que en el paso 750 | No documentado | No documentada | Una imagen de muestra se rompe |

No hay valores de PSNR, SSIM, FID ni métricas de velocidad de inferencia en la información proporcionada.

## Requisitos de hardware

- Los pesos en FP32 ocupan 1,4 GB; el espacio en disco es equivalente al tamaño del repositorio.
- La VRAM necesaria para inferencia no está documentada. Como referencia, los pesos en FP32 rondan 1,4 GB y el consumo adicional depende de la resolución latente y de si ComfyUI usa decodificación por tiles; a resoluciones altas el pico de memoria puede crecer de forma notable.
- Es previsible que quepa en GPU de consumo con 8-12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090), aunque no hay mediciones publicadas que lo confirmen.
- En GPU de datacenter (A100, H100, L40S) el factor limitante no será la memoria sino el rendimiento del resto del pipeline de difusión.
- Opciones de despliegue: ComfyUI con **Load VAE** y los nodos de decodificación estándar; también carga en Diffusers mediante `AutoencoderKLQwenImage21` y `safetensors.torch.load_file` siguiendo las instrucciones del README original.
- Requisito explícito: la instalación de ComfyUI debe soportar el VAE de Qwen Image 2.1.
- Latencia y throughput: no disponibles. La única prueba publicada es una codificación/decodificación en CPU FP32 de una imagen RGBA de 32x32, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Canales latentes | Compresion espacial | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `e-n-v-y/None-qwenimage2.1-vae-comfyui` (este) | VAE Qwen Image 2.1, paso 750, conversion ComfyUI | 64 | 16x | safetensors FP32 (WanVAE) | qwen-research | HuggingFace, 1,4 GB, 0 descargas, 14 likes |
| `None1082/None-qwenimage2.1-vae` | VAE original del ajuste | 64 | 16x | safetensors (Diffusers) | qwen-research | HuggingFace |
| `madebyollin/texture-fix-vae-for-qwen-image-2.1` | VAE de Qwen Image 2.1 ajustado para texturas | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| VAE oficial de `Qwen/Qwen-Image-2.1` | VAE de referencia | 64 (segun la conversion) | 16x (segun la conversion) | no disponible | Qwen Research License Agreement | HuggingFace |

Los datos de parámetros totales y de rendimiento del VAE oficial y de Texture-Fix no aparecen en la información disponible, por lo que la comparación se limita a arquitectura, formato y licencia.

## Limitaciones y advertencias

- La licencia es la Qwen Research License Agreement, etiquetada como `other` en HuggingFace. El texto no se detalla en la información disponible, por lo que debe revisarse el fichero `LICENSE` antes de cualquier uso comercial.
- El conversor no evaluó la ejecución en GPU ni la calidad de generación: la verificación se limita a carga del state-dict y a una codificación/decodificación en CPU de una imagen de 32x32. El rendimiento real en producción no está validado por el autor de la conversión.
- Es un experimento de comunidad, no un artefacto oficial de Qwen. La propia model card indica que la implementación del decodificador de producción no se modificó y que el ajuste se hizo solo sobre dos etapas.
- Solo se publica el checkpoint del paso 750. El paso 1000 se descartó porque una imagen de muestra se rompía y la rejilla reaparecía, lo que sugiere un margen de entrenamiento estrecho.
- El ajuste se validó con imágenes de zorro y texturas de pelaje; no hay evidencia publicada sobre su comportamiento en otros tipos de contenido (rostros, texto, arquitectura, ilustración plana).
- El repositorio tiene 0 descargas y 14 likes, y los metadatos usan marcadores `None` en el nombre del modelo y del autor original, lo que puede complicar la trazabilidad y la búsqueda.
- El identificador del autor original aparece como "None1082" en la model card pero los enlaces apuntan a rutas con `None`; conviene verificar la ruta real antes de automatizar descargas.
- No se ofrecen cuantizaciones ni variantes fp16; quien necesite menor huella de memoria deberá convertirlas por su cuenta.
- Al ser un VAE, no genera texto, no razona y no soporta herramientas; cualquier expectativa en ese sentido es un error de categoría.
- La búsqueda web realizada no aportó información adicional sobre el modelo: los resultados obtenidos trataban sobre diacríticos del francés y no guardan relación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/e-n-v-y/None-qwenimage2.1-vae-comfyui
- Modelo base del ajuste: https://huggingface.co/None1082/None-qwenimage2.1-vae
- README original del autor del ajuste: https://huggingface.co/None1082/None-qwenimage2.1-vae/blob/cc3e2a52473cdbc70d7dded664d2f3e1a58eabc0/README.md
- VAE Texture-Fix de madebyollin: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-2.1
- Modelo base Qwen Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Código de entrenamiento del experimento: https://github.com/None9527/qwenimage2.1-vae-8px-grid
- Ficheros de licencia y atribución incluidos en el repositorio: `LICENSE` y `NOTICE`
