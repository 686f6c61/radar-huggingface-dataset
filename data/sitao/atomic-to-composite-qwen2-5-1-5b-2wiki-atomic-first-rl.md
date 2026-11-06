# sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-atomic-first-rl

## Resumen

Este modelo es un ajuste fino de Qwen2.5-1.5B publicado por el autor sitao (Sitao Cheng) como artefacto de investigacion asociado al paper "From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning" (arXiv:2512.01970). Se trata de un modelo de 1.777 millones de parametros (1,5B) entrenado para responder preguntas de razonamiento multi-salto (multi-hop QA) sobre pasajes reales de Wikipedia, concretamente sobre el conjunto de datos 2WikiMultiHopQA. No es un asistente generalista, sino una pieza experimental para estudiar la composicion de habilidades.

El modelo implementa la receta "atomic-first": primero un ajuste supervisado (SFT) sobre habilidades atomicas de memoria y contexto (SFT_Mem+Ctx), y despues un entrenamiento con refuerzo GRPO sobre la tarea compuesta. El resultado es un modelo que, con solo 1,5B parametros, alcanza un 88,6 % de exact match en la parte de composicion del test set de 2Wiki, superando claramente a la receta "composite-first" (68,8 %) y al SFT directo sobre la tarea compuesta (71,4 %).

Su relevancia radica en que demuestra que el orden del entrenamiento (habilidades atomicas primero, refinamiento con RL despues) determina la capacidad de generalizacion composicional, un problema abierto en modelos pequenos. La licencia Apache 2.0 y el formato safetensors facilitan su reproduccion e integracion en pipelines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.777.088.000 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B, no confirmada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B, un transformer decoder-only con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. El modelo parte del checkpoint SFT `sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-atomic`, que a su vez se entreno con LLaMA-Factory sobre habilidades atomicas de memoria y contexto usando pasajes reales de Wikipedia de 2WikiMultiHopQA.

Sobre esa base se aplico GRPO (Group Relative Policy Optimization) implementado en verl durante 200 pasos sobre preguntas compuestas de 2Wiki. La innovacion metodologica no esta en la arquitectura sino en el curriculum de entrenamiento: entrenar primero habilidades atomicas y luego refinar con RL sobre la tarea compuesta produce una generalizacion composicional muy superior a entrenar directamente sobre la tarea compuesta. La comparacion con la receta composite-first esta controlada por pasos (ambos RL usan los mismos 200 pasos y los mismos datos).

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas sobre pasajes de Wikipedia en ingles.
- Razonamiento multi-salto: responde preguntas que requieren combinar informacion de dos o mas parrafos (por ejemplo, identificar el lugar de enterramiento del interprete de una cancion).
- Habilidades atomicas de memoria y contexto: recuperacion de hechos y uso del contexto proporcionado en el prompt.
- Generalizacion composicional: capacidad de resolver combinaciones de habilidades no vistas literalmente durante el entrenamiento supervisado.
- Formato conversacional: acepta plantillas de chat (`apply_chat_template`) con un unico turno de usuario que contiene la pregunta y los parrafos.
- No dispone de tool calling, function calling, vision, audio ni modo de pensamiento explicito segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre generalizacion composicional: utilizar el modelo como linea base reproducible para estudiar como el orden SFT → RL afecta a la composicion de habilidades en modelos pequenos.
- Preguntas multi-salto sobre corpus Wikipedia: integrar el modelo en un pipeline de retrieval que recupere parrafos y formule la pregunta en el prompt para obtener la respuesta extractiva.
- Evaluacion de recetas de entrenamiento: comparar esta variante atomic-first con las variantes composite-first y SFT directo sobre el mismo test set de 2Wiki para validar hipotesis de curriculum.
- Prototipado de sistemas de QA de bajo coste: al ser un modelo de 1,5B, puede desplegarse en una GPU consumer para experimentos de investigacion sin grandes presupuestos de computo.
- Generacion de datos sinteticos de razonamiento: usar las respuestas del modelo como candidatos para destilacion o aumento de datos en tareas de multi-hop QA.
- Docencia y divulgacion: ejemplo didactico de como GRPO y el orden del curriculum afectan al rendimiento en tareas compuestas, con codigo y datos publicos.

## Benchmarks y rendimiento

Resultados de exact match (%) en el test set real de 2Wiki, por nivel (IID: 877 items; Composition: 1.200 items), segun la tabla del apendice D del paper:

| Modelo | IID | Composition |
|---|---:|---:|
| SFT sobre habilidades atomicas (SFT_Mem+Ctx) | 83,8 | 71,6 |
| SFT sobre la tarea compuesta (SFT_Comp) | 91,7 | 71,4 |
| Receta atomic-first (SFT_Mem+Ctx → RL_Comp) | 90,4 | 88,6 |
| Receta composite-first (SFT_Comp → RL_Comp) | 90,2 | 68,8 |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (fp16/bf16): aproximadamente 3,5-4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 5-6 GB.
- En cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (siempre que se genere una version cuantizada, no incluida en el repo).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060/4060, RTX 4070, RTX 4090); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas en fp16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (metodo documentado en la model card), text-generation-inference (tag `text-generation-inference`), y en principio vLLM o llama.cpp si se generan pesos compatibles (no verificados en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Composition (2Wiki) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| atomic-to-composite-qwen2.5-1.5b-2wiki-atomic-first-rl | 1,5B | no disponible | 88,6 | Apache 2.0 | Hugging Face |
| atomic-to-composite-qwen2.5-1.5b-2wiki-composite-first-rl | 1,5B | no disponible | 68,8 | Apache 2.0 | Hugging Face |
| atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite | 1,5B | no disponible | 71,4 | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B (base) | 1,5B | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo estudio, que son las unicas con resultados publicados en la informacion disponible. No se dispone de datos de benchmarks de modelos externos comparables en esta ficha.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente de proposito general; el propio autor lo advierte en la model card.
- Entrenado exclusivamente en ingles y sobre el dominio de pasajes de Wikipedia de 2WikiMultiHopQA; el rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion en preguntas fuera de distribucion o cuando los parrafos proporcionados no contienen la respuesta.
- No soporta tool calling, agentes multi-paso, vision ni audio.
- La longitud de contexto efectiva no se documenta en la informacion disponible; conviene no asumir la ventana completa de Qwen2.5-1.5B sin verificacion.
- Sesgos: no se documentan analisis de sesgo; al derivar de Qwen2.5 y de Wikipedia, puede heredar sesgos de ambos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para produccion; el autor lo restringe implicitamente a investigacion.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-atomic-first-rl
- Modelo base (SFT): https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-atomic
- Variante composite-first: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-composite-first-rl
- Variante SFT composite: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite
- Paper: https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo: https://github.com/sitaocheng/from_atomic_to_composite
- Dataset 2WikiMultiHopQA: https://github.com/Alab-NII/2wikimultihop
- Coleccion de modelos y datos sinteticos: https://huggingface.co/collections/sitao/from-atomic-to-composite-6adfe594de6d55a83cf3a287
