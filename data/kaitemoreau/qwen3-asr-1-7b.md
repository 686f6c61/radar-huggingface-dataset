# kaitemoreau/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el equipo Qwen (Alibaba), publicado en Hugging Face a traves del repositorio `kaitemoreau/Qwen3-ASR-1.7B`. Forma parte de la familia Qwen3-ASR, que incluye tambien una variante de 0.6B y un modelo complementario de alineamiento forzado (Qwen3-ForcedAligner-0.6B). El modelo se construye sobre la base del modelo fundacional Qwen3-Omni y aprovecha su capacidad de comprension de audio para realizar transcripcion y identificacion de idioma en 30 idiomas y 22 dialectos chinos.

El modelo resuelve el problema de la transcripcion de voz multilingue de alta calidad en entornos acusticos complejos, incluyendo voz cantada y canciones con musica de fondo. Segun la model card, la version de 1.7B alcanza un rendimiento state-of-the-art entre los modelos ASR de codigo abierto y es competitiva con las APIs comerciales propietarias mas potentes. Soporta inferencia tanto en modo offline como en streaming con un unico modelo, y es capaz de transcribir audio de larga duracion.

Con 2.349.217.408 parametros reales (segun los pesos en safetensors) y un tamano de repositorio de 4.7 GB, el modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. La familia incluye un toolkit de inferencia completo con soporte para vLLM, serving asincrono, streaming y prediccion de timestamps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo basado en Qwen3-Omni; tag `qwen3_asr`) |
| Parametros totales | 2.349.217.408 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 30 idiomas (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro) y 22 dialectos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se apoya en el modelo fundacional Qwen3-Omni y su capacidad de comprension de audio. El modelo se publica con el tag `qwen3_asr` y esta disenado especificamente para la tarea de reconocimiento automatico del habla. La model card incluye diagramas de arquitectura (overview.jpg) pero no se proporciona una descripcion textual de la misma en la informacion disponible.

