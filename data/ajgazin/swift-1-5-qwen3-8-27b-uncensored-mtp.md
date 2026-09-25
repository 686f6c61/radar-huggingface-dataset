# ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-MTP es una variante "abliterated" (sin censura) de Swift 1.5 Qwen3.8-27B, el ajuste fino de UkisAI sobre Qwen3.8-27B orientado a un razonamiento más eficiente. El modelo lo publica el usuario ajgazin y aplica sobre los pesos de Swift 1.5 la abliteración de dirección única de orcarouter/Qwen3.8-27B-Uncensored, basada en el método de Arditi et al. (2024) para eliminar la dirección de rechazo en el espacio residual. El resultado es un modelo multimodal de 27.781.427.952 parámetros (unos 27,8 mil millones) que reduce los rechazos de 98/100 a 23/100 en el conjunto de evaluación empleado, con una divergencia KL de 0,0884 respecto al modelo original.

La relevancia técnica de esta ficha está en dos detalles poco habituales. El primero es que la torre de visión queda intacta y la cabeza MTP (multi-token prediction) se conserva y se edita de forma coherente, de modo que la decodificación especulativa propia sigue funcionando. El segundo es que la dirección de rechazo no se copia de orcarouter, sino que se recupera a partir de la diferencia entre sus pesos y los de Qwen3.8-27B, y se proyecta fuera de las matrices de Swift 1.5, lo que preserva los cambios propios del ajuste fino.

El modelo se distribuye en safetensors BF16 completos, con versiones cuantizadas en GGUF (llama.cpp, dinámica de Q2 a Q8) y NVFP4 (vLLM, SGLang). El repositorio no registra descargas ni "likes" en el momento de la consulta y la model card no publica benchmarks generales ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 16 capas de atención completa + 48 capas Gated DeltaNet (atención lineal) + 64 capas MLP, con torre de visión y cabeza MTP |
| Parámetros totales | 27.781.427.952 (unos 27,8 B, dato real de safetensors) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de despliegue con `--max-model-len 262144` de la model card) |
| Tipos de cuantización | BF16 (safetensors completo), GGUF dinámico de Q2 a Q8 (Unsloth-dynamic, llama.cpp), NVFP4 (vLLM, SGLang) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | swift-open-license-1.0 (`license: other`), enlazada desde el modelo base |
| Formato de pesos | safetensors (BF16), GGUF, NVFP4 |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |
| Librería | transformers (`AutoModelForImageTextToText`, `AutoProcessor`) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 55,6 GB |
| Fecha de creación / actualización | 2026-09-25 / 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B y Swift 1.5, sin cambios estructurales: un decoder-only con 16 capas de atención completa, 48 capas de atención lineal Gated DeltaNet y 64 capas MLP, más una torre de visión y una cabeza MTP. En total, el repositorio contiene 1199 tensores, todos presentes. La model card confirma explícitamente que arquitectura, tokenizador y plantilla de chat son los de Swift 1.5 y Qwen3.8-27B.

La intervención consiste en una abliteración de dirección única. Se recupera una dirección de rechazo `r` a partir de la diferencia entre los pesos de orcarouter/Qwen3.8-27B-Uncensored y los de Qwen3.8-27B (diferencia de rango uno con coseno por tensor de al menos 0,9999 respecto a `r`), se refina mediante el autovector principal de las matrices de Gram sumadas y un ajuste por coordenadas, y se proyecta fuera de las matrices de Swift 1.5. Se editan 131 tensores, calculados en float32 y almacenados en BF16: 17 tensores `self_attn.o_proj` (16 capas de atención completa más la MTP), 48 `linear_attn.out_proj` (capas Gated DeltaNet), 65 `mlp.down_proj` (64 capas más la MTP) y 1 `embed_tokens`. Cinco dimensiones ocultas enmascaradas por activaciones masivas quedan sin editar. La reconstrucción de `r` sobre Qwen3.8-27B reproduce 131 tensores de orcarouter con el 99,75 % de los elementos idénticos bit a bit.

