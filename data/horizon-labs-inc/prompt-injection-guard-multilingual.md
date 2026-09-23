# Horizon-Labs-Inc/prompt-injection-guard-multilingual

## Resumen

Prompt-Injection Guard — Multilingual es un clasificador de texto binario desarrollado por Horizon-Labs-Inc (publicado en el repositorio como Horizon-Labs-Inc/prompt-injection-guard-multilingual) que detecta intentos de prompt injection y jailbreak dirigidos a modelos de lenguaje. Dado un prompt de usuario, una salida de herramienta o un fragmento de documento, el modelo devuelve la probabilidad de que el texto sea un ataque contra las instrucciones del LLM. Está pensado como componente de guardarraíl (guardrail) en pipelines de aplicaciones con LLM, donde se necesita filtrar entradas antes de que lleguen al modelo principal.

Técnicamente es un fine-tune de distilbert-base-multilingual-cased, un encoder transformer destilado de BERT con 135.326.210 parámetros totales (135M), licencia Apache-2.0 y una ventana de tokenización configurada a 256 tokens en el ejemplo oficial. Su principal argumento diferencial es la cobertura multilingüe: el model card declara soporte para 17 idiomas (en, es, fr, de, pt, it, nl, ru, zh, ja, ko, ar, hi, id, vi, tr, pl), frente a detectores públicos previos que son monolingües en inglés o que usan licencias restrictivas.

El modelo se distribuye con pesos en safetensors y un export ONNX, y su relevancia actual reside en que ofrece una alternativa con licencia permisiva (Apache-2.0) dentro de una categoría donde muchas opciones comerciales o de grandes laboratorios imponen restricciones de uso. El autor publica además el corpus de entrenamiento multilingüe (mosscap-multilingual) y compara el modelo contra protectai/deberta-v3-base-prompt-injection-v2 sobre conjuntos de test compartidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT); clasificacion de secuencia |
| Parametros totales | 135.326.210 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens en el ejemplo de tokenizacion del model card (max_length 256, padding + truncation); maximo teorico de DistilBERT: 512 tokens |
| Tipos de cuantizacion | no se detallan tipos de cuantizacion especificos; el repo incluye export ONNX (onnx/model.onnx) y pesos safetensors. El tag base_model:quantized:distilbert/distilbert-base-multilingual-cased indica el uso del modelo base cuantizado como referencia, no un formato de pesos cuantizados publicado |
| Idiomas soportados | 17: en, es, fr, de, pt, it, nl, ru, zh, ja, ko, ar, hi, id, vi, tr, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX |
| Modelo base | distilbert-base-multilingual-cased |
| Pipeline | text-classification |
| Etiquetas de salida | id2label: 0 = BENIGN, 1 = ATTACK |
| Tamano del repositorio | 1.6 GB |
| Descargas / likes (segun HuggingFace) | 76 descargas / 0 likes |

## Arquitectura y entrenamiento

El modelo es un ajuste supervisado de distilbert-base-multilingual-cased, un encoder transformer de 135M de parametros obtenido por destilacion de distilbert (6 capas, mecanismo de atencion multi-cabeza estandar, vocabulario multilingue en cased). La tarea es de clasificacion de secuencia binaria: se anade una cabeza de clasificacion sobre el token [CLS] que produce dos logits (BENIGN, ATTACK). El model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; indica unicamente que el corpus de entrenamiento multilingue, mosscap-multilingual, esta publicado por el autor, y que las evaluaciones se realizaron sobre conjuntos de test nunca usados en entrenamiento.

Los conjuntos de evaluacion se organizan en dos familias: por un lado, conjuntos en ingles (en_deepset, en_mosscap, en_xstest_fpr); por otro, conjuntos multilingues "mt_*" que emparejan ataques traducidos contra textos benignos tambien traducidos. El autor advierte explicitamente que estos conjuntos mt_* estan construidos apareando ataques traducidos con benignos traducidos, lo que sobreestima la tasa de falsos positivos real en produccion. La metrica de referencia es F1 sobre texto de ataque, e incluye la tasa de falsos positivos (FPR) sobre el conjunto XSTest de prompts seguros.

## Capacidades

