# impresso-project/mmbert-impresso-mediasources-ner

## Resumen

mmBERT Impresso Media Sources NER es un modelo de clasificación de tokens (token classification) especializado en el reconocimiento de menciones de fuentes mediáticas citadas en texto de prensa histórica. Lo desarrolla el proyecto Impresso y se distribuye con licencia MIT. El modelo identifica dos familias concretas de entidades: agencias de noticias (etiqueta `org.ent.pressagency.<canonical_id>`) y emisoras de radio (etiqueta `org.ent.radiostation.<canonical_id>`), lo que lo convierte en una herramienta de enriquecimiento de corpus y curación asistida, no en un NER de propósito general.

Técnicamente se apoya en una arquitectura ModernBERT (la base es `impresso-project/mmbert-multilingual-impresso-continued-mlm`, cuyo origen es `jhu-clsp/mmBERT-base`) con 307.606.371 parámetros totales. El ajuste fino se realizó partiendo de un checkpoint sometido a MLM continuado sobre texto de Impresso, lo que adapta el modelo al dominio de la prensa histórica. La versión publicada es la v2.0.1 (revisión de modelo v2.1.0) y emplea una política de decodificación `first_subtoken_viterbi`, que fue la que mejor F1 de entidad exacta obtuvo en validación.

Su relevancia actual radica en que cubre una tarea muy específica y poco atendida: la extracción de fuentes citadas en corpus periodísticos históricos multilingües (francés, alemán y luxemburgués). Con un F1 de entidad exacta de 0,8902 en el conjunto de test retenido y más de 20.000 descargas, es un componente práctico para pipelines de humanidades digitales y análisis de medios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), ajuste fino de `impresso-project/mmbert-multilingual-impresso-continued-mlm` |
| Parametros totales | 307.606.371 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | fr, de, lb |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER de fuentes mediáticas) |
| Etiquetas | `org.ent.pressagency.<canonical_id>`, `org.ent.radiostation.<canonical_id>` |
| Decodificación | `first_subtoken_viterbi` |
| Tokenización de anotación | `unicode-word-punctuation-v1` |
| Tamaño del repo | 3,7 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT afinado para clasificación de tokens. Parte de `impresso-project/mmbert-multilingual-impresso-continued-mlm`, un checkpoint de `jhu-clsp/mmBERT-base` sometido a modelado de lenguaje enmascarado (MLM) continuado sobre texto de Impresso, lo que adapta las representaciones al registro de la prensa histórica. Durante el ajuste fino se descongelaron únicamente las tres capas superiores de ModernBERT, con semilla aleatoria 42 y selección del checkpoint de la época 11 (`best`).

Los datos de entrenamiento provienen del dataset `impresso-project/impresso-mediaagencies-ner-dataset` en su revisión v2.1.0 (commit `26864265198dc5d68fd26018a134574a99caa249`). La supervisión se aplica a todos los subtokens, con conversión B-to-I para subtokens de continuación, y la tokenización de anotación sigue la política `unicode-word-punctuation-v1`. Se compararon cuatro decodificadores sobre el mismo checkpoint de la época 11 en el split de validación, y se publicó `first_subtoken_viterbi` por alcanzar el mayor F1 de entidad exacta (0,9290). La configuración del modelo registra explícitamente la tokenización de anotación, la supervisión de subtokens y la política de decodificación, y la inferencia en tiempo de ejecución aplica esa misma tokenización y decodificador.

## Capacidades

- Reconocimiento de menciones de agencias de noticias citadas, con etiqueta `org.ent.pressagency.<canonical_id>`.
- Reconocimiento de menciones de emisoras de radio citadas, con etiqueta `org.ent.radiostation.<canonical_id>`.
- Clasificación de tokens a nivel de subtoken con decodificación Viterbi sobre el primer subtoken.
- Procesamiento multilingüe en francés, alemán y luxemburgués.
- Adaptación específica al dominio de prensa histórica gracias al MLM continuado sobre corpus Impresso.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; es un modelo exclusivamente de etiquetado de secuencias.
- El espacio de etiquetas está diseñado para poder crecer en el futuro a otras familias de fuentes mediáticas citadas, aunque la versión actual solo cubre agencias y emisoras.

## Casos de uso

