# OneScience-Group/Pangu_Weather

## Resumen

Pangu-Weather es un modelo global de predicción meteorológica a medio plazo desarrollado originalmente por Huawei Cloud y reproducido aquí por el grupo OneScience. Su objetivo es predecir variables de superficie y variables atmosféricas en múltiples niveles de presión de forma rápida y precisa, superando a los métodos numéricos tradicionales en velocidad y, según los autores, en precisión para plazos de hasta una semana. Esta versión de OneScience es una implementación en PyTorch del modelo original, entrenada con datos ERA5 desde 1979 hasta 2025, y proporciona pesos que, según la model card, superan a los pesos ONNX oficiales en el plazo de 6 horas de predicción.

La arquitectura se basa en un Transformer 3D específico para la Tierra (3D Earth-Specific Transformer), diseñado para capturar las dependencias espaciales y temporales de los campos meteorológicos. El modelo está pensado para pronósticos a corto y medio plazo (hasta 10 días), y es relevante ahora porque representa una alternativa eficiente a los modelos físicos tradicionales, con un coste computacional mucho menor y una precisión competitiva. La presente ficha se basa exclusivamente en la información publicada en la model card de HuggingFace, que no incluye detalles cuantitativos sobre parámetros, contexto o benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D específico para la Tierra (3D Earth-Specific Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa campos meteorológicos en rejilla) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (aunque el modelo no procesa lenguaje; se refiere a la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

La arquitectura es una reproducción del Pangu-Weather original, que emplea un Transformer tridimensional con atención específica para datos geográficos. El modelo procesa campos de variables meteorológicas (como temperatura, viento, humedad y presión) en una rejilla regular, utilizando capas de atención que operan simultáneamente en las dimensiones de latitud, longitud y nivel de presión. Esta estructura permite modelar las correlaciones espaciales y verticales de la atmósfera de manera más eficiente que un Transformer 2D convencional.

El entrenamiento se realizó con el conjunto de datos ERA5, un reanálisis atmosférico global de alta resolución producido por el ECMWF. La model card indica que los pesos proporcionados se entrenaron con datos de 1979 a 2025. No se especifican detalles sobre el número de tokens, el proceso de optimización, ni si se utilizaron técnicas como RLHF o DPO (que no aplican a este tipo de modelo). La implementación incluye scripts para entrenamiento (single y multi-GPU con `torchrun`), inferencia y evaluación. Se destaca que los pesos de este repositorio superan a los pesos ONNX oficiales en el plazo de predicción de 6 horas, aunque no se aportan métricas concretas.

## Capacidades

- Predicción de variables de superficie (temperatura, presión, viento, humedad, etc.) a escala global.
- Predicción de variables atmosféricas en múltiples niveles de presión (campos tridimensionales).
- Pronósticos a corto y medio plazo, típicamente hasta 10 días de anticipación.
- Inferencia rápida en GPU o DCU, con posibilidad de ejecución en CPU (aunque lenta para entrenamiento completo).
- Soporte para entrenamiento desde cero o fine-tuning con datos ERA5.
- Visualización de resultados de inferencia mediante scripts incluidos.
- Ejecución en entornos multi-GPU mediante `torchrun`.
- Integración con el ecosistema OneScience (OneCode) para programación científica asistida por IA.

## Casos de uso

- Predicción meteorológica operativa: el modelo puede generar pronósticos de superficie y de niveles superiores en minutos, adecuado para servicios meteorológicos que necesitan actualizaciones frecuentes sin depender de supercomputadoras.
- Investigación climática: permite estudiar patrones atmosféricos a medio plazo y validar hipótesis sobre dinámicas regionales utilizando datos de reanálisis ERA5.
- Generación de escenarios para planificación agrícola: los pronósticos de temperatura y precipitación a 7-10 días ayudan a decidir calendarios de siembra y riego.
- Gestión de recursos energéticos: predicción de viento y radiación para optimizar la producción de energía eólica y solar en parques renovables.
- Avisos tempranos de fenómenos extremos: aunque el modelo no está especializado en eventos extremos, puede proporcionar señales de alerta para olas de calor o tormentas con varios días de antelación.
- Educación y formación en IA4S (IA para la ciencia): el repositorio incluye scripts de entrenamiento e inferencia, lo que permite a estudiantes e investigadores aprender a implementar modelos de aprendizaje profundo en ciencias de la Tierra.
- Benchmarking de modelos meteorológicos: al ser una reproducción de Pangu-Weather, sirve como referencia para comparar con otras arquitecturas (GraphCast, FourCastNet, etc.) en tareas de predicción a medio plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que los pesos de este repositorio superan a los pesos ONNX oficiales en el plazo de 6 horas de predicción, pero no proporciona cifras numéricas (como RMSE, MAE, etc.) ni comparaciones con otros modelos. Se recomienda consultar el paper original de Pangu-Weather (Nature, 2023) para obtener métricas de referencia del modelo base.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia completos.
- La CPU puede utilizarse para importar el modelo y realizar pruebas de conectividad a pequeña escala, pero el entrenamiento y la inferencia serán lentos.
- Para usuarios de DCU, se requiere instalar DTK (versión 25.04.2 o superior, o la recomendada por OneScience para el clúster).
- No se especifica VRAM mínima ni GPUs concretas (A100, H100, etc.). Dado que el modelo procesa campos en rejilla de alta resolución (típicamente 0.25° o similar en ERA5), se espera que necesite varios GB de VRAM, pero el dato exacto no está disponible.
- Opciones de despliegue: scripts de entrenamiento e inferencia incluidos en el repositorio, compatibles con PyTorch y `torchrun` para multi-GPU. No se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplicables a un modelo de pronóstico meteorológico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo es una reproducción de Pangu-Weather original de Huawei Cloud, por lo que se puede comparar conceptualmente con otras arquitecturas de pronóstico meteorológico basadas en aprendizaje profundo como GraphCast (Google DeepMind) o FourCastNet (NVIDIA), pero no se aportan métricas cuantitativas en la model card. La licencia Apache 2.0 de esta versión es más permisiva que la del Pangu-Weather original (que tiene restricciones de uso no comercial). Para una comparación rigurosa, se recomienda consultar la literatura científica.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero al entrenarse con ERA5, el modelo puede heredar los sesgos del propio reanálisis (por ejemplo, en regiones con escasez de observaciones).
- Riesgo de alucinación: aunque no es un modelo de lenguaje, puede producir predicciones inconsistentes en situaciones de alta variabilidad atmosférica o eventos extremos poco representados en los datos de entrenamiento.
- Limitaciones de contexto: el modelo está diseñado para pronósticos a medio plazo (hasta 10 días); predicciones más largas pueden degradarse significativamente.
- Limitaciones de idioma: el modelo no procesa texto; la etiqueta "en, zh" se refiere a la documentación y scripts, no a capacidades lingüísticas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe verificar que los datos ERA5 utilizados cumplan con los términos del ECMWF (el acceso a ERA5 es gratuito para fines no comerciales; para uso comercial puede requerir licencia).
- Para producción, se recomienda validar el modelo con datos de reanálisis recientes y comparar con modelos operativos, ya que no se proporcionan métricas de error en esta versión.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/Pangu_Weather
- Paper original: https://www.nature.com/articles/s41586-023-06185-3
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
