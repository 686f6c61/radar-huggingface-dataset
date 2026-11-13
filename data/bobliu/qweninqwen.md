# Bobliu/qweninqwen

## Resumen

QIQ (qweninqwen) es un artefacto de investigación publicado por el usuario Bobliu en Hugging Face. No se trata de un modelo conversacional al uso, sino de una demostración de interpretabilidad mecanicista: un token real de Qwen3-0.6B calculado por una CPU RISC-V (RV32IM con unidad de producto escalar vectorial) cuyos pesos están embebidos dentro de un Qwen3.5-4B modificado. El autor describe el resultado como "un token real de Qwen3-0.6B computado por una CPU RISC-V que vive dentro de los pesos de un Qwen3.5-4B modificado".

El checkpoint es el modelo "externo" de la ejecución: parte de Qwen3.5-4B, ensancha la dimensión oculta hasta 7680, añade 12 capas de "chip" (la CPU compilada en pesos mediante el proyecto Qwenputer), extiende el vocabulario hasta 680.128 tokens e incrusta una tabla de pesos de 168.684 filas en los parámetros de embedding, desde la que el firmware interno (un Qwen3-0.6B cuantizado a int4) obtiene sus pesos. El repositorio ocupa 40,2 GB en 15 shards safetensors en bf16.

