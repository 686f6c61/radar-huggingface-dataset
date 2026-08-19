# OneScience-Group/StormCast

## Resumen

StormCast es una reproducción comunitaria del modelo de predicción meteorológica regional homónimo desarrollado originalmente por NVIDIA, publicada por el grupo OneScience-Group. El modelo original, descrito en el artículo *StormCast: A Machine Learning Method for Meso-β-Scale Convection-resolving Weather Forecasting* (arXiv:2408.10958), emplea un enfoque generativo basado en difusión para realizar nowcasting de alta resolución de fenómenos convectivos de mesoescala, complementando las predicciones deterministas con estructuras de escala fina que estos no logran representar.

Esta implementación, disponible bajo licencia Apache 2.0, está pensada para el ecosistema OneScience, una plataforma de construcción de modelos científicos basada en lenguaje natural. El repositorio incluye scripts de entrenamiento en dos etapas (regresión determinista y difusión residual condicionada), generación de datos sintéticos para validación de pipeline, y soporte para entrenamiento multi-GPU con `torchrun`. Los pesos entrenados sobre datos de reanálisis ERA5 se anuncian como "disponibles próximamente", por lo que en el momento de redactar esta ficha no se pueden realizar inferencias con el modelo preentrenado.

La relevancia de StormCast radica en su capacidad para emular la evolución atmosférica a escala de tormenta (resolución de 3 km sobre una región de 1536 km × 1920 km en el centro de Estados Unidos, con pasos horarios), un dominio donde los modelos deterministas tradicionales pierden precisión. La versión de OneScience amplía el acceso a esta técnica al integrarla en su plataforma y proporcionar una implementación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión generativa condicionada (dos etapas: regresión determinista + difusión residual) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de predicción meteorológica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (etiquetas del repositorio; el modelo opera sobre datos meteorológicos, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se espera que sean archivos de PyTorch, probablemente .pt o safetensors; no especificado) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño del StormCast original de NVIDIA: un modelo de difusión generativa que condiciona la evolución de estados regionales sobre fondos meteorológicos de gran escala. El enfoque consta de dos etapas de entrenamiento secuenciales: primero se entrena un modelo de regresión determinista que predice el estado atmosférico futuro, y después se entrena un modelo de difusión residual que genera las correcciones de escala fina que el determinista no captura. Este esquema híbrido permite representar la incertidumbre y la variabilidad de pequeña escala típica de la convección profunda.

Los datos de entrenamiento provienen del dataset ERA5 (reanálisis atmosférico de ECMWF), distribuido por OneScience en su repositorio de datos. La implementación actual incluye una porción reducida del dataset completo por limitaciones de tamaño. El entrenamiento puede ejecutarse en una o varias GPUs mediante `torchrun`, y el repositorio incluye un script para generar datos sintéticos que permiten validar el pipeline sin necesidad de los datos reales. No se especifica el número total de tokens ni la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO (no proceden en este dominio). Los pesos entrenados sobre ERA5 se anuncian como "próximamente disponibles".

## Capacidades

- Predicción meteorológica regional de alta resolución: emula la evolución atmosférica a escala de tormenta (3 km de resolución horizontal) en pasos horarios, sobre un dominio de 1536 km × 1920 km centrado en Estados Unidos.
- Nowcasting de convección de mesoescala: genera estructuras de escala fina (nubes, precipitación convectiva) que los modelos deterministas no resuelven adecuadamente.
- Enfoque generativo por difusión: produce múltiples realizaciones posibles del estado futuro, lo que permite cuantificar la incertidumbre predictiva.
- Condicionamiento por fondo de gran escala: integra información meteorológica de gran escala para restringir la evolución regional, mejorando la coherencia física.
- Entrenamiento en dos etapas: regresión determinista seguida de difusión residual, lo que permite descomponer el problema y mejorar la estabilidad del entrenamiento.
- Soporte multi-GPU: entrenamiento distribuido con NCCL mediante `torchrun`.
- Compatibilidad con GPU y DCU: el entorno de ejecución soporta tanto GPUs NVIDIA como aceleradores DCU (con DTK 25.04.2 o superior).

## Casos de uso

