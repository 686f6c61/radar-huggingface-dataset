# hhhhhhy5/MFD-Qwen3-8B

## Resumen

MFD-Qwen3-8B es un modelo borrador (draft model) para decodificacion especulativa diseñado para acelerar la inferencia de Qwen/Qwen3-8B. Lo desarrolla el autor hhhhhhy5 (Haoyu Huang y colaboradores) y se enmarca en el trabajo *Multi-Future Drafting: Mixture Block Drafters for Tree-Verified Speculative Decoding* (arXiv:2611.13017). No es un modelo de proposito general: es un componente que se acopla a un modelo objetivo concreto y que solo tiene sentido dentro de un pipeline de decodificacion especulativa con verificacion por arbol.

La innovacion central es el Multi-Future Drafting (MFD): un drafter de bloques DFlash con K = 8 embeddings de modo aprendidos en su entrada. Los 8 modos proponen simultaneamente el mismo bloque en una unica pasada forward, cada uno representando un futuro coherente distinto. Un arbol de borrador mezclado conserva los B prefijos con mayor log-probabilidad del mejor modo, y el modelo objetivo verifica el arbol en una sola pasada. Como la verificacion es la estandar por arbol, la decodificacion es sin perdida (lossless): la salida final es exactamente la del modelo objetivo.

El modelo tiene 1.049M de parametros en bf16 (1.048.663.296 exactos segun los safetensors), 5 capas de anchura 4096 que leen las capas [1, 9, 17, 25, 33] del objetivo, y trabaja con bloques de 16 posiciones (15 posiciones borradoradas). Se inicializa desde z-lab/Qwen3-8B-DFlash-b16 y se afina sobre 1,42M de prompts de mlabonne/open-perfectblend. Su relevancia es practica: reporta aceleraciones de hasta 6,98x sobre decodificacion autorregresiva en configuracion HF con batch 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (draft model para decodificacion especulativa); 5 capas de anchura 4096, lectura de capas objetivo [1, 9, 17, 25, 33], bloque de 16 (15 posiciones borradoradas), 8 mode embeddings (8 x 4096) y mode gate lineal (no usado en inferencia) |
| Parametros totales | 1.048.663.296 (1049M) en bf16; no almacena el embedding ni el LM head del objetivo, que se usan en tiempo de ejecucion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de hasta 3072 tokens; el contexto efectivo lo determina el modelo objetivo Qwen3-8B) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (los pesos de partida de z-lab/Qwen3-8B-DFlash-b16 son MIT y su aviso aplica) |
| Formato de pesos | safetensors con custom_code |

## Arquitectura y entrenamiento

El drafter es un DFlash block drafter de 5 capas y anchura 4096 que consume los estados ocultos de cinco capas del objetivo (1, 9, 17, 25 y 33) y predice un bloque de 16 tokens (15 posiciones borradoradas) en una sola pasada. En la entrada incorpora 8 embeddings de modo aprendidos (`mode_embed`, 8 x 4096) mas una compuerta lineal (`mode_gate`, no usada en inferencia). Cada modo genera un futuro coherente del bloque; el arbol de borrador mezclado selecciona los B prefijos con mayor log-probabilidad del mejor modo y el objetivo verifica el arbol completo en una pasada. La verificacion es la estandar por arbol, por lo que la salida es identica a la del objetivo (decodificacion sin perdida).

El entrenamiento parte de z-lab/Qwen3-8B-DFlash-b16 (MIT) y usa los 1,42M de prompts de mlabonne/open-perfectblend (los datos de Domino y DARTree), con respuestas regeneradas por Qwen3-8B sin modo thinking (T = 0,7, top-p 0,8, top-k 20, maximo 2048 tokens nuevos). Se entrena 3 epocas con AdamW, learning rate 1e-4 (warmup del 4%, decaimiento coseno), gradient clipping 1, secuencias de hasta 3072 tokens, 36 secuencias por paso y 64 bloques ancla por secuencia x 8 modos. El objetivo es un winner-take-all relajado sobre los 8 modos: el modo con mayor cobertura suave del bloque recibe peso 0,9 y el resto 0,1/7; cada modo se entrena con la perdida D-PACE (suavizado 0,5) y se añade cross-entropy de la compuerta con peso 0,1.

## Capacidades

- Aceleracion de decodificacion especulativa sin perdida para Qwen/Qwen3-8B (sin thinking): la salida es la del objetivo, el drafter solo propone.
- Borrador multi-futuro: 8 modos proponen bloques de 15 posiciones en una unica pasada forward.
- Construccion de arbol de borrador mezclado con presupuesto configurable B (128 en HF, 63 en SGLang con vocabulario de borrador de 64K).
- Integracion con Hugging Face Transformers (via el codigo del repositorio) y con SGLang 0.5.22 mediante parche MFD.
- Soporte de decodificacion greedy (T = 0) y con temperatura (T = 1).
- No es un modelo de proposito general: no genera texto de forma autonoma, no hace tool calling, no soporta agentes ni vision ni audio por si mismo. Todas esas capacidades dependen del modelo objetivo Qwen3-8B.

## Casos de uso

