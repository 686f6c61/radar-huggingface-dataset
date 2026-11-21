# nagohachi/Qwen3.5-2B-conlang-gym-v2-plural-past-with-dictionary

## Resumen

Qwen3.5-2B-conlang-gym-v2-plural-past-with-dictionary es un ajuste fino del modelo Qwen3.5-2B orientado a una tarea muy concreta: la documentación y traducción de lenguas artificiales (conlangs) generadas a partir de una semilla. Lo desarrolla el usuario nagohachi y se distribuye bajo licencia Apache 2.0. El modelo parte de un ajuste previo (v1-word-order-with-dictionary) y se entrena adicionalmente mediante aprendizaje por refuerzo agéntico con GRPO sobre la fase de plural y pasado del entorno conlang-gym.

La tarea simula el trabajo de un lingüista de campo: el modelo debe interrogar a un informante sobre una lengua desconocida con un presupuesto limitado de 6 preguntas, deducir el orden de palabras, los afijos de plural y de pasado, y después traducir 8 significados no vistos. Cada episodio incluye un diccionario de raíces, de modo que el reto es inferir la gramática (no el vocabulario) y aplicarla correctamente.

Es relevante como ejemplo de entrenamiento con RL agéntico sobre un modelo pequeño (2.213 millones de parámetros) para tareas de razonamiento estructurado, exploración con presupuesto y generalización a lenguas generadas de forma aleatoria. No obstante, es un modelo de nicho, sin descargas ni validación externa en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), pipeline image-text-to-text; detalles internos no disponibles |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cabe esperar compatibilidad con cuantizaciones estándar de transformers, pero no se confirma) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, un transformer de la familia Qwen3.5 con 2.213 millones de parámetros. El pipeline declarado es image-text-to-text, aunque la tarea descrita en la model card es puramente textual (razonamiento lingüístico y generación de texto estructurado). El ajuste se realiza en dos etapas encadenadas: primero un entrenamiento supervisado o de instrucciones (v1-word-order-with-dictionary), y después un entrenamiento con aprendizaje por refuerzo agéntico mediante GRPO sobre la fase v2 (plural y pasado).

Los datos de entrenamiento no son un corpus fijo, sino episodios generados por el entorno conlang-gym. Cada episodio genera una lengua artificial a partir de una semilla, con variación en el orden de palabras (SOV, SVO, VSO, OSV, OVS, VOS), en si el plural es prefijo o sufijo del nombre, en si el pasado es prefijo o sufijo del verbo, y en el vocabulario (raíces de dos sílabas consonante-vocal y afijos de una sílaba). El modelo interactúa con un informante simulado mediante acciones `<action>ask(...)</action>` y `<action>done</action>`, con un presupuesto de 6 preguntas (cada acción inválida también consume una). La recompensa es la fracción de ítems de test traducidos exactamente tras normalización, excluyendo los significados ya consultados. No se especifican el número de tokens de entrenamiento, la composición del dataset ni detalles de RLHF/DPO más allá del uso de GRPO.

## Capacidades

