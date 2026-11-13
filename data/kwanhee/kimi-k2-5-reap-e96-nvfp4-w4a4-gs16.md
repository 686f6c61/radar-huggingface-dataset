# kwanhee/Kimi-K2.5-REAP-E96-NVFP4-W4A4-GS16

## Resumen

Kimi-K2.5-REAP-E96-NVFP4-W4A4-GS16 es un checkpoint derivado de `moonshotai/Kimi-K2.5` publicado por el usuario kwanhee como material de comparacion (rebuttal) para el paper *Hardware-Native Joint Sparse-Quantization for Trillion-Scale Mixture-of-Experts* (MoE-SQ, arXiv 2610.02241). No es un modelo nuevo entrenado desde cero, sino una variante comprimida en dos etapas del modelo base de Moonshot AI: primero poda de expertos enrutados mediante REAP (de 384 a 96 expertos por capa) y despues cuantizacion densa NVFP4 con esquema W4A4 y group size 16. El resultado ocupa aproximadamente 167 GB y conserva 265.740.978.288 parametros nominales segun los safetensors del repositorio.

El objetivo tecnico del checkpoint es servir como referencia de "presupuesto de bits comparable": mide cuantos bits por peso de experto enrutado consume realmente la combinacion poda + NVFP4 cuando se contabilizan los pesos, escalas y metadatos de los 384 expertos originales, arrojando 1,125 bits por peso. Es relevante ahora porque permite evaluar empiricamente estrategias de compresion extrema sobre modelos MoE de escala trillonaria, un problema abierto para el despliegue en hardware limitado.

La arquitectura de base es un transformer Mixture-of-Experts con top-8 routing, vision tower y expertos compartidos. Este checkpoint mantiene en bf16 la atencion, el experto compartido, la primera capa densa, el router, los embeddings, `lm_head` y la torre de vision; solo los expertos enrutados estan podados y cuantizados. La licencia es una Modified MIT heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con top-8 routing, expertos compartidos y vision tower; poda REAP + cuantizacion NVFP4 W4A4 |
| Parametros totales | 265.740.978.288 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con group size 16 en expertos enrutados; bf16 en atencion, experto compartido, primera capa densa, router, embeddings, `lm_head` y vision tower |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT (hereda del modelo base `moonshotai/Kimi-K2.5`) |
| Formato de pesos | safetensors con `compressed-tensors`; libreria `transformers` con `custom_code` |
| Expertos enrutados | 96 de 384 por capa (top-8 routing sin cambios) |
| Bits por peso de experto enrutado | 1,125 (contabilizando pesos, escalas y metadatos de los 384 expertos) |
| Tamano del repositorio | 166,8 GB |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

El modelo base Kimi-K2.5 es un transformer MoE con 384 expertos enrutados por capa y top-8 routing, complementado por expertos compartidos, una primera capa densa, una torre de vision y embeddings. Este checkpoint no entrena pesos nuevos: aplica un pipeline de compresion en dos etapas sobre el release INT4 descomprimido a bf16.

La etapa 1 consiste en poda de expertos con `REAPPruningModifier` de llm-compressor 0.13.0 sobre los pesos bf16 de Kimi-K2.5, usando el corpus de calibracion `mixed` con 512 muestras de 4096 tokens y poda secuencial capa a capa. Se eliminan 288 de los 384 expertos enrutados por capa, conservando 96, y se recorta el router y el bias de correccion de score (REAP solo selecciona expertos, no reentrena). Los indices conservados por capa estan en `reap_kept_experts.jsonl`.

La etapa 2 aplica cuantizacion densa NVFP4 W4A4 mediante inicializacion GPTQ de MoE-SQ con valores NVFP4, group size 16, fake-quant de activaciones, refinamiento desactivado, calibracion `mixed`, Hessianos de 512 muestras y `percdamp` 0,1; la configuracion es identica a la de `kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16` salvo la ruta del modelo (`moe_sq_config.yaml`). La etapa 1 y el recorte se ejecutaron en 8× NVIDIA B300 (SM103); la etapa 2 uso atencion eager con mascara causal explicita en lugar de FlashAttention-2 (no disponible para SM103 en ese entorno), lo que afecta solo al orden de suma en punto flotante durante las pasadas de calibracion. La etapa 2 se reanudo desde el checkpoint de la capa 36 tras un OOM de CUDA en la capa 37; como las capas se cuantizan de forma independiente, el resultado no se ve afectado segun el autor.

## Capacidades

