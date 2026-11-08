# prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF es una cuantizacion en formato GGUF del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario prithivMLmods. El modelo subyacente es una version "decensored" (abliterated) del fine-tune de razonamiento Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez parte de Qwen3.5-9B y fue destilado de DeepSeek-V4-Pro en modo Max Effect sobre aproximadamente 250.000 muestras de matematicas y STEM. La ablacion se realizo con Heretic v2.0.0.dev0 mediante Arbitrary-Rank Ablation en las capas 9 a 24.

El resultado es un modelo de 9.197.093.888 parametros (9B) con licencia Apache 2.0, orientado a generacion de texto con razonamiento explicito, matematicas y STEM, y sin datos de codigo en su entrenamiento. Esta ficha cubre la variante GGUF, que anade soporte de Multi-Token Prediction (MTP) para decodificacion especulativa integrada en los propios pesos, y un fichero de proyeccion multimodal (mmproj) que habilita entrada de imagen, aunque la model card no documenta el entrenamiento de vision.

La relevancia de esta publicacion es doble: por un lado, ofrece un modelo de razonamiento matematico de 9B ejecutable en hardware de consumo gracias a las cuantizaciones K-quant; por otro, incorpora MTP GGUF, un formato que acelera la inferencia local sin necesidad de un modelo borrador separado. Conviene senalar que el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y que la propia model card advierte de que los benchmarks publicados corresponden al modelo original, no a esta version decensored.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B) con cabezales MTP para decodificacion especulativa; incluye proyector multimodal (mmproj) |
| Parametros totales | 9.197.093.888 (9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); existen variantes NVFP4-GPTQ y NVFP4-GPTQ-GGUF en repos separados |

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de Qwen3.5-9B, con 9.197.093.888 parametros. El modelo original de Jackrong se entreno en dos fases: primero SFT y despues una etapa ligera de RL con GSPO, sobre aproximadamente 250.000 muestras de matematicas y STEM destiladas de DeepSeek-V4-Pro en modo Max Effect. No se incluyeron datos de codigo. La model card del original reporta que el modelo emplea un 36% menos de tokens de razonamiento por respuesta correcta que Qwen3.5-9B.

Sobre esa base, xtools-at aplico Heretic v2.0.0.dev0 con Arbitrary-Rank Ablation en las capas 9 a 24 para eliminar el comportamiento de rechazo, con una divergencia KL de 0.0422 respecto al original y una reduccion de rechazos de 100/100 a 3/100 segun la model card. Esta variante GGUF anade ademas Multi-Token Prediction: cabezales adicionales en la arquitectura principal que predicen varios tokens futuros en un unico forward pass, lo que permite decodificacion especulativa sin modelo borrador externo. El fichero mmproj-bf16 (922 MB) sugiere capacidad de entrada de imagen, aunque la informacion disponible no detalla el entrenamiento multimodal.

## Capacidades

- Generacion de texto y razonamiento explicito, con modo de pensamiento orientado a problemas de matematicas y STEM.
- Razonamiento matematico: el modelo original reporta 94,50% en GSM8K (media de cuatro ejecuciones, NVFP4 sobre vLLM).
- Conocimiento STEM: 90,53% de media en una muestra de 1.500 preguntas de MMLU-Pro de matematicas, fisica y quimica.
- Tool calling y function calling (etiquetas tool-use y function-calling), aunque la model card califica las mejoras en esta area como pequenas y preliminares.
- Cumplimiento de formato de salida: respuesta de una sola letra el 97,2% de las veces frente al 37,3% de Qwen3.5-9B.
- Decodificacion especulativa mediante MTP integrado en los pesos.
- Entrada de imagen a texto segun el pipeline declarado (image-text-to-text) y el fichero mmproj, sin documentacion adicional disponible.
- Multilingue: limitado a ingles segun el campo language.
- Comportamiento decensored: rechazos reducidos a 3/100 segun la model card del autor de la ablacion.

## Casos de uso

