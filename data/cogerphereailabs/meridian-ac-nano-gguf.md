# COGERPHEREAILABS/meridian-ac-nano-GGUF

## Resumen

Meridian-AC-Nano es un modelo de lenguaje especializado en corrección académica, gramática, LaTeX y tono académico, desarrollado por Cogerphere AI Labs como parte de la investigación MERIDIAN 0.1. Se trata de un fine-tuning LoRA sobre el modelo base Qwen3-0.6B, un transformer de 596 millones de parámetros, que se distribuye en formato GGUF para su uso con runtimes como llama.cpp, Ollama y llama-cpp-python. El modelo está diseñado para asistir a investigadores y estudiantes en la revisión de tesis, artículos y documentos académicos, ofreciendo además capacidades conversacionales.

La relevancia de este modelo radica en su tamaño reducido, que permite ejecutarlo en hardware de consumo, y en su especialización en un dominio concreto (escritura académica y LaTeX). Al estar basado en Qwen3-0.6B, hereda la arquitectura transformer estándar con atención completa, pero adaptada mediante LoRA a tareas de proofreading y corrección gramatical. La licencia Apache-2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B base) con adaptadores LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se recomienda num_ctx 4096 en Ollama) |
| Tipos de cuantizacion | Q4_K_M (378 MB), Q8_0 (610 MB), F16 (1142 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only con normalización RMS, atención multi-cabeza y ventana de contexto nativa de 32K tokens (aunque el fine-tuning puede haber reducido la longitud efectiva). El entrenamiento se realizó mediante LoRA (Low-Rank Adaptation), una técnica de fine-tuning eficiente que congela los pesos originales e introduce matrices de bajo rango en las capas de atención y feed-forward. Esto permite adaptar el modelo a un dominio específico con un coste computacional reducido.

Los datos de entrenamiento se centran en literatura académica, LaTeX y corrección de tesis, según el repositorio de investigación MERIDIAN 0.1. No se especifica el número exacto de tokens ni la composición detallada del dataset. El modelo reporta un ROUGE-L de 0.929, aunque no se indica sobre qué conjunto de evaluación se obtuvo. No hay evidencia de fases de RLHF o DPO; el fine-tuning parece ser supervisado únicamente.

## Capacidades

- Corrección gramatical y ortográfica en textos académicos.
- Asistencia en la redacción y revisión de documentos LaTeX.
- Mejora del tono académico y estilo formal.
- Corrección de código (posiblemente fragmentos LaTeX o código científico).
- Conversación fluida y útil en inglés (según el prompt del sistema definido en la model card).
- Generación de texto con contexto limitado (se recomienda 4096 tokens).

## Casos de uso

- Revisión de tesis y trabajos fin de grado: el modelo puede señalar errores gramaticales y sugerir reformulaciones en tiempo real, gracias a su tamaño reducido que permite ejecutarlo localmente en un portátil.
- Corrección de artículos científicos antes de envío a revistas: ayuda a pulir el lenguaje académico y la coherencia estilística, reduciendo el tiempo de revisión manual.
- Asistente para escritura en LaTeX: integrado en editores como VS Code o Overleaf, puede sugerir correcciones de sintaxis LaTeX y mejorar la estructura del documento.
- Herramienta de autoedición para estudiantes no nativos: mejora la fluidez y precisión del inglés académico en textos producidos por hablantes no nativos.
- Pipeline de revisión automatizada en repositorios de documentación técnica: al ser un modelo ligero, puede ejecutarse en CI/CD para validar la calidad lingüística de documentación generada automáticamente.
- Chatbot educativo para dudas de redacción académica: su capacidad conversacional permite responder preguntas sobre estilo, gramática y formato, con un tono formal y útil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es ROUGE-L 0.929, obtenida presumiblemente en una tarea de corrección de textos académicos, aunque no se especifica el conjunto de datos de evaluación. Se recomienda realizar pruebas propias en el dominio objetivo antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en F16 ocupa 1,1 GB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050). Las versiones cuantizadas Q8_0 (610 MB) y Q4_K_M (378 MB) pueden ejecutarse incluso en GPU integradas o en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es más que suficiente; también funciona en Apple Silicon y CPUs con al menos 8 GB de RAM.
- Compatibilidad con hardware de consumo: sí, es un modelo SLM (Small Language Model) diseñado para ejecutarse en portátiles y equipos de gama media.
- Opciones de despliegue: llama.cpp, Ollama (con comando `ollama run hf.co/COGERPHEREAILABS/meridian-ac-nano-GGUF:Q8_0`), llama-cpp-python, y cualquier runtime compatible con GGUF.
- Latencia y throughput: al ser un modelo de 0.6B, la generación es rápida incluso en CPU (del orden de 20-40 tokens/s en hardware moderno), aunque no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Meridian-AC-Nano | 596M | no disponible (recomendado 4096) | Apache-2.0 | Corrección académica y LaTeX |
| Qwen3-0.6B (base) | 596M | 32K | Apache-2.0 | Modelo generalista |
| SmolLM2-135M | 135M | 2K | Apache-2.0 | Modelo pequeño generalista |

Meridian-AC-Nano se diferencia de su base Qwen3-0.6B por su especialización en tareas académicas, lo que debería ofrecer mejor rendimiento en corrección gramatical y LaTeX a costa de perder generalidad. Frente a SmolLM2-135M, tiene 4,4 veces más parámetros, lo que le permite mayor capacidad de razonamiento, aunque ambos son modelos muy ligeros. No hay comparativas directas publicadas con otros modelos de corrección académica.

## Limitaciones y advertencias

- Modelo de solo 0.6B: su capacidad de razonamiento complejo es limitada; puede cometer errores en textos muy técnicos o con matices sutiles.
- Longitud de contexto efectiva reducida: aunque Qwen3 soporta 32K, el fine-tuning y las recomendaciones de la model card sugieren usar 4096 tokens, lo que limita la revisión de documentos largos.
- Sesgos potenciales: al estar entrenado principalmente con literatura académica, puede mostrar preferencia por estilos formales anglosajones y no adaptarse bien a otros registros.
- Riesgo de alucinación: como cualquier LLM, puede inventar correcciones o sugerencias incorrectas, especialmente en LaTeX avanzado o citas bibliográficas.
- Idiomas: no se especifica soporte multilingüe; probablemente el modelo funciona mejor en inglés académico.
- Sin garantías de producción: no hay benchmarks independientes ni evaluación externa; se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/COGERPHEREAILABS/meridian-ac-nano-GGUF)
- [Modelo base (safetensors) en HuggingFace](https://huggingface.co/COGERPHEREAILABS/meridian-ac-nano)
- [Repositorio de investigación MERIDIAN 0.1 en GitHub](https://github.com/COGERPHEREAILABS/Meridian-SLM-Driven-Models-Research/tree/main/)
- [README del repositorio de investigación](https://github.com/COGERPHEREAILABS/Meridian-SLM-Driven-Models-Research/blob/main/README.md)
- [Modelo base original Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
