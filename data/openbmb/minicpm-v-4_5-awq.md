# openbmb/MiniCPM-V-4_5-AWQ

## Resumen

MiniCPM-V 4.5 AWQ es la versión cuantizada a 4 bits (AWQ) del modelo multimodal MiniCPM-V 4.5 desarrollado por OpenBMB, el laboratorio de inteligencia artificial de la Universidad de Tsinghua. Se trata de un modelo vision-language (image-text-to-text) de 8B parámetros totales que combina un backbone de lenguaje Qwen3-8B con un codificador visual SigLIP2-400M, orientado a comprensión de imagen única, múltiples imágenes y vídeo en dispositivos con recursos limitados.

El modelo destaca por su eficiencia: introduce un 3D-Resampler unificado para imágenes y vídeo que logra una compresión de hasta 96x en tokens de vídeo (6 fotogramas de 448x448 se comprimen en 64 tokens, frente a los 1.536 habituales), lo que permite comprensión de vídeo de alta frecuencia (hasta 10 FPS) y vídeo largo sin incrementar el coste de inferencia del LLM. Según el autor, alcanza una puntuación media de 77,2 en OpenCompass y supera a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B en capacidades vision-language, siendo el MLLM más capaz por debajo de 30B parámetros.

La relevancia de esta variante AWQ radica en que reduce el peso del modelo a aproximadamente 7,1 GB en el repositorio, lo que facilita su despliegue en GPUs de consumo y en entornos de producción con alta concurrencia. Soporta OCR de alta resolución (hasta 1,8 millones de píxeles), parsing de documentos PDF, comportamiento multilingüe en más de 30 idiomas y modos de pensamiento rápido/profundo controlables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: LLM Qwen3-8B + vision encoder SigLIP2-400M + 3D-Resampler (basada en LLaVA-UHD) |
| Parametros totales | 8.695.895.280 (8B aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4-bit (esta variante); el modelo base dispone de int4, GGUF y AWQ en 16 tamanos |
| Idiomas soportados | multilingual (mas de 30 idiomas segun el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 7,1 GB), con custom_code |

## Arquitectura y entrenamiento

MiniCPM-V 4.5 se construye sobre un LLM Qwen3-8B acoplado a un codificador visual SigLIP2-400M, con un adaptador basado en la arquitectura LLaVA-UHD que permite procesar imágenes de alta resolución con cualquier relación de aspecto (hasta 1,8 millones de píxeles, por ejemplo 1344x1344) usando aproximadamente 4 veces menos tokens visuales que la mayoría de MLLMs. La innovación principal es el 3D-Resampler unificado para imágenes y vídeo, que comprime agresivamente los tokens visuales (hasta 96x en vídeo) permitiendo procesar muchos más fotogramas sin disparar el coste del LLM.

El entrenamiento incorpora técnicas de RLAIF-V y VisCPM, orientadas a comportamientos fiables (reducción de alucinaciones) y capacidades multilingües. El modelo soporta un modo de pensamiento híbrido rápido/profundo controlable, que permite alternar entre inferencia eficiente y razonamiento extendido según el escenario. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición detallada del dataset, más allá de la referencia al dataset RLAIF-V-Dataset.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes, múltiples imágenes y vídeo.
- Comprensión de vídeo de alta frecuencia de refresco (hasta 10 FPS) y vídeo largo, gracias a la compresión de tokens del 3D-Resampler.
- OCR de alta resolución y parsing de documentos PDF (rendimiento líder en OCRBench y OmniDocBench según el autor).
- Procesamiento de imágenes con cualquier relación de aspecto hasta 1,8 millones de píxeles.
- Modo de pensamiento híbrido rápido/profundo (fast/deep thinking) controlable.
- Capacidades multilingües en más de 30 idiomas.
- Comportamiento fiable orientado a reducir alucinaciones (técnicas RLAIF-V).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Digitalización y parsing de documentos: el modelo puede procesar PDFs e imágenes de alta resolución (hasta 1344x1344) extrayendo texto, tablas y estructura con rendimiento líder en OmniDocBench, adecuado para pipelines de gestión documental y archivo.
- OCR en producción: gracias a su rendimiento en OCRBench y su capacidad de manejar cualquier relación de aspecto, sirve para digitalizar facturas, formularios y documentos escaneados en sistemas de back-office.
- Análisis de vídeo de vigilancia o deportes: el 3D-Resampler permite procesar vídeo a hasta 10 FPS y vídeo largo con coste de inferencia contenido, útil para monitorización y resumen automático de grabaciones.
- Asistentes de accesibilidad: descripción de imágenes y escenas para personas con discapacidad visual, aprovechando la comprensión de imagen única y múltiple y el soporte multilingüe.
- Despliegue en dispositivos locales: la variante AWQ 4-bit (aproximadamente 7,1 GB) permite ejecutar el modelo en GPUs de consumo e incluso en iPhone/iPad mediante la demo iOS del autor, habilitando asistentes visuales offline.
- Moderación de contenido visual: clasificación y descripción de imágenes y vídeos generados por usuarios en plataformas, con comportamiento orientado a reducir alucinaciones (MMHal-Bench).
- Atención al cliente multimodal: gestión de conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) en más de 30 idiomas.

