# skala3-telescope/kf_deberta_ft-finale

## Resumen

kf_deberta_ft-finale es un modelo de embeddings de frases en coreano especializado en el dominio financiero, desarrollado por el equipo skala3-telescope. Se construye sobre el checkpoint kakaobank/kf-deberta-base, un transformer DeBERTa-v2 adaptado al coreano, y se afina para tareas de similitud semantica y normalizacion de cuentas contables conforme a los estandares DART y K-IFRS. El modelo produce representaciones densas de 768 dimensiones mediante mean pooling y se distribuye a traves de la libreria sentence-transformers.

Su relevancia practica esta en un nicho muy concreto: alinear denominaciones de cuentas y partidas financieras que aparecen con variantes ortograficas, sinonimos o redacciones distintas en los informes regulatorios coreanos. El modelo incorpora ademas evaluaciones especificas para cadenas de razonamiento contable, antonimos y relaciones de negacion, lo que lo aleja de un embedding generico y lo orienta a pipelines de extraccion y matching documental.

El modelo es pequeno (185,3 millones de parametros, ~1,5 GB en el repositorio) y su ventana de contexto es de solo 128 tokens, por lo que su uso esta acotado a fragmentos cortos y emparejamiento de entidades, no a documentos completos. La licencia MIT del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DeBERTa-v2 (DebertaV2Model) con mean pooling |
| Parametros totales | 185.290.752 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 768 |
| Funcion de similitud | similitud coseno (se recomienda `normalize_embeddings=True`) |
| Prefijos de prompt | no requiere prefijo |

## Arquitectura y entrenamiento

El modelo parte de kakaobank/kf-deberta-base, un DeBERTa-v2 de tamano base adaptado al coreano. Sobre esa base se aplica un proceso de ajuste fino en dos etapas segun la model card: una primera fase (Stage 0) sobre KLUE STS-first y una segunda fase sobre un conjunto multitarea financiero denominado `train_multitask_v2_1`, orientado a la normalizacion de cuentas contables y a la discriminacion de relaciones semanticas finas (antonimos, negacion, agendas). La capa de salida se reduce a un vector de 768 dimensiones mediante mean pooling, sin prefijos de tarea ni instrucciones.

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un modelo de embeddings, el objetivo de entrenamiento es probablemente contrastivo o de similitud supervisada, pero este detalle no se documenta. La innovacion destacable es la inclusion de evaluaciones de "unseen" (terminos no vistos) y de pares antinomicos, lo que sugiere un esfuerzo explicito por mejorar la generalizacion mas alla de las cadenas de cuentas vistas durante el ajuste.

## Capacidades

- Generacion de embeddings de frases en coreano para similitud semantica y recuperacion densa.
- Normalizacion y alineamiento de denominaciones de cuentas contables (DART, K-IFRS).
- Discriminacion de antonimos y relaciones de negacion en terminos financieros.
- Manejo de cadenas de razonamiento contable (chain) evaluado en dominios de telecomunicaciones y financiero.
- Extraccion de caracteristicas (`feature-extraction`) para clasificacion y clustering downstream.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito: es un encoder de embeddings, no un modelo generativo.
- Capacidad multilingue limitada al coreano; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Normalizacion de cuentas contables: dado un listado heterogeneo de partidas extraidas de informes DART, el modelo genera embeddings y empareja cada variante con la cuenta canonica K-IFRS mediante similitud coseno, reduciendo la necesidad de reglas manuales.
- Deduplicacion de conceptos financieros: en un pipeline de ingestion de estados financieros, agrupa denominaciones equivalentes ("법인세비용차감전계속사업이익" frente a "법인세비용차감전순이익") para consolidar entidades antes de cargarlas en un data warehouse.
- Busqueda semantica sobre catalogos de cuentas: indexa el plan contable y permite consultas en lenguaje natural acotadas a terminos cortos, aprovechando la ventana de 128 tokens y el rendimiento Top-1 reportado en `chain_dev_v1` (0,8821).
- Validacion de mapeos en migraciones contables: al integrar un nuevo sistema ERP, el modelo sugiere correspondencias entre el plan antiguo y el nuevo, con Recall@K de 0,9827 en el conjunto de desarrollo, lo que permite revision humana solo de los casos de baja confianza.
- Deteccion de antonimos y negaciones en notas financieras: el conjunto `antonym_discrim_v2` (Top-1 0,6367, Recall@K 0,9900) indica que el modelo sirve para senalar pares como "ingreso" frente a "gasto" o "activo" frente a "pasivo" en tareas de reconciliacion.
- Clasificacion y clustering de transacciones: los embeddings de 768 dimensiones alimentan clasificadores ligeros o algoritmos de clustering para agrupar apuntes contables por naturaleza economica.
- Recuperacion en asistentes de consulta regulatoria: como retriever en un pipeline RAG sobre fragmentos cortos de normativa o definiciones de cuentas, con la salvedad de que los documentos largos deben trocearse a 128 tokens.

