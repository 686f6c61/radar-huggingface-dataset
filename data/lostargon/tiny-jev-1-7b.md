# lostargon/Tiny-Jev-1.7B

## Resumen

Tiny-Jev-1.7B es un modelo de decisión de 1.720.032.257 parámetros publicado por el usuario lostargon en Hugging Face bajo licencia Apache 2.0. No es un modelo generativo: recibe un estado (un mensaje, un ticket, un registro JSON, una transcripción, un log o un diff), una pregunta redactada como se escribiría en código y un conjunto fijo de opciones, y devuelve en un único forward pass una distribución de probabilidad sobre esas opciones, junto con una confianza sobre la que se puede aplicar un umbral.

El modelo se presenta como un "System One" de decisión, inspirado en la idea y la API Jev de TypeSafe AI, con la que no mantiene ninguna afiliación: reproduce el estilo de interfaz (Choice, Score y Noul) pero es un desarrollo independiente y de pesos abiertos. Se construye mediante fine-tuning con LoRA (fusionado en los pesos) sobre Qwen/Qwen3-1.7B, al que se añade una cabeza lineal de decisión que puntúa cada opción a partir del estado oculto de un token marcador.

Su relevancia práctica está en el coste y la latencia: al no generar texto, la salida no puede estar mal formada y se resuelve en decenas de milisegundos, lo que permite usarlo como el "if inteligente" de un pipeline para enrutado, triaje, filtrado previo a una ventana de contexto cara o guardarraíl de la salida de otro modelo. Existe un hermano menor de 0,6 B, Tiny-Jev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen/Qwen3-1.7B) más cabeza lineal de decisión sobre tokens marcador; inferencia no autorregresiva |
| Parametros totales | 1.720.032.257 (~1,7 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors y no se documentan cuantizaciones oficiales |
| Idiomas soportados | Inglés (en); se entrena con estados en otros idiomas pero preguntas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero único) más código propio (`modeling_tiny_jev.py`, requiere `trust_remote_code=True`) |
| Modelo base | Qwen/Qwen3-1.7B (fine-tuning con LoRA, fusionado) |
| Tarea declarada (pipeline) | text-classification |
| Tamano del repositorio | 3,5 GB |
| Fecha de publicacion | 23 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte del stack decoder de Qwen3-1.7B. Cada opción candidata se renderiza como una línea propia después del estado y de la pregunta, seguida de un token marcador. El estado oculto correspondiente a cada marcador pasa por una cabeza lineal que produce un escalar, y un softmax sobre esos escalares da la respuesta. Noul es un Choice de dos opciones (`no` / `yes`) y Score es un Choice sobre niveles ordenados cuyo valor esperado se reporta. Al no haber generación autoregresiva, el espacio de respuestas queda restringido a la lista de opciones proporcionada, de modo que la salida no puede ser sintácticamente inválida. El entrenamiento usa entropía cruzada suave contra objetivos que son vectores de probabilidad, seguida de una calibración de temperatura sobre un split reservado.

El ajuste se hizo con LoRA sobre Qwen3-1.7B, con los adaptadores fusionados en los pesos finales, usando unos 160.000 ejemplos sintéticos de decisiones tipadas cuyas etiquetas proceden de reglas explícitas o se calculan por código. Los conjuntos cubren atención al cliente y operaciones (enrutado de tickets, intenciones de reembolso, cancelación y escalado, severidad y churn, triaje de correo, prioridad de helpdesk, facturación, incidentes de seguridad, políticas de flujo de trabajo); guardarraíles de modelos y agentes (grounding, cumplimiento de políticas, tipo de fallo de una respuesta, seguridad, reversibilidad y exposición de secretos de una acción propuesta); texto de negocio (moderación, reseñas, listados de producto, cláusulas contractuales, cribado de currículos, fraude, intención de búsqueda, veredictos de code review); voz y diálogo (turn-taking, destinatario, detección de buzón de voz, tipo de respuesta desde transcripciones ASR ruidosas); lectura estructurada generada por procedimientos con etiquetas exactas (logs, calendarios con husos horarios, inventario, control de acceso con roles y comodines, máquinas de estados con guardas, grafos de dependencias, rankings con reglas de desempate, validación de formatos como checksums y fechas, precios con descuentos, impuestos y divisas, posiciones de juegos de tablero); y conjuntos de robustez con negación y alcance contrastivos, intentos de inyección de prompt embebidos en el estado y estados en idiomas distintos del inglés con preguntas en inglés. Los datos escritos a mano se auditaron mediante reetiquetado ciego y cada generador procedural se revisó en busca de errores de etiqueta y fugas de posición antes del entrenamiento.

