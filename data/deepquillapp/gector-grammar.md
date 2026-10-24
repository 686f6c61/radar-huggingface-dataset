# deepquillapp/gector-grammar

## Resumen

DeepQuill grammar checker (GECToR) es un modelo de corrección gramatical para inglés empaquetado como tagger de tokens: recibe una secuencia de palabras y asigna a cada una una etiqueta del conjunto `$KEEP`, `$REPLACE_x`, `$APPEND_x`, `$DELETE`, `$TRANSFORM_VERB_*` o `$TRANSFORM_AGREEMENT_*`, siguiendo el paradigma "tag, not rewrite" de GECToR (Omelianchuk et al., 2020). Lo desarrolla DeepQuill para su aplicación de escritura y está específicamente orientado a narrativa de ficción, no a texto académico ni a exámenes de learners.

El modelo parte del encoder `FacebookAI/roberta-base` y añade una cabeza de clasificación de etiquetas, exportada a ONNX en fp16 (repositorio de 0,3 GB). Se distribuye junto con `tokenizer.json` (BPE byte-level de RoBERTa), `labels.json` (lista de etiquetas, etiqueta de "keep" y longitud máxima) y `verb-form-vocab.txt` para resolver las etiquetas `$TRANSFORM_VERB_*`. La entrada debe pre-tokenizarse por palabras y codificarse como `["$START", *words]`.

Su relevancia práctica está en dos decisiones de diseño: solo se entrenó con datos y código compatibles con uso comercial (sin BEA-2019 ni checkpoints GECToR publicados) y su umbral de decisión está calibrado para no marcar trampas típicas de la ficción (diálogo dialectal, fragmentos, nombres propios). No publica resultados en benchmarks estándar de GEC, por lo que su calidad solo puede juzgarse por la evaluación interna que reporta el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza de clasificación de tokens al estilo GECToR; inferencia en una sola pasada |
| Parametros totales | No disponible en la model card; el encoder base `FacebookAI/roberta-base` tiene aproximadamente 125 M de parametros, mas la cabeza de etiquetado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la longitud maxima se define en el campo `max_length` de `labels.json`, cuyo valor no se publica); el encoder base admite hasta 512 tokens |
| Tipos de cuantizacion | Pesos almacenados en fp16 dentro del ONNX y convertidos a fp32 al cargar; no se publican variantes GGUF, INT8 ni otras |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), mas `tokenizer.json`, `labels.json` y `verb-form-vocab.txt` |

Detalles de interfaz del grafo ONNX: entradas `input_ids` y `attention_mask` con forma `[1, T]`; salidas `label_probs` `[1, T, L]` (softmax sobre etiquetas) y `error_probs` `[1, T]`. La cabeza de etiquetas es `labels` menos el `<PAD>` final, y la etiqueta de cada palabra se lee en su primer sub-token.

## Arquitectura y entrenamiento

El modelo es un tagger de corrección, no un seq2seq: en lugar de reescribir la frase, etiqueta cada token con una operación de edición y un post-procesado determinista aplica los cambios. La cabeza de verbos se apoya en una tabla externa de formas verbales (`verb-form-vocab.txt`, procedente de `grammarly/gector`, Apache-2.0), y las etiquetas `$TRANSFORM_CASE_*` se descartan en la aplicación, según indica el autor. La decodificación es de una sola pasada por frase, sin generación autorregresiva ni decodificación especulativa.

El entrenamiento se realizó con `tools/gec-train` del repositorio de DeepQuill, sobre el código `gotutiyan/gector` (commit `a4a342e`, MIT). Los datos declarados son: errores generales de C4_200M (Stahlberg y Kumar, 2021; vía `liweili/c4_200m`, ediciones CC BY 4.0, texto ODC-BY), el texto subyacente de C4 (Raffel et al., 2020, ODC-BY) y narrativa de Project Gutenberg vía `sedthh/gutenberg_english` (dominio público en EE. UU.). El autor afirma explícitamente que no se usaron datos de BEA-2019 (Lang-8, NUCLE, FCE, W&I+LOCNESS) ni checkpoints GECToR publicados, lo que condiciona tanto la licencia como la distribución de errores que el modelo aprende. No se documentan número de tokens de entrenamiento, composición exacta del dataset, ni fases de RLHF/DPO (no aplicables a un tagger).

