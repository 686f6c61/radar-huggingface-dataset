# ikimyaii/OPT-125M-semi-structured-EHWS-80pct

## Resumen

OPT-125M-semi-structured-EHWS-80pct es una variante podada del modelo facebook/opt-125m, un transformer decoder-only de 125 millones de parametros publicado originalmente por Meta. El autor del repositorio, ikimyaii, aplica una poda semi-estructurada del 80 % sobre todas las capas lineales internas de los bloques, manteniendo densos los embeddings y la cabeza de lenguaje. El resultado es un checkpoint que conserva la misma interfaz de `transformers` que el modelo original, pero con aproximadamente una quinta parte de los pesos en las capas podadas.

La relevancia del modelo es metodologica antes que practica: documenta un pipeline de poda en dos fases (una local tipo ALPS y otra global basada en ADMM con perdida de entropia cruzada y destilacion de conocimiento), con resultados de perplejidad y de evaluacion zero-shot medidos bajo el protocolo de ELSA. Sirve como referencia reproducible para investigar compresion de modelos pequenos y para comparar tecnicas de sparsity semi-estructurada frente al modelo denso de partida.

El checkpoint se publica en formato safetensors, ocupa 0,5 GB en el repositorio y no declara licencia, idiomas ni pipeline en la informacion disponible. Al tratarse de un derivado de OPT-125M, hereda la arquitectura y el tokenizador del original, pero no se han publicado datos sobre el proceso de alineacion ni sobre el comportamiento multilingue especifico de esta variante podada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT), con poda semi-estructurada en capas lineales |
| Parametros totales | 125.239.296 (checkpoint safetensors); sparsity medida 0,7997 en capas podadas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base OPT-125M usa 2.048 tokens) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (fp16 segun el protocolo de evaluacion descrito) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es el transformer decoder-only de OPT-125M, con 12 capas, atencion multi-cabeza y embeddings de 768 dimensiones. Sobre esa base, el autor aplica una poda semi-estructurada por filas: cada fila de cada capa lineal podada conserva el mismo numero de pesos (el 20 % superior), de modo que la densidad es uniforme dentro de cada fila. Las capas de embedding y `lm_head` permanecen densas. La sparsity medida sobre los pesos finales es de 0,7997, ligeramente por debajo del 80 % objetivo porque algunos pesos conservados son exactamente cero.

El entrenamiento de poda sigue un esquema de dos fases. La fase 1, local y de estilo ALPS, poda cada capa hasta el 70 % minimizando el error de reconstruccion `||(W - W0) X||^2`, con matrices de Hessian calculadas a partir de secuencias de calibracion de C4. La fase 2, global, aplica ADMM sobre la perdida de entropia cruzada del modelo completo mas destilacion de conocimiento, con un paso Z basado en `Diag(H)`, 128 rondas de 32 pasos, learning rate 0,0004, lambda constante de 0,003, beta2 de Adam 0,999 y semilla 0. El conjunto de datos son las 32.768 secuencias de entrenamiento de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizador de facebook/opt-125m y vistas una sola vez.

## Capacidades