## Capacidades

- Tres primitivas de decisión: Choice (mejor opción más distribución completa), Score (posición en una escala ordenada mediante valor esperado) y Noul (probabilidad de que una afirmación sobre el estado sea cierta).
- Salida probabilística calibrada con un campo de confianza utilizable como umbral de derivación o escalado a otro sistema.
- Enrutado y clasificación: asignación de tickets, intención, severidad, churn, prioridad de helpdesk, intención de búsqueda, veredictos de revisión de código.
- Guardarraíles sobre salidas de otros modelos o agentes: grounding, cumplimiento de políticas, tipo de fallo, evaluación de seguridad, reversibilidad y exposición de secretos en acciones propuestas (shell, ficheros, API).
- Moderación y filtrado de texto de negocio: reseñas, listados de producto, cláusulas contractuales, transacciones, cribado de currículos frente a una oferta.
- Lectura de estado estructurado: logs, calendarios multi-huso, inventario, reglas de control de acceso con roles y comodines, máquinas de estados con guardas, grafos de dependencias, rankings con desempates, validación de formatos (checksums, fechas), precios, impuestos y divisas, posiciones de tablero.
- Voz y diálogo sobre transcripciones ASR ruidosas: turn-taking, destinatario, detección de buzón de voz, tipo de respuesta y siguiente acción.
- Fan-out por lote: `model.decide()` permite lanzar varias preguntas de distinto tipo sobre un mismo estado en una sola llamada batcheada.
- No genera texto libre, no hace resumen, no mantiene conversación y no se documenta soporte de tool calling ni de razonamiento multi-paso autónomo.

## Casos de uso

