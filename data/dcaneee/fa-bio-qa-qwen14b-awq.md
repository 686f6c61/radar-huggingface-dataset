# dcaneee/fa-bio-qa-qwen14b-awq

## Resumen

`fa-bio-qa-qwen14b-awq` es una cuantizacion AWQ de 4 bits del adaptador LoRA `dcaneee/fa-bio-qa-qwen14b`, construido sobre `Qwen/Qwen2.5-14B-Instruct`. El resultado es un modelo de generacion de texto en persa (farsi) especializado en preguntas y respuestas de biologia del curriculo irani de secundaria (grados 7 a 12). Lo publica el usuario `dcaneee` bajo licencia Apache 2.0 y esta pensado para integrarse en un pipeline RAG junto al indice FAISS `dcaneee/fa-bio-rag-index`.

La relevancia tecnica esta en el empaquetado: reduce un transformer de 14.770.033.664 parametros a un repo de 10 GB en dos shards con cuantizacion W4A16 (pesos de 4 bits, activaciones de 16 bits), grupo de 128 y kernels GEMM. El autor documenta puertas de calidad explicitas, incluida la fidelidad del merge LoRA (desviacion maxima de 3,78e-04 en `q_proj` de la capa 0) y la perdida de evaluacion del adaptador (1,104 a 1,049 en 2 epocas).

