# brainworkup/LFM3-Omni-2B-MLX-oQ8e

## Resumen

LFM3-Omni-2B-MLX-oQ8e es una versión cuantizada del modelo omnimodal LFM3-Omni-2B (Liquid Foundation Models, de la familia LFM desarrollada por Liquid AI), preparada para ejecutarse con la librería MLX de Apple Silicon. La cuantización ha sido realizada por el usuario brainworkup mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta para reducir el tamaño del checkpoint manteniendo la mayor parte de los pesos en 8 bits y conservando ciertos tensores en BF16.

El modelo base es omnimodal de tamaño compacto (2,17 mil millones de parámetros), lo que significa que procesa lenguaje, visión y audio en una única arquitectura. El checkpoint cuantizado ocupa 2,6 GB, con una media efectiva de 9,536 bits por peso, y se descompone en un modelo de lenguaje de 1,868B de parámetros, un componente de visión de 0,189B y uno de audio de 0,110B. Su relevancia está en permitir la inferencia multimodal local en Mac (Apple Silicon) con requisitos de memoria muy reducidos.

No se ha publicado información detallada sobre la longitud de contexto, el proceso de entrenamiento ni resultados de benchmarks en la model card del repositorio cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omnimodal (lenguaje + visión + audio), familia LFM de Liquid AI; detalles no disponibles |
| Parametros totales | 2.166.928.384 (2,167B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: Affine 8-bit (grupo 64) para el 86,187% de los pesos y BF16 para el 13,813%; media efectiva 9,536 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX, cuantizado con oQ) |

## Arquitectura y entrenamiento

El modelo es una versión omnimodal de la familia LFM (Liquid Foundation Models) de Liquid AI, que combina un modelo de lenguaje central (1,868B de parámetros) con codificadores de visión (0,189B) y audio (0,110B). La model card del repositorio cuantizado no detalla la arquitectura interna exacta (tipo de capas de atención, tokenizers multimodales ni longitud de contexto), por lo que estos datos no están disponibles.

Respecto a la cuantización, se ha utilizado oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta para MLX. La distribución resultante es la siguiente: 1,868B de pesos lógicos en formato Affine 8-bit con grupo 64 (1,848 GiB, 8,50 bits/peso efectivos) y 0,299B de pesos en BF16 (0,558 GiB, 16 bits/peso). El checkpoint completo ocupa 2,406 GiB, con una media efectiva de 9,536 bits por peso. Los pesos en BF16 se reservan típicamente para capas sensibles a la precisión (embeddings, normalizaciones o cabezas de salida), aunque la model card no especifica qué tensores concretos se mantienen en alta precisión.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre fases de RLHF, DPO u otros alineamientos del modelo base.

## Capacidades

