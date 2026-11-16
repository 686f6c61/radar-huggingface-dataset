# AcademiaSD/MOSS-Image-NF4-for-LoRA-Training

## Resumen

MOSS-Image NF4 for LoRA Training es un repositorio de conversiones cuantizadas del modelo de generación de imágenes MOSS-Image, publicado por el usuario AcademiaSD. No se trata de un modelo original, sino de una adaptación de los pesos oficiales de OpenMOSS-Team (MOSS-Image Base y MOSS-Image SFT) empaquetados en un formato de caché pre-cuantizada en NF4 que consume el entrenador AcademiaSD LoRAlab Trainer Studio. Su propósito concreto es permitir el entrenamiento de LoRAs sobre MOSS-Image en GPUs de consumo, reduciendo el peso descargado de 27,2 GB a entre 9,9 y 20,2 GB según la precisión del codificador de texto.

El modelo subyacente es un transformer de difusión de 5B parámetros para texto-a-imagen, con 42 bloques y 252 capas de atención y MLP, acompañado de un codificador de texto Qwen3.5-9B y el autoencoder de FLUX.2. Los idiomas soportados son inglés y chino. La licencia es Apache 2.0 tanto para los pesos originales como para esta conversión.

Es relevante ahora porque democratiza el ajuste fino de un modelo de difusión de 5B en hardware asequible: según las mediciones del autor, en una RTX 5080 se alcanza aproximadamente 1,0 s por paso con resolución 512², rango 8 y menos de 6 GB de VRAM. Conviene subrayar que este repositorio no está pensado para inferencia directa: diffusers y ComfyUI no cargan el formato de caché del entrenador, por lo que para generar imágenes deben usarse los pesos originales de OpenMOSS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (texto-a-imagen) con 42 bloques y 252 capas de atencion/MLP; codificador de texto Qwen3.5-9B; VAE FLUX.2 |
| Parametros totales | 5B en el transformer de difusion (mas Qwen3.5-9B como codificador de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes) en el transformer; codificador de texto en BF16, INT8 (LLM.int8) o NF4 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; transformer en cache pre-cuantizada propia (un .safetensors por capa mas QuantState, others.safetensors en BF16 e index.json); codificadores de texto en formato transformers estandar |

## Arquitectura y entrenamiento

El transformer de difusion sigue una arquitectura de bloques con atención y MLP (252 capas repartidas en 42 bloques), con los pesos de atención y MLP almacenados en NF4 y el refinador de texto, embedders, modulaciones, normas y capa de salida mantenidos en BF16. El codificador de texto es Qwen3.5-9B, compartido entre las variantes Base y SFT, y el VAE corresponde al autoencoder de FLUX.2 que acompaña a MOSS-Image. El repositorio incluye dos transformadores: el de MOSS-Image Base y el de MOSS-Image SFT, ambos de 3,1 GB en este formato.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación técnica de este repositorio es el formato de caché pre-cuantizada: el entrenador construye un transformer vacío desde config.json y lo rellena capa a capa desde el cache, conservando los nombres de parámetro originales de OpenMOSS. La diferencia medida de los embeddings de texto frente a BF16 es de aproximadamente 7-14 % de error relativo en INT8 y 20-30 % en NF4 (última capa); por eso el entrenador usa BF16 por defecto, repartido entre GPU y RAM en GPUs pequeñas, de modo que el LoRA se entrena con los mismos embeddings que calcula ComfyUI.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) mediante el modelo subyacente MOSS-Image.
- Entrenamiento de LoRAs sobre MOSS-Image con el trainer AcademiaSD LoRAlab Trainer Studio.
- Exportación de LoRAs con los nombres de capa originales (`diffusion_model.layers.N.proj.{q,k,v,o,ffn_up_gate,ffn_down}.lora_A / lora_B` más `alpha`), cargables en ComfyUI nightly con soporte nativo de MOSS-Image mediante el loader de LoRA estándar.
- Soporte multilingüe de prompts en inglés y chino.
- Previsualizaciones rápidas en el entrenador mediante el adaptador de 4 pasos de darask0 (Apache 2.0), construido sobre el adaptador de 8 pasos de lodestones; no forma parte de este repositorio.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de difusión para imágenes.

## Casos de uso

