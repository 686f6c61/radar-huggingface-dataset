# dejanb/tower-of-hanoi

## Resumen

`dejanb/tower-of-hanoi` no es un modelo de inteligencia artificial: es un repositorio de HuggingFace que aloja un unico programa en C, sin dependencias externas, que calcula y verifica el numero minimo de movimientos `F(n,k)` de la Torre de Hanoi con `n` discos y `k` clavijas. El autor es `dejanb`, y el codigo es material complementario del articulo *The Minimum Number of Moves in the Tower of Hanoi with Many Pegs: Closed Form, Optimal Partitions, and Exhaustive Verification*, de D. Batanjac y V. Vuckovic, en estado de envio (submitted) segun la propia model card.

El artefacto implementa la recursion de Frame-Stewart con aritmetica entera de 64 bits exacta para `n <= 64` y `k <= 12`, una forma cerrada basada en la suma de los `n` incrementos menores (donde `2^t` aparece `C(t+k-3, k-3)` veces), la descomposicion multiple de Frame resuelta por programacion dinamica, un generador no recursivo para el caso clasico de tres clavijas, y un verificador por busqueda en anchura sobre el grafo completo de estados (`k^n` estados) para instancias pequenas.

Su relevancia es puramente matematica y computacional: la optimalidad de `F(n,k)` esta demostrada para 3 clavijas (clasico) y 4 clavijas (T. Bousch, 2014), mientras que para 5 o mas clavijas sigue siendo la conjetura abierta de Frame-Stewart. Los resultados de la busqueda web realizada no guardan ninguna relacion con el repositorio y se descartan por completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (programa en C, no es una red neuronal) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (salida en texto plano y LaTeX; comentarios y documentacion en ingles) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no aplica (codigo fuente `hanoi.c` y ficheros de salida `run.log`, `tab_moves.tex`, `tab_bfs.tex`, `fig_growth.tex`) |
| Lenguaje de implementacion | C (sin librerias externas; enlaza con `-lm`) |
| Rango de computo | `n <= 64` discos, `k <= 12` clavijas, aritmetica de 64 bits exacta |
| Verificacion | busqueda en anchura sobre el grafo de estados, hasta ~1,7·10⁷ estados |
| Autor | dejanb (D. Batanjac) y V. Vuckovic (articulo) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de aprendizaje automatico. El repositorio contiene un unico fichero `hanoi.c` compilable con `gcc -O3 -Wall hanoi.c -o hanoi -lm`. Internamente combina cuatro enfoques algoritmicos: (1) la recursion de Frame-Stewart en la forma de Stewart, `F(n,k) = min_m 2F(m,k) + F(n-m,k-1)`, que ademas devuelve el intervalo de particiones optimas `m`; (2) una forma cerrada que construye `F(n,k)` como suma de los `n` incrementos mas pequenos, con la multiplicidad `C(t+k-3, k-3)` para `2^t`, junto con la formula `H(k,d)` de la tesis de diploma de 2002 del primer autor; (3) la descomposicion multiple de Frame, `F(n,k) = 1 + 2·Σ_j F(d_j, j)`, resuelta por programacion dinamica; y (4) una regla derivada de la tesis que lee directamente una particion de Frame optima y monotona a partir de los incrementos, sin minimizacion.

El componente empirico es un verificador por busqueda en anchura que recorre el grafo completo de estados (`k^n`) y calcula el optimo exacto `D(n,k)` para valores pequenos de `n` y `k`, comparandolo con `F(n,k)`. La busqueda confirma `D(n,k) = F(n,k)` en todas las instancias que alcanza, hasta aproximadamente 1,7·10⁷ estados. Ademas se incluye un simulador de secuencias de movimientos explicitas que rechaza movimientos ilegales y un generador no recursivo de tres clavijas en el que cada par de movimientos depende solo del movimiento anterior y de la paridad de la valoracion 2-adica de un contador. No hay datos de tokens, dataset, RLHF ni DPO porque no procede.

## Capacidades

