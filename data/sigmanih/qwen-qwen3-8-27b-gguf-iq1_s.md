# sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ1_S

## Resumen

Qwen-Qwen3.8-27B-GGUF-IQ1_S es una cuantizacion en formato GGUF del modelo base Qwen/Qwen3.8-27B, publicada por el usuario sigmanih a traves del modulo Model Hub de Sigma Studio. El repositorio contiene los pesos convertidos al tipo de cuantizacion IQ1_S (con calibracion imatrix, segun las etiquetas del repo), lo que reduce el peso en disco a 8,77 GB y permite ejecutar un modelo de 27.320.697.856 parametros en tarjetas graficas de gama media.

El autor declara una ventana de contexto de 262.144 tokens, 65 capas de transformer y una dimension oculta de 5120, con arquitectura base etiquetada como "qwen35". El modelo se orienta a generacion de texto conversacional, razonamiento logico y refactorizacion de codigo, con soporte declarado de ingles e italiano. Su interes practico reside en que, con unos 9,9 GB de VRAM en offload completo a GPU, es desplegable en hardware de consumo (RTX 3060/4070 o 32 GB de RAM en modo hibrido).

Conviene senalar desde el principio que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, que la licencia declarada en los metadatos es "other" mientras que el README muestra una insignia Apache-2.0, y que las puntuaciones de benchmark publicadas por el autor son bajas y estan medidas sobre subconjuntos parciales de cada suite, no sobre el conjunto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, etiquetada como "qwen35" en la model card; 65 capas, dimension oculta 5120 |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No aplica: no se describe una arquitectura MoE |
| Longitud de contexto | 262.144 tokens (segun el autor) |
| Tipos de cuantizacion | IQ1_S (calibrada con imatrix); no se documentan otras variantes en este repositorio |
| Idiomas soportados | Ingles (en) e italiano (it) |
| Licencia | "other" en los metadatos de HuggingFace; el README muestra una insignia Apache-2.0 (contradiccion no resuelta) |
| Formato de pesos | GGUF (fichero unico o dividido, ~9,4 GB de repositorio, 8,77 GB declarados de footprint) |

Datos adicionales aportados por el autor: motor de inferencia recomendado llama.cpp (etiqueta `llama.cpp`), compatibilidad con endpoints declarada (`endpoints_compatible`), VRAM estimada de ~9,9 GB con offload completo en GPU y ~9,7 GB de RAM en modo CPU o hibrido.

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo original. Los unicos datos arquitectonicos proceden de la tabla tecnica del README: 65 capas de transformer, dimension oculta de 5120 y una arquitectura base identificada como "qwen35". No se especifica el numero de cabezas de atencion, el numero de cabezas KV, si emplea atencion lineal o hibrida, ni si incorpora mezcla de expertos (MoE). Tampoco se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similares en el modelo base.

Lo unico verificable sobre el proceso de este repositorio es que se trata de una cuantizacion post-entrenamiento (PTQ) a formato GGUF con el algoritmo IQ1_S, que en llama.cpp corresponde a un esquema de cuantizacion de muy baja precision (del orden de 1,5-2 bits por peso) y que en este caso se ha calibrado con una importance matrix (etiqueta `imatrix`) para reducir el dano en las capas mas sensibles. No hay reentrenamiento ni ajuste fino: es una conversion y compresion del modelo base.

El autor declara dos modos de ejecucion diferenciados, `No-Thinking` (respuesta directa, sin tokens de razonamiento) y `Deep Thinking` (cadena de pensamiento paso a paso), lo que sugiere que el modelo base incorpora un modo de razonamiento explicito conmutables por prompt o plantilla de chat.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat y orientacion a asistente.
- Razonamiento logico y de sentido comun en tareas tipo ARC-Challenge o HellaSwag, con resultados moderados (67% y 44% respectivamente sobre las porciones evaluadas).
- Generacion de codigo Python, evaluada con HumanEval (43%) y MBPP (33%) sobre subconjuntos parciales.
- Modo de razonamiento explicito (`Deep Thinking`, cadena de pensamiento) y modo directo (`No-Thinking`), conmutables.
- Soporte declarado de tool calling y function calling: el autor reporta un 62,0% de adherencia al protocolo de herramientas en un sandbox multi-turno, con cero funciones alucinadas segun sus criterios.
- Capacidades agenticas: el mismo sandbox reporta contencion del 100% dentro del espacio de trabajo, aunque tambien un 0,0% de finalizacion autonoma de tareas (0 de 1 escenarios completados con el fichero objetivo exacto).
- Multilingue limitado a ingles e italiano.
- No se documentan capacidades de vision, audio, voz ni multimodalidad.
- No se documentan capacidades de recuperacion aumentada (RAG) nativas ni embeddings.

