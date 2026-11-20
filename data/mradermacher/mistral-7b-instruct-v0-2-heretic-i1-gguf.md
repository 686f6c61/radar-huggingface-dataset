# mradermacher/mistral-7b-instruct-v0.2-heretic-i1-GGUF

## Resumen

El modelo `mradermacher/mistral-7b-instruct-v0.2-heretic-i1-GGUF` es una cuantizacion GGUF con imatrix generada por mradermacher a partir de `Ananasez/mistral-7b-instruct-v0.2-heretic`, un fine-tuning de Mistral 7B Instruct v0.2 en el que se ha aplicado una tecnica de "abliteration" o decensurado (etiquetada como *heretic*, *uncensored*, *abliterated*). El objetivo es eliminar o atenuar los rechazos y filtros de seguridad del modelo original sin reentrenar desde cero, manteniendo la capacidad conversacional de la base.

El modelo base conserva la arquitectura transformer decoder-only de Mistral 7B, con 7.241.732.096 parametros totales (segun los safetensors del modelo original) y una ventana de contexto de 32.768 tokens, caracteristica de Mistral 7B v0.2. El repositorio pesa 81,7 GB porque incluye mas de veinte variantes de cuantizacion en formato GGUF, desde IQ1_S (1,7 GB) hasta Q6_K (6,0 GB), pensadas para despliegue en CPU o GPU con llama.cpp y derivados.

Su relevancia practica es acotada: se trata de un artefacto de cuantizacion, no de un modelo nuevo. Resulta util para quien quiera ejecutar localmente una variante de Mistral 7B Instruct sin los mecanismos de rechazo del modelo alineado, en ingles, con licencia Apache 2.0 y en formatos optimizados para hardware modesto. No incorpora mejoras de arquitectura ni de entrenamiento respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B v0.2) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral 7B Instruct v0.2) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B Instruct v0.2: un transformer decoder-only con atencion de ventana deslizante (sliding window attention) y 32.768 tokens de contexto. Sobre esa base, `Ananasez/mistral-7b-instruct-v0.2-heretic` aplica una modificacion del tipo *abliteration*, que consiste en identificar y suprimir direcciones de activacion asociadas a la negativa a responder, sin un reentrenamiento completo con datos nuevos. Los tags del repositorio indican *finetuned*, *uncensored*, *decensored*, *abliterated* y *reproducible*.

Este repositorio concreto no aporta entrenamiento adicional: mradermacher ha generado cuantizaciones ponderadas con fichero imatrix (`.imatrix.gguf`) a partir del modelo base, siguiendo su flujo habitual de `quantize_version: 2` y `output_tensor_quantised: 1`. No se dispone de informacion sobre el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO en el fine-tuning original, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, heredada de Mistral 7B Instruct v0.2.
- Razonamiento basico y respuesta a instrucciones; el modelo base esta optimizado para seguir instrucciones.
- Generacion de codigo y tareas de matematicas sencillas, dentro de los limites de un modelo de 7B.
- Comportamiento sin rechazos en temas que el modelo alineado original evitaria, por la ablacion aplicada.
- Soporte de plantilla de chat Mistral (`[INST] ... [/INST]`) mediante `mistral-common`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso

- Inferencia local en equipos de sobremesa: las variantes Q4_K_M (4,5 GB) e IQ4_XS (4,0 GB) permiten ejecutar el modelo en GPUs consumer con 6-8 GB de VRAM o en CPU con llama.cpp, sin depender de servicios en la nube.
- Experimentacion con alineacion y seguridad: util para investigadores que estudian el efecto de la abliteration comparando respuestas con el Mistral 7B Instruct v0.2 original en el mismo prompt.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o dialogos donde los rechazos del modelo alineado interrumpen el flujo, ejecutando la variante Q5_K_M (5,2 GB) en una RTX 3060 de 12 GB.
- Prototipado de asistentes conversacionales en ingles: con 32.768 tokens de contexto puede mantener conversaciones largas o procesar documentos extensos en una sola pasada.
- Evaluacion de cuantizaciones: el repositorio incluye desde IQ1_S hasta Q6_K, lo que permite medir la degradacion de calidad frente al tamano en un mismo modelo y hardware.
- Despliegue en entornos con recursos limitados: la variante IQ2_M (2,6 GB) o Q2_K (2,8 GB) cabe en dispositivos con 4 GB de RAM, adecuada para demos o pruebas de concepto aunque con calidad reducida.
- Fine-tuning posterior o destilacion: servir como base cuantizada para experimentos de ajuste con LoRA en ingles, partiendo de la version safetensors del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): IQ1_S ~2 GB, IQ2_M ~3 GB, IQ3_M ~4 GB, IQ4_XS ~4,5 GB, Q4_K_M ~5 GB, Q5_K_M ~6 GB, Q6_K ~7 GB, mas overhead de contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, A100 y H100 para despliegues con concurrencia; cualquier GPU con 6 GB o mas puede ejecutar las variantes de 4 bits.
- Cabe en GPU consumer: si, desde una GTX 1660 de 6 GB con IQ4_XS o Q4_K_S hasta una RTX 4090 para las variantes Q5/Q6 con contexto largo.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y otros runners compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mistral-7b-instruct-v0.2-heretic-i1-GGUF (este) | 7,24 B | 32.768 | Apache 2.0 | GGUF (multiples quants) | Version decensurada cuantizada con imatrix |
| Mistral 7B Instruct v0.2 (original) | 7,24 B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia; rechaza contenido sensible |
| Ananasez/mistral-7b-instruct-v0.2-heretic | 7,24 B | 32.768 | Apache 2.0 | safetensors | Modelo base de este repositorio, sin cuantizar |
| mradermacher/mistral-7b-instruct-v0.2-heretic-GGUF | 7,24 B | 32.768 | Apache 2.0 | GGUF (quants estaticos) | Misma base, cuantizaciones sin imatrix |

## Limitaciones y advertencias

- La ablacion de rechazos puede degradar capacidades generales del modelo y aumentar la probabilidad de contenido toxico, sesgado o inseguro; no es apto para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo elevado de alucinacion, inherente a un modelo de 7B y agravado por el proceso de decensurado, que puede alterar el comportamiento en dominios sensibles.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante decensurada exige auditoria propia de seguridad y cumplimiento normativo (por ejemplo, la AI Act en la UE).
- Las cuantizaciones por debajo de Q3 pierden calidad de forma notable; el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S tiene "very low quality".
- El repositorio pesa 81,7 GB por incluir todas las variantes; conviene descargar unicamente el fichero GGUF necesario.
- No se documentan garantias de soporte ni mantenimiento del modelo base original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/mistral-7b-instruct-v0.2-heretic-i1-GGUF
- Modelo base: https://huggingface.co/Ananasez/mistral-7b-instruct-v0.2-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/mistral-7b-instruct-v0.2-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#mistral-7b-instruct-v0.2-heretic-i1-GGUF
- Referencia de uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Mistral 7B Instruct v0.2 original: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
