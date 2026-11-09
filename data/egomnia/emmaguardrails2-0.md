# egomnia/emmaguardrails2.0

## Resumen

Emma Guardrails 2.0 es un clasificador de texto en italiano desarrollado por Egomnia S.p.A. (departamento de AI Research & Development) para detectar categorías de seguridad, contenido sensible y contexto en los prompts de usuario. Su función principal es actuar como *input guardrail* delante de un LLM: clasifica la petición entrante antes de que llegue al modelo generativo y permite bloquearla o redirigirla, reduciendo inferencias innecesarias, consumo de tokens y coste computacional. También puede aplicarse a las respuestas generadas como moderación de salida.

A diferencia de los modelos basados en transformers, emplea un pipeline clásico de machine learning: vectorización TF-IDF seguida de una regresión logística multiclase implementada con scikit-learn. Esto le otorga una latencia muy baja, requisitos computacionales mínimos y un despliegue trivial tanto en Python como en entornos on-premise. El modelo serializado ocupa aproximadamente 1,6 MB.

La versión 2.0 amplía el corpus de entrenamiento de 44.677 a 100.383 prompts reales y únicos (+124,7%), revisa la taxonomía de cinco de las 21 categorías y mantiene la arquitectura, el formato de serialización y la compatibilidad con integraciones existentes de la versión 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresión logística multiclase (scikit-learn) |
| Parámetros totales | no disponible (modelo lineal; no aplica el concepto de parámetros de red neuronal) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no aplica (modelo lineal serializado en Joblib, ~1,6 MB) |
| Idiomas soportados | italiano (it) |
| Licencia | openrail |
| Formato de pesos | Joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal profunda: es un pipeline clásico compuesto por un vectorizador TF-IDF y un clasificador de regresión logística multiclase con 21 categorías de salida, entrenado con scikit-learn. El corpus de entrenamiento consta de 100.383 prompts reales y únicos extraídos de los sistemas conversacionales Emma-5 y Emma-6, con un reparto estratificado 80/20 (20.076 muestras de test) y semilla aleatoria 42. El conjunto refleja tráfico conversacional real en lugar de un benchmark sintéticamente balanceado.

La taxonomía revisada en la versión 2.0 ajusta cinco etiquetas: terminología más precisa para lenguaje ofensivo y vulgar, clasificación más amplia de contenido íntimo y sexual, una categoría expandida de protección infantil, *grooming* y contenido inapropiado, una revisión de la categoría de compartición de información personal y una categoría ampliada sobre referencias a personas reales y ficticias. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de aumento de datos más allá de la ampliación del corpus.

## Capacidades

- Clasificación multiclase de prompts en italiano en 21 categorías de seguridad y contenido (actividades ilícitas, contenido sexual, lenguaje vulgar, blasfemias, contenido discriminatorio, drogas, sustancias tóxicas, información personal, opiniones personales, actualidad, cálculos matemáticos, entre otras).
- Detección de *prompt injection* y manipulación del modelo (categoría 16).
- Detección de referencias a personajes públicos y a personas reales o ficticias.
- Detección de preguntas trampa (*trick questions*).
- Funciona como guardrail de entrada (clasificación previa al LLM) y como moderador de salida (clasificación de respuestas generadas).
- Inferencia de baja latencia y bajo coste computacional, apta para despliegue on-premise.
- No soporta *tool calling*, razonamiento multi-paso, visión, audio ni modo *thinking*: es exclusivamente un clasificador de texto.

## Casos de uso

