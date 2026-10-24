# mlboydaisuke/TimesFM-2.5-200M-CoreAI

## Resumen

TimesFM 2.5 200M — Core AI es la conversión a Apple Core AI del modelo fundacional de series temporales `google/timesfm-2.5-200m-transformers` (200 M de parámetros, licencia Apache-2.0). El autor del port, `mlboydaisuke`, publica el grafo en formato `.aimodel` (fp16, ~463 MB) junto con el envoltorio DSP de referencia en Python y variantes para iOS, de modo que el modelo se ejecuta íntegramente en dispositivo —GPU o Neural Engine— sin runtime de LLM. Es, según la model card, el primer modelo fundacional de forecasting del zoo de Core AI.

El interés es de infraestructura más que de modelado: Core AI es el runtime on-device de Apple en iOS 27 / macOS 27, sucesor de Core ML, y permite exportar modelos de PyTorch mediante `coreai-torch` a bundles `.aimodel`. Este repositorio demuestra el patrón de portar un transformer no generativo de texto (un decoder-only sobre parches numéricos) como un único grafo sin estado más una capa de preprocesado en el host: normalización RevIN en dos niveles, invariancia a inversión de signo y cabeza de cuantiles continuos.

La arquitectura es un transformer decoder-only sobre parches de 32 puntos, con RoPE, sandwich-norm RMSNorm, QK-norm y escala de atención aprendible por dimensión. La configuración del host declara `hidden=1280`, `layers=20`, `heads=16`, `head_dim=80`, `inter=1280`, `patch=32`, `horizon=128` y `q=9`. El contexto es fijo de 2048 puntos (64 parches) y la salida es una predicción de 128 pasos con bandas cuantílicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only sobre parches de series temporales (32 puntos por parche), con RoPE, sandwich-norm RMSNorm, QK-norm y escala de atención aprendible por dimensión |
| Parametros totales | 200 M (según el nombre del modelo base `google/timesfm-2.5-200m-transformers`) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2048 puntos (64 parches de 32); fijo, las series más cortas se rellenan por delante y se enmascaran en el host |
| Horizonte de predicción | 128 pasos por llamada al grafo |
| Tipos de cuantizacion | Grafo en fp16; no se ofrecen variantes GGUF, INT8 ni INT4 en el repositorio. El campo `base_model_relation` es `quantized` respecto al modelo original |
| Idiomas soportados | No aplica / no disponible: la entrada son series numéricas univariantes, no texto |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle `.aimodel` de Apple Core AI (grafo JIT y grafo AOT `.h18p.aimodelc`); referencia de host en Python |
| Entrada del grafo | `tok_in[1,64,64]`, `cos/sin[1,64,80]`, `attn_bias[1,1,64,64]` |
| Salida del grafo | `proj_point[1,64,1280]`, `proj_q[1,64,10240]` |
| Tamano del grafo | ~463 MB (fp16) |
| Tamano del repositorio | 2.3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only que opera sobre parches de 32 puntos temporales en lugar de tokens de texto. Mantiene la pila habitual de los LLM modernos: RoPE para posiciones, RMSNorm en configuración sandwich-norm, QK-norm y una escala de atención aprendible por dimensión. La configuración declarada en el host es `patch=32`, `horizon=128`, `hidden=1280`, `layers=20`, `heads=16`, `head_dim=80`, `inter=1280`, `q=9`, `oql=1024`, `eps=1e-6`. El grafo recibe 64 parches (contexto fijo de 2048 puntos) y emite, por parche, una proyección de punto y una proyección cuantílica.

No se proporcionan en la información disponible datos sobre el corpus de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO ni proceso de ajuste); esa información corresponde a la model card de `google/timesfm-2.5-200m-transformers` y no se detalla en este repositorio. La innovación destacable del port es de ingeniería: el modelo se ejecuta como un único grafo Core AI sin estado más un envoltorio DSP en el host que implementa el parcheado, una normalización RevIN en dos niveles (global y causal por parche con Welford), la invariancia a inversión (dos llamadas al grafo sobre la entrada y su negada), la cabeza de cuantiles continuos, la desnormalización y el recorte de positividad. La variante `ios/` es el mismo grafo JIT byte a byte y cada generación de iPhone lo especializa en la primera carga; `ios-h18p/` es una compilación anticipada exclusiva del iPhone 17 Pro.

## Capacidades

