# OneScience-Group/OneForecast

## Resumen

OneForecast es un marco universal para la predicción meteorológica global y regional anidada, desarrollado por el equipo del profesor Xiaomeng Huang del Departamento de Ciencias del Sistema Terrestre de la Universidad de Tsinghua, en colaboración con varias instituciones. El artículo correspondiente ha sido aceptado en ICML 2025 y está disponible en arXiv (2502.00338). El modelo aborda el problema de equilibrar pronósticos globales de baja resolución con pronósticos regionales de alta resolución, así como el suavizado excesivo en la predicción de eventos extremos, mediante el uso de redes neuronales de grafos (GNN).

La implementación publicada en Hugging Face es una reproducción del artículo original, entrenada sobre datos de reanálisis ERA5. El repositorio incluye scripts para entrenamiento, ajuste fino, inferencia y visualización de resultados, con soporte para entrenamiento multi-GPU mediante PyTorch DDP. Los pesos del modelo entrenado están pendientes de subida, por lo que la reproducibilidad actual se basa en el código y los datos proporcionados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN) con anidamiento global-regional |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de pronóstico meteorológico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (interfaz y documentación; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints .tar), safetensors no especificado |

## Arquitectura y entrenamiento

OneForecast se basa en redes neuronales de grafos (GNN) con un esquema de anidamiento neuronal para combinar la predicción global con la regional. A diferencia de los enfoques que tratan las salidas del modelo global como forzamiento externo en la región de interés, este método aplica un refinamiento local entrenable dentro de la propia estructura de la red, lo que permite aprovechar plenamente la información del modelo global. El entrenamiento se realiza sobre datos de reanálisis ERA5, proporcionados por el dataset OneScience/ERA5 en Hugging Face. El repositorio actual incluye una porción del conjunto de datos completo debido a limitaciones de tamaño de archivo.

El código está implementado en PyTorch y soporta entrenamiento con una sola GPU o con múltiples GPUs/DCUs mediante `torchrun` y data parallelism. También se ofrece un script para generar datos sintéticos con el fin de verificar el protocolo de datos y el flujo del programa, sin valor científico para la calidad del pronóstico. El ajuste fino se realiza a partir del checkpoint de entrenamiento, y la inferencia genera predicciones para el año de prueba, guardándolas en `outputs/predictions/`.

## Capacidades

- Pronóstico meteorológico global con resolución limitada (basado en ERA5).
- Pronóstico regional de alta resolución mediante refinamiento local anidado en la red neuronal.
- Manejo de eventos extremos con mitigación del suavizado excesivo, una limitación común en modelos de IA meteorológica.
- Entrenamiento y ajuste fino sobre datos de reanálisis ERA5.
- Inferencia y visualización de resultados mediante scripts incluidos.
- Soporte para ejecución en GPU (CUDA) y DCU (con DTK instalado).
- Integración con el ecosistema OneScience para construcción de modelos científicos basados en lenguaje natural.

## Casos de uso

- Predicción meteorológica operativa a escala global: el modelo puede generar pronósticos de campos atmosféricos (temperatura, presión, viento, etc.) a partir de datos de reanálisis, adecuado para servicios meteorológicos que necesitan salidas a medio plazo.
- Downscaling regional: gracias a su arquitectura anidada, puede producir pronósticos de alta resolución para una región específica sin perder la información del contexto global, útil para agricultura, aviación o gestión de recursos hídricos.
- Investigación en ciencias atmosféricas: los investigadores pueden utilizar el marco para estudiar fenómenos extremos (olas de calor, tormentas) y comparar el comportamiento del modelo frente a métodos tradicionales.
- Verificación de protocolos de datos y flujos de entrenamiento: el script de datos sintéticos permite validar la instalación y el pipeline antes de lanzar entrenamientos costosos.
- Formación y docencia en IA aplicada a la Tierra: al ser un repositorio abierto con licencia MIT, puede emplearse en cursos universitarios para enseñar arquitecturas GNN aplicadas a la predicción meteorológica.
- Integración en plataformas de IA para ciencia (AI4S): el modelo puede ejecutarse dentro del entorno OneCode de OneScience, facilitando su uso a investigadores sin conocimientos profundos de programación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de ICML 2025 (arXiv:2502.00338) podría contener métricas, pero no se han extraído en los datos proporcionados. Se recomienda consultar la publicación original para obtener comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia; la CPU solo es viable para importar el modelo y realizar pruebas de conectividad a pequeña escala, siendo el entrenamiento completo muy lento.
- Para usuarios de DCU, se requiere DTK versión 25.04.2 o superior, o la versión recomendada por OneScience para el clúster.
- No se especifican requisitos de VRAM ni modelos de GPU concretos en la documentación disponible.
- El entrenamiento multi-GPU está soportado mediante PyTorch DDP y `torchrun`, permitiendo escalar a varios dispositivos.
- Opciones de despliegue: el modelo se ejecuta mediante scripts de Python (train.py, inference.py) en un entorno conda con las dependencias de OneScience (`onescience[earth-gpu]` o `onescience[earth-dcu]`). No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Existen otros modelos de predicción meteorológica basados en IA, como GraphCast (DeepMind) o Pangu-Weather (Huawei), pero no se han encontrado comparaciones directas en las fuentes consultadas. La arquitectura de anidamiento neuronal de OneForecast es una característica distintiva frente a enfoques que tratan el pronóstico global como forzamiento externo, según se describe en el artículo.

## Limitaciones y advertencias

- El repositorio actual es una reproducción del artículo original, no el código oficial del equipo de Tsinghua; puede haber diferencias en la implementación.
- Los pesos del modelo entrenado aún no están disponibles ("se subirán pronto"), por lo que la reproducción de resultados requiere entrenar desde cero, lo que implica un coste computacional significativo.
- El dataset ERA5 incluido es solo una porción del conjunto completo; los usuarios deben descargar el dataset completo por separado si necesitan entrenar con todos los datos.
- El modelo está diseñado para datos de reanálisis ERA5; su aplicación a otras fuentes de datos meteorológicos requeriría adaptaciones.
- No se especifican métricas de error ni validaciones formales en la información proporcionada; se debe consultar el artículo para evaluar su rendimiento real.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre la precisión de los pronósticos recae en el usuario.
- El modelo no es un LLM; no procesa lenguaje natural ni tiene capacidades de generación de texto.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/OneForecast
- Paper (arXiv): https://arxiv.org/abs/2502.00338
- Dataset ERA5 (Hugging Face): https://huggingface.co/datasets/OneScience/ERA5
- Repositorio principal OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de skills OneScience (GitHub): https://github.com/onescience-ai/oneskills
- OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- OneScience (web): https://www.onescience.ai/models
