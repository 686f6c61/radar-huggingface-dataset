# LucasBRT/pionus-0.5b-v0.3

## Resumen

pionus-0.5b-v0.3 es un modelo de lenguaje especializado en la generacion automatica de mensajes de commit de git, desarrollado por LucasBRT como parte del proyecto pionus, una herramienta de linea de comandos que redacta mensajes de commit imitando el estilo del repositorio mediante un modelo pequeno que se ejecuta en local. El modelo parte de Qwen/Qwen2.5-Coder-0.5B-Instruct y se afina mediante SFT y una etapa posterior de DPO sobre muestras generadas por el propio modelo, con el objetivo de producir mensajes fundamentados en el diff, sin alucinaciones y respetando las convenciones del repositorio.

La version 0.3 es experimental y se centra en una unica mejora respecto a v0.1: una etapa de DPO que penaliza respuestas que copian un asunto reciente, mencionan detalles ausentes del diff, no dicen nada, usan un scope que el repositorio nunca ha empleado o emplean un tipo distinto al del commit real. Segun la model card, las respuestas que fallan estas comprobaciones casi desaparecen, aunque el acierto en el tipo de commit no mejora de forma significativa.

Con 494.032.768 parametros y un contexto heredado de la familia Qwen2.5, el modelo esta pensado para ejecutarse en CPU o GPUs de gama baja mediante llama.cpp, lo que lo hace adecuado para integraciones locales en flujos de trabajo de desarrollo sin depender de servicios en la nube. Su licencia Apache 2.0 facilita su uso comercial y su integracion en herramientas de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5) |
| Tipos de cuantizacion | bf16 (safetensors) y Q4_K_M (GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M, 398 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 0,5 mil millones de parametros, inicializado desde Qwen2.5-Coder-0.5B-Instruct. El entrenamiento se realiza en dos fases: primero un ajuste supervisado (SFT) cuyo adaptador LoRA se conserva en el directorio `training/`, y despues una etapa de DPO sobre muestras generadas por el propio modelo. El prompt de entrenamiento es exactamente el de la herramienta pionus, con el conjunto completo de reglas (`--rules full`), de modo que el modelo aprende a operar dentro de ese contrato de entrada concreto.

La etapa de DPO utiliza 5.500 commits del split de entrenamiento de CommitChronicle (revision `5fd076e`) que no se usaron en v0.1 y que pertenecen a repositorios distintos de los de evaluacion. De ellos, 4.500 proceden de 680 repositorios que siguen Conventional Commits (maximo 8 por repositorio) y 1.000 de repositorios jovenes, con seis muestras de v0.1 por commit (temperatura 0,7, semillas fijas). A ello se anaden commits de estilo libre minados en una ejecucion anterior del split de test, con cuatro muestras cada uno. Para cada commit el modelo genera seis respuestas y un conjunto de comprobaciones marca las que copian un asunto reciente, nombran un detalle ausente del diff, no dicen nada, usan un scope desconocido o un tipo distinto al real; el modelo se entrena para preferir la respuesta que supera todas las comprobaciones. La innovacion principal es, por tanto, el uso de recompensas programaticas basadas en verificaciones deterministas sobre el diff y el historial, en lugar de un modelo de recompensa aprendido.

## Capacidades

- Generacion de mensajes de commit de git en formato Conventional Commits y en estilo libre, adaptandose al estilo del repositorio.
- Fundamentacion en el diff: el modelo cita contenido presente en el diff, las rutas o el historial, con una tasa de palabras no fundamentadas de 0,082 sobre las respuestas Conventional en eval-v1.
- Respeto de scopes: evita introducir scopes que el repositorio no haya usado antes (scope_known de 0,840 en la lista de ficheros anotada).
- Generacion en un unico intento: first_try de 0,996 con la lista de ficheros anotada y con la lista plana.
- Capacidad de fallback controlado: cuando no produce una respuesta utilizable, la herramienta recurre a la lista de ficheros (tasa de fallback de 0,004).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta especializado en una tarea de un solo paso.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion automatica de mensajes de commit en local: el modelo se integra en la CLI pionus y redacta el mensaje a partir del diff y del historial del repositorio, ejecutandose en CPU o GPU Vulkan mediante llama.cpp, sin enviar codigo a servicios externos.
- Estandarizacion de Conventional Commits en equipos: al puntuar 0,668 de type_match y 0,552 de type_macro_f1 en eval-v1, ayuda a mantener tipos y scopes coherentes en repositorios que ya siguen la convencion.
- Repositorios con estilo propio: el modelo aprende el estilo a partir del historial reciente y lo replica, lo que resulta util en proyectos con convenciones internas distintas de las convencionales.
- Integracion en hooks de pre-commit y pipelines de CI: su tamano (398 MB en Q4_K_M) y su ejecucion en llama.cpp permiten invocarlo como paso previo al commit o como comprobacion en integracion continua sin infraestructura dedicada.
- Entornos con restricciones de privacidad: al ejecutarse completamente en local, es adecuado para equipos que no pueden enviar diffs a APIs externas por motivos de confidencialidad.
- Repositorios jovenes con poco historial: en eval-short obtiene un type_match de 0,596 y un fallback de 0,021 con la lista anotada, lo que lo hace util en proyectos con entre 1 y 5 asuntos previos.
- Base para experimentacion en DPO con recompensas programaticas: los adaptadores LoRA de SFT y DPO y los registros de entrenamiento se publican en `training/`, lo que permite reproducir o adaptar la receta a otros dominios.

## Benchmarks y rendimiento

Evaluacion segun eval-v1 (500 commits del split de test de CommitChronicle, 250 Conventional y 250 de estilo libre) y eval-short (197 commits de repositorios jovenes), decodificacion greedy, Vulkan, pionus 0.9.0. Se muestran las columnas de los 250 commits Conventional de eval-v1 salvo que se indique lo contrario.

Con la lista de ficheros por defecto (anotada):

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct recuantizado (control) | 0,352 | 0,200 | 0,876 | 0,336 | 0,632 | 0,296 | 0,159 | 0,692 | 0,102 | 0,468 | 0,894 | 0,340 |
| pionus-0.5b-v0.1 | 0,648 | 0,546 | 0,852 | 0,960 | 0,028 | 0,116 | 0,342 | 0,928 | 0,234 | 0,638 | 0,085 | 0,080 |
| pionus-0.5b-v0.3 | 0,668 | 0,552 | 0,840 | 0,996 | 0,004 | 0,008 | 0,354 | 0,996 | 0,250 | 0,596 | 0,021 | 0,000 |

Con la lista de ficheros plana (la usada en entrenamiento):

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct recuantizado (control) | 0,344 | 0,201 | 0,884 | 0,312 | 0,648 | 0,308 | 0,161 | 0,696 | 0,101 | 0,426 | 0,872 | 0,333 |
| pionus-0.5b-v0.1 | 0,628 | 0,531 | 0,844 | 0,960 | 0,028 | 0,104 | 0,333 | 0,916 | 0,230 | 0,617 | 0,085 | 0,100 |
| pionus-0.5b-v0.3 | 0,664 | 0,557 | 0,840 | 0,996 | 0,004 | 0,008 | 0,347 | 0,996 | 0,247 | 0,617 | 0,021 | 0,000 |

Comparacion pareada frente a v0.1 en los 250 commits Conventional de eval-v1 con la lista anotada: ungrounded +1/-28 (p = 0,0), first_copied +0/-9 (p = 0,004), first_try +9/-0 (p = 0,004), fallback +0/-6 (p = 0,031); type_match +11/-6 (p = 0,332) y scope_known +2/-5 (p = 0,453), ninguno significativo. Ademas, la proporcion de palabras no presentes en el historial, las rutas y el diff es de 0,082 en las respuestas Conventional de eval-v1, frente a 0,151 de v0.1 y 0,327 de los commits reales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16 para los pesos (0,5B parametros) mas la cache KV; el GGUF Q4_K_M ocupa 398 MB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPUs con soporte Vulkan. No se especifican modelos concretos como A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU consumer: si, en cualquier GPU consumer con soporte Vulkan o mediante CPU; el modelo esta disenado para ejecutarse en local.
- Opciones de despliegue: llama.cpp (CPU y Vulkan) a traves de la CLI pionus; la exportacion a OpenVINO no esta validada para este modelo. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pionus-0.5b-v0.3 | 494.032.768 | no disponible | Especializado en mensajes de commit con DPO y recompensas programaticas | apache-2.0 | HuggingFace (safetensors y GGUF) |
| pionus-0.5b-v0.1 | no disponible | no disponible | Version anterior, solo SFT, sin etapa DPO | apache-2.0 | HuggingFace |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B (aproximado) | no disponible | Modelo generalista de codigo e instrucciones, sin especializar | apache-2.0 | HuggingFace |
| pionus-0.5b-v0.2 | no disponible | no disponible | Entrenado sin las reglas en el prompt | apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Modelo experimental: la propia model card indica que la version 0.3 sigue siendo experimental mientras cambia la receta de entrenamiento.
- El acierto en el tipo de commit no mejora de forma significativa frente a v0.1 (type_match +11/-6, p = 0,332); la mejora se concentra en reducir respuestas no fundamentadas y copias.
- El modelo dice lo que el diff dice mas que lo que el cambio significa; su word_f1 (0,354) sigue siendo bajo en terminos absolutos y la superposicion con el asunto real es limitada.
- Solo soporta ingles, lo que limita su uso en repositorios con mensajes de commit en castellano u otros idiomas.
- Depende del prompt exacto de pionus con el conjunto completo de reglas; su comportamiento fuera de ese contrato de entrada no esta evaluado.
- Riesgo de alucinacion reducido pero no eliminado: la tasa de ungrounded es de 0,008 en eval-v1, no cero.
- El rendimiento en repositorios jovenes es inferior (type_match de 0,596 en eval-short), por lo que la calidad puede degradarse con historiales muy cortos.
- La exportacion a OpenVINO no esta validada para este modelo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen2.5-Coder-0.5B-Instruct y del dataset CommitChronicle.
- El control recuantizado del modelo base cae al fallback en la mayoria de commits en esta configuracion, lo que indica que la tarea es sensible a la cuantizacion y al prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LucasBRT/pionus-0.5b-v0.3
- Version anterior v0.1: https://huggingface.co/LucasBRT/pionus-0.5b-v0.1
- Repositorio de la CLI pionus: https://github.com/Lucas-BRT/pionus
- Documentacion de evaluacion: https://github.com/Lucas-BRT/pionus/blob/main/training/README.md
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
