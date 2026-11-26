# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1

## Resumen

Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1 es un adaptador PEFT de tipo QLoRA publicado por el usuario ahmedelgebaly sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos LoRA (aproximadamente 0,2 GB en el repositorio) que debe cargarse junto al modelo base de Meta para funcionar. El adaptador está especializado en tareas de question answering extractivo y de conocimiento científico, entrenado en dos fases: primero sobre SQuAD v1 y después sobre la totalidad de SciQ con un 10 % de repetición de SQuAD para mitigar el olvido catastrófico.

El modelo resuelve un problema acotado: ajustar un LLM generalista de 8B parámetros para responder preguntas de comprensión lectora y de ciencia a nivel escolar y universitario básico, manteniendo cierta capacidad original gracias al replay de datos. Es relevante en el contexto de investigación educativa (el autor lo enmarca en un "Scenario 1.2" de un trabajo académico de AAST 2026) y como ejemplo reproducible de entrenamiento secuencial con Axolotl y QLoRA de 4 bits.

La arquitectura subyacente es la del transformer decoder-only de Llama 3.1 8B, con 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens. El adaptador en sí no modifica esa arquitectura: solo añade matrices de bajo rango (r=16, alpha=32) sobre las capas del modelo base. La licencia es la Llama 3.1 Community License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA/QLoRA sobre el modelo base |
| Parametros totales | 8.030 millones (modelo base); el adaptador LoRA ocupa ~0,2 GB en el repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors (el base admite cuantizaciones estándar de Llama 3.1: 4-bit, 8-bit, GGUF, etc.) |
| Idiomas soportados | No disponible (la model card no especifica; el modelo base soporta oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors o cuantizado |

## Arquitectura y entrenamiento

El adaptador se entrena en dos etapas secuenciales. La primera (checkpoint padre: ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e1) ajusta el modelo base sobre SQuAD v1 en formato Alpaca. La segunda etapa, que corresponde a este checkpoint, continúa el entrenamiento desde ese adaptador padre usando `lora_model_dir` de Axolotl, con una mezcla de datos compuesta por la totalidad de SciQ (11.679 filas de entrenamiento) más un 10 % de SQuAD (1.167 filas, muestreadas con `random.sample` y semilla 42), lo que suma 12.846 filas de entrenamiento. La validación usa 1.000 filas exclusivamente de SciQ.

Los hiperparámetros son: LoRA con r=16, alpha=32 y dropout 0,05; QLoRA en 4 bits NF4; una época de la etapa 2; 294 pasos de entrenamiento; longitud de secuencia 512; learning rate 2e-4 con scheduler cosine; batch efectivo de 16. El framework utilizado es Axolotl junto con PEFT. El checkpoint reporta una pérdida de validación de 0,8682 y una perplejidad de validación de 2,3827, y el autor lo marca como el recomendado de la barrida de épocas por tener la menor pérdida de validación. No se documentan innovaciones arquitectónicas propias: se trata de un ajuste supervisado estándar (SFT) sin RLHF ni DPO declarados.

## Capacidades

- Question answering extractivo sobre pasajes de contexto, especialmente en el dominio de SQuAD v1 (preguntas factuales sobre un texto dado).
- Question answering de conocimiento científico de nivel escolar y universitario básico, entrenado sobre el corpus SciQ.
- Generación de texto conversacional, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento básico y respuesta a instrucciones en formato Alpaca (instruction / input / output).
- Soporte de conversaciones multi-turno gracias al modelo base (formato de chat de Llama 3.1).
- Capacidad multilingüe heredada del modelo base (oficialmente 8 idiomas), aunque el ajuste se realizó solo con datos en inglés, por lo que el rendimiento multilingüe puede degradarse.
- No se documenta soporte específico de tool calling, function calling, agentes, visión, audio ni modo thinking en la model card; las capacidades del modelo base (tool calling en Llama 3.1 Instruct) pueden verse alteradas por el ajuste.

## Casos de uso

- Evaluación de olvido catastrófico en ajuste secuencial: el adaptador sirve como artefacto reproducible para estudiar cómo el entrenamiento sobre SciQ afecta al rendimiento previo en SQuAD, gracias al diseño explícito de replay del 10 %.
- Reproducción de experimentos académicos: investigadores pueden cargar el adaptador con PEFT y comparar la pérdida de validación (0,8682) y la perplejidad (2,3827) con los checkpoints hermanos e1–e5 de la misma barrida.
- Asistente de estudio de ciencias: responder preguntas de física, química y biología de nivel escolar usando el conocimiento inyectado vía SciQ, adecuado para entornos educativos con preguntas cerradas.
- QA sobre documentación técnica: dado un pasaje de contexto, el modelo puede extraer la respuesta gracias al ajuste sobre SQuAD v1, útil en pipelines de búsqueda aumentada (RAG) con corpus en inglés.
- Generación de pares pregunta-respuesta sintéticos: usar el adaptador para producir datasets de QA a partir de textos científicos, aprovechando el formato Alpaca con el que fue entrenado.
- Prototipado rápido de sistemas de lectura comprensiva: al ser un adaptador de 0,2 GB, se puede intercambiar sobre el mismo modelo base en memoria para comparar variantes sin recargar los 8B parámetros.
- Fine-tuning incremental en dominios científicos: servir como punto de partida (checkpoint padre) para nuevos ajustes LoRA sobre subdominios específicos, reutilizando el adaptador ya entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de validación del entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss (etapa 2) | 0,8682 |
| Val PPL | 2,3827 |
| Pasos de entrenamiento | 294 |
| Filas de entrenamiento | 12.846 |
| Filas de validación | 1.000 (solo SciQ) |

No se proporcionan resultados de MMLU, HumanEval, GSM8K, SQuAD F1/EM ni SciQ accuracy, por lo que no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 requiere aproximadamente 16 GB; en 8 bits, unos 8-9 GB; en 4 bits (NF4), unos 5-6 GB. El adaptador añade un overhead mínimo (~0,2 GB).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores usando cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers + PEFT (carga documentada en la model card), vLLM (requiere fusionar el adaptador con el modelo base), llama.cpp/Ollama (previo merge y conversión a GGUF), TGI (con soporte de adaptadores PEFT).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SQuAD-then-SciQ QLoRA e1) | 8B (base) + LoRA r=16 | 128k | Adaptador PEFT | Llama 3.1 Community | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo completo | Llama 3.1 Community | Hugging Face, gated |
| ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e1 | 8B (base) + LoRA | 128k | Adaptador PEFT (etapa 1) | Llama 3.1 Community | Hugging Face |
| Checkpoints hermanos e2–e5 de la misma barrida | 8B (base) + LoRA | 128k | Adaptadores PEFT | Llama 3.1 Community | Hugging Face |

