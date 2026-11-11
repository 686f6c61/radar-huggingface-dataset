# abel-lab/Simons-60M

## Resumen

Simons-60M es un modelo fundacional abierto para pronóstico probabilístico de series temporales, desarrollado por Abel AI Lab. Resuelve el problema de predecir la distribución futura de una o varias series temporales (no solo un valor puntual), devolviendo nueve cuantiles por paso temporal. Es relevante porque combina un tamaño compacto (60,3 millones de parámetros) con una ventana de contexto muy amplia (hasta 16.384 pasos) y soporte nativo de covariables conocidas en el futuro, algo poco habitual en modelos de su escala.

La arquitectura es un transformer causal que opera sobre parches de 32 pasos temporales, seguido de una capa de atención entre las variables de una misma serie. Admite series univariantes y multivariantes (hasta 32 variables) y hasta 16 covariables conocidas en el futuro, numéricas o categóricas, marcando los valores ausentes con NaN. El modelo se distribuye con pesos en safetensors y una librería propia (`simons`, versión 0.1.0 o superior) para inferencia y entrenamiento en PyTorch, sobre CPU o GPU.

El modelo forma parte de la familia Simons 1, que incluye cuatro tamaños, y se publica bajo licencia OpenMDW-1.1. Su interés práctico está en que ofrece pronóstico probabilístico con covariables a un coste computacional bajo: según el autor, en una A100 el modelo de 297M recorre un benchmark completo en minutos, aproximadamente diez veces más rápido que modelos de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atención entre variables |
| Parametros totales | 60.319.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 16.384 pasos temporales de historial; 512 pasos por forward pass |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales; no disponible en la metainformacion) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal que tokeniza la serie temporal en parches de 32 pasos y procesa la secuencia de parches con 8 capas, anchura 704 y 11 cabezas de atención. Tras el codificador temporal, una capa de atención opera sobre las variables de una misma serie, lo que permite modelar dependencias multivariantes. La salida son 9 cuantiles (0,1 a 0,9), de modo que el modelo produce una distribución predictiva completa en lugar de una estimación puntual. La ventana de contexto alcanza 16.384 pasos de historial y cada forward pass genera 512 pasos de horizonte; horizontes más largos se construyen bloque a bloque. Admite hasta 32 variables y hasta 16 covariables conocidas en el futuro; las covariables solo pasadas se aceptan pero se descartan.

El entrenamiento consta de cuatro etapas, desde un preentrenamiento sintético hasta un post-entrenamiento sobre datos reales. Los pesos publicados son la media uniforme de las dos continuaciones finales (model soup). Los datos de preentrenamiento públicos están en el dataset `abel-lab/Simons-Pretrain` e incluyen series sintéticas generadas por los generadores abiertos del repositorio (`src/simons/synth`), con covariables sintéticas conocidas en el futuro. La model card no detalla el número total de tokens de entrenamiento ni la composición exacta del corpus real, por lo que esos datos no están disponibles.

## Capacidades

- Pronóstico probabilístico de series temporales: devuelve 9 cuantiles por paso de horizonte, lo que permite construir intervalos de predicción y métricas como CRPS.
- Series univariantes y multivariantes: hasta 32 variables por serie.
- Covariables conocidas en el futuro: hasta 16 por serie, numéricas o categóricas (por ejemplo, festivos, promociones o calendarios).
- Manejo de valores ausentes mediante NaN en la entrada.
- Contexto largo: hasta 16.384 pasos de historial, útil para estacionalidades anuales o series de alta frecuencia.
- Pronóstico de horizontes largos mediante generación bloque a bloque (512 pasos por forward pass).
- Inferencia en CPU o GPU con PyTorch a través del paquete `simons`.
- No dispone de generación de texto, tool calling, capacidades de agente ni visión: es un modelo exclusivamente numérico para series temporales.

## Casos de uso

