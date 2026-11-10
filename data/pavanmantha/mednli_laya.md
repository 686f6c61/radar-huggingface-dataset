# pavanmantha/mednli_laya

## Resumen

`mednli_laya` es un modelo de clasificación de texto en inglés especializado en verificación de afirmaciones médicas (claim verification). Se trata de un fine-tuning del checkpoint `convaiinnovations/laya` (etiquetado como "multilingual" en la model card) sobre el conjunto de datos MedNLI, donde las etiquetas originales de entailment, neutral y contradiction se mapean a tres clases: `supported`, `unsupported` y `contradicted`. Lo desarrolla Pavan Kumar Mantha y se publica bajo licencia Apache 2.0.

El modelo resuelve una tarea concreta: dado un claim clínico y un fragmento de evidencia, determinar si la evidencia confirma, no alcanza a confirmar/negar, o contradice el claim. Con 321.908.998 parámetros y un tamaño de repositorio de 0,7 GB, es un modelo compacto pensado para integrarse en pipelines de verificación factual en dominios clínicos.

Su relevancia radica en que, según los datos declarados por el autor, mejora sustancialmente el rendimiento del checkpoint base en MedNLI (de 0,4494 a 0,7904 de accuracy en el split de test) y presenta una calibración notablemente mejor (ECE de 0,0424 frente a 0,2610 del original), lo que resulta crítico en aplicaciones médicas donde la confianza del modelo debe ser fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de `convaiinnovations/laya`, librería `laya`) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `convaiinnovations/laya`, cargado a través de la librería `laya` y expuesto mediante una API de "decision model" con preguntas tipadas (`choice`). La model card no detalla la arquitectura interna del checkpoint base (transformer, MoE u otra), por lo que este dato no está disponible. El fine-tuning se realizó sobre MedNLI (`presencesw/mednli`), con 10.819 ítems de entrenamiento, 401 de calibración y 1.395 de validación; se descartaron 9 filas por etiquetas conflictivas y 3 por duplicados.

El entrenamiento usó cross-entropy sobre etiquetas duras, con el orden de las opciones barajado y cuatro formulaciones de pregunta rotativas, además de un aumento de datos con evidencia no emparejada (15 % de las filas por época). La mejor época fue la 2 de 6, con batch efectivo de 64, learning rates de 2,5e-05 para el encoder y 1e-04 para la cabeza, sin label smoothing y con semilla 0. Se ajustó una temperatura de elección de 1,256 sobre 1.604 ítems de calibración separados por premisa, lo que movió el NLL de 0,4458 a 0,433 en esa porción. La validación pasó de 0,4317 de accuracy antes del fine-tuning a 0,8075 en la mejor época.

## Capacidades

- Verificación de afirmaciones médicas en tres clases: `supported`, `unsupported` y `contradicted`.
- Clasificación de texto (pipeline `text-classification`) con salida de elección tipada.
- Razonamiento de tipo NLI (natural language inference) adaptado al dominio clínico.
- Manejo de preguntas con criterios explícitos definidos por el usuario en la llamada.
- Robustez frente al orden de opciones: tasa de cambio de 0,0155 al invertir el orden (frente a 0,0816 del modelo original).
- Detección de evidencia no emparejada: 0,7398 de respuestas `unsupported` ante evidencia no relacionada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Verificación de resúmenes clínicos: dado un resumen generado automáticamente y las notas de origen, el modelo etiqueta cada afirmación como respaldada, no respaldada o contradicha, lo que permite filtrar alucinaciones en pipelines de generación aumentada por recuperación (RAG) médicos.
- Control de calidad de informes: integrado en un flujo de revisión, compara afirmaciones de un informe con el texto de la historia clínica y señala contradicciones para revisión humana.
- Preguntas y respuestas con atribución: en un sistema de QA clínico, el modelo actúa como verificador final que comprueba si la respuesta propuesta está soportada por el pasaje recuperado antes de mostrarla al usuario.
- Filtrado de literatura biomédica: para cada afirmación extraída de un artículo, se contrasta con fragmentos de evidencia recuperados y se descartan las no soportadas.
- Anotación asistida de datasets NLI clínicos: el modelo puede preetiquetar pares claim-evidencia con alta calibración (ECE de 0,0424), reduciendo el coste de anotación humana en la construcción de corpus.
- Monitorización de consistencia documental: en entornos de codificación clínica, verifica que las afirmaciones de un documento concuerdan con la evidencia registrada en otro, marcando discrepancias.
- Evaluación de sistemas de extracción de información: se usa como juez automático para medir si las extracciones de un pipeline están respaldadas por el texto fuente.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de MedNLI (n=1422, accuracy aleatoria 0,3333). La formulación de la pregunta usada en la evaluación no se vio en entrenamiento.

