# prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF

## Resumen

Fx-Work-1028-MXFP4-MoE-GGUF es una distribución cuantizada en formato GGUF del modelo multimodal Fx-Work-1028, publicado por el usuario prithivMLmods a partir de los pesos originales de endless-frontier/Fx-Work-1028. El modelo subyacente es un Mixture of Experts (MoE) construido sobre Qwen3.6-35B-A3B, con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Está orientado a flujos de trabajo profesionales con documentos, hojas de cálculo, datos de negocio y uso de herramientas sobre múltiples ficheros.

La relevancia de esta publicación es doble: por un lado, ofrece los pesos en cuantizaciones que van desde BF16 (71,1 GB) hasta Q3_K_L (18,6 GB), pasando por una cuantización MXFP4_MOE de 20,3 GB pensada para GPUs NVIDIA Blackwell con soporte de FP4; por otro, incluye decodificación especulativa integrada mediante Multi-Token Prediction (MTP), que evita depender de un modelo draft separado. El modelo conserva una ventana de contexto de 262.144 tokens y se distribuye bajo licencia Apache-2.0, sujeta a los términos del modelo base.

El pipeline declarado es image-text-to-text, con soporte de visión a través del fichero de proyección multimodal `mmproj-bf16.gguf`. La model card reporta resultados en cinco benchmarks orientados a trabajo agéntico (JobBench, AutomationBench, Claw-Eval, GDPvalAA-v2.1 y APEX-Agents-AA), con cifras que lo sitúan en la órbita de GLM-5.2 y por delante de modelos de 35B o menos en cuatro de las cinco métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre Qwen3.6-35B-A3B, transformer multimodal con proyección de visión (mmproj) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B (variante A3B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q3_K_L, Q5_K_M, Q6_K; mmproj en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0, sujeta a los términos del modelo base |
| Formato de pesos | GGUF (llama.cpp); también compatible con SGLang, vLLM y Transformers según la model card |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts derivada de Qwen3.6-35B-A3B, con unos 35.500 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional por paso de decodificación frente a un modelo denso del mismo tamaño. Incorpora capacidad multimodal mediante un proyector (`mmproj-bf16.gguf`, 903 MB) que permite entrada de imagen y texto, coherente con el pipeline image-text-to-text declarado.

La innovación técnica destacada en la model card es Multi-Token Prediction (MTP) aplicado a decodificación especulativa: los ficheros GGUF MTP integran cabeceras de predicción adicionales en los propios pesos, de modo que se predicen varios tokens futuros en un único forward pass sin necesidad de un modelo draft externo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento en contextos largos, con ventana de 262K tokens.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text, fichero mmproj).
- Uso de herramientas y function calling, con la ejecución delegada al arnés del agente que rodea al modelo.
- Flujos agénticos multi-paso y trabajo de horizonte largo sobre documentos, hojas de cálculo y datos de negocio.
- Trabajo multi-fichero: la model card lo describe como orientado a entornos de trabajo realistas con varios archivos.
- Decodificación especulativa integrada vía MTP, con `draft_n_max=2` en la prueba publicada.
- Soporte de inferencia en SGLang, vLLM, Transformers y llama.cpp.

## Casos de uso

- Automatización de tareas de oficina con documentos y hojas de cálculo: el modelo puede encadenar lecturas de varios ficheros y llamadas a herramientas dentro de un mismo contexto de 262K tokens, lo que permite mantener el estado de un flujo de trabajo largo sin truncar.
- Agentes de negocio multi-paso: su orientación a "occupational work" y el soporte de tool use lo hacen adecuado para pipelines donde el modelo decide qué herramienta invocar en cada paso y el arnés externo ejecuta la acción.
- Análisis de datos tabulares y generación de resúmenes: la combinación de contexto largo y capacidades multimodales permite adjuntar capturas o documentos escaneados junto a los datos y pedir informes consolidados.
- Asistentes de atención al cliente con contexto extenso: la ventana de 262K tokens admite historiales de conversación muy largos y documentación de producto adjunta en la misma sesión.
- Despliegue local en estaciones de trabajo con GPU Blackwell: la cuantización MXFP4_MOE (20,3 GB) permite ejecutar el modelo completo con offload total en una GPU de 96 GB, con un pico medido de 19,87 GiB de VRAM.
- Evaluación y prototipado de agentes en investigación: los benchmarks orientados a trabajo agéntico (JobBench, AutomationBench, Claw-Eval, APEX-Agents-AA) permiten comparar el comportamiento del modelo frente a alternativas en tareas de automatización.
- Procesamiento de documentos con componentes visuales: gracias al proyector multimodal, se pueden enviar imágenes de formularios, gráficos o páginas escaneadas junto con instrucciones en texto.

