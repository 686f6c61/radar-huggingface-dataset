# RaquelBG05/q-FrozenLake-v1-unit2

## Resumen

q-FrozenLake-v1-unit2 es el resultado de una práctica del curso de deep reinforcement learning de Hugging Face (Unidad 2), publicada por la usuaria RaquelBG05. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementación tabular de Q-learning escrita con NumPy y Gymnasium que resuelve el entorno FrozenLake-v1 de 4×4 en su variante sin deslizamiento (es decir, con transiciones deterministas). El artefacto principal es una tabla Q de 16 estados por 4 acciones que se distribuye como fichero `q-table.npy`.

El problema que resuelve es el clásico de navegación sobre una cuadrícula con casillas seguras y agujeros, donde el agente debe llegar al objetivo sin caer en un hueco. Su relevancia es fundamentalmente didáctica: sirve como referencia mínima y reproducible de un algoritmo de control off-policy (Q-learning) y como material de comparación para quienes están aprendiendo los fundamentos del aprendizaje por refuerzo antes de pasar a métodos con aproximación de función.

La ficha se elabora únicamente con la información publicada en el repositorio de Hugging Face; no hay paper, blog técnico ni documentación adicional del autor. El repositorio ocupa 0,0 GB, no tiene descargas ni likes y se creó el 20 de noviembre de 2026 según los metadatos de la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q de 16 estados × 4 acciones), implementado con NumPy y Gymnasium |
| Parametros totales | 64 valores Q (16 estados × 4 acciones); no es un modelo neuronal |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los valores Q se almacenan como array NumPy, presumiblemente float64 por defecto) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `q-table.npy` (NumPy, cargable con `numpy.load(..., allow_pickle=False)`); el autor menciona además un pickle con parámetros y semillas, y un `results.json` |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular clásico: una tabla Q indexada por estado (16 casillas del grid 4×4) y acción (4 movimientos: izquierda, abajo, derecha, arriba). La actualización sigue la regla de Q-learning estándar, con la tabla inicializada y actualizada de forma iterativa tras cada transición. No hay red neuronal, ni función de aproximación, ni mecanismo de atención; el "modelo" es literalmente una matriz de 16×4 valores.

El entrenamiento se realizó durante 10.000 episodios sobre FrozenLake-v1 4×4 sin deslizamiento, es decir, con transiciones deterministas (el agente se mueve exactamente a la casilla elegida). La evaluación se hizo sobre 100 episodios, de los cuales se completaron los 100, con recompensa media de 1.000 y desviación típica de 0.000. No se documentan hiperparámetros (tasa de aprendizaje, factor de descuento, política de exploración epsilon-greedy, decaimiento) en la información disponible, aunque el autor indica que el pickle incluye los parámetros y las semillas con el formato del curso.

## Capacidades

- Resolución del entorno FrozenLake-v1 4×4 determinista: alcanza el objetivo en el 100 % de los episodios de evaluación.
- Política greedy derivada de la tabla Q: dado un estado, devuelve la acción con mayor valor Q.
- Reproducibilidad: el autor declara que el pickle incluye parámetros y semillas del entrenamiento.
- Inspección directa de la tabla Q: al ser 16×4 valores, se puede volcar, visualizar y auditar sin herramientas adicionales.
- Compatibilidad con Gymnasium: el artefacto está pensado para el entorno estándar del curso.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar la tabla Q como ejemplo canónico de convergencia de Q-learning tabular en un entorno determinista, comparando la política aprendida con la óptima teórica.
- Verificación de implementaciones propias: servir de referencia para comprobar que un agente Q-learning propio alcanza recompensa 1.000 en FrozenLake 4×4 sin deslizamiento tras un número similar de episodios.
- Análisis de la tabla Q: inspeccionar los 64 valores para estudiar cómo se propaga la recompensa desde el estado objetivo hacia atrás en el grid.
- Pruebas de pipelines de evaluación: integrar el `results.json` y el MP4 en un sistema de seguimiento de experimentos para validar el formato de métricas del curso.
- Material de comparación con variantes estocásticas: contrastar el rendimiento determinista con la variante con deslizamiento (`is_slippery=True`), donde la recompensa media esperada es mucho menor.
- Reproducción de experimentos: cargar el pickle con parámetros y semillas para repetir el entrenamiento y comprobar que se obtiene la misma tabla Q.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Entorno | Episodios de evaluación | Episodios completados | Recompensa media | Desviación típica |
|---|---|---|---|---|
| FrozenLake-v1 4×4 sin deslizamiento | 100 | 100 | 1.000 | 0.000 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; la tabla Q ocupa 64 valores de coma flotante, del orden de unos pocos kilobytes.
- GPU: innecesaria; el entrenamiento y la inferencia se ejecutan en CPU.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y entornos sin aceleración.
- Despliegue: no requiere vLLM, llama.cpp, Ollama ni TGI. Basta con Python, NumPy y Gymnasium para cargar `q-table.npy` y consultar la política.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del artefacto, la consulta de una acción es una búsqueda en una matriz de 16×4 y el coste es despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-FrozenLake-v1-unit2 (este) | Q-learning tabular | FrozenLake-v1 4×4 sin deslizamiento | 1.000 ± 0.000 (100 episodios) | no disponible | Hugging Face, 0 descargas |
| Implementaciones de referencia del curso HF (Unidad 2) | Q-learning tabular | FrozenLake-v1 4×4 | no disponible en esta ficha | según el curso | Material del curso |
| Variantes estocásticas de FrozenLake 4×4 | Q-learning tabular | FrozenLake-v1 con deslizamiento | no disponible en esta ficha | no disponible | Repositorios de la comunidad |

No se dispone de datos de benchmarks de alternativas concretas en la información proporcionada; la comparativa se limita a categorías.

## Limitaciones y advertencias

- El artefacto solo es válido para FrozenLake-v1 4×4 sin deslizamiento; no generaliza a otros mapas, tamaños ni entornos.
- No es un modelo de lenguaje ni un agente general: no procesa texto, no razona y no admite instrucciones en lenguaje natural.
- La licencia no está declarada, por lo que el uso comercial queda sin marco legal explícito hasta que el autor lo aclare.
- Los resultados (recompensa 1.000 ± 0.000) son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- No se documentan hiperparámetros ni detalles del proceso de entrenamiento en la model card, lo que limita la reproducibilidad más allá de lo que contenga el pickle.
- El repositorio no tiene descargas ni likes, y su tamaño es de 0,0 GB, lo que sugiere que los artefactos pueden ser muy pequeños o que el contenido no está completamente subido; conviene verificar los ficheros antes de depender de ellos.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque el artefacto no opera sobre lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaquelBG05/q-FrozenLake-v1-unit2
- Práctica oficial del curso (Unidad 2): https://huggingface.co/learn/deep-rl-course/unit2/hands-on
