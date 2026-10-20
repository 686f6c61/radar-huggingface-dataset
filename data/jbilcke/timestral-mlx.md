# jbilcke/timestral-mlx

## Resumen

Timestral MLX (identificador `jbilcke/timestral-mlx`) es un port comunitario a MLX de la familia Timestral de Mistral AI, formada por cuatro modelos de previsión de series temporales: Timestral-5M, Timestral-28M, Timestral-123M y Timestral-209M. Lo publica el desarrollador independiente jbilcke y no incluye entrenamiento, ajuste fino ni cuantización: es una conversión directa de los pesos FP32 originales a un runtime nativo para Apple silicon, acompañada del pipeline de previsión y de informes de validación numérica.

El modelo resuelve un problema concreto: ejecutar localmente un sistema de *forecasting* probabilístico sobre Macs con GPU Metal, sin depender de PyTorch en tiempo de inferencia y sin enviar series a la nube. La salida no es texto, sino cuantiles de predicción en 21 niveles de probabilidad (de 0,01 a 0,99), lo que permite construir intervalos de confianza directamente utilizables en planificación de demanda, riesgo o mantenimiento predictivo.

Su relevancia actual es doble: por un lado, lleva a hardware de consumo una arquitectura de previsión con atención sobre el eje temporal y sobre el eje de variables, covariables pasadas y conocidas, y soporte nativo de valores ausentes; por otro, abre la puerta a prototipado totalmente offline en el portátil del analista. El repositorio tiene 1,5 GB, no registra descargas ni valoraciones y se distribuye bajo una licencia MIT modificada que cubre específicamente los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con embedding por parches, atención bifurcada tiempo/variante con compuertas, RoPE parcial, SwiGLU, RMSNorm y cabeza de cuantiles monótona |
| Parámetros totales | Cuatro variantes: 5M, 28M, 123M y 209M (denominación del autor) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 pasos temporales; las entradas más largas se truncan a los pasos más recientes; parches de 32 pasos con relleno izquierdo |
| Tipos de cuantización | No disponible; el port distribuye exclusivamente pesos FP32 y no aplica cuantización |
| Idiomas soportados | No disponible (modelo de series temporales, no de lenguaje natural) |
| Licencia | Other / modified-mit, con fichero específico `LICENSE-WEIGHTS` |
| Formato de pesos | safetensors en FP32, con `manifest.json`, `models.json` y `SHA256SUMS` por variante |
| Horizonte de predicción | Bloques de hasta 1.024 pasos; horizontes mayores encadenan la mediana de cada bloque |
| Salida | Cuantiles float32 con forma `(B, V, H, 21)` en probabilidades 0,01, 0,05, 0,10, 0,15, …, 0,90, 0,95, 0,99, más mediana |
| Covariables | Pasadas, conocidas, categóricas pasadas y categóricas conocidas |
| Runtime | MLX 0.32.4 sobre Metal; NumPy 2.5.4 en CPU para empaquetado, máscaras y normalización |
| Entorno validado | macOS con Apple silicon, Python 3.12 (requiere 3.10 o superior) |

Variantes incluidas en el repositorio:

| Variante | Pesos | Capas | Anchura | Directorio local |
|---|---:|---:|---:|---|
| Timestral-5M | 20,84 MB | 8 | 192 | `5M/` |
| Timestral-28M | 111,30 MB | 12 | 384 | `28M/` |
| Timestral-123M | 490,45 MB | 20 | 640 | `123M/` |
| Timestral-209M | 837,27 MB | 24 | 768 | `209M/` |

## Arquitectura y entrenamiento

La arquitectura es un transformer específico para series temporales, no un modelo de lenguaje. La serie se divide en parches de 32 pasos que se proyectan a embeddings; sobre ellos se aplica atención con compuertas en dos ejes (tiempo y variate, es decir, entre series que se pronostican conjuntamente), RoPE parcial para la posición, capas SwiGLU con RMSNorm y una cabeza de regresión por cuantiles monótona que produce los 21 niveles de probabilidad. Las máscaras de atención mantienen las covariables como exógenas tanto en el eje temporal como en el de variables. El contexto máximo es de 32.768 pasos y las series multivariantes se tratan de forma conjunta.

Este port no entrena ni ajusta nada: el autor declara explícitamente que no se realiza entrenamiento, fine-tuning ni cuantización, y que la conversión preserva cada valor y disposición de tensor original en FP32, verificado tras la serialización. El único cambio de nombres es el de los parámetros que contienen `._gate.`, renombrados a `.gate.` porque MLX excluye atributos privados del registro de parámetros. En ejecución, el embedding por parches, la atención, RoPE, SwiGLU, RMSNorm y la cabeza de cuantiles corren en FP32 sobre la GPU mediante MLX; el empaquetado, las máscaras, el *target encoding*, la normalización y el refinamiento se ejecutan en NumPy sobre CPU. Las estadísticas de Welford (causal y de avance de fotograma) se mantienen en float64 porque Metal no lo soporta. PyTorch solo se usa en las herramientas separadas de validación de referencia.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en los modelos originales de Mistral; esos datos corresponden a las fichas de los modelos base y no se incluyen aquí.

