# juice500/wavlm-9-phonemodel

## Resumen

wavlm-9-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de WavLM-large, un modelo auto-supervisado de voz de Microsoft. Lo desarrolla el equipo del paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en SLT 2026, y se publica bajo el identificador juice500. El modelo no genera texto libre: su tarea es dividir una señal de audio en segmentos temporales y asignar a cada uno una etiqueta fonética, apoyándose en un mapeo intermedio de 43 rasgos fonológicos (sonoridad, nasalidad, estridencia, silabicidad, etc.) que hace interpretable la representación del encoder.

La pieza central es SPAM, que proyecta cada frame de WavLM a un vector de activaciones fonológicas en el rango [0, 1]; dos cabezas ligeras leen de esa representación para producir los límites de segmento y las etiquetas. Este checkpoint concreto corresponde a un único punto de la rejilla encoder × capa: WavLM-large en la capa 9, con audio de entrada a 16 kHz. El autor indica que el mejor modelo de la familia es wavlm-24-phonemodel, por lo que esta variante debe entenderse como una pieza de ablación o de comparación, no como el checkpoint de referencia.

El interés práctico es doble: ofrece segmentación y reconocimiento fonético con un adaptador pequeño sobre un encoder congelado, y expone explícitamente el espacio de rasgos fonológicos, algo poco habitual en herramientas de este tipo. El vocabulario de reconocimiento puede restringirse al inventario PHOIBLE de un idioma concreto mediante `vocab_for_language`, lo que permite adaptar la salida a fonologías distintas de la inglesa sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM (dos cabezas ligeras) sobre encoder WavLM-large congelado; capa 9 |
| Parametros totales | no disponible (el adaptador es ligero; el encoder base WavLM-large ronda los 317 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera por frames sobre audio de 16 kHz; no se especifica ventana maxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenado y etiquetado para ingles; el reconocimiento admite otros inventarios via PHOIBLE con `vocab=`) |
| Licencia | MIT (el codigo y el modelo); PHOIBLE 2.0 se descarga en tiempo de ejecucion bajo CC BY-SA 3.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga con `PhoneModel.from_pretrained`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de sonda sobre representaciones congeladas: WavLM-large procesa audio a 16 kHz y se extraen las activaciones de la capa 9. SPAM transforma cada frame en un vector de 43 activaciones fonologicas interpretables (nombres como `silence+`, `syl+`, `son+`), y sobre esa representacion operan dos cabezas: una de segmentacion, que detecta fronteras entre telefonos, y otra de reconocimiento, que asigna etiqueta a cada segmento. La API `model.spam("utt.wav")` devuelve la matriz de frames × 43 activaciones y `model.transcribe()` encadena el pipeline completo devolviendo tuplas `Segment(start, end, label)` con tiempos en segundos.

El entrenamiento se realizo sobre TIMIT (`timit-asr/timit_asr`), el corpus clasico de voz leida en ingles con anotaciones foneticas a nivel de telefono. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales mas alla del entrenamiento supervisado de las cabezas. La innovacion tecnica destacable es la propia representacion intermedia: al forzar que el modelo pase por rasgos fonologicos explicitos en lugar de predecir telefonos directamente, se obtiene una sonda interpretable y se facilita la restriccion del vocabulario de salida a inventarios fonologicos externos (PHOIBLE).

## Capacidades

- Segmentacion fonetica: deteccion de fronteras entre telefonos con marcas temporales en segundos.
- Reconocimiento fonetico: etiquetado de cada segmento con un simbolo telefonico.
- Mapeo fonologico interpretable: exposicion de 43 activaciones por frame (sonoridad, nasalidad, estridencia, silabicidad, etc.) en el rango [0, 1].
- Restriccion de vocabulario por idioma: `vocab_for_language("deu")` u otros codigos ISO permite limitar la salida al inventario PHOIBLE de esa lengua.
- Procesamiento de audio a 16 kHz mediante el encoder WavLM-large subyacente.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo; es un modelo discriminativo de analisis fonetico.
- Capacidad multilingue limitada: el modelo esta entrenado en ingles; el soporte de otras lenguas depende del inventario PHOIBLE usado como vocabulario, no de entrenamiento especifico.

## Casos de uso

