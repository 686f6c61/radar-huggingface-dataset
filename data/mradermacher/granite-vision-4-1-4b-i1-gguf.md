# mradermacher/granite-vision-4.1-4b-i1-GGUF

## Resumen

Granite-vision-4.1-4b-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo multimodal ibm-granite/granite-vision-4.1-4b, publicada por el usuario mradermacher. El modelo original lo desarrolla IBM dentro de su familia Granite, orientada a tareas empresariales, y combina un codificador visual con un modelo de lenguaje de aproximadamente 3.400 millones de parámetros (3.402.836.480 según los pesos en safetensors). Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precisión completa.

La relevancia de esta ficha radica en que ofrece cuantizaciones con calibración imatrix (etiquetadas i1), desde IQ1_S (0,9 GB) hasta Q6_K (2,9 GB), lo que permite desplegar un modelo de visión-lenguaje en GPUs de gama media e incluso en CPU. El repositorio tiene 925 descargas y licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

No obstante, conviene subrayar que esta publicación es una derivación: no aporta arquitectura ni entrenamiento propios, sino una conversión a GGUF del modelo de IBM. La información disponible sobre el modelo base en esta ficha es limitada y se indica como "no disponible" cuando no se ha podido confirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal visión-lenguaje; el repositorio no detalla la arquitectura interna) |
| Parámetros totales | 3.402.836.480 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de un fichero imatrix para generar cuantizaciones propias) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para la parte visual en el repositorio estático) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base ibm-granite/granite-vision-4.1-4b. Por la denominación "vision" y el pipeline multimodal implícito, se trata de un modelo que procesa imágenes y texto, presumiblemente mediante un codificador visual acoplado a un transformer de lenguaje, pero no se confirman ni el tipo exacto de codificador, ni la estrategia de fusión, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Todos estos datos deben considerarse "no disponible" a partir de la información consultada.

Lo que sí documenta esta publicación es el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con imatrix (fichero granite-vision-4.1-4b.imatrix.gguf) a partir del modelo en formato Hugging Face, con conversión de tipo hf y cuantización de tensores de salida. Las cuantizaciones i1 emplean información de importancia (imatrix) para preservar mejor la calidad en bits bajos. Los ficheros mmproj necesarios para la parte visual se alojan en el repositorio estático hermano (mradermacher/granite-vision-4.1-4b-GGUF), no en este repositorio i1.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta "conversational" en el repositorio).
- Procesamiento de imágenes: es un modelo de visión, por lo que acepta entradas visuales junto con texto, aunque la información disponible no detalla tareas concretas (VQA, OCR, captioning) ni su rendimiento.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidades multilingües limitadas al inglés según la model card (language: en).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción de imágenes en local: el modelo puede recibir una imagen y generar una descripción textual; al estar cuantizado en GGUF, se ejecuta en un portátil con GPU de consumo, lo que resulta útil para catalogar fotos sin enviar datos a la nube.
- Extracción de información de documentos escaneados: combinando la entrada visual con preguntas en inglés, puede emplearse para responder sobre el contenido de facturas o formularios, siempre que la calidad de la cuantización elegida sea suficiente (se recomienda Q4_K_M o superior).
- Asistente de accesibilidad: generación de descripciones de imágenes para personas con discapacidad visual, ejecutándose en hardware modesto gracias a los ficheros de 2-3 GB.
- Prototipado rápido de aplicaciones multimodal: al ser compatible con llama.cpp y endpoints, permite validar una idea de producto con visión antes de invertir en infraestructura con el modelo completo.
- Moderación de contenido visual: clasificación y descripción de imágenes en pipelines internos, con la ventaja de que la licencia Apache 2.0 permite uso comercial.
- Investigación y experimentación con cuantizaciones: el fichero imatrix incluido permite generar cuantizaciones propias y estudiar el impacto de la compresión en tareas de visión, un caso de uso específico para investigadores.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, los datos visuales no salen del dispositivo, adecuado para sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 GB (i1-IQ1_S) y 3 GB (i1-Q6_K) para los pesos del modelo de lenguaje, más el espacio del fichero mmproj para la parte visual y la memoria de la caché KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las cuantizaciones intermedias (Q4_K_M); para Q6_K se recomienda 6-8 GB. GPUs de gama alta como A100 o H100 no son necesarias y estarían sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y en muchas integradas con suficiente memoria compartida. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), y servidores compatibles con la API de endpoints. Para la parte visual es necesario usar el fichero mmproj del repositorio estático.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| granite-vision-4.1-4b-i1-GGUF (este) | 3.400 M | no disponible | Apache 2.0 | GGUF | Hugging Face |
| ibm-granite/granite-vision-4.1-4b (base) | 3.400 M | no disponible | Apache 2.0 | safetensors | Hugging Face |
| mradermacher/granite-vision-4.1-4b-GGUF (cuantizaciones estáticas) | 3.400 M | no disponible | Apache 2.0 | GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de visión-lenguaje de tamaño similar (por ejemplo, variantes de 3-4B de otras familias) en la información proporcionada, por lo que la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo entrenado principalmente en inglés, es probable que presente sesgos culturales y lingüísticos propios de ese dominio, aunque no se documentan.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de visión puede describir elementos inexistentes en la imagen, especialmente con cuantizaciones muy agresivas (IQ1, IQ2, Q2_K).
- Limitaciones de contexto o idioma: la model card solo declara inglés; el rendimiento en castellano no está garantizado. La longitud de contexto no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de IBM y las licencias de los componentes visuales.
- Caveats para producción: las cuantizaciones por debajo de Q4 pierden calidad de forma notable (el propio autor califica IQ1 como "for the desperate" y Q2_K_S como "very low quality"); para producción se recomienda Q4_K_M o superior. Además, la parte visual requiere el fichero mmproj del repositorio estático, y este repositorio i1 no lo incluye. La información sobre arquitectura, entrenamiento y benchmarks es escasa, lo que dificulta una evaluación rigurosa antes de desplegar.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/granite-vision-4.1-4b-i1-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/granite-vision-4.1-4b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#granite-vision-4.1-4b-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
