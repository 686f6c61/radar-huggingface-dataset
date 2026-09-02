# OneScience-Group/ClayFoundation

## Resumen

Clay Foundation Model es una reproducción independiente de la especificación pública Clay v1.5, desarrollada por OneScience-Group como parte de su plataforma OneScience para investigación AI4S. El modelo codifica imágenes satelitales de múltiples sensores (Sentinel-2, Landsat, Sentinel-1, NAIP, LINZ y MODIS) junto con metadatos espacio-temporales (longitudes de onda centrales de las bandas, resolución de suelo, semana, hora, latitud y longitud) en embeddings de observación de la Tierra, y reconstruye las bandas de entrada mediante un Masked Autoencoder (MAE). Su objetivo es servir como backbone de representación para tareas de teledetección como clasificación de cobertura terrestre, regresión y detección de cambios.

Este repositorio concreto es una implementación a escala reducida con datos sintéticos (cuatro muestras de entrenamiento y dos de prueba, tamaño 64×64) diseñada para validar el flujo de trabajo de ingeniería: entrenamiento, inferencia, evaluación y visualización. No incluye los pesos oficiales del modelo Clay v1.5 (publicados por Clay Foundation en `made-with-clay/Clay`), y sus parámetros son incompatibles con los del encoder oficial de aproximadamente 1,25 GB. Por tanto, este modelo sirve como referencia de implementación y validación local, no como un modelo listo para producción.

La relevancia actual radica en que aborda un problema clave en teledetección: la heterogeneidad de sensores con distinto número de bandas y resoluciones espectrales. Clay Foundation Model propone una codificación dinámica de parches a partir de las longitudes de onda centrales, lo que permite procesar múltiples sensores con un único modelo. Sin embargo, la versión aquí publicada es solo una prueba de concepto técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked Autoencoder (MAE) con codificación dinámica de parches espectrales |
| Parametros totales | no disponible (los pesos oficiales del encoder ocupan ~1,25 GB, pero este repositorio no los incluye) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`.pt`), aunque el repositorio no proporciona pesos; el oficial usa `.ckpt` |

## Arquitectura y entrenamiento

Clay Foundation Model sigue la especificación Clay v1.5, que emplea un transformer con máscara de autoencoder para aprender representaciones de datos de observación de la Tierra. La innovación principal es la codificación dinámica de parches: en lugar de usar una proyección fija, los embeddings de parches se generan a partir de las longitudes de onda centrales de las bandas de entrada, junto con la resolución de suelo (GSD) y los metadatos espacio-temporales (semana, hora, latitud, longitud). Esto permite que el modelo procese sensores con diferente número de bandas y características espectrales sin necesidad de adaptar la arquitectura.

El entrenamiento del modelo oficial se realizó sobre aproximadamente 70 millones de chips de teledetección globales de múltiples sensores. Sin embargo, este repositorio de OneScience-Group utiliza únicamente datos sintéticos generados localmente (`data/train.npz` y `data/test.npz`) con 10 bandas de Sentinel-2, 6 de Landsat y 2 de Sentinel-1, más metadatos correspondientes. El objetivo es validar el flujo de ingeniería (interfaz de bandas dinámicas, codificación espacio-temporal, entrenamiento MAE, inferencia multi-sensor) y no representa la distribución ni la escala real de entrenamiento. La configuración por defecto usa un tamaño de entrada de 64×64, cuatro muestras de entrenamiento y dos de prueba, y no se entrena con el esquema completo (sin DINOv2 teacher ni horario completo).

## Capacidades

- Representación multi-sensor: procesa imágenes de diferentes sensores (Sentinel-2, Landsat, Sentinel-1, etc.) con distinto número de bandas usando un único modelo.
- Codificación espectral dinámica: genera embeddings de parches a partir de las longitudes de onda centrales de las bandas de entrada, permitiendo validar la integración de nuevos sensores.
- Reconstrucción de imágenes de teledetección: el MAE reconstruye parches enmascarados de imágenes multiespectrales, útil para tareas de preentrenamiento y generación de representaciones.
- Entrenamiento multi-GPU: soporta lanzamiento de entrenamiento distribuido con `torchrun` (`--nproc_per_node=8`).
- Validación de flujo de trabajo local: permite probar entrenamiento, inferencia, evaluación, visualización y guardado de checkpoints con datos sintéticos de pequeño tamaño.
- Tareas aguas abajo: según la descripción del autor, puede servir como backbone para clasificación de cobertura terrestre, regresión y detección de cambios, aunque esta implementación concreta no incluye pesos entrenados a escala real.

## Casos de uso

