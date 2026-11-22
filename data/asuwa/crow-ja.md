# Asuwa/crow-ja

## Resumen

Crow (japonés) es un modelo de lenguaje de 17,3 millones de parámetros entrenado desde cero por el autor independiente Asuwa. Se trata de un remake en japonés de Tallow, el modelo de digi-the-robot, y su única función es interpretar a un cuervo salvaje llamado クロ (Kuro) que responde exclusivamente con acciones entre asteriscos y sonidos de cuervo, nunca con palabras humanas (salvo una palabra que el usuario le haya enseñado). El modelo recuerda el trato recibido a lo largo de la conversación: si se le alimenta, se va confiando poco a poco; si se le agarra, guarda rencor y las disculpas no sirven, solo la comida.

Forma parte de una familia de tres modelos hermanos (coreano, japonés y chino) y está pensado explícitamente como juguete para salas de chat pequeñas, no como un chatbot de propósito general. La arquitectura es un decoder estilo Llama con RMSNorm, RoPE, SwiGLU y embeddings atados, con 384 dimensiones ocultas, 8 capas y 6 cabezas de atención, sobre un vocabulario SentencePiece BPE de 8.192 tokens y una ventana de contexto de 2.048 tokens.

Su relevancia es la de un experimento de alineación de comportamiento a muy pequeña escala: demuestra que un modelo de 17M de parámetros puede aprender reglas sociales condicionales (confianza incremental, rencor persistente, imitación de palabras) si se le entrena con un corpus sintético bien estructurado y un formato de etiquetas de estado de ánimo tokenizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 17.308.032 (17,3M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16; el modelo es lo bastante pequeño para ejecutarse en CPU sin cuantizar) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo sigue la misma arquitectura que el Tallow original: un transformer decoder de tipo Llama con normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y embeddings de entrada y salida atados. La configuración concreta es d=384, 8 capas, 6 cabezas de atención y capa MLP de 1.024 dimensiones, lo que da los 17,3M de parámetros. El tokenizador es un SentencePiece BPE de 8.192 tokens con fallback de bytes, entrenado solo con las historias de preentrenamiento y con normalización `identity` (se conservan los signos de puntuación de ancho completo). Cada etiqueta de estado de ánimo como `[caution_min]` es un único símbolo del tokenizador.

El preentrenamiento usó el dataset `shibatch/TinyStories-JA` (revisión `155b4e58`), una traducción de TinyStories generada con Gemma 4 26B-A4B según la model card del propio dataset. Se realizaron aproximadamente 16.000 pasos de 32.000 tokens en una única GPU T4, con una pérdida de validación de 1,94. El ajuste fino se hizo sobre `Asuwa/crow-conversations` (split ja, licencia CC-BY-4.0), un conjunto de 4.177 conversaciones multi-turno de cuervo generadas íntegramente por Gemma 4 26B-A4B. La pérdida se calculó solo sobre las líneas del cuervo y se conservó el mejor checkpoint de validación. No se menciona RLHF ni DPO; el comportamiento se aprende por imitación supervisada sobre datos generados por un modelo mayor.

## Capacidades

- Generación de texto restringida a un formato fijo: `crow: [<mood> <min|max>] *acción* *acción* <sonido>`.
- Emisión de etiquetas de estado de ánimo entre ocho categorías (calm, curiosity, caution, joy, play, love, sadness, anger) con nivel min o max.
- Producción de sonidos de cuervo diferenciados según confianza y humor: カー (graznido), ガッガッ！ (alarma), コロロ-カカ (castañeteo de enfado), クルル… (murmullo suave reservado a amigos de confianza).
- Modelado de estado afectivo a lo largo de la conversación: la confianza sube con comida dejada a distancia y baja con agarrones, persecuciones o golpes.
- Persistencia del rencor: las disculpas verbales no lo revierten, solo la comida lo hace de forma gradual.
- Imitación de una palabra humana si se repite con paciencia suficiente; rechazo a decir palabras no aprendidas.
- Reacción de sobresalto ante movimientos bruscos por una cicatriz antigua.
- Capacidad multilingüe: no disponible (solo japonés).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Chat de rol en salas pequeñas: el modelo mantiene una personalidad animal consistente durante turnos múltiples dentro de su ventana de 2.048 tokens, lo que permite sesiones de roleplay cortas sin que el personaje se rompa.
- Demostración educativa de alineación de comportamiento: sirve para ilustrar en clase o en un blog cómo un modelo de 17M de parámetros puede aprender reglas sociales condicionales (confianza, rencor, imitación) mediante datos sintéticos estructurados.
- Bot de acompañamiento ligero en un servidor de Discord o IRC: al ejecutarse en CPU y en un único fichero `crow.py`, se puede desplegar como bot de bajo coste que responde con acciones y sonidos, ocultando las etiquetas de humor al usuario final.
- Prueba de concepto de formato estructurado: el modelo demuestra cómo tokenizar etiquetas de estado como símbolos únicos del vocabulario para forzar una salida con estructura fija verificable por un checker estricto.
- Investigación sobre robustez a entrada ruidosa: la evaluación con erratas, espacios eliminados, risas de internet y asteriscos ausentes (95,5% de acierto de etiqueta) lo convierte en un banco de pruebas pequeño para estudiar la tolerancia al ruido en modelos minúsculos.
- Generación de diálogos para videojuegos o prototipos narrativos: se puede integrar como NPC no jugador que reacciona a las acciones del jugador con un estado afectivo persistente, sin necesidad de GPU.
- Base para experimentos de destilación o ablación: al ser entrenable en una sola T4 en unas 16.000 iteraciones, es un punto de partida asequible para estudiar variantes de arquitectura o de corpus sin grandes presupuestos.

