# itzPotato/transcoder-bilinear-2layer-seed0-layer1

## Resumen

Este modelo es un transcoder TopK ajustado a la capa 1 del transformer aritmético bilineal de 2 capas `itzPotato/arithmetic-bilinear-2layer-seed0`. Un transcoder es una herramienta de interpretabilidad que aproxima una subcapa MLP concreta: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-escaso. No es un autoencoder del flujo residual, sino un modelo específicamente diseñado para analizar el comportamiento interno de otro modelo.

El modelo fue desarrollado por itzPotato (Rohan Sashank Babbellapati) como parte de un conjunto de 18 transcoders que exploran la dificultad de reconstrucción de MLPs ReLU frente a MLPs bilineales. Con solo 66.592 parámetros y una arquitectura de 1024 features con 32 features activas por entrada, este transcoder consigue un error de reconstrucción normalizado de 0,0398, lo que indica que los MLPs bilineales son aproximadamente 1,55 veces más difíciles de reconstruir que los ReLU.

La relevancia de este modelo radica en su contribución a la investigación en interpretabilidad mecanicista: proporciona una herramienta para descomponer el comportamiento de un transformer aritmético en features escasas y analizar cómo se representan las operaciones aritméticas internamente. Es un modelo de investigación, no un modelo generativo, y su uso principal es el análisis de la capa 1 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (codificador-decodificador escaso) |
| Parametros totales | 66.592 |
| Parametros activos | 32 (features activas por entrada, k=32) |
| Longitud de contexto | no disponible (procesa vectores de activacion, no texto) |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | no disponible (modelo de investigacion, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors no confirmado, repo de 0.0 GB) |

## Arquitectura y entrenamiento

El transcoder implementa la formula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `W_enc` es una matriz de codificacion de 32x1024, `W_dec` es una matriz de decodificacion de 1024x32 con filas de norma unitaria, y `TopK_k` selecciona las k=32 activaciones mas grandes. El modelo tiene un total de 66.592 parametros, con una expansion de features de 32x respecto a d_model=32.

El entrenamiento se realizo con Adam a learning rate 0,0003, con lotes de 4096 vectores de activacion (no problemas completos). Se hizo una unica pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validacion separado de 10.000 problemas. Los splits de validacion y test del modelo base nunca se tocaron. En total se procesaron 7.999.488 vectores de activacion en 1.953 pasos.

La inicializacion es particular: el bias del decodificador se fija a la media del target y el codificador se reescala una unica vez desde el primer lote de entrenamiento, de modo que la unica pasada permitida se dedica a aprender features en lugar de corregir desajustes de escala iniciales. Se midieron los siguientes valores: calibration_scale 1,95, init_normalized_after 1,31, init_normalized_before 0,905.

## Capacidades

- Reconstruccion de la salida del MLP bilineal de la capa 1 del modelo base `arithmetic-bilinear-2layer-seed0` con un error normalizado de 0,0398.
- Descomposicion de la activacion de entrada del MLP en 32 features escasas activas de un total de 1024 features aprendidas.
- Analisis de representaciones internas de operaciones aritmeticas en un transformer de 2 capas con MLP bilineal.
- Comparacion de la dificultad de reconstruccion entre arquitecturas ReLU y bilineales (el modelo base usa MLP bilineal).
- Verificacion de procedencia mediante hash sha256 del checkpoint base (`cbcf860d5501ad1558bc03f3979ac773146903397011adc503cfd9882030f9c9`).
- Carga reproducible con fijacion de revision mediante `require_pinned=True`, que rechaza cualquier commit que no sea el registrado en `TRANSCODER_MODEL_REVISIONS`.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: el transcoder permite descomponer el comportamiento del MLP de la capa 1 en features escasas, facilitando el analisis de como el modelo representa operaciones aritmeticas como suma, resta o multiplicacion.
- Validacion de tecnicas de transcoding: al ser parte de un conjunto de 18 transcoders (3 profundidades x 2 tipos de MLP x 3 semillas), sirve como punto de comparacion para evaluar la consistencia de los metodos de transcoding entre arquitecturas.
- Estudio de la diferencia ReLU vs bilineal: los resultados de este transcoder contribuyen a cuantificar que los MLPs bilineales son ~1,55x mas dificiles de reconstruir que los ReLU, un dato relevante para disenar futuros metodos de interpretabilidad.
- Analisis de features aritmeticas: las features aprendidas por el transcoder pueden usarse para identificar que patrones de activacion corresponden a operaciones aritmeticas concretas en el modelo base.
- Desarrollo de metodos de edicion de modelos: al proporcionar una representacion escasa y reconstruible de la salida del MLP, el transcoder podria servir como base para experimentos de edicion de features (feature steering) en el modelo base.
- Reproducibilidad en investigacion: el sistema de fijacion de revisiones (`require_pinned=True`) garantiza que los experimentos que usan este transcoder carguen exactamente la misma version, lo que es critico para la reproducibilidad cientifica.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado | 0,0398 |
| Fraccion de varianza no explicada | 0,0521 |
| MSE crudo | 4,87769 |

