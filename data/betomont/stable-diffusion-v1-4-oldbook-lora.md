# Betomont/stable-diffusion-v1-4-oldbook-lora

## Resumen

La LoRA `Betomont/stable-diffusion-v1-4-oldbook-lora` es una adaptación ligera del modelo de difusión `CompVis/stable-diffusion-v1-4` orientada a la generación de ilustraciones con estética de libros antiguos. La desarrolla el usuario Betomont y se distribuye a través de HuggingFace con la librería `diffusers`. El problema que resuelve es acotado: permitir que un pipeline de Stable Diffusion 1.4 produzca imágenes con el estilo visual de las ilustraciones de libros históricos sin necesidad de reentrenar el modelo base.

Técnicamente se trata de un adaptador LoRA de rango 8 aplicado únicamente al U-Net, manteniendo congelados el text encoder y el VAE del modelo base. El entrenamiento se realizó sobre el dataset `gigant/oldbookillustrations`, con imágenes redimensionadas y recortadas a 512 × 512 píxeles. El repositorio es de tamaño mínimo (0.0 GB según HuggingFace), lo que confirma que solo contiene los pesos del adaptador y no una copia del modelo completo.

Su relevancia es limitada y muy específica: es un adaptador de nicho, con 13 descargas y 0 likes en el momento de la consulta, pensado para experimentación estilística sobre SD 1.4. No introduce innovaciones arquitectónicas ni capacidades nuevas más allá del condicionamiento de estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion (Stable Diffusion 1.4) con adaptador LoRA sobre U-Net |
| Parametros totales | no disponible (el adaptador LoRA es de rango 8; el modelo base SD 1.4 tiene ~860M en U-Net y ~123M en text encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el prompt de texto de SD 1.4 se limita a 77 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión de entrenamiento FP16; el modelo base admite FP16 y FP32) |
| Idiomas soportados | no disponible (el prompt se procesa con el text encoder CLIP de SD 1.4, predominantemente inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (formato de pesos LoRA para `diffusers`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la arquitectura de difusión latente de Stable Diffusion 1.4: un autoencoder variacional (VAE) que comprime imágenes a un espacio latente, un U-Net que realiza el proceso de denoising condicionado por texto, y un text encoder CLIP que proyecta el prompt. La LoRA de rango 8 se inserta exclusivamente en las capas del U-Net; el text encoder y el VAE permanecen congelados durante el entrenamiento, de modo que el adaptador solo modifica la distribución visual generada, no la interpretación semántica del prompt.

El entrenamiento usó el dataset `gigant/oldbookillustrations`, con imágenes originales de 1600 px y descripciones en la columna `info_alt`. El preprocesado consistió en conversión a RGB, redimensionado manteniendo proporción y recorte central a 512 × 512. Los hiperparámetros documentados son: batch por GPU de 1, acumulación de gradientes de 4, precisión FP16 y learning rate de 1e-4. El número exacto de pasos y el registro completo se remiten a un archivo `training_config.json` no incluido en la información disponible. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un adaptador de estilo.

## Capacidades

- Generación de imágenes texto-a-imagen mediante el pipeline `StableDiffusionPipeline` de `diffusers`, cargando el modelo base y el adaptador con `load_lora_weights`.
- Condicionamiento de estilo: induce una estética de ilustración de libro antiguo sobre las generaciones del modelo base.
- Compatibilidad con el ecosistema `diffusers`: puede combinarse con otros adaptadores LoRA si el pipeline lo permite.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión de entrada, audio ni capacidades multimodales más allá de texto-a-imagen.
- Capacidades multilingües: no documentadas; el text encoder CLIP de SD 1.4 está optimizado para inglés.

## Casos de uso

- Ilustración editorial de ambientación histórica: generar imágenes de portada o interiores con estética de grabado o libro antiguo para proyectos de autoedición, usando prompts descriptivos en inglés y el pipeline de `diffusers` con el adaptador cargado.
- Prototipado de dirección de arte: explorar rápidamente variaciones de estilo "old book" antes de encargar ilustraciones definitivas a un artista, aprovechando que el adaptador es ligero y se carga sobre SD 1.4 ya disponible.
- Generación de material para juegos de rol o narrativa: producir ilustraciones de ambientación medieval o victoriana para manuales, cartas o fichas, con la ventaja de que el estilo se mantiene coherente entre generaciones.
- Contenido para blogs o publicaciones divulgativas: crear imágenes de acompañamiento con aire retro para artículos de historia, literatura o archivística.
- Experimentación académica en adaptación de estilo: estudiar cómo una LoRA de rango 8 sobre el U-Net altera la distribución visual de SD 1.4 sin tocar el text encoder, como caso de bajo coste computacional.
- Fines educativos en cursos de difusión: demostrar el flujo completo de carga de un modelo base, aplicación de un adaptador LoRA y generación condicionada, con un ejemplo mínimo reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base SD 1.4 en FP16 requiere aproximadamente 4-6 GB de VRAM; el adaptador LoRA añade una sobrecarga mínima (decenas de MB).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, RTX 2070 o superiores.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y modelos equivalentes; en GPUs de 4 GB puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline`, `load_lora_weights` y `torch_dtype=torch.float16`; también es compatible con interfaces que acepten LoRA de SD 1.4, como Automatic1111 o ComfyUI, aunque no se documenta explícitamente en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Betomont/stable-diffusion-v1-4-oldbook-lora | LoRA rango 8 sobre SD 1.4 | no disponible (prompt de 77 tokens) | sin benchmarks publicados | creativeml-openrail-m | HuggingFace, 13 descargas |
| CompVis/stable-diffusion-v1-4 (base) | ~860M U-Net + ~123M text encoder | 77 tokens de prompt | benchmarks públicos de FID/CLIP en su model card original | creativeml-openrail-m | HuggingFace, ampliamente usado |
| Otras LoRA de estilo sobre SD 1.4 | variable (rango 4-128) | 77 tokens de prompt | sin benchmarks estandarizados | habitualmente creativeml-openrail-m | HuggingFace / Civitai |

La comparación con otras LoRA de estilo es estructuralmente equivalente: todas comparten el modelo base, la ventana de prompt y las limitaciones de resolución (512 × 512 nativa). La diferencia entre ellas es el dataset de entrenamiento y el estilo resultante, no el rendimiento medible con métricas estándar.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset `gigant/oldbookillustrations` es heterogéneo y está compuesto por ilustraciones históricas, lo que puede introducir sesgos de época, culturales y de representación en las imágenes generadas.
- Riesgo de alucinación visual: la model card advierte que no se garantiza la fidelidad semántica; el modelo puede generar composiciones que no correspondan al prompt.
- Limitaciones de contexto e idioma: el prompt se limita a 77 tokens y el text encoder CLIP está optimizado para inglés; prompts en castellano pueden degradar la calidad.
- Calidad de entrenamiento: las descripciones del dataset pueden estar truncadas y el recorte central a 512 × 512 puede perder información de composiciones originales, lo que afecta a la coherencia de las generaciones.
- Restricciones de licencia: la licencia `creativeml-openrail-m` impone condiciones de uso comercial y restricciones sobre contenido; además, el dataset fuente tiene licencia CC BY-NC 4.0, lo que puede limitar el uso comercial de los pesos derivados. Es necesario revisar ambas licencias antes de reutilizar el adaptador en producción.
- Madurez del artefacto: 13 descargas y 0 likes, sin `training_config.json` accesible en la información disponible, lo que dificulta la reproducibilidad del entrenamiento.
- Sin benchmarks: no hay métricas publicadas que permitan evaluar objetivamente la calidad del estilo frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Betomont/stable-diffusion-v1-4-oldbook-lora
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
