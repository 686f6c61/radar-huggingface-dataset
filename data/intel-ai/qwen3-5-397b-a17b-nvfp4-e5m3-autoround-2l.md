# intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-2L

## Resumen

`Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-2L` es una variante estructuralmente reducida del checkpoint cuantizado `intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound`, que a su vez deriva del modelo multimodal `Qwen/Qwen3.5-397B-A17B` de Alibaba Qwen. La reduccion conserva unicamente 2 capas del modelo de lenguaje (una de atencion lineal y una de atencion completa), la torre visual de 27 bloques y la capa MTP (multi-token prediction), descartando las 58 capas restantes del modelo original de 60 capas. No se trata de un reentrenamiento, destilacion ni recuantizacion: todos los tensores se copian literalmente del checkpoint fuente.

El modelo mantiene la cuantizacion NVFP4 E5M3 generada con AutoRound 0.16.0 (4 bits, group size 16, simetrica, con activaciones tambien en 4 bits y dinamicas), por lo que el checkpoint ocupa 14,99 GiB y contiene 22.222.979.056 parametros segun los metadatos de safetensors. La arquitectura subyacente es un transformer MoE multimodal con 512 expertos enrutados por capa, 10 expertos activos por token, hidden size 4096, 32 cabezas de atencion, 2 cabezas KV y un vocabulario de 248.320 tokens.

Su relevancia es fundamentalmente instrumental: sirve como artefacto de pruebas para validar pipelines de carga, inferencia y cuantizacion AutoRound NVFP4 sobre la arquitectura Qwen3.5-MoE sin necesidad de desplegar el modelo completo de 397B. No es un modelo pensado para produccion ni para uso general, sino una pieza de ingenieria para verificar toolchains y runtimes compatibles con el formato E5M3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Qwen3.5-MoE) con atencion hibrida lineal/completa, torre visual y capa MTP |
| Parametros totales | 22.222.979.056 (checkpoint reducido; el modelo base declara 397B en el nombre) |
| Parametros activos | 10 expertos enrutados por token de 512 totales (modelo base: A17B) |
| Longitud de contexto | 262.144 posiciones maximas (max_position_embeddings) |
| Tipos de cuantizacion | NVFP4 E5M3 (4 bits, group_size 16, simetrica, activaciones 4 bits dinamicas); capas selectas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 9.619 tensores, 14,99 GiB) |

## Arquitectura y entrenamiento

El modelo es una copia estructural del checkpoint AutoRound NVFP4 E5M3 de Qwen3.5-397B-A17B, que a su vez es un transformer MoE con atencion hibrida: 45 capas de atencion lineal y 15 de atencion completa en el original. La reduccion conserva las capas fuente 0 y 3 renumeradas como 0 y 1, de modo que el modelo de 2 capas mantiene exactamente una capa de atencion lineal y una de atencion completa. Se preservan tambien la capa MTP (3.097 tensores) y la torre visual completa (333 tensores, profundidad 27, hidden 1152, salida 4096 coincidente con el hidden de texto).

