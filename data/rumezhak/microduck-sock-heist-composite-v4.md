# rumezhak/microduck-sock-heist-composite-v4

## Resumen

`microduck-sock-heist-composite-v4` es una política de control para el robot cuadrúpedo de bajo coste MicroDuck, publicada por el usuario rumezhak como entrada a la competición "6 m Sock Heist" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: se trata de una política de robótica en formato ONNX que combina una red neuronal de respaldo con una tabla de búsqueda (lookup table) de acciones precalculadas, empaquetada con la librería `microduck`. Su objetivo es recorrer 6 metros de terreno simulado recogiendo calcetines en el menor tiempo posible.

La versión v4 es una modificación fina de la v3 del mismo autor: únicamente se reconstruyen las tablas `L_obs` y `L_act` (1349 filas frente a 1352), manteniendo intactos el grafo, la red de respaldo y el resto de tensores. La mejora es de 8 ms en la media de los cinco seeds oficiales (4,888 s frente a 4,896 s de v3), un margen muy estrecho que el propio autor califica de paso pequeño.

Es relevante como ejemplo de optimización in-sample sobre un banco de evaluación fijo (búsqueda CMA-ES separable sobre los últimos 24-90 pasos de control de cada seed) y como caso ilustrativo de las tensiones de licencia y reproducibilidad en competiciones de robótica simulada. El repositorio ocupa 0,0 GB y no declara licencia unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política híbrida: red neuronal de respaldo (procedente de lphatnguyen v3) más tabla de búsqueda de observación-acción (lookup table) sobre grafo ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantización | no disponible (pesos exportados a ONNX; sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Sin licencia unificada; Apache-2.0 solo para las partes que la portan (grafo de a1rb4Ck y modificaciones de jrubiosainz); el repositorio en su conjunto no está etiquetado como Apache-2.0 |
| Formato de pesos | ONNX (con tablas `L_obs` y `L_act` embebidas, 1349 filas) |

## Arquitectura y entrenamiento

La política no sigue la arquitectura de un transformer. Combina un grafo ONNX con una red neuronal de respaldo (heredada de `lphatnguyen/microduck-sock-heist-6m-v3`) y una tabla de búsqueda que mapea observaciones a acciones. La puntuación es idéntica en todos los comandos porque las claves de la tabla no incluyen el comando; la Arena la evalúa a 0,20 m/s. El diseño procede de la línea de entradas de la Microduck Arena: `a1rb4Ck/microduck-heist` aporta el grafo y el mecanismo de lookup, y jrubiosainz aportó las secuencias F2U de los seeds 2 a 4 y la reescritura de colas con pasos grandes.

El "entrenamiento" es una búsqueda de optimización, no un entrenamiento supervisado. Sobre la base de composite v1 (seeds 1 y 5 de búsqueda propia; seeds 2, 3 y 4 de F2U de jrubiosainz), las versiones v2, v3 y v4 conservan esas secuencias y vuelven a buscar los últimos 24 a 90 pasos de control de cada seed mediante CMA-ES separable (primero pasos grandes, luego pequeños) sobre una reimplementación con snapshot-restart del runner de la Arena que solo reproduce el final de una ejecución (unas 10 veces más rápida que ejecuciones completas y validada contra el scorer oficial). La búsqueda se ejecutó en x86-64, con un portátil arm64 en paralelo, y cada candidato se revalidó en x86-64. Las cinco secuencias se reprodujeron en bucle abierto y se grabaron en la nueva tabla de 1349 filas con el formato de v3.

## Capacidades

- Control locomotor simulado: recorrer 6 metros en el entorno Sock Heist de la Microduck Arena.
- Recogida de calcetines en simulación mediante secuencias de acciones precalculadas.
- Inferencia ONNX determinista en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 (versiones fijadas por la Arena).
- Replay en bucle abierto de cinco trayectorias grabadas (una por seed oficial).
- Red de respaldo para observaciones fuera de las claves de la tabla (comportamiento heredado de lphatnguyen v3).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Participación en la competición 6 m Sock Heist de la Microduck Arena: se sube como entrada y se evalúa en los cinco seeds oficiales a 0,20 m/s, con una media de 4,888 s.
- Referencia de línea base para búsquedas de cola: sirve como punto de partida para quien quiera fusionar las mejores filas por seed y volver a buscar los últimos pasos de control, tal como sugiere el autor.
- Estudio de optimización in-sample: caso práctico para analizar cómo una búsqueda CMA-ES sobre los últimos 24-90 pasos de control mejora la media sin tocar la red de respaldo.
- Validación de pipelines de reproducción determinista: útil para comprobar la reproducibilidad de un runner con versiones fijadas de MuJoCo, onnxruntime y numpy en x86-64.
- Docencia sobre evaluación en simulación: ejemplo de política que funciona en el simulador pero cuyas acciones quedan fuera de los límites de servos reales, útil para discutir la brecha sim-a-real.
- Auditoría de licencias en modelos derivados: el repositorio documenta en `NOTICE` y `LICENSE-apache-2.0.txt` qué partes portan Apache-2.0 y cuáles no, lo que lo convierte en un caso de estudio de cumplimiento en cadenas de derivados.

## Benchmarks y rendimiento

Resultados declarados por el autor en los cinco seeds oficiales (tiempo en segundos; menor es mejor):

| Seed | composite v3 | composite v4 |
|---|---|---|
| 1 | 4,80 | 4,80 |
| 2 | 5,17 | 5,16 |
| 3 | 4,75 | 4,75 |
| 4 | 4,80 | 4,80 |
| 5 | 4,96 | 4,93 |
| Media | 4,896 | 4,888 |

Referencias citadas por el autor en el momento de la publicación: 4,895 s para la mejor entrada de otro autor (jrubiosainz, "derived FCE v3x-483") y 4,896 s para composite v3. La ganancia sobre v3 es de 8 ms en la media, procedente de las colas de dos seeds (seed 2: 10 ms; seed 5: 30 ms). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; la Arena evalúa en x86-64 con onnxruntime en CPU.
- Compatibilidad con GPU de consumo: no relevante para el caso de uso; el cuello de botella es la CPU y la versión de MuJoCo.
- Opciones de despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1 (versiones fijadas por la Arena); no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de recorrido en simulación (media de 4,888 s para 6 m a 0,20 m/s).
- Nota de reproducibilidad: los replays son deterministas en x86-64 con las versiones fijadas; otra CPU puede romper alguno por redondeo, y un Mac da números ligeramente distintos y su lookup puede fallar.

## Comparativa con modelos similares

| Modelo | Tipo | Media en 5 seeds (s) | Licencia | Disponibilidad |
|---|---|---|---|---|
| rumezhak/microduck-sock-heist-composite-v4 | Política ONNX + lookup | 4,888 | Sin licencia unificada; Apache-2.0 parcial | Hugging Face, 0 descargas |
| rumezhak/microduck-sock-heist-composite-v3 | Política ONNX + lookup | 4,896 | Sin licencia declarada | Hugging Face |
| jrubiosainz "derived FCE v3x-483" | Política ONNX + lookup | 4,895 | No disponible | Hugging Face |
| lphatnguyen/microduck-sock-heist-6m-v3 | Red de respaldo (base) | No disponible | Sin licencia declarada | Hugging Face |

La comparación se limita a entradas de la misma competición; no se dispone de datos de parámetros, contexto ni rendimiento en otras tareas para estos modelos.

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de los cinco seeds oficiales el archivo es la red de lphatnguyen v3; solo las cinco trayectorias grabadas son rápidas.
- Determinismo frágil: los replays solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; el redondeo de otra CPU puede romper alguno y un Mac puede fallar en el lookup.
- Margen mínimo: supera el récord por 7 ms, un paso pequeño que el autor espera que sea igualado o superado pronto por quien fusione las mejores filas por seed y busque las colas.
- No apto para robot real: las acciones grabadas quedan muy fuera de lo que se pediría a servos reales; no debe cargarse en un MicroDuck físico.
- Licencia ambigua: el repositorio en su conjunto no está etiquetado como Apache-2.0; varias fuentes (`rumezhak/microduck-sock-heist-remix-rz-tail`, `-composite-v1`, `-v2`, `-v3`, `lphatnguyen/...-v3` y `-v4`) no declaran licencia, y `jrubiosainz/...-rz-tail-r4` tiene archivo LICENSE Apache-2.0 pero sin campo `license:`. Las partes sin licencia no se relicencian aquí.
- Riesgo de retirada: el autor no consultó a jrubiosainz, lphatnguyen ni a1rb4Ck antes de publicar; si alguno objeta, la entrada se retirará.
- Sin datos de sesgos, alucinación o idioma: no aplican a una política de control, pero tampoco se han documentado evaluaciones fuera del simulador.
- Sin garantías de uso comercial: la cadena de derivados tiene licencias heterogéneas y partes sin licencia, lo que dificulta un uso comercial limpio.
- Asistencia de IA: el autor indica que un asistente de IA ayudó en algunos experimentos, sin detallar cuáles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v4
- Modelo base (v3): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v3
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- F2U de jrubiosainz: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r4
- lphatnguyen v3 (red de respaldo): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- lphatnguyen v4: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- a1rb4Ck/microduck-heist (grafo y mecanismo de lookup, Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
