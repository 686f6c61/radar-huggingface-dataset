# hhhhhhy5/MFD-Qwen3-4B-100K

## Resumen

MFD-Qwen3-4B-100K es un modelo borrador (*draft model*) para decodificación especulativa, no un modelo generativo autónomo. Lo desarrolla el autor hhhhhhy5 como artefacto de investigación asociado al artículo *Multi-Future Drafting: Mixture Block Drafters for Tree-Verified Speculative Decoding* (arXiv:2611.13017). Su función es acelerar la inferencia de Qwen/Qwen3-4B proponiendo bloques de tokens que el modelo objetivo verifica en una sola pasada, de modo que la salida final es exactamente la del objetivo (decodificación sin pérdida).

Técnicamente es un DFlash block drafter de 537 millones de parámetros en bf16, con 5 capas de anchura 2560 que leen los estados ocultos de las capas [1, 9, 17, 25, 33] del objetivo. La innovación frente a un borrador convencional es la incorporación de K = 8 embeddings de modo (*mode embeddings*) en la entrada: los 8 modos redactan el bloque de 16 posiciones en una única pasada, cada uno representando un futuro coherente distinto. Un árbol de mezcla conserva las B mejores ramas por log-probabilidad del mejor modo y el modelo objetivo verifica el árbol completo.

