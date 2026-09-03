# OneScience-Group/ClimODE

## Resumen

ClimODE es un modelo de pronóstico meteorológico y climático basado en ecuaciones diferenciales ordinarias neuronales (Neural ODE) con un sesgo inductivo físico de transporte. Fue propuesto en 2024 por investigadores de la Universidad Aalto y otras instituciones colaboradoras, y esta versión en HuggingFace es una adaptación realizada por OneScience-Group, no el lanzamiento oficial del grupo Aalto-QuML. El modelo modela la evolución atmosférica como un sistema dinámico en tiempo continuo, lo que permite predicciones a escala global, mensual y regional con estimaciones de incertidumbre.

La relevancia de ClimODE radica en su enfoque physics-informed: en lugar de tratar el pronóstico como una tarea puramente estadística, incorpora la ecuación de transporte como restricción física dentro de la red neuronal, mejorando la coherencia dinámica de las predicciones. Está entrenado con datos ERA5, utilizando cinco variables atmosféricas (geopotencial, temperatura, temperatura a 2 metros, y componentes del viento a 10 metros) rejilladas a una resolución de 32x64 grados. Es una alternativa ligera y eficiente a los modelos operativos tradicionales, con aplicaciones en investigación y predicción operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neural ODE con sesgo inductivo de transporte (physics-informed) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de pronóstico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoints .pth) |

## Arquitectura y entrenamiento

ClimODE se basa en una red neuronal de ecuaciones diferenciales ordinarias (Neural ODE) que representa la evolución atmosférica como un sistema continuo en el tiempo. La innovación principal es la incorporación de un sesgo inductivo físico basado en la ecuación de transporte, que obliga al modelo a respetar la conservación y advección de las variables atmosféricas. Esta aproximación mejora la interpretabilidad y la estabilidad temporal de las predicciones frente a modelos puramente autoregresivos.

El entrenamiento se realiza con datos del reanálisis ERA5, utilizando cinco variables: geopotencial (z), temperatura (t), temperatura a 2 metros (t2m) y componentes del viento u10 y v10. Los campos originales de 721x1440 puntos se rejillan a una resolución de 32x64 para el modelo. El dataset OneScience/ERA5 proporciona un subconjunto de estos datos para reproducir el entrenamiento. No se especifican detalles sobre el número de tokens (no aplica), el volumen total de datos ni el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La implementación permite entrenamiento en una o varias GPUs mediante PyTorch DistributedDataParallel.

## Capacidades

- Pronóstico meteorológico global a corto y medio plazo, con salidas para las cinco variables entrenadas.
- Predicción con estimación de incertidumbre mediante el cálculo de CRPS (Continuous Ranked Probability Score).
- Evaluación con métricas estándar: RMSE ponderado por latitud y coeficiente de correlación de anomalías (ACC).
- Soporte para fine-tuning desde checkpoints preentrenados.
- Generación de datos sintéticos para validación de pipelines cuando no se dispone de ERA5 real.
- Ejecución en entornos multi-GPU con torchrun y backend NCCL.
- Compatibilidad con hardware DCU (aceleradores chinos) mediante el paquete onescience[earth-dcu].

## Casos de uso

- Investigación en ciencias atmosféricas: evaluar el comportamiento de un modelo Neural ODE con sesgo físico frente a métodos estadísticos clásicos, utilizando las métricas RMSE, ACC y CRPS para comparar.
- Pronóstico operativo de temperatura y viento a escala regional: el modelo puede generar predicciones a 32x64 grados, adecuadas para estudios de clima local cuando se requiere rapidez y bajo coste computacional.
- Validación de pipelines de datos meteorológicos: gracias al script de generación de datos sintéticos (fake_data.py), se puede comprobar la carga, entrenamiento e inferencia sin necesidad de descargar ERA5 completo.
- Entrenamiento distribuido en clusters: con torchrun y NCCL, se puede escalar el entrenamiento a múltiples GPUs para reducir el tiempo de experimentación.
- Fine-tuning para dominios específicos: partir de un checkpoint oficial (cuando esté disponible) y ajustar el modelo con datos regionales adicionales para mejorar la precisión local.
- Enseñanza y demostraciones de IA4S (IA para la ciencia): el entorno OneCode permite ejecutar el modelo en línea para demostraciones educativas sin configuración local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el paper original (arXiv:2404.10024) reporta métricas, pero no se incluyen valores numéricos en esta ficha. La evaluación se realiza mediante scripts que calculan RMSE, ACC y CRPS, pero no se proporcionan cifras comparativas.

## Requisitos de hardware

- Se requiere una GPU o DCU reconocida por PyTorch para entrenamiento e inferencia. La CPU solo sirve para generar datos sintéticos y revisar configuración.
- No se especifica la VRAM mínima ni el número de parámetros, por lo que no se puede estimar con precisión. Dado el tamaño de entrada (32x64) y la arquitectura Neural ODE, es probable que quepa en GPUs de consumo medio, pero no hay datos confirmados.
- Para entrenamiento multi-GPU se usa NCCL; se recomienda verificar compatibilidad de drivers y versiones de PyTorch.
- En entornos DCU se requiere DTK 25.04.2 o superior.
- Opciones de despliegue: scripts de entrenamiento e inferencia en PyTorch; no se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo generativo de texto.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar ClimODE con otros modelos de pronóstico meteorológico basados en IA (como Pangu-Weather, GraphCast o FourCastNet) en términos de parámetros, contexto o rendimiento. La model card no incluye datos comparativos. Se recomienda consultar el paper original para una comparación científica.

## Limitaciones y advertencias

- Resolución espacial limitada (32x64 grados), muy inferior a la de los modelos operativos de alta resolución; no apto para predicciones detalladas a escala de ciudad.
- Solo cinco variables atmosféricas; no cubre precipitación, humedad, radiación u otras variables relevantes.
- Los datos sintéticos generados con fake_data.py no representan ERA5 y no pueden reproducir las métricas del paper.
- La versión de HuggingFace es una adaptación de OneScience, no el lanzamiento oficial del grupo Aalto-QuML; puede haber diferencias con el modelo original.
- Los pesos oficiales del modelo aún no están disponibles ("will be uploaded soon"), por lo que el checkpoint de entrenamiento debe generarse localmente.
- No es un modelo de lenguaje; no soporta generación de texto ni interacción conversacional.
- Licencia Apache-2.0 permite uso comercial, pero se debe citar el paper original y la adaptación según las condiciones de OneScience.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/ClimODE
- Paper arXiv: https://arxiv.org/abs/2404.10024
- Dataset ERA5 (OneScience): https://huggingface.co/datasets/OneScience/ERA5
- Repositorio OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio de skills OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Repositorio de skills OneScience (Gitee): https://gitee.com/onescience-ai/oneskills
