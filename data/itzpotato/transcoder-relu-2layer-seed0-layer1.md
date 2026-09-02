# itzPotato/transcoder-relu-2layer-seed0-layer1

## Resumen

`itzPotato/transcoder-relu-2layer-seed0-layer1` es un transcoder TopK entrenado sobre la capa 1 de un transformer aritmético de 2 capas con MLP ReLU, publicado por el usuario itzPotato. Un transcoder es una herramienta de interpretabilidad que aproxima una subcapa MLP concreta: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-esparso. No es un autoencoder del flujo residual, sino un modelo específicamente diseñado para descomponer el cómputo interno de un transformer en características interpretables.

El modelo base, `itzPotato/arithmetic-relu-2layer-seed0`, es un transformer pequeño (d_model=32) entrenado para resolver problemas aritméticos, y este transcoder se ajusta a su primera capa MLP. Con solo 66.592 parámetros y una expansión de 32x (1024 características para 32 dimensiones), el transcoder logra un error de reconstrucción normalizado de 0,0317, lo que indica que captura la mayor parte de la varianza de la salida del MLP. Su relevancia radica en que permite analizar cómo el modelo base representa operaciones aritméticas a nivel de características, un paso clave para la investigación en interpretabilidad mecanicista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (sparse autoencoder) con encoder y decoder lineales, activación TopK |
| Parametros totales | 66.592 |
| Parametros activos | 32 (k-esparso, solo 32 características activas por entrada) |
| Longitud de contexto | no aplica (procesa vectores de activación, no texto) |
| Tipos de cuantizacion | no disponible (pesos en float32, formato PyTorch estándar) |
| Idiomas soportados | no aplica (modelo de interpretabilidad, no generativo) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors no confirmado, repo de 0.0 GB) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, con d_model de entrada y salida de 32, 1024 características ocultas (expansión 32x) y k=32 características activas por entrada. Las filas del decoder están normalizadas a norma unitaria. El encoder y decoder son lineales, sin no linealidades intermedias, y la esparsidad se impone mediante la selección TopK.

El entrenamiento se realizó con Adam a learning rate 0,0003, en lotes de 4096 vectores de activación (no problemas completos), con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base. Se usó un subconjunto de validación de 10.000 problemas, y los splits de validación y test del modelo base nunca se tocaron. En total se procesaron 7.999.488 vectores de activación en 1.953 pasos. La inicialización es cuidadosa: el bias del decoder se fija a la media del target, y el encoder se reescala una vez con el primer lote de entrenamiento, de modo que la única pasada permitida se dedica a aprender características en lugar de corregir desajustes de escala. Las métricas de calibración reportadas son: calibration_scale 0,531, init_normalized_after 1,54, init_normalized_before 3,31.

## Capacidades

- Reconstrucción de la salida del MLP de la capa 1 del transformer base con un error normalizado de 0,0317 (MSE / media(target^2)), lo que implica que explica el 95,95% de la varianza (fracción de varianza no explicada: 0,0405).
- Descomposición de la activación del MLP en 32 características esparsas interpretables, seleccionadas de un diccionario de 1024 características.
- Análisis de mecanismos internos del modelo base: al ser un transcoder, permite estudiar qué características se activan ante diferentes entradas aritméticas y cómo se combinan para producir la salida.
- Reproducibilidad y trazabilidad: el modelo incluye un mecanismo de fijación de revisión (`require_pinned=True`) que impide cargar pesos de una rama móvil, garantizando que los experimentos usen exactamente el checkpoint registrado.
- Compatibilidad con la librería PyTorch y carga mediante la función `load_transcoder` del paquete `src.transcoder.source`.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el transcoder permite descomponer el cómputo de un transformer aritmético en características discretas, facilitando el estudio de cómo se representan operaciones como suma, resta o multiplicación a nivel de circuitos internos.
- Validación de hipótesis sobre representaciones internas: los investigadores pueden examinar qué características se activan ante entradas específicas y contrastar si corresponden a conceptos aritméticos esperados (p. ej., paridad, magnitud, acarreo).
- Comparación de arquitecturas de MLP: el autor reporta que los MLP bilineales son ~1,55x más difíciles de reconstruir que los ReLU (error normalizado 0,0387 vs 0,0249), lo que sugiere que este transcoder puede usarse como métrica de complejidad de representación entre arquitecturas.
- Desarrollo de métodos de sparse autoencoding: al ser un modelo pequeño y con entrenamiento controlado (una sola pasada, splits separados), sirve como banco de pruebas para nuevas técnicas de inicialización, regularización o selección de características.
- Auditoría de modelos pequeños: en entornos donde se entrena un transformer para tareas específicas (aritmética, lógica), este tipo de transcoder ayuda a verificar que el modelo no está usando atajos espurios o características confusas.
- Reproducción de experimentos de interpretabilidad: gracias a la fijación de revisión y a la documentación detallada de entrenamiento, otros grupos pueden replicar exactamente el análisis y extenderlo a otras capas o semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque este modelo no es un LLM generativo. Las métricas de rendimiento relevantes son las de reconstrucción, reportadas en la model card:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / mean(target^2)) | 0,0317 |
| Fraccion de varianza no explicada | 0,0405 |
| MSE crudo | 1,17672 |

