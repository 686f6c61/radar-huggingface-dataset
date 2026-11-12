# moonbox-ai/Moebius-MLX

## Resumen

Moebius-MLX es la conversión a formato MLX del modelo Moebius, un framework ligero de inpainting de imágenes desarrollado originalmente por hustvl y portado a Apple Silicon por moonbox-ai. El modelo resuelve tareas de eliminación de objetos y relleno de imágenes (image-to-image) con un UNet de aproximadamente 0,22 mil millones de parámetros que, según sus autores, alcanza un rendimiento comparable a modelos de 10B en la tarea de inpainting. Esta conversión permite ejecutar el modelo de forma nativa en Macs con chip Apple Silicon mediante el framework MLX de Apple.

El repositorio no contiene el modelo completo, sino únicamente los pesos convertidos del UNet, el VAE (procedente de PixelHacker) y los embeddings temporales, organizados en carpetas por precisión: bf16, fp16, 8bit, 6bit y 4bit. El resto del pipeline (tokenizador, scheduler, lógica de inferencia) debe obtenerse del repositorio original o del motor de inferencia de Moonbox, que no forma parte de este repositorio.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada y optimizada para hardware de Apple, con métricas de fidelidad publicadas frente al modelo original en float32. Se trata de un modelo especializado en una única tarea (inpainting/eliminación de objetos) y no de un modelo de propósito general, por lo que su evaluación debe hacerse en ese contexto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet (difusión) con VAE de PixelHacker; conversión MLX |
| Parametros totales | ~0,22 B (UNet); tamaño total del repo 2,6 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, resolución 512x512) |
| Tipos de cuantizacion | bf16, fp16, 8bit, 6bit, 4bit (cuantización afín MLX, grupo 64) |
| Idiomas soportados | no disponible (modelo de imagen, sin componente textual) |
| Licencia | MIT (según metadatos de HF); la model card indica Apache-2.0 para los archivos derivados |
| Formato de pesos | safetensors (UNet y VAE) y npz (temb) |

## Arquitectura y entrenamiento

El modelo base Moebius es un framework de inpainting basado en difusión que combina un UNet de aproximadamente 0,22B parámetros con un VAE procedente de PixelHacker. La conversión a MLX pliega las BatchNorm, las affines de normalización y el condicionamiento constante dentro de los pesos, y almacena las convoluciones 1x1 y las proyecciones de atención como matrices `[in, out]`. En las carpetas cuantizadas (8bit, 6bit, 4bit) se aplica cuantización afín de MLX con tamaño de grupo 64, mientras que las capas que MLX no puede cuantizar (convoluciones y normas) permanecen en bf16.

El pipeline de inferencia utiliza disposición NHWC, resolución de 512x512, 20 pasos de muestreo DDIM y CFG 2, siguiendo la configuración del README original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card proporcionada no detalla el proceso de entrenamiento del modelo original. La innovación técnica destacable es la propia conversión a MLX con verificación de fidelidad frente al modelo en float32 mediante PSNR y LPIPS.

## Capacidades

- Inpainting de imágenes: relleno de regiones enmascaradas con contenido coherente con el contexto.
- Eliminación de objetos: sustitución del sujeto principal de una fotografía por contenido generado.
- Image-to-image: transformación condicionada por una máscara y una imagen de entrada.
- Ejecución nativa en Apple Silicon mediante MLX.
- Múltiples precisiones de ejecución (bf16, fp16, 8bit, 6bit, 4bit) con distinto equilibrio calidad/rendimiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de la imagen.

## Casos de uso

- Eliminación de objetos en fotografías de producto: se enmascara el objeto no deseado y el modelo rellena la región con el fondo circundante; adecuado por su especialización en object-removal y su resolución de 512x512.
- Limpieza de imágenes de archivo y patrimonio: retirada de marcas, logotipos o elementos sobreimpresos en digitalizaciones, usando la máscara correspondiente y el pipeline de 20 pasos DDIM.
- Edición rápida en flujos de trabajo locales en Mac: al ejecutarse con MLX en Apple Silicon (aproximadamente 4-5 s por inpainting en un M5), permite iterar sin conexión ni GPU dedicada.
- Preprocesado de datasets de visión: eliminación de sujetos o artefactos en imágenes de entrenamiento antes de reutilizarlas en otros pipelines, gracias a la precisión fp16 (PSNR 41,0 dB frente a float32).
- Prototipado de herramientas de retoque fotográfico: integración en aplicaciones de escritorio para Mac que necesiten inpainting ligero sin depender de servicios en la nube.
- Evaluación de técnicas de cuantización: el repositorio publica métricas PSNR y LPIPS por precisión, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de la cuantización afín de MLX en modelos de difusión.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de fidelidad de cada conversión frente a los pesos en float32, medidas sobre la eliminación del sujeto principal de 8 fotografías con semilla 0 y salida a 512 px (PSNR y LPIPS):

