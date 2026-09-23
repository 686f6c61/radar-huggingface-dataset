# everest103/affine-king21-albedo-layout

## Resumen

Everest103/affine-king21-albedo-layout es un modelo de lenguaje de tipo transformer con mezcla de expertos (MoE) alojado en HuggingFace por el usuario everest103, con un total de 35.951.822.704 parametros. El tag `qwen3_5_moe` asociado al repositorio indica que deriva de la arquitectura MoE de la familia Qwen3, aunque no se especifica la variante exacta ni el numero de parametros activos por token. El repositorio pesa 71,9 GB, lo que es coherente con pesos almacenados en bf16 o fp16 (2 bytes por parametro para 35,95 mil millones de parametros).

El nombre del modelo (`king21`, `albedo`) y los resultados de busqueda lo vinculan al subnet Albedo de Bittensor, descrito en su repositorio como un subnet de "trajectory-distillation king-of-the-hill": los mineros suben modelos candidatos y el rey vigente los reta en rollouts de SWE-ZERO evaluados por un ensemble de jueces LLM, publicando las trazas completas para destilacion. Esto sugiere que el modelo es un checkpoint resultante de ese proceso competitivo, probablemente orientado a tareas de ingenieria de software agentica. Esta vinculacion es una inferencia a partir del contexto disponible, no un dato confirmado por el propio repositorio.

La relevancia actual del modelo radica en su tamano (aproximadamente 36B parametros) combinado con una arquitectura MoE, lo que en principio permitiria una inferencia relativamente eficiente en coste por token si la fraccion activa es baja, aunque no se ha publicado informacion sobre parametros activos, contexto o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), probablemente transformer con mezcla de expertos |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/fp16; repo de 71,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura en el repositorio. El unico dato tecnico disponible es el tag `qwen3_5_moe`, que apunta a una arquitectura de mezcla de expertos heredada de la familia Qwen3, con un total de 35,95 mil millones de parametros. Se desconoce el numero de expertos, el numero de expertos activos por token, el tamano de la capa de atencion, la ventana de contexto nativa y si se aplicaron tecnicas como atencion lineal, decodificacion especulativa o atencion con sesgo QKV.

Respecto al entrenamiento, el contexto del subnet Albedo de Bittensor (descubierto en la busqueda web) sugiere que el modelo podria haberse obtenido mediante destilacion de trayectorias de agentes SWE evaluadas por un ensemble de jueces LLM, en un esquema de "rey de la colina" donde los mineros compiten subiendo challengers. Si esta interpretacion es correcta, el entrenamiento estaria orientado a comportamiento agentico en tareas de software. No obstante, no se ha confirmado desde el repositorio ni el dataset, ni el numero de tokens, ni si se aplicaron fases de RLHF, DPO u optimizacion por preferencias.

## Capacidades

- Generacion de texto y razonamiento general: presumiblemente heredadas de la base Qwen3 MoE, aunque no confirmadas en la ficha del modelo.
- Codigo y tareas de ingenieria de software: el contexto del subnet Albedo y las menciones a SWE-ZERO apuntan a un modelo ajustado para resolucion de issues, edicion de repositorios y ejecucion de trayectorias de agente. No confirmado oficialmente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: plausible por el contexto del subnet, pero no documentado en el repositorio.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en destilacion de trayectorias: el modelo puede emplearse como referencia para estudiar como se comportan los checkpoints "rey" del subnet Albedo frente a challengers, comparando trazas de rollouts en SWE-ZERO.
- Evaluacion de agentes de codigo en pipelines de CI/CD: si el ajuste a tareas SWE se confirma, podria integrarse como agente que resuelve issues o genera parches, evaluando su tasa de resolucion en suites de tests automatizados.
- Generacion de codigo asistida en entornos de desarrollo: como modelo de aproximadamente 36B parametros MoE, es candidato a completar y explicar codigo, aunque su rendimiento real debe validarse empiricamente antes de usarlo en produccion.
- Despliegue on-premise con requisitos de privacidad: al ser un modelo abierto con pesos safetensors, puede ejecutarse en infraestructura propia sin enviar datos a APIs externas, siempre que la licencia (no disponible) lo permita.
- Experimentacion academica en arquitecturas MoE: util para estudiar el comportamiento de un MoE de ~36B en tareas de razonamiento y codigo, comparando con la base Qwen3-30B-A3B.
- Investigacion sobre jueces LLM y evaluacion competitiva: dada su vinculacion con un subnet que usa ensembles de jueces, puede servir como objeto de estudio en metodologias de evaluacion automatizada de modelos.
- Fine-tuning posterior y adaptacion de dominio: los pesos en safetensors permiten tecnicas como LoRA o QLoRA para especializar el modelo en dominios concretos, sujeto a la licencia aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 72 GB de pesos mas overhead de activaciones y cache KV, por lo que se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) o varias GPUs.
- Inferencia en 8 bits: alrededor de 36-40 GB, viable en una A100 40 GB o H100 80 GB de forma holgada.
- Inferencia en 4 bits (GPTQ, AWQ, GGUF Q4): aproximadamente 20-24 GB, lo que permitiria ejecucion en una unica RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen limitado para contexto.
- Multi-GPU en bf16: 2x RTX 4090 (48 GB) podria ser justo; se recomienda 2x A100 40 GB o superior para mayor comodidad.
- Opciones de despliegue: vLLM, SGLang y TGI para safetensors en GPU; llama.cpp y Ollama requeririan conversion previa a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles. Dependeran criticamente del numero de parametros activos, dato que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| everest103/affine-king21-albedo-layout | 35,95B | no disponible | no disponible | no disponible | safetensors en HF |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32K nativo, extensible a 131K | Apache 2.0 | safetensors en HF |
| Qwen3-32B (denso) | 32,8B | 32,8B | 128K | Apache 2.0 | safetensors en HF |

Las cifras de Qwen3-30B-A3B y Qwen3-32B corresponden a datos publicos de sus fichas oficiales y se incluyen unicamente como referencia de categoria. Para el modelo objeto de esta ficha no hay datos de rendimiento, contexto, activos ni licencia que permitan una comparacion funcional real.

## Limitaciones y advertencias

- La licencia es "no disponible", por lo que no puede confirmarse que se permita uso comercial. Es imprescindible aclarar este punto antes de cualquier despliegue en produccion.
- El pipeline, los idiomas soportados y la longitud de contexto no estan documentados en el repositorio, lo que impide garantizar el comportamiento en escenarios multilingues o de contexto largo.
- No se han publicado benchmarks: no hay evidencia publica de la calidad del modelo en tareas de razonamiento, codigo o matemeticas.
- El modelo tiene solo 39 descargas y 0 likes, y un historial muy reciente (creado y actualizado el mismo dia), lo que indica ausencia de validacion por parte de la comunidad.
- El contexto competitivo (subnet Albedo, rey de la colina) sugiere que el modelo puede ser un checkpoint intermedio de un proceso de destilacion, con posible sobreajuste a las tareas concretas de evaluacion del subnet (rollouts SWE-ZERO).
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Al ser un MoE, el rendimiento de inferencia dependera fuertemente de la implementacion y del enrutado de expertos; sin datos de parametros activos no puede estimarse el coste real por token.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/everest103/affine-king21-albedo-layout
- Perfil del autor: https://huggingface.co/everest103
- Repositorio GitHub del subnet Albedo (Bittensor): https://github.com/unarbos/albedo/tree/main
