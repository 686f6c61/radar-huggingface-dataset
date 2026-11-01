# mradermacher/Transliteration-2.0-4B-Safetensors-GGUF

## Resumen

Transliteration-2.0-4B-Safetensors-GGUF es una colección de cuantizaciones estáticas en formato GGUF, preparada por el usuario mradermacher a partir del modelo base UnimeType/Transliteration-2.0-4B-Safetensors. El modelo original es un modelo de unos 4.206 millones de parámetros (4,2B), basado en la arquitectura Qwen 3.5 según las etiquetas del repositorio, y está especializado en tareas de transliteración: conversión entre escrituras y romanizaciones como pinyin (chino), romaji (japonés), hinglish (hindi romanizado) y arabizi (árabe romanizado), con aplicaciones evidentes en sistemas de entrada tipo IME.

Este repositorio no es un modelo nuevo, sino la versión cuantizada para su ejecución local con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.). Incluye cuantos desde Q2_K (2,0 GB) hasta f16 (8,5 GB), lo que permite ajustar el equilibrio entre calidad y consumo de memoria. Existe además una variante con cuantos ponderados/imatrix en el repositorio hermano `-i1-GGUF` del mismo autor.

Su relevancia actual radica en la escasez de modelos abiertos especializados exclusivamente en transliteración de alta calidad, una tarea que los modelos generales suelen resolver de forma inconsistente. Con licencia Apache 2.0 y un tamaño contenido de 4B, es un candidato práctico para integrarse en editores de texto, teclados móviles o pipelines de normalización de texto multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen 3.5, segun etiquetas del repositorio; detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2B, dato real de safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (GGUF) |
| Idiomas soportados | ingles (en), chino (zh), japones (ja), hindi (hi), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base, UnimeType/Transliteration-2.0-4B, se construye sobre la familia Qwen 3.5, una arquitectura transformer decoder-only. La etiqueta "v2.1" sugiere que es la segunda generacion de esta linea de modelos especializados en transliteracion, aunque el repositorio no documenta la version concreta de Qwen utilizada ni las modificaciones arquitectonicas realizadas.

No se dispone de informacion publicada sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas de alineacion. Las etiquetas del repositorio (pinyin, romaji, hinglish, arabizi, ime) indican que el modelo se especializo en tareas de romanizacion y conversion entre sistemas de escritura para los cinco idiomas declarados, probablemente mediante fine-tuning del modelo base Qwen sobre pares de transliteracion, pero esto no esta confirmado en la documentacion disponible.

## Capacidades

