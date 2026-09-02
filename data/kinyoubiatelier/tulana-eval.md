# KinyoubiAtelier/tulana-eval

## Resumen

Tulana eval harness es un conjunto de herramientas de evaluación (evaluation harness) diseñado para medir la capacidad de seguimiento de instrucciones y fidelidad de generación en modelos de lenguaje compactos y abiertos, específicamente en condiciones de odia en escritura nativa, romanizada y con code-mixing odia-inglés. Lo desarrolla Kinyoubi Atelier & Co. y se publica bajo licencia Apache-2.0. No es un modelo de lenguaje en sí, sino un framework de evaluación que incluye un runner, motores de ejecución (fake y MLX), un puerto del checker IndicIFEval con verificación de divergencia cero, pipelines de construcción de condiciones (romanización, variabilidad controlada, code-mixing al 25/50/75%) y agregación de resultados con intervalos de confianza del 95%.

El proyecto se encuentra en estado experimental (versión v0.1.0-pilot-experimental) y forma parte de la familia de artefactos Tulana, que incluye conjuntos de datos de benchmark y un espacio de visualización. Su relevancia radica en abordar la evaluación de modelos en idiomas de bajos recursos como el odia, un área poco cubierta por los benchmarks estándar. El repositorio de HuggingFace actúa como punto de referencia estable para el harness, mientras que el código fuente y las contribuciones se gestionan en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (es un harness de evaluación, no un modelo de lenguaje) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Odia (escritura nativa, romanizada y code-mixed con inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (el artefacto es código Python, no pesos de modelo) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un harness de evaluación. Su arquitectura interna incluye un runner de línea de comandos (CLI), motores de inferencia intercambiables (un motor "fake" para pruebas y un motor MLX para ejecución en Apple Silicon), un checker de fidelidad basado en IndicIFEval adaptado para byte-faithfulness, y una capa de checkers específicos para odia bajo el espacio de nombres `kinyoubi.*`. Los pipelines de construcción de condiciones permiten generar variantes romanizadas, aplicar variabilidad controlada y mezclar código odia-inglés en proporciones del 25%, 50% y 75%. La agregación de resultados siempre reporta intervalos de confianza del 95%, evitando puntuaciones puntuales sin medida de incertidumbre.

No se dispone de información sobre datos de entrenamiento, ya que el harness no entrena modelos; su función es evaluar modelos existentes. El repositorio no incluye datos de benchmark por decisión de separación de licencias; estos residen en repositorios hermanos de datasets.

## Capacidades

- Ejecución de evaluaciones de seguimiento de instrucciones y fidelidad de generación en modelos de lenguaje compactos.
- Soporte para condiciones lingüísticas específicas: odia en escritura nativa (Odia script), romanización y code-mixing odia-inglés con proporciones configurables (25/50/75%).
- Motor de inferencia MLX para ejecución en hardware Apple Silicon, además de un motor "fake" para pruebas sin dependencias de modelo.
- Checker de fidelidad basado en IndicIFEval, adaptado para comparación byte a byte con reporte de divergencia cero.
- Agregación de resultados con intervalos de confianza del 95%, proporcionando rigor estadístico en las métricas.
- Pipelines de construcción de condiciones reproducibles (romanización, variabilidad controlada, code-mixing).
- Interfaz de línea de comandos con configuración mediante archivos YAML (ejemplo incluido).
- Integración con el ecosistema de HuggingFace como punto de referencia estable para la familia de artefactos Tulana.

## Casos de uso

- Evaluación de modelos de lenguaje en odia para investigación académica: investigadores de PLN en idiomas de bajos recursos pueden utilizar el harness para medir objetivamente la capacidad de sus modelos de seguir instrucciones en odia, tanto en escritura nativa como romanizada, con métricas que incluyen intervalos de confianza.
- Desarrollo de sistemas de atención al cliente en odia: empresas que despliegan asistentes conversacionales en odia pueden usar el harness para validar la fidelidad de las respuestas generadas, especialmente en contextos de code-mixing con inglés, antes de ponerlos en producción.
- Benchmarking de modelos multilingües: equipos que desarrollan modelos multilingües pueden emplear el harness para comparar el rendimiento de sus modelos en odia frente a otros, utilizando las condiciones estandarizadas de romanización y code-mixing.
- Pruebas de robustez ante variaciones ortográficas: el pipeline de romanización permite evaluar cómo los modelos manejan la transliteración, un problema común en idiomas con escrituras no latinas.
- Validación de generación fiel en aplicaciones de traducción automática: el checker de fidelidad basado en IndicIFEval puede usarse para verificar que las traducciones al odia mantengan el significado original sin desviaciones.
- Integración en pipelines de CI/CD para modelos de lenguaje: el harness, al ser ejecutable desde línea de comandos con configuración YAML, puede incorporarse como paso de validación automática en repositorios de modelos, asegurando que cada versión cumpla con los umbrales de fidelidad y seguimiento de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del harness no incluye datos de evaluación; estos se encuentran en repositorios de datasets hermanos (por ejemplo, `KinyoubiAtelier/tulana-items-classf`), que aún no han sido publicados en su totalidad. No se dispone de comparaciones con otros modelos o harnesses.

## Requisitos de hardware

- El harness es ligero y no requiere GPU para su ejecución básica; el motor "fake" permite pruebas sin ningún modelo subyacente.
- Para evaluaciones reales con modelos de lenguaje, se necesita el hardware requerido por el modelo evaluado (por ejemplo, una GPU con VRAM suficiente según el tamaño del modelo).
- El motor MLX requiere hardware Apple Silicon (M1 o posterior) para ejecutar inferencias de modelos compatibles con MLX.
- El runner CLI está verificado en Python 3.14, por lo que se recomienda un entorno con Python reciente.
- Opciones de despliegue: ejecución local mediante CLI, integración en scripts de CI/CD, o uso en entornos de investigación con Jupyter.
- No se dispone de datos de latencia o throughput, ya que dependen del modelo evaluado y del hardware utilizado.

## Comparativa con modelos similares

No disponible. No se han identificado harnesses de evaluación comparables específicamente orientados a odia y code-mixing con las mismas características (byte-faithfulness, intervalos de confianza, condiciones de romanización). El proyecto es experimental y no se han publicado comparaciones con otras herramientas de evaluación como lm-evaluation-harness o IndicEval.

## Limitaciones y advertencias

- Estado experimental: el harness se encuentra en versión piloto (v0.1.0-pilot-experimental) y puede contener errores o cambios de API sin aviso.
- No incluye datos de benchmark en el repositorio; los datos residen en repositorios separados, algunos aún no publicados, lo que limita la reproducibilidad inmediata.
- El soporte de idiomas se limita al odia y sus variantes (nativa, romanizada, code-mixed); no es un harness multilingüe general.
- El motor MLX solo funciona en hardware Apple Silicon; en otras plataformas se requiere un motor alternativo (no documentado explícitamente).
- La licencia Apache-2.0 permite uso comercial, pero los datos de benchmark en repositorios hermanos pueden tener licencias diferentes; se recomienda verificar cada dataset individualmente.
- No se proporcionan métricas de rendimiento del propio harness (tiempos de ejecución, overhead), lo que dificulta estimar costes computacionales.
- La documentación es escasa; solo se incluye un ejemplo de configuración "hello-fake" y no hay guías detalladas para casos de uso avanzados.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/KinyoubiAtelier/tulana-eval
- Repositorio GitHub (fuente canónica): https://github.com/kinyoubi-atelier/tulana-eval
- Release v0.1.0-pilot-experimental: https://github.com/kinyoubi-atelier/tulana-eval/releases/tag/v0.1.0-pilot-experimental
- Dataset hermano (Class F, Pool B): https://huggingface.co/datasets/KinyoubiAtelier/tulana-items-classf
- Colección Tulana en HuggingFace: https://huggingface.co/collections/KinyoubiAtelier/tulana
- Sitio web de Kinyoubi Atelier & Co.: https://kinyoubiatelier.com
