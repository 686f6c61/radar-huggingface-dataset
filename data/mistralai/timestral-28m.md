# mistralai/Timestral-28M

## Resumen

Timestral-28M es un modelo fundacional de predicción de series temporales desarrollado por Mistral AI, diseñado para realizar *forecasting* zero-shot sin necesidad de reentrenamiento sobre datos específicos de dominio. Forma parte de una familia de cuatro modelos (5M, 28M, 123M y 209M parámetros) que comparten arquitectura y metodología de entrenamiento, y este checkpoint concreto ocupa el segundo escalón de tamaño de la familia. Su relevancia actual radica en que ofrece un equilibrio entre coste computacional y precisión, superando según el autor a todos los modelos de su mismo tamaño en los tres benchmarks de referencia del sector.

La arquitectura es un transformer basado en parches (*patch-based*) con atención temporal y atención entre variables (*variate attention*), 12 capas y dimensión de embedding de 384. Cada parche agrupa 32 pasos temporales y se embebe junto con indicadores de valores faltantes, lo que permite manejar series con huecos de forma nativa. Soporta contextos de hasta 32.768 pasos temporales (1.024 parches) y genera horizontes de hasta 1.024 pasos en una sola pasada, con extensiones por bloques para horizontes mayores.

El modelo produce una salida probabilística completa: 21 cuantiles (0,01, 0,05, 0,10, …, 0,90, 0,95, 0,99), lo que lo hace adecuado para planificación bajo incertidumbre, no solo para predicción puntual. Acepta variables objetivo univariantes o multivariantes, covariables pasadas y covariables futuras conocidas (numéricas o categóricas, estas últimas codificadas por *target encoding*), y se ejecuta en PyTorch sobre CPU o GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en parches con atencion temporal y atencion entre variables (*variate attention*), 12 capas |
| Parametros totales | 27.821.184 (28M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 32.768 pasos temporales (1.024 parches de 32 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales; no procesa texto) |
| Licencia | Modified MIT (ver LICENSE en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Timestral-28M es un transformer *encoder-only* de 12 capas con dimensión de embedding 384, especializado en series temporales. La innovación principal es la tokenización por parches: cada bloque de 32 pasos temporales se proyecta a un embedding que combina los valores de la serie con indicadores binarios de valor faltante, de modo que el modelo aprende a tratar los NaN como información explícita en lugar de imputarlos previamente. Sobre esa secuencia de parches se aplican dos mecanismos de atención complementarios: atención temporal (entre parches de la misma serie) y atención entre variables (entre series distintas de un mismo instante), lo que permite modelar tanto dependencias longitudinales como correlaciones cruzadas en datos multivariantes.

La salida es una distribución predictiva cuantílica de 21 niveles, generada en una sola pasada para horizontes de hasta 1.024 pasos (32 parches). Para horizontes más largos, el modelo opera en modo autorregresivo por bloques: la mediana del bloque predicho se anexa al contexto y se genera el siguiente bloque. El modelo admite covariables pasadas y futuras conocidas, categóricas incluidas (codificadas mediante *target encoding*). No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el autor solo indica que el modelo está pensado para *zero-shot forecasting*.

## Capacidades

- Predicción de series temporales univariantes y multivariantes en modo zero-shot, sin ajuste fino sobre el dominio objetivo.
- Predicción probabilística mediante 21 cuantiles (0,01 a 0,99), apta para intervalos de confianza y planificación bajo incertidumbre.
- Manejo nativo de valores faltantes (NaN) mediante indicadores embebidos por parche.
- Soporte de covariables pasadas y covariables futuras conocidas, numéricas o categóricas (estas últimas con *target encoding*).
- Contextos largos de hasta 32.768 pasos temporales, útiles para series con estacionalidades anuales o patrones de largo plazo.
- Horizontes de predicción de hasta 1.024 pasos en una pasada; extensibles por bloques autorregresivos.
- Inferencia en CPU o GPU sobre PyTorch.
- No soporta tool calling, agentes, visión, audio ni procesamiento de lenguaje natural: es un modelo exclusivamente numérico-secuencial.

## Casos de uso

- Previsión de demanda minorista: el modelo puede ingerir historiales de ventas por SKU y tienda con covariables como promociones o festivos futuros, y generar cuantiles de demanda a varias semanas vista para dimensionar stock y aprovisionamiento. Su contexto de 32.768 pasos cubre varios años de datos horarios o diarios sin truncar estacionalidades.
- Planificación energética: predicción de carga eléctrica o generación renovable con covariables meteorológicas futuras conocidas (temperatura prevista, irradiancia) y salida cuantílica para dimensionar reservas y márgenes de seguridad en despacho.
- Gestión de inventario y cadena de suministro: forecasting multivariante de miles de series relacionadas, aprovechando la atención entre variables para capturar correlaciones entre productos o regiones, con horizontes por bloques para planificación trimestral.
- Monitorización de infraestructura y capacidad: predicción de métricas de uso (CPU, latencia, tráfico) con valores faltantes frecuentes por caídas de telemetría; los indicadores de NaN permiten al modelo no degradarse ante huecos en la serie.
- Previsión financiera de series agregadas: proyección de magnitudes como volumen de transacciones o flujos de caja con intervalos cuantílicos, útil para escenarios de estrés y presupuestación.
- Detección temprana de anomalías por desviación: comparar el valor observado con los cuantiles extremos (0,01 y 0,99) predichos por el modelo para señalar comportamientos atípicos en series operativas o de sensores.
- Sustitución de modelos estadísticos clásicos en pipelines existentes: al ser un modelo de 28M parámetros con inferencia en CPU, puede desplegarse como servicio de forecasting ligero donde ARIMA, Prophet o ETS resultan costosos de mantener por serie.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Las flechas indican la dirección deseable de la métrica.

| Benchmark | Metrica | Timestral-5M | Timestral-28M | Timestral-123M | Timestral-209M |
|---|---|---|---|---|---|
| GIFT-Eval | MASE (↓) | 0,705 | 0,678 | 0,659 | 0,658 |
| GIFT-Eval | CRPS (↓) | 0,479 | 0,461 | 0,448 | 0,446 |
| TIME | MASE (↓) | 0,652 | 0,638 | 0,628 | 0,626 |
| TIME | CRPS (↓) | 0,545 | 0,534 | 0,525 | 0,522 |
| fev-bench | SQL skill score (↑) | 46,19 | 48,42 | 50,18 | 50,39 |
| fev-bench | MASE skill score (↑) | 34,54 | 37,27 | 39,19 | 39,49 |

El autor afirma que Timestral-209M alcanza el estado del arte zero-shot en los tres benchmarks y que todos los modelos de la familia superan a cualquier otro modelo de su mismo tamaño; el 28M se sitúa en un punto intermedio de la curva de compromiso tamaño-precision (Pareto). No se han publicado en la información disponible comparaciones numéricas con modelos competidores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 0,1 GB en safetensors (28M parámetros en precisión de entrenamiento), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes de series o contextos de 32.768 pasos conviene una RTX 4090, L40S, A100 o H100 por ancho de banda y memoria. Para despliegues masivos en paralelo, GPUs de datacenter con mayor throughput.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 4 GB de VRAM (RTX 3060 en adelante, e incluso iGPU en CPU).
- Opciones de despliegue: inferencia nativa en PyTorch (CPU o GPU) mediante la librería `timestral`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. A modo orientativo, un modelo de 28M parámetros con contexto de 1.024 parches es computacionalmente ligero, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos competidores de forecasting zero-shot (por ejemplo, otros modelos fundacionales de series temporales) para construir una comparativa rigurosa. La única comparación disponible es interna a la familia:

| Modelo | Parametros | GIFT-Eval MASE (↓) | TIME MASE (↓) | fev-bench SQL (↑) | Licencia |
|---|---|---|---|---|---|
| Timestral-5M | 5M | 0,705 | 0,652 | 46,19 | Modified MIT |
| Timestral-28M | 28M | 0,678 | 0,638 | 48,42 | Modified MIT |
| Timestral-123M | 123M | 0,659 | 0,628 | 50,18 | Modified MIT |
| Timestral-209M | 209M | 0,658 | 0,626 | 50,39 | Modified MIT |

Para alternativas externas: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y figuran como no verificados (`verified: false`); deben tomarse como orientativos hasta su validación independiente.
- El modelo es exclusivamente numérico-secuencial: no procesa texto, imágenes ni audio, y no soporta tool calling ni razonamiento multi-step en el sentido de los LLM.
- Riesgo de degradación fuera de distribución: al ser zero-shot, su rendimiento puede caer en series con patrones muy distintos a los del entrenamiento (no se detalla la composición del dataset).
- La predicción por bloques para horizontes superiores a 1.024 pasos es autorregresiva sobre la mediana, lo que puede acumular error en horizontes muy largos.
- Las covariables categóricas se codifican por *target encoding*, lo que puede introducir fugas de información si no se gestiona cuidadosamente en producción.
- Licencia Modified MIT: permite uso comercial, pero incluye la restricción de no usar el modelo de forma que infrinja, se apropie indebidamente o vulnere derechos de terceros, incluidos derechos de propiedad intelectual. Conviene revisar el texto completo del LICENSE antes de un despliegue comercial.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de los tres benchmarks citados.
- Idiomas soportados: no aplica (modelo numérico); no hay soporte lingüístico que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Timestral-28M
- Modelo principal de la familia (Timestral-209M): https://huggingface.co/mistralai/Timestral-209M
- Timestral-5M: https://huggingface.co/mistralai/Timestral-5M
- Timestral-123M: https://huggingface.co/mistralai/Timestral-123M
- Licencia: https://huggingface.co/mistralai/Timestral-28M/blob/main/LICENSE
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
