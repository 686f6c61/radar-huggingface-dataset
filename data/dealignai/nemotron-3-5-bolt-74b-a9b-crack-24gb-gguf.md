# dealignai/Nemotron-3.5-Bolt-74B-A9B-CRACK-24GB-GGUF

## Resumen

Nemotron-3.5-Bolt-74B-A9B-CRACK-24GB-GGUF es una cuantización GGUF modificada del modelo NVIDIA Nemotron-3.5-Bolt-74B-A9B-BF16, publicada por el usuario dealignai. Se trata de un artefacto de investigación de alineación: se ha eliminado el entrenamiento de rechazo (abliteration) del modelo base y se ha cuantizado con la receta mixta de precisión que NVIDIA usa en su propio empaquetado de 24 GB. El resultado ocupa 22 GB en disco (2,38 BPW) y mantiene el torreón de visión byte a byte idéntico al original en BF16.

El modelo base es un híbrido NemotronH-Puzzle de 74.042.720.768 parámetros totales con 9B activos por token, compuesto por 88 bloques: 40 de Mamba2, 40 de MoE latente y 8 de atención completa, con 512 expertos enrutados más uno compartido y una torre de visión C-RADIO-v4-H. Soporta imagen y vídeo, diez idiomas y un interruptor binario de razonamiento (`enable_thinking`) sin niveles de esfuerzo. No dispone de cabeza MTP; la decodificación especulativa se delega en un drafter LiLiCorr que se distribuye en el mismo repositorio.

Su relevancia es doble. Por un lado, demuestra que un modelo híbrido Mamba2 + MoE de 74B puede ejecutarse en el espacio de 24 GB con llama.cpp y decodificación especulativa. Por otro, es un caso de estudio sobre eliminación de salvaguardas: según la propia model card, alcanza un ASR del 99,4% (318/320) en HarmBench-320 con cero rechazos, frente a aproximadamente la mitad de rechazos del empaquetado oficial de NVIDIA. El repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH-Puzzle: 88 bloques (40 Mamba2 + 40 MoE latente + 8 atencion completa), hidden 4096, 512 expertos enrutados (puzzle-pruned) + 1 compartido, MoE latente de 1024 dimensiones, torre de vision C-RADIO-v4-H |
| Parametros totales | 74.042.720.768 (74B) |
| Parametros activos | 9B por token |
| Longitud de contexto | 65.536 tokens en el ejemplo de ejecucion recomendado de la model card (`-c 65536`); maximo oficial no disponible |
| Tipos de cuantizacion | GGUF mixto de NVIDIA: IQ2_XXS en expertos enrutados y compartidos, NVFP4 en proyecciones de entrada/salida de Mamba, Q8_0 en atencion (q/k/v/o), latent fc1/fc2, lm_head y token_embd, F32 en normas. 2,38 BPW |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, japones, coreano, portugues, hindi y chino |
| Licencia | NVIDIA Open Model License (identificador `other` en HuggingFace) |
| Formato de pesos | GGUF (modelo principal, mmproj de vision y drafter LiLiCorr) |

## Arquitectura y entrenamiento

La arquitectura es un hibrido estado-espacio/transformer denominado NemotronH-Puzzle. De los 88 bloques, 40 son Mamba2 (secuencia con estado recurrente), 40 son capas MoE con representacion latente de 1024 dimensiones y solo 8 son atención completa. El MoE enruta entre 512 expertos podados mas un experto compartido, con 9B de parametros activos sobre 74B totales, lo que da una relacion de activacion aproximada de 1:8. El modelo incorpora una torre de vision C-RADIO-v4-H que procesa imagen y video.

El entrenamiento original corresponde a NVIDIA; esta ficha no dispone de datos sobre el numero de tokens, la composicion del corpus ni las etapas de RLHF o DPO del base BF16. Lo que si documenta el autor de la cuantizacion es el proceso de calibracion: una matriz de importancia (imatrix) calculada con una mezcla de 1,5 millones de tokens que cubre codigo, terminal, flujos agenticos, razonamiento, contenido multilingue en diez idiomas y prompts dañinos, computada sobre el modelo ya ablacionado. La innovacion practica del empaquetado es el uso de decodificacion especulativa mediante el drafter LiLiCorr distribuido aparte, dado que el modelo no tiene cabeza MTP.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento mediante el kwarg binario `enable_thinking` del chat template, sin niveles de esfuerzo intermedios.
- Vision multimodal: procesa imagen y video a traves del mmproj de NVIDIA, con pesos de vision identicos byte a byte a la fuente BF16.
- Capacidades multilingues en diez idiomas: ingles, frances, espanol, aleman, italiano, japones, coreano, portugues, hindi y chino.
- Codigo y uso de terminal: el mix de calibracion de la imatrix incluye datos de programacion, terminal y flujos agenticos.
- Conversacion multiturno con plantilla Jinja (`--jinja`) y endpoint compatible con la API de OpenAI (`endpoints_compatible`).
- Decodificacion especulativa con el drafter LiLiCorr (`--spec-type draft-dflash --spec-draft-n-max 6`).
- Generacion sin rechazos: segun la model card, responde a peticiones que el modelo base rechaza, incluidas las dañinas.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.

