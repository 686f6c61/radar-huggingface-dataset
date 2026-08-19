# pyaging/neusin

## Resumen

Neusin es un reloj epigenético de edad cronológica específico de neuronas, desarrollado por el equipo de pyaging y publicado en 2024 en el artículo de Tong et al. "Cell-type specific epigenetic clocks to quantify biological age at cell-type resolution". El modelo utiliza regresión elastic net restringida a los sitios CpG diferencialmente metilados con la edad (age-DMCTs) en neuronas, pero se ajusta sobre valores de metilación que no han sido corregidos por fracciones celulares. Esto lo convierte en una herramienta para estimar la edad biológica a resolución de tipo celular en corteza cerebral humana.

A diferencia de los relojes epigenéticos globales (como Horvath o Hannum), Neusin se centra exclusivamente en el componente neuronal, lo que permite estudiar el envejecimiento celular específico del tejido cerebral. Su implementación en la librería pyaging facilita su integración en pipelines de análisis de datos de metilación de ADN. El modelo es ligero, no requiere GPU y se distribuye bajo licencia BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (formato interno de pyaging) |

## Arquitectura y entrenamiento

Neusin es un modelo de regresión elastic net, una técnica de regularización lineal que combina penalizaciones L1 y L2. La elastic net se ajusta exclusivamente sobre los CpG diferencialmente metilados con la edad en neuronas (age-DMCTs), seleccionados previamente mediante análisis de asociación. A diferencia de otros relojes que corrigen por proporciones celulares, Neusin utiliza valores de metilación crudos, sin ajustar por fracciones de tipos celulares, lo que permite capturar la señal intrínseca de las neuronas.

Los datos de entrenamiento provienen de muestras de corteza cerebral humana (Homo sapiens), aunque no se especifican el número de muestras ni el número de CpG utilizados en la información disponible. El modelo se entrena para predecir la edad cronológica del individuo a partir del perfil de metilación. No se ha aplicado ningún proceso de ajuste por refuerzo (RLHF/DPO) ni técnicas de aprendizaje profundo; es un modelo estadístico clásico.

## Capacidades

- Predicción de edad cronológica a partir de datos de metilación de ADN en corteza cerebral.
- Específico para neuronas, lo que permite estimar la edad biológica a resolución de tipo celular.
- Integración sencilla con la librería pyaging mediante la función `predict_age`.
- Modelo ligero y rápido, adecuado para ejecución en CPU.
- No requiere preprocesamiento de fracciones celulares, simplificando el flujo de trabajo.

## Casos de uso

- Investigación del envejecimiento cerebral: Neusin permite cuantificar la edad biológica de las neuronas en muestras post-mortem de corteza, ayudando a estudiar la heterogeneidad del envejecimiento entre tipos celulares.
- Biomarcadores de enfermedades neurodegenerativas: comparar la edad epigenética neuronal en pacientes con Alzheimer, Parkinson u otras patologías frente a controles sanos, para evaluar si existe aceleración del envejecimiento celular.
- Estudios de intervención en longevidad: analizar si fármacos, dietas o terapias génicas modifican la edad epigenética neuronal en modelos animales o ensayos clínicos con muestras cerebrales.
- Validación de relojes epigenéticos globales: usar Neusin como referencia específica de neuronas para contrastar resultados de relojes pan-tisulares y entender qué fracción de la señal proviene de células no neuronales.
- Análisis de datos de metilación en biobancos: aplicar Neusin a cohortes con datos de metilación de cerebro para generar nuevas variables de edad biológica neuronal que puedan correlacionarse con fenotipos clínicos.
- Docencia y formación en epigenética computacional: como ejemplo de modelo de regresión aplicado a datos ómicos, Neusin es útil para ilustrar conceptos de regularización y selección de características en cursos de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo original (Tong et al., 2024) podría contener métricas de correlación y error absoluto medio, pero no están incluidas en la model card. No se dispone de comparaciones cuantitativas con otros relojes epigenéticos en esta fuente.

## Requisitos de hardware

- No requiere GPU: es un modelo de regresión lineal, se ejecuta en CPU con recursos mínimos.
- Memoria RAM: inferior a 1 GB, dependiendo del número de CpG seleccionados (no especificado).
- Almacenamiento: el repositorio en HuggingFace tiene un tamaño de 0.0 GB, lo que sugiere que el modelo es muy pequeño (posiblemente un archivo de coeficientes).
- Despliegue: se utiliza a través de la librería pyaging, que depende de Python y bibliotecas estándar de ciencia de datos (numpy, pandas, scikit-learn).
- Latencia: milisegundos para una predicción, ya que solo requiere una multiplicación matriz-vector.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Existen otros relojes epigenéticos como Horvath (2013), Hannum (2013) o el reloj de PhenoAge, pero Neusin se distingue por su especificidad neuronal y por no ajustar por fracciones celulares. Sin datos de rendimiento publicados en la model card, no es posible establecer comparaciones numéricas.

## Limitaciones y advertencias

- Específico de Homo sapiens y de corteza cerebral; no es aplicable a otros tejidos ni especies sin reentrenamiento.
- No ajusta por fracciones celulares, lo que puede introducir sesgos si la composición celular varía entre muestras.
- El modelo se basa en datos de metilación de un solo estudio (Tong et al., 2024); su generalización a otras cohortes debe validarse.
- No se han reportado métricas de precisión (correlación, MAE) en la información disponible, por lo que se desconoce su error de predicción.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda citar el artículo original.
- No es un modelo de lenguaje ni tiene capacidades de generación de texto; su uso se limita a la predicción de edad a partir de datos de metilación.

## Enlaces

- [HuggingFace: pyaging/neusin](https://huggingface.co/pyaging/neusin)
- [Publicación original: Tong et al., Aging 2024](https://doi.org/10.18632/aging.206184)
- [Documentación de pyaging (Clock Catalogue)](https://pyaging.readthedocs.io)