## Benchmarks y rendimiento

Resultados reportados en la model card para Fx-Work-1028 (modelo base del GGUF):

| Benchmark | Resultado |
|---|---|
| JobBench Main | 34,34 |
| AutomationBench | 43,33 |
| Claw-Eval pass³ | 70,1 |
| GDPvalAA-v2.1 | 1328 Elo |
| APEX-Agents-AA | 28,2 |

Rendimiento de inferencia medido con `Fx-Work-1028.MXFP4_MOE.gguf` en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), `llama-cli`, `-ngl 99`, contexto de 16.384 tokens, KV cache `q8_0`, MTP con `draft_n_max=2`, 5 ejecuciones:

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 216,25 tokens/s |
| Velocidad media de generación | 297,38 tokens/s |
| Tiempo total de ejecución | 56,4 s |
| VRAM pico | 19,87 GiB |
| Utilización de GPU pico | 81% |

No se han publicado en la información disponible comparativas numéricas detalladas frente a modelos concretos más allá de la referencia cualitativa a GLM-5.2 y Occamy-1.0.

## Requisitos de hardware

- VRAM estimada según fichero: BF16 ~71,1 GB; Q6_K ~29,2 GB; Q5_K_M ~25,3 GB; MXFP4_MOE ~20,3 GB; Q3_K_L ~18,6 GB. Añadir el proyector multimodal (~903 MB) si se usa visión.
- La prueba oficial se realizó en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 96 GB de VRAM, con pico de 19,87 GiB usando MXFP4_MOE.
- La cuantización MXFP4_MOE requiere hardware con soporte de FP4 (arquitecturas Blackwell: GB202, SM120, B200, B300) y un motor de inferencia compatible.
- GPU recomendadas: RTX PRO 6000 Blackwell, B200, B300 para MXFP4_MOE; para Q5_K_M y Q6_K se necesita al menos una GPU de 24-32 GB con offload parcial o total; Q3_K_L puede caber en GPUs de consumo de 24 GB con offload completo ajustado.
- Opciones de despliegue: llama.cpp (`llama-cli`, servidor), vLLM, SGLang y Transformers según la model card.
- Throughput medido: 216,25 tokens/s de procesamiento de prompt y 297,38 tokens/s de generación en la configuración indicada; la latencia variará según prompt, build y parámetros de runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Fx-Work-1028 (este GGUF) | 35,5B totales / ~3B activos | 262K | Apache-2.0 (sujeta a base) | Multimodal, MTP especulativo, benchmarks agénticos reportados |
| GLM-5.2 | No disponible | No disponible | No disponible | Referencia de comparación en la model card; Fx-Work-1028 se declara comparable |
| Occamy-1.0 | No disponible | No disponible | No disponible | Ligeramente por delante en Claw-Eval según la model card |
| Qwen3.6-35B-A3B | 35B / ~3B activos | No disponible | No disponible | Modelo base sobre el que se construye Fx-Work-1028 |

No se dispone en la información proporcionada de parámetros, contexto ni licencia de GLM-5.2 ni de Occamy-1.0, por lo que la comparación cuantitativa completa no está disponible.

## Limitaciones y advertencias

- El modelo declara únicamente inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- No se documentan sesgos conocidos, pero al ser un modelo derivado de Qwen3.6 sin información sobre datos de alineación, los sesgos del modelo base pueden persistir.
- Riesgo de alucinación inherente a modelos generativos; en tareas de negocio con datos numéricos conviene validar las salidas contra fuentes.
- La licencia Apache-2.0 está sujeta a los términos del modelo base (Qwen3.6-35B-A3B), que deben revisarse antes de uso comercial.
- La ejecución de herramientas no la realiza el modelo por sí mismo: depende del arnés del agente que lo rodea, lo que añade complejidad de integración y superficie de error.
- La cuantización MXFP4_MOE requiere hardware Blackwell y motores compatibles; en otras GPUs hay que recurrir a Q5_K_M, Q6_K o Q3_K_L con mayor huella de VRAM.
- Las cifras de rendimiento publicadas corresponden a una configuración concreta (RTX PRO 6000, `-ngl 99`, KV cache `q8_0`, MTP) y no son extrapolables sin verificación.
- El repositorio ocupa 165,3 GB en total por incluir todas las cuantizaciones; la descarga selectiva de un solo fichero es necesaria en la práctica.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Fx-Work-1028-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/endless-frontier/Fx-Work-1028
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
