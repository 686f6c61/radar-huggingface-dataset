# openbmb/MiniCPM-V-4_5-int4

## Resumen

MiniCPM-V 4.5 es un modelo multimodal de lenguaje y visión (MLLM) desarrollado por el equipo OpenBMB, que combina un backbone de lenguaje Qwen3-8B con un codificador visual SigLIP2-400M, sumando un total de 8.700 millones de parámetros. Esta variante int4 es la versión cuantizada a 4 bits del modelo original, diseñada para facilitar su despliegue en dispositivos con recursos limitados, incluyendo teléfonos móviles y equipos sin GPU dedicada. El modelo destaca por su capacidad para procesar imágenes individuales, múltiples imágenes y vídeo de alta tasa de fotogramas, con una compresión de tokens visuales que alcanza una reducción de 96x respecto a otros MLLMs.

La relevancia actual de MiniCPM-V 4.5 reside en que, con solo 8B parámetros, logra un rendimiento superior al de modelos propietarios como GPT-4o-latest y Gemini-2.0 Pro en evaluación conjunta de 8 benchmarks populares, alcanzando una puntuación media de 77.0 en OpenCompass. Además, incorpora un modo de pensamiento híbrido controlable (rápido/profundo), capacidades OCR líderes y soporte multilingüe en más de 30 idiomas. Su licencia Apache-2.0 permite uso comercial sin restricciones, y su formato int4 reduce el tamaño del repositorio a 6,5 GB, haciéndolo accesible para inferencia local eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-8B + SigLIP2-400M + 3D-Resampler) |
| Parametros totales | 8.695.895.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta hasta 1,8 millones de pixeles por imagen) |
| Tipos de cuantizacion | int4 (esta variante), GGUF, AWQ, 8-bit |
| Idiomas soportados | Multilingue (mas de 30 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM-V 4.5 se construye sobre una arquitectura transformer multimodal que integra tres componentes principales: un modelo de lenguaje Qwen3-8B como backbone, un codificador visual SigLIP2-400M y un novedoso 3D-Resampler unificado. Este resamplador tridimensional agrupa y comprime conjuntamente hasta 6 fotogramas de video consecutivos en solo 64 tokens (el mismo numero de tokens que se usa para una imagen individual en la serie MiniCPM-V), logrando una tasa de compresion de tokens de video de 96x. Esta innovacion permite procesar videos de alta tasa de fotogramas (hasta 10 FPS) y videos largos sin incrementar el coste computacional del LLM subyacente.

El entrenamiento se divide en dos fases principales. En la pre-entrenamiento, se adopta un enfoque unificado para el aprendizaje de OCR y conocimiento a partir de documentos: se corrompen dinamicamente las regiones de texto en los documentos con diferentes niveles de ruido y se pide al modelo que reconstruya el texto, aprendiendo asi a alternar entre reconocimiento de texto preciso (cuando el texto es visible) y razonamiento contextual multimodal (cuando el texto esta muy oscurecido). Este metodo elimina la dependencia de parsers de documentos propensos a errores y previene alucinaciones por aumento excesivo de datos OCR. La fase de post-entrenamiento utiliza las tecnicas RLAIF-V y VisCPM para mejorar la fiabilidad del comportamiento y las capacidades multilingues, superando a GPT-4o-latest en el benchmark MMHal-Bench.

## Capacidades

- Comprension de imagenes individuales con alta resolucion (hasta 1,8 millones de pixeles, p.ej. 1344x1344) y cualquier relacion de aspecto, usando 4x menos tokens visuales que la mayoria de MLLMs gracias a la arquitectura LLaVA-UHD.
- Comprension de multiples imagenes en una sola conversacion, con capacidad para comparar y razonar sobre varias imagenes simultaneamente.
- Comprension de video de alta tasa de fotogramas (hasta 10 FPS) y video largo, con compresion 96x de tokens de video mediante el 3D-Resampler.
- OCR lider en su categoria, superando a GPT-4o-latest y Gemini 2.5 en OCRBench, con capacidades de parseo de documentos PDF de nivel avanzado (estado del arte en OmniDocBench entre MLLMs generales).
- Modo de pensamiento hibrido controlable: modo rapido (fast thinking) para uso frecuente con rendimiento competitivo, y modo profundo (deep thinking) para resolucion de problemas complejos.
- Soporte multilingue en mas de 30 idiomas.
- Comportamiento fiable y veraz, superando a GPT-4o-latest en MMHal-Bench (evaluacion de alucinaciones).
- Capacidad de tool calling y function calling (no detallado en la documentacion, pero compatible con el ecosistema Qwen3).

## Casos de uso

- Analisis de documentos y facturas: el modelo puede procesar imagenes de documentos con alta resolucion, extrayendo texto con precision mediante su capacidad OCR lider, incluso en documentos con ruido o texto parcialmente oscurecido. Su licencia Apache-2.0 permite integrarlo en productos comerciales de gestion documental.
- Moderacion de contenido visual en redes sociales: gracias a su comprension de imagenes individuales y multiples, puede analizar imagenes subidas por usuarios para detectar contenido inapropiado, con un coste computacional reducido gracias a la cuantizacion int4.
- Asistente de video-vigilancia: su capacidad para procesar video de alta tasa de fotogramas (hasta 10 FPS) con compresion 96x permite analizar secuencias de video en tiempo real o casi tiempo real en hardware modesto, identificando eventos o anomalias.
- Atencion al cliente multimodal: el modelo puede gestionar conversaciones donde el usuario envia capturas de pantalla, fotos de productos o errores de software, combinando comprension visual con razonamiento textual multilingue en mas de 30 idiomas.
- Generacion de descripciones accesibles: para plataformas de contenido, puede generar descripciones alternativas (alt text) de imagenes y videos de forma automatica, mejorando la accesibilidad web. Su modo de pensamiento rapido permite procesar grandes volumenes con baja latencia.
- Educacion y tutoria visual: el modelo puede analizar fotografias de problemas matematicos, diagramas o experimentos cientificos y proporcionar explicaciones paso a paso, aprovechando su modo de pensamiento profundo para tareas complejas de razonamiento.
- Parseo de PDFs cientificos y tecnicos: su capacidad de parseo de documentos (estado del arte en OmniDocBench) permite extraer tablas, figuras y texto de articulos cientificos, alimentando pipelines de RAG (retrieval augmented generation) para busqueda semantica en investigacion.

## Benchmarks y rendimiento

Segun la informacion proporcionada en la model card:

| Benchmark | Resultado |
|---|---|
| OpenCompass (media de 8 benchmarks) | 77.0 |
| OCRBench | Supera a GPT-4o-latest y Gemini 2.5 (valor exacto no disponible) |
| OmniDocBench | Estado del arte entre MLLMs generales (valor exacto no disponible) |
| MMHal-Bench | Supera a GPT-4o-latest (valor exacto no disponible) |
| Video-MME, LVBench, MLVU, MotionBench, FavorBench | Estado del arte en comprension de video (valores exactos no disponibles) |

No se han publicado valores numericos detallados para benchmarks individuales en la informacion disponible. El modelo supera en rendimiento global a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B en evaluacion conjunta de vision-lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser una variante int4 con 8.7B parametros, el modelo requiere aproximadamente 5-6 GB de VRAM para inferencia en GPU, y puede ejecutarse en CPU con llama.cpp u Ollama con 16 GB de RAM.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior para inferencia comoda; RTX 4090 o A100 para procesamiento de video largo o despliegue concurrente.
- Compatible con GPU de consumo: si, cabe en GPUs consumer de gama media (RTX 3060 12GB, RTX 4060 Ti 16GB, etc.) gracias a la cuantizacion int4.
- Opciones de despliegue: llama.cpp (inferencia CPU eficiente), Ollama, SGLang, vLLM (alto rendimiento y uso eficiente de memoria), Transformers con fine-tuning, LLaMA-Factory para entrenamiento, WebUI demo con Gradio, y aplicacion iOS optimizada para iPhone y iPad.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque el modo fast thinking esta disenado para uso frecuente con baja latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.5 (int4) | 8.7B | no disponible (hasta 1,8M pixeles/imagen) | OpenCompass 77.0 | Apache-2.0 | HuggingFace, ModelScope |
| Qwen2.5-VL 72B | 72B | no disponible | Inferior a MiniCPM-V 4.5 en OpenCompass | Apache-2.0 | HuggingFace |
| GPT-4o-latest | no disponible | no disponible | Inferior a MiniCPM-V 4.5 en OpenCompass | Propietaria | API |
| Gemini-2.0 Pro | no disponible | no disponible | Inferior a MiniCPM-V 4.5 en OpenCompass | Propietaria | API |

El modelo se posiciona como el MLLM mas eficiente bajo 30B parametros, superando a modelos propietarios y a modelos abiertos mucho mas grandes como Qwen2.5-VL 72B en evaluacion conjunta de benchmarks de vision-lenguaje.

## Limitaciones y advertencias

- La longitud de contexto exacta del modelo no esta especificada en la documentacion disponible, lo que puede limitar el diseno de aplicaciones que requieran contextos conversacionales muy largos.
- Aunque el modelo supera a GPT-4o-latest en MMHal-Bench, persiste un riesgo residual de alucinacion, especialmente en escenarios con imagenes ambiguas o texto muy corrupto.
- El rendimiento en idiomas de baja representacion dentro de los 30 idiomas soportados puede ser inferior al de los idiomas principales.
- La cuantizacion int4 puede introducir una ligera degradacion de calidad respecto al modelo en precision completa, aunque no se han publicado metricas comparativas detalladas.
- El procesamiento de video de alta tasa de fotogramas, aunque eficiente, requiere suficiente memoria para almacenar los fotogramas decodificados antes de la compresion.
- Para despliegue en produccion, se recomienda validar el comportamiento del modelo en el dominio especifico de la aplicacion, especialmente en tareas de OCR con documentos muy especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4_5-int4
- Modelo base en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4_5
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- CookBook de MiniCPM-V: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Technical Report (arXiv 2509.18154): https://huggingface.co/papers/2509.18154
- Paper LLaVA-UHD (arXiv 2403.11703): https://arxiv.org/pdf/2403.11703
- Demo online: http://211.93.21.133:18120/
- Modelo en ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM-V-4_5-int4
- Repositorio GitHub MiniCPM-V: https://github.com/OpenBMB/MiniCPM-V
- Documentacion en ingles de MiniCPM-V 4.5: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/minicpm_v4_en.md
- Soporte llama.cpp para MiniCPM-V 4.5: https://github.com/tc-mb/llama.cpp/blob/Support-MiniCPM-V-4.5/docs/multimodal/minicpmv4.5.md
- Soporte Ollama: https://github.com/tc-mb/ollama/tree/MIniCPM-V
- Soporte SGLang: https://github.com/tc-mb/sglang/tree/main
- Aplicacion iOS: https://github.com/tc-mb/MiniCPM-o-demo-iOS
