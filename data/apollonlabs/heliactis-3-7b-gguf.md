# ApollonLabs/Heliactis-3-7B-GGUF

## Resumen

Heliactis-3-7B es un ajuste fino (fine-tune) del modelo abierto K2-Horizon-7B desarrollado por el Institute of Foundation Models (MBZUAI), publicado por Apollon Labs. El objetivo declarado del modelo es doble: mejorar la calidad del griego escrito y preservar la solidez en generacion de codigo. Se distribuye principalmente en formato GGUF para su uso con llama.cpp, aunque existe una version en safetensors de precision completa en un repositorio separado.

El modelo parte de una arquitectura denominada `k2-horizon` en llama.cpp, con aproximadamente 9.000 millones de parametros totales (8.999.178.240 segun los pesos safetensors). La longitud de contexto soportada por la arquitectura alcanza los 524.288 tokens (`max_position_embeddings`), aunque las pruebas publicadas por el autor solo verifican recall hasta 16K tokens.

La relevancia de este lanzamiento reside en su enfoque empirico: el autor publica mediciones comparativas entre el modelo base y el fine-tune para cada cuantizacion, incluyendo pruebas de conocimiento en griego, calidad linguistica, HumanEval y recall en contexto largo. Ademas, documenta de forma transparente las limitaciones, como la inestabilidad del modo "thinking" con esfuerzo alto y la perdida de conocimiento general en cuantizaciones agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2-horizon (soportada por llama.cpp b11454 o superior) |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 524.288 tokens (`max_position_embeddings`); verificado hasta 16K en pruebas |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (las menores con imatrix) |
| Idiomas soportados | Griego (el), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en repositorio separado |

## Arquitectura y entrenamiento

El modelo base es K2-Horizon-7B de MBZUAI, con una arquitectura identificada en llama.cpp como `k2-horizon`. No se dispone en la informacion proporcionada de detalles sobre el tipo exacto de transformer, la composicion del dataset original ni el proceso de alineacion (RLHF/DPO) del modelo base. La longitud maxima de posiciones es de 524.288 tokens.

El fine-tune se realizo mediante LoRA con rango 16, alpha 32, aplicado a todas las capas de proyeccion, con learning rate 2e-4 y scheduler coseno durante 3 epocas. Se conservo la epoca 0: las epocas posteriores redujeron la perdida de evaluacion pero degradaron el conocimiento general (epoca 1: 12/30 frente a 18/30 del base). La perdida de evaluacion paso de 0.958 a 0.607. El entrenamiento se ejecuto en fp16 sobre 2x T4 de Kaggle (capas divididas entre ambas tarjetas) durante 151 minutos. El dataset consta de 2.014 ejemplos (griego, codigo y tool calling), con la perdida calculada unicamente sobre la respuesta. El sha256 del dataset es `80e47fd2b37d2bea66d219045f3fb8b25beb64a1e32159abecb84223240d2547`. Las cuantizaciones menores emplean una importance matrix (imatrix) calculada sobre las respuestas de entrenamiento (aproximadamente 60% griego).

## Capacidades

- Generacion de texto conversacional en griego e ingles.
- Generacion de codigo, con mejora medible en HumanEval respecto al base (143/164 frente a 131/164).
- Tool calling / function calling (incluido en el dataset de entrenamiento).
- Razonamiento multi-paso mediante modo "thinking" con `reasoning_effort` configurable (off, low, high).
- Recuperacion en contexto largo: recall verificado en 4K y 16K tokens (8/8 en ambos casos).
- Capacidad multilingue limitada a griego e ingles.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Generacion de contenido en griego: el modelo produce texto en griego con una puntuacion de calidad notablemente superior al base (87,6-95,9 frente a 75,1 con thinking off), adecuado para redaccion asistida, resumenes y respuesta a preguntas en ese idioma.
- Asistencia a desarrolladores grecoparlantes: combinacion de codigo solido (87,2% pass@1 en HumanEval) con capacidad de explicar en griego, util para documentacion tecnica bilingue.
- Integracion en pipelines de CI/CD con tool calling: el modelo puede invocar funciones y encadenar pasos, lo que permite automatizar tareas de revision o generacion de parches en flujos de integracion.
- Atencion al cliente en griego: conversaciones multi-turno con contexto de hasta 16K tokens verificados, suficiente para historiales de sesion extensos.
- Procesamiento de documentos largos: con contexto arquitectonico de 524.288 tokens (aunque solo verificado hasta 16K), puede emplearse para resumen y extraccion en documentos extensos, con cautela mas alla de 16K.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,21 GiB) y Q5_K_M (6,03 GiB) permiten ejecucion local en GPUs consumer, util para prototipado y entornos sin infraestructura dedicada.
- Analisis de texto juridico o administrativo griego: el conocimiento general se mantiene a nivel del base (17/30 frente a 18/30), por lo que es viable para tareas de clasificacion y extraccion, con revision humana.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados sobre la build Q8_0 con temperatura 0 y flags identicos entre base y fine-tune. Conocimiento: 30 preguntas cortas de hechos en griego con verificacion estricta. Griego: 18 prompts (validez de caracteres x vocabulario x significado). Codigo: HumanEval, 164 problemas. Recall: preguntas "needle" a 4K y 16K tokens.

