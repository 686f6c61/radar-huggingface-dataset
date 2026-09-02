# OneScience-Group/SmaAtUNet

## Resumen

SmaAt-UNet es una red neuronal convolucional ligera diseñada para el nowcasting de precipitación, es decir, la predicción a muy corto plazo (hasta 30 minutos) de la distribución de lluvia a partir de mapas de radar meteorológico. El modelo fue propuesto originalmente por investigadores de la Universidad de Maastricht en el artículo "SmaAt-UNet: Precipitation Nowcasting using a Small Attention-UNet Architecture" (arXiv:2007.04417), y esta versión alojada en Hugging Face es una reproducción independiente del grupo OneScience, que proporciona scripts de entrenamiento, inferencia y evaluación sobre datos sintéticos para validar el flujo de trabajo.

La arquitectura combina un U-Net con un módulo de atención convolucional (CBAM) y convoluciones depthwise-separable, lo que permite mantener un rendimiento competitivo con un número de parámetros significativamente menor que las arquitecturas U-Net estándar. El modelo toma como entrada 12 imágenes de radar consecutivas (12×288×288 píxeles, con intervalos de 5 minutos) y predice 6 mapas de precipitación futuros (6×288×288), correspondientes a los próximos 30 minutos. Está entrenado con aproximadamente 420.000 mapas de radar del KNMI neerlandés (2016-2019) y evaluado también con datos de nubosidad binaria de Francia.

La relevancia actual de este modelo radica en su eficiencia computacional: al ser extremadamente ligero (el paper original reporta una reducción drástica de parámetros frente a U-Net), es adecuado para despliegues en tiempo real en estaciones meteorológicas o sistemas embebidos, donde los recursos de cómputo son limitados. Además, su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con Convolutional Block Attention Module (CBAM) y convoluciones depthwise-separable |
| Parametros totales | no disponible (el paper original reporta una reduccion significativa frente a U-Net, pero no se indica la cifra exacta en la documentacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de 12 imagenes de radar de 288×288 píxeles, salida de 6 imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa datos de radar, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint .pt, generado por los scripts de entrenamiento; no se distribuyen pesos preentrenados) |

## Arquitectura y entrenamiento

SmaAt-UNet emplea una arquitectura basada en U-Net, modificada con dos elementos clave: el Convolutional Block Attention Module (CBAM), que aplica atención tanto en el canal como en el espacio para resaltar características relevantes, y convoluciones depthwise-separable, que reducen el número de parámetros y el coste computacional en comparación con las convoluciones estándar. Esta combinación permite que el modelo mantenga una precisión comparable a U-Nets más grandes, pero con una huella de memoria y cómputo mucho menor.

El entrenamiento se realizó con aproximadamente 420.000 mapas de radar de precipitación del KNMI (Instituto Real Meteorológico de los Países Bajos), recopilados entre 2016 y 2019 a intervalos de 5 minutos. También se evaluó el modelo sobre datos binarios de nubosidad de Francia. No se menciona el uso de técnicas de RLHF o DPO, ya que no es un modelo generativo de lenguaje, sino una red de regresión de imágenes. La reproducción de OneScience proporciona scripts para entrenar con datos sintéticos normalizados (que mantienen las dimensiones reales del problema: entrada 12×288×288, salida 6×288×288) y soporta entrenamiento distribuido multi-GPU mediante `torchrun`.

## Capacidades

- Nowcasting de precipitación: predice la distribución de lluvia para los próximos 30 minutos a partir de los últimos 60 minutos de observaciones de radar.
- Regresión de imágenes multi-paso: genera 6 mapas de precipitación consecutivos de una sola vez.
- Predicción de nubosidad: evaluado también sobre datos binarios de cobertura de nubes.
- Extracción de características con atención: el módulo CBAM resalta canales y regiones espaciales importantes, lo que puede ser útil para otras tareas de visión meteorológica.
- Entrenamiento distribuido: soporta multi-GPU mediante `torchrun`, lo que permite escalar el entrenamiento.
- Inferencia ligera: al ser un modelo pequeño, es adecuado para ejecución en tiempo real en hardware limitado.

## Casos de uso

