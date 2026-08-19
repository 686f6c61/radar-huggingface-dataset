# esalahterus/refo

## Resumen

ReFo es un checkpoint afinado del modelo `diffusers/stable-diffusion-xl-1.0-inpainting-0.1`, desarrollado por el usuario esalahterus, especializado en **edición de fondo** mediante inpainting guiado por texto. El modelo permite sustituir el fondo de una fotografía conservando el sujeto en primer plano, a partir de una máscara y una descripción textual del nuevo fondo. Se trata de una fusión de un LoRA (rank 16) directamente en los pesos del UNet, por lo que no requiere cargar adaptadores adicionales.

El modelo está entrenado con pares sintéticos generados a partir de los datasets DIS5K (para máscaras de primer plano) y BG-20k (para fondos), con captions autogenerados. Aunque el checkpoint tiene 2.567.478.084 parámetros (aproximadamente 2,57 mil millones), estos corresponden únicamente al UNet; el pipeline completo de SDXL inpainting incluye además el VAE y los text encoders. ReFo se distribuye en formato safetensors y se integra fácilmente con la librería diffusers mediante `StableDiffusionXLInpaintPipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (Stable Diffusion XL) con UNet, adaptado para inpainting |
| Parametros totales | 2.567.478.084 (UNet, en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | No disponible (se recomienda bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | No disponible (el prompt es texto, pero no se documentan idiomas especificos) |
| Licencia | No disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ReFo es un fine-tune del modelo `diffusers/stable-diffusion-xl-1.0-inpainting-0.1`, que a su vez se basa en la arquitectura de Stable Diffusion XL. El proceso de afinado consistió en entrenar un LoRA de rango 16 sobre las capas de proyección de atención del UNet, y posteriormente fusionar esos pesos directamente en el modelo base. El resultado es un checkpoint autónomo que no requiere cargar adaptadores adicionales.

El entrenamiento se realizó con datos sintéticos: se compusieron pares de imágenes combinando primeros planos segmentados de DIS5K (un dataset de segmentación de objetos salientes) con fondos extraídos de BG-20k, un conjunto de imágenes de fondo de alta calidad. Las descripciones de los nuevos fondos se generaron automáticamente mediante un modelo de captioning. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- **Edición de fondo guiada por texto**: reemplaza el fondo de una imagen a partir de una máscara y un prompt descriptivo, preservando el sujeto original.
- **Inpainting de alta resolución**: al basarse en SDXL, produce imágenes a 1024×1024 píxeles con buena calidad visual.
- **Integración con diffusers**: se usa directamente con `StableDiffusionXLInpaintPipeline`, sin configuración adicional.
- **Soporte de prompts negativos**: permite refinar el resultado evitando artefactos no deseados (texto, marcas de agua, baja calidad).
- **Apto para flujos automatizados**: puede integrarse en pipelines de procesamiento por lotes para e-commerce o edición de retratos.
- **No incluye capacidades multimodales adicionales**: no soporta tool calling, agentes ni razonamiento multi-step; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- **Fotografía de producto para e-commerce**: sustituir el fondo de fotos de catálogo por escenarios descritos (por ejemplo, "estudio blanco minimalista" o "entorno natural") de forma automatizada, manteniendo el producto intacto.
- **Edición de retratos**: cambiar el fondo de retratos personales o profesionales (por ejemplo, "fondo de oficina moderna" o "paisaje urbano al atardecer") sin alterar la persona.
- **Creación de contenido para redes sociales**: generar fondos creativos para fotos de influencers o marcas, con descripciones libres y control mediante máscara.
- **Automatización de estudios fotográficos**: integrar el modelo en un pipeline que recibe imágenes y máscaras generadas por segmentación, y produce variantes de fondo para pruebas A/B.
- **Restauración o composición de imágenes**: reemplazar fondos no deseados en imágenes históricas o artísticas, conservando el sujeto principal.
- **Generación de datasets sintéticos**: crear pares de imagen-máscara-fondo para entrenar otros modelos de segmentación o detección, aprovechando la capacidad de generar fondos variados a partir de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas cuantitativas (como FID, LPIPS o comparativas con otros modelos) en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el UNet tiene ~2,57 mil millones de parámetros. En bfloat16 ocupa aproximadamente 5,1 GB, pero el pipeline completo (incluyendo VAE y text encoders) requiere alrededor de 8-10 GB de VRAM para una inferencia cómoda a 1024×1024.
- **GPU recomendadas**: tarjetas con al menos 12 GB de VRAM, como NVIDIA RTX 3080/3090, RTX 4070/4080/4090, o GPUs de datacenter como A10, A100 o H100.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo con 12 GB o más, aunque para producción se recomienda al menos 16 GB.
- **Opciones de despliegue**: se puede ejecutar con la librería diffusers en Python, o mediante servidores de inferencia como vLLM (si se adapta a un pipeline de imágenes) o soluciones específicas como Stable Diffusion WebUI. También es posible usar llama.cpp o GGUF, pero no se proporcionan versiones cuantizadas.
- **Latencia y throughput**: no disponible. Depende del hardware y de la configuración (número de pasos, resolución). Con 30 pasos en una RTX 4090, se puede esperar alrededor de 2-4 segundos por imagen, pero es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **esalahterus/refo** | 2,57B (UNet) | No aplica | Inpainting de fondo | No disponible (hereda del base) | HuggingFace |
| **diffusers/stable-diffusion-xl-1.0-inpainting-0.1** | 2,57B (UNet) | No aplica | Inpainting general | CreativeML Open RAIL++-M (probable) | HuggingFace |
| **stabilityai/stable-diffusion-2-inpainting** | 0,9B (UNet) | No aplica | Inpainting general | CreativeML Open RAIL-M | HuggingFace |

La comparativa se basa en el conocimiento general de estos modelos; no hay datos de rendimiento específicos para ReFo. La principal diferencia con el modelo base es que ReFo está afinado específicamente para edición de fondo con datos sintéticos, lo que puede ofrecer mejores resultados en ese dominio, aunque no está verificado.

## Limitaciones y advertencias

- **Dependencia de la máscara**: la calidad del resultado depende críticamente de la precisión de la máscara proporcionada. Máscaras imperfectas pueden provocar artefactos en el sujeto o en el fondo.
- **Datos de entrenamiento sintéticos**: al entrenarse con composiciones sintéticas, puede tener un rendimiento inferior en bordes complejos como cabello fino, transparencias o objetos con detalles intrincados.
- **Dominio limitado**: no se ha evaluado exhaustivamente fuera de los datos de entrenamiento (DIS5K + BG-20k), por lo que su comportamiento en escenarios muy diferentes podría ser impredecible.
- **Licencia no especificada**: aunque el autor indica que sigue la licencia del modelo base, no se proporciona una confirmación explícita. Se recomienda verificar la licencia del modelo base antes de uso comercial.
- **Sin soporte de idiomas documentado**: no se indica qué idiomas soporta el prompt, aunque probablemente funcione mejor con inglés (idioma de los captions de entrenamiento).
- **Riesgo de alucinaciones visuales**: como todo modelo de difusión, puede generar elementos no deseados en el fondo si el prompt es ambiguo o la máscara no está bien definida.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/esalahterus/refo)
- [Dataset DIS5K (GitHub)](https://github.com/xuebinqin/DIS)
- [Dataset BG-20k (HuggingFace)](https://huggingface.co/datasets/unography/BG-20k)
- [Modelo base: diffusers/stable-diffusion-xl-1.0-inpainting-0.1](https://huggingface.co/diffusers/stable-diffusion-xl-1.0-inpainting-0.1)
