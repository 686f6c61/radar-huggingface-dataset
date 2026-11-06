# dtsj89/puki-brains

## Resumen

Puki Brains es un modelo de lenguaje de 46 millones de parámetros desarrollado por dtsj89 para Puki, un juego gratuito en hebreo e inglés dirigido a niños de dos a cuatro años. Su función es muy concreta: generar una línea corta y amable a partir de un prompt sobre un momento del juego, de lo que ha dicho el niño o de una comprobación de seguridad, y ejecutarse de forma totalmente offline en la propia tableta. No es un modelo de chat general y su conocimiento del mundo es deliberadamente limitado.

Técnicamente es un decoder de estilo llama con 14 capas, anchura 512, 8 cabezas de atención con 2 cabezas key/value (tamaño de cabeza 64), RoPE, embeddings atados y una longitud de contexto de 1.024 tokens. El vocabulario es un BPE a nivel de byte de 12.288 tokens entrenado para una mezcla con predominio del hebreo. Se distribuye cuantizado a int8 en formato ONNX, con un peso de 72 MB y un repositorio total de 0,1 GB.

Su relevancia es doble. Por un lado, demuestra que un modelo de 46M puede cubrir una tarea de generación de texto concreta en un dispositivo de gama baja (Samsung Galaxy Tab A7 Lite con 3 GB de RAM) con latencias de 0,34 a 0,44 s por línea. Por otro, documenta de forma inusualmente rigurosa el proceso de entrenamiento, con un manifiesto que registra los documentos y fragmentos usados en el preentrenamiento junto con sus hashes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo llama (RoPE, embeddings atados) |
| Parámetros totales | 46M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | int8 dinámica, per-channel (solo pesos MatMul) |
| Idiomas soportados | hebreo (he), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`brains_int8.onnx`, 72 MB) |
| Capas | 14 |
| Anchura | 512 |
| Cabezas de atención | 8 (2 cabezas key/value, tamaño de cabeza 64) |
| Vocabulario | 12.288 tokens (BPE a nivel de byte) |
| Tokens de preentrenamiento | 1,58B |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 14 capas con anchura 512, 8 cabezas de atención y 2 cabezas key/value (GQA), tamaño de cabeza 64, RoPE y embeddings atados. Usa un tokenizador BPE a nivel de byte de 12.288 tokens entrenado específicamente para una mezcla con predominio del hebreo. El contexto máximo es de 1.024 tokens, coherente con su uso previsto: prompts cortos y respuestas de una sola línea.

El entrenamiento se hizo desde cero en dos fases. La primera fue un preentrenamiento con 1,58B tokens (74 % hebreo, 26 % inglés) usando AdamW con schedule coseno. Las fuentes incluyen HeDC4 para hebreo y FineWeb-Edu, Cosmopedia, Project Gutenberg filtrado y YouTube filtrado (Common Pile) para inglés. La segunda fase fue un fine-tuning sobre 46.000 líneas de Puki en ambos idiomas y más de una docena de tareas: reaccionar a un momento del juego, conversar con el niño, responder con cuidado cuando menciona dolor o miedo, guardar un secreto del juego y actuar como puerta de seguridad que evalúa lo que ha dicho el niño. Las líneas fueron escritas por modelos DeepSeek vía API y cada una se conservó solo si pasaba los filtros de Puki (longitud, vocabulario infantil, sin promesas impropias de un compañero de juegos, veracidad sobre el juego) y el juicio de un segundo modelo. El código de entrenamiento está en `train/` del repositorio de Puki y `train/pt_manifest.json` registra los documentos y fragmentos usados en el preentrenamiento con sus hashes.

## Capacidades

