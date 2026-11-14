# Nefelim584/jev-lite

## Resumen

jev-lite es un modelo de clasificación de texto desarrollado por Nefelim584, construido mediante fine-tuning completo sobre `answerdotai/ModernBERT-large` (395M parámetros). No es un modelo generativo: su función es actuar como un juez tipado ("typed decision model") que recibe un estado (texto libre, objeto JSON o lista de textos) y una o varias preguntas tipadas, devolviendo distribuciones de probabilidad calibradas sobre respuestas booleanas, de elección múltiple o de puntuación ordinal. Está pensado como sustituto rápido y barato de un LLM-as-a-judge en tareas como evaluación de fidelidad en RAG, detección de alucinaciones, preferencia por pares, scoring por rúbrica y, desde la versión v0.3.0, moderación de seguridad y toxicidad.

El modelo emplea una codificación empaquetada en la que cada pregunta se serializa como una única secuencia (estado + pregunta + candidatos) con un marcador `[MASK]` por candidato; los estados ocultos de esos marcadores pasan por un tronco compartido de 1024 a 256 dimensiones y tres cabezas específicas (Bool, Choice, Score). El checkpoint se carga con el paquete `jevlite` del repositorio de código, ya que las cabezas son personalizadas y no estándar en `transformers`.

La relevancia actual del modelo reside en su propuesta de sustituir llamadas costosas a LLMs jueces por un encoder compacto con decisiones restringidas al conjunto de candidatos del propio llamante, garantizando que la salida siempre encaje en el esquema solicitado. El repositorio tiene 4,7 GB, licencia Apache 2.0, soporte exclusivo de inglés y, en el momento de la consulta, cero descargas y un único "like".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) con codificación empaquetada y cabezas personalizadas Bool/Choice/Score |
| Parámetros totales | 395M (modelo base); total del checkpoint no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado a 512 (Stage A), 1024 (Stage B) y 2048 tokens (Stage D); ejecución por defecto a 8192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (encoder en formato `transformers`), `heads.pt` (tronco y cabezas), `jevlite.yaml`, `calibration.json` |

## Arquitectura y entrenamiento

jev-lite parte de `answerdotai/ModernBERT-large` con fine-tuning completo. La innovación principal es la codificación empaquetada: cada pregunta se convierte en una secuencia única que concatena el estado, la pregunta y los candidatos (de 1 a 32 opciones o niveles), con un token `[MASK]` por candidato. Los estados ocultos correspondientes a esos marcadores atraviesan un tronco compartido de 1024 a 256 dimensiones y luego tres cabezas especializadas: Bool (probabilidad de verdadero más confianza), Choice (distribución sobre opciones más argmax y confianza) y Score (distribución sobre niveles ordenados más argmax, nivel esperado y confianza). Todas las preguntas de una petición se resuelven en un único forward pass.

El entrenamiento se organizó en etapas. La Stage A (v0.1.0) usó 25 datasets públicos en inglés: FEVER, VitaminC, HoVer, MultiNLI, SNLI, WANLI, BoolQ, TabFact, QNLI, PAWS, SQuAD 2.0, Natural Questions, ClapNQ, ARC, OpenBookQA, CommonsenseQA, Cosmos QA, Social IQa, CLINC150, MASSIVE, DBpedia-14, GoEmotions, summarize_from_feedback, HelpSteer2 y HelpSteer3. La Stage B (v0.2.0) añadió registros de juez construidos por código a partir de datos públicos, incluyendo RAGBench (hotpotqa, finqa, tatqa, hagrid, expertqa, techqa, pubmedqa) con etiquetas GPT-4 para fidelidad de respuestas completas y por frase. La Stage D (v0.3.0) incorpora datos públicos de seguridad y toxicidad y reajusta la calibración. La calibración se aplica post-hoc: una temperatura por primitiva y, opcionalmente, una capa de juez mediante Platt scaling balanceado por clase sobre el logit Bool, que desplaza el umbral de decisión para afirmaciones de fidelidad. La confianza se define como `1 − H(p) / log K` sobre las probabilidades calibradas, sin cabeza de confianza aprendida.

## Capacidades

- Clasificación booleana tipada: dada una afirmación sobre el estado, devuelve P(verdadero) y confianza calibrada.
- Elección múltiple tipada: distribución sobre entre 1 y 32 opciones, con argmax y confianza.
- Puntuación ordinal tipada: distribución sobre entre 1 y 32 niveles ordenados, con argmax, nivel esperado y confianza.
- Evaluación de fidelidad en RAG y detección de alucinaciones (respuesta completa o por frase frente a documentos).
- NLI y fact-checking sobre pares de textos.
- Detección de respuesta posible ("answerability") y preferencia por pares.
- Scoring por rúbrica y evaluación de claridad u otras dimensiones subjetivas.
- Moderación de contenido: seguridad y toxicidad de prompts y respuestas (desde v0.3.0).
- Procesamiento de estado en múltiples formatos: texto libre, objeto JSON o lista de textos.
- No genera texto: la salida siempre es una de las candidatas proporcionadas por el llamante.
- Capacidades multilingües: limitadas al inglés.
- Tool calling, agentes y razonamiento multi-paso: no disponible como tales; el modelo es un clasificador puntual, no un generador.

## Casos de uso

