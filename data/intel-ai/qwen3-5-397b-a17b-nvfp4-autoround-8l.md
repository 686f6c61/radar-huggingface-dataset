# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-8L

## Resumen

Qwen3.5-397B-A17B-NVFP4-AutoRound-8L es una variante estructuralmente reducida del checkpoint cuantizado NVFP4 de Qwen3.5-397B-A17B, publicado por el equipo intel-ai en Hugging Face. No se trata de un modelo entrenado desde cero ni de un proceso de destilación: es una copia selectiva de tensores que conserva únicamente las 8 primeras capas del modelo de lenguaje original (que tenía 60), junto con la torre visual completa y la capa MTP (multi-token prediction). El resultado es un modelo multimodal MoE de aproximadamente 61.660 millones de parámetros reales en safetensors, frente a los 397.000 millones nominales del modelo base.

La relevancia de esta ficha radica en que ejemplifica una práctica creciente en el ecosistema open source: generar checkpoints reducidos a partir de modelos gigantes cuantizados para facilitar la experimentación, el prototipado y la validación de pipelines sin necesidad de infraestructura de gran escala. Al mantener la torre visual y la capa MTP, el modelo conserva capacidades multimodales y de predicción especulativa, aunque con una profundidad de lenguaje muy limitada.

El modelo usa una arquitectura híbrida de atención (linear attention y full attention alternadas), 512 expertos enrutados por capa con 10 activos por token, y cuantización NVFP4 de 4 bits con group_size=16. Está publicado bajo licencia Apache 2.0 y su formato de pesos es safetensors con compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (linear attention + full attention), multimodal con torre visual y capa MTP |
| Parametros totales | 61.660.767.984 (dato real de safetensors); el modelo base nominal es de 397B |
| Parametros activos | 10 expertos enrutados por token de 512 disponibles; no se especifica el total de parámetros activos |
| Longitud de contexto | 262.144 posiciones máximas (max_position_embeddings) |
| Tipos de cuantizacion | NVFP4 (4 bits, group_size=16, simétrico, scale_dtype=float8_e4m3fn) en pesos y activaciones; BF16 en router, shared expert, torre visual, MTP, lm_head, embeddings y normas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (10 shards, 44,62 GiB de datos de tensor; repo de 193,6 GB) |

## Arquitectura y entrenamiento

El modelo es una reducción estructural del checkpoint Qwen3.5-397B-A17B-NVFP4-AutoRound-v2, que a su vez deriva del modelo base Qwen/Qwen3.5-397B-A17B. La reducción se realiza a nivel de safetensors con el script `reduction/make_reduced_model.py`: se copian tensor a tensor las capas 0 a 7 del modelo de lenguaje original, se conserva la torre visual (333 tensores, BF16) y la capa MTP (1.553 tensores, BF16), y se descartan el resto de capas del lenguaje. No hay reentrenamiento, destilación ni recuantización; los pesos son copias literales del checkpoint fuente.

La arquitectura resultante tiene 8 capas de lenguaje con el patrón `[linear, linear, linear, full, linear, linear, linear, full]`, hidden size de 4096, 32 cabezas de atención, 2 cabezas KV, dimensión de cabeza 256, 512 expertos enrutados con 10 activos por token, tamaño intermedio MoE de 1024 y shared expert de 1024. El vocabulario es de 248.320 tokens y RoPE theta de 10.000.000. La torre visual tiene 27 bloques, hidden size de 1152 y salida de 4096, que coincide con el hidden size del texto. La cuantización NVFP4 se aplica a los expertos MoE, las proyecciones de atención linear y full attention, con cuantización dinámica por bloque de activaciones; el router, el shared expert, la torre visual, el MTP y el lm_head permanecen en BF16.

## Capacidades

- Generación de texto y razonamiento: el modelo conserva 8 capas de lenguaje, lo que limita severamente su profundidad de razonamiento frente al modelo base de 60 capas.
- Procesamiento multimodal: la torre visual completa (27 bloques) se mantiene, por lo que el modelo puede procesar imágenes y combinarlas con texto.
- Predicción multi-token (MTP): la capa MTP se conserva en BF16, lo que permite decodificación especulativa y generación acelerada.
- Atención híbrida: combinación de linear attention y full attention, con 6 capas linear y 2 full en esta reducción.
- Soporte de contexto largo: hasta 262.144 posiciones máximas según configuración, aunque la profundidad reducida limita la calidad en contextos muy largos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada; la profundidad de 8 capas hace poco probable un rendimiento robusto en tareas agénticas complejas.

