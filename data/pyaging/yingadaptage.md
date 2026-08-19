# pyaging/yingadaptage

## Resumen

yingadaptage es un reloj epigenético basado en metilación de ADN, desarrollado por el equipo de pyaging y publicado en 2024 en *Nature Aging* (Ying et al.). A diferencia de los relojes convencionales que estiman la edad biológica global, este modelo predice la **edad epigenética adaptativa**, es decir, la asociada a CpGs con efectos protectores o adaptativos frente al daño acumulado. Para ello emplea una regresión elastic net con penalizaciones ponderadas por puntuaciones de causalidad obtenidas mediante EWMR (causalidade-weighted Mendelian randomization), lo que permite separar el componente de daño del de adaptación en el envejecimiento.

El modelo está entrenado exclusivamente en datos de metilación de ADN de sangre completa humana y se distribuye bajo licencia BSD-3-Clause. Su integración en el ecosistema pyaging lo hace directamente utilizable desde Python con una sola línea de código, lo que lo convierte en una herramienta accesible para investigadores biomédicos que estudian el envejecimiento desde una perspectiva causal. Aunque no es un modelo de lenguaje ni de visión, su relevancia radica en aportar una métrica biológica interpretable y con respaldo estadístico para estudios longitudinales y de intervención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net ponderada por causalidad (EWMR) |
| Parametros totales | No disponible (modelo lineal, peso por CpG seleccionado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular sobre metilacion) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en libreria pyaging) |

## Arquitectura y entrenamiento

El modelo se basa en una regresión lineal regularizada con elastic net, donde cada CpG incluido recibe un peso que es el producto de su coeficiente de regresión y una puntuación de causalidad derivada de un análisis de aleatorización mendeliana ponderada (EWMR). Esta puntuación refleja la evidencia causal de que la metilación en ese sitio influye en la longevidad o en biomarcadores de envejecimiento, en lugar de ser simplemente correlacional.

El entrenamiento se realizó sobre datos de metilación de sangre completa de individuos humanos, con un conjunto de CpGs restringido a aquellos clasificados como adaptativos o protectores en estudios previos de asociación con edad. No se han publicado detalles sobre el número exacto de muestras ni de CpGs finales, aunque el paper original (Ying et al., 2024) describe el proceso completo. No se emplearon técnicas de RLHF ni DPO; es un modelo supervisado de regresión.

## Capacidades

- Predicción de edad epigenética adaptativa a partir de perfiles de metilación de ADN (array de 450K o EPIC).
- Distinción entre componentes de daño y adaptación en el envejecimiento epigenético.
- Integración nativa con la librería `pyaging` para análisis de relojes epigenéticos.
- Interpretabilidad: cada CpG contribuye con un peso causal explícito, lo que permite identificar dianas biológicas relevantes.
- Compatible con datos de entrada en formato AnnData (usado en scanpy).

## Casos de uso

- **Investigación en biología del envejecimiento**: permite cuantificar la componente adaptativa del envejecimiento epigenético, separándola del daño acumulado, en estudios de cohortes longitudinales.
- **Evaluación de intervenciones antienvejecimiento**: en ensayos con fármacos o cambios de estilo de vida, se puede medir si la edad adaptativa cambia de forma distinta a la edad cronológica o a otros relojes.
- **Estudios de asociación genética**: los pesos causales de los CpGs pueden usarse como rasgos fenotípicos en GWAS para identificar variantes que modulan la respuesta adaptativa al envejecimiento.
- **Análisis de tejido sanguíneo en biobancos**: al estar entrenado en sangre completa, es aplicable a grandes cohortes con datos de metilación disponibles (p. ej., UK Biobank).
- **Validación de biomarcadores**: sirve como referencia para comparar nuevos relojes epigenéticos o para validar la relevancia causal de CpGs individuales.
- **Educación y formación en epigenética**: como ejemplo de modelo causal aplicado a datos ómicos, útil en cursos de bioinformática y estadística aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (Ying et al., 2024) reporta métricas de correlación con edad cronológica y capacidad para predecir mortalidad, pero estos datos no se incluyen en la model card de HuggingFace. Se recomienda consultar la publicación para obtener cifras concretas.

## Requisitos de hardware

- Al ser un modelo lineal con un número reducido de CpGs (típicamente cientos), la inferencia es inmediata en cualquier CPU moderna.
- No requiere GPU.
- El uso principal es a través de la librería `pyaging`, que procesa datos de metilación en formato AnnData; el coste computacional dominante es la carga y normalización de los datos de metilación, no el modelo en sí.
- Despliegue típico: scripts Python en entornos de investigación, notebooks Jupyter, o pipelines de análisis en clústeres de cálculo.
- No aplican opciones como vLLM, llama.cpp u Ollama, al no ser un modelo generativo.

## Comparativa con modelos similares

No se dispone de una comparativa directa en la información proporcionada. No obstante, se pueden mencionar alternativas en el mismo dominio:

| Modelo | Tipo | Enfoque | Licencia |
|---|---|---|---|
| yingadaptage | Elastic net causal | Edad adaptativa | BSD-3-Clause |
| Horvath clock | Elastic net | Edad epigenética global | No comercial (restricciones) |
| Hannum clock | Elastic net | Edad epigenética en sangre | No comercial |
| PhenoAge | Elastic net | Edad fenotípica | No comercial |

La principal diferencia es que yingadaptage incorpora ponderaciones causales explícitas, mientras que los relojes clásicos se basan en correlación. No se dispone de datos de rendimiento comparativo en esta ficha.

## Limitaciones y advertencias

- **Especificidad de tejido**: entrenado únicamente en sangre completa; no es válido para otros tejidos sin recalibración.
- **Especificidad de especie**: solo Homo sapiens.
- **Dependencia de la calidad de los datos de metilación**: requiere arrays de metilación estandarizados (450K o EPIC) y un preprocesado adecuado.
- **Interpretación causal limitada**: aunque usa puntuaciones EWMR, la causalidad no está probada experimentalmente para cada CpG; es una inferencia estadística.
- **Sin soporte para otros tipos de datos**: no acepta secuencias, expresión génica ni otros ómicos.
- **Licencia BSD-3-Clause**: permite uso comercial con atribución, pero se recomienda revisar los términos de la librería `pyaging` y de los datos subyacentes.
- **Sin actualizaciones conocidas**: el modelo se creó en 2024 y no hay indicios de versiones posteriores.

## Enlaces

- [HuggingFace: pyaging/yingadaptage](https://huggingface.co/pyaging/yingadaptage)
- [Publicación original: Causality-enriched epigenetic age uncouples damage and adaptation (Nature Aging, 2024)](https://doi.org/10.1038/s43587-023-00557-0)
- [Documentación de pyaging (Clock Catalogue)](https://pyaging.readthedocs.io)
