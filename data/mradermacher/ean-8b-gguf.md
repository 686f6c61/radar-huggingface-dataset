# mradermacher/EAN-8B-GGUF

## Resumen

EAN-8B es una versión cuantizada en formato GGUF del modelo EVAN-8B, desarrollado por DawnLiu, realizada por el cuantizador mradermacher, conocido en la comunidad de Hugging Face por publicar cuantizaciones estáticas e imatrix de modelos populares. El modelo base es un modelo de 8B parámetros etiquetado como multimodal y orientado a razonamiento (reasoning), entrenado con aprendizaje por refuerzo sobre el dataset TIGER-Lab/ViRL39K, un conjunto de datos de problemas de razonamiento visual-matemático.

La relevancia de esta ficha radica en la disponibilidad del modelo en formato GGUF, lo que permite ejecutarlo localmente en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otros runtimes compatibles. Se ofrecen cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB), además de los archivos mmproj (multimodal projector) en Q8_0 y f16 necesarios para las capacidades de visión.

Cabe destacar que la model card original de DawnLiu/EVAN-8B no está incluida en la información disponible, por lo que detalles como la arquitectura exacta, la longitud de contexto o los benchmarks del modelo base no constan en esta ficha. El repositorio de cuantizaciones pesa 75,3 GB en total y acumula 754 descargas desde su creación en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, modelo base DawnLiu/EVAN-8B) |
| Parametros totales | 8.190.735.360 (~8,19B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La información sobre la arquitectura del modelo base es escasa, ya que la model card de DawnLiu/EVAN-8B no está disponible en los datos proporcionados. Por los metadatos, se trata de un modelo de aproximadamente 8,19 mil millones de parámetros con capacidades multimodales (existen archivos mmproj, el proyector multimodal usado por llama.cpp para procesar imágenes) y orientado a razonamiento mediante aprendizaje por refuerzo. El dataset de entrenamiento referenciado es TIGER-Lab/ViRL39K, una colección de 39K problemas de razonamiento visual y matemático con respuesta verificable, habitualmente empleada en entrenamiento RLVR (reinforcement learning with verifiable rewards) para modelos de razonamiento multimodal.

La contribución de mradermacher es la conversión a GGUF mediante cuantización estática (convert_type hf), con una gama completa de cuantizaciones k-quant e i-quant. Además del repositorio de cuants estáticos, existe una versión con cuantizaciones imatrix (matriz de importancia) ponderada en mradermacher/EAN-8B-i1-GGUF, que suele ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Razonamiento: el modelo base está entrenado con RL sobre datos de razonamiento (tags: reasoning, reinforcement-learning), orientado a tareas de razonamiento con respuesta verificable.
- Multimodalidad: incluye archivos mmproj (Q8_0 y f16), lo que indica capacidad de procesamiento de imágenes junto al texto en runtimes compatibles como llama.cpp.
- Razonamiento matemático y visual: el dataset ViRL39K se compone de problemas matemáticos y de razonamiento visual, por lo que el modelo está especializado en estas tareas.
- Conversación: etiquetado como conversational, apto para uso como asistente de chat.
- Generación de código, tool calling y soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingues: los metadatos solo declaran inglés; el rendimiento en castellano no está documentado.

## Casos de uso

- Resolución de problemas matemáticos con imágenes: gracias al entrenamiento sobre ViRL39K, el modelo puede interpretar gráficas, diagramas geométricos o figuras y razonar sobre ellas paso a paso para dar una solución numérica.
- Ejecución local en hardware de consumo: la cuantización Q4_K_M (5,1 GB) permite cargar el modelo en GPUs con 6-8 GB de VRAM o incluso en CPU con RAM suficiente, ideal para experimentación sin coste de API.
- Asistente de razonamiento offline: al ser GGUF, puede desplegarse con Ollama o llama.cpp en entornos sin conexión, útil para privacidad de datos en empresas o investigación.
- Tutoría educativa: puede emplearse como solucionador de ejercicios de matemáticas y geometría a partir de fotografías o capturas de enunciados, verificando respuestas de forma determinista.
- Prototipado de agentes multimodales ligeros: su tamaño de 8B y su licencia Apache 2.0 lo hacen adecuado para integrarse en pipelines de razonamiento visual con restricciones de coste.
- Evaluación comparativa de cuantizaciones: la amplia gama de cuants (Q2_K a f16) permite estudiar la degradación de calidad en tareas de razonamiento según el nivel de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantización no incluye evaluaciones y los datos del modelo base (DawnLiu/EVAN-8B) no están accesibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin mmproj ni KV cache):
  - Q2_K: ~3,4 GB; Q3_K_M: ~4,2 GB; Q4_K_M: ~5,1 GB; Q5_K_M: ~6,0 GB; Q6_K: ~6,8 GB; Q8_0: ~8,8 GB; f16: ~16,5 GB.
  - El proyector multimodal añade ~0,9 GB (Q8_0) o ~1,3 GB (f16).