- Calculo exacto de `F(n,k)` mediante recursion de Frame-Stewart para `n <= 64` y `k <= 12`, con aritmetica entera de 64 bits sin perdida de precision.
- Calculo de `F(n,k)` por forma cerrada a partir de la suma de los `n` incrementos menores, con multiplicidades combinatorias explicitas.
- Determinacion del intervalo de particiones optimas `m` en cada paso de la recursion.
- Calculo de la descomposicion multiple de Frame por programacion dinamica.
- Generacion de secuencias de movimientos explicitas y validacion de las mismas mediante un simulador que rechaza movimientos ilegales.
- Generacion no recursiva de la solucion clasica de tres clavijas basada en la paridad de la valoracion 2-adica de un contador.
- Verificacion del optimo exacto `D(n,k)` por busqueda en anchura sobre el grafo completo de estados (`k^n` estados) en instancias pequenas.
- Exportacion de resultados en LaTeX/TikZ (`tab_moves.tex`, `tab_bfs.tex`, `fig_growth.tex`) y volcado de la ejecucion a `run.log`.
- No dispone de generacion de texto, razonamiento en lenguaje natural, codigo, matematicas simbolicas generales, vision, audio, tool calling, function calling, soporte de agentes ni capacidades multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Docencia de recursividad y programacion dinamica: el programa permite al alumnado comparar la recursion de Frame-Stewart con la solucion por programacion dinamica sobre las mismas instancias, y el simulador valida cada secuencia de movimientos generada.
- Verificacion experimental de la conjetura de Frame-Stewart: el verificador por busqueda en anchura contrasta `D(n,k)` con `F(n,k)` hasta unas 1,7·10⁷ estados, lo que permite extender la evidencia empirica sobre instancias pequenas con 5 o mas clavijas.
- Generacion de tablas y figuras para publicaciones: el programa escribe directamente `tab_moves.tex`, `tab_bfs.tex` y `fig_growth.tex`, listos para incluir en un articulo LaTeX sin postprocesado manual.
- Validacion de referencias cruzadas entre metodos: para una misma instancia se pueden comparar el valor de la recursion, el de la forma cerrada, el de la descomposicion de Frame y el de la busqueda exhaustiva, lo que sirve como prueba de consistencia interna de una implementacion.
- Material de referencia para implementaciones en otros lenguajes: el comportamiento exacto documentado para `n <= 64`, `k <= 12` sirve como conjunto de casos de prueba para portar el algoritmo a C++, Rust, Python u otros entornos.
- Generacion de secuencias optimas para simulacion o visualizacion: las secuencias explicitas validadas pueden alimentar animaciones, entornos de ensenanza interactiva o pruebas de simuladores de estado.
- Estudio de crecimiento asintotico: los valores calculados permiten analizar la transicion del crecimiento exponencial (3 clavijas) al polinomial de bajo grado (muchas clavijas), por ejemplo 2⁶⁴−1 movimientos con 64 discos y 3 clavijas frente a 18.433 con 4 clavijas y 385 con 8 clavijas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen evaluaciones de tipo MMLU, HumanEval o GSM8K porque el artefacto no es un modelo de lenguaje. Los unicos datos numericos disponibles son valores calculados de `F(n,k)` y el alcance de la verificacion por busqueda en anchura:

| n | k=3 | k=4 | k=5 | k=6 | k=7 | k=8 |
|---|---|---|---|---|---|---|
| 10 | 1023 | 49 | 31 | 29 | 27 | 25 |
| 20 | 1048575 | 289 | 111 | 89 | 67 | 65 |

| Caso | Valor |
|---|---|
| 64 discos, 3 clavijas | 2⁶⁴−1 movimientos |
| 64 discos, 4 clavijas | 18.433 movimientos |
| 64 discos, 8 clavijas | 385 movimientos |
| Alcance de la verificacion BFS | hasta ~1,7·10⁷ estados |
| Tiempo de ejecucion completa | menos de un minuto en un nucleo de Intel Core i7-7700HQ |

## Requisitos de hardware

