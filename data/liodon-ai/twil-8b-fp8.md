# liodon-ai/TwIL-8B-FP8

## Resumen

TwIL-8B-FP8 es una cuantización en FP8 del modelo de generación de texto webAI-Official/TwIL-8B, publicada por Liodon AI. El modelo original cuenta con 8.791.592.960 parámetros (aproximadamente 8,8 mil millones) y está etiquetado en Hugging Face con la arquitectura `granite`, lo que lo vincula a la familia de modelos Granite de IBM. La versión FP8 reduce el peso de los pesos de 35,2 GB a 9,6 GB, manteniendo la misma estructura de parámetros.

El interés de esta ficha radica en que se trata de una cuantización de precisión de 8 bits en formato de coma flotante (E4M3) con esquema dinámico, publicada mediante la herramienta llm-compressor del ecosistema vLLM. Este tipo de cuantización está pensada para servir el modelo en GPUs con capacidad de cómputo igual o superior a 8.9 (Ada, Hopper, Blackwell), lo que incluye desde tarjetas de consumo como la RTX 4090 hasta aceleradores de centro de datos como H100 o B200.

La relevancia práctica del modelo es doble: por un lado, permite ejecutar un modelo de casi 9 mil millones de parámetros en hardware relativamente modesto con una pérdida de calidad mínima, ya que el esquema FP8_DYNAMIC no requiere dataset de calibración; por otro, la integración con vLLM, TGI y SGLang facilita su despliegue en entornos de producción. No obstante, la información pública sobre el modelo base (idiomas, contexto, datos de entrenamiento, benchmarks) es muy escasa, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Granite (según tag `granite` de Hugging Face) |
| Parametros totales | 8.791.592.960 (8,8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 E4M3 (esquema FP8_DYNAMIC de llm-compressor): pesos por canal, activaciones dinámicas por token; `lm_head` sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base TwIL-8B pertenece a la familia Granite según la etiqueta de Hugging Face, lo que sugiere una arquitectura transformer decoder-only con las innovaciones típicas de esta familia (atención multi-cabeza estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios). Sin embargo, la model card del repositorio FP8 no detalla la arquitectura interna, el número de capas, la dimensión oculta ni la configuración de cabezas de atención, por lo que estos datos deben considerarse no disponibles.

En cuanto al entrenamiento del modelo original, no se proporciona información sobre el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o SFT. La model card de la cuantización se limita a indicar que se ha aplicado el esquema FP8_DYNAMIC de llm-compressor: los pesos se convierten a FP8 E4M3 por canal de forma anticipada y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. La innovación técnica destacable de esta versión es precisamente la ausencia de dataset de calibración, lo que evita sesgos introducidos por el conjunto de calibración y hace que los pesos cuantizados sean numéricamente una conversión directa del original. La capa `lm_head` se deja sin cuantizar, práctica estándar para preservar la calidad de la distribución de salida.

## Capacidades

- Generación de texto conversacional: etiquetado como `conversational` y `text-generation`, orientado a diálogo multi-turno.
- Razonamiento y generación de código: capacidades heredadas del modelo base Granite, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo no declara idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de la infraestructura de endpoints de Hugging Face.

## Casos de uso

- Servicio de chat conversacional de bajo coste: el modelo puede desplegarse con vLLM o TGI en una única GPU con capacidad de cómputo ≥ 8.9 y ofrecer respuestas multi-turno; el tamaño cuantizado de 9,6 GB permite alojarlo en GPUs de 16-24 GB de VRAM sin necesidad de múltiples aceleradores.
- Asistente interno para equipos de desarrollo: al heredar la naturaleza conversacional del modelo base, puede integrarse en herramientas de documentación o soporte técnico, aunque la ausencia de datos sobre tool calling obliga a validar esa funcionalidad antes de usarla en pipelines automatizados.
- Generación de texto en entornos con restricciones de memoria: en despliegues edge o en servidores con GPUs Ada de gama media (L4, L40S, RTX 4090), la versión FP8 ofrece una reducción de memoria de aproximadamente 3,7 veces respecto al modelo original (35,2 GB → 9,6 GB), lo que facilita la cohabitación con otros servicios en la misma GPU.
- Prototipado rápido de aplicaciones de lenguaje: gracias a la compatibilidad con SGLang, TGI y vLLM y a la ausencia de calibración en la cuantización, el modelo puede servir como base para experimentos de prompting y evaluación sin necesidad de infraestructura de gran escala.
- Evaluación comparativa de recetas de cuantización: investigadores que estudian el impacto de FP8 frente a BF16 pueden usar este repositorio como referencia, ya que los pesos son una conversión directa del original y el `lm_head` permanece intacto, lo que aísla el efecto de la cuantización en el resto del cuerpo del modelo.
- Fine-tuning ligero sobre la versión cuantizada: aunque no se documenta soporte explícito, el formato compressed-tensors y la integración con el ecosistema vLLM permiten explorar adaptaciones (por ejemplo, LoRA) sobre la versión FP8 en flujos de trabajo que ya usan llm-compressor, siempre que se valide la compatibilidad con la herramienta de entrenamiento elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,6 GB solo para los pesos en FP8; con caché KV y overhead del runtime, se recomienda planificar entre 12 y 16 GB de VRAM para contextos moderados.
- GPUs recomendadas: cualquier NVIDIA con capacidad de cómputo ≥ 8.9, es decir, Ada (RTX 40-series, L4, L40S), Hopper (H100, H200) y Blackwell (B100, B200, GB10). En GPUs anteriores, vLLM y TGI descomprimen el modelo a un formato de mayor precisión, lo que anula la ventaja de velocidad y memoria.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 4080 (16 GB) con margen para caché KV; en GPUs de 12 GB el margen es muy ajustado y depende de la longitud de contexto.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/TwIL-8B-FP8`), Text Generation Inference (imagen `ghcr.io/huggingface/text-generation-inference`) y SGLang (`python -m sglang.launch_server --model-path liodon-ai/TwIL-8B-FP8`).
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card no incluye métricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwIL-8B-FP8 (este) | 8,79 mil millones | No disponible | FP8 E4M3 dinámica | other | Hugging Face, 35 descargas |
| webAI-Official/TwIL-8B (base) | 8,79 mil millones | No disponible | BF16/FP16 (35,2 GB) | other | Hugging Face |
| Modelos Granite de IBM de tamaño similar | No disponible | No disponible | Múltiples | No disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos densos de 8-9 mil millones de parámetros) no puede completarse con datos verificables: no se dispone de información sobre benchmarks del modelo base ni de sus competidores directos en la documentación proporcionada. La única comparación sólida es con el propio modelo original, del que esta versión reduce el tamaño en disco de 35,2 GB a 9,6 GB manteniendo el mismo número de parámetros.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos de uso comercial; es imprescindible consultar la licencia del modelo base webAI-Official/TwIL-8B antes de cualquier despliegue en producción.
- Idiomas soportados no declarados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del inglés sin evaluación empírica previa.
- Longitud de contexto desconocida: la ausencia de este dato impide planificar aplicaciones que dependan de ventanas largas (documentos extensos, conversaciones prolongadas).
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas ni datos de evaluación de fidelidad.
- Sesgos: no se proporciona información sobre la composición del dataset de entrenamiento ni sobre análisis de sesgos del modelo base.
- Dependencia de hardware: la ventaja de FP8 solo se materializa en GPUs con compute capability ≥ 8.9; en hardware anterior el modelo se descomprime y pierde el beneficio de memoria y velocidad.
- Madurez del repositorio: 35 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas documentadas, lo que limita la evidencia de robustez en producción.
- Precisión de la cuantización: aunque el esquema dinámico evita sesgo de calibración, la conversión a FP8 puede degradar ligeramente tareas sensibles a la precisión numérica; se recomienda validar con un conjunto de evaluación propio antes de sustituir el modelo BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/TwIL-8B-FP8
- Modelo base: https://huggingface.co/webAI-Official/TwIL-8B
- Organización Liodon AI: https://huggingface.co/liodon-ai
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- SGLang: https://github.com/sgl-project/sglang
