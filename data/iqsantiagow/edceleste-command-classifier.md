# IqSantiagow/edceleste-command-classifier

## Resumen

EDCeleste command classifier es un modelo de clasificación de intenciones (intent classification) de muy pequeño tamaño, desarrollado por IqSantiagow como componente del proyecto de código abierto EDCeleste, un asistente de voz para el videojuego Elite Dangerous. Su función es determinar, a partir del texto transcrito por Whisper de una orden hablada por el piloto, a cuál de las 41 acciones de nave (`EdAction`) corresponde el mensaje, o si por el contrario no es una orden de nave (una pregunta, charla informal o negativa) y debe derivarse a un modelo de lenguaje mayor.

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2` (22,7 millones de parámetros, licencia Apache 2.0) y añade una cabeza lineal de clasificación sobre 42 clases: las 41 acciones de EDCeleste más la clase `none`. Se distribuye exclusivamente como un fichero ONNX cuantizado dinámicamente a int8 de 23 MB, pensado para ejecutarse en CPU sin GPU, con un consumo de aproximadamente 27 MB de RAM y 0,9 ms por mensaje en un solo hilo con onnxruntime 1.31.

Su relevancia es acotada pero clara: sustituye a un modelo de decisión de 0,8 mil millones de parámetros (`edceleste-decider-0.8b` v5) en la tarea de enrutado de comandos, reduciendo drásticamente el coste computacional del camino rápido del asistente. No es un modelo de propósito general: es un clasificador cerrado, en inglés y entrenado sobre el dominio muy específico de la voz de un único piloto y la terminología de Elite Dangerous.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (all-MiniLM-L6-v2) con cabeza lineal de clasificación; exportado a ONNX |
| Parametros totales | 22,7 M (modelo base) más la cabeza lineal de 42 clases |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens (truncado explícito en el tokenizador) |
| Tipos de cuantizacion | int8 dinámica (fichero `command_classifier_int8.onnx`, 23 MB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`command_classifier_int8.onnx`), más `tokenizer.json` y `classes.json` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo MiniLM (variante destilada de all-MiniLM-L6-v2) con pooling de media sobre las representaciones de token y una cabeza lineal que proyecta el vector de frase a 42 logits, uno por clase. La entrada es el texto transcrito por Whisper, truncado a 32 tokens, con `input_ids` y `attention_mask` como entradas del grafo ONNX. La salida son 42 logits que la aplicación normaliza con softmax para obtener probabilidades.

El entrenamiento se realizó sobre las órdenes sintéticas y las grabaciones del dataset `IqSantiagow/edceleste-decisions` (privado), más aproximadamente 2900 frases adicionales escritas a mano y verificadas por el modelo decider v5, incluyendo líneas etiquetadas como "no es una orden". Se entrenó durante 10 épocas con tasa de aprendizaje 1e-4, label smoothing de 0,05 y pooling de media, en una GPU. No se documentan innovaciones arquitectónicas adicionales (sin decodificación especulativa, atención lineal ni mecanismos híbridos); la innovación es de ingeniería: un clasificador cerrado minúsculo que sustituye a un LLM de 0,8 B en el enrutado de comandos.

## Capacidades

- Clasificación de intenciones sobre un conjunto cerrado de 42 clases: las 41 acciones de nave de EDCeleste más `none`.
- Enrutado de comandos de voz: distingue órdenes de nave de preguntas, charla informal o negativas, que se derivan al LLM.
- Procesamiento de texto transcrito por Whisper, con tolerancia limitada a errores de transcripción de la terminología del juego.
- Inferencia en CPU pura, sin GPU, con latencia de 0,9 ms por mensaje en un hilo.
- Integración con la lógica de keybindings del piloto: la aplicación solo considera clases que tengan una tecla asignada, más `none`.
- Umbral de confianza configurable (0,5 en la configuración de referencia): por debajo de ese valor la respuesta es `none`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de forma nativa; el audio se transcribe externamente con Whisper.

## Casos de uso

- Enrutado de comandos de voz en Elite Dangerous: el modelo recibe el texto de Whisper y decide si es una orden de nave y cuál, permitiendo ejecutar la tecla correspondiente en milisegundos sin invocar al LLM.
- Filtro de falsos positivos en asistentes de voz: al clasificar preguntas, charla y negativas como `none`, evita que el sistema pulse teclas ante mensajes que no son órdenes, con cero pulsaciones erróneas sobre 73 no-órdenes en la sesión de prueba real.
- Reducción de coste en pipelines de asistente por voz: sustituye a un modelo de 0,8 B en el camino rápido, eliminando la necesidad de GPU para la clasificación de comandos y bajando el consumo a unos 27 MB de RAM.
- Despliegue en hardware modesto o integrado: al ser un ONNX int8 de 23 MB que corre en CPU, puede embeberse en aplicaciones de escritorio, portátiles sin GPU o dispositivos de bajo consumo.
- Componente de un sistema de comandos cerrado y verificable: útil como ejemplo de arquitectura de dos niveles (clasificador rápido + LLM para el resto) en asistentes de dominio específico.
- Prototipado de asistentes de voz para otros dominios con vocabulario cerrado: el enfoque (MiniLM + cabeza lineal + cuantización int8 + umbral de confianza) es reutilizable para conjuntos de comandos acotados, aunque requeriría reentrenamiento con datos del nuevo dominio.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan el modelo con el decider que reemplaza (`IqSantiagow/edceleste-decider-0.8b`, v5), con umbral 0,5 y la regla de la aplicación (solo compiten acciones con tecla asignada):

| Conjunto | Este modelo | decider-0.8b v5 |
|---|---|---|
| Habla real, sesión 2: comandos ejecutados (de 59) | 52 | 58 |
| Habla real, sesión 2: tecla equivocada | 1 | 0 |
| Habla real, sesión 2: tecla pulsada en 73 no-órdenes | 0 | 2 |
| Test sintético: comandos ejecutados (de 570)* | 539 | 530 |

\* El conjunto sintético está sesgado a favor del modelo: sus formulaciones eran conocidas cuando se escribieron las frases adicionales de entrenamiento. El autor señala que solo la fila de habla real es una cifra limpia, y que 59 comandos es una muestra pequeña (un comando equivale a 1,7 puntos). Cinco de los siete fallos son errores de transcripción de Whisper tiny.en sobre palabras de Elite ("tough launcher" por chaff launcher).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU.
- RAM: aproximadamente 27 MB de crecimiento de memoria según el autor.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU.
- ¿Cabe en GPU de consumo? Sí, pero es irrelevante: no necesita GPU. Cabe en cualquier equipo con unos pocos cientos de MB de RAM libre.
- Opciones de despliegue: onnxruntime (versión de referencia 1.31) con tokenizador Hugging Face (`tokenizers`), cargando `command_classifier_int8.onnx`, `tokenizer.json` y `classes.json`.
- Latencia y throughput: 0,9 ms por mensaje en un solo hilo de CPU, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EDCeleste command classifier | 22,7 M + cabeza lineal (42 clases) | 32 tokens | Clasificación de intenciones cerrada | Apache 2.0 | ONNX en Hugging Face |
| edceleste-decider-0.8b v5 | 0,8 B (aprox.) | No disponible | Decisión/generación para EDCeleste | No disponible | Hugging Face (`IqSantiagow/edceleste-decider-0.8b`) |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens (modelo base) | Embeddings de frase | Apache 2.0 | Hugging Face, ampliamente disponible |

El decider de 0,8 B obtiene mejores resultados en habla real (58 de 59 comandos frente a 52) pero pulsa teclas en 2 de 73 no-órdenes y exige mucha más capacidad de cómputo. El clasificador MiniLM, en cambio, es prácticamente gratis en CPU y no genera falsos positivos en la muestra de no-órdenes, a costa de una tasa de acierto menor y de un conjunto de clases cerrado. No se dispone de comparaciones con otros clasificadores de intenciones del mismo dominio.

## Limitaciones y advertencias

- Conjunto cerrado de clases: las 41 acciones son fijas. Si EDCeleste añade una acción nueva, el modelo no la ofrecerá nunca y sus comandos irán al LLM hasta reentrenar (unos 25 s en GPU según el autor).
- Solo inglés: entrenado con el habla de un único piloto más frases generadas, por lo que la generalización a otros acentos, micrófonos o condiciones de ruido es limitada.
- Sensible a errores de transcripción: cinco de los siete fallos en habla real provienen de errores de Whisper tiny.en sobre términos del juego.
- Muestra de evaluación pequeña: 59 comandos reales; un solo comando supone 1,7 puntos porcentuales, por lo que las cifras tienen alta varianza.
- Sesgo del test sintético: el conjunto sintético infla los resultados porque sus formulaciones eran conocidas durante la escritura de las frases de entrenamiento.
- Alcance funcional restringido: solo decide el comando; no decide si Celeste debe hablar ante un evento del juego, que es una cuestión distinta.
- Riesgo de alucinación bajo en el sentido generativo (no genera texto libre), pero puede asignar una clase errónea con confianza superior al umbral; el umbral de 0,5 es un parámetro crítico de producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base y los datos de entrenamiento (dataset privado) condicionan la reproducibilidad y la atribución.
- Sin datos publicados sobre sesgos demográficos o lingüísticos más allá de la limitación de idioma y de hablante único.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IqSantiagow/edceleste-command-classifier
- Repositorio del proyecto EDCeleste: https://github.com/IqSantiagow/EDCeleste
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/IqSantiagow/edceleste-decisions
- Modelo decider sustituido: https://huggingface.co/IqSantiagow/edceleste-decider-0.8b
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
