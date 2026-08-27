# J-Fraudster/Qwen3.5-2B-W4A16-AutoRound

## Resumen

El modelo `J-Fraudster/Qwen3.5-2B-W4A16-AutoRound` es una versión cuantizada del modelo multimodal Qwen3.5-2B de Alibaba, desarrollada por el usuario J-Fraudster. Utiliza el algoritmo AutoRound de Intel para reducir los pesos a 4 bits manteniendo las activaciones en 16 bits (W4A16), lo que reduce drásticamente los requisitos de VRAM en comparación con el modelo original en BF16. El objetivo principal es permitir el despliegue en producción de un modelo de 2.000 millones de parámetros en GPUs de consumo como la RTX 3090 o 4090, sin sacrificar excesivamente la calidad de las respuestas.

La cuantización se ha realizado con parámetros orientados a producción: group size de 32, calibración con 512 muestras, secuencias de 4096 tokens y 1000 iteraciones de ajuste. La torre de visión se mantiene en BF16 para preservar la precisión en tareas de razonamiento visual y OCR, y las capas de predicción multi-token (MTP) también se conservan en bfloat16. El modelo tiene 1.061.364.544 parámetros y un tamaño de repositorio de 2,6 GB, lo que lo hace adecuado para entornos con memoria limitada.

Este modelo es relevante porque demuestra que es posible ejecutar un modelo multimodal de última generación en hardware asequible, manteniendo un rendimiento competitivo gracias a la calidad de la cuantización AutoRound. Está pensado para ser servido con vLLM, lo que facilita su integración en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B) con torre de visión |
| Parametros totales | 1.061.364.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de vLLM usa 4096, pero no se especifica el máximo) |
| Tipos de cuantizacion | W4A16 (4-bit pesos, 16-bit activaciones), group size 32, simétrico |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también se menciona GPTQ en los tags, pero el repo contiene safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer multimodal que procesa tanto texto como imágenes, con una torre de visión dedicada. La versión cuantizada mantiene la arquitectura original, pero los pesos de las capas de atención y MLP se convierten a enteros de 4 bits, mientras que las activaciones permanecen en bfloat16. La torre de visión y las capas de predicción multi-token (MTP) se conservan en bfloat16 para no degradar el rendimiento en tareas visuales y de generación predictiva.

La cuantización se realizó con Intel AutoRound, un algoritmo de cuantización de última generación que optimiza los pesos mediante calibración y ajuste iterativo. Se utilizaron 512 muestras de calibración con secuencias de 4096 tokens y 1000 iteraciones de tuning, con group size 32 y cuantización simétrica. Este proceso busca minimizar la pérdida de precisión respecto al modelo original en BF16, que requiere aproximadamente 54 GB de VRAM, frente a los 16-18 GB estimados para la versión cuantizada.

## Capacidades

- Generación de texto y razonamiento: al ser una versión cuantizada de Qwen3.5-2B, conserva las capacidades de generación de texto, razonamiento y comprensión del lenguaje del modelo base.
- Procesamiento de imágenes y texto: el pipeline es `image-text-to-text`, lo que permite entrada multimodal (imagen + texto) y salida de texto.
- Razonamiento visual y OCR: la torre de visión se mantiene en BF16, lo que preserva la precisión en tareas de reconocimiento óptico de caracteres y comprensión de imágenes.
- Multi-Token Prediction (MTP): las capas MTP se conservan en bfloat16, lo que puede mejorar la velocidad de generación al predecir varios tokens a la vez.
- Compatibilidad con vLLM: el modelo está diseñado para ser servido con vLLM, lo que facilita el despliegue de alto rendimiento en producción.
- Cuantización eficiente: gracias a la cuantización W4A16, el modelo puede ejecutarse en GPUs con 24 GB de VRAM, reduciendo el coste de hardware.

## Casos de uso

