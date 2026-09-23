# simaai/Qwen3.5-4B-DFlash-RTN-INT8-Safetensors

## Resumen

El modelo simaai/Qwen3.5-4B-DFlash-RTN-INT8-Safetensors es un checkpoint borrador (draft) para decodificacion especulativa, cuantizado a INT8 mediante round-to-nearest (RTN) simetrico por canal de salida. No es un modelo de generacion de texto autonomo: su funcion es proponer tokens que un modelo objetivo (target) verifica despues. Deriva de z-lab/Qwen3.5-4B-DFlash y ha sido preparado por SiMa.ai para su compilacion con el stack LLiMa, pensado para ejecutarse junto al checkpoint objetivo prequantizado simaai/Qwen3.5-4B-Autoround-Safetensors.

La relevancia de esta publicacion es doble. Por un lado, ejemplifica un flujo de cuantizacion reproducible y sin GPU: el script quantize.py opera en CPU leyendo directamente config.json y model.safetensors, sin necesidad del codigo de modelado personalizado de Transformers. Por otro, documenta el uso de compressed-tensors con almacenamiento pack-quantized para distribuir borradores de decodificacion especulativa ya cuantizados, un formato util para pipelines de compilacion orientados a aceleradores dedicados.

El repositorio ocupa 1,3 GB y declara 634.425.856 parametros en sus pesos safetensors; la denominacion "4B" del nombre hace referencia a la familia Qwen3.5-4B sobre la que se construye el borrador. La licencia es Apache 2.0. No se publican idiomas soportados, benchmarks, tasas de aceptacion del borrador ni validacion de rendimiento en tiempo de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificacion especulativa (borrador o draft); incluye capa de fusion de contexto `fc`, proyecciones de atencion Q/K/V/output y proyecciones MLP gate/up/down |
| Parametros totales | 634.425.856 (segun pesos safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 simetrico RTN por canal de salida en las 43 capas lineales del borrador; parametros de normalizacion y sesgos retenidos en BF16; sin cuantizacion de activaciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con almacenamiento compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento

Se trata de un checkpoint borrador asociado a un modelo objetivo de la familia Qwen3.5-4B. La receta de cuantizacion abarca las 43 capas lineales del borrador: la capa de fusion de contexto `fc`, las proyecciones Q, K, V y de salida de la atencion, y las proyecciones gate, up y down del bloque MLP. Cada tensor se cuantiza a INT8 simetrico por canal de salida, con una escala por fila de salida derivada de una observacion min/max de los pesos. Los parametros de normalizacion y cualquier sesgo se conservan en BF16. El proceso no requiere calibracion ni pase forward: solo observa los pesos.

La innovacion tecnica principal no esta en el entrenamiento (no se documenta dataset, numero de tokens, composicion ni uso de RLHF/DPO), sino en el procedimiento de compresion y en su verificabilidad. El autor incluye quantize.py, quantize.py.sha256, versions.txt y dependency_sources.json, y afirma que la validacion de exportacion paso para las 43 matrices INT8 (formas de escala por canal y escalas finitas positivas) y que el cargador LLiMa reconstruyo cada capa cuantizada con coincidencia exacta respecto al export. Los tensores retenidos en BF16 coinciden byte a byte con el origen. No obstante, la equivalencia bit a bit con la cuantizacion que realiza el compilador no se ha establecido, y la revision inmutable del checkpoint de origen no quedo registrada en la ejecucion.

## Capacidades

- Proposicion de tokens en decodificacion especulativa: genera candidatos que el modelo objetivo verifica, con el objetivo de reducir el numero de pases forward del target.
- Aceleracion de la inferencia del modelo objetivo Qwen3.5-4B cuando se empareja con simaai/Qwen3.5-4B-Autoround-Safetensors.
- Integracion con el flujo de compilacion LLiMa de SiMa.ai para despliegue en aceleradores de la compania.
- Reproduccion del pipeline de cuantizacion RTN INT8 en CPU, sin GPU y sin el codigo de modelado personalizado de Transformers.
- No incluye ni cuantiza los embeddings del objetivo ni la cabeza de salida del objetivo; el runtime o el compilador deben aportarlos desde el checkpoint objetivo correspondiente.
- No soporta generacion de texto autonoma, tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito, segun la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Aceleracion de servicio de inferencia para Qwen3.5-4B: el borrador propone varios tokens por paso y el objetivo los valida en paralelo, lo que reduce el numero de evaluaciones del modelo grande. Es adecuado porque su tamano reducido (634 millones de parametros) abarata cada propuesta frente al coste del target.
- Despliegue en hardware SiMa.ai: el checkpoint esta preparado explicitamente para la compilacion con LLiMa y debe combinarse con el target prequantizado de la misma coleccion, de modo que encaja en pipelines de compilacion para aceleradores MLSoC.
- Servicios de atencion al cliente con latencia ajustada: al emparejarse con el target, permite sostener conversaciones multi-turno con menor coste por token generado, siempre que el backend soporte el par borrador-objetivo.
- Asistencia de codigo en editores: la decodificacion especulativa reduce la latencia percibida en completados cortos y repetitivos, un patron frecuente en autocompletado de codigo, aunque la calidad final la determina el modelo objetivo.
- Inferencia por lotes en servidores con GPU modesta: al sumar el borrador INT8 (menos de 1 GB de pesos) al target cuantizado, el conjunto puede alojarse en GPUs de gama media y aumentar el throughput agregado.
- Investigacion en decodificacion especulativa: sirve como caso de estudio de una receta RTN INT8 reproducible y verificable, util para comparar politicas de cuantizacion de borradores frente a la cuantizacion del lado del compilador.
- Validacion de toolchains de compilacion: al incluir versions.txt y dependency_sources.json con revisiones de commit, permite reproducir el entorno exacto (Python 3.12 y builds de desarrollo no necesariamente disponibles en PyPI) y auditar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la compilacion con LLiMa, la tasa de aceptacion del borrador, la calidad de salida y el rendimiento en tiempo de ejecucion no han sido validados para este checkpoint cuantizado.

## Requisitos de hardware

- Pesos del borrador: 634.425.856 parametros en INT8 equivalen a aproximadamente 0,63 GB, mas escalas por canal y tensores retenidos en BF16; el repositorio completo ocupa 1,3 GB (estimacion a partir de los datos del repositorio).
- El borrador no funciona solo: hay que sumar el modelo objetivo. Con un target de la familia Qwen3.5-4B en INT8, el conjunto requeriria del orden de 5 GB de VRAM (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles. Por tamano, un conjunto borrador mas target de 4B en INT8 es viable en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070 o RTX 4090; para servicio en produccion con lotes grandes serian preferibles A100 o H100, aunque no hay cifras publicadas que lo respalden.
- Cabe en GPU de consumo: probablemente si, en modelos con 8-12 GB de VRAM, siempre que el runtime soporte el par borrador-objetivo. No verificado por el autor.
- Opciones de despliegue: el repositorio declara `inference: false` y requiere compilacion mediante LLiMa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El uso previsto es el stack de SiMa.ai junto al target prequantizado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad ni de tasa de aceptacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| simaai/Qwen3.5-4B-DFlash-RTN-INT8-Safetensors | Borrador de decodificacion especulativa | 634.425.856 | INT8 RTN por canal, pesos en compressed-tensors | no disponible | apache-2.0 | HuggingFace, requiere LLiMa y target emparejado |
| z-lab/Qwen3.5-4B-DFlash | Borrador de decodificacion especulativa | no disponible | BF16 | no disponible | no disponible en la informacion facilitada | HuggingFace |
| simaai/Qwen3.5-4B-Autoround-Safetensors | Modelo objetivo prequantizado | no disponible (familia 4B) | cuantizacion automatica (autoround) | no disponible | no disponible en la informacion facilitada | HuggingFace, misma coleccion |

No se dispone de datos de benchmarks ni de otros borradores comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- No es un modelo autonomo de generacion de texto: sin el modelo objetivo emparejado y sin los embeddings y la cabeza de salida del target, no produce resultados utilizables.
- Requiere compilacion con LLiMa; el repositorio declara `inference: false` y no se documenta compatibilidad con runtimes estandar como vLLM, llama.cpp, Ollama o TGI.
- La model card advierte de que la compilacion con LLiMa, la tasa de aceptacion del borrador, la calidad de salida y el rendimiento en tiempo de ejecucion no han sido validados.
- No se ha establecido equivalencia bit a bit con la cuantizacion que aplica el compilador; existe riesgo de divergencia numerica entre el checkpoint distribuido y el resultado del flujo de compilacion.
- La revision inmutable del checkpoint de origen no quedo registrada, lo que dificulta la reproducibilidad exacta a largo plazo.
- El entorno de reproduccion usa builds de desarrollo de Python 3.12 que pueden no estar disponibles en PyPI, lo que complica la reinstalacion futura.
- Sesgos conocidos: no disponibles. Al derivar de Qwen3.5, podria heredar los sesgos del modelo base, pero no hay informacion al respecto en la documentacion facilitada.
- Riesgo de alucinacion: no evaluado para este checkpoint; la verificacion del target mitiga parcialmente los tokens erroneos, pero no se han publicado metricas.
- Limitaciones de contexto e idioma: no disponibles en la informacion del repositorio.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la dependencia del stack de compilacion LLiMa y del modelo objetivo condiciona su explotacion practica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simaai/Qwen3.5-4B-DFlash-RTN-INT8-Safetensors
- Modelo base (borrador BF16): https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Target prequantizado emparejado: https://huggingface.co/simaai/Qwen3.5-4B-Autoround-Safetensors
- Coleccion de modelos prequantizados de SiMa.ai: https://huggingface.co/collections/simaai/pre-quantized-models-6a5623ca69f6a9ed0a41d3df
