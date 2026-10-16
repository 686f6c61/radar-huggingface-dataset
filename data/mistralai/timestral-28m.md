# mistralai/Timestral-28M

## Resumen

Timestral-28M es un modelo fundacional de series temporales para predicción zero-shot, desarrollado por Mistral AI. Forma parte de la familia Timestral, que incluye versiones de 5M, 28M, 123M y 209M parámetros. Este checkpoint concreto tiene 27.821.184 parámetros y está diseñado para tareas de forecasting sobre datos univariantes o multivariantes, con soporte para covariables pasadas y futuras conocidas.

La arquitectura es un transformer basado en parches (patch-based transformer) con atención temporal y atención entre variables (time attention y variate attention), 12 capas y dimensión de embedding 256. Cada parche agrupa 32 pasos temporales y se embebe junto con indicadores de valores faltantes. La longitud de contexto alcanza hasta 32.768 pasos temporales (1.024 parches) y el horizonte de predicción directa es de hasta 1.024 pasos (32 parches) en una sola pasada; horizontes mayores se predicen bloque a bloque.

El modelo genera 21 cuantiles (0,01, 0,05, ..., 0,99), lo que permite obtener intervalos de predicción. Su relevancia radica en que ofrece un rendimiento competitivo en benchmarks de forecasting zero-shot con un tamaño muy reducido, facilitando su despliegue en CPU o GPU sin requisitos elevados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en parches con atención temporal y atención entre variables (12 capas, dimensión de embedding 256) |
| Parámetros totales | 27.821.184 |
| Longitud de contexto | Hasta 32.768 pasos temporales (1.024 parches) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Modified MIT (con cláusula adicional que prohíbe infringir derechos de terceros) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer basado en parches. Cada parche comprende 32 pasos temporales y se embebe a partir de sus valores y de indicadores de valores faltantes (NaN). La atención se aplica tanto sobre la dimensión temporal como sobre la dimensión de variables (time attention y variate attention), lo que permite modelar dependencias temporales y relaciones entre múltiples series. Consta de 12 capas y una dimensión de embedding de 256. La salida son 21 cuantiles (0,01, 0,05, 0,1, 0,15, ..., 0,85, 0,9, 0,95, 0,99), lo que proporciona una distribución predictiva completa. El modelo acepta variables objetivo univariantes o multivariantes, así como covariables pasadas y futuras conocidas, tanto numéricas como categóricas (estas últimas codificadas por target encoding). Los valores faltantes se marcan como NaN.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens o series utilizadas, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. La model card únicamente indica que la inferencia se realiza en PyTorch sobre CPU o GPU.

## Capacidades

- Predicción zero-shot de series temporales sin necesidad de entrenamiento específico por dominio.
- Soporte para series univariantes y multivariantes.
- Manejo de covariables pasadas y futuras conocidas, tanto numéricas como categóricas (estas últimas mediante target encoding).
- Tratamiento de valores faltantes marcados como NaN.
- Generación de 21 cuantiles (0,01 a 0,99) para obtener intervalos de predicción y distribuciones completas.
- Contexto de hasta 32.768 pasos temporales (1.024 parches).
- Horizonte de predicción directa de hasta 1.024 pasos (32 parches) en una sola pasada; para horizontes mayores, predicción bloque a bloque con la mediana del bloque anterior añadida al contexto.
- Inferencia en CPU o GPU con PyTorch.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, ya que no es un modelo de lenguaje.

## Casos de uso

- Predicción de demanda en retail: el modelo puede utilizar el historial de ventas y covariables como promociones, días festivos o precio para prever la demanda futura de múltiples productos. Gracias a su contexto de hasta 32.768 pasos, puede capturar estacionalidades anuales y patrones a largo plazo.
- Previsión de carga eléctrica: con series históricas de consumo y covariables meteorológicas (temperatura, nubosidad), el modelo genera predicciones con cuantiles para planificar la generación y evitar picos.
- Gestión de inventarios: predecir la demanda a corto y medio plazo para optimizar niveles de stock y reducir costes de almacenamiento, usando covariables como campañas de marketing o días no laborables.
- Mantenimiento predictivo en industria: prever valores de sensores (vibración, temperatura) y detectar desviaciones antes de fallos, aprovechando la capacidad multivariante y el manejo de covariables.
- Predicción de tráfico: series temporales de flujo vehicular con covariables como hora del día, día de la semana y condiciones meteorológicas para anticipar congestión.
- Previsión financiera: modelar precios de activos, tipos de cambio o volatilidad con series históricas y covariables macroeconómicas, obteniendo intervalos de confianza mediante los 21 cuantiles.
- Planificación de recursos en cloud: prever el uso de CPU, memoria o ancho de banda para escalar automáticamente, usando el contexto largo para capturar patrones semanales y estacionales.
- Predicción de ventas en e-commerce: anticipar ventas por producto y canal, incorporando covariables como visitas, clics o inversión publicitaria, para ajustar campañas y logística.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card para la familia Timestral:

