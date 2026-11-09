# Plaguekind/H3-ImageEdit

## Resumen

H3-ImageEdit es un modelo derivado (finetune y cuantizacion) del modelo base MiniMaxAI/MiniMax-H3, publicado por el usuario Plaguekind en Hugging Face. Se trata de un modelo de difusion orientado a la generacion y edicion de imagenes, construido a partir de una cadena de fusiones que combina el modelo H3 de MiniMax con los modelos TenStrip/10Eros-Max y Plaguekind/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32. El autor lo describe como su cuantizacion de "Eros beta7, singularity v2, prism y pika flex".

El modelo no es un LLM de texto, sino un modelo de difusion que se ejecuta en ComfyUI mediante un conjunto especifico de nodos personalizados (ComfyUI-PlagueKind-Nodes y dependencias). La model card esta orientada a flujos de trabajo practicos: indica versiones minimas de ComfyUI, PyTorch y del nodepack, asi como los VAE y el text encoder necesarios para que el pipeline funcione.

La relevancia de esta ficha es acotada: la informacion publicada es escasa y de caracter eminentemente practico (instrucciones de instalacion, enlaces a pesos y a VAEs), sin datos de arquitectura, entrenamiento ni benchmarks. Todo lo que se detalla a continuacion se limita a lo que el autor expone en la model card y en los resultados de busqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (derivado de MiniMaxAI/MiniMax-H3); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a difusion de imagen) |
| Tipos de cuantizacion | Pesos en safetensors; el autor menciona cuantizaciones propias (w6a8_g32) y VAEs int8 y fp32; no se detalla el conjunto completo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo de difusion, LoRA bf16, VAEs int8/fp32) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de parametros, el volumen de datos de entrenamiento ni el proceso de alineacion (RLHF/DPO). El autor solo indica que el modelo es una cuantizacion propia resultante de combinar Eros beta7, singularity v2, prism y pika flex, y que se apoya en el modelo base MiniMax-H3. La cadena de modelos base declarada incluye MiniMaxAI/MiniMax-H3, TenStrip/10Eros-Max y Plaguekind/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32.

El pipeline de inferencia descrito en la model card incluye componentes concretos: un text encoder basado en Qwen3-VL 32B (qwen3vl_32b_minimax_h3_native_w4w6, 17,93 GB), varios VAE (audio, encode para refmod, decode p-h3-image int8 y un VAE de preview taeh3) y una LoRA de edicion (p-h3-image_lora_bf16). El autor recomienda entre 5 y 12 pasos de muestreo con ajustes por defecto, y un rango de resolucion de 4 a 8 megapixeles para obtener los mejores resultados.

## Capacidades

- Generacion de imagenes a partir de texto (T2I), desactivando el nodo de imagen o eliminando las imagenes de entrada.
- Edicion de imagenes mediante el uso de "refmods" (referencias), con un VAE de encode especifico (lynnreal light) obligatorio en el slot del encoder cuando se usan referencias.
- Creacion de refmods dentro de un subgrafo del flujo de ComfyUI.
- Soporte de LoRA de edicion (p-h3-image_lora_bf16) para modificar el comportamiento del modelo.
- Integracion con un nodo "sparse" que el autor mantiene por la opcion de refuerzo de referencias (ref enforcement), no por velocidad.
- Flujo de trabajo con nodo Preview-Image en lugar de Save, pensado para evitar acumular intentos fallidos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio mas alla del VAE de audio para creacion de refmods.

## Casos de uso