- Validación de pipelines de entrenamiento de modelos de teledetección: el repositorio permite verificar rápidamente el flujo completo (datos, entrenamiento, inferencia, métricas) con datos sintéticos antes de escalar a datos reales y configuraciones oficiales.
- Prueba de integración de nuevos sensores: gracias a la codificación dinámica de bandas, se puede evaluar cómo el modelo maneja sensores con bandas adicionales o diferentes longitudes de onda centrales sin modificar la arquitectura.
- Educación y formación en modelos de fundación de observación de la Tierra: el código sirve como ejemplo didáctico de implementación de un MAE con metadatos espacio-temporales, adecuado para cursos o talleres de deep learning aplicado a teledetección.
- Desarrollo de representaciones para clasificación de cobertura terrestre: aunque esta versión no tiene pesos útiles, el diseño del modelo (embeddings + reconstrucción) es la base para entrenar un clasificador en tareas de uso del suelo, siempre que se utilicen los pesos oficiales de Clay v1.5.
- Benchmarking de hardware y entornos de ejecución: la configuración de pequeño tamaño permite comprobar compatibilidad con GPUs, DCUs (con DTK) o CPUs, y medir tiempos de entrenamiento e inferencia antes de desplegar modelos grandes.
- Integración en plataformas de ciencia abierta: OneScience ofrece un entorno OneCode para programación AI4S, donde este modelo puede servir como componente de prueba para flujos de análisis de imágenes satelitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo incluye datos sintéticos de validación de flujo, no métricas de rendimiento sobre conjuntos reales de teledetección. El modelo oficial Clay v1.5 podría tener benchmarks publicados en la documentación de Clay Foundation, pero no se proporcionan en esta ficha.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia; una CPU puede usarse para verificar la conectividad con la configuración de pequeño tamaño por defecto.
- Para DCU se requiere DTK 25.04.2 o posterior, o la versión recomendada por OneScience para el clúster correspondiente.
- No se especifica VRAM mínima ni GPUs concretas (A100, H100, RTX 4090, etc.). Dado que la configuración por defecto usa 64×64 y solo 4 muestras de entrenamiento, cualquier GPU moderna con al menos 4 GB de VRAM debería ser suficiente para la validación.
- Para el modelo oficial Clay v1.5 (encoder de ~1,25 GB), se necesitaría una GPU con al menos 8-12 GB de VRAM para inferencia en precisión FP32, o menos con cuantización, pero no hay datos oficiales en esta información.
- Opciones de despliegue: el repositorio usa scripts de entrenamiento e inferencia en PyTorch (`scripts/train.py`, `scripts/inference.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles; la configuración sintética es demasiado pequeña para proporcionar mediciones representativas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro de la categoría de modelos de fundación de observación de la Tierra en la información proporcionada. El modelo oficial Clay v1.5 sería el referente natural, pero esta implementación de OneScience-Group es una reproducción a escala reducida sin pesos propios. Otros modelos como Prithvi (IBM), SatMAE o Scale-MAE podrían considerarse alternativas, pero no hay datos de comparación en las fuentes consultadas.

## Limitaciones y advertencias

- Este repositorio es una implementación de ingeniería a escala reducida con datos sintéticos (4 muestras de entrenamiento, 2 de prueba, tamaño 64×64). No representa la distribución ni la escala del modelo oficial (~70 millones de chips) y no debe usarse para tareas reales de teledetección.
- No se incluyen pesos entrenados. Los parámetros del modelo son incompatibles con los pesos oficiales de Clay v1.5; para usar el modelo real hay que recurrir al repositorio oficial de Clay Foundation.
- No se ha verificado el rendimiento en tareas reales; no hay benchmarks ni métricas publicadas.
- La licencia Apache 2.0 permite uso comercial, pero este modelo concreto no es útil para producción debido a su naturaleza de validación.
- El soporte de idiomas es solo inglés; no hay capacidades multilingües.
- No se proporciona información sobre sesgos, alucinación o riesgos de uso, aunque al ser un modelo de representación de imágenes, los riesgos principales están en la calidad de los datos de entrenamiento y la posible falta de generalización a regiones geográficas no representadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/ClayFoundation
- Documentación oficial de Clay Foundation Model v1.5: https://clay-foundation.github.io/model/release-notes/specification.html
- Repositorio GitHub oficial de Clay Foundation: https://github.com/Clay-foundation/model
- Sitio web de Clay AI for Earth: https://madewithclay.org/
- Checkpoint oficial de Clay v1.5: https://huggingface.co/made-with-clay/Clay/resolve/main/v1.5/clay-v1.5.ckpt
- Repositorio de OneScience en HuggingFace: https://huggingface.co/OneScience-Group/models
