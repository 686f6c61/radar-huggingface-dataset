# Infinity-io/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es un modelo de difusion de tipo Diffusion Transformer (DiT) de un solo flujo, desarrollado por MiniMaxAI, disenado para generacion texto-a-imagen de ultra alta resolucion y edicion de imagenes con multiples referencias de hasta 16 MP (4096 x 4096). El modelo original cuenta con 33.100 millones de parametros y emplea una arquitectura de difusion destilada de tipo Piecewise Decoupled Diffusion (PDD) calibrada para inferencia en exactamente 6 pasos de muestreo, lo que reduce drasticamente el coste computacional frente a modelos de difusion convencionales que requieren decenas de pasos.

La ficha que nos ocupa, sin embargo, no es el checkpoint original sino la version cuantizada en formato GGUF publicada por Infinity-io, derivada del checkpoint maestro BF16 podado estructuralmente por Comfy-Org. Esta version cuantizada conserva en FP32 sin cuantizar las capas sensibles del modelo (el patchificador de entrada de 24 canales, la cabeza de salida PDD de 6 pasos y las bases de modulacion AdaLN de bajo rango) para eliminar el ruido de cuantizacion y los artefactos de rejilla, mientras que el resto de los pesos se ofrece en cinco niveles de cuantizacion que van desde Q2_K (6,88 GB) hasta Q5_K_M (14,10 GB).

Su relevancia actual radica en que permite ejecutar un modelo de generacion de imagen de 33.100 millones de parametros en GPUs de consumo, con soporte nativo en ComfyUI-GGUF a traves del nodo `Unet Loader (GGUF)` y sin necesidad de scripts personalizados. El modelo requiere archivos complementarios especificos: un VAE de imagen de 24 canales y el codificador de texto Qwen3-VL-32B, lo que condiciona el despliegue practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo, con muestreo Piecewise Decoupled Diffusion (PDD) destilado a 6 pasos |
| Parametros totales | 20.113.670.232 (version podada y cuantizada); el modelo original MiniMax-H3-Image declara 33.100 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion; el codificador de texto Qwen3-VL-32B define el limite practico del prompt) |
| Tipos de cuantizacion | Q2_K (6,88 GB), Q3_K_M (8,91 GB), Q4_K_S (11,60 GB), Q4_K_M (11,60 GB), Q5_K_M (14,10 GB); capas sensibles en FP32 sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | minimax-h3-image-community-license-agreement (licencia "other", no estandar de codigo abierto) |
| Formato de pesos | GGUF (con metadatos de configuracion embebidos, incluida la programacion `pdd_sigmas` de 6 pasos) |

## Arquitectura y entrenamiento

MiniMax-H3-Image se basa en una arquitectura Diffusion Transformer (DiT) de un solo flujo, es decir, un transformer que procesa conjuntamente las representaciones latentes de la imagen y las del texto en lugar de mantener flujos separados. El modelo emplea un patchificador de entrada de 24 canales (`video_patch_proj`) que opera sobre latentes nativos de 24 canales con patchificacion 2 x 2, y un VAE de imagen con decodificador ViT 2D de 24 canales. La innovacion central es el esquema Piecewise Decoupled Diffusion (PDD), una destilacion que permite generar imagenes de alta calidad en exactamente 6 pasos de muestreo con CFG fijo a 1.0 (sin classifier-free guidance), gracias a una cabeza de salida fusionada (`final_layer`) calibrada para esa programacion. La modulacion AdaLN utiliza una base de bajo rango (`adaln_basis` y `adaln_t_table`) que tambien se preserva en FP32 en la version cuantizada.

