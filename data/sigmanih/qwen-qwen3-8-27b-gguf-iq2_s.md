# sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_S

## Resumen

Qwen-Qwen3.8-27B-GGUF-IQ2_S es una cuantizacion en formato GGUF, variante IQ2_S con imatrix, del modelo Qwen/Qwen3.8-27B. La publica el usuario sigmanih a traves de su herramienta Sigma Studio, y su objetivo es comprimir un modelo de 27.320.697.856 parametros (~27,3B) en un fichero de aproximadamente 10,71 GB que quepa en GPUs de consumo con 12-16 GB de VRAM. La model card declara una arquitectura denominada "qwen35", 65 capas de transformer, dimension oculta de 5120 y una ventana de contexto de 262.144 tokens.

El problema que aborda es el habitual de las cuantizaciones agresivas de 2 bits: acercar modelos de tamano medio-alto a hardware asequible (RTX 3060/4070, 32 GB de RAM) reduciendo el peso a menos de la mitad, a cambio de una perdida de fidelidad respecto al modelo original que el autor no cuantifica. El modelo se orienta a generacion de texto, razonamiento logico, especializacion de dominio y refactorizacion de codigo, y solo declara soporte para ingles e italiano.

La ficha debe leerse con cautela. El identificador del modelo base no sigue la nomenclatura publicada de la familia Qwen3, la licencia figura como "other" en los metadatos de HuggingFace mientras el README muestra una insignia Apache-2.0, y todos los resultados de benchmarks son autoevaluaciones del publicador sobre recortes de 100 preguntas, sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | "qwen35" (transformer, segun la model card); 65 capas, dimension oculta 5120 |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible como dato verificado; la model card declara 27B activos, lo que apunta a un modelo denso y no a un MoE, pero no se confirma |
| Longitud de contexto | 262.144 tokens (declarados) |
| Tipos de cuantizacion | GGUF IQ2_S (generada con imatrix); no se listan otras variantes en la informacion disponible |
| Idiomas soportados | ingles (en) e italiano (it) |
| Licencia | "other" en los metadatos de HuggingFace; el README muestra la insignia Apache-2.0 (contradiccion sin resolver) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 11,5 GB |
| Huella en disco del fichero cuantizado | 10,71 GB |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-12 |
| Descargas / likes | 887 / 1 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe el proceso de entrenamiento del modelo base: no hay datos sobre numero de tokens, composicion del dataset, fases de RLHF, DPO u otras tecnicas de alineamiento. Lo unico declarado es la arquitectura "qwen35" con 65 capas de transformer, dimension oculta 5120 y una ventana de contexto de 262.144 tokens, cifra que implicaria atencion con mecanismos de eficiencia para sostener esa longitud, aunque el detalle no se especifica.

El trabajo del autor en este repositorio es exclusivamente de cuantizacion, no de entrenamiento. El tag `imatrix` indica que la cuantizacion IQ2_S se genero usando una matriz de importancia, una tecnica de llama.cpp que pondera los pesos segun su relevancia para reducir el dano en precisiones muy bajas. No se documenta que dataset de calibracion se uso para construir esa matriz, ni se ofrecen mediciones de perplejidad o divergencia respecto a los pesos originales en FP16/BF16.

## Capacidades

- Generacion de texto conversacional en ingles e italiano, con pipeline declarado de `text-generation`.
- Razonamiento logico y de sentido comun: la autoevaluacion reporta 86% en BIG-Bench Hard y 78% en HellaSwag.
- Codigo en Python: 100% en HumanEval (7/7 preguntas) y 56% en MBPP (5/9), segun los datos del propio publicador.
- Matematicas de nivel escolar y de competicion limitada: 89% en GSM8K y 67% en MATH.
- Modo de razonamiento explicito (chain-of-thought) y modo directo sin tokens de razonamiento, conmutables; el autor reporta que el modo directo rinde mejor en su propia evaluacion.
- Tool calling segun la model card, con "tool grounding" declarado sobre esquemas registrados; el propio panel de resultados muestra contradicciones internas en esta metrica (vease la seccion de benchmarks).
- Contexto largo de hasta 262.144 tokens declarados, adecuado en teoria para documentos extensos y conversaciones multi-turno largas.
- Sin capacidades multimodales, de audio ni de vision declaradas.
- No hay evidencia de soporte multilingue mas alla del ingles y el italiano.

