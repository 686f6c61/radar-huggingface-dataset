# nesoai-qa-org/amazon-chronos-t5-small

## Resumen

`nesoai-qa-org/amazon-chronos-t5-small` es una república (mirror) no oficial en Hugging Face del modelo **Chronos-T5 Small** de Amazon Science, un modelo fundacional preentrenado para **previsión de series temporales** (pipeline `time-series-forecasting`). El repositorio conserva el nombre y los pesos del original `amazon/chronos-t5-small`: 46.154.240 parámetros en formato safetensors y 0,2 GB de tamaño total.

Chronos aborda el forecasting tratando la serie numérica como si fuera texto: la serie se escala y se cuantiza en una secuencia de tokens (vocabulario de 4096), y un modelo de lenguaje entrenado con entropía cruzada aprende a predecirla. En inferencia se muestrean múltiples trayectorias futuras, lo que produce una **distribución predictiva** en lugar de un único punto, y de ahí se derivan cuantiles e intervalos de confianza.

Su relevancia práctica está en que es un modelo *zero-shot*: no requiere entrenamiento específico por serie y su tamaño (46 M de parámetros) permite ejecutarlo en CPU o en cualquier GPU de consumo. Ahora bien, la propia model card advierte de que la familia ha evolucionado hacia **Chronos-Bolt** (hasta 250 veces más rápido y un 5 % menos de error) y **Chronos-2**, por lo que este checkpoint debe considerarse una referencia histórica o una línea base de bajo coste, no el estado del arte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer T5 encoder-decoder (base: `t5-efficient-small`), con vocabulario reducido a 4096 tokens en lugar de 32128 |
| Parámetros totales | 46.154.240 (≈46 M, dato real de safetensors) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no se documentan variantes cuantizadas (GGUF, AWQ, GPTQ, etc.); el ejemplo oficial carga con `torch_dtype=torch.bfloat16` |
| Idiomas soportados | no disponible; el modelo no procesa texto, opera sobre secuencias numéricas de series temporales |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: librería `chronos-forecasting`, pipeline `time-series-forecasting`, tamaño del repo 0,2 GB, 0 descargas y 2 likes en el momento de la consulta, creado el 2026-10-27 y actualizado el mismo día.

## Arquitectura y entrenamiento

Chronos-T5 reutiliza la arquitectura T5 (encoder-decoder, paper arXiv:1910.10683) con una modificación clave: el vocabulario se reduce de 32.128 a 4.096 tokens, lo que disminuye el número de parámetros del embedding y de la cabeza de salida. El *tokenizador* no es textual: la serie histórica se normaliza (escalado) y se cuantiza en bins, generando una secuencia de tokens que se alimenta al modelo. El entrenamiento usa entropía cruzada sobre el siguiente token, igual que un LM. En inferencia, el modelo muestrea autorregresivamente varias trayectorias (`num_samples`) que se desmapean a valores numéricos; la distribución resultante permite calcular mediana, media y cuantiles arbitrarios (por ejemplo, el intervalo del 80 % con los cuantiles 0,1 / 0,5 / 0,9).

El corpus de entrenamiento descrito por los autores combina un gran conjunto de series temporales públicas y datos sintéticos generados con procesos gaussianos, una técnica de aumento de datos que aporta diversidad de patrones (tendencias, estacionalidades, ruido) sin depender solo de series reales. La model card no detalla el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si hubo etapas de ajuste fino con RLHF/DPO; esos datos deben consultarse en el paper (arXiv:2403.07815). El paquete de inferencia (`chronos-forecasting`) acepta como contexto un tensor 1D, una lista de tensores 1D o un tensor 2D con padding a la izquierda y lote en la primera dimensión, lo que permite procesar muchas series en paralelo.

## Capacidades

