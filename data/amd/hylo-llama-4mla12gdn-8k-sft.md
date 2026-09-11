# amd/HyLo-Llama-4MLA12GDN-8K-SFT

## Resumen

HyLo-Llama-4MLA12GDN-8K-SFT es un checkpoint experimental publicado por AMD que convierte (upcycling) el transformer denso meta-llama/Llama-3.2-1B-Instruct en un modelo híbrido de 16 capas: 4 capas de Multi-head Latent Attention (MLA) y 12 capas de Gated DeltaNet, con 1.673.797.776 parámetros totales. La idea central es no entrenar un híbrido desde cero, sino reciclar un transformer preentrenado y sustituir la atención completa por mecanismos de estado recurrente de tamano fijo y por atención con cache latente de bajo rango, de modo que el KV cache se reduce al 3,9% del del modelo base.

El modelo se ha afinado por supervisión con destilación del profesor meta-llama/Llama-3.1-8B-Instruct a una longitud de contexto de 8.192 tokens (8K), con escalado YaRN de factor 4,0 sobre la ventana original de 2.048. Es relevante porque demuestra una via de escalado distinta a la del preentrenamiento masivo: reutilizar pesos existentes y reorganizar el mecanismo de atención para atacar el cuello de botella de memoria del KV cache en contextos largos, con un coste de entrenamiento relativamente bajo (8x AMD Instinct MI300X con FSDP).

