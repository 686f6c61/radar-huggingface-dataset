# OzzyGT/P_H3_Image_sdnq_dynamic_4bit

## Resumen

P_H3_Image_sdnq_dynamic_4bit es una cuantización dinámica a 4 bits del modelo de generación y edición de imágenes PrunaAI/P-H3-Image, publicada por el usuario OzzyGT mediante la herramienta SDNQ (Disty0/sdnq). El modelo original pertenece a la familia MiniMax H3 y se distribuye bajo la licencia comunitaria minimax-h3-community-license-agreement. Esta versión reduce el peso en disco del transformer a 18,8 GB y el del codificador de texto a 3,1 GB, manteniendo el VAE y el conector de texto en bf16.

El interés práctico de esta ficha radica en que permite ejecutar un pipeline de difusión de gran tamaño en hardware de consumo: el ejemplo oficial alcanza un pico de 10,7 GiB de VRAM a resolución 2720x1536 con group-offloading por bloques del transformer, y 12,0 GiB en el caso de edición de imágenes con dos entradas. El repositorio suma 17,6 mil millones de parámetros en formato safetensors y ocupa 27,7 GB.

Se trata de un modelo multimodal de imagen: acepta prompts de texto para text-to-image y hasta ocho imágenes de entrada para edición, con un codificador de texto Qwen3-VL-4B cuantizado. No incluye el prompt upsampler, que debe cargarse por separado desde el repositorio base si se desea conservar ese paso del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión modular (diffusers ModularPipeline) con transformer cuantizado y codificador de texto Qwen3-VL-4B |
| Parametros totales | 17.633.661.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 dinámico (SDNQ); VAE y conector de texto en bf16 |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo. La arquitectura subyacente es un pipeline de difusión de la familia MiniMax H3, ejecutado como Modular Diffusers pipeline. El transformer y el codificador de texto Qwen3-VL-4B se cuantizan a 4 bits con SDNQ en modo dinámico; el VAE y el conector de texto permanecen en bf16. En disco, el transformer ocupa 18,8 GB y el codificador de texto 3,1 GB.

El muestreo utiliza 8 pasos sobre la rejilla de sigmas propia del checkpoint y funciona sin CFG, por lo que no se exponen los parámetros `num_inference_steps`, `guidance_scale` ni prompt negativo. El prompt upsampler no está incluido en el repositorio; si se mantiene ese paso, el pipeline carga el upsampler bf16 desde PrunaAI/P-H3-Image. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resoluciones altas, hasta 2720x1536 en los ejemplos oficiales.
- Edición de imágenes con hasta 8 imágenes de entrada: la primera es la imagen a editar y las siguientes actúan como referencias (Picture 2, Picture 3, etc.).
- Composición guiada por prompt estructurado con definiciones de sujeto (`subject_definitions`) que referencian cada imagen de entrada.
- Codificación de texto multilingüe limitada al inglés según la model card (`language: en`).
- Integración con el ecosistema diffusers mediante `ModularPipeline` y sub-bloques intercambiables (por ejemplo, eliminar el prompt upsampler).
- No se documenta soporte de tool calling, agentes ni modos de razonamiento; es un modelo exclusivamente de imagen.

## Casos de uso

