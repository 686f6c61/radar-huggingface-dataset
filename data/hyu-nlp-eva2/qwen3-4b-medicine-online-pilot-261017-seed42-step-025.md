# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-025

## Resumen

`HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-025` es un checkpoint de ajuste fino del modelo denso Qwen3-4B-Instruct-2507, publicado por el grupo HYU-NLP-EVA2. No se trata de un modelo nuevo entrenado desde cero, sino de una instantánea intermedia (step 25) de un experimento de aprendizaje por refuerzo en el dominio de la medicina, identificado en la model card como "Medicine online-rubrics pilot", con semilla 42 y ejecución `261017_medicine_online_pilot_seed42`. El repositorio contiene una exportación en BF16 para Transformers y, en `original_checkpoint/`, los ficheros nativos veRL/FSDP con sus metadatos.

El interés práctico es acotado y muy específico: sirve como material de reproducibilidad para investigadores que trabajan en pipelines de RL con rúbricas aplicadas a dominios sanitarios, y como punto de comparación frente al modelo base para medir deriva, olvido catastrófico o ganancias tempranas de entrenamiento. Al ser un checkpoint del step 25, no debe interpretarse como un modelo médico terminado ni validado clínicamente.

Sus 4.022.468.096 parámetros (~4,02 B) y su licencia Apache 2.0 lo sitúan en la franja de modelos pequeños desplegables en una sola GPU de consumo, lo que facilita experimentación económica. La información publicada es mínima: no hay benchmarks, ni declaración de idiomas, ni detalles del dataset, de modo que cualquier evaluación de calidad debe hacerse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (fine-tune de Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (~4,02 B), segun safetensors |
| Parametros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible en la informacion proporcionada; depende de la configuracion heredada del modelo base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos BF16 en safetensors. No se incluyen GGUF, AWQ, GPTQ ni NF4 |
| Idiomas soportados | no disponible; la model card no declara lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) para Transformers; checkpoint nativo veRL/FSDP en `original_checkpoint/` |
| Tamano del repositorio | 25,7 GB (incluye exportacion BF16 y checkpoint original) |
| Libreria / pipeline | transformers, text-generation; compatible con text-generation-inference y endpoints_compatible |
| Tipo de artefacto | checkpoint intermedio (step 25) de un run de RL, no un release final |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de Qwen3, con ~4,02 B de parámetros. No hay ninguna indicación de modificaciones estructurales, mezcla de expertos, capas SSM ni cambios de tokenizador; el repositorio se limita a exportar los pesos ajustados en BF16 con la configuración de Transformers. Cualquier detalle sobre número de capas, dimensión oculta, cabezas de atención o tipo de atención (por ejemplo, atención lineal o híbrida) debe consultarse en la model card de Qwen3-4B-Instruct-2507, ya que no se reproduce aquí.

Sobre el entrenamiento, la información disponible es exigua y de tipo operativo: se trata de un run de "Medicine online-rubrics pilot", con semilla 42, y el artefacto es el checkpoint del step 25. La model card menciona explícitamente ficheros nativos veRL/FSDP, lo que sitúa el entrenamiento en el ecosistema veRL (framework de RL para modelos de lenguaje) y sugiere un esquema de recompensas basado en rúbricas evaluadas online, aunque la composición del dataset, el volumen de tokens, la función de recompensa concreta y si hubo fases previas de SFT, DPO o RLHF no están documentados. Tampoco se indica si el checkpoint se seleccionó por algún criterio de validación o si es simplemente un guardado periódico.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Qwen3-4B-Instruct-2507.
- Respuesta a instrucciones y preguntas de dominio biomédico, presumiblemente sesgada por el corpus del piloto (sin datos públicos que lo confirmen).
- Razonamiento multi-turno dentro de los límites de contexto del modelo base.
- Soporte de tool calling / function calling: no documentado en este checkpoint; debe verificarse empíricamente contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este fine-tune.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.
- Multilingüismo: no disponible; no se declara lista de idiomas.
- Vision, audio u otras modalidades: no disponibles; el pipeline es exclusivamente text-generation.
- Capacidad de servir como referencia de comparación frente al modelo base para estudiar efectos del entrenamiento con RL.

## Casos de uso

- Reproducibilidad de experimentos de RL con rúbricas: el paquete incluye el checkpoint nativo veRL/FSDP y la semilla (42) y el step (25), lo que permite replicar exactamente el estado del run en estudios de metodología de recompensas.
- Estudio de deriva respecto al modelo base: comparar respuestas de este checkpoint y de Qwen3-4B-Instruct-2507 sobre el mismo conjunto de prompts médicos para cuantificar cuánto cambia el comportamiento en solo 25 pasos de RL.
- Análisis de olvido catastrófico: evaluar si el ajuste con rúbricas médicas degrada capacidades generales (matemáticas, código, instrucciones neutras) usando baterías estándar sobre ambos checkpoints.
- Generación de borradores para revisión experta: producir respuestas preliminares a preguntas clínicas educativas que un profesional sanitario revisa y corrige después, aprovechando el bajo coste de inferencia de un modelo de 4 B.
- Baseline en pipelines de evaluación automática: usar el modelo como generador de referencia en sistemas de scoring de QA médico, siempre con validación humana y sin uso diagnóstico.
- Prototipado interno de asistentes informativos: desplegar un chat de divulgación sanitaria en entorno controlado, con filtros de seguridad y mensajes de exención de responsabilidad, para validar flujos de producto antes de sustituir el modelo por uno validado.
- Generación de datos sintéticos para filtrado: crear pares pregunta-respuesta en dominio médico que luego se filtran por reglas y revisión humana antes de incorporarse a un dataset mayor.
- Investigación en destilación y cuantización: servir como profesor o como punto de partida para producir versiones GGUF/4-bit y medir la pérdida de calidad en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan comparaciones con el modelo base. Cualquier cifra que se quiera usar debe generarse mediante evaluación propia, y conviene registrar el step (25) y la semilla (42) junto a los resultados.

