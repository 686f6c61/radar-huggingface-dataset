# mohsenvand/cold-attention-scc-committee

## Resumen

Cold Attention SCC Committee es un bloque de atención de 135.928 parámetros entrenado sobre la tarea de componentes fuertemente conexas (strongly connected components, SCC) del benchmark CLRS-30. Lo desarrolla el usuario de Hugging Face mohsenvand como parte de un trabajo sobre razonamiento algorítmico con generalización en longitud. No es un modelo de lenguaje: es un módulo especializado de razonamiento sobre grafos, implementado en JAX y publicado con pesos en safetensors (float32).

La innovación central está en el conjunto de entrenamiento: la mitad de los grafos de cada tamaño de entrenamiento (4, 7, 11, 13 y 16 nodos, 80.000 grafos por tamaño) fueron seleccionados por un comité de tres modelos del mismo tipo que discreparon entre sí sobre grafos alterados con un cambio de arista respecto a un grafo de la librería. El bloque se entrena con esos grafos y se evalúa sobre el split oficial de test de CLRS-30 con 64 nodos, es decir, cuatro veces el tamaño máximo visto en entrenamiento.

El resultado declarado es una precisión media del 97,12 % en el test oficial (semillas 0, 1 y 2), frente al 90,02 % del mismo bloque entrenado solo con grafos de la librería, el 90,61 % del bloque census en configuración general y el 90,07 % de FloydNet (20-215 millones de parámetros). Es relevante ahora porque demuestra que la selección adversarial de datos de entrenamiento puede compensar una diferencia de tres órdenes de magnitud en número de parámetros en una tarea algorítmica concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque de atención "cold attention" sobre pares ordenados de nodos (sin transformer completo) |
| Parametros totales | 135.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | grafos de hasta 64 nodos en lectura (entrenado con hasta 16 nodos) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo no linguistico, opera sobre grafos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), con config.json y reference_predictions.npz |

## Arquitectura y entrenamiento

El bloque mantiene, para cada par ordenado de nodos (u, v), un vector de 128 números. En cada iteración formula dos preguntas aprendidas de sí/no a cada nodo intermedio k; un ítem que supera ambas preguntas se considera testigo (witness) de (u, v). El bloque solo transmite bits: qué recuento de testigos es mayor (o si son iguales) y si algún testigo supera ambas pruebas. El estado se reconstruye desde la entrada y estos bits en cada iteración. Las posiciones de los nodos, únicos números de entrada de la tarea, residen en un registro y llegan al bloque únicamente como comparaciones. La lectura se realiza tras n iteraciones para n nodos.

El entrenamiento consistió en 80.000 actualizaciones con batch de 32, con el número de iteraciones muestreado entre 8 y 32 por actualización, optimizador AdamW (learning rate 0,001, 2.000 pasos de warm-up, decaimiento coseno hasta el 1 %, weight decay 0,01) y recorte de gradientes a norma 1. No se usaron pistas (pasos intermedios). La mitad de cada tamaño de entrenamiento son grafos generados por el script de la librería; la otra mitad fueron seleccionados por un comité de tres modelos entrenados solo con grafos de la librería, ejecutados sobre grafos alterados con un cambio de arista aleatorio y conservados cuando los tres modelos discrepaban.

## Capacidades

- Cálculo de componentes fuertemente conexas en grafos dirigidos de hasta 64 nodos en lectura, con entrenamiento hasta 16 nodos.
- Generalización en longitud: rendimiento mantenido al cuádruple del tamaño máximo de entrenamiento (64 nodos frente a 16).
- Razonamiento algorítmico iterativo con estado reconstruido desde la entrada y bits intermedios en cada iteración.
- Lectura "at rest" mediante la función `registered_read` de la librería `witness_clrs`, que devuelve predicciones y número de iteraciones.
- Evaluación con el scorer oficial de CLRS-30.
- No soporta tool calling, agentes, generación de texto, visión ni audio.

## Casos de uso

