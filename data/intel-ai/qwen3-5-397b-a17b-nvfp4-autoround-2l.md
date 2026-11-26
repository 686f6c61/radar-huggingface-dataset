# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-2L

## Resumen

`Qwen3.5-397B-A17B-NVFP4-AutoRound-2L` es una variante estructuralmente reducida del checkpoint cuantizado `Qwen3.5-397B-A17B-NVFP4-AutoRound-v2`, publicado por `intel-ai` en Hugging Face. No se trata de un modelo entrenado ni destilado: es un recorte a nivel de safetensors que conserva únicamente **2 capas del decoder de lenguaje** (las capas fuente 0 y 3, renumeradas como 0 y 1), la **torre visual** completa (27 bloques) y la **capa MTP** (multi-token prediction), descartando el resto de las 60 capas del modelo original. El modelo base de procedencia es `Qwen/Qwen3.5-397B-A17B`, un MoE multimodal de Qwen.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de investigación útil para depurar pipelines de inferencia, validar cargadores de `compressed-tensors` o probar integraciones multimodales con un peso manejable (25,6 GB de repo). Por otro lado, sirve como caso de estudio de las técnicas de reducción estructural y cuantización NVFP4 aplicadas a modelos MoE de gran escala. Conviene subrayar que, al conservar solo 2 de 60 capas, **la calidad generativa del modelo original no se preserva**: es un recorte de ingeniería, no un modelo funcional equivalente.

El checkpoint emplea el formato `nvfp4-pack-quantized` de `compressed-tensors`, con pesos y activaciones en 4 bits (group_size=16, escala en `float8_e4m3fn`), generado con AutoRound 0.17.0. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Qwen3.5-MoE) con atención híbrida linear/full, torre visual y capa MTP |
| Parametros totales | 22.222.979.056 (según safetensors del checkpoint reducido) |
| Parametros activos | 10 expertos enrutados por token de 512 (configuración del modelo fuente; no aplicable de forma funcional al recorte de 2 capas) |
| Longitud de contexto | 262.144 posiciones (`max_positions`) |
| Tipos de cuantizacion | NVFP4 (4 bits, group_size=16, simétrico, escala `float8_e4m3fn`) en pesos y activaciones; BF16 para router, shared expert, torre visual, MTP, `lm_head`, embeddings y normas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (5 shards, 23,85 GiB de datos de tensor), `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo fuente `Qwen/Qwen3.5-397B-A17B` es un transformer MoE con 60 capas de lenguaje (45 de atención linear y 15 de atención completa), 512 expertos enrutados por capa con 10 activos por token, un experto compartido, una capa MTP y una torre visual de 27 bloques. La dimensión oculta es 4096, con 32 cabezas de atención, 2 cabezas KV y dimensión de cabeza 256; el tamaño intermedio del MoE es 1024 y el vocabulario alcanza 248.320 tokens. El checkpoint reducido conserva la configuración de atención híbrida mediante `layer_types = ['linear_attention', 'full_attention']`, seleccionando la capa fuente 0 (linear) y la 3 (full) para garantizar que el recorte mantenga al menos una capa de atención completa.

El proceso de reducción es puramente mecánico: `reduction/make_reduced_model.py` copia tensor a tensor desde el checkpoint NVFP4 v2, reescribe `config.json`, `quantization_config.json` e índice, y nunca carga el modelo completo en memoria. No hay reentrenamiento, destilación ni recuantización. La cuantización NVFP4 se hereda del checkpoint v2, generado con AutoRound 0.17.0, que mantiene en BF16 el router (`mlp.gate`), el `shared_expert_gate`, el experto compartido, todas las capas lineales de la torre visual, todos los módulos MTP y `lm_head`. Los tensores no lineales (RMSNorm, biases, `A_log`, `conv1d`, `dt_bias`, `patch_embed`, `pos_embed`) y los embeddings permanecen también en BF16. El desglose de pesos muestra que MTP concentra 12,29 GiB, los expertos MoE 6,75 GiB, embeddings/lm_head/normas 3,79 GiB y la torre visual 0,85 GiB.

## Capacidades

- Generación de texto y razonamiento: potencialmente heredadas de la arquitectura fuente, pero **degradadas de forma severa** por el recorte a 2 capas; no debe asumirse calidad funcional.
- Procesamiento multimodal de entrada: la torre visual (27 bloques, hidden 1152, salida 4096) se conserva íntegra y puede procesar imágenes para producir embeddings compatibles con la dimensión de texto.
- Predicción multi-token (MTP): la capa MTP se retiene completa en BF16 (1.553 tensores), útil para validar decodificación especulativa o integraciones de MTP.
- Tool calling / function calling: no disponible de forma verificable en este recorte.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma fiable.
- Multilingüismo: no disponible (los idiomas no están declarados).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Validación de cargadores `compressed-tensors` NVFP4: el checkpoint permite probar la carga de pesos 4-bit con escala `float8_e4m3fn` y `group_size=16` en un entorno de CI sin necesidad de descargar el modelo completo de 397B.
- Depuración de pipelines multimodales: al conservar la torre visual y el `visual-merger` con salida 4096, sirve para verificar la alineación entre embeddings visuales y dimensión de texto en integraciones de transformers.
- Pruebas de decodificación especulativa con MTP: la capa MTP completa en BF16 permite validar implementaciones de multi-token prediction y medir su overhead sin cargar el modelo íntegro.
- Benchmarking de kernels NVFP4: útil para medir latencia y throughput de operadores cuantizados en 4 bits sobre GPUs con soporte nativo (Blackwell y posteriores) antes de escalar al modelo completo.
- Desarrollo de herramientas de reducción estructural: el script `reduction/make_reduced_model.py` y la estructura resultante sirven como referencia para construir recortes reproducibles de otros checkpoints MoE.
- Docencia e investigación sobre cuantización: permite ilustrar el impacto del recorte de capas y de la cuantización NVFP4 en un modelo de gran escala con un coste de almacenamiento y cómputo contenido.
- Pruebas de integración de `generation_config.json` y tokenizer: útil para validar el pipeline de generación de transformers con un vocabulario de 248.320 tokens sin cargar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 23,85 GiB de datos de tensor; en BF16 el recorte sería aproximadamente el doble, pero el formato publicado es NVFP4, por lo que se requiere hardware con soporte de operadores 4-bit (Blackwell o posterior para NVFP4 nativo).
- GPU recomendadas: NVIDIA B200/B100 o H100 con kernels compatibles; GPUs consumer con soporte NVFP4 limitado (RTX 50 series) podrían ejecutarlo, pero el soporte de `compressed-tensors` NVFP4 en consumer es limitado.
- ¿Cabe en consumer GPU? El tamaño de pesos (≈24 GiB) excede los 24 GB de una RTX 4090 en el límite; una RTX 5090 (32 GB) podría alojarlo, sujeto a soporte de kernels.
- Opciones de despliegue: transformers (librería declarada), con soporte de `compressed-tensors`; vLLM, llama.cpp, Ollama y TGI no están confirmados para este formato NVFP4 específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-2L` | 22,2 B (recorte de 2 capas) | 262.144 | NVFP4 | apache-2.0 | Hugging Face |
| `Qwen/Qwen3.5-397B-A17B` (modelo base) | 397 B totales / 17 B activos | 262.144 | BF16 | no disponible en la informacion | Hugging Face |
| `Qwen3.5-397B-A17B-NVFP4-AutoRound-v2` (fuente de la reducción) | 397 B totales / 17 B activos | 262.144 | NVFP4 | apache-2.0 | Hugging Face |