## Capacidades

- Detección y corrección de errores gramaticales a nivel de token mediante etiquetas de edición (`$KEEP`, `$REPLACE_x`, `$APPEND_x`, `$DELETE`).
- Transformaciones morfológicas de verbo (`$TRANSFORM_VERB_*`) resueltas con una tabla de formas verbales.
- Transformaciones de concordancia (`$TRANSFORM_AGREEMENT_*`) entre constituyentes.
- Puntuación de error por palabra (`error_probs`), que permite fijar umbrales de decisión ajustables; el autor usa 0,6 tanto para marcar frase como para aplicar etiqueta.
- Pre-tokenización por palabras con token especial `$START` como primera posición, lo que permite controlar exactamente la alineación palabra-etiqueta.
- Robustez declarada frente a rasgos de ficción: en su evaluación no marca diálogo dialectal, fragmentos ni nombres propios.
- No soporta tool calling, function calling, agentes, visión, audio ni modo "thinking"; es un clasificador de tokens, no un modelo generativo.
- Multilingüe: no. Solo inglés.

## Casos de uso

- Corrección inline en una aplicación de escritura: el modelo devuelve `error_probs` y `label_probs` por token en una sola pasada, lo que permite subrayar sugerencias en tiempo de escritura sin generar texto nuevo ni bloquear la interfaz.
- Revisión de manuscritos de narrativa: al estar entrenado también con Project Gutenberg y calibrar el umbral para no marcar trampas de ficción, reduce los falsos positivos sobre diálogo dialectal y fragmentos intencionados, el principal motivo de abandono de correctores en narrativa.
- Pre-filtro antes de un LLM corrector: usar las 14,4 marcas por cada 1.000 frases que reporta el autor para decidir qué frases merecen una segunda pasada con un modelo generativo, reduciendo coste de inferencia.
- Integración en CI de documentación: ejecutar el ONNX sobre ficheros Markdown o documentación técnica y fallar el pipeline cuando la probabilidad de error supere 0,6 en tokens no exentos.
- Procesado por lotes de corpus: el modelo es un tagger determinista de una pasada, adecuado para pasar cientos de miles de palabras por CPU en pipelines offline sin GPU.
- Herramientas de autor para editoriales: extracción de patrones de error recurrentes de un autor (concordancia, tiempos verbales) a partir de las etiquetas aplicadas, para informes de estilo.
- Corrección asistida en entornos sin conectividad o con requisitos de privacidad: al ser ONNX de 0,3 GB, se puede embeber en aplicaciones de escritorio y ejecutar en local sin enviar el texto a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar de corrección gramatical (CoNLL-2014, BEA-2019, FCE) en la información disponible. La única evaluación reportada es interna, sobre una novela de 109.000 palabras con umbral 0,6:

| Metrica | Resultado |
|---|---|
| Errores conocidos detectados | 6 de 8 (75 %) |
| Trampas conocidas respetadas (dialecto, fragmentos, nombres) | 12 de 12 (100 %) |
| Tasa de marcas | 14,4 por cada 1.000 frases |
| Benchmark estandar (CoNLL-2014, BEA-2019) | No disponible |

