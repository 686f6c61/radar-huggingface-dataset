# hxbibb19/Llama-Reflex-1B-GGUF

## Resumen

Llama-Reflex-1B es un modelo derivado de Llama 3.2 1B Instruct, desarrollado por Sadman Habib (usuario de Hugging Face `hxbibb19`) para el asistente iOS sin conexión OffLlama, presentado en el hackathon Meta Global AI Developer. No es un modelo conversacional de propósito general: es un módulo de decisión tipado, un "System 1" que en un único paso forward resuelve preguntas de opción múltiple sobre qué hacer con una petición del usuario (enrutar a una herramienta, recordar un dato, responder offline, pedir confirmación antes de actuar, etc.).

Técnicamente se trata de un fine-tuning con LoRA (r=16, una época, 112 pasos) destilado a partir de 892 etiquetas generadas por el profesor Muse Glimmer 30B (Apache-2.0), fusionado en el modelo base y cuantizado a Q4_K_M para llama.cpp. El resultado es un GGUF de 807.694.080 bytes (unos 0,8 GB) byte a byte idéntico al que se distribuye dentro de la app OffLlama y al del release de GitHub del proyecto.

Su relevancia radica en el enfoque: en lugar de generar texto, el modelo lee las probabilidades de los tokens de letra de opción (" A" … " H") tras `Answer:` y el runtime acepta la decisión solo si la probabilidad supera un umbral calibrado (τ = 0,90); en caso contrario aplica un fallback explícito. Este diseño lo hace apropiado para inferencia en dispositivo (iPhone) con llama.cpp, sin red y con latencia de un solo token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B Instruct) con fine-tuning LoRA fusionado |
| Parametros totales | 1.235.814.432 (1,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 1B Instruct) |
| Tipos de cuantizacion | Q4_K_M (unica publicada); se evaluaron f16, Q8_0, Q3_K_M y Q2_K pero no se distribuyeron |
| Idiomas soportados | ingles unicamente |
| Licencia | Llama 3.2 Community License (con Acceptable Use Policy de Llama 3.2) |
| Formato de pesos | GGUF (llama.cpp); incluye `calibration.json` con priors por decision y umbral por defecto τ = 0,90 |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, un transformer decoder-only de 1,24 mil millones de parametros. Sobre el se aplico un LoRA de rango 16 durante una epoca (bf16, batch efectivo 8, 112 pasos), con la funcion de perdida calculada unicamente sobre el token de la letra de respuesta. El conjunto de entrenamiento son 892 preguntas de decision tipadas respondidas por el profesor Muse Glimmer 30B (Apache-2.0), es decir, destilacion de etiquetas en lugar de anotacion humana. Tras el entrenamiento, el adaptador se fusiono en los pesos base y se cuantizo a Q4_K_M con llama.cpp.

La innovacion principal no esta en la arquitectura sino en el protocolo de uso: cada decision se formula como una pregunta de opcion multiple en formato de chat de Llama 3, el modelo genera un solo token (la letra de la opcion) y la app lee las probabilidades top de las letras " A" a " H". Si la probabilidad de la letra ganadora alcanza el umbral τ = 0,90 se acepta la decision; si no, se ejecuta el fallback definido para ese tipo de decision. Los tipos de decision cubiertos son `route`, `toolChoice`, `rememberOrNot`, `memoryConflict`, `notificationTriage`, `confirmBeforeAct`, `nudgeNow`, `timing`, `sensitivity`, `answerability`, `contactPick` y `eventPick`.

## Capacidades

- Clasificacion de decisiones tipadas en un solo paso forward: enrutamiento de peticiones, eleccion de herramienta, decision de recordar o no un dato, deteccion de conflicto de memoria, triaje de notificaciones, confirmacion antes de actuar, temporizacion de avisos, evaluacion de sensibilidad, evaluacion de si una pregunta es respondible offline, seleccion de contacto y seleccion de evento.
- Salida restringida a la letra de opcion con probabilidades asociadas, lo que permite umbrales de confianza y fallbacks deterministas.
- Capacidad conversacional basica y generacion de texto libre heredada de Llama 3.2 1B Instruct, aunque el autor advierte explicitamente que no es un modelo de chat general y que la calidad de generacion libre es la de un modelo de 1B.
- Soporte de tool calling de facto a traves de la decision `toolChoice`, no mediante un protocolo de function calling generico.
- Ingles unicamente; sin capacidades multilingues declaradas.
- Sin vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente personal offline en iOS: integrar el GGUF en una app Swift con llama.cpp para que el telefono decida localmente si una peticion puede resolverse sin red, enrutandola al modelo local o marcandola como no respondible offline. El tamano de 0,8 GB y la generacion de un solo token lo hacen viable en dispositivo.
- Enrutamiento a herramientas en agentes moviles: usar `toolChoice` para seleccionar entre un conjunto fijo de herramientas (calendario, contactos, calculadora) antes de invocar APIs, reduciendo llamadas innecesarias a modelos mayores.
- Gestion de memoria personal: aplicar `rememberOrNot` y `memoryConflict` para decidir si un dato del usuario debe persistirse y si entra en conflicto con memoria previa, con fallback a preguntar al usuario cuando la confianza es baja.
- Triaje de notificaciones: clasificar notificaciones entrantes con `notificationTriage` y `nudgeNow` para decidir si interrumpir al usuario ahora o posponer el aviso, ejecutandose totalmente offline.
- Confirmacion previa a acciones sensibles: usar `confirmBeforeAct` y `sensitivity` como capa de seguridad antes de que un agente ejecute acciones irreversibles (envio de mensajes, compras), con umbral de confianza que fuerza la confirmacion humana.
- Seleccion de entidades en UI: `contactPick` y `eventPick` para desambiguar a que contacto o evento se refiere una peticion ambigua antes de mostrar un dialogo de seleccion.
- Filtro de coste en pipelines hibridos: como primera etapa que decide si merece la pena invocar un modelo grande en la nube, ahorrando latencia y coste en peticiones triviales (saludos, aritmetica simple, ortografia).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test guardado de 120 preguntas de decision (10 por cada tipo original), con los mismos prompts para ambos modelos:

