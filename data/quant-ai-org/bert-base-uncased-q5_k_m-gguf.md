# quant-ai-org/bert-base-uncased-Q5_K_M-GGUF

## Resumen

`quant-ai-org/bert-base-uncased-Q5_K_M-GGUF` es una conversion al formato GGUF del modelo `google-bert/bert-base-uncased`, realizada por el usuario `quant-ai-org` mediante el espacio `GGUF-my-repo` de ggml.ai y la herramienta llama.cpp. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint original de BERT base (108.891.648 parametros, encoder transformer de 12 capas) empaquetado en un fichero GGUF con cuantizacion Q5_K_M, lo que reduce el peso en disco a aproximadamente 0,1 GB.

El modelo subyacente, BERT base uncased, es un encoder bidireccional publicado por Google en 2018 y entrenado sobre BookCorpus y Wikipedia en ingles. Su uso principal es la extraccion de caracteristicas y el fine-tuning para tareas de comprension del lenguaje (clasificacion, NER, QA extractiva, similitud semantica), no la generacion de texto autoregresiva. La relevancia de esta version GGUF es la posibilidad de ejecutar el encoder en entornos ligeros con llama.cpp sin depender de PyTorch ni de los pesos safetensors originales.

Conviene senalar que la model card es la plantilla automatica generada por el conversor de ggml.ai y no aporta informacion adicional sobre calidad, evaluacion o cambios respecto al original. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado ningun benchmark especifico de esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base) |
| Parametros totales | 108.891.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite estandar de BERT base; no confirmado en la model card de esta conversion) |
| Tipos de cuantizacion | Q5_K_M (unica variante publicada en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `bert-base-uncased-q5_k_m.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base: un encoder transformer de 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y 110 millones de parametros, con atencion bidireccional completa y objetivo de entrenamiento Masked Language Modeling (MLM) combinado con Next Sentence Prediction (NSP). El modelo original fue entrenado por Google sobre BookCorpus (800 millones de palabras) y Wikipedia en ingles (2.500 millones de palabras), con un vocabulario WordPiece de 30.522 tokens y sin distincion entre mayusculas y minusculas (uncased).

Esta publicacion concreta no introduce ningun cambio arquitectonico ni reentrenamiento: es una conversion de formato seguida de cuantizacion a Q5_K_M mediante llama.cpp. No hay informacion en la model card sobre el proceso exacto de conversion, la perdida de calidad respecto al checkpoint original ni sobre si se ha validado la fidelidad de las representaciones tras la cuantizacion. Tampoco se documenta RLHF, DPO ni ninguna fase de alineacion, algo esperable en un encoder de este tipo.

## Capacidades

- Extraccion de caracteristicas (feature extraction): genera embeddings contextuales de 768 dimensiones por token y representaciones agregadas ([CLS], mean pooling) utiles para similitud semantica, clustering y recuperacion.
- Clasificacion de secuencias: base para fine-tuning en analisis de sentimiento, deteccion de spam, clasificacion de topics y moderacion de contenido.
- Etiquetado de tokens (token classification): NER, POS tagging y otras tareas a nivel de token.
- Question answering extractiva: localizacion de spans de respuesta en un contexto dado (SQuAD-style).
- Masked language modeling: prediccion de tokens enmascarados, util para evaluacion y para tareas de relleno.
- No soporta generacion de texto autoregresiva, tool calling, function calling, agentes multi-paso ni modos de razonamiento extendido (thinking).
- No soporta vision, audio ni modalidades distintas del texto.
- Capacidad multilingue limitada: solo ingles de forma nativa.

## Casos de uso

- Busqueda semantica y recuperacion de documentos: usar los embeddings del encoder para indexar y comparar fragmentos de texto en ingles; el modelo cabe en cualquier maquina y la cuantizacion Q5_K_M reduce el coste de memoria en despliegues con muchos workers.
- Clasificacion de tickets de soporte: fine-tuning ligero sobre la cabeza de clasificacion para enrutar incidencias por categoria o urgencia en pipelines de atencion al cliente en ingles.
- Extraccion de entidades en documentos: NER sobre contratos, correos o articulos en ingles, con inferencia via llama.cpp en CPU si no hay GPU disponible.
- Moderacion de contenido en foros: clasificador binario o multiclase sobre texto en ingles, con latencia baja al ser un modelo de 110M parametros.
- Question answering sobre bases documentales: dado un contexto y una pregunta en ingles, localizar el span de respuesta; adecuado para FAQ internas y documentacion tecnica.
- Embeddings para sistemas RAG ligeros: generacion de vectores para un indice vectorial en entornos con recursos muy limitados (edge, contenedores pequenos, CI).
- Evaluacion y prototipado en investigacion: referencia rapida de BERT base en formato GGUF para experimentos que no requieran el checkpoint completo en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de MMLU, GLUE, SQuAD, HumanEval ni ninguna otra, y tampoco se documenta la degradacion de calidad introducida por la cuantizacion Q5_K_M respecto al checkpoint original de `google-bert/bert-base-uncased`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q5_K_M (el repo completo ocupa 0,1 GB); el modelo puede residir en RAM/VRAM de forma holgada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una GTX 1650, RTX 3060 o incluso una iGPU son viables.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1-2 GB de memoria libre, y tambien en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, cualquier runtime que lo soporte (Ollama, llama-cpp-python, entre otros). No se ha validado su uso con vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser un encoder de 110M parametros, se espera latencia muy baja en CPU y GPU, pero no hay mediciones publicadas para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `quant-ai-org/bert-base-uncased-Q5_K_M-GGUF` | 108,9 M | 512 (estandar BERT) | GGUF Q5_K_M | Apache 2.0 | Conversion no oficial de BERT base |
| `google-bert/bert-base-uncased` | 108,9 M | 512 | safetensors / PyTorch | Apache 2.0 | Checkpoint original, referencia de calidad |
| `distilbert-base-uncased` | 66 M | 512 | safetensors / PyTorch | Apache 2.0 | Version destilada, mas rapida, algo menos precisa |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22 M | 256 | safetensors / PyTorch | Apache 2.0 | Optimizado para embeddings y similitud semantica |

La comparativa se limita a modelos de la misma familia o proposito (encoders en ingles de tamano pequeno). No hay datos de rendimiento publicados para esta conversion GGUF que permitan comparar metricas de calidad frente a las alternativas.

## Limitaciones y advertencias

- Solo ingles: no es adecuado para texto en castellano u otros idiomas sin fine-tuning adicional.
- No es un modelo generativo: no debe usarse para completar texto, chatear ni como sustituto de un LLM; su salida natural son representaciones o etiquetas.
- Riesgo de sesgos: BERT base hereda los sesgos de BookCorpus y Wikipedia en ingles (genero, raza, profesion, etc.); no se ha realizado ninguna mitigacion en esta conversion.
- Riesgo de alucinacion: bajo en el sentido generativo, pero puede producir predicciones erroneas con alta confianza en tareas de clasificacion o QA si se usa fuera de dominio.
- Cuantizacion no validada: no hay evidencia publicada de la fidelidad de las representaciones tras Q5_K_M; para tareas sensibles a la precision (similitud semantica fina) conviene comparar contra el checkpoint original.
- Repositorio sin traccion: 0 descargas y 0 likes; no hay garantia de mantenimiento ni de soporte por parte del autor.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribucion del modelo original de Google.
- Limite de contexto de 512 tokens: insuficiente para documentos largos sin troceado previo.
- La model card es una plantilla automatica; no documenta el proceso de conversion ni posibles incidencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/quant-ai-org/bert-base-uncased-Q5_K_M-GGUF
- Modelo base original: https://huggingface.co/google-bert/bert-base-uncased
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
