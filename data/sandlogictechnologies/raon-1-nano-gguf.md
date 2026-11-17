# SandLogicTechnologies/Raon-1-nano-GGUF

## Resumen

Raon-1-nano es un modelo de lenguaje denso desarrollado por KRAFTON AI, orientado a seguimiento de instrucciones, conversacion multi-turno y uso de herramientas (tool calling) en coreano e ingles. Se deriva de Raon-1 mini preview (30B-A4B) mediante poda MoE-a-denso y destilacion de conocimiento, con un total de 3.185.653.938 parametros reales, de los que aproximadamente 1.5B son efectivos (el resto corresponde a una tabla de embeddings por capa de 1.5B). Soporta una longitud de contexto de hasta 262.144 tokens.

Esta ficha corresponde especificamente a la version cuantizada en GGUF publicada por SandLogicTechnologies, pensada para inferencia local en Apple Silicon, GPUs NVIDIA y AMD, y CPU. El repositorio incluye cuatro variantes de cuantizacion (IQ3_M, IQ4_NL, IQ4_XS y Q6_K) que reducen el peso del modelo F16 de 5,95 GB a entre 2,16 GB y 2,51 GB.

La relevancia actual del modelo radica en su enfoque "on-device": combina una ventana de contexto muy amplia con un tamano contenido y licencia Apache 2.0, lo que permite desplegar asistentes bilingues coreano-ingles con capacidad de tool calling en hardware de consumo, sin depender de servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido denso (18 capas Raon Delta Attention + 6 capas Gated MLA) |
| Parametros totales | 3.185.653.938 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ3_M, IQ4_NL, IQ4_XS, Q6_K (GGUF) |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); modelo base en otros formatos segun KRAFTON/Raon-1-nano |

## Arquitectura y entrenamiento

Raon-1-nano emplea una arquitectura Transformer hibrida densa compuesta por 18 capas de Raon Delta Attention y 6 capas de Gated MLA (Multi-head Latent Attention con compuertas). El vocabulario es de 259.840 tokens. Aunque el recuento total de parametros es de 3,1B, el modelo declara 1,5B efectivos porque incluye una tabla de embeddings por capa de 1,5B de parametros; esto explica la diferencia entre ambos valores y conviene tenerlo en cuenta al estimar requisitos de memoria.

El entrenamiento parte de Raon-1 mini preview (30B-A4B), del que se obtiene mediante poda MoE-a-denso y destilacion de conocimiento. Sobre esa base se realizo un preentrenamiento continuado con 3 billones (3T) de tokens, seguido de un post-entrenamiento que combina supervised fine-tuning (SFT), on-policy distillation (OPD) desde Raon-1 mini preview y reinforcement learning (RL). El modelo esta disenado para operar en "thinking mode", con un modo de razonamiento habilitable mediante parametros de plantilla de chat.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking mode) activable.
- Seguimiento fiel de instrucciones y de contexto (instruction-following y context-following).
- Conversacion natural multi-turno, con especial solidez en coreano.
- Tool calling / function calling para tareas cotidianas (ofimatica, control de dispositivos).
- Razonamiento multi-paso orientado a agentes, con ajustes de muestreo recomendados distintos para tareas agenticas.
- Capacidades bilingues coreano-ingles, con rendimiento solido tambien en ingles.
- Conversaciones con persona y restricciones de preferencias (grounded y persona-based).
- Respuesta fundamentada en contexto suministrado (grounded question answering).
- Despliegue on-device en formatos GGUF, MLX y LiteRT-LM.

## Casos de uso

