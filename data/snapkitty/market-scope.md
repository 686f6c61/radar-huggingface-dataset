# Snapkitty/market-scope

## Resumen

MARKETSCOPE es una plataforma de inteligencia de mercado y análisis de investigación (MIRP) desarrollada por el usuario Snapkitty bajo el sello SNAPKITTYWEST. No se trata de un modelo de inteligencia artificial generativa, sino de un sistema de software soberano compuesto por cinco agentes que ingieren datos de índices globales (S&P 500, Nikkei, DAX, KOSPI, etc.), los procesan mediante una capa de lógica determinista en Prolog, aplican modelos cuantitativos (conformal prediction, bosques cuantiles) y emiten análisis de escenarios probabilísticos, nunca predicciones puntuales. La plataforma incorpora una cadena de auditoría inmutable (Bifrost WORM Chain) que registra cada inferencia y cada peso de modelo, y exige revisión humana obligatoria para cualquier acción. Es relevante porque plantea un enfoque de análisis de mercado con trazabilidad total y restricciones explícitas contra el asesoramiento financiero automatizado.

Esta ficha describe la plataforma tal y como aparece en la model card de HuggingFace, aclarando que no es un modelo de IA convencional y que muchos de los campos técnicos habituales (parámetros, cuantización, pesos) no son aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plataforma de software multiagente (Rust, Prolog, Python, Next.js) - no es un modelo de IA |
| Parametros totales | No disponible (no aplica) |
| Parametros activos | No disponible (no aplica) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (la interfaz y la documentación están en inglés) |
| Licencia | No disponible |
| Formato de pesos | No aplicable (no hay pesos de modelo) |

## Arquitectura y entrenamiento

MARKETSCOPE no ha sido entrenado como un modelo de aprendizaje automático. Su arquitectura se compone de una capa de ingesta (Rust/Axum) que obtiene datos OHLCV y datos alternativos (basis de futuros, tasas de financiación), una capa de procesamiento con un almacén de características DuckDB y un motor de lógica Prolog (SWI-Prolog) que aplica reglas deterministas de detección de régimen de mercado y alertas de ruptura de correlación. Sobre esa base, un motor cuantitativo en Python/Rust ejecuta métodos de predicción conforme y bosques cuantiles para generar bandas de escenario. Un agente auditor verifica el linaje de cada dato y registra todo en una cadena WORM (append-only) con sellado SHA-256 y verificación de firmas Ed25519. No existe entrenamiento con datos, sino reglas programadas y modelos estadísticos ejecutados en tiempo real.

## Capacidades

- Ingesta de datos de múltiples índices bursátiles globales y criptoperpetuos mediante conectores soberanos.
- Detección determinista de regímenes de mercado (alcista, bajista, transición) basada en medias móviles, VIX y amplitud.
- Alertas de ruptura de correlación entre activos cuando la correlación móvil cae por debajo de un umbral respecto a su media histórica.
- Generación de análisis de escenarios probabilísticos (bandas de escenario), no predicciones puntuales.
- Auditoría completa del linaje de datos: desde la fuente original hasta la inferencia final, con registro inmutable en cadena WORM.
- Cumplimiento de restricciones soberanas: bloqueo explícito de asesoramiento financiero y exigencia de revisión humana antes de cualquier acción.

## Casos de uso

- Investigación de mercado para analistas cuantitativos: permite obtener bandas de escenario basadas en reglas deterministas y modelos estadísticos, con trazabilidad completa de los datos utilizados.
- Monitorización de regímenes de mercado: el sistema detecta automáticamente si el mercado se encuentra en fase alcista, bajista o de transición, útil para informes periódicos.
- Detección de anomalías de correlación: alerta cuando la correlación entre dos activos se desvía significativamente de su promedio histórico, útil para gestión de riesgo de carteras.
- Auditoría de decisiones de inversión: el registro WORM permite verificar retrospectivamente qué datos y qué reglas condujeron a cada escenario, facilitando el cumplimiento normativo.
- Desarrollo de sistemas de investigación soberana: la arquitectura modular (ingestor, lógica, cuant, auditor, UI) puede adaptarse a otros dominios donde se requiera trazabilidad y revisión humana.
- Formación y demostración de arquitecturas de análisis de mercado: sirve como referencia para implementar plataformas similares con lógica determinista y auditoría blockchain.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La plataforma no es un modelo de IA y no tiene métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- Al ser una aplicación de software que se ejecuta mediante Docker Compose, no requiere GPU ni hardware especializado.
- Los componentes (ingestor Rust, motor Prolog, motor cuantitativo Python, auditor Rust, interfaz Next.js) pueden ejecutarse en un servidor modesto con CPU y RAM suficientes para el volumen de datos procesado.
- El despliegue se realiza mediante `docker compose up -d`, lo que sugiere que puede correr en cualquier máquina con Docker instalado.
- No hay información sobre latencia o throughput estimados.

## Comparativa con modelos similares

No disponible. MARKETSCOPE no es comparable con modelos de inteligencia artificial generativa ni con otros sistemas de análisis de mercado que utilicen aprendizaje automático tradicional, ya que su núcleo es determinista (Prolog) y su objetivo es la trazabilidad y la revisión humana, no la predicción autónoma.

## Limitaciones y advertencias

- No es un modelo de IA: no tiene capacidades de generación de lenguaje, razonamiento conversacional ni procesamiento de texto.
- La plataforma declara explícitamente que no proporciona asesoramiento financiero y que todos los resultados son bandas de escenario que requieren revisión humana.
- La lógica Prolog es determinista y no aprende de nuevos datos; los modelos cuantitativos (predicción conforme, bosques cuantiles) se ejecutan sobre los datos ingeridos, pero no hay entrenamiento continuo ni adaptación automática.
- No se indica la licencia de uso; cualquier uso comercial o de producción debe verificar los términos de la plataforma y de sus dependencias.
- La documentación está en inglés y la información de idiomas soportados no está disponible.
- La cadena WORM y las firmas Ed25519 proporcionan integridad, pero no garantizan la exactitud de los datos de entrada ni de los modelos subyacentes.
- La fecha de creación en HuggingFace es posterior a la fecha de sellado indicada en la model card (inconsistencia temporal), lo que puede indicar que la plataforma aún está en fase v0.1.

## Enlaces

- [HuggingFace: Snapkitty/market-scope](https://huggingface.co/Snapkitty/market-scope)
- [Repositorio GitHub mencionado en la model card](https://github.com/SNAPKITTYWEST/market-scope.git)
