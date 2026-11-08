# emee-ai/DeepSeek-V4-Pro-Qwen3.5-9B

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B es un ajuste fino (fine-tune) orientado a razonamiento del modelo Qwen3.5-9B, publicado por el usuario emee-ai en Hugging Face. El modelo se ha entrenado por destilación a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", concentrando la señal supervisada en la resolución de problemas matemáticos y de ciencia, tecnología, ingeniería y matemáticas (STEM), manteniendo la eficiencia y la facilidad de despliegue propias de la clase de 9B parámetros.

El modelo parte de la arquitectura Qwen3.5 del modelo base (un transformer denso de aproximadamente 9.653 millones de parámetros, según los pesos en safetensors) y se distribuye con licencia Apache 2.0. La model card indica que el entrenamiento se apoya en aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico, e incluye etapas de SFT y RL (con GSPO) según las etiquetas del repositorio. Se declara soporte para seis idiomas: inglés, chino, coreano, japonés, español y ruso.

La relevancia del modelo reside en su propuesta de trasladar parte de la capacidad de razonamiento de un modelo profesor de gran tamaño (DeepSeek-V4-Pro) a un modelo compacto de 9B, con rutas de despliegue evaluadas tanto en vLLM con cuantización NVFP4 como en llama.cpp mediante variantes MTP-GGUF. Además, el autor reporta pequeñas mejoras en programación y uso de herramientas aunque no se haya incluido SFT específico de código, lo que resulta interesante para pipelines de agentes y function calling en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (familia qwen3_5) |
| Parametros totales | 9.653.104.368 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (evaluado en vLLM) y Q8_0 vía MTP-GGUF (llama.cpp); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo); GGUF en el repositorio MTP-GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint unsloth/Qwen3.5-9B, por lo que hereda la arquitectura transformer densa de la familia Qwen3.5, con soporte multimodal declarado en las etiquetas (image-text-to-text) y pipeline principal de generación de texto. El repositorio incluye además una referencia a un proyector de visión en el repositorio MTP-GGUF, lo que sugiere que el modelo base conserva capacidades de entrada de imagen, aunque la model card no detalla el funcionamiento de esta ruta.

El entrenamiento se basa en destilación desde DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matemáticas y razonamiento STEM. Las etiquetas del repositorio indican etapas de SFT y RL con GSPO, además de soporte para MTP (multi-token prediction). La model card menciona que el proyecto se ha desarrollado en colaboración con el ingeniero de hardware Kyle Hessling, quien aportó infraestructura y soporte de entrenamiento. No se detalla la composición exacta del dataset, el número total de tokens de entrenamiento ni los hiperparámetros de RL.

## Capacidades

- Generación de texto y razonamiento estructurado con descomposición de problemas en varios pasos.
- Razonamiento matemático y resolución de problemas STEM, área en la que se concentra la señal de entrenamiento.
- Soporte de tool calling y function calling (etiquetas tool-use y function-calling).
- Capacidades de agente y razonamiento multi-paso, orientadas a flujos de trabajo con llamadas a herramientas.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento explícito (etiqueta reasoning) heredado del proceso de destilación.
- Soporte de multi-token prediction (MTP) para acelerar la decodificación en las variantes GGUF.
- Posible entrada de imagen según las etiquetas del repositorio (image-text-to-text), aunque no se detalla en la model card.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede descomponer problemas de álgebra, cálculo o estadística en pasos intermedios y explicar el razonamiento, aprovechando las aproximadamente 250.000 muestras de entrenamiento centradas en matemáticas.
- Asistencia en investigación STEM: útil para resumir y razonar sobre problemas de física, química o ingeniería, con explicaciones paso a paso que facilitan la verificación por parte del investigador.
- Agentes con tool calling: al soportar function calling, puede integrarse en flujos donde consulte calculadoras, APIs de datos científicos o motores de búsqueda para resolver tareas compuestas.
- Generación de código en pipelines de CI/CD: aunque no recibió SFT específico de código, la model card reporta mejoras en programación por transferencia cruzada, lo que permite usarlo como asistente de parcheo o revisión en entornos con recursos moderados.
- Despliegue en hardware de consumo: con cuantización Q8_0 vía MTP-GGUF y llama.cpp, puede ejecutarse en estaciones de trabajo con una sola GPU consumer para prototipos y demos.
- Servicio de inferencia en producción con vLLM: la ruta NVFP4 evaluada permite servir el modelo con mayor throughput en GPUs de centro de datos, adecuado para APIs internas de razonamiento.
- Atención al cliente técnica: su capacidad multilingüe (seis idiomas) y de razonamiento multi-paso permite gestionar consultas técnicas complejas en varios turnos, aunque la longitud de contexto no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~9,65B parámetros, en FP16 se requieren aproximadamente 19,3 GB de pesos (tamaño del repositorio), y en Q8_0 alrededor de 10 GB, aunque estas cifras son estimaciones basadas en el tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor; la model card menciona evaluación en vLLM con NVFP4 (orientado a GPUs de centro de datos como H100 o L40S) y en llama.cpp con MTP-GGUF.
- GPU consumer: la variante Q8_0 en GGUF podría caber en GPUs consumer con 12-16 GB de VRAM, si bien no hay confirmación oficial.
- Opciones de despliegue: vLLM (ruta NVFP4 evaluada), llama.cpp (ruta MTP-Q8_0 evaluada), transformers (librería declarada) y text-generation-inference (etiqueta del repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B | ~9,65B | No disponible | Apache 2.0 | Hugging Face (emee-ai y Jackrong) |
| Qwen3.5-9B (unsloth) | ~9B | No disponible | No disponible en la informacion | Hugging Face (unsloth) |
| DeepSeek-V4-Pro | No disponible | No disponible | No disponible en la informacion | No disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El entrenamiento se concentra en matemáticas y STEM; el rendimiento en dominios ajenos (derecho, medicina clínica, humanidades) puede ser inferior al de un modelo generalista del mismo tamaño.
- No se han publicado benchmarks oficiales, por lo que no es posible verificar cuantitativamente las mejoras frente al modelo base.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados, especialmente en problemas STEM con datos numéricos inventados o pasos intermedios no verificados.
- Sesgos conocidos: no documentados por el autor; se recomienda evaluar sesgos de idioma y dominio antes de un despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y de los datos de destilación de DeepSeek-V4-Pro, que no se detallan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- Las rutas de despliegue evaluadas (NVFP4 y MTP-Q8_0) son específicas; otras configuraciones no han sido verificadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emee-ai/DeepSeek-V4-Pro-Qwen3.5-9B
- Repositorio espejo: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variantes MTP-GGUF: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
