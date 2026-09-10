# ai-sage/GigaAM-v3

## Resumen

GigaAM-v3 es un modelo fundacional de reconocimiento automático de voz (ASR) desarrollado por el equipo de ai-sage, disponible en HuggingFace bajo licencia MIT. Se trata de la tercera generación de la familia GigaAM y está pensado principalmente para el ruso, con soporte secundario para inglés. Su arquitectura se basa en Conformer, un modelo de tipo transformer adaptado a señales de audio, y fue preentrenado mediante el objetivo HuBERT-CTC sobre 700 000 horas de habla rusa. El modelo ofrece varias variantes: un encoder autocontribuido (`ssl`), modelos ASR con decodificadores CTC y RNN-T, y versiones end-to-end que generan directamente texto con puntuación y normalización. El repositorio de HuggingFace contiene 2,7 GB de pesos, y el tamaño declarado del modelo es de 220 a 240 millones de parámetros.

La relevancia de GigaAM-v3 radica en su rendimiento en dominios diversos del habla rusa, incluyendo conversaciones de callcenter, habla con música de fondo, habla natural y habla con características atípicas. Según los datos publicados, este modelo supera de media a alternativas como T-One con modelo de lenguaje y Whisper en estos escenarios, con una ventaja del 30 % respecto a generaciones anteriores en los nuevos dominios internos y sin pérdida de calidad en benchmarks públicos. Está pensado para investigadores y desarrolladores que necesiten un ASR en ruso eficiente, ligero y fácilmente integrable en pipelines de aprendizaje automático.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer |
| Parametros totales | 220–240 M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso, inglés |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

GigaAM-v3 está construido sobre la arquitectura Conformer, que combina capas de convolution y atención para modelar señales de audio de forma eficiente. El preentrenamiento se realiza con un objetivo HuBERT-CTC sobre 700 000 horas de habla rusa, lo que permite al modelo aprender representaciones robustas sin necesidad de etiquetas. Tras este preentrenamiento, se ofrecen dos variantes de decodificación: CTC y RNN-T. Además, las variantes `e2e_ctc` y `e2e_rnnt` incorporan módulos de puntuación y normalización de texto para producir transcripciones listas para su uso directo. El entrenamiento de esta tercera generación ha integrado nuevos conjuntos de datos internos, incluyendo grabaciones de callcenter, habla con música de fondo, habla natural y habla con características atípicas. Los autores reportan que, en estos dominios, los modelos mejoran de media un 30 % en tasa de error de palabras (WER) mientras mantienen la misma calidad en benchmarks públicos que las generaciones anteriores. La información disponible no detalla el número exacto de tokens ni la composición de los datos de entrenamiento, ni menciona procesos de RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz en ruso, con soporte de inglés en los conjuntos de datos.
- Transcripción de audio con decodificadores CTC y RNN-T, ofreciendo flexibilidad en términos de latencia y precisión.
- Generación de texto con puntuación y normalización automáticas en las variantes end-to-end (`e2e_ctc` y `e2e_rnnt`).
- Preentrenamiento self-supervised: la variante `ssl` puede utilizarse como encoder para fine-tuning en otras tareas de audio.
- Robustez mejorada en dominios difíciles como callcenter, habla con música de fondo, habla natural y habla atípica.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step; el modelo es exclusivamente un sistema de ASR.
- Capacidades multilingües limitadas al ruso e inglés, con un claro énfasis en el habla rusa.

## Casos de uso

- Transcripción de llamadas de callcenter: el modelo logra un WER del 10,3 % en el dominio callcenter, por lo que puede utilizarse para analizar conversaciones de atención al cliente, extraer métricas de calidad o generar resúmenes automáticos.
- Subtitulación de vídeos y podcasts en ruso: las variantes end-to-end con puntuación y normalización permiten producir subtítulos legibles sin necesidad de postprocesado lingüístico adicional.
- Asistentes de voz y dictado: la variante CTC es más ligera y rápida, adecuada para aplicaciones de dictado en ruso en tiempo real, mientras que la RNN-T ofrece una mayor precisión en entornos con ruido.
- Transcripción de reuniones o entrevistas en entornos con música de fondo: el entrenamiento con audio que contiene música hace que el modelo sea útil para grabar eventos, presentaciones o entrevistas ambientadas.
- Accesibilidad para personas con discapacidad auditiva: aunque el WER en habla con características atípicas es del 20,6 %, sigue siendo mucho mejor que el de Whisper (59,3 %), lo que permite crear sistemas de subtitulado para personas con dificultades del habla moderadas.
- Integración en pipelines de NLP: transcribir audio a texto con puntuación facilita el posterior paso de resumen o análisis de sentimiento con modelos de lenguaje, especialmente en dominios como la banca o la atención al cliente en ruso.
- Investigación en ASR ruso: la variante `ssl` puede servir como modelo base para experimentos de fine-tuning en otros dominios o tareas afines, gracias a su preentrenamiento robusto y su tamaño contenido.

