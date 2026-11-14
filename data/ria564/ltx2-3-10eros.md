# Ria564/LTX2.3-10Eros

## Resumen

LTX2.3-10Eros es un modelo de difusion para generacion de video a partir de imagen (image-to-video, I2V) publicado por el usuario Ria564 en Hugging Face. Se trata de un merge o remezcla de pesos derivado de la familia LTX-2.3, un transformer de difusion para video, y del modelo base Sulphur-2-base. El autor lo presenta como una variante orientada a contenido explicito, con ajustes en las compuertas de atencion (attn_1 y attn_2) para recuperar movimiento y anatomia detallada que, segun su model card, se habian perdido en iteraciones anteriores.

El modelo se distribuye como un checkpoint completo en BF16 que incluye CLIP y VAE, y esta pensado para ejecutarse en flujos de trabajo de ComfyUI con nodos personalizados y LoRAs de destilacion DMD. Su relevancia es limitada y muy especifica: no es un modelo de proposito general, sino un fine-tune de nicho para generacion de video para adultos, con documentacion escasa y sin resultados de benchmarks publicados.

La informacion disponible es fragmentaria: no se declaran parametros, longitud de contexto, idiomas ni licencia. El repositorio ocupa 424 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (derivado de LTX-2.3, segun la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint completo con CLIP y VAE), FP8 mixed learned, INT8, GGUF (repos de terceros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint diffusers/ComfyUI); existen variantes GGUF y FP8 en repos de terceros |

## Arquitectura y entrenamiento

La model card describe el modelo como un merge por capas (layer-scaled merge) de distintos pasos de entrenamiento, no como una suma directa de pesos. Segun el autor, las versiones 1.2 a 1.5 comparten casi por completo los mismos pesos; la diferencia principal reside en como se gestionan las compuertas de atencion attn_1 y attn_2. La version 1.5 aplica una rampa lineal sobre esas compuertas para recuperar detalles explicitos presentes en la version 1.2, manteniendo la estabilidad estructural de la 1.4.

El modelo se apoya en Sulphur-2-base y en la familia LTX-2.3, e incorpora datos de un conector ajustado para reducir la deriva facial en prompts largos. Esta disenado para combinarse con LoRAs de destilacion DMD (por ejemplo, LTX2.3_DMD_hybrid_v2) y con LoRAs de destilacion "cond_safe"; el autor advierte que LoRAs destiladas de mayor tamano degradan el fine-tune. No se especifican volumen de datos de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de video a partir de una imagen inicial (image-to-video) con evolucion de movimiento cuadro a cuadro.
- Control de movimiento y composicion mediante prompts descriptivos y directivos; el autor indica que el modelo apenas infiere por si mismo y requiere instrucciones explicitas.
- Generacion de audio integrada en el prompt: dialogo, ruido de fondo, foley y musica, descritos en secuencia temporal.
- Soporte de LoRAs de destilacion para acelerar la inferencia (DMD) y de parches de anatomia.
- Integracion con ComfyUI mediante nodos personalizados (10S-Comfy-nodes) y flujos de trabajo publicados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues.

## Casos de uso

