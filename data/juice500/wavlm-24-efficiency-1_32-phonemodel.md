# juice500/wavlm-24-efficiency-1_32-phonemodel

## Resumen

`wavlm-24-efficiency-1_32-phonemodel` es un modelo de segmentación y reconocimiento fonético (phone segmentation y phone recognition) construido sobre el codificador congelado `microsoft/wavlm-large`, concretamente su capa 24, operando a 16 kHz. Lo desarrolla el autor `juice500` (Shikhar Bharadwaj y colaboradores, según la cita del paper) y se publica como adaptador sobre WavLM-large, no como un modelo completo entrenado desde cero. La técnica central es SPAM (S3M-based Phonological Activation Mapping), que proyecta cada frame del codificador self-supervised a un vector de 43 activaciones fonológicas interpretables (voicing, nasality, stridency, entre otras) y a partir de ahí resuelve la segmentación y el etiquetado.

La relevancia de esta variante concreta es que es un ablación de eficiencia muestral: se ha ajustado únicamente con 1/32 de las utterances de entrenamiento de TIMIT (correspondiente a la Figura 3 del paper). Sirve, por tanto, para evaluar cuánto del rendimiento del pipeline SPAM se conserva con muy pocos datos supervisados, manteniendo el codificador WavLM-large congelado.

El modelo se distribuye con la librería `phonespam`, tiene licencia MIT y está orientado a inglés (`en`), aunque el pipeline permite restringir el vocabulario de reconocimiento a inventarios PHOIBLE de otras lenguas mediante `vocab_for_language`. El repositorio en Hugging Face es de 0.0 GB, lo que es coherente con que solo se publican los pesos del adaptador y las cabezas, no el codificador base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre codificador WavLM-large congelado (capa 24) + SPAM (mapeo a activaciones fonológicas) con cabezas de segmentación y reconocimiento |
| Parametros totales | no disponible (solo se publica el adaptador; el codificador base es WavLM-large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada a 16 kHz, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenado en inglés; vocabulario restringible a otros inventarios PHOIBLE vía `vocab_for_language`) |
| Licencia | MIT (PHOIBLE 2.0 se descarga en runtime bajo CC BY-SA 3.0, licencia separada) |
| Formato de pesos | no disponible (consumido vía `phonespam`, `PhoneModel.from_pretrained`) |

## Arquitectura y entrenamiento

El modelo no entrena un transformer de audio desde cero: parte de `microsoft/wavlm-large` congelado y extrae representaciones de su capa 24 a 16 kHz. Sobre esas representaciones, SPAM aprende un mapeo frame a frame hacia 43 activaciones fonológicas en el rango [0, 1] (nombres como `silence+`, `syl+`, `son+`, etc.), lo que convierte la representación opaca del codificador en una representación interpretable y lingüísticamente motivada. A partir de ese vector de activaciones, dos cabezas resuelven la segmentación (fronteras entre phones) y el reconocimiento (etiqueta de cada segmento).

