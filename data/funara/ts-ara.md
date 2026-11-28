# funara/ts-ara

## Resumen

ts-ara es un modelo fundacional de series temporales de código abierto, publicado con licencia Apache 2.0 por el usuario funara, derivado del modelo `theforecastingcompany/t0-gamma`. Se distribuye como un runtime ONNX optimizado para inferencia en CPU sin dependencia de PyTorch, manteniendo los pesos preentrenados sin modificar. El modelo realiza pronóstico probabilístico zero-shot tanto univariante como multivariante, con soporte para covariables pasadas y covariables futuras conocidas, lo que lo hace directamente utilizable en entornos de producción sin reentrenamiento.

La arquitectura subyacente es un transformer de parches de 24 capas con alternancia 2:1 entre parches temporales y de grupo, tamaño de parche 32 y aproximadamente 256 millones de parámetros (255.614.293 según los pesos en safetensors). El repositorio ocupa 1,8 GB e incluye tres niveles de artefactos: el maestro en FP32 (975,1 MB), una exportación mixta FP16 (488,1 MB) y una versión mixta INT8 orientada a dispositivos con poca memoria (256,9 MB).

Su relevancia actual radica en que ofrece pronóstico probabilístico calibrado en CPU con latencias de decenas a cientos de milisegundos, incorporando mejoras de producción como alineación de calendario mediante características de Fourier, protección frente a covariables ruidosas y calibración conformal adaptativa en línea. Todo ello sin reentrenar y con una licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de parches con alternancia 2:1 tiempo/grupo, 24 capas, tamaño de parche 32 |
| Parametros totales | 255.614.293 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como valor único; el modelo opera sobre ventanas de historial y horizontes configurables (se documentan horizontes de hasta 1.152 pasos y escalas de contexto de 3.072 y 9.216) |
| Tipos de cuantizacion | FP32 (maestro), mixta FP16 (escaladores y normalización en FP32), mixta INT8 (96 proyecciones lineales del transformer en INT8, 6 nodos MatMul del codificador de parches y decodificador de cuantiles en FP32) |
| Idiomas soportados | No disponible (modelo de series temporales, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (maestro FP32) y ONNX (exportaciones mixtas FP16 e INT8) |

## Arquitectura y entrenamiento

El modelo base `t0-gamma` emplea un transformer de parches de 24 capas con un patrón de alternancia 2:1 entre atención sobre parches temporales y atención sobre parches de grupo, con un tamaño de parche de 32 pasos. Esta disposición permite capturar dependencias locales dentro de cada parche y dependencias entre canales o grupos de series, lo que habilita el pronóstico multivariante con covariables. La exportación a ONNX preserva los pesos preentrenados y añade optimizaciones de ejecución específicas para CPU.

No se dispone de información detallada en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Las innovaciones técnicas destacadas se sitúan en la capa de exportación e inferencia: exportación ONNX en precisión mixta que elimina sincronizaciones host-dispositivo, cuantización selectiva que mantiene en FP32 los escaladores y la normalización para evitar desbordamientos, y protección frente a la amplificación de colas de la función `sinh` en la versión INT8. Adicionalmente, se incorporan características de calendario de Fourier opcionales, calibración conformal adaptativa (CQR, ACI y DtACI) implementada en NumPy puro, y preprocesamiento sin fuga de información mediante agrupación por longitud y guardas de covariables.

## Capacidades

- Pronóstico probabilístico zero-shot de series temporales univariantes y multivariantes.
- Salida de cuantiles nativos: 21 cuantiles en el rango 0,01–0,99 en la variante `ts-ara-small`.
- Soporte de covariables pasadas y covariables futuras conocidas (por ejemplo, temperatura, festivos, carga o renovables).
- Alineación de calendario opcional mediante características periódicas sin/cos de Fourier (`add_calendar_features`), con modo automático basado en R² armónico y número efectivo de muestras de Bretherton.
- Calibración conformal adaptativa en línea (`DynamicAdaptiveConformalCalibrator`) para mantener la cobertura de intervalos bajo cambios de distribución y horizontes largos.
- Protección frente a covariables ruidosas o desplazadas (`guard_covariates`) basada en correlación y desfase históricos.
- Vincentización de doble contexto (`context_scales`) para combinar pronósticos con distintas escalas de contexto.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime.
- No dispone de tool calling, capacidades de agente, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Pronóstico de demanda energética: el modelo puede generar pronósticos horarios probabilísticos con covariables futuras conocidas como temperatura y festivos, aprovechando la alineación de calendario para series con estacionalidad semanal marcada, como demuestra el ejemplo sobre `epf_de` con R² de 0,95 y cobertura del intervalo del 80 % del 91,7 %.
- Predicción de generación solar: con covariables meteorológicas futuras, la variante `ts-ara-small` produce pronósticos de 168 horas en 69 ms de CPU con R² de 0,94, adecuado para sistemas de gestión energética en dispositivos de bajos recursos.
- Planificación de inventario y cadena de suministro: el pronóstico multivariante con covariables permite estimar demanda por producto y almacén, y la calibración conformal mantiene intervalos fiables ante promociones o cambios abruptos de distribución.
- Monitorización de métricas de infraestructura: series de latencia, tráfico o uso de CPU pueden pronosticarse zero-shot en el propio servidor sin GPU, integrando el runtime ONNX en pipelines de observabilidad.
- Predicción de series financieras y de negocio: la salida de cuantiles permite construir escenarios pesimista, mediano y optimista para presupuestos y gestión de riesgo, con horizontes largos gracias a la calibración DtACI.
- Despliegue en dispositivos edge: la variante INT8 de 256,9 MB y 542 MB de RAM pico permite pronóstico probabilístico en entornos con memoria limitada, como gateways industriales o sistemas embebidos.
- Evaluación comparativa de modelos de pronóstico: el soporte de `fev-bench` y la API de calibración facilitan integrar ts-ara como referencia en experimentos de investigación sobre pronóstico probabilístico.

## Benchmarks y rendimiento

| Benchmark / metrica | ts-ara (FP16 mixto) | t0-gamma (FP32) | ts-ara-small (INT8 mixto) |
|---|---|---|---|
| Norm. CRPS en Real-TSF/TIME | 0,5580 | 0,5580 | No disponible |
| SQL Win Rate en fev-bench (mini-cpu, 13 tareas, 2.013 pronósticos) | 71,4 % | 67,0 % | No disponible |
| Cobertura del intervalo del 80 % bajo cambio de distribución | 80,2 % (desde 73,2 %) | No disponible | No disponible |
| Cobertura del intervalo del 80 % en horizonte h=1.152 | 79,4 % | No disponible | No disponible |
| R² en epf_de (168 h) | 0,95 | No disponible | No disponible |
| Cobertura del 80 % en epf_de | 91,7 % | No disponible | No disponible |
| Latencia p50 en CPU (epf_de, 168 h) | 220 ms | No disponible | No disponible |
| R² en solar_with_weather_1H (168 h) | No disponible | No disponible | 0,94 |
| Cobertura del 80 % en solar_with_weather_1H | No disponible | No disponible | 79,2 % |
| Latencia en solar_with_weather_1H | No disponible | No disponible | 69 ms |
| Latencia p50 genérica en CPU | 178,6 ms | 256,3 ms | 91,8 ms |
| RAM pico aislada | 1.731,2 MB | 2.201,8 MB | 542,0 MB |
| Tamaño del artefacto | 488,1 MB | 975,1 MB | 256,9 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- RAM necesaria: 1.731,2 MB en pico para `ts-ara` (FP16 mixto), 542,0 MB para `ts-ara-small` (INT8 mixto) y 2.201,8 MB para el maestro FP32.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo no depende de CUDA ni de PyTorch.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto, ya que el despliegue objetivo es CPU.
- Opciones de despliegue: ONNX Runtime a través del paquete `ts-ara` (`pip install "ts-ara[onnx,dataframe]"`), con descarga de artefactos desde Hugging Face mediante `snapshot_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: p50 de 178,6 ms para `ts-ara` y 91,8 ms para `ts-ara-small` en las pruebas documentadas; la calibración conformal añade aproximadamente 0,6 ms por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ts-ara | 255.614.293 | Ventanas y horizontes configurables (hasta 1.152 documentado) | Transformer de parches 2:1, ONNX para CPU | Apache 2.0 | Hugging Face (`funara/ts-ara`) |
| t0-gamma | ~256 M | No disponible | Transformer de parches 2:1, FP32 con PyTorch | No disponible en la informacion proporcionada | Hugging Face (`theforecastingcompany/t0-gamma`) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La documentación proporcionada solo permite comparar con el modelo base t0-gamma, del que ts-ara es una derivación cuantizada y optimizada. No se han facilitado datos de otros modelos fundacionales de series temporales para establecer una comparativa adicional.

## Limitaciones y advertencias

- No se documentan sesgos conocidos específicos, pero al ser un modelo entrenado sobre datos históricos de series temporales puede heredar sesgos presentes en esos datos, especialmente en dominios con eventos extremos poco representados.
- Riesgo de alucinación en el sentido de pronósticos plausibles pero incorrectos: la calibración conformal mitiga la infracobertura de intervalos, pero no garantiza la exactitud puntual fuera de la distribución de entrenamiento.
- El rendimiento zero-shot puede degradarse en series con patrones muy distintos a los vistos durante el preentrenamiento; se recomienda validar con datos propios antes de producción.
- La cobertura de intervalos bajo cambio de distribución se recupera hasta el 80,2 %, pero no alcanza el 100 %; los intervalos deben tratarse como estimaciones calibradas, no como garantías.
- La variante INT8 mantiene en FP32 los nodos críticos para evitar la amplificación de colas, pero puede presentar diferencias numéricas frente a FP32 en casos límite.
- No se dispone de información sobre idiomas ni sobre capacidades lingüísticas, ya que el modelo no procesa texto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base t0-gamma, cuya licencia no se detalla en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía muy limitada y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/funara/ts-ara
- Modelo base: https://huggingface.co/theforecastingcompany/t0-gamma
- Paper de calibración conformal CQR (Romano et al., 2019): https://arxiv.org/abs/1905.03222
- Paper de Adaptive Conformal Inference (Gibbs y Candès, 2021): https://arxiv.org/abs/2106.00170
- Paper de DtACI (Gibbs y Candès, 2024): https://arxiv.org/abs/2208.08401
- Referencia sobre Vincentization (Lichtendahl et al., 2013): https://pubsonline.informs.org/doi/10.1287/mnsc.1120.1667
- Referencias adicionales citadas en los tags del repositorio: https://arxiv.org/abs/2609.24559, https://arxiv.org/abs/2211.10438, https://arxiv.org/abs/2306.11695, https://arxiv.org/abs/2602.02599, https://arxiv.org/abs/2509.26468
- Documentación de fev-bench: https://auto.gluon.ai/dev/tutorials/timeseries/f
