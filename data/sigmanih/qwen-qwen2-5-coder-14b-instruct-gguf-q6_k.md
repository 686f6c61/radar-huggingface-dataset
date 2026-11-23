# sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q6_K

## Resumen
`sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q6_K` es una cuantizacion GGUF de tipo Q6_K del modelo `Qwen/Qwen2.5-Coder-14B-Instruct`, publicada por el usuario sigmanih a traves de su herramienta Sigma Studio. No se trata de un modelo entrenado desde cero, sino de una redistribucion del checkpoint oficial de Qwen en formato GGUF, pensada para inferencia local en CPU o GPU con llama.cpp y runtimes compatibles. El modelo base es un transformer causal de 14.770.033.664 parametros (aproximadamente 14,8 mil millones) especializado en generacion de codigo.

La relevancia de esta ficha es doble. Por un lado, documenta una de las multiples cuantizaciones comunitarias del Qwen2.5-Coder-14B-Instruct, un modelo ampliamente utilizado para tareas de programacion. Por otro, sirve como ejemplo de publicacion con metadatos incompletos o inconsistentes: la model card declara un formato de pesos "Sconosciuto" (desconocido en italiano), un tamano en disco de "0.0 GB" y una licencia "other" que no coincide con el badge Apache-2.0 que muestra la propia card. El consumidor debe tratar esos campos con cautela.

El contexto declarado es de 32.768 tokens y el autor indica un uso recomendado en GPU de 12-16 GB de VRAM con offload completo. El repositorio ocupa 12,1 GB. La model card incluye resultados de benchmarks propios ejecutados con su herramienta SigmaEngine, que se reproducen en la seccion correspondiente con las advertencias oportunas sobre su alcance limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer decoder-only, derivado de Qwen2.5-Coder) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun model card) |
| Tipos de cuantizacion | Q6_K (esta publicacion); el modelo base admite otras cuantizaciones GGUF de terceros |
| Idiomas soportados | en, it (segun metadatos de la model card) |
| Licencia | other (la model card muestra badge Apache-2.0; discrepancia sin resolver) |
| Formato de pesos | GGUF (la model card indica "Sconosciuto/sconosciuta", dato inconsistente) |

## Arquitectura y entrenamiento
El modelo subyacente es `Qwen/Qwen2.5-Coder-14B-Instruct`, un transformer decoder-only de la familia Qwen2.5-Coder con aproximadamente 14,8 mil millones de parametros. Esta publicacion concreta no aporta informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento: la model card de sigmanih se limita a describir la publicacion y los resultados de su evaluacion, sin detallar numero de tokens de entrenamiento, composicion del dataset, fases de RLHF o DPO, ni innovaciones tecnicas del modelo base. Toda esa informacion debe consultarse en la model card oficial de Qwen, que no forma parte de los datos proporcionados.

Lo unico verificable en esta publicacion es el proceso de cuantizacion a Q6_K, un esquema de cuantizacion por bloques de 6 bits que en la practica reduce el peso a aproximadamente 12,1 GB de repositorio manteniendo una perdida de calidad baja respecto al checkpoint original en bfloat16. No se documenta la herramienta exacta de conversion ni los parametros empleados.

## Capacidades
- Generacion de codigo en multiples lenguajes, con especial enfasis en Python segun los benchmarks reportados (HumanEval y MBPP).
- Razonamiento multi-paso sobre problemas de programacion y matematicas, incluyendo un modo de cadena de pensamiento ("Deep Thinking CoT") descrito en la model card.
- Generacion de texto conversacional y respuesta a instrucciones, heredada del ajuste Instruct del modelo base.
- Soporte de tool calling y function calling, evaluado por el autor con un protocolo propio de adherencia a herramientas (77,2 % de criterios verificados).
- Ejecucion de bucles agenticos multi-turno con acciones sobre sistema de ficheros en un sandbox, con contencion del 100 % segun la evaluacion del autor.
- Capacidades multilingues limitadas segun metadatos a ingles e italiano; el modelo base Qwen2.5-Coder soporta mas idiomas, pero esta publicacion no los declara.
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso
- Asistente de programacion en local: el modelo puede autocompletar y generar funciones completas en un IDE o plugin que consuma un endpoint compatible con la API de OpenAI, aprovechando el formato GGUF para ejecutarse en una estacion de trabajo sin GPU de datacenter.
- Generacion de tests unitarios en pipelines de CI: dado un modulo Python, el modelo produce casos de prueba y aserciones; su rendimiento reportado en MBPP (9/9 en la muestra del autor) sugiere soltura con pruebas con aserciones.
- Refactorizacion y explicacion de codigo heredado: con 32.768 tokens de contexto puede ingerir varios ficheros de un mismo modulo y proponer cambios coherentes entre ellos.
- Agentes de automatizacion de tareas de repositorio: el autor evalua escenarios de manipulacion de ficheros en sandbox; encaja en flujos donde el modelo decide que herramienta invocar (leer, escribir, listar) y ejecuta pasos encadenados.
- Chatbot de soporte tecnico para desarrolladores: conversaciones multi-turno sobre errores de compilacion, APIs y configuracion, con la ventaja de poder desplegarse on-premise sin enviar codigo a terceros.
- Prototipado rapido de scripts de datos: generacion de scripts de extraccion, transformacion y carga (ETL) en Python para equipos que trabajan con datos sensibles y no pueden usar APIs en la nube.
- Educacion y evaluacion de codigo: correccion automatica de ejercicios de programacion con explicaciones paso a paso, usando el modo CoT cuando la tarea lo requiera.

