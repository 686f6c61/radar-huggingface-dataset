# 4waiz/Rabt-1.0-9B

## Resumen

Rabt 1.0 9B es un ajuste fino (fine-tune) del modelo Qwen3.5-9B desarrollado por Eng. Awaiz Ahmed en Kanban Studios (Abu Dabi, Emiratos Arabes Unidos). No es un modelo de proposito general, sino un asistente personal disenado para ejecutarse integramente en local sobre el ordenador del usuario, con un enfasis explicito en privacidad, aprobacion humana previa a cualquier accion y resistencia a inyeccion de instrucciones ocultas en correos, ficheros o paginas web.

El modelo se presenta como el buque insignia de la familia Rabt 1.0, que incluye variantes de 2B y 4B. Hereda de Qwen3.5 una arquitectura hibrida que combina atencion lineal Gated DeltaNet en la mayoria de capas con atencion completa cada cuatro capas, lo que permite mantener contextos largos con coste recurrente reducido. La model card declara una ventana de contexto de 256K tokens y soporte de cinco idiomas principales: ingles, arabe, frances, hindi y urdu.

Su relevancia actual radica en el enfoque "local-first" para agentes con capacidad de accion sobre el sistema de ficheros, correo y calendario, y en el entrenamiento explicito para no declarar completadas acciones que siguen pendientes de aprobacion, un fallo habitual en modelos generalistas cuando se usan como agentes. El pipeline declarado en HuggingFace es image-text-to-text, coherente con el modelo base multimodal, aunque la model card no detalla las capacidades de vision del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal Gated DeltaNet en la mayoria de capas y atencion completa con compuertas cada 4 capas (heredada de Qwen3.5) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M, ~5,8 GB); otras cuantizaciones no detalladas |
| Idiomas soportados | Ingles (en), arabe (ar), frances (fr), hindi (hi), urdu (ur); habilidades multilingues adicionales heredadas del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

Rabt 1.0 9B conserva el diseno hibrido de Qwen3.5: la mayoria de capas emplean Gated DeltaNet, una atencion lineal con memoria recurrente que abarata el coste de contextos largos, mientras que cada cuarta capa usa atencion completa con compuertas para mantener precision en el recuerdo exacto de tokens. Esta combinacion es la que permite sostener una ventana de 256K tokens sin el crecimiento cuadratico tipico de un transformer denso clasico. El modelo base es multimodal (pipeline image-text-to-text), aunque la model card del ajuste no especifica que capacidades de vision se conservan tras el fine-tune.

El ajuste se realizo mediante QLoRA (la etiqueta `qlora` figura en los tags del repositorio). La model card no publica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. El entrenamiento esta orientado a cuatro objetivos declarados: identidad propia coherente en los cinco idiomas, honestidad sobre el estado real de las acciones (no afirmar que algo se ha hecho si sigue pendiente de aprobacion), tratamiento de texto no confiable como datos y no como instrucciones, y uso correcto de herramientas (tool calling) en ingles, frances y arabe. El modelo declara abiertamente que esta construido sobre Qwen3.5 cuando se le pregunta por su origen.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento y redaccion: la model card lo describe como el miembro de la familia con mayor capacidad de razonamiento, escritura y uso de herramientas.
- Tool calling / function calling: invocacion de herramientas para correo, calendario, ficheros y generacion de documentos; evaluado en ingles, frances y arabe.
- Comportamiento agentico con aprobacion humana (human-in-the-loop): propone acciones y espera confirmacion antes de ejecutarlas.
- Resistencia a inyeccion de prompt: trata instrucciones ocultas en correos, ficheros y paginas web como contenido, no como ordenes.
- Multilingue: identidad y reglas mantenidas en ingles, arabe, frances, hindi y urdu.
- Capacidades multimodales heredadas del modelo base (pipeline image-text-to-text), sin detalle de alcance en la model card.
- Identidad explicita: se identifica como Rabt 1.0, creado por Eng. Awaiz Ahmed en Kanban Studios, y reconoce su base Qwen3.5.
- Despliegue local via Ollama y llama.cpp; compatible con endpoints.

## Casos de uso

- Asistencia personal en local con datos sensibles: abogados, medicos o ingenieros que no pueden enviar informacion a servicios en la nube pueden ejecutar el modelo en su propio portatil (8 GB+ de memoria) y mantener los datos en el dispositivo.
- Gestion de correo con aprobacion previa: el modelo redacta y propone el envio de correos, pero no declara que se han enviado hasta que el usuario aprueba la accion, lo que encaja en flujos donde un error de confirmacion es costoso.
- Automatizacion de calendario y documentos: creacion de hojas de calculo y documentos ofimaticos mediante tool calling, con el modelo como planificador de acciones sobre herramientas locales.
- Defensa frente a inyeccion de prompt en pipelines documentales: procesamiento de correos, PDFs o paginas web no confiables donde el texto puede contener instrucciones maliciosas; el modelo esta entrenado para tratarlas como datos.
- Atencion multilingue en contextos del Golfo Persico: conversaciones en arabe, urdu, hindi, frances e ingles con la misma identidad y reglas, util para entornos con plantillas diversas como los EAU.
- Orquestacion de equipos de agentes: la model card menciona que el asistente delega trabajos mayores a un equipo de agentes; Rabt 1.0 9B actua como modelo de razonamiento y planificacion en ese esquema.
- Despliegue en hardware de consumo: con cuantizacion Q4_K_M (~5,8 GB) cabe en GPU de 8 GB o superiores, lo que permite prototipar agentes locales sin infraestructura dedicada.

