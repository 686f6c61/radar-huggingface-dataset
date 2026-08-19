# Rabe3/VoxCPM_mid_najdi_male

## Resumen

VoxCPM_mid_najdi_male es un modelo de síntesis de voz (text-to-speech) en árabe, concretamente entrenado para el dialecto najdi de Arabia Saudí. Es un fine-tune completo del modelo base openbmb/VoxCPM2, desarrollado por el usuario Rabe3, que resuelve el problema de generar voz natural en un dialecto árabe con control fino de la pronunciación mediante diacríticos (tashkeel). La relevancia actual radica en que los sistemas TTS comerciales suelen estar optimizados para árabe estándar moderno (MSA) y fallan en dialectos coloquiales como el najdi, muy usado en contenido audiovisual y asistentes de voz en la región del Golfo.

El modelo tiene 2.290 millones de parámetros (2,29B) y se basa en la arquitectura de VoxCPM2, que emplea un backbone MiniCPM-4 y modela el habla en un espacio continuo. Está entrenado sobre 515,8 horas de audio procedente de un corpus de YouTube najdi con más de mil hablantes, con texto diacritizado acústicamente. La salida es audio de 48 kHz, y soporta clonación de voz mediante audio de referencia. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (backbone MiniCPM-4, modelado continuo del habla) |
| Parametros totales | 2.290.004.544 (2,29B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; contexto de audio no especificado) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16, sin cuantizaciones publicadas) |
| Idiomas soportados | arabe (dialecto najdi de Arabia Saudi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoxCPM_mid_najdi_male es un fine-tune completo del modelo VoxCPM2 de OpenBMB, que a su vez se basa en un backbone MiniCPM-4 y representa el habla en un espacio continuo en lugar de tokens discretos. Esto permite una expresividad alta y una clonación de voz precisa con pocos segundos de audio de referencia. El fine-tune descongela todos los pesos excepto el AudioVAE, lo que permite que las capas de embedding aprendan representaciones adecuadas para los diacríticos árabes, algo que un enfoque LoRA no podía lograr al congelar las capas de embedding.

El entrenamiento se realizó sobre 292.217 filas (515,8 horas) derivadas de un corpus de YouTube najdi con aproximadamente 1.032 hablantes. El 70,5% de las filas contienen texto diacritizado, generado mediante un diacritizador acústico (Cohere-Speech-Tashkeel-2B) que refleja la pronunciación real de cada palabra. El 45% de las filas incluyen audio de referencia del mismo hablante. Se incluyeron duplicados sin diacríticos para enseñar al modelo que las marcas son modificadores opcionales de la misma pronunciación. El entrenamiento duró una época, 18.264 pasos con batch efectivo 16, learning rate 1e-5, weight decay 0.01 y warmup de 100 pasos, en una GPU H200. La pérdida de validación bajó de 0.9689 a 0.7834 (mejor valor en el paso 15.000) y se mantuvo plana a partir del paso 8.000.

## Capacidades

- Generacion de voz en arabe dialectal najdi con pronunciacion natural y acento local.
- Control fino de la pronunciacion mediante diacriticos (tashkeel) en el texto de entrada: el usuario puede especificar vocales cortas, shadda y otros marcadores para ajustar la articulacion.
- Clonacion de voz zero-shot: acepta un audio de referencia (hasta 10 segundos) para imitar la voz del hablante.
- Salida de audio a 48 kHz, con calidad de estudio.
- Soporte de texto largo mediante chunking automatico o manual en limites de frase (recomendado por el autor).
- Generacion de voz expresiva con control de tono y ritmo, gracias a la arquitectura de espacio continuo de VoxCPM2.
- Capacidad multilingue limitada al arabe najdi; no se garantiza correcta pronunciacion en otros dialectos o en MSA con terminaciones i'rab.

## Casos de uso

- Narracion de contenido audiovisual en dialecto najdi: el modelo puede generar locuciones para videos de YouTube, podcasts o series, con una pronunciacion autentica que conecta con la audiencia local.
- Asistentes de voz para aplicaciones de movilidad o servicios en Arabia Saudi: al soportar clonacion de voz, se puede crear un asistente con una voz corporativa especifica y responder en najdi, mejorando la experiencia del usuario.
- Audiolibros y contenido educativo en dialecto coloquial: permite convertir textos diacritizados en audio natural, util para materiales de aprendizaje de idiomas o literatura regional.
- Doblaje de personajes en videojuegos o animaciones: la clonacion de voz y el control de diacriticos permiten generar multiples personajes con voces distintas y matices emocionales.
- Generacion de respuestas de voz para chatbots y sistemas de atencion al cliente: integrable en pipelines de TTS para ofrecer respuestas habladas en el dialecto de los usuarios, con la posibilidad de ajustar la pronunciacion de nombres y terminos locales.
- Creacion de contenido para redes sociales: los creadores pueden generar voces en off para videos cortos sin necesidad de grabar, manteniendo un estilo dialectal coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MMLU o HumanEval) porque se trata de un modelo TTS. El autor proporciona metricas de WER (word error rate) en tareas de transcripcion inversa (transcribe-back) para evaluar la inteligibilidad de la salida:

