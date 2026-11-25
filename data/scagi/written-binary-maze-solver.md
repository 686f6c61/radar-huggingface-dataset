# ScAGI/written-binary-maze-solver

## Resumen

El modelo `ScAGI/written-binary-maze-solver` es una red recurrente de atención dura (*hard-attention*) escrita a mano que resuelve caminos más cortos exactos en rejillas binarias no ponderadas de cuatro vecinos. No es un modelo de lenguaje ni un transformer entrenado: no contiene parámetros aprendidos, datos de entrenamiento ni optimizador. Su autor, ScAGI, lo publica como una implementación determinista de programación en el espacio de pesos (*weight-space programming*), inspirada en el trabajo Looped Weight-Space Programming de MBZUAI-ORYX, pero con vecindades de rejilla cableadas y estado binario exacto.

La arquitectura se compone de 48 conexiones con signo (+1/-1) y 18 umbrales enteros por carril. Cada celda almacena siete bits (visitada, cuatro direcciones de padre en one-hot, punta del camino actual y bandera de pertenencia al camino), empaquetados en un byte en la implementación CUDA. Una primera onda desde el objetivo descubre celdas por distancia de camino más corto y una segunda onda marca la ruta usando los padres del primer descubrimiento. Existe una configuración de 96 conexiones que aplica dos copias independientes a rejillas distintas para duplicar el rendimiento sin aumentar la capacidad por rejilla.

Su relevancia es acotada pero específica: demuestra que una red recurrente con atención dura y pesos fijados a mano puede resolver un problema algorítmico exacto (camino más corto en rejilla) sin entrenamiento, con verificación determinista en CPU y GPU. Ha superado 61/61 casos generados y de borde en dos GPUs distintas, incluyendo rejillas de 100×100 y dos casos bloqueados o inalcanzables. Es una pieza de investigación sobre cómputo en el espacio de pesos, no un componente listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red recurrente de atención dura (*hard-attention*) con pesos fijos escritos a mano; no es transformer ni MoE |
| Parámetros totales | No disponible (48 conexiones con signo y 18 umbrales enteros por carril; no hay parámetros aprendidos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa rejillas de hasta 100×100 en los casos verificados) |
| Tipos de cuantización | No disponible (estado binario de 7 bits por celda empaquetado en un byte en CUDA) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint JSON (`checkpoint.json`) y código Python/CUDA; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La red es recurrente y aplica el mismo bloque de atención dura en cada celda y en cada iteración del bucle. Cada celda lee cuatro vecinos fijos (arriba, abajo, izquierda, derecha) mediante conexiones con signo +1/-1 y compara contra umbrales enteros para decidir transiciones de estado. El estado por celda son siete bits: bandera de visitada, cuatro direcciones de padre en one-hot, punta del camino actual y bandera de pertenencia al camino. La primera onda propaga desde la meta y descubre cada celda a su distancia de camino más corto; la segunda onda retrocede usando los padres registrados en el primer descubrimiento para marcar una ruta más corta.

No hay entrenamiento: no existe optimizador, conjunto de datos ni pesos aprendidos. La configuración de 48 conexiones resuelve una rejilla; la de 96 conexiones ejecuta dos copias independientes sobre rejillas distintas compartiendo un único kernel CUDA compilado, de modo que duplica el rendimiento pero no la capacidad por rejilla. La implementación incluye un checkpoint JSON, un script `prepare.py` que regenera fixtures verificados en CPU y la cabecera de compuertas CUDA, y un benchmark `bench.cu`. El máximo lógico observado en CPU fue de 2.656 iteraciones; en GPU las comprobaciones de terminación se agrupan por lotes, por lo que los lanzamientos de kernel no equivalen a pasos lógicos.

## Capacidades

