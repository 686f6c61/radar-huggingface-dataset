# openbmb/MiniCPM-V-4_5-int4

## Resumen

MiniCPM-V 4.5 es un modelo multimodal de tipo image-text-to-text desarrollado por OpenBMB (Tsinghua University / ModelBest). Se construye sobre un LLM Qwen3-8B combinado con un codificador visual SigLIP2-400M, sumando aproximadamente 8.700 millones de parámetros totales. La versión aquí documentada, `MiniCPM-V-4_5-int4`, es la variante cuantizada a 4 bits del modelo original, publicada para reducir los requisitos de memoria en inferencia. El modelo resuelve tareas de comprensión de imagen única, múltiples imágenes y vídeo de alta tasa de fotogramas, además de OCR y parsing de documentos.

Su relevancia actual radica en que, con solo 8B parámetros, el autor declara un rendimiento en tareas visión-lenguaje que supera a modelos propietarios como GPT-4o-latest y Gemini-2.0 Pro, y a modelos abiertos de mayor tamaño como Qwen2.5-VL 72B, según la evaluación OpenCompass de 8 benchmarks. La innovación principal es un módulo 3D-Resampler que comprime hasta 6 fotogramas de vídeo en 64 tokens (tasa de compresión de 96x), lo que permite procesar vídeo de alta FPS y vídeo largo sin incrementar el coste de inferencia del LLM.

La versión int4 mantiene la licencia Apache 2.0 del modelo base y está pensada para despliegue en dispositivos con recursos limitados, incluyendo inferencia en CPU mediante llama.cpp y Ollama, y ejecución en teléfonos (iOS) según el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLLM: LLM Qwen3-8B + codificador visual SigLIP2-400M + 3D-Resampler; basada en LLaVA-UHD |
| Parámetros totales | 8.695.895.280 (dato real de safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (esta versión); el autor publica además GGUF y AWQ en 16 tamaños |
| Idiomas soportados | multilingüe, más de 30 idiomas según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code); disponibles GGUF y AWQ en otros repositorios |

## Arquitectura y entrenamiento

MiniCPM-V 4.5 combina un LLM Qwen3-8B con un codificador visual SigLIP2-400M. La arquitectura visual sigue el enfoque LLaVA-UHD, que permite procesar imágenes de alta resolución con cualquier relación de aspecto y hasta 1,8 millones de píxeles (por ejemplo, 1344x1344), usando aproximadamente 4 veces menos tokens visuales que la mayoría de MLLMs. El componente diferenciador es el 3D-Resampler, que agrupa y comprime conjuntamente hasta 6 fotogramas de vídeo consecutivos en 64 tokens (el mismo número que usa un solo imagen en la serie MiniCPM-V), logrando una compresión de 96x en tokens de vídeo y habilitando comprensión de vídeo de alta FPS (hasta 10 FPS) y de vídeo largo.

En preentrenamiento, el autor describe un aprendizaje unificado de OCR y conocimiento a partir de documentos: se corrompen dinámicamente regiones de texto con distintos niveles de ruido y se pide al modelo que reconstruya el texto, de modo que aprenda a alternar entre reconocimiento exacto (cuando el texto es visible) y razonamiento basado en contexto multimodal (cuando está muy oscurecido). El modelo incorpora además técnicas RLAIF-V y VisCPM para comportamientos más fiables y capacidades multilingües. El dataset citado en la model card es `openbmb/RLAIF-V-Dataset`. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición detallada del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes.
- Comprensión de imagen única, múltiples imágenes y vídeo.
- Comprensión de vídeo de alta FPS (hasta 10 FPS) y de vídeo largo.
- OCR de alta precisión y parsing de documentos PDF.
- Procesamiento de imágenes de alta resolución con cualquier relación de aspecto (hasta 1,8 millones de píxeles).
- Modo de pensamiento híbrido conmutable: fast thinking (eficiente) y deep thinking (para problemas complejos), con control del cambio de modo.
- Capacidades multilingües en más de 30 idiomas.
- Comportamientos considerados "fiables" por el autor, con resultados destacados en MMHal-Bench.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Digitalización y parsing de documentos: el modelo procesa PDF e imágenes de alta resolución con OCR de alto rendimiento y parsing de documentos, adecuado para extraer texto y estructura de facturas, contratos o informes.
- Análisis de vídeo de vigilancia o deportivo: gracias al 3D-Resampler y la compresión 96x, puede procesar secuencias de hasta 10 FPS y vídeo largo sin disparar el coste de inferencia del LLM.
- Asistentes de accesibilidad: descripción de imágenes y escenas para usuarios con discapacidad visual, aprovechando la comprensión de imagen única y múltiples imágenes.
- Inferencia en dispositivo (edge): la variante int4, junto con soporte de llama.cpp y Ollama, permite ejecutar el modelo en CPU y en dispositivos locales, incluyendo app iOS según el autor.
- Moderación y verificación de contenido visual: análisis de imágenes y vídeo con comportamientos orientados a reducir alucinaciones (RLAIF-V), útil en revisión de contenido.
- Atención al cliente con entrada visual: el usuario puede enviar capturas o fotos de productos o errores y el modelo responde en más de 30 idiomas, con modo fast thinking para respuestas rápidas.
- Automatización de flujos documentales en producción: integrable vía vLLM o SGLang para inferencia de alto throughput y bajo consumo de memoria.

