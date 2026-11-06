# s7a8m6/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador visual, publicado en el repositorio de Hugging Face `s7a8m6/Qwen3.8-27B`. Según la model card, forma parte de la familia Qwen3.8 y se presenta como un modelo denso de 27 000 millones de parámetros, nativo multimodal (imagen y vídeo) y orientado a tareas agénticas de largo horizonte, coding y trabajo profesional. La arquitectura se apoya en la base de Qwen3.5 e incorpora un diseño híbrido con capas Gated DeltaNet (atención lineal) intercaladas con capas de Gated Attention.

El modelo declara 27 781 427 952 parámetros reales según los pesos en safetensors, una dimensión oculta de 5120, 64 capas y un contexto nativo de 262 144 tokens, extensible hasta 1 000 000. Incluye control flexible de razonamiento (`reasoning_effort`, `preserve_thinking`) y entrenamiento con Multi-Token Prediction (MTP). El repositorio ocupa 55,6 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, describe las capacidades declaradas por el autor; por otro, conviene señalar que el repositorio no presenta descargas ni likes, no declara idiomas soportados y la model card incluye afirmaciones y enlaces (Qwen Cloud, comparativas con modelos como Opus4.6 Max o Muse Glimmer-30B) que no pueden verificarse de forma independiente con la información disponible. El lector debe tratar los datos de benchmarks como declaraciones del autor, no como resultados auditados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet (atención lineal) + Gated Attention; 64 capas con layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27 781 427 952 (27B declarados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

Otros datos técnicos declarados: hidden dimension 5120; token embedding 248 320 (padded); Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y RoPE de 64 dimensiones; FFN con dimensión intermedia 17 408; LM output 248 320 (padded); MTP entrenado con múltiples pasos.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con codificador visual y un patrón híbrido poco habitual: por cada bloque de cuatro subcapas, tres usan Gated DeltaNet (una forma de atención lineal con estado recurrente) y una usa Gated Attention clásica con RoPE. Este diseño busca reducir el coste computacional y de memoria en contextos muy largos manteniendo la capacidad de atención global en puntos clave de la red. La inclusión de Multi-Token Prediction (MTP) durante el entrenamiento habilita decodificación especulativa y puede mejorar el throughput en inferencia.

La model card indica que el modelo ha pasado por pre-entrenamiento y post-entrenamiento, pero no especifica el número de tokens, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla el proceso de entrenamiento del codificador visual ni la resolución o duración máxima de vídeo soportada. Estas ausencias impiden evaluar la calidad y procedencia de los datos de entrenamiento.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora según la model card.
- Coding y tareas de terminal agénticas (benchmark Terminal Bench 2.1 declarado).
- Ejecución agéntica autónoma: planificación, manejo de feedback del entorno y finalización de tareas multi-paso.
- Compatibilidad con harnesses y herramientas de desarrollo populares, según el autor.
- Soporte de tool calling / function calling: la model card menciona "official built-in tools" en la versión alojada, pero no detalla el formato en la versión open weights.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Decodificación especulativa habilitada por MTP.

## Casos de uso

- Atención al cliente automatizada: con 262 144 tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno con historiales extensos y documentos adjuntos sin truncamiento agresivo, aunque la ausencia de idiomas declarados obliga a validar el rendimiento en castellano antes de producción.
- Análisis de documentos técnicos y diagramas STEM: el codificador visual permite extraer información de figuras, tablas y esquemas en informes de ingeniería o papers, combinándolo con razonamiento textual en la misma ventana.
- Revisión de vídeos largos: la capacidad declarada de procesar vídeos de hasta una hora encaja en tareas de resumen de reuniones, auditoría de grabaciones o extracción de eventos en material audiovisual.
- Agentes de coding en terminal: el rendimiento declarado en Terminal Bench 2.1 y el soporte de harnesses sugieren su uso en pipelines de CI/CD donde el modelo ejecuta comandos, interpreta errores y aplica parches de forma iterativa.
- Investigación asistida: con contexto extensible a 1M tokens, puede ingerir corpus de documentación o múltiples papers y realizar síntesis comparativas, siempre con verificación humana por el riesgo de alucinación.
- Automatización de flujos profesionales multi-paso: tareas de back-office que requieren planificación, llamadas a herramientas y manejo de feedback del entorno, aprovechando el modo agéntico y el control de `reasoning_effort` para ajustar coste y latencia.
- Procesamiento batch de documentación multimodal: extracción estructurada de datos de facturas, formularios o informes escaneados combinando visión y generación de texto en un único modelo.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorías de Coding (Terminal Bench 2.1 / Terminus) y otras. Sin embargo, en la información proporcionada los valores numéricos de las celdas aparecen truncados y no es posible extraer cifras fiables. No se han podido verificar resultados completos de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible (valor truncado en la fuente) | No disponible | No disponible | No disponible | No disponible |
| Resto de benchmarks de la tabla | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos (27,78B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 64-80 GB de VRAM para contexto moderado.
- En cuantización de 8 bits: en torno a 28-30 GB de pesos, viable en GPUs de 40-48 GB (A100 40GB, L40S 48GB) con contexto reducido.
- En cuantización de 4 bits: en torno a 14-16 GB de pesos, potencialmente ejecutable en RTX 4090 (24 GB) con contexto limitado; no se confirman variantes GGUF/AWQ/GPTQ publicadas en el repositorio.
- GPUs recomendadas para BF16: H100 80GB, A100 80GB, o múltiples GPUs con tensor parallelism (por ejemplo, 2× A100 40GB o 2× RTX 4090 con limitaciones de contexto).
- Consumer GPU: solo viable con cuantización agresiva (4 bits) y contexto recortado; el contexto nativo de 262K difícilmente cabe en una sola GPU consumer.
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (denso) | 262 144 nativo / 1M extensible | Texto + imagen + vídeo | Apache 2.0 | Pesos en HF (repo con 0 descargas) |
| Qwen3.6-27B | 27B (declarado en la tabla del autor) | No disponible | No disponible | No disponible | Referenciado en la model card |
| Muse Glimmer-30B | 30B (por nombre) | No disponible | No disponible | No disponible | Referenciado en la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Referenciado; posiblemente servicio propietario |

La comparación se limita a los nombres y tamaños citados por el autor; no hay datos verificables de rendimiento, licencia ni disponibilidad de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio presenta 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03), lo que impide validar su uso real en la comunidad.
- La model card incluye enlaces y afirmaciones comerciales (Qwen Cloud, disponibilidad "coming soon") y comparativas con modelos no verificables; deben tratarse con cautela.
- No se declaran idiomas soportados, por lo que el rendimiento en castellano es desconocido y requiere evaluación propia.
- No se detallan datos de entrenamiento, composición del dataset ni técnicas de alineamiento (RLHF/DPO), lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación inherente a modelos de 27B en tareas de razonamiento largo y agentes autónomos; se recomienda verificación humana en flujos críticos.
- La licencia Apache 2.0 permite uso comercial, pero al no poder confirmarse la procedencia real de los pesos ni la autoría (el autor del repo, `s7a8m6`, no coincide con el organizador oficial Qwen), existe riesgo de que se trate de una publicación no oficial; verificar antes de desplegar en producción.
- El contexto extensible a 1M tokens no está garantizado en la versión open weights; la model card lo menciona explícitamente para la versión alojada en Qwen Cloud.
- No se confirman cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware consumer.
- El soporte de tool calling en la versión open weights no está documentado con formato ni ejemplos.

## Enlaces

- Hugging Face: https://huggingface.co/s7a8m6/Qwen3.8-27B
- Qwen Cloud (modelo alojado, según model card): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio): https://www.qwencloud.com
- No se han encontrado en la información proporcionada papers, repositorios de código ni demos adicionales verificables.