El modelo no memoriza hechos: el autor indica explicitamente que el adaptador aprende **estilo** de respuesta tipo examen (1-2 frases), no conocimiento factual. Para respuestas fundamentadas hay que emparejarlo con el indice RAG. Es un caso de uso acotado (tutoria de biologia en persa) mas que un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizado AWQ INT4 |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-14B-Instruct, no declarada en la model card) |
| Tipos de cuantizacion | AWQ 4-bit, W4A16, group_size 128, kernels GEMM y Marlin (via vLLM) |
| Idiomas soportados | persa (`fa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, repo de 10 GB) |

## Arquitectura y entrenamiento

El modelo base es `Qwen2.5-14B-Instruct`, un transformer decoder-only denso de 14.770 millones de parametros. Sobre el se entreno un adaptador LoRA con rango r=8, que se fusiono en fp32, se convirtio a fp16 y finalmente se cuantizo a AWQ INT4. La calibracion se hizo con 64 fragmentos de texto persa del dominio (biologia), 256 tokens por muestra y batching de 8 vias.

Las puertas de calidad documentadas son: fidelidad del merge en `layer 0 q_proj` con desviacion absoluta maxima de 3,78e-04 y 83,5% de pesos modificados; perdida de evaluacion del adaptador de 1,104 a 1,049 tras 2 epocas; y verificacion de que el comportamiento de respuesta estilo examen (1-2 frases) se conserva tras la cuantizacion. No se detalla el volumen de tokens de entrenamiento del adaptador ni la composicion exacta del dataset mas alla de su origen en el curriculo irani. El autor advierte que AutoAWQ esta deprecado upstream y recomienda regenerar con `llm-compressor` para soporte a largo plazo.

## Capacidades

- Generacion de texto conversacional en persa, con registro de respuesta corta tipo examen.
- Respuesta a preguntas de biologia de secundaria (grados 7-12 del curriculo irani) cuando se le proporciona contexto recuperado.
- Integracion en pipelines RAG: el autor disena el modelo para emparejarse con el indice FAISS `persian_biology` (5.972 fragmentos, 1024 dimensiones) y el embedder `intfloat/multilingual-e5-large` con prefijos `passage: ` y `query: `.
- Inferencia nativa en vLLM con kernels Marlin y en Transformers 5 (requiere `gptqmodel`).
- Soporte de `text-generation-inference` y `endpoints_compatible` segun los tags del repo.
- Tool calling, function calling, agentes multi-paso, vision, audio y modo thinking: no disponibles (no declarados en la model card).

## Casos de uso

- Tutoria de biologia para estudiantes iranies: el modelo responde en persa con formato de examen (1-2 frases) cuando se le inyectan fragmentos del indice RAG; adecuado por su ajuste al curriculo 7-12 y su estilo conciso.
- Generacion de cuestionarios y fichas de repaso: a partir de un fragmento recuperado, produce preguntas y respuestas breves listas para plataformas de e-learning en persa.
- Chatbot de refuerzo escolar con recuperacion obligatoria: el pipeline consulta el indice FAISS, inserta los chunks como contexto y el modelo reformula; el diseno evita respuestas inventadas al depender del retrieval.
- Normalizacion de estilo en respuestas cientificas: util para reescribir explicaciones largas en formato de respuesta corta academica persa.
- Evaluacion de pipelines RAG en persa: sirve como generador de referencia para medir fidelidad al contexto y calidad de recuperacion en un dominio acotado.
- Despliegue en GPU de gama media para prototipos: al ocupar unos 10 GB en disco y usar W4A16, cabe en tarjetas consumer de 16-24 GB y permite servir un asistente especializado sin infraestructura grande.
- Generacion de material de estudio bilingue (persa-espanol) solo si se anade traduccion externa, ya que el modelo no declara capacidades multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas internas de calidad del proceso de cuantizacion y adaptacion:

| Metrica interna | Resultado |
|---|---|
| Fidelidad del merge (layer 0 `q_proj`, max abs diff) | 3,78e-04 |
| Porcentaje de pesos modificados en el merge | 83,5% |
| Perdida de evaluacion del adaptador (epoca 1 a 2) | 1,104 a 1,049 |
| Muestras de calibracion | 64 chunks persas, 256 tokens, batch 8 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8-10 GB con pesos AWQ INT4 y cache KV en fp16; el repo ocupa 10 GB en disco.
- GPU recomendadas: A100, H100, L40S para produccion; RTX 4090, RTX 4080, RTX 3090 y A6000 para prototipos.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090). En 12 GB puede requerir contexto corto o offload.
- Opciones de despliegue: vLLM (`vllm serve ... --quantization awq`, usa kernels Marlin de forma nativa); Transformers 5 con `gptqmodel` instalado (`pip install gptqmodel --no-build-isolation`); text-generation-inference segun los tags del repo. llama.cpp y Ollama no estan soportados para AWQ de esta forma.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idioma | Licencia |
|---|---|---|---|---|---|
| `dcaneee/fa-bio-qa-qwen14b-awq` | 14,77 B | no disponible | AWQ INT4 (W4A16) | Persa | Apache 2.0 |
| `Qwen/Qwen2.5-14B-Instruct` (base) | 14,77 B | no disponible en esta ficha | FP16/BF16 original | Multilingue | Apache 2.0 |
| `dcaneee/fa-bio-qa-qwen14b` (adaptador sin cuantizar) | 14,77 B | no disponible | FP16 | Persa | Apache 2.0 |

La comparativa con alternativas de la misma categoria (modelos persas especializados en biologia) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo persa; el entrenamiento esta acotado al curriculo irani de grados 7-12 y no se declara cobertura fuera de ese dominio.
- El adaptador aprende estilo, no hechos: sin recuperacion del indice RAG produce respuestas fluidas pero no fundamentadas, con riesgo alto de alucinacion en contenido cientifico.
- La calibracion AWQ uso solo 64 muestras; el autor recomienda recalibrar con 256 o mas para maxima fidelidad.
- AutoAWQ esta deprecado upstream; para mantenimiento a largo plazo hay que regenerar la cuantizacion con `llm-compressor`.
- Transformers 5 requiere instalar `gptqmodel` manualmente; el flujo estandar de `transformers` no carga el modelo sin ese paso.
- Sesgos conocidos: no documentados en la model card, pero al derivar de Qwen2.5-14B-Instruct hereda los sesgos del modelo base, no evaluados aqui.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre exactitud cientifica; para uso educativo o sanitario conviene validacion humana.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcaneee/fa-bio-qa-qwen14b-awq
- Adaptador base (sin cuantizar): https://huggingface.co/dcaneee/fa-bio-qa-qwen14b
- Indice RAG: https://huggingface.co/datasets/dcaneee/fa-bio-rag-index
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Embedder recomendado: https://huggingface.co/intfloat/multilingual-e5-large
