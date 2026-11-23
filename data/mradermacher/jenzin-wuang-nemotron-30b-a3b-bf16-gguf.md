# mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-GGUF

## Resumen

Jenzin-Wuang-Nemotron-30B-A3B-BF16-GGUF es la version cuantizada en formato GGUF del modelo ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16, un derivado de la familia NVIDIA Nemotron 3.5 Lightning de 30B con arquitectura Mixture-of-Experts (MoE) y aproximadamente 3B de parametros activos por token. El autor de la cuantizacion es mradermacher, un conocido publicador de versiones GGUF de la comunidad, mientras que el modelo base procede de un trabajo de "cirugia de pesos" (weight surgery) e "injerto de identidad" (identity transplant) realizado por ApolloRaines sobre el checkpoint original de NVIDIA. La model card del modelo base lo etiqueta explicitamente como una demo y parodia, lo que condiciona su uso en produccion.

El modelo resuelve el problema de ejecutar un transformer MoE de ~31,6 mil millones de parametros totales en hardware de consumo o en entornos con memoria limitada, gracias a las cuantizaciones GGUF que van desde Q2_K (18 GB) hasta Q8_0 (33,7 GB). Al ser un MoE con solo ~3B de parametros activos, la inferencia es comparativamente rapida frente a un modelo denso del mismo tamano total, aunque el requisito de memoria viene dominado por el total de parametros.

La relevancia actual es doble: por un lado, demuestra el flujo de cuantizacion estatica de mradermacher sobre modelos MoE recientes; por otro, sirve como ejemplo de las modificaciones de comportamiento e identidad que la comunidad aplica sobre pesos abiertos, con las implicaciones eticas y de licencia que ello conlleva. No se dispone de informacion sobre la longitud de contexto, los idiomas soportados mas alla del ingles declarado ni los resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, derivada de NVIDIA Nemotron 3.5 Lightning 30B-A3B |
| Parametros totales | 31.577.940.288 (~31,6B) |
| Parametros activos | ~3B (segun la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones ponderadas/imatrix en repo i1-GGUF |
| Idiomas soportados | ingles (declarado en la model card); resto no disponible |
| Licencia | other (same-as-base), enlazada a NVIDIA Nemotron 3.5 Lightning 30B-A3B-BF16 |
| Formato de pesos | GGUF (el modelo base esta en BF16/safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas Mixture-of-Experts: de los ~31,6B de parametros totales, solo ~3B se activan por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion propia de un modelo de mayor tamano. Esta arquitectura, popularizada por modelos como Mixtral o DeepSeek, permite desplegar el modelo en GPUs de consumo si se acepta una cuantizacion agresiva, a costa de requerir memoria para la totalidad de los expertos.

Sobre el entrenamiento original de NVIDIA Nemotron 3.5 Lightning no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF/DPO, etc.). Lo que si documenta el autor del modelo base es un proceso de "weight surgery" e "identity transplant": una modificacion de pesos orientada a alterar el comportamiento y la identidad del modelo, etiquetada como demo y parodia. Este tipo de intervencion no es un reentrenamiento y no garantiza que las capacidades originales se preserven intactas. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye ajuste imatrix en este repositorio; las versiones ponderadas estan en el repositorio i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Nemotron, aunque no verificadas tras la modificacion de pesos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso mediante APIs de inferencia compatibles con el formato de Hugging Face.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion en MoE: el modelo permite comparar la degradacion de calidad entre Q2_K, IQ4_XS, Q4_K_M y Q8_0 en un MoE de 31,6B con ~3B activos, util para investigar el impacto de la cuantizacion en modelos con expertos.
- Experimentacion con modificaciones de pesos: sirve como caso de estudio de "identity transplant" y "weight surgery", permitiendo analizar como cambia el comportamiento de un modelo al alterar sus pesos y que capacidades se degradan.
- Prototipado local en hardware de consumo: con Q4_K_M (24,6 GB) o IQ4_XS (18,3 GB) puede ejecutarse en GPUs con 24 GB de VRAM, como una RTX 4090, para pruebas de generacion de texto sin infraestructura de datacenter.
- Investigacion sobre seguridad y alineacion: al ser una parodia con identidad modificada, es un banco de pruebas para estudiar como las intervenciones en pesos afectan a la coherencia, la veracidad y los sesgos del modelo.
- Demostraciones educativas de arquitecturas MoE: permite ilustrar en clase o en talleres la diferencia entre parametros totales y activos, y el impacto en memoria y latencia.
- Pruebas de pipelines de inferencia GGUF: util para validar integraciones con llama.cpp, Ollama o servidores compatibles antes de desplegar modelos base mas estables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~18 GB (Q2_K, Q3_K_S, IQ4_XS) y ~34 GB (Q6_K, Q8_0); Q4_K_M ocupa 24,6 GB y Q5_K_M 26,1 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S/Q4_K_M; A100 40 GB o H100 para Q5_K_M, Q6_K y Q8_0; configuraciones multi-GPU para el modelo base en BF16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o inferiores; IQ4_XS (18,3 GB) deja margen para el contexto.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si el formato lo permite.
- Latencia y throughput: no disponibles; al ser MoE con ~3B activos se espera una velocidad de decodificacion superior a la de un modelo denso de 31,6B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Jenzin-Wuang-Nemotron-30B-A3B (este) | ~31,6B / ~3B | no disponible | other (same-as-base) | GGUF, BF16 |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B | ~30B / ~3B | no disponible | segun modelo original de NVIDIA | BF16 |
| Modelos MoE densos comparables (p. ej. Mixtral 8x7B) | ~47B / ~13B | no disponible en esta ficha | licencia propia del modelo | safetensors, GGUF |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada; los datos de rendimiento de los modelos de referencia no se incluyen.

## Limitaciones y advertencias

- El modelo base se declara explicitamente como demo y parodia; no es un modelo de proposito general validado para produccion.
- La modificacion de pesos ("identity transplant", "behavioral modification") puede degradar capacidades originales y alterar el comportamiento de forma impredecible.
- Riesgo de alucinacion elevado: no hay benchmarks ni evaluaciones publicadas que respalden la calidad de las respuestas.
- Idiomas: solo se declara ingles; el uso en castellano no esta soportado ni evaluado.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones o documentos largos.
- Licencia "other" vinculada a la del modelo base de NVIDIA: es imprescindible revisar los terminos originales antes de cualquier uso comercial, y la cadena de derivaciones (NVIDIA -> ApolloRaines -> mradermacher) anade incertidumbre juridica.
- Las cuantizaciones Q2_K y Q3_K_S tienen calidad reducida; para uso serio se recomienda Q4_K_M o superior.
- No hay garantia de soporte de tool calling ni de modo agente tras la modificacion de pesos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-GGUF
- Modelo base: https://huggingface.co/ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16
- Licencia del modelo original: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Jenzin-Wuang-Nemotron-30B-A3B-BF16-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
