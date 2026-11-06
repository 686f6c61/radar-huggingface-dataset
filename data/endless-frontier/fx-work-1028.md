# endless-frontier/Fx-Work-1028

## Resumen

Fx-Work-1028 es un modelo multimodal de tipo mixture-of-experts (MoE) de 35B de parámetros (con unos 3B activos), desarrollado por endless-frontier como versión mejorada de su modelo Fx-Work. Se basa en un fine-tuning de Qwen/Qwen3.6-35B-A3B y está diseñado específicamente para el trabajo profesional cotidiano en entornos con archivos y herramientas: entender peticiones de trabajo, interpretar documentos y materiales de referencia, razonar sobre restricciones operativas y usar herramientas para producir entregables.

Su relevancia radica en que ofrece un rendimiento en tareas de trabajo agéntico comparable a modelos de frontera mucho mayores (supera a GLM-5.2 en tres de los cinco benchmarks reportados), pero con solo 3B de parámetros activos, lo que reduce notablemente el coste de inferencia. El modelo soporta entrada de imagen, texto y vídeo en el formato multimodal de Qwen3.6, y destaca en benchmarks como AutomationBench (43,33 pass@1) y Claw-Eval (70,1 pass³).

Está publicado bajo licencia Apache 2.0, con pesos en safetensors, contexto nativo de 262.144 tokens y soporte de despliegue mediante SGLang, vLLM y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts multimodal (clase Qwen3.5/3.6 MoE, image-text-to-text) |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 (sujeta a los terminos del modelo base Qwen3.6-35B-A3B y componentes de terceros) |
| Formato de pesos | safetensors (tamano del repo: 71,9 GB) |

## Arquitectura y entrenamiento

Fx-Work-1028 hereda la arquitectura de Qwen3.6-35B-A3B: un transformer multimodal con enrutado mixture-of-experts que activa aproximadamente 3B de los 35,95B de parametros totales en cada paso, lo que permite latencias y costes de inferencia propios de modelos mucho mas pequenos manteniendo la capacidad de un modelo de 35B. La etiqueta `qwen3_5_moe` y la clase `Qwen3_5MoeForConditionalGeneration` confirman la integracion nativa con la libreria Transformers, con soporte de mensajes multimodales de imagen y video en el formato de Qwen3.6.

Sobre el entrenamiento, la model card no detalla el numero de tokens ni la composicion exacta del dataset. La cita asociada remite al articulo "WorkGenesis: Building the Worlds That Teach Agents to Work" (arXiv:2609.39325), lo que sugiere que el modelo se ha entrenado con entornos y escenarios de trabajo sinteticos orientados a agentes. No hay informacion disponible sobre el uso de RLHF o DPO. El modelo incorpora razonamiento con parser estilo qwen3 (reasoning-parser) en sus despliegues recomendados.

## Capacidades

- Comprension multimodal: procesa entradas de imagen, texto y video en el formato de mensajes de Qwen3.6.
- Ejecucion de tareas de trabajo profesionales: preparacion de documentos e informes, analisis de hojas de calculo y datos de negocio, organizacion de informacion.
- Uso de herramientas (tool calling): disenado para operar en entornos con multiples archivos y herramientas; la ejecucion de herramientas la proporciona el harness agéntico circundante, mientras el servidor expone generacion y respuestas de tool-call.
- Razonamiento multi-paso y agéntico: optimizado para flujos de trabajo de largo horizonte (se recomienda conservar al menos 128K tokens de contexto para estos casos).
- Modo de razonamiento: soporta parsing de razonamiento estilo qwen3 en SGLang y vLLM.
- Conversacion multi-turno orientada a tareas.

## Casos de uso

- Preparacion automatica de documentos e informes: el modelo interpreta una peticion de trabajo junto con documentos de referencia y genera entregables estructurados, gracias a su contexto de 262K tokens que permite cargar grandes volumenes de material.
- Analisis de hojas de calculo y datos de negocio: puede razonar sobre datos tabulares y restricciones operativas para producir analisis y resumenes accionables.
- Agentes de automatizacion de ofimatica: integrado en un harness agéntico con ejecucion de herramientas, puede completar flujos que implican multiples archivos (por ejemplo, leer un correo, extraer datos de un PDF y actualizar una hoja de calculo).
- Asistentes de productividad de largo horizonte: su contexto amplio y su perfil de 3B activos lo hacen adecuado para sesiones largas de trabajo con coste de inferencia contenido.
- Pipelines de procesamiento documental multimodal: clasificacion, extraccion y sintesis de informacion a partir de imagenes y documentos escaneados.
- Evaluacion y prototipado de agentes de trabajo: dado su buen rendimiento en AutomationBench y Claw-Eval con solo 35B, es una base eficiente para experimentar con agentes de oficina en hardware moderado.

## Benchmarks y rendimiento

Resultados publicados en la model card (mayor es mejor en todas las metricas; metricas pass expresadas en porcentaje):

