# kindlingai/Qwen3.8-Flash-Next-exlr8-k2-k3-k4

## Resumen

Qwen3.8-Flash-Next exlr8 (K2/K3/K4) es una cuantizacion del modelo multimodal Qwen3.8-Flash-Next publicada por kindlingai bajo el formato propietario exlr8 v2. El modelo base es un MoE hibrido multimodal de Qwen (`Qwen4ExpForConditionalGeneration`) que combina atencion lineal Gated DeltaNet con atencion completa GQA-12 en una proporcion de 36 a 12 capas, e incorpora una torre de vision de 27 capas. Esta version cuantiza unicamente las proyecciones de expertos (routed y shared) de las 48 capas MoE a tres anchos de trellis (K2, K3 y K4), manteniendo en BF16 las proyecciones densas, el vocabulario, el drafter MTP, la torre de vision y la tabla PLE de Layer-1.

La relevancia de esta publicacion es fundamentalmente de infraestructura: esta disenada para dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10) servidos en una a cuatro maquinas, y solo funciona con el motor exlr8-nativo de KindlingAI (`gr8`). No es un checkpoint de proposito general: requiere un loader que aplique redondeo E4M3 a cada valor producido por el codebook trellis antes de aplicar los vectores laterales, de modo que un decodificador EXL3 estandar lee pesos medibles peores de los mismos bytes.

El interes practico esta en sus perfiles de ancho: `bit200` ocupa 46,4 GB en residente con un KL medio de 0,0537 frente a BF16, `bit300` 61,5 GB con KL 0,0124 y `bit400` 76,6 GB con KL 0,0046, ademas de un drafter especulativo DFlash Q4_0 que aporta mejoras de velocidad del 38 % en codigo y del 61-66 % en tareas estructuradas y de conteo en flujo unico, con paridad greedy byte a byte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido multimodal (36 capas Gated DeltaNet linear-attention + 12 capas full GQA-12 con indice disperso QSA block-4), 4-stream low-rank hyper-connections (4 x 2560, rank 320), torre de vision de 27 capas |
| Parametros totales | no disponible |
| Parametros activos | 512 expertos routed con top-10 routing + 1 experto shared con gate por capa (parametros activos totales no disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis K2, K3 y K4 en codebook `pmcgx`, con redondeo obligatorio a FP8 E4M3; drafter DFlash en Q4_0; densos, vision, MTP y PLE en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license_name), etiquetada como `other` |
| Formato de pesos | exlr8 v2 (safetensors para densos y vision; packs propietarios para expertos y drafter) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal hibrido. De las 48 capas de texto, 36 son Gated DeltaNet de atencion lineal y 12 son de atencion completa GQA-12 con un indice disperso QSA de bloque 4 en las capas 3, 7, ..., 47. Incorpora hyper-conexiones de bajo rango de 4 flujos (4 x 2560, rank 320), una tabla de embeddings por capa (PLE) de 2/3-gramas de 320.001.536 x 160 en BF16, 512 expertos routed con top-10 routing mas un experto shared con gate por capa, embeddings y LM head no atados de 248.320 tokens, un drafter especulativo MTP de una capa de atencion completa y una torre de vision de 27 capas. El contexto de entrenamiento, el volumen de tokens y la composicion del dataset no se detallan en la informacion disponible.

