# hyperionaidev/Moon-Beam-8B-A1B-ipad-xl-GGUF

## Resumen

Moon-Beam-8B-A1B-ipad-xl-GGUF es una cuantización GGUF extrema del modelo mezcla de expertos Moon-Beam-8B-A1B-Preview (7.744.178.176 parámetros totales, 8B nominales, ~1B activos), publicada por el usuario hyperionaidev dentro del proyecto smolmaxxing. El objetivo declarado es ejecutar un modelo MoE de 8B en hardware que, en teoría, no debería poder cargarlo: un iPad Air de 2013 con SoC Apple A7 (dos núcleos, sin instrucciones dotprod), 1 GB de RAM y iOS 12.5.7 con jailbreak.

La innovación no está en el modelo base, sino en el formato de fichero. El GGUF pesa 2.753.180.192 bytes (2,75 GB), por encima del límite de mapeo de memoria de iOS 12 (unos 1,7 GB por proceso), de modo que el autor reordena todos los tensores de expertos al final del fichero y añade un paginador de expertos que mapea solo los primeros 474 MB y lee los expertos desde flash con `pread` cuando el router los selecciona. Es una ficha relevante para quien investigue inferencia en el borde, cuantización agresiva Q2_K y técnicas de memoria virtual aplicadas a MoE.

El resultado medido es de 2,76-2,94 tok/s en el iPad Air con un pico de RSS de unos 594 MB, lo que demuestra viabilidad técnica aunque con throughput muy limitado. El fichero requiere un llama.cpp parcheado específicamente y no es compatible con LM Studio, Ollama ni llama.cpp estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en inclusionAI Ling-3.0, con atención, DeltaNet y experto compartido |
| Parametros totales | 7.744.178.176 (7,74B) |
| Parametros activos | ~1B (denominación A1B del modelo base) |
| Longitud de contexto | no disponible (los ejemplos de ejecución usan `-c 512`) |
| Tipos de cuantizacion | Expertos en Q2_K con imatrix; resto de tensores (atención, DeltaNet, experto compartido, embeddings, head) en Q4_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`mb-q2-h60-xl.gguf`), un único fichero de 2.753.180.192 bytes |
| SHA-256 | `aa91940040d91c9b18725361399dd451a3405510c98c3a1c00e83a2922871d7e` |
| Cabeza de salida | Podada a 60.000 filas de 157.184 del vocabulario, con tensor `output_ids` |
| Layout | 69 tensores `*_exps` movidos al final; parte no-experta en los primeros 474 MB; cada experto (gate, up, down) ocupa 0,774 MB |

## Arquitectura y entrenamiento

El modelo base es Moon-Beam-8B-A1B-Preview de tablinum, construido sobre inclusionAI Ling-3.0. La arquitectura es una mezcla de expertos con componentes de atención, capas DeltaNet, un experto compartido y embeddings; el prefijo "A1B" indica aproximadamente 1B de parámetros activos por token sobre un total de 7,74B. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que la model card de esta cuantización no los documenta.

