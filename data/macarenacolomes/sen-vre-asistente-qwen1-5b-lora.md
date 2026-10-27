# macarenacolomes/sen-vre-asistente-qwen1.5b-lora

## Resumen

`sen-vre-asistente-qwen1.5b-lora` es un adaptador LoRA de 74 MB entrenado sobre el modelo base Qwen2.5-1.5B-Instruct para actuar como asistente divulgativo sobre el Sistema Eléctrico Nacional (SEN) de Chile y el pronóstico de generación renovable variable (solar y eólica). Lo desarrolla macarenacolomes en el marco del taller "Destilación en pequeño" del curso Tópicos Avanzados en IA 2 (Magíster en IA, Universidad Adolfo Ibáñez). El problema que aborda es acotado y formativo: servir de apoyo de inducción a analistas nuevos de un equipo de datos de energía, explicando conceptos como el rol del Coordinador Eléctrico Nacional, el vertimiento, el uso de datos meteorológicos y del CEN, y los criterios de evaluación de un pronóstico.

El modelo es un ejercicio de destilación de conocimiento: un LLM comercial (`gpt-6-luna`, vía API de OpenAI) generó 60 pares pregunta-respuesta en español con un máximo de 90 palabras por respuesta, y con esos pares se ajustó el modelo base mediante SFT con LoRA (r=16, alpha=32, dropout=0.05) sobre los módulos de atención y MLP. No hay preentrenamiento ni modificación de la arquitectura: el adaptador solo especializa el estilo y el vocabulario del dominio sobre un transformer decoder-only de aproximadamente 1,5 mil millones de parámetros.

Su relevancia es fundamentalmente metodológica: documenta de forma transparente un pipeline completo de destilación a pequeña escala (generación de datos con profesor LLM, conjunto de examen fijo separado, evaluación con juez LLM y auditoría humana del juez), incluyendo las cifras antes y después del ajuste y una discusión explícita sobre el ruido y la generosidad del juez. El propio autor lo declara proyecto educativo y no apto para decisiones operacionales, regulatorias ni de inversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 1,5 mil millones en el modelo base Qwen2.5-1.5B-Instruct; el adaptador LoRA ocupa 74 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el adaptador no modifica la ventana del modelo base |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye sin cuantizar en safetensors |
| Idiomas soportados | Espanol (tag `es`) |
| Licencia | Apache 2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de tipo denso. El ajuste es SFT con LoRA: se enmascara la pregunta y solo se calcula la pérdida sobre la respuesta, con r=16, alpha=32, dropout=0.05, y se actualizan los módulos `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`. Hiperparámetros: 3 épocas, tasa de aprendizaje 0,0005, lote de 4, 45 pasos totales, con pérdida que baja de 2,51 a 0,89. El entrenamiento se ejecutó en un Mac con Apple Silicon (backend MPS), lo que da una idea de la escala: no requiere GPU de datacenter.

Los datos son 60 pares pregunta-respuesta generados por un LLM comercial (`gpt-6-luna`) actuando como profesor, en español y con un límite de 90 palabras por respuesta, cubriendo seis temas: operación del SEN y el Coordinador, generación solar y eólica en Chile, transmisión y vertimiento, datos meteorológicos y del CEN, modelos de pronóstico, y evaluación e incertidumbre del pronóstico. Se reservó un examen fijo de 12 preguntas (2 por tema) que nunca se usó para entrenar. La autora revisó una muestra de 10 respuestas del profesor con asistencia de otro LLM: el contenido era correcto, pero 2 tenían el tema mal asignado. Los datos de entrenamiento no se publican en el repositorio. No se emplearon RLHF ni DPO, ni técnicas de decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en español con formato de chat (mensajes de sistema, usuario y asistente).
- Explicación de conceptos del SEN chileno: rol del Coordinador Eléctrico Nacional, transmisión, vertimiento de energía renovable.
- Descripción cualitativa del pronóstico de generación solar y eólica por zona en Chile.
- Vocabulario y encuadre del dominio: datos meteorológicos, datos del CEN, modelos de pronóstico, métricas de evaluación e incertidumbre.
- Respuestas deliberadamente breves (el entrenamiento limita la referencia a 90 palabras), adecuadas para formato de inducción.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento es de un único turno pregunta-respuesta.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.
- Multilingüismo: limitado al español según la model card; no se documenta calidad en otros idiomas.

## Casos de uso

- Inducción de analistas nuevos en un equipo de datos de energía: el modelo actúa como primera línea de preguntas frecuentes sobre el SEN y el pronóstico renovable, con respuestas cortas que el analista puede contrastar después con la normativa oficial.
- Material de apoyo en formación interna: sirve para generar borradores de explicaciones que un experto revisa y corrige, aprovechando que el coste de inferencia es mínimo (modelo de 1,5B).
- Ejemplo docente de pipeline de destilación: el repositorio documenta generación de datos con profesor LLM, separación de un examen fijo, ajuste LoRA y evaluación con juez LLM, replicable en un portátil con Apple Silicon.
- Prototipo de evaluación de jueces LLM: las cifras de auditoría (el juez fue 0,9 puntos más generoso de media, con correlación de Spearman 0,96 frente a la revisión humana) sirven como caso práctico para estudiar sesgos de evaluación automática.
- Base para experimentos de sustitución de profesor: al estar el adaptador aislado en 74 MB, se puede reentrenar con otro conjunto de pares y comparar contra este checkpoint manteniendo el mismo examen de 12 preguntas.
- Demostración de despliegue en hardware de consumo: cuantizado en 4 bits cabe en GPUs de gama media y en CPU, útil para talleres donde no hay acceso a GPUs de datacenter.
- No se recomienda, en ningún caso, como asistente para decisiones operacionales, regulatorias o de inversión sobre el SEN.

