# luxuansang/Qwopus3.5-9B-Coder-GGUF

## Resumen

Qwopus3.5-9B-Coder es un modelo de lenguaje denso de aproximadamente 8.950 millones de parámetros, publicado por luxuansang como una versión comunitaria experimental. Se construye sobre el modelo base Qwopus3.5-9B-v3.5 de Jackrong, que a su vez deriva de la familia Qwen3.5. El modelo está especializado en codificación agéntica, llamada a herramientas (tool calling) y razonamiento lógico estructurado, y se distribuye en formato GGUF para su uso con llama.cpp y backends compatibles. Incluye además soporte multimodal de visión mediante un archivo `mmproj.gguf` adicional.

Su relevancia radica en que ofrece capacidades de agente y razonamiento en un tamaño que puede ejecutarse en hardware de gama media: según la model card, funciona a 8 bits en dispositivos con 16 GB de RAM, como portátiles estándar o un Mac mini. El fine-tuning combina la técnica de Trace Inversion con trazas de agentes de alta calidad, lo que busca mejorar la coherencia lógica y la precisión en el uso de herramientas. No obstante, el autor advierte que es una versión experimental sin evaluación general exhaustiva y que puede presentar degradación de capacidades en tareas no relacionadas con la programación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (tipos no especificados en la informacion disponible) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

Qwopus3.5-9B-Coder es un transformer denso de 9B parámetros, sin arquitectura de mezcla de expertos (MoE). El proceso de fine-tuning se basa en el modelo base Qwopus3.5-9B-v3.5, que ya posee capacidades generales potentes, y lo optimiza específicamente para tareas de agente, tool calling y razonamiento lógico. Según la model card, el entrenamiento integra la técnica de Trace Inversion (inversión de trazas) con conjuntos de datos de trazas de agentes, como `lambda/hermes-agent-reasoning-traces`, `Jackrong/Claude-opus-4.7-TraceInversion-5000x` y `Jackrong/Claude-opus-4.6-TraceInversion-9000x`. No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas como RLHF o DPO.

La arquitectura soporta visión multimodal mediante un archivo `mmproj.gguf` que debe colocarse junto al archivo principal `.gguf` para habilitar las capacidades visuales. El modelo está diseñado para funcionar con backends como llama.cpp, LM Studio y MLX, y es compatible con text-generation-inference.

## Capacidades

- Generación de código, depuración y manejo de tareas a nivel de repositorio.
- Razonamiento lógico estructurado con cadena de pensamiento (chain-of-thought), reduciendo el pensamiento repetitivo.
- Llamada a herramientas (tool calling) estable y precisa para comandos de terminal, operaciones con archivos y navegador.
- Capacidades de agente: ejecución de tareas multi-paso con planificación y uso de herramientas.
- Soporte multimodal de visión (requiere el archivo `mmproj.gguf`).
- Multilingüe: inglés, chino, español, ruso y japonés.
- Conversacional: apto para diálogos multi-turno con contexto.

## Casos de uso

- Asistente de programación agéntico: el modelo puede recibir una tarea de codificación compleja, planificar los pasos, invocar herramientas de terminal y archivos, y ejecutar el código de forma autónoma, gracias a su fine-tuning específico para agentes.
- Automatización de tareas de desarrollo: integración en flujos de trabajo de CI/CD para generar, revisar y corregir código, utilizando su capacidad de tool calling para interactuar con sistemas de control de versiones y entornos de prueba.
- Depuración de código legacy: su entrenamiento en trazas de agentes le permite analizar repositorios existentes, identificar errores y proponer parches, con razonamiento lógico estructurado.
- Soporte técnico automatizado: puede gestionar conversaciones de soporte que requieran consultar documentación, ejecutar comandos de diagnóstico o acceder a APIs, gracias a su soporte de tool calling y su naturaleza conversacional.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar documentación clara y detallada, aprovechando su capacidad multilingüe para adaptarse al idioma del proyecto.
- Prototipado rápido de agentes de razonamiento: investigadores y desarrolladores pueden usar el modelo como base para experimentar con arquitecturas de agentes que combinan visión, tool calling y razonamiento, gracias a su licencia Apache 2.0 y su formato GGUF fácil de desplegar localmente.

