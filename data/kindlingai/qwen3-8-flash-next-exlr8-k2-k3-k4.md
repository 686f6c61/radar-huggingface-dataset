# kindlingai/Qwen3.8-Flash-Next-exlr8-k2-k3-k4

## Resumen

Qwen3.8-Flash-Next exlr8 (K2/K3/K4) es una cuantización del modelo Qwen3.8-Flash-Next de Qwen, publicada por kindlingai en formato exlr8 v2. Se trata de una build orientada a dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10), servible en una a cuatro cajas mediante tensor-parallel. El modelo base es un MoE híbrido de 48 capas de texto que combina 36 capas de atención lineal Gated DeltaNet con 12 capas de atención GQA-12 completa, e incorpora un indexador disperso QSA de bloque 4, hiper-conexiones de bajo rango de 4 streams y 512 expertos enrutados con top-10 más un experto compartido por capa.

La relevancia de esta release reside en el formato: los expertos enrutados y compartidos de las 48 capas se almacenan en tres anchuras de trellis (K2, K3 y K4) sobre el codebook `pmcgx`, y la anchura de servicio se elige en tiempo de carga. Los pesos densos, el vocabulario, el drafter MTP y el rowstore PLE de Layer-1 se mantienen en BF16. El repositorio ocupa 16,4 GB, aunque el footprint residente real por anchura va de 45,7 GB (K2) a 75,9 GB (K4), más un rowstore PLE de 102,4 GB que reside en NVMe local.