La configuracion declara `num_hidden_layers=2`, `layer_types=['linear_attention','full_attention']`, hidden size 4096, 32 cabezas de atencion, 2 cabezas KV, head dim 256, 512 expertos enrutados, 10 expertos por token, intermediate size MoE de 1024, shared expert de 1024, vocabulario de 248.320 y RoPE theta de 10.000.000. La cuantizacion AutoRound 0.16.0 se aplica a expertos enrutados y compartidos, proyecciones de atencion lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`), atencion completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y modulos MTP; se mantienen en BF16 los proyectores `in_proj_a`/`in_proj_b`, routers (`mlp.gate`, `shared_expert_gate`), capas lineales de la torre visual, `lm_head`, embeddings y tensores no lineales (RMSNorm, biases, `A_log`, `conv1d`, `dt_bias`, `patch_embed`, `pos_embed`).

No se ha realizado ningun entrenamiento ni ajuste fino: el script `reduction/make_reduced_model.py` copia tensores uno a uno desde el checkpoint fuente sin cargar el modelo completo en memoria, reescribe `config.json`, `quantization_config.json` y el indice de safetensors. El resultado no es un checkpoint compressed-tensors estandar y requiere un runtime compatible con AutoRound E5M3; la carga con Transformers de serie puede no reconocer el empaquetado.

## Capacidades

- Generacion de texto y razonamiento: teoricamente heredadas de la arquitectura Qwen3.5, pero con solo 2 capas el modelo no puede producir texto coherente ni razonamiento util.
- Procesamiento multimodal: la torre visual de 27 bloques se conserva intacta y puede procesar imagenes, aunque la proyeccion al espacio de texto queda truncada por la reduccion de capas.
- Multi-token prediction (MTP): la capa MTP se mantiene y puede ejercitarse para validar decodificacion especulativa en runtimes compatibles.
- Tool calling / function calling: no verificable en este checkpoint; depende del modelo base y no hay evidencia de que sobreviva a la reduccion.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma funcional en un modelo de 2 capas.
- Multilingue: no disponible (sin datos de idiomas en la model card).
- Capacidad especial: sirve como fixture de validacion para toolchains AutoRound NVFP4 E5M3 sobre Qwen3.5-MoE.

## Casos de uso

- Validacion de runtimes AutoRound E5M3: cargar el checkpoint en un runtime compatible para verificar que el empaquetado `auto_round:llm_compressor_nvfp4_e5m3` se deserializa correctamente antes de desplegar el modelo completo de 60 capas.
- Pruebas de integracion de pipelines de cuantizacion: usar el modelo reducido como caso de prueba en CI para comprobar que scripts de reduccion, reescritura de `config.json` y filtrado de `extra_config` producen checkpoints cargables.
- Desarrollo de kernels NVFP4: al tener solo 2 capas y 14,99 GiB, permite iterar rapidamente sobre kernels de atencion lineal, atencion completa y MoE en 4 bits sin ocupar una GPU de 80 GB durante horas.
- Validacion de la torre visual: comprobar que las 333 tensores visuales se cargan y ejecutan correctamente con el merger de salida 4096, verificando la compatibilidad dimensional con el hidden de texto.
- Pruebas de decodificacion especulativa con MTP: ejercitar la capa MTP retenida para validar la logica de multi-token prediction en el runtime antes de aplicarla al modelo completo.
- Benchmarking de overhead de carga: medir tiempos de carga, uso de memoria y throughput de inicializacion de un checkpoint NVFP4 de 4 shards como referencia para estimar el coste del modelo de 397B.
- Pruebas de humo en entornos con VRAM limitada: verificar que el pipeline de inferencia multimodal arranca en GPUs consumer antes de escalar a hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 14,99 GiB en disco; en BF16 los pesos no cuantizados (embeddings, `lm_head`, normas, MTP parcial, torre visual) anaden varios GiB. Se estima un minimo de 18-20 GiB de VRAM solo para pesos, mas KV cache y activaciones.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para pruebas comodas; el modelo completo de 397B requeriria multiples nodos.
- GPU consumer: puede caber en RTX 4090 (24 GB) y RTX 5090 (32 GB) con margen ajustado, siempre que el runtime soporte NVFP4 E5M3. No cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: requiere runtime compatible con AutoRound E5M3 NVFP4 (vLLM con soporte AutoRound, o el stack de Intel para llm-compressor). llama.cpp y Ollama no soportan NVFP4 E5M3 de forma nativa; TGI no esta confirmado.
- Latencia y throughput: no disponibles. Con solo 2 capas, la latencia por token seria muy baja pero la calidad de salida seria degenerada, por lo que las cifras no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Proposito |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-2L | 22,2B (checkpoint) / 397B nominal | 262.144 | NVFP4 E5M3 + BF16 selectivo | Apache 2.0 | Fixture de validacion de toolchain |
| intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound | 397B (60 capas) | 262.144 | NVFP4 E5M3 + BF16 selectivo | Apache 2.0 | Modelo cuantizado completo |
| Qwen/Qwen3.5-397B-A17B | 397B (A17B activos) | 262.144 | BF16 original | Apache 2.0 | Modelo base multimodal MoE |
| Qwen3-MoE de menor tamano (p. ej. variantes 30B-A3B) | ~30B | 32.768-131.072 | BF16, GGUF, AWQ | Apache 2.0 | Alternativa practica para despliegue real |

La comparativa relevante es contra el checkpoint fuente (mismo formato, 60 capas) y contra el modelo base BF16. Frente a alternativas MoE de menor tamano, el modelo reducido no es competitivo en calidad: su unico valor es la validacion de infraestructura.

## Limitaciones y advertencias

- Calidad degenerada: con solo 2 capas de lenguaje, el modelo no puede generar texto coherente, razonar ni mantener conversaciones. No debe usarse en produccion ni evaluarse como modelo de lenguaje.
- No es un modelo destilado ni reentrenado: la reduccion es puramente estructural y copia pesos, por lo que las capas retenidas no han sido adaptadas a la nueva profundidad.
- Compatibilidad de runtime restringida: no es un checkpoint compressed-tensors estandar; Transformers de serie puede no cargarlo sin el cuantizador AutoRound E5M3 correspondiente.
- Riesgo de alucinacion: irrelevante en la practica porque la salida no es linguisticamente valida, pero cualquier evaluacion cualitativa seria enganosa.
- Idiomas: no disponibles en la model card; no se puede confirmar cobertura multilingue.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es funcional para tareas reales, por lo que la licencia no mitiga la inutilidad practica del checkpoint.
- Sesgos: no documentados; heredados teoricamente del modelo base pero no evaluables en esta variante.
- Fecha de creacion (2026-11-23) y 0 descargas/0 likes: checkpoint recien publicado y sin validacion comunitaria.
- El nombre del checkpoint (397B-A17B) no refleja el tamano real de los pesos reducidos (22,2B declarados en safetensors); puede inducir a error en inventarios automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-2L
- Checkpoint fuente de la reduccion: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Script de reduccion (referenciado en la model card): `reduction/make_reduced_model.py` dentro del repositorio del modelo
- AutoRound: no se proporciona enlace directo en la informacion disponible
- Paper, blog o demo adicionales: no disponibles
