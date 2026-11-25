# andresparraarze/Arcanist-Qwen3-32B-GGUF

## Resumen

Arcanist es un ajuste fino (fine-tune) de Qwen3-32B especializado en ingenieria de hardware, con foco en KiCad y el flujo de trabajo EDA: captura de esquematicos, diseno de PCB, huellas y simbolos, verificaciones ERC/DRC, listas de materiales (BOM), scripting de KiCad y generacion de salidas de fabricacion. Lo desarrolla iOrchestra y es el modelo que hay detras de su producto Vibe Engineer. Esta ficha cubre la distribucion en formato GGUF, pensada para llama.cpp, Ollama y LM Studio.

El modelo parte de Qwen3-32B (32.762.123.264 parametros) y se entrena mediante QLoRA de rango 64 y alpha 128 sobre todas las proyecciones de atencion y MLP, con 300 pasos (aproximadamente 1,81 epocas) y perdida calculada solo sobre la completacion. El conjunto de entrenamiento es Ailiance-fr/mascarade-kicad-dataset, con 2.645 conversaciones de preguntas y respuestas sobre KiCad en frances e ingles. El entrenamiento se completo en una unica NVIDIA RTX 5090 en unos 66 minutos.

Su relevancia es acotada pero clara: cubre un nicho muy especifico (electronica y EDA) donde los modelos generalistas suelen producir numeros de referencia, patillajes y reglas de diseno plausibles pero incorrectos. La distribucion en GGUF Q4_K_M de 19,8 GB permite ejecutarlo en una GPU de 24 GB con contexto de 8k, lo que lo hace accesible en hardware de consumo. El autor advierte explicitamente de que no se ha evaluado formalmente y de que la cuantizacion introduce perdida de calidad respecto al adaptador en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-32B); ajuste fino QLoRA |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens recomendados en la build Q4_K_M; ampliable a 32.768 (longitud nativa del modelo base) con mas memoria |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo) |
| Idiomas soportados | Ingles y frances |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (llama.cpp); el adaptador LoRA se distribuye por separado en formato para Transformers/vLLM |
| Tamano del repo | 19,8 GB |
| Modelo base | Qwen/Qwen3-32B (Apache-2.0) |
| Dataset de entrenamiento | Ailiance-fr/mascarade-kicad-dataset (2.645 conversaciones FR/EN) |
| Hiperparametros del ajuste | QLoRA, rango 64, alpha 128, 300 pasos (~1,81 epocas), completion-only loss |
| Computo de entrenamiento | 1x NVIDIA RTX 5090, ~66 minutos |
| SHA-256 del GGUF | 21123ef0c20b8ae4af0f729091c0fad1472470059d748917b0e87f76c2397d58 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B: un transformer denso de 32,8 mil millones de parametros con atencion completa. Sobre esa base se aplica un ajuste QLoRA de rango 64 y alpha 128 que afecta a todas las proyecciones de atencion y MLP. El entrenamiento se limita a 300 pasos, lo que equivale a aproximadamente 1,81 epocas sobre el dataset, con la perdida calculada unicamente sobre la respuesta (completion-only loss) para concentrar el aprendizaje en el estilo y el contenido de las respuestas y no en los turnos del usuario.

El corpus de entrenamiento es Ailiance-fr/mascarade-kicad-dataset, compuesto por 2.645 conversaciones de preguntas y respuestas sobre KiCad en frances e ingles, con contenido procedente en parte de contribuyentes de Stack Exchange Electronics bajo CC-BY-SA-4.0. El autor senala que el dataset es pequeno y en buena medida sintetico, de modo que la mayor parte del conocimiento de dominio procede del modelo base y el ajuste principalmente moldea el estilo y el enfoque hacia el flujo EDA. No se empleo RLHF ni DPO. El adaptador resultante se fusiono con Qwen3-32B y se cuantizo a Q4_K_M con la exportacion GGUF de Unsloth basada en llama.cpp.

Una decision de diseno relevante es que el modelo se entreno con respuestas directas y sin trazas de razonamiento, por lo que se recomienda el modo no-thinking: anadir `/no_think` al mensaje, usar `--reasoning-budget 0` en llama.cpp o `"think": false` en la API de Ollama. El modo thinking se hereda de Qwen3 pero no fue ajustado.

## Capacidades

- Generacion de texto tecnico sobre ingenieria de hardware: seleccion de componentes, calculo de valores, criterios de diseno y cumplimiento de estandares IPC.
- Captura de esquematicos y diseno de PCB en el contexto de KiCad, incluyendo simbolos, huellas y asignacion de pines.
- Generacion de ficheros KiCad en formato S-expression (si bien el autor no garantiza su validez ni su correccion electrica).
- Soporte del flujo EDA completo: verificaciones ERC/DRC, listas de materiales (BOM) y salidas de fabricacion.
- Scripting de KiCad y automatizacion de tareas del entorno.
- Conversacion multi-turno con prompt de sistema especifico y parametros de muestreo recomendados.
- Capacidades multilingues limitadas a ingles y frances.
- Modo thinking heredado de Qwen3, no ajustado y desaconsejado para uso normal.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta vision ni audio; el pipeline declarado es text-generation.

