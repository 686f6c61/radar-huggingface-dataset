# lee1jun/LES-eg2-asr-en-lm-4gram

## Resumen

LES-eg2-asr-en-lm-4gram es un modelo de lenguaje de n-gramas de palabras (4-gramas) empaquetado en formato binario KenLM, con suavizado Kneser-Ney modificado y probabilidades cuantizadas a 8 bits. Lo publica el usuario lee1jun como componente auxiliar del sistema de reconocimiento automático de voz lee1jun/LES-eg2-665M-asr-en, un modelo CTC de 665 millones de parámetros. No es un modelo neuronal: es una tabla de estadísticas de n-gramas que se consulta durante la decodificación.

Su función es concreta: alimentar el decodificador beam del sistema ASR. Se emplea en dos puntos del pipeline, en la búsqueda por prefijos CTC con fusión superficial del LM (shallow fusion) y en el re-ranking de las listas N-best. La decodificación greedy del modelo lector no requiere este fichero, de modo que el LM solo aporta valor cuando se busca mejorar la precisión a costa de más cómputo.

El interés práctico reside en su tamaño y su licencia. El binario ocupa aproximadamente 3,6 GiB, se distribuye bajo CC BY 4.0 y se ha construido únicamente con texto cuyas licencias permiten redistribuir estadísticas derivadas. Para equipos que despliegan el ASR en inglés y necesitan un LM de dominio general sin restricciones de uso comercial, es un componente listo para usar con KenLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje estadístico de n-gramas de palabras (4-gramas), KenLM binario con suavizado Kneser-Ney modificado |
| Parametros totales | No disponible (no es un modelo neuronal; el recuento de n-gramas no se publica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de 4 palabras por n-grama; el historial efectivo depende del decodificador) |
| Tipos de cuantizacion | Probabilidades cuantizadas a 8 bits (`perm_4gram.q8.bin`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Binario KenLM (`.bin`); admite también ficheros ARPA mediante KenLM |

## Arquitectura y entrenamiento

El modelo es un 4-grama de palabras con suavizado Kneser-Ney modificado, serializado en el formato binario de KenLM y con las probabilidades almacenadas en 8 bits para reducir el tamaño en disco. La consulta se realiza mediante la librería KenLM (`kenlm.Model(path)`); el vocabulario está en mayúsculas y todos los tokens fuera de vocabulario se mapean a `<unk>`.

El corpus de entrenamiento combina el corpus LM de LibriSpeech (dominio público) con las transcripciones de entrenamiento de LibriSpeech, Multilingual LibriSpeech English, The People's Speech (clean), VoxPopuli, AMI IHM y Common Voice 17.0, todas bajo licencias CC BY 4.0 o CC0. El texto se normaliza a palabras en minúsculas. Como medida contra la contaminación, se eliminó toda línea que compartiera un 8-grama de palabras con alguna referencia de evaluación. No se emplearon textos de GigaSpeech, SPGISpeech, TED-LIUM ni Earnings. El repositorio incluye un fichero `corpus_provenance.json` con los recuentos de origen y un `NOTICE` con la atribución exigida por la licencia.

## Capacidades

- Puntuación de secuencias de palabras en inglés para decodificación ASR: proporciona log-probabilidades de 4-gramas utilizables en búsqueda por prefijos CTC con fusión superficial del LM.
- Re-ranking de listas N-best generadas por el decodificador del modelo lector.
- Integración directa con KenLM: cualquier binario KenLM o fichero ARPA alternativo puede sustituirlo, reajustando los pesos `alpha` y `beta` de la fusión.
- Carga automática desde el modelo lector: `model.transcribe(waveform_16k, decoder="beam")` descarga este fichero sin intervención del usuario.
- Manejo explícito de palabras fuera de vocabulario mediante el token `<unk>`.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente; es exclusivamente un componente de puntuación lingüística.

## Casos de uso

- Transcripción ASR en inglés con beam search: se pasa el binario al decodificador del modelo LES-eg2-665M-asr-en para aplicar shallow fusion y corregir hipótesis acústicamente ambiguas con evidencia léxica.
- Re-ranking de N-best en producción: tras generar varias hipótesis por utterance, el LM reordena las candidatas y reduce la tasa de error de palabra en la salida final.
- Dominios conversacionales y de reuniones: el corpus incluye AMI IHM y VoxPopuli, por lo que el LM cubre vocabulario de diálogo y de discurso parlamentario, útil en transcripción de reuniones y actas.
- Dictado y voz de telefonía o lectura: la mezcla de Common Voice 17.0, LibriSpeech y The People's Speech aporta cobertura de habla leída, espontánea y de dominio público.
- Despliegue con licencia permisiva: al ser CC BY 4.0, puede integrarse en productos comerciales citando la atribución indicada en `NOTICE`.
- Sustitución o ajuste del LM en pipelines existentes: al aceptar cualquier binario KenLM o ARPA, sirve como referencia base para comparar el efecto de distintos LM sobre el mismo decodificador.
- Evaluación de sistemas ASR: útil para medir la ganancia de un LM de n-gramas frente a decodificación greedy en un mismo modelo acústico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER ni comparaciones numéricas con otros LM.

## Requisitos de hardware

- Almacenamiento: el binario `perm_4gram.q8.bin` ocupa 3644,13 MiB (unos 3,6 GiB); el repositorio completo, 3,8 GB.
- Memoria: el fichero se mapea en memoria al cargarlo con KenLM; se recomienda disponer de al menos 4 GB de RAM libres por proceso para mantenerlo residente.
- GPU: no requiere GPU para la consulta del LM; el consumo de VRAM corresponde al modelo acústico lector, no a este fichero.
- CPU: la consulta de n-gramas es intensiva en acceso a memoria; un mayor ancho de banda de memoria reduce la latencia de decodificación.
- Despliegue: mediante la librería KenLM (`kenlm.Model`) o a través del modelo lector `lee1jun/LES-eg2-665M-asr-en` con `decoder="beam"`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Tamaño | Observaciones |
|---|---|---|---|---|---|
| LES-eg2-asr-en-lm-4gram | 4-grama KenLM, 8 bits | Inglés | CC BY 4.0 | 3,6 GiB | Componente del ASR LES-eg2-665M; corpus filtrado contra evaluación |
| Cualquier binario KenLM o ARPA alternativo | n-grama | Variable | Según origen | Variable | Compatible con el mismo decodificador reajustando `alpha` y `beta` |
| LM neuronales (p. ej. basados en transformers) | Transformer | Variable | Variable | Mayor | No comparables directamente: mayor coste de cómputo por consulta |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo cubre inglés; no es utilizable para otros idiomas sin sustituirlo.
- Ventana de 4 palabras: no captura dependencias de largo alcance, a diferencia de un LM neuronal.
- Las palabras fuera del vocabulario se colapsan en `<unk>`, lo que puede penalizar términos técnicos, nombres propios o neologismos.
- Riesgo de sesgo hacia el dominio de los corpus de origen (lectura, reuniones, parlamento, voz común), con menor cobertura de jerga especializada.
- La decodificación greedy del modelo lector no utiliza este LM; la ganancia solo aparece con beam search o re-ranking, a costa de mayor latencia.
- La licencia CC BY 4.0 exige atribución; debe conservarse el `NOTICE` y consultarse `corpus_provenance.json` para el desglose de fuentes.
- El fichero está pensado como componente del sistema LES-eg2-665M-asr-en; su uso aislado requiere integrarlo manualmente en un decodificador compatible con KenLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lee1jun/LES-eg2-asr-en-lm-4gram
- Modelo lector asociado: https://huggingface.co/lee1jun/LES-eg2-665M-asr-en
- Librería KenLM: https://github.com/kpu/kenlm
