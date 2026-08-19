# openclimatefix-models/cloudcasting_uk

## Resumen

El modelo `cloudcasting_uk` es un sistema de predicción de imágenes satelitales desarrollado por Open Climate Fix en colaboración con el Alan Turing Institute. Su función es tomar tres horas de imágenes satelitales recientes, capturadas a intervalos de 15 minutos, y predecir las tres horas siguientes con la misma frecuencia temporal. Las entradas y salidas son datos multiespectrales con 11 canales, lo que permite capturar información relevante para el seguimiento de nubes y la radiación solar.

Este modelo está diseñado específicamente para el nowcasting de nubes, una tarea crítica para la integración de energía solar en la red eléctrica. Al anticipar la cobertura nubosa, los operadores de red y los comercializadores de energía pueden ajustar sus previsiones de generación fotovoltaica y reducir la dependencia de plantas de respaldo basadas en combustibles fósiles. El modelo se ha entrenado con datos del satélite EUMETSAT SEVIRI, disponibles a través de un dataset público de Google Cloud, y su código de entrenamiento está publicado en el repositorio `sat_pred` de Open Climate Fix.

Con aproximadamente 30,3 millones de parámetros y un tamaño de 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de gama media. Su licencia MIT permite uso comercial sin restricciones, lo que facilita su adopción en entornos industriales. Aunque no se han publicado resultados de benchmarks en la información disponible, los registros de entrenamiento están accesibles en Weights & Biases para su revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica en la documentacion) |
| Parametros totales | 30.274.955 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana temporal de entrada: 3 horas (12 frames); salida: 3 horas (12 frames) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La documentacion disponible no describe la arquitectura interna del modelo en detalle. Se sabe que esta implementado en PyTorch y que procesa secuencias de imagenes satelitales. Dado su tamano (30 millones de parametros) y su proposito (prediccion de series temporales de imagenes), es probable que se trate de una red convolucional o un modelo basado en atencion espaciotemporal, pero no se puede confirmar sin informacion adicional.

El entrenamiento se realizo con datos de EUMETSAT SEVIRI, obtenidos del dataset publico de Google Cloud. El preprocesamiento sigue el protocolo definido en el repositorio `cloudcasting` del Alan Turing Institute. No se menciona el uso de tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje. Los registros de entrenamiento estan disponibles en Weights & Biases bajo el proyecto `openclimatefix/sat_pred`.

## Capacidades

- Prediccion de futuros fotogramas de imagenes satelitales: toma 12 frames historicos (3 horas) y genera 12 frames futuros (3 horas) a intervalos de 15 minutos.
- Procesamiento multiespectral con 11 canales, lo que permite capturar informacion de diferentes bandas del espectro (visible, infrarrojo, etc.).
- Especializado en el seguimiento de nubes y la estimacion de cobertura nubosa, util para el pronostico de radiacion solar.
- No es un modelo de lenguaje ni soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision general, solo procesa datos satelitales especificos.
- Multilingue: no aplica, el modelo trabaja con datos numericos de imagenes, no con texto.

## Casos de uso

- Pronostico de generacion solar fotovoltaica: el modelo predice la cobertura nubosa futura, lo que permite estimar la irradiancia solar y, por tanto, la produccion esperada de plantas solares. Los operadores pueden ajustar sus previsiones de generacion con hasta 3 horas de antelacion.
- Operacion de redes electricas: los gestores de red pueden utilizar las predicciones para anticipar fluctuaciones en la generacion renovable y planificar el despacho de plantas de respaldo o sistemas de almacenamiento, reduciendo costes y emisiones.
- Comercio de energia: los comercializadores pueden usar las previsiones para optimizar sus posiciones en el mercado intradiario, mejorando la precision de sus ofertas de generacion solar.
- Gestion de activos solares: los propietarios de plantas fotovoltaicas pueden planificar el mantenimiento o la limpieza de paneles en funcion de la nubosidad prevista.
- Investigacion en nowcasting meteorologico: el modelo sirve como base para estudios sobre prediccion de nubes a corto plazo, y puede adaptarse a otras regiones o fuentes de datos satelitales.
- Integracion en sistemas de control de microrredes: en microrredes con alta penetracion solar, las predicciones de nubosidad permiten gestionar mejor el balance entre generacion, consumo y almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los registros de entrenamiento estan en Weights & Biases, pero no se incluyen metricas cuantitativas como MAE, RMSE o skill score en la model card ni en los resultados de busqueda web. Por tanto, no es posible comparar su rendimiento con otros modelos de nowcasting sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: no disponible, pero con 30 millones de parametros y un peso de 0,2 GB, el modelo es ligero y probablemente cabe en GPUs con 4 GB de VRAM o menos en precision FP32.
- GPU recomendadas: no se especifica, pero por su tamano deberia ejecutarse sin problemas en GPUs consumer como RTX 3060, RTX 4060 o superiores. Tambien podria ejecutarse en CPU para inferencia en tiempo real si se optimiza adecuadamente.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, o integrarse en pipelines de inferencia con ONNX Runtime o TensorRT. Tambien es compatible con frameworks de despliegue como Ray Serve o BentoML.
- Latencia y throughput: no se proporcionan datos, pero al ser un modelo pequeno, la inferencia deberia ser rapida (del orden de milisegundos por prediccion en GPU moderna).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (nowcasting de nubes con datos satelitales). Existen otros proyectos como el modelo `cloudcasting` del Alan Turing Institute, pero no se han encontrado datos de comparacion. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al entrenarse con datos de EUMETSAT SEVIRI, su rendimiento puede degradarse en regiones fuera del area de cobertura del satelite o con condiciones meteorologicas poco representadas en el dataset.
- Riesgo de alucinacion: no aplica, ya que no genera texto, pero si puede producir predicciones inexactas en situaciones de nubosidad muy variable o eventos extremos.
- Limitaciones de contexto: la ventana de entrada es fija (3 horas) y no se puede ampliar sin reentrenar el modelo.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, siempre que se incluya el aviso de copyright.
- Caveat para produccion: el modelo fue entrenado con datos de una region especifica (Reino Unido, segun el nombre `uk`), por lo que su aplicacion a otras regiones requiere validacion y posible reentrenamiento con datos locales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openclimatefix-models/cloudcasting_uk
- Modelo alternativo (misma organizacion): https://huggingface.co/openclimatefix/cloudcasting_uk
- Repositorio de entrenamiento (sat_pred): https://github.com/openclimatefix/sat_pred
- Repositorio de preprocesamiento (cloudcasting): https://github.com/alan-turing-institute/cloudcasting
- Pagina del proyecto Cloudcasting: https://www.openclimatefix.org/work/cloudcasting
- Sitio web de Open Climate Fix: https://www.openclimatefix.org/
- Dataset de EUMETSAT en Google Cloud: https://console.cloud.google.com/marketplace/product/bigquery-public-data/eumetsat-seviri-rss
- Registros de entrenamiento en Weights & Biases: https://wandb.ai/openclimatefix/sat_pred/runs/xlq6w7qj
