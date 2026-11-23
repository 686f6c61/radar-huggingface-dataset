# sigmanih/google-gemma-4-12B-it-GGUF-Q8_0

## Resumen

`google-gemma-4-12B-it-GGUF-Q8_0` es una cuantización en formato GGUF con precisión Q8_0 del modelo base `google/gemma-4-12B-it`, publicada por el usuario `sigmanih` a través de su herramienta Sigma Studio. Se trata de un modelo causal de generación de texto de aproximadamente 11.900 millones de parámetros (11.907.350.576 según los pesos en safetensors), derivado de la familia Gemma 4 de Google en su variante instruction-tuned. El repositorio ocupa 12,7 GB y está pensado para inferencia local con offload completo en GPU.

La relevancia de esta ficha radica en que ofrece una vía de despliegue práctica del modelo Gemma 4 de 12B en hardware de consumo: el autor indica que requiere aproximadamente 10,7 GB de VRAM con offload completo en GPU, lo que lo sitúa al alcance de tarjetas de 12-16 GB como la RTX 3060 o la RTX 4070. La ventana de contexto declarada es de 32.768 tokens. El modelo está etiquetado para inglés e italiano, lo que limita su uso directo en castellano sin evaluación adicional.

Conviene señalar desde el principio que esta publicación es una cuantización de terceros, no un modelo oficial de Google: el autor es `sigmanih`, la licencia figura como "other" y los datos de benchmarks proceden de la propia model card del publicador, medidos sobre subconjuntos parciales de los conjuntos de evaluación. Por tanto, las cifras de rendimiento deben interpretarse con cautela y no son directamente comparables con ejecuciones completas de los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer decoder-only, según la model card del publicador) |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (esta publicación); no se detallan otras variantes en la información disponible |
| Idiomas soportados | inglés (en), italiano (it) |
| Licencia | other (la model card incluye un badge Apache-2.0, pero el campo de licencia del repo indica "other"; discrepancia no resuelta) |
| Formato de pesos | GGUF (el campo "Weight Format" de la model card aparece como "Sconosciuto"/"sconosciuta") |
| Modelo base | google/gemma-4-12B-it |
| Tamano del repositorio | 12,7 GB |
| VRAM estimada (offload completo) | ~10,7 GB |
| RAM estimada (CPU/híbrido) | ~10,0 GB |
| Hardware recomendado | GPU de 12-16 GB de VRAM (RTX 3060/4070) o 32 GB de RAM |

## Arquitectura y entrenamiento

La información disponible identifica el modelo base como `google/gemma-4-12B-it`, de la familia Gemma 4 de Google, en variante instruction-tuned, y describe la arquitectura como `CausalLM`, es decir, un transformer decoder-only de aproximadamente 12.000 millones de parámetros. Esta publicación concreta no entrena el modelo: aplica una cuantización Q8_0 sobre los pesos del modelo base y los empaqueta en formato GGUF para su uso con motores de inferencia compatibles. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original, más allá de su carácter instruction-tuned.

Tampoco se documentan en la información proporcionada innovaciones técnicas específicas del modelo base (como atención lineal, decodificación especulativa o arquitecturas híbridas). El publicador menciona un motor propio, "SigmaEngine", y un módulo "Model Hub" de Sigma Studio empleados para la publicación, pero no se aportan detalles técnicos sobre su funcionamiento interno ni sobre posibles modificaciones de los pesos. El hash de reproducibilidad declarado para la evaluación es `SHA256-B81232ECC62AC6FC`.

## Capacidades

- Generación de texto conversacional en inglés e italiano, con soporte de diálogo multi-turno.
- Razonamiento de varios pasos: la model card distingue entre modo "No-Thinking" (respuesta directa) y "Deep Thinking" (cadena de pensamiento estructurada).
- Generación de código en Python, evaluada mediante HumanEval y MBPP.
- Razonamiento matemático, evaluado con GSM8K y MATH.
- Conocimiento general y razonamiento académico, evaluado con MMLU, MMLU-Pro, ARC-Challenge y GPQA.
- Uso de herramientas: la model card reporta una evaluación de adherencia a protocolos de tool calling en un entorno sandbox, con un 64,1% de adherencia declarada.
- Capacidades agénticas: se mencionan bucles autónomos y razonamiento multi-paso como uso previsto, aunque los resultados reportados de finalización autónoma de tareas son nulos (0,0%).
- No se documentan capacidades de visión, audio ni otros modos en la información disponible.

