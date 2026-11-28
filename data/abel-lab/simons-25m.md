# abel-lab/Simons-25M

## Resumen

Simons-25M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, orientado a la previsión probabilística tanto de series univariantes como multivariantes con covariables conocidas en el futuro. Con 25,1 millones de parámetros, se posiciona como una alternativa ligera frente a los grandes modelos fundacionales de series temporales, manteniendo capacidad de contexto largo (hasta 16.384 pasos) y salida cuantílica.

La arquitectura combina un transformer causal que opera sobre parches de 32 pasos temporales con una capa de atención entre las variables de una misma serie, lo que le permite modelar dependencias cruzadas entre variates sin renunciar al modelado temporal local. Genera directamente 9 cuantiles (0,1 a 0,9), lo que lo hace apto para escenarios donde se necesita cuantificar incertidumbre y no solo un punto de predicción.

El modelo se distribuye bajo licencia OpenMDW-1.1, con pesos en formato safetensors y una librería propia (`simons`, versión 0.1.0 o superior) que corre sobre PyTorch en CPU o GPU. Su tamaño reducido (repo de 0,1 GB) permite desplegarlo en hardware modesto, lo que resulta relevante para equipos que quieren incorporar previsión probabilística sin infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + atencion entre variates; 12 capas, anchura 384, 6 cabezas |
| Parametros totales | 25.121.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 16.384 pasos temporales de historial; 512 pasos por forward pass |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Simons-25M es un transformer causal que tokeniza la serie temporal en parches de 32 pasos y aplica después una capa de atención transversal entre las variables de una misma serie. El modelo tiene 12 capas, anchura 384 y 6 cabezas de atención, con 25,1 M de parámetros en total. Admite hasta 32 variates y hasta 16 covariables conocidas en el futuro por serie, numéricas o categóricas, usando NaN para marcar valores ausentes; las covariables solo pasadas se aceptan y se descartan. La salida son 9 cuantiles (0,1 a 0,9), lo que habilita previsión probabilística directa.

El entrenamiento se organiza en cuatro etapas, desde preentrenamiento sintético hasta post-entrenamiento sobre datos reales. Los pesos publicados son la media uniforme de dos continuaciones del entrenamiento (model soups), una técnica de promediado de pesos que suele mejorar robustez y estabilidad. El corte de conocimiento de los datos reales de entrenamiento es octubre de 2026, con la mayoría de conjuntos de datos terminando antes; el autor publica el desglose por dominio en un CSV dentro del dataset `abel-lab/Simons-Pretrain`. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Previsión probabilística de series temporales univariantes y multivariantes.
- Salida de 9 cuantiles (0,1, 0,2, …, 0,9), útil para intervalos de predicción y decisiones bajo incertidumbre.
- Soporte de covariables conocidas en el futuro (hasta 16 por serie), numéricas o categóricas.
- Manejo de valores ausentes mediante NaN.
- Contexto largo de hasta 16.384 pasos, con generación de horizontes largos por bloques de 512 pasos.
- Atención entre variates, lo que permite modelar correlaciones entre series de un mismo sistema.
- Inferencia en CPU o GPU mediante PyTorch con el paquete `simons` (>= 0.1.0).
- Integraciones con TimeCopilot (FoundationForecast) y GluonTS (`SimonsPredictor`).
- No dispone de capacidades de generación de texto, código, visión ni tool calling: es un modelo puramente numérico de series temporales.

## Casos de uso

