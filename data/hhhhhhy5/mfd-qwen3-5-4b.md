# hhhhhhy5/MFD-Qwen3.5-4B

## Resumen

MFD-Qwen3.5-4B es un modelo borrador (*draft model*) para decodificación especulativa, desarrollado por hhhhhhy5 (Haoyu Huang y colaboradores, segun la cita del paper). No es un modelo generativo autonomo: se acopla al modelo objetivo Qwen/Qwen3.5-4B en modo *thinking* para acelerar su inferencia mediante decodificación especulativa verificada por arbol. Implementa la tecnica Multi-Future Drafting (MFD), presentada en el paper arXiv:2611.13017, que introduce K = 8 embeddings de modo aprendidos para proponer ocho futuros coherentes del mismo bloque en una sola pasada forward.

Arquitectonicamente es un DFlash drafter de 6 capas y anchura 2560 que lee los estados ocultos de las capas [1, 5, 9, 13, 17, 21, 25, 29] del modelo objetivo, con un bloque de 16 tokens (15 posiciones borradoradas). Tiene 634 millones de parametros en bf16 y reutiliza en tiempo de ejecucion el embedding y la LM head del objetivo, que no se almacenan en el repositorio. Se inicializa desde z-lab/Qwen3.5-4B-DFlash y se afina sobre 1,42 millones de prompts de mlabonne/open-perfectblend.

Su relevancia es practica: segun los resultados del paper, alcanza un speedup medio de 7,78x (longitud de aceptacion tau = 10,72) con temperatura 0 y 5,18x (tau = 7,23) con temperatura 1, frente a los 4,85x y 3,29x del drafter DFlash original. La verificacion por arbol garantiza que la salida sea exactamente la del modelo objetivo, por lo que la aceleracion es sin perdida de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (transformer borrador) con 6 capas de anchura 2560; lee capas [1, 5, 9, 13, 17, 21, 25, 29] del objetivo; bloque de 16 (15 posiciones borradoradas); 8 mode embeddings (8 x 2560) y una puerta lineal (mode_gate, no usada en inferencia) |
| Parametros totales | 634.448.896 (634M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de hasta 3072 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code; requiere el codigo del repositorio GitHub) |

## Arquitectura y entrenamiento

El modelo es un borrador de bloques tipo DFlash: seis capas de anchura 2560 que consumen los estados ocultos de ocho capas intermedias del objetivo (Qwen3.5-4B) y proponen un bloque de 16 tokens, de los cuales 15 son posiciones borradoradas. La innovacion de MFD es la incorporacion de K = 8 embeddings de modo en la entrada: los ocho modos generan simultaneamente el bloque en una unica pasada forward, cada uno representando un futuro coherente distinto. A partir de ellos se construye un arbol de borradores mixto que conserva los B prefijos con mayor log-probabilidad del mejor modo, y el modelo objetivo verifica el arbol en una sola pasada con verificacion de arbol estandar, lo que hace la decodificacion sin perdida. El presupuesto de arbol usado en los resultados es B = 256.

El entrenamiento parte de z-lab/Qwen3.5-4B-DFlash y usa los 1,42 millones de prompts de mlabonne/open-perfectblend, con respuestas regeneradas por Qwen3.5-4B en modo thinking (T = 0,7, top-p 0,8, top-k 20, maximo 3072 tokens nuevos). Se realizan 3 epocas con AdamW, learning rate 1e-4 (4% warmup, coseno), gradient clipping 1, secuencias de hasta 3072 tokens, 36 secuencias por paso y 64 bloques ancla por secuencia x 8 modos. El objetivo es un *relaxed winner-take-all* sobre los 8 modos (el modo con mayor cobertura suave de un bloque recibe peso 0,9 y los demas 0,1/7), con perdida D-PACE (suavizado 0,5) por modo y entropia cruzada de la puerta con peso 0,1.

## Capacidades

