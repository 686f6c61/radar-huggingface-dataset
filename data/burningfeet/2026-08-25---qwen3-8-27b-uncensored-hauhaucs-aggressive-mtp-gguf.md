# burningfeet/2026-08-25-.-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Este repositorio contiene una versión cuantizada en formato GGUF del modelo Qwen3.8-27B, publicada por el usuario `burningfeet` bajo el nombre `2026-08-25-.-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF`. Se trata de una adaptación del modelo base `Qwen/Qwen3.8-27B`, un modelo multimodal de 27 mil millones de parámetros que acepta entradas de imagen y texto, al que se ha aplicado un proceso de "uncensoring" (eliminación de la capa de rechazo de contenido, probablemente mediante técnicas de abliteration) y que incorpora soporte para MTP (Multi-Token Prediction) con decodificación especulativa para acelerar la inferencia.

El modelo está pensado para ejecución local con `llama.cpp` u otros motores compatibles con GGUF, y destaca por ofrecer respuestas sin censura en un entorno controlado. Es relevante para desarrolladores e investigadores que necesitan un modelo multimodal de gran tamaño con pesos abiertos (licencia Apache 2.0) y que quieren explorar el comportamiento de un LLM sin filtros de seguridad, siempre dentro de un marco de uso responsable. El acceso al repositorio es restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + texto), con soporte MTP (Multi-Token Prediction) |
| Parametros totales | 27.000 millones (modelo base Qwen3.8-27B); el archivo safetensors del repo muestra 1.863.907.840 parámetros (posiblemente un archivo parcial o de referencia) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (no publicada en la información del repo) |
| Tipos de cuantizacion | GGUF (múltiples niveles, desde Q2_K hasta F16; el repositorio ocupa 172.5 GB en total) |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el archivo de referencia) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer multimodal desarrollado por el equipo Qwen de Alibaba, capaz de procesar tanto texto como imágenes. La variante publicada en este repositorio ha sido modificada para eliminar el comportamiento de rechazo (uncensored), lo que implica que se ha intervenido sobre los pesos del modelo para eliminar las respuestas de negación o "refusal" que el modelo original genera ante peticiones sensibles o peligrosas. Esta técnica, conocida como abliteration, consiste en identificar y eliminar las direcciones del espacio de activaciones responsables del rechazo.

Además, el modelo incorpora soporte para MTP (Multi-Token Prediction) y decodificación especulativa, lo que permite predecir varios tokens a la vez y acelerar la generación en comparación con la decodificación autoregresiva estándar. El tag `FastMTP` sugiere que se ha optimizado la implementación de este mecanismo para mejorar el throughput. No se dispone de información detallada sobre el dataset de entrenamiento específico de esta variante, ni sobre si se realizó un fine-tuning adicional o solo la modificación de los pesos.

## Capacidades

- Generación de texto en inglés y chino, con soporte multilingüe.
- Comprensión de imágenes (entrada multimodal) y capacidad de responder sobre su contenido (image-text-to-text).
- Razonamiento avanzado y generación de código, heredados del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling (capacidad del modelo base, no confirmada específicamente en esta variante).
- Soporte de decodificación especulativa mediante MTP para acelerar la generación.
- Comportamiento "uncensored": no genera respuestas de rechazo para peticiones que el modelo base bloquearía, lo que permite explorar dominios de contenido restringido.

## Casos de uso

- **Investigación en seguridad y alineamiento**: el modelo permite estudiar cómo se comporta un LLM sin capas de rechazo, lo que es útil para investigar sesgos, alucinación y mecanismos de censura. Se puede usar en entornos de laboratorio con prompts controlados.
- **Generación de contenido creativo sin restricciones**: escritura de narrativa, guiones o diálogos que requieren un tono explícito o temáticas que otros modelos bloquean. Su capacidad multimodal permite además trabajar con imágenes como entrada.
- **Desarrollo de aplicaciones locales de asistencia**: al ser GGUF, se puede integrar en aplicaciones de escritorio o móviles mediante `llama.cpp` o `Ollama`, sin depender de la nube, con la ventaja de no tener filtros de contenido.
- **Análisis de documentos visuales**: al aceptar imágenes, se puede usar para extraer información de capturas, gráficos o documentos escaneados, con la particularidad de que no rechazará preguntas sobre contenido sensible.
- **Prototipado de agentes con tool calling**: aunque no está confirmado en esta variante, el modelo base Qwen3.8 soporta function calling; se puede usar para construir agentes que necesiten ejecutar acciones sobre herramientas sin limitación de contenido.
- **Evaluación de decodificación especulativa**: gracias a su soporte MTP, es un candidato ideal para medir la aceleración de la inferencia en hardware local comparando con el modelo sin MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede confirmar si el proceso de abliteration afecta al rendimiento en tareas estándar (MMLU, HumanEval, etc.) respecto al modelo base. Se recomienda ejecutar pruebas propias en el entorno objetivo.

