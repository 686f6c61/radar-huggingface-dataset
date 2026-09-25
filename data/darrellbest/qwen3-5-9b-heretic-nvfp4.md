# darrellbest/Qwen3.5-9B-Heretic-NVFP4

## Resumen

Qwen3.5-9B-Heretic-NVFP4 es una version cuantizada en NVFP4 del modelo darrellbest/Qwen3.5-9B-Heretic, publicado por el usuario darrellbest. Se trata de una adaptacion del modelo Qwen/Qwen3.5-9B a la que se le ha eliminado el comportamiento de rechazo mediante Heretic, una herramienta que aplica Arbitrary-Rank Ablation (ARA) sobre los pesos completos, y que despues se ha comprimido a 4 bits en formato NVFP4 con llm-compressor 0.13.0 para su uso en vLLM sobre hardware NVIDIA Blackwell.

El modelo conserva la naturaleza multimodal del original (pipeline image-text-to-text) con 9.653.104.368 parametros totales, y reduce el peso de 19,34 GB en bf16 a 11,72 GB. La cuantizacion se aplica solo a las capas lineales del MLP y a las proyecciones de atencion de las capas de atencion completa; el encoder de vision, las capas Gated DeltaNet, el bloque de prediccion multi-token, los embeddings y las normalizaciones permanecen en bf16 o fp32.

Su relevancia es doble: por un lado, permite servir un modelo de casi 10.000 millones de parametros con vision en GPUs Blackwell con un rendimiento medido de unos 100 tok/s en un solo stream y unos 2.550 tok/s agregados con batch 32; por otro, forma parte de una familia de variantes (bf16, FP8, GGUF y NVFP4) que facilitan comparar el impacto de distintas cuantizaciones sobre la calidad de razonamiento. El autor advierte explicitamente de que las salvaguardas estan reducidas por diseno y que los pesos NVFP4 no se volvieron a medir en cuanto a tasas de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas hibridas Gated DeltaNet (linear_attn), capas de atencion completa y bloque de prediccion multi-token (MTP) |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 mil millones) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 con grupos de 16 valores y escalas FP8 en las capas MLP y en las proyecciones de atencion de las capas de atencion completa; el resto en bf16 (parametros A_log y de normalizacion de DeltaNet en fp32). La familia incluye tambien bf16, FP8 W8A8 y GGUF BF16/Q8_0/Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (enlazada a la licencia de Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors con compressed-tensors, mas un fichero model-auxiliary.safetensors con los pesos MTP |
| Tamano del repositorio | 11,7 GB (pesos NVFP4: 11,72 GB frente a 19,34 GB en bf16) |
| Pipeline declarado | image-text-to-text |
| Modelo base | darrellbest/Qwen3.5-9B-Heretic, derivado de Qwen/Qwen3.5-9B |
| Idiomas declarados en la model card | No disponibles |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-9B, un modelo multimodal con entrenamiento de fusion temprana sobre tokens multimodales. La variante Heretic introduce una modificacion de pesos, no de arquitectura: se aplica Arbitrary-Rank Ablation (ARA) sobre los pesos completos para eliminar el comportamiento de rechazo, con un resultado declarado de 5 rechazos sobre 100 prompts (frente a 100/100 en el modelo original) y una divergencia KL de 0,0403. Segun la model card, el modelo base Qwen3.5 incorpora un encoder de vision activo, capas Gated DeltaNet (etiquetadas como linear_attn), un bloque de prediccion multi-token y una tabla de embeddings de 248.000 tokens compartida con lm_head.

La cuantizacion se genero con llm-compressor 0.13.0 usando el esquema NVFP4, calibrado sobre 64 prompts de chat no daninos. Solo se cuantizaron las capas lineales del MLP y las proyecciones de atencion de las capas de atencion completa; el autor justifica dejar en bf16 el encoder de vision, las capas Gated DeltaNet, el bloque MTP, los embeddings y las normalizaciones, argumentando que el estado recurrente de DeltaNet es sensible a baja precision y que la tabla de embeddings de 248.000 tokens representa una porcion importante del modelo. Los pesos de prediccion multi-token, que el guardado cuantizado descarta, se copiaron sin modificar a model-auxiliary.safetensors. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo chat, con soporte de modo pensamiento (thinking mode) segun las pruebas del autor.
- Razonamiento aritmetico y resolucion de problemas de palabra en modo pensamiento: 34 de 40 ejecuciones completadas y correctas en la prueba del autor.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), con el encoder de vision en bf16; el autor verifico la descripcion correcta de una imagen de prueba con un circulo rojo y un cuadrado azul.
- Prediccion multi-token (MTP) preservada en un fichero auxiliar aparte.
- Capacidades heredadas de la familia Qwen3.5: la documentacion de Qwen describe paridad entre generaciones en razonamiento, codigo, agentes y comprension visual, y mejora frente a los modelos Qwen3-VL. No hay mediciones especificas de este modelo para codigo, matematicas o agentes en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible para esta variante.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidad especial destacable: comportamiento de rechazo ablacionado por diseno (5/100 rechazos en la variante bf16), lo que la orienta a usos donde se requiere minima censura.

