# sapinsapin/wikalid

## Resumen

WikaLID es un modelo de identificacion de idioma (LID) especializado en lenguas de Filipinas, desarrollado por el usuario sapinsapin. A diferencia de identificadores genericos como GlotLID, OpenLID o fastText `lid.176`, que cubren cientos de idiomas pero confunden las lenguas bisayas entre si, fallan ante titulares en mayusculas y estilo tabloide, no separan el chavacano del espanol y tratan el code-switching tagalo-ingles (taglish) como ruido, WikaLID aborda especificamente ese escenario con 17 etiquetas: 11 lenguas filipinas, 4 lenguas de contacto (ingles, espanol, indonesio, malayo), una categoria "otro idioma" y una categoria "no es un idioma".

El modelo no es un transformer generativo, sino un etiquetador a nivel de token compuesto por dos taggers int8 de 26 MB cada uno, con inferencia exclusivamente en numpy (sin GPU, sin PyTorch, sin fastText). Cada palabra recibe un idioma, de modo que la salida incluye la mezcla linguistica y la proporcion de ingles; el taglish se reporta como una medicion (`cs_level` / `cs_share`) en lugar de como una clase separada. Ademas incorpora incertidumbre calibrada: una confianza con escalado de temperatura, un conjunto de prediccion conformal y una compuerta que clasifica cada texto en *accept*, *review* o *junk*.

Su relevancia practica es acotada pero concreta: fue construido para etiquetar un corpus de texto filipino destinado al preentrenamiento de modelos de lenguaje, y la compuerta existe precisamente para retener filas inciertas en lugar de etiquetarlas mal de forma silenciosa. El repositorio ocupa 0,2 GB y el wheel distribuido con los pesos ronda los 52 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetador a nivel de token (dos taggers int8) con compuerta de reglas y modelo gradient-boosted; inferencia solo con numpy |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos distribuidos ya cuantizados) |
| Idiomas soportados | tl, ceb, hil, war, ilo, bcl, pam, pag, cbk, krj, tsg, en, es, id, ms, multilingual |
| Licencia | other (licencia propia `wikalid-preview`, ver MODEL_LICENSE.md) |
| Formato de pesos | wheel de Python con pesos empaquetados; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

WikaLID se compone de dos etiquetadores (taggers) de 26 MB cada uno en int8 que operan a nivel de palabra, produciendo una etiqueta por token. La inferencia es determinista y se ejecuta solo con numpy, sin dependencias de GPU ni de frameworks de deep learning como PyTorch o fastText. Sobre esa salida se calcula la etiqueta mayoritaria (`label`), la mezcla por idioma (`mixture`, con lenguas que representan al menos el 1 %), la proporcion de ingles en textos no ingleses (`cs_level` / `cs_share`, con umbrales none < 0,03 <= light < 0,25 <= heavy) y una confianza con escalado de temperatura.

La incertidumbre se gestiona en dos capas: un conjunto de prediccion conformal por split a α = 0,10 (campo `label_set` / `abstain`, que se activa cuando el conjunto no es exactamente una etiqueta) y una compuerta que combina reglas con nombre y un pequeno modelo gradient-boosted que estima "es correcta esta etiqueta?". Segun la model card, ese modelo se ajusto unicamente con datos de desarrollo, por lo que sus puntuaciones no estan calibradas contra los conjuntos de test. Tambien existe una regla de marcadores que detecta aklanon y surigaonon y los reporta como `oth` con `oth_sub` = `akl` / `sgd`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO (no aplica a un clasificador). El modelo se creo el 14 de noviembre de 2026 y se actualizo el 15 de noviembre de 2026.

## Capacidades

- Identificacion de idioma a nivel de documento sobre 17 etiquetas: 11 lenguas filipinas (tagalo/filipino, cebuano, hiligaynon, waray, ilocano, bikol central, kapampangan, pangasinan, chavacano, kinaray-a, tausug), 4 lenguas de contacto (ingles, espanol, indonesio, malayo), "otro idioma" (`oth`) y "no es un idioma" (`nol`).
- Etiquetado a nivel de token: cada palabra recibe un idioma, lo que permite calcular la mezcla linguistica (`mixture`) y la proporcion de ingles (`cs_share`).
- Medicion de code-switching tagalo-ingles (taglish) como magnitud continua, no como clase separada.
- Incertidumbre calibrada: confianza con escalado de temperatura, conjunto conformal a α = 0,10 y flag `abstain`.
- Compuerta de calidad con tres decisiones (`accept`, `review`, `junk`), motivo (`gate_reason`) y probabilidad de acierto (`gate_p_correct`).
- Separacion de chavacano frente a espanol y distincion entre las lenguas bisayas (cebuano, hiligaynon, waray, kinaray-a).
- Deteccion de aklanon y surigaonon mediante reglas de marcadores (`oth_sub`).
- Deteccion de contenido que no es lengua natural: listas numeradas, relaciones de nombres, tablas de resultados (`nol`, equivalente aproximado a ISO `zxx`).
- Procesamiento por lotes de ficheros parquet mediante `wikalid sidecar`, con soporte de workers paralelos.
- Ejecucion en CPU, sin GPU ni PyTorch, con inferencia determinista.

