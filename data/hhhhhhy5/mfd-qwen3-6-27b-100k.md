# hhhhhhy5/MFD-Qwen3.6-27B-100K

## Resumen

MFD-Qwen3.6-27B-100K es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por el usuario hhhhhhy5, que acelera la inferencia de Qwen/Qwen3.6-27B en modo thinking. No es un modelo de lenguaje autonomo: se trata de un DFlash drafter de 1730 millones de parametros que lee los estados ocultos del modelo objetivo y predice bloques de tokens que el objetivo verifica en una sola pasada. Su innovacion central es el Multi-Future Drafting (MFD): incorpora K = 8 embeddings de modo aprendidos en su entrada, de forma que los 8 modos redactan el bloque en el mismo forward pass, cada uno como una continuacion coherente distinta.

El modelo parte de z-lab/Qwen3.6-27B-DFlash (MIT) y se ha afinado sobre 99.987 prompts del conjunto liberado por los autores de DFlash para Qwen3-4B, con respuestas regeneradas por Qwen3.6-27B en modo thinking. La verificacion del arbol es la estandar, por lo que la decodificacion es sin perdida: la salida es exactamente la del modelo objetivo.

Su relevancia es practica: en la evaluacion del paper (batch size 1, una NVIDIA RTX PRO 6000 Blackwell, media sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench) alcanza 6,77x de speedup con temperatura 0 y 5,94x con temperatura 1, frente a 5,89x y 5,27x del DDTree sobre el drafter original. Es, por tanto, una pieza de infraestructura de inferencia mas que un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter con Multi-Future Drafting: 5 capas de anchura 5120 que leen las capas [1, 16, 31, 46, 61] del objetivo; bloque de 16 (15 posiciones redactadas); 8 embeddings de modo (8 x 5120) y una puerta lineal (no usada en inferencia) |
| Parametros totales | 1.730.259.200 (bf16) |
| Parametros activos | no disponible (no es MoE; los 8 modos se procesan en el mismo forward pass) |
| Longitud de contexto | no disponible como valor propio; entrenado con secuencias de hasta 3072 tokens y disenado para el objetivo Qwen3.6-27B |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con aviso MIT heredado de z-lab/Qwen3.6-27B-DFlash sobre los pesos de partida) |
| Formato de pesos | safetensors con custom_code |

## Arquitectura y entrenamiento

El drafter es un DFlash de 5 capas y anchura 5120 que consume los estados ocultos de cinco capas intermedias del objetivo (1, 16, 31, 46 y 61) y predice un bloque de 16 tokens (15 posiciones redactadas). La novedad MFD anade 8 embeddings de modo de dimension 5120 en la entrada: los 8 modos generan el bloque completo en una unica pasada, cada uno representando un futuro coherente distinto. Sobre esas 8 propuestas se construye un arbol de mezcla que conserva los B prefijos con mayor log-probabilidad del mejor modo, y el modelo objetivo verifica el arbol en una sola pasada con verificacion de arbol estandar, lo que garantiza que la salida sea la del objetivo. La puerta lineal (mode_gate) existe en los pesos pero no se usa en inferencia.

El entrenamiento usa 99.987 prompts provenientes de NVIDIA Nemotron post-training data, OpenCodeInstruct, OpenR1-Math y Evol-CodeAlpaca, con respuestas regeneradas por Qwen3.6-27B en modo thinking (temperatura 0,7, top-p 0,8, top-k 20, maximo 3072 tokens nuevos, conservando las respuestas truncadas a esa longitud). Se realizaron 3 epocas con AdamW, learning rate 1e-4 (warmup del 4%, decaimiento coseno), clipping de gradiente 1, secuencias de hasta 3072 tokens, 12 secuencias por paso y 64 bloques ancla por secuencia por 8 modos. El objetivo es un winner-take-all relajado sobre los 8 modos (el modo con mayor cobertura suave de un bloque recibe peso 0,9; el resto 0,1/7), cada modo entrenado con la perdida D-PACE (suavizado 0,5) mas una entropia cruzada de la puerta con peso 0,1.

## Capacidades

- Aceleracion de decodificacion especulativa sin perdida para Qwen/Qwen3.6-27B en modo thinking: la salida final es identica a la del objetivo.
- Redaccion multi-futuro: 8 modos generan simultaneamente 8 continuaciones candidatas del mismo bloque de 15 posiciones.
- Construccion de arbol de mezcla con presupuesto configurable (B = 64 en la evaluacion del paper).
- Verificacion de arbol en una sola pasada por parte del objetivo.
- Integracion con el harness de Hugging Face Transformers del repositorio de codigo, incluido el soporte de objetivos hibridos Gated-DeltaNet mediante los kernels de arbol de inference/hf/qwen35_tree.py.
- No soporta generacion autonoma, tool calling, agentes ni capacidades multilingues propias: hereda el comportamiento del objetivo al que acelera.

## Casos de uso

