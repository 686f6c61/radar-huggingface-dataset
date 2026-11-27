# 19Peppe95/gliner2-base-ita-v2

## Resumen

GLiNER2-Base-ITA-v2 es un extractor de entidades zero-shot y *schema-driven* especializado en documentos administrativos, fiscales, legales y sanitarios en italiano. Lo desarrolla el autor independiente 19Peppe95 como evolución de su versión anterior (v1) y se publica bajo licencia Apache 2.0. El modelo resuelve la extracción de entidades nombradas (NER), datos personales (PII) y campos estructurados con roles semánticos a partir de esquemas definidos en tiempo de inferencia, sin necesidad de reentrenamiento por tipo de documento.

Arquitectónicamente es un GLiNER2 de 307.098.645 parámetros totales: 277,54 M en el encoder `microsoft/mdeberta-v3-base`, 16,53 M en la cabeza `span_rep` y el resto repartido entre el módulo `count_lstm` y los proyectores de esquema. Se construye mediante *model merging* y aritmética de tareas sobre `fastino/gliner2-multi-v1` y `DeepMount00/GLiNER_PII_ITA`, con una descomposición SVD de bajo rango.

Su relevancia actual radica en que aborda dos limitaciones concretas de los modelos base: el horizonte de anchura de span insuficiente para la puntuación fiscal italiana (referencias normativas como «art.10 c.1 n.18 D.P.R. 633/1972» ocupan 18 tokens) y la falta de adaptación de la cabeza `span_rep` a convenciones documentales italianas (distinción entre número de factura y códigos de protocolo, importe de impuesto de timbre frente a base imponible, eliminación de tratamientos honoríficos en los nombres).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (encoder transformer `microsoft/mdeberta-v3-base` + cabeza de representación de spans `span_rep` + módulo `count_lstm` + proyectores de esquema) |
| Parametros totales | 307.098.645 (277,54 M encoder, 16,53 M cabeza `span_rep`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera sobre ventanas de span con `max_width = 26` tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Italiano (`it`) y multilingüe (`multilingual`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), configuración en `config.json` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura GLiNER2, un extractor de spans que representa entidades como pares (inicio, fin) sobre una ventana deslizante acotada por `max_width`. El encoder es `microsoft/mdeberta-v3-base`, sobre el que se monta una cabeza `span_rep` que puntúa candidatos de span, un módulo `count_lstm` y proyecciones que codifican el esquema de etiquetas proporcionado en inferencia. El word-splitter interno sigue el patrón `\w+(?:[-_]\w+)*|\S`, lo que fragmenta puntos y barras como tokens independientes y penaliza referencias normativas largas.

La construcción de la v2 se articula en tres estadios. El primero amplía `max_width` de 16 a 26, tanto en la raíz de `config.json` como en `span_head`; dado que `SpanMarkerV0` calcula las representaciones de span de forma dinámica hasta `max_width`, no hay matrices de embedding atadas a la anchura y el cambio es puramente estructural. Sobre `fastino/gliner2-multi-v1`, este ajuste aislado recupera 24 verdaderos positivos exactos de 145 entidades (razones sociales completas, causales médicas y técnicas y referencias normativas de 17 a 23 tokens). El segundo estadio aplica *model merging* y aritmética de tareas con descomposición SVD de bajo rango sobre los modelos base. El tercer estadio adapta de forma restringida la cabeza `span_rep`, que en Fastino y en la v1 permanecía congelada. La v1 ya había introducido el merging lineal selectivo sobre los layers 0 a 4 (60 tensores, α = 0,12, excluyendo LayerNorm y dejando intactos los layers 5 a 11 para no desalinear el espacio profundo del encoder respecto a la cabeza GLiNER2). Todas las modificaciones residen exclusivamente en los pesos y la configuración, sin expresiones regulares ni reglas heurísticas de post-procesado en tiempo de ejecución.

## Capacidades

- Extracción de entidades nombradas (NER) zero-shot: las etiquetas se definen en tiempo de inferencia mediante un esquema, sin reentrenamiento.
- Extracción de PII sobre documentos italianos, heredada del linaje `DeepMount00/GLiNER_PII_ITA`.
- Extracción *schema-driven* de campos estructurados con roles semánticos (por ejemplo, distinguir base imponible de impuesto de timbre, o número de factura de código de protocolo).
- Manejo de spans de hasta 26 tokens, suficiente para referencias normativas italianas de 17 a 23 tokens.
- Capacidad multilingüe declarada, aunque el ajuste específico está orientado al italiano.
- Procesamiento de documentos administrativos, fiscales, legales y sanitarios.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Extracción de campos en facturación electrónica italiana: el modelo recibe un esquema con etiquetas como «numero_fattura», «imponibile», «imposta_bollo» y «codice_fiscale», y devuelve los spans correspondientes. La adaptación de `span_rep` evita confundir el número de factura con códigos de protocolo o práctica y asigna al impuesto de timbre el importe de 2,00 € en lugar del importe principal.
- Anonimización y cumplimiento de PII en documentos sanitarios y legales: al ser un extractor de datos personales entrenado sobre corpus italiano, permite localizar nombres, identificadores fiscales y referencias antes de almacenar o compartir el documento.
- Digitalización de expedientes administrativos: con `max_width = 26` captura referencias normativas completas como «art.10 c.1 n.18 D.P.R. 633/1972», que los modelos base truncan a 16 tokens y pierden el prefijo «art.».
- Normalización de nombres de personas en contratos y escrituras: el modelo alinea los límites del span a la convención sin título honorífico, descartando «Ing.», «Dott.», «Sig.ra» o preámbulos condominiales del nombre propio.
- Enriquecimiento de metadatos en pipelines de gestión documental: la extracción schema-driven permite definir un esquema distinto por tipo de documento sin reentrenar, lo que simplifica el despliegue sobre lotes heterogéneos de documentos fiscales y administrativos.
- Construcción de conjuntos de datos etiquetados: el modelo puede usarse como pre-etiquetador en un flujo de anotación humana, reduciendo el coste de revisión en corpus italianos de dominio administrativo.
- Extracción de entidades en textos multilingües: aunque el ajuste está orientado al italiano, la ficha declara soporte multilingüe y validación externa sobre `WikiNEuRal` y `MultiNERD`.

## Benchmarks y rendimiento

Los resultados publicados proceden de un benchmark diagnóstico de desarrollo sobre 12 documentos fiscales y administrativos italianos con 145 entidades Gold, además de una validación externa sobre tres conjuntos públicos (600 textos, 1.213 entidades Gold). El propio autor advierte que el conjunto de desarrollo guió las decisiones de diseño y que sus cifras deben leerse como coherencia diagnóstica interna, no como estimación confirmativa sobre datos held-out.

| Benchmark | Metrica | gliner2-base-ita-v2 | fastino/gliner2-multi-v1 (mw=8) | v1 (mw=26) |
|---|---|---|---|---|
| Documentos fiscales y administrativos IT (145 entidades) | Exact F1 | 0,9041 (IC 95%: 0,8561–0,9453) | 0,7537 | no disponible |
| Documentos fiscales y administrativos IT (145 entidades) | Partial F1 | 0,9589 (IC 95%: 0,9236–0,9892) | 0,8358 | no disponible |
| Documentos fiscales y administrativos IT, a igual ventana mw=26 | Δ Exact F1 vs fastino | +0,0450 (IC 95% apareado: +0,0073 a +0,0827; p unilateral = 0,0080) | referencia | — |
| Documentos fiscales y administrativos IT, a igual ventana mw=26 | Δ Exact F1 vs v1 | +0,0440 (IC 95% apareado: +0,0058 a +0,0861; p unilateral = 0,0135) | — | referencia |
| ai4privacy | Exact F1 | +1,54 puntos sobre fastino mw=8 | referencia | no disponible |
| WikiNEuRal | Exact F1 | +0,88 puntos sobre fastino mw=8 | referencia | no disponible |
| MultiNERD | Exact F1 | +0,60 puntos sobre fastino mw=8 | referencia | no disponible |
| Media externa ponderada por entidades | F1 | 0,7749 | no disponible | 0,7716 |

El incremento en Exact F1 frente a la v1 y a Fastino se atribuye a partes iguales a la desambiguación semántica (impuesto de timbre frente a base imponible, número de factura frente a código de práctica) y al alineamiento de los límites de los nombres a la convención sin título honorífico. La mejora no es significativa en Partial F1, donde el intervalo de la diferencia incluye el cero.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, el repositorio ocupa 1,2 GB en safetensors, lo que sugiere que el modelo completo en fp32 rondaría 1,2 GB y en fp16 unos 0,6 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el reducido tamaño del repositorio sugiere que podría ejecutarse en GPUs de consumo, pero no hay datos publicados al respecto.
- Opciones de despliegue: la librería declarada es `gliner2`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / anchura de span | Exact F1 (benchmark fiscal IT) | Licencia | Relación |
|---|---|---|---|---|---|
| 19Peppe95/gliner2-base-ita-v2 | 307,10 M | `max_width = 26` | 0,9041 | Apache 2.0 | Este modelo |
| 19Peppe95/gliner2-base-ita-v1 | no disponible (derivado de GLiNER2 base) | `max_width = 16` | Δ −0,0440 frente a v2 (a igual mw=26) | Apache 2.0 | Versión anterior del mismo autor |
| fastino/gliner2-multi-v1 | no disponible | `max_width = 8` por defecto | 0,7537 | no disponible en la información | Modelo base multilingüe |
| DeepMount00/GLiNER_PII_ITA | no disponible | no disponible | no disponible | no disponible en la información | Modelo base especializado en PII italiana |

## Limitaciones y advertencias

- El benchmark principal es un conjunto de desarrollo de 12 documentos y 145 entidades que guió las decisiones de diseño; sus cifras no constituyen una estimación confirmativa sobre datos held-out.
- La mejora frente a la v1 y a Fastino no es estadísticamente significativa en Partial F1, solo en Exact F1.
- El modelo está diseñado para extracción schema-driven con roles semánticos, no como sustituto generalista de modelos NER o PII especializados.
- El ajuste específico se orienta al italiano; el rendimiento en otras lenguas no está cuantificado más allá de la validación externa agregada.
- El word-splitter fragmenta puntos y barras como tokens independientes, por lo que estructuras con puntuación densa siguen consumiendo presupuesto de anchura aunque `max_width` se haya ampliado a 26.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- No se documentan restricciones adicionales de licencia para uso comercial más allá de la licencia Apache 2.0 declarada.
- No hay datos publicados sobre cuantización, latencia, throughput ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/19Peppe95/gliner2-base-ita-v2
- Versión anterior v1: https://huggingface.co/19Peppe95/gliner2-base-ita-v1
- Modelo base multilingüe: https://huggingface.co/fastino/gliner2-multi-v1
- Modelo base de PII italiana: https://huggingface.co/DeepMount00/GLiNER_PII_ITA
- Encoder: https://huggingface.co/microsoft/mdeberta-v3-base
