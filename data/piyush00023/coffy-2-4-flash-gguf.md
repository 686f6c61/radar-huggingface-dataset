# Piyush00023/coffy-2.4-flash-GGUF

## Resumen

coffy-2.4-flash-GGUF es la distribucion cuantizada en formato GGUF del modelo coffy-2.4-flash, un modelo de lenguaje de 2.842.192.512 parametros (2,84B) publicado por el desarrollador Piyush00023. Segun la model card, se trata de un modelo de arquitectura Sparse Mixture-of-Experts (MoE) orientado a inteligencia de codigo y flujos de trabajo agenticos, con capacidades declaradas para ingles y codigo. El repositorio ofrece nueve variantes de cuantizacion, desde FP16/BF16 de referencia (5,68 GB) hasta formatos ternarios extremos TQ1_0 (0,61 GB), pensados para ejecutarse con llama.cpp, Ollama o LM Studio.

La relevancia practica de esta ficha es limitada y conviene ser explicito: la propia model card advierte de que los pesos recuperados de 2,84B generan texto no coherente, porque la tabla de embeddings tiene 2048 filas mientras que el vocabulario del tokenizador es de 248k tokens. Ademas, los metadatos embebidos en los ficheros GGUF (32 capas y valores de la release original) no coinciden con los pesos restaurados. Es, por tanto, un artefacto con problemas conocidos de integridad, no un modelo listo para produccion.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento, el proceso de alineamiento ni resultados de benchmarks. La licencia declarada es Apache-2.0, si bien la model card matiza que se trata de "open weights, not open source".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE), transformer; numero de capas no disponible (los metadatos GGUF indican 32, no coincidentes con los pesos) |
| Parametros totales | 2.842.192.512 (2,84B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, BF16, Q8_0, Q5_1, Q5_0, Q4_1, MXFP4, TQ2_0 (ternaria 2-bit), TQ1_0 (ternaria 1-bit) |
| Idiomas soportados | ingles (en) y codigo |
| Licencia | Apache-2.0 (open weights, no open source segun el autor) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La model card describe coffy-2.4-flash como un modelo fundacional de 2,84B parametros con arquitectura Sparse Mixture-of-Experts, orientado a codigo y flujos agenticos. No se especifican el numero de expertos, el numero de expertos activos por token, la dimension oculta, el numero de cabezas de atencion ni la funcion de activacion. Tampoco se detalla el volumen de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o instruction tuning.

El dato tecnico mas relevante es negativo: la tabla de embeddings de los pesos recuperados tiene 2048 filas frente a un vocabulario de tokenizador de 248k tokens, lo que rompe la correspondencia entre tokens y representaciones y explica la generacion no coherente. Los metadatos internos de los GGUF conservan valores de la release original (32 capas) que no describen los pesos restaurados. No se documenta ninguna innovacion adicional como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto: declarada en el pipeline `text-generation`, aunque en la practica la salida de los pesos recuperados es no coherente segun el propio autor.
- Codigo: el modelo se posiciona para inteligencia de codigo, pero no se aportan ejemplos, evaluaciones ni formatos de prompt verificados.
- Flujos agenticos: la model card menciona "agentic workflows" sin detallar soporte real de tool calling ni function calling.
- Multilingue: solo ingles y codigo; no se declara soporte de castellano ni de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ejecucion local: compatible con runtimes GGUF (llama.cpp, Ollama, LM Studio, llama-cpp-python), lo que permite desplegarlo en hardware de consumo.

## Casos de uso

- Evaluacion de la viabilidad de un MoE pequeno en local: sirve para medir el coste de carga y la velocidad de inferencia de un MoE de 2,84B en formatos Q4_1 o Q5_0 con llama.cpp, aunque no para evaluar calidad.
- Pruebas de integracion de pipelines GGUF: util para validar el soporte de cuantizaciones ternarias (TQ1_0, TQ2_0) y MXFP4 en herramientas de despliegue antes de adoptarlas con modelos en produccion.
- Benchmarking de infraestructura: permite comparar throughput y consumo de VRAM entre cuantizaciones sobre el mismo artefacto, siempre que se acepte que la calidad de salida no es representativa.
- Docencia y divulgacion sobre cuantizacion: ejemplo didactico de como un desajuste entre vocabulario del tokenizador y tabla de embeddings degrada la generacion, y de por que los metadatos GGUF deben verificarse.
- Prototipado de interfaces de chat locales: valido para probar la ergonomia de Ollama o LM Studio con un fichero pequeno (0,61-1,78 GB), sin expectativa de respuestas utiles.
- Archivado y reproducibilidad: conserva builds historicos de un modelo retirado, util para quien necesite reproducir el estado exacto de la release original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no se reclaman resultados de benchmark para esta release.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB para TQ1_0, 1,0 GB para TQ2_0, 1,6 GB para MXFP4, 1,9 GB para Q4_1, 2,2 GB para Q5_1 y 3,2 GB para Q8_0, asumiendo pesos mas overhead de contexto y cache KV (no cuantificado en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para las cuantizaciones de 4 bits o inferiores; para FP16/BF16 (5,68 GB) se recomienda al menos 8 GB de VRAM.
- Cabe en GPU consumer: si, practicamente en todas las tarjetas actuales (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) e incluso en CPU con llama.cpp para los formatos ternarios.
- Opciones de despliegue: llama.cpp (llama-cli, llama-cpp-python), Ollama, LM Studio y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo que permitan una comparacion cuantitativa fiable. Se ofrece una comparacion estructural con alternativas de tamano y formato comparables.

| Modelo | Parametros | Contexto | Formato GGUF | Licencia | Estado |
|---|---|---|---|---|---|
| coffy-2.4-flash-GGUF | 2,84B (MoE) | no disponible | Si (9 variantes) | Apache-2.0 | Pesos con generacion no coherente declarada |
| Qwen2.5-Coder-3B-Instruct | 3B (denso) | 32k | Si | Apache-2.0 | Modelo funcional para codigo |
| Llama-3.2-3B-Instruct | 3B (denso) | 128k | Si | Llama 3.2 Community License | Modelo funcional generalista |
| Phi-3.5-mini-instruct | 3,8B (denso) | 128k | Si | MIT | Modelo funcional generalista |

La comparacion relevante no es de rendimiento sino de utilidad: las alternativas citadas son modelos verificados y desplegables, mientras que coffy-2.4-flash-GGUF presenta un fallo de integridad reconocido por su autor que impide su uso como generador de texto.

## Limitaciones y advertencias

- Generacion no coherente: la model card reconoce que los pesos recuperados de 2,84B generan salida no coherente por el desajuste entre la tabla de embeddings (2048 filas) y el vocabulario del tokenizador (248k tokens).
- Metadatos inconsistentes: los GGUF embebidos conservan valores de la release original (32 capas) que no describen los pesos restaurados; no deben usarse para configurar el runtime.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que respalde las capacidades declaradas de codigo o agenticas.
- Idiomas: solo ingles y codigo; no hay soporte declarado de castellano.
- Licencia: Apache-2.0 permite uso comercial, pero el autor matiza "open weights, not open source"; conviene revisar el fichero LICENSE del repositorio antes de un uso en produccion.
- Riesgo de alucinacion: no evaluable, dado que la salida ya es no coherente de base.
- Adopcion nula: cero descargas y cero likes en el momento de la ficha, sin senales de validacion por parte de la comunidad.
- Recomendacion: no usar en produccion ni en evaluaciones de calidad; emplear solo como artefacto de estudio o para pruebas de infraestructura.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Piyush00023/coffy-2.4-flash-GGUF
- Modelo base: https://huggingface.co/Piyush00023/coffy-2.4-flash
- Seccion de arquitectura del modelo base: https://huggingface.co/Piyush00023/coffy-2.4-flash#architecture
- Seccion de limitaciones del modelo base: https://huggingface.co/Piyush00023/coffy-2.4-flash#limitations
- Licencia: https://huggingface.co/Piyush00023/coffy-2.4-flash-GGUF/blob/main/LICENSE
- Contacto del autor: piyushdas000@gmail.com
