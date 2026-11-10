# AarthiPalaniraja/apollo-clinical-ner-int8

## Resumen

Apollo Clinical NER INT8 es un modelo de reconocimiento de entidades nombradas (NER) clínicas, publicado en Hugging Face por AarthiPalaniraja bajo el identificador `apollo-clinical-ner-int8`, como parte de la plataforma Apollo Clinical Intelligence Platform v2.1.0. A diferencia de los grandes modelos generativos, es un etiquetador de secuencias compacto pensado para extraer entidades clínicas de notas de evolución de historias clínicas electrónicas (EHR), informes de alta hospitalaria y literatura biomédica, con anclaje a ontologías estándar como SNOMED-CT, RxNorm, LOINC e ICD-10-CM.

El modelo emplea una arquitectura de 2 capas BiLSTM-CRF con cuantización dinámica INT8 del grafo ONNX, orientada a ejecución en CPU con un techo de memoria de menos de 500 MiB y latencia inferior al milisegundo por token. Su propuesta de valor no es la generación de texto, sino la extracción determinista y verificable de spans con offsets de carácter exactos, decodificación Viterbi restringida y resolución de aserciones clínicas (presencia, negación, posible, condicional y antecedente familiar).

Es relevante para equipos que necesitan procesar PHI (información sanitaria protegida) en entornos air-gapped o con requisitos de cero persistencia en disco, ya que permite inferencia offline con verificación SHA-256 y procesamiento volátil en memoria. Su licencia Apache 2.0 facilita la integración comercial, aunque el tamaño del repositorio (0.0 GB) y la ausencia de descargas sugieren un artefacto muy reciente o de disponibilidad limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiLSTM-CRF de 2 capas con cuantización dinámica INT8 del grafo ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (cuantización dinámica del grafo ONNX) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`), tokenizador WordPiece rápido (`clinical_tokenizer.json`) |

## Arquitectura y entrenamiento

La arquitectura es un etiquetador de secuencias BiLSTM-CRF de dos capas, exportado a ONNX y cuantizado dinámicamente a INT8. Incorpora dos innovaciones técnicas destacables: una invariante de offsets de carácter exactos, de modo que para cada span extraído se cumple `raw_text[start_char:end_char] == entity.text` incluso con Unicode, notas multilínea con CRLF y fronteras de subword; y una decodificación Viterbi restringida que enmascara matemáticamente (`-10000.0`) los tokens de continuación WordPiece (`##...`) para que no puedan iniciar etiquetas `B-`, evitando truncamientos de entidad a mitad de palabra.

El anclaje a ontologías es de tipo fail-closed: las menciones clínicas solo se enlazan a terminologías estandarizadas cuando la confianza y la similitud alcanzan el umbral estricto `>= 0.85`. El modelo cubre seis categorías canónicas (condición, medicación, prueba de laboratorio, dosis, vía de administración y frecuencia) y cinco estados de aserción contextual (presente, ausente/negado, posible/hipotético, condicional y antecedente familiar). Los datasets citados en la model card son BC5CDR y NCBI Disease; no se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de entidades clínicas en seis categorías: `COND` (condición), `MED` (medicación), `LAB` (prueba de laboratorio), `DOSE` (dosis), `RTE` (vía de administración) y `FRQ` (frecuencia).
- Anclaje a ontologías: SNOMED-CT e ICD-10-CM para condiciones, RxNorm (RxCUI) para medicaciones, LOINC para analitos de laboratorio y SNOMED-CT para dosis, vías y frecuencias.
- Resolución de aserciones clínicas: `PRS` (presente), `ABS` (ausente/negado), `POS` (posible/hipotético), `CND` (condicional) y `FAM` (antecedente familiar).
- Extracción de relaciones de posología (dosis, vía y frecuencia asociadas a una medicación).
- Garantía de offsets de carácter exactos para cada entidad extraída.
- Decodificación Viterbi restringida con enmascaramiento de tokens de continuación WordPiece.
- Ejecución en CPU con consumo de memoria inferior a 500 MiB y latencia inferior al milisegundo por token.
- Soporte de inferencia offline (`HF_HUB_OFFLINE=1`) con verificación criptográfica SHA-256 y cero persistencia en disco.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-step, visión ni audio; es exclusivamente un etiquetador de tokens.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de entidades en informes de alta hospitalaria: el modelo identifica condiciones, medicaciones, analíticas y posologías en texto libre de resúmenes de alta, con offsets exactos que permiten resaltar las menciones en la interfaz clínica sin desalineaciones.
- Codificación asistida para facturación sanitaria: el anclaje a ICD-10-CM y RxNorm permite proponer códigos de diagnóstico y medicación a partir de notas de evolución, con umbral estricto de confianza (`>= 0.85`) que reduce falsos positivos antes de la revisión humana.
- Detección de negaciones y incertidumbre en notas clínicas: los estados `ABS`, `POS` y `CND` permiten distinguir "niega dolor torácico" de "posible embolia pulmonar", evitando que un sistema posterior trate como confirmado un hallazgo meramente descartado o hipotético.
- Normalización de analíticas para paneles de laboratorio: el mapeo de `LAB` a LOINC facilita agregar resultados de analitos como potasio sérico, troponina o hemoglobina A1c en sistemas de monitorización, incluso cuando el texto usa variantes de nomenclatura.
- Extracción de regimenes farmacológicos: la combinación de `MED`, `DOSE`, `RTE` y `FRQ` permite reconstruir posologías como "metformina 500 mg PO BID" para conciliar la medicación o alimentar registros FHIR R4.
- Procesamiento conforme a privacidad en entornos air-gapped: al ejecutarse en CPU, offline y con cero persistencia en disco, es adecuado para hospitales que procesan PHI en redes aisladas o con requisitos de auditoría estrictos.
- Enriquecimiento de literatura biomédica: los datasets BC5CDR y NCBI Disease lo orientan a la extracción de enfermedades y sustancias químicas en publicaciones, útil para bases de conocimiento y revisiones sistemáticas.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clinical Named Entity Recognition | BC5CDR (test held-out) | Strict Span Micro F1 | 0.9887 |
| Clinical Named Entity Recognition | BC5CDR (test held-out) | Strict Span Micro Precision | 0.9835 |
| Clinical Named Entity Recognition | BC5CDR (test held-out) | Strict Span Micro Recall | 0.9939 |
| Out-of-Domain Clinical EHR Generalization | i2b2 / n2c2 Clinical Discharge Summary Benchmark (test) | Cross-Domain Strict Span F1 (6 categorías) | 0.6000 |
| Out-of-Domain Clinical EHR Generalization | i2b2 / n2c2 Clinical Discharge Summary Benchmark (test) | Cross-Domain Strict Span Precision | 1.0000 |
| Out-of-Domain Clinical EHR Generalization | i2b2 / n2c2 Clinical Discharge Summary Benchmark (test) | Clinical Assertion Accuracy | 1.0000 |

