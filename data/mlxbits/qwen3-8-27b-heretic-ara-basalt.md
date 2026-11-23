# MLXBits/Qwen3.8-27B-heretic-ara-Basalt

## Resumen

Qwen3.8-27B-heretic-ara-Basalt es un modelo denso de 27.000 millones de parametros derivado de Qwen3.8-27B, empaquetado por MLXBits en el formato propietario del motor de inferencia Basalt para GPUs NVIDIA Blackwell (sm_120). No es un entrenamiento nuevo: el repositorio solo reformatea los pesos de tres trabajos previos de la comunidad. La cadena parte del modelo abliterado de trohrbaugh (Qwen3.8-27B-heretic-ara), que aplica la tecnica Arbitrary-Rank Ablation (ARA) de Heretic para eliminar el comportamiento de rechazo, y pasa por la cuantizacion NVFP4 (W4A16, grupo de 16) realizada por hwkranger.

El paquete incluye en un unico fichero de 19,7 GiB los pesos, el tokenizer, la torre de vision, una capa MTP (multi-token prediction) y un drafter de bloques DFlash 2 para decodificacion especulativa. Su relevancia es practica: permite ejecutar un modelo de 27B con vision y contexto configurable hasta 150.000 tokens en una sola GPU consumer de gama alta (RTX 5090), con decodificacion especulativa que multiplica el throughput en escenarios estructurados.

