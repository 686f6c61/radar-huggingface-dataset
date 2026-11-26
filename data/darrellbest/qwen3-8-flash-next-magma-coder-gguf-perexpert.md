# darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF-PerExpert

## Resumen

Qwen3.8-Flash-Next-Magma-Coder-GGUF-PerExpert es una cuantizacion no oficial, de caracter experimental, del modelo Qwen/Qwen3.8-Flash-Next de Alibaba, publicada por el usuario darrellbest bajo el paraguas de su familia "Magma-Coder". Se trata de un artefacto GGUF de aproximadamente 188 GB que mantiene los 512 expertos enrutados de las 48 capas del modelo original, ademas de la cabeza MTP (multi-token prediction), y que aplica un esquema de cuantizacion por experto ("PerExpert") en el que cada proyeccion de cada experto recibe su propio ancho de bits entre 2 y 8, aunque el resultado se empaqueta de nuevo en un contenedor Q8_0 para que cargue en llama.cpp estandar.

El modelo base es un MoE de gran escala con 176.943.899.520 parametros totales segun los safetensors publicados, orientado a programacion, uso agentico y tool calling. La contribucion de esta ficha no es un modelo nuevo sino una tecnica de compresion: la calibracion se hace con una importance matrix (imatrix) recogida sobre texto de codigo, trayectorias de agentes, tool calls y razonamiento, en lugar de texto web generico, con el objetivo de preservar la precision en las rutas de pesos mas relevantes para esas tareas.

