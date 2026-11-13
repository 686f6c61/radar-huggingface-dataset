# IUseAMouse/timessm-10m

## Resumen

TimeSSM-10M es un modelo de prediccion de series temporales en modo zero-shot desarrollado por el autor independiente IUseAMouse. Con solo 9.982.512 parametros, aborda el problema del forecasting multivariante y univariante sin necesidad de reentrenamiento por serie, leyendo hasta 4096 pasos de contexto y emitiendo nueve cuantiles para cualquier horizonte en una sola pasada. Su interes radica en que compite con modelos de decenas y cientos de millones de parametros en el benchmark GIFT-Eval manteniendo una licencia Apache-2.0 y un tamano que cabe en cualquier GPU consumer.

La innovacion principal es que la frecuencia de muestreo forma parte del modelo: un escalar indica al tronco que tasa esta leyendo, y la capa RateIN, sin pesos aprendidos, selecciona en inferencia las tasas relevantes del pasado de la serie. El tronco intercala capas de espacio de estados lineales diagonales (S4D) con atencion sobre parches de 16 pasos.

Fue entrenado desde cero en 31 horas sobre una unica A100 por una sola persona, fuera de cualquier laboratorio o empresa. El modelo y sus hiperparametros se seleccionaron sobre subconjuntos reservados del corpus, nunca sobre GIFT-Eval, y todas las series de GIFT-Eval fueron eliminadas del corpus de entrenamiento por nombre y por valor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: capas de espacio de estados lineales diagonales (S4D) intercaladas con atencion sobre parches de 16 pasos |
| Parametros totales | 9.982.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 4096 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tronco combina capas S4D (state space model diagonal lineal) con mecanismos de atencion aplicados sobre parches de 16 pasos temporales. La salida es un conjunto de nueve cuantiles para cualquier horizonte en una unica pasada, lo que permite obtener intervalos de prediccion sin decodificacion autoregresiva. La capa RateIN, sin pesos aprendidos, selecciona en tiempo de inferencia las frecuencias de muestreo utiles a partir del historico de la serie, y un escalar de tasa alimenta al tronco para condicionar la representacion.

El entrenamiento se realizo desde cero en 31 horas sobre una sola A100. No se especifica en la informacion disponible el numero de tokens ni la composicion exacta del corpus, aunque se indica que todas las series de GIFT-Eval fueron eliminadas del mismo por nombre y por valor. No se menciona uso de RLHF ni DPO, lo cual es esperable en un modelo de forecasting. El autor anuncia una memoria tecnica (technical report) pendiente de publicacion.

## Capacidades

- Prediccion zero-shot de series temporales sin reentrenamiento por serie.
- Forecasting multivariante y univariante con contexto de hasta 4096 pasos.
- Emision de nueve cuantiles por horizonte en una sola pasada, lo que habilita intervalos de prediccion calibrados (el intervalo del 80 % cubre el 79,3 % de los objetivos en GIFT-Eval).
- Adaptacion automatica a la frecuencia de muestreo mediante la capa RateIN y el escalar de tasa.
- Cobertura de tasas desde 10 segundos hasta anual, con mejor rendimiento en el rango de 5 a 15 minutos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente numerico de series temporales.
- No dispone de capacidades multilingues ni de vision, audio o texto.

## Casos de uso

- Monitorizacion de infraestructura IT: las series de bizitobs y bitbrains de GIFT-Eval (CPU, memoria, latencia a 5 y 10 segundos) son el dominio donde el modelo rinde mejor, con MASE de 0,269 en bizitobs_l2c/5T/short, lo que lo hace adecuado para alerta temprana de saturacion en sistemas cloud.
- Prediccion de demanda electrica: con contexto de hasta 4096 pasos y salida de cuantiles, puede generar previsiones horarias y de 15 minutos con bandas de incertidumbre para planificacion de capacidad, apoyandose en los resultados sobre electricity/15T (MASE 0,583 en short).
- Planificacion energetica solar: las series solar/H alcanzan MASE de 0,851-0,932 y CRPS de 0,299-0,526, utiles para estimar generacion fotovoltaica y gestionar almacenamiento.
- Analitica de trafico urbano: sz_taxi/H/short obtiene MASE 0,767 y CRPS 0,640, suficiente para dimensionar flotas y turnos con antelacion.
- Prevision de nacimientos y demografia: us_births/D/short logra MASE 0,196 y CRPS 0,159, el mejor resultado del modelo, lo que lo hace apropiado para estudios poblacionales y planificacion de servicios publicos.
- Prediccion de series medioambientales: temperature_rain/D/short (MASE 0,671, CRPS 0,437) y covid_deaths/D/short (MASE 0,670, CRPS 0,293) permiten modelar variables climaticas y epidemiologicas con cuantiles.
- Forecasting financiero y de ventas con series mensuales o trimestrales: aunque el modelo es mas debil en estas frecuencias (CRPS 0,699 en mensual y 0,736 en trimestral), sigue siendo utilizable como linea base zero-shot frente a metodos clasicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en GIFT-Eval (97 configuraciones, zero-shot). MASE y CRPS son medias geometricas del ratio frente al seasonal naive oficial; menor es mejor.

