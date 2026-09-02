# itzPotato/transcoder-bilinear-1layer-seed0-layer0

## Resumen

El modelo `transcoder-bilinear-1layer-seed0-layer0` es un transcoder TopK diseñado para la interpretabilidad de redes neuronales. Concretamente, aproxima la subcapa MLP de la capa 0 de un transformer aritmético de una sola capa con MLP bilineal, el modelo base `itzPotato/arithmetic-bilinear-1layer-seed0`. Un transcoder lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k‑disperso, a diferencia de un autoencoder del flujo residual. Este modelo es relevante para la investigación en interpretabilidad, ya que permite descomponer el comportamiento de un MLP en features dispersas y estudiar cómo se representan operaciones aritméticas en modelos pequeños.

Desarrollado por itzPotato (Rohan Sashank Babbellapati), el transcoder tiene una arquitectura compacta: `d_model=32`, 1024 features (expansión 32×), 32 features activas por entrada (k=32) y un total de 66 592 parámetros. Se entrenó con una sola pasada sobre 500 000 problemas del split de entrenamiento del modelo base, sin tocar los splits de validación ni prueba. El modelo se publica con el objetivo de facilitar el análisis de circuitos y la comparación entre arquitecturas de MLP (ReLU vs. bilineal) en términos de reconstructibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (sparse autoencoder-like) |
| Parametros totales | 66 592 |
| Parametros activos | No aplica (no es MoE; k=32 features activas) |
| Longitud de contexto | No aplica (modelo de análisis de activaciones, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch (formato no especificado) |

## Arquitectura y entrenamiento

El transcoder sigue la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `W_enc` y `W_dec` son las matrices del codificador y decodificador, y `b_enc` y `b_dec` sus sesgos. Las filas del decodificador tienen norma unitaria. El modelo se entrenó con Adam (lr 0.0003) en lotes de 4096 vectores de activación (no problemas), realizando una única pasada sobre 7 999 488 vectores de activación en 1 953 pasos. Se utilizó un subconjunto de validación de 10 000 problemas, separado del split de entrenamiento del modelo base.

La inicialización es particular: el sesgo del decodificador se fija a la media del objetivo y el codificador se reescala una vez a partir del primer lote de entrenamiento, de modo que la única pasada se dedica a aprender features en lugar de corregir desajustes de escala. Los valores medidos de calibración son `calibration_scale=1.8`, `init_normalized_after=1.54` e `init_normalized_before=1.06`. El modelo se ajustó a los pesos base con hash sha256 `7bdb7ae797e01a9b445819b2c31494bc926e634c0577d95e2e92089b10fc49f5`, correspondiente al checkpoint publicado en `itzPotato/arithmetic-bilinear-1layer-seed0`.

## Capacidades

- Reconstrucción de la salida del MLP de la capa 0 del modelo base a partir de su entrada, con un error normalizado de 0.0629.
- Descomposición de la activación en 32 features dispersas (k=32) que permiten inspeccionar qué información retiene el MLP.
- Análisis de la estructura interna de un transformer aritmético de una capa, facilitando la identificación de features relacionadas con operaciones aritméticas.
- Comparación cuantitativa de la reconstructibilidad entre arquitecturas de MLP (ReLU vs. bilineal) mediante el error normalizado.
- Soporte de carga programática con verificación de integridad (pinned commit) para reproducibilidad.
- No es un modelo generativo: no produce texto, código ni respuestas; su función es puramente analítica.

## Casos de uso

- Investigación en interpretabilidad de transformers aritméticos: el transcoder permite descomponer la salida del MLP en features dispersas, lo que ayuda a entender cómo el modelo representa sumas, restas u otras operaciones.
- Análisis de circuitos: al predecir la salida del MLP con un cuello de botella disperso, se pueden localizar features que intervienen en el cálculo aritmético y estudiar su interacción.
- Comparación de arquitecturas de MLP: el error normalizado de reconstrucción (0.0629) sirve como métrica para evaluar la dificultad de interpretar MLPs bilineales frente a ReLU (0.0387 vs. 0.0249 en el conjunto de 18 transcoders).
- Desarrollo de métodos de transcoding: sirve como caso de estudio para validar técnicas de sparse autoencoders en dominios específicos (aritmética) y para refinar inicializaciones y entrenamientos de una sola pasada.
- Validación de herramientas de interpretabilidad: al ser un modelo pequeño y controlado, es útil para probar visualizaciones, métricas de reconstrucción o algoritmos de agrupación de features antes de aplicarlos a modelos grandes.
- Reproducibilidad en investigación: la carga con `require_pinned=True` garantiza que los experimentos usen exactamente la misma versión del transcoder, lo que facilita la comparación entre estudios.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de reconstrucción sobre el split de validación:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / media(target^2)) | 0.0629 |
| Fraccion de varianza no explicada (FVU) | 0.0757 |
| MSE crudo | 13.3852 |

