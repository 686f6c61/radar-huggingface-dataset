# dendriteholdings/Ingot-XXIV-27B-Q2

## Resumen

Ingot-XXIV-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subnet de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador corona la copia que se mantiene más próxima a él. El modelo parte de Ternary Bonsai 2 27B de Prism ML y aplica un refinamiento de sus pesos no ternarios para acercarlos a Qwen3.8-27B, conservando los códigos ternarios originales.

La relevancia del modelo es doble: por un lado demuestra un pipeline de cuantización competitiva (ternaria, ~1,75-2,125 bits por peso) que reduce un modelo de 27B a ficheros de entre 5,95 y 7,21 GB; por otro, documenta métricas de fidelidad respecto al profesor (KL de 0,08276 y distancia de estados ocultos de 0,3115), lo que permite evaluar objetivamente la degradación introducida por la cuantización extrema.

Se distribuye exclusivamente en formato GGUF y requiere un fork específico de llama.cpp (DendriteLabs) que implementa la rotación Hadamard y la actualización de estado de atención lineal propias de esta familia. No es un modelo utilizable con llama.cpp estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación Hadamard (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 (1,75 bpw) y PQ2_0 (2,125 bpw, mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Ingot-XXIV-27B-PTQ1_0.gguf`, `Ingot-XXIV-27B-PQ2_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del profesor Ternary Bonsai 2 27B de Prism ML, que emplea una arquitectura transformer con atención lineal y una rotación Hadamard aplicada en el pipeline de cuantización. Los pesos ternarios (códigos de -1, 0, +1 con escala fp16 por bloque de 128 pesos) provienen íntegramente de Bonsai 2; el minero reajustó únicamente los pesos restantes (escalas y componentes no ternarios) para minimizar la divergencia respecto a Qwen3.8-27B, que actúa como profesor de referencia en la evaluación de la subnet.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La innovación técnica destacable es el propio esquema de cuantización ternaria con repack lossless: el fichero PTQ1_0 conserva los códigos y escalas fp16 de cada bloque de 128 pesos de forma que cada peso decodifica al mismo valor que en el fichero PQ2_0, y el repack equivalente sobre Bonsai 2 reproduce byte a byte el fichero PTQ1_0 publicado por Prism. Adicionalmente, la familia cuenta con un drafter de decodificación especulativa (DFlash 2, `dendriteholdings/Ingot-27B-DFlash2`) que acelera la generación.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones heredados del profesor Bonsai 2 y del ajuste hacia Qwen3.8-27B.
- Capacidad multimodal opcional: admite entrada de imágenes si se le añade el tower de visión `Ternary-Bonsai-2-27B-mmproj` de Prism ML como proyector (calidad no evaluada).
- Decodificación especulativa mediante el drafter DFlash 2, con ~1,8x de aceleración en modo greedy y ~1,3-1,4x con sampling.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servidor.
- Soporte de plantilla de chat vía `--jinja` en llama-server.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware con VRAM limitada: con 5,95-7,21 GB de pesos, el modelo cabe en GPUs de consumo de 8-12 GB (por ejemplo, RTX 4060 Ti 16 GB o RTX 4070), lo que permite servir un modelo de 27B en equipos de gama media.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar la degradación de un modelo de 27B a ~1,75-2,125 bpw, con métricas de KL y distancia de estados ocultos publicadas frente al profesor.
- Evaluación de pipelines de Bittensor/Ingot: útil para replicar la metodología de la subnet, comparar submissions y validar el repack lossless entre formatos PQ2_0 y PTQ1_0.
- Chat conversacional de un solo flujo en estaciones de trabajo Apple Silicon: en un Mac Studio M3 Ultra alcanza 44,5-56,4 tok/s de decodificación según build, suficiente para asistentes interactivos locales.
- Servicio de inferencia de alto throughput en GPU profesional: en una RTX PRO 6000 Blackwell logra 137-145 tok/s de decodificación y ~3.865 tok/s de prompt, adecuado para backends con concurrencia moderada.
- Prototipado de aplicaciones con entrada de imagen: añadiendo el proyector mmproj de Bonsai 2 se puede experimentar con prompts visuales, asumiendo que la calidad no está validada por el autor.
- Aceleración de chat en producción: integrando el drafter DFlash 2 se reduce la latencia percibida en asistentes de un solo stream a cambio de ~6 GB adicionales de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta métricas de fidelidad respecto al profesor y de velocidad:

| Métrica | Este modelo | Rey al que superó |
|---|---|---|
| KL(profesor ‖ modelo) | 0,08276 | 0,08409 |
| Distancia de estados ocultos (media cada 8 capas) | 0,3115 | 0,3121 |

| Hardware | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB), llama-bench | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB), llama-bench | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (Metal) | PTQ1_0 | 52,8 | 368 |

