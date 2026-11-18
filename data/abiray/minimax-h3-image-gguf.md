# Abiray/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es un modelo de difusion de tipo Diffusion Transformer (DiT) de un solo flujo disenado para generacion texto-a-imagen de ultra alta resolucion y edicion de imagenes con multiples referencias, hasta 16 MP (4096 x 4096) en solo 6 pasos de muestreo destilado. El modelo base lo desarrolla MiniMaxAI y esta disponible en Hugging Face bajo la licencia comunitaria `minimax-h3-image-community-license-agreement`. La ficha que nos ocupa, `Abiray/MiniMax-H3-Image-GGUF`, es una conversion a formato GGUF de los pesos podados estructuralmente en BF16 publicados por Comfy-Org, pensada para ejecucion en ComfyUI con el nodo `Unet Loader (GGUF)`.

El modelo base declara 33.100 millones de parametros, aunque el checkpoint safetensors del repositorio GGUF registra 20.113.670.232 parametros, coherente con la version podada (`pruned`) sobre la que se ha construido esta conversion. La arquitectura emplea un esquema de muestreo denominado Piecewise Decoupled Diffusion (PDD) calibrado para exactamente 6 pasos, sin CFG (escala 1.0), lo que reduce drasticamente el coste de inferencia frente a modelos de difusion convencionales que requieren decenas de pasos.

La relevancia de esta ficha radica en que ofrece variantes cuantizadas de 2 a 5 bits (de 6,88 GB a 14,10 GB) que permiten ejecutar un modelo de generacion de imagen de gran tamano en GPUs de consumo, manteniendo en FP32 sin cuantizar las capas sensibles (patchifier de entrada de 24 canales, cabeza de salida PDD de 6 pasos y base de modulacion AdaLN de bajo rango) para evitar ruido de cuantizacion y artefactos de rejilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo, con muestreo Piecewise Decoupled Diffusion (PDD) |
| Parametros totales | 33,1 B (modelo base); 20.113.670.232 en el checkpoint safetensors de esta ficha (version podada) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica contexto de texto) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M (GGUF); capas sensibles en FP32 sin cuantizar |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | GGUF (repo de 53,1 GB); modelo base en safetensors BF16 podado |

## Arquitectura y entrenamiento

MiniMax-H3-Image es un Diffusion Transformer de un solo flujo (single-stream) con patchification 2D de 24 canales latentes y un decodificador ViT 2D en el VAE de imagen. El modelo base se entrena con un esquema de destilacion hacia Piecewise Decoupled Diffusion (PDD), que calibra las cabezas de salida para producir muestras de calidad en exactamente 6 pasos con CFG 1.0 (sin clasificador libre de guia). Esta conversion GGUF parte del checkpoint BF16 podado estructuralmente por Comfy-Org (`minimax_h3_image_pruned_bf16.safetensors`), de ahi la diferencia entre los 33,1 B declarados del modelo original y los ~20,1 B del safetensors del repositorio.

La innovacion tecnica clave de esta conversion es la preservacion en FP32 sin cuantizar de tres componentes sensibles: el patchifier de entrada de 24 canales (`video_patch_proj`), la cabeza de salida PDD de 6 pasos (`final_layer`) y la base de modulacion AdaLN de bajo rango (`adaln_basis` / `adaln_t_table`). Ademas, los ficheros GGUF incluyen metadatos de configuracion embebidos (cabecera `config` con el schedule `pdd_sigmas` de 6 pasos), lo que permite cargarlos de forma nativa en ComfyUI-GGUF sin scripts ni parches adicionales. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion texto-a-imagen (text-to-image) de alta resolucion, hasta 16 MP (4096 x 4096) segun la model card del autor.
- Edicion de imagen con multiples referencias (image-to-image / image-editing), con soporte de hasta varias imagenes de referencia.
- Inferencia en 6 pasos de muestreo destilado con CFG 1.0, sin prompt negativo (no se recomienda escalado CFG alto).
- Integracion nativa con ComfyUI mediante el nodo `Unet Loader (GGUF)` y el ecosistema ComfyUI-GGUF.
- Compatibilidad con el text encoder Qwen3-VL-32B (lectura de hidden states de la capa 50), disponible en variantes GGUF, NVFP4/AWQ e INT8.
- VAE de imagen dedicado de 24 canales con decodificador ViT 2D (no compatible con VAEs SD/Flux de 4 canales ni con el VAE de video de 16 canales de versiones H3 anteriores).
- Capacidades multilingues: limitadas al ingles (`en`) segun los metadatos del repositorio.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: no disponible (es un modelo de generacion de imagen, no un LLM).

## Casos de uso

