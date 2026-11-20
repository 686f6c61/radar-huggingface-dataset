# juice500/wavlm-24-ablation-stackframebwddelta-phonemodel

## Resumen

`wavlm-24-ablation-stackframebwddelta-phonemodel` es un modelo de segmentación y reconocimiento fonético (phone segmentation y phone recognition) construido sobre características congeladas de WavLM-large, un modelo auto-supervisado de habla (S3M). Lo desarrolla el autor de Hugging Face `juice500` en el marco del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en SLT 2026. El modelo no es un LLM ni un modelo generativo: es un cabezal de predicción fonética que consume representaciones de la capa 24 de WavLM-large y las proyecta a un espacio interpretable de 43 activaciones fonológicas.

La innovación central es SPAM (S3M-based Phonological Activation Mapping), que transforma cada frame del encoder en un vector de activaciones de rasgos fonológicos (voicing, nasality, stridency, etc.) en el rango [0, 1]. Sobre esa representación operan dos cabezales: uno de segmentación (detección de fronteras entre fonos) y otro de reconocimiento (etiquetado del fono). Esta variante concreta es una ablación de segmentación denominada `stackframebwddelta`, que emplea una pila reducida de señales de frontera (corresponde a la Tabla 3 del paper).

El modelo es relevante para investigación en fonética computacional y para pipelines de análisis del habla que requieran alineamiento fonético interpretable, con inventarios restringibles por idioma mediante PHOIBLE. Está entrenado y evaluado sobre TIMIT (inglés) y su licencia es MIT, aunque el repo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder WavLM-large congelado (capa 24) + proyección SPAM a 43 rasgos fonológicos + cabezales de segmentación y reconocimiento |
| Parametros totales | no disponible (el encoder base es WavLM-large; el número de parámetros del adaptador no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; ventana de frames no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenamiento); el reconocimiento puede restringirse a inventarios de otros idiomas vía `vocab_for_language` y PHOIBLE |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo se apoya en `microsoft/wavlm-large` como extractor de características congelado, usando la salida de la capa 24 sobre audio a 16 kHz. Sobre esas representaciones se aplica SPAM, que mapea cada frame a un vector de 43 activaciones fonológicas interpretables (nombres como `silence+`, `syl+`, `son+`, entre otros). A partir de esa representación compartida, dos cabezales resuelven las tareas de segmentación (fronteras entre fonos) y reconocimiento (etiqueta del fono). La variante `stackframebwddelta` es una ablación que reduce la pila de señales de frontera respecto a la configuración completa del paper.

El entrenamiento se realizó sobre el dataset TIMIT (`timit-asr/timit_asr`), en inglés. No se dispone en la información proporcionada de detalles sobre número de tokens, composición exacta del dataset, ni sobre si se aplicaron técnicas de ajuste adicionales (RLHF/DPO no aplican a esta tarea). La innovación técnica destacable es precisamente la interpretabilidad: en lugar de un encoder opaco, el modelo expone activaciones fonológicas que pueden inspeccionarse con `model.spam(...)`. No se mencionan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos `Segment(start, end, label)` con tiempos en segundos a partir de un fichero de audio.
- Reconocimiento fonético: etiqueta cada segmento con un fono según el inventario configurado.
- Representación fonológica interpretable: expone un tensor `(frames, 43)` de activaciones en [0, 1] con nombres de rasgo accesibles vía `spam.featnames`.
- Restricción de vocabulario por idioma: `vocab_for_language("deu")` limita el reconocimiento al inventario PHOIBLE del idioma indicado.
- Procesamiento de audio a 16 kHz con soporte de GPU (`device="cuda"`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de habla, no un LLM.
- Capacidades multilingües limitadas: entrenado en inglés, con posibilidad de restringir el vocabulario a otros inventarios PHOIBLE en inferencia.

## Casos de uso

- Alineamiento fonético forzado en corpus de habla: el modelo produce fronteras y etiquetas por fono directamente desde audio, útil para anotar TIMIT-like datasets o corpus de investigación fonética sin alineadores externos.
- Análisis fonológico interpretable: al exponer 43 activaciones de rasgos (voicing, nasality, stridency), permite estudiar qué rasgos activa el encoder en cada frame, lo que resulta valioso para investigación en fonética y fonología computacional.
- Evaluación de sistemas TTS y ASR a nivel de fono: comparar la salida fonética del modelo con la secuencia esperada permite medir errores de pronunciación o de alineamiento en pipelines de síntesis y reconocimiento.
- Herramientas de enseñanza de pronunciación: la segmentación temporal por fono con etiquetas permite generar retroalimentación sobre duración y articulación de segmentos en inglés.
- Preprocesado para modelos de habla downstream: las activaciones SPAM pueden servir como features interpretables para tareas posteriores (detección de errores de pronunciación, análisis de acento).
- Investigación en representaciones auto-supervisadas: al ser una ablación (`stackframebwddelta`), sirve para reproducir y comparar variantes de la pila de señales de frontera del paper SPAM.
- Experimentación con inventarios multilingües: mediante `vocab=vocab_for_language(...)` se puede probar el reconocimiento restringido a inventarios PHOIBLE de otros idiomas, aunque el encoder se entrenó en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia la Tabla 3 del paper para esta ablación, pero no incluye cifras concretas de métricas (p. ej. F1 de frontera, phone error rate) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el encoder base WavLM-large es un modelo de tamaño grande, por lo que se recomienda GPU para uso práctico.
- GPU recomendadas: no especificadas; el código admite `device="cuda"`, por lo que cualquier GPU CUDA compatible con PyTorch debería funcionar.
- ¿Cabe en consumer GPU?: no disponible; depende del tamaño efectivo del adaptador y del encoder congelado, dato no publicado.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`) con `PhoneModel.from_pretrained(...)`; demo en Streamlit (`phonespam.streamlit.app`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación o reconocimiento fonético (p. ej. alineadores forzados clásicos o modelos CTC fonéticos), ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Entrenado únicamente en inglés (TIMIT); el rendimiento en otros idiomas no está documentado y el uso de `vocab_for_language` solo restringe el inventario de salida, no adapta el encoder.
- Es un modelo de investigación con 0 descargas y 0 likes; no hay evidencia de uso en producción ni de validación externa.
- Riesgo de errores en fronteras y etiquetas fonéticas fuera de la distribución de TIMIT (audio con ruido, acentos no representados, dominios distintos).
- El repositorio ocupa 0.0 GB, lo que sugiere que los pesos podrían no estar incluidos o gestionarse de forma externa; conviene verificar la disponibilidad real de los artefactos antes de integrarlo.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado del modelo MIT; esto puede afectar a la distribución comercial de derivados que incorporen esos datos.
- Al ser una ablación (`stackframebwddelta`), representa una configuración reducida del sistema completo; no debe asumirse que iguala el rendimiento de la variante principal del paper.
- No es un modelo generativo: no admite prompts de texto, tool calling ni razonamiento; su uso está acotado al procesamiento de audio.
- No se documentan sesgos específicos; al trabajar sobre fonética, los sesgos potenciales estarían ligados a la distribución de hablantes de TIMIT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-ablation-stackframebwddelta-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
