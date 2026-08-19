# openbmb/MiniCPM-V-4_5-gguf

## Resumen

MiniCPM-V 4.5 es un modelo de lenguaje multimodal (MLLM) de 8 000 millones de parámetros desarrollado por OpenBMB, construido sobre el LLM Qwen3-8B y el codificador visual SigLIP2-400M. Está diseñado para comprensión de imagen única, múltiples imágenes y vídeo, con capacidades destacadas de OCR y parsing de documentos. Su principal innovación es un 3D-Resampler unificado que comprime los tokens de vídeo en un factor de 96x, lo que permite procesar hasta 10 FPS de vídeo sin incrementar el coste de inferencia del LLM, y un procesamiento de imágenes de alta resolución (hasta 1,8 millones de píxeles) con 4x menos tokens visuales que la mayoría de los MLLM.

Con solo 8B parámetros, el modelo alcanza una puntuación media de 77,2 en OpenCompass (evaluación de 8 benchmarks populares), superando a modelos propietarios como GPT-4o-latest y Gemini-2.0 Pro, así como a modelos abiertos más grandes como Qwen2.5-VL 72B. Este repositorio contiene la versión cuantizada en formato GGUF, pensada para inferencia eficiente en CPU y dispositivos locales mediante llama.cpp u Ollama, con 16 tamaños de cuantización disponibles.

