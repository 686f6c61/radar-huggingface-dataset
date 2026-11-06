# bouroo/Qwopus3.8-27B-Coder-Flash-MTP-mxfp4

## Resumen

`bouroo/Qwopus3.8-27B-Coder-Flash-MTP-mxfp4` no es un modelo de lenguaje autónomo, sino el cabezal de predicción multi-token (Multi-Token Prediction, MTP) del fine-tune `Jackrong/Qwopus3.8-27B-Coder-Flash`, convertido a MXFP4 (4 bits, grupo de 32) para su uso como modelo borrador en decodificación especulativa sobre Apple Silicon. Lo publica el usuario `bouroo` dentro del ecosistema MLX y depende de un modelo objetivo emparejado (`bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4`) que aporta los embeddings de tokens y la cabeza del modelo de lenguaje.

El artefacto contiene únicamente los pesos `mtp.*`: una proyección `fc`, una capa decodificadora y las normas compartidas, con un total de 424.699.392 parámetros y un repositorio de 0,2 GB. Su relevancia es práctica: permite acelerar la generación del modelo objetivo de 27B en hardware Apple mediante decodificación especulativa con bloques de tamaño 3, con una tasa medida de 2,78 tokens aceptados por ronda y un 89,5 % de tokens borrador aceptados en un M4 Pro.

La ficha describe, por tanto, un componente de inferencia y no un modelo generativo completo. Cualquier evaluación de capacidades (razonamiento, código, matemáticas, multilingüismo) corresponde al modelo objetivo, no a este repositorio, que solo reproduce el comportamiento del borrador MTP del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de predicción multi-token (MTP); `model_type: qwen3_5_mtp`, derivado de Qwen3.5/Qwen3.8 |
| Parametros totales | 424.699.392 (solo el borrador MTP: `fc`, una capa decodificadora y normas compartidas) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la define el modelo objetivo; `text_config` heredado del objetivo) |
| Tipos de cuantizacion | MXFP4: 4 bits, códigos E2M1, tamaño de grupo 32, una escala uint8 potencia de dos por grupo; pesos de norma almacenados como `1 + w` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del checkpoint original) |
| Formato de pesos | safetensors (`model.safetensors`), librería `mlx`; tokenizador en `tokenizer.json` / `tokenizer_config.json` copiado del objetivo |
| Tamano del repositorio | 0,2 GB (235 MB el archivo de pesos) |
| Modelo base | Jackrong/Qwopus3.8-27B-Coder-Flash (relación: quantized) |
| Modelo objetivo requerido | bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4 |
| Tamaño de bloque especulativo | 3 (por defecto, `block_size: 3` en `config.json`) |
| Librería de inferencia | mlx-vlm (detección automática de `--draft-kind` a partir de `model_type`) |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una conversión de cuantización del cabezal MTP del fine-tune `Jackrong/Qwopus3.8-27B-Coder-Flash`. La arquitectura del borrador se compone de una proyección `fc`, una única capa decodificadora con atención y MLP, y las normas compartidas con el modelo objetivo, bajo el tipo `qwen3_5_mtp`. El `config.json` incluye el `text_config` del modelo objetivo y los parámetros de cuantización MXFP4. Los pesos bidimensionales (la proyección `fc` y las proyecciones de atención y MLP de la capa) se almacenan en MXFP4 con códigos E2M1, grupo de 32 y una escala uint8 de potencia de dos por grupo; las normas se guardan como `1 + w` para coincidir con `Qwen3_5RMSNorm` de transformers y el pase de saneado del cargador las deja intactas.

El diseño sigue el esquema de decodificación especulativa por bloques: el borrador propone un bloque de tokens (por defecto 3) y el modelo objetivo los verifica en paralelo, aceptando el prefijo correcto. La conversión se realizó con las convenciones de cuantización de `mlx_vlm`, procesando el checkpoint BF16 de 56 GB fragmento a fragmento para no materializarlo entero en memoria. El layout replica el de `mlx-community/Qwen3.8-27B-MTP-mxfp4`, el borrador MXFP4 del Qwen3.8-27B base. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO del modelo original en la información proporcionada.

## Capacidades

- No genera texto de forma autónoma: actúa exclusivamente como modelo borrador dentro de un pipeline de decodificación especulativa junto al objetivo `bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4`.
- Propone bloques de tokens candidatos (tamaño de bloque 3 por defecto) que el modelo objetivo verifica y acepta parcial o totalmente.
- Acelera la inferencia del objetivo de 27B en Apple Silicon mediante MLX, con una tasa medida de 2,78 tokens aceptados por ronda y un 89,5 % de tokens borrador aceptados en un M4 Pro.
- Integración con `mlx-vlm` mediante `--draft-model`; el tipo de borrador se autodetecta a partir de `model_type: qwen3_5_mtp`.
- Compatible con el modo de razonamiento del objetivo (`--enable-thinking` en el ejemplo de uso).
- Capacidades de código, razonamiento, matemáticas, tool calling, agentes o multilingüismo: no disponibles en este repositorio; dependen del modelo objetivo y de la model card del fine-tune original.

## Casos de uso

