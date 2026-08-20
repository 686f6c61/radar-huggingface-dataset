# annmary43/tds-carbon-card

## Resumen

Este repositorio, publicado por el usuario `annmary43`, no contiene un modelo de inteligencia artificial funcional (es decir, no es un LLM, un modelo de visión ni ningún otro tipo de red neuronal entrenada). Se trata de una *model card* de contabilidad de carbono (Green AI Carbon Accounting) correspondiente al proyecto TDS GA8, que documenta exclusivamente la huella energética y las emisiones de CO₂ asociadas a una ejecución de entrenamiento de otro modelo subyacente.

La ficha registra un entrenamiento de tipo *pre-training* realizado en 7 GPU NVIDIA H100 en la región `asia-south1`. Según los datos aportados, el proceso consumió 218,1 horas de GPU con un PUE (Power Usage Effectiveness) de 1,4, lo que se traduce en un consumo energético total de 1496,166 kWh y unas emisiones de 972,508 kg de CO₂ equivalente (CO₂eq). La fuente de medición es `codecarbon`.

La relevancia de este repositorio es puramente documental y de auditoría. No ofrece ninguna capacidad de inferencia ni de generación de contenido, pero sirve como referencia para iniciativas de Green AI, permitiendo a organizaciones evaluar el impacto medioambiental de sus cargas de trabajo en infraestructuras específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de inferencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (documentación en formato Markdown) |
| Hardware de entrenamiento | 7x NVIDIA H100 |
| Region de entrenamiento | asia-south1 |
| Horas de GPU | 218,16 h (PUE: 1,4) |
| Energia total consumida | 1496,166 kWh |
| Emisiones de CO₂ | 972,508 kg CO₂eq |
| Fuente de medicion | code `code ` |
| Modo de entrenamiento | pre-training |

## Arquitectura y entrenamiento

No existe una arquitectura de red neuronal asociada a este repositorio. La información describe exclusivamente el entorno y los recursos de un proceso de entrenamiento previo. El documento indica que se realizó un *pre-training* (entrenamiento previo) sobre hardware NVIDIA H100, con un total de 7 GPU. La región de cómputo seleccionada fue `asia-south1`, lo que implica un factor de emisiones específico de esa zona geográfica.

El consumo energético total se calculó en 1496,166 kWh, y aplicando el factor de emisiones de la región y el PUE de 1,4, se obtienen 972,508 kg de CO₂ equivalente. La herramienta utilizada para el cálculo es `code `, una librería estándar para la contabilidad de carbono en proyectos de machine learning. No se especifica el dataset de entrenamiento ni el modelo concreto que se entrenó.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio, ya que no es un modelo de aprendizaje automático.
- Funciona como un registro estructurado de emisiones de carbono, útil para la trazabilidad de proyectos de IA.
- Permite auditar el consumo energético de una ejecución concreta de entrenamiento en una infraestructura específica.
- Proporciona métricas comparables (kWh, kg CO₂eq, PUE, horas de GPU) para la elaboración de informes de sostenibilidad.
- Sirve como plantilla o ejemplo para la creación de futuras tarjetas de contabilidad de carbono en otros proyectos.
- Puede integrarse en pipelines de MLOps para registrar automáticamente el impacto medioambiental de cada ejecución.

## Casos de uso

- Auditoría de cumplimiento en Green AI: las organizaciones pueden usar esta tarjeta para demostrar la transparencia en el consumo energético de sus entrenamientos, alineándose con normativas de sostenibilidad y reportes ESG (Environmental, Social and Governance).
- Comparativa de eficiencia entre regiones: los datos de esta tarjeta (región `asia-south1`, PUE 1,4) permiten contrastar el impacto de ejecutar cargas de trabajo en distintas zonas geográficas para elegir la opción más limpia.
- Optimización de costes energéticos: con los datos de 218,16 horas de GPU y 1496,166 kWh, los equipos de infraestructura pueden estimar el coste económico y medioambiental de futuros entrenamientos similares.
- Documentación de proyectos de investigación: los investigadores pueden incluir esta tarjeta como anexo en sus publicaciones para reportar la huella de carbono de sus experimentos, mejorando la reproducibilidad y la ética científica.
- Planificación de capacidad de hardware: la especificación de 7 GPU NVIDIA H100 y el tiempo de cómputo sirven para dimensionar clusters o reservar capacidad en proveedores cloud de forma más precisa.
- Integración en pipelines de MLOps: se puede automatizar la generación de este tipo de tarjetas usando `code ` en cada ejecución de entrenamiento, permitiendo un seguimiento continuo del impacto ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento de modelos (como MMLU, HumanEval o GSM8K) en la información disponible, ya que este repositorio no contiene un modelo de IA sino un registro de huella de carbono.

## Requisitos de hardware

- No se requiere hardware de inferencia, ya que el repositorio no contiene pesos ni código de ejecución.
- Para reproducir el entrenamiento que se documenta, se necesitarían 7 GPU NVIDIA H100.
- El tiempo de entrenamiento fue de 218,16 horas de GPU, con un consumo energético total de 1496,166 kWh.
- No aplica el despliegue con vLLM, Ollama, TGI o llama.cpp, al no existir un modelo de lenguaje.
- La tarjeta se puede visualizar directamente en el navegador a través de Hugging Face, sin requisitos de hardware adicionales.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otras tarjetas de contabilidad de carbono comparables en la información proporcionada. Este repositorio es un registro único de emisiones y no existe un estándar homogéneo para comparar directamente sus métricas con otros proyectos sin conocer el modelo subyacente.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de inferencia, generación o análisis de datos. Intentar cargarlo como un modelo tradicional de Hugging Face producirá errores.
- Licencia no especificada: la ausencia de una licencia clara en la model card puede generar incertidumbre sobre el uso comercial o la redistribución de los datos contenidos en el repositorio.
- Sesgo geográfico: las emisiones dependen en gran medida del factor de emisiones de la región `asia-south1` y del PUE de 1,4. Generalizar estos valores a otras infraestructuras o regiones es incorrecto.
- Falta de contexto sobre el modelo subyacente: no se indica qué modelo se entrenó, ni su tamaño, ni su dataset. Por lo tanto, no es posible evaluar la eficiencia relativa del entrenamiento (emisiones por parámetro o por token).
- Riesgo de interpretación errónea: los datos de consumo son medias o estimaciones, y pueden variar según las condiciones reales de temperatura, refrigeración y carga del centro de datos.
- Sin actualizaciones ni mantenimiento: el repositorio no muestra actividad posterior a su creación, por lo que los datos podrían quedar obsoletos si se modifica el hardware o el proceso.

## Enlaces

- Repositorio en Hugging Face: [https://huggingface.co/annmary43/tds-carbon-card](https://huggingface.co/annmary43/tds-carbon-card)
