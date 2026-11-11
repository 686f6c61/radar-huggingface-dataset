# abel-lab/Simons-178M

## Resumen

Simons-178M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, orientado a la previsión probabilística tanto de series univariantes como multivariantes. Con 177,7 millones de parámetros, se posiciona como la variante intermedia de la familia Simons 1, que incluye cuatro tamaños publicados junto con sus datos de entrenamiento. El modelo resuelve el problema de generar distribuciones predictivas futuras (no solo puntos) sobre horizontes largos, incorporando covariables conocidas en el futuro, algo crítico en dominios como energía, retail o logística.

La arquitectura combina un transformer causal que opera sobre parches de 32 pasos temporales con una capa de atención entre las variables de una misma serie, lo que permite modelar dependencias multivariantes de forma explícita. Soporta hasta 32.768 pasos de historia y 32 variables por serie, además de hasta 16 covariables futuras numéricas o categóricas. La salida son 9 cuantiles (0,1 a 0,9), lo que habilita directamente la previsión probabilística sin capas adicionales.

Su relevancia actual radica en que es un modelo abierto (licencia OpenMDW-1.1) con código de inferencia y entrenamiento público, resultados declarados en los leaderboards de GIFT-Eval y fev-bench, y un rendimiento declarado notablemente superior al baseline Seasonal Naive. La eficiencia es otro de sus puntos fuertes según el autor: en una A100, la variante de 297M recorre un benchmark completo en minutos, unas diez veces más rápido que modelos de tamaño similar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + atención entre variables; 12 capas, anchura 1024, 16 cabezas |
| Parámetros totales | 177.746.208 (177,7M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 pasos temporales de historia; 512 pasos por forward pass (horizontes mayores por bloques) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no de texto) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería `simons`, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer causal que tokeniza la serie en parches de 32 pasos temporales y aplica después una capa de atención sobre las variables de cada serie, lo que le permite capturar tanto dinámicas temporales locales como correlaciones cruzadas entre variables. Tiene 12 capas, anchura de 1024 y 16 cabezas de atención. La entrada admite hasta 32 variables y hasta 16 covariables conocidas en el futuro (numéricas o categóricas); los valores ausentes se marcan con NaN y las covariables solo pasadas se aceptan pero se descartan. La salida son 9 cuantiles (0,1, 0,2, …, 0,9).

El entrenamiento se organiza en cuatro etapas, desde un preentrenamiento sintético hasta un post-entrenamiento sobre datos reales. Los pesos publicados son la media uniforme de dos continuaciones del entrenamiento (model soups), una técnica de promediado de pesos que suele mejorar robustez y calibración. Los datos de preentrenamiento públicos están disponibles en el dataset `abel-lab/Simons-Pretrain`, y el código de generación de series sintéticas se publica en el repositorio (`src/simons/synth`). No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset real.

## Capacidades

- Previsión probabilística de series temporales: genera 9 cuantiles por paso futuro, lo que permite construir intervalos de predicción y distribuciones completas.
- Series univariantes y multivariantes: hasta 32 variables por serie con atención cruzada entre ellas.
- Covariables conocidas en el futuro: hasta 16 por serie, numéricas o categóricas, útiles para calendarios, promociones, festivos o variables exógenas planificadas.
- Manejo de valores ausentes mediante NaN en la entrada.
- Horizontes largos: contexto de hasta 32.768 pasos y generación por bloques de 512 pasos para horizontes mayores.
- Preentrenamiento fundacional: no requiere entrenamiento específico por dominio para obtener previsiones razonables (zero-shot), aunque el repositorio documenta fine-tuning.
- Inferencia en CPU o GPU con el paquete `simons` (versión 0.1.0 o superior).
- No soporta tool calling, agentes, ni capacidades multimodales de texto, visión o audio: es un modelo especializado en series temporales.

## Casos de uso

- Previsión de demanda en retail: el modelo puede ingerir el histórico de ventas por producto y covariables futuras como promociones o festivos para generar cuantiles de demanda, lo que permite dimensionar stock con niveles de servicio explícitos.
- Gestión de energía y renovables: con series multivariantes de generación y consumo y covariables meteorológicas previstas, se obtienen intervalos de predicción útiles para programación de dispatch y reservas.
- Planificación financiera y tesorería: previsión de flujos de caja o ingresos con bandas de confianza a partir de históricos largos (hasta 32.768 pasos), adecuada para escenarios de estrés.
- Monitorización industrial y mantenimiento predictivo: previsión de sensores multivariantes con covariables de régimen de operación para detectar desviaciones respecto a la distribución esperada.
- Logística y planificación de capacidad: previsión de volúmenes de envío por ruta o centro con horizontes de varios cientos de pasos, generados por bloques de 512.
- Investigación en series temporales: al ser un modelo fundacional abierto con datos y código de entrenamiento publicados, sirve como base para experimentos de fine-tuning y comparativas reproducibles.
- Evaluación zero-shot en dominios nuevos: su naturaleza fundacional permite obtener previsiones probabilísticas sin entrenamiento específico, útil para prototipado rápido antes de invertir en ajuste fino.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor | Fuente |
|---|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6754 | Código oficial de GIFT-Eval |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4609 | Código oficial de GIFT-Eval |
| fev-bench | SQL skill score (%) relativo a Seasonal Naive | 48,57 | Leaderboard fev-bench |
| fev-bench | MASE skill score (%) relativo a Seasonal Naive | 37,43 | Leaderboard fev-bench |

