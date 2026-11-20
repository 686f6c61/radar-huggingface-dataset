# juice500/xls-r-15-phonemodel

## Resumen

xls-r-15-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre el codificador congelado facebook/wav2vec2-xls-r-300m (XLS-R-300m). Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la cita del paper) y implementa SPAM (S3M-based Phonological Activation Mapping), un método que proyecta cada trama del codificador a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridentia, etc.). El resultado es una representación interpretable que dos cabezas leen para producir segmentación temporal y etiquetas fonéticas.

El modelo resuelve un problema clásico del habla: obtener fronteras y etiquetas de fonemas a partir de representaciones auto-supervisadas opacas, sin entrenar el codificador. Se trata de un punto concreto de la rejilla codificador × capa estudiada en el paper (capa 15 de XLS-R-300m, entrada a 16 kHz); el autor indica explícitamente que el mejor modelo de la familia es wavlm-24-phonemodel.

Es relevante ahora por su enfoque de interpretabilidad: en lugar de predecir fonemas de forma directa, expone activaciones de rasgos fonológicos consultables (`spam.featnames`), lo que facilita análisis lingüístico, depuración y restricción del vocabulario de salida a inventarios PHOIBLE por idioma. El repositorio es pequeño (0,0 GB), la licencia es MIT y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre codificador transformer auto-supervisado congelado (wav2vec2-xls-r-300m, capa 15) |
| Parametros totales | no disponible (adaptador sobre un codificador de 300M; el numero exacto de parametros del adaptador no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; no se documenta ventana maxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenamiento); reconocimiento restringible a inventarios PHOIBLE de otros idiomas via `vocab_for_language` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0) |
| Formato de pesos | no disponible (repo de 0,0 GB; libreria phonespam) |

## Arquitectura y entrenamiento

El modelo no entrena el codificador: congela facebook/wav2vec2-xls-r-300m y opera sobre las activaciones de su capa 15. SPAM mapea cada trama del S3M a un vector de 43 activaciones de rasgos fonológicos en el rango [0, 1], que actúan como representación intermedia interpretable. Sobre esa representación, dos cabezas realizan la segmentación (fronteras temporales) y el reconocimiento (etiqueta fonética), devolviendo tuplas `Segment(start, end, label)` contiguas con tiempos en segundos.

El dataset declarado es timit-asr/timit_asr (inglés). No se detalla en la información disponible el número de tokens, la composición exacta del corpus de entrenamiento ni si se emplearon RLHF o DPO; al tratarse de una tarea de etiquetado fonético, esos mecanismos de alineamiento no resultan esperables. La innovación técnica destacable es la exposición de rasgos fonológicos consultables y la posibilidad de restringir el espacio de etiquetas a un inventario PHOIBLE por idioma, lo que acota la salida a fonemas válidos de esa lengua.

## Capacidades

- Segmentación fonética: devuelve intervalos temporales contiguos con inicio y fin en segundos.
- Reconocimiento de fonemas: asigna una etiqueta fonética a cada segmento.
- Representación interpretable: expone 43 activaciones de rasgos fonológicos (`spam.featnames`, p. ej. "silence+", "syl+", "son+").
- Restricción multilingüe de vocabulario: `vocab_for_language("deu")` limita la salida al inventario PHOIBLE de un idioma.
- Entrada de audio a 16 kHz sobre codificador congelado (sin ajuste fino del encoder).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generativo, modo de razonamiento ni traducción.

## Casos de uso

- Análisis fonético y lingüístico: obtener alineaciones fonémicas con marcas temporales para estudiar fenómenos de coarticulación, usando las activaciones de rasgos como capa interpretable intermedia.
- Anotación asistida de corpus de habla: generar segmentaciones y etiquetas preliminares sobre TIMIT u otros corpus ingleses para revisión manual posterior, reduciendo el coste de anotación.
- Investigación en rasgos distintivos: consultar las 43 activaciones SPAM para correlacionar rasgos como sonoridad o nasalidad con fenómenos acústicos medidos.
- Sistemas de pronunciación y evaluación: comparar la secuencia fonética reconocida con una referencia para detectar desviaciones de pronunciación en aprendices de inglés.
- Adaptación a otros inventarios fonológicos: reutilizar el mismo codificador con `vocab_for_language` para experimentar con inventarios PHOIBLE de otras lenguas sin reentrenar el encoder.
- Docencia y demostraciones: usar la demo Streamlit y la librería phonespam para ilustrar segmentación fonética en clase o en prototipos de investigación.
- Exploración de la rejilla codificador × capa: servir como punto de comparación (capa 15 de XLS-R-300m) frente a otras combinaciones, como el modelo recomendado wavlm-24-phonemodel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el codificador base XLS-R-300m y un adaptador ligero sugieren un consumo moderado, pero no se documentan cifras.
- GPU recomendadas: no disponible; el ejemplo de uso permite `device="cuda"` para GPU.
- GPU de consumo: probablemente viable en GPU de consumo por el tamaño del codificador base (300M), aunque no se confirma en la información disponible.
- Opciones de despliegue: librería phonespam (instalable con `pip install phonespam`), con soporte de CPU o CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros / base | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xls-r-15-phonemodel | Adaptador sobre XLS-R-300m, capa 15 | no disponible | no documentado | MIT | Hugging Face (juice500) |
| juice500/wavlm-24-phonemodel | Adaptador sobre WavLM (capa 24), según el autor el mejor de la familia | no disponible | Indicado como mejor modelo por el autor; sin cifras | no disponible en la información | Hugging Face (juice500) |
| facebook/wav2vec2-xls-r-300m | Codificador S3M de 300M | no disponible | Modelo base, sin cabezas fonéticas | no disponible en la información | Hugging Face (facebook) |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es el modelo recomendado por el propio autor: la model card señala wavlm-24-phonemodel como el mejor de la familia.
- Entrenamiento declarado solo en inglés (TIMIT); el uso con otros idiomas depende de vocabulario PHOIBLE externo y no está validado en la información disponible.
- Riesgo de alucinación de etiquetas: la salida es una secuencia fonética predicha; errores de frontera o de etiqueta pueden propagarse en anotaciones automáticas.
- Sesgos: no se documentan sesgos conocidos; el corpus TIMIT tiene cobertura limitada de hablantes y variedades, lo que puede afectar la generalización.
- Licencia: el modelo y el código son MIT, pero `vocab_for_language` descarga PHOIBLE 2.0 (CC BY-SA 3.0) en runtime, con obligaciones de atribución y compartición separadas.
- Repositorio de 0,0 GB y sin descargas ni likes registrados: madurez y mantenimiento del artefacto no verificables.
- Sin datos publicados de latencia, throughput ni requisitos de VRAM; conviene medir en el entorno de producción antes de desplegar.
- El pipeline de Hugging Face aparece como "no disponible" y la librería es propia (phonespam), no el ecosistema transformers estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-15-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Paper (SLT 2026): https://arxiv.org/abs/2607.09020
- Codigo: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: timit-asr/timit_asr (referenciado en la model card)
- PHOIBLE: https://phoible.org
