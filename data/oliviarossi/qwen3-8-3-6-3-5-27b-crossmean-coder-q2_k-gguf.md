# OliviaRossi/Qwen3.8-3.6-3.5-27B-CrossMean-Coder-Q2_K-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de tipo Q2_K del modelo `OliviaRossi/Qwen3.8-3.6-3.5-27B-CrossMean-Coder`, un modelo multimodal (pipeline `image-text-to-text`) de 27.320.697.856 parámetros publicado por el usuario OliviaRossi. El nombre sugiere una fusión de pesos ("CrossMean", con la etiqueta `activation-aligned-merge`) derivada de las familias Qwen 3.5, 3.6 y 3.8, aunque la model card no documenta el procedimiento de merge ni los checkpoints de origen concretos. La conversión a GGUF se realizó con `llama.cpp` a través del espacio `GGUF-my-repo` de ggml.ai.

El interés práctico de esta ficha es que se trata de un artefacto de cuantización agresiva (Q2_K, aproximadamente 2 bits por peso) de un modelo de 27B con capacidades multimodales declaradas y orientación a "agentic coding". El repositorio ocupa 10,9 GB, lo que permite, en teoría, cargar un modelo de 27B en GPUs de consumo con 12-16 GB de VRAM, a costa de una pérdida de calidad notable frente a los pesos originales.

La información publicada es muy escasa: no hay detalles de arquitectura, contexto, datos de entrenamiento, idiomas ni benchmarks. Todo lo que sigue se limita a lo declarado en la model card, los metadatos de Hugging Face y las características conocidas del formato GGUF y de la cuantización Q2_K de `llama.cpp`. Cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre y las etiquetas sugieren un transformer multimodal derivado de Qwen 3.5/3.6/3.8; no confirmado) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero es solo un valor de ejemplo del servidor) |
| Tipos de cuantizacion | Q2_K (este repositorio); el repo base podría ofrecer otras, no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `qwen3.8-3.6-3.5-27b-crossmean-coder-q2_k.gguf`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base. Las etiquetas (`qwen3_5`, `qwen3.6`, `qwen3.8`, `crossmean`, `activation-aligned-merge`) apuntan a una fusión de pesos de varios modelos de la familia Qwen 3.x mediante alguna técnica de alineación de activaciones y media cruzada ("cross-mean"), pero el autor no documenta ni el método exacto, ni los checkpoints de origen, ni los hiperparámetros del merge. El pipeline declarado es `image-text-to-text`, por lo que el modelo base incorpora algún componente de visión, aunque no se especifica el codificador visual ni la resolución de imagen soportada.