El autor indica además que los cuatro modelos Simons figuran en el leaderboard oficial de TIME y que, en una A100, la variante de 297M recorre un benchmark completo en minutos (unas diez veces más rápido que modelos de tamaño similar). No se proporcionan en la información disponible resultados comparativos numéricos frente a modelos concretos en esos leaderboards.

## Requisitos de hardware

- VRAM estimada para inferencia: con 177,7M parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,7 GB; en fp16/bf16 alrededor de 0,35 GB. El consumo real depende del tamaño de lote, del contexto (hasta 32.768 pasos) y del número de variables, que dominan la memoria de activaciones.
- GPU recomendadas: el autor reporta tiempos de inferencia en una A100; cualquier GPU con suficiente memoria para el lote y contexto elegidos es válida. Para contextos largos y lotes grandes se recomienda A100/H100; para lotes pequeños basta una GPU consumer.
- Cabe en GPU consumer: sí, con toda probabilidad, dado el reducido tamaño de los pesos; la limitación vendrá del contexto y del lote, no del modelo en sí.
- Opciones de despliegue: el paquete oficial `simons` (PyTorch) sobre CPU o GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no se publican cifras concretas para esta variante; el autor menciona que la variante de 297M es aproximadamente diez veces más rápida que modelos de tamaño similar en una A100 al recorrer benchmarks completos.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados numéricos de modelos competidores para construir una comparativa rigurosa. Como referencia cualitativa, la familia Simons 1 incluye cuatro tamaños (este es el de 177,7M) y el autor sitúa a sus modelos en los leaderboards de GIFT-Eval, fev-bench y TIME entre las entradas de pesos abiertos. Para una comparación cuantitativa con alternativas de la misma categoría (modelos fundacionales de series temporales de tamaño similar) se recomienda consultar dichos leaderboards.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-178M | 177,7M | Hasta 32.768 pasos | OpenMDW-1.1 | Hugging Face, código en GitHub |
| Otras variantes Simons 1 | No disponible en detalle | No disponible en detalle | OpenMDW-1.1 | Colección Simons 1 en Hugging Face |
| Modelos competidores | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados (`verified: false`); conviene tratarlos con cautela hasta una replicación independiente.
- Es un modelo especializado en series temporales: no procesa texto, imágenes ni audio, y no soporta tool calling ni flujos de agentes.
- El límite de 32 variables y 16 covariables futuras por serie puede ser insuficiente en dominios con alta dimensionalidad; habría que agregar o seleccionar variables.
- El contexto máximo de 32.768 pasos y la generación por bloques de 512 implican que horizontes muy largos se construyen iterativamente, con posible acumulación de error.
- No se detalla en la información disponible la composición del dataset real de post-entrenamiento, lo que limita el análisis de sesgos por dominio (posible peor rendimiento en sectores poco representados).
- Riesgo de alucinación en sentido estadístico: el modelo puede producir previsiones con apariencia plausible pero mal calibradas en regímenes no vistos; se recomienda validación por dominio y monitorización de la calibración de cuantiles.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; no se detallan en la información disponible las restricciones concretas de atribución o redistribución.
- No se documentan cuantizaciones oficiales ni soporte en runtimes de inferencia alternativos, lo que puede limitar el despliegue en entornos no PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-178M
- Repositorio GitHub (inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Post de presentación: https://abel.ai/research/introducing-simons/
- Colección Simons 1: https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Simons Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Documentación de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Documentación del modelo: https://github.com/Abel-ai-lab/Simons/blob/main/docs/MODEL.md
- Documentación de entrenamiento: https://github.com/Abel-ai-lab/Simons/blob/main/docs/TRAINING.md
- Documentación de datos: https://github.com/Abel-ai-lab/Simons/blob/main/docs/DATA.md
- Código de GIFT-Eval: https://github.com/SalesforceAIResearch/gift-eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
