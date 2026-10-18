# lollix91/boccaccioAI

## Resumen

BoccaccioAI es un modelo de lenguaje decoder-only de aproximadamente 700 millones de parámetros desarrollado por De Lauretis Tech (publicado bajo el identificador `lollix91/boccaccioAI`). Se trata de un modelo entrenado íntegramente desde cero sobre texto en italiano extraído de CulturaX, Wikipedia IT y mC4 Italian, y está optimizado para generación de texto y Question & Answering en lengua italiana. Su propuesta diferencial es cubrir el hueco de modelos nativos italianos de tamano medio con una arquitectura moderna y un pipeline completo de entrenamiento e inferencia reproducible.

El modelo incorpora elementos de diseno actuales —tokenizer BPE propio de 32.000 tokens entrenado sobre italiano, Grouped Query Attention (GQA) con ratio 3:1, SwiGLU, RoPE y compatibilidad con Flash Attention 2— sobre una escala de 700M parámetros escalada según las Chinchilla Scaling Laws (ratio tokens/parámetros ~14:1). El contexto máximo es de 2.048 tokens. El proyecto incluye además una capa de RAG sobre Wikipedia IT (índice FAISS exacto sobre 3,2 millones de chunks) y un despliegue serverless en Modal.com sobre GPU L4.

Su relevancia actual reside en ser un artefacto "from-scratch" completamente abierto (licencia Apache 2.0) que documenta todo el ciclo de vida: tokenizer, preentrenamiento, varios fine-tunings (V1, V2, V3), destilación desde un teacher Qwen3-235B sobre 98k ejemplos SQuAD-IT e instrucciones generales, y la infraestructura de RAG y despliegue. Es un caso de interés para investigadores que quieran estudiar un LLM italiano de punta a punta sin depender de pesos derivados de modelos multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU, RoPE y RMSNorm |
| Parametros totales | ~700M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Pesos publicados en BF16 (safetensors); no se publican versiones cuantizadas (GGUF/GPTQ/AWQ): no disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); incluye `model.pt` de checkpoints Lightning y scripts de conversion |

Otros datos de arquitectura: hidden size 1536, 26 capas, 12 cabezas de atencion con 4 KV heads (GQA 3:1), FFN SwiGLU con intermediate 4096, RoPE con theta 10000, RMSNorm con eps 1e-5, vocabulario de 32.000 tokens, embedding de entrada y LM head compartidos, dropout 0.0.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de ~700M parámetros. Usa Grouped Query Attention con ratio 3:1 (12 cabezas de atencion y 4 KV heads) para reducir la memoria del KV cache en inferencia, activacion SwiGLU en la FFN (intermediate 4096) y Rotary Position Embeddings (RoPE, theta 10000) para codificacion posicional relativa. La normalizacion es RMSNorm (eps 1e-5) y el modelo es compatible con Flash Attention 2. El tokenizer es un BPE propio de 32.000 tokens entrenado especificamente sobre texto italiano. La escala sigue las Chinchilla Scaling Laws con un ratio tokens/parámetros de aproximadamente 14:1.

El entrenamiento se realizo desde cero sobre texto italiano de CulturaX, Wikipedia IT y mC4 Italian, e incluye varias fases de ajuste: un preentrenamiento base, un continued pretraining sobre Wiki y mC4, y fine-tunings sucesivos de instruction following con refusal training (honesty) sobre 270k ejemplos italianos (V1), un V3 con dataset nativo rebalanceado de 116k ejemplos procedentes de 5 fuentes, y una fase de destilacion desde el teacher Qwen3-235B sobre 98k ejemplos SQuAD-IT mas instrucciones generales. El repositorio documenta scripts reproducibles para cada fase (tokenizer, preprocesado, preentrenamiento, fine-tunings, evaluacion y conversion a safetensors BF16).

## Capacidades

