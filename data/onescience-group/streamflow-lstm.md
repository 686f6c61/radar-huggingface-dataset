# OneScience-Group/Streamflow-LSTM

## Resumen

Streamflow-LSTM es una reproducción de ingeniería del método de predicción de caudal fluvial basado en LSTM específicas por aforo propuesto por Hunt et al. (2022). El modelo toma los siete días previos de secuencias meteorológicas e hidrológicas cada seis horas (28 pasos temporales con 23 variables por paso) y genera 40 predicciones cada seis horas, equivalentes a diez días de horizonte, para diez aforos del oeste de Estados Unidos.

Lo desarrolla OneScience-Group como parte de su ecosistema de ciencia de la Tierra, partiendo del trabajo de investigadores de la University of Reading, el ECMWF, la Loughborough University y el UK Centre for Ecology and Hydrology. A diferencia de un modelo de lenguaje, se trata de una LSTM apilada entrenada por aforo, con aprendizaje temporal independiente para cada estación y agregación por ensemble.

Su relevancia actual es metodológica: sirve para validar flujos de trabajo completos de generación de datos, entrenamiento, inferencia y evaluación hidrológica, y para comparar contra líneas base de persistencia y un proxy sintético de GloFAS. El repositorio no publica pesos oficiales preentrenados, por lo que el artefacto útil es el pipeline reproducible, no un checkpoint listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM apilada específica por aforo (gauge-specific stacked LSTM), con ensemble de miembros por inicialización aleatoria |
| Parametros totales | No disponible (depende de la configuración; en modo paper, 50 unidades ocultas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 28 pasos temporales de 6 horas (7 días) con 23 variables por paso; formato de entrada `[B, 28, 23]` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo procesa series numéricas, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`result/checkpoints/streamflow_lstm.pt`) |
| Framework | PyTorch |
| Horizonte de prediccion | 40 pasos de 6 horas (10 días), salida en m³ s⁻¹ |
| Numero de aforos | 10 (oeste de Estados Unidos) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM apilada entrenada de forma independiente para cada aforo, siguiendo el protocolo `10x28x23x40`: diez aforos, 28 pasos de entrada de seis horas, 23 variables por paso y 40 pasos de salida. La entrada combina observaciones de caudal y variables meteorológicas medias por cuenca; en el modo de inferencia, el caudal observado se congela tras el instante de emisión para evitar fuga de observaciones futuras. El entrenamiento usa MSE como función de pérdida, optimizador Adam con tasa de aprendizaje `0.001` y dropout de `0.1` para cada miembro del ensemble.

El pipeline permite entrenamiento en una GPU con `scripts/train.py` o distribuido en ocho procesos con `torchrun`. En el modo por defecto se seleccionan los dos mejores miembros por NSE de validación y se promedian; el flag `--paper` restaura 50 unidades ocultas, 100 miembros por aforo y la selección de los cinco mejores. Todos los aforos y miembros se consolidan en un único checkpoint que almacena además las estadísticas de normalización y los valores de NSE de validación. Las fuentes de datos del artículo original son ERA5, IFS, GloFAS y USGS, aunque el repositorio distribuye datos sintéticos deterministas que solo validan la ingeniería y no reproducen la escala ni el rendimiento del paper.

## Capacidades

- Predicción de caudal específica por aforo: genera 40 series de seis horas (10 días) para cada uno de los diez aforos del oeste de Estados Unidos.
- Aprendizaje temporal independiente por estación, sin compartir parámetros entre aforos.
- Ensemble por inicialización aleatoria: hasta 100 miembros por aforo en modo paper, con selección por NSE de validación y promediado.
- Evaluación integrada con métricas hidrológicas: KGE (con sus componentes de correlación, variabilidad y sesgo), NSE y RMSE a horizontes de 2, 5 y 8 días.
- Comparación con líneas base de persistencia en el instante de emisión y con un proxy sintético de GloFAS.
- Restricción de salidas a caudal no negativo mediante recorte.
- Entrenamiento multi-GPU y multi-DCU con `torchrun` y consolidación en un único checkpoint.
- Generación de datos sintéticos deterministas que preservan el protocolo `10x28x23x40`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni generación de texto.

## Casos de uso