## Benchmarks y rendimiento
Los unicos datos disponibles son los publicados por el autor en la model card, medidos con su propia herramienta SigmaEngine sobre muestras parciales de cada suite. El propio autor advierte que "Measured on a slice of the dataset, not the full suite: this score is not comparable with a full-suite run", por lo que estos numeros no deben compararse con resultados oficiales de Qwen ni de terceros.

| Suite | Dominio | Correctos / total | Precision |
|---|---|---|---|
| ARC-Challenge | Razonamiento cientifico | 9 / 9 | 100 % |
| BIG-Bench Hard | Logica multi-tarea | 7 / 7 | 100 % |
| GPQA | Razonamiento academico | 2 / 9 | 22 % |
| GSM8K | Matematicas de primaria multi-paso | 8 / 9 | 89 % |
| HellaSwag | Sentido comun | 7 / 9 | 78 % |
| HumanEval | Codigo Python (pass@1) | 7 / 7 | 100 % |
| MATH | Matematicas de competicion | 8 / 9 | 89 % |
| MBPP | Programacion Python con tests | 9 / 9 | 100 % |
| MMLU | Conocimiento general | 8 / 14 | 57 % |
| MMLU-Pro | Razonamiento avanzado | 5 / 9 | 56 % |
| TruthfulQA | Factualidad | 8 / 9 | 89 % |
| Total | Todas las suites | 78 / 100 | 78 % |

Comparativa de modos de ejecucion reportada por el autor:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 84,2 % | 48 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 69,8 % | 30 / 43 | Traza de razonamiento multi-paso, delta de -14,4 % |

Evaluacion agentica del autor (Sigma Studio Sandbox Jail):

| Metrica | Resultado | Detalle |
|---|---|---|
| Adherencia al protocolo de herramientas | 77,2 % | 71/92 criterios verificados |
| Completitud autonoma de tareas | 37,5 % | 3/8 escenarios con fichero objetivo exacto |
| Contencion del sandbox | 100 % conforme | Cero intentos de escape |
| Eficiencia de ejecucion | 90 turnos (353,7 s) | Presupuesto de turnos y tokens |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 12,4 GB con offload completo en GPU, segun la model card; en modo CPU/hibrido, unos 11,5 GB de RAM.
- GPU recomendadas por el autor: tarjetas con 12-16 GB de VRAM, como RTX 3060 de 12 GB o RTX 4070. Para mayor margen de contexto y batch, una RTX 4090 (24 GB) o una A100/H100 permiten cargar el modelo completo con holgura y aumentar el tamano de lote.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM aplicando Q6_K; en tarjetas de 8 GB seria necesario reducir la cuantizacion o hacer offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con la API de OpenAI que acepten GGUF; la model card menciona compatibilidad con endpoints. No se documenta soporte de vLLM ni TGI para este artefacto concreto, ya que estos suelen requerir pesos en safetensors.
- Latencia y throughput: no disponibles. El autor reporta una duracion de 353,7 s para 90 turnos en su evaluacion agentica, pero no proporciona tokens por segundo ni latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sigmanih/Qwen2.5-Coder-14B-Instruct-GGUF-Q6_K (esta publicacion) | 14,77 B | 32.768 | GGUF Q6_K | other (badge Apache-2.0) | Cuantizacion comunitaria, benchmarks parciales del autor |
| Qwen/Qwen2.5-Coder-14B-Instruct (modelo base) | 14,77 B | 32.768 (ampliable en el modelo base) | safetensors | Apache-2.0 | Checkpoint oficial, referencia para comparar calidad |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B aprox. | 32.768 | safetensors, GGUF de terceros | Apache-2.0 | Menor huella de VRAM, menor capacidad en tareas complejas |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32,5 B aprox. | 32.768 | safetensors, GGUF de terceros | Apache-2.0 | Mayor calidad en codigo, requiere 24 GB o mas en cuantizaciones altas |

No se dispone de datos de benchmarks oficiales comparables en la informacion proporcionada para establecer una comparacion cuantitativa fiable entre estos modelos.

## Limitaciones y advertencias
- Los metadatos de la model card son inconsistentes: el formato de pesos figura como "Sconosciuto" (desconocido), el tamano en disco como "0.0 GB" y la licencia como "other" mientras se muestra un badge Apache-2.0. Verificar la licencia real del modelo base antes de cualquier uso comercial.
- Los benchmarks publicados se han medido sobre muestras parciales de cada suite, con protocolo propio y sin comparabilidad con ejecuciones completas; no deben citarse como resultados oficiales del modelo.
- El rendimiento en GPQA (22 %) y MMLU (57 %) es bajo en la evaluacion del autor, lo que sugiere limitaciones en conocimiento academico avanzado y razonamiento de nivel experto.
- El modo CoT reporta una precision inferior al modo directo en la evaluacion del autor (-14,4 %), un resultado contraintuitivo que aconseja validar el modo de razonamiento en el caso de uso concreto antes de adoptarlo.
- La completitud autonoma en tareas agenticas es del 37,5 % en los escenarios del autor; no es un modelo fiable para agentes completamente autonomos sin supervision.
- Riesgo de alucinacion en APIs, librerias y funciones inexistentes, habitual en modelos de codigo; requiere validacion con tests y compilacion.
- Idiomas declarados limitados a ingles e italiano; el rendimiento en castellano no esta documentado en esta publicacion.
- El contexto declarado de 32.768 tokens puede degradarse en la practica con cuantizacion Q6_K y depende de la implementacion del runtime.
- Repositorio con muy baja traccion (442 descargas, 1 like en el momento de la consulta) y autor comunitario sin vinculo con el equipo de Qwen; no hay garantia de mantenimiento.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q6_K
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio de la herramienta del autor (Sigma Studio): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