- Previsión de demanda minorista: el modelo puede tomar el histórico de ventas por producto y covariables como promociones o festivos conocidos de antemano, y devolver cuantiles de demanda para planificación de stock y gestión de roturas.
- Planificación energética: previsión de carga eléctrica o generación renovable con covariables meteorológicas conocidas (temperatura prevista, calendario) y salida cuantílica para dimensionar reservas y márgenes de seguridad.
- Gestión de inventario y cadena de suministro: previsión de series multivariantes (SKU, almacén, región) con atención entre variates para capturar correlaciones entre productos y reducir el error agregado.
- Monitorización de infraestructura y capacidad: previsión de métricas operativas (latencia, tráfico, uso de CPU) con contexto largo de hasta 16.384 pasos para capturar estacionalidades semanales y anuales.
- Previsión financiera de series de alta frecuencia: uso de horizontes largos por bloques de 512 pasos y salida cuantílica para modelar colas y riesgo en series de precios o volúmenes.
- Investigación en modelos fundacionales de series temporales: al ser un modelo pequeño (25 M) con pesos abiertos, sirve como base para experimentación, ablaciones y fine-tuning sobre dominios específicos con hardware limitado.
- Integración en pipelines de previsión existentes: a través de GluonTS (`SimonsPredictor`) o TimeCopilot, se puede incorporar en flujos ya establecidos sin reescribir la infraestructura.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Fuente |
|---|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,686 | GIFT-Eval leaderboard |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4683 | GIFT-Eval leaderboard |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 47,74 | fev-bench leaderboard |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 36,27 | fev-bench leaderboard |
| TIME | MASE (relativo a Seasonal Naive) | 0,6473 | TIME leaderboard |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5426 | TIME leaderboard |

No se han publicado en la información disponible resultados comparativos adicionales frente a otros modelos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 25,1 M de parámetros, los pesos en fp32 ocupan aproximadamente 100 MB; en fp16, unos 50 MB. La memoria adicional depende de la longitud de contexto y del número de variates, no del tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: PyTorch con el paquete `simons` (>= 0.1.0); integración con GluonTS (`SimonsPredictor`) y TimeCopilot (FoundationForecast). No se documentan en la información disponible soportes específicos para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento o licencia de modelos comparables de la misma categoría (modelos fundacionales de series temporales), por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, Simons-25M se sitúa en la franja de modelos fundacionales ligeros (decenas de millones de parámetros) con contexto largo y salida probabilística, frente a alternativas de mayor tamaño que requieren más recursos de inferencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-25M | 25,1 M | 16.384 pasos | openmdw-1.1 | Hugging Face, PyPI (`simons-forecasting`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); conviene tratarlos con cautela hasta una validación independiente.
- El corte de conocimiento de los datos reales de entrenamiento es octubre de 2026, con la mayoría de datasets terminando antes; el rendimiento puede degradarse en regímenes o dominios que no estén representados en el entrenamiento.
- La salida se limita a 9 cuantiles; no ofrece densidades completas ni intervalos fuera del rango 0,1–0,9.
- El modelo no es lingüístico: no procesa texto, código ni imágenes, por lo que no aplican consideraciones de sesgo lingüístico, pero sí posibles sesgos derivados de la composición del dataset de entrenamiento (no detallada en la información disponible).
- Riesgo de alucinación en sentido figurado: en series con patrones no vistos o con covariables mal especificadas, las predicciones pueden ser poco fiables; se recomienda validación con backtesting.
- Restricciones de licencia: la licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la información disponible no detalla sus términos concretos.
- El paquete `simons` requiere versión 0.1.0 o superior; versiones anteriores no son compatibles.
- No se documentan en la información disponible los tipos de cuantización soportados, lo que limita la planificación de despliegues con precisión reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-25M
- Repositorio GitHub: https://github.com/Abel-ai-lab/Simons
- Paquete PyPI: https://pypi.org/project/simons-forecasting/
- Blog de lanzamiento: https://abel.ai/research/introducing-simons/
- Proyecto base nanoTSFM: https://github.com/Abel-ai-lab/nanoTSFM
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Estadísticas de corte de conocimiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain/blob/main/statistics/knowledge_cutoff.csv
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Integración TimeCopilot: https://github.com/TimeCopilot/foundationforecast
- Documentación de integración GluonTS: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md#options
- Licencia del código: https://github.com/Abel-ai-lab/Simons/blob/main/LICENSE
