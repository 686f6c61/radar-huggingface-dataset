# kaitchup/Qwen3.8-27B-SLQ-EAR98.5

## Resumen

Qwen3.8-27B-SLQ-EAR98.5 es un checkpoint cuantizado del modelo Qwen/Qwen3.8-27B, publicado por el autor independiente kaitchup (The Kaitchup), que aplica una versión personalizada de SLQ (Statistically-Lossless Quantization) y empaqueta los pesos para el runtime Humming de vLLM. El objetivo declarado es alcanzar un EAR (Expected Acceptance Rate) del 98,5 % respecto al modelo original en BF16, y el autor reporta un valor medido de 98,502656 % sobre el modelo empaquetado. Los ficheros de pesos ocupan 25,609 GB frente a los 55,563 GB del BF16 original, lo que permite servir el modelo con menos memoria manteniendo una fidelidad estadística alta de las distribuciones de siguiente token.

El interés práctico es doble: por un lado, es una alternativa a la cuantización FP8 oficial (30,867 GB, EAR 97,71 %) y a esquemas de 3-4 bits mucho más agresivos (GSQ 3-bit con EAR 89,43 %, GGUF UD-Q4_K_XL con EAR 97,44 %); por otro, documenta una metodología de búsqueda de precisión por capa y por proyección, incluidas cabezas de atención seleccionadas, con mezcla de precisiones enteras, pesos BF16 residuales y activaciones en BF16.

Conviene señalar una discrepancia importante en los metadatos: la ficha de HuggingFace reporta 7.978.947.312 parámetros totales según safetensors, mientras que el nombre del modelo y el modelo base indican 27B. No se dispone de información que resuelva esa contradicción, por lo que se refleja tal cual en las especificaciones. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo base de la familia Qwen3.5 (tag `qwen3_5`), con pesos MTP (multi-token prediction) conservados en BF16 |
| Parametros totales | 7.978.947.312 segun safetensors; el nombre del modelo y el modelo base indican 27B (discrepancia no resuelta en la informacion disponible) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (valor usado en el comando de servicio vLLM: `--max-model-len 262144`) |
| Tipos de cuantizacion | Precisones enteras mixtas (fuentes GPTQ INT2-INT8) con pesos BF16 originales seleccionados; activaciones en BF16; pesos MTP en BF16 sin cambios |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados para el kernel Humming de vLLM (no hay GGUF publicado para este checkpoint) |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: es una compresion post-entrenamiento del Qwen3.8-27B en BF16. La busqueda de SLQ combina varias fuentes de candidatos y elige la precision de forma independiente para cada proyeccion del decodificador, incluyendo cabezas de atención concretas. Las fuentes empleadas son pesos GPTQ de INT2 a INT8 generados localmente a partir del modelo original, el checkpoint kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB cuantizado con AutoRound, ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ y los pesos BF16 originales, disponibles tambien para la busqueda. El resultado es un mapa de bitwidth almacenado por capa (publicado como `precision.svg`) con precisiones enteras mixtas y algunas proyecciones que permanecen en BF16.

La innovacion tecnica es el empaquetado para Humming dentro de vLLM, que permite ejecutar los pesos comprimidos de forma nativa en lugar de dequantizarlos a BF16 antes de la inferencia. El autor distingue explicitamente entre filas medidas con ejecucion empaquetada/nativa y filas medidas sobre pesos dequantizados, lo que hace que las cifras de EAR no sean directamente comparables entre runtime. El objetivo de SLQ es la equivalencia estadistica aproximada, no la identidad numerica: el propio autor advierte que un EAR de 0,99 no implica un 99 % de acierto en benchmarks ni respuestas generadas identicas, y que la equivalencia estadistica en tareas downstream no se ha establecido para estas publicaciones.

## Capacidades

