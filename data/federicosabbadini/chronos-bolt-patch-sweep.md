# federicosabbadini/chronos-bolt-patch-sweep

## Resumen

`federicosabbadini/chronos-bolt-patch-sweep` es un conjunto de variantes del modelo Chronos-Bolt Tiny (~8,7 millones de parámetros) desarrollado por Federico Sabbadini para investigar el fenómeno de **aliasing estructural** en la predicción de series temporales. El modelo base, creado por Amazon Science, emplea una arquitectura basada en T5 que tokeniza series temporales mediante parches; este repositorio modifica sistemáticamente el tamaño de parche (P) y el stride (S) para estudiar cómo esa geometría introduce artefactos dependientes de la frecuencia en las predicciones.

Cada subcarpeta del repositorio contiene un modelo entrenado desde cero con la misma configuración de entrenamiento (100.000 pasos, datos oficiales de preentrenamiento de Chronos) y solo varía la combinación (P, S). El objetivo es aislar el efecto de la geometría de parcheo en el rendimiento y en los patrones de aliasing, proporcionando así una herramienta de análisis para la comunidad de forecasting. Aunque no es un modelo de producción, su licencia Apache-2.0 y su pequeño tamaño lo hacen accesible para experimentación en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) basada en Chronos-Bolt Tiny |
| Parametros totales | ~8,7 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (observaciones de la serie) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa series temporales numericas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Chronos-Bolt Tiny, un transformer T5 adaptado para series temporales. Las series se dividen en parches de tamaño P con un stride S, y cada parche se proyecta a un token de entrada. El modelo se entrena con una pérdida de verosimilitud sobre cuantiles (9 cuantiles de 0,1 a 0,9), lo que permite generar predicciones probabilísticas.

El entrenamiento se realizó desde cero (inicialización aleatoria) sobre el corpus oficial de preentrenamiento de Chronos, compuesto por TSMixup (10 millones de series) y KernelSynth (1 millón de series) en proporción 9:1. Se usaron 100.000 pasos con AdamW (lr=1e-3, decaimiento lineal, sin warmup), batch size 32, precisión fp32 con multiplicaciones TF32 en GPUs Ampere o superiores, contexto de 2048 tokens y horizonte de predicción de 64. La semilla fija (42) garantiza que las diferencias entre variantes se deban únicamente a la geometría de parcheo. Cada subcarpeta incluye un `run_config.json` con la traza completa del entrenamiento.

## Capacidades

- Prediccion de series temporales univariantes con horizonte fijo de 64 pasos.
- Salida probabilistica mediante 9 cuantiles (0,1 a 0,9), permitiendo intervalos de confianza.
- Soporte para diferentes configuraciones de parcheo (P, S) que afectan la resolucion temporal y el solapamiento entre parches.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni vision.
- Capacidad multilingue: no aplica, ya que la entrada son valores numericos.
- Capacidad especial: disenado para estudiar el aliasing estructural, por lo que permite comparar el efecto de la geometria de parches en la calidad de las predicciones.

## Casos de uso

- Investigacion academica sobre forecasting: permite analizar como el tamaño y el stride de los parches introducen artefactos de frecuencia, util para disenar arquitecturas de tokenizacion mas robustas.
- Comparacion de configuraciones de parcheo: los 11 modelos disponibles (P de 8 a 32, S de 4 a 32) sirven como banco de pruebas para seleccionar la geometria optima en tareas especificas de prediccion.
- Benchmarking de modelos de series temporales: al ser ligero (~34 MB por variante), puede integrarse en pipelines de evaluacion rapida en CPU o GPU de baja capacidad.
- Ensenanza y divulgacion: como ejemplo didactico de como la tokenizacion afecta al rendimiento de modelos de forecasting basados en transformers.
- Validacion de hipotesis sobre aliasing: los investigadores pueden reproducir los experimentos del autor y extenderlos a otros datasets o dominios.
- Prototipado de sistemas de prediccion a corto plazo: aunque no es un modelo de produccion, su rapidez de inferencia permite probar conceptos de prediccion de demanda o consumo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas comparativas (como MASE, WQL o CRPS) frente a otros modelos, ni comparaciones con el Chronos-Bolt Tiny original. Los unicos datos de rendimiento son las curvas de perdida de entrenamiento (`loss_history.npy` y `loss_curve.png`) por variante, que no constituyen una evaluacion estandarizada.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB, ya que cada modelo pesa ~34 MB en safetensors y la arquitectura tiene solo 8,7 millones de parametros.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA T4, GTX 1650) o incluso CPU, gracias al pequeño tamaño.
- Compatible con hardware de consumo: si, puede ejecutarse en una Raspberry Pi o en un portatil sin GPU dedicada.
- Opciones de despliegue: se usa la libreria `chronos-forecasting` (PyPI) con `BaseChronosPipeline.from_pretrained(...)`. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles, pero por el tamaño se espera una inferencia en milisegundos por serie en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chronos-bolt-patch-sweep (este) | ~8,7 M | 2048 | Variantes de parcheo para estudio de aliasing | Apache-2.0 | Hugging Face |
| amazon/chronos-bolt-tiny | ~8,7 M | 2048 | Modelo base de forecasting con parcheo fijo | Apache-2.0 | Hugging Face |
| amazon/chronos-bolt-base | ~200 M (estimado) | 2048 | Forecasting con mayor capacidad | Apache-2.0 | Hugging Face |

La comparativa se limita a la familia Chronos-Bolt, ya que no se dispone de datos de otros modelos de forecasting (como TimesFM o Lag-Llama) en la informacion proporcionada. La principal diferencia con el modelo base es que este repositorio ofrece multiples configuraciones de parcheo, mientras que el base usa una unica geometria predefinida.

## Limitaciones y advertencias

- Modelo de investigacion, no disenado para uso en produccion; su precision puede ser inferior a modelos de mayor tamano.
- Entrenado exclusivamente con datos sinteticos (TSMixup y KernelSynth), lo que puede limitar su generalizacion a series temporales reales con patrones complejos.
- El estudio se centra en el aliasing estructural, por lo que las predicciones pueden presentar artefactos de frecuencia dependientes de la configuracion (P, S) elegida.
- No soporta entrada multimodal ni procesamiento de lenguaje natural; solo series numericas univariantes.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo derivado de Chronos, se deben respetar los terminos de la licencia original (tambien Apache-2.0).
- No se incluyen garantias de rendimiento ni soporte oficial; el autor es un investigador independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/federicosabbadini/chronos-bolt-patch-sweep
- Perfil del autor: https://huggingface.co/federicosabbadini
- Repositorio oficial de Chronos (Amazon Science): https://github.com/amazon-science/chronos-forecasting
- Paquete PyPI `chronos-forecasting`: https://pypi.org/project/chronos-forecasting/
- Blog post sobre Chronos-Bolt (referenciado en el repositorio oficial): no se ha localizado la URL directa en la informacion disponible.
