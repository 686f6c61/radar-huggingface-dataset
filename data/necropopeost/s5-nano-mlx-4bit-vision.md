# necropopeost/S5-nano-MLX-4bit-vision

## Resumen

S5-nano-MLX-4bit-vision es una conversión no oficial del modelo multimodal maritaca-ai/S5-nano al formato MLX de Apple, cuantizada en 4 bits y con el encoder de visión incluido. La desarrolla el usuario necropopeost, sin vínculo con Maritaca AI, y su objetivo es permitir la ejecución local del modelo en Macs con Apple Silicon manteniendo la capacidad de procesar imágenes, algo que no estaba cubierto por las publicaciones originales en safetensors y GGUF.

El modelo base S5-nano es un modelo multimodal de aproximadamente 4.500 millones de parámetros con una ventana de contexto de 32.000 tokens, orientado principalmente al portugués y al inglés. Esta conversión reduce el peso en disco de 8,7 GB (BF16) a unos 3,0 GB, aplicando cuantización affine de 4 bits con grupos de 64, mientras conserva el vision tower y el proyector multimodal en 8/16 bits para no degradar la percepción visual. La media resultante es de aproximadamente 5,3 bits por peso.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para desplegar un modelo multimodal pequeño en hardware de consumo Apple; por otro, advierte de los compromisos de la cuantización agresiva, que degrada el modo de razonamiento largo (Think) y reduce la precisión en texto respecto al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base qwen3_5 según tags; vision tower más proyector multimodal) |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.000 tokens (según ficha del modelo base en Featherless) |
| Tipos de cuantización | 4 bits affine con grupos de 64; visión y proyector en 8/16 bits; media ~5,3 bits por peso |
| Idiomas soportados | portugués (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

La conversión parte del modelo base maritaca-ai/S5-nano, un transformer multimodal con encoder de visión y proyector hacia el espacio del modelo de lenguaje. Los tags del repositorio apuntan a la familia qwen3_5 como referencia arquitectónica. El autor no ha entrenado ni modificado el modelo: la conversión se realizó con la herramienta `mlx-vlm`, que aplica cuantización affine de 4 bits a los pesos de texto y mantiene los módulos de visión en mayor precisión (8/16 bits) para preservar la capacidad visual.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF o DPO; estos datos corresponden a la model card del S5-nano original, que no se ha incluido en la información proporcionada. La innovación técnica de esta versión es exclusivamente la conversión a MLX con soporte multimodal y la estrategia de precisión mixta (texto en 4 bits, visión en 8/16 bits), que busca equilibrar tamaño y calidad.

## Capacidades

- Generación de texto en portugués e inglés.
- Comprensión de imágenes y descripción visual en portugués, gracias al vision tower incluido en la conversión.
- Razonamiento multimodal básico: respuesta a preguntas sobre el contenido de una imagen.
- Modo Instruct: respuesta directa, recomendado para uso local por su estabilidad en 4 bits.
- Modo Think: razonamiento largo, presente pero inestable tras la cuantización agresiva.
- Ejecución local en Apple Silicon mediante `mlx-vlm`.
- Conocimiento académico y de examen, validado con el dataset ENADE.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá del modo Think.

## Casos de uso

- Descripción de imágenes en local: un desarrollador puede cargar una fotografía y obtener una descripción en portugués con `mlx-vlm`, sin enviar datos a la nube, adecuado para prototipos de accesibilidad o catalogación de imágenes.
- Asistencia académica en portugués: el modelo obtiene un 61,70% en ENADE-QA en modo Instruct, por lo que puede emplearse como tutor de preguntas de múltiple elección en entornos educativos brasileños, con revisión humana.
- Prototipado rápido en Mac: con 3,0 GB de peso, cabe en un MacBook con Apple Silicon y permite iterar sobre prompts multimodales sin infraestructura GPU dedicada.
- Extracción de información de documentos escaneados: combinando entrada de imagen y prompt de texto, puede resumir o responder preguntas sobre capturas y páginas digitalizadas en portugués.
- Evaluación de modelos multimodales pequeños: sirve como baseline ligero para comparar calidad visual y de texto en pipelines de investigación que necesiten ejecución local.
- Demos y pruebas de concepto offline: ideal para talleres o entornos sin conectividad donde se requiera un modelo multimodal que quepa en disco y memoria de un portátil.
- Filtrado y moderación de imágenes con descripciones generadas: puede producir descripciones textuales que alimenten un clasificador posterior, aunque la precisión en 4 bits exige validación.

## Benchmarks y rendimiento

| Benchmark | S5-nano-MLX-4bit-vision | S5-nano original (BF16) |
|---|---|---|
| MMStar (Coarse Perception, 100 preguntas) | 61,00% (61/100) | no disponible |
| ENADE-QA (483 preguntas, modo Instruct) | 61,70% (298/483) | 71,79% (dataset oficial) |
| Media general (visión + texto) | 61,35% | no disponible |

El autor atribuye la diferencia de unos 10 puntos en ENADE-QA al coste esperado de la cuantización de 4 bits, que reduce el tamaño del modelo en aproximadamente un 65%. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: unos 3,0 GB de pesos más overhead de activaciones y del vision tower en 8/16 bits; en la práctica se recomienda al menos 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores). No es compatible con CUDA sin reconversión.
- Cabe en GPU de consumo Apple: sí, en cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada.
- Opciones de despliegue: `mlx-vlm` (librería oficial de inferencia para MLX). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S5-nano-MLX-4bit-vision | 4,54 B | 32K | Sí (visión) | Apache 2.0 | Hugging Face (MLX) |
| maritaca-ai/S5-nano (original) | 4,5 B | 32K | Sí (visión) | Apache 2.0 | Hugging Face (safetensors, GGUF) y API serverless en Featherless |
| NVIDIA Nemotron 3 Nano | no disponible | no disponible | no disponible | no disponible | Familia Nemotron 3 de NVIDIA |