- Previsión de demanda en retail: el modelo puede estimar la distribución de ventas por producto y tienda usando el historial y covariables conocidas como festivos o promociones planificadas, gracias a su soporte de covariables futuras y a una ventana de hasta 16.384 pasos.
- Planificación energética: pronóstico probabilístico de carga eléctrica o generación renovable con series multivariantes (varias subestaciones o parques) y variables exógenas de calendario, aprovechando la atención entre variables.
- Gestión de inventario y aprovisionamiento: los cuantiles de salida permiten fijar niveles de stock asociados a un nivel de servicio objetivo (por ejemplo, el cuantil 0,9) en lugar de depender de una predicción puntual.
- Monitorización de infraestructura y SRE: predicción de métricas de latencia, tráfico o uso de recursos con intervalos de confianza, para detectar desviaciones anómalas respecto a la distribución esperada.
- Pronóstico financiero de alta frecuencia: series con muchos puntos y patrones estacionales, donde el contexto largo y el bajo coste de inferencia permiten reentrenar o recalibrar con frecuencia.
- Predicción meteorológica y de afluencia: series con fuerte estacionalidad y covariables exógenas conocidas (calendario, temperatura prevista como covariable futura) para planificación de capacidad.
- Investigación en series temporales: modelo base ligero para experimentar con fine-tuning sobre dominios concretos, ya que el repositorio incluye código de entrenamiento y documentación de las etapas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6812 |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4654 |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 47,59 |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 36,26 |

En eficiencia, el autor indica que en una A100 el modelo de 297M recorre un benchmark completo en minutos, aproximadamente diez veces más rápido que modelos de tamaño similar. No se proporcionan cifras de latencia o throughput específicas para Simons-60M.

## Requisitos de hardware

- VRAM estimada: con 60,3M parámetros en precisión de 32 bits, los pesos ocupan unos 0,24 GB; en 16 bits, unos 0,12 GB. El consumo real depende del tamaño de lote y de la longitud de contexto, no disponible en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; el modelo está diseñado para ejecutarse también en CPU. Para lotes grandes o contextos de 16.384 pasos conviene una GPU de datacenter (A100, H100) o una RTX 4090.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: el paquete oficial `simons` (PyTorch) sobre CPU o GPU; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se publican cifras para este tamaño concreto; el autor solo aporta la comparación relativa de eficiencia para el modelo de 297M en una A100.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto o licencia de modelos comparables (por ejemplo, otros modelos fundacionales de series temporales de la familia Simons o de terceros). La model card menciona que Simons-297M se compara con "cuatro modelos ampliamente usados" en los leaderboards de GIFT-Eval, fev-bench y TIME, pero no se detallan sus especificaciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-60M | 60,3M | 16.384 pasos | openmdw-1.1 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y figuran como no verificados; conviene reproducirlos con el código oficial de GIFT-Eval y fev-bench antes de tomar decisiones de producción.
- Es un modelo exclusivamente de series temporales: no procesa texto, imágenes ni audio, y no admite tool calling ni razonamiento multi-paso.
- El límite de 32 variables y 16 covariables futuras por serie puede ser insuficiente en dominios con muchas señales exógenas.
- La ventana de 16.384 pasos, aunque amplia, impone un límite al historial útil; series más largas requieren truncado o agregación.
- La model card no detalla sesgos ni el impacto de dominios poco representados en el preentrenamiento; al entrenarse en parte con datos sintéticos, puede haber desajustes con distribuciones reales muy específicas.
- Riesgo de calibración deficiente de los cuantiles en series con cambios de régimen o valores atípicos no vistos durante el entrenamiento.
- La licencia OpenMDW-1.1 debe revisarse antes de un uso comercial; no se detallan en la información disponible las restricciones concretas de atribución o redistribución.
- La librería `simons` está en versión 0.1.0 o superior, por lo que la API puede cambiar; no se documentan integraciones con servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-60M
- Repositorio GitHub (inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Post de presentación: https://abel.ai/research/introducing-simons/
- Colección Simons 1 (cuatro tamaños y datos): https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Simons Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Documentación de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Documentación del modelo: https://github.com/Abel-ai-lab/Simons/blob/main/docs/MODEL.md
- Documentación de entrenamiento: https://github.com/Abel-ai-lab/Simons/blob/main/docs/TRAINING.md
- Documentación de datos: https://github.com/Abel-ai-lab/Simons/blob/main/docs/DATA.md
- Código de GIFT-Eval: https://github.com/SalesforceAIResearch/gift-eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
