# Atlas3D/Qwen3.8-Flash-Next-atlas-70g-ingine

## Resumen

Atlas3D/Qwen3.8-Flash-Next-atlas-70g-ingine es un checkpoint cuantizado de forma elástica del modelo Qwen/Qwen3.8-Flash-Next (identificado en la model card como `qwen4exp`, 177B parametros totales en arquitectura MoE). Lo publica el usuario Atlas3D y esta disenado especificamente para el motor de inferencia `atlas-ingine` (repositorio Atlas3DSS/atlas-ingine, rama `main`). No es un modelo nuevo: es una reempaquetadura de pesos en safetensors con una asignacion de precision mixta orientada a reducir el footprint en VRAM y permitir su ejecucion en GPUs de 96 GB (modo `AllResident`) o de 24-32 GB (modo `TieredExpertCache`).

La propuesta tecnica del checkpoint es la cuantizacion elastica: todas las capas MoE se almacenan en NVFP4, las capas densas en FP8, y los embeddings de entrada/salida en NVFP4, mientras que los Per-Layer Embeddings (PLE, `320.001.536 x 160`) permanecen exclusivamente en RAM del host (0 GB de VRAM). El resultado son 73,06 GB de pesos en GPU repartidos en 49 shards, mas 28,80 GB de shards PLE solo-host en 81 ficheros, para un total de 101.859.259.580 bytes.

Es relevante ahora porque demuestra una via practica para servir un modelo MoE de 177B en hardware de gama alta consumer/prosumer sin recurrir a tensor parallelism (el backend nativo `qwen4exp-cuda` solo soporta `INGINE_TP_SIZE=1` en esta version). La verificacion publicada se hizo en una Tesla V100-PCIE-32GB con `TieredExpertCache`, con paridad medida frente a un oraculo FP32 `UD-Q6_K_XL`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (identificador `qwen4exp`), 48 capas, 512 expertos con top-10, 4-way Hyper-Connections, Per-Layer Embeddings solo en host |
| Parametros totales | 101.139.398.528 (segun safetensors); la model card declara 177B para el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-ctx 8192`) |
| Tipos de cuantizacion | Elastica mixta: MoE en NVFP4, densas en FP8, embed/output en NVFP4, PLE en NVFP4 solo-host; existe un perfil alternativo `atlas-56g` con MoE nucleo en `atlas3` |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (49 shards GPU + 81 shards PLE host-only), con `atlas_elastic_manifest.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El checkpoint no entrena desde cero: parte de `unsloth/Qwen3.8-Flash-Next-GGUF` en cuantizacion `UD-Q6_K_XL` (revision `766911a6b7369840a91dbcd95f9f997acaab6cd6`, 158 GB) y se recuantiza con `tools/quantize_elastic_qwen4exp.py` del repositorio `Atlas3DSS/atlas-ingine`. La arquitectura subyacente es un transformer MoE de 48 capas con 512 expertos y enrutamiento top-10, complementado con 4-way Hyper-Connections y Per-Layer Embeddings de gran tamano (`320.001.536 x 160`) que se mantienen fuera de la GPU. La model card no detalla el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF/DPO; esa informacion corresponde al modelo base Qwen y no se reproduce aqui.

La innovacion tecnica del checkpoint es la asignacion de precision por tipo de capa (elastica) y la separacion de los PLE a RAM del host mediante mmap. El motor `atlas-ingine` ofrece dos modos: `AllResident`, que carga los 73,06 GB de pesos GPU en VRAM (viable en GPUs de 96 GB), y `TieredExpertCache`, que mantiene una cache de expertos en VRAM (en la verificacion publicada, 4,43 GiB densos + 25,28 GiB de cache de expertos, 9.819 slots) y el resto en host. La integridad se garantiza con SHA-256 por shard en `atlas_elastic_manifest.json` (hash del manifiesto `b8b0f6f7424251ada165cb4ed0a2da1ae4f2d1942195f0d413024a0fc6c3fca9`) y `SHA256SUMS` para todos los ficheros.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y conocimiento factual heredados del modelo base Qwen3.8-Flash-Next (no verificados de forma independiente en esta ficha).
- Este checkpoint es solo texto: el `mmproj` de vision fue excluido explicitamente, por lo que no hay capacidades multimodales.
- Servicio via API HTTP compatible con OpenAI mediante `ingine-serve` (host/puerto configurables, `--max-ctx`).
- Ejecucion en modo `AllResident` (pesos GPU en VRAM) o `TieredExpertCache` (cache parcial en GPUs de 24-32 GB).
- Capacidades de tool calling, function calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat de largo recorrido en una unica GPU de 96 GB: con `AllResident` los 73,06 GB de pesos caben en VRAM y `ingine-serve` expone una API compatible con OpenAI para integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Despliegue en estaciones de trabajo con GPU de 24-32 GB: mediante `TieredExpertCache` el modelo puede ejecutarse manteniendo solo una parte de los expertos en VRAM; es el escenario verificado en la V100-32GB de la model card.
- Experimentacion con cuantizacion elastica: el par de perfiles `atlas-70g` y `atlas-56g` permite comparar el impacto de precision (coseno 0,9757 frente a 0,9722 contra el oraculo FP32) en la misma carga de trabajo.
- Reproducibilidad y auditoria de pesos: el manifiesto SHA-256 y `SHA256SUMS` permiten verificar la integridad de los 130 shards en pipelines de aprovisionamiento automatizado.
- Inferencia por lotes offline con `ingine-bench`: util para medir throughput y latencia en el hardware objetivo antes de comprometerse con un despliegue en produccion.
- Prototipado de asistentes tecnicos sobre texto: al ser un checkpoint solo-texto, encaja en flujos de documentacion, resumen y generacion de codigo donde no se requiere vision.
- Evaluacion de motores de inferencia alternativos: sirve como banco de pruebas para comparar `atlas-ingine` con otras soluciones sobre el mismo modelo base cuantizado.