| Precision | Tamano | PSNR vs float32 (media / peor) | LPIPS (peor) | Estado |
|---|---|---|---|---|
| fp16 | 649 MB | 41,0 / 33,9 dB | 0,008 | pasa |
| bf16 | 649 MB | 32,2 / 27,2 dB | 0,050 | pasa |
| 8bit | 495 MB | 37,4 / 33,0 dB | 0,022 | pasa |
| 6bit | 453 MB | 32,9 / 26,4 dB | 0,066 | pasa |
| 4bit | 412 MB | 22,4 / 16,7 dB | 0,380 | por debajo del umbral, experimental |

El criterio de aceptación es LPIPS ≤ 0,15 en todas las imágenes. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM/unified memory estimada: entre 412 MB (4bit) y 649 MB (fp16/bf16) para los pesos; el consumo real depende del motor de inferencia y del tamaño de lote.
- Hardware objetivo: Apple Silicon (el autor reporta aproximadamente 4-5 s por inpainting de 20 pasos a 512 px en un Apple M5).
- GPU dedicadas (A100, H100, RTX 4090): no soportadas de forma nativa por esta conversión, que está pensada para MLX; para CUDA habría que usar el modelo original en PyTorch.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- Opciones de despliegue: motor de inferencia MLX de Moonbox (`moebius_od/mlx_unet.py` y `mlx_vae.py`), que no forma parte de este repositorio; el pipeline original de PyTorch para otras plataformas.
- Latencia y throughput: aproximadamente 4-5 s por inpainting en Apple M5 (20 pasos, 512 px); no se dispone de datos de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Moebius-MLX | ~0,22 B (UNet) | 512x512, 20 pasos DDIM | MIT / Apache-2.0 | Hugging Face (MLX) | Conversión para Apple Silicon, métricas de fidelidad publicadas |
| Moebius (original, hustvl) | ~0,22 B (UNet) | 512x512 | Apache-2.0 | Hugging Face (PyTorch) | Modelo base; requiere pipeline PyTorch |
| PixelHacker (VAE) | no disponible | no disponible | no disponible | no disponible | Componente VAE reutilizado por Moebius; no es un modelo de inpainting completo |

No se dispone de información suficiente para comparar con otros modelos de inpainting de la misma categoría (por ejemplo, variantes de Stable Diffusion Inpainting) en términos de parámetros, contexto o rendimiento, por lo que esa comparación se indica como no disponible.

## Limitaciones y advertencias

- El repositorio no incluye el pipeline completo de inferencia; requiere el motor de Moonbox o el código original, lo que añade complejidad de integración.
- La cuantización a 4bit queda por debajo del umbral de calidad (LPIPS 0,380) y se marca como experimental; no es recomendable para producción.
- El modelo está especializado en inpainting y eliminación de objetos; no sirve para generación de texto, código, razonamiento ni otras tareas.
- Resolución fija de 512x512 en la configuración documentada; no se indica soporte para resoluciones superiores.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre tasas de alucinación visual (contenido generado incoherente con el contexto).
- La licencia presenta ambigüedad: los metadatos de Hugging Face indican MIT, mientras que la model card menciona Apache-2.0 para los archivos derivados; conviene verificar antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No se dispone de información sobre idiomas ni sobre el proceso de entrenamiento del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/Moebius-MLX
- Modelo base original: https://huggingface.co/hustvl/Moebius
- Paper referenciado (arXiv:2606.19195): https://arxiv.org/abs/2606.19195
- Página del proyecto original: no disponible (la model card solo incluye el inicio de la URL)
