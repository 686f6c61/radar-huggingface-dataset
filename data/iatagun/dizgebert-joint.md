# iatagun/DizgeBERT-Joint

## Resumen

DizgeBERT-Joint es un modelo de análisis lingüístico para turco que combina etiquetado morfológico (UPOS, XPOS, FEATS) y análisis de dependencias (HEAD, DEPREL) en una única pasada. Desarrollado por İlker Atagün, el modelo se basa en el cuerpo ELECTRA base turco de dbmdz y añade cabezas especializadas: una para etiquetado de tokens y otra biafina profunda (Dozat & Manning, 2017) para la predicción de arcos y etiquetas de dependencia. Con 112,5 millones de parámetros, está diseñado para resolver casos ambiguos en los que la categoría morfológica de una palabra depende de su función sintáctica en el árbol, algo que un etiquetador de tokens puro no puede abordar.

El modelo se entrena de forma conjunta sobre tres treebanks del proyecto Universal Dependencies (UD_Turkish-Kenet, BOUN e IMST), con un embedding de identificador de treebank que permite seleccionar el esquema de anotación en inferencia (por defecto, `kenet`). Su relevancia radica en que ofrece una solución integrada para dos tareas tradicionalmente separadas, reduciendo la propagación de errores y mejorando la coherencia entre ambas salidas. A cambio, la precisión morfológica pura es aproximadamente tres puntos inferior a la de su homólogo solo-etiquetador, DizgeBERT-Morph, por lo que el autor recomienda un modo híbrido para aplicaciones que prioricen la morfología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA base (discriminator) con cabezas de etiquetado y decodificador biafino |
| Parametros totales | 112.506.313 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el cuerpo ELECTRA base suele admitir 512, pero no se especifica) |
| Tipos de cuantizacion | Safetensors (sin cuantizaciones adicionales publicadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte del discriminador ELECTRA base turco (`dbmdz/electra-base-turkish-cased-discriminator`) y añade dos módulos de cabecera. Para la representación de cada palabra, concatena la última capa oculta del primer subword y del último subword de la misma, una estrategia que captura tanto el prefijo como el sufijo, crucial en turco por su morfología aglutinante. La cabeza de etiquetado predice UPOS, XPOS y rasgos morfológicos (FEATS) mediante clasificadores por categoría, siguiendo el diseño del modelo hermano DizgeBERT-Morph. Para el análisis de dependencias, emplea un decodificador biafino profundo (Dozat & Manning, 2017) que produce puntuaciones de arco y de etiqueta, combinadas con un vector de raíz y un algoritmo de árbol de expansión máxima (Chu-Liu/Edmonds) para garantizar un árbol válido.

El entrenamiento se realizó durante 10 épocas con un batch de 12, tasa de aprendizaje de 1e-5 para el encoder y 5e-5 para las cabezas. La pérdida de etiquetado se ponderó con un factor de 2,5 frente a la pérdida de parsing (arc + label) para evitar que los gradientes del análisis de dependencias dominaran y degradaran la precisión morfológica. Los datos de entrenamiento combinan los treebanks Kenet (15.398 oraciones), BOUN (7.803) e IMST (3.435), más aproximadamente 1.300 pares mínimos sintéticos diseñados para resolver ambigüedades dependientes del contexto. El vocabulario de relaciones de dependencia se limitó a 45 etiquetas con frecuencia ≥ 20; las variantes raras se asignaron a la etiqueta genérica `dep`.

## Capacidades

- Etiquetado morfológico conjunto: predice UPOS, XPOS y rasgos FEATS para cada token.
- Análisis de dependencias: produce cabezas (HEAD) y etiquetas de dependencia (DEPREL) con decodificación biafina y postprocesado MST.
- Integración de ambas tareas: resuelve ambigüedades donde la categoría morfológica depende de la función sintáctica (p. ej., demostrativos que actúan como determinante o pronombre).
- Soporte multi-treebank: selección del esquema de anotación mediante el parámetro `scheme` (kenet, boun, imst) usando un embedding de identificador.
- Inferencia sobre tokens pre-tokenizados: acepta listas de palabras ya segmentadas, sin necesidad de tokenizador de subpalabras externo.
- No incluye capacidades de generación de texto, tool calling, visión ni audio.

## Casos de uso

- Análisis lingüístico de corpus turcos: investigadores en lingüística computacional pueden extraer anotaciones completas (morfología + dependencias) de textos turcos para estudios gramaticales o tipológicos, con una sola pasada del modelo.
- Pipelines de procesamiento de lenguaje natural (PLN) para turco: el modelo puede integrarse como etapa previa en sistemas de extracción de información, análisis de sentimiento o traducción automática que requieran entender la estructura sintáctica.
- Mejora de buscadores semánticos: las dependencias permiten identificar relaciones entre entidades (sujeto, objeto, modificadores) en consultas y documentos, mejorando la relevancia en motores de búsqueda para contenidos en turco.
- Sistemas de corrección gramatical: la combinación de rasgos morfológicos y dependencias ayuda a detectar errores de concordancia o de régimen verbal en textos generados por usuarios o por otros modelos.
- Recursos educativos para aprendizaje de turco: el modelo puede generar ejercicios interactivos de análisis sintáctico o mostrar la estructura de oraciones a estudiantes de turco como lengua extranjera.
- Investigación en parsing multilingüe: dado que se entrena sobre tres treebanks UD, sirve como punto de partida para estudiar la transferencia entre esquemas de anotación o para adaptar el enfoque conjunto a otras lenguas aglutinantes.

## Benchmarks y rendimiento

La model card del autor reporta resultados sobre test held-out para cada treebank:

| Treebank | UPOS | XPOS | UFeats F1 | FEATS exact | UAS | LAS |
|---|---|---|---|---|---|---|
| Kenet | 93.4 | – | 92.6 | 86.5 | 89.0 | 75.6 |
| BOUN | 92.9 | 84.8 | 90.5 | 79.7 | 84.0 | 75.5 |
| IMST | 92.5 | 92.9 | 92.9 | 83.5 | 86.0 | 76.1 |

No se proporcionan comparaciones con otros modelos en la model card. El autor indica que la precisión morfológica pura es aproximadamente 3 puntos inferior a la de DizgeBERT-Morph, y que el LAS (≈76) queda por debajo de parsers especializados en turco.

## Requisitos de hardware

- El modelo tiene 112,5 millones de parámetros; en FP32 ocupa unos 450 MB, en FP16 unos 225 MB.
- Inferencia en CPU es viable para procesamiento por lotes pequeño, aunque la latencia dependerá del número de tokens.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) si se carga en FP16.
- Para despliegue en producción, se puede servir con Hugging Face Transformers (código personalizado) o exportar a ONNX para optimización, aunque no se documentan configuraciones específicas.
- No se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DizgeBERT-Joint | 112,5 M | Morfología + dependencias | No disponible | CC BY-SA 4.0 | HuggingFace |
| DizgeBERT-Morph | 112,5 M (estimado, mismo cuerpo) | Solo morfología (UPOS, XPOS, FEATS) | No disponible | CC BY-SA 4.0 | HuggingFace |
| Parsers UD específicos (p. ej., Stanza, UDPipe) | Variable | Dependencias + morfología | Variable | Variable | Multiplataforma |

