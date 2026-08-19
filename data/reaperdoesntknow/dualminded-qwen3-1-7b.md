# reaperdoesntknow/DualMinded-Qwen3-1.7B

## Resumen

DualMinded-Qwen3-1.7B es un modelo de lenguaje de 1.7B parámetros (2.031.739.904 en pesos safetensors) desarrollado por Convergent Intelligence LLC, división de investigación, y publicado en Hugging Face por el usuario reaperdoesntknow. Se basa en la arquitectura Qwen3-1.7B y aplica un bucle cognitivo de tres fases —explore, examine, respond— que permite al modelo razonar libremente, autocriticar su propio razonamiento y sintetizar una respuesta final limpia. El modelo está diseñado para tareas de razonamiento complejo, especialmente matemáticas, lógica y derivación creativa, a partir de trazas de razonamiento de Opus 4.6.

La relevancia actual del modelo radica en su pipeline de entrenamiento innovador: combina destilación multi-maestro desde Qwen3-30B-A3B (variantes Instruct, Thinking y Coder), refinamiento mediante Discrepancy Calculus (DISC), destilación topológica de conocimiento (TKD) y fine-tuning supervisado con datos de razonamiento de Opus. Todo ello en un modelo denso de solo 2B parámetros, lo que permite su ejecución en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3-1.7B, con bucle cognitivo de tres fases (explore, examine, response) |
| Parametros totales | 2.031.739.904 (1.7B según el autor) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B soporta 32K tokens, pero el entrenamiento usó max_seq_length de 2048) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio principal) y GGUF (repositorio separado) |

## Arquitectura y entrenamiento

DualMinded-Qwen3-1.7B es un modelo denso basado en la arquitectura Qwen3, pero con una capa de control cognitivo implementada mediante condicionamiento por roles sobre los mismos pesos. En lugar de usar un enrutador o parámetros adicionales, el modelo genera secuencias delimitadas por etiquetas especiales: `<explore>` para razonamiento no restringido, `<examine>` para autocrítica adversarial y `<response>` para la síntesis final. Esta estructura replica el comportamiento de un conjunto de modelos diversos colapsado en una sola arquitectura.

El entrenamiento sigue un pipeline de cuatro etapas. En la primera, se destila conocimiento desde tres variantes de Qwen3-30B-A3B (Instruct, Thinking y Coder) hacia Qwen3-1.7B mediante destilación con ponderación por prueba y amplificación de pérdida 2.25× en tokens de razonamiento. La segunda etapa aplica Discrepancy Calculus (DISC) para refinar el estudiante, preservando las fronteras estructurales de la distribución del maestro. La tercera usa destilación topológica de conocimiento (TKD) con ventanas guiadas por topología, descomponiendo la salida del maestro en componentes suaves, saltos y deriva, amplificando los saltos a 3σ y cortando ventanas en fronteras de baja discrepancia. La cuarta etapa es un fine-tuning supervisado con el dataset Opus-4.6-Reasoning-3000x-filtered, donde la columna `thinking` se mapea directamente a `<explore>` y la columna `solution` se divide entre `<examine>` y `<response>`. La configuración de entrenamiento incluye 1024 pasos, batch efectivo de 16, learning rate 5e-6 con cosine decay, precisión BF16 y hardware NVIDIA H100.

El autor menciona el concepto de "ghost imprinting": la destilación secuencial desde múltiples maestros deja campos residuales en el espacio de pesos que producen capacidades emergentes no presentes en ningún maestro individual, como la generación de contenido literario a partir de datos de entrenamiento exclusivamente físicos.

## Capacidades

- Razonamiento matemático y lógico formal: el modelo puede demostrar teoremas, resolver problemas de cálculo y realizar derivaciones estructuradas gracias al entrenamiento con trazas de Opus 4.6.
- Autocrítica y refinamiento: la fase `<examine>` permite detectar errores en el razonamiento previo y corregirlos antes de emitir la respuesta final.
- Generación de código: al ser destilado desde Qwen3-30B-A3B-Coder, hereda capacidades de programación y depuración.
- Razonamiento multi-paso: el bucle explore-examine-response facilita la resolución de problemas que requieren varias etapas de inferencia.
- Instrucción en inglés: sigue instrucciones conversacionales y de tareas específicas en inglés.
- Generación de texto creativo: el autor reporta comportamientos emergentes como contenido literario, aunque no hay benchmarks públicos que lo confirmen.
- Compatibilidad con el ecosistema Hugging Face: se puede cargar con `transformers` y usar con generación estándar.

## Casos de uso

