# changh95/qwen3-32b-wh-galaxy

## Resumen

qwen3-32b-wh-galaxy es un bundle de despliegue, no un modelo nuevo: empaqueta Qwen/Qwen3-32B (32.800 millones de parametros densos, 64 capas, GQA 64/8 cabezas con QK-norm por cabeza, licencia Apache-2.0) para ejecutarse sobre hardware Tenstorrent Wormhole Galaxy mediante vLLM. El autor del empaquetado es changh95, que lo publica con tt-model-manager 0.1.0 (esquema de manifiesto 5.1) y lo lista en el catalogo comunitario tt-model-catalog. El problema que resuelve es operativo: convertir un modelo denso de 32B en una imagen de contenedor reproducible con pesos, kernels compilados y ajustes de servido listos para un mesh de 32 chips Wormhole.

La relevancia es acotada pero concreta: permite levantar un endpoint compatible con OpenAI sobre una Galaxy sin tener que reconstruir a mano el stack tt-inference-server 0.21.0 (tt-metal bc4c4df, vLLM 0.25.1, vllm-tt-plugin). El bundle aplica paralelismo tensorial de 32 vias en prefill y decodificacion en 4 lanes de datos con 8 usuarios cada una, limita el contexto a 131.072 tokens configurados (40.960 nativos) y admite 32 secuencias concurrentes. El repositorio pesa 5,8 GB porque no incluye los pesos: estos se descargan del modelo base en el commit 9216db5781bf21249d130ec9da846c4624c16137.

