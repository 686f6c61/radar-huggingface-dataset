# mradermacher/Transliteration-2.0-4B-Safetensors-GGUF

## Resumen

Transliteration-2.0-4B es un modelo de lenguaje especializado en transliteración: la conversión entre sistemas de escritura (por ejemplo, de pinyin a caracteres chinos, de romaji a kanji/kana, de hinglish a devanagari o de arabizi a escritura árabe). El modelo base fue desarrollado por UnimeType y esta versión concreta es una cuantización GGUF realizada por mradermacher, pensada para su uso en herramientas de entrada (IME, *input method editors*) y en pipelines de normalización de texto multilingüe.

El modelo tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card lo etiqueta como derivado de la familia Qwen (tag `qwen3.5`, versión `v2.6`), aunque no se detalla la arquitectura exacta en la información disponible. Su relevancia actual radica en que cubre un nicho poco atendido por los LLM generalistas: la transliteración bidireccional precisa entre alfabetos latinos y no latinos, una tarea crítica para teclados, IME y sistemas de búsqueda multilingües.

El repositorio incluye 12 cuantizaciones GGUF estáticas (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), lo que facilita su despliegue en hardware de consumo. La información sobre benchmarks, contexto y detalles de entrenamiento no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, tag `qwen3.5`; detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen (tag `qwen3.5`) y su naturaleza transformer. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

Lo que sí se conoce es el propósito del ajuste: el modelo está especializado en transliteración, con tags que cubren pinyin (chino), romaji (japonés), hinglish (hindi), arabizi (árabe), cirílico (ruso), greeklish (griego) y vietnamita. Esta especialización sugiere un entrenamiento orientado a la conversión entre sistemas de escritura, aunque los detalles concretos del corpus y del proceso de ajuste no están disponibles.

## Capacidades

- Transliteración entre sistemas de escritura: pinyin a caracteres chinos, romaji a kana/kanji, hinglish a devanagari, arabizi a escritura árabe, latín a cirílico y a griego.
- Soporte para vietnamita con diacríticos y para la conversión entre alfabetos latinos y no latinos.
- Modelo conversacional (tag `conversational`), apto para interacción por turnos.
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües en 13 idiomas según la model card (en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Teclados e IME multilingües: el modelo convierte la entrada en alfabeto latino (pinyin, romaji, hinglish, arabizi) a la escritura nativa correspondiente, integrándose en editores de texto y teclados móviles.
- Normalización de texto para búsqueda: en motores de búsqueda multilingües, permite indexar y consultar términos escritos en distintos sistemas de escritura unificándolos a una forma canónica.
- Procesamiento de corpus lingüísticos: investigadores pueden transliterar datasets entre alfabetos para análisis comparativos o para alinear corpus paralelos.
- Sistemas de atención al cliente en mercados multilingües: normaliza consultas de usuarios que escriben en transliteración informal (por ejemplo, hinglish o arabizi) antes de pasarlas a un LLM generalista.
- Digitalización de documentos históricos o regionales: conversión de textos en cirílico, griego o árabe transliterado a su escritura original para archivo y preservación.
- Preprocesamiento en pipelines de NLP: como paso previo a modelos de traducción o clasificación que esperan texto en la escritura nativa, reduciendo errores por variantes de transliteración.
- Herramientas de accesibilidad: asistencia a usuarios que escriben en alfabeto latino pero necesitan generar texto en otra escritura sin dominar el teclado correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (Q2_K), 2,8 GB (Q4_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16), según los tamaños de archivo publicados.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 3060) usando cuantizaciones Q4_K_M o Q5_K_M.
- GPU recomendadas para mayor throughput: RTX 4090, A100 o H100 si se busca baja latencia en servicio concurrente, aunque el tamaño del modelo no las exige.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui). El modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Cuantizaciones ponderadas/imatrix adicionales disponibles en el repositorio `mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Transliteration-2.0-4B (este) | ~4,2 B | no disponible | Transliteración / IME | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-3B / 7B (referencia generalista) | 3 B / 7 B | 32K (según versión) | Propósito general | Apache 2.0 (mayoría) | safetensors, GGUF |
| Llama 3.2 3B | 3,2 B | 128K | Propósito general | Llama Community License | safetensors, GGUF |
| Gemma 2 2B | 2,6 B | 8K | Propósito general | Gemma Terms | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo para este modelo, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los modelos generalistas citados no están especializados en transliteración y probablemente rindan peor en esa tarea concreta, aunque no hay benchmarks que lo confirmen en la información disponible.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, alucinación ni robustez para este modelo.
- Al ser un modelo especializado en transliteración, su rendimiento en tareas generales de razonamiento o generación libre probablemente sea limitado, aunque no hay datos que lo cuantifiquen.
- La longitud de contexto no está documentada, lo que impide planificar su uso en documentos largos sin pruebas previas.
- La model card lista 13 idiomas, pero la ficha de Hugging Face solo marca 5 (en, zh, ja, hi, ar); conviene verificar el soporte real de los demás antes de usarlos en producción.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo base de terceros, conviene revisar también la licencia del modelo original `UnimeType/Transliteration-2.0-4B-Safetensors`.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de transliteración; se recomienda Q4_K_M o superior para producción.
- No se documentan limitaciones específicas por idioma ni tasas de error por par de escrituras.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-GGUF
- Modelo base en safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Transliteration-2.0-4B-Safetensors-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
