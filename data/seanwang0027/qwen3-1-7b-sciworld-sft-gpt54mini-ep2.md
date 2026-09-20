# SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2

## Resumen

`qwen3-1.7b-sciworld-sft-gpt54mini-ep2` es un ajuste fino supervisado (SFT) del modelo denso Qwen3-1.7B, publicado por el usuario SeanWang0027, orientado a agentes que resuelven tareas del entorno interactivo ScienceWorld. El modelo no es un asistente conversacional de propósito general: es un checkpoint intermedio (época 2 de 3, paso 128 de 192) entrenado para emitir turnos en formato ReAct (`Thought:` seguido de `Action:`) sobre observaciones textuales del simulador. El repositorio ocupa 4,1 GB y contiene 2.031.739.904 parámetros en safetensors bf16 bajo licencia Apache 2.0.

El interés técnico está en su metodología: el autor destila trayectorias completas generadas por `gpt-5.4-mini` (OpenAI API, `reasoning_effort=medium`) sobre las variaciones de entrenamiento de ScienceWorld. Se recopilaron 2059 episodios completos de como máximo 30 turnos, con una tasa de éxito del profesor del 41,96 % y 46.035 turnos supervisados, sin filtrar episodios fallidos ni acciones rechazadas. La pérdida entrópica se calcula únicamente sobre la respuesta visible del profesor y su token `<|im_end|>`.

Es relevante sobre todo como pieza de investigación en agentes pequeños: el modelo base Qwen3-1.7B obtiene un 0,12 % de éxito en el conjunto de test de ScienceWorld, mientras que este checkpoint alcanza un 13,25 % ± 2,56 (media de 4 pasadas). El autor documenta además un fenómeno degenerado muy concreto: el 74,20 % de los turnos del estudiante reproducen literalmente la plantilla `open/close OBJ`, que el simulador rechaza siempre, un hábito heredado del profesor, que lo hace en el 29,89 % de sus propios turnos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), sin mezcla de expertos |
| Parametros totales | 2.031.739.904 (2,03 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens heredados del base Qwen3-1.7B; no confirmado en la model card. El entrenamiento uso `max_length` 8192 |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16/safetensors; no hay GGUF, AWQ ni GPTQ oficiales de este ajuste) |
| Idiomas soportados | no disponible en la ficha; las 2059 trayectorias de entrenamiento estan integramente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); libreria `transformers` |
| Tamano del repositorio | 4,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Fecha de publicacion | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso con Grouped Query Attention, preentrenado por Alibaba Qwen. Este repositorio no modifica la arquitectura; es un ajuste por supervisión completa (full fine-tuning, no LoRA) cuyos pesos se almacenan en bf16. La model card no detalla la composicion del dataset de preentrenamiento ni si el base paso por RLHF o DPO; esa informacion pertenece a la ficha de Qwen3-1.7B.

El ajuste se hizo sobre 2059 episodios completos de ScienceWorld, una fila por episodio, con entropia cruzada calculada exclusivamente sobre la respuesta del profesor y su `<|im_end|>` (los tokens de observacion y de prompt no contribuyen a la perdida). Se trata de un unico entrenamiento de 3 epocas y 192 pasos: batch 32, AdamW con `lr` 1e-5, `weight_decay` 0, scheduler coseno con 10 % de warmup sobre los 192 pasos, entrenamiento en fp32 y longitud maxima de 8192. Este checkpoint concreto es el paso 128 y, al ser un punto intermedio, no ha visto la decaida completa del learning rate. No hay filtrado ni enmascarado de datos: se incluyen episodios fallidos y acciones rechazadas por el simulador. La innovacion metodologica del estudio es la comparacion entre SFT puro y ROSE (una variante de ajuste en linea), y la documentacion explicita de como el ruido de evaluacion (±3 puntos aproximadamente) y los habitos degenerados del profesor condicionan las cifras finales.

## Capacidades

