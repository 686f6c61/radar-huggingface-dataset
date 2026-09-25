# dougalldeepmind/2026-09-24-qwen36-0-da-multiparty-human-15

## Resumen

El repositorio `dougalldeepmind/2026-09-24-qwen36-0-da-multiparty-human-15` no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). El adaptador se genero con la receta `sft`, semilla 0, sobre la mezcla de datos `da-multiparty-human-15`, cuyo nombre sugiere dialogo humano multipartito (el prefijo `da` corresponde al codigo ISO 639-1 del danes, aunque la ficha no declara idiomas de forma explicita).

Se trata de un artefacto de investigacion mas que de un modelo listo para produccion: el repositorio pesa 1,3 GB y contiene los pesos del adaptador en formato PEFT LoRA (safetensors), el tokenizer, el fichero `train_config.yaml` con la configuracion resuelta y un `training_meta.json` con metadatos de trazabilidad. No tiene descargas ni interacciones registradas en el momento de la consulta.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline de ajuste LoRA sobre un modelo grande (27B) con un presupuesto de secuencia de 8192 tokens, modo *thinking* activado y configuracion de reanudacion exacta mediante `uv run train --config train_config.yaml`. Para quien investigue adaptacion de dialogo multipartito o quiera reproducir el experimento, el valor esta en la trazabilidad (commit de Git, revision del dataset, configuracion completa) mas que en el rendimiento del adaptador, del que no se publican metricas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `Qwen/Qwen3.6-27B`); el artefacto es un adaptador LoRA de bajo rango |
| Parametros totales | Modelo base: 27B segun el identificador del repositorio. Adaptador LoRA: no disponible (r=64, alpha=128, dropout=0.05; no se especifican los modulos objetivo) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max_seq_len: 8192`); la ventana nativa del modelo base no se declara en la informacion disponible |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors sin cuantizar; la cuantizacion aplicaria al fusionar con el modelo base |
| Idiomas soportados | No disponible. El nombre de la mezcla (`da-multiparty-human-15`) sugiere danes y dialogo multipartito, pero no hay declaracion explicita |
| Licencia | No disponible |
| Formato de pesos | PEFT LoRA en safetensors, mas tokenizer, `train_config.yaml` y `training_meta.json` |
| Tamano del repositorio | 1,3 GB |
| Fecha de generacion | 2026-09-24 (`date_generated: 20260924`) |
| Dataset de entrenamiento | `dougalldeepmind/2026-09-24-da-multiparty-human-15-mix` @ `c34fc571a9d74121efb6bcba8c4dbf5f947775ab` (`mixture.jsonl`) |
| Repositorio de codigo | `github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT` @ `0216daf076ab88f838f94aaeff8a8d234858ada0` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.6-27B`, un transformer decoder-only de 27B parametros segun el identificador. Sobre el se aplica un adaptador LoRA (Low-Rank Adaptation) con rango r=64, alpha=128 y dropout=0.05. Al ser PEFT, solo se actualiza un subconjunto de matrices de pesos de bajo rango, lo que explica que el artefacto completo ocupe 1,3 GB en lugar de las decenas de gigabytes de un checkpoint completo de 27B.

La configuracion de entrenamiento esta documentada con detalle en la ficha: una sola epoca (`epochs: 1.0`), learning rate de 1e-4, batch size efectivo de 16 (batch_size 1 con grad_accum 16), longitud maxima de secuencia de 8192 tokens y *dynamic batching* con un presupuesto de 8000 tokens por lote y agregacion de perdida `seq-mean-token-mean`. El modo *thinking* esta activado (`thinking: true`), lo que implica que los ejemplos de entrenamiento incluyen cadenas de razonamiento explicitas o que el modelo base se invoca en ese modo. No se documenta el numero total de tokens de entrenamiento ni la composicion del dataset (`mixture.jsonl`), mas alla de su nombre y de la existencia de una mezcla.

El punto tecnicamente mas destacable es la reproducibilidad: el repositorio incluye `train_config.yaml` con todos los argumentos y pines resueltos, de modo que la misma ejecucion puede relanzarse con `uv run train --config train_config.yaml`. Los metadatos de `training_meta.json` incluyen organismo, modo thinking, receta, sujeto de la mezcla, revision del modelo base, revision del dataset, SHA de Git y marca temporal. No se declara uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto y ajuste al dominio de la mezcla `da-multiparty-human-15`: el adaptador especializa el modelo base en el estilo y la distribucion de esos datos, que por el nombre apuntan a dialogo humano con multiples participantes.
- Razonamiento con modo *thinking*: la configuracion de generacion fija `thinking: true`, por lo que el adaptador esta entrenado con ese regimen activado.
- Conversacion multiturno: la longitud de entrenamiento de 8192 tokens permite manejar historiales de dialogo de cierta extension, siempre dentro de ese limite.
- Capacidades heredadas del modelo base `Qwen3.6-27B`: al ser un adaptador LoRA, conserva las capacidades del modelo original (generacion, razonamiento, codigo, matematicas, uso de herramientas), aunque la ficha no las enumera ni las verifica.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; dependera del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el modo *thinking* es el unico indicio.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (vision, audio): no disponibles; la ficha no menciona ninguna modalidad adicional.

## Casos de uso

