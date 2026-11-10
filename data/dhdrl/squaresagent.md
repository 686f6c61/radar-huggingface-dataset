# DHDRL/SquaresAgent

## Resumen

SquaresAgent (publicado como "Squares Progress Agent") es un proyecto de código, no un modelo de lenguaje con pesos entrenados. Lo desarrolla el usuario DHDRL y se distribuye en Hugging Face bajo licencia Apache-2.0 con las etiquetas `agent`, `evaluation` y `monitoring`. Su función es monitorizar afirmaciones públicas sobre el problema de empaquetar n cuadrados unitarios en el cuadrado contenedor de lado mínimo: extrae de páginas web el lado del contenedor que se afirma, valida la geometría cuando hay coordenadas, lo compara con una tabla local de cotas conocidas y emite informes de mejoras, candidatos, conflictos y errores.

El interés del repositorio no reside en el agente en sí, sino en la metodología de evaluación que lo acompaña. El autor documenta explícitamente qué partes del pipeline provocan o evitan falsos informes de "mejora", comparando el agente basado en reglas con variantes de expresiones regulares sobre escenarios sintéticos y sobre capturas privadas de páginas reales. Es, por tanto, una pieza útil para quienes diseñan sistemas de extracción y verificación de afirmaciones científicas, no un modelo generativo reutilizable.