- Previsión de series temporales univariantes en modo *zero-shot*, sin reentrenamiento por serie.
- Forecasting probabilístico: muestreo de múltiples trayectorias y obtención de cuantiles, medianas e intervalos de predicción.
- Procesamiento por lotes de varias series independientes en una sola llamada mediante contexto 2D con padding a la izquierda.
- Manejo de series con tendencia y estacionalidad gracias al escalado previo y a la diversidad del corpus de entrenamiento (series reales más datos sintéticos de procesos gaussianos).
- Integración directa con el ecosistema Python de datos: el ejemplo oficial usa `ChronosPipeline.from_pretrained`, pandas y matplotlib.
- Ejecución en CPU o GPU con selección de precisión (`bfloat16`, `float32`) mediante `torch_dtype` y `device_map`.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso, agentes ni modo *thinking*.
- No genera texto, ni código, ni matemáticas simbólicas.
- No procesa imágenes, audio ni ningún otro modalidad distinta de la serie numérica.
- No se documenta en la información disponible soporte de covariables exógenas (festivos, promociones, variables meteorológicas).

## Casos de uso

- **Previsión de demanda en retail y e-commerce**: pasar el histórico de ventas por SKU como contexto y obtener la mediana y el intervalo del 80 % para las próximas N unidades de tiempo; el intervalo permite dimensionar stock de seguridad sin entrenar un modelo por producto.
- **Planificación de capacidad de infraestructura**: introducir métricas históricas (peticiones por segundo, uso de CPU, latencia p95) y proyectar las siguientes horas o días para alimentar reglas de autoescalado en Kubernetes; el bajo coste del modelo (46 M) permite reejecutarlo cada pocos minutos.
- **Detección de anomalías**: comparar el valor observado con la distribución predicha y marcar como anomalía cualquier observación fuera del intervalo de cuantiles configurado; útil en monitorización de fraude, sensores industriales o telemetría.
- **Línea base en pipelines de MLOps**: usar Chronos-T5 Small como referencia contra la que medir modelos específicos entrenados por serie, ya que se ejecuta en segundos y no requiere feature engineering.
- **Relleno de huecos e imputación en ETL**: dado un histórico con valores faltantes, generar una predicción para los huecos y sustituirlos por la mediana antes de cargar los datos en el almacén analítico.
- **Previsión financiera y de inventario en pymes**: al caber en CPU, puede desplegarse en un contenedor pequeño o en un servidor sin GPU para prever tesorería, facturación mensual o rotación de inventario a partir de un CSV.
- **Evaluación académica y docencia**: como modelo de 46 M con licencia Apache-2.0, sirve para reproducir experimentos del paper y para enseñar forecasting probabilístico sin infraestructura costosa.
- **Prototipado en Amazon SageMaker JumpStart**: la model card indica que los modelos Chronos originales y Chronos-Bolt están disponibles en JumpStart, lo que permite desplegar un endpoint de producción en pocas líneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este checkpoint en la información proporcionada. La model card no incluye cifras absolutas de error (MASE, WQL, CRPS) ni comparativas numéricas con otros modelos para `chronos-t5-small`.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | no aplica (no es un modelo de lenguaje) |
| fev-bench, GIFT-Eval, Chronos Benchmark II | no disponibles para este checkpoint; las cifras que cita el repositorio corresponden a Chronos-2 |
| Comparación con Chronos-Bolt small | la model card afirma que Bolt tiene un 5 % menos de error, es hasta 250 veces más rápido y 20 veces más eficiente en memoria que el Chronos original del mismo tamaño, pero sin cifras absolutas |

## Requisitos de hardware

