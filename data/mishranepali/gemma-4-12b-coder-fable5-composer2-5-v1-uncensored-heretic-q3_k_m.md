# MishraNepali/gemma-4-12B-coder-fable5-composer2.5-v1-uncensored-heretic-Q3_K_M

## Resumen

Esta ficha corresponde a una cuantización **Q3_K_M en formato GGUF** del modelo `llmfan46/gemma-4-12B-coder-fable5-composer2.5-v1-uncensored-heretic`, publicada por el usuario MishraNepali en Hugging Face. Se trata de un modelo de generación de texto de unos 12.000 millones de parámetros (11.907.350.576 según los safetensors originales), derivado de la familia Gemma, orientado a programación (coder) y con etiquetas que apuntan a ciberseguridad y a un comportamiento "uncensored" (sin las restricciones de alineación habituales).

El valor de esta variante no está en capacidades nuevas, sino en la reducción drástica de requisitos de hardware: la conversión de safetensors (unos 24 GB) a GGUF Q3_K_M deja el fichero en unos 5,53 GB, lo que permite ejecutarlo en CPU con 8 GB de RAM (recomendados 16 GB) o en Google Colab. Es relevante para desarrolladores que quieren probar modelos de esta familia en estaciones de trabajo sin GPU dedicada.

Hay que subrayar que se trata de un modelo de terceros sin documentación técnica detallada: la model card del cuantizador es mínima, no hay datos de benchmarks, y el propio autor advierte de que la cuantización agresiva (Q3_K_M) puede aumentar las alucinaciones. Su uso exige cautela, especialmente por la etiqueta "uncensored".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Gemma (transformer decoder); detalles no disponibles |
| Parametros totales | 11.907.350.576 (11,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | Recomendada por el autor: 1024 tokens (o superior si el hardware lo permite); máxima no disponible |
| Tipos de cuantizacion | Q3_K_M (GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors) |

## Arquitectura y entrenamiento

El modelo base (`llmfan46/gemma-4-12B-coder-fable5-composer2.5-v1-uncensored-heretic`) es un derivado de la familia Gemma de 12B, con un linaje que sugiere fusiones o ajustes orientados a código ("coder") y a la eliminación de salvaguardas ("uncensored", "heretic"). No se dispone de información publicada sobre el número de tokens de entrenamiento, composición del dataset ni sobre procesos de RLHF/DPO.

La contribución de MishraNepali es puramente técnica: conversión de safetensors a GGUF mediante llama.cpp y cuantización a Q3_K_M, un esquema de cuantización de 3 bits con mezcla de precisiones que reduce el tamaño de 24 GB a 5,53 GB. Este nivel de cuantización es agresivo y conlleva pérdida medible de calidad respecto al modelo original, algo que el propio autor reconoce al advertir de un mayor riesgo de alucinación.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Generación y asistencia de código, según la denominación "coder" del modelo base.
- Orientación temática a ciberseguridad, según las etiquetas del repositorio.
- Comportamiento "uncensored": sin las restricciones de seguridad típicas de los modelos alineados, lo que amplía el rango de respuestas pero incrementa los riesgos de uso indebido.
- Inferencia en CPU gracias al formato GGUF y a la cuantización Q3_K_M.
- Capacidades multilingües, vision o audio: no disponibles (sin documentación).

## Casos de uso

- **Prototipado de modelos uncensored en hardware modesto:** ejecutar un modelo de 12B en un portátil o PC de oficina con 8-16 GB de RAM, sin GPU, usando llama.cpp u Ollama.
- **Experimentación en Google Colab:** el tamaño de 5,53 GB permite cargarlo en una sesión gratuita o de bajo coste para pruebas rápidas.
- **Generación de código asistida en local:** uso como asistente de programación offline, aprovechando la orientación "coder" del modelo base, ideal para entornos sin conexión.
- **Investigación en seguridad ofensiva/defensiva:** análisis y generación de texto técnico sobre ciberseguridad donde los filtros de un modelo alineado resultarían restrictivos, siempre en contextos legítimos y legales.
- **Evaluación de impacto de la cuantización:** comparar las respuestas de la versión Q3_K_M frente al modelo original en FP16 para medir la degradación por cuantización a 3 bits.
- **Integración en pipelines locales con llama.cpp:** servir el modelo vía servidor llama.cpp con la API de OpenAI compatible para aplicaciones locales de chat o automatización.
- **Estudio de alineación y "abliteration":** el linaje "heretic/uncensored" lo hace útil para investigar cómo la eliminación de salvaguardas afecta al comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **RAM/VRAM estimada:** unos 5,53 GB solo para los pesos; con contexto y overhead de inferencia, el autor indica que funciona en CPU con 8 GB de RAM, recomendándose 16 GB.
- **GPU recomendadas:** no es necesario usar GPU; si se desea aceleración, cualquier GPU con 6-8 GB de VRAM (por ejemplo RTX 3060 de 12 GB o superior) permitirá descarga parcial o total de capas.
- **Consumer GPU:** cabe cómodamente en GPUs de gama media y alta; también es plenamente viable en CPU puro, que es el objetivo declarado de esta cuantización.
- **Despliegue:** llama.cpp (librería nativa del repo), Ollama, LM Studio, o cualquier runtime compatible con GGUF; también ejecutable en Google Colab.
- **Latencia y throughput:** no disponibles; en CPU con 8-16 GB de RAM debe esperarse una generación lenta (del orden de pocos tokens por segundo) típica de un modelo de 12B a 3 bits sin GPU.
- **Contexto:** el autor recomienda una ventana de 1024 tokens por defecto, ampliable si el hardware lo permite.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-12B-coder-fable5-composer2.5-v1-uncensored-heretic Q3_K_M (esta ficha) | 11,9 B | GGUF Q3_K_M (~5,53 GB) | 1024 recomendados | Apache 2.0 | Uncensored, orientado a código y ciberseguridad, CPU-friendly |
| Gemma 3 12B IT (Google) | 12 B | GGUF Q4_K_M y otros | 128K | Licencia Gemma | Modelo oficial, alineado, con visión y multilingüe |
| Qwen2.5-Coder 14B Instruct | 14,8 B | GGUF Q3_K_M / Q4_K_M | 32K (128K con YaRN) | Apache 2.0 | Especializado en código, con benchmarks publicados |

La comparativa es aproximada: los datos de rendimiento de esta variante no están disponibles, por lo que no puede afirmarse que compita en calidad con los modelos oficiales citados.

## Limitaciones y advertencias

- **Mayor riesgo de alucinación:** el propio autor advierte de que la cuantización Q3_K_M puede provocar alucinaciones; la calidad es inferior a la del modelo original en FP16.
- **Contenido sin filtrar ("uncensored"):** el modelo puede generar contenido ofensivo, peligroso o ilícito sin las salvaguardas habituales. Su uso requiere filtros adicionales en la capa de aplicación y responsabilidad legal plena del operador.
- **Contexto muy corto recomendado:** la ventana sugerida de 1024 tokens limita seriamente tareas de contexto largo, RAG o conversaciones extensas.
- **Procedencia opaca del modelo base:** el linaje "heretic" implica modificaciones de alineación no documentadas en detalle; no hay model card técnica del modelo base en la información disponible.
- **Sin benchmarks ni evaluaciones:** no existen métricas publicadas (MMLU, HumanEval, etc.), por lo que su calidad es desconocida y no comparable de forma objetiva.
- **Cuantización agresiva:** a 3 bits se degradan especialmente el razonamiento matemático, el código preciso y los idiomas distintos del inglés.
- **Idiomas:** no documentados; asumir predominio del inglés.
- **Licencia:** Apache 2.0 permite uso comercial, pero la procedencia del modelo base y sus modificaciones deben verificarse antes de cualquier despliegue en producción.
- **Bajo uso comunitario:** 364 descargas y 0 likes indican ausencia de validación comunitaria; no se recomienda para producción.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/MishraNepali/gemma-4-12B-coder-fable5-composer2.5-v1-uncensored-heretic-Q3_K_M
- Modelo base: https://huggingface.co/llmfan46/gemma-4-12B-coder-fable5-composer2.5-v1-uncensored-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