- Generacion de texto autoregresiva, heredada de OPT-125M, con la misma interfaz `AutoModelForCausalLM.from_pretrained(...)` de `transformers`.
- Razonamiento basico y respuesta a preguntas de conocimiento general, aunque degradados respecto al modelo denso segun los benchmarks publicados.
- Evaluacion zero-shot en tareas de eleccion multiple y clasificacion (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues no disponibles; el modelo base OPT esta entrenado principalmente en ingles.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.

## Casos de uso

- Investigacion en compresion de modelos: el checkpoint sirve como referencia reproducible para comparar tecnicas de poda semi-estructurada (ALPS, ADMM, ELSA) sobre un mismo modelo base y un mismo protocolo de evaluacion de perplejidad.
- Analisis de degradacion por sparsity: permite medir la caida de perplejidad y de exactitud zero-shot al pasar del modelo denso (27,61 en WikiText-2) al podado (63,07), util para calibrar umbrales de compresion aceptables.
- Prototipado de bajo coste en entornos con recursos limitados: al ocupar 0,5 GB y tener 125 M de parametros, cabe en CPU y en GPUs de gama baja para pruebas de integracion de pipelines de generacion de texto.
- Docencia y experimentacion con `transformers`: al cargarse con `AutoModelForCausalLM.from_pretrained`, sirve para demostrar el efecto de la sparsity en la calidad de generacion sin cambiar la API del modelo original.
- Benchmarking de frameworks de inferencia: util para comprobar si motores como vLLM, llama.cpp u Ollama manejan correctamente checkpoints con sparsity semi-estructurada y si aprovechan el patron de ceros.
- Estudio de destilacion de conocimiento: el pipeline documentado (fase 2 con KD sobre el modelo denso) puede replicarse y compararse con otras variantes de poda sobre OPT-125M.

## Benchmarks y rendimiento

Perplejidad bajo el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16), ejecucion unica:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| OPT-125M denso | 27,61 | 26,52 |
| OPT-125M-semi-structured-EHWS-80pct | 63,07 | 46,91 |

Exactitud zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,1869 | 0,1783 |
| arc_easy | 0,4297 | 0,3737 |
| boolq | 0,5621 | 0,5954 |
| hellaswag | 0,2924 | 0,2669 |
| openbookqa | 0,1660 | 0,1420 |
| rte | 0,4910 | 0,5379 |
| winogrande | 0,5138 | 0,5138 |
| Media | 0,3774 | 0,3726 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (125 M de parametros), y alrededor de 0,25-0,5 GB en cuantizaciones de 8 o 4 bits, aunque no se han publicado conversiones GGUF ni cuantizadas en el repositorio.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, y en CPU con memoria RAM suficiente.
- Opciones de despliegue: `transformers` de forma nativa (documentado por el autor). El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible; la sparsity semi-estructurada puede requerir kernels especificos para aprovecharse.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPT-125M (denso) | 125 M | 2.048 | 27,61 | no disponible en esta ficha (OPT original bajo licencia de Meta) | Hugging Face |
| OPT-125M-semi-structured-EHWS-80pct | 125 M (80 % sparsity en capas lineales) | no disponible | 63,07 | no disponible | Hugging Face |
| Otras variantes podadas de OPT-125M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con alternativas de poda equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion notable de calidad: la perplejidad en WikiText-2 pasa de 27,61 a 63,07 y en C4 de 26,52 a 46,91, lo que indica una perdida sustancial de modelado del lenguaje respecto al modelo denso.
- Caida en tareas de razonamiento: arc_easy baja de 0,4297 a 0,3737 y openbookqa de 0,1660 a 0,1420, aunque algunas tareas mejoran ligeramente (boolq, rte).
- Riesgo de alucinacion: al ser un modelo pequeno y podado, la generacion de contenido factual no fiable es esperable; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no se documentan en la informacion disponible; el modelo base OPT-125M esta entrenado principalmente en ingles y puede reflejar sesgos de su corpus.
- Limitaciones de contexto e idioma: no se especifican en el repositorio; el contexto del modelo base es de 2.048 tokens y el soporte multilingue es limitado.
- Restricciones de licencia: la licencia no esta declarada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- Ejecucion unica: los resultados publicados provienen de una sola ejecucion con semilla 0, sin intervalos de confianza ni repeticiones.
- Advertencia de produccion: la sparsity semi-estructurada no garantiza aceleracion real salvo que el motor de inferencia use kernels que exploten el patron de ceros; sin ellos, el modelo puede ser mas lento que el denso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/OPT-125M-semi-structured-EHWS-80pct
- Modelo base: https://huggingface.co/facebook/opt-125m
- Repositorio del modelo base OPT (Meta): no disponible en la informacion proporcionada
- Paper de ELSA (referenciado por el autor): no disponible en la informacion proporcionada
- Paper de ALPS (referenciado por el autor): no disponible en la informacion proporcionada
- Paper de ADMM (referenciado por el autor): no disponible en la informacion proporcionada
- Fichero `results.json` del repositorio: incluido en el propio repositorio de Hugging Face
