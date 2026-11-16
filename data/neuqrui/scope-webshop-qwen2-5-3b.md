# neuqrui/scope-webshop-qwen2.5-3b

## Resumen

`scope-webshop-qwen2.5-3b` es un ajuste fino del modelo `Qwen/Qwen2.5-3B-Instruct` desarrollado por el usuario neuqrui, orientado especificamente a tareas de agente en entornos de compra web (WebShop). El modelo implementa la politica SCOPE descrita en un articulo de investigacion no enlazado en la model card, entrenada mediante GRPO (Group Relative Policy Optimization) y una tecnica denominada OPSD por el autor. Se trata, por tanto, de un modelo de investigacion para evaluacion de agentes, no de un modelo de proposito general.

El modelo parte de la arquitectura Qwen2 de 3.397.103.616 parametros (aproximadamente 3.4B) y hereda las capacidades del modelo base instructivo, pero su ajuste esta especializado en la resolucion de tareas de navegacion y compra dentro del benchmark WebShop. El checkpoint publicado corresponde al paso global 150 del entrenamiento, que segun el autor iguala los numeros de la tabla principal del paper: WebShop Score 87.9 y tasa de exito (Succ) 85.2.

La relevancia de este modelo es acotada: sirve como referencia reproducible para investigacion en agentes LLM con aprendizaje por refuerzo, y como ejemplo de ajuste fino de un modelo pequeno (3B) para alcanzar rendimiento alto en un entorno concreto. No esta pensado para uso general ni para produccion fuera del entorno WebShop. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de investigacion reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.397.103.616 (~3.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors (probablemente bf16/fp16, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6.8 GB |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Libreria | transformers |
| Pipeline | text-generation |
| Checkpoint | global_step_150 |
| Tecnicas de entrenamiento | GRPO, OPSD |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2 con aproximadamente 3.4B parametros. No se dispone de informacion detallada sobre la composicion del dataset de ajuste, el numero de tokens utilizados ni la configuracion exacta del entrenamiento. La model card unicamente indica que se empleo GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo sin modelo critico que optimiza la politica comparando respuestas dentro de un grupo, y una tecnica denominada OPSD por el autor, cuya definicion no se proporciona en la informacion disponible.

El checkpoint publicado corresponde al paso global 150 del entrenamiento, seleccionado por el autor por coincidir con los resultados de la tabla principal del paper de SCOPE. No se especifican innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.); el modelo conserva la arquitectura del base. Tampoco se detalla si hubo fases de SFT previas, DPO o RLHF adicionales mas alla del GRPO mencionado.

## Capacidades

- Generacion de texto y razonamiento multi-turno heredados de Qwen2.5-3B-Instruct.
- Navegacion y actuacion en el entorno WebShop: busqueda de productos, seleccion de articulos y finalizacion de compras simuladas.
- Toma de decisiones secuenciales orientada a objetivos (agente con observaciones del entorno).
- Formato conversacional (chat template de Qwen2.5).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada (el base lo soporta, pero el ajuste podria haberlo alterado).
- Capacidades multilingues: no disponible; el ajuste esta orientado a WebShop, que es en ingles.
- Modo thinking explicito, vision o audio: no disponible / no soportado segun la informacion.

## Casos de uso

- Evaluacion de agentes LLM en benchmarks: el modelo sirve como politica de referencia para reproducir los resultados del paper SCOPE en WebShop (Score 87.9, Succ 85.2) y comparar con otras politicas de agente.
- Investigacion en aprendizaje por refuerzo: permite estudiar el efecto de GRPO y OPSD sobre un modelo base de 3B en una tarea de decision secuencial con recompensa verificable.
- Baseline para ajuste fino de agentes: util como punto de partida para experimentos con otros entornos (ALFWorld, ScienceWorld, etc.) aplicando el mismo pipeline de entrenamiento.
- Analisis de eficiencia de modelos pequenos: con 3.4B parametros, permite medir hasta que punto un modelo compacto puede igualar a modelos mayores en tareas de agente acotadas.
- Docencia y divulgacion: ejemplo reproducible de como ajustar un modelo instructivo para una tarea de agente concreta con licencia Apache 2.0.
- Despliegue en entornos de simulacion: al ser un modelo pequeno, puede ejecutarse en una sola GPU consumer para entornos de prueba de agentes de compra.
- No se recomienda su uso en atencion al cliente real, generacion de codigo en produccion ni tareas generales, dado su ajuste especializado.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| WebShop | Score | 87.9 |
| WebShop | Success rate (Succ) | 85.2 |

Los datos proceden de la model card del autor y corresponden al checkpoint `global_step_150`. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4 GB de pesos; en 4 bits, aproximadamente 2.5 GB (siempre que se generen cuantizaciones GGUF/AWQ, no publicadas en el repo).
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM para bf16 (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4090, A10, L4). Para cuantizacion 4 bits, GPUs con 4-6 GB podrian ser suficientes.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 8 GB o mas en bf16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). vLLM, llama.cpp y Ollama no estan confirmados en la informacion, aunque al ser arquitectura Qwen2 serian compatibles si se generan los formatos adecuados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scope-webshop-qwen2.5-3b | ~3.4B | no disponible | Agente WebShop (GRPO/OPSD) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-3B-Instruct | ~3.4B | no disponible en la informacion | Proposito general instructivo | Apache 2.0 | Hugging Face (ampliamente usado) |
| Modelos de agente WebShop de referencia | no disponible | no disponible | Agente WebShop | no disponible | no disponible |

La comparativa cuantitativa con otras politicas de agente WebShop no esta disponible en la informacion proporcionada. El unico punto de comparacion directo es el modelo base Qwen2.5-3B-Instruct, del que este checkpoint hereda arquitectura y licencia pero del que no se aportan metricas WebShop en la model card.

## Limitaciones y advertencias

- Modelo de investigacion especializado: su rendimiento fuera del entorno WebShop no esta validado y probablemente sea inferior al del base por sobreajuste a la tarea.
- Sesgos: no documentados en la informacion disponible; al derivar de Qwen2.5-3B-Instruct, hereda los sesgos del base, no evaluados en esta ficha.
- Riesgo de alucinacion: alto en tareas generales; el ajuste con RL sobre un entorno concreto puede degradar la fidelidad fuera de distribucion.
- Idioma: el entrenamiento se realiza sobre WebShop, en ingles; el soporte multilingue no esta confirmado.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste; conviene no asumir la del base sin verificacion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requeriria validacion propia.
- Reproducibilidad: el checkpoint es `global_step_150`; no se publican hiperparametros, dataset ni codigo de entrenamiento en la informacion disponible, lo que dificulta reproducir los resultados.
- Trazabilidad: 0 descargas y 0 likes; no hay evidencia de validacion independiente de los numeros reportados.
- El paper de SCOPE no esta enlazado en la model card; no se puede verificar la metodologia OPSD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuqrui/scope-webshop-qwen2.5-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper de SCOPE: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
