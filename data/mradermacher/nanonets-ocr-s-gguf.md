# mradermacher/Nanonets-OCR-s-GGUF

## Resumen

Nanonets-OCR-s es un modelo especializado en reconocimiento óptico de caracteres (OCR) y conversión de documentos PDF a Markdown, desarrollado originalmente por Nanonets. Esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base cuenta con aproximadamente 3.086 millones de parámetros (3,09 B) y está diseñado específicamente para extraer texto estructurado de imágenes y documentos, preservando el formato Markdown en la salida.

La relevancia de esta versión GGUF radica en que reduce los requisitos de hardware de forma drástica: mientras que los pesos en precisión completa ocupan 6,3 GB, las cuantizaciones Q4_K_M lo reducen a 2,0 GB, lo que permite su despliegue en GPUs de consumo e incluso en CPU. El modelo está orientado a tareas de digitalización de documentos, extracción de tablas, fórmulas y texto con formato, y su licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base es limitada en la documentación proporcionada; esta ficha se limita a los datos verificables extraídos de la model card y los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con componente de visión, según el archivo mmproj incluido) |
| Parámetros totales | 3.085.938.688 (3,09 B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los metadatos indican que se trata de un modelo multimodal (los archivos GGUF incluyen un componente `mmproj`, proyección multimodal, necesario para procesar imágenes), con 3,09 B de parámetros totales. La librería asociada es `transformers` y el pipeline declarado en los tags incluye OCR y `pdf2markdown`, lo que confirma su orientación a la extracción de texto estructurado desde documentos.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal. Las cuantizaciones publicadas por mradermacher son estáticas (no imatrix); las versiones con imatrix están disponibles en un repositorio separado (`Nanonets-OCR-s-i1-GGUF`).

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos escaneados.
- Conversión de PDF a Markdown, preservando estructura de texto, tablas y formato.
- Procesamiento multimodal: acepta imágenes como entrada junto con instrucciones textuales.
- Extracción de contenido estructurado (tablas, listas, encabezados) en formato Markdown.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Soporte de despliegue en CPU y GPU de consumo gracias a las cuantizaciones de bajo tamaño.
- Capacidad de funcionar como endpoint compatible (tag `endpoints_compatible`).
- No se ha documentado soporte de tool calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede procesar imágenes de documentos comerciales y extraer los datos en Markdown estructurado, facilitando su posterior parseo e integración en sistemas de contabilidad. Su tamaño reducido en Q4_K_M (2,0 GB) permite ejecutarlo en servidores modestos o incluso en estaciones de trabajo sin GPU dedicada.
- Conversión de artículos académicos a Markdown: útil para pipelines de investigación que necesitan transformar PDFs con fórmulas y tablas en texto estructurado para su indexación o análisis. La naturaleza multimodal del modelo permite procesar el documento como imagen sin depender de la capa de texto del PDF.
- Extracción de tablas de informes financieros: el modelo genera salida en Markdown, lo que preserva la estructura tabular y facilita la conversión posterior a CSV o bases de datos.
- Archivado y búsqueda documental: integrado en un pipeline de ingesta, el modelo puede convertir lotes de documentos escaneados en Markdown para alimentar motores de búsqueda o sistemas RAG (retrieval-augmented generation).
- Digitalización de documentación técnica y manuales: la conversión a Markdown preserva encabezados y listas, lo que facilita la publicación en wikis o sistemas de documentación.
- Procesamiento en el borde (edge) o en entornos sin GPU: las cuantizaciones Q2_K (1,4 GB) y Q3_K_S (1,6 GB) permiten ejecutar el modelo en CPU con llama.cpp, adecuado para dispositivos con recursos limitados o despliegues offline.
- Preprocesamiento para pipelines de NLP: convertir documentos a Markdown antes de pasarlos a modelos de lenguaje de mayor tamaño para tareas de resumen o extracción de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo principal, sin contar el componente mmproj ni el contexto):
  - Q2_K: 1,4 GB
  - Q3_K_S: 1,6 GB
  - Q3_K_M: 1,7 GB
  - Q3_K_L: 1,8 GB
  - IQ4_XS: 1,9 GB
  - Q4_K_S: 1,9 GB
  - Q4_K_M: 2,0 GB
  - Q5_K_S / Q5_K_M: 2,3 GB
  - Q6_K: 2,6 GB
  - Q8_0: 3,4 GB
  - f16: 6,3 GB
- Componente multimodal adicional: mmproj-Q8_0 (0,9 GB) o mmproj-f16 (1,4 GB), necesario para el procesamiento de imágenes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 y el mmproj-Q8_0; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Ejecución en CPU: viable con llama.cpp para todas las cuantizaciones; las de menor tamaño (Q2_K a Q4_K_M) son las más adecuadas para CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanonets-OCR-s (esta ficha, GGUF) | 3,09 B | no disponible | Apache 2.0 | GGUF | Especializado en OCR y PDF a Markdown, multimodal |
| Nanonets-OCR-s (base, safetensors) | 3,09 B | no disponible | Apache 2.0 | safetensors | Versión original sin cuantizar |
| Nanonets-OCR-s-i1-GGUF (imatrix) | 3,09 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones con imatrix, mayor calidad a igual tamaño |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés (`en`); el rendimiento en otros idiomas, incluido el castellano, no está documentado y podría ser deficiente.
- No se han publicado benchmarks ni evaluaciones de calidad en la información disponible, por lo que el rendimiento real en tareas de OCR no puede verificarse a priori.
- Riesgo de alucinación inherente a los modelos generativos: en documentos con texto poco legible o imágenes de baja calidad, el modelo podría generar contenido inexistente o incorrecto.
- Las cuantizaciones de menor tamaño (Q2_K, Q3_K_S) pueden degradar la calidad de la extracción; se recomienda Q4_K_M o superior para producción.
- El componente multimodal (mmproj) es imprescindible para procesar imágenes; sin él, el modelo no puede realizar tareas de OCR.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, conviene verificar la licencia del modelo base original (`nanonets/Nanonets-OCR-s`) por si hubiera condiciones adicionales no reflejadas en esta ficha.
- El repositorio ocupa 30,1 GB en total debido a la multiplicidad de cuantizaciones; descargar solo los archivos necesarios.
- No se dispone de información sobre sesgos conocidos del modelo base.
- La fecha de actualización del repositorio (2026-11-15) es posterior a la de creación (2025-06-14); verificar que los archivos descargados corresponden a la versión esperada.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Nanonets-OCR-s-GGUF
- Modelo base original: https://huggingface.co/nanonets/Nanonets-OCR-s
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Nanonets-OCR-s-i1-GGUF
- Página de descripción del modelo de mradermacher: https://hf.tst.eu/model#Nanonets-OCR-s-GGUF
- Guía de uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
