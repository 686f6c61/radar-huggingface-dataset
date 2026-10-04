# HasanPekedis/dbmdz_bert-base-turkish-cased_org_jsonl_6_16_512_3e-5

## Resumen

El modelo `HasanPekedis/dbmdz_bert-base-turkish-cased_org_jsonl_6_16_512_3e-5` es un clasificador de tokens (token classification) derivado de `dbmdz/bert-base-turkish-cased`, ajustado especificamente para el reconocimiento de entidades nombradas (NER) de tipo organizacion (`ORG`) en turco. Su unica tarea es etiquetar cada token de una secuencia con el esquema BIO de tres etiquetas (`O`, `B-ORG`, `I-ORG`), de modo que detecta nombres de empresas, clubes deportivos, instituciones publicas, partidos politicos, universidades, periodicos, federaciones y organizaciones internacionales.

Se trata de un encoder BERT clasico de 12 capas con 110.029.059 parametros, ventana maxima de 512 tokens y tokenizacion *cased* (sensible a mayusculas/minusculas), lo que resulta relevante porque en turco la mayusculizacion es un indicio fiable de nombre propio. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors. No hay informacion publicada sobre licencia, pipeline declarado ni idiomas en los metadatos de HuggingFace.

El modelo es relevante para pipelines de extraccion de informacion en turco, donde un detector especializado en `ORG` con un F1 de 0,9089 sobre 2.558 entidades de test puede integrarse como componente de un sistema NER mayor, como paso previo a entity linking o como modulo de enriquecimiento de corpus periodisticos, deportivos o administrativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) para token classification |
| Parametros totales | 110.029.059 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo de secuencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | turco |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Etiquetas | `O`, `B-ORG`, `I-ORG` |
| Modelo base | `dbmdz/bert-base-turkish-cased` |
| Tamano del repositorio | 0,4 GB |
| Tarea | Named Entity Recognition (extraccion de organizaciones) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base: un encoder transformer bidireccional con mecanismo de atencion completa, sobre el que se anade una cabeza de clasificacion por token que proyecta la representacion de cada subword a las tres etiquetas BIO. El modelo parte de `dbmdz/bert-base-turkish-cased`, un checkpoint preentrenado especificamente en turco, y se ajusta de forma supervisada sobre un corpus anotado con entidades `ORG`.

La configuracion de entrenamiento documentada por el autor es: 6 epocas, tamano de lote 16, tasa de aprendizaje 3e-5, weight decay 0,01, warmup ratio 0,1, longitud maxima de secuencia 512, semilla 42 y sin label smoothing. Un detalle tecnico relevante es que las etiquetas de subword no se propagaron a todos los subtokens: solo el primer subtoken de cada token original recibe etiqueta. Esto es una decision de diseno con implicaciones directas en la inferencia, ya que el modelo tiende a marcar unicamente la primera pieza de una palabra segmentada y puede fragmentar entidades multi-palabra.

No se documenta el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO (no aplicables a una tarea discriminativa de etiquetado). Tampoco hay innovaciones arquitectonicas adicionales: es un fine-tuning estandar de clasificacion de tokens.

## Capacidades

- Reconocimiento de organizaciones (`ORG`) en texto turco con esquema BIO de tres etiquetas.
- Cobertura de subtipos: empresas, clubes deportivos, selecciones y ligas, instituciones gubernamentales, partidos politicos, universidades, periodicos, organizaciones internacionales, federaciones y asociaciones.
- Procesamiento de secuencias de hasta 512 tokens en una sola pasada.
- Tokenizacion *cased*, aprovechando la distincion mayuscula/minuscula como senal de nombre propio en turco.
- Entidades multi-palabra mediante las etiquetas `B-ORG` e `I-ORG` (por ejemplo, `Türkiye Futbol Federasyonu`).
- No genera texto, no soporta tool calling ni function calling, no implementa razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades multimodales (ni vision ni audio).
- No detecta otras categorias de entidad (`PER`, `LOC`, `MISC`, fechas, cantidades); solo `ORG`.

## Casos de uso

- Extraccion de entidades en prensa turca: el modelo procesa articulos de hasta 512 tokens y devuelve las organizaciones mencionadas, util para construir indices de empresas y clubes citados en un corpus periodistico.
- Enriquecimiento de bases de conocimiento: alimentar un pipeline de entity linking donde el candidato sea siempre una organizacion, reduciendo el espacio de busqueda antes de resolver el identificador externo.
- Analisis de competiciones deportivas: extraer clubes, ligas y federaciones de cronicas y fichas de jugadores, como muestran los ejemplos cualitativos del autor (`Süper Lig`, `İstanbul Başakşehir`, `Karabükspor`).
- Monitorizacion de menciones corporativas: seguimiento de apariciones de una empresa o marca en flujos de noticias o redes, con agregacion temporal de menciones detectadas.
- Cumplimiento y analitica regulatoria: localizar entidades organizativas en documentos administrativos turcos para clasificar expedientes por organismo emisor o contraparte.
- Preanotacion de corpus para anotacion humana: usar el modelo como etiquetador automatico previo y reservar la revision manual para los casos de baja confianza, reduciendo el coste de crear datasets NER en turco.
- Indexacion y busqueda semantica: poblar un campo de "organizaciones" en un motor de busqueda documental para permitir filtros faceted por entidad.

