# sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_XXS

## Resumen

Qwen-Qwen3.8-27B-GGUF-IQ2_XXS es una cuantización GGUF en formato IQ2_XXS del modelo base Qwen/Qwen3.8-27B, publicada por el usuario sigmanih bajo el sello Sigma Studio. No se trata de un modelo entrenado desde cero, sino de una conversión a 2 bits con imatrix (importance matrix) orientada a reducir el peso en disco y en memoria de un modelo de 27.320.697.856 parámetros, de modo que pueda ejecutarse en hardware de consumo. La model card del autor describe el proceso como una publicación mediante el módulo "Model Hub" de Sigma Studio y lo presenta como un modelo "production-ready" para razonamiento avanzado, especialización de dominio y refactorización de código.

El modelo conserva la arquitectura CausalLM del Qwen3.8-27B original, con una ventana de contexto declarada de 32.768 tokens. La cuantización IQ2_XXS es extremadamente agresiva: reduce los pesos a aproximadamente 2 bits por parámetro, lo que sitúa el repositorio en 10,6 GB y permite, según el autor, un offload completo en GPU con unos 23,4 GB de VRAM o una ejecución híbrida CPU/GPU con unos 21,9 GB de RAM. Es relevante ahora porque permite probar un modelo de escala 27B en tarjetas de 24 GB, aunque a costa de una pérdida de calidad que el propio autor reconoce implícitamente al reportar resultados irregulares en sus benchmarks.

