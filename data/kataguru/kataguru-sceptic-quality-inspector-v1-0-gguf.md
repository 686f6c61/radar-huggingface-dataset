# kataguru/Kataguru-Sceptic-Quality-Inspector-v1.0-GGUF

## Resumen

Kataguru Sceptic Quality Inspector v1.0 es un modelo de generación de texto en formato GGUF desarrollado por el usuario kataguru, especializado en tareas de auditoría epistémica, control de calidad y evaluación automática (LLM-as-a-Judge o inspector de datos sintéticos). Está construido sobre la arquitectura Qwen 3.5 35B-A3B, un transformer de tipo mezcla de expertos (MoE) con aproximadamente 35.500 millones de parámetros totales y unos 3.000 millones activos por token, según los datos declarados en la model card.

El modelo parte de una base denominada Sceptic v3.5 BF16 y añade un entrenamiento curricular de calidad de 1029 pasos que sigue la lógica DETECT → VERIFY → VERDICT (detectar, verificar, dictaminar). La model card afirma que alcanza un 71,80 % en una batería oficial de 11 tareas, con un 90,07 % en GSM8K en modo CoT, y que genera finlandés sin errores en los casos evaluados. Incluye soporte multimodal mediante un proyector `mmproj` (OCR y análisis de imagen) y capas de decodificación especulativa MTP.

Su relevancia actual reside en que combina un perfil MoE de bajo coste por token con cuantizaciones optimizadas para GPU de consumo (12-24 GB de VRAM) y una función concreta y poco habitual: actuar como juez o inspector de calidad de otros datos o respuestas, con licencia Apache 2.0 y plena compatibilidad con llama.cpp, LM Studio y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 35B-A3B MoE (mezcla de expertos) |
| Parametros totales | 35.505.251.456 (~35,5 mil millones) |
| Parametros activos | ~3 mil millones por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX-Medium (3,28 bpw), APEX-Good (3,71 bpw), APEX-Small (2,92 bpw), imatrix; ficheros MTP en Q4_K_M y Q8_0; mmproj en F16 |
| Idiomas soportados | finlandes (fi) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versiones cuantizadas); BF16 en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de mezcla de expertos (MoE) heredada de Qwen 3.5 35B-A3B: 35,5 mil millones de parámetros totales con aproximadamente 3 mil millones activos por token, lo que reduce el coste de cómputo por token frente a un modelo denso equivalente. Sobre esta base se ha aplicado un entrenamiento de calidad descrito como curricular, de 1029 pasos, orientado a la lógica de inspección en tres fases (DETECT → VERIFY → VERDICT) y a una política de juicio explícitamente "no compensatoria" (es decir, sin compensar defectos con virtudes al emitir un veredicto), según la model card.

El modelo base declarado es Sceptic v3.5 BF16, que a su vez se describe como proveniente de "STEM Math 3.ª ola" y de la línea "v3.4 Diabolical Immunity". La tarjeta menciona también capas de decodificación especulativa NextN/MTP integradas y disponibles como ficheros draft independientes, así como el uso de una matriz de calibración imatrix propia (`sceptic_v3.4.imatrix`) para las cuantizaciones. No se detallan en la información proporcionada el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en finlandés e inglés, con especial atención a la corrección morfológica del finlandés (casos gramaticales, rección, palabras compuestas), según la model card.
- Razonamiento y matemáticas: la tarjeta reporta GSM8K con CoT al 90,07 % y mejoras notables en ARC-Challenge y ARC-Easy.
- Evaluación automática tipo LLM-as-a-Judge: auditoría epistémica y detección de defectos mediante el flujo DETECT → VERIFY → VERDICT.
- Inspección de datos sintéticos (Synthetic Data Inspector) y control de calidad de respuestas generadas por otros modelos.
- Multimodalidad y visión mediante el proyector `mmproj`: OCR y análisis de imagen, con soporte declarado para finlandés.
- Decodificación especulativa mediante capas MTP/NextN, disponible como fichero separado para acelerar la inferencia.
- Conocimiento orientado a STEM y medicina (MedQA/USMLE con un 84,84 % declarado).
- No se documenta explícitamente en la información disponible soporte de tool calling o function calling, ni capacidades de audio.

## Casos de uso

