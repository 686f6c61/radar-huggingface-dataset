# ND911/ostris_h3_image_vae_int8_convrot

## Resumen

`ND911/ostris_h3_image_vae_int8_convrot` es una cuantización a int8 del VAE (autoencoder) del modelo de generación de imágenes MiniMax-H3-Image, en concreto del fine-tune del decodificador publicado por Ostris. No es un modelo generativo completo, sino un componente auxiliar: el VAE que codifica imágenes a espacio latente y las decodifica de vuelta. Se distribuye como un único fichero en formato ComfyUI para sustituir al VAE original de MiniMax-H3-Image dentro de un flujo de trabajo de text-to-image.

El trabajo sustantivo proviene de Ostris, que ajustó el decodificador del VAE de MiniMax-H3-Image para suavizar detalles excesivamente nítidos y mejorar la representación de texto pequeño y rostros. Esta publicación es una recodificación de ese fine-tune con la receta `TensorWiseINT8Layout` (ConvRot) de ComfyUI, aplicada a las 96 capas lineales de atención y feed-forward del decodificador. El resultado reduce el tamaño de 1,09 GiB a 0,71 GiB con una similitud coseno mínima de 0,999962 frente al fp16.

La relevancia es práctica: permite ejecutar el pipeline de MiniMax-H3-Image con un VAE más ligero en ComfyUI, con soporte nativo de `comfy_kitchen` para int8 ConvRot. La licencia, sin embargo, impone una restricción territorial severa que excluye la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AutoencoderKL (VAE) de MiniMax-H3-Image, decodificador con transformer blocks; config `AutoencoderKLMiniMaxH3Image` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | int8 tensorwise (ConvRot, grupo 256) en 96 lineales del decodificador; resto en fp16 |
| Idiomas soportados | no aplica (modelo de vision/generacion de imagen) |
| Licencia | MiniMax-H3-Image Community License Agreement (con restriccion territorial) |
| Formato de pesos | safetensors en formato ComfyUI (`comfy_quant` metadata); no compatible con Diffusers |

## Arquitectura y entrenamiento

El fichero contiene el VAE del pipeline MiniMax-H3-Image, con arquitectura `AutoencoderKLMiniMaxH3Image`. El decodificador incluye bloques transformer con capas de atención (`attn.to_qkv`, `attn.to_out`) y feed-forward (`ff.w1`, `ff.w2`). Las convoluciones, las normalizaciones, `x_embedder`, `post_quant_conv` y el encoder completo permanecen en fp16 sin modificar. El `config.json` incluido describe la arquitectura upstream (layout de bloques, canales latentes, `latents_mean` / `latents_std`).

La cuantización aplica un absmax por fila a int8 tras una rotación de Hadamard en fp32 (ConvRot) en grupos de 256, sobre las 96 capas lineales del decodificador. No hay información sobre el dataset de entrenamiento del VAE original ni sobre el proceso de fine-tune de Ostris más allá de la descripción cualitativa (suavizado de detalle, mejora de texto pequeño y rostros). No se documentan técnicas como RLHF, DPO ni decodificación especulativa, dado que no es un modelo de lenguaje.

## Capacidades

- Decodificación de latentes a imágenes dentro del pipeline MiniMax-H3-Image en ComfyUI.
- Codificación de imágenes a espacio latente (el encoder se mantiene en fp16).
- Sustitución directa del VAE original mediante el nodo **Load VAE** de ComfyUI.
- Mejora cualitativa del fine-tune de Ostris: suavizado de detalle excesivamente nítido y mejor representación de texto pequeño y rostros.
- Compatibilidad con builds de ComfyUI que incluyan soporte `comfy_kitchen` para int8 ConvRot (`int8_tensorwise`).
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta múltiples idiomas ni modalidades de audio.

## Casos de uso

