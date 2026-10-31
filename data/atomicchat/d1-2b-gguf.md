# AtomicChat/d1-2B-GGUF

## Resumen

d1-2B (GGUF) es una versión cuantizada, publicada por AtomicChat, del modelo de decisión d1-2B de LiquidAI. Se trata de un modelo especializado no en generación libre de texto, sino en responder preguntas tipificadas —sí/no, elección entre opciones o puntuación numérica— devolviendo una distribución de probabilidad sobre las opciones. Está construido sobre la arquitectura LFM3-VL de Liquid, lo que le permite procesar tanto texto como imágenes (pipeline image-text-to-text).

Este repositorio GGUF, cuantizado con el esquema "Atomic-Dynamic" (AD) e imatrix, permite ejecutar el modelo localmente con llama.cpp, servido mediante el endpoint `/v1/systemone`. Resuelve el problema de clasificación, extracción, scoring y calibración de probabilidades en hardware de consumo, con ficheros de entre 0,95 y 1,85 GB en disco.

Su relevancia actual radica en la tendencia hacia modelos pequeños y especializados para tareas de decisión estructurada (moderación, validación, enrutado, evaluación), donde la salida probabilística calibrada es más útil que texto generado. El propio model card indica que la cabeza de decisión es robusta a la cuantización, manteniendo fidelidades del 94-99 % respecto al modelo BF16 original según el nivel de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (backbone multimodal de Liquid, cabeza de decisión) |
| Parametros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S (GGUF con imatrix) |
| Idiomas soportados | inglés, chino, alemán |
| Licencia | LFM Open License v1.0 (other) |
| Formato de pesos | GGUF (incluye mmproj-d1-2B-F16.gguf para el proyector de visión) |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/d1-2B, es un "decision model" construido sobre el backbone LFM3-VL de Liquid AI, una arquitectura multimodal que acepta entradas de texto e imagen. A diferencia de un modelo conversacional estándar, d1-2B está diseñado para responder preguntas estructuradas con un tipo explícito (sí/no, elección múltiple o puntuación) y devolver una probabilidad calibrada sobre las opciones, en lugar de texto en lenguaje natural.

