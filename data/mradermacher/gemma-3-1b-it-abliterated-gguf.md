# mradermacher/gemma-3-1b-it-abliterated-GGUF

## Resumen

`mradermacher/gemma-3-1b-it-abliterated-GGUF` es una coleccion de cuantizaciones GGUF del modelo `huihui-ai/gemma-3-1b-it-abliterated`, una variante "abliterated" (con los mecanismos de rechazo atenuados mediante edicion de direcciones de activacion) del Gemma 3 1B instruct de Google. El trabajo de cuantizacion lo firma mradermacher, un prolifico publicador de quants en Hugging Face, y el modelo base deriva directamente de la familia Gemma 3, publicada por Google en marzo de 2025.

El modelo resuelve el problema de desplegar un LLM conversacional de ~1.000 millones de parametros en hardware modesto (CPU, GPUs de gama baja, movil o edge) con formatos listos para llama.cpp y derivados, y con la particularidad de que la variante abliterated elimina en gran medida las respuestas de rechazo del modelo original. Es relevante para quienes necesitan un modelo pequeno, sin censura y ejecutable localmente, aunque con las limitaciones propias de su tamano.

La ficha se centra en el artefacto GGUF publicado; los datos de arquitectura, entrenamiento y benchmark del modelo base Gemma 3 1B no se incluyen en la model card proporcionada, por lo que se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Gemma 3 1B instruct de Google; transformer decoder-only segun la familia Gemma 3, no detallado en la model card) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (quants estaticos; existen quants ponderados/imatrix en repo separado) |
| Idiomas soportados | en (segun la model card) |
| Licencia | gemma (Gemma Terms of Use de Google, con gated access) |
| Formato de pesos | GGUF (el modelo base esta en transformers/safetensors) |

## Arquitectura y entrenamiento

No se detalla en la model card proporcionada la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico verificable es que el artefacto es una cuantizacion estatica (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) del modelo `huihui-ai/gemma-3-1b-it-abliterated`, que a su vez deriva de Gemma 3 1B instruct. La tecnica "abliteration" consiste en identificar y restar la direccion de activacion asociada al rechazo en el espacio latente del modelo, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones; no es un reentrenamiento sino una modificacion de pesos.

El trabajo de mradermacher se limita a la conversion y cuantizacion a GGUF para su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, koboldcpp, etc.). El repo incluye tanto quants estaticos como una variante separada con quants ponderados por importance matrix (`-i1-GGUF`), que suele ofrecer mejor calidad por bit que los quants estaticos equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles (idioma declarado: en).
- Modo chat/instruct, heredado de Gemma 3 1B IT.
- Comportamiento "uncensored": la ablacion reduce los rechazos ante peticiones que el modelo original declinaria.
- Inferencia local en CPU y GPU mediante llama.cpp y derivados.
- Compatible con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se documentan en la informacion proporcionada capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; la model card solo declara ingles.

## Casos de uso

- Prototipado rapido en local: cargar el quant Q4_K_M (~0,9 GB) en llama.cpp u Ollama para validar prompts y flujos conversacionales sin depender de APIs externas.
- Despliegue en edge y dispositivos con poca memoria: el quant Q4_K_S o IQ4_XS cabe en menos de 1 GB, apto para Raspberry Pi, mini-PC o moviles con llama.cpp.
- Generacion de texto creativo sin filtros editoriales: la variante abliterated permite explorar narrativa, roleplay o guiones sin los rechazos del modelo instruct original, siempre que el operador asuma la responsabilidad del contenido.
- Experimentacion en investigacion sobre alineacion y seguridad: util para estudiar el efecto de la ablacion comparando respuestas con el Gemma 3 1B IT original.
- Chatbot de bajo coste en ingles para demos o entornos internos donde no se requiere alta calidad linguistica y prima la latencia y el coste cero de inferencia.
- Base para fine-tuning ligero o LoRA: al ser un modelo de ~1B, se puede adaptar a dominios concretos con recursos modestos (una sola GPU consumer), aunque el formato GGUF no es el adecuado para entrenar (habria que partir del safetensors base).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada segun quant: Q2_K y Q3_K_S ~0,8 GB; Q4_K_S y Q4_K_M ~0,9 GB; Q5_K_M ~1,0 GB; Q6_K ~1,1 GB; Q8_0 ~1,2 GB; f16 ~2,1 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en GPUs integradas o CPU con suficiente RAM.
- Despliegue recomendado: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui; tambien es posible servir el modelo base en transformers con vLLM o TGI, pero el artefacto de esta ficha es GGUF y no esta pensado para esos servidores.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano (~1B) se espera inferencia en tiempo real en CPU moderna y muy rapida en GPU, pero no hay cifras oficiales.
- Para concatenar ficheros multiparte, seguir las instrucciones de los README de TheBloke referenciadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-3-1b-it-abliterated-GGUF | ~1B | no disponible | gemma | GGUF | Variante abliterated, solo ingles declarado |
| huihui-ai/gemma-3-1b-it-abliterated | ~1B | no disponible | gemma | safetensors | Modelo base del que deriva este GGUF |
| Gemma 3 1B IT (Google) | ~1B | no disponible | gemma | safetensors | Modelo original con alineacion intacta |
| Llama 3.2 1B Instruct | ~1,2B | no disponible | Llama 3.2 Community License | safetensors/GGUF | Alternativa de tamano similar, multilingue |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina parte de los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o ilegal; el operador es responsable del uso.
- Modelo de ~1B: capacidad de razonamiento, matematicas y codigo limitada en comparacion con modelos de 7B o superiores; propenso a alucinaciones en tareas complejas.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia Gemma de Google con acceso restringido (gated); revisar los terminos de uso comercial antes de desplegar en produccion.
- El modelo base es de marzo de 2025; puede estar desactualizado frente a versiones mas recientes de la familia Gemma.
- La cuantizacion introduce perdida de calidad adicional, especialmente en Q2_K y Q3_K_S; se recomienda Q4_K_M o superior para uso serio.
- No hay benchmarks publicados que permitan estimar la degradacion introducida por la ablacion ni por cada nivel de cuantizacion.
- El repo pesa 10,9 GB en total por incluir todos los quants; descargar solo el fichero necesario.

## Enlaces

- Repo Hugging Face: https://huggingface.co/mradermacher/gemma-3-1b-it-abliterated-GGUF
- Modelo base: https://huggingface.co/huihui-ai/gemma-3-1b-it-abliterated
- Quants imatrix/ponderados: https://huggingface.co/mradermacher/gemma-3-1b-it-abliterated-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#gemma-3-1b-it-abliterated-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplexidad por quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Pagina oficial de Gemma 3 (Google): no disponible en la informacion proporcionada