- Generación de texto corta y controlada: una línea por invocación, terminada por el token `<|endoftext|>` (id 0).
- Reacción a eventos del juego: recibe un prompt sobre un momento ("el niño ha dado de comer al elefante") y produce una frase adecuada para un niño de dos a cuatro años.
- Conversación con el niño: responde a lo que este dice en hebreo o inglés.
- Respuesta cuidadosa ante menciones de dolor o miedo: tarea específica de fine-tuning con respuestas prudentes.
- Guardado de secretos del juego: mantiene información que no debe revelar.
- Puerta de seguridad: clasifica lo que ha dicho el niño con una etiqueta coherente con la del conjunto de datos, con tendencia al lado prudente.
- Bilingüe hebreo-inglés, con claro predominio del hebreo en el preentrenamiento (74 %).
- Inferencia totalmente offline en el dispositivo, sin llamadas a servicios externos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Generación de diálogo en un juego infantil offline: el modelo recibe un prompt sobre el estado del juego y devuelve una línea en 0,34–0,44 s en una Galaxy Tab A7 Lite, lo que permite integrarlo en el bucle de juego sin conexión de red.
- Filtro de seguridad en tiempo real para las frases del niño: una comprobación tarda unos 0,12 s, suficiente para evaluar cada intervención antes de que el juego reaccione.
- Atención de momentos emocionales delicados: cuando el niño menciona dolor o miedo, el modelo genera una respuesta cuidadosa entrenada específicamente para ese caso, en lugar de una respuesta genérica.
- Mecánica de secretos en juegos educativos: el modelo puede mantener una información oculta del juego y no revelarla aunque el niño insista, gracias a la tarea de fine-tuning correspondiente.
- Prototipado de personajes conversacionales para dispositivos de gama baja: con 72 MB en int8 y 46M de parámetros, sirve como base para validar un personaje con presupuesto de memoria y cómputo muy ajustado antes de escalar a un modelo mayor.
- Investigación sobre modelos pequeños en hebreo: el modelo, su tokenizador y el manifiesto de preentrenamiento documentado permiten estudiar el comportamiento de un LM de 46M entrenado mayoritariamente en hebreo.
- Evaluación de pipelines de seguridad en dos capas: el diseño del autor (listas de palabras antes de generar, filtro después de generar y sustitución por una línea grabada si falla) es un patrón reutilizable en productos infantiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas propias sobre prompts retenidos que el modelo no vio durante el entrenamiento:

| Métrica | Resultado |
|---|---|
| Líneas que pasan el filtro de Puki | 99,5 % |
| Corrección honesta de un error absurdo | 139/153 |
| Recuento del día con al menos dos eventos reales | 217/226 |
| Guardado de un secreto del juego | 73/98 |
| Puerta de seguridad (frases infantiles clasificadas como en los datos) | 17/18 |
| Latencia por línea (Galaxy Tab A7 Lite, 3 GB) | 0,34–0,44 s |
| Latencia de la comprobación de seguridad | ~0,12 s |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 72 MB para los pesos int8, más el estado de la caché KV (14 capas × 2 × T × 64 en float32) y el runtime ONNX. Cabe holgadamente en dispositivos con 3 GB de RAM.
- GPU recomendadas: no requiere GPU; está diseñado para CPU en tableta. Cualquier GPU consumer (por ejemplo, RTX 4090) lo ejecutaría con enorme margen, pero no es el escenario previsto.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles de gama baja; el autor lo valida en una Samsung Galaxy Tab A7 Lite de 3 GB.
- Opciones de despliegue: ONNX Runtime (runtime Android `Brains.kt` incluido en el repositorio de Puki). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,34–0,44 s por línea y ~0,12 s por comprobación de seguridad en el dispositivo de referencia; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación cualitativa con alternativas de la misma categoría (modelos de menos de 100M parámetros para generación de texto en dispositivo) queda como no disponible, ya que no se han facilitado cifras de esos modelos ni resultados cruzados.

| Modelo | Parámetros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Puki Brains | 46M | 1.024 | Apache 2.0 | ONNX int8 | he, en |
| Alternativas de menos de 100M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de propósito muy restringido: no es un chat general y su conocimiento del mundo es mínimo; usarlo fuera de su tarea producirá respuestas pobres.
- Contexto de solo 1.024 tokens, insuficiente para conversaciones largas o documentos.
- Solo hebreo e inglés; no hay soporte de castellano ni de otros idiomas.
- Riesgo de alucinación sobre hechos del mundo, mitigado en parte por los filtros y la sustitución por líneas grabadas, pero no eliminado.
- La tarea de guardar secretos es la métrica más floja publicada (73/98), por lo que no debe confiarse en ella sin capas adicionales de control.
- Sesgos: el modelo se entrenó con líneas generadas por modelos DeepSeek y filtradas por otro modelo; los sesgos de esos generadores pueden persistir en el estilo y el contenido.
- La licencia del modelo es Apache 2.0, pero los datos de preentrenamiento incluyen HeDC4, cuya model card no declara licencia; conviene revisar las condiciones antes de un uso comercial que vaya más allá del previsto.
- El filtro de seguridad se apoya en listas de palabras y en un filtro posterior; un fallo en esas capas externas no queda cubierto por el modelo.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso; no debe integrarse en pipelines que lo requieran.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dtsj89/puki-brains
- Repositorio de Puki (código, `train/`, `Brains.kt`): https://github.com/TomSadeh/puki
- Dataset HeDC4: https://huggingface.co/datasets/HeNLP/HeDC4
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Project Gutenberg filtrado (Common Pile): https://huggingface.co/datasets/common-pile/project_gutenberg_filtered
- YouTube filtrado (Common Pile): https://huggingface.co/datasets/common-pile/youtube_filtered
- Paper HeRo (arXiv:2304.11077): https://arxiv.org/abs/2304.11077
