# OneScience-Group/CorrDiff

## Resumen

CorrDiff (Residual Corrective Diffusion Model) es un modelo generativo de dos etapas diseñado para el downscaling meteorológico regional a escala kilométrica. Desarrollado originalmente por NVIDIA y colaboradores, esta versión de OneScience-Group es una reproducción del modelo presentado en el artículo "Residual Corrective Diffusion Modeling for Km-scale Atmospheric Downscaling" (arXiv:2309.15214). El modelo toma campos de reanálisis ERA5 de aproximadamente 25 km de resolución y los transforma en campos regionales de alta resolución (alrededor de 2 km) sobre Taiwán, además de sintetizar reflectividad de radar que no está presente en la entrada.

La relevancia de CorrDiff radica en su capacidad para producir predicciones meteorológicas probabilísticas a escala local, un ámbito donde los modelos globales de baja resolución no capturan la variabilidad orográfica y de mesoescala. Al combinar un enfoque de difusión generativa con corrección residual, el modelo puede generar múltiples realizaciones plausibles, lo que permite cuantificar la incertidumbre en las predicciones. OneScience-Group lo publica bajo licencia Apache-2.0, lo que facilita su uso y adaptación en entornos de investigación y operativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión generativo (dos etapas, arquitectura interna no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de datos meteorológicos, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No es un modelo de lenguaje; la documentación está en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (pesos en carpeta `weight/`, formato concreto no especificado) |

## Arquitectura y entrenamiento

CorrDiff es un modelo de difusión residual correctivo. El enfoque consiste en entrenar un modelo de difusión que, partiendo de campos de baja resolución (ERA5 a ~25 km), genera campos de alta resolución (~2 km) de una variable meteorológica determinada, como temperatura, precipitación o reflectividad de radar. La corrección residual permite que el modelo aprenda la diferencia entre la predicción determinista de baja resolución y la salida de alta resolución, reduciendo el espacio de aprendizaje y mejorando la eficiencia. No se han publicado detalles sobre el número de parámetros, la arquitectura interna (si es U-Net, transformer u otra) ni el número de pasos de difusión.

El entrenamiento se realizó con datos de reanálisis ERA5 (39 años) como entrada y con datos del modelo regional WRF de la Administración Central de Meteorología de Taiwán como objetivo de alta resolución. La model card indica que se trata de una reproducción del paper original de NVIDIA, y que los pesos entrenados se subirán próximamente. No se menciona el uso de técnicas de RLHF o DPO, ya que no es un modelo de lenguaje. Tampoco se especifica si se utilizó decodificación especulativa u otras técnicas de inferencia.

## Capacidades

- Downscaling meteorológico: convierte campos globales de reanálisis (ERA5, ~25 km) en campos regionales de alta resolución (~2 km) sobre Taiwán.
- Síntesis de reflectividad de radar: el modelo genera campos de reflectividad que no están presentes en los datos de entrada, lo que es útil para la predicción de precipitación.
- Predicción probabilística: al ser un modelo generativo, puede producir múltiples realizaciones de los campos de alta resolución, lo que permite estimar la incertidumbre de la predicción.
- Entrenamiento con datos de reanálisis: está preparado para trabajar con datos ERA5 en formato HDF5, tal como se indica en los casos de uso.
- Compatibilidad con entornos DCU y GPU: los scripts de entrenamiento e inferencia están adaptados para ejecutarse en GPUs NVIDIA y en DCUs (Deep Computing Unit) de Hygon, con soporte para `torchrun` en entrenamiento multi-GPU.
- Integración con la plataforma OneScience: el modelo se puede ejecutar directamente en el entorno OneCode de OneScience, que ofrece un flujo de programación de IA4S de un clic.

## Casos de uso

- **Entrenamiento de modelos de downscaling**: investigadores pueden usar el script `scripts/train.py` para entrenar CorrDiff con datos ERA5 propios o con el conjunto de datos `OneScience/ERA5` disponible en Hugging Face. El modelo está diseñado para adaptarse a diferentes regiones si se dispone de datos de alta resolución.
- **Validación rápida con datos sintéticos**: el script `scripts/fake_data.py` genera datos sintéticos que permiten comprobar el flujo de carga de datos, entrenamiento, inferencia y visualización sin necesidad de descargar los datos reales de ERA5. Esto es útil para depurar el pipeline en entornos de desarrollo.
- **Predicción meteorológica regional**: una vez entrenado, el modelo puede generar campos de alta resolución (2 km) a partir de predicciones globales de baja resolución (25 km), mejorando la resolución de los pronósticos para zonas con orografía compleja como Taiwán.
- **Generación de escenarios de precipitación**: la síntesis de reflectividad de radar permite generar campos de precipitación probabilística, que se pueden usar en alertas tempranas o en la planificación de recursos hidráulicos.
- **Investigación en ciencias de la Tierra**: el modelo sirve como base para estudiar técnicas de downscaling con modelos generativos, comparar con métodos estadísticos tradicionales o explorar el uso de difusión en otras variables climáticas (temperatura, viento, humedad).
- **Despliegue en plataformas de IA4S**: al estar integrado en OneScience, se puede ejecutar en su entorno OneCode sin necesidad de configurar manualmente el entorno, facilitando su uso para investigadores que no son expertos en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como RMSE, CRPS, Brier score ni comparaciones con otros modelos de downscaling. Tampoco se indica el rendimiento en términos de velocidad de inferencia o uso de memoria. Por tanto, no se pueden presentar tablas de comparación numérica.

## Requisitos de hardware

- Se recomienda una GPU (NVIDIA) o DCU (Hygon) para ejecutar el entrenamiento e inferencia completos. El uso de CPU es posible solo para pruebas de conectividad a pequeña escala, pero el entrenamiento completo sería muy lento.
- No se especifican los requisitos de VRAM mínima ni el número de GPUs necesarias. La model card menciona entrenamiento multi-GPU con `torchrun`, lo que sugiere que se puede escalar a varios dispositivos.
- Para DCU, se requiere tener instalado DTK (Deep Computing Toolkit) versión 25.04.2 o superior, o la versión recomendada por OneScience para el clúster.
- El entorno de instalación se basa en Python 3.11 y se recomienda usar `conda` para gestionar las dependencias. Se ofrecen paquetes específicos `onescience[earth-gpu]` para GPU y `onescience[earth-dcu]` para DCU.
- No se proporcionan estimaciones de throughput o latencia. En general, los modelos de difusión requieren múltiples pasos de denoising en la inferencia, por lo que la latencia será mayor que en modelos de una sola pasada, aunque no se dan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se mencionan alternativas como otros modelos de downscaling (p. ej., el modelo original de NVIDIA, o enfoques basados en GAN o U-Net). Por tanto, no se puede realizar una comparativa numérica. Se recomienda consultar la bibliografía sobre downscaling generativo para más contexto.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la región de Taiwán con datos de WRF; su aplicación a otras regiones requeriría un reentrenamiento con datos locales de alta resolución.
- La síntesis de reflectividad de radar es un producto derivado y no debe interpretarse como una medición directa; puede tener incertidumbres significativas.
- Al ser un modelo generativo, las salidas son muestras probabilísticas; es necesario un análisis estadístico de las múltiples realizaciones para obtener predicciones robustas.
- No se han publicado estudios sobre sesgos sistemáticos (p. ej., en precipitación extrema o en zonas de alta montaña). Se recomienda una validación adicional antes de usar en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías. La responsabilidad del uso recae en el usuario.
- Los pesos entrenados aún no están disponibles en el repositorio de Hugging Face (se indica que se subirán próximamente). Actualmente solo se proporcionan los scripts de entrenamiento e inferencia.
- No se especifican los formatos de entrada y salida más allá de los datos ERA5 en HDF5 y los resultados en `result/output/`; el usuario debe revisar el código para conocer los detalles de preprocesamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OneScience-Group/CorrDiff)
- [Paper original en arXiv](https://arxiv.org/abs/2309.15214)
- [Repositorio principal de OneScience en GitHub](https://github.com/onescience-ai/OneScience)
- [Repositorio de OneScience en Gitee](https://gitee.com/onescience-ai/onescience)
- [Ejemplo de CorrDiff en el repositorio de OneScience](https://github.com/onescience-ai/OneScience/tree/main/examples/earth/corrdiff)
- [Plataforma OneScience](https://www.onescience.ai/home)
- [Dataset ERA5 de OneScience](https://huggingface.co/datasets/OneScience/ERA5) (enlace inferido de la model card)