El error de reconstruccion normalizado se define como `MSE / mean(target^2)`, donde predecir un cero constante puntua 1,0. Esta metrica es la recomendada para comparar entre arquitecturas, ya que las salidas de MLPs ReLU y bilineales tienen escalas muy diferentes. Segun el autor, en el conjunto completo de 18 transcoders, los MLPs bilineales son consistentemente ~1,55x mas dificiles de reconstruir que los ReLU (0,0387 vs 0,0249) en las tres celdas de profundidad/capa con tres semillas cada una.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (el modelo tiene solo 66.592 parametros, aproximadamente 266 KB en fp32).
- GPU recomendadas: cualquier GPU moderna es suficiente; incluso CPU es viable para inferencia.
- Cabe en cualquier GPU de consumo: si, incluyendo GPUs integradas o incluso ejecucion en CPU pura.
- Opciones de despliegue: el modelo se carga mediante la funcion `load_transcoder` del paquete `src.transcoder.source`, que requiere el codigo fuente del repositorio asociado. No es un modelo pensado para vLLM, Ollama o TGI.
- Latencia y throughput: no disponible, pero dado el tamano del modelo, la inferencia es practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la informacion proporcionada. El autor menciona que este transcoder forma parte de un conjunto de 18 transcoders que cubren diferentes profundidades, tipos de MLP y semillas, pero no se proporcionan identificadores de los otros modelos del conjunto. La comparativa mas relevante es interna al conjunto: los transcoders sobre MLPs bilineales son ~1,55x mas dificiles de reconstruir que los sobre MLPs ReLU.

## Limitaciones y advertencias

- Modelo de investigacion, no generativo: no produce texto ni realiza tareas de lenguaje; su unica funcion es reconstruir la salida del MLP de la capa 1 del modelo base.
- Dependencia del modelo base: el transcoder solo es util junto con `itzPotato/arithmetic-bilinear-2layer-seed0`; no es transferible a otros modelos sin reentrenamiento.
- Licencia no disponible: no se especifica la licencia de uso, lo que limita su uso comercial o su redistribucion sin consultar al autor.
- Alcance limitado: trabaja sobre vectores de activacion de dimension 32, un tamano muy inferior a los modelos de lenguaje modernos, por lo que sus conclusiones pueden no generalizar a modelos mas grandes.
- Sin garantias de produccion: al ser un artefacto de investigacion, no se ha disenado para entornos de produccion ni se ofrecen garantias de robustez o estabilidad.
- Riesgo de sobreinterpretacion: las features aprendidas por transcoders en modelos pequenos pueden no corresponder a conceptos semanticos claros; se recomienda cautela al interpretar los resultados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/itzPotato/transcoder-bilinear-2layer-seed0-layer1)
- [Modelo base: arithmetic-bilinear-2layer-seed0](https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed0)
- [Perfil del autor en HuggingFace](https://huggingface.co/itzPotato/models)
- [Modelo relacionado: bilinear-attn-addition-carry-2layer](https://huggingface.co/itzPotato/bilinear-attn-addition-carry-2layer)
