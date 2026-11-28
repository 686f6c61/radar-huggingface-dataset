# local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit

## Resumen

Kimi-K3.1-Pro-EXL3-2bit es una cuantizacion de 2 bits del modelo Kimi-K3.1-Pro (desarrollado originalmente por Moonshot AI) realizada por Local Inference Lab. Se distribuye como un checkpoint EXL3 de tipo trellis que comprime exclusivamente los pesos de los expertos enrutados del MoE, manteniendo el resto de tensores (atencion DSA, shared experts, routers, embeddings y cabeza de salida) en BF16/FP32. El objetivo es hacer viable el despliegue de un modelo de aproximadamente 57.370 millones de parametros en hardware de gama alta para workstation, en concreto ocho GPUs Blackwell SM120 de 96 GB.

El repositorio ofrece dos representaciones: la revision `main`, un checkpoint EXL3 crudo e inmutable de 742,235 GiB pensado para reexportar con un runtime compatible con EXL3, y la revision `gb202`, un paquete Flare firmado y listo para servir directamente sin Python, Torch ni compilacion. Esta segunda revision incorpora decodificacion especulativa DSpark (k=7), vision MoonViT completa de 65.536 parches (12,8 MP), contexto maximo de 1.048.576 tokens y una capacidad de KV fisica compartida de 1.018.880 tokens.

Su relevancia actual radica en que demuestra que un modelo de esta escala puede servirse de forma nativa en un nodo de ocho GPUs consumer-profesional con un throughput de decodificacion agrupada de 240,85 tok/s (cuatro peticiones concurrentes) y un prefill de 32K sin cache de 2.276,7 tok/s, gracias a optimizaciones especificas para SM120 (trellis_t256 W2A16, colectivos PCIe fusionados y preservacion BF16 selectiva).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion DSA, expertos compartidos y enrutados, vision MoonViT y decodificacion especulativa DSpark (checkpoint cuantizado EXL3 trellis) |
| Parametros totales | 57.369.533.184 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) en la revision `gb202`; 262.144 en la revision legacy |
| Tipos de cuantizacion | EXL3 2-bit (trellis_t256) para expertos enrutados; MXFP8 para entrada KDA, `o_proj` KDA, MoonViT TP8 y cuerpo del draft DSpark; NVFP4 en la cabeza del draft; FP8 en `markov_w1`; BF16 puro en atencion DSA, indexers, shared experts, proyecciones latentes enrutadas, routers, MLP denso de capa 0, `embed_tokens` y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (EXL3 crudo en `main`; paquete Flare firmado en `gb202`) |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro emplea una arquitectura MoE con atencion DSA (DeepSeek Sparse Attention) distribuida en 24 capas, 92 expertos compartidos y 92 proyecciones latentes enrutadas, ademas de un MLP denso en la capa 0. La cuantizacion EXL3 actua solo sobre los expertos enrutados mediante un esquema trellis de 2 bits (`trellis_t256`) con decodificacion W2A16, mientras que el resto de componentes se preserva en BF16 para evitar perdida de calidad en atencion, routers y capas de salida. La vision se resuelve con un encoder MoonViT que en la revision `gb202` se fragmenta en TP8 y se cuantiza a MXFP8, reduciendo su huella de 853,3 MiB/GPU a 71,1 MiB/GPU.

