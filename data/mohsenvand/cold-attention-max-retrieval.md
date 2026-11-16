# mohsenvand/cold-attention-max-retrieval

## Resumen

`mohsenvand/cold-attention-max-retrieval` es un conjunto de cuarenta redes neuronales entrenadas en JAX para estudiar un problema concreto de generalización en longitud: la tarea de recuperación del máximo (max retrieval), en la que hay que identificar la clase del ítem de mayor prioridad dentro de un conjunto de tamaño variable. El autor parte del resultado de Velickovic et al. (2025, arXiv 2410.01104), que demuestra que la atención softmax falla al generalizar a conjuntos mucho mayores de los vistos en entrenamiento. El repositorio no contiene un modelo de lenguaje, sino artefactos de investigación (pesos en safetensors) de cuatro variantes de red con diez semillas cada una.

La propuesta central es la "cold pair count": cada ítem cuenta cuántos rivales admite un test aprendido y el ítem con el menor recuento se lee a temperatura cero. Con 69.483 parámetros, esta red acierta al menos el 99,97% de los conjuntos de test en todos los tamaños hasta 16.384 ítems, frente al 12,04% de la red softmax de referencia al mismo tamaño. El contraste con la variante "soft_count" (mismas capas, lectura en caliente) aísla el efecto: los pesos aprenden las comparaciones correctas y es la lectura suave la que las pierde.

El interés es fundamentalmente metodológico: ofrece una receta reproducible (entrenamiento straight-through, lectura en frío) para dotar a mecanismos de atención de generalización en tamaño, un problema abierto en arquitecturas transformer. No es un modelo desplegable para producción ni un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de atención de una cabeza con codificadores de ítem y query (MLP GELU); variantes con test aprendido y recuento duro/suave |
| Parametros totales | 118.666 (softmax); 69.483 (cold_count); 69.484 (soft_count) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; tamaño de conjunto entrenado de 5 a 16 ítems, evaluado hasta 16.384 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería jax) |

## Arquitectura y entrenamiento

La red softmax replica la de Velickovic et al. (2025, Ap. A.3) en JAX puro con inicializadores por defecto de Flax: codificador de ítem `h_i = gelu(x2(gelu(x1(x_i))))` con 128 características, codificador de query `q2(gelu(q1(q)))`, una cabeza de atención con puntuación `e_i = qp(query) · kp(h_i) / sqrt(128)`, pesos softmax, proyecciones de valor y salida, y read-out a 10 logits de clase. Total: 118.666 parámetros.

La red `cold_count` sustituye la puntuación por un test aprendido `t_ij = t2(gelu(t1(b_ij, onehot k_i, onehot k_j)))` (21 → 32 → 1) sobre comparaciones binarias de prioridad `b_ij = 1[rho_j > rho_i]`; cada ítem cuenta los rivales con `t_ij > 0`, el peso va a los ítems de menor recuento (repartido entre empates) y la clase de los elegidos pasa por `vp`, `op` y el read-out. Se entrena straight-through: la pasada forward es exactamente el test y la selección duros; la backward usa gradientes de `sigmoid(t)` y `softmax(-c)`. La variante `soft_count` usa las mismas capas con lectura en caliente: `c_i = sum sigmoid(t_ij)` y pesos `softmax(-beta c)` con beta aprendida (converge a 2,586–2,591 en las diez semillas). El entrenamiento se realiza sobre conjuntos de 5 a 16 ítems con prioridades uniformes en [0,1), 10 clases y una query que no altera la respuesta.

## Capacidades

- Recuperación del máximo en conjuntos: identificar la clase del ítem de mayor prioridad con generalización a tamaños muy superiores a los de entrenamiento (hasta 16.384 ítems).
- Generalización en longitud: la variante cold_count mantiene al menos el 99,97% de acierto en todos los tamaños evaluados.
- Comparación por pares: el test aprendido opera sobre relaciones binarias de prioridad, no sobre valores absolutos.
- Lectura en frío: selección determinista del máximo con reparto uniforme de empates en float32.
- Entrenamiento straight-through: permite propagar gradientes a través de una operación de selección discreta.
- No soporta tool calling, agentes, multilingüismo, visión ni audio: no es un modelo de lenguaje.

## Casos de uso

- Investigación en mecanismos de atención: usar los pesos y scripts como banco de pruebas reproducible para estudiar por qué softmax pierde generalización en tamaño y cómo la lectura en frío la recupera.
- Diseño de mecanismos de selección: el test aprendido por pares y el recuento duro sirven como bloque para tareas de argmax/argmin sobre conjuntos en arquitecturas propias.
- Experimentos de ablación: las cuatro variantes con diez semillas permiten comparar penalizaciones de peso y modos de lectura con intervalos de confianza empíricos.
- Validación de métodos de entrenamiento discreto: el esquema straight-through con forward duro y backward suave es directamente reutilizable en operaciones no diferenciables.
- Docencia y reproducción: el código en JAX puro con Flax es un ejemplo compacto (menos de 120.000 parámetros) para estudiar generalización fuera de distribución.
- Base para extensiones: el diseño puede adaptarse a tareas de enrutamiento, selección de candidatos o ranking donde el tamaño del conjunto varía en producción.

## Benchmarks y rendimiento

Porcentaje de conjuntos de test respondidos correctamente (media de diez semillas; 10.240 conjuntos por tamaño, los mismos para todos los modelos):