La innovacion de esta publicacion no esta en el entrenamiento sino en la codificacion: cada experto routed y shared de las capas 0-47 se almacena simultaneamente a tres anchos de trellis (K2, K3, K4) en el codebook `pmcgx`, y el ancho de servicio se elige en tiempo de carga. El encoder busco exclusivamente sobre valores redondeados a E4M3, por lo que el redondeo round-to-nearest-even con saturacion forma parte del formato y debe aplicarse antes de los vectores laterales. Los pesos densos, el vocabulario, el drafter MTP, la torre de vision y la tabla PLE de Layer-1 permanecen en BF16 sin cambios respecto al modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento en el modelo base Qwen3.8-Flash-Next.
- Procesamiento multimodal imagen-texto: pipeline `image-text-to-text` con torre ViT de 27 capas en BF16 y MRoPE 3D intercalado (activable con `GR8_QW38_VISION=1`).
- Routing MoE disperso con top-10 sobre 512 expertos routed mas un experto shared por capa.
- Decodificacion especulativa: drafter DFlash de bloques paralelos en Q4_0 para flujo unico y drafter MTP de Layer-48 grafo para concurrencia multi-stream (`--mtp 0..3`).
- Escalado de ancho en vivo entre perfiles K2/K3/K4 y entre TP=1 y TP=4 con `GR8_PTAB=2` y `bin/g6layout`.
- Cache de prefijo y sesion KV en SSD con `O_DIRECT` (`KV_STORE=ssd:...`).
- Streaming asincrono de filas PLE de Layer-1 desde NVMe local por detras de la capa 0.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en DGX Spark o ASUS GX10: el perfil `bit200` deja los expertos en 30,3 GB por caja a TP=1, lo que permite servir el modelo completo en un unico dispositivo de memoria unificada de clase GB10 con 46,4 GB residentes.
- Servicio multi-maquina con tensor parallelism: a TP=2, el perfil `bit300` reduce los expertos a 22,7 GB por caja (61,5 GB residentes totales), adecuado para clusters de dos a cuatro nodos con KL medio de 0,0124 frente a BF16.
- Inferencia de maxima fidelidad: el perfil `bit400` (76,6 GB residentes, KL medio 0,0046, top-1 del 97,70 %) es la opcion cuando la divergencia respecto al modelo BF16 debe ser minima, con una perplejidad WikiText de 3,723, incluso ligeramente por debajo de la referencia de 3,729.
- Generacion de codigo en flujo unico: el drafter DFlash Q4_0 aporta una mejora de velocidad del 38 % en cargas de codigo con paridad greedy byte a byte, util en asistentes de autocompletado o pipelines de CI/CD que requieran baja latencia por token.
- Tareas estructuradas y de conteo: el mismo drafter ofrece mejoras del 61-66 % en flujo unico para salidas estructuradas, aprovechable en extraccion de datos, validacion de esquemas JSON y generacion de informes tabulares.
- Procesamiento de imagenes y texto combinados: con `GR8_QW38_VISION=1` se activa la torre ViT de 27 capas en BF16 para pipelines de image-text-to-text, como descripcion de documentos escaneados o analisis de capturas.
- Servicio concurrente multi-sesion: el drafter MTP grafo (`--mtp 0..3`) esta pensado para concurrencia multi-stream, adecuado en endpoints de chat con varias peticiones simultaneas.
- Recuperacion de contexto largo con cache en disco: `KV_STORE=ssd:...` con `O_DIRECT` permite reutilizar prefijos y sesiones persistidas en SSD, util en asistentes con system prompts extensos o conversaciones de larga duracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de cuantizacion y de velocidad relativa:

| Perfil | bpw routed | Tamano residente | Expertos por caja (TP=1 / TP=2) | KL modelo (media / mediana) | Top-1 modelo | KL WikiText (media / mediana) | PPL WikiText (ref. 3,729) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `bit200` | 2,00 | 46,4 GB | 30,3 / 15,2 GB | 0,0537 / 0,00743 | 92,60 % | 0,2177 / 0,0557 | 3,845 (+3,11 %) |
| `bit300` | 3,00 | 61,5 GB | 45,4 / 22,7 GB | 0,0124 / 0,00157 | 96,34 % | 0,0796 / 0,0178 | 3,737 (+0,23 %) |
| `bit400` | 4,00 | 76,6 GB | 60,5 / 30,3 GB | 0,0046 / 0,00054 | 97,70 % | 0,0373 / 0,0081 | 3,723 (-0,17 %) |

Las metricas KL se miden en `float64` sobre el vocabulario completo (248.320 tokens) en 65.536 posiciones de test de WikiText-2 (32 x 2048) y 16.057 posiciones de asistente generadas por el modelo (8 x 2048). El tamano residente incluye 16,0 GB de pesos densos, vocabulario, MTP y vision en BF16 (15,1 GB sin vision); el drafter DFlash anade 0,52 GB al cargarse y la tabla PLE (102,4 GB) se transmite desde NVMe local.

Mejoras de velocidad del drafter DFlash Q4_0: +38 % en codigo y +61-66 % en tareas estructuradas y de conteo, en flujo unico, con paridad greedy byte a byte del 100 %.

