# sigmanih/ornith-ai-Ornith-1.5-35B-A3B-GGUF-Q8_0

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo causal (CausalLM) publicado por ornith-ai y distribuido en formato GGUF cuantizado a Q8_0 por el usuario sigmanih mediante la herramienta Sigma Studio. El repositorio contiene una versión lista para inferencia local del modelo base, con un tamano total de parametros de 35.505.251.456 (aproximadamente 35,5 mil millones) y una ventana de contexto declarada de 32.768 tokens. La nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parametros activos, aunque este dato no se confirma explicitamente en la informacion disponible.

El modelo esta orientado a generacion de texto conversacional y razonamiento multi-paso, con enfasis declarado en matematicas, investigacion profunda y codigo. Incorpora un modo de razonamiento explicito (Deep Thinking, con traza de cadena de pensamiento) frente a un modo directo sin sobrecoste de tokens. Los idiomas declarados son ingles e italiano, lo que limita su uso multilingue fuera de ese par.

La relevancia practica de esta ficha reside en que se trata de una cuantizacion Q8_0 de casi 38 GB, pensada para despliegue en configuraciones de multiples GPU o sistemas con mucha RAM. Los resultados de benchmarks publicados por el autor se han medido sobre subconjuntos parciales de cada suite, por lo que no son directamente comparables con evaluaciones completas de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer causal; posible MoE segun nomenclatura A3B, no confirmado) |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3 B activos, sin confirmacion) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (este repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | en, it |
| Licencia | other (el autor muestra badge Apache-2.0, pero el campo de licencia del Hub es "other") |
| Formato de pesos | GGUF (cuantizacion Q8_0) |
| Tamano del repositorio | 37,8 GB |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-09 |
| Ultima actualizacion | 2026-11-02 |

## Arquitectura y entrenamiento

La informacion disponible identifica la arquitectura base como CausalLM, es decir, un transformer autoregresivo con atencion causal. El sufijo "A3B" en el nombre del modelo es consistente con un diseno de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parametros activos por token sobre un total de 35,5 mil millones, pero la model card no detalla la configuracion de expertos, el numero de capas, las dimensiones ocultas ni el mecanismo de enrutamiento. tampoco se especifican detalles sobre atencion lineal, decodificacion especulativa ni otras optimizaciones de inferencia.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre la receta de alineacion. La unica innovacion tecnica documentada es la existencia de dos modos operativos: respuesta directa (No-Thinking) y razonamiento explicito con cadena de pensamiento (Deep Thinking CoT). Esta cuantizacion concreta ha sido generada y evaluada con Sigma Studio, herramienta que no aporta informacion sobre el entrenamiento del modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles e italiano.
- Razonamiento de tipo cadena de pensamiento activable (modo Deep Thinking) para problemas de logica y matematicas.
- Modo de respuesta directa sin tokens de razonamiento, orientado a baja latencia.
- Resolucion de problemas matematicos de nivel escolar y de competicion (GSM8K, MATH).
- Generacion de codigo Python con soporte de ejecucion de tests (HumanEval, MBPP).
- Razonamiento cientifico y de sentido comun (ARC-Challenge, HellaSwag, BIG-Bench Hard).
- Evaluacion de factualidad y resistencia a alucinacion (TruthfulQA).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning: parcialmente implicito por el modo CoT, sin documentacion de integracion agentica.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues limitadas a en e it.

## Casos de uso

- Razonamiento matematico asistido: el modelo obtiene 89% en GSM8K y 78% en MATH sobre los subconjuntos evaluados, por lo que resulta adecuado para tutoria de matematicas y resolucion guiada paso a paso activando el modo Deep Thinking.
- Generacion y revision de codigo Python: con 86% en HumanEval y 67% en MBPP en las muestras evaluadas, puede integrarse en pipelines de revision de parches o generacion de tests unitarios, siempre con validacion humana.
- Asistente conversacional en italiano e ingles: el soporte nativo de ambos idiomas permite desplegar atencion al cliente o asistencia interna para esos mercados sin capa de traduccion intermedia.
- Investigacion documental multi-paso: el modo CoT estructurado facilita tareas de descomposicion de preguntas complejas y sintesis de conclusiones, util en entornos de analisis tecnico.
- Evaluacion de factualidad en contenidos: su 89% en TruthfulQA sobre la muestra evaluada lo hace util como filtro preliminar de afirmaciones en revisiones editoriales, aunque no sustituye verificacion externa.
- Despliegue local en estaciones de trabajo con multiples GPU: al distribuirse como GGUF Q8_0 de 37,8 GB, encaja en servidores con 2×24 GB de VRAM o equipos con 64 GB de RAM para prototipado sin dependencia de la nube.
- Razonamiento cientifico de nivel escolar: el 89% en ARC-Challenge lo hace apropiado para herramientas educativas de ciencias en ingles e italiano.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre subconjuntos parciales de cada suite (temperatura 0.0, semilla 42). No son comparables con ejecuciones completas de referencia.

| Benchmark | Correctas / Total | Precision | Estado declarado |
|---|---|---|---|
| ARC-Challenge | 8 / 9 | 89% | Passed |
| BIG-Bench Hard | 6 / 7 | 86% | Passed |
| GPQA | 3 / 9 | 33% | Low |
| GSM8K | 8 / 9 | 89% | Passed |
| HellaSwag | 5 / 9 | 56% | Fair |
| HumanEval | 6 / 7 | 86% | Passed |
| MATH | 7 / 9 | 78% | Passed |
| MBPP | 6 / 9 | 67% | Fair |
| MMLU | 7 / 14 | 50% | Fair |
| MMLU-Pro | 6 / 9 | 67% | Fair |
| TruthfulQA | 8 / 9 | 89% | Passed |
| Total agregado | 70 / 100 | 70% | 70% Pass |

Comparativa de modos de ejecucion:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (directo) | 70,2% | 40 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 69,8% | 30 / 43 | Traza de razonamiento multi-paso, delta de -0,4% |

Rendimiento medido en una NVIDIA GeForce RTX 5070 Ti (15,9 GB de VRAM): 37,4 tok/s en decodificacion de un solo flujo, 171 tok/s en procesamiento de prompt y 36,8 tok/s de throughput agregado durante la evaluacion. El autor advierte explicitamente que estas cifras no deben extrapolarse a otro hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30,2 GB con offload completo en GPU; aproximadamente 28,3 GB de RAM en modo CPU/hibrido, segun el autor.
- GPU recomendadas: configuracion multi-GPU (2×24 GB, por ejemplo 2×RTX 4090 o A100 40 GB), o una RTX 6000; sistemas con 64 GB de RAM para modo hibrido.
- Cabe en GPU de consumo: no en una sola tarjeta de 24 GB; requiere reparto entre dos GPU o descarga parcial a RAM. La medicion del autor en una RTX 5070 Ti de 15,9 GB implica offload parcial.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; Sigma Studio / SigmaEngine segun el autor; vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput: 37,4 tok/s en decodificacion mono-flujo y 171 tok/s en prefill sobre RTX 5070 Ti; no hay mediciones en otro hardware.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La tabla siguiente recoge unicamente la comparacion estructural con el modelo base del que deriva esta cuantizacion.

| Aspecto | Ornith-1.5-35B-A3B (base) | Este repositorio (GGUF Q8_0) |
|---|---|---|
| Parametros | 35,5 B | 35,5 B (sin cambios) |
| Contexto | 32.768 tokens | 32.768 tokens |
| Formato | no disponible (probablemente safetensors) | GGUF Q8_0 |
| Tamano en disco | no disponible | 37,8 GB |
| Licencia | no disponible | other |
| Uso | Entrenamiento / conversion | Inferencia local |

Alternativas de mismo tamano o tarea: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a ingles e italiano; el rendimiento fuera de ese par no esta documentado y probablemente es deficiente.
- GPQA con 33% y MMLU con 50% sobre muestras pequenas indican capacidad limitada en razonamiento academico de posgrado y conocimiento general amplio.
- Los benchmarks se han medido sobre subconjuntos parciales (entre 7 y 14 preguntas por suite); los intervalos de confianza son muy amplios y las cifras no deben tratarse como comparables con evaluaciones completas.
- El modo Deep Thinking no mejora al modo directo en la evaluacion publicada (delta de -0,4%), lo que sugiere que el razonamiento explicito no aporta ventaja medible en estas muestras.
- Riesgo de alucinacion: no se documentan mecanismos especificos de mitigacion mas alla del 89% en TruthfulQA sobre 9 preguntas; en produccion se requiere verificacion externa.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia: el campo del Hub indica "other" mientras la model card muestra un badge Apache-2.0; esta discrepancia debe resolverse antes de cualquier uso comercial. No se garantiza uso comercial libre.
- La model card contiene datos inconsistentes (formato de pesos descrito como "Sconosciuto", huella en disco "0.0 GB", parametros activos "35B"), lo que reduce la fiabilidad de la documentacion del autor.
- El repositorio tiene 281 descargas y 1 like, con muy poca validacion comunitaria; no hay evidencia independiente de calidad.
- El contexto de 32.768 tokens es moderado y limita tareas de documentos largos frente a modelos con ventanas de 128K o superiores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/ornith-ai-Ornith-1.5-35B-A3B-GGUF-Q8_0
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
- Licencia Apache 2.0 (referenciada en la model card): https://opensource.org/licenses/Apache-2.0
