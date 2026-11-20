# juice500/wavlm-6-phonemodel

## Resumen

wavlm-6-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de WavLM-large, un modelo auto-supervisado de voz (S3M) de 16 kHz desarrollado por Microsoft. El adaptador implementa SPAM (S3M-based Phonological Activation Mapping), una técnica que proyecta cada trama del encoder en un vector de 43 activaciones fonológicas interpretables (sonoridad, nasalidad, estridencia, silabicidad, etc.) y, a partir de ellas, realiza segmentación y etiquetado de fonos. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores) y se publica junto al artículo presentado en SLT 2026.

El modelo corresponde a un único punto de la rejilla encoder x capa: concretamente la capa 6 de WavLM-large. No es un modelo completo, sino un adaptador ligero que se apoya en el encoder congelado; por tanto, el repo no contiene pesos completos de WavLM. El autor indica que el mejor punto de la rejilla es wavlm-24-phonemodel, por lo que esta variante debe considerarse una pieza de un estudio sistemático más que el modelo de referencia.

Su relevancia radica en que convierte una representación opaca (las activaciones internas de un S3M) en una representación fonológicamente interpretable y reutilizable para tareas de segmentación y reconocimiento de fonos, con licencia MIT y una librería propia (phonespam) que expone una API sencilla de transcripción. Está entrenado y evaluado sobre TIMIT (inglés), por lo que su ámbito lingüístico declarado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder WavLM-large congelado (transformer convolucional, capa 6) |
| Parametros totales | no disponible (adaptador ligero; WavLM-large base ~317 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa utterances de voz a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (entrenado en TIMIT); reconocimiento restringible a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0) |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga con `PhoneModel.from_pretrained` de la librería phonespam) |

## Arquitectura y entrenamiento

El modelo no entrena el encoder: parte de WavLM-large congelado a 16 kHz y extrae las representaciones de la capa 6. Sobre esas representaciones, SPAM aprende una proyección por trama hacia 43 activaciones fonológicas en el rango [0, 1], que actúan como representación intermedia interpretable. A partir de esa matriz de activaciones, dos cabezas (una de segmentación y otra de reconocimiento) producen segmentos contiguos con etiqueta fonética. La innovación principal es precisamente esta representación intermedia: en lugar de predecir fonos directamente desde features opacos, el modelo expone las dimensiones fonológicas que sustentan la decisión, lo que facilita el análisis y la depuración.

Los datos de entrenamiento declarados son el dataset TIMIT ASR (timit-asr/timit_asr), en inglés. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF/DPO; tampoco especifica técnicas de decodificación especulativa ni atención lineal. El artículo de referencia (SLT 2026) es la fuente para los detalles de entrenamiento y evaluación, no recogidos en la información disponible.

## Capacidades

- Segmentación fonética: divide una señal de voz en intervalos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento de fonos: asigna una etiqueta fonética a cada segmento.
- Representación fonológica interpretable: expone una matriz de (tramas x 43) activaciones en [0, 1] con nombres de rasgo (`silence+`, `syl+`, `son+`, etc.).
- Restricción de vocabulario por lengua: permite limitar el reconocimiento a un inventario PHOIBLE concreto (`vocab_for_language`).
- Procesamiento a 16 kHz sobre utterances completas.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Análisis fonético asistido en investigación: el modelo devuelve segmentos con tiempos y etiquetas, y además la matriz SPAM de 43 rasgos, lo que permite estudiar qué dimensiones fonológicas activan determinados sonidos en corpus controlados como TIMIT.
- Anotación automática de corpus de voz en inglés: `transcribe` genera alineaciones fono a fono que pueden servir como preanotación para revisión humana en proyectos de fonética y fonología.
- Estudios de variación y coarticulación: al disponer de activaciones continuas por trama, se pueden analizar transiciones entre fonos y solapamientos de rasgos en lugar de solo etiquetas discretas.
- Comparación de capas de un S3M: al ser un punto de la rejilla encoder x capa (capa 6), permite contrastar experimentalmente qué información fonética contiene cada capa de WavLM-large frente a otras variantes como wavlm-24-phonemodel.
- Filtrado o verificación fonética en pipelines de voz: la restricción de vocabulario por inventario PHOIBLE permite comprobar si una utterance inglesa contiene fonos esperados o atípicos, útil para control de calidad de grabaciones.
- Docencia y demostración interactiva: el demo de Streamlit y la API `spam()` facilitan mostrar visualmente la correspondencia entre señal, segmentos y rasgos fonológicos en clases o talleres.
- Prototipado en investigación multilingüe: aunque entrenado en inglés, el mecanismo `vocab_for_language` permite experimentar con inventarios de otras lenguas, siempre con validación empírica adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo (arXiv 2607.09020, SLT 2026) para los resultados, pero no incluye cifras concretas de segmentación o reconocimiento en esta ficha.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; al tratarse de un adaptador sobre WavLM-large congelado (~317 M de parámetros en el encoder), la inferencia es ligera en comparación con modelos generativos, pero no se documentan cifras.
- GPU recomendadas: no disponible; la API admite `device="cuda"` para GPU, sin lista de modelos recomendados.
- GPU de consumo: no disponible; no se confirma compatibilidad con RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`), con `PhoneModel.from_pretrained`; demo en Streamlit (phonespam.streamlit.app). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/wavlm-6-phonemodel | Adaptador sobre WavLM-large (capa 6) | no disponible | Segmentación y reconocimiento de fonos | MIT | Hugging Face + librería phonespam |
| juice500/wavlm-24-phonemodel | Adaptador sobre WavLM-large (capa 24) | no disponible | Segmentación y reconocimiento de fonos | MIT (según repo hermano) | Hugging Face |
| microsoft/wavlm-large | ~317 M | no disponible | Representación auto-supervisada de voz (encoder base) | no disponible en esta ficha | Hugging Face |

La comparativa con otros sistemas de segmentación fonética (por ejemplo, alineadores forzados o modelos dedicados tipo CTC) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ámbito lingüístico limitado: entrenado únicamente sobre TIMIT (inglés); el uso con otras lenguas requiere el mecanismo `vocab_for_language` y validación adicional, sin garantías de rendimiento.
- No es un modelo completo: es un adaptador dependiente del encoder WavLM-large congelado; no sustituye al modelo base ni incluye pesos completos en el repo (0.0 GB).
- Variante no óptima: el propio autor señala que wavlm-24-phonemodel es el mejor punto de la rejilla, por lo que esta capa 6 es una pieza comparativa, no la recomendada para producción.
- Sin métricas publicadas en la ficha: no hay datos de error de segmentación ni de precisión de reconocimiento en la información disponible, lo que impide estimar su fiabilidad en producción.
- Dependencia externa de licencia: `vocab_for_language` descarga PHOIBLE 2.0 en runtime, con licencia CC BY-SA 3.0 distinta de la MIT del modelo; conviene revisar la implicaciones de compartición derivadas.
- Riesgo de alucinación fonética: como todo sistema de etiquetado automático, puede producir segmentos o etiquetas incorrectas en habla ruidosa, acentos no representados en TIMIT o solapamientos; se recomienda revisión humana en usos críticos.
- Sesgos: no se documentan sesgos específicos de género, edad o acento en la información disponible, aunque la limitación a TIMIT implica una cobertura restringida de variedades del inglés.
- Sin soporte documentado de cuantización ni de despliegue en motores estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita su integración en infraestructuras ya existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-6-phonemodel
- Modelo hermano (mejor punto de la rejilla): https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Artículo (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
