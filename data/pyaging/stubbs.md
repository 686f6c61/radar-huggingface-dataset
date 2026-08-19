# pyaging/stubbs

## Resumen

El modelo `pyaging/stubbs` es un reloj epigenético (aging clock) diseñado para predecir la edad cronológica de ratones (*Mus musculus*) a partir de datos de metilación de ADN. Fue desarrollado por el grupo de Stubbs et al. en 2017 y publicado en *Genome Biology*. Se trata de un modelo de regresión elastic net con calibración cuadrática que, partiendo de 17.992 loci de entrada normalizados, reduce la señal a 329 sitios CpG con coeficientes no nulos para estimar la edad.

Este modelo no es un sistema de IA generativa ni un LLM, sino un predictor estadístico especializado en biología del envejecimiento. Su relevancia radica en que permite cuantificar la edad biológica en múltiples tejidos de ratón (hígado, pulmón, corazón, corteza cerebral, músculo esquelético, cerebelo y bazo), lo que lo convierte en una herramienta útil para la investigación biomédica sobre envejecimiento y para evaluar intervenciones que modulan la velocidad de envejecimiento en modelos murinos.

Se distribuye bajo licencia BSD-3-Clause y se integra en la librería `pyaging`, un ecosistema de relojes epigenéticos de código abierto. El repositorio en HuggingFace no contiene pesos ni artefactos descargables (tamaño 0.0 GB), sino que actúa como una entrada del catálogo de relojes de `pyaging`; la predicción se realiza mediante la función `pya.pred.predict_age()`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net con calibración cuadrática |
| Parametros totales | 329 coeficientes no nulos (sobre 17.992 loci de entrada) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; modelo tabular) |
| Tipos de cuantizacion | no disponible (modelo no neuronal) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (los pesos se gestionan internamente en `pyaging`) |

## Arquitectura y entrenamiento

El modelo se basa en una regresión elastic net, una técnica de regularización lineal que combina penalizaciones L1 y L2. A partir de los valores de metilación en 17.992 loci CpG comunes entre tejidos, el modelo selecciona automáticamente un subconjunto de 329 sitios con coeficientes distintos de cero. Posteriormente, se aplica una calibración cuadrática para ajustar la relación entre la puntuación lineal y la edad cronológica, lo que mejora la precisión en edades extremas.

No se dispone de información detallada sobre el conjunto de entrenamiento (número de muestras, composición por tejido, procedencia de los datos de metilación) más allá de lo indicado en la publicación original. El modelo fue entrenado con datos de metilación de ADN de ratón obtenidos mediante secuenciación reducida por representación (RRBS, Reduced Representation Bisulfite Sequencing). No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Predicción de edad cronológica en ratones a partir de perfiles de metilación de ADN.
- Soporte multi-tejido: hígado, pulmón, corazón, corteza cerebral, músculo esquelético, cerebelo y bazo.
- Entrada normalizada de 17.992 loci CpG comunes, lo que facilita su aplicación a datos de RRBS de distintos experimentos.
- Calibración cuadrática que corrige el sesgo de regresión hacia la media en edades extremas.
- Integración con `pyaging` para su uso directo sobre objetos `AnnData` (estructura de datos de Scanpy).
- No soporta generación de texto, tool calling, agentes, visión ni capacidades multilingües.

## Casos de uso

- Investigación en biología del envejecimiento: permite estimar la edad biológica de ratones en estudios longitudinales o transversales, correlacionando la edad epigenética con fenotipos de envejecimiento.
- Evaluación de intervenciones anti-envejecimiento: se puede aplicar antes y después de tratamientos (fármacos, restricción calórica, modificaciones genéticas) para cuantificar cambios en la velocidad de envejecimiento.
- Estudios de heterogeneidad tisular: al ser multi-tejido, permite comparar la edad epigenética entre diferentes órganos y detectar tejidos que envejecen más rápido o más lento.
- Validación de biomarcadores: sirve como referencia para comparar nuevos relojes epigenéticos o para validar la calidad de datos de metilación en ratón.
- Control de calidad en experimentos con ratones: la edad epigenética puede desviarse de la edad cronológica en condiciones patológicas, lo que ayuda a identificar animales con envejecimiento acelerado.
- Docencia y divulgación: como ejemplo práctico de modelo de regresión aplicado a datos ómicos en cursos de bioinformática o biología computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Stubbs et al., 2017) reporta métricas de precisión (error absoluto medio, correlación) en su publicación, pero estos datos no se han incluido en la model card ni en el repositorio de HuggingFace. No se dispone de comparaciones cuantitativas con otros relojes epigenéticos en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo de regresión lineal (no neuronal), no requiere GPU. La inferencia se ejecuta en CPU con recursos mínimos.
- Memoria RAM necesaria: inferior a 1 GB, ya que solo se manejan 17.992 características y 329 coeficientes.
- No aplica cuantización ni despliegue en motores como vLLM, llama.cpp u Ollama.
- La predicción se realiza a través de la librería `pyaging`, que depende de Python y de paquetes científicos estándar (numpy, pandas, scikit-learn).
- Latencia: milisegundos por muestra, incluso en hardware modesto.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos en la información proporcionada. Existen otros relojes epigenéticos para ratón (por ejemplo, el reloj de Horvath para ratón, o el de Petkovich et al.), pero no se han incluido métricas de rendimiento en la model card. Se recomienda consultar el catálogo de `pyaging` para una comparación exhaustiva entre relojes.

## Limitaciones y advertencias

- Modelo desarrollado exclusivamente para ratón (*Mus musculus*); no es aplicable a otras especies sin recalibración.
- Requiere datos de metilación de ADN obtenidos con tecnología RRBS o compatibles con los 17.992 loci de entrada; otros métodos (arrays, WGBS) pueden necesitar preprocesamiento adicional.
- La precisión puede verse afectada por la calidad de los datos de metilación, la cobertura de secuenciación y la normalización aplicada.
- El modelo fue publicado en 2017; puede no incorporar avances posteriores en relojes epigenéticos.
- No se ha verificado su rendimiento en poblaciones de ratones con fondo genético distinto al utilizado en el entrenamiento.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar la publicación original.
- No es un modelo de IA generativa; no puede realizar tareas de lenguaje, razonamiento o generación de contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pyaging/stubbs
- Documentación de pyaging (catálogo de relojes): https://pyaging.readthedocs.io
- Publicación original: Stubbs, T. M., et al. "Multi-tissue DNA methylation age predictor in mouse." Genome Biology 18: 68 (2017). DOI: https://doi.org/10.1186/s13059-017-1203-5