- Generacion de texto en formato ReAct estricto: produce turnos con la estructura `Thought:\n...\n\nAction:\n<un comando>`, tal y como exige el simulador ScienceWorld.
- Razonamiento secuencial multi-turno en entornos interactivos de texto: mantiene el estado de la tarea a lo largo de hasta 30 turnos con una observacion por turno de usuario.
- Planificacion de experimentos cientificos dentro del dominio de ScienceWorld (manipulacion de objetos, medicion de propiedades, aplicacion de procedimientos).
- Ejecucion de acciones simbolicas mediante comandos textuales (`open`, `close`, `pick up`, `activate`, `mix`, `measure`, etc.), no mediante tool calling estructurado en JSON.
- Capacidad de agente: el modelo actua como politica de decision, no como asistente conversacional.
- Capacidades multilingues: no declaradas; el entrenamiento es solo en ingles y el modo `thinking` esta desactivado por diseno.
- No dispone de vision, audio, ni modo de pensamiento explicito (`enable_thinking=False` es obligatorio en el formato de prompt).

## Casos de uso

- Investigacion en agentes sobre entornos interactivos: sirve como linea base reproducible para ScienceWorld, con la ventaja de que el autor publica la tasa de exito, el Avg@1 y el numero de pasadas de evaluacion, lo que permite comparaciones estadisticamente honestas frente a nuevos metodos.
- Estudio de destilacion de trayectorias: permite analizar como se transfieren los sesgos del profesor (`gpt-5.4-mini`) al estudiante, en concreto el habito de emitir la plantilla `open/close OBJ` en el 74,20 % de los turnos, que el simulador rechaza siempre.
- Generacion de datos sinteticos de interaccion: el modelo puede usarse para producir rollouts etiquetados en formato ReAct sobre ScienceWorld que alimenten posteriores rondas de ajuste o de filtrado selectivo.
- Prototipado local de agentes en hardware de consumo: con 2,03 B de parametros y aproximadamente 4,1 GB de pesos en bf16, cabe en una GPU de 8 GB, lo que facilita experimentar con pipelines de agentes sin depender de APIs externas.
- Evaluacion comparativa de metodos de ajuste: al existir checkpoints hermanos de SFT y de ROSE en el mismo estudio, el modelo sirve como punto de control para medir el efecto del metodo de entrenamiento (SFT ep2 frente a ROSE ep4 o ep5) sobre la misma tarea.
- Ensenanza y divulgacion de agentes basados en LLM: su formato de prompt sencillo (plantilla de chat de Qwen3 con `enable_thinking=False` y una observacion por turno) lo hace util para explicar como se construye un bucle agente-entorno en un curso o taller.
- Simulacion educativa de laboratorio: con las debidas reservas por su baja tasa de exito, puede integrarse en demos de tutoria cientifica interactiva donde el objetivo sea mostrar el razonamiento paso a paso, no resolver la tarea de forma fiable.

## Benchmarks y rendimiento

Evaluacion sobre ScienceWorld test, 200 variaciones de tarea. Cada cifra es la media y la desviacion estandar de 4 pasadas independientes con temperatura 0,4, 512 tokens por turno, un maximo de 30 rondas, modo `thinking` desactivado y sin turno de sistema. Exito = puntuacion final 100; Avg@1 = puntuacion final media dividida entre 100.

| Metodo | Epoca | Tasa de exito | Avg@1 | Turnos con `open/close ...` literal |
|---|---|---|---|---|
| Qwen3-1.7B base | — | 0,12 % | no disponible | no disponible |
| SFT (este modelo) | 2 | 13,25 % ± 2,56 | 0,1574 | 74,20 % |
| SFT | 3 | 12,88 % ± 1,24 | 0,1557 | 74,88 % |
| ROSE 10+5 | 2 | 7,75 % ± 1,92 | 0,1455 | 62,68 % |
| ROSE 10+5 | 3 | 17,50 % ± 2,29 (re-ejecucion: 15,38 % ± 1,43) | 0,2942 (0,2512) | 35,22 % |
| ROSE 10+5 | 4 | 20,25 % ± 2,25 | 0,3433 | 17,98 % |
| ROSE 10+5 | 5 | 25,75 % ± 1,30 | 0,3692 | 2,77 % |
| ROSE 10+5 | 6 | 20,75 % ± 1,82 | 0,2946 | 26,59 % |

