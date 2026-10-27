# cortex-ai-nova/NOVA-OCR2

## Resumen

NOVA-OCR2 es un ajuste fino (fine-tune) del modelo DeepSeek-OCR-2 publicado por el usuario cortex-ai-nova en HuggingFace. Se trata de un modelo de visión-lenguaje con arquitectura deepseek_vl_v2, 3.389.119.360 parámetros (~3,39 mil millones) y pesos en safetensors, distribuido con licencia Apache 2.0. El pipeline declarado en la ficha es feature-extraction y el único idioma documentado es el inglés.

El modelo parte de la familia DeepSeek-OCR-2, orientada a reconocimiento óptico de caracteres y extracción de texto a partir de imágenes, y ha sido reentrenado con Unsloth y la librería TRL de HuggingFace, según indica el autor. La model card es mínima: no documenta el conjunto de datos de ajuste, el número de tokens de entrenamiento, la longitud de contexto ni resultados de evaluación, por lo que la información disponible para evaluar su calidad real es muy limitada.

Su relevancia actual es acotada: se publica como un derivado de un modelo OCR reciente, con licencia permisiva para uso comercial, pero sin benchmarks, sin variantes cuantizadas y sin validación comunitaria (0 descargas y 0 likes en el momento de la consulta). Resulta adecuado para experimentación controlada y para evaluar su comportamiento frente al modelo base, no como componente listo para producción sin una batería de pruebas propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje deepseek_vl_v2 (codificador visual + decodificador de lenguaje transformer) |
| Parametros totales | 3.389.119.360 (~3,39 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ documentadas |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/DeepSeek-OCR-2 |
| Pipeline declarado | feature-extraction |
| Tamano del repositorio | 6,8 GB |
| Herramientas de ajuste | Unsloth + TRL (HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura corresponde a deepseek_vl_v2, un esquema de visión-lenguaje que combina un codificador de imágenes con un decodificador de lenguaje de tipo transformer. El modelo es un fine-tune del checkpoint DeepSeek-OCR-2, por lo que hereda la estructura y el sesgo hacia tareas de lectura y extracción de texto en imágenes del modelo original. El autor declara que el entrenamiento se realizó con Unsloth y TRL, y que el proceso fue "2 veces más rápido" gracias a Unsloth, pero no aporta detalles sobre hiperparámetros, número de pasos, composición del dataset ni técnicas de alineación adicionales.

No hay información sobre el volumen de tokens de entrenamiento, la proporción de datos sintéticos frente a reales, el uso de RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta si el ajuste se limitó a un subconjunto de capas (LoRA/QLoRA) o si fue un entrenamiento completo. Cualquier afirmación sobre estos puntos sería especulativa y no debe asumirse en una evaluación técnica.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) y extracción de texto a partir de imágenes, por herencia del modelo base DeepSeek-OCR-2.
- Generación de texto condicionada a una entrada visual, siempre que la configuración de inferencia exponga el decodificador de lenguaje.
- Extracción de características (feature-extraction), que es el pipeline declarado oficialmente en la ficha del modelo.
- Procesamiento de documentos en inglés, único idioma documentado por el autor.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso ni modo "thinking".
- No se documentan capacidades de audio, vídeo ni visión general más allá del uso OCR.
- No se documenta soporte multilingüe; el autor declara únicamente `en`.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede recibir una imagen de página y devolver el texto reconocido, lo que permite integrarlo en un pipeline de conversión de PDF escaneado a texto plano para archivo y búsqueda posterior. Es adecuado por su origen OCR, aunque requiere validación propia al no haber benchmarks públicos.
- Extracción de campos en facturas y recibos: usando la imagen como entrada, se puede pedir la transcripción de importes, fechas y emisores; encaja en flujos de cuentas por pagar o gestión de gastos, siempre con una capa de validación posterior por el riesgo de error en campos críticos.
- Enriquecimiento de repositorios documentales: generación de texto indexable a partir de imágenes almacenadas en un sistema de gestión documental, para alimentar motores de búsqueda internos o sistemas RAG que necesiten texto plano como paso previo.
- Preprocesado para pipelines de NLP: uso del modelo como extractor de texto antes de aplicar clasificación, resumen o extracción de entidades con otros modelos; su tamaño de ~3,4 mil millones de parámetros permite desplegarlo en una GPU de gama media para esta función auxiliar.
- Automatización de tareas de accesibilidad: transcripción de material impreso o capturas de pantalla a texto para lectores de pantalla, en entornos donde el contenido esté mayoritariamente en inglés.
- Procesamiento por lotes en local: al publicarse con licencia Apache 2.0 y pesos safetensors, puede ejecutarse on-premise sobre documentos sensibles sin enviar imágenes a servicios externos, algo relevante en sectores regulados.
- Evaluación comparativa frente al modelo base: servir como punto de partida para medir, con un conjunto de validación propio, si el fine-tune mejora o degrada la calidad OCR de DeepSeek-OCR-2 en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, exactitud de OCR (CER/WER) ni comparaciones con el modelo base, y la búsqueda web realizada no ha devuelto documentación técnica del modelo.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: los pesos ocupan aproximadamente 6,8 GB (coincide con el tamaño del repositorio), por lo que conviene reservar entre 10 y 12 GB de VRAM para absorber activaciones y caché de atención en entradas de imagen. Es una estimación orientativa, no una cifra publicada por el autor.
- Cuantización a 8 bits: en torno a 3,5 GB de pesos; a 4 bits, alrededor de 2 GB. No obstante, no se publican variantes cuantizadas, por lo que habría que generarlas y validar que la arquitectura deepseek_vl_v2 las soporta correctamente.
- GPU recomendadas para producción: NVIDIA A100 (40/80 GB) o H100 para servir varias peticiones concurrentes; RTX 4090 (24 GB) como estación de trabajo para inferencia individual.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070/4080, siempre en FP16 y con una sola imagen por petición. En GPUs de 8 GB sería necesario cuantizar y validar la pérdida de calidad.
- Opciones de despliegue: la librería declarada es transformers; los tags incluyen text-generation-inference, por lo que TGI es una vía plausible, y Unsloth se ha usado para el ajuste. No hay documentación sobre vLLM, llama.cpp u Ollama para esta arquitectura, así que su uso requeriría pruebas propias.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo por página.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| NOVA-OCR2 | 3.389.119.360 (~3,39 mil millones) | no disponible | Apache 2.0 | en | HuggingFace |
| DeepSeek-OCR-2 (modelo base) | no disponible en la informacion proporcionada | no disponible | Apache 2.0 segun la ficha del derivado | no disponible | HuggingFace |
| Alternativas comparables de OCR/VLM de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones completas de alternativas de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La única comparación directa posible es con DeepSeek-OCR-2, y requeriría ejecutar ambos modelos sobre el mismo conjunto de imágenes.

## Limitaciones y advertencias

- Idioma: el autor declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Ausencia total de benchmarks: no hay métricas de exactitud OCR (CER/WER) ni comparaciones con el modelo base, lo que impide estimar su calidad antes de probarlo.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que aporten evidencia de uso real.
- Riesgo de alucinación: como modelo generativo, puede producir texto que no aparece en la imagen, especialmente en zonas de baja resolución, tablas complejas o manuscritos; es obligatorio un paso de verificación en usos críticos.
- Longitud de contexto no documentada: no se puede planificar el procesamiento de documentos multipágina o de imágenes de gran tamaño sin pruebas previas.
- Dataset de ajuste no documentado: se desconoce qué datos se usaron, si había datos personales o si el fine-tune introduce sesgos específicos de dominio.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar los términos del modelo base y de los datasets empleados en el ajuste antes de un despliegue en producción.
- Configuración ambigua: el pipeline declarado es feature-extraction, mientras que los tags incluyen text-generation-inference; hay que verificar la configuración real (`config.json`, procesador y plantilla de prompt) antes de integrarlo.
- Privacidad: al procesar documentos, el modelo puede estar expuesto a datos personales o confidenciales; se recomienda despliegue on-premise y registro de auditoría.
- Fecha de publicación muy reciente (27 de octubre de 2026) y ausencia de paper o blog técnico que respalde el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cortex-ai-nova/NOVA-OCR2
- Modelo base DeepSeek-OCR-2: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Unsloth (herramienta de ajuste citada por el autor): https://github.com/unslothai/unsloth
- TRL de HuggingFace (herramienta de ajuste citada por el autor): https://huggingface.co/docs/trl
- Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los resultados obtenidos corresponden a otros usos del término "cortex" (anatomía, medios y software de gaming) y se han descartado por no estar relacionados.
