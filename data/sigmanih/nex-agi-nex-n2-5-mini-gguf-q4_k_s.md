# sigmanih/nex-agi-Nex-N2.5-mini-GGUF-Q4_K_S

## Resumen

sigmanih/nex-agi-Nex-N2.5-mini-GGUF-Q4_K_S es una cuantizacion en formato GGUF, concretamente en Q4_K_S, del modelo nex-agi/Nex-N2.5-mini, publicada por el usuario sigmanih mediante la herramienta Sigma Studio. No es un modelo entrenado desde cero, sino una conversion de pesos orientada a la ejecucion local con llama.cpp y herramientas compatibles, con una huella en disco de 18,52 GB y un repositorio de 19,9 GB. En el momento de la consulta acumula 0 descargas y 0 likes.

Segun la model card, la arquitectura base esta etiquetada como "qwen35moe", con 34.660.610.688 parametros totales confirmados en los safetensors del modelo original y aproximadamente 30,9 mil millones de parametros activos declarados. La ventana de contexto anunciada es de 262.144 tokens, con 40 capas de transformer y una dimension oculta de 2.048. Los idiomas declarados son ingles e italiano.

Su interes practico es permitir ejecutar un modelo de mas de 34.000 millones de parametros en una unica GPU de 24 GB, algo inviable en precision completa. Sin embargo, los benchmarks publicados son autodeclarados, con tamanos de muestra muy pequenos y varias incoherencias internas, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE, etiquetada como "qwen35moe" en la model card (familia Qwen) |
| Parametros totales | 34.660.610.688 (~34,66 B) segun los safetensors del modelo base |
| Parametros activos | ~30,9 B declarados en la model card (valor atipico para un MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_S (unica cuantizacion publicada en este repositorio) |
| Idiomas soportados | Ingles (en) e italiano (it) |
| Licencia | "other" en los metadatos de HuggingFace; la model card muestra una insignia Apache-2.0, sin aclarar la contradiccion |
| Formato de pesos | GGUF (llama.cpp) |
| Capas del transformer | 40 |
| Dimension oculta | 2.048 |
| Tamano del repositorio | 19,9 GB |
| Huella en disco del modelo | 18,52 GB |
| VRAM estimada (offload completo) | ~19,6 GB |
| RAM estimada (CPU/hibrido) | ~19,1 GB |
| Modelo base | nex-agi/Nex-N2.5-mini |
| Fecha de publicacion | 2026-09-12 (fecha declarada en los metadatos) |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo original. La model card identifica la arquitectura base como "qwen35moe", lo que apunta a un transformer con mezcla de expertos (MoE) dentro del linaje Qwen, con 40 capas y una dimension oculta de 2.048. No se especifica el numero de expertos, el numero de expertos activos por token, el tipo de atencion, ni si se emplearon tecnicas como atencion lineal o decodificacion especulativa.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre fases de ajuste como RLHF, DPO o preferencias. El unico elemento tecnico verificable es el proceso de cuantizacion: los pesos se han convertido a Q4_K_S, una cuantizacion de 4 bits con escalas por bloque del ecosistema llama.cpp, que reduce el peso del modelo a 18,52 GB manteniendo el tokenizador y la configuracion de contexto del modelo original.

Conviene senalar dos inconsistencias detectadas en los propios datos: la model card declara ~30,9 B de parametros activos sobre 34,66 B totales, una ratio poco habitual en arquitecturas MoE, donde lo esperable seria una fraccion activa muy inferior al total; y una dimension oculta de 2.048 resulta muy reducida para albergar 34,66 B de parametros en solo 40 capas. No es posible resolver estas discrepancias con la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento en modo "thinking" (cadena de pensamiento) y en modo directo "no-thinking", segun la comparativa publicada por el autor.
- Generacion de codigo en Python: la model card reporta evaluaciones de HumanEval (pass@1) y MBPP.
- Razonamiento matematico, con resultados declarados en GSM8K y MATH.
- Razonamiento cientifico y de conocimiento general, evaluado con ARC-Challenge, MMLU y MMLU-Pro.
- Soporte de tool calling y protocolo de agentes: la model card incluye una evaluacion en un "Sandbox Jail" con llamadas a herramientas sobre sistema de ficheros.
- Multilingue limitado: solo ingles e italiano declarados, sin soporte documentado de castellano.
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Analisis y razonamiento sobre documentos largos: con 262.144 tokens de contexto declarados, el modelo puede procesar manuales tecnicos, expedientes o bases de codigo extensas en una sola pasada sin troceado, algo clave en tareas de resumen y extraccion estructurada.
- Refactorizacion de codigo en produccion: es el uso que recomienda explicitamente la model card. Puede integrarse en pipelines de revision para reestructurar modulos completos, siempre que el repositorio quepa en la ventana de contexto y se validen los cambios con tests.
- Asistente de programacion local con tool calling: al ser un GGUF compatible con llama.cpp y con la etiqueta `endpoints_compatible`, puede exponerse como endpoint compatible con OpenAI y conectar herramientas de edicion de ficheros o ejecucion de tests.
- Razonamiento matematico asistido: los resultados declarados en MATH (83%) y GSM8K (93%) lo situan como candidato para tutoria o verificacion de calculos paso a paso activando el modo CoT.
- Especializacion en dominio empresarial: la model card lo orienta a "enterprise domain specialization", es decir, adaptaciones mediante fine-tuning o RAG sobre documentacion interna en ingles o italiano.
- Prototipado de agentes autonomos: el modelo soporta trazas de razonamiento multi-paso, aunque su tasa declarada de finalizacion autonoma de tareas es del 0,0%, por lo que debe usarse con supervision humana y verificacion de cada accion.
- Despliegue en hardware unico: por su tamano cuantizado, encaja en estaciones de trabajo con una RTX 3090 o 4090, lo que permite escenarios de privacidad estricta sin enviar datos a la nube.
- Generacion de contenido en ingles e italiano: redaccion, traduccion entre ambos idiomas y adaptacion de textos, sin cobertura verificada de otras lenguas.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la evaluacion autodeclarada por el autor en Sigma Studio Training Lab, con semilla 42, temperatura 0.0 y los protocolos `code_execution`, `cot_generation` y `letter_logprob`. No se ha publicado comparacion con modelos similares en la informacion disponible.

| Conjunto | Dominio | Aciertos / Total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89% |
| BIG-Bench Hard | Logica compleja multi-tarea | 7 / 7 | 100% |
| GPQA | Razonamiento academico de posgrado | 3 / 9 | 33% |
| GSM8K | Matematicas de primaria multi-paso | 65 / 70 | 93% |
| HellaSwag | Sentido comun y NLI situacional | 1 / 9 | 11% |
| HumanEval | Codigo Python (pass@1) | 10 / 11 | 91% |
| MATH | Matematicas de competicion | 45 / 54 | 83% |
| MBPP | Programacion Python con tests | 7 / 9 | 78% |
| MMLU | Conocimiento general multi-materia | 33 / 51 | 65% |
| MMLU-Pro | Razonamiento avanzado multi-paso | 44 / 62 | 71% |
| TruthfulQA | Factualidad y anti-alucinacion | 6 / 9 | 67% |
| Total | Todos los conjuntos evaluados | 229 / 300 | 76,3% |

Comparativa de modos de razonamiento:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-thinking (respuesta directa) | 65,2% | 58 / 89 | Latencia minima, sin tokens de razonamiento |
| Deep thinking (CoT) | 81,0% | 171 / 211 | Traza de razonamiento multi-paso, +15,8 puntos |

Evaluacion agentica en Sandbox Jail:

| Metrica | Resultado | Detalle |
|---|---|---|
| Adherencia al protocolo de herramientas | 62,1% | 41 / 66 criterios analiticos verificados |
| Finalizacion autonoma de tareas | 0,0% | 0 / 6 escenarios completados con el fichero objetivo exacto |
| Contencion en el sandbox | 100% conforme | Ningun intento de escape del espacio de trabajo |
| Eficiencia de ejecucion | 66 turnos (1212,2 s) | Aproximadamente 18,4 s por turno, sin detallar hardware |

## Requisitos de hardware

- VRAM estimada: ~19,6 GB con offload completo del modelo en GPU, segun la model card.
- RAM estimada: ~19,1 GB en modo CPU o hibrido (GPU + CPU).
- GPU recomendada por el autor: 24 GB de VRAM, citando RTX 3090 o RTX 4090.
- Si cabe en GPU de consumo: si, en tarjetas de gama alta con 24 GB (RTX 3090, RTX 4090, y equivalentes de generaciones posteriores). No cabe en GPU de 16 GB sin descargar capas a CPU, lo que degrada la velocidad.
- Memoria del sistema recomendada: 32 a 64 GB de RAM para despliegues en CPU o hibridos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier servidor compatible con GGUF. La etiqueta `endpoints_compatible` sugiere exposicion como endpoint tipo OpenAI. No se documenta soporte de vLLM o TGI en la informacion disponible.
- Nota sobre la ventana de contexto: los 262.144 tokens declarados implican una cache KV considerable. En la practica, activar el contexto completo exige mucha mas memoria que los ~19,6 GB indicados, que corresponden solo a los pesos. No se aporta el calculo de memoria de la cache KV.
- Latencia y throughput: no disponibles. El unico dato indirecto es el promedio de ~18,4 s por turno en la evaluacion agentica, con un entorno y hardware no especificados, por lo que no es extrapolable.

## Comparativa con modelos similares

No hay datos verificados de modelos comparables en la informacion proporcionada. La unica comparacion que puede establecerse con rigor es entre este repositorio cuantizado y su modelo base.

| Aspecto | nex-agi-Nex-N2.5-mini-GGUF-Q4_K_S | nex-agi/Nex-N2.5-mini (base) |
|---|---|---|
| Formato de pesos | GGUF (Q4_K_S) | No disponible en la informacion proporcionada |
| Parametros totales | 34,66 B (heredados del base) | 34,66 B (safetensors) |
| Parametros activos | ~30,9 B (heredados del base) | ~30,9 B (heredados del base) |
| Contexto declarado | 262.144 tokens | 262.144 tokens (heredados del base) |
| Huella en disco | 18,52 GB | No disponible |
| Ejecucion en GPU de 24 GB | Si | No disponible |
| Licencia | "other" / posible Apache-2.0 (contradiccion en la model card) | "other" |
| Comparacion de rendimiento con modelos de la misma categoria | No disponible | No disponible |

Alternativas de la misma categoria (MoE de ~30 B con cuantizacion GGUF): no disponible en la informacion proporcionada. Cualquier comparacion numerica con otros modelos requeriria datos de benchmarks externos que no se han aportado.

## Limitaciones y advertencias

- La licencia esta declarada como "other" en los metadatos de HuggingFace, mientras que la model card muestra una insignia Apache-2.0. Esta contradiccion no se resuelve en la documentacion, por lo que el uso comercial no puede darse por seguro sin consultar al autor del modelo base.
- Este repositorio es una publicacion de un tercero (sigmanih) sobre un modelo de nex-agi. No es una publicacion oficial del desarrollador del modelo original.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria y el soporte disponible.
- Los benchmarks son autodeclarados y no han sido verificados de forma independiente. Ademas, varios conjuntos se evaluan con muestras muy pequenas (7, 9 u 11 preguntas), lo que hace que un solo fallo altere la precision en decenas de puntos porcentuales.
- Resultados llamativamente bajos en HellaSwag (11%) y GPQA (33%) frente a valores altos en BIG-Bench Hard (100%), MATH (83%) o HumanEval (91%), lo que sugiere problemas de metodologia o de formato de respuesta en algunos conjuntos.
- La evaluacion agentica reporta un 0,0% de finalizacion autonoma de tareas (0 de 6 escenarios), lo que indica que el modelo no es fiable como agente sin supervision.
- Incoherencia interna en las especificaciones: ~30,9 B de parametros activos sobre 34,66 B totales y dimension oculta de 2.048 en 40 capas. Estos valores no encajan con una arquitectura MoE convencional y deberian verificarse antes de dimensionar infraestructura.
- Cobertura linguistica limitada a ingles e italiano. No hay soporte declarado de castellano, lo que puede degradar la calidad y la coherencia en aplicaciones en espanol.
- Riesgo de alucinacion: la model card reporta un 67% en TruthfulQA, un valor solo moderado. Sin datos adicionales de calibracion, no deberia usarse sin verificacion en dominios factuales sensibles.
- La memoria de la cache KV para los 262.144 tokens de contexto no se cuantifica. Usar la ventana completa puede agotar la VRAM mucho antes de lo que sugieren los ~19,6 GB de pesos.
- Las fechas de publicacion declaradas (12 de septiembre de 2026) son posteriores a la fecha habitual de referencia, un detalle que conviene contrastar.
- No se documentan sesgos especificos, composicion del dataset de entrenamiento ni filtros de seguridad aplicados. Al ser una cuantizacion, hereda los sesgos y las limitaciones del modelo base, pero tampoco estos se detallan.
- La cuantizacion Q4_K_S introduce perdida de precision respecto al modelo original; no se publica ninguna comparacion de degradacion entre el GGUF y los pesos completos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/nex-agi-Nex-N2.5-mini-GGUF-Q4_K_S
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Sigma Studio (repositorio GitHub): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
- Licencia Apache-2.0 referenciada en la model card: https://opensource.org/licenses/Apache-2.0
- Paper, blog o demo oficial del modelo base: no disponible en la informacion proporcionada.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces encontrados corresponden a perfiles del World Economic Forum y no guardan relacion con el contenido de esta ficha.
