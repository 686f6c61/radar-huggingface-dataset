# 45TGGTTG/Bielik-11B-v2.3-Instruct

## Resumen

Bielik-11B-v2.3-Instruct es un modelo generativo de texto en polaco con 11.168.796.672 parámetros, desarrollado por el proyecto abierto SpeakLeash en colaboración con el centro de supercomputación ACK Cyfronet AGH. Se trata de un modelo causal decoder-only basado en la arquitectura Mistral, especializado en comprensión y generación de lengua polaca, y entrenado sobre corpus de texto polaco seleccionados y procesados por el equipo de SpeakLeash.

La versión 2.3 no es un entrenamiento nuevo, sino un merge lineal en precisión float16 de tres variantes instruct previas (v2.0, v2.1 y v2.2), realizado con mergekit. El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está pensado para tareas conversacionales, generación de instrucciones y procesamiento lingüístico en polaco.

Es relevante en el ecosistema open source porque cubre un hueco poco atendido: los modelos de gran tamaño con calidad real en lenguas eslavas occidentales distintas del inglés. Las versiones cuantizadas publicadas (GGUF, GPTQ y FP8) facilitan su despliegue en hardware de consumo y en entornos de producción con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (estilo Mistral) |
| Parámetros totales | 11.168.796.672 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0), GPTQ 4-bit, FP8 |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF, GPTQ, FP8 en repositorios separados |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 11B parámetros con arquitectura compatible con Mistral y LLaMA, entrenado mediante el framework propio ALLaMo, desarrollado por Krzysztof Ociepa, que permite entrenar modelos de esta familia de forma eficiente. La versión 2.3 es un merge lineal en float16 de Bielik-11B-v2.0-Instruct, v2.1-Instruct y v2.2-Instruct, todos ellos fine-tunes instruct del modelo base Bielik-11B-v2, realizado por Remigiusz Kinas con mergekit.

El entrenamiento instruct de las versiones previas utilizó más de 20 millones de instrucciones que suman más de 10.000 millones de tokens, combinando instrucciones en polaco anotadas manualmente por el equipo de SpeakLeash con instrucciones sintéticas generadas por Mixtral 8x22B. Para mitigar el ruido de calidad del dataset se aplicaron tres técnicas: pérdida ponderada a nivel de token inspirada en offline RL y C-RLFT, tasa de aprendizaje adaptativa en función del tamaño de batch, y enmascaramiento de tokens de prompt. La alineación con preferencias humanas se realizó mediante DPO-Positive sobre un conjunto de más de 66.000 ejemplos filtrados por un modelo de recompensa, con la novedad de incluir conversaciones multi-turno. El entrenamiento se llevó a cabo con el grant computacional PLG/2024/016951 en los supercomputadores Athena y Helios.

## Capacidades

