# Mike0307/ai-text-detector-zh-en

## Resumen

`Mike0307/ai-text-detector-zh-en` es un clasificador de texto para detectar si un fragmento en chino o en inglés ha sido escrito por una persona o generado por un modelo de lenguaje, y en caso de ser IA, estimar a qué familia de modelos se parece más (ChatGPT, Claude, Gemini u otra). Se construye a partir de `FacebookAI/xlm-roberta-base` afinado como clasificador de cinco clases (human, openai, anthropic, google, other_ai); los logits se recalibran después mediante una regresión logística ajustada sobre un conjunto de validación para producir una única probabilidad de IA.

El interés práctico del modelo es su formato de distribución: el repositorio publica únicamente pesos ONNX en fp32, fp16 e int8, pensados para inferencia en el navegador con `transformers.js` y ONNX Runtime Web. El texto no sale del dispositivo del usuario, lo que permite integrar detección de contenido generado en extensiones, editores o aplicaciones web sin enviar documentos a un servidor.

El autor reporta métricas internas altas (AUROC 0,998 y 98,4 % de exactitud en el conjunto de test en distribución) y una degradación controlada fuera de distribución (AUROC 0,975 en inglés y 0,971 en chino). No hay publicaciones independientes ni resultados de terceros en la información disponible, y el modelo cuenta con 0 descargas y 1 like en el momento de redactar esta ficha. Licencia MIT, pero el conjunto de entrenamiento no es público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabezal de clasificación de 5 clases + calibración logística posterior |
| Parámetros totales | ≈278 M (heredados de `xlm-roberta-base`; el autor no publica el recuento exacto del cabezal) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el máximo de tokens se define en `aidetect.json` y no se publica; los documentos largos se trocean por párrafos y se puntúan por segmentos) |
| Tipos de cuantización | fp32 (`model.onnx`, ~780 MB), fp16 (`model_fp16.onnx` y `model_fp16_ext.onnx`, ~390 MB), int8 dinámica por canal (`model_int8_ext.onnx`, ~200 MB) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT (los datos de entrenamiento no son públicos) |
| Formato de pesos | ONNX (con fichero externo de datos en las variantes `_ext`), tokenizador en `tokenizer.json`, tablas auxiliares `id_map.bin`, `fusion.json`, `fusion_int8.json`, `aidetect.json` |
| Tarea | `text-classification` (detección humano/IA + atribución de familia de modelo) |
| Modelo base | `FacebookAI/xlm-roberta-base` |
| Tamaño del repositorio | 1,8 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo es un encoder XLM-RoBERTa base (~278 M de parámetros) con un cabezal de clasificación de cinco clases: `human`, `openai`, `anthropic`, `google` y `other_ai`. Sobre la salida softmax no se aplica directamente el umbral final: el autor define una etapa de fusión que toma tres características — `logit(1 − P(human))`, un indicador de si el texto es chino y `log(1 + longitud)` —, las estandariza y las pasa por una regresión logística cuyos coeficientes se publican en `fusion.json`. Para la variante int8 existe una calibración propia (`fusion_int8.json`) reajustada sobre el conjunto de validación, porque las salidas del modelo cuantizado se desvían ligeramente a la baja.

El entrenamiento parte de un corpus no público del que solo se indica que los textos humanos se limitan a material verificable como escrito antes del 30 de noviembre de 2022 (fecha de lanzamiento de ChatGPT). No se documentan el número de tokens, la composición del dataset ni si hubo RLHF/DPO, algo esperable al no tratarse de un modelo generativo. Sí se describe una optimización de despliegue: la capa de embeddings se recorta de 250.002 a 141.877 filas eliminando piezas de escrituras que el modelo nunca ve en su tarea (coreano, tailandés, árabe, cirílico, índico y otras), manteniendo el tokenizador original intacto. Por eso es obligatorio remapear los `input_ids` con `id_map.bin` antes de alimentar el grafo ONNX; el autor incluye `export_check.json` con la comparación entre la exportación fp16 y el modelo PyTorch original.

## Capacidades