- Resolucion de problemas matematicos por lotes: el modelo puede procesar enunciados de algebra, calculo o fisica y devolver la respuesta en formato estricto de una sola letra, lo que facilita la evaluacion automatica y el parseo en pipelines de correccion.
- Tutoria STEM interactiva: con razonamiento explicito y menor consumo de tokens por respuesta correcta, es adecuado para entornos donde el coste por consulta importa, como plataformas educativas con volumen alto.
- Generacion de explicaciones paso a paso para material didactico: el modo de razonamiento permite producir derivaciones intermedias que un humano puede revisar antes de publicar.
- Evaluacion comparativa de modelos en local: al caber en GPU de consumo en Q4_K_M (5,78 GB), sirve para pruebas de regresion de pipelines de razonamiento sin depender de API externa.
- Investigacion sobre alineacion y abliteration: la version heretic permite estudiar el efecto de la ablacion sobre el comportamiento de rechazo con una divergencia KL medida de 0.0422 respecto al original.
- Despliegue en estaciones de trabajo con GPU Blackwell: las variantes NVFP4-GPTQ estan pensadas para SM120, GB202, B200 y B300, lo que permite servir el modelo con cuantizacion de 4 bits nativa.
- Prototipado de asistentes con entrada de imagen: el fichero mmproj habilita experimentar con consultas image-text-to-text en llama.cpp, siempre que se valide la calidad real de la componente visual.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B), no a esta version decensored ni a la cuantizacion GGUF.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| GSM8K | 94,50% | Media de cuatro ejecuciones, NVFP4 sobre vLLM |
| MMLU-Pro (Math/Physics/Chemistry) | 90,53% de media | Muestra de 1.500 preguntas |
| Delta frente a Qwen3.5-9B (MMLU-Pro) | +0,93 puntos | Misma muestra |
| Cumplimiento de formato (respuesta de una letra) | 97,2% | Frente a 37,3% de Qwen3.5-9B |
| Tokens de razonamiento por respuesta correcta | -36% | Frente a Qwen3.5-9B |

No se han publicado resultados de benchmarks de esta version decensored ni de las cuantizaciones GGUF en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB en Q4_K_S, 5,8 GB en Q4_K_M, 6,6 GB en Q5_K_M, 7,6 GB en Q6_K, 9,8 GB en Q8_0 y 18,4 GB en BF16. Hay que sumar el fichero mmproj (922 MB) si se usa la entrada de imagen y el espacio de cache KV segun el contexto configurado.
- GPU recomendadas: cualquier GPU con 8 GB o mas para cuantizaciones Q4 y Q5 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); 12-16 GB para Q6_K y Q8_0; A100 y H100 para BF16 y despliegues concurrentes.
- Cabe en GPU de consumo: si, en Q4_K_M desde 6 GB de VRAM. Las variantes NVFP4-GPTQ estan orientadas a NVIDIA Blackwell (SM120, GB202, B200, B300).
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, text-generation-inference (etiqueta presente), transformers, vLLM (usado para los benchmarks del original con NVFP4) y endpoints compatibles.
- Latencia y throughput: no disponible. El MTP integrado esta disenado para acelerar la generacion local mediante decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este, GGUF) | 9B | no disponible | Sin benchmarks propios; base original: 94,50% GSM8K | Apache 2.0 | GGUF, NVFP4-GPTQ, NVFP4-GPTQ-GGUF |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (original) | 9B | no disponible | 94,50% GSM8K; 90,53% MMLU-Pro Math/Physics/Chemistry | Apache 2.0 | Pesos completos en Hugging Face |
| Qwen3.5-9B (base) | 9B | no disponible | 0,93 puntos por debajo en la muestra MMLU-Pro citada; 37,3% de cumplimiento de formato | no disponible en la informacion | Hugging Face |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF | 9B | no disponible | Sin benchmarks publicados | Apache 2.0 (heredada) | GGUF alternativo del mismo modelo base |

## Limitaciones y advertencias

- Los benchmarks citados corresponden al modelo original, no a esta version decensored; la ablacion puede degradar el rendimiento en matematicas y STEM y no se ha medido publicamente.
- La model card del autor de la ablacion reporta una divergencia KL de 0.0422 respecto al original, lo que implica cambios de distribucion que pueden afectar a la coherencia en dominios especializados.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni de calibracion; el modo de razonamiento explicito no garantiza correccion.
- La eliminacion de rechazos (3/100) implica que el modelo puede generar contenido danino, sesgado o inapropiado sin filtro; no es apto para produccion orientada al publico sin moderacion externa.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Sin datos de codigo en el entrenamiento, segun la model card del original; las mejoras en tool calling se describen como pequenas y preliminares.
- Longitud de contexto no documentada en la informacion disponible; no se puede planificar un despliegue con contexto largo sin verificacion previa.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de una version abliterated conlleva riesgo reputacional y legal segun la jurisdiccion y el caso de uso.
- Repositorio con 0 descargas y 1 like: no hay validacion de la comunidad ni evidencia de que las cuantizaciones funcionen correctamente en todos los backends.
- La model card advierte de que es un modelo de comunidad y que las salidas requieren verificacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Variante NVFP4-GPTQ: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ
- Variante NVFP4-GPTQ-GGUF: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ-GGUF
- Modelo base decensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo original de razonamiento: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Cuantizacion GGUF alternativa: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
