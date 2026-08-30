# Hana-ame/maze-transformer

## Resumen

`maze-transformer` es un micro Transformer causal (denominado MazeGPT) desarrollado por Hana-ame (lumin) como sonda de investigación para estudiar cómo un modelo pequeño aprende a navegar de forma reactiva en laberintos 2D con observación parcial. El modelo recibe en cada paso las cuatro celdas adyacentes (arriba, abajo, izquierda, derecha) y debe emitir una acción (U/D/L/R), con la regla de que si la acción apunta a una pared o fuera de los límites, el entorno la rechaza y el agente permanece en su sitio. La tarea está formulada como generación de secuencias tokenizadas con un vocabulario fijo de 10 tokens, y el entrenamiento se realiza por SFT sobre trayectorias BFS válidas.

La relevancia de este modelo es puramente investigadora: sirve como banco de pruebas para técnicas de interpretabilidad mecánica, como el membership probing (distinguir secuencias generadas por el generador de secuencias válidas de tres tipos de contraejemplos que violan reglas del generador). No está pensado para uso en producción ni para tareas de lenguaje natural. La arquitectura es un GPT causal de 2 capas y 64 dimensiones de embedding, con un checkpoint publicado (`l2_d64_maze_final.pt`) que alcanza una pérdida de 0.014 y un margen de membership de +0.347, aunque la tasa de resolución reactiva del laberinto es baja (0–30%, sin superar a una política aleatoria en la mayoría de tamaños).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (GPT-like), 2 capas, 64 dimensiones de embedding |
| Parametros totales | no disponible (estimable en <1M, no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del `block_size` de entrenamiento, no especificado) |
| Tipos de cuantizacion | no disponible (modelo de investigacion, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (vocabulario de 10 tokens de laberinto, no lenguaje natural) |
| Licencia | no disponible (el espejo del repositorio hermano indica MIT, pero la ficha oficial no la declara) |
| Formato de pesos | PyTorch `.pt` (checkpoint), no safetensors ni GGUF |

## Arquitectura y entrenamiento

MazeGPT es un transformer causal de tamaño reducido, similar a TinyGPT, con 2 capas y 64 dimensiones de embedding. El vocabulario consta de 10 tokens: `.` (camino), `#` (pared), `U`, `D`, `L`, `R` (acciones), `,` (separador entre pasos), `!` (marcador de llegada a la meta), `<BOS>` y `<EOS>`. Cada paso de la secuencia se compone de 4 tokens de observación (estado de las celdas U, D, L, R) seguidos de 1 token de acción y un separador. El entrenamiento se realiza por SFT (supervised fine-tuning) sobre secuencias generadas por BFS en laberintos perfectos (generados con randomized DFS) de tamaño 5×5 a 9×9, con 2000 pasos de optimización. Se ofrecen dos modos de entrenamiento: `--single` (una episodio por secuencia) y `--packed` (múltiples episodios empaquetados en el contexto). No se mencionan técnicas como RLHF, DPO ni innovaciones arquitectónicas; el interés está en el análisis de interpretabilidad posterior.

## Capacidades

- Navegación reactiva en laberintos 2D con observación parcial (solo las 4 celdas adyacentes).
- Generación de secuencias de acciones (U/D/L/R) condicionadas a observaciones locales.
- Membership probing: el modelo puede distinguir secuencias válidas (generadas por el generador) de tres tipos de contraejemplos (acción ilegal, observación falsa, ausencia de meta).
- No tiene capacidades de lenguaje natural, tool calling, agentes, visión ni audio.
- No soporta razonamiento multi-paso más allá de la decodificación greedy de acciones.

## Casos de uso

- Investigación en interpretabilidad mecánica: estudiar cómo un transformer pequeño construye modelos de mundo causales en tareas de navegación, mediante análisis de atención y sparse autoencoders (SAEs), como se plantea en el paper relacionado.
- Validación de técnicas de membership probing: el modelo sirve como banco de pruebas para métodos que detectan si una secuencia pertenece a la distribución del generador, con tres clases de contraejemplos bien definidos.
- Benchmark para estudios de circuitos internos: analizar qué cabezas de atención codifican información de conectividad del laberinto, como se hace en el paper "Transformers Use Causal World Models in Maze-Solving Tasks".
- Educación y experimentación: ejemplo didáctico de entrenamiento de un transformer pequeño en una tarea sintética con vocabulario reducido, útil para cursos de aprendizaje profundo o interpretabilidad.
- Prueba de concepto para entornos parcialmente observables: evaluar cómo los transformers manejan la incertidumbre y las acciones ilegales (el entorno rechaza movimientos inválidos).
- No es adecuado para aplicaciones reales de navegación, robótica o generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje. Los datos de rendimiento disponibles en la model card son:

| Metrica | Valor |
|---|---|
| Loss de entrenamiento | 1.97 → 0.014 |
| Margen de membership (positivos vs. tres clases de negativos) | +0.347 |
| Tasa de resolucion reactiva (greedy, 40 trials) | 0–30% (no supera a la politica aleatoria en la mayoria de tamanos) |

## Requisitos de hardware

- Modelo extremadamente pequeño (2 capas, 64 dims): cabe en cualquier CPU moderna, sin necesidad de GPU.
- VRAM estimada: menos de 1 MB (prácticamente despreciable).
- GPU recomendada: ninguna; se ejecuta en CPU con PyTorch 2.5.0.
- Opciones de despliegue: no aplica (modelo de investigación, no pensado para servir en producción). Se puede cargar con `torch.load` y ejecutar en local.
- Latencia y throughput: no publicados, pero al ser un modelo minúsculo, la inferencia es del orden de microsegundos por token en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (micro-transformers para navegación en laberintos con observación parcial). El repositorio hermano `additive-rand-transformer` comparte estructura y protocolo experimental, pero se centra en una tarea de aritmética aditiva, no en navegación. No se puede establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni entiende instrucciones en lenguaje natural.
- Rendimiento de navegación pobre: la tasa de resolución reactiva es de 0–30%, sin superar a una política aleatoria en la mayoría de tamaños de laberinto; el modelo tiende a quedarse parado ante acciones ilegales.
- Licencia no declarada: la ficha oficial no especifica la licencia, lo que impide su uso comercial sin consultar al autor.
- Sin cuantizaciones ni formatos estándar (safetensors, GGUF): solo checkpoint PyTorch, lo que limita su portabilidad a otros frameworks.
- Fecha de creación futura (2026-08-30) y sin actividad comunitaria (0 descargas, 0 likes): proyecto de investigación personal, sin mantenimiento garantizado.
- No hay garantías de reproducibilidad completa: el entrenamiento depende de un entorno local específico (torch 2.5.0, rutas de conda) y los pesos se alojan vía HF API, no en el repositorio git.

## Enlaces

- HuggingFace: https://huggingface.co/Hana-ame/maze-transformer
- Repositorio hermano (additive-rand-transformer, espejo): https://d6108366.hf-mirror.com/Hana-ame/additive-rand-transformer
- Paper relacionado (Transformers Use Causal World Models in Maze-Solving Tasks): https://arxiv.org/abs/2412.11867
- OpenReview del mismo paper: https://openreview.net/forum?id=aE6QjMJ1mN
