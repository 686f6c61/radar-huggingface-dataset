# itzPotato/transcoder-bilinear-2layer-seed1-layer0

## Resumen

El modelo `itzPotato/transcoder-bilinear-2layer-seed1-layer0` es un transcoder TopK diseñado para la interpretabilidad de modelos de aprendizaje automático. Concretamente, aproxima la subcapa MLP de la capa 0 de un transformer aritmético de 2 capas con MLP bilineal, el modelo base `itzPotato/arithmetic-bilinear-2layer-seed1`. Un transcoder lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-sparse, a diferencia de un autoencoder que reconstruye el flujo residual completo. Este enfoque permite analizar qué features internas utiliza el modelo para realizar operaciones aritméticas.

Desarrollado por itzPotato (Rohan Sashank Babbellapati), este transcoder tiene una arquitectura compacta: d_model de 32, 1024 features (expansión 32x), 32 features activas por entrada y un total de 66.592 parámetros. Se entrenó con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, sin tocar los splits de validación ni prueba. El modelo es relevante para la comunidad de investigación en interpretabilidad, ya que permite estudiar cómo los transformers aritméticos representan y procesan operaciones matemáticas, y compara la dificultad de reconstrucción entre MLP ReLU y bilineales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (sparse bottleneck) sobre MLP bilineal |
| Parametros totales | 66.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de investigación, no generativo) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería pytorch, probablemente safetensors o .pt, no especificado) |

## Arquitectura y entrenamiento

El transcoder sigue la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `x` es la activación de entrada del MLP de la capa 0 del modelo base, `W_enc` y `b_enc` son el codificador lineal, `TopK_k` selecciona las k=32 features con mayor activación, y `W_dec` y `b_dec` son el decodificador lineal. Las filas del decodificador tienen norma unitaria. El modelo tiene d_model=32, 1024 features (expansión 32x) y 66.592 parámetros.

El entrenamiento se realizó con Adam a una tasa de aprendizaje de 0.0003, lotes de 4096 vectores de activación (no problemas completos), y una única pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación de 10.000 problemas. Los splits de validación y prueba del modelo base nunca se utilizaron. En total se procesaron 7.999.488 vectores de activación en 1.953 pasos. La inicialización es particular: el sesgo del decodificador se fija a la media del objetivo y el codificador se reescala una vez a partir del primer lote de entrenamiento, con valores medidos de calibration_scale 0.185, init_normalized_after 1.45 e init_normalized_before 19.4. Esto permite que la única pasada se dedique a aprender features en lugar de corregir desajustes de escala.

## Capacidades

- Aproximación de la salida del MLP de la capa 0 del modelo base `arithmetic-bilinear-2layer-seed1` con un error de reconstrucción normalizado de 0.0228.
- Identificación de features activas (k=32) mediante un cuello de botella TopK, lo que permite analizar qué combinaciones de features explican la salida del MLP.
- Soporte para análisis de interpretabilidad: al ser un transcoder, permite estudiar la representación interna del modelo base en tareas aritméticas.
- No es un modelo generativo: no genera texto, código ni realiza razonamiento de propósito general.
- No tiene capacidades multimodales ni de tool calling.

## Casos de uso

- Investigación en interpretabilidad de transformers aritméticos: el transcoder permite descomponer la salida del MLP en features escasas, facilitando el estudio de cómo el modelo base representa operaciones como suma o multiplicación.
- Análisis comparativo de arquitecturas de MLP: al comparar transcoders entrenados sobre MLP ReLU y bilineales, se puede medir cuantitativamente la dificultad de reconstrucción (los bilineales son ~1.55x más difíciles de reconstruir), lo que ayuda a entender las diferencias en la representación interna.
- Validación de técnicas de transcoding: este modelo sirve como caso de estudio para evaluar metodologías de entrenamiento de transcoders, como la inicialización con reescalado del codificador o el uso de una sola pasada.
- Desarrollo de herramientas de visualización de features: los vectores de features aprendidos pueden proyectarse y visualizarse para inspeccionar patrones en la activación del MLP.
- Reproducibilidad en interpretabilidad: al estar fijado a un checkpoint específico del modelo base (sha256 `660d6372...`), permite reproducir experimentos de forma fiable.
- Educación en mecánica interpretable: sirve como ejemplo didáctico de cómo funcionan los transcoders y los autoencoders escasos en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas de lenguaje o razonamiento general, por lo que no aplican métricas como MMLU, HumanEval o GSM8K. En su lugar, la model card reporta métricas de reconstrucción sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / media(target^2)) | 0.0228 |
| Fraccion de varianza no explicada | 0.0233 |
| MSE crudo | 0.00669702 |

Estas métricas indican que el transcoder reconstruye la salida del MLP con alta fidelidad, aunque el autor señala que los MLP bilineales son consistentemente más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249 en promedio).

## Requisitos de hardware

No disponible. Dado el tamaño del modelo (66.592 parámetros), la inferencia es trivial en cualquier CPU o GPU moderna, pero no se especifican requisitos concretos en la información proporcionada. El entrenamiento se realizó sobre vectores de activación, no sobre problemas completos, por lo que el coste computacional es bajo.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros transcoders o modelos de interpretabilidad en la información disponible. El autor menciona que hay 18 transcoders en el conjunto (variando capas, semillas y tipo de MLP), pero no se dan detalles de otros modelos comparables.

## Limitaciones y advertencias

- Es un modelo de investigación, no un producto listo para producción. No genera texto ni realiza tareas de propósito general.
- Depende completamente del modelo base `arithmetic-bilinear-2layer-seed1`; no es transferible a otros modelos sin reentrenamiento.
- La licencia no está especificada, por lo que el uso comercial y la redistribución son inciertos.
- El tamaño del repositorio es 0.0 GB, lo que sugiere que los pesos podrían no estar alojados directamente en el repo, sino que se cargan mediante la función `load_transcoder` desde un registro de versiones. Esto puede complicar el uso offline.
- El modelo está entrenado con una sola pasada sobre un subconjunto de datos, lo que podría limitar la generalización de las features aprendidas a otros problemas aritméticos.
- No se reportan sesgos conocidos, pero al ser un modelo pequeño y específico, su comportamiento fuera del dominio aritmético no es relevante.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/itzPotato/transcoder-bilinear-2layer-seed1-layer0)
- [Modelo base: itzPotato/arithmetic-bilinear-2layer-seed1](https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed1)
- [Perfil del autor en Hugging Face](https://huggingface.co/itzPotato)