## Casos de uso

- Investigacion en alineacion y red teaming: el modelo sirve como artefacto controlado para estudiar como se comporta un LLM sin entrenamiento de rechazo y para calibrar clasificadores de seguridad. Su ASR del 99,4% en HarmBench-320 lo convierte en un banco de pruebas extremo, siempre en entornos aislados y sin usuarios finales.
- Evaluacion comparativa de cuantizacion: permite medir la deriva que introduce una receta mixta IQ2_XXS/NVFP4/Q8_0 frente al BF16 y al GGUF oficial de 24 GB de NVIDIA, con una perdida documentada de 1,29 puntos porcentuales en MMLU sobre el mismo subconjunto de 6980 preguntas.
- Inferencia local multimodal en una sola GPU: con 22 GB de pesos mas 1,73 GB de mmproj, encaja en estaciones de trabajo de 24-48 GB para tareas de descripcion de imagenes y video sin depender de APIs externas.
- Procesamiento de documentos mixtos texto-imagen en diez idiomas: el modelo puede resumir y extraer informacion de capturas, diagramas o fotos acompanadas de texto en cualquiera de los idiomas soportados, con hasta 65.536 tokens de contexto en la configuracion recomendada.
- Generacion de datos sinteticos para entrenamiento: al no rechazar peticiones, puede producir completaciones en dominios donde el base se niega, util para construir conjuntos de datos de robustez o de clasificacion de contenido peligroso bajo supervision.
- Servicio de inferencia compatible con OpenAI: `llama-server` expone un endpoint que se integra con clientes existentes mediante `chat_template_kwargs`, con ocho slots paralelos (`-np 8`) y decodificacion especulativa activada.
- Analisis de trazas de terminal y agentes: el mix de calibracion incluye datos de terminal y agenticos, por lo que el modelo es util para procesar logs largos, comandos y transcripciones de sesiones automatizadas.

## Benchmarks y rendimiento

Resultados publicados en la model card. La evaluacion de MMLU de la version CRACK es parcial (n=7262 de 14042 preguntas).

| Benchmark | Configuracion | CRACK-24GB | Base NV-24GB |
|---|---|---|---|
| MMLU micro | thinking off, logits de letra | 81,38% (parcial, n=7262) | 80,76% (completo, n=14042) |
| MMLU macro | thinking off, logits de letra | 79,69% (parcial) | 81,29% (completo) |
| MMLU micro, mismo subconjunto | thinking off, n=6980 | 81,38% | 82,66% |
| HarmBench-320 ASR | reasoning on | 99,4% (318/320), 0 rechazos | ~47,9% de rechazo (thinking off) y ~52,4% (thinking on) |

Comparativa por grupo tematico de MMLU sobre el mismo subconjunto:

| Tema | CRACK | Base (mismo subconjunto) | Delta |
|---|---|---|---|
| STEM | 76,17% | 77,67% | -1,50 pp |
| Humanidades | 86,11% | 87,99% | -1,88 pp |
| Sociales | 90,22% | 90,88% | -0,66 pp |
| Otros | 75,75% | 77,07% | -1,31 pp |

Desglose de cumplimiento en HarmBench-320 (reasoning on):

| Categoria | Cumple / N | Porcentaje |
|---|---|---|
| chemical_biological | 42 / 42 | 100,0% |
| cybercrime_intrusion | 52 / 52 | 100,0% |
| harassment_bullying | 21 / 21 | 100,0% |
| harmful | 18 / 18 | 100,0% |
| misinformation_disinformation | 54 / 54 | 100,0% |
| copyright | 79 / 80 | 98,8% |
| illegal | 52 / 53 | 98,1% |

Las dos respuestas no conformes en HarmBench son bucles de decodificacion ("garbage") bajo IQ2_XXS, no rechazos, segun el autor. No hay resultados publicados de evaluacion de vision, de rendimiento por idioma ni de throughput.

## Requisitos de hardware