| Benchmark | Métrica | Timestral-5M | Timestral-28M | Timestral-123M | Timestral-209M |
|---|---|---|---|---|---|
| GIFT-Eval | MASE ↓ | 0,705 | 0,678 | 0,659 | 0,658 |
| GIFT-Eval | CRPS ↓ | 0,479 | 0,461 | 0,448 | 0,446 |
| TIME | MASE ↓ | 0,652 | 0,638 | 0,628 | 0,626 |
| TIME | CRPS ↓ | 0,545 | 0,534 | 0,525 | 0,522 |
| fev-bench | SQL skill score ↑ | 46,19 | 48,42 | 50,18 | 50,39 |
| fev-bench | MASE skill score ↑ | 34,54 | 37,27 | 39,19 | 39,49 |

La model card afirma que Timestral-209M alcanza precisión zero-shot estado del arte en los tres benchmarks, y que todos los modelos Timestral superan a cualquier otro modelo del mismo tamaño. No se proporcionan comparaciones numéricas con modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 112 MB en fp32 y 56 MB en fp16 para los pesos, más la memoria adicional para activaciones y contexto (hasta 32.768 pasos). Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican modelos concretos. Dado el tamaño, cualquier GPU con al menos 1 GB de VRAM es suficiente. Se puede ejecutar en CPU.
- Opciones de despliegue: PyTorch (CPU o GPU) según la model card. No se mencionan otras herramientas como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación dentro de la familia Timestral (misma arquitectura y licencia, distinto tamaño):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Timestral-5M | 5M | no disponible | Modified MIT | HuggingFace |
| Timestral-28M | 27,8M | 32.768 pasos | Modified MIT | HuggingFace |
| Timestral-123M | 123M | no disponible | Modified MIT | HuggingFace |
| Timestral-209M | 209M | no disponible | Modified MIT | HuggingFace |

No se proporcionan datos de otros modelos de forecasting externos en la información disponible.

## Limitaciones y advertencias

- Licencia: Modified MIT con una cláusula que prohíbe usar el modelo de manera que infrinja, malverse o viole derechos de terceros, incluidos derechos de propiedad intelectual. El uso comercial está permitido siempre que se cumpla esta condición.
- Sesgos: no se dispone de información sobre sesgos en los datos de entrenamiento. Al ser un modelo de forecasting, puede heredar sesgos presentes en las series históricas utilizadas para la predicción.
- Alucinación: en el contexto de series temporales, puede generar predicciones inexactas o poco realistas, especialmente en dominios no vistos durante el entrenamiento o con patrones anómalos.
- Limitaciones de contexto: la longitud máxima de contexto es de 32.768 pasos temporales. Para series más largas, es necesario truncar o usar ventanas deslizantes, lo que puede perder información de largo plazo.
- Horizonte de predicción: la predicción directa está limitada a 1.024 pasos. Para horizontes mayores, se usa predicción por bloques, lo que puede acumular error.
- Idiomas: no aplica, no es un modelo de lenguaje.
- Dependencia de covariables: el rendimiento puede degradarse si no se proporcionan covariables relevantes o si estas son de baja calidad.
- No se ofrecen versiones cuantizadas oficiales; solo pesos en safetensors.
- No se especifican detalles del entrenamiento, por lo que se desconoce su cobertura y posibles limitaciones en dominios específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Timestral-28M
- Página principal de la familia Timestral (Timestral-209M): https://huggingface.co/mistralai/Timestral-209M
- Licencia: https://huggingface.co/mistralai/Timestral-28M/blob/main/LICENSE
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Sitio oficial de Mistral AI: https://mistral.ai/
- Wikipedia de Mistral AI: https://fr.wikipedia.org/wiki/Mistral_AI
- Consola de Mistral AI: https://console.mistral.ai/home
- Chat de Mistral AI: https://chat.mistral.ai/login
