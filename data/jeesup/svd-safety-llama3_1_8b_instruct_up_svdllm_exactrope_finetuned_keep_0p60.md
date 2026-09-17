# Jeesup/svd-safety-llama3_1_8b_instruct_up_svdllm_exactrope_finetuned_keep_0p60

## Resumen

Este repositorio contiene una version comprimida de `meta-llama/Llama-3.1-8B-Instruct` obtenida aplicando el metodo completo SVD-LLM con el codigo original de los autores (repositorio `AIoT-MLSys-Lab/SVD-LLM`, commit `7538cca98880`). El autor, Jeesup, ha publicado el checkpoint bajo el identificador `svd-safety-llama3_1_8b_instruct_up_svdllm_exactrope_finetuned_keep_0p60`, con una fraccion realizada de parametros de 0,5998, es decir, se elimina el 40 % de los parametros segun la metrica de truncamiento del metodo.

El interes de la ficha es doble. Por un lado, documenta una adaptacion tecnica necesaria del codigo original de SVD-LLM para que funcione con Llama-3.x: la implementacion original de `SVD_LlamaAttention` asume atencion multi-cabeza clasica y no soporta grouped-query attention (32 cabezas de consulta y 8 de clave/valor en Llama-3.1-8B), por lo que el autor parcheo `component/svd_llama.py` para dimensionar k/v con `num_key_value_heads` y aplicar `repeat_kv`. Por otro, corrige el calculo de RoPE en las etapas LoRA, que en el codigo original usaba una base fija de 10.000 e ignoraba `rope_theta` y `rope_scaling`; la celda `exactrope` recalcula las tablas rotatorias a partir de la configuracion del modelo.

El resultado es un checkpoint denso con formas estandar de Llama que carga con `transformers` sin codigo de modelado personalizado, pero que es deficiente en rango, no mas pequeno en disco. La model card incluye mediciones de perplexity, seis benchmarks de conocimiento y razonamiento, y varias tasas de ataque exitoso y de sobrerrechazo, lo que lo convierte en un artefacto pensado para investigacion sobre compresion y su interaccion con la alineacion de seguridad, mas que para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama-3.1-8B-Instruct) con factores SVD truncados y plegados de nuevo a formas densas (`W = U @ V`) |
| Parametros totales | 8.030.261.248 (8,03 B) segun los pesos safetensors; el checkpoint conserva las formas densas originales |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la ficha del modelo; el modelo base declara 128.000 tokens |
| Tipos de cuantizacion | No disponible. Al conservar formas densas de Llama, en principio seria convertible con herramientas estandar (GGUF, AWQ, GPTQ), pero no esta verificado y la deficiencia de rango puede afectar a algunos kernels |
| Idiomas soportados | No disponible en la ficha; el modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | `llama3.1` (licencia comunitaria de Meta Llama 3.1) |
| Formato de pesos | `safetensors` (tamano del repositorio: 16,1 GB) |
| Fraccion de parametros retenida | 0,5998 (se elimina el 40 %) |
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Fecha de creacion / actualizacion | 17 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only con 32 capas, atencion con grouped-query attention (32 cabezas de consulta y 8 de clave/valor) y RoPE. Sobre ella se aplica el pipeline de compresion SVD-LLM en cinco etapas: blanqueamiento de datos (data whitening), truncamiento SVD de los pesos, LoRA sobre los factores U, fusion (merge), LoRA sobre los factores V, fusion de nuevo y plegado final a un checkpoint denso. La calibracion del blanqueamiento usa 256 secuencias de WikiText-2 de 2.048 tokens con semilla 3. La actualizacion de parametros emplea LoRA con r=8, 2 epocas por factor, learning rate 0,0001 y batch de 64 sobre `yahma/alpaca-cleaned`.

Dos innovaciones respecto al codigo upstream merecen atencion. La primera es el parche de grouped-query attention: al dimensionar k/v por `num_key_value_heads` y aplicar `repeat_kv` (codigo tomado del propio `component/svd_mistral.py` del repositorio, ya que Mistral tambien usa GQA), mas un recorte de la mascara causal para transformers >= 4.43, el forward pass funciona sobre Llama-3.x y la etapa LoRA deja de fallar. El autor afirma que la aritmetica de truncamiento no cambia: los 224 rangos de capa son identicos a los que produce el clon sin parchear, porque `whitening()` deriva cada factor de las formas reales de los pesos; solo difieren las formas declaradas del modulo. El fichero parcheado tiene sha256 `e65f644f9316`.

La segunda es el RoPE exacto en las etapas LoRA. El `SVD_LlamaAttention` original calcula los embeddings rotatorios con base fija de 10.000 e ignora `rope_theta` y `rope_scaling`, de modo que la recuperacion LoRA en Llama-3.x se entrenaba bajo posiciones que el modelo nunca utiliza. Esta celda se reconstruyo con tablas rotatorias calculadas desde la configuracion del modelo (variable `SVDLLM_EXACT_ROPE=1`) y se verifico que son identicas a las de la atencion estandar. Por lo demas, la receta, la semilla y el ratio son los mismos que los de la celda original sin `exactrope`.

