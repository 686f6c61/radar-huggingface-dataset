# sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_S

## Resumen

Qwen-Qwen3.8-27B-GGUF-IQ2_S es una cuantización GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. Se trata de una versión comprimida en formato IQ2_S (cuantización de 2 bits con imatrix) pensada para reducir el espacio en disco y los requisitos de memoria del modelo original de 27.320.697.856 parámetros, permitiendo su ejecución en hardware más modesto. El repositorio ocupa 11,5 GB y está etiquetado para generación de texto conversacional.

El modelo base es un transformer causal (CausalLM) de 27B parámetros con una ventana de contexto declarada de 32.768 tokens. La model card del autor declara capacidades de razonamiento avanzado, especialización de dominio empresarial y refactorización de código complejo, e incluye una batería de benchmarks propia ejecutada con su motor SigmaEngine. Sin embargo, estos resultados proceden de una porción reducida de cada dataset (71 preguntas en total) y el propio autor advierte que no son comparables con ejecuciones de suite completa.

La relevancia de esta ficha radica en que documenta una cuantización agresiva (2 bits) de un modelo de 27B, un caso de uso habitual para quienes buscan desplegar modelos grandes en GPUs de consumo. No obstante, la información disponible es escasa y parcial: la model card contiene datos contradictorios (formato de pesos "desconocido", tamaño en disco "0.0 GB"), la licencia figura como "other" pese a mostrar un badge Apache-2.0, y no se detallan los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (CausalLM) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según model card) |
| Tipos de cuantizacion | IQ2_S (2 bits, con imatrix); el repo contiene únicamente esta variante |
| Idiomas soportados | en, it (según tags y model card) |
| Licencia | other (la model card muestra badge Apache-2.0, pero el campo de licencia del repo es "other") |
| Formato de pesos | GGUF |
| Tamano del repositorio | 11,5 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-11-02 |
| Descargas | 427 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal estándar (CausalLM) de 27B parámetros, según la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación en el modelo original Qwen/Qwen3.8-27B. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

La contribución de este repositorio es exclusivamente la cuantización: se ha generado un archivo GGUF en formato IQ2_S, una cuantización de 2 bits que emplea una matriz de importancia (imatrix) para preservar los pesos más relevantes. Esta técnica reduce el peso del modelo hasta los 11,5 GB del repositorio, a costa de una pérdida de precisión que no se cuantifica en la información disponible. El autor indica que la publicación se realizó mediante el módulo Model Hub de Sigma Studio y que la inferencia está "acelerada por SigmaEngine", sin más detalles técnicos sobre dicho motor.

## Capacidades

- Generación de texto conversacional en inglés e italiano.
- Razonamiento de lógica y sentido común (evaluado en ARC-Challenge, HellaSwag y BIG-Bench Hard según la model card).
- Generación de código Python (evaluado en HumanEval y MBPP).
- Razonamiento matemático multi-paso y matemáticas de competición (GSM8K, MATH).
- Modo de razonamiento "Deep Thinking" (cadena de pensamiento) además de respuesta directa "No-Thinking", según la comparativa del autor.
- Uso de herramientas (tool calling) con adherencia declarada del 87,0 % al protocolo de herramientas registradas.
- Capacidades agénticas multi-paso en un entorno sandbox, según la evaluación del autor.
- No se documentan capacidades de visión, audio ni otros modos multimodales.

## Casos de uso

- Refactorización de código en local: el modelo base está orientado, según el autor, a la refactorización de código complejo; con la cuantización IQ2_S puede ejecutarse en una GPU de 24 GB para tareas de reescritura y análisis de módulos Python, aunque la pérdida de precisión de 2 bits puede afectar a la calidad del código generado.
- Asistente conversacional en inglés o italiano: sus dos idiomas declarados permiten desplegarlo como chatbot de atención al cliente en esos mercados, con una ventana de 32.768 tokens para conversaciones multi-turno con historial largo.
- Razonamiento matemático asistido: para resolver problemas de varios pasos (tipo GSM8K) en entornos educativos o de análisis, activando el modo "Deep Thinking" cuando se requiera traza de razonamiento.
- Automatización agéntica con herramientas: la model card declara adherencia al protocolo de tool calling y contención en sandbox, lo que permitiría integrarlo en flujos que invocan funciones registradas (lectura de ficheros, llamadas a API) en un entorno aislado.
- Prototipado en hardware de consumo: al ocupar 11,5 GB en disco y requerir, según el autor, unos 23,4 GB de VRAM para descarga completa en GPU, es viable en una RTX 3090 o RTX 4090 para experimentación e investigación sin infraestructura de centro de datos.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de un modelo de 27B al comprimirlo a 2 bits frente al modelo original en precisión completa.

