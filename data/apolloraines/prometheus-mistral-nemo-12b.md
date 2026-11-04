# ApolloRaines/Prometheus-Mistral-Nemo-12B

## Resumen

Prometheus-Mistral-Nemo-12B es un ajuste fino del modelo Mistral-Nemo-Instruct-2407 (12.247.782.400 parámetros) publicado por el usuario ApolloRaines bajo el paraguas de "Project Prometheus". El autor lo presenta como el resultado de un proceso de auto-mejora autónoma: el propio modelo se evalúa, identifica sus áreas de comportamiento más débiles, propone modificaciones y las aplica directamente sobre los pesos mediante una herramienta llamada jBlaze. Cada modificación se valida contra un conjunto de pruebas funcionales y solo se conserva si supera esa barrera.

El objetivo declarado no es ampliar capacidades cognitivas nuevas, sino corregir la brecha entre lo que el modelo *puede* razonar y lo que *razona por defecto*. Las modificaciones se centran en disciplina epistémica: comprobar supuestos propios, señalar incertidumbre, detectar encuadres adversariales y considerar alternativas antes de fijar una respuesta. El caso emblemático que el autor cita es el test del bate y la pelota, que la versión anterior (v3) fallaba dando la respuesta intuitiva (0,10 dólares) y que esta versión resuelve correctamente (0,05 dólares).

Es relevante ahora como artefacto de investigación sobre "weight surgery" y auto-mejora sin intervención humana en la selección de cambios, no como modelo de producción. La model card es explícita en que se trata de un experimento: el propio autor documenta que la v3 fracasó por validar solo la mecánica del cambio y no su efecto real, y que esta iteración añade puertas de validación funcional. No hay paper asociado ni evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-Nemo-Instruct-2407) |
| Parámetros totales | 12.247.782.400 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base; no confirmada en la model card) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-Nemo-Instruct-2407 |
| Tamaño del repositorio | 24,5 GB |
| Descargas | 117 |
| Likes | 1 |
| Fecha de creación | 2026-09-09 |
| Última actualización | 2026-11-04 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Mistral-Nemo-Instruct-2407, un transformer decoder-only denso de 12,2 mil millones de parámetros. Prometheus no modifica la topología: no hay cambio de número de capas, de atención ni de dimensionalidad. El autor menciona "40 capas transformer" en la visualización 3D de las modificaciones, lo que es coherente con la estructura del base, aunque la model card no detalla la configuración interna completa (cabezas de atención, dimensión oculta, tipo de atención).

El entrenamiento no sigue el esquema habitual de ajuste supervisado o RLHF. Según la model card, el proceso es iterativo y autónomo en seis fases: (1) auto-evaluación del modelo en categorías de comportamiento (profundidad de razonamiento, manejo de incertidumbre, resistencia a alucinación, robustez adversarial, honestidad epistémica); (2) escritura de resultados y estrategias fallidas en una memoria determinista persistente; (3) planificación, seleccionando la estrategia para la debilidad detectada y evitando repetir estrategias ya fallidas; (4) aplicación del cambio sobre una copia clonada de los pesos mediante jBlaze; (5) validación del clon contra pruebas funcionales de razonamiento multi-paso, preguntas trampa y controles de calidad; (6) promoción del clon si supera la barrera o rechazo y registro del resultado en memoria.

La innovación declarada es precisamente esa barrera de validación funcional, ausente en la v3. No se especifican volúmenes de datos de entrenamiento, composición del dataset, ni si hubo DPO o RLHF convencional; el mecanismo es modificación directa de pesos guiada por evaluación automática, no entrenamiento con gradientes sobre un corpus descrito. Tampoco se documenta el número de iteraciones realizadas ni cuántas modificaciones fueron aceptadas frente a rechazadas.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con `apply_chat_template` de Transformers.
- Razonamiento multi-paso con mayor tendencia a verificar supuestos y a no fijar la primera respuesta que encaja por patrón.
- Etiquetado explícito de especulación frente a hechos establecidos: el modelo distingue cuándo especula y cuándo afirma.
- Conciencia de incertidumbre: declara desconocimiento en lugar de responder con falsa confianza.
- Detección de encuadres adversariales, preguntas trampa y afirmaciones no sustentadas.
- Autocorrección durante la respuesta: revisa su propio razonamiento a mitad de generación en lugar de comprometerse con una ruta errónea.
- Resolución de variantes del test de reflexión cognitiva (CRT): el autor reporta acierto en variantes nuevas no vistas durante la validación (2,20/2,00; 3,30/3,00; nombres de objetos distintos).
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso autónomo en producción: no documentadas como tales; el "modo agente" descrito es interno al proceso de auto-mejora, no una capacidad de inferencia expuesta.
- Visión, audio o modo thinking explícito: no disponibles.
- Multilingüismo: limitado al inglés según la model card.

## Casos de uso

