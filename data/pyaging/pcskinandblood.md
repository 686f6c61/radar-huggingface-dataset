# pyaging/pcskinandblood

## Resumen

`pcskinandblood` es un reloj epigenético (aging clock) basado en metilación de ADN, desarrollado por el grupo de Higgins-Chen et al. y publicado en *Nature Aging* en 2022. El modelo predice la edad cronológica de un individuo a partir de los niveles de metilación en muestras de piel, sangre total y fibroblastos cultivados. Se trata de una regresión con elastic net aplicada sobre componentes principales (PCA) de los datos de metilación, una arquitectura ligera y computacionalmente eficiente que no requiere GPU para su uso.

Su relevancia radica en que ofrece una versión simplificada y robusta del reloj de Horvath (versión 2), entrenada específicamente para tejidos accesibles en entornos clínicos y de investigación. Al estar integrado en la librería `pyaging`, permite a los investigadores calcular la edad epigenética con una sola línea de código, facilitando estudios longitudinales, ensayos clínicos y monitorización de intervenciones antienvejecimiento. El modelo está disponible bajo licencia BSD-3-Clause, lo que permite uso comercial y académico sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible (modelo de regresión sobre componentes principales, no es una red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente serialización interna de `pyaging`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo utiliza una pipeline de dos etapas: primero se aplica un análisis de componentes principales (PCA) sobre las medidas de metilación de ADN (probablemente en sitios CpG específicos), y posteriormente se entrena una regresión con regularización elastic net sobre los componentes principales resultantes. Esta combinación reduce la dimensionalidad y selecciona características relevantes para la predicción de la edad.

Según la model card, el modelo fue entrenado contra el score del reloj de Horvath original (versión 2) utilizando datasets de piel, sangre total y fibroblastos cultivados. No se proporcionan detalles sobre el número de muestras, la cobertura de CpG ni el proceso de validación. El año de creación indicado es 2022, coincidiendo con la publicación del artículo de Higgins-Chen et al. que describe una solución computacional para mejorar la fiabilidad de los relojes epigenéticos.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN.
- Funciona en tres tipos de tejido: piel, sangre total y fibroblastos cultivados.
- Modelo de regresión continua, devuelve una estimación numérica de la edad (en años).
- Integración sencilla con la librería `pyaging` mediante la función `predict_age`.
- Diseñado para ser computacionalmente ligero: no requiere GPU, solo datos de metilación procesados.
- No es un modelo generativo ni de lenguaje; no soporta tool calling, agentes ni razonamiento multilingüe.

## Casos de uso

- Investigación en envejecimiento: permite estimar la edad biológica a partir de muestras de sangre o piel en estudios observacionales y de intervención.
- Ensayos clínicos de terapias antienvejecimiento: sirve como biomarcador de eficacia, comparando la edad epigenética antes y después del tratamiento.
- Monitorización longitudinal de pacientes: al ser un modelo ligero, puede ejecutarse en entornos clínicos con recursos limitados, procesando múltiples muestras de un mismo individuo a lo largo del tiempo.
- Validación de otros relojes epigenéticos: al estar entrenado contra el score de Horvath2, puede usarse como referencia para comparar nuevas versiones o relojes alternativos.
- Análisis de datos de metilación en biobancos: se puede aplicar a grandes cohortes para estudiar asociaciones entre edad epigenética y enfermedades relacionadas con la edad.
- Educación y formación en bioinformática: sirve como ejemplo didáctico de un modelo de regresión aplicado a datos ómicos, fácil de ejecutar en notebooks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como correlación con la edad real, error absoluto medio (MAE) ni comparaciones con otros relojes. Para obtener datos de rendimiento, sería necesario consultar el artículo original de Higgins-Chen et al. (2022) o ejecutar el modelo sobre conjuntos de datos de metilación públicos.

## Requisitos de hardware

- Al ser un modelo de regresión con PCA + elastic net, los requisitos de hardware son mínimos.
- No requiere GPU; puede ejecutarse en CPU de cualquier ordenador moderno.
- La memoria RAM necesaria es reducida (probablemente menos de 1 GB, ya que el tamaño del repositorio es de 0.1 GB).
- No se dispone de datos de latencia o throughput, pero al ser un modelo de inferencia directa sobre un vector de metilación, la predicción es prácticamente instantánea.
- Opciones de despliegue: se integra en la librería `pyaging` de Python, por lo que puede usarse en entornos Jupyter, scripts o pipelines de análisis de datos. No está diseñado para servir como API REST ni para uso con vLLM, llama.cpp u otras herramientas de inferencia de LLM.

## Comparativa con modelos similares

No se dispone de información suficiente en la ficha para realizar una comparativa cuantitativa con otros relojes epigenéticos. Existen alternativas conocidas como el reloj de Horvath (versión original), el reloj de Hannum o el PhenoAge, pero no se han proporcionado datos de rendimiento, contexto ni licencias de estos modelos en la información disponible. Por tanto, la comparativa se limita a señalar que `pcskinandblood` se centra en tejidos específicos (piel, sangre, fibroblastos) y que su arquitectura PCA + elastic net es más simple que otras basadas en redes neuronales, lo que facilita su interpretabilidad y despliegue.

## Limitaciones y advertencias

- El modelo solo está entrenado para tres tipos de tejido (piel, sangre y fibroblastos); su aplicación a otros tejidos puede producir predicciones poco fiables.
- La predicción se basa en datos de metilación de ADN, que requieren un preprocesamiento adecuado (normalización, control de calidad) para obtener resultados válidos.
- No se han publicado métricas de precisión ni validación externa en la model card; es necesario revisar el artículo original para conocer su rendimiento real.
- Al ser un modelo de regresión lineal con regularización, puede no capturar relaciones no lineales complejas entre la metilación y la edad.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda citar la publicación original en cualquier trabajo derivado.
- No se dispone de información sobre sesgos demográficos (edad, sexo, etnia) en los datos de entrenamiento; podría existir un sesgo hacia las poblaciones de los datasets originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/pcskinandblood
- Publicación original (Nature Aging, 2022): https://doi.org/10.1038/s43587-022-00248-2
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