## Capacidades

- Generacion de texto conversacional e instruccional en formato chat, heredada de Llama-3.1-8B-Instruct, con degradacion medible por la compresion.
- Razonamiento de sentido comun y conocimiento factual a nivel de benchmark multiple-choice (ARC, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA).
- Resolucion de problemas aritmeticos basicos y de opcion multiple (MathQA con `acc_norm` de 0,2704), sin datos de rendimiento en generacion matematica abierta.
- Respuesta a plantillas de chat: toda la evaluacion se realiza aplicando la plantilla de chat con decodificacion greedy.
- Capacidad multilingue: no documentada en esta ficha; depende del modelo base.
- Tool calling / function calling: no documentado en esta ficha; el modelo base lo soporta, pero no hay evaluacion del checkpoint comprimido.
- Modo thinking, vision o audio: no disponible.
- Uso como objeto de estudio para analisis de seguridad: se publican tasas ASR frente a AdvBench y StrongREJECT, y tasas de sobrerrechazo frente a XSTest-safe y OR-Bench-Hard-1K.

## Casos de uso

- Investigacion sobre compresion de modelos: comparar esta celda `exactrope` con la celda equivalente sin RoPE exacto permite aislar el efecto de alinear las tablas rotatorias durante la recuperacion LoRA sobre la calidad final.
- Estudios de ablacion de ratio de compresion: al existir celdas hermanas con otros ratios de retencion, este checkpoint sirve como punto de referencia en la curva calidad-ratio medida con perplexity en WikiText-2.
- Evaluacion de alineacion bajo compresion: las metricas de ASR (AdvBench 0,7115 y StrongREJECT 0,5974) y de sobrerrechazo (macro 0,0228) permiten analizar si el truncamiento SVD degrada las barreras de seguridad del modelo base o simplemente su calidad general.
- Red-teaming academico: el modelo es util como sujeto de pruebas para estudiar si las tasas de ataque exitoso elevadas reflejan una perdida real de alineacion o una degeneracion de la generacion, tal como advierte la propia model card.
- Sustitucion en pipelines de investigacion ya existentes: al plegarse a formas densas de Llama y cargar con `transformers` estandar, se puede insertar en un harness de evaluacion existente sin adaptar el codigo de modelado, unicamente cambiando la ruta del checkpoint.
- Experimentos de despliegue con presupuesto de memoria: aunque el checkpoint ocupa lo mismo en disco, su deficiencia de rango permite estudiar como se comportan los kernels de inferencia (vLLM, TGI) ante matrices de bajo rango.
- Docencia y reproducibilidad: el repositorio incluye las salidas por prompt y los ficheros de metricas brutos en los directorios `utility/` y `safety/`, lo que facilita reproducir y auditar el proceso de evaluacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,5998 |
| Perplexity en WikiText-2 | 23,6300 |
| ARC-Easy (`acc_norm`) | 0,6040 |
| ARC-Challenge (`acc_norm`) | 0,3780 |
| HellaSwag (`acc_norm`) | 0,5672 |
| WinoGrande (`acc`) | 0,6298 |
| OpenBookQA (`acc_norm`) | 0,3740 |
| PIQA (`acc_norm`) | 0,7018 |
| MathQA (`acc_norm`) | 0,2704 |
| AdvBench HarmBench ASR | 0,7115 |
| StrongREJECT HarmBench ASR | 0,5974 |
| Tasa de sobrerrechazo (XSTest-safe) | 0,0288 |
| Tasa de sobrerrechazo (OR-Bench-Hard-1K) | 0,0168 |
| Tasa de sobrerrechazo macro | 0,0228 |

