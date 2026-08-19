# oraculumai/ZUNA1.1-Classifier-CoreML-Apple

## Resumen

ZUNA1.1-Classifier-CoreML-Apple es una conversión a Core ML del modelo ZUNA1.1 de Zyphra, un autoencoder de difusión enmascarado de 380 millones de parámetros diseñado para la reconstrucción y superresolución de electroencefalogramas (EEG) de cuero cabelludo. Esta versión específica, publicada por el usuario oraculumai, permite ejecutar el modelo de forma nativa en dispositivos Apple (iPhone, visionOS y macOS) mediante perfiles enumerados que preservan el comportamiento del modelo original. El modelo resuelve el problema de reconstruir canales EEG faltantes o denoizar señales observadas a partir de un subconjunto de canales y sus coordenadas 3D, lo que resulta especialmente útil en entornos con pocos electrodos o con artefactos.

La relevancia de esta conversión radica en que facilita el despliegue de un modelo de EEG de última generación en hardware de consumo, sin necesidad de servidores ni GPUs dedicadas. El modelo base ZUNA1.1 amplía la versión anterior (ZUNA) con enmascaramiento de longitud variable (ventanas de hasta 30 segundos), reconstrucción de segmentos temporales y un esquema de entrenamiento más flexible con corrupción y dropout. La conversión Core ML publicada se limita a un perfil fijo de 5 segundos a 256 Hz (1280 muestras) y 14 canales, con precisión fp32, manteniendo una paridad numérica casi exacta con los pesos originales de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de difusion enmascarado con atencion posicional (masked diffusion autoencoder) |
| Parametros totales | 380 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1280 muestras (5 segundos a 256 Hz) |
| Tipos de cuantizacion | fp32 (el modelo base es bf16, pero fp16 falla por desbordamiento en el decodificador) |
| Idiomas soportados | Ingles (etiquetas y documentacion; el modelo procesa senales EEG, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo base ZUNA1.1 es un autoencoder de difusion con atencion posicional, entrenado sobre un corpus EEG publico armonizado de gran tamano. La arquitectura tokeniza las senales EEG en ventanas de 5 segundos a 256 Hz, dividiendo cada canal en bloques de 32 muestras, lo que genera 40 tokens temporales por canal. Cada token se codifica con una representacion que combina la posicion 3D del electrodo (x, y, z) y el indice temporal (tc). El proceso de inferencia consta de tres pasos: un pase hacia adelante del encoder, un bucle de denoising con N pasos de difusion, y una reconstruccion final de token a senal.

El entrenamiento del modelo base incluyo un esquema de enmascaramiento variable (ventanas de hasta 30 segundos) y una estrategia de corrupcion/dropout mas flexible que la version original. La conversion Core ML publicada conserva el contrato tensorial del modelo base, pero se limita al perfil fijo de 5 segundos y 14 canales. La implementacion Core ML se divide en tres componentes: `ZunaEncoder` (codifica el contexto EEG tokenizado), `ZunaDecoderStep` (un paso de denoising) y `ZunaDecoderStepUpdate` (paso de denoising mas actualizacion de Euler, que reduce operaciones en el host). Todos los perfiles publicados han sido validados contra los pesos originales de PyTorch mediante una prueba de paridad de 20 pasos de difusion.

## Capacidades

- Reconstruccion de canales EEG faltantes a partir de un subconjunto de canales observados y sus coordenadas 3D.
- Denoising de senales EEG observadas, eliminando artefactos y ruido.
- Superresolucion espacial: prediccion de senales en posiciones del cuero cabelludo no muestreadas, basandose en las coordenadas fisicas.
- Soporte para montajes EEG con posiciones 3D de electrodos (requisito del modelo base).
- Procesamiento de ventanas de 5 segundos a 256 Hz, con tokenizacion en bloques de 32 muestras.
- Perfil especifico para 14 canales, compatible con dispositivos tipo Emotiv EPOC X.
- Integracion nativa con el ecosistema Apple (Core ML, VisionOS, iOS, macOS).

## Casos de uso

- Investigacion en neurociencia: reconstruccion de canales EEG perdidos en registros experimentales con fallos de electrodos, permitiendo recuperar datos sin descartar sesiones completas.
- Interfaces cerebro-computadora (BCI): mejora de la calidad de senales en sistemas de bajo coste con pocos electrodos, prediciendo senales en posiciones adicionales para aumentar la resolucion espacial.
- Monitorizacion de EEG en dispositivos moviles: ejecucion del modelo directamente en un iPhone o iPad para analisis en tiempo real de senales EEG en entornos clinicos ambulatorios o domoticos.
- Analisis del sueno: reconstruccion de canales faltantes en registros polisomnograficos caseros, facilitando la deteccion de fases del sueno sin necesidad de equipos de laboratorio.
- Deteccion de anomalias: denoising de senales EEG para mejorar la precision de algoritmos de deteccion de epilepsia u otros eventos patologicos, especialmente en entornos con artefactos musculares o de movimiento.
- Desarrollo de aplicaciones de neurofeedback: uso del modelo como preprocesador para limpiar senales en tiempo real en aplicaciones de entrenamiento cerebral, aprovechando la inferencia local en dispositivos Apple.

## Benchmarks y rendimiento

La model card proporciona metricas de paridad numerica entre la conversion Core ML y los pesos originales de PyTorch, evaluadas con una ejecucion de 20 pasos de difusion. No se han publicado resultados de benchmarks en tareas de clasificacion o regresion sobre conjuntos de datos estandar, ya que el modelo es generativo y su evaluacion principal es la fidelidad de reconstruccion.

| Metrica | Valor (perfil 14ch-fp32) | Umbral de validacion |
|---|---|---|
| MAE | 0.000002 | - |
| RMSE | 0.000003 | - |
| max_abs | 0.000020 | - |
| rel_l2 | 0.000003 | 0.005000 |
| Resultado | PASS | - |

Estos valores indican que la conversion Core ML reproduce practicamente de forma identica las salidas del modelo PyTorch original, con errores por debajo de 10^-5 en todas las metricas.

## Requisitos de hardware

- Dispositivos Apple compatibles con Core ML: iPhone, iPad, Apple Vision Pro, Mac con chip M1 o posterior.
- Almacenamiento: el repositorio ocupa 1.5 GB, incluyendo los archivos .mlpackage del perfil 14ch-fp32.
- Memoria: no se especifica la RAM minima, pero al ser un modelo de 380M parametros en fp32, se recomienda al menos 2 GB de memoria disponible para evitar swaps.
- GPU: no requiere GPU dedicada; Core ML utiliza la Neural Engine o la GPU integrada del chip Apple Silicon.
- Opciones de despliegue: integracion directa en apps Xcode mediante Core ML, o uso en scripts con coremltools para Python.
- Rendimiento: la latencia depende del numero de pasos de difusion. Para iteracion rapida se recomiendan menos pasos; para mayor calidad de reconstruccion, mas pasos. No se proporcionan cifras concretas de throughput.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de EEG convertidos a Core ML.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZUNA1.1 (original) | 380M | Ventanas hasta 30s | PyTorch | Apache-2.0 | HuggingFace, GitHub |
| ZUNA-CoreML-Apple (oraculumai) | 380M | 5s fijo | Core ML | Apache-2.0 | HuggingFace |
| ZUNA1.1-Classifier-CoreML-Apple (este) | 380M | 5s fijo | Core ML | Apache-2.0 | HuggingFace |

La diferencia principal entre las dos conversiones Core ML es que la version 1.1 incorpora las mejoras del modelo base ZUNA1.1 (enmascaramiento variable, reconstruccion temporal) y publica perfiles con validacion de paridad. No se han encontrado otras conversiones Core ML de modelos de EEG comparables en el momento de la redaccion.

## Limitaciones y advertencias

- El modelo no esta validado para diagnostico medico, tratamiento ni toma de decisiones clinicas. Su uso se limita a investigacion e ingenieria.
- Solo se publica el perfil de 14 canales en fp32. No hay perfiles para otros numeros de canales ni precisiones reducidas, lo que limita su uso en dispositivos con poca memoria.
- El modelo base fue entrenado con datos en ingles (etiquetas) y el procesamiento de senales EEG no depende del idioma, pero la documentacion y los metadatos estan en ingles.
- La ventana de contexto es fija (5 segundos a 256 Hz). No se soportan otras duraciones ni frecuencias de muestreo sin reentrenamiento.
- El modelo requiere que el montaje EEG incluya coordenadas 3D de los electrodos; no funciona con montajes sin informacion espacial.
- La conversion Core ML no incluye el proceso de normalizacion de datos (data_norm=10.0) que debe aplicarse en el host antes de la inferencia.
- El decodificador residual del modelo base excede el rango de fp16 (max 65504), por lo que no se publican conversiones en fp16. Esto puede aumentar el consumo de memoria y energia en dispositivos moviles.
- Riesgo de alucinacion en la reconstruccion de canales faltantes: el modelo puede generar senales plausibles pero incorrectas en regiones sin datos observados, especialmente con pocos canales de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oraculumai/ZUNA1.1-Classifier-CoreML-Apple
- Modelo base original: https://huggingface.co/Zyphra/ZUNA1.1
- Repositorio oficial de Zyphra: https://github.com/Zyphra/zuna
- Pagina del paper tecnico: https://www.zyphra.com/zuna-technical-paper
- Version anterior de la conversion Core ML (ZUNA sin 1.1): https://huggingface.co/oraculumai/ZUNA-CoreML-Apple
