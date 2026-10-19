# BeardedMonster/afriberta-large-afrisenti-multilingual

## Resumen

`BeardedMonster/afriberta-large-afrisenti-multilingual` es un checkpoint de clasificación de sentimiento obtenido por ajuste fino del encoder multilingüe `castorini/afriberta_large` sobre el corpus AfriSenti, en su variante multilingüe que cubre 12 lenguas: amárico (`amh`), árabe argelino (`arq`), árabe marroquí (`ary`), hausa (`hau`), igbo (`ibo`), kinyarwanda (`kin`), pidgin nigeriano (`pcm`), portugués (`por`), suajili (`swa`), tsonga (`tso`), twi (`twi`) y yoruba (`yor`). El autor es un particular (BeardedMonster) y el modelo se publicó en octubre de 2026 sin descargas ni validación comunitaria registradas.

El problema que resuelve es concreto: la cobertura de análisis de sentimiento en lenguas africanas de bajos recursos sigue siendo escasa en comparación con el inglés, y la mayoría de los clasificadores disponibles se limitan a una sola lengua. Este checkpoint ofrece un único cabezal compartido para las 12 lenguas, con una puntuación media de `weighted_f1` de 0,5956 en una sola ejecución, lo que lo sitúa como una línea base razonable pero mejorable.

Arquitectónicamente es un transformer encoder de tipo XLM-RoBERTa (etiqueta `xlm-roberta` en el hub) con 125.630.976 parámetros totales (aproximadamente 0,5 GB de pesos en safetensors). Una particularidad importante: no es un `AutoModelForSequenceClassification` estándar, sino un clasificador con *mean pooling* sobre la máscara de atención más una capa lineal guardada aparte en `head.pt`, porque el token `<cls>` del modelo base nunca se entrenó. Esto condiciona su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (tag `xlm-roberta`); cola de clasificación con mean pooling sobre `attention_mask` y una capa lineal |
| Parametros totales | 125.630.976 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ajuste fino se realizo con `max_length` = 256 tokens |
| Tipos de cuantizacion | No se publican versiones cuantizadas; los pesos en safetensors permiten cuantizacion dinamica int8 y exportacion a ONNX de forma estandar |
| Idiomas soportados | 12: `amh`, `arq`, `ary`, `hau`, `ibo`, `kin`, `pcm`, `por`, `swa`, `tso`, `twi`, `yor` |
| Licencia | No disponible; el autor indica que la licencia y los terminos del modelo base (`castorini/afriberta_large`) rigen cualquier uso derivado |
| Formato de pesos | `safetensors` para el encoder, `head.pt` (PyTorch) para el cabezal, `labels.json` para el mapeo de etiquetas |

## Arquitectura y entrenamiento

El modelo parte de `castorini/afriberta_large`, un encoder de 125,6 millones de parametros con tokenizador y configuracion de la familia XLM-RoBERTa, preentrenado por el grupo Castorini sobre texto multilingue africano. La informacion disponible no detalla el volumen de tokens, la composicion exacta del corpus de preentrenamiento ni si hubo tecnicas de alineacion como RLHF o DPO; esos datos corresponden a la model card del modelo base, que no se ha incluido aqui.

El ajuste fino se realizo sobre AfriSenti en protocolo multilingue con los siguientes hiperparametros: 20 epocas, tasa de aprendizaje 5e-05, tamano de lote 32, longitud maxima de 256 tokens y metrica de seleccion `weighted_f1`. La innovacion tecnica destacable no esta en la arquitectura sino en la cabeza de clasificacion: como el token `<cls>` del encoder base nunca se entreno, el autor descarta ese vector y aplica *mean pooling* ponderado por la mascara de atencion antes de la capa lineal. El encoder se serializa en el formato habitual de Hugging Face y el cabezal se distribuye por separado en `head.pt`, con una unica capa lineal de dimension `hidden_size` x numero de etiquetas. El autor documenta que su arnes de evaluacion reproduce las lineas base publicadas de MasakhaNER 2.0 con una desviacion de aproximadamente 0,25 F1, de modo que las cifras estan calibradas, pero provienen de una sola ejecucion (los articulos de referencia promedian 5), por lo que las diferencias pequenas deben tratarse como ruido.

## Capacidades

- Clasificacion de sentimiento multilingue en 12 lenguas africanas y en portugues, con un unico cabezal compartido.
- Inferencia a nivel de texto corto (tweets, comentarios, resenas), con truncamiento a 256 tokens.
- Clasificacion por lotes: el codigo de ejemplo acepta una lista de textos y aplica padding y truncamiento automaticos.
- Capacidad de servir como extractor de caracteristicas: el encoder se puede cargar con `AutoModel` y reutilizar para otras tareas de secuencia (NER, clasificacion de topicos) anadiendo un cabezal nuevo.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, function calling ni comportamiento agentico: es un encoder discriminativo.
- No soporta vision, audio ni modo de razonamiento explicito.
- El conjunto de etiquetas concretas no se detalla en la informacion proporcionada; se distribuye en `labels.json` y corresponde al esquema de AfriSenti.

## Casos de uso

