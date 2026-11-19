# mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF

## Resumen

Transliteration-2.0-0.8B es un modelo especializado en transliteración: la conversión entre sistemas de escritura (por ejemplo, pinyin a caracteres chinos, romaji a kana/kanji, arabizi a árabe, o hinglish a devanagari) orientado a motores de entrada (IME, input method editors) y aplicaciones de teclado. El modelo original lo desarrolla UnimeType, y esta ficha documenta la versión cuantizada en GGUF publicada por mradermacher bajo la licencia Apache 2.0.

El modelo base, UnimeType/Transliteration-2.0-0.8B-Safetensors, cuenta con 752.393.024 parámetros (aproximadamente 0,8B) y está etiquetado con la familia qwen3.5 según los tags del repositorio. Su propósito es resolver el problema de la entrada de texto en idiomas con escrituras no latinas o con múltiples sistemas de romanización, ofreciendo conversión bidireccional entre representaciones latinas y nativas.

Esta versión i1-GGUF emplea cuantizaciones con matriz de importancia (imatrix), lo que permite ejecutar el modelo en hardware modesto, incluso en CPU, manteniendo una calidad razonable para una tarea de alta precisión como la transliteración. Es relevante para desarrolladores que construyen teclados, IME o herramientas de normalización lingüística multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3.5, según tags del repositorio; detalles no disponibles) |
| Parametros totales | 752.393.024 (≈0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K (además de fichero imatrix) |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en Safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a la familia qwen3.5 y a la versión v2.6 del pipeline de UnimeType. Se trata de un transformer de aproximadamente 0,8B parámetros, dimensionado para tareas de transliteración de alta frecuencia y baja latencia, más que para razonamiento general.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del cuantizador es fundamentalmente operativa (lista de cuantizaciones y enlaces de descarga) y no incluye detalles del proceso de entrenamiento del modelo original.

La innovación técnica destacable de esta publicación es el uso de cuantización con matriz de importancia (imatrix), que pondera los tensores según su relevancia para la tarea, permitiendo cuantizaciones agresivas (hasta IQ1) con pérdida de calidad controlada. Los quants se ofrecen en múltiples niveles para equilibrar tamaño, velocidad y fidelidad.

## Capacidades

- Transliteración entre sistemas de escritura: pinyin a chino, romaji a japonés, hinglish a devanagari, arabizi a árabe, cyrillic y greeklish, vietnamita y otros pares indicados en los tags.
- Orientación a motores de entrada (IME) y teclados: conversión en tiempo real de secuencias latinas a escritura nativa.
- Soporte multilingüe amplio según la model card: en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it.
- Formato conversacional (tag "conversational"): puede emplearse en plantillas de chat o instrucción.
- Compatible con endpoints (tag "endpoints_compatible") para despliegue como servicio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Teclados e IME multilingües: integrar el modelo como motor de conversión de entrada latina a escritura nativa (pinyin, romaji, arabizi) en aplicaciones móviles o de escritorio, aprovechando su tamaño reducido para inferencia local.
- Normalización de texto en pipelines de datos: convertir nombres, direcciones o entidades escritas en romanización a su forma nativa antes de indexar o buscar en bases de datos multilingües.
- Procesamiento de mensajes en redes sociales: transformar arabizi o hinglish a escritura estándar para análisis de sentimiento, moderación o traducción posterior.
- Sistemas de búsqueda y recuperación: generar variantes de transliteración para mejorar el recall en búsquedas que mezclan scripts latinos y nativos.
- Herramientas de accesibilidad y educación lingüística: asistir a usuarios que escriben en transliteración y necesitan la forma nativa correcta.
- Despliegue en dispositivos de borde: al caber en cuantizaciones de 0,4-0,7 GB, puede ejecutarse en CPU o GPUs de gama baja dentro de aplicaciones sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre ~0,4 GB (IQ1_S) y ~0,7 GB (Q5_K_S) para los pesos cuantizados; el fichero Q6_K y superiores pueden acercarse a ~0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base puede servirse con transformers o vLLM/TGI en formato Safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (0,8B) se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Transliteration-2.0-0.8B (esta ficha) | 0,75B | no disponible | Apache 2.0 | GGUF / Safetensors | Especializado en transliteración e IME |
| Modelo base UnimeType/Transliteration-2.0-0.8B-Safetensors | 0,75B | no disponible | Apache 2.0 | Safetensors | Mismo modelo sin cuantizar |
| Alternativas genéricas de 0,5-1B (p. ej., Qwen pequeños) | ~0,5-1B | variable | variable | Safetensors/GGUF | No especializados en transliteración; requieren prompting |

No se dispone de información sobre modelos directamente comparables en la misma tarea de transliteración con datos de rendimiento publicados.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; al ser un modelo multilingüe puede reflejar desequilibrios entre idiomas del dataset de entrenamiento.
- Alucinación: en transliteración, el riesgo se manifiesta como conversiones incorrectas o inconsistentes, especialmente en cuantizaciones muy agresivas (IQ1, IQ2) y en pares de escritura poco representados.
- Contexto e idioma: la longitud de contexto no está especificada; el uso previsto es de secuencias cortas (palabras o frases), no de documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de UnimeType.
- Producción: las cuantizaciones de baja calidad (Q2_K_S, IQ1) pueden degradar la precisión de la transliteración; se recomienda Q4_K_M o superior para uso en producción.
- No se documentan garantías de exactitud para nombres propios, dialectos o variantes regionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF
- Modelo base: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Transliteration-2.0-0.8B-Safetensors-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
