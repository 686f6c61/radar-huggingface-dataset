# selorahomes/Selora-AI-LLM-1.7B

## Resumen

Selora AI LLM 1.7B es un ajuste de instrucciones sobre Qwen3-1.7B orientado exclusivamente a domotica: controla dispositivos, redacta automatizaciones y responde preguntas sobre el estado de una instalacion de Home Assistant. Lo desarrolla Selora Homes y se publica bajo licencia Apache-2.0. En lugar de un unico modelo generico, el repositorio entrega una base GGUF Q6_K mas cinco adaptadores LoRA especializados (command, automation, answer, clarification y utilities) que la integracion oficial intercambia en caliente segun la intencion detectada.

Su rasgo diferencial es el contrato de salida: cada especialista emite un "slim envelope", un objeto JSON compacto con claves de un solo caracter que actua como representacion intermedia, no como accion final. La integracion `ha-selora-ai` parsea ese envelope y ejecuta llamadas de servicio, resuelve el estado real de las entidades o guarda el YAML de una automatizacion. El modelo, por diseno, no lee ni inventa estado del hogar: solo emite las consultas y plantillas que el runtime completa contra Home Assistant.

Con 2.031.739.904 parametros reales en safetensors (la denominacion comercial "1.7B" sigue la convencion de Qwen, que excluye capas de embedding) y un repo de 15,4 GB que empaqueta la base cuantizada junto a los adaptadores, el objetivo es despliegue local y offline-first en hardware modesto: Raspberry Pi 5, Mac mini o mini-PC tipo NUC, con variante en la nube via vLLM. Existe tambien una version de 14B para equipos con 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-1.7B) + 5 adaptadores LoRA |
| Parametros totales | 2.031.739.904 (~2,03 mil millones; "1.7B" segun convencion de Qwen sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la model card; el modelo base Qwen3-1.7B declara 32.768 tokens nativos, pero el autor no confirma el contexto efectivo tras el ajuste) |
| Tipos de cuantizacion | GGUF Q6_K para la base; adaptadores LoRA en F16. Variante adicional empaquetada para Ollama |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base Q6_K) + adaptadores LoRA (F16); safetensors para los pesos del adaptador en el repo de transformers |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B: un transformer decoder-only denso con atencion por causalidad estandar, sobre el que se aplica un ajuste mediante LoRA en lugar de un fine-tuning completo. El autor no publica el rango de los adaptadores, el numero de tokens de entrenamiento ni la composicion del dataset; tampoco indica si hubo fases de RLHF o DPO. Lo que si se documenta es la estrategia de especializacion: cinco adaptadores independientes, cada uno entrenado para producir una unica forma de JSON estricto y compacto, en lugar de un solo modelo multitarea.

La innovacion relevante no esta en el mecanismo de atencion sino en el diseno del contrato de salida y en la separacion modelo/runtime. Las claves del envelope son de un solo caracter (`r` = response, `q` = query/entity, `c` = calls, `s` = service, `e` = entity_id, `d` = data, `o` = options, `src` = citations) para minimizar tokens generados, algo critico en un modelo pequeno que corre en CPU. El adaptador `automation` puede ademas devolver YAML de blueprint en bloque delimitado cuando la peticion es generica, o un objeto `automation` con alias, triggers, conditions y actions cuando la peticion es concreta. El adaptador `utilities` se apoya en un bloque `RELEVANT DOCS` inyectado en el prompt en tiempo de inferencia (RAG sobre documentacion de Home Assistant) y devuelve identificadores de fragmento como citas.

## Capacidades

- Generacion de texto conversacional en ingles con modo instruccion, heredado del ajuste sobre Qwen3-1.7B.
- Traduccion de lenguaje natural a llamadas de servicio de Home Assistant: el adaptador `command` emite un array ordenado de `{"s","e","d"}` mas una confirmacion textual.
- Creacion de automatizaciones y blueprints de Home Assistant: YAML valido en bloque delimitado o un objeto JSON con triggers, conditions y actions.
- Respuesta a preguntas sobre estado en vivo mediante plantillas con marcadores `{entity_id}` y una lista de entidades a consultar; el modelo nunca lee el estado directamente.
- Desambiguacion activa: el adaptador `clarification` devuelve una pregunta y opciones de respuesta rapida cuando la peticion es ambigua.
- Soporte de ayuda tecnica fundamentada en documentacion (RAG) con citas a fragmentos fuente.
- Soporte de tool calling a nivel de contrato: el envelope JSON es, en la practica, una especificacion de llamadas que ejecuta el runtime de la integracion, no el modelo.
- Orquestacion multi-paso dentro de una misma peticion mediante arrays de acciones ejecutadas en orden.
- Capacidades multimodales: no disponibles. Sin vision, audio ni thinking mode documentado.

## Casos de uso

