# DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI

## Resumen

Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI es un ajuste fino (finetune) del modelo base thinkingmachines/Inkling-2-Mini, publicado por el usuario DavidAU en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, una version en la que se ha reducido deliberadamente la tendencia del modelo a rechazar peticiones, acompanada de un conjunto de system prompts y "constructs" propietarios del autor (Turbo Brilliance V2 50x AGI) que anaden modos de razonamiento, modos instruct y lo que el autor denomina "AI Constructs" y "AGI Constructs".

El modelo base es un Mixture of Experts (MoE) de 26.388.641.280 parametros totales (unos 26,4 mil millones) con "looping processing" y una ventana de contexto que el autor declara de 1 millon de tokens. El finetune conserva la licencia Apache 2.0 y se distribuye en formato safetensors (bfloat16), con un repositorio de 53,5 GB. La model card menciona que existe una version cuantizada en GGUF en un repositorio separado del mismo autor.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de modelo MoE de ~26B con contexto muy largo; por otro, ilustra el fenomeno de los finetunes "uncensored" con system prompts empaquetados, cuyas afirmaciones (27 modos de razonamiento, 21 AGI Constructs, reduccion de rechazos de 100/100 a 5/100) deben tratarse con cautela porque proceden del propio autor y no de una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con "looping processing"; modelo base thinkingmachines/Inkling-2-Mini |
| Parametros totales | 26.388.641.280 (~26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 de tokens (segun la model card del autor) |
| Tipos de cuantizacion | safetensors en bfloat16 en este repo; GGUF (incluye Q4_K_M citado en la model card) en repositorio separado |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); GGUF en el repo NEO-GGUF del mismo autor |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, de thinkingmachines, es un transformer con arquitectura Mixture of Experts y un mecanismo que el autor denomina "looping processing", orientado a extender el contexto hasta 1 millon de tokens. El finetune de DavidAU no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card se limita a describir el proceso como una version "Heretic'ed" (abliterated) del modelo original, con cuatro variantes probadas por el autor antes de elegir la final.

La innovacion principal que declara el autor no esta en los pesos sino en el empaquetado de system prompts: los "Turbo Brilliance V2 50x AGI" incluyen 27 modos de razonamiento, 27 modos instruct, 15 AI Constructs, 5 Super AI Constructs y 21 AGI Constructs, con modos de razonamiento etiquetados como "minimal", "medium", "high" y "xhigh". El autor afirma que el modo "high" del modelo base se activa automaticamente cuando no se usan estos sistemas. No se aporta informacion sobre la composicion del dataset de abliteration ni sobre el metodo exacto empleado para reducir los rechazos.

## Capacidades

- Generacion de texto y razonamiento en multiples modos ("minimal", "medium", "high", "xhigh"), seleccionables mediante los system prompts del autor.
- Generacion de codigo, segun la etiqueta "coder" de la model card.
- Escritura creativa, ficcion, narrativa y roleplaying en "todos los generos", segun el autor.
- Procesamiento image-text-to-text (pipeline declarado en Hugging Face), aunque la model card no detalla la arquitectura de vision.
- Soporte de "AI Constructs" y "AGI Constructs": plantillas de 6.000 a 8.000 instrucciones que el autor describe como generadas dinamicamente a partir del prompt del usuario (por ejemplo, el construct "{REASON:agi-musk-curie}").
- Capacidades multilingues limitadas a ingles y chino.
- Reduccion de rechazos declarada por el autor: de 100/100 a 5/100 en una prueba propia (7/97 con "thinking" activado).
- No se documenta soporte explicito de tool calling, function calling ni de agentes multi-paso mas alla de la etiqueta "Agent AI Construct".

## Casos de uso

