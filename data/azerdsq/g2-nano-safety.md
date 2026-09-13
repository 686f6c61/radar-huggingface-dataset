# AZERDSQ/G2-nano-safety

## Resumen

G2-nano-safety es un clasificador de seguridad de unos 60 millones de parámetros desarrollado por AZERDSQ, diseñado como *outbound judge* para mensajes que un agente de IA está a punto de enviar a una herramienta externa. No es un chatbot ni un modelo generativo: emite una decisión de tres vías (ALLOW, REDACT o BLOCK) sobre el mensaje del usuario, y la salida JSON con los tramos detectados y el texto redactado la construye un ensamblador determinista, no los 60M del modelo.

El problema que resuelve es concreto: evitar que un agente filtre direcciones de correo, contactos, secretos o contenido peligroso al ejecutar una acción. El *runtime* aporta el destino, el historial de herramientas y las políticas; la aplicación solo envía el texto del mensaje. El sistema encadena un detector de expresiones regulares, un veto de secretos que fuerza BLOCK, el backbone de 60,04M con una cabeza de 3 logits (argmax) y un ensamblador que produce el JSON final.

Es relevante por su tamaño y su objetivo de despliegue: se entrenó en una NVIDIA Jetson Orin Nano de 8 GB de memoria unificada y se distribuye como pesos safetensors más código de confianza (`judge.py`), no como GGUF de chat. Su contexto nativo es de 2048 tokens, aunque la ejecución del clasificador se hace a 1024. La licencia es Apache 2.0 y tanto los datos de entrenamiento como las ejecuciones intermedias permanecen privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer decoder tipo G2-nano-base (14 capas, hidden 576) con cabeza de clasificacion de 3 logits; pipeline completo: detector regex + veto de secretos + backbone + ensamblador JSON |
| Parametros totales | 60.035.331 (60,03M de backbone + cabeza de 3x576) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens nativo; la ejecucion del clasificador se hace a 1024 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos distribuidos en safetensors |
| Idiomas soportados | No disponible (el autor indica tokenizer y benchmarks centrados en ingles; los ejemplos de la model card estan en frances) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors + codigo personalizado (`judge.py`, requiere `trust_remote_code`) |
| Atencion | GQA, 9 cabezas de consulta / 1 cabeza de clave-valor |
| Vocabulario | 16.388 tokens (16.384 SentencePiece + 4 tokens de chat) |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder pequeño (14 capas, hidden de 576, atencion con agrupacion de consultas GQA de 9 cabezas de consulta por 1 de clave-valor) sobre el que se monta una cabeza de clasificacion de tres logits que decide ALLOW, REDACT o BLOCK mediante argmax. Alrededor del backbone hay dos componentes deterministas que se ejecutan antes: un detector de expresiones regulares y un veto de secretos que fuerza BLOCK. Despues, un ensamblador construye el JSON de la API con la lista de hallazgos (texto, offsets de inicio y fin, tipo, rol y accion) y el mensaje redactado. Es decir, el modelo de 60M no genera JSON: solo vota la clase, y el JSON lo arma una red determinista.

El entrenamiento parte de G2-nano-base (nunca del checkpoint instruct) y consiste en un SFT de clasificacion (`sft_cls`, paso 104) con 432 casos gemelos mas 50 casos gold, empaquetados a longitud de secuencia 1024. El hardware de entrenamiento fue una NVIDIA Jetson Orin Nano con 8 GB de memoria unificada. La model card no menciona RLHF ni DPO. La evaluacion oficial se hizo sobre un banco contextual interno de 39 casos con identificadores excluidos del entrenamiento (`data/bench_context.jsonl`). El autor declara explicitamente que experimentos cerrados como la generacion de JSON o `sft_cls_v2` (39/39 sobre plantillas vistas en entrenamiento) no corresponden a este checkpoint y no deben citarse como resultado del producto.

## Capacidades