El propio autor advierte de que diferencias inferiores a unos 3 puntos estan dentro del ruido de evaluacion, y que el checkpoint de la epoca 3 de ROSE paso de 17,50 % a 15,38 % al reevaluarse con 4 pasadas nuevas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 4,1 GB solo para pesos en bf16, mas la cache KV. Con GQA y contexto de 8192 tokens la cache anade del orden de 0,9 GB, por lo que un despliegue comodo ronda los 5-6 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, e incluso en tarjetas de 8 GB (RTX 3070, RTX 4060) si se reduce la longitud de contexto o se cuantiza.
- GPU profesionales: no requiere A100 ni H100; una L4, A10G o T4 con 16 GB es suficiente para varias instancias concurrentes.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada), TGI (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y SGLang para servicio con batching. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, algo que el autor no ha publicado.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo por turno en la informacion proporcionada.
- Nota de formato: el modelo requiere la plantilla de chat de Qwen3 con `enable_thinking=False`; un prompt distinto degrada el comportamiento de forma notable.

## Comparativa con modelos similares

| Modelo | Parametros | Epoca | Exito en ScienceWorld test | Avg@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`sciworld-sft-gpt54mini-ep2`) | 2,03 B | 2 (paso 128/192) | 13,25 % ± 2,56 | 0,1574 | Apache 2.0 | HuggingFace, 0 descargas |
| `qwen3-1.7b-sciworld-sft-gpt54mini-3ep` | 2,03 B | 3 (final) | 12,88 % ± 1,24 | 0,1557 | Apache 2.0 | HuggingFace |
| `qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5` | 2,03 B | 5 | 25,75 % ± 1,30 | 0,3692 | Apache 2.0 | HuggingFace |
| `qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4` | 2,03 B | 4 | 20,25 % ± 2,25 | 0,3433 | Apache 2.0 | HuggingFace |
| Qwen3-1.7B base | 2,03 B | — | 0,12 % | no disponible | Apache 2.0 | HuggingFace |

Comparacion frente a otros agentes de proposito general o frente a modelos de tamano similar en otras tareas: no disponible, porque el autor solo publica resultados de ScienceWorld y no hay cifras comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: un 13,25 % de exito significa que el modelo falla aproximadamente 7 de cada 8 variaciones de tarea de ScienceWorld.
- Habito degenerado grave: el 74,20 % de sus turnos reproducen literalmente la plantilla `open/close OBJ`, que el simulador rechaza sistematicamente. Es una herencia directa del profesor y esta correlacionada con una peor tasa de exito.
- Ruido de evaluacion alto: el propio autor cifra en unos 3 puntos la horquilla de ruido entre evaluaciones, por lo que el 13,25 % frente al 12,88 % de la epoca 3 no es una diferencia significativa (IC 95 % [-2,12, 2,88]).
- Checkpoint intermedio: es el paso 128 de 192 con scheduler coseno, es decir, no ha completado la decaida de learning rate. No esta pensado como version final.
- Especializacion extrema: el modelo esta ajustado para un unico entorno (ScienceWorld) y un unico formato (ReAct con `enable_thinking=False`). Fuera de ese dominio cabe esperar un comportamiento degradado o inutil.
- Idiomas: no se declaran capacidades multilingues y todo el entrenamiento es en ingles. El uso en castellano no esta soportado ni evaluado.
- Sin alineacion adicional: no hay RLHF, DPO ni filtros de seguridad. Puede generar contenido inapropiado o inventar observaciones del entorno (alucinacion) en lugar de ejecutar una accion valida.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha; no hay informes independientes que reproduzcan las cifras.
- Caveat de procedencia de datos: las trayectorias de entrenamiento se generaron con la API de OpenAI (`gpt-5.4-mini`). Conviene revisar los terminos de uso de OpenAI sobre destilacion de sus salidas antes de un uso comercial, mas alla de que la licencia del modelo sea Apache 2.0.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base Qwen3-1.7B mantiene su propia licencia Apache 2.0, que debe respetarse en la redistribucion.
- Empaquetado limitado: no hay versiones cuantizadas publicadas, por lo que cualquier despliegue en 4 bits exige una conversion propia y una validacion posterior del comportamiento del agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint hermano SFT epoca 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep1
- Checkpoint hermano SFT epoca 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
- Checkpoint hermano ROSE epoca 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep1
- Checkpoint hermano ROSE epoca 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2
- Checkpoint hermano ROSE epoca 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
- Checkpoint hermano ROSE epoca 4: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4
- Checkpoint hermano ROSE epoca 5: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5
- Checkpoint hermano ROSE epoca 6: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a un comercio de caramelos sin ninguna relacion con el modelo, por lo que se descartan. No se dispone de paper, blog tecnico ni demo asociados a este ajuste.
