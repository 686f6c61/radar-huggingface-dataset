# cstr/crispasr-granite5-validation-public

## Resumen

Este repositorio no es un modelo nuevo, sino un conjunto de checkpoints diagnosticos de conversion y cuantizacion en formato GGUF generados por `cstr` a partir de `ibm-granite/granite-speech-5.0-2b` (commit `c075cf19e041a2e4d16c5ee24763e5b037d8f479`), el modelo de voz de IBM publicado bajo Apache-2.0. El autor lo etiqueta explicitamente como material de validacion para portar Granite Speech 5.0 2B a CrispASR y advierte que **no** constituye un modelo aceptado ni soportado: la paridad de la etapa nativa, la aceptacion de la salida decodificada y la ejecucion real en CUDA estan pendientes.

El peso real de los tensores es de 2.313.228.204 parametros (2,31 mil millones), coherente con la variante 2B del modelo base. El repositorio ocupa 52,2 GB porque acumula multiples recetas de cuantizacion, capsulas de validacion compiladas y los paquetes de codigo fuente correspondientes, no porque el modelo en si tenga ese tamano.

Su relevancia es doble: por un lado documenta el estado del arte de la portabilidad de un LLM de voz a un runtime alternativo (CrispASR) mediante GGUF; por otro, sirve como caso de estudio de gobernanza de licencias, ya que separa el alcance Apache-2.0 de los pesos IBM del alcance MIT de las recetas de conversion y de las licencias de terceros incluidas en las capsulas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; es una conversion a GGUF del modelo base `ibm-granite/granite-speech-5.0-2b` |
| Parametros totales | 2.313.228.204 (dato real de safetensors) |
| Parametros activos | No aplica / no confirmado: la informacion disponible no indica que el modelo sea MoE |
| Longitud de contexto | No disponible; la model card menciona que las lineas base "pre-YaRN" omiten el escalado RoPE requerido, lo que implica soporte de extension de contexto via YaRN en el modelo original |
| Tipos de cuantizacion | GGUF (conversion y cuantizacion realizadas por CrispASR); los niveles concretos no se detallan en la model card. El repositorio incluye multiples recetas de cuantizacion (52,2 GB en total) |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | Apache-2.0 para los pesos derivados de IBM; las recetas y el codigo de CrispASR mantienen licencia MIT |
| Formato de pesos | GGUF (repositorio etiquetado con `gguf`); el modelo base esta en safetensors |
| Modelo base | `ibm-granite/granite-speech-5.0-2b` (commit c075cf19e041a2e4d16c5ee24763e5b037d8f479) |
| Etiqueta de aceptacion | `crispasr_native_acceptance: false` (no aceptado como soporte de modelo) |
| Fecha de creacion | 2026-10-23 |
| Ultima actualizacion | 2026-10-23 |
| Descargas / likes | 0 / 0 |
| Region | US |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en los materiales proporcionados (tipo de encoder de audio, decoder de lenguaje, numero de capas, dimension oculta o composicion del dataset de entrenamiento). Lo unico verificable es que se trata de un modelo de la familia Granite Speech de IBM con 2,31 mil millones de parametros y que el proceso de conversion a GGUF se ha realizado sobre el checkpoint fijado en el commit `c075cf19e041a2e4d16c5ee24763e5b037d8f479`.

El detalle tecnico mas relevante que si aparece en la model card es que las lineas base "pre-YaRN" omiten intencionadamente el escalado RoPE necesario, lo que sugiere que la conversion aún no reproduce fielmente la configuracion de atencion extendida del modelo original. El autor senala tres hitos pendientes antes de poder hablar de aceptacion: paridad de la etapa nativa, aceptacion de la salida decodificada y ejecucion real verificada sobre CUDA. Un proceso de conversion y subida exitoso no equivale a aceptacion del modelo, y ningun registro de produccion apunta a este repositorio.

No se documentan tecnicas de alineacion (RLHF, DPO), decodificacion especulativa ni innovaciones de atencion en la informacion disponible.

## Capacidades

- Generacion y decodificacion de salida a partir de los pesos convertidos: el objetivo declarado del artefacto es verificar la paridad de la salida decodificada frente al modelo original.
- Procesamiento de voz heredado del modelo base Granite Speech 5.0 2B (reconocimiento de habla y comprension de audio), aunque las capacidades concretas no se detallan en la informacion disponible.
- Conversion y cuantizacion GGUF reproducible mediante recetas de CrispASR (alcance MIT independiente).
- Trazabilidad completa: la model card indica que se conservan la model card original, los checksums de origen, las recetas y los recibos ("receipts") por ejecucion.
- Validacion comparativa de configuraciones de RoPE/YaRN frente a las lineas base que omiten el escalado.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio de salida ni modo "thinking".

## Casos de uso

