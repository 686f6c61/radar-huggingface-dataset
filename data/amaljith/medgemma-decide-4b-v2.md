# Amaljith/medgemma-decide-4b-v2

## Resumen

medgemma-decide-4b-v2 es un modelo de decisión tipado (typed decision model) derivado de MedGemma 1.5 4B IT mediante un ajuste fino con LoRA. Lo desarrolla el usuario Amaljith y su función no es generar texto, sino leer un texto médico junto con un conjunto de preguntas tipadas y devolver, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Es decir, transforma el modelo generativo base en un clasificador multi-etiqueta con cabecera de decisión y temperaturas de calibración por pregunta.

La versión v2 corrige el fallo de la v1 en la puerta de calidad sobre la pregunta `medline/adverse`: el 92 % de las filas de entrenamiento respondían "no", lo que hundía la balanced accuracy a 0,625 por debajo del baseline TF-IDF (0,721). La solución fue reentrenar un LoRA nuevo (r=16, alpha=16, una época) sobre el checkpoint fusionado de v1 añadiendo 1.156 filas sobremuestreadas de las clases minoritarias de cinco preguntas sesgadas. El resultado es una balanced accuracy de 0,825 en esa pregunta y un PASS global en la puerta de release.

El modelo tiene 4.300.079.472 parámetros, se distribuye en safetensors con un repositorio de 9,0 GB y está pensado exclusivamente para investigación bajo los términos HAI-DEF de Google. No es un dispositivo médico y no debe usarse para diagnóstico, triaje ni atención clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con cabecera de decisión tipada sobre el modelo base MedGemma 1.5 4B IT |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la v1 se evaluó con adaptador en 4 bits; v2 se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | health-ai-developer-foundations (HAI-DEF, "other") |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | unsloth/medgemma-1.5-4b-it (finetune) |
| Dataset de entrenamiento | Amaljith/medical-typed-decisions |
| Tamano del repositorio | 9,0 GB |

## Arquitectura y entrenamiento

El modelo parte de MedGemma 1.5 4B IT, un transformer decoder-only de la familia Gemma 3, y lo convierte en un decisor tipado: recibe un texto médico y un conjunto de preguntas con opciones discretas, y emite una probabilidad por opción en un solo forward pass, sin decodificación autoregresiva. Sobre el checkpoint fusionado de la v1 se aplicó un LoRA nuevo con r=16, alpha=16, learning rate 5e-5 (1e-4 para la cabecera), batch 16x2 y semilla 3407, durante una época y 728 pasos, en 51,7 minutos sobre una A100 de 80 GB con Unsloth 2026.10.8 y el formato de turnos de Gemma.

Los datos son el mismo split de entrenamiento de 22.132 filas más 1.156 filas sobremuestreadas de las clases minoritarias de cinco preguntas sesgadas (`medline/adverse`, `group_infants`, `group_children`, `group_adolescents`, `drug_therapy`), elevadas hasta aproximadamente el 35 % de su pregunta. Además se reajustaron las temperaturas de calibración por pregunta sobre el split de calibración (2.963 decisiones) y se incluyen en `decision_format.json`. La evaluación se realizó sobre el split de test (15.320 registros, 19.480 decisiones) con `eval.py` del dataset. No se documenta RLHF ni DPO; el ajuste es supervisado con calibración posterior.

## Capacidades

- Clasificación médica multi-pregunta: devuelve probabilidad por opción para preguntas tipadas sobre textos biomédicos en un único forward pass.
- Decisiones calibradas: temperaturas por pregunta ajustadas sobre split de calibración, con ECE entre 0,011 y 0,080 en las preguntas evaluadas.
- Preguntas de tipo sí/no: `medline/adverse`, `medline/animals`, `medline/drug_therapy`, `medline/humans`.
- Preguntas de grupo poblacional: `group_infants`, `group_children`, `group_adolescents`, `group_adults`, `group_older_adults`, `group_female`, `group_male`.
- Preguntas de diseño de estudio (`medline/design`) y área de enfermedad (`medline/disease_area`, ~19 clases).
- Preguntas de examen médico: `medmcqa/answer`, `medmcqa/subject`, `medqa/answer`, `pubmedqa/answer`.
- Pregunta de diagnóstico a partir de síntomas (`symptoms/diagnosis`).
- No genera texto libre; su salida es una distribución de probabilidad sobre opciones predefinidas.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en esta variante.

