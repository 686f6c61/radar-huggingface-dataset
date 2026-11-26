# sigmanih/Qwen-Qwen3-0.6B-GGUF-Q6_K

## Resumen

Qwen-Qwen3-0.6B-GGUF-Q6_K es una cuantizacion en formato GGUF (Q6_K) del modelo base Qwen/Qwen3-0.6B, publicada por el usuario sigmanih a traves de su herramienta Sigma Studio. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos del modelo original de Qwen (Alibaba) a un formato optimizado para inferencia en CPU y GPU de gama baja. El modelo base pertenece a la familia Qwen3, con arquitectura CausalLM y una ventana de contexto declarada de 32.768 tokens.

El interes practico de esta publicacion radica en su tamano: con aproximadamente 751 millones de parametros totales (0,6B activos segun la model card) y un peso en disco de unos 0,6 GB, es desplegable en hardware muy modesto, desde GPUs de consumo con 6-8 GB de VRAM hasta entornos CPU-only. La model card declara un consumo de aproximadamente 1,3 GB de VRAM con offload completo a GPU y unos 1,1 GB de RAM en modo CPU o hibrido.

La relevancia es limitada pero concreta: sirve como modelo de referencia para prototipado rapido, agentes de voz en tiempo real, entornos edge y pruebas de pipelines de inferencia donde no se dispone de hardware dedicado. Conviene senalar que la model card mezcla datos en ingles e italiano, incluye una licencia declarada como "other" pese a mostrar un badge de Apache-2.0, y presenta resultados de benchmark medidos sobre un subconjunto reducido de cada suite, por lo que no son comparables con ejecuciones completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer decoder-only, familia Qwen3) |
| Parametros totales | 751.632.384 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun model card) |
| Tipos de cuantizacion | Q6_K (unica variante publicada en este repo) |
| Idiomas soportados | en, it (segun metadatos del repo) |
| Licencia | other (la model card muestra badge Apache-2.0, discrepancia no resuelta) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,6 GB |
| Modelo base | Qwen/Qwen3-0.6B |
| Pipeline | text-generation |
| VRAM estimada (offload total GPU) | ~1,3 GB |
| RAM estimada (CPU/hibrido) | ~1,1 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion Q6_K del Qwen3-0.6B original. La arquitectura subyacente es un transformer decoder-only de tipo CausalLM, propia de la familia Qwen3, con 751.632.384 parametros totales. No se dispone de informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento; esos datos corresponden al modelo original de Qwen y no se reproducen en esta publicacion.

La innovacion tecnica de esta publicacion es exclusivamente la cuantizacion a Q6_K mediante la herramienta Sigma Studio (modulo Model Hub), que produce un artefacto GGUF listo para motores de inferencia compatibles. La model card menciona un "SigmaEngine" para aceleracion GPU y un "Training Lab" para evaluacion, pero no documenta cambios en los pesos mas alla de la conversion de formato. No se declara decodificacion especulativa, atencion lineal ni otras modificaciones arquitectonicas.

## Capacidades

- Generacion de texto conversacional en ingles e italiano, segun los metadatos del repositorio.
- Razonamiento basico y respuesta directa; la model card distingue entre modo "No-Thinking" (respuesta directa) y "Deep Thinking" (cadena de razonamiento CoT).
- Aritmetica de varios pasos: la evaluacion interna reporta 8/9 en GSM8K sobre la muestra evaluada.
- Generacion de codigo Python limitada: 2/7 en HumanEval y 5/9 en MBPP sobre las muestras evaluadas.
- Conocimiento general acotado: 4/14 en MMLU sobre la muestra evaluada.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes multi-paso, vision, audio ni otras modalidades.
- Capacidad multilingue limitada a los idiomas declarados (en, it); el castellano no figura entre los idiomas soportados.

## Casos de uso

- Prototipado rapido de chatbots: con ~1,3 GB de VRAM y contexto de 32.768 tokens, permite levantar un servicio conversacional en una GPU de 6-8 GB o incluso en CPU para validar flujos antes de migrar a un modelo mayor.
- Agentes de voz en tiempo real en entornos edge: la model card recomienda explicitamente este uso; el reducido footprint y la latencia baja en decodificacion (389,1 tok/s en una RTX 5070 Ti, medida de un solo stream) lo hacen apto para respuestas inmediatas en dispositivos con recursos limitados.
- Procesamiento de texto en movil o dispositivos sin GPU: el modo CPU/hibrido con ~1,1 GB de RAM permite ejecutar el modelo en portatiles modestos o sistemas embebidos con llama.cpp u Ollama.
- Clasificacion y extraccion de informacion en lotes: para tareas de etiquetado simple, resumen corto o extraccion de campos en documentos en ingles o italiano, el coste por token es minimo y el throughput agregado declarado (434,8 tok/s con varias peticiones en vuelo) permite procesar volumenes moderados.
- Filtrado y preprocesado en pipelines de datos: util como primer paso barato para normalizar, deduplicar semanticamente o generar metadatos antes de pasar a un modelo mayor.
- Educacion y demostraciones: su tamano permite desplegarlo en aulas, talleres o entornos de formacion donde no hay acceso a GPUs de datacenter, ilustrando el funcionamiento de un LLM cuantizado de extremo a extremo.
- Pruebas de integracion de motores de inferencia: sirve como modelo de referencia para validar compatibilidad con vLLM, llama.cpp, Ollama o TGI antes de desplegar modelos de mayor tamano.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la evaluacion interna declarada en la model card, medida sobre subconjuntos reducidos de cada suite (entre 7 y 14 preguntas por dataset), con temperatura 0,0 y semilla 42. No son comparables con ejecuciones sobre el conjunto completo.

