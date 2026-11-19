# openbmb/MiniCPM-V-4_5

## Resumen

MiniCPM-V 4.5 es un modelo multimodal de lenguaje y vision (MLLM) desarrollado por OpenBMB, el equipo de investigacion detras de la familia MiniCPM. Se construye sobre un LLM Qwen3-8B combinado con un codificador visual SigLIP2-400M, alcanzando un total de aproximadamente 8.700 millones de parametros. El modelo esta disenado para comprension de imagenes individuales, multiples imagenes y video de alta tasa de fotogramas directamente en dispositivos moviles, y se posiciona como el MLLM mas capaz por debajo de 30.000 millones de parametros segun la evaluacion agregada de OpenCompass (77,0 de media en 8 benchmarks).

La innovacion central es un 3D-Resampler unificado que comprime hasta 6 fotogramas de video consecutivos en solo 64 tokens (frente a los 1.536 tokens habituales en la mayoria de MLLMs), logrando una tasa de compresion de 96x. Esto permite procesar video a hasta 10 FPS y videos largos sin incrementar el coste computacional del LLM. Ademas, incorpora un modo de pensamiento hibrido conmutables (rapido/profundo), capacidades OCR de primer nivel y soporte multilingue en mas de 30 idiomas.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y cuenta con cuantizaciones oficiales en int4, GGUF y AWQ, ademas de soporte en llama.cpp, Ollama, vLLM y SGLang. Su enfoque en eficiencia y su tamano contenido lo hacen relevante para despliegues en el borde (edge) y en produccion con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: LLM Qwen3-8B + vision encoder SigLIP2-400M + 3D-Resampler (basado en LLaVA-UHD) |
| Parametros totales | 8.695.895.280 (~8,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; soporta multiples imagenes y video largo mediante compresion de tokens |
| Tipos de cuantizacion | int4, GGUF, AWQ (16 tamanos disponibles) |
| Idiomas soportados | Multilingue, mas de 30 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF, int4, AWQ |

## Arquitectura y entrenamiento

MiniCPM-V 4.5 emplea una arquitectura multimodal compuesta por un LLM Qwen3-8B como decodificador de texto y un codificador visual SigLIP2-400M. La conexion entre vision y lenguaje se realiza mediante un 3D-Resampler unificado que codifica de forma conjunta imagenes, entradas multi-imagen y video. Este resampler agrupa y comprime hasta 6 fotogramas de video consecutivos en 64 tokens, la misma cantidad que usa la serie MiniCPM-V para una sola imagen, logrando una compresion de 96x en tokens de video. La arquitectura de procesamiento de imagen sigue el enfoque LLaVA-UHD, que permite manejar imagenes de alta resolucion con cualquier relacion de aspecto y hasta 1,8 millones de pixeles (por ejemplo, 1344x1344) usando 4x menos tokens visuales que la mayoria de MLLMs.

En cuanto al entrenamiento, el modelo utiliza la tecnica RLAIF-V (alineacion mediante IA de retroalimentacion) y VisCPM para lograr comportamientos mas fiables y capacidades multilingues. La pre-training introduce un enfoque unificado para aprender OCR y conocimiento a partir de documentos: se corrompen dinamicamente regiones de texto con distintos niveles de ruido y se pide al modelo que reconstruya el texto, de modo que aprende a alternar entre reconocimiento preciso de texto (cuando es visible) y razonamiento basado en contexto multimodal (cuando esta muy obstruido). Esto elimina la dependencia de parsers de documentos propensos a errores y reduce las alucinaciones por sobre-aumento de datos OCR. El modelo tambien soporta un modo de pensamiento hibrido conmutable entre rapido y profundo. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes individuales, multiples imagenes y video.
- Comprension de video de alta tasa de fotogramas (hasta 10 FPS) y video largo gracias a la compresion 96x del 3D-Resampler.
- OCR de alto rendimiento y parsing de documentos PDF, con resultados lideres en OCRBench y OmniDocBench entre MLLMs generales.
- Procesamiento de imagenes de alta resolucion con cualquier relacion de aspecto (hasta 1,8 millones de pixeles).
- Modo de pensamiento hibrido conmutable: pensamiento rapido para uso frecuente y pensamiento profundo para problemas complejos.
- Capacidades multilingues en mas de 30 idiomas.
- Comportamientos mas fiables (trustworthy) gracias a RLAIF-V, con resultados superiores a GPT-4o-latest en MMHal-Bench.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo de pensamiento profundo esta orientado a resolucion de problemas complejos.

## Casos de uso

- Digitalizacion y parsing de documentos: el modelo procesa PDFs e imagenes de alta resolucion con relacion de aspecto arbitraria y logra resultados lideres en OmniDocBench, por lo que es adecuado para extraer texto estructurado, tablas y conocimiento de facturas, contratos o informes sin depender de parsers externos.
- Analisis de video de vigilancia o deportivo: gracias a la comprension de video a hasta 10 FPS y a la compresion 96x de tokens, puede procesar secuencias largas en tiempo casi real para detectar eventos, contar objetos o describir acciones en grabaciones extensas.
- Asistencia en dispositivos moviles: con cuantizaciones int4, GGUF y AWQ y soporte en llama.cpp y Ollama, puede ejecutarse en iPhone, iPad y equipos de consumo para tareas de descripcion de imagenes, lectura de documentos o traduccion visual sin conexion.
- Atencion al cliente multimodal: puede gestionar conversaciones multi-turno en las que el usuario envia capturas de pantalla, fotos de productos o documentos, combinando OCR y razonamiento contextual en mas de 30 idiomas.
- Accesibilidad: descripcion de imagenes y video para personas con discapacidad visual, con capacidad de resumir escenas, leer texto en pantalla y narrar contenido audiovisual de forma eficiente en el dispositivo.
- Analisis de documentos financieros y tecnicos: extraccion de datos de estados de cuenta, graficos y diagramas tecnicos, aprovechando el modo de pensamiento profundo para razonamiento sobre conocimiento multimodal.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes y video en pipelines de produccion desplegados con vLLM o SGLang para alto throughput.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 77,0 | Supera a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B segun el autor |
| OCRBench | Lider entre MLLMs generales | Supera a GPT-4o-latest y Gemini 2.5 segun el autor |
| OmniDocBench | Estado del arte entre MLLMs generales | Parsing de documentos PDF |
| MMHal-Bench | Superior a GPT-4o-latest | Comportamiento fiable |
| Video-MME, LVBench, MLVU, MotionBench, FavorBench | Estado del arte en comprension de video de alta FPS y video largo | Segun el autor |

No se han publicado en la informacion disponible los valores numericos desagregados por benchmark mas alla de la media de OpenCompass (77,0).

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (BF16) el modelo de ~8,7B parametros requiere aproximadamente 17-18 GB, coherente con el tamano del repositorio (17,4 GB). En cuantizacion int4 o AWQ se reduce a unos 5-6 GB, y las versiones GGUF permiten ir mas alla en funcion del nivel de cuantizacion.
- GPU recomendadas: A100, H100 o GPUs de 24 GB (RTX 3090, RTX 4090) para inferencia en BF16; GPUs de 8-12 GB para cuantizaciones int4/AWQ.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y modelos con 8 GB o mas usando cuantizacion. Tambien soporta inferencia en CPU mediante llama.cpp y Ollama.
- Opciones de despliegue: transformers, vLLM, SGLang, llama.cpp, Ollama, LLaMA-Factory para fine-tuning, Gradio para demo local, y app nativa para iOS (iPhone/iPad).
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento VLM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.5 | ~8,7B | No disponible explicitamente | OpenCompass 77,0; lider en OCRBench y OmniDocBench | Apache 2.0 | Hugging Face, GGUF, int4, AWQ |
| Qwen2.5-VL 72B | 72B | No disponible | Superado por MiniCPM-V 4.5 en OpenCompass segun el autor | No disponible | Hugging Face |
| GPT-4o-latest | Propietario | No disponible | Superado en OpenCompass, OCRBench y MMHal-Bench segun el autor | Propietaria | API |
| Gemini-2.0 Pro | Propietario | No disponible | Superado en OpenCompass segun el autor | Propietaria | API |

La comparativa se basa en las afirmaciones del autor; no se dispone de resultados independientes desagregados en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden de la model card del autor y no se han verificado de forma independiente en la informacion disponible.
- Riesgo de alucinacion inherente a los MLLM, aunque el autor afirma mejoras en MMHal-Bench mediante RLAIF-V.
- La longitud de contexto del LLM no se especifica de forma explicita; el rendimiento en contextos muy largos depende de la compresion de tokens visuales y de video.
- Aunque soporta mas de 30 idiomas, el rendimiento puede variar entre idiomas y no se detalla por idioma.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de los componentes base (Qwen3-8B y SigLIP2-400M) y de los datasets de entrenamiento.
- El soporte de tool calling y de agentes no se documenta de forma explicita, por lo que su uso en pipelines agenticos requiere validacion previa.
- El despliegue en movil depende de cuantizaciones especificas y puede degradar la precision respecto a BF16.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4_5
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Technical Report: https://huggingface.co/papers/2509.18154
- Paper LLaVA-UHD: https://arxiv.org/pdf/2403.11703
- Demo: http://211.93.21.133:18120/
- Demo web alternativa: http://101.126.42.235:30910/
- Modelo int4: https://huggingface.co/openbmb/MiniCPM-V-4_5-int4
- Modelo GGUF: https://huggingface.co/openbmb/MiniCPM-V-4_5-gguf
- RLAIF-V: https://github.com/RLHF-V/RLAIF-V/
- VisCPM: https://github.com/OpenBMB/VisCPM
- App iOS: https://github.com/tc-mb/MiniCPM-o-demo-iOS
- llama.cpp (soporte): https://github.com/tc-mb/llama.cpp/blob/Support-MiniCPM-V-4.5/docs/multimodal/minicpmv4.5.md
- Ollama (soporte): https://github.com/tc-mb/ollama/tree/MIniCPM-V
- AutoAWQ (soporte): https://github.com/tc-mb/AutoAWQ
- SGLang (soporte): https://github.com/tc-mb/sglang/tree/main
- Transformers (soporte): https://github.com/tc-mb/transformers/tree/main