La comparativa con otras alternativas de la misma categoría (recortes estructurales de modelos MoE) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Calidad generativa no preservada**: al conservar solo 2 de 60 capas de lenguaje, el modelo no reproduce el comportamiento del original; no debe usarse en producción para generación, razonamiento o código.
- **No es un modelo entrenado**: es un recorte mecánico de pesos; no ha pasado por RLHF, DPO ni fine-tuning posterior.
- **Riesgo de alucinación**: elevado y no caracterizado; no hay evaluaciones publicadas.
- **Idiomas no declarados**: no se especifica cobertura lingüística.
- **Sesgos**: no documentados en la información disponible.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe verificarse por separado.
- **Soporte de kernels**: NVFP4 requiere hardware y librerías específicas; la compatibilidad con vLLM, llama.cpp u Ollama no está confirmada.
- **Tamaño del repo**: 25,6 GB, con MTP ocupando 12,29 GiB; conviene planificar el almacenamiento.
- **Uso previsto**: exclusivamente investigación, depuración y validación de pipelines, no despliegue funcional.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-2L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Checkpoint fuente de la reducción: `Qwen3.5-397B-A17B-NVFP4-AutoRound-v2` (referenciado en la model card, sin URL directa en la información disponible)
- Script de reducción: `reduction/make_reduced_model.py` (incluido en el repositorio)
- AutoRound: no disponible en la información proporcionada
- compressed-tensors: no disponible en la información proporcionada
