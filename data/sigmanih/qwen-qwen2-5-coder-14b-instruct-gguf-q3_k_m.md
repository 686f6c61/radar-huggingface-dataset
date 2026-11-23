# sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q3_K_M

## Resumen

Qwen2.5-Coder-14B-Instruct es un modelo de lenguaje especializado en generación de código desarrollado por el equipo Qwen de Alibaba. Esta ficha documenta la cuantización GGUF Q3_K_M publicada por el usuario sigmanih bajo el paraguas de su proyecto Sigma Studio, que redistribuye los pesos originales en formato GGUF de 3 bits para reducir los requisitos de memoria. El modelo base resuelve tareas de generación y completado de código, razonamiento matemático, instrucciones conversacionales y uso de herramientas, y su relevancia actual radica en que permite ejecutar un modelo de 14.770 millones de parámetros en GPUs de consumo con 12-16 GB de VRAM.

La arquitectura del modelo base es un transformer causal denso (CausalLM) con una ventana de contexto de 32.768 tokens. Esta versión concreta pesa 7,3 GB en el repositorio y, según la model card del redistribuidor, requiere aproximadamente 12,4 GB de VRAM para descarga completa en GPU o unos 11,5 GB de RAM en modo CPU/híbrido. La cuantización Q3_K_M introduce pérdida de precisión respecto al modelo original en BF16, por lo que conviene evaluar su impacto antes de usarla en producción.

Es importante señalar que esta publicación no es un modelo nuevo ni un fine-tuning: es una conversión de pesos del checkpoint oficial Qwen/Qwen2.5-Coder-14B-Instruct. La licencia declarada es "other" y la model card incluye una insignia de Apache-2.0 que no coincide con el campo de licencia del repositorio, una discrepancia que debe resolverse consultando la licencia del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (CausalLM) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF Q3_K_M (3 bits, variante K-quant media) |
| Idiomas soportados | en, it (declarados en el repositorio); el modelo base Qwen2.5-Coder soporta multilingue, no detallado aqui |
| Licencia | other (la model card muestra una insignia Apache-2.0 que no coincide con el campo del repositorio) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 7,3 GB |
| VRAM estimada (offload completo) | ~12,4 GB |
| RAM estimada (CPU/hibrido) | ~11,5 GB |
| Fecha de creacion | 2026-09-07 |
| Ultima actualizacion | 2026-11-02 |
| Descargas | 450 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer causal denso de la familia Qwen2.5-Coder, con 14.770 millones de parametros y una ventana de contexto de 32.768 tokens. La model card del redistribuidor no aporta informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o instruction tuning mas alla de la designacion "Instruct" del checkpoint original. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal en esta publicacion.

El unico proceso tecnico documentado en esta ficha es la cuantizacion a GGUF Q3_K_M realizada por sigmanih mediante el modulo Model Hub de Sigma Studio. No se detalla la herramienta de conversion (llama.cpp u otra), ni el metodo de calibracion de la cuantizacion, ni si se preservaron las capas de embeddings y output en mayor precision. La model card incluye ademas una seccion de evaluacion ejecutada con "SigmaEngine Direct GPU" con semilla 42 y temperatura 0,0, pero no describe el pipeline de entrenamiento del modelo base.

## Capacidades

- Generacion y completado de codigo en multiples lenguajes, con enfasis en Python segun los benchmarks reportados.
- Razonamiento matematico multi-paso, con resultados altos en GSM8K y MATH en la evaluacion del redistribuidor.
- Respuesta conversacional a instrucciones (checkpoint Instruct).
- Modo de razonamiento comparado en la model card: "No-Thinking" (respuesta directa) frente a "Deep Thinking" (cadena de pensamiento), con una diferencia de -6,8 % a favor del modo directo en la evaluacion reportada.
- Uso de herramientas: la model card reporta un 77,2 % de adherencia al protocolo de herramientas en un sandbox, aunque con 0 % de finalizacion autonoma de tareas.
- Capacidades multilingues limitadas en esta publicacion a ingles e italiano segun los metadatos del repositorio.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Asistente de codigo en local para desarrolladores con GPU de 12-16 GB: el modelo cabe con offload completo segun la VRAM estimada (~12,4 GB), lo que permite autocompletado y explicacion de codigo sin depender de APIs externas.
- Generacion de tests unitarios en Python: los resultados reportados en MBPP (100 % en la muestra evaluada) y HumanEval (86 %) sugieren utilidad para generar pruebas a partir de firmas de funciones, siempre validando la salida.
- Prototipado rapido de scripts y utilidades CLI: el contexto de 32.768 tokens permite incluir varios ficheros de un proyecto pequeno en el prompt para tareas de refactorizacion acotada.
- Educacion y tutoria de programacion: el modo "No-Thinking" ofrece baja latencia para respuestas directas en un chatbot de ensenanza, con la salvedad de que la evaluacion de MMLU (43 %) indica conocimiento general limitado.
- Automatizacion de tareas de agente con herramientas registradas: la adherencia del 77,2 % al protocolo de herramientas permite integrarlo en bucles de agente simples, aunque el 0 % de finalizacion autonoma reportado obliga a supervision humana.
- Despliegue en entornos con RAM limitada: el modo CPU/hibrido con ~11,5 GB de RAM permite ejecutarlo en estaciones de trabajo sin GPU dedicada, a costa de latencia mayor.
- Traduccion tecnica y documentacion entre ingles e italiano, unicos idiomas declarados en el repositorio.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del redistribuidor y fueron medidos sobre una muestra parcial de cada suite, no sobre el conjunto completo. La propia model card advierte que la puntuacion no es comparable con una ejecucion completa.