La muestra de errores (8 casos) es demasiado pequena para extraer conclusiones de recall generalizables; el dato mas informativo es la tasa de marcas y la ausencia de falsos positivos sobre las 12 trampas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para el grafo completo (repositorio de 0,3 GB en fp16); el encoder base ronda los 125 M de parametros.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con ONNX Runtime.
- Inferencia en CPU perfectamente viable para uso interactivo por frase; no requiere A100/H100 salvo para procesado masivo en paralelo.
- Despliegue: ONNX Runtime (CPU o CUDA), o exportación a otros runtimes ONNX; no se distribuyen pesos PyTorch, GGUF ni plantillas para vLLM, TGI, llama.cpp u Ollama, que en cualquier caso no aplican a un tagger de clasificación.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepquillapp/gector-grammar | Tagger GECToR sobre RoBERTa-base, ONNX | ~125 M + cabeza (derivado del base) | No disponible (base: 512) | Apache-2.0 | HuggingFace, ONNX |
| GECToR original (Omelianchuk et al., 2020) | Tagger GECToR sobre RoBERTa/BERT | ~125 M-340 M segun variante | 512 | Codigo MIT; pesos con condiciones propias | Checkpoints publicos citados por el autor |
| `gotutiyan/gector` | Implementacion de entrenamiento GECToR | Depende del encoder | 512 | MIT (codigo) | GitHub |
| Correctores basados en LLM (p. ej. reescritura generativa) | Seq2seq decoder | Miles de millones | 8k-128k | Variable | APIs o pesos abiertos |

Diferencias clave frente al GECToR original: este modelo evita deliberadamente los datos de BEA-2019 y los checkpoints publicados, lo que cambia la distribución de errores (no esta optimizado para textos de aprendices de inglés) y simplifica la licencia para uso comercial. Frente a un LLM corrector, es orders of magnitude mas barato y determinista, pero no reescribe frases completas ni justifica sus cambios. No se dispone de numeros de benchmark comparativos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles; no hay soporte multilingue ni variantes.
- Entrenado sin BEA-2019 (Lang-8, NUCLE, FCE, W&I+LOCNESS): su comportamiento sobre textos de aprendices de inglés puede diferir del de los GECToR de referencia, y no es comparable en los benchmarks habituales de la tarea.
- Descarta las etiquetas `$TRANSFORM_CASE_*`, por lo que no corrige errores de mayusculas/minusculas.
- La evaluacion reportada se basa en 8 errores conocidos: insuficiente para estimar recall real. Es esperable un recall moderado en errores complejos de reescritura, ya que el modelo solo aplica ediciones locales por token.
- Riesgo de alucinacion en sentido estricto bajo (no genera texto), pero riesgo de sobrerrección: las etiquetas `$REPLACE_x` pueden sustituir palabras validas en registros no vistos. El umbral de 0,6 mitiga pero no elimina este riesgo.
- El umbral 0,6 y la tasa de 14,4 marcas/1.000 frases estan calibrados para ficcion; en otros dominios (legal, medico, tecnico) la tasa de falsos positivos no esta medida.
- Longitud maxima de secuencia no publicada: frases muy largas pueden truncarse sin que la model card documente el comportamiento.
- Formato unico ONNX con pesos fp16 convertidos a fp32: no hay versiones cuantizadas para reducir memoria ni checkpoints PyTorch para reentrenar.
- Licencia Apache-2.0 permite uso comercial, pero las fuentes de datos imponen atribucion (C4_200M CC BY 4.0, C4 ODC-BY); conviene conservar la atribucion que figura en la model card.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepquillapp/gector-grammar
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Dataset C4_200M (Stahlberg y Kumar, 2021): https://github.com/google-research-datasets/C4_200M-synthetic-dataset-for-grammatical-error-correction
- Dataset C4_200M en HuggingFace (via citada por el autor): https://huggingface.co/datasets/liweili/c4_200m
- Corpus Gutenberg en HuggingFace (via citada por el autor): https://huggingface.co/datasets/sedthh/gutenberg_english
- Codigo de entrenamiento citado: `gotutiyan/gector` (commit `a4a342e`)
- Tabla de formas verbales citada: `grammarly/gector`, `data/verb-form-vocab.txt` (commit `3d41d28`)
- Paper de referencia: Omelianchuk et al., 2020, "GECToR - Grammatical Error Correction: Tag, Not Rewrite", BEA workshop
- Paper de referencia: Raffel et al., 2020, "Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer", JMLR

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de la informacion de HuggingFace.