- Edicion de imagenes con referencias visuales: el modelo permite introducir imagenes de referencia mediante refmods y un VAE de encode especifico, lo que resulta util para mantener consistencia de estilo o de sujeto entre generaciones.
- Generacion de imagenes en produccion creativa dentro de ComfyUI: el flujo esta disenado para ejecutarse con nodos personalizados y versiones concretas de ComfyUI y PyTorch, lo que facilita su integracion en pipelines de estudio ya basados en ComfyUI.
- Iteracion rapida con preview: el uso del nodo Preview-Image en lugar de Save permite revisar resultados sin acumular archivos, adecuado para sesiones de prueba y ajuste de parametros.
- Aplicacion de LoRA de edicion: la LoRA bf16 incluida permite adaptar el modelo a tareas de edicion especificas sin reentrenar el modelo completo.
- Experimentacion con cuantizaciones: al ser una cuantizacion propia (w6a8_g32) y ofrecer VAEs int8, es util para probar el equilibrio entre calidad y requisitos de memoria en equipos de gama alta.
- Generacion a resoluciones de 4-8 MP: el rango recomendado por el autor lo hace adecuado para imagenes de salida de alta resolucion en flujos de trabajo profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor menciona un text encoder de 17,93 GB y pesos en safetensors, pero no detalla el consumo total.
- GPU recomendadas: no disponibles; el autor menciona de pasada su interes en una RTX 5090, sin especificar requisitos oficiales.
- Compatibilidad con GPU de consumo: no confirmada; el uso de un text encoder de ~18 GB y VAEs int8 sugiere requisitos de memoria elevados, pero no se aportan cifras.
- Opciones de despliegue: ComfyUI (con ComfyUI-PlagueKind-Nodes, ComfyUI-KJNodes, Rgthree-comfy, ComfyUI-VideoHelperSuite, ComfyUI-MiniMaxH3Mod y ComfyUI_PowerShiftScheduler), ComfyUI 0.44.0 o superior y PyTorch 2.13cu130 o superior.
- Latencia y throughput: no disponibles; solo se indica un rango recomendado de 5-12 pasos de muestreo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar las condiciones de uso comercial.
- No se especifican idiomas soportados ni sesgos conocidos.
- El modelo depende de una cadena de nodos personalizados y de versiones concretas de ComfyUI, PyTorch y del nodepack; el autor advierte que no respondera a comentarios sobre errores de nodos si no se actualiza el nodepack.
- Requiere componentes externos especificos (text encoder Qwen3-VL 32B, varios VAE y una LoRA) alojados en distintos repositorios, lo que anade complejidad de despliegue y riesgo de enlaces o versiones obsoletas.
- Al ser una cuantizacion y fusion de varios modelos, la calidad puede diferir de la del modelo base MiniMax-H3; no hay evaluacion publicada que lo cuantifique.
- Riesgo de alucinacion visual y de artefactos inherente a los modelos de difusion, sin datos especificos del autor.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Plaguekind/H3-ImageEdit
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base TenStrip/10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- Modelo base Plaguekind/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32: https://huggingface.co/Plaguekind/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32
- Pesos del modelo de difusion: https://huggingface.co/Plaguekind/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32/resolve/main/H3_Eros_Sing_PRISM_Pika_Parasyte_w6a8_g32.safetensors
- VAE de audio: https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors
- VAE de encode (lynnreal light, int8): https://huggingface.co/Kijai/MiniMax-H3-experimental/resolve/main/minimax_h3_lynnreal_light_vae_int8_convrot.safetensors
- VAE de decode (p-h3-image, int8): https://huggingface.co/PrunaAI/P-H3-Image-Comfy/resolve/main/vae/p-h3-image_vae_int8_convrot.safetensors
- VAE de preview (taeh3): https://huggingface.co/Kijai/MiniMax-H3-TAE/resolve/main/vae_approx/taeh3.safetensors
- Text encoder (Qwen3-VL 32B): https://huggingface.co/LokkenJP/TenEros_Max_optimized_learned/resolve/main/text_encoder/qwen3vl_32b_minimax_h3_native_w4w6_17.93gb.safetensors
- LoRA de edicion (bf16): https://huggingface.co/PrunaAI/P-H3-Image-Comfy/resolve/main/loras/p-h3-image_lora_bf16.safetensors
- Nodos ComfyUI-PlagueKind-Nodes: https://github.com/PlagueKind/Comfyui-PlagueKind-Nodes
- Nodos ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- Nodos Rgthree-comfy: https://github.com/rgthree/rgthree-comfy
- Nodos ComfyUI-VideoHelperSuite: https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite
- Nodos ComfyUI-MiniMaxH3Mod: https://github.com/Luisacaotica/ComfyUI-MiniMaxH3Mod
- Nodos ComfyUI_PowerShiftScheduler: https://github.com/silveroxides/ComfyUI_PowerShiftScheduler
- Perfil del autor en Hugging Face: https://huggingface.co/Plaguekind/models
- Otro modelo del autor: https://huggingface.co/Plaguekind/Minimax-H3
