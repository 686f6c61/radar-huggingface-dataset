# badtheorylabs/Tinfield-1-Q8_0-GGUF

## Resumen

Tinfield-1-Q8_0-GGUF es la distribucion en 8 bits (Q8_0) del modelo Tinfield-1, publicada por badtheorylabs en formato GGUF y dividida en seis ficheros. Con 176.943.899.520 parametros (unos 176,9 mil millones) y 188,2 GB de repositorio, se presenta explicitamente como la "compilacion de referencia casi sin perdida": el autor la define como el punto de partida recomendado para generar cuantizaciones propias con `llama-quantize`, en lugar de convertir manualmente los pesos BF16 originales, que ocupan 354 GB y exigen un proceso de conversion de varias horas. No esta pensada para servir en produccion diaria, sino como referencia de calidad.

El modelo esta orientado a tareas agenticas, uso de terminal y generacion de codigo, segun las etiquetas del repositorio, y es un ajuste fino del modelo base badtheorylabs/Tinfield-1. La model card indica que el fine-tuning no modifico los expertos enrutados ni la tabla de n-gramas, que son identicos bit a bit al modelo base, lo que permite reutilizar matrices de importancia (imatrix) publicadas por terceros.

La relevancia de esta ficha es practica: es la unica publicacion del proyecto con cifras de divergencia KL como referencia, y su model card documenta con detalle una trampa habitual al cuantizar arquitecturas MoE con llama.cpp (el fallback silencioso de tensores cuya anchura de fila no es multiplo de 256). El repositorio no tiene descargas ni likes registrados y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) enrutados y tabla de n-gramas por capa (`per_layer_token_embd`); detalles completos no disponibles en la model card |
| Parametros totales | 176.943.899.520 (~176,9 mil millones), recuento de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens en el ejemplo de ejecucion de la model card; maximo no confirmado |
| Tipos de cuantizacion | Q8_0 (este repositorio). Para builds propias: K-quants (`q4_K`) en `ffn_gate_exps` y `ffn_up_exps`, y bloques de 32 valores (`iq4_nl`, `q4_0`, `q5_1`, `q8_0`) en `ffn_down_exps` y `per_layer_token_embd` |
| Idiomas soportados | no disponible |
| Licencia | other, `license_name: qwen-community-1.0` (Qwen Community License 1.0), heredada del modelo base |
| Formato de pesos | GGUF, dividido en seis partes (`tinfield-1-Q8_0-00001-of-00006.gguf`) |
| Tamano del repositorio | 188,2 GB |
| Modelo base | badtheorylabs/Tinfield-1 (BF16, 354 GB) |
| Vocabulario | 248.320 entradas segun la anchura de fila de los tensores `token_embd` y `output` |
| Compatibilidad de servicio | Etiqueta `endpoints_compatible`; inferencia via llama.cpp |

## Arquitectura y entrenamiento

La model card no describe la arquitectura completa, pero los nombres de tensor que documenta permiten caracterizarla: se trata de un transformer con mezcla de expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) mas una tabla de n-gramas por capa (`per_layer_token_embd`) que, por si sola, suma 51.000 millones de parametros. Las anchuras de fila documentadas son las siguientes:

| Tensor | Anchura de fila | Uso |
|---|---:|---|
| `ffn_gate_exps`, `ffn_up_exps` | 2560 | cualquier K-quant |
| `ffn_down_exps` | 640 | bloques de 32 valores: `iq4_nl`, `q4_0`, `q5_1`, `q8_0` |
| `per_layer_token_embd` (tabla de n-gramas) | 160 | solo bloques de 32 valores |
| `token_embd`, `output` | 248320 | cualquier K-quant |

