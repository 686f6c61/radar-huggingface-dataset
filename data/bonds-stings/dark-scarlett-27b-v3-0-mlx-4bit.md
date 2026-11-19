# bonds-stings/Dark-Scarlett-27B-v3.0-mlx-4Bit

## Resumen

Dark-Scarlett-27B-v3.0-mlx-4Bit es una conversión al formato MLX (cuantización de 4 bits) del modelo ReadyArt/Dark-Scarlett-27B-v3.0, un fine-tune orientado a roleplay, conversación instructiva y contenido para adultos. La conversión la ha realizado el usuario bonds-stings mediante la librería mlx-lm en su versión 0.31.2, lo que permite ejecutar el modelo de forma nativa en hardware Apple Silicon (chips M-series) aprovechando el framework MLX de Apple.

El modelo base pertenece a la familia Qwen 3.5 según los tags del repositorio, con 26.895.993.856 parámetros totales (aproximadamente 26,9 mil millones) y un tamaño de repositorio de 15,2 GB tras la cuantización a 4 bits. Está pensado para despliegues locales en Mac con memoria unificada, no para servidores con GPU NVIDIA, y su licencia Apache 2.0 permite uso comercial según los términos declarados por el autor.

La relevancia de esta ficha radica en que documenta un caso de conversión MLX de un modelo de rol sin alineación (etiquetado como "unaligned" y "nsfw"), lo que implica consideraciones específicas de seguridad, filtrado y cumplimiento que deben evaluarse antes de cualquier uso en producción. No se dispone de información publicada sobre benchmarks, idiomas soportados ni pipeline de inferencia en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según tags del repo; detalles no disponibles) |
| Parametros totales | 26.895.993.856 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (mlx-lm 0.31.2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "qwen3_5" presente en los tags del repositorio, que sugiere que el modelo base deriva de la familia Qwen 3.5. No se especifican el número de capas, la dimensionalidad del modelo, el tipo de atención ni si emplea técnicas como atención lineal o decodificación especulativa. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

Lo que sí se conoce es que el modelo base ReadyArt/Dark-Scarlett-27B-v3.0 es un fine-tune orientado a roleplay y conversación, etiquetado explícitamente como "unaligned" y "nsfw", lo que indica que el proceso de ajuste se ha orientado a reducir o eliminar los filtros de seguridad típicos de los modelos instructivos convencionales. La conversión a MLX 4 bits se ha realizado con mlx-lm 0.31.2, una versión concreta de la herramienta que determina el esquema de cuantización aplicado a los pesos.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y diálogo instructivo.
- Soporte de plantilla de chat mediante `tokenizer.apply_chat_template`, tal como muestra el ejemplo de la model card.
- Generación de contenido explícito para adultos (etiquetas "nsfw", "adult-content", "explicit", "erp").
- Comportamiento "unaligned": menor adherencia a rechazos de seguridad por defecto del modelo base.
- Ejecución nativa en Apple Silicon mediante MLX y la librería mlx-lm.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional local en Mac: el modelo puede mantener sesiones de rol multi-turno ejecutándose íntegramente en un equipo Apple Silicon con memoria unificada suficiente, sin depender de servicios en la nube.
- Prototipado de personajes y narrativa interactiva: adecuado para desarrolladores que construyen motores de ficción interactiva y necesitan un modelo que no aplique rechazos por contenido maduro, siempre dentro de un marco legal y de edad verificado.
- Investigación sobre alineación y seguridad: útil como caso de estudio de modelo "unaligned" para analizar comportamientos, sesgos y riesgos de modelos sin filtros, en entornos controlados.
- Evaluación de cuantización MLX 4 bits: sirve para medir la degradación de calidad respecto al modelo base en fp16/bf16 en tareas de diálogo y creatividad.
- Generación de diálogo para videojuegos narrativos: integrable en pipelines locales de macOS para NPCs con personalidad, con la ventaja de que el modelo corre offline y no expone datos de usuario.
- Experimentación con plantillas de chat: permite probar formatos de prompt y system prompts en un modelo instructivo de ~27B en hardware de consumo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 15,2 GB en 4 bits, por lo que se recomienda al menos 16 GB de memoria unificada y, de forma realista, 24-32 GB para dejar margen a la caché KV y al contexto.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra); no es compatible de forma nativa con CUDA.
- Cabe en equipos consumer Apple: sí, en Mac con 24 GB o más de memoria unificada; con 16 GB el margen es muy ajustado.
- Opciones de despliegue: mlx-lm (librería oficial usada en la conversión); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bonds-stings/Dark-Scarlett-27B-v3.0-mlx-4Bit | ~26,9 B | no disponible | MLX 4 bits | Apache 2.0 | Conversión MLX de un fine-tune roleplay unaligned |
| ReadyArt/Dark-Scarlett-27B-v3.0 | ~26,9 B (presumiblemente) | no disponible | safetensors (formato original) | Apache 2.0 | Modelo base del que deriva esta conversión |
| Qwen 3.5 (modelo base de la familia) | no disponible | no disponible | safetensors | no disponible | Referencia arquitectónica según tags; sin datos concretos |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo etiquetado como "nsfw", "adult-content", "explicit" y "erp": genera contenido sexual y explícito de forma deliberada; no es apto para entornos sin control de edad ni para aplicaciones de cara al público general.
- Etiqueta "unaligned": menor probabilidad de rechazar peticiones dañinas; requiere capas adicionales de moderación si se despliega en producción.
- Riesgo elevado de alucinación y de deriva de personaje en sesiones largas de roleplay; no se documenta la longitud de contexto soportada.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado.
- La licencia Apache 2.0 permite uso comercial según los términos declarados, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Compatibilidad limitada a Apple Silicon vía MLX; no hay soporte documentado para CUDA, ROCm ni CPU genérica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.
- La fecha de creación indicada (2026-11-19) es futura respecto a la fecha habitual de consulta, lo que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/bonds-stings/Dark-Scarlett-27B-v3.0-mlx-4Bit
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v3.0
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Framework MLX: https://github.com/ml-explore/mlx
