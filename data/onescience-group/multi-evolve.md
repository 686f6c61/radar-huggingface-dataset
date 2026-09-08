# OneScience-Group/MULTI-evolve

## Resumen

MULTI-evolve es un framework end-to-end para evolución dirigida de proteínas desarrollado por OneScience-Group. A diferencia de un modelo de lenguaje convencional, se trata de una herramienta de inteligencia artificial para biología computacional que integra predicción de fitness secuencia-a-secuencia, diseño combinatorio de multi-mutantes y generación de oligonucleótidos para mutagénesis dirigida. El problema que resuelve es la optimización de proteínas mediante mutaciones combinadas, acelerando el ciclo de evolución dirigida con un enfoque guiado por modelos de lenguaje de proteínas y considerando interacciones epistáticas.

El framework entrena redes neuronales fully connected con datos experimentales de fitness, propone mutantes combinatoriales y genera los cebadores necesarios para su construcción. Además, incorpora un ensemble zero-shot de protein language models (ESM-1v, ESM-2 y ESM-IF1) para el screening de mutantes individuales. Su relevancia radica en la publicación del método en la revista Science en 2026, con el título "Rapid directed evolution guided by protein language models and epistatic interactions", lo que lo posiciona como una referencia en el campo de la evolución dirigida asistida por IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales fully connected (supervisadas) + ensemble zero-shot de protein language models (ESM-1v, ESM-2, ESM-IF1) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (trabaja con secuencias de proteínas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (documentación e interfaz) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los modelos ESM se descargan vía fair-esm; los pesos de las redes fully connected se entrenan con datos propios) |

## Arquitectura y entrenamiento

MULTI-evolve es un framework modular que entrena redes neuronales fully connected para predecir el fitness de secuencias de proteínas a partir de datos experimentales. El proceso de entrenamiento utiliza un dataset en CSV con las columnas `mutation` y `property_value`, y el framework permite comparar diferentes divisiones de datos, representaciones de secuencia y modelos de machine learning para seleccionar el mejor predictor. Una vez entrenado, el modelo puntúa combinaciones de mutaciones y propone candidatos multi-mutantes.

La innovación técnica principal es la integración de modelos de lenguaje de proteínas (ESM-1v, ESM-2 y ESM-IF1) mediante un ensemble zero-shot para el screening de mutantes individuales. Este enfoque aprovecha el conocimiento previo de los modelos de lenguaje sobre secuencias proteicas y lo combina con la predicción epistática de interacciones entre mutaciones. El framework también genera oligonucleótidos para mutagénesis dirigida MULTI-assembly a partir de los multi-mutantes seleccionados. El método se describe en el artículo de Science de 2026, donde se detalla el entrenamiento y la validación experimental.

## Capacidades

- Predicción de fitness de secuencias de proteínas a partir de datos experimentales de entrenamiento.
- Diseño de multi-mutantes combinatoriales: el framework puntúa combinaciones de mutaciones y prioriza aquellas con mayor fitness predicho.
- Generación de oligonucleótidos para mutagénesis dirigida MULTI-assembly a partir de los candidatos seleccionados.
- Screening de mutantes individuales mediante un ensemble zero-shot de protein language models (ESM-1v, ESM-2 y ESM-IF1).
- Soporte para proteínas de cadena simple y multicadena, con formato de mutaciones que usa `/` para separar mutaciones en la misma cadena y `:` para separar cadenas (por ejemplo, `A40P/E61Y:WT`).
- Comparación de diferentes modelos de machine learning y representaciones de secuencia para seleccionar el mejor predictor.
- Capacidad de ejecución en CPU o GPU/DCU para el entrenamiento supervisado; GPU/DCU recomendada para el modo zero-shot.

## Casos de uso

- Evolución dirigida de proteínas: el framework entrena modelos de predicción de fitness con datos experimentales y propone mutaciones candidatas para mejorar la función de una proteína concreta.
- Diseño de multi-mutantes: permite predecir combinaciones de mutaciones (por ejemplo, `A40P/E61Y`) y priorizar aquellas con mayor fitness predicho, reduciendo el número de experimentos necesarios.
- Optimización de complejos proteicos: soporta el formato de mutaciones multicadena (por ejemplo, `A40P/E61Y:WT`) para optimizar complejos de varias subunidades, como anticuerpos o enzimas multiméricas.
- Screening zero-shot de mutaciones: utiliza un ensemble de protein language models (ESM-1v, ESM-2, ESM-IF1) para evaluar mutantes individuales sin necesidad de datos de entrenamiento adicionales, útil en fases iniciales de un proyecto.
- Generación de cebadores para mutagénesis dirigida: a partir de los multi-mutantes seleccionados, genera oligonucleótidos para construir las variantes mediante MULTI-assembly, facilitando la síntesis genética en laboratorio.
- Reproducción de benchmarks científicos: el repositorio oficial incluye datos de ejemplo (`example_protein` y `example_multichain_protein`) para reproducir los flujos básicos del framework y validar su funcionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado en Science (2026) contiene evaluaciones experimentales, pero no se proporcionan datos numéricos en la model card ni en los resultados de búsqueda. Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

- Entrenamiento supervisado y predicción estándar de mutantes combinatoriales: puede ejecutarse en CPU o GPU/DCU.
- Protein language model zero-shot (ESM-1v, ESM-2, ESM-IF1): se recomienda GPU/DCU.
- El entorno de instalación requiere Python 3.11 y el paquete `onescience[bio]`. En entornos DCU se necesita activar DTK y CONDA.
- Los modelos ESM se descargan automáticamente vía fair-esm y se cachean en `~/.cache/torch/hub/checkpoints/`. El modelo ESM-2 3B requiere además el checkpoint de contact regression `esm2_t36_3B_UR50D-contact-regression.pt`, incluido en el repositorio.
- Para redes corporativas sin acceso a Internet, es necesario descargar previamente los pesos de los modelos ESM.
- No se especifican requisitos de VRAM ni GPUs concretas en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. MULTI-evolve es un framework específico para evolución dirigida de proteínas; se podría comparar con herramientas como EVE o AlphaFold para predicción de fitness, pero no hay datos disponibles en la información actual. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El framework depende de la calidad y cantidad de los datos experimentales de entrenamiento; las predicciones pueden ser poco fiables si los datos son escasos o sesgados.
- El screening zero-shot con ESM-IF1 requiere estructuras PDB/CIF, lo que limita su uso a proteínas con estructura tridimensional conocida.
- Los modelos ESM (ESM-1v, ESM-2, ESM-IF1) se descargan automáticamente; en entornos sin conexión es necesario descargarlos manualmente.
- La licencia Apache 2.0 permite uso comercial, pero los modelos ESM subyacentes (fair-esm) pueden tener sus propias licencias; se debe revisar antes de un despliegue en producción.
- No se especifican límites de longitud de secuencia ni restricciones de contexto; el framework puede tener limitaciones no documentadas.
- El repositorio en HuggingFace tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco utilizado.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/MULTI-evolve
- GitHub (implementación): https://github.com/VincentQTran/MULTI-evolve
- Paper: https://doi.org/10.1126/science.aea1820 (Science, 2026)
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
