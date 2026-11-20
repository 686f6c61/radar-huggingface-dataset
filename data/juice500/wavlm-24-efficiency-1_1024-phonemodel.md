# juice500/wavlm-24-efficiency-1_1024-phonemodel

## Resumen

wavlm-24-efficiency-1_1024-phonemodel es un modelo de segmentación y reconocimiento de fonemas construido sobre el codificador congelado WavLM-large (microsoft/wavlm-large, 24 capas, entrada a 16 kHz). Lo desarrolla el autor juice500 en el marco del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo resuelve un problema clásico en el procesamiento del habla: obtener fronteras de fonemas y etiquetas fonéticas a partir de audio sin un sistema de reconocimiento de voz completo, aprovechando representaciones auto-supervisadas.

La innovación central es SPAM (S3M-based Phonological Activation Mapping), que proyecta cada fotograma del codificador a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridentia, entre otros). Esto convierte una representación opaca en una interpretable, sobre la que se montan las cabezas de segmentación y clasificación. Este checkpoint concreto es una ablación de eficiencia muestral: se ha ajustado sobre 1/1024 de las locuciones de entrenamiento de TIMIT (Figura 3 del paper), lo que lo convierte en una referencia útil para estudiar cuánto dato necesita el enfoque.

Es relevante ahora porque demuestra que un adaptador ligero sobre un S3M congelado puede producir segmentación y reconocimiento de fonemas interpretables con muy pocos datos, abriendo la puerta a análisis fonético de bajo coste, documentación de lenguas con recursos escasos y pipelines de investigación en fonética y fonología. El modelo es solo para inglés en su ajuste, con licencia MIT y librería propia (phonespam).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre codificador congelado WavLM-large (transformer, capa 24) |
| Parametros totales | no disponible (el codificador base WavLM-large ronda los 317 M; el adaptador no declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por fotogramas; sin ventana declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); reconocimiento restringible a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en tiempo de ejecución es CC BY-SA 3.0) |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `PhoneModel.from_pretrained` de la librería phonespam) |

## Arquitectura y entrenamiento

El modelo no entrena un codificador de extremo a extremo: congela WavLM-large y extrae representaciones de su capa 24 a 16 kHz. Sobre esas representaciones, SPAM aprende un mapeo a 43 activaciones fonológicas en el rango [0, 1] (nombres como "silence+", "syl+", "son+"), y dos cabezas leen de ese espacio: una para segmentación (fronteras contiguas con tiempos en segundos) y otra para reconocimiento (etiqueta de fonema por segmento). El pipeline completo se expone mediante el método `transcribe`, que devuelve tuplas `Segment(start, end, label)`.

El ajuste se realiza sobre el corpus TIMIT (dataset timit-asr/timit_asr). Este checkpoint es una ablación de eficiencia muestral: se entrena con 1/1024 de las locuciones de entrenamiento de TIMIT, correspondiente a la Figura 3 del paper. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO; al tratarse de una tarea supervisada de fonética, lo esperable es entrenamiento supervisado con etiquetas de fonemas de TIMIT. La innovación técnica destacable es precisamente la interpretabilidad del espacio intermedio (activaciones fonológicas) frente a un clasificador opaco.

## Capacidades

- Segmentación de fonemas en audio: devuelve fronteras temporales contiguas con inicio y fin en segundos.
- Reconocimiento de fonemas: asigna etiqueta fonética a cada segmento.
- Representación fonológica interpretable: expone 43 activaciones de rasgos (sonoridad, nasalidad, estridentia, etc.) vía `model.spam()`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` permite limitar el reconocimiento al inventario PHOIBLE de una lengua concreta.
- Procesamiento de habla a 16 kHz con codificador auto-supervisado congelado.
- Eficiencia muestral extrema: funciona con ajuste sobre 1/1024 de TIMIT.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; no es un modelo de lenguaje.
- No dispone de visión, audio generativo ni modo thinking.

## Casos de uso

- Investigación fonética de bajo coste: obtener alineamientos y etiquetas de fonemas sobre grabaciones para análisis cuantitativo de rasgos (nasalidad, sonoridad), usando directamente las 43 activaciones de `model.spam()`.
- Documentación de lenguas con pocos recursos: combinar el adaptador con `vocab_for_language` para restringir el reconocimiento al inventario PHOIBLE de una lengua concreta y asistir en la transcripción fonética.
- Estudio de eficiencia muestral: replicar la ablación de 1/1024 de TIMIT para medir cuánto dato necesita SPAM frente a ajustes completos, útil en trabajos académicos comparativos.
- Prototipado de sistemas de pronunciación: generar segmentaciones fonéticas para herramientas de enseñanza de inglés, señalando fonemas concretos en una locución.
- Análisis de corpus de habla: procesar lotes de audio y extraer fronteras y etiquetas para construir bases de datos fonéticas etiquetadas de forma automática.
- Demo interactiva: desplegar el modelo con la demo Streamlit oficial (phonespam.streamlit.app) para explorar resultados sin infraestructura propia.
- Validación de pipelines de habla: usar el adaptador como referencia interpretable frente a clasificadores opacos en tareas de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al apoyarse en WavLM-large (≈317 M de parámetros) más un adaptador ligero, cabe holgadamente en GPUs de consumo con suficiente memoria para el codificador (orientativamente por debajo de 4 GB en fp16, estimación no confirmada por el autor).
- GPU recomendadas: no especificadas; el autor indica `device="cuda"` para GPU, sin modelos concretos.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del codificador base, aunque no hay cifras oficiales.
- Opciones de despliegue: librería propia `phonespam` (`pip install phonespam`), con `PhoneModel.from_pretrained`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wavlm-24-efficiency-1_1024-phonemodel | SPAM sobre S3M congelado, ablación 1/1024 TIMIT | WavLM-large | no disponible | MIT | Hugging Face (juice500) |
| WavLM-large (microsoft) | Codificador auto-supervisado de habla | — | no disponible | MIT | Hugging Face (microsoft) |
| Otros ajustes SPAM del mismo autor | SPAM con más datos de TIMIT | WavLM-large | no disponible | MIT | Hugging Face (juice500) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a enfoque, base y licencia.

## Limitaciones y advertencias

- Ajustado exclusivamente sobre inglés (TIMIT); el reconocimiento en otras lenguas depende de restringir el vocabulario con PHOIBLE y no está validado por el autor.
- Es una ablación de eficiencia muestral (1/1024 de TIMIT): su precisión será inferior a la de checkpoints entrenados con más datos; no debe usarse como sistema de producción de alta precisión.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- Riesgo de error en fronteras y etiquetas fonéticas en habla ruidosa, acentos no vistos o solapamientos; no se documentan métricas de error.
- El vocabulario PHOIBLE 2.0 se descarga en tiempo de ejecución y tiene licencia CC BY-SA 3.0, distinta de la MIT del modelo; hay que respetar sus términos si se redistribuye.
- El repositorio figura con tamaño 0.0 GB y sin descargas ni likes: disponibilidad y mantenimiento no están garantizados.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica en el sentido generativo, pero sí posibles etiquetados erróneos).
- Uso comercial permitido por MIT, pero sin garantías ni validación de rendimiento en dominios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_1024-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