- Generación de imágenes de producto en catálogo: el modelo renderiza escenas fotorrealistas a 2720x1536 con 8 pasos, adecuado para fichas de e-commerce que requieren detalle en texturas y materiales.
- Edición por referencia de sujeto: sustituir o insertar un personaje u objeto en una escena existente usando Picture 2 como referencia, útil en previsualización de campañas publicitarias.
- Outpainting y reencuadre: el ejemplo oficial parte de una foto 16:9 y la extiende, lo que sirve para adaptar material fotográfico a distintos formatos de publicación.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: con 10,7 GiB de pico en generación y 12,0 GiB en edición, cabe en tarjetas de 16 GB o superiores.
- Creación de ilustración editorial con control de composición: los prompts estructurados con definiciones de sujeto permiten fijar la disposición de varios elementos en la escena.
- Pruebas A/B de variantes creativas: al no usar CFG y fijar la semilla, se pueden generar variantes reproducibles cambiando solo el prompt, lo que facilita la comparación controlada.
- Integración en pipelines de difusión existentes basados en diffusers: al ser un ModularPipeline, se puede insertar en flujos que ya usan la librería y sustituir el checkpoint por esta versión cuantizada para ahorrar VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye comparaciones visuales bf16 frente a INT4 con la misma semilla y prompt, sin métricas cuantitativas (FID, CLIP score, SSIM u otras).

## Requisitos de hardware

- VRAM estimada: 10,7 GiB de pico en generación a 2720x1536 y 12,0 GiB en edición con dos imágenes, medidos con el transformer en group-offloading por bloques y el codificador de texto y el VAE en GPU.
- El transformer ocupa 18,8 GB en disco y el codificador de texto 3,1 GB; el repositorio completo son 27,7 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por los picos medidos, tarjetas con 16 GB o más (RTX 4080/4090, A100, H100) son candidatas razonables, aunque no está confirmado por el autor.
- Cabe en GPU de consumo con al menos 16 GB de VRAM aplicando el mismo esquema de offloading descrito.
- Despliegue: diffusers instalado desde el código fuente (`pip install git+https://github.com/huggingface/diffusers`) y SDNQ v0.2.8 o superior; es necesario importar `sdnq` antes de cargar el pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/P_H3_Image_sdnq_dynamic_4bit | 17.633.661.696 | no disponible | INT4 dinámico (SDNQ) | minimax-h3-community-license-agreement | Hugging Face, diffusers |
| PrunaAI/P-H3-Image (base bf16) | no disponible | no disponible | bf16 | minimax-h3-community-license-agreement | Hugging Face, diffusers |
| Alternativas de generación de imagen de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otros modelos de generación de imagen no está disponible en la información proporcionada; solo se puede contrastar con su modelo base, del que esta versión es una cuantización directa.

## Limitaciones y advertencias

- Es una cuantización a 4 bits: la model card muestra diferencias visuales frente al bf16 original, por lo que puede haber pérdida de fidelidad en detalles finos, texto renderizado y texturas.
- El prompt upsampler no está incluido; si se necesita, debe cargarse desde PrunaAI/P-H3-Image, lo que añade peso y complejidad al despliegue.
- Requiere diffusers desde el código fuente y SDNQ v0.2.8 o superior, ya que el soporte de P-H3-Image no está en una release estable; esto implica riesgo de incompatibilidades en producción.
- Idioma limitado al inglés según la model card; no se documenta soporte de prompts en castellano.
- Licencia comunitaria MiniMax H3: es necesario revisar el texto de la licencia antes de cualquier uso comercial, ya que no es una licencia open source estándar.
- No se documentan sesgos específicos ni tasas de alucinación visual; como todo modelo generativo de imagen, puede producir contenido inexacto o no solicitado.
- El repositorio tiene un uso muy bajo (17 descargas, 1 like) y fue creado en noviembre de 2026, por lo que la validación comunitaria es escasa.
- No hay métricas objetivas publicadas que permitan estimar la degradación respecto al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/P_H3_Image_sdnq_dynamic_4bit
- Árbol de archivos: https://huggingface.co/OzzyGT/P_H3_Image_sdnq_dynamic_4bit/tree/main
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image
- Repositorio SDNQ: https://github.com/Disty0/sdnq
- Recetas de diffusers para P-H3-Image: https://github.com/asomoza/diffusers-recipes/blob/main/models/p_h3_image/README.md
- Diffusers (instalación desde fuente): https://github.com/huggingface/diffusers
- Ejemplos de imágenes: https://huggingface.co/datasets/OzzyGT/diffusers-examples
