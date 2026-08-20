# RedHatAI/starcoder2-3b-FP8

## Resumen

RedHatAI/starcoder2-3b-FP8 es una versión cuantizada en FP8 del modelo StarCoder2-3B, desarrollado originalmente por BigCode y cuantizado por Neural Magic. El modelo base StarCoder2-3B es un transformer de 3.181 millones de parámetros especializado en generación de código, entrenado sobre más de 600 lenguajes de programación procedentes de The Stack v2, junto con texto natural de Wikipedia, Arxiv y GitHub issues. Esta variante FP8 reduce el tamaño del modelo y los requisitos de VRAM aproximadamente un 50 % respecto al modelo original en FP16, manteniendo un rendimiento casi idéntico en benchmarks de generación de código.

La cuantización se aplica tanto a pesos como a activaciones de los operadores lineales dentro de los bloques transformer, mediante cuantización simétrica per-tensor y calibración con 512 secuencias del dataset UltraChat. El modelo está preparado para ser desplegado con vLLM >= 0.5.2, lo que lo convierte en una opción atractiva para entornos de producción donde el coste de inferencia y el uso de memoria son críticos. Su ventana de contexto es de 16.384 tokens, con sliding window attention de 4.096 tokens, característica heredada de la arquitectura StarCoder2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (StarCoder2-3B) con Grouped Query Attention |
| Parametros totales | 3.181.366.272 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (sliding window attention de 4.096 tokens) |
| Tipos de cuantizacion | FP8 (pesos y activaciones) |
| Idiomas soportados | Ingles (segun la model card, uso previsto solo en ingles) |
| Licencia | bigcode-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base StarCoder2-3B es un transformer causal con Grouped Query Attention (GQA) y una ventana de contexto de 16.384 tokens, combinada con sliding window attention de 4.096 tokens para optimizar el uso de memoria durante el entrenamiento. Se entrenó sobre The Stack v2, un dataset que abarca más de 600 lenguajes de programación, complementado con texto natural de Wikipedia, Arxiv y GitHub issues. El modelo original no incorpora RLHF ni DPO; se trata de un modelo preentrenado en código sin ajuste fino por refuerzo.

La versión FP8 se obtuvo mediante cuantización de pesos y activaciones a FP8 con cuantización simétrica per-tensor, aplicada únicamente a los operadores lineales de los bloques transformer (se excluye el lm_head). La calibración se realizó con 512 secuencias del dataset UltraChat utilizando LLM Compressor (anteriormente AutoFP8), con una longitud máxima de secuencia de 4.096 tokens durante la calibración. El resultado es un modelo que ocupa aproximadamente la mitad de memoria que el original en FP16, con una degradación de rendimiento mínima en benchmarks de código.

## Capacidades

- Generación de código en más de 600 lenguajes de programación, incluyendo Python, Java, C++, JavaScript, TypeScript, Go, Rust, entre otros.
- Completado de código en línea y generación de funciones completas a partir de descripciones o fragmentos parciales.
- Razonamiento de código y resolución de problemas de programación de tipo competición.
- Capacidad de manejar contexto largo (16.384 tokens) para trabajar con ficheros fuente extensos o proyectos completos.
- Soporte de entrada y salida de texto en inglés; la model card desaconseja su uso en otros idiomas.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso específico.
- No incluye capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Autocompletado de código en editores y IDEs: el modelo puede integrarse en extensiones de VS Code o JetBrains para sugerir código mientras el desarrollador escribe, gracias a su ventana de contexto de 16.384 tokens que permite considerar archivos completos.
- Generación de código en pipelines de CI/CD: puede usarse para generar pruebas unitarias, plantillas de código o documentación técnica a partir de descripciones de funciones, con el formato FP8 que reduce el coste de despliegue en clústeres de GPU.
- Asistente de programación en tiempo real: despliegue con vLLM para servir un chat de código con baja latencia, útil en entornos de desarrollo colaborativo o en plataformas de tutoría de programación.
- Refactorización de código legado: el modelo puede analizar código fuente y proponer cambios para modernizar o limpiar implementaciones, aprovechando su conocimiento de múltiples lenguajes.
- Generación de documentación técnica: a partir de código fuente, puede generar comentarios, docstrings o explicaciones de funciones, útil para equipos que mantienen librerías de software.
- Búsqueda semántica de código: combinado con un sistema de embeddings, puede utilizarse para indexar repositorios y permitir búsquedas por descripción natural de funcionalidad.

## Benchmarks y rendimiento