## Casos de uso

- Generacion y autocompletado de codigo en local: con 100% en HumanEval y un peso de 10,71 GB, es viable integrarlo en un asistente de codigo que corra en una RTX 4070 de 12 GB sin depender de APIs externas. El 56% en MBPP aconseja usarlo como sugeridor y no como generador autonomo de codigo con tests.
- Refactorizacion de repositorios pequenos y medianos: la ventana declarada de 262.144 tokens permitiria cargar varios ficheros de un mismo modulo y pedir reescrituras coherentes, siempre que la cuantizacion a 2 bits no degrade en exceso el seguimiento de instrucciones.
- Atendedor de soporte tecnico en ingles o italiano: el modelo mantiene conversaciones multi-turno y su perfil de baja latencia en modo directo (sin tokens de razonamiento) encaja con respuestas rapidas en un chat de atencion al cliente.
- Extraccion y clasificacion de informacion en documentos largos: informes, contratos o expedientes que superen las ventanas habituales de 8K-32K tokens podrian procesarse en una sola pasada, con la salvedad de que el 57% en MMLU sugiere un conocimiento factual limitado.
- Tutorizacion de matematicas de secundaria: con 89% en GSM8K y 67% en MATH, es util para resolver y explicar problemas paso a paso usando el modo de razonamiento CoT, aunque el autor reporta que ese modo baja su propia nota global (-10,3 puntos porcentuales).
- Prototipado e investigacion en entornos sin GPU de datacenter: al ejecutarse en CPU con ~11,6 GB de RAM mediante llama.cpp, sirve para validar pipelines de agentes y de tool calling antes de escalar a un modelo mayor o a una API en la nube.
- Despliegue en portatiles y workstations de desarrollo: una unica GPU de 12 GB permite offload completo, lo que facilita entornos de desarrollo reproducibles sin conexion.

## Benchmarks y rendimiento

Todos los datos siguientes proceden de la model card del autor y fueron medidos, segun esta, en Sigma Studio Training Lab con semilla 42, temperatura 0.0 y el protocolo `code_execution, continuation_logprob, cot_generation, letter_logprob` (hash de reproducibilidad SHA256-A01F9DA10792E94B). El propio autor advierte que las puntuaciones se calcularon sobre un recorte del dataset y no sobre la suite completa, por lo que no son comparables con ejecuciones completas.

| Benchmark | Dominio | Aciertos / total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 9 / 9 | 100% |
| BIG-Bench Hard | Logica multitarea y simbolica | 6 / 7 | 86% |
| GPQA | Razonamiento academico de posgrado | 2 / 9 | 22% |
| GSM8K | Matematicas escolares multi-paso | 8 / 9 | 89% |
| HellaSwag | Sentido comun y NLI situacional | 7 / 9 | 78% |
| HumanEval | Codigo Python (pass@1) | 7 / 7 | 100% |
| MATH | Matematicas de competicion | 6 / 9 | 67% |
| MBPP | Programacion Python con tests | 5 / 9 | 56% |
| MMLU | Conocimiento general multisujeto | 8 / 14 | 57% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 6 / 9 | 67% |
| TruthfulQA | Factualidad y anti-alucinacion | 7 / 9 | 78% |
| Total | Todos los datasets evaluados | 71 / 100 | 71% |

| Modo de ejecucion | Precision | Aciertos | Perfil declarado |
|---|---|---|---|
| Sin razonamiento (respuesta directa) | 75,4% | 43 / 57 | Latencia minima, sin tokens de razonamiento |
| Razonamiento CoT (deep thinking) | 65,1% | 28 / 43 | Traza multi-paso, delta de -10,3% frente al modo directo |

Evaluacion de protocolo de tool calling y agentes, declarada como realizada en un sandbox aislado:

| Metrica | Resultado | Observacion |
|---|---|---|
| Adherencia al protocolo de herramientas | 87,0% | El mismo informe indica "0/92 criterios analiticos verificados", lo que contradice la cifra |
| Finalizacion autonoma de tareas | 0,0% | 0 de 1 escenarios completados con el fichero objetivo exacto |
| Contencion en el sandbox | 100% conforme | Cero intentos de escape del espacio de trabajo |
| Eficiencia de ejecucion | 0 turnos (0,0 s) | Dato no interpretable |

