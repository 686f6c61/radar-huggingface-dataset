# mradermacher/LightOnOCR-3-4B-MTP-Repacked-GGUF

## Resumen

LightOnOCR-3-4B-MTP-Repacked-GGUF es una conversión a formato GGUF de los pesos de LightOnOCR-3-4B-MTP-Repacked, un modelo de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) orientado a tareas de OCR y comprensión de documentos. La conversión la publica el usuario mradermacher, especializado en generar cuantizaciones estáticas de modelos para su uso con llama.cpp y herramientas compatibles. El modelo original procede de prithivMLmods, que a su vez lo republica a partir del trabajo de LightOn.

El interés de esta ficha reside en que ofrece una vía práctica para ejecutar un modelo de OCR de ~4B en hardware de consumo mediante cuantización GGUF, con una batería amplia de variantes (desde Q2_K hasta F16, incluyendo IQ4_XS). El repositorio ocupa 41 GB en total, lo que refleja la suma de todas las cuantizaciones publicadas, no el peso de una sola.

No obstante, la información pública disponible es muy limitada: no se detallan arquitectura interna, datos de entrenamiento, idiomas soportados ni licencia, y el modelo no registra descargas ni interacciones en el momento de la consulta. Cualquier evaluación rigurosa debería remitirse a la model card del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de OCR/visión-lenguaje; detalles no publicados en la información disponible) |
| Parámetros totales | 4.326.350.848 (~4,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en los datos proporcionados. Por el nombre y la categoría (OCR) cabe esperar un modelo multimodal con codificador visual y decodificador de lenguaje, pero no se confirma ni el tipo de transformer, ni el mecanismo de atención, ni la presencia de componentes MoE o SSM. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado.

Lo único verificable es el proceso de conversión: se trata de una cuantización estática generada con la herramienta de cuantización de llama.cpp a partir de los pesos en formato Hugging Face del repositorio `prithivMLmods/LightOnOCR-3-4B-MTP-Repacked`. El sufijo "MTP" y "Repacked" sugiere un reempaquetado de pesos originales, pero no se detalla en qué consiste ni qué implicaciones tiene sobre el rendimiento.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, según la orientación declarada por el nombre del modelo.
- Conversión de documentos escaneados o fotografías a texto estructurado, en la medida en que el modelo original lo soporte.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- El tag `conversational` sugiere soporte de interacción en formato de chat, aunque no se detalla el formato de prompt.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de archivos administrativos: procesar lotes de documentos escaneados (facturas, formularios, expedientes) para extraer texto y alimentar un sistema de gestión documental. La cuantización Q4_K_M permite ejecutarlo en una GPU de consumo.
- Extracción de datos de recibos y tickets: integrar el modelo en un pipeline de contabilidad que convierta imágenes de tickets en campos estructurados, con verificación humana posterior.
- Accesibilidad documental: convertir imágenes de libros o apuntes en texto legible para lectores de pantalla, ejecutando el modelo en local para preservar la privacidad del contenido.
- Procesamiento en entornos sin conectividad: desplegar la variante Q4_K_S o Q5_K_M en estaciones de trabajo aisladas (por ejemplo, en administración pública o sanidad) donde no se permite enviar documentos a servicios en la nube.
- Preprocesado para RAG sobre documentos físicos: usar el modelo como etapa de OCR antes de la indexación vectorial, de modo que el corpus escaneado quede disponible para búsqueda semántica.
- Archivística y patrimonio: digitalizar fondos históricos con la variante F16 o Q8_0 cuando la fidelidad de transcripción sea prioritaria sobre la velocidad, y Q2_K o IQ4_XS cuando el objetivo sea un primer barrido masivo en hardware limitado.
- Prototipado e investigación: evaluar la calidad de un OCR de ~4B en GGUF frente a alternativas propietarias antes de comprometerse con una licencia o un despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño de pesos de un modelo de ~4,3B):
  - F16: ~8,6 GB de pesos.
  - Q8_0: ~4,6 GB.
  - Q6_K: ~3,5 GB.
  - Q5_K_M: ~3,0 GB.
  - Q4_K_M: ~2,6 GB.
  - Q3_K_M: ~2,1 GB.
  - Q2_K: ~1,6 GB.
  - IQ4_XS: ~2,4 GB.
  - A estas cifras hay que sumar el codificador visual y el espacio de contexto, no cuantificados en los datos disponibles.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para las variantes altas con contexto amplio; RTX 4060 Ti 16 GB o RTX 4070 para Q4_K_M y Q5_K_M; A100/H100 solo si se requiere throughput elevado en lote.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más para cuantizaciones Q4 y Q5; las variantes Q2_K e IQ4_XS podrían caber en 6 GB, sujeto al coste del codificador visual.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), LM Studio, servidores compatibles con la API de llama.cpp. El tag `endpoints_compatible` indica compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-MTP-Repacked-GGUF (este) | ~4,3B | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un OCR de ~4B |
| prithivMLmods/LightOnOCR-3-4B-MTP-Repacked | ~4,3B | no disponible | no disponible | safetensors (presumiblemente) | Repositorio de origen de la conversión |
| Modelo LightOnOCR original | no disponible | no disponible | no disponible | no disponible | Referencia upstream; datos no verificados en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo original que permitan una comparación cuantitativa con alternativas como PaddleOCR, Tesseract o modelos OCR multimodales de mayor tamaño.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse uso comercial sin consultar la model card del modelo original y del repositorio de origen.
- Idiomas no documentados: no hay garantía de soporte para castellano ni para otras lenguas distintas del inglés.
- Sin benchmarks publicados: no es posible estimar la precisión del OCR (CER/WER) ni compararla con alternativas establecidas.
- Sin datos sobre el contexto máximo: no se puede planificar el procesamiento de documentos de varias páginas en una sola pasada.
- Riesgo de alucinación inherente a los modelos generativos: en OCR, esto se traduce en texto inventado o corregido de forma no fiel al original, especialmente en cuantizaciones agresivas (Q2_K).
- La cuantización degrada la calidad: Q2_K y Q3_K pueden introducir errores en caracteres poco frecuentes, cifras y símbolos; para documentos críticos conviene Q5_K_M o superior.
- El repositorio ocupa 41 GB por acumulación de cuantizaciones; descargar solo la variante necesaria.
- Sin descargas ni validación comunitaria: no hay evidencia de que las cuantizaciones hayan sido probadas por terceros.
- El sufijo "Repacked" indica un reempaquetado de pesos cuyo impacto en el comportamiento del modelo no está documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LightOnOCR-3-4B-MTP-Repacked-GGUF
- Repositorio de origen: https://huggingface.co/prithivMLmods/LightOnOCR-3-4B-MTP-Repacked
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