- Investigación en generalización en longitud: el modelo sirve como banco de pruebas controlado para estudiar cómo un bloque de atención de 135.928 parámetros se comporta al pasar de 16 a 64 nodos, con referencia de precisión publicada por semilla.
- Estudio de selección adversarial de datos: el conjunto de grafos elegidos por comité permite reproducir el experimento de comparar entrenamiento con grafos de librería frente a grafos de discrepancia, midiendo la ganancia de 7,1 puntos porcentuales en test.
- Benchmark de algoritmos sobre grafos: integrable en pipelines de evaluación de CLRS-30 para contrastar modelos de razonamiento algorítmico con una línea base de muy bajo coste computacional.
- Educación y divulgación: el bloque y su lector (`witness_clrs`) permiten ilustrar cómo un mecanismo de atención puede implementar un algoritmo de testigos para SCC con estado mínimo.
- Análisis de robustez ante cambios de arista: al haberse entrenado con grafos alterados por una arista, es adecuado para estudiar sensibilidad a perturbaciones locales en la estructura del grafo.
- Componente en sistemas híbridos de razonamiento: puede actuar como módulo especializado de SCC dentro de una arquitectura mayor que delegue en él la resolución de subgrafos de hasta 64 nodos.
- Reproducibilidad de resultados: las predicciones de referencia (`reference_predictions.npz`) en los splits oficiales de test y validación permiten verificar implementaciones del lector sin reentrenar.

## Benchmarks y rendimiento

Precisión (%) en el split oficial de test de CLRS-30 (32 grafos de 64 nodos), leída tras 64 iteraciones y puntuada con el scorer de la librería:

| Modelo | seed 0 | seed 1 | seed 2 | media |
|---|---:|---:|---:|---:|
| Committee-chosen graphs (este repositorio) | 96,58 | 97,31 | 97,46 | **97,12** |
| Mismo bloque solo con grafos de la librería | 88,53 | 91,31 | 90,23 | 90,02 |
| Bloque census (configuración general, 8 iteraciones) | no disponible | no disponible | no disponible | 90,61 |
| FloydNet (arXiv 2601.19094, Tabla 9; 20-215 M parámetros) | no disponible | no disponible | no disponible | 90,07 |

En el split de validación (16 nodos) todas las semillas aciertan en todos los nodos. A 128 nodos el bloque puntúa 78,17 % frente al 68,4 % del bloque entrenado solo con grafos de la librería.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB para los pesos en float32 (135.928 parámetros × 4 bytes ≈ 0,54 MB); el consumo real lo domina el estado intermedio por par de nodos (128 números por par ordenado, O(n²) pares).
- GPU recomendadas: cualquier GPU con soporte JAX; no requiere A100 ni H100. Una RTX 4090 o incluso CPU es suficiente para inferencia y evaluación sobre los splits oficiales.
- Cabe en cualquier GPU de consumo e integrada; también en CPU.
- Opciones de despliegue: JAX con los pesos safetensors y la librería `witness_clrs` (funciones `load_hub`, `registered_read`, `score` y `data.load_split`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto (nodos) | Precisión test SCC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cold Attention SCC Committee | 135.928 | 64 (entrenado a 16) | 97,12 % | Apache 2.0 | Hugging Face (este repo) |
| Mismo bloque, grafos de librería | 135.928 | 64 (entrenado a 16) | 90,02 % | Apache 2.0 | No publicado como repo independiente |
| Bloque census (configuración general) | no disponible | 8 iteraciones | 90,61 % | no disponible | no disponible |
| FloydNet | 20-215 millones | no disponible | 90,07 % | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se realizó una ronda de selección por comité; no se exploraron rondas adicionales.
- Un comité de los nuevos modelos sigue discrepando en aproximadamente una cuarta parte de los grafos recién alterados (medido en seed 0), lo que indica que la cobertura del espacio de grafos difíciles no es completa.
- El rendimiento cae con el tamaño: 78,17 % a 128 nodos frente al 97,12 % a 64 nodos.
- Modelo especializado en una única tarea (SCC) sobre grafos dirigidos; no es un modelo de lenguaje y no debe evaluarse como tal.
- No hay información sobre sesgos, alucinación o comportamiento multilingüe porque el modelo no opera sobre texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo carece de utilidad fuera de la tarea y el ecosistema `witness_clrs`; verificar la disponibilidad y licencia de esa librería antes de integrarla en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el repositorio compañero con el bloque y el lector se anuncia como "enlace añadido en el lanzamiento", por lo que puede no estar disponible todavía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohsenvand/cold-attention-scc-committee
- Paper de FloydNet (referencia comparativa): arXiv 2601.19094
- Benchmark CLRS-30: no disponible en la información proporcionada (referencia estándar de la literatura)
- Repositorio compañero con el bloque y el lector (`witness_clrs`): no disponible (enlace pendiente de publicación según la model card)
