# Frosty40/Inkling-2-Mini-Turbo

## Resumen

Inkling-2-Mini Turbo es una receta de servicio (serving recipe) optimizada para el modelo de lenguaje `thinkingmachines/Inkling-2-Mini` de Thinking Machines Lab, publicada por el usuario Frosty40. No se trata de un modelo nuevo entrenado desde cero, sino de un paquete de parches, kernels Triton y configuraciones de despliegue que aceleran la inferencia del checkpoint original sin modificar sus pesos. Los pesos subyacentes son los del modelo base, con licencia Apache 2.0, y el repositorio ocupa 19,8 GB.

La receta está diseñada específicamente para GPUs NVIDIA Blackwell con arquitectura `sm_120` (RTX PRO 6000) y `sm_121` (DGX Spark GB10), aprovechando sus tensor cores con escalado de bloque nativo NVFP4/MXFP8. Incluye decodificación especulativa con verificación adaptativa, kernels Triton sin pérdida de precisión y un parche al runtime Helios `flare` que añade soporte nativo de `thinking_token_budget` para el canal de razonamiento TMLv0 del modelo base.

Su relevancia radica en el rendimiento medido: hasta 252,5 tok/s en decodificación individual y 719,4 tok/s con 8 flujos concurrentes en una RTX PRO 6000, con mejoras de entre el 22 % y el 60 % frente a configuraciones estándar. Es, por tanto, un artefacto de infraestructura orientado a equipos que ya vayan a desplegar Inkling-2-Mini en hardware Blackwell y necesiten maximizar throughput y reducir latencia de arranque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base `thinkingmachines/Inkling-2-Mini`; la receta usa runtime Helios `flare` con kernels Triton) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el pool KV medido alcanza 3,42M tokens en RTX PRO 6000 y 2,23M en DGX Spark) |
| Tipos de cuantizacion | NVFP4 y MXFP8 (block-scaled, tensor cores nativos Blackwell); pesos upstream sin modificar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos upstream `thinkingmachines/Inkling-2-Mini` (18,8 GiB); núcleo Flare precompilado en la rama `gb10`; parches en formato diff |

## Arquitectura y entrenamiento

Esta ficha describe una receta de servicio, no un entrenamiento. Los pesos son exactamente los del checkpoint upstream `thinkingmachines/Inkling-2-Mini` (revisión `ed40e7da625f594fc9c4990f5f66be24873c22d7`, 18,8 GiB), sin modificaciones. La contribución técnica de la receta se concentra en la capa de inferencia: kernels Triton para `sm_120`/`sm_121` que explotan NVFP4 y MXFP8 con escalado de bloque, decodificación especulativa mediante MTP (multi-token prediction) con `--mtp-draft-tokens 7` y verificación adaptativa, y compilación de CUDA graphs para reducir el arranque en frío a 9,0 s en RTX PRO 6000 y 14,0 s en DGX Spark.

El segundo componente es un parche al runtime Helios `flare` (repositorio `NVIDIA/hyperflare-inference`, revisión `84ac035cf381c831fa5a4c93e8b34010845c551e`) que añade soporte nativo de `thinking_token_budget` y cierre limpio de fronteras UTF-8 en el canal de razonamiento TMLv0 del modelo base. Esto permite desactivar el razonamiento (`reasoning_effort="none"`, `enable_thinking=false`) o fijar presupuestos explícitos de tokens sin alterar el comportamiento por defecto (0,9) ni los niveles `minimal..max`. El otro parche afecta a `local-inference-lab/hyperflare-recipes` (revisión `c79199b126302051e21cbe1467f73af2ebb805c1`) con los kernels exactos para SM120/SM121. La receta se distribuye además como imagen Docker ARM64 para DGX Spark.

## Capacidades