Metodologia de evaluacion: perplexity en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; generaciones de AdvBench y StrongREJECT juzgadas con `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K juzgado con `allenai/wildguard`. Toda la generacion usa la plantilla de chat con decodificacion greedy.

Fiabilidad del juicio de sobrerrechazo en esta celda: fraccion puntuada de 0,97 en XSTest-safe y 0,99 en OR-Bench-Hard-1K, segun el autor.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parametros (8,03 B) y no proceden de mediciones publicadas por el autor; la ficha no incluye latencias ni throughput.

- Pesos en fp16/bf16: aproximadamente 16,1 GB solo en pesos. Con cache KV y activaciones, el consumo se situa en torno a 18-22 GB segun longitud de secuencia y tamano de batch.
- Pesos en int8: aproximadamente 8-9 GB, con un total estimado de 10-12 GB.
- Pesos en int4: aproximadamente 4,5-5,5 GB, con un total estimado de 6-8 GB. La conversion no esta verificada para este checkpoint.
- Cache KV: con GQA de 8 cabezas KV, 32 capas y dimension de cabeza 128, en fp16 ocupa unos 128 KiB por token, es decir, unos 16 GB para llenar 128.000 tokens de contexto. El coste de contexto largo es, por tanto, el factor dominante.
- GPU de gama profesional: A100 en 40 o 80 GB, H100 de 80 GB y L40S de 48 GB permiten fp16 con contexto amplio.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en fp16 sin contexto largo; con cuantizacion a 4 bits el modelo cabe comodamente en GPUs de 8-12 GB.
- Multi-GPU: dos RTX 3090 o 4090 permiten repartir los pesos en fp16 y ampliar el presupuesto de cache KV.
- Opciones de despliegue: `transformers` de forma nativa, sin codigo de modelado personalizado, ya que los factores se pliegan a formas densas de Llama. vLLM y TGI serian teoricamente compatibles con las mismas formas, aunque no hay confirmacion del autor. La conversion a GGUF para llama.cpp u Ollama no esta verificada y la deficiencia de rango podria complicar algunos kernels de cuantizacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SVD-LLM keep 0.60, exactrope) | 8,03 B almacenados; fraccion retenida 0,5998 | No disponible en la ficha | Perplexity WikiText-2 23,63; ARC-C 0,3780; HellaSwag 0,5672; ASR AdvBench 0,7115 | `llama3.1` | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8,03 B | 128.000 tokens declarados | No disponible en la informacion proporcionada para esta comparativa | `llama3.1` | HuggingFace, ampliamente distribuido |
| Otras celdas SVD-LLM del mismo autor (por ejemplo, la version sin `exactrope`) | No disponible | No disponible | No disponible | `llama3.1` | Referenciadas en la model card, sin datos publicados en la informacion disponible |

No se dispone de resultados de benchmarks del modelo base ni de otras alternativas comprimidas dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. Las unicas referencias cruzadas son las celdas hermanas del propio autor, cuyo rendimiento no se detalla.

## Limitaciones y advertencias

- La propia model card advierte de que comprimir a este ratio puede degradar la calidad de generacion. La perplexity de 23,63 en WikiText-2 es coherente con una perdida notable de modelado del lenguaje.
- Las cifras de seguridad no deben interpretarse como evidencia sobre alineacion. El autor senala explicitamente que los numeros de seguridad de un modelo degenerado no informan sobre su alineacion, y que hay que leer las columnas de sobrerrechazo y de seguimiento de instrucciones junto a las de ASR antes de extraer conclusiones de comportamiento.
- Las tasas de ataque exitoso son altas: 0,7115 en AdvBench y 0,5974 en StrongREJECT. Cualquier uso que dependa de rechazar peticiones daninas es arriesgado sin una evaluacion adicional.
- El checkpoint no es mas pequeno en disco que el modelo base: 16,1 GB de repositorio para 8,03 B de parametros densos. La compresion es de rango, no de almacenamiento, por lo que no reduce requisitos de memoria respecto a Llama-3.1-8B-Instruct en fp16.
- Existe riesgo de alucinacion y de generacion degenerada, aumentado por la compresion. No se han publicado evaluaciones especificas de fidelidad factual.
- Idiomas soportados no documentados para este checkpoint. El comportamiento multilingue puede degradarse de forma desigual respecto al modelo base.
- Restricciones de licencia: se hereda la licencia comunitaria `llama3.1` de Meta, que impone condiciones de uso (incluidas clausulas de atribucion y restricciones para determinados usos y para despliegues a gran escala). No es una licencia de codigo abierto permisiva sin condiciones.
- El parche de grouped-query attention y el RoPE exacto son modificaciones del autor sobre el codigo original de SVD-LLM, no parte del metodo publicado. Aunque el autor afirma que la aritmetica de truncamiento es identica, conviene auditar el fichero parcheado si se va a reproducir el proceso.
- El modelo no esta pensado para produccion: cero descargas y cero likes en el momento de redactar la ficha, sin pipeline declarado ni validacion externa.
- La fecha de creacion del repositorio que reporta HuggingFace (17 de septiembre de 2026) es posterior a la fecha de redaccion habitual de este tipo de fichas; conviene verificarla en la plataforma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_1_8b_instruct_up_svdllm_exactrope_finetuned_keep_0p60
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Codigo de SVD-LLM utilizado (commit `7538cca98880`): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de ajuste LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de calibracion del blanqueamiento: WikiText-2 (no se proporciona enlace directo en la model card)
- Juez de seguridad para AdvBench y StrongREJECT: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrechazo: https://huggingface.co/allenai/wildguard
- Paper de SVD-LLM: referenciado en el repositorio de GitHub; no se proporciona el identificador en la informacion disponible
- Resultados de la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre el modelo. Los unicos resultados obtenidos corresponden a paginas de transporte y turismo en Windsor (londontoolkit.com), sin relacion alguna con este checkpoint.
