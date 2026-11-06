# mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF es una cuantizacion GGUF, generada por mradermacher, del modelo richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic. Se trata de una variante "heretic" (abliterated/decensored) del modelo Mistral Small 3.2 24B Instruct de junio de 2025, es decir, un ajuste que elimina total o parcialmente los mecanismos de rechazo y alineacion de seguridad del modelo original. El repositorio contiene unicamente los pesos cuantizados en formato GGUF, no el modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantizacion pensado para inferencia local con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp); por otro, advierte de que el modelo subyacente ha sido modificado para reducir sus filtros de seguridad, lo que tiene implicaciones directas en su uso en produccion. La informacion disponible en el repositorio es muy escasa: no hay model card descriptiva, no se declara licencia, no se especifican idiomas y el conteo de parametros reportado en safetensors (5.000.760) es incoherente con el nombre del modelo (24B), por lo que se trata de un dato no fiable.

El repositorio no presenta descargas ni likes en el momento de la consulta, y su tamano declarado es de 0.0 GB, lo que sugiere que los ficheros pueden no estar disponibles o que los metadatos estan incompletos. Todas las especificaciones que dependen del modelo base se infieren del nombre y de la referencia al repositorio de origen; se indican como "no disponibles" cuando no pueden confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer denso del modelo base Mistral Small 3.2, sin confirmar) |
| Parametros totales | no disponible (el nombre indica 24B; el campo safetensors reporta 5.000.760, dato incoherente y no fiable) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la informacion proporcionada. El nombre del repositorio indica que deriva de Mistral-Small-3.2-24B-Instruct-2506, un modelo de la familia Mistral Small, pero la model card no describe capas, atencion, contexto nativo ni composicion del dataset. La unica informacion tecnica explicita son los metadatos de cuantizacion: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, y el uso de cuantizaciones ponderadas con imatrix ("weighted/imatrix quants").

El prefijo "heretic" en el nombre del modelo de origen indica que se ha aplicado una tecnica de abliteration o decensoring sobre el modelo instruct original, orientada a reducir la tasa de rechazos. No se documentan en este repositorio ni el procedimiento exacto, ni el numero de tokens de entrenamiento, ni si hubo RLHF, DPO o ajuste supervisado adicional. Tampoco se especifica si se ha preservado la torre de vision del modelo multimodal original; la ausencia de `mmproj` en los metadatos (`skip_mmproj` vacio) no permite confirmar si se incluye soporte de imagen.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instruct base (no verificada en este repositorio).
- Razonamiento y respuesta a instrucciones, segun el ajuste instruct del modelo de origen.
- Generacion de codigo y matematicas: capacidad esperable en un modelo de 24B de la familia Mistral Small, no confirmada con datos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking explicito: no disponible.
- Vision: no confirmada; el modelo base Mistral Small 3.2 es multimodal, pero este repositorio no documenta el proyector multimodal.
- Comportamiento "uncensored": el ajuste heretic reduce los rechazos del modelo original, lo que constituye una capacidad diferencial respecto al base.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando respuestas con el Mistral Small 3.2 Instruct original en el mismo conjunto de prompts, en un entorno controlado y aislado.
- Inferencia local en estaciones de trabajo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de aproximadamente 24B en GPUs consumer de 24 GB de VRAM, util para prototipado offline sin dependencia de API.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o violentas, donde los rechazos del modelo alineado resultan un obstaculo, siempre con revision humana.
- Evaluacion de robustez de filtros: uso como modelo "red team" para probar clasificadores de contenido y sistemas de moderacion frente a un generador con menor tasa de rechazo.
- Despliegue en entornos air-gapped: al ser un artefacto GGUF autonomo, puede servirse con llama.cpp en infraestructura sin conexion, util en laboratorios con requisitos de confidencialidad.
- Experimentacion con cuantizacion extrema: las variantes IQ1_S, IQ1_M e IQ2 permiten medir la degradacion de calidad en regimenes de 1-2 bits por peso sobre un modelo de 24B, como referencia para estudios de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones del modelo cuantizado ni del modelo heretic de origen, y no se han proporcionado cifras de MMLU, HumanEval, GSM8K ni de perplexidad para ninguna de las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, segun el tamano nominal de 24B y la cuantizacion):
  - Q2_K / IQ2_XXS: aproximadamente 8-10 GB.
  - Q3_K_M / IQ3_M: aproximadamente 11-13 GB.
  - Q4_K_M / IQ4_XS: aproximadamente 14-16 GB.
  - Q5_K_M: aproximadamente 17-19 GB.
  - Q6_K: aproximadamente 20-22 GB.
  - Estos valores son estimaciones por regla general para modelos densos de 24B; no estan confirmados en la informacion proporcionada.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4 y Q5; A100 40 GB, H100 80 GB o L40S para Q6_K y para mayor contexto.
- Cabe en GPU consumer: previsiblemente si, en tarjetas de 16-24 GB con cuantizaciones Q3-Q4; en 12 GB solo con Q2 o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y servidores compatibles con GGUF (llama-cpp-python). vLLM y TGI no cargan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF | no disponible (nominal 24B) | no disponible | GGUF | no disponible | Objeto de esta ficha; variante heretic cuantizada |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 | 24B | no disponible en esta ficha | safetensors | no disponible en esta ficha | Modelo original alineado; referencia de comparacion |
| mradermacher/Mistral-Small-3.2-24B-Instruct-2506-Text-Only-heretic-i1-GGUF | no disponible (nominal 24B) | no disponible | GGUF | no disponible | Variante heretic solo texto del mismo autor de cuantizaciones |
| mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ultra-uncensored-heretic-GGUF | no disponible (nominal 24B) | no disponible | GGUF | no disponible | Variante heretic "ultra uncensored", mismo pipeline de cuantizacion |

## Limitaciones y advertencias

- El ajuste heretic elimina o reduce los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ilegal o sexualmente explicito sin filtros; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion y de respuestas confiadas pero incorrectas, agravado por las cuantizaciones de baja precision (IQ1, IQ2) que degradan la calidad respecto al modelo original.
- La licencia no esta declarada en el repositorio; no puede asumirse uso comercial permitido. Es necesario verificar la licencia del modelo de origen (Mistral Small 3.2) y del ajuste heretic antes de cualquier despliegue.
- El conteo de parametros reportado en safetensors (5.000.760) es incoherente con el nombre del modelo y no debe usarse para dimensionar hardware.
- El repositorio declara 0.0 GB de tamano y cero descargas, lo que sugiere que los ficheros pueden no estar disponibles o que los metadatos estan incompletos; conviene verificar la integridad de los GGUF antes de usarlos.
- No se declaran idiomas soportados; el rendimiento en castellano no esta verificado.
- No se confirma la preservacion del proyector multimodal; si se necesita vision, debe comprobarse la presencia de un fichero `mmproj` en el repositorio.
- El uso de cuantizaciones por debajo de Q4 puede producir degradacion notable en tareas de razonamiento, codigo y matematicas.
- La fecha de creacion del repositorio (2026-11-06) y la falta de actividad (0 likes, 0 descargas) implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-i1-GGUF
- Modelo de origen del ajuste heretic: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic
- Variante heretic solo texto del mismo autor de cuantizaciones: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-Text-Only-heretic-i1-GGUF
- Variante heretic "ultra uncensored": https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ultra-uncensored-heretic-GGUF
- Modelo base Mistral Small 3.2 24B Instruct 2506: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Repositorio llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
