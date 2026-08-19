# FreedomAISVR/Gemma-4-E2B-it-QAT-MXFP4-GGUF

## Resumen

Gemma 4 E2B Instruct QAT MXFP4 es una cuantizacion hibrida del modelo oficial de Google `gemma-4-E2B-it-qat-q4_0-unquantized`, publicada por el usuario FreedomAISVR. El modelo original, desarrollado por Google DeepMind, es un LLM multimodal de la familia Gemma 4 con aproximadamente 4.630 millones de parametros, entrenado con Quantization-Aware Training (QAT) para ser resiliente a la cuantizacion Q4_0. La contribucion de FreedomAISVR consiste en preservar todos los tensores de pesos en Q4_0 tal y como Google los entreno, cuantizando unicamente los tensores de overhead (norms y biases) a MXFP4, un formato de precision reducida optimizado para hardware Blackwell de NVIDIA.

Esta aproximacion hibrida resuelve un problema especifico: la requantizacion de pesos Q4_0 a MXFP4 introduce una segunda ronda de error de cuantizacion que el entrenamiento QAT no contempla, degradando especialmente la calidad de la vision multimodal. Al mantener los pesos intactos y cuantizar solo los tensores de normalizacion, se conservan los beneficios del QAT y la calidad visual, reduciendo el tamano total del archivo. El modelo se distribuye en formato GGUF, lo que permite su ejecucion en llama.cpp y ecosistemas compatibles, e incluye el proyector de vision (mmproj) entrenado junto al modelo QAT.

La relevancia actual de este modelo reside en su licencia Apache 2.0, su soporte multimodal completo y su optimizacion para hardware Blackwell, lo que lo convierte en una opcion atractiva para despliegues en produccion que requieran vision por computador y generacion de texto con una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B), encoder-free con vision encoder |
| Parametros totales | 4.628.569.635 |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (pesos) + MXFP4 (tensores de normalizacion y bias) |
| Idiomas soportados | Ingles, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj separado para vision) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal de la familia Gemma 4, con aproximadamente 4.630 millones de parametros. Google DeepMind lo entreno con Quantization-Aware Training, un proceso que incorpora la cuantizacion Q4_0 durante el entrenamiento para que los pesos aprendidos compensen los errores de redondeo. Esta tecnica hace que el modelo sea particularmente robusto a la cuantizacion posterior, manteniendo la calidad tanto en texto como en vision.

La contribucion de FreedomAISVR es una cuantizacion hibrida que combina dos formatos: los tensores de pesos (attention, FFN, embeddings) se mantienen en Q4_0 exactamente como Google los publico, mientras que los tensores de overhead (layer norms, RMS norms, biases) se cuantizan a MXFP4, un formato de punto flotante de precision reducida disenado para la arquitectura Blackwell de NVIDIA. Esta estrategia evita la doble cuantizacion (Q4_0 a F32 a MXFP4) que degradaria la calidad visual, ya que los tokens de vision fluyen a traves de las mismas capas de attention y FFN que el texto. El proyector de vision (mmproj) tambien es el oficial del modelo QAT de Google.

## Capacidades

- Generacion de texto y razonamiento con thinking mode habilitado por defecto.
- Comprension multimodal: acepta imagenes como entrada y genera descripciones, respuestas y analisis visual.
- Soporte de chat multi-turno con plantilla nativa de Gemma 4.
- Capacidades multilingues, con soporte principal de ingles y otros idiomas.
- Compatible con tool calling y function calling (sujeto al soporte del runtime, p. ej. llama.cpp).
- Optimizado para hardware Blackwell gracias al formato MXFP4 en tensores de overhead.

## Casos de uso

- Vision por computador en produccion: el modelo puede analizar imagenes en tiempo real, describir contenido visual y responder preguntas sobre ellas. Su cuantizacion Q4_0 preserva la calidad visual, por lo que es adecuado para tareas de clasificacion de imagenes, moderacion de contenido o generacion de alt-text automatizado.
- Asistente de codigo con contexto visual: puede recibir capturas de pantalla de errores, diagramas de arquitectura o documentacion visual y generar codigo o explicaciones tecnicas. Su ventana de contexto (no especificada) permite trabajar con proyectos de tamano moderado.
- Atencion al cliente multimodal: gestiona conversaciones multi-turno donde el usuario adjunta imagenes (fotografias de productos, capturas de pantalla, documentos escaneados) y el modelo responde con texto coherente y contextualizado.
- Analisis de documentos: procesa paginas escaneadas o fotografias de documentos, extrayendo informacion relevante y respondiendo preguntas sobre el contenido.
- Despliegue en edge con llama.cpp: al ser GGUF y caber en GPUs de consumo, puede ejecutarse en servidores locales o estaciones de trabajo sin conexion a la nube, manteniendo la privacidad de los datos.
- Prototipado rapido de agentes conversacionales: su licencia Apache 2.0 y su compatibilidad con llama-server permiten integrarlo en pipelines de desarrollo sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF principal ocupa aproximadamente 7,9 GB en total (incluyendo el mmproj), por lo que se estima un uso de VRAM de 5-6 GB con Q4_0 y offloading parcial a CPU.
- GPU recomendadas: NVIDIA RTX 3060 12GB o superior, RTX 4090, A100, H100. GPUs con arquitectura Blackwell (B200, RTX 50 series) se benefician del formato MXFP4.
- Si cabe en consumer GPU: si, en GPUs de 8 GB o mas, aunque se recomienda al menos 12 GB para una experiencia fluida con vision.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (si se importa el GGUF), LM Studio, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependera del hardware y del numero de tokens de vision procesados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B QAT MXFP4 (este) | 4,6B | No disponible | Si | Apache 2.0 | GGUF |
| Gemma 3 4B (referencia) | 4B | 128K (aprox.) | Si | Gemma Terms | Safetensors, GGUF |
| Qwen2.5-VL 7B (referencia) | 7,6B | 128K | Si | Apache 2.0 | Safetensors, GGUF |

Nota: los datos de Gemma 3 y Qwen2.5-VL son orientativos y pueden variar segun la version especifica. La comparativa se basa en modelos de tamano similar con capacidades multimodales.

## Limitaciones y advertencias

- La longitud de contexto no esta especificada en la informacion disponible; se recomienda verificar la configuracion del modelo base de Google antes de usarlo en produccion.
- El modelo esta optimizado principalmente para ingles; el rendimiento en otros idiomas puede ser inferior.
- La cuantizacion MXFP4 de los tensores de normalizacion puede requerir hardware Blackwell para aprovechar plenamente las optimizaciones de velocidad; en GPUs mas antiguas el rendimiento puede ser similar al de una cuantizacion Q4_0 estandar.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de vision donde la interpretacion de imagenes ambiguas puede generar respuestas incorrectas.
- Aunque la licencia es Apache 2.0, el modelo base de Google puede tener terminos adicionales de uso aceptable que deben revisarse.
- El thinking mode habilitado por defecto puede aumentar la latencia en tareas simples; se puede desactivar segun la configuracion del runtime.
- No se dispone de informacion sobre sesgos especificos del modelo ni evaluaciones de seguridad publicadas para esta cuantizacion concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FreedomAISVR/Gemma-4-E2B-it-QAT-MXFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Informe tecnico de Gemma 4: https://arxiv.org/html/2607.02770v1