## Casos de uso

- Servicio de chat multimodal en produccion sobre Blackwell: el modelo se sirve con `vllm serve darrellbest/Qwen3.5-9B-Heretic-NVFP4` y aprovecha el soporte nativo de NVFP4 en vLLM 0.30.0, con unas 100 tok/s por stream y unas 2.550 tok/s agregadas con batch 32, lo que permite atender varias conversaciones simultaneas con 11,72 GB de pesos.
- Descripcion y etiquetado de imagenes: al mantener el encoder de vision intacto en bf16, puede usarse para generar descripciones o metadatos de imagenes en catalogos de producto, moderacion o accesibilidad, actividad verificada por el autor con una imagen de prueba.
- Resolucion de problemas matematicos y de palabra con modo pensamiento: adecuado para tareas que requieren cadenas de razonamiento largas, siempre que se configure un presupuesto de generacion superior a 4.000 tokens, ya que los seis fallos observados en la prueba del autor se debieron a agotar ese presupuesto y no a respuestas incorrectas.
- Red teaming y evaluacion de filtros de seguridad: al ser una variante con negativas ablacionadas, resulta util para generar conjuntos de prompts adversarios y medir la robustez de clasificadores o guardrails propios, asumiendo la responsabilidad legal y etica del uso.
- Investigacion sobre cuantizacion de 4 bits: sirve para comparar calidad, latencia y throughput entre las variantes bf16, FP8, NVFP4 y GGUF del mismo modelo, usando la divergencia KL y la tasa de finalizacion como metricas.
- Inferencia economica en una unica GPU Blackwell: el peso de 11,72 GB, frente a los 19,34 GB en bf16, reduce los requisitos de memoria y permite desplegar el modelo en una sola tarjeta con soporte FP4, liberando VRAM para la cache KV y para lotes mayores.
- Reproduccion de pipelines de cuantizacion: el flujo documentado con llm-compressor 0.13.0 y calibracion sobre 64 prompts sirve como plantilla para cuantizar otros modelos multimodales que combinen atencion completa con capas recurrentes.

## Benchmarks y rendimiento

La informacion disponible no incluye resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. El autor solo publica las siguientes mediciones, realizadas en vLLM 0.30.0 sobre una RTX PRO 6000 Blackwell:

| Medicion | NVFP4 | Heretic bf16 | Qwen3.5-9B original |
|---|---|---|---|
| Razonamiento en modo pensamiento (4 problemas x 10 semillas) | 34/40 finalizados y correctos | 40/40 | 40/40 |
| Throughput single-stream (generaciones de 512 tokens) | ~100 tok/s | ~57 tok/s | No disponible |
| Throughput agregado con batch 32 | ~2.550 tok/s | ~1.550 tok/s | No disponible |
| Tasa de rechazo (100 prompts) | No re-medido | 5/100 | 100/100 |
| Divergencia KL del proceso ARA | No re-medido | 0,0403 | No aplica |

Los seis fallos del modelo NVFP4 en la prueba de razonamiento se produjeron por agotar el presupuesto de 4.000 tokens mientras seguia en modo pensamiento; ninguno fue una respuesta incorrecta. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Acelerador obligatorio: NVFP4 requiere hardware NVIDIA Blackwell con soporte nativo de FP4. La validacion del autor se realizo en una RTX PRO 6000 Blackwell con vLLM 0.30.0.
- VRAM estimada: los pesos ocupan 11,72 GB, a los que hay que sumar cache KV, activaciones y el resto de componentes que permanecen en bf16 o fp32. No se dispone de una cifra oficial de VRAM total; cualquier calculo debe partir del tamano de pesos declarado.
- GPU recomendadas por el autor: RTX PRO 6000 Blackwell, con vLLM 0.30.0 o superior. Otras GPU Blackwell (por ejemplo, la serie RTX 50 de consumo o las B200/GB200) disponen de soporte FP4 a nivel de hardware, pero no estan validadas en la model card para esta build.
- GPU no compatibles con NVFP4: en tarjetas sin soporte FP4 hay que recurrir a las variantes bf16, FP8 o GGUF de la familia.
- Opciones de despliegue: vLLM (`vllm serve darrellbest/Qwen3.5-9B-Heretic-NVFP4`) para esta build NVFP4; la variante FP8 W8A8 tambien es para vLLM; las variantes GGUF estan pensadas para llama.cpp y Ollama, e incluyen un fichero mmproj de vision de 0,92 GB.
- Latencia y throughput medidos: aproximadamente 100 tok/s single-stream y 2.550 tok/s agregados con batch 32 y generaciones de 512 tokens, frente a 57 y 1.550 tok/s respectivamente en la version bf16 sobre el mismo hardware.