- GPUs recomendadas: cualquier GPU moderna con 6-8 GB de VRAM ejecuta cómodamente Q4_K_M/Q5_K_M (RTX 3060 12GB, RTX 4060 Ti, RTX 4070); con 12-16 GB cabe Q8_0 (RTX 4080, RTX 4090); para f16 se recomienda RTX 4090 (24 GB) o superior.
- Consumer GPUs: sí, es un modelo de 8B cuantizado, totalmente viable en GPUs de consumo e incluso en CPU puro (con RAM de 8-16 GB para cuants bajos), aunque con menor throughput.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, incluye soporte mmproj para visión), Ollama, LM Studio, koboldcpp y otros runtimes compatibles con GGUF. No está orientado a vLLM/TGI en este formato (esos requieren los pesos originales safetensors del modelo base).
- Latencia y throughput: no disponible; en GPUs de consumo con Q4_K_M, un modelo de 8B típicamente supera los 40-60 tokens/s, pero no hay cifras oficiales publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EAN-8B (esta ficha) | 8,19B | Sí (mmproj) | Apache 2.0 | GGUF | Especializado en razonamiento visual-matemático con RL |
| Qwen2.5-VL-7B | 7,6B | Sí | Apache 2.0 | Safetensors/GGUF | Multimodal generalista, amplio soporte de idiomas |
| Llama-3.1-8B | 8,0B | No (solo texto) | Licencia Llama 3.1 | Safetensors/GGUF | Generalista de texto, sin capacidades de visión |
| MiniCPM-V 2.6 | 8,1B | Sí | Licencia propia (uso comercial restringido) | Safetensors/GGUF | Multimodal ligero con buen rendimiento en benchmarks de visión |

La comparativa es orientativa: no hay benchmarks publicados de EAN-8B que permitan comparar rendimiento numérico directo.

## Limitaciones y advertencias

- La model card del modelo base (DawnLiu/EVAN-8B) no está disponible en la información proporcionada: arquitectura, contexto, datos de entrenamiento y benchmarks son desconocidos, lo que dificulta evaluar su fiabilidad antes de producción.
- Idioma: los metadatos declaran solo inglés; el rendimiento en castellano no está documentado y puede ser inferior.
- Riesgo de alucinación: como todo LLM, puede generar respuestas incorrectas con apariencia plausible, especialmente en razonamiento matemático complejo; se recomienda verificación de resultados.
- Sesgos: no se ha documentado ningún análisis de sesgos para este modelo.
- Contexto: la longitud de ventana no está publicada; conviene verificarla empíricamente antes de tareas con documentos largos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S/M) pueden degradar notablemente el rendimiento en tareas de razonamiento fino; se recomiendan Q4_K_M o superiores.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque la licencia del modelo base es la misma según metadatos; no se han identificado caveats legales adicionales.
- Las capacidades multimodales requieren un runtime con soporte mmproj (llama.cpp y derivados); no funcionarán en runtimes de solo texto sin configuración adicional.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/EAN-8B-GGUF
- Modelo base: https://huggingface.co/DawnLiu/EVAN-8B
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/EAN-8B-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#EAN-8B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
