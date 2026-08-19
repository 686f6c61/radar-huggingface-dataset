# openbmb/MiniCPM-V-4.6-AWQ

## Resumen

MiniCPM-V 4.6 es un modelo multimodal (vision-lenguaje) desarrollado por OpenBMB, un laboratorio con sede en China fundado en 2022 por el laboratorio de PLN de la Universidad de Tsinghua y ModelBest Inc. Este repositorio concreto aloja la versión cuantizada AWQ (W4A16, AutoAWQ) del modelo original MiniCPM-V 4.6, que reduce los pesos BF16 originales a 4 bits para facilitar el despliegue en dispositivos con recursos limitados.

El modelo combina el encoder visual SigLIP2-400M con el LLM Qwen3.5-0.8B, sumando 1.300 millones de parámetros en total. Está diseñado específicamente para despliegue en el borde (edge deployment), con soporte para iOS, Android y HarmonyOS, y es capaz de procesar imágenes individuales, múltiples imágenes y vídeo. Su arquitectura, basada en técnicas de LLaVA-UHD v4, reduce los FLOPs de codificación visual en más de un 50% e introduce compresión mixta de tokens visuales con ratios 4x y 16x.

La relevancia de este modelo radica en su equilibrio entre capacidad y eficiencia: consigue una puntuación de 13 en el índice Artificial Analysis Intelligence, superando a modelos más grandes como Ministral 3 3B (11) y a Qwen3.5-0.8B (10), con un coste de tokens hasta 43 veces menor que Qwen3.5-0.8B-Thinking. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (encoder visual) + Qwen3.5-0.8B (LLM) |
| Parametros totales | 1.300.428.016 (1,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 (4 bits); el modelo base BF16 tambien ofrece variantes GGUF, BNB y GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ) |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 combina el encoder visual SigLIP2-400M con el LLM Qwen3.5-0.8B, alcanzando un total de 1.300 millones de parámetros. La arquitectura se basa en técnicas de LLaVA-UHD v4, que reducen los FLOPs de codificación visual en más de un 50% y permiten un throughput de tokens aproximadamente 1,5 veces superior al de Qwen3.5-0.8B. El modelo incorpora compresión mixta de tokens visuales con ratios 4x y 16x, lo que permite alternar entre precisión y velocidad según las necesidades de la tarea.

Esta versión AWQ (W4A16) es una cuantización del modelo original BF16 realizada con AutoAWQ. La cuantización AWQ preserva las activaciones en 16 bits mientras cuantiza los pesos a 4 bits, lo que mantiene la calidad del modelo con una reducción significativa del tamaño (1,9 GB en el repositorio) y un menor consumo de memoria en inferencia. El modelo base soporta fine-tuning con los ecosistemas SWIFT y LLaMA-Factory en GPUs de consumo. Los datos de entrenamiento (composición del dataset, número de tokens, técnicas de alineación) no están detallados en la información proporcionada.

## Capacidades

- Comprensión de imágenes individuales y múltiples, incluyendo descripción, respuesta a preguntas visuales y razonamiento sobre contenido visual.
- Comprensión de vídeo, con decodificación integrada a través de torchcodec para entrada de vídeo directa.
- Generación de texto con razonamiento multimodal integrado.
- Compresión visual adaptativa con ratios 4x y 16x configurables para equilibrar precisión y velocidad.
- Despliegue en dispositivos móviles (iOS, Android y HarmonyOS) con código de adaptación open-source.
- Compatible con frameworks de inferencia estándar: vLLM, SGLang, llama.cpp y Ollama.
- Fine-tuning en GPUs de consumo mediante SWIFT y LLaMA-Factory.

## Casos de uso

- Asistente visual en dispositivos móviles: el modelo puede desplegarse directamente en iOS, Android o HarmonyOS para proporcionar asistencia en tiempo real sobre el entorno del usuario, como lectura de tickets, reconocimiento de objetos o descripción de escenas, sin necesidad de conexión a servidores externos.
- Análisis de documentos y capturas de pantalla: gracias a su capacidad de comprensión de imágenes, puede extraer información de documentos escaneados, facturas, tickets y capturas de pantalla de aplicaciones en pipelines automatizados.
- Moderación de contenido visual: el modelo puede clasificar y describir imágenes en pipelines de moderación, identificando contenido inapropiado o sensible en plataformas de contenido generado por usuarios.
- Accesibilidad para personas con discapacidad visual: su tamaño reducido permite integrarlo en aplicaciones de asistencia que describen el entorno, leen textos o identifican objetos en tiempo real desde el dispositivo del usuario.
- Automatización de soporte técnico con evidencia visual: el modelo puede analizar capturas de pantalla o fotos enviadas por usuarios en sistemas de tickets para diagnosticar problemas técnicos y generar respuestas contextualizadas.
- Análisis de vídeo en tiempo real para seguridad o retail: su capacidad de comprensión de vídeo permite procesar secuencias para contar personas, detectar eventos o analizar comportamiento en entornos comerciales, con despliegue en hardware de bajo coste.
- Generación de descripciones accesibles (alt text) a escala: el modelo puede generar automáticamente descripciones alternativas para imágenes en sitios web o aplicaciones, mejorando la accesibilidad con un coste computacional mínimo.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles en la información proporcionada son los siguientes:

