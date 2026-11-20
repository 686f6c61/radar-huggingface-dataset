# quantumaikr/aimax-router-qwen3-0.6b

## Resumen

aimax-router-qwen3-0.6b es un modelo de clasificación de intenciones y enrutamiento de peticiones en coreano, desarrollado por quantumaikr como fine-tuning de Qwen/Qwen3-0.6B. Su función no es generar texto libre, sino recibir una petición de trabajo en una línea (más el tipo de adjunto) y emitir un JSON pequeño con la función seleccionada de una lista proporcionada en el propio prompt, junto con metadatos operativos: motor necesario, urgencia, tareas de seguimiento y si la petición es agrupable. Está pensado como material de decisión para un sistema de orquestación de recursos, no como decisor final.

El modelo se distribuye en formato GGUF con dos variantes (Q4_K_M para producción y bf16 de alta precisión) y mantiene exactamente el mismo formato de prompt y salida que su predecesor de 0,1B, quantumaikr/max-0.1b-aimax-router, lo que permite usarlos en cascada. La diferencia clave es la capacidad de seleccionar funciones nuevas añadidas a la lista: en un conjunto sellado independiente pasa del 32 % al 66 % de acierto, y la precisión global de acción sube del 71,2 % al 83,6 %, a costa de mayor latencia (aproximadamente 0,07-0,12 s por petición en GPU frente a 0,14-0,17 s del 0,1B).

