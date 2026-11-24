# Interscript/urd-vocalized-2.0

## Resumen

urd-vocalized-2.0 es un modelo especializado en diacritización del urdu (conversión de texto sin vocales a texto completamente vocalizado) desarrollado por Interscript dentro de la familia de capa fonológica Secryst. Se trata de un modelo ByT5-small destilado, exportado a ONNX con cuantización int8 dinámica, que resuelve un problema concreto del procesamiento del urdu: la reconstrucción de los signos diacríticos que el texto cotidiano omite y que son necesarios para desambiguar pronunciación y significado.

El modelo se distribuye como artefacto IMF de Secryst y se carga mediante la librería `secryst`, aunque los pesos también están disponibles en formato ONNX en este repositorio de Hugging Face (0,3 GB). Su relevancia actual radica en que supera al campeón anterior de la misma familia (urd-vocalized-1.0, 3,74 % CER) con un CER del 3,641 % sobre el conjunto completo de evaluación, y lo hace con un profesor verificado como libre de contaminación de linaje (clean-room), lo que elimina las dudas sobre derivación de datos licenciados.

La arquitectura subyacente es un transformer encoder-decoder ByT5 (basado en google/byt5-small), un modelo byte a byte sin tokenizador, lo que lo hace robusto ante variaciones ortográficas y errores de codificación del urdu.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder ByT5 (byte-level, sin tokenizador) |
| Parámetros totales | no disponible (inicializado desde google/byt5-small; el tamaño de byt5-small es de aproximadamente 300 M, dato no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (MAXLEN de entrenamiento: 256 bytes) |
| Tipos de cuantización | int8 dinámica (ONNX); referencia fp32 ONNX disponible para paridad |
| Idiomas soportados | urdu (ur) |
| Licencia | BSD-3-Clause (código y pesos) |
| Formato de pesos | ONNX (int8-dynamic y fp32 de referencia); artefacto Secryst IMF `urd-vocalized-2.0-int8-dynamic.zip` (0,24 GiB) |

## Arquitectura y entrenamiento

El modelo es un estudiante ByT5-small destilado a partir de un profesor ByT5-base (run-066-urd-diac-base/best) inicializado desde google/byt5-base y entrenado únicamente con datos de linaje público (data-diacrit). La destilación se realizó sobre 439.786 pares supervisados generados por el profesor a partir de 573.130 filas de origen público, con filtros de invariante semántico y descarte de regurgitación (GUARD_N 8, cero descartes). El entrenamiento se ejecutó en HF Jobs sobre a100-large: 3 épocas, batch size 16 con acumulación 2, learning rate 3e-4 con schedule coseno y 200 pasos de warmup, precisión bf16, longitud máxima de 256 y 41.232 pasos totales.

La innovación técnica principal es el enfoque de destilación clean-room: el profesor original basado en CLE-DAPT (run-092) fue retirado como fuente de etiquetas porque fallaba la puerta calibrada Clause 16(e) en todas las variantes (AUC 0,6319 a 0,6475, señal de memorización transferida a través de los objetivos). El profesor limpio reduce esa señal al azar (AUC 0,4933) mientras mejora la calidad final, lo que demuestra que la validez de los datos y la limpieza del linaje fueron los factores determinantes, no la dinámica de entrenamiento. El modelo se exporta a ONNX int8 dinámico con una paridad verificada frente a la referencia fp32 de 0,0062 puntos porcentuales de CER sobre 600 muestras (umbral de paridad int8: 2,0 pp), con un 0,171 % de cambios de argmax y un 0,105 % de cambios en predicciones confiadas.

## Capacidades

- Diacritización del urdu: convierte texto sin vocales (bare) en texto completamente vocalizado, reconstruyendo los signos diacríticos necesarios para la pronunciación correcta.
- Procesamiento byte-level: al no usar tokenizador, tolera variaciones ortográficas, ruido de codificación y texto no normalizado.
- Salida determinista en modo greedy de una sola fila, adecuada para pipelines de producción reproducibles.
- Inferencia en CPU mediante ONNX Runtime (la paridad reportada se midió en ORT CPU).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo especializado de transformación secuencia a secuencia.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al urdu; no se documenta soporte para otras lenguas.

## Casos de uso

- Vocalización de corpus lingüísticos: procesar grandes volúmenes de texto urdu sin diacríticos para producir corpus anotados con vocales, útil en investigación lingüística y lexicografía. El CER del 3,641 % sobre 11.940 filas lo hace viable para anotación asistida con revisión humana.
- Preprocesamiento para TTS en urdu: la diacritización previa mejora la pronunciación en sistemas de síntesis de voz, ya que los diacríticos determinan las vocales que el motor TTS debe emitir.
- Enseñanza del urdu: generar versiones vocalizadas de textos para estudiantes que aún no dominan la lectura sin diacríticos, con salida determinista y reproducible.
- Normalización en pipelines de OCR: textos obtenidos por reconocimiento óptico de caracteres suelen perder o degradar diacríticos; el modelo los reconstruye antes de la indexación o el análisis.
- Búsqueda y recuperación de información: la vocalización permite desambiguar homógrafos del urdu en índices de búsqueda, mejorando la precisión de coincidencias semánticas.
- Despliegue en entornos con recursos limitados: al ser un ByT5-small cuantizado a int8 (0,24 GiB), puede ejecutarse en CPU sin GPU, lo que facilita su integración en servicios de bajo coste o en el borde.
- Integración en la cadena Secryst: cualquier «crystal» de Secryst puede cargar el artefacto mediante `Model.load("urd-vocalized-2.0")`, lo que permite combinarlo con otras capas fonológicas de la familia.

## Benchmarks y rendimiento

| Benchmark | Valor | Referencia |
|---|---|---|
| CER bruto sobre split completo (11.940 filas, media por fila, protocolo WO37) | 3,641 % | umbral 3,77; campeón anterior urd-vocalized-1.0: 3,74 % |
| Clause 16(e) calibrada, split emparejado (urdu-dev#23/#24/#25/#26) | PASS — AUC 0,4933 (dev 0,0067 ≤ 0,05), self-control 0,5 exacto, success-rate 0,5267 ≤ 0,6 | — |
| Sondas de extracción / verbatim / WordNet | PASS (0 violaciones en las tres) | — |
| Paridad int8-dynamic vs fp32 (greedy, una fila, ORT CPU) | cer_delta 0,0062 pp sobre 600 muestras | umbral int8: 2,0 pp; argmax flips 0,171 %; confident flips 0,105 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto int8 ocupa 0,24 GiB, por lo que la huella de memoria es muy reducida y cabe en CPU.
- GPU recomendadas: no se documentan requisitos de GPU; la evaluación de paridad se realizó en CPU con ONNX Runtime.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del artefacto int8 (0,24 GiB) y el tamaño del estudiante (byt5-small).
- Opciones de despliegue: ONNX Runtime (CPU o GPU), librería Secryst (`Model.load`), artefacto IMF. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (split completo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urd-vocalized-2.0 | no disponible (byt5-small) | MAXLEN 256 en entrenamiento | 3,641 % | BSD-3-Clause | Hugging Face + GitHub Releases |
| urd-vocalized-1.0 | no disponible | no disponible | 3,74 % | no disponible | misma familia Secryst |
| Profesor run-066-urd-diac-base | byt5-base | no disponible | no disponible | no disponible | interno del proyecto de entrenamiento |

No se dispone de datos de otros modelos comparables de diacritización del urdu en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo realiza diacritización del urdu; no es un modelo de propósito general ni admite instrucciones.
- Riesgo de error del 3,641 % CER: aunque bajo, implica que una fracción del texto vocalizado será incorrecta; en aplicaciones críticas se recomienda revisión humana.
- Sesgos: no se documentan análisis de sesgo; el modelo hereda las características del corpus data-diacrit de linaje público.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede producir diacríticos plausibles pero incorrectos en palabras ambiguas u ortografías no vistas.
- Limitación de longitud: el entrenamiento usó MAXLEN 256 bytes; textos más largos deben segmentarse.
- Licencia BSD-3-Clause: permisiva para uso comercial, con obligación de conservar el aviso de copyright y la cláusula de no aval.
- Linaje: el modelo no deriva de contenido CLE (CLE12T003/CLE12L001); la superposición de shingles con el corpus CLE se midió como cero, lo que elimina restricciones de derivación, pero conviene verificar la documentación de atribución de datos si se redistribuye.
- El repositorio muestra 0 descargas y 0 likes, y la fecha de creación es futura (2026-11-24); la madurez y el soporte de la comunidad no están contrastados.

## Enlaces

- Hugging Face: https://huggingface.co/Interscript/urd-vocalized-2.0
- Proyecto Secryst: https://secryst.github.io
- Repositorio de entrenamiento: https://github.com/secryst/secryst-train
- Distribución interscript-ml: https://github.com/interscript/interscript-models
- Documentación de resultados (RESULTS.md, run-096): https://github.com/interscript/interscript-models/blob/main/docs/RESULTS.md
