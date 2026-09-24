# etiennebamas/feedback-grpo-step-200-reasoning-sft

## Resumen
El modelo feedback-grpo-step-200-reasoning-sft es un ajuste fino completo (full fine-tuning) de la familia Qwen3, publicado por el usuario etiennebamas en Hugging Face. Deriva directamente de formalmathatepfl/qwen3-sft-feedback-with-proof-repair-rl-200-unmasked y cuenta con 8.190.735.360 parametros (~8,19 mil millones) en un transformer denso orientado a generacion de texto, razonamiento y matematicas. El repositorio ocupa 16,4 GB, lo que corresponde a pesos en precision completa (16 bits por parametro).

El modelo aborda el razonamiento matematico formal y la reparacion de demostraciones. Su nombre refleja un pipeline de post-entrenamiento en dos etapas: por un lado, entrenamiento con refuerzo mediante GRPO a partir de retroalimentacion (feedback) hasta el paso 200, y por otro, un ajuste supervisado (SFT) especifico de razonamiento sobre el dataset lean_reasoning_sft_feedback. Se entrenó con LLaMA-Factory y es compatible con la libreria transformers.

Es relevante como ejemplo practico de las recetas actuales de post-entrenamiento para LLMs matematicos (RL con GRPO seguido de SFT), aunque su adopcion es por ahora muy limitada: cero descargas, cero likes, model card autogenerada y sin resultados de evaluacion publicados.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3); no es MoE ni SSM |
| Parametros totales | 8.190.735.360 (~8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base de la familia Qwen3 soporta 32.768 tokens, extensibles a 131.072 mediante YaRN) |
| Tipos de cuantizacion | No especificados por el autor; al ser compatible con transformers y safetensors admite cuantizacion posterior (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible en la informacion proporcionada (la familia Qwen3 base declara soporte multilingue de 119 idiomas) |
| Licencia | other |
| Formato de pesos | safetensors (precision completa, ~16 bits por parametro segun el tamano del repo) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura transformer densa decoder-only, heredada de la familia Qwen3. No se trata de una arquitectura MoE: los 8,19 mil millones de parametros estan activos en cada pasada. El tag "full" indica que se realizó un ajuste fino completo de todos los pesos (no un adaptador LoRA). El entrenamiento se llevó a cabo con LLaMA-Factory sobre el dataset lean_reasoning_sft_feedback, presumiblemente centrado en razonamiento sobre Lean y reparacion de pruebas.

Los hiperparametros declarados son: learning rate de 1e-05, tamano de lote de entrenamiento de 1 (8 en total con 8 dispositivos), tamano de lote de evaluacion de 8 (64 en total), semilla 42, optimizador AdamW_TORCH_FUSED con betas (0,9, 0,999) y epsilon 1e-08, scheduler coseno con warmup del 5 %, y 2 epocas. Se utilizó entrenamiento distribuido en 8 GPU. Las versiones de framework son Transformers 4.57.3, PyTorch 2.9.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. El nombre del modelo sugiere una fase previa de RL con GRPO (paso 200) sobre la que se aplicó este SFT de razonamiento, aunque el autor no detalla la composicion del dataset ni la funcion de recompensa.

## Capacidades
- Generacion de texto conversacional (tag "conversational") y de texto general.
- Razonamiento matematico y formal, presumiblemente orientado a demostraciones en Lean y reparacion de pruebas.
- Razonamiento en varios pasos (herencia del pipeline GRPO + SFT de razonamiento).
- Compatibilidad con tool calling / function calling segun las capacidades de la familia Qwen3 base (no confirmado en la model card).
- Soporte multilingue heredado del modelo base Qwen3 (no confirmado explicitamente).
- Modo "thinking" o razonamiento explicito: no confirmado por el autor, aunque el nombre del modelo apunta a salidas de razonamiento.

## Casos de uso
- Generacion y reparacion de demostraciones formales: el modelo se entrenó sobre un dataset de razonamiento Lean y reparacion de pruebas, por lo que puede emplearse como asistente para completar o corregir demostraciones en entornos de verificacion formal.
- Tutorizacion de matematicas paso a paso: al estar afinado para razonamiento, puede desglosar la resolucion de problemas y explicar cada paso, util en plataformas educativas.
- Asistente de investigacion en matematicas: apoyo en la exploracion de conjeturas y en la comprobacion de pasos intermedios de argumentos, siempre con supervision humana.
- Generacion de texto conversacional multi-turno: el tag "conversational" y su base Qwen3 lo hacen apto para dialogos encadenados en chatbots.
- Fine-tuning posterior como base especializada: al ser un checkpoint de razonamiento ya entrenado, sirve como punto de partida para nuevas rondas de RL o SFT sobre dominios matematicos.
- Evaluacion de pipelines de post-entrenamiento: util para investigadores que quieran reproducir la combinacion GRPO + SFT y comparar configuraciones.
- Integracion en pipelines de transformers/TGI: al ser compatible con text-generation-inference, puede desplegarse como endpoint de generacion de texto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene un array de resultados vacio, y el autor no incluye metricas de evaluacion (MMLU, GSM8K, HumanEval u otras).

## Requisitos de hardware
- VRAM para inferencia en precision completa (BF16/FP16): aproximadamente 16,4 GB solo para los pesos, mas overhead de KV cache y activaciones (del orden de 18-20 GB en la practica).
- VRAM en cuantizacion INT8: aproximadamente 9-10 GB.
- VRAM en cuantizacion INT4 (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion; en precision completa cabe en una sola GPU de 24 GB.
- Compatibilidad con GPU de consumo: si, cabe en RTX 4090 y RTX 3090 (24 GB) en FP16, y en tarjetas de 8-12 GB si se cuantiza a INT4.
- Opciones de despliegue: vLLM, TGI (el modelo incluye el tag text-generation-inference), llama.cpp y Ollama (previo a la conversion a GGUF), y transformers de forma nativa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota sobre entrenamiento: el ajuste fino completo de este modelo requirió 8 GPU en configuracion distribuida segun los hiperparametros declarados.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| feedback-grpo-step-200-reasoning-sft | 8,19 B | no disponible | other | Hugging Face (transformers, TGI) |
| Qwen3-8B (modelo base de la familia) | ~8,2 B | 32.768 tokens (extensible a 131.072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente soportado |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B | 131.072 tokens | MIT | Hugging Face |
| Llama-3.1-8B-Instruct | ~8,03 B | 131.072 tokens | Llama 3.1 Community License | Hugging Face |

Los datos de Qwen3-8B, DeepSeek-R1-Distill-Qwen-7B y Llama-3.1-8B corresponden a informacion publica de sus respectivos modelos originales y no estan confirmados en la informacion proporcionada sobre este checkpoint. No hay resultados de rendimiento disponibles para establecer comparaciones cuantitativas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del modelo base Qwen3 y del dataset lean_reasoning_sft_feedback.
- Riesgo de alucinacion: elevado en tareas de razonamiento formal si no se verifica la salida con un comprobador (por ejemplo, un kernel de Lean); no se han publicado evaluaciones de fiabilidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan especificados en la informacion disponible; el ajuste sobre un dataset especifico de razonamiento puede degradar capacidades generales fuera del dominio matematico.
- Restricciones de licencia: la licencia es "other", sin texto de licencia detallado en la informacion proporcionada; es imprescindible revisar los terminos antes de cualquier uso comercial, especialmente por la herencia de licencias de los modelos base.
- Caveats para produccion: cero descargas y cero likes, model card autogenerada e incompleta, ausencia de benchmarks y de documentacion sobre el dataset y la funcion de recompensa. Se recomienda tratar el checkpoint con cautela y validarlo exhaustivamente antes de desplegarlo.
- El modelo se encuentra en una cadena de ajustes (fine-tune de un fine-tune), lo que dificulta trazar exactamente que datos y que objetivos de entrenamiento han influido en sus pesos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/etiennebamas/feedback-grpo-step-200-reasoning-sft
- Modelo base: https://huggingface.co/formalmathatepfl/qwen3-sft-feedback-with-proof-repair-rl-200-unmasked
- Paper de referencia sobre recetas de dos etapas (SFT + RL) para LLMs matematicos: https://arxiv.org/abs/2507.08267
- Paper de GRPO (DeepSeekMath): https://huggingface.co/docs/trl/grpo_trainer
- Documentacion de SFT Trainer (TRL): https://huggingface.co/docs/trl/sft_trainer
- Paper de StepGRPO: https://arxiv.org/abs/2503.12937
- Repositorio verl (framework de RL): https://github.com/verl-project/verl
