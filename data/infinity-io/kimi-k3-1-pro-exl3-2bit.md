# Infinity-io/Kimi-K3.1-Pro-EXL3-2bit

## Resumen

Kimi-K3.1-Pro-EXL3-2bit es una cuantizacion de 2 bits de los expertos enrutados (routed experts) del modelo Kimi-K3.1-Pro, desarrollado originalmente por Moonshot AI. La publica Infinity-io como checkpoint EXL3 de tipo `exl3-v1` y como paquete de produccion firmado por Local Inference Lab para el runtime propietario Flare. El objetivo es reducir el peso del modelo base (57.369.533.184 parametros totales segun los safetensors) hasta un tamano manejable en un nodo de ocho GPU Blackwell SM120, manteniendo en BF16/FP32 los tensores sensibles (atencion DSA, shared experts, routers, embeddings y `lm_head`).

La version `gb202` incorpora decodificacion especulativa DSpark (draft sliding-window con `k=7`), vision encoder sharded en TP8 con cuantizacion MXFP8, y una ventana de contexto maxima de 1.048.576 tokens con 1.105.920 tokens de KV fisica compartida. El paquete esta pensado para servirse directamente con `flare run` sin Python, Torch, compilacion ni autotuning, y reporta 235,30 tok/s en decode concurrente de 4 peticiones y 2.235,14 tok/s en prefill de 32K sin cache.

