# Renjie-Ranger/writing-rft-grpo-all-ge6-step5-qwen2.5-7b

## Resumen

Writing RFT + GRPO all-ge6, step 5 es un ajuste fino de Qwen2.5-7B orientado a escritura creativa, publicado por el usuario Renjie-Ranger. Parte del checkpoint `writing-rft-qwen2.5-7b` y se exporta tras cinco actualizaciones de GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo. El modelo resuelve la tarea de generación de texto narrativo en inglés, con un pipeline de `text-generation` y pesos en safetensors BF16 compatibles con Transformers y Text Generation Inference.

El entrenamiento aplica una recompensa binaria: una historia solo recibe premio si las cuatro dimensiones de un juez automático alcanzan al menos 6 sobre 10. El autor indica explícitamente que la ejecución se detuvo de forma temprana tras cinco actualizaciones, y no se trata de un checkpoint de quince pasos. La model card no reclama mejoras en la calidad de escritura, lo que conviene tener en cuenta al evaluarlo.

Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y una licencia Apache 2.0, el modelo es relevante como ejemplo de aplicación de RLHF/GRPO sobre un modelo base pequeño para una tarea creativa concreta, y como punto de partida reproducible para quien quiera experimentar con recompensas basadas en jueces. Su alcance es limitado: solo inglés, sin benchmarks publicados y con un uso previsto muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), configuracion y tokenizer incluidos |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con atención causal estándar y sin componentes MoE. El proceso de entrenamiento consta de dos fases: primero un ajuste fino supervisado (RFT, rejection fine-tuning) que da lugar al checkpoint base `writing-rft-qwen2.5-7b`, y después cinco actualizaciones de GRPO sobre ese checkpoint. La recompensa es binaria y se concede únicamente cuando las cuatro dimensiones de un juez alcanzan una puntuación mínima de 6 sobre 10; no se documenta en la información disponible qué dimensiones evalúa el juez ni qué modelo lo implementa.

La exportación incluye únicamente pesos BF16 en safetensors, configuración y tokenizer; no se incluyen estados de optimizador, scheduler ni de reanudación distribuida. El autor advierte que las cuatro semillas de evaluación corresponden a una sola ejecución de entrenamiento, por lo que no deben interpretarse como evidencia de robustez estadística. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni detalles del prompt de entrenamiento más allá de la instrucción de usar la plantilla de chat del tokenizer con un prompt de escritura ordinario, sin prefijo de retroalimentación.

## Capacidades

- Generación de texto narrativo y escritura creativa en inglés, tarea principal para la que fue ajustado.
- Conversación multi-turno mediante la plantilla de chat del tokenizer incluido.
- Generación de texto general heredada del modelo base Qwen2.5-7B.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación de relatos cortos y ficción: el modelo se ha ajustado con recompensas de un juez sobre cuatro dimensiones de calidad narrativa, por lo que es adecuado para producir borradores de cuentos y escenas con un prompt de escritura directo.
- Prototipado de herramientas de escritura asistida: puede integrarse en un editor o aplicación de escritura creativa en inglés para sugerir continuaciones o variantes de texto.
- Investigación sobre RLHF y GRPO: sirve como referencia reproducible de un pipeline de recompensa binaria basada en juez aplicado a una tarea creativa sobre un modelo de 7B.
- Generación de contenido de marketing y copy en inglés: adecuado para textos breves donde se valore la fluidez narrativa, siempre con revisión humana.
- Creación de datasets sintéticos de escritura: puede emplearse para generar corpus de historias en inglés que después se filtren con criterios de calidad.
- Experimentación académica con ajuste fino: al ser Apache 2.0 y de tamaño contenido, es viable para laboratorios con una sola GPU de gama alta que quieran estudiar el efecto de distintas recompensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,2 GB solo para pesos, más memoria para el contexto y el runtime; en la práctica se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16.
- GPU de consumo: cabe en RTX 4090 en BF16 con contexto moderado; en RTX 3090/4080 (16-24 GB) es ajustado en BF16 y más holgado con cuantización.
- Opciones de despliegue: Transformers, Text Generation Inference (el modelo está etiquetado como `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Writing RFT + GRPO all-ge6 step 5 | 7,6 B | no disponible | Apache 2.0 | Escritura creativa, GRPO |
| Qwen2.5-7B (base) | 7,6 B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Propósito general |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | Instrucciones y chat |

La comparación con Qwen2.5-7B y Qwen2.5-7B-Instruct se basa en la familia de origen; no hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El autor declara explícitamente que la model card no reclama mejoras en la calidad de escritura; no debe asumirse superioridad frente al checkpoint RFT del que parte.
- Entrenamiento interrumpido tras cinco actualizaciones de GRPO; no es un checkpoint de quince pasos y puede estar infraentrenado.
- Las cuatro semillas de evaluación provienen de una única ejecución, sin evidencia de robustez estadística.
- Solo soporta inglés; el uso en castellano no está validado.
- Riesgo de alucinación y de sesgos heredados del modelo base Qwen2.5-7B, no evaluados en esta ficha.
- La recompensa depende de un juez automático cuyas dimensiones y umbrales no se documentan, lo que dificulta reproducir el criterio de calidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene revisar también las condiciones del modelo base Qwen2.5-7B.
- No se incluyen estados de optimizador ni de reanudación; no es posible continuar el entrenamiento desde este export sin reconstruir el estado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renjie-Ranger/writing-rft-grpo-all-ge6-step5-qwen2.5-7b
- Checkpoint base: https://huggingface.co/Renjie-Ranger/writing-rft-qwen2.5-7b
- Modelo de origen de la familia: https://huggingface.co/Qwen/Qwen2.5-7B
- Manifiesto de assets del repositorio: asset_manifest.json (incluido en el repositorio de Hugging Face)
