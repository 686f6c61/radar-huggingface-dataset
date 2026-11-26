# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT

## Resumen

Qwen3-1.7B-Distilled-30B-A3B-SFT es un modelo de lenguaje denso de 1.700 millones de parametros (2.031.739.904 segun los pesos en safetensors) publicado por el usuario independiente reaperdoesntknow bajo la organizacion Convergent Intelligence LLC. Se construye en dos etapas sobre Qwen3-1.7B: primero una destilacion de conocimiento desde el profesor MoE Qwen3-30B-A3B-Instruct-2507 sobre 6.122 muestras de chain-of-thought de dominios STEM, y despues un ajuste supervisado (SFT) sobre el dataset legal Alignment-Lab-AI/Lawyer-Instruct para anadir conocimiento de dominio y capacidad de seguimiento de instrucciones.

La hipotesis del autor es que ensenar primero *como razonar* (destilacion) y despues *sobre que razonar* (SFT) produce un modelo que aplica estructuras de razonamiento aprendidas a dominios nuevos, en lugar de limitarse a memorizar plantillas. El resultado es un modelo pequeno, denso y sin coste de enrutamiento, pensado para despliegue en el borde (edge), con licencia Apache 2.0 y pesos en safetensors.

El modelo es relevante en el contexto de la destilacion eficiente: demuestra una receta concreta (perdida ponderada por prueba + divergencia KL a temperatura 2.0) para transferir capacidad de razonamiento estructurado desde un MoE de 30B a un denso de 1.7B, y para encadenar esa base con un dominio vertical (legal). No obstante, se trata de un experimento de un autor individual, sin benchmarks publicados ni validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B); el profesor es un MoE, el estudiante es denso |
| Parametros totales | 2.031.739.904 (~1.7B) |
| Parametros activos | No aplica (modelo denso); el profesor MoE tiene ~3B activos por token |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-1.7B, valor no confirmado) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 4.1 GB) |

## Arquitectura y entrenamiento

El estudiante es un transformer denso de 1.7B derivado de Qwen3-1.7B. La etapa 1 destila desde Qwen3-30B-A3B-Instruct-2507 (MoE con 30B totales y ~3B activos por token) sobre 6.122 muestras de chain-of-thought STEM fusionadas de 12 datasets de 0xZee: fisica (2.254), algebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), matematicas (576), ingenieria (574), mecanica clasica (343), mecanica teorica (307), calculo avanzado (268), fisica moderna (177), fisiologia (114) y biologia molecular (71). El split es 95/5 (5.815 de entrenamiento, 307 de evaluacion), mezclado con semilla 42. El formato de entrenamiento es una plantilla con `Problem:`, `Proof:` y `Final Answer:`.

La innovacion tecnica central es la funcion de perdida combinada: `L = 0.55 * CE_weighted + 0.45 * KD_kl`. La cross-entropy ponderada por prueba amplifica el peso de los tokens dentro de la region de derivacion (de 2.5x a 1.5x con decaimiento lineal) para penalizar mas los errores en los pasos intermedios que en la respuesta final. La divergencia KL se calcula contra el profesor a temperatura T=2.0, escalada por T al cuadrado, para transferir la estructura de incertidumbre del profesor (rutas de derivacion alternativas). Hiperparametros de la etapa 1: 1 epoca, batch efectivo 8 (1 x 8 de acumulacion), AdamW con weight decay 0.01, learning rate 1.5e-5 a 1e-6 con coseno y 30 pasos de warmup, gradient clipping 1.0, precision bf16. La etapa 2 aplica SFT con TRL SFTTrainer sobre Alignment-Lab-AI/Lawyer-Instruct (1 epoca, batch efectivo 8 con 2 x 4 de acumulacion; el resto de hiperparametros esta truncado en la model card). La salida de la etapa 1 se publica como reaperdoesntknow/Qwen3-1.7B-STEM-Proof-Distilled.

## Capacidades

