# HaolinRPI/Qwen2.5-7B-Instruct-MedMCQA-GRPO

## Resumen

Qwen2.5-7B-Instruct-MedMCQA-GRPO es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario HaolinRPI. El entrenamiento se realizó sobre 20.000 preguntas del conjunto de datos MedMCQA, un corpus de preguntas de opción múltiple del ámbito médico (exámenes de admisión a facultades de medicina de la India). El objetivo es mejorar la precisión del modelo en tareas de respuesta a preguntas médicas con formato de elección entre cuatro opciones (A, B, C, D).

El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales y una ventana de contexto de 32.768 tokens (característica del modelo base). El ajuste se realizó con la librería verl, usando 4 GPUs H200, FSDP2 para el actor y vLLM para el rollout. El checkpoint publicado corresponde al paso global 240, tras 3 épocas de entrenamiento.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de investigación reproducible sobre RL para dominios especializados (medicina), con métricas de validación declaradas por el autor (exactitud de 0,67 en una partición de 200 preguntas) y una tasa de formato de etiqueta de respuesta del 100%. No es un modelo de producción ni cuenta con una evaluación clínica independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 7.615.616.512 |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct; no verificada en esta revision) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via GPTQ/AWQ/GGUF, pero no publicada por el autor) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingue, pero el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-7B-Instruct, un transformer decoder-only denso con 7.615 millones de parámetros, atención por causalidad estándar y RoPE para codificación posicional. No se trata de un modelo MoE ni híbrido: es una arquitectura densa clásica. El autor no documenta cambios arquitectónicos respecto al modelo base; el ajuste es exclusivamente de pesos mediante RL.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) sobre 20.000 preguntas de entrenamiento de MedMCQA, con 3 épocas de 80 pasos cada una (240 pasos totales). Se usaron 4 GPUs H200, FSDP2 para el actor y vLLM para el rollout. El batch global fue de 250 prompts con 4 muestras por prompt, learning rate de 1e-6 y coeficiente KL de 0,001. La recompensa es binaria: 1 si la letra dentro de la última etiqueta `<answer>X</answer>` bien formada coincide con la opción correcta, 0 en caso contrario. No se documenta el uso de RLHF adicional, DPO ni datos de preferencia humana; el ajuste es puramente RL con recompensa basada en exactitud.

## Capacidades

- Generación de texto y razonamiento en dominios generales, heredados del modelo base Qwen2.5-7B-Instruct.
- Respuesta a preguntas médicas de opción múltiple (A, B, C, D) con formato de etiqueta `<answer>X</answer>` forzado por el entrenamiento.
- Razonamiento multi-paso orientado a la selección de la opción correcta en preguntas de examen médico.
- Capacidad multilingüe heredada del modelo base (no verificada ni declarada por el autor en esta revisión).
- Soporte de tool calling y function calling: no disponible en la información proporcionada; no se ha verificado que el ajuste GRPO preserve estas capacidades del modelo base.
- Capacidades de agente y razonamiento multi-paso general: no verificadas tras el ajuste.
- Modo thinking explícito: no disponible.
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- Evaluación de razonamiento médico en investigación: el modelo sirve como punto de comparación para estudiar el efecto de GRPO sobre la exactitud en MedMCQA, con una métrica declarada de 0,67 en una partición de 200 preguntas.
- Generación de respuestas de opción múltiple en entornos educativos controlados: se puede usar para simular exámenes de admisión médica y analizar la tasa de acierto por categoría de pregunta.
- Baseline para ajustes posteriores: al estar bajo licencia Apache 2.0 y en safetensors, puede servir como punto de partida para experimentos de RL con otras recompensas o dominios.
- Investigación sobre formato de salida estructurado: la tasa de formato de etiqueta del 100% lo hace útil para estudiar cómo el RL impone convenciones de salida en modelos de 7B.
- Reproducción de experimentos de RL con verl: el autor documenta la configuración (FSDP2, vLLM, batch, LR, KL), lo que facilita replicar el pipeline en clústeres con GPUs H200.
- Análisis de sesgos en preguntas médicas: permite estudiar si el ajuste GRPO sobre MedMCQA introduce sesgos hacia opciones mayoritarias o patrones de examen concretos.
- No se recomienda su uso en atención clínica real, diagnóstico ni triaje médico sin validación independiente y supervisión profesional.

## Benchmarks y rendimiento

El autor declara una única evaluación en la model card, sobre la partición de 200 preguntas de MedMCQA usada durante el entrenamiento (no una partición de test independiente):

| Metrica | Valor |
|---|---|
| Exactitud (greedy) en 200 preguntas MedMCQA | 0,67 |
| Tasa de formato de etiqueta de respuesta | 1,0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación declarada es sobre datos usados en entrenamiento, por lo que no constituye una medida de generalización.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB solo para pesos (7,615 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 16 y 20 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB para pesos; en 4 bits, alrededor de 4 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: H100, H200 o A100 80 GB para entrenamiento o inferencia en fp16 con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con contexto limitado, o en GPUs de 16 GB si se cuantiza a 8 bits (no publicado por el autor).
- Opciones de despliegue: vLLM (usado por el autor para rollout), TGI, llama.cpp u Ollama tras conversión a GGUF (no publicada), y transformers con safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-MedMCQA-GRPO | 7,6 B | 32.768 (heredado) | Apache 2.0 | Hugging Face | Ajuste GRPO sobre MedMCQA; exactitud 0,67 en 200 preguntas de entrenamiento |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | Apache 2.0 | Hugging Face | Modelo base; sin ajuste específico médico |
| Meditron-7B | 7 B | 4.096 | Llama 2 (uso restringido) | Hugging Face | Ajuste sobre corpus médico; contexto menor |
| BioMistral-7B | 7 B | 8.192 | Apache 2.0 | Hugging Face | Ajuste sobre PubMed Central; contexto menor |

La comparación con Meditron-7B y BioMistral-7B es orientativa: no se dispone de resultados de benchmarks comunes en la información proporcionada para establecer una comparación cuantitativa fiable. El modelo de este ficha no ha sido evaluado en particiones de test independientes, por lo que su rendimiento relativo frente a alternativas médicas no puede afirmarse con rigor.

## Limitaciones y advertencias

- La exactitud de 0,67 se midió sobre 200 preguntas de MedMCQA usadas durante el entrenamiento; no hay evaluación en test independiente, por lo que el riesgo de sobreajuste al conjunto es alto.
- El entrenamiento con recompensa binaria sobre la letra de respuesta puede favorecer atajos (sesgos hacia opciones mayoritarias) sin mejorar el razonamiento clínico real.
- Riesgo de alucinación en preguntas médicas fuera de la distribución de MedMCQA; el modelo no está validado para uso clínico.
- No se documentan sesgos demográficos, geográficos ni de otro tipo; MedMCQA está centrado en el sistema sanitario y educativo de la India, lo que puede introducir sesgos de dominio.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene sus propios términos que deben respetarse; el autor no documenta restricciones adicionales.
- No se verifican capacidades de tool calling, agentes ni multilingüismo tras el ajuste GRPO; podrían haberse degradado respecto al modelo base.
- El repositorio tiene 45,7 GB, lo que sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento; conviene revisar qué ficheros se descargan antes de desplegar.
- No hay información sobre el pipeline de inferencia ni sobre plantillas de prompt más allá del formato `<answer>X</answer>`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-7B-Instruct-MedMCQA-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería verl (usada para el entrenamiento): https://github.com/volcengine/verl
- Dataset MedMCQA: no disponible en la información proporcionada (referencia habitual: https://huggingface.co/datasets/openlifescienceai/medmcqa)
