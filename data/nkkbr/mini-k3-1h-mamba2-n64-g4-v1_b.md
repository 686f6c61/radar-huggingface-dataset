# nkkbr/Mini-K3-1H-mamba2-n64-g4-v1_B

## Resumen

Mini-K3-1H-mamba2-n64-g4 es un checkpoint de investigación de 1.004.532.064 parámetros totales (341.307.744 activos según la definición del proyecto) publicado por el usuario nkkbr en Hugging Face. Se trata de una ablación arquitectónica dentro del backbone Mini-K3: nueve de los mezcladores de secuencia KDA del diseño de referencia Mini-K3-1H se sustituyen por mezcladores Mamba-2/SSD, mientras que las cuatro capas Gated MLA con modo posicional NoPE, el enrutador Stable LatentMoE, los residuos de atención por bloques de 4, el tokenizador y la cabeza de lenguaje sin atar se mantienen idénticos a la línea base.

El modelo es exclusivamente de texto, con 13 capas y anchura oculta de 1.024, y está pensado como proxy de preentrenamiento a pequeña escala para medir el efecto de Mamba-2 frente a KDA en una arquitectura híbrida con mezcla de expertos (64 expertos enrutados, 2 compartidos, top-k 4). No incluye ningún tipo de post-entrenamiento: no hay ajuste por instrucciones, ni RLHF, ni DPO.

Su relevancia es metodológica: la mezcla de datos tokenizada, el orden, la semilla y la regla de inicialización están congelados para permitir comparaciones controladas, y el autor documenta controles de aislamiento de documentos en el empaquetado de secuencias. Aviso importante: la revisión publicada en este repositorio es `checkpoint-tokens-000000000000-init`, con 0 objetivos válidos consumidos y 0 pasos de optimizador, es decir, el estado inicial del entrenamiento; la revisión final declarada corresponde a 16.000 millones de objetivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 9 capas Mamba-2/SSD + 4 capas Gated MLA con NoPE, con Stable LatentMoE y residuos de atención por bloques de 4 |
| Parámetros totales | 1.004.532.064 (recuento real de safetensors) |
| Parámetros activos | 341.307.744 (definidos por el proyecto; 64 expertos enrutados + 2 compartidos, top-k 4) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento declarada; no se declara otra ventana para inferencia) |
| Tipos de cuantización | No disponible. Solo BF16 en safetensors, con parámetros de control de Mamba y del enrutador en FP32; sin GGUF ni cuantizaciones publicadas |
| Idiomas soportados | No disponible (tokenizador con vocabulario de 163.840 entradas; no se publica lista de idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) más código PyTorch propio (`config.json`, `configuration_mini_k3.py`, `modeling_mini_k3.py`, `mamba2_mixer.py`) y ficheros de tokenizador |
| Capas / anchura oculta | 13 capas de decodificador / 1.024 |
| Tamaño del repositorio | 2,0 GB |
| Tokens especiales | BOS 163584, EOS 163586, PAD 163839 |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido de 13 capas con anchura oculta de 1.024. Ocho posiciones lógicas de mezclador (índices 1, 2, 3, 5, 6, 7, 9, 10 y 11) usan Mamba-2 con cabecera SSD, con expansión 2, 32 cabezas de 64 canales, dimensión de estado 64, 4 grupos para B/C y convolución causal depthwise de kernel 4. Las capas 4, 8, 12 y 13 conservan atención Gated MLA en modo posicional NoPE con puerta de salida. El bloque de mezcla de expertos es Stable LatentMoE con 64 expertos enrutados y 2 compartidos, top-k 4; la cabeza de lenguaje no está atada (untied) con el embedding de entrada.

