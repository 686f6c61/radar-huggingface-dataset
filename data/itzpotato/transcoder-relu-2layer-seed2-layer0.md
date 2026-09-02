# itzPotato/transcoder-relu-2layer-seed2-layer0

## Resumen

El modelo `itzPotato/transcoder-relu-2layer-seed2-layer0` es un transcoder TopK entrenado para reconstruir la salida de la capa 0 (MLP ReLU) de un transformer aritmético de 2 capas y 32 dimensiones, desarrollado por itzPotato (Rohan Sashank Babbellapati) como parte de una investigación sobre interpretabilidad mecánica. Un transcoder no es un autoencoder del residual stream, sino un modelo que lee la activación de entrada de una subcapa MLP y predice su salida a través de un cuello de botella k-esparso, lo que permite descomponer el cómputo en features interpretables.

Con solo 66.592 parámetros y una expansión de 32x (1024 features, k=32 activas por entrada), este modelo se ajusta a la capa 0 de un transformer pequeño entrenado para resolver problemas aritméticos. Su relevancia radica en que proporciona una herramienta para analizar cómo un modelo aprende representaciones internas de operaciones aritméticas, y forma parte de un conjunto de 18 transcoders que comparan la reconstrucción entre MLP ReLU y MLP bilineal. Es un modelo de investigación, no un LLM de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (capa 0 de un transformer aritmético de 2 capas) |
| Parametros totales | 66.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo generativo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, con `d_model` de entrada y salida de 32, 1024 features (expansión 32x), k=32 features activas por entrada, y filas del decodificador normalizadas a norma unitaria. El encoder y el decoder son matrices densas, y el cuello de botella TopK fuerza la esparsidad.

El entrenamiento se realizó con Adam a learning rate 0.0003, en lotes de 4096 vectores de activación (no problemas completos), con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, más un subconjunto de validación de 10.000 problemas. Se usaron 7.999.488 vectores de activación en 1.953 pasos. El sesgo del decodificador se inicializó con la media del target y el encoder se reescaló una vez con el primer lote de entrenamiento, para que la única pasada se dedicara a aprender features en lugar de corregir desajustes de escala. El modelo base tiene un hash sha256 verificado (`726a01d75e2dde1088d4cee0c8127c4c233071e104b274d001bd8d6670a28e34`).

## Capacidades

- Reconstrucción de la salida de la capa 0 del transformer aritmético con un error normalizado de 0.0085 (MSE / media(target^2)), lo que indica una reconstrucción casi perfecta.
- Descomposición de la activación MLP en 32 features activas por entrada, permitiendo analizar qué features se activan ante diferentes operaciones aritméticas.
- Soporte para análisis de interpretabilidad: al ser un transcoder, permite estudiar la superposición de features y la formación de circuitos en el modelo base.
- Comparación entre arquitecturas: el modelo forma parte de un conjunto de 18 transcoders que permiten medir la dificultad de reconstrucción entre MLP ReLU y MLP bilineal (los bilineales son ~1.55x más difíciles de reconstruir).
- Reproducibilidad: el código de carga exige un commit específico (`require_pinned=True`), lo que garantiza que los resultados no se vean afectados por cambios en el repositorio.
- No es un modelo generativo: no genera texto, código ni responde preguntas; su única función es la reconstrucción de activaciones para investigación.

## Casos de uso

- Análisis de circuitos en modelos aritméticos: el transcoder permite identificar qué features se activan al procesar sumas, restas u otras operaciones, ayudando a mapear cómo el modelo base computa internamente.
- Estudio de la superposición de features: al forzar k=32 features activas, se puede investigar cómo se comprimen y superponen las representaciones en un espacio de 32 dimensiones.
- Comparación de arquitecturas de MLP: al existir transcoders para MLP ReLU y MLP bilineal, se puede medir cuantitativamente qué arquitectura es más interpretable o más fácil de descomponer.
- Validación de métodos de interpretabilidad: sirve como banco de pruebas para algoritmos de transcoding, sparse autoencoders o análisis de features en modelos pequeños y controlados.
- Educación en interpretabilidad mecánica: al ser un modelo diminuto y con código de carga reproducible, es ideal para demostraciones didácticas de cómo funcionan los transcoders.
- Investigación sobre la relación entre entrenamiento y representaciones: al estar entrenado sobre un split específico y con una sola pasada, permite estudiar cómo el orden de los datos afecta a las features aprendidas.

## Benchmarks y rendimiento

El modelo no tiene benchmarks estándar de LLM (MMLU, HumanEval, etc.) porque no es un modelo generativo. En su lugar, se reportan métricas de reconstrucción:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado | 0.0085 |
| Fraccion de varianza no explicada | 0.0103 |
| MSE crudo | 0.0129656 |

El error normalizado se define como `MSE / mean(target^2)`, donde predecir una constante cero daría 1.0. Este valor es el que debe compararse entre arquitecturas. Según la model card, en el conjunto completo de 18 transcoders, los MLP bilineales son consistentemente ~1.55x más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249 en promedio).

## Requisitos de hardware

- El modelo tiene solo 66.592 parámetros, por lo que cabe en cualquier hardware, incluida una CPU moderna o una GPU de gama baja.
- VRAM estimada: menos de 1 MB para los pesos; la inferencia es trivial en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA (incluso una GTX 1050) o incluso ejecución en CPU sin problemas.
- No requiere GPU para inferencia; el cuello de botella es el cálculo de la multiplicación de matrices de 32x1024, que es despreciable.
- Opciones de despliegue: se carga mediante la función `load_transcoder` del repositorio `src/transcoder/source.py`; no está pensado para vLLM, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo de 66k parámetros, la latencia es del orden de microsegundos en GPU y milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de otros transcoders comparables en el mismo repositorio (solo se publica este modelo). Sin embargo, la model card menciona que forma parte de un conjunto de 18 transcoders que cubren tres profundidades, tres capas y tres semillas, tanto para MLP ReLU como bilineal. La comparación interna indica que los transcoders de MLP bilineal tienen un error normalizado promedio de 0.0387 frente a 0.0249 para los ReLU, lo que sugiere que los MLP ReLU son más fáciles de reconstruir. No hay datos públicos de otros transcoders de la misma categoría fuera de este proyecto.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para uso en producción ni para tareas de generación de texto o código.
- Solo cubre la capa 0 del modelo base; no proporciona información sobre capas superiores ni sobre el comportamiento global del transformer.
- El modelo base es un transformer aritmético de 32 dimensiones, muy pequeño y específico; los resultados no son generalizables a LLMs de gran escala.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial o la redistribución sin permiso del autor.
- El entrenamiento se realizó con una sola pasada sobre el split de entrenamiento, lo que puede introducir sesgos dependientes del orden de los datos.
- No se han evaluado sesgos sociales ni alucinaciones, ya que no es un modelo de lenguaje.
- La reconstrucción no es perfecta (error normalizado 0.0085), por lo que las features extraídas pueden perder información sutil de la activación original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-relu-2layer-seed2-layer0
- Modelo base (transformer aritmético): https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed2
- Perfil del autor: https://huggingface.co/itzPotato/models
