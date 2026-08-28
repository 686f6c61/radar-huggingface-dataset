# lkjhgfdsjjj/ai-visibility-index

## Resumen

AI Visibility Index es un dataset y ranking en vivo que evalúa la visibilidad de 143 sitios web importantes frente a asistentes de IA como ChatGPT, Claude, Perplexity y agentes autónomos. Lo publica el usuario lkjhgfdsjjj en nombre de Autonomy Labs, y se distribuye bajo licencia CC-BY-4.0. No se trata de un modelo de lenguaje ni de un sistema de aprendizaje automático, sino de un índice estructurado que puntúa cada dominio según su exposición en ocho superficies legibles por máquina.

El dataset aborda un problema emergente: la descubribilidad de contenido web por parte de agentes de IA y motores de respuesta generativa. Cada sitio recibe una nota y una puntuación de 0 a 100, junto con el resultado individual (apto/no apto) en cada una de las superficies evaluadas. La relevancia actual radica en que la optimización para IA (llms.txt, agents.txt, x402) se está convirtiendo en un factor de posicionamiento crítico para empresas que dependen del tráfico referido desde asistentes.

El repositorio contiene un único archivo de datos (`visibility_index.json`) con la lista completa ordenada. Incluye además enlaces a herramientas complementarias: un comprobador gratuito, un generador de llms.txt y un informe de auditoría de pago. El dataset se actualiza de forma autónoma, según indica la descripción del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (dataset, no modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (los datos son dominios web internacionales) |
| Licencia | cc-by-4.0 |
| Formato de pesos | JSON (`visibility_index.json`) |

## Arquitectura y entrenamiento

No aplica en el sentido tradicional: no hay arquitectura de red neuronal, ni entrenamiento, ni datos de preentrenamiento. El dataset se genera mediante un proceso de auditoría automatizado que evalúa cada dominio contra ocho superficies técnicas legibles por máquina: `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `agents.txt`, `x402`, `agents.json` y `security.txt`. El autor indica que el índice se mantiene de forma autónoma, lo que sugiere un pipeline de rastreo y verificación periódica, aunque no se documentan los detalles técnicos del proceso de recolección, la frecuencia de actualización ni la metodología de puntuación exacta.

No se especifican criterios de selección de los 143 dominios incluidos, ni el peso relativo de cada superficie en la puntuación final. La información disponible no permite reproducir la metodología de cálculo.

## Capacidades

- Clasificación de dominios web según su visibilidad para asistentes de IA, con una puntuación agregada de 0 a 100 y una nota cualitativa.
- Evaluación binaria (apto/no apto) por cada una de las ocho superficies técnicas: `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `agents.txt`, `x402`, `agents.json`, `security.txt`.
- Cobertura de 143 sitios web importantes, presumiblemente de alto tráfico.
- Formato JSON estructurado, apto para integración programática en dashboards o pipelines de análisis.
- Herramienta complementaria gratuita para auditar un dominio propio.
- Generador de llms.txt como utilidad asociada.
- Informe de auditoría detallado de pago (19 EUR) con análisis ampliado.

## Casos de uso

- Auditoría de descubribilidad para equipos de SEO técnico: un especialista puede consultar el `visibility_index.json` para comparar su dominio con los 143 rankeados y detectar qué superficies (llms.txt, agents.txt, x402) le faltan por implementar.
- Benchmarking competitivo en sectores con presencia digital intensiva: una empresa de comercio electrónico puede ver qué competidores ya publican `llms.txt` o `agents.json` y priorizar su adopción.
- Investigación académica sobre adopción de estándares emergentes: el dataset permite estudiar la correlación entre la presencia de `x402` o `agents.txt` y la visibilidad en asistentes de IA, aunque la muestra de 143 dominios es limitada.
- Planificación de estrategia de contenidos para agentes autónomos: los equipos de producto pueden usar las puntuaciones por superficie para decidir qué ficheros implementar primero en su infraestructura web.
- Integración en pipelines de monitorización continua: al ser JSON, se puede consumir programáticamente para alimentar un dashboard interno de visibilidad de marca en IA.
- Validación de herramientas propias de generación de llms.txt: los desarrolladores de utilidades de optimización para IA pueden usar el dataset como referencia para comprobar si sus generadores producen ficheros que cumplen los criterios evaluados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un dataset de clasificación y no de un modelo predictivo, no aplican métricas como MMLU, HumanEval o GSM8K. No se documenta tampoco la precisión del proceso de auditoría automatizado ni se comparan sus resultados con verificaciones manuales.

## Requisitos de hardware

- No requiere hardware de inferencia: el dataset es un archivo JSON de tamaño reducido (143 entradas con campos de texto y booleanos).
- Puede procesarse en cualquier máquina con Python, jq o cualquier herramienta de manipulación de JSON.
- Sin requisitos de GPU ni VRAM.
- Para la herramienta de comprobación gratuita alojada en HF Spaces, no se documentan requisitos de infraestructura.
- El consumo de recursos es despreciable: lectura de un fichero de pocos kilobytes y renderizado en tabla o dashboard.

## Comparativa con modelos similares

No existe un modelo comparable en el sentido de arquitectura de IA. En el espacio de índices de visibilidad en IA, se identifican alternativas comerciales y de investigación:

| Herramienta | Cobertura | Superficies evaluadas | Metodologia | Licencia |
|---|---|---|---|---|
| AI Visibility Index (este dataset) | 143 dominios | 8 superficies tecnicas | Puntuacion 0-100 por superficie binaria | CC-BY-4.0 |
| 5W AI Visibility Index | 500+ marcas | Citas en ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews | Conteo de menciones en respuestas de IA | Propietaria |
| Semrush AI Visibility Index (2026) | Analisis de 126 millones de prompts | Menciones de marca en respuestas de IA | Analisis de prompts agregados | Propietaria |
| VisibilityIndex.ai | Negocios locales | Menciones y recomendaciones en IA | Auditorias basadas en evidencia | Propietaria |

La diferencia fundamental es que este dataset mide la presencia de ficheros técnicos de infraestructura, mientras que las alternativas miden la presencia real de la marca en las respuestas generadas por asistentes. Son métricas complementarias pero no equivalentes.

## Limitaciones y advertencias

- No es un modelo de IA: no genera predicciones ni texto; es un archivo de datos estático con una clasificación puntual.
- Muestra limitada: 143 dominios no representan el ecosistema web global ni siquiera el de un sector concreto.
- Metodología no documentada: no se explica cómo se calcula la puntuación de 0 a 100, el peso de cada superficie ni los criterios de selección de dominios.
- Sin historial de versiones: no se indica la frecuencia de actualización ni si los datos son comparables entre versiones.
- Riesgo de obsolescencia: la visibilidad en IA cambia rápidamente; un snapshot con fecha de creación de agosto de 2026 puede quedar desactualizado en semanas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero hay que verificar que los datos subyacentes (dominios de terceros) no tengan restricciones adicionales.
- Herramientas de pago asociadas: el dataset gratuito es limitado; el informe completo cuesta 19 EUR, lo que puede sesgar la exhaustividad de los datos públicos.
- Sin validación independiente: no hay evidencia de que las puntuaciones hayan sido verificadas por terceros.

## Enlaces

- Dataset en HuggingFace: https://huggingface.co/lkjhgfdsjjj/ai-visibility-index
- Comprobador gratuito de visibilidad: https://lkjhgfdsjjj-ai-visibility-checker.static.hf.space/
- Endpoints x402 y storefront: https://www.autonomylabsweb.tech/x402-endpoints.html
- Informe de auditoría completo (19 EUR): https://www.autonomylabsweb.tech/ai-visibility-report.html
- Generador de llms.txt: https://www.autonomylabsweb.tech/llms-txt-generator.html
- Referencia sobre índices de visibilidad en IA: https://visibilityindex.ai/what-is-ai-visibility-index
- Análisis del índice de visibilidad de Semrush 2026: https://www.elaventra.com/blog/semrush-ai-visibility-index-2026
- Informes AIVx de Avenuez: https://avenuez.com/aivx-ai-visibility-reports-2026/
- Índice de visibilidad de 5W PR: https://www.5wpr.com/ai-visibility-index/
