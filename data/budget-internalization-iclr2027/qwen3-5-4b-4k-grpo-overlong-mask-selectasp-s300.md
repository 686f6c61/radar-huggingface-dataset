# budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-overlong-mask-selectasp-s300

## Resumen

El modelo `qwen3.5-4b-4k-grpo-overlong-mask-selectasp-s300` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario `budget-internalization-iclr2027` y publicado como parte de una submission anonima a ICLR 2027. Su proposito concreto es el razonamiento matematico bajo un presupuesto estricto de generacion de 4.096 tokens: el entrenamiento con GRPO filtra las respuestas que exceden ese limite, de modo que el modelo aprende a internalizar el presupuesto en lugar de truncar la salida a posteriori.

El modelo tiene 4.539.265.536 parametros en BF16 y una ventana de generacion limitada a 4.096 tokens nuevos. Se distribuye en formato safetensors con arquitectura Qwen3.5 y se integra directamente con `transformers` y vLLM, ademas de declarar compatibilidad con endpoints. La relevancia actual radica en que aborda un problema practico de produccion: como hacer que un modelo de razonamiento largo no se extienda indefinidamente consumiendo presupuesto de computo, algo critico en despliegues con latencia o coste acotados.

La ficha se enfrenta a una limitacion importante de informacion: la model card no publica resultados de evaluacion, la busqueda web no ha devuelto ningun enlace tecnico relacionado con el modelo (solo resultados irrelevantes sobre presupuestos estatales y alquiler de coches) y el repositorio no tiene descargas ni valoraciones. Todos los datos tecnicos proceden exclusivamente de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer decoder, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (la model card no la especifica; el presupuesto de generacion es de 4.096 tokens nuevos) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (no se declara lista de idiomas; la plantilla de prompt esta en ingles) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 9,1 GB |
| Pipeline declarado | image-text-to-text |
| Modalidad de uso documentada | Texto (el ejemplo de codigo usa `AutoModelForCausalLM`) |
| Paso de checkpoint | 300 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder de aproximadamente 4,5 mil millones de parametros. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) orientado a razonamiento matematico, con una innovacion metodologica central: el filtrado de respuestas excesivamente largas ("overlong mask"). Cuando una respuesta generada supera el presupuesto de 4.096 tokens, se trunca y se enmascara en la funcion de perdida, de manera que no contribuye al gradiente. El objetivo es que el modelo internalice el limite de presupuesto y produzca cadenas de razonamiento completas dentro del mismo, en lugar de aprender a partir de trazas truncadas.

Los datos de entrenamiento proceden del dataset `agentica-org/DeepScaleR-Preview-Dataset`, compuesto por problemas de matematicas, con un maximo de 3 epocas. La configuracion concreta es: lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule de learning rate coseno, LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales. La recompensa es binaria y se calcula mediante extraccion de la respuesta encerrada en etiquetas `\boxed{}`. La plantilla de prompt utilizada es: "Think step-by-step to solve the following problem. Output your answer inside of \boxed{} tags.: {problem}\n\nLet's think step-by-step". Los pesos se publican en BF16. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Razonamiento matematico paso a paso con formato de respuesta forzado mediante `\boxed{}`.
- Razonamiento con presupuesto acotado: el modelo esta entrenado explicitamente para resolver problemas dentro de 4.096 tokens de generacion.
- Generacion de texto conversacional (el tag `conversational` esta declarado en el repositorio).
- Razonamiento de multiples pasos (chain-of-thought), dado que el prompt de entrenamiento induce "Let's think step-by-step".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step tool use: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades multimodales: el pipeline declarado es `image-text-to-text`, pero la model card solo documenta uso de texto con `AutoModelForCausalLM`, por lo que la vertiente visual no esta confirmada ni documentada.
- Modo "thinking" explicito separado: no disponible.

## Casos de uso