- Razonamiento lingüístico estructurado: inferencia de orden de palabras y de afijos (plural y pasado) a partir de ejemplos limitados.
- Formulación de preguntas estratégicas: selección de consultas al informante para maximizar la información obtenida con un presupuesto de 6 acciones.
- Traducción a lenguas artificiales no vistas: generación de oraciones con formato exacto (minúsculas, palabras separadas por espacios, sin puntuación).
- Seguimiento de formato estricto: salidas etiquetadas `<action>...</action>` y `<answer id="N">...</answer>`.
- Manejo de errores del entorno: interpretación de mensajes `Error: format error`, `Error: out of range` y `Error: type error`.
- Razonamiento multi-paso dentro de un episodio: acumulación de evidencia a lo largo de turnos conversacionales.
- Capacidades multilingües: limitadas al inglés como idioma de instrucciones; no se declaran otros idiomas.
- Tool calling / function calling genérico: no disponible como capacidad general; el modelo usa un protocolo de acciones específico del entorno.
- Visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo agéntico: servir como banco de pruebas reproducible para estudiar cómo un modelo de 2B aprende exploración con presupuesto limitado y generaliza a gramáticas generadas aleatoriamente.
- Evaluación de razonamiento inductivo: medir la capacidad de inducir reglas gramaticales (orden, afijos) a partir de pocos ejemplos, un proxy útil para tareas de inferencia de reglas en dominios estructurados.
- Generación de material didáctico lingüístico: usar el modelo para producir paradigmas y ejemplos de lenguas artificiales con fines de enseñanza o divulgación, dado que maneja vocabulario y morfología de forma controlada.
- Simulación de trabajo de campo: integrar el modelo en entornos que simulan elicitación lingüística para entrenar a estudiantes o evaluar asistentes de documentación de lenguas.
- Benchmark de robustez de formato: emplear el modelo como caso de prueba en pipelines que exigen salidas etiquetadas y tolerancia a errores del entorno, útil para validar parsers y orquestadores de agentes.
- Estudio de dinámicas de recompensa escasa: analizar cómo GRPO con recompensa exacta (coincidencia tras normalización) afecta a la exploración y a la calidad de las preguntas en modelos pequeños.
- Prototipado de asistentes de traducción restringida: experimentar con traducción a vocabularios cerrados y gramáticas simples, aunque no se recomienda para producción sin validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.213 millones de parámetros, en fp16 se requieren aproximadamente 4,4 GB solo para pesos; en fp32, unos 8,9 GB. Con cuantización de 8 bits, alrededor de 2,2 GB; con 4 bits, alrededor de 1,1 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4070). Para mayor throughput, A100, H100 o L40S.
- ¿Cabe en GPU de consumo? Sí, en fp16 cabe en GPUs de consumo con 8 GB o más; en cuantización de 4 bits cabría en GPUs con 4 GB.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados por el autor, aunque son compatibles en principio con pesos safetensors de un transformer estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-conlang-gym-v2-plural-past-with-dictionary | 2.213 M | no disponible | Conlangs: plural y pasado con diccionario | apache-2.0 | Hugging Face, 0 descargas |
| nagohachi/Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary | no disponible (modelo base) | no disponible | Conlangs: orden de palabras con diccionario | apache-2.0 (presumible) | Hugging Face |
| Qwen3.5-2B (base) | no disponible | no disponible | Propósito general | apache-2.0 | Hugging Face |

No se han identificado en la información disponible otros modelos comparables de la misma categoría (ajuste fino para tareas de conlangs con RL agéntico).

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente para la tarea conlang-gym; su rendimiento fuera de ese dominio no está validado y probablemente sea limitado.
- Sin evidencia de uso: 0 descargas y 0 likes en el momento de redactar la ficha; no hay validación externa ni reportes de terceros.
- Idiomas: solo se declara inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: en tareas de traducción a lenguas artificiales, el modelo puede generar formas plausibles pero incorrectas, especialmente si agota el presupuesto de preguntas o comete errores de formato.
- Dependencia del formato: el modelo espera un protocolo muy específico (`<action>`, `<answer>`); desviaciones del formato pueden degradar el rendimiento.
- Presupuesto limitado: solo 6 preguntas por episodio; las acciones inválidas consumen presupuesto, lo que puede penalizar a usuarios que no respeten el esquema.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-2B; conviene revisar la licencia del modelo base.
- Sin datos de contexto: se desconoce la longitud máxima de contexto, lo que limita la planificación en producción.
- Arquitectura declarada como image-text-to-text: aunque la tarea es textual, el pipeline puede inducir a confusión sobre capacidades multimodales reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Qwen3.5-2B-conlang-gym-v2-plural-past-with-dictionary
- Modelo base (v1): https://huggingface.co/nagohachi/Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Paper, blog, repositorio o demo del entorno conlang-gym: no disponible en la información proporcionada.