Es relevante ahora porque ejemplifica un patrón de despliegue muy concreto: modelos pequeños especializados como routers deterministas con salida JSON restringida por gramática, que sustituyen a llamadas a modelos grandes en la capa de clasificación de sistemas agénticos. Su licencia Apache-2.0 y su tamaño reducido lo hacen desplegable en CPU, aunque con latencias de medio segundo por petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3-0.6B) |
| Parametros totales | 751.632.384 (según safetensors); el autor lo etiqueta como 0.6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (distribución y evaluación), bf16 (alta precisión) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (aimax-router-qwen3-0.6b-Q4_K_M.gguf, aimax-router-qwen3-0.6b-bf16.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only, y se ha ajustado para una tarea de clasificación estructurada: el turno de sistema del prompt contiene una lista de funciones con el formato `id|description|needs`, con las líneas fijas `ask` y `none` al final, y el modelo debe emitir un objeto JSON con las claves `action`, `needs`, `urgency`, `follow_up` y `batchable`. La generación se restringe mediante gramática GBNF (se incluye `grammar_example.gbnf` y `schema_example.json`), lo que garantiza salida JSON válida en el 100 % de los conjuntos evaluados.

Según la model card, todos los datos de entrenamiento y evaluación son sintéticos y no se utilizaron peticiones reales de miembros. El repositorio incluye `TRAINING.md` con la configuración y los datos de entrenamiento, aunque los detalles concretos (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la información disponible. La innovación principal no es arquitectónica sino de diseño de tarea: un router de 0,6B con prompt y esquema de salida idénticos a los de un modelo de 0,1B, lo que permite composición en cascada y comparación directa de precisión frente a latencia.

## Capacidades

- Clasificación de intención sobre una lista de funciones proporcionada dinámicamente en el prompt, incluyendo funciones nuevas que el modelo no vio durante el entrenamiento.
- Salida JSON estructurada y restringida por gramática con cinco campos: `action`, `needs`, `urgency`, `follow_up`, `batchable`.
- Detección de peticiones fuera de lista (`none`) y de peticiones inapropiadas.
- Manejo de peticiones muy cortas o que consisten solo en un adjunto.
- Robustez ante entradas de tipo "ataque" o adversariales (90 % de acierto en el conjunto sellado B).
- Inferencia de metadatos operativos: motor necesario (`needs`), urgencia y posibilidad de agrupar peticiones en lote.
- Soporte de despliegue en cascada con el router de 0,1B mediante las funciones `v3_merge` y `v4_gate` de `router_post.py`.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modos de razonamiento extendido; su alcance es exclusivamente el enrutamiento.

## Casos de uso

- Enrutamiento de peticiones en un asistente corporativo coreano: el modelo recibe cada solicitud de usuario y la asigna a una de las funciones registradas del sistema, devolviendo además el motor requerido para que el orquestador despache la tarea al servicio adecuado.
- Clasificación con catálogo de funciones cambiante: cuando se añaden nuevas funcionalidades al producto, basta con incluirlas en la lista del prompt; el modelo las selecciona correctamente en el 75 % de los casos en funciones nunca vistas incluidas en la lista, frente al 3 % del router de 0,1B.
- Filtro de peticiones fuera de alcance o inapropiadas: la selección de `none` y el 75 % de acierto en peticiones inapropiadas permiten descartar entradas antes de invocar modelos generativos grandes, reduciendo coste.
- Triaje de urgencia y agrupación por lotes: los campos `urgency` y `batchable` permiten a un planificador priorizar colas y agrupar peticiones compatibles, por ejemplo para procesamiento nocturno.
- Despliegue en cascada en infraestructura solo-CPU: ejecutar primero el router de 0,1B y derivar a este modelo solo los casos inciertos o con funciones nuevas, manteniendo la latencia media baja (el 0,1B tarda aproximadamente 0,14-0,17 s en 6 hilos de CPU frente a 0,45-0,57 s de este modelo).
- Enrutamiento en GPUs de gama baja o compartidas: con 0,07-0,12 s por petición en GPU y un tamaño de repositorio de 2,0 GB, puede convivir con otros servicios en la misma tarjeta sin dominar el presupuesto de memoria.
- Extracción de metadatos operativos en pipelines de tickets: a partir de una línea de solicitud y el tipo de adjunto, generar un JSON normalizado que alimente sistemas de gestión de incidencias o de asignación de trabajo.

## Benchmarks y rendimiento

Datos publicados en la model card (precisión de `action` en %, GPU, Q4_K_M, con restricción GBNF y mismo postprocesado). Se comparan el router de 0,1B, este modelo y la configuración en cascada de dos etapas.

| Conjunto | 0.1B solo | aimax-router-qwen3-0.6b | Cascada 2 etapas |
|---|---|---|---|
| Conjunto sellado B completo (299, otro autor) | 71,2 | 83,6 | 80,3 |
| — peticiones normales | 74,2 | 86,7 | 87,5 |
| — funciones nuevas | 32 | 66 | 50 |
| — fuera de lista | 89,8 | 87,8 | 87,8 |
| — inapropiadas | 50 | 75 | 55 |
| — solo texto corto o adjunto | 95 | 92,5 | 95 |
| — adversariales | 80 | 90 | 90 |
| Conjunto sellado A, lista estándar (210) | 84,3 | 93,3 | 91,4 |
| Conjunto sellado A, con funciones nuevas en la lista (60) | 15,0 | 66,7 | 50,0 |
| Conjunto sellado 298, lista estándar / mixta | 93,6 / 88,9 | 93,3 / 94,0 | 95,0 / 96,0 |
| Funciones nunca vistas (6 tipos): en lista / fuera (none) | 3 / 48 | 75 / 50 | 65 / 43 |
| gold 48, lista estándar / mixta | 97,9 / 91,7 | 100 / 97,9 | 100 / 97,9 |

La validez del JSON fue del 100 % en todos los conjuntos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no serían representativos de la tarea para la que está ajustado el modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada; con 751,6 M de parámetros, la variante Q4_K_M ocupa del orden de 0,5 GB y la bf16 alrededor de 1,5 GB, más el contexto y el servidor de inferencia.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta 0,07-0,12 s por petición en GPU, con p95 de aproximadamente 75-135 ms según la longitud de la lista de funciones.
- Cabe en GPU de consumo: sí, por tamaño; no se detallan modelos concretos en la información disponible.
- CPU: funciona con 6 hilos a aproximadamente 0,45-0,57 s por petición.
- Opciones de despliegue: llama.cpp / llama-server (el ejemplo de cascada usa dos instancias de llama-server, una para el 0,1B y otra para este modelo) y cualquier runtime compatible con GGUF. El repositorio incluye `router_post.py` con el formato de lista, el esquema JSON, la gramática GBNF y las funciones de fusión y gate.
- Throughput y latencia: GPU 0,07-0,12 s por petición (p95 75-135 ms); CPU de 6 hilos 0,45-0,57 s por petición. La latencia crece con la longitud de la lista de funciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Precisión (sellado B) | Licencia | Formato |
|---|---|---|---|---|---|---|
| aimax-router-qwen3-0.6b | 751,6 M | no disponible | Router coreano con lista de funciones | 83,6 % | Apache-2.0 | GGUF |
| quantumaikr/max-0.1b-aimax-router | ~0,1B (según el autor) | no disponible | Router coreano, mismo prompt y esquema | 71,2 % | no disponible | GGUF |
| Qwen/Qwen3-0.6B (base) | 751,6 M | no disponible | Generación de texto general | no evaluado para enrutamiento | Apache-2.0 | safetensors y otros |

La comparación directa más relevante es con el router de 0,1B del mismo autor: este modelo gana en precisión global (+12,4 puntos), en funciones nuevas (+34 puntos) y en peticiones inapropiadas (+25 puntos), pero es aproximadamente 3-4 veces más lento en CPU. La cascada de dos etapas queda en un punto intermedio (80,3 % en el conjunto sellado B). No se dispone de comparación con otros routers especializados de la comunidad en la información proporcionada.

## Limitaciones y advertencias

- La selección de `none` para peticiones que solicitan una función nueva no presente en la lista es baja (aproximadamente 50 %), similar al router de 0,1B; los propios anotadores humanos discrepan en estos casos, por lo que conviene fijar una política y validarla en modo sombra antes de producción.
- Todos los datos de entrenamiento y evaluación son sintéticos; no se han usado peticiones reales de usuarios, por lo que el comportamiento en dominios reales puede diferir.
- El modelo está entrenado y evaluado únicamente en coreano; no hay evidencia de funcionamiento en otros idiomas.
- Es un modelo de decisión auxiliar: el autor indica explícitamente que no toma la decisión final, solo aporta material para la orquestación de recursos.
- La latencia en CPU (0,45-0,57 s por petición) puede ser incompatible con flujos interactivos estrictos; en ese caso se recomienda la cascada con el 0,1B.
- La longitud de contexto y el comportamiento con listas de funciones muy largas no se documentan; la latencia p95 depende de la longitud de la lista (75-135 ms en GPU).
- Licencia Apache-2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y aviso de cambios; no se han documentado restricciones adicionales.
- Riesgo de alucinación acotado por la gramática GBNF, que garantiza JSON válido, pero no garantiza que la acción elegida sea la correcta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quantumaikr/aimax-router-qwen3-0.6b
- Router de 0,1B del mismo autor: https://huggingface.co/quantumaikr/max-0.1b-aimax-router
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
