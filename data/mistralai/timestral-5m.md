# mistralai/Timestral-5M

## Resumen

Timestral-5M es un modelo fundacional de series temporales orientado a predicción (*forecasting*) zero-shot, desarrollado por Mistral AI. Forma parte de la familia Timestral, disponible en versiones de 5M, 28M, 123M y 209M parámetros, y este repositorio aloja el *checkpoint* más pequeno. Su proposito es generar predicciones probabilisticas sobre series temporales sin necesidad de reentrenamiento especifico por dominio.

Tecnicamente es un transformer basado en parches (*patch-based*) con *time attention* y *variate attention*, 8 capas y dimension de embedding 192, con un total de 5.208.960 parámetros reales registrados en safetensors. Soporta contextos de hasta 32.768 pasos temporales (1.024 parches) y un horizonte de predicción de hasta 1.024 pasos (32 parches) en una sola pasada hacia delante.

Su relevancia radica en la relacion tamano-rendimiento: segun el autor, todos los modelos Timestral superan a cualquier otro modelo de su mismo tamano en los *benchmarks* GIFT-Eval, TIME y fev-bench, lo que lo hace atractivo para despliegue en entornos con recursos muy limitados (CPU, dispositivos *edge*).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en parches con time attention y variate attention, 8 capas, embedding de 192 |
| Parametros totales | 5.208.960 (~5,2M) |
| Longitud de contexto | Hasta 32.768 pasos temporales (1.024 parches, 32 pasos por parche) |
| Horizonte de prediccion | Hasta 1.024 pasos temporales (32 parches) por pasada; horizontes mayores por bloques |
| Tipos de cuantizacion | no disponible (no se detallan variantes cuantizadas oficiales) |
| Idiomas soportados | no disponible (modelo de series temporales; no procesa texto) |
| Licencia | other (Modified MIT; ver LICENSE) |
| Formato de pesos | safetensors |
| Salidas | 21 cuantiles (0,01; 0,05; 0,1; 0,15; ...; 0,85; 0,9; 0,95; 0,99) |
| Entradas | Variates objetivo univariantes o multivariantes, covariables pasadas y futuras conocidas, numericas o categoricas (codificadas por objetivo); valores faltantes como NaN |

## Arquitectura y entrenamiento

Timestral-5M emplea una arquitectura transformer basada en parches. Cada parche agrupa 32 pasos temporales y se embebe a partir de sus valores junto con indicadores de valor faltante. El modelo combina dos mecanismos de atencion: *time attention* (a lo largo del eje temporal) y *variate attention* (entre las distintas variables de la serie), lo que le permite manejar entradas tanto univariantes como multivariantes junto con covariables pasadas y futuras (conocidas) de tipo numerico o categorico. Con 8 capas y una dimension de embedding de 192, la salida es una distribucion predictiva representada por 21 cuantiles.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del *dataset* ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La inferencia se realiza en PyTorch, sobre CPU o GPU. Para horizontes superiores a 1.024 pasos, el modelo predice por bloques, anadiendo la mediana del bloque pronosticado al contexto antes de generar el siguiente bloque.

## Capacidades

- Prediccion de series temporales zero-shot, sin reentrenamiento por dominio.
- Forecasting univariante y multivariante.
- Acepta covariables pasadas y futuras conocidas, numericas y categoricas (estas ultimas codificadas por objetivo).
- Manejo explicito de valores faltantes (marcados como NaN).
- Salida probabilistica con 21 cuantiles por paso temporal.
- Contexto largo de hasta 32.768 pasos temporales.
- Prediccion por bloques para horizontes que exceden los 1.024 pasos.
- Inferencia en CPU o GPU mediante PyTorch.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales; es un modelo especializado exclusivamente en series temporales.

## Casos de uso

- Prevision de demanda en retail: prediccion de ventas por producto y tienda usando historico largo (hasta 32.768 pasos) y covariables como promociones o festivos, aprovechando la salida por cuantiles para planificar stock en escenarios optimista y pesimista.
- Planificacion energetica: prevision de carga electrica o generacion renovable con covariables meteorologicas conocidas a futuro, usando la distribucion de cuantiles para dimensionar reservas de red.
- Monitorizacion industrial (predictive maintenance): modelado de series de sensores multivariantes con valores faltantes habituales en plantas reales, gracias al soporte nativo de NaN y de multiples *variates*.
- Prevision financiera de series de alta frecuencia: uso del contexto largo para capturar estacionalidades prolongadas y de los cuantiles para cuantificar riesgo (VaR, intervalos de confianza).
- Gestion de inventario y cadena de suministro: prediccion por bloques de horizontes superiores a 1.024 pasos para planificacion trimestral o anual.
- Despliegue en dispositivos edge o embebidos: al tener solo 5,2M de parametros, puede ejecutarse en CPU o hardware de bajos recursos para forecasting local en tiempo real.
- Analitica de trafico y movilidad: prediccion de flujos con datos multivariantes y covariables de calendario, apta para planificacion de capacidad.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), correspondientes a la evaluacion zero-shot en tres *benchmarks* de prediccion de series temporales. Se incluye la comparativa completa de la familia Timestral para contextualizar la posicion del modelo de 5M.