## Capacidades

- Previsión de series temporales univariantes y multivariantes con salida probabilística: 21 cuantiles por paso y por variable.
- Acepta contextos con forma `(T,)`, `(B,T)` o `(B,V,T)`, lo que permite pronosticar varias series correlacionadas de forma conjunta.
- Tratamiento de valores ausentes: `NaN` marca huecos y `observation_mask` permite señalar pasos adicionales no observados.
- Covariables exógenas: pasadas, conocidas (incluidas las que cubren el horizonte de predicción), categóricas pasadas y categóricas conocidas, combinables entre sí.
- Codificación de categorías mediante códigos numéricos, con `NaN` para ausentes; para objetivos univariantes se aplica el *target encoding* suavizado de la implementación original y para multivariantes se usan los códigos en bruto.
- Horizontes largos: hasta 1.024 pasos por bloque decodificado y extensión más allá mediante realimentación de la mediana del bloque anterior en el contexto.
- Post-procesado configurable: media simétrica y recorte para contextos observados no negativos activados por defecto, desactivables con `symmetric_averaging=False` y `clip_nonnegative=False`.
- Inferencia totalmente local sin peticiones de red una vez descargado el bundle; carga opcional desde el Hub.
- Verificación de integridad en la carga local: configuración, pesos y licencia original de los pesos se comprueban contra el manifiesto, y todos los parámetros MLX se cargan en modo estricto.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es un modelo puramente numérico de forecasting.

## Casos de uso

