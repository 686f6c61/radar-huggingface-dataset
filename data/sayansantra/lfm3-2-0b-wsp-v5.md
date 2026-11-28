# Sayansantra/LFM3-2.0B-WSP-V5

## Resumen

LFM3-2.0B-WSP-V5 es un ajuste fino del modelo LiquidAI/LFM3-1.7B orientado especificamente a function calling y uso agéntico de herramientas. Lo desarrolla el usuario independiente Sayansantra y se distribuye bajo licencia Apache 2.0. El modelo parte de la arquitectura LFM3 de Liquid AI (transformer denso de 1,7B parametros) y la expande a 29 capas y 2,02B parametros mediante una tecnica propia denominada "equation-seeded block expansion", que inserta cinco bloques identidad de residual cero en profundidades concretas y los inicializa por interpolacion (golden-ratio, harmonica y coseno) de las capas vecinas.

El objetivo declarado es maximizar el rendimiento en el benchmark Berkeley Function Calling Leaderboard (BFCL) manteniendo un tamano reducido que permita despliegue en hardware modesto. Para ello, el autor congela las 24 capas originales del backbone y entrena exclusivamente las 5 capas expandidas con datos sinteticos de abstención ante irrelevancia y de trayectorias de tool calling, mezclados en la frontera de Pareto con un factor lambda de 0,22.

