# juice500/xls-r-3-phonemodel

## Resumen

`juice500/xls-r-3-phonemodel` es un modelo de segmentación y reconocimiento de fonemas en inglés construido sobre las representaciones congeladas de `facebook/wav2vec2-xls-r-300m` (XLS-R-300m). Lo desarrolla el autor `juice500` (Shikhar Bharadwaj y colaboradores, según la cita del paper) y se publica como parte del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en SLT 2026. El modelo no es un transcriber ASR convencional: convierte cada frame de un modelo auto-supervisado de habla (S3M) en un vector de 43 activaciones fonológicas interpretables (voz, nasalidad, estridencia, sílaba, etc.) y, a partir de ellas, realiza segmentación y etiquetado de fonemas.

La relevancia del modelo es metodológica: demuestra que es posible obtener fonemas y sus fronteras temporales a partir de features congeladas de un encoder S3M, sin reentrenar el encoder, usando una capa intermedia concreta (layer 3) de XLS-R-300m. Esto abarata el entrenamiento y hace el sistema más interpretable, ya que las activaciones fonológicas son inspeccionables y se pueden restringir a inventarios de fonemas por idioma (PHOIBLE).

Este checkpoint concreto es un punto de la rejilla encoder × capa del paper; el propio autor indica que el mejor modelo de la familia es `juice500/wavlm-24-phonemodel`. Está pensado para investigación fonética y fonológica, no para ASR de propósito general. El repo es de 0.0 GB, sin descargas ni likes en el momento de la consulta, y la librería de inferencia es `phonespam`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre encoder S3M congelado (wav2vec2-xls-r-300m, layer 3) + cabezas de segmentación y reconocimiento sobre activaciones fonológicas (SPAM) |
| Parametros totales | no disponible (el encoder base XLS-R-300m ronda los 300 M, pero el número exacto del adaptador no se publica en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; ventana efectiva no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otros idiomas vía `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El sistema sigue el esquema SPAM (S3M-based Phonological Activation Mapping). Se toma un encoder auto-supervisado de habla congelado —en este caso XLS-R-300m— y se extraen las representaciones de una capa concreta (layer 3). Esas representaciones se proyectan a un espacio de 43 activaciones fonológicas en el rango [0, 1] (features como `silence+`, `syl+`, `son+`, además de voz, nasalidad y estridencia). Sobre ese mapa de activaciones se apoyan dos cabezas: una de segmentación temporal (fronteras entre fonemas) y otra de reconocimiento (etiqueta de fonema por segmento). El encoder no se reentrena; solo se entrenan las proyecciones y cabezas.

El entrenamiento se realizó sobre el dataset `timit-asr/timit_asr`, según los metadatos del modelo. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea de etiquetado fonético supervisado). La innovación destacable es la interpretabilidad: en lugar de una representación opaca del encoder, el modelo expone un vector fonológico inspeccionable que puede restringirse a inventarios de fonemas por idioma mediante PHOIBLE 2.0.

## Capacidades

- Segmentación de fonemas con marcas temporales (`Segment(start, end, label)` en segundos).
- Reconocimiento de fonemas en inglés a partir de audio a 16 kHz.
- Exposición del mapa de 43 activaciones fonológicas (`model.spam(...)`) con nombres de feature accesibles (`spam.featnames`).
- Restricción del vocabulario de reconocimiento a inventarios PHOIBLE por idioma mediante `vocab_for_language("deu")`, etc.
- Inferencia en CPU o GPU (`device="cuda"`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo acústico-fonético, no un LLM.
- No soporta visión, audio generativo ni thinking mode.

## Casos de uso

- Investigación fonética y fonológica: extraer fronteras y etiquetas de fonemas de corpus de habla para análisis cuantitativo de duraciones, coarticulación o inventarios, aprovechando la salida estructurada por segmentos.
- Anotación asistida de corpus: preetiquetar fonemas en grabaciones TIMIT-like para acelerar la anotación manual, con la ventaja de que las activaciones fonológicas son auditables.
- Estudios de interpretabilidad de S3M: comparar qué capa de XLS-R-300m codifica mejor cada rasgo fonológico, usando este checkpoint como punto de la rejilla encoder × capa.
- Análisis contrastivo entre lenguas: restringir el vocabulario a inventarios PHOIBLE de distintos idiomas para estudiar qué fonemas de una L2 se confunden con los de la L1.
- Docencia en fonética computacional: demostrar el pipeline completo (features S3M → activaciones fonológicas → segmentos) con un modelo ligero y licencia permisiva.
- Evaluación de sistemas de pronunciación: usar las fronteras de fonemas como referencia para medir errores de alineamiento o de detección en herramientas de CAPT (Computer-Assisted Pronunciation Training).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2607.09020, SLT 2026) para las cifras, pero no se incluyen tablas de resultados en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre XLS-R-300m congelado, la huella es modesta y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con suficiente memoria para XLS-R-300m (p. ej. RTX 3060/4090, A100, H100); el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con varios GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`), con `PhoneModel.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Capa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/xls-r-3-phonemodel` | XLS-R-300m | Segmentación + reconocimiento de fonemas | 3 | MIT | Hugging Face |
| `juice500/wavlm-24-phonemodel` | WavLM | Segmentación + reconocimiento de fonemas | 24 | no disponible en la información | Hugging Face (indicado como mejor modelo de la familia) |
| Otros checkpoints de la rejilla encoder × capa | XLS-R / WavLM | Igual | distintas | no disponible | Repo del autor |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado en inglés (`language: en`); el uso con otros idiomas vía `vocab_for_language` restringe el vocabulario pero no garantiza calidad fuera del dominio de entrenamiento.
- Entrenado sobre TIMIT, un corpus pequeño y de dominio acotado (habla leída, condiciones controladas); el rendimiento en habla espontánea o ruidosa puede degradarse.
- No es un ASR: no produce transcripciones ortográficas ni texto, solo fonemas y sus fronteras.
- Riesgo de alucinación en el sentido de etiquetados erróneos de fonemas en segmentos ambiguos o con ruido; conviene validar con anotación humana en producción.
- Sesgos: no se documentan análisis de sesgo por acento, género o dialecto; al depender de TIMIT, puede estar sesgado hacia las variedades presentes en ese corpus.
- Licencia MIT para el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que es CC BY-SA 3.0 y se licencia por separado; hay que respetar esa licencia si se redistribuye el inventario.
- Este checkpoint es un punto intermedio de la rejilla del paper; el autor recomienda `juice500/wavlm-24-phonemodel` para el mejor rendimiento.
- Repo de 0.0 GB y sin descargas en la consulta: conviene verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/xls-r-3-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Paper (arXiv:2607.09020): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset de entrenamiento: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
- Mejor modelo de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
