# rntdev/dykan

## Resumen

Dykan es un ajuste fino (fine-tune) en ucraniano de los modelos multimodales Gemma 4 E4B-it y E2B-it de Google, desarrollado por rntdev. Su proposito es servir como motor de un asistente escolar offline para estudiantes de Ucrania: explica y resuelve tareas escolares y de los examenes ZNO/NMT, puede razonar paso a paso antes de responder y ejecuta peticiones multi-paso con las herramientas que declare la aplicacion (deberes, notas, horario, mensajes, recordatorios).

El modelo se distribuye en dos variantes: Dykan E4B (sobre Gemma 4 E4B-it) y Dykan E2B (sobre Gemma 4 E2B-it), ambas con adaptadores LoRA y builds fusionados y cuantizados a 4 bits para MLX, pensados para ejecucion local en Mac y, potencialmente, en dispositivos moviles. La licencia es Apache 2.0, igual que los modelos base.

La relevancia actual radica en su doble enfoque: por un lado, mejora sustancial de resultados en examenes oficiales ucranianos frente al modelo base (50,3 % frente a 43,6 % en E4B); por otro, un salto muy marcado en tareas de tool calling multi-paso (97,7 % frente a 83,8 % en E4B), lo que lo hace util para agentes escolares con backend simulado y nombres de herramientas no vistos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) derivado de Gemma 4; ajuste mediante LoRA |
| Parametros totales | no disponible (modelo base Gemma 4 E4B / E2B; el adaptador LoRA ocupa 532 MB en E4B y 92 MB en E2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (builds MLX); bf16 en precision completa |
| Idiomas soportados | ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA y builds MLX-4bit); libreria MLX |

## Arquitectura y entrenamiento

Dykan se construye como un ajuste LoRA sobre las proyecciones de atencion y MLP del modelo de lenguaje de Gemma 4 E4B-it y E2B-it. El rango es 64 para E4B y 16 para E2B; segun el autor, con rango 64 en E2B las respuestas de examen colapsaban. Los codificadores de vision y audio, los embeddings y la capa de salida permanecen sin cambios, por lo que la comprension de imagenes es la del modelo base. El entrenamiento consistio en una pasada barajada sobre dos copias de un conjunto de instrucciones (unas 62.600 muestras) mas 36.000 articulos relevantes para el ambito escolar de Wikipedia en ucraniano (39,8 millones de palabras).

El corpus combina tareas ZNO/NMT anteriores a 2020 con claves oficiales, tareas curriculares, explicaciones, dialogos de tutoria y chat general generados por Gemma 4 31B en GPUs propias y filtrados mediante comprobaciones de respuesta, resolucion ciega, verificacion de hechos y un filtro de ucraniano limpio. Incluye 4.415 soluciones trabajadas en formato de pensamiento (el desarrollo en el canal de pensamiento de Gemma y luego una respuesta breve) y episodios de herramientas sobre un backend escolar simulado, la mitad con herramientas renombradas aleatoriamente y algunos con herramientas inventadas para otros dominios. Los examenes desde 2020 se reservaron como conjunto de evaluacion y todo el texto de entrenamiento se filtro contra ellos para evitar casi duplicados. No se usaron salidas de APIs comerciales.

## Capacidades

- Generacion de texto y razonamiento paso a paso en ucraniano, con modo de pensamiento activable (`enable_thinking=True`) que escribe el desarrollo entre `<|channel>thought` y `<channel|>` antes de la respuesta breve.
- Resolucion de tareas escolares y de examenes ZNO/NMT en asignaturas como lengua y literatura ucranianas, historia de Ucrania, geografia y matematicas.
- Tool calling y function calling con el template de chat estandar de Gemma 4; los resultados de herramientas se devuelven como `tool_responses` en el mensaje del asistente.
- Ejecucion de peticiones multi-paso y agenticas sobre un backend escolar (deberes, notas, horario, mensajes, recordatorios).
- Robustez ante nombres de herramientas no vistos durante el entrenamiento.
- Comprension de imagenes heredada del modelo base (no entrenada especificamente en esta fase).
- Capacidades multilingues limitadas al ucraniano segun la model card.

## Casos de uso

- Asistente escolar offline para estudiantes ucranianos: el modelo resuelve y explica tareas de matematicas, historia, geografia y lengua en ucraniano, con modo de pensamiento para mostrar el desarrollo, lo que encaja con un uso sin conexion en dispositivos locales.
- Preparacion de examenes ZNO/NMT: dado su ajuste sobre tareas oficiales 2020-2024 y sus mejoras medidas en examenes retenidos (50,3 % en E4B frente a 43,6 % del base), sirve como entrenador de practicas con correccion y explicacion.
- Agente de gestion escolar con tool calling: puede crear recordatorios, consultar horarios, registrar deberes y enviar mensajes a traves de herramientas declaradas por la app, con una tasa de finalizacion del 97,7 % en episodios multi-paso (E4B).
- Tutoria conversacional multi-turno: genera dialogos de tutoria y explicaciones adaptadas, entrenado con dialogos sinteticos filtrados por calidad y verificacion de hechos.
- Integracion en aplicaciones Mac mediante MLX: los builds de 4 bits (4,8 GB en E4B y 3,3 GB en E2B) permiten ejecucion local en Mac sin conexion, con un demo de chat incluido en el repositorio.
- Prototipado de agentes con herramientas dinamicas: al mantener el 97,7 % de exito con herramientas renombradas, es adecuado para entornos donde los nombres de funciones cambian o no se conocen de antemano.
- Evaluacion comparativa de modelos ucranianos: sirve como referencia para comparar fine-tunes sobre Gemma 4 frente a alternativas como MamayLM en tareas de examen.