El checkpoint pertenece a la familia introducida en el articulo "Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling" (arXiv:2604.24715), donde figura como HyLo-Llama-4MLA12GDN con backbone Llama-3.2-1B. Es un modelo de investigacion, solo en ingles, con licencia restringida a uso de investigacion, y con dos hermanos separados: una variante de 8K (esta) y otra de 64K entrenadas con la misma receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer: 4 capas MLA + 12 capas Gated DeltaNet (16 capas en total) |
| Parametros totales | 1.673.797.776 (1,67B; el paper reporta 1,7B) |
| Parametros activos | No aplica (no es un modelo MoE; todas las capas se ejecutan en cada token) |
| Longitud de contexto | 8.192 tokens entrenados y evaluados (con YaRN factor 4,0 sobre 2.048). El `config.json` hereda 131.072 de `max_position_embeddings`, pero no es una longitud soportada |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors a precision float32 (la model card recomienda cargar en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | amd-hybrid-models-research-only-rail-ms (solo investigacion). Las etiquetas del repositorio incluyen license:apache-2.0, pero el campo `license` de la model card indica la licencia de investigacion de AMD |
| Formato de pesos | safetensors (float32); el repositorio ocupa 6,7 GB |

Datos adicionales de arquitectura:

| Dimension MLA | Valor |
|---|---|
| Rango latente de KV (`kv_lora_rank`) | 128 |
| Rango latente de query (`q_lora_rank`) | 1.344 |
| Dim. de cabeza RoPE (`qk_rope_head_dim`) | 32 |
| Dim. de cabeza NoPE (`qk_nope_head_dim`) | 32 |
| Dim. de cabeza de valor (`v_head_dim`) | 64 |
| Cabezas de atencion | 32 |

| Dimension Gated DeltaNet | Valor |
|---|---|
| Cabezas (`gdn_num_heads`) | 6 |
| Dim. de cabeza (`gdn_head_dim`) | 256 |

Distribucion de capas: MLA en los indices `[1, 5, 10, 14]`; Gated DeltaNet en `[0, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 15]`. La colocacion es por indice, no por patron repetitivo, y situa las capas de atencion donde el modelo base es mas sensible a perder atencion completa. La configuracion hibrida vive en `hybrid_config.json`; `config.json` es la del modelo base y se conserva solo como referencia.

## Arquitectura y entrenamiento

El modelo parte de un transformer denso (Llama-3.2-1B-Instruct) y se "recicla" capa a capa en dos tipos. Las 4 capas MLA mantienen atencion, pero cachean un latente de bajo rango (`kv_lora_rank` de 128) en lugar de claves y valores completos. Las 12 capas Gated DeltaNet son bloques de atencion lineal con regla delta y compuerta que mantienen un estado recurrente de tamano fijo, por lo que no contribuyen nada al KV cache. El resultado combinado es un KV cache del 3,9% del que usaria el modelo base. La inicializacion de los bloques nuevos se alinea con las representaciones internas del modelo original mediante Enhanced-ILD.

El entrenamiento tiene dos etapas. La primera es Enhanced-ILD: destilacion capa a capa a 2.048 tokens de contexto, con learning rate 2e-4 y el 20% de la mezcla de SFT. La segunda es SFT de contexto largo con destilacion guiada por profesor: destilacion extremo a extremo desde Llama-3.1-8B-Instruct a 8.192 tokens, learning rate 6e-5, mezcla completa, batch global de 32 secuencias, 1 epoca, schedule coseno con warmup del 0,01 y precision mixta bfloat16. La funcion de perdida es divergencia KL entre las distribuciones next-token del estudiante y del profesor (`kl_weight` 1,0, `ce_weight` 0,0), con un kernel KL fusionado que evita materializar el tensor completo de logits. El hardware de entrenamiento fueron 8 GPU AMD Instinct MI300X con FSDP.

Los datos de SFT provienen de cinco conjuntos: JunxiongWang/sftdatasetv3 (apache-2.0), nvidia/OpenMathInstruct-2 (cc-by-4.0), open-thoughts/OpenThoughts-114k (apache-2.0), open-r1/OpenR1-Math-220k (apache-2.0) y nvidia/ChatQA2-Long-SFT-data (cc-by-nc-2.0). AMD uso variantes procesadas de estos datasets con submuestreo, reformateo a la plantilla de chat y descontaminacion contra las suites de evaluacion.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat heredada de Llama-3.2-1B-Instruct.
- Razonamiento matematico y resolucion de problemas, reforzado por la destilacion sobre OpenMathInstruct-2 y OpenR1-Math-220k.
- Razonamiento con cadenas de pensamiento, gracias a la inclusion de OpenThoughts-114k en la mezcla de SFT.
- Comprension de documentos largos y question answering sobre contexto extenso, con ChatQA2-Long-SFT-data como fuente especifica.
- Eficiencia de memoria en inferencia: el KV cache es el 3,9% del del modelo base, lo que permite sostener conversaciones de hasta 8K tokens con un coste de memoria muy bajo.
- Generacion de codigo: no confirmada explicitamente en la informacion disponible; la mezcla sftdatasetv3 suele incluir datos de codigo, pero la model card no lo detalla.
- Tool calling / function calling: no disponible; no se menciona soporte en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo es un checkpoint de investigacion de 1,67B sin herramientas documentadas.
- Vision y audio: no soportados.
- Modo "thinking" explicito: no disponible.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Investigacion en compresion de KV cache: el modelo sirve como banco de pruebas reproducible para medir como afecta la sustitucion de atencion completa por MLA y Gated DeltaNet a la calidad, comparando contra Llama-3.2-1B-Instruct con el mismo harness de evaluacion.
- Question answering sobre documentos largos: con 8.192 tokens de contexto y un cache del 3,9%, se puede alimentar un informe o un contrato completo y formular preguntas de comprension lectora sin agotar la memoria de una GPU pequena.
- RAG con contexto extenso: en lugar de recortar los fragmentos recuperados, se pueden concatenar muchos pasajes hasta 8K tokens, algo util para bases documentales tecnicas en ingles.
- Atencion al cliente automatizada en ingles: conversaciones multi-turno con historial largo, donde el bajo coste de KV cache permite mantener sesiones simultaneas en un solo acelerador.
- Asistente de matematicas para prototipos educativos: el modelo esta destilado sobre datos de matematicas y puede resolver problemas paso a paso, util para validar interfaces de tutoria antes de pasar a un modelo mayor.
- Procesamiento por lotes en hardware modesto: clasificacion, extraccion de campos y resumen de grandes volumenes de texto en ingles caben en una GPU de consumo, lo que abarata pipelines offline.
- Evaluacion de despliegue de arquitecturas hibridas: sirve para medir latencia, throughput y comportamiento de kernels MLA/GDN en stacks de serving antes de comprometerse con variantes mayores.
- Generacion de datos sinteticos y destilacion inversa: al ser un estudiante de Llama-3.1-8B-Instruct, es util para estudiar que capacidades se retienen y cuales se pierden al comprimir el profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` del repositorio declara la entrada `HyLo-Llama-4MLA12GDN-8K-SFT` con una lista de resultados vacia, por lo que no hay cifras verificables de MMLU, HumanEval, GSM8K ni de ninguna otra suite en los datos proporcionados.

| Suite o metrica | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluaciones comunes del paper (Tabla 2, backbone Llama-3.2-1B) | No incluidos en la informacion proporcionada (la model card los referencia pero el contenido citado se corta antes de mostrarlos) |
| RULER (contexto largo) | Referenciado en la model card, pero sin cifras en la informacion disponible |

La model card indica que todas las cifras del paper se midieron con EleutherAI lm-evaluation-harness en regimen 0-shot, y menciona que los numeros de RULER ilustran el deterioro al empujar un modelo entrenado a 8K por encima de su longitud de entrenamiento. Las cifras concretas no forman parte de la informacion suministrada.

## Requisitos de hardware

- Pesos en float32: 6,7 GB (el repositorio ocupa exactamente eso). Cargados en bfloat16, el peso baja a aproximadamente 3,35 GB.
- VRAM estimada para inferencia en bfloat16: en torno a 4-5 GB contando pesos y overhead de runtime, sin contar el KV cache, que es marginal (3,9% del de Llama-3.2-1B).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2 GB; en 4 bits, aproximadamente 1-1,2 GB. Estas cifras son estimaciones aritmeticas sobre el numero de parametros, ya que no se publican pesos cuantizados.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB entra en bfloat16 con contexto de 8K; en 6 GB es ajustado y en 4 GB requeriria cuantizacion no publicada oficialmente.
- GPU de datacenter: A100, H100, MI300X y similares no son necesarias para inferencia; se usaron MI300X exclusivamente para el entrenamiento.
- Opciones de despliegue: no disponible de forma confirmada. La model card menciona que los stacks de serving dimensionan el KV cache a partir de `max_position_embeddings` y recomienda fijar la longitud maxima explicitamente (por ejemplo, `--max-model-len 8192`), lo que sugiere compatibilidad con vLLM, pero la arquitectura MLA + Gated DeltaNet requiere kernels especificos que no estan documentados en la informacion proporcionada. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama exigirian una conversion e implementacion propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyLo-Llama-4MLA12GDN-8K-SFT | 1,67B | 8.192 tokens | Hibrida (4 MLA + 12 Gated DeltaNet), KV cache al 3,9% | amd-hybrid-models-research-only-rail-ms (solo investigacion) | Pesos safetensors en HuggingFace, sin benchmarks publicados en la ficha |
| meta-llama/Llama-3.2-1B-Instruct (modelo base) | 1,24B | 131.072 tokens declarados | Transformer denso con GQA | Llama 3.2 Community License | Ampliamente disponible, soporte maduro en todos los stacks |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens nativos | Transformer denso con GQA | Apache-2.0 | Muy disponible, con variantes GGUF y AWQ/GPTQ |

La comparacion relevante para HyLo no es de calidad, puesto que no hay cifras publicadas, sino de eficiencia estructural: frente al modelo base reduce el KV cache a un 3,9% a cambio de recortar el contexto util de 131.072 a 8.192 tokens y de restringir la licencia. Qwen2.5-1.5B-Instruct es la alternativa practica si se necesita licencia permisiva, contexto de 32K y despliegue inmediato en llama.cpp o vLLM. Para contexto de 16K o superior dentro de la propia familia HyLo, la model card remite al hermano de 64K, entrenado con la misma receta.

## Limitaciones y advertencias

- Licencia de solo investigacion: el campo `license` de la model card apunta a amd-hybrid-models-research-only-rail-ms. Aunque las etiquetas del repositorio incluyen apache-2.0, esa discrepancia debe resolverse antes de cualquier uso comercial; en la practica, tratese como no apto para produccion comercial.
- Obligaciones del modelo base: al derivar de Llama-3.2-1B-Instruct, pueden seguir aplicando los terminos de la Llama 3.2 Community License, incluida la clausula de nombramiento y las restricciones de uso.
- Dataset no comercial: nvidia/ChatQA2-Long-SFT-data se distribuye bajo cc-by-nc-2.0, lo que refuerza la cautela sobre usos comerciales del checkpoint.
- Trampa de configuracion: `max_position_embeddings` vale 131.072 en `config.json`, heredado del modelo base, pero la longitud real soportada es 8.192. Si no se fija explicitamente el limite, el stack de serving reservara KV cache para un contexto que el modelo no soporta y la calidad se degradara mas alla de 8K.
- Idiomas: solo ingles. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Sin benchmarks verificables: la ficha no publica MMLU, GSM8K, HumanEval ni RULER, asi que no se puede estimar la calidad frente a alternativas sin reproducir la evaluacion.
- Riesgo de alucinacion: es un modelo de 1,67B destilado de un profesor de 8B; la compresion de conocimiento y la destilacion por KL sobre next-token tienden a producir respuestas plausibles pero no verificadas, especialmente fuera de los dominios de la mezcla de SFT.
- Degradacion fuera de la longitud de entrenamiento: la propia model card advierte del deterioro en RULER al usar el modelo por encima de su contexto de entrenamiento.
- Pesos en float32: hay que convertirlos a bfloat16 para un uso eficiente; cargarlos tal cual duplica el consumo de memoria y el stack debe soportar la arquitectura hibrida definida en `hybrid_config.json`, no la de `config.json`.
- Soporte de tooling limitado: sin pesos GGUF, sin cuantizaciones publicadas y con una arquitectura no estandar, la integracion en llama.cpp, Ollama o TGI no esta garantizada.
- Modelo de investigacion sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion independiente y de comunidad de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Llama-4MLA12GDN-8K-SFT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor de destilacion: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper principal (Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling): https://arxiv.org/abs/2604.24715
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2505.17272
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2503.11132
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/amd/HyLo-Llama-4MLA12GDN-8K-SFT/blob/main/LICENSE
