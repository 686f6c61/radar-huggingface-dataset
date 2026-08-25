# oracomputing/Qwen3.8-27B-OQ3-GGUF

## Resumen

Qwen3.8-27B-OQ3-GGUF es una cuantización post-entrenamiento (PTQ) del modelo denso multimodal Qwen3.8-27B de Alibaba, publicada por Ora Computing. El modelo base pertenece a la serie Qwen3.8 de Qwen, que destaca por su rendimiento en tareas de codificacion, flujos de trabajo agénticos y automatización de oficina, tanto en texto como en modalidades visuales. Esta variante GGUF reduce el peso del modelo original de 16 bits a una media de 3,026 bits por peso, lo que lo hace aproximadamente 5,3 veces más pequeño, manteniendo el 95,4% de la precisión del modelo original.

La cuantización OQ3 emplea una asignación de formato por tensor basada en calibración, con 2,967 bits por peso en el cuerpo del modelo y cuantización Q2_K para embeddings y Q4_K para la capa de salida. El archivo resultante ocupa 10,18 GB, lo que permite su ejecución en hardware de consumo con 16 GB de VRAM o incluso en CPU mediante llama.cpp. Su contexto nativo de 262.144 tokens y su soporte de modos de razonamiento lo convierten en una opción interesante para tareas complejas de razonamiento, generación de código y análisis de documentos extensos en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | OQ3 (3,026 bpw promedio, cuerpo 2,967 bpw, embeddings Q2_K, salida Q4_K) |
| Idiomas soportados | no disponible |
| Licencia | ora-custom-model-license |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso de 27.000 millones de parámetros con arquitectura multimodal nativa, es decir, procesa texto e imágenes de forma conjunta sin módulos separados de visión. La versión 3.8 se construye sobre la 3.6-27B e incorpora mejoras específicas en tareas de codificación y productividad de oficina, tanto en texto como en entradas visuales. El modelo es capaz de activar un modo de razonamiento (thinking mode) que genera cadenas de pensamiento extensas antes de emitir la respuesta final.

La cuantización OQ3 es una técnica de post-entrenamiento que asigna formatos de cuantización de forma individual a cada tensor del modelo, utilizando un conjunto de calibración para determinar la distribución de pesos y elegir el formato óptimo. El resultado es un modelo con un promedio global de 3,026 bits por peso, con el cuerpo del modelo a 2,967 bpw, mientras que los embeddings se cuantizan a Q2_K y la capa de salida a Q4_K. Este enfoque permite reducir significativamente el tamaño del archivo sin una degradación proporcional de la calidad, como se observa en los benchmarks de retención de precisión.

## Capacidades

- Generación de texto y razonamiento complejo: soporta cadenas de pensamiento largas (hasta 262.144 tokens de contenido de razonamiento) para tareas de lógica, matemáticas y análisis.
- Generación de código: el modelo base está optimizado para tareas de programación, incluyendo generación, explicación y depuración de código.
- Capacidades multimodales: procesamiento de imágenes (visión) integrado de forma nativa, lo que permite tareas como OCR, descripción de imágenes o análisis de diagramas.
- Tool calling / function calling: soporta invocación de funciones externas, lo que lo habilita para su uso en pipelines de agentes.
- Flujos de trabajo agente: puede ejecutar tareas multi-paso con razonamiento encadenado, gracias a su contexto largo y modo de pensamiento.
- Multilingüe: aunque no se especifican los idiomas exactos, el modelo base de Qwen soporta múltiples idiomas, incluyendo chino, inglés y otros.

## Casos de uso