- Aceleración de generación de código en local sobre Mac: usar el borrador junto al objetivo de 27B en `mlx_vlm.generate` para tareas como escribir una función Python con tests, reduciendo el número de pasos de decodificación del modelo grande gracias a la verificación por bloques.
- Asistentes de programación en estación de trabajo Apple: desplegar el par objetivo + borrador en un flujo de autocompletado o chat de código, donde la latencia por token es crítica y la decodificación especulativa aporta ganancias medibles (2,78 tokens aceptados por ronda).
- Prototipado de pipelines de inferencia especulativa: servir como referencia reproducible para validar configuraciones de `block_size`, tasas de aceptación y overhead de verificación en MLX antes de trasladar el diseño a otros entornos.
- Evaluación comparativa de borradores MTP: contrastar este MXFP4 con el borrador de `mlx-community/Qwen3.8-27B-MTP-mxfp4` (mismo layout) para medir el impacto de la cuantización del borrador en la tasa de aceptación.
- Inferencia con modo de razonamiento en hardware de consumo: ejecutar el objetivo con `--enable-thinking` para tareas de análisis de código o explicación de algoritmos, apoyándose en el borrador para mantener la interactividad.
- Investigación sobre decodificación especulativa en Apple Silicon: recoger métricas de aceptación por ronda y throughput en distintos chips (M4 Pro y superiores) usando este repositorio como componente fijo del experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es la métrica de decodificación especulativa medida en un Apple M4 Pro:

| Metrica | Valor |
|---|---|
| Tokens aceptados por ronda | 2,78 |
| Tasa de aceptación de tokens borrador | 89,5 % |
| Tamaño de bloque por defecto | 3 |
| Hardware de medida | Apple M4 Pro |

## Requisitos de hardware

- VRAM/unified memory: el borrador ocupa 235 MB en MXFP4 (repositorio de 0,2 GB); el consumo principal lo determina el modelo objetivo de 27B cuantizado en MXFP4, cuyo peso en memoria no se detalla en la información disponible.
- Hardware objetivo: Apple Silicon con MLX (medido en M4 Pro); no está pensado para GPU NVIDIA ni ROCm en este repositorio.
- GPU consumer: sí, en equipos Apple con memoria unificada suficiente para alojar el objetivo de 27B en 4 bits; el borrador en sí es marginal en memoria.
- Despliegue: `mlx-vlm` (`mlx_vlm.generate` con `--model` y `--draft-model`); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI en este repositorio. Existe una variante separada del mismo autor, `bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT`, orientada a transformers, compressed-tensors, llm-compressor y vLLM sobre ROCm gfx1201, pero es un artefacto distinto.
- Latencia y throughput: no disponibles más allá de la tasa de aceptación (2,78 tokens/ronda, 89,5 %) en M4 Pro.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Contexto | Licencia | Entorno |
|---|---|---|---|---|---|---|
| bouroo/Qwopus3.8-27B-Coder-Flash-MTP-mxfp4 | Borrador MTP | 424,7 M | MXFP4 (4 bits, grupo 32) | no disponible | Apache-2.0 | MLX / Apple Silicon |
| mlx-community/Qwen3.8-27B-MTP-mxfp4 | Borrador MTP | no disponible | MXFP4 | no disponible | no disponible | MLX / Apple Silicon |
| bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT | Modelo cuantizado completo (objetivo) | no disponible | MXFP4 con compressed-tensors | no disponible | Apache-2.0 | Transformers / vLLM / ROCm |
| bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4 | Modelo objetivo completo | no disponible | MXFP4 | no disponible | Apache-2.0 | MLX / Apple Silicon |

La comparación relevante es frente al borrador de `mlx-community` para Qwen3.8-27B, cuyo layout se replica explícitamente; no se dispone de datos de rendimiento comparativos entre ambos.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo `bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4` no puede generar texto, ya que carece de embeddings de tokens y de cabeza de lenguaje.
- Solo contiene los pesos `mtp.*`; cargarlo como modelo principal en `mlx-vlm` o transformers producirá errores o resultados sin sentido.
- Dependencia estricta de la versión de `mlx-vlm` y del tipo `qwen3_5_mtp`; cambios en el cargador o en el pase de saneado de normas pueden romper la compatibilidad.
- La cuantización MXFP4 del borrador puede reducir la tasa de aceptación frente a un borrador en mayor precisión; no se aportan datos comparativos.
- Las limitaciones declaradas en la model card del checkpoint original (`Jackrong/Qwopus3.8-27B-Coder-Flash`) aplican al comportamiento del borrador.
- Licencia Apache-2.0 heredada, que permite uso comercial; sin embargo, la información disponible no detalla restricciones adicionales del fine-tune original más allá de las de la licencia.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni limitaciones de contexto de este artefacto concreto; deben consultarse en la documentación del modelo objetivo.
- El rendimiento medido corresponde a un único hardware (M4 Pro); no hay garantías de que la tasa de aceptación se mantenga en otros chips o cargas de trabajo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bouroo/Qwopus3.8-27B-Coder-Flash-MTP-mxfp4
- Modelo objetivo MLX: https://huggingface.co/bouroo/Qwopus3.8-27B-Coder-Flash-mxfp4
- Variante para transformers/vLLM/ROCm: https://huggingface.co/bouroo/Qwopus3.8-27B-Coder-Flash-MXFP4-CT
- Modelo base (fine-tune original): https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Borrador de referencia del Qwen3.8-27B base: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-mxfp4