| Metrica | Llama 3.2 1B Instruct | Llama-Reflex-1B |
|---|---|---|
| Opcion correcta elegida | 89 / 120 (74,2%) | 98 / 120 (81,7%) |
| Expected calibration error (menor es mejor) | 0,150 | 0,064 |

Con el umbral de distribucion τ = 0,90, Llama-Reflex-1B acepto 44 de las 120 decisiones y 41 de esas 44 fueron correctas; las otras 76 recurrieron al fallback. El autor advierte que el umbral se eligio sobre los mismos datos usados para seleccionar el modelo, por lo que no constituye una cota de error certificada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB para el unico archivo publicado (Q4_K_M, 807.694.080 bytes) mas el overhead de contexto de llama.cpp; en la practica cabe en cualquier dispositivo con ~1,5 GB de memoria libre.
- GPU recomendadas: no requiere GPU dedicada; el caso de uso objetivo es iPhone (Metal via llama.cpp). En escritorio funciona en cualquier GPU consumer (RTX 3060 o superior) e incluso en CPU.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas e integradas; el cuello de botella no es la memoria sino el numero de tokens generados (uno por decision).
- Opciones de despliegue: llama.cpp (`llama-server` con `n_predict: 1` y `n_probs: 8`, `temperature: 0`), runtime Swift de OffLlama en iOS. No se menciona soporte de vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles de forma medida; por diseno la inferencia es de un unico token por decision, lo que minimiza la latencia frente a modelos generativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Reflex-1B | 1,24 B | no disponible | Clasificador de decisiones destilado, salida de un token con umbral | Llama 3.2 Community License | GGUF en Hugging Face y release de GitHub |
| Llama 3.2 1B Instruct | 1,24 B | no disponible en la informacion proporcionada | Chat general | Llama 3.2 Community License | Pesos oficiales de Meta |
| Muse Glimmer 30B (profesor) | 30 B | no disponible | Modelo generador usado para etiquetar | Apache-2.0 | no disponible en la informacion proporcionada |

Frente a Llama 3.2 1B Instruct, la comparativa directa publicada por el autor muestra una mejora de 74,2% a 81,7% en acierto de decision y una reduccion del ECE de 0,150 a 0,064, a costa de especializarse en formatos fijos. No se dispone de datos de otros modelos comparables de clasificacion de decisiones en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de evaluacion es pequeno (120 ejemplos escritos por el autor) y mide decisiones individuales, no el exito de tareas completas en el telefono.
- El umbral τ = 0,90 se eligio sobre los mismos datos usados para seleccionar el modelo; no es una cota de error certificada (ver documento de limites de evaluacion del repositorio).
- Entrenado para los formatos fijos de decision de OffLlama; no es un modelo de chat general y la calidad de generacion libre es la de un modelo de 1B.
- Solo ingles; sin soporte multilingue.
- Riesgo de alucinacion en generacion libre y de calibracion erronea fuera de la distribucion de preguntas de entrenamiento.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada; al derivar de Llama 3.2 hereda los del modelo base.
- Licencia Llama 3.2 Community License: el uso comercial esta sujeto a sus terminos y a la Acceptable Use Policy de Llama 3.2, con obligaciones de atribucion ("Built with Llama").
- Solo se publica una cuantizacion (Q4_K_M); otras variantes fueron evaluadas y descartadas, por lo que no hay alternativas oficiales de mayor o menor precision.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la validacion externa del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hxbibb19/Llama-Reflex-1B-GGUF
- Repositorio OffLlama: https://github.com/hxbib/OffLlama
- Release de artefactos (incluye etiquetas de entrenamiento): https://github.com/hxbib/OffLlama/releases/tag/artifacts-2026-11-01
- Documento de limites de evaluacion: https://github.com/hxbib/OffLlama/blob/master/docs/EVALUATION_CLAIMS.md
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Perfil del autor: https://www.linkedin.com/in/sadmanhabib/
