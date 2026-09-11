# amd/HyLo-Llama-14MLA14GDN-64K-SFT

## Resumen

HyLo-Llama-14MLA14GDN-64K-SFT es un checkpoint experimental de AMD que convierte (upcycling) el transformer denso meta-llama/Llama-3.2-3B-Instruct en un modelo hibrido de 28 capas: 14 capas de Multi-head Latent Attention (MLA) y 14 capas de Gated DeltaNet, un bloque de atencion lineal con regla delta y compuerta que mantiene un estado recurrente de tamano fijo. El objetivo es reducir drasticamente el coste de la cache KV en contextos largos: las capas Gated DeltaNet no generan cache KV y las MLA cachean un latente de bajo rango en lugar de claves y valores completos, lo que deja la cache total en un 4,7 % de la del modelo base.

El modelo tiene 3.971.381.500 parametros (el paper reporta 4,0B) y se entreno por SFT con contexto de 65.536 tokens, usando meta-llama/Llama-3.1-8B-Instruct como profesor de destilacion. El proceso combina una fase de destilacion capa a capa (Enhanced-ILD) a 2.048 tokens y una fase de ajuste supervisado con destilacion del profesor a 64K tokens. Forma parte del trabajo "Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling" (arXiv:2604.24715), donde aparece como HyLo-Llama-14MLA14GDN en la Tabla 3.

Su relevancia es doble: por un lado demuestra que se puede reutilizar un transformer preentrenado en lugar de preentrenar un hibrido desde cero; por otro, es una pieza de investigacion sobre atencion lineal e hibridos con licencia exclusivamente de investigacion, lo que limita su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido por capas: 14 capas Multi-head Latent Attention (MLA) + 14 capas Gated DeltaNet (atencion lineal con regla delta y compuerta) |
| Parametros totales | 3.971.381.500 (3,97B); el paper reporta 4,0B |
| Longitud de contexto | 65.536 tokens de entrenamiento y evaluacion (YaRN con factor 32,0 sobre una ventana original de 2.048). El campo max_position_embeddings del config es 131.072 pero no es una longitud soportada |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en float32 y recomienda cargarlos en bfloat16; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | amd-hybrid-models-research-only-rail-ms (AMD Hybrid Models Research Only). El frontmatter de la model card declara tambien apache-2.0, pero prevalece la licencia personalizada de investigacion |
| Formato de pesos | safetensors (precision float32; el repositorio ocupa 15,9 GB) |
| Capas | 28 en total (14 MLA en indices pares 0-26; 14 Gated DeltaNet en indices impares 1-27) |
| Cache KV | 4,7 % de la del modelo base Llama-3.2-3B-Instruct |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Profesor de destilacion | meta-llama/Llama-3.1-8B-Instruct |

Detalles dimensionales de MLA: kv_lora_rank 128, q_lora_rank 1536, qk_rope_head_dim 64, qk_nope_head_dim 64, v_head_dim 128, 24 cabezas de atencion. Gated DeltaNet: 9 cabezas y head dim 256.

## Arquitectura y entrenamiento

El modelo no se preentrena como hibrido: se parte de un transformer denso ya entrenado y se sustituyen sus bloques. Las capas de atencion se convierten en MLA, que cachea un latente de bajo rango (kv_lora_rank 128) en lugar de claves y valores completos, y el resto de capas se convierten en bloques lineales Gated DeltaNet, que mantienen un estado recurrente de tamano fijo y no generan cache KV. La colocacion no sigue un patron repetitivo: las capas MLA ocupan los indices pares (0, 2, 4, ..., 26) y las Gated DeltaNet los impares (1, 3, ..., 27), situando la atencion completa donde el modelo base es mas sensible a perderla. La configuracion hibrida vive en hybrid_config.json; config.json corresponde al modelo base y se conserva solo como referencia.

El entrenamiento consta de dos etapas. La primera, Enhanced-ILD, hace destilacion capa a capa para alinear los bloques MLA y lineales recien inicializados con las representaciones internas del modelo base, a 2.048 tokens, con learning rate 2e-4 y el 20 % de la mezcla de SFT. La segunda es un SFT de contexto largo con destilacion guiada por profesor (Llama-3.1-8B-Instruct) a 65.536 tokens, learning rate 4e-5 y la mezcla completa. La funcion de perdida es divergencia KL entre las distribuciones del siguiente token del estudiante y del profesor (kl_weight 1.0, ce_weight 0.0), con batch global de 8 secuencias, 1 epoca, schedule coseno y warmup del 1 %. Se uso precision mixta bfloat16 y un kernel KL fusionado que evita materializar el tensor completo de logits. El entrenamiento se ejecuto en 8 x AMD Instinct MI300X con FSDP.

