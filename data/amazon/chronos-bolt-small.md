# amazon/chronos-bolt-small

## Resumen

Chronos-Bolt (Small) es un modelo fundacional preentrenado para el pronostico de series temporales, desarrollado por Amazon, que permite hacer *forecasting* zero-shot sin necesidad de entrenamiento especifico sobre el dominio objetivo. Esta construido sobre la arquitectura T5 encoder-decoder (concretamente sobre la configuracion `t5-efficient-small`) y cuenta con 47.718.016 parametros, lo que lo situa en la gama baja de la familia Chronos-Bolt, entre las variantes tiny (9M) y mini (21M) por debajo y base (205M) por encima.

El modelo resuelve el problema de generar predicciones probabilisticas multi-paso de forma directa: divide el contexto historico en parches de varias observaciones, los codifica y el decodificador emite directamente cuantiles para multiples horizontes futuros en una sola pasada, sin decodificacion autorregresiva. Frente a los modelos Chronos originales del mismo tamano, la variante Bolt es hasta 250 veces mas rapida y 20 veces mas eficiente en memoria, manteniendo (segun el autor) una precision superior.

Su relevancia practica es alta: con solo 0,2 GB de repositorio y pesos safetensors, se puede ejecutar en CPU y en cualquier GPU de consumo, se integra de forma nativa en AutoGluon para fine-tuning y ensamblado, y esta disponible como endpoint gestionado en Amazon SageMaker JumpStart. La model card marca `amazon/chronos-2` como version nueva recomendada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (basado en `t5-efficient-small`), tokenizacion por parches y prediccion directa multi-paso de cuantiles |
| Parametros totales | 47.718.016 (aproximadamente 48M) |
| Parametros activos | No aplica (arquitectura densa, no es un modelo MoE) |
| Longitud de contexto | 512 observaciones en los experimentos publicados; la model card no especifica un maximo distinto |
| Tipos de cuantizacion | No documentados por el autor; pesos distribuidos en safetensors (sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | No aplica: modelo de series temporales, no procesa lenguaje natural. La model card no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Pipeline | `time-series-forecasting` |
| Libreria | `chronos-forecasting` |
| Descargas / likes | 6.138.037 descargas / 62 likes |
| Fechas | Creado el 2024-11-25, actualizado el 2025-11-21 |
| Despliegue soportado | Amazon SageMaker JumpStart (instancias CPU y GPU), AutoGluon, PyTorch |

## Arquitectura y entrenamiento

Chronos-Bolt emplea un transformer encoder-decoder de tipo T5. La serie temporal historica se segmenta en parches que agrupan varias observaciones consecutivas; cada parche se proyecta al espacio de embeddings del encoder. El decoder consume esas representaciones y genera de forma directa las predicciones cuantilicas para todos los pasos del horizonte en una unica pasada (pronostico directo multi-paso), en lugar de la generacion autorregresiva paso a paso del Chronos original. Este cambio es el responsable de la mejora de velocidad y de huella de memoria: hasta 250x mas rapido y 20x menos memoria que los Chronos equivalentes en tamano.

El preentrenamiento se realizo sobre cerca de 100.000 millones de observaciones de series temporales. La model card no detalla la composicion exacta del corpus, el numero de tokens de entrenamiento, ni si se aplicaron fases de ajuste por preferencias (RLHF/DPO); estos datos no estan disponibles en la informacion proporcionada. Tampoco se documentan innovaciones adicionales como atencion lineal o decodificacion especulativa. La evaluacion publicada por el autor agrega resultados sobre 27 datasets y compara con modelos estadisticos, modelos de deep learning entrenados especificamente en cada dataset y otros modelos fundacionales; segun la model card, la variante Base supera al Chronos original Large siendo mas de 600 veces mas rapida.

## Capacidades

- Pronostico zero-shot de series temporales univariantes y multivariantes, sin entrenamiento previo sobre el dataset objetivo.
- Prediccion probabilistica: emite cuantiles, no solo la media, lo que permite construir intervalos de prediccion y escenarios.
- Pronostico directo multi-paso: todo el horizonte se genera en una sola pasada del decoder.
- Soporte de covariables a traves de AutoGluon (mediante regresores de covariables) y en los endpoints de SageMaker JumpStart.
- Fine-tuning sobre datos propios mediante AutoGluon.
- Ensamblado con otros modelos estadisticos y de machine learning en AutoGluon para maximizar precision.
- Despliegue en produccion como endpoint gestionado (CPU o GPU) en SageMaker JumpStart.
- No soporta generacion de texto, razonamiento, codigo, vision, audio, tool calling ni comportamiento agentico: es un modelo puramente numerico de forecasting.

## Casos de uso

- **Prevision de demanda en retail:** generar pronosticos de ventas por SKU y tienda a horizonte diario o semanal en modo zero-shot, lo que permite arrancar sin historico de modelado propio y refinar despues con fine-tuning en AutoGluon.
- **Planificacion de inventario y cadena de suministro:** alimentar los cuantiles P50/P90 en politicas de stock de seguridad y puntos de reposicion, aprovechando que el modelo devuelve distribuciones y no solo un valor puntual.
- **Prevision de carga y generacion energetica:** pronosticar demanda electrica o produccion renovable con contexto de 512 observaciones, con intervalos que permiten dimensionar reservas y margenes operativos.
- **Capacity planning de infraestructura:** proyectar metricas de CPU, latencia o trafico a partir de series historicas para anticipar escalado, con la ventaja de que el modelo cabe en CPU y no compite por GPU con otros servicios.
- **Deteccion de anomalias mediante residuos:** comparar la observacion real con el intervalo de prediccion del modelo; desviaciones sostenidas fuera del rango cuantilico actuan como senal de alarma en monitorizacion industrial o de negocio.
- **Cold start de productos o mercados nuevos:** al ser zero-shot, permite pronosticar series sin historico propio del modelo, algo util en lanzamientos, nuevas regiones o tiendas recien abiertas.
- **Analitica financiera y tesoreria:** proyeccion de flujos de caja, ingresos recurrentes o volumen de transacciones con cuantiles para escenarios conservador y optimista.
- **Servicio de forecasting como API interna:** desplegar el modelo como endpoint en SageMaker JumpStart y exponerlo a equipos de negocio que necesitan pronosticos bajo demanda sin infraestructura de ML propia.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye graficos comparativos (imagenes SVG alojadas en `autogluon.s3.amazonaws.com`) con las metricas WQL (Weighted Quantile Loss) y MASE (Mean Absolute Scaled Error) agregadas sobre 27 datasets, pero los valores concretos no se recogen como tabla numerica en la informacion proporcionada.

Las afirmaciones cualitativas que si se documentan son:

| Afirmacion | Dato |
|---|---|
| Velocidad frente a Chronos original del mismo tamano | Hasta 250 veces mas rapido |
| Eficiencia de memoria frente a Chronos original del mismo tamano | Hasta 20 veces mas eficiente |
| Precision frente a Chronos original del mismo tamano | Superior, segun el autor |
| Chronos-Bolt Base frente a Chronos original Large | Mejor precision y mas de 600 veces mas rapido |
| Comparacion con modelos estadisticos y de deep learning entrenados en cada dataset | Chronos-Bolt zero-shot obtiene mejor rendimiento |
| Escenario de la comparativa de velocidad | 1024 series, contexto de 512 observaciones, horizonte de 64 pasos |

## Requisitos de hardware

- **VRAM estimada para inferencia:** el modelo tiene 47,7M de parametros. En fp32 ocupa aproximadamente 191 MB; en fp16/bf16, unos 95 MB; en int8, unos 48 MB. A ello hay que sumar el estado de activaciones y el lote de series procesadas, por lo que un presupuesto realista es inferior a 1 GB en la mayoria de escenarios.
- **GPU recomendadas:** no necesita GPU. Cualquier GPU consumer sirve y sobra: RTX 3060, RTX 4060, RTX 4090. En entornos de servidor, A100 o H100 solo tendrian sentido para procesar lotes muy grandes de series en paralelo, no por requisitos del modelo.
- **Cabe en GPU de consumo:** si, con amplio margen, en cualquier GPU consumer moderna e incluso en GPUs integradas.
- **CPU:** es el modo de despliegue habitual. SageMaker JumpStart permite endpoints tanto en CPU como en GPU.
- **Opciones de despliegue:** AutoGluon (`TimeSeriesPredictor` con `model_path="amazon/chronos-bolt-small"`), Amazon SageMaker JumpStart, y la libreria `chronos-forecasting` sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no aplican: son herramientas para modelos de lenguaje y este modelo no lo es.
- **Latencia y throughput:** no se publican cifras absolutas. La comparativa del autor usa 1024 series con contexto de 512 y horizonte de 64 para medir tiempos relativos frente a Chronos original, sin detallar el hardware ni los milisegundos obtenidos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura base | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chronos-bolt-tiny | 9M | `t5-efficient-tiny` | Apache 2.0 | HuggingFace | Menor coste, menor capacidad |
| chronos-bolt-mini | 21M | `t5-efficient-mini` | Apache 2.0 | HuggingFace | Punto intermedio |
| **chronos-bolt-small** | **47,7M** | **`t5-efficient-small`** | **Apache 2.0** | **HuggingFace, SageMaker** | **Equilibrio entre coste y precision** |
| chronos-bolt-base | 205M | `t5-efficient-base` | Apache 2.0 | HuggingFace, SageMaker | Mejor precision de la familia; supera a Chronos Large |
| Chronos original (mismo tamano) | Equivalente a small | T5 encoder-decoder autorregresivo | Apache 2.0 | HuggingFace | Hasta 250x mas lento y 20x mas consumo de memoria que Bolt |
| chronos-2 | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace (`amazon/chronos-2`) | Version nueva recomendada por el autor |

No se dispone en la informacion proporcionada de datos verificables de otros modelos fundacionales de series temporales (TimesFM, Moirai, Lag-Llama, entre otros), por lo que no se incluye comparacion numerica con ellos.

## Limitaciones y advertencias

- **No es un modelo de lenguaje:** no genera texto, no responde instrucciones, no soporta tool calling ni razonamiento multi-paso. Cualquier expectativa en ese sentido es un error de uso.
- **Riesgo de predicciones implausibles fuera de distribucion:** al ser zero-shot, la calidad cae en series con patrones muy distintos a los del corpus de preentrenamiento. No hay umbrales de confianza documentados para detectar estos casos.
- **Sesgos del corpus de entrenamiento:** la model card no detalla la composicion de los 100.000 millones de observaciones, por lo que no se puede auditar la representatividad por dominio, frecuencia o region geografica.
- **Documentacion incompleta de robustez:** no se especifica el tratamiento de valores faltantes, series irregulares, cambios de frecuencia ni outliers.
- **Precision mejorable con fine-tuning:** el modo zero-shot es el punto de partida; para maximizar precision en un dominio concreto se recomienda ajuste fino con AutoGluon.
- **Covariables no nativas:** la incorporacion de covariables se realiza a traves de regresores de covariables en AutoGluon o en SageMaker, no como entrada directa del modelo.
- **Version superada:** la model card marca `amazon/chronos-2` como `new_version`; conviene evaluar esa variante antes de iniciar un desarrollo nuevo.
- **Licencia:** Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y las atribuciones.
- **Ausencia de cifras absolutas de latencia:** los datos publicos son relativos frente a Chronos original, por lo que el dimensionamiento de produccion debe medirse en el entorno real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amazon/chronos-bolt-small
- Version nueva recomendada: https://huggingface.co/amazon/chronos-2
- Variante tiny: https://huggingface.co/amazon/chronos-bolt-tiny
- Variante mini: https://huggingface.co/amazon/chronos-bolt-mini
- Variante base: https://huggingface.co/amazon/chronos-bolt-base
- Paper de la arquitectura T5: https://arxiv.org/abs/1910.10683
- Paper de Chronos: https://arxiv.org/abs/2403.07815
- Repositorio de codigo: https://github.com/amazon-science/chronos-forecasting
- Notebook de despliegue en SageMaker (Chronos general): https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/deploy-chronos-to-amazon-sagemaker.ipynb
- Notebook de despliegue en SageMaker (Chronos-Bolt): https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/deploy-chronos-bolt-to-amazon-sagemaker.ipynb
- Tutorial de Chronos en AutoGluon: https://auto.gluon.ai/stable/tutorials/timeseries/forecasting-chronos.html
- Documentacion de AutoGluon TimeSeries: https://auto.gluon.ai/stable/index.html
- Metricas WQL y MASE en AutoGluon: https://auto.gluon.ai/stable/tutorials/timeseries/forecasting-metrics.html
- Grafico de velocidad comparativa: https://autogluon.s3.amazonaws.com/images/chronos_bolt_speed.svg
- Grafico de precision comparativa: https://autogluon.s3.amazonaws.com/images/chronos_bolt_accuracy.svg
