# AAU-NLP/Lite-FLANG-SL

## Resumen

Lite-FLANG-SL es un modelo de etiquetado de secuencias (token classification) especializado en la extracción de indicadores clave de rendimiento (KPI) financieros a partir de informes de resultados presentados ante la SEC (formularios 10-K y 10-Q). Lo desarrolla el grupo AAU-NLP de la Universidad de Aalborg y se construye mediante fine-tuning de SALT-NLP/FLANG-BERT, un BERT de dominio financiero, sobre el conjunto de datos HiFi-KPI Lite.

El modelo resuelve un problema muy concreto del procesamiento de documentos financieros: localizar menciones de magnitudes como ingresos, beneficios, beneficio por acción (EPS) y EBIT dentro de texto no estructurado, mapeándolas a una taxonomía curada por expertos. Se trata de la variante basada en FLANG del modelo Lite-BERT-SL dentro de la colección HiFi-KPI, y su interés actual radica en que ofrece una alternativa ligera (108,9 millones de parámetros) y de licencia permisiva para pipelines de extracción de información financiera.

Arquitectura BERT estándar para clasificación de tokens, con siete etiquetas de salida y entrenamiento exclusivamente en inglés. No genera texto ni devuelve registros estructurados con valores, fechas o divisas: su salida es a nivel de token, con etiqueta, puntuación y desplazamientos de caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) sobre SALT-NLP/FLANG-BERT |
| Parametros totales | 108.897.031 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada típica de BERT; la model card indica trocear los documentos largos en párrafos o fragmentos que quepan en la ventana) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 0,4 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con cabeza de clasificación de tokens (`BertForTokenClassification`), inicializado desde SALT-NLP/FLANG-BERT, un checkpoint BERT preentrenado en dominio financiero. Sobre esa base se realiza un fine-tuning supervisado de etiquetado de secuencias con el dataset AAU-NLP/hifi-kpi-lite, que emplea un espacio de etiquetas mapeado por expertos. El checkpoint tiene siete etiquetas de salida: `O`, `revenues`, `XBRL-OOS`, `earnings`, `eps`, `ebit` y `specialOOS`; las etiquetas guardadas usan nombres de entidad simples en lugar de prefijos BIO.

No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables habitualmente a un modelo de etiquetado). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El dataset y las tareas de extracción se describen en el artículo HiFi-KPI (arXiv:2502.15411), presentado en LREC 2026.

## Capacidades

- Etiquetado de tokens para reconocimiento de entidades financieras (NER) en texto de informes SEC 10-K y 10-Q.
- Detección de menciones de ingresos (`revenues`), beneficios (`earnings`), beneficio por acción (`eps`) y EBIT (`ebit`).
- Distinción de etiquetas fuera de alcance: `XBRL-OOS` (fuera de alcance según XBRL) y `specialOOS` (fuera de alcance especial).
- Reconocimiento de entidades orientado a documentos iXBRL.
- Mapeo de menciones financieras a categorías de KPI curadas por expertos.
- Salida a nivel de subtoken con etiqueta, puntuación de confianza y desplazamientos de caracteres, apta para su integración en pipelines posteriores.
- Capacidad multilingüe: no disponible; el modelo solo soporta inglés.
- Tool calling, function calling, razonamiento multi-paso, modo thinking, visión o audio: no disponibles; el modelo no es generativo.

## Casos de uso

