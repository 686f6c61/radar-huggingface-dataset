# Pilcothink/Raon-1-mini-preview-dflash2-nvfp4

## Resumen

Raon-1-mini-preview-dflash2-nvfp4 es una cuantizacion comunitaria en formato NVFP4 (W4A4) del modelo borrador DFlash2 de KRAFTON, publicado por el usuario Pilcothink. No se trata de un modelo autonomo de generacion de texto, sino de un modelo auxiliar de decodificacion especulativa: se usa junto al modelo objetivo Raon-1-mini para proponer tokens candidatos que el modelo grande verifica despues, acelerando la inferencia sin alterar la distribucion de salida.

El modelo base es KRAFTON/Raon-1-mini-preview-dflash2, un borrador de tipo DFlash2 asociado a la familia Qwen3 (segun los tags del repositorio). La cuantizacion se ha realizado con NVIDIA Model Optimizer, sin fine-tuning posterior, y afecta a 36 proyecciones lineales del cuerpo mas la cabeza de salida (`lm_head`), mientras que selectores, convoluciones y normalizaciones conservan sus valores originales. El resultado es un checkpoint de 413.994.240 parametros (unos 414 millones) con un repositorio de 1,3 GB.

Su relevancia practica es acotada pero concreta: permite desplegar el borrador especulativo en hardware con soporte NVFP4 (arquitecturas Blackwell, como DGX Spark) bajo el stack vLLM, reduciendo el coste de memoria y de computo del componente especulativo. La licencia Apache 2.0 y el formato safetensors lo hacen integrable en pipelines de servicio sin friccion legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (modelo borrador para decodificacion especulativa), derivado de la familia Qwen3 segun tags |
| Parametros totales | 413.994.240 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (36 proyecciones lineales del cuerpo + cabeza de salida) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa de tipo DFlash2, pensado para emparejarse con el modelo objetivo Raon-1-mini. La cuantizacion se aplica sobre las proyecciones lineales: proyeccion de caracteristicas (`fc`), proyecciones de atencion Q/K/V/O, proyecciones MLP gate/up/down y la cabeza de salida (`lm_head`). En total se cuantizan 36 proyecciones lineales del cuerpo y una cabeza de salida; los tensores de selector, convolucion y normalizacion mantienen su precision original. La cabeza de salida se convirtio desde el formato MXFP8 presente en KRAFTON/Raon-1-mini-preview-nvfp4.