| Benchmark | Dominio | Aciertos / total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89 % |
| BIG-Bench Hard | Logica y simbolismo multitarea | 5 / 7 | 71 % |
| GPQA | Razonamiento academico de posgrado | 3 / 9 | 33 % |
| GSM8K | Matematicas escolares multi-paso | 9 / 9 | 100 % |
| HellaSwag | Sentido comun y NLI situacional | 5 / 9 | 56 % |
| HumanEval | Codigo Python (pass@1) | 6 / 7 | 86 % |
| MATH | Matematicas de competicion | 8 / 9 | 89 % |
| MBPP | Programacion Python con tests | 9 / 9 | 100 % |
| MMLU | Conocimiento general multi-materia | 6 / 14 | 43 % |
| MMLU-Pro | Razonamiento avanzado multi-paso | 3 / 9 | 33 % |
| TruthfulQA | Factualidad y anti-alucinacion | 7 / 9 | 78 % |
| Total | Todas las suites evaluadas | 69 / 100 | 69 % |

| Modo de ejecucion | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 71,9 % | 41 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 65,1 % | 28 / 43 | Traza de razonamiento multi-paso, delta de -6,8 % |

Protocolo declarado: code_execution, continuation_logprob, cot_generation, letter_logprob; temperatura 0,0; semilla 42; hash de reproducibilidad SHA256-9FB5093BE8146218. No se han publicado resultados de benchmarks del modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~12,4 GB con offload completo en GPU; ~11,5 GB de RAM en modo CPU/hibrido.
- GPU recomendadas segun la model card: RTX 3060 o RTX 4070 (12-16 GB de VRAM) o sistemas con 32 GB de RAM.
- Cabe en GPU de consumo de 12 GB o mas; por debajo de 12 GB habria que recurrir a offload parcial de capas a CPU.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y servidores basados en llama.cpp; la model card menciona "endpoints_compatible" y "SigmaEngine", pero no detalla integracion con vLLM ni TGI (que normalmente requieren safetensors, no GGUF).
- Latencia y throughput: no disponibles. La model card solo describe cualitativamente el modo "No-Thinking" como de latencia minima, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct (original) | 14,77 B | 32.768 | safetensors (BF16) | Apache-2.0 (segun el ecosistema Qwen) | Referencia de calidad completa; requiere ~28-30 GB en BF16 |
| Esta publicacion (Q3_K_M) | 14,77 B | 32.768 | GGUF Q3_K_M | other (discrepancia con insignia Apache-2.0) | ~7,3 GB en disco, ~12,4 GB VRAM; perdida de precision por cuantizacion |
| Otras cuantizaciones GGUF del mismo base (Q4_K_M, Q5_K_M, Q8_0) | 14,77 B | 32.768 | GGUF | segun el publicador | No disponibles en la informacion proporcionada; Q4_K_M suele ser el punto de equilibrio habitual |
| Alternativas de tamano similar (p. ej. CodeLlama-13B-Instruct, DeepSeek-Coder-6.7B) | 6,7-13 B | variable | safetensors/GGUF | variable | No disponibles datos de rendimiento comparables en la informacion proporcionada |

No se dispone de datos de benchmarks del modelo original ni de alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- La cuantizacion Q3_K_M degrada la precision respecto al modelo en BF16; los benchmarks reportados corresponden a esta version cuantizada y a muestras parciales, no al modelo completo.
- La model card advierte explicitamente que las puntuaciones se midieron sobre un subconjunto del dataset y no son comparables con ejecuciones completas.
- GPQA (33 %) y MMLU-Pro (33 %) indican un rendimiento bajo en razonamiento academico avanzado; MMLU (43 %) sugiere conocimiento general limitado.
- La evaluacion de agente reporta 0 % de finalizacion autonoma de tareas y 0 de 92 criterios analiticos verificados, pese a un 77,2 % de adherencia al protocolo de herramientas; no es fiable para bucles autonomos sin supervision.
- El modo Deep Thinking (CoT) obtuvo peor resultado que el modo directo (-6,8 %) en la evaluacion reportada, lo que cuestiona el beneficio del razonamiento explicito en esta configuracion.
- Riesgo de alucinacion de codigo y APIs inexistentes: TruthfulQA al 78 % en una muestra de 9 preguntas no es evidencia suficiente de robustez.
- Idiomas declarados limitados a ingles e italiano en los metadatos del repositorio, aunque el modelo base Qwen2.5-Coder es multilingue; el castellano no figura entre los idiomas declarados.
- Discrepancia de licencia: el campo del repositorio indica "other" mientras la model card muestra una insignia Apache-2.0. Antes de uso comercial debe verificarse la licencia del modelo base Qwen/Qwen2.5-Coder-14B-Instruct.
- Publicacion de terceros con 450 descargas y 1 like; no es una publicacion oficial de Qwen y no hay garantia de mantenimiento.
- La model card contiene errores de formato y campos vacios (por ejemplo, "Weight Format: Sconosciuto", "Total Disk Footprint: 0.0 GB"), lo que reduce la fiabilidad de la documentacion tecnica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q3_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
- Licencia Apache-2.0 (referenciada en la insignia): https://opensource.org/licenses/Apache-2.0