## Benchmarks y rendimiento

Resultados reportados en la model card (a partir de `train_info.json`):

| Evaluacion | n | Top-1 | Recall@K | Top-1 en no vistos (n_unseen) |
|---|---:|---:|---:|---:|
| chain_dev_v1 | 9.257 | 0,8821 | 0,9827 | 0,6849 (2.006) |
| chain_telecom_v1 | 402 | 0,9055 | 0,9950 | 0,8214 (112) |
| irdart_telecom_v1 | 89 | 0,8090 | 0,9438 | 0,6667 (45) |
| antonym_discrim_v2 | 300 | 0,6367 | 0,9900 | 0,5144 (208) |
| negation_rel_eval_v2_1 | 40 | 0,9750 | 1,0000 | 0,9750 (40) |
| agenda_eval_v2 | 50 | 0,5600 | 0,9200 | 0,5600 (50) |

Ademas, la model card reporta un Spearman de 0,8148 en STS Dev (frente a 0,8147 en Stage 0 y 0,4551 en el modelo sin ajuste). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,75 GB solo de pesos (185 M de parametros), con overhead adicional de activaciones segun el tamano de lote.
- En FP16/BF16: alrededor de 0,4 GB de pesos; en cuantizacion de 8 bits, ~0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090); para alto throughput en servidor, A100 o H100 con lotes grandes.
- Cabe holgadamente en GPU consumer e incluso en CPU para cargas moderadas, dado el reducido tamano.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (soporte declarado en los tags), y servidores de embeddings compatibles con endpoints. No se documenta soporte explicito de llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---:|---:|---|---|---|
| kf_deberta_ft-finale | 185 M | 128 | ko | MIT | Embeddings financieros coreanos (DART/K-IFRS) |
| kakaobank/kf-deberta-base | no disponible | no disponible | ko | MIT | Modelo base DeBERTa-v2 coreano, sin ajuste a similitud |
| KLUE STS-first (referencia de evaluacion) | no disponible | no disponible | ko | no disponible | Benchmark de similitud semantica coreana |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Ventana de contexto de solo 128 tokens: no apta para documentos completos ni parrafos largos; requiere troceado previo.
- Rendimiento limitado a coreano; no se documenta comportamiento en otros idiomas.
- Caida notable en terminos no vistos: el Top-1 baja de 0,8821 a 0,6849 en `chain_dev_v1` y de 0,6367 a 0,5144 en `antonym_discrim_v2`, lo que indica menor fiabilidad ante vocabulario contable nuevo.
- Top-1 bajo en `agenda_eval_v2` (0,5600) y en `antonym_discrim_v2` (0,6367): no recomendable como unico criterio en tareas de discriminacion fina sin revision humana.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos en el emparejamiento por similitud; conviene umbral de confianza y validacion.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre datos financieros coreanos puede heredar sesgos del dominio y de las fuentes DART.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar las condiciones del modelo base kakaobank/kf-deberta-base y de los datos de entrenamiento.
- Modelo con muy poca adopcion (64 descargas, 1 like en el momento de la consulta): sin validacion independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skala3-telescope/kf_deberta_ft-finale
- Modelo base: https://huggingface.co/kakaobank/kf-deberta-base
- Libreria sentence-transformers: https://www.sbert.net/
- Repositorio text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
- Benchmark KLUE (referencia de evaluacion STS): https://klue-benchmark.com/