La diferencia entre el F1 in-domain (0.9887) y el cross-domain (0.6000) es notable y sugiere una degradación significativa al generalizar a resúmenes de alta de i2b2/n2c2. La precisión cross-domain de 1.0000 junto con un F1 de 0.6000 implica un recall muy bajo en ese escenario, es decir, el modelo es extremadamente conservador fuera de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecución en CPU con un techo de memoria RSS inferior a 500 MiB.
- GPU recomendadas: no se especifican; el perfil de ejecución declarado es CPU-first con streaming.
- ¿Cabe en GPU consumer? No se proporcionan datos de despliegue en GPU; por tamaño (repo de 0.0 GB y techo de 500 MiB en CPU) sería viable en cualquier GPU consumer, pero no está documentado.
- Opciones de despliegue: `onnxruntime` con `tokenizers` y `numpy` como dependencias mínimas; sesión ONNX con `intra_op_num_threads = 2` y `graph_optimization_level = ORT_ENABLE_ALL` según el ejemplo de la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia inferior al milisegundo por token declarada por el autor; el throughput concreto no está disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los benchmarks del modelo se declaran contra datasets (BC5CDR, i2b2/n2c2) y no contra otros sistemas, por lo que no es posible establecer una comparativa fiable de parámetros, contexto, rendimiento, licencia y disponibilidad frente a alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| apollo-clinical-ner-int8 | no disponible | no disponible | Apache 2.0 | Hugging Face (ONNX) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta inglés (`en`); no se declara capacidad multilingüe.
- Degradación cross-domain documentada: F1 de 0.6000 en i2b2/n2c2 frente a 0.9887 en BC5CDR, con precisión de 1.0000 que indica un recall muy bajo fuera de dominio. No es adecuado para desplegarse sin validación en dominios clínicos distintos de los de entrenamiento.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en la model card; deben tratarse como declaraciones del autor.
- Riesgo de alucinación de anclajes: aunque el anclaje es fail-closed con umbral `>= 0.85`, las menciones por debajo del umbral quedan sin normalizar, lo que puede producir entidades sin código de ontología.
- Sesgos conocidos: no disponibles en la información proporcionada; cabe esperar sesgos derivados de los datasets BC5CDR y NCBI Disease, orientados a literatura biomédica y no a notas clínicas reales.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que puede indicar disponibilidad limitada del artefacto o falta de validación por la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, el tratamiento de PHI exige cumplimiento normativo adicional (por ejemplo, HIPAA o RGPD) que el modelo no resuelve por sí mismo.
- No es un modelo generativo: no debe esperarse de él resumen, respuesta a preguntas ni razonamiento; su función es exclusivamente el etiquetado de tokens.

## Enlaces

- Hugging Face: https://huggingface.co/AarthiPalaniraja/apollo-clinical-ner-int8
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