- Procesamiento omnimodal: acepta entradas de texto, imágenes (componente de visión de 0,189B de parámetros) y audio (componente de audio de 0,110B de parámetros).
- Generación de texto y razonamiento mediante el modelo de lenguaje central de 1,868B de parámetros.
- Ejecución nativa en Apple Silicon mediante la librería MLX, optimizada para la memoria unificada de los chips M de Apple.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modos especiales (thinking mode, generación de audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Asistentes multimodales locales en Mac: el tamaño reducido (2,6 GB) permite ejecutar en un MacBook un asistente que combine texto, imágenes y audio sin depender de la nube, útil para privacidad y trabajo sin conexión.
- Transcripción y análisis de audio en el dispositivo: el componente de audio de 0,110B de parámetros permite procesar grabaciones de voz, notas habladas o clips cortos directamente en Apple Silicon.
- Descripción y análisis de imágenes: el componente de visión permite responder preguntas sobre capturas de pantalla, documentos escaneados o fotografías en aplicaciones locales.
- Prototipado de aplicaciones multimodales: su tamaño compacto y su disponibilidad en MLX lo hacen adecuado para iterar rápidamente en apps con Swift/Python sobre hardware de consumo, antes de escalar a modelos mayores.
- Automatización de flujos de trabajo en escritorio: combinando entrada de imagen y audio, se puede usar para clasificar capturas, extraer texto de imágenes o resumir reuniones grabadas localmente.
- Despliegue en dispositivos con memoria limitada: con 2,6 GB de checkpoint, cabe en máquinas con 8 GB de memoria unificada, habilitando casos de edge computing sobre hardware Apple.
- Educación y experimentación: al ser un modelo pequeño y omnimodal, es adecuado para estudiar arquitecturas multimodales completas sin necesidad de GPUs de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado solo documenta la distribución de bits de la cuantización, no evaluaciones de calidad (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base en precisión completa.

## Requisitos de hardware

- Memoria estimada para inferencia: el checkpoint ocupa 2,6 GB (2,406 GiB de pesos); con overhead de KV cache y activaciones, es razonable estimar un requisito de entre 4 y 6 GB de memoria unificada, según la longitud de contexto utilizada (longitud de contexto no disponible).
- Hardware recomendado: equipos Apple Silicon (chips M1, M2, M3, M4 o posteriores) con al menos 8 GB de memoria unificada; 16 GB o más para contextos largos o uso simultáneo de otras aplicaciones.
- Consumer GPU: al ser un modelo en formato MLX, está orientado a Apple Silicon con memoria unificada y no a GPUs NVIDIA de consumo; no es ejecutable directamente en tarjetas como la RTX 4090 sin conversión de formato.
- Opciones de despliegue: MLX (librería nativa) y oMLX/oQ (herramienta empleada para la cuantización, disponible en https://github.com/jundot/omlx). No consta soporte documentado para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Formato/plataforma | Licencia |
|---|---|---|---|---|
| LFM3-Omni-2B-MLX-oQ8e | 2,167B (cuantizado, 9,536 bits/peso) | Texto, visión, audio | safetensors MLX, Apple Silicon | no disponible |
| LFM2-VL de Liquid AI (referencia de la misma familia) | ~2B-3B según variante | Texto, visión | MLX y otros | no disponible en la información proporcionada |
| Qwen2.5-Omni-3B (categoría similar, omnimodal compacto) | ~3B | Texto, visión, audio, generación de voz | PyTorch, GGUF, vLLM | Apache 2.0 (según repositorio oficial) |
| Gemma 3n (categoría similar, multimodal compacto) | ~2B-4B efectivos | Texto, visión, audio | PyTorch, llama.cpp, MLX | Licencia Gemma |

Nota: la comparativa se ofrece a título orientativo entre modelos omnimodales compactos; para LFM3-Omni-2B no se dispone de datos de benchmarks que permitan comparar rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se ha documentado información sobre sesgos en la model card.
- Riesgo de alucinación: al tratarse de un modelo de lenguaje compacto (1,868B de parámetros en el componente lingüístico), el riesgo de alucinación es inherente y puede ser mayor que en modelos de mayor escala; no existen evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en el repositorio, lo que dificulta planificar su uso en producción.
- Restricciones de licencia: la licencia no está indicada en el repositorio, por lo que no puede confirmarse la permisividad para uso comercial; debe verificarse la licencia del modelo base LFM3-Omni-2B de Liquid AI antes de cualquier despliegue comercial.
- Cuantización de precisión mixta: aunque el 86% de los pesos está en 8 bits, la conversión puede degradar ligeramente la calidad respecto al modelo en BF16/FP16, especialmente en tareas sensibles a la precisión numérica; no hay evaluaciones que midan esta degradación.
- Repositorio con muy poca traza comunitaria: 0 descargas y 0 likes en el momento de la ficha, y cuantización publicada por un usuario individual (no por el autor oficial del modelo), lo que aconseja validar la calidad del checkpoint antes de usarlo en producción.
- Plataforma: el formato MLX limita la ejecución a hardware Apple; no hay rutas documentadas de despliegue en servidores Linux con GPUs NVIDIA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/brainworkup/LFM3-Omni-2B-MLX-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Repositorio oficial del modelo base LFM3-Omni-2B (Liquid AI): no disponible en la información proporcionada
- Paper del modelo: no disponible
- Demo del modelo: no disponible
