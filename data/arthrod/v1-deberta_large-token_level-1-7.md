# arthrod/v1-deberta_large-token_level-1-7

## Resumen

`arthrod/v1-deberta_large-token_level-1-7` es un modelo de reconocimiento de entidades con nombre (NER) especializado en deteccion de informacion personal identificable (PII) en portugues de Brasil, construido con la libreria GLiNER sobre un backbone DeBERTa-v3-large. Lo publica el usuario `arthrod` como ajuste fino supervisado de `knowledgator/gliner-pii-large-v1.0`, y su tarea es la clasificacion a nivel de token: localizar spans exactos de PII y asignarles una de las 23 etiquetas del conjunto canonico en pt-BR. El modelo esta marcado explicitamente como *legacy* y *superseded* por el propio autor, que recomienda usar alternativas mas recientes de su suite.

El dato diferencial de este checkpoint frente al resto de repos legados del mismo grupo es que es el unico acompanado de metricas de tarea publicadas. Alcanza un F1 de 0,730 en el conjunto canonico PT-BR de 23 etiquetas (frente a 0,459 del modelo base) y un F1 de 0,627 en `nvidia/Nemotron-PII` (frente a 0,581 del base), aunque pierde rendimiento en conjuntos de NER general y multilingue. Se entreno durante 8.000 pasos de los 15.000 planificados (1,44 epocas) sobre aproximadamente 1,03 millones de ejemplos sinteticos de PII generados internamente, en una sesion documentada del 24 de febrero de 2026 sobre hardware MI300X.