El modelo es relevante ahora porque ofrece capacidades de nivel GPT-4o en un tamaño que cabe en un teléfono móvil, con soporte multilingüe en más de 30 idiomas y un modo de pensamiento híbrido (rápido/profundo) controlable, lo que lo convierte en una opción atractiva para despliegues en producción con requisitos de latencia y memoria ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (LLM) + SigLIP2-400M (vision encoder) + 3D-Resampler unificado |
| Parametros totales | 8.189.195.264 (8,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (16 tamaños), int4, AWQ |
| Idiomas soportados | Multilingue (mas de 30 idiomas) |
| Licencia | No disponible |
| Formato de pesos | GGUF (este repo), safetensors (modelo base) |

## Arquitectura y entrenamiento

MiniCPM-V 4.5 combina un LLM Qwen3-8B como backbone de lenguaje con un codificador visual SigLIP2-400M. La conexión entre ambos se realiza mediante un 3D-Resampler unificado que procesa tanto imágenes como vídeo, comprimiendo los tokens visuales de forma eficiente: 6 fotogramas de 448x448 píxeles se reducen a 64 tokens de vídeo, frente a los 1 536 tokens típicos de otros MLLM. Esta compresión permite una tasa de refresco de hasta 10 FPS en vídeo y una comprensión de vídeos largos sin incrementar el coste de inferencia.

El modelo se basa en la arquitectura LLaVA-UHD para el procesamiento de imágenes de alta resolución con cualquier relación de aspecto, hasta 1,8 millones de píxeles (por ejemplo, 1344x1344). El entrenamiento incorpora las técnicas RLAIF-V y VisCPM, orientadas a mejorar la fiabilidad de las respuestas y reducir alucinaciones. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset, aunque se menciona el dataset openbmb/RLAIF-V-Dataset como parte del proceso. El modelo soporta un modo de pensamiento híbrido rápido/profundo que puede activarse de forma controlada según el escenario de uso.

## Capacidades

- Comprensión de imagen unica, multiples imagenes y video en un mismo modelo.
- OCR de alta precision: lidera OCRBench, superando a GPT-4o-latest y Gemini 2.5.
- Parsing de documentos PDF: estado del arte en OmniDocBench entre MLLM generales.
- Procesamiento de imagenes de alta resolucion (hasta 1,8M pixeles) con 4x menos tokens visuales que la mayoria de MLLM.
- Compresion de tokens de video en factor 96x, permitiendo hasta 10 FPS de video.
- Modo de pensamiento hibrido controlable: rapido para tareas frecuentes y profundo para problemas complejos.
- Soporte multilingue en mas de 30 idiomas.
- Comportamiento fiable: supera a GPT-4o-latest en MMHal-Bench (evaluacion de alucinaciones).
- Inferencia eficiente en CPU mediante llama.cpp y Ollama, y en GPU con vLLM, SGLang y Transformers.

## Casos de uso

- Digitalizacion de documentos: el modelo puede extraer texto de imagenes escaneadas y PDFs con alta precision, gracias a su rendimiento en OCRBench y OmniDocBench. Adecuado para flujos de trabajo de gestion documental en empresas.
- Analisis de video en tiempo real: con su compresion de tokens 96x y soporte de hasta 10 FPS, puede procesar secuencias de video para detectar objetos, eventos o transcribir dialogos en aplicaciones de vigilancia o analisis de contenido.
- Asistente multimodal en dispositivos moviles: gracias a su tamano compacto (8B) y soporte en llama.cpp/Ollama, puede ejecutarse en un iPhone o iPad (hay una demo iOS oficial) para responder preguntas sobre fotos, documentos o video capturado.
- Accesibilidad para personas con discapacidad visual: el modelo puede describir imagenes, leer texto de senales o documentos en tiempo real, y responder preguntas sobre el entorno, funcionando en un telefono con inferencia local.
- Educacion y tutoria interactiva: puede analizar capturas de pantalla de problemas de matematicas o diagramas y proporcionar explicaciones paso a paso, aprovechando su modo de pensamiento profundo para razonamiento complejo.
- Automatizacion de atencion al cliente: combinado con tool calling (si se configura), puede procesar capturas de pantalla de errores, facturas o formularios enviados por usuarios, y generar respuestas contextuales en varios idiomas.
- Analisis de contenido en redes sociales: puede clasificar y describir imagenes o videos cortos, detectar texto superpuesto (memes, infografias) y generar metadatos para moderacion o recomendacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos detallados de benchmarks en la informacion disponible. La model card menciona los siguientes logros cualitativos:

- Puntuacion media de 77,2 en OpenCompass (8 benchmarks populares), superando a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B.
- Rendimiento lider en OCRBench, superando a GPT-4o-latest y Gemini 2.5.
- Estado del arte en OmniDocBench para parsing de documentos PDF entre MLLM generales.
- Superior a GPT-4o-latest en MMHal-Bench, indicando menor tasa de alucinaciones.
- Rendimiento destacado en Video-MME, LVBench, MLVU, MotionBench y FavorBench para comprension de video.

No se dispone de cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: dependiendo de la cuantizacion GGUF, un modelo de 8B parametros requiere aproximadamente entre 4 GB (cuantizacion Q4) y 16 GB (FP16). Para la version int4 se estiman unos 5 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar la cuantizacion Q4 (por ejemplo, RTX 3060, RTX 4060). Para FP16 se recomienda una GPU con 16 GB o mas, como RTX 4090, A100 o H100.
- Inferencia en CPU: compatible con llama.cpp y Ollama, permitiendo ejecucion en CPU con cuantizaciones bajas (Q4 o inferiores) en equipos con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, Transformers y LLaMA-Factory para fine-tuning.
- Latencia y throughput: no se han publicado datos especificos. En una GPU consumer (RTX 4090) con cuantizacion Q4, se espera una latencia de pocos cientos de milisegundos por token, aunque depende del numero de tokens visuales procesados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Video | OCR | Licencia |
|---|---|---|---|---|---|---|
| MiniCPM-V 4.5 (este) | 8,2B | No disponible | Si | Si (10 FPS) | Excelente | No disponible |
| MiniCPM-V 4 | 4,1B | No disponible | Si | Si | Bueno | No disponible |
| MiniCPM-V 4.6 | 1,3B | No disponible | Si | Si | Bueno | No disponible |
| Qwen2.5-VL 7B | 7,6B | 128K | Si | Si | Bueno | Apache 2.0 |

MiniCPM-V 4.5 se posiciona como el modelo mas capaz de la serie MiniCPM-V, con un rendimiento superior a Qwen2.5-VL 72B en vision-lenguaje segun OpenCompass, aunque con una licencia no especificada que puede limitar su uso comercial. MiniCPM-V 4 y 4.6 son alternativas mas ligeras para escenarios con restricciones de recursos, mientras que Qwen2.5-VL 7B ofrece una licencia permisiva (Apache 2.0) y un contexto largo de 128K, pero con menor rendimiento en OCR y video segun la informacion disponible.

## Limitaciones y advertencias

- La licencia del modelo no esta disponible en la informacion proporcionada, lo que supone un riesgo para uso comercial o en entornos empresariales. Se recomienda contactar con los autores antes de desplegarlo en produccion.
- No se ha especificado la longitud de contexto, por lo que no se conocen los limites de ventana para conversaciones largas o documentos extensos.
- Aunque el modelo supera a GPT-4o-latest en MMHal-Bench, sigue siendo un LLM y puede generar alucinaciones, especialmente en tareas de razonamiento complejo o con imagenes ambiguas.
- El soporte multilingue cubre mas de 30 idiomas, pero el rendimiento puede variar significativamente entre idiomas, con mejores resultados en ingles y chino (idiomas principales del entrenamiento).
- La compresion de tokens de video en factor 96x puede perder detalles finos en escenas con movimiento rapido o texto pequeno en video.
- No se han publicado detalles sobre el proceso de entrenamiento (datos, numero de tokens, tecnicas de alineamiento), lo que dificulta evaluar posibles sesgos en el comportamiento del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4_5-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4_5
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-o
- Demo online: http://101.126.42.235:30910/
- Paper LLaVA-UHD (arquitectura de alta resolucion): https://arxiv.org/pdf/2403.11703
- RLAIF-V (tecnica de alineamiento): https://github.com/RLHF-V/RLAIF-V/
- VisCPM (tecnica de alineamiento): https://github.com/OpenBMB/VisCPM
- Cookbook de uso: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo iOS: https://github.com/tc-mb/MiniCPM-o-demo-iOS