No se han publicado resultados de benchmarks independientes ni comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~11,8 GB para offload completo en GPU; ~11,6 GB de RAM en modo CPU o hibrido, segun la model card.
- GPU recomendadas por el autor: 12-16 GB de VRAM, por ejemplo RTX 3060 de 12 GB o RTX 4070. Alternativa sin GPU: 32 GB de RAM de sistema.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas. Queda justo en una RTX 3060 de 12 GB, por lo que hay que reservar VRAM para el contexto KV cache y reducir la ventana de contexto si se quiere mantener el offload completo.
- Opciones de despliegue: llama.cpp es el runtime natural dado el formato GGUF y el tag `llama.cpp`. Ollama puede servir el fichero. vLLM soporta GGUF de forma parcial y limitada. TGI no esta indicado en la informacion disponible. El repositorio incluye el tag `endpoints_compatible`.
- Latencia y throughput: no disponible. El unico dato de tiempo publicado ("0 turnos, 0,0 s") no es utilizable como referencia de rendimiento.
- Nota practica: al ser una cuantizacion IQ2_S, el cuello de botella no sera la memoria sino la calidad de salida; conviene medirla con un conjunto propio antes de usarla en produccion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados por terceros para el modelo base ni para alternativas de la misma categoria, por lo que la comparacion se limita a lo que consta en la informacion disponible.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_S | ~27,3B | 262.144 tokens (declarados) | GGUF IQ2_S | "other" (contradictoria en el README) | HuggingFace, 887 descargas |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | pesos originales | no disponible | referenciado como `base_model`, sin datos en esta ficha |
| Otras alternativas de ~27B-32B en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantizacion de 2 bits: IQ2_S es una de las variantes mas agresivas de llama.cpp. El autor no publica mediciones de perplejidad ni de divergencia respecto al modelo base, por lo que se desconoce cuanto se degrada la calidad real.
- Inconsistencias en los metadatos: la licencia figura como "other" en HuggingFace pero el README muestra una insignia Apache-2.0. Antes de un uso comercial hay que verificar la licencia del modelo base y la del propio repositorio.
- Benchmarks no fiables: se calcularon sobre recortes de 100 preguntas (por ejemplo, 9 preguntas en ARC-Challenge o 14 en MMLU). El autor lo advierte explicitamente y senala que no son comparables con ejecuciones de suite completa.
- Resultados internamente contradictorios: en la evaluacion de tool calling se declara un 87% de adherencia al protocolo junto a "0/92 criterios analiticos verificados" y un 0% de finalizacion autonoma de tareas. Estas cifras no permiten afirmar que el modelo sea fiable como agente.
- El modo de razonamiento CoT obtiene peor puntuacion que el modo directo en la propia evaluacion del autor (-10,3%), lo que cuestiona la utilidad del thinking mode en esta cuantizacion.
- GPQA en 22% y MMLU en 57% indican un conocimiento factual y cientifico avanzado limitado; no es adecuado para consultas tecnicas de alta especializacion sin verificacion humana.
- Riesgo de alucinacion: sin una evaluacion independiente de factualidad, el 78% en TruthfulQA sobre 9 preguntas no es garantia suficiente.
- Idiomas: solo ingles e italiano. No hay soporte declarado de castellano.
- Procedencia: el identificador del modelo base (Qwen/Qwen3.8-27B) no coincide con las convenciones de nomenclatura habitualmente publicadas de la familia Qwen, y las fechas de creacion y actualizacion del repositorio son de 2026. Conviene verificar el origen de los pesos antes de integrarlos en cualquier pipeline.
- Repositorio con muy poca traccion (1 like, 887 descargas) y sin validacion de la comunidad.
- Para produccion, el uso de un modelo de 27B a 2 bits en tareas de codigo o de razonamiento deberia ir acompanado de tests automatizados y de un mecanismo de fallback a un modelo de mayor precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_S
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta de publicacion Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Licencia Apache-2.0 citada en el README: https://opensource.org/licenses/Apache-2.0