- Despliegue local en hardware de consumo: el archivo GGUF de 10,18 GB permite ejecutar el modelo en GPUs de 16 GB de VRAM (por ejemplo, RTX 4090) o en CPU con llama.cpp, ideal para entornos sin acceso a infraestructura cloud.
- Asistente de programación offline: se puede integrar en IDEs o herramientas CLI mediante llama.cpp para autocompletado, revisión de código y generación de tests, sin dependencia de servicios externos.
- Análisis de documentos con visión: gracias a la capacidad multimodal, se puede usar para extraer información de facturas, capturas de pantalla o diagramas, combinando texto y contexto visual.
- Automatización de oficina: el modelo base está optimizado para tareas de productividad, como redacción de correos, generación de informes, resumen de reuniones o creación de presentaciones a partir de notas.
- Agentes de razonamiento con herramientas: con soporte de tool calling, se puede construir un agente que consulte bases de datos, ejecute scripts o realice búsquedas web, usando el modelo como cerebro de decisión.
- Investigación académica en entornos con recursos limitados: permite ejecutar un modelo de 27 B con calidad cercana al original en estaciones de trabajo con GPU modesta, facilitando experimentos de razonamiento matemático o científico.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card de Ora, donde se aplicaron las mismas condiciones de evaluación a todos los modelos (MMLU-Pro con 5-shot CoT sobre 12.032 preguntas, y AIME-25 con 8 semillas × 30 problemas y 65.536 tokens máximos de generación). La cuantización OQ3 se comparó con el modelo original en bf16 y con otra cuantización de referencia.

| Modelo | MMLU-Pro | AIME-25 | Promedio | Full BPW | Body BPW | Retención |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 76,71 | 95,83 | 86,27 | 16,00 | 16,00 | 100,0 % |
| **OQ3 (este repo)** | **73,94** | **90,42** | **82,18** | **3,026** | **2,967** | **95,4 %** |
| Escha W2 | 71,24 | 87,50 | 79,37 | 3,020 | 2,485 | 92,1 % |

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 10,18 GB. Con overahead de contexto y KV cache, se recomienda un mínimo de 14-16 GB de VRAM para inferencia con contexto moderado (hasta 32K tokens).
- GPUs recomendadas: RTX 4080/4090 (16-24 GB), A100 40 GB, H100. En GPU con menos de 12 GB, se puede usar con contextos muy reducidos o con offload parcial a CPU.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) con contexto moderado. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (línea de comandos, servidor HTTP), Ollama (si se convierte el archivo), llama-cpp-python para integración en Python, y vLLM con soporte GGUF (experimental).
- Latencia estimada: no disponible en la información proporcionada. Depende del hardware y del tamaño de contexto; en una RTX 4090 se espera una velocidad de 30-60 tokens/s para generación de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | AIME-25 | Tamaño GGUF | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-OQ3 (este repo) | 26,9 B | 262 K | 73,94 | 90,42 | 10,18 GB | ora-custom |
| Qwen3.8-27B (bf16 original) | 26,9 B | 262 K | 76,71 | 95,83 | ~54 GB | Apache 2.0 (del base) |
| Escha W2 (cuantización alternativa) | 26,9 B | 262 K | 71,24 | 87,50 | ~10,15 GB | ora-custom |

## Limitaciones y advertencias

- Licencia personalizada: el modelo se distribuye bajo la licencia `ora-custom-model-license`, que no es una licencia estándar de código abierto. Antes de usar el modelo en producción, es imprescindible revisar los términos de la licencia en el archivo LICENSE del repositorio, ya que puede imponer restricciones sobre uso comercial, redistribución o modificación.
- Pérdida de precisión: la cuantización a 3 bits implica una retención del 95,4 % de la precisión promedio, lo que puede afectar a tareas de alta precisión, como matemáticas complejas o razonamiento lógico extenso. Se recomienda validar el modelo en el caso de uso concreto.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o plausible pero incorrecta, especialmente en tareas de razonamiento largo o con contexto parcialmente visible.
- Sesgos y limitaciones de idioma: no se han publicado datos sobre los idiomas soportados ni sobre sesgos del modelo. El modelo base Qwen es multilingüe, pero la calidad puede variar entre idiomas.
- Requisitos de contexto: aunque el modelo soporta hasta 262 K tokens, el uso de contextos muy largos en la cuantización de 3 bits puede amplificar errores o degradar la coherencia. Se recomienda probar con contextos moderados en entornos de producción.
- Sin soporte oficial: al ser una cuantización de terceros, no hay garantía de mantenimiento ni de actualizaciones. La calidad puede depender del conjunto de calibración usado por Ora.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oracomputing/Qwen3.8-27B-OQ3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial del modelo base (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Guía de cuantizaciones GGUF para Qwen3.8-27B: https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Guía de ejecución con Ollama: https://tech-insider.org/how-to-run-qwen3-8-27b-locally-ollama-2026/
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
