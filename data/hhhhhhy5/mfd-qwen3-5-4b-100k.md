# hhhhhhy5/MFD-Qwen3.5-4B-100K

## Resumen

MFD-Qwen3.5-4B-100K es un modelo borrador (draft model) para decodificacion especulativa con verificacion por arbol, disenado especificamente para acelerar la inferencia del modelo objetivo Qwen/Qwen3.5-4B en modo thinking. Lo desarrolla Haoyu Huang (usuario hhhhhhy5) y se presenta junto al articulo "Multi-Future Drafting: Mixture Block Drafters for Tree-Verified Speculative Decoding" (arXiv:2611.13017). No es un modelo de proposito general: no genera respuestas por si mismo, sino que propone bloques de tokens que el modelo objetivo verifica en una sola pasada.

La innovacion central es el Multi-Future Drafting (MFD): el borrador es un DFlash block drafter con K = 8 embeddings de modo aprendidos en su entrada. Los ocho modos proponen simultaneamente ocho futuros coherentes para el mismo bloque en una unica pasada forward; despues se construye un arbol de mezcla que conserva los B prefijos con mayor log-probabilidad del mejor modo, y el modelo objetivo verifica el arbol completo. Como la verificacion es la estandar por arbol, la decodificacion es sin perdida: la salida final es exactamente la del modelo objetivo.

