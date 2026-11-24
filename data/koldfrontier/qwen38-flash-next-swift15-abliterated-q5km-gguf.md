# koldfrontier/qwen38-flash-next-swift15-abliterated-q5km-gguf

## Resumen

Este repositorio publica una versión en formato GGUF del checkpoint Qwen3.8-Flash-Next, un modelo de lenguaje de gran escala desarrollado originalmente por el equipo Qwen (Alibaba). La versión aquí descrita incorpora dos adaptadores LoRA aplicados sobre los pesos base: Swift-1.5, de nchapman, y una dirección de abliteration de rango 1 publicada por nazeshinjite. El resultado se cuantiza una sola vez a Q5_K_M mediante una receta específica que corrige las limitaciones de llama.cpp con matrices cuyo ancho no es múltiplo de 256. El autor del empaquetado es el usuario koldfrontier.

El modelo resuelve el problema de desplegar un checkpoint de aproximadamente 177.000 millones de parámetros en entornos con recursos limitados, ofreciendo un archivo GGUF de 118,2 GB compatible con llama.cpp, LM Studio y Ollama. La relevancia actual radica en que combina un modelo base de última generación con ajustes de comportamiento (estilo conversacional Swift-1.5 y eliminación de rechazos mediante abliteration) en un formato listo para inferencia local o en servidores con GPUs de gama alta.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE), según se deduce de las capas `ffn_down_exps` y `ffn_down_shexp` mencionadas en la receta de cuantización. La longitud de contexto, el número de parámetros activos y los idiomas soportados no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida de las capas `ffn_down_exps` y `ffn_down_shexp` |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M con receta mixta: `q5_K` para gate/up, `q6_K` para atención, `q5_1` para `ffn_down_exps` y `ffn_down_shexp`, `iq4_nl` para `per_layer_token_embd` |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (los LoRA conservan sus propias licencias) |
| Formato de pesos | GGUF (archivo único `qwen38-flash-next-swift15-abliterated-q5km-Q5_K_M.gguf`, 118.202.878.144 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura transformer con mezcla de expertos, tal como evidencian las proyecciones de bajada por experto (`ffn_down_exps`) y la proyección compartida (`ffn_down_shexp`) presentes en las 48 capas del bloque (`blk.<N>` para N en 0..47). Sobre este checkpoint se aplicaron dos adaptadores LoRA: Swift-1.5, orientado a mejorar el comportamiento conversacional, y una dirección de abliteration de rango 1 que elimina la tendencia del modelo a rechazar peticiones. La fusión se realizó antes de la cuantización, de modo que el GGUF contiene los pesos ya modificados.

La innovación técnica principal de este empaquetado reside en la receta de cuantización. llama.cpp rechaza los K-quants en filas cuyo ancho no es múltiplo de 256, lo que afecta a las proyecciones de bajada de los expertos (640 columnas) y a `per_layer_token_embd` (160 columnas). El autor fija explícitamente `q5_1` para las primeras y `iq4_nl` para la segunda, manteniendo las elecciones estándar de Q5_K_M en el resto. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con el estilo ajustado por el LoRA Swift-1.5.
- Razonamiento y respuesta directa sin rechazos gracias a la dirección de abliteration aplicada.
- Compatibilidad con el ecosistema llama.cpp, LM Studio y Ollama para inferencia local.
- Soporte de endpoints compatibles según la etiqueta `endpoints_compatible` del repositorio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno en un equipo con suficiente VRAM, gracias a su formato GGUF listo para llama.cpp u Ollama, sin depender de servicios en la nube.
- Investigación sobre alineación y rechazos: la versión abliterated permite estudiar el comportamiento del modelo ante peticiones que el checkpoint original rechazaría, comparando respuestas con y sin la dirección aplicada.
- Despliegue en estaciones de trabajo con múltiples GPUs: el archivo único de 118,2 GB puede cargarse en configuraciones con 2× V100 o GPUs de 80 GB, como se probó en el entorno del autor con el motor Basalt/Lapilli.
- Generación de texto creativo y roleplay: el ajuste Swift-1.5 está orientado a mejorar la fluidez conversacional, lo que resulta adecuado para aplicaciones de escritura asistida y simulación de personajes.
- Evaluación de recetas de cuantización: la receta mixta Q5_K_M/Q5_1/IQ4_NL sirve como referencia para estudiar el impacto de cuantizaciones híbridas en modelos MoE de gran tamaño.
- Pruebas de integración con llama.cpp: el GGUF permite validar pipelines de inferencia, medición de perplejidad y comparación con otros formatos (Basalt) en entornos de desarrollo.

## Benchmarks y rendimiento

Los datos publicados corresponden a la medición del pack Basalt con `basalt-bench --quality 16`, usando una base de divergencia KL derivada de los pesos F16 del propio modelo y un conjunto de test de wikitext-2 de 16 fragmentos. El GGUF decodifica a los mismos pesos.

| Pack | PPL | KLD media | Coincidencia top-1 |
|---|---|---|---|
| Este modelo (expertos down en q5_1) | 2,1877 | 0,11384 | 91,52% |
| Mismo modelo, expertos down en q8_0 | 2,1984 | 0,11562 | 91,35% |
| Mismo modelo, expertos down en iq4_nl | 2,2040 | 0,12574 | 91,27% |
| Referencia F16 | 2,1183 | — | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La abliteration no cuenta con evaluación comportamental más allá de cuatro pruebas puntuales sin rechazos; no se ha ejecutado HarmBench ni XSTest.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 118,2 GB, por lo que se necesita al menos esa cantidad de memoria total entre GPU y RAM del sistema para cargarlo completo. Con offloading parcial a CPU, el requisito de VRAM disminuye a costa de latencia.
- GPU recomendadas: el autor probó el modelo en 2× V100 con el motor Basalt/Lapilli. Para el GGUF en llama.cpp se requieren configuraciones con GPUs de 80 GB (A100, H100) o múltiples GPUs de 24-48 GB (RTX 4090, RTX A6000) con offloading.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo. Requiere al menos dos RTX 4090 (48 GB combinados) con offloading parcial a RAM, o configuraciones de mayor capacidad.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime que lea GGUF. El pack Basalt/Lapilli es una alternativa separada para el mismo peso.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-Flash-Next + LoRAs, Q5_K_M) | 176,9 B | no disponible | GGUF | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next (base) | 176,9 B | no disponible | safetensors (presumible) | qwen-community-1.0 | Hugging Face |
| Pack Basalt del mismo modelo | 176,9 B | no disponible | Basalt | qwen-community-1.0 | Hugging Face |
| Modelos comparables de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría (MoE de ~177 B) con la que comparar parámetros activos, rendimiento o contexto.

## Limitaciones y advertencias

- La abliteration no está evaluada con benchmarks de seguridad (HarmBench, XSTest); solo se realizaron cuatro pruebas puntuales sin rechazos, lo que no constituye evidencia robusta de comportamiento.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de fidelidad factual.
- El modelo solo se ha probado en 2× V100 con el motor Basalt/Lapilli; el rendimiento en otros entornos (llama.cpp puro, Ollama) no está verificado.
- No es un modelo de 16 bits: la fuente F16 (354 GB) no está publicada, por lo que no es posible reproducir la cuantización desde los pesos originales.
- La licencia qwen-community-1.0 permite la redistribución de derivados con atribución, pero impone condiciones que deben revisarse antes de uso comercial. Los dos LoRA conservan sus propias licencias, que pueden añadir restricciones.
- Los idiomas soportados no están documentados, lo que limita la evaluación de su cobertura multilingüe.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento del GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/koldfrontier/qwen38-flash-next-swift15-abliterated-q5km-gguf
- Pack Basalt del mismo modelo: https://huggingface.co/koldfrontier/qwen38-flash-next-swift15-abliterated-q5km-basalt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- LoRA Swift-1.5: https://huggingface.co/nchapman/Qwen3.8-Flash-Next-Swift-1.5-LoRA
- LoRA de abliteration: https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-Abliterated-LoRA
- Licencia Qwen community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