## Benchmarks y rendimiento

Datos medidos publicados en la model card (V100-PCIE-32GB, `sm_70`, `TieredExpertCache` con 4,43 GiB densos + 25,28 GiB de cache, 9.819 slots):

| Metrica | atlas-70g | atlas-56g |
|---|---|---|
| Coseno vs oraculo FP32 `UD-Q6_K_XL` (forward 48 capas) | 0,97572218 | 0,97220816 |
| Top-1 correcto (`11751 = ' Paris'`) | si | si |
| max_abs | 2,9197 | no disponible |
| RMSE | 0,5587 | no disponible |
| Decodificacion greedy warm-cache (8 tokens, V100) | 6,29 tok/s | 6,12 tok/s |
| Carga | 3,03 s | no disponible |
| Prefill (5 tokens) | 1,44 s | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card advierte que el rendimiento real en SM120a (Blackwell) con `AllResident` para el modelo de 177B no se ha medido.

## Requisitos de hardware

- VRAM para `AllResident`: 73,06 GB de pesos GPU; encaja en GPUs de 96 GB (la model card menciona este caso como objetivo de diseno).
- VRAM para `TieredExpertCache`: configuracion verificada de 4,43 GiB densos + 25,28 GiB de cache de expertos en una V100-32GB; la model card indica que es viable en GPUs de 24-32 GB.
- RAM del host: al menos 28,80 GB para los shards PLE solo-host (81 ficheros) accedidos por mmap.
- GPUs recomendadas: NVIDIA Tesla V100-PCIE-32GB (verificada, `sm_70`, CUDA 12.9 con preset `legacy-fp16`); arquitecturas Ampere, Ada, Hopper y Blackwell (RTX 30/40/50, A100, H100, PRO 6000) segun las instrucciones de compilacion con `CMAKE_CUDA_ARCHITECTURES="86;89;120a"`.
- Cabe en GPU consumer: si, en RTX 30/40/50 con 24-32 GB usando `TieredExpertCache`; no en `AllResident` salvo GPUs de 96 GB.
- Opciones de despliegue: exclusivamente el motor `atlas-ingine` (`ingine-serve` para API HTTP compatible con OpenAI, `ingine-bench` para medicion). No hay soporte indicado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput medidos: 6,29 tok/s en decodificacion greedy warm-cache (8 tokens) sobre V100 con `TieredExpertCache`; 3,03 s de carga y 1,44 s de prefill de 5 tokens. No hay datos de throughput en `AllResident` sobre Blackwell.
- Limitacion de escalado: el backend nativo `qwen4exp-cuda` solo soporta `INGINE_TP_SIZE=1` (una GPU); no hay tensor parallelism en esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Atlas3D/Qwen3.8-Flash-Next-atlas-70g-ingine | 101.139.398.528 (safetensors); 177B declarados en la model card | no disponible | MoE NVFP4 + densas FP8, safetensors | qwen-community-1.0 | Coseno 0,9757 vs oraculo FP32; 6,29 tok/s en V100 |
| Atlas3D/Qwen3.8-Flash-Next-atlas-56g-ingine | mismo modelo base | no disponible | MoE nucleo `atlas3` + boundary NVFP4, densas FP8 | qwen-community-1.0 | 59,22 GB GPU + 28,80 GB PLE; coseno 0,9722; 6,12 tok/s |
| unsloth/Qwen3.8-Flash-Next-GGUF (`UD-Q6_K_XL`) | mismo modelo base | no disponible | GGUF Q6_K_XL, 158 GB | qwen-community-1.0 | Fuente del recuantizado; sirve como oraculo FP32 de referencia |
| Qwen/Qwen3.8-Flash-Next | 177B (MoE) | no disponible | pesos originales | qwen-community-1.0 | Modelo base sin cuantizar |

## Limitaciones y advertencias

- El rendimiento real en SM120a (Blackwell) con `AllResident` para el modelo de 177B no se ha medido; la verificacion publicada es en V100 (`sm_70`) con `TieredExpertCache`.
- El perfil experimental `atlas-42g` (2,5 bits `ATLAS2` sin ponderar) se retiene y no se publica por degradacion en sondas factuales.
- El backend nativo solo soporta una GPU (`INGINE_TP_SIZE=1`); no hay tensor parallelism, lo que limita el escalado horizontal.
- El checkpoint es solo texto: la vision (`mmproj`) fue excluida, por lo que no puede procesar imagenes.
- La licencia Qwen Community License 1.0 impone condiciones adicionales para uso comercial; es necesario revisar el texto completo en `LICENSE` antes de desplegar en produccion.
- Al ser una recuantizacion de 4 bits (NVFP4) sobre MoE, existe degradacion medible frente al oraculo FP32 (coseno 0,9757, max_abs 2,9197, RMSE 0,5587); en tareas sensibles a precision puede no ser adecuado.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de sesgo ni de robustez para este checkpoint.
- Idiomas soportados no documentados en la model card.
- Dependencia fuerte del motor `atlas-ingine` (rama `main`): no es compatible con runtimes estandar como llama.cpp, vLLM u Ollama.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Atlas3D/Qwen3.8-Flash-Next-atlas-70g-ingine
- Perfil alternativo `atlas-56g`: https://huggingface.co/Atlas3D/Qwen3.8-Flash-Next-atlas-56g-ingine
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint GGUF de origen: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Motor de inferencia: https://github.com/Atlas3DSS/atlas-ingine