La innovacion tecnica relevante es de proceso, no de arquitectura: llama.cpp usa superbloques de 256 valores en los K-quants, de modo que cualquier tensor cuya anchura de fila no sea multiplo de 256 cae silenciosamente a un tipo de cuantizacion mas grande. En este modelo, `ffn_down_exps` (640) y la tabla de n-gramas (160) no cumplen esa condicion; dejar la tabla de n-gramas en el fallback cuesta unos 25 GB de tamano de fichero. La receta publicada para un build de 4 bits (patron que el autor atribuye a Unsloth y NVIDIA) cuantiza solo los expertos enrutados y mantiene el resto en Q8_0, usando `Q8_0` como tipo base para no degradar atencion, routers ni embeddings.

Sobre el entrenamiento no hay datos en la informacion disponible: ni numero de tokens, ni composicion del dataset, ni si hubo RLHF o DPO. La unica referencia al proceso de ajuste es la afirmacion de que el fine-tuning no toco los expertos enrutados ni la tabla de n-gramas, lo que implica que esos tensores son identicos al modelo base y que las estadisticas de la imatrix publicada en `unsloth/Qwen3.8-Flash-Next-GGUF` se pueden reutilizar directamente sin necesidad de generar una nueva matriz de importancia.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y la model card incluye un ejemplo de `llama-server` con plantilla de chat via `--jinja`.
- Uso de terminal y flujos agenticos: las etiquetas `agentic` y `terminal` indican entrenamiento orientado a la operacion de shell y a tareas de multiples pasos.
- Generacion y manipulacion de codigo: etiqueta `code` en el repositorio.
- Tool calling / function calling: soportado, pero condicionado a arrancar el servidor con `--jinja`; sin esa opcion la plantilla de chat se ignora y el tool calling se rompe, segun la propia model card.
- Contexto largo: el ejemplo de despliegue usa `-c 131072` (131.072 tokens) con cache KV cuantizada (`-ctk q8_0`, `-ctv q4_0`).
- Cuantizacion posterior: el modelo esta pensado como fuente para generar builds de menor precision con `llama-quantize` (opciones `--allow-requantize`, `--imatrix`, `--keep-split`, `--tensor-type`).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible en la informacion proporcionada.
- Soporte multilingue: no disponible.

## Casos de uso