- Servicio de inferencia de baja concurrencia: en despliegues con batch 1-2, el drafter MFD reporta 6,98x de aceleracion sobre autorregresivo en HF y 6,43x en SGLang, lo que reduce la latencia por peticion en asistentes interactivos.
- Razonamiento matematico interactivo: las tareas GSM8K y MATH-500 son parte del conjunto de evaluacion y se benefician de la longitud de aceptacion tau (10,18 en HF con T = 0), adecuado para tutores o calculadoras conversacionales.
- Generacion de codigo en asistentes de IDE: HumanEval y MBPP estan en el benchmark; el drafter acelera la salida de Qwen3-8B en autocompletado y generacion de funciones sin alterar el resultado.
- Chat multi-turno de proposito general: MT-Bench forma parte de la evaluacion; el drafter acelera las respuestas de Qwen3-8B en dialogos, manteniendo exactamente la calidad del objetivo.
- Despliegue en SGLang para prototipos y demos: el repositorio incluye `launch_server.sh` con configuracion `mfd-b63.env` y vocabulario de borrador de 64K, lo que permite levantar un servidor acelerado con un solo comando.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para comparar cadenas DFlash, DDTree y arboles MFD sobre el mismo objetivo y los mismos datos.
- Evaluacion de tecnicas de tree verification: util para medir el efecto del presupuesto de arbol B y del tamaño de vocabulario de borrador en la longitud de aceptacion y el throughput.

## Benchmarks y rendimiento

Resultados del paper. Hugging Face Transformers, batch size 1, una NVIDIA RTX PRO 6000 Blackwell. Cada celda es la aceleracion sobre decodificacion autorregresiva con la longitud de aceptacion tau entre parentesis, media sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench. Arboles con B = 128.

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (drafter publicado) | 4,26x (5,99) | 3,48x (4,88) |
| DDTree (drafter publicado) | 5,73x (8,18) | 5,00x (7,13) |
| D-PACE + DDTree, mismos datos, 3 ep | 6,43x (9,18) | 5,26x (7,48) |
| **Este drafter (arbol MFD)** | **6,98x (10,18)** | **5,88x (8,52)** |

SGLang 0.5.22 con parche MFD, batch size 1, mismas 5 tareas, B = 63, vocabulario de borrador de 64K.

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (drafter publicado, SGLang nativo) | 4,39x (5,90) | 3,62x (4,88) |
| DDTree (drafter publicado) | 5,27x (7,79) | 4,56x (6,74) |
| D-PACE + DDTree (1,42M prompts) | 5,99x (8,84) | 4,82x (7,15) |
| **Este drafter** | **6,43x (9,72)** | **5,26x (7,96)** |

## Requisitos de hardware

- VRAM estimada: el drafter ocupa aproximadamente 2,1 GB en bf16 (tamaño del repo). A esto se suma el modelo objetivo Qwen3-8B en bf16 (unos 16 GB de pesos) mas el cache KV y las estructuras del arbol de borrador.
- GPU de referencia en los benchmarks: una NVIDIA RTX PRO 6000 Blackwell.
- Cabe en GPU consumer de gama alta con suficiente VRAM para el objetivo; el drafter en si es pequeño, pero el requisito dominante es alojar Qwen3-8B y su cache KV.
- Despliegue soportado: Hugging Face Transformers mediante el codigo del repositorio (`inference/hf`) y SGLang 0.5.22 con el parche MFD (`inference/sglang`).
- Latencia y throughput: no se publican valores absolutos de tokens por segundo; solo aceleraciones relativas (hasta 6,98x en HF y 6,43x en SGLang con T = 0, batch 1).
- El modo mixto rinde mejor con batch 1-2; en SGLang los arboles de un solo modo sirven mas rapido a partir de batch 8.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceleracion reportada (T = 0, HF) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MFD-Qwen3-8B (este) | Drafter MFD para Qwen3-8B | 1049M | no disponible | 6,98x (tau 10,18) | apache-2.0 | Hugging Face |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash (inicializacion de este) | no disponible | no disponible | 4,26x como cadena DFlash (tau 5,99) | MIT | Hugging Face |
| DDTree (drafter publicado) | Drafter con arbol DDTree | no disponible | no disponible | 5,73x (tau 8,18) | no disponible | no disponible |
| D-PACE + DDTree (1,42M prompts) | Drafter con perdida D-PACE y arbol DDTree | no disponible | no disponible | 6,43x (tau 9,18) | no disponible | no disponible |

## Limitaciones y advertencias

- El arbol mixto solo compensa con batch sizes 1-2. En SGLang, los arboles de un solo modo sirven mas rapido a partir de batch 8; el paper propone un drafter MFD-D para mantener un unico motor rapido en todos los tamaños de batch.
- El drafter esta atado a su objetivo: lee los estados ocultos de Qwen/Qwen3-8B y usa su embedding y LM head. No es reutilizable con otro modelo.
- Esta entrenado contra Qwen3-8B sin modo thinking; su comportamiento con el modo thinking activado no esta documentado.
- No es un modelo generativo autonomo: no debe usarse como modelo de chat, codigo o razonamiento por si solo.
- Riesgo de alucinacion: no aplica al drafter en si, porque la verificacion por arbol garantiza que la salida sea la del objetivo; cualquier alucinacion proviene de Qwen3-8B.
- Sesgos: no se documentan sesgos especificos del drafter; hereda los del objetivo y los de los datos de entrenamiento (mlabonne/open-perfectblend).
- Restricciones de licencia: el modelo es Apache-2.0, pero los pesos de partida de z-lab/Qwen3-8B-DFlash-b16 son MIT y su aviso aplica a los pesos heredados; conviene conservar ambas atribuciones en uso comercial.
- Requiere codigo externo con `custom_code` y un parche especifico para SGLang; no funciona con un `AutoModel` estandar sin el repositorio `multi-future-drafting`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhhhhhy5/MFD-Qwen3-8B
- Paper: https://arxiv.org/abs/2611.13017
- Codigo: https://github.com/hhhhhhy5/multi-future-drafting
- Pagina del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Modelo base (inicializacion): https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