- Transliteracion entre escrituras: conversion a pinyin (chino), romaji (japones), hinglish (hindi en alfabeto latino) y arabizi (arabe en alfabeto latino), segun las etiquetas del repositorio.
- Tareas inversas de romanizacion a escritura nativa (por ejemplo, de pinyin a caracteres chinos), orientacion tipica de los modelos etiquetados como IME, aunque el alcance exacto no esta documentado.
- Generacion de texto conversacional en ingles, chino, japones, hindi y arabe (el repositorio esta etiquetado como "conversational"), con calidad no especificada.
- Al ser un modelo base/fine-tuned especializado, no hay evidencia de soporte para tool calling, function calling, agentes ni capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Sistemas de entrada (IME) en editores y teclados: el modelo puede convertir entrada romanizada en escritura nativa (pinyin a hanzi, romaji a kanji/kana), funcionando localmente en dispositivos gracias a su tamaño de 4B y a las cuantizaciones de 2-3 GB.
- Normalizacion de datos de usuario: en bases de datos con nombres propios en chino, japones, hindi o arabe, el modelo puede generar romanizaciones consistentes (pinyin, romaji, hinglish, arabizi) para indices de busqueda y registros CRM.
- Busqueda multilingüe: romanizacion previa de consultas en alfabeto latino para permitir que usuarios sin teclado nativo busquen contenido en chino, japones, hindi o arabe.
- Preprocesamiento para pipelines de TTS: generacion de romanizaciones estandarizadas como paso intermedio para sintesis de voz en lenguas con escritura no latina.
- Anotacion de corpora linguisticos: generacion de transliteraciones en masa para datasets de NLP que requieran alineaciones entre escritura nativa y alfabeto latino.
- Asistencia a aprendices de idiomas: generacion de lecturas romanizadas de texto en chino, japones, hindi o arabe como apoyo al estudio, ejecutandose sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con las cuantizaciones disponibles, el consumo va desde ~2,0 GB (Q2_K) hasta ~8,5 GB (f16). Las cuantos recomendadas por el autor, Q4_K_S (2,7 GB) y Q4_K_M (2,8 GB), necesitan aproximadamente 3-4 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o mas es suficiente para las cuantos de 4 bits (por ejemplo, RTX 3060, RTX 4060 o superiores). Para Q8_0 o f16 se recomiendan 6-8 GB de VRAM. No se requiere hardware de centro de datos (A100/H100) salvo para servir muchas peticiones concurrentes.
- Consumer GPU: cabe comodamente en GPUs de consumo. Incluso puede ejecutarse solo con CPU y RAM del sistema (llama.cpp con offload parcial o completo a CPU) dado su tamaño reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM, aunque no hay confirmacion de compatibilidad verificada con vLLM.
- Latencia y throughput: no disponible; al ser un modelo de 4B cuantizado en 4 bits, se espera inferencia rapida en hardware de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| Transliteration-2.0-4B (este modelo) | 4,2B | GGUF (12 cuantos) | Transliteracion (pinyin, romaji, hinglish, arabizi, IME) | Apache 2.0 |
| Qwen 3.5 (modelo base, tamano 4B) | ~4B | safetensors, GGUF comunitario | Modelo general multilingüe (incluye zh, ja) | segun version de Qwen |
| Modelos generales de 3-4B (p. ej. Qwen, Phi, Gemma en tamanos equivalentes) | 3-4B | safetensors, GGUF | Uso general; transliteracion sin especializar | variadas (Apache 2.0, MIT, restricciones) |

Nota: no existen muchos modelos abiertos especializados en transliteracion con documentacion publica, por lo que la comparativa se limita a la familia base y a modelos generales de tamano equivalente. La ventaja diferencial declarada de este modelo es la especializacion en romanizaciones; su rendimiento frente a modelos generales no cuantifica con benchmarks publicados.

## Limitaciones y advertencias

- Documentacion escasa: la model card del modelo base no detalla arquitectura exacta, longitud de contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad antes de probarlo.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar transliteraciones incorrectas o inventar lecturas, especialmente en nombres propios poco frecuentes o terminos tecnicos; conviene validar la salida en usos criticos.
- Ambigüedad inherente a la transliteracion: una misma romanizacion puede corresponder a multiples caracteres o palabras (especialmente en chino y japones), y el modelo puede no siempre elegir la opcion correcta sin contexto suficiente.
- Ambito de idiomas limitado: centrado en ingles, chino, japones, hindi y arabe; su comportamiento en otros idiomas no esta documentado y probablemente sea poco fiable.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen 3.5 subyacente y de los datos de entrenamiento, que no estan documentados en este repositorio.
- Calidad segun cuantizacion: las cuantos bajos (Q2_K, Q3_K_S/M) pueden degradar notablemente la precision en tareas de transliteracion, donde la exactitud por token es critica; se recomiendan Q4_K_M o superiores.
- Este repositorio es una cuantizacion de terceros (mradermacher); para soporte o problemas del modelo en si, la referencia es el repositorio de UnimeType.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-GGUF
- Modelo base: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Cuantos ponderados/imatrix (variante i1): https://huggingface.co/mradermacher/Transliteration-2.0-4B-Safetensors-i1-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Transliteration-2.0-4B-Safetensors-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantos (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