- Validacion de portabilidad de runtime: usar los checkpoints como entrada para comprobar si CrispASR reproduce la salida de `ibm-granite/granite-speech-5.0-2b` token a token, antes de promover cualquier version a un registro de produccion.
- Pruebas de regresion de cuantizacion: comparar la perplejidad y la calidad de transcripcion entre los distintos niveles GGUF generados con las recetas de CrispASR para decidir que cuantizacion minima es aceptable.
- Depuracion de escalado RoPE/YaRN: las lineas base "pre-YaRN" sirven como control negativo para medir cuanto degrada la omision del escalado en secuencias largas y calibrar la configuracion correcta.
- Auditoria de gobernanza de licencias: el repositorio separa explicitamente pesos Apache-2.0, recetas MIT, librerias de terceros en las capsulas y runtimes de NVIDIA no redistribuidos; es un ejemplo practico para equipos juridicos que revisan releases de modelos derivados.
- Reproducibilidad de artefactos: los checksums de origen, commits exactos, versiones de paquetes y hashes de payload permiten reconstruir la cadena de build de una conversion determinada.
- Evaluacion de inferencia en hardware modesto: con 2,31 B de parametros, un GGUF cuantizado (estimacion de 1,4-2,5 GB) permite probar el pipeline en una unica GPU de consumo antes de invertir en validacion CUDA completa.
- Referencia negativa en documentacion interna: sirve para ilustrar por que un upload correcto no equivale a soporte de modelo, evitando que artefactos diagnosticos se consuman como releases estables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, WER ni ninguna otra metrica, y el autor indica que la aceptacion de la salida decodificada y la ejecucion en CUDA estan pendientes. Cualquier cifra de rendimiento seria una invencion y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 2,31 B de parametros, no medida por el autor): ~4,6 GB en FP16, ~2,5 GB en Q8_0, ~1,7 GB en Q5_K_M y ~1,4 GB en Q4_K_M, mas el overhead del encoder de audio y la cache KV.
- El repositorio completo ocupa 52,2 GB en disco porque incluye todas las recetas, cuantizaciones y capsulas de validacion; el despliegue real solo necesita el archivo GGUF del nivel elegido.
- GPU recomendadas: al no haber validacion CUDA completada, no se pueden recomendar modelos concretos con garantias. Por tamano, cualquier GPU consumer con 8 GB o mas (RTX 3060/4060 en adelante) deberia alojar comodamente una cuantizacion Q4/Q5 en FP16 de activaciones.
- Cabe en GPU de consumo: si, segun la estimacion de tamano, en cualquier tarjeta con 6-8 GB de VRAM para cuantizaciones de 4-8 bits.
- Opciones de despliegue: llama.cpp y el runtime CrispASR son las vias naturales al ser formato GGUF. Compatibilidad con Ollama, vLLM o TGI no esta confirmada en la informacion disponible y, en el caso de vLLM/TGI, requeriria pesos en safetensors o conversion adicional.
- Latencia y throughput: no disponibles. No se han publicado mediciones y la ejecucion CUDA esta declarada como pendiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| `cstr/crispasr-granite5-validation-public` | 2,31 B | No disponible (RoPE/YaRN pendiente) | GGUF | Apache-2.0 (pesos) + MIT (recetas) | Artefacto diagnostico, no aceptado, 0 descargas |
| `ibm-granite/granite-speech-5.0-2b` | No disponible en la informacion (mismo origen, ~2 B por nomenclatura) | No disponible | Safetensors | Apache-2.0 | Modelo original publicado por IBM |
| Otras alternativas de ASR/LLM de voz de ~2-3 B | No disponible | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones tecnicas de terceros que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- **No es un modelo aceptado ni soportado.** La model card lo declara explicitamente: `crispasr_native_acceptance: false`, paridad de etapa nativa pendiente, aceptacion de salida decodificada pendiente y ejecucion CUDA pendiente. Ningun registro de produccion apunta a este repositorio.
- **Un conversion/upload correcto no equivale a aceptacion.** El autor lo recalca de forma literal; no debe tratarse como release.
- **Escalado RoPE omitido en las lineas base.** Las variantes "pre-YaRN" no incluyen el escalado requerido, por lo que el comportamiento en contextos largos puede desviarse del modelo original.
- **Licencias en capas.** La etiqueta Apache-2.0 cubre solo los pesos derivados de IBM; no relicencia las herramientas de validacion ni sus dependencias, que mantienen MIT. Las capsulas compiladas incluyen librerias de terceros con sus propias licencias y obligaciones de conservacion (LICENSE, THIRD_PARTY_NOTICES.txt, avisos por paquete y paquetes de codigo fuente correspondiente).
- **Runtimes de NVIDIA no redistribuidos.** Driver, runtime CUDA y cuBLAS son provistos por el host y se rigen por sus propios terminos de instalacion.
- **Sin aval de IBM.** La model card indica que no se implica endorsement por parte de IBM.
- **Riesgo de alucinacion y sesgos:** no documentados en la informacion disponible; al ser un modelo de voz, cabe esperar los riesgos habituales de transcripcion (nombres propios, acentos, ruido de fondo), pero no hay evaluacion publicada que lo cuantifique.
- **Idiomas no especificados:** no se puede garantizar cobertura multilingue ni el comportamiento en castellano.
- **Madurez del artefacto:** 0 descargas y 0 likes, creado y actualizado el mismo dia, sin pipeline declarado ni historial de validacion externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cstr/crispasr-granite5-validation-public
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Listado de fine-tunes del modelo base: https://huggingface.co/models?other=base_model%3Afinetune%3Aibm-granite%2Fgranite-speech-5.0-2b
- Modelos compatibles con la libreria GGUF en HuggingFace: https://huggingface.co/models?library=gguf&p=0&sort=created