- Generación de texto y razonamiento a través del modelo base Inkling-2-Mini, con canal de razonamiento TMLv0 controlable.
- Control granular del razonamiento: `reasoning_effort="none"`, `enable_thinking=false` y presupuestos explícitos de tokens de pensamiento.
- Decodificación especulativa sin pérdida (target-lossless) con borradores MTP y verificación adaptativa.
- Servicio concurrente multi-agente: hasta 8 flujos con pools KV dedicados (428k tokens por agente en RTX PRO 6000 con C=8).
- Prefill por lotes de 16k tokens con chunking configurable (`--prefill-chunk-size 16384`).
- Despliegue offline con verificación de claves de publisher y aprobación explícita de firma.
- Compatibilidad con GPU Blackwell `sm_120` y `sm_121` con tensor cores NVFP4/MXFP8.
- No se documentan en la información disponible capacidades de visión, audio, tool calling ni multilingüismo específicas de la receta; dependen del modelo base.

## Casos de uso

- Servicio de chat de baja latencia en RTX PRO 6000: con 252,5 tok/s en decodificación individual, la receta es adecuada para asistentes interactivos donde el tiempo hasta el primer token y la velocidad de generación son críticos. El arranque en frío de 9,0 s permite reinicios rápidos en entornos de desarrollo.
- Despliegue multi-agente en una sola GPU: con 8 flujos concurrentes a 719,4 tok/s y 428k tokens de KV por agente, se pueden atender varias sesiones de agentes simultáneas en una única RTX PRO 6000 sin repartir carga entre nodos.
- Inferencia en el borde con DGX Spark: en GB10 (`sm_121`) la receta ofrece 51,73 tok/s individuales y 115,58 tok/s con 8 flujos, lo que permite desplegar el modelo en una estación de trabajo compacta con 128 GB de memoria unificada.
- Procesamiento por lotes de documentos largos: el prefill de 16k tokens a 33.795 tok/s en RTX PRO 6000 (TTFT de 1,94 s) hace viable resumir o analizar lotes de documentos extensos con baja latencia inicial.
- Control de coste de razonamiento en producción: el parche `thinking_token_budget` permite fijar presupuestos de tokens de pensamiento por petición, útil para equilibrar calidad y coste en pipelines de clasificación o extracción donde no se necesita razonamiento profundo.
- Integración en pipelines de CI/CD de modelos: el flujo de exportación con `ignition export` y los parches versionados permiten reconstruir el núcleo por arquitectura de GPU de forma reproducible, facilitando la validación automatizada de regresiones de rendimiento.
- Investigación en decodificación especulativa: la receta sirve como banco de pruebas para medir el impacto de MTP con distintos números de tokens borrador (`--mtp-draft-tokens`) y verificación adaptativa sobre un modelo Apache 2.0.

## Benchmarks y rendimiento

Mediciones de la model card sobre el conjunto de prompts congelado `prompts/prompts_heldout_v1.jsonl`, comparando Hyperflare estándar con la receta Turbo (d=7):

| Métrica | Hardware | Stock Hyperflare | Turbo | Mejora |
|---|---|---|---|---|
| Decodificación individual (C=1) | RTX PRO 6000 (96 GB, sm_120) | 158,0 tok/s | 252,5 tok/s | +59,8 % |
| Decodificación C=8 adaptativa | RTX PRO 6000 | 483,1 tok/s | 719,4 tok/s | +48,9 % |
| Prefill por lotes 16k en frío (C=4) | RTX PRO 6000 | 4,61 s TTFT | 1,94 s TTFT (33.795 tok/s) | 2,38× |
| Arranque en frío | RTX PRO 6000 | No disponible | 9,0 s | No disponible |
| Decodificación individual (C=1) | DGX Spark GB10 (sm_121) | 42,30 tok/s | 51,73 tok/s | +22,3 % |
| Decodificación C=8 | DGX Spark GB10 | 109,37 tok/s | 115,58 tok/s | No disponible |
| Prefill por lotes 16k en frío (C=4) | DGX Spark GB10 | 18,89 s TTFT | 9,36 s TTFT (6.999 tok/s) | 2,02× |
| Arranque en frío | DGX Spark GB10 | No disponible | 14,0 s | No disponible |