- Predicción operativa por aforo: el modelo produce 40 salidas cada seis horas para cada una de las diez estaciones, lo que permite emitir avisos hidrológicos a diez días con resolución intra-diaria en m³ s⁻¹.
- Investigación en ensembles hidrológicos: el pipeline entrena múltiples miembros por inicialización y selecciona los mejores por NSE de validación, lo que facilita estudiar la dispersión del ensemble y el efecto del promediado en la robustez de la predicción.
- Comparación metodológica con líneas base: al incorporar evaluación frente a persistencia y a un proxy de GloFAS, sirve para cuantificar la mejora atribuible a la LSTM en cada aforo y horizonte.
- Validación de ingeniería sin datos propietarios: con `scripts/fake_data.py` se genera un conjunto sintético que mantiene las dimensiones y el orden de los diez aforos, permitiendo probar el flujo completo en CPU antes de escalar.
- Despliegue en clústeres DCU: la instalación `onescience[earth-dcu]` con DTK 25.04.2 o superior permite entrenar el ensemble a escala del paper en hardware nacional, distribuyendo tareas de aforo-miembro con `torchrun`.
- Docencia y reproducibilidad: el repositorio incluye puntos de entrada separados para generación de datos, entrenamiento, inferencia, evaluación y visualización, lo que lo hace adecuado como plantilla didáctica de un flujo AI4S completo.
- Integración en plataformas OneCode o ModelScope: los scripts se pueden ejecutar de extremo a extremo en entornos gestionados para validar la conectividad y el formato del checkpoint antes de un entrenamiento a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados obtenidos con los datos sintéticos del repositorio validan únicamente la ingeniería y no representan el rendimiento del artículo original. El paper referenciado (doi.org/10.5194/hess-26-5449-2022) contiene la evaluación científica, pero sus cifras no se reproducen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card solo indica que se recomienda GPU o DCU para el ensemble a escala del paper.
- CPU: suficiente para validación de conectividad con la configuración de muestra pequeña por defecto.
- GPU recomendadas: no se especifican modelos concretos; se indica compatibilidad con entornos GPU y DCU.
- DCU: requiere DTK 25.04.2 o posterior, o la versión recomendada por OneScience para el clúster actual.
- Encaje en GPU de consumo: no disponible. El tamaño del modelo (50 unidades ocultas en modo paper, hasta 100 miembros por aforo) sugiere que el cuello de botella es el número de miembros del ensemble más que el tamaño de una red individual, pero no se aportan cifras.
- Opciones de despliegue: scripts propios de PyTorch (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`), con instalación vía `pip install onescience[earth-gpu]` o `onescience[earth-dcu]`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno: Python 3.11 con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12` en la variante GPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Horizonte | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Streamflow-LSTM | LSTM apilada por aforo con ensemble | 28 pasos x 23 variables | 40 pasos (10 días) | apache-2.0 | Reproducción local; el paper no publica pesos cargables |
| Persistencia (línea base del paper) | Método estadístico sin aprendizaje | Caudal en el instante de emisión | 40 pasos | No aplica | Incluido como referencia en la evaluación |
| Proxy sintético de GloFAS (línea base del paper) | Referencia de reanálisis/pronóstico | No disponible | No disponible | No disponible | Proxy sintético en el repositorio |

No se dispone de información sobre otros modelos de la misma categoría publicados en HuggingFace con los que comparar parámetros, contexto o rendimiento de forma detallada.

## Limitaciones y advertencias

- Reproducción de ingeniería, no oficial: el repositorio no incluye pesos preentrenados del paper. La carpeta `weight/` contiene únicamente una nota de estado, y ningún checkpoint local debe presentarse como oficial.
- Datos sintéticos: los conjuntos distribuidos no representan las distribuciones reales, el entrenamiento a escala del paper ni su rendimiento. Los resultados obtenidos con ellos solo validan el flujo de trabajo.
- Ámbito restringido a diez aforos concretos del oeste de Estados Unidos. El modelo no generaliza a otras cuencas sin reentrenamiento específico por aforo.
- Riesgo de fuga de observaciones: el pipeline congela el caudal observado tras el instante de emisión; cualquier modificación de este comportamiento invalidaría la evaluación.
- Recorte de salidas: las predicciones se truncan a valores no negativos, lo que puede enmascarar errores de sesgo en caudales muy bajos.
- Etiqueta de idioma `en` declarada, aunque el modelo consume series numéricas y no procesa lenguaje natural.
- Sin benchmarks publicados en la información disponible; no es posible comparar su rendimiento con alternativas sin acudir al paper original.
- Dependencia de ecosistema: la instalación se realiza desde el índice `mirrors.onescience.ai`, lo que puede complicar la reproducibilidad en entornos ajenos a OneScience.
- Sin soporte documentado para servidores de inferencia estándar (vLLM, TGI, Ollama), lo que limita su integración en pilas de despliegue convencionales.
- Licencia apache-2.0: permite uso comercial y modificación, pero al no existir pesos oficiales, la licencia se aplica al código y a los artefactos generados localmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/Streamflow-LSTM
- Paper de referencia: https://doi.org/10.5194/hess-26-5449-2022
- Plataforma OneCode de OneScience: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Índice de paquetes de OneScience: http://mirrors.onescience.ai:3141/pypi/simple/
