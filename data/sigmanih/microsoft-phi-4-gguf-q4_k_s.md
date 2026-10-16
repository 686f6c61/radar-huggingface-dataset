# sigmanih/microsoft-phi-4-GGUF-Q4_K_S

## Resumen
Este repositorio contiene una cuantización GGUF en formato Q4_K_S del modelo microsoft/phi-4, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del phi-4 original de Microsoft a un formato optimizado para inferencia en CPU y GPU mediante llama.cpp y motores compatibles con GGUF. El objetivo es reducir el peso en disco hasta unos 7,88 GB y permitir su ejecución en hardware de consumo con 12-16 GB de VRAM.

El modelo base phi-4 es un transformer denso, decoder-only, de aproximadamente 14.660 millones de parámetros totales (el autor de la tarjeta cita ~13,1B como "parámetros activos", aunque al ser un modelo denso no existe distinción entre activos y totales). Cuenta con 40 capas, dimensión oculta de 5120 y una ventana de contexto de 16.384 tokens.

Su relevancia actual reside en que permite desplegar un modelo de razonamiento y código de gama media-alta en equipos modestos, con licencia "other" según los metadatos de HuggingFace. La ficha incluye benchmarks internos medidos sobre porciones reducidas de los conjuntos de evaluación, por lo que sus cifras no son comparables con ejecuciones completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (arch base declarada: phi3) |
| Parametros totales | 14.659.507.200 (~14,66B) segun safetensors; la model card cita ~13,1B como "parametros activos" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | GGUF Q4_K_S (unica disponible en este repo) |
| Idiomas soportados | Ingles (en) e italiano (it) segun metadatos; el base phi-4 esta orientado principalmente al ingles |
| Licencia | other (los metadatos de HuggingFace indican "other"; la model card muestra una insignia Apache-2.0, lo que supone una inconsistencia) |
| Formato de pesos | GGUF (Q4_K_S) |
| Capas del transformer | 40 |
| Dimension oculta | 5120 |
| Tamano en disco | 7,88 GB (repo de 8,5 GB) |
| VRAM estimada | ~10,0 GB con offload completo en GPU; ~9,8 GB en RAM para CPU/hibrido |

## Arquitectura y entrenamiento
El modelo subyacente es microsoft/phi-4, un transformer denso decoder-only con 40 capas y dimension oculta de 5120. Este repositorio no aporta informacion sobre el entrenamiento original (composicion del dataset, numero de tokens, fases de RLHF o DPO), por lo que esos datos deben consultarse en la model card de microsoft/phi-4 y no estan disponibles en la informacion proporcionada.

La unica transformacion aplicada aqui es la cuantizacion a GGUF Q4_K_S mediante el modulo Model Hub de Sigma Studio, orientada a ejecucion con llama.cpp y motores compatibles. No se declara ninguna innovacion arquitectonica adicional (ni atencion lineal, ni decodificacion especulativa propia, ni mezcla de expertos). La model card menciona un motor propietario denominado SigmaEngine para la evaluacion en GPU, pero no detalla su funcionamiento interno.

## Capacidades
- Generacion de texto conversacional multi-turno.
- Razonamiento paso a paso (modo denominado "Deep Thinking CoT"), con una mejora declarada de +8,3 puntos porcentuales frente al modo de respuesta directa en la evaluacion interna.
- Generacion de codigo en Python (HumanEval y MBPP reportados).
- Resolucion de problemas matematicos (GSM8K y MATH reportados).
- Razonamiento cientifico y de conocimiento general (ARC-Challenge, MMLU, MMLU-Pro, GPQA).
- Uso de herramientas y function calling: la model card reporta un 88,0% de adherencia al protocolo de herramientas en un entorno de pruebas interno.
- Capacidades de agente en bucle con multiples pasos, con contencion del 100% dentro del espacio de trabajo del sandbox segun la evaluacion del autor.
- Idiomas declarados: ingles e italiano.

## Casos de uso
- Asistente de programacion local: con 16.384 tokens de contexto y buen rendimiento declarado en HumanEval (86% sobre 7 preguntas) y MBPP (78% sobre 9 preguntas), puede integrarse en un IDE o CLI para autocompletar y revisar codigo Python sin depender de la nube.
- Atencion al cliente automatizada: al ser un modelo conversacional cuantizado y ligero, puede desplegarse en un servidor con una sola GPU de 12-16 GB para gestionar dialogos multi-turno con contexto de 16K tokens.
- Agentes autonomos con tool calling: la adherencia del 88,0% al protocolo de herramientas permite usarlo en pipelines que invocan funciones registradas, siempre que se validen las llamadas en produccion.
- Razonamiento matematico asistido: con el modo CoT activado, resulta adecuado para tutoria paso a paso en problemas de nivel escolar y competicion (GSM8K y MATH reportados al 100% y 89% sobre muestras pequeñas respectivamente).
- Despliegue en hardware de consumo: al ocupar 7,88 GB en disco y ~10 GB de VRAM con offload completo, puede ejecutarse en GPUs como RTX 3060 o RTX 4070 para prototipado e investigacion local.
- Procesamiento de texto en italiano o ingles: para tareas de resumen, reescritura o extraccion de informacion en esos dos idiomas.
- Evaluacion y experimentacion en investigacion: util como punto de partida para comparar cuantizaciones Q4_K_S frente a otros formatos del mismo base phi-4.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la evaluacion interna del autor, realizada sobre porciones reducidas de cada conjunto (el propio autor advierte que no son comparables con ejecuciones de suite completa). Se ejecutaron con temperatura 0 y semilla 42.

