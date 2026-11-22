# Hananbros/Mistral-24B-RP-Merge

## Resumen

Mistral-24B-RP-Merge es un fine-tune de tipo merge publicado por el usuario Hananbros sobre el modelo base mistralai/Mistral-Small-3.1-24B-Base-2503. Se trata de un modelo de 23.572.403.200 parametros (aproximadamente 23,6 mil millones) orientado a generacion de texto generalista, con un enfasis declarado en roleplay, escritura creativa y co-escritura, ademas de dominios tecnicos como codigo, matematicas, uso de herramientas y razonamiento. La model card heredada del autor original (PocketDoc/Dans-PersonalityEngine-V1.3.0-24b) indica que el entrenamiento se realizo sobre mas de 50 datasets especializados mediante Axolotl.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con transformers y text-generation-inference. Soporta teoricamente 10 idiomas (arabe, chino, ingles, frances, aleman, hindi, japones, coreano, portugues y espanol), aunque el propio autor advierte que el rendimiento maximo se alcanza en ingles. La longitud de contexto declarada es de 32.768 tokens, ampliable a 131.072 tokens con recall degradado.

La relevancia de esta ficha es limitada pero informativa: se trata de un merge de la comunidad con cero descargas y cero likes en el momento de la consulta, lo que sugiere un modelo experimental o de nicho. Resulta util como ejemplo de la practica de merges sobre Mistral-Small-3.1 y como referencia para quienes buscan alternativas de roleplay de tamano medio con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral-Small-3.1-24B-Base-2503) |
| Parametros totales | 23.572.403.200 (~23,6 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens; 131.072 tokens con recall degradado |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | en, ar, de, fr, es, hi, pt, ja, ko (la model card menciona tambien chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Small-3.1-24B-Base-2503, un transformer denso de aproximadamente 23,6 mil millones de parametros. Sobre esa base, el autor ha aplicado un proceso de fine-tuning descrito en la model card como un entrenamiento sobre mas de 50 datasets especializados, utilizando la herramienta Axolotl. Los datasets cubren un espectro muy amplio: desde roleplay y narrativa (Dans-Prosemaxx-RP, Dans-Personamaxx-Logs-2, Dans-Kinomaxx-VanillaBackrooms, Dans-Prosemaxx-Gutenberg, Dans-Prosemaxx-Cowriter-3-XL) hasta matematicas (Dans-Mathmaxx, Math-Multiturn-1K-ShareGPT), uso de herramientas y agentes (Dans-Toolmaxx-Agent, Dans-Toolmaxx-ShellCommands, Dans-Toolmaxx-Functions-Toolbench, ToolACE, apigen), razonamiento (Dans-Reasoningmaxx-NaturalReasoning, WebInstruct, GeneralReasoning), instrucciones y asistencia (Dans-Assistantmaxx-OpenAssistant2, Opus-Merge-2, Synthia, Tulu3-IF, LongAlign), logica (Dans-Logicmaxx-SAT-AP), teoria de la mente y razonamiento fisico (PJMixers), y dominios sensibles como supervivencia, operaciones multi-entorno, resistencia, interrogatorio y seguridad quimico-biologica (coleccion AquaV).

No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card tampoco detalla innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa, etc.); se trata de un fine-tune/merge, no de una arquitectura nueva. El formato de prompt recomendado se denomina "DanChat-2", con ajustes de muestreo sugeridos de temperatura 1.0 y top_p 0.9.

## Capacidades

- Generacion de texto generalista y conversacional en multiples turnos.
- Roleplay y escritura creativa: la model card y los tags destacan roleplay, storywriting y co-escritura.
- Razonamiento: los datasets de entrenamiento incluyen razonamiento natural, razonamiento general y problemas tipo WebInstruct.
- Matematicas: entrenamiento explicito sobre Dans-Mathmaxx y Math-Multiturn-1K-ShareGPT.
- Generacion de codigo: el tag "code" aparece en la model card, aunque no se detallan benchmarks.
- Uso de herramientas y function calling: datasets Toolmaxx (Toolbench, ToolACE, apigen) y comandos de shell.
- Comportamiento agentico y multi-step: datasets de agente y tareas concurrentes.
- Dominios especializados: legal, medico, financiero, clima, quimica y biologia (segun tags y datasets).
- Capacidades multilingues en 10 idiomas, con rendimiento maximo declarado en ingles.
- Formato de prompt propio "DanChat-2".

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta entrenado con datasets especificos de roleplay y personajes (Dans-Prosemaxx-RP, Personamaxx-Logs-2, Personamaxx-VN), y su contexto de 32.768 tokens permite mantener coherencia en sesiones extensas.
- Co-escritura narrativa: los datasets ProseMaxx (Gutenberg, Cowriter-3-XL, Adventure) lo orientan a continuar y estructurar ficcion; util para asistentes de escritura que necesiten mantener estilo y continuidad.
- Asistente generalista con uso de herramientas: los datos Toolmaxx (Toolbench, ToolACE, apigen) permiten integrarlo en pipelines de function calling para consultas a APIs.
- Automatizacion de tareas de shell y agentes: el dataset Toolmaxx-ShellCommands sugiere capacidad para generar comandos y encadenar pasos, adecuado para agentes de operaciones.
- Razonamiento matematico y resolucion de problemas: entrenado sobre Mathmaxx y Math-Multiturn, puede emplearse en tutoria o generacion de explicaciones paso a paso.
- Asistencia en dominios regulados: los tags legal, medical y finance indican cobertura, aunque sin benchmarks publicados; apropiado solo para tareas de apoyo con supervision humana.
- Generacion de codigo en entornos de desarrollo: el tag code y los datasets de instrucciones permiten integrarlo en asistentes de IDE, con cautela por la ausencia de evaluaciones publicadas.
- Interaccion multilingue: soporte declarado de 10 idiomas para atencion al cliente o traduccion asistida, con la advertencia de que el ingles es el idioma de maximo rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 23,6 mil millones de parametros, en FP16 se requieren aproximadamente 47 GB de VRAM (coincide con el tamano del repo, 47,2 GB); en cuantizacion de 8 bits, en torno a 24 GB; en 4 bits, aproximadamente 12-14 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas para FP16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB).
- GPU consumer: una RTX 4090 de 24 GB puede alojar el modelo en cuantizacion de 8 bits o inferior; en FP16 no cabe en una sola GPU consumer.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente); no se confirma soporte de llama.cpp, Ollama ni vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hananbros/Mistral-24B-RP-Merge | ~23,6 B | 32.768 (131.072 degradado) | Apache 2.0 | Merge de comunidad, 0 descargas, sin benchmarks |
| MS3-RP-Broth-24B | no disponible | no disponible | no disponible | Merge orientado a roleplay sobre Mistral, con presets de muestreo especificos (Weird, Forgotten-Safeword) y formato Mistral-V7-Tekken |
| mistralai/Mistral-Small-3.1-24B-Base-2503 | ~24 B | no disponible en la informacion | Apache 2.0 | Modelo base oficial de Mistral AI sobre el que se construye este merge |

