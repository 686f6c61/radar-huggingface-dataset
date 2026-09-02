# itzPotato/transcoder-relu-1layer-seed2-layer0

## Resumen

El modelo `itzPotato/transcoder-relu-1layer-seed2-layer0` es un transcoder TopK entrenado sobre la capa 0 de un transformer aritmético de una sola capa con MLP ReLU, publicado por el usuario itzPotato. Un transcoder es una herramienta de interpretabilidad que aproxima la función de una subcapa MLP: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-sparse, a diferencia de un autoencoder disperso (SAE) que reconstruye el residual stream. Este modelo concreto se ajusta al checkpoint `itzPotato/arithmetic-relu-1layer-seed2`, un modelo pequeño diseñado para tareas aritméticas, y está pensado para facilitar el análisis de circuitos interpretables a nivel de features.

La arquitectura es compacta: dimensión de modelo 32, 1024 features (expansión 32x), con 32 features activas por entrada (k=32) y un total de 66.592 parámetros. El entrenamiento se realizó con una sola pasada sobre 7.999.488 vectores de activación procedentes del split de train del modelo base, usando Adam con tasa de aprendizaje 0.0003 y batches de 4096 vectores. La inicialización incluye un reescalado del encoder y el bias del decoder fijado a la media del target, lo que permite que la única pasada se dedique a aprender features en lugar de corregir desajustes de escala.

La relevancia de este modelo radica en su contribución a la mecanística interpretable: los transcoders permiten descomponer el comportamiento de los MLP en features dispersas y trazables, lo que facilita el estudio de circuitos en modelos pequeños. Aunque no es un modelo generativo ni de lenguaje, sirve como herramienta de investigación para entender cómo los transformers procesan operaciones aritméticas y para validar metodologías de interpretabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (capa 0 de un transformer ReLU de 1 capa) |
| Parametros totales | 66.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería PyTorch, probablemente .pt) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `x` es la activación de entrada del MLP de la capa 0, `W_enc` y `b_enc` son el encoder, `W_dec` y `b_dec` el decoder, y `TopK_k` selecciona las k=32 features con mayor activación. Las filas del decoder tienen norma unitaria, lo que estabiliza el entrenamiento. El modelo tiene d_model=32, 1024 features (expansión 32x) y 66.592 parámetros.

El entrenamiento usó Adam con lr 0.0003, batches de 4096 vectores de activación (no problemas completos) y una sola pasada sobre 500.000 problemas del split de train del modelo base, con un subconjunto de validación de 10.000 problemas. Los splits de validación y test del modelo base no se tocaron. Se procesaron 7.999.488 vectores de activación en 1.953 pasos. La inicialización fija el bias del decoder a la media del target y reescala el encoder una vez desde el primer batch, con valores medidos de calibración_scale=0.872, init_normalized_after=1.64 e init_normalized_before=1.87. El modelo está registrado con un commit sha específico para garantizar reproducibilidad.

## Capacidades

- Reconstrucción de la salida del MLP de la capa 0 del modelo base, con un error de reconstrucción normalizado de 0.0413 y una fracción de varianza no explicada de 0.0507.
- Extracción de features dispersas e interpretables (k=32 activas de 1024) que pueden asociarse a operaciones aritméticas o patrones internos del transformer.
- Soporte para análisis de circuitos: al ser un transcoder, permite rastrear cómo las features de capas anteriores influyen en las de capas posteriores mediante técnicas de atribución.
- Compatibilidad con el ecosistema PyTorch y carga mediante la función `load_transcoder` con verificación de integridad (`require_pinned=True`).
- No es un modelo generativo: no produce texto, código ni respuestas; su salida es una reconstrucción de activaciones.
- No tiene capacidades multimodales, tool calling ni soporte de agentes.

## Casos de uso