- Alertas meteorológicas locales: un ayuntamiento o servicio de protección civil puede desplegar el modelo en una estación con GPU de bajo consumo para emitir avisos de lluvia intensa en los próximos 30 minutos, basándose en los mapas de radar locales.
- Agricultura de precisión: los agricultores pueden integrar las predicciones de precipitación a corto plazo en sistemas de riego automatizado para evitar el riego innecesario cuando se espera lluvia, optimizando el consumo de agua.
- Gestión de aguas pluviales urbanas: las empresas de saneamiento pueden anticipar picos de escorrentía y ajustar las compuertas de los sistemas de drenaje en consecuencia, usando las salidas del modelo como entrada a sus sistemas de control.
- Validación de flujos de trabajo de IA para ciencias de la Tierra: el repositorio de OneScience proporciona un entorno de datos sintéticos que permite a los equipos verificar sus pipelines de entrenamiento, inferencia y evaluación antes de trabajar con datos reales.
- Investigación en nowcasting: los investigadores pueden utilizar el modelo como referencia ligera para comparar con arquitecturas más pesadas o como punto de partida para extensiones (por ejemplo, la variante TA-SmaAt-UNet que añade conciencia temporal).
- Integración en sistemas de predicción meteorológica híbridos: el modelo puede combinarse con salidas de modelos numéricos de predicción del tiempo (NWP) para refinar la resolución espacial y temporal en ventanas de muy corto plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación del repositorio indica que los scripts de evaluación calculan métricas como MSE, MAE, Precision, Recall, F1, CSI, FAR y HSS, pero los resultados mostrados con datos sintéticos son únicamente para validar el flujo de trabajo y no representan el rendimiento sobre el conjunto de prueba real del paper. Para conocer las métricas exactas del modelo original, es necesario consultar el artículo arXiv:2007.04417.

## Requisitos de hardware

- El modelo es muy ligero (el paper original enfatiza la reducción de parámetros frente a U-Net), por lo que es viable en GPUs de consumo, aunque no se especifican cifras de VRAM en la documentación.
- El repositorio recomienda usar una GPU o DCU para entrenamiento; una CPU puede utilizarse para validar la conectividad con la configuración de muestra pequeña.
- Para usuarios de DCU, se requiere instalar DTK 25.04.2 o posterior.
- El entrenamiento multi-GPU está soportado mediante `torchrun`; el ejemplo del repositorio utiliza 8 procesos por nodo.
- No se indican opciones de despliegue específicas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje; la inferencia se realiza mediante scripts de PyTorch estándar.
- Al no haber datos oficiales de latencia o throughput, no se pueden proporcionar estimaciones concretas; sin embargo, la arquitectura ligera sugiere que la inferencia es rápida incluso en hardware modesto.

## Comparativa con modelos similares

No se dispone de comparativas cuantitativas en la información proporcionada. Otros modelos de nowcasting de precipitación basados en deep learning incluyen TrajGRU, MetNet y U-Net estándar, pero no se han encontrado tablas comparativas con SmaAt-UNet en las fuentes consultadas. Se recomienda revisar el paper original para ver la comparación con U-Net y otras arquitecturas.

## Limitaciones y advertencias

- El repositorio de OneScience no incluye pesos preentrenados descargables; los scripts generan sus propios checkpoints a partir de datos sintéticos, que no son útiles para predicción real.
- El modelo fue entrenado con datos de los Países Bajos (KNMI) y evaluado con datos franceses; su rendimiento en otras regiones geográficas puede degradarse debido a diferencias climáticas y de calibración de radar.
- La resolución espacial de 288×288 píxeles y el horizonte de 30 minutos pueden no ser suficientes para aplicaciones que requieran mayor detalle o plazos más largos.
- Al ser un modelo de regresión determinista, no proporciona incertidumbre en las predicciones, lo que puede ser una limitación para la toma de decisiones en situaciones de alto riesgo.
- No se mencionan sesgos específicos, pero es probable que el modelo tenga un rendimiento inferior en eventos de precipitación extrema poco representados en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento originales (KNMI) pueden tener sus propias restricciones de uso; el repositorio advierte que el uso de código y datos está sujeto a las licencias de sus respectivos proyectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/SmaAtUNet
- Repositorio original en GitHub: https://github.com/HansBambel/SmaAt-UNet
- Paper original: https://arxiv.org/abs/2007.04417
- Página del autor (Siamak Mehrkanoon): https://sites.google.com/view/siamak-mehrkanoon/blog/smaat-unet
- Paper relacionado (MAD-SmaAt-GNet): https://arxiv.org/abs/2603.04461
- Repositorio principal de OneScience: https://github.com/onescience-ai/OneScience
- Repositorio de habilidades de OneScience: https://github.com/onescience-ai/oneskills