- Generacion de texto y modelado de lenguaje: hereda las capacidades del modelo base Kimi-K2.5 en tareas de generacion y extraccion de caracteristicas (pipeline declarado `feature-extraction`).
- Razonamiento y matematicas: presumiblemente conservadas del base, aunque no hay evaluaciones publicadas en la informacion disponible para este checkpoint.
- Codigo: no hay datos especificos en la informacion disponible; se heredaria del base si este lo soporta.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Vision: la torre de vision se mantiene en bf16, pero el autor indica explicitamente que las rutas multimodales no estan probadas y que todas las evaluaciones son solo de texto.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en compresion de MoE: el checkpoint sirve como referencia reproducible para comparar poda REAP frente a MoE-SQ con el mismo presupuesto de bits (1,125 bits por peso de experto enrutado), permitiendo medir el impacto de cada estrategia en calidad.
- Despliegue de un MoE de escala trillonaria en hardware limitado: con ~167 GB en NVFP4, encaja en nodos de 8 GPU de 24-48 GB o configuraciones multi-GPU con memoria agregada suficiente, algo inviable con el base en bf16.
- Extraccion de caracteristicas: el pipeline declarado es `feature-extraction`, por lo que puede usarse para generar embeddings de texto en pipelines de retrieval o clasificacion, siempre que se valide la calidad tras la compresion.
- Serving de alto throughput con vLLM: segun el autor, se sirve con vLLM v0.30.0 y el parche MoE-SQ (`IST-DASLab/MoESQ`, `integrations/vllm/install.sh`), lo que permite evaluar latencia y throughput en entornos de inferencia estandar.
- Banco de pruebas para kernels NVFP4: al usar `compressed-tensors` con NVFP4 W4A4 gs16, es util para validar kernels y rutas de cuantizacion en transformers y vLLM.
- Estudio de degradacion por poda agresiva: con 288 de 384 expertos eliminados por capa, permite analizar como se distribuye la perdida de calidad por capa y por experto conservado (`reap_kept_experts.jsonl`).
- Comparacion controlada de checkpoints: al compartir configuracion con `kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16`, facilita experimentos A/B sobre el numero de expertos conservados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 167 GB de pesos en NVFP4 (tamano del repo), mas overhead de activaciones, KV cache y buffers de inferencia; no disponible una cifra exacta de VRAM total.
- GPU recomendadas: el autor menciona 8× NVIDIA B300 (SM103) para el pipeline de compresion; para inferencia se requiere un entorno con soporte NVFP4 y el parche MoE-SQ sobre vLLM v0.30.0.
- Compatibilidad con consumer GPU: no disponible; el tamano de ~167 GB y la dependencia de NVFP4 hacen improbable el despliegue en GPU de consumo individual, aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: vLLM v0.30.0 con el parche MoE-SQ (`IST-DASLab/MoESQ`); libreria `transformers` con `custom_code` y `compressed-tensors`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Nota: FlashAttention-2 no estaba disponible para SM103 en el entorno del autor durante la calibracion; se uso atencion eager con mascara causal explicita.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos enrutados | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kwanhee/Kimi-K2.5-REAP-E96-NVFP4-W4A4-GS16 | 265.740.978.288 (safetensors) | 96 de 384 | NVFP4 W4A4 gs16 + bf16 parcial | ~167 GB | Modified MIT | Hugging Face, 0 descargas |
| kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16 | no disponible | no disponible (variante REAP50) | NVFP4 W4A4 gs16, misma config MoE-SQ | no disponible | no disponible | Hugging Face |
| moonshotai/Kimi-K2.5 (base) | no disponible | 384 | bf16 (release INT4 mencionado como origen) | no disponible | Modified MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada; el checkpoint E96 se presenta explicitamente como comparacion de presupuesto de bits frente a MoE-SQ.

## Limitaciones y advertencias

- Poda agresiva: se eliminan 288 de 384 expertos enrutados por capa (75 %), lo que puede degradar la calidad y la diversidad de representaciones; no hay evaluaciones publicadas que cuantifiquen la perdida.
- Cuantizacion NVFP4 W4A4 con group size 16: precision muy baja en expertos enrutados (1,125 bits efectivos por peso contando metadatos); riesgos de degradacion en tareas sensibles.
- Multimodal no probado: la torre de vision se mantiene en bf16, pero el autor indica que las rutas multimodales no estan testeadas y que todas las evaluaciones son solo de texto.
- Idiomas: no se declara lista de idiomas soportados; no se puede garantizar cobertura multilingue.
- Licencia: Modified MIT heredada del base; revisar `LICENSE` y `THIRD_PARTY_NOTICES.md` antes de uso comercial, ya que la licencia es "other" con nombre "modified-mit".
- Dependencia de software: requiere `transformers` con `custom_code` y `compressed-tensors`, y para serving vLLM v0.30.0 con el parche MoE-SQ; no es un checkpoint plug-and-play en stacks estandar sin parches.
- Reproducibilidad del pipeline: la etapa 2 se reanudo tras un OOM y uso atencion eager en lugar de FlashAttention-2 por limitaciones de SM103; el autor afirma que el resultado no se ve afectado, pero son condiciones no triviales de reproducir.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; es un checkpoint de investigacion (rebuttal), no un release orientado a produccion.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; se heredan los del modelo base, que no estan documentados aqui.

## Enlaces

- Hugging Face: https://huggingface.co/kwanhee/Kimi-K2.5-REAP-E96-NVFP4-W4A4-GS16
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Checkpoint hermano (REAP50): https://huggingface.co/kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16
- Paper MoE-SQ: arXiv 2610.02241 (referenciado en la model card; no se proporciona URL directa)
- Repositorio con parche vLLM: `IST-DASLab/MoESQ` (integrations/vllm/install.sh)
- llm-compressor: `REAPPruningModifier` (version 0.13.0 mencionada)
- Ficheros citados en el repo: `LICENSE`, `THIRD_PARTY_NOTICES.md`, `reap_kept_experts.jsonl`, `moe_sq_config.yaml`
