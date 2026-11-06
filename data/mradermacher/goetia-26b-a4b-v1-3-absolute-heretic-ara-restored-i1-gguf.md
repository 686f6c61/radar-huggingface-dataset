# mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-i1-GGUF

## Resumen

Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored es un modelo de lenguaje de tipo mezcla de expertos (MoE) derivado de la familia Gemma, con 25.233.142.046 parámetros totales y un esquema de activación de aproximadamente 4B parámetros por token (según indica el sufijo A4B). No se trata de un modelo entrenado desde cero, sino de un merge construido con mergekit mediante la técnica `task_arithmetic`, a partir de una serie de variantes comunitarias de Gemma que incorporan ajustes orientados a escritura creativa, restauración de razonamiento y modificaciones de estilo (etiquetadas como "heresy" y "sompoa"). El autor del merge original es oxpuppy635, y esta ficha corresponde a la cuantización GGUF publicada por mradermacher.

La relevancia de esta publicación es fundamentalmente práctica: mradermacher ofrece versiones cuantizadas con imatrix (denominadas i1) en un amplio abanico de tipos, desde IQ1_M hasta Q6_K, lo que permite ejecutar un modelo de 25B parámetros totales en hardware de consumo gracias a la activación dispersa del MoE. El repositorio ocupa 158,4 GB e incluye únicamente pesos en formato GGUF, sin safetensors.

Conviene subrayar que se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con una model card muy escueta que no documenta datos de entrenamiento, contexto ni evaluación. La información técnica disponible es, por tanto, limitada y en gran parte inferible solo a partir de los metadatos y de las convenciones de la familia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en la familia Gemma; merge con mergekit (`task_arithmetic`) |
| Parametros totales | 25.233.142.046 (≈25,2B) |
| Parametros activos | ≈4B (inferido del sufijo A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (más fichero imatrix) |
| Idiomas soportados | en |
| Licencia | other (heredada del modelo base; requiere revisar los términos del autor original) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en transformers |

## Arquitectura y entrenamiento

El modelo es un merge, no un entrenamiento. Según las etiquetas de la model card, se ha construido con mergekit aplicando `task_arithmetic` sobre variantes de Gemma 4 (etiqueta `gemma-4`), combinando linajes orientados a escritura creativa (`creative-writing`), restauración de razonamiento (`reasoning-restored`), modificaciones de estilo/desinhibición (`heresy`) y un componente etiquetado como `sompoa`. La arquitectura subyacente es, por tanto, la de un transformer con mezcla de expertos de la familia Gemma, con 25,2B parámetros totales y activación dispersa de aproximadamente 4B por token.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas propias más allá del propio proceso de merge. El autor de la cuantización indica que se han usado pesos imatrix para generar las versiones i1, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. Las cuantizaciones estáticas equivalentes están disponibles en un repositorio separado, y los ficheros mmproj (si existen) se alojan en ese repositorio estático, ya que el modelo se describe como modelo de visión.

## Capacidades

- Generación de texto en inglés, con orientación declarada a escritura creativa.
- Razonamiento restaurado mediante el componente `reasoning-restored` del merge.
- Capacidad de visión (el autor de la cuantización lo etiqueta explícitamente como vision model; los ficheros mmproj estarían en el repositorio estático).
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa y ficción: el merge incorpora componentes específicamente orientados a `creative-writing`, por lo que es adecuado para generar narrativa, diálogos y descripciones con estilo. Se usaría con prompts de sistema que fijen tono y voz, aprovechando el ajuste del linaje.
- Generación de texto en inglés con requisitos de razonamiento: el componente `reasoning-restored` busca recuperar capacidades de razonamiento que los merges de estilo suelen degradar; útil en tareas de análisis y explicación en inglés.
- Prototipado local en hardware de consumo: gracias a la activación MoE de ~4B parámetros, las cuantizaciones i1-IQ3_M (12,5 GB) o i1-Q4_K_M (16,9 GB) permiten ejecutar el modelo en GPUs de 16-24 GB, lo que facilita experimentación sin infraestructura dedicada.
- Procesamiento de imágenes en pipelines multimodales: al ser un modelo de visión, puede emplearse para descripción de imágenes o tareas image-to-text, cargando el mmproj correspondiente desde el repositorio estático.
- Generación de contenido asistida por ordenador en entornos de escritura: integrable en herramientas de edición de texto o asistentes de redacción mediante llama.cpp u Ollama, dado el formato GGUF.
- Investigación sobre merges y cuantización: sirve como caso de estudio para evaluar cómo afectan las técnicas `task_arithmetic` y las cuantizaciones i1 con imatrix a la calidad final en modelos MoE de ~25B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-IQ1_M ≈ 8,8 GB; i1-IQ2_M ≈ 10,5 GB; i1-IQ3_M ≈ 12,5 GB; i1-IQ4_XS ≈ 14,0 GB; i1-Q4_K_S ≈ 15,6 GB; i1-Q4_K_M ≈ 16,9 GB; i1-Q6_K ≈ 22,7 GB.
- GPU recomendadas: RTX 4090 (24 GB) para i1-Q4_K_M o i1-Q6_K; RTX 4080/4070 Ti Super (16 GB) para i1-Q4_K_S o i1-IQ4_XS; GPUs de 12 GB para i1-IQ2_M o i1-IQ3_M con holgura limitada.
- Cabe en GPU de consumo: sí, en la mayoría de configuraciones desde 12 GB en adelante, gracias a la activación MoE de ~4B parámetros.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; el repositorio base es compatible con transformers y con endpoints compatibles. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-i1-GGUF | ≈25,2B | ≈4B (inferido) | no disponible | other | GGUF |
| Gemma 3 27B (referencia de familia) | 27B | denso | no disponible en esta ficha | Gemma Terms | safetensors/GGUF |
| Mixtral 8x7B (referencia MoE) | ≈46,7B | ≈12,9B | no disponible en esta ficha | Apache 2.0 | safetensors/GGUF |
| Qwen2.5 32B (referencia densa) | 32,5B | denso | no disponible en esta ficha | Apache 2.0 (mayoría de variantes) | safetensors/GGUF |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo evaluado, y las cifras de los modelos de referencia corresponden a sus especificaciones públicas habituales, no a una evaluación conjunta.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay validación comunitaria ni evidencia empírica de calidad.
- La model card no documenta datos de entrenamiento, contexto, evaluación ni composición exacta del merge; cualquier uso en producción requiere evaluación propia.
- Al ser un merge con componentes de "heresy" y escritura creativa, es probable que los filtros de seguridad hayan sido alterados o reducidos; no debe asumirse un comportamiento alineado estándar.
- Riesgo elevado de alucinación y de deriva estilística, especialmente en cuantizaciones bajas (IQ1_M, IQ2_M, Q2_K_S), que el propio autor califica como "desperate" o "very low quality".
- Idioma limitado al inglés; no se garantiza un rendimiento aceptable en castellano.
- Licencia "other": es imprescindible revisar los términos del modelo base (Gemma) y del autor del merge antes de cualquier uso comercial; la licencia Gemma impone restricciones de uso.
- El repositorio base no declara pipeline ni contexto, y el tamaño de 158,4 GB corresponde a todas las cuantizaciones, no a un único fichero.
- Las capacidades de visión dependen de disponer del fichero mmproj del repositorio estático; no se confirma que exista.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-GGUF
- Modelo base: https://huggingface.co/oxpuppy635/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored
- Página de descargas del autor: https://hf.tst.eu/model#Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-Restored-i1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