- Resolucion de problemas matematicos en produccion con coste acotado: el modelo esta entrenado para no exceder 4.096 tokens de generacion, lo que permite presupuestar de forma fiable el coste por consulta en APIs de tutoria o resolucion de ejercicios.
- Correccion automatica de ejercicios de matematicas: la salida estructurada con `\boxed{}` facilita la extraccion programatica de la respuesta final y su comparacion con la solucion de referencia.
- Generacion de datasets sinteticos de razonamiento: puede utilizarse para producir trazas de razonamiento cortas y autocontenidas, utiles para destilar modelos mas pequenos con presupuestos de tokens estrictos.
- Investigacion en eficiencia de razonamiento: sirve como referencia experimental para estudiar la internalizacion de presupuestos de tokens frente al modelo base sin ajustar.
- Despliegue en infraestructura con latencia maxima garantizada: al limitar la generacion a 4.096 tokens, el peor caso de latencia es predecible, lo que encaja en pipelines sincronos con SLA.
- Evaluacion comparativa de tecnicas de RL para matematicas: util como checkpoint intermedio (paso 300) en estudios sobre GRPO, enmascarado de respuestas largas y distintos presupuestos.
- Integracion en asistentes conversacionales de tematica STEM: el tag `conversational` y el formato de chat del modelo base permiten conversaciones multiturno sobre problemas matematicos.
- Servicio via endpoint compatible con OpenAI: la etiqueta `endpoints_compatible` y el ejemplo con vLLM permiten exponerlo como API sin cambios en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MATH, GSM8K, AIME, Minerva u otros), ni comparaciones con el modelo base o con alternativas, ni curvas de recompensa durante el entrenamiento.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 9,1 GB (tamano del repositorio).
- VRAM estimada para inferencia en BF16: del orden de 11-13 GB contando pesos, activaciones y cache KV en generaciones de hasta 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 6-8 GB (cuantizacion no publicada oficialmente, requiere conversion propia).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4-6 GB (cuantizacion no publicada oficialmente, requiere conversion propia).
- GPU recomendadas para BF16: NVIDIA A100 40/80 GB, H100, L40S, RTX 4090 24 GB, RTX 3090 24 GB.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 16 GB o mas en BF16 con margen, y en tarjetas de 12 GB si se cuantiza a 8 o 4 bits. No cabe en GPUs de 8 GB sin cuantizacion agresiva.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"`; vLLM (`vllm serve <repo>`); cualquier framework compatible con safetensors. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-4k-grpo-overlong-mask-selectasp-s300 | 4,54 B | No disponible | No publicado | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-4B (base) | No disponible | No disponible | No disponible en esta informacion | Apache 2.0 | HuggingFace |
| agentica-org/DeepScaleR-1.5B-Preview (mismo dataset de entrenamiento) | 1,5 B (aproximado) | No disponible | No disponible en esta informacion | No disponible | HuggingFace |

No se dispone de datos de rendimiento para ninguno de los tres modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato de distribucion. La busqueda web no aporto ninguna referencia adicional que permita contrastar resultados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados, por lo que no es posible verificar la calidad del razonamiento matematico ni compararla con el modelo base.
- Procedencia anonima: el repositorio pertenece a una submission anonima a ICLR 2027, sin revision por pares completada ni autoria identificable, lo que dificulta la trazabilidad del trabajo.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por terceros.
- Presupuesto de generacion fijo de 4.096 tokens: los problemas que requieran cadenas de razonamiento mas largas pueden quedar con respuestas incompletas o incorrectas, ya que el modelo fue entrenado para operar dentro de ese limite.
- Riesgo de alucinacion: es un modelo pequeno (4,54 B) especializado en matematicas; es previsible que genere pasos plausibles pero incorrectos en problemas fuera de su distribucion de entrenamiento. No se documentan tasas de error.
- Sesgos: no hay informacion sobre composicion del dataset mas alla del nombre (DeepScaleR-Preview-Dataset), ni analisis de sesgos linguisticos, culturales o de genero.
- Idiomas: no se declara soporte multilingue; la plantilla de entrenamiento esta en ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Ambiguedad multimodal: el pipeline declarado es `image-text-to-text`, pero la model card no documenta ninguna capacidad de vision, lo que puede inducir a error al integrarlo.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar los terminos vigentes de Qwen/Qwen3.5-4B antes de un despliegue comercial.
- Sin formatos cuantizados oficiales: desplegar en hardware limitado exige convertir los pesos uno mismo, con el riesgo de degradacion no medida.
- Uso responsable: es un modelo de investigacion; no deberia emplearse como unica fuente de verdad en contextos educativos o de evaluacion sin supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-overlong-mask-selectasp-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Repositorio vLLM (usado en el ejemplo de despliegue): https://github.com/vllm-project/vllm
- Repositorio Transformers: https://github.com/huggingface/transformers
- Paper, blog o demo adicionales: no disponibles. Las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo (unicamente sitios de alquiler de vehiculos y de presupuestos estatales, sin relacion con el proyecto).