El paquete `gb202` incorpora varias optimizaciones especificas para SM120: despacho trellis_t256 con roofline MXFP8 en prefill (96,2-96,9% de utilizacion de `dlut_smem`), rotaciones empaquetadas bit-exactas de gate+up (-112,2 MiB/GPU), colectivos PCIe fusionados (`GatherRouterTopKTP8` con 3,28x de mejora, `TP8RoMix7168`/`TP8RoResNorm7168` con -184 lanzamientos por ronda) y un `ConcurrentChunkedAllReduce` de 256 filas con solapamiento 1024+1024. La decodificacion especulativa usa el draft Inferact DSpark con k=7, modo `--mtp-only`, cuerpo MXFP8 y cabeza NVFP4. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento de proposito general sobre el modelo base Kimi-K3.1-Pro.
- Capacidades de vision nativa con MoonViT: soporta entradas de hasta 65.536 parches (12,8 MP), incluyendo capturas 4K (3840x2160), fotos 4:3 de 12 MP (4032x3024) y entradas completas de 3584x3584 (16.384 tokens de imagen), con hasta cuatro imagenes concurrentes.
- Contexto largo de hasta 1.048.576 tokens con 1.018.880 tokens de KV fisica compartida (995 paginas de 1.024 tokens, 25 snapshots).
- Decodificacion especulativa integrada mediante DSpark con 7 tokens de borrador por paso.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia de contexto largo en produccion: con 1M de tokens de contexto y 1.018.880 tokens de KV fisica, el modelo puede mantener conversaciones o analisis sobre documentos extensos (por ejemplo, bases de codigo completas o expedientes de cientos de miles de tokens) sin truncamiento, sirviendose via `flare run` en un nodo de ocho GPUs.
- Analisis de documentos visuales de alta resolucion: la vision MoonViT a 65.536 parches permite procesar capturas 4K, fotografias de 12 MP y diagramas tecnicos densos, util para extraccion de informacion de planos, interfaces de usuario o documentos escaneados.
- Generacion de codigo en pipelines de CI/CD: con un throughput de decodificacion de 111,04 tok/s agrupado en 9 peticiones concurrentes (pico de 126,62 tok/s) y 113,06 tok/s en decodificacion Rust C1, es adecuado para tareas de autocompletado, revision de parches y generacion de tests en entornos de integracion.
- Asistentes conversacionales de baja latencia: con 60,21 tok/s por peticion en concurrencia de 4 y un TTFT de 12,98 s para 29.560 tokens en prefill de 32K, encaja en escenarios de atencion al usuario donde se requiere contexto amplio y respuesta sostenida.
- Procesamiento batch de razonamiento sobre corpus largos: el prefill de 2.276,7 tok/s permite ingerir grandes volumenes de texto por adelantado y reutilizar la cache de prefijos (64G en RAM configurados en el ejemplo de despliegue) para consultas repetidas sobre el mismo contexto.
- Despliegue on-premise con requisitos de soberania de datos: al ejecutarse de forma nativa sin Python ni Torch y con un paquete firmado por el publicador, facilita auditoria y control en entornos que no pueden depender de servicios en la nube.
- Investigacion sobre cuantizacion extrema: la separacion entre revision `main` (checkpoint EXL3 crudo) y `gb202` (paquete listo para servir) permite estudiar el impacto de la cuantizacion 2-bit en expertos enrutados manteniendo el resto en BF16.

## Benchmarks y rendimiento

Resultados medidos de forma nativa con `flare run` en ocho RTX PRO 6000 Blackwell (SM120), `RO=1`, 16.365 MHz, 99,88% de utilizacion media de GPU, 456,5 W medios y 509,9 W maximos, con muestreo `temperature=1.0`, `top_p=0.95`:

| Carga de trabajo | Resultado | Notas |
|---|---:|---|
| Decodificacion concurrente de 4 peticiones (agrupada) | 240,85 tok/s (60,21/req) | +52,0% frente al paquete `gb202` legacy (158,45 tok/s) |
| Decodificacion Rust C1, media de 3 semillas | 113,06 tok/s | Semillas 359/431/533: 110,32 / 111,86 / 116,99 tok/s |
| Decodificacion C1 con 9 peticiones de codigo (agrupada) | 111,04 tok/s | Pico de 126,62 tok/s |
| Prefill de 32K sin cache (media) | 2.276,7 tok/s | TTFT de 12,98 s sobre 29.560 tokens (+16,7% frente a 1.951,16 tok/s legacy) |
| Capacidad de KV fisica | 1.018.880 tokens | 995 paginas de 1.024 tokens, 25 snapshots, 93.500,54 MiB/GPU de VRAM retenida |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 93.500,54 MiB/GPU retenidos en el paquete `gb202` para el modelo y la KV fisica completa; el encoder de vision anade 71,1 MiB/GPU en TP8.
- GPUs recomendadas: ocho NVIDIA RTX PRO 6000 Blackwell Workstation de 96 GB (SM120) con P2P habilitado; es el unico hardware verificado en la model card.
- GPUs consumer: no cabe en GPUs consumer convencionales; requiere el nodo de ocho GPUs de 96 GB descrito.
- Software: Linux x86-64, CUDA 13.2, driver NVIDIA 615.71.10, aproximadamente 750 GiB de disco para la cache del paquete y `ulimit -Sn 65536`.
- Configuracion del host: se recomienda habilitar PCIe Relaxed Ordering mediante `options nvidia NVreg_EnablePCIERelaxedOrderingMode=1` en `/etc/modprobe.d/nvidia-relaxed-ordering.conf` y verificar con `grep EnablePCIERelaxedOrderingMode /proc/driver/nvidia/params`.
- Despliegue: runtime nativo `flare run` con `--revision gb202`, `--max-concurrency 4`, `--mtp-draft-tokens 7`, `--kv-cache-limit memory`, `--embedding-table-storage ram`, `--prefix-cache-memory 64G` y `--prefix-cache-disk-limit 0`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones soportadas.
- Latencia y throughput: TTFT de 12,98 s para 29.560 tokens en prefill de 32K; 240,85 tok/s agrupados con 4 peticiones; 111,04-113,06 tok/s en decodificacion C1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-EXL3-2bit (`gb202`) | 57.369.533.184 | 1.048.576 | EXL3 2-bit + MXFP8/NVFP4/FP8 selectivos | `kimi-k3.1-pro` | 8x RTX PRO 6000 Blackwell 96 GB |
| Kimi-K3.1-Pro-EXL3-2bit (`gb202` legacy `20261108`) | 57.369.533.184 | 262.144 | EXL3 2-bit con `--online-mxfp8-scope all` | `kimi-k3.1-pro` | 8x RTX PRO 6000 Blackwell 96 GB |
| Kimi-K3.1-Pro (modelo base, BF16) | no disponible | no disponible | BF16/FP32 | `kimi-k3.1-pro` | no disponible |
| Inferact/Kimi-K3.1-Pro-DSpark (modelo base del draft) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion EXL3 2-bit de los expertos enrutados puede degradar la calidad respecto al modelo base BF16; no se han publicado evaluaciones de calidad (perplejidad, benchmarks) que cuantifiquen esa perdida.
- El paquete `gb202` esta firmado y optimizado para un hardware muy concreto (ocho SM120 de 96 GB con P2P); no es portable a otras configuraciones sin reexportar desde la revision `main`.
- La licencia `kimi-k3.1-pro` esta etiquetada como `other` y no se detallan en la informacion disponible las restricciones de uso comercial; es necesario consultar el archivo `LICENSE` del repositorio antes de un despliegue en produccion.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni comportamiento multilingue del modelo.
- El contexto maximo de 1M tokens depende de la KV fisica compartida (1.018.880 tokens); superar ese limite requiere gestion adicional no documentada.
- El rendimiento medido (240,85 tok/s agrupados, 2.276,7 tok/s de prefill) corresponde a un unico entorno verificado con overclock a 16.365 MHz y PCIe Relaxed Ordering activado; en configuraciones por defecto el throughput puede ser inferior.
- Requiere driver 615.71.10, CUDA 13.2 y aproximadamente 750 GiB de disco, lo que eleva el coste de infraestructura y limita el despliegue a entornos dedicados.
- El repositorio ocupa 1.572 GB, con la revision `main` en 742,235 GiB y `gb202` en 721,82 GiB.

## Enlaces

- Hugging Face: https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit
- Revision `gb202` (paquete Flare firmado): https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit/tree/gb202-tp8-dcp8-c4-dspark-kda-all-v65536-20261125
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Modelo base del draft DSpark: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark
- Claves del publicador: https://huggingface.co/local-inference-lab/Kimi-K3.1-Pro-EXL3-2bit/resolve/gb202/publisher.json
