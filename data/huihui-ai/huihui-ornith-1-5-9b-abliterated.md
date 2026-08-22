# huihui-ai/Huihui-Ornith-1.5-9B-abliterated

## Resumen

Huihui-Ornith-1.5-9B-abliterated es una versión modificada del modelo ornith-ai/Ornith-1.5-9B, creada por huihui-ai mediante una técnica conocida como abliteration, que elimina los patrones de rechazo aprendidos por el modelo durante el entrenamiento con retroalimentación humana (RLHF). El resultado es un modelo de generación de texto que no aplica filtros de contenido ni negativas a peticiones controvertidas, manteniendo intactas sus capacidades de razonamiento y generación.

El modelo base, Ornith-1.5-9B, es un modelo de codificación agéntica open-source que implementa un framework de self-scaffolding y auto-mejora: el propio modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo. Está construido sobre la arquitectura Qwen3.5-9B, con aproximadamente 9,4 mil millones de parámetros y soporte multimodal de entrada (texto, imagen y vídeo). La versión abliterated mantiene estas capacidades pero elimina los mecanismos de negación de contenido.

La relevancia de este modelo reside en su utilidad para entornos de investigación y desarrollo donde se requiere un comportamiento sin restricciones temáticas, como análisis de sesgos, pruebas de seguridad o generación creativa. El proceso de abliteration se aplicó únicamente a las primeras 20 capas del modelo, una decisión de diseño que conserva el rendimiento general pero deja posibles residuos de rechazo en las capas posteriores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-9B (arquitectura Qwen3) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se hereda del modelo base Qwen3.5-9B, presumiblemente 128K tokens) |
| Tipos de cuantizacion | Safetensors en bfloat16 (repo original); existen conversiones MLX 4-bit de terceros |
| Idiomas soportados | no disponible (probablemente multilingue por su base Qwen3) |
| Licencia | MIT |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B está construido sobre la arquitectura Qwen3.5-9B de Alibaba, un transformer causal de 9,4B parámetros con atención de ventana completa. El framework de entrenamiento de Ornith introduce un bucle de auto-mejora: el modelo genera propuestas de tareas, construye scaffolds específicos para cada tarea y produce soluciones que se utilizan como datos de entrenamiento por refuerzo (RL). Este proceso continuo permite que el modelo mejore sus capacidades de razonamiento y codificación de forma autónoma.

La versión abliterated aplica la técnica de abliteration sobre las primeras 20 capas del modelo, un método que identifica y neutraliza direcciones en el espacio de activaciones responsables de la generación de rechazos. Esta intervención es parcial (solo 20 de las capas totales), por lo que el modelo puede conservar algunos patrones de rechazo residuales en capas posteriores. Los pesos MTP (Multi-Token Prediction) incluidos en el repositorio provienen de Qwen/Qwen3.5-9B y son necesarios para la conversión a GGUF.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF aplicado al modelo base.

## Capacidades