Su relevancia actual es fundamentalmente de trazabilidad: mantiene un DOI (`10.57967/hf/8522`) y sirve como referencia historica de la linea de experimentos `gliner-pii-large-full-v1`. Para despliegues reales de deteccion de PII en portugues de Brasil, el propio autor redirige a `arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1` o a `arthrod/gliner-opf-ptbr-pii-v1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER a nivel de token (token-level) sobre backbone transformer encoder DeBERTa-v3-large |
| Parametros totales | no disponible (la model card identifica el backbone DeBERTa-v3-large, pero no declara el recuento total del conjunto GLiNER) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones concretas) |
| Idiomas soportados | portugues (pt, con foco en pt-BR) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch y ONNX (segun los tags del repositorio); safetensors no confirmado explicitamente |
| Pipeline | token-classification |
| Libreria | gliner |
| Modelo base | knowledgator/gliner-pii-large-v1.0 (relacion: finetune) |
| DOI | 10.57967/hf/8522 |
| Tamano del repositorio | 31,7 GB |
| Descargas / likes | 59 / 0 |
| Fecha de creacion | 2026-02-24 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

El modelo es un GLiNER de tipo token-level: en lugar de una cabeza de clasificacion cerrada, combina un encoder de texto (DeBERTa-v3-large, con atencion desenrollada y mecanismo de disentangled attention propio de la familia DeBERTa) con un encoder de etiquetas, de forma que las entidades se reconocen comparando representaciones de spans con representaciones de los tipos de entidad proporcionados en tiempo de inferencia. Esta formulacion permite trabajar con esquemas de etiquetas flexibles y con las 23 etiquetas canonicas de PII en pt-BR usadas en la evaluacion. El autor etiqueta el repo simultaneamente con `deberta-v2` y `deberta-v3`, siendo `deberta-v3` el backbone declarado en el texto de la model card.

El ajuste fino parte de `knowledgator/gliner-pii-large-v1.0` y se ejecuto sobre aproximadamente 1,03 millones de ejemplos sinteticos de PII generados internamente, correspondientes a 1,44 epocas de un plan de 15.000 pasos que se detuvo manualmente en el paso 8.000. La sesion esta documentada como correspondiente al 24 de febrero de 2026, run `gliner-pii-large-full-v1`, configuracion `vanilla_f`, en el repositorio de bitacora `arthrod/attempt_vanilla`. El repositorio se publico originalmente como `arthrod/gliner-pii-large-full-v1`, URL que sigue redirigiendo al actual. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa; el sufijo `1-7` del nombre no aparece explicado en ninguna parte del repositorio.

## Capacidades

- Deteccion de PII a nivel de token con spans exactos y etiqueta asociada, sobre un esquema canonico de 23 etiquetas en portugues de Brasil.
- Clasificacion de entidades con umbral de decision configurable (las metricas publicadas usan threshold 0,5).
- Esquema de etiquetas abierto en la practica: al ser GLiNER, el conjunto de tipos de entidad se aporta en inferencia, no esta fijado en los pesos.
- Soporte de portugues (pt-BR) e ingles como idiomas declarados.
- Inferencia en PyTorch y exportacion a ONNX, lo que facilita despliegue sin dependencia del framework de entrenamiento.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni uso como agente. Es exclusivamente un modelo de clasificacion de tokens.

## Casos de uso

- Anonimizacion de expedientes y registros en portugues de Brasil: el modelo localiza spans de PII con etiqueta y umbral de confianza, de modo que un pipeline posterior puede enmascarar o sustituir los datos antes de almacenarlos o compartirlos.
- Cumplimiento de LGPD y RGPD en tratamientos de datos: integrado como paso de preprocesado en un ETL, permite marcar que campos contienen datos personales y generar registros de tratamiento con evidencia a nivel de span.
- Saneamiento de transcripciones de atencion al cliente: sobre texto de call center en pt-BR, detecta nombres, documentos y contactos para producir transcripciones aptas para analitica interna o para entrenamiento de otros modelos.
- Desidentificacion de corpus para entrenamiento: el modelo puede actuar como filtro previo sobre datasets en portugues antes de usarlos para ajustar modelos de lenguaje, reduciendo el riesgo de memorizar PII.
- Preprocesado de logs y trazas de aplicacion: aplicar el modelo sobre campos de texto libre en logs permite detectar PII que se ha filtrado a la telemetria antes de enviarla a un sistema de observabilidad de terceros.
- Sistemas DLP y prevencion de fuga de informacion: como clasificador de tokens ejecutable en ONNX, encaja en pasos de inspeccion de contenido con latencia baja y sin GPU dedicada.
- Enriquecimiento de expedientes KYC y back-office: extraccion de identificadores y datos de contacto en documentos portugueses como paso previo a validaciones automaticas, siempre con revision humana en los casos de baja confianza.
- Referencia de evaluacion y reproducibilidad: al ser el unico repo legado del grupo con metricas de tarea y contar con DOI, sirve para comparar variantes posteriores de la suite sobre los mismos conjuntos de evaluacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Tarea: PII NER con span y etiqueta exactos, umbral 0,5. Fuente de todas las filas: `arthrod/gliner_eval_folder`, fichero `data/summary.parquet`. Ninguna metrica esta marcada como verificada (`verified: false`).

| Conjunto de evaluacion | Muestras | Precision | Recall | F1 |
|---|---|---|---|---|
| gliner_canonical_ptbr_pii_v1 | 5.000 | 0,6358 | 0,8570 | 0,7300 |
| ptbr_pii_val_19k | 19.164 | 0,4184 | 0,3534 | 0,3831 |
| nvidia/Nemotron-PII | 5.000 | 0,6555 | 0,6008 | 0,6269 |
| urchade/synthetic-pii-ner-mistral-v1 | 5.000 | 0,2895 | 0,2147 | 0,2465 |

Comparacion con el modelo base declarada en la model card: en el conjunto canonico PT-BR de 23 etiquetas el F1 pasa de 0,459 (base) a 0,730; en `nvidia/Nemotron-PII` pasa de 0,581 a 0,627. El autor indica ademas que el modelo pierde terreno en conjuntos de NER general y multilingue, aunque no se incluyen las cifras concretas de esas perdidas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el modelo es un encoder de tipo large, no un LLM generativo): el repositorio ocupa 31,7 GB, pero ese tamano corresponde al conjunto de artefactos publicados, no a los pesos necesarios en memoria. Para una unica copia de pesos en fp32 la horquilla tipica de un encoder large ronda 1,5-2 GB, y en fp16/bf16 alrededor de 0,8-1 GB; estas cifras son estimaciones de orden de magnitud y no estan declaradas en la model card.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia en fp16 con lotes pequenos. Nvidia RTX 3060, RTX 4060, RTX 4090, A100 y H100 son validas; no se requiere memoria de clase A100/H100 salvo para lotes muy grandes o entrenamiento.
- Cabe en GPU de consumo: si, con margen amplio. Tambien es viable en CPU si se usa la exportacion ONNX, que es el escenario habitual para pipelines de redaccion de PII de alto volumen y bajo coste.
- Opciones de despliegue: libreria `gliner` (la declarada en el repositorio), Transformers de Hugging Face para cargar los pesos PyTorch, y ONNX Runtime para la version exportada. vLLM, TGI y llama.cpp no son las herramientas naturales para este tipo de modelo; en particular llama.cpp solo tendria sentido si existieran pesos GGUF, que no se documentan.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 canonico PT-BR (23 etiquetas) | F1 Nemotron-PII | Licencia | Estado |
|---|---|---|---|---|---|---|---|
| arthrod/v1-deberta_large-token_level-1-7 | GLiNER token-level, DeBERTa-v3-large | no disponible | no disponible | 0,730 | 0,627 | apache-2.0 | Legado, superseded |
| knowledgator/gliner-pii-large-v1.0 | GLiNER de PII (modelo base) | no disponible | no disponible | 0,459 | 0,581 | no disponible en la informacion proporcionada | Base de partida |
| arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1 | GLiNER con backbone mmBERT-small | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Recomendado por el autor para pt-BR |
| arthrod/gliner-opf-ptbr-pii-v1 | Ajuste del OpenAI Privacy Filter para pt-BR | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Suite actual |
| arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1 | GLiNER con backbone Ettin de 68 M | 68 M (encoder) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Suite actual, orientado a modelos pequenos |

No se han proporcionado resultados de benchmark de los modelos alternativos de la suite actual, por lo que la comparacion cuantitativa solo puede establecerse contra el modelo base.

## Limitaciones y advertencias

- Modelo explicitamente marcado como *legacy* y *superseded* por su autor: la propia model card recomienda migrar a `arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1` o `arthrod/gliner-opf-ptbr-pii-v1`.
- Entrenamiento incompleto: se detuvo en el paso 8.000 de 15.000 planificados (1,44 epocas), por lo que no representa el punto de convergencia previsto.
- Datos de entrenamiento exclusivamente sinteticos: el ajuste se hizo sobre unos 1,03 millones de ejemplos sinteticos de PII en pt-BR, lo que puede introducir sesgos de distribucion frente a texto real.
- Rendimiento muy desigual segun el conjunto: F1 de 0,3831 en `ptbr_pii_val_19k` (19.164 muestras) y de 0,2465 en `synthetic-pii-ner-mistral-v1`, frente al 0,730 del conjunto canonico. La precision cae hasta 0,4184 en el conjunto de validacion grande, lo que implica una tasa apreciable de falsos positivos.
- Perdida de rendimiento en NER general y multilingue respecto al modelo base, segun declara el propio autor.
- Metricas no verificadas: todos los resultados del model-index tienen `verified: false`; provienen de un unico fichero de resumen generado por el autor.
- Riesgo de alucinacion en el sentido de spans espurios: al ser un modelo de extraccion, puede etiquetar como PII fragmentos que no lo son, especialmente con umbrales de confianza bajos. Se recomienda calibrar el umbral segun el coste relativo de falsos positivos y falsos negativos.
- Cobertura idiomatica limitada a portugues (pt-BR) e ingles; no hay evidencia de soporte para portugues europeo ni para otras lenguas.
- Nomenclatura ambigua: el sufijo `1-7` del nombre del repositorio no esta explicado en ninguna parte, y los tags mezclan `deberta-v2` y `deberta-v3`.
- Licencia apache-2.0 en este repositorio, lo que permite uso comercial de estos pesos, pero conviene verificar la licencia del modelo base `knowledgator/gliner-pii-large-v1.0`, que no se detalla en la informacion disponible.
- Uso en produccion: dado el estado de legado y la existencia de alternativas mantenidas por el mismo autor, no se recomienda como componente unico de un pipeline de cumplimiento normativo sin una capa de revision humana o un segundo detector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arthrod/v1-deberta_large-token_level-1-7
- DOI del modelo: https://doi.org/10.57967/hf/8522
- Modelo base: https://huggingface.co/knowledgator/gliner-pii-large-v1.0
- Alternativa recomendada por el autor (pt-BR, mmBERT-small): https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Alternativa de la suite actual (OpenAI Privacy Filter, pt-BR): https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- Modelo de la suite actual con backbone Ettin 68M: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1
- Variante top-50k del anterior: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1
- Variante con backbone Ettin 32M: https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Dataset de benchmark de la suite actual: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Dataset de comparacion lado a lado de salidas GLiNER: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- Demo interactiva: https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Dataset de evaluacion (barrido de febrero de 2026, origen de las metricas): https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Bitacora del experimento (24 de febrero de 2026): https://huggingface.co/arthrod/attempt_vanilla
- Modelo relacionado c3750-mdeberta_base-vanilla-1-2: https://huggingface.co/arthrod/c3750-mdeberta_base-vanilla-1-2
- Referencia bibliografica etiquetada en el repositorio (arXiv:2406.12925): https://arxiv.org/abs/2406.12925
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido clinico sobre artrodesis), por lo que no se incluye ningun enlace adicional procedente de esa fuente.
