# qtum/Qwen3-32B-FP8

## Resumen

Qwen3-32B-FP8 es una cuantización en punto flotante de 8 bits (FP8, esquema W8A8 dinámico) del modelo denso Qwen3-32B, desarrollada por el equipo de qtum mediante la herramienta llm-compressor. El checkpoint se publica en formato compressed-tensors, lo que permite su uso directo con motores de inferencia como vLLM y SGLang sin necesidad de flags adicionales, ya que el esquema de cuantización queda declarado en el archivo `config.json`.

Esta versión cuantizada reduce aproximadamente a la mitad el tamaño de los pesos en bf16 (el repositorio ocupa 34,3 GB frente a los ~64 GB del original), manteniendo una calidad cercana a la del modelo base. Está pensada como un reemplazo directo del Qwen3-32B en despliegues de producción donde la memoria de GPU y el rendimiento son críticos. El modelo hereda las capacidades del Qwen3-32B original, incluyendo modos de razonamiento (thinking y non-thinking), soporte para tool calling y una ventana de contexto de 40 000 tokens, aunque la model card solo declara los idiomas inglés y chino.

La licencia Apache 2.0 del modelo base se mantiene intacta, lo que facilita su uso comercial y su integración en sistemas propietarios sin restricciones adicionales más allá de las del propio Qwen3-32B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-32B) con cuantización FP8 W8A8 dinámica |
| Parametros totales | 32 762 123 264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40 000 tokens (heredada del modelo base Qwen3-32B) |
| Tipos de cuantizacion | FP8 (W8A8 dinámico) en formato compressed-tensors |
| Idiomas soportados | Inglés, chino (según model card; el modelo base soporta más idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-32B es un transformer denso de 32 800 millones de parámetros (32 762 123 264 en este checkpoint cuantizado) entrenado por Alibaba Qwen. No utiliza arquitectura MoE; todos los parámetros se activan en cada forward. El modelo original incorpora un mecanismo de "thinking mode" que permite alternar entre razonamiento profundo y respuestas directas, además de soporte para tool calling y agentes.

La cuantización FP8 W8A8 dinámica aplicada por qtum convierte los pesos a punto flotante de 8 bits y utiliza escalas dinámicas para las activaciones, un esquema nativo en GPUs Hopper y Blackwell. El proceso se realizó con llm-compressor, que genera un checkpoint en formato compressed-tensors. No se ha realizado ningún entrenamiento adicional; los pesos solo se han cuantizado, por lo que el comportamiento y las capacidades del modelo original se preservan en gran medida. El método es considerado "near lossless" según la documentación del autor, aunque no se aportan métricas cuantitativas en la model card.

## Capacidades

- Generación de texto y conversación multironda con formato ChatML (`<|im_start|>`).
- Razonamiento avanzado: soporta modo "thinking" para tareas complejas de matemáticas, lógica y código, y modo "non-thinking" para respuestas rápidas.
- Generación de código y asistencia en programación, heredada del Qwen3-32B original.
- Tool calling y function calling: puede invocar herramientas externas cuando se configura adecuadamente.
- Capacidades multilingües: la model card declara inglés y chino, aunque el modelo base soporta más idiomas (no verificado en esta versión).
- Compatible con motores que leen compressed-tensors (vLLM, SGLang), lo que facilita su integración en pipelines de inferencia existentes.

## Casos de uso

- Asistente de atención al cliente multilingüe: con 40 000 tokens de contexto, puede gestionar conversaciones largas con historial completo, resolviendo incidencias en inglés y chino con respuestas coherentes y matizadas.
- Generación de código en entornos de producción: gracias al soporte de tool calling y al modo thinking, puede utilizarse para autocompletar, revisar o generar fragmentos de código en pipelines de CI/CD, integrado vía vLLM.
- Análisis de documentos extensos: la ventana de 40 000 tokens permite procesar informes, contratos o artículos largos de una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Razonamiento matemático y lógico: el modo thinking es adecuado para resolver problemas de álgebra, cálculo o demostraciones, útil en plataformas educativas o de investigación.
- Agente autónomo con herramientas: al soportar function calling, puede actuar como agente que consulta APIs, bases de datos o servicios externos para completar tareas multi-paso.
- Despliegue de bajo consumo en GPU de 40 GB o más: al ocupar ~34,5 GB en FP8, cabe en GPUs como A100 40GB o RTX 6000 Ada, reduciendo costes frente al modelo en bf16 que requiere ~64 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El autor indica que el modelo es "near lossless" respecto al base, pero no aporta cifras concretas. Se recomienda consultar los benchmarks del Qwen3-32B original (MMLU, HumanEval, GSM8K, etc.) como referencia aproximada, teniendo en cuenta que la cuantización FP8 suele introducir una degradación mínima.

## Requisitos de hardware

- VRAM estimada: ~34,5 GB para los pesos en FP8, más overhead de activaciones y KV cache. Se recomienda al menos 40 GB de VRAM para inferencia cómoda con contexto moderado.
- GPUs compatibles: arquitecturas Hopper (H100, H200) y Blackwell (B200) nativas para FP8; también funciona en Ampere (A100) y Ada Lovelace (RTX 4090, RTX 6000 Ada) con soporte FP8, aunque con menor eficiencia.
- No cabe en GPUs de consumo de 24 GB (como RTX 4090) sin cuantización adicional o offloading.
- Opciones de despliegue: vLLM y SGLang (lectura directa de compressed-tensors), también puede usarse con llama.cpp si se convierte a GGUF, aunque no es el formato nativo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la configuración de vLLM (por ejemplo, tensor parallelism).

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-32B (original) | 32,8B | bf16 | 40K | Apache 2.0 | Modelo base sin cuantizar, ~64 GB de pesos |
| Qwen3-32B-FP8 (oficial de Qwen) | 32,8B | FP8 (compressed-tensors) | 40K | Apache 2.0 | Cuantización oficial de Alibaba, misma técnica |
| qtum/Qwen3-32B-FP8 | 32,8B | FP8 (compressed-tensors) | 40K | Apache 2.0 | Cuantización de terceros con llm-compressor, objetivo: despliegue eficiente |

No se dispone de datos de rendimiento comparativos entre estas versiones en la información recopilada. La principal diferencia entre la cuantización de qtum y la oficial de Qwen radica en la herramienta utilizada (llm-compressor vs. otras) y en el proceso de validación, pero ambas prometen un comportamiento cercano al original.

## Limitaciones y advertencias

- La cuantización FP8, aunque "near lossless", puede introducir pequeñas degradaciones en tareas de alta precisión numérica o en generación de código muy complejo; se recomienda validar en el caso de uso concreto.
- La model card solo declara inglés y chino; otros idiomas del modelo base podrían no estar completamente soportados o tener menor calidad en esta versión.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; el modo thinking puede producir razonamientos aparentemente sólidos pero incorrectos.
- El contexto de 40 000 tokens es amplio pero no ilimitado; para documentos muy largos se requiere truncamiento o estrategias de ventana deslizante.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con las obligaciones de atribución del modelo base Qwen3-32B (consultar los términos completos de Alibaba).
- No se han publicado resultados de benchmarks propios; la afirmación de "near lossless" no está respaldada por métricas en la model card.

## Enlaces

- Repositorio HuggingFace: [qtum/Qwen3-32B-FP8](https://huggingface.co/qtum/Qwen3-32B-FP8)
- Modelo base: [Qwen/Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B)
- Cuantización oficial de Qwen: [Qwen/Qwen3-32B-FP8](https://huggingface.co/Qwen/Qwen3-32B-FP8)
- Cuantización de PyTorch: [pytorch/Qwen3-32B-FP8](https://huggingface.co/pytorch/Qwen3-32B-FP8)
- Artículo de dev.co sobre Qwen3-32B-FP8: [dev.co/ai/llms/qwen3-32b-fp8](https://dev.co/ai/llms/qwen3-32b-fp8)
- Ficha en bytecompute.ai: [bytecompute.ai/model/bytecompute/qwen3-32b](https://bytecompute.ai/model/bytecompute/qwen3-32b)
- Entrada en LLM Explorer: [llm-explorer.com/model/Qwen%2FQwen3-32B-FP8](https://llm-explorer.com/model/Qwen%2FQwen3-32B-FP8,77xNhLeAVbZm9rUzEJGfOJ)
- Herramienta de cuantización: [llm-compressor](https://github.com/vllm-project/llm-compressor)
