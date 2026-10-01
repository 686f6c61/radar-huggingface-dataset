# ornith-ai/Ornith-1.5-9B-DFlash

## Resumen

Ornith-1.5-9B-DFlash es un modelo borrador (draft model) de decodificacion especulativa publicado por ornith-ai. No es un modelo de lenguaje autonomo: se disena para ejecutarse junto a Ornith-1.5-9B, un transformer denso de 9B parametros que actua como modelo objetivo (target) y verifica las propuestas. El checkpoint pesa 1.291.904.512 parametros (aproximadamente 1,29 mil millones) y ocupa 2,6 GB en el repositorio, en formato safetensors.

Tecnicamente, DFlash emplea un modelo borrador de difusion por bloques (block diffusion) que propone varios tokens en paralelo en lugar de un token por paso. El modelo objetivo valida esas propuestas, de modo que la pila de servicio aumenta el throughput de decodificacion preservando la distribucion de salida del target. Se distribuye bajo licencia MIT y requiere runtimes recientes: Transformers >= 5.8.1, vLLM >= 0.20.2 (probado con 0.28.0) y SGLang 0.5.18.

El interes del artefacto es de eficiencia mas que de calidad de modelado: permite acelerar el despliegue de Ornith-1.5-9B, el miembro mas ligero de la familia Ornith-1.5 (que incluye variantes MoE de 35B y 397B). Ornith-1.5 se construye sobre Ornith-1.0, a su vez derivado de Qwen3.5 y Gemma4 mediante preentrenamiento continuado, mid-training y post-training, con un bucle de auto-mejora en el que el modelo propone tareas, genera andamiajes (scaffolds) y produce rollouts para aprendizaje por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador de difusion por bloques (block diffusion) para decodificacion especulativa; el modelo objetivo Ornith-1.5-9B es un transformer denso de la linea Qwen3.5/Gemma4 |
| Parametros totales | 1.291.904.512 (aproximadamente 1,29 mil millones) segun los pesos en safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ o GPTQ declaradas |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors con codigo personalizado (custom_code); requiere trust_remote_code |

## Arquitectura y entrenamiento

DFlash es el componente de decodificacion especulativa del proyecto. Su mecanica consiste en un borrador ligero basado en difusion por bloques que propone multiples tokens de forma paralela; el modelo objetivo Ornith-1.5-9B verifica esas propuestas y conserva la distribucion de salida final. La separacion de roles es estricta: Ornith-1.5-9B genera y verifica, mientras que Ornith-1.5-9B-DFlash solo acelera. Por ese motivo la model card separa explicitamente los benchmarks de calidad del modelo objetivo de las mediciones de aceleracion del stack DFlash.

Del modelo objetivo se sabe que es un transformer denso de 9B parametros, disenado para despliegue en una sola GPU y con una variante cuantizada (Ornith-1.5-9B-Mobile) orientada a dispositivos moviles. La familia Ornith-1.5 procede de Ornith-1.0, desarrollado sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales. Ornith-1.5 amplia el bucle de auto-mejora: en lugar de depender de un conjunto fijo de tareas curadas y andamiajes disenados a mano, el sistema genera nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora la politica mediante aprendizaje por refuerzo. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si el borrador DFlash se entreno de forma conjunta o independiente al target.

## Capacidades

- Aceleracion de decodificacion especulativa: propone bloques de tokens en paralelo que el modelo objetivo verifica, aumentando el throughput sin alterar la distribucion de salida del target.
- No genera respuestas finales por si mismo: es un componente auxiliar y no un modelo de lenguaje autonomo.
- Razonamiento (heredado del target): Ornith-1.5-9B es un modelo de razonamiento que abre el turno del asistente con un bloque `<think> ... </think>` antes de la respuesta final.
- Tool calling (heredado del target): el modelo objetivo emite bloques `<tool_call>` que la pila de servicio puede exponer como `tool_calls` al estilo OpenAI mediante el parser correspondiente.
- Separacion de cadena de pensamiento: con el parser de razonamiento activado, el chain-of-thought se devuelve en un campo `reasoning_content` independiente.
- Capacidades de agente y razonamiento multi-paso: la familia Ornith esta orientada a tareas agenticas y su entrenamiento por RL se centra en tareas, andamiajes y rollouts.
- Capacidades multilingues: no disponible.
- Capacidades multimodales, de audio o vision: no disponible.

## Casos de uso

