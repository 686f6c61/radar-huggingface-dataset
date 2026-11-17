# hermitdave/LFM2.5-24B-A2B-MLX-RCO-3.0bpw

## Resumen

LFM2.5-24B-A2B-MLX-RCO-3.0bpw es una cuantizacion mixta de precision del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario hermitdave. Se trata de una build en formato MLX pensada para ejecucion en Apple Silicon, que comprime el modelo original de 24.000 millones de parametros totales (con 2.000 millones activos, al ser una arquitectura MoE) hasta un tamano de repositorio de 7,5 GB y un peso efectivo de 2,9975 bits por peso. El modelo base pertenece a la familia LFM2.5 de Liquid AI, orientada a despliegue eficiente en dispositivos.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion con asignacion de bits por proyeccion (RCO, mixed-precision), y por otro sirve como advertencia sobre el compromiso entre tamano y calidad, ya que el propio autor reconoce una recuperacion media de 0,9222 respecto al modelo en BF16, es decir, una perdida de calidad no despreciable en tareas de razonamiento y conocimiento (MMLU recupera solo el 82,2 %).

El modelo esta etiquetado con licencia "other" y no declara idiomas soportados en la informacion disponible. Su publicacion es muy reciente (17 de noviembre de 2026) y no cuenta con descargas ni likes, por lo que debe considerarse una build experimental para evaluacion, no para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (lfm2_moe) sobre transformer; cuantizacion mixta RCO en MLX |
| Parametros totales | 24.000 millones (24B, segun nombre del modelo base) |
| Parametros activos | 2.000 millones (A2B, segun nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 3 y 2 bits por grupo (85 grupos a 3 bits, 29 a 2 bits), group size 64, affine, escalas en bfloat16; 2,9975 bpw efectivos |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base LiquidAI/LFM2.5-24B-A2B) |
| Formato de pesos | MLX (repo de 7,5 GB; tamano reportado por el autor: 9,8 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo lfm2_moe con 24B parametros totales y 2B activos por token, lo que permite un coste de inferencia cercano al de un modelo denso de 2B pese a la capacidad total. La build aqui descrita no reentrena el modelo: aplica una cuantizacion post-entrenamiento con asignacion de precision por proyeccion. El pipeline RCO asigna 3 bits a 85 grupos y 2 bits a 29 grupos, con group size 64 y escalas en bfloat16, alcanzando 2,9975 bits por peso.

La calibracion se realizo con FineWeb-Edu en 512 muestras de 2048 tokens usando el tokenizador propio del checkpoint (roundtrip 1.000), y se empleo una matriz de importancia (imatrix) publicada en hermitdave/LFM2.5-24B-A2B-imatrix. El autor indica que el flujo de cuantizacion se asistio con Hermes Agent. No se dispone de informacion sobre datos de entrenamiento originales, RLHF/DPO ni innovaciones de atencion del modelo base en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base LFM2.5-24B-A2B.
- Capacidad de conocimiento y resolucion de preguntas tipo MMLU, aunque con degradacion medible tras la cuantizacion (recuperacion 0,822).
- Razonamiento de sentido comun y eleccion multiple (ARC, HellaSwag, WinoGrande) con recuperacion entre 0,898 y 1,005.
- Ejecucion nativa en Apple Silicon mediante la libreria MLX.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Prototipado local en Mac con Apple Silicon: la build MLX permite cargar un MoE de 24B en equipos con memoria unificada moderada, gracias a sus 7,5 GB de pesos, para pruebas de concepto sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion: util como referencia para comparar asignaciones de bits por proyeccion frente a cuantizaciones uniformes de 4 bits, midiendo la recuperacion en tareas estandar.
- Generacion de texto offline en entornos con restricciones de red: al ser un modelo local, se puede desplegar en estaciones de trabajo sin conexion para tareas de redaccion o resumen.
- Clasificacion y respuesta a preguntas de opcion multiple: adecuado para tareas tipo ARC o HellaSwag donde la recuperacion se mantiene cercana al BF16 (0,987 en HellaSwag).
- Investigacion sobre eficiencia de inferencia: permite medir throughput y latencia de un MoE de 2B activos en hardware consumer Apple, comparando con la version BF16.
- Filtrado y preprocesado de corpus: puede emplearse para tareas de etiquetado o generacion de datos sinteticos en pipelines de investigacion donde la perdida de calidad del 8 % sea aceptable.

## Benchmarks y rendimiento

Resultados publicados por el autor (5 tareas, 400 ejemplos cada una, prompts identicos), comparando BF16 frente a la version cuantizada:

| Tarea | BF16 | Cuantizado | Recuperacion |
|---|---|---|---|
| arc_challenge | 0,4400 | 0,3950 | 0,898 |
| arc_easy | 0,7400 | 0,6650 | 0,899 |
| hellaswag | 0,3975 | 0,3925 | 0,987 |
| winogrande | 0,4975 | 0,5000 | 1,005 |
| mmlu | 0,4075 | 0,3350 | 0,822 |
| Media | — | — | 0,9222 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 7,5-9,8 GB para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4 con memoria unificada suficiente) por el formato MLX; no es compatible de forma nativa con CUDA.
- Cabe en GPU consumer Apple: si, en configuraciones con 16 GB o mas de memoria unificada; en Mac con 8 GB es ajustado y puede requerir swap.
- Opciones de despliegue: mlx-lm y ecosistema MLX; no disponible para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-MLX-RCO-3.0bpw (esta ficha) | 24B totales / 2B activos | no disponible | MLX, 2,9975 bpw | other | Recuperacion media 0,9222 frente a BF16 |
| LiquidAI/LFM2.5-24B-A2B (BF16) | 24B totales / 2B activos | no disponible | safetensors | other | Referencia de calidad completa |
| Build RCO 4.5 bpw del mismo autor | 24B totales / 2B activos | no disponible | MLX | other | Recomendada por el autor si hay 4 GB extra de memoria |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad no despreciable: recuperacion media de 0,9222; MMLU cae un 17,8 % respecto a BF16, por lo que no es adecuada para tareas que dependan de conocimiento factual preciso.
- El autor advierte explicitamente que la build "no es task-lossless" y recomienda la version de 4,5 bpw si el presupuesto de memoria lo permite.
- Licencia "other": es necesario revisar los terminos del modelo base LiquidAI/LFM2.5-24B-A2B antes de cualquier uso comercial.
- Idiomas soportados no declarados: riesgo de comportamiento degradado fuera del ingles.
- Formato MLX: no portable a CUDA ni a la mayoria de stacks de produccion (vLLM, TGI, llama.cpp).
- Sin descargas ni validacion comunitaria: build experimental de un unico autor, sin garantias de mantenimiento.
- Riesgo de alucinacion inherente al modelo base, agravado por la cuantizacion agresiva a 2-3 bits en parte de las proyecciones.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-MLX-RCO-3.0bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Imatrix de calibracion: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-imatrix
- Hermes Agent (asistente del flujo de cuantizacion): https://hermes-agent.nousresearch.com
