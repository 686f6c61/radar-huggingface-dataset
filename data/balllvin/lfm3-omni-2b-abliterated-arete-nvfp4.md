# balllvin/LFM3-Omni-2B-Abliterated-Arete-NVFP4

## Resumen

LFM3-Omni-2B-Abliterated-Arete-NVFP4 es una variante comunitaria del modelo LiquidAI/LFM3-Omni-2B, desarrollada por el usuario balllvin. Se trata de un modelo multimodal any-to-any (entrada y salida de texto e imagen) de 2.166.928.384 parametros, derivado de la familia LFM3 de Liquid AI. La version incorpora dos modificaciones principales: un proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo) y un ajuste con el dataset NousResearch/arete-data-pairs, ademas de una cuantizacion NVFP4 de 4 bits realizada con NVIDIA ModelOpt.

El modelo se distribuye unicamente en formato NVFP4, un formato de cuantizacion de 4 bits con escalas de bloque disenado para GPUs NVIDIA Blackwell (serie RTX 50 y B200), lo que limita su despliegue a hardware relativamente reciente. El repositorio ocupa 2,9 GB y requiere acceso restringido (gated) en Hugging Face, con licencia LFM1.0 heredada del modelo base. Solo declara soporte para ingles.

Su relevancia es acotada: no es un modelo oficial de Liquid AI, no publica benchmarks y las descargas e interacciones registradas son cero en el momento de la ficha. Resulta de interes para quienes experimentan con cuantizacion NVFP4, con tecnicas de abliteration o con fine-tuning sobre datasets de pares de preferencia en modelos multimodales pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 Omni (transformer multimodal any-to-any, clase `lfm3_omni` con `custom_code`) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, ModelOpt); el repo tambien declara tag de 8 bits |
| Idiomas soportados | ingles (en) |
| Licencia | LFM1.0 (etiquetada como `license:other`) |
| Formato de pesos | safetensors (NVFP4), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-Omni-2B, un modelo multimodal de la familia LFM3 de Liquid AI que procesa y genera texto e imagen (pipeline `image-text-to-text`, categoria `any-to-any`). La informacion disponible no detalla la arquitectura interna del modelo base (tipo de capas, mecanismo de atencion, tokenizador multimodal ni composicion exacta del dataset original), por lo que estos datos deben consultarse en la model card oficial de LiquidAI/LFM3-Omni-2B.

Sobre esa base, el autor aplica dos etapas: primero un proceso de abliteration, tecnica que identifica y elimina la direccion de activacion asociada a las respuestas de rechazo, y despues un ajuste (probablemente LoRA o fine-tuning completo, no se especifica) con NousResearch/arete-data-pairs, un dataset de pares de preferencia. El resultado se cuantiza a NVFP4 con NVIDIA ModelOpt. El autor referencia tambien un modelo previo propio, balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4, que aparece como base adicional en los metadatos de merge. No se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO formal.

## Capacidades

- Generacion de texto y razonamiento conversacional en ingles.
- Procesamiento de imagen como entrada (image-text-to-text) y salida any-to-any segun el pipeline declarado.
- Conversacion multi-turno.
- Fine-tuning orientado a pares de preferencia (dataset Arete), lo que puede afectar el estilo de respuesta.
- Abliteration aplicada: se espera una reduccion de las negativas o rechazos del modelo base, sin garantia de comportamiento consistente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Thinking mode, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre abliteration: comparar el comportamiento del modelo base LiquidAI/LFM3-Omni-2B con esta variante para medir el efecto de la eliminacion de la direccion de rechazo en tareas de evaluacion de seguridad.
- Experimentacion con cuantizacion NVFP4: validar el rendimiento y la fidelidad numerica de ModelOpt NVFP4 en un modelo multimodal de ~2B sobre GPUs Blackwell.
- Fine-tuning sobre datasets de preferencia: usar el modelo como punto de partida para experimentos con NousResearch/arete-data-pairs u otros datasets de pares.
- Prototipado multimodal en local: tareas de descripcion de imagen y dialogo image-text en ingles sobre una unica GPU consumer de gama alta con soporte NVFP4.
- Evaluacion de robustez: estudiar como el ajuste con pares de preferencia y la abliteration afectan a la coherencia y a la tasa de alucinacion en tareas visuales.
- Base para pipelines de investigacion en seguridad de modelos: analizar la transferibilidad de las tecnicas de abliteration en arquitecturas multimodales pequenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 2,9 GB en NVFP4; se estima un uso de VRAM en torno a 3-4 GB para los pesos, mas overhead de activaciones y del codificador visual (no confirmado).
- GPU recomendadas: NVIDIA Blackwell (RTX 50 series, B200) por el soporte nativo de NVFP4; el formato puede no ser compatible con generaciones anteriores sin emulacion.
- Cabe en GPU consumer: previsiblemente si, en GPUs Blackwell con al menos 8 GB de VRAM, aunque no hay datos oficiales de compatibilidad.
- Opciones de despliegue: transformers con `custom_code` y ModelOpt; compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| balllvin/LFM3-Omni-2B-Abliterated-Arete-NVFP4 | 2,17B | no disponible | any-to-any (texto/imagen) | NVFP4 | LFM1.0 (gated) | Hugging Face, acceso restringido |
| LiquidAI/LFM3-Omni-2B | ~2B | no disponible | any-to-any | original (no disponible) | LFM1.0 | Hugging Face |
| balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4 | ~1,7B | no disponible | texto | NVFP4 | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo no oficial: no procede de Liquid AI y no cuenta con validacion del desarrollador original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- La abliteration puede degradar la coherencia, aumentar respuestas inapropiadas y afectar negativamente a tareas que requieren cautela.
- Riesgo de alucinacion no medido, especialmente en tareas multimodales.
- Solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Licencia LFM1.0: revisar las condiciones de uso comercial antes de cualquier despliegue productivo; el acceso esta restringido (gated).
- Formato NVFP4: requiere hardware NVIDIA Blackwell o soporte de emulacion; no es un formato universal.
- Contexto maximo no documentado: planificar con margen conservador.
- Repositorio con cero descargas y cero likes: sin validacion de la comunidad ni issues conocidos.
- El tag de 8 bits junto al de 4 bits sugiere posible ambiguedad en la configuracion de cuantizacion; verificar los ficheros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-Omni-2B-Abliterated-Arete-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Modelo previo del autor: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4
- Dataset de ajuste: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Paper referenciado (arxiv:2212.04089): https://arxiv.org/abs/2212.04089
