# hhhhhhy5/MFD-Qwen3-8B-100K

## Resumen

MFD-Qwen3-8B-100K es un modelo borrador (draft model) para decodificacion especulativa sobre Qwen/Qwen3-8B, desarrollado por el autor independiente hhhhhhy5. No es un modelo generativo autonomo: implementa Multi-Future Drafting (MFD), una variante de DFlash en la que un unico pase forward produce K = 8 futuros coherentes del mismo bloque mediante embeddings de modo aprendidos. Esos futuros se organizan en un arbol de borradores que el modelo objetivo verifica en un solo pase, de modo que la decodificacion resultante es sin perdida (lossless): la salida final es exactamente la de Qwen3-8B.

El interes practico esta en la aceleracion de inferencia. Segun los resultados del paper asociado (arXiv:2611.13017), este borrador alcanza 6,51x de speedup con temperatura 0 y 5,43x con temperatura 1 sobre decodificacion autoregresiva, con longitudes de aceptacion tau de 9,47 y 7,89 respectivamente, promediando GSM8K, MATH-500, HumanEval, MBPP y MT-Bench con un presupuesto de arbol B = 128.

El modelo almacena 1.048.663.296 parametros en bf16 (aproximadamente 2,1 GB de repositorio) y reutiliza en tiempo de ejecucion el embedding y la LM head del modelo objetivo, por lo que no los incluye en sus pesos. Esta afinado a partir de z-lab/Qwen3-8B-DFlash-b16 y esta ligado exclusivamente a Qwen3-8B sin modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter: 5 capas de anchura 4096, lee las capas [1, 9, 17, 25, 33] del objetivo; bloque de 16 (15 posiciones borradoradas); 8 embeddings de modo (8 x 4096) y una puerta lineal (mode_gate, no usada en inferencia) |
| Parametros totales | 1.048.663.296 (1049M), bf16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 3072 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con custom_code (requiere el codigo del repositorio) |

## Arquitectura y entrenamiento

El borrador es una red de 5 capas de anchura 4096 que no procesa tokens de entrada de forma convencional: lee los estados ocultos de las capas 1, 9, 17, 25 y 33 de Qwen3-8B y predice un bloque de 16 posiciones (15 borradoradas mas el ancla). La innovacion MFD consiste en anadir K = 8 embeddings de modo en la entrada, de forma que los 8 modos generan simultaneamente 8 futuros distintos del mismo bloque en un unico pase forward. A continuacion se construye un arbol mezclando los prefijos con mayor log-probabilidad del mejor modo y el objetivo verifica el arbol con verificacion estandar de arbol, lo que preserva la distribucion del modelo objetivo.

El entrenamiento parte de z-lab/Qwen3-8B-DFlash-b16 y utiliza los prompts de las 99.987 muestras de entrenamiento liberadas por los autores de DFlash para Qwen3-4B (procedentes de NVIDIA Nemotron post-training, OpenCodeInstruct, OpenR1-Math y Evol-CodeAlpaca), con respuestas regeneradas por Qwen3-8B sin thinking (T = 0,7, top-p 0,8, top-k 20, maximo 2048 tokens nuevos). Se realizaron 3 epocas con AdamW, learning rate 1e-4 (warmup del 4%, decaimiento coseno), gradient clipping 1, secuencias de hasta 3072 tokens, 12 secuencias por paso y 64 bloques ancla por secuencia x 8 modos. El objetivo combina un winner-take-all relajado sobre los 8 modos (el modo con mayor cobertura suave recibe peso 0,9; el resto 0,1/7) con la perdida D-PACE (suavizado 0,5) por modo, mas entropia cruzada de la puerta con peso 0,1.

## Capacidades

- Decodificacion especulativa sin perdida sobre Qwen3-8B: el texto generado es identico al del modelo objetivo.
- Borrador multi-futuro: 8 futuros por bloque en un solo pase forward, con arbol de presupuesto configurable (B = 128 recomendado para este objetivo).
- Generacion de bloques de 16 posiciones con verificacion de arbol estandar.
- Integracion con Hugging Face Transformers mediante el codigo del repositorio (clase DFlashDraftModel y funcion ddtree_generate).
- Servicio en SGLang con vocabulario de borrador reducido (draft_vocab_qwen3-8b_64k.json) y configuracion mfd-b63.env.
- Soporte de temperatura 0 (greedy) y temperatura 1 en la decodificacion verificada.
- No soporta tool calling, agentes, vision, audio ni modo thinking por si mismo: hereda las capacidades del objetivo Qwen3-8B, pero solo en su variante sin thinking.

## Casos de uso