No hay información en la model card sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si Swift 1.5 usó RLHF o DPO; tampoco se detalla el proceso de ajuste fino original de UkisAI, más allá de describirlo como un fine-tune "reasoning-efficient". La model card indica además que no se ha evaluado el comportamiento de rechazo en modo thinking ni si se conservan las trazas de razonamiento más cortas de Swift 1.5.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat heredada de Swift 1.5 y Qwen3.8-27B (etiqueta `conversational`).
- Comprensión de imágenes: el pipeline declarado es image-text-to-text y la torre de visión no ha sido modificada, por lo que hereda las capacidades multimodales del modelo base.
- Razonamiento con modo thinking: la model card recomienda `--reasoning-parser qwen3` en vLLM, lo que implica soporte de bloques de razonamiento separados de la respuesta final.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder` en vLLM.
- Decodificación especulativa propia: la cabeza MTP se conserva y se edita de forma consistente, lo que habilita decodificación self-speculative con `method: mtp` en vLLM o EAGLE en SGLang.
- Reducción deliberada de rechazos: 23/100 rechazos frente a 98/100 del modelo base, según la evaluación del autor.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Asistente conversacional de contexto largo: con una ventana de hasta 262.144 tokens, el modelo puede mantener conversaciones multi-turno sobre documentación extensa, historiales de incidencias o expedientes completos sin truncar el contexto.
- Análisis de documentos con imágenes: al conservar la torre de visión, permite extraer y razonar sobre información de capturas, diagramas o formularios escaneados junto con el texto que los acompaña.
- Generación de código dentro de pipelines de CI/CD: el soporte de tool calling con el parser `qwen3_coder` permite integrarlo como agente que invoca herramientas de build, test o despliegue y encadena pasos de forma automática.
- Agentes con razonamiento multi-paso: la separación entre trazas de razonamiento y respuesta final (parser `qwen3`) facilita orquestar bucles de planificación y ejecución con varios turnos de herramientas.
- Investigación en alineación y seguridad: el repositorio incluye la dirección `r`, el informe de recuperación y los scripts de abliteración, lo que lo convierte en un caso de estudio reproducible para medir cómo se comporta la dirección de rechazo al transferirla a un fine-tune distinto.
- Red teaming y evaluación de contenido dañino: al reducir los rechazos a 23/100 con una divergencia KL de 0,0884, sirve para comprobar si los filtros de salida de un sistema de producción son suficientes sin depender del propio rechazo del modelo.
- Inferencia self-hosted de baja latencia: la cabeza MTP permite decodificación especulativa interna (3 tokens especulativos en vLLM; EAGLE con 3 pasos y 4 tokens borrador en SGLang), útil para reducir latencia en servicios de generación con alta concurrencia.
- Destilación de trazas de razonamiento: el modelo expone bloques de thinking separables, lo que permite generar y filtrar trazas de razonamiento para entrenar modelos más pequeños.

## Benchmarks y rendimiento

La model card solo publica la evaluación de rechazos y divergencia KL realizada con el evaluador integrado de Heretic (`evaluate_model`, BF16). Los rechazos se miden sobre 100 prompts de `mlabonne/harmful_behaviors` con decodificación greedy, hasta 100 tokens y el detector de rechazo por palabras clave de Heretic; la divergencia KL se mide sobre las distribuciones del primer token en 100 prompts de `mlabonne/harmless_alpaca`, contra el modelo original. El thinking se cierra inmediatamente con el prefijo `"\n</think>\n\n"`, de modo que se puntúan las respuestas, no el razonamiento.

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| Este modelo (contra Swift 1.5) | 23/100 | 0,0884 |
| Swift 1.5 Qwen3.8-27B | 98/100 | 0 |
| orcarouter/Qwen3.8-27B-Uncensored (referencia, contra Qwen3.8-27B) | 17/100 | 0,0621 |
| Qwen3.8-27B (referencia) | 98/100 | 0 |
| Variante sobre Swift 1.0 (referencia, `ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP`) | 15/100 | 0,0634 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La propia model card lista como no evaluados los benchmarks generales, el comportamiento de rechazo en modo thinking y la posible conservación de las trazas de razonamiento cortas de Swift 1.5. Los recuentos de rechazos dependen de la configuración de evaluación y no son comparables entre model cards, según advierte el autor.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del número de parámetros; la model card no publica requisitos oficiales.

- BF16 (safetensors completos): unos 55,6 GB solo de pesos, más caché KV, activaciones y sobrecarga del runtime. Requiere del orden de 64-70 GB de VRAM. Encaja en una A100 80 GB o una H100 80 GB; con paralelismo tensorial puede repartirse en 4x RTX 4090/5090 (96 GB agregados).
- NVFP4 (formato de 4 bits para vLLM/SGLang): aproximadamente 14-15 GB de pesos, lo que permite ejecución en una única RTX 4090, RTX 5090, L40S o A100 40 GB, dejando margen para caché KV.
- GGUF Q8: alrededor de 28 GB, por encima de los 24 GB de una RTX 4090; encaja en RTX 6000 Ada (48 GB), A100 40 GB con contexto reducido, o 2x RTX 4090.
- GGUF Q4 (dinámico Unsloth): aproximadamente 16-17 GB; cabe en una RTX 4090/5090 de 24 GB con contexto moderado.
- GGUF Q2: del orden de 8-10 GB; ejecutable en GPU consumer de gama media (12-16 GB) con pérdida notable de calidad.
- Cabe en GPU consumer: sí, en las cuantizaciones NVFP4, GGUF Q4 y Q2. En BF16 no cabe en ninguna GPU consumer de una sola unidad.
- Caché KV: a 262.144 tokens la caché es muy voluminosa y normalmente exige GPUs de 80 GB o cuantización de la caché; el límite práctico de contexto en hardware consumer será bastante inferior al máximo declarado.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM, SGLang y llama.cpp (vía GGUF, incluido Ollama o LM Studio).
- Decodificación especulativa: vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`; SGLang con `--speculative-algorithm EAGLE --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4`.
- Parámetros de muestreo recomendados por el autor: temperature 1,0, top_p 0,95, top_k 20, min_p 0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos | Divergencia KL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ajgazin) | 27,8 B | 262.144 tokens | 23/100 | 0,0884 (vs Swift 1.5) | swift-open-license-1.0 | Safetensors BF16, GGUF, NVFP4 |
| Swift 1.5 Qwen3.8-27B (ukisai) | 27,8 B | Igual que el base | 98/100 | 0 | swift-open-license-1.0 | Peso original sin abliterar |
| orcarouter/Qwen3.8-27B-Uncensored | No disponible | No disponible | 17/100 | 0,0621 (vs Qwen3.8-27B) | No disponible | No disponible en la información recibida |
| Qwen3.8-27B (Qwen) | No disponible | No disponible | 98/100 | 0 | No disponible | No disponible en la información recibida |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP (Swift 1.0) | No disponible | No disponible | 15/100 | 0,0634 | No disponible | Versión previa sobre Swift 1.0 |