- Auditoría de datos sintéticos: el modelo puede actuar como juez que revisa pares instrucción-respuesta generados por otros modelos, aplicando el flujo DETECT → VERIFY → VERDICT para descartar muestras defectuosas antes de reentrenar.
- Control de calidad editorial en finlandés: verificación de textos académicos o técnicos en finés, donde la corrección de casos y compuestos es crítica y donde el modelo declara un 100 % de corrección en los casos evaluados.
- Evaluación automática de asistentes (LLM-as-a-Judge): puntuación de respuestas de otros modelos en pipelines de evaluación offline, con la ventaja de un coste por token bajo gracias al perfil MoE de ~3 B activos.
- OCR y extracción de información de documentos escaneados: uso combinado del modelo con el proyector `mmproj` para leer imágenes y analizar su contenido, útil en digitalización de archivos en finés o inglés.
- Despliegue en estaciones de trabajo de gama alta con GPU de consumo: las cuantizaciones APEX permiten ejecutar el modelo en tarjetas de 12, 16 o 24 GB de VRAM, lo que facilita su uso en entornos de desarrollo sin infraestructura de centro de datos.
- Razonamiento STEM como verificador: comprobación de soluciones matemáticas y de problemas de física o ciencias, apoyándose en su rendimiento declarado en GSM8K, ARC y PIQA.
- Filtrado de contenido y moderación con enfoque "uncensored": al estar etiquetado como uncensored, puede emplearse para etiquetar o clasificar contenido sensible en lugar de para generarlo, siempre con las cautelas legales y éticas correspondientes.
- Generación asistida en pipelines de CI/CD: dado su tamaño moderado en cuantización, puede integrarse como paso de revisión textual en flujos automatizados, aunque no se documenta tool calling nativo.

## Benchmarks y rendimiento

Resultados declarados en la model card, medidos sobre "2x RTX 5090 Blackwell TP=2" y comparados con Sceptic v3.5, Sceptic v3.4 y Qwen 3.8 Base (27B dense). Los datos se reproducen tal cual los publica el autor; no se han verificado de forma independiente.

| # | Tarea | Metrica | Quality Inspector v1.0 | Sceptic v3.5 | Delta vs v3.5 | Sceptic v3.4 | Qwen 3.8 Base 27B |
|---|---|---|---|---|---|---|---|
| 1 | GSM8K Math (CoT) | Exact Match | 90,07 % | 70,20 % | +19,87 % | 68,23 % | 73,10 % |
| 2 | BoolQ | Acc | 90,49 % | 88,29 % | +2,20 % | 88,59 % | 89,20 % |
| 3 | WinoGrande | Acc | 75,14 % | 73,40 % | +1,74 % | 72,77 % | 77,30 % |
| 4 | TruthfulQA MC1 | Acc | 37,82 % | 35,99 % | +1,83 % | 35,62 % | 34,60 % |
| 5 | TruthfulQA MC2 | Prob. | 53,51 % | 52,57 % | +0,94 % | 52,46 % | 51,10 % |
| 6 | ARC-Challenge | Acc_norm | 64,76 % | 57,08 % | +7,68 % | 57,25 % | 66,50 % |
| 7 | ARC-Easy | Acc_norm | 83,33 % | 75,13 % | +8,20 % | 75,29 % | 85,40 % |
| 8 | PIQA | Acc_norm | 82,75 % | 82,37 % | +0,38 % | 82,81 % | 81,80 % |
| 9 | OpenBookQA | Acc_norm | 45,60 % | 45,60 % | ±0,00 % | 45,20 % | 45,10 % |
| 10 | MedQA | Acc (4 opciones) | 84,84 % | 85,47 % | -0,63 % | 85,86 % | 82,64 % |
| 11 | HellaSwag | Acc_norm | 81,50 % | 82,82 % | -1,32 % | 82,74 % | 83,90 % |
| Σ11 | Media de 11 tareas | — | 71,80 % | 68,08 % | +3,72 % | 70,10 % | 70,06 % |

No se han proporcionado, en la información disponible, resultados de HumanEval, MMLU, MT-Bench ni evaluaciones independientes de terceros.

## Requisitos de hardware

