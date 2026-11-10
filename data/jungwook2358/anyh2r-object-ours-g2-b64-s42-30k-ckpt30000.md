# jungwook2358/anyh2r-object-ours-g2-b64-s42-30k-ckpt30000

## Resumen

AnyH2R-object-ours-g2-b64-s42-30k-ckpt30000 es un checkpoint de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, entrenado dentro del proyecto AnyH2R por el autor jungwook2358. Se trata de una réplica de la celda de diversidad de tareas "object-ours" del trabajo original de junhyeong (repositorio jun-brro/RLDX-1-egopi, rama feat/anyh2r-diversity-training, commit fc72b51), con código, entradas preparadas, entorno Python y hiperparámetros idénticos; solo cambian el propietario de la salida y el nombre del job. El modelo parte de RLDX-1-PT-IMG y se ha entrenado con 2 GPU, batch global de 64, semilla 42 y 30 000 pasos.

El repositorio contiene el checkpoint-30000 en formato de entrenamiento de Hugging Face Trainer (3 shards safetensors con índice, config.json, processor, configuración de experimento con estadísticas del dataset, trainer_state, scheduler y recibo de transferencia). Los estados del optimizador DeepSpeed y los estados RNG se excluyen explícitamente. También incluye contratos de inferencia y de diversidad, así como un tokenizer de acciones de decodificador dividido con vocabulario de 100k.

El interés de esta ficha es acotado: no es un modelo de propósito general, sino un artefacto de investigación reproducible para experimentos de robótica con instrucciones en lenguaje natural. La model card no documenta arquitectura detallada, número de parámetros ni longitud de contexto, por lo que buena parte de las especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en RLDX-1-PT-IMG; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (3 shards + índice), config.json, processor/, tokenizer/ |
| Tarea (pipeline) | robotics |
| Punto de partida | RLDX-1-PT-IMG |
| Chunk de acciones | 16 acciones por paso |
| Batch global de entrenamiento | 64 |
| GPU de entrenamiento | 2 |
| Semilla | 42 |
| Pasos de entrenamiento | 30 000 |
| Tokenizer de acciones | decodificador dividido, vocabulario de 100k |
| Tamaño del repositorio | 13,9 GB |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de visión-lenguaje-acción (VLA) que parte de un checkpoint previo denominado RLDX-1-PT-IMG y se afina durante 30 000 pasos con un chunk de acción de 16 pasos y batch global de 64 sobre 2 GPU. La renovación de instrucciones está desactivada ("instruction renewal off"), lo que sugiere un esquema de entrenamiento con instrucciones fijas por episodio. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se detalla la arquitectura interna (transformer, MoE, híbrida) más allá de la familia RLDX-1.

El artefacto incluye componentes específicos de despliegue: un contrato de inferencia (INFERENCE_CONTRACT.json) con normalizadores, activos geométricos y etiqueta de despliegue; un contrato de diversidad (diversity_contract.json) con las especificaciones del dataset; y un tokenizer de acciones propio (actlat/model.safetensors, egopi_prq_stats.json y recibo de finalización). El entrenamiento se realizó con DeepSpeed, cuyos estados del optimizador se excluyen del repositorio, por lo que el checkpoint no es reanudable para entrenamiento sin esos ficheros. La reproducibilidad está anclada por hashes sha256 de los tarballs de código y por la fijación del commit del repositorio original.

## Capacidades

