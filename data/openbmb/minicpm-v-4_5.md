# openbmb/MiniCPM-V-4_5

## Resumen

MiniCPM-V 4.5 es un modelo multimodal de lenguaje y visión (MLLM) desarrollado por OpenBMB, la última versión de la serie MiniCPM-V. Está construido sobre Qwen3-8B como modelo de lenguaje y SigLIP2-400M como codificador visual, sumando un total de aproximadamente 8.700 millones de parámetros. Su principal innovación es un resamplador 3D unificado que comprime los tokens de video hasta 96 veces, lo que permite procesar video de alta tasa de fotogramas (hasta 10 FPS) y secuencias largas sin aumentar el coste de inferencia del LLM subyacente.

El modelo destaca por alcanzar un rendimiento de nivel GPT-4o en tareas de visión-lenguaje, superando en promedio a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B en la evaluación OpenCompass (77.0 de media), a pesar de tener solo 8B parámetros. También sobresale en OCR y parsing de documentos, con resultados líderes en OCRBench y OmniDocBench. Ofrece modos de razonamiento rápido y profundo controlables, y soporta más de 30 idiomas. Su licencia Apache 2.0 y su disponibilidad en formatos cuantizados (int4, GGUF, AWQ) lo hacen especialmente atractivo para despliegue en dispositivos locales, incluyendo teléfonos móviles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-8B + SigLIP2-400M + 3D-Resampler) |
| Parametros totales | 8.695.895.280 (aprox. 8,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4, GGUF, AWQ (16 tamaños disponibles) |
| Idiomas soportados | Multilingüe (más de 30 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, AWQ |

## Arquitectura y entrenamiento

MiniCPM-V 4.5 combina un LLM base Qwen3-8B con un codificador visual SigLIP2-400M. La innovación clave es el **3D-Resampler**, un módulo que agrupa hasta 6 fotogramas consecutivos de video y los comprime conjuntamente en 64 tokens, logrando una tasa de compresión de 96× respecto a los MLLM convencionales (que normalmente usan 1.536 tokens para 6 fotogramas). Esto permite procesar video de alta FPS y secuencias largas sin incrementar el coste de inferencia del LLM.

El pre-entrenamiento introduce una estrategia unificada para OCR y conocimiento de documentos: se corrompen dinámicamente las regiones de texto en imágenes con distintos niveles de ruido y se pide al modelo que reconstruya el texto. Así aprende a alternar entre reconocimiento preciso (cuando el texto es visible) y razonamiento basado en contexto multimodal (cuando está oscurecido), reduciendo la dependencia de parsers de documentos y mitigando alucinaciones. Además, se aplican técnicas de RLAIF-V y VisCPM para mejorar la fiabilidad y el comportamiento multilingüe.

## Capacidades

- Comprensión de imágenes individuales y múltiples, con soporte de alta resolución (hasta 1,8 millones de píxeles, p.ej. 1344×1344) mediante arquitectura LLaVA-UHD.
- Comprensión de video de alta FPS (hasta 10 FPS) y video largo, gracias al 3D-Resampler que comprime tokens de video.
- OCR y parsing de documentos PDF de alto nivel, superando a GPT-4o-latest y Gemini 2.5 en OCRBench.
- Modo de razonamiento híbrido controlable: rápido (para uso frecuente) y profundo (para problemas complejos).
- Comportamiento fiable y reducción de alucinaciones, con mejor rendimiento que GPT-4o-latest en MMHal-Bench.
- Soporte multilingüe en más de 30 idiomas.
- Capacidad de procesar imágenes con cualquier relación de aspecto y alta resolución.

## Casos de uso

- **Análisis de documentos escaneados**: el modelo puede extraer texto e información estructurada de PDFs e imágenes de alta resolución, superando a alternativas propietarias en OCRBench. Ideal para digitalización de archivos, facturas o formularios.
- **Transcripción y resumen de video**: gracias a su alta compresión de tokens de video, permite procesar vídeos largos (hasta 10 FPS) en tiempo real, útil para generar subtítulos, resúmenes automáticos o indexación de contenido audiovisual.
- **Asistente multimodal en dispositivos móviles**: con cuantización int4 y soporte para llama.cpp y ollama, puede ejecutarse en smartphones y tablets, ofreciendo respuestas a partir de imágenes o video capturado con la cámara.
- **Automatización de atención al cliente con evidencia visual**: el modelo puede analizar capturas de pantalla, fotos de productos o errores de interfaz para resolver incidencias, combinando razonamiento multimodal con el contexto conversacional.
- **Extracción de conocimiento de material educativo**: procesa diagramas, gráficos y ecuaciones en imágenes o video de clases, generando explicaciones o resúmenes en múltiples idiomas.
- **Moderación y análisis de contenido visual**: detecta y describe elementos en imágenes o video (objetos, texto, escenas) para sistemas de filtrado o catalogación automática, aprovechando su bajo coste de inferencia.
- **Desarrollo de agentes visuales**: al estar basado en Qwen3-8B, puede integrarse en pipelines de agentes que necesitan interpretar entradas visuales y ejecutar acciones, aunque la información proporcionada no detalla soporte explícito de tool calling.

## Benchmarks y rendimiento

Según la información publicada por el autor, MiniCPM-V 4.5 obtiene una puntuación media de **77.0 en OpenCompass** (evaluación de 8 benchmarks populares), superando a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B. También se reportan resultados líderes en OCRBench, OmniDocBench y MMHal-Bench, así como en benchmarks de video (Video-MME, LVBench, MLVU, MotionBench, FavorBench). No se han publicado cifras numéricas detalladas para estos benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| OpenCompass (media de 8 benchmarks) | 77.0 |
| OCRBench | Supera a GPT-4o-latest y Gemini 2.5 (sin cifra) |
| OmniDocBench | Estado del arte entre MLLM generales (sin cifra) |
| MMHal-Bench | Supera a GPT-4o-latest (sin cifra) |
| Video-MME, LVBench, MLVU, MotionBench, FavorBench | Estado del arte (sin cifra) |

## Requisitos de hardware

- El tamaño del repositorio es de 17,4 GB en safetensors, lo que sugiere pesos en FP16/BF16 (aprox. 17 GB). Con cuantización int4, el modelo ocuparía aproximadamente 4-5 GB de VRAM.
- Para inferencia en GPU: una tarjeta con al menos 8 GB de VRAM (p.ej. RTX 3070/4060) puede ejecutar la versión int4; para FP16 se recomienda una GPU con 20+ GB (p.ej. RTX 3090, A100 40GB).
- Soporta inferencia eficiente en CPU mediante llama.cpp y ollama, así como despliegue de alto rendimiento con vLLM y SGLang.
- También hay una aplicación iOS optimizada para iPhone y iPad.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (OpenCompass) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.5 | 8,7B | No disponible | 77.0 | Apache 2.0 | Hugging Face, ollama, vLLM |
| MiniCPM-V 4 | 4,1B | No disponible | No reportado | Apache 2.0 | Hugging Face |
| Qwen2.5-VL 72B | 72B | No disponible | Inferior a MiniCPM-V 4.5 | Apache 2.0 | Hugging Face |

Nota: los datos de contexto y rendimiento detallado de los modelos comparados no están disponibles en la información proporcionada. La comparación se basa en las afirmaciones del autor.

## Limitaciones y advertencias

- No se han documentado limitaciones específicas en la información proporcionada. Sin embargo, al ser un modelo de 8B, puede presentar dificultades en tareas de razonamiento complejo o conocimiento factual profundo comparado con modelos mucho más grandes.
- El modelo puede alucinar en escenarios de OCR con texto muy degradado o en imágenes ambiguas, aunque las técnicas de entrenamiento buscan mitigarlo.
- Aunque soporta más de 30 idiomas, el rendimiento puede variar según la lengua; no se especifican cuáles tienen mejor cobertura.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los componentes base (Qwen3-8B y SigLIP2-400M) para asegurar compatibilidad.
- Para producción, es necesario validar el comportamiento en el dominio específico, especialmente en tareas de video largo donde la compresión de tokens podría perder detalles finos.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4_5
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Technical Report: https://huggingface.co/papers/2509.18154
- Demo en línea: http://211.93.21.133:18120/
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Versión int4: https://huggingface.co/openbmb/MiniCPM-V-4_5-int4
- Versión GGUF: https://huggingface.co/openbmb/MiniCPM-V-4_5-gguf
- Página en ollama: https://ollama.com/openbmb/minicpm-v4.5
