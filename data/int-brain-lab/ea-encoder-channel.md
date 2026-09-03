# int-brain-lab/ea-encoder-channel

## Resumen

El modelo `int-brain-lab/ea-encoder-channel` es un encoder espacial desarrollado por el International Brain Laboratory (IBL) para predecir el vector de características electrofisiológicas esperado en una posición concreta de un canal de registro. A diferencia de un clasificador de regiones, que toma características y devuelve una región, este modelo toma las coordenadas tridimensionales `x, y, z` de un canal (en el marco de referencia de Allen, en metros) y devuelve las 41 características electrofisiológicas que cabría esperar en ese punto. Para ello combina la posición con contexto anatómico (volúmenes PCA de atlas de expresión génica y de hibridación in situ) y con las características registradas de canales cercanos en otras inserciones, almacenadas en un "banco de vecinos" que forma parte del modelo.

El modelo fue entrenado con la versión de características `2026_W32` del Ephys Atlas del IBL, basada en registros con Neuropixels 1.0 en ratón. Su relevancia radica en que permite estimar propiedades electrofisiológicas en posiciones no registradas directamente, facilitando la interpolación espacial y el diseño de experimentos. El repositorio incluye no solo los pesos de la red, sino también los volúmenes de contexto PCA y el banco de vecinos, todos necesarios para la inferencia. La licencia es CC-BY-4.0 y el tamaño del repositorio es de 0.2 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de tipo encoder espacial (detalles internos no disponibles) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`), junto con archivos `.npy` y `.npz` para contexto y banco de vecinos |

## Arquitectura y entrenamiento

La arquitectura exacta (número de capas, tipo de atención, etc.) no se detalla en la información disponible. Lo que se sabe es que el modelo toma como entrada la posición `(x, y, z)` de un canal en el marco de Allen, muestrea contexto anatómico de dos volúmenes PCA (uno de expresión génica por regiones `agea_vol_pca.npy` y otro de hibridación in situ `merfish_vol_pca.npy`) en esa posición, y además selecciona los canales registrados más cercanos dentro de un radio de 500 µm (hasta 8 vecinos) desde un banco de vecinos (`neighbor_bank.npz`). El modelo atiende a esos vecinos para generar la predicción. El banco de vecinos contiene la posición, el vector de características estandarizado y el identificador de inserción de cada canal de entrenamiento, y es parte integral del modelo, de forma similar a los puntos almacenados en un modelo k-NN.

El entrenamiento se realizó con datos del Ephys Atlas del IBL, versión de características `2026_W32`, que incluye registros de Neuropixels 1.0 en ratón. No se especifican detalles sobre el número de canales de entrenamiento, el procedimiento de optimización ni si se usaron técnicas como RLHF o DPO (no aplicables a este tipo de modelo). Durante el entrenamiento se usó una submuestra aleatoria de vecinos dentro del radio, mientras que en la inferencia publicada se usan siempre los más cercanos, lo que garantiza determinismo.

## Capacidades

- Predicción de 41 características electrofisiológicas (por ejemplo, tasas de disparo, formas de onda, etc.) a partir de una posición tridimensional en el cerebro de ratón.
- Uso de contexto anatómico multimodal: combina la posición con volúmenes PCA de expresión génica y de hibridación in situ para mejorar la predicción en regiones sin registros cercanos.
- Atención a canales vecinos registrados: el modelo selecciona hasta 8 canales dentro de un radio de 500 µm y atiende a sus características, lo que permite incorporar información local de alta densidad.
- Inferencia determinista: dos llamadas con la misma entrada producen exactamente el mismo resultado, gracias a la selección de vecinos más cercanos en lugar de aleatoria.
- Integración con el ecosistema `ephysatlas`: la función `load_pretrained` permite cargar el modelo y usar `predict` de forma uniforme para todos los modelos de la familia.
- Verificación de reproducibilidad mediante `selftest()`.

## Casos de uso

- Interpolación de características electrofisiológicas en regiones no registradas: dado un conjunto de posiciones objetivo (por ejemplo, una cuadrícula de puntos en el cerebro), el modelo estima las 41 características esperadas, lo que permite construir mapas continuos de propiedades fisiológicas sin necesidad de registrar en cada punto.
- Diseño de experimentos de registro: antes de realizar una inserción de Neuropixels, se pueden predecir las características esperadas a lo largo de la trayectoria planificada para optimizar la selección de regiones de interés o verificar la cobertura.
- Validación cruzada de registros: comparar las predicciones del modelo con las características medidas en canales reales puede ayudar a detectar anomalías en los datos o errores de alineación anatómica.
- Generación de atlas funcionales: combinar las predicciones del modelo con el atlas de Allen para producir volúmenes de características electrofisiológicas que complementen los atlas anatómicos y de expresión génica.
- Análisis de variabilidad entre inserciones: al predecir características en posiciones donde ya hay registros, se puede estudiar la desviación entre lo esperado y lo observado, lo que informa sobre la reproducibilidad de los registros.
- Integración en pipelines de análisis de datos neurofisiológicos: el modelo se puede usar como un componente dentro de flujos de trabajo que necesiten estimar propiedades fisiológicas en posiciones arbitrarias, por ejemplo para normalizar o comparar datos de diferentes sesiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de error, comparaciones con otros modelos ni evaluaciones cuantitativas de precisión.

## Requisitos de hardware

- El tamaño total del repositorio es de 0.2 GB, lo que sugiere que el modelo es ligero y puede ejecutarse en hardware modesto.
- No se especifican requisitos de VRAM ni de GPU. Dado el tamaño, es probable que quepa en una GPU de consumo (por ejemplo, RTX 3060 o superior) e incluso en CPU para inferencia puntual.
- El primer uso requiere descargar el volumen de Allen CCF desde `download.alleninstitute.org` (varios cientos de MB), que se cachea localmente.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje. La inferencia se realiza mediante la API de `ephysatlas` en Python.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (encoders espaciales de características electrofisiológicas) en la información proporcionada.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con registros de Neuropixels 1.0 en ratón del IBL. La transferencia a Neuropixels 2.0, otras especies u otros equipos de registro no ha sido probada y podría degradar el rendimiento.
- La cobertura espacial sigue el mapa de objetivos del IBL (brain-wide map). En posiciones alejadas de cualquier canal registrado, la predicción se basa únicamente en el contexto anatómico y es correspondientemente más débil.
- El banco de vecinos es parte del modelo y no puede reconstruirse a partir de los pesos. Si se pierde o se modifica, la inferencia cambia.
- La inferencia es determinista solo si se usa la selección de vecinos más cercanos; el entrenamiento usaba una submuestra aleatoria, por lo que en regiones densas puede haber pequeñas diferencias entre la predicción publicada y la que se obtendría con el procedimiento de entrenamiento.
- Es necesario fijar la revisión (`revision="2026_W32"`) para reproducibilidad; usar `main` puede cambiar el modelo cuando se publique una nueva versión de características.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se recomienda revisar los términos exactos y citar al International Brain Laboratory en cualquier publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/int-brain-lab/ea-encoder-channel
- Organización del International Brain Laboratory en Hugging Face: https://huggingface.co/int-brain-lab
- Sitio web del International Brain Laboratory: https://www.internationalbrainlab.com/
