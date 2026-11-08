# mvbalaji/Odyssey_PyPro_10M

## Resumen

Odyssey_PyPro_10M es un artefacto de investigación publicado por el usuario mvbalaji en Hugging Face que implementa una red neuronal recurrente de umbrales fijos capaz de transformar peticiones en inglés acotado en funciones Python completas, byte a byte. No es un modelo de lenguaje preentrenado: sus pesos no se obtuvieron mediante descenso de gradiente, sino que fueron compilados a partir de una gramática simbólica inducida por un aprendiz determinista sobre 1.024 ejemplos proporcionados por un profesor (un LLM de código). El resultado es una red de 2.880 unidades binarias recurrentes con conexiones en {−1, 0, +1} y umbrales enteros, empaquetada en cinco tensores enteros de 9,8 MB.

El modelo ocupa 9.823.940 posiciones nominales de parámetros (de ahí el "10M" del nombre), aunque solo 2.877 unidades están activas y las conexiones no nulas son muy dispersas (R: 7.708, I: 4.812, O: 481). Su dominio es deliberadamente estrecho: funciones que aceptan un `list[int]` y aplican una o dos operaciones de un conjunto cerrado de 21 familias (filtros, mapas, transformaciones de lista y reducciones), con nombres de función y parámetro entre comillas dobles. Emite `# UNSUPPORTED` cuando la petición cae fuera de ese dominio.

Su relevancia es fundamentalmente metodológica: demuestra que es posible compilar una interfaz en lenguaje natural acotada directamente en los pesos de una red recurrente sin entrenamiento, con inferencia en CPU a unos 40 ms por petición y sin multiplicaciones de matrices ni atención. Es un caso de estudio sobre compilación neuronal, programación en espacio de pesos y evaluación pre-registrada, no una herramienta para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | rsat-v1: red recurrente de umbrales binarios (2.880 unidades), 8 ticks por byte |
| Parametros totales | 9.823.940 posiciones nominales (9,8 MB en safetensors) |
| Parametros activos | 2.877 unidades activas; conexiones no nulas: R 7.708, I 4.812, O 481 |
| Longitud de contexto | Peticion de entrada de hasta 512 bytes ASCII; salida byte a byte con marcador de fin |
| Tipos de cuantizacion | Pesos enteros nativos (conexiones en {−1, 0, +1}, umbrales int16); no aplica cuantizacion adicional |
| Idiomas soportados | Ingles acotado (ASCII, frases ensenadas); salida en Python |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cinco tensores enteros) + runtime Python (`runtime.py`, `sched.py`, `odyssey_pypro.py`) |

## Arquitectura y entrenamiento

La red rsat-v1 consta de 2.880 unidades binarias recurrentes y un alfabeto de 260 simbolos (bytes mas BOS, EOS, SEP y PAD). Cada byte de entrada se procesa en 8 ticks sincronos a traves de 270 canales de entrada (simbolo, modo y 8 fases de reloj). Las matrices recurrentes `R` (2880×2880), de entrada `I` (2880×270) y de salida `O` (260×2880) contienen exclusivamente valores en {−1, 0, +1}, con umbrales `theta` y `bias` de salida en int16. La inferencia consiste en acumulacion con signo y umbralizacion por paso, sin multiplicacion de matrices, sin atencion y sin GPU; el estado se reinicia a cero en cada peticion y la generacion comienza en SEP realimentando cada byte emitido.

Los pesos no se entrenaron con descenso de gradiente. Un aprendiz simbolico determinista indujo la interfaz en ingles a partir de 1.024 ejemplos escritos por un profesor (un LLM de codigo), y un compilador en tiempo de construccion bajo esa interfaz, junto con un backend de generacion de codigo heredado, a los numeros de una unica red fija. El autor etiqueta el proceso como "compilacion neuronal supervisada por profesor y libre de gradientes". El repositorio incluye un directorio `provenance/` con la gramatica inducida (cada regla lista los ejemplos de ensenanza que la soportan), los priors declarados, el contrato de tarea, la pre-registracion, el historial de desarrollo, el registro de construccion y los diagnosticos.

## Capacidades

- Generacion de codigo Python a partir de peticiones en ingles acotado: funciones que reciben un `list[int]` y aplican una o dos operaciones en el orden de las clausulas.
- Filtros contra constante: `>`, `>=`, `<`, `<=`, `==`, `!=`.
- Mapas: suma, resta o multiplicacion por constante, negacion, valor absoluto y cuadrado.
- Transformaciones de lista: orden ascendente, orden descendente, inversion, deduplicacion estable y tomar los primeros n.
- Reducciones (solo en ultima posicion): suma, conteo, minimo y maximo (min y max de lista vacia devuelven 0).
- Cobertura declarada de 21 familias de operaciones, 119 ajustes de profundidad 1 y 357 pares ordenados legales de profundidad 2.
- Rechazo explicito con `# UNSUPPORTED` cuando la peticion cae fuera del dominio.
- Sin soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Sin capacidades multilingues: solo ingles ASCII acotado con unas 3 formulaciones ensenadas por operacion.

## Casos de uso

