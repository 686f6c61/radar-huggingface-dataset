# ocsnav/groot-vlm-graft28

## Resumen

groot-vlm-graft28 es un artefacto de investigación publicado por el usuario ocsnav que convierte la rama de visión-lenguaje del modelo robótico NVIDIA GR00T N1.5-3B (`backbone.eagle_model`) en un VLM autónomo capaz de generar texto. El checkpoint original de GR00T sólo incluye 12 de las 28 capas del decodificador LLM, porque su cabeza de política nunca necesita las restantes; este repositorio rellena las capas 12 a 27 con los pesos públicos de Qwen3-1.7B para completar el modelo de lenguaje.

El resultado declara 2.150.092.736 parámetros en bfloat16 (repositorio de 4,3 GB) y combina una torre de visión SigLIP2 de 27 capas, 1152 dimensiones, parche de 14 px y entrada de 224 px; un conector `mlp1.0` que es una única capa `Linear(1152 → 2048)`; las capas 0-11 del LLM de GR00T; las capas 12-27 de Qwen3-1.7B; y el `lm_head`, la normalización final y los embeddings de GR00T, con `tie_word_embeddings=True`.

Su relevancia es metodológica más que de producto: permite sondear qué representan el codificador visual y las capas bajas del LLM de GR00T sin ejecutar el pipeline completo de visión-lenguaje-acción. El propio autor advierte de que no es el VLM de NVIDIA y de que debe tratarse como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basado en transformers: torre de visión SigLIP2 + conector MLP + decodificador LLM de 28 capas; arquitectura registrada como `Eagle2_5_VLForConditionalGeneration` (transformers) y `GrootEagle2_5_VLForConditionalGeneration` (plugin de vLLM) |
| Parametros totales | 2.150.092.736 (2,15 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | No se publican versiones cuantizadas; los pesos se distribuyen en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | `other`, identificada como `nvidia-gr00t-n1.5`; las capas 12-27 proceden de Qwen3-1.7B (Apache-2.0) |
| Formato de pesos | safetensors en bfloat16, 760 tensores; requiere `trust_remote_code=True` (`custom_code`) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 4,3 GB |
| Modelos base | nvidia/GR00T-N1.5-3B y Qwen/Qwen3-1.7B |
| Libreria mínima | transformers 4.51.3 / torch 2.7.1 (versiones probadas por el autor) |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo no se entrena: es un ensamblaje de pesos (*grafting*) verificado tensor a tensor. La torre de visión, el conector `mlp1.0` y las capas 0-11 del LLM provienen del checkpoint GR00T N1.5-3B; las capas 12-27 proceden de Qwen3-1.7B; y la normalización final, el `embed_tokens` y el `lm_head` (atado a los embeddings) vienen también de GR00T. El autor indica que los 760 tensores guardados son idénticos byte a byte (`torch.equal`) a los tensores de origen, sin conversión ni recuantización, y publica revisiones fijadas y la comprobación en `provenance.json`.

El procesamiento de imagen no aplica *pixel shuffle* (`use_pixel_shuffle: false`): los 256 parches de una tesela de 224 px pasan por `mlp1.0`, de modo que cada tesela genera 256 tokens de imagen, en línea con el `tokens_per_tile: 256` del `preprocessor_config.json` de GR00T. Un fotograma de 640×480 a resolución nativa se divide en 12 teselas más una miniatura, es decir, 13 teselas y 3.328 tokens de imagen. No se documenta ningún proceso de RLHF, DPO o ajuste instructivo sobre este ensamblaje.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`) usando la torre SigLIP2 y el conector de GR00T.
- Extracción de características (`feature-extraction`) sobre las representaciones internas de las capas 0-11, útil para *probing* del codificador visual de GR00T.
- Descripción de escenas y contenido visual en lenguaje natural.
- Conversación multimodal básica, etiquetada como `conversational` en los tags del repositorio.
- Ejecución como modelo independiente sin la cabeza de política de GR00T, lo que permite aislar la parte visión-lenguaje.
- Integración con vLLM mediante un plugin propio que corrige el conector y la normalización de imagen.
- No se documenta soporte de *tool calling*, *function calling*, agentes, audio, vídeo ni modo de razonamiento explícito.

## Casos de uso

- Sondeo de representaciones internas del encoder visual de GR00T N1.5: el modelo permite ejecutar *forward passes* y extraer activaciones de las capas 0-11 para estudiar qué información geométrica o semántica codifica la torre SigLIP2, algo imposible con el VLA completo.
- Investigación sobre fusión de pesos (*grafting*): sirve como caso de estudio reproducible para medir qué ocurre al empalmar un decodificador parcial con pesos de otro modelo de la misma familia, con verificación tensor a tensor documentada.
- Anotación automática de datos de demostración robótica: a partir de fotogramas de una cámara se pueden generar descripciones textuales de la escena para etiquetar episodios de entrenamiento, teniendo en cuenta el coste de 3.328 tokens por fotograma de 640×480.
- Prototipado de interfaces lenguaje-escena en simulación: en entornos como Isaac Sim o en flujos tipo SO-101, se puede consultar al modelo por lenguaje natural sobre lo que aparece en la imagen antes de definir una política de acción.
- Extracción de características para clasificadores auxiliares: las representaciones visuales y de las capas bajas pueden alimentar cabezas ligeras de detección, segmentación aproximada o *clustering* de escenas.
- Evaluación comparativa de conectores visión-lenguaje: al sustituir conceptualmente `mlp1.0` (una única `Linear(1152 → 2048)`) frente a alternativas como la de Eagle2.5-VL en vLLM, se puede medir el impacto del conector en la calidad generativa.
- Base para experimentos académicos de reconstrucción de modelos parcialmente liberados: el repositorio documenta el procedimiento exacto para completar un checkpoint con capas ausentes, replicable con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra, ni comparaciones cuantitativas con modelos de referencia. El autor sólo aporta la verificación de identidad byte a byte de los 760 tensores y las notas de compatibilidad con transformers 4.51.3, torch 2.7.1 y vLLM.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,3 GB sólo para pesos en bfloat16; contando activaciones y caché KV, un entorno práctico ronda los 5-8 GB. El ejemplo oficial de vLLM usa `--gpu-memory-utilization 0.30`.
- GPU recomendadas: el config fija `flash_attention_2` (FA2), lo que exige GPU Ampere o posterior; en la práctica, RTX 3090/4090, A100, H100 o L40S. Con GPU anteriores es necesario pasar `attn_implementation="eager"` en las configuraciones de visión y de texto.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más (RTX 3060 12 GB, RTX 3070/3080, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). Al no haber versiones GGUF ni cuantizadas, no se puede reducir por debajo de bf16/fp16 sin cuantizar por cuenta propia.
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM mediante el plugin incluido (`vllm_plugin/`, `make_vllm_dir.sh`). No hay soporte documentado para llama.cpp, Ollama, TGI ni GGUF.
- Advertencias de ejecución: `radio_model.py` llama a `torch.cuda.get_device_capability()` en tiempo de importación, por lo que debe haber al menos una GPU visible incluso en ejecuciones sólo CPU; en CPU es obligatorio `attn_implementation="eager"` para visión y texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ocsnav/groot-vlm-graft28 | 2,15 mil millones | No especificado (ejemplo con 8192) | `other` / nvidia-gr00t-n1.5 + Apache-2.0 en las capas 12-27 | HuggingFace | VLM generativo ensamblado; capas 12-27 no son de NVIDIA; sin benchmarks |
| nvidia/GR00T-N1.5-3B | 3 mil millones (según el nombre del checkpoint) | No disponible | nvidia-gr00t-n1.5 | HuggingFace | VLA completo con cabeza de política; sólo libera 12 de 28 capas del decodificador, por lo que no genera texto por sí solo |
| Qwen/Qwen3-1.7B | 1,7 mil millones | No disponible | Apache-2.0 | HuggingFace | Modelo de lenguaje puro; aporta las capas 12-27 de este ensamblaje |
| Eagle2.5-VL (implementación integrada en vLLM) / nvidia/Eagle-Block2A-2B-v2 | No disponible | No disponible | No disponible | Repositorio NVIDIA/Isaac-GR00T | Difiere de este checkpoint en el conector, el *pixel shuffle* (256 frente a 64 tokens por tesela) y la normalización de imagen (SigLIP frente a ImageNet) |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es el VLM de NVIDIA: las capas 12-27 son pesos públicos de Qwen3-1.7B, no de GR00T. El autor lo califica expresamente de artefacto de investigación.
- El ensamblaje nunca se ha entrenado de forma conjunta: el tramo GR00T (capas 0-11) y el tramo Qwen3 (capas 12-27) no compartieron objetivo de entrenamiento, por lo que la coherencia generativa y la fidelidad de las respuestas pueden degradarse de forma impredecible y el riesgo de alucinación es alto.
- No es un modelo de acción: al eliminar la cabeza de política no puede emitir acciones robóticas, sólo texto. No debe confundirse con un VLA operativo.
- Sin benchmarks publicados ni evaluación de calidad generativa, seguridad o sesgos. No hay datos sobre sesgos conocidos ni sobre idiomas soportados.
- Consumo de contexto elevado: 3.328 tokens por fotograma de 640×480 a resolución nativa (13 teselas de 256 tokens), lo que limita el número de imágenes y turnos que caben en una ventana de 8.192 tokens.
- Restricciones de licencia: los pesos derivados de GR00T siguen la licencia de nvidia/GR00T-N1.5-3B y el código de modelado incluido es de NVIDIA; las capas 12-27 son Apache-2.0. Hay que revisar ambas licencias antes de redistribuir o de usar comercialmente.
- Dependencia de código remoto: requiere `trust_remote_code=True` y ejecuta código empaquetado de GR00T, con la llamada a `torch.cuda.get_device_capability()` en la importación.
- El config fija `flash_attention_2`, lo que rompe los *forward passes* en CPU salvo que se fuerce `attn_implementation="eager"`.
- No hay versiones cuantizadas ni GGUF, de modo que el despliegue en entornos ligeros exige trabajo adicional de cuantización.
- Repositorio con 0 descargas y 0 likes: no hay validación por parte de la comunidad ni reportes de uso independientes. Existe al menos un espejo del mismo nombre bajo el usuario JisuHann.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ocsnav/groot-vlm-graft28
- Espejo del repositorio: https://huggingface.co/JisuHann/groot-vlm-graft28
- Archivos del espejo: https://huggingface.co/JisuHann/groot-vlm-graft28/tree/main
- Modelo base NVIDIA GR00T N1.5-3B: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de GR00T N1: https://arxiv.org/abs/2503.14734
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Documentación de NVIDIA sobre VLA y SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/10-groot.html
