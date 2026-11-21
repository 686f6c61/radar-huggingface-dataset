# C-Tianyu/NanoJev

## Resumen

NanoJev es un modelo de decisión de 0,6 mil millones de parámetros desarrollado por C-Tianyu. No es un modelo generativo de texto al uso: recibe un estado textual y un conjunto de preguntas con candidatos (por ejemplo, acciones posibles en un entorno), y devuelve directamente una distribución de probabilidad sobre esos candidatos mediante softmax. Está construido sobre el backbone de Qwen3-0.6B y se publica como una réplica a pequeña escala de la interfaz de modelos "system one" propuesta por Jev (typesafe.ai).

El modelo unifica en un único checkpoint cuatro tareas de decisión: laberinto (Maze), Snake, ViZDoom Basic y predicción de posición (Predict Position). La innovación principal es que evita la decodificación de tokens de salida: en su lugar, codifica cada candidato junto con el estado y la pregunta, y una cabeza de atención (Choice head) puntúa el conjunto ofrecido, devolviendo todas las probabilidades a la vez. Esto reduce la latencia y permite un control estricto del espacio de acciones.

La relevancia actual radica en su enfoque como entorno de aprendizaje por refuerzo y modelo de decisión supervisado, no como chatbot. Con 826 descargas y 92 likes, el release incluye el checkpoint completo (23,9 GB), la inicialización exacta del entrenamiento, el código de inferencia y auditorías de entrenamiento, lo que lo convierte en un artefacto reproducible para investigación en agentes y planificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-0.6B) con cabeza de atención Choice para puntuar candidatos |
| Parametros totales | 0,6 mil millones (backbone) + cabeza Choice (tamaño no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión bf16 en inferencia) |
| Idiomas soportados | en, zh |
| Licencia | Código fuente: MIT; modelo base Qwen: licencia upstream (no especificada en la información disponible) |
| Formato de pesos | safetensors (`best.safetensors`), config.json, backbone_config/, tokenizer/ |

## Arquitectura y entrenamiento

NanoJev utiliza un backbone transformer Qwen3-0.6B compartido. Cada candidato se codifica junto con su estado y pregunta; las representaciones de fin de secuencia se pasan a una cabeza Choice basada en atención que puntúa el conjunto de candidatos ofrecidos. La salida es una distribución softmax sobre todos los candidatos simultáneamente, sin decodificación de tokens de salida. El modelo soporta además tipos de petición booleanos y de puntuación ordenada a través de la misma interfaz estructurada.

El entrenamiento se basa en entropía cruzada supervisada con mezcla de tareas (mixed-task supervised cross entropy). La supervisión de acciones para Predict Position proviene del experto visual Sonic Doom. Los datos de Maze, Snake y Basic mantienen sus splits originales. Se compararon cuatro ejecuciones emparejadas (objetivos hard/soft para Predict Position y dos learning rates), seleccionando `hard_lr1e5` en el paso 400 según el rendimiento en desarrollo. El SHA256 del peso seleccionado es `f68c47d66998231b86b7e91b4ed5e82ae23acf104c8b7cd6d165c3ac7b7ffe1b`. El modelo base es `Qwen/Qwen3-0.6B@c1899de289a04d12100db370d81485cdf75e47ca`.

## Capacidades

- Decisión sobre conjuntos de candidatos: devuelve distribuciones de probabilidad completas para acciones ofrecidas, sin generar texto libre.
- Soporte de múltiples tipos de pregunta: elección (choice), booleana (boolean) y puntuación ordenada (ordered-score).
- Unificación de cuatro tareas en un solo checkpoint: Maze, Snake, ViZDoom Basic y Predict Position.
- Interfaz estructurada de observación, estado y pregunta inspirada en Jev.
- Capacidades multilingües limitadas a inglés y chino (según tags).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta modo thinking, visión ni audio en la información disponible.

## Casos de uso

