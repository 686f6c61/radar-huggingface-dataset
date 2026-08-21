# Smithkh4/Project_K

## Resumen

Project_K es un modelo de lenguaje finetuneado y convertido a formato GGUF por el usuario Smithkh4 (Kevin H Smith) en agosto de 2026. Aunque el autor no proporciona una descripción oficial, los nombres de los archivos incluidos en el repositorio indican que se trata de una adaptación del modelo Qwen3.5-9B, con una variante de instrucción etiquetada como "HighIQ-INSTRUCT-HERETIC-UNCENSORED" y un proyector multimodal (mmproj) que sugiere capacidades de visión. El repositorio contiene dos archivos: un GGUF cuantizado a Q4_K_M para el modelo de lenguaje y un proyector multimodal en BF16.

El modelo está orientado a su uso con llama.cpp (tanto `llama-cli` para texto como `llama-mtmd-cli` para multimodalidad) y fue entrenado con la librería Unsloth, que acelera el finetune y la conversión a GGUF. Con aproximadamente 8.95 mil millones de parámetros, se sitúa en el rango de modelos de 9B que pueden ejecutarse en hardware de consumo. Sin embargo, la falta de documentación oficial, la ausencia de licencia declarada y el etiquetado "UNCENSORED" plantean dudas significativas sobre su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers basada en Qwen3.5-9B (no confirmado oficialmente) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredado de Qwen3.5, presumiblemente 128K) |
| Tipos de cuantizacion | Q4_K_M (modelo principal), BF16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no publicado) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada por el autor. Por el nombre del archivo, se infiere que el modelo base es Qwen3.5-9B, que corresponde a un transformer de decodificación autoregresivo con atención multi-cabeza y probablemente mecanismos de RoPE (rotary position embeddings) y GQA (grouped query attention), como es habitual en la familia Qwen. El proyecto multimodal añade un proyector de visión (mmproj) que permite procesar imágenes, lo que indica que el finetune pudo haber sido realizado sobre una variante multimodal del modelo base.

El finetune fue realizado con Unsloth, una librería que optimiza el entrenamiento mediante LoRA/QLoRA y acelera la conversión a GGUF. El nombre "HERETIC-UNCENSORED" sugiere que el modelo ha sido ajustado para eliminar restricciones de seguridad y contenido, aunque no hay información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor no proporciona detalles sobre el proceso de entrenamiento ni sobre los datos utilizados.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y es capaz de mantener diálogos multi-turno.
- Capacidades de visión: incluye un proyector multimodal (mmproj) que permite procesar imágenes como entrada, aunque no se especifica el alcance de esta capacidad.
- Soporte de tool calling: no confirmado explícitamente, pero al estar basado en Qwen3.5 es probable que herede la capacidad de function calling del modelo base.
- Razonamiento y conocimiento general: el nombre "HighIQ" sugiere un finetune orientado a mejorar el razonamiento, aunque no hay benchmarks que lo respalden.
- Multilingüismo: no confirmado, pero los modelos Qwen suelen tener buen soporte multilingüe.
- Modo "uncensored": el etiquetado indica que se eliminaron restricciones de contenido, lo que permite generar respuestas que otros modelos rechazarían.

## Casos de uso