| Benchmark | Dominio | Correctas / Total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89% |
| BIG-Bench Hard | Logica y simbolismo multitarea | 6 / 7 | 86% |
| GPQA | Razonamiento academico de posgrado | 5 / 9 | 56% |
| GSM8K | Matematicas escolares multi-paso | 9 / 9 | 100% |
| HellaSwag | Sentido comun y NLI situacional | 4 / 9 | 44% |
| HumanEval | Codigo Python (pass@1) | 6 / 7 | 86% |
| MATH | Matematicas de competicion | 8 / 9 | 89% |
| MBPP | Programacion Python con tests | 7 / 9 | 78% |
| MMLU | Conocimiento general multi-materia | 7 / 14 | 50% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 5 / 9 | 56% |
| TruthfulQA | Factualidad y anti-alucinacion | 7 / 9 | 78% |
| Total | Todos los conjuntos evaluados | 72 / 100 | 72% |

Comparacion de modos de respuesta segun el autor:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 68,4% | 39 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 76,7% | 33 / 43 | Traza de razonamiento multi-paso (+8,3%) |

Evaluacion de uso de herramientas (sandbox interno del autor):

| Metrica | Resultado | Detalle |
|---|---|---|
| Adherencia al protocolo de herramientas | 88,0% | 0/92 criterios analiticos verificados segun la tarjeta |
| Finalizacion autonoma de tareas | 0,0% | 0/1 escenarios completados con el fichero objetivo exacto |
| Contencion en el sandbox | 100% conforme | Sin intentos de escape del espacio de trabajo |
| Eficiencia de ejecucion | 0 turnos (0,0 s) | Uso declarado de presupuesto optimo |

Nota: las cifras de adherencia y contencion son internas y presentan inconsistencias internas en la propia tarjeta (por ejemplo, "0/92 criterios verificados" junto a un 88,0% de adherencia, y "0 turnos" con 0,0 s). Deben tomarse con cautela.

## Requisitos de hardware
- VRAM estimada: ~10,0 GB con offload completo en GPU; alternativa en CPU/hibrido con ~9,8 GB de RAM.
- GPU recomendadas por el autor: 12-16 GB de VRAM (por ejemplo, RTX 3060 o RTX 4070).
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM. Tambien puede ejecutarse con 32 GB de RAM en modo CPU.
- Opciones de despliegue: llama.cpp (formato nativo), y cualquier motor compatible con GGUF. La model card menciona ademas endpoints compatibles y un motor propio (SigmaEngine / Sigma Studio).
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Tamano en disco: 7,88 GB el fichero cuantizado; 8,5 GB el repositorio completo.

## Comparativa con modelos similares

Los datos de benchmarks de los modelos comparados no estan disponibles en la informacion proporcionada; la comparacion se limita a especificaciones objetivas.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sigmanih/microsoft-phi-4-GGUF-Q4_K_S | ~14,66B (denso) | 16.384 | GGUF Q4_K_S | other (metadatos HF) | HuggingFace |
| microsoft/phi-4 (base) | ~14,66B (denso) | 16.384 (segun base comunmente documentado) | safetensors | MIT (habitual en el modelo base, no confirmado en esta informacion) | HuggingFace |
| Otras cuantizaciones GGUF de phi-4 | no disponible | no disponible | GGUF (varios) | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos directos entre esta cuantizacion y otras alternativas de la misma categoria.

## Limitaciones y advertencias
- La licencia figura como "other" en los metadatos de HuggingFace, mientras que la model card muestra una insignia Apache-2.0. Esta contradiccion debe resolverse antes de cualquier uso comercial; conviene verificar la licencia del modelo base microsoft/phi-4.
- Los benchmarks publicados se han medido sobre porciones muy pequenas de cada conjunto (entre 7 y 14 preguntas por prueba), por lo que la varianza es alta y las cifras no son representativas de una evaluacion completa. El propio autor lo advierte.
- Existen inconsistencias internas en la tabla de evaluacion de herramientas (88,0% de adherencia junto a "0/92 criterios verificados"; "0,0% de finalizacion autonoma" junto a "0 turnos"), lo que reduce la fiabilidad de esos numeros.
- Rendimiento bajo en HellaSwag (44%) y MMLU (50%) en la muestra evaluada, lo que sugiere limitaciones en sentido comun y conocimiento general dentro de esta cuantizacion concreta.
- Idiomas soportados declarados unicamente ingles e italiano; no hay soporte declarado para castellano.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La cuantizacion Q4_K_S introduce perdida de precision respecto a los pesos originales; el impacto exacto sobre calidad no esta cuantificado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; TruthfulQA se reporta al 78% sobre solo 9 preguntas, insuficiente para garantizar factualidad en produccion.
- La model card esta truncada en la informacion proporcionada, por lo que podrian existir secciones adicionales relevantes (por ejemplo, detalles de uso responsable) no incluidas aqui.
- No se han publicado mediciones de latencia, throughput ni consumo energetico.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/sigmanih/microsoft-phi-4-GGUF-Q4_K_S
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- No se han encontrado enlaces relevantes adicionales (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos correspondian a un diccionario de frances y no guardan relacion con el modelo.