Prism ML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090 (no medido por el autor de este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: ~6 GB para PTQ1_0 y ~7,3 GB para PQ2_0 solo en pesos; añadir overhead de contexto KV y buffers (típicamente 1-3 GB adicionales según longitud de contexto).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (medido), RTX 5090 (referencia de Prism ML para Bonsai 2), A100/H100 compatibles con el fork de llama.cpp (no medido).
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más (RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); también en Apple Silicon con Metal.
- Opciones de despliegue: exclusivamente el fork DendriteLabs de llama.cpp en el commit `c96baf4` (con `llama-server` y `--jinja`); llama.cpp estándar no ejecuta estos ficheros. No hay soporte documentado para vLLM, TGI u Ollama.
- Aceleración opcional: drafter DFlash 2 (`Ingot-27B-DFlash2-Q8_0.gguf`) con `--spec-type draft-dflash --spec-draft-n-max 5`, a cambio de ~6 GB extra de VRAM.
- Latencia y throughput: ver tabla de benchmarks; el fichero PTQ1_0 es más rápido en GPU y el PQ2_0 en Mac con el fork Dendrite.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXIV-27B-Q2 | 26,9B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | GGUF + fork Dendrite llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B | 27B (según nombre) | no disponible | Ternaria (PQ2_0, PTQ1_0) | no disponible | GGUF + fork PrismML llama.cpp |
| Qwen3.8-27B (profesor de referencia) | 27B (según nombre) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación objetiva publicada es la KL y la distancia de estados ocultos frente al profesor, donde Ingot-XXIV-27B-Q2 supera ligeramente al rey anterior de la subnet (0,08276 frente a 0,08409 de KL).

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor o revisar la licencia del modelo base (Ternary Bonsai 2) antes de desplegarlo en producción.
- Requiere un fork no estándar de llama.cpp (DendriteLabs, commit `c96baf4`); no funciona con llama.cpp upstream, lo que complica el mantenimiento y la integración con tooling estándar.
- La cuantización ternaria a ~1,75 bpw introduce degradación medible respecto al profesor (KL 0,08276, distancia de estados ocultos 0,3115); no es adecuado para tareas que exijan fidelidad máxima al modelo original.
- La capacidad de visión es experimental: el proyector mmproj fue creado para Ingot-genesis y no para estos pesos; el autor declara que la calidad de imagen no está evaluada.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés sin evaluación previa.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor; al ser un fine-tune de un modelo ternario, los sesgos del profesor Bonsai 2 y de Qwen3.8-27B pueden propagarse.
- Longitud de contexto no disponible: no se puede planificar su uso en escenarios de contexto largo sin medirla empíricamente.
- El modelo se distribuye como espejo de una submission de minería; no hay garantía de soporte, actualizaciones ni mantenimiento por parte del autor.
- Los benchmarks publicados son de fidelidad al profesor y de velocidad, no de calidad en tareas downstream; no hay datos de MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-XXIV-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de visión (Q8_0): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de visión (BF16): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter de decodificación especulativa: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo genesis de la familia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp (DendriteLabs): https://github.com/DendriteLabs/llama.cpp
- Commit del fork usado en la evaluación: https://github.com/DendriteLabs/llama.cpp/commit/c96baf4abe24d11a50f326e40b6223b687449d63