- Clasificacion de seguridad de tres vias sobre el mensaje saliente de un agente: ALLOW (se envia sin cambios), REDACT (se envia con `redacted_message` y `findings`) y BLOCK (no se envia nada, `redacted_message` vacio).
- Deteccion de entidades con offsets: cada hallazgo incluye `text`, `start`, `end`, `type`, `role` y `action`, lo que permite redactar selectivamente en lugar de bloquear.
- Redaccion de datos personales en el texto: en el ejemplo de la model card, una direccion de correo se sustituye por `[EMAIL]` y se conserva el resto de la frase.
- Veto de secretos: si el detector previo identifica secretos, la decision forzada es BLOCK, independientemente de la votacion del backbone.
- Juicio contextual dependiente de herramienta: la funcion `judge()` acepta `tool_context` (por ejemplo `mail.send`), de modo que la decision depende del destino o destino/herramienta que aporta el runtime.
- Integracion como red de seguridad para tool calling y agentes multi-paso, evaluando el mensaje justo antes de la ejecucion de la accion.
- Ejecucion en dispositivos de borde: entreno en Jetson Orin Nano y pesos de ~60M permiten inferencia en hardware muy limitado.
- No soporta: conversacion, generacion de texto abierto, etiquetado NER general, ni uso como modelo de chat. El autor indica explicitamente que no hay etiqueta Ollama de chat para este modelo.
- Capacidades multilingues: no documentadas; el tokenizer y los benchmarks son de base inglesa, con ejemplos en frances en la model card.

## Casos de uso

- Moderacion de salida en agentes de correo: antes de llamar a `mail.send`, el *runtime* pasa el mensaje y el `tool_context` al juez; si detecta un contacto en texto plano, devuelve REDACT con la direccion sustituida por `[EMAIL]` y el mensaje se envia sin el dato. Es adecuado porque la decision es de tres vias y conserva el texto utilizable.
- Prevencion de fuga de secretos en asistentes de codigo: el veto de secretos fuerza BLOCK cuando el modelo detecta credenciales o tokens en el mensaje saliente; encaja en flujos donde el agente podria copiar una clave de un fichero a una llamada HTTP.
- Guardrail en pipelines de tool calling: como paso previo obligatorio a la ejecucion de cualquier herramienta, registrando los `findings` con offsets para auditar que se bloqueo y por que. El coste computacional de 60M de parametros permite ejecutarlo en cada llamada.
- Cumplimiento de proteccion de datos en soporte al cliente: redaccion automatica de correos, telefonos u otros identificadores presentes en respuestas generadas antes de que salgan del sistema, dejando traza estructurada (tipo, rol, accion) para el registro de tratamiento.
- Filtro de primera linea delante de un juez mayor: al resolver ALLOW y BLOCK claros con 60M de parametros, reduce el volumen de mensajes que hay que pasar a un juez de ~3B como Shieldstral, bajando coste y latencia del stack completo.
- Despliegue en el borde o en entornos con memoria unificada: al haberse entrenado en una Jetson Orin Nano de 8 GB y ocupar 0,2 GB de repositorio, puede ejecutarse en pasarelas locales, dispositivos industriales o portatiles sin GPU dedicada.
- Evaluacion de politicas de contenido y red teaming: el sistema devuelve una decision comparable y una tasa de fuga medible, util para probar reglas de negocio (que se debe bloquear, que se debe redactar) sobre un banco de casos propio antes de desplegar la politica.
- Control de acciones peligrosas en agentes autonomos: el autor plantea el BLOCK como ultima linea ante acciones no deseadas, siempre acompanado de control de acceso y revision humana, nunca como sustituto de ellos.

## Benchmarks y rendimiento

Se han publicado resultados de evaluacion internos del autor (no hay datos de benchmarks publicos tipo MMLU, HumanEval o GSM8K para este checkpoint, dado que es un clasificador y no un modelo generativo).

Banco contextual interno oficial, N=39, metrica de decision (mayor es mejor):

| Sistema | Decision | Leak | FPR |
|---|---:|---:|---:|
| G2-nano-safety (`sft_cls` + ensamblador) | 92,3% (36/39) | 0 | 2,6% |
| Regex ingenuo (match → BLOCK) | 46,2% | 0 | 12,8% |
| GLiNER edge + wrapper | 61,5% | 12,8% | 23% |
| Shieldstral Q4 + ensamblador del autor | 69,2% | 17,9% | 12,8% |

Conjunto contextual extendido, N=200 (los 39 casos historicos mas 161 casos deterministas nuevos: 46 ALLOW, 82 REDACT, 72 BLOCK):

| Sistema | Agregado | Leak | FPR |
|---|---:|---:|---:|
| G2-nano-safety | 153/200 (76,5%) | 4,0% | 0,5% |
| Shieldstral Q4 + ensamblador | 133/200 | no disponible | no disponible |
| GLiNER edge + wrapper | 118/200 | no disponible | no disponible |
| Regex ingenuo | 98/200 | no disponible | no disponible |

