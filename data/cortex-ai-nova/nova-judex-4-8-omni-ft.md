# cortex-ai-nova/NOVA-Judex-4.8-Omni-ft

## Resumen

NOVA-Judex-4.8-Omni-ft es un ajuste fino (fine-tuning) del modelo multimodal LiquidAI/LFM3-Omni-2B, publicado por el usuario cortex-ai-nova en Hugging Face. Se trata de un modelo de tipo image-text-to-text construido sobre la arquitectura LFM3 Omni de Liquid AI, con 2.166.928.384 parametros totales (aproximadamente 2,17 mil millones) y pesos almacenados en safetensors y GGUF. El ajuste se realizo mediante LoRA con rango 8, fusionado posteriormente en los pesos base en precision BF16.

El modelo resuelve el problema de adaptar un modelo omni (texto, imagen y audio) a tareas conversacionales e instruccionales mediante un conjunto de datos mixto compuesto por alpaca-cleaned, FineTome-100k y un subconjunto de ASR de LibriSpeech. Su relevancia actual radica en que demuestra el flujo de trabajo de ajuste fino sobre la familia LFM3 de Liquid AI, una arquitectura reciente orientada a modelos compactos multimodales con licencia abierta pero restrictiva.

No obstante, la informacion publicada es extremadamente limitada: la model card esta mayoritariamente en ruso, no se documentan resultados de benchmarks, no se especifican los idiomas soportados y no se detalla la longitud de contexto. El modelo tiene 84 descargas y 0 likes en el momento de la consulta, lo que sugiere un uso muy incipiente o experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 Omni (transformer multimodal, image-text-to-text) |
| Parametros totales | 2.166.928.384 (~2,17 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); GGUF disponible en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se basa en LiquidAI/LFM3-Omni-2B, un modelo de la familia LFM3 Omni de Liquid AI disenado para procesar entradas multimodales (texto, imagen y audio) y generar salida de texto. La arquitectura exacta (atencion, capas, mecanismos internos) no se detalla en la informacion proporcionada; la model card unicamente indica la etiqueta `lfm3_omni` y el pipeline `image-text-to-text`. El modelo requiere `trust_remote_code=True`, lo que implica que utiliza codigo personalizado (`custom_code`) para su carga.

El ajuste fino se realizo con LoRA de rango 8, posteriormente fusionado en los pesos base en BF16. Los datos de entrenamiento documentados son: `yahma/alpaca-cleaned` (formato instruction, hasta 1000 ejemplos), `mlabonne/FineTome-100k` (formato ShareGPT, hasta 1000 ejemplos) y `hf-internal-testing/librispeech_asr_dummy` (tarea ASR, hasta 50 ejemplos). Segun la model card, solo se ajusto la salida de texto; la generacion de voz no fue entrenada. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional e instruccional, heredada del ajuste sobre alpaca-cleaned y FineTome-100k.
- Procesamiento de entradas image-text-to-text (multimodal imagen + texto), segun el pipeline declarado.
- Capacidad de audio/ASR potencial, dado que el modelo base es omni y se incluyo un subconjunto de LibriSpeech en el ajuste, aunque la generacion de voz no fue entrenada.
- Soporte de conversacion multi-turno en formato chat (etiqueta `conversational`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card esta en ruso pero no se declaran idiomas oficiales.
- Modo thinking, vision detallada o audio avanzado: no disponible mas alla de lo indicado por el pipeline.

## Casos de uso

- Prototipado de asistentes conversacionales multimodales: el modelo puede gestionar dialogos multi-turno con entradas de imagen y texto, adecuado para pruebas de concepto en entornos de investigacion dado su tamano compacto (~2,17 B) y su disponibilidad en GGUF para despliegue local.
- Experimentacion academica con ajuste fino de modelos omni: sirve como ejemplo reproducible de LoRA r=8 fusionado en BF16 sobre LFM3-Omni-2B, util para investigadores que quieran replicar el flujo con sus propios datasets.
- Transcripcion o procesamiento de audio basico: aunque la generacion de voz no fue entrenada, la inclusion de LibriSpeech en el ajuste sugiere capacidad potencial de ASR que puede evaluarse en pipelines de audio a texto.
- Descripcion de imagenes en entornos con recursos limitados: al ser un modelo de ~2,17 B, puede ejecutarse en GPUs de consumo con cuantizacion GGUF, lo que permite tareas de image-to-text en estaciones de trabajo sin infraestructura de datacenter.
- Evaluacion comparativa de modelos compactos multimodales: util como baseline en estudios que comparen LFM3-Omni-2B frente a otros modelos pequenos de vision-lenguaje.
- Demostraciones y docencia: su tamano y su disponibilidad en safetensors y GGUF lo hacen manejable para tutoriales sobre modelos multimodales y ajuste fino con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,3 GB solo para pesos (2,17 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-12 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion GGUF (Q4): aproximadamente 1,5-2,5 GB para pesos, permitiendo ejecucion en GPUs de consumo.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para BF16; GPUs consumer de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) para cuantizaciones GGUF.
- Cabe en GPU consumer: si, especialmente en cuantizaciones GGUF de 4-8 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `AutoModelForMultimodalLM`; llama.cpp u Ollama para los pesos GGUF; vLLM y TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NOVA-Judex-4.8-Omni-ft | ~2,17 B | no disponible | LFM Open License v1.0 | safetensors, GGUF | Ajuste fino multimodal (imagen+texto+audio) |
| LiquidAI/LFM3-Omni-2B | ~2 B | no disponible | LFM Open License v1.0 | safetensors | Modelo base original de Liquid AI |
| Otros modelos compactos multimodales | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos en la informacion proporcionada |

La comparativa con alternativas de la misma categoria no puede completarse con rigor porque no se dispone de especificaciones detalladas (contexto, benchmarks, idiomas) ni del modelo base en la informacion proporcionada. Se recomienda consultar la model card de LiquidAI/LFM3-Omni-2B para obtener los datos del modelo original.

## Limitaciones y advertencias

- La model card esta redactada principalmente en ruso y no declara los idiomas soportados oficialmente; el rendimiento fuera del ingles y ruso es incierto.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa del rendimiento tras el ajuste fino.
- El ajuste se realizo con un volumen muy reducido de datos (hasta 1000 ejemplos por dataset, 50 de ASR), lo que puede provocar sobreajuste y degradacion de capacidades generales del modelo base.
- La generacion de voz no fue entrenada; el modelo solo produce salida de texto aunque el pipeline sea omni.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado por la falta de evaluacion publicada.
- Licencia LFM Open License v1.0: es una licencia restrictiva con condiciones especificas (consultar el enlace oficial); no es una licencia de codigo abierto permisiva y puede limitar el uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; revisar el codigo antes de usarlo en produccion.
- Solo 84 descargas y 0 likes: comunidad practicamente inexistente, sin validacion externa.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortex-ai-nova/NOVA-Judex-4.8-Omni-ft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LICENSE
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset FineTome-100k: https://huggingface.co/datasets/mlabonne/FineTome-100k
- Dataset LibriSpeech ASR dummy: https://huggingface.co/datasets/hf-internal-testing/librispeech_asr_dummy