- Generación de texto conversacional en polaco con alta fluidez y precisión lingüística.
- Comprensión y ejecución de instrucciones variadas: resumen, reescritura, clasificación, extracción de información.
- Razonamiento y respuesta a preguntas en lengua polaca.
- Conversaciones multi-turno, gracias al entrenamiento DPO-Positive con ejemplos multi-turno.
- Generación de texto creativo y redacción formal en polaco.
- Procesamiento de tareas lingüísticas específicas del polaco (morfología, sintaxis, terminología).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al polaco según la model card; el rendimiento en otros idiomas no está documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Atención al cliente en polaco: el modelo puede gestionar conversaciones multi-turno con usuarios polacohablantes, manteniendo coherencia en el hilo y un estilo de respuesta alineado con preferencias humanas gracias al entrenamiento DPO-Positive.
- Generación de contenido editorial en polaco: redacción de artículos, descripciones de producto, comunicados y textos de marketing con corrección morfosintáctica propia de un modelo entrenado sobre corpus polaco.
- Resumen y análisis de documentos: procesamiento de informes, actas o contratos en polaco para extraer puntos clave y generar resúmenes estructurados.
- Asistentes internos para empresas polacas: integración como backend conversacional en herramientas de productividad, con despliegue en infraestructura propia gracias a la licencia Apache 2.0 y a las versiones cuantizadas.
- Traducción asistida y postedición: apoyo a traductores en la revisión de textos polacos, detección de errores estilísticos y generación de borradores.
- Procesamiento de lenguaje natural en pipelines de datos: clasificación de textos, extracción de entidades y normalización de documentos en polaco dentro de flujos automatizados.
- Investigación lingüística y evaluación de modelos eslavos: uso como referencia en estudios comparativos de modelos open source para lenguas de baja representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 22-24 GB (11B parámetros × 2 bytes más overhead de activaciones y KV cache).
- VRAM estimada en cuantización de 8 bits: aproximadamente 12-14 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ o GGUF Q4_K_M): aproximadamente 7-9 GB.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado; en cuantización 4-bit cabe en RTX 3090, RTX 4080, RTX 4070 Ti y GPUs con 8-12 GB.
- Opciones de despliegue: transformers, vLLM, TGI (el repo incluye tag text-generation-inference y endpoints_compatible), llama.cpp y Ollama mediante los GGUF, y AutoGPTQ para la variante GPTQ.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-11B-v2.3-Instruct | 11,17B | No disponible | Polaco | Apache 2.0 | Hugging Face, versiones GGUF/GPTQ/FP8 |
| Bielik-11B-v2.2-Instruct | 11B (aprox.) | No disponible | Polaco | Apache 2.0 | Hugging Face (modelo base del merge) |
| Mistral-7B-Instruct | 7,24B | 32K (según versión) | Multilingüe (inglés dominante) | Apache 2.0 | Hugging Face, amplio ecosistema |
| Llama 3.1 8B Instruct | 8,03B | 128K | Multilingüe | Llama 3.1 Community License | Hugging Face, amplio ecosistema |

La comparativa con Mistral-7B y Llama 3.1 8B es orientativa por tamaño y categoría; no se dispone de resultados de benchmarks que permitan comparar rendimiento real en polaco entre estos modelos.

## Limitaciones y advertencias

- Modelo especializado en polaco: el rendimiento en castellano, inglés u otros idiomas no está documentado y previsiblemente será inferior.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad.
- Al ser un merge de tres fine-tunes, puede heredar sesgos y peculiaridades estilísticas de cada uno de ellos; no se documentan análisis de sesgo.
- El dataset de entrenamiento incluyó instrucciones sintéticas generadas por Mixtral 8x22B, lo que puede introducir artefactos de estilo o errores factuales en dominios especializados.
- La longitud de contexto no está especificada en la información disponible; conviene verificarla antes de diseñar aplicaciones que dependan de ventanas largas.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor incluye un campo de gating ("I agree to be contacted for feedback about Bielik models") en la model card que conviene revisar en el momento de la descarga.
- El repositorio indicado (45TGGTTG/Bielik-11B-v2.3-Instruct) es una copia con 0 descargas y 0 likes; para producción se recomienda usar el repositorio oficial de SpeakLeash, que incluye las versiones cuantizadas mantenidas por el equipo original.

## Enlaces

- Repositorio en Hugging Face (copia): https://huggingface.co/45TGGTTG/Bielik-11B-v2.3-Instruct
- Repositorio oficial del modelo: https://huggingface.co/speakleash/Bielik-11B-v2.3-Instruct
- Versión GGUF: https://huggingface.co/speakleash/Bielik-11B-v2.3-Instruct-GGUF
- Versión GPTQ: https://huggingface.co/speakleash/Bielik-11B-v2.3-Instruct-GPTQ
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v2
- Informe técnico: https://arxiv.org/abs/2505.02410
- SpeakLeash: https://speakleash.org/
- ACK Cyfronet AGH: https://www.cyfronet.pl/
- Chat Arena de SpeakLeash: https://arena.speakleash.org.pl/
- Framework ALLaMo: https://github.com/chrisociepa/allamo
- mergekit: https://github.com/cg123/mergekit
- Paper DPO-Positive: https://arxiv.org/abs/2402.13228
- Paper C-RLFT: https://arxiv.org/abs/2309.11235
- Paper sobre learning rate y batch size: https://arxiv.org/abs/2006.09092
- Paper sobre offline RL: https://arxiv.org/abs/2005.01643