- No requiere GPU. Es un binario de CPU con aritmetica entera de 64 bits; no hay rutas de inferencia acelerada ni soporte CUDA, ROCm o Metal.
- CPU de referencia segun el autor: un unico nucleo de un Intel Core i7-7700HQ; la ejecucion completa tarda menos de un minuto.
- VRAM estimada: no aplica. No se especifica consumo de RAM en la informacion disponible; el unico dato de escala es que la busqueda en anchura alcanza unos 1,7·10⁷ estados.
- GPU recomendadas: ninguna; el programa no aprovecha aceleracion por GPU.
- Ejecucion en hardware de consumo: si, cabe en cualquier equipo de escritorio o portatil x86-64 con soporte de compilacion C y enteros de 64 bits.
- Compilacion y despliegue: `gcc -O3 -Wall hanoi.c -o hanoi -lm` seguido de `./hanoi > run.log`. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni ningun servidor de inferencia.
- Latencia y throughput: no disponible mas alla de la referencia de menos de un minuto por ejecucion completa en el i7-7700HQ.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA: el repositorio no es un modelo y no se han identificado alternativas comparables publicadas en la informacion disponible. La comparacion relevante es entre los propios metodos implementados en el mismo programa:

| Metodo | Que aporta | Coste | Alcance |
|---|---|---|---|
| Recursion de Frame-Stewart | Valor de `F(n,k)` e intervalo de particiones optimas | Exponencial en `n`, viable hasta `n <= 64`, `k <= 12` | Depende de la conjetura para `k >= 5` |
| Forma cerrada (suma de incrementos) | `F(n,k)` sin minimizacion, mas la formula `H(k,d)` | Coste combinatorio directo | Depende de la conjetura para `k >= 5` |
| Descomposicion multiple de Frame | `F(n,k)` por programacion dinamica | Programacion dinamica sobre las particiones | Depende de la conjetura para `k >= 5` |
| Busqueda en anchura sobre `k^n` estados | Optimo exacto `D(n,k)` sin supuestos | Exponencial en el numero de estados | Solo instancias pequenas, hasta ~1,7·10⁷ estados |
| Generador no recursivo de 3 clavijas | Secuencia optima directa por paridad 2-adica | Lineal en el numero de movimientos | Solo `k = 3`, donde la optimalidad es clasica |

## Limitaciones y advertencias

- No es un modelo de inteligencia artificial. No genera texto, no razona en lenguaje natural y no debe presentarse ni evaluarse como un LLM, un modelo multimodal o un agente.
- La licencia no esta declarada en la model card ni en la informacion disponible. Antes de cualquier uso comercial, redistribucion o integracion en un producto es imprescindible aclarar los terminos con el autor; sin licencia explicita no hay permiso de uso garantizado.
- Para `k >= 5` clavijas, el valor `F(n,k)` es optimo solo si se cumple la conjetura abierta de Frame-Stewart. Los resultados son correctos respecto a la recursion, no necesariamente respecto al verdadero optimo, salvo en las instancias donde la busqueda en anchura lo confirma.
- La verificacion exhaustiva esta limitada por el crecimiento `k^n` del espacio de estados: en la practica no pasa de unas 1,7·10⁷ estados, por lo que cubre solo valores pequenos de `n` y `k`.
- La aritmetica de 64 bits acota el rango util: `n <= 64` y `k <= 12`. Fuera de ese rango no hay garantia de resultados exactos.
- El repositorio tiene 0 descargas y 0 likes, sin historial de mantenimiento ni issues publicos; es material complementario de un articulo en revision, no una libreria estable con API ni versionado semantico.
- No hay datos de sesgo, alucinacion o rendimiento multilingue, porque no son categorias aplicables a este artefacto.
- Los resultados de la busqueda web proporcionada no estan relacionados con el repositorio y no deben citarse como fuentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dejanb/tower-of-hanoi
- Articulo de referencia: *The Minimum Number of Moves in the Tower of Hanoi with Many Pegs: Closed Form, Optimal Partitions, and Exhaustive Verification*, D. Batanjac y V. Vuckovic (submitted; no se ha facilitado enlace directo, no disponible)
- Demostracion de optimalidad para 4 clavijas: T. Bousch, 2014 (referenciada en la model card; sin enlace disponible)
- Ficheros generados citados en la model card: `run.log`, `tab_moves.tex`, `tab_bfs.tex`, `fig_growth.tex` (alojados en el propio repositorio)
- Otros enlaces relevantes: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el repositorio ni con la Torre de Hanoi.
