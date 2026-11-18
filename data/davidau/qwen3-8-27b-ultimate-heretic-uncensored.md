# DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B publicado por el usuario DavidAU en Hugging Face. Se distribuye con licencia Apache 2.0, tiene 27.781.427.952 parámetros reales según los pesos en safetensors y un repositorio de 55,6 GB. El pipeline declarado es image-text-to-text y la librería es transformers, lo que indica que hereda la torre de visión del modelo base. La propuesta del autor es un modelo "sin censura" (uncensored) orientado a usos generales, con énfasis en razonamiento, escritura creativa, rol y generación de código.

El modelo se presenta como un "split" de un proyecto mayor del mismo autor y emplea lo que la model card denomina "Turbo Brilliance V2 50X AGI", un sistema de modos de operación embebidos (27 modos de razonamiento, 27 modos de instruct, y varias "AI Constructs" y "AGI Constructs") que se activan mediante directivas en el prompt. Según el autor, la revisión del 16 de noviembre de 2026 aplica "Heretic 2.1 ARA" para una eliminación de rechazos más profunda y mejor KLD.

Es relevante ahora porque combina un modelo base de 27B con contexto declarado de hasta 256k tokens y un conjunto de comportamientos preconfigurados orientados a reducir la fricción en tareas creativas y de rol, algo que los modelos alineados convencionalmente suelen limitar. No obstante, la mayor parte de las afirmaciones de rendimiento proceden del propio autor y no están respaldadas por benchmarks independientes en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5`), con torre de visión (pipeline image-text-to-text); el autor menciona variantes "MTP" y un experimento "Looping Transformer" separado |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 256k tokens máximo según el autor; mínimo recomendado 32k, sugerido 64k-128k |
| Tipos de cuantizacion | GGUF en repositorio separado (el autor cita Q6 no imatrix en sus pruebas); pesos fuente en bfloat16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (la ficha de HF lista solo `en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fuente); GGUF en repo aparte |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.8 y del pipeline image-text-to-text, que implica un transformer multimodal con codificador visual. El autor etiqueta el modelo con `qwen3_5` y menciona "MTP" en los repositorios de cuantizaciones, sin especificar su significado ni su configuración. Tampoco se publican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO sobre el modelo base.

El entrenamiento descrito es un ajuste fino multi-etapa sobre Qwen/Qwen3.8-27B, con datasets propios del autor (DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets) y herramientas como unsloth. La innovación declarada es doble: por un lado, el proceso "Heretic" (en su versión 2.1 ARA en la revisión de noviembre de 2026), orientado a eliminar comportamientos de rechazo manteniendo una divergencia KL controlada respecto al modelo original; por otro, el sistema "Turbo Brilliance V2 50X", que embebe en el modelo modos de operación seleccionables por prompt (razonamiento, instruct, constructos de agente, profesor, coder, etc.) y un sistema de ayuda interactiva que se invoca escribiendo `help`.

## Capacidades

- Generación de texto general con modo de razonamiento explícito (thinking) y modos instruct seleccionables.
- Razonamiento multi-paso mediante los modos declarados por el autor (27 modos de razonamiento, 9 de ellos etiquetados como "Xhigh").
- Generación de código y tareas de programación a través del "Coder AI Construct".
- Escritura creativa en múltiples géneros: narrativa, ficción, rol y conversación multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la model card no detalla tareas visuales concretas.
- Soporte multilingüe declarado en 16 idiomas, con especial atención a en, zh, es, fr, de, ja y ru.
- Comportamiento "uncensored": el ajuste Heretic reduce los rechazos del modelo base en temas sensibles.
- Constructos de agente y "AGI Constructs" para flujos de trabajo guiados por instrucciones largas; el autor documenta el procesamiento de unas 8.000 tokens de instrucciones en segundos.
- Sistema de ayuda embebido: introducir `help` como prompt muestra los modos disponibles y su uso.

## Casos de uso