- Predicción inmediata de tormentas severas: el modelo puede generar pronósticos horarios de alta resolución de fenómenos convectivos, útil para servicios meteorológicos que necesitan alertas tempranas de granizadas, ráfagas o lluvias intensas.
- Investigación en ciencias atmosféricas: permite estudiar la evolución de sistemas convectivos de mesoescala con una resolución que los modelos globales no alcanzan, facilitando análisis de procesos físicos.
- Validación de pipelines de datos meteorológicos: el script de generación de datos sintéticos (`fake_data.py`) permite probar la carga de datos, el entrenamiento y la inferencia sin depender de los datos ERA5 completos, ideal para integrar en entornos CI/CD.
- Formación y docencia en IA para ciencias de la Tierra: al ser una implementación abierta y reproducible, sirve como ejemplo práctico de aplicación de modelos generativos a la predicción meteorológica.
- Integración en plataformas de IA4S: al estar empaquetado para OneScience/OneCode, puede ejecutarse como un paquete de modelo independiente, instalando dependencias y ejecutando scripts directamente, lo que facilita su uso en flujos de trabajo automatizados.
- Evaluación comparativa de métodos de downscaling: el enfoque de difusión residual puede compararse con técnicas de downscaling estadístico o dinámico para determinar qué método reproduce mejor las estructuras convectivas de pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (como CRPS, RMSE, o índices de destreza frente a modelos deterministas) ni comparaciones con otros sistemas de predicción. El artículo original de NVIDIA (arXiv:2408.10958) reporta evaluaciones, pero estos datos no se reproducen en el repositorio de OneScience.

## Requisitos de hardware

- Entrenamiento e inferencia requieren una GPU o DCU reconocida por PyTorch; la CPU solo sirve para generar datos sintéticos y verificar la configuración.
- Multi-GPU: se necesita NCCL, por lo que las GPUs deben ser compatibles con este backend (típicamente NVIDIA con CUDA, o DCU con DTK 25.04.2 o superior).
- No se especifican requisitos mínimos de VRAM ni modelos de GPU concretos. Dado que se trata de un modelo de difusión sobre datos meteorológicos de alta resolución, es razonable esperar que se necesiten GPUs con al menos 16-24 GB de VRAM para inferencia, pero este dato no está confirmado.
- Opciones de despliegue: el repositorio incluye scripts de entrenamiento (`train.py`) e inferencia (`inference.py`), y es compatible con el entorno OneScience. No se mencionan integraciones con vLLM, Ollama o TGI, que son específicas de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Resolución | Dominio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StormCast (OneScience) | 3 km | Centro de EE. UU. (1536×1920 km) | Difusión generativa + regresión | Apache 2.0 | Pesos pendientes de publicación |
| StormCast (NVIDIA original) | 3 km | Centro de EE. UU. (1536×1920 km) | Difusión generativa + regresión | no disponible (investigación) | Código y pesos no publicados oficialmente |
| GraphCast (Google DeepMind) | 0.25° (~28 km) | Global | Red neuronal de grafos determinista | Apache 2.0 | Pesos disponibles |
| Pangu-Weather (Huawei) | 0.25° (~28 km) | Global | Transformer 3D determinista | no disponible | Pesos disponibles para investigación |

La comparativa se basa en características generales conocidas de estos modelos; los datos de rendimiento específicos de la versión de OneScience no están publicados.

## Limitaciones y advertencias

- Los pesos entrenados sobre ERA5 no están disponibles en el momento de la publicación de esta ficha; el repositorio solo contiene el código y la configuración. Cualquier uso operativo requiere entrenar el modelo desde cero.
- El dataset ERA5 incluido es una porción reducida; para un entrenamiento completo es necesario descargar el dataset completo desde OneScience, lo que implica un gran volumen de datos.
- El modelo está diseñado para un dominio geográfico concreto (centro de EE. UU.) y puede no generalizar bien a otras regiones sin reentrenamiento.
- Al ser un modelo generativo, las predicciones pueden presentar estructuras físicamente inconsistentes en casos extremos; la validación con datos observacionales es imprescindible antes de cualquier uso operativo.
- No se especifican sesgos conocidos, pero los datos de reanálisis ERA5 pueden tener incertidumbres en regiones con escasa cobertura observacional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantías; la responsabilidad del uso recae en el usuario.
- El soporte de idiomas (en, zh) se refiere a la documentación y etiquetas del repositorio, no a capacidades lingüísticas del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/StormCast
- Artículo original (arXiv): https://arxiv.org/abs/2408.10958
- Página del laboratorio de NVIDIA sobre StormCast: https://research.nvidia.com/labs/climate/publication/pathak-2024-kilometer/
- Implementación de referencia en ai4science-studio (AMD): https://github.com/AMDResearch/ai4science-studio/tree/main/earth_science/models/StormCast
- Organización OneScience en HuggingFace: https://huggingface.co/OneScience-Group/models
- Repositorio principal de OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de habilidades OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Catálogo público de modelos OneScience: http://onescience.ai:8008/models
