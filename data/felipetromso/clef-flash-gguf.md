# felipeTromso/clef-flash-GGUF

## Resumen

Clef-Flash GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Cloudflare/clef-flash, un modelo de decision de aproximadamente 9.075 millones de parametros (9B) publicado bajo licencia Apache-2.0. La conversion la firma el usuario felipeTromso y su objetivo es permitir que un modelo de 9B quepa y funcione en una maquina de 16 GB mediante llama.cpp, con la particularidad de que la cabeza de decision se mantiene siempre en Q8_0 mientras que solo el backbone sigue el nivel de cuantizacion elegido.

El modelo no es un generador de texto: lee un estado (state) junto con preguntas tipadas (`choice`, `noul`, `score`) y devuelve una probabilidad para cada respuesta permitida. Es, por tanto, un modelo de decision estructurada y clasificacion, servido a traves del endpoint `POST /v1/systemone` de `llama-server`, no mediante los endpoints habituales de chat completion. Esto lo situa en una categoria distinta a la de los LLM generativos: se usa como motor de enrutado, clasificacion y puntuacion dentro de pipelines.

La relevancia actual del artefacto esta en su caracter practico y medido: el autor documenta la concordancia de cada nivel de cuantizacion con el BF16 original, el desplazamiento medio de probabilidad, el consumo de memoria en funcion del tamano de la peticion y una advertencia concreta sobre un bug de Metal en versiones antiguas de llama.cpp. Los idiomas declarados son ingles y portugues, y el repositorio ocupa 24,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision estructurada; el modelo base es Cloudflare/clef-flash) |
| Parametros totales | 9.075.566.084 (aproximadamente 9,08B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible como contexto nativo declarado; en las pruebas de memoria se han usado configuraciones de hasta 16.384 tokens de contexto reservado |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K (backbone); la cabeza de decision (`dec.blk.*` y `decision.*`) permanece en Q8_0 en todos los niveles |
| Idiomas soportados | ingles (en), portugues (pt) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (generado tambien un BF16 GGUF intermedio) |

Ficheros publicados:

| Fichero | Tamano | Misma respuesta que BF16 | Desplazamiento medio de probabilidad |
|---|---|---|---|
| clef-flash-Q6_K.gguf | 7,49 GB | 98,6% | 0,012 |
| clef-flash-Q5_K_M.gguf | 6,59 GB | 95,7% | 0,031 |
| clef-flash-Q4_K_M.gguf | 5,74 GB | 94,4% | 0,045 |
| clef-flash-Q3_K_M.gguf | 4,75 GB | 90,2% | 0,077 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Cloudflare/clef-flash mas alla de su naturaleza: es un modelo de decision de 9B con licencia Apache-2.0 que no genera texto y que, dada una entrada compuesta por un estado y un conjunto de preguntas tipadas, emite una distribucion de probabilidad sobre las respuestas permitidas. Los tipos de pregunta documentados son `choice` (eleccion entre criterios), `noul` (pregunta de si/no, presumiblemente "no/null" como opcion) y `score` (puntuacion sobre una lista ordenada de criterios).

Sobre el proceso de cuantizacion si hay detalle tecnico completo. El autor partio de los safetensors originales de Cloudflare/clef-flash, ejecuto `convert_hf_to_gguf.py --outtype bf16` y despues `llama-quantize --tensor-type '^dec=q8_0' <bf16> <out> <NIVEL>` con llama.cpp `0.6.0-dev`, build 11459 (commit `f498f864f`), usando la imagen `ghcr.io/ggml-org/llama.cpp:full-cuda`. La cabeza de decision, de unos 245 MB en BF16, se fuerza a Q8_0 en todos los niveles para preservar la calibracion de las probabilidades. No se uso imatrix porque, segun el autor, llama.cpp no puede calcular uno para un modelo de decision.

## Capacidades

- Clasificacion de texto mediante preguntas tipadas: dado un estado textual, responde con probabilidades sobre opciones de tipo `choice`, `noul` y `score`.
- Salida estructurada con probabilidades por opcion, apta para umbrales y logica de decision posterior.
- Enrutado de casos: asignacion de una entrada a una categoria o equipo responsable segun criterios definidos.
- Puntuacion ordinal: asignacion de un nivel dentro de una escala de criterios ordenados (por ejemplo, urgencia).
- Deteccion de atributos binarios mediante preguntas `noul` (por ejemplo, si un cliente esta irritado).
- Multilingue limitado a ingles y portugues.
- No dispone de generacion de texto: no escribe respuestas, solo devuelve probabilidades.
- No se documenta soporte de tool calling ni de function calling en el sentido de los LLM generativos.
- No se documenta vision ni audio; el autor indica explicitamente que no hay `mmproj` (modelo multimodal) incluido.
- Compatible con `endpoints_compatible` y con el endpoint propietario `POST /v1/systemone` de `llama-server`.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del cliente y una pregunta `choice` con criterios como `financeiro`, `entrega` o `tecnico`, y devuelve la probabilidad de cada equipo. Encaja porque evita construir un clasificador ad hoc y ofrece una distribucion calibrada en lugar de una etiqueta dura.
- Deteccion de urgencia en atencion al cliente: con una pregunta `score` sobre niveles como "puede esperar", "esta semana", "hoy" o "ahora", el sistema puede priorizar la cola segun la probabilidad acumulada de los niveles mas altos.
- Analisis de sentimiento operativo: una pregunta `noul` del tipo "¿el cliente esta irritado?" permite activar protocolos de escalado cuando la probabilidad supera un umbral configurable.
- Triaje en pipelines de moderacion: clasificacion de contenido entrante en categorias predefinidas antes de pasarlo a un modelo generativo, reduciendo coste y latencia al filtrar casos.
- Etiquetado asistido de datos: uso del modelo como anotador probabilistico sobre corpus en ingles o portugues, aprovechando la concordancia medida con el BF16 para mantener consistencia entre lotes.
- Despliegue en hardware limitado: al caber en una maquina de 16 GB con los niveles Q3_K_M a Q5_K_M, permite ejecutar clasificacion estructurada en estaciones de trabajo sin GPU de datacenter o incluso en CPU.
- Automatizacion de encuestas y formularios: puntuacion de respuestas abiertas sobre escalas ordinales definidas por el desarrollador, con la probabilidad como medida de confianza.

## Benchmarks y rendimiento

Resultados declarados por el autor. La columna "typed-decisions" es concordancia con la etiqueta gold (media de tres muestras de un modelo profesor, no exactitud real); la columna "PT-BR bench" es exactitud balanceada, media de 7 tareas en portugues. Los niveles cuantizados respondieron a la mitad de los items y la fila BF16 corresponde a BF16 sobre esa misma mitad.

| Nivel | typed-decisions (concordancia con gold) | PT-BR bench (exactitud balanceada, media de 7 tareas) |
|---|---|---|
| BF16 (18,16 GB) | 0,711 | 0,654 |
| Q6_K | 0,701 | 0,662 |
| Q5_K_M | 0,701 | 0,642 |
| Q4_K_M | 0,704 | 0,639 |
| Q3_K_M | 0,678 | 0,651 |

Detalles de los conjuntos de evaluacion:

- LocalLLaMA/typed-decisions, split de test: 200 casos, 1.000 decisiones, en ingles.
- felhen-ai/ptbr-typed-decisions-bench, split de test: 7 tareas en portugues, hasta 250 items por tarea (1.630 en total), etiquetas de origen, texto recortado a 3.500 caracteres y orden de opciones aleatorizado por item.

Segun el autor, con 1.000 decisiones el error estandar es de aproximadamente 1,4 puntos, por lo que Q4_K_M, Q5_K_M y Q6_K no son separables del BF16 en estos conjuntos; la columna de concordancia de la primera tabla seria la medida mas fina. Q3_K_M cambia una respuesta de cada diez.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas la cache de contexto. Tamano de fichero: 4,75 GB (Q3_K_M), 5,74 GB (Q4_K_M), 6,59 GB (Q5_K_M) y 7,49 GB (Q6_K). El BF16 completo ocupa 18,16 GB.
- Memoria medida en CPU (x86, `-ngl 0`, `--parallel 1`, `-c` = `-b` = `-ub`), un servidor nuevo por fila:

| Nivel | Contexto (`-c`) | Tokens de la peticion | RSS maximo |
|---|---|---|---|
| Q3_K_M | 4096 | 374 | 5,7 GiB |
| Q3_K_M | 2048 | 1.870 | 6,9 GiB |
| Q3_K_M | 4096 | 3.400 | 8,5 GiB |
| Q4_K_M | 4096 | 374 | 6,6 GiB |
| Q4_K_M | 2048 | 1.870 | 7,8 GiB |
| Q4_K_M | 4096 | 3.400 | 9,4 GiB |
| Q4_K_M | 8192 | 6.800 | 13,0 GiB |
| Q4_K_M | 16384 | 11.560 | 18,6 GiB |
| Q5_K_M | 4096 | 374 | 7,4 GiB |
| Q5_K_M | 4096 | 3.400 | 10,2 GiB |
| Q5_K_M | 8192 | 6.800 | 13,8 GiB |
| Q5_K_M | 16384 | 11.560 | 19,4 GiB |

- Regla aproximada aportada por el autor: tamano del fichero, mas unos 0,13 GiB por cada 1.000 tokens de contexto reservado, mas unos 0,93 GiB por cada 1.000 tokens de la peticion. Conviene mantener `-c` cerca del mayor tamano de peticion previsto.
- GPU recomendadas: el autor uso una RTX 3090 para las pruebas de calidad. No se especifican otras GPU. El objetivo declarado es que funcione en una maquina de 16 GB.
- Cabe en GPU de consumo: si, siempre que se elija el nivel de cuantizacion adecuado al presupuesto de VRAM y se ajuste el contexto. Q3_K_M y Q4_K_M son los candidatos naturales para GPUs de 8 a 12 GB con contexto moderado.
- Opciones de despliegue: llama.cpp, concretamente `llama-server`, con el endpoint `POST /v1/systemone`. Comando de ejemplo: `llama-server -m clef-flash-Q4_K_M.gguf -c 4096 -b 4096 -ub 4096 --parallel 1`. Ollama, vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.
- Notas de backend: CUDA y CPU (x86) devuelven la misma respuesta para la misma peticion (comprobado con Q5_K_M). En Apple Silicon (Metal) es obligatorio usar llama.cpp b11475 o posterior, porque builds anteriores tienen un bug que aplana las probabilidades (issue #30064, corregido en el PR #30100); con b11459 en un M5, un fichero que respondia 0,92 en CUDA respondia 0,33 en Metal.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de decision estructurada comparables. La comparacion mas util disponible es contra el propio modelo base sin cuantizar y entre los niveles de cuantizacion publicados.

| Modelo | Parametros | Formato | Concordancia typed-decisions | PT-BR bench | Licencia |
|---|---|---|---|---|---|
| Cloudflare/clef-flash (BF16) | 9,08B | safetensors / BF16 | 0,711 | 0,654 | apache-2.0 |
| felipeTromso/clef-flash-GGUF Q6_K | 9,08B | GGUF | 0,701 | 0,662 | apache-2.0 |
| felipeTromso/clef-flash-GGUF Q5_K_M | 9,08B | GGUF | 0,701 | 0,642 | apache-2.0 |
| felipeTromso/clef-flash-GGUF Q4_K_M | 9,08B | GGUF | 0,704 | 0,639 | apache-2.0 |
| felipeTromso/clef-flash-GGUF Q3_K_M | 9,08B | GGUF | 0,678 | 0,651 | apache-2.0 |

Modelos alternativos de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto. Cualquier caso de uso que espere respuestas en lenguaje natural requiere un modelo generativo adicional; Clef-Flash solo produce probabilidades sobre opciones predefinidas.
- El numero de descargas y de "me gusta" es cero, por lo que no hay validacion independiente de la comunidad sobre estos ficheros.
- Los resultados de typed-decisions son concordancia con la media de tres muestras de un modelo profesor, no exactitud frente a una verdad objetiva; el autor lo advierte explicitamente.
- El tamano de los conjuntos de evaluacion (1.000 decisiones en ingles, hasta 1.630 items en portugues) implica un error estandar de unos 1,4 puntos, lo que impide separar Q4_K_M, Q5_K_M y Q6_K del BF16 en esas pruebas.
- Q3_K_M altera una respuesta de cada diez respecto al BF16 y presenta un desplazamiento medio de probabilidad de 0,077; puede ser insuficiente cuando el umbral de decision es ajustado.
- Soporte de idiomas limitado a ingles y portugues; no hay datos sobre otros idiomas.
- No existe `mmproj`, por lo que no hay capacidades multimodales.
- No se pudo calcular imatrix para este tipo de modelo, lo que limita las tecnicas habituales de calibracion de cuantizacion.
- En Apple Silicon es imprescindible llama.cpp b11475 o superior; con builds anteriores las probabilidades se aplanan y las decisiones dejan de ser fiables.
- El consumo de memoria crece con el tamano de la peticion, no solo con el fichero; hay que dimensionar `-c`, `-b` y `-ub` segun el mayor caso previsto.
- Las cifras de memoria publicadas son de CPU (x86) y no cubren Metal ni CUDA con esos tamanos de peticion, ni el nivel Q6_K.
- No se documentan sesgos especificos del modelo; al ser un modelo de decision, el riesgo de alucinacion se manifiesta como confianza mal calibrada en opciones incorrectas mas que como texto inventado.
- Licencia Apache-2.0, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base Cloudflare/clef-flash.

## Enlaces

- Repositorio GGUF: https://huggingface.co/felipeTromso/clef-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Dataset de evaluacion en ingles: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset de evaluacion en portugues: https://huggingface.co/datasets/felhen-ai/ptbr-typed-decisions-bench
- Issue de llama.cpp sobre el bug de Metal: https://github.com/ggml-org/llama.cpp/issues/30064
- Pull request que corrige el bug de Metal: https://github.com/ggml-org/llama.cpp/pull/30100
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