La contribución técnica de este repositorio es el reempaquetado del GGUF. Partiendo del fichero `mb-q2-h60.gguf` del repositorio tvbox-GGUF, la herramienta `tools/gguf_experts_last.py` reordena los 69 tensores de expertos tras el resto sin alterar un solo byte de los mismos, de forma que el paginador pueda mapear únicamente la parte no-experta (474 MB) y servir los expertos bajo demanda desde almacenamiento flash. La perplejidad es idéntica a la del fichero de origen, ya que la paginación y el reordenamiento no modifican ningún cálculo. Adicionalmente, la cabeza de salida está podada a 60.000 filas (de 157.184) para reducir el peso de los tensores no-expertos, con la contrapartida de que el modelo solo puede generar tokens pertenecientes a ese subconjunto.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` figura entre los tags.
- Razonamiento básico verificado: en las pruebas del autor responde correctamente a una pregunta factual, una petición de explicación y una pregunta de recuerdo sobre el primer turno.
- Modo "no-think": los ejemplos de ejecución usan `--no-think`, lo que sugiere que el modelo base dispone de un modo de razonamiento explícito que aquí se desactiva por coste computacional.
- Ejecución en el borde: diseñado para CPU sin dotprod, con paginación de expertos desde flash.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con la infraestructura de endpoints de Hugging Face, aunque el fichero requiere runtime parcheado.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Investigación en inferencia en el borde: reproducir la ejecución de un MoE de 8B en un iPad Air de 2013 con 1 GB de RAM sirve como banco de pruebas para técnicas de paginación de expertos y memoria virtual en dispositivos con restricciones severas de mapeo.
- Comparación de layouts GGUF: al mantener los expertos en Q2_K estándar, este fichero es la referencia contra la que medir el repack con kernel de lookup-table (`mb-q2-h60-lut.gguf`, ~4 % más rápido), útil para validar pipelines de reempaquetado propios.
- Base para reempaquetados propios: el autor indica explícitamente que el fichero puede alimentar repacks personalizados mediante `tools/gguf_q2lut.py`, lo que lo convierte en material de partida para experimentos con otros kernels o layouts.
- Despliegue en dispositivos iOS antiguos con jailbreak: escenarios de demos o instalaciones fijas en hardware legacy donde no se requiere throughput alto y prima la disponibilidad de un LLM local sin conectividad.
- Docencia sobre cuantización extrema: ilustra de forma medible el impacto de Q2_K con imatrix en expertos frente a Q4_K en el resto de tensores, con perplejidad idéntica al fichero de origen y velocidad de 2,76-2,94 tok/s.
- Validación de parches de runtime: sirve para probar el parche `llama.cpp-ios12.patch` y el binario `smolchat` del proyecto smolmaxxing en un caso de carga real con 594 MB de RSS pico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de rendimiento en el iPad Air de 2013 con pool 14 y un prompt de historia de 220 tokens:

| Configuración | tok/s |
|---|---|
| Bias 0.03, sin prefetch | 2,76 |
| Bias 0.03, prefetch top-4 | 2,94 |
| Mismos ajustes con fichero `-lut` reempaquetado (referencia) | 3,06 |

| Métrica | Valor |
|---|---|
| RAM pico (RSS) | ~594 MB |
| Lectura de expertos por token | ~70 MB a 260-280 MB/s |
| Pool máximo seguro | 14 (pool 16 provocó kernel panic en el iPad) |
| Precisión en pruebas cualitativas | 3 de 3 respuestas correctas |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero completo ocupa 2,75 GB, pero el diseño permite ejecutarlo con ~594 MB de RSS pico mapeando solo 474 MB y paginando expertos desde flash.
- Dispositivo de referencia: iPad Air de 2013 (Apple A7, 2 núcleos, sin dotprod), 1 GB de RAM, iOS 12.5.7 con jailbreak.
- GPU recomendadas: no aplica para el caso de uso objetivo; el modelo está pensado para CPU. No se documentan requisitos para GPU.
- ¿Cabe en GPU de consumo? El fichero de 2,75 GB cabría en GPUs con 4 GB o más de VRAM, pero el runtime requerido (llama.cpp parcheado con paginador de expertos y cabeza podada) no está validado en ese escenario según la información disponible.
- Opciones de despliegue: exclusivamente llama.cpp parcheado (commit `1945793` con `ipad-air/patches/llama.cpp-ios12.patch`), compilado con el SDK iPhoneOS de Xcode 15.4, firmado con `ldid -Sent.xml` y accedido por SSH sobre USB. LM Studio, Ollama y llama.cpp estándar no cargan el fichero.
- Variables de entorno del paginador: `GGML_MOE_PAGER=1`, `GGML_MOE_POOL=14`, `GGML_MOE_BIAS=0.03`, `GGML_MOE_PREFETCH=1`, `GGML_MOE_LFU=0.95`.
- Latencia y throughput: 2,76-2,94 tok/s en el iPad Air; el cuello de botella es la lectura de expertos desde flash (~70 MB por token).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B-ipad-xl-GGUF (este) | 7,74B totales, ~1B activos | no disponible | MIT | GGUF Q2_K/Q4_K, 2,75 GB | Expertos al final, paginador, cabeza podada a 60k |
| Moon-Beam-8B-A1B-ipad-GGUF (`-lut`) | 7,74B totales, ~1B activos | no disponible | MIT | GGUF, ~4 % más rápido | Expertos reempaquetados para kernel de lookup-table |
| Moon-Beam-8B-A1B-tvbox-GGUF (`mb-q2-h60.gguf`) | 7,74B totales, ~1B activos | no disponible | MIT | GGUF | Fichero de origen, misma perplejidad |
| Moon-Beam-8B-A1B-Preview (base) | 7,74B totales, ~1B activos | no disponible | MIT | safetensors | Modelo original de tablinum sobre Ling-3.0 |

## Limitaciones y advertencias

- Requiere un runtime específico: el fichero no carga en llama.cpp estándar, LM Studio ni Ollama debido a la cabeza de salida podada y al tensor `output_ids`; es imprescindible el parche iOS 12 del repositorio smolmaxxing.
- Generación restringida: la cabeza de salida solo cubre 60.000 de las 157.184 filas del vocabulario; los prompts pueden usar cualquier token, pero el modelo únicamente puede generar tokens dentro de ese subconjunto, lo que puede degradar la calidad en dominios con vocabulario especializado.
- Throughput muy bajo: 2,76-2,94 tok/s hacen el modelo inviable para interacción en tiempo real; el cuello de botella es la lectura desde flash (~70 MB por token).
- Límite de pool: valores superiores a 14 provocaron kernel panic en el dispositivo de referencia; no se recomienda incrementar el pool.
- Contexto efectivo reducido en la práctica: los ejemplos usan `-c 512`; no se documenta la longitud de contexto nativa del modelo base ni su comportamiento con ventanas largas en este formato.
- Idiomas: no se especifican los idiomas soportados; no hay información sobre cobertura multilingüe.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni tasas de alucinación para este fichero ni para el modelo base en la información disponible.
- Licencia MIT: permite uso comercial, pero la obligación de usar un runtime parcheado y la cabeza podada limitan su aplicabilidad en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-11; se trata de un artefacto experimental, no de una distribución estable.

## Enlaces

- Hugging Face (este fichero): https://huggingface.co/hyperionaidev/Moon-Beam-8B-A1B-ipad-xl-GGUF
- Fichero rápido con kernel lookup-table: https://huggingface.co/hyperionaidev/Moon-Beam-8B-A1B-ipad-GGUF
- Fichero de origen tvbox: https://huggingface.co/hyperionaidev/Moon-Beam-8B-A1B-tvbox-GGUF
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Write-up del experimento (EXPERIMENT.md §21.8-21.10): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Instrucciones de compilación para iPad Air: https://github.com/hyperionaidev/smolmaxxing/blob/main/ipad-air/README.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