- Clasificación binaria humano/IA con probabilidad calibrada, no solo una etiqueta dura.
- Atribución de fuente en cinco clases: humano, OpenAI, Anthropic, Google u otra IA.
- Procesamiento de documentos largos: segmentación por párrafos con parámetros en `aidetect.json` y agregación de puntuaciones por segmento.
- Bilingüe chino-inglés, incluyendo chino fuera de distribución generado por GPT-4o, Gemini 2.5, DeepSeek y Qwen según la evaluación del autor.
- Inferencia 100 % local en el navegador (WebGPU/WASM vía ONNX Runtime Web), sin envío de texto a servidores.
- Variante int8 para móviles y dispositivos con 4 GB de memoria o menos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no tiene modo de razonamiento multi-paso ni capacidades de agente, visión o audio.

## Casos de uso

- Moderación de contenido generado por usuarios: puntuar en el cliente cada publicación de un foro antes de enviarla, de modo que solo los casos con probabilidad alta de IA pasen a revisión humana, sin almacenar el texto original.
- Herramientas editoriales y de verificación periodística: extensión de navegador que marca párrafos sospechosos en un artículo y ofrece la probabilidad calibrada junto con la familia de modelo estimada, útil como señal de triaje en una redacción.
- Curación de datasets: filtrar corpus scrapeados para separar texto humano verificado de texto sintético antes de usarlo en entrenamiento o evaluación, aprovechando el modo de segmentación por párrafos.
- Investigación sobre procedencia de contenido: estudiar la mezcla de fuentes en un corpus chino o inglés observando la distribución de las cinco clases y la evolución temporal de la atribución.
- Integración en CMS y plataformas educativas: plugin que calcula la probabilidad en el servidor con `onnxruntime` (fp32 o fp16) y la expone como señal adicional, nunca como decisión automática.
- Aplicaciones móviles offline: usar la variante int8 (~200 MB de pesos, ~1 GB de pico de memoria al cargar) en una app que funcione sin conectividad, por ejemplo en contextos de campo o con requisitos de privacidad estrictos.
- Análisis forense y OSINT de primer nivel: descartar rápidamente documentos generados sintéticamente en un lote heterogéneo antes de aplicar técnicas más costosas.

## Benchmarks y rendimiento

Resultados publicados por el autor (versión v3), con la variante fp16:

| Conjunto de test | AUROC | Exactitud | Humanos marcados como IA | IA detectada |
|---|---|---|---|---|
| Test en distribución (zh + en) | 0,998 | 98,4 % | 2,6 % | 99,5 % |
| Inglés fuera de distribución (textsight 2026) | 0,975 | 91,1 % | 9,3 % | 96,4 % |
| Chino fuera de distribución (DetectRL-X: GPT-4o, Gemini 2.5, DeepSeek, Qwen) | 0,971 | 91,5 % | 10,0 % | 92,2 % |

Comparativa fp16 frente a int8 publicada por el autor:

| Conjunto de test (fp16 / int8) | AUROC | Exactitud | Humanos marcados como IA | IA detectada | Veredicto distinto de fp16 |
|---|---|---|---|---|---|
| En distribución | 0,999 / 0,999 | 98,6 % / 98,0 % | 2,2 % / 3,2 % | 99,5 % / 99,2 % | 1,4 % |
| Inglés fuera de distribución | 0,977 / 0,966 | 91,4 % / 90,2 % | 9,0 % / 9,7 % | 96,4 % / 89,3 % | 4,8 % |
| Chino fuera de distribución | 0,971 / 0,970 | 91,6 % / 91,1 % | 10,0 % / 11,1 % | 92,4 % / 92,2 % | 7,7 % |

No se han publicado en la información disponible resultados comparables de otros detectores sobre estos mismos conjuntos, ni evaluaciones independientes de este modelo.

## Requisitos de hardware

