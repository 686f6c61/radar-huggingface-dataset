# cyijun2k/glm-5.3-flash-tiny-random-nvfp4

## Resumen

Este repositorio contiene un checkpoint de prueba (fixture) determinista y aleatorio, derivado de la configuración y el esquema de tensores de `LibertAIDAI/GLM-5.3-Flash-NVFP4`, que a su vez es la cuantización NVFP4 del modelo multimodal `zai-org/GLM-5.3-Flash` de Z.ai (320B parámetros totales, 18B activos, arquitectura MoE híbrida con atención sparse y lineal). El fixture reduce el `hidden_size` de 4096 a 256, limita la pila a su primer ciclo de cuatro capas, recorta el contexto máximo a 8192 tokens y reduce la torre de visión a una sola capa pequeña, manteniendo intactas las dimensiones que seleccionan ramas de ejecución, kernels, layouts de pesos empaquetados y ABIs de caché.

Su propósito no es servir como modelo de lenguaje o visión, sino reproducir problemas de compatibilidad del cargador de vLLM, el layout de caché, la atención sparse, el MoE con NVFP4 y la decodificación especulativa MTP en hardware NVIDIA GB10 (SM121), sin necesidad de cargar el checkpoint completo de 320B. La salida del modelo es deliberadamente sin sentido y no debe usarse para tareas reales. El autor, `cyijun2k`, lo publica bajo licencia MIT junto con un runtime y parches de compatibilidad en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (3 capas KDA + 1 capa sparse MLA, con MLP denso en las primeras 3 capas, 288 expertos enrutados, 8 seleccionados, 1 compartido, 1 capa MTP) |
| Parametros totales | 703.209.240 |
| Parametros activos | no disponible (el modelo original GLM-5.3-Flash tiene 18B activos, pero el fixture no especifica este dato) |
| Longitud de contexto | 8192 (maximo reducido en el fixture) |
| Tipos de cuantizacion | NVFP4 (pesos empaquetados `U8`, escalas por bloque `F8_E4M3`, escalas globales `F32`) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors de 1.010.842.392 bytes, 5.342 tensores) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del GLM-5.3-Flash original en sus dimensiones criticas: patron de capas 3 KDA + 1 sparse MLA, 64 cabezas de atencion/KV, rango Q LoRA 1536 y KV LoRA 512, dimension QK NoPE 256 con RoPE 0, dimension de cabeza V 256, KDA con 64 cabezas de 128 dimensiones y convolution de 4, cabezas de indice 32 de 128 dimensiones, index top-k 2048 con k-pool 4, 288 expertos enrutados con 8 seleccionados y 1 compartido, tamano intermedio MoE 2048, MLP denso de 12288, y vocabulario de 154880 tokens. El `hidden_size` se reduce a 256 y la pila de 45 capas se recorta a su primer ciclo de cuatro capas, mas una capa MTP copiada, cubriendo asi KDA, MLP denso, sparse MLA, MoE enrutado NVFP4, expertos compartidos y decodificacion especulativa.

No hay entrenamiento: los pesos se inicializan de forma determinista con semilla 42 para el modelo y 4242 para los expertos. Los tensores de expertos enrutados usan la misma ABI de almacenamiento NVFP4 de ModelOpt que el checkpoint original, con las 1.728 proyecciones de expertos presentes. El objetivo es que cualquier incompatibilidad de runtime en GB10 se manifieste con este artefacto pequeno antes de intentar cargar el modelo completo.

## Capacidades

- No tiene capacidades reales de generacion de texto, razonamiento, codigo, matematicas o vision. Su salida es deliberadamente sin sentido.
- Sirve como banco de pruebas para el cargador de vLLM, el layout de caché sparse, la atencion sparse (GLM_NSA), el MoE con NVFP4 y la decodificacion especulativa MTP.
- Reproduce el layout fisico de fila sparse-MLA de 656 bytes: query con NoPE absorbido de 512 dimensiones mas 64 de padding a cero, y KV con latente FP8 de 512, cuatro escalas FP32 y 64 ceros BF16.
- Permite validar la especializacion de FlashInfer para `num_heads=64, topk=2176` tanto en decode como en prefill, necesaria en GB10.
- Verifica la necesidad de `--block-size 256` en vLLM por la divisibilidad del indice de caché con `index_kpool * 32`.

## Casos de uso

