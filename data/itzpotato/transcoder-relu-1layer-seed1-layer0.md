# itzPotato/transcoder-relu-1layer-seed1-layer0

## Resumen

El modelo `itzPotato/transcoder-relu-1layer-seed1-layer0` es un transcoder TopK ajustado a la capa 0 de un transformer aritmético de una sola capa con MLP ReLU, publicado por el usuario itzPotato. Un transcoder es una herramienta de interpretabilidad mecanicista que aproxima una subcapa MLP concreta: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-sparse, a diferencia de un autoencoder disperso que opera sobre la corriente residual. Este modelo concreto se entrena sobre las activaciones del modelo base `itzPotato/arithmetic-relu-1layer-seed1`, un transformer pequeño diseñado para tareas aritméticas, y sirve para analizar los circuitos internos que el modelo utiliza para realizar cálculos.

La relevancia de este transcoder radica en que permite descomponer el comportamiento de un MLP en features interpretables y escasas, facilitando el estudio de cómo se forman los circuitos de características en modelos pequeños. Con solo 66.592 parámetros, una dimensión de modelo de 32 y 1.024 features con k=32 activas por entrada, es un artefacto de investigación ligero y reproducible. No es un modelo de lenguaje ni de generación de texto; su propósito es exclusivamente el análisis de interpretabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (cuello de botella k-sparse) sobre MLP ReLU de capa 0 |
| Parametros totales | 66.592 |
| Parametros activos | 32 (k) |
| Longitud de contexto | No aplica (modelo de activaciones, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | No disponible (librería PyTorch, formato no especificado) |

## Arquitectura y entrenamiento

El transcoder sigue la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `x` es la activación de entrada del MLP de la capa 0 del modelo base, `W_enc` y `b_enc` son la matriz y el sesgo del encoder, `W_dec` y `b_dec` los del decoder, y `TopK_k` selecciona las k activaciones más grandes. La dimensión del modelo es 32, con 1.024 features (expansión 32x) y k=32, lo que significa que cada entrada se representa mediante 32 features activas. Las filas del decoder tienen norma unitaria.

El entrenamiento se realizó con Adam a una tasa de aprendizaje de 0.0003, lotes de 4.096 vectores de activación (no problemas completos) y una única pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación separado de 10.000 problemas. Los splits de validación y prueba del modelo base nunca se utilizaron. En total se procesaron 7.999.488 vectores de activación en 1.953 pasos. La inicialización es particular: el sesgo del decoder se fija a la media del target y el encoder se reescala una vez a partir del primer lote de entrenamiento, de modo que la única pasada permitida se dedica a aprender features en lugar de corregir desajustes de escala. Se midieron los valores de calibración: `calibration_scale` 0.777, `init_normalized_after` 1.41 y `init_normalized_before` 1.83.

## Capacidades

- Aproximación de la salida del MLP de la capa 0 del modelo base `arithmetic-relu-1layer-seed1` con un error de reconstrucción normalizado de 0.0293.
- Descomposición de la activación del MLP en features escasas e interpretables (k=32 de 1.024 posibles).
- Soporte para análisis de circuitos en modelos transformer pequeños, al permitir inspeccionar qué features se activan ante diferentes entradas aritméticas.
- Reproducibilidad garantizada mediante el anclaje a un commit específico del modelo base (sha256 `30a973ab...`).
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling, al ser un artefacto de interpretabilidad.

## Casos de uso

- Análisis de circuitos en modelos aritméticos: el transcoder permite identificar qué features del MLP de la capa 0 se activan al procesar operaciones como sumas o restas, facilitando la reconstrucción de los circuitos que el modelo utiliza para resolver problemas aritméticos.
- Estudio de la formación de features en transformers pequeños: al ser un modelo de una sola capa, sirve como banco de pruebas para entender cómo se especializan las features durante el entrenamiento.
- Comparación de arquitecturas de MLP: el autor reporta que los transcoders ajustados a MLP bilineales son consistentemente ~1.55x más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249 de error normalizado), lo que permite estudiar diferencias de representación entre tipos de MLP.
- Validación de metodologías de transcoders: al estar entrenado con una sola pasada y una inicialización calibrada, puede usarse como referencia para evaluar nuevas técnicas de entrenamiento de transcoders.
- Reproducción de experimentos de interpretabilidad: gracias al anclaje de revisión (`require_pinned=True`), los resultados son reproducibles sin riesgo de cargar pesos cambiantes.
- Docencia e investigación en interpretabilidad mecanicista: su pequeño tamaño y su naturaleza autocontenida lo hacen adecuado para demostraciones prácticas de cómo funcionan los transcoders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un LLM general. En su lugar, la model card reporta métricas de reconstrucción sobre el MLP objetivo:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / media(target^2)) | 0.0293 |
| Fraccion de varianza no explicada | 0.0384 |
| MSE crudo | 3.40536 |

El error normalizado es la métrica recomendada para comparar entre arquitecturas, ya que las escalas de salida de MLP ReLU y bilineales difieren. Un predictor constante cero obtendría una puntuación de 1.0, por lo que 0.0293 indica una reconstrucción muy fiel.

## Requisitos de hardware

- Al tratarse de un modelo de solo 66.592 parámetros, la inferencia es trivial: cabe en cualquier CPU moderna y en cualquier GPU, incluso en las más básicas.
- No se han publicado requisitos específicos de VRAM, pero se estima que el uso de memoria no supera unos pocos megabytes.
- El despliegue no requiere frameworks de inferencia como vLLM, llama.cpp u Ollama; basta con PyTorch y el código de carga proporcionado en el repositorio.
- La latencia es despreciable (del orden de microsegundos por vector de activación) y el throughput está limitado únicamente por la velocidad de lectura de los datos de entrada.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros transcoders publicados en la información proporcionada. El autor menciona que, dentro del conjunto de 18 transcoders de esta serie, los ajustados a MLP bilineales son consistentemente más difíciles de reconstruir que los ReLU, pero no se ofrecen nombres concretos de modelos comparables. Por tanto, la comparativa se limita a la observación cualitativa de que este transcoder ReLU presenta un error normalizado de 0.0293 frente a 0.0249 de media para los ReLU del conjunto, y 0.0387 para los bilineales.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para producción ni para tareas de generación de texto.
- Está específicamente ajustado a la capa 0 de un único modelo base (`arithmetic-relu-1layer-seed1`); no es transferible a otros modelos sin reentrenamiento.
- No se especifica licencia, lo que puede limitar su uso comercial o su redistribución; se recomienda contactar con el autor antes de utilizarlo en proyectos con requisitos legales.
- El formato de pesos no está documentado explícitamente, aunque la librería es PyTorch; puede requerir adaptación para cargarlo en otros entornos.
- La dependencia de un commit concreto del modelo base (sha256 `30a973ab...`) implica que cualquier cambio en el repositorio base podría invalidar los resultados si no se usa el anclaje de revisión.
- Al ser un transcoder de una sola capa, su capacidad de análisis se limita a la capa 0; no proporciona información sobre capas superiores ni sobre la atención.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-relu-1layer-seed1-layer0
- Modelo base: https://huggingface.co/itzPotato/arithmetic-relu-1layer-seed1
- Paper de referencia sobre transcoders: https://arxiv.org/abs/2406.11944