## Benchmarks y rendimiento

El autor declara una puntuación media de 77,0 en OpenCompass (evaluación de 8 benchmarks) y afirma superar a GPT-4o-latest, Gemini-2.0 Pro y Qwen2.5-VL 72B en capacidades visión-lenguaje. También declara rendimiento líder en OCRBench (por encima de GPT-4o-latest y Gemini 2.5) y estado del arte en OmniDocBench entre MLLMs generales, así como resultados destacados en Video-MME, LVBench, MLVU, MotionBench, FavorBench y MMHal-Bench. No se han proporcionado en la información disponible las cifras desglosadas por benchmark, por lo que no se presenta tabla numérica comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una cuantización int4 de un modelo de ~8,7B parámetros, el peso de los safetensors ocupa aproximadamente 6,5 GB (tamaño del repo); se requiere memoria adicional para el codificador visual, el 3D-Resampler y el KV cache.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada; por tamaño, el modelo cabe en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) y en GPUs de datacenter (A100, H100) para despliegues de mayor throughput.
- Cabe en consumer GPU: sí, en GPUs con suficiente VRAM para el peso int4 más overhead; el autor indica además soporte de inferencia en CPU.
- Opciones de despliegue: Transformers (con custom_code), llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory para fine-tuning, y app iOS optimizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.5 (int4) | ~8,7B | no disponible | OpenCompass 77,0; supera a GPT-4o-latest y Qwen2.5-VL 72B según autor | Apache 2.0 | Hugging Face, GGUF, AWQ, int4 |
| GPT-4o-latest | no disponible | no disponible | Referencia propietaria; el autor afirma que MiniCPM-V 4.5 lo supera en visión-lenguaje | propietaria | API |
| Gemini-2.0 Pro | no disponible | no disponible | Referencia propietaria; el autor afirma que MiniCPM-V 4.5 lo supera en visión-lenguaje | propietaria | API |
| Qwen2.5-VL 72B | 72B | no disponible | El autor afirma que MiniCPM-V 4.5 lo supera en visión-lenguaje | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como todo modelo entrenado con datos web, puede reproducir sesgos presentes en el corpus.
- Riesgo de alucinación: el autor incorpora técnicas RLAIF-V para reducir alucinaciones y declara buen rendimiento en MMHal-Bench, pero persiste el riesgo inherente en tareas de OCR y razonamiento sobre documentos.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; el soporte multilingüe se declara para más de 30 idiomas, sin detalle de calidad por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los componentes base (Qwen3-8B, SigLIP2-400M) y de los pesos cuantizados.
- Caveats para producción: la versión int4 puede degradar ligeramente la precisión frente al modelo en precisión completa; el uso de `custom_code` en Transformers requiere confiar en el código del repositorio; el rendimiento en vídeo depende del pipeline de muestreo de fotogramas.

## Enlaces

- Hugging Face (int4): https://huggingface.co/openbmb/MiniCPM-V-4_5-int4
- Hugging Face (GGUF): https://huggingface.co/openbmb/MiniCPM-V-4_5-gguf
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Technical Report: https://huggingface.co/papers/2509.18154
- Paper LLaVA-UHD: https://arxiv.org/pdf/2403.11703
- RLAIF-V: https://github.com/RLHF-V/RLAIF-V/
- VisCPM: https://github.com/OpenBMB/VisCPM
- Demo: http://211.93.21.133:18120/
- Demo web alternativa: http://101.126.42.235:30910/
- App iOS: https://github.com/tc-mb/MiniCPM-o-demo-iOS
- llama.cpp (soporte MiniCPM-V 4.5): https://github.com/tc-mb/llama.cpp/blob/Support-MiniCPM-V-4.5/docs/multimodal/minicpmv4.5.md
- Ollama (soporte MiniCPM-V): https://github.com/tc-mb/ollama/tree/MIniCPM-V
- AutoAWQ: https://github.com/tc-mb/AutoAWQ
- SGLang: https://github.com/tc-mb/sglang/tree/main
- Transformers: https://github.com/tc-mb/transformers/tree/main
