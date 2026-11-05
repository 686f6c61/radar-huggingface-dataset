# mradermacher/OpenAI_GPT-OSS-120B_Pruned_REAP_58B-SafeTensors-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo OpenAI_GPT-OSS-120B_Pruned_REAP_58B-SafeTensors, publicado por el usuario 12bitmisfit. Se trata de una version podada del modelo GPT-OSS-120B de OpenAI, reducida mediante la tecnica REAP (Router-weighted Expert Activation Pruning) hasta aproximadamente 59.470 millones de parametros totales, segun los datos de safetensors. El resultado es un modelo derivado de un MoE de gran tamano que conserva la interfaz conversacional y la arquitectura del original, pero con un numero de expertos reducido.

El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF que publica versiones estaticas (Q2_K a Q8_0) y versiones con imatrix en repositorios separados. Este repositorio concreto ofrece unicamente cuantizaciones estaticas, sin ficheros de pesos completos en precision original. El modelo base es de tipo conversacional, etiquetado como compatible con endpoints y orientado a ingles.

La relevancia de esta ficha radica en que permite ejecutar en hardware de consumo una variante de un modelo originalmente de 120B, a costa de una poda agresiva de expertos. Es un caso de estudio util para quienes quieren evaluar el compromiso entre tamano, calidad y requisitos de VRAM, pero conviene tratarlo con cautela: la model card no documenta evaluaciones de calidad tras la poda ni la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE derivada de GPT-OSS-120B (transformer con mezcla de expertos), podada con REAP |
| Parametros totales | 59.471.719.488 (aprox. 59,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es una version podada de GPT-OSS-120B, un transformer con mezcla de expertos (MoE) desarrollado por OpenAI. La poda se realizo con la tecnica REAP, que elimina expertos en funcion de su activacion ponderada por el router, de modo que se conservan los expertos mas utilizados y se descartan los de menor contribucion. El resultado declarado son 59,47B parametros totales, frente a los 120B del original, lo que supone una reduccion de aproximadamente el 50 % del numero de parametros. No se especifica cuantos expertos se han eliminado, cuantos permanecen activos por token ni el impacto de la poda en la calidad.

No hay informacion en la documentacion disponible sobre el dataset de entrenamiento, el numero de tokens, el proceso de alineacion (RLHF, DPO) ni las innovaciones tecnicas del modelo original. Tampoco se documenta si la poda se acompano de una fase de recuperacion o fine-tuning. Las cuantizaciones de este repositorio son estaticas, generadas con el pipeline habitual de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin ficheros imatrix; estas ultimas estan en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base GPT-OSS.
- Razonamiento y respuesta multi-turno, segun la etiqueta "conversational" del repositorio.
- Compatibilidad declarada con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia con API compatible con OpenAI.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo conversacional de gran tamano en una sola GPU: con cuantizaciones Q4_K_M de 44,8 GB, el modelo puede cargarse en GPUs de 48 GB como la A6000 o la RTX 6000 Ada, y en configuraciones de doble GPU de 24 GB. Es adecuado para prototipos y entornos de desarrollo que no pueden asumir el coste de un 120B completo.
- Evaluacion comparativa de tecnicas de poda: investigadores que quieran medir el impacto de REAP sobre un MoE de OpenAI pueden usar estas cuantizaciones para pruebas de perplejidad y calidad en tareas controladas, comparando con el modelo original.
- Chatbot de asistencia en ingles para entornos con requisitos de privacidad: al ejecutarse en infraestructura propia, permite procesar conversaciones sin enviar datos a APIs externas, con la ventana de contexto que herede del modelo base (no documentada aqui).
- Generacion de texto y resumenes de documentos en ingles: el modelo puede integrarse en pipelines de procesamiento por lotes usando llama.cpp u Ollama, con la cuantizacion Q5_K_M (48 GB) como compromiso entre calidad y huella de memoria.
- Experimentacion con cuantizaciones de bajo bit: las versiones Q2_K y Q3_K_S (33,9 GB) permiten ejecutar el modelo en GPUs de 40-48 GB o en configuraciones CPU+GPU, utiles para medir la degradacion de calidad frente a Q4_K_M y Q8_0.
- Base para fine-tuning ligero o destilacion: el modelo base en safetensors (59,47B) puede servir como punto de partida para adaptaciones con LoRA, aunque el repositorio GGUF solo contiene pesos cuantizados y no es apto para entrenamiento directo.
- Servicio de inferencia compatible con OpenAI: gracias a la etiqueta endpoints_compatible, puede desplegarse con vLLM o TGI (previa conversion) o con servidores GGUF compatibles para sustituir una API de OpenAI en pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen evaluaciones de MMLU, HumanEval, GSM8K u otras, ni comparaciones con el modelo original sin podar.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K y Q3_K_S ~33,9 GB; IQ4_XS ~34,3 GB; Q3_K_M ~36,4 GB; Q3_K_L ~37,6 GB; Q4_K_S ~41,4 GB; Q4_K_M ~44,8 GB; Q5_K_S ~45,0 GB; Q5_K_M ~48,0 GB; Q6_K ~63,3 GB; Q8_0 ~63,4 GB. Hay que anadir el espacio para el contexto KV cache, que depende de la ventana configurada.
- GPUs recomendadas: A100 80 GB o H100 80 GB para Q6_K y Q8_0; A6000 48 GB, RTX 6000 Ada 48 GB o L40S 48 GB para Q4_K_M y Q5_K_M; configuraciones multi-GPU de 2x24 GB (RTX 4090, RTX 3090) para cuantizaciones Q4 y Q5 con reparto de capas.
- GPU de consumo: Q4_K_S (41,4 GB) y Q4_K_M (44,8 GB) no caben en una RTX 4090 de 24 GB; requieren al menos dos GPUs de 24 GB o descarga parcial a CPU. Las cuantizaciones Q2_K y Q3_K_S (33,9 GB) tampoco caben en una sola GPU de 24 GB y necesitan offloading.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag endpoints_compatible sugiere integracion con APIs estilo OpenAI. vLLM y TGI requeririan conversion a otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un MoE podado, el rendimiento dependera del numero de expertos activos por token, dato no documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GPT-OSS-120B podado REAP, GGUF) | 59,5B | no disponible | no disponible | GGUF | Poda de expertos, solo cuantizaciones estaticas |
| GPT-OSS-120B original (OpenAI) | 120B | no disponible en esta ficha | no disponible | safetensors | Modelo de referencia sin podar; mayor huella de memoria |
| Variante i1-GGUF de mradermacher | 59,5B | no disponible | no disponible | GGUF con imatrix | Misma base, cuantizaciones ponderadas de mayor calidad |
| Modelos densos de ~70B (p. ej. Llama 3.x 70B) | ~70B | no disponible | depende del modelo | safetensors, GGUF | Comparables en VRAM, pero sin estructura MoE; la comparacion de calidad no esta documentada |

