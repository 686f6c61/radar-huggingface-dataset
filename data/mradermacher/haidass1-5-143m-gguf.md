# mradermacher/Haidass1.5-143M-GGUF

## Resumen

Haidass1.5-143M es un modelo de lenguaje pequeño (143 millones de parámetros) desarrollado por la comunidad DALabCommunity, del cual este repositorio ofrece una versión cuantizada en formato GGUF preparada por mradermacher. El modelo está entrenado para soportar chino e inglés, y su tamaño reducido lo hace adecuado para entornos con recursos limitados, como dispositivos edge o inferencia en CPU. La cuantización GGUF permite ejecutarlo con herramientas como llama.cpp, Ollama o LM Studio, reduciendo aún más el consumo de memoria sin un deterioro excesivo de la calidad.

La relevancia de este modelo radica en su accesibilidad: al ser de 143M y estar disponible en múltiples niveles de cuantización (desde Q2_K hasta f16), puede desplegarse en hardware modesto, incluso sin GPU. Sin embargo, al ser un modelo pequeño, sus capacidades de razonamiento y generación son limitadas en comparación con modelos de mayor escala. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, dado el uso de la librería transformers) |
| Parametros totales | 143.071.296 (143M) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ4_XS, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (DALabCommunity/Haidass1.5-143M). Dado que utiliza la librería transformers y tiene 143M de parámetros, es razonable asumir una arquitectura transformer estándar, pero no se confirma en la documentación proporcionada.

En cuanto al entrenamiento, la model card del repositorio cuantizado indica que el modelo base fue entrenado sobre una combinación de datasets públicos: openbmb/Ultra-FineWeb, openbmb/Ultra-FineWeb-L3, mlfoundations/dclm-baseline-1.0-parquet, HuggingFaceTB/finemath y HuggingFaceTB/cosmopedia. Estos datasets cubren texto web general, datos matemáticos y contenido sintético, lo que sugiere un entrenamiento orientado a tareas de lenguaje general y razonamiento básico. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en chino e inglés: el modelo es bilingüe y puede producir texto coherente en ambos idiomas.
- Comprensión de lenguaje natural básica: al ser un modelo pequeño, puede realizar tareas simples como clasificación, extracción de información o respuesta a preguntas sencillas.
- Razonamiento matemático elemental: gracias a la inclusión del dataset finemath, puede resolver operaciones aritméticas y problemas matemáticos simples.
- No se ha confirmado soporte para tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode). Tampoco hay evidencia de capacidades multimodales (visión, audio).

## Casos de uso

- Clasificación de texto en entornos con recursos limitados: por su tamaño y cuantización, puede ejecutarse en CPU para etiquetar documentos, análisis de sentimiento o detección de spam en chino e inglés.
- Generación de respuestas automáticas en chatbots sencillos: integrable en sistemas de atención al cliente básicos donde no se requiera un razonamiento complejo y el presupuesto de hardware sea reducido.
- Asistente de escritura en dispositivos móviles o embebidos: al ocupar menos de 0,5 GB en cuantizaciones bajas, puede funcionar en smartphones o Raspberry Pi para sugerencias de texto o corrección ortográfica.
- Preprocesamiento de datos: extracción de entidades, normalización de texto o traducción aproximada entre chino e inglés en pipelines de datos.
- Educación y experimentación: útil para estudiantes que quieran entender el funcionamiento de modelos de lenguaje sin necesidad de GPUs caras.
- Prototipado rápido: permite validar ideas de productos de IA generativa antes de escalar a modelos más grandes, gracias a su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: con cuantizaciones Q4_K_M o inferiores, el modelo ocupa aproximadamente 0,2 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin VRAM.
- GPU recomendadas: cualquier GPU moderna (incluso integradas) es suficiente; una NVIDIA GTX 1650 o superior sería más que adecuada.
- Compatibilidad con consumer GPU: sí, absolutamente. También funciona en CPU con 4 GB de RAM o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF. También puede usarse con transformers si se convierte a safetensors.
- Latencia y throughput: al ser un modelo de 143M, la generación es muy rápida; en CPU moderna se pueden alcanzar decenas de tokens por segundo, y en GPU, cientos. No se dispone de cifras exactas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (por ejemplo, TinyLlama, Qwen1.5-0.5B o SmolLM). No se conocen datos de rendimiento ni especificaciones detalladas de Haidass1.5-143M que permitan una comparación objetiva.

## Limitaciones y advertencias

- Al ser un modelo de solo 143M, su capacidad de razonamiento, coherencia y conocimiento general es muy limitada en comparación con modelos de 1B o más parámetros.
- Riesgo de alucinaciones: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados.
- Sesgos: al entrenarse con datos web públicos, puede heredar sesgos presentes en esos corpus, aunque no se ha realizado una auditoría específica.
- Longitud de contexto desconocida: no se ha especificado, por lo que puede ser corta (típicamente 512-2048 tokens en modelos pequeños), lo que limita tareas que requieran contexto largo.
- Idiomas limitados: solo chino e inglés; no soporta otros idiomas de forma fiable.
- Sin garantías de producción: al no haber benchmarks publicados, no se recomienda su uso en aplicaciones críticas sin una evaluación previa exhaustiva.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento de las condiciones de los datasets de entrenamiento originales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Haidass1.5-143M-GGUF
- Modelo base (safetensors): https://huggingface.co/DALabCommunity/Haidass1.5-143M
- Página de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
