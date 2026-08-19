# pyaging/zhangmortality

## Resumen

El modelo `pyaging/zhangmortality` es un reloj de envejecimiento basado en metilación de ADN, desarrollado por Zhang et al. en 2017 y publicado en *Nature Communications*. Su objetivo es predecir el riesgo de mortalidad por todas las causas en humanos a partir de diez sitios CpG específicos en sangre periférica. A diferencia de los modelos de lenguaje, no se trata de una red neuronal, sino de un score lineal ponderado: la suma de los valores beta de diez CpGs multiplicados por coeficientes derivados mediante regresión LASSO continua, tal como se describe en el suplemento del artículo original.

Este modelo es relevante en el campo de la biología del envejecimiento y la epidemiología molecular, ya que permite estimar el riesgo de mortalidad a partir de una muestra de sangre con un número reducido de marcadores epigenéticos. La implementación en la librería `pyaging` facilita su uso directo en pipelines de análisis de metilación, sin necesidad de recalcular los coeficientes ni de disponer de infraestructura computacional pesada. El repositorio en HuggingFace contiene la definición del modelo y su integración con `pyaging`, aunque el tamaño del repositorio es de 0.0 GB, lo que indica que no se almacenan pesos en formato tradicional, sino la lógica de cálculo y los coeficientes embebidos en el código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Weighted linear score (suma ponderada de 10 valores beta) |
| Parametros totales | 10 coeficientes (uno por CpG) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa texto) |
| Tipos de cuantizacion | No aplica (no hay pesos en punto flotante) |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | Coeficientes embebidos en el codigo de pyaging (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un score lineal ponderado, no una red neuronal. Se define como la suma de diez valores beta de metilación (proporción de moléculas metiladas en cada CpG) multiplicados por coeficientes fijos obtenidos mediante regresión LASSO continua sobre datos de metilación de sangre periférica. El estudio original de Zhang et al. (2017) también define una versión simplificada basada en un conteo de metilación aberrante (0-10) con puntos de corte por cuartiles específicos de la cohorte, pero la implementación en `pyaging` utiliza exclusivamente la versión ponderada continua.

El entrenamiento se realizó con datos de metilación de ADN de sangre periférica de cohortes humanas, con seguimiento de mortalidad por todas las causas. No se dispone de detalles adicionales sobre el tamaño del dataset de entrenamiento, el número de muestras o el proceso de validación en la información proporcionada. La innovación principal reside en la selección de un número muy reducido de CpGs (10) que logran una predicción significativa del riesgo de mortalidad, lo que lo hace práctico para aplicaciones con paneles de metilación limitados.

## Capacidades

- Predicción del riesgo de mortalidad por todas las causas a partir de diez valores beta de metilación en sangre periférica.
- Cálculo directo del score continuo ponderado, sin necesidad de normalizaciones adicionales más allá de los valores beta estándar.
- Integración con el ecosistema `pyaging` para su uso en pipelines de análisis de envejecimiento.
- No soporta generación de texto, razonamiento, código, visión ni otras capacidades de modelos de lenguaje.
- No soporta tool calling ni funciones de agente.
- No tiene capacidades multilingües ni de procesamiento de audio.

## Casos de uso

- **Estudios epidemiológicos de mortalidad**: permite estimar el riesgo de mortalidad en cohortes con datos de metilación de sangre periférica, complementando factores de riesgo clásicos como edad, sexo o comorbilidades. Se usaría como variable predictora en modelos de regresión de Cox o como biomarcador continuo.
- **Investigación en envejecimiento**: sirve para cuantificar el "reloj de mortalidad" en estudios que comparan intervenciones (dieta, ejercicio, fármacos) y su efecto sobre la mortalidad epigenética. Al ser un score lineal simple, se puede calcular en hojas de cálculo o con pocas líneas de código.
- **Validación de paneles de metilación reducidos**: dado que solo requiere 10 CpGs, es adecuado para paneles de bajo coste (por ejemplo, arrays de metilación de 450K o 850K que ya incluyen esos sitios) o para ensayos personalizados.
- **Análisis secundario de datos públicos**: investigadores pueden aplicar el modelo a datos de metilación ya publicados (GEO, TCGA) para explorar asociaciones entre el score y otras variables clínicas.
- **Desarrollo de herramientas de salud preventiva**: aunque no es un modelo clínico aprobado, puede integrarse en herramientas de investigación para estratificar a pacientes en estudios de medicina personalizada.
- **Docencia y formación**: como ejemplo de reloj epigenético simple y reproducible, es útil en cursos de bioinformática o biología del envejecimiento para ilustrar la construcción de scores lineales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de rendimiento (como AUC, C-index o hazard ratios) ni comparaciones con otros relojes de mortalidad. Para obtener datos de validación, es necesario consultar el artículo original de Zhang et al. (2017) o la documentación de `pyaging`.

## Requisitos de hardware

- **VRAM**: no requiere GPU. El cálculo del score es una suma de diez multiplicaciones, ejecutable en cualquier CPU.
- **GPU recomendadas**: ninguna. Se puede ejecutar en un ordenador portátil o incluso en un microcontrolador si se implementa en un lenguaje embebido.
- **Compatibilidad con consumer GPU**: no aplica.
- **Opciones de despliegue**: se integra en Python mediante `pyaging` (pip install pyaging). No requiere vLLM, llama.cpp ni Ollama.
- **Latencia y throughput**: el cálculo es instantáneo (microsegundos) para una muestra individual. Para miles de muestras, el cuello de botella es la lectura de los datos de metilación, no el propio score.

## Comparativa con modelos similares

No se dispone de una comparación cuantitativa en la información proporcionada. Existen otros relojes de envejecimiento basados en metilación, como el reloj de Horvath (multi-tejido, 353 CpGs) o el de Hannum (sangre, 71 CpGs), pero no se han incluido datos comparativos en la model card. La principal diferencia de `zhangmortality` es su enfoque específico en mortalidad (no en edad cronológica) y su reducido número de CpGs (10), lo que lo hace más simple pero potencialmente menos preciso para estimar edad biológica general.

## Limitaciones y advertencias

- **Sesgos de cohorte**: los coeficientes fueron derivados de cohortes específicas (europeas, según el estudio original) y pueden no ser transferibles a otras poblaciones o grupos étnicos sin recalibración.
- **Especificidad tisular**: el modelo está validado solo para sangre periférica. No debe aplicarse a otros tejidos (p. ej., tejido tumoral o saliva) sin validación.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo.
- **Interpretación clínica**: el score predice riesgo de mortalidad a nivel poblacional, no individual. No debe usarse como diagnóstico o pronóstico clínico sin supervisión médica.
- **Limitaciones del score lineal**: asume una relación lineal entre los valores beta y el log-riesgo, lo que puede ser una simplificación excesiva en ciertos rangos de metilación.
- **Restricciones de licencia**: la licencia BSD-3-Clause permite uso comercial y modificación, pero se recomienda citar el artículo original en publicaciones científicas.

## Enlaces

- Repositorio en HuggingFace: [pyaging/zhangmortality](https://huggingface.co/pyaging/zhangmortality)
- Documentación de pyaging: [pyaging Clock Catalogue](https://pyaging.readthedocs.io)
- Artículo original: Zhang, Y., Wilson, R., Heiss, J. et al. DNA methylation signatures in peripheral blood strongly predict all-cause mortality. Nature Communications 8, 14617 (2017). DOI: [10.1038/ncomms14617](https://doi.org/10.1038/ncomms14617)
