# sigmanih/MiniCPM5-2B-MLX-GGUF-Q8_0

## Resumen

MiniCPM5-2B-MLX-GGUF-Q8_0 es una cuantización en formato GGUF (Q8_0) del modelo openbmb/MiniCPM5-2B-MLX, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. Se trata de un modelo de generación de texto de aproximadamente 2.516 millones de parámetros (2B) con una ventana de contexto declarada de 131.072 tokens, pensado para despliegue en entornos con recursos limitados: dispositivos edge, agentes de voz en tiempo real y cargas de trabajo en CPU o GPU de gama baja.

La relevancia de esta ficha radica en que empaqueta un modelo de 2B en un único archivo GGUF Q8_0 de unos 2,5 GB, con un consumo estimado de VRAM de ~3,4 GB en offload completo a GPU, lo que lo sitúa al alcance de tarjetas gráficas de 6-8 GB. La arquitectura base se declara como `llama`, con 42 capas transformer y dimensión oculta de 2048.

Conviene subrayar que la model card incluye resultados de benchmarks internos medidos sobre subconjuntos parciales de cada suite (no sobre el conjunto completo), por lo que sus puntuaciones no son directamente comparables con evaluaciones completas publicadas por terceros. Además, la licencia se declara como "other" en los metadatos de Hugging Face, mientras que los badges de la model card muestran Apache-2.0, una discrepancia que debe resolverse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer denso) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF); el repositorio solo publica esta cuantización |
| Idiomas soportados | en, it |
| Licencia | other (los badges de la model card indican Apache-2.0; discrepancia sin resolver) |
| Formato de pesos | GGUF (Q8_0) |
| Capas transformer | 42 |
| Dimension oculta | 2048 |
| Tamano del repositorio | 2,7 GB |
| Modelo base | openbmb/MiniCPM5-2B-MLX |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo `llama` con 42 capas y dimensión oculta de 2048, cuantizado a Q8_0 en formato GGUF para su uso con llama.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO; la model card no documenta el proceso de entrenamiento del modelo base openbmb/MiniCPM5-2B-MLX.

La model card sí describe dos modos de inferencia diferenciados: un modo "No-Thinking" de respuesta directa, con latencia mínima y sin tokens de razonamiento, y un modo "Deep Thinking" con traza de razonamiento paso a paso (chain-of-thought). Según la evaluación interna del autor, el modo CoT mejora la precisión en 8,5 puntos porcentuales (40,4% frente a 48,8%), aunque el número de preguntas evaluadas difiere entre ambos modos (57 frente a 43), lo que limita la comparabilidad directa.

## Capacidades

- Generación de texto conversacional multi-turno en inglés e italiano.
- Razonamiento con modo dual: respuesta directa (No-Thinking) y razonamiento estructurado paso a paso (Deep Thinking / CoT).
- Generación de código en Python, con resultados internos en HumanEval (71% pass@1 sobre 7 preguntas) y MBPP (56% sobre 9 preguntas).
- Razonamiento matemático de varios pasos (GSM8K 67%, MATH 78% sobre subconjuntos parciales).
- Razonamiento científico y lógico (ARC-Challenge 78%, BIG-Bench Hard 86% sobre subconjuntos parciales).
- Soporte de tool calling / function calling, con una adherencia al protocolo de herramientas del 72,8% según la evaluación interna del autor.
- Capacidad de ejecución de agentes multi-paso en entornos sandbox, con contención del 100% según la model card (aunque la tasa de finalización autónoma de tareas se reporta como 0,0%).
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos y conversaciones prolongadas.

## Casos de uso

- Agentes de voz en tiempo real: el modelo cabe en ~3,4 GB de VRAM con offload completo, lo que permite desplegarlo junto a un pipeline de ASR/TTS en una GPU de 8 GB y mantener latencias bajas en el modo No-Thinking para respuestas inmediatas.
- Atención al cliente automatizada: con 131.072 tokens de contexto, puede gestionar conversaciones multi-turno largas y mantener el hilo de incidencias complejas sin truncar el historial, en inglés o italiano.
- Despliegue en dispositivos edge y CPU: el archivo GGUF Q8_0 de 2,5 GB y los ~3,2 GB de RAM estimados en modo CPU/híbrido lo hacen viable en mini-PC, portátiles sin GPU dedicada o entornos embebidos con llama.cpp.
- Asistencia de código en local: con soporte de tool calling y resultados internos razonables en HumanEval y MBPP, puede integrarse en editores o pipelines de CI/CD como autocompletado y generación de tests en entornos donde no se permite enviar código a la nube.
- Razonamiento matemático asistido: el modo Deep Thinking mejora la precisión en problemas de varios pasos, útil para tutores educativos o herramientas de verificación de cálculos con traza auditable.
- Prototipado rápido de agentes con herramientas: la adherencia del 72,8% al protocolo de herramientas y la contención del 100% en sandbox lo convierten en una opción para validar flujos agénticos antes de escalar a modelos mayores.
- Clasificación y extracción de información sobre documentos largos: gracias al contexto de 131k tokens, puede procesar contratos, informes o expedientes completos en una sola pasada sin técnicas de chunking.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la evaluación interna del autor en Sigma Studio Training Lab (temperatura 0,0, semilla 42) y se midieron sobre subconjuntos parciales de cada suite, no sobre el conjunto completo. No son comparables con ejecuciones completas publicadas por terceros.