| Modelo | Parametros | CRPS | MASE | Disponibilidad |
|---|---|---|---|---|
| PDM-Femto | 6M | 0,4676 | 0,6843 | solo API |
| TimeSSM-10M | 9,98M | 0,4763 | 0,6948 | Apache-2.0 |
| Timestral-5M | 5M | 0,4789 | 0,7049 | pesos, MIT modificada |
| FlowState-9,1M | 9,1M | 0,5019 | 0,7262 | pesos abiertos |
| TimeSSM-2,5M | 2,5M | 0,5128 | 0,7544 | Apache-2.0 |
| TTM-R3 | 1,4M | 0,5195 | 0,7240 | pesos abiertos |
| Toto-2.0-4m | 4M | 0,5242 | 0,7565 | pesos abiertos |

Comparativa con modelos de mayor tamano:

| Modelo | Parametros | CRPS | MASE |
|---|---|---|---|
| Timestral-28M | 28M | 0,4610 | 0,6780 |
| t0-beta | 256M | 0,4738 | 0,6865 |
| Toto-2.0-2.5B | 2,5B | 0,4759 | 0,6956 |
| TiRex-2-Zeroshot | 82,5M | 0,4781 | 0,6973 |
| Chronos-2 | 120M | 0,4854 | 0,6978 |
| TimesFM-2.5 | 200M | 0,4903 | 0,7050 |

Rendimiento por frecuencia de muestreo (CRPS):

| Tasa | Configuraciones | CRPS |
|---|---|---|
| 10 segundos | 6 | 0,547 |
| 5 a 15 minutos | 30 | 0,468 |
| horaria | 31 | 0,426 |
| diaria | 15 | 0,422 |
| semanal | 8 | 0,620 |
| mensual | 5 | 0,699 |
| trimestral | 1 | 0,736 |
| anual | 1 | 0,788 |

Nota: el autor senala que TTM-R3 vio datos de GIFT-Eval en su preentrenamiento, lo que invalida la comparacion directa con ese modelo. Todos los resultados de la model card estan marcados como no verificados (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,98 millones de parametros en fp32 el modelo ocupa aproximadamente 40 MB; en fp16 unos 20 MB. El cuello de botella real es la activacion sobre contextos de hasta 4096 pasos, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una A100 o H100 solo aporta ventaja en throughput por lotes grandes.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la libreria `timessm` referenciada en la model card; el formato safetensors permite cargarlo con PyTorch estandar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Aspecto | TimeSSM-10M | Timestral-5M | FlowState-9,1M | TTM-R3 |
|---|---|---|---|---|
| Parametros | 9,98M | 5M | 9,1M | 1,4M |
| CRPS (GIFT-Eval) | 0,4763 | 0,4789 | 0,5019 | 0,5195 |
| MASE (GIFT-Eval) | 0,6948 | 0,7049 | 0,7262 | 0,7240 |
| Contexto | 4096 pasos | no disponible | no disponible | no disponible |
| Licencia | Apache-2.0 | MIT modificada | pesos abiertos | pesos abiertos |
| Disponibilidad | pesos abiertos | pesos abiertos | pesos abiertos | pesos abiertos |
| Nota | — | — | — | vio GIFT-Eval en preentrenamiento |

Frente a modelos mas grandes, TimeSSM-10M queda por detras de Timestral-28M (CRPS 0,4610) y t0-beta de 256M (0,4738), pero supera a Toto-2.0-2.5B (0,4759), TiRex-2-Zeroshot de 82,5M (0,4781), Chronos-2 de 120M (0,4854) y TimesFM-2.5 de 200M (0,4903), con dos ordenes de magnitud menos de parametros que el modelo de 2,5B.

## Limitaciones y advertencias

- El modelo es mas debil en series diarias y semanales frente a modelos de su tamano, segun reconoce el propio autor; su punto fuerte son las frecuencias de 5 a 15 minutos.
- Los resultados de GIFT-Eval estan marcados como no verificados (`verified: false`) y proceden de la propia model card; deben tratarse como declaraciones del autor hasta que exista una memoria tecnica o validacion independiente.
- La calibracion del intervalo del 80 % cubre el 79,3 % de los objetivos, ligeramente por debajo de lo nominal, lo que implica una infracobertura leve.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de usuarios ni validacion de la comunidad.
- No se documenta la composicion del corpus de entrenamiento ni el numero de tokens; la reproducibilidad es limitada hasta la publicacion del technical report.
- No se dispone de informacion sobre sesgos especificos; al operar sobre series numericas, el riesgo de sesgo se traslada a los dominios representados en el corpus (IT, energia, trafico, demografia).
- Riesgo de alucinacion en sentido estricto no aplica, pero si el riesgo de extrapolaciones erroneas en regimenes no vistos o series con cambios estructurales.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue en produccion regulada.
- No soporta texto, vision ni tool calling; no debe confundirse con un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/IUseAMouse/timessm-10m
- GIFT-Eval (dataset de evaluacion): https://huggingface.co/datasets/Salesforce/GiftEval
- Memoria tecnica: anunciada por el autor, no disponible en el momento de la consulta.