La comparación solo puede establecerse sobre la métrica de rechazos y divergencia KL, porque no hay benchmarks generales publicados para ninguno de los modelos de la tabla en la información disponible. Un dato relevante: la misma dirección `r` aplicada a Swift 1.0 dio 15/100 con KL 0,0634, mientras que sobre Swift 1.5 deja más rechazos (23/100) y mueve más el modelo (0,0884). El autor señala además que la dirección de diferencia de medias calculada sobre las activaciones de Swift 1.5 tiene coseno 0,9998 con la de Qwen3.8-27B y con la de Swift 1.0, pero solo 0,799 con la `r` de orcarouter.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para reducir rechazos. Generará con mucha más probabilidad contenido que el modelo base rechazaría, incluido contenido dañino, y no incorpora salvaguardas propias.
- La evaluación de rechazos procede de un detector por palabras clave sobre 100 prompts y con el thinking cerrado de forma forzada; los resultados no son comparables con los de otras model cards ni reflejan el comportamiento en modo thinking.
- Riesgo de alucinación: no evaluado en la información disponible. La abliteración puede alterar el comportamiento en dominios alejados de la dirección de rechazo, y no hay benchmarks que cuantifiquen ese posible deterioro.
- Idiomas soportados: no declarados. No se puede asumir un rendimiento multilingüe concreto.
- Licencia swift-open-license-1.0: el texto no está incluido en la información recibida. La model card enlaza los términos desde el repositorio del modelo base, pero no se han podido verificar aquí las condiciones de uso comercial, redistribución o atribución. Hay que revisarlas antes de cualquier despliegue en producción.
- Uso comercial y responsabilidad: al tratarse de un modelo sin censura derivado de un fine-tune de terceros, conviene revisar la licencia del modelo base y de Qwen3.8-27B antes de explotarlo comercialmente.
- La ventana de 262.144 tokens es un límite de configuración del ejemplo de vLLM, no una garantía de calidad en todo el rango; el coste de caché KV hace poco práctico alcanzar ese máximo en hardware consumer.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria, y la model card lista explícitamente varias áreas sin evaluar.
- Las etiquetas del modelo incluyen `qwen3_5` y `qwen3_8` a la vez, lo que resulta inconsistente y no ayuda a identificar la generación exacta del modelo base.
- Se han publicado versiones cuantizadas, pero la cuantización añade degradación adicional sobre un modelo ya modificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Cuantizaciones GGUF: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Cuantización NVFP4: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4
- Versión equivalente sobre Swift 1.0: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Modelo de referencia con la abliteración original: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de evaluación Heretic: https://github.com/p-e-w/heretic
- Paper de abliteración (Arditi et al. 2024): https://arxiv.org/abs/2406.11717
- Resultados de búsqueda web: no se ha encontrado ninguna fuente adicional relevante sobre este modelo; los resultados devueltos corresponden a páginas genéricas sobre ChatGPT y no aportan información técnica.