## Benchmarks y rendimiento

Evaluación sobre conversaciones reservadas (2.612 turnos nunca vistos durante el entrenamiento):

| Modelo | Pérdida en validación | Acierto de etiqueta | Entrada ruidosa | Respuestas que pasan el checker | Etiqueta correcta en respuestas |
|---|---|---|---|---|---|
| Japonés (este modelo) | 0,629 | 95,9% | 95,5% | 100% | 98,7% |

Desglose por comportamiento (acierto de etiqueta):

| Comportamiento | Acierto | Entrada ruidosa | Turnos |
|---|---|---|---|
| Responde con graznidos | 99,1% | 99,5% | 218 |
| La comida deshace el rencor paso a paso | 99,3% | 99,3% | 143 |
| El "lo siento" durante el rencor no hace nada | 100,0% | 100,0% | 109 |
| Estalla si le agarran | 89,8% | 89,8% | 49 |
| No acepta comida de la mano de un desconocido | 97,9% | 97,9% | 48 |
| Dice una palabra enseñada en el momento adecuado | 97,6% | 95,2% | 42 |
| Nunca agarrado, solo se aleja a saltos | 100,0% | 97,6% | 42 |
| Palabra no aprendida: escucha, no la dice | 95,0% | 92,5% | 40 |
| Sobresalto por la cicatriz | 94,7% | 94,7% | 19 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en fp16 (17,3M de parámetros × 2 bytes ≈ 35 MB de pesos, más overhead de activaciones y tokenizador); cabe holgadamente en cualquier GPU consumer e incluso en memoria unificada de sistemas embebidos.
- GPU recomendadas: ninguna en particular; el autor indica que se ejecuta en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobrada.
- Cabe en GPU consumer: sí, en todas las del mercado actual y en generaciones anteriores.
- Opciones de despliegue: el script `crow.py` incluido en el repositorio (un único fichero con modelo, tokenizador y bucle de chat). No es un modelo `transformers` y no funciona en llama.cpp ni en Ollama tal cual, porque el tokenizador espera un token `<nl>` para los saltos de línea y un espacio tras cada asterisco de apertura, que `crow.py` añade.
- Latencia y throughput estimados: no disponibles de forma numérica; al ejecutarse en CPU con 17M de parámetros y contexto de 2.048 tokens, la generación es interactiva en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crow-ja (este modelo) | 17,3M | 2.048 | Roleplay de cuervo en japonés, desde cero | Apache 2.0 | Hugging Face, script propio |
| Tallow (digi-the-robot) | no disponible en la información | no disponible | Modelo original en inglés del que deriva Crow | no disponible | Hugging Face |
| Crow-ko (hermano) | no disponible | no disponible | Misma tarea en coreano | no disponible | Hugging Face |
| Crow-zh (hermano) | no disponible | no disponible | Misma tarea en chino | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos hermanos ni de Tallow en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un modelo de juguete: no es un chatbot de propósito general y no debe usarse para tareas de conocimiento, código o razonamiento.
- Solo entiende y genera japonés; no hay soporte multilingüe.
- El formato de salida es rígido y depende de un tokenizador específico; no funciona en llama.cpp ni en Ollama sin adaptaciones.
- La ventana de contexto es de solo 2.048 tokens, insuficiente para conversaciones largas o documentos.
- Riesgo de alucinación en el sentido de romper el personaje o producir sonidos no permitidos por el estado de confianza; el checker estricto del autor da un 100% de respuestas válidas en la evaluación, pero esa métrica se limita a 150 turnos reservados.
- Las categorías con menos de 40 turnos en la evaluación son ruidosas: un solo fallo mueve varios puntos porcentuales.
- La mayoría de los errores son deslices de un paso en la escala de confianza (por ejemplo, `caution min` en lugar de `curiosity min`), que no se aprecian en la respuesta final.
- El corpus de ajuste fino fue generado íntegramente por Gemma 4 26B-A4B, por lo que hereda los sesgos y patrones de ese modelo generador.
- Las líneas humanas del conjunto de validación también pasaron por un proceso de limpieza con un juez, según la model card del dataset, lo que puede inflar ligeramente las métricas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está diseñado para producción real y su valor comercial es prácticamente nulo.
- El repositorio no redistribuye el corpus de preentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asuwa/crow-ja
- Modelo original Tallow: https://huggingface.co/digi-the-robot/Tallow
- Hermano coreano: https://huggingface.co/Asuwa/crow-ko
- Hermano chino: https://huggingface.co/Asuwa/crow-zh
- Dataset de ajuste fino: https://huggingface.co/datasets/Asuwa/crow-conversations
- Dataset de preentrenamiento: https://huggingface.co/datasets/shibatch/TinyStories-JA
