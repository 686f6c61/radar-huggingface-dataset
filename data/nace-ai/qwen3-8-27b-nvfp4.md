# nace-ai/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una versión cuantizada a 4 bits en formato NVFP4 del modelo Qwen3.8-27B, publicada por el usuario nace-ai. El modelo base es un transformer multimodal de 27.781.427.952 parámetros desarrollado por el equipo Qwen, orientado a tareas de imagen-texto-a-texto (image-text-to-text) y conversación. Esta variante emplea la técnica NVFP4 (formato de coma flotante de 4 bits con escala global y por bloque) pensada específicamente para GPUs NVIDIA Blackwell, lo que reduce el peso del checkpoint hasta los 20,6 GB del repositorio.

La relevancia de esta publicación radica en que permite ejecutar un modelo de casi 28.000 millones de parámetros en hardware Blackwell con vLLM, manteniendo una precisión prácticamente idéntica a la versión bf16 según las pruebas del autor: 0,950 en GSM8K-100 frente a 0,940 del modelo de referencia en bf16. El autor reporta además un rendimiento de 195 tok/s en escritura y 10.781 tok/s en lectura de un prompt de 4K tokens sobre una B200.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explícitamente. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (image-text-to-text), tag `qwen3_5` |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de coma flotante), empaquetado con compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), etiquetado como 8-bit en los tags del repo |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de aproximadamente 27.800 millones de parámetros que procesa entradas de imagen y texto y genera texto. El tag `qwen3_5` sugiere que pertenece a la familia Qwen 3.5. Esta variante concreta no ha sido reentrenada: es una cuantización del checkpoint original realizada con llm-compressor (compressed-tensors) para su uso en vLLM y TensorRT-LLM sobre GPUs Blackwell. El tokenizer es byte a byte idéntico al de Qwen/Qwen3.8-27B.

La cuantización NVFP4 emplea una escala global y escalas por bloque. El autor advierte que vLLM emite un aviso porque la escala global del checkpoint difiere entre capas paralelas (q/k/v), lo que podría reducir la precisión; sin embargo, la medición en GSM8K-100 (0,950 frente a 0,940 en bf16) no muestra una pérdida práctica apreciable. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `image-text-to-text`, etiqueta `conversational`).
- Procesamiento de imágenes combinadas con texto como entrada, dado su pipeline multimodal.
- Razonamiento y resolución de problemas matemáticos: el autor valida el modelo con GSM8K.
- Ejecución en vLLM 0.33.0 sobre NVIDIA B200, probada con un serve y generaciones.
- Compatibilidad con TensorRT-LLM: el formato compressed-tensors está preparado para ello, aunque el autor indica que no lo ha probado.
- Tool calling, function calling, capacidades de agente, thinking mode, audio y cobertura multilingüe: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia de alto rendimiento en GPUs Blackwell: el checkpoint NVFP4 está diseñado para vLLM sobre B200, con 195 tok/s de escritura y 378 ms hasta el primer token en un prompt de 4K, lo que lo hace adecuado para servicios de generación con requisitos de latencia ajustados.
- Procesamiento de prompts largos: la lectura de un prompt de 4K tokens a 10.781 tok/s permite ingerir documentos extensos o historiales de conversación sin cuello de botella en la fase de prefill.
- Asistentes multimodales: al aceptar entradas de imagen y texto, puede emplearse en aplicaciones de descripción de imágenes, respuesta a preguntas visuales o extracción de información de capturas y documentos escaneados.
- Razonamiento matemático y resolución de problemas: el rendimiento validado en GSM8K (0,950) lo hace utilizable en asistentes educativos o herramientas de cálculo paso a paso.
- Despliegue en producción con memoria contenida: el checkpoint ocupa 20,6 GB y el autor reporta un pico de 150,8 GiB de memoria del servidor en B200 (incluyendo reservas del motor), lo que permite planificar el dimensionamiento de instancias en cloud.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de NVFP4 frente a bf16 en tareas de razonamiento, dado que el autor publica la comparación directa en GSM8K-100.
- Integración en pipelines de CI/CD para validación de modelos: el comando `vllm serve` documentado permite levantar el modelo de forma reproducible y ejecutar baterías de pruebas automatizadas.

## Benchmarks y rendimiento

| Test | Esta variante | Referencia bf16 | Veredicto |
|---|---:|---:|---|
| GSM8K (100 preguntas) | 0,950 (n=100) | 0,940 (n=100) | coincide |

| GPU | Motor | Escritura (tok/s) | Lectura de prompt 4K (tok/s) | Primer token (ms) | Memoria pico (GiB) |
|---|---|---:|---:|---:|---:|
| NVIDIA B200 | vLLM 0.33.0 | 195 | 10.781 | 378 | 150,8 |

Las mediciones de velocidad se realizaron en un solo stream, con un prompt de aproximadamente 4K tokens y 512 tokens generados de forma greedy. La memoria pico corresponde a la memoria que retenía el servidor, incluyendo reservas del motor, por lo que no equivale al tamaño del modelo. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 20,6 GB; el autor reporta un pico de 150,8 GiB de memoria del servidor en B200 con vLLM 0.33.0, incluyendo reservas del motor.
- GPU recomendadas: NVIDIA B200 (probada). El formato NVFP4 está pensado para GPUs NVIDIA Blackwell; no se documenta compatibilidad con otras generaciones.
- GPU de consumo: no disponible; no se indica que quepa en GPUs consumer. El autor remite a variantes MLX (3, 4 y 8 bits) para Mac y a una variante GGUF para otros entornos.
- Opciones de despliegue: vLLM 0.33.0 (probado) y TensorRT-LLM (formato compatible, no probado por el autor). Para Mac, variantes MLX; para otros entornos, GGUF.
- Latencia y throughput: 195 tok/s de escritura, 10.781 tok/s de lectura de prompt de 4K, 378 ms hasta el primer token en B200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-NVFP4 | 27,78 B | no disponible | NVFP4 (4 bits) | apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | bf16 | apache-2.0 | Hugging Face |
| nace-ai/Qwen3.8-27B-GGUF | 27,78 B | no disponible | GGUF | apache-2.0 | Hugging Face |
| nace-ai/Qwen3.8-27B-MLX-4bit | 27,78 B | no disponible | MLX 4 bits | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, salvo el 0,940 en GSM8K-100 del modelo base bf16.

## Limitaciones y advertencias

- El autor advierte que vLLM emite un aviso sobre la escala global NVFP4, que difiere entre capas paralelas (q/k/v), con posible reducción de precisión; la medición en GSM8K-100 no muestra pérdida práctica, pero el aviso persiste.
- La cuantización a 4 bits puede degradar tareas distintas de GSM8K no evaluadas por el autor; no hay datos de MMLU, HumanEval ni otras pruebas.
- El formato NVFP4 está orientado a GPUs NVIDIA Blackwell; no se documenta su funcionamiento en otras arquitecturas.
- TensorRT-LLM no ha sido probado por el autor, aunque el formato es compatible.
- Sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas: no disponibles en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-10; se trata de una publicación reciente sin validación comunitaria.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante MLX 3 bits: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-3bit
- Variante MLX 4 bits: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit
- Variante MLX 8 bits: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-8bit
- Variante GGUF: https://huggingface.co/nace-ai/Qwen3.8-27B-GGUF
