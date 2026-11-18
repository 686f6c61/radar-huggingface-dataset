# mradermacher/Lura-1.4-500M-i1-GGUF

## Resumen
Lura-1.4-500M-i1-GGUF es una recopilación de cuantizaciones GGUF del modelo base noeme/Lura-1.4-500M, publicada por mradermacher. No se trata de un modelo entrenado por este autor, sino de una conversión a formato GGUF con cuantización ponderada mediante imatrix, pensada para ejecutar el modelo original en hardware de consumo mediante llama.cpp y derivados. El modelo base es un transformer de aproximadamente 494 millones de parámetros, marcado como post-trained y bf16, con etiqueta de idioma inglés y orientación conversacional.

La relevancia de esta ficha es práctica: el repositorio ofrece 24 variantes de cuantización desde IQ1_S (0,4 GB) hasta Q6_K (0,6 GB), lo que permite desplegar un modelo de 500M en CPU, GPUs integradas o GPUs de gama baja con requisitos de memoria mínimos. La información pública disponible sobre el modelo base es muy limitada: no se documentan arquitectura detallada, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha recoge lo que consta y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño total del repo es de 8,6 GB, correspondiente a la suma de todas las variantes de cuantización. La fecha de creación indicada es 2026-11-18, dato que se reproduce tal cual aparece en la información de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible; el modelo base se etiqueta como post-trained y bf16) |
| Parámetros totales | 494.032.768 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_XS, i1-Q2_K, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además se incluye el fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento
El repositorio no documenta la arquitectura interna del modelo base más allá de la etiqueta "transformers" y la indicación de que se trata de un modelo post-trained en bf16. No se especifica si emplea atención estándar, atención lineal, mezcla de expertos u otra variante, ni el número de capas, dimensión oculta o cabezas de atención. Tampoco se detalla el proceso de post-entrenamiento: no consta si se aplicó RLHF, DPO, SFT u otra técnica, ni la composición o el volumen del dataset de entrenamiento.

La innovación técnica documentada en este repositorio es la cuantización: mradermacher genera cuantizaciones ponderadas mediante imatrix (fichero Lura-1.4-500M.imatrix.gguf) y publica variantes i1 en el rango de 1 a 6 bits. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y ofrece notas de calidad por variante (por ejemplo, IQ3_S "beats Q3_K*", Q4_K_M "fast, recommended", Q2_K_S "very low quality"). También existe un repositorio de cuantizaciones estáticas en mradermacher/Lura-1.4-500M-GGUF.

## Capacidades
- Generación de texto conversacional: el modelo está etiquetado como "conversational" y "post-trained", orientado a diálogo en inglés.
- Razonamiento y generación de texto general: capacidad esperable en un modelo de 500M, sin datos publicados que la cuantifiquen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución local eficiente: al ser GGUF cuantizado, puede ejecutarse en CPU y en GPUs de gama baja mediante llama.cpp y compatibles.

## Casos de uso
- Prototipado rápido en local: descargar la variante i1-Q4_K_M (0,5 GB) y ejecutarla con llama.cpp u Ollama para validar pipelines conversacionales sin infraestructura GPU dedicada.
- Pruebas de integración en CI: usar la variante IQ2_M o Q2_K (0,4 GB) como modelo de sustitución en tests automatizados de aplicaciones de chat, reduciendo el tiempo de arranque y el consumo de memoria del runner.
- Despliegue en dispositivos con memoria limitada: la variante IQ1_S (0,4 GB) permite ejecutar un modelo de 500M en entornos con menos de 1 GB de RAM disponible, útil para demos en Raspberry Pi o contenedores pequeños.
- Experimentación con cuantización: el fichero imatrix incluido permite generar cuantizaciones propias y comparar la degradación de calidad entre niveles IQ y K-quants sobre una misma base.
- Chatbot de dominio acotado en inglés: con contexto corto y respuestas breves, puede emplearse para asistentes de FAQ o atención de primer nivel, siempre que se valide la calidad con evaluación propia.
- Evaluación comparativa de formatos: sirve como caso de estudio para medir el impacto de la cuantización en un modelo de 500M, comparando perplejidad y coherencia entre i1-IQ4_XS, i1-Q4_K_M e i1-Q6_K.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: entre 0,4 GB (IQ1_S, IQ2_XXS, IQ3_XXS) y 0,6 GB (Q6_K); las variantes Q4_K_M y Q5_K_M ocupan 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o GPU integrada moderna puede alojar el modelo completo.
- Cabe en GPU de consumo: sí, en todas las variantes, incluidas GPUs de gama baja y muchas iGPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runtimes compatibles con GGUF. El repositorio etiqueta "endpoints_compatible".
- Latencia y throughput: no disponibles; dependerán del hardware y de la variante elegida. En CPU, un modelo de 500M en Q4_K_M es viable para generación interactiva, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lura-1.4-500M-i1-GGUF (este) | 494M | no disponible | no disponible | GGUF i1 (24 variantes) | Cuantizaciones imatrix de noeme/Lura-1.4-500M; solo inglés |
| noeme/Lura-1.4-500M (base) | 494M | no disponible | no disponible | safetensors bf16 | Modelo original post-trained; sin benchmarks publicados en la información disponible |
| mradermacher/Lura-1.4-500M-GGUF | 494M | no disponible | no disponible | GGUF estático | Variante de cuantización estática del mismo base |
| Alternativas de ~500M (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | 360-500M | 32K en Qwen2.5-0.5B; no disponible para SmolLM2 en esta ficha | Apache-2.0 en Qwen2.5 | safetensors, GGUF | Modelos ampliamente documentados con benchmarks publicados; se citan como referencia de categoría, no como comparación medida |

No se dispone de datos de rendimiento del modelo base ni de comparaciones directas publicadas, por lo que la comparativa se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias
- Información muy escasa: no se documentan arquitectura, contexto, dataset ni proceso de post-entrenamiento, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base noeme/Lura-1.4-500M antes de cualquier despliegue en producción.
- Solo inglés: la etiqueta de idioma es "en"; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: inherente a modelos de 500M; la coherencia y fidelidad factual serán limitadas, especialmente en las cuantizaciones de 1-2 bits.
- Degradación por cuantización: las variantes IQ1_S, IQ1_M, IQ2_XXS y Q2_K_S están marcadas por el autor como de calidad muy baja ("for the desperate", "very low quality"); no son adecuadas para producción.
- Sin benchmarks: no hay métricas publicadas que permitan comparar con alternativas de la misma categoría.
- Contexto desconocido: no se puede planificar su uso en conversaciones multi-turno largas sin verificar experimentalmente la ventana efectiva.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lura-1.4-500M-i1-GGUF
- Modelo base: https://huggingface.co/noeme/Lura-1.4-500M
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Lura-1.4-500M-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Lura-1.4-500M-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
