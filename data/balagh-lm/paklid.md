# balagh-lm/paklid

## Resumen

PakLID v1 es un clasificador de identificación de idioma desarrollado por Balagh (Ownova), publicado en HuggingFace bajo el identificador `balagh-lm/paklid`. No es un modelo generativo ni una red neuronal: se trata de un pipeline clásico de TF-IDF sobre n-gramas de caracteres (1 a 5) combinado con una SVM lineal calibrada, serializado con `joblib`. Su propósito es identificar las lenguas de Pakistán escritas en escritura perso-árabe, además de roman urdu, persa, árabe y英語 —inglés— como idiomas "confusores" que aparecen mezclados en corpus web de la región.

El problema que resuelve es muy concreto: las etiquetas de idioma que asignan los rastreadores web y los filtros upstream a los corpus multilingües son poco fiables en el sur de Asia, donde conviven alfabetos y lenguas mutuamente inteligibles parcialmente (urdu, punjabi occidental, saraiki, hindko, pahari-potwari, sindhi, pastún, balochi, brahui, cachemir). PakLID está pensado para re-clasificar y reordenar esos buckets de corpus antes de usarlos en entrenamiento.

El modelo cubre 14 etiquetas y reporta un macro F1 de 0,974 y una exactitud de 0,981 sobre 7.209 fragmentos de un conjunto de evaluación retenido con partición agrupada por documento, lo que evita la fuga de información entre fragmentos del mismo documento. Su tamaño de repositorio es de 0,1 GB y la inferencia es puramente CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-IDF de n-gramas de caracteres (1-5) + SVM lineal calibrada (clasificador, no red neuronal) |
| Parámetros totales | no disponible (no es un modelo de parámetros; ver nota) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; la llamada de ejemplo trunca la entrada a 500 caracteres (`text[:500]`) |
| Tipos de cuantización | no aplica (serialización `joblib`, sin pesos cuantizables) |
| Idiomas soportados | 14 etiquetas: `arb_Arab`, `bal_Arab`, `brh_Arab`, `eng_Latn`, `fas_Arab`, `hno_Arab`, `kas_Arab`, `pbt_Arab`, `phr_Arab`, `pnb_Arab`, `skr_Arab`, `snd_Arab`, `urd_Arab`, `urd_Latn` |
| Licencia | apache-2.0 |
| Formato de pesos | `joblib` (`paklid-v1.joblib`) |
| Pipeline de HuggingFace | no disponible |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

Nota sobre "parámetros totales": al ser un modelo lineal sobre un espacio disperso de n-gramas, el número de coeficientes depende del vocabulario efectivo del vectorizador. La model card no publica esa cifra, por lo que se indica como no disponible.

Correspondencia de etiquetas según el código ISO 639-3 empleado: `arb` árabe estándar, `bal` balochi, `brh` brahui, `eng` inglés, `fas` persa, `hno` hindko septentrional, `kas` cachemir, `pbt` pastún meridional, `phr` pahari-potwari, `pnb` punjabi occidental, `skr` saraiki, `snd` sindhi, `urd` urdu; el sufijo indica la escritura (`Arab` perso-árabe, `Latn` latina, usada para el roman urdu).

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal en dos etapas: primero un vectorizador TF-IDF sobre n-gramas de caracteres de longitud 1 a 5, y después una SVM lineal con calibración de probabilidades (`predict_proba`). El uso de n-gramas de caracteres en lugar de palabras es adecuado para este dominio porque las lenguas perso-árabes de Pakistán comparten alfabeto y sufren variación ortográfica; los n-gramas capturan morfología y ortografía sin necesitar segmentación ni tokenizador lingüístico. El modelo devuelve, por tanto, una distribución de probabilidad calibrada sobre las 14 etiquetas.

El preprocesado es parte integral del modelo y debe replicarse exactamente: conversión de dígitos a ASCII, eliminación de tatweel y caracteres de anchura cero, plegado de la yeh y la kaf árabes a sus formas urdu, y minúsculas para el texto latino. Las funciones de normalización de referencia son `lid_norm` y `base_norm`, definidas en `phase0/colab/01_build_corpus.py` del repositorio `github.com/balagh-lm/balagh`.

No se publican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del corpus, ni si hubo ajuste fino adicional más allá del entrenamiento supervisado del clasificador. La evaluación se realizó sobre un conjunto retenido de 7.209 fragmentos con partición agrupada por documento (document-grouped), una decisión metodológica relevante porque evita que fragmentos del mismo documento aparezcan a la vez en entrenamiento y test, algo habitual en identificadores de idioma sobre corpus web.

## Capacidades

