# Mihai-LeanZero/MiMo-V2.6-Flash-MOPD-MLX-LeanZero

## Resumen

MiMo-V2.6-Flash-MOPD-MLX-LeanZero es una compilación en formato MLX del modelo multimodal MiMo-V2.6-Flash-MOPD de Xiaomi, adaptada para ejecutarse en Apple Silicon. La desarrolla LeanZero, que parte de los pesos oficiales de Xiaomi (revisión `5220c3f5`) y los convierte al diseño de su motor MLX propietario, utilizado en su aplicación de escritorio Elzi. El modelo resuelve el problema de ejecutar un modelo de gran escala (309.507 millones de parámetros totales, 178,4 GB de repositorio) en hardware de consumo de Apple, mediante una división tensorial distribuida entre dos equipos.

Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con capacidades de imagen-a-texto, decodificación especulativa mediante cabezas MTP y un codificador de visión incluido. No incorpora codificador de audio. La compilación mantiene los expertos enrutados en MXFP4 tal como los publica Xiaomi, y dequantiza a BF16 las proyecciones de atención q, k, v y la primera capa densa (originalmente en FP8). El resto de pesos se conserva byte a byte.

Es relevante porque demuestra la viabilidad de servir un modelo MoE de más de 300.000 millones de parámetros en dos Mac Studio con M5 Max y 128 GB de memoria unificada, con un contexto de 393.216 tokens y modo de razonamiento activado, obteniendo 0,7077 en el benchmark agentico Gauntlet sb-7.2. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con encoder de visión; tipo de modelo `mimo_v2` en MLX |
| Parametros totales | 309.507.375.296 (309,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 393.216 tokens (configuración usada en la prueba publicada); máxima no especificada |
| Tipos de cuantizacion | MXFP4 (expertos enrutados, grupo 32), BF16 (atención, embeddings, cabeza de salida, capa densa, encoder de visión), FP8 de origen dequantizado a BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con archivos adicionales `model_mtp.safetensors` y `dflash/` |
| Tamano en disco | 166,16 GiB (repositorio de 178,4 GB) |
| Libreria | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de Xiaomi. La compilación MLX preserva la estructura de expertos enrutados en MXFP4 (149,81 GiB, grupo de cuantización 32) y mantiene en BF16 el encoder de visión (1,36 GiB, 364 tensores idénticos a los originales), el embedding de tokens y la cabeza de salida (1,16 GiB cada uno), el router y las normas. Las proyecciones de atención q, k y v, que Xiaomi distribuye en FP8 con escalas por bloque, se dequantizan a BF16 con un error relativo máximo de 0,00171 frente a una dequantización en float32; la proyección o ya venía en BF16.

No se ha realizado fine-tuning, mezcla de modelos ni calibración: el conversor solo reescribe el layout y verifica 479 tensores contra los originales con 0 fallos. Se incluyen los archivos de drafter de Xiaomi (`model_mtp.safetensors`, 1,11 GiB, y `dflash/`, 2,73 GiB) para motores que los aprovechen, aunque en esta compilación están desactivados por defecto: las cabezas MTP provocaron un fallo del motor al verificar tokens especulativos con visión activada, y las pruebas a nivel de operación con MLX 0.32.2 indicaron que la verificación DFlash exacta no sería más rápida que la decodificación simple en contextos largos. No se incluye codificador de audio ni embeddings de voz. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) activable.
- Procesamiento de imagen a texto: el encoder de visión está incluido y se ejercitó con 19 peticiones con imágenes durante la prueba publicada.
- Codificación agéntica: ejecución de tareas multi-paso con hasta 150 llamadas al modelo en una sola sesión, según la prueba Gauntlet.
- Generación de código y construcción de artefactos (escenas 3D, backends, sistemas de notificación) verificados por checks automáticos.
- Contexto largo: 393.216 tokens empleados en la prueba, con capacidad de mantener estado a lo largo de una sesión de más de 3 horas.
- Decodificación especulativa: archivos MTP y DFlash incluidos, aunque desactivados por defecto en esta compilación.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.

## Casos de uso

- Agente de codificación autónomo en estación de trabajo Apple: el modelo puede ejecutar tareas de construcción de software de varios pasos (hasta 150 llamadas, 377.262 tokens generados en 3 h 21 min) sobre dos Mac Studio con M5 Max, sin depender de la nube, gracias al contexto de 393.216 tokens y al modo de pensamiento.
- Análisis de documentos e imágenes combinados: el encoder de visión permite procesar capturas, diagramas o interfaces junto con instrucciones textuales, útil para auditoría de UI o revisión de diseños.
- Desarrollo asistido con contexto de repositorio completo: la ventana de 393.216 tokens permite cargar grandes cantidades de código y documentación en una sola sesión para tareas de refactorización o revisión.
- Evaluación de modelos en hardware local: sirve como banco de pruebas para medir rendimiento agentico en Apple Silicon frente a alternativas cuantizadas, como demuestra la comparativa con `EigenLabs/MiMo-V2.6-Flash-MOPD-MLX-4bit-mtp`.
- Prototipado de aplicaciones multimodales de escritorio: integrable en la app Elzi (motor MLX con claves `language_model.*`), adecuado para asistentes locales que combinen texto e imagen.
- Investigación en decodificación especulativa: los archivos MTP y DFlash incluidos permiten experimentar con draft heads en motores MLX, aunque en esta compilación estén desactivados por defecto.
- Despliegue en clúster doméstico de dos nodos: la división tensorial (~106 GiB por Mac) con Thunderbolt 5 demuestra un patrón replicable para servir modelos de más de 300.000 millones de parámetros sin GPU dedicada.