Es un artefacto de nicho para quien ya dispone de una Wormhole Galaxy. No aporta capacidades nuevas respecto a Qwen3-32B y no debe evaluarse como un fine-tune: los tags base_model y finetune apuntan al modelo original, y el trabajo del autor esta en el rendimiento del servido, no en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-32B): 64 capas, GQA 64/8 cabezas, QK-norm por cabeza |
| Parametros totales | 32.800 millones (32,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens configurados en este bundle; 40.960 nativos en Qwen3-32B |
| Tipos de cuantizacion | no disponible; el bundle usa pesos MLP bf8 shardeados y pesos del modelo base sin cuantizacion declarada |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | pesos originales de Qwen/Qwen3-32B descargados al cache de HF; el bundle se distribuye como imagen Docker (no safetensors ni GGUF empaquetados) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso decoder-only de 32,8B parametros con 64 capas y atencion GQA de 64 cabezas de consulta frente a 8 de clave/valor, con normalizacion QK por cabeza. El bundle no documenta datos de entrenamiento, numero de tokens, composicion del corpus ni etapas de RLHF/DPO: esa informacion corresponde a la model card de Qwen/Qwen3-32B, no a este repositorio. No hay evidencia de que el autor haya modificado los pesos.

La innovacion tecnica esta en el stack de inferencia sobre Wormhole Galaxy (32 chips en mesh 8x4, MESH_DEVICE=TG, etiquetado n150x32). El bundle incluye cache de prefijo y decodificacion asincrona para la clase Qwen, enrutado de lanes por afinidad de prefijo y heuristicas de acierto de cache para el layout KV de 4 columnas. El prefill se traza a 8.192 tokens con buckets de 256 y 512, gather de filas indexado por forma (sin recompilaciones por longitud) y prefill agrupado con prefijo cacheado de hasta cuatro peticiones de igual longitud cacheada en un trace de 4 filas. En decodificacion destaca un kernel fusionado de QK-norm por capa sobre 16 core de cabezas via generic_op de ttnn, que sustituye una cadena de 14 operaciones (~44 µs por capa) y lee 9,4 µs por capa dentro del trace sin acceder a DRAM. Los pesos FF1/FF3 se rellenan a 3.840 columnas logicas por dispositivo para igualar el colectivo del all-gather de entrada de FF2 de Llama-70B (de 12,6 a 7,9 µs por capa). El muestreo on-device usa un kernel top-k que baja las dos operaciones de 689 + 370 µs a 212 + 132 µs.

En el plano de motor y scheduler, el bundle parchea vLLM v1/engine/core.py para extraer el prefill sincrono terminado de inmediato (QWEN_POP_DONE_PREFILL=1), agrupa llegadas de la clase de 128 tokens en una ventana de silencio de 5 ms (QWEN_BURST_JOIN_MS=5) y aplica una retencion por tasa de llegada de 8 µs por token del prompt mas largo en espera (maximo 200 ms), activa solo con 2 o mas peticiones pendientes. Una peticion solitaria de 8.192 tokens o mas se retiene 3 µs por token (24,6 ms a 8.192 tokens) para que la segunda peticion de una ola de dos usuarios se una a su llamada de prefill. El prefill round 4 incluye q-chunking de SDPA por longitud (2048:64, 4096:32, 8192:64), all-gather de salida de atencion limitado a 512 tokens, matmuls FF1/FF3 de 56 cores y empaquetado fusionado W1|W3 para secuencias de 512 tokens o menos; segun la model card, en el bundle del 22-09-2026 el TTFT medio sobre 54 celdas de malla bajo un 16 % sin celdas peores fuera de los margenes del ±2 % / ±10 % (1 usuario) frente al bundle del 17-09-2026.

## Capacidades

- Generacion de texto autoregresiva con Qwen3-32B como base, incluido modo de razonamiento (thinking) que viene desactivado por defecto (enable_thinking: false).
- Razonamiento multi-paso y cadenas de pensamiento activables por peticion mediante el parser de razonamiento de Qwen3.
- Tool calling y function calling mediante el parser Hermes configurado por defecto.
- Salidas estructuradas con xgrammar (JSON schema, gramaticas) en el servidor compatible con OpenAI.
- Servido concurrente de hasta 32 secuencias, con prefill agrupado y cache de prefijo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles; el pipeline declarado es text-generation.
- Reproducibilidad determinista opcional via seed por defecto 9472.

## Casos de uso

- Endpoint interno compatible con OpenAI sobre hardware Tenstorrent: `tt-model serve` expone un servidor en el puerto 20000 (o el siguiente libre) listo cuando aparece "Application startup complete"; adecuado para equipos que quieren probar Qwen3-32B en silicio no NVIDIA sin reescribir sus clientes.
- Asistentes de codigo con contexto largo: con 131.072 tokens configurados se pueden enviar repositorios o varios ficheros en una sola peticion, y el cache de prefijo evita recomputar el contexto comun entre llamadas sucesivas.
- Agentes con tool calling: el parser Hermes y las salidas estructuradas xgrammar permiten encadenar llamadas a funciones y validar el JSON de respuesta en pipelines de automatizacion.
- Razonamiento por lotes con thinking activado: para tareas de analisis o matematicas donde se acepta mayor latencia, se puede habilitar el modo de razonamiento por peticion manteniendo el resto del trafico en modo directo.
- Evaluacion comparativa de hardware: el bundle sirve como referencia reproducible para medir TTFT y throughput de Qwen3-32B en una Galaxy frente a GPUs, con los ajustes de scheduler ya fijados.
- Despliegue en entornos air-gapped: al distribuirse como imagen Docker con pesos descargables por commit fijo, encaja en instalaciones con control estricto de dependencias y sin acceso a repositorios de modelos externos.
- Servicio de chat multi-turno de baja concurrencia: las 4 lanes de decodificacion con 8 usuarios cada una sostienen conversaciones simultaneas con cache de prefijo por lane.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento documentados son de sistema, no de calidad: TTFT medio un 16 % inferior en el bundle del 22-09-2026 frente al del 17-09-2026 sobre 54 celdas de malla; reduccion del kernel fusionado de QK-norm de ~44 µs a 9,4 µs por capa en decodificacion; all-gather de FF2 de 12,6 a 7,9 µs por capa; top-k de muestreo de 689 + 370 µs a 212 + 132 µs; y perdida de unos 0,6 ms por paso de decodificacion a 32 usuarios tras el cambio del kernel top-k. El arranque en frio se cifra en ~25 minutos (compilacion de kernels y captura de traces para todo el mesh) y ~8 minutos con cache caliente.

## Requisitos de hardware

- Hardware obligatorio: Wormhole Galaxy, 32 chips Wormhole en mesh 8x4 (MESH_DEVICE=TG, etiqueta n150x32). No es ejecutable en GPU convencional.
- VRAM estimada para inferencia: no disponible; la memoria es la de los 32 chips Wormhole, no VRAM de GPU.
- GPU recomendadas: no aplica; no se documenta soporte en A100, H100 ni RTX 4090.
- Consumer GPU: no; el bundle requiere `/dev/tenstorrent` y 1 GiB de hugepages montadas en `/dev/hugepages-1G`.
- Software: Docker 25 o superior, tt-inference-server 0.21.0, tt-metal bc4c4df, vLLM 0.25.1 y vllm-tt-plugin.
- Despliegue: `tt-model pull changh95/qwen3-32b-wh-galaxy --with-weights` seguido de `tt-model serve`, o `tt model pull` / `tt serve` / `tt model stop` con tt-cli. No se documenta despliegue via llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo los datos parciales de la seccion anterior; no se publican cifras agregadas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-32b-wh-galaxy (este bundle) | 32,8B densos | 131.072 configurados (40.960 nativos) | Wormhole Galaxy, 32 chips | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-32B (modelo base) | 32,8B densos | 40.960 nativos | GPU (vLLM, TGI, etc.) | Apache-2.0 | Hugging Face, oficial |
| Qwen3-32B en vLLM sobre GPU | 32,8B densos | 40.960 nativos | A100/H100 multi-GPU | Apache-2.0 | via vLLM y pesos oficiales |
| Llama-3.1-70B (referencia citada en la model card) | 70B densos | no disponible en esta ficha | GPU multi-nodo | Llama Community License | Hugging Face, oficial |

La comparacion relevante no es de calidad (no hay benchmarks publicados para este bundle) sino de plataforma: frente al modelo base en GPU, este paquete cambia el hardware objetivo y añade ajustes de scheduler y kernels especificos de Wormhole. Frente a Llama-3.1-70B solo se comparte la referencia tecnica al colectivo de all-gather usado para calibrar el padding de FF1/FF3.

## Limitaciones y advertencias

- Dependencia de hardware exclusiva: sin una Wormhole Galaxy (32 chips) el bundle no es utilizable; no hay ruta de ejecucion en GPU.
- Contexto efectivo menor que el nominal de Qwen3-32B: 40.960 tokens nativos, ampliados a 131.072 solo por configuracion del bundle, lo que puede degradar la calidad en ventanas muy largas.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares para este empaquetado; cualquier afirmacion de rendimiento del modelo debe remitirse a la model card oficial de Qwen3-32B.
- Idiomas soportados no declarados en el repositorio; la cobertura linguistica debe consultarse en el modelo base.
- Riesgo de alucinacion: inherente a Qwen3-32B; el bundle no incluye salvaguardas adicionales, solo parsers de razonamiento, tool calling y salidas estructuradas.
- Sesgos conocidos: no documentados en la informacion disponible; heredados del modelo base y de sus datos de entrenamiento.
- Arranque en frio costoso (~25 minutos) por compilacion de kernels y captura de traces; solo amortizable con cache caliente (~8 minutos).
- Requisitos de sistema estrictos: Docker 25+, `/dev/tenstorrent` y 1 GiB de hugepages; el bundle antiguo abortaba al importar si el uid del host no coincidia con el de la imagen (fallo de EACCES en el helper de profiling de tt-metal que se manifestaba como "type 'Layout' was already registered"). La solucion documentada es volver a hacer pull.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento continuado mas alla de las actualizaciones del bundle.
- Licencia Apache-2.0 permite uso comercial del empaquetado, pero las condiciones del modelo base y de las dependencias (tt-metal, vLLM, tt-inference-server) deben verificarse por separado.

## Enlaces

- Repositorio del bundle: https://huggingface.co/changh95/qwen3-32b-wh-galaxy
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Commit de pesos referenciado: 9216db5781bf21249d130ec9da846c4624c16137
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Paper, blog o demo del bundle: no disponible
- Repositorio del modelo base, paper de Qwen3 y demos: no disponibles en la informacion proporcionada