- Generación de texto y conversación multi-turno con soporte de mensajes estructurados (chat template de Qwen3).
- Codificación agéntica: capaz de generar código, razonar sobre tareas de programación y orquestar flujos de trabajo de desarrollo de software.
- Razonamiento de múltiples pasos con modo de pensamiento (thinking mode) típico de los modelos Qwen3.
- Soporte de entrada multimodal: acepta texto, imagen y vídeo como entrada (según tags del modelo).
- Tool calling y function calling: compatible con la API de funciones de Qwen3, lo que permite integrarlo en pipelines de agentes.
- Capacidades multilingües heredadas de Qwen3.5 (idiomas exactos no especificados).
- Sin restricciones de contenido: el proceso de abliteration elimina las respuestas de rechazo, permitiendo tratar temas sensibles sin filtros.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede proponer tareas, generar scaffolds y producir código de forma autónoma, ideal para pipelines de CI/CD que requieren generación y verificación de código sin intervención humana.
- Asistentes de programación sin restricciones: útil para generar código ofuscado, exploits en entornos de seguridad ofensiva o scripts que los modelos convencionales rechazan.
- Investigación sobre seguridad y sesgos: permite estudiar el comportamiento de un modelo sin filtros de contenido, analizando cómo responde a peticiones dañinas o controvertidas.
- Generación creativa de contenido: redacción de ficción, poesía o guiones con temáticas adultas o violentas sin limitaciones.
- Simulación de agentes maliciosos: en entornos de investigación de ciberseguridad, se puede usar para generar ataques simulados o phishing de forma controlada.
- Análisis de alucinaciones y razonamiento: al eliminar rechazos, se puede estudiar cómo el modelo gestiona preguntas complejas sin la interferencia de capas de seguridad.
- Conversación sin filtros: para proyectos de chatbot dirigidos a usuarios que requieren respuestas directas sin censura en temas políticos, religiosos o sociales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterated en la información disponible. El modelo base Ornith-1.5-9B presenta resultados en la página oficial de Ornith AI, pero no se dispone de datos numéricos concretos en los resultados de búsqueda. Se recomienda consultar la documentación del modelo base para datos de MMLU, HumanEval, GSM8K y otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: ~19,3 GB en bfloat16 (tamaño del repo), ~9,6 GB en FP16, ~4,8 GB en cuantización 4-bit (MLX 4-bit disponible).
- GPU recomendadas: RTX 3090 (24 GB) o superior para FP16; RTX 4060 Ti 16 GB o RTX 4070 para cuantización 4-bit; A100 40 GB para despliegue con contexto largo.
- Puede ejecutarse en GPU consumer con cuantización: RTX 4060 8 GB (con 4-bit) o RTX 4070/4080 (con 8-bit).
- Opciones de despliegue: transformers (pipeline de Hugging Face), vLLM, llama.cpp (requiere convertir a GGUF con los archivos MTP), Ollama (si se convierte a GGUF), TGI (Text Generation Inference).
- Latencia estimada: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| huihui-ai/Huihui-Ornith-1.5-9B-abliterated | 9,4B | no disponible | MIT | Abliterated, sin filtros |
| ornith-ai/Ornith-1.5-9B | 9,4B | no disponible | MIT | Modelo base con filtros |
| Qwen/Qwen3.5-9B | 9,4B | 128K | Apache 2.0 | Modelo base sin abliteration |
| huihui-ai/Qwen3-9B-abliterated | 9,4B | 128K | Apache 2.0 | Versión abliterated de Qwen3-9B |

La comparativa se centra en el modelo base Ornith-1.5-9B y en otros modelos abliterated de huihui-ai basados en Qwen3. La diferencia principal es la eliminación de rechazos y la licencia MIT (más permisiva que Apache 2.0).

## Limitaciones y advertencias

- Abliteration parcial: solo se ablataron las primeras 20 capas, por lo que el modelo puede conservar rechazos residuales en capas posteriores en algunos casos.
- Riesgo de contenido dañino: al eliminar los filtros de seguridad, el modelo puede generar contenido ilegal, ofensivo o peligroso sin restricciones. No es adecuado para entornos de producción con usuarios reales sin supervisión humana.
- Riesgo de alucinación: al igual que todos los modelos generativos, puede inventar información, especialmente en temas de alta complejidad técnica.
- Limitaciones de contexto: no se han especificado los límites exactos de la ventana de contexto; se heredan de Qwen3.5-9B (presumiblemente 128K tokens), pero no se garantiza.
- Sesgos conocidos: el modelo base puede heredar sesgos de los datos de entrenamiento de Qwen3, que pueden amplificarse al eliminar los filtros de contenido.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero el autor (huihui-ai) no ofrece garantías sobre el comportamiento del modelo. El modelo base (Ornith-1.5-9B) también es MIT.
- Dependencia de MTP: para convertir a GGUF se requieren los pesos MTP de Qwen/Qwen3.5-9B, lo que complica el despliegue en entornos de inferencia como llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Modelo base en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog oficial de Ornith (self-scaffolding): https://ornith.ai/ornith_1_5.html
- Página de Ornith AI (modelos agénticos): https://ornith.online/
- Repositorio de abliteration (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Conversión MLX 4-bit (friendli.ai): https://friendli.ai/models/osxest/Huihui-Ornith-1.5-9B-abliterated-mlx-4Bit
