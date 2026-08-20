# juwon1105/RLCC-ascending-phi4mini-bigmathdigits5000-n3

## Resumen

RLCC-ascending-phi4mini-bigmathdigits5000-n3 es un modelo de lenguaje de 3.8 mil millones de parámetros desarrollado por juwon1105, que parte de microsoft/Phi-4-mini-instruct y se entrena con un método novedoso de aprendizaje por refuerzo llamado RLCC (Reinforcement Learning with Confidence Curriculum). Este enfoque utiliza la confianza calibrada de un checkpoint RLCR como señal de dificultad para ordenar los datos de entrenamiento de difícil a fácil, con el objetivo de mejorar simultáneamente el razonamiento y la calibración de la incertidumbre en tareas matemáticas.

El modelo está especializado en resolución de problemas matemáticos con dígitos grandes (Big-Math-digits) y produce no solo la respuesta, sino también una estimación de confianza calibrada. Es relevante porque aborda un problema poco explorado: la calibración de la confianza en modelos de razonamiento, algo crítico para aplicaciones donde la incertidumbre debe comunicarse de forma fiable. El entrenamiento se realizó con GRPO y LoRA sobre un dataset de 5.000 muestras, y los resultados reportados muestran una precisión del 43,7% en datos de validación, con métricas de calibración (ECE, PCE, Brier) en torno a 0,34-0,35.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.760 (3,8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion posterior posible) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Phi-4-mini-instruct, un transformer decoder-only de 3,8B parámetros. El entrenamiento utiliza RLCC, que organiza el dataset en K=3 grupos barajados, cada uno ordenado de mayor a menor dificultad según la confianza calibrada de un checkpoint RLCR previo. El entrenamiento comienza desde el modelo base (no desde el checkpoint RLCR) y aplica GRPO (Group Relative Policy Optimization) con recompensa basada en coincidencia exacta de la respuesta final. Se emplea LoRA con rank 16, alpha 32 y dropout 0.05 sobre los módulos `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`. El dataset es mehuldamani/big-math-digits con 5.000 muestras de entrenamiento y 1.000 de validación. El rollout se realiza con vLLM a temperatura 0.7, 32 generaciones por prompt, y un batch efectivo de 1.024. Se usa AdamW de 8 bits, learning rate 5e-6 con warmup del 20%, y una longitud máxima de respuesta de 1.024 tokens. El entrenamiento se ejecutó en una sola RTX 3090 durante 16-36 horas de GPU.

## Capacidades

- Generacion de texto y razonamiento matematico: resuelve problemas aritmeticos con digitos grandes y extrae la respuesta final.
- Calibracion de confianza: produce una estimacion de probabilidad de que su respuesta sea correcta, calibrada mediante el entrenamiento RLCC.
- Razonamiento multi-paso: puede generar cadenas de razonamiento antes de dar la respuesta final.
- Soporte de tool calling: no disponible (no se menciona en la informacion).
- Capacidades multilingues: no disponibles (el modelo base Phi-4-mini-instruct tiene soporte multilingue limitado, pero no se especifica para este checkpoint).
- Capacidades especiales: no incluye vision ni audio; es exclusivamente texto.

## Casos de uso

- Evaluacion de incertidumbre en modelos de lenguaje: el modelo puede usarse para investigar como los LLM comunican su confianza, gracias a su calibracion explicita (ECE 0.347, AUROC 0.713).
- Tutoria matematica asistida: puede generar soluciones paso a paso y senalar cuando no esta seguro de la respuesta, ayudando a estudiantes a identificar errores.
- Sistemas de respuesta con umbral de confianza: en aplicaciones donde una respuesta incorrecta es costosa, se puede filtrar automaticamente las respuestas con baja confianza.
- Investigacion en aprendizaje por refuerzo: sirve como punto de partida para estudiar curriculums basados en confianza y metodos GRPO.
- Generacion de datos sinteticos para entrenamiento: puede producir pares problema-solucion con etiquetas de confianza, utiles para entrenar otros modelos.
- Benchmarking de calibracion: se puede utilizar como referencia para comparar tecnicas de calibracion en modelos de razonamiento.

## Benchmarks y rendimiento

Los resultados reportados en la model card (Tabla 11 del paper RLCC-A) son:

| Metrica | Valor |
|---|---|
| Accuracy (held-out) | 0.437 |
| ECE (Expected Calibration Error) | 0.347 |
| PCE (Probability Calibration Error) | 0.344 |
| Brier score | 0.34 |
| AUROC | 0.713 |

No se proporcionan comparaciones con otros modelos en la informacion disponible. Estos valores indican una precision moderada en problemas matematicos y una calibracion imperfecta (un ECE de 0.347 es alto, aunque el AUROC de 0.713 sugiere cierta discriminacion entre respuestas correctas e incorrectas).

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,8B parametros en FP16, se necesitan aproximadamente 7,7 GB de VRAM solo para los pesos, mas overhead de activaciones y KV cache. En cuantizacion de 4 bits, la VRAM se reduce a unos 2-3 GB.
- GPU recomendadas: una RTX 3090 (como la usada en entrenamiento) o superior es suficiente para inferencia. Tambien cabe en GPUs consumer como RTX 3060 12GB, RTX 4070, etc., con cuantizacion.
- Opciones de despliegue: compatible con transformers, vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante importacion).
- Latencia y throughput: no se han publicado mediciones especificas. Con vLLM en una RTX 3090, se espera un throughput de decenas de tokens por segundo para este tamano.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados para este checkpoint. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| RLCC-ascending-phi4mini (este) | 3,8B | no disponible | RL con curriculum de confianza | other |
| microsoft/Phi-4-mini-instruct (base) | 3,8B | no disponible | Instruct, sin calibracion explicita | MIT (probablemente) |
| Qwen2.5-3B-Instruct | 3B | 32K | Instruct general | Apache 2.0 |

La comparacion directa no es posible sin benchmarks comunes. El valor diferencial de este modelo es su calibracion de confianza, no su precision bruta.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado exclusivamente en problemas matematicos con digitos grandes, puede tener un rendimiento pobre en otros dominios (lenguaje general, codigo, etc.).
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas con alta confianza, aunque el entrenamiento RLCC intenta mitigarlo parcialmente.
- Limitaciones de contexto: la longitud de contexto no esta documentada; se asume la del modelo base (Phi-4-mini-instruct), pero no se garantiza.
- Restricciones de licencia: la licencia "other" no especifica los terminos exactos; se recomienda contactar al autor antes de uso comercial.
- Sobreajuste al dataset: el entrenamiento se realizo con solo 5.000 muestras y 1 epoca, lo que puede limitar la generalizacion a problemas matematicos fuera de la distribucion.
- Dependencia de la calibracion del checkpoint RLCR: la calidad del curriculum depende de la precision de la confianza del modelo RLCR previo, que no se proporciona.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juwon1105/RLCC-ascending-phi4mini-bigmathdigits5000-n3
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Paper RLCR (base del metodo, bajo revision): Damani, M., Puri, I., Slocum, S., Shenfeld, I., Choshen, L., Kim, Y., Andreas, J. (2026). "Beyond Binary Rewards: Training LMs to Reason about their Uncertainty". ICLR 2026.
- Paper RLCC (acompana este checkpoint, bajo revision anonima): "Confidence as Curriculum: Reinforcement Learning for Joint Reasoning and Calibration".
