# ankit373/qwen3.5-0.8b-langconf-edit-mix21

## Resumen

`ankit373/qwen3.5-0.8b-langconf-edit-mix21` no es un modelo completo, sino un *weight diff* estático para `Qwen/Qwen3.5-0.8B`. El autor lo publica como un parche de pesos que se aplica sobre la revisión `2fc06364715b967f1860aea9cf38778875588b17` del modelo base. No hubo entrenamiento: la edición se localizó mediante un proceso de edición ciega de pesos asistido por un modelo editor (Claude Opus 5.5) y verificado numéricamente por el autor humano.

El objetivo es reducir los fallos de confusión lingüística (*language confusion*), un fenómeno en el que un prompt en inglés que solicita respuesta en otro idioma acaba respondiendo en inglés. La edición modifica seis tensores de las capas 21, 22 y 23 del transformer, añadiendo una perturbación de rango 13 alineada con los centroides por idioma del *residual stream*, de modo que la información de idioma destino pesa más en la salida de esas capas.

El modelo base es un transformer de 0,8 mil millones de parámetros con atención lineal en algunas capas (`linear_attn`), licencia Apache 2.0 y soporte para 15 idiomas. Este diff es relevante como ejemplo reproducible de edición de pesos interpretable y de bajo coste: un parche de 16,7 millones de entradas que mejora métricas de consistencia lingüística sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal en capas 21 y 22 (`linear_attn`) y atencion estandar en capa 23 (`self_attn`); modelo base Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones (modelo base); el diff modifica 16.686.766 entradas en 6 tensores |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el diff se almacena en bf16; el modelo base admite las cuantizaciones habituales de Qwen3.5-0.8B, no detalladas en la informacion) |
| Idiomas soportados | en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `diff.safetensors` (valores editados completos de los 6 tensores, no deltas) + `manifest.json` con hashes SHA-256 base y editado |

## Arquitectura y entrenamiento

El artefacto es un diff de pesos, no un modelo entrenado. La edición actúa sobre seis tensores: `model.layers.{21,22}.linear_attn.out_proj.weight`, `model.layers.23.self_attn.o_proj.weight` y `model.layers.{21,22,23}.mlp.down_proj.weight`. Cada uno se actualiza con la regla W ← W + b·Q·Qᵀ·W, donde Q es una base ortonormal de 13 dimensiones del *residual stream* tras la capa correspondiente, construida a partir de los 14 centroides por idioma de la última posición del prompt en filas de desarrollo que el modelo base resolvió correctamente. El coeficiente b es 0,75 para las capas 21 y 22 y 0,5 para la capa 23.

La norma de Frobenius total del delta es 3,474 y cada cambio es una suma densa de rango 13 almacenada en bf16. No hay datos de preentrenamiento, RLHF ni DPO asociados a este artefacto; el modelo base Qwen3.5-0.8B no detalla su composición de dataset en la información disponible. La innovación técnica es el método de edición: los autores parten de la hipótesis de que las últimas capas ya codifican el idioma destino aunque la generación salga en inglés, y amplifican esa señal en lugar de reentrenar.

## Capacidades

- Generación de texto multilingüe en 15 idiomas (en, ar, de, es, fr, hi, id, it, ja, ko, pt, ru, tr, vi, zh).
- Reducción de fallos de confusión lingüística: respuestas en el idioma solicitado ante prompts en inglés.
- Mejora de la tasa de respuestas correctas en el idioma objetivo (LPR) en prompts complejos y en los conjuntos okapi y sharegpt.
- Hereda las capacidades del modelo base Qwen3.5-0.8B (razonamiento, código, matemáticas), aunque no se detallan en la información disponible.
- Compatible con plantilla de chat *non-thinking*; los resultados publicados usan temperatura 0,3, top_p 0,75, top_k 20 y máximo 100 tokens nuevos en bf16.
- No se documenta soporte específico de *tool calling*, agentes, visión o audio para este artefacto.

## Casos de uso

- Asistentes multilingües con interfaz en inglés: el parche corrige el caso en que el usuario pide respuesta en español, francés o japonés y el modelo contesta en inglés, mejorando la LPR global de 83,5 a 92,2 en el benchmark LCB.
- Chatbots de atención al cliente en mercados con varios idiomas: al reducir la confusión lingüística en prompts complejos (LPR de 62,9 a 82,8), disminuye la necesidad de reformular la petición de idioma en conversaciones multi-turno.
- Evaluación de técnicas de edición de pesos: sirve como referencia reproducible (hashes, manifiesto y script de aplicación) para investigadores que comparan edición de pesos frente a *steering* o instrucciones en el prompt.
- Despliegue en hardware modesto: al tratarse de un modelo de 0,8 B, puede ejecutarse en GPU de consumo y en CPU con cuantización del modelo base, aplicando el diff antes de cuantizar.
- Traducción y localización asistida: mejora la consistencia del idioma de salida en pipelines que piden explícitamente un idioma destino distinto del inglés.
- Investigación sobre representaciones internas de idioma: los seis tensores editados y la base de rango 13 permiten analizar cómo se codifica el idioma en las capas finales del *residual stream*.

