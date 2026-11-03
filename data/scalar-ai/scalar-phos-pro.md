# scalar-ai/scalar-phos-pro

## Resumen

Scalar Phos Pro es un modelo de lenguaje de 8.030 millones de parametros desarrollado por scalar-ai, obtenido mediante un ajuste fino con QLoRA sobre Meta Llama 3.1 8B Instruct. Se distribuye como adaptadores LoRA (formato PEFT) y como pesos cuantizados GGUF Q4_K_M, lo que permite tanto el reentrenamiento y la fusion con el modelo base como la inferencia local en hardware de consumo. La arquitectura es un transformer denso autorregresivo de 32 capas, 32 cabezas de atencion con Grouped-Query Attention, dimension oculta de 4096 y un vocabulario de 128.256 tokens.

El modelo se presenta como una variante "instruction-tuned" orientada a seguimiento de instrucciones especializado y razonamiento general, manteniendo el contexto nativo de 128.000 tokens de Llama 3.1. Su relevancia practica radica en que conserva el ecosistema de despliegue de Llama 3.1 (transformers, peft, llama.cpp, Ollama, LM Studio, TGI) y anade una capa de ajuste que, segun el autor, mejora el seguimiento de instrucciones, aunque los datos publicados de MMLU lo sitúan por debajo del modelo base en todas las categorias evaluadas.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de HuggingFace; no hay informacion publica sobre el dataset de ajuste, el numero de tokens de entrenamiento ni la composicion de la mezcla SFT. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un modelo de publicacion reciente y escasa validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autorregresivo (Llama 3.1), 32 capas, GQA, RoPE |
| Parametros totales | 8.030 millones (~8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | FP16, BF16, 4-bit (QLoRA), GGUF Q4_K_M |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | Safetensors (adaptadores LoRA PEFT) y GGUF (Q4_K_M) |
| Dimension oculta | 4096 |
| Cabezas de atencion | 32 (Grouped-Query Attention) |
| Vocabulario | 128.256 tokens |
| Metodo de ajuste | QLoRA (SFT con TRL sobre Unsloth) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Libreria | peft |
| Tamano del repositorio | 11,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer denso decoder-only con 32 capas, atencion multi-cabeza con Grouped-Query Attention (32 cabezas de consulta), embeddings posicionales rotatorios (RoPE) y una dimension oculta de 4096. El modelo hereda el vocabulario de 128.256 tokens y la ventana de contexto de 128.000 tokens del modelo base, sin modificaciones arquitectonicas indicadas en la model card.

El ajuste se realizo mediante QLoRA, es decir, cuantizacion de 4 bits del modelo base con adaptadores de bajo rango entrenados en precision superior. Los tags del repositorio indican el uso de TRL para SFT y Unsloth para la optimizacion del entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni hiperparametros del ajuste (rango LoRA, alpha, learning rate, epochs). Tampoco se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal; el valor anadido declarado es exclusivamente el ajuste de instrucciones.

## Capacidades

- Generacion de texto conversacional e instruction following en ingles, heredado del modelo base y refinado con SFT.
- Razonamiento general y respuesta a preguntas de cultura general, humanidades y ciencias sociales (evaluado en MMLU).
- Razonamiento matematico y STEM basico, con rendimiento declarado inferior al del modelo base en la categoria STEM de MMLU (55,96 % frente a 58,1 %).
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct, aunque no se documenta entrenamiento especifico adicional en este aspecto.
- Capacidad de conversacion multi-turno dentro de la ventana de 128.000 tokens.
- Despliegue dual: adaptadores LoRA para reentrenamiento o fusion, y GGUF para inferencia local.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional en ingles para soporte interno: el modelo puede mantener dialogos multi-turno con contexto largo gracias a los 128.000 tokens de ventana, adecuado para resumir hilos de correo o documentacion extensa antes de responder.
- Prototipado rapido de aplicaciones de texto en local: el GGUF Q4_K_M permite ejecutar el modelo en un portatil con GPU de consumo mediante Ollama o LM Studio, sin depender de APIs externas.
- Base para ajuste fino adicional: al distribuirse como adaptadores LoRA PEFT, un equipo puede cargar el adaptador sobre Llama 3.1 8B, fusionarlo y continuar el entrenamiento con su propio dataset sectorial usando TRL o Unsloth.
- Generacion de documentacion tecnica en ingles: el modelo puede redactar borradores y resumenes de especificaciones a partir de contextos largos, aunque requiere revision humana por el riesgo de alucinacion.
- Clasificacion y extraccion de informacion en pipelines por lotes: con vLLM o TGI se puede servir el modelo fusionado en BF16 para tareas de etiquetado y extraccion estructurada en ingles.
- Evaluacion comparativa de ajustes QLoRA: util como referencia para investigadores que quieran medir el efecto de un SFT sobre Llama 3.1 8B Instruct con el mismo protocolo MMLU zero-shot.
- Chatbot de dominio limitado en ingles: para preguntas frecuentes y guiones cerrados donde el contexto de 128k permite inyectar manuales completos como system prompt.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card corresponden a MMLU zero-shot con EleutherAI lm-evaluation-harness. No se han publicado resultados de HumanEval, GSM8K, BBH ni otros benchmarks en la informacion disponible.

| Benchmark / Categoria | Scalar Phos Pro | Llama-3.1-8B-Instruct | Qwen2.5-7B-Instruct | Gemma-2-9B-Instruct |
|---|---|---|---|---|
| Parametros | 8,0B (QLoRA) | 8,0B | 7,6B | 9,2B |
| MMLU global | 66,55 % | 69,4 % | 74,2 % | 71,3 % |
| Ciencias sociales | 78,06 % | 80,2 % | 83,1 % | 79,5 % |
| Humanidades | 69,23 % | 71,5 % | 76,4 % | 73,0 % |
| Otros (negocio/medicina) | 68,72 % | 70,8 % | 75,9 % | 72,4 % |
| STEM | 55,96 % | 58,1 % | 63,5 % | 60,2 % |

El ajuste QLoRA no mejora al modelo base en ninguna categoria de MMLU segun los propios datos del autor; la caida oscila entre 1,4 y 2,5 puntos porcentuales segun la categoria.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 16 GB para los pesos (8B x 2 bytes) mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contexto moderado.
- VRAM estimada en GGUF Q4_K_M: en torno a 5-6 GB de pesos, con 8-10 GB recomendados para contexto largo.
- GPU recomendadas para BF16: NVIDIA A100 40 GB, H100, L40S o RTX 4090 (24 GB) para contexto corto y batches pequenos.
- GPU de consumo: el GGUF Q4_K_M cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en GPUs de 8 GB puede requerir offload parcial a CPU.
- Despliegue: llama.cpp, Ollama y LM Studio para el GGUF; transformers + peft para los adaptadores; vLLM y TGI para servir el modelo fusionado en BF16.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scalar Phos Pro | 8,0B | 128k | 66,55 % | Llama 3.1 Community | PEFT + GGUF en HF |
| Llama-3.1-8B-Instruct | 8,0B | 128k | 69,4 % | Llama 3.1 Community | Pesos completos en HF |
| Qwen2.5-7B-Instruct | 7,6B | 128k (32k nativo, extendido) | 74,2 % | Apache 2.0 (variante 7B) | Pesos completos en HF |
| Gemma-2-9B-Instruct | 9,2B | 8k | 71,3 % | Gemma Terms of Use | Pesos completos en HF |

Scalar Phos Pro no supera a ninguno de los tres modelos comparables en MMLU y ofrece menos contexto nativo que Qwen2.5 y Llama 3.1 en el caso de Gemma-2. Su ventaja relativa es la distribucion en formato LoRA y GGUF ya preparada, y su principal desventaja es la ausencia de validacion externa y el bajo rendimiento declarado frente al modelo base.

## Limitaciones y advertencias

- El MMLU publicado es inferior al del modelo base en todas las categorias; el ajuste QLoRA no aporta mejoras medibles en los datos disponibles.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues mas alla de las heredadas del modelo base.
- Riesgo de alucinacion inherente a un modelo de 8B ajustado con SFT sin etapa de RLHF documentada.
- No se documenta el dataset de entrenamiento, por lo que no se pueden evaluar sesgos introducidos por el ajuste ni la calidad de la mezcla SFT.
- Licencia Llama 3.1 Community: uso comercial permitido con restricciones (politica de uso aceptable, obligacion de atribucion y de nombrar el modelo "Llama" en productos derivados, limite de 700 millones de usuarios mensuales para el licenciatario).
- El repositorio tiene 0 descargas y 1 like, sin validacion independiente ni reportes de la comunidad.
- El contexto de 128k es el nativo del modelo base; no se ha verificado el rendimiento real en contextos muy largos tras el ajuste.
- El despliegue via adaptadores LoRA requiere descargar el modelo base por separado (licencia propia de Meta) y fusionar o cargar con peft.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scalar-ai/scalar-phos-pro
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
- vLLM: https://github.com/vllm-project/vllm
- TGI: https://github.com/huggingface/text-generation-inference