- Investigación sobre auto-mejora de modelos: replicar o auditar el bucle evaluación-planificación-cirugía-validación con jBlaze para estudiar si las modificaciones de pesos guiadas por benchmarks funcionales producen mejoras generalizables o solo cambios de estilo. El modelo sirve como artefacto de partida y como caso documentado de fracaso (v3) y corrección (esta versión).
- Evaluación de robustez adversarial en pipelines de QA: usar el modelo como sujeto de pruebas con baterías de preguntas trampa, paradojas de probabilidad y ataques de encuadre, comparando su tasa de acierto con la del Mistral-Nemo original para medir el efecto real de la cirugía de pesos.
- Generación de respuestas con calibración de incertidumbre: en asistentes técnicos internos donde el coste de una afirmación errónea es alto, el etiquetado explícito de especulación permite filtrar o marcar respuestas de baja confianza antes de mostrarlas.
- Docencia y divulgación sobre sesgos cognitivos: el modelo resuelve el test del bate y la pelota y sus variantes, lo que permite usarlo como demostración interactiva de razonamiento reflexivo frente a respuesta intuitiva.
- Comparación controlada de técnicas de ajuste: al compartir base exacta con Mistral-Nemo-Instruct-2407, permite experimentos A/B sobre el mismo prompt y la misma tokenización para aislar el efecto de la modificación de pesos frente a un fine-tuning convencional.
- Prototipado de detección de encuadres engañosos: en herramientas de moderación o revisión de contenido, el modelo puede señalar afirmaciones no sustentadas o preguntas con premisas falsas, siempre con revisión humana posterior dado el tamaño reducido de la batería de validación del autor.

## Benchmarks y rendimiento

El único dato publicado en la información disponible es la batería de 50 preguntas trampa adversariales (variantes CRT, trampas de sesgo cognitivo, puzles lógicos, trampas matemáticas, paradojas de probabilidad y ataques de encuadre):

| Modelo | Aciertos | Porcentaje | Bucles |
|---|---:|---:|---:|
| Mistral-Nemo original | 44/50 | 88% | 0 |
| Prometheus-Mistral-Nemo-12B | 43/50 | 86% | 0 |

El autor indica que los fallos restantes son compartidos con el modelo base (paradojas de probabilidad y trampas de anclaje) y que no se introdujeron regresiones nuevas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La afirmación de que la calidad en respuestas largas es "indistinguible" del original es cualitativa y no está respaldada por métricas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 24,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere GPUs de 40 GB o más (A100 40GB, A100 80GB, H100) para contexto largo.
- Cuantización a 8 bits: en torno a 12-13 GB de pesos, viable en RTX 4090 (24 GB) y A6000 (48 GB) con margen para contexto moderado.
- Cuantización a 4 bits: en torno a 6-7 GB de pesos, cabe en RTX 3090, RTX 4090, RTX 4080 y GPUs consumer de 12 GB o más, con degradación de calidad no evaluada por el autor.
- Los tipos de cuantización concretos disponibles no están documentados en la información proporcionada; el repositorio publica únicamente safetensors, por lo que habría que generar GGUF/AWQ/GPTQ por cuenta propia.
- Opciones de despliegue: Transformers (uso documentado en la model card con `AutoModelForCausalLM`); vLLM, llama.cpp, Ollama y TGI son compatibles a nivel de arquitectura por herencia del base, pero no hay confirmación ni receta publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Prometheus-Mistral-Nemo-12B | 12,2 B (denso) | No disponible | Apache 2.0 | Cirugía de pesos autónoma sobre Mistral-Nemo | HuggingFace, 117 descargas |
| Mistral-Nemo-Instruct-2407 | 12,2 B (denso) | No disponible en esta ficha | Apache 2.0 | Instrucción estándar de Mistral AI | HuggingFace, ampliamente adoptado |
| Mistral-Nemo-Base-2407 | 12,2 B (denso) | No disponible en esta ficha | Apache 2.0 | Modelo base sin instrucción | HuggingFace |

La comparación relevante es contra su propio base: mismo tamaño, misma licencia y misma tokenización, con la diferencia de las modificaciones de pesos y el proceso de validación funcional. Frente a otros modelos de 12 B de la misma categoría (por ejemplo, variantes de Llama 3.1 8B o Qwen2.5 14B), no hay datos de benchmarks en la información disponible que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La evaluación se limita a 50 preguntas trampa y a un conjunto no especificado de pruebas de calidad; no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad. El tamaño muestral es insuficiente para conclusiones robustas.
- El modelo obtiene 43/50 frente a 44/50 del original en la propia batería del autor: ligeramente peor en el agregado, aunque el autor lo atribuye a fallos compartidos. La mejora declarada se apoya en casos cualitativos (test del bate y la pelota), no en una ventaja agregada medida.
- El proceso de auto-mejora no tiene supervisión humana en la selección de cambios; el autor lo presenta como virtud, pero implica que los criterios de aceptación son los que el propio sistema define. No hay auditoría externa del bucle.
- Riesgo de alucinación: el autor afirma mejoras en etiquetado de especulación, pero no hay métricas de tasa de alucinación ni evaluación con datasets de factualidad.
- Idiomas: solo inglés declarado. Uso en castellano no está soportado ni evaluado.
- Longitud de contexto: no confirmada en la model card; no asumir la del base sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación con evaluación mínima, no se recomienda desplegarlo en producción sin validación propia y sin comparación contra el Mistral-Nemo original en las tareas objetivo.
- El repositorio tiene 117 descargas y 1 like: adopción prácticamente nula, sin issues ni discusión comunitaria que permita contrastar el comportamiento reportado.
- La model card incluye una visualización 3D de las modificaciones por capa, pero el contenido del iframe está truncado en la información disponible; no se puede verificar qué capas fueron modificadas ni en qué magnitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Prometheus-Mistral-Nemo-12B
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Herramienta jBlaze citada por el autor: https://jblaze.dev
- Paper, blog o repositorio de Project Prometheus: no disponible en la información proporcionada.
- Demo o espacio interactivo: no disponible en la información proporcionada.