- Generacion de texto y razonamiento estructurado paso a paso, con formato explicito de derivacion (`Proof:` seguido de `Final Answer:`).
- Razonamiento STEM: fisica, matematicas, algebra lineal, ecuaciones diferenciales, electromagnetismo, mecanica, calculo, ingenieria, fisiologia y biologia molecular, adquirido por destilacion.
- Razonamiento legal y analisis de casos: conceptos juridicos, interpretacion estatutaria y argumentacion estructurada, adquiridos en la etapa de SFT.
- Seguimiento de instrucciones en formato `### Instruction:` / `### Response:`.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling, function calling, uso como agente, modo thinking explicito, vision ni audio.

## Casos de uso

- Tutoria STEM automatizada: el modelo genera derivaciones paso a paso para problemas de fisica o calculo, aprovechando el formato entrenado (`Problem:` / `Proof:` / `Final Answer:`), adecuado para entornos educativos donde se valora el procedimiento y no solo el resultado.
- Generacion de explicaciones tecnicas en documentacion: a partir de una pregunta de ingenieria, produce una derivacion estructurada que sirve como borrador de seccion explicativa en manuales o wikis internas.
- Borrador de analisis juridico: dado un supuesto de hecho, el SFT sobre Lawyer-Instruct permite generar un analisis estructurado (premisas, encadenamiento logico, conclusion) como punto de partida para revision por un profesional.
- Clasificacion y resumen de razonamientos largos: su entrenamiento en cadenas de pensamiento lo hace util para resumir o reescribir explicaciones tecnicas manteniendo la estructura logica.
- Prototipado en el borde (edge): con 1.7B parametros y pesos safetensors de ~4 GB, es viable para prototipos en hardware modesto, sin el coste de enrutamiento de un MoE.
- Evaluacion de recetas de destilacion: sirve como referencia reproducible (perdida ponderada por prueba + KL a T=2.0) para investigadores que estudien transferencia de razonamiento desde profesores MoE a estudiantes densos.
- Filtrado y generacion de datos sinteticos de razonamiento: puede generar pares pregunta-derivacion para aumentar datasets de entrenamiento en dominios STEM o legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4-5 GB solo para pesos (2.03B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: ~2,5 GB; en 4 bits: ~1,5 GB (estimaciones teoricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia poder ejecutarlo en bf16 o cuantizado; en datacenter, A100 o H100 lo ejecutan con holgura y permiten mayor batch.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: al publicarse solo safetensors, es necesario convertirlo a GGUF para llama.cpp u Ollama; es compatible con vLLM y TGI al ser un transformer denso derivado de Qwen3. No se documentan recetas de despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B-SFT | 2,03B (denso) | No disponible | Apache 2.0 | Destilado de Qwen3-30B-A3B + SFT legal; solo ingles |
| Qwen3-1.7B (base original) | 1,7B (denso) | No disponible en esta ficha | Apache 2.0 | Modelo base sin destilacion ni SFT de dominio |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B totales, ~3B activos (MoE) | No disponible en esta ficha | Apache 2.0 | Profesor de la destilacion; mucho mayor coste de inferencia |
| Qwen3-1.7B-STEM-Proof-Distilled | 1,7B (denso) | No disponible | Apache 2.0 | Salida intermedia de la etapa 1, solo razonamiento STEM |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ni valida capacidad multilingue.
- Riesgo de alucinacion en derivaciones STEM y en analisis legal: el modelo puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente fuera de la distribucion de los 6.122 ejemplos de entrenamiento.
- El SFT legal se realizo sobre un unico dataset (Lawyer-Instruct) con una sola epoca; no hay garantia de exactitud juridica ni de cobertura de jurisdicciones, y su uso en produccion legal requiere revision humana.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al Qwen3-1.7B base ni frente a la etapa 1.
- Entrenamiento con 1 sola epoca en ambas etapas y un volumen de datos reducido (5.815 muestras STEM), lo que limita la generalizacion.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue eficiente requiere conversion propia.
- No se documenta longitud de contexto efectiva ni soporte de tool calling, agentes o modo thinking.
- Proyecto de un autor individual sin validacion externa ni mantenimiento garantizado; la licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el rendimiento recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Modelo base (etapa 1): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-STEM-Proof-Distilled
- Modelo base del que parte la destilacion: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Profesor MoE: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Autor de los datasets STEM: https://huggingface.co/0xZee
- Documentacion de TRL SFTTrainer: https://huggingface.co/docs/trl/en/sft_trainer
