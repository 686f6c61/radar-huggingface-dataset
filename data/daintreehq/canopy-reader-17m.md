# daintreehq/canopy-reader-17m

## Resumen

Canopy reader 17M es un encoder compacto de 17 millones de parametros desarrollado por daintreehq, derivado del modelo base jhu-clsp/ettin-encoder-17m mediante fine-tuning. Su funcion es leer la pantalla visible de un agente de codificacion con IA (Claude Code, Codex, Gemini CLI, Copilot, Cursor, Aider y una docena mas) y devolver, en un unico forward pass, el estado en que se encuentra el agente, si necesita intervencion del usuario y las dos lineas de la pantalla mas relevantes en ese momento. El modelo resuelve el problema de monitorizar multiples agentes autonomos en la terminal y detectar cual requiere atencion sin que el desarrollador tenga que revisar cada sesion manualmente.

La relevancia tecnica del modelo esta en su enfoque extractivo: en lugar de generar texto nuevo, selecciona y copia lineas literales de la pantalla, lo que reduce drasticamente el riesgo de alucinacion. Segun la model card, el jurado ciego lo considero fiel a la pantalla en 152 de 153 pantallas reales. Ademas, esta disenado para ejecutarse en local sobre CPU (unos 21 ms por forward pass en un hilo de CPU de Apple M4 Max, aproximadamente 0,2 s en un Intel Core 5 210H), de modo que ningun texto de la pantalla sale de la maquina del usuario.

El modelo forma parte de Canopy, la funcionalidad de Daintree (daintree.org) que vigila todos los agentes en ejecucion y muestra los que requieren atencion. Se distribuye en formato ONNX con cuantizacion int8, con implementaciones de referencia en Python y en Node/TypeScript, y licencia MIT. Su tamano de repositorio es de 0,3 GB y el modelo pesa unos 17 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de jhu-clsp/ettin-encoder-17m), con cabezas de clasificacion multiples |
| Parametros totales | 17 M (17 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrada: estado compacto hasta 192 tokens + lineas de pantalla rellenadas desde abajo) |
| Tipos de cuantizacion | int8 (model.int8.onnx) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime); configuracion en config.json y reader.json |

## Arquitectura y entrenamiento

El modelo es un encoder tipo transformer de 17 millones de parametros, fine-tuneado a partir de jhu-clsp/ettin-encoder-17m (licencia MIT). Sobre el encoder se anaden multiples cabezas de clasificacion que producen, en un solo forward pass, las siguientes salidas: `category` (7 clases: approval, question, finished, error, working, running, idle), `needs_attention`, `blocked_on_user`, `notable`, las clases `tests` (passing, failing, not_run, unknown), `changes`, `risk`, `instruction`, `progress`, `failure_repeats` y `score`; las selecciones `status_line`, `question_line`, `action_line` y `task_line` (cada una sobre las lineas de la pantalla mas la opcion "none"); y por linea las puntuaciones `summary_lines` (0-3), `option_lines` y `key_lines`.

La entrada se codifica como `[CLS] <estado en JSON compacto, recortado a 192 tokens> [SEP]` seguido de `[i] <linea>` para cada linea no vacia, rellenando desde la parte inferior de la pantalla hasta 1024 tokens y terminando con `[SEP]`. El modelo se entreno a partir de la release anterior (que habia aprendido de aproximadamente 1.000 pantallas reales de terminal, depuradas) manteniendo las cabezas de clasificacion alineadas con sus respuestas previas mediante destilacion. La compuerta de "necesita al usuario" se calcula como `g = max(sigmoid(needs_attention), P(approval)+P(question)+P(finished)+P(error))`, mapeada de forma que 0,4 se lee como 0,5; a partir de 0,5 el agente requiere al usuario. Se midio una alternativa generativa (un T5 de 31M que reescribia las lineas seleccionadas) que igualo en utilidad pero fue fiel solo en 143 de 153 pantallas, por lo que no se envio; los T5 que resumian la pantalla cruda (16M a 77M) fueron fieles en torno al 10%.

## Capacidades

