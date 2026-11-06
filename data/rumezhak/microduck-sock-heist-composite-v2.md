# rumezhak/microduck-sock-heist-composite-v2

## Resumen
Microduck-sock-heist-composite-v2 es una entrada de competición para la prueba "Sock Heist 6 m" de la Microduck Arena, un entorno de simulación de robótica organizado por Pollen Robotics. No es un modelo de lenguaje ni una red neuronal entrenada de forma convencional: es un artefacto de control compuesto por una red de respaldo (procedente de lphatnguyen v3) más una tabla de búsqueda (lookup table) de 1354 filas que mapea observaciones a acciones para cinco trayectorias concretas. Lo desarrolla el usuario de Hugging Face rumezhak como fine-tune de su composite v1.

El modelo resuelve una tarea muy acotada: recorrer 6 metros en el simulador de la Arena en el menor tiempo posible sobre cinco semillas oficiales. Su relevancia es exclusivamente de investigación en optimización de políticas y benchmarking de robótica simulada; no tiene aplicación fuera de ese entorno. La arquitectura subyacente es una red de política (procedente de lphatnguyen v3) con un mecanismo de lookup de observaciones heredado de a1rb4Ck, exportada a ONNX.

El resultado declarado es de 4,909 s de media en las cinco semillas oficiales, frente a 4,937 s de su predecesor composite v1 y 4,922 s del mejor registro previo de la tabla. La mejora se concentra en las semillas 2, 3 y 4 (50, 30 y 60 ms respectivamente) y proviene de una nueva búsqueda de los últimos 24 a 90 pasos de control de cada semilla mediante CMA-ES separable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política (base lphatnguyen v3) con tabla de lookup observación-acción (1354 filas); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; control por pasos de simulación) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: Apache-2.0 solo en las partes que la declaran (grafo y mecanismo de lookup de a1rb4Ck, modificaciones de jrubiosainz); el repositorio en conjunto no está etiquetado como Apache-2.0 |
| Formato de pesos | ONNX (librería microduck) |

## Arquitectura y entrenamiento
El artefacto combina dos componentes: una red de política de respaldo (la red de lphatnguyen v3) y una tabla de búsqueda que sustituye las acciones para las cinco trayectorias registradas. La tabla contiene 1354 filas (frente a 1360 en composite v1) en el mismo formato que v1: solo difieren las tablas `L_obs` y `L_act`; el grafo, la red de respaldo y el resto de tensores son idénticos a composite v1.

El "entrenamiento" consiste en una búsqueda de optimización sobre los últimos 24 a 90 pasos de control de cada semilla, usando CMA-ES separable (primero pasos grandes, luego pequeños) sobre una reimplementación con snapshot-restart del runner de la Arena que solo reproduce el final de una ejecución (unas 10 veces más rápida que ejecuciones completas). La búsqueda se realizó en x86-64 y cada candidato se verificó de nuevo en x86-64. Las cinco secuencias resultantes se reprodujeron en bucle abierto y se grabaron en la nueva tabla de lookup.

## Capacidades
- Control de política para la tarea Sock Heist 6 m en el simulador de la Microduck Arena.
- Reproducción determinista de cinco trayectorias registradas sobre las semillas oficiales 1 a 5.
- Inferencia vía ONNX con la librería microduck.
- La puntuación es idéntica en todos los comandos, ya que las claves de lookup no incluyen el comando; la Arena la evalúa a 0,20 m/s.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modo thinking.
- Fuera de las cinco semillas oficiales, el comportamiento lo determina la red de respaldo (lphatnguyen v3).

