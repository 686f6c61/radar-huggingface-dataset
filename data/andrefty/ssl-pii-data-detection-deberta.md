# Andrefty/ssl-pii-data-detection-deberta

## Resumen

El modelo `Andrefty/ssl-pii-data-detection-deberta` es un checkpoint de DeBERTa-v3-large afinado para la deteccion de informacion personal identificable (PII) mediante clasificacion de tokens. Lo desarrolla el usuario de Hugging Face Andrefty como artefacto derivado de su participacion en la competicion Kaggle PII Data Detection, y se publica con licencia MIT. El modelo parte de `microsoft/deberta-v3-large` y se entrena sobre los datos de la competicion mas un conjunto adicional denominado `moredata_dataset_fixed.json`.

La tarea que resuelve es el etiquetado a nivel de token de entidades sensibles (nombres, correos, telefonos, direcciones y similares) en texto libre, con una longitud maxima de secuencia de 4096 tokens, lo que permite procesar documentos largos sin truncar en exceso. El checkpoint reporta una metrica de validacion de 0,9692 (metrica F5, segun los tags de la model card) en la epoca 3 sobre el fold 0.

Es relevante ahora porque la deteccion de PII es un requisito operativo en pipelines de cumplimiento (RGPD, redaccion de documentos, anonimizacion previa a entrenamiento) y porque el modelo se distribuye con pesos y codigo de inferencia incluidos en el repositorio, lo que facilita su reproduccion. El repositorio ocupa 6,9 GB e incluye tanto los pesos finales (1,74 GB) como el checkpoint completo de entrenamiento (5,21 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) para clasificacion de tokens |
| Parametros totales | no disponible (la model card no indica el recuento; DeBERTa-v3-large base es de ~435 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (max sequence length declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch); incluye `spm.model`, `tokenizer.json`, `config.json` |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer DeBERTa-v3-large adaptado a clasificacion de tokens (token classification) para etiquetado de entidades PII. La model card no detalla innovaciones arquitectonicas propias; se trata de un afinamiento estandar sobre el checkpoint preentrenado de Microsoft. La secuencia maxima configurada es de 4096 tokens, lo que condiciona el preprocesado y el coste de atencion cuadratico en inferencia.

El entrenamiento se realizo con AdamW, learning rate 1e-5, weight decay 0,0 y batch size 2, durante 5 epocas sobre el fold 0. Los datos combinan el conjunto de la competicion Kaggle PII Data Detection con `moredata_dataset_fixed.json`. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. El mejor checkpoint se selecciono por metrica de validacion (0,9692 en la epoca 3).

## Capacidades

- Deteccion y etiquetado de PII a nivel de token en texto libre (clasificacion de entidades).
- Procesamiento de secuencias largas de hasta 4096 tokens, adecuado para documentos extensos.
- Salida compatible con el pipeline `token-classification` de Hugging Face.
- Inferencia reproducible: el repositorio incluye codigo de entrenamiento e inferencia bajo `code/`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).

## Casos de uso

- Redaccion de PII en documentos antes de compartirlos: el modelo etiqueta entidades sensibles token a token y permite sustituirlas o enmascararlas; la ventana de 4096 tokens reduce la necesidad de fragmentar contratos o informes.
- Anonimizacion previa a entrenamiento de modelos: se puede ejecutar como paso de preprocesado sobre corpus internos para eliminar nombres, correos y telefonos antes de que los datos entren en un pipeline de entrenamiento.
- Cumplimiento normativo (RGPD): integrado en un servicio de revision que marque campos personales en logs o tickets de soporte antes de su almacenamiento a largo plazo.
- Filtrado de datos en entornos de investigacion: deteccion de PII en conjuntos de datos que se van a publicar o compartir con terceros.
- Enriquecimiento de pipelines de DLP (data loss prevention): clasificacion de campos en correos y documentos ofimaticos convertidos a texto.
- Auditoria de bases de datos textuales: barrido por lotes de registros de texto libre para localizar y catalogar exposicion de datos personales.
- Prototipado rapido en Kaggle o entornos de investigacion: al incluir pesos, tokenizer y codigo, sirve como punto de partida reproducible para experimentos de etiquetado de PII.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| F5-score (validacion) | 0,9692 | Fold 0, epoca 3, sobre datos de la competicion |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa: no disponible de forma explicita; el checkpoint de pesos ocupa 1,74 GB, por lo que en fp16 el modelo requiere del orden de varios GB de VRAM, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el limite practico lo marca la longitud de secuencia de 4096 tokens, que incrementa el uso de memoria de atencion.
- Opciones de despliegue: el pipeline `token-classification` de Hugging Face es compatible; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Andrefty/ssl-pii-data-detection-deberta | no disponible | 4096 | Deteccion de PII (token classification) | MIT | Hugging Face |
| microsoft/deberta-v3-large | no disponible en la informacion | no disponible | Modelo base preentrenado | MIT (modelo base de Microsoft) | Hugging Face |
| Alternativas especificas de deteccion de PII | no disponible | no disponible | Deteccion de PII | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo se entrena sobre datos de una competicion Kaggle; su generalizacion a dominios distintos (por ejemplo, textos legales o medicos en espanol) no esta validada en la informacion disponible.
- No se declara la lista de idiomas soportados, por lo que el rendimiento fuera del ingles (idioma predominante de la competicion) es incierto.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos en la etiqueta de entidades: la metrica F5 reportada (0,9692) es de validacion sobre el fold 0 y no garantiza el mismo rendimiento en produccion.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la procedencia de los datos de entrenamiento (`moredata_dataset_fixed.json`) para evaluar riesgos de licencia de los datos.
- El checkpoint completo de entrenamiento (5,21 GB) incluye estados de optimizador, scheduler y scaler; no es necesario para inferencia y conviene descargar solo los pesos finales.
- La ventana de 4096 tokens implica un coste de memoria y computo elevado en inferencia con lotes grandes; no se documentan optimizaciones de atencion.
- No se documentan sesgos conocidos ni evaluaciones de robustez; se recomienda validacion propia antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Andrefty/ssl-pii-data-detection-deberta
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Competicion Kaggle PII Data Detection: https://www.kaggle.com/competitions/pii-detection-removal-from-educational-data
- Dataset de referencia: https://huggingface.co/datasets/pii-data-detection (segun tag de la model card)
