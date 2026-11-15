# fengjay01/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el equipo Qwen (Alibaba). Forma parte de la familia Qwen3-ASR, que incluye tambien una variante de 0.6B, y deriva del modelo fundacional multimodal Qwen3-Omni, aprovechando su capacidad de comprension de audio. El modelo resuelve dos tareas combinadas en una sola pasada: identificacion de idioma y transcripcion de voz, cubriendo 30 idiomas y 22 dialectos chinos.

El modelo destaca por su enfoque "todo en uno": un unico modelo unifica inferencia offline y streaming, admite audio largo, voz cantada y canciones con musica de fondo, y ofrece un rendimiento que el autor situa en el estado del arte entre los modelos ASR open source, compitiendo con APIs comerciales propietarias. Con 2.349 millones de parametros reales en safetensors, es un modelo compacto pero de gama media-alta dentro de la categoria ASR.

La relevancia actual radica en la combinacion de licencia Apache 2.0, un ecosistema de inferencia completo (paquete `qwen-asr`, backend vLLM, serving asincrono y prediccion de timestamps) y un modelo complementario de alineacion forzada (Qwen3-ForcedAligner-0.6B) que permite obtener marcas temporales precisas en hasta 11 idiomas. Esto lo convierte en una opcion practica para pipelines de produccion que necesitan transcripcion robusta y multilingue sin depender de servicios propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-Omni (modelo multimodal con modulo de comprension de audio); detalles internos exactos no disponibles |
| Parametros totales | 2.349.217.408 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (soporta audio largo y streaming, longitud exacta no publicada) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | 30 idiomas (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro) y 22 dialectos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | automatic-speech-recognition |
| Tamano del repo | 4.7 GB |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3-Omni como modelo fundacional, del que hereda la capacidad de comprension de audio y lo especializa para la tarea de reconocimiento del habla. La model card no detalla la arquitectura interna exacta (numero de capas, dimension del encoder de audio, mecanismo de atencion), por lo que esos datos deben considerarse no disponibles. La familia se entrena con datos de habla a gran escala, segun indica el autor, aunque no se especifica el volumen de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