| Benchmark | MiniCPM-V 4.6 | Qwen3.5-0.8B | Qwen3.5-0.8B-Thinking | Ministral 3 3B |
|---|---|---|---|---|
| Artificial Analysis Intelligence Index | 13 | 10 | 11 | 11 |

Además, según la model card:

- Supera a Qwen3.5-0.8B en la mayoría de tareas de comprensión visión-lenguaje.
- Alcanza el nivel de Qwen3.5-2B en benchmarks como OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench.
- Supera a Gemma4-E2B-it en rendimiento general con menos parámetros.
- Consigue un throughput de tokens aproximadamente 1,5 veces superior al de Qwen3.5-0.8B.
- Reduce el coste de tokens en 19x frente a Qwen3.5-0.8B y 43x frente a Qwen3.5-0.8B-Thinking para la misma puntuación en el índice Artificial Analysis.

Los valores numéricos detallados de los benchmarks individuales (MMLU, HumanEval, GSM8K, etc.) se presentan en gráficos dentro de la model card y no están disponibles en formato textual.

## Requisitos de hardware

- Tamaño del repositorio: 1,9 GB en cuantización AWQ 4 bits.
- VRAM estimada: el dato exacto no está disponible en la información proporcionada; al tratarse de un modelo de 1,3B parámetros en AWQ 4 bits, el requisito es reducido y compatible con GPUs de consumo.
- GPU recomendadas: al estar diseñado para despliegue en el borde, puede ejecutarse en GPUs de consumo de gama media y en dispositivos móviles sin GPU dedicada.
- Compatible con dispositivos móviles: iOS, Android y HarmonyOS, con código de adaptación open-source.
- Frameworks de despliegue soportados: vLLM, SGLang, llama.cpp, Ollama y Transformers (version >= 5.7.0).
- Fine-tuning posible en GPUs de consumo mediante SWIFT y LLaMA-Factory.
- El modelo base requiere torchcodec para decodificación de vídeo, con posibles incompatibilidades con entornos CUDA 12.x.

## Comparativa con modelos similares

| Modelo | Parametros | Indice Artificial Analysis | Licencia | Cuantizacion disponible | Despliegue movil |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 (AWQ) | 1,3B | 13 | Apache 2.0 | AWQ, GGUF, BNB, GPTQ | Si (iOS, Android, HarmonyOS) |
| Qwen3.5-0.8B | 0,8B | 10 | no disponible | no disponible | no disponible |
| Ministral 3 3B | 3B | 11 | no disponible | no disponible | no disponible |
| Gemma4-E2B-it | ~2B | no disponible | no disponible | no disponible | no disponible |

Nota: los datos de licencia, cuantización y despliegue móvil de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Los idiomas soportados no están especificados en la información proporcionada; se recomienda verificar la cobertura lingüística antes de desplegar en producción.
- La longitud de contexto no está documentada en la información disponible.
- Los datos de entrenamiento (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO) no están detallados en la información proporcionada.
- La cuantización AWQ puede introducir una ligera degradación de calidad frente a los pesos BF16 originales, especialmente en tareas de razonamiento complejo.
- El modelo requiere torchcodec para entrada de vídeo, que puede presentar problemas de compatibilidad con entornos CUDA 12.x.
- No se han documentado sesgos específicos en la información proporcionada, pero al ser un modelo entrenado sobre datos web, es recomendable evaluar sesgos potenciales antes de usarlo en aplicaciones sensibles.
- Al ser un modelo de 1,3B parámetros, puede tener limitaciones en tareas de razonamiento complejo o conocimiento factual profundo en comparación con modelos mucho más grandes.

## Enlaces

- Repositorio HuggingFace (AWQ): https://huggingface.co/openbmb/MiniCPM-V-4.6-AWQ
- Modelo base (BF16): https://huggingface.co/openbmb/MiniCPM-V-4.6
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-V
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-AWQ-Demo
- Documentacion API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Articulo sobre el lanzamiento: https://artificialanalysis.ai/articles/openbmb-launches-minicpm-v-4-6-1-3b-instruct
- Papers asociados (arXiv): 2604.27393, 2509.18154, 2408.01800, 2605.08985