## Benchmarks y rendimiento

La model card reporta un único resultado de benchmark, obtenido con el framework de evaluación local `benchlocal` en hardware Apple Silicon (Mac) con backends LM Studio / MLX / GGUF. El resultado es el siguiente:

| Modelo | Test Set | Puntuación compresiva |
|---|---|---|
| Qwopus3.5-9B-Coder | HermesAgent-20 | 85 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Tampoco se ofrecen comparaciones con otros modelos en el mismo test. Por tanto, no es posible evaluar su rendimiento relativo en tareas generales o de razonamiento puro.

## Requisitos de hardware

- Según la model card, el modelo puede ejecutarse a 8 bits en dispositivos con 16 GB de RAM, como portátiles estándar o un Mac mini.
- Estimación de VRAM/RAM: un modelo de ~9B parámetros en cuantización Q8 requiere aproximadamente 9-10 GB de memoria; en cuantizaciones más agresivas (Q4_K_M) podría ocupar entre 5 y 6 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para cuantizaciones bajas; para 8 bits se recomienda 12 GB o más (RTX 4070, RTX 4080, A100, etc.).
- En Apple Silicon, funciona con MLX y LM Studio, como se indica en la model card.
- Opciones de despliegue: llama.cpp, LM Studio, MLX, vLLM (con soporte GGUF), text-generation-inference (TGI) y Ollama (si se convierte el GGUF a un formato compatible).
- Latencia y throughput: no se proporcionan datos oficiales. En hardware Apple Silicon, la model card menciona que se pueden observar velocidades de inferencia reales con diferentes formatos, pero no se incluyen cifras concretas.

## Comparativa con modelos similares

La siguiente tabla compara Qwopus3.5-9B-Coder con otros modelos de tamaño similar orientados a código y agentes. Los datos de los modelos alternativos son públicos y conocidos; los de Qwopus se limitan a lo disponible en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder | ~8,95B | No disponible | Apache 2.0 | GGUF | Agente, tool calling, código |
| Qwen2.5-Coder-7B | 7,6B | 128K | Apache 2.0 | Safetensors, GGUF | Código, razonamiento |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2,4B activos) | 16K | MIT | Safetensors, GGUF | Código, matemáticas |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community License | Safetensors, GGUF | General, multilingüe |

No se dispone de resultados de benchmarks comparativos entre Qwopus3.5-9B-Coder y estos modelos en la información proporcionada. La comparativa es estructural y no de rendimiento.

## Limitaciones y advertencias

- La model card advierte explícitamente de que es una versión comunitaria experimental, publicada solo para investigación y exploración.
- El fine-tuning vertical para programación y agentes puede provocar "Capability Decay": degradación de capacidades en tareas generales o no relacionadas con la programación.
- No se ha realizado una evaluación general exhaustiva; los únicos datos de rendimiento disponibles son del test HermesAgent-20.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o generación de código.
- La longitud de contexto no está especificada, por lo que no se puede garantizar un comportamiento adecuado en conversaciones o documentos muy largos.
- El soporte de visión requiere el archivo `mmproj.gguf` adicional; sin él, las capacidades multimodales no están disponibles.
- Aunque la licencia Apache 2.0 permite uso comercial, al ser una versión experimental sin garantías, se recomienda validar su comportamiento en entornos de producción antes de su adopción.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/luxuansang/Qwopus3.5-9B-Coder-GGUF
- Modelo base (Jackrong/Qwopus3.5-9B-v3.5): https://huggingface.co/Jackrong/Qwopus3.5-9B-v3.5
- Repositorio GGUF del autor original (Jackrong/Qwopus3.5-9B-coder-GGUF): https://huggingface.co/Jackrong/Qwopus3.5-9B-coder-GGUF
- Framework de evaluación benchlocal: https://github.com/stevibe/benchlocal
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
