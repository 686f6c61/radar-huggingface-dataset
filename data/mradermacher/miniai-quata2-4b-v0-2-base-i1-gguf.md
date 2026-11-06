# mradermacher/MiniAI-Quata2-4b-v0.2-base-i1-GGUF

## Resumen

MiniAI-Quata2-4b-v0.2-base es un modelo de lenguaje de ~4.326 millones de parámetros (4,3B) desarrollado por M1n1A1 y distribuido en formato GGUF por mradermacher. Se trata de un modelo base (no instruido) derivado de la familia Qwen3.5, según indican las etiquetas del repositorio, y orientado mediante continued pretraining a un uso multilingüe centrado en el serbio, croata, bosnio e inglés. Su relevancia radica en ser una alternativa compacta y de licencia Apache 2.0 para tareas de generación de texto en lenguas eslavas del sur, un nicho con relativamente pocos modelos abiertos de este tamaño.

El repositorio aquí descrito no contiene los pesos originales, sino un conjunto de cuantizaciones GGUF generadas con imatrix (quants de tipo i1), pensadas para su uso con llama.cpp y herramientas compatibles. La model card indica además que el modelo base es un modelo de visión, de modo que los ficheros mmproj, si existen, residen en el repositorio de cuantizaciones estáticas del mismo autor.

La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card se limita a describir el proceso de cuantización y no aporta detalles técnicos del modelo original. Esta ficha refleja únicamente lo que puede verificarse a partir de los metadatos y del contenido del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, según etiquetas); detalles no disponibles |
| Parámetros totales | 4.326.350.848 (~4,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además fichero imatrix |
| Idiomas soportados | en, sr, hr, bs |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original. Las etiquetas del repositorio lo asocian a la familia Qwen3.5 y lo describen como un modelo base sometido a continued pretraining sobre el checkpoint M1n1A1/MiniAI-Quata2-4b-v0.2-base. El número de tokens de entrenamiento, la composición del dataset y la posible aplicación de RLHF o DPO no están documentados en la información disponible.

El proceso documentado en este repositorio es exclusivamente la cuantización: mradermacher ha generado quants GGUF ponderados con imatrix a partir del modelo base, con distintos niveles de compresión (desde i1-Q2_K de ~2,1 GB hasta i1-Q6_K de ~3,7 GB). La model card menciona que el modelo base es de visión, por lo que las capacidades multimodales, si se conservan, requerirían los ficheros mmproj del repositorio de cuantizaciones estáticas.

## Capacidades

- Generación de texto en inglés, serbio, croata y bosnio, con especial orientación a las variedades del serbocroata.
- Modelo base: no está ajustado para seguir instrucciones ni para formato conversacional, aunque el repositorio incluye la etiqueta "conversational".
- Posible soporte de visión heredado del modelo base (la model card lo describe como vision model), condicionado a disponer de los ficheros mmproj.
- No hay evidencia documentada de soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de razonamiento explícito, matemáticas o código más allá de las que pueda aportar el preentrenamiento general.
- Multilingüismo limitado a los cuatro idiomas declarados.

## Casos de uso

- Generación y completado de texto en serbio, croata y bosnio: el modelo puede emplearse como base para fine-tuning supervisado en tareas de redacción, resumen o paráfrasis en estas lenguas, donde la oferta de modelos abiertos es escasa.
- Continued pretraining específico de dominio: al ser un modelo base de 4,3B con licencia Apache 2.0, es adecuado como punto de partida para adaptar a dominios como legal, administrativo o periodístico en lenguas eslavas del sur.
- Experimentación académica en PLN de bajo recurso: su tamaño permite ejecutarlo en una sola GPU consumer, lo que facilita la investigación sobre modelos multilingües pequeños.
- Prototipado local con llama.cpp u Ollama: las cuantizaciones i1-Q4_K_M (~2,9 GB) permiten desplegar el modelo en portátiles con 8 GB de RAM o VRAM para pruebas de generación de texto.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece una matriz completa de quants con imatrix, útil para estudiar el impacto de la compresión en la calidad para un modelo de 4B.
- Base para pipelines de generación aumentada por recuperación (RAG) en contextos multilingües balcánicos, siempre que se valide previamente la calidad del modelo base y su ventana de contexto real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB en i1-Q2_K, 2,9 GB en i1-Q4_K_M y 3,7 GB en i1-Q6_K, más el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU consumer: sí, en modelos con 6 GB o más de VRAM para quants Q4 y superiores; las quants Q2/IQ3 pueden ejecutarse incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; vLLM y TGI requerirían los pesos originales en safetensors del repo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiniAI-Quata2-4b-v0.2-base (este) | ~4,3B | no disponible | en, sr, hr, bs | Apache 2.0 | GGUF, safetensors (base) |
| Qwen2.5-3B / Qwen3-4B | ~3-4B | 32K-128K (según variante) | multilingüe amplio | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B | ~3,2B | 128K | multilingüe (8 idiomas oficiales) | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B | ~2,6B | 8K | multilingüe | Gemma Terms of Use | safetensors, GGUF |

La comparación se ofrece como referencia de categoría; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no debe esperarse un comportamiento conversacional fiable sin fine-tuning previo.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en tareas de conocimiento factual.
- Información muy limitada sobre datos de entrenamiento, lo que dificulta evaluar sesgos y calidad por dominio.
- Cobertura lingüística restringida a en, sr, hr y bs; el rendimiento en otros idiomas no está garantizado.
- Longitud de contexto no documentada: debe validarse empíricamente antes de usarlo en tareas de contexto largo.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base original y de los datos de entrenamiento antes de un uso comercial en producción.
- Las cuantizaciones de baja precisión (Q2, IQ2, IQ3) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- El soporte de visión, si existe, depende de ficheros mmproj alojados en otro repositorio y no está verificado en esta información.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-base-i1-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2-base
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-base-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiniAI-Quata2-4b-v0.2-base-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
