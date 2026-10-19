# BeardedMonster/serengeti-E250-sib200-multilingual

## Resumen

`BeardedMonster/serengeti-E250-sib200-multilingual` es un checkpoint de clasificación de temas (topic classification) obtenido al afinar el encoder multilingüe `UBC-NLP/serengeti-E250` sobre el protocolo multilingüe del benchmark SIB-200. Lo publica el usuario BeardedMonster como parte del harness de evaluación de su proyecto, y cubre 60 variantes idioma-escritura, con peso mayoritario de lenguas africanas (swahili, hausa, yoruba, amhárico, zulú, wolof, bambara, entre otras) más inglés y francés. Con 277.450.752 parámetros (~277 M) y un repositorio de 1,1 GB, es un modelo compacto pensado para inferencia barata y despliegue en CPU o GPU de gama baja.

Arquitectónicamente es un transformer encoder de tipo ELECTRA (según la etiqueta `electra` del repo) con una cabeza lineal de clasificación añadida por el autor. La particularidad técnica importante es que **no es un `AutoModelForSequenceClassification` estándar**: el token `<cls>` del encoder base nunca se entrenó, de modo que la cabeza espera un *mean pooling* ponderado por la máscara de atención. El repo guarda el encoder en safetensors, la cabeza en `head.pt` y el mapa de etiquetas en `labels.json`.