Es relevante ahora por dos motivos. Primero, porque documenta de forma inusualmente honesta un resultado negativo: el propio autor reconoce que su asignacion por experto no supera a la cuantizacion uniforme de 4 bits en su prueba de divergencia KL, y la publica como caracteristica experimental y no como promesa de calidad. Segundo, porque ejemplifica el estado del arte en despliegue local de MoE masivos: tecnicas como `--n-cpu-moe` permiten ejecutar un modelo de 188 GB en una GPU de 96 GB dejando parte de los expertos en CPU, a costa de caer a 6-9 tok/s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 48 capas con 512 expertos enrutados por capa y cabeza MTP |
| Parametros totales | 176.943.899.520 (aprox. 177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PerExpert experimental (2-8 bits por proyeccion de experto) empaquetado en contenedor Q8_0; cabeza MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | GGUF (6 shards `Q8box-0001..0006-of-00006`), mas `expert-tiers.json` y `mtp-Qwen3.8-Flash-Next-shared-Q8_0.gguf` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 48 capas y 512 expertos enrutados por capa, lo que da 73.728 proyecciones de experto (512 expertos x 3 proyecciones x 48 capas). Incluye una cabeza MTP (multi-token prediction) que se distribuye como fichero separado en Q8_0 y que habilita decodificacion especulativa. Esta cuantizacion no anade fine-tuning ni poda: todos los pesos provienen del modelo original y se conservan la totalidad de los expertos y la cabeza MTP.

La innovacion tecnica es el esquema PerExpert: en lugar de aplicar un unico ancho de bits a todos los expertos, se asigna un ancho distinto (2 a 8 bits) a cada proyeccion de cada experto, derivado de un proxy basado en imatrix que mide el error de reconstruccion ponderado por enrutamiento. El presupuesto total se mantiene igual al de una cuantizacion uniforme de 4 bits, pero el resultado se almacena en contenedor Q8_0 para compatibilidad con llama.cpp estandar. La calibracion usa aproximadamente 1,5 millones de tokens renderizados con la plantilla de chat de Qwen3.8: 40% agentico (60% transcripciones privadas de sesiones de agente de codigo del autor, 40% trayectorias de KannaCode), 25% codigo (issues de SWE-bench Lite con sus parches gold, mas fuentes de Magma y KannaCode), 15% tool calling (hermes-function-calling-v1 de NousResearch), 15% razonamiento (MATH-500 y GSM8K) y 5% general (ultrachat_200k). El corpus de calibracion y la imatrix no se distribuyen; se reservo un 10% por categoria para evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia de Qwen3.8.
- Generacion y edicion de codigo, incluyendo resolucion de issues estilo SWE-bench (la calibracion incluye pares issue/parche).
- Tool calling y function calling estructurado en formato XML, con soporte de bloques `<tool_response>`.
- Razonamiento agentico multi-paso y trayectorias de agente con llamadas a herramientas encadenadas.
- Razonamiento matematico (calibrado sobre MATH-500 y GSM8K).
- Modo thinking: la plantilla de chat contempla bloques de pensamiento explicitos.
- Decodificacion especulativa mediante la cabeza MTP incluida en el repositorio.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: el repositorio esta pensado como banco de pruebas para comparar asignaciones de bits por experto frente a cuantizacion uniforme, usando la metrica KLD contra una referencia Q8_0 y el fichero `expert-tiers.json` como registro de la asignacion.
- Agente de codigo en local sobre GPU unica: con `--n-cpu-moe 17` en una GPU de 96 GB se obtienen 6-9 tok/s, suficiente para tareas de refactorizacion o generacion de parches que no requieran interactividad estricta.
- Tool calling estructurado en prototipos: los smoke tests del autor verifican llamadas correctas a `get_weather` y a `merge_intervals` con asserts de test pasando, lo que permite validar pipelines de function calling antes de migrar a la variante Q4.
- Investigacion sobre sensibilidad de expertos: al conservar los 512 expertos y publicar los tiers por capa, experto y proyeccion, sirve para estudiar que expertos concentran la precision critica en tareas de codigo.
- Servicio de inferencia con llama-server: compatible con llama.cpp estandar y `--jinja`, desplegable en LM Studio u Ollama (aunque el tamano de 188 GB lo hace impractical en estos entornos salvo con offload masivo a CPU).
- Reproduccion de mediciones KL: el repositorio documenta el procedimiento (dos chunks de 4.096 tokens, unas 4.000 posiciones puntuadas, `--parse-special` activado) y permite replicar la comparacion frente a Q4-uniform.
- Analisis de cuellos de botella en decodificacion especulativa: la separacion de la cabeza MTP en un GGUF propio facilita experimentos con y sin decodificacion especulativa.

## Benchmarks y rendimiento

| Build | KLD media | KLD mediana | KLD p99 | Top-1 coincidente | RMS delta p | Ratio PPL |
|---|---|---|---|---|---|---|
| Q4-uniform | 0,207 ± 0,011 | 0,0085 | 3,24 | 86,83 ± 0,53% | 12,23% | 0,965 |
| PerExpert (experimental) | 0,221 ± 0,012 | 0,0089 | 3,49 | 86,37 ± 0,54% | 12,72% | 1,112 |
| Per-layer mix (no publicado) | 0,262 ± 0,012 | 0,0108 | 3,82 | 85,83 ± 0,55% | 14,37% | 1,082 |

Mediciones de velocidad aportadas por el autor:

| Entorno | Build | Prefill | Decode |
|---|---|---|---|
| RTX PRO 6000, llama-server | Q4-uniform | no disponible | 55-57 tok/s |
| RTX PRO 6000, llama-server, `--n-cpu-moe 17` | PerExpert (Q8_0) | no disponible | 6-9 tok/s |
| Mac, MLX Q4-uniform (magma-mlx) | Q4-uniform MLX | ~1.300 tok/s | 37-57 tok/s |
| Mac, llama.cpp Metal sobre GGUF | Q4-uniform GGUF | 140 tok/s | 11,4 tok/s |

Notas del autor sobre la medicion: la muestra de dos chunks es pequena, por lo que diferencias de aproximadamente una sigma son ruido; la ruta de referencia es determinista (el Q8_0 puntuado contra si mismo da KLD 0,000000 y 100% de top-1). Ademas, la tabla n-gram (PLE) del Q8_0 por si sola, frente a la tabla BF16 sin perdida, cuesta KLD 0,171 y 13 puntos de top-1, un efecto mayor que cualquier cuantizacion de expertos probada.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 188 GB de pesos en el contenedor Q8_0; no cabe integramente en ninguna GPU consumer ni en una unica GPU de 96 GB.
- GPU recomendadas: RTX PRO 6000 (96 GB) con offload parcial de expertos a CPU mediante `--n-cpu-moe 17`; para carga completa haria falta un nodo multi-GPU con al menos 192 GB de VRAM agregada (por ejemplo, 2x H100 80 GB o 2x A100 80 GB no bastan; se necesitan 3x A100 80 GB o 2x H200 141 GB).
- GPU consumer: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en configuraciones de 48 GB; requeriria offload masivo a RAM del sistema y un rendimiento muy por debajo de los 6-9 tok/s medidos.
- Opciones de despliegue: llama.cpp estandar (llama-server con `--jinja`), LM Studio y Ollama para la variante Q4; para esta variante PerExpert el autor solo garantiza llama.cpp estandar. Existen builds alternativos de la familia para vLLM (W4A16 con compressed-tensors) y MLX (mlx-lm / mlx-serve y Magma).
- Latencia y throughput: 6-9 tok/s en decodificacion con una RTX PRO 6000 y 17 capas MoE en CPU; sin datos de prefill para esta variante.
- Almacenamiento: 191 GB de repositorio, mas espacio temporal para la descarga de los 6 shards.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Magma-Coder-GGUF-PerExpert (esta ficha) | ~177 mil M totales | no disponible | GGUF Q8_0, llama.cpp | Qwen Community 1.0 | Experimental; KLD 0,221; 188 GB; 6-9 tok/s con offload |
| Qwen3.8-Flash-Next-Magma-Coder-GGUF (Q4-uniform) | ~177 mil M totales | no disponible | GGUF Q4, llama.cpp / LM Studio / Ollama | Qwen Community 1.0 | Recomendado por el autor; KLD 0,207; 55-57 tok/s en RTX PRO 6000 |
| Qwen3.8-Flash-Next-Magma-Coder-W4A16 | ~177 mil M totales | no disponible | W4A16 compressed-tensors, vLLM | Qwen Community 1.0 | Misma base, orientado a servidor con vLLM |
| Qwen3.8-Flash-Next-Base-GGUF (Q8_0 de Unsloth) | ~177 mil M totales | no disponible | GGUF Q8_0, llama.cpp | Qwen Community 1.0 | Referencia sin cuantizacion adicional; mayor tamano |

No se dispone de datos de benchmarks estandar que permitan comparar el rendimiento de tarea frente a modelos de otros fabricantes; la comparacion disponible es exclusivamente interna a la familia Magma-Coder y se basa en divergencia KL respecto a la referencia Q8_0.

## Limitaciones y advertencias

- Resultado negativo documentado: el propio autor indica que la asignacion PerExpert no supera a la cuantizacion uniforme de 4 bits en su prueba KL (0,221 frente a 0,207 de media; ratio PPL 1,112 frente a 0,965). No debe interpretarse como una mejora de calidad.
- Muestra de evaluacion pequena: dos chunks de 4.096 tokens y unas 4.000 posiciones puntuadas; diferencias de aproximadamente una sigma son ruido estadistico.
- Cuantizacion no oficial: el repositorio no esta afiliado ni respaldado por Qwen ni por Alibaba, y no ha pasado por el proceso de publicacion del modelo original.
- Tamano prohibitivo: 188 GB en disco y en memoria; el despliegue realista exige offload a CPU con una caida de rendimiento de casi un orden de magnitud (6-9 tok/s frente a 55-57 tok/s).
- Cuello de botella no resuelto en la tabla n-gram (PLE): segun el autor, la tabla n-gram del Q8_0 por si sola introduce KLD 0,171 y 13 puntos de perdida de top-1, un efecto mayor que la cuantizacion de expertos; es el siguiente frente de trabajo declarado.
- Licencia Qwen Community License 1.0: obliga a conservar avisos de copyright y licencia en todas las copias; el texto disponible se interrumpe en la clausula sobre productos o servicios comerciales con mas de 100 millones de usuarios, por lo que deben consultarse los terminos completos en el fichero `LICENSE` del repositorio antes de un uso comercial.
- Idiomas soportados no documentados en la informacion disponible; no se puede garantizar un comportamiento multilingue homogeneo.
- Longitud de contexto no documentada en la informacion disponible; no se debe asumir la ventana del modelo base sin verificarla.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor; al ser una cuantizacion de un modelo base sin ajuste adicional, hereda los sesgos del modelo original, que no se detallan.
- Trazabilidad de la calibracion limitada: el corpus y la imatrix no se distribuyen, aunque se describe su composicion; el 60% del bloque agentico proviene de transcripciones privadas del autor, lo que dificulta la replicacion exacta.
- Uso previsto experimental: el autor lo publica como caracteristica de Magma y para experimentos, no como una build recomendada para produccion; para uso diario remite a la variante Q4-uniform.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF-PerExpert
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante recomendada Q4-uniform GGUF: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-GGUF
- Variante MLX Q4-uniform: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-MLX
- Variante W4A16 para vLLM: https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-W4A16
- Variante MLX PerExpert (solo Magma): https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Magma-Coder-MLX-PerExpert
- Modelo base sin tocar en Q8_0 (Unsloth): https://huggingface.co/darrellbest/Qwen3.8-Flash-Next-Base-GGUF
- Dataset de calibracion para tool calling: NousResearch hermes-function-calling-v1 (referenciado en la model card, sin enlace directo disponible)
- Resultados de busqueda web: sin enlaces relevantes; el unico resultado devuelto no guarda relacion con el modelo.
