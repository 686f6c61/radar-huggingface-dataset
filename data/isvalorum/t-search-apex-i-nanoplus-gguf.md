# IsValorum/T-Search-APEX-I-NanoPlus-GGUF

## Resumen

T-Search APEX-I-NanoPlus GGUF es una cuantización GGUF del modelo t-tech/T-Search, publicada por IsValorum (autor independiente especializado en builds GGUF de precisión mixta). El modelo base es un transformer MoE híbrido de unas 40 capas con atención lineal recurrente (DeltaNet) combinada con capas periódicas de atención completa, y un bloque MTP (multi-token prediction) integrado para decodificación especulativa.

El dato verificado de parámetros totales es 35.505.251.456 (unos 35,5 B). La model card documenta con detalle el mapa de cuantización a nivel de tensor (753 tensores auditados), pero no aporta información sobre longitud de contexto, número de expertos activos, datos de entrenamiento ni resultados de benchmarks.

La relevancia de esta build es práctica: comprime el modelo hasta un envoltorio de aproximadamente 12,55 GB de pesos (13,6 GB en el repositorio) mediante una mezcla de precisión por tipo de tensor, manteniendo en F32 routers de expertos, normalizaciones y parámetros de estado recurrente SSM. Esto permite ejecutarlo en GPU de consumo y con streaming desde RAM del sistema en llama.cpp. La licencia es Apache 2.0 y cubre 13 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención lineal recurrente (DeltaNet) y 10 capas de atención completa periódica; bloque MTP integrado (capa 40) |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible (MoE con 256 micro-expertos y expertos compartidos; la model card no indica el número de expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla personalizada por tensor: F32, Q8_0, Q6_K, Q4_K, Q4_0, Q3_K, IQ3_XXS, IQ2_S, IQ2_XXS |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | t-tech/T-Search (relación: quantized) |
| Autor de la cuantizacion | IsValorum |
| Tamano del repositorio | 13,6 GB (~12,55 GB de envoltorio de pesos según la model card) |
| Tensores auditados | 753 / 753 (mapa completo en `tensor-map.tsv`) |
| Fecha de publicacion | 2026-10-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card permite reconstruir la topología del modelo a partir del mapa de tensores: 40 capas más un bloque MTP adicional (`blk.40`, con `nextn.eh_proj` y proyecciones de atención propias). Cada capa combina componentes de atención lineal y SSM (`attn_qkv`, `ssm_alpha`, `ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_beta`, `ssm_out`) con 30 capas híbridas que incorporan `attn_gate`. La atención cuadrática completa aparece de forma periódica en 10 capas ancla (bloques 3, 7, 11, ...), presumiblemente para recuperación profunda en contexto largo. El FFN es MoE con 256 micro-expertos y un router (`ffn_gate_inp`) por capa, más un conjunto de expertos compartidos (`ffn_{gate,down,up}_shexp`) activos en todas las capas.

El bloque MTP (multi-token prediction) está diseñado para decodificación especulativa: predice tokens borrador que luego se validan, lo que encaja con el soporte de decodificación especulativa de llama.cpp. No hay información en la documentación proporcionada sobre volumen de tokens de entrenamiento, composición del dataset, proceso de alineación (RLHF/DPO), ni sobre la innovación concreta del modelo base más allá de lo que revela su arquitectura. Los tags del repositorio (`reasoning`, `retrieval`, `search-agent`) apuntan a un ajuste orientado a razonamiento y recuperación de información, pero no se documenta el método.

La cuantización en sí es la aportación técnica del autor: asigna precisión por función del tensor, no por capa. Routers, normalizaciones y escalas SSM quedan en F32; la cabeza de salida y las proyecciones de salida de atención completa en Q6_K; el backbone de expertos compartidos y las proyecciones de atención completa en Q4_K; y los expertos enrutados se comprimen de forma agresiva (IQ3_XXS en `ffn_down_exps`, IQ2_S en `ffn_gate_exps` de las capas 2-37 y en `ffn_up_exps` de las capas 2-15, IQ2_XXS en `ffn_up_exps` de las capas 16-37, a 2,06 bpw). El objetivo declarado es un sobre de 12,55 GB con ejecución SIMD AVX2 sin bloqueos durante el streaming desde RAM.

## Capacidades

- Generación de texto conversacional y continuada (`pipeline_tag: text-generation`).
- Razonamiento explícito: el repositorio incluye el tag `reasoning`, aunque la model card no detalla si existe un modo de pensamiento separado ni cómo se activa.
- Recuperación de información y uso como agente de búsqueda (`retrieval`, `search-agent`): la arquitectura reserva 10 capas de atención completa como anclas para recuperación en contexto largo.
- Decodificación especulativa mediante el bloque MTP integrado, compatible con el mecanismo nativo de llama.cpp.
- Multilingüismo declarado en 13 idiomas, incluidos español, chino, japonés, coreano, árabe y tailandés.
- Soporte de tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Capacidades multimodales: el tag `multimodal` aparece en los metadatos, pero la model card no documenta torre de visión, procesador de imágenes ni plantilla multimodal para el GGUF; no debe asumirse su funcionamiento en llama.cpp.
- Ejecución eficiente en CPU y en configuraciones híbridas GPU/CPU gracias al diseño de cuantización orientado a AVX2.

## Casos de uso

- Agentes de búsqueda y recuperación documental: el modelo puede encadenar consultas, leer pasajes recuperados y sintetizar respuestas; las 10 capas de atención completa en Q4_K/Q6_K están preservadas precisamente para mantener el rendimiento de needle-in-a-haystack en contextos largos.
- Asistente técnico multi-turno en local: con 13,6 GB de pesos puede desplegarse en una estación de trabajo con una sola GPU de 24 GB y mantener conversaciones largas sin coste por token de API.
- Búsqueda semántica sobre corpus internos (documentación de producto, normativa, tickets): combinado con un motor de recuperación externo, el modelo reformula consultas y genera respuestas citando el material recuperado, con la ventaja de que los datos no salen de la infraestructura.
- Atención al cliente multilingüe: los 13 idiomas declarados permiten atender consultas en español, inglés, portugués, francés, árabe o japonés con un único despliegue, reduciendo el número de modelos en producción.
- Generación de código asistida en entornos con requisitos de soberanía del dato: el modelo puede integrarse en un servidor llama.cpp interno para autocompletado y explicación de código sin enviar repositorios a terceros.
- Prototipado e investigación de arquitecturas híbridas: al estar el mapa de tensores completamente auditado y adjunto (`tensor-map.tsv`), sirve como banco de pruebas para estudiar el impacto de la cuantización selectiva en capas MoE frente a capas de atención.
- Inferencia en hardware modesto con offload parcial: el diseño prioriza la ejecución lineal en CPU durante el streaming desde RAM, lo que permite servir el modelo en servidores sin GPU dedicada a cambio de mayor latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única información cuantitativa del repositorio es el mapa de cuantización (bits por peso por grupo de tensores) y el tamaño del envoltorio de pesos. No hay datos de MMLU, HumanEval, GSM8K ni de degradación respecto al modelo base t-tech/T-Search.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos de aproximadamente 13,6 GB; a ello hay que sumar la caché KV, cuyo tamaño depende de una longitud de contexto no documentada. Como referencia conservadora, entre 16 y 20 GB en total para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) para carga completa; A100 40 GB u 80 GB y H100 para servicio concurrente con contextos largos.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con holgura; en 16 GB (RTX 4080, 4060 Ti 16 GB) requiere reducir contexto o descargar parte de las capas a CPU. En 12 GB solo es viable con offload mayoritario a RAM del sistema.
- Despliegue: llama.cpp es la vía de referencia (formato GGUF y decodificación especulativa vía MTP); Ollama y LM Studio como envoltorios derivados. vLLM y TGI no consumen GGUF de forma nativa: para esos motores habría que usar los pesos safetensors del modelo base t-tech/T-Search.
- Latencia y throughput: no disponible. La model card menciona explícitamente la ausencia de bloqueos SIMD AVX2 en streaming desde RAM como objetivo de diseño, lo que sugiere un escenario de ejecución parcial en CPU, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Peso en disco | Notas |
|---|---|---|---|---|---|---|
| T-Search APEX-I-NanoPlus GGUF | 35,5 B totales; activos no disponible | no disponible | GGUF, mezcla IQ2-IQ3-Q4-Q6-F32 | Apache 2.0 | 13,6 GB | Build de IsValorum; sin benchmarks publicados; 0 descargas |
| t-tech/T-Search (modelo base) | 35,5 B totales; activos no disponible | no disponible | safetensors (precisión original no documentada) | Apache 2.0 | no disponible | Referencia de calidad; requiere mucha más VRAM |
| Alternativas de categoría similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado especificaciones verificadas de otros modelos comparables |