Su relevancia es fundamentalmente metodológica: demuestra que es posible ejecutar un circuito computacional completo (fetch de pesos, cómputo y escritura de logits) dentro de los propios pesos de un transformer, con verificación de fidelidad contra la implementación de referencia de Hugging Face. El autor es explícito: "esto es un artefacto de investigación, no un modelo de chat", y la generación de texto ordinaria no es un objetivo ni se evalúa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 44 capas (12 capas de chip RISC-V + 32 capas Qwen), hidden size 7680, clase `Qwen3_5ForCausalLM` |
| Parametros totales | 19.996.416.256 (≈20,0 mil millones) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en bf16; el firmware interno usa Qwen3-0.6B en int4 más tres capas de mayor precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (15 shards, bf16, ~40 GB) + `config.json` + `chipformer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y lo modifica estructuralmente: la dimensión oculta se ensancha a 7680 y se añaden 12 capas de chip que implementan una CPU RV32IM con unidad de producto escalar vectorial, compilada directamente en los pesos mediante Qwenputer. El vocabulario se extiende a 680.128 tokens y los parámetros de embedding alojan una tabla de pesos de 168.684 filas. El firmware interno es un Qwen3-0.6B en int4 que obtiene sus pesos de esa tabla; el modelo externo ejecuta la traza del firmware token a token. El layout del circuito (slots, dimensiones de código, offsets de tokens de chip) está descrito en `chipformer.json`.

No se describe en la información disponible un proceso de entrenamiento convencional (número de tokens, composición del dataset, RLHF/DPO). El checkpoint publicado es el modelo fusionado y modificado usado en la ejecución, no un modelo entrenado desde cero. La innovación técnica destacable es precisamente la fusión de un intérprete de CPU dentro de los pesos y la verificación de fidelidad: sobre el chunk 0, con las clases estándar `Qwen3_5` de Hugging Face y argmax sobre el vocabulario completo de 680.128 tokens, se ejecutaron 130.000 pasos con 0 discrepancias; el control negativo (entradas de la tabla desplazadas una posición) falla en el paso 41.

## Capacidades

- Ejecución de una traza de firmware token a token: es el comportamiento útil declarado por el autor.
- Cómputo de un token real de Qwen3-0.6B mediante la CPU RISC-V embebida (prompt token 785 produce la palabra de circuito final 15846, idéntica a la de Qwen3-0.6B en fp32 y bf16).
- Verificación de integridad del circuito: 96 chunks, 96 de 96 limpios, 0 desajustes de tokens libres, 0 tokens forzados, 0 inyecciones del host, 95 de 95 uniones exactas y HALT propio del circuito en el paso 57.705 del chunk 95.
- Carga mediante las clases estándar de transformers (`Qwen3_5ForCausalLM`), lo que permite inspección con módulos de referencia.
- Generación de texto conversacional: no es un objetivo del modelo y no se evalúa.
- Tool calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad mecanicista: sirve para estudiar cómo se representa y ejecuta un circuito algorítmico dentro de los pesos de un transformer, usando los scripts de `experiments/circuit/fullrun/` para reproducir la traza completa.
- Auditoría de fidelidad de implementaciones: la comprobación con módulos estándar de Hugging Face y el control negativo permiten validar que una implementación propia reproduce exactamente el comportamiento de referencia.
- Reproducibilidad de experimentos: los ficheros de ejecución comprometidos (96 chunks, registro de uniones y HALT) permiten replicar el resultado con unas 12 GPU-horas según el autor.
- Docencia y divulgación técnica: el vídeo explicativo y los logs documentan paso a paso cómo un firmware int4 recupera pesos de una tabla embebida y produce logits.
- Estudio de cuantización extrema: el firmware int4 con tres capas de mayor precisión alcanza coseno 0,917 con los logits de Hugging Face, un caso concreto para analizar el impacto de la cuantización en la fidelidad de logits.
- Base para experimentos de "computación en pesos": el diseño de capas de chip y la tabla de pesos embebida pueden reutilizarse para probar otras arquitecturas de intérprete dentro del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son de fidelidad y ejecución del circuito, no de calidad de modelado:

| Metrica | Resultado |
|---|---|
| Chunks ejecutados | 96 de 96 limpios |
| Desajustes de tokens libres | 0 |
| Tokens forzados / inyecciones del host | 0 / 0 |
| Uniones exactas | 95 de 95 |
| Pasos en la comprobación con módulos estándar (chunk 0) | 130.000, 0 discrepancias |
| Control negativo (tabla desplazada) | falla en el paso 41 |
| Coseno de logits del firmware vs. Hugging Face | 0,917 (int4 + tres capas de mayor precisión) |
| Tiempo de ejecución completo | ~12 GPU-horas |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en bf16 ocupa unos 40 GB, por lo que se necesitan al menos 40-48 GB de VRAM para cargarlo sin cuantizar.
- GPU recomendadas para carga completa en bf16: A100 80 GB, H100 80 GB, o dos GPU de 24 GB con reparto de shards.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16 sin cuantización u offloading; no se dispone de datos sobre variantes cuantizadas del checkpoint publicado.
- Despliegue: carga mediante transformers con `Qwen3_5ForCausalLM.from_pretrained(..., torch_dtype="bfloat16")`; para reproducir el circuito se usan los scripts de `experiments/circuit/fullrun/` del repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; el único dato temporal es que la ejecución completa de los 96 chunks requirió aproximadamente 12 GPU-horas.

## Comparativa con modelos similares

No hay modelos directamente comparables: se trata de un artefacto de investigación, no de un modelo de propósito general. La comparación más informativa es con su modelo base y con el modelo interno:

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| qweninqwen (QIQ) | ~20,0 B | no disponible | Ejecutar un circuito RISC-V embebido; investigación | Apache-2.0 |
| Qwen3.5-4B (base) | no disponible | no disponible | Generación de texto general | Apache-2.0 |
| Qwen3-0.6B (interno) | no disponible | no disponible | Generación de texto general; firmware int4 en este experimento | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo de chat: el autor declara explícitamente que la generación de texto ordinaria no es un objetivo y no se evalúa; usarlo como modelo conversacional produciría resultados sin garantías.
- Alcance limitado: los resultados demostrados cubren un token de prompt y un token de salida; el host arranca el chunk 0 desde el ELF del firmware, itera tokens y une las costuras.
- Dependencia de la versión de transformers: la carga requiere una versión que incluya Qwen3.5; versiones anteriores no reconocerán la clase.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Idiomas: no disponibles; no hay declaración de cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero su naturaleza de investigación hace desaconsejable cualquier uso en producción como modelo generativo.
- Reproducibilidad: requiere los scripts del repositorio de GitHub y aproximadamente 12 GPU-horas para la ejecución completa; el checkpoint no re-subE los pesos de Qwen sin modificar, sino el modelo fusionado y modificado.
- Fidelidad del firmware: el coseno de 0,917 frente a Hugging Face indica que los logits del firmware no son idénticos a los de referencia, aunque el margen top-1 es amplio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bobliu/qweninqwen
- Repositorio de código, logs y vídeo: https://github.com/Bobliuuu/qweninqwen
- Vídeo explicativo: https://github.com/Bobliuuu/qweninqwen/blob/main/video/qweninqwen_explainer.mp4
- Proyecto Qwenputer: https://github.com/divagr18/qwenputer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
