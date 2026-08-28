# mocomoco-inc/mocovoice-whisper-turbo-ja-animal-synthetic-v0.1

## Resumen

El modelo `mocomoco-inc/mocovoice-whisper-turbo-ja-animal-synthetic-v0.1` es un prototipo de adaptación léxica para reconocimiento de voz automático (ASR) en japonés, desarrollado por mocomoco inc. como parte de su producto mocoVoice. Se basa en el modelo `openai/whisper-large-v3-turbo` y ha sido ajustado mediante LoRA con datos sintéticos para mejorar el reconocimiento de términos específicos del dominio de animales. El repositorio distribuye únicamente el artefacto de inferencia en formato CTranslate2 int8 (`ct2-int8/`), junto con el contrato de datos, el código de entrenamiento y un receipt de release con hashes SHA-256. No se incluyen los pesos LoRA ni un checkpoint Transformers fusionado.

Este lanzamiento se presenta explícitamente como un artefacto de demostración y marketing, no como un modelo de producción o certificado para seguridad. Su relevancia radica en mostrar un flujo reproducible de adaptación léxica con LoRA, conversión a CTranslate2 y evaluación controlada sobre un holdout sintético, con métricas de CER y presencia de términos. El modelo está pensado para desarrolladores e investigadores que quieran auditar el proceso de adaptación, no para despliegues en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder) |
| Parametros totales | no disponible (modelo base: openai/whisper-large-v3-turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (ct2-int8) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper large-v3-turbo, un transformer encoder-decoder entrenado originalmente por OpenAI para ASR multilingue. La adaptacion se realizo mediante LoRA (Low-Rank Adaptation), cuyos pesos se fusionaron y convirtieron a CTranslate2 en formato int8. El entrenamiento utilizo datos sinteticos generados por TTS japones, con plantillas de prompts no vistas en el holdout de evaluacion. El repositorio incluye el codigo de entrenamiento, evaluacion y exportacion, asi como un contrato de datos que documenta la procedencia de los prompts sinteticos. No se especifican el numero de tokens de entrenamiento ni la composicion detallada del dataset. La model card indica que se trata de una adaptacion lexica controlada, no de un reentrenamiento completo.

## Capacidades

- Reconocimiento de voz automatico en japones, con decodificacion beam-4 (segun la configuracion de referencia).
- Adaptacion lexica para terminos del dominio de animales, evaluada sobre un holdout sintetico.
- Inferencia eficiente gracias a la cuantizacion int8 en CTranslate2.
- Integracion con el wrapper `WhisperModel` de MocoVoice para comparaciones consistentes entre backends.
- No incluye capacidades de tool calling, agentes, vision ni otros modos; es exclusivamente ASR.

## Casos de uso

- Evaluacion de tecnicas de adaptacion lexica con LoRA en modelos ASR: el repositorio proporciona scripts y un receipt de release que permiten reproducir el flujo de entrenamiento, fusion y conversion, util para investigacion comparativa.
- Auditoria de calidad de transcripcion en dominios especificos: las metricas de CER y presencia de terminos sobre el holdout sintetico sirven para medir el impacto de la adaptacion, aunque con cautela por tratarse de datos sinteticos.
- Pruebas de integracion con CTranslate2 y el wrapper MocoVoice: el artefacto CT2 int8 puede usarse para validar la paridad entre el modelo Transformers de referencia y la version cuantizada.
- Demostracion de un pipeline reproducible de fine-tuning y exportacion: el codigo incluido documenta cada paso, desde el entrenamiento hasta la generacion del receipt, lo que facilita su uso como plantilla para otros dominios.
- Benchmarking de cuantizacion int8 frente a modelos sin cuantizar: la model card incluye comparaciones de CER entre el CT2 entregado y el CT2 generico, lo que permite estudiar el impacto de la cuantizacion en la fidelidad de la transcripcion.
- Investigacion sobre el uso de datos sinteticos en adaptacion de vocabulario: el contrato de datos y las metricas de holdout permiten analizar hasta que punto los datos TTS sinteticos mejoran el reconocimiento de terminos controlados.

## Benchmarks y rendimiento

La model card presenta resultados de evaluacion sobre un holdout sintetico de TTS japones, con plantillas de prompts no vistas. Estos datos miden la adaptacion lexica en un entorno controlado, no la precision en grabaciones reales. Se incluyen dos comparaciones: la primera entre el modelo base Turbo y un dominio de referencia (no distribuido), y la segunda entre el CT2 generico y el CT2 entregado, ambos decodificados con el wrapper MocoVoice.

| Metrica (holdout sintetico) | Base Turbo | Dominio de referencia (no distribuido) |
|---|---:|---:|
| CER de dominio | 0.2124 | 0.2095 |
| Termino de dominio presente | 99/135 (73.3%) | 99/135 (73.3%) |
| Termino presente (diagnostico sin puntuacion) | 99/135 (73.3%) | 99/135 (73.3%) |
| Literal critico preservado | 76/135 (56.3%) | 76/135 (56.3%) |
| Hecho de codigo controlado | 36/45 (80.0%) | 36/45 (80.0%) |
| Valor numerico controlado | 44/45 (97.8%) | 44/45 (97.8%) |
| Hecho de valor + unidad | 20/45 (44.4%) | 20/45 (44.4%) |
| CER sintetico neutro | 0.0429 | 0.0429 |

| Metrica (CT2 entregado) | CT2 generico | CT2 de dominio entregado |
|---|---:|---:|
| CER de dominio | 0.1607 | 0.1573 |
| Termino de dominio presente | 102/135 (75.6%) | 103/135 (76.3%) |
| Termino presente (sin puntuacion) | 102/135 (75.6%) | 103/135 (76.3%) |
| Hecho de codigo controlado | 34/45 (75.6%) | 34/45 (75.6%) |
| Valor numerico controlado | 44/45 (97.8%) | 44/45 (97.8%) |
| Hecho de valor + unidad | 36/45 (80.0%) | 36/45 (80.0%) |

Ademas, la model card indica que el CT2 int8 entregado produjo 84/147 salidas exactamente iguales al checkpoint Transformers de referencia tras normalizacion, con un CER de 0.0643 entre ambos. Estos resultados son diagnosticos de cuantizacion, no afirmaciones de precision absoluta. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- Tamano del repositorio: 0.8 GB (artefacto CT2 int8).
- VRAM estimada para inferencia: no disponible oficialmente, pero al ser un modelo int8 de ~0.8 GB, es probable que quepa en GPUs consumer con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050). No se proporcionan cifras confirmadas.
- GPU recomendadas: no especificadas; al ser CT2 int8, puede ejecutarse en CPU o GPU con soporte para CTranslate2.
- Opciones de despliegue: CTranslate2, integrable con el wrapper `WhisperModel` de MocoVoice. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La unica comparativa disponible en la informacion proporcionada es con el modelo base Whisper large-v3-turbo en su version CT2 generica, utilizando los datos del holdout sintetico. No se dispone de informacion sobre otros modelos de adaptacion lexica similares.