## Benchmarks y rendimiento

Resultados en examenes ZNO/NMT retenidos 2020-2024 (1.111 tareas de texto, solo respuesta, greedy) y 130 episodios multi-paso de herramientas sobre backend simulado, en precision completa (bf16). Los builds de 4 bits no se evaluaron por separado.

| Metrica | Gemma 4 E4B | Dykan E4B | Gemma 4 E2B | Dykan E2B |
|---|---|---|---|---|
| Examenes, todas las asignaturas | 43,6 % | 50,3 % | 32,8 % | 39,3 % |
| Lengua y literatura ucranianas | 36,7 % | 41,6 % | 26,5 % | 32,4 % |
| Historia de Ucrania | 47,5 % | 55,1 % | 33,5 % | 44,3 % |
| Geografia | 71,2 % | 82,1 % | 60,3 % | 64,7 % |
| Matematicas | 27,1 % | 33,9 % | 22,0 % | 22,9 % |
| Tareas de herramientas completadas | 83,8 % | 97,7 % | 53,1 % | 95,4 % |
| Herramientas con nombres nunca vistos | 73,8 % | 97,7 % | 53,8 % | 96,2 % |
| Calendario en el system prompt | no disponible | 100 % | no disponible | 98,5 % |

Referencia en el mismo conjunto de examenes: MamayLM 4B v1.0 36,8 % y MamayLM 12B v2.0 56,4 % (ambos sobre Gemma 3).

## Requisitos de hardware

- VRAM estimada: builds MLX de 4 bits de 4,8 GB (E4B) y 3,3 GB (E2B); en precision completa, el tamano del repositorio es de 9,4 GB incluyendo adaptadores y builds.
- GPU recomendadas: no disponibles de forma explicita; los builds MLX estan orientados a Mac con Apple Silicon. Para precision completa con Transformers se indica `device_map="auto"`, sin GPU concreta especificada.
- Cabe en GPU de consumo: probablemente en GPUs con 8 GB o mas para los builds de 4 bits, aunque el autor no publica requisitos oficiales; no confirmado.
- Opciones de despliegue: Transformers con PEFT (`PeftModel.from_pretrained` y `merge_and_unload`) para precision completa; MLX para Mac con el demo `demo.chat`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Examenes (todas) | Tool tasks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dykan E4B | base Gemma 4 E4B (no disponible) | no disponible | 50,3 % | 97,7 % | Apache 2.0 | Hugging Face (rntdev/dykan) |
| Dykan E2B | base Gemma 4 E2B (no disponible) | no disponible | 39,3 % | 95,4 % | Apache 2.0 | Hugging Face (rntdev/dykan) |
| MamayLM 4B v1.0 | 4B | no disponible | 36,8 % | no disponible | no disponible | no disponible |
| MamayLM 12B v2.0 | 12B | no disponible | 56,4 % | no disponible | no disponible | no disponible |

MamayLM se evalua en el mismo conjunto de examenes y ambos se basan en Gemma 3, segun la model card. No se dispone de datos de contexto ni de tool calling para MamayLM en la informacion proporcionada.

## Limitaciones y advertencias

- El conocimiento termina antes de principios de 2025 y el modelo puede afirmar hechos erroneos con seguridad, incluso dentro de su canal de pensamiento; conviene verificar hechos, fechas y normas contra un libro de texto.
- No fue entrenado con imagenes: la comprension de imagenes es la del modelo base.
- E2B es notablemente mas debil que E4B (39 % frente a 50 % en examenes); se recomienda E4B cuando el dispositivo lo permita.
- Las puntuaciones de examen son solo de respuesta (answer-only), lo que puede no reflejar el rendimiento en formato abierto.
- Los builds de 4 bits y los runtimes en telefono no se han evaluado; el autor reporta que Gemma 4 E2B de serie mostro bucles y ucraniano corrupto en un runtime movil, algo que no ocurrio en precision completa.
- El modelo requiere en el system prompt la fecha, la hora y un calendario breve; sin ellos falla en aritmetica de dias de la semana.
- Los datos de entrenamiento incluyen texto de Wikipedia en ucraniano (CC BY-SA) y tareas de examenes ZNO/NMT cuyos derechos pertenecen a la entidad correspondiente; conviene revisar implicaciones de licencia en uso comercial.
- Idioma limitado al ucraniano; no se documentan capacidades multilingues adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rntdev/dykan
- Repositorio de codigo, pipeline de datos y evaluaciones: https://github.com/rntdev1/dykan
- Modelo base Gemma 4 E4B-it: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base Gemma 4 E2B-it: https://huggingface.co/google/gemma-4-E2B-it
- Paper referenciado (arxiv:2607.02770): https://arxiv.org/abs/2607.02770
- Paper referenciado (arxiv:2501.06715): https://arxiv.org/abs/2501.06715
- Paper referenciado (arxiv:2412.10893): https://arxiv.org/abs/2412.10893