- Enrutado de tickets de soporte: se pasa el mensaje del cliente y las opciones de equipo (billing, technical, sales); el modelo devuelve la opción ganadora con su distribución en un único forward pass, lo que permite enrutar en milisegundos y derivar a revisión humana cuando la confianza baja de un umbral.
- Triaje de correo y bandeja de entrada: con mensajes que contienen varias peticiones a la vez, se puede lanzar un fan-out con `decide()` para obtener en una sola llamada el tipo de petición, la urgencia y si hay riesgo de churn.
- Guardarraíl de un LLM generativo: antes de mostrar o ejecutar la salida de otro modelo, se evalúa con Noul si la respuesta está fundamentada en el contexto y si cumple la política, y se bloquea o se reescribe en caso contrario.
- Moderación y cumplimiento a volumen: clasificación de reseñas, listados y cláusulas contractuales contra un playbook, con salida probabilística que permite fijar umbrales distintos según el coste de cada error.
- Análisis de logs y reglas de acceso: lectura de logs, ficheros de control de acceso con roles y comodines, y máquinas de estados con guardas para decidir si una secuencia es válida o si constituye una anomalía.
- Validación previa a un contexto caro: filtrado de elementos irrelevantes antes de enviarlos a un modelo grande, reduciendo el número de tokens de entrada facturados.
- Seguridad de agentes: evaluación de una acción propuesta (comando de shell, escritura de fichero, llamada a API) para etiquetarla como segura, reversible y sin exposición de secretos antes de autorizarla.
- Análisis de llamadas y buzones de voz: a partir de transcripciones ASR ruidosas, decidir turn-taking, destinatario o siguiente acción en un sistema de atención telefónica.
- Cribado de currículos frente a una oferta: decisión tipada sobre si el candidato cumple un requisito concreto, con probabilidad asociada y trazabilidad de la opción evaluada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con precisión sobre elementos reservados y ECE (expected calibration error), pero la tabla de cifras no está incluida en el extracto disponible, por lo que no se reproducen números.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 3,44 GB (1,72 B × 2 bytes); el repositorio ocupa 3,5 GB. Estimación de huella total en GPU en torno a 4-5 GB con activaciones y overhead.
- Estimaciones teóricas de cuantización según el número de parámetros: ~1,7 GB en 8 bits y ~0,9 GB en 4 bits. No son formatos publicados por el autor y requieren verificar compatibilidad con la cabeza de decisión y el código propio.
- Cabe en GPU de consumo: una RTX 3060 de 12 GB, una RTX 4070/4090 o equivalentes son suficientes en FP16; también en Apple Silicon vía MPS.
- Latencia reportada por el autor: ~10-40 ms por pregunta en una GPU de consumo y ~60-150 ms en un portátil Apple de la serie M.
- Despliegue: la vía documentada es `transformers` con `trust_remote_code=True` (solo requiere `torch` y `transformers`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, algo esperable al tratarse de una arquitectura con código propio y decodificación no autorregresiva.
- Rendimiento agregado: la API `decide()` permite agrupar varias preguntas sobre un mismo estado en una llamada batcheada, lo que reduce el coste por decisión cuando se ejecutan varios clasificadores sobre la misma entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Tiny-Jev-1.7B | 1,72 B | Decoder + cabeza de decisión, no autorregresivo | No disponible | Apache 2.0 | Pesos abiertos en Hugging Face | Mayor precisión y mejor lectura de estado estructurado; ~10-40 ms por pregunta en GPU de consumo |
| Tiny-Jev (0,6 B) | ~0,6 B | Decoder + cabeza de decisión, no autorregresivo | No disponible | Apache 2.0 (segun repositorio hermano) | Pesos abiertos en Hugging Face | Aproximadamente el doble de rápido y cabe en cualquier equipo; menos preciso y peor con estado estructurado |
| Qwen/Qwen3-1.7B | 1,72 B | Transformer decoder generativo | No disponible en la informacion proporcionada | Apache 2.0 | Pesos abiertos en Hugging Face | Modelo base del que deriva; genera texto libre y no ofrece salida probabilística tipada |
| Jev (TypeSafe AI) | No disponible | System One propietario | No disponible | Propietaria (API de pago) | Solo API alojada | Interfaz de referencia (Choice/Score/Noul); 70-500 ms por decisión, 0,042 USD por millón de tokens de entrada y salida gratuita; sin relación con Tiny-Jev |

## Limitaciones y advertencias

- No genera texto: no sirve para chat, resumen, redacción ni razonamiento multi-paso abierto. Solo responde con una distribución sobre las opciones que se le pasan.
- El espacio de respuestas está limitado a las opciones proporcionadas; si la lista es incorrecta o incompleta, la decisión será mala aunque la salida sea formalmente válida y bien calibrada.
- Entrenado con datos sintéticos cuyas etiquetas provienen de reglas y generadores procedurales: puede heredar los sesgos y los puntos ciegos de esas reglas y generalizar peor fuera de su distribución.
- La calibración se obtiene con temperatura sobre un split reservado; el ECE real por dominio no está publicado en la información disponible, por lo que conviene validar los umbrales de confianza con datos propios antes de usarlos en producción.
- Idiomas: la model card declara únicamente inglés. Hay conjuntos de robustez con estados en otros idiomas, pero las preguntas se formulan en inglés, así que no se debe esperar un rendimiento fiable con preguntas en castellano.
- Longitud de contexto: no disponible. No hay dato publicado sobre cuántos tokens admite el estado de entrada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio (`modeling_tiny_jev.py`); conviene auditar ese fichero antes de desplegarlo en un entorno de producción.
- La falta de soporte documentado en runtimes estándar (vLLM, TGI, llama.cpp, Ollama) complica el escalado y el uso de técnicas habituales de cuantización y servido.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el proyecto declara explícitamente no estar afiliado, respaldado ni soportado por TypeSafe AI; el nombre "Jev" solo hace referencia al estilo de interfaz reproducido.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validación independiente de la comunidad ni resultados de terceros publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lostargon/Tiny-Jev-1.7B
- Modelo hermano de 0,6 B: https://huggingface.co/lostargon/Tiny-Jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Jev AI (TypeSafe AI): https://jevai.net/
- Documentación de modelos de TypeSafe AI: https://docs.typesafe.ai/models
- Comunidad Jev AI: https://www.jevai.org/
- Jev AI Model (TypeSafe) — Typed System One Decisions: https://jevmodel.org/