- Aceleracion de inferencia en produccion de Qwen3-8B: desplegar el par objetivo-borrador en SGLang para reducir la latencia de generacion hasta 6,51x en regimen greedy, manteniendo la calidad intacta al ser verificacion lossless.
- Servicio interactivo de baja concurrencia: chatbots o asistentes con batch 1-2, donde el arbol mezclado de MFD rinde mejor que los arboles de un solo modo.
- Generacion de codigo asistida: con aceptacion media de 9,47 tokens por paso en HumanEval y MBPP, adecuado para autocompletado y generacion de funciones en IDE o pipelines de CI/CD.
- Razonamiento matematico por lotes pequenos: GSM8K y MATH-500 se benefician de la alta longitud de aceptacion, util en evaluaciones automatizadas o tutoria matematica.
- Evaluacion y benchmarking de tecnicas de decodificacion especulativa: el modelo sirve como referencia reproducible de MFD frente a DFlash chain y DDTree con el mismo presupuesto de arbol.
- Reduccion de coste en GPU unica: al acelerar la decodificacion sobre una sola RTX PRO 6000 Blackwell, permite servir Qwen3-8B con menor tiempo de ocupacion de GPU en entornos de investigacion.
- Prototipado de servidores de inferencia con SGLang: validar configuraciones de arbol y vocabulario de borrador antes de adoptar un drafter MFD-D para todos los tamanos de batch.

## Benchmarks y rendimiento

Resultados del paper, medidos con Hugging Face Transformers, batch size 1 y una NVIDIA RTX PRO 6000 Blackwell. Cada celda es el speedup sobre decodificacion autoregresiva con la longitud de aceptacion tau entre parentesis, promediado sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con B = 128.

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (drafter publicado) | 4,26x (5,99) | 3,48x (4,88) |
| DDTree (drafter publicado) | 5,73x (8,18) | 5,00x (7,13) |
| D-PACE + DDTree, mismos datos, 1 epoca | 6,06x (8,62) | 5,10x (7,26) |
| D-PACE + DDTree, mismos datos, 3 epocas | 6,04x (8,60) | 5,03x (7,15) |
| Este drafter (arbol MFD) | 6,51x (9,47) | 5,43x (7,89) |

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 2,1 GB en bf16 (1049M parametros), adicionales a la memoria del objetivo Qwen3-8B.
- VRAM total estimada: Qwen3-8B en bf16 ocupa del orden de 16 GB de pesos, por lo que el par completo requiere en torno a 18-20 GB mas cache KV y estados ocultos; no se han publicado mediciones exactas.
- GPU recomendadas: el paper usa una NVIDIA RTX PRO 6000 Blackwell; cualquier GPU con al menos 24 GB (RTX 4090, L40S, A100 40 GB, H100) deberia poder alojar el par en bf16, aunque no se han publicado cifras para esos modelos.
- Cabe en GPU de consumo de gama alta (RTX 4090 de 24 GB) en bf16, segun la estimacion anterior; no hay datos publicados de cuantizacion del borrador.
- Despliegue: Hugging Face Transformers con el codigo del repositorio (inference/hf) y SGLang (inference/sglang/launch_server.sh con draft_vocab_qwen3-8b_64k.json y mfd-b63.env).
- Latencia y throughput: no se han publicado valores absolutos de tokens por segundo; solo los speedups relativos de la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (T = 0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MFD-Qwen3-8B-100K (este) | 1049M | no disponible | 6,51x (tau 9,47) | Apache-2.0 | Hugging Face (hhhhhhy5) |
| z-lab/Qwen3-8B-DFlash-b16 (base) | no disponible | no disponible | 4,26x (tau 5,99) como cadena DFlash | MIT | Hugging Face (z-lab) |
| DDTree sobre drafter publicado | no disponible | no disponible | 5,73x (tau 8,18) | no disponible | Codigo del repositorio del paper |
| D-PACE + DDTree (mismos datos) | no disponible | no disponible | 6,06x (tau 8,62) | no disponible | Codigo del repositorio del paper |

## Limitaciones y advertencias

- El arbol mezclado de MFD solo aporta ventaja con batch sizes de 1-2; en SGLang, los arboles de un solo modo sirven mas rapido a partir de batch 8, por lo que para alta concurrencia conviene un drafter MFD-D.
- El borrador esta acoplado a su objetivo: lee los estados ocultos de Qwen3-8B y usa su embedding y LM head, de modo que no funciona con otros modelos ni con otras variantes de Qwen3.
- Solo cubre Qwen3-8B sin modo thinking; no se ha validado con el modo thinking activado.
- Requiere codigo personalizado (custom_code) y no es cargable con un AutoModel generico de Transformers.
- Riesgo de alucinacion y sesgos: heredados integramente de Qwen3-8B, ya que la verificacion garantiza la distribucion del objetivo; el borrador no los introduce ni los corrige.
- Idiomas soportados no documentados en la model card; dependen del objetivo y de los datos de entrenamiento, mayoritariamente en ingles.
- La licencia Apache-2.0 del borrador convive con el aviso MIT de z-lab/Qwen3-8B-DFlash-b16, que aplica a los pesos de partida; conviene revisar ambas condiciones para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- No se han publicado mediciones de latencia absoluta, throughput ni consumo de VRAM del par completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhhhhhy5/MFD-Qwen3-8B-100K
- Modelo base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Paper: https://arxiv.org/abs/2611.13017
- Codigo: https://github.com/hhhhhhy5/multi-future-drafting
- Pagina del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Dataset de prompts (espejo publico): https://huggingface.co/TY233/qwen3-4b-instruct-100k-backup