- Docencia sobre compilacion neuronal: el repositorio permite ejecutar una red que genera codigo sin entrenamiento y comparar su comportamiento con el de un LLM, usando `examples.py` y los paneles de confirmacion como material de laboratorio.
- Investigacion en programacion en espacio de pesos: sirve como referencia reproducible (hash canonico `269051304c640c95536fd76e837523c3c720197213d2ea4da705e6a92371de36`) para estudiar como se codifica una gramatica en conexiones enteras.
- Generacion de utilidades triviales sobre listas de enteros en entornos sin GPU: filtrar, ordenar, deduplicar o reducir listas con una peticion en ingles y ~40 ms por peticion en un solo nucleo de CPU.
- Evaluacion de robustez y rechazo: el panel F (128 peticiones que deben rechazarse, 110 rechazos correctos, 85,9%) es un caso practico para estudiar fallos de un modelo de dominio cerrado.
- Pruebas de sandboxing de codigo generado: el propio autor recomienda tratar la salida como no confiable, lo que convierte al modelo en un banco de pruebas para pipelines de ejecucion aislada.
- Prototipado de interfaces de lenguaje natural acotadas: demuestra el patron de inducir una gramatica desde ejemplos y compilarla en un runtime determinista, aplicable a asistentes de dominio muy restringido.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de confirmacion fresco, extraido tras congelar el modelo:

| Panel | n | Fuente exacta | Ejecuta correctamente |
|---|---|---|---|
| A: formulaciones ensenadas, nombres y numeros nuevos | 256 | 256 | 256 |
| B: 72 pares de operaciones nunca vistos en ensenanza | 256 | 256 | 256 |
| C: combinaciones nuevas de piezas de frase ensenadas | 256 | 256 | 256 |
| D: 128 pares minimos (comparacion, constante, nombre, orden) | 256 | 256 | 256 |
| E: sinonimos no vistos (exploratorio) | 128 | 7 | 11 |
| F: peticiones que deben rechazarse | 128 | 110 rechazos correctos | — |

La puerta pre-registrada exigia ≥ 95% de rechazo correcto y el panel F alcanzo 85,9%, por lo que no se supero. Las comprobaciones de ejecucion usaron 76 listas de entrada por programa en un sandbox de sistema operativo, contra un interprete independiente, con tipos estrictos y verificacion de mutacion de entrada; el autor las describe como pruebas finitas, no como demostraciones formales. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es puramente CPU con aritmetica entera.
- Memoria: el archivo `model.safetensors` ocupa 9,8 MB; el runtime es Python con NumPy y safetensors.
- GPU recomendadas: ninguna; el modelo no usa multiplicacion de matrices ni atencion.
- Cabe en cualquier CPU consumer; latencia declarada de ~40 ms por peticion en un solo nucleo.
- Despliegue: scripts Python incluidos (`odyssey_pypro.py`, `runtime.py`, `sched.py`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible mas alla de la latencia por peticion indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Odyssey_PyPro_10M | 9,8 M nominales (2.877 unidades activas) | 512 bytes de entrada | Red recurrente de umbrales compilada, sin entrenamiento | Apache 2.0 |
| CodeGen-350M-mono | 350 M | 2.048 tokens | Transformer autoregresivo preentrenado en codigo | Apache 2.0 (segun variante) |
| StarCoder2-3B | 3 B | 16.384 tokens | Transformer preentrenado en codigo multilingue | BigCode OpenRAIL-M |
| Qwen2.5-Coder-1.5B | 1,5 B | 32.768 tokens | Transformer preentrenado e instruido en codigo | Apache 2.0 |

La comparacion es asimetrica: los tres alternativos son modelos de lenguaje preentrenados de proposito general para codigo, mientras que Odyssey_PyPro_10M es un compilador neuronal de dominio cerrado sin capacidad de generalizacion fuera de su gramatica. No se dispone de datos de benchmarks comparativos directos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje preentrenado ni comprende ingles sin restricciones; solo interpreta formulaciones cercanas a las ensenadas.
- La puerta pre-registrada de rechazo no se supero (85,9% frente al 95% exigido); acepta tipos de datos no soportados como "a list of dictionaries".
- Palabras clave sobregeneralizadas (`total`, `up`, `drop`) pueden disparar la operacion equivocada; por ejemplo, "compute a running total" se lee como una suma.
- Los sinonimos nuevos fallan mayoritariamente: en el panel E, 41 de 128 peticiones produjeron codigo incorrecto.
- El codigo generado debe tratarse como no confiable y ejecutarse en un sandbox.
- Dominio limitado a funciones `list[int]` con una o dos operaciones y constantes en −5..5; los conteos de "take" van de 0 a 8.
- Sin soporte multilingue ni de idiomas distintos del ingles acotado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion general; las pruebas de ejecucion son finitas y no garantizan correccion.
- Modelo con 0 descargas y 1 like en el momento de la consulta; no hay validacion independiente publicada.

## Enlaces

- Hugging Face: https://huggingface.co/mvbalaji/Odyssey_PyPro_10M
- Perfil del autor: https://huggingface.co/mvbalaji
- Listado de modelos del autor: https://huggingface.co/mvbalaji/models