No hay datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- La poda REAP elimina expertos del MoE original; no hay evaluacion publicada del impacto en calidad, por lo que el rendimiento puede degradarse de forma desigual segun la tarea.
- La licencia no esta declarada en el repositorio. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base original de OpenAI y del modelo intermedio de 12bitmisfit.
- El modelo solo declara soporte de ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No se documenta la longitud de contexto efectiva tras la poda ni si se mantiene la del modelo original.
- Riesgo de alucinacion inherente a los modelos generativos, sin datos especificos de mitigacion en esta variante.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base, que tampoco se detallan.
- El repositorio contiene unicamente pesos GGUF cuantizados; no es adecuado para fine-tuning directo ni para inspeccion en precision completa.
- El tamano del repositorio (513,7 GB) incluye todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Las cuantizaciones Q2_K y Q3_K_S, pese a su menor tamano, pueden presentar una degradacion notable de calidad; la propia model card recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K/Q8_0 como mejor calidad.
- El modelo se actualizo por ultima vez en noviembre de 2026, pero no hay registro de cambios ni de correcciones de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/OpenAI_GPT-OSS-120B_Pruned_REAP_58B-SafeTensors-GGUF
- Modelo base (safetensors): https://huggingface.co/12bitmisfit/OpenAI_GPT-OSS-120B_Pruned_REAP_58B-SafeTensors
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/OpenAI_GPT-OSS-120B_Pruned_REAP_58B-SafeTensors-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#OpenAI_GPT-OSS-120B_Pruned_REAP_58B-SafeTensors-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