La comparación con Nemotron 3 Nano es limitada porque la información disponible solo confirma su existencia dentro de la familia Nemotron 3, orientada a aplicaciones agénticas, sin datos de parámetros, contexto ni licencia. Frente al S5-nano original, esta conversión sacrifica precisión (especialmente en modo Think) a cambio de un tamaño un 65% menor y ejecución local en Apple Silicon.

## Limitaciones y advertencias

- Conversión no oficial: el autor no tiene vínculo con Maritaca AI y no ha entrenado ni modificado el modelo; los fallos de la conversión no deben atribuirse al modelo original.
- Degradación por cuantización: pérdida de aproximadamente 10 puntos en ENADE-QA respecto al original y modo Think inestable en 4 bits.
- Idiomas limitados a portugués e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a modelos de 4,5 B, agravado por la cuantización en tareas de razonamiento largo.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero el modelo base se entrenó principalmente con datos en portugués, lo que puede introducir sesgos culturales y lingüísticos.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que la licencia del modelo base y de los componentes derivados sea compatible; el autor no ofrece garantías.
- Dependencia exclusiva de MLX y Apple Silicon: no hay soporte documentado para CUDA, ROCm ni despliegue en servidores Linux.
- Sin soporte documentado de tool calling, function calling ni agentes, lo que limita su uso en pipelines automatizados complejos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/necropopeost/S5-nano-MLX-4bit-vision
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- API serverless del modelo base (Featherless): https://featherless.ai/models/maritaca-ai/S5-nano
- Familia NVIDIA Nemotron 3 (referencia comparativa): https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Dataset ENADE-QA: https://huggingface.co/datasets/northern-64bit/ENADE_Brazilian_national_university_examination_MCQ_483
- Librería `mlx-vlm`: no se proporciona URL directa en la información disponible.
