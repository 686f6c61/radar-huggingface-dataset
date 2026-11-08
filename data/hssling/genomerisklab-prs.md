# hssling/genomerisklab-prs

## Resumen

`hssling/genomerisklab-prs` es una plantilla de model card publicada en Hugging Face para modelos de puntuación de riesgo poligénico (Polygenic Risk Score, PRS) orientados a investigación genómica. El repositorio no contiene un modelo de lenguaje ni una red neuronal entrenada, sino la especificación de un modelo lineal aditivo cuyo cálculo es `PRS = Σ (dosage_i × effect_weight_i)`, donde `dosage_i ∈ {0, 1, 2}` representa el número de alelos de efecto en la variante `i` y `effect_weight_i` es el peso log-odds o beta procedente del PGS Catalog. El autor es el Dr. Siddalingaiah H S, profesor del Departamento de Medicina Comunitaria del Shridevi Institute of Medical Sciences and Research Hospital (Tumkur, India).

La relevancia del artefacto es metodológica: establece un formato reproducible para publicar PRS con trazabilidad hacia el PGS Catalog, calibración contra distribuciones del proyecto 1000 Genomes Phase 3 y etiquetado obligatorio de "solo uso en investigación". Todos los campos específicos de enfermedad, ID de PGS, número de variantes, ancestría y métricas de rendimiento aparecen como marcadores de plantilla (`{DISEASE_CODE}`, `{PGS_ID}`, `{N_VARIANTS}`, `{AUC}`, etc.), por lo que el repositorio no corresponde a un PRS concreto validado.

