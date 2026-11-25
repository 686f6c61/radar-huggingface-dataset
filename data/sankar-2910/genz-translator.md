# Sankar-2910/genz-translator

## Resumen

GenZ Translator es un modelo de lenguaje de tipo decoder-only con arquitectura estilo Llama, desarrollado por el usuario Sankar-2910 y publicado en Hugging Face bajo licencia Apache 2.0. Con 29.653.568 parámetros, 7 capas y una ventana de contexto de solo 384 tokens, está diseñado para una única tarea: traducir jerga y abreviaturas de la generación Z (por ejemplo, `WYD`, `tbh`, `omw`) a inglés estándar claro, preservando el significado, la emoción y el contexto original.

El modelo emplea un tokenizador BPE a nivel de byte personalizado con un vocabulario de 8.000 tokens y utiliza pesos de embedding de entrada y de la cabeza de salida separados (`tie_word_embeddings=False`). Su reducido tamaño lo hace apto para inferencia local e incluso en dispositivos móviles, según la propia model card. La versión 2.0 incorpora una etapa de fine-tuning continuado orientada a mejorar la interpretación de abreviaturas comunes y preguntas sobre el significado de expresiones.

Su relevancia actual radica en la especialización: frente a modelos generalistas de gran tamaño, este modelo aborda un nicho concreto (normalización de lenguaje informal en redes sociales) con un coste computacional mínimo. No obstante, no es un asistente de propósito general y sus propias métricas muestran limitaciones notables en exactitud estricta sobre datos no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parametros totales | 29.653.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

| Parametro adicional | Valor |
|---|---|
| Capas | 7 |
| Tamano oculto | 448 |
| Cabezas de atencion | 7 |
| Cabezas KV | 7 |
| Tamano intermedio | 1.792 |
| Vocabulario | 8.000 |
| Tokenizador | BPE a nivel de byte personalizado |
| Framework | PyTorch / Transformers |
| Tarea prevista | traduccion de jerga en un solo turno |
| Tamano del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con 7 capas, dimensión oculta de 448, 7 cabezas de atención (con 7 cabezas KV, es decir, sin agrupación de consultas) y dimensión intermedia de 1.792. Usa un tokenizador BPE a nivel de byte propio con 8.000 tokens y no comparte pesos entre los embeddings de entrada y la cabeza de salida. La ventana de contexto es de 384 tokens, suficiente para mensajes cortos y publicaciones de redes sociales, pero insuficiente para conversaciones largas o documentos.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que la versión 2.0 se obtuvo mediante una etapa de fine-tuning continuado sobre ejemplos curados, con el objetivo de mejorar el manejo de abreviaturas comunes y las respuestas a preguntas sobre el significado de expresiones. Durante esa etapa se reportan pérdidas de validación: la pérdida de validación general pasó de 0,5268 a 0,5241, la de validación curada de 1,3334 a 0,2168 y la combinada de 0,9301 a 0,3704, sobre un conjunto curado de 82 ejemplos. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de abreviaturas comunes de internet (`WYD`, `tbh`, `omw`, `ty`, `np`) a inglés estándar.
- Reescritura de mensajes informales en inglés conversacional claro.
- Interpretación de expresiones de la generación Z y respuesta a preguntas sobre su significado.
- Procesamiento de pies de foto y mensajes cortos de redes sociales.
- Traducción de párrafos breves dentro del límite de 384 tokens.
- Generación de texto de un solo turno; no está diseñado para conversación multi-turno.
- No soporta tool calling ni function calling (no documentado).
- No soporta razonamiento multi-paso ni agentes.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Moderación y normalización de contenido en redes sociales: el modelo puede convertir mensajes con jerga en texto estándar para facilitar su análisis por sistemas de moderación o clasificación posteriores, aprovechando su bajo coste de inferencia.
- Accesibilidad para audiencias no familiarizadas con la jerga: integración en clientes de mensajería que reescriban mensajes informales a inglés claro para usuarios mayores o no nativos, gracias a su reducido tamaño y latencia baja (4,7 ms por prompt con lote de 32 según la model card).
- Enriquecimiento de datasets: normalización masiva de corpus de redes sociales antes de usarlos en entrenamiento o análisis, dado que el modelo es ligero y puede ejecutarse en CPU o GPU de gama baja.
- Asistencia a equipos de atención al cliente: interpretación de mensajes de usuarios jóvenes que emplean abreviaturas, ayudando a los agentes a comprender la intención del mensaje.
- Investigación lingüística sobre evolución de la jerga: herramienta de apoyo para estudiar cómo se transforman expresiones informales en inglés estándar, con la cautela de sus limitaciones en exactitud.
- Inferencia en dispositivos móviles o edge: la model card muestra una demo en un móvil con 4 GB de RAM y latencia inferior a 50 ms, lo que permite integrarlo en aplicaciones locales sin conexión.
- Prototipado educativo: ejemplo práctico de fine-tuning de un modelo pequeño para una tarea concreta, útil en cursos de NLP.