## Casos de uso

- Prototipado local en hardware de consumo: con ~9,9 GB de VRAM en offload completo, permite probar un modelo de 27B en una RTX 3060 de 12 GB o una RTX 4070, sin depender de API externa ni de conexion a internet.
- Despliegue en entornos aislados (air-gapped): al ser un GGUF autocontenido de 8,77 GB ejecutable con llama.cpp, encaja en maquinas sin acceso a la nube, por ejemplo entornos de laboratorio o plantas industriales.
- Generacion de texto y borradores en italiano e ingles: el modelo declara ambos idiomas, y la evaluacion del autor esta redactada parcialmente en italiano, lo que sugiere cierto sesgo de validacion hacia ese idioma en tareas de redaccion y resumen.
- Experimentacion academica con cuantizacion extrema: sirve como caso de estudio para medir la degradacion de un modelo de 27B comprimido a IQ1_S comparandolo con el modelo base en FP16 o con cuantizaciones Q4_K_M y Q5_K_M.
- Asistente conversacional de baja criticidad: chat de soporte interno, toma de notas o generacion de respuestas en un panel de pruebas donde los errores son tolerables y existe supervision humana.
- Refactorizacion asistida de codigo con revision obligatoria: puede proponer cambios en funciones Python, pero los resultados de HumanEval (43%) y MBPP (33%) sobre las porciones evaluadas obligan a validar cada salida con tests y revision manual antes de integrarla.
- Integracion en pipelines de agentes como componente exploratorio: el soporte de tool calling declarado (62% de adherencia al protocolo) permite usarlo en prototipos de agentes con herramientas registradas, siempre que se implementen validaciones de esquema y reintentos.
- Evaluacion comparativa de runtimes: util para comparar latencia y consumo de memoria entre llama.cpp, Ollama, LM Studio o llama-cpp-python sobre el mismo fichero GGUF.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en GPU con SigmaEngine, temperatura 0, semilla 42 y protocolos `code_execution`, `continuation_logprob`, `cot_generation` y `letter_logprob`. Todos los valores proceden de subconjuntos parciales de cada suite, por lo que el propio autor advierte que no son comparables con ejecuciones de suite completa.

| Suite | Dominio | Aciertos / total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 6 / 9 | 67% |
| BIG-Bench Hard | Logica multitarea y simbolica | 3 / 7 | 43% |
| GPQA | Razonamiento academico de posgrado | 1 / 9 | 11% |
| GSM8K | Matematicas de primaria multi-paso | 3 / 9 | 33% |
| HellaSwag | Sentido comun y NLI situacional | 4 / 9 | 44% |
| HumanEval | Codigo Python (pass@1) | 3 / 7 | 43% |
| MATH | Matematicas de competicion | 0 / 9 | 0% |
| MBPP | Programacion Python con tests unitarios | 3 / 9 | 33% |
| MMLU | Conocimiento general multi-materia | 5 / 14 | 36% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 1 / 9 | 11% |
| TruthfulQA | Factualidad y anti-alucinacion | 6 / 9 | 67% |
| Total agregado | Todas las suites evaluadas | 35 / 100 | 35% |

Comparativa interna entre modos de ejecucion, tambien del autor:

| Modo | Precision | Aciertos | Perfil operativo |
|---|---|---|---|
| No-Thinking (respuesta directa) | 47,4% | 27 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 18,6% | 8 / 43 | Traza estructurada multi-paso, penalizacion de -28,8 puntos |
| Delta CoT vs directo | -28,8% | — | — |

Protocolo de agente (Sigma Studio Sandbox Jail): adherencia al protocolo de herramientas 62,0%; finalizacion autonoma de tareas 0,0% (0 de 1 escenarios); contencion en el sandbox 100% conforme; eficiencia de ejecucion declarada como 0 turnos y 0,0 s. Hash de reproducibilidad declarado: `SHA256-65ECA6E1D08A1960`.

No se dispone de resultados del modelo base Qwen/Qwen3.8-27B en la informacion proporcionada, por lo que no es posible cuantificar cuanto de estos numeros se debe a la cuantizacion IQ1_S y cuanto al modelo original.

## Requisitos de hardware

