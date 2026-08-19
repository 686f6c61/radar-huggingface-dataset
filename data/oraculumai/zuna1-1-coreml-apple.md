# oraculumai/ZUNA1.1-CoreML-Apple

## Resumen

ZUNA1.1-CoreML-Apple es una conversión a Core ML del modelo ZUNA1.1 de Zyphra, un autoencoder de difusión enmascarado de 380 millones de parámetros diseñado para la reconstrucción y superresolución de señales de electroencefalograma (EEG) de cuero cabelludo. A diferencia de los modelos de lenguaje, este modelo trabaja con señales fisiológicas: dado un subconjunto de canales EEG y sus coordenadas 3D de electrodos, es capaz de denoising los canales observados, reconstruir canales perdidos y predecir señales en posiciones físicas nuevas. Esta versión específica, publicada por el usuario oraculumai, adapta el modelo original al ecosistema de Apple (iPhone, visionOS y macOS) mediante perfiles enumerados, preservando el comportamiento del modelo base bajo un contrato de entrada fijo de ventanas de 5 segundos a 256 Hz.

La relevancia de esta conversión radica en la posibilidad de ejecutar inferencia de EEG en dispositivos Apple de forma nativa, sin depender de servidores externos, lo que abre la puerta a aplicaciones de monitorización en tiempo real, investigación portátil y desarrollo de interfaces cerebro-computadora en entornos móviles. El repositorio incluye tres artefactos Core ML (encoder, paso de denoising y paso de actualización de Euler) y valida la paridad numérica con los pesos originales de PyTorch mediante una prueba de 20 pasos de difusión, con errores relativos del orden de 10⁻⁶.

La arquitectura subyacente es un autoencoder de difusión sensible a la posición, entrenado sobre un corpus EEG público armonizado. El perfil publicado es únicamente de 14 canales en precisión fp32, ya que el flujo residual del decoder del modelo base excede el rango de fp16 (máximo 65504), lo que impide conversiones de menor precisión sin pérdida de fidelidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de difusión enmascarado sensible a la posición (position-aware masked diffusion autoencoder) |
| Parametros totales | 380 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 5 segundos (1280 muestras a 256 Hz) en el perfil Core ML; el modelo base soporta ventanas de hasta 30 segundos |
| Tipos de cuantizacion | Solo fp32 (el modelo base está entrenado en bf16, pero el decoder desborda fp16) |
| Idiomas soportados | No aplica (procesa señales EEG); documentación en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | .mlpackage (Core ML) |

## Arquitectura y entrenamiento

ZUNA1.1 es un autoencoder de difusión que opera sobre tokens de señal EEG. Cada canal se divide en segmentos de 32 puntos temporales (con `num_fine_time_pts=32`), produciendo 40 tokens gruesos por canal para una ventana de 1280 muestras. Cada token se codifica con un vector `tok_idx` que combina las coordenadas 3D del electrodo (x, y, z) y el índice temporal grueso (tc), lo que permite al modelo ser consciente de la disposición espacial del montaje. La inferencia sigue tres fases: un paso de codificación del contexto EEG tokenizado, un bucle de denoising del decoder con N pasos de difusión, y una reconstrucción final de token a señal.

El entrenamiento del modelo base utiliza un esquema de corrupción y dropout flexible, con enmascaramiento de longitud variable (ventanas de hasta 30 segundos) y reconstrucción de segmentos temporales. Esta versión Core ML fija el contrato de entrada a ventanas de 5 segundos (1280 muestras) y una normalización con `data_norm=10.0`, manteniendo la paridad con los pesos originales de PyTorch. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni la composición del corpus EEG, más allá de la mención a un "corpus público armonizado".

## Capacidades

- Reconstrucción de canales EEG faltantes o eliminados a partir de los canales observados y sus coordenadas 3D.
- Denoising de canales EEG observados, eliminando ruido y artefactos.
- Superresolución espacial: predicción de señales en posiciones del cuero cabelludo no cubiertas por electrodos físicos, usando las coordenadas 3D como entrada.
- Procesamiento de ventanas de 5 segundos a 256 Hz, con tokenización en segmentos de 32 puntos.
- Inferencia en dispositivos Apple mediante Core ML, con tres artefactos separados (encoder, paso de denoising y paso de actualización de Euler) que permiten controlar el bucle de difusión desde el host.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Investigación en neurociencia: reconstrucción de canales EEG perdidos en registros experimentales, permitiendo recuperar información de electrodos que fallaron durante la adquisición. El modelo se ejecutaría localmente en un Mac con los perfiles Core ML, procesando ventanas de 5 segundos y generando las señales faltantes con alta fidelidad numérica.

- Interfaces cerebro-computadora (BCI) portátiles: mejora de la calidad de señales EEG capturadas con dispositivos de pocos canales (por ejemplo, cascos de 14 canales como Emotiv EPOC X). El modelo puede denoising y superresolver las señales para extraer características más robustas, ejecutándose en tiempo real en un iPhone o iPad.

- Monitorización EEG en entornos clínicos no críticos: apoyo a la visualización de señales cuando algunos electrodos se despegan o presentan mala conductancia. La reconstrucción permite mantener la continuidad del registro sin interrumpir la sesión, con la advertencia de que no está validado para diagnóstico médico.

