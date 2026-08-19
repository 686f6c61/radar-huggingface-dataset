# dide-ic/estiMINT

## Resumen

estiMINT RQS es un conjunto de modelos de normalizing flows condicionales desarrollados por el grupo dide-ic (proyecto estiMINT) para estimar la intensidad de transmisión de malaria a partir de indicadores entomológicos y de cobertura de intervenciones. Concretamente, los modelos predicen cuantiles de la tasa de inoculación entomológica (EIR) y de la tasa de picadura humana (HBR) condicionando sobre un predictor primario y seis covariables de intervención (uso de mosquiteras, rociado residual, tratamiento, etc.). La arquitectura emplea splines racionales cuadráticos (RQS) dentro de un flujo normalizante: un MLP mapea las características de contexto a los parámetros del spline, que transforman una distribución normal estándar en la distribución objetivo. Esto permite obtener no solo una predicción puntual (la mediana), sino también intervalos predictivos calibrados.

El modelo está diseñado para su integración en el paquete estiMINT, orientado a la epidemiología de la malaria. Su relevancia radica en que proporciona incertidumbre cuantificada en las estimaciones de transmisión, algo crítico para la planificación de campañas de control y la evaluación de intervenciones. Se distribuye bajo licencia MIT y está implementado con JAX/Flax (NNX). El tamaño de parámetros y el contexto no están documentados, y al ser un modelo tabular, no aplica la noción de longitud de contexto de los modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Normalizing flow condicional con splines racionales cuadraticos (RQS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entradas numericas) |
| Licencia | MIT |
| Formato de pesos | no disponible (implementado con JAX/Flax NNX) |

## Arquitectura y entrenamiento

Cada modelo es un flujo normalizante condicional. Un MLP recibe un vector de contexto de siete dimensiones (el predictor primario más seis covariables de intervención) y genera los parámetros de un spline racional cuadrático. Este spline define una transformación biyectiva desde una distribución base normal estándar hacia la distribución condicional del objetivo. Durante el entrenamiento se optimiza la verosimilitud de los datos observados bajo esta transformación, lo que permite que el modelo aprenda la relación entre las covariables y la forma completa de la distribución del target, no solo su media.

No se han publicado detalles sobre el conjunto de entrenamiento (número de muestras, procedencia de los datos) ni sobre el proceso de optimización (épocas, función de pérdida exacta, si hubo regularización). Los tres modelos disponibles cubren las combinaciones `hbr_y9 → eir`, `prev_y9 → eir` y `eir → hbr_y9`. Las entradas se pasan en bruto; la estandarización y los log10 (cuando corresponden) se aplican internamente, y las predicciones se devuelven en la escala original, recortadas a cero.

## Capacidades

- Predicción de cuantiles de la tasa de inoculación entomológica (EIR) y de la tasa de picadura humana (HBR) a partir de covariables de intervención.
- Generación de intervalos predictivos (por ejemplo, el 90 % mediante `interval(alpha=0.10)`), además de la predicción mediana.
- Manejo de la estacionalidad como covariable binaria, lo que permite modelar picos de transmisión.
- Acepta entradas como lista de diccionarios, un único diccionario o un array `(batch, 7)` en el orden establecido.
- Normalización interna automática: el usuario no necesita estandarizar los datos.
- Integración sencilla con el paquete `estimint` mediante la clase `ConditionalRQS`.

## Casos de uso

- Planificación de campañas de control vectorial: estimar la EIR a partir de la HBR observada y las coberturas de mosquiteras (itn_use) y rociado residual (irs_use), permitiendo priorizar recursos en zonas de alta transmisión.
- Evaluación de impacto de intervenciones: simular cómo cambios en el uso de mosquiteras, el tratamiento (dn0_use) o la estacionalidad afectan la distribución de la transmisión, usando cuantiles para cuantificar la incertidumbre.
- Vigilancia epidemiológica: estimar la prevalencia de malaria (prev_y9) a partir de la EIR, con intervalos de confianza para monitorear tendencias y detectar brotes.
- Modelado de estacionalidad: incorporar la variable `seasonal` para predecir picos de transmisión y planificar la distribución de recursos antes de la temporada alta.
- Análisis de sensibilidad en modelos de transmisión: utilizar las distribuciones predictivas generadas por el flujo normalizante como entrada para simulaciones de impacto de intervenciones.
- Integración en pipelines de análisis de datos epidemiológicos: al ser una librería Python con JAX, puede combinarse con herramientas de procesamiento y visualización para generar informes de incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos específicos sobre requisitos de hardware. Dado que se trata de un modelo tabular con un MLP como componente principal, es razonable esperar que pueda ejecutarse en CPU sin problemas, aunque no hay cifras oficiales de VRAM, latencia o throughput. Para despliegue, al estar implementado con JAX/Flax, se puede ejecutar en cualquier entorno con JAX instalado (CPU, GPU o TPU), pero no se documentan opciones específicas como vLLM u Ollama (que son para modelos de lenguaje).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (regresión cuantílica con flujos normalizantes para malaria). La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en indicadores de malaria; no es generalizable a otros dominios.
- Los intervalos predictivos obtenidos de los artefactos exportados no están corregidos conformalmente (el offset de calibración calculado durante el entrenamiento no se transfiere), por lo que la cobertura empírica puede diferir de la nominal.
- Las entradas deben contener exactamente las siete covariables especificadas; cualquier falta o clave inesperada produce un error.
- No hay información sobre posibles sesgos en los datos de entrenamiento ni sobre la robustez frente a valores atípicos.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantías explícitas de precisión o idoneidad para entornos de producción.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/dide-ic/estiMINT
- Repositorio de GitHub del proyecto estiMINT: https://github.com/CosmoNaught/estiMINT
