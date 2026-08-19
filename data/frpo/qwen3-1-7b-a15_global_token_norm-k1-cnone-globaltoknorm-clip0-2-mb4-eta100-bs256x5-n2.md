# FRPO/qwen3-1.7b-a15_global_token_norm-k1-cNone-globalTokNorm-clip0.2-mb4-eta100-bs256x5-n2

## Resumen

Este repositorio contiene un checkpoint de fine-tuning con aprendizaje por refuerzo (RL) del modelo Qwen/Qwen3-1.7B, desarrollado por el autor FRPO como parte de los experimentos **KL-in-LLM-RL / FRPO** y entrenado con el framework [verl](https://github.com/volcengine/verl) de Volcengine. El modelo está orientado a generación de texto conversacional y explora técnicas de alineación mediante optimización de políticas con restricciones de divergencia KL. El checkpoint corresponde al paso global 200 del entrenamiento y se distribuye en pesos fp32 sin post-procesado, tal y como los guardó el entrenador.

La relevancia de este modelo radica en su naturaleza experimental: es un ejemplo de aplicación de RL a un modelo de tamaño pequeño (1.7B parámetros base) con una configuración de hiperparámetros codificada en el propio nombre del repositorio. No se proporcionan métricas de rendimiento, licencia ni información sobre idiomas, por lo que su uso debe considerarse como una prueba de concepto para investigar metodologías de RL en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-1.7B) |
| Parametros totales | 2 031 739 904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B soporta 32 768 tokens) |
| Tipos de cuantizacion | No disponible (solo safetensors fp32) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por aprendizaje por refuerzo del checkpoint base `Qwen/Qwen3-1.7B`, que emplea una arquitectura transformer densa con atención causal. El entrenamiento se realizó con el framework verl y el método FRPO (siglas que probablemente corresponden a un algoritmo de optimización de políticas con regularización KL, aunque no se detalla en la documentación). La configuración del experimento está codificada en el nombre del repositorio: `a15_global_token_norm-k1-cNone-globalTokNorm-clip0.2-mb4-eta100-bs256x5-n2`, que sugiere un coeficiente alfa de 15, normalización global de tokens, clip de gradiente 0.2, mini-batch de 4, tasa de aprendizaje 1e-4, batch size de 256 con 5 réplicas y 2 nodos. No se especifica el dataset de entrenamiento ni si se aplicaron técnicas como RLHF o DPO; la model card solo indica que es un checkpoint de RL fine-tuning.

## Capacidades

- Generación de texto conversacional: el modelo base Qwen3-1.7B es capaz de mantener diálogos multi-turno y generar respuestas coherentes en varios idiomas (aunque no se confirma para este checkpoint).
- Razonamiento y comprensión: hereda las capacidades del modelo base, incluyendo razonamiento básico y seguimiento de instrucciones.
- Soporte de tool calling: no se menciona en la documentación; el modelo base Qwen3-1.7B sí soporta function calling, pero no hay confirmación de que este checkpoint lo conserve.
- Capacidades multilingües: no se indica; el modelo base soporta múltiples idiomas, pero este checkpoint no documenta su alcance.
- Sin modo de pensamiento explícito: no se menciona ninguna capacidad especial como thinking mode, visión o audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo para LLMs: este checkpoint sirve como referencia para estudiar el efecto de la regularización KL y la normalización global de tokens en la alineación de modelos pequeños.
- Evaluación de pipelines de RL con verl: los desarrolladores pueden utilizar este modelo para reproducir experimentos o comparar configuraciones de hiperparámetros.
- Prototipado de agentes conversacionales: dado su tamaño compacto, puede desplegarse en entornos con recursos limitados para probar interacciones básicas de chat.
- Fine-tuning posterior: al ser un checkpoint intermedio (paso 200), puede usarse como punto de partida para continuar el entrenamiento con otros métodos o datasets.
- Benchmarking de cuantización: los pesos fp32 permiten probar diferentes esquemas de cuantización (GGUF, AWQ, etc.) y medir su impacto en calidad, aunque no se proporcionan métricas de referencia.
- Educación y divulgación: útil para demostrar cómo se aplica RL a modelos de lenguaje y qué configuraciones se pueden explorar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 8.1 GB, por lo que se necesitan al menos 12 GB de VRAM para cargar el modelo sin cuantizar (considerando overhead de activaciones). Con cuantización a 8 bits (si se aplicara) bajaría a ~4 GB, y a 4 bits a ~2 GB, pero no se proporcionan archivos cuantizados.
- GPU recomendadas: para fp32, una GPU con 16 GB o más (p. ej., RTX 4080, RTX 4090, A100 40GB). Para cuantización, podría ejecutarse en GPUs consumer de 8 GB (RTX 3070/4060) con las herramientas adecuadas.
- Opciones de despliegue: compatible con transformers, por lo que puede servirse con vLLM, TGI, Ollama (si se convierte a GGUF) o llama.cpp. No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no se proporcionan datos. Al ser un modelo de 1.7B, se espera una latencia baja en GPUs modernas (del orden de decenas de milisegundos por token), pero depende del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (p. ej., Qwen3-1.7B base, Llama-3.2-1B, Gemma-2-2B). No se han publicado benchmarks ni detalles de rendimiento de este checkpoint. La única referencia es el modelo base Qwen3-1.7B, que sí tiene documentación pública, pero no se pueden establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al derivar de Qwen3-1.7B, el modelo puede heredar sesgos presentes en los datos de entrenamiento originales y es susceptible de generar contenido factualmente incorrecto.
- Riesgo de alucinación: sin ajuste adicional, puede producir respuestas plausibles pero falsas, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto efectiva tras el RL, ni los idiomas soportados; se recomienda asumir las mismas limitaciones que el modelo base (32k tokens, multilingüe limitado).
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido. Se debe contactar al autor antes de utilizarlo en producción.
- Estado experimental: es un checkpoint intermedio sin post-procesado ni evaluación; no está optimizado para uso productivo y puede presentar comportamientos inestables.
- Ausencia de cuantizaciones: solo se ofrecen pesos fp32, lo que limita su despliegue en entornos con restricciones de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a15_global_token_norm-k1-cNone-globalTokNorm-clip0.2-mb4-eta100-bs256x5-n2
- Framework verl: https://github.com/volcengine/verl
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