- Clasificacion binaria de texto para deteccion de prompt injection y jailbreak, con salida de probabilidad por clase (BENIGN / ATTACK).
- Deteccion multilingue en 17 idiomas declarados, aunque con un rendimiento notablemente inferior en idiomas distintos del ingles (F1 en torno a 0,63-0,68 en los conjuntos mt_* frente a 0,717 en en_mosscap con umbral 0,5).
- Umbral ajustable: 0,50 como valor por defecto conservador y 0,35 para despliegues de alta sensibilidad (recall alto a costa de mas falsos positivos).
- Analisis de entradas heterogeneas: prompts de usuario, salidas de herramientas (tool output) y extractos de documentos, segun el model card.
- Integracion como componente de guardarraíl en pipelines de LLM; no genera texto ni realiza razonamiento por si mismo.
- Export ONNX para inferencia optimizada fuera del ecosistema PyTorch.
- Compatibilidad con text-embeddings-inference y endpoints (tags endpoints_compatible y text-embeddings-inference).
- No dispone de tool calling, soporte de agentes, vision, audio ni modo thinking: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en aplicaciones de chat con LLM: ejecutar el clasificador sobre cada prompt de usuario antes de enviarlo al modelo principal; si p(ATTACK) supera el umbral, se bloquea o se envuelve en una capa de saneamiento. Adecuado por su baja latencia al ser un encoder de 135M de parametros.
- Proteccion de agentes y tool calling: inspeccionar las salidas de herramientas externas (resultados de busqueda, contenido descargado, respuestas de API) que un agente va a insertar en el contexto, ya que el model card contempla explicitamente este caso de entrada.
- Moderacion de contenido en plataformas multilingues: uso del detector para prefiltrar textos en 17 idiomas antes de pasarlos a un LLM, aprovechando que el propio detector es multilingue y evita depender de un traductor intermedio.
- Defensa frente a inyeccion indirecta de prompts en documentos: escanear fragmentos de documentos o paginas web recuperadas por un sistema RAG antes de incorporarlos al contexto del modelo generativo.
- Endurecimiento de sistemas RAG en produccion: colocar el clasificador en el pipeline de recuperacion para descartar fragmentos que contengan intentos de manipulacion, reduciendo la superficie de ataque en bases documentales no confiables.
- Clasificacion por lotes para auditoria y monitorizacion: procesar registros historicos de conversaciones o logs de API con ONNX Runtime para analizar tendencias de ataques y generar alertas de seguridad.
- Red teaming y evaluacion de robustez: usar el modelo como referencia cuantitativa al comparar estrategias de defensa o al medir la tasa de evasion de variantes de ataque durante pruebas internas.
- Conformidad y gobernanza: componente verificable y con licencia Apache-2.0 dentro de un stack de cumplimiento (por ejemplo, requisitos de robustez y seguridad del Reglamento europeo de IA) donde se necesita trazabilidad y permiso de uso comercial.

## Benchmarks y rendimiento

Evaluacion del modelo (umbral 0,50; las filas marcadas con @t=0.35 corresponden al umbral alternativo):

| Conjunto | n | Precision | Recall | F1 | FPR |
|---|---|---|---|---|---|
| en_deepset | 116 | 1.000 | 0.217 | 0.356 | 0.000 |
| en_deepset@t=0.35 | 116 | 0.926 | 0.417 | 0.575 | 0.036 |
| en_mosscap | 6828 | 0.832 | 0.630 | 0.717 | 0.307 |
| en_mosscap@t=0.35 | 6828 | 0.792 | 0.841 | 0.816 | 0.532 |
| en_xstest_fpr | 250 | 0.000 | 0.000 | 0.000 | 0.008 |
| en_xstest_fpr@t=0.35 | 250 | 0.000 | 0.000 | 0.000 | 0.016 |
| mt_ar | 1000 | 0.554 | 0.790 | 0.651 | 0.636 |
| mt_ar@t=0.35 | 1000 | 0.541 | 0.902 | 0.676 | 0.766 |
| mt_de | 1000 | 0.569 | 0.812 | 0.669 | 0.616 |
| mt_de@t=0.35 | 1000 | 0.536 | 0.910 | 0.675 | 0.788 |
| mt_es | 1000 | 0.571 | 0.812 | 0.670 | 0.610 |
| mt_es@t=0.35 | 1000 | 0.544 | 0.916 | 0.683 | 0.768 |
| mt_fr | 1000 | 0.595 | 0.754 | 0.665 | 0.514 |
| mt_fr@t=0.35 | 1000 | 0.554 | 0.892 | 0.683 | 0.718 |
| mt_hi | 1000 | 0.567 | 0.792 | 0.661 | 0.606 |
| mt_hi@t=0.35 | 1000 | 0.544 | 0.898 | 0.678 | 0.752 |
| mt_id | 1000 | 0.568 | 0.842 | 0.678 | 0.640 |
| mt_id@t=0.35 | 1000 | 0.537 | 0.920 | 0.678 | 0.792 |
| mt_it | 1000 | 0.578 | 0.770 | 0.660 | 0.562 |
| mt_it@t=0.35 | 1000 | 0.547 | 0.890 | 0.678 | 0.736 |
| mt_ja | 996 | 0.547 | 0.830 | 0.659 | 0.690 |
| mt_ja@t=0.35 | 996 | 0.527 | 0.922 | 0.671 | 0.831 |
| mt_ko | 1000 | 0.549 | 0.812 | 0.655 | 0.666 |
| mt_ko@t=0.35 | 1000 | 0.533 | 0.912 | 0.673 | 0.800 |
| mt_nl | 1000 | 0.579 | 0.832 | 0.683 | 0.604 |
| mt_nl@t=0.35 | 1000 | 0.546 | 0.896 | 0.678 | 0.746 |
| mt_pl | 1000 | 0.554 | 0.730 | 0.630 | 0.588 |
| mt_pl@t=0.35 | 1000 | 0.533 | 0.878 | 0.663 | 0.770 |
| mt_pt | 1000 | 0.582 | 0.800 | 0.674 | 0.574 |
| mt_pt@t=0.35 | 1000 | 0.547 | 0.916 | 0.685 | 0.758 |
| mt_ru | 1000 | 0.573 | 0.756 | 0.652 | 0.564 |
| mt_ru@t=0.35 | 1000 | 0.540 | 0.898 | 0.675 | 0.764 |
| mt_tr | 1000 | 0.571 | 0.718 | 0.636 | 0.540 |
| mt_tr@t=0.35 | 1000 | 0.541 | 0.856 | 0.663 | 0.726 |
| mt_vi | 1000 | 0.562 | 0.846 | 0.676 | 0.658 |
| mt_vi@t=0.35 | 1000 | 0.528 | 0.906 | 0.667 | 0.810 |
| mt_zh | 998 | 0.556 | 0.791 | 0.653 | 0.630 |
| mt_zh@t=0.35 | 998 | 0.536 | 0.924 | 0.678 | 0.796 |