## Casos de uso

- Filtrado de literatura biomédica: clasificar abstracts de MEDLINE según si describen eventos adversos, humanos o animales, o área de enfermedad, usando las probabilidades calibradas para priorizar revisiones manuales.
- Enriquecimiento de bases de datos clínicas: etiquetar automáticamente registros con grupo poblacional (infantes, niños, adolescentes, adultos, mayores) y sexo para segmentar cohortes en estudios observacionales.
- Detección de terapia farmacológica: identificar si un texto menciona tratamiento con fármacos (`medline/drug_therapy`) como paso previo a la extracción de entidades en pipelines de farmacovigilancia.
- Triaje de preguntas de examen médico: usar `medmcqa/answer` y `medqa/answer` para predecir la opción correcta en bancos de preguntas, con la ventaja de obtener una probabilidad calibrada en lugar de una respuesta generada.
- Apoyo a la revisión sistemática: combinar varias preguntas tipadas sobre el mismo texto para construir una ficha estructurada del estudio (diseño, población, intervención) sin generación de texto.
- Clasificación de evidencia en PubMed: aplicar `pubmedqa/answer` para etiquetar si un abstract respalda, refuta o no concluye sobre una hipótesis, con ECE de 0,054.
- Señal auxiliar en sistemas de decisión clínica en investigación: aportar probabilidades calibradas como feature de un modelo posterior, nunca como decisión clínica directa.

## Benchmarks y rendimiento

Resultados sobre el split de test de `Amaljith/medical-typed-decisions` (15.320 registros, 19.480 decisiones). La balanced accuracy usa la decisión ajustada por prior (se dividen las cuotas de respuesta del entrenamiento).

| Pregunta | n | Bal. acc. v1 | Bal. acc. v2 | Accuracy v2 | ECE v2 | Gate |
|---|---:|---:|---:|---:|---:|---|
| `medline/adverse` | 1500 | 0,625 | 0,825 | 0,903 | 0,026 | pass |
| `medline/animals` | 1500 | 0,896 | 0,918 | 0,927 | 0,021 | pass |
| `medline/design` | 605 | 0,796 | 0,876 | 0,945 | 0,037 | no gated |
| `medline/disease_area` | 314 | 0,952 | 0,572 | 0,943 | 0,028 | no gated |
| `medline/drug_therapy` | 1500 | 0,791 | 0,886 | 0,914 | 0,017 | pass |
| `medline/group_adolescents` | 356 | 0,668 | 0,774 | 0,862 | 0,049 | pass |
| `medline/group_adults` | 313 | 0,823 | 0,833 | 0,818 | 0,051 | pass |
| `medline/group_children` | 322 | 0,881 | 0,917 | 0,935 | 0,050 | pass |
| `medline/group_female` | 304 | 0,828 | 0,822 | 0,826 | 0,060 | pass |
| `medline/group_infants` | 308 | 0,750 | 0,940 | 0,984 | 0,023 | no gated |
| `medline/group_male` | 335 | 0,869 | 0,866 | 0,866 | 0,060 | pass |
| `medline/group_older_adults` | 316 | 0,835 | 0,831 | 0,864 | 0,077 | pass |
| `medline/humans` | 1500 | 0,912 | 0,925 | 0,932 | 0,011 | pass |
| `medmcqa/answer` | 4162 | 0,508 | 0,507 | 0,509 | 0,080 | pass |
| `medmcqa/subject` | 4160 | 0,677 | 0,717 | 0,687 | 0,027 | no gated |
| `medqa/answer` | 1273 | 0,602 | 0,609 | 0,611 | 0,052 | pass |
| `pubmedqa/answer` | 500 | 0,578 | 0,488 | 0,738 | 0,054 | pass |
| `symptoms/diagnosis` | 212 | 0,855 | 0,876 | 0,877 | 0,066 | no gated |

