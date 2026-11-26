# aevionlabs/MiniMax-H3-Image-GGUF_2

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes basado en un Diffusion Transformer (DiT) de un solo flujo, desarrollado por MiniMax AI. El modelo original cuenta con 33.100 millones de parámetros y está diseñado para generación texto-a-imagen de altísima resolución (hasta 16 MP, 4096 × 4096 píxeles) y edición de imágenes con múltiples referencias, todo ello en tan solo 6 pasos de muestreo destilado. Esta ficha describe la versión cuantizada en GGUF publicada por el usuario aevionlabs, derivada del checkpoint maestro BF16 podado estructuralmente por Comfy-Org.

La relevancia de esta publicación radica en que hace accesible un modelo DiT de gran tamaño en hardware de consumo: las cuantizaciones van desde Q2_K (6,88 GB) hasta Q5_K_M (14,10 GB), lo que permite ejecutarlo en GPUs con 8-24 GB de VRAM mediante ComfyUI. El modelo emplea una arquitectura de difusión desacoplada por tramos (Piecewise Decoupled Diffusion, PDD) calibrada específicamente para inferencia en 6 pasos con CFG desactivado.

El repositorio incluye metadatos de configuración embebidos que permiten la carga nativa en ComfyUI-GGUF sin scripts adicionales. Requiere archivos complementarios obligatorios: un VAE de imagen de 24 canales y el codificador de texto Qwen3-VL-32B (leyendo estados ocultos de la capa 50).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo, con PDD (Piecewise Decoupled Diffusion) |
| Parámetros totales | 20.113.670.232 (checkpoint podado en safetensors); 33,1B en el modelo original |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M (capas sensibles en FP32 sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | GGUF (repo de 53,1 GB); modelo base en BF16 safetensors |

## Arquitectura y entrenamiento

MiniMax-H3-Image es un Diffusion Transformer de un solo flujo con 33,1B de parámetros en su versión original. La variante aquí publicada parte del checkpoint BF16 podado estructuralmente por Comfy-Org, que reduce el recuento a aproximadamente 20,1B de parámetros. El modelo utiliza una arquitectura PDD (Piecewise Decoupled Diffusion) entrenada específicamente para inferencia destilada en 6 pasos, con cabezas de salida fusionadas calibradas para exactamente ese número de pasos.

El proceso de cuantización preserva en FP32 sin cuantizar varias capas sensibles: el patchificador de entrada de 24 canales (`video_patch_proj`), la cabeza de salida de 6 pasos PDD (`final_layer`) y la base de modulación AdaLN de bajo rango (`adaln_basis` / `adaln_t_table`). El objetivo declarado es eliminar el ruido de cuantización y los artefactos de rejilla. Los archivos GGUF incluyen metadatos de configuración embebidos con el calendario `pdd_sigmas` de 6 pasos, lo que permite la carga nativa en ComfyUI-GGUF. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución nativa de hasta 16 MP (4096 × 4096 píxeles).
- Edición de imágenes con múltiples referencias (hasta 16 referencias según la model card).
- Transformación imagen-a-imagen (image-to-image).
- Inferencia destilada en 6 pasos de muestreo, sin necesidad de CFG (escala 1,0).
- Latentes nativos de 24 canales con patchificación 2 × 2.
- Integración nativa con ComfyUI mediante ComfyUI-GGUF (`Unet Loader (GGUF)`).
- Soporte de cuantización progresiva con capas críticas preservadas en FP32.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generación de arte conceptual en alta resolución: el modelo produce imágenes de hasta 4096 × 4096 píxeles en 6 pasos, lo que permite iterar rápidamente sobre bocetos de producción en estudios de diseño sin incurrir en costes elevados de muestreo.
- Edición de imágenes con múltiples referencias: útil para mantener la coherencia de personajes o productos a partir de hasta 16 imágenes de referencia, por ejemplo en campañas de marketing donde se necesita consistencia visual entre piezas.
- Prototipado en hardware de consumo: la cuantización Q2_K (6,88 GB) permite ejecutar el modelo en portátiles y GPUs de gama de entrada con 8-10 GB de VRAM, facilitando pruebas locales sin infraestructura en la nube.
- Pipelines de generación por lotes en ComfyUI: la carga nativa con ComfyUI-GGUF y el workflow incluido (`image_minimax_h3_image_t2i_gguf.json`) permiten automatizar la producción de imágenes en flujos de trabajo nodales existentes.
- Restauración y retoque fotográfico asistido: la modalidad imagen-a-imagen con 6 pasos permite aplicar transformaciones controladas sobre fotografías existentes con baja latencia.
- Investigación en cuantización de DiT: el repositorio sirve como referencia para estudiar el impacto de distintas cuantizaciones (Q2_K a Q5_K_M) sobre la calidad visual, dado que preserva capas sensibles en FP32 y ofrece cinco variantes comparables.
- Despliegue en entornos con VRAM limitada: la variante Q4_K_M (11,60 GB) se posiciona como el punto de equilibrio recomendado para GPUs de 16 GB, con calidad visual casi sin pérdidas según el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (según la model card):
  - Q2_K (6,88 GB): 8-10 GB de VRAM.
  - Q3_K_M (8,91 GB): 12 GB de VRAM.
  - Q4_K_S (11,60 GB): 12-16 GB de VRAM.
  - Q4_K_M (11,60 GB): 16 GB de VRAM (recomendado).
  - Q5_K_M (14,10 GB): 16-24 GB de VRAM.
- Además del modelo principal, se requiere el VAE de imagen de 24 canales en FP16 y el codificador de texto Qwen3-VL-32B, lo que incrementa sustancialmente los requisitos totales de memoria (el codificador de texto en Q4_K_M pesa 14,6 GB y en Q3_K_M, 12 GB).
- GPU recomendadas: no se especifican modelos concretos; la model card indica rangos de VRAM. Las variantes Q2_K y Q3_K_M caben en GPUs de consumo de gama media-alta; Q4_K_M y Q5_K_M requieren GPUs de 16-24 GB.
- Opciones de despliegue: ComfyUI v0.45.0+ con ComfyUI-GGUF. No se documentan otros motores (vLLM, llama.cpp, TGI, Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los datos disponibles no permiten establecer una comparación rigurosa con alternativas de la misma categoría (DiT de generación de imágenes) en términos de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia comunitaria específica (`minimax-h3-image-community-license-agreement`): es necesario revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El modelo solo declara soporte de inglés (`en`), lo que puede limitar la calidad de las indicaciones en otros idiomas.
- La inferencia está calibrada para exactamente 6 pasos con CFG a 1,0; usar otros valores de pasos o escalas de CFG puede degradar gravemente la calidad de salida.
- Riesgo de alucinación visual inherente a los modelos generativos: pueden producirse artefactos, inconsistencias anatómicas o detalles no solicitados, especialmente en resoluciones extremas.
- La cuantización agresiva (Q2_K, Q3_K_M) puede introducir pérdida de calidad visual, aunque el autor afirma preservar las capas sensibles en FP32.
- Requiere archivos complementarios específicos: no funciona con VAEs estándar de 4 canales (SD/Flux) ni con el VAE de vídeo de 16 canales de versiones anteriores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.
- No se dispone de información sobre sesgos conocidos ni sobre evaluaciones de seguridad del modelo.
- Los requisitos combinados de modelo, VAE y codificador de texto Qwen3-VL-32B pueden superar la VRAM de muchas GPUs de consumo incluso con cuantizaciones bajas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aevionlabs/MiniMax-H3-Image-GGUF_2
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Checkpoint podado BF16 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- VAE de imagen FP16: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/vae
- Codificadores de texto oficiales: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/text_encoders
- Codificador de texto GGUF Q4_K_M (Abiray): https://huggingface.co/Abiray/MiniMax-H3-GGUF/blob/main/text_encoders/qwen3vl_32b_minimax_h3-Q4_K_M.gguf
- Codificador de texto GGUF Q3_K_M (Abiray): https://huggingface.co/Abiray/Qwen3-VL-32B-Instruct-GGUF/blob/main/Qwen3vl_32b_h3-Q3_K_M.gguf
- Workflow de ComfyUI: https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF/blob/main/image_minimax_h3_image_t2i_gguf.json
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