## Benchmarks y rendimiento

Los únicos datos disponibles son la evaluación interna del autor sobre el examen fijo de 12 preguntas, con notas de 1 a 10 asignadas por un juez LLM frente a la referencia del profesor (7 = aceptable para un usuario real).

| Metrica | Antes (modelo base) | Despues (adaptador LoRA) |
|---|---|---|
| Nota media | 2,58 | 4,83 |
| Aprobacion (nota >= 7) | 0 % | 25 % |

| Tema (2 preguntas por tema) | Antes | Despues |
|---|---|---|
| Datos meteorologicos y del CEN | 2,50 | 3,50 |
| Evaluacion e incertidumbre del pronostico | 3,00 | 6,00 |
| Generacion solar y eolica en Chile | 1,50 | 3,50 |
| Modelos de pronostico | 2,50 | 4,50 |
| Operacion del SEN y el Coordinador | 2,50 | 6,00 |
| Transmision y vertimiento | 3,50 | 5,50 |

Advertencias del propio autor sobre estas cifras: el juez es ruidoso (diferencias de hasta ±1 punto por ítem y de hasta 0,3 en la media para respuestas idénticas), por lo que variaciones menores a 0,5 no son concluyentes; el juez es generoso (en una auditoría de 10 ítems la revisión humana puso 0,9 puntos menos de media), por lo que la aprobación real probablemente es inferior al 25 %; y con 2 preguntas por tema las notas por tema son solo indicativas. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ningún benchmark estándar.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 1,5B más adaptador fusionado): alrededor de 3,1 GB solo de pesos en fp16, aproximadamente 4 GB de VRAM con overhead de activaciones y caché KV para contextos cortos; alrededor de 0,8-1 GB de pesos en cuantización de 4 bits, aproximadamente 2 GB de VRAM en total. Son estimaciones por tamaño, no medidas publicadas.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o más es suficiente (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090); en datacenter basta una A100, H100, L4 o T4. El modelo es sobredimensionado para estas GPUs, que quedan limitadas por latencia más que por memoria.
- Cabe holgadamente en GPU consumer y también en CPU y en Apple Silicon: el autor entrenó el adaptador en un Mac con MPS.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada en la model card), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp y Ollama (requieren fusionar el adaptador con el modelo base y convertir a GGUF), y servidores ligeros tipo FastAPI sobre transformers.
- Latencia y throughput: no se han publicado medidas en la informacion disponible. Por el tamaño (1,5B) se espera decodificación en tiempo real en GPU consumer, pero no hay cifras que lo respalden aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sen-vre-asistente-qwen1.5b-lora | ~1,5B (base) + adaptador de 74 MB | No disponible | Dominio SEN Chile y pronostico renovable, en espanol | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct (modelo base) | ~1,5B | 32.768 tokens segun su ficha oficial | Proposito general, alineado con instrucciones | Apache 2.0 | HuggingFace, ampliamente usado |
| Llama 3.2 1B Instruct | ~1,24B | 128.000 tokens segun su ficha oficial | Proposito general, multilingue | Licencia comunitaria de Llama 3.2 | HuggingFace y ecosistema amplio |
| Gemma 2 2B Instruct | ~2,6B | 8.192 tokens segun su ficha oficial | Proposito general | Terminos de uso de Gemma | HuggingFace y ecosistema amplio |

La comparación relevante es contra el propio modelo base: el adaptador mejora la nota media del examen fijo de 2,58 a 4,83, pero sigue por debajo del umbral de aceptabilidad (7) en el 75 % de las preguntas. Las alternativas generalistas no están evaluadas en este dominio concreto, por lo que no existe una comparación directa de rendimiento disponible.

## Limitaciones y advertencias

- No usar para decisiones operacionales, regulatorias ni de inversión: la mayoría de las respuestas no alcanza el nivel aceptable según la propia evaluación del autor (aprobación del 25 % con un juez reconocidamente generoso).
- Alucinación documentada: inventa cifras y mecanismos con tono seguro y comete errores de redacción en español.
- No rechaza preguntas fuera de su dominio: responde igual, a veces con información inventada, lo que impide usarlo como asistente abierto sin filtros externos.
- El conocimiento procede de un LLM comercial y no fue verificado contra la normativa ni contra datos oficiales del Coordinador Eléctrico Nacional ni de la CNE.
- Sesgos: no documentados explícitamente; al derivarse de datos sintéticos de un único profesor LLM, hereda los sesgos y errores factuales de esa fuente. Dos de las diez respuestas auditadas del profesor tenían el tema mal asignado.
- Limitación de idioma: solo español; no se documenta comportamiento en otros idiomas ni en registro formal administrativo chileno.
- Volumen de datos muy reducido (60 pares): alta probabilidad de sobreajuste al estilo del profesor y escasa cobertura de preguntas fuera de la distribución del examen.
- Licencia: el adaptador es Apache 2.0, pero los datos de entrenamiento los generó un LLM comercial de OpenAI cuyos términos restringen usar sus salidas para desarrollar modelos que compitan con OpenAI. Revisar los términos vigentes antes de cualquier uso no educativo.
- El repositorio no publica los datos de entrenamiento, lo que limita la reproducibilidad y la auditoría independiente.
- Proyecto educativo con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/macarenacolomes/sen-vre-asistente-qwen1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