La contrapartida es importante: se trata de un modelo sin censura (abliterated), sin benchmarks de calidad publicados para estos pesos concretos, dependiente de un motor de inferencia muy especifico y con cero descargas y cero likes en el momento de la consulta. Es una pieza de infraestructura para quien ya use Basalt, no un modelo de proposito general para produccion convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion GDN (gated delta network) y MLP; incluye torre de vision, capa MTP y drafter DFlash 2 |
| Parametros totales | 27.000 millones (27B, segun denominacion del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 150.000 tokens (configurable via `max-context` en Basalt); benchmarks medidos hasta 64k |
| Tipos de cuantizacion | NVFP4 W4A16 grupo 16 en proyecciones GDN/atencion/MLP (400 tensores); cabeza de salida en FP8; GDN a/b, embeddings y torre de vision en BF16; MTP y drafter en Q8_0 |
| Idiomas soportados | no disponible (la model card no detalla cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.basalt` (formato propietario del motor Basalt), fichero unico de 19,7 GiB / 21.149.505.863 bytes |
| SHA-256 | `e14f13ca71903170379d3d9d4370bcb2ddf542cd876f32dbba920c8158d185fc` |
| Version de motor probada | Basalt 0.5.5 |
| Hardware objetivo | NVIDIA Blackwell (sm_120), una sola GPU |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B original: transformer denso con proyecciones GDN (gated delta network), atencion y MLP, mas una torre de vision para entrada multimodal. Sobre esa base, el pipeline anade dos componentes de inferencia: una capa MTP (multi-token prediction) y un drafter de bloques DFlash 2 entrenado por z-lab sobre el Qwen3.8-27B original, que habilita decodificacion especulativa con verificacion de cada token propuesto.

No hay entrenamiento nuevo en este repositorio. La modificacion de comportamiento proviene de la abliteracion ARA de Heretic aplicada por trohrbaugh sobre los pesos BF16, que segun su model card alcanza una divergencia KL de 0,0535 respecto al modelo original y 0/100 rechazos en el conjunto de prueba de Heretic. La cuantizacion NVFP4 de hwkranger es weight-only: las escalas de cada grupo de 16 valores se derivan de los propios pesos, sin datos de calibracion ni quantization-aware training. En decodificacion, Basalt multiplica pesos de 4 bits contra activaciones BF16; en prefill, los bloques de prompt se ejecutan en W4A4 sobre los tensor cores FP4. La cabeza de salida se guarda como filas FP8 redondeadas una sola vez desde el checkpoint BF16.

## Capacidades

- Generacion de texto y razonamiento general, heredados del Qwen3.8-27B subyacente.
- Entrada de imagen: la torre de vision esta incluida en BF16; el smoke test transcribio exactamente el texto impreso de una factura y leyo formas y colores correctamente.
- Contexto largo: configurable hasta 150.000 tokens, con rendimiento medido hasta 64k.
- Decodificacion especulativa con drafter DFlash 2, con aceptacion de borradores del 41% en chat, 86% en salida estructurada y 32% en prosa.
- Salida determinista con drafting: el greedy con especulacion es identico al greedy sin ella; en muestreo, los borradores se aceptan por muestreo especulativo, preservando la distribucion del modelo.
- Sin comportamiento de rechazo: responde a peticiones que el modelo base declinaria.
- Tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente multi-paso: no documentadas en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Procesamiento de documentos con vision en local: digitalizar facturas, albaranes o formularios escaneados en una unica RTX 5090, usando la torre de vision y el contexto largo para procesar lotes de paginas sin salir del equipo. El smoke test del autor valida la transcripcion exacta de texto impreso.
- Extraccion estructurada de alta velocidad: con un 86% de aceptacion de borradores en modo estructurado y 796 tokens/s en decodificacion con drafting, es adecuado para generar JSON, tablas o registros a partir de texto y documentos en pipelines por lotes.
- Analisis de repositorios y documentacion tecnica extensa: los 150.000 tokens de contexto permiten cargar arboles de codigo o manuales completos y hacer preguntas sobre ellos, con lectura de prompt de 7.001 tokens/s a 64k.
- Asistente de escritura y resumen de corpus largos: la prosa mantiene 203 tokens/s con drafting y 92 tokens/s sin el, suficiente para generacion interactiva sobre documentos de decenas de miles de tokens.
- Investigacion sobre alineacion y abliteration: util para estudiar como afecta la eliminacion de rechazo a las distribuciones de salida, comparando contra el Qwen3.8-27B original con la divergencia KL reportada de 0,0535.
- Despliegue de API compatible OpenAI/Anthropic en hardware propio: Basalt expone ambas interfaces, de modo que el modelo puede sustituir a un endpoint remoto en herramientas que ya hablan esos protocolos, con `kv: int8` y vision dinamica.
- Prototipado de agentes con contexto largo en una sola GPU: la ventana de 150k y la velocidad de prefill permiten iterar sobre prompts de sistema extensos y historiales de conversacion largos sin infraestructura multi-GPU.

## Benchmarks y rendimiento

Rendimiento medido con `basalt-bench` (Basalt 0.5.5) en una RTX 5090 a 500 W, `--kv fp16`, `--seed 1`, una ejecucion en frio por prueba, en tokens/s. La segunda columna es el pack QUASAR Qwen3.8-27B de Basalt medido en la misma maquina el mismo dia.

| Metrica | Este pack | Pack QUASAR |
|---|---:|---:|
| Lectura de prompt, 4k tokens | 15.726 | 14.804 |
| Lectura de prompt, 16k tokens | 12.952 | 12.694 |
| Lectura de prompt, 32k tokens | 10.231 | 10.128 |
| Lectura de prompt, 64k tokens | 7.001 | 6.928 |
| Decodificacion simple, chat (`--spec 0`) | 95 | 94 |
| Decodificacion simple, estructurado | 93 | 92 |
| Decodificacion simple, prosa | 92 | 93 |
| Decodificacion con drafting, chat | 247 | 266 |
| Decodificacion con drafting, estructurado | 796 | 830 |
| Decodificacion con drafting, prosa | 203 | 198 |
| Aceptacion de borradores, chat | 41% | 41% |
| Aceptacion de borradores, estructurado | 86% | 88% |
| Aceptacion de borradores, prosa | 32% | 36% |

Calidad: no medida para estos pesos. La puerta de calidad de Basalt (`basalt-bench --quality`) compara contra una referencia BF16 del mismo modelo, y la referencia publicada corresponde al Qwen3.8-27B original, no a los pesos abliterados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

## Requisitos de hardware

- VRAM: el fichero de pesos ocupa 19,7 GiB; con cache KV en FP16 o INT8 y contexto largo, el consumo supera los 20 GiB. Una RTX 5090 (32 GB) es el minimo practico para contexto extendido.
- GPU: exclusivamente NVIDIA Blackwell sm_120 (RTX 5090, RTX 5080, RTX 5070 Ti y familia, o GPUs profesionales Blackwell). El motor no soporta arquitecturas anteriores.
- Consumer GPU: si, en la gama RTX 50. No cabe en RTX 4090 ni en GPUs Ampere o Ada, por la restriccion de arquitectura del motor, no solo por VRAM.
- Despliegue: unicamente el motor Basalt (version probada 0.5.5), que expone APIs compatibles con OpenAI y Anthropic. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.basalt` es propietario.
- Latencia y throughput: ver tabla de benchmarks. El prefill cae de 15.726 a 7.001 tokens/s entre 4k y 64k de contexto; la decodificacion con drafting varia de 203 a 796 tokens/s segun el tipo de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic-ara-Basalt | 27B denso | hasta 150k | NVFP4 + FP8 + BF16 + Q8_0 | Apache 2.0 | Solo motor Basalt, GPU Blackwell |
| hwkranger/Qwen3.8-27B-heretic-ara-NVFP4 | 27B denso | no disponible | NVFP4 W4A16 | Apache 2.0 | Pesos safetensors, ecosistema estandar |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 | 27B denso | no disponible | NVFP4 con QAT | no disponible | Pesos NVFP4, ecosistema estandar |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27B denso | no disponible | BF16 | no disponible | Pesos BF16, ecosistema estandar |

La diferencia clave frente a los otros tres es el empaquetado: este repositorio integra drafter, MTP y vision en un solo fichero listo para Basalt, a costa de perder portabilidad. El pack QUASAR es el comparable mas directo en rendimiento segun los datos del autor, con velocidades de decodificacion con drafting ligeramente superiores (266 frente a 247 en chat, 830 frente a 796 en estructurado) y aceptacion de borradores algo mayor en prosa (36% frente a 32%).

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el comportamiento de rechazo. Cumplira peticiones que el modelo base declinaria y puede generar contenido sensible, controvertido o inapropiado. Requiere revision de salida y no es apto para todas las audiencias.
- Sin evaluacion de calidad publicada para estos pesos: la divergencia KL de 0,0535 y el 0/100 de rechazos se midieron sobre los pesos BF16 antes de cuantizar, no sobre el pack NVFP4 final.
- La cuantizacion NVFP4 es weight-only, sin calibracion ni QAT; la degradacion respecto a BF16 no esta cuantificada en la informacion disponible.
- Dependencia total del motor Basalt: formato propietario, sin soporte en vLLM, llama.cpp, Ollama o TGI. Migrar los pesos exige repetir el proceso de conversion con las herramientas del proyecto.
- Restriccion de hardware: solo NVIDIA Blackwell sm_120. Inutilizable en A100, H100, RTX 4090 o cualquier GPU anterior.
- El drafter DFlash 2 se entreno sobre el Qwen3.8-27B original, no sobre los pesos abliterados; por eso la aceptacion de borradores es menor y la decodificacion con drafting es un 7% mas lenta en chat y solo un 3% mas rapida en prosa respecto al pack QUASAR.
- La model card original esta truncada en el apartado de advertencias de uso; no se detalla la cobertura completa de restricciones.
- Cobertura de idiomas no documentada: no hay garantia de calidad multilingue mas alla de la del modelo base.
- Riesgo de alucinacion no evaluado en esta variante; la abliteracion puede alterar la calibracion de la confianza.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.
- Licencia Apache 2.0 declarada, pero el modelo base y los pesos intermedios de trohrbaugh y hwkranger no detallan su licencia en la informacion disponible; conviene verificar la cadena completa antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MLXBits/Qwen3.8-27B-heretic-ara-Basalt
- Modelo base (NVFP4): https://huggingface.co/hwkranger/Qwen3.8-27B-heretic-ara-NVFP4
- Modelo abliterado original: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Motor Basalt: https://github.com/jesdga95/basalt
- Documentacion del formato de modelo Basalt: https://github.com/jesdga95/basalt/blob/main/docs/model-file.md
- Heretic (metodo ARA): https://github.com/p-e-w/heretic
- Drafter DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Pack QUASAR de referencia: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
