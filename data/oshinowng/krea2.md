# oshinoWng/krea2

## Resumen

Krea 2 es un modelo de generación de imágenes por difusión publicado por Krea, distribuido en dos variantes principales: `krea/Krea-2-Raw` y `krea/Krea-2-Turbo`. El repositorio analizado aquí, `oshinoWng/krea2`, no es el repositorio original del modelo, sino un reempaquetado de los pesos en formato de archivo único (`diffusion-single-file`) pensado para su uso directo en ComfyUI, junto con los LoRA de estilo oficiales y un LoRA adicional de referencia de estilo de Turbo.

El paquete incluye los pesos del modelo en varias precisiones (bf16, fp8 escalado, int8 con rotación de convoluciones, mxfp8 y nvfp4), el codificador de texto Qwen3-VL de 4B parámetros en bf16 y fp8 escalado, y el VAE de Qwen-Image. También incorpora diez LoRA con palabras de activación documentadas, orientados a estilos artísticos concretos (tinta monocroma, tramado puntillista, boceto infantil, acuarela art déco, tarot vintage, anime retro, entre otros).

La relevancia de este repositorio es práctica: simplifica el despliegue de Krea 2 en ComfyUI al proporcionar todos los ficheros en las carpetas esperadas por esa herramienta y en múltiples formatos de cuantización, lo que permite ajustar el consumo de VRAM al hardware disponible. La información publicada no incluye número de parámetros, arquitectura interna, datos de entrenamiento ni resultados de benchmarks, por lo que la mayoría de las especificaciones técnicas quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para generación de imágenes; la información proporcionada no especifica si es UNet o transformer/DiT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión, no autoregresivo) |
| Tipos de cuantizacion | bf16, fp8_scaled, int8_convrot, mxfp8, nvfp4 |
| Idiomas soportados | no disponible (el prompt textual se procesa mediante un codificador Qwen3-VL 4B; no se documentan idiomas) |
| Licencia | krea-2-community-license (`license: other`) |
| Formato de pesos | safetensors (archivo único, librería `diffusion-single-file`) |
| Variantes del modelo | Krea-2-Raw y Krea-2-Turbo |
| Codificador de texto | Qwen3-VL 4B (`qwen3vl_4b_bf16.safetensors`, `qwen3vl_4b_fp8_scaled.safetensors`) |
| VAE | `qwen_image_vae.safetensors` |
| LoRA incluidos | darkbrush, dotmatrix, kidsdrawing, neondrip, rainywindow, retroanime, softwatercolor, sunsetblur, vintagetarot, turbo style reference, turbo lora rank 64 |
| Tamano del repositorio | 146,6 GB (conjunto completo de ficheros) |
| Descargas / likes | 0 / 0 |
| Autor del reempaquetado | oshinoWng |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de Krea 2 en los materiales proporcionados. La model card del reempaquetado se limita a indicar que son ficheros reempaquetados para ComfyUI y a listar la estructura de carpetas, sin describir el tipo de red, el número de parámetros ni el mecanismo de atención. Los indicios indirectos que sí aparecen en los nombres de fichero son el uso de un codificador de texto Qwen3-VL 4B y de un VAE identificado como `qwen_image_vae`, lo que sugiere una línea de componentes compartida con la familia Qwen-Image, pero esto es una observación sobre los ficheros incluidos y no una confirmación de la arquitectura del modelo de difusión.

Tampoco hay datos sobre el entrenamiento: se desconoce el volumen de tokens o de pares imagen-texto utilizados, la composición del dataset, si hubo fases de ajuste por preferencias humanas (RLHF/DPO) o técnicas de refinamiento como destilación. La existencia de una variante Turbo y de un LoRA específico de Turbo con rango 64 apunta a un proceso de destilación o de ajuste para reducir el número de pasos de muestreo, pero el repositorio no documenta ni el número de pasos recomendado ni el método empleado.

En cuanto a innovaciones técnicas, lo único verificable en la información disponible es el conjunto de formatos de cuantización soportados, que incluye esquemas recientes orientados a hardware Blackwell y Hopper como `nvfp4` y `mxfp8`, además de `int8` con rotación de convoluciones. Estos formatos están pensados para reducir el uso de memoria y acelerar la inferencia en GPUs compatibles, pero no se documentan cifras de aceleración ni de pérdida de calidad asociada.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, en dos variantes de equilibrio calidad/velocidad (Raw y Turbo).
- Aplicación de estilos artísticos predefinidos mediante LoRA, cada uno con su palabra de activación y una fuerza recomendada de 1.0:
  - `monochrome ink wash style` (darkbrush)
  - `monochrome stippling style` (dotmatrix)
  - `naive expressive sketch style` (kidsdrawing)
  - `textured abstract style` (neondrip)
  - `rainy window style` (rainywindow)
  - `purple retro anime style` (retroanime)
  - `art deco watercolor style` (softwatercolor)
  - `ethereal motion blur style` (sunsetblur)
  - `vintage tarot style` (vintagetarot)
