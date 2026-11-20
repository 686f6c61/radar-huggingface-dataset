# mradermacher/Blur-7b-v1.21-GGUF

## Resumen

Blur-7b-v1.21-GGUF es la distribucion en formato GGUF del modelo liminerity/Blur-7b-v1.21, un merge de modelos de 7B creado con mergekit/lazymergekit. La cuantizacion la realiza mradermacher, un conocido publicador de versiones GGUF de modelos open source, y esta pensada para su uso con llama.cpp y herramientas compatibles. El modelo base combina al menos tres componentes: udkai/Turdus, decruz07/kellemar-DPO-Orca-Distilled-7B-SLERP y liminerity/Blur-7b-v1.2, lo que sugiere un enfoque de fusion de capacidades conversacionales y de razonamiento.

El modelo cuenta con 7.241.732.096 parametros (aproximadamente 7,2B) y esta disponible unicamente en ingles. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales significativas. La relevancia de esta ficha radica en que ofrece una via sencilla de desplegar un modelo de 7B fusionado en hardware de consumo, con multiples niveles de cuantizacion que van desde 2,8 GB (Q2_K) hasta 14,6 GB (f16).

Al tratarse de un merge sin model card tecnica detallada del autor original, gran parte de las especificaciones de entrenamiento, contexto y benchmarks no estan documentadas publicamente. Esta ficha refleja unicamente los datos verificables disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos de 7B; detalles no disponibles) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un merge creado con mergekit y lazymergekit a partir de tres modelos base: udkai/Turdus, decruz07/kellemar-DPO-Orca-Distilled-7B-SLERP y liminerity/Blur-7b-v1.2. La tecnica exacta de fusion (SLERP, TIES, DARE, linear, etc.) no esta documentada en la informacion disponible, aunque la presencia de "SLERP" en el nombre de uno de los componentes sugiere que se empleo al menos esa tecnica en alguna fase. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo final (aunque uno de los componentes, kellemar-DPO-Orca-Distilled, indica que si se aplico DPO en su origen).

No se han documentado innovaciones tecnicas especificas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Al ser un merge de modelos de 7B, se espera una arquitectura transformer densa estandar, pero no hay confirmacion explicita en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles con calidad propia de un modelo de 7B fusionado.
- Razonamiento conversacional multi-turno, heredado de los componentes DPO/Orca del merge.
- Capacidad de instrucciones y dialogo, segun los modelos base empleados.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en equipos de consumo gracias a sus cuantizaciones de 4-5 GB, ofreciendo respuestas de chat multi-turno sin dependencia de la nube.
- Prototipado rapido de aplicaciones de chat: al ser un GGUF ligero (Q4_K_M de 4,5 GB), permite iterar sobre prompts y flujos conversacionales en portatiles con GPU modesta.
- Generacion de texto creativo y redaccion en ingles: adecuado para borradores, resumenes y reescritura en entornos donde no se requiere maxima precision factual.
- Educacion y experimentacion con merges: util para investigadores que quieran estudiar el comportamiento de modelos fusionados frente a sus componentes originales.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecucion en CPU o GPUs con poca VRAM.
- Fine-tuning posterior o evaluacion comparativa: al estar disponible en safetensors el modelo base, se puede usar como punto de partida para ajuste fino o como referencia en estudios de merges.
- Chatbots de soporte en ingles para demos internas: con la licencia Apache 2.0 se puede integrar en prototipos comerciales sin friccion legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K (2,8 GB): ~3-4 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L (3,3-3,9 GB): ~4-5 GB de VRAM.
  - IQ4_XS / Q4_K_S / Q4_K_M (4,0-4,5 GB): ~5-6 GB de VRAM.
  - Q5_K_S / Q5_K_M (5,1-5,2 GB): ~6-7 GB de VRAM.
  - Q6_K (6,0 GB): ~7-8 GB de VRAM.
  - Q8_0 (7,8 GB): ~9-10 GB de VRAM.
  - f16 (14,6 GB): ~16 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 no necesarias pero validas para despliegues de mayor volumen.
- Cabe en GPU de consumo: si, desde GPUs de 6-8 GB (Q4) hasta 16 GB (f16). Las variantes Q2/Q3 pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Tambien es posible usar el modelo base en safetensors con transformers/vLLM/TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Blur-7b-v1.21-GGUF | 7,2B | no disponible | Apache 2.0 | GGUF | Merge de 3 modelos; solo ingles |
| Mistral-7B-Instruct (referencia) | 7,2B | 8k-32k (segun version) | Apache 2.0 | safetensors, GGUF | Modelo base ampliamente usado; contexto documentado |
| Llama-3.1-8B-Instruct (referencia) | 8B | 128k | Llama 3.1 Community | safetensors, GGUF | Mayor contexto y ecosistema; licencia con restricciones |
| Zephyr-7B-beta (referencia) | 7,2B | 32k | MIT | safetensors, GGUF | Entrenado con DPO; contexto documentado |

La comparativa se ofrece como referencia de categoria (modelos densos de ~7-8B); no se dispone de datos de rendimiento del modelo Blur para comparar numericamente.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha documentado capacidad multilingue.
- No hay informacion sobre la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Al ser un merge sin evaluacion publica, el riesgo de alucinacion y de comportamientos inconsistentes es mayor que en modelos con benchmarks verificados.
- No se han documentado sesgos especificos; se heredan los de los modelos base (Turdus, kellemar-DPO-Orca-Distilled, Blur-7b-v1.2).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base por si imponen restricciones adicionales.
- El repositorio ocupa 63,9 GB por incluir todas las cuantizaciones; descargar solo la variante necesaria.
- No se garantiza soporte de tool calling ni de agentes; no documentado.
- Modelo con pocas descargas (222) y un solo like en el momento de la consulta, lo que indica escasa validacion por la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Blur-7b-v1.21-GGUF
- Modelo base: https://huggingface.co/liminerity/Blur-7b-v1.21
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Blur-7b-v1.21-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Blur-7b-v1.21-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Componente del merge: https://huggingface.co/udkai/Turdus
- Componente del merge: https://huggingface.co/decruz07/kellemar-DPO-Orca-Distilled-7B-SLERP
- Componente del merge: https://huggingface.co/liminerity/Blur-7b-v1.2
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