Tampoco hay datos sobre el entrenamiento: número de tokens, composición del dataset, fases de SFT, RLHF o DPO, ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.). Esta ficha corresponde únicamente al artefacto cuantizado: la conversión a GGUF se hizo con `llama.cpp` mediante el espacio `GGUF-my-repo`, que aplica la cuantización K-quant Q2_K estándar (bloques de 256 pesos con escalas de superbloque, aproximadamente 2,6 bits efectivos por peso en las matrices lineales). El resultado es un fichero de 10,9 GB que reduce el peso del modelo original en más de un 75 % respecto a FP16.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base (no verificadas en esta cuantización).
- Generación de código: las etiquetas incluyen `agentic-coding`, lo que sugiere orientación a tareas de programación con agentes.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`.
- Compatibilidad con `llama.cpp` (CLI y servidor) y, por extensión, con el ecosistema GGUF (Ollama, LM Studio, etc., siempre que soporten la arquitectura subyacente).
- Tool calling / function calling: no disponible (no declarado).
- Modo "thinking" o razonamiento extendido: no disponible (no declarado).
- Capacidades multilingües: no disponible (no se listan idiomas).
- Soporte de audio: no disponible.

## Casos de uso

- Prototipado local de asistentes de código: cargar el GGUF Q2_K en una GPU de consumo o en CPU para probar flujos de generación de código y edición multiarchivo antes de pasar a una cuantización mayor o al modelo original en un servidor.
- Evaluación rápida de un merge experimental: dado que el modelo base es una fusión no documentada, esta cuantización sirve para hacer pruebas de humo (sanidad, coherencia, formato de salida) sin descargar los 50-60 GB que ocuparían los pesos en FP16.
- Despliegue en estaciones de trabajo sin GPU dedicada: con 10,9 GB de fichero, es viable ejecutarlo con `llama.cpp` en CPU (por ejemplo, con `llama-server`) para tareas de generación de texto offline donde la latencia no sea crítica.
- Pruebas de pipelines multimodales ligeros: al declarar `image-text-to-text`, puede usarse para validar la integración de entrada de imágenes en herramientas compatibles con GGUF multimodal, siempre que la versión de `llama.cpp` soporte la arquitectura concreta.
- Generación de documentación técnica y comentarios de código en local: útil en entornos con requisitos de privacidad donde no se quiere enviar código a APIs externas, aceptando la pérdida de calidad de Q2_K.
- Base para comparativas de cuantización: sirve como referencia de la degradación de calidad de Q2_K frente a Q4_K_M o Q8_0 del mismo modelo base, si el autor publica esas variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF pesa 10,9 GB; con overhead de contexto y caché KV, se necesitan aproximadamente 12-14 GB de VRAM para carga completa en GPU con contexto moderado (2K-4K tokens).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB, justo), A100/H100 para despliegues con contexto largo o concurrencia.
- GPU de consumo: sí, cabe en GPUs de 16 GB o más (RTX 4080, RTX 4060 Ti 16 GB, RTX 4070 Ti Super) y en algunas de 12 GB con contexto reducido y offload parcial a CPU.
- Despliegue: `llama.cpp` (CLI y servidor), Ollama y LM Studio si reconocen la arquitectura; vLLM y TGI no soportan GGUF de forma nativa para esta arquitectura (no confirmado).
- Latencia y throughput: no disponible. Como referencia orientativa, un modelo de 27B en Q2_K en una RTX 4090 suele moverse en decenas de tokens por segundo, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OliviaRossi/Qwen3.8-3.6-3.5-27B-CrossMean-Coder-Q2_K-GGUF | 27,3B | no disponible | GGUF Q2_K | apache-2.0 | Este artefacto; merge no documentado |
| OliviaRossi/Qwen3.8-3.6-3.5-27B-CrossMean-Coder | 27,3B | no disponible | safetensors (presumible) | apache-2.0 | Modelo base sin cuantizar |
| Qwen2.5-Coder-32B-Instruct (GGUF Q4_K_M) | 32,5B | 32.768 | GGUF | apache-2.0 | Alternativa consolidada para código; requiere ~20 GB |
| Qwen2.5-VL-32B-Instruct (GGUF) | ~32B | 32.768 | GGUF | apache-2.0 | Alternativa multimodal con documentación y benchmarks públicos |

La comparación es aproximada: no hay datos de rendimiento del modelo de OliviaRossi que permitan una comparación cuantitativa con alternativas consolidadas.

## Limitaciones y advertencias

- La cuantización Q2_K es agresiva (aproximadamente 2,6 bits efectivos por peso) y suele degradar de forma apreciable la coherencia, el razonamiento matemático y la fidelidad del código frente a Q4_K_M o Q8_0.
- El modelo base es un merge experimental sin model card detallada: no se conocen los checkpoints de origen, el método de fusión ni los datos de entrenamiento, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinación: no cuantificado; en cuantizaciones de 2 bits el riesgo tiende a aumentar.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento adecuado en castellano.
- Contexto máximo no declarado; el ejemplo de la model card usa `-c 2048`, que no debe interpretarse como el límite real del modelo.
- Compatibilidad: la arquitectura subyacente debe estar soportada por la versión de `llama.cpp` utilizada; las variantes multimodales de GGUF requieren builds recientes y, en ocasiones, ficheros de proyección adicionales que no se listan en este repositorio.
- Licencia apache-2.0 declarada, pero al ser un merge de modelos Qwen conviene verificar que las licencias de los modelos de origen permiten la redistribución y el uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OliviaRossi/Qwen3.8-3.6-3.5-27B-CrossMean-Coder-Q2_K-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8-3.6-3.5-27B-CrossMean-Coder
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