- Aceleracion de inferencia del modelo objetivo Qwen/Qwen3.5-4B mediante decodificacion especulativa verificada por arbol, sin alterar la distribucion de salida.
- Borrador multi-futuro: ocho modos generan candidatos en una sola pasada, lo que permite construir un arbol de borradores mas rico que un borrador de cadena.
- Verificacion de arbol exacta con los kernels de `inference/hf/qwen35_tree.py` para objetivos hibridos Gated-DeltaNet.
- Soporte de decodificacion greedy (temperature = 0) y con temperatura, con presupuesto de arbol configurable (B = 256 en los resultados publicados).
- Integracion con Hugging Face Transformers (via el codigo del repositorio) y con `attn_implementation="sdpa"`.
- Capacidades generativas: no dispone de ellas por si mismo; hereda las del objetivo (razonamiento en modo thinking, generacion de texto, matematicas, codigo), ya que la salida final es la del modelo objetivo.
- No soporta tool calling, agentes ni vision por cuenta propia; cualquier capacidad de ese tipo depende del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion de Qwen3.5-4B: desplegar el par objetivo + borrador en lugar del objetivo solo, obteniendo hasta 7,78x de speedup con temperatura 0 en tareas de razonamiento y codigo, con salida identica a la del objetivo.
- Servicio de chat interactivo en modo thinking: con temperatura 1 el speedup medio es de 5,18x, lo que reduce la latencia percibida en asistentes conversacionales que usan Qwen3.5-4B con razonamiento extendido.
- Generacion de codigo de baja latencia: los benchmarks del paper incluyen HumanEval y MBPP, donde el arbol de borradores mantiene una longitud de aceptacion alta, adecuado para autocompletado o generacion en IDE.
- Razonamiento matematico por lotes: GSM8K y MATH-500 forman parte de la evaluacion; util para pipelines de resolucion de problemas donde el cuello de botella es la decodificacion autoregresiva.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: el repositorio permite reproducir DFlash chain, DDTree y MFD sobre el mismo objetivo y datos, sirviendo como banco de pruebas para investigacion.
- Despliegue en una unica GPU de gama alta: los resultados se miden con batch size 1 en una NVIDIA RTX PRO 6000 Blackwell, un escenario realista para prototipos y servicios de baja concurrencia.
- Investigacion sobre borradores multi-modo: la arquitectura con 8 embeddings de modo y la puerta lineal (no usada en inferencia) es un punto de partida para experimentos con mezclas de borradores.

## Benchmarks y rendimiento

Resultados del paper (Hugging Face Transformers, batch size 1, NVIDIA RTX PRO 6000 Blackwell; media sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench; B = 256; cada celda es el speedup sobre decodificacion autoregresiva con la longitud de aceptacion tau entre parentesis):

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (drafter publicado) | 4,85x (6,25) | 3,29x (4,23) |
| DDTree (drafter publicado) | 6,53x (8,78) | 4,77x (6,51) |
| D-PACE + DDTree, mismos datos, 3 epocas | 7,31x (9,82) | 4,74x (6,46) |
| Este drafter (arbol MFD) | 7,78x (10,72) | 5,18x (7,23) |

## Requisitos de hardware

- VRAM estimada para el borrador: 634M parametros en bf16 equivalen a aproximadamente 1,3 GB de pesos; el repositorio ocupa 1,3 GB. A ello se suma la memoria del modelo objetivo Qwen3.5-4B y las activaciones del arbol (B = 256).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell es la usada en las mediciones del paper. Por el perfil de memoria, una RTX 4090 (24 GB) o superior deberia poder alojar el par objetivo + borrador en bf16, aunque no hay mediciones publicadas en esa GPU.
- Cabe en GPU de consumo: el borrador por si solo si; el conjunto objetivo + borrador requiere comprobar el presupuesto de memoria del objetivo y del arbol.
- Opciones de despliegue: el codigo del repositorio GitHub (inferencia Hugging Face en `inference/hf`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican valores absolutos de latencia o throughput, solo speedups relativos (7,78x a T = 0 y 5,18x a T = 1, batch size 1).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MFD-Qwen3.5-4B (este) | Borrador MFD, 8 modos | 634M | no disponible | 7,78x / 5,18x (T = 0 / 1) | Apache-2.0 | Hugging Face + GitHub |
| z-lab/Qwen3.5-4B-DFlash | Borrador DFlash (inicializacion) | 634M (misma base) | no disponible | DFlash chain: 4,85x / 3,29x | Apache-2.0 | Hugging Face |
| DDTree (drafter publicado) | Borrador con arbol | no disponible | no disponible | 6,53x / 4,77x | no disponible | no disponible |
| D-PACE + DDTree (mismos datos) | Borrador con arbol, misma receta | no disponible | no disponible | 7,31x / 4,74x | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta atado a su objetivo: lee los estados ocultos de Qwen/Qwen3.5-4B y usa su embedding y LM head, por lo que no funciona con otro modelo.
- Las mediciones son a batch size 1 en el arnés de Hugging Face, el unico camino del repositorio que sirve este objetivo hibrido; no hay datos de escalado a lotes mayores.
- Los objetivos hibridos Gated-DeltaNet solo se sirven por la ruta de Hugging Face, con los kernels de arbol de `inference/hf/qwen35_tree.py`.
- Requiere `custom_code` y el codigo del repositorio GitHub; no es un modelo cargable con `AutoModelForCausalLM` estandar.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion propios: al ser un borrador verificado, la salida es la del objetivo y hereda sus sesgos y limitaciones.
- No se publican datos de cuantizacion; los pesos estan en bf16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- La licencia es Apache-2.0, pero se mantiene el aviso de z-lab/Qwen3.5-4B-DFlash sobre los pesos de partida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhhhhhy5/MFD-Qwen3.5-4B
- Modelo base (inicializacion): https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2611.13017
- Codigo: https://github.com/hhhhhhy5/multi-future-drafting
- Pagina del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