Es relevante porque demuestra una via practica de servir un modelo de razonamiento y codigo de gran tamano en hardware de workstation (RTX PRO 6000 Blackwell de 96 GB) mediante cuantizacion extrema selectiva y decodificacion especulativa, algo que con pesos BF16 completos requeriria un cluster mucho mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MoE enrutado y atencion DSA; incluye vision encoder, KDA y capa densa en Layer 0 (detalles completos no disponibles) |
| Parametros totales | 57.369.533.184 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (max seq en paquete `gb202`); version previa limitada a 262.144 |
| Tipos de cuantizacion | EXL3 2-bit (trellis) en expertos enrutados; MXFP8 en KDA input, KDA `o_proj` y vision encoder; NVFP4 en cabeza DSpark; FP8 en `markov_w1`; BF16/FP32 en tensores no expertos |
| Idiomas soportados | no disponible |
| Licencia | `other` (licencia nombrada `kimi-k3.1-pro`, fichero LICENSE en el repo) |
| Formato de pesos | safetensors (checkpoint `exl3-v1` en `main`, 742,235 GiB; paquete Flare `gb202`, 721,81 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que combina atencion DSA (DeepSeek-style attention, segun la nomenclatura del autor), capas KDA, 92 shared experts y 92 proyecciones latentes enrutadas `down/up`, ademas de una capa densa en Layer 0 y un vision encoder. La cuantizacion EXL3 aplica trellis de 2 bits exclusivamente a los expertos enrutados; el resto de tensores conserva los bytes BF16/FP32 originales en la revision `main`. El paquete `gb202` reempaqueta esa misma cuantizacion con sharding TP8/DCP8 y anade un draft especulativo DSpark con ventana deslizante de `k=7` tokens.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en la informacion proporcionada. Las innovaciones tecnicas documentadas son de inferencia: dispatch `trellis_t256` W2A16 para decode con roofline MXFP8 en prefill (96,2-96,9% de 1.098 GB/s de `dlut_smem`), rotaciones gate+up empaquetadas bit-exactas (-112,2 MiB/GPU), colectivos PCIe TP8 fusionados (`GatherRouterTopKTP8`, 3,28x mas rapido en routing; `TP8RoMix7168`/`TP8RoResNorm7168`, -184 lanzamientos por ronda) y `ConcurrentChunkedAllReduce` de 256 filas con solapamiento 1024+1024.

## Capacidades

- Generacion de texto y razonamiento multi-paso (el modelo base Kimi-K3.1-Pro es de proposito general; el paquete reporta sesiones de codigo con tokens de razonamiento).
- Generacion de codigo: benchmarks nativos con Rust C1 y sesiones de coding de 9 peticiones concurrentes.
- Procesamiento de vision: vision encoder con hasta 16.384 parches / 3,2 MP en HD y 4 imagenes concurrentes.
- Decodificacion especulativa DSpark integrada (`k=7`, `--mtp-only`) para acelerar la generacion.
- Contexto largo: hasta 1.048.576 tokens con KV fisica de 1.105.920 tokens (1.080 paginas x 1.024, 28 snapshots).
- Servido como API compatible con OpenAI mediante `flare run` (`--served-model-name`, host/puerto configurables).
- Soporte de prefix caching en memoria (64G configurado en el ejemplo) y limite de KV por memoria.
- Tool calling / function calling y soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio de generacion de codigo en produccion: el paquete `gb202` alcanza 110,65 tok/s agrupados en 9 peticiones concurrentes de coding (pico 125,86 tok/s), adecuado para asistentes de IDE o pipelines de CI/CD que necesiten completar y revisar codigo con contexto largo.
- Analisis de repositorios completos: con 1.048.576 tokens de contexto se puede cargar un repositorio mediano entero y hacer preguntas de arquitectura, refactorizacion o busqueda de bugs sin trocear el codigo.
- Razonamiento sobre documentacion extensa: informes, normativas o papers de decenas de miles de tokens caben en una sola ventana, con prefill de 32K a 2.235,14 tok/s (13,22 s de TTFT sobre 29.557 tokens).
- Procesamiento de documentos con imagenes: el vision encoder admite hasta 4 imagenes concurrentes de 3,2 MP, util para extraer datos de capturas, diagramas o formularios escaneados junto con texto.
- Generacion de codigo interactiva de larga duracion: la sesion de Tetris reportada sostiene 147,97 tok/s de media (pico 260,41 tok/s) durante 24.584 tokens de salida, lo que sirve para tareas agenticas de escritura de codigo prolongada.
- Despliegue on-premise en un solo nodo: ocho RTX PRO 6000 Blackwell de 96 GB con P2P permiten servir el modelo sin cluster multinodo, util para equipos con requisitos de soberania de datos.
- Evaluacion e investigacion de cuantizacion extrema: el checkpoint `main` permite reexportar y comparar recetas EXL3 con otros runtimes conscientes de EXL3.

## Benchmarks y rendimiento

Resultados nativos medidos por el autor en 8x RTX PRO 6000 Blackwell (SM120), PCIe Relaxed Ordering activado, 16.365 MHz, 99,80% de utilizacion media de GPU, 421,0 W medios / 470,2 W maximos:

| Carga de trabajo | Resultado | Notas |
|---|---:|---|
| Decode concurrente 4 peticiones (agrupado) | 235,30 tok/s (58,82/pet.) | +48,5% frente a `gb202` previo (158,45 tok/s); ronda exacta M=16 en 35,78 ms |
| Decode Rust C1, media de 3 semillas | 112,13 tok/s | Semillas 359/431/533: 115,15 / 104,98 / 116,26 tok/s |
| Decode coding C1, 9 peticiones (agrupado) | 110,65 tok/s | Pico 125,86 tok/s; ronda exacta M=4 en 19,17 ms |
| Prefill 32K sin cache (media) | 2.235,14 tok/s | TTFT 13,22 s sobre 29.557 tokens (+14,6% frente a 1.951,16 tok/s) |
| Sesion de coding Tetris de salida larga | 147,97 tok/s de media con TTFT | 24.584 tokens de completion en 166,1 s; pico 260,41 tok/s |
| Capacidad KV fisica | 1.105.920 tokens | 1.080 paginas x 1.024 tokens, 28 snapshots, max seq 1.048.576 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: 93.380,54 MiB retenidos por GPU en la configuracion de referencia (8 GPU), con 721,81 GiB de paquete en disco y ~750 GiB de cache.
- GPU recomendadas: ocho NVIDIA RTX PRO 6000 Blackwell Workstation de 96 GB (SM120) con P2P habilitado; es el unico hardware validado en la model card. No se documenta soporte para A100, H100 ni otras generaciones.
- GPU de consumo: no cabe en ninguna GPU de consumo individual; el modelo requiere un nodo de 8 GPU de 96 GB.
- Software: Linux x86-64, CUDA 13.2, driver NVIDIA 615.71.10, runtime Flare (sin Python, Torch ni compilacion). Se recomienda activar PCIe Relaxed Ordering (`NVreg_EnablePCIERelaxedOrderingMode=1`) para el throughput de colectivos PCIe Gen5.
- Despliegue: `flare run` con revision `gb202`, `--max-concurrency 4`, `--mtp-draft-tokens 7`, `--kv-cache-limit memory`, `--prefix-cache-memory 64G`; se sirve como endpoint compatible con OpenAI en el puerto indicado.
- Latencia y throughput: TTFT de 13,22 s en prefill de 29.557 tokens; decode de 58,82 tok/s por peticion con 4 concurrentes y de 110,65 tok/s agrupados con 9 peticiones de coding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-EXL3-2bit (este) | 57.369.533.184 | 1.048.576 | EXL3 2-bit + MXFP8 selectivo | `other` (kimi-k3.1-pro) | 8x RTX PRO 6000 Blackwell 96 GB |
| Kimi-K3.1-Pro (base BF16) | no disponible | no disponible | BF16/FP32 | kimi-k3.1-pro | no disponible |
| Kimi-K3.1-Pro-DSpark (base del paquete) | no disponible | no disponible | BF16 | no disponible | no disponible |
| `gb202` previo (`20261108`) | mismos pesos | 262.144 | EXL3 2-bit + MXFP8 `all` | kimi-k3.1-pro | 8x RTX PRO 6000 Blackwell 96 GB |

No se dispone de datos de benchmarks de calidad ni de especificaciones completas de las variantes base en la informacion proporcionada, por lo que la comparativa se limita a las dimensiones documentadas.

## Limitaciones y advertencias

- La licencia es `other` con nombre `kimi-k3.1-pro`; las condiciones exactas de uso comercial no estan disponibles en la informacion proporcionada y deben revisarse en el fichero LICENSE del repositorio.
- El paquete `gb202` esta firmado por Local Inference Lab y requiere verificar `publisher.json` con `--publisher-keys`; sin esa verificacion el runtime Flare no lo cargara.
- Dependencia de hardware muy especifica: ocho GPU SM120 de 96 GB con P2P, CUDA 13.2 y driver 615.71.10. No hay soporte documentado para otras GPU ni para despliegue multinodo.
- La cuantizacion de 2 bits en los expertos enrutados puede degradar la calidad frente al modelo BF16; no se publican evaluaciones de calidad que cuantifiquen esa perdida.
- El checkpoint `main` no es directamente servible: requiere un runtime consciente de EXL3 para preparar o reexportar los pesos.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingue homogeneo.
- El contexto maximo de 1.048.576 tokens depende de la configuracion de KV (1.105.920 tokens fisicos); reducirlo o aumentar la concurrencia puede agotar la VRAM retenida (93.380,54 MiB/GPU).
- El repo ocupa 797,0 GB y requiere ~750 GiB de disco adicionales para la cache del paquete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinity-io/Kimi-K3.1-Pro-EXL3-2bit
- Revision de produccion `gb202`: https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit/tree/gb202-tp8-dcp8-c4-dspark-kda-all-20261123
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Modelo base del paquete (DSpark): https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark
- Fichero del publicador: https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit/resolve/gb202/publisher.json