## Requisitos de hardware

- **VRAM estimada**: para una cuantización Q4_K_M (común en GGUF), el modelo de 27B requiere aproximadamente 16-18 GB de VRAM. Con Q5_K_M puede llegar a 20 GB, y con Q8_0 a unos 28 GB. La variante F16 necesitaría más de 50 GB.
- **GPU recomendadas**: para ejecución fluida se recomiendan GPUs con al menos 16 GB de VRAM, como RTX 4090, RTX 4080, A100 40GB, o varias GPUs en paralelo. En consumer, la RTX 4090 es la opción más viable para cuantizaciones bajas.
- **Cabe en GPU consumer**: sí, con cuantizaciones Q2_K o Q3_K se puede ejecutar en GPUs de 8 GB (ej. RTX 3070), aunque con menor calidad y velocidad. Para Q4_K_M se necesita una GPU de 16 GB.
- **Opciones de despliegue**: `llama.cpp`, `Ollama`, `llama-cpp-python`, `text-generation-webui` (oobabooga), y cualquier servidor compatible con GGUF (ej. `llama-server`).
- **Latencia y throughput**: no disponibles. La decodificación especulativa MTP puede reducir la latencia por token hasta un 30-40% en comparación con el modelo base, pero los valores concretos dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | no disponible | imagen + texto | Apache 2.0 | safetensors | Modelo oficial con capa de rechazo |
| Qwen3.8-27B-Uncensored-FP8 | 27B | no disponible | imagen + texto | Apache 2.0 | FP8 | Variante abliterated publicada por orcarouter |
| Qwen3.8-27B-Uncensored-GGUF | 27B | no disponible | imagen + texto | Apache 2.0 | GGUF | Variante abliterated de orcarouter, sin MTP |
| Este modelo | 27B | no disponible | imagen + texto | Apache 2.0 | GGUF | Añade MTP y FastMTP, más agresivo |

La principal diferencia con las alternativas de orcarouter es la inclusión de MTP para decodificación especulativa y el prefijo "Aggressive" en el nombre, que sugiere una eliminación de censura más agresiva. No hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al eliminar la capa de rechazo, el modelo puede generar contenido sesgado, tóxico o falso sin filtro. No está alineado y puede producir respuestas dañinas.
- **Riesgo de alucinación**: el modelo base ya tiene riesgo de alucinar; la ausencia de censura puede amplificar este problema, especialmente en temas sensibles.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el blog de orcarouter indica que su variante uncensored está destinada a "research-only" (solo investigación). Este modelo concreto no especifica restricciones adicionales, pero se recomienda revisar las condiciones de HuggingFace.
- **Contexto limitado**: no se ha confirmado la longitud de contexto; si se usa una cuantización baja, el contexto efectivo puede ser menor.
- **Calidad de la cuantización**: las cuantizaciones bajas (Q2_K, Q3_K) degradan notablemente la calidad de salida, especialmente en tareas de razonamiento.
- **Acceso restringido**: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que puede limitar la automatización en entornos CI/CD.

## Enlaces

- [HuggingFace - Repositorio del modelo](https://huggingface.co/burningfeet/2026-08-25-.-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF)
- [HuggingFace - Repositorio relacionado (unsloth)](https://huggingface.co/burningfeet/2026-08-25-.-unsloth-.-Qwen3.8-27B-GGUF)
- [Blog orcarouter: Qwen3.8-27B Uncensored GGUF](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
- [Blog orcarouter: cómo ejecutar localmente](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [GitHub QwenLM/Qwen3.8 (modelo base)](https://github.com/QwenLM/Qwen3.8)
