# kkt94/Llama-V-JEPA-LM-Llama3.1-8B

## Resumen

Llama-V-JEPA-LM-Llama3.1-8B es un modelo video-lenguaje desarrollado por el usuario kkt94 (familia Llama-V-JEPA-LM) que acopla un codificador de vídeo congelado V-JEPA 2.1 (ViT-g, modelo del mundo) a un modelo de lenguaje Llama-3.1-8B-Instruct mediante un "puente espectral" que convierte cada clip de 32 fotogramas en 1.024 tokens visuales. El modelo resuelve tareas de comprensión de vídeo: responder preguntas sobre dinámica, orden temporal, dirección, velocidad y cambios de estado en secuencias de vídeo. Es relevante porque propone una vía distinta a los VLM de vídeo convencionales: en lugar de entrenar un codificador visual desde cero, reutiliza un modelo del mundo preentrenado y alinea su representación con el LLM.

El entrenamiento se basa en supervisión contrafactual: transformaciones de píxeles sobre vídeos públicos generan variantes con respuestas equilibradas y fijadas por construcción, que difieren solo en cómo cambia la escena, de modo que el LLM aprende a leer la dinámica que el codificador del modelo del mundo ya captura. Se entrenó sobre 4,53 millones de muestras públicas y, según el autor, alcanza una media de 70,51 en 12 puntuaciones sobre 11 benchmarks de vídeo, por delante de los modelos abiertos de su clase de tamaño (el mejor 8B abierto sería PLM-8B con 64,79).

El modelo tiene 9.068.286.976 parámetros totales, se distribuye en safetensors con código personalizado (`custom_code`) y licencia Llama 3.1. Está pensado para investigación y despliegue en tareas de video question answering en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM decoder-only (Llama-3.1-8B-Instruct) + codificador de vídeo V-JEPA 2.1 (ViT-g, congelado) + puente espectral; multimodal vídeo-lenguaje |
| Parametros totales | 9.068.286.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el LLM base Llama-3.1-8B-Instruct soporta 128K tokens, pero la ficha no confirma el contexto efectivo con tokens visuales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas: un codificador de vídeo V-JEPA 2.1 basado en ViT-g, congelado durante el entrenamiento, que actúa como modelo del mundo; un puente espectral que proyecta la representación del vídeo al espacio del LLM, generando 1.024 tokens visuales por cada clip de 32 fotogramas; y Llama-3.1-8B-Instruct como decodificador de lenguaje. El modelo base es `meta-llama/Llama-3.1-8B-Instruct` con relación de fine-tuning.

El entrenamiento emplea supervisión contrafactual: se aplican transformaciones de píxeles a vídeos públicos para producir variantes con respuestas equilibradas, fijadas por construcción y que difieren únicamente en la dinámica de la escena (dirección, velocidad, orden, estado). Así el LLM aprende a explotar la información dinámica que el codificador del modelo del mundo ya contiene. El conjunto de entrenamiento suma 4,53 millones de muestras públicas e incluye el split FGQA de PLM-Video-Human (salida de Llama 3.2), lo que impone obligaciones adicionales de la Llama 3.2 Community License, incluido el requisito de llevar el prefijo "Llama" en el nombre. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Comprensión de vídeo y respuesta a preguntas (video question answering) en inglés.
- Razonamiento sobre dinámica temporal: orden de eventos, dirección, velocidad y cambios de estado en la escena.
- Preguntas de opción múltiple sobre acciones y movimiento (SSv2, MotionBench, PerceptionTest).
- Razonamiento temporal fino (TempCompass, TemporalBench, TVBench).
- Discriminación de pares de vídeo/texto (Vinoground, MVP) para tareas de coherencia vídeo-texto.
- Capacidades de lenguaje heredadas de Llama-3.1-8B-Instruct (generación de texto, razonamiento, código, matemáticas) en la medida en que el fine-tuning las preserve; no confirmadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Análisis de vigilancia y seguridad: el modelo puede describir y responder preguntas sobre secuencias de vídeo de 32 fotogramas, aprovechando su sensibilidad a dirección y orden de eventos para detectar cambios de estado relevantes.
- Indexación semántica de archivos audiovisuales: generar descripciones y respuestas sobre clips para construir metadatos consultables en bibliotecas de vídeo, gracias a la representación compacta de 1.024 tokens por clip.
- Control de calidad en vídeo deportivo: responder preguntas sobre velocidad, trayectoria y orden de acciones en clips cortos, un escenario alineado con los benchmarks de movimiento (MotionBench, SSv2).
- Evaluación de modelos del mundo: usar el modelo como sonda para investigar qué información dinámica codifica V-JEPA 2.1, dado el diseño de supervisión contrafactual.
- Asistentes de accesibilidad: responder preguntas en lenguaje natural sobre el contenido y la evolución temporal de un vídeo para usuarios con discapacidad visual.
- Investigación en robótica y planificación: aprovechar la conexión entre un modelo del mundo de vídeo y un LLM para experimentos de razonamiento sobre consecuencias de acciones en escenas grabadas.
- Moderación de contenido en vídeo: clasificar y responder preguntas sobre acciones y cambios de escena en clips cortos para triaje automatizado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en la model card:

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 71,9 |
| PerceptionTest | accuracy | 75,0 |
| TVBench | accuracy | 71,8 |
| TempCompass | accuracy | 77,6 |
| TOMATO | accuracy | 55,5 |
| MotionBench | accuracy | 55,9 |
| NExT-QA | accuracy | 79,0 |
| MVP | pair accuracy | 57,6 |
| TemporalBench (binary) | accuracy | 72,3 |
| SSv2 (multiple choice) | accuracy | 92,3 |
| Vinoground text | text pair accuracy | 74,2 |
| Vinoground video | video pair accuracy | 63,0 |

