# mradermacher/GLM-5.3-Flash-REAP50-FP8-v2-GGUF

## Resumen

GLM-5.3-Flash-REAP50-FP8-v2-GGUF es una cuantizacion en formato GGUF del modelo patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2, un derivado de la familia GLM-5.3-Flash de Zhipu AI (Z.ai) al que se le ha aplicado una poda de expertos (REAP, *Router-weighted Expert Activation Pruning*) al 50 % y una cuantizacion posterior a FP8. El modelo resultante conserva 164.907.253.550 parametros totales segun los safetensors del repositorio, mantiene la arquitectura MoE del original y se distribuye en 12 variantes de cuantizacion GGUF (desde Q2_K hasta Q8_0) generadas por mradermacher.

El interes practico de esta publicacion es doble. Por un lado, REAP elimina la mitad de los expertos del MoE original, lo que reduce el peso en disco y la VRAM necesaria para servir el modelo sin reentrenar desde cero. Por otro lado, la conversion a GGUF permite ejecutar el modelo en llama.cpp y Ollama, algo imposible con el checkpoint original en FP8 pensado para vLLM y SGLang. El repositorio ocupa 1130 GB y los ficheros de cuantizacion van desde 61,5 GB (Q2_K) hasta 176 GB (Q8_0), por lo que sigue siendo un modelo de gran escala que requiere infraestructura multi-GPU para la mayoria de los casos de uso.

La licencia es MIT, lo que facilita el uso comercial, y los idiomas declarados son ingles y chino. La model card del cuantizador es minima y no aporta informacion sobre contexto, datos de entrenamiento ni benchmarks; esta ficha se limita a documentar lo que consta en los metadatos y en la card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con poda de expertos (REAP al 50 %) y decodificacion especulativa MTP |
| Parametros totales | 164.907.253.550 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (referencia), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (multi-parte para Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y Q8_0) |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de la familia GLM-5.3-Flash. Sobre ese checkpoint se aplico REAP (*Router-weighted Expert Activation Pruning*), una tecnica que poda expertos en funcion de la activacion ponderada por el router: se eliminan los expertos con menor contribucion agregada y se conserva el resto, reduciendo el numero de expertos del MoE aproximadamente a la mitad. El checkpoint intermedio se guarda en FP8 y despues mradermacher lo convierte a GGUF con `convert_type: hf` y `quantize_version: 2`, generando cuantizaciones estaticas (no hay versiones ponderadas/imatrix en el momento de la publicacion).

Los tags del repositorio indican soporte de decodificacion especulativa mediante MTP (*Multi-Token Prediction*), lo que sugiere que el modelo incorpora cabezas auxiliares para predecir varios tokens por paso y acelerar la inferencia en vLLM y SGLang. Tambien hay un submodelo multimodal (`mmproj`) en Q8_0 y f16, lo que implica capacidades de vision en el modelo original. No consta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso y tareas de codigo y matematicas, segun la categoria del modelo base GLM-5.3-Flash (no verificable con datos de esta ficha).
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) que actuan como suplemento de vision para llama.cpp.
- Decodificacion especulativa mediante MTP para acelerar la generacion.
- Compatible con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue detras de APIs compatibles con OpenAI.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque es habitual en la familia GLM.
- Capacidad de agente y multi-step reasoning: no confirmado en la informacion disponible.

## Casos de uso

- Servicio de chat bilingue ingles-chino en produccion: el modelo cubre los dos idiomas declarados y puede desplegarse en vLLM o SGLang con el checkpoint FP8 original, o en llama.cpp con las cuantizaciones GGUF para entornos sin GPUs de datacenter.
- Procesamiento de documentos con componente visual: gracias a los ficheros `mmproj`, se puede usar en llama.cpp para tareas de OCR, descripcion de imagenes o extraccion de informacion de capturas y PDFs renderizados.
- Generacion de codigo asistida en IDE: el modelo base GLM-5.3-Flash esta orientado a tareas de codigo; la version GGUF Q4_K_M (100,3 GB) permite integrarlo en un servidor interno de autocompletado si se dispone de varias GPUs.
- Razonamiento sobre contextos largos en analisis financiero o legal: adecuado si el contexto del modelo base es amplio (dato no disponible en esta ficha), con la ventaja de que la poda REAP reduce el coste por token frente al MoE completo.
- Despliegue en infraestructura propia con requisitos de licencia permisiva: la licencia MIT permite uso comercial sin restricciones de atribucion mas alla de la propia MIT, lo que encaja en productos cerrados.
- Evaluacion e investigacion sobre poda de expertos: el par de repositorios (FP8 original y GGUF) permite comparar la calidad del MoE completo frente al podado al 50 % en las mismas tareas.
- Fine-tuning ligero o destilacion sobre el modelo podado: al ser un MoE con la mitad de expertos, el coste de adaptacion (LoRA, por ejemplo) es menor que sobre el original, aunque sigue requiriendo hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el *KV cache*. Para Q4_K_M (100,3 GB) se necesitan al menos 2 GPUs de 80 GB (A100/H100) o 3-4 RTX 4090 de 24 GB con *offload* parcial a CPU.
- Q2_K (61,5 GB) es la unica variante que podria caber en una sola GPU de 80 GB, con perdida de calidad notable.
- Q8_0 (176 GB) requiere al menos 3 GPUs de 80 GB o un nodo con 4x H100.
- No cabe en ninguna GPU de consumo individual (RTX 4090, 5090, etc.); solo es viable en consumer con *offloading* a RAM del sistema, lo que degrada mucho el throughput.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM y SGLang para el checkpoint FP8 original (patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2), que es el formato recomendado para servidores de alto rendimiento.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP deberia mejorar el throughput en vLLM/SGLang, pero no hay cifras publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP50-FP8-v2-GGUF (este) | 164,9 B (MoE podado 50 %) | no disponible | MIT | GGUF | Cuantizaciones de 61,5 a 176 GB |
| patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2 | 164,9 B (MoE podado 50 %) | no disponible | MIT | safetensors FP8 | Checkpoint base, pensado para vLLM/SGLang |
| GLM-5.3-Flash (original, sin podar) | no disponible | no disponible | no disponible | no disponible | Referencia de la familia; no consta en la informacion disponible |

No se dispone de datos de benchmarks ni de especificaciones del GLM-5.3-Flash original en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- La poda REAP al 50 % elimina expertos del MoE; es esperable una perdida de calidad frente al modelo sin podar, especialmente en tareas de nicho o idiomas poco representados. No hay evaluacion publicada que cuantifique esa perdida.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; no hay datos de mitigacion especificos en la card.
- La model card del cuantizador no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad.
- El repositorio ocupa 1130 GB; descargar la variante adecuada requiere planificar el almacenamiento y comprobar la integridad de los ficheros multi-parte.
- No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, lo que puede afectar a la calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- Aunque la licencia es MIT, conviene verificar la licencia del modelo base GLM-5.3-Flash original de Zhipu AI, ya que las condiciones de uso pueden heredarse parcialmente.
- Para produccion con latencia estricta, el checkpoint FP8 original en vLLM/SGLang es preferible a los GGUF; estos ultimos estan pensados para entornos con menos recursos o para experimentacion.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/GLM-5.3-Flash-REAP50-FP8-v2-GGUF
- Modelo base (FP8): https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#GLM-5.3-Flash-REAP50-FP8-v2-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
