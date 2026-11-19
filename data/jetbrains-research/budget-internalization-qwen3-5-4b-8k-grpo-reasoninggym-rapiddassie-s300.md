# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-reasoninggym-rapiddassie-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, cuyo objetivo es internalizar un presupuesto fijo de generación de 8.192 tokens. Se entrena con GRPO sobre tareas de Reasoning Gym, un generador procedural de problemas de razonamiento con respuestas verificables en formato `\boxed{}`. El modelo forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia cómo el entrenamiento con refuerzo bajo un límite estricto de tokens penaliza las respuestas que agotan el presupuesto (reciben recompensa cero) y empuja al modelo a resolver dentro de ese límite.

La relevancia práctica radica en que aborda el coste de la inferencia en modelos con razonamiento extendido: en lugar de escalar el cómputo en tiempo de test (más tokens de pensamiento), el modelo aprende a operar eficientemente dentro de una ventana fija de 8.192 tokens de generación. Esto lo hace interesante para despliegues con latencia y coste acotados, donde el razonamiento debe caber en un presupuesto conocido de antemano.

El checkpoint publicado corresponde al paso 300 del run interno `rapiddassie`. El modelo base es de tipo image-text-to-text (multimodal), con 4.659.865.088 parámetros totales y pesos en BF16. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen/Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el presupuesto de generación es de 8.192 tokens) |
| Tipos de cuantizacion | No disponible en la model card; pesos publicados en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con capacidad de entrada imagen-texto y salida de texto. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) usando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La innovación central es el presupuesto fijo de generación: `max_new_tokens` se fija en 8.192 y cualquier respuesta que alcanza ese límite recibe recompensa cero, lo que fuerza al modelo a internalizar el límite y producir razonamiento completo dentro de él.

Los datos de entrenamiento son tareas de Reasoning Gym, problemas de razonamiento generados proceduralmente con verificación automática sobre la respuesta en `\boxed{}`. La configuración reportada incluye 3 épocas como máximo, batches de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y un total de 300 pasos. Los prompts se renderizan con la plantilla de chat del modelo base. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de las tareas de Reasoning Gym.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en resolver problemas dentro de un presupuesto fijo de 8.192 tokens de generación.
- Razonamiento verificable sobre tareas de Reasoning Gym (problemas procedurales con respuesta en `\boxed{}`).
- Procesamiento de entrada multimodal imagen-texto, heredado del pipeline `image-text-to-text` del modelo base.
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento (thinking) explícito: no confirmado; el entrenamiento se centra en eficiencia de presupuesto, no en un modo de razonamiento separado.

## Casos de uso

- Razonamiento con coste acotado: desplegar el modelo con un límite duro de 8.192 tokens de salida para tareas de razonamiento donde el coste por petición debe ser predecible, aprovechando que fue entrenado para no agotar el presupuesto.
- Evaluación de investigación sobre budget internalization: reproducir o extender los experimentos del paper comparando este checkpoint con el modelo base sin RL para medir la pérdida de precisión fuera de presupuesto frente a la ganancia dentro de él.
- Generación de soluciones matemáticas y lógicas verificables: útil en pipelines donde la respuesta se valida automáticamente (formato `\boxed{}`), como evaluación de modelos o generación de datos sintéticos de razonamiento.
- Asistente de resolución de problemas paso a paso en entornos con latencia limitada: el modelo está optimizado para completar el razonamiento dentro de una ventana fija, lo que encaja en aplicaciones interactivas con SLA estrictos.
- Investigación en RLVR (RL with verifiable rewards): servir como punto de partida para experimentos de GRPO con recompensas verificables y distintos presupuestos de tokens.
- Procesamiento de documentos con componente visual: al heredar la capacidad image-text-to-text del modelo base, puede usarse en tareas de comprensión de imágenes con texto, aunque no hay evaluación publicada de esta capacidad tras el ajuste.
- Fine-tuning posterior: al estar en BF16 y con licencia Apache 2.0, puede servir de base para ajustes específicos de dominio manteniendo el comportamiento de presupuesto internalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, GSM8K, HumanEval ni evaluaciones del paper; solo describe la configuración de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos (4,66 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16 GB de VRAM para BF16 con contexto moderado.
- En cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB), H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 de una sola instancia.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB en BF16; en 8 GB solo con cuantización agresiva (no publicada).
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles. El presupuesto de 8.192 tokens de generación implica que una respuesta puede consumir hasta esa cantidad de tokens, lo que condiciona la latencia en función del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (budget-internalization Qwen3.5-4B) | ~4,66 mil millones | No disponible (presupuesto de generación 8.192) | GRPO sobre Reasoning Gym, 300 pasos | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,66 mil millones | No disponible | Preentrenamiento + alineación del autor original | Según modelo base (no confirmada aquí) | Hugging Face |
| Alternativas de ~4B con razonamiento RL | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables evaluados en las mismas condiciones en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El entrenamiento con recompensa cero al agotar el presupuesto puede degradar la precisión en problemas que requieren más de 8.192 tokens de razonamiento; el paper sugiere un intercambio entre escalado en tiempo de test y precisión dentro de presupuesto.
- Riesgo de alucinación inherente a los modelos de lenguaje, no evaluado en esta ficha.
- Sesgos: no se documentan evaluaciones de sesgo en la model card.
- Idiomas soportados no especificados; el comportamiento multilingüe tras el ajuste RL no está verificado.
- El ajuste se realizó exclusivamente sobre tareas de Reasoning Gym, lo que puede reducir el rendimiento en dominios fuera de distribución (código, matemáticas formales, conversación general).
- No hay versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin trabajo adicional de conversión.
- La model card no incluye sección de citation completa (marcada como TODO) ni resultados de evaluación; la reproducibilidad de las cifras del paper no está verificada en el repo.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen/Qwen3.5-4B y las condiciones de los datos de Reasoning Gym.
- El checkpoint es el paso 300 de un run concreto; no se documenta si es el mejor checkpoint ni su curva de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-reasoninggym-rapiddassie-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper mencionado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la información proporcionada)
- Reasoning Gym: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