## Requisitos de hardware

- VRAM/RAM unificada estimada para inferencia: 46,4 GB (`bit200`), 61,5 GB (`bit300`) o 76,6 GB (`bit400`) en residente, mas 0,52 GB si se carga el drafter DFlash y 102,4 GB de tabla PLE que se transmiten desde NVMe local.
- GPU recomendadas: dispositivos de memoria unificada de clase NVIDIA GB10, es decir, DGX Spark y ASUS GX10, en configuraciones de una a cuatro maquinas.
- Cabe en GPU de consumo: no disponible; el formato esta disenado para GB10 y el motor `gr8`, no se documenta soporte para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: exclusivamente `kindlingai/gr8` (motor exlr8-nativo), invocado con `./gr8 qw38` a TP=1 hasta TP=4. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: se recomienda NVMe local para el streaming asincrono de filas PLE y para la cache KV en SSD con `O_DIRECT`.
- Latencia y throughput absolutos: no disponibles; solo se publican mejoras relativas del drafter (+38 % en codigo, +61-66 % en estructuradas y conteo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next exlr8 K2/K3/K4 (este) | 512 expertos routed top-10 + 1 shared por capa; totales no disponibles | no disponible | Trellis K2/K3/K4 + E4M3, drafter Q4_0, densos BF16 | qwen-community-1.0 | Hugging Face, motor `gr8` |
| kindlingai/glm-5.3-exlr8-k2-k3-k4 | no disponible | no disponible | exlr8 v2 K2/K3/K4 | no disponible | Hugging Face, motor `gr8` |
| kindlingai/glm-5.3-flash-exlr8-k2-k3-k4 | no disponible | no disponible | exlr8 v2 K2/K3/K4 | no disponible | Hugging Face, motor `gr8` |
| Qwen/Qwen3.8-Flash-Next (base BF16) | 512 expertos routed top-10 + 1 shared por capa; totales no disponibles | no disponible | BF16 | qwen-community-1.0 | Hugging Face |

Los dos modelos GLM comparten el mismo formato byte a byte y el mismo motor, por lo que son las alternativas naturales dentro del ecosistema exlr8; el modelo base BF16 es la referencia de fidelidad frente a la que se miden los KL de la tabla anterior. No se dispone de datos de rendimiento en tareas para establecer comparaciones de calidad entre ellos.

## Limitaciones y advertencias

- Los pesos no son utilizables sin redondeo E4M3: un decodificador EXL3 estandar, o cualquiera que omita el redondeo round-to-nearest-even con saturacion, lee pesos medibles peores de los mismos bytes.
- Dependencia total del motor `gr8` de KindlingAI; no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otras pilas de inferencia.
- El formato esta disenado para dispositivos de memoria unificada de clase GB10; no se documenta funcionamiento en GPU discretas convencionales.
- La tabla PLE de Layer-1 (102,4 GB) no cabe en memoria y debe transmitirse desde NVMe local, lo que introduce requisitos de almacenamiento y de ancho de banda de disco.
- El perfil `bit200` presenta una degradacion apreciable: KL medio de 0,0537, top-1 del 92,60 % y un aumento de perplejidad WikiText del 3,11 %; no es adecuado si se requiere fidelidad alta.
- Licencia `qwen-community-1.0` etiquetada como `other`: deben revisarse los terminos del archivo LICENSE antes de cualquier uso comercial.
- Idiomas soportados no disponibles en la informacion proporcionada.
- Longitud de contexto no disponible en la informacion proporcionada.
- Sesgos conocidos y riesgo de alucinacion del modelo base: no disponibles en la informacion proporcionada.
- El repositorio tiene 256,8 GB y solo 1 like frente a 12.081 descargas, lo que sugiere una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/Qwen3.8-Flash-Next-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor gr8: https://github.com/kindlingai/gr8
- Documentacion de Qwen3.8 en gr8: https://github.com/kindlingai/gr8/blob/main/docs/QWEN38.md
- Especificacion del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Receta 1x DGX Spark: https://github.com/kindlingai/recipes/tree/main/qwen3.8-flash-next/dgx-spark/1x/exlr8-gr8
- Modelo hermano GLM-5.3 exlr8: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Modelo hermano GLM-5.3-Flash exlr8: https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4