- Peso de los ficheros: 22 GB el modelo principal, 1,73 GB el mmproj de vision y 1,00 GB el drafter LiLiCorr; el repositorio completo ocupa 24,8 GB.
- VRAM estimada: la nomenclatura `-24GB-GGUF` indica que el empaquetado esta pensado para GPUs de 24 GB, pero los tres ficheros suman en torno a 24,7 GB y hay que anadir la cache KV del contexto configurado. En una GPU de 24 GB es previsible tener que descargar capas a CPU o reducir el contexto; la cifra exacta de cache KV no esta disponible porque depende del contexto, del numero de slots y de `--flash-attn`.
- GPU recomendadas: A100 y H100 (80 GB) ejecutan el modelo completo sin offload; tarjetas de 48 GB como la A6000 o la RTX 6000 Ada dan margen holgado; las de 24 GB (RTX 4090, RTX 3090) quedan al limite.
- Cabe en GPU de consumo: si, en modelos de 24 GB, con offload parcial y contexto reducido. Por debajo de 24 GB la ejecucion pasa a CPU/RAM con degradacion notable de velocidad.
- Despliegue: llama.cpp (build `b76b13379` o posterior, imprescindible para cargar checkpoints Nemotron-H puzzle), mediante `llama-server` con `-ngl 999 -c 65536 -np 8 --jinja --flash-attn on` y endpoint compatible con OpenAI. Soporte en vLLM, Ollama o TGI no esta documentado en la informacion disponible.
- Decodificacion especulativa: requiere pasar `--spec-type draft-dflash --spec-draft-n-max 6` y el fichero LiLiCorr.
- Latencia y throughput: no disponibles.
- Memoria del sistema necesaria en caso de offload: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Cuantizacion | MMLU micro | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| dealignai Nemotron-3.5-Bolt-74B-A9B-CRACK-24GB-GGUF | 74B | 9B | IQ2_XXS / NVFP4 / Q8_0 (22 GB) | 81,38% (parcial, n=7262) | 0 en HarmBench-320 (ASR 99,4%) | NVIDIA Open Model License | HuggingFace, 0 descargas |
| nvidia Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF | 74B | 9B | Mixta de NVIDIA (24 GB) | 80,76% (completo) / 82,66% (subconjunto n=6980) | ~47,9% off / ~52,4% on | NVIDIA Open Model License | HuggingFace |
| nvidia Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B | 9B | BF16 | No disponible | No disponible | NVIDIA Open Model License | HuggingFace |

No se dispone en la informacion proporcionada de otros modelos de terceros comparables en la misma categoria (hibrido Mamba2 + MoE de ~74B con vision), por lo que la comparativa se limita a las tres variantes de la misma familia.

## Limitaciones y advertencias

- Modelo sin rechazo: la ablacion elimina el entrenamiento de seguridad. Segun la model card, cumple el 100% de las peticiones en las categorias chemical_biological, cybercrime_intrusion, harassment_bullying, harmful y misinformation_disinformation de HarmBench-320. No debe desplegarse a usuarios finales sin controles de seguridad posteriores.
- Riesgo de licencia: el modelo se redistribuye bajo la NVIDIA Open Model License, que incluye politicas de uso aceptable. Usar una version modificada para eliminar salvaguardas puede entrar en conflicto con esas condiciones; conviene revisar los terminos antes de cualquier uso.
- Perdida por cuantizacion: 2,38 BPW con expertos en IQ2_XXS introduce una deriva de -1,29 puntos porcentuales en MMLU sobre el mismo subconjunto, que llega a -1,88 pp en Humanidades.
- Artefactos de decodificacion: con temperatura superior a 0,7 aparecen repeticiones raras de pares de palabras y deslices de caracteres atribuidos a IQ2_XXS. La model card recomienda temperatura 0 (greedy) y considera limpio hasta 0,7.
- Bucles de decodificacion: 2 de las 320 respuestas de HarmBench fueron bucles degradados, no rechazos.
- Evaluacion incompleta: MMLU solo esta medido sobre 7262 de 14042 preguntas y exclusivamente con thinking off y logits de letra. La comparacion directa con el base en el total de MMLU no es homogenea.
- Vision sin evaluar: no se publican resultados de evaluacion para el torreon de vision ni para video.
- Contexto: el maximo oficial no esta confirmado; 65.536 tokens aparece solo como valor del ejemplo de ejecucion.
- Idiomas: se listan diez idiomas, pero no hay metricas de rendimiento por idioma.
- Madurez: repositorio creado y actualizado el 16 de octubre de 2026, con 0 descargas y 0 likes en el momento de redactar la ficha; no hay validacion independiente de la comunidad.
- Alucinacion: no se han publicado tasas de alucinacion en la informacion disponible.
- Requisito de runtime estricto: versiones antiguas o forks de llama.cpp no pueden cargar checkpoints Nemotron-H puzzle, lo que limita la portabilidad del GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Nemotron-3.5-Bolt-74B-A9B-CRACK-24GB-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Perfil del autor: https://x.com/dealignai