| Modelo | Formato | CER de dominio (holdout sintetico) | Termino presente | Licencia |
|---|---|---|---|---|
| Whisper large-v3-turbo (CT2 generico) | CTranslate2 | 0.1607 | 102/135 (75.6%) | MIT (modelo base) |
| mocomoco-inc/mocovoice-whisper-turbo-ja-animal-synthetic-v0.1 | CTranslate2 int8 | 0.1573 | 103/135 (76.3%) | MIT |

La mejora en CER es marginal (0.0034) y la presencia de terminos aumenta en un solo caso, lo que refleja el caracter de prototipo de la adaptacion.

## Limitaciones y advertencias

- Prototipo de demostracion y marketing, no apto para produccion ni para decisiones autonomas.
- Evaluado exclusivamente con datos sinteticos (TTS japones); no se ha probado con grabaciones reales de campo, ruido, acentos o entornos operativos.
- No se garantiza la precision en codigos, valores numericos, unidades, fechas, instrucciones de seguridad ni estados operativos; se recomienda revision humana de todas las transcripciones.
- El repositorio no distribuye los pesos LoRA ni el checkpoint Transformers fusionado; solo el artefacto CT2 int8.
- Las metricas de la model card son diagnosticos controlados, no afirmaciones de precision en el mundo real.
- No se han realizado pruebas de sesgos, alucinaciones ni robustez ante variaciones linguisticas fuera del dominio de animales.
- La licencia MIT permite uso comercial, pero el modelo no esta certificado para entornos de produccion; el usuario asume la responsabilidad de su validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-animal-synthetic-v0.1
- Producto mocoVoice (pagina oficial): https://products.mocomoco.ai/en/
- Noticias de mocomoco inc.: https://www.mocomoco.ai/en/
- Guia de usuario de mocoVoice: https://guide.mocomoco.ai/en/
