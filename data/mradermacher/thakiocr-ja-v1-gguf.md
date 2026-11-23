# mradermacher/ThakiOCR-JA-v1-GGUF

## Resumen

ThakiOCR-JA-v1 es un modelo especializado en reconocimiento óptico de caracteres (OCR) para japonés, desarrollado originalmente por ThakiCloud y distribuido en formato GGUF por el usuario mradermacher. Se trata de una adaptación de PaddleOCR-VL orientada a la extracción de texto en documentos japoneses, un dominio donde los motores OCR genéricos suelen fallar debido a la mezcla de kanji, hiragana, katakana y la escritura vertical. El modelo base está publicado bajo licencia Apache 2.0 y se entrenó con el dataset JSSODa del proyecto LLM-jp.

Con 466 millones de parámetros, es un modelo compacto pensado para inferencia eficiente en entornos de producción donde el coste por página procesada importa. Esta versión GGUF, generada por mradermacher, permite ejecutar el modelo en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles, con cuantizaciones que van desde Q2_K (0,3 GB) hasta f16 (1,0 GB).

La relevancia actual radica en la digitalización masiva de archivos japoneses (facturas, formularios, documentos escaneados) y en la posibilidad de desplegar OCR especializado en hardware modesto sin depender de servicios en la nube. Al estar basado en PaddleOCR-VL, hereda la arquitectura vision-language de PaddleOCR, aunque la información pública disponible sobre detalles internos es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language basada en PaddleOCR-VL (detalles internos no disponibles) |
| Parametros totales | 466.654.208 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en PaddleOCR-VL, la familia de modelos vision-language de PaddleOCR para reconocimiento de documentos. La información pública no detalla la composición exacta de capas, el mecanismo de atención ni el número de tokens de entrenamiento. Lo que sí se conoce es que el modelo base fue ajustado por ThakiCloud para japonés y que utilizó el dataset JSSODa (llm-jp/JSSODa) como corpus de entrenamiento, un conjunto de datos del proyecto LLM-jp orientado a documentos japoneses.

No se dispone de información sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco hay datos publicados sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Esta versión GGUF es una cuantización estática del modelo original; el autor indica que no hay cuantizaciones con imatrix disponibles en el momento de la publicación.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos en japonés.
- Extracción de texto de documentos con mezcla de kanji, hiragana y katakana.
- Procesamiento de documentos escaneados y fotografías de texto japonés.
- Capacidad conversacional según los tags del repositorio (etiqueta "conversational"), aunque orientada a tareas OCR.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según el campo `language`.
- Modo thinking, visión general o audio: no disponible (solo OCR de documentos).

## Casos de uso

- Digitalización de facturas y recibos japoneses: el modelo extrae texto de imágenes de documentos comerciales, lo que permite alimentar sistemas de contabilidad y ERP con datos estructurados sin intervención manual.
- Procesamiento de formularios administrativos: adecuado para digitalizar documentos oficiales japoneses escaneados, gracias a su especialización en la escritura japonesa y su tamaño reducido que permite procesar lotes grandes en paralelo.
- Archivística y bibliotecas digitales: conversión de colecciones de documentos históricos o administrativos japoneses a texto plano indexable, ejecutando el modelo en servidores modestos con cuantización Q4_K_M.
- Extracción de texto en pipelines de RAG: como paso previo a la indexación vectorial de documentos japoneses, el modelo convierte imágenes en texto que luego se embebe y se recupera en sistemas de búsqueda semántica.
- Automatización de atención al cliente con documentos adjuntos: integración en flujos donde el usuario envía una foto de un documento japonés y el sistema necesita extraer la información para responder.
- Despliegue en dispositivos de borde: con cuantizaciones de 0,3–0,6 GB, el modelo puede ejecutarse en CPU o en GPUs de consumo para aplicaciones de OCR en tiempo real en kioscos o terminales de escaneo.
- Preprocesamiento para traducción automática: extracción del texto japonés de imágenes para posterior traducción, aprovechando la ligereza del modelo en comparación con pipelines OCR genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3–0,6 GB con cuantizaciones Q2_K a Q8_0; alrededor de 1,0 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM libre; válido en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque el modelo es lo suficientemente pequeño como para no requerir GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (incluidas GTX 1650, RTX 3050 y superiores) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo original puede ejecutarse con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 466 M de parámetros, se espera una latencia baja en GPU y moderada en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ThakiOCR-JA-v1 (GGUF) | 466 M | no disponible | ja | Apache 2.0 | GGUF |
| PaddleOCR-VL (base) | no disponible | no disponible | multilingüe | Apache 2.0 | safetensors |
| Tesseract (jpn) | no aplica (motor clásico) | no aplica | multilingüe | Apache 2.0 | binario |
| Manga OCR | no disponible | no disponible | ja | no disponible | safetensors |

La comparación con Tesseract es relevante porque es el estándar de facto en OCR open source: Tesseract es un motor clásico sin parámetros neuronales, mientras que ThakiOCR-JA-v1 es un modelo vision-language especializado. Frente a PaddleOCR-VL genérico, esta versión está ajustada específicamente para japonés con JSSODa. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El modelo solo soporta japonés; no debe esperarse un rendimiento correcto en otros idiomas.
- No hay información publicada sobre sesgos específicos, pero al entrenarse con un dataset concreto (JSSODa) puede heredar los sesgos de composición de dicho corpus.
- Riesgo de alucinación: como modelo generativo vision-language, puede producir texto plausible pero incorrecto en imágenes de baja calidad o con tipografías inusuales; se recomienda validación en producción.
- Limitaciones de contexto: no se ha publicado la longitud de contexto, lo que impide garantizar el procesamiento de documentos muy largos en una sola pasada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original y del dataset JSSODa.
- Esta versión GGUF es una cuantización estática sin imatrix; el autor advierte que las cuantizaciones Q2_K y Q3 pueden degradar la calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.
- No se dispone de información sobre el pipeline de inferencia recomendado ni sobre el preprocesamiento de imágenes esperado.

## Enlaces

- [Hugging Face: mradermacher/ThakiOCR-JA-v1-GGUF](https://huggingface.co/mradermacher/ThakiOCR-JA-v1-GGUF)
- [Modelo base: ThakiCloud/ThakiOCR-JA-v1](https://huggingface.co/ThakiCloud/ThakiOCR-JA-v1)
- [Dataset: llm-jp/JSSODa](https://huggingface.co/datasets/llm-jp/JSSODa)
- [Página de descargas del autor](https://hf.tst.eu/model#ThakiOCR-JA-v1-GGUF)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [README de referencia para uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