Es importante señalar que esta versión es solo texto en v0.1: la torre de visión no está incluida, pese a que el pipeline declarado sea image-text-to-text. Además, los pesos no son utilizables sin redondeo E4M3: cualquier loader debe redondear cada valor producido por el codebook trellis a FP8 E4M3 (round to nearest even, saturante) antes de aplicar los vectores laterales, ya que el encoder buscó únicamente sobre valores redondeados a E4M3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: 48 capas de texto (36 Gated DeltaNet linear-attention + 12 GQA-12 full attention con indexador QSA disperso de bloque 4 en capas 3, 7, ..., 47); hiper-conexiones de bajo rango 4 × 2560 (rank 320); PLE Layer-1 2/3-gram (320.001.536 × 160 BF16); drafter especulativo MTP de 1 capa full-attention |
| Parametros totales | no disponible |
| Parametros activos | 512 expertos enrutados con top-10 + 1 experto compartido con compuerta por capa (recuento de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 trellis `pmcgx` con anchuras K2 (2,0 bpw), K3 (3,0 bpw) y K4 (4,0 bpw) sobre expertos; BF16 en trunk denso, vocabulario, MTP y PLE rowstore; requiere redondeo E4M3 en carga |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (exlr8: `experts/exlr8-layer-LLL.kK.safetensors`, `experts/exlr8-layer-LLL.index.safetensors`, `dense/exlr8-dense.safetensors`, `ple/exlr8-ple-L001.bin`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next (`Qwen4ExpForConditionalGeneration`) es un MoE híbrido con 48 capas de texto: 36 capas de atención lineal Gated DeltaNet y 12 capas de atención completa GQA-12, con un indexador disperso QSA de bloque 4 insertado en las capas 3, 7, ..., 47. Emplea hiper-conexiones de bajo rango de 4 streams (4 × 2560, rank 320), una tabla PLE Layer-1 de 2/3-gram de 320.001.536 × 160 en BF16, 512 expertos enrutados con top-10 más un experto compartido con compuerta por capa, embeddings y LM head independientes de 248.320 tokens, y un drafter especulativo MTP de 1 capa full-attention (`mtp.layers.0`).

Esta release cuantiza exclusivamente los expertos enrutados y compartidos de las capas 0-47 a `pmcgx` K2/K3/K4, manteniendo en BF16 las proyecciones densas, el vocabulario, el drafter MTP y el rowstore PLE de Layer-1. Cada anchura es una codificación trellis independiente y Hessian-aware: los códigos no anidan entre anchuras y las tres usan el codebook E4M3 `pmcgx`. Los tamaños de archivo por capa son exactos: 630.538.240 bytes en K2, 945.709.056 bytes en K3 y 1.260.879.872 bytes en K4 (513 expertos × 3 proyecciones × 2560 × 640 más 64 KiB de alineación de sección). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en modalidad solo texto (la torre de visión no está incluida en v0.1).
- Razonamiento y decodificación especulativa multi-paso mediante el drafter MTP de 1 capa, con `--mtp 0..3` y paridad greedy byte-idéntica entre configuraciones MTP.
- Servicio en tensor-parallel de TP=1 a TP=4, con escalado de anchura en vivo entre TP=1..4 mediante `GR8_PTAB=2` y `bin/g6layout`.
- Streaming asíncrono de filas PLE de Layer-1 desde NVMe local por token, con caché LRU de host (1 GiB por defecto).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Despliegue en DGX Spark con una sola caja: la anchura K3 (por defecto en `gr8`) ocupa 60,8 GB residentes y cabe en un box de 128 GB, sirviendo a TP=1 con 32,69 tok/s en `c1` sin MTP y 56,05 tok/s con `MTP=3`, lo que permite montar un nodo de inferencia de texto de altas prestaciones sin infraestructura de datacenter.
- Escalado horizontal a dos cajas: con TP=2 y anchura K3 se alcanzan 81,90 tok/s en `c1` con `MTP=3` y 228,18 tok/s agregados en `c5`, útil para servir cargas conversacionales concurrentes manteniendo una huella por nodo dentro de los 128 GB.
- Máxima calidad por caja única: la anchura K4 (75,9 GB residentes) también cabe en un box de 128 GB y ofrece 54,28 tok/s en `c1` con `MTP=3` a TP=1, adecuada cuando la fidelidad de los expertos prima sobre el throughput.
- Procesado de contexto largo: con `P=2048` y anchura K3 se obtienen 1.018,4 tok/s de prefill y 32,12 tok/s de decode en solitario a TP=1, y 1.176,6 tok/s de prefill a TP=2, lo que habilita tareas de resumen y análisis de documentos extensos en hardware de un solo nodo.
- Restricción de huella mínima: la anchura K2 (45,7 GB residentes) es la opción de menor consumo de memoria y sigue sirviendo a TP=1..4, apropiada para entornos donde el resto de la VRAM/RAM debe quedar libre para otras cargas.
- Inferencia con latencia controlada por decodificación especulativa: `MTP=3` alcanza 71%-85% de aceptación de borradores (3,13-3,50 tok/round) en prosa técnica, lo que permite ajustar latencia por petición según la carga sin alterar la salida greedy.

## Benchmarks y rendimiento

Resultados medidos con kindlingai/gr8 el 2026-11-22 en boxes GB10 (DGX Spark) con almacenamiento local NVMe, `GR8_QW38_DENSE_FP8=1`, `GR8_QW38_PLE_ASYNC=1`, `GR8_QW38_GRAPH=1` y RoCE dual-rail (`GR8_QW38_FAST_AR=1`) en TP=2. Prosa en inglés (`P=30`, `gen=96` para `c1`, `gen=64` para `c5`):

| Configuracion | Manifest | MTP=0 c1 | MTP=1 c1 | MTP=2 c1 | MTP=3 c1 | MTP=0 c5 agg | MTP=3 c5 agg |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 box (TP=1) | bit300 | 32,69 tok/s | 45,23 tok/s | 52,68 tok/s | 56,05 tok/s | 135,62 tok/s | 165,87 tok/s |
| 1 box (TP=1) | bit400 | — | — | — | 54,28 tok/s | — | — |
| 2 boxes (TP=2) | bit300 | 48,55 tok/s | 68,79 tok/s | 80,17 tok/s | 81,90 tok/s | 200,00 tok/s | 228,18 tok/s |
| 2 boxes (TP=2) | bit400 | — | — | — | 78,20 tok/s | — | 179,14 tok/s |

Prefill de contexto largo y decode en solitario (`MTP=0`, `bit300`):

| Configuracion | P=128 solo decode | P=2048 prefill | P=2048 solo decode |
|---|---:|---:|---:|
| 1 box (TP=1) | 34,41 tok/s (bit400: 32,88) | 1.018,4 tok/s | 32,12 tok/s |
| 2 boxes (TP=2) | 51,52 tok/s | 1.176,6 tok/s | 46,82 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM residente por anchura: 45,7 GB en K2, 60,8 GB en K3 y 75,9 GB en K4, incluyendo 0,32 GB de índice/side data de expertos y 15,11 GB de BF16 denso, vocabulario y MTP (9,90 GB sin MTP).
- Almacenamiento NVMe local obligatorio para el rowstore PLE (`ple/exlr8-ple-L001.bin`, 102,40 GB / 95,37 GiB), leído por token vía `O_DIRECT` `pread` a una caché LRU de host de 1 GiB por defecto.
- GPU recomendadas: dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10); no se documentan A100, H100 ni RTX 4090 para este formato.
- Cabe en consumer GPU: no disponible; la release está diseñada para boxes GB10 de 128 GB, no para GPUs de consumo.
- Opciones de despliegue: motor exlr8-nativo kindlingai/gr8 (`./gr8 qw38`), con TP=1 a TP=4 y escalado de anchura en vivo mediante `GR8_PTAB=2` y `bin/g6layout`. vLLM, llama.cpp, Ollama y TGI no están documentados como compatibles.
- Latencia y throughput: ver tabla de benchmarks; `MTP=3` logra 71%-85% de aceptación de borradores y paridad greedy byte-idéntica entre `MTP=0, 1, 2, 3` y `GR8_PTAB=0` vs `GR8_PTAB=2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kindlingai/Qwen3.8-Flash-Next-exlr8-k2-k3-k4 | no disponible (MoE 512 expertos top-10, 48 capas) | no disponible | 56,05 tok/s c1 TP=1 MTP=3 (K3) | qwen-community-1.0 | Hugging Face, formato exlr8 |
| kindlingai/glm-5.3-exlr8-k2-k3-k4 | no disponible | no disponible | no disponible | no disponible | Hugging Face, formato exlr8 compartido |
| kindlingai/glm-5.3-flash-exlr8-k2-k3-k4 | no disponible | no disponible | no disponible | no disponible | Hugging Face, formato exlr8 compartido |

Los dos modelos GLM comparten el formato y la descripción byte-level del loader con esta release; no se dispone de datos de parámetros, contexto, rendimiento ni licencia para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los pesos no son utilizables sin redondeo E4M3: un decoder EXL3 estándar, o cualquier decoder que omita el redondeo, lee pesos mediblemente peores de los mismos bytes. El redondeo (round to nearest even, saturante) forma parte del formato.
- La release es solo texto en v0.1: la torre de visión no está incluida, pese al pipeline image-text-to-text declarado.
- El rowstore PLE de 102,4 GB debe residir en NVMe local; no cabe en memoria de GPU y depende de lectura `O_DIRECT` por token con caché LRU de 1 GiB, lo que condiciona el despliegue a hardware con almacenamiento rápido.
- Las anchuras K2/K3/K4 son codificaciones independientes: los códigos no anidan entre anchuras, por lo que no se puede cambiar de anchura sin recargar desde el archivo correspondiente.
- Compatibilidad de motores limitada: solo kindlingai/gr8 está documentado; no hay soporte conocido en vLLM, llama.cpp, Ollama o TGI.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia qwen-community-1.0 (license: other): deben revisarse las restricciones de uso comercial en el archivo LICENSE antes de producción.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información proporcionada.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K), por lo que no es posible evaluar la degradación introducida por la cuantización frente al modelo base.

## Enlaces

- [Hugging Face: kindlingai/Qwen3.8-Flash-Next-exlr8-k2-k3-k4](https://huggingface.co/kindlingai/Qwen3.8-Flash-Next-exlr8-k2-k3-k4)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Formato exlr8 (FORMAT.md)](https://github.com/kindlingai/exlr8/blob/main/FORMAT.md)
- [Motor kindlingai/gr8](https://github.com/kindlingai/gr8)
- [Documentación QWEN38 en gr8](https://github.com/kindlingai/gr8/blob/main/docs/QWEN38.md)
- [kindlingai/glm-5.3-exlr8-k2-k3-k4](https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4)
- [kindlingai/glm-5.3-flash-exlr8-k2-k3-k4](https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4)
