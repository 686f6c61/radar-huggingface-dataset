# juice500/w2v2-15-phonemodel

## Resumen

`juice500/w2v2-15-phonemodel` es un modelo de segmentación y reconocimiento de fonemas en inglés construido sobre el codificador congelado `facebook/wav2vec2-large-lv60` (wav2vec 2.0-large). No se trata de un modelo de lenguaje generativo, sino de un cabezal de predicción fonológica que se aplica sobre las activaciones internas de una red auto-supervisada de habla (S3M, self-supervised speech model). El autor lo publica como un punto concreto de la rejilla codificador x capa descrita en el artículo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026), en este caso la capa 15 del codificador wav2vec 2.0-large.

La innovación central es SPAM (S3M-based Phonological Activation Mapping), que proyecta cada fotograma del codificador a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, silabicidad, etc.). Esto convierte una representación opaca en una interpretable y permite segmentar y etiquetar fonemas a partir de ella. El modelo se distribuye como adaptador sobre el modelo base y se consume a través de la librería `phonespam`.

Es relevante para investigadores en fonética computacional y para desarrolladores que necesiten transcripción a nivel de fonema con trazabilidad interpretable, algo que los sistemas ASR a nivel de palabra no ofrecen. El autor indica explícitamente que este no es su mejor modelo y remite a `juice500/wavlm-24-phonemodel` como variante óptima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0-large (transformer convolucional + self-attention) con cabezal SPAM de mapeo fonologico |
| Parametros totales | no disponible (el modelo base wav2vec 2.0-large ronda los 317 M, pero el autor no publica el recuento del adaptador ni del conjunto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de entrada no documentada; el modelo base opera a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas mediante `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga con `PhoneModel.from_pretrained` de la libreria `phonespam`) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-large-lv60`, un codificador auto-supervisado preentrenado con wav2vec 2.0 sobre audio de 16 kHz, que se mantiene congelado. Sobre la representación de una capa concreta (la 15) se entrena un mapeo SPAM que transforma cada fotograma en 43 activaciones de rasgos fonológicos en el rango [0, 1], con nombres como `silence+`, `syl+` o `son+`. A partir de esa representación interpretable, dos cabezales realizan la segmentación y el reconocimiento de fonemas.

El entrenamiento se documenta con el dataset `timit-asr/timit_asr`, un corpus clásico de habla inglesa con anotaciones fonéticas a nivel de fonema. La model card no detalla el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo discriminativo de este tipo). La innovación técnica es precisamente el mapeo a rasgos fonológicos, que actúa como interfaz interpretable entre el codificador y las tareas de segmentación y reconocimiento, y que permite restringir el vocabulario de salida a inventarios fonológicos externos (PHOIBLE 2.0).

## Capacidades

- Segmentación de audio en fonemas con marcas de inicio y fin en segundos (`Segment(start, end, label)`).
- Reconocimiento de fonemas en inglés a partir de audio de 16 kHz.
- Extracción de activaciones fonológicas interpretables: `model.spam("utt.wav")` devuelve una matriz de (fotogramas, 43) con nombres de rasgo (`featnames`).
- Restricción del inventario de reconocimiento a una lengua concreta mediante `vocab_for_language`, que descarga PHOIBLE 2.0 en tiempo de ejecución.
- Integración como adaptador sobre wav2vec 2.0-large, reutilizando el codificador congelado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión, audio generativo ni modo "thinking".
- Capacidad multilingüe limitada: el modelo está entrenado para inglés; el filtrado por inventario PHOIBLE permite restringir la salida, pero no se documenta entrenamiento en otras lenguas.

## Casos de uso

- Investigación fonética y fonológica: extraer la matriz de 43 activaciones por fotograma para analizar qué rasgos (sonoridad, nasalidad, estridencia) activa el codificador en cada segmento, y contrastarlo con hipótesis lingüísticas.
- Análisis de corpus de habla: procesar grabaciones TIMIT o similares para obtener alineaciones a nivel de fonema y estudiar fenómenos de coarticulación o reducción vocálica con marcas temporales precisas.
- Evaluación de sistemas S3M: usar el modelo como sonda para medir cuánta información fonética retiene una capa concreta (la 15) de wav2vec 2.0-large, comparando con otras capas y codificadores.
- Enseñanza de pronunciación: generar transcripciones fonéticas con tiempos para retroalimentar a estudiantes de inglés sobre segmentos concretos de su habla.
- Filtrado y anonimización por rasgos: al disponer de activaciones de rasgos fonológicos, se pueden construir heurísticas para detectar o enmascarar segmentos con propiedades acústicas específicas en pipelines de privacidad.
- Restricción a inventarios de otras lenguas: usar `vocab_for_language` para forzar la salida a un inventario PHOIBLE concreto y evaluar la transferencia del modelo inglés a fonologías afines en tareas de investigación.
- Reproducibilidad de experimentos: al ser un punto documentado de la rejilla codificador x capa, sirve para replicar resultados del artículo SLT 2026 y como línea base en comparaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Como referencia, el codificador wav2vec 2.0-large subyacente ocupa del orden de 1,2 GB en fp32, pero el autor no publica cifras del adaptador ni del pipeline completo.
- GPU recomendadas: no disponibles. La API admite `device="cuda"` en `PhoneModel.from_pretrained`, pero no se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada por el autor; el tamaño reducido del codificador base sugiere que cabría en GPU de consumo, pero es una inferencia no verificada.
- Opciones de despliegue: la vía documentada es la librería `phonespam` (`pip install phonespam`) y la demo en Streamlit. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/w2v2-15-phonemodel` | no disponible | no disponible | Segmentacion y reconocimiento de fonemas | MIT | Hugging Face |
| `juice500/wavlm-24-phonemodel` | no disponible | no disponible | Segmentacion y reconocimiento de fonemas (mejor modelo segun el autor) | no disponible | Hugging Face |
| `facebook/wav2vec2-large-lv60` | ~317 M (referencia publica del modelo base) | no disponible | Codificador S3M (no realiza segmentacion ni reconocimiento por si mismo) | no disponible en la informacion | Hugging Face |

El autor indica que `juice500/wavlm-24-phonemodel` es la mejor variante de su familia; `w2v2-15-phonemodel` es un punto intermedio de la rejilla. No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- El autor declara explícitamente que este no es su mejor modelo y remite a `juice500/wavlm-24-phonemodel`; usarlo como referencia de máxima calidad sería un error.
- Entrenado solo en inglés (`language: en`); la extensión a otras lenguas mediante `vocab_for_language` restringe la salida pero no garantiza calidad en lenguas no vistas.
- El modelo se apoya en un codificador congelado; los sesgos del preentrenamiento de wav2vec 2.0-large se heredan sin corrección.
- No hay datos publicados sobre tasas de error, alucinación o robustez ante ruido, acentos o habla espontánea.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0, licencia distinta de la MIT del modelo; hay que revisar la compatibilidad en uso comercial.
- El repositorio aparece con tamaño de 0.0 GB y 0 descargas, lo que sugiere que los pesos pueden no estar materializados o que el paquete se distribuye a través de la librería `phonespam`; conviene verificar la disponibilidad real antes de integrarlo en producción.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue.
- Al ser un modelo de investigación (SLT 2026), no hay garantías de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-15-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Mejor variante de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Codigo: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