## Benchmarks y rendimiento

Los datos proceden de la evaluación propia del autor con SigmaEngine (temperatura 0.0, semilla 42) sobre una porción reducida de cada dataset (71 preguntas en total). El propio autor advierte que la puntuación no es comparable con una ejecución de suite completa.

| Benchmark | Resultado | Correctas / total |
|---|---|---|
| ARC-Challenge | 100 % | 9 / 9 |
| BIG-Bench Hard | 86 % | 6 / 7 |
| GPQA | 22 % | 2 / 9 |
| GSM8K | 89 % | 8 / 9 |
| HellaSwag | 78 % | 7 / 9 |
| HumanEval | 100 % | 7 / 7 |
| MATH | 67 % | 6 / 9 |
| MBPP | 56 % | 5 / 9 |
| MMLU | 57 % | 8 / 14 |
| MMLU-Pro | 67 % | 6 / 9 |
| TruthfulQA | 78 % | 7 / 9 |
| Total | 71 % | 71 / 100 |

Comparativa de modos de razonamiento declarada por el autor:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 75,4 % | 43 / 57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 65,1 % | 28 / 43 | Traza de razonamiento multi-paso, delta de -10,3 % |

Evaluación agéntica (Sandbox Jail): adherencia al protocolo de herramientas del 87,0 %, finalización autónoma de tareas del 0,0 % (0 de 1 escenarios), contención en sandbox del 100 %. No se han publicado resultados de benchmarks del modelo base en precisión completa dentro de la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 23,4 GB para descarga completa en GPU, según la model card del autor; unos 21,9 GB de RAM en modo CPU/híbrido.
- GPU recomendadas por el autor: GPU con 24 GB de VRAM, como RTX 3090 o RTX 4090, o bien 32-64 GB de RAM en configuración híbrida.
- Cabe en GPU de consumo de gama alta (RTX 3090, RTX 4090) con descarga completa; en GPUs de 16 GB o menos requeriría descarga parcial a CPU.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp y con frontends basados en él como Ollama; el autor menciona su propio motor SigmaEngine. No se documenta compatibilidad con vLLM o TGI para esta variante cuantizada.
- Latencia y throughput: no disponibles. El autor solo indica que el modo No-Thinking ofrece "latencia mínima" sin cuantificar tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otras cuantizaciones del mismo modelo base ni con modelos de tamaño similar. Como referencia estructural, esta variante se puede contrastar con otras cuantizaciones del mismo Qwen/Qwen3.8-27B (por ejemplo, variantes de 4 u 8 bits), pero no se han publicado sus métricas en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen-Qwen3.8-27B-GGUF-IQ2_S (este) | 27B | 32.768 | other | GGUF IQ2_S |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | no disponible | safetensors |
| Otras cuantizaciones del mismo base | 27B | 32.768 | no disponible | GGUF (otras precisiones) |

## Limitaciones y advertencias

- La cuantización IQ2_S de 2 bits implica una pérdida de precisión significativa respecto al modelo en precisión completa; no se ha cuantificado dicha degradación en la información disponible.
- Los benchmarks del autor se ejecutaron sobre porciones muy reducidas de cada dataset (71 preguntas en total), por lo que sus cifras tienen alta varianza y no son comparables con suites completas, tal como advierte el propio autor.
- El resultado de GPQA (22 %) y MMLU (57 %) sugiere un rendimiento limitado en conocimiento académico avanzado y razonamiento de nivel graduado.
- La finalización autónoma de tareas agénticas se midió en 0,0 % (0 de 1 escenarios), lo que cuestiona la fiabilidad práctica del modo agéntico pese a la adherencia del 87 % al protocolo de herramientas.
- La licencia figura como "other" pese a mostrar un badge Apache-2.0 en la model card; la ambigüedad debe resolverse antes de cualquier uso comercial.
- Solo se declaran los idiomas inglés e italiano; no hay garantías de calidad en castellano.
- La model card contiene datos internamente contradictorios (formato de pesos "desconocido", tamaño en disco "0.0 GB"), lo que reduce la fiabilidad de la documentación.
- Riesgo de alucinación inherente a los modelos de lenguaje; el resultado de TruthfulQA (78 % sobre 9 preguntas) no es una garantía suficiente.
- No se documentan sesgos conocidos ni datos de entrenamiento del modelo base, lo que impide evaluar riesgos de sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_S
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