- **VRAM estimada**: en `bfloat16`, los pesos ocupan aproximadamente 92 MB; en `float32`, unos 185 MB. Con *overhead* de activaciones y varias trayectorias muestreadas, el consumo se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- **GPU recomendadas**: cualquier GPU moderna sirve; el modelo es funcionalmente indistinguible en una RTX 4090, una A100 o una H100. La elección de GPU responde más al volumen de series concurrentes y a la latencia objetivo que al tamaño del modelo.
- **GPU de consumo**: sí, cabe holgadamente en tarjetas con 4-8 GB (RTX 3060, RTX 4060, GTX 1650) e incluso en GPUs integradas.
- **CPU**: es viable, y probablemente el modo de despliegue más razonable para este tamaño; también cabe en dispositivos de borde.
- **Opciones de despliegue**: el paquete oficial `chronos-forecasting` (`ChronosPipeline`) sobre PyTorch; contenedores propios con FastAPI o Batch; Amazon SageMaker JumpStart para los modelos Chronos y Chronos-Bolt. vLLM, TGI, llama.cpp y Ollama no aplican, al no ser un modelo de texto.
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia cualitativa, la model card sitúa a Chronos-Bolt hasta 250 veces más rápido que el Chronos original equivalente, lo que implica que la inferencia autorregresiva con múltiples muestras de este checkpoint es sensiblemente más lenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `nesoai-qa-org/amazon-chronos-t5-small` (este) | 46 M | no disponible | apache-2.0 | mirror de terceros, 0 descargas | Copia no oficial del original |
| `amazon/chronos-t5-small` | 46 M | no disponible | no verificada en la información | repo oficial de Amazon | Misma arquitectura y pesos; referencia canónica |
| `amazon/chronos-t5-mini` | 20 M | no disponible | no verificada en la información | repo oficial | Menor coste, presumiblemente menor precisión |
| `amazon/chronos-t5-base` | 200 M | no disponible | no verificada en la información | repo oficial | Más capacidad a costa de 4 veces más parámetros |
| `amazon/chronos-bolt-small` | no disponible | no disponible | no verificada en la información | repo oficial | 5 % menos de error, hasta 250× más rápido y 20× más eficiente en memoria según la model card |
| `amazon/chronos-2` | no disponible | no disponible | no verificada en la información | repo oficial | Marcado como `new_version`; el repositorio lo sitúa como mejor modelo en fev-bench, GIFT-Eval y Chronos Benchmark II |

## Limitaciones y advertencias

- **Repositorio no oficial**: `nesoai-qa-org` es un tercero; el repo tiene 0 descargas y 2 likes, y no hay verificación de que los pesos coincidan bit a bit con `amazon/chronos-t5-small`. Para producción, usar el repositorio oficial de Amazon.
- **Fecha anómala**: el repositorio figura como creado y actualizado el 2026-10-27, una fecha futura que sugiere un artefacto de automatización o de *testing*; conviene tratarlo con cautela.
- **Modelo superado**: la propia model card recomienda migrar a Chronos-Bolt o a Chronos-2; mantener este checkpoint implica asumir un coste de inferencia mayor y una precisión inferior.
- **Riesgo de predicciones plausibles pero erróneas**: en cambios de régimen, series con tendencia explosiva, eventos exógenos (festivos, promociones, huelgas) o histórico muy corto, la distribución muestreada puede ser estrecha y aun así estar equivocada; los intervalos no capturan incertidumbre estructural.
- **Ventana de contexto no documentada**: la información disponible no especifica la longitud máxima de histórico aceptada, lo que limita la planificación de arquitecturas que dependan de contextos muy largos.
- **Sin covariables**: no se documenta soporte de variables exógenas, lo que descarta casos de uso que dependan de regresores externos.
- **Univariante por serie**: el procesamiento por lotes trata cada serie de forma independiente; no hay modelado conjunto de dependencias entre series.
- **Licencia**: apache-2.0 permite uso comercial, modificación y redistribución con aviso de licencia; la licencia del mirror es la declarada en el repositorio, pero la procedencia de los pesos es responsabilidad de quien lo despliega.
- **Idioma**: el campo de idiomas no aplica realmente; no debe evaluarse como modelo multilingüe ni usarse para tareas de texto.

## Enlaces

- Repositorio en Hugging Face (este checkpoint): https://huggingface.co/nesoai-qa-org/amazon-chronos-t5-small
- Repositorio oficial del modelo: https://huggingface.co/amazon/chronos-t5-small
- Chronos-Bolt Small: https://huggingface.co/amazon/chronos-bolt-small
- Chronos-2: https://huggingface.co/amazon/chronos-2
- Repositorio de código `chronos-forecasting`: https://github.com/amazon-science/chronos-forecasting
- Notebook de despliegue en Amazon SageMaker: https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/deploy-chronos-to-amazon-sagemaker.ipynb
- Paper "Chronos: Learning the Language of Time Series": https://arxiv.org/abs/2403.07815
- Paper de la arquitectura T5: https://arxiv.org/abs/1910.10683
- Sitio del proyecto Chronos: https://chronos-ts.ai/
- Mirror en AutoGluon: https://huggingface.co/autogluon/chronos-t5-small
