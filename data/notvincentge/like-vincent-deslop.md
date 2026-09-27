# notVincentGe/like-vincent-deslop

## Resumen

like-vincent-deslop es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario notVincentGe en Hugging Face. Su proposito es reescribir texto para eliminar los patrones tipicos de la escritura generada por IA (lo que la propia model card denomina "AI sludge"): estructuras formulaicas, frases de relleno, fragmentacion dramatica, aperturas del tipo "Great question!" y cierres huecos. El adaptador no cambia el significado del texto original, sino su estilo, y esta entrenado sobre pares reales de reescritura antes→despues.

Tecnicamente se trata de un adaptador PEFT de rango bajo (LoRA r=16, alpha=32) con cuantizacion nf4 del modelo base durante el entrenamiento. El repositorio ocupa 0,2 GB, lo que corresponde unicamente a los pesos del adaptador: para usarlo hay que descargar tambien el modelo base completo y disponer de GPU suficiente para cargar ambos. La version publicada de los pesos es el checkpoint-100.

Su relevancia actual es acotada pero concreta: es una alternativa ligera y autoalojada a los servicios de "deslop" comerciales para equipos que quieren normalizar el estilo de textos generados o asistidos por IA (documentacion, blogs tecnico, correos, informes) sin enviar el contenido a una API de terceros. El numero de descargas y likes registrados en el momento de la consulta es cero, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (adaptador PEFT); arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | Adaptador: no disponible (repo de 0,2 GB). Modelo base declarado: 27B |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.8-27B, no declarada) |
| Tipos de cuantizacion | Entrenamiento en QLoRA nf4; no se listan cuantizaciones publicadas para el adaptador (no hay GGUF en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (declarada para el adaptador) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |
| Rango LoRA / alpha | r=16, alpha=32 |
| Checkpoint publicado | checkpoint-100 |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline | text-generation |
| Tarea | Reescritura de estilo (deslop / anti-slop) |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA) aplicado sobre las capas de atencion y proyeccion de un transformer causal de 27B de parametros, el declarado Qwen/Qwen3.8-27B. Segun la model card, el entrenamiento se hizo con QLoRA en cuantizacion nf4, con r=16 y alpha=32. El repositorio solo contiene los pesos del adaptador (0,2 GB), de modo que la inferencia requiere cargar el modelo base en precision completa o cuantizada y despues acoplar el adaptador mediante `PeftModel.from_pretrained`. Se publica unicamente el checkpoint-100.