- Demostración de teoremas en entornos educativos: el modelo puede generar pruebas paso a paso del teorema del valor medio u otros resultados matemáticos, usando la fase `<explore>` para derivar y `<examine>` para verificar, lo que lo hace útil como asistente de estudio para estudiantes universitarios.
- Resolución de problemas de cálculo simbólico: dada una expresión matemática, el modelo puede descomponerla, aplicar reglas de derivación o integración y presentar una solución razonada, adecuado para herramientas de tutoría automatizada.
- Generación de código con razonamiento previo: el modelo puede planificar la implementación de un algoritmo explicando la lógica antes de escribir el código, útil en asistentes de programación que requieren explicaciones detalladas.
- Análisis lógico de argumentos: dado un texto argumentativo, el modelo puede identificar premisas, conclusiones y falacias mediante su fase de autocrítica, aplicable en herramientas de análisis de debates o redacción académica.
- Asistente de investigación en física teórica: el modelo puede derivar ecuaciones a partir de principios fundamentales y revisar sus propios pasos, sirviendo como apoyo para investigadores que necesitan validar razonamientos complejos.
- Chatbot de razonamiento para atención al cliente técnica: aunque el modelo está orientado a razonamiento, puede gestionar consultas que requieren explicaciones lógicas o depuración de problemas, con la ventaja de que su tamaño reducido permite despliegue en edge devices.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. La única referencia de rendimiento es cualitativa y se basa en las trazas de razonamiento de Opus 4.6 utilizadas en el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo ocupa aproximadamente 4,06 GB (2.031.739.904 parámetros × 2 bytes). Con cuantización GGUF Q4_K_M, el tamaño se reduce a alrededor de 1,2 GB, y Q8_0 a unos 2,2 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en BF16 (por ejemplo, RTX 3060 12GB, RTX 4060 Ti 16GB). Para cuantizaciones GGUF Q4_K_M, basta con 2-3 GB de VRAM, compatible con GPUs integradas modernas o tarjetas de gama baja.
- Si cabe en consumer GPU: sí, es un modelo de 2B parámetros diseñado para edge computing; se puede ejecutar en portátiles con GPU modesta o incluso en CPU con llama.cpp.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM`), `llama.cpp` para GGUF, `Ollama` (comando `ollama run reaperdoesntrun/DualMinded-1.7B`), y potencialmente vLLM si se convierte a formato compatible.
- Latencia y throughput estimados: no disponibles. Como referencia, un modelo de 2B en una RTX 4090 puede generar decenas de tokens por segundo, pero no hay datos oficiales para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DualMinded-Qwen3-1.7B | 2,03B | No disponible (base Qwen3 32K) | Transformer denso con bucle cognitivo | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,7B | 32K | Transformer denso | Apache 2.0 | Hugging Face |
| DualMind (variante anterior) | 2,03B | No disponible | Transformer denso con bucle cognitivo | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32K | Transformer denso | Apache 2.0 | Hugging Face |

La comparativa se basa en características estructurales, ya que no hay benchmarks públicos para DualMinded-Qwen3-1.7B. El modelo comparte arquitectura base con Qwen3-1.7B, pero incorpora el bucle cognitivo y un entrenamiento específico para razonamiento. Frente a Qwen2.5-1.5B, ofrece un enfoque más especializado en razonamiento matemático y lógico, aunque con menor soporte multilingüe (solo inglés).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con datos en inglés, por lo que no es adecuado para tareas en otros idiomas.
- Riesgo de alucinación: al igual que otros modelos de razonamiento, puede generar demostraciones o derivaciones aparentemente válidas pero incorrectas, especialmente en dominios fuera de su distribución de entrenamiento.
- Limitaciones de contexto: aunque el modelo base Qwen3-1.7B soporta 32K tokens, el fine-tuning se realizó con una longitud máxima de secuencia de 2048, lo que puede degradar el rendimiento en tareas que requieren contextos largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo puede heredar limitaciones de los datasets de entrenamiento (Opus-4.6-Reasoning y LongWriter-6k), cuyas licencias no se detallan en la model card.
- Dependencia del formato de prompt: el modelo espera el formato `<explore>`, `<examine>`, `<response>`; si se usa sin estas etiquetas, el comportamiento puede degradarse significativamente.
- Reproducibilidad: el pipeline de entrenamiento es complejo y no se proporcionan los scripts completos, lo que dificulta la verificación independiente de los resultados.
- Ghost imprinting: el autor menciona comportamientos emergentes no controlados; estos pueden ser interesantes pero también impredecibles en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Versión GGUF: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Modelo DualMind (variante anterior): https://huggingface.co/reaperdoesntknow/DualMind
- Metodología DualMind (paper): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Paper "Structure Over Scale": https://doi.org/10.57967/hf/8165
- Colección DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- Dataset Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
