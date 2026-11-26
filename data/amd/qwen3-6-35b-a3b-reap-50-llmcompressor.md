# amd/Qwen3.6-35B-A3B-reap-50-llmcompressor

## Resumen

Qwen3.6-35B-A3B-reap-50-llmcompressor es una variante podada del modelo Qwen3.6-35B-A3B publicada por AMD. El modelo original es un transformer híbrido de tipo MoE (mezcla de expertos) con atención lineal y atención completa alternadas, y esta versión aplica una poda estructural del 50 % de los expertos enrutados de cada capa MoE mediante la técnica REAP (Router-weighted Expert Activation Pruning). El resultado conserva los pesos en BF16 pero reduce el número de expertos por capa de 256 a 128, lo que rebaja el tamaño del checkpoint de 67,0 GiB a 35,4 GiB.

El modelo está pensado específicamente para inferencia en CPU sobre procesadores AMD EPYC, con una pila de software optimizada que incluye ZenDNN, ZenTorch, PyTorch 2.14.0+cpu, Transformers 5.20.2, LLM Compressor 0.14.0 y vLLM 0.34.0. No es una cuantización: es una poda estructural que mantiene la precisión BF16 y no incorpora `quantization_config` en el checkpoint.

Es relevante porque demuestra una vía práctica para reducir el coste de despliegue de modelos MoE grandes en hardware de CPU sin recurrir a cuantización agresiva, manteniendo intactas las capas de atención, el experto compartido, la torre de visión y el resto de componentes críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (transformer híbrido: 30 bloques de atención lineal + 10 de atención completa, con capas MoE) |
| Parametros totales | 18.990.568.816 (según safetensors del checkpoint podado) |
| Parametros activos | no disponible (el modelo base es MoE con top-8 sobre 256 expertos; tras poda, top-8 sobre 128 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en BF16; la poda no es cuantización) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, formato compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer híbrido con 40 capas de decodificador: 30 bloques de atención lineal y 10 de atención completa (uno cada cuatro capas). Cada capa MoE combina expertos enrutados con un experto compartido siempre activo. Esta variante podada conserva intactas ambas pilas de atención, el experto compartido, la torre de visión de 27 bloques con su merger, `lm_head`, `embed_tokens` y las layer norms.

La poda se realizó con LLM Compressor mediante el modificador `REAPPruningModifier` con `sparsity=0.50`. REAP puntúa cada experto según su contribución real a la salida de la capa, ponderando la magnitud de activación por la probabilidad que le asigna el router, y elimina el 50 % con menor puntuación. Se calibró con 128 muestras de `allenai/tulu-3-sft-personas-math`, renderizadas con la plantilla de chat del modelo a longitud máxima de 2048 tokens y batch de 1. Los expertos supervivientes se registran en `retained_experts.json` (128 índices por capa). El router mantiene su selección top-8 pero proyecta sobre los 128 expertos restantes (`[128, 2048]`). Los tensores 3D fusionados se descomponen durante la poda y se vuelven a empaquetar con `repack_moe()` antes de guardar, de modo que el checkpoint carga como un Qwen3.6 estándar con dimensión de experto reducida.

## Capacidades

- Generación de texto conversacional en inglés.
- Entrada multimodal texto e imagen (la torre de visión se conserva intacta tras la poda).
- Razonamiento y respuesta multi-turno heredados del modelo base.
- Soporte de tool calling y function calling (heredado de la familia Qwen3.6; no detallado en la model card).
- Capacidades de agente y razonamiento multi-paso (heredadas del modelo base).
- Inferencia optimizada en CPU AMD EPYC mediante ZenDNN y ZenTorch.
- Compatibilidad con vLLM 0.34.0 y la pila compressed-tensors.

## Casos de uso

- Inferencia en CPU sobre servidores AMD EPYC: el modelo está empaquetado y validado para ZenDNN/ZenTorch, lo que permite desplegar un MoE de gran tamaño sin GPU dedicada en entornos donde el coste de GPU es prohibitivo.
- Servicios de generación de texto en producción con vLLM: al cargar como checkpoint Qwen3.6 estándar con expertos reducidos, se integra en el servidor vLLM 0.34.0 con la pila compressed-tensors.
- Procesamiento de documentos con imagen y texto: la torre de visión intacta permite tareas image-text-to-text, como extracción de información de capturas o formularios escaneados.
- Asistentes conversacionales multi-turno en inglés: adecuado para chatbots de soporte donde el coste por token en CPU es el factor dominante.
- Prototipado y evaluación de técnicas de poda: sirve como referencia reproducible de REAP al 50 % sobre un MoE híbrido, con script de receta incluido en la model card.
- Despliegue en infraestructura AMD heterogénea: al reducir el checkpoint a 35,4 GiB, encaja en nodos con memoria de sistema limitada donde la versión completa de 67 GiB no cabría con holgura.
- Investigación sobre el impacto de la poda de expertos: comparar esta variante con el modelo base permite medir la degradación por eliminar el 50 % de expertos enrutados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo declarado: CPU AMD EPYC con Linux como sistema operativo preferido.
- Memoria: el checkpoint ocupa 35,4 GiB en disco (frente a 67,0 GiB del original); para inferencia en BF16 se requiere memoria de sistema suficiente para los pesos y el estado de ejecución, aunque la cifra exacta de RAM no está especificada.
- GPU: no se indica soporte GPU validado en la información disponible; el modelo está optimizado para CPU.
- Cabe en GPU de consumo: no disponible (no validado para GPU en la model card).
- Despliegue: vLLM 0.34.0 con ZenDNN y ZenTorch; PyTorch 2.14.0+cpu; Transformers 5.20.2; LLM Compressor 0.14.0; Python 3.12.16.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| amd/Qwen3.6-35B-A3B-reap-50-llmcompressor | 18,99 B (checkpoint podado) | no disponible | apache-2.0 | Poda REAP 50 %, BF16, optimizado para CPU AMD EPYC |
| RedHatAI/Qwen3.6-35B-A3B (base) | no disponible (checkpoint de 67,0 GiB) | no disponible | no disponible | Modelo original sin podar, 256 expertos por capa |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La poda elimina el 50 % de los expertos enrutados; es esperable cierta degradación de calidad frente al modelo base, aunque no se publican métricas que la cuantifiquen.
- Solo se declara soporte de inglés (`en`); el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje, no evaluado específicamente en esta variante podada.
- La calibración de la poda se hizo con un único dataset (`allenai/tulu-3-sft-personas-math`), lo que puede sesgar qué expertos se conservan hacia ese dominio.
- No hay `quantization_config`: el modelo se sirve en BF16, con el coste de memoria asociado; no se han publicado variantes cuantizadas de esta poda.
- El soporte está centrado en CPU AMD EPYC con Linux; el rendimiento en otras plataformas no está validado.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y del dataset de calibración para uso comercial.
- El número de descargas y likes es muy bajo (3 y 0 en el momento de la consulta), por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.6-35B-A3B-reap-50-llmcompressor
- Modelo base: https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Dataset de calibración: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math
