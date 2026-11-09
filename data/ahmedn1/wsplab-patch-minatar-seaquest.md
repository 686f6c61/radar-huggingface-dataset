# Ahmedn1/wsplab-patch-minatar-seaquest

## Resumen

`wsplab-patch-minatar-seaquest` es un parche de pesos (weight-space patch) sobre una política de reinforcement learning de tamaño minúsculo para el juego Seaquest del entorno MinAtar. No es un modelo de lenguaje: es un artefacto que documenta y empaqueta una edición directa de 32 pesos de una red neuronal de tres capas, realizada por un LLM (Claude Opus 5.5) sin entrenamiento, sin gradientes y sin ejecutar la red en su propio código. Lo publica el usuario Ahmedn1 dentro del proyecto `wsplab`, una herramienta independiente de los autores del paper original.

La red base fue escrita desde cero por otro LLM (GPT-6 Astra) en el experimento 5 del trabajo *Sparks of Weight-Space Programming* (Takehi, Teoh, Zhang y Khattab), donde obtuvo una puntuación de 53,1. La edición eleva el retorno medio de 52,13 a 75,74 sobre 2.000 episodios retenidos (semillas 1.000.000–1.001.999), con una diferencia pareada de +23,61 ± 1,21 y una ventaja de +74,8 ± 0,9 frente a una edición aleatoria del mismo tamaño. El veredicto del autor es "confirmado".

Su relevancia es metodológica más que práctica: demuestra que un LLM puede leer los pesos de una red pequeña como si fueran un circuito de reglas construido a mano y modificarlos de forma quirúrgica para mejorar una política, sin ningún proceso de optimización. El repositorio ocupa 0,0 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 3 capas con activación tanh: `h1 = tanh(x @ W1 + b1)`, `h2 = tanh(h1 @ W2 + b2)`, `logits = h2 @ W3 + b3` |
| Parametros totales | 21.542 (W1 600×32 = 19.200; b1 32; W2 32×32 = 1.024; b2 32; W3 32×6 = 192; b3 6) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; la entrada es una observación fija de 600 valores (rejilla 10×10 con 6 canales) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`base/model.safetensors`) y NPZ para el parche (`edit.npz`) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa de tres capas con activaciones tanh y salida softmax sobre las 6 acciones de Seaquest en MinAtar. La entrada es la rejilla de 10×10 con los 6 canales del paper, aplanada con el índice `(row * 10 + col) * 6 + channel`, lo que da 600 dimensiones de entrada. Las acciones se muestrean de la softmax de los logits. No hay atención, recurrencia ni mecanismo alguno de memoria: la política es puramente reactiva a la observación actual.

No hubo entrenamiento en el sentido habitual. La red base fue generada desde cero por GPT-6 Astra en el experimento 5 del paper citado. El parche lo produjo Claude Opus 5.5 leyendo los pesos y modificando 32 entradas: 16 en `W2`, 14 en `b2`, 1 en `W3` y 1 en `b3`; `W1` queda intacta. Según la propia explicación del editor, los cambios implementan un veto más fuerte contra moverse junto a un enemigo (un peso pasa de −0,3 a −3, con compensación en el sesgo para no alterar el comportamiento cuando el detector está inactivo) y una nueva unidad de "mantenerse en la superficie" construida a partir de una unidad previamente sin uso. Las reglas del experimento prohibían el entrenamiento, el ajuste iterativo y la ejecución o simulación de la red en el código del editor; solo se permitieron 8 pases forward presupuestados sobre episodios de práctica. Una auditoría del transcript confirmó la validez de la sesión.

## Capacidades

- Política de control para MinAtar Seaquest: selecciona una de 6 acciones a partir de la observación de 10×10×6.
- Detección de peligro en la fila adyacente y en la siguiente, con veto reforzado sobre el movimiento hacia enemigos.
- Comportamiento de "mantenerse en la superficie" cuando un enemigo pasa justo debajo del submarino.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No tiene modo thinking ni ninguna capacidad especial más allá del control reactivo del juego.

## Casos de uso