- Escritura creativa y narrativa larga: con contexto de hasta 256k tokens, el modelo puede mantener coherencia en novelas, guiones o sagas con múltiples arcos argumentales, y los modos de instruct permiten fijar tono y género de forma explícita.
- Roleplay y personajes persistentes: el ajuste uncensored y los constructos de personaje permiten conversaciones multi-turno sin los rechazos típicos de modelos alineados, útil en videojuegos narrativos y plataformas de rol.
- Generación de código en pipelines internos: el "Coder AI Construct" y el modo instruct con temperatura recomendada de 0,6-0,7 lo hacen apto para asistentes de programación integrados en herramientas de desarrollo, aunque requiere validación humana por el riesgo de alucinación.
- Procesamiento de documentos extensos con imagen: al ser image-text-to-text, puede extraer y razonar sobre información de capturas, diagramas o páginas escaneadas junto con texto largo en una sola ventana de contexto.
- Asistencia a la docencia y explicaciones adaptadas: el "Universal Teacher AI Construct" está pensado para reformular conceptos según el nivel del usuario, aprovechando los modos de razonamiento para descomponer problemas.
- Ideación y tormenta de ideas de negocio: el "Brainstorm Business AI Construct" permite sesiones estructuradas de generación y evaluación de ideas con contexto de negocio largo.
- Agentes autónomos de un solo modelo: los constructos de agente y la ventana de 256k permiten mantener el estado de una tarea compleja (herramientas, resultados intermedios, instrucciones) sin truncar el contexto.
- Moderación y análisis de contenido sensible en entornos controlados: su menor tasa de rechazos facilita analizar material delicado (por ejemplo, literatura violenta o discursos de odio) con fines de investigación, siempre con salvaguardas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye demostraciones cualitativas del autor (pruebas de instrucciones largas, generación de SVG y textos extensos) y mediciones de tiempo aproximadas, pero no tablas de MMLU, HumanEval, GSM8K ni comparaciones estandarizadas.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 56 GB solo para pesos, más overhead de KV cache; se necesitan 2 GPU de 80 GB (A100/H100) o una H200 para contexto largo.
- Cuantización Q8: en torno a 28-30 GB de pesos; cabe en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantización Q6: aproximadamente 22-24 GB; ajusta en una RTX 4090 de 24 GB con contexto moderado.
- Cuantización Q4: en torno a 16-18 GB; viable en RTX 4090, RTX 3090, RTX 4080 de 16 GB y GPUs de 24 GB con contexto amplio.
- Contexto de 256k: el KV cache puede consumir decenas de GB adicionales; para aprovecharlo se recomienda A100/H100 80 GB o configuraciones multi-GPU.
- Despliegue: transformers para los pesos fuente; llama.cpp, Ollama y LM Studio para los GGUF del repositorio del autor; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles de forma medida; el autor reporta de forma anecdótica unos 60 segundos para procesar 8.000 tokens de instrucciones y generar unos 3.000 tokens en una configuración Q6 no especificada.
- Ajustes recomendados por el autor: temperatura 1 (0,6-0,7 para herramientas y agentes), top_k 64, top_p 0,95, min_p 0,05, repetition penalty desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27,8B | 256k (declarado) | Apache 2.0 | Finetune uncensored con modos embebidos; sin benchmarks públicos |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible en la informacion | Apache 2.0 | Modelo original alineado; referencia de partida del finetune |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | 40B (según el autor) | no disponible | Apache 2.0 | Variante mayor del mismo autor, descrita como "heavy/strong tune" |
| DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored | 31B (según el autor) | no disponible | Apache 2.0 | Experimento de transformer con bucles del mismo autor |

No se dispone de datos de rendimiento comparativo verificable entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks independientes: las afirmaciones de calidad, "IQ" o reducción de tokens provienen del autor y no son verificables con los datos disponibles.
- El ajuste "uncensored" elimina rechazos de seguridad; puede generar contenido ofensivo, ilegal o peligroso y no debe desplegarse en aplicaciones de cara al público sin filtros externos.
- Riesgo elevado de alucinación en datos factuales, especialmente con temperatura 1 y modos creativos; requiere verificación en usos de producción.
- La ficha de Hugging Face declara únicamente `en` como idioma, mientras que la model card lista 16 idiomas; el soporte real del multilingüismo no está verificado.
- El contexto de 256k es una cifra declarada por el autor; el rendimiento efectivo en ventanas muy largas no está medido y el coste de KV cache es prohibitivo en hardware de consumo.
- Los "constructos" y modos se activan mediante sintaxis específica en el prompt; un uso incorrecto puede degradar la calidad o producir salidas inconsistentes.
- El sistema de ayuda embebido y los modos propietarios del autor crean dependencia de su documentación y de sus repositorios de GGUF, que pueden cambiar sin aviso.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por un modelo sin censura puede infringir normativas locales; la responsabilidad recae en el desplegador.
- El modelo base Qwen3.8-27B y su tokenizador condicionan el comportamiento; los cambios del autor no están auditados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Repositorio de GGUF y documentación de Turbo Brilliance V2 50X: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Proyecto mayor del que deriva: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Variante de 40B: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- Variante Looping Transformer de 31B: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