- Análisis de sueño y estudios de polisomnografía: reconstrucción de canales EEG de baja calidad en registros nocturnos, mejorando la completitud de los datos antes de aplicar algoritmos de clasificación de etapas de sueño. La ejecución local en macOS evita la transferencia de datos sensibles a la nube.

- Desarrollo de aplicaciones educativas en iOS: demostración de procesamiento de señales fisiológicas en el dispositivo, permitiendo a estudiantes e investigadores experimentar con reconstrucción de EEG sin necesidad de infraestructura de servidores. El perfil de 14 canales es adecuado para cascos comerciales de bajo coste.

- Preprocesamiento de datos para pipelines de machine learning: limpieza y estandarización de datasets EEG antes de entrenar clasificadores. El modelo puede rellenar huecos y suavizar artefactos, mejorando la calidad de los conjuntos de entrenamiento, con la ventaja de poder ejecutarse en lote en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (como MMLU, HumanEval o GSM8K) en la información disponible, ya que este modelo no es un modelo de lenguaje y su evaluación se centra en la fidelidad de reconstrucción de señales. El repositorio incluye una validación de paridad numérica con los pesos originales de PyTorch mediante una prueba de 20 pasos de difusión, cuyos resultados se resumen a continuación:

| Metrica | Valor |
|---|---|
| MAE (error absoluto medio) | 0.000002 |
| RMSE (raiz del error cuadratico medio) | 0.000003 |
| max_abs (error absoluto maximo) | 0.000022 |
| rel_l2 (error relativo L2) | 0.000003 |
| Umbral de tolerancia | 0.005000 |
| Resultado | PASS |

Estas métricas confirman que la conversión Core ML reproduce prácticamente de forma exacta el comportamiento del modelo original en PyTorch para el perfil de 14 canales en fp32.

## Requisitos de hardware

- Memoria estimada: el modelo tiene 380 millones de parámetros en fp32, lo que supone aproximadamente 1,5 GB de pesos. Al estar dividido en tres artefactos (encoder, decoder step y decoder step update), la memoria total necesaria para cargar todos los componentes es similar, pero puede gestionarse de forma incremental.
- GPU/Neural Engine: al ser Core ML, se ejecuta en Apple Silicon (A-series, M-series) utilizando el Neural Engine o Metal. No requiere GPUs externas como NVIDIA o AMD.
- Compatibilidad con dispositivos: iPhone (a partir de iPhone 12 o posterior, dependiendo de la memoria disponible), iPad con chip M1 o superior, Mac con Apple Silicon. En Macs con Intel la ejecución es posible pero menos eficiente.
- Opciones de despliegue: integración directa en aplicaciones Xcode mediante Core ML, o mediante scripts en Swift/Python. No se mencionan soporte para vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan cifras concretas. La model card indica que el rendimiento depende fuertemente del número de pasos de difusión; menos pasos aceleran la iteración, mientras que más pasos mejoran la calidad de reconstrucción.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de referencia es el modelo base Zyphra/ZUNA1.1, del cual esta conversión es una adaptación. No se han encontrado otros autoencoders de difusión para EEG con conversión Core ML pública en las fuentes consultadas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZUNA1.1 (Zyphra) | 380M | Hasta 30 s | Apache-2.0 | PyTorch (bf16) | Modelo original |
| ZUNA1.1-CoreML-Apple (oraculumai) | 380M | 5 s (perfil fijo) | Apache-2.0 | Core ML (fp32) | Conversión para Apple |

## Limitaciones y advertencias

- El perfil publicado es exclusivamente de 14 canales en fp32; no hay perfiles para otros montajes ni precisiones reducidas, lo que limita su uso a configuraciones compatibles.
- La conversión no está validada para diagnóstico médico, tratamiento ni decisiones clínicas. Solo debe utilizarse con fines de investigación e ingeniería.
- El modelo requiere que el montaje EEG incluya coordenadas 3D de los electrodos; sin esta información, la entrada no es válida.
- La frecuencia de muestreo está fijada en 256 Hz y la ventana en 5 segundos para este perfil; señales con otras características necesitarían re-muestreo o adaptación.
- No se admiten cuantizaciones fp16 o inferiores debido al desbordamiento del rango en el decoder residual; esto incrementa el uso de memoria y puede limitar el despliegue en dispositivos con poca RAM.
- El modelo base está entrenado en bf16, pero la conversión es fp32, lo que puede afectar al rendimiento en dispositivos optimizados para fp16.
- No se han publicado evaluaciones de sesgo o robustez frente a artefactos extremos (movimiento ocular, electromiografía, etc.); la reconstrucción puede degradarse en señales muy contaminadas.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/oraculumai/ZUNA1.1-CoreML-Apple
- Modelo base original: https://huggingface.co/Zyphra/ZUNA1.1
- Repositorio oficial de ZUNA: https://github.com/Zyphra/zuna
- Página del paper técnico: https://www.zyphra.com/zuna-technical-paper
- Conversión anterior (ZUNA sin 1.1): https://huggingface.co/oraculumai/ZUNA-CoreML-Apple