## Casos de uso
- Benchmarking de optimización de políticas: sirve como referencia de la tabla de la Microduck Arena para comparar estrategias de búsqueda de colas (tail search) sobre trayectorias registradas.
- Investigación en CMA-ES aplicado a robótica simulada: el método de búsqueda separable con snapshot-restart y reproducción parcial es reutilizable para optimizar políticas existentes sin reentrenar la red.
- Estudio de artefactos de lookup en control: permite analizar cómo una tabla de 1354 filas sustituye a la red para trayectorias concretas y qué degradación produce fuera de muestra.
- Reproducción de resultados en simulación: con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64, las reproducciones son deterministas, lo que facilita la verificación por terceros.
- Comparación de entradas de la Arena: útil para quienes mantienen o evalúan rankings de la competición Sock Heist 6 m.
- Docencia sobre límites del sobreajuste en simulación: ilustra un caso explícito de política in-sample que solo es rápida en las cinco trayectorias registradas.

## Benchmarks y rendimiento

| Semilla | composite v1 (s) | composite v2 (s) |
|---|---|---|
| 1 | 4,82 | 4,82 |
| 2 | 5,24 | 5,19 |
| 3 | 4,79 | 4,76 |
| 4 | 4,88 | 4,82 |
| 5 | 4,96 | 4,96 |
| Media | 4,937 | 4,909 |

Referencia externa citada: 4,922 s para la entrada "derived tail search FCE G5" de jrubiosainz, mejor registro previo de la tabla en el momento de publicación.

## Requisitos de hardware
- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el artefacto es una red pequeña más una tabla de lookup de 1354 filas, por lo que la inferencia es ligera.
- GPU recomendadas: no disponible; la evaluación oficial se realiza en CPU x86-64.
- Cabe en cualquier equipo consumer: la Arena puntúa en x86-64 y el autor verificó candidatos en x86-64 con un portátil arm64 al lado.
- Despliegue: onnxruntime 1.24.4 con la librería microduck y MuJoCo 3.10.0 para la simulación; numpy 2.4.1.
- Latencia y throughput: no disponibles; el determinismo depende de la CPU (redondeo distinto en otras arquitecturas puede romper una reproducción).

## Comparativa con modelos similares

| Modelo | Tipo | Resultado (media 5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|
| rumezhak/microduck-sock-heist-composite-v2 | Lookup + red v3 | 4,909 s | Mixta (Apache-2.0 parcial) | Hugging Face |
| rumezhak/microduck-sock-heist-composite-v1 | Lookup + red v3 | 4,937 s | No declarada | Hugging Face |
| jrubiosainz "derived tail search FCE G5" | Lookup derivado | 4,922 s | No disponible | Tabla de la Arena |
| lphatnguyen/microduck-sock-heist-6m-v3 | Red de política | No disponible | No declarada | Hugging Face |

## Limitaciones y advertencias
- Sobreajuste in-sample: fuera de las cinco semillas oficiales el archivo se comporta como la red de lphatnguyen v3; solo las cinco trayectorias registradas son rápidas.
- Determinismo frágil: las reproducciones solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otro redondeo de CPU puede romper una reproducción y un Mac da números ligeramente distintos.
- No apto para robot real: las acciones registradas están muy fuera de lo que se pediría a servomotores físicos; no debe cargarse en un MicroDuck físico.
- Licencia ambigua: varias fuentes (lphatnguyen v3/v4, entradas propias de rumezhak) no declaran licencia; Apache-2.0 solo cubre las partes que la llevan y el repositorio en conjunto no está etiquetado como Apache-2.0. No se relicencian las partes sin licencia.
- Riesgo de retirada: el autor no consultó a jrubiosainz, lphatnguyen ni a1rb4Ck antes de publicar; si alguno objeta, la entrada se retirará.
- Margen mínimo: superar la tabla por 13 ms es un paso pequeño y es probable que se iguale o supere pronto combinando las mejores filas por semilla y buscando las colas.
- Sin datos de sesgos ni alucinación por no ser un modelo de lenguaje; no aplica.
- El autor declara que un asistente de IA ayudó en algunos experimentos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v2
- Modelo base composite v1: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v1
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- jrubiosainz F2U (rz-tail-r4): https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r4
- lphatnguyen v3: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- lphatnguyen v4: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- a1rb4Ck microduck-heist: https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics: https://huggingface.co/pollen-robotics
