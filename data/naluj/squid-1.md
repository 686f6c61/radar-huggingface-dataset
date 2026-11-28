# naluj/squid-1

## Resumen

Squid-1 es un adaptador LoRA de rango 16 sobre el modelo `thinkingmachines/Inkling-2-Mini` (Apache 2.0, 26.4B parámetros totales y 3.4B activos, arquitectura MoE con bucle), publicado por el usuario `naluj` bajo licencia Apache 2.0. No es un modelo de propósito general, sino un "modelo de decisión System One": dado un estado, una pregunta y un conjunto de opciones candidatas (hasta 62 etiquetas ASCII de un solo token, `A-Z`, `a-z`, `0-9`), devuelve probabilidades calibradas sobre las opciones válidas en un único forward pass, sin generar tokens de cadena de pensamiento.

El problema que aborda es la toma de decisiones calibrada y barata en pipelines de agentes: clasificación de opción múltiple, enrutamiento de tool calling, abstención ante preguntas desconocidas y escalas ordenadas, todo con un coste de inferencia mínimo (un solo paso, `effort=0.0`). Su relevancia actual reside en que ofrece métricas de calibración explícitas (ECE, Brier, AUROC de detección de error) y una política de escalado selectivo: cuando la confianza es baja, el sistema puede derivar la decisión a un modelo mayor.

El adaptador se entrenó con un presupuesto declarado de aproximadamente 5,26 USD, sobre los datasets `nvidia/When2Call` y `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, y se distribuye como checkpoint `v7b_step_40` en formato PEFT safetensors de unos 742 MB. El repositorio completo (código, evaluaciones y pipeline de entrenamiento) está en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre MoE con bucle (`inkling2_loop`); el adaptador es PEFT sobre `thinkingmachines/Inkling-2-Mini` |
| Parametros totales | 26.4B en el modelo base; el adaptador LoRA ocupa ~742 MB en safetensors |
| Parametros activos | 3.4B (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT `adapter_model.safetensors`), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `thinkingmachines/Inkling-2-Mini`, un transformer MoE con mecanismo de bucle (`inkling2_loop`) de 26.4B parámetros totales y 3.4B activos. Squid-1 añade un LoRA de rango 16 entrenado para producir una distribucion de probabilidad sobre un conjunto cerrado de opciones de un solo token, en lugar de texto libre. La salida se restringe a las etiquetas validas (hasta 62: `A-Z`, `a-z`, `0-9`), lo que permite leer directamente probabilidades calibradas de un unico forward pass con `effort=0.0` y sin tokens de razonamiento en inferencia.

El entrenamiento se realizo con la herramienta Tinker y un pipeline de destilacion, con un gasto total declarado de aproximadamente 5,26 USD. Los datos incluyen `nvidia/When2Call` (enrutamiento de tool calling) y `nvidia/Aegis-AI-Content-Safety-Dataset-2.0` (seguridad de contenido), y el autor declara 121.088 ejemplos de entrenamiento en las versiones `data` v1 a v7b, sin solapamiento con los conjuntos de evaluacion. El adaptador soporta tres modos de decision: `choice` (opcion multiple), `noul` (verdadero/falso con abtencion) y `score` (escala ordenada). Las evaluaciones principales usan promediado de simetria a 2 pasadas.

## Capacidades

- Decision de opcion multiple con probabilidades calibradas en un solo forward pass (`effort=0.0`), sin cadena de pensamiento.
- Modo `choice`: seleccion entre hasta 62 opciones etiquetadas con un solo token ASCII.
- Modo `noul`: decision booleana con opcion de abtencion.
- Modo `score`: decision sobre escalas ordenadas.
- Enrutamiento de tool calling: decide si llamar a una herramienta, pedir informacion o responder que no puede contestar.
- Abtencion ante preguntas desconocidas: tasa de declive del 60,9% en HLE-MultiChoice v1.1.
- Calibracion explicita: el modelo expone ECE, Brier y AUROC de deteccion de error, lo que permite escalado selectivo a un modelo mayor.
- Capacidades multilingues: solo ingles declarado.
- Capacidad especial: modelo de decision "System One" disenado para clasificacion y calibracion, no para generacion de texto libre.

## Casos de uso

- Enrutamiento de tool calling en agentes: el modelo recibe el estado de la conversacion, la pregunta y las herramientas candidatas, y devuelve la probabilidad de cada accion (`tool_call`, `request_for_info`, `cannot_answer`). Su 95,49 en `request_for_info` y 85,10 en `cannot_answer` sobre When2Call lo hacen adecuado como primer nivel de enrutamiento antes de invocar un modelo mayor.
- Clasificacion con abtencion en atencion al cliente: en modo `noul`, el modelo decide si puede responder o debe derivar a un humano, con una tasa de declive controlada y calibrada, reduciendo respuestas erroneas en produccion.
- Filtrado de seguridad de contenido: entrenado con `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, puede usarse como clasificador previo que etiquete contenido y derive los casos dudosos a revision humana.
- Escalado selectivo en pipelines de inferencia: usando la confianza de salida, el sistema mantiene las decisiones de alta confianza en Squid-1 (coste minimo) y escala el 20% de menor confianza a un modelo mayor; en `decision-v7/test` esto eleva la precision retenida del 82,63% al 89,71%.
- Evaluacion de exámenes y encuestas: en modo `choice` o `score`, procesa preguntas de opcion multiple y escalas ordenadas con calibracion (ECE de 0,0254 en `decision-v7/test`), util para sistemas de correccion automatica.
- Clasificacion NLU multi-tarea: con 11 tareas NLU en `decision-v7/test` y un AUROC de deteccion de error de 0,834, sirve como clasificador ligero en pipelines de procesamiento de lenguaje que necesitan saber cuando no estan seguros.
- Razonamiento cientifico de un solo paso: en GPQA-Diamond obtiene un 50,00% con calibracion ECE de 0,072, util como componente rapido en sistemas de respuesta cientifica con escalado a modelos de razonamiento largo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) para el checkpoint `v7b_step_40`.