- Chatbots bilingues coreano-ingles: el modelo mantiene contexto conversacional multi-turno y esta entrenado especificamente para conversacion coreana, lo que lo hace adecuado para asistentes dirigidos a usuarios coreanos con soporte en ingles.
- Asistentes on-device en portatiles y equipos Apple Silicon: con cuantizaciones de 2,16-2,51 GB puede ejecutarse localmente sin servidor, lo que permite asistentes privados sin conexion.
- Herramientas de ofimatica y productividad: mediante tool calling puede automatizar tareas como programar reuniones o buscar en documentos e hilos de conversacion; el modelo reporta 49,2 en el benchmark interno Office Work Bench.
- Control de movil y escritorio: agentes basados en tool calling para ejecutar acciones sencillas sobre dispositivos.
- Question answering fundamentado: responde preguntas a partir de contexto suministrado respetando restricciones de persona y preferencias, util en sistemas RAG con documentos largos gracias a su ventana de 262.144 tokens.
- Experimentacion local y desarrollo: las variantes GGUF comprimidas permiten iterar en hardware limitado cuando el modelo F16 (5,95 GB) no cabe o resulta incomodo.
- Procesamiento de documentos extensos: la ventana nativa de 262.144 tokens permite analizar contratos, informes o transcripciones largas en una sola pasada sin troceado agresivo.

## Benchmarks y rendimiento

Resultados publicados por KRAFTON en la model card (evaluaciones propias o internas, sin comparativa numerica con otros modelos en la informacion disponible):

| Benchmark | Resultado |
|---|---|
| IFBench | 75,9 |
| Chatbot Korean (interno) | 91,0 |
| KMMLU-Redux | 50,9 |
| CLIcK | 65,2 |
| BFCL v4 (function calling general) | 56,3 |
| Office Work Bench (interno) | 49,2 |
| FACTS Grounding | 44,4 |
| PrefEval2 | 44,0 |

No se han publicado en la informacion disponible resultados comparativos frente a modelos similares con cifras de terceros.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: IQ3_M ~2,16 GB, IQ4_XS ~2,22 GB, IQ4_NL ~2,25 GB, Q6_K ~2,51 GB (pesos); anadir memoria para KV cache, que crece con la longitud de contexto.
- Contexto largo: con 262.144 tokens nativos, la KV cache puede dominar el consumo de memoria; conviene limitar `--ctx-size` (el ejemplo de la model card usa 65.536) segun la tarea.
- GPU recomendadas: el modelo esta pensado para Apple Silicon, GPUs NVIDIA y AMD y CPU; por su tamano cabe en GPUs de consumo, aunque la informacion no especifica modelos concretos (RTX 4090, A100, H100) ni cifras de latencia o throughput.
- Cabe en GPU de consumo: si, dado el tamano de las cuantizaciones (2-2,5 GB); los modelos concretos no estan detallados en la informacion disponible.
- Opciones de despliegue: llama.cpp (ejemplo oficial con `llama-cli`), asi como formatos MLX y LiteRT-LM para inferencia local; no se mencionan vLLM ni TGI en la informacion disponible.
- Ajustes recomendados: thinking mode activado; temperatura 0,1 con presence penalty 1,5 para chat general, conocimiento y seguimiento de instrucciones; temperatura 1,0 con presence penalty 0,0 para tareas agenticas y de codigo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria (tamano o tarea) con parametros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- Idiomas: solo coreano e ingles; no hay soporte declarado para castellano ni otros idiomas.
- Cuantizacion agresiva: IQ3_M introduce una perdida de precision mayor en tool use multi-paso y conversacion coreana matizada; para maxima fidelidad se recomienda Q6_K.
- Riesgo de alucinacion: no se documenta mitigacion especifica; como todo modelo generativo, puede producir respuestas incorrectas, especialmente en knowledge Q&A.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Contexto: aunque soporta 262.144 tokens, el rendimiento real en contextos muy largos no esta cuantificado en la informacion disponible.
- Licencia: Apache 2.0, permite uso comercial; verificar no obstante las condiciones del modelo base KRAFTON/Raon-1-nano.
- Produccion: el modelo esta disenado para thinking mode; desactivarlo puede degradar la calidad. El limite de salida incluye tanto el razonamiento como la respuesta final, por lo que debe ampliarse para respuestas largas.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente de cuantizaciones de terceros, no del autor original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SandLogicTechnologies/Raon-1-nano-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