## Casos de uso

- Asistencia en captura de esquematicos: el modelo puede proponer la estructura de un circuito, la asignacion de pines y los valores de componentes a partir de una descripcion funcional, apoyandose en su conocimiento del flujo KiCad y de los estandares IPC.
- Revision de reglas de diseno (DRC) y verificacion electrica (ERC): resulta util para interpretar mensajes de error de KiCad y sugerir correcciones sobre separaciones, anchos de pista y conexiones, aunque el resultado debe validarse en la herramienta.
- Generacion de ficheros S-expression para KiCad: permite producir borradores de simbolos o huellas que el ingeniero abre y valida en KiCad antes de incorporarlos al proyecto.
- Automatizacion mediante scripting de KiCad: el modelo puede redactar scripts para tareas repetitivas como renombrado de componentes, generacion de BOM o exportacion de fabricacion.
- Seleccion de componentes y elaboracion de BOM: ayuda a elegir alternativas, justificar encapsulados y documentar la lista de materiales con criterios tecnicos.
- Formacion y soporte interno: sirve como asistente de consulta para ingenieros junior sobre convenciones de KiCad y buenas practicas EDA, con la advertencia de verificar datos contra hojas de datos.
- Despliegue local en estacion de trabajo: al caber en una GPU de 24 GB en Q4_K_M con 8k de contexto, puede ejecutarse con Ollama o llama.cpp sin enviar disenos confidenciales a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado formalmente, que no se uso una particion de validacion reservada y que no se reportan resultados. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 19,8 GB y, segun el autor, cabe en una GPU de 24 GB con contexto de 8k.
- GPU recomendadas: RTX 5090 (usada para el entrenamiento y compatible con la inferencia), RTX 4090, A100 y H100; cualquier GPU con 24 GB o mas para la cuantizacion Q4_K_M.
- GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090). Por debajo de 24 GB habria que recurrir a descarga parcial a CPU o a una cuantizacion menor, que no se distribuye en este repositorio.
- Contexto: 8.192 tokens recomendados; ampliable a 32.768 con memoria adicional.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), Ollama (`ollama run hf.co/andresparraarze/Arcanist-Qwen3-32B-GGUF:Q4_K_M`), LM Studio y cualquier runtime compatible con GGUF. El adaptador LoRA separado permite usar Transformers o vLLM.
- Parametros de inferencia recomendados: temperatura 0,3, top_p 0,9, top_k 40, repeat_penalty 1,15, num_ctx 8192.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arcanist-Qwen3-32B (GGUF) | 32,8B | 8k recomendado / 32k nativo | KiCad y EDA | CC-BY-SA-4.0 | GGUF en Hugging Face; LoRA separado |
| Qwen3-32B (base) | 32,8B | 32k nativo | Proposito general | Apache-2.0 | Pesos completos y multiples cuantizaciones |
| Qwen3-32B ajustado por la comunidad para EDA | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa es con el propio Qwen3-32B: Arcanist hereda su arquitectura y su conocimiento general, pero incorpora un sesgo de estilo y enfoque hacia KiCad y el flujo EDA, a costa de una licencia mas restrictiva (CC-BY-SA-4.0 frente a Apache-2.0) y de un reparto unicamente en Q4_K_M en este repositorio. No se dispone de datos de rendimiento que permitan cuantificar la mejora frente al base en tareas de EDA.

## Limitaciones y advertencias

- Alucinacion: puede generar numeros de referencia, huellas, patillajes, valores nominales y reglas de diseno plausibles pero incorrectos. Es obligatorio verificar contra hojas de datos.
- Ficheros KiCad generados: la salida S-expression no esta garantizada como valida ni electricamente correcta; debe abrirse en KiCad y someterse a ERC/DRC.
- Dataset pequeno y mayoritariamente sintetico: la mayor parte del conocimiento proviene del modelo base y el ajuste solo modula estilo y foco.
- Deriva de version: las respuestas pueden referirse a una version de KiCad distinta de la que use el usuario.
- Ausencia de evaluacion: no hay particion de validacion ni benchmarks publicados; el rendimiento real en tareas EDA no esta cuantificado.
- Perdida por cuantizacion: Q4_K_M degrada la calidad respecto al adaptador en precision completa.
- Idiomas: solo ingles y frances; el castellano no esta soportado de forma explicita.
- Modo thinking no ajustado: se recomienda desactivarlo; su uso puede degradar la calidad de las respuestas.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion, pero las obras derivadas deben mantener la misma licencia (share-alike), lo que puede condicionar su integracion en productos propietarios.
- Uso critico: no apto para aprobacion sin revision en disenos de seguridad critica, medicos, automocion o conectados a red electrica.
- Soporte de tool calling y agentes: no documentado en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/andresparraarze/Arcanist-Qwen3-32B-GGUF
- Adaptador LoRA: https://huggingface.co/andresparraarze/Arcanist-Qwen3-32B-LoRA
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Dataset de entrenamiento: https://huggingface.co/datasets/Ailiance-fr/mascarade-kicad-dataset
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