- Identificación de idioma a nivel de fragmento corto para 12 lenguas en escritura perso-árabe más roman urdu e inglés.
- Salida de probabilidad calibrada por clase (`predict_proba`), lo que permite aplicar umbrales de confianza y descartar fragmentos ambiguos en lugar de forzar una etiqueta.
- Discriminación explícita de pares y tríos de lenguas habitualmente confundidas: urdu frente a hindko y pahari-potwari; punjabi occidental frente a saraiki; balochi frente a brahui; persa frente a árabe.
- Detección de roman urdu (`urd_Latn`) separado del inglés (`eng_Latn`), un caso especialmente problemático en texto informal de redes sociales.
- Manejo de texto ruidoso de web mediante normalización previa (dígitos, tatweel, caracteres de anchura cero, plegado de yeh/kaf, minúsculas).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es exclusivamente un clasificador.

## Casos de uso

- Limpieza de corpus web multilingües: re-etiquetar buckets descargados con etiquetas upstream poco fiables antes de incorporarlos a un dataset de preentrenamiento, usando `predict_proba` para descartar los fragmentos con confianza baja en lugar de asignarles una lengua dudosa.
- Enrutamiento de contenido hacia modelos especializados: en una plataforma que sirva contenido en urdu, sindhi y punjabi, el clasificador decide qué modelo o qué pipeline de normalización aplicar a cada documento antes de procesarlo.
- Balanceo y auditoría de datasets: cuantificar la proporción real de cada lengua en un corpus y detectar desequilibrios o contaminación cruzada (por ejemplo, persa colándose en un conjunto supuestamente urdu), dado que las 14 clases están cubiertas con métricas por clase publicadas.
- Filtrado de datos para entrenar modelos generativos regionales: separar las porciones en cada lengua perso-árabe para construir mezclas de entrenamiento con proporciones controladas, un paso previo habitual antes de entrenar o ajustar modelos mayores.
- Análisis de redes sociales y foros: clasificar publicaciones cortas en escritura latina para distinguir roman urdu de inglés, útil en estudios de opinión o moderación de contenido en comunidades paquistaníes.
- Pre-anotación en proyectos de anotación lingüística: generar etiquetas automáticas de alta confianza que un humano solo revisa en los casos límite, reduciendo el coste de construir corpus etiquetados para lenguas de bajos recursos.
- Control de calidad en pipelines de ASR o OCR: verificar que las transcripciones generadas corresponden realmente a la lengua esperada del audio o de la imagen antes de publicarlas.
- Deduplicación semántica por lengua: al agrupar documentos por idioma detectado, mejorar la deduplicación de corpus (near-duplicates suelen aparecer en la misma lengua) y evitar contar el mismo contenido en varias mezclas.

## Benchmarks y rendimiento

Evaluación sobre conjunto retenido con partición agrupada por documento, 7.209 fragmentos. Macro F1 global: 0,974. Exactitud global: 0,981.

| Etiqueta | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| arb_Arab | 0,965 | 0,995 | 0,980 | 442 |
| bal_Arab | 0,963 | 0,892 | 0,926 | 204 |
| brh_Arab | 0,976 | 0,929 | 0,952 | 309 |
| eng_Latn | 0,987 | 1,000 | 0,993 | 444 |
| fas_Arab | 0,985 | 0,996 | 0,990 | 453 |
| hno_Arab | 0,933 | 0,970 | 0,951 | 101 |
| kas_Arab | 1,000 | 0,986 | 0,993 | 422 |
| pbt_Arab | 0,998 | 0,995 | 0,997 | 613 |
| phr_Arab | 1,000 | 0,899 | 0,947 | 109 |
| pnb_Arab | 0,975 | 0,991 | 0,983 | 799 |
| skr_Arab | 0,984 | 0,954 | 0,968 | 693 |
| snd_Arab | 1,000 | 0,993 | 0,997 | 764 |
| urd_Arab | 0,930 | 0,979 | 0,954 | 729 |
| urd_Latn | 1,000 | 0,995 | 0,997 | 1127 |

