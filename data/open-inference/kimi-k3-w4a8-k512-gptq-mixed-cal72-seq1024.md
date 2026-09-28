# open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024

## Resumen

Este repositorio no es un modelo nuevo, sino una cuantizacion derivada de `moonshotai/Kimi-K3`, publicada por la organizacion `open-inference` bajo la convencion de nombres `Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024`. El artefacto aplica cuantizacion GPTQ INT4 simetrica (rango [-7,7]) exclusivamente a los expertos enrutados, con grupos contiguos de 512 elementos y escalas FP32 empaquetadas en INT32 de offset binario mediante `compressed-tensors`. El resto de tensores del modelo fuente se preserva exactamente. El peso total declarado en los safetensors es de 2.779.931.837.184 parametros (unos 2,78 billones), con un repositorio de 1497,2 GB.

El modelo fuente pertenece a la familia Kimi K3 de Moonshot AI, con arquitectura de mezcla de expertos (MoE) y una torre de vision nativa, segun se deduce de la model card, que menciona expertos enrutados y no enrutados, procesamiento de imagenes y videos, y un runtime especifico TPU v6e W4A8. La model card del autor no publica el numero de parametros activos, la longitud de contexto, los idiomas soportados ni resultados de benchmarks.

Su relevancia es fundamentalmente tecnica y de investigacion: documenta una receta de cuantizacion calibrada (contrato de build `kimi-k3-w4a8-k512-v1`) con calibracion de 72 ejemplos, hashes de shards y codigo de construccion incluidos. El propio autor declara el artefacto como "no cualificado para produccion" y advierte de que no se reclama compatibilidad con cargadores GPU arbitrarios, ya que el destino es un runtime TPU v6e W4A8 personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de vision nativa, segun la model card; detalle completo de capas no disponible |
| Parametros totales | 2.779.931.837.184 (unos 2,78 billones) |
| Parametros activos | no disponible (el modelo usa expertos enrutados, pero no se publica el recuento activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simetrica con signo [-7,7] (W4A8) en expertos enrutados, grupos contiguos K512, escalas FP32; empaquetado INT32 offset-binary de `compressed-tensors`. Tensores restantes sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | `other`, nombre `kimi-k3` (fichero LICENSE en el repositorio) |
| Formato de pesos | safetensors (`compressed-tensors`, `custom_code`), libreria `transformers` |
| Modelo base | `moonshotai/Kimi-K3`, commit `f831ab66814297da540d832a5235f8e904f29d06` |
| Referencia de calidad del fuente | modelo MXFP4 publicado (no se asume referencia BF16) |
| Tamano del repositorio | 1497,2 GB |
| Pipeline declarado | feature-extraction |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha entrenado ningun modelo nuevo: se trata de un proceso de cuantizacion post-entrenamiento sobre `moonshotai/Kimi-K3`. La model card indica que solo se cuantizan los expertos enrutados, manteniendo intactos el resto de tensores del modelo fuente, lo que implica una arquitectura MoE con al menos dos clases de expertos (enrutados y no enrutados) y un componente de vision nativo capaz de procesar imagenes y fotogramas de video. El numero de capas, la dimension oculta, el numero de expertos por capa y la politica de enrutamiento no se detallan en la informacion disponible.

El metodo empleado es GPTQ con Hessiano completo: amortiguacion inicial del 1 %, actualizaciones de 128 columnas, ajuste de escalas FP32 ponderado por activaciones y un maximo de 4096 filas de calibracion por experto. Los expertos no enrutados usan un fallback GPTQ declarado explicitamente sobre la entrada de capa. La calibracion consta de 72 ejemplos: 56 conversaciones retenidas de UltraChat, 8 prompts de codigo y razonamiento escritos por el autor, 4 imagenes y 4 videos representados como secuencias cronologicas de fotogramas a traves de la torre de vision nativa. Diez ejemplos disjuntos se reservan para validacion. El contrato de build es `kimi-k3-w4a8-k512-v1` y los ficheros `calibration.json`, `recipe.json`, `metrics-*.json` y `heldout-quality.json` acompanan al repositorio.

## Capacidades

- Extraccion de caracteristicas: el pipeline declarado en HuggingFace es `feature-extraction`, no `text-generation`.
- Generacion de texto: no confirmada en la informacion disponible; la model card indica que la generacion coherente es un requisito de evaluacion separado y no cualificado.
- Procesamiento de vision: el modelo fuente incorpora una torre de vision nativa; la calibracion incluye imagenes y fotogramas de video.
- Procesamiento de video: los videos se representaron como fotogramas cronologicos durante la calibracion; el procesador HF publicado solo acepta imagenes y la cualificacion de video nativo con fusion temporal queda pendiente.
- Razonamiento y codigo: se usaron 8 prompts de codigo y razonamiento en la calibracion, lo que sugiere capacidad en esos dominios, aunque no se aportan metricas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Investigacion en cuantizacion: el repositorio sirve como referencia reproducible de una receta GPTQ sobre expertos enrutados, con hashes de shards, contrato de build y ficheros de calibracion, para estudiar el impacto del empaquetado INT32 offset-binary y de los grupos K512.
- Validacion de pipelines en TPU v6e: dado que el artefacto esta construido para el runtime W4A8 de TPU v6e, su uso natural es alimentar ese runtime y comparar las metricas de validacion retenida recogidas en `heldout-quality.json`.
- Analisis de degradacion por cuantizacion: al conservar intactos todos los tensores no enrutados, permite aislar el efecto de cuantizar unicamente los expertos enrutados frente al modelo fuente MXFP4.
- Extraccion de caracteristicas multimodales: el pipeline declarado y la torre de vision permiten plantear el uso como extractor sobre imagenes, con la salvedad de que la ruta de video nativo no esta cualificada.
- Reproduccion de builds: el codigo de construccion incluido facilita reconstruir la cuantizacion con otros conjuntos de calibracion o variar el tamano de grupo K512.
- Auditoria de integridad de pesos: los hashes completos de shards permiten verificar la serializacion y la cobertura de la cuantizacion en entornos de investigacion.
- Evaluacion comparativa de tecnicas GPTQ: la combinacion de amortiguacion al 1 %, actualizaciones de 128 columnas y ajuste de escalas ponderado por activaciones puede compararse contra otras recetas sobre el mismo modelo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las metricas de validacion retenida del modelo fuente y del cuantizado estan en `heldout-quality.json`, pero no reproduce sus valores. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra familia de tareas. El autor indica explicitamente que las evaluaciones por familia de tareas, la generacion coherente, el contexto largo y la cualificacion completa de servicio son requisitos separados y aun no cumplidos.

## Requisitos de hardware

- VRAM para inferencia: el repositorio ocupa 1497,2 GB, por lo que los pesos en INT4 requieren aproximadamente 1,5 TB de memoria agregada. Cifra estimada a partir del tamano del repositorio, no declarada por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. El artefacto esta destinado a un runtime TPU v6e W4A8, no a GPU.
- Compatibilidad con GPU de consumo: no. Ninguna GPU de consumo (RTX 4090, 24 GB) puede alojar el modelo, ni siquiera con cuantizacion adicional.
- Estimacion de despliegue en GPU: harian falta del orden de 19-20 aceleradores de 80 GB (H100/A100) solo para los pesos, sin contar cache KV ni activaciones. Estimacion aritmetica, no confirmada por el autor.
- Opciones de despliegue: la model card advierte que el artefacto no reclama compatibilidad con cargadores GPU arbitrarios. No hay confirmacion de soporte para vLLM, TGI, llama.cpp, Ollama ni otros motores de inferencia convencionales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Unicamente puede compararse con su propio modelo fuente.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024` | 2,78 billones | no disponible | INT4 W4A8 en expertos enrutados, K512, escalas FP32 | `kimi-k3` (other) | HuggingFace, 0 descargas, 0 likes |
| `moonshotai/Kimi-K3` (fuente) | no disponible en la informacion | no disponible | MXFP4 publicado | `kimi-k3` (other) | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado de calidad: el propio autor declara el modelo como "unqualified for production" (no cualificado para produccion).
- Compatibilidad: no se reclama compatibilidad con cargadores GPU arbitrarios; el destino es el runtime TPU v6e W4A8. Cualquier intento de carga en GPU queda por validar.
- Cobertura de evaluacion: la serializacion y la cobertura estan auditadas, pero las evaluaciones por familia de tareas, la generacion coherente, el contexto largo y la cualificacion completa de servicio estan pendientes.
- Referencia de calidad: no se asume una referencia original en BF16; el punto de comparacion es el modelo MXFP4 publicado, lo que condiciona cualquier analisis de degradacion.
- Video: el procesador HF publicado solo acepta imagenes y la cualificacion de video nativo con fusion temporal sigue pendiente, pese a que la calibracion incluyo 4 videos como fotogramas.
- Datos ausentes: no hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados, longitud de contexto ni parametros activos.
- Licencia: licencia `other` con nombre `kimi-k3`; las condiciones de uso comercial dependen del fichero LICENSE del repositorio, que no se reproduce en la informacion proporcionada. Debe revisarse antes de cualquier uso comercial.
- Adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Madurez: repositorio creado y actualizado el mismo dia (27 de septiembre de 2026), sin historial de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Fichero de licencia: LICENSE dentro del repositorio del modelo
- Ficheros de receta y metricas: `calibration.json`, `recipe.json`, `metrics-*.json`, `heldout-quality.json` en el repositorio
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo en la busqueda proporcionada (los resultados corresponden a sitios corporativos no relacionados).