En cuanto al entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos no estan disponibles. Lo que si se documenta es el proceso de la version aqui descrita: Comfy-Org proporciono un checkpoint maestro BF16 podado estructuralmente, a partir del cual Infinity-io convirtio directamente los pesos a GGUF. La poda estructural reduce el recuento de parametros respecto al original de 33.100 millones, aunque la cifra exacta de parametros eliminados no se especifica. Las capas sensibles a la cuantizacion se mantienen en FP32 para evitar artefactos de rejilla y ruido numerico. El modelo utiliza como codificador de texto Qwen3-VL-32B, leyendo los estados ocultos de la capa 50, lo que vincula la calidad del prompt a un modelo de lenguaje de gran tamano.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) en resoluciones de hasta 16 MP (4096 x 4096).
- Edicion de imagen con multiples referencias (image-to-image y image-editing), con soporte de hasta 16 imagenes de referencia segun la model card del modelo original.
- Inferencia destilada en 6 pasos de muestreo, con sampler `euler` y scheduler `simple` o `sgm_uniform`, sin CFG (escala 1.0) y sin prompt negativo.
- Integracion nativa con ComfyUI mediante ComfyUI-GGUF (nodo `Unet Loader (GGUF)`), con metadatos de configuracion embebidos que eliminan la necesidad de scripts o parches.
- Capacidad multilingue limitada al ingles: el unico idioma declarado es `en`, y los prompts deben formularse en ese idioma.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada para comprension, audio ni modo thinking; se trata de un modelo generativo de imagen, no de un modelo de lenguaje.

## Casos de uso

- Generacion de imagenes de alta resolucion para produccion editorial: el modelo permite crear ilustraciones de hasta 4096 x 4096 en 6 pasos, lo que lo hace adecuado para portadas, carteles y material grafico que requiere detalle fino sin recurrir a ampliaciones posteriores.
- Edicion de imagen con multiples referencias en flujos de diseno: la capacidad de image-editing con hasta 16 referencias permite mantener coherencia de personajes, productos o estilos a lo largo de una campana, usando las imagenes de referencia como anclas visuales.
- Prototipado rapido en ComfyUI: gracias a la integracion nativa con ComfyUI-GGUF y al workflow de ejemplo incluido (`image_minimax_h3_image_t2i_gguf.json`), un equipo puede montar un pipeline de generacion en una GPU de 16 GB con la cuantizacion Q4_K_M en cuestion de minutos.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante Q2_K (6,88 GB) cabe en GPUs de 8-10 GB, lo que permite generar imagenes de alta resolucion en portatiles y equipos de gama media sin acceso a clústeres.
- Generacion de variaciones de producto para comercio electronico: el modelo puede producir multiples vistas o variantes de un articulo a partir de una imagen de referencia, con la ventaja de los 6 pasos que reducen el coste por imagen en comparacion con modelos de 20-50 pasos.
- Iteracion artistica con control de estilo: la combinacion de prompt en ingles y referencias visuales permite explorar estilos consistentes; la cuantizacion Q5_K_M (14,10 GB) ofrece una fidelidad practicamente indistinguible del BF16 para entregables finales.
- Investigacion en destilacion de difusion: el esquema PDD de 6 pasos y la preservacion en FP32 de las capas de modulacion lo convierten en un caso de estudio util para analizar el impacto de la cuantizacion en modelos destilados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo de difusion, segun cuantizacion: Q2_K, 8-10 GB; Q3_K_M, 12 GB; Q4_K_S, 12-16 GB; Q4_K_M, 16 GB; Q5_K_M, 16-24 GB.
- A esa VRAM hay que sumar la del codificador de texto Qwen3-VL-32B: en GGUF Q3_K_M ocupa 12 GB y en Q4_K_M 14,6 GB; existen tambien variantes NVFP4/AWQ e INT8 en safetensors en el repositorio de Comfy-Org.
- El VAE de imagen de 24 canales en FP16 (`minimax_h3_image_vae_fp16.safetensors`) tambien consume VRAM adicional.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M con comodidad; RTX 4080/4070 Ti (16 GB) para Q4_K_M; RTX 3060 12 GB para Q3_K_M o Q4_K_S; GPUs de 8-10 GB para Q2_K. Para el codificador de texto completo en BF16 se recomienda A100 o H100, aunque las versiones cuantizadas permiten GPUs de consumo.
- Cabe en GPU de consumo: si, en todas las variantes, siempre que se ajuste tambien la VRAM del codificador de texto y del VAE.
- Opciones de despliegue: ComfyUI v0.45.0+ con ComfyUI-GGUF (soporte nativo documentado); el repositorio mantiene `minimax_h3_image_gguf_fix.py` como fallback para versiones antiguas. No se documentan otros runners (vLLM, llama.cpp, TGI, Ollama) para este modelo de difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada; el modelo esta calibrado para exactamente 6 pasos, lo que reduce el coste frente a esquemas de 20-50 pasos, pero no se publican cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image (GGUF, esta ficha) | 20.113.670.232 (podado); original 33,1 B | Hasta 16 MP (4096 x 4096); 6 pasos PDD | Q2_K a Q5_K_M | minimax-h3-image-community-license-agreement | Hugging Face, ComfyUI-GGUF |
| MiniMax-H3-Image (original, MiniMaxAI) | 33,1 B | Hasta 16 MP (4096 x 4096); 6 pasos PDD | BF16 | minimax-h3-image-community-license-agreement | Hugging Face |
| MiniMax-H3-Image (podado BF16, Comfy-Org) | no disponible (checkpoint podado) | Hasta 16 MP (4096 x 4096) | BF16 | minimax-h3-image-community-license-agreement | Hugging Face |
| Otros modelos de difusion de imagen de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria, por lo que la comparativa se limita a las variantes del propio MiniMax-H3-Image.

