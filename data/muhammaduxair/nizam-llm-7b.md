# muhammaduxair/Nizam-LLM-7B

## Resumen

Nizam-LLM-7B es un ajuste fino del modelo base ALLaM-7B-Instruct-preview, desarrollado por Muhammad Uzair, especializado en derecho laboral saudí. El modelo responde preguntas sobre la legislación laboral de Arabia Saudí citando explícitamente los artículos legales en los que se basa, e indica honestamente cuándo la respuesta no se encuentra en los textos proporcionados. Se distribuye bajo licencia Apache 2.0 y está pensado para flujos de generación aumentada por recuperación (RAG) sobre un corpus de 846 artículos legales.

El modelo parte de la arquitectura transformer de ALLaM-7B (7.000.559.616 parámetros totales) y se ha ajustado mediante QLoRA de 4 bits sobre un conjunto de datos construido específicamente para el dominio. Su relevancia radica en que combina tres capacidades poco habituales en modelos de dominio legal: respuestas fundamentadas en artículos concretos, citación verificable con el formato «المادة (N) من <النظام>» y una tasa de rechazo correcto cuando la información no está en el contexto.

La versión v1 es la primera release estable y la que respalda la demo pública. Según la model card, el modelo alcanza un 79% de respuestas completamente correctas en un conjunto de test de 286 casos, frente al 16% del modelo base sin entrenar, y cita el artículo correcto en el 98% de los casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de ALLaM-7B-Instruct-preview) |
| Parametros totales | 7.000.559.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el ajuste se realizó con QLoRA de 4 bits, pero no se documentan cuantizaciones de inferencia publicadas) |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint humain-ai/ALLaM-7B-Instruct-preview, un transformer denso de 7.000 millones de parámetros optimizado para árabe. El entrenamiento se realizó con QLoRA de 4 bits en bf16 sobre una GPU A100, según la tabla de iteraciones de la model card. No se especifica la composición exacta del dataset de ajuste ni el número de tokens de entrenamiento, aunque la model card indica que la versión v1 añadió aproximadamente 570 ejemplos revisados orientados a gestores de RR. HH. y abogados.

El proceso de desarrollo fue iterativo y documentado: ocho ejecuciones de entrenamiento desde el modelo base, con evaluación sobre el mismo conjunto de 286 casos en cada iteración. Las innovaciones técnicas destacables son el uso de un corpus legal estructurado (nizam-saudi-labor-corpus, 846 artículos), el entrenamiento con pares de ejemplos que enseñan al modelo a distinguir entre un artículo ausente y uno presente, y la inclusión de cálculos verificados por código. La model card señala que las mejoras provinieron de datos de entrenamiento específicos y no de mayor potencia de hardware: las ejecuciones 5, 5b y 6, realizadas en T4, H100 y L4 respectivamente, obtuvieron puntuaciones dentro del margen de ruido.

## Capacidades

- Generación de texto en árabe con respuestas estructuradas sobre derecho laboral saudí.
- Citación explícita de artículos legales con el formato «المادة (N) من <النظام>», lo que permite verificación manual.
- Rechazo calibrado: indica que los textos no contienen la respuesta cuando la información no está en el contexto proporcionado.
- Razonamiento sobre escenarios multi-parte que requieren combinar varios artículos.
- Manejo de cálculos laborales verificados por código (por ejemplo, indemnizaciones por vacaciones no disfrutadas).
- Cobertura de 24 regulaciones, incluyendo la Ley Laboral, el reglamento de trabajadores domésticos, el servicio civil y el reglamento agrícola.
- Integración en pipelines RAG: el modelo está diseñado para leer artículos recuperados por un paso de búsqueda previo.
- No se documenta soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Atención al cliente en recursos humanos: el modelo puede responder consultas de empleados sobre vacaciones, indemnizaciones o terminación de contrato citando el artículo aplicable, lo que reduce la carga del equipo legal y permite al usuario verificar la respuesta.
- Asistencia a abogados laboralistas: dado un conjunto de artículos recuperados por búsqueda, el modelo redacta un borrador de respuesta fundamentado que el profesional puede revisar y citar directamente.
- Automatización de consultas internas en empresas saudíes: integrado en un portal de empleado, responde preguntas frecuentes sobre derechos y obligaciones con base en la legislación vigente y el reglamento interno.
- Generación de documentación legal: produce resúmenes de escenarios laborales complejos (por ejemplo, cálculo de finiquito con años parciales) con las referencias normativas correspondientes.
- Verificación de cumplimiento normativo: el modelo puede señalar si una política interna o una cláusula contractual contradice un artículo específico de la ley laboral, siempre que se le proporcionen los textos relevantes.
- Formación y onboarding: genera explicaciones didácticas de conceptos legales para nuevos empleados o estudiantes de derecho, con citas que permiten profundizar en la fuente original.
- Sistemas de pregunta-respuesta sobre corpus legales: su capacidad de rechazo calibrado lo hace adecuado para entornos donde una respuesta inventada es más costosa que una abstención, como asesoramiento preliminar o triaje de consultas.

