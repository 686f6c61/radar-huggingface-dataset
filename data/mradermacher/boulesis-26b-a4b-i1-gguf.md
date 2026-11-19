# mradermacher/Boulesis-26B-A4B-i1-GGUF

## Resumen

Boulesis-26B-A4B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo SubMaroon/Boulesis-26B-A4B, un merge de arquitectura MoE (mezcla de expertos) construido sobre la familia Gemma 4. El modelo cuenta con 25.971.339.550 parámetros totales y está orientado principalmente a roleplay, generación conversacional y razonamiento con modo "thinking", según las etiquetas declaradas por el autor (roleplay, merge, gemma4, moe, heretic, uncensored, sillytavern, thinking, reasoning).

La relevancia de esta ficha reside en que se trata de una variante "uncensored" y "heretic" (es decir, con las capas de rechazo mitigadas mediante técnicas de ablación o ajuste), empaquetada en cuantizaciones de 1 a 6 bits con calibración imatrix. Esto permite ejecutar un MoE de ~26B parámetros totales en hardware de consumo, algo imposible con los pesos en precisión completa (el repositorio original ocupa 308,9 GB).

El modelo base solo declara soporte para inglés y su licencia es Apache 2.0. No se dispone de información publicada sobre la longitud de contexto, el número de parámetros activos por token ni los detalles del dataset de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre base Gemma 4, transformer |
| Parametros totales | 25.971.339.550 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de quants estáticos en repositorio separado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix y estáticos); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de arquitectura MoE etiquetado como "gemma4" y "moe", con 25.971.339.550 parámetros totales. Al ser un merge, no se dispone de información sobre el proceso de entrenamiento original: no hay datos publicados sobre el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Las etiquetas "heretic" y "uncensored" sugieren que se han aplicado técnicas de mitigación de rechazos (ablación direccional o fine-tuning selectivo), aunque no se detalla el método.

Las cuantizaciones de esta ficha son de tipo i1 (imatrix), generadas con un fichero de importancia de 0,2 GB y calibradas para preservar mejor la perplejidad en bits bajos. El autor advierte que IQ-quants de tamaño similar suelen superar a los K-quants equivalentes, y que los formatos por debajo de Q3 son de calidad notablemente inferior. La etiqueta "thinking" indica soporte de razonamiento explícito previo a la respuesta, aunque no se especifica el mecanismo exacto.

## Capacidades

- Generación de texto conversacional y roleplay multi-turno, con etiquetas específicas para SillyTavern.
- Modo de razonamiento ("thinking") previo a la respuesta final.
- Razonamiento de propósito general, según la etiqueta "reasoning".
- Modelo "uncensored"/"heretic": menor tasa de rechazos en contenido sensible o de ficción.
- Capacidad de visión: la model card indica explícitamente "This is a vision model", con ficheros mmproj (si existen) en el repositorio estático.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está etiquetado específicamente para SillyTavern y roleplay, por lo que puede mantener personajes consistentes en conversaciones largas; la variante "uncensored" evita rechazos en tramas de ficción adulta o violenta.
- Despliegue local en hardware de consumo: con cuantizaciones de 10,8 GB (i1-IQ2_M) a 17,3 GB (i1-Q4_K_M), cabe en GPU de 12-24 GB de VRAM, permitiendo inferencia privada sin dependencia de la nube.
- Generación de ficción y escritura creativa: el modo "thinking" permite planificar tramas antes de redactar, útil para relatos largos con coherencia argumental.
- Asistente conversacional sin filtros para investigación: útil para estudiar comportamiento de modelos con rechazos mitigados, análisis de sesgos o evaluación de alineación.
- Prototipado de frontends de chat: al ser compatible con endpoints y con llama.cpp/Ollama, sirve para desarrollar y probar interfaces conversacionales antes de migrar a modelos mayores.
- Experimentación con arquitecturas MoE: permite medir el equilibrio calidad/velocidad de un MoE de ~26B en distintos niveles de cuantización, comparando la degradación de perplejidad entre IQ1 y Q6.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: 8,6 GB (i1-IQ1_S) hasta 23,3 GB (i1-Q6_K); el punto recomendado por el autor, i1-Q4_K_M, ocupa 17,3 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) equivalente; A100/H100 para servir a múltiples usuarios o con contexto largo.
- GPU de consumo: sí, cabe en RTX 4090, 3090, 4080 (16 GB) con Q4_K_S o inferiores, y en GPUs de 12 GB con IQ2/IQ3. En GPUs de 8 GB solo entran las variantes IQ1, con calidad muy degradada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte imatrix), Ollama, LM Studio, y servidores compatibles con endpoints; vLLM y TGI no consumen GGUF de forma nativa.
- Latencia y throughput: no disponible en la información proporcionada. Al ser un MoE, el throughput dependerá del número de parámetros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Boulesis-26B-A4B-i1-GGUF | 25,97B totales (activos no disponibles) | no disponible | Apache 2.0 | GGUF | Roleplay, uncensored, visión declarada |
| SubMaroon/Boulesis-26B-A4B (base) | 25,97B totales | no disponible | Apache 2.0 | safetensors | Pesos completos, repo de 308,9 GB |
| mradermacher/Boulesis-26B-A4B-GGUF (estáticos) | 25,97B totales | no disponible | Apache 2.0 | GGUF | Quants estáticos sin imatrix, incluye mmproj |

No se dispone de información sobre modelos comparables de otros autores para esta categoría concreta (MoE de ~26B orientado a roleplay sin censura).

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo "thinking" no lo elimina.
- Al ser un modelo "uncensored"/"heretic", puede generar contenido sensible, ofensivo o inapropiado sin filtros; requiere moderación externa en producción.
- Las cuantizaciones por debajo de Q3 (IQ2, IQ1, Q2_K_S) degradan la calidad de forma notable; el autor las describe como "for the desperate" o "very low quality".
- No se publican datos de contexto, parámetros activos ni benchmarks, lo que dificulta estimar rendimiento real en tareas de razonamiento o código.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es un merge de procedencia no documentada; conviene verificar la licencia de los modelos fusionados.
- El repositorio ocupa 308,9 GB; descargar solo el quant necesario, no el repo completo.
- La capacidad de visión depende de ficheros mmproj en el repositorio estático; no se confirma su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Quants estáticos: https://huggingface.co/mradermacher/Boulesis-26B-A4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Boulesis-26B-A4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