El modelo tiene 634 millones de parametros en bf16 y una arquitectura DFlash de 6 capas de anchura 2560 que lee las capas ocultas [1, 5, 9, 13, 17, 21, 25, 29] del objetivo, con bloques de 16 posiciones (15 borradoras). Se inicializa desde z-lab/Qwen3.5-4B-DFlash y se afina sobre 100.000 prompts. Su relevancia practica es directa: en los resultados del paper alcanza un speedup de 7,31x sobre decodificacion autorregresiva con temperatura 0, frente a los 6,53x de DDTree con el borrador original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (block drafter con 8 mode embeddings); 6 capas de anchura 2560; lee capas del objetivo [1, 5, 9, 13, 17, 21, 25, 29]; bloque de 16 (15 posiciones borradoras) |
| Parametros totales | 634.448.896 (634M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 3072 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con custom_code |
| Modelo objetivo | Qwen/Qwen3.5-4B (modo thinking) |
| Modelo base | z-lab/Qwen3.5-4B-DFlash (Apache-2.0) |
| Tamano del repositorio | 1,3 GB |
| Presupuesto de arbol | B = 256 (mejor presupuesto para este objetivo segun el paper) |

## Arquitectura y entrenamiento

El borrador es un DFlash block drafter: seis capas transformer de anchura 2560 que consumen las representaciones ocultas del modelo objetivo en las capas 1, 5, 9, 13, 17, 21, 25 y 29, y proponen un bloque de 16 posiciones (15 borradoras). La modificacion clave de MFD es la incorporacion de K = 8 embeddings de modo (`mode_embed`, 8 x 2560) en la entrada, de forma que los ocho modos generan en la misma pasada forward ocho futuros alternativos y coherentes del bloque. Un `mode_gate` lineal (8 x 2560) se usa solo durante el entrenamiento. En inferencia, un arbol de mezcla conserva los B prefijos con mayor log-probabilidad del mejor modo y el objetivo verifica el arbol en una pasada mediante kernels de verificacion por arbol.

El entrenamiento parte de z-lab/Qwen3.5-4B-DFlash y usa los prompts de las 99.987 muestras que los autores de DFlash publicaron para Qwen3-4B (procedentes de NVIDIA Nemotron post-training data, OpenCodeInstruct, OpenR1-Math y Evol-CodeAlpaca), con respuestas regeneradas por Qwen3.5-4B en modo thinking (T = 0,7, top-p 0,8, top-k 20, maximo 3072 tokens nuevos). Se realizaron 3 epocas con AdamW, learning rate 1e-4 (warmup del 4%, decaimiento coseno), clipping de gradiente 1, secuencias de hasta 3072 tokens, 12 secuencias por paso y 64 bloques ancla por secuencia x 8 modos. El objetivo es un winner-take-all relajado sobre los 8 modos (el modo con mayor cobertura suave de un bloque recibe peso 0,9; los demas 0,1/7), cada modo entrenado con la perdida D-PACE (suavizado 0,5) y una entropia cruzada de la compuerta con peso 0,1.

## Capacidades

- Borrador de tokens para decodificacion especulativa: propone bloques de 15 posiciones que el modelo objetivo Qwen3.5-4B verifica en una sola pasada.
- Multi-future drafting: genera 8 futuros alternativos por bloque en una unica pasada forward mediante embeddings de modo.
- Construccion de arbol de mezcla: selecciona los B = 256 mejores prefijos por log-probabilidad del mejor modo.
- Decodificacion sin perdida: la verificacion por arbol garantiza que la salida final es identica a la del modelo objetivo.
- Soporte de temperatura 0 (greedy) y temperatura 1 en los resultados publicados.
- Integracion con objetivos hibridos Gated-DeltaNet a traves de la ruta de Hugging Face del repositorio (kernels de arbol en `inference/hf/qwen35_tree.py`).
- No soporta tool calling, agentes, vision ni audio por si mismo: hereda las capacidades del objetivo al que acelera.

## Casos de uso

- Aceleracion de inferencia en produccion de Qwen3.5-4B: desplegar el par objetivo + borrador para reducir la latencia por token hasta 7,31x con temperatura 0, manteniendo exactamente la misma distribucion de salida que el modelo objetivo.
- Servicio de razonamiento en modo thinking: al acelerar la generacion de cadenas de razonamiento largas (hasta 3072 tokens en entrenamiento), reduce el coste de los escenarios de math y logica donde el modelo objetivo emite muchos tokens de pensamiento.
- Generacion de codigo de baja latencia: los benchmarks del paper incluyen HumanEval y MBPP; el borrador esta entrenado con datos de OpenCodeInstruct y Evol-CodeAlpaca, por lo que es adecuado para asistentes de codigo interactivos.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia reproducible (mismo objetivo, mismo presupuesto de arbol B = 256) frente a DFlash chain y DDTree.
- Investigacion en decodificacion especulativa: la arquitectura de multiples futuros y el objetivo winner-take-all relajado son un punto de partida para experimentar con nuevos esquemas de arbol y modos.
- Despliegue en una sola GPU para prototipos: con 634M parametros en bf16 (aproximadamente 1,3 GB de pesos) y el objetivo de 4B, el par cabe en GPUs profesionales de una sola tarjeta, lo que facilita la experimentacion sin infraestructura distribuida.
- Reduccion de coste energetico en batch size 1: el escenario medido (batch 1, una RTX PRO 6000 Blackwell) es representativo de asistentes interactivos con un unico usuario, donde el speedup se traduce directamente en menor tiempo de respuesta.

## Benchmarks y rendimiento

Resultados del paper (Hugging Face Transformers, batch size 1, una NVIDIA RTX PRO 6000 Blackwell). Cada celda es el speedup sobre decodificacion autorregresiva con la longitud de aceptacion tau entre parentesis, media sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench. Todos los arboles usan B = 256.

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (borrador publicado) | 4,85x (6,25) | 3,29x (4,23) |
| DDTree (borrador publicado) | 6,53x (8,78) | 4,77x (6,51) |
| D-PACE + DDTree, mismos datos, 1 epoca | 6,96x (9,37) | 4,67x (6,37) |
| D-PACE + DDTree, mismos datos, 3 epocas | 6,97x (9,38) | 4,66x (6,35) |
| **Este borrador (arbol MFD)** | **7,31x (10,07)** | **5,04x (7,03)** |

No se han publicado resultados desglosados por benchmark individual en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos del borrador ocupan aproximadamente 1,3 GB en bf16; el objetivo Qwen3.5-4B anade su propio peso (no disponible en la informacion proporcionada, pero en el orden de 8 GB en bf16 para 4B parametros). El borrador reutiliza el embedding y el LM head del objetivo, por lo que no los almacena.
- GPU recomendadas: el paper mide en una NVIDIA RTX PRO 6000 Blackwell. Cualquier GPU con suficiente VRAM para el objetivo en bf16 deberia servir; no se han publicado mediciones en otras GPU.
- GPU de consumo: no hay datos publicados sobre modelos concretos de consumo; el par objetivo + borrador en bf16 probablemente supera los 16 GB, por lo que no se confirma su encaje en GPUs de consumo de gama alta.
- Opciones de despliegue: el borrador requiere el codigo de https://github.com/hhhhhhy5/multi-future-drafting (ruta `inference/hf` con `ddtree_generate`, `enable_cpp_tree` y `enable_mode_attention`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el unico dato publicado es el speedup relativo (7,31x a T = 0 y 5,04x a T = 1, batch size 1). No se publican valores absolutos de tokens por segundo ni latencia en milisegundos.
- Limitacion de despliegue: los objetivos hibridos Gated-DeltaNet solo se sirven por la ruta de Hugging Face, la unica del repositorio que soporta este objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Speedup publicado (T = 0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MFD-Qwen3.5-4B-100K (este) | 634M | no disponible | 7,31x (tau 10,07) | Apache-2.0 | Hugging Face, 0 descargas |
| z-lab/Qwen3.5-4B-DFlash | no disponible | no disponible | 4,85x como cadena / 6,53x con DDTree | Apache-2.0 | Hugging Face (modelo base) |
| D-PACE + DDTree (mismos datos, 3 epocas) | no disponible | no disponible | 6,97x (tau 9,38) | no disponible | resultados del paper, no se indica publicacion de pesos |

La comparativa se limita a los metodos evaluados en el paper; no se dispone de datos de otros borradores alternativos para Qwen3.5-4B en la informacion proporcionada.

## Limitaciones y advertencias

- El borrador esta atado a su objetivo: lee los estados ocultos de Qwen/Qwen3.5-4B y usa su embedding y LM head; no funciona con otro modelo.
- Mediciones realizadas unicamente a batch size 1 en el harness de Hugging Face; no hay datos de rendimiento en batch mayor ni en otros frameworks de serving.
- No se documentan sesgos especificos, pero al heredar la distribucion del objetivo, cualquier sesgo de Qwen3.5-4B se refleja en la salida verificada.
- Riesgo de alucinacion: no aplica al borrador en si, ya que la verificacion por arbol es sin perdida y la salida es la del objetivo; el riesgo de alucinacion es el del modelo objetivo.
- Idiomas soportados no documentados; el rendimiento en idiomas distintos del ingles no se ha medido en los benchmarks publicados (GSM8K, MATH-500, HumanEval, MBPP y MT-Bench estan en ingles).
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (11 de noviembre de 2026): no hay evidencia de uso en produccion ni validacion independiente.
- El modelo base de inicializacion z-lab/Qwen3.5-4B-DFlash es tambien Apache-2.0 y su aviso se aplica a los pesos de partida; las respuestas de entrenamiento fueron generadas por Qwen/Qwen3.5-4B (Apache-2.0), con prompts de NVIDIA Nemotron-Post-Training-Dataset-v2 (CC-BY-4.0), nvidia/OpenCodeInstruct (CC-BY-4.0), open-r1/OpenR1-Math-220k (Apache-2.0) y theblackcat102/evol-codealpaca-v1 (Apache-2.0).
- El dataset original de prompts (`z-lab/qwen3-4b-instruct-100k`) ya no es publico; solo existe un espejo de terceros (`TY233/qwen3-4b-instruct-100k-backup`), lo que complica la reproduccion exacta.
- Requiere `custom_code` y el repositorio de GitHub para ejecutarse; no es un modelo cargable directamente con `AutoModelForCausalLM` estandar.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe cumplir tambien las condiciones del modelo objetivo y de los datos de entrenamiento citados.

## Enlaces

- Hugging Face: https://huggingface.co/hhhhhhy5/MFD-Qwen3.5-4B-100K
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2611.13017
- Codigo: https://github.com/hhhhhhy5/multi-future-drafting
- Pagina del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Espejo del dataset de prompts: https://huggingface.co/TY233/qwen3-4b-instruct-100k-backup
