# itzPotato/transcoder-bilinear-1layer-seed1-layer0

## Resumen

El modelo `itzPotato/transcoder-bilinear-1layer-seed1-layer0` es un transcoder TopK entrenado sobre la capa 0 del transformer aritmético de una sola capa `itzPotato/arithmetic-bilinear-1layer-seed1`. Un transcoder es una herramienta de interpretabilidad que aproxima una subcapa MLP concreta: lee la activación de entrada de la MLP y predice su salida a través de un cuello de botella k-escaso. No es un autoencoder del residual stream, sino un modelo específicamente diseñado para analizar los cálculos internos de un transformer pequeño.

Desarrollado por itzPotato (Rohan Sashank Babbellapati), este transcoder forma parte de un conjunto de 18 transcoders (3 profundidades × 3 semillas × 2 arquitecturas de MLP) que investigan la dificultad de reconstrucción de MLPs bilineales frente a ReLU. Con solo 66.592 parámetros y una expansión de 32× sobre el d_model de 32, el modelo logra un error de reconstrucción normalizado de 0,0561, lo que indica una fidelidad razonable en la predicción de la salida de la MLP.

La relevancia de este modelo radica en su contribución a la interpretabilidad mecanicista: permite estudiar cómo un transformer pequeño realiza operaciones aritméticas, y sirve como referencia para comparar la reconstrucción de MLPs con diferentes no linealidades. Su publicación en septiembre de 2026 refleja el interés creciente por herramientas de análisis de circuitos en modelos pequeños y controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (bottleneck escaso) sobre MLP bilineal |
| Parametros totales | 66.592 |
| Parametros activos | 32 (k, features activas por entrada) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa vectores de activación) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, formato PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors no especificado, repo de 0.0 GB) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `x` es la activación de entrada de la MLP del modelo base, `W_enc` y `W_dec` son las matrices de codificación y decodificación, y `TopK_k` selecciona las k=32 features más activas. La expansión es de 32× (1024 features para d_model=32), y las filas del decodificador están normalizadas a norma unitaria. El modelo se entrena con Adam a tasa de aprendizaje 0,0003, en lotes de 4096 vectores de activación (no problemas), con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, más un subconjunto de validación de 10.000 problemas. Los splits de validación y prueba del modelo base nunca se tocan. En total se procesan 7.999.488 vectores de activación en 1.953 pasos.

La inicialización es cuidadosa: el sesgo del decodificador se fija a la media del objetivo, y el codificador se reescala una vez a partir del primer lote de entrenamiento, de modo que la única pasada permitida se dedica a aprender features en lugar de corregir desajustes de escala. Se midieron los valores de calibración: `calibration_scale` 1,12, `init_normalized_after` 1,61 y `init_normalized_before` 1,47. El modelo está fijado a un commit específico del modelo base (sha256 `5828f31c4e5986a47700c7d7f36871a7211f7f4e0aa102fa65ea189215498f4d`), y la carga con `require_pinned=True` garantiza que no se use una rama móvil.

## Capacidades

- Reconstrucción de la salida de la MLP bilineal de la capa 0 del transformer aritmético, con un error normalizado de 0,0561.
- Identificación de features escasas (k=32 activas de 1024) que explican la transformación de la MLP.
- Análisis de interpretabilidad mecanicista: permite inspeccionar qué features se activan ante diferentes entradas aritméticas.
- Comparación de dificultad de reconstrucción entre MLPs bilineales y ReLU (los bilineales son ~1,55× más difíciles de reconstruir).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo de análisis, no generativo.

## Casos de uso

- Estudio de circuitos en transformers aritméticos: el transcoder permite descomponer la MLP en features escasas, facilitando la identificación de subcircuitos que implementan operaciones como suma o multiplicación.
- Validación de técnicas de interpretabilidad: sirve como banco de pruebas para comparar métodos de transcoding frente a autoencoders escasos, ya que su arquitectura y entrenamiento están bien documentados.
- Análisis de la no linealidad bilineal: al comparar con transcoders de MLPs ReLU, se puede estudiar cómo la forma de la no linealidad afecta a la compresibilidad y a la estructura de features.
- Depuración de modelos pequeños: en entornos de investigación, ayuda a verificar si un transformer aritmético está aprendiendo representaciones interpretables o si hay artefactos de entrenamiento.
- Educación en interpretabilidad: por su tamaño reducido y su documentación detallada, es un recurso didáctico para enseñar conceptos de transcoding y sparse autoencoders.
- Reproducibilidad de experimentos: al estar fijado a un commit concreto y ofrecer una función de carga con verificación de hash, permite reproducir exactamente los resultados de reconstrucción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / mean(target^2)) | 0,0561 |
| Fraccion de varianza no explicada | 0,0640 |
| MSE crudo | 2,8893 |

El error normalizado es la métrica recomendada para comparar entre arquitecturas, ya que las escalas de salida de MLPs ReLU y bilineales difieren. Un predictor constante cero obtendría una puntuación de 1,0, por lo que 0,0561 indica una reconstrucción bastante fiel. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Inferencia en CPU sin GPU: el modelo tiene solo 66.592 parámetros, por lo que cabe en cualquier máquina moderna.
- VRAM estimada: menos de 1 MB en precisión float32; no requiere GPU.
- GPU recomendada: ninguna; es un modelo de análisis que se ejecuta en fracciones de segundo.
- Opciones de despliegue: carga directa con PyTorch mediante la función `load_transcoder` del repositorio asociado; no requiere servidores de inferencia.
- Latencia y throughput: no disponibles, pero al ser un modelo diminuto, la inferencia es prácticamente instantánea.

## Comparativa con modelos similares

No se dispone de información sobre otros transcoders comparables en la misma familia (mismo tamaño y tarea) en los datos proporcionados. El propio autor menciona que hay 18 transcoders en el conjunto (3 profundidades × 3 semillas × 2 arquitecturas de MLP), pero no se listan nombres ni métricas individuales. La única comparación cuantitativa disponible es la afirmación de que los MLPs bilineales son consistentemente ~1,55× más difíciles de reconstruir que los ReLU (0,0387 vs 0,0249 en error normalizado), pero sin especificar qué modelos concretos se comparan. Por tanto, la comparativa detallada no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo; no puede procesar texto ni realizar tareas de NLP.
- Su utilidad se limita al análisis del modelo base específico `arithmetic-bilinear-1layer-seed1`; no es transferible a otros transformers sin reentrenamiento.
- El error de reconstrucción, aunque bajo, no es perfecto: la fracción de varianza no explicada es 0,064, lo que implica que algunas features de la MLP no se capturan completamente.
- La licencia no está especificada, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones no declaradas.
- El modelo depende de la versión exacta del modelo base (hash fijado); cualquier cambio en el modelo base invalidaría la correspondencia.
- No se proporcionan datos sobre sesgos o alucinaciones, al no ser un modelo generativo; el riesgo principal es la mala interpretación de las features aprendidas si no se valida con análisis adicionales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/itzPotato/transcoder-bilinear-1layer-seed1-layer0)
- [Modelo base: itzPotato/arithmetic-bilinear-1layer-seed1](https://huggingface.co/itzPotato/arithmetic-bilinear-1layer-seed1)
- [Perfil del autor en HuggingFace](https://huggingface.co/itzPotato/models)
