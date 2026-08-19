# openbmb/MiniCPM-V-4_5-AWQ

## Resumen

MiniCPM-V 4.5 es un modelo multimodal de lenguaje y vision (MLLM) desarrollado por OpenBMB, la ultima y mas capaz iteracion de la serie MiniCPM-V. Construido sobre Qwen3-8B como backbone de lenguaje y SigLIP2-400M como encoder de vision, el modelo suma aproximadamente 8.700 millones de parametros en su version cuantizada AWQ. Su principal valor es ofrecer capacidades de nivel GPT-4o en un tamano compacto, ejecutable en dispositivos de consumo como telefonos o GPUs domesticas, lo que democratiza el acceso a modelos multimodales avanzados.

La version AWQ (Activation-aware Weight Quantization) es una cuantizacion a 4 bits del modelo base MiniCPM-V 4.5, disenada para reducir el uso de memoria y acelerar la inferencia sin sacrificar de forma significativa la calidad. El modelo destaca en tareas de OCR, parsing de documentos, comprension de video largo y razonamiento multimodal, con un mecanismo de pensamiento hibrido rapido/profundo controlable. Su arquitectura incorpora un 3D-Resampler unificado que comprime tokens de video hasta 96x, permitiendo procesar secuencias largas de video con coste de inferencia reducido.

La relevancia actual de este modelo radica en su equilibrio entre rendimiento y eficiencia: supera en benchmarks a modelos propietarios como GPT-4o-latest y Gemini 2.0 Pro en tareas de vision-lenguaje, con solo 8B de parametros. Ademas, su licencia abierta y el soporte para multiples frameworks de inferencia (vLLM, SGLang, llama.cpp, Ollama) lo convierten en una opcion practica para produccion y experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-8B + SigLIP2-400M + 3D-Resampler) |
| Parametros totales | 8.695.895.280 (8,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | AWQ 4-bit (esta version); tambien int4, GGUF (16 tamanos) |
| Idiomas soportados | Multilingue (mas de 30 idiomas) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (AWQ) |

## Arquitectura y entrenamiento

MiniCPM-V 4.5 combina un modelo de lenguaje Qwen3-8B con un encoder de vision SigLIP2-400M. La innovacion clave es el 3D-Resampler, un mecanismo unificado que comprime tokens tanto de imagenes como de video: 6 frames de 448x448 píxeles se comprimen en solo 64 tokens de video, frente a los 1.536 tokens que generarian la mayoria de MLLMs. Esta compresion de 96x permite procesar video de alta tasa de refresco (hasta 10 FPS) y secuencias largas sin incrementar el coste de inferencia del LLM.

El modelo sigue la arquitectura LLaVA-UHD para procesamiento de imagenes de alta resolucion, admitiendo cualquier relacion de aspecto y hasta 1,8 millones de píxeles (por ejemplo, 1344x1344) con 4x menos tokens visuales que otros MLLMs. El entrenamiento incorpora tecnicas de RLAIF-V y VisCPM para mejorar la fiabilidad de las respuestas y reducir alucinaciones. El modelo soporta modos de pensamiento rapido y profundo, intercambiables de forma controlada segun el escenario de uso.

No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento ni la composicion exacta del dataset, aunque se menciona el uso del dataset openbmb/RLAIF-V-Dataset. El modelo base fue publicado originalmente en agosto de 2025 y esta version AWQ se creo el 26 de agosto de 2025.

## Capacidades

- Comprension de imagenes individuales, multiples imagenes y video, con soporte para alta resolucion (hasta 1,8M píxeles) y cualquier relacion de aspecto.
- OCR de alto rendimiento: lidera OCRBench, superando a GPT-4o-latest y Gemini 2.5 en tareas de reconocimiento optico de caracteres.
- Parsing de documentos PDF: estado del arte en OmniDocBench entre MLLMs generales, capaz de extraer estructura y contenido de documentos complejos.
- Comprension de video largo: procesa hasta 10 FPS con compresion 96x de tokens de video, manteniendo rendimiento en benchmarks como Video-MME, LVBench, MLVU, MotionBench y FavorBench.
- Razonamiento multimodal hibrido: modo de pensamiento rapido para tareas frecuentes y modo de pensamiento profundo para problemas complejos, con conmutacion controlable.
- Comportamiento fiable: supera a GPT-4o-latest en MMHal-Bench, indicando menor tasa de alucinaciones.
- Capacidades multilingues: soporta mas de 30 idiomas.
- Integracion con herramientas: compatible con vLLM, SGLang, llama.cpp, Ollama y Transformers para despliegue y fine-tuning.

## Casos de uso

- Atencion al cliente multimodal automatizada: el modelo puede procesar capturas de pantalla, fotos de productos o documentos enviados por usuarios, combinando OCR y comprension de lenguaje para resolver incidencias en multiples turnos. Su compresion de tokens permite mantener conversaciones largas con contexto visual sin degradacion de rendimiento.

- Extraccion de datos de documentos y facturas: gracias a su rendimiento en OmniDocBench, puede parsear PDFs complejos, extraer tablas, campos clave y estructura jerarquica, integrándose en pipelines de automatizacion de procesos administrativos.

- Analisis de video de vigilancia o contenido multimedia: el modelo procesa secuencias de video de hasta 10 FPS, permitiendo detectar eventos, transcribir acciones o generar resumenes descriptivos de grabaciones largas con un coste computacional reducido.

- Asistente de accesibilidad para personas con discapacidad visual: combinando OCR, descripcion de escenas y soporte multilingue, el modelo puede describir el entorno, leer carteles o documentos en tiempo real desde un dispositivo movil.

- Generacion de contenido educativo multimodal: el modelo puede analizar diagramas, graficos o ilustraciones cientificas y generar explicaciones detalladas, adaptadas al nivel del estudiante, aprovechando su modo de pensamiento profundo para razonamiento complejo.

- Moderacion de contenido visual en redes sociales: el modelo puede clasificar imagenes y videos, detectar contenido inapropiado o generar descripciones automaticas para accesibilidad, con la ventaja de ejecutarse en GPU de consumo para reducir costes de infraestructura.

- Desarrollo de agentes roboticos o asistentes de navegacion: su capacidad de procesar video en tiempo real y su bajo coste de inferencia permiten integrarlo en sistemas embebidos para tareas de navegacion, reconocimiento de objetos o interaccion con el entorno.

## Benchmarks y rendimiento

Segun la informacion proporcionada, MiniCPM-V 4.5 alcanza una puntuacion media de 77.2 en OpenCompass, una evaluacion compuesta de 8 benchmarks populares. Con solo 8B de parametros, supera a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B en capacidades de vision-lenguaje. Tambien lidera OCRBench y obtiene resultados de estado del arte en OmniDocBench y MMHal-Bench.

No se han publicado en la informacion disponible los resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) para esta version AWQ. Los datos proporcionados se refieren al modelo base MiniCPM-V 4.5, y no se especifica si la cuantizacion AWQ introduce degradacion en estos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion AWQ 4-bit y 8,7B de parametros, el modelo requiere aproximadamente 5-6 GB de VRAM para inferencia en FP16, y alrededor de 3-4 GB en 4-bit, dependiendo de la longitud del contexto y el numero de imagenes procesadas.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 8 GB de VRAM. En cuantizacion 4-bit puede ejecutarse en GPUs de 6 GB como la RTX 2060 o incluso en Apple Silicon via llama.cpp.
- Compatibilidad con GPU de consumo: si, es viable en GPUs consumer de gama media-alta (RTX 3060 12GB, RTX 4070, etc.) gracias a la cuantizacion AWQ.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, Transformers, TGI. Tambien existe soporte para iOS (iPhone y iPad) mediante una app demo optimizada.
- Latencia y throughput: no se proporcionan datos numericos especificos, pero la compresion 3D-Resampler reduce significativamente el numero de tokens de video, lo que mejora la latencia en tareas de video frente a modelos sin esta optimizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.5 (AWQ) | 8,7B | No disponible | OpenCompass 77.2, supera a GPT-4o en OCR y MMHal | No disponible | HuggingFace, abierto |
| Qwen2.5-VL 72B | 72B | No disponible | Inferior a MiniCPM-V 4.5 en OpenCompass | Apache 2.0 | HuggingFace, abierto |
| GPT-4o-latest | No publico | No publico | Inferior en OpenCompass, OCRBench y MMHal | Propietaria | API |
| Gemini 2.0 Pro | No publico | No publico | Inferior en OpenCompass | Propietaria | API |
| MiniCPM-V 4.6 | 1,3B | No disponible | Superior a Gemma4-E2B-it, mas eficiente que Qwen3.5-0.8B | No disponible | HuggingFace, abierto |