No hay arquitectura de red neuronal publicada, ni tamaño de parámetros, ni ventana de contexto: el repositorio contiene únicamente código. Cualquier uso previsto debe partir de esa base: se trata de un agente de extracción, validación geométrica y comparación contra cotas, con un extractor opcional basado en LLM que el propio autor concluye que no aporta evidencia de mejora frente al extractor de reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de agente por reglas (search → fetch → extract → filtrado → validación → comparación → informe); extractor LLM opcional no empaquetado |
| Parametros totales | no disponible (el repositorio no contiene pesos de modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del LLM externo que se configure vía `SQ_LLM_MODEL`) |
| Tipos de cuantizacion | no disponible (no aplica: no hay pesos) |
| Idiomas soportados | no disponible (la extracción opera sobre texto de páginas; no se declara cobertura lingüística) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (solo código; no se distribuyen safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline determinista de procesamiento de texto y geometría: búsqueda, descarga de la página, extracción del valor candidato del lado del contenedor, descarte de afirmaciones rechazadas o caducadas, validación de coordenadas cuando se aportan, comparación con una tabla de cotas (`bounds.json`) y generación de informe. La regla central es que una "mejora" exige coordenadas que validen; un número menor sin coordenadas se clasifica solo como candidato. Los empaquetados racionales exactos se tratan como prueba, mientras que la validación en coma flotante no se acepta como prueba y las afirmaciones cercanas a la cota quedan como candidatas.

No hay entrenamiento en el sentido habitual: no se describe número de tokens, composición de dataset ni fases de RLHF o DPO. El autor sí menciona un extractor LLM opcional que solo propone pares (n, cita textual); el valor del lado se analiza a partir de una cita literal y pasa por las mismas salvaguardas que el extractor de reglas. En la prueba realizada sobre 7 escenarios, el extractor LLM acertó 6 y el de reglas 7, por lo que no hay evidencia de que el LLM aporte ventaja. La tabla de cotas cubre n = 1..29, 68, 102 y 299, tomada de un catálogo publicado.

## Capacidades

- Extracción de afirmaciones sobre el lado del contenedor en páginas web, con descarte de líneas matizadas o retractadas (a costa de cierta pérdida de recall).
- Validación geométrica de coordenadas cuando la afirmación las incluye.
- Distinción entre mejora validada, candidato, conflicto y error en el informe final.
- Comparación automática contra una tabla local de cotas conocidas.
- Clasificación de empaquetados racionales exactos como prueba y de validaciones en coma flotante como no probatorias.
- Integración opcional de un extractor LLM externo (configurable por variables de entorno) que solo propone (n, cita) y queda sujeto a las mismas salvaguardas.
- Ejecución offline de la batería de pruebas sintéticas (`make test`), sin red ni clave de API.
- No dispone de tool calling genérico, razonamiento multi-paso abierto, visión, audio ni modo de pensamiento: sus capacidades están acotadas al dominio del empaquetado de cuadrados.

## Casos de uso

- Monitorización de literatura y foros matemáticos: el agente recorre páginas públicas, extrae afirmaciones de cotas y genera un informe de mejoras, candidatos y conflictos, lo que permite detectar de forma automatizada cuándo alguien afirma haber batido un récord de empaquetado.
- Verificación de coordenadas en preprints: cuando una página incluye coordenadas, el pipeline valida la geometría antes de aceptar la mejora, lo que filtra afirmaciones numéricamente plausibles pero geométricamente imposibles.
- Auditoría de pipelines de extracción: al comparar el agente con variantes de regex sobre 23 escenarios sintéticos (22/23 frente a 12/23 y 4/23), sirve como banco de pruebas para medir cuántos falsos positivos introduce cada diseño de extracción.
- Evaluación de extractores LLM en dominios técnicos: el repositorio documenta un experimento controlado con extractor LLM frente a reglas (6/7 frente a 7/7), útil como plantilla metodológica para decidir si merece la pena incorporar un modelo generativo a un pipeline de extracción.
- Construcción de sistemas de alerta temprana sobre resultados científicos: el flujo search → fetch → extract → validate → compare → report puede adaptarse a otros dominios con tabla de cotas propia y reglas de validación equivalentes.
- Docencia e investigación en evaluación de agentes: los escenarios sintéticos y las tablas de resultados (sintéticos y reales) permiten estudiar el efecto de las salvaguardas y del reintento (20/23 sin reintento frente a 22/23 con reintento) en la fiabilidad del sistema.

## Benchmarks y rendimiento

Resultados sintéticos reproducibles con `make test` (23 escenarios):

| Sistema | Aciertos (23 escenarios) | Falsas mejoras |
|---|---|---|
| Agente (extractor de reglas) | 22/23 | 0 |
| Regex + mismas salvaguardas | 12/23 | 0 |
| Regex simple (baseline) | 4/23 | 8 |
| Agente sin reintento | 20/23 | 0 |

El único fallo del agente corresponde a un escenario con tabla en LaTeX, descrito por el autor como caso deliberado de cambio de distribución.

Resultados locales sobre capturas privadas (no reproducibles desde el repositorio):

| Conjunto | Agente | Regex + salvaguardas | Regex simple |
|---|---|---|---|
| Lote real 1 (15 páginas) | 15/15 | 14/15 | 9/15 (6 falsas mejoras) |
| Lote real 2 (12 páginas, un tipo de fuente) | 12/12 | 12/12 | 10/12 (2 falsas mejoras) |

En el lote 2 el extractor de reglas y la variante regex + salvaguardas no se distinguen. El extractor LLM opcional se probó en 7 escenarios y acertó 6, sin recurrir al fallback de reglas; el extractor de reglas acertó los 7. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplica a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica al agente, que es código Python sin pesos. Si se activa el extractor LLM opcional, el requisito depende por completo del modelo configurado en `SQ_LLM_MODEL`.
- GPU recomendadas: no disponibles para el agente; para el extractor LLM externo, las habituales del modelo elegido (no especificadas en la documentación).
- Cabe en GPU de consumo: el agente sí, al no requerir GPU; el extractor LLM dependerá del modelo externo.
- Opciones de despliegue: ejecución local mediante `make test` (sin red ni clave de API); para páginas reales y llamadas LLM se requieren `SQ_LLM_API_KEY`, `SQ_LLM_BASE_URL` y `SQ_LLM_MODEL` en el entorno. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del número de páginas descargadas y, en su caso, del proveedor LLM externo.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada; el repositorio no es un modelo de lenguaje y no se han identificado alternativas equivalentes de monitorización de cotas de empaquetado. La comparación disponible es interna, entre variantes del propio pipeline:

| Variante | Enfoque | Aciertos sintéticos | Falsas mejoras | Licencia |
|---|---|---|---|---|
| Agente (reglas) | Pipeline completo con salvaguardas y reintento | 22/23 | 0 | Apache-2.0 |
| Regex + salvaguardas | Extracción regex con las mismas validaciones | 12/23 | 0 | Apache-2.0 |
| Regex simple | Extracción regex sin salvaguardas | 4/23 | 8 | Apache-2.0 |
| Agente sin reintento | Pipeline sin reintento | 20/23 | 0 | Apache-2.0 |
| Extractor LLM opcional | LLM que propone (n, cita) | 6/7 (subconjunto) | no disponible | Apache-2.0 (código) |

## Limitaciones y advertencias

- Los escenarios sintéticos fueron escritos por el mismo autor del agente, por lo que no constituyen una prueba independiente.
- Los resultados sobre páginas reales provienen de capturas privadas: las páginas originales, las URL y las etiquetas con citas se retienen, de modo que esas tablas no son reproducibles desde el repositorio.
- Los conjuntos de validación son pequeños y los intervalos de confianza amplios.
- El agente no ha descubierto ni mejorado ningún récord de empaquetado; su función es de monitorización y verificación, no de generación de resultados matemáticos.
- Las listas como `5,6` son ambiguas frente a decimales con coma, lo que puede degradar la extracción.
- No existe adaptador para CSV de Kaggle; las convenciones de columnas y ángulos no están confirmadas.
- `bounds.json` solo cubre n = 1..29, 68, 102 y 299; para n = 102 y 299 las afirmaciones de la comunidad podrían ser inferiores a las del catálogo.
- El descarte de líneas matizadas o retractadas reduce el recall.
- La validación en coma flotante no se considera prueba; las afirmaciones cercanas a la cota quedan como candidatas y requieren certificación por aritmética de intervalos (trabajo futuro declarado).
- La licencia Apache-2.0 permite uso comercial del código, pero no se declara cobertura lingüística ni sesgos, al no haber modelo entrenado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DHDRL/SquaresAgent
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este proyecto.
