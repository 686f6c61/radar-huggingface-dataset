# Infinix-io/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes desarrollado por MiniMaxAI, publicado originalmente como un Diffusion Transformer (DiT) de un solo flujo con 33.100 millones de parámetros. Está diseñado para generación texto-a-imagen de altísima resolución (hasta 16 MP, 4096 × 4096 píxeles) y edición de imágenes con múltiples referencias, empleando un proceso de muestreo destilado de solo 6 pasos. El repositorio aquí descrito, Infinix-io/MiniMax-H3-Image-GGUF, contiene cuantizaciones GGUF del checkpoint maestro BF16 podado estructuralmente y publicado por Comfy-Org.

Esta ficha se centra en la versión cuantizada en GGUF, que reduce el peso del modelo desde los aproximadamente 53 GB del repositorio hasta archivos de entre 6,88 GB (Q2_K) y 14,10 GB (Q5_K_M). Las capas sensibles del modelo (el patchificador de entrada de 24 canales `video_patch_proj`, la cabeza de salida PDD `final_layer` y las bases de modulación AdaLN de bajo rango) se preservan estrictamente en FP32 sin cuantizar para eliminar artefactos de rejilla y ruido de cuantización.

El modelo es relevante porque permite ejecutar un generador de imágenes de 33B parámetros en GPUs de consumo (desde 8 GB de VRAM con Q2_K hasta 24 GB con Q5_K_M), integrándose de forma nativa en ComfyUI-GGUF. Requiere, no obstante, archivos complementarios obligatorios: un VAE de imagen de 24 canales y el codificador de texto Qwen3-VL-32B, lo que eleva considerablemente los requisitos totales de memoria respecto a los pesos del DiT por sí solos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo, con muestreo Piecewise Decoupled Diffusion (PDD) destilado a 6 pasos |
| Parametros totales | 20.113.670.232 (checkpoint safetensors); el modelo original se describe como 33,1B, la diferencia corresponde a la poda estructural |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M (GGUF); capas sensibles en FP32 sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | GGUF (cuantizado); checkpoint maestro BF16 en safetensors disponible en Comfy-Org |

## Arquitectura y entrenamiento

MiniMax-H3-Image es un Diffusion Transformer (DiT) de un solo flujo entrenado con un esquema de destilación denominado Piecewise Decoupled Diffusion (PDD), que permite la inferencia en exactamente 6 pasos de muestreo con CFG fijado a 1,0 (sin classifier-free guidance). El modelo opera sobre latentes nativos de 24 canales con un patchificador 2 × 2, y utiliza un decodificador VAE de imagen basado en ViT 2D de 24 canales, distinto de los VAE estándar de 4 canales (SD/Flux) y del VAE de vídeo de 16 canales de versiones anteriores de H3.

El codificador de texto es Qwen3-VL-32B, del que se leen los estados ocultos de la capa 50. La versión GGUF de este repositorio se convirtió directamente desde el checkpoint maestro BF16 podado estructuralmente (`minimax_h3_image_pruned_bf16.safetensors`) publicado por Comfy-Org. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la preservación en FP32 de las capas sensibles (patchificador de entrada, cabeza de salida PDD y bases de modulación AdaLN) para evitar ruido de cuantización.

## Capacidades

- Generación texto-a-imagen de ultra alta resolución, hasta 16 MP (4096 × 4096 píxeles).
- Edición de imágenes con múltiples referencias (image-to-image e image-editing).
- Inferencia destilada en 6 pasos de muestreo con CFG 1,0, lo que reduce drásticamente el coste computacional frente a modelos de difusión de decenas de pasos.
- Carga nativa en ComfyUI-GGUF mediante `Unet Loader (GGUF)`, con metadatos de configuración embebidos (`pdd_sigmas` con el calendario de 6 pasos).
- Soporte de cuantización GGUF en múltiples niveles para adaptarse a distintos presupuestos de VRAM.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusión de imágenes).

## Casos de uso