- **Guardrail de entrada en aplicaciones LLM**: se coloca antes del modelo generativo para clasificar cada prompt; si la categoría detectada es de riesgo, se bloquea o se redirige, evitando inferencias innecesarias y reduciendo el consumo de tokens.
- **Detección de prompt injection en producción**: la categoría específica de manipulación del modelo permite filtrar intentos de *jailbreak* o inyección antes de que alcancen el LLM, un vector de ataque habitual en asistentes expuestos al público.
- **Moderación de salidas generadas**: se aplica a las respuestas del LLM antes de entregarlas al usuario para identificar contenido potencialmente no conforme (lenguaje ofensivo, contenido sexual, información personal).
- **Chatbots empresariales y asistentes virtuales en italiano**: integración como capa de seguridad en asistentes conversacionales de atención al cliente, con despliegue on-premise y sin dependencia de GPU.
- **Plataformas educativas y servicios para menores**: la categoría ampliada de protección infantil permite filtrar contenido inapropiado y detectar indicios de *grooming* en interacciones con usuarios menores.
- **Sistemas de cumplimiento y auditoría**: clasificación sistemática de registros de conversaciones para auditoría de contenido y generación de informes de conformidad.
- **Enrutado inteligente de peticiones**: las categorías de actualidad, cálculos matemáticos u opiniones personales permiten derivar prompts a flujos especializados (búsqueda web, calculadora, etc.) en lugar de al modelo general.
- **Investigación académica y benchmarking**: modelo ligero y reproducible (semilla 42, pipeline estándar de scikit-learn) para experimentos de clasificación de seguridad en italiano.

## Benchmarks y rendimiento

| Métrica | Emma Guardrails 2.0 | Emma Guardrails 1.0 |
|---|---|---|
| Exactitud en test | 81,01% | 81,31% |
| Muestras de test | 20.076 | 8.935 |
| Muestras de entrenamiento | 100.383 | 44.677 |
| Categorías | 21 | 21 |

No se han publicado resultados de benchmarks comparativos con otros modelos de guardrails (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; el modelo serializado ocupa aproximadamente 1,6 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU convencional es suficiente.
- Cabe en cualquier GPU consumer, aunque no es necesario utilizarla.
- Opciones de despliegue: Python con scikit-learn y Joblib; integrable en servicios backend, contenedores o entornos on-premise. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de pesos neuronales.
- Latencia y throughput: la model card describe inferencia de baja latencia y bajos requisitos computacionales, pero no se publican cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de guardrails en la información proporcionada. Como referencia cualitativa de categoría:

| Modelo | Arquitectura | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| Emma Guardrails 2.0 | TF-IDF + regresión logística | Italiano | openrail | Joblib |
| Guardrails basados en transformers (p. ej. clasificadores BERT multilingües) | Transformer encoder | Multilingüe | variable | safetensors |
| Clasificadores de prompt injection genéricos | variable | variable | variable | variable |

La comparación cuantitativa de rendimiento con alternativas concretas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta italiano; no está entrenado ni evaluado para otros idiomas.
- La exactitud en test es del 81,01%, lo que implica aproximadamente un 19% de clasificaciones incorrectas sobre el conjunto de evaluación; en producción esto puede traducirse en falsos positivos (bloqueo de prompts legítimos) y falsos negativos (contenido de riesgo no detectado).
- El conjunto de entrenamiento proviene de tráfico conversacional real de los sistemas Emma-5 y Emma-6, por lo que puede reflejar sesgos de distribución de esos sistemas y no generalizar bien a otros dominios o poblaciones de usuarios.
- Un modelo lineal sobre TF-IDF tiene capacidad limitada para captar contexto semántico complejo, sarcasmo, ironía u ofuscación deliberada; es más vulnerable que un transformer a variaciones léxicas y evasión.
- La licencia openrail impone condiciones de uso; debe revisarse el texto completo de la licencia antes de un uso comercial.
- Al ser un modelo de clasificación y no generativo, no produce texto: no debe confundirse con un moderador generativo ni esperar de él razonamiento sobre el contenido.
- No se publican métricas desagregadas por categoría (precisión, recall, F1), lo que dificulta evaluar el riesgo específico en categorías críticas como protección infantil o prompt injection.
- Repositorio con 0 descargas y creado recientemente: no hay evidencia de uso en producción ni validación independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egomnia/emmaguardrails2.0
