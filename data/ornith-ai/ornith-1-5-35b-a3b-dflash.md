# ornith-ai/Ornith-1.5-35B-A3B-DFlash

## Resumen

Ornith-1.5-35B-A3B-DFlash es un modelo borrador (draft) de decodificacion especulativa publicado por ornith-ai. No es un modelo de lenguaje autonomo: su funcion es proponer bloques de tokens en paralelo para que el modelo objetivo, ornith-ai/Ornith-1.5-35B-A3B, los verifique y acepte o rechace. A pesar de que el nombre incluye "35B-A3B", el checkpoint de este repositorio contiene 385.906.176 parametros (~386 M), aproximadamente un 1,1 % del tamano del modelo objetivo.

Tecnicamente es un modelo de difusion por bloques (block diffusion) de bajo coste, integrado en un esquema de decodificacion especulativa denominado DFlash. Se distribuye con licencia MIT, en formato safetensors, y exige codigo personalizado (custom_code) y runtimes muy recientes: Transformers >= 5.8.1, vLLM >= 0.20.2 (probado con 0.28.0) o SGLang 0.5.18.

Su relevancia es de infraestructura: permite elevar el throughput de decodificacion de un MoE de ~35B con ~3B parametros activos por token sin alterar la distribucion de salida del modelo objetivo, algo critico para servir agentes de codigo y cargas de razonamiento con cadena de pensamiento. El repositorio es muy reciente y poco descargado (9 descargas y 11 likes en la ultima actualizacion, 28 de septiembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador de difusion por bloques (block diffusion) para decodificacion especulativa; linaje Qwen3 / Qwen3.5 |
| Parametros totales | 385.906.176 (~386 M) |
| Parametros activos | no aplica (el borrador no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue del modelo objetivo usa max-model-len 32768) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se publica GGUF ni variante cuantizada del borrador) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con custom_code (requiere trust-remote-code) |

Especificaciones del modelo objetivo asociado (ornith-ai/Ornith-1.5-35B-A3B):

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre linaje Qwen3.5 / Gemma4 (segun la model card del proyecto) |
| Parametros totales | 35B (nominal, segun nomenclatura del autor) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible (ejemplo de servicio con 32768 tokens) |
| Licencia | MIT (el repositorio DFlash) |
| Formato de pesos | safetensors, con variante FP8 publicada aparte |

## Arquitectura y entrenamiento

El checkpoint DFlash es un modelo de difusion para lenguaje que genera un bloque de tokens de forma paralela en lugar de autoregresivamente. En el esquema de servicio, el borrador propone bloques de 8 tokens (`num_speculative_tokens: 8` en vLLM, `--speculative-dflash-block-size 8` en SGLang) y el modelo objetivo los verifica en una sola pasada, aceptando o corrigiendo cada propuesta. Este mecanismo preserva la distribucion de salida del objetivo siempre que la verificacion sea exacta, lo que lo diferencia de tecnicas de decodificacion aproximada.

La informacion disponible no detalla el numero de tokens de entrenamiento del borrador, la composicion del dataset ni si se emplearon tecnicas de alineacion (RLHF, DPO) especificas para el draft. Si se describe el proceso del modelo objetivo: Ornith-1.5 extiende Ornith-1.0 (construido sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales) ampliando el bucle de auto-mejora para optimizar conjuntamente la generacion de tareas, la construccion de andamiajes (scaffolds) y los rollouts de solucion, con mejora de politica mediante aprendizaje por refuerzo. La familia declarada abarca variantes MoE de 397B, 35B y 9B.

## Capacidades