La comparación con modelos de QA especializados de otros autores no está disponible en la información proporcionada. Frente al modelo base, este adaptador sacrifica parte de la generalidad a cambio de especialización en SQuAD y SciQ, sin datos públicos que cuantifiquen esa ganancia.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere descargar y aceptar la licencia del modelo base gated meta-llama/Llama-3.1-8B-Instruct.
- El ajuste se realizó únicamente con datos en inglés (SQuAD v1 y SciQ), por lo que el rendimiento en castellano u otros idiomas puede degradarse respecto al modelo base.
- Riesgo de olvido catastrófico parcial: aunque se aplica un 10 % de replay de SQuAD, el entrenamiento prioriza SciQ y puede reducir capacidades generales del modelo base (código, matemáticas, instrucciones abiertas).
- Riesgo de alucinación inherente a los LLM de 8B, especialmente en preguntas científicas fuera de la distribución de SciQ.
- No se han publicado evaluaciones de sesgos, toxicidad ni robustez para este adaptador.
- La licencia Llama 3.1 Community impone restricciones de uso comercial (política de uso aceptable de Meta) y obligaciones de atribución; el autor indica que se debe citar los papers originales de SQuAD y SciQ.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad; conviene tratar los resultados como preliminares.
- La longitud de secuencia de entrenamiento fue de 512 tokens, por lo que el adaptador puede no haber aprendido a explotar contextos largos aunque el modelo base soporte 128k.
- No se documentan capacidades de tool calling ni de agentes tras el ajuste; podrían haberse visto afectadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador padre (etapa 1, SQuAD): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-e1
- Checkpoint hermano e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e2
- Checkpoint hermano e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e3
- Checkpoint hermano e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e4
- Checkpoint hermano e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-then-SciQ-QLoRA-e5
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/Seq_SQuAD_then_SciQ_Alpaca
- Dataset SciQ en formato Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Dataset SQuAD en formato Alpaca: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Framework Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Librería PEFT: https://github.com/huggingface/peft
