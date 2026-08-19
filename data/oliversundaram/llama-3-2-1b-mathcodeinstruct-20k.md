# OliverSundaram/Llama-3.2-1B-MathCodeInstruct-20k

## Resumen

Llama-3.2-1B-MathCodeInstruct-20k es un ajuste fino del modelo base Llama-3.2-1B (desarrollado por Meta) sobre 20.000 ejemplos del dataset MathLLMs/MathCodeInstruct. El objetivo es especializar el modelo en la resolución de problemas matemáticos planteados en lenguaje natural, generando razonamientos paso a paso intercalados con código Python ejecutable. El autor, OliverSundaram, lo publica como parte de un estudio sobre cómo el volumen de datos de ajuste fino afecta al equilibrio entre rendimiento matemático y capacidades generales, con modelos hermanos entrenados con 5k y 10k ejemplos.

El modelo mantiene la arquitectura transformer decoder-only de Llama-3.2-1B, con 1.235.814.400 parámetros, y se distribuye en formato safetensors. Está pensado como un asistente especializado en matemáticas, no como un asistente conversacional general. Su relevancia radica en demostrar que un modelo pequeño (1B) puede mejorar notablemente en tareas matemáticas con un ajuste fino dirigido, manteniendo un coste de inferencia muy bajo y siendo ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificado (hereda el del base Llama-3.2-1B) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, se puede cuantizar externamente) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (licencia de Meta para Llama 3.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Llama-3.2-1B mediante LoRA con r=16, alpha=16 y dropout=0, aplicado a todas las proyecciones de atención y MLP, y posteriormente fusionado a los pesos completos. El entrenamiento se realizó sobre 20.000 ejemplos del dataset MathCodeInstruct, que combina problemas matemáticos con soluciones que intercalan razonamiento en lenguaje natural y código Python. Se usó una sola época, tamaño de lote efectivo de 16, tasa de aprendizaje de 2e-4 con programación coseno y warmup del 3%. El hardware fue una única GPU RTX 4060 de 8GB, utilizando el framework Unsloth junto con TRL SFTTrainer.

No se aplicó RLHF ni alineación de seguridad adicional más allá de la que ya posee el modelo base. El entrenamiento se centró exclusivamente en la tarea de resolución de problemas matemáticos, sin modificar otras capacidades del modelo base.

## Capacidades

- Resolucion de problemas matematicos en lenguaje natural con razonamiento paso a paso.
- Generacion de codigo Python intercalado con explicaciones para verificar o ejecutar soluciones.
- Manejo de conversaciones multi-turno mediante el chat template de Llama-3.2 (aunque no es su uso principal).
- Razonamiento aritmetico y algebraico basico, adecuado para problemas tipo GSM8K.
- Capacidad de seguir instrucciones simples en ingles.
- No incluye capacidades de vision, audio ni tool calling explicito.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede generar explicaciones detalladas paso a paso para problemas de matematicas de nivel escolar, sirviendo como asistente en plataformas educativas.
- Generacion de soluciones con verificacion programatica: al intercalar codigo Python, permite ejecutar la solucion y comprobar su correccion en entornos como Jupyter o notebooks.
- Preprocesamiento de datasets de entrenamiento: puede utilizarse para generar soluciones razonadas que enriquezcan otros datasets de instruccion matematica.
- Evaluacion de modelos pequenos en tareas de razonamiento: sirve como punto de referencia para estudiar el impacto del ajuste fino en modelos de 1B.
- Integracion en pipelines de QA sobre problemas matematicos: combinado con un sistema de ejecucion de codigo, puede resolver problemas que requieren calculo numerico.
- Prototipado rapido de asistentes especializados: su bajo coste de inferencia permite desplegarlo en entornos con recursos limitados, como Raspberry Pi o CPUs modestas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados obtenidos con lm-evaluation-harness, comparados con el modelo base:

| Benchmark | Llama-3.2-1B (base) | Este modelo | Cambio |
|---|---|---|---|
| GSM8K (5-shot) | 5,8% | 8,9% | +3,1% |
| ARC-Challenge (25-shot) | 36,9% | 35,8% | -1,1% |
| HellaSwag (10-shot) | 64,2% | 63,6% | -0,6% |
| WinoGrande (5-shot) | 60,8% | 61,4% | +0,6% |

No se proporciona un valor numerico para MMLU en la informacion disponible (el campo aparece como null en el model-index y no se incluye en la tabla comparativa). La velocidad de generacion medida en una RTX 4060 es de 37,84 tokens/segundo en modo greedy, frente a los 12,74 tokens/segundo del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 2,5 GB, por lo que cabe en GPUs con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, o incluso CPUs con suficiente RAM si se usa cuantizacion.
- Es compatible con tarjetas de gama baja y puede ejecutarse en entornos sin GPU usando llama.cpp con cuantizacion GGUF.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI.
- Latencia: en una RTX 4060 se obtienen ~37,84 tokens/segundo, lo que permite respuestas interactivas en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Llama-3.2-1B-MathCodeInstruct-20k | 1,24B | no especificado | 8,9% | llama3.2 |
| Llama-3.2-1B (base) | 1,24B | 128k (segun Meta) | 5,8% | llama3.2 |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | ~60% (no comparable directamente) | Apache 2.0 |

La comparacion con Qwen2.5-1.5B-Instruct no es directa por el tamano y el enfoque, pero sirve para contextualizar que un modelo de 1B ajustado para matematicas sigue muy por debajo de modelos instruct generales de tamano similar. No se dispone de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con una sola epoca sobre 20.000 ejemplos, por lo que su generalizacion fuera del dominio matematico es limitada.
- No es un asistente general: falla en tareas conversacionales, creativas o de conocimiento factual fuera del ambito matematico.
- Puede alucinar soluciones o razonamientos incorrectos, especialmente en problemas complejos o ambiguos.
- Solo soporta ingles; no se ha evaluado su rendimiento en otros idiomas.
- No se ha aplicado alineacion de seguridad adicional, por lo que puede generar contenido inapropiado si se le solicita.
- La licencia llama3.2 de Meta impone restricciones de uso comercial y requiere aceptar los terminos de la licencia original.
- Los resultados de benchmarks son modestos en comparacion con modelos de mayor tamano; debe interpretarse como una mejora relativa sobre el base, no como un modelo competitivo a nivel general.

## Enlaces

- [HuggingFace - OliverSundaram/Llama-3.2-1B-MathCodeInstruct-20k](https://huggingface.co/OliverSundaram/Llama-3.2-1B-MathCodeInstruct-20k)
- [Dataset MathLLMs/MathCodeInstruct](https://huggingface.co/datasets/MathLLMs/MathCodeInstruct)
- [Repositorio de entrenamiento (github.com/OliverSundaram/finetuning-Llama3.2-1B)](https://github.com/OliverSundaram/finetuning-Llama3.2-1B)
- [Licencia de Llama 3.2](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE)
