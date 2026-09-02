# itzPotato/transcoder-relu-2layer-seed0-layer0

## Resumen

Este modelo es un transcoder TopK entrenado sobre la capa 0 del transformer aritmético `itzPotato/arithmetic-relu-2layer-seed0`, un modelo de dos capas con MLP ReLU diseñado para tareas de aritmética. Un transcoder es una herramienta de interpretabilidad que aproxima una subcapa MLP concreta: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-escaso. A diferencia de un autoencoder disperso (SAE) clásico, no reconstruye el residual stream, sino la transformación específica del MLP.

El modelo fue desarrollado por itzPotato como parte de un conjunto de 18 transcoders (3 profundidades × 2 tipos de MLP × 3 semillas) para estudiar la dificultad de reconstrucción entre arquitecturas ReLU y bilineales. Con solo 66.592 parámetros y una expansión de 32× (d_model 32 → 1024 features), este transcoder logra un error de reconstrucción normalizado de 0.0115, lo que indica una fidelidad muy alta. Su relevancia radica en que permite analizar qué features internas utiliza el modelo base para realizar operaciones aritméticas, contribuyendo a la investigación en mecanística e interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (encoder-decodificador lineal con bottleneck disperso) |
| Parametros totales | 66.592 |
| Parametros activos | 32 (k, features activas por entrada) |
| Longitud de contexto | no disponible (no aplica, procesa vectores de activación) |
| Tipos de cuantizacion | no disponible (pesos en float32, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (probablemente safetensors, no confirmado en la model card) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `W_enc` mapea de 32 dimensiones a 1024 features, `TopK_k` selecciona las k=32 activaciones más altas, y `W_dec` proyecta de vuelta a 32 dimensiones. Las filas del decodificador están normalizadas a norma unitaria. El bias del decodificador se inicializa con la media del target y el encoder se reescala una vez con el primer batch de entrenamiento, de modo que la única pasada de entrenamiento se dedica a aprender features en lugar de corregir desajustes de escala.

El entrenamiento usó Adam con learning rate 0.0003, batches de 4096 vectores de activación (no problemas completos), y una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación de 10.000 problemas. En total se procesaron 7.999.488 vectores de activación en 1.953 pasos. Los splits de validación y test del modelo base nunca se tocaron, lo que garantiza que la evaluación de reconstrucción no esté contaminada.

## Capacidades

- Reconstrucción de la salida del MLP de la capa 0 del modelo base con alta fidelidad (error normalizado 0.0115).
- Identificación de features dispersas y superpuestas en el espacio de activaciones del MLP.
- Análisis de la estructura interna de un transformer aritmético de 2 capas con MLP ReLU.
- Comparación de dificultad de reconstrucción entre arquitecturas ReLU y bilineales (el autor reporta que las bilineales son ~1.55× más difíciles).
- Soporte para verificación de procedencia mediante hash sha256 del checkpoint base.
- Carga reproducible con fijación de revisión (`require_pinned=True`) para evitar cambios silenciosos en el repositorio.

## Casos de uso

- Investigación en interpretabilidad mecanística: permite descomponer las operaciones internas de un transformer aritmético en features interpretables, facilitando el estudio de cómo se representan y combinan los números.
- Validación de métodos de sparse autoencoding: sirve como punto de comparación para evaluar la calidad de reconstrucción de transcoders frente a SAEs clásicos en una arquitectura controlada.
- Estudio de la dificultad de reconstrucción por tipo de MLP: al existir variantes ReLU y bilineales, se puede cuantificar cómo la no linealidad afecta a la compresibilidad de las activaciones.
- Depuración de modelos pequeños: ayuda a localizar qué features contribuyen a errores aritméticos específicos en el modelo base, útil para corregir comportamientos no deseados.
- Educación en interpretabilidad: modelo mínimo y reproducible para enseñar conceptos de transcoders, TopK y análisis de features sin necesidad de grandes recursos.
- Benchmark de herramientas de interpretabilidad: puede usarse como caso de prueba para nuevas librerías de visualización o análisis de features, dado su tamaño reducido y su procedencia documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de reconstrucción:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / mean(target^2)) | 0.0115 |
| Fraccion de varianza no explicada | 0.0128 |
| MSE crudo | 0.00565639 |

Estas métricas indican que el transcoder explica el 98.7% de la varianza de la salida del MLP. No hay comparación con otros transcoders en la misma tabla, aunque el autor menciona que en el conjunto completo de 18 transcoders, los MLP bilineales son consistentemente ~1.55× más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249 de error normalizado medio).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB (66.592 parámetros en float32 ocupan ~266 KB).
- GPU recomendadas: cualquier GPU, incluso integradas; también funciona en CPU sin problemas.
- Cabe en cualquier consumer GPU: sí, es trivialmente pequeño.
- Opciones de despliegue: carga directa con PyTorch mediante la función `load_transcoder` del repositorio asociado; no requiere vLLM, llama.cpp ni otros motores de inferencia.
- Latencia y throughput: despreciables; la inferencia sobre un vector de 32 dimensiones es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. Este transcoder pertenece a una familia específica de herramientas de interpretabilidad para un modelo base concreto (`arithmetic-relu-2layer-seed0`). Como referencia conceptual, se puede comparar con sparse autoencoders (SAE) estándar, pero la diferencia clave es que un SAE reconstruye el residual stream mientras que un transcoder predice la salida del MLP. No hay datos de rendimiento de otros transcoders sobre el mismo modelo base en la documentación disponible.

## Limitaciones y advertencias

- Modelo de investigación, no diseñado para uso en producción ni para tareas de generación de texto.
- Solo cubre la capa 0 del modelo base; no proporciona información sobre capas superiores ni sobre el comportamiento global del transformer.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación.
- El modelo base es un transformer aritmético sintético, no un LLM real; las features aprendidas pueden no transferirse a modelos de mayor escala.
- La reconstrucción no es perfecta (error normalizado 0.0115), por lo que las features extraídas pueden contener ruido o artefactos.
- Depende de la procedencia del checkpoint base: si el hash sha256 no coincide, la carga fallará con `require_pinned=True`, lo que limita su uso con versiones modificadas del modelo base.
- No se proporcionan datos sobre sesgos o alucinaciones, ya que no es un modelo generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-relu-2layer-seed0-layer0
- Modelo base: https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed0
- Repositorio de código (referenciado en la model card, no verificado): `src/transcoder/source.py` y `src/transcoder/config.py` (no se proporciona URL directa)