## Casos de uso

- Prototipado de pipelines multimodales: el modelo permite validar flujos de imagen-texto con la torre visual completa y un coste de inferencia mucho menor que el modelo base de 397B, útil en fases de diseño de arquitectura.
- Pruebas de decodificación especulativa: al conservar la capa MTP en BF16, sirve para experimentar con técnicas de predicción multi-token y medir su impacto en latencia sin cargar el modelo completo.
- Investigación sobre reducción de modelos: es un artefacto de referencia para estudiar cómo afecta el recorte de capas al rendimiento en tareas concretas, comparando las 8 capas conservadas con el modelo fuente.
- Validación de cuantización NVFP4: permite probar el formato compressed-tensors NVFP4 en hardware compatible (GPU con soporte FP4) sin necesidad de los 193 GB del checkpoint completo.
- Generación de texto en entornos con VRAM limitada: con 44,62 GiB de datos de tensor, es desplegable en GPUs de 48 GB o en configuraciones multi-GPU consumer, a diferencia del modelo base.
- Experimentación con atención híbrida: el patrón linear/full de las 8 capas permite estudiar el comportamiento de la atención linear en modelos MoE de forma aislada.
- Benchmarking de infraestructura: útil para medir throughput y latencia de cargas NVFP4 en vLLM o TGI antes de escalar al modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 48 GB para cargar los 44,62 GiB de datos de tensor en BF16/FP4 mixto, más overhead de activaciones y caché KV; se recomienda 80 GB para margen operativo.
- GPU recomendadas: H100 (80 GB), A100 (80 GB), L40S (48 GB) o GPUs con soporte nativo de FP4 como Blackwell (B200). En consumer, no cabe en una sola RTX 4090 (24 GB); requeriría configuración multi-GPU.
- Cabe en consumer GPU: no en una sola unidad; sí en configuraciones de 2× RTX 4090 o 2× RTX 5090 con sharding.
- Opciones de despliegue: vLLM y TGI para soporte de compressed-tensors NVFP4; llama.cpp y Ollama no soportan NVFP4 de forma nativa en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B-NVFP4-AutoRound-8L (este) | 61,66B reales (8 capas) | 262.144 | Apache 2.0 | safetensors NVFP4 | Hugging Face, 199 descargas |
| Qwen/Qwen3.5-397B-A17B (base) | 397B nominales | 262.144 | Apache 2.0 | safetensors BF16 | Hugging Face |
| Qwen3.5-397B-A17B-NVFP4-AutoRound-v2 (fuente) | 397B nominales, 60 capas | 262.144 | Apache 2.0 | safetensors NVFP4 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de información sobre modelos alternativos de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Profundidad de lenguaje muy reducida: solo 8 capas frente a las 60 del modelo original, lo que degrada significativamente la calidad de generación, el razonamiento y la coherencia en comparación con el modelo fuente.
- No es un modelo para producción: la reducción estructural no incluye reentrenamiento ni ajuste fino, por lo que su rendimiento en tareas reales será muy inferior al del modelo base.
- Sesgos conocidos: no disponibles en la información proporcionada; al heredar pesos del modelo base, podría arrastrar sus sesgos, pero no se documentan.
- Riesgo de alucinación: elevado por la pérdida de capacidad de razonamiento derivada del recorte de capas.
- Limitaciones de contexto: aunque la configuración permite 262.144 posiciones, la profundidad de 8 capas hace improbable un aprovechamiento efectivo de contextos largos.
- Idiomas soportados: no documentados; se desconoce si la reducción afecta al soporte multilingüe del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y su calidad es limitada.
- Dependencia de hardware específico: el formato NVFP4 requiere GPUs con soporte de FP4 (Blackwell o posteriores) o frameworks que emulen la cuantización; no es portable a cualquier hardware.
- Tamaño del repo (193,6 GB) desproporcionado respecto a los datos de tensor (44,62 GiB), lo que puede complicar la descarga y el almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-8L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Checkpoint fuente (referencia en la model card): Qwen3.5-397B-A17B-NVFP4-AutoRound-v2
- Script de reducción: `reduction/make_reduced_model.py` (incluido en el repo)
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