Desglose por clase en el conjunto de 200: BLOCK 100%, ALLOW 97,8%, REDACT 43,9%. El autor advierte de que los 39 casos de seleccion forman parte de los 200, por lo que la extension no es un *hold-out* puro, y de que la debilidad principal esta en REDACT (frecuentes sobre-bloqueos o ALLOW indebidos). Los tres errores del conjunto oficial son sobre-bloqueos (`act_not_quote_en`, `clean_local_code`, `local_contact_redact`). No se deben citar como resultado del producto ni el 39/39 de `sft_cls_v2` ni el 43/52 de generacion de JSON.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos de ~60M de parametros, aproximadamente 240 MB en fp32 o 120 MB en fp16/bf16, mas el *overhead* de activaciones a 1024 tokens. El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB libres; el autor entreno y valido en una NVIDIA Jetson Orin Nano con 8 GB de memoria unificada. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (serie RTX 30/40, incluso integradas) y en dispositivos de borde tipo Jetson.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code` y el modulo `judge.py` (`load_judge` + `judge`), o por linea de comandos (`python3 judge.py --repo ... --message ... --tool-context ...`). El autor indica que no existe etiqueta Ollama de chat ni GGUF de chat, y no se documentan integraciones con vLLM, TGI o llama.cpp.
- Latencia y throughput estimados: no disponibles (el autor no publica cifras de latencia ni de peticiones por segundo).

## Comparativa con modelos similares

Comparativa con los sistemas incluidos en la evaluacion interna del autor. Los datos de GLiNER edge y Shieldstral Q4 corresponden a la medicion realizada por el autor con su propio ensamblador, no a cifras oficiales de esos proyectos.

| Modelo | Parametros | Contexto | Decision (N=39) | Decision (N=200) | Leak (N=39) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| G2-nano-safety | 60,03M | 2048 nativo, 1024 en clasificacion | 92,3% | 76,5% | 0 | Apache 2.0 | Pesos safetensors + `judge.py` en Hugging Face |
| Regex ingenuo (match → BLOCK) | No aplica | No aplica | 46,2% | 98/200 | 0 | No aplica | Implementacion propia |
| GLiNER edge + wrapper | No disponible | No disponible | 61,5% | 118/200 | 12,8% | No disponible | No disponible en la informacion proporcionada |
| Shieldstral Q4 + ensamblador | ~3B (segun el autor) | No disponible | 69,2% | 133/200 | 17,9% | No disponible | No disponible en la informacion proporcionada |

El propio autor matiza que Shieldstral es un juez de ~3B y que la comparacion es "mismo mensaje, distinto stack", no una afirmacion de superioridad general en seguridad.

## Limitaciones y advertencias

- No es un chatbot: no tiene calidad conversacional ni debe invocarse con `generate()` como si fuera un modelo de chat.
- Muestra de evaluacion muy pequena: N=39 en el conjunto oficial y N=200 en la extension, que reutiliza los 39 casos de seleccion; la propia model card lo califica de banco interno, no de *leaderboard* publico de seguridad.
- Debilidad medida en REDACT: cae al 43,9% en el conjunto de 200, con frecuencia sobre-bloqueando o permitiendo el envio cuando deberia redactar.
- Tres errores conocidos en el conjunto oficial son sobre-bloqueos en casos limpios (`act_not_quote_en`, `clean_local_code`, `local_contact_redact`), lo que implica falsos positivos en trafico legitimo.
- Tokenizer y bancos de prueba centrados en ingles; el comportamiento multilingue no esta documentado ni evaluado (los ejemplos de la model card estan en frances).
- No debe ser el unico control alrededor de trafico de alto riesgo o que maneje secretos; no sustituye a control de acceso, cifrado ni revision humana de acciones peligrosas.
- Los datos de entrenamiento y las ejecuciones intermedias son privados, por lo que los resultados no son reproducibles de forma independiente.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la ficha, sin validacion de terceros conocida.
- Requiere ejecutar codigo personalizado (`trust_remote_code`), lo que implica revisar `judge.py` antes de integrarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero al ser pesos mas codigo de ensamblador conviene verificar los terminos del repositorio de los que derive cada artefacto.

## Enlaces

- [Modelo en Hugging Face: AZERDSQ/G2-nano-safety](https://huggingface.co/AZERDSQ/G2-nano-safety)
- [G2-nano-base](https://huggingface.co/AZERDSQ/G2-nano-base)
- [G2-nano-instruct](https://huggingface.co/AZERDSQ/G2-nano-instruct)
- [Organizacion AZERDSQ en Hugging Face](https://huggingface.co/AZERDSQ)
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: todos los enlaces encontrados corresponden a cuentas de redes sociales sin relacion con el proyecto. No hay paper, blog, repositorio adicional ni demo publicados en la informacion disponible.
