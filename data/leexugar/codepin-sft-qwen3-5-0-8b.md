# LeeXugar/CodePin-SFT-Qwen3.5-0.8B

## Resumen

CodePin-SFT-Qwen3.5-0.8B es un modelo de lenguaje especializado en **localización de código y búsqueda en repositorios** (code localization y repository search), desarrollado por LeeXugar como un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-0.8B de Alibaba Cloud. El modelo aprende a generar trayectorias de texto puro que simulan el uso de herramientas de búsqueda y lectura de archivos, reduciendo progresivamente el espacio de búsqueda hasta identificar los archivos, clases y funciones relevantes para una tarea dada.

El finetune se realizó sobre el dataset LeeXugar/CodePin-SFT-Qwen3.5-35B-A3B, que contiene trayectorias completas de agentes (con llamadas a herramientas y resultados) generadas por un modelo profesor de 35B parámetros con arquitectura MoE. El modelo resultante tiene 1.006.672.704 parámetros (debido a que los embeddings y la cabeza de salida no están atados), un contexto máximo de 8.192 tokens y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Su relevancia radica en abordar un problema específico de la ingeniería de software asistida por IA: la navegación eficiente en repositorios grandes, donde los modelos generalistas suelen fallar al no poder gestionar el contexto completo del código. Al entrenar sobre trayectorias de herramientas, el modelo aprende a planificar búsquedas, interpretar resultados parciales y emitir conclusiones con evidencia, una capacidad que puede integrarse en pipelines de desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, variante de solo texto) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento; el modelo base Qwen3.5-0.8B soporta hasta 262.144 tokens según documentación de Qwen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (entrenado solo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de parámetros completos sobre Qwen3.5-0.8B, un transformer de 0.8B parámetros de la familia Qwen3.5. Aunque el modelo base es multimodal, este finetune exporta únicamente la variante de texto (`Qwen3_5ForCausalLM`). La arquitectura mantiene la estructura estándar de Qwen3.5 con atención de escala cuadrática, pero el entrenamiento se limitó a secuencias de hasta 8.192 tokens.

El entrenamiento se realizó con FSDP (Fully Sharded Data Parallel) en 4 GPUs Tesla V100-PCIE-32GB, con precisión FP16 para parámetros, reducciones y buffers. Se usaron 710 pasos de optimización con un batch global de 8, micro-batch de 1 por GPU, y un total de 20.487.244 tokens efectivos de entrenamiento. El optimizador fue AdamW con learning rate pico de 5e-5, weight decay de 0.01, y un scheduler con warmup de 71 pasos seguido de decaimiento coseno. La pérdida final de entrenamiento fue 0,1577 y la de validación 0,2157.

Una innovación destacable del proceso es la decisión de entrenar sobre **trayectorias completas de herramientas** en lugar de solo la respuesta final, lo que permite que el modelo aprenda el razonamiento intermedio (cuándo buscar, cómo interpretar resultados, cuándo detenerse). Además, se priorizó la integridad semántica de las trayectorias sobre la cantidad de datos: se descartaron 30 muestras que excedían el límite de contexto en lugar de truncarlas, para evitar supervisión corrupta.

## Capacidades

- **Localización de código**: identifica archivos, clases y funciones relevantes en un repositorio a partir de una descripción de tarea.
- **Búsqueda en repositorios**: genera trayectorias de búsqueda que simulan consultas a herramientas (búsqueda de texto, lectura de archivos) y utiliza los resultados para acotar la respuesta.
- **Razonamiento multi-paso**: el modelo aprende a encadenar varias llamadas a herramientas y a decidir cuándo continuar o finalizar la búsqueda.
- **Generación de evidencia**: produce respuestas con citas concretas de archivos y líneas, lo que facilita la verificación humana.
- **Tool calling implícito**: aunque el modelo no ejecuta herramientas por sí mismo, sus salidas están formateadas para ser interpretadas por un ejecutor externo (protocolo no documentado en la model card).
- **Comprensión de código en inglés**: funciona bien con repositorios cuyo código y comentarios están en inglés, dado que el entrenamiento fue exclusivamente en ese idioma.

## Casos de uso

- **Asistencia en onboarding de nuevos desarrolladores**: un ingeniero que se incorpora a un proyecto puede preguntar "¿dónde se implementa la autenticación?" y el modelo devuelve los archivos y funciones relevantes, reduciendo el tiempo de exploración manual del repositorio.
- **Análisis de impacto de cambios**: antes de modificar una función, el equipo puede usar el modelo para localizar todas las dependencias y usos relacionados, facilitando la evaluación de riesgos.
- **Integración en IDE como plugin**: el modelo puede ejecutarse localmente (por su tamaño) y ofrecer sugerencias de navegación contextuales mientras el desarrollador escribe código.
- **Automatización de tareas de mantenimiento**: en pipelines de CI/CD, el modelo puede localizar automáticamente los archivos afectados por un issue y generar un resumen para los desarrolladores.
- **Búsqueda semántica de código**: en lugar de usar grep o búsqueda por palabras clave, el modelo entiende descripciones en lenguaje natural y encuentra implementaciones relevantes, incluso si los nombres de archivos no son descriptivos.
- **Generación de documentación de arquitectura**: a partir de una pregunta sobre la estructura del repositorio, el modelo puede producir un mapa de módulos y sus responsabilidades, útil para documentación técnica.

## Benchmarks y rendimiento

El único resultado publicado en la model card es la pérdida de evaluación en el conjunto de validación del dataset de entrenamiento:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de texto (trayectoria SFT) | LeeXugar/CodePin-SFT-Qwen3.5-35B-A3B (validación) | Pérdida final de evaluación | 0,2157 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La pérdida de validación indica que el modelo ha aprendido a reproducir las trayectorias del profesor, pero no hay evidencia de rendimiento en tareas de código generales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con FP16, los pesos ocupan ~2 GB (1.006.672.704 parámetros × 2 bytes). Con overhead de activaciones y KV cache, se estima un uso de 4-6 GB para secuencias de 8K tokens. Con cuantización de 4 bits (si se generara), podría reducirse a ~1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 6 GB de VRAM, como RTX 2060, RTX 3060, RTX 4060, o GPUs de datacenter como T4, V100 o A10. El modelo cabe en GPUs consumer de gama media.
- **Opciones de despliegue**: compatible con `transformers` (carga directa con `AutoModelForCausalLM`), y potencialmente con `vLLM`, `llama.cpp` o `Ollama` si se convierte a GGUF. No hay guías oficiales de despliegue en la model card.
- **Latencia y throughput**: no se han publicado datos de inferencia. Dado el tamaño (~1B parámetros), en una RTX 4090 se espera una generación de 50-100 tokens/s con FP16, y menor en GPUs más antiguas.

## Comparativa con modelos similares

No se dispone de comparativas oficiales con otros modelos de localización de código. Como referencia, se compara con el modelo base y con un modelo generalista de tamaño similar:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| CodePin-SFT-Qwen3.5-0.8B | 1.006 M | 8.192 (entrenamiento) | Localización de código | Apache 2.0 |
| Qwen/Qwen3.5-0.8B | ~800 M | 262.144 | Generalista multimodal | Apache 2.0 |
| Qwen2.5-Coder-0.5B | 500 M | 32.768 | Generación de código | Apache 2.0 |

La comparativa es orientativa; no hay datos de rendimiento comparables. El modelo de CodePin está diseñado específicamente para tareas de búsqueda en repositorios, mientras que los otros son generalistas o de generación de código.

## Limitaciones y advertencias

- **Solo texto**: no procesa imágenes ni otros formatos multimodales, a pesar de que el modelo base Qwen3.5 es multimodal.
- **Idioma limitado**: entrenado exclusivamente en inglés; el rendimiento en otros idiomas será deficiente o nulo.
- **Contexto de entrenamiento reducido**: aunque el modelo base soporta 262K tokens, el finetune se limitó a 8.192 tokens, por lo que las trayectorias más largas no se han visto durante el entrenamiento y el modelo podría degradarse con entradas más largas.
- **Dependencia de herramientas externas**: el modelo genera trayectorias con semántica de herramientas, pero no puede ejecutarlas por sí mismo. Sin un ejecutor de herramientas compatible, sus respuestas son planes de búsqueda, no resultados reales.
- **Riesgo de alucinación**: al ser un modelo pequeño (1B), puede inventar nombres de archivos o funciones que no existen, especialmente si la tarea es ambigua o el repositorio no está bien representado en el entrenamiento.
- **Sesgos del dataset**: el dataset de entrenamiento proviene de un modelo profesor (35B-A3B) y puede heredar sus sesgos o errores en las trayectorias.
- **Sin garantías de producción**: no hay información sobre pruebas de robustez, seguridad o rendimiento en entornos reales. Se recomienda validar antes de usar en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LeeXugar/CodePin-SFT-Qwen3.5-0.8B)
- [Colección CodePin](https://huggingface.co/collections/LeeXugar/codepin-6a8afa1064d9f83f9fce2982)
- [Dataset de entrenamiento (trayectorias SFT)](https://huggingface.co/datasets/LeeXugar/CodePin-SFT-Qwen3.5-35B-A3B)
- [Dataset SWE-smith code-search](https://huggingface.co/datasets/LeeXugar/SWE-smith-code-search)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