- Investigación en entornos de aprendizaje por refuerzo: el modelo actúa como política de decisión en entornos discretos (Maze, Snake), permitiendo comparar políticas aprendidas frente a planificadores clásicos con métricas reproducibles.
- Evaluación de modelos de decisión "system one": sirve como banco de pruebas a pequeña escala para estudiar la interfaz estado-pregunta-candidatos y su comportamiento frente a alternativas como Jev.
- Agentes en videojuegos simbólicos: integración en ViZDoom Basic para seleccionar acciones (izquierda, derecha, disparar, esperar) a partir de observaciones textuales estructuradas.
- Predicción de posición en entornos visuales: uso del modelo como componente de decisión supervisado por el experto Sonic Doom para tareas de localización y control.
- Reproducibilidad de experimentos: el release incluye inicialización, auditorías y manifiestos SHA256, lo que permite replicar el entrenamiento y verificar pesos en pipelines de investigación.
- Prototipado de interfaces de decisión estructurada: el código de inferencia (`DecisionPredictor`) puede adaptarse para probar nuevos conjuntos de candidatos y preguntas booleanas u ordenadas en dominios distintos.

## Benchmarks y rendimiento

| Tarea de test emparejada | NanoJev | Jev | Qwen sin ajustar |
|---|---:|---:|---:|
| Maze | 4/10 | 7/10 | 2/10 |
| Snake | 8/8 | 8/8 | 0/8 |
| Basic | 128/128 | 56/128 | 56/128 |
| Predict Position | 27/128 | 11/128 | 11/128 |

En la demostración difícil (Maze 50x50 y Snake 12x12), NanoJev alcanza el objetivo del laberinto en 225 intentos y recoge 30 alimentos sobreviviendo los 256 pasos de Snake. Todos los sistemas comparten la interfaz de observación estructurada, casos congelados, epsilon del controlador 0,1 y semilla de muestreo 17.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con backbone de 0,6B en bf16 se estima en torno a 1,2-1,5 GB para los pesos, más overhead de la cabeza Choice y del tokenizador.
- GPU recomendadas: no especificadas; el ejemplo de carga usa `cuda:0` con precisión `bf16` y `disable_native_triton=True`.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), aunque no se confirma en la información disponible.
- Opciones de despliegue: el release proporciona código propio (`predict_toy_decisions.DecisionPredictor`) sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoJev | 0,6B | no disponible | Maze, Snake, ViZDoom Basic, Predict Position | Código MIT; base Qwen upstream | Hugging Face, sin autenticación |
| Jev | no disponible | no disponible | misma interfaz de decisión | no disponible | Referencia en blog de typesafe.ai |
| Qwen3-0.6B (sin ajustar) | 0,6B | no disponible | generación de texto general | licencia upstream Qwen | Hugging Face |

Jev es el referente directo de la interfaz; NanoJev lo replica a menor escala con resultados mixtos (mejor en Basic y Predict Position, peor en Maze). Qwen3-0.6B sin ajustar sirve como línea base y muestra rendimiento nulo en Snake y bajo en el resto de tareas de decisión.

## Limitaciones y advertencias

- Rendimiento inferior a Jev en Maze (4/10 frente a 7/10), lo que sugiere limitaciones en planificación de laberintos complejos.
- El modelo está especializado en cuatro tareas concretas; no es un modelo generativo de propósito general ni un chatbot.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Licencia del modelo base Qwen no especificada en la información disponible; es necesario consultar la licencia upstream para uso comercial.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto libre), pero las distribuciones de probabilidad pueden ser incorrectas en estados fuera de distribución.
- El release incluye artefactos de versiones anteriores (`stage1/`, `variants/`, manifiestos legacy) que pueden confundir; se recomienda usar el manifiesto SHA256 actual.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de los tests emparejados y los informes OOD enlazados en el dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/C-Tianyu/NanoJev
- Dataset completo y grabaciones: https://huggingface.co/datasets/C-Tianyu/NanoJev-Data
- Receta de entrenamiento: TRAINING_RECIPE.md (en el repositorio)
- Manifiesto de hashes: SHA256_MANIFEST.json (en el repositorio)
- Blog de Jev (inspiración): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Snapshot legacy: https://huggingface.co/C-Tianyu/NanoJev/tree/legacy-before-unified-games-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
