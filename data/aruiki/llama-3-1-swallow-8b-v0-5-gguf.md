# aruiki/Llama-3.1-Swallow-8B-v0.5-GGUF

## Resumen

Llama-3.1-Swallow-8B-v0.5-GGUF es una redistribución en formato GGUF (cuantización Q4_K_M) del modelo tokyotech-llm/Llama-3.1-Swallow-8B-v0.5, un modelo de lenguaje de 8.030.261.312 parámetros desarrollado por Tokyo Tech LLM (Swallow). El modelo original parte de la arquitectura Llama 3.1 y ha sido adaptado específicamente para japonés e inglés mediante entrenamiento continuado sobre el checkpoint base de Meta. Esta versión GGUF la publica el desarrollador aruiki como artefacto de distribución para su aplicación Asteria Japanese IME.

La relevancia de esta ficha es doble: por un lado, documenta el modelo Swallow 8B v0.5 como tal (un LLM bilingüe ja/en de tamano medio); por otro, aclara que este repositorio concreto no es un modelo nuevo ni un fine-tuning, sino un binario de cuantización byte-idéntico al publicado por neody en su repositorio GGUF, con los pesos sin modificar. El autor lo redistribuye para que su IME japonés lo descargue bajo demanda como "juez" de desambiguación de candidatos de conversión.