La versión de AtomicChat aplica cuantizaciones GGUF dinámicas con matriz de importancia (imatrix), evaluadas midiendo la coincidencia de respuesta (same-answer) y la distancia de variación total (TVD) frente al modelo BF16 original sobre un conjunto de 30 idiomas. Los datos de entrenamiento del modelo base (tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Clasificación binaria y multiclase (tipo "choice") con probabilidades calibradas sobre las opciones
- Puntuación numérica (tipo "score") y calibración de confianza
- Extracción estructurada de información a partir de texto
- Comprensión multimodal: acepta imágenes y texto como contexto de entrada (mmproj F16 incluido)
- Respuestas tipificadas en lugar de texto libre, servidas vía endpoint `/v1/systemone` de llama.cpp
- Soporte multilingüe declarado: inglés, chino y alemán (fidelidad de cuantización evaluada sobre 30 idiomas)
- Etiquetado como conversacional y "decision-model"; no está orientado a generación de texto largo, razonamiento multi-paso ni tool calling (no disponible en la información proporcionada)

## Casos de uso

- Moderación y filtrado de contenido: clasificación binaria o por categorías de mensajes, imágenes o comentarios con una probabilidad por clase, ideal como filtro previo de bajo coste en pipelines de contenido generado por usuarios.
- Enrutado de consultas (intent routing): decisión del tipo "choice" para dirigir cada petición de usuario al agente o modelo adecuado, con la probabilidad como señal de confianza para escalado o fallback.
- Evaluación y scoring de LLMs (LLM-as-judge ligero): puntuación de respuestas con el tipo "score", aprovechando la salida probabilística calibrada en lugar de texto que haya que parsear.
- Extracción de campos estructurados: responder preguntas tipificadas sobre documentos o contextos largos para poblar formularios o bases de datos (por ejemplo, ¿el contrato incluye cláusula de exclusividad? sí/no).
- Clasificación multimodal de imágenes: dado el mmproj incluido, decisiones sí/no o de elección sobre imágenes (¿contiene esta captura un error de UI?, ¿qué tipo de documento es?) en flujos de automatización.
- Verificación de hechos o validación de afirmaciones en RAG: puntuar la compatibilidad entre una respuesta generada y el contexto recuperado antes de mostrarla al usuario.
- Calibración de confianza en sistemas agentivos: usar las probabilidades del modelo como señal de abstención para decidir si un paso del agente necesita revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación publicada es la fidelidad de cada cuantización frente al modelo BF16 original:

| Rung | GB en disco | bpw | same-answer | TVD medio |
|---|---|---|---|---|
| Q8_0 | 1,85 | 8,51 | 99,3 % | 0,004 |
| AD-Q6_K | 1,55 | 7,31 | 98,7 % | 0,007 |
| AD-Q5_K_M | 1,29 | 6,03 | 97,5 % | 0,014 |
| AD-Q4_K_M | 1,12 | 5,20 | 96,3 % | 0,022 |
| AD-IQ4_XS | 1,05 | 5,02 | 95,9 % | 0,023 |
| AD-IQ3_S | 0,95 | 4,23 | 94,4 % | 0,041 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~1 y ~2 GB según el rung elegido (0,95 GB en disco para AD-IQ3_S hasta 1,85 GB para Q8_0), más la sobrecarga del runtime y del contexto; con el mmproj F16 hay que añadir el peso del proyector de visión.
- GPU recomendadas: no requiere GPU dedicada; por tamaño, cualquier GPU moderna con 4 GB de VRAM sobrada (RTX 3060, RTX 4060, RTX 4090) o incluso CPU es suficiente.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU de consumo; también es viable 100 % en CPU o en dispositivos con poca memoria dada la cuantización de ~1 GB.
- Despliegue: llama.cpp (requisito: build con el path de decisión d1/LFM3, fusionado en el PR #31275 de llama.cpp; los ficheros se generaron con llama.cpp `d05706b4`) mediante `llama-server`, con soporte para `-hf AtomicChat/d1-2B-GGUF:AD-Q4_K_M --mmproj mmproj-d1-2B-F16.gguf`. Compatibilidad con Ollama, LM Studio, vLLM o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles; dada la salida tipificada (no generación larga) y el tamaño reducido, se espera inferencia muy rápida, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia |
|---|---|---|---|---|
| AtomicChat/d1-2B-GGUF | 1,73 B | GGUF (AD quants) | Decision model multimodal (clasificación, scoring, calibración) | LFM Open License v1.0 |
| LiquidAI/d1-2B (base BF16) | 1,73 B | safetensors | Decision model multimodal | LFM Open License v1.0 |
| LiquidAI/LFM2-VL (familia VL pequeña) | no disponible en esta ficha | safetensors | Visión-lenguaje general | no disponible en esta ficha |

Nota: no hay modelos comparables públicos con salida probabilística tipificada vía `/v1/systemone` en la información disponible; la alternativa habitual a d1-2B es usar un LLM general pequeño con salida JSON restringida (constrained decoding), a costa de una calibración de probabilidades inferior.

## Limitaciones y advertencias

- No es un modelo de generación: no sirve para chat abierto, redacción o razonamiento largo; su salida es una decisión tipificada con probabilidades.
- Sesgos conocidos: no documentados en la información disponible; como todo modelo de clasificación entrenado por LiquidAI, puede heredar sesgos de sus datos de entrenamiento (no descritos en la ficha).
- Riesgo de alucinación: reducido por diseño (salida restringida a opciones), pero la calibración de probabilidades puede degradarse fuera de la distribución de entrenamiento; conviene validar las probabilidades en el dominio de uso.
- Idiomas: soporte declarado para inglés, chino y alemán; el rendimiento en castellano no está documentado (la evaluación de fidelidad de cuantización se hizo sobre 30 idiomas, pero sin desglose).
- Longitud de contexto: no disponible; verificar antes de usar con contextos largos.
- Licencia: LFM Open License v1.0, licencia "other" no estándar; revisar el texto de la licencia antes de uso comercial, ya que puede incluir restricciones específicas.
- Requiere una versión de llama.cpp con el path de decisión d1/LFM3 (PR #31275 o posterior); builds antiguos no servirán estos ficheros.
- La cuantización más agresiva (AD-IQ3_S) reduce la coincidencia de respuesta al 94,4 % respecto a BF16; para producción se recomienda AD-Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/d1-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/d1-2B/blob/main/LICENSE
- Atomic Chat (aplicación del editor): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- PR de llama.cpp con el path d1/LFM3: #31275 (referenciado en el model card)