- Generacion de ficcion y narrativa larga: el contexto declarado de 1 millon de tokens permite mantener coherencia en novelas o sagas con muchos personajes y tramas secundarias, algo inviable en modelos con ventanas de 8K-32K.
- Roleplaying y escritura creativa sin restricciones tematicas: la variante "heretic" reduce los rechazos, lo que resulta util en talleres de escritura que abordan temas sensibles (violencia en ficcion, personajes moralmente ambiguos).
- Analisis de documentos extensos: informes tecnicos, expedientes o bases de conocimiento de cientos de miles de tokens que caben en una sola ventana sin necesidad de RAG.
- Asistencia a la programacion en entornos controlados: la etiqueta "coder" y los modos de razonamiento permiten usarlo para generar y explicar codigo, aunque sin garantias de tool calling verificado.
- Experimentacion con system prompts complejos: util para investigadores que estudian el efecto de instrucciones largas (6.000-8.000 tokens) en el comportamiento del modelo, ya que el autor publica los "constructs" como parte del paquete.
- Generacion de material didactico bilingue ingles-chino: el soporte de ambos idiomas permite crear explicaciones paralelas, aunque no cubre el castellano.
- Prototipado de agentes con "Agent AI Construct": sirve para probar flujos de agente sencillos, siempre que se validen manualmente las salidas por el riesgo de alucinacion.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden del autor y comparan la variante heretic con el modelo base en su propia prueba:

| Metrica | Modelo base (segun autor) | Variante heretic |
|---|---|---|
| Rechazos (prueba del autor) | 100/100 | 5/100 (7/97 con thinking) |
| MMLU | 78,7 % | 77,0 % |
| Divergencia KL | no disponible | 0,120 |

No se han publicado resultados independientes de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible. Las cifras anteriores deben interpretarse como declaraciones del autor, no como evaluaciones verificadas.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 52,8 GB solo para pesos (26,4 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se necesitan 60-80 GB para contexto moderado.
- VRAM estimada en Q4_K_M (GGUF): alrededor de 16-18 GB para pesos, con margen adicional para cache KV segun la longitud de contexto.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16 con contexto largo; para cuantizaciones Q4 se puede usar una RTX 4090 (24 GB) o una RTX 3090 (24 GB), con contexto limitado.
- Cabe en GPU de consumo: si, en cuantizacion Q4 o inferior y con ventanas de contexto reducidas; el contexto de 1 millon de tokens no es viable en 24 GB.
- Opciones de despliegue: llama.cpp y LM Studio (el autor cita LM Studio con Q4_K_M), vLLM y TGI para bfloat16; el autor advierte de que hay actualizaciones en curso en llama.cpp y transformers para soportar Inkling.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-26B-Heretic (este) | ~26,4 B (MoE) | 1 M (declarado) | Apache 2.0 | Hugging Face, safetensors + GGUF |
| thinkingmachines/Inkling-2-Mini (base) | ~26,4 B (MoE) | 1 M (declarado) | Apache 2.0 | Hugging Face |
| Mixtral 8x7B | 46,7 B (MoE, 12,9 B activos) | 32K | Apache 2.0 | Hugging Face, amplia comunidad |
| Qwen2.5-32B | 32,5 B (denso) | 128K | Apache 2.0 | Hugging Face |

La comparativa con Mixtral y Qwen2.5 es orientativa por tamano y categoria; no se dispone de benchmarks comparativos publicados para este finetune concreto. El contexto de 1 millon de tokens declarado supera ampliamente al de los modelos de la tabla, pero no ha sido verificado de forma independiente.

## Limitaciones y advertencias

- Las cifras de reduccion de rechazos y de MMLU proceden de pruebas del propio autor, sin validacion externa.
- La variante "uncensored/abliterated" elimina parte de las salvaguardas del modelo base; no es adecuada para aplicaciones de cara al publico sin filtros adicionales.
- El riesgo de alucinacion aumenta en modos de razonamiento "xhigh" con constructs largos, ya que el modelo genera cadenas de razonamiento extensas sin verificacion factual.
- Soporte limitado a ingles y chino; no hay garantias de calidad en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del finetune ni sobre los derechos de los system prompts empaquetados.
- El contexto de 1 millon de tokens es una declaracion del autor; el rendimiento real en ventanas extremas no esta documentado.
- Hay actualizaciones en curso en llama.cpp y transformers que pueden afectar a la compatibilidad y al formato de salida (el autor menciona etiquetas de razonamiento visibles en la salida).
- El modelo base y este finetune tienen pocas descargas (306) y likes (29), por lo que la comunidad de validacion es reducida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Repositorio GGUF del autor: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de referencia de los constructs Turbo Brilliance: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Variante heretic citada: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full-GGUF
