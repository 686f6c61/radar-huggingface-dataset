# fMindstormer/tokcpu

## Resumen

`fMindstormer/tokcpu` no es un modelo de lenguaje: es un tokenizador BPE estándar de Hugging Face (un único `tokenizer.json`, sin código personalizado ni `trust_remote_code`) que, al ser invocado con `encode` seguido de `decode`, ejecuta programas de Brainfuck. Cada ciclo de codificación y decodificación equivale a un tick de una máquina de Turing: la cinta es la cadena de texto, un carácter concreto actúa como cabeza, y el token resultante de la fusión BPE funciona como regla de transición.

La implementación aprovecha el mecanismo de merges del BPE: existe una regla de fusión por cada par que la cabeza puede formar con una celda, de modo que la codificación parte la cinta en caracteres sueltos más un token de dos caracteres cuyo id es la regla de la máquina. Ese mismo id está registrado como token añadido cuyo texto es la salida de la regla, así que la decodificación aplica la transición. Cuando la cabeza se detiene no hay merges disponibles y el bucle termina porque la cinta deja de cambiar.

El repositorio incluye el intérprete universal de Brainfuck en la raíz (17.210 reglas de merge), varias variantes con un programa compilado dentro del tokenizador (`hello`, `alphabet`, `grid`, `jumps`, entre 24.173 y 38.265 reglas), la máquina de Turing de 4 estados de la castor ocupado (24 reglas, se detiene a los 107 ticks con 13 unos), un contador binario infinito (7 reglas) y un ordenador basado en autómata celular por bloques (704 reglas). Es relevante como demostración límite de qué puede codificar un artefacto de tokenización, y como banco de pruebas exótico para pipelines que asumen que un tokenizador es inocuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (byte-pair encoding) sobre `tokenizer.json`; no hay red neuronal ni transformer |
| Parametros totales | no disponible (no aplica: no existen pesos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no existe ventana de contexto; la "cinta" es la cadena de entrada completa) |
| Tipos de cuantizacion | no disponible (no aplica: no hay pesos que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json` (no hay safetensors ni GGUF) |
| Reglas de merge (raiz) | 17.210 |
| Reglas de merge (subcarpetas) | 24 (`4-state-busy-beaver`), 7 (`binary-counter`), 704 (`sort`), 24.173–38.265 (`hello`, `alphabet`, `grid`, `jumps`) |
| Profundidad de bucles anidados | hasta 64 niveles |
| Ticks para Hello World | 154.137 (segun la model card) |
| Libreria | transformers (`AutoTokenizer`) |

## Arquitectura y entrenamiento

La pieza central es un modelo BPE con una regla de fusión por cada par (cabeza, celda) posible. Al codificar, la cinta se divide en caracteres individuales más exactamente un token de dos caracteres que contiene la cabeza y la celda sobre la que actúa; el id de ese token es la regla de la máquina de Turing. El mismo id está declarado como token añadido cuyo texto es la salida de la regla, de forma que `decode` reconstruye la cinta aplicando la transición. Una cabeza detenida no tiene merges asociados, por lo que la codificación deja de producir el token de transición y el bucle de puntos fijos (`while decode(encode(tape)) != tape`) termina.

No hay entrenamiento en el sentido habitual: no se han publicado datos de entrenamiento, número de tokens, composición del corpus ni fases de RLHF o DPO, y no aplican. Lo que sí está documentado es el proceso de compilación: las reglas se generan a partir de las fuentes de los programas en `programs/` y del compilador publicado en GitHub. Las variantes por subcarpeta compilan un programa concreto dentro del propio tokenizador, mientras que la raíz implementa un intérprete universal capaz de ejecutar cualquier programa escrito en la cinta.

Entre los detalles técnicos destacables: la cinta se inicializa con `"⊢┃▼가" + programa + "║▲⠀¦" + entrada + "⊣"`, la instrucción `,` lee el primer carácter de la entrada y devuelve 0 cuando se agota, y el ordenador de la subcarpeta `sort` nunca alcanza un punto fijo porque una marca de fase se invierte en cada tick (hay que detenerlo cuando la cinta se repite cada dos ticks).

## Capacidades

- Interpretación completa de Brainfuck sobre la cinta, incluidos bucles anidados hasta 64 niveles.
- Ejecución de programas arbitrarios mediante el intérprete universal de la raíz.
- Ejecución de programas precompilados en subcarpetas (`hello`, `alphabet`, `grid`, `jumps`) sin necesidad de escribir el programa en la cinta.
- Simulación de la máquina de Turing de 4 estados de la castor ocupado: se detiene a los 107 ticks con 13 unos en la cinta.
- Contador binario infinito (`binary-counter`), útil como test de bucles que no terminan.
- Ordenación por autómata celular de bloques (`sort`): cada dos letras de la cinta se reescriben en un tick.
- Entrada de datos por cinta mediante la instrucción `,`, con lectura del primer carácter y 0 al agotarse.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, visión, audio ni modo thinking. No es un modelo generativo.

## Casos de uso

- Docencia de teoría de autómatas y máquinas de Turing: el alumnado puede ejecutar una máquina de Turing paso a paso observando cómo cambia la cinta en cada `encode`/`decode`, sin instalar un simulador, solo con `transformers`.
- Verificación de conformidad de tokenizadores: sirve como caso extremo para comprobar que un pipeline de tokenización (servidor de inferencia, proxy, capa de caché) no altera ni normaliza los ids de tokens, ya que cualquier modificación rompe la semántica de la cinta.
- Pruebas de regresión y fuzzing de librerías: al ser un `tokenizer.json` puro sin código remoto, se puede usar para detectar cambios de comportamiento en versiones de `tokenizers`/`transformers` que afecten a merges, tokens añadidos o decodificación.
- Demostraciones y arte generativo: la variante `sort` produce una cinta que evoluciona de forma visible tick a tick, aprovechable en visualizaciones o instalaciones que muestren la cinta como estado.
- Investigación sobre representación: permite estudiar empíricamente cuánta computación se puede codificar en las reglas de fusión de un BPE, con cifras concretas de merges (17.210 en la raíz) y de ticks (154.137 para Hello World).
- Benchmark de coste de tokenización: mide latencia real de `encode`/`decode` en cargas de trabajo con muchos ciclos, útil para dimensionar bucles de punto fijo en aplicaciones que reutilizan el tokenizador intensivamente.
- Reproducción de resultados clásicos: la castor ocupado de 4 estados se ejecuta en 107 ticks con 24 reglas, lo que permite reproducir el resultado sin escribir un intérprete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos operativos declarados en la model card se resumen a continuación; no son comparaciones de calidad, sino recuentos de reglas y ticks.

| Variante | Reglas de merge | Comportamiento declarado |
|---|---:|---|
| Raiz (interprete universal) | 17.210 | Ejecuta cualquier programa de la cinta; Hello World en 154.137 ticks |
| `hello`, `alphabet`, `grid`, `jumps` | 24.173 – 38.265 | Un programa compilado dentro del tokenizador, con su propio `start.txt` |
| `4-state-busy-beaver` | 24 | Se detiene a los 107 ticks con 13 unos |
| `binary-counter` | 7 | Cuenta en binario indefinidamente |
| `sort` | 704 | Autómata celular de bloques; ordena reescribiendo cada par de letras por tick |

## Requisitos de hardware

- VRAM: no requiere GPU. No hay pesos ni tensores; la ejecución es decodificación y codificación BPE sobre cadenas de texto.
- CPU: cualquier CPU capaz de ejecutar Python y `transformers` es suficiente; el cuello de botella es el número de ticks (154.137 ciclos para Hello World en la raíz).
- GPU recomendadas: ninguna. No aplica A100, H100 ni RTX 4090.
- Cabe en cualquier equipo consumer: sí, por definición, al no necesitar acelerador.
- Despliegue: `AutoTokenizer.from_pretrained("fMindstormer/tokcpu")` con `transformers`, y `hf_hub_download` de `huggingface_hub` para obtener `start.txt` o los ficheros de cada subcarpeta (`subfolder="hello"`, etc.). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no hay modelo que servir.
- Latencia y throughput: no disponibles. La model card solo indica el número de ticks por programa, no tiempos de ejecución ni métricas de rendimiento.

## Comparativa con modelos similares

No existen modelos comparables en el sentido habitual: no hay parámetros, contexto ni benchmarks que contrastar. La comparación relevante es con otros tokenizadores estándar, y en esa categoría los datos de vocabulario y entrenamiento de las alternativas no están en la información proporcionada.

| Artefacto | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fMindstormer/tokcpu` | Tokenizador BPE que interpreta Brainfuck | no disponible (no aplica) | no disponible (no aplica) | Solo recuentos de ticks; sin benchmarks | MIT | HuggingFace + GitHub |
| Tokenizador BPE convencional (p. ej. el de un LLM corriente) | Tokenizador BPE | no disponible | no disponible | no disponible | no disponible | no disponible |
| Simulador de Brainfuck en Python | Intérprete de software | no aplica | no aplica | no disponible | no disponible | no disponible |
| Máquina de Turing didáctica | Simulador | no aplica | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto natural, no responde preguntas y no admite instrucciones en lenguaje natural. Cualquier uso esperando capacidades de LLM fallará.
- Sesgos conocidos: no disponibles. Al no haber datos de entrenamiento ni corpus, no se pueden evaluar sesgos de ese tipo; el comportamiento depende exclusivamente de las reglas compiladas.
- Riesgo de alucinación: no aplica en el sentido habitual, pero cualquier presupuesto de que el tokenizador se limita a tokenizar es falso aquí: `decode` ejecuta una transición de estado.
- Los bucles anidados están limitados a 64 niveles; programas más profundos no están soportados según la documentación.
- La variante `sort` nunca alcanza un punto fijo (la marca de fase se invierte cada tick), por lo que un bucle ingenuo de punto fijo no terminará; hay que detenerla cuando la cinta se repite cada dos ticks.
- El coste es alto en ticks: Hello World requiere 154.137 ciclos, lo que hace inviable su uso para cargas de trabajo grandes o en tiempo real.
- El intérprete universal requiere construir correctamente la cinta inicial (`"⊢┃▼가" + programa + "║▲⠀¦" + entrada + "⊣"`); un formateo incorrecto produce resultados silenciosamente erróneos en lugar de un error explícito.
- Licencia MIT: permite uso comercial y modificación con atribución y conservación del aviso de copyright; no se han declarado restricciones adicionales.
- Depende del comportamiento exacto de `tokenizers` respecto a merges y tokens añadidos; cambios de versión podrían alterar la semántica de ejecución.
- Fecha de creación en HuggingFace: 19 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/fMindstormer/tokcpu
- Repositorio GitHub (explicación completa, compilador y tests): https://github.com/fMindstormer/tokcpu
