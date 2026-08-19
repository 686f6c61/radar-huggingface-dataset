# pyaging/systemsagemusculoskeletal

## Resumen

`pyaging/systemsagemusculoskeletal` es un reloj epigenético específico para estimar la edad biológica del sistema musculoesquelético a partir de metilación de ADN en sangre completa. Forma parte del proyecto Systems Age, una colección de relojes que cuantifican la heterogeneidad del envejecimiento en once sistemas fisiológicos distintos. El modelo fue desarrollado por el equipo de pyaging y publicado en *Nature Aging* en 2025 (Sehgal et al.). Utiliza una combinación de análisis de componentes principales (PCA) y regresión elastic net para transformar los niveles de metilación en una puntuación expresada en una escala similar a la edad cronológica.

A diferencia de los modelos de lenguaje, este es un modelo estadístico supervisado de pequeño tamaño, pensado para ser utilizado con la librería `pyaging` en pipelines de análisis de datos ómicos. Su relevancia radica en que permite descomponer el envejecimiento biológico en componentes sistémicos, lo que facilita estudios sobre fragilidad, sarcopenia y enfermedades musculoesqueléticas. El repositorio en HuggingFace contiene los pesos del modelo (2.0 GB) y la integración directa con la API de predicción de `pyaging`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + regresión elastic net |
| Parametros totales | no disponible (modelo estadístico, no neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente archivos de coeficientes, no safetensors) |

## Arquitectura y entrenamiento

El modelo sigue un enfoque clásico de reloj epigenético: primero se aplica PCA a las medidas de metilación de ADN para reducir la dimensionalidad y capturar las principales fuentes de variación. Sobre los componentes principales resultantes se entrena una regresión elastic net, que combina regularización L1 y L2, para predecir una variable objetivo relacionada con la salud musculoesquelética. Según la descripción del autor, el entrenamiento se realizó utilizando biomarcadores musculoesqueléticos, medidas funcionales y datos de mortalidad como variables de supervisión, devolviendo una puntuación en una escala similar a la edad. No se especifican el número de muestras, la composición exacta del dataset de entrenamiento ni el procedimiento de validación en la información disponible.

## Capacidades

- Predicción de la edad biológica del sistema musculoesquelético a partir de datos de metilación de ADN de sangre completa.
- Integración directa con la librería `pyaging` mediante la función `predict_age`.
- Generación de una puntuación continua en escala de edad, interpretable como desviación del envejecimiento esperado para la edad cronológica.
- Compatible con datos de metilación típicos de arrays de Illumina (Infinium 450K o EPIC), aunque no se detalla el formato exacto requerido.
- No soporta procesamiento de lenguaje, visión ni otras modalidades.

## Casos de uso

- Investigación en envejecimiento musculoesquelético: permite cuantificar la aceleración o desaceleración del envejecimiento de este sistema en cohortes de pacientes con sarcopenia, osteoporosis o fragilidad.
- Estudios longitudinales de intervenciones: se puede utilizar para monitorizar el efecto de tratamientos farmacológicos, ejercicio físico o cambios nutricionales sobre la edad biológica musculoesquelética en estudios con seguimiento.
- Medicina preventiva personalizada: integrar la puntuación en chequeos médicos para identificar individuos con envejecimiento acelerado del sistema musculoesquelético antes de que aparezcan síntomas clínicos.
- Análisis de mortalidad y comorbilidad: al haberse entrenado parcialmente con datos de mortalidad, puede servir como variable predictora en modelos de riesgo de mortalidad por causas relacionadas con el sistema musculoesquelético.
- Validación de biomarcadores: utilizado como referencia para comparar nuevos biomarcadores de envejecimiento muscular u óseo en sangre.
- Estudios de heterogeneidad del envejecimiento: combinado con otros relojes de Systems Age, permite analizar cómo envejecen de forma diferencial distintos sistemas fisiológicos en un mismo individuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (Sehgal et al., 2025) podría contener métricas de validación, pero no se proporcionan en la model card de HuggingFace.

## Requisitos de hardware

- Al ser un modelo de regresión sobre componentes principales, su inferencia es ligera y se ejecuta en CPU sin necesidad de GPU.
- La memoria RAM necesaria depende del número de CpGs (sitios de metilación) procesados; con datos típicos de arrays de metilación, no debería superar unos pocos GB.
- No requiere tarjetas gráficas especializadas; cualquier ordenador con Python y las dependencias de `pyaging` puede ejecutarlo.
- El despliegue se realiza mediante la librería `pyaging`, que gestiona la carga del modelo y la predicción. No se contempla el uso de vLLM, llama.cpp u otros motores de inferencia para modelos de lenguaje.
- La latencia es del orden de milisegundos por muestra, dependiendo del número de características.

## Comparativa con modelos similares

No se dispone de una comparativa directa en la información proporcionada. Existen otros relojes epigenéticos como el reloj de Horvath (pan-tejido), el de Hannum (sangre) o PhenoAge, pero no se han encontrado datos comparativos específicos con este modelo en la model card. La comparación requeriría consultar el paper original.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para sangre completa; su aplicación a otros tejidos puede producir resultados no válidos.
- La precisión depende de la calidad y normalización de los datos de metilación; variaciones en el preprocesamiento pueden afectar la puntuación.
- No se han detallado los sesgos poblacionales del dataset de entrenamiento; es probable que existan limitaciones en cuanto a diversidad étnica y geográfica.
- La interpretación clínica debe realizarse con cautela: la edad biológica musculoesquelética es una medida correlacional, no causal.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar las restricciones del paper original y de los datos utilizados para el entrenamiento.
- No hay información sobre la estabilidad temporal de la predicción ni sobre su reproducibilidad entre laboratorios.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/systemsagemusculoskeletal
- Paper: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. *Nature Aging*, 5, 1880–1896. DOI: https://doi.org/10.1038/s43587-025-00958-3
- Documentación de pyaging: https://pyaging.readthedocs.io
