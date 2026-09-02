# itzPotato/transcoder-relu-1layer-seed0-layer0

## Resumen

`transcoder-relu-1layer-seed0-layer0` es un transcoder TopK desarrollado por itzPotato para la interpretabilidad de modelos de aprendizaje automático. Concretamente, se ajusta a la capa 0 (la única capa MLP) de un transformer aritmético de una sola capa con MLP ReLU, publicado como `itzPotato/arithmetic-relu-1layer-seed0`. Un transcoder no es un autoencoder del flujo residual, sino que aproxima una subcapa MLP completa: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k‑disperso. Esto permite descomponer el comportamiento del MLP en features interpretables.

El modelo tiene una arquitectura muy pequeña: d_model de 32, 1024 features (expansión 32×), 32 features activas por entrada y 66.592 parámetros. Se entrenó con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, usando 7.999.488 vectores de activación en 1.953 pasos. Su relevancia radica en que sirve como herramienta de análisis para entender qué features internas utiliza un transformer al resolver tareas aritméticas, y permite comparar la dificultad de reconstrucción entre arquitecturas (ReLU vs. bilineal).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (sparse autoencoder de subcapa MLP) |
| Parámetros totales | 66.592 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de interpretabilidad, no generativo) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El transcoder sigue la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `x` es la activación de entrada al MLP y `y_hat` la predicción de su salida. El cuello de botella k‑disperso (k=32) fuerza a que solo 32 de las 1024 features estén activas por entrada, lo que facilita la interpretación. Las filas del decodificador están normalizadas a norma unitaria.

El entrenamiento usó Adam con tasa de aprendizaje 0,0003 y lotes de 4096 vectores de activación (no problemas completos). Se realizó una única pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación de 10.000 problemas. Los splits de validación y prueba del modelo base nunca se usaron. La inicialización es cuidadosa: el sesgo del decodificador se fija a la media del objetivo y el codificador se reescala una vez a partir del primer lote, de modo que la única pasada se dedica a aprender features en lugar de corregir desajustes de escala. Se midió una escala de calibración de 0,91 y una normalización inicial de 1,65 (antes 1,79).

## Capacidades

- Reconstrucción de la salida del MLP de la capa 0 del modelo base con un error normalizado de 0,0342 (MSE / media(target²)), lo que indica una alta fidelidad de reconstrucción.
- Identificación de features dispersas (32 activas de 1024) que representan patrones internos del MLP, útiles para análisis de circuitos.
- Comparación de dificultad de reconstrucción entre arquitecturas: el autor reporta que los MLP bilineales son ~1,55× más difíciles de reconstruir que los ReLU (error normalizado 0,0387 vs. 0,0249 en el conjunto completo de 18 transcoders).
- No es un modelo generativo: no produce texto, código ni respuestas. Su función es exclusivamente analítica.
- No soporta tool calling, agentes ni razonamiento multi‑paso.
- No tiene capacidades multilingües ni de visión.

## Casos de uso

- Análisis de mecanismos internos en transformers aritméticos: el transcoder permite descomponer la salida del MLP en features interpretables, lo que ayuda a entender cómo el modelo realiza sumas o multiplicaciones.
- Comparación de arquitecturas de MLP: al ajustar transcoders a modelos ReLU y bilineales, se puede cuantificar la dificultad de reconstrucción y estudiar diferencias en la representación interna.
- Validación de hipótesis de interpretabilidad: los features extraídos pueden contrastarse con predicciones teóricas sobre qué información codifica el modelo (por ejemplo, acarreos en sumas).
- Depuración de modelos pequeños: en entornos de investigación, sirve para localizar comportamientos anómalos o sesgos en el MLP de un transformer entrenado para tareas específicas.
- Estudio de la dispersión y la selección de features: el parámetro k permite experimentar con distintos niveles de escasez y observar cómo afecta a la reconstrucción y a la interpretabilidad.
- Reproducibilidad en investigación: al estar fijado el commit del modelo base (sha256), se puede reproducir exactamente el análisis en cualquier entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. Las métricas de reconstrucción reportadas son:

| Métrica | Valor |
|---|---|
| Error de reconstrucción normalizado | 0,0342 |
| Fracción de varianza no explicada | 0,0408 |
| MSE crudo | 6,18279 |

El error normalizado se define como `MSE / media(target²)`, donde predecir un cero constante puntuaría 1,0. Esta métrica es la recomendada para comparar entre arquitecturas con escalas de salida diferentes.

## Requisitos de hardware

- El modelo tiene solo 66.592 parámetros, por lo que cabe en cualquier CPU moderna sin necesidad de GPU.
- La inferencia (reconstrucción de activaciones) es inmediata incluso en un portátil convencional; no se requieren GPUs dedicadas.
- Para el entrenamiento de transcoders similares, una GPU con al menos 8 GB de VRAM es suficiente, aunque el autor no especifica requisitos mínimos.
- Opciones de despliegue: al ser un modelo PyTorch, se puede cargar directamente con la función `load_transcoder` del repositorio asociado. No requiere frameworks de inferencia como vLLM u Ollama.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño, la latencia es del orden de microsegundos por vector de activación.

## Comparativa con modelos similares

No se dispone de información sobre otros transcoders comparables en el mismo repositorio o en la literatura que permita una comparación directa. El autor menciona que hay 18 transcoders en el conjunto (3 profundidades × 3 semillas × 2 arquitecturas), pero no se proporcionan especificaciones individuales. Se puede indicar que el modelo pertenece a una familia de transcoders para interpretabilidad, pero no hay datos suficientes para una tabla comparativa.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para uso en producción ni para tareas generativas.
- Está ajustado exclusivamente a la capa 0 del modelo base `arithmetic-relu-1layer-seed0`; no es transferible a otros modelos o capas sin reentrenamiento.
- La reconstrucción no es perfecta: el error normalizado de 0,0342 implica que hay una pequeña fracción de varianza no explicada (0,0408), lo que puede omitir detalles finos del comportamiento del MLP.
- No se especifica licencia, por lo que su uso comercial o redistribución puede estar sujeto a restricciones no declaradas.
- El modelo depende de la versión exacta del checkpoint base (fijado por sha256); cargar una versión distinta podría dar resultados inconsistentes.
- No se han evaluado sesgos o riesgos de alucinación, ya que no genera contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-relu-1layer-seed0-layer0
- Modelo base: https://huggingface.co/itzPotato/arithmetic-relu-1layer-seed0
- Repositorio de código (referenciado en la model card, no se proporciona URL directa): se menciona `src/transcoder/source.py` y `src/transcoder/config.py`, pero no se incluye enlace externo.
