# gaidar12345/crab-1-benchmark

## Resumen
Crab-1 benchmark es un conjunto de datos de evaluación (no un modelo de lenguaje) diseñado para medir las capacidades de agentes de inteligencia artificial en tareas de OSINT (Open Source Intelligence) sobre empresas francesas. Fue publicado por el usuario gaidar12345 en HuggingFace y forma parte del proyecto Crab-1, cuyo repositorio principal se encuentra en GitHub. El benchmark contiene 30 empresas francesas con ground truth verificado manualmente, incluyendo datos oficiales del registro mercantil francés (SIREN, SIRET, código NAF, etc.) y datos públicos de sitios web.

La relevancia de este recurso radica en que proporciona una evaluación objetiva y reproducible para agentes que utilizan herramientas web en vivo, permitiendo comparar modelos en tareas de búsqueda, extracción y verificación de información. Al estar licenciado bajo CC0, los datos son de dominio público, lo que facilita su uso en investigación y desarrollo. El benchmark es perecedero porque las herramientas acceden a la web en tiempo real, por lo que las puntuaciones pueden variar entre días.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (conjunto de datos de evaluación) |
| Parametros totales | 30 registros (empresas) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Francés (datos de empresas francesas) |
| Licencia | CC0-1.0 |
| Formato de pesos | JSON (archivo `eval_ground_truth_v3_enriched.json`) |

## Arquitectura y entrenamiento
No se trata de un modelo entrenado, sino de un conjunto de datos estructurado en formato JSON. Cada uno de los 30 registros contiene los siguientes campos: `name` (nombre de la empresa tal como se da al modelo), `expected` (ground truth con sitio web, ciudad, departamento con código, región, código postal, SIREN, rango de empleados y sector), `difficulty` (fácil, medio o difícil) y `registry` (datos oficiales del registro francés: SIREN/SIRET, código NAF y código de rango de empleados). El ground truth fue verificado manualmente contra fuentes oficiales y sitios web públicos.

El benchmark se utiliza mediante un harness de evaluación (`eval/run_eval.py` en el repositorio de GitHub) que ejecuta el modelo contra estas 30 empresas usando herramientas web en vivo. La puntuación se calcula con `harness/reward.py`, que evalúa el sitio web a nivel de dominio registrable, la ubicación a nivel de departamento y el sector cuando existe ground truth. No hay un proceso de entrenamiento asociado, ya que es un recurso de evaluación.

## Capacidades
- Evaluación de agentes OSINT: mide la capacidad de un modelo para buscar, extraer y verificar información pública sobre empresas francesas.
- Verificación de datos estructurados: comprueba si el agente obtiene correctamente sitio web, ubicación, SIREN, sector y rango de empleados.
- Clasificación por dificultad: los registros se etiquetan como fácil, medio o difícil, permitiendo análisis granular del rendimiento.
- Uso de herramientas web en vivo: el harness integra herramientas que acceden a internet, por lo que evalúa la capacidad de interacción con el entorno real.
- Soporte multilingüe implícito: aunque los datos son franceses, el agente puede operar en cualquier idioma para resolver las tareas.
- Reproducibilidad condicionada: al ser un benchmark vivo, solo es comparable entre modelos evaluados el mismo día.

## Casos de uso
- Investigación en OSINT automatizado: el benchmark sirve para validar agentes que deben recopilar información de empresas a partir de fuentes públicas, simulando tareas de inteligencia competitiva o debida diligencia.
- Desarrollo de agentes con herramientas web: los desarrolladores pueden usar este conjunto para probar y ajustar agentes que llaman a APIs de búsqueda, scraping o navegación, midiendo su precisión en un escenario realista.
- Comparación de modelos de razonamiento multi-paso: las tareas requieren encadenar búsquedas y verificación, por lo que es útil para evaluar capacidades de planificación y razonamiento en agentes.
- Evaluación de sistemas de extracción de datos estructurados: permite comprobar si un modelo convierte correctamente texto no estructurado (páginas web) en campos como SIREN, código postal o sector.
- Auditoría de sesgos geográficos: al centrarse en empresas francesas, puede revelar limitaciones de modelos entrenados mayoritariamente con datos en inglés u otras regiones.
- Investigación académica sobre agentes autónomos: el conjunto de datos con ground truth verificado es un recurso valioso para estudiar la fiabilidad de agentes en tareas de información del mundo real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye puntuaciones de modelos evaluados, y la model card solo describe la estructura y el método de uso. Cualquier comparación de rendimiento debe realizarse ejecutando el harness contra los modelos deseados, teniendo en cuenta que los resultados son sensibles al día de ejecución.

## Requisitos de hardware
No aplica, ya que no es un modelo de inferencia. El benchmark requiere únicamente un entorno capaz de ejecutar el harness de evaluación (Python) y acceso a internet para las herramientas web. No se especifican requisitos de GPU ni VRAM en la información proporcionada.

## Comparativa con modelos similares
No disponible. No se han identificado otros benchmarks de OSINT con características equivalentes (empresas francesas, ground truth verificado, licencia CC0) en la información proporcionada. El proyecto Crab-1 parece ser único en su enfoque, aunque existen otros benchmarks de agentes web como WebArena o Mind2Web, pero no se dispone de datos para comparar directamente.

## Limitaciones y advertencias
- El benchmark es perecedero: las herramientas acceden a la web en vivo, por lo que los resultados pueden variar con el tiempo y no son directamente comparables entre días distintos.
- Cobertura limitada: solo 30 empresas francesas, lo que puede no ser representativo de la diversidad empresarial del país ni de otros contextos geográficos.
- Sesgo geográfico: al centrarse en Francia, los modelos con mejor rendimiento en inglés u otras regiones pueden verse penalizados.
- Dependencia de la disponibilidad web: si los sitios web de las empresas cambian o desaparecen, el ground truth puede quedar desactualizado.
- Licencia CC0: aunque permite uso libre, los datos provienen de fuentes públicas; el usuario debe asegurarse de cumplir con las normativas de protección de datos al utilizar la información.
- No es un modelo: no puede utilizarse para generación de texto ni otras tareas de IA; es exclusivamente un recurso de evaluación.

## Enlaces
- HuggingFace: https://huggingface.co/gaidar12345/crab-1-benchmark
- Repositorio GitHub: https://github.com/gaidar0yegor/crab-1