- El checkpoint DFlash no genera texto de forma autonoma: su unica capacidad es proponer bloques de tokens candidatos para su verificacion por el modelo objetivo.
- Aceleracion de decodificacion mediante difusion por bloques, con bloques de 8 tokens.
- Compatibilidad con dos stacks de servicio: vLLM (metodo `dflash`) y SGLang (algoritmo `DFLASH`).
- Al desplegarse junto al objetivo, hereda las capacidades de este: razonamiento con modo `thinking` (bloques `<think> ... </think>` devueltos en el campo `reasoning_content`), generacion de codigo y capacidades agenticas.
- Soporte de tool calling / function calling en el objetivo, con parser que convierte los bloques `<tool_call>` en `tool_calls` estilo OpenAI.
- Soporte de agentes y razonamiento multi-paso en el objetivo.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de asistencia de codigo en produccion: desplegando el objetivo en vLLM con `--speculative-config '{"method":"dflash", ...}'`, el borrador reduce la latencia por token en completados de codigo, donde la tasa de aceptacion de la decodificacion especulativa suele ser alta por la naturaleza predecible del texto fuente.
- Agentes de ingenieria de software en CI/CD: los flujos agenticos requieren muchos pasos de generacion cortos y repetidos; acelerar cada paso con un borrador de 386 M reduce el tiempo total del bucle sin cambiar las decisiones del modelo objetivo.
- Chat de baja latencia: en atencion al cliente automatizada, donde el objetivo soporta conversaciones multi-turno y tool calling, el borrador recorta el tiempo hasta el primer token utilizable en cada turno.
- Razonamiento con cadena de pensamiento: el objetivo emite bloques `<think>` largos antes de la respuesta final; la decodificacion especulativa con bloques de 8 tokens resulta especialmente ventajosa en secuencias de razonamiento estructurado y repetitivo.
- Generacion offline por lotes: en pipelines de sintesis de datos o anotacion masiva, el aumento de throughput se traduce directamente en menos horas de GPU por millon de tokens.
- Despliegue on-premise con GPU limitadas: al ocupar el borrador menos de 1 GB, el coste adicional de memoria es marginal frente al modelo objetivo, lo que lo hace viable incluso en nodos con poca VRAM libre.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de un borrador de difusion por bloques integrado en vLLM y SGLang, util para comparar tasas de aceptacion frente a otros esquemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el checkpoint DFlash. La model card referencia una imagen de resultados (`assets/ornith_35b_eval.png`) del modelo objetivo, pero no incluye cifras en texto.

Datos indirectos disponibles sobre el modelo objetivo (no sobre el borrador):

| Modelo | Benchmark | Resultado | Fuente |
|---|---|---|---|
| Ornith-1.5-35B-A3B | BenchAlign (leaderboard publico) | 31,97 / 100, puesto 159 de 209 | benchlm.ai |
| Ornith-1.5-35B-A3B-DFlash | Benchmarks propios | no disponible | HuggingFace |

Tampoco se publican datos de tasa de aceptacion (acceptance rate), speedup medido ni latencia comparada frente a decodificacion autoregresiva estandar.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,77 GB en bf16/fp16, calculado a partir de los 385,9 M de parametros (estimacion derivada del recuento de safetensors; el repositorio completo ocupa 0,8 GB).
- El cuello de memoria lo determina el modelo objetivo: un MoE de 35B en bf16 ronda los 70 GB de pesos, por lo que requiere GPU de 80 GB (H100, A100 80GB) o tensor parallelism; la variante FP8 publicada aparte reduce aproximadamente a la mitad ese requisito.
- En GPU de consumo: el borrador cabe holgadamente en cualquier GPU consumer (RTX 3060 12 GB en adelante), pero el modelo objetivo no cabe completo en una GPU de 24 GB salvo cuantizacion agresiva y offload, no documentados en la informacion disponible.
- Opciones de despliegue: vLLM >= 0.20.2 (probado con 0.28.0) con `--speculative-config` y `method: dflash`; SGLang 0.5.18 con `--speculative-algorithm DFLASH`; Transformers >= 5.8.1 para carga directa. No se documenta soporte para llama.cpp, Ollama, TGI ni LM Studio.
- Ejemplo de despliegue de referencia: tensor parallelism 1, puerto 8801, `gpu-memory-utilization 0.85`, `max-model-len 32768`, 8 tokens especulativos (vLLM); en SGLang, `tp-size 1`, `mem-fraction-static 0.80`, bloque de 8.
- Latencia y throughput: no disponibles. Solo se declara que el objetivo del diseno es mejorar el throughput de decodificacion manteniendo la distribucion de salida.
- Parametros de muestreo recomendados por el autor: temperature 0.6, top_p 0.95, top_k 20 para tareas generales; temperature 1.0 para reproducir los benchmarks declarados.