- Forecasting univariante multi-horizonte: 128 pasos de predicción por llamada a partir de cualquier serie de hasta 2048 puntos.
- Predicción puntual más bandas cuantílicas (la model card indica 10 cuantiles; la configuración del host declara `q=9`), útil para intervalos de confianza y detección de anomalías.
- Manejo de series de longitud arbitraria menor o igual a 2048 mediante relleno frontal y máscara en el host, sin recalcular el grafo.
- Invariancia a inversión de signo (flip-invariance) implementada con dos llamadas al grafo sobre la serie y su negada.
- Normalización RevIN de dos niveles (global y causal por parche) para estabilizar series con tendencia y cambios de escala.
- Inferencia completamente on-device en GPU o Neural Engine, sin dependencia de red ni de runtime de LLM.
- Ejecución sin estado: el mismo bundle sirve para cualquier contexto menor o igual a 2048 y no requiere gestión de caché KV.
- No soporta tool calling, agentes, visión, audio ni generación de texto: la tarea es exclusivamente numérica.

## Casos de uso

- Previsión de demanda en retail con datos locales: el modelo genera 128 pasos de demanda y bandas cuantílicas en el propio dispositivo del punto de venta, sin enviar el histórico de ventas a la nube y con un coste de inferencia de decenas de milisegundos.
- Analítica de aplicaciones móviles con privacidad: previsión de DAU, retención o ingresos a partir de las métricas que ya recoge la app en el iPhone, aprovechando que el grafo completo ocupa ~463 MB y cabe en el contenedor de la aplicación.
- Predicción de series de sensores y telemetría industrial en el edge: con 2048 puntos de contexto (por ejemplo, una muestra por minuto equivale a 34 horas) se puede anticipar la evolución de una magnitud y marcar alertas cuando la observación cae fuera de la banda cuantílica.
- Monitorización de infraestructura: previsión de latencia, uso de CPU o tasa de errores por servicio con horizonte de 128 intervalos, ejecutada junto al agente de observabilidad en macOS, para escalado preventivo.
- Detección de anomalías mediante bandas de cuantiles: comparar el valor real con los cuantiles predichos permite umbrales adaptativos sin entrenar un modelo específico por serie, lo que reduce el trabajo de mantenimiento.
- Previsión de consumo energético o de precios en dispositivos domésticos: estimación de la curva de carga de las próximas horas en local, útil para programar electrodomésticos o la recarga de un vehículo.
- Series fisiológicas en aplicaciones de salud: tendencias de frecuencia cardíaca o glucemia procesadas en el dispositivo, sin salida de datos personales, con la ventaja de privacidad que exige el sector.
- Planificación de capacidad offline en herramientas de escritorio para macOS: previsiones de afluencia, stock o carga de trabajo generadas en el portátil del analista sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de forecasting (GIFT-Eval, MASE, sMAPE, CRPS) en la información disponible. Lo que sí se documenta son pruebas de fidelidad frente al oráculo fp32 de Hugging Face y medidas de latencia.

| Prueba | Resultado |
|---|---|
| Grafo reescrito frente a proyecciones de HF | cos 1.0000000 (MAE ~1e-6) |
| DSP del host + grafo frente a la predicción final de HF | cos 1.0000000 (rel ~1e-8) |
| Grafo fp16 en GPU de Mac frente a oráculo fp32 | cos ≥ 0.99998 |
| Predicción extremo a extremo | cos 0.9999999; valores coinciden con HF hasta 2-3 decimales, incluido un caso de contexto corto con relleno frontal |
| iPhone 17 Pro en app (`KitForecaster`, AOT h18p) frente a Mac | coincidencia hasta 3 decimales (Δ ≤ 0.001, redondeo fp16 en GPU) |
| Latencia en GPU de Mac | ~7 ms por grafo, ~14 ms por predicción de 128 pasos (el flip son 2 llamadas) |
| Latencia en iPhone 17 Pro | ~25 ms en caliente, 54 ms en frío |

Carga del bundle JIT (`timesfm_2p5_200m_ctx2048_fp16.aimodel`, 463 MB) medido en un iPhone 18 Pro (iPhone19,2, iOS 27.0 build 24A437, h19p) con la app DecideGate en modo solo carga, sin el entitlement de memoria ampliada:

| Bundle JIT en `ios/` | MB | Primera carga | Primera llamada | Carga tras relanzar |
|---|---:|---:|---:|---:|
| `timesfm_2p5_200m_ctx2048_fp16.aimodel` | 463 | 1,54 s | 747 ms | 0,44 s |

## Requisitos de hardware

