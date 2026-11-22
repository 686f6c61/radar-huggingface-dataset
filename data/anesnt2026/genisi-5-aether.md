# AnesNT2026/Genisi-5-Aether

## Resumen

Genisi 5 Aether es un modelo multimodal de tipo image-text-to-text publicado por AnesNT2026, una iniciativa de investigación argelina con sede en la provincia de Batna. El modelo se presenta en su model card como un modelo fundacional nativo con ventana de contexto de 1.048.576 tokens, orientado a razonamiento matemático, ciberseguridad, ingeniería de software agéntica y comprensión multimodal, con soporte declarado de árabe (incluidos dialectos), inglés y francés.

El repositorio contiene 9.653.104.368 parámetros en formato safetensors (aproximadamente 9,65 mil millones), con un tamaño total de 19,3 GB, lo que sugiere pesos en precisión de 16 bits. La librería declarada es transformers y la arquitectura se etiqueta como qwen3_5, lo que indica una base derivada de la familia Qwen 3.5 adaptada por el autor.

La relevancia del modelo radica en su propuesta de contexto ultra largo, pensamiento multi-turno preservado mediante el campo `reasoning_content` y un esfuerzo de razonamiento configurable (`low`, `high`, `max`). No obstante, las cifras de benchmarks y las comparaciones con modelos frontera que aparecen en la model card no son verificables con la información disponible y deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`; detalles internos no disponibles) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 1.048.576 tokens (1M), según model card |
| Tipos de cuantizacion | no disponible (no se listan GGUF ni AWQ en el repositorio) |
| Idiomas soportados | ar, en, fr (árabe con dialectos argelino, marroquí, tunecino, del Golfo y egipcio, según model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo emplea una arquitectura transformer multimodal con pipeline image-text-to-text y que se apoya en la familia `qwen3_5`, aunque no se detallan la configuración de capas, el número de cabezas de atención, el mecanismo de fusión visual ni el tipo de encoder de imagen. El repositorio ocupa 19,3 GB para 9,65 mil millones de parámetros, consistente con pesos en bf16/fp16.

No se han publicado datos verificables sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni la metodología de alineación. La model card menciona innovaciones como el pensamiento multi-turno preservado (`reasoning_content`), el esfuerzo de razonamiento configurable y una ventana de contexto de 1M tokens, pero no describe el mecanismo técnico que las habilita (por ejemplo, atención lineal, RoPE escalado o decodificación especulativa). Toda la información de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional multi-turno en árabe, inglés y francés.
- Razonamiento explícito con modo de pensamiento preservado entre turnos mediante `reasoning_content`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `high`, `max`).
- Comprensión de imágenes y texto (image-text-to-text), incluyendo extracción de datos de gráficos según la model card.
- Tool calling adaptativo en cuatro modos, según la model card.
- Capacidades agénticas declaradas: razonamiento multi-paso, uso de terminal y automatización de flujos de trabajo.
- Razonamiento matemático y resolución de problemas científicos.
- Análisis de ciberseguridad y parcheo de vulnerabilidades, según la model card.
- Soporte de dialectos árabes regionales.
- Integración con la API compatible de OpenAI mediante `extra_body` para parámetros extendidos.

## Casos de uso

- Atención al cliente multilingüe en el Magreb: el modelo puede gestionar conversaciones multi-turno en árabe dialectal, francés e inglés, lo que encaja con mercados donde se alternan estos idiomas; la ventana de 1M tokens permitiría mantener historiales largos sin truncar.
- Asistencia en ingeniería de software: con soporte declarado de tool calling y contexto de repositorio, podría integrarse en pipelines de CI/CD para revisar parches, generar tests o analizar trazas de error extensas.
- Análisis de documentos técnicos largos: informes, especificaciones o expedientes de cientos de miles de tokens podrían procesarse en una sola pasada gracias a la ventana de 1M tokens, siempre que el rendimiento real lo confirme.
- Extracción de datos de gráficos e imágenes técnicas: el pipeline image-text-to-text permitiría digitalizar tablas, diagramas y planos en flujos de documentación industrial.
- Automatización de tareas de escritorio y agentes: los benchmarks declarados de computer use sugieren un uso previsto en agentes que operan interfaces, aunque requiere validación independiente.
- Revisión de seguridad de código: el modelo declara capacidades de análisis de vulnerabilidades (CWE) y parcheo, aplicable a triaje de hallazgos en repositorios.
- Tutoría matemática en árabe y francés: el modo de razonamiento configurable permitiría ajustar la profundidad de las explicaciones según el nivel del estudiante.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados declarados por el autor. No se han podido verificar de forma independiente y las comparaciones con modelos como Gemini 4 Carbon, GPT-6 Astra o Claude Opus 5.5 no son contrastables con la información disponible. Se reproducen únicamente como datos declarados:

| Benchmark | Genisi 5 Aether (declarado) | Nota |
|---|---|---|
| AA Index v5.0 | 64 | Puntuación compuesta |
| Vals Index v2.2 | 74,8 % | Precisión |
| SWE-sweep | 14,2 % | Barrido multi-repositorio |
| FrontierSWE 2 | 69,4 % | SWE autónomo |
| Terminal-Bench 4.0 (AA) | 68,9 % | CLI |
| Agents' Last Exam v1.1 | 81,2 % | Computer use |
| OSWorld-2.1 | 89,6 % | Subconjunto offline |
| AutomationBench | 58,7 % | Flujos Zapier |
| Vending-Bench 2 | 19.840 USD | Saldo bancario |
| Chartography | 76,4 % | Extracción visual |
| Blueprint-Bench 2 | 63,8 % | Similitud |
| GraphWalks | 98,1 % F1 | 256k–1M, BFS |
| RiemannBench | 84,5 % | Pruebas matemáticas |
| Terminal-Bench-Science 0.1 | 68,7 % | CLI científico |
| CWE-bench | 76,5 % | Parcheo de vulnerabilidades |
| ExploitGym | 59,4 % | 6 horas de reloj |
| SEC-bench Pro | 91,8 % | Seguridad empresarial |

No se han publicado resultados de benchmarks verificables de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto y bastante más para contexto largo.
- La ventana de 1M tokens implica un coste de caché KV muy elevado; el despliegue con contexto completo requerirá GPUs de 80 GB (A100, H100) o configuraciones multi-GPU con paralelismo tensorial.
- GPU consumer: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3090 (24 GB) de forma ajustada. Para contextos largos se necesitaría cuantización, que no está publicada en el repositorio.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables de la misma categoría (multimodal de ~10 B con contexto de 1M) en la información proporcionada. La model card compara con Gemini 4 Carbon, Gemini 4 Argon, GPT-6 Astra, Claude Opus 5.5 y Claude Fable 5.1, pero se trata de referencias declaradas por el autor sin verificación independiente y con denominaciones que no corresponden a modelos públicos confirmados.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Genisi 5 Aether | 9,65 B | 1M (declarado) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las cifras de benchmarks y las comparaciones con modelos frontera proceden exclusivamente de la model card del autor y no se han verificado de forma independiente; deben tratarse como no confirmadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan sesgos conocidos, pero un modelo entrenado con datos no descritos puede reproducir sesgos lingüísticos y culturales, especialmente en dialectos árabes.
- Riesgo de alucinación inherente a los modelos generativos; la preservación de cadenas de pensamiento entre turnos puede amplificar errores arrastrados si el razonamiento inicial es incorrecto.
- No se detallan los datos de entrenamiento, por lo que no puede evaluarse la calidad ni la cobertura del corpus, ni posibles problemas de derechos de autor.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre el cumplimiento normativo en aplicaciones críticas.
- El soporte real de contexto de 1M tokens no está verificado; el rendimiento en contextos muy largos suele degradarse respecto a las cifras nominales.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- La arquitectura declarada (`qwen3_5`) y el pipeline multimodal no están documentados en detalle, lo que dificulta la reproducción y la auditoría técnica.

## Enlaces

- Hugging Face: https://huggingface.co/AnesNT2026/Genisi-5-Aether
- Repositorio de pesos: https://huggingface.co/AnesNT2026/Genisi-5-Aether/tree/main
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
