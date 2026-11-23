# abel-lab/Simons-60M

## Resumen

Simons-60M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, orientado a la previsión probabilística (probabilistic forecasting) tanto de series univariantes como multivariantes. Con 60,3 millones de parámetros, es la variante más pequeña de la familia Simons 1, que también incluye modelos de mayor tamaño (hasta Simons-297M). El modelo resuelve el problema de generar distribuciones predictivas futuras en lugar de una única trayectoria puntual, emitiendo nueve cuantiles (0,1 a 0,9) por paso temporal.

La arquitectura combina un transformer causal que opera sobre parches (patches) de 32 pasos temporales con una capa de atención posterior entre las variates de una misma serie, lo que permite modelar dependencias multivariantes. Soporta hasta 16.384 pasos de historial y hasta 32 variates, además de hasta 16 covariables conocidas en el futuro (numéricas o categóricas), lo que lo hace adecuado para escenarios con información exógena planificada.

Su relevancia actual radica en que se distribuye como modelo abierto (licencia OpenMDW-1.1) con código de inferencia y entrenamiento público, datos de preentrenamiento liberados parcialmente y resultados reportados en los principales leaderboards de forecasting (GIFT-Eval, fev-bench y TIME). Además, el autor declara una eficiencia notable: en una A100, Simons-297M completa un benchmark en minutos, aproximadamente diez veces más rápido que modelos de tamaño similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atención entre variates; 8 capas, ancho 704, 11 cabezas |
| Parametros totales | 60.319.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 16.384 pasos temporales de historial; 512 pasos por forward pass (horizontes mayores por bloques) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería `simons`, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer causal que tokeniza la serie temporal en parches de 32 pasos y aplica atención a lo largo del eje temporal, seguida de una capa de atención transversal entre las variates de una misma serie. Esta combinación permite capturar tanto dinámicas temporales de largo alcance como correlaciones entre canales. La entrada admite hasta 32 variates y hasta 16 covariables conocidas en el futuro (numéricas o categóricas); los valores ausentes se marcan con NaN y las covariables solo pasadas se aceptan pero se descartan. La salida son 9 cuantiles (0,1 a 0,9), lo que habilita previsión probabilística directamente.

El entrenamiento se realizó en cuatro etapas, desde preentrenamiento sobre datos sintéticos hasta post-entrenamiento con datos reales. Los pesos liberados son la media uniforme de las dos continuaciones finales (model soup), una técnica de promediado de pesos que suele mejorar robustez y calibración. El conjunto de datos público de preentrenamiento se publica como `abel-lab/Simons-Pretrain`. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon RLHF o DPO (técnicas no habituales en forecasting).

## Capacidades

- Previsión probabilística de series temporales: emite 9 cuantiles por paso, permitiendo construir intervalos de predicción calibrados.
- Series univariantes y multivariantes: soporta hasta 32 variates por serie.
- Covariables conocidas en el futuro: hasta 16, numéricas o categóricas, para escenarios con información exógena planificada.
- Manejo de valores ausentes mediante NaN.
- Contexto largo: hasta 16.384 pasos de historial.
- Horizontes largos mediante predicción por bloques de 512 pasos.
- Inferencia en CPU o GPU con la librería `simons` (versión 0.1.0 o superior) sobre PyTorch.
- Explorador de previsión interactivo en el navegador (Simons Forecast Explorer).
- No dispone de capacidades de generación de texto, código, matemáticas simbólicas, visión, audio, tool calling ni razonamiento agéntico, al ser un modelo especializado en series temporales.

## Casos de uso

