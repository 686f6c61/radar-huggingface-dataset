# mkzero/Cerebellum-2B-BF16

## Resumen

Cerebellum-2B es un modelo de 1.881.825.088 parámetros (aproximadamente 1,88 B) publicado por el usuario mkzero en Hugging Face, construido a partir de Qwen/Qwen3.5-2B como modelo base y distribuido bajo licencia Apache 2.0. No es un modelo generativo al uso: se presenta como un "motor de decisión System 1" no autorregresivo, diseñado para elegir acciones dentro de un conjunto cerrado de candidatos (herramientas, APIs, acciones DOM), en lugar de generar texto token a token.

Su propuesta técnica es sustituir el bucle de decodificación autorregresiva por una única pasada forward con complejidad O(1), sin KV cache, y con una red de punteros que indexa directamente la opción correcta del conjunto de candidatos. El autor declara una latencia de 25,2 ms en modo batched y una precisión del 94,92 % en enrutado de APIs y herramientas, además de invariancia al orden de los candidatos (0,60 % de fluctuación) mediante máscaras de atención aisladas por rama.

El modelo está pensado como "cerebelo" que acompaña a un LLM grande ("cerebro" o System 2): el LLM planifica y razona, mientras que Cerebellum-2B resuelve la selección de acción de alta frecuencia y bajo coste, con un mecanismo nativo de escalado a humano o a System 2 (ActEscalateHead). Es relevante para pipelines de agentes, RPA y atención al cliente donde la latencia y la validez estricta de formato son críticas. Su adopción pública es todavía nula: 0 descargas y 1 "me gusta" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No autorregresiva sobre backbone Qwen3.5-2B (Gated DeltaNet, decoder); red de punteros con atención bidireccional completa y sin máscara causal |
| Parámetros totales | 1.881.825.088 (≈1,88 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (este repositorio); el autor publica variantes FP8 (torch.float8_e4m3fn, 2,39 GB) e INT8 (cuantización simétrica por canal, 2,23 GB) en repositorios separados |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con requisito de código personalizado (custom_code) |
| Modelo base | Qwen/Qwen3.5-2B |
| Tarea declarada (pipeline) | text-classification |
| Tamaño del repositorio | 3,8 GB |
| Fecha de publicación | 19 de septiembre de 2026 (según metadatos de Hugging Face) |
| Descargas / "likes" | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura parte del backbone Qwen3.5-2B, cuya ficha comparativa del autor identifica como "Gated DeltaNet", y lo reconvierte en un motor de decisión no autorregresivo. En lugar de decodificar una secuencia de 50 a 100 tokens, el modelo realiza una única pasada forward y aplica una red de punteros sobre el conjunto de candidatos (nombres de herramientas, firmas de parámetros o acciones sobre el DOM), de modo que la salida es siempre un índice válido dentro del conjunto. Esto elimina el KV cache y garantiza, según el autor, un 0,00 % de errores de sintaxis o de nombres de herramienta inventados. La atención es completamente bidireccional, sin máscara causal, y utiliza máscaras de aislamiento por rama (Branch Mask) para lograr invariancia al orden de los candidatos.

El entrenamiento se declara sobre 95.000+ muestras reales repartidas en seis dominios industriales: enrutado de herramientas y parámetros de API (30.000), automatización de acciones web sobre DOM (20.000), flujo de tickets de posventa (20.000), pares de reglas de negocio y cumplimiento (15.000), escalado y control de riesgo (10.000) y transferencia zero-shot a seis suites no vistas. El modelo incorpora una cabeza específica, ActEscalateHead, con calibración probabilística (Brier score declarado de 0,0271) para derivar a un agente humano o a un LLM mayor cuando la situación es ambigua o no está cubierta. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; el autor remite a un documento ARCHITECTURE.md dentro del repositorio que no está incluido en los datos proporcionados.

## Capacidades

- Enrutado de herramientas y function calling: selecciona la herramienta correcta y la firma de parámetros dentro de un conjunto de candidatos, sin generar JSON libre.
- Automatización de acciones sobre DOM: decide la acción de interacción (clic, relleno, navegación) a partir de la estructura HTML.
- Clasificación de intenciones y triaje de tickets: categorización de solicitudes de posventa y asignación de cola o equipo.
- Razonamiento sobre reglas de negocio y pares de política, incluyendo escenarios contrafactuales.
- Detección de ambigüedad, jailbreak o escenario no cubierto, con derivación automática a humano o a System 2 mediante ActEscalateHead.
- Invariancia al orden de candidatos: 99,40 % de estabilidad ante permutaciones (0,60 % de fluctuación declarada).
- Garantía de formato: al ser una red de punteros sobre un conjunto cerrado, la salida siempre es un candidato legal (0,00 % de errores de formato declarados).
- Multilingüe limitado a chino e inglés.
- No dispone de generación de texto libre, visión, audio ni capacidades multimodales; no es un modelo de propósito general.

## Casos de uso

- Enrutado de herramientas en agentes LLM: colocado delante de un agente basado en un LLM grande, recibe el catálogo de herramientas disponibles y devuelve la herramienta y los parámetros correctos en una sola pasada, reduciendo el coste y la latencia del bucle de decisión.
- Automatización robótica de procesos (RPA) web: dado un árbol DOM y un objetivo, el modelo selecciona la siguiente acción de interacción; su latencia declarada de 25,2 ms permite ejecutar flujos de varios pasos sin cuellos de botella perceptibles.
- Triaje y enrutado de tickets de soporte: clasifica reclamaciones largas y decide el equipo o la cola de destino; en las pruebas del autor alcanza un 96,40 % en este dominio, lo que lo hace apto como primera capa de un sistema de atención al cliente.
- Control de cumplimiento normativo: verifica si una petición o una acción propuesta cumple un conjunto de reglas de negocio y decide entre aprobar, rechazar o escalar, apoyándose en los pares de política evaluados.
- Guardarraíl y control de riesgo en agentes en producción: ActEscalateHead detecta contextos ambiguos, intentos de evasión o escenarios fuera de distribución y deriva a un operador humano, evitando que el agente ejecute acciones no previstas.
- Capa System 1 de un sistema híbrido: resolver localmente las decisiones rutinarias y reservar el LLM grande únicamente para los casos escalados, con una reducción de coste proporcional al porcentaje de tráfico resuelto por el modelo pequeño.
- Clasificación de intenciones a gran escala en despliegues con GPU: la variante FP8 permite, según el autor, alojar entre 8 y 10 instancias en una GPU de 24 GB, lo que habilita servir tráfico concurrente elevado con un coste por petición bajo.
- Inferencia en el borde o en portátil: la variante INT8 (2,23 GB) está orientada a CPU y a equipos como un MacBook M4 de 16 GB, con una latencia declarada de aproximadamente 40 ms en modo offline.

## Benchmarks y rendimiento

Todos los resultados proceden de la model card del autor y no están verificados de forma independiente. La propia model card califica los conjuntos de referencia como datos reales de agentes (95.000+ muestras).

Comparativa global declarada:

| Métrica | Cerebellum-2B | Laya (ModernBERT) | KEV (Qwen-0.5B) | Jev (comercial, cerrado) | GPT-4o (enrutado) |
|---|---|---|---|---|---|
| Parámetros | 1,88 B | 421 M | 0,5 B | no disponible | no disponible (API) |
| Precisión en decisión de API de agente | 94,92 % | 83,80 % | 79,90 % | 81,10 % | 89,20 % |
| Latencia extremo a extremo | 25,2 ms (batched) / 120 ms | ~35 ms | ~40 ms | ~190 ms (ida y vuelta API) | 1.500-2.800 ms |
| Complejidad de decodificación | O(1), una pasada | O(1) por bloque | O(1) por bloque | O(1) por bloque | O(N) token a token |
| Invariancia al orden de candidatos | 99,40 % | 91,20 % | 88,50 % | 89,40 % | 84,50 % |
| Calibración (Brier score) | 0,0271 | 0,0600 (ECE) | 0,0810 | 0,1140 | 0,1620 |
| Escalado a humano nativo | Sí (ActEscalate) | No | No | No | No |

Desglose por dominio (precisión declarada):

| Suite de evaluación | Muestras | Cerebellum-2B | Jev | Laya | KEV | GPT-4o |
|---|---|---|---|---|---|---|
| Enrutado de herramientas y parámetros | 30.000 | 94,90 % | 81,10 % | 83,80 % | 79,90 % | 89,20 % |
| Automatización de acciones web (DOM) | 20.000 | 92,80 % | 78,40 % | 80,50 % | 75,60 % | 86,10 % |
| Flujo de tickets de posventa | 20.000 | 96,40 % | 86,20 % | 87,10 % | 82,30 % | 91,50 % |
| Reglas de negocio y pares de política | 15.000 | 91,50 % | 84,50 % | 77,20 % | 74,80 % | 87,80 % |
| Escalado y control de riesgo | 10.000 | 95,20 % | 79,00 % | 71,50 % | 69,40 % | 82,00 % |
| Transferencia zero-shot (6 suites) | 6 suites | 88,60 % | 85,70 % | 74,20 % | 63,10 % | 85,40 % |
| Media macro | 95.000+ | 93,23 % | 82,48 % | 80,72 % | 75,85 % | 88,67 % |

## Requisitos de hardware

- BF16 (este repositorio): pesos de 3,76 GB; se puede estimar un consumo de VRAM en torno a 4-6 GB durante inferencia, ya que el modelo no usa KV cache.
- FP8: 2,39 GB de pesos, orientado a GPU en producción con vLLM o FastAPI.
- INT8: 2,23 GB de pesos, orientado a CPU y equipos de borde; el autor cita un MacBook M4 de 16 GB con unos 40 ms de latencia.
- GPU de consumo: cabe holgadamente en RTX 3090, RTX 4070 Ti o superiores de 12 GB o más; el autor afirma que una GPU de 24 GB puede alojar entre 8 y 10 instancias concurrentes en FP8.
- GPU de centro de datos: no se especifican requisitos de A100 o H100, pero por tamaño no serían necesarias para una sola instancia.
- Opciones de despliegue: el autor menciona vLLM y FastAPI para la variante FP8 y despliegue en CPU para INT8. No se mencionan llama.cpp, Ollama ni TGI; dado que el repositorio requiere custom_code, la compatibilidad con esos runners no está confirmada.
- Latencia declarada: 25,2 ms en modo batched, 120 ms como referencia de una sola petición, ~40 ms en INT8 sobre CPU. No se publican cifras de throughput en tokens por segundo, algo esperable al no ser un modelo generativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de enrutado declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cerebellum-2B | 1,88 B | no disponible | 94,92 % | Apache 2.0 | Pesos abiertos en Hugging Face (BF16, FP8, INT8) |
| Laya | 421 M | no disponible | 83,80 % | Apache 2.0 | Pesos abiertos |
| KEV | 0,5 B | no disponible | 79,90 % | Apache 2.0 | Pesos abiertos |
| Jev (TypeSafe) | no disponible | no disponible | 81,10 % | Comercial, cerrado | Solo API |
| GPT-4o como enrutador | no disponible | no disponible | 89,20 % (salida estructurada) | Comercial, cerrado | Solo API en la nube |

Frente a Laya y KEV, Cerebellum-2B es entre tres y cuatro veces más grande, pero declara una precisión superior y una latencia comparable gracias a la pasada única. Frente a Jev y a GPT-4o ofrece despliegue privado y coste fijo, a cambio de depender de un catálogo cerrado de candidatos.

## Limitaciones y advertencias

- Todos los resultados de benchmarks son declaraciones del autor; no hay evaluación independiente ni reproducibilidad verificada, y el repositorio tenía 0 descargas en el momento de la consulta.
- La información proporcionada no incluye la longitud de contexto, un dato crítico para decidir su uso con entradas largas (tickets extensos, DOM grandes).
- Solo soporta chino e inglés; no hay soporte documentado de castellano ni de otros idiomas, lo que limita su uso directo en mercados hispanohablantes.
- No es un modelo generativo: no puede redactar respuestas ni mantener conversaciones; únicamente elige entre candidatos predefinidos, por lo que requiere integración en un sistema mayor.
- La salida está restringida al conjunto de candidatos: si la acción correcta no está en la lista, el modelo no puede inventarla, pero puede elegir una errónea o escalar, lo que introduce errores semánticos aunque no de formato.
- Requiere cargar código personalizado (custom_code) con trust_remote_code, lo que implica revisar el código antes de ejecutarlo en producción.
- El modelo base referenciado, Qwen/Qwen3.5-2B, no aparece verificado en la información disponible, por lo que conviene confirmar su existencia y linaje antes de confiar en la trazabilidad de los pesos.
- Riesgo de sesgo de dominio: el entrenamiento se centra en datos industriales de agentes en chino e inglés (posventa, RPA, APIs), por lo que el rendimiento fuera de esos dominios puede degradarse; el propio autor declara un 88,60 % en transferencia zero-shot, el punto más bajo de su tabla.
- La licencia Apache 2.0 permite uso comercial y modificación, pero no ofrece garantías; el autor no documenta restricciones adicionales.
- La model card está truncada en la información disponible (se corta en la sección de fiabilidad y seguridad), por lo que faltan detalles sobre calibración, sesgos y procedencia de los datos.
- No se documentan políticas de moderación, sesgos demográficos ni comportamiento ante entradas maliciosas más allá de la cabeza de escalado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkzero/Cerebellum-2B-BF16
- Búsqueda de variantes del modelo en Hugging Face: https://huggingface.co/models?search=Cerebellum-2B
- Documentación en inglés (referenciada en la model card): ./README_EN.md
- Libro blanco de arquitectura (referenciado en la model card): ./ARCHITECTURE.md
- Repositorio del modelo base Qwen: https://github.com/QwenLM/Qwen
- Texto de la licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los únicos enlaces útiles son los anteriores, procedentes de la propia model card.