## Comparativa con modelos similares

La informacion proporcionada no incluye cifras comparativas con otros borradores de decodificacion especulativa. La comparacion se limita a caracteristicas cualitativas:

| Enfoque | Tipo de borrador | Formato | Compatibilidad declarada | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-DFlash | Difusion por bloques, 386 M | safetensors + custom_code | vLLM, SGLang, Transformers | MIT | no disponibles |
| Ornith-1.5-35B-A3B-FP8 (objetivo cuantizado) | No es borrador; variante cuantizada del objetivo | safetensors | segun model card | no disponible en la informacion | no disponibles |
| EAGLE-3 | Borrador autoregresivo con capas ocultas | no disponible | no disponible | no disponible | no disponibles |
| Medusa | Cabezas de prediccion multiples | no disponible | no disponible | no disponible | no disponibles |
| Decodificacion autoregresiva estandar (sin borrador) | no aplica | no aplica | universal | no aplica | linea base de referencia |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo autonomo: la propia model card indica `inference: false`. Cargarlo sin el modelo objetivo no produce generacion util.
- Confusion de nomenclatura: el sufijo "35B-A3B" describe al modelo objetivo, no al checkpoint de este repositorio, que tiene ~386 M de parametros. Cualquier estimacion de requisitos basada en el nombre sera incorrecta.
- Requiere `trust-remote-code` y pesos con `custom_code`, lo que implica ejecutar codigo del autor del repositorio y anade riesgo en entornos de produccion con politicas estrictas.
- Dependencia de versiones muy concretas y recientes (Transformers >= 5.8.1, vLLM >= 0.20.2, SGLang 0.5.18). Fuera de esas versiones el soporte DFlash puede no existir o comportarse de forma distinta.
- Sin datos publicados de tasa de aceptacion ni speedup: el beneficio real de aceleracion no esta verificado de forma independiente en la informacion disponible.
- Riesgo de degradacion en escenarios de baja aceptacion: si el borrador propone bloques que el objetivo rechaza con frecuencia, el coste de verificacion puede anular la ganancia de throughput.
- Adopcion muy baja: 9 descargas y 11 likes, sin evidencia de uso en produccion a gran escala ni de mantenimiento continuado.
- Sesgos y alucinaciones: no se documentan sesgos especificos del borrador. Al operar como draft verificado, la salida final depende del modelo objetivo, por lo que los sesgos y el riesgo de alucinacion del objetivo (incluido su modo de razonamiento) se trasladan al resultado.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingue en el pipeline completo.
- Licencia MIT en el repositorio, lo que permite uso comercial del checkpoint, pero la licencia del modelo objetivo y de los datos de entrenamiento debe verificarse por separado antes de un despliegue comercial.
- Longitud de contexto del borrador: no especificada. El ejemplo de servicio fija 32768 tokens en el objetivo; no hay confirmacion de que el borrador soporte ventanas mayores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-DFlash
- Modelo objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante cuantizada FP8 del objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Sitio de Ornith AI: https://ornith.ai/
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Analisis de Ornith-1.5 35B-A3B para agentes de codigo: https://wavespeed.ai/blog/ai-models/ornith-1-5-35b-a3b-review/
- Ficha de benchmarks del modelo objetivo: https://benchlm.ai/models/ornith-1-5-35b-a3b
