# mradermacher/Qwen3.5-9B-Uncensored-Safetensors-i1-GGUF

## Resumen

Qwen3.5-9B-Uncensored-Safetensors-i1-GGUF es una cuantización en formato GGUF del modelo nDimensional/Qwen3.5-9B-Uncensored-Safetensors, publicada por el usuario mradermacher, especializado en distribuir versiones cuantizadas de modelos abiertos. El modelo base es una variante "uncensored" (sin filtros de alineamiento) de la familia Qwen3.5, con 8.953.803.264 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos densos de aproximadamente 9.000 millones de parámetros.

La relevancia de esta ficha radica en que combina dos elementos prácticos: por un lado, la posibilidad de ejecutar un modelo de ~9B en hardware de consumo gracias a las cuantizaciones GGUF con imatrix, que reducen el peso desde decenas de gigabytes hasta rangos de 2,8-6,6 GB según el nivel de compresión; por otro, la orientación "uncensored" del modelo base, que lo hace atractivo para investigación sobre alineamiento, generación creativa sin restricciones y experimentación con prompts que los modelos alineados rechazan.

La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque conviene revisar las condiciones del modelo original. El repositorio incluye una amplia batería de cuantizaciones (desde IQ1_S hasta Q6_K) generadas con imatrix, lo que permite ajustar el equilibrio entre calidad, tamaño y velocidad de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3_5; familia Qwen) |
| Parámetros totales | 8.953.803.264 (~8,95B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix y estáticas) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Las etiquetas del repositorio indican la familia qwen3_5 y mencionan "multimodal", "ablation" y "vllm", lo que sugiere una arquitectura transformer de la familia Qwen con posibles capacidades multimodales, pero no se confirma ni el número de capas, ni la dimensión de los embeddings, ni el mecanismo de atención empleado.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni el proceso de "uncensoring" aplicado por nDimensional. La model card del repositorio cuantizado se limita a describir el proceso de cuantización con imatrix y a listar los ficheros disponibles, sin detallar el entrenamiento del modelo original. Cualquier afirmación sobre innovaciones técnicas como decodificación especulativa o atención lineal sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados.
- Orientación "uncensored": el modelo base ha sido modificado para reducir los rechazos ante prompts que los modelos alineados suelen bloquear, lo que lo hace útil para investigación sobre alineamiento y generación sin filtros.
- Posible soporte multimodal: la etiqueta "multimodal" aparece en el repositorio, aunque no se detalla qué modalidades cubre ni si se preservan en las cuantizaciones GGUF.
- Compatibilidad con vLLM y endpoints compatibles, según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo "uncensored" permite estudiar cómo responde un LLM sin filtros ante prompts sensibles, comparando su comportamiento con el de modelos alineados de la misma familia y tamaño.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde los modelos alineados suelen rechazar o suavizar el contenido.
- Despliegue en hardware de consumo: con cuantizaciones de 4-6 GB (Q4_K_M, Q4_K_S, IQ4_XS), el modelo cabe en GPUs de 8 GB de VRAM o incluso en CPU con llama.cpp, lo que facilita prototipado local sin infraestructura cloud.
- Experimentación con cuantización: la disponibilidad de más de veinte variantes GGUF con imatrix permite estudiar el impacto de la compresión en la calidad de las respuestas, útil para investigadores que evalúan técnicas de cuantización.
- Chat conversacional local en inglés y chino: para usuarios que necesitan un asistente privado en esos idiomas, ejecutable con Ollama o llama.cpp sin enviar datos a servicios externos.
- Evaluación de modelos en pipelines de CI: al ser compatible con vLLM y endpoints compatibles, puede integrarse en pruebas automatizadas de generación de texto o en la evaluación de frameworks de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3 y 7 GB según la cuantización elegida (IQ1_S ~2,8 GB; Q4_K_M ~5,7 GB; Q6_K ~7,5 GB aproximadamente, aunque el tamaño exacto del Q6_K no aparece en el listado truncado).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las cuantizaciones mayores; A100 o H100 no son necesarias para un modelo de ~9B, pero pueden usarse para servir múltiples instancias o contextos largos.
- Cabe en GPU de consumo: sí. Las cuantizaciones Q4_K_M (5,7 GB) e IQ4_XS (5,3 GB) caben en GPUs de 8 GB; las Q5 y Q6 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), endpoints compatibles con OpenAI.
- Latencia y throughput estimados: no disponible en la información proporcionada; dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored (este) | ~8,95B | no disponible | Apache 2.0 | GGUF / safetensors | Variante sin filtros, cuantizaciones imatrix |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens (típico en la familia) | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia de la generación anterior |
| Llama 3.1 8B Instruct | ~8B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa alineada con contexto largo |
| Mistral 7B Instruct | ~7,2B | 32.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar |

Nota: los datos de contexto y parámetros de los modelos comparados corresponden a sus especificaciones públicas habituales; no se dispone de benchmarks comparativos directos con este modelo en la información proporcionada.

## Limitaciones y advertencias

- El modelo es "uncensored": puede generar contenido ofensivo, ilegal o dañino sin los filtros habituales. No es adecuado para aplicaciones de cara al público sin una capa de moderación adicional.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; como todo LLM de ~9B, es propenso a inventar datos, especialmente en dominios especializados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada: no se puede asumir una ventana larga sin verificación empírica.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- La licencia Apache 2.0 del modelo base permite uso comercial, pero el carácter "uncensored" puede implicar riesgos legales según la jurisdicción y el uso previsto; conviene revisar las condiciones del modelo original de nDimensional.
- No se documenta el proceso de entrenamiento ni los datos utilizados, lo que dificulta evaluar sesgos y procedencia del contenido.
- El repositorio tiene pocas descargas (920) y likes (4), por lo que la validación comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/Qwen3.5-9B-Uncensored-Safetensors-i1-GGUF
- Modelo base: https://huggingface.co/nDimensional/Qwen3.5-9B-Uncensored-Safetensors
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-9B-Uncensored-Safetensors-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Uncensored-Safetensors-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