Según la model card, el modelo se evaluó en el benchmark HumanEval+ con el fork de Neural Magic de EvalPlus. Los resultados publicados son:

| Benchmark | starcoder2-3b-FP8 | starcoder2-3b (original) |
|---|---|---|
| HumanEval+ | 35.53 | 35.35 |

La degradación de rendimiento respecto al modelo original es mínima (0.18 puntos porcentuales). En la model card se menciona, aunque comentado, una puntuación media de 73.19 en el OpenLLM benchmark (versión 1) frente a 73.48 del modelo original, pero estos datos no se presentan como oficiales en la ficha publicada.

## Requisitos de hardware

- VRAM estimada: el modelo FP8 ocupa aproximadamente 3.2 GB en memoria (3.181 millones de parámetros × 1 byte por parámetro FP8). Con overhead de activaciones y KV cache, se recomienda al menos 6-8 GB de VRAM para inferencia cómoda.
- GPU compatibles: cabe en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB) y en GPUs de datacenter como A10, A100, L4 o H100.
- Despliegue: vLLM >= 0.5.2 es el backend recomendado por la model card. También es compatible con Hugging Face transformers y puede usarse con TGI (Text Generation Inference) y llama.cpp para CPU o GPU.
- Latencia: en una GPU como A10 o RTX 4090, la generación de tokens típica para un modelo de 3B FP8 suele estar entre 40-100 tokens/segundo con vLLM, dependiendo del batch size y del hardware.
- Throughput: al ser un modelo pequeño y cuantizado, permite servir múltiples peticiones concurrentes en una sola GPU, lo que lo hace adecuado para entornos de producción con demanda moderada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Cuantizacion | HumanEval+ | Licencia |
|---|---|---|---|---|---|
| RedHatAI/starcoder2-3b-FP8 | 3.18B | 16.384 | FP8 | 35.53 | bigcode-openrail-m |
| bigcode/starcoder2-3b | 3.18B | 16.384 | FP16 | 35.35 | bigcode-openrail-m |
| bigcode/starcoder2-7b | 7.0B | 16.384 | FP16 | no disponible | bigcode-openrail-m |
| bigcode/starcoder2-15b | 15.0B | 16.384 | FP16 | no disponible | bigcode-openrail-m |

El modelo FP8 es prácticamente idéntico en rendimiento al original de 3B, con la ventaja de ocupar la mitad de memoria. Frente a los modelos StarCoder2 de 7B y 15B, esta versión de 3B es más ligera y rápida, adecuada para despliegues en hardware limitado, aunque con menor capacidad de razonamiento complejo.

## Limitaciones y advertencias

- La model card especifica que el uso previsto es en inglés; usos en otros idiomas están fuera del alcance y pueden producir resultados degradados o incorrectos.
- El modelo no ha sido alineado con preferencias humanas (no RLHF ni DPO), por lo que puede generar código con vulnerabilidades de seguridad, código ineficiente o con errores de compilación.
- Riesgo de alucinación: como cualquier LLM, puede inventar APIs, funciones o librerías que no existen, lo que requiere revisión humana en entornos de producción.
- La licencia bigcode-openrail-m es una licencia de código abierto con restricciones específicas para uso comercial y militar; se recomienda revisar los términos completos en el enlace de la licencia antes de su uso en productos comerciales.
- La cuantización FP8 puede provocar una ligera degradación en tareas de razonamiento matemático complejo o generación de código muy preciso, aunque el benchmark HumanEval+ muestra una pérdida mínima.
- El modelo no soporta tool calling, function calling ni uso de agentes de forma nativa; para usos de agentes es necesario integrarlo con frameworks externos.
- No se han publicado resultados de benchmarks más allá de HumanEval+ en la model card; los datos de OpenLLM aparecen comentados y no se consideran oficiales.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/RedHatAI/starcoder2-3b-FP8
- Modelo original StarCoder2-3B: https://huggingface.co/bigcode/starcoder2-3b
- Repositorio de StarCoder2 (BigCode): https://github.com/bigcode-project/starcoder2
- Licencia bigcode-openrail-m: https://huggingface.co/spaces/bigcode/bigcode-model-license-agreement
- Repositorio de LLM Compressor (cuantización): https://github.com/vllm-project/llm-compressor
- Repositorio de AutoFP8: https://github.com/neuralmagic/AutoFP8
- Benchmark HumanEval+ (EvalPlus): https://github.com/openai/human-eval
- Fork de Neural Magic de EvalPlus: https://github.com/neuralmagic/evalplus