- Reproduccion de experimentos de ajuste LoRA: el repositorio incluye la configuracion completa y los pines de revision, por lo que un equipo de investigacion puede relanzar exactamente el mismo entrenamiento con el comando documentado y comparar variantes (semillas, recetas, mezclas).
- Investigacion en dialogo multipartito: si la mezcla es efectivamente conversacion humana con varios interlocutores, el adaptador sirve para estudiar como un modelo de 27B se comporta cuando debe atribuir turnos y mantener coherencia entre mas de dos hablantes.
- Analisis de "constituciones" heredadas de datos: la ficha declara una `constitution` heredada del dataset de entrenamiento y no declarada en el lanzamiento, lo que convierte este artefacto en un caso de estudio sobre como los valores y sesgos de una mezcla de datos se transfieren a un adaptador.
- Punto de partida para ajuste adicional: al ser un adaptador PEFT independiente del checkpoint base, se puede cargar sobre `Qwen3.6-27B`, evaluar y seguir entrenando, o fusionarlo para obtener un modelo denso.
- Evaluacion de degradacion por sobreajuste de dominio: con una sola epoca, r=64 y un dataset de dialogo especifico, resulta util para medir cuanto se estrecha el comportamiento del modelo base y cuanto de sus capacidades generales se preserva.
- Comparacion de metodologias de alineacion: el repositorio de origen (`Lessons_from_constituitional_AFT`) sugiere que este adaptador es una pieza dentro de un estudio mas amplio sobre ajuste conductual; sirve como muestra controlada de la receta `sft` frente a otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no hay valores de perdida de validacion ni curvas de entrenamiento en los datos proporcionados. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- Para usar el adaptador es imprescindible cargar el modelo base `Qwen/Qwen3.6-27B`; el repositorio de 1,3 GB por si solo no es inferible.
- VRAM estimada para el modelo base de 27B (calculada a partir del numero de parametros, no confirmada por el autor): aproximadamente 54 GB en bf16/fp16, unos 27 GB en cuantizacion de 8 bits y en torno a 14-17 GB en 4 bits, mas la cache KV correspondiente al contexto utilizado (que con 8192 tokens puede anadir varios gigabytes segun la configuracion de atencion del modelo).
- GPU recomendadas para precision completa: una H100 de 80 GB o dos A100 de 40 GB. Para 8 bits, una A100 de 40 GB o dos RTX 4090. Para 4 bits, una unica RTX 4090, RTX 3090 o cualquier GPU consumer con 24 GB o mas.
- Cabe en GPU consumer solo en cuantizacion de 4 bits o inferior; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sin fusionar, `vLLM` o `TGI` para servicio con el modelo fusionado, y `llama.cpp` u `Ollama` si se convierte el modelo fusionado a GGUF. La ficha no confirma compatibilidad con ninguno de estos entornos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no hay datos de rendimiento del adaptador ni de su modelo base, y el identificador `Qwen/Qwen3.6-27B` no corresponde a ninguna revision publica verificable dentro de los materiales disponibles. Sin metricas de benchmark ni confirmacion de la arquitectura del modelo base, cualquier comparacion numerica con alternativas de la misma categoria (por ejemplo, adaptadores LoRA SFT sobre modelos densos de 27B-32B) seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| `dougalldeepmind/2026-09-24-qwen36-0-da-multiparty-human-15` | Adaptador LoRA sobre base de 27B | 8192 (entrenamiento) | no disponible | PEFT LoRA safetensors | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base `Qwen/Qwen3.6-27B` en la revision indicada. Sin el, los pesos del adaptador no son utilizables.
- Licencia no declarada: no hay informacion sobre permisos de uso comercial, redistribucion o modificacion. En ausencia de licencia explicita, debe asumirse que no existe autorizacion clara para uso en produccion.
- Sesgos conocidos: no documentados. Al ser un ajuste SFT sobre una mezcla de datos no descrita, el adaptador puede heredar y amplificar los sesgos de esa mezcla, incluidos los derivados del habla multipartita si los datos son conversaciones reales.
- Riesgo de alucinacion: no evaluado. No hay benchmarks que permitan estimar la tasa de invencion de hechos, y una sola epoca sobre un dataset especifico no garantiza mejora en veracidad.
- Limitaciones de contexto: el entrenamiento se realizo con `max_seq_len: 8192`. Usar el adaptador con secuencias mas largas que las vistas durante el ajuste puede degradar el comportamiento, incluso si el modelo base soporta ventanas mayores.
- Sobreajuste de dominio: una unica epoca con learning rate 1e-4 y rango 64 sobre una mezcla estrecha puede estrechar el estilo del modelo y reducir su generalidad fuera del dominio de dialogo objetivo.
- Idiomas: no declarados. Si la mezcla es predominantemente en una unica lengua, el rendimiento en otros idiomas puede verse afectado negativamente.
- Trazabilidad incompleta: el nombre del dataset, el repositorio de origen y la revision del modelo base estan pinados, pero no se aportan tamanos de dataset, numero de tokens ni composicion.
- Sin senal de uso: cero descargas y cero interacciones en el momento de la consulta; el artefacto no ha sido validado por terceros.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-24-qwen36-0-da-multiparty-human-15
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-09-24-da-multiparty-human-15-mix
- Repositorio de codigo de origen: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`; no verificable con la informacion disponible)
- Paper, blog o demo oficial: no disponible
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo.