Opciones de cuantizacion de la familia y su tamano:

| Repositorio | Formato | Tamano | Compatibilidad |
|---|---|---|---|
| Qwen3.5-9B-Heretic | bf16 safetensors | 19,34 GB | transformers, vLLM, SGLang |
| Qwen3.5-9B-Heretic-FP8 | FP8 W8A8, compressed-tensors | 14,04 GB | vLLM |
| Qwen3.5-9B-Heretic-NVFP4 | NVFP4, compressed-tensors | 11,72 GB | vLLM sobre Blackwell |
| Qwen3.5-9B-Heretic-GGUF | GGUF BF16 / Q8_0 / Q4_K_M + mmproj de vision | 18,41 / 9,79 / 5,78 GB + 0,92 GB | llama.cpp, Ollama |

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros para comparar con otras familias de forma rigurosa. La comparacion mas fiable disponible es contra las otras variantes del mismo modelo, que comparten pesos de origen y solo difieren en el esquema de cuantizacion:

| Modelo | Parametros | Formato y tamano | Hardware | Tasa de rechazo declarada | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B-Heretic-NVFP4 | 9,65 B | NVFP4, 11,72 GB | vLLM sobre Blackwell | No re-medida (5/100 en bf16) | apache-2.0 |
| Qwen3.5-9B-Heretic | 9,65 B | bf16, 19,34 GB | transformers, vLLM, SGLang | 5/100 | apache-2.0 |
| Qwen3.5-9B-Heretic-FP8 | 9,65 B | FP8 W8A8, 14,04 GB | vLLM | No disponible | apache-2.0 |
| Qwen3.5-9B-Heretic-GGUF (Q4_K_M) | 9,65 B | GGUF, 5,78 GB + 0,92 GB mmproj | llama.cpp, Ollama | No disponible | apache-2.0 |
| Qwen/Qwen3.5-9B | No disponible | bf16 | transformers, vLLM | 100/100 | Ver licencia del repositorio de Qwen |

Frente a modelos de otras familias del mismo rango de tamano, la informacion disponible no incluye comparaciones medidas, por lo que no se pueden aportar cifras contrastadas.

## Limitaciones y advertencias

- Salvaguardas reducidas por diseno: el proceso ARA elimina el comportamiento de rechazo (5/100 rechazos en la variante bf16, frente a 100/100 en el original). El autor declara explicitamente que el usuario es responsable del uso que haga del modelo.
- Riesgo de contenido danino: al tratarse de una variante etiquetada como abliterated y uncensored, puede generar contenido que otros modelos rechazarian. Su uso en productos orientados al publico exige capas adicionales de moderacion.
- La tasa de rechazo de los pesos NVFP4 no se volvio a medir; la cifra de 5/100 corresponde a la version bf16 y no es extrapolable automaticamente.
- Razonamiento con presupuesto limitado: en la prueba del autor, 6 de 40 ejecuciones no terminaron dentro del limite de 4.000 tokens. En produccion conviene ampliar el presupuesto de generacion o asumir respuestas truncadas.
- Rendimiento dependiente de la cuantizacion: el paso a 4 bits no produjo respuestas incorrectas en la prueba, pero aumento la longitud del razonamiento, lo que incrementa el coste por consulta.
- Compatibilidad de hardware muy restringida: la build NVFP4 solo es utilizable en GPUs NVIDIA Blackwell con vLLM; no funciona en arquitecturas anteriores.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingue ni un comportamiento homogeneo fuera del ingles y el chino sin evaluacion propia.
- Longitud de contexto no declarada en la informacion disponible, lo que impide planificar cargas de documentos largos sin medirla.
- Riesgo de alucinacion inherente a los modelos de ~9 B, no cuantificado en la informacion disponible.
- Adopcion nula: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validacion de la comunidad ni informes de fallos en produccion.
- Licencia: la model card declara apache-2.0 con enlace a la licencia de Qwen/Qwen3.5-9B. Conviene verificar la licencia del modelo base antes de un uso comercial, ya que la ablacion de rechazos puede entrar en conflicto con las condiciones de uso de algunos proveedores o plataformas de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-NVFP4
- Modelo base (variante Heretic en bf16): https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-GGUF
- Variante FP8: https://huggingface.co/darrellbest/Qwen3.5-9B-Heretic-FP8
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Variante relacionada del mismo autor: https://huggingface.co/darrellbest/Qwen3.8-27B-Heretic-NVFP4
- Ficha de la variante GGUF en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-9b-heretic.html
- Guia de despliegue de Qwen 3.5 9B: https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
- Pagina del modelo en Ollama: https://ollama.com/library/qwen3.5:9b
