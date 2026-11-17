# rkcth/Huihui-Gemma-4-31B-it-Abliterated-Radiance-W4A8

## Resumen

Huihui-Gemma-4-31B-it-Abliterated-Radiance-W4A8 es una cuantización del modelo huihui-ai/Huihui-gemma-4-31B-it-abliterated, una variante "abliterated" (con los mecanismos de rechazo atenuados o eliminados mediante edición de pesos) del Gemma 4 31B instruct de Google. El autor del checkpoint cuantizado es rkcth, que lo publica en formato propietario `.rad` para el runtime Radiance, un fork de inferencia orientado a GPUs AMD. La cuantización aplica W4A8 (pesos de 4 bits, activaciones de 8 bits) a las proyecciones de atención y de feed-forward, reduciendo el checkpoint a 20,40 GiB.

El modelo resuelve el problema de desplegar un modelo denso de 31B parámetros en hardware AMD Radeon de gama profesional sin recurrir a CUDA ni a formatos GGUF convencionales. Está pensado para inferencia en tándem con otras cargas (el autor lo verifica como modelo secundario junto a Qwen Flash Next) sobre dos Radeon AI PRO R9700 con tensor parallelism de grado 2. La relevancia actual radica en que demuestra un pipeline completo de cuantización W4A8 y despliegue multi-GPU en el ecosistema ROCm/AMD, un nicho con pocas alternativas maduras.