- Despliegue en producción con vLLM: el modelo puede servirse con vLLM usando el comando `vllm serve J-Fraudster/Qwen3.5-2B-W4A16-AutoRound --quantization auto-round --dtype bfloat16 --max-model-len 4096`, lo que permite atender peticiones de alta concurrencia en una sola GPU de 24 GB.
- Aplicaciones de visión por computadora: gracias a la torre de visión en BF16, el modelo es adecuado para tareas de descripción de imágenes, respuesta a preguntas visuales y OCR en documentos escaneados.
- Chatbots multimodales en entornos con recursos limitados: empresas o desarrolladores que no disponen de GPUs de gama alta pueden desplegar un asistente conversacional que entienda imágenes y texto con un coste de hardware reducido.
- Prototipado rápido de aplicaciones de IA: al requerir solo 16-18 GB de VRAM, el modelo permite iterar rápidamente en entornos de desarrollo con GPUs como RTX 3090 o 4090.
- Fine-tuning o adaptación posterior: aunque no se documenta explícitamente, al ser un modelo de 2B parámetros, es factible realizar fine-tuning con técnicas como LoRA para adaptarlo a dominios específicos, manteniendo la cuantización.
- Edge computing y despliegue en local: el tamaño reducido (2,6 GB) y los requisitos de VRAM moderados permiten ejecutar el modelo en estaciones de trabajo o servidores locales sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo original. Se recomienda evaluar el modelo en el caso de uso específico antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: 16-18 GB según la model card, lo que permite ejecutarlo en GPUs con 24 GB de VRAM.
- GPUs recomendadas: RTX 3090, RTX 4090, A5000 (todas con 24 GB). También se ha probado en una H200 (según el repositorio de kaitchup).
- GPU de consumo: sí, cabe en GPUs de consumo de gama alta con 24 GB.
- Opciones de despliegue: vLLM es la opción principal documentada. También podría usarse con otros backends compatibles con AutoRound, como llama.cpp o TGI, aunque no se mencionan.
- Latencia y throughput: no se proporcionan datos concretos. La cuantización W4A16 reduce el ancho de banda de memoria, lo que típicamente acelera la decodificación, pero no hay cifras específicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | VRAM estimada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-2B (original) | 2B | BF16 | ~54 GB | Apache 2.0 | Hugging Face |
| J-Fraudster/Qwen3.5-2B-W4A16-AutoRound | 2B | W4A16 (AutoRound) | 16-18 GB | Apache 2.0 | Hugging Face |
| kaitchup/Qwen3.5-2B-autoround-W4A16 | 2B | W4A16 (AutoRound) | No especificado | Apache 2.0 | Hugging Face |

La versión de kaitchup es muy similar, también cuantizada con AutoRound y compatible con vLLM, pero no se detallan sus parámetros de cuantización. El modelo original en BF16 requiere mucho más VRAM, lo que hace que la versión cuantizada sea más accesible para hardware de consumo.

## Limitaciones y advertencias

- Degradación de rendimiento: la cuantización a 4 bits puede provocar una pérdida de precisión en tareas complejas de razonamiento o generación de código, aunque AutoRound minimiza este efecto.
- Sesgos del modelo base: al ser una versión de Qwen3.5-2B, hereda los posibles sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o ambiguos.
- Longitud de contexto no especificada: no se indica la longitud máxima de contexto soportada por el modelo cuantizado. El ejemplo de vLLM usa 4096, pero podría ser mayor o menor.
- Idiomas no documentados: no se especifican los idiomas soportados, aunque Qwen3.5 suele ser multilingüe.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base.
- Requisitos de hardware: aunque cabe en GPUs de 24 GB, no es adecuado para GPUs con menos VRAM (por ejemplo, 8 GB o 12 GB) sin técnicas adicionales de offloading.

## Enlaces

- Repositorio del modelo: https://huggingface.co/J-Fraudster/Qwen3.5-2B-W4A16-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Intel AutoRound: https://github.com/intel/auto-round
- Documentación de LLM Compressor para Qwen3.5: https://docs.vllm.ai/projects/llm-compressor/en/latest/key-models/qwen3.5/
- Repositorio similar de kaitchup: https://huggingface.co/kaitchup/Qwen3.5-2B-autoround-W4A16
