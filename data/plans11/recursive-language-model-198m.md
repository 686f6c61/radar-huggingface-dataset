# Plans11/recursive-language-model-198m

## Resumen

El modelo `recursive-language-model-198m`, publicado por el usuario Plans11 en Hugging Face, es un modelo de lenguaje causal de 198,4 millones de parámetros entrenado desde cero (sin base preentrenada ni ajuste fino posterior) sobre una única GPU NVIDIA Tesla T4 en Kaggle. Su interés principal no reside en el rendimiento absoluto, sino en la propuesta arquitectónica: una variante de transformer denominada Mixture of Recursion (MoR), que aplica un número variable de pasos recursivos sobre un bloque compartido en función de la dificultad estimada de cada entrada.

La dificultad se estima mediante un router de perplejidad autosupervisado: el modelo mide su propia perplejidad sobre la secuencia y decide si ejecutar 1, 3 o 5 pasos recursivos. La idea es asignar más cómputo a las entradas que el modelo encuentra difíciles y menos a las que resuelve con confianza, sin necesidad de etiquetas manuales de dificultad. La arquitectura base consta de 16 capas transformer con RoPE, pre-norm y atención con enmascaramiento numéricamente estable en FP16.

El modelo es relevante como prueba de concepto reproducible de computación adaptativa en un presupuesto de hardware muy limitado, y como ejemplo poco habitual de documentación honesta de resultados: el propio autor reconoce una brecha de generalización entre la perplejidad de validación (15,37) y la de un conjunto de test fresco (43,21). Está entrenado únicamente en inglés, con licencia MIT y un contexto máximo de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture of Recursion (MoR): 16 capas base, RoPE, pre-norm, bloque recursivo compartido reutilizado 1/3/5 veces |
| Parametros totales | 198.464.806 |
| Parametros activos | no disponible (no es un MoE clásico; el cómputo varía por pasos recursivos, no por expertos) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se documenta entrenamiento e inferencia en FP16) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, con código personalizado (`custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se compone de un embedding de tokens con vocabulario BPE de GPT-2 (50.260 entradas más tokens especiales, ~39M parámetros), un cuerpo transformer de 16 capas (~149M parámetros), un router de perplejidad consistente en un MLP de dos capas (768→384→3, ~1,2M parámetros) y un bloque transformer compartido de ~7M parámetros que se reutiliza de forma recursiva. El router clasifica cada entrada en tres niveles de dificultad según la perplejidad: alta (>50) ejecuta 5 pasos recursivos, media (20–50) ejecuta 3 y baja (<20) ejecuta 1. El router se entrena de forma autosupervisada a partir de la señal de perplejidad del propio modelo, sin etiquetas de dificultad anotadas.

El entrenamiento se realizó sobre 150.000 muestras conversacionales: 80.000 de Anthropic HH-RLHF (53%), 50.000 de UltraChat (33%) y 20.000 de Alpaca-GPT4 (14%), con 2.000 muestras de validación de la misma distribución. La configuración fue de 2 épocas, 150.000 pasos totales, batch efectivo de 64 (batch 2 con acumulación de gradiente 32), longitud máxima de 512 tokens, learning rate 1e-4 con warmup lineal de 500 pasos y decaimiento coseno, optimizador AdamW, weight decay 0,01, clipping de gradiente 1,0 y precisión mixta FP16 con AMP. La pérdida total combina la pérdida de lenguaje más 0,1 veces la pérdida del router. El entrenamiento completo duró aproximadamente 9 horas y 12 minutos en una T4 de 15,6 GB.

Una innovación técnica destacable es el enmascaramiento numéricamente estable en FP16: en lugar del `-inf` habitual, se usa `-1e4` con clamping pre-softmax y `torch.nan_to_num` posterior, lo que según el autor produjo cero batches con NaN en los 150.000 pasos. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat específico (`<|user|>` / `<|assistant|>`).
- Razonamiento básico y respuesta a instrucciones, derivado del entrenamiento sobre Alpaca-GPT4 y UltraChat.
- Asignación adaptativa de cómputo: más pasos recursivos en entradas de alta perplejidad y menos en las de baja.
- Seguimiento de instrucciones simples y respuestas de estilo asistente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito más allá de la recursión interna.
- Capacidades multilingües limitadas al inglés; no se reporta entrenamiento en otros idiomas.
- No dispone de visión, audio ni modo de pensamiento explícito.
- Inferencia en FP16 tanto en GPU como en CPU (con `torch`).

## Casos de uso

- Investigación en computación adaptativa: el modelo sirve como banco de pruebas reproducible para estudiar routing por perplejidad y reutilización de bloques en un presupuesto de una sola T4, con código y configuración documentados.
- Experimentos académicos sobre eficiencia: permite comparar el coste de 1, 3 y 5 pasos recursivos frente a un transformer de profundidad fija del mismo tamaño, midiendo perplejidad y latencia.
- Generación de respuestas conversacionales cortas en inglés: adecuado para prototipos de chatbots de dominio acotado donde la latencia y el coste importan más que la calidad lingüística.
- Docencia y divulgación: su tamaño (198M) y su entrenamiento en una T4 lo hacen viable para demostraciones en aula sobre entrenamiento desde cero, estabilidad numérica en FP16 y diseño de routers.
- Fine-tuning ligero sobre dominios concretos: al ser MIT y pesar 0,8 GB, se puede ajustar en una GPU de consumo para tareas de clasificación o generación de texto especializado, partiendo de una base ya conversacional.
- Evaluación de técnicas de estabilidad numérica: el esquema de enmascaramiento con `-1e4` y clamping es directamente reutilizable en otros entrenamientos en FP16 con presupuestos limitados.
- Baseline para comparativas de perplejidad: útil como referencia de un modelo pequeño entrenado con datos conversacionales frente a GPT-2 Medium en conjuntos de test frescos.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad, no de benchmarks estándar (MMLU, HumanEval, GSM8K no se reportan).

| Modelo | Parametros | PPL (validacion in-distribution) | PPL (test fresco HH-RLHF) |
|---|---|---|---|
| MoR 198M (epoca 1) | 198M | 21,75 | no disponible |
| MoR 198M (epoca 2) | 198M | 15,37 | 43,21 |
| GPT-2 Medium | 345M | no disponible | 26,89 |

El autor advierte explícitamente que la perplejidad de validación (15,37) no es comparable con la de benchmarks estándar de GPT-2 Medium, al medirse sobre distribuciones distintas, y que la brecha entre 15,37 y 43,21 indica sobreajuste a la distribución de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,4 GB para los pesos (198M × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: NVIDIA T4 (la usada en entrenamiento), RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo es demasiado pequeño para aprovechar GPUs de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU con `torch`.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el código personalizado dificulta su conversión a GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones de latencia ni tokens por segundo. El coste computacional varía por entrada según el número de pasos recursivos (1, 3 o 5).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento reportado |
|---|---|---|---|---|---|
| MoR 198M (este) | 198M | 512 | MIT | Transformer con recursión adaptativa por perplejidad | PPL 43,21 en test fresco HH-RLHF |
| GPT-2 Medium | 345M | 1.024 | MIT | Transformer denso estándar | PPL 26,89 en el mismo test fresco |
| GPT-2 Small | 124M | 1.024 | MIT | Transformer denso estándar | no disponible en la información |
| Modelos de ~200M con contexto largo | variable | 2.048–8.192 | variable | Transformer denso | no disponible en la información |

La comparación directa disponible es únicamente con GPT-2 Medium, que con casi el doble de parámetros obtiene mejor perplejidad en el test fresco. No se dispone de datos de benchmarks de tareas (MMLU, HumanEval) para establecer comparaciones adicionales.

## Limitaciones y advertencias

- Sobreajuste documentado: la perplejidad de validación (15,37) frente a la de test fresco (43,21) indica una brecha de generalización significativa; el autor lo reconoce y atribuye a la escasez y poca diversidad de los datos (150.000 muestras).
- Contexto muy limitado: 512 tokens restringen conversaciones multi-turno largas, resúmenes de documentos y cualquier tarea que requiera ventanas amplias.
- Solo inglés: no hay evidencia de competencia en castellano ni en otros idiomas.
- Riesgo de alucinación: es un modelo pequeño entrenado sobre datos sintéticos (UltraChat, Alpaca-GPT4) y con solo 2 épocas; la fiabilidad factual es baja.
- Formato de chat obligatorio: debe usarse exactamente `<|user|>\n...\n<|assistant|>\n` con `add_special_tokens=False`; otros formatos degradan la salida.
- Requiere `trust_remote_code=True`: el modelo incluye código personalizado, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Licencia MIT: permite uso comercial, pero no hay garantías ni soporte del autor; la responsabilidad sobre sesgos y salidas recae en el integrador.
- Sesgos: no se documenta ninguna evaluación de sesgos; los datasets de origen (HH-RLHF, UltraChat, Alpaca-GPT4) arrastran los sesgos de sus generadores y anotadores.
- No apto como modelo de producción generalista: su valor es experimental y educativo, no competitivo frente a modelos del mismo tamaño entrenados con más datos.
- Fecha de creación del repositorio (2026-11-12) y discrepancia entre el identificador del autor en la URL (`Plans11`) y el usado en el código de ejemplo de la model card (`Girinath11`); conviene verificar el identificador correcto antes de cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Plans11/recursive-language-model-198m
- Dataset Anthropic HH-RLHF: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Dataset UltraChat: https://huggingface.co/datasets/stingning/ultrachat
- Dataset Alpaca-GPT4: https://huggingface.co/datasets/vicgalle/alpaca-gpt4
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
