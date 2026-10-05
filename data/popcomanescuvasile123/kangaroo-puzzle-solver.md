# Popcomanescuvasile123/kangaroo-puzzle-solver

## Resumen

KangarooPy (publicado en HuggingFace como `Popcomanescuvasile123/kangaroo-puzzle-solver`) no es un modelo de inteligencia artificial, sino una herramienta de criptoanalisis: un solver del problema del logaritmo discreto en curva eliptica (ECDLP) sobre la curva secp256k1, implementado en Python puro y basado en el metodo de Pollard's Kangaroo (tambien llamado metodo lambda). El autor lo presenta como utilidad para resolver exclusivamente "puzzle-uri publice sanctionate", es decir, retos publicos de Bitcoin en los que el creador ha publicado de forma deliberada la clave publica y el intervalo que contiene la clave privada. No hay, por tanto, pesos, tokenizador, arquitectura transformer ni proceso de entrenamiento asociados.

El problema que aborda es concreto: dada una clave publica `P = k·G` sobre secp256k1 y un intervalo conocido `[a, b)` de anchura `W = b − a`, recuperar `k` mediante la busqueda de colision entre dos "manadas" (tame y wild). Su interes practico esta en el terreno de la investigacion criptografica, la docencia y la validacion de soluciones publicadas de retos, no en el procesamiento de lenguaje natural ni en tareas generativas. La implementacion es deliberadamente didactica y portable: Python puro, multiproceso y con dependencia opcional de `gmpy2`.

