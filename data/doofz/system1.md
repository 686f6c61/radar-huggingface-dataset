# doofz/System1

## Resumen

System1 es un modelo de decisión no autorregresivo desarrollado por doofz dentro del ecosistema HAL-X AI (Azerbaiyán). No genera texto: recibe un estado (un mensaje, ticket, correo, registro JSON, traza de agente o estado de juego) junto con preguntas tipadas redactadas en lenguaje natural, y devuelve una respuesta tipada para cada pregunta acompañada de una probabilidad calibrada, todo en una única pasada de encoder. Al no producir texto libre, no hay nada que parsear ni margen para alucinación, y el conjunto de etiquetas forma parte de la entrada, de modo que un esquema nuevo no requiere reentrenamiento.

Arquitectura: está construido sobre el encoder mmBERT-base de jhu-clsp (307 M de parámetros) más una cabeza de decisión de 15 M, sumando 321.908.998 parámetros. El modelo ocupa 0,65 GB de VRAM en bf16 y resuelve una pregunta en 9,4 ms en una RTX 4090, con hasta 3.075 decisiones por segundo en modo batch. Está post-entrenado en 18 idiomas y declara soporte multilingüe, con el azerbaiyano como idioma prioritario.

Su relevancia actual es como "System 1" rápido y barato que acompaña a los LLM grandes: enruta peticiones al modelo adecuado, aplica guardarraíles antes y después del LLM y toma decisiones de alto volumen, delegando en un modelo mayor solo cuando su propia confianza se lo indica. Se publica bajo licencia Apache 2.0 con pesos abiertos y autoalojamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (mmBERT-base) + cabeza de decisión |
| Parametros totales | 321.908.998 (307 M encoder + 15 M cabeza de decisión) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card reporta uso en bf16, 0,65 GB de VRAM) |
| Idiomas soportados | az, en, ru, tr, de, fr, es, ar, fa, hi, zh, ja, ko, ka, kk, uz, uk, it, multilingual (post-entrenado en 18 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

System1 es un modelo de decisión no autorregresivo construido sobre el encoder `jhu-clsp/mmBERT-base`, al que se añade una cabeza de decisión de 15 M de parámetros. En lugar de decodificar tokens, el modelo recibe un estado y un conjunto de preguntas tipadas y produce, en una sola pasada de encoder, una respuesta tipada por pregunta. Admite tres tipos de respuesta: `choice` (una clave más una probabilidad para cada opción), `noul` (probabilidad $P(\text{yes})$) y `score` (nivel esperado más distribución sobre niveles ordenados). Cuando el número de opciones de una pregunta `choice` supera las 24, el modelo cambia automáticamente a un torneo de dos pasadas.

La model card menciona RLCD (calibrated decisions) y post-entrenamiento calibrado como parte del enfoque, con foco explícito en la calibración de probabilidades (ECE bajo). Las preguntas pueden formularse en inglés o azerbaiyano, mientras que el estado puede estar en cualquier idioma. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación y decisión tipada: devuelve respuestas `choice`, `noul` y `score` con probabilidad calibrada por opción.
- Enrutado de LLM: selecciona el modelo, agente o herramienta adecuados para cada petición a partir de descripciones en texto libre de cada opción.
- Guardarraíles: comprobaciones de jailbreak, inyección de prompt, PII, toxicidad, autolesión, estafa o phishing y fuera de tema.
- Presets listos para usar: triaje, correo, guardarraíles, moderación y enrutado de LLM (endpoint `/v1/presets`).
- Modo batch: procesa varios elementos en una única pasada batcheada (`/v1/decide/batch`).
- Multilingüe: soporte declarado de 18 idiomas, con azerbaiyano como idioma prioritario; el estado puede estar en cualquier idioma.
- No autorregresivo: no genera texto, por lo que no requiere parseo de la salida.
- Capacidad demostrada sin visión: juega a Doom a partir de la descripción textual del estado del juego, resolviendo una `choice` sobre acciones y un `noul` sobre si la mira apunta a un enemigo.

## Casos de uso

- Enrutado de peticiones en pasarelas LLM: dado un mensaje de usuario, el modelo elige en ~9 ms entre un modelo legal, uno rápido y barato para trivia y uno frontera para razonamiento complejo, gracias a que las descripciones de cada opción son texto libre y añadir un modelo es solo un cambio de configuración.
- Guardarraíles previos y posteriores al LLM: clasifica jailbreak, inyección de prompt, PII, toxicidad, autolesión, estafa o phishing y contenido fuera de tema antes de invocar al modelo grande y tras su respuesta.
- Triaje de tickets de soporte: recibe el ticket como estado y responde preguntas `choice` sobre categoría y prioridad y `score` sobre complejidad, con probabilidades que permiten umbralizar cuándo escalar a un humano.
- Moderación de contenido en comunidades: evalúa reseñas y comentarios con preguntas `choice` de sentimiento o toxicidad, calibrado para reducir falsos positivos gracias a su ECE de 0,02-0,04.
- Automatización de decisiones en agentes: consume trazas de agente como estado y responde en una sola pasada qué herramienta usar o si continuar, con latencia de milisegundos que permite integrarlo en bucles de decisión multi-paso.
- Clasificación a gran escala en pipelines de datos: con hasta 3.075 decisiones por segundo en una RTX 4090 y 150 peticiones en 156 ms en batch, es adecuado para etiquetar grandes volúmenes de registros JSON o correos.
- Detección de spam: clasificación binaria de SMS o mensajes con 0,936 de exactitud según la model card, integrable en pasarelas de mensajería.
- Cumplimiento normativo multilingüe: enrutado de consultas legales (por ejemplo, sobre artículos de códigos) hacia el modelo especializado, con soporte de 18 idiomas para estados en distintos idiomas.

## Benchmarks y rendimiento

| Benchmark | System1 | Referencia |
|---|---|---|
| Azerbaiyano, exactitud en 12 categorías de tarea | 0,877 | 0,440 (checkpoint base) |
| Azerbaiyano, ECE | 0,022 | 0,268 (checkpoint base) |
| Clasificación de intención/dominio de 18 vías (14 idiomas) | 0,79-0,91 | no disponible |
| AG News | 0,931 | 0,910 (TypeSafe Jev) |
| SMS spam | 0,936 | 0,930 (TypeSafe Jev) |
| ECE | 0,02-0,04 | 0,246 (TypeSafe Jev) |

Datos de velocidad (RTX 4090): 9,4 ms por pregunta, 10,1 ms para una petición de 3 preguntas, 150 peticiones en 156 ms en batch y hasta 3.075 decisiones/s.

## Requisitos de hardware

- VRAM estimada: 0,65 GB en bf16, según la model card.
- GPU recomendadas: RTX 4090 para las cifras de latencia publicadas; por su tamaño, cualquier GPU con al menos ~1 GB de VRAM libre es suficiente.
- Cabe en GPU de consumo: sí, con 0,65 GB en bf16 cabe en cualquier GPU de consumo moderna (e incluso en iGPU o CPU, aunque las cifras de latencia están medidas en RTX 4090).
- Opciones de despliegue: librería propia `system1` (carga con `system1.load("doofz/System1", device="cuda")`) y servidor REST propio con `python -m system1.server --port 8095`; compatible con la librería `transformers` e `endpoints_compatible`. No se especifican en la información proporcionada soportes de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 9,4 ms por pregunta, 10,1 ms para 3 preguntas, 150 peticiones en 156 ms en batch, hasta 3.075 decisiones/s en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| System1 | 321,9 M | no disponible | AG News 0,931; SMS spam 0,936; ECE 0,02-0,04 | Apache 2.0 | Pesos abiertos, autoalojado |
| TypeSafe Jev | no disponible | no disponible | AG News 0,910; SMS spam 0,930; ECE 0,246; ~25× más lento | no disponible | no disponible |
| jhu-clsp/mmBERT-base (modelo base) | 307 M (solo encoder) | no disponible | Azerbaiyano 0,440; ECE 0,268 | no disponible | Pesos abiertos |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para generar respuestas, resúmenes ni código.
- Riesgo de alucinación: la model card afirma que no hay texto que alucinar, pero las probabilidades de decisión pueden estar mal calibradas en dominios alejados de los datos de post-entrenamiento.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada; el post-entrenamiento cubre 18 idiomas con prioridad para el azerbaiyano, por lo que el rendimiento en otros idiomas puede degradarse, aunque el estado admita cualquier idioma.
- Restricciones de licencia: Apache 2.0, permite uso comercial; conviene conservar los avisos de licencia y atribución.
- Caveats para producción: el modelo declara 0 descargas y 0 likes, por lo que carece de validación externa amplia; las cifras de latencia están medidas en una única RTX 4090 y pueden no extrapolarse a otro hardware.
- El repositorio tiene un tamaño de 0,7 GB, coherente con el peso en bf16, no con múltiples cuantizaciones publicadas.

## Enlaces

- HuggingFace: https://huggingface.co/doofz/System1
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Referencia comparada TypeSafe Jev: no disponible (sin enlace en la información proporcionada)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
