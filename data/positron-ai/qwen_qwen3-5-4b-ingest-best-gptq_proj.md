# positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq_proj

## Resumen

`positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq_proj` es una compilacion cuantizada a 4 bits mediante GPTQ del modelo base Qwen/Qwen3.5-4B, publicada por Positron AI. El artefacto esta pensado para inferencia en GPU con `transformers` y pesa 4,1 GB en el repositorio, frente a los aproximadamente 9,3 GB que ocuparian los pesos en precision de 16 bits. El modelo base pertenece a la familia Qwen3.5 de Alibaba, con 4.659.865.088 parametros totales segun los safetensors del repositorio.

La relevancia de esta ficha es acotada por dos motivos que el propio autor declara. Primero, el repositorio esta marcado como *superseded*: existe una version posterior (`positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq`, commit `a8257c047606ffe662a165c92bc32c5a5a67ed3e`) que sustituye a este layout de pesos. Segundo, la model card no publica ninguna metrica de calidad (ni perplejidad, ni divergencia KL, ni exactitud), de modo que la evaluacion del impacto de la cuantizacion queda fuera del alcance de la informacion disponible.

A pesar de esas limitaciones, el artefacto sigue siendo util para quien necesite un build GPTQ 4-bit concreto y reproducible, con parametros de cuantizacion documentados (group size 64, simetrica, sin `desc_act`, calibracion con 512 muestras de 8192 tokens). La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B; tag `qwen3_5`) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit (pesos 4 bits, activaciones sin cuantizar, group size 64, simetrica, `desc_act` desactivado, damp 0,05 %) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), libreria `transformers` |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 4,1 GB |
| Fecha de publicacion | 2026-10-19 (creado 2026-10-07, actualizado 2026-11-18) |
| Descargas / likes | 87 / 0 |
| Estado | *superseded* por `positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.5-4B en los datos proporcionados: no se detalla si es un transformer denso, un hibrido o un MoE, ni el numero de capas, dimensiones ocultas o cabezas de atencion. El tag `qwen3_5` de Hugging Face identifica la familia, pero la model card del artefacto cuantizado no reproduce la ficha tecnica del modelo original. Tampoco se documentan los datos de entrenamiento del base (numero de tokens, composicion del corpus, fases de RLHF o DPO).

Lo que si esta documentado es el proceso de cuantizacion. Positron AI aplico GPTQ con GPTQModel 7.3.4 sobre `transformers` 5.11.0, `torch` 2.9.1 y CUDA 12.8. La calibracion uso un conjunto mixto y universal de 512 muestras con longitud de secuencia 8192, cuantizacion simetrica de grupo 64 y sin reordenacion de activaciones (`desc_act: false`). Las activaciones no se cuantizan, por lo que el ahorro de memoria proviene exclusivamente de los pesos. El autor no declara la precision de origen de los pesos ("Source precision: n/a") ni el hardware objetivo ("Hardware target: n/a").

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Procesamiento de imagen y texto: el tag `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, aunque no se detalla su alcance.
- Razonamiento y codigo: no disponible en la informacion proporcionada; depende de las capacidades del Qwen3.5-4B original, que no se documentan aqui.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Despliegue en GPU de gama media con memoria limitada: al ocupar 4,1 GB en disco y usar pesos de 4 bits, el artefacto permite servir un modelo de 4,66 mil millones de parametros en tarjetas con 8-12 GB de VRAM, algo inviable con los pesos en FP16.
- Prototipado rapido de aplicaciones conversacionales: el pipeline `text-generation` y la compatibilidad con `transformers` permiten integrarlo en scripts existentes sin cambiar de framework.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de un GPTQ 4-bit frente al modelo base en tareas propias, dado que el autor no publica metricas.
- Generacion de texto en entornos con restricciones de almacenamiento: el tamano reducido del repositorio facilita su distribucion en contenedores o nodos con disco limitado.
- Experimentacion multimodal ligera: el tag `image-text-to-text` abre la puerta a pruebas de entrada imagen-texto, siempre que se valide el comportamiento real del base.
- Pipelines de investigacion reproducibles: los parametros de cuantizacion estan documentados con suficiente detalle (herramientas, versiones, calibracion) para replicar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no reporta metricas de rendimiento ni de calidad (ni divergencia KL, ni exactitud, ni perplejidad) y que las validaciones se gestionan internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB solo para pesos en 4 bits; el consumo real depende de la longitud de contexto, el tamano de lote y el runtime, y no esta documentado.
- GPU recomendadas: no disponible. El autor no especifica hardware objetivo.
- GPU de consumo: por el tamano de pesos, es plausible en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070), pero no hay confirmacion oficial.
- Opciones de despliegue: `transformers` con soporte GPTQ (declarado). Otros runtimes como vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq_proj | 4,66 B | no disponible | GPTQ 4-bit | Apache 2.0 | Superseded |
| positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq | no disponible | no disponible | GPTQ 4-bit | Apache 2.0 | Version vigente |
| Qwen/Qwen3.5-4B | 4,66 B (segun safetensors del derivado) | no disponible | Sin cuantizar | Apache 2.0 | Base original |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Repositorio obsoleto: el autor lo marca como *superseded* y recomienda usar la version vigente para trabajo nuevo; este layout se mantiene solo por compatibilidad con usuarios existentes.
- Ausencia total de metricas: no hay perplejidad, divergencia KL ni evaluaciones de exactitud, por lo que no se puede cuantificar la perdida de calidad frente al modelo base.
- Perdida de precision inherente: la cuantizacion 4-bit con group size 64 puede degradar tareas sensibles a precision numerica (matematicas, codigo, razonamiento largo), aunque no hay datos que lo confirmen.
- Idiomas no declarados: se desconoce el soporte multilingue real del artefacto.
- Contexto no documentado: no se puede planificar el uso con ventanas largas sin consultar la ficha del modelo base.
- Sesgos y alucinaciones: no documentados en la informacion proporcionada; se heredan los del modelo base, que no se detallan.
- Licencia: Apache 2.0 permite uso comercial, pero el autor recuerda que las restricciones del modelo original siguen aplicandose.
- Hardware objetivo no especificado: el rendimiento en GPUs concretas no esta garantizado por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq_proj
- Version vigente: https://huggingface.co/positron-ai/Qwen_Qwen3.5-4B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
