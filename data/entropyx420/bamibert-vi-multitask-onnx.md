# entropyx420/bamibert-vi-multitask-onnx

## Resumen

BamiBERT Vietnamese multi-task (ONNX, v12) es un modelo de clasificación de tokens en vietnamita que agrupa cuatro tareas sobre un único encoder: segmentación de palabras, etiquetado POS universal (UPOS), chunking sintáctico y clasificación de normalización léxica. Lo desarrolla el usuario `entropyx420` a partir de un fine-tuning de `Qualcomm-AI-Research/BamiBERT`, y se distribuye exclusivamente en formato ONNX con tres precisiones (fp32, fp16 y q8) pensadas para distintos entornos de ejecución (referencia, WebGPU y WASM).

El modelo resuelve un problema clásico del procesamiento del vietnamita: la segmentación de palabras a partir de sílabas, dado que el idioma se escribe con separación silábica y no léxica. Sobre esa base añade POS, chunking y una etiqueta de normalización (`CANON`, `SLANG`, `TYPO`, `LOAN`) que permite decidir en tiempo de inferencia si un token debe normalizarse contra un léxico externo. La decisión de no modelar `NO_DIACRITIC` ni `DIALECT` como clases es deliberada: la restauración de diacríticos se delega a un diccionario a nivel de palabra y las variantes regionales a un léxico de dialectos.

