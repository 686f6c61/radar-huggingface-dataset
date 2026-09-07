# kevinwhc/diffusion-tetris

## Resumen

Diffusion-Tetris es un conjunto de checkpoints de PyTorch publicado en HuggingFace por el usuario kevinwhc (Kevin Chun Ye), que acompaña al artículo «Diffusion-MPC in Discrete Domains: Feasibility Constraints, Horizon Effects, and Critic Alignment: Case study with Tetris» (arXiv:2603.02348). El modelo implementa un planificador por control predictivo basado en modelos de difusión (Diffusion-MPC) para el juego Tetris. Su arquitectura combina un denoiser discreto de estilo MaskGIT, que opera sobre secuencias de colocación de piezas, con un crítico DQN preentrenado que se utiliza para reranking de las secuencias candidatas.

El problema que resuelve es la generación de planes de acciones discretas en dominios con restricciones de factibilidad, un área de investigación activa en planificación y aprendizaje por refuerzo. Su relevancia radica en que estudia tres ejes concretos: el filtrado de muestras mediante máscaras logit para garantizar colocaciones válidas, el impacto de la longitud del horizonte en la calidad de los planes, y la alineación del crítico aprendido con heurísticas de evaluación del tablero. No se han publicado datos sobre el tamaño de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser discreto estilo MaskGIT sobre secuencias de colocación + crítico DQN preentrenado para reranking |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (librería PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de difusión discreta inspirada en MaskGIT, que genera secuencias de colocación de piezas en Tetris mediante un proceso de enmascaramiento y desenmascaramiento progresivo. A diferencia de los modelos de difusión continuos, este denoiser trabaja sobre variables discretas (posiciones y rotaciones de cada pieza), lo que permite modelar la distribución de planes de acción. El proceso de muestreo genera múltiples secuencias candidatas que posteriormente son evaluadas por un crítico DQN preentrenado, combinado con una heurística de puntuación del tablero, para seleccionar las acciones finales.

El entrenamiento se basa en datos de partidas de Tetris, aunque no se han publicado el número de episodios, la arquitectura exacta ni el tamaño del dataset en la información disponible. El artículo que acompaña al checkpoint estudia cómo el enmascaramiento logit con máscaras de colocación válidas afecta a la factibilidad de los planes, cómo varía la calidad de la planificación con el horizonte de predicción y cómo se alinea el crítico DQN con las heurísticas clásicas. No se mencionan técnicas de postentrenamiento como RLHF ni DPO, ya que no se trata de un modelo de lenguaje.

## Capacidades

- Generación de secuencias de colocación de piezas en Tetris mediante difusión discreta sobre secuencias de acciones.
- Planificación por control predictivo (MPC) con muestreo de múltiples trayectorias candidatas.
- Reranking de trayectorias utilizando una puntuación heurística del tablero, un crítico DQN preentrenado y una combinación híbrida.
- Aplicación de restricciones de factibilidad mediante enmascaramiento de logits con máscaras de colocaciones válidas.
- No soporta generación de texto, código, visión, tool calling ni capacidades multilingües, al ser un modelo de planificación específico para un juego.
- No se ha documentado un modo de pensamiento explícito ni soporte de audio.

## Casos de uso

- Investigación en planificación por difusión: el modelo sirve como referencia reproducible para estudiar cómo los denoisers discretos pueden generar secuencias de acciones válidas en entornos de tiempo discreto, permitiendo comparar enfoques de MPC con métodos de aprendizaje por refuerzo.
- Evaluación de restricciones de factibilidad: permite medir el impacto de las máscaras logit en la proporción de acciones válidas generadas, siendo útil para validar métodos de muestreo condicionado en dominios con reglas estrictas.
- Análisis del horizonte de planificación: es un banco de pruebas para investigar cómo la longitud del horizonte en el MPC afecta a la calidad de los planes y a la tasa de supervivencia en partidas simuladas.
- Comparación de estrategias de reranking: el crítico DQN preentrenado permite contrastar heurísticas clásicas de puntuación con valoraciones aprendidas, una línea de investigación relevante en control predictivo y alineación de criticos.
- Prototipo de agentes para juegos discretos: el checkpoint puede integrarse en un entorno de simulación de Tetris para generar políticas de colocación de piezas, sirviendo como base para adaptar la técnica a otros juegos con acciones discretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: se distribuye como checkpoint de PyTorch, por lo que se desconoce su soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. Al tratarse de un modelo de investigación específico para planificación en Tetris, no se puede comparar con modelos de lenguaje de propósito general ni con otros modelos de difusión para generación de texto o imágenes.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, al no tratarse de un modelo de lenguaje ni de visión.
- Riesgo de alucinación: la generación de secuencias inválidas es posible si no se aplican las máscaras de factibilidad, lo que puede producir planes que infringen las reglas del Tetris.
- Limitaciones de contexto o idioma: no aplica, ya que el modelo no procesa texto ni mantiene conversaciones.
- Restricciones de licencia: la licencia MIT permite uso comercial sin condiciones de copyleft, pero la documentación técnica es limitada y puede requerir contacto con el autor para resolver dudas sobre reproducción.
- Caveat para producción: el modelo está orientado a investigación y no incluye infraestructura de despliegue, por lo que su integración en sistemas productivos exige un desarrollo adicional significativo.

## Enlaces

- HuggingFace: https://huggingface.co/kevinwhc/diffusion-tetris
- GitHub del autor: https://github.com/KevinChunye/Diffusion-Tetris
- Artículo en arXiv (abstract): https://arxiv.org/abs/2603.02348
- Artículo en arXiv (PDF): https://arxiv.org/pdf/2603.02348
