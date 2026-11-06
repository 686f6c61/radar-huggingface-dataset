# mradermacher/Ostrich-27B-AHA-Gemma3-250519-GGUF

## Resumen

Ostrich-27B-AHA-Gemma3-250519-GGUF es la distribucion en formato GGUF del modelo Ostrich-27B-AHA-Gemma3-250519, un fine-tune de la familia Gemma 3 de Google con 27.009.346.304 parametros totales. El modelo base fue publicado por el usuario etemiz y esta etiquetado con los descriptores AHA y alignment, lo que sugiere un ajuste orientado a alineacion conversacional. Esta version GGUF la produce mradermacher, un conocido cuantizador de la comunidad de Hugging Face que distribuye pesos optimizados para inferencia local con llama.cpp y derivados.

El interes practico de esta ficha reside en que permite ejecutar un modelo de ~27B parametros en hardware de consumo mediante cuantizaciones que van desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB), ademas de incluir un proyector multimodal (mmproj) que habilita entrada de imagenes. Al tratarse de un derivado de Gemma 3, hereda la arquitectura transformer decoder-only de Google, aunque la model card no detalla la composicion exacta del dataset de ajuste ni el proceso de alineacion aplicado por etemiz.

La relevancia actual es doble: por un lado, ofrece una alternativa cuantizada de un modelo de 27B con capacidad multimodal para despliegues sin GPU de datacenter; por otro, ilustra el flujo habitual de la comunidad open source, donde un fine-tune se publica en safetensors y un tercero genera las cuantizaciones GGUF para su uso con Ollama, LM Studio o llama.cpp. La informacion publica disponible es limitada: no hay benchmarks, no se declara licencia explicita y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 3, segun el nombre y el modelo base) |
| Parametros totales | 27.009.346.304 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma 3, la familia de modelos abiertos de Google presentada en 2025 con arquitectura transformer decoder-only, atencion con ventana deslizante en capas alternas y soporte multimodal nativo para imagenes. El identificador Ostrich-27B-AHA-Gemma3-250519 sugiere que etemiz partio de una variante de 27B de Gemma 3 y aplico un ajuste etiquetado como AHA (probablemente un acronimo de un metodo de alineacion) con fecha 19 de mayo de 2025. La presencia de un proyector mmproj en la distribucion GGUF confirma que el modelo conserva la torre de vision del original.

No se dispone de informacion sobre el numero de tokens de entrenamiento del ajuste, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o preferencia directa. Tampoco se documentan innovaciones tecnicas especificas del fine-tune mas alla de la etiqueta alignment. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, output_tensor_quantised 1), que genera quantizaciones estaticas y, en un repositorio separado, variantes ponderadas con imatrix (i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Razonamiento y respuesta a instrucciones, heredado del ajuste de alineacion del modelo base.
- Entrada multimodal de imagenes gracias al proyector mmproj incluido (Q8_0 y f16).
- Generacion de codigo y matematicas a nivel de modelo de ~27B, aunque sin benchmarks publicados que lo confirmen.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como API.
- Soporte de cuantizaciones de baja precision (Q2_K en adelante) para entornos con VRAM limitada.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en una maquina con una unica GPU de 24 GB usando Q4_K_M (16,6 GB) o Q5_K_M (19,4 GB), sin depender de APIs externas.
- Analisis de imagenes en local: con el proyector mmproj-Q8_0 (0,7 GB) se pueden procesar capturas, diagramas o documentos escaneados y generar descripciones o extraer informacion textual.
- Prototipado de agentes conversacionales: la compatibilidad con endpoints permite exponer el modelo como servicio compatible con OpenAI y conectarlo a frameworks de agentes, aunque el soporte de tool calling no esta documentado.
- Investigacion sobre alineacion: al estar etiquetado como alignment y derivar de Gemma 3, sirve como punto de comparacion frente al modelo base para estudiar el efecto del ajuste AHA en respuestas y sesgos.
- Generacion de codigo en entornos aislados: con Q6_K (22,3 GB) en una RTX 4090 o A6000 se obtiene calidad cercana a la original para autocompletado y explicacion de fragmentos, sin enviar codigo a terceros.
- Despliegue en CPU con llama.cpp u Ollama: las variantes Q2_K (10,6 GB) y Q3_K (12-14 GB) permiten ejecutar el modelo en servidores sin GPU, con latencia mayor pero suficiente para tareas por lotes.
- Educacion y demostraciones: el tamaño manejable de las cuantizaciones bajas facilita talleres y demos en portatiles con GPU de 12-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~11-12 GB, Q3_K_M ~14-15 GB, IQ4_XS ~16 GB, Q4_K_M ~17-18 GB, Q5_K_M ~20-21 GB, Q6_K ~23-24 GB, Q8_0 ~29-30 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M a Q6_K; A6000 o RTX 6000 Ada (48 GB) para Q8_0 con contexto amplio; A100/H100 para despliegues concurrentes con vLLM o TGI (aunque estos motores requieren los safetensors originales, no GGUF).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M, Q5_K_M y Q6_K; en GPUs de 16 GB solo con Q3_K o IQ4_XS y contexto reducido; en GPUs de 12 GB solo con Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; para el modelo base en safetensors, transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa no verificada, un modelo denso de 27B en Q4_K_M sobre una RTX 4090 suele moverse en el orden de decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Ostrich-27B-AHA-Gemma3-250519-GGUF | 27,0B | no disponible | Si (mmproj) | no disponible | GGUF |
| Gemma 3 27B (Google) | 27B | no disponible en esta ficha | Si | Gemma Terms of Use | safetensors, GGUF (comunidad) |
| Qwen2.5 32B Instruct | 32,5B | 131.072 tokens (segun documentacion publica de Qwen) | No | Apache 2.0 | safetensors, GGUF |
| Mistral Small 3.1 24B | 24B | 128.000 tokens (segun documentacion publica de Mistral) | Si | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a datos publicos de los modelos alternativos; para Ostrich no hay benchmarks ni contexto declarado en la informacion proporcionada, por lo que la comparacion de rendimiento no puede realizarse con rigor.

## Limitaciones y advertencias

- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al de modelos multilingues.
- Licencia: no disponible. Antes de uso comercial es imprescindible verificar la licencia del modelo base (Gemma Terms of Use) y del fine-tune, ya que la ausencia de declaracion expresa impide asumir permisos.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones de alineacion, por lo que la calidad real del fine-tune AHA frente a Gemma 3 original es desconocida.
- Riesgo de alucinacion: inherente a los modelos de ~27B sin evaluacion publicada; no hay estudios de fidelidad factual para este fine-tune.
- Sesgos: no documentados; al derivar de Gemma 3 y entrenarse presumiblemente con datos en ingles, es esperable un sesgo cultural y linguistico hacia ese idioma.
- Cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad frente a Q4_K_M o superiores; para produccion se recomienda Q5_K_M o Q6_K.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; conviene consultar la model card del modelo base antes de disenar prompts largos.
- Tool calling y agentes: no se documenta soporte nativo, por lo que su uso en pipelines de agentes requiere validacion manual.
- Repositorio grande: 188,1 GB en total, lo que implica descargas parciales mediante ficheros GGUF individuales y no del repositorio completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ostrich-27B-AHA-Gemma3-250519-GGUF
- Modelo base (safetensors): https://huggingface.co/etemiz/Ostrich-27B-AHA-Gemma3-250519
- Quantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Ostrich-27B-AHA-Gemma3-250519-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Ostrich-27B-AHA-Gemma3-250519-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