- Generacion de texto en italiano con coherencia multioracion y contexto de hasta 2.048 tokens.
- Question & Answering en italiano, incluyendo QA sobre contexto recuperado (integracion RAG con Wikipedia IT).
- Instruction following mediante fine-tuning especifico sobre ejemplos de instrucciones italianas.
- Refusal training (honesty): entrenado para rechazar o matizar respuestas cuando no dispone de informacion fiable.
- Destilacion de conocimiento desde un teacher grande (Qwen3-235B) sobre SQuAD-IT e instrucciones generales, lo que refuerza el QA extractivo y de comprension.
- Soporte de RAG de extremo a extremo: retrieval hibrido con bi-encoder e5-small mas reranker cross-encoder, indice FAISS exacto (IndexFlatIP) sobre 3,2M chunks de Wikipedia IT.
- Generacion con pipeline propio de inferencia incluido en el repositorio (`src/inference/`, `rag/rag_chat.py`, `scripts/chat_distill.py`).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Asistente de QA en italiano sobre base documental: usando la pipeline RAG incluida (FAISS sobre 3,2M chunks de Wikipedia IT mas reranker), el modelo responde preguntas ancladas a fuentes recuperadas, lo que reduce alucinaciones en consultas factuales.
- Atencion al cliente en italiano: con 2.048 tokens de contexto y fine-tuning de instruction following, puede gestionar conversaciones multi-turno acotadas para soporte de producto o FAQ, con refusal training para escalar consultas fuera de alcance.
- Generacion asistida de texto en italiano: redaccion de borradores, resumenes y parafraseo en aplicaciones editoriales donde se requiere un modelo nativo italiano y licencia permisiva.
- Base para investigacion en NLP italiano: al ser from-scratch y Apache 2.0, sirve como punto de partida reproducible para estudiar tokenizacion BPE italiana, efectos del destilado y curvas de escalado a 700M.
- Prototipado de sistemas RAG de bajo coste: el despliegue serverless en Modal.com (GPU L4, scale-to-zero, memory snapshot) permite montar un endpoint de QA italiano con coste controlado y sin infraestructura fija.
- Filtrado y clasificacion de texto italiano: puede emplearse para tareas de extraccion o respuesta corta en pipelines de procesamiento de documentacion en italiano, apoyandose en su QA extractivo destilado de SQuAD-IT.
- Fine-tuning especifico de dominio: al incluir todo el codigo de entrenamiento y conversion a safetensors BF16, es viable reentrenar o ajustar el modelo sobre corpus sectoriales italianos (legal, sanitario, administrativo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el proceso de entrenamiento y las distintas fases de fine-tuning, pero no incluye tablas con metricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones numericas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos orientativos a partir de 700M parámetros; cifras no publicadas por el autor): en BF16/FP16 el peso ronda 1,4 GB; en INT8 ~0,7 GB; en INT4 ~0,35 GB. A ello se suma el KV cache para 2.048 tokens (reducido por GQA 3:1), tipicamente por debajo de 1 GB adicional en la mayoria de configuraciones.
- GPU recomendadas: el autor documenta despliegue en GPU L4 (24 GB) via Modal.com. Por tamano, cabe holgadamente en RTX 4090 (24 GB), RTX 3090 (24 GB) y cualquier GPU con 8 GB o mas en BF16.
- Cabe en GPU de consumo: si, en BF16 en GPUs de 8-12 GB o superiores; en cuantizaciones de 4 bits cabria en GPUs de 4-6 GB (si bien no se publican versiones cuantizadas listas para usar).
- Opciones de despliegue: el repositorio incluye su propio codigo de inferencia (`src/inference/`) y el despliegue serverless en Modal.com con memory snapshot y scale-to-zero. Al ser una arquitectura from-scratch con tokenizer BPE propio, motores estandar como vLLM, TGI, llama.cpp u Ollama requeririan adaptacion o conversion a GGUF no documentada en la informacion disponible.
- Latencia y throughput: no disponible (no se publican mediciones en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| BoccaccioAI | ~700M | 2.048 | Italiano | Apache 2.0 | safetensors (BF16) | From-scratch, RAG incluido, benchmarks no publicados |
| TinyLlama 1.1B | 1.100M | 2.048 | Ingles | Apache 2.0 | safetensors / GGUF | Mayor tamano; foco en ingles; benchmarks publicos |
| Qwen2.5-0.5B | ~500M | 32.768 | Multilingue | Apache 2.0 | safetensors / GGUF | Mayor contexto y soporte multilingue; no especifico de italiano |
| Llama 3.2 1B | ~1.200M | 131.072 | Multilingue | Llama 3.2 Community | safetensors / GGUF | Mucho mayor contexto; licencia con restricciones de uso |

Nota: no se dispone de resultados de benchmarks de BoccaccioAI para una comparacion cuantitativa fiable; los datos de los modelos alternativos se ofrecen a titulo orientativo (tamano, contexto y licencia) y no se comparan cifras de rendimiento. No se conocen modelos comparables especificamente italianos y from-scratch de este tamano en la informacion disponible.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre CulturaX, Wikipedia IT y mC4 Italian, puede heredar sesgos presentes en esos corpus web y enciclopedicos; no se documenta evaluacion de sesgo en la model card.
- Alucinacion: es un modelo de 700M con contexto de 2.048 tokens; fuera de tareas ancladas por RAG el riesgo de inventar hechos es elevado, especialmente en conocimiento factual no cubierto en preentrenamiento.
- Contexto limitado: la ventana de 2.048 tokens restringe conversaciones largas y documentos extensos; no admite prompts de gran tamano sin truncado o chunking.
- Idioma: soporte unicamente de italiano; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre precision, sesgos ni idoneidad para usos de alto riesgo; conviene validar antes de produccion.
- Madurez: el modelo registra 0 descargas y 1 "like" en el momento de la consulta, y no publica benchmarks; carece de validacion externa y de ecosistema de herramientas (no hay versiones GGUF/GPTQ/AWQ publicadas).
- Despliegue: al tratarse de una arquitectura from-scratch con tokenizer propio, la integracion con vLLM, TGI, llama.cpp u Ollama no esta estandarizada en la informacion disponible; el soporte documentado se limita al codigo propio y a Modal.com.
- Repositorio de gran tamano: 83,1 GB en el repositorio (incluye checkpoints y artefactos de entrenamiento), lo que complica su descarga y gestion.

## Enlaces

- HuggingFace: https://huggingface.co/lollix91/boccaccioAI
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos del modelo.