- Extracción de KPIs en pipelines de análisis de informes 10-K y 10-Q: se trocea el documento en párrafos que quepan en la ventana del modelo y se ejecuta el etiquetado para localizar menciones de ingresos, beneficios, EPS y EBIT, que después se emparejan con los valores numéricos mediante reglas o un extractor adicional.
- Enriquecimiento de bases de datos financieras: el modelo identifica las menciones de KPI en el texto y permite asociarlas a los hechos XBRL ya presentes en el documento, facilitando la validación cruzada entre narrativa y datos estructurados.
- Validación de extracciones iXBRL: al reconocer las menciones textuales y marcar las que quedan fuera de alcance (`XBRL-OOS`), sirve como control de calidad sobre procesos de conversión a iXBRL.
- Preprocesado para modelos generativos: actúa como filtro de bajo coste (108,9 M de parámetros) que aísla los fragmentos relevantes de un informe extenso antes de pasarlos a un LLM, reduciendo el coste de inferencia y el riesgo de alucinación.
- Análisis comparativo entre empresas y periodos: al mapear las menciones a una taxonomía común de cuatro KPIs, permite agregar y comparar la presentación de magnitudes entre distintos emisores y trimestres.
- Investigación en NLP financiero: como checkpoint ligero y de licencia Apache 2.0, sirve de línea base reproducible para experimentos de etiquetado de secuencias en dominio financiero, junto con su contrapartida Lite-BERT-SL.
- Procesamiento por lotes de archivos regulatorios: su tamaño reducido permite desplegarlo en CPU o en GPU de gama media para procesar grandes volúmenes de presentaciones sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,4 GB en safetensors; con 108,9 M de parámetros, la inferencia en precisión completa requiere del orden de 0,5 GB de memoria, y menos aún con cuantización a 8 o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una GPU de gama media (por ejemplo, serie RTX 30/40) sobran para el despliegue.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `token-classification` de transformers (ejemplo oficial de la model card), así como servidores de inferencia compatibles con transformers (por ejemplo, TGI o vLLM, aunque no se documenta soporte específico). El modelo está marcado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lite-FLANG-SL | 108,9 M | no disponible | Etiquetado de tokens KPI financieros | Apache 2.0 | Hugging Face (AAU-NLP) |
| Lite-BERT-SL | no disponible | no disponible | Etiquetado de tokens KPI financieros (contrapartida BERT) | no disponible | Hugging Face (AAU-NLP) |
| FLANG-SL1000 | 0,1 B (aprox.) | no disponible | Etiquetado de secuencias financiero | no disponible | Hugging Face (AAU-NLP) |
| SALT-NLP/FLANG-BERT | no disponible | no disponible | Modelo base BERT de dominio financiero | no disponible | Hugging Face (SALT-NLP) |

Los datos de parámetros y licencia de los modelos comparables no están confirmados en la información disponible; se indican como no disponibles cuando no constan.

## Limitaciones y advertencias

- El modelo solo procesa inglés; no admite otros idiomas.
- No devuelve registros estructurados: la salida es a nivel de token (etiqueta, puntuación y offsets) y no incluye valores financieros, fechas ni divisas, que deben extraerse con componentes adicionales.
- Los documentos largos deben trocearse en párrafos o fragmentos que quepan en la ventana de entrada; la longitud de contexto exacta no está documentada.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos en la detección de menciones, especialmente en texto financiero ambiguo o con formatos poco habituales.
- Sesgos conocidos: no documentados; al entrenarse sobre informes SEC en inglés, el rendimiento puede degradarse en documentos de otras jurisdicciones, idiomas o estilos de redacción.
- El espacio de etiquetas es reducido (cuatro KPIs más etiquetas fuera de alcance); no cubre la totalidad de magnitudes financieras posibles.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero conviene revisar las condiciones del modelo base SALT-NLP/FLANG-BERT, cuya licencia no consta en la información disponible.
- El modelo tiene un uso muy limitado (11 descargas en el momento de la consulta) y no se han publicado benchmarks, por lo que su rendimiento en producción debe validarse con datos propios antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AAU-NLP/Lite-FLANG-SL
- Dataset HiFi-KPI Lite: https://huggingface.co/datasets/AAU-NLP/hifi-kpi-lite
- Artículo HiFi-KPI: https://huggingface.co/papers/2502.15411
- Repositorio de código HiFi-KPI: https://github.com/aaunlp/HiFi-KPI
- Modelo base SALT-NLP/FLANG-BERT: https://huggingface.co/SALT-NLP/FLANG-BERT
- Contrapartida Lite-BERT-SL: https://huggingface.co/AAU-NLP/Lite-BERT-SL
- Modelo relacionado FLANG-SL1000: https://huggingface.co/AAU-NLP/FLANG-SL1000
- Perfil de la organización AAU-NLP: https://huggingface.co/AAU-NLP/models
- Publicación LREC 2026: https://aclanthology.org/2026.lrec-1.30/