- Reproducción de experimentos de weight-space programming: el parche y su evidencia permiten replicar la edición y verificar los hashes contra la red base con `wsplab patch verify`.
- Estudio de interpretabilidad de redes pequeñas: la edición se justifica como lectura de un "circuito de reglas" construido a mano, lo que sirve como caso de estudio de cómo un LLM interpreta pesos.
- Control de referencia en MinAtar Seaquest: la política editada (retorno medio 75,74) puede usarse como baseline reactivo en comparaciones con agentes entrenados por RL.
- Docencia sobre edición de pesos sin gradientes: el transcript completo en `evidence/session/` documenta cada prompt, respuesta, script y resultado, útil para enseñar el método.
- Auditoría de metodología experimental: el parche incluye el control de edición aleatoria del mismo tamaño (retorno 0,92) y estadísticas pareadas, lo que permite evaluar el diseño del experimento.
- Investigación sobre agentes LLM que manipulan artefactos binarios: el flujo `pull`/`verify`/`apply` con hashes ejemplifica un protocolo reproducible de edición de pesos por parte de un modelo.

## Benchmarks y rendimiento

| Metrica | Original | Editado |
|---|---:|---:|
| Retorno medio, 2.000 episodios retenidos | 52,13 | 75,74 |
| Diferencia pareada | — | +23,61 ± 1,21 |
| Episodios mejores / peores | — | 1.260 / 606 |
| Edición aleatoria del mismo tamaño | — | 0,92 |
| Ventaja frente a edición aleatoria | — | +74,8 ± 0,9 |
| Episodios terminados por agotar oxígeno (por 1.000 de práctica) | 29 | 102 |

Condiciones de medida: MinAtar 1.0.15, acciones con pegajosidad 0,1, episodios cortados a 10.000 pasos. El editor trabajó sobre semillas 0–1.999 y el veredicto se calcula sobre semillas 1.000.000–1.001.999, nunca vistas por el editor. Los resultados provienen de una única ejecución sobre tres editores (Claude Opus 5.5 ganó en un conjunto de selección), no de una media de ejecuciones repetidas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float32 (21.542 parámetros); cualquier GPU consumer, e incluso CPU, es suficiente.
- GPU recomendadas: no se requiere GPU; la inferencia puede ejecutarse en CPU con numpy.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: `wsplab` para verificar y aplicar el parche (solo requiere numpy); MinAtar 1.0.15 para jugar el juego, instalado aparte con `pip install minatar==1.0.15 --no-deps` (GPL-3.0, no se distribuye en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wsplab-patch-minatar-seaquest` (este) | 21.542 | observación fija de 600 valores | retorno medio 75,74 en Seaquest | CC BY 4.0 | Hugging Face |
| Red base del paper (GPT-6 Astra) | 21.542 | observación fija de 600 valores | retorno medio 52,13 (53,1 en el paper) | CC BY 4.0 | GitHub `RikiyaT/lm_understand-logs` |
| Edición aleatoria del mismo tamaño | 21.542 | observación fija de 600 valores | retorno medio 0,92 | no aplica | control interno del experimento |

No se dispone de información sobre otras políticas comparables de MinAtar Seaquest en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una política de juego, los sesgos se manifiestan como preferencias de acción, no como sesgos sociales.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la justificación del editor sobre el "circuito de reglas" es una interpretación, no una prueba causal.
- Limitaciones de contexto o idioma: la política solo funciona con la observación exacta de MinAtar Seaquest; no generaliza a otros juegos ni a variaciones del entorno.
- Coste del cambio: los episodios terminados por agotar oxígeno suben de 29 a 102 por cada 1.000 episodios de práctica, lo que indica un comportamiento más conservador que puede penalizar en otras configuraciones.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución; MinAtar es GPL-3.0 y no se distribuye, por lo que debe instalarse aparte y su licencia aplica al entorno de ejecución.
- Caveat de producción: los hashes prueban que la edición es la publicada y que encaja con la base, pero no que sea segura ni que sus afirmaciones se sostengan; el autor recomienda medirla uno mismo.
- Los resultados provienen de una sola ejecución y de una selección entre tres editores, no de una media sobre ejecuciones repetidas.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Ahmedn1/wsplab-patch-minatar-seaquest
- Repositorio wsplab: https://github.com/Ahmedn1/wsplab
- Experimento 10 (Seaquest): https://github.com/Ahmedn1/wsplab/tree/main/experiments/10_seaquest
- Código del entorno: https://github.com/Ahmedn1/wsplab/blob/main/experiments/code/minatar_seaquest.py
- Paper *Sparks of Weight-Space Programming*: https://rikiyat.github.io/blog/weight-space-programming/
- Red base en el release de los autores: https://github.com/RikiyaT/lm_understand-logs/tree/4d09ba6d6a7e891dd8063974dfe81b3d78e3494f/exp5_write_from_scratch