- Servicio de inferencia de alto throughput: desplegar Ornith-1.5-9B junto al borrador DFlash en vLLM (>= 0.20.2, probado con 0.28.0) o SGLang 0.5.18 para aumentar los tokens por segundo en produccion manteniendo la calidad del modelo objetivo.
- Reduccion de coste por token en API propia: al proponer varios tokens por paso de decodificacion, el borrador puede rebajar el coste de GPU por peticion en cargas sostenidas de generacion de texto.
- Asistentes con razonamiento largo: aplicaciones donde el target emite bloques `<think>` extensos antes de responder; la aceleracion resulta mas relevante cuanto mayor es el numero de tokens generados.
- Agentes con tool calling: pipelines agenticos que invocan funciones de forma repetida y necesitan latencia baja por turno, aprovechando el parser de `tool_calls` del runtime.
- Codigo asistido en produccion: con los parametros de muestreo recomendados para codigo (temperature 0.6, top_p 0.95, top_k 20), integrar el par target+DFlash en herramientas de autocompletado o generacion de parches donde el coste de inferencia es un cuello de botella.
- Despliegue en una sola GPU: el target denso de 9B mas un borrador de 2,6 GB permite montar el stack completo en hardware de gama alta de una unica tarjeta, sin necesidad de paralelismo tensorial.
- Evaluacion de tecnicas de decodificacion especulativa: utilizar DFlash como referencia reproducible frente a otros esquemas de borrador (EAGLE, Medusa, draft models densos) en experimentos de eficiencia.
- Chat multi-turno de atencion al cliente: conversaciones con historial largo servidas por el target, donde la aceleracion reduce el coste marginal de cada turno adicional; la ventana de contexto concreta no esta publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia una figura de evaluacion de Ornith-1.5-9B (`assets/ornith_9b_eval.png`) y describe secciones separadas de calidad del modelo objetivo y de mediciones de aceleracion del stack DFlash, pero no se incluyen valores concretos de MMLU, HumanEval, GSM8K ni de speedup en el material proporcionado.

## Requisitos de hardware

- VRAM del borrador DFlash: aproximadamente 2,6 GB en bf16/fp16, coherente con los 1,29B parametros y el tamano de repositorio de 2,6 GB. En int8 rondaria 1,3 GB y en int4 unos 0,7 GB, aunque no se publican checkpoints cuantizados.
- VRAM del stack completo: el target denso de 9B en bf16 ocupa del orden de 18 GB, de modo que el par target mas borrador se situa en torno a 21 GB de pesos, a lo que hay que sumar cache KV y overhead del runtime. Estas cifras son estimaciones basadas en el numero de parametros, no datos publicados.
- GPU consumer: el stack completo es ajustado en una RTX 4090 de 24 GB en bf16; el borrador por si solo cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU de datacenter: A100 (40 GB y 80 GB), H100 y similares ofrecen margen suficiente para el par completo con contexto largo y concurrencia elevada.
- Opciones de despliegue: vLLM >= 0.20.2 (validado con 0.28.0), SGLang 0.5.18 y Transformers >= 5.8.1. El repositorio declara `custom_code`, por lo que se requiere `--trust-remote-code`. No se declaran recetas para llama.cpp u Ollama.
- Latencia y throughput: no se publican cifras concretas. La model card indica que la propuesta paralela de tokens mejora el throughput de decodificacion, sin cuantificar el factor de aceleracion ni la tasa de aceptacion del borrador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-DFlash | Borrador de difusion por bloques para decodificacion especulativa | 1,29B | No disponible | MIT | Pesos en HuggingFace (safetensors) |
| Ornith-1.5-9B | Modelo objetivo, transformer denso | 9B (aproximado) | No disponible | No disponible en la informacion proporcionada | Pesos en HuggingFace |
| EAGLE-3 | Borrador de decodificacion especulativa (cabezas autoregresivas sobre features) | No disponible | No aplica | No disponible | Implementaciones en frameworks de inferencia |
| Medusa | Borrador de decodificacion especulativa (multiples cabezas de decodificacion) | No disponible | No aplica | No disponible | Implementaciones en frameworks de inferencia |
| Modelo borrador denso convencional | Decodificacion especulativa clasica (draft autoregresivo pequeno) | Tipicamente 0,5B-1,5B | Depende del borrador | Depende del borrador | Amplia |

La informacion disponible no permite comparar tasas de aceptacion, speedup ni calidad entre DFlash y las alternativas citadas, ya que no se publican mediciones en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo autonomo: el checkpoint DFlash no genera respuestas finales y debe cargarse junto a Ornith-1.5-9B en un runtime con soporte de decodificacion especulativa.
- Metadatos restrictivos: la model card declara `inference: false`, por lo que no se puede invocar mediante la Inference API estandar de HuggingFace ni con pipelines genericos de texto.
- Dependencia de versiones: exige Transformers >= 5.8.1, vLLM >= 0.20.2 y SGLang exactamente en 0.5.18, lo que limita su uso en stacks congelados o antiguos.
- Codigo personalizado: el uso de `custom_code` y `trust_remote_code` implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado en entornos de produccion.
- Riesgo de alucinacion: recae sobre el modelo objetivo, no sobre el borrador; la verificacion del target preserva la distribucion de salida, pero no elimina los errores facticos de Ornith-1.5-9B.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Idioma y contexto: no se declaran los idiomas soportados ni la longitud de contexto, lo que impide planificar despliegues multilingues o con ventanas largas sin verificacion propia.
- Licencia: MIT, permisiva para uso comercial, pero conviene comprobar la licencia del modelo objetivo Ornith-1.5-9B, que no esta disponible en la informacion proporcionada.
- Ausencia de cuantizaciones publicadas: no hay GGUF ni formatos de peso alternativos, lo que reduce las opciones de despliegue en hardware limitado.
- Sin datos de rendimiento: no hay cifras publicadas de speedup, tasa de aceptacion del borrador, latencia ni throughput, por lo que cualquier estimacion de mejora debe validarse en el entorno propio.

## Enlaces

- Repositorio HuggingFace de Ornith-1.5-9B-DFlash: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
- Repositorio HuggingFace del modelo objetivo Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Sitio oficial de Ornith AI: https://ornith.ai/
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
