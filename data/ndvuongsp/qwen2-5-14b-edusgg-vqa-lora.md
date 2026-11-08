# ndvuongsp/qwen2.5-14b-edusgg-vqa-lora

## Resumen

EduSGG es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen2.5-14B-Instruct, desarrollado por Dinh-Vuong Nguyen (usuario `ndvuongsp`) como cuarta etapa (Stage 4, "Downstream Multimodal Reasoner") de un framework neuro-simbolico llamado EduSGG. El adaptador no procesa imagenes directamente: recibe como entrada un *scene graph* serializado en forma de tripletas `(subject, predicate, object)` con coordenadas de bounding box, generado por las etapas 1-3 del pipeline, y produce respuestas de pregunta-respuesta visual (VQA) sobre diagramas cientificos o planificacion de contenido educativo alineado con curriculo.

El modelo resuelve el problema de razonamiento grounded sobre diagramas STEM (ciclos biologicos, esquemas fisicos, diagramas tecnicos) sin necesidad de un codificador visual acoplado: la informacion visual se inyecta como texto estructurado. Segun la model card, alcanza un 88,74 % de accuracy en AI2D VQA y 35,67 CIDEr en captioning/planning, con una mejora de 2,0x en Fact F1 frente a la linea base sin scene graph.

Es relevante ahora porque ejemplifica el patron neuro-simbolico de usar LLMs como razonadores sobre representaciones estructuradas, una alternativa a los VLM end-to-end que reduce coste de entrenamiento (solo se ajusta un adaptador de 0,3 GB) y permite trazabilidad explicita de las relaciones visuales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-14B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; adaptador LoRA de ~0,3 GB en disco (r=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | 4-bit NF4 (BitsAndBytes) usada en el ejemplo de inferencia; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-14B-Instruct, un transformer decoder-only, mediante QLoRA con rango r=16, alpha=32 y dropout 0,05. Los modulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, atencion completa y capas MLP del bloque. El objetivo de entrenamiento es modelado de lenguaje causal condicionado a tripletas de scene graph serializadas `(subject, predicate, object)` producidas por las etapas 1-3 del framework EduSGG.

La innovacion tecnica principal no esta en la arquitectura del LLM sino en el pipeline: la informacion visual se transforma en una representacion simbolica textual (entidades con tipo y bbox, relaciones tipadas) que el LLM consume como contexto. Esto evita entrenar un proyector vision-lenguaje y permite que el razonamiento sea auditable a nivel de grafo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO adicional sobre el adaptador.

## Capacidades

- Visual question answering sobre diagramas cientificos a partir de scene graphs serializados (AI2D).
- Razonamiento grounded sobre relaciones tipadas entre entidades (por ejemplo, `lays`, `hatches_into`, `molts_into`).
- Generacion de explicaciones y captioning alineado con curriculo educativo (CIDEr 35,67 en la evaluacion reportada).
- Planificacion de contenido estructurado con cobertura de flujo del 100 % segun la model card.
- Generacion de texto conversacional y respuesta a preguntas de opcion multiple.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible como capacidad declarada; el modelo actua como etapa 4 de un pipeline externo.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales: modo thinking, vision nativa, audio: no disponibles. La "vision" es indirecta via scene graph textual.

## Casos de uso

- Tutoria STEM automatizada sobre diagramas: el modelo recibe el scene graph de un diagrama de ciclo biologico o esquema fisico y responde preguntas de opcion multiple con justificacion, adecuado por su entrenamiento especifico en AI2D y su capacidad de grounding sobre relaciones tipadas.
- Generacion de explicaciones curriculares: a partir del grafo de un diagrama, produce una narracion estructurada paso a paso (CIDEr 35,67), util para materiales didacticos que requieren cobertura completa del flujo representado.
- Evaluacion automatica de material educativo: dado un diagrama y su grafo, el modelo puede verificar si una explicacion propuesta cubre todas las relaciones del grafo (flow coverage) y detectar omisiones.
- Asistencia a docentes en la creacion de preguntas: el modelo puede formular preguntas de opcion multiple grounded en las entidades y relaciones del grafo, reduciendo el riesgo de preguntas no sustentadas por la imagen.
- Pipeline de accesibilidad: convertir diagramas cientificos en descripciones textuales estructuradas para lectores de pantalla, usando el grafo como fuente de verdad y el adaptador como generador de lenguaje natural.
- Investigacion en razonamiento neuro-simbolico: servir como baseline reproducible de la etapa 4 de EduSGG para comparar contra VLM end-to-end en tareas de diagram reasoning, gracias a su licencia Apache 2.0 y a su tamano de adaptador reducido.
- Integracion en sistemas de Q&A documental tecnica: si el pipeline previo puede extraer grafos de esquemas tecnicos (manuales, planos), el adaptador responde consultas sobre ellos sin necesidad de un modelo multimodal completo.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre AI2D:

| Metodo / Modelo | VQA Acc (%) | CIDEr | Fact F1 (%) | Flow Coverage (%) |
|---|---:|---:|---:|---:|
| Baseline VLM (solo vision) | 71,40 | 18,42 | 5,99 | 0,0 |
| Baseline OCR ingenuo | 76,50 | 22,15 | 7,78 | 20,0 |
| Plantilla determinista | 81,20 | 27,90 | 9,26 | 60,0 |
| EduSGG (propuesto E2E) | 88,74 | 35,67 | 11,97 | 100,0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos de la tabla corresponden a la evaluacion del pipeline EduSGG completo, no exclusivamente al adaptador aislado.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion 4-bit NF4 (ejemplo oficial) el modelo base de 14B ocupa aproximadamente 8-9 GB de pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 12-16 GB de VRAM.
- En bf16/fp16 sin cuantizar, el modelo base requiere aproximadamente 28 GB solo para pesos, mas activaciones; se recomienda 40-48 GB.
- GPU recomendadas: A100 40/80 GB o H100 para bf16; RTX 4090 (24 GB) suficiente en 4-bit; RTX 3090 (24 GB) valida en 4-bit.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion 4-bit; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) es ajustado y puede requerir offload.
- Opciones de despliegue: transformers + bitsandbytes + peft (flujo oficial del ejemplo); vLLM y TGI requeririan fusionar el adaptador en el modelo base (merge) y no estan documentados en la informacion disponible; llama.cpp/Ollama requeririan conversion a GGUF tras el merge, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EduSGG LoRA (este) | 14B base + adaptador | no disponible | LLM + scene graph textual | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-14B-Instruct | 14B | no disponible en la informacion | LLM generalista | Apache 2.0 | Hugging Face (Qwen) |
| Baseline VLM solo vision | no disponible | no disponible | VLM end-to-end | no disponible | no disponible |
| Baseline OCR + LLM | no disponible | no disponible | pipeline OCR + texto | no disponible | no disponible |