## Benchmarks y rendimiento

La model card publica resultados sobre un conjunto de test propio de 286 casos (143 preguntas, cada una en dos configuraciones: con los artículos correctos y con artículos relacionados). La evaluación se realiza con reglas fijas, no con otro modelo de IA, y exige que la respuesta incluya todos los puntos requeridos, cite el artículo correcto, nombre la regulación y rechace cuando corresponda.

| Metrica | Base ALLaM-7B | Nizam-LLM v1 |
|---|---:|---:|
| Respuestas completamente correctas | 16% | 79% |
| Cita el artículo correcto | 25% | 98% |
| Rechaza correctamente cuando falta la respuesta (de 30) | 2 | 27 |
| Rechaza incorrectamente cuando la respuesta está (de 256) | 2 | 0 |

Evolución por versiones en el mismo conjunto de 286 casos:

| Version | Overall pass | Preguntas respondibles (256) | Rechazos correctos (30) |
|---|---:|---:|---:|
| Base | 16,1% | 17,2% | 2 |
| Run 3 | 56,3% | 59,4% | 9 |
| v0.1 | 69,6% | 73,4% | 11 |
| v0.2 | 74,1% | 78,5% | 11 |
| Run 5b | 73,8% | 76,6% | 15 |
| Run 6 | 70,6% | 73,8% | 13 |
| v0.3 | 76,6% | 76,2% | 24 |
| v1 | 79,0% | 77,7% | 27 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. Para un modelo denso de 7.000 millones de parámetros, las estimaciones habituales serían aproximadamente 14 GB en fp16, 7-8 GB en cuantización de 8 bits y 4-5 GB en cuantización de 4 bits, aunque el autor no publica estas cifras.
- GPU recomendadas: el entrenamiento se realizó en A100 (v1), H100, L4 y 2× T4 en iteraciones anteriores. Para inferencia, una GPU consumer con 8-16 GB de VRAM podría ser suficiente según la cuantización, pero no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí con cuantización de 4 u 8 bits, aunque no se especifica qué GPUs concretas han sido validadas.
- Opciones de despliegue: la model card menciona compatibilidad con text-generation-inference y endpoints_compatible. No se documentan instrucciones para llama.cpp, Ollama, vLLM ni TGI más allá de la etiqueta.
- Latencia y throughput: la demo serverless tarda aproximadamente 2-3 minutos en la primera respuesta tras un periodo de inactividad (arranque en frío) y responde en segundos en llamadas posteriores. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nizam-LLM-7B | 7.000.559.616 | No disponible | Derecho laboral saudí, RAG con citas | Apache 2.0 | Hugging Face |
| ALLaM-7B-Instruct-preview (base) | 7B | No disponible | Modelo generalista en árabe | No disponible en la información | Hugging Face |
| Qwen3-1.7B | 1.7B | No disponible | Modelo generalista multilingüe | No disponible en la información | Hugging Face |

La model card menciona que antes del ajuste sobre ALLaM se probaron dos ejecuciones sobre Qwen3-1.7B y tres modelos base sin entrenar. ALLaM fue seleccionado por su cobertura de contenido legal y su eficiencia con texto árabe. No se proporcionan comparativas de rendimiento con otros modelos especializados en derecho laboral saudí.

## Limitaciones y advertencias

- El modelo es una release de investigación, no asesoramiento legal. La propia model card advierte que siempre debe verificarse el texto oficial.
- Está entrenado exclusivamente para derecho laboral saudí y solo responde en árabe. No se ha validado para otras jurisdicciones ni otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje: aunque la tasa de rechazo correcto es alta (27 de 30), un 10% de los casos sin respuesta en los textos no se detectan correctamente.
- La evaluación se basa en un conjunto de test propio de 286 casos, no en benchmarks estándar de la comunidad, lo que limita la comparación directa con otros modelos.
- El rendimiento depende críticamente del paso de recuperación (RAG): si los artículos correctos no se recuperan, el modelo no puede responder adecuadamente.
- No se documentan sesgos específicos, pero al estar entrenado sobre un corpus legal concreto, puede reflejar las interpretaciones y el lenguaje de dicho corpus.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base ALLaM-7B-Instruct-preview puede tener sus propias condiciones que conviene verificar.
- No se especifica la longitud de contexto soportada, lo que es relevante para pipelines RAG que necesiten incluir muchos artículos en el prompt.
- El tamaño del repositorio es de 56 GB, lo que puede dificultar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- [Hugging Face: muhammaduxair/Nizam-LLM-7B](https://huggingface.co/muhammaduxair/Nizam-LLM-7B)
- [Modelo base: humain-ai/ALLaM-7B-Instruct-preview](https://huggingface.co/humain-ai/ALLaM-7B-Instruct-preview)
- [Dataset: nizam-saudi-labor-corpus](https://huggingface.co/datasets/muhammaduxair/nizam-saudi-labor-corpus)
- [Demo en vivo](https://muhammaduzair.info/playground/nizam-llm-7b)