## Benchmarks y rendimiento

Resultados del benchmark artesanal (tasa de aprobación por categoría, v1 frente a v2):

| Categoria | Ejemplos | v1 | v2 |
|---|---:|---:|---:|
| Abreviaturas | 39 | 82% | 100% |
| Abreviaturas contextuales | 16 | 88% | 94% |
| Preguntas de significado | 11 | 27% | 100% |
| Desbordamiento | 1 | 100% | 100% |
| Parrafos | 5 | 100% | 100% |
| Passthrough | 8 | 75% | 75% |
| Polaridad | 10 | 90% | 90% |
| Preservacion de significado | 7 | 57% | 71% |
| Robustez | 37 | 86% | 92% |
| Jerga | 34 | 91% | 88% |
| **Total categorias puntuadas** | — | **80,2%** | **92,4%** |

Resultados sobre el conjunto de datos reservado (held-out):

| Metrica | v1 | v2 |
|---|---:|---:|
| Exact match | 15,2% | 14,5% |
| Token F1 | 0,701 | 0,699 |
| Salidas terminadas en EOS | 100% | 100% |
| Jerga restante en la salida | 0,0% | 0,1% |
| Salidas con estilo de definicion | 0,1% | 0,0% |
| Latencia, lote de 32 | 4,1 ms/prompt | 4,7 ms/prompt |

La propia model card advierte de que el benchmark artesanal mide reglas específicas por categoría y no debe interpretarse como una precisión universal de traducción, y que el exact match es estricto: una traducción válida puede marcarse como incorrecta si difiere en la formulación de la referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (29,65 M de parámetros); con cuantización de 8 bits o 4 bits, unas decenas de MB.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo es sobredimensionado para estas últimas.
- Cabe en cualquier GPU de consumo e incluso en CPU; la model card documenta ejecución en un móvil con 4 GB de RAM.
- Opciones de despliegue: Transformers (PyTorch), text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles; no se documenta soporte explícito de llama.cpp, Ollama o TGI más allá de la etiqueta.
- Latencia: 4,7 ms por prompt con lote de 32 según la model card en el conjunto de evaluación; menos de 50 ms en la demo móvil.
- Throughput: no disponible de forma agregada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---:|---:|---|---|
| GenZ Translator (Sankar-2910) | 29,65 M | 384 | Apache 2.0 | Traduccion de jerga Gen Z |
| TinyLlama 1.1B | 1.100 M | 2.048 | Apache 2.0 | Proposito general compacto |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Proposito general compacto |
| Qwen2.5-0.5B | 500 M | 32.768 | Apache 2.0 | Proposito general multilingue |

No se dispone de datos de benchmarks comparativos directos entre este modelo y las alternativas citadas en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No es un asistente de propósito general: no está diseñado para conversación, razonamiento matemático, generación de código ni recuperación de conocimiento.
- Ventana de contexto muy reducida (384 tokens), lo que impide conversaciones multi-turno o documentos largos.
- Exact match bajo sobre datos reservados (14,5% en v2), lo que indica que las traducciones pueden diferir sustancialmente de una referencia esperada.
- Dificultades documentadas con ortografías inusuales, caracteres repetidos, texto mezclado con otros idiomas, URL y preservación de todos los detalles de la entrada.
- La mejora del benchmark artesanal no se refleja en el conjunto reservado, según reconoce la propia model card.
- Riesgo de alucinación en preguntas sobre significados no vistos durante el entrenamiento.
- Sesgos potenciales derivados de los datos de jerga utilizados, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero la escasa validación en producción exige evaluación propia antes de desplegarlo.
- Solo inglés; no se documenta soporte de otros idiomas ni de variantes regionales.
- El conjunto de validación curado tiene solo 82 ejemplos, por lo que las métricas de pérdida deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sankar-2910/genz-translator
- Paper de referencia de la arquitectura Llama: https://arxiv.org/abs/2302.13971
- Demo en vídeo (incluida en el repositorio): https://huggingface.co/Sankar-2910/genz-translator/resolve/main/vid.mp4
- Tarjeta de especificaciones visual: https://huggingface.co/Sankar-2910/genz-translator/resolve/main/genz-spec-card.png
- Comparativa de benchmarks v1 frente a v2: https://huggingface.co/Sankar-2910/genz-translator/resolve/main/genz-benchmark.png