- VRAM / memoria: el grafo fp16 ocupa ~463 MB; en memoria unificada de Apple hay que sumar el overhead de compilación y especialización del runtime. El repositorio completo ocupa 2,3 GB en disco (incluye el bundle de iOS y el AOT de h18p).
- Plataformas soportadas: Apple Silicon con Core AI (iOS 27 / macOS 27). El runtime objetivo es la GPU o el Neural Engine del dispositivo Apple; no se documenta soporte para CUDA, ROCm ni CPU x86.
- GPU de escritorio: no aplica; no se ha publicado una ruta de ejecución para A100, H100 ni RTX 4090. El equivalente funcional es el modelo base `google/timesfm-2.5-200m-transformers` en PyTorch.
- Cabe en hardware de consumo: sí, en cualquier iPhone o Mac reciente compatible con Core AI; el propio repositorio incluye un bundle compilado para el iPhone 17 Pro.
- Despliegue: `coreai.runtime` (Python) con `rt.AIModel.load(...)` y `SpecializationOptions` para GPU, o CoreAIKit (`GraphModel`, `Forecaster`) en Swift. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni un grafo con caché KV.
- Latencia y throughput: ~14 ms por predicción de 128 pasos en GPU de Mac; ~25 ms en caliente en iPhone 17 Pro. La primera llamada tras cargar el grafo en el iPhone 18 Pro fue de 747 ms, por la especialización JIT.
- Memoria en iOS: en iOS 27.2 (build 24B5099f), una build sin `com.apple.developer.kernel.increased-memory-limit` abortó con SIGABRT durante la especialización del grafo JIT; con el entitlement cargó (25,3 s la primera vez, descarga incluida) y devolvió predicción en dos lanzamientos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlboydaisuke/TimesFM-2.5-200M-CoreAI` (este) | 200 M | 2048 puntos, horizonte 128 | `.aimodel` (Core AI, fp16), on-device Apple | Apache-2.0 | Hugging Face, ~130 descargas |
| `google/timesfm-2.5-200m-transformers` (base) | 200 M | No disponible en la información proporcionada | PyTorch / Transformers, fp32 | Apache-2.0 | Hugging Face |
| Alternativas de la categoría (Chronos, Moirai, Lag-Llama) | No disponible | No disponible | No disponible | No disponible | No verificado en la información proporcionada |

La comparación relevante es contra el propio modelo base: este port no cambia los pesos ni el entrenamiento, sino el formato y el runtime, con una pérdida de fidelidad numérica limitada a fp16 (cos ≥ 0,99998 frente al oráculo fp32) y la ventaja de ejecución local sin PyTorch. Para el resto de alternativas de la categoría no se dispone de datos verificados en la información proporcionada, por lo que no se comparan cifras.

## Limitaciones y advertencias

- Alcance restringido: solo forecasting univariante. No admite variables exógenas, series multivariantes ni generación de texto.
- Horizonte y contexto fijos: 128 pasos de salida y 2048 puntos de entrada como máximo; series más largas requieren ventaneo manual y las más cortas dependen del relleno frontal del host.
- Precisión fp16: la coincidencia con el oráculo fp32 es de 2-3 decimales, suficiente para la mayoría de usos pero no para escenarios que exijan exactitud numérica estricta.
- Sin benchmarks de calidad de predicción: no hay métricas estándar (MASE, sMAPE, CRPS, GIFT-Eval) publicadas, solo pruebas de fidelidad frente a HF; el rendimiento predictivo real del modelo base debe evaluarse por separado.
- Dependencia de plataforma: requiere Core AI en iOS 27 / macOS 27. El bundle AOT `ios-h18p` solo funciona en el iPhone 17 Pro; otros dispositivos lo rechazan con `incompatibleCompiledAssetArchitecture`.
- Riesgo operativo en iOS 27.2: sin el entitlement `com.apple.developer.kernel.increased-memory-limit` la app puede abortar al especializar el grafo; el autor no aísla si la causa es la versión de iOS o la propia app.
- Runtime propietario y emergente: Core AI y `coreai-torch` son infraestructura de Apple; no se detallan en la información disponible las condiciones de uso del runtime ni su disponibilidad fuera de las betas de iOS 27 / macOS 27.
- Sesgos: no documentados. Al ser un modelo entrenado sobre series temporales reales, puede heredar sesgos de dominio (estacionalidades, escalas y frecuencias sobrerrepresentadas en los datos de entrenamiento del modelo base).
- Alucinación en sentido figurado: el modelo siempre devuelve una predicción, incluso para series sin estructura predecible; conviene validar con bandas cuantílicas y con una línea base ingenua antes de usarlo en producción.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero la licencia del runtime Core AI y del envoltorio no se especifica en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/TimesFM-2.5-200M-CoreAI
- Modelo base: https://huggingface.co/google/timesfm-2.5-200m-transformers
- Zoo de modelos Core AI de la comunidad: https://github.com/john-rocky/coreai-models-community
- Core AI Kit: https://github.com/john-rocky/coreai-kit
- Pull request del entitlement de memoria: https://github.com/john-rocky/coreai-kit/pull/76
- Notas sobre distribución de grafos JIT: https://github.com/john-rocky/coreai-model-zoo/blob/main/knowledge/jit-distribution.md
- Benchmark de LLM en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench
- Leaderboard DeviceMark: https://devicemark.github.io/
