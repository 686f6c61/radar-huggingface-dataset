# pyaging/zhangblup

## Resumen

zhangblup es un predictor de edad cronológica basado en metilación de ADN, publicado originalmente en 2019 por Zhang, Vallerga, Walker y colaboradores en *Genome Medicine*, y distribuido ahora como artefacto reutilizable dentro del ecosistema pyaging. A diferencia de los relojes epigenéticos clásicos, que seleccionan unas pocas decenas o cientos de sondas CpG, este modelo emplea predicción lineal insesgada óptima (BLUP, *best linear unbiased prediction*) sobre el conjunto completo de 319.607 sondas de metilación tras control de calidad. El resultado es un reloj de alta dimensionalidad que, según sus autores, mejora la precisión de las estimaciones en distintos tejidos.

El modelo no es una red neuronal ni un transformer: es un modelo estadístico lineal con coeficientes regularizados, empaquetado para su uso mediante la librería `pyaging`. Predice edad cronológica en *Homo sapiens* a partir de datos de metilación de sangre completa y saliva. Su relevancia actual reside en que permite reproducir un reloj publicado con una sola llamada de API, lo que facilita la comparación entre relojes epigenéticos y la integración en pipelines de análisis de datos ómicos.

El repositorio es pequeño (0,1 GB) y la licencia del código es MIT, aunque la model card advierte explícitamente de que los pesos conservan los términos de los autores originales y la licencia del software pyaging no los relicencia. No se trata, por tanto, de un modelo de lenguaje: no genera texto, no razona y no soporta tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Predicción lineal insesgada óptima (BLUP) sobre 319.607 sondas de metilación |
| Parámetros totales | no disponible (coeficientes lineales, uno por sonda tras control de calidad) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: vector de valores de metilación beta por muestra) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT para el software; los pesos conservan los términos de los autores originales |
| Formato de pesos | no disponible (artefacto consumido por la librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo implementa BLUP, un estimador lineal que combina la información de todas las sondas de metilación disponibles para predecir la edad cronológica. Frente a los relojes epigenéticos de primera generación, que aplican selección de características y penalizaciones tipo elastic net sobre un subconjunto reducido de CpG, aquí se aprovecha el conjunto completo de 319.607 sondas que superan el control de calidad. Este enfoque de alta dimensionalidad es el que los autores asocian con una mejora de la precisión de las estimaciones y con su aplicabilidad a través de distintos tejidos.

La model card no detalla el número de muestras de entrenamiento, la composición del dataset, el rango de edad cubierto ni si se aplicaron procedimientos de validación cruzada específicos; esa información debe consultarse en la publicación original de *Genome Medicine* (2019). Tampoco se documentan innovaciones adicionales como calibración por tejido, corrección de lotes o estimación de edad biológica frente a cronológica: el modelo predice edad cronológica.

## Capacidades

- Predicción de edad cronológica a partir de perfiles de metilación de ADN en *Homo sapiens*.
- Entrada de alta dimensionalidad: utiliza 319.607 sondas de metilación tras control de calidad.
- Aplicable a sangre completa y saliva, según la model card.
- Integración directa con pyaging mediante `pya.pred.predict_age(adata, ["zhangblup"])`.
- Compatible con el formato `AnnData`, habitual en flujos de trabajo de análisis de célula única y datos ómicos en Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento.
- No es multilingüe en sentido lingüístico: su dominio es numérico y biológico.

## Casos de uso

- Investigación en envejecimiento epigenético: calcular la edad cronológica predicha de cohortes con datos de metilación y compararla con la edad real para derivar medidas de desviación (aceleración o deceleración de la edad), un paso habitual en estudios de biomarcadores del envejecimiento.
- Reproducibilidad de estudios publicados: al estar empaquetado en pyaging, permite replicar los resultados del artículo original de 2019 sin reimplementar el pipeline de selección de sondas ni los coeficientes.
- Comparación sistemática de relojes epigenéticos: pyaging permite ejecutar varios relojes sobre el mismo `AnnData`, de modo que zhangblup puede actuar como referencia de alta dimensionalidad frente a relojes basados en elastic net con menos CpG.
- Análisis de datos de sangre completa y saliva en biobancos: su aplicabilidad declarada a ambos tejidos lo hace adecuado para cohortes con muestras heterogéneas donde no se dispone de un único tipo de tejido.
- Control de calidad en pipelines ómicos: la predicción de edad puede usarse como comprobación de coherencia entre metadatos clínicos y perfiles de metilación, detectando muestras mal etiquetadas o intercambiadas.
- Docencia y formación en bioinformática: el modelo ofrece un ejemplo compacto de reloj epigenético de alta dimensionalidad que se ejecuta con una sola llamada, útil para prácticas sobre datos de metilación y sobre el ecosistema pyaging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error (MAE, correlación de Pearson, RMSE) ni comparaciones numéricas con otros relojes; los datos de precisión deben consultarse en la publicación original (Zhang et al., *Genome Medicine* 11, 54, 2019).

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, por lo que el almacenamiento necesario es mínimo.
- La inferencia consiste en una operación lineal sobre un vector de hasta 319.607 valores por muestra; no requiere GPU.
- Cabe en cualquier CPU moderna y en equipos de consumo; no se necesita VRAM dedicada.
- El cuello de botella es la memoria para manipular la matriz de metilación completa (muestras × sondas), no el modelo en sí.
- Despliegue mediante la librería `pyaging` en Python; no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- No se dispone de datos de latencia o throughput publicados; en la práctica, el coste dominante será la carga y el preprocesado de los datos de metilación.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Tejidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhangblup | BLUP sobre 319.607 sondas | Metilación de ADN | Sangre completa, saliva | MIT (software); pesos con términos de los autores | Hugging Face, vía pyaging |
| Relojes epigenéticos basados en elastic net (p. ej., Horvath, Hannum) | Regresión penalizada sobre subconjunto de CpG | Metilación de ADN | Múltiples / sangre | Varía según publicación | Implementaciones dispares; algunos en pyaging |
| Predictores de edad cronológica con redes neuronales | Red neuronal | Metilación de ADN | Varía | Varía | Varía |

No se dispone en la información proporcionada de métricas comparativas de rendimiento entre zhangblup y estas alternativas, por lo que la comparación se limita a arquitectura, entradas y disponibilidad.

## Limitaciones y advertencias

- Solo predice edad cronológica; no estima edad biológica ni ofrece interpretación clínica de la desviación.
- Restringido a *Homo sapiens* y a los tejidos declarados (sangre completa y saliva); su uso en otros tejidos no está respaldado por la model card.
- Requiere datos de metilación procesados con las sondas esperadas; muestras con cobertura incompleta o plataformas distintas pueden degradar la predicción o requerir imputación.
- No se documentan en la información disponible el rango de edad de entrenamiento, la composición demográfica de la cohorte ni posibles sesgos por ancestría, edad o sexo.
- Riesgo de extrapolación: al ser un modelo lineal, su comportamiento fuera del dominio de entrenamiento (edades extremas, tejidos no representados) es incierto.
- Licencia: el código es MIT, pero los pesos conservan los términos de los autores originales; para uso comercial debe verificarse la licencia de la publicación y de los datos subyacentes.
- No es un dispositivo médico ni un biomarcador validado clínicamente; no debe usarse para diagnóstico o decisiones sanitarias.
- No es un modelo de lenguaje: no admite prompts, instrucciones en lenguaje natural ni generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/zhangblup
- Catálogo de relojes de pyaging: https://pyaging.readthedocs.io
- Publicación original: Zhang, Q., Vallerga, C.L., Walker, R.M. et al. *Improved precision of epigenetic clock estimates across tissues and its implication for biological ageing*. Genome Medicine 11, 54 (2019). https://doi.org/10.1186/s13073-019-0667-1