Proxies publicos del AA Decision Index v2.1 (2 pasadas, splits held-out):

| Componente (peso AA) | v5_tail (1 pasada) | squid-1 (2 pasadas) | Delta |
|---|---|---|---|
| EvalSafe-O*NET-AA (15%, n=3.272) | 86,01 (58 fallos) | 87,57 (0 fallos) | +1,56 |
| When2Call (10%, n=1.775) | 79,86 | 88,12 (0 fallos) | +8,26 |
| HLE-MultiChoice v1.1 (15%, n=509) | no disponible | 47,75 (0 fallos) | no disponible |
| Proxy ponderado 2 componentes (25%) | 83,55 | 87,79 | +4,24 |
| Proxy ponderado 3 componentes (40%) | no disponible | 72,77 | no disponible |

Benchmarks externos zero-CoT (sin solapamiento entrenamiento-evaluacion):

| Benchmark | n | Precision | Calibracion (Brier / ECE) | AUROC deteccion error | Precision top-80% confianza |
|---|---|---|---|---|---|
| GPQA-Diamond (4 opciones, 2 pasadas) | 198 | 50,00% | 0,6079 / 0,0720 | 0,7353 | 55,06% |
| MMLU-Pro 1k (10 opciones, 2 pasadas) | 1.000 | 62,20% | 0,5136 / 0,0881 | 0,8017 | 70,13% |
| Kev decision-v7/test (11 tareas NLU, 1 pasada) | 1.324 | 82,63% | 0,2457 / 0,0254 | 0,8340 | 89,71% |

Otras metricas declaradas: JevBench (231 tareas publicas) con 87,88% de precision y Brier de 0,1714; en `decision-v7/test`, escalar el 20% de menor confianza captura el 52,6% de los errores y eleva la precision oracle-escalada al 91,77%. Analog del AA-Symmetry: 72,31 con 8,9% de flip y 0% de flip de seguridad en Aegis.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el adaptador pesa ~742 MB, pero requiere cargar el modelo base `Inkling-2-Mini` (26.4B totales, 3.4B activos). En cuantizacion de 4 bits, el modelo base rondaria los 13-15 GB; en 16 bits, unos 53 GB. Estas cifras son estimaciones por tamano, no datos publicados.
- GPU recomendadas: no disponible. Por tamano, el modelo base completo en 16 bits requiere A100 80 GB o H100; en cuantizacion 4 bits podria caber en RTX 4090 (24 GB) o RTX 3090.
- Cabe en consumer GPU: probablemente en RTX 4090/3090 con cuantizacion agresiva del modelo base; no confirmado por el autor.
- Opciones de despliegue: no disponible. El adaptador es PEFT sobre el modelo base; el despliegue depende del soporte del modelo base en vLLM, llama.cpp, Ollama o TGI, que no se documenta en la informacion proporcionada.
- Latencia y throughput: no disponible. El autor destaca un unico forward pass a `effort=0.0`, lo que reduce coste frente a modelos con cadena de pensamiento, pero no publica cifras de latencia.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (modelos de decision calibrada System One sobre MoE). Se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| squid-1 (adaptador) | 26.4B totales / 3.4B activos (base) | no disponible | Decision calibrada, un forward pass | Apache 2.0 |
| thinkingmachines/Inkling-2-Mini | 26.4B totales / 3.4B activos | no disponible | Generacion de texto MoE con bucle | Apache 2.0 |

No hay datos de benchmarks del modelo base en la informacion disponible para comparar rendimiento directamente.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- Restringido a decisiones sobre opciones de un solo token ASCII (`A-Z`, `a-z`, `0-9`); no genera texto libre ni razonamiento explicito.
- No es un modelo de proposito general: usarlo para generacion abierta no es su diseno.
- Riesgo de alucinacion: aunque el autor reporta calibracion y abtencion, las metricas son declaradas por el autor y no estan verificadas (`verified: false` en el model-index).
- Sesgos conocidos: no disponibles en la informacion proporcionada; el entrenamiento con Aegis sugiere enfoque en seguridad de contenido, pero no se documentan sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base `Inkling-2-Mini`, cuya licencia tambien es Apache 2.0 segun la informacion disponible.
- El checkpoint es un adaptador PEFT: requiere cargar el modelo base, lo que incrementa los requisitos de hardware frente a lo que sugiere el tamano del adaptador.
- Los resultados de benchmarks son declarados por el autor y no verificados de forma independiente; la fecha de creacion (2026-11-28) y el modelo base deben confirmarse antes de uso en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/naluj/squid-1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Codigo, evaluaciones y pipeline: https://github.com/naluj/squid
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset Aegis-AI-Content-Safety-Dataset-2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- HLE-MultiChoice v1.1: https://huggingface.co/datasets/cais/hle
