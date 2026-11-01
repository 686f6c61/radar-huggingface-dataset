# j2ipper/Qwen3.8-27B-W4A4-prompt

## Resumen

Qwen3.8-27B-W4A4-prompt es un conjunto de pesos auxiliares en int4 para las capas feed-forward del modelo Qwen3.8-27B, publicado por el usuario j2ipper. No se trata de un modelo autónomo: son ficheros `.w4i` que solo funcionan junto al GGUF exacto `Qwen3.8-27B-UD-IQ4_XS.gguf` de unsloth, y que permiten a Talus, el motor de inferencia del autor, ejecutar el procesamiento de prompts con aritmética de matrices W4A4 sobre GPU AMD Strix Halo (gfx1151). El objetivo concreto es acelerar la fase de prompt (prefill) usando la instrucción `v_wmma_i32_16x16x16_iu4`, que rinde el doble que la ruta int8, mientras la decodificación, el drafting y la verificación siguen usando los pesos originales del GGUF.

La relevancia es de nicho pero técnica: demuestra una vía práctica para aprovechar las unidades de matriz int4 de los aceleradores integrados de AMD en cargas de prompt largo, con una puerta de calidad medida (divergencia KL frente a la referencia CPU de llama.cpp). El repositorio ocupa 10,7 GB y se distribuye bajo licencia Apache-2.0, heredada del modelo base. No hay información publicada sobre el modelo base Qwen3.8-27B más allá de lo que declara esta model card, y el pipeline y los idiomas no están disponibles en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pesos auxiliares int4 para capas feed-forward de un transformer (modelo base Qwen3.8-27B, arquitectura no detallada) |
| Parametros totales | No disponible (el modelo base se denomina 27B; el sidecar no declara recuento propio) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible en el sidecar; se reportan pruebas con prompts de 60K y 4K |
| Tipos de cuantizacion | int4 con una escala por fila de salida (GPTQ, damp 0.1, rotacion Hadamard por 256 columnas); convive con el GGUF UD-IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos); scripts de la receta MIT |
| Formato de pesos | `.w4i` (formato v2 de Talus), acompañando a GGUF `Qwen3.8-27B-UD-IQ4_XS.gguf` |

## Arquitectura y entrenamiento

El sidecar no entrena un modelo: cuantiza a int4 las matrices feed-forward del GGUF base mediante GPTQ. El procedimiento, documentado en la carpeta `recipe/`, consta de cuatro pasos. Primero, calibración con 151.552 tokens de fuentes públicas (código y documentación de llama.cpp en el tag b11062, transcripciones sintéticas de edición agéntica extraídas de su historial git, prompts largos concatenados y textos bajo GPL-3, GFDL-1.3, Apache-2.0 y MPL-2.0), con identificadores de token reproducibles byte a byte. Segundo, cálculo de Hessianos mediante el forward de CPU de llama.cpp y acumulación de X^T X de las entradas feed-forward por capa. Tercero, cuantización GPTQ con rotación Hadamard de signos sembrados (semilla 20261017) y una escala por fila de salida. Cuarto, empaquetado en el layout `.w4i` v2 de Talus.

Hay dos variantes. `Qwen3.8-27B-UD-IQ4_XS.w4i` cubre las capas feed-forward 48-63 y pasa la puerta de calidad; se activa con `TALUS_Q27_W4I=auto`. `Qwen3.8-27B-UD-IQ4_XS.fast.w4i` cubre las capas 0-63, es más rápido en prompt pero falla la puerta de ratio KL a 4K, por lo que es solo opt-in con `TALUS_Q27_W4I=fast`. La innovación técnica es el uso de la ruta W4A4 con `v_wmma_i32_16x16x16_iu4` en el prefill sobre gfx1151, manteniendo el resto del pipeline en los pesos del GGUF. Los bytes del resultado dependen del punto flotante del forward de CPU y de numpy; los identificadores de calibración no.

## Capacidades

- Aceleración del prefill (procesamiento de prompts) en Talus sobre AMD Strix Halo, con 48 matrices feed-forward en la variante `auto`.
- Inferencia int4 W4A4 en las capas cubiertas, con el doble de tasa teórica que la ruta int8 según la model card.
- Compatibilidad con prompts largos: se reportan pruebas needle-in-a-haystack a 60K tokens y KL a 4K.
- Decodificación, drafting y verificación delegadas en los pesos del GGUF, no en el sidecar.
- No aporta capacidades cognitivas propias: generación de texto, razonamiento, código, matemáticas, tool calling o multilingüismo dependen íntegramente de Qwen3.8-27B.
- No soporta tool calling, agentes ni modos de pensamiento por sí mismo; esas capacidades, si existen, son del modelo base.

## Casos de uso

- Servicio de inferencia local en AMD Strix Halo: desplegar Qwen3.8-27B con Talus y activar `TALUS_Q27_W4I=auto` para reducir el coste del prefill en cargas interactivas, manteniendo la calidad medida por la puerta KL.
- Procesamiento de documentos largos: con prompts de hasta 60K tokens validados en needle-in-a-haystack (15/15), resulta adecuado para resumen y extracción sobre expedientes extensos en hardware integrado.
- Asistentes de edición de código en local: la suite de coding agéntico reporta 5/5, lo que respalda su uso en flujos de edición multi-archivo siempre que el modelo base aporte la capacidad de razonamiento.
- Evaluación de cuantizaciones: sirve como referencia para comparar la ruta int8 exacta de Talus frente a W4A4 en términos de KL, top-1 y velocidad de prompt.
- Investigación en kernels int4: el par de ficheros permite medir el compromiso velocidad/calidad entre la variante `auto` (capas 48-63) y la `fast` (capas 0-63).
- Reproducibilidad de recetas de cuantización: los scripts de `recipe/` y los SHA-256 permiten reconstruir y verificar los pesos en entornos controlados.

## Benchmarks y rendimiento

Los datos proceden de la ejecución de congelación `rel-final-43c9` de Talus (commit `43c94474c43d`, 2026-10-28), comparando contra la referencia CPU de llama.cpp con UD-IQ4_XS.

| Prueba | Resultado | Umbral |
|---|---|---|
| KL corto (media) | 0,00215 | <= 0,00291 |
| KL corto (mediana) | 0,00011 | No disponible |
| KL corto (p99) | 0,0184 | No disponible |
| Top-1 corto | 97,92 % | No disponible |
| KL Q4_K_XL (media) | 0,00358 | No disponible |
| Top-1 Q4_K_XL | 98,09 % | No disponible |
| KL 4K (media) | 0,004364 | Ratio <= 1,35 |
| Ratio KL 4K frente a exacto | 1,000 | <= 1,35 |
| Top-1 4K frente a CPU | 96,88 % | No disponible |
| Needle in a haystack 60K | 15/15 | No disponible |
| Suite de coding agéntico | 5/5 | No disponible |
| Velocidad de prompt pp2k | 443 tok/s | No disponible |
| Velocidad de prompt pp32k | 416 tok/s | No disponible |

La variante `.fast.w4i` supera el umbral de ratio KL a 4K y queda restringida a uso opt-in. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: AMD Strix Halo con arquitectura gfx1151; la ruta W4A4 depende de `v_wmma_i32_16x16x16_iu4`, por lo que no es portable a otras GPU sin recompilación.
- VRAM: no disponible de forma explícita; el repositorio ocupa 10,7 GB y debe residir junto al GGUF `Qwen3.8-27B-UD-IQ4_XS.gguf` en el mismo directorio.
- No cabe plantearse su uso en GPU consumer NVIDIA (RTX 4090, etc.) ni en A100/H100: el sidecar está atado a Talus y a gfx1151.
- Despliegue: exclusivamente mediante Talus (`talus-tui` o variable `TALUS_Q27_W4I`); no es compatible con vLLM, llama.cpp, Ollama ni TGI como pesos independientes.
- Latencia y throughput: 443 tok/s en pp2k y 416 tok/s en pp32k según la model card; no se publican cifras de decodificación.
- Almacenamiento: se requieren los 10,7 GB del sidecar más el GGUF base completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-W4A4-prompt (este) | No disponible (base 27B) | No disponible | `.w4i` + GGUF | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen3.8-27B-UD-IQ4_XS (unsloth) | 27B (denominación) | No disponible | GGUF | Apache-2.0 (según base) | HuggingFace |
| Ruta int8 exacta de Talus | 27B (denominación) | No disponible | GGUF | Apache-2.0 | Integrada en Talus |
| Variante `fast.w4i` | No disponible | No disponible | `.w4i` | Apache-2.0 | HuggingFace, falla puerta KL 4K |

No se dispone de datos de benchmarks estándar para comparar rendimiento cognitivo con alternativas; la comparación disponible es exclusivamente de velocidad de prompt y divergencia KL.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el GGUF exacto `Qwen3.8-27B-UD-IQ4_XS.gguf` los ficheros no sirven para nada.
- Dependencia dura de Talus y de AMD gfx1151; no hay soporte para otros motores ni otras GPU.
- La variante `fast.w4i` falla la puerta de calidad a 4K y no debería usarse en producción sin validación propia.
- Sesgos y alucinaciones: no evaluados en esta ficha; heredados del modelo base Qwen3.8-27B, sobre el que no hay información publicada aquí.
- Idiomas: no disponibles en los metadatos; la cobertura multilingüe dependerá del modelo base.
- Licencia Apache-2.0 para los pesos y MIT para los scripts; el uso comercial exige cumplir también las condiciones del GGUF de origen.
- Reproducibilidad: los bytes de los pesos dependen del punto flotante del forward de CPU y de numpy, aunque los identificadores de calibración son reproducibles.
- Sin descargas ni likes en el momento de la consulta: ecosistema muy incipiente y sin validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/j2ipper/Qwen3.8-27B-W4A4-prompt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio de Talus: https://github.com/nsbradley88/talus-public
- Documentación de modelos de Talus: `docs/MODELS.md` en el repositorio
- Metodología: https://github.com/nsbradley88/talus-public/blob/main/docs/METHODOLOGY.md
- Resultados: https://github.com/nsbradley88/talus-public/blob/main/docs/RESULTS.md