Baseline protectai/deberta-v3-base-prompt-injection-v2 (umbral 0,5). La tabla del model card esta truncada en el material disponible, por lo que solo se reproducen las filas completas:

| Conjunto | n | Precision | Recall | F1 | FPR |
|---|---|---|---|---|---|
| en_deepset | 116 | 1.000 | 0.367 | 0.537 | 0.000 |
| en_mosscap | 6828 | 0.739 | 0.721 | 0.730 | 0.613 |
| en_xstest_fpr | 250 | 0.000 | 0.000 | 0.000 | 0.000 |
| mt_ar | 1000 | 0.511 | 0.852 | 0.639 | 0.814 |
| mt_de | 1000 | 0.517 | 0.644 | 0.574 | 0.602 |
| mt_es | 1000 | 0.528 | 0.860 | 0.654 | 0.770 |
| mt_fr | 1000 | 0.517 | 0.812 | 0.632 | 0.758 |
| mt_hi | 1000 | 0.490 | 0.778 | 0.601 | 0.810 |
| mt_id | 1000 | 0.441 | 0.296 | 0.354 | 0.376 |
| mt_it | 1000 | 0.520 | 0.872 | 0.651 | 0.806 |
| mt_ja | 996 | 0.526 | 0.744 | 0.616 | 0.672 |
| mt_ko | 1000 | 0.524 | 0.796 | 0.632 | 0.722 |
| mt_nl | 1000 | 0.451 | 0.348 | 0.393 | 0.424 |
| mt_pl | 1000 | 0.480 | 0.514 | 0.497 | 0.556 |
| mt_pt | 1000 | 0.525 | 0.834 | 0.644 | 0.754 |
| mt_ru (fila truncada en el material) | 1000 | 0.469 | 0.40 (truncado) | no disponible | no disponible |