- Evaluación de fidelidad en pipelines RAG: el modelo recibe documentos recuperados, pregunta y respuesta generada, y devuelve la probabilidad de que la respuesta esté soportada por los documentos. Permite filtrar respuestas alucinadas antes de servirlas al usuario con un coste muy inferior al de un LLM juez.
- Detección de alucinaciones a nivel de frase: usando la capa de juez opcional (`layers=LAYERS`), se pueden emitir afirmaciones de fidelidad por frase y localizar el fragmento problemático dentro de una respuesta larga.
- Moderación de contenido en producción: con el estado configurado como el diálogo completo (turnos de usuario y asistente), se evalúan afirmaciones como "la respuesta del asistente es dañina o insegura" y se obtiene una probabilidad calibrada para bloquear o marcar conversaciones.
- Enrutado y clasificación de intenciones: con preguntas de tipo `choice` sobre un conjunto cerrado de etiquetas (por ejemplo, dominios o categorías de soporte), el modelo clasifica consultas en una sola pasada, adecuado para preprocesar tickets antes de un LLM generativo.
- Scoring por rúbrica en evaluación de modelos: para comparar respuestas de distintos LLM, se define una pregunta `score` con niveles ordenados (0 a 4) y se obtiene el nivel esperado y la distribución, permitiendo agregar métricas reproducibles sin depender de un juez generativo.
- Preferencia por pares en ajuste de modelos: dada una pregunta y dos respuestas candidatas como opciones, el modelo devuelve la distribución de preferencia, útil para construir datasets de DPO o para monitorizar regresiones entre versiones.
- Verificación de hechos en bases de conocimiento: con estados que combinan una afirmación y evidencia tabular o textual, se resuelve como pregunta `bool` para validar consistencia antes de publicar contenido.
- Control de calidad de resúmenes: se evalúa si cada frase del resumen está soportada por el texto fuente, filtrando resúmenes con baja fidelidad de forma automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo ocupa 4,7 GB en el repositorio, pero el modelo base es de 395M parámetros, por lo que en fp16 debería caber holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del encoder, una RTX 4090, A100 o H100 son opciones sobredimensionadas para la inferencia; una GPU consumer de gama media debería ser suficiente, aunque no se confirma en la documentación.
- ¿Cabe en consumer GPU? Sí, por el tamaño del encoder (395M), aunque la documentación no especifica requisitos mínimos.
- Opciones de despliegue: el checkpoint requiere el paquete `jevlite` (instalable desde el repositorio GitHub) y se carga con `Predictor.from_final(path, device="cuda")`; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-lite (Nefelim584) | 395M (base) | 8192 por defecto | Juez tipado (bool/choice/score), fidelidad RAG, moderación | Apache 2.0 | Hugging Face + GitHub |
| answerdotai/ModernBERT-large | 395M | hasta 8192 | Encoder generalista | Apache 2.0 | Hugging Face |
| LLM-as-a-judge genérico (p. ej. GPT-4) | no disponible | variable | Juez generativo | propietaria | API |
| Otros clasificadores NLI (p. ej. DeBERTa fine-tuned) | variable | 512 típicamente | NLI y clasificación | variable | Hugging Face |

La comparación directa con LLMs jueces no está soportada por datos de benchmarks en la información disponible. Frente a ModernBERT-large, jev-lite añade cabezas tipadas, calibración y un esquema de decisión restringido a candidatos; frente a clasificadores NLI convencionales, amplía la interfaz a elección múltiple y puntuación ordinal con contexto de hasta 8192 tokens.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No genera texto: cualquier caso de uso que requiera generación libre queda fuera de su alcance.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta en dominios alejados de los datos de entrenamiento; la confianza es una transformación de la entropía, no una estimación aprendida.
- Los estados más largos de 8192 tokens se recortan por cabeza y cola, y la respuesta marca `meta.truncated`; esto puede degradar la evaluación de documentos largos.
- La calibración se reajustó en v0.3.0; el autor indica que v0.2.0 era ligeramente mejor para fidelidad RAG en solitario, lo que implica posibles regresiones específicas por tarea entre versiones.
- El modelo no está afiliado a TypeSafe AI, según declara el autor.
- El uso comercial está permitido por la licencia Apache 2.0, pero las condiciones de los datos de entrenamiento de terceros (RAGBench con fuentes CC BY-SA 4.0, MIT, CC BY 4.0 y Apache-2.0) deben revisarse para cumplimiento.
- Las cabezas son personalizadas y requieren el paquete `jevlite`; no es cargable directamente con `transformers` sin código adicional.
- El repositorio presenta cero descargas y un único "like" en el momento de la consulta, lo que sugiere escasa validación externa.
- La información sobre cuantización, latencia y throughput no está disponible, lo que dificulta planificar despliegues con requisitos estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nefelim584/jev-lite
- Repositorio de código: https://github.com/Nefelim584/JEV_Judge
- Notas de versión v0.3.0: https://github.com/Nefelim584/JEV_Judge/blob/v0.3.0/docs/releases/v0.3.0.md
- Notas de versión v0.2.0: https://github.com/Nefelim584/JEV_Judge/blob/v0.2.0/docs/releases/v0.2.0.md
- Notas de versión v0.1.0: https://github.com/Nefelim584/JEV_Judge/blob/v0.1.0/docs/releases/v0.1.0.md
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset RAGBench: https://huggingface.co/datasets/galileo-ai/ragbench
