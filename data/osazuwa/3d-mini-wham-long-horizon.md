# osazuwa/3d-mini-wham-long-horizon

## Resumen

El modelo `osazuwa/3d-mini-wham-long-horizon` es un conjunto de checkpoints de un modelo del mundo (world model) para predicción de vídeo a largo plazo en un entorno 3D de tipo dungeon crawler. Ha sido desarrollado por el usuario osazuwa como parte del repositorio de experimentos `world_model_experiments` (PR 25), y se publica en Hugging Face como material de investigación. Su objetivo principal es modelar la dinámica de un entorno virtual sintético mediante arquitecturas basadas en MaskGIT y objetivos de inferencia causal, lo que lo convierte en una pieza relevante para estudiar la predicción de secuencias de vídeo y la toma de decisiones basada en modelos.

El repositorio incluye dos configuraciones principales: `lh-XL-causal-12000` con 170.981.672 parámetros entrenables y `lh-XXL-causal-6000` con 363.604.008 parámetros entrenables. Ambos checkpoints se distribuyen como "full-resume", es decir, contienen no solo los pesos del modelo sino también el estado completo del optimizador AdamW, el estado del generador de números aleatorios, el estado del sampler/window, la especificación exacta del entrenamiento, la procedencia del tokenizer y de los datos, el cómputo acumulado en FLOPs y la contabilidad de gasto. El contexto de vídeo manejado es de 23 segundos, según la búsqueda de arquitectura descrita en la model card.