## Benchmarks y rendimiento

Resultados en el Language Confusion Benchmark (LCB, Marchisio et al., arXiv:2406.20052), 2.100 prompts cross-lingual reservados, 714 complejos, una semilla de muestreo:

| Metrica | Base | Este edit | Edit aleatorio (seed 1002) |
|---|---|---|---|
| LPR en prompts complejos | 62,9 | 82,8 | 62,4 |
| Fallos completos en complejos (%) | 28,5 | 10,3 | 27,9 |
| LPR global | 83,5 | 92,2 | 83,2 |
| LPR okapi | 96,4 | 98,5 | 95,3 |
| LPR sharegpt | 91,3 | 95,4 | 92,0 |
| Bucles (%) | 3,95 | 4,76 | 3,71 |

Diferencias pareadas en puntos (bootstrap por conglomerados al 95 %, 10.000 remuestreos):

| Este edit menos | LPR complejos | LPR global | LPR complejos (no puntuados como fallo) |
|---|---|---|---|
| Modelo base | +19,9 [+11,7, +28,6] | +8,7 [+5,9, +11,9] | +20,2 [+12,6, +28,4] |
| Su edit aleatorio | +20,4 [+12,5, +28,7] | +9,0 [+6,1, +12,1] | +20,4 [+12,7, +28,6] |
| Instrucción al final del prompt | +5,2 [-3,3, +12,2] | +2,6 [-0,4, +5,2] | +6,2 [-1,4, +12,6] |
| ReCoVeR alpha 0,03 | -12,0 [-20,3, -4,9] | -3,5 [-6,4, -1,0] | -8,3 [-15,4, -1,8] |

Referencias del mismo estudio: instrucción al final del prompt alcanzó 77,6 en LPR de complejos y 89,7 global; ReCoVeR con alpha 0,03 alcanzó 94,8 y 95,7; la primera edición ciega (c02) alcanzó 93,0 y 96,1.

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,8 B ocupa aproximadamente 1,6 GB en bf16; el diff añade el almacenamiento de los seis tensores editados en bf16, un tamaño reducido frente al total del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; el modelo base cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más; en CPU también es viable con cuantización.
- Opciones de despliegue: el autor documenta la aplicación con `transformers` 5.22.1 y `torch` 2.15.0 mediante un script que carga el modelo base, verifica hashes y copia los tensores editados. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI para el diff; sería necesario aplicar el parche y guardar el modelo resultante antes de convertirlo a GGUF u otros formatos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este edit (Qwen3.5-0.8B + diff) | 0,8 B | no disponible | Edición de pesos para confusión lingüística | Apache 2.0 | Hugging Face (diff) |
| Qwen3.5-0.8B base | 0,8 B | no disponible | Modelo multilingüe sin parche | Apache 2.0 | Hugging Face |
| ReCoVeR (steering, alpha 0,03) | 0,8 B (sobre el mismo base) | no disponible | Steering en activaciones | no disponible | No disponible como artefacto en la información |
| Instrucción al final del prompt | 0,8 B (mismo base) | no disponible | Prompt engineering | no disponible | No aplica |

En LPR de prompts complejos, el orden es ReCoVeR (94,8) > edición c02 (93,0) > este edit (82,8) > instrucción al final (77,6) > base (62,9). Este edit supera al base y a su edición aleatoria de forma significativa, pero queda por debajo de ReCoVeR y no se distingue estadísticamente de mover la instrucción al final del prompt.

## Limitaciones y advertencias

- No es un modelo completo: requiere el modelo base en la revisión exacta `2fc06364715b967f1860aea9cf38778875588b17`; una revisión distinta puede invalidar los hashes y la aplicación.
- El diff almacena los valores editados completos de seis tensores, no deltas; el script de aplicación verifica SHA-256 antes y después de copiar.
- Aumenta la tasa de bucles del 3,95 % al 4,76 % en el benchmark, según la tabla de resultados.
- No se distingue estadísticamente de la instrucción al final del prompt (+5,2 con intervalo que cruza cero en LPR de complejos), por lo que parte de la mejora podría obtenerse con prompt engineering.
- Queda claramente por debajo de ReCoVeR alpha 0,03 en LPR de complejos (-12,0 puntos) y global (-3,5 puntos).
- Los resultados provienen de una sola semilla de muestreo y de una evaluación con configuración fija (temperatura 0,3, top_p 0,75, top_k 20, 100 tokens nuevos); no se documenta robustez ante otros ajustes.
- No se detallan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto o idioma específicas del parche; hereda los del modelo base, no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben cumplir también sus propias condiciones.
- El proceso de edición fue asistido por un modelo editor (Claude Opus 5.5) en modo ciego; el autor verificó los números, pero no se documenta una replicación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ankit373/qwen3.5-0.8b-langconf-edit-mix21
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper del benchmark LCB: https://arxiv.org/abs/2406.20052
- Repositorio del benchmark LCB: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
