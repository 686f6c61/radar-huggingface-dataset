# budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300

## Resumen
Este modelo es un ajuste fino por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por el colectivo anonimo `budget-internalization-iclr2027` para una submission al congreso ICLR 2027. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas matematicos razonando dentro de un presupuesto de generacion fijo de 4.096 tokens, de modo que el razonamiento se internalice en lugar de extenderse indefinidamente. Es un experimento de investigacion sobre la gestion del presupuesto de tokens, no un modelo de produccion.

El modelo parte de una arquitectura Qwen3.5 de 4B parametros (4.539.265.536 parametros reales segun safetensors) y se entrena con GRPO sobre el dataset de matematicas DeepScaleR. Esta ficha concreta corresponde a la semilla 43 (de una ablacion con semillas 42, 43 y 44), checkpoint final del paso 300, con nombre de ejecucion `flyingcat`.

Su relevancia es metodologica: permite estudiar la varianza entre semillas de un mismo recetario de RL y comprobar si el modelo aprende a "presupuestar" su razonamiento. Al estar publicado bajo licencia Apache 2.0 y con pesos en safetensors, es facilmente reproducible y desplegable, aunque su caracter experimental limita su uso fuera de la investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, multimodal image-text-to-text) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Qwen3.5-4B base, un transformer multimodal con pipeline `image-text-to-text`, y se ajusta con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 4.096 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a producir razonamientos que caben en esa ventana.

Los datos de entrenamiento son el DeepScaleR-Preview-Dataset (matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. Los pesos se publican en BF16. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Razonamiento matematico paso a paso con formato de respuesta en `\boxed{}`.
- Generacion de texto y razonamiento de cadena de pensamiento bajo un presupuesto fijo de 4.096 tokens.
- Procesamiento de entrada image-text-to-text (heredado del modelo base).
- Entrenamiento RL orientado a la correctitud de la respuesta final, no a la calidad estilistica.
- Soporte multilingue: no disponible (no se especifican idiomas).
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles como caracteristica documentada.
- Modo thinking explicito: no disponible como funcionalidad formal; el prompt de entrenamiento induce razonamiento paso a paso.

## Casos de uso
- Investigacion sobre presupuesto de tokens: sirve para medir como un modelo de 4B internaliza un limite de 4.096 tokens y si mantiene la precision al truncar respuestas largas.
- Ablacion de semillas en RL: al existir las variantes seed42 y seed44, permite comparar la varianza entre ejecuciones del mismo recetario y evaluar la estabilidad del entrenamiento.
- Generacion de soluciones matematicas verificables: el formato `\boxed{}` facilita la extraccion automatica de respuestas en pipelines de evaluacion tipo MATH o DeepScaleR.
- Reproduccion de experimentos academicos: la configuracion completa (LR, lotes, pasos, recompensa) esta documentada, lo que permite replicar el entrenamiento en entornos de investigacion.
- Fine-tuning posterior como punto de partida: al ser un checkpoint RL de un base Apache 2.0, puede usarse como inicializacion para experimentos de razonamiento con restricciones de longitud.
- Evaluacion de robustez ante truncamiento: util para estudiar el comportamiento del modelo cuando la respuesta se corta a los 4.096 tokens y como afecta a la tasa de acierto.
- Despliegue ligero en entornos de prueba: con 4,54 B parametros y pesos BF16, cabe en GPUs de gama alta de consumo para inferencia experimental.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware
- VRAM estimada en BF16: aproximadamente 9,1 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para inferencia comoda.
- En cuantizacion de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o evaluacion por lotes; RTX 4090 (24 GB) para inferencia en BF16.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 en BF16; en GPUs de 8-12 GB requeriria cuantizacion no oficial.
- Opciones de despliegue: transformers (AutoModelForCausalLM), vLLM (`vllm serve`), y potencialmente llama.cpp/Ollama si se generan GGUF, aunque no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B GRPO seed43) | 4,54 B | no disponible (presupuesto 4k) | GRPO sobre DeepScaleR | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Preentrenamiento + post-entrenamiento | Apache 2.0 | Hugging Face |
| Variante seed42 (maturebass) | 4,54 B | no disponible (presupuesto 4k) | GRPO, semilla 42 | Apache 2.0 | Hugging Face |
| Variante seed44 (hugeguppy) | 4,54 B | no disponible (presupuesto 4k) | GRPO, semilla 44 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias
- Modelo de investigacion anonimo: no hay garantia de mantenimiento, soporte ni actualizaciones.
- Entrenado exclusivamente para matematicas con recompensa binaria; el rendimiento en otras tareas puede degradarse respecto al base.
- Riesgo de alucinacion en razonamientos largos, especialmente cuando la respuesta se trunca a los 4.096 tokens.
- No se documentan sesgos conocidos, idiomas soportados ni evaluaciones de seguridad.
- El truncamiento a 4.096 tokens puede penalizar problemas que requieren razonamientos mas largos.
- Licencia Apache 2.0 heredada del base: permite uso comercial, pero el caracter experimental desaconseja su uso en produccion sin evaluacion propia.
- No se especifican cuantizaciones oficiales ni contexto maximo de entrada, lo que complica la planificacion de despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Variante seed42 paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Variante seed42 paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Variante seed43 paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Variante seed44 paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
