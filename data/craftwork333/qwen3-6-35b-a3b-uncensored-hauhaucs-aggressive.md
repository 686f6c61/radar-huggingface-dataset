# Craftwork333/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive es una variante sin censura del modelo multimodal Qwen3.6-35B-A3B, desarrollada por HauhauCS y publicada en HuggingFace bajo el espacio de Craftwork333. El modelo base, creado por Alibaba, es una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por paso, diseñada para procesamiento de texto, imagen y vídeo. Esta variante aplica técnicas de ablación de rechazos (abliteration) para eliminar las respuestas de rechazo del modelo, logrando un 0/465 de rechazos en pruebas de seguridad, sin modificar los datos de entrenamiento ni las capacidades originales.

El modelo destaca por su contexto nativo de 262 000 tokens, su arquitectura híbrida de atención lineal y softmax en proporción 3:1, y su disponibilidad en cuantizaciones GGUF optimizadas con matriz de importancia (imatrix), incluyendo las cuantizaciones personalizadas K_P de HauhauCS. Es una opción para desarrolladores que necesitan un modelo multimodal de alto rendimiento sin restricciones de contenido, aunque esto implica asumir riesgos éticos y legales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: atención lineal + atención softmax completa (proporción 3:1) |
| Parametros totales | 34 660 610 688 (aprox. 35B) |
| Parametros activos | ~3B por paso (8 de 256 expertos activados por token) |
| Longitud de contexto | 262 000 tokens (nativo) |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M, mmproj-f16 |
| Idiomas soportados | Inglés, chino, multilingüe (en, zh, multilingual) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base Qwen/Qwen3.6-35B-A3B) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con 256 expertos, de los cuales se activan 8 por token (routing), y 40 capas. La innovación clave es la combinación de atención lineal (lineal attention) y atención softmax completa en una proporción 3:1, lo que permite manejar secuencias largas (262K tokens) con un coste computacional reducido en comparación con la atención estándar. El modelo base fue entrenado por Alibaba con datos multilingües y multimodales (texto, imagen, vídeo), y la variante uncensored se generó mediante abliteración, una técnica que modifica los pesos del modelo para eliminar los patrones de rechazo sin alterar el conjunto de datos ni las capacidades. No se dispone de información detallada sobre el número de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO en la variante.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo un modo de pensamiento (thinking mode) que puede activarse o desactivarse.
- Procesamiento multimodal: entrada de imagen y vídeo, además de texto, con proyección de visión mediante el archivo mmproj.
- Generación de código y resolución de tareas matemáticas, según las capacidades del modelo base.
- Soporte multilingüe para inglés, chino y otros idiomas.
- Sin rechazos: el modelo no rechaza peticiones, incluso aquellas que el modelo base bloquearía (variante agresiva).
- Compatible con herramientas de inferencia GGUF como llama.cpp y LM Studio, con soporte para plantillas de chat mediante el flag `--jinja`.

## Casos de uso

- Generación de código sin restricciones: el modelo puede producir scripts, exploits o código malicioso sin filtros de seguridad, útil para pruebas de penetración en entornos controlados o para investigación en ciberseguridad, siempre que se use con responsabilidad legal.
- Análisis de documentos largos: su contexto de 262K tokens permite procesar libros completos, expedientes o historiales clínicos de una sola pasada, extrayendo información y generando resúmenes.
- Asistente de programación multimodal: puede analizar capturas de pantalla de código o diagramas de arquitectura, y generar soluciones sin restricciones de contenido, adecuado para prototipos rápidos.
- Investigación en IA de seguridad: permite estudiar cómo se comporta un modelo sin capas de rechazo, evaluando sesgos, alucinaciones o comportamientos indeseados en entornos aislados.
- Traducción y localización de contenido técnico: su soporte multilingüe y contexto largo facilita la traducción de manuales o documentación técnica extensa, con precisión en jerga especializada.
- Generación de contenido creativo sin filtros: para escritores que necesitan explorar temas controvertidos o explícitos en narrativa, sin que el modelo se niegue a responder, siempre que se respete la legislación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otros indicadores para esta variante. El modelo base Qwen3.6-35B-A3B sí dispone de benchmarks en su página oficial, pero no se han replicado aquí para la versión uncensored.

## Requisitos de hardware

- VRAM estimada según cuantización: con IQ4_XS (19 GB de tamaño de archivo) el modelo puede ejecutarse en una RTX 4070 Ti de 12 GB VRAM, según un blog de usuario (Andreas Mausch, junio 2026). Con cuantizaciones más pequeñas como IQ2_M (11 GB) puede caber en GPUs con 8-12 GB, aunque con pérdida de calidad.
- Para cuantizaciones altas como Q8_K_P (44 GB) se necesita una GPU con al menos 48 GB VRAM (por ejemplo, A6000, A100) o múltiples GPUs.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M o Q5_K_M; A100 80 GB para Q8_K_P; H100 para máxima velocidad.
- El modelo es compatible con llama.cpp, LM Studio y cualquier runtime GGUF. Para uso en producción con API se recomienda vLLM (si se convierte a safetensors) o TGI.
- La latencia y el throughput no se especifican en la información disponible, pero al ser un modelo MoE con solo 3B activos, el rendimiento en inferencia es notablemente superior al de un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 262K | Apache-2.0 | safetensors | Modelo original con guardarraíles |
| Qwen3.6-35B-A3B-Uncensored (esta variante) | 35B | ~3B | 262K | Apache-2.0 | GGUF | Sin rechazos, variante agresiva |
| Mixtral 8x7B | 46,7B | ~12B | 32K | Apache-2.0 | GGUF/safetensors | MoE densa, sin multimodalidad |
| Qwen3-30B-A3B (versión anterior) | 30B | ~3B | 128K | Apache-2.0 | GGUF | Modelo MoE de la generación anterior, sin visión |

No se dispone de comparativas de rendimiento numérico porque la variante no ha publicado benchmarks. La comparación se basa en especificaciones técnicas.

## Limitaciones y advertencias

- La ausencia de rechazos implica que el modelo puede generar contenido ilegal, dañino o éticamente inaceptable (violencia, instrucciones para fabricar armas, discurso de odio, etc.). El usuario es el único responsable de su uso.
- La técnica de abliteración puede degradar sutilmente el rendimiento en tareas que dependen de la seguridad, aunque el autor afirma que las capacidades se mantienen al 100%.
- El modelo puede alucinar más fácilmente en contextos largos, especialmente cuando se superan los 128K tokens, aunque el contexto nativo sea 262K.
- No se garantiza la calidad de las respuestas en todos los idiomas; el inglés y el chino son los mejor soportados.
- La variante "agresiva" puede añadir descargos de responsabilidad breves (derivados del entrenamiento base) pero no rechaza la generación.
- La licencia Apache-2.0 permite uso comercial, pero el uso de contenido generado puede violar leyes de propiedad intelectual o normativas locales.
- Para uso en producción, es imprescindible implementar filtros adicionales de moderación si se despliega en aplicaciones públicas.

## Enlaces

- Modelo en HuggingFace (Craftwork333): https://huggingface.co/Craftwork333/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Andreas Mausch sobre ejecución en RTX 4070 Ti: https://andreas-mausch.de/blog/2026-06-01-localllm/
- Artículo de HackerNoon: https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context
- Repositorio en GitHub: https://github.com/chenfei66/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
