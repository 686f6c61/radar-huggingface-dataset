# neuqrui/scope-webshop-qwen3-1.7b

## Resumen

scope-webshop-qwen3-1.7b es un ajuste fino del modelo Qwen3-1.7B desarrollado por el usuario neuqrui, orientado especificamente a tareas de agente en entornos de compra web (WebShop). El modelo implementa una politica de agente entrenada con tecnicas de aprendizaje por refuerzo (GRPO, Group Relative Policy Optimization) siguiendo el metodo SCOPE descrito por el autor, y se distribuye como checkpoint del paso global 150, que corresponde a los numeros de la tabla principal del paper asociado (WebShop Score 83,2 / tasa de exito 78,9).

Se trata de un modelo pequeno (2.031.739.904 parametros, aproximadamente 2,03 mil millones) construido sobre la arquitectura transformer densa de Qwen3-1.7B, con licencia Apache 2.0 y pesos en formato safetensors. Su relevancia radica en que demuestra que un modelo de menos de 2.500 millones de parametros puede alcanzar tasas de exito cercanas al 79 % en WebShop cuando se entrena con el pipeline adecuado de RL, lo que lo hace atractivo para despliegues con recursos limitados.

El modelo esta pensado exclusivamente para investigacion en agentes y evaluacion en WebShop; no es un modelo de proposito general y su model card no documenta capacidades fuera de ese dominio. La informacion publica disponible es muy escasa: no se detallan idiomas soportados, composicion del dataset de entrenamiento ni resultados de benchmarks mas alla de la cifra citada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (aprox. 2,03 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de la familia Qwen3 con aproximadamente 2,03 mil millones de parametros. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization), un algoritmo de RL sin modelo critico que estima ventajas relativas dentro de grupos de respuestas muestreadas. La model card menciona tambien la etiqueta "opsd" y el metodo SCOPE, aunque no se detalla en la informacion disponible en que consiste exactamente ni como se combina con GRPO.

El checkpoint publicado corresponde al paso global 150 del entrenamiento. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la presencia de fases SFT/DPO previas ni innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). El entorno de entrenamiento declarado es WebShop, un benchmark de agentes que simula compras en una tienda online con instrucciones en lenguaje natural.

## Capacidades

- Generacion de texto orientada a la toma de decisiones secuencial en entornos de agente.
- Interaccion multi-turno con un entorno web simulado (WebShop): busqueda de productos, seleccion de articulos y finalizacion de la compra.
- Formulacion de acciones tipo tool calling dentro del bucle del agente, segun el formato exigido por el entorno WebShop.
- Razonamiento multi-paso para completar una tarea de compra a partir de una instruccion en lenguaje natural.
- Capacidades multilingues: no disponibles (no documentadas).
- No se documentan capacidades de vision, audio, modo "thinking" explicito ni function calling generico fuera del entorno WebShop.

## Casos de uso

- Evaluacion de agentes en WebShop: el modelo sirve como politica de referencia para reproducir los numeros de la tabla principal del paper SCOPE (Score 83,2 / Succ 78,9) en el paso global 150.
- Investigacion en RL para agentes: permite estudiar el efecto de GRPO sobre un modelo base pequeno y comparar curvas de entrenamiento con otras variantes.
- Baseline de bajo coste en benchmarks de agentes web: al tener solo ~2 B de parametros, se puede ejecutar en una unica GPU consumer para iterar rapidamente sobre entornos y recompensas.
- Destilacion o generacion de trayectorias: el modelo puede producir trayectorias de accion en WebShop que sirvan como datos de entrenamiento para modelos mayores o para tecnicas de imitacion.
- Prototipado de asistentes de compra: en un entorno controlado y simulado, se puede usar para validar pipelines de busqueda, seleccion y confirmacion de producto antes de trasladarlos a produccion.
- Ablaciones de contexto y formato de prompt: al ser un modelo pequeno, es adecuado para medir como afectan distintas plantillas de instruccion y longitudes de contexto al exito en la tarea.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los citados en la model card para el checkpoint global_step_150 en WebShop:

| Benchmark | Metrica | Resultado |
|---|---|---|
| WebShop | Score | 83,2 |
| WebShop | Success rate (Succ) | 78,9 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2,5-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones a partir del tamano de parametros, no verificadas con artefactos publicados).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100; cabe holgadamente en cualquier GPU consumer con 8 GB o mas en bf16.
- Despliegue: compatible con transformers y text-generation-inference segun los tags del repositorio; tambien deberia poder servirse con vLLM, llama.cpp u Ollama tras conversion a los formatos correspondientes, aunque no se publican artefactos GGUF en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WebShop Succ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scope-webshop-qwen3-1.7b | ~2,03 B | no disponible | 78,9 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | ~2,03 B | no disponible en la informacion | no disponible | Apache 2.0 | Hugging Face |
| Otros agentes WebShop de la literatura SCOPE | no disponible | no disponible | no disponible en la informacion | no disponible | no disponible |

La comparativa con alternativas concretas de la misma categoria no esta disponible en la informacion proporcionada; solo se puede contrastar con el modelo base, para el que no se aportan cifras de WebShop.

## Limitaciones y advertencias

- Modelo especializado: entrenado exclusivamente para WebShop; su comportamiento fuera de ese entorno no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion y de acciones invalidas dentro del entorno, especialmente ante instrucciones fuera de distribucion.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-1.7B hereda los sesgos del modelo base, no evaluados en esta ficha.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue.
- Longitud de contexto no documentada; no se debe asumir la ventana nativa de Qwen3 sin verificar la configuracion del checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero el modelo esta pensado para investigacion; el autor no ofrece garantias de aptitud para produccion.
- Un unico checkpoint (global_step_150) publicado; no hay variantes intermedias ni finales que permitan estudiar la estabilidad del entrenamiento.
- Repositorio con muy poca traccion (6 descargas, 0 likes en el momento de la consulta); no hay comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/neuqrui/scope-webshop-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog o repositorio del metodo SCOPE: no disponible en la informacion proporcionada.
- Demo o espacio asociado: no disponible en la informacion proporcionada.