## Limitaciones y advertencias

- Licencia restrictiva: la minimax-h3-image-community-license-agreement es una licencia "other" no estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones de atribucion, uso o redistribucion.
- Idioma: el modelo solo declara soporte de ingles; los prompts en castellano u otros idiomas pueden degradar la calidad o no funcionar correctamente.
- Dependencia de archivos complementarios: requiere un VAE de 24 canales especifico y el codificador Qwen3-VL-32B; usar VAEs de 4 canales (SD/Flux) o el VAE de video de 16 canales de versiones anteriores de H3 produce resultados incorrectos.
- Sensibilidad a la cuantizacion en capas concretas: aunque las capas criticas se preservan en FP32, las cuantizaciones de 2 y 3 bits pueden introducir perdida de calidad perceptible; la propia model card recomienda Q4_K_M como punto de equilibrio.
- Parametros de muestreo fijos: el modelo esta calibrado para exactamente 6 pasos, sampler `euler`, CFG 1.0 y sin prompt negativo; desviarse de esta configuracion puede degradar la salida.
- Riesgo de alucinacion visual y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad factual; como todo modelo generativo de imagen, puede producir contenido inexacto, estereotipado o no solicitado.
- Recuento de parametros: la cifra de 20.113.670.232 corresponde a la version podada y cuantizada, no al modelo original de 33,1 B; no debe citarse como equivalente.
- Madurez del repositorio: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validacion independiente.
- Rendimiento no verificado: no se publican benchmarks ni cifras de latencia/throughput, lo que dificulta estimar costes de produccion.

## Enlaces

- Repositorio Hugging Face de esta version GGUF: https://huggingface.co/Infinity-io/MiniMax-H3-Image-GGUF
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Checkpoint podado BF16 de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- VAE oficial FP16: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/vae
- Codificadores de texto oficiales: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/text_encoders
- Codificador de texto GGUF Q4_K_M (Abiray): https://huggingface.co/Abiray/MiniMax-H3-GGUF/blob/main/text_encoders/qwen3vl_32b_minimax_h3-Q4_K_M.gguf
- Codificador de texto GGUF Q3_K_M (Abiray): https://huggingface.co/Abiray/Qwen3-VL-32B-Instruct-GGUF/blob/main/Qwen3vl_32b_h3-Q3_K_M.gguf
- Workflow de ejemplo para ComfyUI: https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF/blob/main/image_minimax_h3_image_t2i_gguf.json
- ComfyUI-GGUF (repositorio): https://github.com/city96/ComfyUI-GGUF
