# itzPotato/transcoder-bilinear-1layer-seed2-layer0

## Resumen

El modelo `itzPotato/transcoder-bilinear-1layer-seed2-layer0` es un transcoder TopK entrenado para aproximar la salida de la capa 0 de un transformer aritmético de una sola capa con MLP bilineal, el modelo base `itzPotato/arithmetic-bilinear-1layer-seed2`. Un transcoder, a diferencia de un autoencoder, lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-escaso, lo que permite analizar qué características internas utiliza el modelo para realizar operaciones aritméticas. Este artefacto forma parte de una línea de investigación en interpretabilidad mecanicista, orientada a descomponer el comportamiento de modelos pequeños y controlados.

El modelo tiene 66.592 parámetros, con una dimensión de modelo de 32, 1.024 características (expansión 32x) y 32 características activas por entrada. Se entrenó con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, utilizando 7.999.488 vectores de activación. Su relevancia radica en que permite estudiar cómo los MLP bilineales, menos comunes que los ReLU, representan y procesan información aritmética, y en que ofrece una métrica de reconstrucción normalizada que facilita la comparación entre arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (bottleneck escaso) sobre MLP bilineal |
| Parametros totales | 66.592 |
| Parametros activos | 32 (k, características activas por entrada) |
| Longitud de contexto | no disponible (modelo de activaciones, no generativo) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (modelo de investigación, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors probablemente, no confirmado) |

## Arquitectura y entrenamiento

El transcoder sigue la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `W_enc` y `W_dec` son matrices de 32×1024 y 1024×32 respectivamente, con filas del decodificador normalizadas a norma unitaria. El cuello de botella selecciona las 32 características con mayor activación (TopK), lo que fuerza una representación escasa y facilita la interpretación. El modelo se entrenó con Adam a tasa de aprendizaje 0.0003, en lotes de 4096 vectores de activación (no problemas completos), con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base. Se usó un subconjunto de validación de 10.000 problemas, y los splits de validación y prueba del modelo base nunca se tocaron. La inicialización incluye un ajuste del sesgo del decodificador a la media del objetivo y un reescalado del encoder a partir del primer lote, lo que permite que la única pasada se dedique a aprender características en lugar de corregir desajustes de escala.

## Capacidades

- Reconstrucción de la salida del MLP bilineal de la capa 0 con un error normalizado de 0.0469 (MSE / media(target^2)), lo que implica que explica el 94.3% de la varianza (fracción de varianza no explicada: 0.0575).
- Identificación de características escasas y potencialmente interpretables en la representación interna del modelo base.
- Soporte para análisis de mecanismos aritméticos (suma, resta, etc.) mediante la inspección de las características activas.
- Compatible con la librería de carga específica del autor (`src.transcoder.source.load_transcoder`), que verifica la integridad del checkpoint mediante hash SHA-256.
- No es un modelo generativo: no produce texto ni código, sino representaciones internas de un transformer aritmético.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite descomponer las operaciones internas de un transformer aritmético con MLP bilineal, identificando qué características se activan ante diferentes operaciones y cómo se combinan para producir el resultado.
- Estudio comparativo de arquitecturas: al ser parte de un conjunto de 18 transcoders (3 profundidades × 3 semillas × 2 tipos de MLP), facilita comparar la dificultad de reconstrucción entre MLP ReLU y bilineales (los bilineales son ~1.55x más difíciles de reconstruir).
- Validación de técnicas de sparse autoencoding: sirve como banco de pruebas para métodos de entrenamiento de transcoders, dado su tamaño reducido y la disponibilidad de métricas normalizadas.
- Análisis de la influencia de la inicialización: los datos de calibración (escala 2.18, normalización antes/después) permiten estudiar cómo afecta el reescalado inicial al aprendizaje de características.
- Reproducibilidad en experimentos de IA explicable: al estar fijado a un checkpoint con hash conocido, se puede utilizar como referencia estable en pipelines de investigación.
- Docencia y divulgación: por su pequeño tamaño y claridad arquitectónica, es adecuado para demostrar conceptos de transcoders y sparse autoencoders en cursos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un LLM generativo. Las métricas de rendimiento relevantes son las de reconstrucción, reportadas en la model card:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / media(target^2)) | 0.0469 |
| Fraccion de varianza no explicada | 0.0575 |
| MSE bruto | 15.0159 |

El error normalizado de 0.0469 indica que el transcoder explica aproximadamente el 95.3% de la varianza de la salida del MLP. Comparado con otros transcoders del mismo conjunto, los MLP bilineales son consistentemente ~1.55x más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249 en error normalizado medio).

## Requisitos de hardware

- El modelo es extremadamente ligero: 66.592 parámetros, lo que ocupa menos de 1 MB en FP32.
- Inferencia posible en CPU sin problemas; no requiere GPU.
- Si se usa GPU, cualquier modelo con al menos 1 GB de VRAM es suficiente (incluso integradas).
- El despliegue no requiere frameworks especiales; basta con PyTorch y la librería de carga del autor.
- No hay datos de latencia o throughput, pero al ser un modelo de una sola capa con 1024 características, la inferencia es del orden de microsegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre otros transcoders comparables fuera del conjunto del autor. Dentro de la misma familia, se puede comparar con los transcoders ReLU del mismo tamaño (por ejemplo, `transcoder-relu-1layer-seed2-layer0`), que presentan un error normalizado medio de 0.0249 frente al 0.0387 de los bilineales, lo que indica que los MLP bilineales son más difíciles de reconstruir. No hay datos públicos de otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción: no genera texto ni realiza tareas útiles fuera del ámbito de interpretabilidad.
- No se ha publicado información sobre sesgos o alucinaciones, pero al ser un modelo no generativo, estos conceptos no aplican directamente.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificaciones.
- El modelo está fijado a un checkpoint concreto del modelo base; cualquier cambio en el modelo base invalidaría la correspondencia.
- La carga requiere la librería específica del autor (`src.transcoder.source`), que no está disponible en el repositorio de HuggingFace (solo se menciona en la model card).
- El tamaño del repo es 0.0 GB, lo que sugiere que los pesos podrían no estar incluidos o ser extremadamente pequeños; verificar antes de usar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/itzPotato/transcoder-bilinear-1layer-seed2-layer0)
- [Modelo base aritmético bilineal](https://huggingface.co/itzPotato/arithmetic-bilinear-1layer-seed2)
- [Perfil del autor en HuggingFace](https://huggingface.co/itzPotato/models)
