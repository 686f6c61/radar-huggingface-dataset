# itzPotato/transcoder-bilinear-2layer-seed2-layer1

## Resumen

`itzPotato/transcoder-bilinear-2layer-seed2-layer1` es un transcoder TopK entrenado para reconstruir la salida de la capa 1 de un transformer aritmético de 2 capas con MLP bilineal, el modelo base `itzPotato/arithmetic-bilinear-2layer-seed2`. Desarrollado por itzPotato (Rohan Sashank Babbellapati) como parte de una línea de investigación en interpretabilidad de modelos, este transcoder no es un modelo generativo, sino una herramienta de análisis que aproxima el comportamiento de una subcapa MLP mediante un cuello de botella disperso. Su relevancia radica en permitir estudiar cómo se representan internamente las operaciones aritméticas y comparar la dificultad de reconstrucción entre arquitecturas de MLP (bilineal frente a ReLU). Con solo 66.592 parámetros y una expansión de features de 32x, es un componente ligero diseñado para investigación, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TopK transcoder (encoder-decoder con bottleneck disperso) |
| Parametros totales | 66.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa vectores de activacion, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de interpretabilidad, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (formato no especificado) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `x` es la activación de entrada a la capa MLP del modelo base y `y_hat` es la predicción de su salida. Con `d_model=32`, `features=1024` (expansión 32x) y `k=32` features activas por entrada, el modelo fuerza una representación dispersa. Las filas del decoder están normalizadas a norma unitaria. El entrenamiento se realizó con Adam (lr 0.0003), batches de 4096 vectores de activación (no problemas completos), y una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación de 10.000 problemas. Se usaron 7.999.488 vectores de activación en 1.953 pasos. La inicialización es particular: el bias del decoder se fija a la media del target y el encoder se reescala una vez desde el primer batch, de modo que la única pasada se dedica a aprender features y no a corregir desajustes de escala. El modelo base tiene un hash sha256 verificado para garantizar la reproducibilidad.

## Capacidades

- Reconstrucción de la salida de la capa 1 del MLP bilineal del modelo base `arithmetic-bilinear-2layer-seed2` con un error normalizado de 0.0456.
- Identificación de features dispersas (k=32 activas de 1024) que explican la transformación interna de la capa.
- Comparación de la dificultad de reconstrucción entre arquitecturas de MLP: los MLP bilineales son ~1.55x más difíciles de reconstruir que los ReLU (error normalizado 0.0387 vs 0.0249 en el conjunto de 18 transcoders).
- Soporte de carga reproducible mediante `load_transcoder` con verificación de commit (`require_pinned=True`).
- No tiene capacidades de generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un instrumento de análisis de activaciones.

## Casos de uso

- Análisis de mecanismos internos en transformers aritméticos: el transcoder permite descomponer la transformación de la capa 1 en features interpretables, facilitando el estudio de cómo se representan operaciones como suma o multiplicación.
- Comparación de arquitecturas de MLP: al reconstruir capas bilineales y ReLU, se puede cuantificar la complejidad de cada tipo de MLP y su impacto en la interpretabilidad.
- Validación de hipótesis sobre dispersión de features: con k=32 activas, se puede comprobar si la representación interna es realmente dispersa y qué features son esenciales.
- Depuración de modelos de investigación: si se sospecha que una capa específica introduce errores, el transcoder puede aislar su comportamiento y medir su contribución al error total.
- Entrenamiento de transcoders en entornos educativos: su tamaño reducido y su enfoque didáctico lo hacen adecuado para enseñar conceptos de interpretabilidad y sparse autoencoders.
- Reproducibilidad en experimentos de interpretabilidad: al fijar el commit del modelo base y del transcoder, se garantiza que los resultados sean comparables entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. En su lugar, la model card reporta métricas de reconstrucción sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / mean(target^2)) | 0.0456 |
| Fraccion de varianza inexplicada | 0.0593 |
| MSE crudo | 12.7492 |

Además, se indica que en el conjunto de 18 transcoders (3 profundidades × 3 semillas × 2 tipos de MLP), los MLP bilineales son consistentemente ~1.55x más difíciles de reconstruir que los ReLU (0.0387 vs 0.0249 en error normalizado). No se proporcionan comparaciones con otros transcoders individuales.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el modelo tiene solo 66.592 parámetros, por lo que cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: no se requiere una GPU específica; cualquier GPU con al menos 1 GB de VRAM es suficiente. Para experimentos con el modelo base (que no se describe aquí), se necesitaría más capacidad, pero el transcoder en sí es trivial.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer (GTX 1060 en adelante) puede ejecutarlo sin problemas.
- Opciones de despliegue: al ser un modelo PyTorch, se puede cargar directamente con la función `load_transcoder` del repositorio asociado. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un LLM.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño, la inferencia es del orden de microsegundos en GPU y milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros transcoders específicos con los que comparar directamente. El propio autor menciona que forma parte de un conjunto de 18 transcoders (3 profundidades × 3 semillas × 2 tipos de MLP), pero no se publican los nombres ni los resultados individuales de cada uno. Como referencia, se puede comparar con transcoders ReLU de la misma serie, que presentan un error normalizado medio de 0.0249 frente al 0.0387 de los bilineales, pero no hay datos desglosados por capa o semilla. Por tanto, la comparativa detallada no está disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para uso en producción ni para tareas de generación de texto.
- Solo reconstruye la capa 1 del modelo base específico `arithmetic-bilinear-2layer-seed2`; no es generalizable a otros modelos o capas sin reentrenamiento.
- No se especifica licencia, lo que puede limitar su uso comercial o su redistribución; se recomienda contactar con el autor para aclarar los términos.
- El error de reconstrucción no es cero (0.0456 normalizado), por lo que las features extraídas son aproximaciones y pueden omitir información relevante.
- Al estar entrenado con una sola pasada sobre los datos, podría no haber convergido completamente; aunque la inicialización cuidadosa mitiga este riesgo, no se garantiza una reconstrucción óptima.
- No se proporcionan datos sobre sesgos o alucinaciones, ya que no es un modelo generativo; sin embargo, como herramienta de análisis, sus resultados dependen de la calidad del modelo base y de la interpretación del investigador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-bilinear-2layer-seed2-layer1
- Modelo base: https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed2
- Perfil del autor: https://huggingface.co/itzPotato/models
