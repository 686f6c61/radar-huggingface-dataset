# itzPotato/transcoder-relu-2layer-seed2-layer1

## Resumen

El modelo `itzPotato/transcoder-relu-2layer-seed2-layer1` es un transcoder TopK entrenado sobre la capa 1 de un transformer aritmético de 2 capas con MLP ReLU, publicado por el usuario itzPotato. Un transcoder es una herramienta de interpretabilidad que aproxima una subcapa MLP concreta: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-escaso. No es un autoencoder del flujo residual, sino un modelo supervisado para reconstruir la salida de una subcapa específica.

El modelo tiene 66.592 parámetros, con un `d_model` de 32, 1024 features (expansión 32x) y 32 features activas por entrada. Se entrenó con una sola pasada sobre 500.000 problemas del split de entrenamiento del modelo base, usando 7.999.488 vectores de activación en 1.953 pasos. Su propósito es facilitar el análisis de los mecanismos internos del transformer base, permitiendo localizar features y circuitos que explican el comportamiento aritmético del modelo.

La relevancia de este transcoder radica en que forma parte de un conjunto de 18 transcoders (3 semillas × 2 capas × 3 tipos de MLP) que permiten comparar la dificultad de reconstrucción entre arquitecturas ReLU y bilineales. Según el autor, los MLP bilineales son consistentemente ~1,55 veces más difíciles de reconstruir que los ReLU (error normalizado 0,0387 vs 0,0249). Este modelo concreto logra un error de reconstrucción normalizado de 0,0213, lo que indica una reconstrucción de alta fidelidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (sparse autoencoder supervisado) |
| Parametros totales | 66.592 |
| Parametros activos | 32 (k-escaso, features activas por entrada) |
| Longitud de contexto | no disponible (procesa vectores de activación, no texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (modelo de interpretabilidad, no generativo) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt` o `.bin`, no se especifica safetensors) |

## Arquitectura y entrenamiento

El transcoder implementa la fórmula `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `W_enc` es una matriz de 32×1024, `W_dec` es de 1024×32 con filas de norma unitaria, y `b_enc` y `b_dec` son sesgos. La activación TopK selecciona las 32 features con mayor magnitud, lo que produce una representación escasa y descomponible.

El entrenamiento se realizó con Adam a tasa de aprendizaje 0,0003, en lotes de 4096 vectores de activación (no problemas completos). Se usó una única pasada sobre 500.000 problemas del split de entrenamiento del modelo base, con un subconjunto de validación separado de 10.000 problemas. Los splits de validación y test del modelo base nunca se tocaron, lo que garantiza que las métricas de reconstrucción no estén contaminadas.

La inicialización es particular: el sesgo del decodificador se fija a la media del target, y el codificador se reescala una vez a partir del primer lote de entrenamiento. Esto permite que la única pasada disponible se dedique a aprender features en lugar de corregir desajustes de escala iniciales. Las mediciones de calibración muestran un `calibration_scale` de 0,65, y el error normalizado tras la inicialización pasa de 2,12 a 1,29.

## Capacidades

- Reconstrucción de la salida del MLP de la capa 1 del transformer base con alta fidelidad (error normalizado 0,0213).
- Descomposición de la activación del MLP en 32 features activas por entrada, seleccionadas mediante TopK.
- Análisis de features individuales: cada feature del transcoder puede interpretarse como un componente computacional del MLP original.
- Soporte para localización de circuitos: al reconstruir la salida del MLP, permite rastrear qué features contribuyen a comportamientos aritméticos específicos.
- Compatibilidad con el ecosistema de interpretabilidad de PyTorch: se carga mediante `load_transcoder` con verificación de integridad criptográfica (sha256).
- No es un modelo generativo: no produce texto, código ni respuestas; su función es exclusivamente analítica.

## Casos de uso

- **Análisis de mecanismos internos en transformers aritméticos**: el transcoder permite descomponer la salida del MLP de la capa 1 en features escasas, facilitando la identificación de qué features codifican operaciones como suma, resta o comparación. Se usaría cargando el modelo y extrayendo las activaciones de features para un conjunto de problemas aritméticos.

- **Localización de circuitos (circuit tracing)**: al reconstruir la salida del MLP, se puede intervenir en features individuales (por ejemplo, anular o amplificar una feature) para observar cómo cambia la salida del transformer base. Esto ayuda a mapear los circuitos que implementan la aritmética.

- **Comparación de arquitecturas de MLP**: este transcoder forma parte de un conjunto que incluye variantes ReLU y bilineales. Permite cuantificar la dificultad de reconstrucción entre arquitecturas, lo que informa sobre la complejidad computacional de cada tipo de MLP.

- **Validación de métodos de interpretabilidad**: sirve como banco de pruebas para algoritmos de sparse autoencoding y transcoding, ya que el modelo base es pequeño y controlado, con una tarea aritmética bien definida.

- **Estudio de la formación de features durante el entrenamiento**: al estar entrenado sobre un modelo con pesos fijos, se puede analizar cómo las features del transcoder se correlacionan con las entradas (por ejemplo, dígitos específicos o posiciones) y cómo se distribuyen en el espacio de activaciones.

- **Depuración de modelos pequeños en entornos educativos**: en cursos de interpretabilidad, este transcoder permite a estudiantes experimentar con la descomposición de un MLP real sin necesidad de recursos computacionales elevados, ya que el modelo es diminuto y se ejecuta en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no es un LLM generativo. En su lugar, el autor reporta métricas de reconstrucción sobre el split de validación del modelo base:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / mean(target^2)) | 0,0213 |
| Fraccion de varianza no explicada (FVU) | 0,0327 |
| MSE bruto | 2,19938 |