| Modelo | Accuracy (IC 95 %) | Macro-F1 | NLL | Brier | ECE | Confianza media | ms/decisión |
|---|---|---|---|---|---|---|---|
| original | 0,4494 (0,4226-0,4761) | 0,4156 | 1,3686 | 0,7485 | 0,2610 | 0,7103 | 0,84 |
| este modelo | 0,7904 (0,7693-0,8129) | 0,7909 | 0,5039 | 0,2863 | 0,0424 | 0,8261 | 0,92 |

Pruebas de robustez:

| Modelo | Tasa de cambio por orden de opciones | Accuracy solo con claim (IC 95 %) | Evidencia no emparejada respondida como unsupported | Accuracy con formulación de entrenamiento |
|---|---|---|---|---|
| original | 0,0816 | 0,3361 (0,3101-0,3608) | 0,8509 | 0,4142 |
| este modelo | 0,0155 | 0,4114 (0,3861-0,4367) | 0,7398 | 0,7996 |

Resultados por clase (este modelo):

| Etiqueta | Precisión | Recall | F1 |
|---|---|---|---|
| supported | 0,7810 | 0,7300 | 0,7546 |
| unsupported | 0,7215 | 0,7869 | 0,7528 |
| contradicted | 0,8766 | 0,8544 | 0,8654 |

Matriz de confusión (filas = etiqueta real, columnas = predicción):

| | supported | unsupported | contradicted |
|---|---|---|---|
| supported | 346 | 98 | 30 |
| unsupported | 74 | 373 | 27 |
| contradicted | 23 | 46 | 405 |

Prueba de McNemar exacta frente al modelo original sobre los mismos ítems: corrigió 581 errores e introdujo 96 (p = 1,8e-85). Varianza entre semillas (2 semillas): accuracy 0,7904 ± 0,0000, macro-F1 0,7911 ± 0,0001, ECE 0,0367 ± 0,0057.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321,9 M de parámetros, en fp32 ocupa aproximadamente 1,3 GB de pesos; en fp16/bf16 unos 0,65 GB. No se han publicado cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre debería ser suficiente; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño (el repo pesa 0,7 GB), aunque no se detallan requisitos oficiales.
- Opciones de despliegue: la model card solo documenta la librería `laya` (`laya.load` y `agent.predict`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 0,92 ms por decisión en el benchmark de MedNLI (frente a 0,84 ms del original). No hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy MedNLI (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pavanmantha/mednli_laya` | 321,9 M | no disponible | 0,7904 | Apache 2.0 | Hugging Face |
| `convaiinnovations/laya` (base) | no disponible | no disponible | 0,4494 | no disponible en la información | Hugging Face |
| Otros modelos NLI médicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con frases cortas de notas clínicas; la precisión sobre pasajes largos de guías clínicas no está evaluada.
- Solo inglés; no se reevaluaron otros tipos de pregunta de Laya tras el fine-tuning.
- Resultados únicamente en MedNLI; no se ha ejecutado ningún benchmark fuera de dominio.
- No es un dispositivo médico ni debe usarse para decisiones clínicas.
- Accuracy solo con claim de 0,4114, por encima del azar, lo que indica que el modelo puede explotar artefactos de los propios claims (propiedad conocida de MedNLI).
- Tasa de respuesta `unsupported` ante evidencia no emparejada de 0,7398, inferior a la del modelo original (0,8509): puede ser más propenso a aceptar evidencia irrelevante como válida.
- La varianza entre semillas reportada es muy baja (solo 2 semillas), lo que limita la estimación de estabilidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni en dominios distintos de MedNLI.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavanmantha/mednli_laya
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset MedNLI: https://huggingface.co/datasets/presencesw/mednli
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
