# keXjos/Ornith-1.5-9B-uncensored-mlx-5Bit

## Resumen

Ornith-1.5-9B-uncensored-mlx-5Bit es una conversión al formato MLX (5-bit) del modelo base `junafinity/Ornith-1.5-9B-uncensored`, realizado por el usuario keXjos. El modelo original pertenece a la familia Ornith-1.5, desarrollada por el laboratorio Ornith AI, que se presenta como un conjunto de modelos multimodales (texto e imagen) capaces de conversación y generación de contenido. La versión «uncensored» ha sido sometida a técnicas de abliteración y zerofuse para eliminar las restricciones de contenido habituales en los modelos comerciales.

El modelo se distribuye con licencia Apache 2.0 y está orientado a entornos Apple Silicon mediante el framework MLX. Su tamaño nominal es de ~9B parámetros (dato del modelo base), aunque el archivo safetensors del repositorio reporta 1.679.700.480 parámetros, lo que sugiere una posible discrepancia en la documentación. La arquitectura se basa en Qwen3.5 (tag `qwen3_5`) y soporta entrada multimodal (imagen y texto).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5) |
| Parámetros totales | ~9B (según documentación del modelo base); safetensors reporta 1.679.700.480 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 5-bit (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión directa a MLX del checkpoint `junafinity/Ornith-1.5-9B-uncensored`, realizado con la librería `mlx-lm` versión 0.31.2. El modelo original pertenece a la familia Ornith-1.5, que según el sitio oficial emplea un enfoque de «auto-mejora» (self-improvement): el modelo propone nuevas tareas, genera andamios (scaffolds) específicos para cada tarea y produce soluciones que se utilizan para entrenamiento por refuerzo. No se dispone de detalles adicionales sobre el corpus de entrenamiento, número de tokens o técnicas de RLHF/DPO en la información proporcionada.

La etiqueta `abliterated` indica que se aplicó una técnica de ablación para eliminar la censura del modelo base, mientras que `zerofuse` sugiere un método de fusión de capas o de ajuste de pesos para preservar capacidades. Al ser una conversión MLX, la arquitectura interna es la misma que la del modelo original (transformador multimodal), pero no se han publicado detalles técnicos específicos de esta versión.

## Capacidades

- Generación de texto y conversación multimodal (entrada de imagen y texto).
- Procesamiento de imágenes en combinación con texto (pipeline `image-text-to-text`).
- Capacidad de seguir instrucciones y mantener diálogos multi-turno (etiqueta `conversational`).
- Al ser una versión «uncensored», no aplica restricciones de contenido habituales (tema, lenguaje, temáticas sensibles).
- Soporte de cuantización 5-bit para despliegue eficiente en hardware Apple Silicon.
- Integración con `mlx-lm` para inferencia local.

## Casos de uso

- **Asistentes de conversación sin filtros**: el modelo puede usarse en entornos donde se requiera libertad de expresión sin censura, como chatbots de investigación o herramientas de escritura creativa.
- **Análisis multimodal**: al aceptar entrada de imagen y texto, puede describir imágenes, responder preguntas sobre ellas o generar contenido a partir de una imagen.
- **Generación de contenido técnico**: aunque no está especializado en código, puede generar explicaciones, documentación o fragmentos de código si se le solicita.
- **Prototipado rápido en Apple Silicon**: al estar en formato MLX, es fácil de desplegar en Macs con chip M1/M2/M3 para pruebas de concepto de aplicaciones conversacionales.
- **Investigación sobre alineación y desensura**: el modelo «uncensored» sirve para estudiar el impacto de técnicas como abliteration y zerofuse en el comportamiento de modelos de lenguaje.
- **Evaluación de la robustez multimodal**: al ser una variante de Qwen3.5, puede usarse para comparar capacidades de visión-lenguaje con otros modelos de su tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- **VRAM estimada**: al ser una cuantización 5-bit de un modelo de ~9B, ocupa aproximadamente 6.2 GB en disco (tamaño del repositorio). La memoria necesaria para inferencia dependerá del contexto y la carga, pero puede caber en Macs con al menos 16 GB de RAM unificada (Apple Silicon).
- **GPU recomendadas**: está diseñado para Apple Silicon (M1, M2, M3 y posteriores). No es adecuado para GPUs NVIDIA o AMD sin el framework MLX.
- **Compatibilidad con consumer GPU**: solo funciona en hardware Apple Silicon (Macs, iPads con Apple Silicon).
- **Opciones de despliegue**: mediante `mlx-lm` (Python) o servidores compatibles con OpenAI como los mencionados en la documentación de Ornith (con `--tensor-parallel-size` si se desea sharding).
- **Latencia y throughput**: no se dispone de datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | ~9B | No disponible | MIT (según web) | bf16, GGUF, MLX | HuggingFace |
| Ornith-1.5-9B-MLX-6bit | ~9B | No | MIT | MLX 6-bit | HuggingFace |
| Qwen2.5-7B (dense) | 7.6B | 128k | Apache 2.0 | bf16, GGUF | HuggingFace |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 License | bf16, GGUF | HuggingFace |

La comparativa es limitada porque no hay datos de rendimiento publicados para este modelo. Los modelos Qwen2.5-7B y Llama 3.1 8B son alternativas densas de tamaño similar, pero no incluyen capacidades multimodales ni la característica «uncensored».

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo «uncensored», puede generar contenido falso, inapropiado o dañino sin filtros. No debe usarse en entornos de producción sin moderación.
- **Riesgo de alucinación**: no se dispone de datos sobre su fiabilidad factual; es probable que tenga tasas de error similares a otros modelos de su tamaño.
- **Limitaciones de contexto**: no se especifica la longitud de contexto; puede ser limitada (típica de modelos de 9B).
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el modelo base parece tener licencia MIT según el sitio de Ornith; sin embargo, esta versión específica usa Apache 2.0, lo que permite uso comercial, pero la variante «uncensored» puede tener implicaciones éticas.
- **Dependencia de hardware**: solo funciona en Apple Silicon; no es portable a entornos GPU convencionales.
- **Falta de documentación**: no se proporcionan detalles de entrenamiento, datos de evaluación ni configuraciones de inferencia.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/keXjos/Ornith-1.5-9B-uncensored-mlx-5Bit)
- [Modelo base en HuggingFace](https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored)
- [Página oficial de Ornith AI](https://ornith.ai/)
- [Blog de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Ornith-1.5-9B-MLX-6bit (referencia)](https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-6bit)