| Benchmark | Metrica | Timestral-5M | Timestral-28M | Timestral-123M | Timestral-209M |
|---|---|---|---|---|---|
| GIFT-Eval | MASE (menor mejor) | 0,705 | 0,678 | 0,659 | 0,658 |
| GIFT-Eval | CRPS (menor mejor) | 0,479 | 0,461 | 0,448 | 0,446 |
| TIME | MASE (menor mejor) | 0,652 | 0,638 | 0,628 | 0,626 |
| TIME | CRPS (menor mejor) | 0,545 | 0,534 | 0,525 | 0,522 |
| fev-bench | SQL skill score (mayor mejor) | 46,19 | 48,42 | 50,18 | 50,39 |
| fev-bench | MASE skill score (mayor mejor) | 34,54 | 37,27 | 39,19 | 39,49 |

Fuentes: *leaderboards* oficiales de GIFT-Eval, TIME y fev-bench. El autor indica que Timestral-209M alcanza el estado del arte zero-shot en los tres *benchmarks* y que todos los modelos de la familia superan a cualquier otro modelo de su mismo tamano.

## Requisitos de hardware

- VRAM estimada para pesos (valores orientativos, calculados a partir de los 5.208.960 parametros; no facilitados por el autor): aproximadamente 21 MB en FP32, unos 10,4 MB en FP16/BF16, unos 5,2 MB en INT8 y unos 2,6 MB en INT4.
- Las activaciones dependen de la longitud de contexto y del numero de *variates*; con contextos de hasta 32.768 pasos el consumo de memoria sigue siendo muy reducido en comparacion con modelos de lenguaje de tamano similar.
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente; el modelo esta pensado para funcionar incluso en CPU. GPU de datacenter (A100, H100) solo tendrian sentido para despliegues de altisimo *throughput* por lotes.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas, etc.) e incluso en dispositivos *edge* y placas tipo Raspberry Pi.
- Opciones de despliegue: la model card solo menciona inferencia en PyTorch sobre CPU o GPU a traves de la libreria `timestral`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos externos comparables en la informacion proporcionada. La comparacion mas directa y documentada es dentro de la propia familia Timestral:

| Modelo | Parametros | Contexto | GIFT-Eval MASE | TIME MASE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Timestral-5M | ~5,2M | 32.768 pasos | 0,705 | 0,652 | Modified MIT | HuggingFace |
| Timestral-28M | 28M | 32.768 pasos | 0,678 | 0,638 | Modified MIT | HuggingFace |
| Timestral-123M | 123M | 32.768 pasos | 0,659 | 0,628 | Modified MIT | HuggingFace |
| Timestral-209M | 209M | 32.768 pasos | 0,658 | 0,626 | Modified MIT | HuggingFace |

La version de 209M ofrece la mejor precision, mientras que la de 5M prioriza un tamano minimo con una degradacion de precision moderada (por ejemplo, +0,047 de MASE en GIFT-Eval respecto a 209M). Comparativas con modelos fundacionales de series temporales de otros autores: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Todos los resultados de *benchmarks* estan declarados por el autor y figuran como no verificados (`verified: false`), por lo que deben tomarse con cautela.
- No se documentan sesgos conocidos ni la composicion del conjunto de entrenamiento, lo que dificulta evaluar posibles sesgos de dominio o periodo temporal.
- Riesgo de degradacion en dominios o patrones alejados de la distribucion de entrenamiento; al ser un modelo zero-shot, no se garantiza su rendimiento en series muy especificas sin validacion previa.
- La precision es inferior a la de los modelos mayores de la familia; para tareas que exijan maxima exactitud puede ser preferible Timestral-123M o 209M.
- El horizonte de prediccion directo esta limitado a 1.024 pasos; horizontes mayores requieren prediccion por bloques con realimentacion de la mediana, lo que puede acumular error.
- El modelo solo procesa series temporales; no soporta texto, dialogo, codigo ni otras modalidades.
- Licencia Modified MIT con una clausula adicional: no se puede usar el modelo de forma que infrinja, se apropie indebidamente o vulnere derechos de terceros, incluidos derechos de propiedad intelectual. Conviene revisar el fichero LICENSE antes de un uso comercial.
- No se detallan requisitos ni procedimientos oficiales de cuantizacion, ni soporte en *runtimes* de inferencia populares, lo que puede limitar la optimizacion de despliegue.
- Contexto e idiomas: al no procesar texto, la fila de idiomas no es aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Timestral-5M
- Pagina principal de la familia (Timestral-209M): https://huggingface.co/mistralai/Timestral-209M
- Timestral-28M: https://huggingface.co/mistralai/Timestral-28M
- Timestral-123M: https://huggingface.co/mistralai/Timestral-123M
- Licencia (LICENSE): https://huggingface.co/mistralai/Timestral-5M/blob/main/LICENSE
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Web de Mistral AI: https://mistral.ai/