No se realizo ningun fine-tuning adicional tras la cuantizacion: el proceso se limita a la conversion de pesos con NVIDIA Model Optimizer. No hay informacion disponible sobre el volumen de datos de entrenamiento del modelo base, su composicion, ni sobre si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es doble: por un lado, el uso de decodificacion especulativa con un borrador dedicado; por otro, el formato NVFP4 W4A4, que reduce pesos y activaciones a 4 bits con escalado de bloque, orientado a aceleradores Blackwell.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa junto al modelo objetivo Raon-1-mini.
- Aceleracion de la inferencia del modelo grande mediante verificacion paralela de propuestas.
- Integracion con vLLM como libreria de despliegue declarada.
- Ejecucion en precision NVFP4 W4A4 sobre hardware compatible con ese formato.
- No es un modelo autonomo: no esta pensado para generar texto final, razonar, resolver matematicas ni mantener conversaciones por si mismo.
- Soporte de tool calling, agentes o vision: no disponible para este componente.
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Aceleracion de servicio LLM en produccion: se empareja con Raon-1-mini en vLLM para que el borrador proponga varios tokens por paso y el modelo objetivo los valide, aumentando el throughput efectivo en generacion autoregresiva.
- Despliegue en DGX Spark: el repositorio incluye una guia de servicio con Docker orientada a DGX Spark, lo que permite levantar el stack vLLM con el borrador cuantizado en ese hardware concreto.
- Reduccion de huella de memoria en el componente especulativo: al ocupar 1,3 GB en NVFP4, libera VRAM que puede reasignarse al modelo objetivo o a mayor tamano de lote.
- Servicio de baja latencia en entornos con aceleradores Blackwell: el formato NVFP4 W4A4 aprovecha las unidades de computo de 4 bits de estas GPU, lo que resulta adecuado para APIs de generacion con requisitos de latencia estrictos.
- Evaluacion y comparacion de estrategias de decodificacion especulativa: sirve como pieza reproducible para medir ganancias de aceptacion de tokens frente a otras variantes del borrador (por ejemplo, la version MXFP8).
- Integracion en pipelines de CI/CD para pruebas de inferencia: al ser un checkpoint pequeno y con licencia Apache 2.0, puede incluirse en entornos de test que validen la configuracion especulativa antes de desplegar el modelo grande.
- Investigacion sobre cuantizacion de borradores especulativos: permite estudiar el impacto de W4A4 en la tasa de aceptacion de tokens y en la calidad final del modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB solo para los pesos del borrador en NVFP4; hay que sumar la memoria del modelo objetivo Raon-1-mini y las estructuras de decodificacion especulativa (KV cache y buffers de verificacion).
- GPU recomendadas: aceleradores con soporte nativo de NVFP4, como los de arquitectura Blackwell (DGX Spark incluido en la guia oficial del autor). No se garantiza ejecucion correcta en GPU sin soporte para ese formato.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que funcione en RTX 4090 u otras graficas sin soporte NVFP4.
- Opciones de despliegue: vLLM (libreria declarada en el repositorio) y la imagen Docker documentada en la guia de servicio del autor para DGX Spark.
- Latencia y throughput: no disponibles; dependen del modelo objetivo, del hardware y de la tasa de aceptacion del borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pilcothink/Raon-1-mini-preview-dflash2-nvfp4 | 413.994.240 | no disponible | NVFP4 W4A4 | Apache 2.0 | HuggingFace, vLLM |
| KRAFTON/Raon-1-mini-preview-dflash2 | no disponible | no disponible | original (sin cuantizar) | no disponible en la informacion | HuggingFace |
| KRAFTON/Raon-1-mini-preview-nvfp4 | no disponible | no disponible | NVFP4 (cabeza en MXFP8) | no disponible en la informacion | HuggingFace |

La comparativa se limita a las variantes del mismo borrador documentadas en la informacion disponible; no se dispone de datos de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere obligatoriamente el modelo objetivo Raon-1-mini; usarlo de forma aislada no produce resultados validos.
- Dependencia de hardware: el formato NVFP4 W4A4 exige aceleradores compatibles; en GPU sin ese soporte el checkpoint puede no cargar o degradar el rendimiento.
- Sin fine-tuning posterior a la cuantizacion: la tasa de aceptacion de tokens puede diferir respecto al borrador original en precision completa.
- Sin datos de benchmarks: no hay evidencia publicada sobre la perdida de calidad o la ganancia de velocidad de esta variante concreta.
- Riesgo de alucinacion: aunque el modelo objetivo valida las propuestas del borrador, una tasa de aceptacion baja reduce la aceleracion y puede aumentar el coste computacional.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, por lo que no pueden asumirse capacidades multilingues ni ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base pertenece a KRAFTON AI; conviene revisar los terminos del repositorio original antes de un despliegue comercial.
- Es una cuantizacion comunitaria, no oficial de KRAFTON: el soporte y las garantias de calidad recaen en el publicador Pilcothink.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pilcothink/Raon-1-mini-preview-dflash2-nvfp4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview-dflash2
- Variante NVFP4 de referencia: https://huggingface.co/KRAFTON/Raon-1-mini-preview-nvfp4
- Guia de servicio y Docker para DGX Spark: https://github.com/gpdev-Pilcothink/DGX_Spark_vllm_Dockerfile/tree/main/0.32/Raon1-mini