El autor declara una media de 70,51 en las 12 puntuaciones, frente a 64,79 de PLM-8B (mejor modelo abierto de 8B según la model card). Comparativas citadas por el autor: SSv2 92,3 frente a 67,9; Vinoground video 63,0 frente a 44,8; TOMATO 55,5 frente a 42,6; Vinoground text 74,2 frente a 63,x (valor truncado en la información disponible). No se han publicado en la información disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9.068 millones de parámetros en safetensors (18,2 GB de repositorio), la inferencia en fp16 requiere aproximadamente 18-20 GB de VRAM para los pesos, más el codificador V-JEPA 2.1 (ViT-g) y las activaciones de los 1.024 tokens visuales por clip.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantización; RTX 4090 (24 GB) podría alojar los pesos en fp16 pero con margen ajustado para el codificador y activaciones.
- Cabe en GPU de consumo: probablemente en RTX 4090 con cuantización o gestión cuidadosa de memoria; en GPUs de 16 GB o menos no es viable sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: transformers con `custom_code` (requiere confiar en código remoto); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible. Existe una demo en ZeroGPU en Hugging Face Spaces.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 12 scores (vídeo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Llama3.1-8B | 9,07B | no disponible | 70,51 (declarado) | Llama 3.1 | Hugging Face, demo ZeroGPU |
| PLM-8B | clase 8B | no disponible | 64,79 (citado por el autor) | no disponible | no disponible |
| Modelos abiertos 8B de vídeo (genéricos) | ~8B | no disponible | inferiores según el autor | variable | no disponible |

La información proporcionada solo permite comparar con PLM-8B y con la referencia agregada a "mejor modelo abierto de 8B" citada por el autor. No se dispone de datos de contexto, licencia ni disponibilidad de los comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con vídeos públicos, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: inherente a los LLM; las respuestas sobre eventos no visibles en el clip pueden ser inventadas, especialmente en clips de solo 32 fotogramas.
- Limitaciones de contexto e idioma: soporte únicamente en inglés; cada clip se limita a 32 fotogramas y 1.024 tokens visuales, lo que restringe la comprensión de vídeos largos.
- Licencia: Llama 3.1 Community License y Acceptable Use Policy; el uso comercial está sujeto a esas condiciones. Además, el dataset de entrenamiento incluye PLM-Video-Human (salida de Llama 3.2), lo que impone la Llama 3.2 Community License y exige mantener el prefijo "Llama" en el nombre del modelo.
- Código personalizado: requiere `trust_remote_code=True` en transformers, con el riesgo de seguridad asociado a ejecutar código del repositorio.
- Benchmarks no verificados: todos los resultados de la model card están marcados como `verified: false`; deben tratarse como declaraciones del autor.
- Madurez: modelo reciente (creado en noviembre de 2026), con 771 descargas y 12 likes en el momento de la consulta; ecosistema de despliegue y cuantizaciones aún sin documentar.

## Enlaces

- Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Llama3.1-8B
- Paper: https://arxiv.org/abs/2611.17831
- Código y reporte técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Política de uso aceptable Llama 3.1: https://www.llama.com/llama3_1/use-policy/
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