Entre las innovaciones tecnicas destacables figuran: inferencia unificada offline y streaming con un unico modelo; soporte nativo de audio largo; reconocimiento robusto en entornos acusticos complejos y patrones de texto dificiles; y un modelo complementario de alineacion forzada (Qwen3-ForcedAligner-0.6B) que predice marcas temporales para unidades arbitrarias en hasta 5 minutos de audio en 11 idiomas, superando segun el autor a los modelos de alineacion forzada end-to-end. El ecosistema incluye un framework de inferencia completo con backend vLLM, serving asincrono, streaming y prediccion de timestamps.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en 30 idiomas.
- Identificacion de idioma integrada en la misma pasada de inferencia.
- Reconocimiento de 22 dialectos chinos (Anhui, Dongbei, Fujian, Gansu, Guizhou, Hebei, Henan, Hubei, Hunan, Jiangxi, Ningxia, Shandong, Shaanxi, Shanxi, Sichuan, Tianjin, Yunnan, Zhejiang, cantonés con acento de Hong Kong, cantonés con acento de Guangdong, wu, minnan).
- Manejo de acentos del ingles de multiples paises y regiones.
- Transcripcion de voz cantada y canciones con musica de fondo (BGM).
- Inferencia unificada en modo offline y streaming.
- Transcripcion de audio largo.
- Prediccion de timestamps mediante el modelo complementario Qwen3-ForcedAligner-0.6B (11 idiomas, hasta 5 minutos).
- Robustez en entornos acusticos complejos y patrones de texto desafiantes.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa audio largo y ofrece modo offline, adecuado para generar transcripciones completas de sesiones extensas con identificacion automatica del idioma de cada intervencion.
- Subtitulado y doblaje: combinado con Qwen3-ForcedAligner-0.6B, permite obtener marcas temporales precisas por unidad, lo que facilita la alineacion de subtitulos en 11 idiomas.
- Atencion al cliente multilingue: la identificacion de idioma integrada permite enrutar y transcribir llamadas en 30 idiomas sin pasos previos de deteccion, simplificando pipelines de analitica de voz.
- Transcripcion de contenido musical y podcasts: el soporte de voz cantada y canciones con BGM lo hace util para indexar letras, catalogos musicales y podcasts con musica de fondo.
- Analisis de dialectos chinos: el reconocimiento de 22 dialectos resulta adecuado para aplicaciones de voz en regiones de China con fuerte variacion dialectal (servicios publicos, call centers regionales).
- Streaming en tiempo real: con el backend vLLM y el modo streaming, permite transcripcion en vivo para asistentes de voz, herramientas de accesibilidad o monitorizacion de llamadas.
- Accesibilidad y documentacion clinica: transcripcion de consultas o notas de voz con robustez ante ruido, util para generar registros textuales en entornos con acustica adversa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma de forma cualitativa que Qwen3-ASR-1.7B alcanza "state-of-the-art performance among open-source ASR models" y es "competitive with the strongest proprietary commercial APIs", pero no se incluyen tablas con valores concretos (WER, MMLU, etc.). La variante 0.6B se describe con un throughput de 2000x a concurrencia 128, dato que corresponde al modelo pequeno y no al 1.7B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras exactas. Con 2.349 millones de parametros en precision completa (fp16/bf16) el peso ronda los 4.7 GB (tamano del repo), por lo que la VRAM necesaria supera esa cifra por el overhead de activaciones y cache de audio.
- GPU recomendadas: no se especifican modelos concretos en la documentacion. Se recomienda FlashAttention 2 para reducir consumo de memoria y acelerar inferencia, especialmente con entradas largas y batch grandes.
- Cabe en GPU consumer: previsiblemente si en GPUs con 8-16 GB de VRAM en fp16, aunque no se confirma con cifras oficiales.
- Opciones de despliegue: paquete `qwen-asr` con backend transformers o backend vLLM (`pip install -U qwen-asr[vllm]`), imagen Docker oficial, serving asincrono y streaming via vLLM. Descarga de pesos via Hugging Face o ModelScope.
- Latencia y throughput: no disponibles para el 1.7B. Solo se documenta el throughput de 2000x a concurrencia 128 para el 0.6B.
- Nota de instalacion: si la maquina tiene menos de 96 GB de RAM y muchos nucleos de CPU, se sugiere `MAX_JOBS=4` al compilar FlashAttention.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B | 2.349 M | 30 idiomas + 22 dialectos | audio largo y streaming | Apache 2.0 | Hugging Face / ModelScope |
| Qwen3-ASR-0.6B | no disponible (aprox. 0.6B por nombre) | 30 idiomas + 22 dialectos | audio largo y streaming | Apache 2.0 | Hugging Face / ModelScope |
| Qwen3-ForcedAligner-0.6B | no disponible (aprox. 0.6B por nombre) | 11 idiomas | hasta 5 min de audio | Apache 2.0 | Hugging Face / ModelScope |

No se dispone de datos numericos de benchmarks para comparar rendimiento frente a alternativas de terceros (por ejemplo Whisper large-v3 u otros modelos ASR open source), por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la informacion proporcionada.
- Riesgo de alucinacion: inherente a modelos generativos; en ASR puede manifestarse como inserciones o correcciones espurias en audio ruidoso, aunque no se cuantifica.
- La model card no detalla el rendimiento por idioma ni el WER desglosado, lo que impide evaluar la calidad relativa entre los 30 idiomas soportados.
- El reconocimiento de dialectos chinos y acentos del ingles se anuncia de forma cualitativa, sin metricas publicadas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los modelos base (Qwen3-Omni) y de las dependencias del ecosistema.
- El modelo complementario de alineacion forzada cubre solo 11 idiomas y hasta 5 minutos de audio por inferencia.
- No se confirman capacidades de tool calling, agentes o multimodalidad generativa; el uso debe limitarse a ASR y identificacion de idioma.
- El repositorio del autor (fengjay01) muestra 0 descargas y 0 likes en el momento de la consulta; los pesos oficiales se distribuyen bajo el namespace Qwen (Qwen/Qwen3-ASR-1.7B).

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/fengjay01/Qwen3-ASR-1.7B
- Hugging Face (modelo oficial): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo 0.6B oficial: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Modelo de alineacion forzada: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-ASR
- Referencia arXiv citada en tags: arxiv:2601.21337
- Imagen de introduccion: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/qwen3_asr_introduction.png
- Esquema de arquitectura: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/overview.jpg