La información pública disponible es muy limitada: la model card se centra en instrucciones de despliegue y no documenta datos de entrenamiento, benchmarks ni idiomas. Al tratarse de una cuantización, las capacidades heredan del modelo base abliterated, pero el autor no aporta evaluaciones propias de degradación por cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Gemma 4 31B); cuantización W4A8 en proyecciones de atención y feed-forward |
| Parametros totales | 31B (según nombre del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en la configuración de ejemplo del autor (`max-model-len: 8192`) |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits); formato `.rad` propietario de Radiance |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.rad` (runtime Radiance); no se publican safetensors ni GGUF en este repo |
| Tamano del checkpoint | 20,40 GiB (repo: 21,9 GB) |
| Modelo base | huihui-ai/Huihui-gemma-4-31B-it-abliterated (commit fijado 2abf02b) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento de un transformer denso de 31B parámetros. No se ha reentrenado ni ajustado: la model card indica explícitamente que la conversión parte de un checkpoint fuente fijado por commit (`2abf02b3a9cd51ce98a41d9ecd2d0d9e142ae5e6`) del modelo abliterated de huihui-ai. La innovación técnica es la cuantización W4A8 aplicada a las proyecciones de atención y feed-forward, empaquetada en formato `.rad` para el fork de Radiance del autor.

El modelo base, a su vez, es una versión "abliterated" de Gemma 4 31B instruct: una edición de pesos que suprime direcciones de activación asociadas al rechazo de peticiones, sin fine-tuning adicional documentado en esta ficha. No hay información disponible sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO en el modelo original. La configuración de despliegue del autor desactiva la decodificación especulativa (`num-speculative-tokens: 0`) y limita a 2 secuencias concurrentes y 512 tokens por lote.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, endpoint de chat con identificador `gemma4-31b-abliterated`).
- Razonamiento e instrucciones heredados de Gemma 4 31B instruct, aunque no verificados con benchmarks en esta ficha.
- Modo "abliterated": menor tendencia a rechazar peticiones que el modelo instruct original, por edición de pesos.
- Despliegue multi-GPU con tensor parallelism (`tp: 2`) en GPUs AMD Radeon AI PRO R9700.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta cuantización.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un LLM de 31B en hardware AMD: el formato `.rad` y el runtime Radiance permiten servir el modelo en dos Radeon AI PRO R9700 sin CUDA, un escenario habitual en entornos con GPUs ROCm.
- Modelo secundario en un servidor multi-modelo: el autor lo verifica ejecutándose junto a Qwen Flash Next, por lo que encaja como carga auxiliar con límites de concurrencia bajos (`max-num-seqs: 2`).
- Generación de texto conversacional con contexto medio: la ventana de 8192 tokens cubre diálogos multi-turno y documentos de tamaño moderado.
- Investigación sobre cuantización W4A8: sirve para medir la degradación de calidad frente al checkpoint base en tareas de generación, comparando salidas entre ambos.
- Entornos con restricciones de memoria: el checkpoint de 20,40 GiB cabe en 2×24 GB o 2×32 GB de VRAM, permitiendo ejecutar un 31B en GPUs de gama profesional.
- Pruebas de pipelines de inferencia en ROCm: útil para validar integraciones del runtime Radiance (endpoint de chat, configuración YAML, verificación SHA256) antes de pasar a producción.
- Evaluación de modelos abliterated en entornos controlados: para estudiar el comportamiento del modelo sin mecanismos de rechazo en tareas de moderación o red teaming interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 20,40 GiB, por lo que se necesita al menos 2×24 GB de VRAM con `tp: 2` para dejar margen a KV cache y activaciones; con contexto de 8192 tokens y 2 secuencias el margen adicional es reducido.
- GPU verificadas por el autor: 2× AMD Radeon AI PRO R9700 (tensor parallelism de grado 2).
- GPUs NVIDIA (A100, H100, RTX 4090): no disponibles para este formato; el runtime Radiance es un fork orientado a AMD y el checkpoint `.rad` no es portable a vLLM, llama.cpp ni TGI.
- Consumer GPU: no cabe en una sola GPU de consumo de 24 GB (RTX 4090) por el tamaño del checkpoint y la necesidad de dos dispositivos; no hay soporte documentado en GPUs de consumo AMD.
- Opciones de despliegue: exclusivamente el fork de Radiance del autor (https://github.com/rkcth/radiance), compilando ejecutable y plugins juntos; configuración vía YAML.
- Latencia y throughput: no disponibles. La configuración del autor limita a 2 secuencias concurrentes y 512 tokens por lote, lo que sugiere un throughput moderado orientado a baja concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Huihui-Gemma-4-31B-it-Abliterated-Radiance-W4A8 | 31B denso | 8192 (config. autor) | `.rad` (W4A8) | apache-2.0 | 2× Radeon AI PRO R9700 |
| huihui-ai/Huihui-gemma-4-31B-it-abliterated (base) | 31B denso | no disponible | safetensors (BF16/FP16) | no disponible en esta ficha | GPUs con mayor VRAM (no cuantizado) |
| Gemma 4 31B instruct (original) | 31B denso | no disponible | safetensors | licencia Gemma (no verificada aquí) | CUDA/ROCm estándar |
| Cuantizaciones GGUF de Gemma 31B (genéricas) | 31B denso | variable | GGUF | según autor | llama.cpp, Ollama, GPUs de consumo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización W4A8 puede degradar la calidad de generación frente al checkpoint base en tareas sensibles; no se publican evaluaciones de dicha degradación.
- El modelo es "abliterated": se han atenuado los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado sin filtros. Requiere moderación externa en producción.
- Riesgo de alucinación inherente a los LLM; no hay evaluaciones de fidelidad publicadas para esta cuantización.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Formato `.rad` propietario: no es compatible con vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y crea dependencia del fork Radiance.
- El runtime Radiance es un fork mantenido por el autor del checkpoint; su madurez, soporte y seguridad no están verificados en esta ficha.
- La licencia apache-2.0 se declara en el repo, pero la licencia del modelo base Gemma puede imponer restricciones adicionales de uso comercial; conviene revisar `LICENSE` y `NOTICE` del repo y la licencia original de Gemma.
- Contexto limitado a 8192 tokens en la configuración de ejemplo, inferior a las ventanas de modelos actuales de gama similar.
- Concurrencia muy baja (`max-num-seqs: 2`): no apto para cargas de producción con muchas peticiones simultáneas.
- Repo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/rkcth/Huihui-Gemma-4-31B-it-Abliterated-Radiance-W4A8
- Modelo base: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated
- Commit fijado del modelo base: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated/tree/2abf02b3a9cd51ce98a41d9ecd2d0d9e142ae5e6
- Fork de Radiance: https://github.com/rkcth/radiance
