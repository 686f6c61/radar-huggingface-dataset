# huawei-csl/Qwen3.6-35B-A3B-MACaQ-R-GGUF

## Resumen

Qwen3.6-35B-A3B-MACaQ-R-GGUF es una cuantizacion nativa en formato GGUF del modelo Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. La cuantizacion la firma huawei-csl mediante el metodo MACaQ-R, descrito en el paper arXiv:2611.10649, y esta pensada para ejecutarse directamente con llama.cpp sin necesidad de conversion adicional.

El modelo base cuenta con 34.660.610.688 parametros totales (aproximadamente 34,66 mil millones) y, al ser MoE, activa solo una fraccion de ellos por token, lo que reduce el coste computacional en inferencia frente a un denso de tamano equivalente. El pack publicado incluye unicamente la variante Q4_K_XL, con un tamano de archivo de 22,36 GB, y no incorpora el bloque de prediccion MTP (multi-token prediction).

La relevancia de esta ficha radica en que MACaQ-R logra una divergencia KL frente a FP16 de 0,013367, inferior a la de la cuantizacion Unsloth UD-Q4_K_XL (0,015731) con identico tamano de archivo (22,36 GB). Es decir, ofrece mayor fidelidad al modelo original con el mismo coste de almacenamiento, lo que resulta directamente util para despliegues en produccion sobre hardware de gama alta de consumo o servidores con VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer (modelo base Qwen3.6-35B-A3B) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (unico pack publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (nativo, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura mixture-of-experts: dispone de 34,66 mil millones de parametros totales, de los cuales solo un subconjunto se activa por token (el dato exacto de parametros activos no se detalla en la informacion disponible). Esta ficha corresponde a la version cuantizada, no al modelo original, por lo que los detalles de entrenamiento del base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se recogen en la model card proporcionada.

La innovacion tecnica de esta publicacion es el metodo de cuantizacion MACaQ-R, aplicado directamente sobre los pesos para generar un GGUF nativo. Segun la model card, el pack contiene solo el modelo de texto y omite el bloque de prediccion MTP (multi-token prediction) del modelo original. La metrica de calidad reportada es la divergencia KL frente a FP16, que cuantifica cuanto se desvia la distribucion de probabilidad del modelo cuantizado respecto al original: cuanto menor, mejor.

## Capacidades

- Generacion de texto conversacional y de proposito general (pipeline text-generation).
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.6-35B-A3B (no se detallan capacidades especificas en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (los idiomas no se listan en la ficha de Hugging Face).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el pack es exclusivamente de texto.
- Inferencia local via llama.cpp, con CLI (`llama cli`) y servidor HTTP (`llama serve`).

## Casos de uso

- Despliegue local en estaciones de trabajo: con 22,36 GB en Q4_K_XL, el modelo se puede cargar con llama.cpp en equipos con suficiente memoria unificada o VRAM, sin depender de servicios en la nube.
- Servicio de generacion de texto autoalojado: `llama serve` expone una API HTTP compatible con endpoints, lo que permite integrar el modelo en aplicaciones internas con control total sobre los datos.
- Prototipado de asistentes conversacionales: el pipeline text-generation y la naturaleza MoE del base lo hacen adecuado para iterar rapidamente en chatbots y asistentes de texto.
- Evaluacion de cuantizaciones en pipelines de investigacion: al publicar la divergencia KL frente a FP16, sirve como referencia para comparar metodos de cuantizacion (MACaQ-R frente a Unsloth UD-Q4_K_XL) en igualdad de tamano.
- Entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso comercial y su redistribucion en productos derivados.
- Inferencia en hardware de consumo de gama alta: el formato GGUF y el tamano del pack permiten ejecutar el modelo en GPUs consumer con 24 GB o en sistemas Apple Silicon con memoria unificada suficiente, segun el caso.

## Benchmarks y rendimiento

La model card solo reporta la divergencia KL frente a FP16 como metrica de calidad de la cuantizacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Modelo | Tamano GGUF | KL frente a FP16 (menor es mejor) |
|---|---|---|
| Unsloth UD-Q4_K_XL | 22,36 GB | 0,015731 |
| MACaQ-R Q4_K_XL | 22,36 GB | 0,013367 |

## Requisitos de hardware

- VRAM estimada para inferencia: el pack Q4_K_XL ocupa 22,36 GB; se necesita al menos esa cantidad de memoria (VRAM o memoria unificada) mas overhead para el contexto y el runtime de llama.cpp.
- GPU recomendadas: no disponibles de forma explicita; por tamano, encaja en GPUs con 24 GB o mas (por ejemplo, RTX 4090) y en aceleradores de datacenter (A100, H100) con holgura.
- Cabe en GPU consumer: si, en tarjetas con 24 GB de VRAM como la RTX 4090, asumiendo margen suficiente para el contexto; en GPUs de 16 GB no cabe el pack completo.
- Opciones de despliegue: llama.cpp mediante `llama cli` y `llama serve` (API HTTP); la model card indica compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad (KL) | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-MACaQ-R (esta ficha) | 34,66 B (MoE) | no disponible | Q4_K_XL, 22,36 GB | 0,013367 | Apache 2.0 |
| Qwen3.6-35B-A3B Unsloth UD-Q4_K_XL | 34,66 B (MoE) | no disponible | Q4_K_XL, 22,36 GB | 0,015731 | Apache 2.0 (modelo base) |
| Qwen/Qwen3.6-35B-A3B (original) | 34,66 B (MoE) | no disponible | FP16 | referencia | Apache 2.0 |

La comparativa se limita al mismo modelo base en distintas cuantizaciones, ya que la informacion proporcionada no incluye datos de modelos alternativos de otros desarrolladores. No se dispone de cifras de rendimiento en tareas (MMLU, HumanEval, etc.) para comparar capacidades.

## Limitaciones y advertencias

- Alucinacion: como todo modelo generativo, puede producir contenido facticamente incorrecto; la cuantizacion Q4_K_XL introduce ademas una pequena desviacion respecto a FP16 (KL 0,013367).
- Idiomas: la lista de idiomas soportados no esta disponible en la ficha; no se puede garantizar cobertura multilingue mas alla de la del modelo base.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, por lo que debe verificarse antes de desplegar cargas con ventanas largas.
- Capacidades no documentadas: no hay informacion sobre tool calling, agentes, vision ni thinking mode en esta publicacion; no deben asumirse.
- Bloque MTP ausente: el pack no incluye el bloque de prediccion MTP del modelo original, de modo que las optimizaciones de decodificacion basadas en el no estan disponibles.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B por si anaden restricciones adicionales.
- Repo con pocas descargas y likes (1496 y 10 en el momento de la consulta): menor validacion comunitaria que otras cuantizaciones, lo que aconseja evaluar la calidad en el caso de uso concreto antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huawei-csl/Qwen3.6-35B-A3B-MACaQ-R-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper de MACaQ: https://arxiv.org/abs/2611.10649
- Repositorio MACaQ: https://github.com/huawei-csl/MACaQ
- Guia MACaQ-R para llama.cpp: https://github.com/huawei-csl/MACaQ/tree/main/llamacpp#macaq-r