La particularidad del entrenamiento es el dataset: pares de reescritura reales antes→despues, orientados a preservar la afirmacion original y a sustituir formulaciones marcadamente generadas por IA por equivalentes mas directos. Los ejemplos de la model card muestran el criterio: convertir "This isn't about writing faster. It's about writing better." en "The goal is better writing, and faster is a side effect.", o reducir una respuesta larga y con muletillas ("Great question! Identifying which process...") a una frase operativa ("To find which process is using a port, use `lsof`..."). No se documentan ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones de decodificacion (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Reescritura de estilo: transforma prosa con patrones de IA en prosa mas directa manteniendo el significado y la afirmacion original.
- Reduccion de relleno: elimina aperturas formulaicas, cierres genericos, muletillas y transiciones vacuolas.
- Simplificacion estructural: condensa parrafos largos y subordinadas innecesarias en frases mas cortas.
- Conservacion de la tesis: la model card indica explicitamente que el modelo prefiere mantener la afirmacion original y no reescribir el texto como si fuera otro ensayo.
- Conversacional: la etiqueta `conversational` esta presente; el ejemplo de la model card incluye una respuesta tecnica reescrita (localizacion de procesos que ocupan un puerto).
- Generacion de texto general, heredada del modelo base, aunque el adaptador esta especializado en reescritura.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no documentadas; el unico idioma declarado es el ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Edicion de documentacion tecnica: el adaptador reescribe notas de release, guias y README generados con asistencia de IA para eliminar el tono generico y dejar instrucciones accionables, como en el ejemplo de `lsof` de la model card.
- Publicacion de blog tecnico: pasar borradores asistidos por IA por el adaptador antes de publicar reduce patrones reconocibles (aperturas tipo "Here's what nobody tells you", cierres motivacionales) y mejora la legibilidad sin cambiar el argumento.
- Normalizacion de estilo en equipos: aplicar el mismo adaptador a todos los textos salientes de un equipo (informes internos, correos, propuestas) para homogeneizar el registro y evitar el "sello" de IA en documentos que se envian a clientes.
- Redaccion cientifica y academica: util para eliminar construcciones formulaicas en abstracts o secciones de discusion, un caso de uso alineado con herramientas del mismo nicho como `skill-deslop`.
- Preprocesado de contenido en pipeline editorial: integrar el adaptador como paso previo a un CMS o a un corrector, de modo que el texto llegue a revision humana ya despojado de relleno.
- Reescritura de respuestas de atencion al cliente: condensar respuestas largas y protocolares generadas por un sistema automatico en mensajes directos para el usuario final.
- Autoalojamiento con privacidad: al ser pesos abiertos bajo licencia Apache 2.0, permite procesar textos sensibles en infraestructura propia en lugar de enviarlos a una API comercial de reescritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: hay que cargar el modelo base de 27B mas el LoRA. Los requisitos de VRAM vienen determinados casi por completo por el modelo base.
- VRAM estimada (calculada a partir del tamano del modelo base, no medida): aproximadamente 54-58 GB en bf16/fp16 con overhead de contexto; en torno a 28-30 GB en cuantizacion de 8 bits; unos 15-17 GB en 4 bits (nf4/GPTQ/AWQ).
- GPU profesionales: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16. Una unica A100 40 GB solo es viable con cuantizacion de 8 o 4 bits.
- GPU de consumo: en 4 bits puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contextos moderados; en bf16 no cabe en ninguna GPU de consumo actual de una sola pieza.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada por el autor. Para servicio con concurrencia, vLLM o TGI admiten adaptadores LoRA sobre el modelo base (requiere comprobar compatibilidad con el modelo base concreto). llama.cpp/Ollama implican fusionar el adaptador en el base y exportar a GGUF, algo que el repositorio no ofrece.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este adaptador ni para el modelo base declarado.
- Nota de despliegue: quienes sirvan el modelo en produccion deben fusionar el adaptador (`merge_and_unload`) o cargarlo como LoRA dinamico, y presupuestar memoria para el tokenizer y el contexto.

## Comparativa con modelos similares

Se comparan alternativas del mismo nicho (limpieza de texto generado por IA). Para las herramientas no publicadas como modelo abierto no hay forma de verificar parametros ni licencia.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| like-vincent-deslop | Adaptador LoRA sobre LLM de 27B | Adaptador no disponible; base 27B | No disponible | Apache 2.0 | Pesos abiertos en Hugging Face; 0 descargas |
| Qwen/Qwen3.8-27B sin adaptador | LLM base | 27B | No disponible | No disponible en la informacion proporcionada | Hugging Face |
| deslop.tools | Comprobador web de estilo IA | No aplica | No aplica | No disponible | Servicio gratuito en navegador, sin registro |
| skill-deslop (stephenturner) | Skill/reglas de edicion | No aplica | No aplica | No disponible | Repositorio GitHub |
| DeSlop (extension VS Code/Open VSX) | Extension de editor con reglas | No aplica | No aplica | No disponible | Open VSX Registry |
| deslop.review | Servicio de reescritura | No aplica | No aplica | No disponible | Web |

## Limitaciones y advertencias

- Idiomas: el unico idioma declarado es el ingles. Su comportamiento con texto en castellano no esta documentado y cabe esperar degradacion.
- Verificacion del modelo base: la ficha declara Qwen/Qwen3.8-27B como base. Conviene verificar que ese identificador existe y es accesible antes de planificar un despliegue, ya que de ello dependen contexto, licencia final y requisitos de hardware.
- Licencia del artefacto combinado: el adaptador es Apache 2.0, pero la licencia y las condiciones de uso del modelo base son las que rigen el despliegue final; hay que comprobarlas por separado.
- Riesgo de alteracion de matiz: cualquier modelo de reescritura puede cambiar sutilezas del original (cualificadores, hedging, nivel de certeza). La model card insiste en conservar la afirmacion original, pero no hay evaluacion cuantitativa que lo garantice.
- Alucinacion: aunque la tarea es de reescritura, un LLM subyacente puede introducir informacion no presente en el texto de entrada; es obligatoria la revision humana en contextos legales, medicos o cientificos.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad del adaptador ni del modelo base.
- Ausencia de benchmarks: sin MMLU, HumanEval ni metricas de fidelidad de reescritura, no es posible comparar objetivamente su calidad frente a otras alternativas.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya reportado problemas o comportamientos anomalos.
- Restricciones practicas: no hay versiones GGUF ni cuantizadas del adaptador en el repositorio, lo que limita el despliegue en entornos sin GPU de gran capacidad.
- Ambito estrecho: es un modelo especializado en estilo; no debe usarse como asistente general ni como sustituto de un LLM completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notVincentGe/like-vincent-deslop
- Perfil del autor: https://huggingface.co/notVincentGe
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- deslop.tools (comprobador de escritura con patrones de IA): https://deslop.tools/
- skill-deslop en GitHub (des-AI-ificar escritura cientifica): https://github.com/stephenturner/skill-deslop
- DeSlop en Open VSX Registry: https://open-vsx.org/extension/AUAggy/deslop
- deslop.review (eliminacion de patrones de IA en texto): https://deslop.review/
- Vincen AI: https://vincen.ai/