Los datos de SFT son JunxiongWang/sftdatasetv3, nvidia/OpenMathInstruct-2, open-thoughts/OpenThoughts-114k, open-r1/OpenR1-Math-220k y nvidia/ChatQA2-Long-SFT-data, en variantes procesadas por AMD (subconjunto, reformateo a la plantilla de chat y decontaminacion contra las suites de evaluacion).

## Capacidades

- Generacion de texto y conversacion en ingles, heredadas del backbone Llama-3.2-3B-Instruct y del SFT sobre mezcla de chat.
- Razonamiento matematico y tipo cadena de pensamiento, reforzado por los datasets OpenMathInstruct-2, OpenR1-Math-220k y OpenThoughts-114k.
- Comprension de documentos largos y respuesta a preguntas sobre contexto extenso, gracias al SFT a 64K tokens y a la mezcla que incluye nvidia/ChatQA2-Long-SFT-data.
- Procesamiento eficiente de contextos largos con cache KV reducida al 4,7 % del modelo base, lo que abarata el despliegue a 64K tokens.
- Capacidades multilingues: no disponibles mas alla del ingles declarado.
- Tool calling / function calling: no confirmado en la model card. El modelo base Llama-3.2-3B-Instruct admite function calling, pero no se documenta si esa capacidad sobrevive al upcycling y al SFT de destilacion.
- Modo thinking explicito, vision o audio: no disponible.
- Uso como objeto de estudio para investigacion en arquitecturas hibridas, destilacion y compresion de cache KV.

## Casos de uso

- Investigacion en arquitecturas hibridas: reproducir o extender el metodo de upcycling de la Tabla 3 del paper, comparando el comportamiento de las capas MLA frente a las Gated DeltaNet en tareas de recuperacion de informacion larga.
- Estudio de compresion de cache KV: medir el impacto real del 4,7 % de cache en latencia y throughput frente al modelo base a 64K tokens, con cargas de trabajo de generacion larga.
- Analisis de documentos extensos en ingles: informes, expedientes o articulos de hasta 65.536 tokens en una sola pasada, sin necesidad de trocear el texto en un pipeline RAG.
- Asistencia matematica y resolución de problemas paso a paso: el SFT incluye mezclas de OpenMathInstruct-2 y OpenR1-Math-220k, adecuadas para prototipos de tutoria o generacion de razonamientos matematicos.
- Evaluacion comparativa de destilacion: usar el checkpoint como estudiante en experimentos de KL-distillation contra Llama-3.1-8B-Instruct y medir la degradacion respecto al profesor.
- Prototipado en hardware de gama alta de consumo: con pesos en bfloat16 (unos 8 GB) y una cache KV muy reducida, permite probar cargas de 64K tokens en una GPU de 24 GB como la RTX 3090 o RTX 4090.
- Docencia y demos de atencion lineal: ilustrar en un modelo real la diferencia entre estado recurrente de tamano fijo y cache KV creciente, sin salir del ecosistema Llama.

## Benchmarks y rendimiento

El model-index del repositorio esta vacio (results: []). Los unicos datos numericos provienen de la Tabla 3 del paper (backbone Llama-3.2-3B), medidos 0-shot con EleutherAI lm-evaluation-harness y reproducidos en la model card:

| Tarea | HyLo-Llama-14MLA14GDN (0-shot, exactitud) |
|---|---:|
| ARC-Challenge | 45,1 |
| ARC-Easy | 72,0 |
| HellaSwag | 68,2 |
| OpenBookQA | 39,4 |
| PIQA | 76,1 |
| RACE | no disponible (la model card aparece truncada en esta fila) |

No se publican en la informacion disponible resultados de MMLU, GSM8K, HumanEval ni de tareas de contexto largo (por ejemplo RULER o Needle-in-a-Haystack), ni comparaciones directas contra el modelo base o el profesor medidas por el autor en este repositorio.

## Requisitos de hardware

