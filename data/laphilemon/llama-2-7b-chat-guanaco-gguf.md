# laphilemon/Llama-2-7b-chat-guanaco-GGUF

## Resumen

Llama-2-7b-chat-guanaco-GGUF es una distribucion en formato GGUF del modelo ajustado por laphilemon a partir de NousResearch/Llama-2-7b-chat-hf. El ajuste se realizo con QLoRA sobre el conjunto de datos conversacional multi-turno mlabonne/guanaco-llama2-1k, con un adaptador LoRA de rango 64 y alpha 16 aplicado a las proyecciones q_proj y v_proj. Este repositorio no contiene pesos en safetensors, sino los binarios cuantizados listos para ejecucion local en llama.cpp, Ollama y LM Studio.

El modelo mantiene la arquitectura original de Llama 2: un transformer causal de 7.000 millones de parametros con 32 capas, 32 cabezas de atencion y dimension oculta de 4096. El contexto maximo no se especifica en la informacion disponible, aunque el modelo base Llama 2 declara 4096 tokens. El ajuste fue breve (250 pasos, batch efectivo de 4), orientado a mejorar la conformidad con instrucciones y el formato conversacional mas que a ampliar conocimiento factual.

Su relevancia practica es la de un modelo pequeno de instrucciones empaquetado para inferencia en CPU, Apple Silicon y GPU de consumo. Con cuantizaciones Q4_K_M (~4,08 GB) y Q8_0 (~7,16 GB), cabe en equipos modestos y permite experimentar con ajuste fino y despliegue local sin infraestructura dedicada. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene revisar la cadena de licencias del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer causal, 32 capas, 32 cabezas, hidden dim 4096) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 2 declara 4096 tokens |
| Tipos de cuantizacion | Q4_K_M (4 bits, medium) y Q8_0 (8 bits) |
| Idiomas soportados | ingles (en) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se distribuyen safetensors en este repositorio |

## Arquitectura y entrenamiento

El modelo parte de NousResearch/Llama-2-7b-chat-hf, un transformer decoder-only con atencion multi-cabeza estandar, normalizacion RMSNorm, activacion SwiGLU y RoPE. Sobre esa base se aplico un ajuste QLoRA: cuantizacion de 4 bits del modelo base durante el entrenamiento y adaptadores LoRA de rango 64, alpha 16, restringidos a las proyecciones q_proj y v_proj. El entrenamiento consistio en 250 pasos con batch efectivo de 4 sobre el dataset mlabonne/guanaco-llama2-1k, un subconjunto de 1.000 ejemplos conversacionales derivado de Guanaco. La perdida final de entropia cruzada reportada es 1,2391, lo que corresponde a una perplejidad de 3,4525.

No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. Tampoco se detalla el uso de decodificacion especulativa ni tecnicas de atencion lineal. La innovacion principal del repositorio es operativa: la fusion de los pesos del adaptador y su conversion a GGUF mediante llama.cpp, con empaquetado para Ollama mediante un Modelfile que fija temperatura 0,7, top_p 0,9, top_k 40, repeat_penalty 1,15 y las plantillas de prompt con marcadores [INST] y [/INST].

## Capacidades

- Generacion de texto causal con formato de instrucciones y conversacion multi-turno.
- Razonamiento academico basico y respuesta a preguntas factuales, con retencion cercana a la del modelo base.
- Razonamiento matematico multi-paso elemental, evaluado en GSM8K.
- Extraccion de salida estructurada en JSON en modo zero-shot, con validacion de esquema segun la model card.
- Retencion de contexto en conversaciones secuenciales, con terminacion limpia del token EOS y sin bucles repetitivos segun el autor.
- Capacidades multilingues limitadas a ingles y espanol declarados.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en ingles y espanol sobre una ventana de contexto de 4096 tokens (segun el modelo base), ejecutandose en un portatil con la cuantizacion Q4_K_M y 6 GB de RAM.
- Prototipado de chatbots sin conexion: con Ollama y `ollama run hf.co/laphilemon/Llama-2-7b-chat-guanaco-GGUF` se puede levantar un servicio de chat en local para pruebas de producto antes de invertir en infraestructura.
- Extraccion de datos estructurados: la model card reporta validacion de salida JSON zero-shot con invariantes programaticos (name, age, location), util para convertir texto libre en registros con esquema fijo en pipelines de ingestión.
- Generacion de respuestas con formato de instrucciones: adecuado para tareas de resumen, reescritura y clasificacion simple donde se requiere seguir una plantilla estricta, gracias al ajuste sobre Guanaco.
- Despliegue en dispositivos de borde: con Q4_K_M (~4,08 GB) puede ejecutarse en Apple Silicon con Metal o en mini-PC con CPU, sirviendo como asistente embebido en aplicaciones de escritorio.
- Base para nuevos ajustes: al distribuirse en GGUF y con licencia Apache 2.0, sirve como punto de partida reproducible para experimentos de QLoRA sobre dominios concretos antes de cuantizar de nuevo.
- Educacion e investigacion: util para comparar el efecto de un ajuste breve de instrucciones frente al modelo base en tareas de razonamiento y consistencia factual, con deltas medidos en ARC, MMLU, GSM8K y TruthfulQA.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados con EleutherAI lm-evaluation-harness frente al modelo base NousResearch/Llama-2-7b-chat-hf:

| Benchmark | Protocolo | Base Llama-2-7B-Chat | Checkpoint ajustado | Delta |
|---|---|---|---|---|
| ARC-Challenge | 25-shot | 53,1 % | 53,8 % | +0,7 % |
| MMLU | 5-shot | 45,3 % | 45,6 % | +0,3 % |
| GSM8K | 3-shot | 14,1 % | 14,5 % | +0,4 % |
| TruthfulQA | 0-shot (MC2) | 38,8 % | 40,2 % | +1,4 % |
| Training Loss | 250 pasos | 1,850 | 1,239 | -0,611 |
| Perplejidad final | exp(Loss) | 6,360 | 3,452 | -2,908 |

Ademas, la model card declara una perdida de entrenamiento de 1,2391 y una perplejidad de 3,4525 sobre el dataset guanaco-llama2-1k en el model-index. Estos valores no estan verificados de forma independiente.

## Requisitos de hardware

- VRAM/RAM para Q4_K_M: aproximadamente 4,08 GB de pesos; se recomiendan 6 GB o mas de RAM.
- VRAM/RAM para Q8_0: aproximadamente 7,16 GB de pesos; se recomiendan 10 GB o mas de RAM.
- GPU recomendadas: no especificadas en la model card; por tamano, una RTX 3060 de 12 GB o superior puede alojar Q8_0 en GPU, mientras que Q4_K_M cabe en GPUs de 6-8 GB.
- Caben en GPU de consumo: si, con Q4_K_M en tarjetas de 6 GB o mas y con Q8_0 en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama (importacion directa desde Hugging Face o mediante Modelfile), LM Studio, y ejecucion en CPU o Apple Silicon con Metal.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-2-7b-chat-guanaco-GGUF | 7B | no disponible (base 4096) | GGUF | Apache 2.0 | Ajuste QLoRA breve sobre Guanaco; deltas de +0,3 a +1,4 puntos frente al base |
| NousResearch/Llama-2-7b-chat-hf | 7B | 4096 | safetensors | Llama 2 Community License | Modelo base sin ajuste adicional; referencia de los benchmarks |
| laphilemon/Llama-2-7b-chat-finetune-guanaco | 7B | no disponible | safetensors (adaptador fusionado) | Apache 2.0 | Version sin cuantizar del mismo ajuste; requiere conversion a GGUF para inferencia local |
| Mistral-7B-Instruct-v0.1 | 7B | 8192 | safetensors, GGUF | Apache 2.0 | Alternativa contemporanea de 7B con contexto mayor; no se dispone de comparacion de benchmarks en la informacion proporcionada |

## Limitaciones y advertencias

- El ajuste es muy corto (250 pasos, 1.000 ejemplos) y los deltas de rendimiento son pequenos; no cabe esperar mejoras sustanciales en conocimiento factual ni en razonamiento complejo.
- El modelo base Llama 2 presenta sesgos conocidos en genero, etnia y religion; el ajuste sobre Guanaco no corrige esos sesgos y puede reforzar estilos de respuesta del dataset.
- Riesgo de alucinacion: TruthfulQA en torno al 40 % en MC2 indica una consistencia factual limitada; no es adecuado para tareas que exijan veracidad estricta sin verificacion externa.
- Cobertura linguistica restringida a ingles y espanol declarados; el rendimiento real en espanol no se cuantifica en la model card.
- Longitud de contexto no documentada en este repositorio; asumir 4096 tokens del modelo base y validar el comportamiento en prompts largos antes de produccion.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar la cadena de licencias del modelo base Llama 2 y del dataset Guanaco antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los benchmarks declarados.
- No se documenta soporte de tool calling ni de agentes; no disenar flujos que dependan de function calling sin evaluacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/laphilemon/Llama-2-7b-chat-guanaco-GGUF
- Modelo base del ajuste: https://huggingface.co/laphilemon/Llama-2-7b-chat-finetune-guanaco
- Modelo base original: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset de ajuste: https://huggingface.co/datasets/mlabonne/guanaco-llama2-1k
- Paper QLoRA: https://arxiv.org/abs/2305.14314
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