- Generación de imágenes de alta resolución para ilustración y diseño: el modelo produce imágenes de hasta 4096 × 4096 píxeles en 6 pasos, adecuado para material gráfico que requiere detalle fino sin reescalado posterior.
- Edición de imágenes con múltiples referencias: permite combinar varias imágenes de entrada como referencia para tareas de edición, útil en flujos de retoque y composición.
- Prototipado en estaciones de trabajo con GPU de consumo: con la cuantización Q2_K (6,88 GB) puede ejecutarse en GPUs de 8-10 GB de VRAM, lo que facilita pruebas locales sin infraestructura de datacenter.
- Integración en pipelines de ComfyUI: el repositorio incluye un workflow listo para importar (`image_minimax_h3_image_t2i_gguf.json`) y soporte nativo en ComfyUI-GGUF, lo que agiliza la incorporación a flujos de producción basados en nodos.
- Generación por lotes en servidores con 24 GB de VRAM: la variante Q5_K_M (14,10 GB) ofrece fidelidad indistinguible del BF16 y es adecuada para producción de imágenes en serie, siempre que se añada la memoria del VAE y del codificador de texto.
- Investigación sobre cuantización de modelos de difusión: la preservación en FP32 de capas sensibles permite estudiar el impacto de la cuantización en la calidad visual y en artefactos de rejilla.
- Despliegue en entornos con restricciones de memoria: las variantes Q3_K_M y Q4_K_S permiten ajustar el equilibrio entre calidad y huella de memoria para GPUs de 12-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el DiT según cuantización: Q2_K 8-10 GB, Q3_K_M 12 GB, Q4_K_S 12-16 GB, Q4_K_M 16 GB, Q5_K_M 16-24 GB.
- A esta VRAM hay que sumar la del VAE de imagen de 24 canales (FP16) y la del codificador de texto Qwen3-VL-32B, que en Q4_K_M ocupa 14,6 GB y en Q3_K_M 12 GB. El total real de memoria es, por tanto, muy superior al del DiT aislado.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M y Q4_K_M con margen; RTX 4080/4070 Ti (16 GB) para Q4_K_M; GPUs de 12 GB para Q3_K_M y Q4_K_S; GPUs de 8-10 GB para Q2_K.
- Cabe en GPU de consumo en todas las variantes del DiT, aunque el codificador de texto de 32B puede requerir cuantización adicional o descarga a CPU.
- Opciones de despliegue: ComfyUI v0.45.0 o superior con ComfyUI-GGUF (`Unet Loader (GGUF)`). El repositorio incluye un script opcional de compatibilidad (`minimax_h3_image_gguf_fix.py`) para versiones antiguas de ComfyUI-GGUF.
- Parámetros de generación recomendados: sampler `euler`, scheduler `simple` o `sgm_uniform`, 6 pasos, CFG 1,0, denoise 1,0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image (GGUF, este repo) | 20,1B (checkpoint safetensors); 33,1B nominal | Hasta 16 MP (4096 × 4096), 6 pasos | GGUF Q2_K-Q5_K_M | minimax-h3-image-community-license-agreement | Hugging Face (Infinix-io) |
| MiniMax-H3-Image (original, Comfy-Org) | 33,1B | Hasta 16 MP (4096 × 4096), 6 pasos | safetensors BF16 podado | minimax-h3-image-community-license-agreement | Hugging Face (Comfy-Org) |
| Modelos de difusion de imagen de proposito general (SD/Flux) | no disponible | no disponible | safetensors, GGUF | varía según modelo | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`en`); el rendimiento en otros idiomas no está garantizado.
- Dependencias obligatorias: requiere un VAE de imagen específico de 24 canales y el codificador de texto Qwen3-VL-32B. No funciona con VAE estándar de 4 canales ni con el VAE de vídeo de 16 canales de versiones anteriores de H3.
- Requisitos de memoria reales: aunque el DiT cuantizado quepa en 8 GB, el codificador de texto de 32B y el VAE elevan significativamente la VRAM total necesaria.
- Parámetros de muestreo rígidos: el modelo está calibrado para exactamente 6 pasos y CFG 1,0; usar otros valores puede degradar la calidad.
- Cuantización: las variantes de 2 y 3 bits pueden introducir pérdida de calidad; las capas sensibles se preservan en FP32, pero el resto del modelo sí se cuantiza.
- Licencia: se rige por la minimax-h3-image-community-license-agreement, que puede imponer restricciones al uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- Riesgo de sesgos y alucinaciones visuales: no se documentan evaluaciones de sesgo en la información disponible; como todo modelo generativo de imágenes, puede producir contenido inexacto o estereotipado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no oficial de MiniMaxAI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Infinix-io/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Checkpoint podado BF16 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- VAE de imagen FP16: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/vae
- Codificadores de texto oficiales: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/text_encoders
- Codificador de texto GGUF Q4_K_M (Abiray): https://huggingface.co/Abiray/MiniMax-H3-GGUF/blob/main/text_encoders/qwen3vl_32b_minimax_h3-Q4_K_M.gguf
- Codificador de texto GGUF Q3_K_M (Abiray): https://huggingface.co/Abiray/Qwen3-VL-32B-Instruct-GGUF/blob/main/Qwen3vl_32b_h3-Q3_K_M.gguf
- Workflow de ComfyUI: https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF/blob/main/image_minimax_h3_image_t2i_gguf.json
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
