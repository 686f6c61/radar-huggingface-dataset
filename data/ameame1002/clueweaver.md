# Ameame1002/ClueWeaver

## Resumen
ClueWeaver es un framework de razonamiento sobre evidencia compuesto por dos agentes, Finder e Interpreter, desarrollado por Ameame1002 y aceptado en ICONIP 2026. Su objetivo es la respuesta a preguntas sobre narrativas literarias largas utilizando modelos compactos que pueden ejecutarse en local, sin depender de APIs de modelos masivos. El Finder selecciona pasajes que contienen pistas a partir de segmentos guiados por recuperacion; el Interpreter responde usando unicamente la evidencia seleccionada, aporta citas mediante identificadores de parrafo y aplica una autocalibracion interna para preguntas de alto riesgo, reutilizando el mismo Interpreter y el mismo paquete de evidencia.

Ambos agentes parten de Qwen3-4B-Instruct y se entrenan por separado con GRPO, con funciones de recompensa diferenciadas: retencion de evidencia y fidelidad de las referencias de parrafo para el Finder, y correccion de la respuesta, fundamentacion y concision para el Interpreter. El repositorio publica pesos completos de los dos checkpoints en formato safetensors, con un tamano total de 16,9 GB, y no incluye adaptadores LoRA, estados del optimizador ni datasets.

La relevancia actual reside en que aborda el QA sobre contextos narrativos extensos con dos modelos de ~4.000 millones de parametros, combinando recuperacion, seleccion de evidencia y verificacion en un pipeline reproducible cuyos prompts, parser de respuestas y logica de autocalibracion se publican en el repositorio de GitHub del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso; modelo base declarado Qwen3-4B-Instruct. Framework de dos agentes con checkpoints independientes (Finder e Interpreter) |
| Parametros totales | Aproximadamente 4.000 millones por checkpoint (derivado del modelo base declarado); 16,9 GB de repositorio para el conjunto de los dos agentes |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; se publican pesos sin cuantizar. No se incluyen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (carga mediante transformers); pesos completos, no adaptadores LoRA |

## Arquitectura y entrenamiento
La arquitectura subyacente de cada agente es un transformer decoder-only correspondiente a Qwen3-4B-Instruct. Sobre esa base, ClueWeaver define un flujo de dos etapas: el Finder recibe segmentos guiados por recuperacion y selecciona los pasajes que contienen pistas, generando ademas una justificacion; el Interpreter responde a partir del paquete de evidencia seleccionado, cita identificadores de parrafo y aplica autocalibracion interna cuando detecta preguntas de alto riesgo. La autocalibracion no constituye un tercer agente: emplea el mismo Interpreter y la misma evidencia. Las respuestas estructuradas usan los campos `<reason>` y `<answer>`, y durante la inferencia debe desactivarse el razonamiento interno del modelo base (`enable_thinking=False` al aplicar la plantilla de chat de Qwen3, segun el apendice B del articulo).

El entrenamiento se realizo con GRPO de forma separada para cada agente, con recompensas centradas en la retencion de evidencia y la fidelidad de las referencias de parrafo (Finder) y en la correccion de la respuesta, la fundamentacion y la concision (Interpreter). No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. El empaquetado de evidencia en los resultados principales sigue la tupla `(N_E, P_r, P_w, B_c)`, donde `N_E` limita los segmentos seleccionados, `P_r` y `P_w` son los presupuestos de parrafos para segmentos anclados en recuperacion y ventanas locales, y `B_c` es el presupuesto de caracteres de la evidencia empaquetada. Las configuraciones declaradas por dataset son: DetectiveQA (10, 4, 6, 15000), InfiniteBench (7, 3, 6, 14000), LongBench v2 (8, 4, 6, 15000) y NoCha (10, 6, 8, 16000).

