# nchapman/Qwen3.5-2B-d3-nano-LoRA

## Resumen

Qwen3.5-2B-d3-nano-LoRA es un adaptador LoRA de rango 128 (PEFT) junto con una cabeza de decisión `CodeReadout` de 255 vías, extraídos del modelo `vllm-sr/d3-nano` y aplicados sobre la base `Qwen/Qwen3.5-2B`. Lo desarrolla el usuario `nchapman` y se publica bajo licencia Apache 2.0. El modelo está orientado a tareas de decisión y clasificación (decision-model, system-one), no a la generación de texto libre convencional, aunque el pipeline declarado es `text-generation`.

La relevancia de este adaptador radica en que aproxima el rendimiento de un modelo completo (`vllm-sr/d3-nano`) mediante una extracción de bajo rango más un plegado de normas (4-NormFold), lo que reduce drásticamente el coste de despliegue. En la evaluación pública JevBench de 231 casos, el adaptador alcanza un 75,76 % de precisión global frente al 65,80 % de la base Qwen3.5-2B y el 76,19 % del modelo completo, con un NLL de 0,5712.

El contexto de esta ficha es limitado: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no documenta idiomas soportados, composición del dataset de entrenamiento ni detalles del proceso de destilación más allá de la nomenclatura técnica del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-2B, con cabeza `CodeReadout` de 255 vías |
| Parametros totales | no disponible (adaptador LoRA de rango 128; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 128 obtenido mediante una descomposición Joint-SVD junto con un plegado de normas de cuatro capas (4-NormFold) y una cabeza de lectura `CodeReadout` de 255 vías. Se extrae del modelo `vllm-sr/d3-nano` y se aplica sobre la base `Qwen/Qwen3.5-2B`. La nomenclatura `d3-nano`, `system-one` y `decision-model` sugiere un enfoque de razonamiento rápido (system one) orientado a decisiones, en contraposición a cadenas de razonamiento largas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación técnica documentada es la extracción mediante Joint-SVD y el plegado de normas, que permiten aproximar el comportamiento del modelo completo con un adaptador de bajo rango.

## Capacidades

- Clasificación y decisión sobre 255 vías mediante la cabeza `CodeReadout`.
- Evaluación de tipo system-one: respuestas rápidas sin cadena de razonamiento explícita.
- Generación de texto (pipeline declarado `text-generation`), aunque la orientación principal es la decisión.
- Compatibilidad con PEFT y con el ecosistema de vLLM (tag `vllm-sr`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Clasificación de decisiones en pipelines de inferencia: el adaptador puede sustituir a la cabeza de decisión del modelo completo `vllm-sr/d3-nano` en entornos con restricciones de memoria, manteniendo un 75,76 % de precisión en JevBench.
- Enrutamiento de consultas en sistemas de atención al cliente: la cabeza de 255 vías permite asignar una consulta a una de las 255 categorías de decisión con un coste de cómputo reducido respecto al modelo completo.
- Evaluación rápida de prototipos: al ser un adaptador LoRA de 0,3 GB, se puede cargar sobre Qwen3.5-2B en una GPU de consumo para validar el comportamiento antes de desplegar el modelo completo.
- Filtrado previo en pipelines de generación: usar el adaptador como clasificador de primera etapa para descartar o priorizar entradas antes de invocar un modelo mayor.
- Investigación en destilación de modelos: sirve como caso de estudio de extracción Joint-SVD y 4-NormFold para reproducir la aproximación de un modelo completo con un adaptador de bajo rango.
- Despliegue en vLLM: el tag `vllm-sr` indica compatibilidad con el servidor de vLLM, lo que permite integrarlo en infraestructuras de servicio ya existentes.

## Benchmarks y rendimiento

Evaluación pública JevBench (231 casos: 48 Easy / 72 Original / 111 Hard):

| Modelo | Precision global | Easy (48) | Original (72) | Hard (111) | NLL | Brier |
|---|---|---|---|---|---|---|
| Base Qwen/Qwen3.5-2B | 152/231 (65,80 %) | 47/48 | 56/72 | 49/111 | 0,7704 | 0,4301 |
| Qwen3.5-2B-d3-nano-LoRA (r=128 Joint-SVD + 4-NormFold) | 175/231 (75,76 %) | 48/48 | 68/72 | 59/111 | 0,5712 | 0,3242 |
| Full vllm-sr/d3-nano | 176/231 (76,19 %) | 48/48 | 68/72 | 60/111 | 0,6053 | 0,3282 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,3 GB y el modelo base Qwen3.5-2B requiere aproximadamente 4-5 GB en precisión completa (estimación no confirmada en la información proporcionada).
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del adaptador (0,3 GB) y la base de 2B, aunque no se confirma en la información disponible.
- Opciones de despliegue: vLLM (tag `vllm-sr`), PEFT, y por extensión el ecosistema compatible con Qwen3.5-2B.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-d3-nano-LoRA | Adaptador LoRA r=128 sobre 2B | no disponible | 75,76 % | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | 65,80 % | no disponible en la información | Hugging Face |
| vllm-sr/d3-nano (completo) | no disponible | no disponible | 76,19 % | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinación: no evaluado; el adaptador está orientado a decisión y clasificación, no a generación factual.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados ni longitud de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-2B y del modelo origen `vllm-sr/d3-nano`.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; el autor es un usuario individual (`nchapman`).
- La model card no documenta el proceso de entrenamiento, el dataset ni las condiciones de evaluación más allá de JevBench.
- El pipeline declarado es `text-generation`, pero la arquitectura incluye una cabeza de decisión de 255 vías; el uso como generador de texto libre no está validado.
- No se confirma compatibilidad con cuantizaciones GGUF ni con llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-2B-d3-nano-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo origen: https://huggingface.co/vllm-sr/d3-nano