## Benchmarks y rendimiento

| Run | Configuración | Gauntlet sb-7.2 |
|---|---|---|
| Esta compilación | Dos Mac Studio M5 Max 128 GB, split tensorial MLX, contexto 393.216 | 0,7077 |
| EigenLabs/MiMo-V2.6-Flash-MOPD-MLX-4bit-mtp | M3 Ultra 96 GB + M5 Max 128 GB, MLX, contexto 524.288 | 0,6644 |
| `xiaomi/mimo-v2.6-flash-20260921` vía OpenRouter | Nube, checkpoint de septiembre, evaluador sb-7.2 anterior | 0,7909 |

Detalles de la ejecución de esta compilación: 130 de 150 llamadas permitidas, parada autónoma a las 3 h 21 min, 377.262 tokens generados, 19 peticiones con imágenes. Antes de aplicar los topes, la puntuación era 0,9741; cuatro checks fallidos sobre la escena 3D (`t_coast_identity`, `t_coast_reality`, `q_overview_legibility`, `q_inspector_framing`) limitan la puntuación a 0,709, y dos fallos de recuperación de backend (`r_b6_outbox_atomic`, `r_notifier_exactly_once`) la habrían limitado a 0,869. Cada fila es una única ejecución y el autor advierte que la varianza entre ejecuciones es alta; la tabla no establece un ranking. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 166,16 GiB en disco; en ejecución, la división tensorial usada reparte aproximadamente 106 GiB por equipo.
- Configuración probada: dos Mac Studio con M5 Max y 128 GB de memoria unificada cada uno, unidos por un cable Thunderbolt 5, con `iogpu.wired_limit_mb` ajustado a 118000 en ambos.
- No cabe en un solo Mac de 128 GB; requiere al menos dos equipos de 128 GB o uno con memoria superior no especificada.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; la compilación es específica para Apple Silicon vía MLX.
- Despliegue: motor MLX de Elzi (tipo de modelo `mimo_v2`, claves `language_model.*`). `mlx-lm` 0.32.2 estándar no reconoce `mimo_v2` y no puede cargarlo; otros cargadores MLX no han sido probados.
- Latencia y throughput: la ejecución de referencia completó 130 llamadas y 377.262 tokens generados en 3 h 21 min, lo que equivale a aproximadamente 31 tokens por segundo de media incluyendo tiempo de razonamiento y verificación; no se proporcionan cifras desagregadas de latencia por token.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este formato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Gauntlet sb-7.2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD-MLX-LeanZero (esta compilación) | 309,5 mil millones (MoE, MXFP4/BF16) | 393.216 tokens probados | 0,7077 | MIT | Hugging Face, requiere motor Elzi |
| EigenLabs/MiMo-V2.6-Flash-MOPD-MLX-4bit-mtp | no disponible | 524.288 tokens | 0,6644 | no disponible | Hugging Face, MLX |
| `xiaomi/mimo-v2.6-flash-20260921` (OpenRouter) | no disponible | no disponible | 0,7909 (evaluador anterior) | MIT (modelo base) | API en la nube |

Las tres variantes derivan del mismo linaje MiMo-V2.6-Flash de Xiaomi. Las diferencias principales son el formato de pesos, el hardware de ejecución y la versión del evaluador; el autor advierte que los resultados corresponden a ejecuciones únicas y no constituyen una clasificación. No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Requiere un motor MLX específico (Elzi); no es cargable con `mlx-lm` estándar ni con otros cargadores no probados, lo que limita su portabilidad.
- Necesita dos equipos Apple con 128 GB de memoria unificada como mínimo; no cabe en un solo Mac de 128 GB.
- Las cabezas MTP están desactivadas por defecto: con visión activada, la verificación de tokens especulativos provocó un fallo del motor (bug del motor, no de los pesos). El autor indica que la corrección está en la rama principal de Elzi, no en una release.
- La ejecución de referencia usó una build Staging de Elzi 4.1.28 con una corrección para la desincronización entre los dos Macs; no se garantiza estabilidad en versiones publicadas.
- No incluye codificador de audio ni embeddings de voz, pese a que el modelo base podría soportarlos.
- `dflash/mask_embedding.pt` es un pickle de PyTorch de Xiaomi: debe cargarse solo con código de confianza.
- No hay versiones de 6 u 8 bits: los expertos representan el 90 % del modelo y ya están a 4 bits; ampliar el formato añadiría bytes sin información y no cabría en dos Macs de 128 GB.
- No se han publicado datos sobre sesgos, tasas de alucinación ni cobertura idiomática.
- La licencia MIT se declara en la model card de Xiaomi, pero el repositorio original no contiene un archivo LICENSE separado.
- Los resultados de benchmark provienen de una única ejecución con alta varianza; no deben interpretarse como rendimiento estable en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Mihai-LeanZero/MiMo-V2.6-Flash-MOPD-MLX-LeanZero
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Compilación alternativa: https://huggingface.co/EigenLabs/MiMo-V2.6-Flash-MOPD-MLX-4bit-mtp
- Benchmark Gauntlet: https://leanzero.net/agentic-benchmarks
- Ejecución de EigenLabs: https://leanzero.net/agentic-benchmarks/run/brun-be687be0-20da-4306-9b3e-091986a48c4f
- Ejecución vía OpenRouter: https://leanzero.net/agentic-benchmarks/run/brun-029b6e80-82b5-49e1-83f9-e501cd296cb8
- LeanZero: https://leanzero.net