- Automatizacion de operaciones en terminal: el modelo puede encadenar comandos, interpretar salidas de shell y corregir errores en pasos sucesivos; es el escenario para el que esta etiquetado de forma explicita y el que justifica el ajuste sobre una arquitectura MoE de 176,9 mil millones de parametros.
- Agentes de codigo multi-paso: con tool calling activado mediante `--jinja`, se puede integrar en un bucle de agente que edite ficheros, ejecute tests y lea resultados, usando el contexto de 131.072 tokens para mantener el estado de un repositorio mediano.
- Base para producir cuantizaciones propias: es el uso principal declarado. Partiendo de este Q8_0 se evita descargar 354 GB de BF16 y ejecutar una conversion de horas; basta con `llama-quantize` aplicando la receta por tensores documentada.
- Evaluacion de calidad por divergencia KL: la model card indica que todas las cifras de calidad publicadas para los builds menores se miden como divergencia KL contra este fichero, por lo que sirve como referencia reproducible en estudios de degradacion por cuantizacion.
- Analisis de repositorios y logs extensos: la ventana de 131.072 tokens permite procesar arboles de codigo o trazas de ejecucion largas sin trocear, algo relevante en depuracion de sistemas distribuidos.
- Asistente conversacional multi-turno para uso interno: con la licencia heredada del modelo base, se puede desplegar como servicio interno en un `llama-server` con plantilla de chat activada.
- Generacion de derivados y fine-tunes: al conservar los expertos y la tabla de n-gramas sin tocar respecto al modelo base, este build es un punto de partida estable para reajustes que no necesiten modificar la parte MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen cifras de calidad para los builds menores, expresadas como divergencia KL contra este fichero Q8_0, pero no incluye ningun valor numerico ni comparacion con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 188,2 GB, a los que hay que sumar la cache KV y el overhead del runtime. Con `-ngl 999` (todas las capas en GPU) se necesitan del orden de 200 GB o mas de memoria de video.
- GPU recomendadas para descarga completa: 3 x A100 80 GB o 3 x H100 80 GB (240 GB), o 2 x H200 de 141 GB (282 GB). Una sola H100 de 80 GB es insuficiente.
- Consumer GPU: no cabe en ninguna configuracion de consumo razonable. El autor indica que los builds Compact (72 GB) y Mini (61 GB) caben en una maquina de 64 GB; el fichero Compact de 72 GB supera esa cifra segun los datos de la propia model card, por lo que conviene verificar el requisito real antes de planificar el despliegue.
- Inferencia en CPU: viable en estaciones de trabajo con 256-512 GB de RAM DDR5 (EPYC o Threadripper), con throughput bajo y no cuantificado en la informacion disponible.
- Memoria unificada: un equipo con 192 GB de memoria unificada queda al limite por el tamano del fichero mas la cache KV, especialmente a 131.072 tokens de contexto.
- Opciones de despliegue: `llama.cpp` / `llama-server` con `--jinja`, `-fa on`, `-ctk q8_0`, `-ctv q4_0`, `-ngl 999` y `-c 131072`. El repositorio esta etiquetado como `endpoints_compatible`, por lo que tambien es servible desde infraestructura compatible con endpoints de HuggingFace.
- Version minima del runtime: llama.cpp en el commit `972d2313` o posterior. Las versiones anteriores no reconocen la arquitectura y fallan al cargar el modelo en lugar de emitir un aviso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tamano | Formato / cuantizacion | Proposito declarado | Licencia |
|---|---:|---|---|---|
| Tinfield-1-Q8_0-GGUF (este) | 188,2 GB | GGUF Q8_0, 6 partes | Referencia casi sin perdida; base para cuantizar | Qwen Community License 1.0 |
| Tinfield-1 | 354 GB | BF16 | Pesos originales; conversion manual a GGUF | Qwen Community License 1.0 |
| Tinfield-1-Compact-GGUF | 72 GB | GGUF | Build para ejecucion en maquina de 64 GB (segun el autor) | Qwen Community License 1.0 |
| Tinfield-1-Mini-GGUF | 61 GB | GGUF | Build para ejecucion en maquina de 64 GB (segun el autor) | Qwen Community License 1.0 |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | GGUF | Modelo base de referencia; publica la imatrix reutilizable | no disponible |

No se dispone de datos de parametros activos, contexto, benchmarks ni licencia de los builds alternativos de la misma familia mas alla de lo indicado, ni de modelos de terceros con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- Tamano prohibitivo: 188,2 GB no estan pensados para servicio diario; la propia model card redirige a los builds Compact y Mini para ese fin.
- Fallback silencioso en cuantizacion: los tensores con anchura de fila no multiplo de 256 se cuantizan peor sin aviso. Se recomienda ejecutar `llama-quantize` con `--dry-run` y revisar el plan por tensor antes de lanzar el proceso completo.
- Dependencia estricta del runtime: requiere llama.cpp en el commit `972d2313` o posterior; versiones antiguas fallan al cargar sin mensajes de advertencia utiles.
- Tool calling fragil: sin `--jinja` la plantilla de chat se ignora y el tool calling deja de funcionar.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo no publica evaluaciones de veracidad ni de tasas de error.
- Idiomas soportados: no disponible, por lo que no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles.
- Parametros activos y arquitectura de atencion: no disponibles; esto impide estimar con precision coste por token y latencia.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Licencia: identificada como `other` con nombre `qwen-community-1.0`. La model card no reproduce las clausulas y se limita a enlazar al fichero LICENSE; hay que revisarlo antes de cualquier uso comercial.
- Los resultados de la busqueda web asociada no contienen informacion relevante sobre este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/badtheorylabs/Tinfield-1-Q8_0-GGUF
- Modelo base: https://huggingface.co/badtheorylabs/Tinfield-1
- Build Compact: https://huggingface.co/badtheorylabs/Tinfield-1-Compact-GGUF
- Build Mini: https://huggingface.co/badtheorylabs/Tinfield-1-Mini-GGUF
- Imatrix del modelo base: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Implementacion de referencia (llama.cpp): https://github.com/ggml-org/llama.cpp
