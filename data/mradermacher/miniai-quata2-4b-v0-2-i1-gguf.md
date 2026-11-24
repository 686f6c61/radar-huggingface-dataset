# mradermacher/MiniAI-Quata2-4b-v0.2-i1-GGUF

## Resumen

MiniAI-Quata2-4b-v0.2-i1-GGUF es la versión cuantizada en formato GGUF del modelo MiniAI-Quata2-4b-v0.2, publicada por el usuario mradermacher, especializado en generar cuantizaciones de modelos abiertos. El modelo base lo desarrolla M1n1A1 y se presenta como un modelo de 4B parámetros (4.841.450.496 parámetros reales según los pesos en safetensors) orientado a razonamiento, tool calling y conversación, con etiquetas que lo vinculan a la familia Qwen 3.5 y a un enfoque multilingüe centrado en serbio, croata y bosnio, además del inglés.

La relevancia de esta ficha reside en que ofrece un paquete de cuantizaciones imatrix (i1) con un rango de tamaños que va desde 1,7 GB hasta 4,1 GB, lo que permite desplegar el modelo en hardware de consumo. Al tratarse de una cuantización y no del modelo original, el interés técnico está en la disponibilidad de formatos GGUF optimizados para llama.cpp y en la variedad de niveles de calidad/tamaño ofrecidos.

La licencia Apache 2.0 del modelo base facilita el uso comercial, pero conviene tener en cuenta que la información pública disponible sobre el modelo original es escasa: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; etiquetado como familia Qwen 3.5) |
| Parámetros totales | 4.841.450.496 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | inglés (en), serbio (sr), croata (hr), bosnio (bs) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base MiniAI-Quata2-4b-v0.2. Las etiquetas de la model card lo asocian a la familia Qwen 3.5 y a un transformer de aproximadamente 4,8 mil millones de parámetros, pero no se especifica si emplea atención lineal, decodificación especulativa ni otras innovaciones. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares.

La información disponible se centra en el proceso de cuantización: mradermacher ha generado cuantizaciones i1 (imatrix) con un fichero imatrix propio de 0,1 GB que puede reutilizarse para crear cuantizaciones personalizadas. Se ofrecen también cuantizaciones estáticas en un repositorio separado. La model card indica que se trata de un modelo de visión, por lo que los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional en inglés, serbio, croata y bosnio.
- Razonamiento (etiqueta "reasoning" en la model card).
- Tool calling / function calling (etiqueta "tool-calling").
- Capacidad de visión indicada en la model card (ficheros mmproj en el repositorio estático).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documentan capacidades específicas de agentes multi-paso, matemáticas o código más allá de las etiquetas generales.

## Casos de uso

- Asistente conversacional multilingüe para serbio, croata, bosnio e inglés: el modelo cubre las cuatro lenguas en un único despliegue, lo que resulta útil para atención al cliente en la región de los Balcanes occidentales sin necesidad de mantener modelos separados por idioma.
- Despliegue en hardware de consumo: con cuantizaciones desde 1,7 GB (i1-IQ1_S) hasta 4,1 GB (i1-Q6_K), puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada de gama alta, usando llama.cpp u Ollama.
- Integración en pipelines con tool calling: las etiquetas indican soporte de function calling, lo que permite conectarlo a APIs externas, bases de datos o sistemas de automatización en flujos de trabajo ligeros.
- Prototipado rápido de aplicaciones de razonamiento: el tamaño de 4B y la licencia Apache 2.0 permiten experimentar con cadenas de razonamiento y evaluación de agentes sin costes de licencia.
- Procesamiento de documentos con componente visual: si se confirma la disponibilidad de mmproj en el repositorio estático, podría emplearse para tareas de OCR ligero o descripción de imágenes en entornos con recursos limitados.
- Investigación sobre cuantización: el repositorio incluye un fichero imatrix y una amplia gama de niveles de cuantización, lo que lo convierte en un banco de pruebas útil para estudiar la degradación de calidad según el nivel de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para cuantizaciones IQ1/IQ2, 3 GB para Q4_K_M, 4-5 GB para Q6_K (estimación basada en el tamaño de los ficheros GGUF; no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores; también en GPUs de datacenter (A100, H100) si se busca mayor throughput, aunque no se aportan datos de latencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM para las cuantizaciones Q4/Q5, y en CPU con llama.cpp para las cuantizaciones más pequeñas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. La model card menciona compatibilidad con endpoints. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniAI-Quata2-4b-v0.2-i1-GGUF | 4,84B | no disponible | Apache 2.0 | GGUF (i1) |
| MiniAI-Quata2-4b-v0.2 (base) | 4,84B | no disponible | Apache 2.0 | safetensors |
| MiniAI-Quata2-4b-v0.2-GGUF (estático) | 4,84B | no disponible | Apache 2.0 | GGUF (estático) |

No se dispone de información suficiente para comparar con modelos de otras familias (por ejemplo, Qwen 2.5 4B o Llama 3.2 3B) en términos de rendimiento, ya que no hay benchmarks publicados en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible verificar la calidad del modelo frente a alternativas de tamaño similar.
- La información sobre sesgos, alucinación y comportamiento en producción es inexistente en la documentación disponible.
- El soporte de idiomas se limita a inglés, serbio, croata y bosnio; el rendimiento en castellano no está documentado.
- La model card indica que es un modelo de visión, pero los ficheros mmproj no están en este repositorio, sino en el de cuantizaciones estáticas; hay que verificar su existencia antes de asumir capacidades multimodales.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el autor las describe como "para desesperados".
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base y de los datos de entrenamiento originales antes de un uso comercial.
- El repositorio ocupa 60,7 GB en total, por lo que la descarga completa de todas las cuantizaciones es costosa en almacenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-i1-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiniAI-Quata2-4b-v0.2-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