No se han publicado mas resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,54 GB en FP32 (135M parametros a 4 bytes) y alrededor de 0,27 GB en FP16/bf16. El export ONNX permite reducirlo aun mas, aunque el model card no especifica pesos cuantizados.
- CPU: el modelo es perfectamente ejecutable en CPU; DistilBERT de 135M es adecuado para inferencia por lotes en servidores sin GPU.
- GPU consumer: cabe holgadamente en cualquier GPU consumer, incluidas GTX 1060, RTX 3060, RTX 4090 o incluso integradas modernas, ya que el uso de memoria es inferior a 1 GB.
- GPU de datacenter: A100, H100, L40S o T4 son sobredimensionadas para un solo modelo; resultan utiles cuando se sirve el clasificador junto a un LLM grande en el mismo nodo.
- Opciones de despliegue: transformers (pipeline text-classification), ONNX Runtime, text-embeddings-inference (segun tag del repo) y endpoints compatibles de HuggingFace. Dado que es un modelo de clasificacion, vLLM o TGI pueden servirlo si soportan la tarea text-classification en la version utilizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto | Rendimiento reportado | Disponibilidad |
|---|---|---|---|---|---|---|
| Horizon-Labs-Inc/prompt-injection-guard-multilingual | 135M | 17 | Apache-2.0 | 256 tokens (ejemplo) | F1 0,717 en en_mosscap; F1 0,63-0,68 en mt_* | HuggingFace, ONNX |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible en el material (DeBERTa-v3-base, orden de 86-184M) | ingles principalmente | no disponible en el material | no disponible | F1 0,730 en en_mosscap; F1 degradado en mt_* (0,35-0,65) | HuggingFace |
| Meta PromptGuard (linea Prompt-Guard-86M / Llama-Prompt-Guard-2-86M) | 86M (segun denominacion del model card) | multilingue parcial | licencia de Meta, considerada restrictiva para muchas organizaciones segun el model card | no disponible | no disponible | HuggingFace |

El model card posiciona este modelo frente a dos alternativas: protectai/deberta-v3-base-prompt-injection-v2 (usado como baseline numerico en el propio card) y la linea PromptGuard de Meta, cuya licencia el autor califica como no utilizable por muchas organizaciones. El rendimiento en ingles es ligeramente inferior al baseline de protectai en en_mosscap (F1 0,717 frente a 0,730), mientras que el modelo supera al baseline en varios idiomas no ingleses y lo iguala o mejora en en_deepset cuando se usa el umbral 0,35 (F1 0,575 frente a 0,537).

## Limitaciones y advertencias

- Falsos positivos en multilingue: la columna FPR de los conjuntos mt_* del propio modelo alcanza valores de 0,5-0,8. El model card advierte que estos conjuntos emparejan ataques traducidos con benignos traducidos, lo que sobreestima el FPR real de produccion; aun asi, la tasa de falsos positivos en multilingue es alta y exige calibracion por idioma.
- Rendimiento bajo en en_deepset con umbral por defecto: recall de solo 0,217 (F1 0,356) con umbral 0,50. Es necesario bajar el umbral a 0,35 para obtener un recall util (0,417), a costa de un FPR del 0,036.
- FPR en en_mosscap: 0,307 con umbral 0,50 y 0,532 con umbral 0,35; en produccion esto implica bloquear una fraccion considerable de entradas legitimas segun el conjunto de referencia.
- El propio model card advierte que la metrica F1 no debe interpretarse sin el contexto del conjunto; los numeros de mt_* no son comparables directamente con los de produccion.
- Riesgo de evasion: al ser un encoder de 135M y 256 tokens, ataques que excedan esa longitud o que empleen ofuscacion (codificaciones, tokenizacion adversaria, idiomas mezclados) pueden evadir la deteccion; el modelo trunca a 256 tokens.
- Ambito limitado a clasificacion: no genera, no razona y no sustituye a otras capas de seguridad; un falso negativo permite que el ataque llegue al LLM objetivo.
- Posible confusion de identidad del repositorio: el README referencia el ID Horizon-Labs/prompt-injection-guard-multilingual y el dataset Horizon-Labs/mosscap-multilingual, mientras que la ficha de HuggingFace es Horizon-Labs-Inc/prompt-injection-guard-multilingual. Conviene verificar la relacion entre ambas cuentas antes de integrarlo en produccion.
- Idiomas no confirmados mas alla de los 17 declarados; la lista de idiomas de la ficha de HuggingFace aparece como no disponible, aunque el model card enumera los 17.
- Licencia: Apache-2.0, permisiva y apta para uso comercial; el modelo base distilbert-base-multilingual-cased tambien es Apache-2.0.
- Trazabilidad de metricas: los resultados en mt_* y en_mosscap proceden del propio autor, no de una evaluacion externa independiente; el material carece de validacion por terceros.
- Los resultados de busqueda web consultados no contienen informacion relevante sobre este modelo: se refieren a un partido politico frances, emisoras de radio, un portal de financiacion de la Comision Europea, la definicion de "horizon" en Wikipedia y Meta Horizon. No se han encontrado papers, blogs, repos ni demos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs-Inc/prompt-injection-guard-multilingual
- Dataset de entrenamiento citado en el model card: https://huggingface.co/datasets/Horizon-Labs/mosscap-multilingual
- Baseline de comparacion: protectai/deberta-v3-base-prompt-injection-v2
- Linea de modelos PromptGuard de Meta (citada como alternativa con licencia restrictiva)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada
