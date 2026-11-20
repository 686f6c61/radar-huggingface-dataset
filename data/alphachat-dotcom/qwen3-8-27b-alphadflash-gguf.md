# AlphaChat-dotcom/Qwen3.8-27B-AlphaDflash-GGUF

## Resumen

AlphaDflash 27B es una cabeza de predicción multi-token (MTP, multi-token prediction) reentrenada para el modelo Qwen3.8-27B, publicada por AlphaChat-dotcom como sidecar en formato GGUF. No es un modelo completo: es un fichero de 15 tensores (el bloque `blk.64.*`) que AlphaLlama 2.0.10 o superior inyecta en el GGUF de Qwen3.8-27B en tiempo de carga, sustituyendo la cabeza MTP original del modelo. El fichero base permanece inalterado.

El propósito es puramente de velocidad de decodificación especulativa. Los borradores generados por la cabeza MTP siempre se verifican contra el modelo completo, por lo que la cabeza no altera las respuestas del modelo, solo el ritmo al que se producen. AlphaChat reentrenó el bloque MTP sobre texto generado por el propio Qwen3.8-27B (mayoritariamente en inglés) para que sus borradores coincidan más a menudo con los siguientes tokens reales del modelo.

El artefacto es relevante para quienes ya sirven Qwen3.8-27B en GGUF con AlphaLlama sobre GPU NVIDIA y quieren acelerar la decodificación sin cambiar de modelo ni de cuantización. El repo ocupa 0,4 GB y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de predicción multi-token (MTP) para transformer denso Qwen3.8-27B; 15 tensores del bloque `blk.64.*` |
| Parametros totales | 424.699.392 (cabeza MTP); el modelo base Qwen3.8-27B no reporta su recuento en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | No propia; depende del modelo base. En RTX 3090/5090, AlphaLlama usa por defecto 2 x 98.304 tokens con esta cabeza (frente a 2 x 131.072 sin ella); configurable con `-c` |
| Tipos de cuantizacion | Mismos tipos de tensor que `Qwen3.8-27B-UD-Q4_K_M.gguf`; fichero GGUF de 351 MB |
| Idiomas soportados | No declarados; el entrenamiento de la cabeza es mayoritariamente en inglés, por lo que prompts en otros idiomas obtienen menos ganancia |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`alphadflash-27b-head.gguf`, 351.009.888 bytes, SHA-256 `33e6a004...a814350`) |

## Arquitectura y entrenamiento

La cabeza MTP es un bloque adicional de predicción multi-token que se acopla al transformer denso Qwen3.8-27B. Consta de 15 tensores que ocupan el bloque `blk.64.*` del grafo del modelo y se cargan en lugar de los tensores homónimos del GGUF base cuando AlphaLlama detecta el sidecar. En la RTX 3090/5090, el modo rápido por defecto pasa a generar borradores de 7 tokens de profundidad (antes 3) con contexto de 2 x 98.304; en tarjetas de 16-20 GB donde AlphaLlama aplica su propio ajuste de drafting, la cabeza se carga pero se mantiene ese ajuste.

El entrenamiento consistió en un fine-tuning del bloque MTP sobre texto generado por el propio Qwen3.8-27B, de modo que los borradores se alinean con la distribución de siguientes tokens del modelo. El resto de pesos del modelo no se toca. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La verificación de los borradores contra el modelo completo garantiza que, con `--decode-mode exact`, la salida sea idéntica a la decodificación plana (25 de 25 prompts verificados).

## Capacidades

- Aceleración de decodificación especulativa sobre Qwen3.8-27B en AlphaLlama 2.0.10 o superior con GPU NVIDIA.
- Generación de borradores MTP de hasta 7 tokens de profundidad en el modo rápido por defecto en RTX 3090/5090.
- Verificación completa de cada borrador por el modelo base, sin alteración de las respuestas.
- Modo exacto (`--decode-mode exact`) que reproduce bit a bit la salida de la decodificación plana.
- Ganancia mayor en prompts en inglés; menor en otros idiomas por el sesgo del corpus de entrenamiento.
- No aporta capacidades nuevas de razonamiento, código, matemáticas, visión, tool calling o agentes: todas ellas dependen íntegramente de Qwen3.8-27B.
- No modifica el comportamiento del modo de velocidad (`ALPHA_SPEED_MODE=1` con el drafter DFlash2), que queda igual dentro del 1%.

## Casos de uso

- Servicio de inferencia de Qwen3.8-27B en producción con AlphaLlama: sustituir la cabeza MTP por defecto para elevar el throughput de decodificación entre un 20% y un 60% según el conjunto de prompts, sin reentrenar ni recuantizar el modelo.
- Despliegue en una única RTX 3090 o 5090: usar la cabeza para pasar de 3 a 7 tokens de borrador por paso y compensar la reducción de contexto por defecto a 2 x 98.304 tokens.
- Evaluación comparativa de técnicas de decodificación especulativa: el par de tablas de calidad y velocidad permite medir el coste en precisión (GSM8K -0,15 pt, MMLU y CMMLU sin cambio) frente a la ganancia en tok/s.
- Pipelines que requieren reproducibilidad exacta: activar `--decode-mode exact` con esta cabeza para obtener texto idéntico a la decodificación plana manteniendo la infraestructura de AlphaLlama.
- Cargas de trabajo centradas en inglés: aprovechar al máximo el reentrenamiento de la cabeza, que fue ajustada sobre texto generado en inglés por el propio modelo.
- Ajuste fino de la ventana de contexto: usar el parámetro `-c` de AlphaLlama para recuperar contexto más allá de los 2 x 98.304 tokens por defecto cuando la tarea lo exija, aceptando el coste de velocidad correspondiente.

## Benchmarks y rendimiento

Calidad (RTX 3090, temperatura 0, thinking desactivado; comparación pareada contra decodificación plana del mismo modelo y mismos prompts):

| Benchmark | Decodificación plana | Con esta cabeza, 7 de profundidad |
|---|---|---|
| GSM8K (CoT, extracción flexible) | 96,06% | 95,91% (-0,15 pt; IC 95% -0,75 a +0,44) |
| MMLU (generativo) | 83,79% | 83,79% |
| CMMLU (generativo) | 81,34% | 81,34% |
| HumanEval | 156 / 164 | 158 / 164 |

Velocidad (RTX 3090, AlphaLlama 2.0.10 candidato, conjuntos A / V / R, 25 prompts x 2 pasadas, tok/s de decodificación, media geométrica por conjunto):

| Configuración | A | V | R |
|---|---|---|---|
| Modo rápido por defecto, cabeza propia del modelo | 104,2 | 109,6 | 122,2 |
| Modo rápido por defecto, esta cabeza | 124,8 | 147,2 | 195,3 |
| Ganancia | +20% | +34% | +60% |

## Requisitos de hardware

- VRAM: el sidecar añade 351 MB (334,8 MiB en 15 tensores) sobre el GGUF de Qwen3.8-27B; el requisito dominante es el del modelo base cuantizado, no la cabeza.
- GPU recomendadas: RTX 3090 y RTX 5090 son las plataformas de referencia de las mediciones; se requiere GPU NVIDIA y AlphaLlama 2.0.10 o superior.
- En tarjetas de 16-20 GB, AlphaLlama mantiene su propio ajuste de drafting aunque cargue la cabeza.
- Despliegue: exclusivamente mediante AlphaLlama (`alphallama-serve -m Qwen3.8-27B-UD-Q4_K_M.gguf`), con el sidecar colocado junto al GGUF, en una carpeta hermana `Qwen3.8-27B-AlphaDflash/` o referenciado con `ALPHA_AI_MTP_HEAD=/ruta/al/fichero`.
- Verificación de carga en el log de arranque: `[auto] MTP head: AlphaDflash 27B MTP head <path>, depth 7` y `[ai] MTP head sidecar <path>: 15 tensors (334.8 MiB) replace the model's`.
- Throughput medido en RTX 3090: 124,8 a 195,3 tok/s según el conjunto de prompts, frente a 104,2 a 122,2 tok/s con la cabeza original.
- No se documentan requisitos para vLLM, llama.cpp, Ollama o TGI; la información disponible solo cubre AlphaLlama.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlphaChat-dotcom/Qwen3.8-27B-AlphaDflash-GGUF | Cabeza MTP sidecar GGUF | 424,7 M (15 tensores) | Depende del base; por defecto 2 x 98.304 en RTX 3090/5090 | Apache-2.0 | Hugging Face; 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B | Modelo base denso | No disponible en la información | No disponible | Apache-2.0 | Hugging Face |
| unsloth/Qwen3.8-27B-GGUF (UD-Q4_K_M) | Cuantización GGUF del base | No disponible | No disponible | Apache-2.0 (heredada) | Hugging Face |
| Cabeza MTP original de Qwen3.8-27B | Cabeza MTP incluida en el GGUF | No disponible | 2 x 131.072 por defecto en RTX 3090/5090 | Apache-2.0 | Incluida en el GGUF base |

No se dispone de datos de otros sidecars MTP comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen3.8-27B en GGUF y AlphaLlama 2.0.10+ con GPU NVIDIA no tiene utilidad.
- Solo acelera la decodificación; no mejora la calidad ni añade capacidades al modelo base.
- El reentrenamiento se hizo sobre texto mayoritariamente en inglés: los prompts en otros idiomas obtienen ganancias menores.
- En RTX 3090/5090, el modo rápido por defecto reduce el contexto de 2 x 131.072 a 2 x 98.304 tokens; hay que pasar `-c` para recuperar la ventana completa.
- El modo de velocidad (`ALPHA_SPEED_MODE=1` con DFlash2) no se beneficia de esta cabeza (variación dentro del 1%).
- En tarjetas de 16-20 GB, AlphaLlama conserva su propio ajuste de drafting, por lo que la ganancia puede no materializarse.
- Riesgo de alucinación y sesgos: los del modelo base Qwen3.8-27B; la cabeza no los altera, pero tampoco los mitiga.
- Licencia Apache-2.0 heredada del base; conviene revisar el fichero `LICENSE` del repo y las condiciones del modelo base para uso comercial.
- Repo sin descargas ni likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlphaChat-dotcom/Qwen3.8-27B-AlphaDflash-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de referencia para el base: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