## Requisitos de hardware

- Pesos en BF16: 4.022.468.096 parámetros × 2 bytes ≈ 8,05 GB solo para los pesos; el repositorio ocupa 25,7 GB porque incluye además el checkpoint nativo.
- VRAM estimada para inferencia en BF16: en torno a 10-12 GB con contextos moderados (activaciones y caché KV aparte); crece de forma apreciable con contextos largos.
- VRAM estimada en cuantización de 4 bits (si el usuario la genera): aproximadamente 2,5-3,5 GB de pesos, más caché KV.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 / 4070 Ti Super (16 GB) y RTX 3090 (24 GB) en BF16; en 4 bits es viable en tarjetas de 8 GB.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A10G son sobredimensionadas para un modelo de este tamaño; su uso tiene sentido solo por agregación de peticiones.
- Despliegue: transformers como referencia, vLLM o TGI (la etiqueta `text-generation-inference` está presente), y llama.cpp/Ollama tras convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

Cifras de parámetros y licencias de los modelos alternativos tomadas de sus model cards públicas; no forman parte de la información proporcionada en esta ficha y no se han verificado aquí.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks publicados |
|---|---|---|---|---|---|
| Este checkpoint (qwen3-4b-medicine-online-pilot step 25) | ~4,02 B | no disponible | Apache 2.0 | Fine-tune de RL con rúbricas médicas, checkpoint intermedio | no disponible |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4,02 B | consultar su model card | Apache 2.0 | Instrucción generalista multilingüe | disponibles en su model card, no reproducidos aquí |
| Llama 3.2 3B Instruct | ~3,2 B | 128k según su model card | Llama 3.2 Community License | Instrucción generalista | disponibles en su model card |
| Phi-4-mini-instruct | ~3,8 B | 128k según su model card | MIT | Instrucción y razonamiento, foco en matemáticas y código | disponibles en su model card |
| Modelos médicos abiertos de ~4 B (por ejemplo, la familia MedGemma) | ~4 B | consultar su model card | términos específicos del proveedor | Ajuste específico sanitario con validación publicada | disponibles en su model card |

La diferencia relevante frente a esas alternativas no es de rendimiento, que aquí no está medido, sino de naturaleza del artefacto: este repositorio es un checkpoint de investigación en un paso muy temprano, mientras que los comparables son releases finales con evaluaciones publicadas y, en el caso de los modelos médicos, con procesos de validación documentados.

## Limitaciones y advertencias

- Checkpoint intermedio (step 25): no hay garantía de que el entrenamiento haya convergido; el comportamiento puede ser inestable o estar a medio adaptar.
- Ausencia total de benchmarks: no se puede afirmar ninguna mejora sobre el modelo base en tareas médicas.
- Riesgo elevado de alucinación en contenido sanitario: es un modelo de 4 B ajustado con un pipeline experimental, sin validación clínica ni evaluación de seguridad publicada.
- No apto para uso clínico, diagnóstico, triaje ni consejo médico a pacientes; cualquier despliegue en ese contexto entra en el ámbito de la regulación de productos sanitarios (MDR en la UE) y exige evaluación conformity.

- Sin declaración de idiomas: se desconoce el soporte real fuera del inglés y del chino del modelo base; el rendimiento en castellano no está verificado.
- Sin información sobre sesgos: no se documenta composición del dataset ni procesos de mitigación, por lo que pueden persistir sesgos demográficos y clínicos del corpus de entrenamiento.
- Sin detalles de alineamiento de seguridad: no se indica si hubo filtrado de contenido dañino tras el RL; conviene aplicar guardarraíles externos.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero no transfiere ninguna garantía ni cumplimiento regulatorio; además, los términos del modelo base deben respetarse igualmente.
- Requisito de disco: 25,7 GB de repositorio por la duplicación de pesos (BF16 y checkpoint nativo), relevante en entornos con cuotas de almacenamiento.
- Trazabilidad limitada: el nombre del run y la semilla permiten reproducir, pero no se publican hiperparámetros, función de recompensa ni conjunto de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-025
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework veRL, citado en la model card como origen del checkpoint nativo: https://github.com/volcengine/verl
- Documentación de Transformers: https://huggingface.co/docs/transformers
- La búsqueda web realizada no devolvió enlaces relevantes: los resultados corresponden a Hyundai France, canales de YouTube, un atleta de ONE Championship y catálogos de Hyper U, coincidencias léxicas con "HYU" sin relación con el modelo.