Macro sobre fuentes (balanced accuracy): 0,686 (v1: 0,689). Release gate: PASS (v1: FAILED en `medline/adverse`).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9 GB solo para pesos (4,3 B parámetros), más overhead de activaciones y cabecera; se recomienda al menos 16 GB para trabajar con comodidad.
- En cuantización de 8 bits cabría en GPUs de 12-16 GB; en 4 bits, en GPUs de 8 GB, aunque el autor no publica cuantizaciones oficiales de v2 ni datos de latencia.
- GPU recomendadas: A100-80GB es la que se usó para el entrenamiento (728 pasos en 51,7 minutos); para inferencia, cualquier GPU con suficiente VRAM (A100, H100, L40S, RTX 4090 de 24 GB).
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (24 GB) y en RTX 3090/4080 con cuantización; no hay datos oficiales de despliegue en consumer.
- Opciones de despliegue: transformers (librería declarada); al ser un modelo de clasificación con cabecera propia, vLLM, llama.cpp u Ollama no son directamente aplicables sin adaptación. No se documenta soporte en TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medgemma-decide-4b-v2 | 4,3 B | no disponible | Clasificación médica tipada con probabilidades calibradas | HAI-DEF | Hugging Face |
| medgemma-decide-4b (v1) | 4,3 B | no disponible | Igual que v2 | HAI-DEF | Hugging Face |
| unsloth/medgemma-1.5-4b-it | ~4 B | no disponible | Generación image-text-to-text médica | HAI-DEF (Gemma) | Hugging Face |
| Baseline TF-IDF (referencia del autor) | n/a | n/a | Clasificación de texto médico | n/a | no disponible como modelo publicado |

La comparación relevante es con la v1 del mismo autor: v2 mejora en 12 de las 18 preguntas, con la mayor ganancia en `medline/adverse` (+0,200 de balanced accuracy) y `medline/group_infants` (+0,190), y empeora en `medline/disease_area` (−0,380) y `pubmedqa/answer` (−0,090). No se dispone de comparación con otros clasificadores médicos publicados.

## Limitaciones y advertencias

- No es un dispositivo médico: prohibido su uso para diagnóstico, triaje, decisiones clínicas o atención al paciente. Solo investigación.
- Licencia HAI-DEF: uso comercial sujeto a los términos de Google Health AI Developer Foundations; revisar `NOTICE` y el enlace de licencia antes de cualquier despliegue.
- Regresión documentada en `medline/disease_area`: balanced accuracy cae de 0,952 a 0,572 aunque la accuracy apenas cambia (0,943), porque varias de sus ~19 clases tienen 1-4 filas de test y la regla ajustada por prior oscila en clases pequeñas.
- Regresión en `pubmedqa/answer`: balanced accuracy baja de 0,578 a 0,488 con la regla ajustada por prior (argmax simple 0,561), aunque sigue pasando la puerta.
- El conocimiento médico no mejora respecto a v1: `medmcqa/answer` (0,507) y `medqa/answer` (0,609) se mantienen, porque una época adicional corrige decisiones, no añade conocimiento.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí de calibración defectuosa fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados; el entrenamiento y la evaluación son en inglés médico.
- Sesgos de prevalencia: las preguntas sesgadas se corrigieron por sobremuestreo, pero otras preguntas pueden mantener desequilibrios no tratados.
- No se publican datos de contexto máximo ni de cuantizaciones oficiales; la integración en pipelines de producción requiere validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amaljith/medgemma-decide-4b-v2
- Versión v1: https://huggingface.co/Amaljith/medgemma-decide-4b
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/Amaljith/medical-typed-decisions
- Modelo base: https://huggingface.co/unsloth/medgemma-1.5-4b-it
- Licencia HAI-DEF: https://developers.google.com/health-ai-developer-foundations/terms
- ML Intern (herramienta citada por el autor): https://hf.co/chat?mode=ml-intern
