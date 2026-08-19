# abhishekai/slm-125m-legal-sft-v2

## Resumen

El modelo `abhishekai/slm-125m-legal-sft-v2` es un pequeño modelo de lenguaje (SLM) de 125 millones de parámetros, desarrollado por el usuario `abhishekai`, que parte de una arquitectura Llama (transformer decoder-only) y ha sido ajustado mediante supervisión (SFT) a partir del modelo base `abhishekai/slm-125m-legal-base`. Su propósito es responder preguntas con base en pasajes legales y financieros suministrados en el prompt, es decir, realizar *grounded question answering* (QA fundamentada) para integrarse en pipelines de recuperación aumentada (RAG).

La versión v2 sustituye a la v1 con un dataset reconstruido (17.170 pares de entrenamiento frente a 9.096), balanceado por documento y con una partición de validación más difícil. Sin embargo, el propio autor reporta un resultado honesto: la mejora respecto a v1 no es estadísticamente significativa (diferencia de +0,09 con un intervalo de confianza del 95% que incluye el cero). Aun así, el modelo se publica porque es el checkpoint sobre el que se construye el resto del pipeline y porque documenta un resultado negativo medido correctamente.

Relevante para desarrolladores que buscan un modelo compacto, de bajo coste de inferencia, especializado en comprensión lectora de textos legales y financieros, con licencia Apache 2.0 y compatible con herramientas estándar de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama) |
| Parametros totales | 125.848.320 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama, un transformer decoder-only con normalización RMSNorm y atención con máscara causal. Con solo 125M de parámetros, es un modelo muy compacto pensado para tareas específicas de comprensión lectora.

El entrenamiento consistió en un ajuste supervisado (SFT) a partir del modelo base `slm-125m-legal-base`. El dataset se construyó generando pares de preguntas y respuestas con Gemini 2.5 Flash sobre un corpus legal y financiero, seguido de un filtrado mediante un auto-chequeo de grounding, deduplicación por embeddings, filtros de longitud y formato, balanceo por documento y decontaminación contra la partición de evaluación. En total se usaron 17.170 pares de entrenamiento.

Se configuraron 3 épocas, pero el entrenamiento se detuvo temprano en el paso 1.000 de 3.183, restaurando los mejores pesos. La pérdida de validación final fue 1,1415. El entrenamiento se realizó en una GPU H100 con un coste total de 0,58 dólares. No se aplicaron técnicas de RLHF ni DPO; el ajuste es puramente supervisado.

## Capacidades

- Generación de texto y respuesta a preguntas basadas en un pasaje suministrado (grounded QA).
- Comprensión lectora de pasajes legales y financieros, incluyendo contratos, cláusulas, opiniones judiciales y documentos regulatorios.
- Seguimiento de instrucciones en formato de chat con system prompt y contexto explícito.
- Rechazo apropiado cuando la pregunta no puede responderse a partir del pasaje proporcionado.
- Integración en pipelines de RAG: el modelo está diseñado para recibir el contexto recuperado y generar respuestas fundamentadas.
- Soporte de formato de chat mediante `tokenizer.apply_chat_template`.
- No soporta tool calling, ni razonamiento multi-paso avanzado, ni capacidades multimodales.

## Casos de uso

