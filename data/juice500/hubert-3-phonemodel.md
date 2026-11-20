# juice500/hubert-3-phonemodel

## Resumen

`hubert-3-phonemodel` es un adaptador para segmentación y reconocimiento de fonemas construido sobre el modelo auto-supervisado de voz `facebook/hubert-large-ll60k` (HuBERT-large), concretamente sobre su capa 3. Lo desarrolla `juice500` como parte del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo no genera texto libre: su tarea es tomar una señal de audio a 16 kHz y devolver una secuencia de segmentos temporales etiquetados con fonemas.

La innovación central es SPAM (S3M-based Phonological Activation Mapping), una técnica que proyecta cada frame de representación del encoder auto-supervisado a un vector de 43 activaciones fonológicas interpretables (voicing, nasality, stridency, etc.). Esas activaciones alimentan dos cabezas: una de segmentación y otra de reconocimiento. Esto convierte la representación opaca de HuBERT en un espacio con significado fonético, lo que facilita la interpretabilidad y permite restringir el vocabulario de salida a inventarios fonológicos reales.

Este checkpoint concreto es un punto de la rejilla encoder × capa del paper (Figura 2): HuBERT-large, capa 3. El propio autor indica que no es el mejor modelo de la familia y remite a `juice500/wavlm-24-phonemodel` para el mejor resultado. Es relevante para investigación en fonética computacional, documentación de lenguas y evaluación de modelos de voz, no tanto como componente de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre HuBERT-large (transformer auto-supervisado) con cabezas de segmentación y reconocimiento; representación intermedia SPAM de 43 activaciones fonológicas |
| Parametros totales | no disponible (el repo tiene 0.0 GB; el backbone HuBERT-large ronda los 317 M, pero el dato del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz por frames; no se documenta ventana máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas mediante `vocab_for_language` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0, licenciado aparte) |
| Formato de pesos | no disponible (se carga vía `phonespam`, librería propia) |

## Arquitectura y entrenamiento

El modelo se apoya en HuBERT-large (`facebook/hubert-large-ll60k`), un transformer auto-supervisado entrenado con predicción de unidades ocultas sobre audio de 16 kHz. Sobre la capa 3 de ese encoder congelado se aplica SPAM: una proyección que mapea cada frame a un vector de 43 activaciones fonológicas en el rango [0, 1] con nombres como `silence+`, `syl+` o `son+`. A partir de esa representación interpretable operan dos cabezas, una de segmentación y otra de reconocimiento de fonemas.

El dataset indicado en la model card es TIMIT (`timit-asr/timit_asr`), un corpus clásico de inglés con anotaciones fonéticas a nivel de fonema, adecuado para tareas de segmentación y reconocimiento alineado. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; para una tarea de este tipo lo habitual sería entrenamiento supervisado con alineamientos forzados, pero ese detalle no está documentado. La innovación destacable es precisamente el mapeo a rasgos fonológicos, que aporta interpretabilidad y permite condicionar la salida a inventarios fonológicos reales.

## Capacidades

- Segmentación de fonemas: devuelve segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético.
- Representación interpretable: expone el vector SPAM de 43 activaciones fonológicas por frame (voicing, nasality, stridency, etc.).
- Restricción de vocabulario: permite limitar el reconocimiento al inventario fonológico de una lengua concreta vía PHOIBLE (`vocab_for_language`).
- Procesamiento de audio a 16 kHz.
- No soporta generación de texto, tool calling, agentes ni visión; es un modelo especializado en análisis fonético.
- Capacidad multilingüe limitada: el modelo está entrenado para inglés, aunque el mecanismo de vocabulario permite adaptar la salida a inventarios de otras lenguas.

## Casos de uso

- Investigación fonética y fonológica: obtener alineamientos a nivel de fonema con tiempos precisos sobre corpus de habla para estudios de duración, coarticulación o variación.
- Documentación de lenguas minoritarias: usar `vocab_for_language` para restringir la salida al inventario PHOIBLE de una lengua concreta y asistir en la transcripción fonética de grabaciones de campo.
- Evaluación de modelos de voz: comparar la calidad de representaciones de distintos encoders auto-supervisados (HuBERT, WavLM, etc.) midiendo la coherencia de las activaciones fonológicas.
- Análisis de pronunciación: detectar qué fonemas produce un hablante y en qué intervalos, útil en herramientas de enseñanza de idiomas o logopedia.
- Preprocesado para TTS y ASR: generar alineamientos fonéticos que sirvan como supervisión o validación en pipelines de síntesis y reconocimiento.
- Investigación en interpretabilidad: estudiar qué rasgos fonológicos captura cada capa de un encoder auto-supervisado, gracias a la representación SPAM expuesta directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador sobre HuBERT-large (unos 317 M de parámetros en el backbone), la inferencia cabe holgadamente en GPUs de consumo, pero no se documenta la cifra exacta.
- GPU recomendadas: no disponible; el uso documentado admite `device="cuda"` y también CPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del backbone, aunque no se confirma en la información disponible.
- Opciones de despliegue: librería propia `phonespam` (`pip install phonespam`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Capa | Licencia | Notas |
|---|---|---|---|---|---|
| `juice500/hubert-3-phonemodel` | HuBERT-large | Segmentación y reconocimiento de fonemas | 3 | MIT | Checkpoint de la rejilla del paper; no es el mejor de la familia |
| `juice500/wavlm-24-phonemodel` | WavLM | Segmentación y reconocimiento de fonemas | 24 | MIT (según repo del autor) | Señalado por el autor como el mejor modelo de la familia |
| Otros checkpoints de la rejilla encoder × capa | HuBERT / WavLM | Igual | Varias | MIT | El paper explora la rejilla completa; no se detallan aquí sus métricas |

No se dispone de datos de rendimiento comparado entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM ni un ASR generalista; solo produce segmentos fonéticos, no transcripciones ortográficas.
- Entrenado para inglés: el uso con otras lenguas depende de restringir el vocabulario vía PHOIBLE y no está validado en la información disponible.
- Checkpoint no óptimo: el propio autor indica que la capa 3 de HuBERT-large no es la mejor configuración; para el mejor resultado remite a `wavlm-24-phonemodel`.
- Dependencia de PHOIBLE: `vocab_for_language` descarga PHOIBLE 2.0 en runtime, con licencia CC BY-SA 3.0 distinta de la MIT del modelo; conviene revisar obligaciones de atribución y share-alike si se redistribuye.
- Riesgo de errores en fronteras de segmento y en fonemas acústicamente próximos; no se documentan tasas de error en la información disponible.
- Sin datos publicados de benchmarks, latencia ni requisitos de hardware: difícil estimar comportamiento en producción.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy reducido y poca validación comunitaria.
- Sesgos: no documentados; al entrenar sobre TIMIT (hablantes de inglés americano), es esperable un sesgo hacia esa variedad y hacia condiciones de grabación limpias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-3-phonemodel
- Modelo base: https://huggingface.co/facebook/hubert-large-ll60k
- Mejor modelo de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