- Transferencia de estilo por referencia mediante el LoRA `krea2_turbo_style_reference` (publicado originalmente por el usuario ostris).
- Procesamiento del prompt mediante un codificador de texto multimodal Qwen3-VL 4B, que admite entrada de texto y, por la naturaleza de ese codificador, entrada visual; el repositorio no documenta flujos de trabajo de imagen a imagen ni de condicionamiento por imagen de referencia más allá de los LoRA.
- Compatibilidad con flujos de trabajo de ComfyUI mediante ficheros de archivo único, sin necesidad de scripts de carga personalizados.
- Selección de precisión según el hardware: bf16 para máxima fidelidad, fp8/int8 para un equilibrio intermedio, y mxfp8/nvfp4 para GPUs con soporte de formatos de baja precisión.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes, ya que no es un modelo de lenguaje.

## Casos de uso

- Generación de ilustraciones para publicaciones web: el modelo permite producir imágenes a partir de descripciones textuales, y la variante Turbo reduce el número de pasos necesarios, lo que resulta adecuado para generar material gráfico de forma iterativa durante la edición de un artículo.
- Aplicación de direcciones de arte consistentes en un catálogo: el LoRA `krea2_softwatercolor` con la palabra de activación `art deco watercolor style` y fuerza 1.0 permite generar series de imágenes con una estética homogénea para tiendas o portfolios.
- Prototipado de estilos para proyectos de animación o cómic: `krea2_retroanime` (`purple retro anime style`) y `krea2_darkbrush` (`monochrome ink wash style`) permiten explorar rápidamente líneas visuales distintas antes de encargar trabajo a ilustradores.
- Ilustración de libros infantiles: `krea2_kidsdrawing` con `naive expressive sketch style` está orientado a un trazo infantil, útil para maquetas de cuentos y material didáctico.
- Diseño de cartas y material esotérico o editorial temático: `krea2_vintagetarot` con `vintage tarot style` permite generar barajas o ilustraciones de temática esotérica con coherencia estilística.
- Fondos y recursos para vídeo o presentaciones: `krea2_sunsetblur` (`ethereal motion blur style`) y `krea2_rainywindow` (`rainy window style`) generan texturas atmosféricas utilizables como fondos.
- Recreación de un estilo propio a partir de referencias: el LoRA `krea2_turbo_style_reference` permite trasladar una estética concreta a nuevas imágenes sin necesidad de reentrenar el modelo.
- Despliegue local en estaciones de trabajo con ComfyUI: al distribuirse en formatos bf16, fp8, int8, mxfp8 y nvfp4, el modelo puede instalarse en equipos con distintos presupuestos de VRAM seleccionando el fichero adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del reempaquetado no incluye métricas objetivas (FID, CLIP score, HPSv2, GenEval ni similares), ni comparaciones cuantitativas con otros modelos de generación de imágenes. Tampoco hay datos de latencia, throughput ni número de pasos de muestreo recomendado para las variantes Raw y Turbo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica el tamaño de cada fichero por separado ni el número de parámetros del modelo, por lo que no es posible calcular una cifra fiable. El conjunto completo de ficheros del repositorio ocupa 146,6 GB, cifra que incluye todas las variantes de cuantización, el codificador de texto y los LoRA, y que por tanto no equivale al consumo en memoria de ninguna configuración concreta.
- Orientación general sobre precisión y memoria, aplicable a cualquier modelo de difusión: los ficheros bf16 son los que más memoria requieren; fp8 e int8 ocupan aproximadamente la mitad; y nvfp4 y mxfp8 reducen aún más la huella, en torno a una cuarta parte del bf16. Estas proporciones son una regla general de los formatos de cuantización, no un dato específico de Krea 2.
- GPUs recomendadas: no disponible. Los formatos `mxfp8` y `nvfp4` están diseñados para GPUs con soporte nativo de esos tipos, habituales en las generaciones más recientes (Hopper y posteriores para mxfp8, Blackwell para nvfp4), pero el repositorio no indica qué GPU se ha validado.
- Compatibilidad con GPU de consumo: no disponible. Sin conocer el recuento de parámetros, no se puede confirmar si cabe en una RTX 4090, 4080 o similar con alguna de las cuantizaciones disponibles.
- Opciones de despliegue: ComfyUI es el destino explícito del reempaquetado, con la estructura de carpetas `models/diffusion_models`, `models/loras`, `models/text_encoders` y `models/vae`. No se documenta compatibilidad con otras herramientas de inferencia, y no aplican los servidores de inferencia de modelos de lenguaje como vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa cuantitativa fiable, porque la información proporcionada no incluye el número de parámetros, la resolución nativa, los requisitos de VRAM ni resultados de benchmarks de Krea 2. La tabla siguiente recoge únicamente los datos verificables del repositorio y marca como no disponibles los campos que no se pueden contrastar.