- Generacion de texto conversacional y razonamiento: el pipeline declarado es `text-generation` con tag `conversational`, y el servidor se configura con `--reasoning-parser qwen3` para separar el bloque de razonamiento de la respuesta final.
- Tool calling y function calling automatico: soportado via `--enable-auto-tool-choice --tool-call-parser qwen3_coder` en vLLM.
- Contexto largo: hasta 262.144 tokens configurados en el servicio de referencia.
- Codigo: el parser de tool calls `qwen3_coder` y las capacidades heredadas del modelo base apuntan a uso en tareas de codigo, aunque no se aportan resultados de HumanEval ni similares.
- Pesos de vision y procesadores conservados en el repositorio (imagen y video), aunque el autor indica que la inferencia de imagen/video no se incluyo en la validacion.
- Pesos MTP (multi-token prediction) conservados en BF16, lo que habilita decodificacion especulativa a nivel de arquitectura, si bien esta no se valido en el checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de API compatible con OpenAI sobre una sola GPU: el checkpoint se sirve con `vllm serve` y expone `/v1/chat/completions`, lo que permite sustituir el BF16 de 55,6 GB por 25,6 GB de pesos manteniendo una fidelidad de distribucion del 98,5 % medida.
- Asistentes con ventana de contexto muy larga: con 262.144 tokens configurados se pueden procesar repositorios de codigo, expedientes o transcripciones extensas sin trocear, siempre que la VRAM disponible soporte la cache KV correspondiente.
- Agentes con tool calling multi-paso: la combinacion de `--enable-auto-tool-choice` y el parser `qwen3_coder` permite orquestar llamadas a funciones desde el propio servidor de inferencia, sin capa intermedia de parseo.
- Razonamiento con separacion de trazas: el `--reasoning-parser qwen3` separa el razonamiento interno de la respuesta final, util en pipelines que auditan o registran la traza de pensamiento por separado.
- Evaluacion y seleccion de esquemas de cuantizacion: el repositorio incluye una tabla comparativa de EAR con FP8 oficial, GSQ 3-bit, AutoRound y GGUF Q4_K_XL, lo que lo convierte en material de referencia para decidir que esquema desplegar segun el presupuesto de memoria.
- Investigacion sobre cuantizacion post-entrenamiento: el mapa de bitwidth por proyeccion y la implementacion personalizada de SLQ sirven para estudiar la asignacion optima de precision por capa y la relacion entre tamano de pesos y EAR.
- Despliegue en hardware profesional de una sola tarjeta: el autor valido el checkpoint en una RTX PRO 6000 Blackwell, un escenario realista para equipos que no pueden repartir el BF16 en varias GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni similares). El unico dato cuantitativo publicado es la metrica de fidelidad EAR definida por el autor, medida sobre las diez tokens mas probables de la referencia BF16 y renormalizando ambas distribuciones sobre ese soporte.

| Modelo | EAR | Ficheros de pesos (GB) | Ejecucion medida |
|---|---:|---:|---|
| Qwen3.8-27B original BF16 | 100,000000 % | 55,563 | Referencia BF16 original |
| Qwen3.8-27B-FP8 oficial | 97,705903 % | 30,867 | Pesos y activaciones FP8 nativos |
| Qwen3.8-27B-FP8 oficial (solo pesos) | 98,101249 % | 30,867 | Pesos dequantizados, ejecucion BF16 |
| ISTA-DASLab 3Bit-GSQ | 89,425738 % | 11,828 | Pesos dequantizados, ejecucion BF16 |
| Kaitchup hum-high (17,7 GB) | 94,335032 % | 17,695 | Pesos dequantizados, ejecucion BF16 |
| Unsloth UD-Q4_K_XL GGUF | 97,444147 % | 17,559 | Pesos GGUF remapeados a BF16, Transformers |
| Custom SLQ EAR>98 | 98,000775 % | 23,732 | vLLM empaquetado / runtime Humming |
| **Custom SLQ EAR98.5 (este modelo)** | **98,502656 %** | **25,609** | vLLM empaquetado / runtime Humming |
| Custom SLQ EAR99 | 99,002514 % | 30,518 | vLLM empaquetado / runtime Humming |

## Requisitos de hardware

