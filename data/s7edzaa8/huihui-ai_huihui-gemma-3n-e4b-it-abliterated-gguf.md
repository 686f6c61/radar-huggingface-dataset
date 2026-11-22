# s7edzaa8/huihui-ai_Huihui-gemma-3n-E4B-it-abliterated-GGUF

## Resumen

Huihui-gemma-3n-E4B-it-abliterated es una variante "abliterated" (sin censura) del modelo Gemma 3n E4B-it de Google, publicada por el usuario huihui-ai y cuantizada en formato GGUF por bartowski. El repositorio aquí descrito (s7edzaa8/huihui-ai_Huihui-gemma-3n-E4B-it-abliterated-GGUF) redistribuye esas cuantizaciones GGUF generadas con llama.cpp b5856 e imatrix. El modelo base pertenece a la familia Gemma 3n, diseñada por Google DeepMind para inferencia eficiente en dispositivos, con arquitectura multimodal que cubre texto, audio e imagen/vídeo.

El modelo conserva las capacidades multimodales del Gemma 3n original (reconocimiento y traducción automática de voz, audio-texto, vídeo-texto) y añade el proceso de "abliteration", una técnica de modificación de pesos que elimina la dirección de rechazo en el espacio de activaciones para reducir las negativas del modelo ante peticiones sensibles. El resultado es un modelo conversacional sin los filtros de seguridad habituales, orientado a investigación y a entornos donde se requiere control total sobre las respuestas.

Con 6.866.172.400 parámetros reales en safetensors y un repositorio de 108,8 GB que agrupa todas las cuantizaciones, el modelo es viable en hardware de consumo en sus variantes Q4 y Q5 (entre 4,1 y 5,5 GB). La licencia es Gemma, con acceso condicionado en Hugging Face. Es relevante ahora porque combina multimodalidad ligera con despliegue local en GGUF, un nicho con pocas alternativas sin censura y con soporte de audio y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3n), variante abliterated; detalles de capas y atención no disponibles |
| Parametros totales | 6.866.172.400 (safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_XL, Q2_K_L, IQ4_NL (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (acceso condicionado en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones llama.cpp b5856); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es Gemma 3n E4B-it, de la familia Gemma 3n de Google DeepMind, orientada a ejecución eficiente en dispositivo con capacidades multimodales nativas: texto, audio (reconocimiento y traducción automática del habla) y vídeo/imagen. La información disponible no detalla el número de capas, el mecanismo de atención ni la composición exacta del dataset de entrenamiento. Tampoco se especifican los volúmenes de tokens, las fases de RLHF/DPO ni innovaciones concretas de decodificación.

Sobre esta base, huihui-ai aplicó abliteration, una técnica que identifica y resta la dirección de rechazo en las activaciones internas para que el modelo deje de negarse a responder ante determinadas peticiones. Posteriormente, bartowski generó las cuantizaciones GGUF con llama.cpp b5856 usando el método imatrix con un dataset de calibración publicado en un gist. No se documenta el proceso exacto de abliteration ni sus hiperparámetros.

## Capacidades

- Generación de texto conversacional multi-turno.
- Reconocimiento automático del habla (ASR) y traducción automática del habla (AST).
- Procesamiento audio-texto y vídeo-texto (capacidades multimodales heredadas de Gemma 3n).
- Comportamiento "uncensored": responde a peticiones que el modelo original rechazaría, por la abliteration.
- Compatible con endpoints (tag endpoints_compatible) y con el pipeline text-generation.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (los idiomas no están listados).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazo y a la calidad de las respuestas, comparándolo con el Gemma 3n original en experimentos controlados.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (4,24 GB) o Q5_K_M (4,95 GB) se ejecuta en llama.cpp, LM Studio o cualquier frontend compatible, sin depender de APIs externas.
- Transcripción y traducción de audio en local: al conservar las capacidades ASR/AST de Gemma 3n, puede procesar audio a texto y traducirlo en entornos con requisitos de privacidad.
- Análisis de vídeo con descripción textual: el soporte video-text-to-text permite generar descripciones o resúmenes de contenido audiovisual en pipelines locales.
- Generación de contenido creativo sin restricciones: útil en prototipos de escritura, guiones o ficción donde los filtros del modelo original resultan limitantes, siempre con revisión humana.
- Pruebas de robustez y red teaming: sirve como modelo "sin salvaguardas" de referencia para evaluar clasificadores de seguridad y sistemas de moderación.
- Experimentación con cuantizaciones en hardware modesto: la batería de cuantizaciones (desde Q2_K_L de 4,61 GB hasta bf16 de 13,74 GB) permite medir el impacto de la compresión en calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K_L ~4,6 GB; Q4_K_M ~4,2 GB; Q5_K_M ~5,0 GB; Q6_K ~5,7 GB; Q8_0 ~7,4 GB; bf16 ~13,7 GB (más overhead de contexto).
- GPU recomendadas: no hay datos oficiales; por tamaño, una RTX 3060 de 12 GB o superior puede alojar Q8_0 y bf16 con margen; una RTX 4090 (24 GB) ejecuta cualquier cuantización con contexto amplio. A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB o incluso GPUs de 8 GB con Q4_K_M/Q4_K_S.
- Opciones de despliegue: llama.cpp (versión b5856 o superior), LM Studio, y cualquier proyecto basado en llama.cpp. vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-gemma-3n-E4B-it-abliterated (este) | 6,87 B | no disponible | Audio, vídeo, texto | Gemma | GGUF, safetensors |
| Gemma 3n E4B-it (original) | ~6,9 B (familia E4B) | no disponible | Audio, vídeo, texto | Gemma | safetensors |
| Modelos abliterated de 7-8 B (p. ej. Llama/Mistral abliterated) | 7-8 B | variable | Solo texto | según base | GGUF, safetensors |

La comparativa cuantitativa de rendimiento no está disponible; las alternativas abliterated de 7-8 B suelen ser solo texto, por lo que este modelo destaca por conservar audio y vídeo, aunque con menor ecosistema y sin benchmarks publicados.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo: el modelo puede generar contenido sensible, ofensivo o inseguro sin filtros, lo que exige moderación externa en producción.
- Riesgo elevado de alucinación y de respuestas incorrectas, agravado por la falta de benchmarks publicados.
- No se documentan sesgos conocidos ni la composición del dataset; se heredan los sesgos del Gemma 3n original y los posibles artefactos de la abliteration.
- Idiomas soportados no especificados; el rendimiento fuera del inglés es incierto.
- Licencia Gemma con acceso condicionado: revisar los términos de uso comercial de Google antes de desplegar; la redistribución y el uso comercial están sujetos a esa licencia.
- La plantilla de chat no está definida en el repo GGUF (se usa la por defecto), lo que puede producir prompts mal formateados; verificar con la model card original.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; la calidad de las cuantizaciones no está contrastada.
- El tag de fecha de creación (2026-11-22) es inconsistente con el estado actual; tratar los metadatos con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/s7edzaa8/huihui-ai_Huihui-gemma-3n-E4B-it-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-gemma-3n-E4B-it-abliterated
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/huihui-ai_Huihui-gemma-3n-E4B-it-abliterated-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Release de llama.cpp b5856: https://github.com/ggerganov/llama.cpp/releases/tag/b5856
- Dataset de calibración imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