- Monitorizacion de opinion publica en mercados africanos: clasificar en tiempo real tuits y comentarios en suajili, hausa, yoruba, amárico o pidgin nigeriano para detectar cambios de tono hacia una marca o institucion, usando un solo modelo en lugar de doce clasificadores independientes.
- Analisis de sentimiento para investigacion social: procesar corpus de AfriSenti o de recoleccion propia con una linea base reproducible, dado que el autor documenta la calibracion del arnes de evaluacion frente a MasakhaNER 2.0.
- Triaje de tickets de atencion al cliente: preclasificar el tono de las reclamaciones (positivo/neutral/negativo) antes de enrutarlas a un agente humano, con coste de inferencia muy bajo por el tamano del modelo.
- Moderacion asistida de comunidades: priorizar comentarios con sentimiento fuertemente negativo en foros y redes, dejando la decision final a revision humana.
- Analisis de sentimiento en portugues: cubrir el mercado lusofono (Brasil, Portugal, PALOP) dentro del mismo pipeline que las lenguas africanas, sin anadir otro modelo.
- Filtrado y curación de corpus: puntuar grandes volumenes de texto web para construir subconjuntos con polaridad conocida destinados a entrenar o evaluar otros modelos.
- Baseline para competiciones y benchmarks: referencia rapida en tareas de clasificacion de sentimiento multilingue africano, con hiperparametros y metrica documentados de forma explicita.

## Benchmarks y rendimiento

La informacion disponible solo incluye la metrica agregada del ajuste fino, sin comparacion con otros modelos ni desglose por lengua.

| Metrica | Valor | Notas |
|---|---|---|
| `weighted_f1` (media sobre 12 lenguas) | 0.5956 | Una sola ejecucion; sin media sobre 5 semillas |
| Epocas | 20 | Configuracion del ajuste fino |
| Tasa de aprendizaje | 5e-05 | Configuracion del ajuste fino |
| Tamano de lote | 32 | Configuracion del ajuste fino |
| Longitud maxima | 256 | Truncamiento aplicado en entrenamiento y en el ejemplo de inferencia |

Las puntuaciones por lengua estan en `metrics.json`, fichero que no se ha proporcionado en esta ficha. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, logicamente fuera del alcance de un encoder discriminativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (coincide con el tamano del repo), unos 0,25 GB en fp16 y alrededor de 0,13 GB en int8.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas o en CPU para lotes pequenos.
- GPU de datacenter (A100, H100, L4, T4) innecesarias para inferencia individual; utiles solo para procesar millones de textos en paralelo.
- Opciones de despliegue: al no ser un `AutoModelForSequenceClassification` estandar, no funciona directamente con el pipeline `text-classification` de Transformers ni conservidores que esperen ese formato. Es necesario cargar el encoder con `AutoModel`, descargar `head.pt` y `labels.json`, y aplicar el mean pooling manualmente. Se puede exportar a ONNX o TorchScript tras envolver encoder y cabezal en un modulo unico; plataformas como vLLM o TGI no aplican porque estan orientadas a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (125 M de parametros) se espera inferencia en el orden de milisegundos por lote en GPU consumer, pero es una estimacion, no un dato medido.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentacion publica; el rendimiento sobre AfriSenti de estas alternativas no se ha verificado en la informacion disponible.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BeardedMonster/afriberta-large-afrisenti-multilingual` | 125,6 M | No disponible (ajuste a 256) | Encoder + mean pooling, clasificador de sentimiento de 12 lenguas | No disponible (sujeta al modelo base) | Hugging Face, 0 descargas |
| `castorini/afriberta_large` (modelo base) | 125,6 M | No disponible en la informacion | Encoder multilingue africano sin ajuste | No disponible en la informacion | Hugging Face |
| XLM-RoBERTa base | Aproximadamente 278 M | 512 tokens | Encoder multilingue generico | MIT | Hugging Face |
| mBERT | Aproximadamente 178 M | 512 tokens | Encoder multilingue generico | Apache 2.0 | Hugging Face |

La ventaja competitiva de este checkpoint es el tamano reducido (menos de la mitad que XLM-R base) y el ajuste especifico en 12 lenguas africanas; su desventaja es la ausencia de validacion externa y una licencia sin definir.

## Limitaciones y advertencias

- Licencia no declarada: el autor remite a la licencia del modelo base `castorini/afriberta_large`, que no se ha verificado aqui. Antes de un uso comercial es obligatorio revisar los terminos de ese repositorio.
- Incompatibilidad con la API estandar: no funciona con `AutoModelForSequenceClassification` ni con el pipeline `text-classification`; requiere cargar el encoder, el cabezal y las etiquetas por separado y replicar el mean pooling. Un error en el pooling invalida silenciosamente las predicciones.
- Truncamiento a 256 tokens: los textos mas largos pierden informacion. Ademas, el modelo base podria soportar secuencias mas largas, pero no se ha entrenado para este cabezal en esa configuracion.
- Rendimiento moderado: `weighted_f1` medio de 0,5956 en una unica ejecucion, sin media sobre semillas; las diferencias pequenas frente a otras lineas base no son estadisticamente significativas segun el propio autor.
- Sin desglose por lengua en esta ficha: el rendimiento puede variar mucho entre lenguas con mas o menos datos en AfriSenti (por ejemplo, suajili frente a tsonga). Conviene consultar `metrics.json`.
- Dominio limitado: AfriSenti se construye principalmente con tuits; el rendimiento en resenas formales, texto juridico o transcripciones puede degradarse.
- Riesgo de sesgo: los corpus de redes sociales sobrerrepresentan registros informales, variedades urbanas y opiniones de usuarios con acceso a internet; el modelo puede infrarepresentar variedades dialectales y registros rurales.
- Ambiguedad y sarcasmo: un clasificador de sentimiento de tres clases tiene un techo bajo en textos ironicos, con cambio de codigo o con negaciones complejas.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad ni de robustez.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y negativos con confianza alta; se recomienda umbral de decision y revision humana en aplicaciones sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/afriberta-large-afrisenti-multilingual
- Modelo base: https://huggingface.co/castorini/afriberta_large
- Articulo de referencia del conjunto de datos AfriSenti (no verificado en la busqueda): https://arxiv.org/abs/2302.08956
- Articulo de referencia de MasakhaNER 2.0, citado por el autor para calibrar el arnes de evaluacion: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponibles en la informacion proporcionada
