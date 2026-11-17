# KirillFPV/nemotron-transcribe-parts

## Resumen

Nemotron 3.5 Transcribe es un modelo de voz y audio de pesos abiertos desarrollado por NVIDIA, orientado a transcripcion automatica del habla (ASR) en 40 idiomas, con soporte para grabaciones de hasta una hora y una ventana de contexto de 65.536 tokens. Emplea una arquitectura hibrida de mezcla de expertos (MoE) que activa aproximadamente 4.300 millones de parametros por token, incluyendo el codificador de audio, sobre un total de 33.697.781.029 parametros.

El modelo se distribuye originalmente como `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B` y esta ficha describe el repositorio `KirillFPV/nemotron-transcribe-parts`, un reempaquetado comunitario del checkpoint BF16 original en 17 fragmentos safetensors de menos de 5 GB cada uno. El reparto no altera nombres de tensores, formas, dtypes ni bytes de pesos: no se aplico cuantizacion, y se preservan configuracion, tokenizer, procesador, metadatos de timestamps y licencias de terceros.

Su relevancia actual radica en que combina tareas que tradicionalmente requieren pipelines separados (transcripcion, identificacion de idioma, diarizacion de hablantes, marcas temporales, traduccion de voz y respuesta a preguntas sobre audio) en un unico modelo de instrucciones, con licencia OpenMDW-1.1 y despliegue offline. El reempaquetado facilita la descarga en entornos con limites de tamano de fichero por HTTPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de mezcla de expertos (MoE) con codificador de audio; libreria NeMo, tipo `nemo_speechlm` |
| Parametros totales | 33.697.781.029 |
| Parametros activos | Aproximadamente 4.300 millones, incluyendo el codificador de audio |
| Longitud de contexto | 65.536 tokens; audio de hasta una hora |
| Tipos de cuantizacion | No disponible (el repositorio distribuye BF16 sin cuantizar) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | Safetensors BF16 en 17 fragmentos de menos de 5 GB, con `model.safetensors.index.json` que mapea 1395 tensores |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje de voz (`nemo_speechlm`) con backbone LLM y mezcla de expertos: el checkpoint incluye un directorio `llm_backbone/config.json` separado y un codificador de audio integrado en el computo de parametros activos. El modelo procesa audio y texto de forma multimodal, lo que le permite recibir instrucciones en lenguaje natural junto con la senal de audio y producir salidas condicionadas por esa instruccion (estilo de transcripcion, idioma de destino, marcas temporales, etc.).

El dataset de entrenamiento declarado es `nvidia/Granary-v2`. La model card enlaza un informe tecnico de NVIDIA (`NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf`) que no se ha podido consultar en la informacion proporcionada, por lo que no se dispone de datos verificados sobre numero de tokens de entrenamiento, composicion del corpus ni uso de RLHF o DPO. Tampoco se detallan innovaciones de decodificacion especulativa o atencion lineal mas alla de la propia arquitectura MoE. El reempaquetado comunitario no ejecuto inferencia en GPU durante el proceso, y las afirmaciones de rendimiento de la model card remiten a la release original de NVIDIA.

## Capacidades

