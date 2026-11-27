# KenCao2007/DeltaKL-summarizer-qwen3-4b-zebra

## Resumen

DeltaKL-summarizer-qwen3-4b-zebra es un modelo especializado de resumen (summariser) entrenado por KenCao2007 como componente del sistema TruSuCo (truncate, summarise, continue), descrito en el articulo *Self-Improving Long-Horizon Reasoning by Learning Summaries from Local Continuations* (arXiv:2611.31621). TruSuCo permite a un solver congelado razonar mas alla de su ventana de contexto: cada 4.096 tokens el razonamiento se trunca, este modelo lo condensa y el solver continua a partir de la pregunta, los resumenes acumulados y los ultimos 128 tokens en bruto. El modelo resuelve, por tanto, el problema de mantener coherencia en razonamientos de horizonte largo sin ampliar el contexto del solver.

Se trata de un fine-tuning de Qwen/Qwen3-4B-Instruct-2507 (4.411.424.256 parametros) mediante GRPO sobre la recompensa Delta-KL, que mide cuanto se aproxima la continuacion del solver a partir del resumen a su continuacion a partir del razonamiento completo. El entrenamiento se realizo especificamente para el solver Qwen/Qwen3-4B-Instruct-2507 sobre puzles Zebra de Reasoning Gym (niveles 1-2).

Su relevancia es acotada pero tecnica: no es un modelo de proposito general, sino una pieza de infraestructura de inferencia que demuestra que un resumidor pequeno entrenado con RL puede mejorar la precision de un solver congelado en tareas de razonamiento de horizonte largo (de 51,5% a 54,6% en Zebra a 32k tokens de presupuesto). Es un artefacto de investigacion reproducible, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de 4.096 tokens en el bucle TruSuCo) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4,4 mil millones de parametros, y se especializa mediante fine-tuning con GRPO (Group Relative Policy Optimization) para producir resumenes de razonamientos parciales. El entrenamiento utilizo 2.383 estados extraidos de puzles Zebra de Reasoning Gym (niveles 1-2), con 80 pasos de GRPO, tamano de grupo 8, 32 prompts por paso, learning rate 1e-6 y coeficiente KL de 0,001. La recompensa combina Delta-KL (fidelidad de la continuacion del solver dada la resumen frente a la continuacion dada el razonamiento completo) menos una penalizacion de 1,0 por cada resumen que alcanza el limite de longitud.

El diseno del resumen sigue el esquema "sink8": se conservan el primer resumen y los siete ultimos, descartando los intermedios para controlar el crecimiento del contexto. El checkpoint publicado corresponde al paso 80 en bf16. El entrenamiento se ejecuto en 3 GPU H100 de 80 GB (dos para verl y una para el calculo de la recompensa). La innovacion principal no reside en la arquitectura sino en el bucle de inferencia TruSuCo y en el uso de una recompensa basada en KL para alinear el resumen con la utilidad posterior del solver, en lugar de con la similitud superficial con el texto original.

## Capacidades

- Generacion de resumenes de razonamientos parciales en el formato exacto que espera el bucle TruSuCo (prompts `trusuco.common.summary_prompt` y `summariser_prompt`).
- Condensacion de ventanas de 4.096 tokens de razonamiento en resumenes compactos que preservan la informacion necesaria para la continuacion del solver.
- Razonamiento de horizonte largo por composicion: el modelo no razona por si mismo, pero habilita al solver congelado a superar su ventana de contexto.
- Soporte de decodificacion por muestreo multiple (la evaluacion usa avg@32 y permite `--k 8`).
- No soporta tool calling ni function calling de forma nativa para este caso de uso.
- No esta disenado para conversacion libre ni para uso como chatbot.
- Capacidades multilingues: no disponibles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Extension del contexto efectivo de un solver congelado: integrado en el bucle TruSuCo, permite a Qwen3-4B-Instruct-2507 resolver puzles Zebra y tareas similares con presupuestos de 32k tokens o mas, superando el limite de su ventana nativa.
- Reproduccion de resultados de investigacion: con el repositorio DeltaKL y el dataset DeltaKL-eval, permite replicar la Tabla 1c del articulo (54,6% en Zebra a 32k tokens) con semillas fijas.
- Desarrollo de sistemas de razonamiento jerarquico: sirve como referencia para construir pipelines donde un modelo pequeno resume el estado de razonamiento de un modelo mayor o congelado.
- Investigacion en RL para resumenes: el esquema de recompensa Delta-KL es reutilizable para entrenar resumidores orientados a la utilidad downstream en lugar de a la fidelidad textual.
- Evaluacion comparativa de estrategias de gestion de contexto: junto con las variantes Base, RC y Delethink, permite medir el impacto de distintas politicas de truncado y resumen en tareas de razonamiento.
- Generacion de datos sinteticos de resumen de razonamiento: los resumenes producidos pueden emplearse para entrenar o evaluar otros modelos de condensacion de cadenas de pensamiento.

