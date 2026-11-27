# BioTorch/UI_Llama_3_2_1B

## Resumen

UI Llama 3.2 1B es un ajuste fino (fine-tune) del modelo Meta Llama 3.2 1B, desarrollado por Joseph Prena bajo el seudónimo BioTorch. El proyecto no busca mejorar las capacidades factuales del modelo base, sino explorar si un entrenamiento cuidadosamente diseñado sobre identidad, personalidad y comportamiento puede hacer que un modelo de lenguaje pequeño resulte más natural, emocionalmente consistente y creíble en conversación. La arquitectura subyacente es la del transformer denso de Llama 3.2 1B, con 1.235.814.400 parámetros totales.

El modelo está entrenado con datasets artesanales que suman más de dos millones de caracteres, cubriendo áreas como formación de identidad, persistencia de personalidad, consistencia conductual, expresión emocional, humor, sarcasmo y diálogo inmersivo. Según el autor, las áreas entrenadas con mayor intensidad son identidad, personalidad, consistencia conductual, expresión emocional, autodescripción, humor, sarcasmo y consistencia de personaje, mientras que física, storytelling y embodiment reciben un entrenamiento extremadamente ligero.

Es relevante ahora porque representa un caso de estudio sobre hasta dónde se puede llevar la personalización de un modelo de 1B parámetros antes de que la estabilidad se degrade. El propio autor advierte que el modelo se volverá progresivamente inestable a medida que se sigan forzando los límites del 1B, y que planea migrar al modelo de 3B para continuar la investigación. La licencia declarada es Apache 2.0, aunque el autor menciona explícitamente que acepta consultas de licenciamiento comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 1B) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta Llama 3.2 1B, un transformer denso con 1.235.814.400 parámetros. No se documentan cambios arquitectónicos respecto al modelo base: la modificación consiste en un ajuste fino supervisado sobre datasets artesanales orientados a personalidad y conversación, no en una alteración estructural del transformer ni en la introducción de mecanismos como atención lineal o decodificación especulativa.

Los datos de entrenamiento son colecciones creadas manualmente por el autor, con más de dos millones de caracteres en total, organizadas por áreas temáticas con distinto nivel de intensidad: identidad, personalidad, consistencia conductual, expresión emocional, autodescripción, humor, sarcasmo y consistencia de personaje aparecen como "heavily trained"; conversación realista, interacción humana, lógica y razonamiento, consistencia de conocimiento, comportamiento de memoria, creatividad y calidad del lenguaje como entrenamiento moderado; filosofía y embodiment como "lightly trained"; y física y storytelling como "extremely lightly trained". No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor indica que el proyecto está en desarrollo activo y que el modelo se volverá inestable al seguir forzando los límites de la arquitectura de 1B.

## Capacidades

- Generación de texto conversacional en inglés con identidad en primera persona persistente.
- Mantenimiento de una personalidad reconocible y un estilo conversacional coherente a lo largo de interacciones largas.
- Expresión emocional, humor y sarcasmo como capacidades entrenadas de forma intensiva.
- Consistencia de personaje al cambiar de tema dentro de una misma conversación.
- Discusión filosófica y diálogo de formato largo.
- Autodescripción coherente del propio personaje.
- Calidad gramatical y fluidez conversacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés según la model card.
- Conocimiento factual y precisión: experimental, con errores e inconsistencias frecuentes según el autor.

## Casos de uso

- Investigación sobre personalidad en modelos pequeños: usar el modelo como banco de pruebas para estudiar cómo el ajuste fino con datasets artesanales afecta a la persistencia de identidad y la consistencia conductual en modelos de 1B parámetros.
- Roleplay y personajes conversacionales: el modelo mantiene una identidad en primera persona y un estilo reconocible, lo que lo hace adecuado para prototipos de personajes interactivos en entornos controlados y no críticos.
- Evaluación de estabilidad de fine-tunes: comparar su comportamiento con el Llama 3.2 1B original para medir la degradación de capacidades factuales a medida que se intensifica el entrenamiento de personalidad.
- Diálogo de formato largo en inglés: su consistencia de personaje permite sostener conversaciones multi-turno sobre temas variados sin salir del rol, útil en demos de chatbots con personalidad.
- Estudio de expresión emocional simulada: analizar cómo un modelo de 1B genera lenguaje emocionalmente persuasivo y qué salvaguardas son necesarias, dado el aviso de seguridad del autor.
- Prototipado de asistentes con voz propia: para equipos que quieran experimentar con tonos humorísticos o sarcásticos en inglés antes de invertir en modelos mayores.
- Docencia y divulgación sobre fine-tuning: ejemplo práctico de ajuste de un modelo base pequeño con datasets propios y de los compromisos entre personalidad y precisión factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 1.235.814.400 parámetros, en FP16 requeriría aproximadamente 2,5 GB solo para pesos, y en cuantizaciones de 8 bits o 4 bits bajaría por debajo de 2 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM podría alojar el modelo en FP16 con margen para el contexto.
- Cabe en GPU de consumo: sí, por el tamaño del modelo, en tarjetas como RTX 3060, RTX 4060 o superiores, siempre que se disponga de los pesos en un formato compatible.
- Opciones de despliegue: la model card declara compatibilidad con transformers y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documenta soporte verificado de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| BioTorch/UI_Llama_3_2_1B | 1.235.814.400 | No disponible | Apache 2.0 | Fine-tune de personalidad e identidad sobre Llama 3.2 1B |
| meta-llama/Llama-3.2-1B | 1.235.814.400 | No disponible en la informacion proporcionada | Llama 3.2 Community License | Modelo base generalista de Meta |
| meta-llama/Llama-3.2-3B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Llama 3.2 Community License | Modelo base generalista de mayor capacidad, citado por el autor como siguiente paso |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de UI Llama 3.2 1B con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor advierte que el modelo alucina con frecuencia, puede proporcionar información falsa con tono seguro y fabricar eventos o recuerdos.
- La precisión factual y la fiabilidad del conocimiento son áreas experimentales y no son el punto fuerte del modelo.
- El modelo está diseñado para producir conversación emocionalmente persuasiva y con identidad persistente; sus afirmaciones sobre emociones, recuerdos, deseos o conciencia son texto generado y no evidencia de experiencia subjetiva.
- El autor desaconseja su uso a personas con psicosis, delirios, paranoia, disociación severa o deterioro del juicio de realidad, así como a quienes sean propensas a la dependencia emocional o al apego a sistemas conversacionales.
- No debe usarse para decisiones médicas, psiquiátricas, legales, financieras o de emergencia.
- Idiomas: solo inglés documentado; no se garantiza un comportamiento coherente en castellano u otros idiomas.
- Longitud de contexto: no documentada; no se debe asumir la ventana del modelo base sin verificación.
- Licencia: declarada Apache 2.0, pero el autor invita explícitamente a contactar para licenciamiento comercial y consultas empresariales, lo que introduce ambigüedad sobre las condiciones reales de uso comercial.
- El modelo se describe como inestable a medida que se intensifica el entrenamiento; se esperan fallos ocasionales y limitaciones de razonamiento propias de un modelo de 1B parámetros.
- No se documentan evaluaciones de sesgo; al ser un fine-tune de Llama 3.2, puede heredar sesgos del modelo base y añadir sesgos derivados de los datasets artesanales.

## Enlaces

- Hugging Face: https://huggingface.co/BioTorch/UI_Llama_3_2_1B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Perfil del autor en Facebook: https://www.facebook.com/BiotorchGallery