La comparativa muestra que MiniCPM-V 4.5 ofrece un rendimiento superior a modelos mucho mas grandes (Qwen2.5-VL 72B) y a modelos propietarios de ultima generacion, con un tamano drasticamente menor. La version 4.6 de la misma serie es una alternativa mas ligera (1,3B) para escenarios con restricciones extremas de recursos.

## Limitaciones y advertencias

- La licencia exacta no esta disponible en la informacion proporcionada; antes de usar el modelo en produccion comercial, es imprescindible verificar los terminos de la licencia en el repositorio oficial.
- No se han publicado resultados desglosados de benchmarks para la version AWQ; la cuantizacion puede introducir degradacion en tareas de alta precision como OCR o razonamiento matematico.
- La longitud de contexto no esta documentada en la informacion disponible; se recomienda probar el modelo con secuencias largas antes de desplegarlo en escenarios que requieran contexto extenso.
- Aunque el modelo muestra baja tasa de alucinaciones en MMHal-Bench, ningun modelo multimodal es inmune a errores de hecho, especialmente en imagenes ambiguas o de baja calidad.
- El soporte multilingue cubre mas de 30 idiomas, pero el rendimiento puede variar significativamente entre idiomas; se recomienda evaluar en el idioma objetivo.
- El procesamiento de video de alta tasa de refresco (10 FPS) puede requerir hardware especifico y un ajuste fino de los parametros de inferencia para evitar cuellos de botella.
- El modelo requiere custom code para su uso con Transformers, lo que puede complicar su integracion en entornos con restricciones de seguridad o politicas de dependencias.

## Enlaces

- HuggingFace (modelo AWQ): https://huggingface.co/openbmb/MiniCPM-V-4_5-AWQ
- HuggingFace (modelo base): https://huggingface.co/openbmb/MiniCPM-V-4_5
- HuggingFace (version int4): https://huggingface.co/openbmb/MiniCPM-V-4_5-int4
- HuggingFace (version GGUF): https://huggingface.co/openbmb/MiniCPM-V-4_5-gguf
- GitHub (MiniCPM-o): https://github.com/OpenBMB/MiniCPM-o
- GitHub (MiniCPM-V): https://github.com/OpenBMB/MiniCPM-V
- Demo online: http://101.126.42.235:30910/
- iOS demo: https://github.com/tc-mb/MiniCPM-o-demo-iOS
- Cookbook de uso: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Paper LLaVA-UHD: https://arxiv.org/pdf/2403.11703
- RLAIF-V: https://github.com/RLHF-V/RLAIF-V/
- VisCPM: https://github.com/OpenBMB/VisCPM
- Wiki (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