- Clasificacion del estado del agente en 7 categorias: approval, question, finished, error, working, running e idle.
- Deteccion de si el agente necesita al usuario (`needs_attention`, `blocked_on_user`) mediante una compuerta calibrada.
- Seleccion extractiva de las dos lineas de pantalla mas relevantes (`status_line` y segunda linea opcional con puntuacion minima de 0,7), copiadas literalmente de la pantalla.
- Extraccion de la pregunta, sus opciones de menu y el comando sobre el que se pregunta cuando el agente esta en estado de aprobacion o pregunta.
- Extraccion de hechos de la tarjeta: tests (passing, failing, not_run, unknown), cambios (uncommitted, etc.), progreso (0-100), repeticiones de fallo y una puntuacion de atencion.
- Puntuacion por linea de 0 a 3 (`summary_lines`) para determinar que lineas merecen mostrarse.
- Soporte de multiples agentes de codificacion: Claude Code, Codex, Gemini CLI, Copilot, Cursor, Aider y una docena mas.
- Ejecucion local en CPU sin salida de datos de la pantalla al exterior.
- Implementaciones de referencia en Python (`canopy_reader.py`) y Node/TypeScript (`node/reader.ts`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de clasificacion y seleccion, no generativo.

## Casos de uso

- Monitorizacion de multiples agentes en terminal: Daintree usa el modelo para vigilar cada agente en ejecucion y mostrar en una tarjeta los que requieren atencion, con el estado y las lineas clave, sin que el desarrollador revise cada sesion.
- Deteccion de bloqueos por aprobacion: cuando un agente se detiene esperando confirmacion (por ejemplo, para ejecutar un comando), el modelo extrae la pregunta, las opciones y el comando, permitiendo al usuario resolver el bloqueo desde la interfaz de Daintree.
- Deteccion de errores y fallos repetidos: la clasificacion `error`, `failure_repeats` y el estado `tests` permiten alertar cuando un agente entra en bucle de fallos o deja tests en rojo.
- Resumen extractivo de sesiones largas: con 1024 tokens de contexto y seleccion de las dos lineas mas relevantes, el modelo condensa pantallas densas en una vista de un vistazo fiel al contenido original.
- Integracion en herramientas de desarrollo locales: la implementacion Node/TypeScript permite incorporar la lectura de pantallas en extensiones de editor o aplicaciones de escritorio basadas en onnxruntime-node.
- Seguimiento de progreso de tareas: los campos `progress`, `changes` y `task` permiten mostrar el avance de un agente (por ejemplo, cambios sin commitear y porcentaje completado) en un panel de control.
- Automatizacion de notificaciones: la compuerta `needs_attention` puede disparar notificaciones solo cuando el agente requiere al usuario, reduciendo el ruido en flujos con varios agentes en paralelo.

## Benchmarks y rendimiento

Evaluacion sobre pantallas reales nunca vistas en entrenamiento: 60 pantallas de oro revisadas manualmente de sesiones reales y 93 pantallas investigadas de 17 CLIs de agentes.

| Metrica | Resultado |
|---|---|
| Categoria, pantallas de oro | 58/60 |
| Categoria, pantallas de agentes investigadas | 87/93 |
| Compuerta "necesita al usuario", pantallas de oro / de agentes | 57/60, 89/93 |
| Tarjeta frente a la version anterior (headline + summary), jurado ciego sobre 153 pantallas | mejor 49, peor 16, igual 88 |
| Tarjeta fiel a la pantalla (jurado ciego) | 152/153 |
| Latencia en Apple M4 Max (1 hilo de CPU) | ~21 ms por forward pass |
| Latencia en Intel Core 5 210H | ~0,2 s |

El jurado (`gpt-6.1-sol`) comparo las tarjetas en orden aleatorio y evaluo cual informa mejor al desarrollador y si cada tarjeta afirma algo que la pantalla no muestra. La alternativa generativa T5 de 31M igualo en utilidad (51 mejor, 50 peor, 52 igual) pero fue fiel solo en 143/153 pantallas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo pesa unos 17 MB en int8 y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; esta disenado para ejecucion en CPU (un hilo).
- Cabe en cualquier equipo consumer: se ejecuta en CPU de portatiles (medido en Apple M4 Max e Intel Core 5 210H).
- Opciones de despliegue: onnxruntime (Python) y onnxruntime-node con @huggingface/transformers para el tokenizador (Node/TypeScript).
- Latencia estimada: ~21 ms por forward pass en un hilo de CPU de Apple M4 Max; ~0,2 s en Intel Core 5 210H.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canopy reader 17M | 17 M | 1024 tokens | Clasificacion + seleccion extractiva de lineas de terminal | MIT | HuggingFace (ONNX) |
| T5 generativo (31M) | 31 M | no disponible | Reescritura generativa de lineas | no disponible | No enviado (medido internamente) |
| T5 sobre pantalla cruda (16M-77M) | 16-77 M | no disponible | Resumen generativo de la pantalla | no disponible | No enviado (fidelidad ~10%) |

No se dispone de comparativas publicas con otros modelos de clasificacion de pantallas de terminal en la informacion proporcionada. La model card solo documenta las alternativas generativas evaluadas internamente y descartadas.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); pantallas en otros idiomas no estan cubiertas.
- Es un modelo extractivo, no generativo: no redacta texto nuevo ni responde preguntas; solo selecciona y clasifica lineas existentes.
- La fidelidad medida es 152/153 en el conjunto de evaluacion, pero puede fallar en pantallas atipicas o formatos de CLI no vistos durante el entrenamiento.
- La ventana de contexto es de 1024 tokens, con el estado recortado a 192 tokens; pantallas muy largas se rellenan desde abajo y pueden perder informacion de la parte superior.
- Riesgo de clasificacion erronea del estado del agente (2 de 60 fallos en pantallas de oro, 6 de 93 en pantallas de agentes investigadas), lo que puede provocar falsos positivos o negativos en la compuerta de atencion.
- Depende de un preprocesado especifico de la pantalla (deshacer saltos de linea, eliminar elementos de interfaz) descrito como `prepareScreen` de Daintree; usarlo con entradas sin ese preprocesado puede degradar el rendimiento.
- Licencia MIT: permite uso comercial, pero se recomienda revisar los terminos del modelo base jhu-clsp/ettin-encoder-17m (tambien MIT).
- No se han publicado datos sobre sesgos demograficos o linguisticos del modelo base ni del fine-tuning.
- El modelo esta pensado para ejecucion local; no se documentan garantias de privacidad mas alla de que el texto no sale de la maquina.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daintreehq/canopy-reader-17m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Daintree (proyecto que integra el modelo): https://daintree.org
