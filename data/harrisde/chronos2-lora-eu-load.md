# HarrisDe/chronos2-lora-eu-load

## Resumen

Chronos2-lora-eu-load es un adaptador LoRA para el modelo de series temporales amazon/chronos-2, publicado por el usuario HarrisDe en Hugging Face. El adaptador está especializado en la previsión horaria de carga eléctrica (day-ahead load forecasting) para cinco mercados europeos: Alemania, España, Francia, Grecia e Italia. Se distribuye como un artefacto PEFT que se carga sobre el modelo base y modifica su comportamiento para el dominio de demanda eléctrica.

El modelo base Chronos-2 es un modelo fundacional de series temporales de Amazon que aplica técnicas de aprendizaje profundo (derivadas de la familia de transformers) a la predicción de secuencias temporales. Este adaptador ajusta sus pesos mediante LoRA con 500 pasos de entrenamiento, batch de 8 y tasa de aprendizaje de 1e-4, ejecutado íntegramente en CPU. La ventana de contexto utilizada es de 1344 horas (8 semanas) y el horizonte de predicción es de 24 horas, lo que encaja con el ciclo diario de los mercados mayoristas de electricidad.

Su relevancia radica en que demuestra que un ajuste LoRA ligero sobre un modelo fundacional de series temporales puede superar ligeramente tanto a la predicción zero-shot del modelo base como a un baseline de gradient boosting (LightGBM) en la tarea concreta de previsión de carga day-ahead, con un MASE medio de 0,387 frente a 0,402 del zero-shot y 0,497 de LightGBM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye los pesos del modelo base, solo el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre amazon/chronos-2 (modelo fundacional de series temporales; arquitectura interna del base no detallada en la informacion disponible) |
| Parametros totales | No disponible (el adaptador LoRA no declara numero de parametros; tamano del repo 0.0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1344 horas (8 semanas) de entrada; horizonte de prediccion de 24 horas |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica como modelo de lenguaje; dominio de series temporales de carga electrica en Alemania, Espana, Francia, Grecia e Italia |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base amazon/chronos-2. No se redefine la arquitectura del modelo fundacional: el adaptador introduce matrices de bajo rango en determinadas capas del transformer subyacente, de modo que el modelo base permanece congelado y solo se entrenan los parametros del adaptador. La libreria declarada es PEFT y el formato de pesos es safetensors, lo que permite cargarlo con el pipeline oficial Chronos2Pipeline.

El entrenamiento se realizo sobre datos horarios de carga electrica de Open Power System Data (ENTSO-E Transparency) para el periodo 2015-2017, en cinco paises europeos. Se ejecutaron 500 pasos con batch size 8 y learning rate 1e-4, en CPU. La seleccion del adaptador se hizo sobre el ano 2018 como validacion y se evaluo una unica vez sobre 2019, lo que reduce el riesgo de sobreajuste al conjunto de test. El contexto de entrada es de 1344 horas y el horizonte de prediccion de 24 horas, coherente con la operativa day-ahead. No se detalla en la informacion disponible si hubo otras tecnicas de regularizacion, aumentacion de datos o composicion exacta del dataset mas alla de la fuente y el rango temporal.

## Capacidades

- Prevision de series temporales univariantes de carga electrica horaria con horizonte de 24 horas.
- Aprovechamiento de contexto largo: hasta 1344 horas de historia para condicionar la prediccion.
- Prediccion day-ahead multi-pais para Alemania, Espana, Francia, Grecia e Italia (entrenado conjuntamente sobre las cinco series).
- Integracion con el ecosistema Chronos mediante Chronos2Pipeline y la libreria PEFT.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; su tarea es la regresion de series temporales.
- No dispone de capacidades multilingues, de vision ni de audio.
- No se documenta modo thinking ni capacidades generativas de texto.

## Casos de uso

- Prevision day-ahead de demanda en mercados electricos: el adaptador genera las 24 curvas horarias del dia siguiente para cada uno de los cinco paises, con un MASE medio de 0,387 en 2019, adecuado como entrada para la programacion de compra/venta en el mercado mayorista.
- Planificacion de despacho de generacion: con una prediccion de carga a 24 horas, los operadores pueden ajustar el compromiso de unidades de generacion y reservas; el contexto de 8 semanas captura patrones semanales y estacionales.
- Gestion de carteras de comercializadoras: estimar la demanda agregada de clientes para cubrir posiciones en el mercado diario y reducir el riesgo de desbalance.
- Investigacion academica en forecasting: el adaptador sirve como baseline reproducible de fine-tuning LoRA sobre modelos fundacionales de series temporales, con particion train 2015-2017, validacion 2018 y test 2019 claramente definida.
- Integracion en pipelines de prevision energetica: al cargarse con Chronos2Pipeline, puede incorporarse a un sistema de prevision existente sin reentrenar el modelo base, reduciendo coste computacional.
- Deteccion de anomalias en consumo: comparar la prediccion del adaptador con la carga observada permite identificar desviaciones significativas (picos, caidas) en la operacion de red.
- Evaluacion comparativa de metodos: usar el MASE del adaptador frente a seasonal naive (1,004), LightGBM (0,497) y zero-shot (0,402) como referencia en estudios de seleccion de modelos.

## Benchmarks y rendimiento

Resultados publicados en la model card para previsiones day-ahead de todos los dias de 2019. MASE escalado por el error in-sample de una seasonal-naive semanal; menor es mejor.

| Modelo | MASE medio |
|---|---|
| Seasonal naive | 1,004 |
| LightGBM | 0,497 |
| Chronos-2 zero-shot | 0,402 |
| Chronos-2 + este LoRA | 0,387 |

No se han publicado en la informacion disponible resultados desagregados por pais, por horizonte horario ni de otras metricas (RMSE, MAE, sMAPE).

## Requisitos de hardware

- El adaptador LoRA es de tamano minimo (repo de 0.0 GB); el requisito real lo determina el modelo base amazon/chronos-2, cuyos pesos deben descargarse aparte.
- El entrenamiento del adaptador se realizo en CPU con 500 pasos, batch 8 y contexto de 1344 horas, lo que indica que el ajuste es viable sin GPU dedicada.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del tamano del modelo base Chronos-2 y de la cuantizacion elegida.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Despliegue: mediante la libreria Chronos (Chronos2Pipeline) y PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a LLM y no a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | MASE medio (2019) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chronos-2 + este LoRA | Adaptador LoRA sobre modelo fundacional | 1344 h entrada / 24 h horizonte | 0,387 | Apache 2.0 | Hugging Face (adaptador) |
| Chronos-2 zero-shot | Modelo fundacional de series temporales | No detallado | 0,402 | No disponible en la informacion | Hugging Face (amazon/chronos-2) |
| LightGBM | Gradient boosting supervisado | No aplica (features manuales) | 0,497 | No disponible en la informacion | Implementacion propia |
| Seasonal naive | Baseline estadistico | No aplica | 1,004 | No aplica | Implementacion propia |

No se dispone de datos de otros adaptadores LoRA comparables para carga electrica europea en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de 2015-2017 de cinco paises (Alemania, Espana, Francia, Grecia e Italia); el rendimiento fuera de ese periodo, de esos mercados o en otros paises no esta validado.
- La evaluacion se limita a 2019 y a un unico conjunto de test; no se reportan intervalos de confianza ni tests de significancia frente a los baselines.
- La mejora sobre el zero-shot es modesta (0,402 a 0,387 en MASE), por lo que la ventaja practica puede ser marginal en funcion del coste de despliegue.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; cualquier uso fuera de la prevision de series temporales carece de soporte.
- No se documentan sesgos especificos, pero al entrenarse con datos historicos de carga puede heredar sesgos estructurales de los mercados y anos cubiertos (por ejemplo, cambios en el mix energetico o en la demanda posteriores a 2017).
- Riesgo de degradacion ante cambios de regimen (crisis energeticas, cambios normativos, eventos extremos) no representados en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base amazon/chronos-2 debe verificarse por separado en cuanto a sus propios terminos.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en produccion ni mantenimiento posterior a la publicacion (creado y actualizado el 2026-11-15).
- El ejemplo de uso de la model card contiene un placeholder ("YOUR_USERNAME/chronos2-lora-eu-load") que debe sustituirse por el identificador real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarrisDe/chronos2-lora-eu-load
- Modelo base: https://huggingface.co/amazon/chronos-2
- Codigo del proyecto: https://github.com/HarrisDe/gridcast
- Open Power System Data (fuente de datos): https://open-power-system-data.org/
- ENTSO-E Transparency Platform: https://transparency.entsoe.eu/