Es relevante para pipelines de PLN vietnamita que necesiten un componente ligero, multilingüe en tareas pero monolingüe en idioma, desplegable en navegador o en entornos serverless gracias a las variantes q8 (155 MB) y fp16 (205 MB). El repo pesa 3,1 GB en total, aunque los tres artefactos ONNX suman menos de 800 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BamiBERT, base tipo RoBERTa) con cuatro cabezas de token classification |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, q8 (int8) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other |
| Formato de pesos | ONNX (`model_norm_fp32.v12.onnx`, `model_norm_fp16.v12.onnx`, `model_norm_q8.v12.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de `Qualcomm-AI-Research/BamiBERT`, un encoder transformer de la familia BERT/RoBERTa adaptado al vietnamita, y le añade cuatro cabezas de clasificación de tokens que comparten el mismo encoder: una cabeza de segmentación (etiquetas B/I sobre sílabas para delimitar fronteras de palabra), una cabeza UPOS con 17 etiquetas universales, una cabeza de chunking con esquema BIO sobre NP/VP/AP/RP y una cabeza de etiqueta de normalización con cuatro clases (`CANON`, `SLANG`, `TYPO`, `LOAN`).

El tokenizador es el sentencepiece-vocab de BamiBERT/RoBERTa incluido en el repositorio de demostración, y la entrada es la frase en bruto. La normalización no se resuelve íntegramente en el modelo: los candidatos de normalización se suministran en tiempo de inferencia mediante un léxico (`lexicon.json`) y vectores de candidatos (`cand_vec.bin`, `cand_targets.json`). El autor justifica explícitamente no incluir `NO_DIACRITIC` ni `DIALECT` como clases del modelo porque ninguna de las dos decisiones puede tomarse de forma fiable a nivel de sílaba; la restauración de diacríticos se hace con un diccionario a nivel de palabra y las formas regionales con un léxico de dialectos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Segmentación de palabras en vietnamita a partir de sílabas (etiquetas B/I).
- Etiquetado POS universal (UPOS) con 17 etiquetas.
- Chunking sintáctico con esquema BIO sobre sintagmas NP, VP, AP y RP.
- Clasificación de normalización léxica en cuatro clases: `CANON`, `SLANG`, `TYPO`, `LOAN`.
- Integración con léxico externo para restauración de diacríticos a nivel de palabra.
- Integración con léxico de dialectos para formas regionales.
- Ejecución en tres precisiones con paridad de segmentación: el argmax de segmentación coincide al 100% entre fp32, fp16 y q8 en el conjunto de paridad.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de generación de texto: es un modelo de clasificación de tokens, no generativo.

## Casos de uso

- Preprocesado de corpus vietnamitas: el modelo segmenta frases en bruto en palabras antes de alimentar pipelines de indexación, búsqueda o análisis, resolviendo la ambigüedad silábica del idioma con una F1 de segmentación de 0,977 en conjuntos reservados.
- Análisis morfosintáctico en producción: la cabeza UPOS (87,7% en UD) y la de chunking permiten extraer estructuras de sintagmas para tareas de extracción de información, resumen extractivo o construcción de árboles de dependencias aproximados.
- Normalización de texto de usuario: la etiqueta `LOAN`/contexto con separación de +0,76 y la recall de 95,8% en préstamos no vistos a través de 11 sistemas de escritura permiten detectar y normalizar préstamos, jerga y erratas en reseñas, chats o redes sociales antes de tareas posteriores.
- Moderación y limpieza de contenido generado por usuarios: la clasificación `SLANG`/`TYPO` facilita identificar y estandarizar variantes ortográficas y coloquiales en flujos de entrada de texto.
- Despliegue en navegador o edge: la variante q8 (155 MB) orientada a WASM y la fp16 (205 MB) orientada a WebGPU permiten ejecutar segmentación y POS en el cliente sin backend, útil en correctores o asistentes de escritura vietnamitas.
- Enriquecimiento de datasets para entrenamiento: las cuatro cabezas generan anotaciones automáticas (segmentación, POS, chunking, normalización) que pueden usarse como preetiquetado en proyectos de anotación humana, reduciendo el coste de etiquetado.
- Búsqueda y recuperación en vietnamita: la segmentación correcta mejora la tokenización de índices invertidos y la coincidencia de términos en motores de búsqueda sobre texto vietnamita.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| F1 de segmentación de palabras (conjuntos reservados) | 0,977 |
| UPOS en UD | 87,7% |
| POS en chat reservado | 86,8% |
| Recall de préstamos no vistos (11 sistemas de escritura) | 95,8% |
| Separación LOAN/contexto | +0,76 |
| Paridad de segmentación fp32/fp16/q8 | 100% de acuerdo en argmax |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16 y 0,2 GB en q8, considerando solo los pesos; el consumo real depende del runtime y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; no requiere A100 ni H100. Una RTX 4090 o una GPU integrada moderna son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual e incluso en iGPU; la variante q8 está pensada para WASM y la fp16 para WebGPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU, WASM), y por extensión cualquier runtime compatible con ONNX; no se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tareas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| BamiBERT multi-task ONNX (este) | Encoder transformer + 4 cabezas | vi | Segmentación, UPOS, chunking, normalización | no disponible | other | ONNX |
| `Qualcomm-AI-Research/BamiBERT` | Encoder transformer base | vi | Enmascarado / base para fine-tuning | no disponible | no disponible | safetensors (habitual) |
| PhoBERT | Encoder transformer | vi | Base para fine-tuning (POS, NER, etc.) | no disponible | no disponible | safetensors |
| VnCoreNLP | Pipeline NLP | vi | Segmentación, POS, NER, dependencias | no aplica | no disponible | herramienta Java |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con PhoBERT o VnCoreNLP.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta vietnamita; no debe usarse con otros idiomas.
- Es un modelo de clasificación de tokens, no generativo: no produce texto libre ni mantiene conversaciones.
- La normalización depende de artefactos externos (`lexicon.json`, `cand_vec.bin`, `cand_targets.json`); sin ellos, la cabeza de normalización no es plenamente funcional.
- La restauración de diacríticos y las variantes dialectales se delegan a léxicos externos, no al modelo; la cobertura depende de la calidad de esos recursos.
- Licencia `other`: no se especifican los términos exactos de uso comercial; es necesario consultar el repo antes de un despliegue en producción.
- Riesgo de sesgo y de alucinación no documentado en la información disponible; al ser un clasificador, el riesgo se traduce en errores de etiquetado más que en texto inventado.
- El rendimiento medido (F1 0,977 en segmentación, 87,7% UPOS) corresponde a conjuntos reservados del autor; no hay validación independiente publicada.
- El repo pesa 3,1 GB, muy por encima de los artefactos ONNX individuales; conviene descargar solo el fichero necesario.
- Creado y actualizado en fechas futuras según los metadatos (2026), lo que puede indicar un repo reciente con poca validación de la comunidad (0 descargas, 0 likes).

## Enlaces

- HuggingFace: https://huggingface.co/entropyx420/bamibert-vi-multitask-onnx
- Modelo base: https://huggingface.co/Qualcomm-AI-Research/BamiBERT