| Benchmark | Correctas / total | Precision |
|---|---|---|
| ARC-Challenge | 5 / 9 | 56% |
| BIG-Bench Hard | 4 / 7 | 57% |
| GPQA | 0 / 9 | 0% |
| GSM8K | 8 / 9 | 89% |
| HellaSwag | 4 / 9 | 44% |
| HumanEval (pass@1) | 2 / 7 | 29% |
| MATH | 6 / 9 | 67% |
| MBPP | 5 / 9 | 56% |
| MMLU | 4 / 14 | 29% |
| MMLU-Pro | 0 / 9 | 0% |
| TruthfulQA | 8 / 9 | 89% |
| Total agregado | 46 / 100 | 46% |

Comparativa de modos de ejecucion declarada por el autor:

| Modo | Precision | Preguntas superadas |
|---|---|---|
| No-Thinking (respuesta directa) | 49,1% | 28 / 57 |
| Deep Thinking (CoT) | 41,9% | 18 / 43 |

Rendimiento medido en una NVIDIA GeForce RTX 5070 Ti (15,9 GB VRAM):

| Metrica | Valor |
|---|---|
| Decodificacion de un solo stream | 389,1 tok/s |
| Procesamiento de prompt | 1.812 tok/s |
| Throughput agregado durante evaluacion | 434,8 tok/s |

## Requisitos de hardware

- VRAM estimada: ~1,3 GB con offload completo a GPU; ~1,1 GB de RAM en modo CPU o hibrido.
- GPU recomendadas segun el autor: cualquier GPU con 6-8 GB de VRAM; el rendimiento medido se obtuvo en una RTX 5070 Ti.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090, etc.), y tambien en CPU con 16 GB de RAM de sistema.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y el propio Sigma Studio; el formato GGUF es compatible con los motores basados en llama.cpp.
- Latencia y throughput: 389,1 tok/s en decodificacion de un solo stream y 1.812 tok/s en procesamiento de prompt, medidos en una RTX 5070 Ti. No se han medido velocidades en otro hardware y el autor advierte explicitamente contra extrapolar estas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Qwen3-0.6B-GGUF-Q6_K (este) | 0,6B | 32.768 | other (badge Apache-2.0 en card) | GGUF Q6_K | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6B | 32.768 | no disponible en la informacion | safetensors | Hugging Face |
| Otros modelos de ~0,5B-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros modelos en la informacion proporcionada; los resultados de la tabla anterior proceden de subconjuntos reducidos y no permiten una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- Precision baja en conocimiento general y razonamiento avanzado: 29% en MMLU, 0% en MMLU-Pro y 0% en GPQA sobre las muestras evaluadas.
- Generacion de codigo debil: 29% en HumanEval (pass@1) sobre la muestra evaluada.
- Riesgo elevado de alucinacion en dominios especializados; el 89% en TruthfulQA sobre 9 preguntas no es evidencia suficiente para descartarlo.
- El modo Deep Thinking (CoT) rinde peor que la respuesta directa en la evaluacion del autor (41,9% frente a 49,1%), un delta de -7,3 puntos.
- Los benchmarks se midieron sobre 7-14 preguntas por suite, no sobre el conjunto completo; el propio autor advierte que las puntuaciones no son comparables con ejecuciones completas.
- Idiomas soportados limitados a ingles e italiano; no se declara castellano.
- Discrepancia de licencia: los metadatos indican "other" mientras la model card muestra un badge Apache-2.0. Antes de un uso comercial debe verificarse la licencia real del modelo base Qwen/Qwen3-0.6B.
- La model card contiene texto en italiano mezclado con ingles y campos con valores inconsistentes (por ejemplo, formato de pesos "Sconosciuto" y footprint en disco "0.0 GB"), lo que reduce la fiabilidad de la documentacion.
- No se documenta soporte de tool calling ni de flujos de agentes multi-paso.
- Las cifras de velocidad corresponden a una unica maquina (RTX 5070 Ti) y no deben extrapolarse a otro hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen3-0.6B-GGUF-Q6_K
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
- Licencia Apache-2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
