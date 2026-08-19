# hemlang/Hemlock-Qwen3.8-27B-LoRA

## Resumen

Hemlock-Qwen3.8-27B-LoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario hemlang sobre el modelo base Qwen/Qwen3.8-27B, un modelo denso multimodal de 27 000 millones de parámetros publicado por el equipo Qwen de Alibaba. El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) con el framework Merlina, utilizando el dataset propio hemlang/Hemlock-SFT-combined. Su propósito declarado es adaptar el modelo base a tareas conversacionales y de visión-lenguaje (image-text-to-text), aunque la model card no detalla las capacidades específicas adquiridas tras el fine-tuning.

La relevancia de este adaptador reside en que permite especializar un modelo base potente con un coste de entrenamiento reducido: solo se actualizan los pesos LoRA (0,7 GB en el repositorio), en lugar de reentrenar los 27 000 millones de parámetros completos. El entrenamiento se realizó en una GPU NVIDIA GB10, lo que indica que el proceso es accesible para hardware de gama media-alta. Sin embargo, al tratarse de un adaptador recién publicado (agosto de 2026) y sin métricas de evaluación publicadas, su rendimiento real no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.8-27B (dense multimodal, transformer) |
| Parametros totales | No disponible (el adaptador pesa 0,7 GB; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (max sequence length del entrenamiento; el modelo base soporta 262K) |
| Tipos de cuantizacion | No disponible (no se especifican en la model card) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3.8-27B, un modelo denso multimodal de 27 000 millones de parámetros con entrada nativa de imagen y texto, publicado por Alibaba. El fine-tuning se realizó con LoRA de rango 32 y alpha 64, dropout 0,05, aplicado a las proyecciones up_proj, down_proj, gate_proj, k_proj, q_proj, v_proj y o_proj del transformer. El entrenamiento usó SFT con 2 épocas, batch efectivo de 16 (batch size 1 con 16 pasos de acumulación de gradiente), learning rate 0,0002 con scheduler coseno y warmup del 5 %, optimizador paged_adamw_8bit y longitud máxima de secuencia de 2048 tokens. El dataset de entrenamiento es hemlang/Hemlock-SFT-combined, del que no se proporciona composición ni tamaño. El framework utilizado fue Merlina, que permite reproducir la configuración exacta mediante un código de configuración incluido en la model card.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, que incluyen razonamiento, codigo y matematicas, aunque el adaptador no documenta mejoras especificas en estas areas.
- Vision y lenguaje: el modelo base es multimodal (image-text-to-text), por lo que el adaptador puede utilizarse con entradas de imagen y texto, aunque no se especifica si el fine-tuning incluyo datos visuales.
- Conversacion multi-turno: el dataset SFT sugiere un enfoque conversacional, pero no hay evidencia publica de la calidad de las respuestas.
- Tool calling y agentes: no se menciona soporte especifico en la model card; el modelo base si lo ofrece, pero el adaptador no lo confirma.
- Multilingue: no se indica que idiomas soporta el adaptador; el modelo base de Qwen suele ser multilingue, pero no hay confirmacion.

## Casos de uso

- Prototipado de asistentes conversacionales: al ser un adaptador ligero, permite experimentar con un modelo de 27B sin necesidad de reentrenar el modelo completo. Se puede cargar sobre el base con PEFT y probar respuestas en entornos de desarrollo.
- Fine-tuning especifico de dominio: el adaptador puede servir como punto de partida para nuevos fine-tunings con datasets propios, aprovechando la configuracion LoRA ya validada.
- Evaluacion de pipelines de vision-lenguaje: dado que el modelo base es multimodal, el adaptador puede usarse para probar flujos de trabajo que combinan imagenes y texto, aunque no hay garantia de que el fine-tuning haya optimizado esta capacidad.
- Investigacion academica sobre adaptadores LoRA: el repositorio incluye la configuracion completa de entrenamiento, lo que facilita reproducir el experimento y estudiar el impacto de los hiperparametros.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0,7 GB, se puede combinar con el modelo base cuantizado para reducir los requisitos de VRAM en inferencia.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG): el modelo base soporta contexto largo (262K), aunque el adaptador se entreno con 2048 tokens, por lo que su rendimiento con contextos mayores no esta verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El unico dato de rendimiento es el propio del modelo base Qwen3.8-27B, que segun fuentes externas alcanza DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero estos resultados corresponden al modelo base, no al adaptador LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador especifico. El modelo base de 27B requiere aproximadamente 54 GB en FP16, o unos 14-16 GB con cuantizacion de 4 bits. El adaptador LoRA anade unos 0,7 GB adicionales.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA GB10 (Grace Blackwell). Para inferencia, se recomienda una GPU con al menos 24 GB de VRAM si se usa el modelo base en FP16, o 12-16 GB con cuantizacion.
- Compatibilidad con GPUs consumer: si, es posible ejecutar el modelo base cuantizado (por ejemplo, Q4_K_M) junto con el adaptador en GPUs como RTX 3090, RTX 4090 o RTX 5080, aunque no hay datos de latencia especificos.
- Opciones de despliegue: al ser un adaptador de transformers, se puede cargar con la libreria PEFT sobre el modelo base. Tambien es compatible con vLLM, llama.cpp y Ollama si se exporta a GGUF, aunque la configuracion de entrenamiento indica que la exportacion GGUF estaba desactivada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Hemlock-Qwen3.8-27B-LoRA | 27B (base) + LoRA | 2048 (entrenamiento) | No disponible | Adaptador LoRA multimodal |
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Modelo denso multimodal |
| Qwen3.8-2B-Qwopus-Agent-Merge | 2B | No disponible | No disponible | Merge de agentes sobre Qwen3.8 |

La comparativa se limita al modelo base y a otro adaptador de la misma familia. No hay datos de rendimiento del adaptador Hemlock, por lo que no es posible establecer una comparacion cuantitativa. El modelo base Qwen3.8-27B es claramente superior en contexto (262K frente a 2048) y tiene licencia Apache 2.0, mientras que el adaptador no especifica licencia.

## Limitaciones y advertencias

- Sin licencia especificada: el repositorio no indica bajo que licencia se distribuye el adaptador, lo que genera incertidumbre legal para uso comercial.
- Sin benchmarks publicados: no hay evidencia de que el fine-tuning haya mejorado o mantenido el rendimiento del modelo base. El adaptador podria degradar capacidades si el dataset de entrenamiento era de baja calidad o limitado.
- Contexto de entrenamiento reducido: el adaptador se entreno con secuencias de 2048 tokens, muy por debajo del contexto nativo de 262K del modelo base. Es probable que el rendimiento se degrade con entradas largas.
- Sin informacion sobre el dataset: no se conoce la composicion, tamano ni calidad de hemlang/Hemlock-SFT-combined, lo que impide evaluar posibles sesgos o alucinaciones inducidas por el fine-tuning.
- Sin soporte confirmado de tool calling ni agentes: aunque el modelo base los soporta, el adaptador no documenta si estas capacidades se mantienen tras el fine-tuning.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que sugiere que el modelo no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hemlang/Hemlock-Qwen3.8-27B-LoRA
- Checkpoint intermedio (step 286): https://huggingface.co/hemlang/Hemlock-Qwen3.8-27B-LoRA-step286
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Especificaciones y benchmarks de Qwen3.8-27B: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Framework Merlina: https://github.com/Schneewolf-Labs/Merlina