- Ajuste fino de estilo en GPU de consumo: entrenar un LoRA de rango 8 a 512² sobre MOSS-Image en una RTX 5080 con menos de 6 GB de VRAM y ~1,0 s por paso, según las mediciones del autor.
- Creación de LoRAs de personajes o productos: el entrenador descarga solo las partes que usa (9,9 GB con codificador NF4, 13,2 GB con INT8 o 20,2 GB con BF16) y exporta el LoRA con nombres de capa compatibles con ComfyUI.
- Flujos de trabajo en ComfyUI: los LoRA entrenados con este repositorio se cargan con el loader estándar en ComfyUI nightly con soporte nativo de MOSS-Image, integrándose en pipelines de generación ya existentes.
- Experimentación académica con cuantización: comparar el efecto de INT8 (7-14 % de error relativo en embeddings) y NF4 (20-30 %) frente a BF16 en la calidad del LoRA resultante.
- Prototipado rápido de adaptaciones visuales en inglés y chino: útil para equipos que trabajan con prompts en ambos idiomas y necesitan iterar sobre estilos sin infraestructura de datacenter.
- Formación y tutoriales: el formato de caché y el conversor (`tools/mossimage/5_conversor_MossImage_NF4.py`) sirven como material didáctico sobre cuantización con bitsandbytes y entrenamiento de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de entrenamiento: ~1,0 s por paso a 512² con rango 8 en una RTX 5080 y menos de 6 GB de VRAM, además del error relativo de los embeddings de texto frente a BF16 (INT8 ~7-14 %, NF4 ~20-30 %).

## Requisitos de hardware

- VRAM para entrenamiento de LoRA: menos de 6 GB en una RTX 5080 con resolución 512² y rango 8, según la medición del autor.
- Descarga según configuración: 20,2 GB con codificador de texto BF16, 13,2 GB con INT8 y 9,9 GB con NF4 (frente a 27,2 GB del modelo original).
- GPU recomendadas: RTX 5080 (medición reportada); el entrenador reparte el codificador BF16 entre GPU y RAM en GPUs pequeñas, por lo que se requieren GPUs consumer con suficiente memoria del sistema.
- Despliegue: este repositorio no es apto para inferencia en diffusers ni ComfyUI; para generar imágenes deben usarse los pesos originales de OpenMOSS-Team. El entrenamiento se realiza con AcademiaSD LoRAlab Trainer Studio.
- Latencia y throughput: ~1,0 s por paso en RTX 5080 a 512² con rango 8; no hay datos de throughput de inferencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| AcademiaSD/MOSS-Image-NF4-for-LoRA-Training | 5B (transformer) + Qwen3.5-9B | no disponible | apache-2.0 | safetensors en caché NF4 propia | Entrenamiento de LoRA |
| OpenMOSS-Team/MOSS-Image-Base | 5B (transformer) + Qwen3.5-9B | no disponible | apache-2.0 | safetensors (27,2 GB) | Inferencia y ajuste fino |
| OpenMOSS-Team/MOSS-Image-SFT | 5B (transformer) + Qwen3.5-9B | no disponible | apache-2.0 | safetensors | Inferencia y ajuste fino |
| darask0/MOSS-Image_4-step_adapter_lora | adaptador LoRA | no disponible | apache-2.0 | safetensors | Aceleración a 4 pasos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de OpenMOSS: es una conversión de terceros (AcademiaSD) de los pesos originales.
- No sirve para inferencia directa: el formato de caché pre-cuantizada no lo cargan diffusers ni ComfyUI; para generar imágenes hay que usar los pesos originales.
- La cuantización introduce degradación en los embeddings de texto: ~7-14 % de error relativo en INT8 y ~20-30 % en NF4 frente a BF16 en la última capa.
- El entrenador usa BF16 por defecto repartido entre GPU y RAM, lo que exige memoria del sistema suficiente en GPUs pequeñas.
- Idiomas limitados a inglés y chino; no se documenta soporte de otros idiomas.
- No se dispone de información sobre sesgos, tasas de alucinación visual ni limitaciones de contexto en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el repositorio se ofrece "as is", sin garantías de ningún tipo; debe revisarse NOTICE.md para conocer los cambios realizados.
- Las previsualizaciones rápidas dependen de adaptadores externos (darask0 y lodestones) que no forman parte de este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AcademiaSD/MOSS-Image-NF4-for-LoRA-Training
- Trainer AcademiaSD LoRAlab Trainer Studio: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
- Modelo original Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo original SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio GitHub de OpenMOSS: https://github.com/OpenMOSS/MOSS-Image
- Adaptador de 4 pasos: https://huggingface.co/darask0/MOSS-Image_4-step_adapter_lora
- Adaptador de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- YouTube: https://www.youtube.com/@Academia_SD
- Discord: https://discord.gg/Syuaduy678
- Ko-Fi: https://ko-fi.com/academiasd