## Capacidades
- Seleccion de evidencia: el Finder identifica pasajes con pistas dentro de segmentos guiados por recuperacion y genera una justificacion asociada.
- Respuesta fundamentada con citas: el Interpreter responde usando el paquete de evidencia y devuelve identificadores de parrafo como referencia verificable.
- Autocalibracion interna: para preguntas de alto riesgo, el propio Interpreter revisa su respuesta con el mismo paquete de evidencia.
- Razonamiento de multiples pasos en el sentido del pipeline dual-agent (seleccionar evidencia y despues interpretarla), con salidas estructuradas en los campos `<reason>` y `<answer>`.
- Question answering sobre narrativa literaria larga, con presupuestos de evidencia de hasta 16.000 caracteres en la configuracion de NoCha.
- Capacidad de operar como componentes de un pipeline de recuperacion aumentada: segmentacion, recuperacion, seleccion y respuesta.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles; el unico dato declarado es el modelo base Qwen3-4B-Instruct.
- Modo de pensamiento: el modelo base dispone de razonamiento interno, pero el autor indica explicitamente que debe desactivarse durante la inferencia.

## Casos de uso
- Analisis de novelas policiacas y narrativa de misterio: el pipeline permite formular preguntas del tipo "quien cometio el crimen y que pistas lo sustentan" sobre el texto completo; el Finder acota los pasajes relevantes y el Interpreter devuelve la respuesta con citas de parrafo, lo que hace auditable cada conclusion.
- Asistente de lectura para obras extensas: un lector puede consultar detalles de tramas, personajes o cronologias sin releer el libro entero, con la garantia de que la respuesta se apoya en evidencia seleccionada y no en conocimiento externo del modelo.
- Verificacion editorial de citas: en la revision de ensayos o articulos sobre literatura, el Interpreter aporta identificadores de parrafo que permiten comprobar cada afirmacion contra el texto fuente antes de publicar.
- Componente de seleccion de evidencia en pipelines RAG existentes: el Finder puede utilizarse como selector/reranker de pasajes, con presupuestos configurables (por ejemplo, 10 segmentos y 15.000 caracteres en la configuracion de DetectiveQA), reduciendo el contexto enviado a un modelo de respuesta.
- Analisis de expedientes y transcripciones largas en dominios no literarios: la misma logica de seleccion de evidencia y respuesta citada es aplicable a informes extensos, actas o documentacion tecnica, ajustando los prompts publicados en el repositorio.
- Despliegue en local con requisitos de privacidad: al tratarse de dos modelos de ~4.000 millones de parametros, el pipeline completo puede ejecutarse en infraestructura propia sin enviar documentos confidenciales a servicios externos.
- Investigacion en aprendizaje por refuerzo para modelos compactos: los checkpoints GRPO permiten reproducir y estudiar el efecto de recompensas de retencion de evidencia y de fundamentacion en modelos de ~4B.
- Evaluacion comparativa en tareas de contexto largo: el pipeline esta disenado para los conjuntos DetectiveQA, InfiniteBench, LongBench v2 y NoCha, con configuraciones de empaquetado especificas por dataset, lo que facilita su inclusion en estudios comparativos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los resultados principales se evaluan sobre DetectiveQA, InfiniteBench, LongBench v2 y NoCha, y detalla la configuracion de empaquetado de evidencia empleada en cada uno, pero no incluye cifras de rendimiento:

| Dataset | Empaquetado de evidencia (N_E, P_r, P_w, B_c) | Resultados |
|---|---|---|
| DetectiveQA | (10, 4, 6, 15000) | No disponibles |
| InfiniteBench | (7, 3, 6, 14000) | No disponibles |
| LongBench v2 | (8, 4, 6, 15000) | No disponibles |
| NoCha | (10, 6, 8, 16000) | No disponibles |