La relevancia actual del modelo radica en su carácter de referencia para experimentos en modelos de mundo con predicción de vídeo a largo plazo, un área activa en IA para simulación y planificación. Al ser un modelo de código abierto con licencia "other", está pensado para su uso en investigación y desarrollo experimental, no como producto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MaskGIT (basada en transformer) para predicción de vídeo |
| Parametros totales | 170.981.672 (run `lh-XL-causal-12000`) / 363.604.008 (run `lh-XXL-causal-6000`) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 23 segundos de vídeo (según model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vídeo, no de texto) |
| Licencia | other (no estándar) |
| Formato de pesos | Checkpoints de PyTorch (archivos `resume.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MaskGIT, un enfoque de generación por enmascaramiento que procesa secuencias de vídeo de forma autogresiva pero con predicción simultánea de múltiples tokens enmascarados. Esto permite una generación más rápida y eficiente que los métodos autorregresivos puros, manteniendo la calidad de la representación. En este caso, la arquitectura se ha adaptado para el entorno específico de un dungeon crawler 3D, donde el modelo debe predecir la evolución del estado del mundo a partir de observaciones parciales.

El entrenamiento se realizó con una estrategia de "full resume", lo que significa que los checkpoints almacenan el estado completo del optimizador AdamW, el estado del generador de números aleatorios, el estado del sampler y de la ventana de datos, así como la especificación exacta del experimento. Esto permite reanudar el entrenamiento desde cualquier punto sin pérdida de información. Los objetivos de entrenamiento incluyen tres componentes: predicción de trazas (trace-prediction), predicción de eventos de estado discreto (DSEP, por sus siglas en inglés) y temporización de eventos (event-timing). No se ha publicado el número exacto de tokens de entrenamiento ni la composición del dataset, aunque se indica que los datos provienen de un entorno 3D de dungeon crawler y que el tokenizer y los datos pre-codificados se publican por separado en los repositorios `osazuwa/3d-mini-wham-tokenizers` y `osazuwa/3d-mini-wham-encodings`.

## Capacidades

- Predicción de vídeo a largo plazo: el modelo puede generar o predecir secuencias de vídeo de hasta 23 segundos en el entorno 3D de dungeon crawler.
- Modelado del mundo: captura la dinámica causal del entorno, permitiendo anticipar estados futuros a partir de observaciones pasadas.
- Inferencia causal: los objetivos de entrenamiento incluyen la predicción de eventos y su temporalización, lo que otorga al modelo una capacidad de razonamiento causal básico dentro del dominio.
- Generación con máscara: gracias a MaskGIT, el modelo puede completar regiones enmascaradas de la secuencia de vídeo, útil para inpainting o predicción parcial.
- Formato de checkpoint completo: al incluir el estado del optimizador y del RNG, es posible reanudar el entrenamiento exactamente, lo que facilita la experimentación reproducible.
- Extensibilidad: al estar en PyTorch, se integra fácilmente con frameworks de investigación y herramientas de visualización.

## Casos de uso

- Investigación en modelos del mundo: el modelo sirve como referencia para estudiar cómo las arquitecturas MaskGIT manejan la predicción a largo plazo en entornos sintéticos 3D, especialmente en términos de estabilidad temporal y error acumulado.
- Simulación de entornos de juego: puede utilizarse para generar vídeo sintético de un dungeon crawler, lo que permite entrenar agentes de refuerzo en entornos simulados sin necesidad de un motor físico.
- Predicción de trayectorias en entornos dinámicos: en aplicaciones de robótica o automatización, el modelo puede adaptarse para predecir la evolución de estados de un entorno controlado, aunque su dominio actual es específico.
- Evaluación de arquitecturas de predicción causal: los checkpoints permiten comparar el rendimiento de MaskGIT frente a otros modelos autorregresivos o basados en difusión en tareas de predicción de vídeo.
- Generación de datos de entrenamiento: el modelo puede generar secuencias de vídeo sintéticas que sirvan para aumentar datasets de entrenamiento en tareas de visión o control.
- Estudio de la dinámica de videojuegos: en el ámbito del aprendizaje automático aplicado a juegos, el modelo puede predecir las consecuencias de las acciones del jugador, útil para testing automático o diseño de niveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (como PSNR, SSIM o FID) ni comparaciones con otros modelos de predicción de vídeo.

## Requisitos de hardware

- El modelo con 170 millones de parámetros (XL) requiere aproximadamente 680 MB de VRAM en FP32 para los pesos, y el de 363 millones (XXL) unos 1,5 GB. Con cuantización de 8 bits, estos valores se reducen a unos 170 MB y 360 MB respectivamente.
- Se estima que cabría en GPUs de consumo como la RTX 3060 (12 GB) o superiores, incluso en tarjetas con 4 GB de VRAM si se aplica cuantización.
- No se especifican en la documentación frameworks de despliegue como vLLM o llama.cpp; al ser un modelo de investigación en PyTorch, se puede ejecutar con scripts de inferencia personalizados.
- La latencia y el throughput no están documentados; dependerán del tamaño del modelo y de la GPU utilizada.
- Para reanudar el entrenamiento completo (con el estado del optimizador), se recomienda una GPU con al menos 16 GB de VRAM para el modelo XXL y 8 GB para el XL.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (world models con MaskGIT para predicción de vídeo en entornos 3D). El proyecto WHAM (World-grounded Humans) en GitHub es un modelo diferente, enfocado en reconstrucción de movimiento humano 3D, y no es comparable. Otros modelos de mundo como SkyJEPA (del paper 2606.23444) se centran en dinámicas robóticas aéreas, pero no hay datos públicos de rendimiento que permitan una comparación justa.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación y no está validado para uso en producción; no se recomienda su despliegue en sistemas críticos sin una evaluación exhaustiva.
- La licencia es "other", lo que implica que los términos de uso comercial no están claramente definidos; es necesario contactar al autor para aclarar las restricciones.
- No se han documentado sesgos potenciales ni riesgos de alucinación, pero al ser un modelo generativo de vídeo, existe la posibilidad de que produzca secuencias irreales o inconsistentes con la física del entorno.
- La ventana de contexto se limita a 23 segundos de vídeo, por lo que no puede manejar dependencias temporales más largas.
- El modelo está entrenado únicamente en un entorno de dungeon crawler 3D, por lo que su capacidad de generalización a otros entornos o dominios es desconocida.
- Los datos de entrenamiento no se han publicado en su totalidad (solo se menciona que están pre-codificados), lo que dificulta la reproducibilidad completa.
- No se proporcionan métricas de rendimiento, lo que limita la evaluación objetiva de su calidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/osazuwa/3d-mini-wham-long-horizon
- Repositorio de experimentos (PR 25): https://github.com/robertness/world_model_experiments/pull/25
- Tokenizer publicado por separado: https://huggingface.co/osazuwa/3d-mini-wham-tokenizers
- Dataset pre-codificado: https://huggingface.co/datasets/osazuwa/3d-mini-wham-encodings
- Proyecto WHAM (no relacionado, solo referencia): https://github.com/yohanshin/WHAM
- Artículo sobre SkyJEPA (world model para robótica): https://arxiv.org/abs/2606.23444