No se trata, por tanto, de un modelo generativo comparable a un LLM: carece de parámetros neuronales, de ventana de contexto y de capacidad de inferencia sobre texto. Su utilidad práctica es servir como esqueleto documental para que investigadores publiquen sus propios PRS con las garantías de gobernanza que exige el campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo lineal aditivo de riesgo poligénico (suma ponderada de dosis alélicas) |
| Parametros totales | no disponible (no es un modelo neuronal; los "pesos" son coeficientes por variante, número no especificado en la plantilla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (la plantilla no especifica formato; el cálculo se define sobre pesos de efecto del PGS Catalog) |

## Arquitectura y entrenamiento

La arquitectura descrita es un PRS lineal aditivo: el score de un individuo se obtiene sumando, sobre el conjunto de variantes del modelo, el producto entre la dosis alélica (0, 1 o 2) y el peso de efecto publicado en el PGS Catalog. Los pesos proceden de un meta-análisis GWAS cuya fuente exacta aparece como marcador `{GWAS_SOURCE}` en la plantilla, junto con la versión del score (`{PGS_VERSION}`), la build del genoma (`{GENOME_BUILD}`), el número de variantes (`{N_VARIANTS}`) y la ancestría de entrenamiento (`{TRAINING_ANCESTRY}`). No hay entrenamiento neuronal, RLHF, DPO ni fases de ajuste; el "modelo" es esencialmente una tabla de coeficientes importada de un recurso público.

La innovación técnica del artefacto es de gobernanza y reproducibilidad: calibración de scores brutos contra distribuciones del 1000 Genomes Project Phase 3 (dataset `genomerisklab-calibration-1kg`), percentiles y bandas de riesgo específicas por ancestría, separación estricta entre PRS y anotación de variantes raras para evitar confundir riesgo poblacional con riesgo individual, y un umbral de completitud del 80 % por debajo del cual los resultados se marcan como no fiables.

## Capacidades

- Cálculo de un score poligénico agregado a partir de dosis alélicas y pesos de efecto del PGS Catalog.
- Calibración de scores brutos contra distribuciones poblacionales de 1000 Genomes Phase 3, con percentiles y bandas de riesgo por ancestría.
- Control de calidad mediante umbral de completitud de variantes (por debajo del 80 % el resultado se marca como no fiable).
- Trazabilidad documental hacia el PGS Catalog (ID y versión del score) y hacia el GWAS de origen.
- Etiquetado de "solo uso en investigación" en todas las capas del artefacto.
- Separación explícita entre riesgo poligénico poblacional y anotación de variantes raras.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Investigación poblacional en genética: aplicar el PRS sobre cohortes genotipadas para estudiar asociaciones entre carga poligénica y fenotipos, usando la calibración por ancestría para contextualizar los percentiles.
- Docencia y demostración metodológica: el repositorio sirve como plantilla para explicar cómo se construye, documenta y calibra un PRS, incluyendo los campos obligatorios de trazabilidad al PGS Catalog.
- Publicación reproducible de PRS: un grupo de investigación puede clonar la estructura y rellenar los marcadores (`{PGS_ID}`, `{N_VARIANTS}`, `{AUC}`, etc.) para publicar su propio score con gobernanza homogénea.
- Auditoría de scores existentes: la plantilla obliga a declarar GWAS de origen, build del genoma, ancestría de entrenamiento y métricas de evaluación, lo que facilita la revisión por pares y la comparación entre scores.
- Filtrado de calidad en pipelines genómicos: el umbral de completitud del 80 % permite descartar automáticamente muestras con genotipado insuficiente antes de calcular el score.
- Estudios de equidad en genómica: la calibración específica por ancestría y las advertencias sobre bajo rendimiento en poblaciones no europeas permiten documentar y cuantificar sesgos de transferibilidad.
- Integración en flujos educativos de bioinformática: uso del esquema `PRS = Σ (dosage_i × effect_weight_i)` como ejercicio práctico de cálculo vectorizado sobre VCFs.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento con los campos `{AUC}` (población `{EVAL_POPULATION}`) y `{R2}` (Nagelkerke R²) para la población de evaluación, pero ambos valores son marcadores de plantilla sin rellenar. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el cálculo es una suma ponderada sobre dosis alélicas y puede ejecutarse en CPU.
- GPU recomendadas: no aplica; no requiere aceleración gráfica.
- Cabe en cualquier consumer GPU e incluso en entornos sin GPU.
- Opciones de despliegue: no disponible; la plantilla no especifica herramienta de inferencia (se esperaría un script de cálculo sobre VCF, pero no se documenta).
- Latencia y throughput: no disponibles; dependen del número de variantes y del tamaño de la cohorte, datos no especificados.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hssling/genomerisklab-prs | Plantilla de PRS lineal | no disponible | no aplica | cc-by-4.0 | Hugging Face |
| Scores del PGS Catalog (p. ej. PGS000001 y sucesivos) | PRS lineales publicados | variable por score | no aplica | variable según score | pgscatalog.org |
| PRS-CS / LDpred2 | Métodos bayesianos de PRS | no aplica (inferencia estadística) | no aplica | variable (MIT/GPL en implementaciones) | GitHub / CRAN |

La comparación es estructural: el artefacto de `hssling` es una plantilla documental, mientras que los scores del PGS Catalog son PRS concretos con pesos publicados y PRS-CS/LDpred2 son métodos para construirlos. No se dispone de métricas comparativas porque la plantilla no incluye valores de AUC ni R².

## Limitaciones y advertencias

- El repositorio es una plantilla sin rellenar: todos los campos específicos de enfermedad, PGS ID, número de variantes, ancestría y métricas son marcadores de sustitución, por lo que no debe usarse como un PRS operativo.
- El rendimiento de los PRS varía sustancialmente entre grupos de ancestría; modelos entrenados predominantemente en cohortes europeas pueden rendir peor en otras poblaciones.
- Los scores brutos no son probabilidades ni indican riesgo absoluto de enfermedad.
- No capturan factores ambientales, de estilo de vida ni variantes raras.
- Completitud inferior al 80 % de variantes en el VCF de entrada marca el resultado como no fiable.
- Uso restringido a investigación: no es un dispositivo médico, no ha sido evaluado por ninguna autoridad regulatoria y no debe emplearse para diagnóstico clínico, comunicación de riesgo individual ni decisiones de salud directas al consumidor.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la propia model card restringe el uso a investigación, lo que genera una tensión entre licencia y gobernanza que conviene revisar antes de cualquier despliegue.
- No hay validación en cohortes independientes documentada en el repositorio.
- No es un modelo de lenguaje: no procesa texto, no soporta agentes ni tool calling, y no debe evaluarse con benchmarks de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/hssling/genomerisklab-prs
- README en Hugging Face: https://huggingface.co/hssling/genomerisklab-prs/blob/main/README.md
- Dataset de calibración: https://huggingface.co/datasets/hssling/genomerisklab-calibration-1kg
- PGS Catalog: https://www.pgscatalog.org/
- PGS Catalog (paper de referencia): https://doi.org/10.1038/s41588-021-00783-5
- ORCID del autor: https://orcid.org/0000-0002-4771-8285
- GitHub del autor: https://github.com/hssling
- 1000 Genomes Project Phase 3: https://www.internationalgenome.org/