En cuanto al entrenamiento, la model card indica que el modelo aprovecha "datos de entrenamiento de voz a gran escala" junto con la capacidad de comprension de audio del modelo base Qwen3-Omni. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La familia incluye un modelo complementario Qwen3-ForcedAligner-0.6B para prediccion de timestamps en hasta 5 minutos de audio en 11 idiomas.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 30 idiomas y 22 dialectos chinos.
- Identificacion automatica de idioma (language identification).
- Transcripcion de voz cantada y canciones con musica de fondo (BGM).
- Inferencia unificada en modo offline y streaming con un unico modelo.
- Transcripcion de audio de larga duracion.
- Reconocimiento robusto en entornos acusticos complejos y patrones de texto desafiantes.
- Soporte de acentos de ingles de multiples paises y regiones.
- Toolkit de inferencia con soporte para vLLM, batch inference, serving asincrono y streaming.
- Prediccion de timestamps mediante el modelo complementario Qwen3-ForcedAligner-0.6B (11 idiomas, hasta 5 minutos de audio).

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo puede procesar audio de larga duracion en modo offline y generar transcripciones multilingues, adecuado para equipos distribuidos que trabajan en varios idiomas.
- Subtitulado automatico de contenido audiovisual: gracias al soporte de streaming y al modelo complementario de alineamiento forzado, se pueden generar subtitulos con timestamps precisos en 11 idiomas.
- Atencion al cliente por voz: el modelo puede transcribir llamadas en tiempo real mediante inferencia streaming, permitiendo analisis posterior o asistencia en vivo.
- Transcripcion de contenido musical y podcasts: es capaz de procesar voz cantada y canciones con musica de fondo, lo que lo hace util para plataformas de audio y musica.
- Analisis de dialectos chinos: con soporte para 22 dialectos (Anhui, Sichuan, Wu, Minnan, etc.), es adecuado para aplicaciones de transcripcion en regiones con fuerte variacion dialectal.
- Generacion de actas y documentacion a partir de audio: integrable en pipelines de procesamiento por lotes mediante vLLM para transcribir grandes volumenes de grabaciones.
- Investigacion en ASR multilingue: al ser de codigo abierto con licencia Apache 2.0, sirve como base para fine-tuning y experimentacion en reconocimiento de voz.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card afirma que el modelo alcanza rendimiento state-of-the-art entre los modelos ASR de codigo abierto y es competitivo con APIs comerciales, y que la variante de 0.6B alcanza 2000 veces throughput con concurrencia de 128, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de benchmarks ASR como WER en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 2.349.217.408 parametros y pesos en safetensors (4.7 GB de repositorio), se estima que en precision completa (FP16/BF16) requiere aproximadamente 4.7 GB de VRAM para los pesos, mas overhead de activaciones y audio.
- GPU recomendadas: no especificadas en la informacion disponible. La model card recomienda usar FlashAttention 2 para reducir el uso de memoria y acelerar la inferencia, especialmente con entradas largas y batches grandes.
- Cabe en GPU de consumo: probablemente si, dado el tamano de los pesos (4.7 GB), en GPUs con al menos 8 GB de VRAM, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: paquete `qwen-asr` con backends transformers y vLLM; soporte de vLLM para batch inference, serving asincrono y streaming; imagen Docker oficial mencionada en la model card; instalacion desde el repositorio GitHub `QwenLM/Qwen3-ASR`.
- Latencia y throughput: la model card indica que la variante de 0.6B alcanza 2000 veces throughput con concurrencia de 128, pero no se proporcionan cifras para la version de 1.7B.
- Requisito de entorno: Python 3.12 recomendado; FlashAttention 2 recomendado; si la maquina tiene menos de 96 GB de RAM, se sugiere `MAX_JOBS=4` al instalar flash-attn.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B | 2.349.217.408 | 30 idiomas + 22 dialectos | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3-ASR-0.6B | No disponible (variante 0.6B) | 30 idiomas + 22 dialectos | No disponible | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3-ForcedAligner-0.6B | No disponible (variante 0.6B) | 11 idiomas | Hasta 5 min de audio | Apache 2.0 | Hugging Face, ModelScope |

No se dispone de datos de rendimiento comparativo (WER, velocidad) entre estos modelos en la informacion proporcionada. La model card indica que la version de 1.7B es state-of-the-art entre modelos ASR open source y competitiva con APIs comerciales, pero sin cifras concretas.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo en la informacion disponible.
- Riesgo de alucinacion: no documentado en la informacion proporcionada; como todo modelo generativo, existe riesgo de transcripciones incorrectas, especialmente en audio de baja calidad o con ruido.
- Limitaciones de contexto o idioma: aunque soporta 30 idiomas y 22 dialectos chinos, no se detalla el rendimiento por idioma ni las limitaciones especificas de cada uno.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion con atribucion.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una publicacion reciente o poco validada por la comunidad; se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo.
- El modelo complementario Qwen3-ForcedAligner-0.6B solo cubre 11 idiomas y audio de hasta 5 minutos, lo que limita la prediccion de timestamps en audios mas largos o en idiomas no cubiertos.
- No se dispone de informacion sobre cuantizaciones soportadas, lo que puede limitar el despliegue en entornos con recursos muy restringidos.

## Enlaces

- Hugging Face: https://huggingface.co/kaitemoreau/Qwen3-ASR-1.7B
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-ASR
- Modelo en ModelScope (Qwen3-ASR-1.7B): https://modelscope.cn/models/Qwen/Qwen3-ASR-1.7B
- Modelo en ModelScope (Qwen3-ASR-0.6B): https://modelscope.cn/models/Qwen/Qwen3-ASR-0.6B
- Modelo en ModelScope (Qwen3-ForcedAligner-0.6B): https://modelscope.cn/models/Qwen/Qwen3-ForcedAligner-0.6B
- Paper referenciado (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
- Imagen de introduccion: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/qwen3_asr_introduction.png
- Diagrama de arquitectura: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/overview.jpg