## Casos de uso

- **Etiquetado de corpus para preentrenamiento**: el escenario original del modelo. Se ejecutaria `wikalid sidecar` sobre un parquet con columnas `document_id`, `source_name` y `text` para producir etiquetas y mezclas por documento, reteniendo las filas con `gate` = `review` o `junk` para revision manual en lugar de incorporarlas al corpus con etiquetas dudosas.
- **Filtrado de calidad en pipelines de datos multilingues**: la compuerta permite descartar automaticamente tablas de resultados, listas de nombres y otro contenido no linguistico (`nol`) antes de que entre en un dataset de entrenamiento, reduciendo ruido en el corpus.
- **Analisis de code-switching en redes sociales**: al reportar `cs_share` y `cs_level`, permite cuantificar la proporcion de ingles en publicaciones tagalo-inglesas (por ejemplo, en Filipinas) para estudios sociolinguisticos o para segmentar contenido por registro.
- **Enrutamiento de contenido por idioma en plataformas**: con 17 etiquetas y salida a nivel de token, un sistema de moderacion o de recomendacion puede dirigir textos cebuano, hiligaynon o ilocano al canal o al revisor adecuado, algo que los LID genericos confunden entre las lenguas bisayas.
- **Deteccion de chavacano frente a espanol en documentos historicos o noticias**: la separacion explicita `cbk` / `spa` es util en archivos y hemerotecas de Zamboanga y Cavite, donde los LID genericos asignan espanol a textos chavacanos.
- **Preprocesado de datos para modelos de lenguaje filipinos**: antes de entrenar o ajustar un modelo en lenguas filipinas, se puede usar WikaLID para balancear la mezcla de idiomas del corpus y medir la presencia real de cada lengua de bajos recursos.
- **Auditoria de datosen produccion con CPU**: al ser un wheel de ~52 MB con pesos incluidos y dependencia solo de numpy, puede desplegarse en contenedores ligeros o en maquinas sin GPU para etiquetar flujos de texto en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo es CPU-only y no requiere GPU.
- GPU recomendadas: ninguna; la inferencia se ejecuta con numpy en CPU.
- Cabe en cualquier CPU consumer: el wheel ocupa unos 52 MB y el repositorio 0,2 GB; los dos taggers son de 26 MB cada uno en int8.
- Opciones de despliegue: paquete Python `wikalid` (wheel `wikalid-1.0.1-py3-none-any.whl`), CLI `wikalid predict`, `wikalid classify`, `wikalid sidecar`, `wikalid score`, `wikalid gate` e `wikalid info`. Requiere Python >= 3.10 y numpy; pyarrow para trabajos por lotes en parquet. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y por la naturaleza del modelo (clasificador, no generativo) no aplicarian.
- Latencia y throughput estimados: no disponibles. Se documenta soporte de `--workers 4` para procesamiento paralelo por lotes, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WikaLID | Etiquetador LID a nivel de token, CPU, int8 | 17 etiquetas centradas en Filipinas | no disponible | other (`wikalid-preview`) | Hugging Face, wheel Python |
| GlotLID | LID generico | Cientos de idiomas | no disponible | no disponible en la informacion | Referenciado en la model card como alternativa generica |
| OpenLID | LID generico | Cientos de idiomas | no disponible | no disponible en la informacion | Referenciado en la model card como alternativa generica |
| fastText `lid.176` | LID generico | 176 idiomas | no disponible | no disponible en la informacion | Referenciado en la model card como alternativa generica |

La model card afirma que los tres identificadores genericos fallan en texto filipino de web y noticias: confunden lenguas bisayas, fallan en titulares en mayusculas y estilo tabloide, no separan chavacano de espanol y tratan el taglish como ruido. No se aportan metricas comparativas que cuantifiquen esas diferencias.

## Limitaciones y advertencias

- El modelo es un clasificador de idioma, no un modelo generativo: no produce texto, razonamiento, codigo ni matemeticas.
- No se han publicado benchmarks en la informacion disponible; no hay evidencia cuantitativa de precision frente a los LID genericos mas alla de las afirmaciones cualitativas de la model card.
- Las etiquetas `krj` (kinaray-a) y `tsg` (tausug) estan marcadas como experimentales; tausug no cuenta con conjunto de test de texto libre etiquetado por humanos.
- Las confusiones mas frecuentes documentadas son hiligaynon con cebuano y kinaray-a; indonesio con malayo en cadenas muy cortas.
- Pangasinan funciona bien en texto formal pero es raro en noticias, por lo que las predicciones sobre noticias deben tratarse con cautela.
- La compuerta gradient-boosted se ajusto solo con datos de desarrollo, por lo que sus probabilidades no estan calibradas contra los conjuntos de test.
- La licencia es `other` con nombre `wikalid-preview`; las condiciones de uso comercial deben consultarse en MODEL_LICENSE.md antes de desplegar en produccion.
- El modelo se creo en noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion externa.
- No se especifican sesgos conocidos, riesgo de alucinacion (no aplica a un clasificador) ni limitaciones de longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sapinsapin/wikalid
- Licencia del modelo: https://huggingface.co/sapinsapin/wikalid/blob/main/MODEL_LICENSE.md
