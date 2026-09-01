# quge007/investor-behavior-dataset

## Resumen

El dataset `investor-behavior-dataset` es un conjunto de datos estructurados que perfila el comportamiento de inversores globales antes y después de invertir en startups de semiconductores (chips). Ha sido producido por el autor `quge007` como parte de la investigación `investor_behavior_analysis` de Finalsystems, la segunda pieza de una herramienta de decisión para el ciclo de vida completo de startups. Los datos se reconstruyen a partir de fuentes públicas gratuitas y se organizan en tablas de entidades, eventos, cadenas temporales y empresas.

El dataset no es un modelo de IA, sino un recurso tabular pensado para análisis de capital riesgo, investigación académica y desarrollo de herramientas de decisión. Incluye información sobre 1.915 inversores, más de 43.000 empresas, y miles de eventos de financiación, exposición e interfaz, con cobertura temporal hasta 2026. Su relevancia radica en ofrecer una visión estructurada y trazable del ecosistema de inversión en semiconductores, con esquemas documentados y sin redistribución de filas de terceros.

La licencia es CC-BY-4.0, lo que permite uso comercial con atribución, y el idioma principal es el inglés. El tamaño del dataset se sitúa entre 10.000 y 100.000 filas, según la clasificación de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de dato | Dataset tabular (parquet) |
| Configuraciones | `entity`, `events`, `chains`, `companies` |
| Numero de filas estimado | ~1.915 inversores, ~1.4K eventos de financiacion, ~3.3K de exposicion, ~3.2K de interfaz, ~1.342 cadenas, ~43.474 empresas |
| Formato de archivos | Parquet (`.parquet`) |
| Licencia | CC-BY-4.0 |
| Idiomas | en |
| Tamaño (categoria) | 10K<n<100K |
| Fecha de creacion | 2026-09-01 |
| Ultima actualizacion | 2026-09-01 |
| Esquemas | `*.spec.md` y `*.schema.json` (bajo `schemas/`) |

## Arquitectura y entrenamiento

Al tratarse de un dataset, no existe una arquitectura de modelo ni un proceso de entrenamiento. En su lugar, la estructura de datos se compone de cuatro configuraciones principales:

- `entity`: tabla de inversores (1.915 filas) con identificadores estables (`wikidata:<QID>` o `interface_recovery:<hex>`), más una tabla de procedencia.
- `events`: tres tablas de eventos (financiación, exposición e interfaz) con limpieza humana y parche de identidad.
- `chains`: una tabla de cadenas temporales por resultado de financiación, con referencia a eventos de exposición e interfaz dentro de la ventana.
- `companies`: tabla de empresas (43.474 filas) con categorías, aristas y entidades asociadas.

La metodología de recopilación se basa en fuentes públicas gratuitas: SEC EDGAR, Wikidata (CC0), sitios web de empresas e inversores, noticias vía Tavily, AKShare, entre otras. Los campos analíticos son autoproducidos y no se redistribuyen filas crudas de terceros. El README indica que los datos son descriptivos, no causales ni predictivos, y que cada tabla incluye un esquema legible por humanos (`*.spec.md`) y, cuando existe contrato programático, un JSON Schema (`*.schema.json`).

## Capacidades

- Permite consultas sobre el comportamiento de inversores por tipo: IB (banca de inversión), PE (capital privado), AM (gestión de activos), HF (fondos de cobertura), VC (capital riesgo), Pension (fondos de pensiones), CVC (capital riesgo corporativo), SWF (fondos soberanos) y Angel (inversores ángel).
- Proporciona eventos de financiación, exposición e interfaz con granularidad de un evento por fila.
- Ofrece cadenas temporales que vinculan eventos a lo largo del tiempo para cada empresa.
- Incluye datos de más de 43.000 empresas del universo de semiconductores, con categorías y relaciones.
- Soporta análisis con herramientas estándar de datos (pandas, Dask, SQL) gracias al formato parquet y esquemas documentados.
- No incluye capacidades de generación de texto, razonamiento, visión ni tool calling, al ser un dataset puramente tabular.

## Casos de uso

- Analisis de tendencias de inversion en semiconductores: se puede agregar por tipo de inversor, año o región para identificar patrones de financiación en el sector de chips.
- Identificacion de inversores activos: filtrar por tipo (VC, CVC, SWF) y contar eventos de financiación para mapear el ecosistema.
- Estudio de cadenas de eventos: reconstruir la secuencia de financiación, exposición e interfaz de una startup para entender su trayectoria.
- Investigacion academica sobre capital riesgo: usar los datos agregados y derivados para estudiar correlaciones entre tipos de inversor y resultados de financiación (con la advertencia de que no son causales).
- Desarrollo de herramientas de decision para startups: integrar los datos en un pipeline de análisis para evaluar posibles inversores o comparar con competidores.
- Validacion de cobertura de datos: analizar qué tipos de inversor tienen mejor representación (por ejemplo, SWF ~50%, interface ~70%) para calibrar estudios posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, ya que no se trata de un modelo de IA sino de un dataset. No existen métricas de precisión, exactitud o rendimiento de inferencia.

## Requisitos de hardware

- El dataset es pequeño (menos de 100.000 filas en total) y se puede procesar en cualquier ordenador personal con Python y pandas.
- No requiere GPU ni hardware especializado.
- Para análisis más pesados (por ejemplo, unir todas las tablas y hacer agregaciones complejas), se puede usar Dask o Polars, pero no es necesario.
- Se puede cargar directamente desde HuggingFace con `datasets` o descargar los archivos parquet y leerlos con pandas.
- No hay latencia ni throughput asociados, al ser un recurso estático.

## Comparativa con modelos similares

No se dispone de información detallada sobre otros datasets comparables en la misma categoría. Existen otros conjuntos de datos sobre comportamiento de inversores, como el de WagnerT7 (basado en datos públicos brasileños de CVM) o el de faiza141 (sintético sobre fondos mutuos), pero no se han encontrado especificaciones técnicas suficientes para una comparación rigurosa. Por tanto, la comparativa se limita a indicar que hay alternativas en el ámbito del análisis de inversores, pero sin datos concretos.

## Limitaciones y advertencias

- El dataset no redistribuye filas crudas de terceros; solo incluye campos agregados, derivados o autoproducidos.
- La cobertura varía según el tipo de inversor: los fondos soberanos (SWF) tienen una cobertura estimada del 50%, y los datos de interfaz alrededor del 70% de fuentes de pago.
- El campo `per_vc_amount_usd` está poblado solo en aproximadamente el 16% de los registros.
- Los datos son descriptivos, no causales ni predictivos; no deben usarse para tomar decisiones de inversión sin validación adicional.
- El idioma principal es inglés; no hay soporte multilingüe.
- La licencia CC-BY-4.0 permite uso comercial, pero requiere atribución al autor.
- La fecha de creación y actualización es septiembre de 2026, lo que puede implicar que los datos no reflejen eventos posteriores.

## Enlaces

- HuggingFace: https://huggingface.co/quge007/investor-behavior-dataset
- Repositorio de skills complementario: https://github.com/quge009/startup-decision-skills
- Paper complementario (arXiv/SSRN): no disponible (mencionado en el README pero sin URL concreta)
