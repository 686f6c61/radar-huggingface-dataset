# AIHeikki/brainsurged-gladiator-gemma4-e2b

## Resumen

Brainsurged Gladiator Gemma4 E2B es un ajuste fino del modelo base `google/gemma-4-E2B-it` desarrollado por AIHeikki, publicado en Hugging Face bajo licencia Apache 2.0. Se distribuye exclusivamente en formato GGUF (cuantización Q4_K_M como artefacto principal) y está pensado para su uso con llama.cpp y Ollama. El modelo parte de la arquitectura Gemma 4 de Google, con 35 capas y un recuento de parámetros activos de aproximadamente 2.300 millones, aunque el total incluyendo embeddings ronda los 5.100 millones; el repositorio declara 4.647.450.147 parámetros en safetensors.

El objetivo declarado del autor es demostrar si un modelo de pesos abiertos de menor tamaño puede aprender un currículo consolidado de política, comportamiento agéntico y táctica de ajedrez en una sola pasada de entrenamiento, en lugar de acumular múltiples rondas secuenciales de LoRA y edición de pesos. El resultado se presenta como un motor de decisión "system-1" con salida estructurada, orientado a partidas de ajedrez y tareas de decisión táctica, comparado directamente contra el modelo hermano `brainsurged-chessmaster-qwen3.5-4b` (4.660 millones de parámetros) y contra el motor propietario Jev 1.13.0.

