# Saeedfa/world8-forecast-hall

## Resumen

World 8 Forecast Hall es un componente de arquitectura de software para sistemas de pronóstico y decisión, desarrollado por Saeedfa como parte del proyecto World 8. No se trata de un modelo de lenguaje ni de un modelo de IA entrenado, sino de una capa analítica diseñada para producir, evaluar, calibrar y combinar pronósticos sin ejecutar directamente operaciones de trading. El proyecto se encuentra en fase de pre-lanzamiento de desarrollo y no está listo para producción.

La model card describe principios de diseño como la separación estricta entre pronóstico, decisión y orden, el uso de estrategias versionadas, analistas como roles, y un sistema de ensamblaje ponderado con control de calibración y correlación. El repositorio canónico está en GitHub y existe un snapshot inmutable en Zenodo con DOI. No se proporcionan especificaciones técnicas del modelo, datos de entrenamiento, ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (arquitectura de software, no modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card describe una arquitectura conceptual de sistema, no un modelo entrenado. Los principios clave incluyen: separación de objetos gobernados (Forecast, Decision, Order), estrategias como habilidades versionadas, analistas como roles o entidades, y un "cerebro" reemplazable como proveedor de modelo. El sistema utiliza ensamblaje ponderado con control de calibración y correlación, donde el desacuerdo entre analistas se trata como señal. Los analistas nuevos comienzan en modo "Shadow" con peso cero. No se mencionan datos de entrenamiento, tokens, ni procesos de RLHF o DPO.

## Capacidades

- Producción de pronósticos analíticos sin ejecución de trading directa.
- Evaluación, calibración y combinación de pronósticos mediante ensamblaje ponderado.
- Detección de regímenes independiente.
- Gestión de analistas en modo Shadow (peso cero) para validación previa.
- Separación de políticas de riesgo y cartera fuera del Forecast Hall, con capacidad de veto sobre la ejecución.
- No se documentan capacidades de generación de texto, código, visión, tool calling ni agentes.

## Casos de uso

- Sistema de pronóstico financiero interno: el componente puede integrarse en un pipeline donde los analistas generan pronósticos, se calibran y se combinan antes de que una política de riesgo decida si se ejecuta una orden.
- Investigación de arquitecturas de decisión: sirve como referencia para diseñar sistemas que separen claramente la generación de pronósticos de la toma de decisiones y la ejecución.
- Desarrollo de estrategias versionadas: permite probar estrategias como "Skills" versionadas, con analistas en modo Shadow para evaluar su rendimiento sin riesgo.
- Validación de ensamblajes ponderados: útil para experimentar con métodos de combinación de pronósticos que controlen correlación y calibración.
- Documentación de principios de gobernanza de IA: el diseño puede inspirar sistemas donde las decisiones automatizadas estén sujetas a supervisión y veto externo.
- Formación en diseño de sistemas multiagente: el repositorio y la documentación pueden usarse como material didáctico para arquitecturas de pronóstico y decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, latencia, throughput ni comparaciones con otros sistemas.

## Requisitos de hardware

No disponible. Al ser una arquitectura de software sin especificaciones de modelo, no se indican requisitos de VRAM, GPU, ni opciones de despliegue. El repositorio de GitHub podría contener detalles adicionales, pero no se han proporcionado en la información disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos o sistemas comparables en la información proporcionada, ya que World 8 Forecast Hall no es un modelo de IA estándar sino una arquitectura de software.

## Limitaciones y advertencias

- Estado de desarrollo: es un pre-lanzamiento de desarrollo, no un sistema de producción.
- No garantiza retornos ni resultados de trading: la model card lo declara explícitamente.
- No hay evidencia de infraestructura de ejecución de mercado completada.
- No se especifican sesgos, riesgos de alucinación ni limitaciones de contexto o idioma, al no ser un modelo de lenguaje.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido.
- La información técnica es mínima; cualquier uso en producción requeriría una evaluación exhaustiva del repositorio y sus componentes.

## Enlaces

- HuggingFace: https://huggingface.co/Saeedfa/world8-forecast-hall
- Repositorio canónico GitHub: https://github.com/saeedfaai/world-8
- Pre-lanzamiento de desarrollo V0.1.0: https://github.com/saeedfaai/world-8/releases/tag/V0.1.0
- Commit congelado: `b14f2feea0fa233851a774d6ebd295b63cde75c0`
- Registro Zenodo: https://zenodo.org/records/22127650
- DOI: https://doi.org/10.5281/zenodo.22127650
- DOI histórico Z0-A: https://doi.org/10.5281/zenodo.22085394