El error normalizado es la métrica recomendada para comparar entre arquitecturas, ya que las escalas de salida de MLP ReLU y bilineal difieren. Un predictor constante de cero obtendría una puntuación de 1,0, por lo que 0,0213 indica una reconstrucción muy precisa. El autor también reporta que, en el conjunto completo de 18 transcoders, los MLP bilineales son ~1,55 veces más difíciles de reconstruir que los ReLU (0,0387 vs 0,0249 de error normalizado medio).

## Requisitos de hardware

- **VRAM estimada**: menos de 1 MB. El modelo tiene 66.592 parámetros en precisión float32 (~266 KB). Cabe en cualquier GPU, incluso en las más antiguas, y también en CPU sin problemas.
- **GPU recomendada**: ninguna en particular; cualquier CPU moderna es suficiente para inferencia. Si se desea procesar muchos vectores de activación, una GPU básica (por ejemplo, GTX 1650) acelera el cálculo, pero no es necesaria.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (RTX 2060, RTX 4090, etc.) ejecuta el modelo sin esfuerzo.
- **Opciones de despliegue**: al ser un modelo PyTorch, se puede cargar directamente con `load_transcoder` en un script Python. No requiere servidores de inferencia como vLLM u Ollama, ya que no es un LLM.
- **Latencia y throughput**: no se han publicado mediciones formales, pero dado el tamaño del modelo, la inferencia sobre un lote de 4096 vectores de activación (d_model=32) se completa en milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros transcoders publicados en Hugging Face para el mismo modelo base. Sin embargo, se puede contextualizar frente a sparse autoencoders (SAEs) genéricos:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| itzPotato/transcoder-relu-2layer-seed2-layer1 | Transcoder TopK | 66.592 | no aplica | no disponible | Hugging Face |
| SAEs clasicos (p.ej. OpenAI, Anthropic) | Sparse autoencoder | variable (tipicamente millones) | no aplica | variable | Repos publicos |
| Transcoder de Facebook (TransCoder) | Traduccion de codigo | ~200M | 1024 tokens | MIT | GitHub |

La comparativa con TransCoder de Facebook no es pertinente porque ese modelo traduce código entre lenguajes, mientras que este transcoder es una herramienta de interpretabilidad. La comparación más relevante sería con otros transcoders del mismo autor (los otros 17 del conjunto), pero no están publicados individualmente en Hugging Face. En cualquier caso, la métrica clave (error normalizado 0,0213) es excelente para un MLP ReLU, como indica el propio autor.

## Limitaciones y advertencias

- **No es un modelo generativo**: no puede generar texto, código ni respuestas. Intentar usarlo como un LLM producirá errores.
- **Alcance limitado**: está entrenado específicamente sobre la capa 1 de un transformer aritmético de 2 capas con MLP ReLU. No es transferible a otros modelos sin reentrenamiento.
- **Dependencia del modelo base**: su utilidad depende de la integridad del checkpoint base (`itzPotato/arithmetic-relu-2layer-seed2`). Si ese modelo cambia, el transcoder podría no ser válido. El autor incluye verificación de sha256 para mitigar esto.
- **Sesgos y alucinaciones**: al ser un modelo de interpretabilidad, no presenta alucinaciones en el sentido generativo, pero las features aprendidas pueden no tener una interpretación semántica clara. La interpretación de features requiere análisis adicional.
- **Licencia no especificada**: no se indica licencia en la model card. Esto puede limitar su uso comercial o de redistribución. Se recomienda contactar al autor antes de usarlo en producción.
- **Tamaño del repositorio**: el repo muestra 0.0 GB, lo que sugiere que los pesos podrían no estar incluidos o que el tamaño es extremadamente pequeño (probablemente <1 MB). Verificar que el archivo de pesos esté presente antes de intentar cargarlo.
- **Formato de carga específico**: el código de carga (`load_transcoder`) depende de un módulo `src.transcoder.source` que no está incluido en el repo. El usuario debe obtener ese código del repositorio fuente del autor, lo que añade fricción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/itzPotato/transcoder-relu-2layer-seed2-layer1)
- [Modelo base: itzPotato/arithmetic-relu-2layer-seed2](https://huggingface.co/itzPotato/arithmetic-relu-2layer-seed2)
- [Perfil del autor en Hugging Face](https://huggingface.co/itzPotato) (no se ha verificado su existencia, pero se infiere del ID)