| Benchmark | Dominio | Correctas / total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento | 7 / 9 | 78% |
| BIG-Bench Hard | Lógica y simbolismo | 6 / 7 | 86% |
| GPQA | Razonamiento académico | 0 / 9 | 0% |
| GSM8K | Matemáticas de primaria | 6 / 9 | 67% |
| HellaSwag | Sentido común | 1 / 9 | 11% |
| HumanEval | Código Python (pass@1) | 5 / 7 | 71% |
| MATH | Matemáticas de competición | 7 / 9 | 78% |
| MBPP | Programación Python | 5 / 9 | 56% |
| MMLU | Conocimiento general | 3 / 14 | 21% |
| MMLU-Pro | Razonamiento avanzado | 2 / 9 | 22% |
| TruthfulQA | Factualidad | 2 / 9 | 22% |
| Total agregado | Todas las suites | 44 / 100 | 44% |

| Modo de ejecución | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (directo) | 40,4% | 23 / 57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 48,8% | 21 / 43 | Traza de razonamiento multi-paso (+8,5%) |

| Métrica de agente (Sandbox Jail) | Resultado |
|---|---|
| Adherencia al protocolo de herramientas | 72,8% |
| Finalización autónoma de tareas | 0,0% (0/1 escenarios) |
| Contención en sandbox | 100% |
| Eficiencia de ejecución | 0 turnos (0,0 s) |

## Requisitos de hardware

- VRAM estimada: ~3,4 GB con offload completo a GPU; ~3,2 GB de RAM en modo CPU/híbrido.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070); también válidas A100, H100 o RTX 4090 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 6-8 GB de VRAM con la cuantización Q8_0.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints (la model card indica `endpoints_compatible`).
- Latencia y throughput: no se han publicado mediciones de latencia o tokens por segundo en la información disponible; la model card solo describe cualitativamente el modo No-Thinking como de "latencia mínima" y "token-to-first-byte inmediato".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-MLX-GGUF-Q8_0 (este) | ~2,5B | 131.072 | other (badge Apache-2.0) | GGUF Q8_0 | Cuantización comunitaria de un modelo base de openbmb |
| openbmb/MiniCPM5-2B-MLX (base) | ~2,5B | no disponible en la información | no disponible en la información | safetensors/MLX | Modelo original sin cuantizar |
| Alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos verificados de benchmarks completos ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Los benchmarks publicados se midieron sobre subconjuntos parciales (entre 7 y 14 preguntas por suite) y no son comparables con ejecuciones completas; el propio autor lo advierte en la model card.
- Resultados muy bajos en MMLU (21%), MMLU-Pro (22%), TruthfulQA (22%), HellaSwag (11%) y GPQA (0%), lo que indica conocimiento general limitado, riesgo elevado de alucinación y escaso sentido común situacional.
- La tasa de finalización autónoma de tareas agénticas se reporta como 0,0% (0 de 1 escenarios), pese a una adherencia al protocolo de herramientas del 72,8%; no debe asumirse fiabilidad en flujos agénticos de producción.
- Idiomas soportados limitados a inglés e italiano; no se declara soporte de castellano.
- Discrepancia de licencia: los metadatos de Hugging Face indican "other" mientras que los badges de la model card muestran Apache-2.0. Es imprescindible verificar la licencia real del modelo base openbmb/MiniCPM5-2B-MLX antes de cualquier uso comercial.
- Solo se publica la cuantización Q8_0; no hay variantes Q4, Q5 o Q6 que reduzcan aún más el consumo de memoria.
- El repositorio tiene un volumen de descargas bajo (182) y un único like, por lo que no cuenta con validación comunitaria significativa.
- La model card incluye afirmaciones de marketing y elementos visuales (badges, emojis, diagramas) que no sustituyen a una documentación técnica rigurosa del proceso de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/MiniCPM5-2B-MLX-GGUF-Q8_0
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
