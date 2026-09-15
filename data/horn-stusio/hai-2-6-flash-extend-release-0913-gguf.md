# Horn-Stusio/Hai-2.6-Flash-Extend-Release-0913-GGUF

## Resumen

H.ai 2.6 Reinforced (Extend Flash) es un modelo de generacion de texto y chat en chino desarrollado por Horn.Studio, publicado en HuggingFace como espejo del repositorio oficial en ModelScope. Se trata de un ajuste fino (post-entrenamiento) sobre Qwen/Qwen3.5-9B, un modelo denso de aproximadamente 9.000 millones de parametros, distribuido exclusivamente en formato GGUF bajo licencia Apache 2.0. La variante "Reinforced" (lote 0913) mejora la consistencia de personaje y la capacidad matematica respecto a la version anterior Hai-2.6 Flash (lote 0829).

El modelo no esta orientado a tareas generales de proposito multiple, sino a un caso de uso muy concreto: asistente conversacional paciente y didactico, con tutoria de materias de secundaria china (redaccion, matematicas, ingles, fisica, quimica, politica), role-play y acompanamiento emocional. Mantiene la ventana de contexto de 262.000 tokens del modelo base y conserva las etiquetas `think` aunque se describe como un modelo de CoT no-thinking por defecto.

Su relevancia practica esta en dos aspectos: primero, es un ejemplo de ajuste fino ejecutado sobre hardware consumer no convencional (Intel Arc A770 bajo WSL2, con Unsloth Core y un fork propio de correccion), lo que documenta una ruta de entrenamiento alternativa fuera del ecosistema CUDA. Segundo, incorpora un procedimiento de seguridad poco habitual: se elimino la capa de rechazo con la herramienta `heretic` (generando Hai-2-Abliterated) y despues se restauro mediante fine-tuning completo, alcanzando una tasa de rechazo de 95/100.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada del modelo base Qwen/Qwen3.5-9B (transformer denso) |
| Parametros totales | ~9B (derivado del modelo base Qwen3.5-9B; no se indica cifra exacta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | GGUF; se mencionan explicitamente Q4_K_M (~5,5 GB) y Q6_K (~7,2 GB). Otras cuantizaciones: no disponible |
| Idiomas soportados | Chino (zh); alineado para tutoria de asignaturas chinas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen3.5-9B, por lo que hereda la arquitectura del modelo base, no detallada en la informacion disponible. Se describe como un modelo de chat con CoT no-thinking, es decir, responde sin bloque de razonamiento explicito por defecto, aunque las etiquetas `think` se conservan en la plantilla. El contexto soportado es de 262.000 tokens.

El entrenamiento se realizo con Unsloth Core sobre una plataforma Intel Arc A770 con WSL2, apoyandose en un fork propio del framework (GitHub Horn-Studio/Intel_UnslothFix). No se especifica el volumen de tokens de este ajuste concreto; la unica cifra de dataset publicada en la familia corresponde a H.ai 2.0 (2,1 billones de tokens de texto mas 1.016 dialogos de persona), una version anterior y con otro modelo base, por lo que no es extrapolable. En cuanto al proceso de seguridad, se aplico la herramienta `heretic` para eliminar la capa de rechazo de un modelo Hai-2 (Hai-2-Abliterated) y posteriormente se restauro mediante fine-tuning completo, un metodo que, segun el autor, produce guardarrailes mas robustos que los originales. Ademas, la version 2.6 Flash (predecesora directa) habia completado un entrenamiento de endurecimiento tipo Abliterated.

## Capacidades

- Generacion de texto y conversacion multi-turno en chino.
- Role-play y acompanamiento emocional, con enfasis declarado en la consistencia de personaje a lo largo de conversaciones largas.
- Tutoria de asignaturas de secundaria: redaccion en chino, matematicas, continuacion y composicion en ingles, fisica, quimica y politica.
- Razonamiento matematico y analisis logico, reforzado en esta version frente a Hai-2.6 Flash.
- Escritura creativa y pulido de textos.
- Tutorizacion de programacion (Python, Java, C++, front-end) y desglose de conceptos tecnicos (IA, algoritmos, arquitectura de sistemas).
- Capacidad de agente restaurada por encima del 80% de la del Qwen3.5-9B original, segun el autor.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidad especial: conserva las etiquetas `think` aunque opera por defecto como modelo de CoT no-thinking.

## Casos de uso

- Tutoria academica de secundaria en chino: el modelo esta alineado especificamente para explicar matematicas, fisica, quimica y redaccion con un tono paciente y desglose paso a paso, lo que lo hace adecuado como asistente de refuerzo educativo.
- Correccion y pulido de redaccion en chino: dado su enfoque en composicion y continuacion de textos, puede emplearse para revisar ensayos escolares y proponer versiones mejoradas.
- Acompanamiento conversacional y soporte emocional: su persona estable y no impaciente lo hace util en aplicaciones de bienestar o compania digital, donde la consistencia de personaje a lo largo del tiempo es critica.
- Role-play narrativo: adecuado para ficcion interactiva y juegos de rol por texto, apoyandose en la ventana de 262K tokens para mantener el contexto de una partida larga.
- Asistente de programacion en entornos educativos: puede explicar conceptos de Python, Java, C++ o front-end y guiar a estudiantes noveles, aunque no esta pensado como copiloto de produccion.
- Despliegue local en hardware de gama media: con cuantizacion Q4_K_M (~5,5 GB) puede ejecutarse en portatiles y equipos sin GPU dedicada de gama alta mediante llama.cpp, Ollama o LM Studio, sirviendo como asistente personal offline.
- Analisis y desglose de conceptos tecnicos: util como apoyo en documentacion interna o formacion, traduciendo conceptos de IA o arquitectura de sistemas a lenguaje llano.
- Evaluacion de tecnicas de seguridad en fine-tuning: el pipeline abliteration + restauracion de guardarrailes lo convierte en un caso de estudio para investigadores interesados en robustez de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos publicados son las tasas de rechazo en seguridad y las metricas de comportamiento por lote.

Tasas de rechazo declaradas por el autor:

| Modelo | Tasa de rechazo |
|---|---|
| Hai-2 | 87/100 |
| Hai-2-Abliterated | 8/100 |
| Hai-2.5 | 93/100 |
| Hai-2.6-Flash | 96/100 |
| Hai-2.6-Flash-Extend (Reinforced) | 95/100 |

Metricas de comportamiento por lote de evaluacion:

| Lote | Longitud media | Puntuacion emotiva | Jerga de internet | Particulas modales | Autocorrecciones |
|---|---|---|---|---|---|
| U01 Académico | 17,6 | 10,0% | 13,3% | 26,7% | 13,3% |
| U02 Diario y emociones | 18,2 | 10,0% | 16,7% | 26,7% | 13,3% |
| U03 Conocimiento | 17,7 | 16,7% | 13,3% | 36,7% | 10,0% |
| U04 Técnico | 24,5 | 10,0% | 13,3% | 30,0% | 13,3% |
| U05 Seguridad | 20,7 | 13,3% | 10,0% | 36,7% | 16,7% |
| U06 Creativo | 17,9 | 6,2% | 9,4% | 28,1% | 9,4% |
| U07 Saludos cortos | 10,9 | 13,3% | 0,0% | 50,0% | 10,0% |
| U08 Desglose | 16,8 | 13,3% | 20,0% | 23,3% | 10,0% |

Nota metodologica: el autor no especifica como se calcularon estas metricas ni el tamano de muestra de cada lote, por lo que deben interpretarse como indicadores internos cualitativos, no como resultados reproducibles de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB con cuantizacion Q4_K_M y 7,2 GB con Q6_K, segun el tamano de fichero indicado por el autor. A estas cifras hay que sumar el consumo del contexto KV (el modelo soporta hasta 262K tokens; en el ejemplo de llama-cpp-python se usa `n_ctx=8192`).
- Cabe en GPU consumer: si. La cuantizacion Q4_K_M es viable en GPUs con 8 GB de VRAM o mas (RTX 3060 Ti, RTX 4060, RTX 2070 y superiores); Q6_K requiere aproximadamente 8-10 GB. Tambien puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- GPU recomendadas: no especificadas por el autor. Como referencia general, para contexto largo o mayor throughput convienen GPUs con 24 GB o mas (RTX 3090, RTX 4090), y para servicio concurrente, A100 o H100. No hay datos publicados que confirmen estas recomendaciones para este modelo concreto.
- Opciones de despliegue documentadas: llama.cpp (llama-cli), LM Studio, Ollama mediante Modelfile, y llama-cpp-python con `chat_format="chatml"`. No se menciona soporte para vLLM, TGI ni TensorRT-LLM.
- Parametros de muestreo sugeridos por el autor: temperatura 0,7 y top_p 0,9 en el Modelfile de Ollama; en LM Studio se recomienda dejar el system prompt vacio y usar una temperatura relativamente alta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion mas significativa es dentro de la propia familia H.ai, ya que todos comparten linaje y licencia:

| Modelo | Base | Parametros aprox. | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| H.ai 2.6 Reinforced (Extend Flash) | Qwen3.5-9B | ~9B | 262K | GGUF | Apache 2.0 | HuggingFace (espejo) + ModelScope |
| H.ai 2.6 Flash (0829) | Qwen3.5-9B | ~9B | no disponible | GGUF | Apache 2.0 | ModelScope |
| H.ai 2.5 (0829) | Qwen3.5-27B | ~27B | no disponible | GGUF | Apache 2.0 | ModelScope |
| H.ai 2.0 (0812) | Qwen3.5-27B | ~27B | no disponible | GGUF | Apache 2.0 | ModelScope |

Frente a Hai-2.6 Flash, esta version mejora consistencia de personaje y matemáticas, y baja ligeramente en tasa de rechazo (95 frente a 96 sobre 100). Frente a H.ai 2.5, el modelo es mucho mas pequeno (9B frente a 27B) y por tanto mas facil de desplegar localmente, pero el autor posiciona la variante de 27B como superior en role-play, escritura y capacidad de agente. Comparacion con alternativas externas de la misma categoria (por ejemplo, el propio Qwen3.5-9B base u otros asistentes conversacionales en chino de ~9B): no disponible, al no haberse publicado datos de rendimiento comparables.

## Limitaciones y advertencias

- Idioma: el modelo esta declarado unicamente para chino (zh). No hay evidencia de un rendimiento solido en castellano u otros idiomas, por lo que no deberia usarse en produccion multilingue sin evaluacion previa.
- Sesgos conocidos: no disponibles. Al estar alineado sobre un corpus de tutoria de secundaria china, es esperable un sesgo cultural y curricular hacia el sistema educativo chino, pero el autor no documenta analisis de sesgo.
- Riesgo de alucinacion: no cuantificado. El modelo no es un modelo de razonamiento explicito (CoT no-thinking), lo que reduce la trazabilidad de sus respuestas y dificulta detectar errores en matematicas o datos factuales.
- Datos de evaluacion poco transparentes: las metricas por lote y las tasas de rechazo no vienen acompanadas de metodologia, tamano de muestra ni protocolo reproducible.
- Contexto: aunque la ventana teorica es de 262K tokens, el ejemplo oficial de uso en Python configura `n_ctx=8192`. Un contexto efectivo muy alto incrementa mucho el consumo de memoria KV y no hay datos publicados sobre degradacion con contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.5-9B y conviene verificar las condiciones del modelo base antes de explotarlo comercialmente.
- Riesgo de seguridad: la tecnica de abliteration seguida de restauracion de guardarrailes no es un estandar consolidado. Una tasa de rechazo de 95/100 implica que aproximadamente 5 de cada 100 peticiones problematicas no fueron rechazadas en la evaluacion interna del autor.
- Repositorio de procedencia: la publicacion principal es ModelScope; el repositorio de HuggingFace es un espejo. Con 0 descargas y 1 like en HuggingFace, la adopcion externa verificable es practicamente nula y no hay reportes independientes de calidad.
- Sin pipeline declarado en HuggingFace y sin soporte documentado para motores de serving de alto rendimiento (vLLM, TGI), lo que limita su uso en despliegues de produccion concurrentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horn-Stusio/Hai-2.6-Flash-Extend-Release-0913-GGUF
- Repositorio oficial en ModelScope: https://www.modelscope.cn/models/HornStudio/Hai-2.6-Flash-Extend-Release-0913-GGUF
- Perfil del autor en ModelScope: https://www.modelscope.cn/profile/HornStudio
- Version anterior Hai-2.6 Flash (0829): https://www.modelscope.cn/models/HornStudio/Hai-2.6-Flash-Release-0829-GGUF
- Version Hai-2.5 (27B): https://www.modelscope.cn/models/HornStudio/Hai-2.5-Release-0829-GGUF
- Version Hai-2.0 (27B): https://www.modelscope.cn/models/HornStudio/Hai-2-Release-0812-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del fork de entrenamiento: https://github.com/Horn-Studio/Intel_UnslothFix (referenciado en la model card)