## Requisitos de hardware
- VRAM estimada: aproximadamente 8-9 GB por agente en bf16/fp16 solo para los pesos; en torno a 16-17 GB si se cargan Finder e Interpreter simultaneamente, a lo que hay que sumar la cache KV, cuyo consumo crece con los presupuestos de evidencia de 14.000 a 16.000 caracteres.
- Cuantizacion: no se publican versiones cuantizadas. Como estimacion orientativa, 8 bits situarian cada agente en 4-5 GB y 4 bits en 2,5-3 GB, pero estas cifras no estan verificadas por el autor.
- GPU recomendadas: A100 (40/80 GB), H100, L40S (48 GB) o RTX 4090/3090 (24 GB) para ejecutar ambos agentes en bf16 con holgura.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) con los dos agentes en bf16; en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) es viable un unico agente en bf16, o ambos con cuantizacion de 8 bits.
- Opciones de despliegue: transformers con `subfolder="Finder"` o `subfolder="Interpreter"` y `device_map="auto"`; servidores compatibles con la arquitectura Qwen3 como vLLM, SGLang o TGI. El repositorio incluye el tag `endpoints_compatible`. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se proporciona.
- Consideracion de despliegue: es necesario servir los dos directorios por separado y aportar los prompts, la recuperacion, los identificadores de parrafo, el parser de respuestas y la logica de autocalibracion del repositorio de GitHub; cargar unicamente los pesos no reproduce el pipeline completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClueWeaver (Finder + Interpreter) | ~4.000 millones por agente | No disponible | Sin resultados publicados en la informacion disponible | No disponible | HuggingFace, 16,9 GB, 0 descargas y 0 likes |
| Qwen3-4B-Instruct (modelo base declarado) | ~4.000 millones | No disponible en esta informacion | Referencia de partida; sin datos comparativos aportados | No disponible en esta informacion | Publico en HuggingFace |
| Pipelines RAG genericos con un unico LLM | Variable segun el modelo elegido | Depende del modelo | No disponible | Depende del modelo | Amplia, multiples frameworks |

La busqueda web realizada no devolvio informacion relevante sobre ClueWeaver ni sobre modelos comparables, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. Cualquier comparacion con alternativas debe hacerse reproduciendo el pipeline completo, ya que la carga aislada de los pesos no equivale al sistema descrito.

## Limitaciones y advertencias
- El propio autor advierte de que el Finder puede omitir pistas importantes y de que el Interpreter puede generar respuestas o citas incorrectas; se recomienda contrastar el razonamiento generado con el texto fuente.
- Los checkpoints estan orientados a las tareas de seleccion de evidencia y razonamiento del articulo; el prompting generico de chat puede comportarse de forma distinta a la esperada.
- Cargar solo los pesos no reproduce el pipeline: se requieren los prompts, la recuperacion, los identificadores de parrafo, el parser de respuestas y la logica de autocalibracion del repositorio de GitHub.
- Es obligatorio desactivar el razonamiento interno del modelo base durante la inferencia (`enable_thinking=False`); no hacerlo altera el formato de salida esperado.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido. Al derivar de Qwen3-4B-Instruct, conviene verificar tambien las condiciones de licencia del modelo base antes de cualquier despliegue en produccion.
- No se declaran los idiomas soportados ni la longitud de contexto, dos datos criticos para planificar el despliegue.
- No se publican estados del optimizador ni datasets, por lo que el entrenamiento completo no es reproducible.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base de proposito general, pueden heredarse sesgos de su corpus de entrenamiento.
- Riesgo de alucinacion en las citas: el Interpreter puede referenciar parrafos de forma incorrecta, lo que afecta a la trazabilidad de la evidencia.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de la comunidad sobre su comportamiento.
- El empaquetado de evidencia esta fijado por dataset segun el apendice C del articulo; usarlo fuera de esas configuraciones puede degradar los resultados.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Ameame1002/ClueWeaver
- Articulo (arXiv): https://arxiv.org/abs/2608.25531
- PDF del articulo: https://arxiv.org/pdf/2608.25531
- Repositorio de GitHub: https://github.com/Ameame1/ClueWeaver
- Checkpoint Finder (documentacion incluida en el repositorio, subcarpeta `Finder/README.md`)
- Checkpoint Interpreter (documentacion incluida en el repositorio, subcarpeta `Interpreter/README.md`)
- Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas de historial meteorologico de Seattle y no guardan ninguna relacion con el modelo, por lo que no se han incluido.