El autor indica que predecir un cero constante puntúa 1,0 en el error normalizado, por lo que 0,0317 representa una reconstrucción muy fiel. No hay comparación con otros transcoders en la información disponible, salvo la observación agregada de que los MLP bilineales son consistentemente más difíciles de reconstruir (0,0387 vs 0,0249 en el conjunto de 18 transcoders).

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. El modelo tiene 66.592 parámetros, lo que en float32 ocupa aproximadamente 266 KB. Cabe en cualquier GPU, incluso en CPU sin problema.
- GPU recomendadas: no se requiere ninguna GPU específica; cualquier hardware con PyTorch instalado es suficiente. Una GPU de gama baja (p. ej., GTX 1650) o incluso CPU es adecuada.
- Si cabe en consumer GPU: sí, en todas, sin excepción.
- Opciones de despliegue: carga directa con PyTorch mediante la función `load_transcoder` del paquete `src.transcoder.source`. No requiere servidores de inferencia como vLLM u Ollama.
- Latencia y throughput: no disponibles, pero al ser un modelo de 66K parámetros, la inferencia es del orden de microsegundos por vector de activación en GPU.

## Comparativa con modelos similares

No se dispone de información sobre otros transcoders o sparse autoencoders comparables en la misma configuración (capa 1, seed 0, MLP ReLU). El autor menciona que forma parte de un conjunto de 18 transcoders (3 profundidades × 2 tipos de MLP × 3 semillas), pero no se proporcionan los identificadores de los demás modelos. Por tanto, la comparativa directa no está disponible. Como referencia conceptual, se puede comparar con sparse autoencoders tradicionales (SAE) aplicados al residual stream, pero este transcoder opera sobre la subcapa MLP, lo que lo hace estructuralmente diferente.

## Limitaciones y advertencias

- Modelo de investigación, no un producto: no está diseñado para uso en producción ni para tareas generativas. Su única función es el análisis de interpretabilidad.
- Alcance limitado: está ajustado exclusivamente a la capa 1 del modelo base `arithmetic-relu-2layer-seed0`. No es transferible a otras capas, arquitecturas o dominios sin reentrenamiento.
- Dependencia del modelo base: cualquier cambio en los pesos del transformer base invalida el transcoder. El autor fija el hash sha256 del checkpoint base para garantizar la correspondencia.
- Licencia no especificada: no se indica ninguna licencia en la model card, lo que puede limitar su uso comercial o su redistribución. Se recomienda contactar al autor antes de utilizarlo en proyectos con fines lucrativos.
- Riesgo de sobreajuste a la distribución de entrenamiento: el transcoder se entrenó solo con el split de train del modelo base, y aunque se usó un subconjunto de validación, no hay garantía de que reconstruya bien activaciones fuera de esa distribución (p. ej., problemas aritméticos con rangos numéricos no vistos).
- Interpretabilidad no garantizada: aunque el transcoder produce características esparsas, no todas serán necesariamente interpretables por un humano. La interpretabilidad es una propiedad emergente que debe validarse caso a caso.
- Sin soporte de contexto o idiomas: al ser un modelo de vectores de activación, no procesa texto ni tiene noción de contexto lingüístico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-relu-2layer-seed0-layer1
- Modelo base: https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed0
- Repositorio de código (referenciado en la carga, no verificado): `src/transcoder/source.py` y `src/transcoder/config.py` (no se proporciona URL pública)
