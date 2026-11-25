# jesdga/Qwen3.8-Flash-Next-Basalt

## Resumen

Qwen3.8-Flash-Next-Basalt es un conjunto de pesos empaquetados en formato `.basalt` para el motor de inferencia local Basalt, desarrollado por jesdga (J. Gulfo). No se trata de un modelo entrenado desde cero ni de un fine-tune nuevo, sino de una redistribución optimizada del modelo mixto de expertos Qwen3.8-Flash-Next de Alibaba Qwen, cuantizado en múltiples formatos (Unsloth UD, Q8_0 y NVIDIA NVFP4) y empaquetado de forma autocontenida para ejecutarse sobre GPUs NVIDIA Blackwell (sm_120).

La relevancia del paquete reside en el motor Basalt: un runtime de inferencia que permite servir un MoE de gran tamaño en hardware de consumo mediante una jerarquía de expertos (VRAM en GPU principal, GPU secundaria como tier peer y RAM del sistema para los expertos que no caben). El paquete incluye pesos, tokenizador, un drafter MTP para decodificación especulativa y el proyector de visión en un único fichero, con API compatible con OpenAI y Anthropic.

El repositorio ocupa 2569,7 GB e incluye once variantes de cuantización, desde IQ1_S (65,6 GiB) hasta Q8_0 (178,3 GiB). La licencia es la Qwen Community License 1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixto de expertos (MoE), según etiqueta del autor; arquitectura interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XS, IQ3_XXS, IQ4_XS, Q4_K_XL, Q5_K_XL, Q6_K_XL, Q8_0, NVFP4 (con proyecciones densas en Q6_K o Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | `.basalt` versión 2 (autocontenido: pesos, tokenizador, drafter MTP, proyector de visión y tabla int8 de hiperconexión) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Motor de inferencia | Basalt 0.2.0 o superior (Linux, NVIDIA Blackwell sm_120) |
| Tamano del repositorio | 2569,7 GB |
| Libreria | basalt |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un transformer de mezcla de expertos según la etiqueta `moe` del autor. No se dispone de información sobre el número de parámetros totales o activos, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; estos datos no aparecen en la información proporcionada y deben consultarse en la model card oficial de Qwen.

La aportación técnica del paquete es el formato `.basalt` versión 2 y el motor Basalt. Cada fichero es autocontenido e incluye el drafter MTP (multi-token prediction) para decodificación especulativa, lo que eleva la aceptación de borradores y el throughput. Las variantes IQ1_S, IQ1_M, IQ2_XS, IQ3_XXS, IQ4_XS y NVFP4 incorporan una capa MTP autodestilada (`convert/mtp/rt/dense.bin`) para mejorar la aceptación del draft; el resto conserva la original. La versión 2 del formato elimina los datos de política del motor del paquete y almacena la tabla int8 de hiperconexión, evitando reconstruirla en cada arranque; los pesos son idénticos a la versión 1 y la salida no cambia. Existe un script de migración (`tools/migrations/basalt_v1_to_v2.py`) que convierte ficheros v1 a v2 sin recuantizar.

## Capacidades

- Generación de texto y conversación multi-turno, servida mediante API compatible con OpenAI y Anthropic.
- Procesamiento de visión: el paquete incluye el proyector de visión del modelo base.
- Decodificación especulativa con drafter MTP integrado, orientada a reducir la latencia por token.
- Ejecución de un MoE con expertos repartidos entre VRAM de GPU principal, GPU secundaria (tier peer) y RAM del sistema.
- Cuantización agresiva (hasta IQ1_S) para ajustar el modelo a presupuestos de memoria reducidos.
- Capacidades de razonamiento, código, matemáticas, tool calling y agentes: no confirmadas en la información proporcionada; dependen del modelo base Qwen3.8-Flash-Next y deben verificarse en su model card.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE grande en estación de trabajo con GPU Blackwell: un único RTX 5090 más una RTX 5060 Ti como tier peer permite servir el pack NVFP4-DQ6_K a 307 tokens/s en prosa y 601 tokens/s en salida estructurada, según las mediciones del autor.
- Servicio de API compatible con OpenAI para herramientas existentes: al exponer un endpoint compatible, se pueden reutilizar clientes y SDK ya integrados sin cambios de código, apuntando al puerto configurado en `basalt_config.json`.
- Sustitución de backend en aplicaciones con clientes Anthropic: la compatibilidad con la API de Anthropic permite migrar cargas de trabajo existentes al motor local manteniendo el formato de mensajes.
- Prototipado con presupuesto de VRAM ajustado: el pack UD-IQ1_S ocupa 65,6 GiB de fichero con 31,1 GiB de expertos, lo que permite mantener la mayor parte del modelo en memoria de sistema y solo los expertos activos en GPU.
- Evaluación de calidad de cuantizaciones: la tabla de calidad del autor (PPL, KLD medio y acuerdo top-1 frente a referencia BF16) permite elegir el pack según el compromiso entre fidelidad y memoria; por ejemplo, UD-Q4_K_XL alcanza 92,63 % de acuerdo top-1 con 106,7 GiB de fichero.
- Despliegue con visión: al incluir el proyector de visión en el propio fichero, se pueden servir tareas de comprensión de imagen y texto desde el mismo runtime sin componentes adicionales.
- Conversión de cuantizaciones GGUF existentes: el kit `convert/` permite transformar cualquier GGUF de este modelo en un fichero `.basalt`, útil para equipos que ya disponen de pesos de Unsloth.

## Benchmarks y rendimiento

El autor publica dos conjuntos de mediciones propias: velocidad (tokens/s, un solo stream, RTX 5090 a 400 W + RTX 5060 Ti a 180 W) y calidad (`basalt-bench --quality`, 100 fragmentos de wikitext-2 de 512 tokens, KV int8, referencia BF16 de llama.cpp con PPL 3,273).

| Pack | Prosa (tok/s) | Estructurado (tok/s) | Chat (tok/s) | Fichero (GiB) | Expertos (GiB) | PPL | KLD medio | Top-1 igual |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| UD-IQ1_S | 389 | 763 | 457 | 65,6 | 31,1 | 3,405 | 0,2676 | 82,76 % |
| UD-IQ1_M | 364 | 732 | 434 | 67,1 | 32,4 | 3,379 | 0,2560 | 83,19 % |
| UD-IQ2_XS | 345 | 641 | 396 | 74,4 | 39,4 | 3,289 | 0,1829 | 86,21 % |
| UD-IQ3_XXS | 342 | 658 | 399 | 81,6 | 46,8 | 3,242 | 0,1188 | 88,67 % |
| UD-IQ4_XS | 300 | 608 | 363 | 90,9 | 56,2 | 3,231 | 0,0818 | 90,52 % |
| UD-Q4_K_XL | no disponible | no disponible | no disponible | 106,7 | 71,7 | 3,321 | 0,0496 | 92,63 % |
| NVFP4-DQ6_K | 307 | 601 | 335 | 122,0 | 63,3 | 3,304 | 0,0624 | 91,65 % |
| NVFP4-DQ8 | no disponible | no disponible | no disponible | 123,3 | 63,3 | 3,297 | 0,0561 | 92,25 % |
| UD-Q5_K_XL | no disponible | no disponible | no disponible | 150,5 | 91,6 | 3,293 | 0,0255 | 94,82 % |
| UD-Q6_K_XL | no disponible | no disponible | no disponible | 160,6 | 101,7 | 3,283 | 0,0209 | 95,22 % |
| Q8_0 | 112 | 166 | 101 | 178,3 | 119,5 | 3,279 | 0,0200 | 95,34 % |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores miden velocidad y fidelidad de cuantización, no calidad de tarea.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA Blackwell (sm_120) en Linux. No hay soporte indicado para arquitecturas anteriores (Ampere, Ada) ni para otros fabricantes.
- Configuración medida por el autor: RTX 5090 a 400 W como GPU principal más RTX 5060 Ti a 180 W como tier peer de expertos.
- VRAM: depende del pack. El fichero completo va de 65,6 GiB (UD-IQ1_S) a 178,3 GiB (Q8_0); los expertos residentes en VRAM van de 31,1 GiB a 119,5 GiB. Los expertos que no caben permanecen en RAM del sistema, por lo que se requiere RAM proporcional al tamaño del pack.
- Cabe en GPU de consumo: sí, con el esquema multi-GPU y offload a RAM descrito; una sola RTX 5090 de 32 GB no aloja el pack completo, pero el motor mantiene en VRAM solo el perfil de expertos inicial.
- Despliegue: motor Basalt (`bin/basalt serve --config basalt_config.json`), con API compatible con OpenAI y Anthropic. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; el kit `convert/` parte de GGUF de Unsloth pero el destino es el formato `.basalt`.
- Throughput: de 101 a 763 tokens/s según pack y tipo de salida (ver tabla). El pack Q8_0 es el más lento (112 tok/s en prosa) por su mayor volumen de pesos.
- Almacenamiento: el repositorio completo ocupa 2569,7 GB; conviene descargar solo el fichero necesario con `hf download`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Basalt | no disponible (MoE) | no disponible | `.basalt` v2 | Qwen Community 1.0 | Pesos empaquetados para el motor Basalt; incluye MTP y proyector de visión |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible (MoE) | no disponible | safetensors (presumible) | Qwen Community 1.0 | Modelo base sin empaquetar; requiere un runtime estándar |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible (MoE) | no disponible | GGUF (UD IQ1_S a Q8_0) | Qwen Community 1.0 | Origen de la mayoría de packs; compatible con llama.cpp y derivados |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible (MoE) | no disponible | NVFP4 | Qwen Community 1.0 | Origen de los packs NVFP4; expertos conservados bit a bit |

No se dispone de datos de parámetros, contexto ni benchmarks de tarea para establecer una comparación de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en GPUs NVIDIA Blackwell (sm_120) bajo Linux; no hay soporte para otras arquitecturas ni sistemas operativos.
- Dependencia del motor: requiere Basalt 0.2.0 o superior y ficheros en formato versión 2; los ficheros v1 deben migrarse (opcionalmente) con el script incluido.
- Licencia: Qwen Community License 1.0, con posibles restricciones para uso comercial; deben revisarse los términos del fichero `LICENSE` antes de desplegar en producción.
- Calidad degradada en cuantizaciones bajas: UD-IQ1_S presenta KLD medio de 0,2676 y solo 82,76 % de acuerdo top-1 con la referencia BF16; no es adecuado para tareas sensibles a la fidelidad.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; heredados del modelo base y no evaluados por el autor del paquete.
- Idiomas y contexto: no disponibles; no se puede confirmar el soporte multilingüe ni la ventana de contexto efectiva.
- Rendimiento variable: el propio autor advierte que las cifras de tokens/s cambian con cada release del motor.
- Requisitos de memoria: aunque el offload a RAM permite ejecutar el modelo, la latencia se degrada cuando los expertos activos no residen en VRAM.
- Ausencia de benchmarks de tarea: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares en este repositorio; la evaluación de capacidades debe hacerse contra el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Web del motor Basalt: https://basalt.jgulfo.com
- Repositorio del motor Basalt: https://github.com/jesdga95/basalt
- README del motor: https://github.com/jesdga95/basalt#readme
- Changelog del formato `.basalt`: https://github.com/jesdga95/basalt/blob/main/docs/basalt-file-changelog.md
- Documentación de precisión: https://github.com/jesdga95/basalt/blob/main/docs/precision
- Documentación del formato de modelo: https://github.com/jesdga95/basalt/blob/main/docs/model-file.md
- GGUF de Unsloth (origen de los packs UD y Q8_0): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- NVFP4 de NVIDIA (origen de los packs NVFP4): https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