- VRAM: los pesos ocupan 25,609 GB (25.609.379.336 bytes) y es el propio autor quien advierte que ese dato es tamano de fichero, no memoria total de servicio. Hay que sumar buffers del runtime Humming y cache KV.
- Cache KV: con `--max-model-len 262144` la cache KV es el factor dominante; para contexto largo real hacen falta decenas de GB adicionales. No se publican cifras de consumo por token.
- GPU validadas: RTX PRO 6000 Blackwell, con vLLM 0.31.0 y humming-kernels 0.1.16. No se documentan pruebas en A100, H100, RTX 4090 ni en GPU de consumo.
- GPU de consumo: no hay validacion publicada. Por tamano de pesos (25,6 GB) no cabe en tarjetas de 16 GB ni de 24 GB en su configuracion completa; encajaria ajustadamente en 32 GB, pero sin confirmacion del autor.
- Despliegue: vLLM con soporte de cuantizacion `--quantization humming` y `--dtype bfloat16`. Es el unico runtime validado; no hay version GGUF ni Ollama para este checkpoint concreto, y llama.cpp o TGI no aparecen soportados.
- Latencia y throughput: no disponibles. El autor no publica numeros de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | EAR / calidad | Pesos (GB) | Licencia |
|---|---|---|---|---|---|---|
| **Qwen3.8-27B-SLQ-EAR98.5** | Cuantizacion mixta SLQ + Humming | 27B (nombre) / 7,98B (safetensors) | 262.144 | 98,502656 % EAR | 25,609 | Apache 2.0 |
| Qwen3.8-27B-FP8 oficial | FP8 nativo | 27B | No disponible | 97,705903 % EAR | 30,867 | Apache 2.0 |
| Kaitchup hum-high-MTP-17.7GB | AutoRound mixto | 27B | No disponible | 94,335032 % EAR | 17,695 | Apache 2.0 |
| ISTA-DASLab 3Bit-GSQ | 3 bits | 27B | No disponible | 89,425738 % EAR | 11,828 | No disponible |
| Unsloth UD-Q4_K_XL GGUF | GGUF Q4 | 27B | No disponible | 97,444147 % EAR | 17,559 | Apache 2.0 (heredada) |

La comparacion relevante es interna a la familia Qwen3.8-27B, ya que todos los checkpoints de la tabla comparten modelo base. El SLQ EAR98.5 se situa entre el FP8 oficial (mejor relacion tamano/fidelidad en bruto, 30,9 GB para 97,7 %) y las variantes de 17-18 GB (peor EAR), ofreciendo 3,5 GB menos que FP8 a cambio de +0,8 puntos de EAR medido, con la salvedad de que la ejecucion es empaquetada y no dequantizada.

## Limitaciones y advertencias

- El EAR no es una metrica de calidad downstream: mide solapamiento de distribuciones sobre las diez tokens mas probables de la referencia. El autor declara explicitamente que no se ha establecido equivalencia estadistica en tareas para estas publicaciones.
- Las cifras de EAR no son homogeneas entre filas: unas se miden con ejecucion empaquetada y otras sobre pesos dequantizados a BF16, y otros runtimes pueden diferir ligeramente.
- Vision no validada: los pesos de vision y los procesadores se conservan, pero la inferencia de imagen y video queda fuera de la validacion, y el comando de referencia limita explicitamente `{"image":0,"video":0}`.
- Decodificacion especulativa no validada, pese a conservarse los pesos MTP en BF16.
- Dependencia fuerte de un runtime concreto: requiere vLLM 0.31.0 con soporte Humming y humming-kernels 0.1.16. No hay GGUF ni soporte documentado en llama.cpp, Ollama o TGI, lo que limita el despliegue en entornos estandarizados.
- Discrepancia de parametros: los safetensors declaran 7.978.947.312 parametros frente a los 27B del nombre y del modelo base. Conviene verificar el checkpoint antes de usarlo en produccion.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue mas alla de lo que herede el modelo base.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni de sesgos para este checkpoint; al ser una compresion, cualquier sesgo del modelo base se mantiene.
- Repositorio practicamente sin uso comunitario (0 descargas, 1 like en el momento de la consulta): no hay evidencia de terceros sobre estabilidad en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad sobre el comportamiento del modelo recae en quien lo despliega.

## Enlaces

- [Modelo en HuggingFace: kaitchup/Qwen3.8-27B-SLQ-EAR98.5](https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98.5)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Version FP8 oficial: Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- [Checkpoint AutoRound: kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB](https://huggingface.co/kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB)
- [Checkpoint GSQ 3 bits: ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ](https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ)
- [GGUF de referencia: unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- [Variante SLQ EAR>98](https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98)
- [Variante SLQ EAR99](https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR99)
- [Paper de SLQ (arXiv:2605.02404)](https://arxiv.org/abs/2605.02404)
- [Repositorio de SLQ: IST-DASLab/SLQ](https://github.com/IST-DASLab/SLQ)
- [Repositorio de AutoRound: intel/auto-round](https://github.com/intel/auto-round)
- [The Kaitchup (newsletter del autor)](https://kaitchup.substack.com/subscribe)
- [Soporte al autor en Ko-fi](https://ko-fi.com/bnjmn_marie)

No se han encontrado enlaces externos adicionales relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