| Modelo | GDPvalAA-v2.1 Elo | APEX-Agents-AA pass@1 | JobBench Main | AutomationBench pass@1 | Claw-Eval pass³ |
|:--|--:|--:|--:|--:|--:|
| GLM-5.3 | 1651 | 35,2 | 48,48 | 48,20 | 72,2 |
| Qwen3.8-max | 1608 | 38,9 | 52,57 | 51,30 | 72,8 |
| DeepSeek V4.1 Flash-0910 | 1600 | 38,4 | 49,41 | 54,80 | 64,3 |
| Kimi K3 | 1533 | 35,5 | 43,81 | 46,70 | 69,3 |
| GLM-5.2 | 1374 | 29,7 | 33,79 | 20,30 | 67,9 |
| Sage-A1.5 | 675 | 14,8 | 14,32 | 8,78 | 65,0 |
| Apodex-1.1-mini | 883 | 23,5 | 16,31 | 14,30 | 45,1 |
| Qwen3.6-35B-A3B | 895 | 13,4 | 14,99 | 9,30 | 49,7 |
| Occamy-1.0 | 1088 | 20,5 | 18,88 | 27,60 | 71,1 |
| Nex-N2.5-mini | 1304 | 17,0 | 28,50 | 32,30 | 36,1 |
| Fx-Work | 1248 | 25,2 | 25,19 | 18,00 | 38,9 |
| **Fx-Work-1028** | **1328** | **28,2** | **34,34** | **43,33** | **70,1** |

Fx-Work-1028 supera a GLM-5.2 en JobBench Main, AutomationBench y Claw-Eval, y queda cerca en GDPvalAA-v2.1 (1328 frente a 1374) y APEX-Agents-AA (28,2 frente a 29,7). Mejora al Fx-Work original en los cinco benchmarks, con las mayores ganancias en AutomationBench y Claw-Eval.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 71,9 GB en pesos (presumiblemente BF16/FP16), por lo que la inferencia en precision completa requiere del orden de 80 GB de VRAM solo para pesos, mas la KV cache del contexto (muy significativa con 262K tokens). No hay cifras oficiales de VRAM ni cuantizaciones publicadas.
- GPU recomendadas: los comandos de ejemplo de SGLang y vLLM usan `--tp-size 8` / `--tensor-parallel-size 8`, lo que sugiere un nodo multi-GPU (por ejemplo, 8 GPUs de clase A100/H100 de 80 GB, u 8 GPUs de 48 GB si se ajusta el contexto).
- Consumer GPUs: no es viable en precision completa en una unica GPU de consumo; sin cuantizaciones publicadas (GGUF/AWQ/GPTQ no disponibles segun la informacion proporcionada), no hay ruta documentada para hardware de consumo.
- Opciones de despliegue: SGLang y vLLM (servidores compatibles con la API de OpenAI, recomendados por los autores), y Transformers con la clase `Qwen3_5MoeForConditionalGeneration`.
- Contexto: con memoria limitada se recomienda reducir la longitud de contexto; para trabajo profesional de largo horizonte se aconseja mantener al menos 128K tokens.
- Latencia y throughput: no disponibles como cifras concretas; el diseno MoE con ~3B activos apunta a una latencia comparable a modelos densos de ~3B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JobBench Main | AutomationBench pass@1 | Licencia |
|:--|--:|--:|--:|--:|:--|
| Fx-Work-1028 | 35,95B (~3B activos) | 262.144 | 34,34 | 43,33 | Apache 2.0 |
| Qwen3.6-35B-A3B (base) | ~35B (~3B activos) | no disponible | 14,99 | 9,30 | no disponible |
| GLM-5.2 | no disponible | no disponible | 33,79 | 20,30 | no disponible |
| Nex-N2.5-mini | no disponible | no disponible | 28,50 | 32,30 | no disponible |
| Occamy-1.0 | no disponible | no disponible | 18,88 | 27,60 | no disponible |

Entre los modelos de 35B o menos listados en la model card, Fx-Work-1028 obtiene el mejor resultado en cuatro de los cinco benchmarks (GDPvalAA-v2.1, APEX-Agents-AA, JobBench y AutomationBench), quedando segundo en Claw-Eval tras Occamy-1.0. Datos de contexto, licencia y tamano de los competidores: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; no hay soporte documentado para castellano ni otros idiomas.
- Cuantizacion: no se publican pesos cuantizados, lo que limita el despliegue en hardware de consumo.
- Contexto: el contexto nativo de 262K tokens exige una KV cache considerable; con memoria limitada hay que reducirlo, y los autores recomiendan un minimo de 128K para trabajo de largo horizonte.
- Ejecucion de herramientas: el modelo no ejecuta herramientas por si mismo; requiere un harness agéntico externo que gestione la ejecucion.
- Licencia: aunque es Apache 2.0, esta sujeta a los terminos del modelo base Qwen3.6-35B-A3B y de componentes de terceros, que conviene revisar antes de uso comercial.
- Alucinaciones y sesgos: no se documentan evaluaciones especificas de sesgo o alucinacion; al tratarse de un fine-tuning orientado a tareas agénticas, debe validarse en cada caso de uso antes de produccion.
- Adopcion temprana: el modelo es muy reciente (publicado en octubre de 2026), con pocas descargas (29) y sin historial comunitario amplio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/endless-frontier/Fx-Work-1028
- Modelo original Fx-Work: https://huggingface.co/endless-frontier/Fx-Work
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Articulo asociado (WorkGenesis): arXiv:2609.39325 (https://arxiv.org/abs/2609.39325)
- SGLang: https://github.com/sgl-project/sglang
- vLLM: https://github.com/vllm-project/vllm
