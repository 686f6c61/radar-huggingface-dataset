# egg1234/eggAI

## Resumen

eggAI es un ajuste fino (fine-tuning) del modelo Qwen3.5-0.8B desarrollado por el usuario egg1234, publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo de lenguaje de aproximadamente 752 millones de parámetros (752.393.024 según los pesos en safetensors) orientado exclusivamente a texto, derivado del modelo base de Qwen tras eliminar la capacidad de comprensión visual multimodal. Su objetivo declarado es actuar como asistente local en chino con tres funciones concretas: escribir código Python, explicar errores y mantener conversaciones cotidianas.

El modelo emplea la arquitectura Qwen3.5 (24 capas, dimensión oculta de 1024) y fue ajustado mediante LoRA en dos fases: una primera centrada en consolidar la identidad del asistente y una segunda orientada a las capacidades funcionales. El conjunto de entrenamiento es reducido (en torno a 1230 ejemplos de capacidad más 30 ejemplos de identidad con reponderación) e incluye datos de programación validados mediante `py_compile` y ejecución real, instrucciones, matemáticas, comandos de Windows y conversación.

Su relevancia actual reside en su tamaño reducido, que permite ejecución en hardware de consumo, y en la disponibilidad de pesos en formato GGUF cuantizado (Q4_K_M de aproximadamente 505 MB), lo que facilita el despliegue local con llama.cpp. No obstante, se trata de un modelo experimental con cero descargas y cero valoraciones en el momento de la ficha, sin benchmarks formales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), 24 capas, hidden 1024 |
| Parametros totales | 752.393.024 (aprox. 0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; max_len de entrenamiento de 1024 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (aprox. 505 MB); pesos completos en safetensors (aprox. 1,4 GB) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

eggAI se construye sobre la arquitectura Qwen3.5, un transformer de 24 capas con dimensión oculta de 1024, del que se han eliminado los componentes de comprensión visual para quedarse con el modelo puramente textual. El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0,05, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

El entrenamiento se estructuró en dos etapas para evitar que los datos de capacidad diluyeran la identidad del asistente. Primero se entrenaron únicamente 30 ejemplos de identidad durante 5 épocas con una tasa de aprendizaje de 3e-4; después se entrenó el conjunto completo de capacidades (1230 ejemplos, 3 épocas) con una tasa de 1,2e-4 a 1,5e-4. El corpus combina 316 ejemplos de programación (problemas Alpaca en chino validados con `py_compile` y comparación de salidas reales), 200 de instrucciones, 104 de matemáticas con razonamiento de 3-4 pasos, 28 de comandos Windows (PowerShell y CMD), 42 de conversación y los 30 de identidad reponderados. Los tokens de parada son `<|im_end|>` (248046) y `<|endoftext|>` (248044). No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de código Python, con especial énfasis en la resolución de problemas de programación en chino.
- Explicación de mensajes de error y depuración de código.
- Razonamiento matemático básico con cadenas de pensamiento (CoT) de 3-4 pasos.
- Instrucciones generales: reescritura, resumen, clasificación, extracción y explicación de texto.
- Generación de comandos de Windows (PowerShell y CMD).
- Conversación cotidiana y respuesta a preguntas de identidad (el modelo se identifica como eggAI, desarrollado por eggking).
- Soporte de plantilla de chat mediante `chat_template.jinja`.
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente ni de razonamiento multi-paso autónomo más allá del CoT simple.
- Capacidad multilingüe limitada al chino; no se documenta soporte de otros idiomas.
- Modelo exclusivamente textual: sin visión, audio ni otras modalidades.

## Casos de uso

- Asistente de programación local en Python: el modelo puede generar y explicar fragmentos de código en chino, adecuado para entornos sin conexión o con requisitos de privacidad, dado que los pesos Q4_K_M ocupan unos 505 MB.
- Explicación de errores en tiempo de desarrollo: integrado en un editor o CLI, puede interpretar trazas de error y proponer correcciones, aprovechando su entrenamiento específico en depuración.
- Generación de comandos de Windows: útil para administradores que necesiten construir comandos PowerShell o CMD a partir de una descripción en lenguaje natural.
- Chatbot de soporte básico en chino: para conversaciones multi-turno de baja complejidad, aunque limitado por su ventana de entrenamiento de 1024 tokens.
- Asistente educativo de matemáticas elementales: puede resolver problemas aritméticos con pasos intermedios, adecuado para ejercicios de nivel básico.
- Prototipado rápido y experimentación: al ser un modelo pequeño con licencia Apache-2.0, sirve como base para pruebas de pipelines de generación de texto o para fine-tunings posteriores.
- Despliegue en hardware de consumo: puede ejecutarse en portátiles o equipos sin GPU dedicada mediante llama.cpp con el archivo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo supera ligeramente al Qwen3.5-0.8B original y que en algunos escenarios supera a DeepSeek-R1-Distill-Qwen-1.5B-Q5_K_M, pero no se aportan cifras ni metodología verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp32 para los pesos completos; en torno a 0,6-0,8 GB con la cuantización Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para la versión cuantizada; para los pesos completos, 2-3 GB son suficientes.
- Cabe en GPU de consumo: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en CPU.
- Opciones de despliegue: llama.cpp (recomendado por el autor con el archivo GGUF), transformers con `AutoModelForCausalLM`, y potencialmente Ollama u otros clientes compatibles con GGUF.
- Latencia y throughput: no disponibles; el autor sugiere `temperature` entre 0,7 y 0,9 para uso conversacional y 0,3 en modo CLI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| eggAI | 0,75B | max_len entrenamiento 1024 | Apache-2.0 | safetensors, GGUF | Fine-tuning de Qwen3.5-0.8B, solo chino, sin benchmarks |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Apache-2.0 | safetensors | Modelo base multimodal del que deriva eggAI |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible | MIT (según versión) | safetensors, GGUF | Referencia citada por el autor; mayor tamaño y capacidades de razonamiento |

La comparación se limita a los modelos mencionados en la información disponible; no se dispone de datos de rendimiento cuantitativos para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Capacidad matemática débil: con 0,75B de parámetros, los problemas complejos (por ejemplo, de tipo "gallinas y conejos") producen resultados incorrectos según el propio autor.
- Contexto limitado: el entrenamiento usó `max_len` de 1024 tokens, por lo que las entradas largas se truncan.
- Conocimiento del mundo muy reducido: no se inyectó conocimiento factual, lo que incrementa el riesgo de alucinación en preguntas de tipo enciclopédico.
- Sesgos: no documentados, pero al entrenarse exclusivamente con datos en chino, el modelo está sesgado hacia ese idioma y su contexto cultural.
- Idiomas: solo chino; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Madurez: el repositorio tiene cero descargas y cero valoraciones, sin benchmarks ni validación externa; no se recomienda para producción sin evaluación previa.
- El modelo se identifica como "eggAI" y "eggking" de forma explícita, lo que puede no ser adecuado para despliegues de marca blanca.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egg1234/eggAI
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor en GitHub: https://github.com/egg1234
- Framework EggAI (posiblemente no relacionado con el modelo): https://github.com/eggai-tech/EggAI