- Control de dispositivos por chat: el adaptador `command` convierte "turn off the kitchen lights" en una llamada de servicio `light.turn_off` sobre el `entity_id` correspondiente, que la integracion resuelve contra el estado real antes de ejecutar.
- Creacion de automatizaciones en lenguaje natural: el usuario describe "when the front door opens after 10pm, turn on the porch light" y el adaptador `automation` devuelve un borrador de YAML que se revisa antes de guardarse en Home Assistant.
- Orquestacion de escenas y rutinas: cadenas como "good night" se traducen en un array de acciones (cerrar cerraduras, atenuar luces del dormitorio, fijar termostato) que el runtime ejecuta en orden, sin escribir scripts a mano.
- Consultas sobre el estado del hogar: "is the laundry running?" o "what's the temperature upstairs?" se resuelven con una plantilla de respuesta y la lista de entidades a consultar; la integracion sustituye los valores en vivo, lo que evita alucinaciones sobre estado.
- Soporte y mantenimiento guiado por documentacion: preguntas como "why is the living-room sensor unavailable?" o "how do I add the Hue integration?" se responden con recuperacion sobre docs de Home Assistant, con citas y con el estado de las entidades relevantes interpolado.
- Despliegue domotico privado y offline: al correr en llama-server u Ollama sobre Raspberry Pi 5, Mac mini o NUC, los comandos y la telemetria del hogar no salen de la LAN, lo que facilita el cumplimiento de requisitos de privacidad en instalaciones residenciales.
- Asistente de voz local (con STT/TTS externos): la salida JSON compacta y de baja latencia encaja en un pipeline de voz que necesita respuestas cortas y acciones deterministas, no texto libre largo.
- Desarrollo de integraciones personalizadas: el envelope publico y el parser `_convert_slim_shape` permiten reimplementar el runtime en otros sistemas domoticos o en herramientas propias de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la base Q6_K: aproximadamente 1,6-1,8 GB de pesos, mas overhead de contexto y KV cache (estimacion propia a partir de los 2,03 mil millones de parametros; no publicada por el autor).
- Adaptadores LoRA en F16: se cargan junto al modelo base; el tamano individual no esta documentado y el repo completo ocupa 15,4 GB, por lo que el autor empaqueta formatos adicionales o artefactos auxiliares.
- GPU recomendadas: el modelo esta pensado para CPU; cualquier GPU consumer con 4 GB o mas (RTX 3050/3060, RTX 4060, Apple Silicon unificado) puede alojarlo con holgura. Para el hermano de 14B el autor indica despliegues de 16 GB.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas, y en CPU en Raspberry Pi 5, Mac mini y mini-PC tipo NUC, que son los destinos que cita el autor.
- Opciones de despliegue: llama-server de llama.cpp (runtime de referencia para la integracion), Ollama mediante el paquete `selorahomes/Selora-AI-LLM-1.7B-ollama`, vLLM para despliegue en nube, y transformers para cargar los adaptadores LoRA sobre Qwen3-1.7B.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion en ninguno de los runtimes soportados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selora-AI-LLM-1.7B | 2,03 B (base + 5 LoRA) | No disponible | Sin benchmarks publicados | Apache-2.0 | GGUF + LoRA en HF; paquete Ollama; integracion HA |
| Qwen/Qwen3-1.7B (modelo base) | 2,03 B | 32.768 tokens (segun model card de Qwen) | Benchmarks publicados por Qwen (no reproducidos aqui) | Apache-2.0 | HF, ampliamente soportado |
| selorahomes/Selora-AI-LLM-14B | ~14 B (denominacion del autor) | No disponible | Sin benchmarks publicados | No confirmada en la informacion disponible | HF; orientado a despliegues de 16 GB |
| selorahomes/Selora-AI-LLM-1.7B-ollama | Mismo modelo agregado | No disponible | Sin benchmarks publicados | Apache-2.0 | Paquete Ollama listo para usar |

Frente a un modelo generalista del mismo tamano, la diferencia practica no es la calidad de generacion libre sino la consistencia del formato: Selora garantiza un JSON estricto y compacto por intencion, a costa de no ser util fuera del ecosistema Home Assistant y de requerir el parser de la integracion para producir efectos reales.

## Limitaciones y advertencias

- Solo ingles: la model card declara `language: en`. No hay soporte documentado de castellano ni de otros idiomas, lo que exige filtrar o traducir las peticiones antes de la inferencia.
- El modelo no es autonomo: la salida es una representacion intermedia. Descargar el GGUF y ejecutarlo aislado devuelve el envelope, no acciones ejecutadas; se necesita la integracion `ha-selora-ai` o un parser equivalente que implemente `_convert_slim_shape`.
- Dependencia fuerte de esquema: cualquier cambio en el formato del envelope o en Home Assistant puede romper el contrato con el runtime. Conviene fijar versiones del modelo y de la integracion en produccion.
- Ausencia total de benchmarks: no hay datos publicados de precision en la seleccion de entidades, tasa de JSON valido ni exactitud de automatizaciones generadas. Cualquier evaluacion en produccion debe hacerse con un conjunto propio de peticiones y entidades reales.
- Riesgo de alucinacion acotado pero no nulo: el diseno evita inventar estado (delega la lectura en el runtime), pero el modelo si puede elegir un `entity_id` incorrecto, proponer un servicio inexistente o generar YAML con campos invalidos. Se recomienda validacion previa y confirmacion humana para automatizaciones y acciones criticas como cerraduras o puertas de garaje.
- Ambiguedad de entidades: en instalaciones con nombres parecidos ("kitchen lights" frente a "kitchen light"), el adaptador `clarification` reduce el error, pero el exito depende de la calidad de los `friendly_name` expuestos por Home Assistant.
- El adaptador `utilities` solo es fiable si se inyecta un bloque `RELEVANT DOCS` de calidad; sin recuperacion adecuada, las respuestas de soporte pierden fundamento y las citas pueden quedar vacias o irrelevantes.
- Trazabilidad limitada del entrenamiento: no se documentan datos, numero de tokens, rango de LoRA ni procesos de alineacion, lo que dificulta auditar sesgos o evaluar riesgos de sobreajuste al dominio.
- Licencia Apache-2.0 permisiva para uso comercial, pero la model card no ofrece garantias ni soporte; el mantenimiento depende de un unico autor y el volumen de adopcion es bajo (1.400 descargas, 12 likes en la fecha de actualizacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Variante para Ollama: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B-ollama
- Variante de 14B: https://huggingface.co/selorahomes/Selora-AI-LLM-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Integracion para Home Assistant: https://github.com/SeloraHomes/ha-selora-ai
- Sitio del autor: https://selorahomes.com
- Home Assistant: https://www.home-assistant.io/