- Previsión de demanda energética: usar el historial de consumo (hasta 16.384 pasos) junto con covariables conocidas como calendario laboral, festivos o temperatura prevista para generar cuantiles de demanda horaria; los intervalos permiten dimensionar reservas de capacidad con niveles de confianza explícitos.
- Planificación de inventario y cadena de suministro: alimentar el modelo con ventas históricas multivariantes por producto y covariables futuras (promociones, precios planificados) para obtener distribuciones de demanda y fijar niveles de stock con criterios de servicio.
- Previsión meteorológica y variables ambientales: modelar múltiples estaciones como variates con contexto largo, aprovechando la atención entre variates para capturar correlaciones espaciales y emitir cuantiles de temperatura o precipitación.
- Monitorización de infraestructuras y capacidad de red: predecir tráfico, latencia o utilización de recursos con covariables de mantenimiento planificado, usando los cuantiles superiores para alertas tempranas de saturación.
- Series financieras y de riesgo: generar distribuciones de retornos o volúmenes a horizontes cortos y medios, empleando los cuantiles extremos para escenarios de estrés; requiere validación adicional por la naturaleza no estacionaria de estos datos.
- Investigación en forecasting: servir como baseline reproducible y abierto para comparar métodos en GIFT-Eval, fev-bench y TIME, con código de entrenamiento e inferencia disponible para reproducir y extender experimentos.
- Previsión con datos incompletos: gracias al marcado de valores ausentes con NaN, es aplicable a sensores con caídas o registros irregulares sin necesidad de imputación previa obligatoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6812 |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4654 |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 47,59 |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 36,26 |
| TIME | MASE (relativo a Seasonal Naive) | 0,6427 |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5394 |

En eficiencia, el autor declara que Simons-297M completa la previsión de un benchmark entero en minutos sobre una A100, aproximadamente diez veces más rápido que modelos de tamaño similar. No se proporcionan cifras de latencia ni throughput específicas para Simons-60M en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 60,3 M de parámetros en safetensors, los pesos en FP32 ocupan aproximadamente 0,24 GB; en FP16/BF16, unos 0,12 GB. La memoria adicional depende del tamaño del batch y de la longitud del contexto (hasta 16.384 pasos), que es el factor dominante.
- GPU recomendadas: cualquier GPU con suficiente memoria para el batch y contexto elegidos; una A100 es el hardware de referencia citado por el autor para las mediciones de eficiencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) para contextos y batches moderados, dado el reducido tamaño de pesos; la información disponible no detalla umbrales exactos.
- Opciones de despliegue: paquete `simons` (v0.1.0+) sobre PyTorch, en CPU o GPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles para este tamaño concreto; el autor solo reporta la comparación relativa de Simons-297M frente a modelos similares.

## Comparativa con modelos similares

La información proporcionada no incluye una comparación numérica directa con modelos alternativos concretos. El autor menciona que Simons-297M se posiciona frente a "cuatro modelos ampliamente usados" en los leaderboards, pero no se detallan sus nombres ni sus métricas en la documentación disponible.

| Modelo | Parametros | Contexto | Licencia | Datos de benchmark |
|---|---|---|---|---|
| Simons-60M | 60,3 M | 16.384 pasos | OpenMDW-1.1 | GIFT-Eval, fev-bench, TIME (ver tabla) |
| Simons-297M | 297 M (declarado) | no disponible | OpenMDW-1.1 | Posición en leaderboards citada, sin cifras |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resultados de benchmarks no verificados de forma independiente (`verified: false`); deben tratarse como declaraciones del autor.
- Modelo especializado exclusivamente en series temporales: no procesa texto, imágenes ni audio, y no soporta tool calling ni comportamiento agéntico.
- Límite de 32 variates y 16 covariables futuras por serie; series con más canales requieren agrupación o selección previa.
- Horizontes superiores a 512 pasos se generan por bloques, lo que puede introducir inconsistencias entre bloques sucesivos.
- El contexto máximo es de 16.384 pasos; series más largas deben truncarse o resumirse.
- No se documentan sesgos específicos ni comportamiento en dominios fuera de distribución; la calibración de cuantiles debe validarse en cada caso de uso.
- Riesgo de degradación en series no estacionarias o con cambios de régimen no representados en los datos de entrenamiento.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la información disponible no detalla sus términos concretos.
- No se especifican requisitos de atribución ni restricciones adicionales más allá del identificador de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-60M
- Repositorio GitHub (código de inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Guía de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Colección Simons 1 (cuatro tamaños y datos): https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Entrada de blog de presentación: https://abel.ai/research/introducing-simons/
- Explorador de previsiones: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