El contexto de uso es muy específico: Asteria lo emplea únicamente para re-puntuar candidatos de conversión kana-kanji cuando los modelos principales (genmai y TinySwallow) producen puntuaciones cercanas. Se trata, por tanto, de un caso de uso de inferencia local en el escritorio del usuario, con el texto tecleado sin salir del PC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.1), según el modelo original Swallow 8B v0.5 |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3.1 soporta 128K, pero no se confirma para Swallow v0.5 en esta ficha) |
| Tipos de cuantización | Q4_K_M (única incluida en este repo) |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Llama 3.1 Community License + Gemma Terms of Use (identificador `llama3.1-and-gemma`, etiqueta `other`) |
| Formato de pesos | GGUF (fichero `llama-3.1-swallow-8b-v0.5-q4_k_m.gguf`, 4.920.735.136 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es tokyotech-llm/Llama-3.1-Swallow-8B-v0.5, un LLM construido sobre la arquitectura Llama 3.1 (transformer decoder-only con atención causal estándar) y adaptado por Tokyo Tech LLM para japonés e inglés. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos deben consultarse en la model card del modelo original.

Esta publicación concreta no introduce ningún cambio en los pesos: es una cuantización Q4_K_M realizada por terceros (repositorio neody/Llama-3.1-Swallow-8B-v0.5-gguf) y redistribuida sin modificación. El autor declara explícitamente que el fichero es byte-idéntico al de neody, con SHA-256 `292a4e2696251015daddc0393a63f33fc4b1cebae2d62eb35670561e17de4277`, y que la revisión del modelo base utilizada es `9392cd19c931ab816c56ecce32abe26ba001f320`. La etiqueta `imatrix` sugiere que la cuantización pudo emplear matrices de importancia, aunque no se aporta detalle técnico adicional.

## Capacidades

- Generación de texto en japonés e inglés, con especial orientación al japonés por el entrenamiento continuado de Swallow.
- Razonamiento y comprensión de lenguaje natural en ambos idiomas.
- Puntuación y comparación de candidatos textuales (uso real en Asteria como modelo juez de desambiguación kana-kanji).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a ja y en según los metadatos del repositorio.

## Casos de uso

- Desambiguación de conversión kana-kanji en un IME japonés: es el uso real de este artefacto. Asteria lo invoca cuando los modelos principales (genmai y TinySwallow) generan candidatos con puntuaciones próximas y difieren en la elección de un kanji; el modelo re-puntúa y desempata. Adecuado por su tamano contenido (8B en Q4_K_M) y su especialización en japonés.
- Corrección ortográfica y de estilo en japonés: el modelo puede evaluar y reescribir frases tecleadas por el usuario, aprovechando su entrenamiento continuado en japonés frente a Llama 3.1 base.
- Asistencia de redacción bilingüe ja/en: generación y revisión de textos en ambos idiomas en entornos de escritorio con inferencia local.
- Traducción ja↔en de calidad media: utilizable para borradores y pre-traducción en flujos internos, con revisión humana posterior.
- Clasificación y ranking de textos cortos: por su uso como juez, encaja en tareas de scoring de pares de frases o selección de variantes.
- Prototipado local en consumer GPU: al estar en GGUF Q4_K_M (~4,9 GB), permite experimentar con un LLM japonés en hardware modesto mediante llama.cpp u Ollama.
- Filtrado y normalización de entradas en pipelines de datos japoneses: limpieza, detección de errores tipográficos y normalización de texto antes de indexación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantización Q4_K_M incluida (fichero de 4,92 GB más overhead de contexto y caché KV).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en el ámbito profesional, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM; en GPUs de 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.1-Swallow-8B-v0.5 (este GGUF) | 8,03 B | No disponible | ja, en | Llama 3.1 + Gemma Terms | GGUF Q4_K_M |
| tokyotech-llm/Llama-3.1-Swallow-8B-v0.5 (original) | 8,03 B | No disponible | ja, en | Llama 3.1 + Gemma Terms | safetensors |
| neody/Llama-3.1-Swallow-8B-v0.5-gguf | 8,03 B | No disponible | ja, en | Llama 3.1 + Gemma Terms | GGUF (múltiples cuantizaciones) |
| Llama 3.1 8B (Meta) | 8,03 B | 128K | multilingüe (énfasis en inglés) | Llama 3.1 Community License | safetensors, GGUF |

La comparativa se limita a variantes del mismo modelo y a su base Llama 3.1 8B, dado que no se dispone de datos de benchmarks para situarlo frente a otros LLM japoneses de tamano similar.

## Limitaciones y advertencias

- Este repositorio no es un modelo entrenado por aruiki: es una redistribución de una cuantización de terceros (neody). Cualquier limitación del modelo original Swallow 8B v0.5 aplica sin cambios.
- Sesgos: no documentados en la información disponible; al derivar de Llama 3.1 y de datos japoneses, es esperable heredar sesgos de ambas fuentes.
- Riesgo de alucinación: inherente a los LLM de 8B; el uso como juez de candidatos mitiga el impacto porque solo reordena opciones ya generadas.
- Limitaciones de idioma: solo ja y en según los metadatos; no debe asumirse competencia en otras lenguas.
- Licencia: la licencia combinada Llama 3.1 Community License + Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar LICENSE, USE_POLICY.md, GEMMA_TERMS_OF_USE.md y Notice antes de cualquier despliegue en producción.
- Solo se distribuye Q4_K_M; si se necesita mayor precisión o menor huella, hay que acudir a otras cuantizaciones del repositorio de neody o al modelo original en safetensors.
- El modelo está pensado para inferencia local en escritorio; no se documenta comportamiento bajo alta concurrencia ni serving multiusuario.
- La fecha de creación del repositorio (2026-11-03) y el conteo de descargas y likes (0) indican que es un artefacto reciente y con poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aruiki/Llama-3.1-Swallow-8B-v0.5-GGUF
- Modelo base: https://huggingface.co/tokyotech-llm/Llama-3.1-Swallow-8B-v0.5
- Repositorio GGUF de origen: https://huggingface.co/neody/Llama-3.1-Swallow-8B-v0.5-gguf
- Aplicación Asteria Japanese IME: https://github.com/aruiki/Asteria-Japanese-IME
- Licencia Llama 3.1: LICENSE y USE_POLICY.md en el repositorio
- Gemma Terms of Use: GEMMA_TERMS_OF_USE.md en el repositorio
- Notice: Notice en el repositorio
