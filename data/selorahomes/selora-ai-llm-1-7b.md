# selorahomes/Selora-AI-LLM-1.7B

## Resumen

Selora AI LLM es un modelo de lenguaje ajustado por instrucciones para Home Assistant, la plataforma de domotica de codigo abierto. Lo desarrolla Selora Homes y se construye sobre Qwen3 1.7B de Alibaba, con un total de 2.031.739.904 parametros segun los pesos en safetensors. Su proposito no es la generacion de texto general, sino la traduccion de lenguaje natural a acciones ejecutables sobre un hogar conectado: encender luces, ajustar termostatos, crear automatizaciones o responder preguntas sobre el estado en vivo de las entidades.

La publicacion combina dos artefactos. Por un lado, cinco adaptadores LoRA especializados (command, automation, answer, clarification y utilities) que comparten la base Qwen3 1.7B y que la integracion oficial intercambia dinamicamente segun la intencion del usuario. Por otro, un modelo general unico, `selora-ollama`, que fusiona los cinco especialistas para su uso con Ollama y se publica por separado. Cada especialista emite un sobre JSON compacto ("slim envelope") que actua como representacion intermedia: la integracion lo parsea y ejecuta las llamadas de servicio reales contra Home Assistant.

El interes actual del modelo reside en su enfoque de despliegue privado y offline-first para IoT: esta pensado para ejecutarse en hardware local como Raspberry Pi 5, Mac mini o equipos tipo NUC, sin dependencia de la nube, de modo que los comandos y la telemetria del hogar no abandonan la red local. Existe ademas una variante de 14B para despliegues con 16 GB de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3 1.7B), con adaptadores LoRA por especialista |
| Parametros totales | 2.031.739.904 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q6_K para la base; adaptadores LoRA en F16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF, adaptadores LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 1.7B, un transformer decoder-only, y se especializa mediante ajuste por instrucciones con LoRA. La publicacion principal contiene cinco adaptadores LoRA independientes en F16 sobre una base GGUF Q6_K, cada uno entrenado para una intencion concreta del dominio domotico: control de dispositivos, autoria de automatizaciones, respuesta sobre estado en vivo, aclaracion ante peticiones ambiguas y asistencia tecnica basada en documentacion. La integracion oficial alterna entre especialistas en funcion del contexto de la peticion.

La innovacion tecnica central no esta en la arquitectura sino en el protocolo de salida. Cada especialista emite un "slim envelope": un objeto JSON de claves de un solo caracter (`c`, `s`, `e`, `d`, `r`, `q`, `o`, `src`) disenado para minimizar el consumo de tokens. Este sobre es una representacion intermedia y no una accion final: el parser `_convert_slim_shape` de la integracion lo transforma en llamadas de servicio de Home Assistant, resoluciones de estado en vivo, YAML de automatizacion o citas documentales. El modelo, por diseno, nunca inventa el estado de los dispositivos; emite las llamadas a realizar o las entidades a consultar, y la integracion completa el circuito. El especialista `utilities` recibe ademas un bloque `RELEVANT DOCS` inyectado en inferencia para fundamentar sus respuestas y devolver citas. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de comandos de control domotico en lenguaje natural, resueltos contra el estado en vivo de las entidades de Home Assistant.
- Autoria de automatizaciones y blueprints de Home Assistant, con salida en YAML valido o en un objeto JSON de automatizacion mapeable a YAML.
- Respuesta a preguntas sobre el estado del hogar mediante plantillas con marcadores `{entity_id}` que la integracion rellena con estado real.
- Generacion de preguntas de aclaracion con opciones de respuesta rapida cuando la peticion es ambigua.
- Asistencia tecnica fundamentada en documentacion recuperada, con citas a los fragmentos de origen (`src`).
- Soporte de tool calling / function calling en el sentido de que emite llamadas de servicio estructuradas (aunque la ejecucion la realiza la integracion, no el modelo).
- Orquestacion de escenas y rutinas encadenando multiples acciones sobre varias entidades.
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Control por chat de dispositivos del hogar: el usuario escribe "apaga las luces de la cocina" y el especialista `command` emite el servicio y la entidad; la integracion ejecuta la llamada en orden de array y muestra la confirmacion.
- Creacion de automatizaciones en lenguaje natural: una descripcion como "cuando se abra la puerta principal despues de las 22:00, enciende la luz del porche" produce un borrador de YAML de Home Assistant que el usuario revisa antes de guardar.
- Orquestacion de escenas y rutinas: una orden como "buenas noches" encadena el cierre de puertas, la atenuacion de luces del dormitorio y el ajuste del termostato sin escribir scripts a mano.
- Preguntas y respuestas sobre el hogar: "esta funcionando la lavadora?" o "que temperatura hace arriba?" devuelven las entidades a consultar y una plantilla de respuesta que la integracion rellena con el estado en vivo.
- Asistencia tecnica fundamentada en documentacion: "por que el sensor del salon esta no disponible?" o "como anado la integracion Hue?" se responden a partir de documentacion recuperada, con estado en vivo inyectado y citas a la fuente.
- Asistente de hogar con privacidad primero: despliegue completo en Raspberry Pi 5, Mac mini o equipos tipo NUC, sin dependencia de la nube, de modo que comandos y telemetria permanecen en la LAN.
- Aclaracion de peticiones ambiguas: ante una orden imprecisa, el especialista `clarification` devuelve una pregunta y opciones de respuesta rapida para desambiguar antes de actuar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con base Qwen3 1.7B en GGUF Q6_K y adaptadores LoRA F16, el peso de los pesos ronda los 1,5-2 GB, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: no disponibles; el autor orienta el despliegue a Apple Silicon, Linux y Windows mediante llama-server u Ollama, y a la nube mediante vLLM.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de la base (1.7B) y la cuantizacion Q6_K, aunque no se confirma con cifras oficiales.
- Opciones de despliegue: llama-server (runtime de la integracion de Home Assistant), Ollama (modelo fusionado `selora-ollama`), vLLM (nube) y transformers con safetensors.
- Hardware local objetivo segun el autor: Raspberry Pi 5, Mac mini y equipos tipo NUC.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selora AI LLM 1.7B | 2.031.739.904 | no disponible | Domotica Home Assistant, LoRA especializados, salida JSON | Apache-2.0 | Hugging Face (transformers, GGUF, Ollama) |
| Qwen3 1.7B (base) | 1.7B | no disponible | LLM generalista | Apache-2.0 | Hugging Face |
| Selora AI LLM 14B | no disponible | no disponible | Domotica Home Assistant para despliegues de 16 GB | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se documenta soporte de otros idiomas.
- La salida es un sobre JSON intermedio, no una accion ejecutable: sin la integracion de Selora AI o un parser equivalente, el modelo no ejecuta llamadas de servicio ni resuelve estado.
- Riesgo de alucinacion mitigado por diseno (el modelo no fabrica estado de dispositivos), pero las plantillas, preguntas y YAML generados pueden ser incorrectos y requieren validacion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan garantias ni soporte.
- La longitud de contexto no esta publicada, lo que limita la planificacion de conversaciones multi-turno largas.
- El modelo esta fuertemente especializado en Home Assistant; su utilidad fuera del dominio domotico es limitada.
- No se dispone de datos de benchmarks que permitan comparar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Variante Ollama: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B-ollama
- Variante 14B: https://huggingface.co/selorahomes/Selora-AI-LLM-14B
- Modelo base Qwen3 1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Integracion Home Assistant: https://github.com/SeloraHomes/ha-selora-ai
- Sitio del autor: https://selorahomes.com
- Home Assistant: https://www.home-assistant.io/