La model card menciona además una comparación frente a SGLang DSpark (+23,7 % en decodificación individual en RTX PRO 6000). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU NVIDIA Blackwell obligatoria: `sm_120` (RTX PRO 6000) o `sm_121` (DGX Spark GB10). No hay soporte para arquitecturas anteriores.
- Memoria mínima: 24 GB disponibles (18,8 GiB de pesos más el pool KV).
- RTX PRO 6000 (96 GB): pool KV máximo de 3,42M tokens con C=4 (856k por agente) o C=8 (428k por agente); configuración de servicio con `--memory-limit=-4G`.
- DGX Spark GB10 (128 GB unificada): pool KV de 2,23M tokens con C=4 (557k por agente) o C=8 (278k por agente); configuración con `--memory-limit=72G`.
- Despliegue mediante el runtime Helios `flare` (Rust, binario `flare-cli`), con exportación previa del núcleo mediante `ignition export` una vez por arquitectura de GPU.
- Opción precompilada para DGX Spark en la rama `gb10` del repositorio (aproximadamente 19 GiB), con arranque en unos 14 s sin ejecutar la exportación.
- Imágenes Docker ARM64 disponibles para DGX Spark: `docker/Dockerfile.spark_sm121` y `docker/Dockerfile.spark_sm121_tmlcut`.
- Latencia y throughput medidos: 252,5 tok/s individuales y 719,4 tok/s con C=8 en RTX PRO 6000; 51,73 tok/s y 115,58 tok/s respectivamente en DGX Spark.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la receta es específica de Hyperflare/Helios.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Hardware | Rendimiento documentado |
|---|---|---|---|---|---|---|
| Inkling-2-Mini Turbo (esta receta) | Receta de servicio sobre Inkling-2-Mini | No disponible | No disponible | Apache 2.0 | Blackwell sm_120/sm_121 | 252,5 tok/s C=1; 719,4 tok/s C=8 (RTX PRO 6000) |
| Inkling-2-Mini (Hyperflare estándar) | Modelo base con runtime sin optimizar | No disponible | No disponible | Apache 2.0 | Blackwell sm_120/sm_121 | 158,0 tok/s C=1; 483,1 tok/s C=8 (RTX PRO 6000) |
| Inkling-2-Mini con SGLang DSpark | Runtime alternativo | No disponible | No disponible | Apache 2.0 | No disponible | Inferior en un 23,7 % a Turbo en decodificación individual (RTX PRO 6000) |

No se dispone de datos de parámetros, contexto ni benchmarks de calidad de los modelos comparados en la información proporcionada, por lo que la comparación se limita a rendimiento de inferencia y licencia.

## Limitaciones y advertencias

- No es un modelo entrenado: los pesos son idénticos al checkpoint upstream; cualquier mejora de calidad debe venir del modelo base, no de esta receta.
- Dependencia estricta de hardware Blackwell `sm_120`/`sm_121`; no funciona en GPUs Ampere, Hopper ni Ada Lovelace.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es la organización propietaria del modelo base; conviene validar los parches antes de usarlos en producción.
- El despliegue requiere aplicar parches a revisiones fijas de dos repositorios externos (`hyperflare-recipes` y `hyperflare-inference`) y compilar el binario `flare` con Cargo, lo que añade complejidad operativa y riesgo de deriva si los repositorios upstream cambian.
- El comando de arranque de la rama `gb10` incluye `--dangerously-approve-key` y `--dangerously-accept-publisher`, que relajan la verificación de firmas; deben revisarse en entornos con requisitos de seguridad.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación en la información disponible.
- Las mediciones de rendimiento provienen del propio autor y usan un conjunto de prompts congelado; no se han verificado de forma independiente.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero la receta no ofrece garantías sobre los parches ni sobre el runtime Helios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Frosty40/Inkling-2-Mini-Turbo
- Rama precompilada para DGX Spark: https://huggingface.co/Frosty40/Inkling-2-Mini-Turbo/tree/gb10
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de recetas Hyperflare: https://github.com/local-inference-lab/hyperflare-recipes
- Runtime Helios flare: https://github.com/NVIDIA/hyperflare-inference