- Investigacion fonetica y fonologica: extraer alineaciones telefono a telefono de un corpus de habla para estudiar contrastes, alofonia o procesos fonologicos, usando `transcribe` sobre grabaciones y analizando los rasgos SPAM para interpretar cada decision.
- Construccion de lexicos de pronunciacion: generar transcripciones foneticas de grabaciones en ingles para alimentar diccionarios de pronunciacion en sistemas TTS o ASR, con la ventaja de que las etiquetas son directamente auditables.
- Analisis de habla con fines clinicos o de aprendizaje de idiomas: la segmentacion temporal y las activaciones de rasgos permiten localizar y describir errores de pronunciacion concretos (por ejemplo, perdida de sonoridad o nasalidad mal colocada) en lugar de solo transcribir.
- Preprocesado para pipelines de ASR: usar los limites de segmento como entrada para un reconocedor de voz posterior, reduciendo errores de alineacion en corpus con anotacion manual costosa.
- Experimentacion en representaciones auto-supervisadas: este checkpoint es un punto concreto de la rejilla encoder × capa, util para ablaciones sobre que capa de WavLM captura mejor la informacion fonetica frente a wavlm-24-phonemodel.
- Prototipado rapido de herramientas de analisis de voz: la instalacion via `pip install phonespam` y la API de tres funciones permiten integrar segmentacion fonetica en cuadernos o demos (el autor publica una demo en Streamlit) sin infraestructura de entrenamiento.
- Adaptacion a otras lenguas en investigacion comparada: restringiendo el vocabulario con `vocab_for_language` se puede probar el modelo sobre inventarios de otras lenguas y medir hasta que punto las representaciones de WavLM generalizan, siempre con la cautela de que el entrenamiento fue en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El encoder WavLM-large congelado y un adaptador ligero sugieren un consumo moderado, pero no se proporcionan cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; la API acepta `device="cuda"` para GPU.
- Cabe en GPU de consumo: no confirmado; por el tamano del encoder base es plausible en GPUs consumer con memoria suficiente, pero no hay dato verificado.
- Opciones de despliegue: paquete `phonespam` (Python) con `PhoneModel.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| juice500/wavlm-9-phonemodel | Adaptador SPAM sobre WavLM-large (capa 9) | no disponible | no disponible | MIT | Punto de ablacion de la familia; el autor recomienda wavlm-24 |
| juice500/wavlm-24-phonemodel | Adaptador SPAM sobre WavLM-large (capa 24) | no disponible | no disponible | MIT (presumible, mismo proyecto) | Checkpoint de referencia segun el autor |
| microsoft/wavlm-large | Encoder auto-supervisado de voz | ~317 M (dato externo no confirmado en la informacion) | no disponible | no disponible en la informacion | Modelo base; no realiza segmentacion ni reconocimiento por si mismo |

No se dispone de datos de rendimiento comparado ni de otros sistemas de segmentacion fonetica en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles (TIMIT); el rendimiento fuera de esa lengua no esta documentado y el uso de `vocab_for_language` no garantiza calidad.
- Es un checkpoint de ablacion (capa 9): el propio autor remite a wavlm-24-phonemodel como el mejor modelo de la familia, por lo que este no debe tomarse como la version recomendada para produccion.
- Sin resultados de benchmarks publicados en la informacion disponible; no hay evidencia cuantitativa de precision en segmentacion o reconocimiento.
- Riesgo de errores en fronteras de segmento y en etiquetas telefonicas, especialmente en habla espontanea, ruidosa o con acentos distintos del corpus de entrenamiento (TIMIT es habla leida).
- El repositorio aparece con 0.0 GB y 0 descargas, lo que sugiere que los pesos podrian no estar materializados o que el modelo es de muy reciente publicacion; conviene verificar la disponibilidad real de los archivos antes de integrarlo.
- La licencia MIT cubre el modelo y el codigo, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecucion bajo CC BY-SA 3.0, con obligaciones de atribucion y comparticion que deben revisarse si se redistribuye.
- No es un modelo generativo: no sirve para transcripcion ortografica, traduccion, dialogo ni tareas de lenguaje natural.
- El identificador arXiv 2607.09020 y la fecha de creacion (2026) deben contrastarse con la publicacion real del paper antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-9-phonemodel
- Checkpoint recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Codigo: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