- **Asistente de consulta legal interna**: un despacho puede integrar este modelo en un sistema donde el usuario pega un fragmento de un contrato y pregunta por cláusulas específicas (por ejemplo, "¿Qué dice sobre la terminación anticipada?"). El modelo responde exclusivamente a partir del pasaje, reduciendo alucinaciones sobre el documento completo.
- **Extracción de cláusulas en due diligence**: en procesos de revisión de contratos, el modelo puede extraer condiciones relevantes (indemnización, confidencialidad, jurisdicción) de cada pasaje suministrado, agilizando la revisión manual.
- **Soporte a revisión de documentos financieros**: analistas pueden cargar extractos de informes anuales o estados financieros y preguntar por cifras o políticas concretas, siempre que el pasaje contenga la información.
- **Chatbot de atención al cliente para pólizas de seguros**: integrado en un sistema de RAG, el modelo puede responder preguntas frecuentes sobre coberturas y exclusiones a partir de los textos de las pólizas, con un coste de inferencia mínimo.
- **Sistema de RAG sobre jurisprudencia**: en una herramienta de búsqueda legal, el modelo recibe pasajes de sentencias y responde preguntas sobre los hechos, la ratio decidendi o los fundamentos, ayudando a abogados a localizar precedentes.
- **Herramienta educativa para estudiantes de derecho**: permite practicar comprensión de textos legales haciendo preguntas sobre fragmentos de leyes o casos, con respuestas fundamentadas en el pasaje.
- **Prototipado rápido de asistentes legales**: gracias a su pequeño tamaño, puede desplegarse en entornos con recursos limitados para validar flujos de RAG antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como CaseHOLD, LexGLUE, MMLU o HumanEval) en la información disponible. El autor solo reporta una evaluación interna con un juez independiente (Claude Sonnet) sobre 300 prompts held-out, con una puntuación media de 4,13 sobre 10. La comparación con la versión anterior es la siguiente:

| Modelo | Puntuación (sobre 10) |
|---|---|
| v1 SFT | 4,05 |
| v2 SFT | 4,13 |

La diferencia de +0,09 no es estadísticamente significativa (intervalo de confianza del 95%: −0,22 a +0,39). Además, se observa que aproximadamente el 4,3% de las salidas degeneran en repetición, lo que limita el rendimiento real en generación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 125M de parámetros, el modelo ocupa aproximadamente 500 MB en fp32, unos 250 MB en int8 y unos 125 MB en int4. Cabe en cualquier GPU consumer moderna (incluso en GPUs integradas con al menos 1 GB de VRAM).
- **GPUs recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso Apple Silicon con Metal.
- **Despliegue en CPU**: es viable en CPU, con latencias de decodificación del orden de decenas de milisegundos por token.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, Hugging Face TGI y cualquier framework que soporte modelos de transformers. Al ser un modelo pequeño, también puede ejecutarse en entornos serverless.
- **Latencia y throughput**: no hay mediciones oficiales, pero por tamaño se espera un throughput alto (cientos de tokens por segundo en GPU) y una latencia inferior a 100 ms por respuesta corta.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables de la misma categoría (SLM legales de ~125M) en la documentación proporcionada. El autor no ha publicado comparativas con otras alternativas. Se puede considerar como referencia el propio modelo base `slm-125m-legal-base` y la versión v1, pero no hay datos externos para una comparación objetiva.

## Limitaciones y advertencias

- **Dependencia total del contexto**: el modelo solo responde a partir del pasaje suministrado. Si se elimina el contexto, confabula respuestas fluidas pero sin fundamento. No debe usarse como modelo de conocimiento general.
- **Degeneración en repetición**: aproximadamente el 4,3% de las salidas caen en bucles de repetición, lo que puede degradar la calidad en producción.
- **Falta de fiabilidad aritmética**: no es capaz de realizar cálculos consistentes; puede afirmar cifras y porcentajes que no se derivan de los datos.
- **Invención de citas**: reproduce el registro de opiniones judiciales de forma convincente, pero puede inventar nombres de casos y holdings que parecen plausibles.
- **No es asesoramiento legal o financiero**: el modelo es una demostración de método, no una herramienta profesional certificada.
- **Evaluación limitada**: un solo juez, un único conjunto de evaluación con n=300, y sin benchmarks estándar. Los resultados solo indican comparación con su propia versión anterior, no calidad absoluta.
- **Idioma**: solo soporta inglés. No hay capacidades multilingües.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las respuestas.

## Enlaces

- [Hugging Face: abhishekai/slm-125m-legal-sft-v2](https://huggingface.co/abhishekai/slm-125m-legal-sft-v2)
- [Modelo base: abhishekai/slm-125m-legal-base](https://huggingface.co/abhishekai/slm-125m-legal-base)
- [Versión anterior: abhishekai/slm-125m-legal-sft](https://huggingface.co/abhishekai/slm-125m-legal-sft)