El ajuste se realiza sobre el dataset `timit-asr/timit_asr` (TIMIT), y esta variante concreta usa solo 1/32 de las utterances de entrenamiento, como ablación de eficiencia muestral descrita en la Figura 3 del paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). No se detallan en la información disponible el número exacto de utterances, la composición completa del dataset, ni si hubo etapas de RLHF/DPO (poco probables en una tarea de etiquetado fonético supervisado). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con marcas de inicio y fin en segundos (`Segment(start, end, label)`).
- Reconocimiento fonético: asigna una etiqueta de phone a cada segmento detectado.
- Representación fonológica interpretable: expone `model.spam("utt.wav")` como matriz `(frames, 43)` de activaciones en [0, 1] con nombres de características accesibles vía `spam.featnames`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita el reconocimiento al inventario PHOIBLE de una lengua concreta.
- Procesamiento de audio a 16 kHz sobre representaciones de WavLM-large (capa 24).
- Ejecución en CPU o GPU (`device="cuda"`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.

## Casos de uso

- Investigación en fonética computacional: extraer alineamientos a nivel de phone de corpus de habla para estudios de duración, coarticulación o variación alofónica, usando `transcribe` para obtener los límites temporales.
- Análisis de interpretabilidad de modelos self-supervised: usar `model.spam(...)` para inspeccionar qué activaciones fonológicas (voicing, nasality, stridency) emergen en la capa 24 de WavLM-large y compararlas entre estímulos.
- Prototipado de sistemas de pronunciación asistida: generar transcripciones fonéticas con marcas temporales para comparar la producción del aprendiente con una referencia, aprovechando la salida por segmentos.
- Evaluación de eficiencia muestral: esta variante con 1/32 de TIMIT sirve como punto de comparación frente a las variantes con más datos para medir la curva datos-rendimiento del pipeline SPAM.
- Filtrado y anotación de corpus de habla: preetiquetar utterances con fronteras y phones para revisión humana posterior, reduciendo el coste de anotación manual.
- Experimentos multilingües controlados: restringir el vocabulario con `vocab_for_language` a inventarios PHOIBLE de otras lenguas para probar la transferencia del codificador entrenado en inglés.
- Docencia y demostraciones: el demo público en Streamlit permite ilustrar segmentación y reconocimiento fonético sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Figura 3 del paper (ablación de eficiencia muestral con 1/32 de TIMIT), pero no se incluyen cifras de phone error rate (PER), boundary F1 ni métricas comparables en la información proporcionada.

## Requisitos de hardware

- El repositorio pesa 0.0 GB, pero la inferencia requiere cargar `microsoft/wavlm-large` como codificador base, cuyo peso no se declara en la ficha; la VRAM real depende de ese codificador y del adaptador.
- GPU recomendadas: no disponibles de forma explícita; por el tamaño del codificador base, se espera que quepa en GPUs consumer tipo RTX 4090 o inferiores, aunque no se confirma en la información.
- Ejecución en CPU soportada por la API (`device="cuda"` es opcional).
- Despliegue: la vía documentada es la librería `phonespam` (`pip install phonespam`) y `PhoneModel.from_pretrained(...)`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Datos de ajuste | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wavlm-24-efficiency-1_32-phonemodel | WavLM-large (capa 24) | Segmentación y reconocimiento fonético vía SPAM | 1/32 de TIMIT | audio 16 kHz | MIT | Hugging Face + `phonespam` |
| Otras variantes SPAM del mismo autor | WavLM-large | Igual | Fracciones mayores de TIMIT | audio 16 kHz | MIT (presumible) | no disponible en la información |
| WavLM-large original | — | Representaciones self-supervised | LibriSpeech y otros (no detallado aquí) | audio 16 kHz | no disponible en esta ficha | Hugging Face (`microsoft/wavlm-large`) |

No se dispone de datos de rendimiento comparado con alternativas como wav2vec 2.0 o HuBERT para phone recognition en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado en inglés (TIMIT); el uso con otras lenguas vía `vocab_for_language` no está validado en la información disponible.
- El ajuste con solo 1/32 de TIMIT implica un régimen de pocos datos; es esperable un rendimiento inferior al de variantes con más supervisión, aunque no se aportan cifras.
- No se documentan sesgos demográficos, acentos ni condiciones de grabación cubiertas; TIMIT es un corpus limitado en diversidad de hablantes.
- Riesgo de errores en fronteras y etiquetas en habla espontánea, ruidosa o con solapamiento, no cuantificado.
- La licencia MIT cubre el modelo, pero `vocab_for_language` descarga PHOIBLE 2.0 en runtime bajo CC BY-SA 3.0, con obligaciones de atribución y compartición independientes.
- El repositorio no incluye el codificador base; es necesario descargar `microsoft/wavlm-large` por separado, con su propia licencia.
- No hay pipeline declarado en Hugging Face ni datos de benchmarks publicados, lo que dificulta la evaluación previa a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_32-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
