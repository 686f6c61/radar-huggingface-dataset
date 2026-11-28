# mradermacher/Inkling-2-Mini-LV-i1-GGUF

## Resumen

Inkling-2-Mini-LV-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base Inkling-2-Mini-LV, publicado por el usuario svensziglevics. El modelo subyacente cuenta con 26.070.385.152 parametros (aproximadamente 26.000 millones) segun los datos de safetensors, lo que lo situa en la categoria de modelos de tamano medio-grande orientados a inferencia local y despliegue en entornos con recursos limitados. La cuantizacion se ha realizado con el metodo imatrix (importance matrix), una tecnica que pondera la perdida de precision segun la importancia de cada tensor para preservar la calidad del modelo original en bitrates bajos.

El repositorio incluye un conjunto amplio de variantes de cuantizacion que abarcan desde IQ1_S e IQ1_M (las mas agresivas, en torno a 1 bit por parametro) hasta Q6_K y Q4_K_M, pasando por toda la familia IQ2, IQ3, Q4 e IQ5. Esta gradacion permite elegir el equilibrio entre tamano en disco, consumo de VRAM y fidelidad de salida, algo especialmente relevante para modelos de 26B que no caben en GPUs de consumo con cuantizaciones altas. El repo ocupa 39,9 GB en total, lo que refleja la suma de todas las variantes publicadas.

La relevancia de esta ficha radica en que facilita la evaluacion rapida de un modelo del que no se dispone de model card detallada en la informacion proporcionada: no hay datos sobre arquitectura, contexto, licencia ni idiomas, por lo que el desarrollador debe tratarlo con cautela y verificar el modelo base antes de usarlo en produccion. La existencia de tags como `endpoints_compatible` e `imatrix` sugiere compatibilidad con infraestructuras de inferencia tipo Hugging Face Endpoints y que las cuantizaciones se generaron con matriz de importancia, pero no se confirma ningun detalle adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (aprox. 26B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small), Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 39,9 GB (conjunto de todas las cuantizaciones) |
| Metodo de cuantizacion | imatrix / weighted (importancia por tensor) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Inkling-2-Mini-LV en los datos proporcionados. El nombre del modelo sugiere una variante "Mini" de una familia denominada Inkling, con el sufijo "LV" que podria indicar una especializacion (posiblemente vision-lenguaje o una variante de bajo volumen), pero esto no se confirma en la informacion disponible. Tampoco se conocen el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar.

Lo unico verificable tecnicamente es el proceso de cuantizacion: mradermacher ha generado las variantes GGUF con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, empleando cuantizacion ponderada por matriz de importancia (imatrix). Este metodo calcula la sensibilidad de cada tensor a la cuantizacion usando un corpus de calibracion y asigna mas bits a los tensores criticos, lo que mejora la perplejidad de las variantes IQ frente a las cuantizaciones K tradicionales a igual tamano. No se especifica el corpus de calibracion ni el numero de muestras usado.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno, aunque no se detalla el formato de plantilla de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que las cuantizaciones pueden servirse mediante infraestructura de Hugging Face Endpoints o motores compatibles con GGUF.
- Razonamiento y codigo: no confirmado en la informacion disponible; debe verificarse contra el modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): el sufijo "LV" podria sugerir vision-lenguaje, pero no se confirma.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU unica: las variantes Q4_K_M e IQ4_XS de un modelo de 26B ocupan aproximadamente 15-16 GB, lo que permite ejecutarlas en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090, usando llama.cpp u Ollama con offload parcial o total.
- Servicio de chat conversacional en servidor: la variante Q5_K_M o Q6_K, servida con llama.cpp server o vLLM (si soporta GGUF), permite atender conversaciones multi-turno con mayor fidelidad al modelo original, a costa de mas VRAM (en torno a 19-22 GB).
- Prototipado rapido en CPU: las variantes IQ2_M o Q3_K_M, con tamanos estimados de 10-13 GB, permiten ejecutar el modelo en CPU con RAM suficiente para pruebas de concepto y evaluacion de calidad antes de invertir en GPU.
- Evaluacion comparativa de cuantizaciones: el amplio catalogo del repo (mas de 20 variantes) permite medir la degradacion de perplejidad y calidad de generacion entre bitrates, util para decidir el punto de equilibrio en un pipeline de produccion.
- Fine-tuning ligero sobre el modelo base: aunque las GGUF no son directamente entrenables, el modelo base en safetensors puede usarse para LoRA/QLoRA y luego recuantizarse con imatrix siguiendo el mismo flujo del autor.
- Integracion en aplicaciones de escritorio: al ser GGUF, el modelo puede empaquetarse en aplicaciones tipo LM Studio, Jan o GPT4All, ofreciendo inferencia offline sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 26B, estimaciones orientativas segun bitrate):
  - IQ1_S / IQ1_M: aproximadamente 6-8 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: aproximadamente 8-11 GB.
  - Q3_K_S / Q3_K_M / IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: aproximadamente 11-14 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / IQ4_NL: aproximadamente 14-17 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 17-19 GB.
  - Q6_K: aproximadamente 20-22 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4 y Q5; A100 40/80 GB o H100 para Q6_K y para servir varias instancias en paralelo.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con IQ2/IQ3 o Q4 con offload parcial a RAM.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, Jan, GPT4All; vLLM y TGI solo si soportan GGUF en la version desplegada.
- Latencia y throughput: no disponibles; dependen de la GPU, del numero de capas offloaded y de la variante de cuantizacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni caracteristicas del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria (por ejemplo, modelos de 24-27B en GGUF). Se recomienda consultar la model card del modelo base `svensziglevics/Inkling-2-Mini-LV` antes de establecer comparaciones.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se declaran licencia, idiomas, contexto ni arquitectura, lo que impide garantizar el cumplimiento legal en uso comercial. Verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks publicados, no puede estimarse la tasa de errores facticos.
- Degradacion por cuantizacion: las variantes IQ1 e IQ2, aunque generadas con imatrix, sufren perdida de calidad notable frente al modelo en safetensors; no se recomiendan para tareas de razonamiento complejo o generacion de codigo en produccion.
- Idiomas no declarados: no puede confirmarse un buen rendimiento en castellano ni en otros idiomas distintos del ingles (si el modelo base estuviera centrado en ingles).
- Ambiguedad del sufijo "LV": si implicara capacidades de vision, las cuantizaciones GGUF podrian no incluir el proyector multimodal (el autor menciona `skip_mmproj` como parametro, pero no se especifica si se aplico); verificar antes de asumir capacidades multimodales.
- Modelo base de autor unico: `svensziglevics/Inkling-2-Mini-LV` no es un modelo de un laboratorio consolidado, por lo que la trazabilidad de datos de entrenamiento y la robustez frente a sesgos son inciertas.
- Fecha de creacion futura (2026-11-28): el repositorio aparece con fecha posterior a la actual, lo que puede indicar un error de metadatos o un artefacto de la plataforma; conviene verificar la integridad de los archivos antes de descargarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-LV-i1-GGUF
- Modelo base: https://huggingface.co/svensziglevics/Inkling-2-Mini-LV
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Documentacion de llama.cpp (motor de inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Documentacion de Ollama: https://ollama.com
- Paper de cuantizacion con imatrix (referencia general): https://github.com/ggerganov/llama.cpp/discussions/5263
