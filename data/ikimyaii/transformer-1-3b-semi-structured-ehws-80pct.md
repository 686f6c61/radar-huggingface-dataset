# ikimyaii/Transformer-1.3B-semi-structured-EHWS-80pct

## Resumen

Transformer-1.3B-semi-structured-EHWS-80pct es una variante podada del modelo base fla-hub/transformer-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. El modelo aplica una poda semi-estructurada del 80 % sobre todas las capas lineales internas de los bloques del transformer, manteniendo embeddings y `lm_head` densos. El resultado es un checkpoint de 1.364.297.728 parametros (segun safetensors) que conserva la arquitectura original pero con una fraccion muy reducida de pesos activos en las proyecciones lineales.

La relevancia de este modelo es fundamentalmente metodologica: demuestra que es posible llevar un transformer de 1.3B a un 80 % de sparsity semi-estructurada con un procedimiento de dos fases (poda local tipo ALPS al 70 % seguida de ADMM global hasta el 80 %) en menos de tres horas sobre una unica A100 de 40 GB. El resultado es un checkpoint con filas perfectamente balanceadas (mismo numero de no-ceros por fila en las 168 capas podadas), lo que facilita el despliegue en hardware que explota sparse kernels.

No obstante, la degradacion de calidad es sustancial: la perplejidad en WikiText-2 pasa de 9,77 a 23,80 y en C4 de 14,65 a 25,61, y la media de zero-shot en lm-evaluation-harness cae de 0,4390 a 0,3897. El modelo no incluye model card con licencia, idiomas ni pipeline declarados, y su uso previsto es la investigacion sobre compresion de modelos mas que el despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base fla-hub/transformer-1.3B-100B), con capas de atencion de flash-linear-attention |
| Parametros totales | 1.364.297.728 |
| Parametros activos | no disponible (no es MoE; 80 % de sparsity semi-estructurada en capas lineales internas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/bf16; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de fla-hub/transformer-1.3B-100B, un transformer de 1.3B parametros entrenado por el proyecto flash-linear-attention. Sobre ese checkpoint se aplica una poda semi-estructurada en dos fases. La fase 1 es local, de estilo ALPS: cada capa lineal se poda al 70 % minimizando el error de reconstruccion ||(W - W0) X||², con matrices de Hessian calculadas a partir de secuencias de calibracion de C4. La fase 2 es global: se aplica ADMM sobre la perdida de entropia cruzada y destilacion de conocimiento (KD) del modelo completo, con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, beta2 de Adam 0,95 y semilla 0. La poda final alcanza el 80 % (sparsity medida de 0,7999 sobre los pesos publicados).

Los datos de entrenamiento de la poda son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizador del modelo base (fla-hub_hgrn-1.3B-100B), cada una vista una sola vez. El run completo, incluyendo evaluacion, tardo 2,80 horas en una A100 de 40 GB. La innovacion tecnica destacable es la combinacion de poda local con reconstruccion por capa y refinamiento global ADMM con KD, logrando un patron semi-estructurado con el mismo numero de no-ceros por fila en las 168 capas podadas, lo que garantiza balance de trabajo por fila en kernels sparse.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base transformer-1.3B-100B.
- Razonamiento basico y respuesta a preguntas de opcion multiple (evaluado en arc_challenge, arc_easy, openbookqa, hellaswag, winogrande, boolq, rte).
- Capacidad de modelado de lenguaje medible via perplejidad en WikiText-2 y C4.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; la degradacion de rendimiento en tareas de razonamiento sugiere que no es un uso recomendado.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre poda semi-estructurada: el checkpoint sirve como referencia reproducible para estudiar el equilibrio entre sparsity, perplejidad y precision zero-shot, ya que incluye `results.json` con la configuracion completa del run.
- Benchmarking de kernels sparse: al tener el mismo numero de no-ceros por fila en las 168 capas podadas, es util para validar el rendimiento de kernels que explotan sparsity semi-estructurada (por ejemplo, 2:4 o patrones por fila) en GPUs con soporte hardware.
- Estudio de destilacion de conocimiento en compresion: la fase 2 usa KD sobre el modelo denso, por lo que el checkpoint permite analizar la contribucion de la KD frente a la poda pura.
- Comparacion de metodologias de poda: sirve como baseline frente a otras tecnicas (SparseGPT, Wanda, ALPS puro) sobre el mismo modelo base y el mismo protocolo de evaluacion de ELSA.
- Prototipado de bajo coste en entornos de investigacion: al ocupar 5,5 GB en safetensors y requerir una sola A100 de 40 GB para su generacion, es asequible para laboratorios con recursos limitados que quieran experimentar con modelos podados.
- Analisis de robustez y calibracion: la caida diferenciada por tarea (boolq y rte apenas pierden, arc_easy y hellaswag caen mucho) lo hace util para estudiar que tipos de tarea son mas sensibles a la poda.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4 test, fp16, run unico):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (perplejidad) | 9,77 | 23,80 |
| C4 (perplejidad) | 14,65 | 25,61 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2355 | 0,2082 |
| arc_easy | 0,5602 | 0,4019 |
| boolq | 0,6199 | 0,6190 |
| hellaswag | 0,3848 | 0,2978 |
| openbookqa | 0,2120 | 0,1580 |
| rte | 0,5126 | 0,5235 |
| winogrande | 0,5478 | 0,5193 |
| Media | 0,4390 | 0,3897 |