## Benchmarks y rendimiento

Los datos publicados en la model card son evaluaciones internas cualitativas, no benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K). Se reproducen tal cual, comparando con Qwen3.5-9B a temperatura 0 y con prompts no vistos en entrenamiento:

| Prueba | Rabt 1.0 9B | Qwen3.5-9B (base) |
|---|---|---|
| Identidad y creador, 11 prompts en 5 idiomas | 11/11 | 0/11 |
| Honestidad: no afirmar accion completada si espera aprobacion | 4/4 | 2/4 |
| Inyeccion: ignorar instrucciones ocultas en correos, ficheros y webs | 6/6 | 6/6 |
| Herramientas: invocar la herramienta correcta en peticiones simples (EN, FR, AR) | 6/6 | 6/6 |
| Benchmark del motor Rabt: 14 turnos reales retenidos con 21 herramientas | 12/14 | 14/14 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Destaca que el modelo base supera al ajuste en el benchmark del motor Rabt (14/14 frente a 12/14), lo que sugiere una posible perdida de competencia agentica generica a cambio de los comportamientos especificos de identidad y honestidad.

## Requisitos de hardware

- VRAM estimada: ~5,8 GB con cuantizacion Q4_K_M; el repositorio completo en safetensors ocupa 5,8 GB (pesos en BF16/FP16 aproximadamente 18,4 GB, aunque el tamano del repo indicado es 5,8 GB, posiblemente por pesos ya cuantizados o comprimidos).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para Q4_K_M; A100 o H100 para inferencia en precision completa y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores (por ejemplo, RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB). La model card sugiere 8 GB+ para la variante 9B.
- Opciones de despliegue: Ollama y llama.cpp (soporte explicito en la model card), ademas de transformers y servidores compatibles con endpoints; vLLM y TGI no se mencionan explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rabt 1.0 9B | ~9,2B | 256K | Asistente personal local-first con aprobacion humana | Apache 2.0 | HuggingFace, Ollama, llama.cpp |
| Qwen3.5-9B (base) | ~9B | 256K (heredado) | Modelo generalista multimodal | Apache 2.0 (segun modelo base) | HuggingFace |
| Rabt 1.0 4B | ~4B | no disponible | Asistente personal local-first, tier Core | Apache 2.0 | HuggingFace |
| Rabt 1.0 2B | ~2B | no disponible | Asistente personal local-first, tier Mini (CPU) | Apache 2.0 | HuggingFace |

Frente al modelo base, Rabt 1.0 9B gana en identidad, honestidad sobre acciones pendientes y coherencia multilingue de su personaje, pero pierde en el benchmark interno del motor Rabt (12/14 frente a 14/14). No se dispone de comparaciones con otros asistentes locales de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste puede degradar competencias genericas del modelo base: en el benchmark del motor Rabt, Qwen3.5-9B obtiene 14/14 frente a 12/14 del ajuste.
- No hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K), por lo que el rendimiento en tareas generales de razonamiento, codigo o matematicas no esta cuantificado.
- La model card no detalla el dataset de entrenamiento, el numero de tokens ni si hubo RLHF/DPO, lo que dificulta evaluar sesgos y cobertura.
- El modelo esta optimizado para el ecosistema de la app Rabt (prompt propio y 21 herramientas); su comportamiento fuera de ese entorno puede diferir del reportado.
- Riesgo de alucinacion no cuantificado: aunque se entrena para no declarar acciones no ejecutadas, no hay evaluacion de alucinacion factual general.
- Cobertura idiomatica declarada limitada a cinco idiomas principales; el rendimiento en otros idiomas depende del modelo base y no esta verificado.
- Las capacidades de vision heredadas del modelo base no estan documentadas en el ajuste; no asumir paridad multimodal.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y con pocas descargas (60 en el momento de la consulta) y sin validacion externa.
- Proyecto muy reciente (creado el 31 de octubre de 2026) y con un unico autor; madurez y soporte a largo plazo inciertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/4waiz/Rabt-1.0-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Rabt 1.0 2B: https://huggingface.co/4waiz/Rabt-1.0-2B
- Rabt 1.0 4B: https://huggingface.co/4waiz/Rabt-1.0-4B
- Sitio del producto Rabt: https://rabt.kanbanstudios.ae
- Resultados de evaluacion completos: `eval/results.json` (referenciado en la model card)
