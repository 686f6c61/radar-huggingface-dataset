# jerrywangTT/gpt-oss-20b-qb2-kgptq

## Resumen

`jerrywangTT/gpt-oss-20b-qb2-kgptq` es una conversión de pesos del modelo `openai/gpt-oss-20b` de OpenAI, publicada por el usuario jerrywangTT, orientada específicamente al hardware QuietBox 2 (P300X2 con aceleradores Blackhole de Tenstorrent). No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de cuantización que contiene pesos redondeados offline para su uso con la pila de software tt-metal, que los carga a través de `weight_source.py` desde las rutas `hf://` definidas en la especificación de tt-inference-server para P300X2.

El repositorio incluye dos componentes: 24 ficheros `kgptq_experts/layer_<L>.pt` con los expertos enrutados del MoE, redondeados mediante GPTQ sobre la rejilla `bfloat4_b` con grupos de 16 valores a lo largo de la dimensión de entrada K, y un fichero `dense/dense_gptq_device.pt` con los pesos densos de decodificación redondeados con GPTQ. La calibración se realizó sobre entradas MoE de referencia del modelo de Hugging Face, sin datos de evaluación.

Su relevancia es acotada pero concreta: permite ejecutar `gpt-oss-20b` en hardware Blackhole con el mismo número de bytes y velocidad que una conversión directa del checkpoint MXFP4, pero con menor error de redondeo, ya que los valores de los expertos son exactamente representables en `bfloat4_b`. Es un artefacto de despliegue para un stack y un hardware muy específicos, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE basada en transformer (heredada de `openai/gpt-oss-20b`); pesos preparados para decodificación en tt-metal |
| Parámetros totales | no disponible en la información proporcionada (el modelo base `gpt-oss-20b` se denomina por 20B, sin desglose confirmado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ sobre rejilla `bfloat4_b` con grupos de 16 valores en la dimensión K (expertos); GPTQ para pesos densos de decodificación |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ficheros `.pt` (PyTorch): 24 × `kgptq_experts/layer_<L>.pt` y `dense/dense_gptq_device.pt`; incluye `SHA256SUMS` |
| Modelo base | `openai/gpt-oss-20b` |
| Tamaño del repositorio | 40,7 GB |
| Hardware objetivo | QuietBox 2 (P300X2, Blackhole) con tt-metal |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: deriva del checkpoint `openai/gpt-oss-20b`, un modelo MoE de OpenAI, y aplica un proceso de cuantización post-entrenamiento con GPTQ. Los expertos enrutados se redondean sobre la rejilla `bfloat4_b` agrupando 16 valores a lo largo de la dimensión de entrada K, que corresponde a los tiles transpuestos de los flujos de decodificación. Los ficheros de expertos contienen las claves `gate_up_proj` con forma `[E, H, 2I]` (gate y up intercalados), `gate_up_proj_bias`, `down_proj` con forma `[E, I, H]`, `down_proj_bias`, y el orden de canales del checkpoint.

La calibración de GPTQ se realizó sobre entradas MoE de referencia del modelo de Hugging Face, sin conjunto de evaluación asociado. La innovación técnica del artefacto es que los valores de los expertos resultan exactamente representables en `bfloat4_b`, de modo que se ejecutan con el mismo consumo de bytes y la misma velocidad que una conversión directa del checkpoint MXFP4, pero con menor error de redondeo. Los pesos se consumen desde tt-metal mediante `models/demos/gpt_oss/tt/weight_source.py`, con las variables `GPT_OSS_DECODE_SPLIT_ROUND_DIR` (expertos) y `GPT_OSS_DENSE_ROUNDED_DECODE` (densos).

## Capacidades

- Las capacidades funcionales son las del modelo base `openai/gpt-oss-20b`; esta información no se detalla en la model card proporcionada.
- Generación de texto y razonamiento: heredadas del modelo base, sin datos específicos en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Ejecución en hardware Tenstorrent Blackhole mediante tt-metal: capacidad específica de este artefacto.

## Casos de uso

- Despliegue de `gpt-oss-20b` en QuietBox 2 (P300X2, Blackhole): el artefacto está diseñado para cargarse desde tt-metal con las rutas `hf://` de la especificación P300X2 de tt-inference-server, lo que permite servir el modelo en aceleradores Tenstorrent sin reconvertir pesos.
- Evaluación de precisión de cuantización en hardware: al ser valores exactamente representables en `bfloat4_b`, sirve para comparar el error de redondeo frente a una conversión directa del checkpoint MXFP4 en el mismo hardware y con el mismo consumo de bytes.
- Integración en pipelines de tt-inference-server: los ficheros se referencian mediante variables de entorno concretas (`GPT_OSS_DECODE_SPLIT_ROUND_DIR`, `GPT_OSS_DENSE_ROUNDED_DECODE`), lo que facilita su inclusión en despliegues automatizados sobre P300X2.
- Reproducibilidad de despliegues: el repositorio incluye `SHA256SUMS` con todos los ficheros, lo que permite verificar la integridad de los pesos en entornos de producción.
- Investigación sobre formatos de cuantización de bajo bit: la combinación de GPTQ con grupos de 16 valores en K sobre `bfloat4_b` es un caso de estudio para quienes trabajan con formatos de 4 bits en aceleradores específicos.
- Pruebas de decodificación de modelos MoE en tt-metal: los 24 ficheros por capa permiten validar la ruta de decodificación de expertos enrutados del stack de Tenstorrent.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la calibración se hizo sobre entradas de referencia "no eval data", por lo que no hay métricas de calidad ni de rendimiento publicadas.

## Requisitos de hardware

- Hardware objetivo: QuietBox 2 con P300X2 y aceleradores Blackhole de Tenstorrent; no está pensado para GPU convencionales.
- VRAM estimada: no aplicable en el sentido habitual; el repositorio ocupa 40,7 GB en disco y se ejecuta sobre la memoria de los aceleradores Blackhole.
- GPU recomendadas: no disponible; el artefacto está vinculado a tt-metal y al hardware Blackhole.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090 u otras GPU consumer.
- Opciones de despliegue: tt-metal (`models/demos/gpt_oss/tt/weight_source.py`) y tt-inference-server con la especificación P300X2. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo afirma que la velocidad es la misma que la de una conversión directa del checkpoint MXFP4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| `jerrywangTT/gpt-oss-20b-qb2-kgptq` | no disponible (base 20B) | no disponible | `.pt` (GPTQ `bfloat4_b`) | Apache-2.0 | QuietBox 2 / Blackhole |
| `openai/gpt-oss-20b` (base) | 20B (denominación) | no disponible | safetensors / MXFP4 | Apache-2.0 | GPU convencionales |
| Conversión directa MXFP4 para tt-metal | 20B (denominación) | no disponible | MXFP4 | Apache-2.0 | QuietBox 2 / Blackhole |

La comparativa relevante es frente al checkpoint original y frente a la conversión directa del MXFP4 para el mismo hardware: este artefacto mantiene el mismo consumo de bytes y velocidad que la conversión directa, con menor error de redondeo. No se dispone de datos de benchmarks para comparar calidad.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el stack tt-metal y hardware Blackhole; no es cargable directamente en frameworks convencionales sin adaptación.
- Sin datos de evaluación: la calibración GPTQ se hizo sobre entradas de referencia y la model card confirma que no hay eval data, por lo que se desconoce la degradación de calidad frente al modelo base.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: no disponible en la documentación proporcionada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Autor individual: el artefacto no está publicado por OpenAI ni por Tenstorrent, sino por un usuario independiente; conviene verificar los pesos con `SHA256SUMS` antes de usarlos en producción.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial, pero sin garantías explícitas sobre la calidad de la cuantización.
- Fecha de creación indicada como 2026-11-04, posterior a la fecha habitual de referencia; conviene contrastar la vigencia del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jerrywangTT/gpt-oss-20b-qb2-kgptq
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- tt-metal (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- tt-inference-server (referenciado en la model card): no disponible como enlace directo en la información proporcionada
