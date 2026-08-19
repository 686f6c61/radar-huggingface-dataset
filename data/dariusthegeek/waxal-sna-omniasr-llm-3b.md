# DariusTheGeek/waxal-sna-omniasr-llm-3b

## Resumen

El modelo `waxal-sna-omniasr-llm-3b` es un checkpoint de reconocimiento automático del habla (ASR) desarrollado por DariusTheGeek como parte de la solución WAXAL para el desafío de ASR de Google sobre lenguas africanas. Se trata de un fine-tuning del modelo base `facebook/omniASR-LLM-3B-v2` específicamente para el idioma shona (código `sn`), utilizando el conjunto de datos supervisado `google/WaxalNLP` en su partición de shona y lingala. El modelo está pensado como un componente de un sistema de ensamblaje (ensemble) de cuatro modelos, donde se aplica un promediado de parámetros (top-3 FP64) y decodificación con beam search de ancho 5 y normalización de longitud.

La relevancia de este modelo radica en que aborda la escasez de sistemas ASR de calidad para lenguas africanas de bajos recursos. Según el benchmark WAXALNet, los modelos fine-tuned como este superan en 26,9 puntos porcentuales a los grandes modelos zero-shot en estas lenguas. El modelo se distribuye bajo licencia Apache 2.0 y utiliza la librería fairseq2, con un tamaño de repositorio de 17,5 GB. Aunque no está pensado para uso aislado, su integración en el pipeline completo de WAXAL permite obtener transcripciones precisas en shona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en `facebook/omniASR-LLM-3B-v2`, arquitectura interna no especificada) |
| Parametros totales | 3B (nominal, según el nombre del modelo base; no confirmado en la ficha) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona promediado FP64 de parámetros, no cuantización) |
| Idiomas soportados | sn (shona) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch), tokenizer `omniASR_tokenizer_written_v2.model`, con `card.yaml` para fairseq2 |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información proporcionada. El modelo se obtiene mediante fine-tuning del checkpoint `facebook/omniASR-LLM-3B-v2`, un sistema de ASR omni-lingüístico basado en un modelo de lenguaje de 3B parámetros. El entrenamiento se realizó sobre la partición supervisada de shona (y lingala, según la descripción del dataset) de `google/WaxalNLP`, con semilla 42. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El artefacto liberado corresponde al promediado de los tres mejores checkpoints en precisión FP64, y la decodificación se realiza con beam search de ancho 5 y normalización de longitud.

## Capacidades

- Reconocimiento automático del habla para el idioma shona, con transcripción de audio a texto.
- Decodificación con beam search (ancho 5) y normalización de longitud para mejorar la calidad de las transcripciones.
- Integración en un pipeline de ensamblaje (ensemble) de cuatro modelos, donde se combinan las salidas mediante fusión y post-procesamiento.
- Soporte de entrada de audio en formato WAV (a través del CLI del repositorio de solución).
- Capacidad multilingüe limitada: aunque el modelo base es omni-lingüístico, este fine-tuning está especializado en shona y no se garantiza su rendimiento en otros idiomas.

## Casos de uso

- Transcripción de reuniones y conferencias en shona: el modelo puede convertir grabaciones de audio en texto, facilitando la documentación y el análisis posterior. Su integración en el pipeline WAXAL permite manejar contextos de audio largos con una sola pasada.
- Subtitulado automático de vídeos en shona: al transcribir el audio, se pueden generar subtítulos para contenido audiovisual, mejorando la accesibilidad en comunidades de habla shona.
- Archivado y búsqueda de contenido oral: las transcripciones generadas permiten indexar y buscar material de audio histórico o actual en shona, útil para bibliotecas digitales o archivos de radio.
- Asistentes de voz en shona: aunque el modelo es solo ASR, puede servir como componente de entrada para sistemas de diálogo o asistentes que operen en esta lengua.
- Análisis de llamadas de atención al cliente: empresas que atienden a clientes en shona pueden transcribir llamadas para control de calidad o extracción de información, siempre que se integre el pipeline completo.
- Investigación lingüística: el modelo puede apoyar estudios sobre la lengua shona, generando corpus transcritos a partir de grabaciones de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El proyecto WAXALNet reporta que los modelos fine-tuned superan a los gigantes zero-shot por 26,9 puntos porcentuales en lenguas africanas, pero no se proporcionan métricas concretas (WER, CER, etc.) para este checkpoint en particular.

## Requisitos de hardware

- El peso del modelo es de 17,5 GB (archivo `model.pt`), lo que implica una carga de memoria considerable. En FP16, se estima un uso de VRAM de al menos 18-20 GB, por lo que se requiere una GPU con 24 GB o más (por ejemplo, RTX 3090, RTX 4090, A100 40 GB o superior).
- No se especifican GPUs recomendadas ni opciones de despliegue. El modelo se carga mediante fairseq2 y se ejecuta a través del CLI del repositorio de solución, que incluye un entorno pinneado.
- La inferencia se realiza con batch size 1, lo que limita el throughput pero permite procesar audio de forma secuencial. No se proporcionan datos de latencia.
- No se mencionan cuantizaciones (GGUF, etc.), por lo que no es posible ejecutarlo en CPU de manera eficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| `DariusTheGeek/waxal-sna-omniasr-llm-3b` | 3B (nominal) | No disponible | sn | Apache 2.0 | PyTorch (fairseq2) |
| `mlai-dante/waxal-omniASR-LLM-1B-v2` | 1B (nominal) | No disponible | lin, lug, sna | No especificada | No especificado |
| `facebook/omniASR-LLM-3B-v2` (base) | 3B | No disponible | Omni | Apache 2.0 | PyTorch (fairseq2) |

No se dispone de datos de rendimiento comparativos entre estos modelos. La comparativa se limita a parámetros y licencia; el modelo base es el padre y el de 1B es otro fine-tuning del mismo desafío.

## Limitaciones y advertencias

- Este modelo es un componente de un ensamblaje (ensemble) y no está diseñado para uso independiente; su rendimiento aislado puede ser inferior al del pipeline completo.
- Solo está especializado en shona; el uso en otros idiomas puede producir resultados incorrectos o de baja calidad.
- No se han publicado métricas de rendimiento (WER, CER) ni estudios de sesgos o alucinaciones en la transcripción.
- El tamaño del modelo (17,5 GB) dificulta su despliegue en entornos con recursos limitados, y no se ofrecen versiones cuantizadas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del dataset `google/WaxalNLP` para posibles restricciones adicionales.
- La fecha de creación (agosto de 2026) es posterior a la fecha actual, lo que sugiere que el modelo puede ser parte de un proyecto futuro o experimental.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/DariusTheGeek/waxal-sna-omniasr-llm-3b)
- [Repositorio de la solución WAXAL ASR](https://github.com/DariusTheGeek/waxal-asr-solution)
- [Dataset google/WaxalNLP](https://huggingface.co/datasets/google/WaxalNLP)
- [Benchmark WAXALNet](https://waxalnet.vercel.app/)