## Benchmarks y rendimiento

El autor publica resultados de validacion por epoca y de test sobre un split retenido. No se comparan con otros modelos en la informacion disponible.

Resultados de validacion:

| Epoca | Training loss | Validation loss | Precision | Recall | F1 |
|---:|---:|---:|---:|---:|---:|
| 1 | 0,070829 | 0,074509 | 0,858979 | 0,907292 | 0,882475 |
| 2 | 0,045939 | 0,067323 | 0,888288 | 0,891389 | 0,889835 |
| 3 | 0,026533 | 0,071673 | 0,911776 | 0,897983 | 0,904827 |
| 4 | 0,013831 | 0,071945 | 0,900935 | 0,934833 | 0,917571 |
| 5 | 0,010376 | 0,080658 | 0,901509 | 0,926687 | 0,913925 |
| 6 | 0,006634 | 0,100311 | 0,920221 | 0,903801 | 0,911937 |

Mejor F1 de validacion: 0,917571 en la epoca 4.

Resultados de test (2.558 entidades `ORG`):

| Entidad | Precision | Recall | F1 | Support |
|---|---:|---:|---:|---:|
| ORG | 0,8938 | 0,9246 | 0,9089 | 2558 |
| micro avg | 0,8938 | 0,9246 | 0,9089 | 2558 |
| macro avg | 0,8938 | 0,9246 | 0,9089 | 2558 |
| weighted avg | 0,8938 | 0,9246 | 0,9089 | 2558 |

La evaluacion cualitativa incluida en la model card muestra 30 ejemplos, con casos correctos como `Süper Lig`, `İstanbul Başakşehir`, `SpVgg Greuther Fürth` o `1998 Dünya Halter Şampiyonası`, y errores como marcar `Alike` como organizacion en `Creative Commons lisansı (Attribution-Share Alike)`.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,5-1 GB en FP32 para los 110 millones de parametros mas activaciones; en FP16 baja a unos 0,3-0,5 GB. Son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100. No requiere aceleradores de gama alta.
- Inferencia en CPU: viable para lotes moderados, dado el tamano del modelo; el cuello de botella sera el throughput, no la memoria.
- Cabe con holgura en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas, e incluso en iGPU con memoria compartida para cargas ligeras.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `pipeline("token-classification")`, exportacion a ONNX Runtime, TorchScript, TorchServe, o integracion en un servicio FastAPI. Las herramientas orientadas a modelos generativos como llama.cpp, GGUF u Ollama no aplican directamente a este modelo.
- Latencia y throughput: no disponibles. Como referencia general de la familia BERT-base en GPU moderna, el rendimiento suele situarse en el rango de cientos a miles de secuencias cortas por segundo, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`HasanPekedis/..._org_jsonl_6_16_512_3e-5`) | 110.029.059 | 512 tokens | NER de `ORG` en turco | no disponible | HuggingFace, safetensors |
| `dbmdz/bert-base-turkish-cased` | 110 millones (BERT base) | 512 tokens | Modelo de lenguaje enmascarado (base, sin cabeza NER) | no disponible en la informacion proporcionada | HuggingFace |
| `xlm-roberta-base` ajustado a NER turco | 278 millones aprox. | 512 tokens | NER multilingue (requiere fine-tuning) | MIT (modelo base) | HuggingFace |
| BERTurk (`dbmdz/bert-base-turkish-uncased`) | 110 millones | 512 tokens | Modelo de lenguaje enmascarado en turco | no disponible en la informacion proporcionada | HuggingFace |

No hay resultados de benchmarks comparativos publicados en la informacion disponible; las cifras de parametros de los modelos alternativos son datos generales de sus arquitecturas, no mediciones sobre este conjunto de test.

## Limitaciones y advertencias

- Alcance restringido a una sola clase de entidad: el modelo solo etiqueta `ORG`. No detecta personas, lugares, fechas ni cantidades, por lo que no sustituye a un NER completo.
- Sesgos del dominio de entrenamiento: los ejemplos cualitativos estan dominados por deporte, prensa y biografias. El rendimiento puede degradarse en dominios como medicina, derecho o textil tecnico.
- Riesgo de alucinacion de entidades: como todo clasificador de tokens, puede marcar falsos positivos. En la evaluacion cualitativa se observa al menos un caso, `Alike`, etiquetado incorrectamente como organizacion.
- Propagacion de etiquetas solo al primer subtoken: el diseno de entrenamiento puede fragmentar entidades cuyos subtokens no empiecen con `B-ORG` o provocar fronteras imprecisas en palabras compuestas y en turco aglutinante.
- Limite de 512 tokens: los documentos mas largos deben trocearse, con el riesgo de perder entidades que queden partidas en el limite de ventana.
- Licencia no disponible: la model card no especifica terminos, y los metadatos de HuggingFace tampoco. Antes de un uso comercial es imprescindible contactar con el autor y verificar la licencia del modelo base `dbmdz/bert-base-turkish-cased`.
- Modelo sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin revision por pares ni evaluacion independiente. Los unicos resultados disponibles son los que publica el propio autor.
- Fecha de creacion registrada como 2026-10-04 en los metadatos, lo que conviene verificar antes de citarlo.