- Resolución exacta de caminos más cortos en rejillas binarias no ponderadas de cuatro vecinos.
- Detección de casos bloqueados o inalcanzables (verificados dos en la suite de 61 casos).
- Procesamiento de rejillas de hasta 100×100 en los casos probados.
- Ejecución determinista verificada en CPU y en GPU (GTX 1660 SUPER y RTX 2080 Ti).
- Configuración de doble carril (96 conexiones) para procesar dos rejillas en paralelo con un solo kernel CUDA.
- No soporta *tool calling*, agentes, razonamiento multi-paso general, capacidades multilingües, visión, audio ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Verificación de algoritmos de búsqueda en rejilla: sirve como oráculo determinista de caminos más cortos para comparar implementaciones de BFS, A* u otras, ya que produce rutas exactas sin parámetros aprendidos.
- Investigación en programación del espacio de pesos: permite estudiar cómo codificar un algoritmo exacto en conexiones con signo y umbrales fijos, sirviendo de base para experimentos de Looped Weight-Space Programming.
- Docencia de atención dura y redes recurrentes: el modelo ilustra de forma concreta cómo una atención con vecindad fija y estado discreto puede implementar propagación de distancias y retroceso de padres.
- Pruebas de referencia en GPU: el benchmark `bench.cu` con 61 casos permite validar kernels CUDA y comparar latencias entre dispositivos con una carga pequeña y controlada.
- Generación de fixtures sintéticos: `prepare.py` regenera rejillas y máscaras verificadas en CPU que pueden reutilizarse como datos de prueba en pipelines de robótica o planificación sobre rejillas.
- Evaluación de terminación por lotes: el mecanismo de comprobación de terminación agrupada en GPU es un ejemplo práctico para diseñar kernels iterativos con condición de parada dinámica.

## Benchmarks y rendimiento

Los únicos datos publicados son los tiempos de la suite completa de 61 casos (59 caminos más cortos, incluyendo rejillas de 100×100, y dos casos bloqueados), mediana de cinco pasadas en caliente tras un calentamiento, con transferencias de dispositivo y sincronización incluidas; excluyen creación de fixtures, compilación, arranque de CUDA y comparación de salidas.

| GPU | Un carril | Dos carriles |
|---|---:|---:|
| GTX 1660 SUPER | 61,921 ms | 38,720 ms |
| RTX 2080 Ti | 74,037 ms | 47,691 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el estado es un byte por celda más la rejilla de entrada fija, por lo que la huella es mínima (del orden de kilobytes para rejillas de 100×100).
- GPU verificadas: GTX 1660 SUPER y RTX 2080 Ti, ambas con resultados deterministas 61/61 en las dos configuraciones.
- Cabe en GPU de consumo: sí, al menos en las dos GPUs verificadas; para otras arquitecturas NVIDIA se requiere un objetivo de compilador compatible (`-arch=sm_75` en el ejemplo).
- Despliegue: ejecución directa con Python y NumPy para la referencia (`python written_maze.py checkpoint.json`), y compilación CUDA con `nvcc -O3` para el benchmark (`bench.cu`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: mediana de 38,720 ms (dos carriles, GTX 1660 SUPER) a 74,037 ms (un carril, RTX 2080 Ti) para la suite completa de 61 casos; son tiempos de un host concreto y una carga pequeña, no una clasificación general de dispositivos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ScAGI/written-binary-maze-solver | Red recurrente de atención dura escrita a mano | 48 conexiones con signo, 18 umbrales por carril | Rejillas hasta 100×100 (casos verificados) | Ninguno | No disponible | Hugging Face |
| Transformer softmax para laberintos (publicado, citado en la model card) | Transformer entrenado | No disponible | No disponible | Entrenado | No disponible | No disponible |
| Looped Weight-Space Programming (MBZUAI-ORYX) | Marco de programación en espacio de pesos | No disponible | No disponible | No disponible | No disponible | Repositorio del proyecto |

La comparación con alternativas de la misma categoría es limitada: el autor indica explícitamente que su implementación no es una reproducción del transformer softmax publicado para laberintos, y la referencia a Looped Weight-Space Programming es inspiración, no una variante del mismo modelo. No se dispone de datos de rendimiento de esas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural ni soporta tool calling, agentes o capacidades multilingües.
- Dominio restringido a rejillas binarias no ponderadas de cuatro vecinos; no se documenta soporte para grafos ponderados, diagonales u otras topologías.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- No hay parámetros aprendidos ni generalización: el comportamiento es determinista y cableado, sin capacidad de adaptarse a distribuciones nuevas más allá de la lógica implementada.
- Los tiempos publicados corresponden a dos hosts concretos y una carga pequeña; no deben interpretarse como una clasificación general de GPUs.
- El máximo lógico observado en CPU es de 2.656 iteraciones; rejillas mucho mayores o configuraciones distintas pueden requerir más iteraciones y no están verificadas.
- Las comprobaciones de terminación agrupadas en GPU implican que el número de lanzamientos de kernel no coincide con los pasos lógicos, lo que complica la instrumentación fina.
- Riesgo de sesgo y alucinación: no aplica en el sentido habitual, pero cualquier uso fuera del dominio de rejillas binarias puede producir resultados incorrectos sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ScAGI/written-binary-maze-solver
- Looped Weight-Space Programming (MBZUAI-ORYX): https://mbzuai-oryx.github.io/LoopedWSP/