## Benchmarks y rendimiento

Resultados del articulo (Tabla 1c), 32k tokens de presupuesto del solver, avg@32 con ± 1 error estandar sobre problemas, conjunto Zebra de 192 problemas:

| Estrategia | Precision |
|---|---|
| Single | 48,1 ± 2,5 |
| Base (Qwen3-4B-Instruct-2507 sin entrenar) | 51,5 ± 2,4 |
| RC | 53,8 ± 2,5 |
| Delethink | 52,2 ± 2,3 |
| Trained (este modelo) | 54,6 ± 2,4 |

La mejora del modelo entrenado frente a la base es de 3,1 puntos porcentuales. Las ejecuciones que no terminan dentro del presupuesto se puntuan con una respuesta forzada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB en funcion de la longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB; en 4 bits, alrededor de 3-4 GB (cuantizaciones no publicadas oficialmente).
- GPU recomendadas: H100 80 GB o A100 80 GB para el entrenamiento y la evaluacion a gran escala (el articulo usa 3 x H100); para inferencia basta una RTX 4090 (24 GB) o incluso GPUs consumer de 16 GB en bf16.
- Cabe en GPU consumer: si, en RTX 4090, RTX 4080, RTX 3090 y tarjetas con 12 GB o mas en cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles; el bucle TruSuCo requiere ademas el codigo de DeltaKL y el solver, por lo que no es un despliegue standalone.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaKL-summarizer-qwen3-4b-zebra | 4,4B | no disponible (ventanas de 4.096 en TruSuCo) | Resumidor para puzles Zebra | Apache 2.0 | Hugging Face |
| DeltaKL-summarizer-qwen3-4b-sokoban | 4,4B (base Qwen3-4B) | no disponible | Resumidor para Sokoban | Apache 2.0 | Hugging Face |
| DeltaKL-summarizer-qwen3-4b-futoshiki | 4,4B (base Qwen3-4B) | no disponible | Resumidor para Futoshiki | Apache 2.0 | Hugging Face |
| DeltaKL-summarizer-qwen3-4b-math | 4,4B (base Qwen3-4B) | no disponible | Resumidor para matematicas | Apache 2.0 | Hugging Face |
| DeltaKL-summarizer-qwen3-1.7b-r1-math | 1,7B (base Qwen3-1.7B) | no disponible | Resumidor para matematicas | Apache 2.0 | Hugging Face |

Los modelos comparables mas directos son las otras variantes de la misma familia DeltaKL, especializadas por dominio. No se dispone de datos de benchmarks cruzados entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es de proposito general: espera el prompt exacto que construye el codigo de TruSuCo y no funciona correctamente con chat libre.
- Esta entrenado exclusivamente para puzles Zebra de Reasoning Gym (niveles 1-2) con el solver Qwen3-4B-Instruct-2507; su rendimiento fuera de ese dominio o con otro solver no esta validado.
- La mejora medida es modesta (3,1 puntos porcentuales) y con solapamiento de intervalos de error respecto a RC y Delethink, por lo que la significancia estadistica es limitada.
- Riesgo de alucinacion en los resumenes: un resumen que omita informacion critica puede degradar la continuacion del solver; la recompensa Delta-KL mitiga pero no elimina este riesgo.
- El esquema sink8 descarta resumenes intermedios, lo que puede perder informacion en razonamientos muy largos.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el entrenamiento se realizo presumiblemente en ingles, pero no se documenta.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del codigo DeltaKL y del solver, cuyas licencias deben verificarse por separado.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-zebra
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Articulo: https://arxiv.org/abs/2611.31621
- Codigo: https://github.com/KenCao2007/DeltaKL
- Dataset de evaluacion: https://huggingface.co/datasets/KenCao2007/DeltaKL-eval
- Variante matematicas (1.7B): https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-1.7b-r1-math
- Variante matematicas (4B): https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-math
- Variante Sokoban: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-sokoban
- Variante Futoshiki: https://huggingface.co/KenCao2007/DeltaKL-summarizer-qwen3-4b-futoshiki
