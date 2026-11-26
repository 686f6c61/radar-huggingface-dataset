# sergolsub/inkling-2-mini-MLX-nvfp4-mxfp8

## Resumen

Inkling-2-Mini (MLX NVFP4/MXFP8) es una adaptación para Apple Silicon del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario sergolsub. No se trata de un modelo nuevo entrenado desde cero, sino de un reempaquetado sin pérdida de los pesos cuantizados originales (NVFP4 y MXFP8) a los formatos nativos de cuantización de MLX, manteniendo los códigos y las escalas de bloque byte a byte idénticos. El resto de tensores se conserva tal cual se publicaron.

El modelo base es un MoE de 26.400 millones de parámetros totales con 128 expertos y enrutamiento top-8, de los cuales 5.400 millones están activos por token. Consta de 24 capas, con las capas 6 a 17 repetidas tres veces (looping), residuos de atención por bloques y una combinación de atención de ventana deslizante y atención global. La adaptación incluye un runtime propio, `inkling_mlx.py`, que no depende de `mlx_lm`, y cubre únicamente la ruta de texto: la torre de visión y la cabeza de borrador MTP no están incluidas.

Su relevancia radica en que permite ejecutar un MoE de 26.400 millones de parámetros en hardware Apple Silicon de gama alta con una huella de disco de 18,9 GB y un pico de memoria en torno a 19,5 GB en contextos cortos, con una fidelidad de salida muy alta respecto a la referencia en torch fp32 (KL media de 0,0017, acuerdo top-1 del 98,2 % y perplejidad de 4,658 frente a 4,652 de la referencia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 24 capas, capas 6-17 repetidas x3 (looping), residuos de atención por bloques, atención de ventana deslizante + global |
| Parametros totales | 26.400 millones (26.4B) |
| Parametros activos | 5.400 millones (5.4B), 128 expertos con top-8 |
| Longitud de contexto | no disponible (la model card incluye mediciones hasta 4096 tokens de prompt, pero no declara el máximo) |
| Tipos de cuantizacion | NVFP4 (40 tensores de expertos) y MXFP8 (8 tensores de expertos); tensores densos en bf16/fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de los pesos originales) |
| Formato de pesos | safetensors (MLX layout, con `mlx_quant` por tensor en `config.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de 26.400 millones de parámetros totales y 5.400 millones activos, con 128 expertos y selección top-8. Dispone de 24 capas, de las cuales las capas 6 a 17 se recorren tres veces mediante un esquema de looping, lo que incrementa la profundidad efectiva sin aumentar el número de capas físicas. Incorpora además residuos de atención por bloques y una combinación de atención de ventana deslizante con atención global.

Esta ficha corresponde a una conversión, no a un entrenamiento. El autor declara explícitamente que el reempaquetado es sin pérdida: no hay recuantización, no hay reentrenamiento y no hay cambios de arquitectura. Las únicas transformaciones son el reempaquetado de los pesos NVFP4/MXFP8 a los formatos nativos de MLX, la desintercalación de filas gate/up y el renombrado de tensores. La auditoría de pesos incluida en el repositorio (`kl_audit.json`) compara 693 tensores del original con sus contrapartidas desquantizadas y reporta KL media y máxima de 0,00e+00, con cero tensores no nulos, lo que respalda la afirmación de pérdida nula a nivel de pesos. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo base.

Una innovación destacable es la exposición de un parámetro `reasoning_effort` en la plantilla de chat, con valores de 0,0 a 0,99 y valor por defecto 0,9. El modelo siempre razona; los valores bajos acortan el razonamiento pero no lo desactivan. El runtime propio implementa generación greedy, caché KV y capas compiladas.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat.
- Razonamiento explícito con control de esfuerzo mediante `reasoning_effort` (0,0-0,99, por defecto 0,9).
- Razonamiento multi-paso y descomposición de problemas, dado el modo de razonamiento siempre activo.
- Servicio mediante API compatible con `POST /v1/chat/completions` en el servidor unificado del autor, con los campos `messages`, `max_tokens` y `reasoning_effort`.
- Generación greedy determinista en el runtime incluido.
- No incluye visión: la torre de visión del modelo original no está en este repositorio.
- No incluye la cabeza de borrador MTP (multi-token prediction) del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno en Apple Silicon con un pico de memoria de aproximadamente 19,5-23 GB, lo que lo hace viable en equipos con 32 GB o más de memoria unificada.
- Razonamiento asistido con coste controlado: ajustando `reasoning_effort` entre 0,0 y 0,99 se puede reducir la longitud del razonamiento en tareas simples y elevarlo en problemas complejos, equilibrando latencia y calidad.
- Procesamiento por lotes de prompts de longitud media: con 268-338 tokens/s de prefill entre 256 y 4096 tokens de prompt, es adecuado para clasificación, resumen o extracción sobre documentos de hasta unos miles de tokens.
- Prototipado e investigación en local: al ser un MoE de 26.400 millones con 5.400 millones activos y runtime propio, permite experimentar con enrutamiento de expertos y arquitecturas con capas repetidas sin depender de GPUs.
- Generación de texto de forma determinista: la generación greedy del runtime facilita la reproducibilidad en evaluaciones y pruebas de regresión.
- Despliegue en estaciones de trabajo Apple para demostraciones: el servidor unificado con endpoint compatible con chat/completions permite integrar el modelo en aplicaciones existentes sin adaptadores adicionales.
- Evaluación de fidelidad de cuantización: los ficheros `kl_audit.json`, `bit_census.json` y los checksums SHA-256 permiten auditar la conversión y verificar descargas, útil en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos publicados son de fidelidad y rendimiento de inferencia en Apple M4 Pro con 48 GB y MLX 0.32.3.

| Metrica | Valor |
|---|---|
| KL media (referencia fp32 torch vs MLX) | 0,0017 |
| KL p95 | 0,0071 |
| KL máxima | 0,0844 |
| Acuerdo top-1 | 98,2 % |
| Perplejidad (MLX) | 4,658 |
| Perplejidad (referencia) | 4,652 |
| KL a nivel de pesos (693 tensores) | 0,00e+00 media y máxima, 0 tensores no nulos |

| Prompt tokens | TTFT (s) | Prefill (tok/s) | Memoria pico (GB) |
|---:|---:|---:|---:|
| 16 | 0,19 | 85 | 19,2 |
| 64 | 0,32 | 201 | 19,4 |
| 128 | 0,47 | 274 | 19,7 |
| 256 | 0,80 | 322 | 20,5 |
| 512 | 1,51 | 338 | 21,3 |
| 1024 | 3,16 | 324 | 21,9 |
| 2048 | 6,70 | 306 | 22,3 |
| 4096 | 15,28 | 268 | 23,1 |

| Tokens generados | Decode (tok/s acumulados) | Memoria pico (GB) |
|---:|---:|---:|
| 512 | 21,6 | 19,5 |
| 2048 | 20,4 | 20,3 |
| 4096 | 19,7 | 21,2 |
| 8192 | 16,7 | 23,0 |

Decode en contexto corto: 27,7 tok/s.

## Requisitos de hardware

- Memoria: pico de 19,5 GB en contextos cortos y hasta 23,1 GB con 4096 tokens de prompt; 23,0 GB con 8192 tokens generados. Se recomienda un equipo con al menos 32 GB de memoria unificada; las mediciones se realizaron en un M4 Pro de 48 GB.
- Disco: 18,9 GB para los pesos y ficheros auxiliares.
- GPU: exclusivamente Apple Silicon con soporte MLX; las mediciones corresponden a M4 Pro. No hay datos publicados para M1, M2, M3, M4 Max o Ultra.
- GPU de NVIDIA (A100, H100, RTX 4090): no aplicable, el runtime es MLX y no se ha validado en CUDA.
- Despliegue: runtime propio `inkling_mlx.py` incluido en el repositorio; no es compatible con `mlx_lm`, vLLM, llama.cpp, Ollama ni TGI según la información disponible. El autor ofrece un servidor unificado con endpoint `POST /v1/chat/completions`.
- Dependencias: `mlx`, `tokenizers`, `transformers` y `huggingface_hub`.
- Latencia y throughput: TTFT de 0,19 s con 16 tokens de prompt y 15,28 s con 4096; prefill de 85 a 338 tok/s según longitud; decode de 27,7 tok/s en contexto corto y 16,7 tok/s acumulados tras 8192 tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini MLX (esta ficha) | 26,4B | 5,4B | no disponible | Apache 2.0 | safetensors MLX, runtime propio | Solo texto; sin visión ni MTP; conversión sin pérdida |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B | 5,4B | no disponible | Apache 2.0 | NVFP4/MXFP8, torch | Incluye torre de visión y cabeza MTP; referencia de fidelidad |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Es una conversión de pesos, no un modelo entrenado: hereda todas las capacidades y limitaciones del modelo base, del que no se documentan sesgos ni datos de entrenamiento en esta información.
- Solo ruta de texto: no incluye la torre de visión ni la cabeza de borrador MTP del modelo original, por lo que no puede realizar tareas multimodales ni aprovechar la decodificación especulativa nativa.
- El razonamiento no se puede desactivar por completo: `reasoning_effort` a 0,0 es el valor mínimo y sigue generando razonamiento, lo que incrementa el consumo de tokens frente a modelos sin modo de razonamiento.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las precauciones habituales en producción.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluación previa.
- Longitud máxima de contexto no declarada: las mediciones llegan a 4096 tokens de prompt y 8192 generados, pero se desconoce el límite del modelo.
- Dependencia de hardware Apple Silicon y de un runtime propio no estándar (`inkling_mlx.py`), lo que limita la portabilidad y el soporte de herramientas del ecosistema.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las mediciones del autor.
- Licencia Apache 2.0 heredada; en caso de conflicto prevalece la licencia del repositorio upstream.
- El rendimiento medido corresponde a un único equipo (M4 Pro, 48 GB); no hay datos para otros chips Apple.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/inkling-2-mini-MLX-nvfp4-mxfp8
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime incluido: `inkling_mlx.py` (en el propio repositorio)
- Auditoría de cuantización: `kl_audit.json`, `bit_census.json` (en el propio repositorio)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