La suma de soportes (7.209) coincide con el tamaño del conjunto de evaluación indicado en la model card. No se han publicado resultados de benchmarks en la información disponible para tareas generativas (MMLU, HumanEval, GSM8K u otras), ya que el modelo no las aborda, ni comparaciones contra otros identificadores de idioma sobre el mismo conjunto.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una SVM lineal sobre TF-IDF, sin requisitos de GPU. No se publica latencia ni throughput medidos.
- VRAM: no aplica (0 GB de VRAM dedicada). El repositorio completo ocupa 0,1 GB, por lo que el proceso puede residir cómodamente en memoria de sistema de cualquier máquina actual.
- GPU recomendadas: ninguna; cualquier GPU sería irrelevante para este clasificador.
- Cabe en cualquier equipo de consumo: portátil, contenedor pequeño, función serverless o incluso un servicio edge. No necesita GPU de consumo (RTX 4090, etc.) ni aceleradores de datacenter (A100, H100).
- Despliegue: servicio Python con `scikit-learn` + `joblib` cargando el artefacto desde HuggingFace (`hf_hub_download`), API HTTP propia, o integración como etapa de preprocesado en un pipeline de datos (Spark, Dask, Airflow). El formato no es compatible con vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos generativos.
- Dado que el coste por documento es una multiplicación dispersa, el rendimiento vendrá limitado por el vectorizador TF-IDF y por el truncado a 500 caracteres, no por el clasificador; conviene paralelizar a nivel de proceso o lote en lugar de buscar aceleración por hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura de lenguas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PakLID v1 | Clasificador TF-IDF + SVM lineal | 14 etiquetas, foco en lenguas perso-árabes de Pakistán + roman urdu, persa, árabe, inglés | Características de n-gramas de caracteres, sin red neuronal | apache-2.0 | HuggingFace (`balagh-lm/paklid`), artefacto `joblib` |
| fastText `lid.176` | Clasificador neuronal (bolsa de n-gramas + softmax) | Muy amplia (cientos de idiomas, etiquetas ISO 639-1/639-3) | Embeddings de n-gramas de caracteres promediados | no disponible en la información proporcionada | Distribuido por Facebook AI / fastText |
| GlotLID | Clasificador neuronal | Muy amplia (miles de etiquetas) | Modelo tipo fastText entrenado a gran escala | no disponible en la información proporcionada | HuggingFace (`cis-lmu/glotlid`) |
| CLD3 | Clasificador neuronal ligero | Amplia (más de un centenar de idiomas) | Red pequeña sobre n-gramas de caracteres | no disponible en la información proporcionada | Repositorio de Google |

Diferencias cualitativas relevantes: los identificadores generalistas cubren muchos más idiomas, pero suelen tener un rendimiento notablemente peor en lenguas de bajos recursos y en pares cercanos como urdu/hindko/pahari-potwari o balochi/brahui, y a menudo no separan roman urdu del inglés ni distinguen persa de árabe con precisión. PakLID renuncia a la cobertura amplia para especializarse en un inventario cerrado de 14 etiquetas con métricas publicadas por clase. No se dispone de una comparación numérica directa entre PakLID y estas alternativas sobre el mismo conjunto de evaluación.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona, no escribe código y no admite tool calling ni flujos de agente. Cualquier expectativa en ese sentido es un error de uso.
- El truncado a 500 caracteres en la llamada de ejemplo implica que no se aprovecha el contexto del documento completo; fragmentos muy cortos (unas pocas palabras, nombres propios, URLs) son propensos a errores.
- Requiere replicar exactamente la normalización de entrenamiento (dígitos ASCII, eliminación de tatweel y caracteres de anchura cero, plegado de yeh/kaf, minúsculas). Omitirla degrada el rendimiento sin aviso y es la causa más probable de discrepancias respecto a las métricas publicadas.
- Las clases con menor soporte en evaluación son `hno_Arab` (101), `phr_Arab` (109) y `bal_Arab` (204); sus métricas tienen mayor incertidumbre y su comportamiento en dominios distintos al corpus de entrenamiento no está documentado.
- Los recalls más bajos son los de `bal_Arab` (0,892) y `phr_Arab` (0,899): el modelo tiende a no asignar estas etiquetas cuando debería, derivando fragmentos hacia clases vecinas.
- La precisión de `urd_Arab` es la más baja del conjunto (0,930) junto con `hno_Arab` (0,933): cabe esperar confusión entre urdu e hindko en textos cortos o muy dialectales.
- No se documentan sesgos por origen del corpus, género del autor, registro (formal frente a coloquial) ni dominio (noticias frente a redes sociales); la partición agrupada por documento reduce la fuga de información, pero no elimina el sesgo de dominio.
- La información disponible no detalla la composición del corpus de entrenamiento ni su procedencia, lo que impide evaluar la representatividad para dominios distintos (jurídico, médico, transcripciones de voz).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el equivalente funcional, es decir, asignar una etiqueta con alta confianza a texto ambiguo o a idiomas fuera del inventario de 14 clases. El modelo no tiene clase "otro", por lo que un texto en una lengua no cubierta (por ejemplo, turco o birmano) se forzará hacia la clase más parecida.
- Licencia apache-2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Conviene revisar igualmente las condiciones de los datos de entrenamiento, no publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/balagh-lm/paklid
- Artefacto del modelo: https://huggingface.co/balagh-lm/paklid/blob/main/paklid-v1.joblib
- Repositorio de código (funciones de normalización `lid_norm` y `base_norm` en `phase0/colab/01_build_corpus.py`): https://github.com/balagh-lm/balagh
- Paper técnico: no disponible
- Blog o demo: no disponible
- Datos de benchmarks adicionales: no disponible
