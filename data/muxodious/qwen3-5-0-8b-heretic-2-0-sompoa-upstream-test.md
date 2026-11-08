# MuXodious/Qwen3.5-0.8B-heretic-2.0-SOMPOA-upstream-test

## Resumen

Este modelo es una variante "decensored" (abliterated) del Qwen3.5-0.8B de Alibaba, generada por el usuario MuXodious mediante la herramienta Heretic v2.1.0.dev0 con una configuración denominada SOMPOA. El objetivo declarado es eliminar los comportamientos de rechazo del modelo original: segun la model card, las negativas caen de 97/101 en el modelo base a 7/101 en esta version, con una divergencia KL de 0,0831 respecto al original. Es, por tanto, un experimento de modificacion de pesos orientado a eliminar el alineamiento de seguridad, no un modelo nuevo entrenado desde cero.

El modelo subyacente, Qwen3.5-0.8B, es el miembro mas pequeno de la familia Qwen3.5 de Qwen Team (Alibaba). Se trata de un transformer multimodal denso con fusion temprana de tokens de vision y lenguaje, arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con atencion con compuertas, y un contexto nativo de 262.144 tokens. Con 852.985.920 parametros reales (segun safetensors) y un repositorio de 1,7 GB, esta pensado para prototipado, ajuste fino especifico de tarea e investigacion.

La relevancia de esta ficha es doble: por un lado documenta un caso de "abliteration" sobre un modelo multimodal de ultima generacion; por otro, advierte de que se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, creado y actualizado con segundos de diferencia, lo que sugiere un estado experimental y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (hibrida: Gated DeltaNet + Gated Attention) con codificador de vision |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (el modelo base se describe como denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existe una version GGUF de terceros: FadedRedStar/Qwen3.5-0.8B-heretic-GGUF) |
| Idiomas soportados | no disponible en esta ficha; el modelo base declara soporte para 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos mecanismos de atencion en un layout hibrido de 24 capas: 6 bloques de la forma 3 x (Gated DeltaNet -> FFN) seguidos de 1 x (Gated Attention -> FFN). Gated DeltaNet emplea 16 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza 128; Gated Attention usa 8 cabezas para Q y 2 para KV con dimension de cabeza 256 y RoPE de dimension 64. La dimension oculta es 1024, la dimension intermedia del FFN es 3584 y el embedding de tokens es de 248.320 entradas (con padding), atado a la salida del LM. El modelo incluye un codificador de vision y fue entrenado con multi-token prediction (MTP) en varios pasos.

El entrenamiento del base incluye fases de preentrenamiento y postentrenamiento con fusion temprana de tokens multimodales, asi como RL escalado en entornos multiagente. Sobre esa base, esta variante aplica una modificacion de pesos con Heretic v2.1.0.dev0: la model card documenta parametros SOMPOA por capa para `attn.o_proj` y `mlp.down_proj`, incluyendo indices de direccion por capa, pesos maximos y minimos por indice y posiciones/distancia de pesos maximos (por ejemplo, `attn.o_proj.max_weight_position` = 11,67 y `mlp.down_proj.max_weight_position` = 16,44). No se documenta reentrenamiento adicional ni datos de ajuste; la intervencion es de edicion de direcciones en el espacio de activaciones/pesos.

## Capacidades

- Generacion de texto conversacional y razonamiento en el modelo base, heredadas del Qwen3.5-0.8B.
- Comprension de imagen y texto (pipeline `image-text-to-text`), gracias al codificador de vision del base.
- Capacidad multimodal de fusion temprana: el base declara paridad con Qwen3 en razonamiento, codigo, agentes y comprension visual.
- Soporte multilingue amplio en el base (201 idiomas y dialectos segun la model card original).
- Comportamiento "decensored": reduccion drastica de rechazos (7/101 frente a 97/101) segun la metrica declarada por el autor.
- Tool calling y razonamiento multi-paso: no confirmado de forma explicita en la informacion disponible para esta variante; el base esta orientado a agentes.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar el comportamiento del modelo original y esta variante con la misma bateria de prompts (101 casos) para estudiar como la edicion de pesos altera las negativas y la calidad (KL de 0,0831).
- Prototipado de asistentes multimodales: usar el pipeline `image-text-to-text` para experimentos de descripcion de imagenes y dialogos sobre capturas o documentos escaneados, aprovechando el contexto de 262.144 tokens.
- Ajuste fino especifico de tarea: con 0,85B de parametros y licencia Apache-2.0, sirve como base barata para fine-tuning en dominios concretos donde se quiera partir de un modelo sin rechazos.
- Evaluacion de robustez de filtros: probar si los sistemas de moderacion externos detectan contenido que el modelo ya no rechaza, como prueba de defensa en profundidad.
- Experimentos de destilacion o generacion de datos sinteticos: el bajo coste computacional del 0.8B permite generar grandes volumenes de texto para curation posterior.
- Despliegue en entornos con recursos limitados: el tamano (1,7 GB en safetensors, menos con cuantizacion GGUF de terceros) permite ejecucion en GPU de consumo para demos y pruebas de concepto.
- Analisis de sesgos y contenido: estudiar que tipo de peticiones dejan de rechazarse y con que calidad de respuesta, como insumo para politicas de uso.