- VRAM/peso en disco: 780 MB en fp32, 390 MB en fp16 y 200 MB en int8 para los pesos; el repositorio completo ocupa 1,8 GB.
- Pico de memoria al cargar en navegador: más de 1,5 GB con fp16 (motivo por el que existe la variante int8); en torno a 1 GB con int8.
- Cabe en cualquier GPU de consumo: una RTX 4090, una RTX 3060 o incluso una GPU integrada con más de 2 GB de memoria disponible ejecutan la variante fp16 sin problemas; el modelo también corre en CPU.
- Segmentación recomendada: int8 para móviles, tablets y equipos con 4 GB de RAM o menos; fp16 con datos externos (`model_fp16_ext.onnx` + `.onnx_data`) para escritorio y servidor.
- Despliegue: ONNX Runtime Web / `transformers.js` en navegador (WebGPU o WASM) y `onnxruntime` en Python, C++ o C# para servidor. No es compatible con vLLM, TGI, llama.cpp ni Ollama: no es un modelo generativo y no se distribuye en GGUF.
- Latencia y throughput: no disponibles. El autor no publica medidas de tiempo por segmento ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Base / parámetros | Idiomas | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Mike0307/ai-text-detector-zh-en` | XLM-RoBERTa base, ≈278 M | zh, en | 5 clases + probabilidad calibrada | MIT | ONNX fp32/fp16/int8, inferencia en navegador |
| `openai-community/roberta-base-openai-detector` | RoBERTa base, ≈125 M | en | binaria (GPT-2 vs humano) | no disponible | pesos PyTorch; calibrado para salidas de GPT-2 |
| `Hello-SimpleAI/chatgpt-detector-roberta` | RoBERTa base, ≈125 M | en (existe variante zh) | binaria | no disponible | pesos PyTorch |
| Servicios comerciales (GPTZero, Originality.ai, Copyleaks) | no disponible (propietario) | múltiples | probabilidad + veredicto | licencia de servicio | solo API/SaaS, sin pesos |

No se dispone de datos públicos que permitan comparar AUROC o exactitud entre estas alternativas sobre los mismos conjuntos de evaluación. Las diferencias verificables son de despliegue: este modelo es el único de la tabla que se distribuye en ONNX con variantes cuantizadas y admite ejecución local en navegador, mientras que los detectores comerciales no permiten inferencia offline y los detectores RoBERTa citados están pensados para texto en inglés y salidas de GPT-2.

## Limitaciones y advertencias

- Las salidas son estimaciones de probabilidad; el propio autor advierte de que no deben usarse como única base para decisiones disciplinarias o legales.
- Sesgo documentado hacia falsos positivos en textos cortos, escritura formal o jurídica, prosa literaria clásica y textos en inglés escritos por no nativos.
- La atribución de fuente solo es fiable para versiones de modelo presentes en el entrenamiento; degrada con modelos más nuevos y con texto de IA prompteado para imitar estilo humano.
- Los datos humanos de entrenamiento solo incluyen texto verificable como anterior al 30 de noviembre de 2022, lo que puede desplazar la frontera de decisión frente a escritura humana reciente.
- El conjunto de entrenamiento no es público, por lo que no se puede auditar la composición del corpus, los sesgos de dominio ni posibles filtraciones hacia los conjuntos de evaluación.
- El recorte de la capa de embeddings inutiliza el modelo para escrituras distintas del chino y el inglés (coreano, tailandés, árabe, cirílico, índico), aunque el tokenizador las acepte.
- Es obligatorio aplicar `id_map.bin` sobre los `input_ids`; omitir este paso produce predicciones silenciosamente incorrectas.
- La variante int8 se desvía de fp16 en el 1,4 % de los veredictos en distribución y hasta el 7,7 % en chino fuera de distribución; no debe mezclarse la calibración de fp16 con pesos int8.
- Licencia MIT permite uso comercial, pero sin garantías y sin datos de entrenamiento auditables; el modelo se publicó con 0 descargas y 1 like, sin validación independiente conocida.
- No debe presentarse como prueba definitiva de autoría: la detección de texto generado es intrínsecamente probabilística y adversarial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mike0307/ai-text-detector-zh-en
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Perfil de LinkedIn de "Mike Ye" (GenAI Technical Lead en CloudMile): https://tw.linkedin.com/in/mike-ye-09a8791b1/zh-tw — resultado de la búsqueda web; no se ha podido confirmar que corresponda al autor del modelo.