- Previsión de demanda energética: con contexto de hasta 32.768 pasos (por ejemplo, lecturas horarias de más de tres años) y covariables conocidas como festivos o temperatura prevista, el modelo devuelve cuantiles por hora que alimentan la programación de generación y la compra en mercado mayorista con intervalos de confianza explícitos.
- Gestión de inventario en retail: alimentando ventas históricas por tienda y artículo como series multivariantes `(B,V,T)` junto con promociones conocidas a futuro, se obtienen distribuciones de demanda por horizonte que permiten fijar niveles de seguridad y puntos de reposición sin asumir normalidad.
- Mantenimiento predictivo de sensores industriales: series de vibración, temperatura y presión con huecos marcados como `NaN` se pronostican de forma conjunta; el cuantil 0,99 sirve como umbral de alerta temprana y el 0,01 para detectar caídas anómalas.
- Riesgo financiero y planificación de tesorería: la salida cuantílica permite construir escenarios de flujo de caja (mediana, percentil 5 y percentil 95) en lugar de una única predicción puntual, útil para stress testing y para el cálculo de colchones de liquidez.
- Análisis confidencial en el portátil: despachos, hospitales o equipos de investigación que no pueden enviar datos a la nube ejecutan el modelo íntegramente en un Mac con Apple silicon, sin peticiones de red tras la descarga y con verificación por checksum de los pesos.
- Prototipado e investigación en series temporales: la variante de 5M (8 capas, anchura 192, 20,84 MB) permite iterar en segundos sobre pipelines de evaluación y comparar configuraciones de covariables o de post-procesado antes de escalar a 123M o 209M.
- Previsión meteorológica local o de afluencia: con variables exógenas conocidas a futuro (calendario, previsiones numéricas), el modelo genera Horizontes de varios días realimentando la mediana por bloques de 1.024 pasos.
- Docencia y reproducibilidad: los manifiestos, checksums y la fijación de `revision` permiten reproducir exactamente un experimento de forecasting en un entorno MLX documentado (Python 3.12, MLX 0.32.4, NumPy 2.5.4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor menciona la existencia de informes de validación numérica y de procedencia de los pesos, pero no se incluyen cifras de MASE, CRPS, SMAPE ni comparaciones cuantitativas con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple silicon y GPU Metal visible. El release de MLX para Python está orientado a macOS; no incluye runtime Core ML, Neural Engine, Swift ni iOS.
- Software: Python 3.10 o superior; entorno validado con Python 3.12, MLX 0.32.4 y NumPy 2.5.4. Otras combinaciones no han sido validadas.
- Huella de pesos: 20,84 MB (5M), 111,30 MB (28M), 490,45 MB (123M) y 837,27 MB (209M). El autor advierte explícitamente que el tamaño de fichero no mide el pico de memoria en ejecución.
- VRAM o memoria unificada: no hay cifras publicadas de pico de memoria. Como referencia, el conjunto completo de las cuatro variantes ocupa 1,5 GB en disco y la variante mayor son 837 MB de pesos FP32; el consumo adicional depende de la longitud de contexto, del número de series y del horizonte solicitado, que no se documentan.
- GPU recomendadas: cualquier Apple silicon con Metal. No hay soporte CUDA, por lo que A100, H100 o RTX 4090 no son plataformas válidas para este port concreto.
- Despliegue: instalación local mediante `pip install .` dentro de un entorno virtual y uso de la clase `TimestralForecaster`, o descarga explícita con `snapshot_download` fijando `revision`. No es compatible con vLLM, TGI, llama.cpp ni Ollama, y no implementa `mlx_lm.generate` ni un `pipeline` de Transformers.
- Almacenamiento: crear los entornos virtuales en un sistema de ficheros macOS normal; unidades con unidades de asignación grandes o sin soporte de enlaces simbólicos pueden consumir espacio excesivo o impedir la creación del entorno. Los checkpoints sí pueden residir en un disco externo.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia ni métricas de rendimiento por variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas / anchura | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| timestral-mlx (5M) | 5M | 8 / 192 | 32.768 pasos | modified-mit | Apple silicon, MLX |
| timestral-mlx (28M) | 28M | 12 / 384 | 32.768 pasos | modified-mit | Apple silicon, MLX |
| timestral-mlx (123M) | 123M | 20 / 640 | 32.768 pasos | modified-mit | Apple silicon, MLX |
| timestral-mlx (209M) | 209M | 24 / 768 | 32.768 pasos | modified-mit | Apple silicon, MLX |
| Timestral original (Mistral AI) | mismas cuatro tallas | idénticas | idéntico | según modelo base | PyTorch, GPU NVIDIA/CPU |

Frente al Timestral original de Mistral AI, este port mantiene exactamente los tensores y la arquitectura, y solo cambia el runtime (MLX en lugar de PyTorch) y el backend de cómputo parcial (NumPy en CPU para el preprocesado). La ventaja es la ejecución nativa en Apple silicon sin PyTorch en inferencia; la desventaja es la ausencia de soporte CUDA y de ecosistema de serving estándar.

No se dispone en la información proporcionada de datos de arquitectura, contexto o rendimiento de otras familias de modelos de forecasting (por ejemplo, modelos de la categoría de Chronos, TimesFM o Moirai), por lo que no se incluye comparación cuantitativa con ellas.

## Limitaciones y advertencias

- Modelo de nicho: es un port comunitario con 0 descargas y 0 valoraciones en el momento de la ficha, sin validación independiente conocida más allá de los informes del propio autor.
- Licencia: se declara `other` con nombre `modified-mit` y un fichero `LICENSE-WEIGHTS` separado para los pesos. No es MIT estándar; hay que revisar ese fichero antes de cualquier uso comercial o de redistribución, y también la licencia de los modelos base de Mistral.
- Plataforma cerrada: solo macOS sobre Apple silicon con Metal. No hay soporte CUDA, Core ML, Neural Engine, Swift ni iOS, lo que impide desplegarlo en servidores NVIDIA o en aplicaciones móviles nativas.
- Sin cuantización: solo se distribuyen pesos FP32; no hay versiones GGUF, INT8 ni INT4, de modo que no se puede reducir la huella más allá de elegir una variante menor.
- Memoria no caracterizada: el autor no publica picos de memoria en ejecución; el tamaño de los ficheros no es un indicador fiable del consumo real con contextos largos o muchas series.
- Contexto truncado: las entradas de más de 32.768 pasos se recortan a los pasos más recientes, con pérdida de información histórica antigua.
- Horizontes largos: por encima de 1.024 pasos la predicción se encadena realimentando la mediana, lo que acumula error y estrecha la coherencia de los cuantiles en el extremo del horizonte.
- Idiomas: el campo de idiomas no está disponible; el modelo no procesa texto, por lo que no debe evaluarse con criterios de calidad lingüística.
- Riesgo de extrapolación: al ser un modelo estadístico, puede producir predicciones poco fiables ante cambios de régimen, series nuevas sin histórico suficiente o covariables fuera del rango observado. No hay documentación sobre sesgos del dataset de entrenamiento original.
- Validación de integridad: el checksum incluido detecta corrupción, pero el propio autor señala que es autodescriptivo; para autenticidad hay que fijar una revisión de confianza o el hash del manifiesto.
- Entradas rechazadas: los valores infinitos en covariables se rechazan y las entradas vacías también; los pipelines deben sanear los datos antes de llamar al modelo.
- Reproducibilidad: solo se ha validado una combinación concreta de versiones (Python 3.12, MLX 0.32.4, NumPy 2.5.4); otras pueden romper la paridad numérica con la implementación de referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jbilcke/timestral-mlx
- Licencia de pesos: https://huggingface.co/jbilcke/timestral-mlx/blob/main/LICENSE-WEIGHTS
- Repositorio oficial de Mistral Timestral: https://github.com/mistralai/timestral
- Modelo base Timestral-5M: https://huggingface.co/mistralai/Timestral-5M
- Modelo base Timestral-28M: https://huggingface.co/mistralai/Timestral-28M
- Modelo base Timestral-123M: https://huggingface.co/mistralai/Timestral-123M
- Modelo base Timestral-209M: https://huggingface.co/mistralai/Timestral-209M
- Manifiesto de modelos y checksums: https://huggingface.co/jbilcke/timestral-mlx/blob/main/models.json y https://huggingface.co/jbilcke/timestral-mlx/blob/main/SHA256SUMS
- Ejemplo de previsión: https://huggingface.co/jbilcke/timestral-mlx/blob/main/examples/forecast.py
