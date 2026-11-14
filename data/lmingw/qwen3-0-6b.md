# lmingw/Qwen3-0.6B

## Resumen
Qwen3-0.6B es el modelo denso de menor tamano de la familia Qwen3, desarrollada por el equipo Qwen de Alibaba. Este repositorio concreto (`lmingw/Qwen3-0.6B`) es una publicacion derivada del modelo base oficial `Qwen/Qwen3-0.6B-Base`, distribuida bajo licencia Apache 2.0 y empaquetada para su uso con `transformers`. Resuelve el problema de disponer de un modelo de lenguaje causal compacto (751.632.384 parametros reales segun los pesos safetensors, 0,6B nominales y 0,44B sin embeddings) capaz de alternar entre razonamiento explicito y dialogo directo dentro del mismo modelo.

La relevancia de esta variante radica en su huella reducida: con 28 capas, atencion GQA (16 cabezas de consulta y 8 de clave/valor) y una ventana de contexto de 32.768 tokens, puede ejecutarse en hardware de consumo y servir como base para experimentacion, prototipado y despliegue en entornos con recursos limitados. Pertenece a la generacion Qwen3, que introduce conmutacion seamless entre modo thinking y non-thinking, alineacion reforzada de preferencias humanas y capacidades de agente.

Al tratarse de una publicacion derivada con cero descargas y cero likes en el momento de la consulta, conviene tratar este repositorio como una copia de referencia del modelo oficial; la documentacion tecnica y los resultados de evaluacion proceden de la model card de Qwen3, no de mediciones propias de este fork.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 28 capas, atencion GQA con 16 cabezas Q y 8 cabezas KV |
| Parametros totales | 751.632.384 (0,6B nominales; 0,44B sin embeddings) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (soporte de llama.cpp, Ollama, LM Studio y MLX-LM implicaria GGUF y otras cuantizaciones, sin detalle oficial) |
| Idiomas soportados | mas de 100 idiomas y dialectos (segun la model card de Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repo de 1,5 GB |

## Arquitectura y entrenamiento
El modelo es un transformer causal denso con normalizacion y atencion agrupada por consultas (GQA), con 28 capas y una relacion de 16 cabezas de consulta frente a 8 de clave/valor, lo que reduce el coste de memoria del cache KV durante la inferencia. Se distribuye como modelo preentrenado y postentrenado (pretraining y post-training), partiendo de `Qwen/Qwen3-0.6B-Base`. La model card no detalla el volumen exacto de tokens de entrenamiento ni la composicion del dataset para esta variante de 0,6B.

La innovacion central de la familia Qwen3 es la conmutacion seamless entre modo thinking (razonamiento explicito envuelto en un bloque `<think>...</think>`) y modo non-thinking (dialogo general eficiente), controlada mediante el parametro `enable_thinking` en `tokenizer.apply_chat_template`. El postentrenamiento incluye alineacion de preferencias humanas orientada a escritura creativa, role-play, dialogos multi-turno y seguimiento de instrucciones, asi como capacitacion para el uso preciso de herramientas externas en ambos modos. Los detalles sobre RLHF/DPO y mezcla de datos no estan disponibles en la informacion proporcionada.

## Capacidades
- Generacion de texto y dialogos conversacionales multi-turno con alineacion a preferencias humanas.
- Razonamiento logico complejo, matematicas y generacion de codigo en modo thinking.
- Modo non-thinking para respuestas rapidas de proposito general, con conmutacion dentro del mismo modelo.
- Capacidades de agente: integracion precisa con herramientas externas (tool calling / function calling) tanto en modo thinking como non-thinking.
- Seguimiento de instrucciones multilingue y traduccion en mas de 100 idiomas y dialectos.
- Escritura creativa y role-play.
- No se documentan capacidades de vision ni de audio en la informacion disponible.

## Casos de uso
- Asistente conversacional ligero en local: el modelo gestiona dialogos multi-turno con hasta 32.768 tokens de contexto y puede desplegarse en un portatil mediante Ollama o LM Studio, resultando adecuado para prototipos de atencion al usuario sin dependencia de la nube.
- Generacion de codigo en pipelines de desarrollo: en modo thinking produce razonamiento paso a paso para tareas de programacion y puede integrarse en editores o scripts de CI/CD a traves de una API compatible con OpenAI servida por vLLM o SGLang.
- Automatizacion de agentes con herramientas: gracias al soporte de tool calling en ambos modos, puede orquestar llamadas a APIs externas en flujos de trabajo de varios pasos, por ejemplo consulta de datos y composicion de respuestas.
- Traduccion y atencion multilingue: con soporte de mas de 100 idiomas, sirve para traduccion automatica y respuestas en idiomas minoritarios en aplicaciones de bajo coste.
- Clasificacion y extraccion de informacion: su tamano compacto permite ejecutarlo en lotes sobre grandes volumenes de texto para etiquetado, resumen o extraccion de entidades en entornos con GPU modestas.
- Educacion y tutoria: el modo thinking explicita el razonamiento matematico, lo que lo hace util para generar explicaciones paso a paso en plataformas de aprendizaje.
- Base para fine-tuning: al ser un modelo de 0,6B bajo Apache 2.0, es un punto de partida economico para ajuste supervisado y experimentacion academica en una sola GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog, GitHub y documentacion oficiales de Qwen3 para las evaluaciones, pero no incluye cifras concretas para esta variante de 0,6B.

## Requisitos de hardware
- VRAM estimada para inferencia: en precision completa (bf16/fp16) los pesos ocupan aproximadamente 1,5 GB; en cuantizacion de 8 bits alrededor de 0,8 GB y en 4 bits en torno a 0,4-0,5 GB, mas el cache KV para el contexto. Estas cifras son estimaciones a partir del numero de parametros, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en cuantizacion; para precision completa se recomienda 8 GB o mas. GPU de datacenter como A100 o H100 son sobredimensionadas para este tamano y solo tendrian sentido para servir muchos usuarios concurrentes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes, asi como en Apple Silicon via MLX-LM.
- Opciones de despliegue: transformers (version >= 4.51.0), vLLM (>= 0.8.5) con `--enable-reasoning --reasoning-parser deepseek_r1`, SGLang (>= 0.4.6.post1) con `--reasoning-parser qwen3`, llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B (este repo) | 0,6B (751M reales) | 32.768 | Apache 2.0 | Hugging Face, transformers, vLLM, SGLang, Ollama | Modo thinking/non-thinking conmutable, tool calling |
| Qwen3-0.6B oficial (`Qwen/Qwen3-0.6B`) | 0,6B | 32.768 | Apache 2.0 | Hugging Face oficial | Modelo de referencia del que deriva este repositorio |
| Qwen3-1.7B | 1,7B | 32.768 | Apache 2.0 | Hugging Face oficial | Misma familia, mayor capacidad a costa de mas VRAM |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 (segun familia Qwen2.5) | Apache 2.0 | Hugging Face oficial | Generacion anterior, sin modo thinking |

Los datos de rendimiento comparativo entre estas alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias
- Riesgo de repeticiones infinitas: la propia model card advierte que, ante repeticiones significativas, se ajusten los parametros de muestreo y se fije `presence_penalty` a 1,5.
- Alucinacion: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto, especialmente en tareas de conocimiento especializado; no se documentan mitigaciones especificas.
- Sesgos: no se detallan sesgos conocidos en la informacion disponible; cabe esperar sesgos heredados de los datos de preentrenamiento web.
- Limitaciones de contexto: la ventana maxima es de 32.768 tokens; no se documenta extension mediante RoPE scaling en esta variante.
- Capacidad limitada por tamano: con 0,6B de parametros, el rendimiento en razonamiento complejo y matematicas avanzadas sera inferior al de modelos mayores de la misma familia.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el enlace de licencia oficial de Qwen antes de desplegar en produccion.
- Repositorio derivado: al ser una publicacion de terceros con cero descargas, se recomienda verificar la integridad de los pesos frente al modelo oficial antes de usarlo en produccion.
- Idiomas: aunque se declaran mas de 100 idiomas, la calidad puede variar y no se aportan evaluaciones por idioma.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/lmingw/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo oficial Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Chat Qwen: https://chat.qwen.ai/
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