El error normalizado es la métrica recomendada para comparar entre arquitecturas, ya que las escalas de salida de MLPs ReLU y bilineales difieren. Predecir una constante cero daría un error de 1.0. En el conjunto de 18 transcoders (3 profundidades × 3 semillas × 2 tipos de MLP), los MLPs bilineales son consistentemente ~1.55× más difíciles de reconstruir que los ReLU (0.0387 vs. 0.0249). No se han publicado otros benchmarks (p. ej., MMLU, HumanEval) porque el modelo no es un LLM.

## Requisitos de hardware

- El modelo tiene solo 66 592 parámetros, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problemas de memoria.
- No requiere GPUs especiales; una GPU de consumo como una GTX 1060 o superior es suficiente.
- La inferencia es prácticamente instantánea: una pasada forward sobre un lote de vectores de activación tarda microsegundos.
- Se puede desplegar con PyTorch estándar; no necesita vLLM, llama.cpp ni otros motores de inferencia optimizados.
- El almacenamiento es mínimo (el repo ocupa 0.0 GB según HuggingFace, probablemente menos de 1 MB).

## Comparativa con modelos similares

No hay transcoders públicos comparables para el mismo modelo base. La model card menciona que se entrenaron 18 transcoders en total (3 profundidades × 3 semillas × 2 tipos de MLP), pero no se proporcionan enlaces a los demás. Como referencia, se puede comparar con el transcoder ReLU equivalente (si existiera) en términos de error normalizado:

| Modelo | Error normalizado | Notas |
|---|---|---|
| Transcoder bilineal (este) | 0.0629 | MLP bilineal, capa 0 |
| Transcoder ReLU (promedio del conjunto) | 0.0249 | MLP ReLU, todas las capas y semillas |

La comparativa con otros sparse autoencoders (p. ej., los usados en modelos de lenguaje) no es directa porque este transcoder opera sobre un modelo aritmético de juguete y no sobre un LLM. No se dispone de más datos.

## Limitaciones y advertencias

- Específico del modelo base: solo funciona con la capa 0 de `itzPotato/arithmetic-bilinear-1layer-seed0`; no es generalizable a otros modelos sin reentrenamiento.
- No es un modelo de lenguaje: no puede generar texto, código ni realizar tareas de NLP; su uso se limita a análisis de interpretabilidad.
- Licencia no especificada: no se indica bajo qué términos se distribuye, por lo que el uso comercial o la redistribución requieren contactar al autor.
- Entrenamiento de una sola pasada: aunque la inicialización está calibrada, el modelo podría no haber convergido completamente; el error de reconstrucción (0.0629) indica que no es perfecto.
- Sesgo potencial: al entrenarse solo con el split de entrenamiento del modelo base, podría no capturar comportamientos presentes en los splits de validación o prueba.
- Dependencia de la versión: la carga con `require_pinned=True` es obligatoria para reproducibilidad, pero si el commit no está disponible, el modelo no se puede cargar.
- Sin soporte de cuantización: no se ofrecen versiones cuantizadas (GGUF, etc.), aunque por su tamaño no son necesarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-bilinear-1layer-seed0-layer0
- Modelo base (arithmetic-bilinear-1layer-seed0): https://huggingface.co/itzPotato/arithmetic-bilinear-1layer-seed0
- Perfil del autor en HuggingFace: https://huggingface.co/itzPotato
- Otros modelos del autor (p. ej., bilinear-attn-modular-addition-p113): https://huggingface.co/itzPotato/models
