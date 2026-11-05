# mradermacher/chandra-ocr-2-cultural-heritage-eng-GGUF

## Resumen

`mradermacher/chandra-ocr-2-cultural-heritage-eng-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng`, publicada por el usuario mradermacher. Se trata de un modelo especializado en OCR (reconocimiento óptico de caracteres) orientado al dominio del patrimonio cultural en inglés, con 333.514.240 parámetros totales (aproximadamente 333,5 millones) según los datos de safetensors del repositorio original.

El modelo base procede del proyecto Chandra OCR de Yale Cultural Heritage, y esta versión concreta está pensada para su despliegue en entornos con llama.cpp u otros runners compatibles con GGUF. El repositorio ofrece múltiples niveles de cuantización (desde Q2_K hasta F16, pasando por Q4_K_M, Q5_K_M, Q8_0 e IQ4_XS), lo que permite ajustar el consumo de memoria en función del hardware disponible.

La relevancia de esta ficha radica en que se trata de un modelo pequeño y especializado, adecuado para tareas de digitalización y extracción de texto en colecciones documentales y patrimoniales, aunque la información pública disponible sobre su entrenamiento, licencia y rendimiento es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 333.514.240 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | inglés (según el nombre del modelo; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre y el tamaño (333,5 millones de parámetros) sugieren un transformer encoder-decoder o un modelo tipo OCR especializado, pero no se confirma en la model card. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estáticas del modelo `yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng`, generadas con la herramienta de cuantización de llama.cpp (se observan metadatos como `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`). No se documentan innovaciones técnicas adicionales.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre documentos en inglés, según la denominación del modelo.
- Especialización declarada en el dominio del patrimonio cultural (`cultural-heritage`), lo que sugiere entrenamiento o ajuste sobre materiales de archivo, manuscritos o impresos históricos.
- Procesamiento de texto en inglés (idioma indicado en el nombre del modelo; no confirmado explícitamente en la model card).
- Despliegue en formato GGUF, compatible con llama.cpp y runners derivados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de archivos históricos: el modelo puede emplearse para extraer texto de documentos escaneados de colecciones patrimoniales en inglés, aprovechando su especialización declarada en ese dominio.
- Enriquecimiento de catálogos bibliotecarios: integración en pipelines que conviertan imágenes de fichas y registros en texto estructurado para su indexación.
- Búsqueda full-text sobre fondos documentales: OCR previo a la indexación en motores de búsqueda, permitiendo consultas sobre corpus históricos previamente solo disponibles como imagen.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~333 M de parámetros con cuantizaciones Q4_K_M o Q5_K_M, puede ejecutarse en CPU o GPU de gama baja, lo que facilita su uso en instituciones con infraestructura modesta.
- Procesamiento por lotes en servidores sin GPU dedicada: las cuantizaciones Q2_K y Q3_K reducen el peso a unos cientos de MB, permitiendo ejecución en contenedores ligeros.
- Preservación digital y accesibilidad: generación de capas de texto OCR para documentos patrimoniales, mejorando la accesibilidad y la conservación del contenido.
- Prototipado e investigación en OCR histórico: al ser un modelo pequeño y con múltiples cuantizaciones, es útil para experimentación académica y comparación de enfoques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~333 M de parámetros, el peso en F16 ronda los 0,67 GB; en Q8_0 aproximadamente 0,35 GB; en Q4_K_M en torno a 0,2 GB. Estas cifras son estimaciones basadas en el número de parámetros y no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para las cuantizaciones más pequeñas; no se requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe en GPU de consumo como GTX 1050, RTX 3050, RTX 4060 o superiores, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación del GGUF), y runners compatibles con GGUF. No se confirma compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| chandra-ocr-2-cultural-heritage-eng (este) | 333,5 M | no disponible | no disponible | GGUF | OCR especializado en patrimonio cultural en inglés |
| Tesseract OCR | no aplica (motor clásico) | no aplica | Apache 2.0 | binario | OCR clásico, sin modelo neuronal; ampliamente usado |
| TrOCR (Microsoft) | ~334 M (base) | 512 tokens (típico) | MIT (según versión) | safetensors | OCR transformer encoder-decoder; alternativa neuronal comparable en tamaño |
| Donut (Clova AI) | ~200 M | 2048 tokens (típico) | MIT | safetensors | Modelo OCR/document understanding sin OCR explícito |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; es imprescindible consultar el repositorio base antes de desplegarlo en producción.
- El modelo está orientado al inglés y al dominio del patrimonio cultural; su rendimiento en otros idiomas o dominios no está documentado.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que se desconoce su precisión real frente a alternativas como Tesseract o TrOCR.
- Riesgo de alucinación inherente a los modelos generativos; en tareas OCR puede producir texto plausible pero incorrecto en documentos degradados o con tipografías inusuales.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Al ser una cuantización estática, puede haber una pérdida de precisión respecto al modelo original en F16, especialmente en las variantes Q2_K y Q3_K.
- No se documentan sesgos conocidos, pero al estar entrenado sobre materiales patrimoniales en inglés podría reflejar sesgos históricos o de dominio.
- La fecha de creación del repositorio (2026-11-05) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia y el estado del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/chandra-ocr-2-cultural-heritage-eng-GGUF
- Modelo base: https://huggingface.co/yale-cultural-heritage/chandra-ocr-2-cultural-heritage-eng
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