La relevancia actual del artefacto es limitada y muy acotada. El repositorio acumula 0 descargas y 1 "like" en el momento de la consulta, no declara licencia, no declara idiomas y la fecha de creacion registrada (2026-10-04) es posterior a la fecha de actualizacion, un dato anomalo que conviene tratar con cautela. Ademas, el propio autor reconoce en su documentacion que el rendimiento en Python puro sobre CPU hace inviables los intervalos grandes: a partir de 2^84 bits de anchura se requieren implementaciones en CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica. No es una red neuronal: es un solver de ECDLP sobre secp256k1 basado en el metodo Pollard's Kangaroo (lambda), con dos manadas (tame/wild), puntos distinguidos y saltos de distribucion geometrica |
| Parametros totales | No disponible (no existen pesos; el artefacto es codigo fuente, `kangaroo_solver.py`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. El parametro relevante es la anchura del intervalo de busqueda `W = b − a`, expresada en bits |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible. La model card esta redactada en rumano; la interfaz CLI no documenta idiomas |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | No aplica. El artefacto se distribuye como codigo Python ejecutable (`kangaroo_solver.py`), no como safetensors/GGUF |

## Arquitectura y entrenamiento

No existe entrenamiento. El artefacto implementa un algoritmo determinista de busqueda criptografica. El metodo sigue el pseudocodigo de JeanLucPons/Kangaroo: se generan dos manadas de "canguros", una tame que parte de `d·G` con `d ∈ [a, b)` y otra wild que parte de `P + d·G` con `d ∈ [−W/2, W/2)`. Cada canguro realiza saltos cuya longitud se elige de forma determinista a partir de la coordenada `x` del punto actual, empleando un conjunto de 256 saltos con distribucion geometrica y media aproximada de `√W/2`. Cuando un canguro cae en un punto distinguido (definido como `x % 2^dp == 0`), su posicion se comparte entre procesos. La colision entre una trayectoria tame y una wild permite recuperar el candidato `k ∈ {±(d_t − d_w), ±(d_t + d_w)}`, que se filtra contra el intervalo y se verifica comprobando `k·G == pubkey`.

Las optimizaciones tecnicas declaradas son tres: la inversion modular por lotes mediante el truco de Montgomery, que reduce a una sola inversion por paso de manada; el uso de multiprocessing con un proceso por nucleo; y el soporte opcional de `gmpy2` para acelerar la aritmetica de enteros grandes. El coste teorico de la busqueda es de aproximadamente `2,1·√W` pasos. No se documenta el numero de lineas de codigo, ni dependencias en version, ni cobertura de tests mas alla de los comandos `verify` y `selftest` descritos en la model card.

## Capacidades

- Resolucion de ECDLP sobre secp256k1: recupera la clave privada `k` a partir de una clave publica conocida y un intervalo acotado `[a, b)`.
- Modo `verify`: valida el nucleo criptografico y el parseo de claves publicas contra cuatro vectores reales de la cadena (puzzles #85, #105, #110 y #115).
- Modo `selftest`: genera una `k` sintetica dentro de un intervalo, deriva su clave publica y comprueba que el solver la recupera exactamente (probado a 32, 36 y 40 bits).
- Modo `solve` con parametros `--puzzle`, `--pubkey`, `--bits`, `--a`, `--b` y `--threads`.
- Modo `puzzles`: lista el catalogo de retos conocidos incorporado en la herramienta.
- Paralelizacion por multiprocessing, con un proceso por nucleo.
- Aceleracion opcional mediante `gmpy2`.
- Capacidades que NO posee: generacion de texto, razonamiento, codigo, matematicas generales, vision, audio, tool calling, function calling, comportamiento agentico ni capacidades multilingues. No es un modelo de aprendizaje automatico.

## Casos de uso

- Investigacion sobre ECDLP en secp256k1: permite medir empiricamente la constante de proporcionalidad del metodo lambda frente al valor teorico `2,1·√W` en intervalos pequenos (hasta 2^40 bits), util para validar modelos de coste.
- Validacion de soluciones publicadas de retos: el comando `verify` reproduce las claves publicas on-chain de los puzzles #85, #105, #110 y #115, lo que sirve para comprobar la correccion del nucleo secp256k1 y del parseo de claves.
- Docencia y divulgacion criptografica: el modo `selftest` con `--bits 40` recupera una clave en unos 8 segundos con 2,6 millones de pasos, un escenario reproducible en un portatil para explicar puntos distinguidos, colisiones y el truco de Montgomery en el aula.
- Verificacion de correspondencia clave publica / clave privada: dado un par conocido y un intervalo, la herramienta confirma si la clave privada esta efectivamente en ese rango, algo util en auditorias de esquemas con espacio de claves reducido (por ejemplo, claves generadas con entropia insuficiente).
- Pruebas de referencia (benchmarking) para desarrolladores que escriben sus propios solvers: la tasa declarada de aproximadamente 315.000 pasos por segundo en 2 nucleos sirve como linea base para comparar implementaciones en C, Rust o CUDA.
- Retos CTF y ejercicios de criptografia aplicada: cualquier reto que publique una clave publica y un intervalo acotado de hasta 2^52 bits (unos 11 minutos por nucleo) es resoluble de forma practica.
- Analisis de viabilidad de ataques: la tabla de tiempos estimados por anchura de intervalo permite argumentar por que un espacio de claves de 2^256 bits es inabordable con este metodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de lenguaje (no aplica: no es un modelo de IA). La model card si incluye mediciones de rendimiento criptografico en un entorno "sandbox cpu-basic" con 2 nucleos:

| Prueba | Resultado |
|---|---|
| `verify` con 4 vectores reales (#85, #105, #110, #115) | PASS |
| `selftest` a 32 bits | PASS, clave recuperada exactamente |
| `selftest` a 36 bits | PASS, clave recuperada exactamente |
| `selftest` a 40 bits | PASS en 8 s, 2,6 millones de pasos (teoria: 2,1·√W ≈ 1,5 millones) |
| Velocidad medida | ~315.000 pasos/s con 2 nucleos |

Tiempos estimados por anchura de intervalo declarados por el autor, por nucleo:

| Anchura del intervalo (W) | Tiempo estimado |
|---|---|
| 2^36 | Segundos |
| 2^40 | ~10 s |
| 2^44 | ~1 min |
| 2^48 | ~3 min |
| 2^52 | ~11 min |
| 2^60 | ~3 h |
| 2^84 o superior (por ejemplo, puzzle #85) | Anos; requiere CUDA (RCKangaroo o JeanLucPons/Kangaroo) |

## Requisitos de hardware

- Inferencia: no aplica; no hay modelo que ejecutar, sino un script Python.
- CPU: el autor reporta mediciones con 2 nucleos (entorno "cpu-basic"). Al usar multiprocessing, el rendimiento escala con el numero de nucleos, aunque no se documenta la curva de escalado.
- Memoria RAM: no disponible.
- GPU: no se requiere GPU para los intervalos pequenos (hasta 2^52 bits). Para 2^84 bits o mas el propio autor indica que es necesario recurrir a implementaciones CUDA, en concreto RCKangaroo o JeanLucPons/Kangaroo.
- GPU recomendadas: no disponible en la informacion proporcionada. La model card no especifica modelos de GPU ni VRAM.
- Viabilidad en GPU de consumo: no disponible. Solo se afirma que las implementaciones CUDA alternativas son necesarias para intervalos grandes.
- Opciones de despliegue: ejecucion directa como script (`python kangaroo_solver.py <comando>`). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ningun servidor de inferencia, ya que no se trata de un modelo de pesos.
- Latencia y throughput: ~315.000 pasos/s con 2 nucleos; `selftest` de 40 bits completo en 8 s con 2,6 millones de pasos.

## Comparativa con modelos similares

No se trata de un modelo de IA, por lo que la comparacion se establece con otras implementaciones del mismo algoritmo de resolucion de ECDLP. La informacion disponible sobre las alternativas es limitada; los datos no confirmados se marcan como no disponibles.

| Herramienta | Lenguaje / aceleracion | Intervalos factibles | Licencia | Disponibilidad |
|---|---|---|---|---|
| KangarooPy (`kangaroo-puzzle-solver`) | Python puro, CPU, multiprocessing, `gmpy2` opcional | Hasta 2^52 bits en minutos; 2^60 en horas; inviable desde 2^84 | No disponible | HuggingFace, 0 descargas, 1 like |
| JeanLucPons/Kangaroo | C++ con soporte CUDA (segun la model card) | Intervalos grandes (la model card lo cita como alternativa para 2^84+) | No disponible | Repositorio publico en GitHub (citado como referencia del pseudocodigo) |
| RCKangaroo | CUDA (segun la model card) | Intervalos grandes | No disponible | Repositorio publico en GitHub (citado en la model card) |
| Implementaciones propias de Pollard's rho | Variable | Menor eficiencia que lambda en intervalos acotados | No disponible | No disponible |

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo de lenguaje ni una red neuronal. Cualquier expectativa de generacion de texto, razonamiento o tool calling es incorrecta.
- Licencia ausente: la model card no declara licencia alguna, lo que impide determinar si el uso comercial esta permitido. Antes de reutilizar el codigo hay que contactar con el autor.
- Riesgo legal y etico: la herramienta resuelve ECDLP sobre secp256k1. Aunque el autor afirma que solo funciona con clave publica e intervalo conocidos y autorizados, la posesion y el uso de software de recuperacion de claves privadas puede estar sujeto a restricciones legales segun la jurisdiccion. El propio autor subraya que descubrir la clave privada de un monedero ajeno a partir de su direccion es matematicamente imposible (2^256 posibilidades) y constituye robo.
- Alcance criptografico: la busqueda requiere que la clave publica sea conocida. Las direcciones de las que solo se conoce el hash160 (sin pubkey revelada on-chain) no son abordables con kangaroo.
- Escalabilidad: en Python puro sobre CPU, los intervalos de 2^84 bits o superiores son inviables (anos de computo). Los puzzles grandes no resueltos (#120 y posteriores) quedan fuera de alcance.
- Madurez del proyecto: 0 descargas y 1 like, sin historial de mantenimiento, sin issues ni tests mas alla de `verify` y `selftest`. No hay garantia de soporte.
- Anomalia en los metadatos: la fecha de creacion registrada (2026-10-04) es posterior a la de actualizacion (2026-10-04T22:34:25 frente a 22:34:23), un detalle que sugiere metadatos poco fiables.
- Rendimiento declarado no verificado de forma independiente: los 315.000 pasos/s y los tiempos por anchura de intervalo proceden exclusivamente de la model card del autor y no se han contrastado con una reproduccion externa.
- Ausencia de auditoria de seguridad: no se documenta revision del codigo por terceros. La validacion se limita a vectores on-chain y a pruebas sinteticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Popcomanescuvasile123/kangaroo-puzzle-solver
- JeanLucPons/Kangaroo (referenciado en la model card como origen del pseudocodigo y alternativa CUDA): https://github.com/JeanLucPons/Kangaroo
- RCKangaroo (referenciado en la model card como alternativa CUDA): https://github.com/RetiredC/RCKangaroo
- Paper o documentacion tecnica del metodo Pollard's Kangaroo: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
- Blog del autor: no disponible
