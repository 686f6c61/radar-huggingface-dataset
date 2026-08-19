# lodestones/Kroma

## Resumen

Kroma es un modelo de generación de imágenes de texto a imagen (text-to-image) desarrollado por el equipo de lodestones. Se trata de un fine-tune del modelo base Krea 2, que emplea una arquitectura de diffusion transformer (DiT). El modelo está diseñado para integrarse en ComfyUI, el popular entorno de generación de imágenes por nodos, y se distribuye en dos variantes principales: una versión base y una versión turbo optimizada para inferencia rápida.

La relevancia de Kroma radica en que ofrece una alternativa de alta calidad para la generación de imágenes con un flujo de trabajo compatible con ComfyUI, además de incluir cuantizaciones INT8 que reducen significativamente los requisitos de VRAM. Aunque la información pública es limitada, el modelo ha recibido 269 likes en HuggingFace, lo que sugiere un interés notable dentro de la comunidad. La versión v0.2 publicada en agosto de 2026 representa un checkpoint completo (no un LoRA), lo que facilita su uso directo sin necesidad de cargar pesos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) basado en Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | FP16 (original), INT8 (cuantizacion ConvRot de la comunidad) |
| Idiomas soportados | no disponible (presumiblemente ingles, sin confirmar) |
| Licencia | no disponible (etiqueta "license:other" en HuggingFace) |
| Formato de pesos | safetensors (checkpoint completo y LoRA) |

## Arquitectura y entrenamiento

Kroma se basa en la arquitectura Krea 2, un modelo de difusion de tipo transformer (DiT) que procesa texto y genera imagenes mediante un proceso iterativo de denoising. La version v0.1 se publico como un LoRA con rank reducido a 256 y alpha 256, que incluia los tensores de normalizacion y modulacion como deltas de pesos, permitiendo reproducir el comportamiento del fine-tune sobre el modelo base. La version v0.2, en cambio, es un checkpoint completo que integra todos los pesos del fine-tune, simplificando su despliegue.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de pasos, ni si se utilizaron tecnicas como RLHF o DPO. La unica informacion disponible es que el fine-tune se realizo sobre Krea 2 y que la version turbo esta optimizada para reducir el numero de pasos de inferencia. La cuantizacion INT8 (ConvRot) ha sido generada por la comunidad (Stabhappy) para permitir una ejecucion mas rapida y con menor consumo de VRAM en ComfyUI.

## Capacidades

- Generacion de imagenes fotorrealistas y artisticas a partir de descripciones textuales.
- Soporte para flujos de trabajo en ComfyUI mediante el cargador nativo de INT8 o el checkpoint estandar.
- Variante turbo que reduce el numero de pasos de inferencia, acelerando la generacion sin perdida significativa de calidad.
- Compatibilidad con cuantizacion INT8 (ConvRot) para entornos con VRAM limitada.
- Capacidad de fine-tuning adicional sobre el checkpoint base para adaptarlo a dominios especificos.
- Integracion con el ecosistema de herramientas de ComfyUI (samplers, schedulers, controlnet, etc.).

## Casos de uso

- Generacion de arte conceptual para videojuegos y produccion audiovisual: Kroma permite crear bocetos y conceptos visuales rapidamente a partir de prompts descriptivos, acelerando la fase de preproduccion.
- Ilustracion editorial y diseno grafico: los disenadores pueden generar imagenes de alta calidad para portadas, infografias o material promocional sin depender de bancos de imagenes.
- Prototipado visual para marketing: los equipos de marketing pueden generar variaciones de imagenes para campanas publicitarias, probando diferentes estilos y composiciones en minutos.
- Creacion de assets para entornos virtuales: Kroma puede generar texturas, fondos y elementos decorativos para mundos virtuales o experiencias de realidad aumentada.
- Asistencia en diseno de producto: los disenadores industriales pueden visualizar conceptos de productos a partir de descripciones tecnicas, facilitando la comunicacion con clientes o fabricantes.
- Generacion de imagenes para investigacion en IA: los investigadores pueden utilizar Kroma como modelo base para experimentos de fine-tuning, evaluacion de calidad de generacion o estudios de sesgos en modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre FID, CLIP score, ni comparaciones cuantitativas con otros modelos de generacion de imagenes.

## Requisitos de hardware

- VRAM estimada: para la version FP16, se estima un consumo de 8-12 GB de VRAM, dependiendo de la resolucion de salida y el numero de pasos. Con la cuantizacion INT8, el consumo puede reducirse a 4-6 GB.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior para FP16; RTX 4060 (8 GB) o superior para INT8. Para produccion a gran escala, se recomienda RTX 4090 o A100.
- Compatibilidad con GPU de consumo: si, siempre que se utilice la cuantizacion INT8 o se reduzca la resolucion de salida.
- Opciones de despliegue: ComfyUI (principal), con soporte nativo para el cargador INT8. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La variante turbo esta disenada para reducir el numero de pasos, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kroma (Krea 2 fine-tune) | DiT | no disponible | no disponible | safetensors | HuggingFace |
| Stable Diffusion XL (SDXL) | U-Net + VAE | 3.5B | OpenRAIL++ | safetensors | Ampliamente disponible |
| FLUX.1 [dev] | DiT (rectified flow) | 12B | Apache 2.0 (no comercial) | safetensors | HuggingFace |
| Stable Diffusion 3.5 | DiT (MMDiT) | 8B | Stability Community License | safetensors | HuggingFace |

Kroma se posiciona como un fine-tune especializado sobre Krea 2, mientras que SDXL, FLUX y SD 3.5 son modelos base. Sin datos de rendimiento, no es posible comparar calidad de generacion. La principal ventaja de Kroma es su integracion directa con ComfyUI y la disponibilidad de cuantizaciones INT8 para hardware modesto.

## Limitaciones y advertencias

- Licencia no disponible: el modelo se distribuye con la etiqueta "license:other", lo que implica que los terminos de uso no estan claros. No se recomienda su uso comercial sin verificar los derechos de uso con el autor.
- Sesgos y alucinaciones visuales: al ser un modelo de difusion, puede generar imagenes con distorsiones anatomicas, texto incorrecto o elementos inconsistentes, especialmente en prompts complejos.
- Limitaciones de idioma: no se ha confirmado el soporte multilingue. Es probable que el modelo funcione mejor con prompts en ingles, dado el origen del fine-tune.
- Dependencia de Krea 2: Kroma es un fine-tune, por lo que requiere el modelo base Krea 2 para funcionar correctamente. Si el modelo base no esta disponible o cambia su licencia, Kroma podria verse afectado.
- Requisitos de hardware: aunque la cuantizacion INT8 reduce la VRAM, la generacion de imagenes a alta resolucion (1024x1024 o superior) puede requerir mas de 8 GB de VRAM incluso en INT8.
- Sin garantias de produccion: al ser un modelo reciente (agosto de 2026) y con documentacion limitada, no se recomienda su uso en entornos de produccion sin pruebas exhaustivas previas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/lodestones/Kroma)
- [Kroma v0.1 LoRA en Tensor.Art](https://tensor.art/models/1028617042430843013)
- [Kroma v0.2: articulo en ComfyUI Wiki](https://comfyui-wiki.com/en/news/2026-08-09-kroma-v0-2)
- [Cuantizacion INT8 de Stabhappy](https://huggingface.co/Stabhappy/kroma-v0.2-base-INT8-convrot)