La ficha debe leerse con cautela: la información procede casi exclusivamente de la model card del autor, los benchmarks se midieron sobre porciones reducidas de los conjuntos de evaluación (el propio autor advierte que "no son comparables con una ejecución completa") y la licencia figura como "other", sin que la model card aclare los términos exactos. Los idiomas declarados son inglés e italiano, no castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer decoder-only, según la model card del autor) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF IQ2_XXS con imatrix (única variante publicada en este repo) |
| Idiomas soportados | en, it |
| Licencia | other (la model card muestra un badge Apache-2.0, pero el campo oficial es "other"; no se detallan términos) |
| Formato de pesos | GGUF (repo de 10,6 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, del que no se dispone de detalles de arquitectura interna en la información proporcionada más allá de la etiqueta "CausalLM" y del recuento de parámetros. No se especifican en la model card el número de capas, la dimensión oculta, el tipo de atención, la composición del dataset de preentrenamiento, el número de tokens vistos ni si hubo fases de RLHF, DPO o instrucción posteriores. Tampoco se documenta el proceso de destilación o ajuste que pudiera haber dado lugar al modelo base.

La innovación técnica de esta publicación concreta es la cuantización: se ha generado un GGUF IQ2_XXS asistido por imatrix, una matriz de importancia que pondera los pesos según su relevancia para minimizar el error de cuantización a 2 bits. El autor menciona además un motor propio, SigmaEngine, y un entorno de evaluación denominado Sigma Studio Training Lab, pero no se detalla su funcionamiento ni se publican scripts de conversión o de evaluación reproducibles más allá de un hash SHA256 de reproducibilidad. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional en inglés e italiano, según los idiomas declarados.
- Razonamiento de múltiples pasos: el autor distingue entre modo "No-Thinking" (respuesta directa) y "Deep Thinking" (cadena de razonamiento CoT).
- Generación de código: los benchmarks reportados incluyen HumanEval y MBPP con resultados altos, aunque sobre muestras pequeñas.
- Matemáticas: se reportan resultados en GSM8K y MATH.
- Tool calling y uso de agentes: el autor evalúa "Tool Protocol Adherence" y contención en un sandbox, con resultados mixtos.
- Razonamiento científico y de sentido común: evaluado con ARC-Challenge, HellaSwag y BIG-Bench Hard.
- Capacidades multilingües limitadas a inglés e italiano; no se declara soporte de castellano.
- No se declara soporte de visión, audio ni otras modalidades.

## Casos de uso

- Prototipado rápido en GPU de consumo: con 10,6 GB de pesos y unos 23,4 GB de VRAM para offload completo, permite probar un modelo de 27B en una RTX 3090 o 4090 antes de decidir si merece la pena desplegar la versión completa en FP16 o en cuantizaciones mayores.
- Evaluación de calidad de cuantizaciones: útil como referencia para medir cuánto degrada IQ2_XXS respecto al modelo base en tareas concretas de código o matemáticas, comparando con otras cuantizaciones del mismo Qwen3.8-27B.
- Generación de código en entornos con memoria limitada: los resultados reportados en HumanEval (7/7) y MBPP (8/9) sugieren que puede usarse para autocompletar o refactorizar código Python en estaciones de trabajo sin GPU de datacenter, siempre validando la salida con tests.
- Asistente conversacional en inglés o italiano: para aplicaciones de chat multi-turno con contexto de hasta 32.768 tokens, aunque la ventana efectiva a 2 bits puede degradarse.
- Razonamiento matemático de nivel escolar y competición ligera: GSM8K y MATH muestran resultados razonables en la muestra evaluada, adecuados para tutoría o generación de problemas resueltos.
- Experimentación con agentes y tool calling en sandbox: el autor documenta un protocolo de evaluación de herramientas; sirve para probar pipelines de agentes en local antes de escalar a modelos mayores.
- Investigación sobre cuantización extrema: como objeto de estudio de cómo se comporta un modelo de 27B a 2 bits en tareas de razonamiento versus tareas de conocimiento factual (MMLU 64%, GPQA 22%).

## Benchmarks y rendimiento

Los datos provienen de la model card del autor y se midieron sobre porciones reducidas de cada suite (el propio autor advierte que no son comparables con ejecuciones completas). Temperatura 0.0, semilla 42, hash de reproducibilidad SHA256-5DFF448CC034C813.

| Benchmark | Resultado | Muestra | Estado declarado |
|---|---|---|---|
| ARC-Challenge | 100% | 9/9 | Passed |
| BIG-Bench Hard | 100% | 7/7 | Passed |
| GPQA | 22% | 2/9 | Low |
| GSM8K | 89% | 8/9 | Passed |
| HellaSwag | 67% | 6/9 | Fair |
| HumanEval (pass@1) | 100% | 7/7 | Passed |
| MATH | 78% | 7/9 | Passed |
| MBPP | 89% | 8/9 | Passed |
| MMLU | 64% | 9/14 | Fair |
| MMLU-Pro | 56% | 5/9 | Fair |
| TruthfulQA | 78% | 7/9 | Passed |
| Total agregado | 75% | 75/100 | 75% Pass |

Comparativa de modos de razonamiento declarada por el autor:

| Modo | Precisión | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 80,7% | 46/57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 67,4% | 29/43 | Traza de razonamiento multi-paso; delta de -13,3% frente a No-Thinking |

Evaluación de agentes y tool calling en sandbox:

| Métrica | Resultado | Detalle |
|---|---|---|
| Tool Protocol Adherence | 75,0% | 0/92 criterios analíticos verificados |
| Autonomous Task Completion | 0,0% | 0/1 escenarios completados con el fichero objetivo exacto |
| Sandbox Jail Containment | 100% compliant | Sin intentos de escape del workspace |
| Execution Efficiency | 0 turnos (0,0 s) | Uso óptimo de turnos y tokens declarado |

No se han publicado resultados de benchmarks completos ni comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 23,4 GB para offload completo en GPU según el autor; unos 21,9 GB de RAM en modo CPU/híbrido.
- GPU recomendadas por el autor: RTX 3090 o RTX 4090 (24 GB de VRAM). Cualquier GPU con 24 GB o más debería poder alojar el modelo completo; con menos VRAM habrá que recurrir a offload parcial.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 y en tarjetas de 24 GB en general. En GPUs de 16 GB o menos requerirá offload a RAM y la latencia aumentará de forma notable.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF; el autor menciona endpoints compatibles y su propio SigmaEngine. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles. El autor solo indica que el modo No-Thinking ofrece "token-to-first-byte inmediato" sin cuantificar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks completos ni de comparaciones oficiales con otros modelos en la información proporcionada. La siguiente tabla recoge únicamente lo que puede afirmarse con los datos disponibles:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_XXS | 27,3B | 32.768 | IQ2_XXS (GGUF) | other | Hugging Face, 758 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27,3B | no disponible en esta ficha | pesos originales | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base | 27,3B | 32.768 | GGUF de mayor precisión | según autor | no disponible en esta búsqueda |

No se han identificado en la información disponible alternativas de otros desarrolladores comparables en tamaño y tarea con datos verificables.

## Limitaciones y advertencias

- La cuantización IQ2_XXS es extremadamente agresiva (aproximadamente 2 bits por parámetro); es esperable una degradación notable de calidad frente al modelo base, especialmente en conocimiento factual (GPQA 22%, MMLU 64%) y en tareas que requieren precisión numérica.
- Los benchmarks publicados se midieron sobre muestras muy pequeñas (9 o 14 preguntas por suite) y el propio autor advierte que no son comparables con ejecuciones completas. No deben usarse para decisiones de producción.
- El resultado de agentes es contradictorio: 75% de adherencia al protocolo de herramientas pero 0% de completitud autónoma de tareas y 0 turnos de eficiencia, lo que sugiere que la evaluación no llegó a ejecutar el flujo completo.
- El modo Deep Thinking rinde peor que el modo directo en la evaluación del autor (-13,3%), lo que cuestiona la utilidad del razonamiento explícito en esta cuantización.
- Idiomas declarados: inglés e italiano. No hay soporte declarado de castellano; el rendimiento en español no está documentado.
- Licencia "other": la model card muestra un badge Apache-2.0, pero el campo oficial es "other" y no se detallan los términos. Antes de uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B y la del propio repositorio.
- Riesgo de alucinación: no cuantificado de forma fiable; TruthfulQA reporta 78% sobre 9 preguntas, muestra insuficiente para extraer conclusiones.
- La model card contiene metadatos inconsistentes (formato de pesos "Sconosciuto", huella en disco "0.0 GB", VRAM y RAM declaradas que no cuadran con el tamaño del repo de 10,6 GB), lo que reduce la fiabilidad de la documentación.
- No se documentan sesgos conocidos ni se publican evaluaciones de seguridad o toxicidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_XXS
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Sigma Studio en GitHub: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
- Licencia Apache-2.0 referenciada en el badge: https://opensource.org/licenses/Apache-2.0