| Configuracion | WER |
|---|---|
| Single-shot 47 s (sin chunking) | 0.410 - 0.476 |
| Split por comas + fallback de palabras (8 chunks) | 0.105 |
| Split por puntos y signos de interrogacion (16 chunks) | 0.069 |
| Chunks de hasta ~15 s | 0.040 - 0.100 |

Estas medidas indican que el modelo es muy inteligible cuando se respetan las recomendaciones de chunking, pero degrada notablemente en generaciones largas de una sola pasada.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica oficialmente. Con 2,29B de parametros en fp16, el peso ocupa aproximadamente 4,6 GB, mas overhead de activaciones y audio; se estima un minimo de 8-10 GB de VRAM para inferencia comoda.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA H200. Para inferencia, una GPU con al menos 12 GB de VRAM (como RTX 4070 Ti, RTX 4080, RTX 4090) deberia ser suficiente. GPUs de datacenter como A100 o H100 tambien funcionan.
- En GPUs consumer cabe sin problemas: si, con cuantizacion o sin ella, aunque no se han publicado versiones cuantizadas. Con 8 GB de VRAM podria ser justo; con 12 GB o mas es viable.
- Opciones de despliegue: la libreria oficial es `voxcpm` (CLI), y existe un nodo para ComfyUI (wildminder/ComfyUI-VoxCPM). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje sino de audio.
- Latencia y throughput: no se proporcionan datos. En una H200 el entrenamiento fue de una epoca, pero la inferencia no esta medida. Se recomienda chunking para textos largos, lo que implica un procesamiento por segmentos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos TTS para arabe dialectal. Como referencia, se puede comparar con el modelo base VoxCPM2 (multilingue, 30+ idiomas) y con alternativas comerciales o academicas como Coqui TTS o Tortoise TTS, pero no hay benchmarks publicados que permitan una comparacion objetiva. La principal diferenciacion de este modelo es su especializacion en un dialecto concreto con control de diacriticos, algo poco comun en modelos TTS abiertos.

## Limitaciones y advertencias

- El texto de entrada debe estar diacritizado siguiendo la misma convencion que el entrenamiento: sin terminaciones i'rab (pausal), con vocales dialectales y sin marcas finales de palabra. Texto en MSA estandar con i'rab completo esta fuera de distribucion y producira pronunciaciones incorrectas.
- No se incluye un diacritizador de texto en el modelo; el diacritizador usado en el entrenamiento es acustico y requiere audio, por lo que el usuario debe proporcionar texto ya diacritizado o usar una herramienta externa.
- La cobertura de diacriticos en el entrenamiento es de aproximadamente el 80%, por lo que las frases pueden contener palabras sin marcar. Esto es realista pero puede generar inconsistencias en la pronunciacion.
- Generaciones de mas de ~20 segundos en una sola pasada degeneran en balbuceos; es obligatorio dividir el texto en chunks de menos de 15 segundos para obtener resultados de calidad.
- El audio de referencia se limita a 10 segundos; referencias mas largas no estan probadas.
- El modelo esta entrenado exclusivamente en dialecto najdi. La pronunciacion de la letra gaf (ق) como /g/ es intencional y no debe considerarse un error.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias; el autor no asume responsabilidad por usos indebidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rabe3/VoxCPM_mid_najdi_male
- Sitio oficial de VoxCPM: https://voxcpm.com/en/
- Nodo ComfyUI para VoxCPM: https://github.com/wildminder/ComfyUI-VoxCPM
- Organizacion OpenBMB en GitHub: https://github.com/OpenBMB
- Modelo base VoxCPM2 en HuggingFace: https://huggingface.co/openbmb/VoxCPM2
- Diacritizador acustico usado: https://huggingface.co/NAMAA-Space/Cohere-Speech-Tashkeel-2B