- Servicio de inferencia de Qwen3.6-27B en produccion: desplegar el drafter junto al objetivo para reducir la latencia por token en un factor cercano a 6x con temperatura 0, manteniendo exactamente la misma distribucion de salida.
- Razonamiento matematico interactivo: con contexto de cadenas de pensamiento largas (hasta 4096 tokens nuevos en el ejemplo de uso), el drafter acelera la generacion de pasos intermedios en tareas tipo GSM8K y MATH-500, donde el paper reporta parte de sus mejores resultados.
- Generacion de codigo en asistentes de IDE: HumanEval y MBPP forman parte del conjunto de evaluacion; el drafter reduce el tiempo hasta el primer bloque completo en autocompletado y explicaciones de codigo.
- Chat multi-turno de baja latencia: MT-Bench esta en la evaluacion, y el modo thinking del objetivo se mantiene, por lo que sirve para asistentes conversacionales que necesitan respuestas largas con razonamiento visible.
- Investigacion en decodificacion especulativa: el codigo y los pesos permiten reproducir y extender los experimentos de MFD, comparar presupuestos de arbol y estudiar el efecto de los modos en la longitud de aceptacion.
- Evaluacion de pipelines de inferencia: util para medir el impacto real de un drafter en un harness concreto (batch size 1 en el caso publicado) antes de adoptarlo en un servicio mayor.
- Fine-tuning de drafters sobre datos propios: al ser Apache-2.0 y partir de un DFlash MIT, sirve como punto de partida para adaptar la aceleracion a dominios especificos regenerando respuestas con el objetivo.

## Benchmarks y rendimiento

Resultados del paper, con Transformers de Hugging Face, batch size 1 y una NVIDIA RTX PRO 6000 Blackwell. Cada celda es el speedup sobre decodificacion autorregresiva con la longitud de aceptacion tau entre parentesis, como media sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con B = 64.

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (drafter publicado) | 4,66x (5,81) | 4,04x (5,04) |
| DDTree (drafter publicado) | 5,89x (7,62) | 5,27x (6,86) |
| D-PACE + DDTree, mismos datos, 1 epoca | 6,43x (8,31) | 5,52x (7,19) |
| D-PACE + DDTree, mismos datos, 3 epocas | 6,46x (8,35) | 5,50x (7,17) |
| Este drafter (arbol MFD) | 6,77x (8,91) | 5,94x (7,87) |

## Requisitos de hardware

- El drafter almacena 1730 millones de parametros en bf16 (repo de 3,5 GB); a esto se suma el objetivo Qwen3.6-27B, que domina el consumo de VRAM.
- La evaluacion publicada se realizo en una NVIDIA RTX PRO 6000 Blackwell; no se han publicado cifras para otras GPU.
- VRAM estimada para el drafter solo: aproximadamente 3,5 GB en bf16; no se han publicado variantes cuantizadas.
- No cabe en GPU de consumo como un sistema completo, porque requiere cargar simultaneamente el objetivo de 27B; el drafter por si solo si cabria en tarjetas de 8 GB o mas.
- Opciones de despliegue: el codigo propio del repositorio (inference/hf con Transformers) es la unica ruta publicada para este objetivo hibrido; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo, solo los speedups relativos de la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (T = 0 / T = 1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MFD-Qwen3.6-27B-100K (este) | 1730M | no disponible | 6,77x / 5,94x | Apache-2.0 | Hugging Face, 0 descargas |
| z-lab/Qwen3.6-27B-DFlash (base) | no disponible | no disponible | 4,66x / 4,04x (cadena) | MIT | Hugging Face |
| DFlash + DDTree (drafter publicado) | no disponible | no disponible | 5,89x / 5,27x | no disponible | Hugging Face |
| D-PACE + DDTree (mismos datos) | no disponible | no disponible | 6,46x / 5,50x | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ha medido con batch size 1 en el harness de Hugging Face, la unica ruta del repositorio que sirve este objetivo hibrido; no hay datos para batch mayor ni para otros motores de inferencia.
- El drafter esta atado a su objetivo: lee los estados ocultos de Qwen3.6-27B y usa su embedding y su LM head, por lo que no funciona con otros modelos.
- No es un modelo generativo autonomo: no debe evaluarse como modelo de chat, codigo o razonamiento por separado.
- Riesgo de alucinacion y sesgos: no aplica de forma directa porque la verificacion garantiza la salida del objetivo, pero el drafter hereda los sesgos del modelo base con el que se generaron las respuestas de entrenamiento.
- Idiomas soportados no documentados; el comportamiento linguistico depende enteramente del objetivo.
- Restricciones de licencia: Apache-2.0 para este drafter, con la nota MIT de z-lab/Qwen3.6-27B-DFlash aplicable a los pesos de partida; los datos de prompt tienen licencias CC-BY-4.0 y Apache-2.0 que conviene revisar en uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, con creacion y actualizacion el mismo dia; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/hhhhhhy5/MFD-Qwen3.6-27B-100K
- Modelo base: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.6-27B
- Paper: https://arxiv.org/abs/2611.13017
- Codigo: https://github.com/hhhhhhy5/multi-future-drafting
- Pagina del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Mirror de los prompts de entrenamiento: https://huggingface.co/TY233/qwen3-4b-instruct-100k-backup