## Benchmarks y rendimiento

Según la model card del autor, MiniCPM-V 4.5 obtiene una puntuación media de 77,2 en OpenCompass (evaluación de 8 benchmarks populares). El autor afirma que supera a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B, y que logra rendimiento líder en OCRBench (por encima de GPT-4o-latest y Gemini 2.5) y en OmniDocBench entre MLLMs generales, además de superar a GPT-4o-latest en MMHal-Bench. Los resultados numéricos detallados por benchmark se presentan en imágenes dentro de la model card y no están disponibles como cifras textuales en la información proporcionada.

| Benchmark | Resultado | Nota |
|---|---|---|
| OpenCompass (media de 8 benchmarks) | 77,2 | Dato textual del autor |
| OCRBench | Líder segun el autor (sin cifra) | Supera a GPT-4o-latest y Gemini 2.5 |
| OmniDocBench | SOTA entre MLLMs generales (sin cifra) | Parsing de PDF |
| MMHal-Bench | Superior a GPT-4o-latest (sin cifra) | Comportamiento fiable |
| Video-MME, LVBench, MLVU, MotionBench, FavorBench | SOTA segun el autor (sin cifras) | Video understanding |

## Requisitos de hardware

- VRAM estimada para inferencia: la variante AWQ 4-bit ocupa aproximadamente 7,1 GB de pesos, por lo que se estima un uso de VRAM en torno a 8-10 GB incluyendo overhead de contexto y tokens visuales (estimación, no dato oficial).
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, cabría en GPUs de consumo de gama alta (por ejemplo RTX 4090, 24 GB) y en GPUs de datacenter (A100, H100) para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en GPUs con al menos 8-12 GB de VRAM de forma estimada; el autor demuestra despliegue en iPad M4 mediante la demo iOS.
- Opciones de despliegue: llama.cpp y Ollama (inferencia en CPU), SGLang y vLLM (alto throughput), Transformers, LLaMA-Factory para fine-tuning, y Gradio para demo local.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.5 AWQ (este) | 8B | no disponible | OpenCompass 77,2; supera a GPT-4o-latest segun autor | no disponible | Hugging Face, llama.cpp, Ollama, vLLM, SGLang |
| GPT-4o-latest | no disponible (propietario) | no disponible | Referencia propietaria; superado por MiniCPM-V 4.5 en OpenCompass, OCRBench y MMHal-Bench segun el autor | propietaria | API |
| Gemini-2.0 Pro | no disponible (propietario) | no disponible | Referencia propietaria; superado por MiniCPM-V 4.5 en OpenCompass segun el autor | propietaria | API |
| Qwen2.5-VL 72B | 72B | no disponible | Superado por MiniCPM-V 4.5 en OpenCompass segun el autor | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información proporcionada; como modelo entrenado con datos web y datasets RLAIF, es previsible que herede sesgos de dichas fuentes.
- Riesgo de alucinación: aunque el autor destaca comportamientos fiables (RLAIF-V) y resultados superiores a GPT-4o-latest en MMHal-Bench, todo MLLM mantiene riesgo de alucinación, especialmente en OCR de documentos de baja calidad o vídeo complejo.
- Limitaciones de contexto: la longitud de contexto no está disponible en la información proporcionada, lo que impide evaluar límites en documentos o vídeos muy largos.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; es imprescindible verificarla antes de uso comercial.
- La cuantización AWQ 4-bit puede degradar ligeramente la precisión respecto al modelo base en tareas sensibles (OCR fino, razonamiento complejo); conviene validar en el dominio de aplicación.
- El modelo requiere `custom_code` y `trust_remote_code` en Transformers, lo que implica ejecutar código del autor.
- No hay información sobre soporte de tool calling ni despliegue agéntico, por lo que no debe asumirse en producción.

## Enlaces

- Hugging Face (esta variante AWQ): https://huggingface.co/openbmb/MiniCPM-V-4_5-AWQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4_5
- Variante int4: https://huggingface.co/openbmb/MiniCPM-V-4_5-int4
- Variante GGUF: https://huggingface.co/openbmb/MiniCPM-V-4_5-gguf
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- Demo online: http://101.126.42.235:30910/
- Paper LLaVA-UHD: https://arxiv.org/pdf/2403.11703
- RLAIF-V: https://github.com/RLHF-V/RLAIF-V/
- VisCPM: https://github.com/OpenBMB/VisCPM
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo iOS: https://github.com/tc-mb/MiniCPM-o-demo-iOS
- llama.cpp (soporte MiniCPM-V 4.5): https://github.com/tc-mb/llama.cpp/blob/Support-MiniCPM-V-4.5/docs/multimodal/minicpmv4.5.md
- Ollama (soporte): https://github.com/tc-mb/ollama/tree/MIniCPM-V
- AutoAWQ: https://github.com/tc-mb/AutoAWQ
- SGLang: https://github.com/tc-mb/sglang/tree/main
- Transformers: https://github.com/tc-mb/transformers/tree/main
