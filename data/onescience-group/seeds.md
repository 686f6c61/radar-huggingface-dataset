# OneScience-Group/SEEDS

## Resumen

SEEDS (Scalable Ensemble Envelope Diffusion Sampler) es un modelo generativo de pronóstico meteorológico por conjuntos, publicado por Google en marzo de 2024 y adaptado de forma independiente por el grupo OneScience. Su propósito es emular conjuntos de pronóstico numérico del tiempo a partir de un pequeño número de miembros semilla, reduciendo el coste computacional de generar ensembles completos. El modelo se basa en un enfoque de difusión condicional y se describe en el artículo *SEEDS: Emulation of Weather Forecast Ensembles with Diffusion Models* (arXiv:2306.14066), publicado en *Science Advances*.

La implementación de OneScience-Group proporciona scripts de entrenamiento, inferencia y evaluación, así como soporte para GPU y DCU. Está pensada para investigación en ciencias de la Tierra, permitiendo reproducir el flujo de trabajo del paper con datos propios (formato NPZ en esfera cúbica). El modelo se distribuye bajo licencia Apache 2.0 y está orientado a un público técnico que necesite generar conjuntos de pronóstico de forma eficiente.

Esta ficha se basa únicamente en la información disponible en la model card de HuggingFace y en la documentación oficial del repositorio. No se incluyen datos que no estén explícitamente indicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión condicional |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (documentación en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se menciona un directorio `weight/` pendiente de subir) |

## Arquitectura y entrenamiento

SEEDS es un modelo de difusión condicional que aprende a generar miembros de un ensemble meteorológico a partir de un conjunto reducido de predicciones numéricas (semillas). El proceso de entrenamiento se basa en datos de reforecast del sistema GEFS, mientras que los miembros operativos de GEFS se utilizan como condición de entrada y ERA5 como referencia de evaluación. El repositorio de OneScience no incluye los datos oficiales de entrenamiento; el usuario debe preparar archivos NPZ siguiendo el protocolo de esfera cúbica definido en `conf/config.yaml`.

El entrenamiento se realiza con PyTorch y soporta ejecución en una o varias GPUs mediante `torchrun` con backend NCCL. También es compatible con aceleradores DCU, siempre que se instale el driver DTK adecuado. No se especifican detalles sobre el número de tokens, composición del dataset, ni uso de técnicas como RLHF o DPO. El modelo se presenta como una adaptación independiente del paper original, no como un producto oficial de Google.

## Capacidades

- Generación de conjuntos de pronóstico meteorológico (ensemble weather forecasting) a partir de un número reducido de miembros semilla.
- Emulación de conjuntos de predicción numérica del tiempo con un enfoque generativo basado en difusión.
- Entrenamiento e inferencia sobre datos en formato NPZ con malla de esfera cúbica (cubed-sphere).
- Evaluación de la calidad del pronóstico mediante métricas como RMSE del promedio del ensemble, ACC y CRPS empírico.
- Visualización de resultados (mapas de pronóstico y curvas de pérdida) mediante scripts incluidos.
- Soporte para entrenamiento distribuido multi-GPU con PyTorch DistributedDataParallel.
- Ejecución en entornos GPU (NVIDIA) y DCU (aceleradores chinos) con soporte explícito en la instalación.

## Casos de uso

- Investigación en pronóstico por conjuntos: permite entrenar un modelo de difusión condicional sobre datos propios siguiendo el protocolo NPZ del proyecto, generando ensembles a partir de pocas semillas.
- Validación local del flujo de trabajo: se pueden generar datos sintéticos con `scripts/fake_data.py` para comprobar entrenamiento, inferencia y evaluación sin necesidad de datos reales.
- Integración en pipelines de predicción meteorológica: el modelo puede usarse como generador de ensembles en sistemas que requieran múltiples trayectorias de pronóstico, reduciendo el coste computacional frente a la ejecución completa de modelos numéricos.
- Experimentación académica: útil para comparar métodos generativos frente a técnicas tradicionales de perturbación de condiciones iniciales en la generación de ensembles.
- Despliegue en entornos con aceleradores DCU: la adaptación de OneScience permite ejecutar el modelo en hardware no NVIDIA, ampliando las opciones de infraestructura.
- Reproducción de resultados del paper: los scripts de entrenamiento, inferencia y evaluación facilitan la reproducción de los experimentos descritos en el artículo de *Science Advances*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de ciencias de la Tierra y no de un modelo de lenguaje general. Las métricas de evaluación propias (RMSE, ACC, CRPS) se calculan mediante el script `scripts/result.py`, pero no se proporcionan valores numéricos de referencia.

## Requisitos de hardware

- Se requiere una GPU o DCU reconocida por PyTorch para entrenamiento e inferencia. La CPU solo sirve para generar datos sintéticos y revisar la configuración.
- Para entrenamiento multi-GPU se necesita backend NCCL, por lo que deben ser compatibles los drivers y la versión de PyTorch.
- En entornos DCU es obligatorio instalar DTK (versión 25.04.2 o superior, o la recomendada por OneScience).
- No se especifica la VRAM mínima ni las GPUs concretas recomendadas. La carga de memoria dependerá del tamaño del modelo, que no está documentado.
- Opciones de despliegue: scripts nativos de PyTorch (`train.py`, `inference.py`), con soporte para `torchrun` en multi-GPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. SEEDS es un modelo especializado en emulación de ensembles meteorológicos, y no se han encontrado alternativas directas en las fuentes consultadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es una adaptación independiente del paper de Google, no un producto oficial de Google. La implementación puede diferir de la original.
- Los datos oficiales de entrenamiento (GEFS reforecast, miembros operativos de GEFS, ERA5) no se incluyen en el repositorio. El usuario debe preparar los archivos NPZ según el formato especificado.
- El directorio `weight/` con los pesos entrenados sobre datos oficiales aún no está disponible (se indica que se subirá próximamente). Hasta entonces, solo se puede entrenar desde cero o con datos sintéticos.
- El uso de datos sintéticos generados con `scripts/fake_data.py` solo valida el flujo del programa; no representa la calidad de GEFS, ERA5 ni los resultados del paper.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma, dado que el modelo no procesa texto. Las limitaciones principales son de tipo computacional y de disponibilidad de datos.
- La licencia Apache 2.0 permite uso comercial, pero al ser una adaptación independiente, conviene revisar los términos del paper original y las condiciones de uso de los datos GEFS y ERA5.
- Para producción, es necesario validar la calidad de los ensembles generados con las métricas adecuadas y contrastar con sistemas operativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/SEEDS
- Paper original: https://arxiv.org/abs/2306.14066
- Repositorio principal de OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de skills de OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio de skills de OneScience (Gitee): https://gitee.com/onescience-ai/oneskills
