# mradermacher/Lightricks-gemma-3-12b-it-qat-q4_0-unquantized-i1-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo Lightricks-gemma-3-12b-it-qat-q4_0-unquantized, una variante desquantizada del checkpoint Gemma 3 12B instruction-tuned que Lightricks publico originalmente con cuantizacion QAT a Q4_0. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de quants GGUF en Hugging Face, y utiliza la tecnica de imatrix (importance matrix) para generar variantes i1 con mejor relacion calidad/tamano que los quants estaticos equivalentes.

El modelo subyacente es un transformer denso de Gemma 3 con 11.766.034.176 parametros (aproximadamente 12B), desarrollado originalmente por Google DeepMind y afinado por Lightricks para instrucciones. La relevancia de esta publicacion reside en que ofrece el modelo en formatos GGUF listos para llama.cpp, Ollama y otros runners de inferencia local, con un rango de cuantizaciones que va desde 3,0 GB (IQ1_S) hasta 7,0 GB (Q4_K_S), lo que permite ejecutarlo en hardware de consumo.

La ficha describe las caracteristicas tecnicas del checkpoint, sus capacidades esperadas por herencia de la familia Gemma 3, los escenarios de uso practicos y las limitaciones derivadas de la cuantizacion agresiva y de la licencia Gemma. No se dispone de resultados de benchmarks especificos publicados para esta variante cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 3), decoder-only |
| Parametros totales | 11.766.034.176 (~11,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S (imatrix) |
| Idiomas soportados | en (segun la model card; Gemma 3 soporta mas idiomas, pero no se declara aqui) |
| Licencia | gemma (Gemma Terms of Use, con gating en Hugging Face) |
| Formato de pesos | GGUF (multiples ficheros por quant); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 3 con aproximadamente 11,8 mil millones de parametros, afinado para instrucciones (it) por Lightricks sobre el checkpoint Gemma 3 12B de Google. El checkpoint original de Lightricks aplica Quantization-Aware Training (QAT) a Q4_0, lo que permite que el modelo mantenga calidad cercana a FP16 cuando se ejecuta en esa precision de 4 bits. Este repositorio parte de la version "unquantized" de ese checkpoint, es decir, los pesos ya desquantizados a un formato de mayor precision, y vuelve a cuantizarlos con llama.cpp usando imatrix.

La innovacion tecnica principal de esta publicacion es el uso de una importance matrix (imatrix) generada a partir de un corpus de calibracion, que guia la asignacion de bits por tensor y mejora la perplejidad de los quants i1 frente a los quants estaticos del mismo tamano. El autor indica explicitamente que los IQ-quants suelen ser preferibles a quants no-IQ de tamano similar. No se proporciona informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO en la model card de este repositorio; esos datos corresponden a la documentacion oficial de Gemma 3, que no se incluye aqui.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de instrucciones de Gemma 3 12B IT.
- Razonamiento y respuesta a preguntas en ingles, con calidad dependiente del quant elegido.
- Generacion de codigo y explicaciones tecnicas, propia de la familia Gemma 3.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: la model card solo declara `en`; Gemma 3 soporta mas idiomas pero no se garantiza en esta variante.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada; el repositorio solo contiene pesos de lenguaje en GGUF.

## Casos de uso

- Inferencia local en portatil con GPU de consumo: usar el quant i1-Q4_K_S (7,0 GB) en una RTX 3060 de 12 GB o superior permite ejecutar el modelo completo en VRAM con llama.cpp u Ollama, sin depender de la nube.
- Prototipado rapido de asistentes conversacionales en ingles: el quant i1-IQ3_M (5,8 GB) ofrece un equilibrio razonable entre calidad y huella de memoria para iterar sobre prompts y plantillas de chat.
- Despliegue en servidores sin GPU dedicada: los quants IQ2 (3,6-4,4 GB) permiten ejecucion en CPU con llama.cpp, adecuados para tareas de generacion de texto de baja latencia y no criticas.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye toda la escalera de quants, lo que facilita medir la degradacion de perplejidad y calidad entre IQ1_S y Q4_K_S sobre el mismo checkpoint.
- Generacion de codigo asistida en entornos offline: con el quant Q4_K_S y una plantilla de chat adecuada, el modelo puede usarse como autocompletado o explicador de codigo en herramientas que consuman GGUF (por ejemplo, extensiones de VS Code basadas en llama.cpp).
- Filtrado y resumen de documentos en ingles: el contexto disponible (no declarado en esta ficha) y el tamano moderado permiten procesar articulos y correos en pipelines por lotes con Ollama o llama-cpp-python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante cuantizada. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad por quant.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,0 GB (IQ1_S), 3,6-4,4 GB (IQ2), 4,9-6,6 GB (IQ3), 6,7-7,0 GB (IQ4 y Q4), mas overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando quants IQ2 o IQ3; los quants Q4_K_S requieren 8-10 GB libres para contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio, text-generation-webui y otros runners compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del quant, del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lightricks-gemma-3-12b-it-qat-q4_0-unquantized-i1-GGUF (este) | ~11,8B | no disponible | gemma | GGUF (i1, imatrix) | Quants de 3,0 a 7,0 GB; gating en HF |
| mradermacher/Lightricks-gemma-3-12b-it-qat-q4_0-unquantized-GGUF | ~11,8B | no disponible | gemma | GGUF (estaticos) | Mismo checkpoint, quants sin imatrix |
| Gemma 3 12B IT original (google/gemma-3-12b-it) | ~12B | no disponible | gemma | safetensors | Requiere GPU de mayor VRAM; sin cuantizar |
| Mistral 7B Instruct (referencia de tamano similar) | ~7,2B | no disponible | Apache 2.0 | safetensors, GGUF | Menor tamano y licencia mas permisiva, pero menos parametros |

## Limitaciones y advertencias

- Los quants IQ1 e IQ2 degradan notablemente la calidad; el propio autor etiqueta IQ1_S como "for the desperate" y IQ2_K_S como "very low quality". No son adecuados para produccion.
- El modelo solo declara ingles en la model card; el rendimiento en castellano no esta garantizado y puede degradarse con la cuantizacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 12B, agravado en quants de baja precision.
- La licencia Gemma impone restricciones de uso comercial y requiere aceptar los terminos de Google; el acceso al repo esta sujeto a gating.
- La cuantizacion QAT original a Q4_0 y la posterior desquantizacion y recuantizacion con imatrix pueden introducir perdidas acumuladas respecto al modelo FP16 de referencia.
- No se dispone de datos de contexto maximo, benchmarks ni evaluaciones de sesgo para esta variante concreta; conviene validar el comportamiento en el dominio de uso antes de desplegar.
- El repositorio ocupa 112,2 GB por incluir todos los quants; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lightricks-gemma-3-12b-it-qat-q4_0-unquantized-i1-GGUF
- Modelo base: https://huggingface.co/ibyteohdear/Lightricks-gemma-3-12b-it-qat-q4_0-unquantized
- Quants estaticos del mismo checkpoint: https://huggingface.co/mradermacher/Lightricks-gemma-3-12b-it-qat-q4_0-unquantized-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Lightricks-gemma-3-12b-it-qat-q4_0-unquantized-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