- Asistencia en investigación y análisis de datos: el modelo puede procesar documentos extensos y mantener contexto largo (si el contexto de Qwen3.5 se mantiene en 128K), lo que permite analizar informes, papers o datasets de texto extensos.
- Generación de contenido creativo sin restricciones: su naturaleza "uncensored" permite crear ficción, diálogos o guiones con temáticas que otros modelos censuran, aunque esto conlleva riesgos legales y éticos.
- Chatbots de nicho para comunidades específicas: su tono conversacional y falta de censura lo hace adecuado para foros y comunidades que requieren respuestas directas sin filtros.
- Procesamiento de imágenes con descripción generativa: al incluir el proyector multimodal, puede utilizarse para generar descripciones de imágenes en aplicaciones de accesibilidad o anotación automática.
- Prototipado de aplicaciones de IA en local: gracias al formato GGUF y la compatibilidad con llama.cpp, se puede ejecutar en portátiles o mini-PC para pruebas de concepto sin conexión a la nube.
- Investigación sobre alineación y seguridad: el contraste entre un modelo "uncensored" y los modelos alineados permite estudiar el comportamiento de los modelos cuando se eliminan las restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona puntuaciones de MMLU, HumanEval, GSM8K, ni ninguna otra métrica de rendimiento. La única afirmación de calidad es el término "HighIQ" en el nombre del archivo, que no se sustenta con datos objetivos.

## Requisitos de hardware

- VRAM estimada para inferencia: un GGUF Q4_K_M de un modelo de 9B ocupa aproximadamente 5.5-6 GB, por lo que se puede ejecutar en GPU con 8 GB de VRAM o más. El proyector multimodal en BF16 añade unos 300-400 MB adicionales.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM. También puede ejecutarse en Apple Silicon (M1/M2/M3) mediante Metal.
- Ejecución en CPU: con llama.cpp es posible ejecutar el modelo en CPU, aunque la velocidad será lenta (menos de 10 tokens/s) con 16 GB de RAM.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (si se importa el GGUF), vLLM (con conversión previa a safetensors) o TGI (requiere formato HF).
- Latencia y throughput estimados: en una RTX 4090, se espera una velocidad de generación de 80-120 tokens/s con Q4_K_M; en una RTX 3060, 30-50 tokens/s; en CPU con 16 GB de RAM, 2-5 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Smithkh4/Project_K | 8.95B | no disponible | no disponible | GGUF | Finetune "uncensored" de Qwen3.5-9B |
| Qwen3-8B | 8.03B | 128K | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, multimodal |
| Llama-3.1-8B | 8.03B | 128K | Llama 3.1 License | safetensors, GGUF | Modelo de Meta, texto, no multimodal |
| Mistral-7B v0.3 | 7.24B | 32K | Apache 2.0 | safetensors, GGUF | Modelo de Mistral, texto |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo. La principal diferencia es el carácter "uncensored" y el soporte multimodal, pero la ausencia de licencia y documentación hace que los modelos oficiales (Qwen, Llama, Mistral) sean más fiables para producción.

## Limitaciones y advertencias

- Licencia no disponible: no se puede usar en aplicaciones comerciales sin riesgo legal, ya que no se conoce el término de uso.
- Sin documentación de entrenamiento: no hay información sobre el dataset, el método de alineación ni los datos de evaluación.
- Riesgo de contenido dañino: el etiqueta "UNCENSORED" implica que el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtro, lo que es inaceptable en entornos de producción.
- Alucinaciones y sesgos: no hay evidencia de que el finetune haya mitigado los sesgos del modelo base ni el riesgo de alucinación, que puede ser elevado en modelos de 9B.
- Soporte multimodal limitado: el proyector mmproj es un añadido del autor, no está claro si el finetune mantiene la calidad de visión del modelo base.
- Reputación y confianza: el modelo fue publicado con 0 descargas y 0 likes, lo que indica una ausencia de validación por parte de la comunidad.
- Compatibilidad incierta: el nombre "Qwen3.5-9B" sugiere una versión de Qwen que no es pública oficialmente (hasta la fecha de la búsqueda), lo que puede indicar que el modelo base no es oficial o es un renombrado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Smithkh4/Project_K
- Perfil del autor: https://huggingface.co/Smithkh4
- Unsloth (herramienta de finetune): https://github.com/unslothai/unsloth

Nota: los resultados de búsqueda web sobre "Project K" se refieren a un proyecto de IA médica del Sheba Medical Center, sin relación con este modelo. No se han incluido en los enlaces por falta de relevancia.
