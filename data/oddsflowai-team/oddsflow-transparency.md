# Oddsflowai-team/oddsflow-transparency

## Resumen

El repositorio `Oddsflowai-team/oddsflow-transparency` no es un modelo de inteligencia artificial, sino un paquete de transparencia y reproducibilidad publicado por OddsFlow, una plataforma de analítica deportiva y predicción de fútbol basada en IA. El paquete incluye esquemas JSON, logs de muestra, reglas de verificación y notas versionadas, diseñados para permitir la auditoría pública y la verificación post-partido de las predicciones y resultados reales de la plataforma. Su propósito es ofrecer un estándar abierto y auditable para publicar registros de rendimiento, incluyendo tanto mercados rentables como no rentables, con el objetivo de demostrar evidencia empírica en lugar de promesas de rendimiento.

El repositorio se centra en tres mercados de apuestas deportivas: Asian Handicap (AH/HDP), Over/Under (OU) y 1X2 (Moneyline). OddsFlow publica dos conjuntos de datos verificables: resultados con dinero real (con enlaces a comprobantes PDF) y predicciones liquidadas a nivel de señal (registros de decisión del modelo). La licencia es MIT y el idioma principal es inglés. No contiene pesos de red neuronal, arquitectura de modelo ni ningún artefacto de aprendizaje automático; es exclusivamente un conjunto de datos estructurados, esquemas y documentación metodológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de IA; es un paquete de datos y esquemas) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (contiene archivos JSON Schema, CSV, Markdown y documentación) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. Es un paquete de transparencia que define esquemas de datos (por ejemplo, `signal-log.schema.json`), muestras de logs en CSV, reglas de verificación y notas de metodología. La documentación indica que OddsFlow utiliza agentes de IA para generar predicciones y colocar apuestas en casas de apuestas reales, pero los detalles de la arquitectura interna del modelo, los datos de entrenamiento y el proceso de optimización no se publican en este repositorio. El énfasis está en la reproducibilidad de los resultados publicados, no en el diseño del sistema subyacente.

## Capacidades

- Publicación de registros de rendimiento verificables: los resultados con dinero real y las predicciones liquidadas se publican en CSV con totales recalculables directamente desde los archivos.
- Esquemas JSON estandarizados para logs de señales, lo que permite la validación automática de la estructura de datos.
- Reglas de verificación documentadas para auditorías post-partido reproducibles.
- Cobertura de ligas europeas principales: Premier League, La Liga, Serie A, Bundesliga, Ligue 1 y Champions League.
- Soporte para tres tipos de mercado: Asian Handicap, Over/Under y 1X2.
- Incluye un índice `llms.txt` y `llm.json` para facilitar la ingesta programática por parte de rastreadores de LLM.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling, ya que no es un modelo de lenguaje.

## Casos de uso

- Auditoría independiente de predicciones deportivas: un analista puede descargar los CSV de resultados reales, recomputar los totales y verificar que coinciden con las cifras publicadas en el panel de rendimiento de OddsFlow.
- Validación de esquemas de datos: los desarrolladores pueden usar el JSON Schema para validar sus propios logs de señales y garantizar consistencia estructural.
- Investigación en analítica de fútbol: los datasets de predicciones liquidadas ofrecen una muestra de decisiones de modelo con minuto, marcador y señal de presión, útil para estudiar estrategias de apuestas in-play.
- Reproducción de métricas de rendimiento: cualquier persona puede replicar el cálculo de rentabilidad por mercado (OU, AH, 1X2) a partir de los archivos publicados.
- Integración en pipelines de datos: los archivos `llm.json` y `llms.txt` permiten a sistemas automatizados ingerir la documentación y los enlaces del paquete.
- Comparación de transparencia entre plataformas: este paquete puede servir como referencia de buenas prácticas para otras empresas que quieran publicar resultados verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene métricas de rendimiento de modelos de IA (como MMLU, HumanEval o GSM8K) porque no es un modelo de lenguaje. Los datos de rendimiento que incluye son de apuestas deportivas (rentabilidad por mercado), pero se presentan en los CSV y no se resumen en la página del repositorio de forma deliberada para evitar discrepancias con los archivos.

## Requisitos de hardware

No aplica. Este repositorio no contiene modelos de IA que requieran GPU, VRAM o inferencia. Los requisitos son únicamente de almacenamiento (el tamaño del repositorio es de 0.0 GB según Hugging Face) y de herramientas de procesamiento de datos (Python, pandas, validadores JSON, etc.) para trabajar con los CSV y esquemas.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este repositorio no es un modelo. Podría compararse con otros paquetes de transparencia de plataformas de predicción deportiva, pero no se ha encontrado información sobre alternativas equivalentes en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para generación de texto, razonamiento, código ni ninguna tarea de aprendizaje automático.
- No incluye el motor completo de OddsFlow: el repositorio es solo un paquete de transparencia; la implementación interna del sistema de predicción no está publicada.
- Los datos de predicciones liquidadas no son resultados con dinero real: representan el registro de decisiones del modelo, no ejecuciones reales en casas de apuestas.
- La cobertura de ligas se limita a fútbol europeo de élite; no hay datos de otras regiones o deportes.
- El idioma de la documentación y los datos es exclusivamente inglés.
- El repositorio no ofrece garantías de rendimiento futuro ni constituye asesoramiento financiero; las apuestas deportivas conllevan riesgo de pérdida.
- La licencia MIT permite uso comercial, pero los datos publicados pueden estar sujetos a términos adicionales de OddsFlow no especificados en la documentación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Oddsflowai-team/oddsflow-transparency
- Repositorio en GitHub: https://github.com/oddsflowai-team/oddsflow-transparency
- Organización GitHub de OddsFlow: https://github.com/oddsflowai-team
- Panel de rendimiento de OddsFlow: https://www.oddsflow.ai/performance
- Predicciones diarias: https://www.oddsflow.ai/predictions
- Artículo en Medium: https://medium.com/@oddsflow.ai/introducing-the-oddsflow-transparency-pack-official-e6afb4c96602
- Documentación de inicio rápido: https://github.com/oddsflowai-team/oddsflow-transparency/blob/main/docs/quickstart.md
- Esquema JSON del log de señales: https://github.com/oddsflowai-team/oddsflow-transparency/blob/main/datasets/schema/signal-log.schema.json