| Modelo | Parametros | Contexto / resolucion | Licencia | Formato de distribucion | Resultados publicos |
|---|---|---|---|---|---|
| Krea 2 (Raw / Turbo, via oshinoWng/krea2) | no disponible | no disponible | krea-2-community-license | safetensors, archivo unico para ComfyUI; bf16, fp8, int8, mxfp8, nvfp4 | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

El único elemento diferencial documentado frente a otros modelos de difusión es el conjunto de cuantizaciones incluidas en un mismo repositorio, que abarca desde bf16 hasta nvfp4 y mxfp8, y el uso de un codificador de texto Qwen3-VL 4B. No se dispone de datos para comparar calidad de generación, velocidad ni coste de inferencia con ningún otro modelo.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado de terceros, no la publicación oficial del modelo. El autor es `oshinoWng` y los pesos originales provienen de `krea/Krea-2-Raw` y `krea/Krea-2-Turbo`. Para cualquier uso crítico conviene verificar los repositorios originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad ni informes de problemas resueltos.
- La licencia es `krea-2-community-license`, una licencia de tipo `other`. No se incluye el texto íntegro en la información proporcionada, solo un enlace al PDF en el repositorio de `krea/Krea-2-Turbo`. Es imprescindible leerla antes de cualquier uso comercial, ya que las licencias comunitarias de modelos generativos suelen incorporar restricciones de uso, obligaciones de atribución o límites de facturación anual.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible dentro de la imagen, perspectivas incoherentes o elementos que no se corresponden con el prompt. No hay datos publicados sobre la incidencia de estos fallos.
- Sesgos: no se ha publicado ninguna evaluación de sesgos demográficos, culturales o de representación. Es esperable que el modelo reproduzca los sesgos presentes en sus datos de entrenamiento, pero no hay información para cuantificarlo.
- Idiomas: no se documenta qué idiomas admiten los prompts. El codificador de texto es Qwen3-VL 4B, un modelo multilingüe, pero el rendimiento real por idioma en la generación de imágenes no está evaluado.
- Restricciones de contexto: al no ser un modelo autoregresivo, no existe una ventana de contexto. La longitud máxima de prompt efectiva no está documentada.
- Los LoRA incluidos se distribuyen con una fuerza recomendada de 1.0 y palabras de activación concretas. Usar valores distintos o mezclar varios LoRA puede degradar el resultado; no se documentan interacciones entre ellos.
- Coste de almacenamiento: el conjunto completo ocupa 146,6 GB, por lo que conviene descargar únicamente los ficheros de cuantización que se vayan a usar.
- No hay información sobre el número de pasos de muestreo, la resolución nativa de entrenamiento ni la configuración de sampler y scheduler recomendada para cada variante.

## Enlaces

- Repositorio analizado: https://huggingface.co/oshinoWng/krea2
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia: https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf
- LoRA darkbrush: https://huggingface.co/krea/Krea-2-LoRA-darkbrush
- LoRA dotmatrix: https://huggingface.co/krea/Krea-2-LoRA-dotmatrix
- LoRA kidsdrawing: https://huggingface.co/krea/Krea-2-LoRA-kidsdrawing
- LoRA neondrip: https://huggingface.co/krea/Krea-2-LoRA-neondrip
- LoRA rainywindow: https://huggingface.co/krea/Krea-2-LoRA-rainywindow
- LoRA retroanime: https://huggingface.co/krea/Krea-2-LoRA-retroanime
- LoRA softwatercolor: https://huggingface.co/krea/Krea-2-LoRA-softwatercolor
- LoRA sunsetblur: https://huggingface.co/krea/Krea-2-LoRA-sunsetblur
- LoRA vintagetarot: https://huggingface.co/krea/Krea-2-LoRA-vintagetarot
- LoRA de referencia de estilo Turbo: https://huggingface.co/ostris/krea2_turbo_style_reference