- VRAM estimada: ~9,9 GB con offload completo en GPU (dato del autor). El peso del fichero es de 8,77 GB, por lo que el resto corresponde a buffers de contexto y overhead del runtime.
- RAM estimada en modo CPU o hibrido: ~9,7 GB, segun el autor.
- GPU recomendadas por el autor: tarjetas con 12-16 GB de VRAM, citando explicitamente RTX 3060 y RTX 4070; alternativamente, un sistema con 32 GB de RAM.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM. No cabria en GPUs de 8 GB sin offload parcial a CPU, y en ese caso la latencia se degradaria de forma notable.
- Aviso sobre el contexto: la ventana declarada de 262.144 tokens exige un KV cache proporcional al contexto realmente utilizado. No se dispone del numero de cabezas KV ni de la cuantizacion del cache, por lo que no es posible calcular la memoria adicional; en la practica, usar la ventana completa en una GPU de 12 GB es inviable sin cuantizar el KV cache y con offload parcial.
- Opciones de despliegue: llama.cpp (formato nativo), llama-cpp-python, Ollama, LM Studio y otros frontends compatibles con GGUF. La compatibilidad con vLLM o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponible. El unico dato relacionado es la afirmacion de 0 turnos y 0,0 s en el sandbox de agentes, que no constituye una medida de rendimiento utilizable.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, contexto o licencia de modelos comparables en la informacion proporcionada. La unica comparacion posible es con el propio modelo base y con otras cuantizaciones del mismo base, de las que tampoco hay fichas en esta busqueda.

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ1_S | 27,32 mil millones | 262.144 tokens (declarado) | GGUF IQ1_S, 8,77 GB | "other" (README muestra Apache-2.0) | 35% agregado en 11 suites parciales |
| Qwen/Qwen3.8-27B (base) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion consultada |
| Otras cuantizaciones GGUF del mismo base | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de tamano similar (otros modelos de ~27B) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resultados de benchmark bajos y parciales: 35% agregado en 100 preguntas repartidas en 11 suites, con 0% en MATH, 11% en GPQA y MMLU-Pro, y 33% en GSM8K y MBPP. El propio autor advierte que las mediciones se hicieron sobre porciones de cada dataset y no son comparables con ejecuciones de suite completa.
- El modo de razonamiento explotado empeora el resultado: la cadena de pensamiento obtiene 18,6% frente al 47,4% del modo directo, una penalizacion de 28,8 puntos. No se debe asumir que activar CoT mejore la calidad.
- Cuantizacion extrema: IQ1_S es uno de los esquemas de menor precision disponibles en llama.cpp. Aunque se haya calibrado con imatrix, la degradacion respecto al modelo en FP16 es esperable y no cuantificada en la informacion disponible.
- Inconsistencia de licencia: los metadatos de HuggingFace declaran `license: other`, mientras que el README muestra una insignia Apache-2.0. Antes de cualquier uso comercial hay que verificar la licencia real del modelo base Qwen/Qwen3.8-27B, que no se detalla en la informacion consultada.
- Sin validacion de la comunidad: 0 descargas y 0 likes. No hay evidencia independiente de que los pesos funcionen como se describe.
- Capacidades agenticas no demostradas: pese al 62% de adherencia al protocolo de herramientas, la finalizacion autonoma de tareas es del 0,0% (0 de 1 escenarios). No es un modelo fiable para automatizacion sin supervision.
- Riesgo de alucinacion: TruthfulQA obtiene 67%, el mejor dato del conjunto, pero MMLU se queda en 36%, lo que indica conocimiento factual limitado y propension a errores en preguntas de conocimiento general.
- Cobertura idiomatica restringida a ingles e italiano. No hay soporte declarado de castellano, catalan, gallego ni euskera.
- Inconsistencias entre los datos declarados y el repositorio: el nombre del modelo indica "27B" frente a los 27,32 mil millones de parametros reales; la dimension oculta de 5120 con 65 capas resulta atipica para esa cifra de parametros; y un footprint de 8,77 GB es mas coherente con cuantizaciones de ~2,5 bits por peso que con IQ1_S (~1,5-2 bpw). Conviene verificar el tipo real de cuantizacion del fichero antes de planificar el despliegue.
- Fechas del repositorio (creacion en 2026) y nomenclatura del modelo base no verificables con fuentes independientes en la informacion disponible.
- Sin datos sobre sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Sin informacion sobre el proceso de entrenamiento del base, lo que impide evaluar riesgo de contaminacion de benchmarks o de datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ1_S
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio SigmaStudio en GitHub: https://github.com/Sigmanih/SigmaStudio
- Licencia Apache-2.0 referenciada en el README: https://opensource.org/licenses/Apache-2.0
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