- Generacion de ilustraciones de alta resolucion para produccion editorial: el modelo permite generar imagenes hasta 4096 x 4096 en 6 pasos, lo que encaja en pipelines que necesitan assets de gran formato (portadas, posters, material de marketing) con tiempos de inferencia reducidos.
- Edicion de imagen con multiples referencias en flujos creativos: la capacidad de image-editing con varias imagenes de referencia permite componer personajes, productos o estilos consistentes a partir de varias fuentes, util en diseno de producto y previsualizacion de conceptos.
- Prototipado rapido en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (11,60 GB) cabe en GPUs de 16 GB, lo que permite a disenadores y desarrolladores iterar en local sin depender de servicios en la nube.
- Integracion en ComfyUI para pipelines de automatizacion: al cargarse de forma nativa en ComfyUI-GGUF con metadatos de configuracion embebidos, se puede encadenar con nodos de postproceso, upscaling o composicion dentro de flujos automatizados.
- Generacion por lotes en servidores con GPUs de 24 GB: la variante Q5_K_M (14,10 GB) ofrece fidelidad practicamente indistinguible del BF16 completo y permite servir peticiones en hardware tipo RTX 4090 o A10.
- Despliegue en entornos con VRAM limitada (8-10 GB): la variante Q2_K (6,88 GB) permite ejecutar el modelo en portatiles y GPUs de gama de entrada, adecuada para pruebas, demos o entornos educativos donde prima el ahorro de memoria sobre la fidelidad maxima.
- Creacion de datasets sinteticos de imagen: la generacion controlada por texto y la edicion multi-referencia permiten producir variaciones de imagenes etiquetadas para entrenamiento de otros modelos de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo el modelo DiT, sin contar el text encoder Qwen3-VL-32B ni el VAE):
  - Q2_K (6,88 GB): 8-10 GB de VRAM.
  - Q3_K_M (8,91 GB): 12 GB de VRAM.
  - Q4_K_S (11,60 GB): 12-16 GB de VRAM.
  - Q4_K_M (11,60 GB): 16 GB de VRAM (recomendado como punto de equilibrio).
  - Q5_K_M (14,10 GB): 16-24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A10/A100/H100 para despliegues con mayor paralelismo; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) para Q3_K_M y Q4_K_S; GPUs de 8-10 GB para Q2_K.
- Cabe en GPU de consumo: si, en todas las variantes desde Q2_K (8-10 GB) hasta Q5_K_M (16-24 GB), siempre que se disponga de VRAM suficiente para el text encoder y el VAE adicionales.
- Opciones de despliegue: ComfyUI v0.45.0+ con ComfyUI-GGUF (nodo `Unet Loader (GGUF)`); soporte nativo de los GGUF con metadatos `config` embebidos; fichero opcional `minimax_h3_image_gguf_fix.py` solo como fallback para versiones antiguas de ComfyUI-GGUF. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el modelo esta calibrado para exactamente 6 pasos de muestreo con sampler `euler` y scheduler `simple` o `sgm_uniform`, CFG 1.0.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada que permitan una comparacion cuantitativa fiable. A continuacion se indica lo que si se conoce estructuralmente:

| Modelo | Parametros | Contexto / resolucion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Image (base, MiniMaxAI) | 33,1 B | hasta 16 MP (4096 x 4096), 6 pasos | minimax-h3-image-community-license-agreement | safetensors BF16 | Modelo original de referencia |
| MiniMax-H3-Image-Pruned (Comfy-Org) | ~20,1 B (podado) | hasta 16 MP, 6 pasos | minimax-h3-image-community-license-agreement | safetensors BF16 | Checkpoint podado del que parte esta conversion |
| Abiray/MiniMax-H3-Image-GGUF (esta ficha) | ~20,1 B (podado) | hasta 16 MP, 6 pasos | minimax-h3-image-community-license-agreement | GGUF Q2_K a Q5_K_M | Cuantizaciones para ComfyUI-GGUF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; como modelo de generacion de imagen entrenado con datos a gran escala, es previsible que reproduzca sesgos presentes en sus datos de entrenamiento, pero no hay confirmacion en la model card.
- Riesgo de alucinacion: en modelos de difusion se traduce en artefactos visuales, incoherencias semanticas o detalles inventados respecto al prompt; no se cuantifica en la informacion disponible.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de ingles (`en`); no se garantiza un comportamiento equivalente en otros idiomas.
- Restricciones de licencia: la licencia `minimax-h3-image-community-license-agreement` es una licencia comunitaria, no una licencia open source permisiva; es imprescindible revisar el texto completo en el enlace de licencia del modelo base antes de cualquier uso comercial.
- Dependencias obligatorias: requiere un VAE de imagen dedicado de 24 canales y el text encoder Qwen3-VL-32B (capa 50); no funciona con VAEs SD/Flux de 4 canales ni con el VAE de video de 16 canales de versiones H3 anteriores.
- Parametros de generacion estrictos: el modelo esta calibrado para exactamente 6 pasos, CFG 1.0 y sampler `euler`; usar otros valores puede degradar la calidad de forma significativa.
- Requisitos de software: ComfyUI v0.45.0+ y ComfyUI-GGUF actualizado; versiones antiguas pueden requerir el script de compatibilidad opcional.
- Diferencia de parametros: los 33,1 B declarados corresponden al modelo base original, mientras que esta conversion parte de un checkpoint podado de ~20,1 B; no debe asumirse equivalencia exacta de comportamiento con el modelo sin podar.
- No es un LLM: no soporta generacion de texto, razonamiento, codigo, tool calling ni agentes; su uso esta limitado a tareas de imagen.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Checkpoint podado BF16 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- VAE oficial FP16 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/vae
- Text encoders oficiales (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/text_encoders
- Text encoder GGUF Q4_K_M (Abiray): https://huggingface.co/Abiray/MiniMax-H3-GGUF/blob/main/text_encoders/qwen3vl_32b_minimax_h3-Q4_K_M.gguf
- Text encoder GGUF Q3_K_M (Abiray): https://huggingface.co/Abiray/Qwen3-VL-32B-Instruct-GGUF/blob/main/Qwen3vl_32b_h3-Q3_K_M.gguf
- Workflow de ejemplo para ComfyUI: https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF/blob/main/image_minimax_h3_image_t2i_gguf.json
- ComfyUI-GGUF (repositorio): https://github.com/city96/ComfyUI-GGUF