## Benchmarks y rendimiento

La model card de esta variante solo publica metricas de la intervencion de decensurado, no benchmarks estandar:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-0.8B) |
|---|---|---|
| Rechazos (refusals) | 7/101 | 97/101 |
| Divergencia KL | 0,0831 | 0 (por definicion) |

Los benchmarks de lenguaje del modelo base (MMLU, HumanEval, GSM8K, etc.) aparecen en la model card original de Qwen, pero la informacion proporcionada esta truncada y no incluye las cifras. No se han publicado resultados de benchmarks estandar en la informacion disponible para esta variante.

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 1,7 GB solo para pesos; con overhead de activaciones y cache KV para contexto largo, se recomienda al menos 4-6 GB. Con cuantizacion de 4 bits (via GGUF de terceros), los pesos bajan a alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 con contexto moderado; RTX 3060/4060, RTX 4090, A100 o H100 para despliegues con contexto largo o lotes grandes.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas; con cuantizacion, incluso en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (formato nativo), vLLM y SGLang (el base declara compatibilidad), KTransformers; llama.cpp/Ollama solo si se usa la conversion GGUF de terceros.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-0.8B-heretic-2.0-SOMPOA) | 0,85B | 262.144 | Si (image-text-to-text) | Apache-2.0 | Variante decensored experimental, 0 descargas |
| Qwen/Qwen3.5-0.8B | 0,8B | 262.144 | Si | Apache-2.0 | Base original alineado, con rechazos en 97/101 casos |
| Qwen3.5-2B | no disponible en detalle | 262.144 (familia) | Si | Apache-2.0 | Version superior de la misma familia |
| Qwen3-1.7B | 1,7B | no disponible | No | Apache-2.0 | Generacion anterior, solo texto |

## Limitaciones y advertencias

- Modelo experimental sin validacion: 0 descargas y 0 likes en el momento de la consulta; creado y actualizado con 12 segundos de diferencia, lo que indica publicacion de prueba ("upstream-test").
- Eliminacion deliberada de rechazos: la reduccion de 97/101 a 7/101 implica que el modelo puede generar contenido que el original bloqueaba; no debe desplegarse en produccion sin moderacion externa.
- Degradacion de calidad: la divergencia KL de 0,0831 respecto al base indica que la edicion altera la distribucion de salida; no se han publicado evaluaciones de calidad tras la intervencion.
- Riesgo de alucinacion: no evaluado en esta variante; los modelos de 0,8B tienen capacidad limitada de razonamiento factual.
- Idiomas: no declarados para esta variante; el soporte de 201 idiomas corresponde al base y puede verse afectado por la edicion de pesos.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias y el contenido generado puede violar politicas de plataformas o normativa aplicable.
- Contexto: los 262.144 tokens son nativos del base; no hay confirmacion de que la edicion preserve el rendimiento en contextos largos.
- Sin datos de cuantizacion oficiales: la unica opcion GGUF encontrada es de un tercero (FadedRedStar), sin garantias de fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/Qwen3.5-0.8B-heretic-2.0-SOMPOA-upstream-test
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Heretic (herramienta de decensurado): https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Version GGUF de terceros: https://huggingface.co/FadedRedStar/Qwen3.5-0.8B-heretic-GGUF
- Otra variante heretic: https://huggingface.co/ossipoff/Qwen3.5-0.8B-heretic
