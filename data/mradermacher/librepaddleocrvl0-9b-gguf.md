# mradermacher/LibrePaddleOCRVL0.9b-GGUF

## Resumen

LibrePaddleOCRVL0.9b-GGUF es una conversión a formato GGUF del modelo LibrePaddleOCRVL0.9b, publicado por el usuario mradermacher en HuggingFace. Se trata de una cuantización estática del modelo original alojado en el repositorio LibreYOLO/LibrePaddleOCRVL0.9b, cuyo propósito es el reconocimiento óptico de caracteres (OCR) con capacidades de visión-lenguaje (VL), a juzgar por su denominación.

El modelo original parece derivar de la familia PaddleOCR de Baidu, adaptada y redistribuida bajo el paraguas "LibreYOLO". El sufijo "0.9b" sugiere un tamaño de aproximadamente 900 millones de parámetros. La conversión a GGUF permite su ejecución en entornos con llama.cpp y herramientas compatibles, facilitando el despliegue en CPU y GPU de consumo.

La relevancia de esta ficha es limitada por la escasez de información publicada: la model card del repositorio GGUF es meramente una nota de conversión y no incluye especificaciones técnicas, datos de entrenamiento ni resultados de benchmarks. Los datos que se presentan a continuación se derivan exclusivamente de los metadatos disponibles y del contenido de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje para OCR, según denominación) |
| Parámetros totales | ~0,9 mil millones (inferido del sufijo "0.9b" del nombre) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. La denominación "OCRVL" indica que se trata de un modelo de visión-lenguaje orientado a OCR, lo que habitualmente implica un codificador visual (posiblemente basado en ViT o similar) acoplado a un decodificador de lenguaje. No obstante, esta afirmación es una inferencia basada en el nombre y no está confirmada por la model card.

Tampoco se han publicado datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF únicamente documenta el proceso de cuantización: versión de quantize_version 2, output_tensor_quantised 1, convert_type hf, y la lista de cuantizaciones generadas. No se menciona ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Reconocimiento óptico de caracteres (OCR): la denominación del modelo indica capacidad para extraer texto de imágenes.
- Procesamiento de visión-lenguaje: al tratarse de un modelo "VL", se presume capacidad para tareas que combinan imagen y texto, aunque no se detallan en la documentación.
- Generación de texto: no confirmada explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Digitalización de documentos escaneados: el modelo podría emplearse para extraer texto de facturas, contratos o formularios en formato imagen, aprovechando su naturaleza OCR. La viabilidad concreta depende de la calidad de las cuantizaciones GGUF para tareas de reconocimiento.
- Procesamiento de imágenes en entornos con recursos limitados: al estar disponible en cuantizaciones de 2 a 8 bits, podría desplegarse en equipos sin GPU dedicada mediante llama.cpp, aunque el rendimiento en OCR de cuantizaciones agresivas (Q2_K, Q3_K) no está documentado.
- Integración en pipelines de extracción de datos: para convertir capturas o PDFs escaneados en texto estructurado dentro de flujos automatizados, siempre que se valide la precisión del modelo en el dominio concreto.
- Análisis de imágenes en aplicaciones de escritorio: la disponibilidad de GGUF facilita la inclusión del modelo en aplicaciones locales que requieran OCR sin conexión a servicios en la nube.
- Prototipado e investigación: útil para investigadores que quieran experimentar con modelos OCR-VL de pequeño tamaño (~0,9B) en configuraciones de bajo consumo.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples niveles de cuantización, lo que permite estudiar el compromiso entre tamaño, velocidad y precisión en tareas de OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (~0,9B parámetros), las cuantizaciones Q4_K_M ocuparían del orden de 0,5-0,7 GB, y la versión f16 alrededor de 1,8 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo podría ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en CPU.
- Compatibilidad con GPU de consumo: probable dada la baja cantidad de parámetros, pero no verificada en la documentación.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, etc.). No se menciona soporte para vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: la model card no especifica arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- Licencia desconocida: no se indica la licencia del modelo original ni de la conversión GGUF, por lo que el uso comercial no está garantizado y requiere verificación en el repositorio de origen (LibreYOLO/LibrePaddleOCRVL0.9b).
- Riesgo de alucinación: no evaluado; en modelos OCR-VL, la generación de texto inexistente en la imagen es un riesgo conocido, pero no hay datos específicos para este modelo.
- Sesgos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Cuantizaciones agresivas: las versiones Q2_K y Q3_K pueden degradar la precisión del OCR; no hay métricas publicadas al respecto.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-05): el metadato indica una fecha posterior a la actual, lo que puede reflejar un error de registro o una publicación programada; conviene verificar la autenticidad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LibrePaddleOCRVL0.9b-GGUF
- Modelo original: https://huggingface.co/LibreYOLO/LibrePaddleOCRVL0.9b