- Generación de imágenes en ComfyUI con menor huella de memoria: sustituir el VAE fp16 por este fichero int8 reduce el uso de VRAM en el nodo de decodificación, lo que permite mantener el pipeline en GPUs con menos memoria.
- Flujos de trabajo con presupuesto de VRAM ajustado: al pasar de 1,09 GiB a 0,71 GiB, se libera espacio para cargar el UNet/diffusion model con mayor resolución o batch.
- Reproducción de retratos y texto pequeño: el fine-tune de Ostris está orientado a mejorar rostros y texto pequeño, por lo que resulta adecuado en pipelines de carteles, mockups o imágenes con tipografía.
- Prototipado rápido en entornos de investigación: la carga en ComfyUI es directa y no requiere conversión a Diffusers.
- Sustitución de VAE en pipelines existentes de MiniMax-H3-Image sin reentrenar: el fichero es drop-in en `ComfyUI/models/vae/`.
- Evaluación de impacto de la cuantización int8 en calidad visual: la similitud coseno de 0,999962 permite medir la degradación frente al fp16 en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta la métrica de fidelidad de la cuantización:

| Metrica | fp16 (upstream) | Este fichero |
|---|---|---|
| Tamano | 1.09 GiB | 0.71 GiB |
| Lineales cuantizadas | — | 96 (`int8_tensorwise`, ConvRot grupo 256) |
| Peor coseno vs fp16 | — | 0.999962 |

## Requisitos de hardware

- VRAM estimada para el VAE: aproximadamente 0,71 GiB en disco; en VRAM, el fichero int8 más las capas fp16 restantes, en torno a 1 GiB o algo menos en ejecución.
- GPU recomendadas: cualquier GPU con soporte para ComfyUI y al menos 4-6 GB de VRAM libre para el pipeline completo (el VAE es solo un componente).
- Cabe en GPUs de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares, siempre que el resto del pipeline (modelo de difusión) quepa en memoria.
- Opciones de despliegue: ComfyUI con soporte `comfy_kitchen` int8 ConvRot. No es compatible con Diffusers, vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| `ostris/ostris_h3_image_vae` (fp16) | VAE fine-tune | 1.09 GiB | safetensors (Diffusers/ComfyUI) | MiniMax-H3-Image Community License | Diffusers y ComfyUI |
| `ND911/ostris_h3_image_vae_int8_convrot` | VAE int8 ConvRot | 0.71 GiB | safetensors ComfyUI | MiniMax-H3-Image Community License | Solo ComfyUI |
| VAE original de `MiniMaxAI/MiniMax-H3-Image` | VAE base | no disponible | safetensors | MiniMax-H3-Image Community License | Diffusers y ComfyUI |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Restricción territorial de licencia**: el acuerdo excluye expresamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos. El uso, reproducción, modificación, distribución o exhibición fuera del territorio aplicable no está autorizado.
- **No es un checkpoint Diffusers**: `AutoencoderKLMiniMaxH3Image.from_pretrained(...)` no cargará este repositorio porque las 96 lineales están en int8 ConvRot con metadatos `comfy_quant`.
- **Dependencia de ComfyUI**: requiere una build con soporte `comfy_kitchen` int8 ConvRot (`int8_tensorwise`). Sin ella, el fichero no se carga correctamente.
- **Fichero modificado**: no es la publicación de Ostris; es una recodificación. La calidad visual depende del fine-tune original, no de esta cuantización.
- **Riesgo de alucinación**: no aplica en el sentido de texto, pero la cuantización int8 puede introducir artefactos menores en la decodificación, aunque la similitud coseno de 0,999962 sugiere degradación despreciable.
- **Sesgos**: no documentados en la información disponible; hereda los sesgos del VAE y del modelo base MiniMax-H3-Image.
- **Uso comercial**: sujeto a la Sección IV del acuerdo; conviene revisar los términos antes de desplegar en producción.
- **Sin soporte multilingüe ni de texto**: es un componente de imagen, no un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/ND911/ostris_h3_image_vae_int8_convrot
- VAE fine-tune de Ostris: https://huggingface.co/ostris/ostris_h3_image_vae
- Modelo base MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Perfil de Ostris: https://huggingface.co/ostris
