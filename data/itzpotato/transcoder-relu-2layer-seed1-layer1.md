# itzPotato/transcoder-relu-2layer-seed1-layer1

## Resumen

El modelo `itzPotato/transcoder-relu-2layer-seed1-layer1` es un transcoder TopK entrenado sobre la capa 1 de un transformer de 2 capas dedicado a aritmética, `itzPotato/arithmetic-relu-2layer-seed1`. Un transcoder es una herramienta de interpretabilidad que aproxima una subcapa MLP concreta: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-escaso. No es un autoencoder del residual stream, sino un modelo específico para analizar el comportamiento interno de un transformer pequeño.

Desarrollado por el usuario itzPotato, este transcoder forma parte de un conjunto de 18 transcoders (3 semillas × 3 celdas de profundidad/capa × 2 arquitecturas de MLP) diseñados para estudiar cómo los transformers aritméticos representan y procesan información. Su relevancia radica en que permite inspeccionar la actividad de la capa 1 de un modelo entrenado en tareas de suma, proporcionando una ventana a los mecanismos internos de razonamiento aritmético. El modelo tiene 66.592 parámetros, una expansión de características de 32× (d_model=32, features=1024) y una activación TopK con k=32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (sparse autoencoder sobre MLP) |
| Parametros totales | 66.592 |
| Parametros activos | 32 (k, número de características activas por entrada) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa vectores de activación) |
| Tipos de cuantizacion | no disponible (pesos en float32, formato PyTorch) |
| Idiomas soportados | no aplica (modelo de interpretabilidad, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors no confirmado; repo de 0.0 GB) |

## Arquitectura y entrenamiento

El transcoder sigue la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `W_enc` es una matriz de codificación de 32×1024, `W_dec` es una matriz de decodificación de 1024×32 con filas de norma unitaria, y `b_dec` es el sesgo del decodificador. La activación TopK selecciona las k=32 características con mayor magnitud, lo que fuerza una representación escasa y facilita la interpretación. El modelo se entrenó con Adam (lr=0.0003) en lotes de 4096 vectores de activación, realizando una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación separado de 10.000 problemas. En total se procesaron 7.999.488 vectores de activación en 1.953 pasos. El sesgo del decodificador se inicializó con la media del objetivo y el codificador se reescaló una vez a partir del primer lote de entrenamiento, lo que permite que la única pasada se dedique a aprender características en lugar de corregir desajustes de escala.

## Capacidades

- Reconstrucción de la salida del MLP de la capa 1 del transformer base con un error de reconstrucción normalizado de 0.0307 (MSE / media(target²)), lo que indica una fidelidad alta.
- Extracción de características escasas y interpretables: cada característica activa representa un patrón de activación del MLP, útil para análisis de mecanismos internos.
- Soporte de carga reproducible mediante `load_transcoder` con verificación de hash (`require_pinned=True`), lo que garantiza que se use exactamente la versión registrada.
- No es un modelo generativo: no genera texto, código ni respuestas; su función es puramente analítica.

## Casos de uso

- Investigación en interpretabilidad de transformers: permite descomponer la actividad del MLP de la capa 1 en características escasas, facilitando el estudio de cómo el modelo representa operaciones aritméticas.
- Análisis de circuitos: al reconstruir la salida del MLP, se pueden identificar qué características contribuyen a la suma o resta de números, ayudando a mapear circuitos computacionales internos.
- Comparación de arquitecturas: el conjunto de 18 transcoders (incluyendo este) permite comparar la dificultad de reconstrucción entre MLPs ReLU y bilineales, arrojando luz sobre la complejidad de representación.
- Validación de técnicas de sparse autoencoding: sirve como caso de estudio para evaluar métodos de entrenamiento de transcoders con una sola pasada y calibración inicial.
- Educación en IA interpretable: como modelo pequeño y de código abierto, es adecuado para demostraciones didácticas de sparse autoencoders y transcoders en cursos o talleres.
- Reproducibilidad de experimentos: gracias al anclaje de revisión (`require_pinned=True`), los investigadores pueden replicar exactamente los resultados sin riesgo de cambios en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta métricas de reconstrucción:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado | 0.0307 |
| Fraccion de varianza no explicada | 0.0340 |
| MSE bruto | 1.58155 |

Estas métricas no son comparables con benchmarks de modelos de lenguaje (MMLU, HumanEval, etc.) porque el modelo no realiza tareas de lenguaje. La comparación relevante es entre transcoders de diferentes arquitecturas: según la model card, los MLPs bilineales son ~1.55× más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249 en error normalizado).

## Requisitos de hardware

- El modelo tiene solo 66.592 parámetros, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM (incluso en CPU).
- No se requieren GPUs especializadas; una GPU de consumo como una RTX 3060 o inferior es más que suficiente.
- El despliegue no aplica en el sentido tradicional: es un modelo de investigación que se carga en Python mediante PyTorch, no un servicio de inferencia.
- La latencia es despreciable (inferencia en microsegundos) dado el tamaño minúsculo.
- Se puede ejecutar en cualquier entorno con PyTorch instalado, sin necesidad de vLLM, llama.cpp u otros motores de inferencia.

## Comparativa con modelos similares

No hay modelos comparables en el sentido de transcoders para interpretabilidad de transformers aritméticos publicados en HuggingFace con la misma especificación. El proyecto TransCoder de Facebook (github.com/facebookresearch/TransCoder) es un sistema de traducción de código entre lenguajes de programación, completamente distinto en propósito y arquitectura. La comparación relevante sería con otros transcoders del mismo conjunto (por ejemplo, los entrenados sobre MLPs bilineales o sobre otras capas), pero no se dispone de sus métricas individuales en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de investigación, no un producto listo para producción; su único propósito es el análisis de interpretabilidad.
- La licencia no está especificada, por lo que el uso comercial es incierto; se recomienda contactar al autor antes de cualquier uso no académico.
- No tiene capacidades de generación de texto, código o razonamiento; no debe confundirse con un modelo de lenguaje.
- El error de reconstrucción no es cero (0.0307 normalizado), lo que implica que la salida reconstruida no es idéntica a la original; los análisis basados en características deben tener en cuenta esta pérdida.
- El modelo fue entrenado sobre un conjunto específico de problemas aritméticos (500.000 problemas del split de entrenamiento del modelo base); su aplicabilidad a otros dominios es nula.
- La dependencia de `require_pinned=True` limita la carga a una revisión concreta del repositorio, lo que puede dificultar la actualización o el uso con versiones futuras.

## Enlaces

- [HuggingFace: itzPotato/transcoder-relu-2layer-seed1-layer1](https://huggingface.co/itzPotato/transcoder-relu-2layer-seed1-layer1)
- [Modelo base: itzPotato/arithmetic-relu-2layer-seed1](https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed1)
- [GitHub: facebookresearch/TransCoder](https://github.com/facebookresearch/TransCoder) (proyecto homónimo, no relacionado con este modelo)