## Casos de uso

- Asistentes conversacionales locales: con 32.768 tokens de contexto y un peso de 12,7 GB en Q8_0, el modelo puede gestionar conversaciones multi-turno en inglés o italiano en una estación de trabajo con GPU de 12-16 GB, sin dependencia de servicios en la nube.
- Generación de código en entornos de desarrollo: los resultados declarados en HumanEval (86%) y MBPP (89%) sobre subconjuntos parciales sugieren utilidad para autocompletado y generación de funciones Python; encaja en flujos de trabajo locales con editores o asistentes de código.
- Automatización de tareas con herramientas: la model card describe soporte de tool calling y adherencia a esquemas de funciones, lo que permite integrarlo en pipelines donde el modelo invoca APIs registradas; conviene validar la fiabilidad real, dado el 64,1% de adherencia reportado.
- Razonamiento matemático asistido: con resultados declarados del 89% en GSM8K y MATH (sobre subconjuntos de 9 preguntas), puede emplearse para resolver problemas paso a paso en entornos educativos o de análisis, activando el modo de razonamiento CoT.
- Procesamiento de documentos largos en inglés o italiano: la ventana de 32.768 tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o documentación técnica en esos idiomas.
- Despliegue en hardware de consumo para prototipado: al caber en una RTX 3060/4070 con offload completo (~10,7 GB de VRAM), sirve para experimentar con un modelo de 12B en local antes de escalar a infraestructura mayor.
- Evaluación comparativa interna: útil como referencia de un modelo instruction-tuned de tamaño medio en pruebas A/B de calidad frente a alternativas, siempre que se tenga en cuenta que los benchmarks publicados son parciales.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del publicador y fueron medidos sobre subconjuntos parciales de cada benchmark (entre 7 y 14 preguntas por conjunto), con temperatura 0,0 y semilla 42. El propio autor advierte que no son comparables con ejecuciones de suite completa.

| Benchmark | Dominio | Correctas / total | Precisión declarada |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89% |
| BIG-Bench Hard | Lógica multi-tarea y simbólica | 7 / 7 | 100% |
| GPQA | Razonamiento académico de posgrado | 3 / 9 | 33% |
| GSM8K | Matemáticas escolares multi-paso | 8 / 9 | 89% |
| HellaSwag | Sentido común y NLI situacional | 5 / 9 | 56% |
| HumanEval | Programación Python (pass@1) | 6 / 7 | 86% |
| MATH | Matemáticas de competición | 8 / 9 | 89% |
| MBPP | Programación Python con tests | 8 / 9 | 89% |
| MMLU | Conocimiento general multi-materia | 11 / 14 | 79% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 7 / 9 | 78% |
| TruthfulQA | Factualidad y anti-alucinación | 9 / 9 | 100% |
| Total | Todos los conjuntos evaluados | 80 / 100 | 80% |

Comparativa de modos de ejecución declarada por el publicador:

| Modo | Precisión | Preguntas superadas | Perfil operativo |
|---|---|---|---|
| No-Thinking (respuesta directa) | 82,5% | 47 / 57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 76,7% | 33 / 43 | Traza de razonamiento multi-paso; delta de -5,7% |

Evaluación de tool calling y comportamiento agéntico (sandbox del publicador):