- Generacion de video para adultos a partir de una imagen fija: el modelo esta especificamente ajustado para contenido explicito, con enfasis en anatomia y movimiento detallados, y se usaria con prompts anatomicos completos y LoRAs DMD para acelerar la generacion.
- Animacion de retratos o figuras con control de deriva facial: el conector ajustado de la version 1.2 reduce el desplazamiento del rostro en secuencias largas, lo que resulta util para clips centrados en un sujeto.
- Creacion de escenas con dialogo y audio sincronizado: el prompt admite describir lineas de dialogo, tono de voz y efectos de sonido en orden temporal, adecuado para clips narrativos cortos.
- Prototipado de animaciones en ComfyUI: los flujos de trabajo publicados (por ejemplo, 10Eros_10SNodes_I2V_Basic_DMD_V5.json) permiten montar un pipeline I2V con nodos 10S y LoRAs hibridas.
- Experimentacion con merges y fine-tunes: la version 1.4 se presenta explicitamente como base para entrenar LoRAs posteriores, por lo que sirve como punto de partida para ajustes propios.
- Despliegue en hardware limitado mediante cuantizacion: las variantes INT8, FP8 e GGUF de terceros permiten ejecutar el modelo en GPUs con menos VRAM que la version BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 424 GB, lo que incluye multiples variantes de pesos; el checkpoint BF16 individual es de gran tamano (no se especifica su cifra exacta).
- VRAM estimada: no disponible de forma oficial. Para un modelo de video de esta familia, la version BF16 requiere GPUs de clase profesional (A100 80 GB, H100) o configuraciones multi-GPU; las variantes FP8 e INT8 reducen el requisito y pueden caber en RTX 4090 (24 GB) o A6000 (48 GB), aunque no se confirma en la documentacion.
- Cabe en GPU de consumo solo en cuantizaciones agresivas (GGUF/INT8) y con resoluciones y duraciones reducidas; no hay datos verificados.
- Opciones de despliegue: ComfyUI con nodos 10S-Comfy-nodes; diffusers (pipeline image-to-video); variantes GGUF para llama.cpp-like runners de difusion (no confirmado); no se mencionan vLLM ni TGI, que no aplican a difusion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX2.3-10Eros | no disponible | no disponible | I2V para contenido explicito, merge de LTX-2.3 y Sulphur-2-base | no disponible | Hugging Face, 0 descargas |
| Sulphur-2-base | no disponible | no disponible | Modelo base de video del que depende el merge | no disponible | Hugging Face |
| LTX-2.3 (familia base) | no disponible | no disponible | Difusion de video de proposito general | no disponible | Hugging Face / ComfyUI |
| LTX2.3_DMD_Lora (TenStrip) | no disponible | no disponible | LoRA de destilacion para acelerar LTX-2.3 | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences` y disenado para material explicito; su uso comercial o publico puede infringir politicas de plataformas y normativas locales.
- Licencia no declarada: al no especificarse, no hay garantia de uso comercial ni de redistribucion; es imprescindible contactar con el autor o consultar las licencias de los modelos base (LTX-2.3 y Sulphur-2-base).
- Documentacion escasa: no se publican parametros, contexto, idiomas ni benchmarks, lo que dificulta evaluar su calidad de forma objetiva.
- Dependencia de terceros: requiere LoRAs DMD, nodos de ComfyUI y modelos base externos; la calidad depende de la combinacion exacta de estos componentes.
- Deriva y artefactos: el autor reconoce problemas de anatomia fantasma, subtitulos no deseados y transiciones inesperadas en versiones anteriores, parcialmente mitigados en la 1.5.
- Sensibilidad al prompt: el modelo tiene poca capacidad de inferencia propia y produce resultados pobres si el prompt no es estricto, descriptivo y directivo.
- Riesgo de alucinacion visual: al ser un modelo generativo de video, puede producir movimientos y anatomias incoherentes, especialmente en secuencias largas.
- Sin soporte multilingue documentado ni capacidades de agentes o tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ria564/LTX2.3-10Eros
- Flujos de trabajo del autor: https://huggingface.co/TenStrip/LTX2.3-10Eros_Workflows
- Nodos de ComfyUI: https://github.com/TenStrip/10S-Comfy-nodes
- Modelo base Sulphur-2-base: https://huggingface.co/SulphurAI/Sulphur-2-base
- LoRA DMD hibrida v2: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora/blob/main/LTX2.3_DMD_hybrid_v2.safetensors
- LoRAs DMD hibridas (maximsobolev275): https://huggingface.co/maximsobolev275/LTX2.3-DMD-Distill-Lora-Hybrids
- Version INT8 con merge hibrido v2: https://huggingface.co/CornLogic/10EROS-INT8/tree/main
- Version INT8 de calidad: https://huggingface.co/LokkenJP/10EROS_1.5_fp8_exp_learned
- Cuantizaciones GGUF: https://huggingface.co/vantagewithai/LTX2.3-10Eros-GGUF/tree/main
- Archivos split de Kijai para LTX2.3: https://huggingface.co/Kijai/LTX2.3_comfy/tree/main
- LoRAs destiladas cond_safe: https://huggingface.co/TenStrip/LTX2.3_Distilled_Lora_1.1_Experiments/tree/main