No se dispone de datos de rendimiento del modelo base ni de otras builds del mismo modelo en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad. La comparación relevante es de compromiso: esta build reduce el peso a aproximadamente 12,55 GB a costa de comprimir los expertos enrutados hasta 2,06-2,50 bpw, mientras el modelo base conserva la precisión original con un requisito de VRAM muy superior.

## Limitaciones y advertencias

- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, y la publicación es reciente. No existe evidencia independiente de la calidad de esta build concreta.
- Cuantización agresiva en el núcleo MoE: `ffn_up_exps` de las capas 16-37 se comprime a IQ2_XXS (2,06 bpw) y el gating de las capas 2-37 a IQ2_S (2,50 bpw). Es esperable cierta degradación en tareas de razonamiento matemático y código de alta dificultad, aunque no se han publicado mediciones.
- Ausencia total de benchmarks: no hay forma de saber cuánto se pierde respecto al modelo base. Cualquier decisión de producción debería ir precedida de una evaluación propia frente a los safetensors originales.
- Longitud de contexto desconocida: impide dimensionar la caché KV y planificar despliegues con contextos largos, que es precisamente el caso de uso declarado (retrieval y search-agent).
- Multimodalidad no confirmada: el tag `multimodal` figura en los metadatos, pero la model card no documenta ninguna torre de visión ni plantilla multimodal, y llama.cpp no soporta de forma genérica estos componentes.
- Riesgo de alucinación: no evaluado. Los modelos orientados a recuperación pueden generar citas o pasajes inexistentes si el contexto recuperado es insuficiente.
- Sesgos: no documentados. No hay información sobre composición del dataset de entrenamiento ni sobre evaluación de sesgos en 13 idiomas, algunos con cobertura potencialmente baja.
- Idiomas: aunque se declaran 13, no se especifica el nivel de competencia por idioma; es razonable esperar un rendimiento inferior en tailandés, vietnamita o árabe que en inglés o chino.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar de forma independiente la licencia y las condiciones del modelo base t-tech/T-Search antes de un despliegue productivo.
- Tool calling y agentes: no documentado. No debe asumirse compatibilidad con plantillas de function calling sin verificación empírica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/T-Search-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/t-tech/T-Search
- Mapa de tensores auditado: `tensor-map.tsv` dentro del repositorio anterior
- Soporte del autor (Ko-fi): https://ko-fi.com/isvalorum
- Espacio de peticiones de cuantización del autor: https://huggingface.co/spaces/IsValorum/MiniPlus-NanoPlus-Requests
- llama.cpp (runtime de referencia para GGUF): https://github.com/ggml-org/llama.cpp
- Papers, blogs o demos del modelo base: no disponible en la informacion proporcionada.