| n | cold count | soft count, lectura caliente | soft count, lectura fría | softmax | softmax, lectura fría | softmax, media penalización | softmax, media penalización, lectura fría | publicado |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 16 | 100,00 | 100,00 | 100,00 | 98,63 | 99,12 | 98,88 | 99,15 | 98,6 |
| 32 | 100,00 | 100,00 | 100,00 | 97,09 | 98,22 | 97,77 | 98,36 | 97,1 |
| 64 | 100,00 | 100,00 | 100,00 | 93,22 | 96,24 | 94,91 | 96,42 | 94,3 |
| 128 | 100,00 | 100,00 | 100,00 | 85,61 | 92,66 | 89,41 | 93,16 | 89,7 |
| 256 | 100,00 | 99,98 | 100,00 | 71,02 | 86,76 | 78,40 | 87,24 | 81,3 |
| 512 | 100,00 | 93,84 | 100,00 | 51,57 | 76,93 | 60,53 | 77,23 | 70,1 |
| 1.024 | 99,99 | 76,62 | 99,99 | 35,30 | 64,03 | 42,44 | 63,46 | 53,8 |
| 2.048 | 99,99 | 58,53 | 99,99 | 24,47 | 49,42 | 28,91 | 46,68 | 35,7 |
| 4.096 | 99,99 | 41,97 | 99,99 | 17,59 | 36,28 | 20,13 | 32,47 | 22,6 |
| 8.192 | 99,97 | 28,05 | 99,98 | 13,96 | 25,76 | 14,97 | 21,92 | 15,7 |
| 16.384 | 99,97 | 18,88 | 99,98 | 12,04 | 18,91 | 12,67 | 15,89 | 12,4 |

Peor semilla (%):

| n | cold count | soft count, lectura caliente | soft count, lectura fría | softmax | softmax, lectura fría | softmax, media penalización | softmax, media penalización, lectura fría |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 16 | 100,00 | 100,00 | 100,00 | 98,18 | 98,86 | 98,11 | 98,66 |
| 32 | 100,00 | 100,00 | 100,00 | 96,46 | 97,71 | 96,14 | 97,38 |
| 64 | 100,00 | 100,00 | 100,00 | 91,90 | 95,09 | 91,35 | 94,34 |
| 128 | 100,00 | 100,00 | 100,00 | 83,64 | 90,80 | 83,81 | 89,52 |
| 256 | 100,00 | 99,78 | 100,00 | 68,86 | 83,00 | 69,41 | 79,75 |
| 512 | 100,00 | 90,11 | 100,00 | 48,77 | 71,77 | 49,59 | 65,75 |
| 1.024 | 99,99 | 69,77 | 99,99 | 32,36 | 56,27 | 32,91 | 48,06 |
| 2.048 | 99,99 | 49,12 | 99,99 | 21,81 | 39,88 | 20,51 | 30,32 |
| 4.096 | 99,99 | no disponible | 99,99 | no disponible | no disponible | no disponible | no disponible |

La model card indica además que la red cold_count comete 91 errores en 1.126.400 conjuntos, todos ellos sobre conjuntos cuya prioridad máxima está duplicada en float32. A 4.096 ítems, el mejor método publicado (ASEntmax; Vasylenko et al. 2026, arXiv 2506.16640, Tabla 8) alcanza el 62,7%.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos (69.483–118.666 parámetros en float32); cualquier GPU o CPU puede ejecutar la inferencia.
- GPU recomendadas: no aplica; no requiere acelerador. Cualquier GPU compatible con JAX (o CPU) es suficiente.
- Cabe en cualquier GPU de consumo y en CPU sin restricciones.
- Opciones de despliegue: JAX con Flax; los pesos están en safetensors y la librería declarada es `jax`. No hay integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el coste dominante es el cálculo del test por pares, O(n²) en el número de ítems del conjunto.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Acierto a 4.096 ítems | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cold_count (este repo) | 69.483 | Test aprendido por pares + recuento duro, lectura en frío | 99,99% | apache-2.0 | Hugging Face |
| softmax (Velickovic et al. 2025) | 118.666 | Atención softmax estándar | 22,6% (publicado) | no disponible | Paper |
| softmax replicado (este repo) | 118.666 | Réplica en JAX de la red publicada | 17,59% | apache-2.0 | Hugging Face |
| ASEntmax (Vasylenko et al. 2026) | no disponible | Entropía alfa-estable en atención | 62,7% | no disponible | Paper |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de propósito general: solo resuelve la tarea sintética de max retrieval sobre conjuntos de hasta 16.384 ítems.
- El entrenamiento se limita a conjuntos de 5 a 16 ítems; la generalización observada es empírica para esta tarea y no se ha demostrado en otras.
- Los errores de cold_count se concentran en conjuntos con prioridad máxima duplicada en float32, donde dos ítems de clases distintas pueden ser ambos "el" máximo.
- El coste del test por pares es cuadrático en el tamaño del conjunto, lo que limita su aplicación directa a conjuntos muy grandes en producción.
- La variante soft_count con lectura en caliente pierde gran parte de la precisión (41,97% a 4.096 ítems), por lo que el modo de lectura es crítico y no intercambiable.
- No se han publicado datos sobre sesgos, idiomas ni robustez fuera de la distribución sintética descrita.
- La licencia apache-2.0 permite uso comercial, pero el repositorio no incluye garantías ni documentación de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/mohsenvand/cold-attention-max-retrieval
- Paper de referencia (softmax y generalización en tamaño): https://arxiv.org/abs/2410.01104
- Paper de ASEntmax: https://arxiv.org/abs/2506.16640