La comparacion con alternativas de la misma categoria es limitada porque no se dispone de datos de benchmarks ni de especificaciones completas de los modelos citados en la busqueda web.

## Limitaciones y advertencias

- Modelo experimental de comunidad: cero descargas y cero likes en el momento de la consulta, sin validacion externa conocida.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo de alucinacion inherente a los modelos de ~24 B sin evaluacion publicada.
- El contexto extendido a 131.072 tokens se declara con "recall degradado", por lo que la calidad decae en ventanas muy largas.
- Rendimiento multilingue desigual: el autor indica que el ingles es el idioma de maximo rendimiento, pese a declarar 10 idiomas.
- Incluye datasets de tematica sensible (supervivencia, interrogatorio, materiales energeticos, seguridad quimico-biologica) que pueden producir respuestas inapropiadas; requiere filtros en produccion.
- La model card hereda contenido HTML y referencias a otro modelo (Dans-PersonalityEngine-V1.3.0-24b), lo que indica una publicacion poco cuidada y posible desalineacion entre la documentacion y los pesos reales.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace recomendable una validacion propia antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Hananbros/Mistral-24B-RP-Merge
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Modelo de referencia en la model card: https://huggingface.co/PocketDoc/Dans-PersonalityEngine-V1.3.0-24b
- Hilo en Reddit sobre merges RP de Mistral 24B: https://www.reddit.com/r/SillyTavernAI/comments/1ri3713/new_rp_mistral_24b_merge/
- Ficha de MS3-RP-Broth-24B: https://www.promptlayer.com/models/ms3-rp-broth-24b
