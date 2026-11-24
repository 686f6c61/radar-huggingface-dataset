# mradermacher/roleplay-no-system-GGUF

## Resumen

`mradermacher/roleplay-no-system-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo `thanhhau097/roleplay-no-system`, un ajuste fino (SFT) mediante LoRA sobre `mistralai/Mistral-Nemo-Instruct-2407`. El modelo resultante está orientado a roleplay conversacional y, según el nombre, prescinde de un turno de sistema explícito en el formato de diálogo. Lo publica mradermacher, un perfil conocido por generar cuantizaciones GGUF de modelos de terceros para su uso en llama.cpp y ecosistemas compatibles.

El modelo base subyacente es Mistral-Nemo-Instruct-2407, un transformer denso de aproximadamente 12.250 millones de parámetros (12,2 B), con una ventana de contexto nativa de 128.000 tokens según la documentación pública de Mistral AI. El ajuste fino se realizó con TRL y la técnica LoRA sobre dicho modelo, y los pesos resultantes se distribuyen aquí únicamente en formato GGUF (no hay safetensors en este repositorio, aunque el dato de parámetros se ha inferido del modelo base).

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de cuantización de un adaptador LoRA para uso local en consumer GPU; por otro, advierte de que la información publicada por el autor es muy escasa (sin benchmarks, sin licencia declarada, sin detalles del dataset de entrenamiento), por lo que cualquier evaluación de calidad debe hacerse empíricamente antes de llevarlo a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12.247.782.400 (12,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Mistral-Nemo-Instruct-2407; no verificada en este fine-tune) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); existen cuantizaciones imatrix en `mradermacher/roleplay-no-system-i1-GGUF` |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (11 ficheros, de 4,9 GB a 13,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune por SFT con LoRA sobre `mistralai/Mistral-Nemo-Instruct-2407`, que a su vez es un transformer denso decoder-only de 12,2 B parámetros con atención por ventanas deslizantes y contexto nativo de 128.000 tokens. El adaptador LoRA se ha fusionado (o se distribuye como base_model:adapter según los tags) para producir `thanhhau097/roleplay-no-system`, y mradermacher ha generado las cuantizaciones GGUF estáticas a partir de ese modelo fusionado.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni de innovaciones técnicas específicas del fine-tune. Los tags del repositorio indican únicamente `lora`, `sft`, `trl` y `conversational`. El nombre "no-system" sugiere que el formato de entrenamiento omite el rol de sistema en las conversaciones, lo cual es relevante para el prompting en producción.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay.
- Diálogo sin turno de sistema explícito (formato "no-system"), pensado para plantillas que inician directamente con el turno de usuario.
- Razonamiento básico y respuesta a instrucciones heredadas de Mistral-Nemo-Instruct-2407.
- Capacidades multilingües limitadas: el modelo está etiquetado únicamente como `en`, aunque el base Mistral-Nemo soporta varios idiomas; no hay evidencia de que el fine-tune preserve ese multilingüismo.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en este fine-tune concreto.
- No se ha documentado soporte de decodificación especulativa ni de atención lineal específica del fine-tune.

## Casos de uso

- Roleplay conversacional local: el modelo está entrenado específicamente para mantener personajes y turnos de diálogo sin instrucciones de sistema, por lo que encaja en aplicaciones de entretenimiento, juegos de rol por texto o chatbots de personaje que se inicializan directamente con el primer mensaje del usuario.
- Prototipado de chatbots de personaje en consumer GPU: con la cuantización Q4_K_M (7,6 GB) cabe en GPUs de 8-12 GB de VRAM, lo que permite iterar localmente sin coste de API.
- Evaluación de formatos de prompt sin system: útil para comparar el comportamiento del modelo frente a variantes con system prompt en tareas de consistencia de personaje.
- Generación de narrativa interactiva: la ventana de contexto heredada (hasta 128k tokens en el base) permite mantener historiales largos de conversación, aunque la calidad en contextos muy largos no está verificada para este fine-tune.
- Filtrado y generación de diálogos sintéticos en inglés para datasets de roleplay: el modelo puede usarse para producir turnos de conversación etiquetados por personaje.
- Despliegue en entornos sin GPU dedicada: las cuantizaciones Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten ejecución en CPU con llama.cpp u Ollama, a costa de degradación de calidad.
- Investigación sobre robustez de fine-tunes LoRA: al ser un adaptador pequeño sobre un base conocido, sirve como caso de estudio de cómo el SFT altera el comportamiento conversacional sin modificar la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~5-6 GB, Q3_K_M ~7 GB, Q4_K_M ~8-9 GB, Q5_K_M ~10 GB, Q6_K ~11-12 GB, Q8_0 ~14-15 GB. El overhead de KV cache crece con la longitud de contexto; para 8k tokens puede añadir 1-2 GB adicionales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090 para cuantizaciones Q4-Q8; A100/H100 solo si se necesita contexto muy largo o throughput alto.
- Cabe en consumer GPU: sí, en cualquier GPU con 8 GB o más usando Q4_K_S/Q4_K_M; en 6 GB solo con Q2_K/Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors, no incluido en este repo).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Como referencia cualitativa, Q4_K_M es la opción marcada como "fast, recommended" por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| roleplay-no-system (este) | 12,2 B | 128k (heredado) | no disponible | GGUF | Fine-tune LoRA de roleplay sin system prompt |
| mistralai/Mistral-Nemo-Instruct-2407 | 12,2 B | 128k | Apache 2.0 | safetensors, GGUF | Modelo base; instrucciones generales, no específico de roleplay |
| mradermacher/Mistral-Nemo-Instruct-2407-GGUF | 12,2 B | 128k | Apache 2.0 | GGUF | Cuantización del base, sin fine-tune de roleplay |
| Modelos de roleplay de 7-13 B (p. ej. variantes de Mistral/Llama 2) | 7-13 B | 4k-32k | variable | GGUF | Alternativas de la misma categoría; calidad variable y sin benchmarks públicos comparables |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin verificar la licencia del modelo base (Mistral-Nemo-Instruct-2407 es Apache 2.0) y del fine-tune (no disponible). Contactar con el autor antes de uso comercial.
- Sin benchmarks ni evaluación publicada: la calidad del fine-tune no está cuantificada; el rendimiento en tareas distintas del roleplay es incierto.
- Idioma: etiquetado solo como `en`; el rendimiento en castellano no está verificado y probablemente sea inferior al del base.
- Riesgo de alucinación: inherente a los modelos de 12 B; mayor en roleplay por la naturaleza creativa del entrenamiento.
- Sesgos: no documentados; el dataset de SFT no es público, por lo que no se puede auditar su composición.
- Contexto: aunque el base soporta 128k, el fine-tune puede degradarse en contextos muy largos; no hay validación publicada.
- Formato "no-system": si se usa con una plantilla que incluye system prompt, el comportamiento puede desviarse del entrenamiento.
- Repositorio de 84,7 GB: descargar solo la cuantización necesaria; las cuantizaciones Q2/Q3 tienen degradación notable de calidad.
- Fecha de actualización del repo (2026-11-24) posterior a la de creación; verificar integridad de los ficheros descargados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/roleplay-no-system-GGUF
- Modelo base del fine-tune: https://huggingface.co/thanhhau097/roleplay-no-system
- Modelo base original: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/roleplay-no-system-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#roleplay-no-system-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
