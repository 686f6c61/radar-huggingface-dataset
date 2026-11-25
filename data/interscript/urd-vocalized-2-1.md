# Interscript/urd-vocalized-2.1

## Resumen

urd-vocalized-2.1 es un modelo especializado en diacritización del urdu (conversión de texto sin vocales a texto vocalizado) desarrollado por Interscript dentro de la familia de capas fonológicas Secryst. Se basa en el checkpoint `google/byt5-small` afinado directamente sobre pares oro verificados por humanos del corpus data-diacrit, sin destilación ni reetiquetado mediante modelos profesor. El modelo se distribuye como artefacto ONNX con cuantización int8 dinámica y se carga a través de cualquier cristal de Secryst.

Su relevancia radica en que establece un nuevo referente para el urdu: alcanza un CER bruto del 3,632 % en el conjunto completo de evaluación (11.940 filas, protocolo WO37), por debajo del umbral de 3,77 % y de los modelos previos de la misma familia (urd-vocalized-1.0 con 3,74 % y el estudiante destilado urd-vocalized-2.0 con 3,641 %). El hallazgo técnico principal es que las etiquetas oro verificadas por humanos superan a las etiquetas destiladas de un profesor sobre el mismo corpus.

El modelo es de tamaño reducido (derivado de ByT5-small) y está pensado exclusivamente para la tarea de diacritización del urdu, no como un modelo generativo de propósito general. Su licencia BSD-3-Clause permite uso comercial, y su linaje de datos está documentado con hashes sha256 y sin solapamiento con el corpus CLE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ByT5-small (transformer encoder-decoder byte-level), exportado a ONNX |
| Parámetros totales | no disponible (derivado de `google/byt5-small`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (MAXLEN de entrenamiento: 256 tokens) |
| Tipos de cuantización | int8 dinámica (artefacto publicado); referencia fp32 ONNX para paridad |
| Idiomas soportados | urdu (ur) |
| Licencia | BSD-3-Clause (código y pesos) |
| Formato de pesos | ONNX (artefacto `urd-vocalized-2.1-int8-dynamic.zip`, 0,24 GiB); repo de 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `google/byt5-small`, un transformer encoder-decoder que opera a nivel de bytes en lugar de tokens subword, lo que evita problemas de vocabulario en escrituras como la urdu. Se afinó directamente sobre los 573.130 pares fuente/objetivo del split de entrenamiento del corpus data-diacrit (sha256 `95736b0d...`), sin profesor, sin reetiquetado y sin destilación. El entrenamiento se ejecutó con el cargador `train_student_distill_hf.py` en modo DATA_GLOB gold (run-097-urd-diac-gold) sobre HF Jobs a100-large, con 3 épocas, batch size 16 × acumulación 2, learning rate 3e-4 con decaimiento coseno (200 pasos de warmup), precisión bf16, MAXLEN 256 y 53.733 pasos totales.

La innovación destacable no es arquitectónica sino metodológica: el modelo demuestra empíricamente (hallazgo WO93) que las etiquetas oro verificadas por humanos superan a las etiquetas destiladas de un profesor sobre el mismo corpus (CER 0,03632 frente a 0,03641). El linaje es de un solo salto desde el checkpoint original de Google hasta el corpus oro público, con exposición nula a contenido CLE (el discriminador de solapamiento midió cero shingles compartidos). La exportación a ONNX int8 dinámica mantiene una paridad de 0,0671 pp de CER frente a la referencia fp32 sobre 600 muestras (umbral de 2,0 pp), con un 0,539 % de flips de argmax y un 0,349 % de flips confiados.

## Capacidades

- Diacritización del urdu: conversión de texto urdu sin vocales (bare) a texto vocalizado (vocalized), que es la tarea principal y única del modelo.
- Procesamiento a nivel de bytes mediante ByT5, lo que le permite manejar la escritura urdu sin fragmentación subword.
- Salida determinista en modo greedy de una sola fila, adecuada para pipelines de normalización de texto.
- Ejecución en CPU mediante ONNX Runtime (la paridad se midió en ORT CPU).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada exclusivamente al urdu.

## Casos de uso

- Normalización de corpus urdu para NLP: el modelo vocaliza textos planos antes de alimentar pipelines de análisis morfológico, POS tagging o parsing, donde la ausencia de diacríticos degrada la precisión. Su CER del 3,632 % lo hace adecuado para esta tarea a gran escala.
- Preprocesamiento para TTS en urdu: la diacritización previa a la síntesis de voz reduce ambigüedades de pronunciación, ya que el texto vocalizado desambigua vocales que el texto plano no refleja.
- Enriquecimiento de textos educativos y literarios: añadir diacríticos a material de lectura para aprendices de urdu, donde la vocalización explícita facilita la lectura.
- Búsqueda y recuperación de información en urdu: normalizar consultas y documentos a una forma vocalizada canónica para reducir variantes ortográficas y mejorar el matching.
- Transcripción y subtitulado: postprocesar transcripciones ASR en urdu con diacríticos para mejorar la legibilidad y la corrección posterior.
- Integración en herramientas de edición de texto urdu: servicio de vocalización bajo demanda dentro de editores o procesadores de textos, ejecutable en CPU gracias al artefacto ONNX int8 de 0,24 GiB.
- Validación de calidad de datos: usar el modelo como referencia para detectar pares mal alineados en corpus de entrenamiento, comparando su salida con etiquetas existentes.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CER bruto full-split (11.940 filas, media por fila, protocolo WO37) | 3,632 % (umbral 3,77 %; urd-vocalized-1.0: 3,74 %; urd-vocalized-2.0: 3,641 %) |
| Clause 16(e) calibrado, split emparejado | PASS — AUC 0,4816 (dev 0,0184 ≤ 0,05); autocontrol de referencia 0,5 exacto; tasa de éxito 0,515 ≤ 0,6 |
| Sondas de extracción / verbatim / WordNet | PASS (0 violaciones en las tres) |
| Paridad int8-dynamic ONNX vs fp32 ONNX (600 muestras, ORT CPU) | delta CER 0,0671 pp (umbral int8 2,0 pp); flips de argmax 0,539 %; flips confiados 0,349 % |

## Requisitos de hardware

- VRAM estimada: el artefacto int8 dinámico ocupa 0,24 GiB, por lo que la inferencia requiere muy poca memoria; cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; el entrenamiento se realizó en A100-large, pero la inferencia está pensada para CPU vía ONNX Runtime.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), a través de la librería Secryst (`Model.load("urd-vocalized-2.1")`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | CER full-split | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| urd-vocalized-2.1 | 3,632 % | ByT5-small, oro directo, ONNX int8 | BSD-3-Clause | Hugging Face + GitHub Releases |
| urd-vocalized-2.0 | 3,641 % | Estudiante destilado (profesor-reetiquetado) | no disponible | familia Secryst |
| urd-vocalized-1.0 | 3,74 % | Campeón previo de la familia | no disponible | familia Secryst |

No se dispone de datos de modelos comparables fuera de la familia Secryst en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: el modelo solo realiza diacritización del urdu; no es un modelo generativo de propósito general ni admite otras tareas.
- Longitud de entrada limitada: el entrenamiento usó MAXLEN 256, por lo que textos más largos requieren segmentación previa.
- Riesgo de error del 3,632 % de CER: aunque bajo, implica que aproximadamente 3-4 de cada 100 caracteres pueden diferir del oro, lo que puede afectar a tareas sensibles a la precisión diacrítica.
- Cuantización int8: introduce un delta de CER de 0,0671 pp y un 0,539 % de flips de argmax frente a fp32; para aplicaciones que requieran máxima fidelidad, usar la referencia fp32.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no evaluado explícitamente; al ser una tarea de transformación secuencia-a-secuencia, el riesgo se manifiesta como sustituciones o diacríticos incorrectos más que como contenido inventado.
- Licencia BSD-3-Clause: permite uso comercial con atribución; se debe conservar el aviso de copyright y la atribución de Schedule D a CLE-KICS, UET, aunque el modelo no derive de contenido CLE.
- El modelo no está pensado para despliegues de alto throughput sin evaluar previamente la latencia, dato no publicado.
- Fecha de creación del repositorio (2026-11-25) y estado de descargas (0) indican un artefacto reciente con poca validación comunitaria externa.

## Enlaces

- Hugging Face: https://huggingface.co/Interscript/urd-vocalized-2.1
- Secryst: https://secryst.github.io
- Repositorio de entrenamiento: https://github.com/secryst/secryst-train
- Distribución interscript-ml: https://github.com/interscript/interscript-models
- Resultados de referencia: interscript/interscript-models docs/RESULTS.md#run-097-urd-vocalized-21-direct-gold-quality-gate-pass-and-calibrated-clause-16e-2026-11-25
- Checkpoint base: google/byt5-small