El preentrenamiento usa longitud de secuencia de 8.192 tokens y lote local/global de 5/80, con dtype principal BF16 (FP32 en controles de Mamba y del enrutador). El optimizador combina Muon para parámetros matriciales con AdamW como respaldo, y exime de weight decay a `A_log`, `D` y `dt_bias` de Mamba. Los documentos empaquetados se aíslan de forma estricta: MLA usa atención causal específica por documento y Mamba-2 recibe los mismos identificadores indexados de documento tanto en la convolución causal como en el escaneo SSD, con la suma acumulada FP32 de `dA` implementada como escaneo segmentado que arranca en cero exacto en cada frontera de documento. El autor declara puertas de aislamiento de fronteras múltiples (forward, gradiente de entrada y gradiente de parámetros) y una prueba de humo de un paso de optimizador a 8K/B5 antes de iniciar las ejecuciones formales. Se planificaron puntos de control intermedios a 0,5B, 1B, 2B, 4B, 8B y 12B objetivos y una revisión final tras exactamente 16.000 millones de objetivos. No se publica la composición del dataset, el número de idiomas ni el estado del optimizador, y no hay post-entrenamiento de ningún tipo.

## Capacidades

- Generación de texto autoregresiva (modelo base entrenado solo con objetivo de próximo token).
- Enrutamiento MoE con 64 expertos enrutados, 2 compartidos y top-k 4 sobre Stable LatentMoE.
- Procesamiento de secuencias de hasta 8.192 tokens durante el preentrenamiento.
- Ablación arquitectónica controlada: intercambio de mezcladores KDA por Mamba-2/SSD dentro del mismo backbone.
- Soporte de tool calling o function calling: no documentado; al no haber ajuste por instrucciones, no hay constancia de que funcione de forma fiable.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (tokenizador de 163.840 entradas sin lista de idiomas).
- Visión, audio u otras modalidades: no soportadas (checkpoint solo de texto).
- Modo de razonamiento explícito (thinking mode): no disponible.
- Uso como base para fine-tuning o para experimentos de investigación sobre arquitecturas híbridas SSM/atención.

## Casos de uso

- Ablación de mezcladores de secuencia: comparar Mamba-2/SSD frente a KDA manteniendo fijos datos, orden, semilla e inicialización; es el propósito declarado del checkpoint y permite atribuir diferencias de pérdida a la arquitectura y no al azar.
- Investigación sobre enrutamiento MoE a escala de 1B: estudiar el comportamiento de 64 expertos enrutados con 2 compartidos y top-k 4, incluida la carga por experto y la estabilidad del enrutador.
- Desarrollo y validación de kernels: el repositorio incluye una ruta Mamba portable y diferenciable que sirve como referencia frente al kernel SSD fusionado usado en entrenamiento, útil para verificar implementaciones.
- Validación de aislamiento de documentos en empaquetado de secuencias: los controles de frontera documentados permiten reproducir pruebas de que un documento previo no contamina las salidas de los siguientes.
- Experimentos de contexto largo en hardware de consumo: con 8.192 tokens de longitud de entrenamiento y ~2 GB de pesos en BF16, se puede iterar sobre secuencias largas en una sola GPU de gama media.
- Formación y docencia sobre arquitecturas híbridas: al incluir el código de modelado completo, sirve para estudiar cómo se combinan capas SSM, atención MLA con NoPE y MoE en un mismo bloque.
- Base para fine-tuning supervisado a pequeña escala: punto de partida de bajo coste para probar recetas de ajuste antes de escalar a modelos mayores, siempre que se verifique qué revisión de pesos se está usando.
- Reproducción de recetas de optimización: permite estudiar el uso combinado de Muon y AdamW con exclusiones de weight decay en parámetros concretos de Mamba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen registros de NLL/perplejidad y diagnósticos a nivel de fuente en los logs de ejecución, pero no se incluyen cifras en la información del repositorio, y la búsqueda web realizada no devolvió resultados relevantes (únicamente páginas no relacionadas de YouTube).

## Requisitos de hardware