- Enriquecimiento de corpus de prensa histórica: el modelo etiqueta automáticamente las agencias y emisoras citadas en cada artículo, permitiendo construir índices de fuentes por documento, fecha o publicación para su explotación posterior en plataformas de humanidades digitales.
- Curación asistida de archivos periodísticos: se integra en flujos donde un documentalista revisa las menciones detectadas, reduciendo el trabajo manual de identificación de fuentes citadas en colecciones de gran volumen.
- Análisis de redes de fuentes: al extraer las menciones canónicas de agencias y emisoras, se pueden trazar relaciones entre publicaciones y fuentes a lo largo del tiempo para estudios de historia de los medios.
- Búsqueda y filtrado semántico en archivos: las etiquetas generadas permiten construir facetas de búsqueda por agencia o emisora citada, mejorando la recuperación de artículos relevantes en portales de archivo.
- Investigación en comunicación y sociología de los medios: la extracción sistemática de fuentes citadas facilita estudios cuantitativos sobre dependencia de agencias y presencia de la radio en la prensa de una época.
- Pipelines de preservación digital: como modelo ligero de token classification con licencia MIT, puede desplegarse dentro de flujos internos de digitalización y catalogación sin restricciones de uso comercial.
- Normalización de entidades en bases de datos bibliográficas: la salida con identificadores canónicos permite mapear menciones textuales variables a entradas controladas de un vocabulario de fuentes.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 de entidad exacta, precisión y recall):

| Split | Precision | Recall | F1 entidad exacta | Correctas / gold / predichas |
|---|---:|---:|---:|---|
| Validación | 0,9567 | 0,9029 | 0,9290 | 530 / 587 / 554 |
| Test retenido | 0,9341 | 0,8502 | 0,8902 | 539 / 634 / 577 |

Comparación de decodificadores sobre el checkpoint de la época 11 en validación:

| Decoder | F1 entidad exacta (validación) |
|---|---:|
| `first_subtoken_viterbi` | 0,9290 |
| `all_subtoken_viterbi` | 0,9247 |
| `all_subtoken` | 0,9026 |
| `first_subtoken` | 0,8995 |

La verificación del artefacto publicado (revisión v2.1.0, commit `1dfa9a3e39d6792fc75f1d8f1089e2909bf14b83`) reprodujo las etiquetas BIO decodificadas del evaluador en los 490 documentos de test, con cero discrepancias y las mismas 539 / 634 / 577 entidades exactas y F1 de test de 0,8902.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307,6 millones de parámetros, en FP16 requiere aproximadamente 0,6 GB solo para pesos, más overhead de activaciones y del tokenizador; en FP32, alrededor de 1,2 GB. Cifras estimadas a partir del recuento de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque para esta carga las consumer GPU son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 20xx en adelante, e incluso GPUs de gama baja con suficiente VRAM).
- Opciones de despliegue: pipeline de Hugging Face `token-classification` (verificado por el autor), y por tratarse de un modelo safetensors de ModernBERT, es compatible con frameworks de inferencia estándar; el autor indica que debe usarse la tokenización de anotación `unicode-word-punctuation-v1` y la decodificación `first_subtoken_viterbi` configuradas en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmBERT Impresso Media Sources NER | 307,6 M | no disponible | NER de fuentes mediáticas (fr, de, lb) | MIT | Hugging Face |
| `jhu-clsp/mmBERT-base` (modelo base) | no disponible | no disponible | encoder multilingüe de propósito general | no disponible | Hugging Face |
| `impresso-project/mmbert-multilingual-impresso-continued-mlm` (base intermedia) | no disponible | no disponible | MLM continuado sobre prensa histórica | no disponible | Hugging Face |

No se dispone en la información proporcionada de modelos directamente comparables de NER de fuentes mediáticas en prensa histórica con métricas publicadas; la comparación se limita a la cadena de modelos base de la que deriva.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para reconocer agencias de noticias y emisoras de radio citadas; no es un NER de propósito general y no debe usarse como tal.
- El rendimiento cae en el conjunto de test respecto a validación (F1 de 0,8902 frente a 0,9290), con un recall notablemente inferior (0,8502), lo que implica menciones no detectadas.
- La entrada debe tokenizarse con la política `unicode-word-punctuation-v1` y decodificarse con `first_subtoken_viterbi`; usar otra tokenización o decodificador puede degradar los resultados.
- Solo cubre francés, alemán y luxemburgués; no hay soporte declarado para otros idiomas.
- El espacio de etiquetas es limitado y depende de los identificadores canónicos del dataset de entrenamiento; fuentes no presentes en el vocabulario pueden no reconocerse correctamente.
- Riesgo de alucinación y de falsos positivos en textos ruidosos propios de OCR histórico; se recomienda validación humana en flujos de curación.
- No se han documentado en la información disponible sesgos específicos del modelo; al entrenarse sobre prensa histórica, puede heredar sesgos de representación del corpus original.
- La licencia MIT permite uso comercial, pero el modelo se declara para enriquecimiento de corpus y curación asistida, no para producción crítica sin verificación.
- No se dispone de información sobre cuantizaciones publicadas ni sobre latencia, lo que limita la planificación de despliegues de altas prestaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/impresso-project/mmbert-impresso-mediasources-ner
- Modelo base intermedio: https://huggingface.co/impresso-project/mmbert-multilingual-impresso-continued-mlm
- Modelo base original: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/impresso-project/impresso-mediaagencies-ner-dataset
- Proyecto Impresso: https://impresso.com/