- VRAM de pesos (estimacion a partir de 3,97B parametros): unos 15,9 GB en float32 tal y como se publica, unos 8 GB en bfloat16, unos 4 GB en int8 y entre 2 y 3 GB en int4. Las cuantizaciones no estan publicadas por el autor.
- Cache KV: al ser el 4,7 % de la del modelo base, el coste de memoria de contexto es marginal frente a un transformer denso equivalente, lo que hace viable sostener 64K tokens en GPUs pequenas.
- GPU recomendadas: cualquier GPU con 16 GB o mas en bfloat16 (RTX 4080/4090, L4, A10); A100 40/80 GB, H100 y AMD Instinct MI300X para experimentacion a 64K tokens y para entrenamiento o fine-tuning.
- Consumer GPU: si, cabe en RTX 3090, RTX 4090, RTX 5090 y equivalentes de 24 GB en bfloat16 con margen para contexto largo. En float32 requeriria al menos 16 GB solo para pesos.
- Despliegue: el autor documento el entrenamiento con 8 x MI300X y FSDP, pero no publica instrucciones de serving. El soporte de kernels para MLA y Gated DeltaNet en vLLM, TGI, llama.cpp u Ollama no esta confirmado en la informacion disponible; comprobar la compatibilidad del stack antes de desplegar.
- Latencia y throughput: no disponibles. La model card no aporta medidas de tokens por segundo.
- Nota de configuracion: los stacks de serving dimensionan la cache KV a partir de max_position_embeddings, que vale 131.072 en el config heredado. Hay que fijar explicitamente el limite, por ejemplo --max-model-len 65536.

## Comparativa con modelos similares

La model card no incluye comparaciones con otros hibridos (Mamba-2, Jamba, Zamba, Qwen3-Next u otros), por lo que no hay datos de rendimiento head-to-head. Comparativa de referencia con los modelos directamente relacionados:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| HyLo-Llama-14MLA14GDN-64K-SFT | 3,97B | 65.536 tokens | Hibrida MLA + Gated DeltaNet | AMD Hybrid Models Research Only | Cache KV al 4,7 %; solo investigacion; solo ingles |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,2B | 128.000 tokens (declarados) | Transformer denso con GQA | Llama 3.2 Community License | Referencia de partida; cache KV completa; contexto nominal mayor |
| meta-llama/Llama-3.1-8B-Instruct (profesor) | 8B | 128.000 tokens (declarados) | Transformer denso con GQA | Llama 3.1 Community License | Profesor de destilacion, mas capacidad y mas coste de inferencia |

Los datos de contexto y licencia de los dos modelos Llama proceden de sus respectivas model cards publicas, no de la ficha de HyLo. Cualquier comparacion de calidad entre ellos y este checkpoint queda sin sustento numerico en la informacion disponible.

## Limitaciones y advertencias

- Licencia de solo investigacion: la licencia efectiva es amd-hybrid-models-research-only-rail-ms, con nombre largo AMD Hybrid Models Research Only. Aunque el frontmatter declare apache-2.0, la licencia personalizada prevalece, por lo que el uso comercial no esta permitido sin autorizacion explicita de AMD.
- Solo ingles: no se declaran capacidades multilingues ni se ha entrenado con datos en otros idiomas.
- Contexto real de 65.536 tokens: el valor de 131.072 del config es herencia del modelo base y no esta soportado ni evaluado. Servir a 128K puede degradar la calidad de forma no medida.
- Pesos en float32: el checkpoint obliga a descargar 15,9 GB y a convertir a bfloat16 para un uso eficiente; no hay versiones cuantizadas publicadas.
- Perdida de destilacion solo KL (ce_weight 0.0): al no usar perdida de entropia cruzada sobre etiquetas, el modelo hereda tanto el conocimiento como los sesgos y errores del profesor Llama-3.1-8B-Instruct.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad, factualidad ni tasas de alucinacion; el modelo es de 4B parametros y no debe usarse como fuente de verdad sin verificacion.
- Tool calling y comportamiento agentico no confirmados: no hay documentacion sobre preservacion de function calling, uso de agentes ni razonamiento multi-paso tras el upcycling.
- Evaluacion limitada: solo se reportan tareas de sentido comun 0-shot; no hay MMLU, GSM8K, HumanEval ni pruebas de contexto largo en la informacion disponible, y la model card aparece truncada en la fila RACE.
- Soporte de tooling incierto: MLA y Gated DeltaNet requieren kernels especificos; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y puede requerir implementaciones propias.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion reciente, sin historial de uso en produccion.
- Sesgos heredados: al derivar de Llama-3.2-3B-Instruct y entrenarse con mezclas de SFT, arrastra los sesgos del modelo base y de los datasets utilizados (algunos, como ChatQA2-Long-SFT-data, con licencia cc-by-nc-2.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Llama-14MLA14GDN-64K-SFT
- Paper principal: https://arxiv.org/abs/2604.24715 (Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling)
- Referencia arXiv en etiquetas: https://arxiv.org/abs/2505.17272
- Referencia arXiv en etiquetas: https://arxiv.org/abs/2503.11132
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Profesor de destilacion: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Pagina corporativa de AMD: https://www.amd.com/en.html