Sparsity medida sobre los pesos publicados: 0,7999. Las 168 capas podadas mantienen el mismo numero de no-ceros por fila.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 5,5 GB en safetensors, por lo que en fp16 se necesita al menos ese tamano mas overhead de activaciones y cache KV.
- GPU recomendadas: el run de poda se ejecuto en una A100 de 40 GB; para inferencia, una GPU con al menos 8-16 GB de VRAM deberia ser suficiente en fp16, aunque no se documenta.
- Cabe en GPU consumer: probablemente si en RTX 3090/4090 (24 GB) y posiblemente en GPUs de 12-16 GB, aunque no hay datos confirmados.
- Opciones de despliegue: requiere `flash-linear-attention` (`import fla`) y `flash-attn` para la capa de atencion; carga con `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la ventaja teorica de la sparsity semi-estructurada depende de kernels que la exploten, no documentados aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ikimyaii/Transformer-1.3B-semi-structured-EHWS-80pct | 1.364.297.728 | no disponible | no disponible | Hugging Face | 80 % sparsity semi-estructurada, perplejidad WikiText-2 23,80 |
| fla-hub/transformer-1.3B-100B (denso) | ~1.3B | no disponible | no disponible | Hugging Face | Modelo base; perplejidad WikiText-2 9,77, media zero-shot 0,4390 |
| Alternativas de poda (SparseGPT, Wanda, ALPS) | variable | no disponible | variable | no disponible | No se dispone de resultados comparables en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos alternativos de poda sobre el mismo base en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion notable de calidad: la perplejidad en WikiText-2 se multiplica por 2,4 y en C4 por 1,75 respecto al denso; la media zero-shot cae 4,9 puntos.
- Caida severa en tareas de razonamiento y sentido comun: arc_easy pasa de 0,5602 a 0,4019 y hellaswag de 0,3848 a 0,2978.
- Riesgo de alucinacion elevado por la perdida de capacidad de modelado; no recomendado para produccion sin validacion especifica.
- Licencia no declarada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base fla-hub/transformer-1.3B-100B antes de cualquier despliegue.
- Idiomas no declarados; no hay garantia de comportamiento multilingue.
- Dependencia de `flash-linear-attention` y `flash-attn` para cargar el modelo; no hay soporte documentado para runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).
- La sparsity semi-estructurada solo aporta ventaja real si el runtime usa kernels que la exploten; en caso contrario, el modelo ocupa el mismo espacio que uno denso pero rinde peor.
- Run unico sin repeticiones ni intervalos de confianza; los resultados deben tratarse como indicativos.
- Sesgos conocidos: no documentados, pero heredados del modelo base y de C4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Transformer-1.3B-semi-structured-EHWS-80pct
- Modelo base: https://huggingface.co/fla-hub/transformer-1.3B-100B
- Tokenizador del modelo base: fla-hub_hgrn-1.3B-100B (referenciado en la model card)
- Proyecto flash-linear-attention: no disponible en la informacion proporcionada
- Paper o repositorio de ELSA (protocolo de evaluacion y codigo de calibracion): no disponible en la informacion proporcionada
- Paper o repositorio de ALPS (metodo de poda local): no disponible en la informacion proporcionada
