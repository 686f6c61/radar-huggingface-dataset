# McG-221/Qwen3.8-27B-heretic-mlx-8Bit

## Resumen

El modelo **McG-221/Qwen3.8-27B-heretic-mlx-8Bit** es una conversión al formato MLX (Machine Learning eXchange, el framework de Apple para aceleración en chips M) del modelo `darkc0de/Qwen3.8-27B-heretic`, realizado con la librería `mlx-lm` en su versión 0.31.2. Se trata de una variante "heretic" del modelo Qwen3.8-27B, lo que implica que ha sido sometido a técnicas de *abliteration* para eliminar los mecanismos de rechazo y censura del modelo original, dando lugar a un sistema de generación de texto sin restricciones aparentes.

A pesar de que el nombre sugiere 27 mil millones de parámetros, los pesos reales en safetensors suman **7.566.401.024 parámetros** (aproximadamente 7,5 mil millones), lo que indica que se trata de un modelo denso de tamaño medio, no un MoE. El pipeline declarado es `image-text-to-text`, por lo que es un modelo multimodal capaz de procesar imágenes y texto. Su relevancia radica en que permite ejecutar un modelo multimodal "sin censura" en hardware Apple Silicon con una cuantización de 8 bits, facilitando su uso local en entornos de investigación y experimentación.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el carácter "uncensored" del modelo introduce consideraciones éticas y de seguridad importantes para su despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto), basada en Qwen3.8-27B con codificador de visión. Detalles específicos no disponibles. |
| Parametros totales | 7.566.401.024 (aprox. 7,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un modelo transformer multimodal de la familia Qwen3.8-27B, con un codificador de visión que permite procesar entradas de imagen junto con texto. El modelo base `darkc0de/Qwen3.8-27B-heretic` ha sido modificado mediante técnicas de *abliteration* (eliminación de direcciones de rechazo) para reducir o eliminar la censura y los mecanismos de alineación de seguridad presentes en el modelo original. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni sobre la aplicación de RLHF o DPO. La conversión a MLX se realizó con `mlx-lm` 0.31.2, manteniendo los pesos en precisión de 8 bits, lo que reduce el tamaño del modelo a aproximadamente 7,5 GB en disco (el repositorio ocupa 28,6 GB, probablemente incluyendo archivos adicionales o múltiples shards).

No se han publicado detalles sobre innovaciones técnicas específicas en la arquitectura, como atención lineal o decodificación especulativa. La principal característica diferencial es el proceso de *abliteration* aplicado al modelo base.

## Capacidades

- Procesamiento de imágenes y texto (pipeline `image-text-to-text`).
- Generación de texto libre, sin restricciones aparentes de contenido (etiquetado como "uncensored", "decensored", "abliterated").
- Conversación multi-turno, gracias a la plantilla de chat compatible con `apply_chat_template`.
- No se especifica soporte para tool calling, function calling, ni razonamiento multi-paso explícito.
- Capacidades multilingües no documentadas.
- No se mencionan modos especiales de pensamiento (*thinking mode*), ni capacidades de audio o vídeo más allá de imagen estática.

## Casos de uso

- **Investigación sobre alineación y seguridad en IA**: al ser un modelo *abliterated*, permite estudiar los efectos de la eliminación de la censura en los comportamientos generativos, comparando respuestas con el modelo original.
- **Análisis de imágenes en entornos controlados**: puede utilizarse para generar descripciones detalladas de imágenes en contextos donde no se requieran filtros de contenido, como investigación académica sobre visión artificial.
- **Generación de contenido creativo sin restricciones**: para escritura de ficción, guiones o material artístico donde se necesite explorar temas tabú o controvertidos, siempre en entornos de uso personal o experimental.
- **Prototipado de asistentes conversacionales en Apple Silicon**: gracias a su formato MLX y cuantización 8-bit, puede ejecutarse localmente en Macs con chips M, permitiendo pruebas rápidas de chatbots personalizados.
- **Evaluación de robustez de modelos multimodales**: su comportamiento "sin censura" sirve como caso de prueba para sistemas de moderación y filtrado de contenido en aplicaciones de producción.
- **Educación y divulgación**: como ejemplo práctico de cómo se aplican técnicas de *abliteration* y cómo afectan al comportamiento de un LLM multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de ~7,5B parámetros en cuantización 8-bit, el tamaño de los pesos es aproximadamente 7,5 GB. En un Mac con memoria unificada, se recomienda al menos 16 GB de RAM para inferencia fluida (considerando overhead del runtime y activaciones).
- **GPU recomendadas**: exclusivamente Apple Silicon (chips M1, M2, M3, M4 y sucesores), ya que MLX está optimizado para la GPU integrada de estos procesadores. No es compatible con GPUs NVIDIA o AMD de forma nativa.
- **Compatibilidad con consumer GPU**: no aplica, al ser específico de Apple.
- **Opciones de despliegue**: mediante `mlx-lm` (Python) o integración en aplicaciones macOS/iOS. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI, salvo que se realice una conversión adicional a otros formatos (GGUF, etc.), lo cual no está incluido en este repositorio.
- **Latencia y throughput**: no disponibles. Dependerá del modelo de chip (M1 vs M4 Max, por ejemplo) y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (multimodales, ~7B, sin censura). Los modelos comparables como Qwen2.5-VL-7B, LLaVA-1.6-7B o CogVLM2-8B tienen arquitecturas y entrenamientos diferentes, y no existen datos de rendimiento de este modelo para contrastar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Contenido no censurado**: al ser un modelo *abliterated*, puede generar texto ofensivo, ilegal, peligroso o sexualmente explícito sin filtros. No es apto para uso en producción sin una capa adicional de moderación.
- **Riesgo de alucinación**: no hay datos de evaluación, pero como cualquier LLM, puede producir información falsa o inventada con alta confianza.
- **Limitaciones de contexto e idioma**: no se especifica la longitud máxima de contexto ni los idiomas soportados, lo que dificulta su uso en aplicaciones multilingües o con documentos largos.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el modelo base `darkc0de/Qwen3.8-27B-heretic` podría tener condiciones adicionales no documentadas. Se recomienda verificar la licencia del modelo original antes de un uso comercial.
- **Falta de documentación técnica**: no se proporcionan detalles sobre el entrenamiento, el dataset, ni los métodos de *abliteration* aplicados, lo que limita la reproducibilidad y la comprensión de sus capacidades reales.
- **Dependencia del ecosistema MLX**: solo puede ejecutarse en hardware Apple, lo que restringe su portabilidad a entornos Linux o Windows con GPUs convencionales.

## Enlaces

- [Repositorio HuggingFace: McG-221/Qwen3.8-27B-heretic-mlx-8Bit](https://huggingface.co/McG-221/Qwen3.8-27B-heretic-mlx-8Bit)
- [Modelo base: darkc0de/Qwen3.8-27B-heretic](https://huggingface.co/darkc0de/Qwen3.8-27B-heretic)
