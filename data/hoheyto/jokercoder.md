# hoheyto/JokerCoder

## Resumen

JokerCoder es un modelo de lenguaje fine-tuneado sobre Qwen3-8B (versión Unsloth con cuantización 4-bit) mediante QLoRA, desarrollado por hoheyto (Efe) con el objetivo específico de explicar código Python en turco para desarrolladores junior. El modelo genera respuestas en un formato de dos frases: una descripción técnica precisa de la función (entrada, proceso, salida) y una observación humorística derivada de la lógica del propio código, evitando metáforas decorativas.

El proyecto nace de un proceso de curado de datos de ~900+ ejemplos que atravesó cinco rondas de generación y validación, incluyendo la detección de problemas de calidad como exceso de argot, lenguaje poético y alucinaciones técnicas. Un hallazgo metodológico clave fue que el cambio de base model (de Qwen2.5-Coder-7B-Instruct a Qwen3-8B) resolvió un problema de "ensalada de palabras" que no podía corregirse mediante ajuste de hiperparámetros ni parámetros de generación.

El modelo está disponible con licencia MIT, pesa 5.0 GB en formato safetensors (8.190.735.360 parámetros totales) y también se distribuye en GGUF (Q4_K_M) para ejecución en CPU. La demo pública se sirve mediante FastAPI y Docker en Hugging Face Spaces, con tiempos de respuesta de 10-30 segundos en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-8B) con adaptadores LoRA |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32K, pero no se especifica en la ficha) |
| Tipos de cuantizacion | safetensors (FP16/BF16), GGUF Q4_K_M |
| Idiomas soportados | Turco (fine-tuning específico; el base es multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

JokerCoder se basa en la arquitectura transformer decoder de Qwen3-8B, un modelo de 8.2 mil millones de parámetros. El entrenamiento emplea QLoRA: el modelo base se cuantiza a 4-bit con bitsandbytes, mientras que los adaptadores LoRA se entrenan en 16-bit. Los hiperparámetros finales se determinaron mediante un pequeño ablation study sobre un subconjunto de 146 ejemplos: rank LoRA r=16, alpha alto (ratio alpha/r entre 2 y 4), learning rate 2e-4 con scheduler lineal, batch efectivo de 8 (per_device=2, gradient_accumulation=4) y 2-3 épocas (la validación mostró sobreajuste a partir de la época 4). Se utilizó `load_best_model_at_end=True` con `eval_loss` como métrica.

El dataset de entrenamiento (~900+ pares código-explicación) se generó combinando problemas estilo LeetCode con algoritmos originales producidos programáticamente mediante el módulo `ast`, distribuidos en dificultad (~30% básico, ~40% intermedio, ~30% avanzado). Las explicaciones se generaron mediante bootstrapping a partir de ejemplos dorados escritos a mano. El proceso de curado incluyó filtros de palabras prohibidas y análisis de frecuencia léxica para evitar estilos no deseados. El entrenamiento se realizó en una GPU T4 de Kaggle (nivel gratuito) usando el modo commit para evitar timeouts.

## Capacidades

- Explicación de funciones Python en turco, con formato estructurado en dos frases: una técnica y otra humorística.
- Comprensión de una amplia variedad de algoritmos: ordenación, búsqueda, grafos, programación dinámica, estructuras de datos, teoría de números, geometría y funciones de base para ML.
- Generalización a temas no vistos en el entrenamiento (probado con Heavy-Light Decomposition, multiplicación de Karatsuba, Reservoir Sampling y 0-1 BFS).
- Generación de texto en turco con gramática y fluidez correctas en la mayoría de los casos (~90%+ en evaluación manual).
- No soporta tool calling, function calling, agentes, visión ni audio.
- No se ha entrenado para razonamiento multi-step ni para tareas fuera del dominio de explicación de código.

## Casos de uso

- Aprendizaje de programación para juniors turcos: el modelo puede generar explicaciones accesibles de fragmentos de código, ayudando a entender la lógica de funciones típicas de entrevistas y ejercicios.
- Revisión educativa de código en entornos de formación: un instructor puede pasar funciones de ejemplo y obtener una explicación técnica clara más un toque de humor para hacer la sesión más amena.
- Documentación automática de scripts internos: dado un código Python, JokerCoder produce una descripción concisa de entrada/proceso/salida, útil para comentar funciones en repositorios personales o de equipos pequeños.
- Práctica de entrevistas técnicas: los aspirantes pueden usar el modelo para recibir explicaciones rápidas de soluciones a problemas clásicos y verificar su propia comprensión.
- Generación de contenido educativo en turco: creadores de tutoriales de programación pueden emplear el modelo para producir explicaciones alternativas con un tono ligero.
- Demo interactiva en Hugging Face Spaces: disponible públicamente para probar el modelo sin necesidad de infraestructura propia, vía API FastAPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor describe una evaluación manual sobre un conjunto held-out de 23 ejemplos (problemas estilo LeetCode) con una rúbrica que cubre precisión técnica, adherencia del humor al código y gramática/fluidez. Se reporta que tras el cambio al modelo base Qwen3-8B, la mayoría de los ejemplos (~90%+) mostró precisión técnica y fluidez, con una tasa de alucinación/palabras inventadas cercana a cero. También se realizaron pruebas de generalización con temas ausentes del dataset, con resultados que indican corrección pero cierta superficialidad en algoritmos avanzados.

## Requisitos de hardware

- Inferencia en GPU: al ser un modelo de 8B parámetros, cabe en GPUs con al menos 8 GB de VRAM si se usa cuantización (por ejemplo, GGUF Q4_K_M ocupa ~4.5 GB). Una RTX 3060 12GB o superior es suficiente para inferencia local.
- Inferencia en CPU: la demo oficial utiliza llama.cpp con GGUF Q4_K_M en CPU, con tiempos de respuesta de 10-30 segundos por petición, dependiendo de la longitud de entrada.
- Entrenamiento: realizado en una T4 de Kaggle (16 GB VRAM) con QLoRA, lo que indica que es factible fine-tunear en hardware de gama media.
- Opciones de despliegue: llama.cpp (para GGUF), FastAPI + Docker (como en la demo), y cualquier framework compatible con safetensors (transformers, vLLM, TGI) siempre que se aplique la cuantización adecuada.
- Latencia estimada: en GPU moderna (RTX 4090) se espera una generación de ~100 tokens en menos de 2 segundos; en CPU los tiempos son de decenas de segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| JokerCoder (Qwen3-8B + QLoRA) | 8.2B | no disponible | MIT | Explicación de código en turco con humor |
| Qwen2.5-Coder-7B-Instruct | 7.6B | 32K | Apache 2.0 | Generación y explicación de código (multilingüe) |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 license | Generación de código (inglés) |
| DeepSeek-Coder-7B-Instruct | 7B | 16K | DeepSeek License | Generación de código (inglés/chino) |

El autor probó Qwen2.5-Coder-7B-Instruct como base inicial y lo descartó por problemas de calidad en turco (alucinaciones y "ensalada de palabras"), optando por Qwen3-8B. No se dispone de comparativas cuantitativas publicadas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para explicar código en turco; no es adecuado para otros idiomas ni para tareas generales de generación de código.
- Tendencia a la repetición de ciertos adjetivos (por ejemplo, "titiz"), lo que reduce la diversidad léxica en las explicaciones.
- En algoritmos avanzados poco representados en el dataset (como Heavy-Light Decomposition), las explicaciones son técnicamente correctas pero superficiales.
- La calidad del humor es inconsistente: en algunos ejemplos está fuertemente ligado a la lógica del código, mientras que en otros resulta forzado.
- La demo en CPU tiene una latencia alta (10-30 segundos), lo que limita su uso interactivo.
- No se recomienda para revisión de código en entornos de producción ni para verificación de seguridad crítica.
- Aunque la licencia es MIT, el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0) que debe respetarse en redistribuciones.

## Enlaces

- [HuggingFace - hoheyto/JokerCoder](https://huggingface.co/hoheyto/JokerCoder)
- [Demo en Hugging Face Spaces](https://hoheyto-jokercoder-demo.hf.space/docs)
- [Perfil del autor en HuggingFace](https://huggingface.co/hoheyto/models)
- [EXPERIMENTS.md (registro de experimentos mencionado en la model card)](https://huggingface.co/hoheyto/JokerCoder/blob/main/EXPERIMENTS.md)
