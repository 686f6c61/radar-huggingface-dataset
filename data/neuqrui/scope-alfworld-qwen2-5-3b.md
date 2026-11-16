# neuqrui/scope-alfworld-qwen2.5-3b

## Resumen

scope-alfworld-qwen2.5-3b es un ajuste fino del modelo Qwen2.5-3B-Instruct desarrollado por el usuario neuqrui, orientado especificamente a tareas de agente en entornos textuales. El modelo implementa la politica SCOPE sobre el benchmark ALFWorld, un entorno de simulacion de tareas domesticas en el que un agente debe navegar, manipular objetos y completar instrucciones en lenguaje natural. Segun la model card, se trata del checkpoint en el paso global 150, que reproduce las cifras de la tabla principal del articulo asociado (ALFWorld Avg 97,7).

El modelo parte de la arquitectura transformer densa de Qwen2.5-3B-Instruct (3.397.103.616 parametros) y ha sido entrenado con tecnicas de aprendizaje por refuerzo, concretamente GRPO (Group Relative Policy Optimization) segun las etiquetas del repositorio, ademas de OPSD. El resultado es un modelo de 3B de parametros especializado en razonamiento multi-paso y toma de decisiones secuencial en entornos de agente, no un modelo de proposito general.

Su relevancia radica en que demuestra que un modelo pequeno (3B) puede alcanzar un rendimiento muy alto en ALFWorld cuando se entrena con la politica adecuada, lo que lo convierte en un candidato interesante para investigacion en agentes LLM y para despliegues con requisitos de hardware modestos. La licencia Apache 2.0 facilita su reutilizacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajustado con RL (GRPO/OPSD) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso con atencion causal estandar. Sobre esa base se aplica un ajuste fino mediante aprendizaje por refuerzo: las etiquetas del repositorio indican GRPO (Group Relative Policy Optimization) y OPSD, y la model card identifica la politica resultante como SCOPE. El checkpoint publicado corresponde al paso global 150 del entrenamiento.

No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion del dataset mas alla de ALFWorld, ni sobre si se aplicaron fases adicionales de SFT o DPO. La model card unicamente indica que el modelo reproduce las cifras de la tabla principal del articulo (ALFWorld Avg 97,7), lo que sugiere que el entrenamiento se realizo directamente sobre las trayectorias y recompensas de ALFWorld. No se documentan innovaciones arquitectonicas propias; la novedad reside en el procedimiento de entrenamiento por refuerzo.

## Capacidades

- Generacion de texto y razonamiento secuencial orientado a la resolucion de tareas de agente.
- Planificacion multi-paso en entornos textuales: el modelo esta entrenado para decidir la siguiente accion a partir del estado observado.
- Navegacion y manipulacion de objetos en el entorno ALFWorld (acciones como ir a, coger, abrir, examinar, calentar, limpiar).
- Seguimiento de instrucciones en lenguaje natural dentro de episodios de agente.
- Formato conversacional heredado de Qwen2.5-3B-Instruct (chat template).
- Soporte de tool calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no documenta idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en agentes LLM: el modelo sirve como referencia reproducible de la politica SCOPE en ALFWorld, util para comparar variantes de entrenamiento por refuerzo con un checkpoint concreto (paso 150) y cifras publicadas.
- Evaluacion de tecnicas de RL para modelos pequenos: permite estudiar como GRPO y OPSD afectan a un modelo de 3B en tareas de decision secuencial, con un coste de computo muy inferior al de modelos de mayor tamano.
- Prototipado de agentes domesticos simulados: integrado en un entorno tipo ALFWorld o similar, el modelo puede generar secuencias de acciones para completar instrucciones como calentar un objeto o limpiar una superficie.
- Generacion de trayectorias sinteticas: las salidas del modelo pueden utilizarse para aumentar datasets de entrenamiento de otros agentes o para estudiar estrategias de exploracion.
- Docencia y divulgacion: por su tamano (3B) y licencia Apache 2.0, es adecuado para demostraciones practicas de agentes basados en LLM en cursos y talleres.
- Baseline en pipelines de evaluacion de agentes: sirve como punto de comparacion frente a modelos de mayor tamano en benchmarks de tareas textuales interactivas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| ALFWorld (Avg) | 97,7 | Segun la model card, coincide con la tabla principal del articulo (politica SCOPE, paso global 150) |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 8 y 10 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2-2,5 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y en tarjetas con 8 GB o mas en cuantizacion de 8 bits; en 4 bits puede ejecutarse en GPUs de 6 GB.
- Opciones de despliegue: transformers (libreria indicada en el repositorio), vLLM, TGI (el tag text-generation-inference esta presente), llama.cpp y Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scope-alfworld-qwen2.5-3b | 3,4B | no disponible | Agente ALFWorld (SCOPE) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3,4B | 32.768 tokens (segun la documentacion oficial de Qwen2.5) | Proposito general, chat | Apache 2.0 | Hugging Face |
| Modelos de agente ALFWorld de mayor tamano | no disponible | no disponible | Agente ALFWorld | no disponible | no disponible |

La comparacion cuantitativa de rendimiento en ALFWorld con otros modelos no esta disponible en la informacion proporcionada. El modelo base Qwen2.5-3B-Instruct es la referencia natural, pero no se han publicado sus cifras en ALFWorld dentro de esta ficha.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para ALFWorld y su comportamiento fuera de ese entorno o de tareas de agente similares no esta documentado; puede degradarse en conversacion general.
- Riesgo de alucinacion: como todo LLM, puede generar acciones o afirmaciones no validas en el entorno; en agentes esto se traduce en acciones invalidas o bucles.
- Idiomas: no se documenta soporte multilingue especifico; se asume el comportamiento del modelo base, pero no esta verificado.
- Contexto: la longitud de contexto efectiva no se especifica en la model card; no debe asumirse la del modelo base sin verificacion.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar los terminos del modelo base Qwen2.5.
- Reproducibilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se enlaza el articulo ni el codigo de entrenamiento, lo que dificulta la verificacion independiente de las cifras.
- Uso en produccion: no hay informacion sobre latencia, throughput ni estabilidad en despliegues reales; se recomienda evaluacion propia antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuqrui/scope-alfworld-qwen2.5-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper, blog, repositorio o demo de SCOPE: no disponible en la informacion proporcionada
- Benchmark ALFWorld: no disponible en la informacion proporcionada
