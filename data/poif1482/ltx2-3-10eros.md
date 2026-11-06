# Poif1482/LTX2.3-10Eros

## Resumen

LTX2.3-10Eros es un modelo de difusion para generacion de video a partir de imagen (image-to-video, I2V) publicado por el usuario Poif1482 en Hugging Face. Se trata de un merge o remezcla de pesos derivado de la familia LTX 2.3 (arquitectura de difusion de video) y del modelo base Sulphur-2-base, orientado a la generacion de video con contenido explicito y motion anatomico detallado. El repositorio ocupa 424 GB y se distribuye en formato diffusers, lo que sugiere pesos en BF16/FP8 empaquetados como checkpoint completo con CLIP y VAE incluidos.

El modelo no es un entrenamiento desde cero ni un modelo base oficial: es una mezcla por capas (layer-scaled merge) de distintos pasos de entrenamiento, con ajustes en las puertas de atencion (attn_1 y attn_2) para recuperar capacidades de motion explicito presentes en versiones anteriores. Segun la model card, las versiones 1.2, 1.3, 1.4 y 1.5 son casi el mismo modelo y difieren en como se gestionan esas puertas de atencion; la 1.5 aplica una rampa lineal sobre las puertas para abrir detalles explicitos.

Es relevante ahora porque la comunidad de modelos de video open source esta explorando merges especializados y destilaciones (DMD, LoRAs hibridas) para reducir pasos de inferencia y mejorar el control del motion. 10Eros se posiciona como un checkpoint para flujos I2V con LoRAs DMD hibridas, aunque su naturaleza de remezcla y la ausencia de documentacion tecnica formal limitan su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (familia LTX 2.3), transformer de video; detalles exactos no disponibles |
| Parametros totales | no disponible (la model card menciona "base 22b dev model" como referencia del modelo base LTX, no confirmado para este merge) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video; condicionado por imagen inicial y prompt de texto) |
| Tipos de cuantizacion | BF16, FP8 (fp8_mixed_learned), INT8, GGUF (repos de terceros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | diffusers / safetensors (checkpoint completo con CLIP y VAE); variantes GGUF y FP8 de terceros |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que pertenece a la familia LTX 2.3, un modelo de difusion para video. El autor describe 10Eros como un merge por capas escaladas (layer-scaled merges) de distintos pasos de entrenamiento, no como una fusion directa de pesos. Las diferencias entre versiones (1.2 a 1.5) residen en el tratamiento de las puertas de atencion attn_1 y attn_2: la version 1.5 aplica una rampa lineal sobre esas puertas para recuperar detalles explicitos y motion anatomico que estaban presentes en la version 1.2 y en los pesos "sulphur EXP".

El modelo se apoya en Sulphur-2-base y esta disenado para funcionar con LoRAs DMD (destilacion) hibridas, que reducen el numero de pasos de inferencia. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; al ser un merge, el "entrenamiento" consiste en la combinacion de pesos existentes. El autor advierte que LoRAs destiladas de gran tamano pueden danar el fine-tune del modelo y recomienda variantes cond_safe.

## Capacidades

- Generacion de video a partir de una imagen inicial (image-to-video), con evolucion de la escena condicionada por el prompt de texto.
- Control de motion, composicion y cambios anatomicos mediante prompts descriptivos y directivos; el autor indica que LTX tiene poco razonamiento propio y que hay que especificar cada movimiento.
- Generacion de audio asociado a la escena (dialogo, sonidos de fondo, foley) descrito en el prompt, segun las instrucciones de mejora de prompt de la model card.
- Soporte de LoRAs: DMD hibridas para destilacion y aceleracion, y LoRAs de concepto para la familia LTX 2.3.
- Integracion con ComfyUI mediante nodos propios (10S-Comfy-nodes) y workflows publicados por el autor.
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Modo thinking, vision o audio como LLM: no disponible.

## Casos de uso

- Generacion de video I2V con motion explicito: partiendo de una imagen fija, el modelo produce una secuencia animada donde el prompt dicta cada movimiento corporal y cambio de composicion. Es adecuado porque el merge esta optimizado para motion anatomico detallado.
- Prototipado de escenas para animacion: usar el modelo para previsualizar como evoluciona una composicion a partir de un frame clave, con control fino del motion mediante prompts descriptivos.
- Creacion de clips con audio integrado: el modelo permite describir dialogo y efectos de sonido en el prompt, generando video con audio coherente en secuencia temporal.
- Flujos de trabajo en ComfyUI con LoRAs DMD: integracion en pipelines de generacion acelerada usando las LoRAs hibridas recomendadas, reduciendo pasos de inferencia frente a un sampler completo.
- Experimentacion con merges y fine-tunes: el checkpoint esta pensado como base para aplicar LoRAs y parches de anatomia, util para investigadores que estudian el efecto de merges por capas y puertas de atencion.
- Generacion de contenido para adultos con control de prompt: el modelo esta orientado explicitamente a contenido para adultos (tag not-for-all-audiences), con enfasis en terminologia anatomica y motion explicito.
- Despliegue cuantizado en hardware limitado: las variantes GGUF e INT8/FP8 de terceros permiten ejecutar el modelo en GPUs con menos VRAM que la version BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 424 GB, lo que corresponde a pesos BF16 de un modelo grande; la version BF16 requiere probablemente varias GPUs o una GPU con 80 GB o mas. Las variantes FP8, INT8 y GGUF reducen el requisito, pero no se especifican cifras.
- GPU recomendadas: no disponible. Por el tamano del checkpoint, se espera que la version completa requiera A100/H100 de 80 GB o configuraciones multi-GPU; las versiones cuantizadas podrian caber en RTX 4090 (24 GB) o inferiores, sin datos confirmados.
- Cabe en consumer GPU: posiblemente en versiones GGUF/INT8, sin confirmacion del autor.
- Opciones de despliegue: diffusers, ComfyUI (con nodos 10S-Comfy-nodes), llama.cpp/GGUF para las variantes cuantizadas de terceros. vLLM y TGI no son aplicables a un modelo de difusion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LTX2.3-10Eros | no disponible | no disponible | no disponible | Hugging Face (Poif1482) | Merge I2V especializado en contenido explicito, con LoRAs DMD |
| Sulphur-2-base | no disponible | no disponible | no disponible | Hugging Face (SulphurAI) | Modelo base del que depende 10Eros |
| LTX 2.3 base (22b dev) | 22b (referencia en model card, no confirmado) | no disponible | no disponible | Hugging Face | Modelo base de la familia LTX 2.3 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como not-for-all-audiences y orientado a material explicito; no es apto para uso general ni para produccion sin filtros y controles adecuados.
- Licencia no disponible: al no especificarse licencia, no se puede garantizar el uso comercial; ademas, al ser un merge de Sulphur-2-base y LTX 2.3, las condiciones de los modelos originales podrian aplicar.
- Calidad inestable: el autor reconoce problemas de anatomia incorrecta, subtitulos no deseados y transiciones inesperadas en versiones anteriores; la 1.5 intenta mitigarlos pero no hay garantia.
- Dependencia de LoRAs: el modelo esta disenado para funcionar con LoRAs DMD hibridas; sin ellas el rendimiento y la calidad pueden degradarse.
- Prompt muy estricto: LTX tiene poco razonamiento propio, por lo que hay que describir cada movimiento y elemento de audio; prompts vagos producen resultados pobres.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede inventar anatomia o elementos no presentes en la imagen inicial.
- Sin datos de benchmarks ni evaluacion objetiva: no hay metricas publicadas que permitan comparar su calidad con alternativas.
- Idiomas no especificados: se desconoce el soporte multilingue de los prompts.
- Repositorio de 424 GB: el almacenamiento y la transferencia son costosos; las variantes cuantizadas mitigan pero anaden dependencia de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Poif1482/LTX2.3-10Eros
- Workflows del autor: https://huggingface.co/TenStrip/LTX2.3-10Eros_Workflows
- Nodos ComfyUI: https://github.com/TenStrip/10S-Comfy-nodes
- Modelo base Sulphur-2-base: https://huggingface.co/SulphurAI/Sulphur-2-base
- LoRA DMD hibrida v2: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora/blob/main/LTX2.3_DMD_hybrid_v2.safetensors
- LoRAs DMD hibridas alternativas: https://huggingface.co/maximsobolev275/LTX2.3-DMD-Distill-Lora-Hybrids
- Version INT8 con merge hibrido v2: https://huggingface.co/CornLogic/10EROS-INT8/tree/main
- Version INT8 de calidad: https://huggingface.co/LokkenJP/10EROS_1.5_fp8_exp_learned
- Cuantizaciones GGUF: https://huggingface.co/vantagewithai/LTX2.3-10Eros-GGUF/tree/main
- Archivos split de Kijai para LTX 2.3: https://huggingface.co/Kijai/LTX2.3_comfy/tree/main
- LoRAs destiladas cond_safe: https://huggingface.co/TenStrip/LTX2.3_Distilled_Lora_1.1_Experiments/tree/main