## Benchmarks y rendimiento

Según la model card del autor, la tasa de error de palabras (WER) se evaluó en distintos dominios, comparando GigaAM-v3 con otros sistemas. Los resultados publicados son los siguientes:

| Set Name          | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|:------------------|-------:|--------:|-----------:|--------:|
| Open Datasets     |   3.0  |     2.6 |        5.7 |    12.0 |
| Golos Farfield    |   4.5  |     3.9 |       12.2 |    16.7 |
| Natural Speech    |   7.8  |     6.9 |       14.5 |    13.6 |
| Disordered Speech |  20.6  |    19.2 |       51.0 |    59.3 |
| Callcenter        |  10.3  |     9.5 |       13.5 |    23.9 |
| **Average**       | **9.2**| **8.4** |       19.4 |    25.1 |

En las comparaciones end-to-end frente a Whisper-large-v3, utilizando Gemini 2.5 Pro como juez, los modelos `e2e_ctc` y `e2e_rnnt` de GigaAM-v3 ganan por un margen promedio de 70:30. No se han publicado resultados adicionales de benchmarks fuera de esta tabla.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación oficial. Dado el tamaño declarado de 220–240 M parámetros, los pesos en FP32 ocuparían aproximadamente entre 0,9 y 1,1 GB, por lo que es previsible que se ejecute en GPUs consumer con 8 GB o más. Esta estimación es orientativa y no constituye un dato oficial.
- GPU recomendadas: no se especifican. Por tamaño, las RTX 3060, RTX 4060, RTX 4090 o GPU de centro de datos como A10 serían suficientes, pero se recomienda validar con la carga de trabajo concreta.
- Opciones de despliegue: el uso recomendado es mediante `transformers` con `trust_remote_code=True`, y las versiones de software sugeridas son `torch==2.8.0`, `torchaudio==2.8.0`, `transformers==4.57.1`, `pyannote-audio==4.0.0` y `torchcodec==0.7.0`. No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

En la tabla de benchmarks se comparan GigaAM-v3 CTC y RNN-T con T-One + LM y Whisper en términos de WER. A continuación se presenta una comparación más general, utilizando los datos disponibles y marcando como no disponible la información que no aparece en la documentación:

| Modelo | Parametros | WER promedio | Licencia | Disponibilidad |
|--------|------------|--------------|----------|----------------|
| GigaAM-v3 CTC | 220–240 M | 9,2 % | MIT | HuggingFace |
| GigaAM-v3 RNNT | 220–240 M | 8,4 % | MIT | HuggingFace |
| T-One + LM | no disponible | 19,4 % | no disponible | no disponible |
| Whisper-large-v3 | no disponible | 25,1 % | no disponible | no disponible |

GigaAM-v3 destaca por su menor WER promedio frente a las alternativas comparadas, a la vez que mantiene un tamaño reducido y una licencia permisiva. No se dispone en la información actual de los parámetros, contexto o licencias de T-One y Whisper, por lo que no es posible realizar una comparación más exhaustiva.

## Limitaciones y advertencias

- El modelo está entrenado predominantemente con habla rusa. El soporte de inglés se declara, pero no se especifica su volumen ni rendimiento, por lo que el uso en inglés puede ser menos fiable.
- Riesgo de alucinación: como en todos los sistemas ASR, en condiciones de ruido extremo, habla superpuesta o discurso muy atípico, el modelo puede transcribir incorrectamente. En el dominio "Disordered Speech" el WER alcanza el 20,6 %, un valor alto que debe tenerse en cuenta.
- Sesgos desconocidos: la información disponible no detalla análisis de sesgos. Al haberse entrenado con datos de callcenter y habla natural, es posible que existan sesgos derivados de la distribución de los datos.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero no incluye garantías ni responsabilidad sobre los resultados generados.
- Dependencia de código remoto: el uso del modelo requiere `trust_remote_code=True`, lo que implica ejecutar código proveído por el autor. Esto puede suponer un riesgo de seguridad si no se audita el código antes de su ejecución.
- No se han publicado benchmarks para otros idiomas ni para tareas adicionales al ASR.

## Enlaces

- HuggingFace: https://huggingface.co/ai-sage/GigaAM-v3
- Paper (InterSpeech 2025): https://arxiv.org/abs/2506.01192
- Repositorio de GitHub: https://github.com/salute-developers/GigaAM
- Notebook de uso en Colab: https://github.com/salute-developers/GigaAM/blob/main/colab_example.ipynb
- Métricas y evaluación: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