Es relevante porque el artículo reporta una aceleración de 6,73x sobre decodificación autorregresiva (temperatura 0) con longitud de aceptación de 9,71, frente a 6,08x del DDTree sobre el borrador original. El modelo se publica con licencia Apache-2.0, aunque su utilidad práctica está acotada: solo funciona emparejado con Qwen3-4B y su ventaja se concentra en lotes de tamaño 1-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (block drafter con 5 capas de anchura 2560, lectura de capas del objetivo [1, 9, 17, 25, 33], bloque de 16 posiciones con 15 posiciones redactadas, 8 mode embeddings de 8 x 2560 y una mode_gate lineal no usada en inferencia) |
| Parametros totales | 537.450.240 (537M, bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 3072 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo es un borrador por bloques de tipo DFlash. Consta de 5 capas de anchura 2560 que consumen los estados ocultos de las capas 1, 9, 17, 25 y 33 de Qwen3-4B, más los embeddings y la cabeza LM del propio objetivo, que no se almacenan en el repositorio. Sobre esa base se añaden 8 embeddings de modo y una compuerta lineal (*mode_gate*) que no interviene en inferencia. En cada pasada hacia adelante los 8 modos redactan simultáneamente un bloque de 16 posiciones (15 posiciones efectivas); después, un árbol de mezcla retiene los B prefijos con mayor log-probabilidad del mejor modo y el objetivo verifica el árbol en una sola pasada con verificación de árbol estándar, lo que preserva la distribución del modelo objetivo.

El entrenamiento parte de z-lab/Qwen3-4B-DFlash-b16 (MIT) y utiliza los 99.987 ejemplos de entrenamiento que los autores de DFlash publicaron para Qwen3-4B (procedentes de NVIDIA Nemotron post-training data, OpenCodeInstruct, OpenR1-Math y Evol-CodeAlpaca, con las respuestas liberadas de Qwen3-4B sin modo thinking). Se realizaron 3 épocas con AdamW, tasa de aprendizaje 1e-4 (4 % de calentamiento, decaimiento coseno), recorte de gradiente 1, secuencias de hasta 3072 tokens, 12 secuencias por paso y 64 bloques ancla por secuencia multiplicados por 8 modos. El objetivo es un *winner-take-all* relajado sobre los 8 modos (el modo con mayor cobertura suave del bloque recibe peso 0,9; el resto, 0,1/7), cada modo entrenado con la pérdida D-PACE (suavizado 0,5) más una entropía cruzada de la compuerta con peso 0,1.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre Qwen3-4B, con verificación de árbol sin pérdida.
- Redacción multi-futuro: 8 modos paralelos por bloque de 16 posiciones, cada uno coherente de forma independiente.
- Aceleración de inferencia en tareas de razonamiento matemático, código y conversación, según la evaluación del artículo sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench.
- Integración con Hugging Face Transformers (script de inferencia del repositorio) y con SGLang (servidor con vocabulario de borrador de 64k y configuración `mfd-b63.env`).
- Soporte de decodificación con temperatura 0 y 1 en los experimentos publicados.
- No soporta tool calling, agentes, visión, audio ni modo thinking por sí mismo; hereda las capacidades del objetivo Qwen3-4B, pero su única función es proponer tokens.

## Casos de uso

- Servicio de inferencia de Qwen3-4B con latencia reducida: desplegar el par objetivo-borrador en SGLang con `--draft hhhhhhy5/MFD-Qwen3-4B-100K` para obtener hasta 6,73x de aceleración con lote 1 en decodificación greedy, manteniendo la salida idéntica a la del objetivo.
- Evaluación de investigación en decodificación especulativa: reproducir las tablas del artículo comparando cadenas DFlash, DDTree y árboles MFD con presupuesto de árbol B = 256.
- Asistentes conversacionales de un solo usuario: escenarios de chat o copiloto con lote 1-2, donde el árbol de mezcla rinde mejor que los árboles de un solo modo.
- Generación de código interactiva: al evaluarse sobre HumanEval y MBPP con aceleración mantenida, encaja en entornos de autocompletado o revisión de código con un único usuario concurrente.
- Razonamiento matemático en producción de baja concurrencia: GSM8K y MATH-500 forman parte del conjunto de evaluación, por lo que el borrador está ajustado a ese dominio de prompts.
- Banquito de pruebas para comparar estrategias de borrador: permite medir longitud de aceptación (tau) y aceleración frente a D-PACE + DDTree con los mismos datos de entrenamiento.
- Investigación sobre mezclas de modos: el par `mode_embed`/`mode_gate` y el objetivo winner-take-all relajado sirven como base para estudiar diversidad de futuros en borradores.

## Benchmarks y rendimiento

Resultados del artículo (Transformers de Hugging Face, lote 1, una NVIDIA RTX PRO 6000 Blackwell; media sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench; B = 256; cada celda es la aceleración sobre decodificación autorregresiva con la longitud de aceptación tau entre paréntesis):

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (borrador publicado) | 4,38x (5,98) | 3,73x (5,08) |
| DDTree (borrador publicado) | 6,08x (8,59) | 5,44x (7,70) |
| D-PACE + DDTree, mismos datos, 1 época | 6,31x (8,91) | 5,54x (7,84) |
| D-PACE + DDTree, mismos datos, 3 épocas | 6,22x (8,78) | 5,39x (7,63) |
| **Este borrador (árbol MFD)** | **6,73x (9,71)** | **5,96x (8,63)** |

No se han publicado en la información disponible resultados desagregados por benchmark (MMLU, HumanEval, GSM8K por separado) ni cifras de latencia absoluta o throughput en tokens por segundo.

## Requisitos de hardware

- VRAM del borrador: 537M parámetros en bf16, aproximadamente 1,1 GB de pesos; el repositorio ocupa 1,1 GB.
- VRAM total: hay que sumar el objetivo Qwen3-4B en bf16 (unos 8 GB de pesos) más cachés de atención y árbol; en la práctica se necesita una GPU con al menos 16-24 GB para el par completo en bf16.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell es la usada en el artículo; también cabe en A100, H100, L40S y RTX 4090 (24 GB) para el par en bf16.
- GPU de consumo: sí, en RTX 4090 (24 GB) o superiores con el objetivo en bf16; en GPUs de 16 GB habría que recurrir a cuantización del objetivo, no documentada para el borrador.
- Despliegue: script de inferencia con Hugging Face Transformers del repositorio `hhhhhhy5/multi-future-drafting` y servidor SGLang con `inference/sglang/launch_server.sh`, vocabulario `draft_vocab_qwen3-4b_64k.json` y configuración `mfd-b63.env`.
- Latencia y throughput: no se publican valores absolutos; la métrica disponible es la aceleración relativa de la tabla de benchmarks (6,73x a T = 0 y 5,96x a T = 1 con lote 1).
- Advertencia de escalado: en SGLang, los árboles de un solo modo sirven más rápido a partir de lote 8; el árbol de mezcla solo compensa en lotes 1-2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aceleración reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MFD-Qwen3-4B-100K | 537M (bf16) | no disponible | 6,73x (T = 0) / 5,96x (T = 1), lote 1 | Apache-2.0 | Hugging Face (hhhhhhy5) |
| z-lab/Qwen3-4B-DFlash-b16 | no disponible en la información | no disponible | 4,38x con cadena DFlash; 6,08x con DDTree | MIT | Hugging Face (z-lab) |
| D-PACE + DDTree (mismos datos, 1 época) | no disponible | no disponible | 6,31x (T = 0) / 5,54x (T = 1) | no disponible | artefacto del artículo |
| D-PACE + DDTree (mismos datos, 3 épocas) | no disponible | no disponible | 6,22x (T = 0) / 5,39x (T = 1) | no disponible | artefacto del artículo |

La comparación se limita a borradores para Qwen3-4B evaluados en el mismo artículo; no se dispone de datos de otros borradores (EAGLE, Medusa u otros) en la información proporcionada.

## Limitaciones y advertencias

- El borrador está atado a su objetivo: lee los estados ocultos de Qwen3-4B y usa sus embeddings y cabeza LM; no funciona con otro modelo.
- La ventaja del árbol de mezcla se limita a lotes de 1-2; a partir de lote 8 en SGLang conviene un árbol de un solo modo o un borrador MFD-D.
- El modelo está entrenado sobre prompts de matemáticas, código y conversación de Nemotron, OpenCodeInstruct, OpenR1-Math y Evol-CodeAlpaca; su comportamiento fuera de esos dominios no está documentado.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez multilingüe; al ser un borrador verificado, la salida final es la del objetivo, por lo que los sesgos heredados son los de Qwen3-4B.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, pero derivan de z-lab/Qwen3-4B-DFlash-b16 (MIT), cuyo aviso aplica a los pesos de partida; los datos de prompt tienen licencias CC-BY-4.0 y Apache-2.0 que conviene revisar para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 11 de noviembre de 2026; no hay evidencia de uso en producción.
- Requiere `custom_code` y el repositorio de código asociado; no es un modelo cargable con `AutoModelForCausalLM` estándar.
- El modo thinking está desactivado en el entrenamiento (`enable_thinking=False`); no se ha validado con el razonamiento extendido de Qwen3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhhhhhy5/MFD-Qwen3-4B-100K
- Modelo base: https://huggingface.co/z-lab/Qwen3-4B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B
- Artículo: https://arxiv.org/abs/2611.13017
- Código: https://github.com/hhhhhhy5/multi-future-drafting
- Página del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Mirror del dataset de entrenamiento: https://huggingface.co/TY233/qwen3-4b-instruct-100k-backup
