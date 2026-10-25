# Jakemu/Qwen3.5-27B-int8-g128-mtp

## Resumen

Qwen3.5-27B-int8-g128-mtp es una redistribución cuantizada del modelo de texto Qwen3.5-27B, publicada por el desarrollador independiente Jakemu el 25 de octubre de 2026. Empaqueta en un único artefacto los shards del modelo objetivo en INT8 weight-only —idénticos a los de Jakemu/Qwen3.5-27B-int8-g128— junto con la cabeza MTP (multi-token prediction) también cuantizada en INT8, de forma que la decodificación especulativa puede ejecutarse sin descargar el checkpoint BF16 original ni un MTP separado.

La relevancia es práctica: el repositorio ocupa 30,3 GB y la validación del autor reporta un pico de 29,90 GiB de memoria GPU en una A100-SXM4-40GB, frente a los aproximadamente 54 GB que ocuparían los pesos en BF16 para 27 000 millones de parámetros. El precio que se paga es que no es un checkpoint estándar de Transformers: exige el cargador propio del proyecto infer-opt (commit eaa6d3551670) y kernels fla-delta, y la torre de visión se ha eliminado, por lo que el artefacto es exclusivamente de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (modelo base Qwen3.5-27B); el checkpoint conserva «delta-rule gates» y el cargador emplea kernels `fla-delta`, lo que apunta a componentes de atención lineal con regla delta, sin confirmación del autor |
| Parámetros totales | 27 000 millones (según el nombre del checkpoint; el autor no publica desglose por capas) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 weight-only, simétrica absmax con grupos de 128 y escalas BF16; embeddings, normalizaciones, compuertas delta pequeñas y `lm_head` compartido permanecen en BF16 |
| Idiomas soportados | No disponible; la validación de release incluye prosa, matemáticas y coreano, además de la plantilla de chat del modelo base |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con disposición propia del formato «infer-opt» (no es un `AutoModelForCausalLM` de Transformers); repositorio de 30,3 GB |
| Cabeza MTP | Incluida; 8 capas lineales en INT8 y 23 tensores empaquetados, con coincidencia exacta de logits frente al flujo original attach-and-quantize |
| Visión | No incluida (torre de visión omitida) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: es un artefacto de cuantización y empaquetado sobre Qwen/Qwen3.5-27B (commit `fc05daec`). La cuantización es weight-only INT8 simétrica absmax con grupo de 128 y escalas en BF16; el autor no documenta cuantización de activaciones ni de la caché KV. Los shards objetivo no se han modificado respecto al repositorio hermano sin MTP, y las ocho capas lineales de la cabeza MTP se cuantizan también a INT8, mientras que embeddings, normalizaciones, compuertas de regla delta y el `lm_head` compartido se mantienen en BF16. La procedencia queda registrada en `publish_manifest.json` (hashes de ficheros objetivo y de artefactos preparados) y en `quantize_info.json` (cuantización del MTP y comprobación de ida y vuelta de tensores).

El cargador `infer_opt.qwen3_5.Qwen3_5ForCausalLM` ofrece `fuse_projections()` y el modo de compilación `compile-reduce-overhead`; la generación validada usa CUDA Graphs y el decodificador especulativo `MTPSpeculativeDecoder` con `k` configurable (se validaron `k=1` y `k=3`). No hay información sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de entrenamiento del modelo base, más allá de la presencia del mecanismo MTP y de las compuertas de regla delta.

## Capacidades

- Generación de texto autoregresiva en modo greedy con verificación por el modelo objetivo; validada en prosa, matemáticas y coreano.
- Decodificación especulativa integrada mediante la cabeza MTP incluida, con `k=1` y `k=3` verificados, más decodificación plana como referencia.
- Modo de razonamiento: la plantilla de chat se invoca con `enable_thinking=False`, lo que implica que el tokenizador del modelo base soporta un modo de pensamiento explícito; el comportamiento de dicho modo no se documenta en esta ficha.
- Razonamiento matemático: el conjunto de validación incluye generación matemática, sin métricas de exactitud publicadas.
- Multilingüismo parcial confirmado (coreano en la validación); no se publica la lista de idiomas soportados.
- Ejecución con CUDA Graphs y compilación de kernels `fla-delta` en GPUs BF16 de gama alta.
- Trazabilidad de artefactos: hashes en el manifiesto y resultados de validación con IDs de token.
- No soporta visión (torre omitida), ni se documenta tool calling, function calling, uso de agentes o audio.

## Casos de uso

- Inferencia de texto en una sola GPU A100 de 40 GB: el checkpoint completo ocupa 30,3 GB y la validación reporta 29,90 GiB de pico, de modo que un nodo con una única A100-40GB puede servir el modelo sin paralelismo de tensores.
- Aceleración de la decodificación con MTP: `MTPSpeculativeDecoder(model, max_seq_len=2048, k=3)` permite reducir el número de pasos del modelo objetivo; el autor no publica cifras de speedup, por lo que la ganancia debe medirse en el hardware propio antes de adoptarla en producción.
- Investigación en decodificación especulativa: el notebook del repositorio compara generación plana frente a `k=1` y `k=3`, lo que sirve para estudiar la tasa de aceptación de tokens y la degradación por ruta de coma flotante.
- Sustitución de un despliegue BF16 ya basado en infer-opt: se recortan aproximadamente 24 GB de pesos (de ~54 GB en BF16 a ~30 GB) y se evita descargar un checkpoint MTP adicional, manteniendo el mismo código de carga con `from_quantized_dir(..., kernels="fla-delta")`.
- Asistentes internos de explicación técnica y resolución de problemas matemáticos: los tres dominios cubiertos por la validación (prosa, matemáticas y coreano) son representativos de este tipo de cargas.
- Entornos con requisitos de auditoría: `publish_manifest.json`, `quantize_info.json` y `validation.json` permiten justificar la equivalencia del artefacto cuantizado frente al flujo original antes de aprobarlo en un pipeline regulado.
- Prototipado en cloud con presupuesto de almacenamiento y ancho de banda limitados: descargar 30,3 GB en lugar de los ~54 GB del BF16 más el MTP en BF16 reduce a la mitad la transferencia.
- Evaluación de cuantización INT8 g128 frente a BF16: con 64 tokens idénticos en tres dominios y coincidencia exacta de logits en la cabeza MTP, sirve como caso de control en estudios de cuantización weight-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica la validación de release del 25 de octubre de 2026:

| Prueba | Configuración | Resultado |
|---|---|---|
| Coincidencia de logits de la cabeza MTP (23 tensores) y de los logits de prefill en la última posición | A100-SXM4-40GB, CUDA Graphs | Coincidencia exacta con el flujo original attach-and-quantize |
| 64 tokens generados en prosa, matemáticas y coreano | Decodificación plana y MTP con `k=1` y `k=3` | 64/64 tokens idénticos |
| Memoria GPU pico | A100-SXM4-40GB | 29,90 GiB |
| Throughput y latencia | — | No medidos en esta release; la primera generación compilada incluye el tiempo de compilación |

## Requisitos de hardware

- VRAM: el autor exige al menos 38 GiB de memoria GPU visible, o una GPU BF16 compatible de mayor capacidad; el pico medido con CUDA Graphs es de 29,90 GiB, por lo que el margen restante cubre caché KV y `max_seq_len=2048`.
- GPU validadas: A100-SXM4-40GB (CUDA Graph decoding). El autor menciona GPUs BF16 compatibles de mayor tamaño (A100 80GB, H100) sin validarlas explícitamente.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) según el requisito de 38 GiB, y no se publican artefactos GGUF ni versiones de menor precisión para estos entornos.
- Despliegue: exclusivamente mediante el proyecto infer-opt (commit `eaa6d3551670`), con `transformers>=5`, `safetensors`, `huggingface_hub` y `flash-linear-attention`. No hay soporte documentado en vLLM, TGI, llama.cpp, Ollama ni SGLang.
- Latencia y throughput: no disponibles; el autor declara explícitamente que este empaquetado no introduce nuevas afirmaciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | MTP / decodificación especulativa | Licencia | Carga |
|---|---|---|---|---|---|---|
| Jakemu/Qwen3.5-27B-int8-g128-mtp | 27 000 M | No disponible | INT8 weight-only g128 + MTP en INT8 | Incluido en el mismo artefacto | Apache-2.0 | infer-opt (`eaa6d3551670`) |
| Jakemu/Qwen3.5-27B-int8-g128 | 27 000 M | No disponible | INT8 weight-only g128, sin MTP | No incluido; requiere el MTP del checkpoint original | Apache-2.0 | infer-opt |
| Qwen/Qwen3.5-27B (original) | 27 000 M | No disponible | BF16 | MTP en BF16 (15 tensores antes de cuantizar) | Apache-2.0 | Transformers / infer-opt |
| Alternativas de terceros de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un checkpoint estándar de Transformers: no funciona con `AutoModelForCausalLM`, vLLM, TGI, llama.cpp ni Ollama, solo con el cargador de infer-opt.
- Dependencia de un commit concreto (`eaa6d3551670`) de un repositorio externo; cualquier cambio en el loader puede romper la carga o la equivalencia numérica.
- Requisito de 38 GiB de VRAM visible que excluye toda GPU de consumo actual; no hay alternativas cuantizadas más agresivas en el repositorio.
- Sin torre de visión: cualquier caso de uso multimodal queda fuera del alcance de este artefacto.
- La verificación greedy se apoya en el modelo objetivo, pero el propio autor advierte que distintas rutas de ejecución en coma flotante pueden alterar el argmax en logits casi empatados; no hay garantía de reproducibilidad bit a bit frente a otras implementaciones.
- Sin medición de throughput ni de latencia en esta release, y sin benchmarks de calidad publicados; no es posible comparar su rendimiento real con el BF16 sin medirlo.
- Idiomas soportados no documentados: la validación cubre coreano, inglés (prosa y matemáticas), pero no hay evaluación de castellano ni de otras lenguas.
- Sesgos y tasa de alucinación no evaluados en la información disponible; se heredan del modelo base sin análisis específico.
- La licencia Apache-2.0 permite uso comercial, pero obliga a conservar el aviso de licencia y la atribución, y conviene verificar los términos del modelo base Qwen/Qwen3.5-27B.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: no existe validación independiente de la comunidad.
- El repositorio se creó y actualizó el mismo día (25 de octubre de 2026), sin historial posterior de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jakemu/Qwen3.5-27B-int8-g128-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio hermano sin MTP: https://huggingface.co/Jakemu/Qwen3.5-27B-int8-g128/tree/8e69ff4b730ad3d372918aee22e094472c1a47ed
- Cargador infer-opt (commit validado): https://github.com/Jake-Song/infer-opt/tree/eaa6d3551670ca110cfcfff19b35a6d64f420ac5
- Informe de validación: https://huggingface.co/Jakemu/Qwen3.5-27B-int8-g128-mtp/blob/main/VALIDATION.md
- Resultados en crudo con IDs de token: https://huggingface.co/Jakemu/Qwen3.5-27B-int8-g128-mtp/blob/main/validation.json
- Manifiesto de publicación: https://huggingface.co/Jakemu/Qwen3.5-27B-int8-g128-mtp/blob/main/publish_manifest.json
- La búsqueda web realizada no devolvió resultados relevantes (únicamente páginas de inicio del motor de búsqueda).
