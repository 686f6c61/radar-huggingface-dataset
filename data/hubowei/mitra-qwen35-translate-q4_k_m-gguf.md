# hubowei/mitra-qwen35-translate-Q4_K_M-GGUF

## Resumen

El modelo `hubowei/mitra-qwen35-translate-Q4_K_M-GGUF` es una cuantización en formato GGUF del modelo `buddhist-nlp/mitra-qwen35-translate`, diseñado específicamente para tareas de traducción de textos budistas y lenguas clásicas (tibetano, sánscrito, pali, chino clásico) junto con idiomas modernos (chino, japonés, inglés, coreano). Fue convertido mediante la herramienta `gguf-my-repo` de llama.cpp, lo que permite su ejecución eficiente en CPU y GPU con bajo consumo de memoria. El modelo base pertenece a la familia Qwen3.5, con aproximadamente 8.950 millones de parámetros, y está publicado bajo licencia Apache 2.0.

Esta versión cuantizada con el esquema Q4_K_M reduce el tamaño del repositorio a 5.6 GB, facilitando su despliegue en entornos con recursos limitados. Aunque el modelo original no es accesible directamente en HuggingFace, esta conversión GGUF permite usar el modelo con herramientas como llama.cpp, Ollama o vLLM. Su relevancia radica en ofrecer una solución especializada para la traducción de textos religiosos y académicos, un nicho poco cubierto por los traductores genéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen3.5, probablemente transformer) |
| Parámetros totales | 8.953.804.264 (≈8.95B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única disponible en este repositorio) |
| Idiomas soportados | bo (tibetano), sa (sánscrito), pi (pali), zh (chino), ja (japonés), en (inglés), ko (coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura interna del modelo base `buddhist-nlp/mitra-qwen35-translate`. Según los metadatos y la etiqueta `qwen3_5`, se presume que es una variante de la serie Qwen3.5, que emplea una arquitectura transformer estándar con atención multi-cabeza, aunque no se confirma si incorpora innovaciones como decodificación especulativa o atención lineal. El proceso de conversión a GGUF mediante llama.cpp no altera los pesos originales, solo los cuantiza a Q4_K_M (4 bits con bloque de 256, mejorando la precisión respecto a Q4_0).

No se dispone de datos sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El modelo se centra en la traducción de lenguas clásicas budistas, lo que sugiere un corpus especializado, pero los detalles no están disponibles en la documentación actual.

## Capacidades

- Traducción automática entre lenguas clásicas budistas: tibetano (bo), sánscrito (sa), pali (pi) y chino clásico (zh).
- Traducción hacia y desde idiomas modernos: chino moderno, japonés (ja), inglés (en) y coreano (ko).
- Generación de texto en modo traducción, sin soporte explícito de tool calling o agentes (no se menciona en la documentación).
- Capacidades multilingües restringidas al conjunto de idiomas listados; no se garantiza el soporte de otros idiomas.
- No se indica soporte de visión, audio ni razonamiento avanzado más allá de la traducción.

## Casos de uso

- Traducción de textos budistas clásicos: el modelo puede traducir sutras en tibetano o sánscrito al español, inglés o chino, facilitando el trabajo de investigadores y traductores académicos.
- Estudio comparativo de manuscritos: al traducir entre pali y chino clásico, permite comparar versiones de textos canónicos y detectar variantes.
- Localización de contenido religioso: para plataformas que publican enseñanzas budistas en múltiples idiomas, el modelo ofrece traducciones rápidas y coherentes.
- Asistencia en la enseñanza de lenguas clásicas: estudiantes pueden usar el modelo para verificar traducciones de textos en tibetano o sánscrito durante su aprendizaje.
- Traducción de literatura histórica: para proyectos de digitalización de textos antiguos en chino clásico, el modelo ayuda a crear versiones modernas en inglés o japonés.
- Integración en pipelines de procesamiento de documentos: al ser GGUF, puede desplegarse con llama.cpp o vLLM en servicios de traducción automatizada para archivos de texto o PDF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo. El único dato de rendimiento es el tamaño del archivo (5.6 GB) y la cuantización Q4_K_M, que reduce la memoria y acelera la inferencia en comparación con el modelo de precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: con Q4_K_M y 8.95B de parámetros, el modelo ocupa aproximadamente 4.5-5 GB en memoria (peso + contexto). En CPU, se necesitan unos 6-7 GB de RAM.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3070/3080, RTX 4060 Ti, A10G, o superiores. Para GPU con menos de 6 GB, se puede usar solo CPU.
- Compatibilidad con hardware de consumo: sí, cabe en tarjetas como RTX 3060 (12 GB) o RTX 4060 (8 GB) sin problema.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (si se importa el GGUF), vLLM (con adaptador para GGUF), o llamafile. También puede usarse con llama-cpp-python.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU RTX 3090, se espera un throughput de 20-30 tokens/s para generación de texto, pero depende del contexto y de la implementación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para traducción de lenguas budistas. Sin embargo, se puede comparar con traductores genéricos de tamaño similar, como NLLB-200 (multilingüe, 600M-54B) o M2M100 (418M-12B), pero estos no están especializados en lenguas clásicas. No se puede hacer una comparación justa por falta de datos del modelo base. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos desconocidos: no hay información sobre el corpus de entrenamiento, por lo que pueden existir sesgos en las traducciones de textos religiosos o filosóficos.
- Riesgo de alucinación: como todo LLM, puede generar traducciones incorrectas o inventar términos cuando el texto fuente es ambiguo.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto; probablemente es de 32k o 128k según la familia Qwen3.5, pero no confirmado.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el modelo base puede tener restricciones adicionales si proviene de Qwen (Apache-2.0 también, así que es seguro).
- Caveat para producción: al ser una cuantización Q4_K_M, se pierde algo de calidad en comparación con el modelo original. Se recomienda validar las traducciones en contextos críticos.

## Enlaces

- Repositorio HuggingFace: [hubowei/mitra-qwen35-translate-Q4_K_M-GGUF](https://huggingface.co/hubowei/mitra-qwen35-translate-Q4_K_M-GGUF)
- Modelo base (sin cuantizar): [buddhist-nlp/mitra-qwen35-translate](https://huggingface.co/buddhist-nlp/mitra-qwen35-translate)
- Herramienta de conversión GGUF-my-repo: [ggml-org/gguf-my-repo](https://huggingface.co/spaces/ggml-org/gguf-my-repo)
- Repositorio llama.cpp: [ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)
- Colección Qwen3.5 en HuggingFace: [Qwen/Qwen3.5](https://huggingface.co/collections/Qwen/qwen35)
- Proyecto qwen-translate-api (ejemplo de uso con Qwen3.5): [t04aiteam/qwen-translate-api](https://github.com/t04aiteam/qwen-translate-api)