- Control robótico guiado por instrucciones: genera secuencias de acciones de 16 pasos a partir de observaciones e instrucciones en lenguaje natural, según el pipeline robotics declarado.
- Percepción visual integrada: al ser un modelo VLA, procesa entradas visuales junto con el texto de la instrucción (detalles de resolución y codificador visual no disponibles).
- Tokenización de acciones: incluye un tokenizer de acciones de decodificador dividido con vocabulario de 100k, específico para este modelo.
- Reproducibilidad experimental: pensado para replicar la celda de diversidad "object-ours" con código, entorno e hiperparámetros idénticos al run original.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no documentado; el chunk de 16 acciones sugiere ejecución en bloques, sin planificación de alto nivel descrita.
- Capacidades multilingües: no disponibles; los idiomas soportados no se declaran.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Replicación de experimentos de investigación: el checkpoint permite reproducir la celda "object-ours" del proyecto AnyH2R con los mismos hiperparámetros (batch 64, semilla 42, 30k pasos) y comparar resultados frente al run original de junhyeong.
- Manipulación de objetos en entornos simulados: el nombre de la celda ("object-ours") y el pipeline robotics sugieren entrenamiento para tareas de interacción con objetos; se usaría cargando el checkpoint con el contrato de inferencia y el tokenizer de acciones incluidos.
- Evaluación de diversidad de tareas: el contrato de diversidad (diversity_contract.json) permite auditar qué especificaciones de dataset se usaron y evaluar la generalización entre tareas.
- Punto de partida para fine-tuning posterior: al ser un checkpoint de 30k pasos con estadísticas de dataset incluidas, sirve como inicialización para nuevos afines en robótica, siempre que se reconstruyan los estados del optimizador.
- Estudio de tokenizers de acción: el tokenizer de decodificador dividido con 100k entradas puede analizarse de forma aislada para investigar representaciones discretas de acciones.
- Despliegue en laboratorio con 2 GPU: el tamaño del repositorio (13,9 GB) y el esquema de entrenamiento con 2 GPU indican que la inferencia es viable en hardware de gama media-alta de laboratorio, aunque no se publican requisitos exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 13,9 GB en safetensors, lo que da una cota inferior aproximada para cargar los pesos en precisión de entrenamiento, sin contar activaciones ni el codificador visual.
- GPU recomendadas: no disponibles; el entrenamiento se realizó con 2 GPU, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en GPUs con 24 GB o más si se aplica cuantización, pero no hay datos publicados.
- Opciones de despliegue: no documentadas; el formato es el de Hugging Face Trainer (safetensors + config.json + processor), por lo que sería compatible con transformers, pero no se mencionan vLLM, llama.cpp, Ollama ni TGI, y estos últimos no aplican a un VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anyh2r-object-ours-g2-b64-s42-30k-ckpt30000 | no disponible | no disponible | VLA robótica | other | Hugging Face, 0 descargas |
| RLDX-1-PT-IMG (checkpoint base) | no disponible | no disponible | VLA robótica | no disponible | referenciado como punto de partida |
| Run original junhyeong-anyh2r-object-ours-g2-b64-s42-30k-1108-v3 | no disponible | no disponible | VLA robótica | no disponible | interno del proyecto AnyH2R |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos; es imprescindible contactar con el autor antes de cualquier uso comercial o redistribución.
- Artefacto de investigación: es una réplica de un run concreto, no un modelo listo para producción; no hay documentación de robustez, seguridad ni evaluación externa.
- Checkpoint no reanudable para entrenamiento: los estados del optimizador DeepSpeed y los estados RNG están excluidos del repositorio.
- Idiomas no declarados: se desconoce si las instrucciones en lenguaje natural funcionan en castellano u otros idiomas distintos del usado en el entrenamiento.
- Riesgo de alucinación y sesgos: no evaluado ni documentado; en robótica, los errores de acción pueden tener consecuencias físicas.
- Dependencia de activos externos: requiere el contrato de inferencia (normalizadores, geometría) y el tokenizer de acciones incluidos; sin ellos el checkpoint no es utilizable.
- Sin datos de benchmarks, parámetros ni contexto: imposible estimar rendimiento o comparar de forma cuantitativa.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/anyh2r-object-ours-g2-b64-s42-30k-ckpt30000
- Repositorio de código referenciado: jun-brro/RLDX-1-egopi, rama feat/anyh2r-diversity-training, commit fc72b51 (no se proporciona URL directa)
- Run original: junhyeong-anyh2r-object-ours-g2-b64-s42-30k-1108-v3 (interno, sin URL)
- Paper, blog, demo o repositorio adicional: no disponibles en la información proporcionada.
