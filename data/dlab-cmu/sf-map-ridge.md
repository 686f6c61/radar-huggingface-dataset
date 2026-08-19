# dlab-cmu/sf-map-ridge

## Resumen

`dlab-cmu/sf-map-ridge` es un estimador de sensibilidad cruzada para el catálogo de cuantización SF (shrinkage-compensated float) publicado por el grupo DLAB de Carnegie Mellon. No es un modelo de generación de texto ni un LLM, sino un pequeño regresor estadístico que predice la sensibilidad de un modelo a la cuantización con el código SF, expresada como `log(mean direct codebook KL)`. Este valor permite comparar qué modelos se degradan más al ser cuantizados con un formato dado.

El repositorio actúa como un *fallback*: cuando no existe un mapa específico para un modelo concreto (publicado como `dlab-cmu/sf-map-{org}__{name}`), se usa este estimador genérico basado en una regresión Ridge sobre características de tipo y tamaño/arquitectura, más un residuo por tipo de capa (MoE, DeltaNet). La implementación es deliberadamente simple: un único archivo JSON con coeficientes, medias y desviaciones, que se puede sobrescribir para publicar un mejor estimador.

La relevancia de esta pieza es operativa dentro del ecosistema SF: permite estimar la degradación por cuantización sin ejecutar el modelo completo, lo que facilita la selección de formatos en pipelines de despliegue. El proyecto es abierto (licencia MIT) y está orientado a la comunidad de cuantización y optimización de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión Ridge sobre características de tipo y tamaño/arquitectura, con residuo por tipo de capa (MoE) |
| Parametros totales | no disponible (archivo JSON con intercept, weights, feature_mean, feature_std y moe_residual) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (es un estimador para cuantización SF, no un formato de pesos) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | JSON (`sf-map-ridge.json`) |

## Arquitectura y entrenamiento

El modelo es una regresión Ridge de una sola capa que toma como entrada un vector de características `xs` que representan el tipo de modelo, su tamaño y arquitectura. La predicción se calcula normalizando cada característica con su media (`feature_mean`) y desviación estándar (`feature_std`), multiplicando por los pesos (`weights`) y sumando el intercept. Además, si el modelo tiene una arquitectura MoE (indicado por `has_moe`), se añade un residual específico por tipo de capa (`moe_residual`), que puede ser positivo o negativo según el tipo de capa (por ejemplo, DeltaNet).

El objetivo de entrenamiento es predecir `log(mean direct codebook KL)`, una métrica de divergencia de Kullback-Leibler entre el modelo original y su versión cuantizada con el catálogo SF. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de muestras o el proceso de optimización. La simplicidad del diseño (un JSON de coeficientes) sugiere que se trata de un modelo ligero, entrenado offline sobre un conjunto de modelos de referencia para servir como heurística rápida.

## Capacidades

- Estimación de la sensibilidad de un modelo a la cuantización SF, devolviendo una puntuación que correlaciona con la degradación de la calidad (`log(mean codebook KL)`).
- Soporte para modelos con arquitectura MoE mediante un ajuste residual por tipo de capa.
- Integración sencilla en Python a través de la descarga del JSON desde Hugging Face y el cálculo de la puntuación con una fórmula lineal.
- Funciona como fallback cuando no existe un mapa específico por modelo en el repositorio `dlab-cmu/sf-grids`.
- Actualizable: el archivo JSON puede ser sobrescrito por la comunidad para publicar mejores estimadores.
- No es un modelo de lenguaje: no genera texto, código, ni soporta tool calling, agentes o razonamiento.

## Casos de uso

- Selección de formato de cuantización: dado un modelo candidato, se puede estimar rápidamente si la cuantización con un formato SF concreto producirá una pérdida de calidad aceptable, sin necesidad de ejecutar el modelo completo.
- Optimización de pipelines de despliegue: en entornos de CI/CD, se puede integrar la estimación para decidir automáticamente qué modelos requieren mapas específicos y cuáles pueden usar el estimador genérico.
- Comparación de modelos: al predecir la sensibilidad de varios modelos al mismo formato de cuantización, se pueden ordenar y seleccionar los más robustos para entornos con recursos limitados.
- Investigación en cuantización: sirve como herramienta para analizar la relación entre arquitectura (tamaño, tipo de capa, MoE) y degradación por codificación.
- Desarrollo de herramientas de optimización: el JSON se puede integrar en librerías de cuantización (como `sf-grids`) para decidir dinámicamente qué formato usar sin ejecutar el modelo completo.
- Benchmarking de hardware: combinado con `sf-grids`, permite estimar el impacto de la cuantización en la latencia y memoria de un modelo antes de su despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre la precisión de la estimación, el error medio absoluto ni comparaciones con otros métodos de estimación de sensibilidad.

## Requisitos de hardware

- No requiere GPU: es un archivo JSON con coeficientes y una operación lineal, por lo que se ejecuta en cualquier CPU.
- Memoria: menos de 1 MB (el archivo JSON es de tamaño reducido).
- Latencia: milisegundos (una sola multiplicación de vectores).
- Despliegue: no requiere framework de inferencia; se usa con Python estándar y `huggingface_hub` para la descarga.
- No aplica para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación.

## Comparativa con modelos similares

No se conocen modelos comparables en el ecosistema SF, ya que `sf-map-ridge` es un componente interno del proyecto `dlab-cmu/sf-grids`. La comparación relevante sería con los mapas específicos por modelo (`dlab-cmu/sf-map-{org}__{name}`), que son la alternativa preferida cuando existen. Este repositorio es el fallback para casos sin mapa específico, por lo que la comparativa con otros estimadores de sensibilidad no está disponible en la información pública.

## Limitaciones y advertencias

- Es un estimador aproximado: su precisión no está validada públicamente y puede producir predicciones erróneas para modelos fuera de la distribución de entrenamiento.
- No es un modelo de lenguaje: no puede generar texto, código ni razonar; su única función es la predicción de la pérdida por cuantización.
- Depende del catálogo SF: solo es útil dentro del ecosistema `dlab-cmu/sf-grids`; no es aplicable a otros formatos de cuantización (GGUF, GPTQ, etc.).
- Riesgo de sesgo en las características: las características de tipo y tamaño/arquitectura pueden no capturar la variabilidad real entre modelos de la misma familia.
- Sin garantía de producción: al ser un proyecto con 0 descargas y 0 likes, no hay evidencia de uso en entornos productivos; se recomienda validar sus predicciones con evaluaciones reales antes de usarlo en sistemas críticos.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías implícitas.

## Enlaces

- [Repositorio HuggingFace: dlab-cmu/sf-map-ridge](https://huggingface.co/dlab-cmu/sf-map-ridge)
- [Catálogo de grids: dlab-cmu/sf-grids](https://huggingface.co/dlab-cmu/sf-grids)
- [Sitio del grupo DLAB](https://denglab.org/)
- [Noticia sobre IA y minerales críticos en CMU (contexto del grupo)](https://www.ri.cmu.edu/harnessing-ai-to-find-critical-minerals/)