- Pesos en BF16: aproximadamente 2,01 GB (1.004.532.064 parámetros × 2 bytes); el repositorio ocupa 2,0 GB.
- Pesos en FP32 (si se convierten): aproximadamente 4,02 GB.
- VRAM estimada para inferencia en BF16: del orden de 2,5 a 3,5 GB con contexto de 8.192 tokens, sumando pesos, caché de atención MLA y activaciones (estimación aritmética a partir del recuento de parámetros; no hay mediciones publicadas).
- VRAM estimada en FP32: del orden de 4,5 a 5,5 GB en las mismas condiciones (estimación).
- Cabe en GPU de consumo: sí. Una GPU de 8 GB (RTX 3070, RTX 4060) es suficiente en BF16 con secuencias cortas; 12 GB (RTX 3060 12 GB) o 16 GB (RTX 4060 Ti 16 GB, RTX 4080) dan margen para 8K tokens; RTX 4090, A100 y H100 no son necesarias por VRAM, solo por velocidad.
- Inferencia en CPU: viable con PyTorch, sin datos de latencia publicados.
- Opciones de despliegue: al ser una arquitectura personalizada, requiere cargar los ficheros de modelado incluidos (habitualmente con `trust_remote_code=True`). No hay soporte oficial conocido en vLLM, TGI, llama.cpp ni Ollama, y no se publica ningún GGUF. Conviene validar la integración en el framework elegido antes de plantear un despliegue en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-K3-1H-mamba2-n64-g4 (este) | Híbrida Mamba-2/SSD + Gated MLA NoPE, MoE 64+2 top-k 4 | 1.004.532.064 totales / 341.307.744 activos | 8.192 tokens | No disponible | Repositorio público, revisión inicial |
| Mini-K3-1H (referencia del mismo proyecto) | KDA como mezclador + Gated MLA NoPE + Stable LatentMoE, mismo diseño base salvo los mezcladores | No disponible | 8.192 tokens (misma configuración de secuencia descrita) | No disponible | Referencia citada en la model card; no se aportan datos de rendimiento |
| Otras familias híbridas Mamba-2/atención de tamaño comparable | Híbrida SSM/atención | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos verificables de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de parámetros, contexto o rendimiento frente a otros modelos de la misma categoría. La referencia NVIDIA Nemotron se menciona en la model card únicamente para aclarar que este trabajo no reproduce su esquema de bloques.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican condiciones de uso, por lo que existe incertidumbre legal para cualquier uso comercial hasta que el autor la aclare.
- Revisión publicada sin entrenamiento: la model card documenta la revisión inmutable `checkpoint-tokens-000000000000-init` con 0 objetivos válidos consumidos y 0 pasos de optimizador, de modo que las ponderaciones de este repositorio corresponden al estado inicial. Conviene confirmar con el autor si el repositorio contiene esa revisión o la final antes de utilizarlo.
- Sin métricas de calidad: no hay benchmarks, curvas de pérdida ni evaluaciones publicadas en la información disponible.
- Sin post-entrenamiento: no sigue instrucciones, no mantiene formato conversacional fiable y no debe usarse como asistente sin un ajuste previo.
- Idiomas no documentados: se desconoce la cobertura lingüística real; el tamaño del vocabulario no implica soporte multilingüe equilibrado.
- Sesgos: no se publica la composición del dataset ni evaluaciones de sesgo, por lo que no es posible caracterizarlos.
- Alucinación: en un modelo base de 1B sin evaluar no hay medición de factualidad; se espera una tasa alta de contenido inventado en tareas de conocimiento.
- Límite de contexto de 8.192 tokens; no se declara extensión por interpolación ni ventana mayor.
- Dependencia de código propio: la carga exige los ficheros `modeling_mini_k3.py` y `mamba2_mixer.py`, lo que añade riesgo de mantenimiento y de incompatibilidad con versiones futuras de las librerías.
- Diferencia entre rutas de ejecución: la ruta Mamba-2 portable es una referencia diferenciable y puede no coincidir numéricamente con el kernel SSD fusionado empleado en entrenamiento.
- Escala no extrapolable: el propio autor advierte de que los resultados a este tamaño, mezcla de datos y longitud de 8K necesitan confirmación antes de extrapolarse a Kimi-K3 completo u otros sistemas Mamba.
- Sin validación externa: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de reproducción independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkkbr/Mini-K3-1H-mamba2-n64-g4-v1_B
- Carpeta `training/` del propio repositorio: contiene, según la model card, el registro de las puertas de aislamiento y los manifiestos exactos de fuente y receta.
- Ficheros de modelado incluidos en el repositorio: `config.json`, `configuration_mini_k3.py`, `modeling_mini_k3.py`, `mamba2_mixer.py` y ficheros de tokenizador.
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas no relacionadas de YouTube).