No se dispone de una comparativa cuantitativa pública entre estos modelos. El propio autor señala que DizgeBERT-Morph supera al modelo conjunto en precisión morfológica pura, mientras que el enfoque conjunto resuelve ambigüedades dependientes de la estructura sintáctica. Para parsing de dependencias, los parsers especializados como Stanza suelen alcanzar UAS superiores, aunque requieren más componentes y no ofrecen la integración conjunta.

## Limitaciones y advertencias

- El modelo espera entrada pre-tokenizada; para texto crudo se necesita un tokenizador externo y un divisor de palabras múltiples (MWT), lo que añade complejidad al pipeline.
- La precisión morfológica pura es inferior a la de DizgeBERT-Morph (≈3 puntos menos), por lo que no es óptimo para tareas que solo requieran etiquetado morfológico.
- El rendimiento de parsing (LAS ≈76) está por debajo de parsers especializados, lo que limita su uso en aplicaciones que exijan alta exactitud sintáctica.
- Hay diferencias de etiquetado entre treebanks: IMST etiqueta ciertos genitivos y complementos nominalizados como ADJ, mientras que BOUN y Kenet los marcan como NOUN; la elección del esquema (`scheme`) afecta los resultados y debe ser coherente con el uso previsto.
- El modelo está entrenado exclusivamente sobre turco y no soporta otros idiomas.
- La licencia CC BY-SA 4.0 implica que las obras derivadas deben compartirse bajo la misma licencia; hay que revisar las implicaciones para uso comercial y redistribución.
- No se documentan sesgos específicos, pero al entrenarse sobre treebanks UD, puede reflejar sesgos presentes en los textos de origen (noticias, textos formales).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iatagun/DizgeBERT-Joint
- Repositorio de código del autor (incluye `hybrid.py` y scripts de entrenamiento): https://github.com/iatagun/lemma-rule-based
- Modelo hermano DizgeBERT-Morph: https://huggingface.co/iatagun/DizgeBERT-Morph
- Cuerpo base ELECTRA turco: https://huggingface.co/dbmdz/electra-base-turkish-cased-discriminator