- APEX-Small: ~12,1 GiB, 2,92 bpw, recomendado para GPU de 12 GB (RTX 3060 12GB, RTX 4070 12GB, RTX 5070 12GB). Attention en Q5_K/Q4_K, expertos en IQ3_S/IQ2_S.
- APEX-Medium: ~13,6 GiB, 3,28 bpw, perfil recomendado (sweet spot) para 16 GB de VRAM (RTX 4080, RTX 5060 Ti 16GB); deja en torno a 2,4 GiB libres para contexto amplio.
- APEX-Good: ~15,4 GiB, 3,71 bpw, orientado a máxima calidad en GPU de 16 GB al límite o de 24 GB o más (RTX 3090, 4090, 5090).
- Proyector multimodal `mmproj` (F16): 902 MiB adicionales sobre la VRAM del modelo principal.
- Capa MTP de decodificación especulativa: 1,26 GiB en Q4_K_M o 1,99 GiB en Q8_0, si se desea activar la decodificación especulativa.
- Matriz `quality_inspector.imatrix`: 184 MiB (no es necesario cargarla en VRAM para inferencia; sirve para reproducir las cuantizaciones).
- Cabe en GPU de consumo: sí, en las tres configuraciones APEX; la opción de 12 GB es la más ajustada.
- Despliegue: llama.cpp (b11064 o superior), LM Studio y Ollama, según la model card. No se mencionan explícitamente vLLM o TGI, y al tratarse de pesos GGUF la integración natural es llama.cpp y sus derivados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad | Datos declarados (Σ11) |
|---|---|---|---|---|---|---|
| Kataguru Sceptic Quality Inspector v1.0 | 35,5 B (~3 B activos) | MoE | no disponible | Apache 2.0 | GGUF (HF) | 71,80 % |
| Sceptic v3.5 | no disponible | no disponible | no disponible | no disponible | referenciado como modelo base | 68,08 % |
| Sceptic v3.4 Diabolical | no disponible | no disponible | no disponible | no disponible | no disponible | 70,10 % |
| Qwen 3.8 Base (27B Dense) | 27 B densos | Transformer denso | no disponible | no disponible | no disponible | 70,06 % |

La comparativa se limita a los modelos citados en la model card del autor; no se dispone de datos independientes para validar estos números ni de otras alternativas comparables de la misma categoría (inspectores o jueces LLM en GGUF).

## Limitaciones y advertencias

- No hay verificacion independiente: todos los benchmarks y afirmaciones (100 % de finlandes correcto, 71,80 % global) proceden de la model card del autor.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe todavia validacion por parte de la comunidad.
- Cobertura lingueistica limitada a finlandes e ingles; no se declaran otros idiomas.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con entradas largas.
- La etiqueta "uncensored" implica que el modelo puede generar contenido que otros alinearian o rechazarian; conviene aplicar filtros propios en produccion.
- Riesgo de alucinacion no cuantificado: no se aportan datos de evaluacion de factualidad mas alla de TruthfulQA (37,82 % en MC1), que es un resultado modesto en terminos absolutos.
- En las tareas HellaSwag y MedQA el modelo queda ligeramente por debajo de sus predecesores segun los propios datos del autor.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base (Sceptic v3.5 / Qwen 3.5) conviene verificar las condiciones de dichos antecesores, que no se detallan en la informacion disponible.
- Las cuantizaciones APEX-Small (2,92 bpw) y APEX-Medium (3,28 bpw) pueden degradar la calidad respecto a BF16; el autor no publica metricas por cuantizacion.
- Al ser un modelo GGUF, no es compatible directamente con stacks como vLLM o TGI sin conversion adicional.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/kataguru/Kataguru-Sceptic-Quality-Inspector-v1.0-GGUF
- Modelo base declarado: kataguru/Kataguru-Sceptic-Quality-Inspector-v1.0-BF16
- Ficheros asociados citados en la model card: `mmproj-Kataguru-Sceptic-Quality-Inspector-v1.0-f16.gguf`, `mtp-Kataguru-Sceptic-Quality-Inspector-v1.0-Q4_K_M.gguf`, `mtp-Kataguru-Sceptic-Quality-Inspector-v1.0-Q8_0.gguf`, `quality_inspector.imatrix`
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo o demos adicionales.