Su relevancia es doble: por un lado, ofrece una puntuación media de weighted F1 de 0,6765 sobre 60 variantes lingüísticas en una tarea concreta y reproducible; por otro, documenta explícitamente su procedencia (el harness reproduce los baselines publicados de MasakhaNER 2.0 con una desviación de ~0,25 F1), lo que permite interpretar el número con cautela en lugar de tomarlo como una cifra de marketing. No es un modelo generativo: no conversa, no razona y no soporta tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ELECTRA (etiqueta `electra`) + cabeza lineal de clasificación sobre mean pooling |
| Parámetros totales | 277.450.752 (~277 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (`max_length` de entrenamiento y del ejemplo de inferencia) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors en precisión original; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | 60 variantes idioma-escritura (mayoritariamente lenguas africanas, más `eng_Latn` y `fra_Latn`) |
| Licencia | no disponible (la ficha no la declara; rige la licencia y términos del modelo base) |
| Formato de pesos | safetensors (encoder) + `head.pt` (cabeza lineal, PyTorch) + `labels.json` |

Variantes idioma-escritura declaradas (60): `aeb_Arab`, `afr_Latn`, `aka_Latn`, `amh_Ethi`, `arb_Arab`, `arb_Latn`, `ary_Arab`, `arz_Arab`, `bam_Latn`, `bem_Latn`, `cjk_Latn`, `dik_Latn`, `dyu_Latn`, `eng_Latn`, `ewe_Latn`, `fon_Latn`, `fra_Latn`, `fuv_Latn`, `gaz_Latn`, `hau_Latn`, `ibo_Latn`, `kab_Latn`, `kam_Latn`, `kbp_Latn`, `kea_Latn`, `kik_Latn`, `kin_Latn`, `kmb_Latn`, `knc_Arab`, `knc_Latn`, `kon_Latn`, `lin_Latn`, `lua_Latn`, `lug_Latn`, `luo_Latn`, `mos_Latn`, `nso_Latn`, `nus_Latn`, `nya_Latn`, `plt_Latn`, `run_Latn`, `sag_Latn`, `sna_Latn`, `som_Latn`, `sot_Latn`, `ssw_Latn`, `swh_Latn`, `taq_Latn`, `taq_Tfng`, `tir_Ethi`, `tsn_Latn`, `tso_Latn`, `tum_Latn`, `twi_Latn`, `tzm_Tfng`, `umb_Latn`, `wol_Latn`, `xho_Latn`, `yor_Latn`, `zul_Latn`.

## Arquitectura y entrenamiento

El backbone es un encoder ELECTRA multilingüe procedente de `UBC-NLP/serengeti-E250`, especializado en lenguas africanas. Sobre él se añade una única capa lineal (`head.pt`) que proyecta el vector pooled al espacio de etiquetas definido en `labels.json`. El pooling es la media de los estados ocultos ponderada por la máscara de atención; el autor advierte explícitamente de que el token `<cls>` no fue entrenado durante el preentrenamiento del modelo base, por lo que usar `AutoModelForSequenceClassification` con pooling por defecto produce predicciones incorrectas. El número de capas, dimensión oculta y composición exacta del corpus de preentrenamiento del modelo base no se detallan en la información disponible.

El ajuste fino se realizó sobre el protocolo multilingüe de SIB-200 con 20 épocas, learning rate 5e-05, batch size 32 y longitud máxima 256 tokens, optimizando weighted F1 como métrica de selección. No se documenta el uso de RLHF ni DPO (no aplica a una tarea de clasificación), ni el volumen exacto de ejemplos de entrenamiento. El autor sí documenta la calibración del harness: reproduce los baselines publicados de MasakhaNER 2.0 con una desviación de ~0,25 F1, lo que da credibilidad al pipeline de evaluación. Los resultados corresponden a una sola ejecución, mientras que los papers de referencia promedian 5, de modo que las diferencias pequeñas deben tratarse como ruido.

## Capacidades

- Clasificación de temas (topic classification) en 60 variantes idioma-escritura, con una única etiqueta de salida por texto.
- Inferencia como encoder: `AutoModel` de Transformers devuelve `last_hidden_state` y permite reutilizar el backbone para otras tareas (NER, similitud, clustering) añadiendo cabezas propias.
- Extracción de representaciones multilingües: el mean pooling sobre la máscara de atención produce un embedding de frase utilizable para búsqueda o clasificación no supervisada.
- Cobertura multilingüe real: swahili, hausa, yoruba, igbo, amhárico, zulú, xhosa, somalí, wolof, bambara, dioula, fon, twi, lingala, luganda, kikuyu, malgache, entre otras, más inglés y francés.
- Manejo de múltiples sistemas de escritura: latino, árabe (`aeb_Arab`, `arb_Arab`, `knc_Arab`), etíope (`amh_Ethi`, `tir_Ethi`) y tifinag (`taq_Tfng`, `tzm_Tfng`).
- Capacidad discriminativa, no generativa: no hay generación de texto, razonamiento multi-paso, tool calling, soporte de agentes, visión, audio ni modo "thinking". No dispone de pipeline declarado en HuggingFace (`pipeline: no disponible`), precisamente porque el uso requiere código personalizado de carga.
- No soporta function calling ni integración como agente: cualquier caso de uso debe plantearse como un clasificador dentro de un pipeline mayor.

## Casos de uso

- Clasificación temática de corpus periodísticos en lenguas africanas: el modelo etiqueta artículos en swahili, hausa, yoruba o amhárico con 256 tokens de entrada, suficiente para el lead y el primer párrafo de una noticia; es la aplicación directa para la que fue entrenado.
- Etiquetado a escala para curación de datasets: al ser un encoder de 277 M, se puede ejecutar sobre millones de documentos en GPU de gama media o incluso en CPU por lotes, generando weak labels que luego se revisan manualmente o se usan para entrenar un modelo mayor.
- Filtrado temático en pipelines de crawling: insertar el clasificador tras el extractor de texto para descartar o enrutar páginas según su temática antes de indexarlas, reduciendo el coste de almacenamiento y de procesamiento posterior.
- Monitorización de medios y análisis de cobertura: agregar los temas detectados por idioma y por medio para construir series temporales de cobertura (por ejemplo, proporción de noticias de salud frente a política en prensa en swahili o zulú).
- Enrutado interno de tickets o feedback ciudadano: clasificar texto libre multilingüe en categorías operativas y dirigirlo al equipo correspondiente; el coste por inferencia es mínimo y la latencia, en un encoder de este tamaño, es baja (no se publican cifras medidas).
- Facetado y búsqueda documental: asignar temas a cada documento para construir índices facetados o filtros previos a la búsqueda semántica, usando además el embedding pooled como vector de similitud.
- Investigación sobre transferencia entre lenguas: el checkpoint permite medir, con un protocolo idéntico, cuánto rinde un encoder africano en cada una de las 60 variantes y comparar con alternativas multilingües genéricas.
- Análisis de encuestas y respuestas abiertas: clasificación de respuestas cortas en estudios de campo donde el texto llega en lenguas de bajos recursos y no hay presupuesto para anotación manual por idioma.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---|---|
| Weighted F1 medio (60 variantes) | 0,6765 | métrica declarada por el autor en la model card |
| Ejecuciones | 1 | las referencias del baseline promedian 5; diferencias pequeñas son ruido |
| Épocas | 20 | ajuste fino sobre SIB-200 multilingüe |
| Learning rate | 5e-05 | valor declarado |
| Batch size | 32 | valor declarado |
| Longitud máxima | 256 | truncado aplicado en entrenamiento e inferencia |
| Métrica de selección | weighted F1 | resultados por idioma en `metrics.json` |

No se han publicado en la información disponible resultados desglosados por idioma (remiten a `metrics.json`), ni comparaciones numéricas con otros modelos sobre el mismo protocolo SIB-200. Tampoco hay datos de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: los pesos en safetensors ocupan ~1,1 GB en FP32; en FP16 ~0,55 GB y en INT8 ~0,28 GB. Con batch pequeño y secuencias de 256 tokens, las activaciones añaden poco, por lo que 2 GB de VRAM son suficientes.
- GPU recomendadas: no requiere A100 ni H100. Una T4, L4, RTX 3060/4060 o incluso una GPU integrada reciente son adecuadas; para lotes grandes, una RTX 4090 o una A10 multiplican el throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de memoria; también es viable en CPU para volúmenes moderados, al ser un encoder de 277 M y secuencias cortas.
- Opciones de despliegue: PyTorch + Transformers con el código de carga personalizado (mean pooling + `head.pt`); exportación a ONNX Runtime o a TorchScript para serving; `torch.compile` para acelerar en GPU. No aplica vLLM ni TGI (no es un modelo generativo) y no hay GGUF, por lo que llama.cpp y Ollama no pueden ejecutarlo tal cual.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento en SIB-200 multilingüe |
|---|---|---|---|---|---|
| BeardedMonster/serengeti-E250-sib200-multilingual | 277 M | 256 | Clasificación de temas, 60 variantes | no disponible | weighted F1 medio 0,6765 (una ejecución) |
| UBC-NLP/serengeti-E250 (modelo base) | 277 M en el checkpoint afinado; el base no se detalla | no disponible | Encoder multilingüe sin cabeza de clasificación | no disponible en la información | no disponible (no se publica en esta ficha) |
| XLM-RoBERTa-base | 278 M | 512 | Encoder multilingüe genérico | MIT | no disponible |
| mBERT | 178 M | 512 | Encoder multilingüe genérico | Apache-2.0 | no disponible |

Los datos de XLM-RoBERTa-base y mBERT provienen de sus fichas públicas y no se han verificado en la información proporcionada; no hay resultados comparables de esos modelos sobre el mismo protocolo SIB-200 en esta ficha. El modelo base `serengeti-E250` es la referencia más directa, pero el checkpoint afinado es el único con métricas declaradas aquí.

## Limitaciones y advertencias

- No es un modelo generativo: no responde instrucciones, no razona, no usa herramientas y no mantiene conversaciones. Cualquier expectativa de chatbot o agente es un error de uso.
- Requiere código de carga específico: usar `AutoModelForSequenceClassification` estándar da resultados incorrectos porque el `<cls>` no fue entrenado. Hay que replicar el mean pooling sobre la máscara de atención y cargar `head.pt`.
- Licencia no declarada en el repo: el autor remite a la licencia y términos de `UBC-NLP/serengeti-E250`. Antes de un uso comercial hay que verificar esa licencia; no se puede asumir permisividad.
- Ventana de contexto de 256 tokens: textos más largos se truncan, lo que puede eliminar la información temática relevante en documentos largos.
- Resultados de una sola ejecución: el propio autor advierte que las referencias promedian 5 ejecuciones, por lo que diferencias pequeñas frente a otros modelos deben considerarse ruido estadístico.
- Rendimiento desigual por idioma: la media de 0,6765 sobre 60 variantes oculta previsiblemente una horquilla amplia; los datos por idioma están en `metrics.json` y deben consultarse antes de desplegar en una lengua concreta. Las variantes con menos recursos y las escrituras distintas de la latina son las candidatas a rendir peor.
- Riesgo de error de clasificación en lugar de alucinación: al no generar texto, el fallo típico es una etiqueta incorrecta o una confianza mal calibrada, no una invención factual. Conviene validar con un conjunto propio antes de automatizar decisiones.
- Sesgos potenciales: el modelo hereda los sesgos del corpus de preentrenamiento y de SIB-200, con dominio probable de registros periodísticos; puede degradarse en textos coloquiales, técnicos o de dominio sanitario.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta, creado el 2026-10-19. No hay validación independiente de la comunidad ni pipelines de terceros publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/serengeti-E250-sib200-multilingual
- Modelo base: https://huggingface.co/UBC-NLP/serengeti-E250
- Dataset SIB-200 (referencia del benchmark, no verificada en la información proporcionada): https://huggingface.co/datasets/Davlan/sib200
- Resultados por idioma: `metrics.json` dentro del repositorio del modelo (https://huggingface.co/BeardedMonster/serengeti-E250-sib200-multilingual/blob/main/metrics.json)
- Etiquetas: `labels.json` dentro del repositorio del modelo (https://huggingface.co/BeardedMonster/serengeti-E250-sib200-multilingual/blob/main/labels.json)
- Pesos de la cabeza de clasificación: `head.pt` dentro del repositorio del modelo (https://huggingface.co/BeardedMonster/serengeti-E250-sib200-multilingual/blob/main/head.pt)
