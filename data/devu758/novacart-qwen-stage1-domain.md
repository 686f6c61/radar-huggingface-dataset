# Devu758/novacart-qwen-stage1-domain

## Resumen

novacart-qwen-stage1-domain es un ajuste fino publicado en Hugging Face por el usuario Devu758, construido sobre `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, es decir, sobre Qwen2.5-1.5B-Instruct en su version cuantizada a 4 bits de Unsloth. El entrenamiento se realizo con la libreria Unsloth, segun indica la propia model card, lo que situa el procedimiento en el terreno del fine-tuning eficiente (QLoRA sobre pesos previamente cuantizados) ejecutable en una unica GPU de gama consumer.

Se trata de un modelo denso de tipo transformer decoder-only, con aproximadamente 1.500 millones de parametros y una ventana de contexto heredada del modelo base de 32.768 tokens. La model card no documenta el dataset de entrenamiento, el numero de tokens utilizados, ni si hubo etapas de alineacion adicionales (RLHF, DPO). Tampoco se publican resultados de benchmarks, por lo que no es posible cuantificar la mejora o el deterioro respecto al modelo base.

Su relevancia practica es la de un artefacto de experimentacion: un fine-tune de dominio sobre un modelo pequeno, con licencia Apache 2.0 y solo 0,1 GB de repositorio, pensado para iteraciones rapidas y despliegue en entornos con recursos limitados. El nombre del repositorio sugiere una especializacion orientada a un dominio concreto (posiblemente comercio electronico o gestion de carrito), aunque esta interpretacion no esta confirmada en la informacion disponible. A fecha de la ficha, el modelo acumula 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Parametros totales | Aproximadamente 1.500 millones (1,54 B en el modelo base Qwen2.5-1.5B-Instruct); no confirmado de forma explicita en la model card de este fine-tune |
| Parametros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-1.5B-Instruct; no confirmado en la model card de este fine-tune |
| Tipos de cuantizacion | El modelo base de partida esta publicado en bnb-4bit (bitsandbytes, 4 bits). No se documentan otros formatos en este repositorio |
| Idiomas soportados | en (ingles), declarado en la model card. El modelo base Qwen2.5 es multilingue, pero no hay confirmacion de que este fine-tune conserve ese comportamiento |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit |
| Tarea declarada | text-generation (tags: text-generation-inference, transformers, unsloth, qwen2, trl) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (Hugging Face) | 2026-09-26 |
| Fecha de ultima actualizacion | 2026-09-26 |

Nota tecnica: el tamano del repositorio (0,1 GB) es muy inferior al que ocuparian los pesos completos de un modelo de 1.500 millones de parametros en fp16 (en torno a 3 GB), lo que sugiere que podria tratarse de adaptadores LoRA o de pesos parciales. La model card no especifica si los pesos publicados son completos o adaptadores, por lo que este punto debe verificarse antes de cualquier despliegue.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings de RoPE y atencion con consultas agrupadas (GQA), que reduce el coste de la cache KV en inferencia. El modelo base fue entrenado por el equipo de Qwen sobre un corpus de gran escala y posteriormente alineado mediante instrucciones; la version utilizada aqui es la variante de Unsloth cuantizada a 4 bits con bitsandbytes, lo que reduce el uso de memoria a costa de una perdida de precision numerica.

Sobre ese punto de partida, Devu758 aplico un fine-tuning con Unsloth. La model card unicamente indica que el entrenamiento fue "2x faster with Unsloth", sin detallar el dataset, el numero de tokens, la longitud de secuencia, el rango de LoRA, la tasa de aprendizaje ni si se uso aprendizaje supervisado clasico o alguna variante con preferencias. Tampoco se documenta ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, modos de razonamiento extendido, etc.). En consecuencia, no es posible evaluar la calidad del ajuste ni su grado de especializacion a partir de la informacion publicada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones basicas, condicionado al ajuste de instrucciones del modelo base y a la posible especializacion de dominio del fine-tune.
- Generacion de codigo y resolucion de problemas matematicos sencillos, en la medida en que el modelo base de 1,5 B los soporta; no hay evaluacion publicada para esta variante.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (Qwen2.5-Instruct lo soporta en sus versiones oficiales, pero no se confirma para este fine-tune).
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 1,5 B tiene capacidad limitada para cadenas de razonamiento largas.
- Capacidades multilingues: la model card declara unicamente ingles. El modelo base es multilingue, pero no hay evidencia de que este ajuste lo preserve.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Es un modelo exclusivamente de texto.
- Inferencia cuantizada: compatible con el ecosistema de transformers, text-generation-inference y Unsloth, segun los tags del repositorio.

## Casos de uso

- Prototipado rapido de asistentes de dominio: al ser un modelo de 1,5 B con licencia Apache 2.0 y pesos ligeros, permite iterar sobre un asistente especializado (por ejemplo, soporte de compra o gestion de carrito) sin coste de GPU dedicada, validando el flujo completo antes de escalar a un modelo mayor.
- Clasificacion y extraccion de entidades en conversaciones: con 32.768 tokens de contexto heredados del modelo base, se puede procesar un historial de conversacion completo y extraer campos estructurados (producto, cantidad, direccion, incidencia) con una sola llamada.
- Generacion de respuestas FAQ con recuperacion aumentada (RAG): el modelo puede redactar respuestas a partir de fragmentos recuperados de una base de conocimiento, con coste de inferencia bajo y latencia reducida en GPU consumer.
- Despliegue en el borde o en CPU: con cuantizacion a 4 bits, el modelo cabe en entornos sin GPU dedicada mediante llama.cpp u Ollama, lo que habilita asistentes locales que no envian datos a servicios externos.
- Enrutador de intenciones en pipelines de agentes: dado su tamano, puede actuar como clasificador de intencion de primer nivel que derive las peticiones a modelos mayores, reduciendo el coste total del sistema.
- Base de partida para nuevos experimentos de QLoRA: el repositorio sirve como punto de partida reproducible para probar recetas de fine-tuning con Unsloth sobre un dominio concreto y comparar resultados frente al modelo base.
- Generacion de descripciones de producto en ingles: si el ajuste esta orientado a dominio comercial, puede redactar o reformular fichas de producto a partir de atributos estructurados.
- Evaluacion interna de pipelines de fine-tuning: util como caso de prueba para medir el impacto de la cuantizacion a 4 bits en la calidad final del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos en fp16: en torno a 3,1 GB para 1.500 millones de parametros, mas la cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,6 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,0-1,2 GB para los pesos.
- Cache KV: con 32.768 tokens de contexto completo, la cache KV en fp16 ocupa del orden de 0,9 GB adicionales suponiendo la configuracion GQA del modelo base (12 cabezas de consulta, 2 cabezas KV, dimension de cabeza 128, 28 capas). Es una estimacion derivada de la arquitectura del modelo base, no un dato publicado para este fine-tune.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, Tesla T4, L4). En A100 o H100 el modelo queda enormemente sobredimensionado en memoria, aunque pueden usarse para servir muchas replicas concurrentes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas, e incluso en GPU integradas con memoria unificada mediante llama.cpp.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags), vLLM, llama.cpp, Ollama. Los formatos GGUF no se distribuyen en este repositorio, por lo que habria que convertirlos a partir de safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| novacart-qwen-stage1-domain | ~1,5 B | 32.768 tokens (heredado, no confirmado) | Apache 2.0 | Hugging Face, repo de 0,1 GB, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (128 K con YaRN) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, requiere aceptar la licencia |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face, con benchmarks publicados |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | Hugging Face, con benchmarks publicados |

La comparacion de rendimiento entre estas alternativas no esta disponible para este modelo, ya que no se han publicado evaluaciones. Los datos de parametros y contexto del resto de modelos corresponden a su documentacion publica.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, por lo que no puede afirmarse que el fine-tune mejore al modelo original en ninguna tarea.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha. No existe evidencia externa de uso en produccion.
- Procedencia del entrenamiento no documentada: se desconoce el dataset, su licencia, su composicion y si contiene datos personales o con derechos de autor. Esto es un riesgo relevante para cualquier uso comercial.
- Punto de partida cuantizado a 4 bits: el fine-tune se realizo sobre pesos ya cuantizados con bitsandbytes, lo que puede introducir degradaciones adicionales respecto a un ajuste sobre pesos completos.
- Ambiguedad sobre el contenido del repositorio: con 0,1 GB, es probable que se trate de adaptadores LoRA y no de pesos completos, pero la model card no lo aclara. Verificar antes de desplegar.
- Idioma: solo se declara ingles. Cualquier uso en castellano u otros idiomas no esta respaldado por la documentacion y previsiblemente dara resultados pobres en un modelo de 1,5 B.
- Capacidad limitada: 1,5 B de parametros restringen el razonamiento multi-paso, el seguimiento de instrucciones complejas y la generacion de codigo de cierta extension. No es adecuado como modelo principal de un agente autonomo.
- Riesgo de alucinacion: inherente a los modelos de este tamano, especialmente en tareas de recuperacion de hechos y en dominios especializados. Requiere verificacion posterior en cualquier flujo productivo.
- Sesgos: no se ha realizado ninguna evaluacion de sesgos ni de seguridad sobre este fine-tune. El modelo base puede arrastrar sesgos de su corpus de entrenamiento, y el ajuste de dominio puede amplificarlos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia. Conviene comprobar tambien las condiciones del modelo base y de la libreria Unsloth utilizada en el entrenamiento.
- Longitud de contexto: aunque el modelo base soporta 32.768 tokens, el fine-tune pudo entrenarse con secuencias mucho mas cortas, lo que degradaria el rendimiento en contextos largos. No hay informacion al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Devu758/novacart-qwen-stage1-domain
- Modelo base utilizado: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Documentacion de la familia Qwen2.5 (referencia del modelo base, no de este fine-tune): https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico de Qwen2.5 (referencia del modelo base, no de este fine-tune): https://arxiv.org/abs/2412.15115
