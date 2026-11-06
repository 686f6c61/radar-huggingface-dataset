# credible-ai/olmo2-1B-288domains-vertex-linear-hellaswagpiqa

## Resumen

olmo2-1B-288domains-vertex-linear-hellaswagpiqa es un modelo de lenguaje de 1.414 millones de parámetros desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix (Data Mixing as Linear Domain Attribution). No es un modelo de propósito general: se trata de un checkpoint de 1B preentrenado sobre 32.000 millones de tokens extraídos del corpus WebOrganizer, con una mezcla de datos optimizada mediante LinMix para los benchmarks HellaSwag y PIQA sobre 288 dominios de tema × formato.

El modelo emplea la arquitectura OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y un tamaño de ocultación de 2048, y utiliza el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 tokens. Los pesos se distribuyen en bfloat16 y el entrenamiento se realizó con OLMo-core.

Su relevancia es metodológica más que práctica: sirve como referencia para estudiar cómo la atribución lineal de dominios permite optimizar mezclas de datos de preentrenamiento, y permite a investigadores reproducir los resultados del paper LinMix. La licencia MIT facilita su reutilización experimental, aunque su limitación a inglés y su falta de ajuste fino lo alejan de casos de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2, un transformer decoder-only con 18 capas y dimensión de ocultación de 2048, que da lugar a los 1,41B parámetros publicados. Utiliza el tokenizador de GPT-NeoX-20B (vocabulario de 50.432 tokens) y fue entrenado con la librería OLMo-core sobre 32.000 millones de tokens procedentes del corpus WebOrganizer/Corpus-200B, derivado a su vez del pool DCLM 1b-1x.

La innovación principal no reside en la arquitectura sino en la metodología de mezcla de datos: LinMix ajusta un sustituto lineal sobre un enjambre de modelos proxy (el checkpoint de 60M `credible-ai/olmo2-60M-288domains-vertex`) para atribuir la utilidad de cada uno de los 288 dominios tema × formato respecto a los benchmarks HellaSwag y PIQA, con utilidad lineal π (r = 0). El repositorio incluye el archivo `mix.json` con la mezcla de datos resultante. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base de lenguaje.
- Razonamiento de sentido común evaluable mediante HellaSwag y PIQA (objetivos de la optimización de mezcla).
- No dispone de ajuste fino por instrucciones ni de modo de razonamiento explícito (thinking mode).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés según la model card.
- Sin capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Reproducción de experimentos LinMix: cargar el checkpoint y el `mix.json` para replicar la atribución lineal de dominios sobre HellaSwag y PIQA, comparando con el proxy de 60M y con otras mezclas.
- Estudio de mezcla de datos de preentrenamiento: usar el modelo como referencia de 1B entrenado con una mezcla optimizada frente a mezclas uniformes o heurísticas sobre los 288 dominios.
- Investigación en atribución de dominios: analizar cómo las ponderaciones lineales de LinMix se traducen en mejoras medibles en benchmarks de sentido común.
- Evaluación de proxies pequeños: comparar el rendimiento del proxy de 60M con el modelo final de 1B para validar la transferibilidad de las mezclas optimizadas.
- Experimentos de scaling controlado: al compartir tokenizador, corpus y receta de entrenamiento, permite aislar el efecto del tamaño del modelo (60M frente a 1,41B) manteniendo la mezcla constante.
- Docencia y formación en data mixing: servir como ejemplo reproducible de pipeline completo (corpus tokenizado, mezcla optimizada, entrenamiento con OLMo-core) para cursos de investigación en LLM.
- Baseline en estudios de eficiencia de datos: medir cuánto rinde un modelo de 1,41B con solo 32B tokens cuando la mezcla está optimizada, frente a recetas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona HellaSwag y PIQA como objetivos de la optimización de la mezcla, pero no incluye cifras de rendimiento del modelo final.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV (el repositorio ocupa 2,8 GB).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 0,8 GB (estimaciones a partir del número de parámetros; no hay GGUF oficial publicado).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; también A100 y H100 para despliegues por lotes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 6 GB o más de VRAM.
- Opciones de despliegue: transformers (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI para servir en producción; llama.cpp y Ollama requerirían conversión a GGUF, no publicada oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| olmo2-1B-288domains-vertex-linear-hellaswagpiqa | 1,41B | no disponible | en | MIT | Artefacto de investigación LinMix |
| OLMo 2 1B (AllenAI) | ~1,2B | 4.096 tokens (referencia pública) | en | Apache 2.0 | Modelo base generalista con alineación posterior |
| credible-ai/olmo2-60M-288domains-vertex | ~60M | no disponible | en | no disponible en la información | Proxy usado para el enjambre LinMix |
| Modelos base de ~1B (p. ej. TinyLlama, Qwen2.5-1.5B) | 1,1-1,5B | 2.048-32.768 tokens | multilingüe | Apache 2.0 | Alternativas generalistas, no comparables en metodología de mezcla |

La comparación directa con modelos generalistas no es del todo justa: este checkpoint está diseñado para reproducir experimentos de mezcla de datos, no para competir en benchmarks generales. Los datos de contexto de OLMo 2 1B y de los modelos alternativos provienen de sus fichas públicas y no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card indica explícitamente que no es un modelo de lenguaje de propósito general.
- Entrenado solo con 32B tokens, muy por debajo de los presupuestos habituales de preentrenamiento, lo que limita su calidad en tareas abiertas.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Sin ajuste fino por instrucciones, RLHF ni DPO: no es adecuado para uso conversacional directo sin un post-entrenamiento adicional.
- Riesgo elevado de alucinación y de generación incoherente en dominios fuera de la distribución del corpus WebOrganizer.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Los datos de entrenamiento provienen de Common Crawl y están sujetos a sus términos de uso, además de posibles sesgos y contenido de baja calidad del corpus original.
- Licencia MIT para los pesos, pero el uso comercial debe considerar las condiciones del corpus DCLM (CC-BY-4.0) y de Common Crawl.
- No se han publicado benchmarks del modelo final; cualquier afirmación de rendimiento carece de respaldo numérico en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-vertex-linear-hellaswagpiqa
- Proxy de 60M: https://huggingface.co/credible-ai/olmo2-60M-288domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