| Prueba | IFM/K2-Horizon-7B | Heliactis 3 |
|---|---|---|
| Conocimiento general, 30 preguntas en griego | 18/30 | 17/30 |
| Puntuacion griego, thinking off (3 ejecuciones) | 75,1 | 87,6 · 95,8 · 95,9 |
| Puntuacion griego, effort low | 73,9 | 86,0 |
| HumanEval pass@1, thinking off | 131/164 (79,9%) | 143/164 (87,2%) |
| Recall contexto largo 4K + 16K, thinking off | 8/8 | 8/8 |

Rendimiento por cuantizacion (mismas flags que Q8_0):

| Build | Conocimiento | Griego, thinking off | Griego, effort low | HumanEval | Recall 4K+16K |
|---|---|---|---|---|---|
| base Q8_0 | 18/30 | 75,1 | 73,9 | 131/164 | 8/8 |
| Q8_0 | 17/30 | 87,6 · 95,8 · 95,9 | 86,0 | 143/164 | 8/8 |
| Q6_K | 18/30 | 79,1 | 88,5 | 144/164 | 8/8 |
| Q5_K_M | 18/30 | 94,4 | 85,7 | 142/164 | 8/8 |
| Q4_K_M | 14/30 | 84,8 | 85,2 | 142/164 | 8/8 |

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: BF16 ~16,77 GiB; Q8_0 ~8,92 GiB; Q6_K ~6,88 GiB; Q5_K_M ~6,03 GiB; Q4_K_M ~5,21 GiB.
- GPU recomendadas: no se especifican en la informacion disponible. El entrenamiento se realizo en 2x T4 (16 GB cada una) con capas divididas.
- Cabe en GPU consumer: Q4_K_M y Q5_K_M son viables en tarjetas con 8 GB o mas de VRAM; Q6_K y Q8_0 requieren 8-12 GB o mas; BF16 requiere alrededor de 17 GB.
- Opciones de despliegue: llama.cpp (obligatorio b11454 o superior por la arquitectura `k2-horizon`), con `llama-server` y flag `--jinja` (plantilla de chat embebida). Ejemplo: `llama-server -m Heliactis-3-7B-Q8_0.gguf --jinja -c 16384`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Heliactis-3-7B | ~9B | 524.288 (verificado 16K) | Apache 2.0 | GGUF, safetensors | Fine-tune especializado en griego y codigo |
| IFM/K2-Horizon-7B (base) | ~9B | 524.288 | Apache 2.0 | safetensors, GGUF | Modelo base; peor griego (75,1) y HumanEval (79,9%) |
| Alternativas de ~7-9B para griego | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El test de griego consta de solo 18 prompts y la subpuntuacion de significado de 11 items: detecta colapsos y mejoras claras, no cambios pequenos.
- La puntuacion de griego con thinking off es ruidosa: el mismo Q8_0 oscilo entre 87,6 y 95,9 en tres ejecuciones, por lo que las puntuaciones de una sola ejecucion caen dentro de esa banda.
- Persisten errores gramaticales en griego, aunque menos que en el base; se recomienda revisar cualquier texto publicado.
- El recall en contexto largo solo se midio hasta 16K tokens; no se hacen afirmaciones mas alla de lo medido pese a que la arquitectura permita 524.288.
- Evitar `reasoning_effort: "high"`: el razonamiento no se cierra dentro de un presupuesto practico y con limite de 10.000 tokens muchas respuestas vuelven vacias. Es una propiedad del modo high-effort de K2 Horizon, no del fine-tune.
- Q4_K_M pierde conocimiento general (14/30 frente a 17/30 en Q8_0); preferir Q5_K_M o superior si los hechos importan.
- El modelo no fue entrenado con datos de identidad propia; si la identidad es relevante, debe fijarse en el system prompt.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de este tamano; el conocimiento general esta a nivel del base.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion correspondiente al modelo base y al derivado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ApollonLabs/Heliactis-3-7B-GGUF
- Repositorio safetensors de precision completa: https://huggingface.co/ApollonLabs/Heliactis-3-7B
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Insignia del proyecto: https://huggingface.co/ApollonLabs/Heliactis-3-7B-GGUF/resolve/main/insignia.svg
