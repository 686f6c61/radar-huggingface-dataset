# pranil00/ONIX-pythia-6.9b-GGUF

## Resumen

ONIX-pythia-6.9b-GGUF es una cuantizacion en formato GGUF (concretamente Q4_K_M) del modelo base EleutherAI/pythia-6.9b, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". No se trata de un modelo nuevo ni de un fine-tuning: es una conversion de pesos del Pythia-6.9b original de EleutherAI a un formato optimizado para inferencia en CPU y GPU de consumo mediante llama.cpp y Ollama.

El modelo subyacente, Pythia-6.9b, es un transformer decoder-only denso de aproximadamente 6.900 millones de parametros (6.857.302.016 exactos segun los safetensors del modelo base), desarrollado por EleutherAI como parte de la suite Pythia, disenada para investigacion sobre interpretabilidad y dinamica de entrenamiento. Su contexto nativo es de 2048 tokens y fue entrenado sobre el corpus The Pile.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~6.9B en hardware modesto gracias a la cuantizacion de 4 bits, con un peso de 4.10 GB. Sin embargo, debe tenerse en cuenta que Pythia es un modelo de investigacion de 2023, no alineado con RLHF, por lo que su calidad conversacional y de instrucciones es limitada en comparacion con modelos actuales del mismo tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GPT-NeoX) |
| Parametros totales | 6.857.302.016 (~6.9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (contexto nativo de Pythia) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repo) |
| Idiomas soportados | no disponible (el modelo base se entreno principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (peso cuantizado de 4.10 GB) |

## Arquitectura y entrenamiento

El modelo base Pythia-6.9b emplea la arquitectura GPT-NeoX, un transformer decoder-only con atencion causal estandar, normalizacion tipo LayerNorm y embeddings rotatorios (RoPE). Fue entrenado por EleutherAI sobre The Pile, un corpus de aproximadamente 825 GiB de texto en ingles con componentes diversos (web, libros, papers, codigo, etc.), durante 143.000 pasos (~300.000 millones de tokens) con un batch global de 1024 secuencias de 2048 tokens. No se aplico RLHF ni DPO: es un modelo de lenguaje base preentrenado unicamente con objetivo de modelado de siguiente token.

La contribucion de esta publicacion concreta es la cuantizacion Q4_K_M realizada con llama.cpp, verificada segun la model card mediante conversion autentica de tensores en Apple Silicon con Metal. La cuantizacion K-quant de 4 bits reduce el peso de ~13-14 GB en FP16 a 4.10 GB, con una perdida de calidad moderada tipica de este esquema. No se documentan innovaciones adicionales ni procesos de alineacion.

## Capacidades

- Generacion de texto autoregresiva: completado de texto, continuacion de documentos y generacion libre.
- Modelado de lenguaje base: util para evaluacion de perplejidad y experimentos de interpretabilidad.
- Razonamiento basico y conocimiento factual derivado del preentrenamiento en The Pile.
- Generacion de codigo limitada (The Pile incluye GitHub, pero el modelo no esta especializado).
- Capacidades multilingues muy limitadas: el entrenamiento fue predominantemente en ingles.
- No dispone de tool calling ni function calling nativo.
- No soporta agentes ni razonamiento multi-paso estructurado de forma fiable.
- No incluye modo "thinking", vision ni audio.
- No esta ajustado para seguir instrucciones (no es un modelo instruct).

## Casos de uso

- Investigacion en interpretabilidad: analisis de activaciones y circuitos internos sobre un modelo base reproducible, usando la version cuantizada para exploracion rapida en equipos sin GPU de gran memoria.
- Evaluacion de perplejidad y benchmarking de pipelines: prueba de herramientas de inferencia (llama.cpp, Ollama) y de esquemas de cuantizacion comparando Q4_K_M frente a FP16.
- Generacion de texto de relleno y prototipado: completado de parrafos en ingles para demos de interfaz donde no se requiere alta calidad.
- Educacion y experimentacion local: ejecucion de un LLM de ~6.9B en portatiles con Apple Silicon o GPUs de consumo para aprender el flujo de trabajo con GGUF.
- Pruebas de despliegue en CPU: validacion de latencia y throughput en servidores sin GPU usando llama.cpp.
- Base para fine-tuning posterior: punto de partida cuantizado para experimentos de adaptacion (aunque para entrenamiento conviene partir de los pesos originales en FP16).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K u otras), ni comparaciones con el modelo base en FP16 para medir la degradacion por cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~4.5-5 GB con Q4_K_M (4.10 GB de pesos mas overhead de contexto y KV cache).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090, etc.).
- Tambien ejecutable en CPU pura y en Apple Silicon (la model card indica cuantizacion en Metal).
- GPU recomendadas para mayor throughput: RTX 4090, A100, H100; para uso domestico basta una RTX 3060 de 12 GB o superior.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (`ollama run pranil00/ONIX-pythia-6.9b-GGUF`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-pythia-6.9b-GGUF (este) | ~6.9B | 2048 | GGUF Q4_K_M | Apache 2.0 | Cuantizacion de Pythia-6.9b, solo base |
| EleutherAI/pythia-6.9b (original) | ~6.9B | 2048 | safetensors FP16 | Apache 2.0 | Modelo base sin cuantizar, referencia de calidad |
| Mistral-7B-v0.1 | ~7.2B | 8192 | safetensors/GGUF | Apache 2.0 | Base mas moderna, mejor calidad y contexto mayor |
| Llama-2-7B | ~6.7B | 4096 | safetensors/GGUF | Llama 2 Community | Base con contexto mayor y ecosistema amplio |

La comparacion con Mistral-7B y Llama-2-7B es orientativa por tamano; no se dispone de datos de benchmarks de este repo para cuantificar diferencias de rendimiento.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o no deseadas.
- Riesgo elevado de alucinacion factual, comun en modelos base de esta generacion.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Capacidad multilingue muy limitada; el entrenamiento fue predominantemente en ingles.
- La cuantizacion Q4_K_M introduce degradacion de calidad respecto a FP16, no cuantificada en la model card.
- Sesgos heredados de The Pile (texto web, sesgos de genero, raza, ideologia, etc.).
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo base hace poco recomendable su uso en produccion orientada a usuario final.
- Repo con 0 descargas y 0 likes: sin validacion comunitaria; conviene verificar la integridad de los pesos antes de usarlos en entornos criticos.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/pranil00/ONIX-pythia-6.9b-GGUF
- Modelo base: https://huggingface.co/EleutherAI/pythia-6.9b
- Paper de Pythia (EleutherAI): https://arxiv.org/abs/2304.01373
- Repositorio GPT-NeoX: https://github.com/EleutherAI/gpt-neox
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
