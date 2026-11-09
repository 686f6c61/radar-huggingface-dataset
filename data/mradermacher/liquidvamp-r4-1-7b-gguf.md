# mradermacher/LiquidVamp-R4-1.7B-GGUF

## Resumen

LiquidVamp-R4-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo WamphyreAI/LiquidVamp-R4-1.7B, un modelo de lenguaje de 1.728.801.600 parámetros (~1,7B) construido sobre la arquitectura LFM3 de Liquid AI. La cuantización la ha realizado mradermacher, un conocido creador de quants de la comunidad de Hugging Face, y ofrece un conjunto de ficheros estáticos en distintos niveles de compresión (desde Q2_K hasta f16) pensados para inferencia local con llama.cpp y herramientas compatibles.

El modelo base es un fine-tune de tipo LoRA sobre LFM3, etiquetado por su autor como "abliterated" (es decir, con las capas de rechazo neutralizadas), orientado a código y uso de herramientas (tool-use), y entrenado para conversación en inglés y español. La ficha del modelo base incluye las etiquetas `lfm3`, `code`, `tool-use`, `lora` y `experimental`, lo que indica que se trata de un experimento de la comunidad más que de un modelo de producción.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 1,7B en hardware de consumo (desde ~0,9 GB en Q2_K hasta ~3,6 GB en f16), con soporte declarado para Vulkan y endpoints compatibles. No obstante, no hay datos publicados de benchmarks ni documentación técnica detallada del proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (transformer, según etiqueta `lfm3` del modelo base; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 (~1,7B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, es |
| Licencia | lfm-open-license-v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bf16 |
| Tamano del repo | 15,9 GB (incluye todos los quants) |
| Cuantizacion con imatrix | no disponible (el autor indica que no hay quants ponderados/imatrix) |
| Fecha de creacion | 2026-11-08 |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3 de Liquid AI, según la etiqueta `lfm3` incluida en la model card. No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento en la documentación proporcionada. La model card del quant no incluye estos datos y la búsqueda web realizada no aporta documentación técnica adicional.

Lo que sí se puede afirmar a partir de las etiquetas y metadatos: el modelo base es un fine-tune LoRA sobre LFM3, con ajuste orientado a código y tool-use, y ha sido sometido a un proceso de "abliteration" (eliminación o neutralización de las capas de rechazo). El autor lo marca explícitamente como `experimental`. No hay información sobre si se aplicó RLHF, DPO u otras técnicas de alineación, ni sobre el volumen de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés y español.
- Generación y asistencia de código (etiqueta `code`).
- Uso de herramientas / function calling (etiqueta `tool-use`).
- Conversación multi-turno (etiqueta `conversational`).
- Comportamiento "abliterated": menor tendencia a rechazar peticiones, lo que cambia el perfil de seguridad del modelo.
- No hay evidencia de capacidades de visión, audio, thinking mode ni agentes multi-paso más allá de lo que implica el tool-use básico.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con Vulkan.

## Casos de uso

- Asistencia de código en local: con 1,7B de parámetros y cuants de ~1,2 GB (Q4_K_M), el modelo puede ejecutarse en portátiles para autocompletado, explicación de fragmentos y generación de tests sin conexión a la nube.
- Prototipado de agentes con tool calling: la etiqueta `tool-use` sugiere que puede emitir llamadas a funciones en formato estructurado, útil para construir prototipos de agentes ligeros en entornos con recursos limitados.
- Chat conversacional embebido: su tamaño permite integrarlo en aplicaciones de escritorio o móviles (vía llama.cpp) para asistentes conversacionales en inglés y español.
- Experimentación con modelos "abliterated": útil para investigadores que estudian el efecto de la eliminación de capas de rechazo en el comportamiento y la seguridad de modelos pequeños.
- Evaluación de cuantizaciones: el repositorio ofrece 12 niveles de cuantización, lo que permite medir el impacto de la compresión en calidad y velocidad sobre un mismo modelo base.
- Entornos con GPU integrada o Vulkan: la compatibilidad declarada con Vulkan permite desplegarlo en equipos sin CUDA, como portátiles con gráficas AMD o Intel.
- Filtrado y clasificación de texto ligera: para tareas de etiquetado o extracción simple donde la latencia y el coste importan más que la precisión máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. Añadir overhead de contexto y KV cache (no cuantificado en los datos disponibles).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para cuants bajos; RTX 3060/4060 o superiores para Q8_0 y f16 con contexto amplio. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y otros runners compatibles con GGUF. La etiqueta `vulkan` indica soporte para backend Vulkan en llama.cpp. No hay evidencia de soporte en vLLM o TGI para este modelo.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LiquidVamp-R4-1.7B-GGUF | ~1,7B | no disponible | lfm-open-license-v1.0 | GGUF | Fine-tune abliterated sobre LFM3, code y tool-use |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa generalista con licencia permisiva |
| Llama-3.2-1B-Instruct | ~1,2B | 128K (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo pequeño de Meta con contexto largo |
| SmolLM2-1.7B-Instruct | ~1,7B | 8K (según documentación pública de Hugging Face) | Apache 2.0 | safetensors, GGUF | Modelo pequeño abierto de Hugging Face |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentación pública habitual; no se dispone de benchmarks comparativos para LiquidVamp-R4-1.7B en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como `experimental` por el propio autor: no está pensado para producción sin validación previa.
- El proceso de "abliteration" elimina o reduce las capas de rechazo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; requiere filtros adicionales si se despliega de cara al usuario.
- Riesgo de alucinación inherente a un modelo de 1,7B: baja fiabilidad en tareas de conocimiento factual y razonamiento complejo.
- Idiomas limitados a inglés y español; no se garantiza calidad en otras lenguas.
- Longitud de contexto no documentada: no se debe asumir una ventana larga sin verificación empírica.
- Licencia lfm-open-license-v1.0 (etiquetada como `other`): es necesario revisar los términos del fichero LICENSE del modelo base antes de cualquier uso comercial; no es una licencia permisiva tipo Apache 2.0.
- No hay quants con imatrix/ponderados disponibles según el autor, lo que puede suponer una pérdida de calidad algo mayor en cuants bajos frente a alternativas ponderadas.
- Sin benchmarks publicados: no se puede comparar su rendimiento real con alternativas de forma objetiva.
- El repositorio ocupa 15,9 GB en total; conviene descargar solo el cuant necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LiquidVamp-R4-1.7B-GGUF
- Modelo base: https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B
- Página de descargas del autor: https://hf.tst.eu/model#LiquidVamp-R4-1.7B-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher/models
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