| Métrica | Resultado | Detalle |
|---|---|---|
| Adherencia al protocolo de herramientas | 64,1% | 0/92 criterios analíticos verificados |
| Finalización autónoma de tareas | 0,0% | 0/1 escenarios completados con el fichero objetivo exacto |
| Contención en sandbox | 100% conforme | Sin intentos de escape del espacio de trabajo |
| Eficiencia de ejecución | 0 turnos (0,0 s) | Uso declarado de presupuesto de turnos y tokens |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,7 GB con offload completo en GPU (Q8_0), según el publicador.
- RAM estimada en modo CPU o híbrido: aproximadamente 10,0 GB, con 32 GB de RAM recomendados por el autor.
- GPU recomendadas por el publicador: RTX 3060 o RTX 4070 (12-16 GB de VRAM). Para mayor margen de contexto y lotes, resultan adecuadas GPU de 24 GB o superiores (RTX 4090, A100, H100), aunque no se aportan mediciones específicas para ellas.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12 GB de VRAM para el modelo completo en Q8_0; con contexto largo puede requerir reducir la ventana o usar offload parcial a CPU.
- Opciones de despliegue: al estar en formato GGUF, es compatible con motores de inferencia GGUF como llama.cpp u Ollama; no se confirma compatibilidad con vLLM o TGI en la información disponible. El publicador menciona su propio motor, SigmaEngine.
- Latencia y throughput: no se han publicado mediciones de latencia o throughput en la información disponible, salvo la referencia cualitativa a "latencia mínima" en el modo No-Thinking.

## Comparativa con modelos similares

No se dispone de datos verificados de otros modelos comparables en la información proporcionada. A continuación se indica qué se conoce y qué no:

| Aspecto | Este modelo | Alternativas comparables |
|---|---|---|
| Parámetros | ~12B | no disponible |
| Contexto | 32.768 tokens | no disponible |
| Licencia | other (con discrepancia respecto al badge Apache-2.0) | no disponible |
| Formato | GGUF Q8_0 | no disponible |
| Benchmarks | Parciales, sobre subconjuntos de 7-14 preguntas | no disponible |

Como referencia cualitativa, la categoría natural de comparación sería la de modelos instruction-tuned de ~12B en formato GGUF (por ejemplo, otras cuantizaciones de la familia Gemma o de familias equivalentes de otros desarrolladores), pero no se han proporcionado cifras de esos modelos en el material disponible, por lo que no se incluye una comparación numérica.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés e italiano; no se garantiza un rendimiento adecuado en castellano sin evaluación previa.
- Benchmarks parciales: todas las cifras proceden de subconjuntos de 7 a 14 preguntas por benchmark, con el propio aviso del autor de que no son comparables con ejecuciones completas. El resultado de GPQA (33%) y HellaSwag (56%) indica debilidades claras en razonamiento académico avanzado y sentido común.
- Tool calling poco fiable: la adherencia declarada al protocolo de herramientas es del 64,1% y la finalización autónoma de tareas es del 0,0%, lo que desaconseja su uso en agentes autónomos en producción sin validación exhaustiva.
- Discrepancia de licencia: el campo de licencia del repositorio indica "other", mientras que la model card muestra un badge Apache-2.0. Antes de un uso comercial es imprescindible verificar los términos reales aplicables, que además dependen de la licencia del modelo base Gemma 4 de Google.
- Publicador de terceros: se trata de una cuantización no oficial; no hay garantía de que los pesos coincidan exactamente con el modelo base ni de que las evaluaciones se hayan realizado con protocolos estándar.
- Riesgo de alucinación: aunque la model card reporta un 100% en TruthfulQA sobre 9 preguntas, el tamaño de la muestra es demasiado reducido para extraer conclusiones; debe asumirse el riesgo habitual de alucinación en modelos de este tamaño.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Metadatos inconsistentes: la model card muestra campos como "Weight Format: Sconosciuto" y "Total Disk Footprint: 0.0 GB", lo que sugiere una generación automática de la ficha y reduce la fiabilidad de los metadatos declarados.
- Contexto efectivo: aunque se declaran 32.768 tokens, con Q8_0 y 12 GB de VRAM el contexto completo puede requerir offload parcial a CPU y degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sigmanih/google-gemma-4-12B-it-GGUF-Q8_0
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del publicador en Hugging Face: https://huggingface.co/sigmanih