- Reproduccion de fallos de carga en vLLM con NVFP4 MoE en GB10: el fixture permite ejecutar el cargador de vLLM con un checkpoint de 1 GB en lugar de los cientos de GB del modelo completo, aislando errores de ABI de tensores, dtypes o layouts empaquetados.
- Validacion del layout de caché sparse en SM121: al mantener las dimensiones exactas de la atencion sparse MLA, se puede comprobar si el escritor de caché `fp8_ds_mla` requiere la region posicional fisica de 64 BF16 y si el padding absorbido de 512 a 576 preserva el producto escalar NoPE.
- Prueba de decodificacion especulativa MTP: con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` se verifica que la capa MTP funciona con el esquema de pesos NVFP4 y la caché sparse.
- Integracion continua de runtimes de inferencia: el checkpoint deterministico (semillas 42 y 4242) permite comparar salidas entre versiones de vLLM, FlashInfer o PyTorch para detectar regresiones numericas o de layout.
- Depuracion de kernels FlashInfer AOT: el fixture expone la necesidad de anadir la especializacion exacta `num_heads=64, topk=2176` para decode y prefill, y de recompilar el modulo para `sm_121a`, algo que no se puede hacer solo con editar Python o JIT.
- Verificacion de integridad de artefactos: con el hash SHA-256 documentado y el recuento de tensores (5.342), se puede auditar que un entorno de despliegue tiene el checkpoint correcto antes de escalar al modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas de lenguaje, vision o razonamiento en la informacion disponible. El unico rendimiento validado es de compatibilidad de runtime, documentado en la model card:

| Check | Resultado |
|---|---|
| Campos de configuracion criticos contra la revision fuente | 21/21 coinciden |
| Nombres de tensores del fixture con analogo en el fuente | 5342/5342 |
| Dtypes de pesos/escalas/escalas globales NVFP4 | `U8` / `F8_E4M3` / `F32` |
| Carga del modelo y `/health` | correcto |
| Chat corto compatible OpenAI + decode continuo | correcto |
| Prefill de 491 tokens + decode de 16 tokens | correcto |
| MTP con un token especulativo | correcto |

## Requisitos de hardware

- GPU: NVIDIA GB10 (SM121) especificamente. El fixture esta disenado para reproducir problemas en esa arquitectura; no se garantiza su funcionamiento en otras GPUs.
- VRAM: el checkpoint ocupa 1 GB en disco, y el ejemplo de ejecucion usa `--gpu-memory-utilization 0.10`, lo que sugiere que cabe en cualquier GPU con al menos 2-4 GB de VRAM, aunque el proposito es probar en GB10.
- Despliegue: vLLM con la imagen base `vllm/vllm-openai:glm53-flash-arm64-cu130` y el runtime parcheado `ghcr.io/cyijun/glm-5.3-flash-nvfp4-gb10:vllm-glm53-sm121`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Parametros de ejecucion recomendados: `--max-model-len 512`, `--max-num-seqs 2`, `--block-size 256`, `--moe-backend marlin`, `--enforce-eager`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existe un modelo directamente comparable, ya que se trata de un artefacto de prueba unico. La unica referencia razonable es el modelo del que deriva, aunque no son comparables en tamano ni proposito:

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| cyijun2k/glm-5.3-flash-tiny-random-nvfp4 (este fixture) | 703M | 8192 | Pruebas de compatibilidad en GB10 | MIT |
| LibertAIDAI/GLM-5.3-Flash-NVFP4 | 320B (18B activos) | no disponible | Inferencia multimodal en produccion con vLLM | MIT |
| zai-org/GLM-5.3-Flash | 320B (18B activos) | no disponible | Modelo multimodal de proposito general | MIT |

## Limitaciones y advertencias

- No es un modelo util: su salida es deliberadamente sin sentido y no debe usarse para tareas de lenguaje, vision, codigo o razonamiento.
- Pesos aleatorios: no ha sido entrenado, solo inicializado con semillas fijas (42 y 4242). Cualquier resultado de generacion es ruido.
- Requiere parches especificos: el runtime de vLLM necesita tres cambios de compatibilidad documentados (region posicional fisica en el escritor de caché, especializacion FlashInfer para topk 2176, y recompilacion para `sm_121a`). Sin ellos, la carga falla.
- Limitado a GB10: el fixture esta pensado para SM121; no se garantiza su comportamiento en otras arquitecturas.
- Contexto reducido: 8192 tokens maximo, muy por debajo del contexto del modelo original, por lo que no sirve para probar escenarios de contexto largo.
- Vision tower reducida a una sola capa pequena: no reproduce fielmente el comportamiento multimodal del modelo original.
- No usar en produccion: es un artefacto de depuracion, no un modelo de inferencia.

## Enlaces

- Repositorio HuggingFace del fixture: https://huggingface.co/cyijun2k/glm-5.3-flash-tiny-random-nvfp4
- Modelo base cuantizado: https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Runtime y parches para GB10: https://github.com/cyijun/glm-5.3-flash-nvfp4-gb10
- Documentacion oficial de GLM-5.3 de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentacion de Unsloth para GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3
- Ficha de Baseten para GLM-5.3-Flash: https://www.baseten.co/library/glm-53-flash/
