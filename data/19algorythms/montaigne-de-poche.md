# 19algorythms/Montaigne-de-Poche

## Resumen

Le Montaigne de Poche (v0.2) es un ajuste fino QLoRA de SmolLM3-3B que da lugar a dos personajes literarios experimentales: L'Essayiste y Le Conversationnel. Lo desarrolla el usuario 19algorythms y se distribuye en HuggingFace bajo licencia Apache-2.0. El modelo responde siempre en primera persona como Michel de Montaigne, con frances de finales del siglo XVI, a partir del texto integro de los tres libros de los *Essais* (obra en dominio publico). No es una edicion cientifica ni una fuente historica: es un ejercicio de caracterizacion literaria.

El problema que aborda es concreto dentro de la investigacion en ajuste fino: como inducir una persona estilistica coherente y un registro historico determinado en un modelo pequeno (3,07 mil millones de parametros) mediante QLoRA sobre un corpus monografico, y como empaquetar el resultado en GGUF para consumo local. Es relevante ahora porque ejemplifica el flujo completo de un modelo de personaje reproducible con recursos de consumidor: QLoRA con r=16 y alpha=32, fusion en fp16 y cuantizacion con llama.cpp.

Los dos ficheros publicados comparten base y entrenamiento, y se diferencian en el prompt de sistema y la cuantizacion: `montaigne-q4-v2.gguf` (Q4_K_M, ~1,9 GB) corresponde a L'Essayiste, que compone una pagina nueva para cada pregunta, y `montaigne-q6-v2.gguf` (Q6_K, ~2,6 GB) a Le Conversationnel, que anade la regla de devolver ocasionalmente una pregunta al interlocutor. El repositorio ocupa 4,4 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de HuggingFaceTB/SmolLM3-3B; la model card no detalla la arquitectura interna |
| Parametros totales | 3.075.098.624 (3,07 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la configuracion de ejemplo de Ollama usa `num_ctx 4096` |
| Tipos de cuantizacion | GGUF Q4_K_M (~1,9 GB) y Q6_K (~2,6 GB); previamente fusion en fp16 |
| Idiomas soportados | frances (fr) |
| Licencia | Apache-2.0 (pesos); MIT (herramientas y documentacion); corpus en dominio publico |
| Formato de pesos | GGUF (la informacion de HuggingFace reporta el recuento de parametros sobre safetensors, pero la model card solo documenta ficheros GGUF) |

Datos adicionales: pipeline no disponible, creado el 2026-09-16, actualizado el 2026-09-16, tamano del repositorio 4,4 GB, etiquetas `gguf`, `montaigne`, `persona`, `qlora`, `french-literature`, `character-model`, `conversational`, `endpoints_compatible`.

## Arquitectura y entrenamiento

La model card describe un ajuste fino QLoRA sobre HuggingFaceTB/SmolLM3-3B con r=16, alpha=32, 2 epocas y 7 proyecciones, aplicado sobre el texto integro de los tres libros de los *Essais* de Michel de Montaigne. Tras el entrenamiento se realiza una fusion en fp16 y despues la cuantizacion con llama.cpp. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. El detalle completo se remite al fichero `LICENCE_ET_ATTRIBUTION_V2.txt` del repositorio.

La innovacion tecnica no esta en la arquitectura, que se hereda sin cambios del modelo base, sino en la construccion del comportamiento: la persona se induce mediante un prompt de sistema muy prescriptivo (prompt A para L'Essayiste, que exige componer texto original y no citar, y prompt A+ para Le Conversationnel, que anade la devolucion de preguntas) mas el sesgo estilistico aprendido del corpus. Los dos personajes proceden de un unico ajuste fino, y la diferenciacion se logra en tiempo de inferencia. La configuracion recomendada por el autor es temperatura 0.65, top_p 0.9, repeat_penalty 1.12 y num_ctx 4096.

## Capacidades

- Generacion de texto en frances con registro estilistico de finales del siglo XVI, imitando la prosa ensayistica de Montaigne.
- Conversacion multi-turno en modo personaje, manteniendo la identidad de Michel de Montaigne de forma sostenida.
- Dos modos de personaje: monologo ensayistico (L'Essayiste) y dialogo con devolucion ocasional de preguntas (Le Conversationnel).
- Composicion de texto original sobre temas ajenos a la epoca del personaje, tratados con cautela retorica y sin salir del papel.
- Escritura creativa y pastiche literario en frances.
- Ejecucion local en CPU o GPU de gama media mediante GGUF y Ollama.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.
- No se documenta capacidad multilingue: el unico idioma declarado es el frances, y el personaje esta disenado para no salir del frances del siglo XVI.

## Casos de uso

- Instalacion interactiva o pieza de museo: el modelo puede desplegarse en local con Ollama para que el visitante converse con una recreacion literaria de Montaigne; el consumo de recursos es bajo (Q4_K_M ~1,9 GB) y no requiere conexion externa ni enviar datos a terceros.
- Investigacion en ajuste fino de persona: sirve como caso reproducible de QLoRA con r=16 y alpha=32 sobre corpus monografico, util para medir como varian el registro y la coherencia de personaje al cambiar rango, epocas y prompt de sistema.
- Estudio de confabulacion controlada: el propio autor advierte que el modelo fabrica citas falsas de los *Essais* por diseno, lo que lo convierte en un banco de pruebas para desarrollar y validar detectores de alucinacion en dominios historicos y bibliograficos.
- Talleres de escritura creativa: permite generar propuestas de pastiche en frances del siglo XVI a partir de consignas tematicas modernas, como ejercicio de estilo para estudiantes de literatura o traduccion.
- Prototipado de asistentes con personalidad en hardware modesto: al ser un modelo de 3,07 B en GGUF, cabe en portatiles y equipos sin GPU dedicada, lo que facilita iterar sobre prompts de sistema antes de escalar a modelos mayores.
- Demostracion de pipeline completo de publicacion: el repositorio ejemplifica el flujo corpus en dominio publico, QLoRA, fusion fp16, cuantizacion llama.cpp y publicacion en GGUF, replicable como plantilla para otros personajes historicos.
- Generacion de dialogo para guion o ficcion historica: el modo Le Conversationnel produce intercambios dialogados con preguntas devueltas, aprovechable como material de borrador para textos teatrales o narrativos ambientados en el siglo XVI.
- Docencia sobre limites de los modelos de lenguaje: el contraste entre la fluidez del estilo y la falsedad de las referencias internas es un ejemplo didactico inmediato del funcionamiento de un modelo de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, ni comparaciones numericas con el modelo base. Las unicas referencias de comportamiento son cualitativas: truncaciones en generacion larga, repeticiones mas alla de aproximadamente 200 tokens y registro variable segun el dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamano de los ficheros publicados, Q4_K_M ocupa ~1,9 GB de pesos y Q6_K ~2,6 GB; hay que sumar la memoria del contexto (la configuracion de ejemplo usa 4096 tokens).
- GPU recomendadas: no especificadas por el autor. Cualquier GPU consumer con 6 GB o mas de VRAM puede alojar las cuantizaciones publicadas; una RTX 3060 de 12 GB, una RTX 4060 o una RTX 4090 son opciones sobredimensionadas para este tamano y permiten aumentar contexto o lotes.
- Cabe en GPU consumer: si, es el escenario previsto, ya que se distribuye unicamente en GGUF.
- Ejecucion en CPU: viable gracias a llama.cpp y Ollama; no se publican cifras de tokens por segundo.
- Opciones de despliegue: Ollama (documentado por el autor con fichero `Modelfile`), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no estan documentados para este repositorio, y al no publicarse safetensors confirmados requeririan conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo base. Los datos de terceros que aparecen a continuacion no forman parte de la informacion suministrada y deben verificarse en sus fichas publicas antes de citarlos.

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| Montaigne-de-Poche (v0.2) | 3,07 B | no disponible (config. de ejemplo 4096) | Ajuste QLoRA de personaje | Apache-2.0 | GGUF Q4_K_M, Q6_K |
| SmolLM3-3B (modelo base) | 3,07 B | no disponible en la informacion proporcionada | Modelo instructivo generalista | Apache-2.0 | safetensors y GGUF (segun su ficha) |
| Modelos generalistas de ~3 B (por ejemplo Qwen2.5-3B o Llama-3.2-3B) | ~3 B | no disponible en la informacion proporcionada | Modelos instructivos multilingues | licencias propias de cada modelo | safetensors y GGUF |

La diferencia funcional relevante no es de rendimiento bruto sino de especializacion: frente a un modelo instructivo generalista de tamano similar, este ajuste prioriza coherencia de personaje y registro historico en frances, a costa de capacidades generales, soporte de herramientas y multilingueismo, que no se documentan.

## Limitaciones y advertencias

- El modelo fabrica sus citas: cualquier referencia a un capitulo de los *Essais* que produzca es pastiche generado y nunca una fuente autentica. El autor lo advierte de forma explicita.
- Anacronismo por diseno: el personaje muere en 1592, de modo que todo lo que diga sobre el mundo posterior es invencion retorica y no conocimiento fiable.
- Truncaciones en generacion larga y repeticiones a partir de aproximadamente 200 tokens.
- Registro variable segun el dominio de la pregunta.
- Cobertura linguistica limitada al frances; no se documenta entrenamiento multilingue, aunque el modelo base si sea multilingue.
- Longitud de contexto no documentada en la model card; la unica referencia es la configuracion de ejemplo con `num_ctx 4096`.
- Riesgo de sesgo derivado del corpus: la vision del mundo de los *Essais* es la de un gentilhombre frances del siglo XVI, con los sesgos historicos propios de esa posicion y epoca.
- Restricciones de licencia: los pesos son Apache-2.0 y las herramientas y documentacion MIT, por lo que el uso comercial esta permitido; el corpus esta en dominio publico. No se declaran restricciones adicionales.
- Caveat para produccion: no debe emplearse como fuente de informacion historica, bibliografica ni educativa sin verificacion externa, ni como asistente de proposito general. Su uso razonable es la recreacion literaria, la investigacion y la docencia sobre limites de los modelos.
- El repositorio registra 0 descargas y 0 likes, sin benchmarks publicados y con pipeline no declarado: la validacion externa del modelo es practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/19algorythms/Montaigne-de-Poche
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Referencia de procedencia citada en la model card: Couet, A., & Kimi / Moonshot AI (2026). *Construire un Montaigne de poche : fine-tuning de SmolLM3-3B* [Dataset]. Zenodo. https://doi.org/10.5281/zenodo.22792846
- Ficheros de configuracion y prompts A y A+ citados por el autor: `LICENCE_ET_ATTRIBUTION_V2.txt` dentro del repositorio de HuggingFace.
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces recuperados corresponden a proyectos no relacionados con el modelo.