Las dos ultimas filas son baselines reportados en la propia model card, sin identificacion del modelo concreto. No se dispone de datos suficientes para comparar con VLM especializados en diagram reasoning de la misma categoria.

## Limitaciones y advertencias

- El modelo no procesa imagenes: depende de que un pipeline externo (EduSGG Stages 1-3) genere el scene graph serializado. Sin ese grafo, el adaptador no aporta capacidad visual.
- La calidad de la respuesta esta acotada por la calidad del grafo de entrada; errores en la deteccion de entidades o relaciones se propagan directamente.
- Riesgo de alucinacion: como LLM generativo, puede producir afirmaciones no sustentadas por el grafo, especialmente en preguntas abiertas.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos del corpus de entrenamiento del modelo base Qwen2.5-14B-Instruct.
- Idiomas soportados no declarados; el prompt de ejemplo esta en ingles y el entrenamiento parece orientado a ingles.
- Contexto maximo no especificado en la ficha del adaptador; conviene consultar la del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validacion independiente de la comunidad; los benchmarks son autodeclarados por el autor.
- La licencia Apache 2.0 se declara en la model card, pero conviene verificar que el modelo base Qwen2.5-14B-Instruct mantiene la misma licencia para uso comercial.
- El paper citado es un preprint en arXiv sin identificador publicado en la informacion disponible; la reproducibilidad de los resultados no esta verificada de forma independiente.
- Para produccion, el adaptador debe fusionarse (merge) con el modelo base si se quiere servir con vLLM o TGI; ese flujo no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndvuongsp/qwen2.5-14b-edusgg-vqa-lora
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Modelo base Qwen2.5-14B (pretrained): https://huggingface.co/Qwen/Qwen2.5-14B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio del proyecto EduSGG: https://github.com/vuongndlst/edusgg-dashboard
- Demo interactiva: https://vuongndlst.github.io/edusgg-dashboard/