- Análisis de circuitos interpretables en modelos aritméticos: el transcoder permite descomponer el MLP de la capa 0 en features dispersas, facilitando la identificación de subgrafos responsables de operaciones como suma o multiplicación.
- Estudio de la composición de capas en transformers pequeños: al reconstruir la salida del MLP, se puede investigar cómo las features de la capa 0 se combinan con las de capas superiores para producir comportamientos complejos.
- Validación de metodologías de interpretabilidad: comparar transcoders con SAEs u otras técnicas para evaluar su fidelidad en la reconstrucción de activaciones, usando las métricas de error normalizado y FVU.
- Entrenamiento de transcoders para otros modelos: el código y la configuración de este modelo pueden servir como referencia para ajustar transcoders a otras arquitecturas o capas.
- Investigación en mecanística de la aritmética: el modelo base está diseñado para tareas aritméticas, por lo que este transcoder ayuda a entender qué features codifican dígitos, acarreos o resultados intermedios.
- Reproducibilidad en interpretabilidad: gracias a la fijación de semillas y al registro de commits, puede usarse como caso de estudio para prácticas de investigación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no se evalúa con métricas estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje. Sin embargo, la model card reporta métricas de calidad de reconstrucción, que se presentan a continuación:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / media(target^2)) | 0.0413 |
| Fraccion de varianza no explicada (FVU) | 0.0507 |
| MSE crudo | 5.87365 |

Estas métricas indican que el transcoder captura aproximadamente el 95% de la varianza de la salida del MLP. Un predictor constante cero obtendría un error normalizado de 1.0, por lo que el valor de 0.0413 refleja una reconstrucción de alta calidad. La model card también señala que, en el conjunto de 18 transcoders de la misma familia, los MLP bilineales son ~1.55x más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249), lo que contextualiza el rendimiento de este modelo.

## Requisitos de hardware

- El modelo tiene solo 66.592 parámetros, por lo que cabe en cualquier hardware, incluyendo CPU sin GPU.
- VRAM estimada: menos de 1 GB, incluso en cuantización FP32.
- GPU recomendada: ninguna en particular; cualquier GPU con al menos 1 GB de VRAM es suficiente, aunque no es necesaria.
- Se puede ejecutar en Google Colab, portátiles o servidores sin aceleración.
- Opciones de despliegue: Python con PyTorch, usando la función `load_transcoder` del repositorio asociado. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de generación de texto.
- Latencia y throughput: al ser un modelo diminuto, la inferencia es prácticamente instantánea (del orden de microsegundos por vector de activación en CPU).

## Comparativa con modelos similares

No disponible. No se han identificado transcoders comparables con especificaciones públicas en la información proporcionada. Existen otros transcoders en la literatura (por ejemplo, los descritos en el artículo "Transcoders Find Interpretable LLM Feature Circuits"), pero no se dispone de datos concretos de parámetros o rendimiento para establecer una comparación directa.

## Limitaciones y advertencias

- Es un modelo de investigación, no diseñado para uso en producción ni para tareas de generación de texto.
- Solo cubre la capa 0 de un modelo base específico (`arithmetic-relu-1layer-seed2`); no es transferible a otros modelos sin reentrenamiento.
- La licencia no está especificada, por lo que se desconoce si hay restricciones para uso comercial o modificación.
- El entrenamiento se realizó con una sola pasada sobre datos de activación, lo que podría implicar cierto sobreajuste a los vectores de entrenamiento, aunque las métricas de reconstrucción sugieren buena generalización.
- No se han evaluado sesgos, ya que el modelo no procesa lenguaje natural; sin embargo, los datos de entrenamiento provienen de problemas aritméticos, por lo que su comportamiento está limitado a ese dominio.
- La carga del modelo requiere verificar el commit sha (`require_pinned=True`), lo que añade una capa de seguridad pero también exige que el entorno tenga acceso al repositorio y a la configuración exacta.
- El error de reconstrucción no es cero, por lo que las features extraídas pueden no capturar todos los matices del MLP original, especialmente en casos extremos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-relu-1layer-seed2-layer0
- Modelo base: https://huggingface.co/itzPotato/arithmetic-relu-1layer-seed2
- Artículo sobre transcoders (arXiv): https://arxiv.org/abs/2406.11944
- Publicación en LessWrong sobre transcoders: https://www.lesswrong.com/posts/YmkjnWtZGLbHRbzrP/transcoders-enable-fine-grained-interpretable-circuit