Su relevancia actual radica en que demuestra que es posible mejorar de forma notable la capacidad de function calling de un modelo pequeno mediante expansion de bloques y ajuste quirurgico, sin reentrenar el backbone completo. Los resultados declarados en el BFCL oficial (4.091 tareas) son competitivos en las divisiones no-live y de irrelevancia, aunque el rendimiento en multi-turno con estado real sigue siendo muy bajo (17,25%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso LFM3 (Liquid AI) con expansion de bloques a 29 capas |
| Parametros totales | 2.017.366.016 (2,02B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente compatible con bf16/fp16; cuantizaciones GGUF/AWQ no declaradas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 4,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 de Liquid AI, un transformer denso de 1,7B parametros y 24 capas. Sobre esa base, el autor aplica una expansion de bloques ("equation-seeded block expansion") que inserta cinco bloques identidad con residual inicializado a cero en las profundidades 13, 16, 19, 22 y 25, lo que eleva el total a 29 capas y 2,02B parametros. La inicializacion de esos bloques no es aleatoria: se siembra mediante interpolacion golden-ratio, harmonica y coseno de las capas vecinas, de modo que la red expandida reproduce aproximadamente el comportamiento del modelo original antes del ajuste.

El entrenamiento posterior congela las 24 capas originales y ajusta unicamente las 5 capas nuevas con datos sinteticos libres de contaminacion: ejemplos de abstención ante peticiones irrelevantes (para reducir alucinaciones de tool calling) y trayectorias de llamada a funciones. La mezcla de ambas tareas se realiza en la frontera de Pareto con lambda = 0,22, priorizando ligeramente la tarea de tool calling sobre la de abstención. No se declaran en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato chat.
- Function calling y tool calling estructurado, con soporte para llamadas simples, multiples y paralelas.
- Abstención ante peticiones irrelevantes (irrelevance detection), mejorada de forma sustancial respecto a la version V4.
- Razonamiento agéntico de un solo turno con esquemas de herramientas.
- Soporte de multiples esquemas de funciones en una misma peticion (multiple y parallel multiple).
- Capacidades multilingues: no declaradas en la informacion disponible.
- Capacidades de vision, audio o thinking mode: no disponibles.
- Integracion con transformers y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Orquestacion de agentes con herramientas en produccion: el modelo puede generar llamadas JSON estructuradas a APIs externas con una precision declarada del 87,19% en el promedio AST no-live, suficiente para flujos de automatizacion donde el coste por token es critico.
- Enrutamiento de funciones en asistentes conversacionales: con 91,75% en simple_python, es adecuado para seleccionar la funcion correcta entre un catalogo dado en cada turno de una conversacion de soporte.
- Ejecucion de llamadas paralelas: el 85,5% en parallel permite resolver peticiones que requieren invocar varias herramientas simultaneamente (por ejemplo, consultar clima y vuelos en una sola respuesta).
- Filtro de abstención en pipelines de agentes: el 80,83% en irrelevance permite descartar peticiones fuera de dominio antes de invocar herramientas, reduciendo llamadas erroneas y costes de API.
- Prototipado rapido en hardware de consumo: con 2,02B parametros y pesos safetensors de 4,1 GB, puede ejecutarse en GPUs consumer (por ejemplo, RTX 3060 12 GB o superiores) para desarrollo y pruebas locales.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, a diferencia de modelos con licencias de comunidad.
- Evaluacion comparativa de tecnicas de expansion de bloques: util como referencia para investigadores que estudien weight-space programming y expansion de capas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el BFCL oficial (4.091 tareas). No verificados de forma independiente (`verified: false`).

| Division BFCL | Tareas | V4 | V5 (lambda=0,22) |
|---|---|---|---|
| Non-Live simple_python (AST) | 400 | 91,75% | 91,75% |
| Non-Live multiple (AST) | 200 | 90,50% | 90,50% |
| Non-Live parallel (AST) | 200 | 85,00% | 85,50% |
| Non-Live parallel_multiple (AST) | 200 | 82,00% | 81,00% |
| Non-Live Python AST promedio | 800 | 87,31% | 87,19% |
| Irrelevance (abstención) | 240 | 48,75% | 80,83% |
| Live simple | 258 | 69,38% | 69,38% |
| Live multiple | 1.053 | — | 63,53% |
| Live parallel | 16 | — | 87,50% |
| Live parallel_multiple | 24 | — | 58,33% |
| Live irrelevance | 882 | — | 75,51% |
| Live relevance | 18 | — | 55,56% |
| Promedio 6 splits core single-turn | 1.498 | 77,98% | 83,16% |
| Full Live Suite (ponderado) | 2.251 | — | 69,03% |
| Multi-turn base | 200 | 18,00% | 18,00% |
| Multi-turn miss_func | 200 | 15,50% | 15,00% |
| Multi-turn miss_param | 200 | 16,50% | 17,50% |
| Multi-turn long_context | 200 | 18,00% | 18,50% |
| Full Stateful Multi-Turn | 800 | 17,00% | 17,25% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,3 GB (cuantizaciones no publicadas oficialmente, estimacion a partir del numero de parametros).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM en bf16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code`), vLLM y TGI presumiblemente compatibles al ser un transformer estandar, aunque no se declaran configuraciones probadas. llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL non-live AST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-2.0B-WSP-V5 | 2,02B | No disponible | 87,19% | Apache 2.0 | Hugging Face |
| LiquidAI/LFM3-1.7B (base) | 1,7B | No disponible | No declarado | No disponible en la informacion | Hugging Face |
| Qwen3.8-27B (referencia BFCL) | 27B (aprox.) | No disponible | 82,50% (parallel), 83,50% (parallel_multiple) | No disponible | No disponible |
| Gemma 4 26B (referencia BFCL) | 26B (aprox.) | No disponible | 89,13% | No disponible | No disponible |

La comparacion con Qwen3.8-27B y Gemma 4 26B procede de la tabla de referencia del propio autor en la model card; no se dispone de datos independientes que confirmen esos valores ni de especificaciones completas de esos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en multi-turno con estado real: 17,25% en el conjunto completo de 800 episodios, lo que lo hace inadecuado para agentes que requieran mantener estado entre turnos.
- El rendimiento en Live Suite (69,03% ponderado) es notablemente inferior al de las divisiones no-live, lo que sugiere menor robustez ante esquemas de herramientas reales y diversos.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`); deben tomarse con cautela.
- El modelo se entrena exclusivamente en las 5 capas expandidas, lo que puede limitar la plasticidad y generalizacion fuera de las tareas de tool calling.
- Riesgo de alucinacion en tool calling: aunque la abstención mejora al 80,83% en irrelevance no-live, el 17,25% de multi-turno y el 55,56% en live_relevance indican margen de error considerable.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingue solido.
- Contexto maximo no declarado; el autor menciona truncamiento del 0,13% con 195,9 tokens de media en los splits core, pero no especifica la ventana real.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el modelo base LFM3-1.7B puede tener sus propias condiciones que conviene revisar.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sayansantra/LFM3-2.0B-WSP-V5
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Version previa V3: https://huggingface.co/Sayansantra/LFM3-1.7B-WSP-V3
- Version previa V4: https://huggingface.co/Sayansantra/LFM3-2.0B-WSP-V4
- Dataset BFCL: https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
- Leaderboard BFCL: https://gorilla.cs.berkeley.edu/leaderboard.html