- Transcripcion automatica del habla (ASR) en 40 idiomas, con soporte de audio de formato largo de hasta una hora.
- Identificacion automatica de idioma (language identification) y manejo de code-switching entre idiomas.
- Diarizacion de hablantes (speaker diarization) dentro de la transcripcion.
- Generacion de marcas temporales (timestamps) alineadas con el audio.
- Traduccion de voz (speech translation) condicionada por instruccion.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones en lenguaje natural para controlar el estilo y el formato de la salida.
- Capacidades multilingues amplias: 40 idiomas de Europa, Asia, Oriente Medio y Africa.
- Integracion con `transformers` mediante `AutoModelForMultimodalLM` y `AutoProcessor`, y con el ecosistema NeMo Speech para ajuste fino y servicio.
- Soporte de servicio de alto rendimiento mediante SGLang-Omni.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa grabaciones de hasta una hora en una sola pasada con contexto de 65.536 tokens, genera marcas temporales y separa hablantes, lo que permite producir actas estructuradas sin segmentar el audio manualmente.
- Subtitulado y localizacion de video: combinando ASR con marcas temporales y traduccion de voz, se puede generar una pista de subtitulos en el idioma original y otra traducida a partir de la misma inferencia condicionada por instruccion.
- Atencion al cliente y analitica de llamadas: la diarizacion y la identificacion de idioma permiten transcribir conversaciones multilingues y separar agente de cliente para su posterior analisis de calidad o compliance.
- Documentacion clinica y legal dictada: el soporte de audio largo y de marcas temporales facilita transcribir sesiones completas con trazabilidad temporal, util para revision posterior por profesionales.
- Investigacion en linguistica y corpus: el soporte de 40 idiomas y de code-switching permite construir corpus transcritos y etiquetados por idioma y hablante a partir de grabaciones de campo.
- Asistentes de voz offline: al ser un modelo de pesos abiertos y despliegue local, encaja en entornos con requisitos de privacidad donde el audio no puede salir de la infraestructura propia.
- Indexacion y busqueda de archivos de audio: la transcripcion con timestamps y la respuesta a preguntas sobre audio permiten construir indices buscables sobre archivos de reuniones, podcasts o archivos historicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe tecnico de NVIDIA y a la release original para las cifras de rendimiento, pero no incluye tablas numericas en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el checkpoint completo ocupa 67,5 GB en disco, por lo que la inferencia en BF16 requiere aproximadamente 68 GB o mas de memoria, sin contar overhead de activaciones y cache KV.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU con `device_map="auto"`.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) ni de 48 GB en BF16 sin cuantizacion; el repositorio no ofrece variantes cuantizadas.
- Opciones de despliegue: `transformers` con `AutoModelForMultimodalLM` y `AutoProcessor`, NeMo Speech para ajuste fino y servicio, y SGLang-Omni para servicio de alto rendimiento.
- Descarga: `HF_HUB_DISABLE_XET=1 hf download KirillFPV/nemotron-transcribe-parts --local-dir ./nemotron-transcribe`, con verificacion mediante `shasum -a 256 -c SHA256SUMS`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (esta ficha) | 33,7 B totales / ~4,3 B activos | 65.536 tokens; audio de 1 hora | 40 | OpenMDW-1.1 | Pesos abiertos en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificados de otros modelos de ASR comparables en parametros, contexto o rendimiento, por lo que no se incluye una comparativa numerica.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado comunitario, no la release oficial de NVIDIA; para produccion conviene evaluar si usar el checkpoint original o este, y validar la integridad con los checksums SHA256 incluidos.
- No se ejecuto inferencia en GPU durante el reempaquetado, por lo que el correcto funcionamiento del checkpoint fragmentado debe validarse en el entorno de destino.
- El modelo se distribuye unicamente en BF16; no hay variantes cuantizadas oficiales en este repositorio, lo que limita su despliegue en GPU de consumo.
- Riesgo de alucinacion y de errores de transcripcion en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario tecnico especializado; no se han publicado tasas de error (WER) en la informacion disponible.
- La diarizacion y la identificacion de idioma pueden degradarse en grabaciones con muchos hablantes o code-switching intenso.
- Sesgos conocidos: no disponible en la informacion proporcionada; cabe esperar sesgos derivados de la distribucion del dataset Granary-v2, no documentados aqui.
- Licencia OpenMDW-1.1: es una licencia con condiciones especificas distintas de Apache 2.0 o MIT; debe revisarse el texto completo antes de un uso comercial.
- El modelo base es de NVIDIA y la model card remite a licencias de terceros preservadas en el repositorio; conviene revisarlas junto con la licencia principal.
- El rendimiento declarado en la model card corresponde a la release original de NVIDIA y no ha sido verificado de forma independiente en este reempaquetado.

## Enlaces

- Repositorio reempaquetado: https://huggingface.co/KirillFPV/nemotron-transcribe-parts
- Modelo original: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- NeMo Speech (repositorio): https://github.com/NVIDIA-NeMo/Speech
- Informe tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Guia de servicio SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