La relevancia del modelo es acotada y experimental: no es un modelo de propósito general, sino un artefacto de investigación sobre weight-space programming aplicado a un dominio muy concreto. Los encoders de visión y audio del modelo base fueron eliminados durante la exportación a GGUF, de modo que el modelo distribuido es exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), 35 capas |
| Parametros totales | 4.647.450.147 (safetensors); ~5,1B incluyendo embeddings según el autor |
| Parametros activos | ~2,3B (recuento efectivo de computo de texto declarado por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (artefacto principal, 3,19 GiB); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 E2B-it, un transformer decoder-only de 35 capas con un recuento efectivo de parámetros de texto de aproximadamente 2.300 millones. La exportación a GGUF elimina los encoders de visión y audio presentes en el modelo base, por lo que el artefacto distribuido procesa únicamente texto. El autor distingue explícitamente entre el recuento efectivo (2,3B) y el total con embeddings (~5,1B), y advierte que comparar esa cifra efectiva con los 4,66B totales de Qwen no demuestra la mitad de parámetros ni la mitad de cómputo; no se realizó medición de FLOPs de extremo a extremo.

El entrenamiento consistió en una única pasada de ajuste con LoRA sobre el modelo base crudo, seguida de una fase de calibración sin gradientes. El conjunto de datos fue sintético y consta de 2.780 ejemplos: el currículo de política y comportamiento agéntico de la ronda 4, el material de ajedrez de la ronda 6 y 380 ejemplos nuevos de guardas tácticas (rayos de dama y torre, comprobaciones de contacto tras promoción). El autor describe el resultado como un modelo híbrido entrenado, no como un resultado de zero-training-data ni de solo edición de pesos sin gradientes. La innovación declarada es la consolidación de todo el currículo en una sola pasada de "cirugía" sobre los pesos, en contraste con las seis rondas secuenciales de LoRA y edición usadas en el modelo hermano Chessmaster.

## Capacidades

- Generación de texto conversacional y de decisión en el dominio del ajedrez.
- Salida estructurada (structured output) orientada a la selección de jugadas y decisiones tácticas.
- Comportamiento agéntico y de política consolidado en el ajuste (currículo de política y agentic).
- Razonamiento táctico de ajedrez: detección de jaques, promociones, guardas de rayos de dama y torre, y comprobaciones de contacto tras promoción.
- Motor de decisión "system-1": selección rápida de jugada sin cadena de razonamiento explícita prolongada.
- Compatibilidad con llama.cpp y Ollama para despliegue local.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión y audio: no disponibles (encoders eliminados en la exportación a GGUF).

## Casos de uso

- Motor de ajedrez experimental en local: el modelo puede integrarse con `python-chess` como árbitro y generar jugadas en partidas completas, como demuestran las cuatro partidas registradas contra Jev 1.13.0 y Chessmaster 4B. Es adecuado por su latencia baja en GPU (p50 de motor entre 103,5 y 127,5 ms en NVIDIA L4) y su formato GGUF listo para llama.cpp.
- Investigación en weight-space programming: sirve como artefacto de estudio para comparar una sola pasada de LoRA y edición de pesos frente a múltiples rondas secuenciales, con un currículo documentado de 2.780 ejemplos sintéticos.
- Evaluación de consolidación de currículos: permite reproducir el experimento de si un modelo de ~2,3B de parámetros efectivos puede absorber política, agentic y táctica de ajedrez en un único entrenamiento, comparándolo con el modelo hermano de 4,66B.
- Prototipado de motores de decisión con salida estructurada: el modelo puede usarse como componente de selección de acción en pipelines que requieran respuestas en formato fijo, dado su entrenamiento en structured output.
- Despliegue en entornos con recursos limitados: el GGUF Q4_K_M de 3,19 GiB permite ejecutar el modelo en hardware de consumo, útil para demos y pruebas de integración con Ollama sin infraestructura dedicada.
- Benchmarking de latencia en WAN: las mediciones registradas (p50 WAN de 155,0 a 161,2 ms frente a Jev) permiten usar el modelo como referencia en pruebas de latencia de extremo a extremo con el motor `serving_v7_gladiator`.
- Análisis de calidad táctica con auditoría Stockfish: el modelo puede emplearse para generar partidas y medir blunders de ≥300 cp y jaques kamikaze, como en el informe de arena del autor.

## Benchmarks y rendimiento

Los datos disponibles son partidas y un sprint de posiciones, no benchmarks estándar de NLP (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible para esas métricas.

| Prueba | Resultado |
|---|---|
| Partida 1 vs. Jev 1.13.0 (negras) | Tablas ½–½, 113 plies, material insuficiente; blunders ≥300cp 7/5; jaques kamikaze 4/3; motor p50 109,0 ms (WAN 161,2 ms) vs. Jev 166,3 ms WAN |
| Partida 2 vs. Jev 1.13.0 (blancas) | Derrota 0–1, 72 plies, mate (36...Bh6#); blunders 7/8; jaques kamikaze 0/7; motor p50 103,5 ms (WAN 155,0 ms) vs. Jev 172,2 ms WAN |
| Partida 3 vs. Chessmaster 4B (negras) | Victoria 0–1, 30 plies, mate (15...Qxc1#); blunders 3/0; jaques kamikaze 0/0; motor p50 109,9 ms (WAN 179,1 ms) vs. 4B 205,5 ms (WAN 288,3 ms) |
| Partida 4 vs. Chessmaster 4B (blancas) | Tablas ½–½, 172 plies, material insuficiente; blunders 21/18; jaques kamikaze 9/4; motor p50 127,5 ms (WAN 180,0 ms) vs. 4B 116,4 ms (WAN 171,4 ms) |
| Serie global vs. Chessmaster 4B | 1½–½ a favor de Gladiator |
| Sprint de 24 posiciones (Q4_K_M + serving_v7) | Datos truncados en la información disponible; latencia WAN p50 del sprint 214,35 ms frente a 177,42 ms de Jev |

El autor advierte que cuatro partidas y un sprint de 24 posiciones no establecen Elo ni superioridad general, y que las cifras de latencia son observaciones de esas cargas de trabajo concretas, no afirmaciones universales.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 3,19 GiB (3.427.880.704 bytes), por lo que se necesita al menos esa cantidad más el overhead de contexto y del runtime; el modelo base en precisión superior requeriría más memoria, aunque no se dispone de cifras oficiales.
- GPU recomendadas: NVIDIA L4 es la GPU usada en las mediciones del autor (partidas en Cloud Run). No se documentan otras GPU.
- GPU de consumo: por el tamaño del Q4_K_M (3,19 GiB), es plausible que quepa en GPU de consumo con 6-8 GB de VRAM, pero no se ha verificado en la información disponible.
- Opciones de despliegue: llama.cpp y Ollama (etiquetas del repositorio); el autor usa además el motor propio `serving_v7_gladiator` (C++/CUDA, "2-Pass Parallel Multi-seq_id Tree-Batch").
- Latencia y throughput: p50 de motor entre 103,5 y 127,5 ms en NVIDIA L4; p50 WAN entre 155,0 y 180,0 ms en las partidas registradas. El autor señala que el decodificador de serving, la cuantización, los prompts y el runtime forman parte del sistema evaluado, y que Ollama/llama.cpp estándar puede producir jugadas o latencias distintas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento registrado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Brainsurged Gladiator Gemma4 E2B | ~2,3B efectivos (~5,1B con embeddings) | no disponible | 1½–½ vs. Chessmaster 4B; ½–1½ vs. Jev 1.13.0 | Apache 2.0 | GGUF en Hugging Face |
| Brainsurged Chessmaster Qwen3.5-4B | 4,66B | no disponible | Perdió ½–1½ vs. Gladiator; 6 rondas de cirugía | no disponible | Hugging Face (AIHeikki) |
| Jev 1.13.0 | no disponible | no disponible | Ganó 1½–½ vs. Gladiator; p50 WAN 166,3–172,2 ms | propietario | API (api.typesafe.ai) |
| google/gemma-4-E2B-it | ~2,3B efectivos | no disponible | Modelo base sin ajuste específico de ajedrez | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El propio autor advierte que cuatro partidas y un sprint de 24 posiciones no establecen Elo ni superioridad general; los resultados son observaciones de cargas de trabajo concretas.
- La comparación de 2,3B efectivos frente a 4,66B totales no demuestra la mitad de parámetros ni de cómputo; no se midieron FLOPs de extremo a extremo.
- La afirmación de "zero leakage" se refiere únicamente a la comprobación de solapamiento exacto de colocación de piezas; no prueba independencia semántica ni excluye desarrollo guiado por benchmarks.
- La precisión de holdout es específica de los conjuntos sintéticos suministrados.
- El decodificador de serving, la cuantización, los prompts y el runtime forman parte del sistema evaluado; Ollama/llama.cpp estándar puede producir jugadas o latencias diferentes.
- Las comprobaciones de lote paralelo miden concordancia en casos de prueba con tolerancia numérica; no prueban concordancia bit a bit en todas las posiciones.
- El modelo es de dominio específico (ajedrez y decisión táctica); no se documentan capacidades generales de razonamiento, código o matemáticas.
- Visión y audio no están disponibles en el GGUF distribuido.
- Idiomas soportados no disponibles; riesgo de alucinación no evaluado en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos sintéticos de entrenamiento deben verificarse por separado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AIHeikki/brainsurged-gladiator-gemma4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base (variante Unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it
- Modelo comparado (Chessmaster Qwen3.5-4B): https://huggingface.co/AIHeikki/brainsurged-chessmaster-qwen3.5-4b
- Informe de arena (referenciado en la model card): `reports/gladiator_evaluations/GLADIATOR_ARENA_REPORT.md` (ruta interna del repositorio)
- Partidas archivadas: `reports/gladiator_evaluations/live_matches/` (ruta interna del repositorio)
- Jev 1.13.0: https://api.typesafe.ai (referenciado en la model card)
