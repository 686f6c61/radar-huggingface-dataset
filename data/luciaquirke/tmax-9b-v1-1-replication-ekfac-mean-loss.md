# luciaquirke/tmax-9b-v1.1-replication-ekfac-mean-loss

## Resumen

TMax 9B v1.1 replication: EKFAC factors, per-document mean loss es un artefacto de investigación publicado por luciaquirke en Hugging Face. No se trata de un modelo de lenguaje listo para inferencia, sino de un conjunto de factores EKFAC (KFAC con corrección de autovalores) calculados sobre el checkpoint del paso 200 de una réplica de entrenamiento de 200 pasos del modelo TMax v1.1. Los factores se han ajustado con la herramienta bergson de EleutherAI sobre 21.993 rollouts completos de entrenamiento de esa ejecución.

El propósito del artefacto es servir como material de investigación para el estudio de funciones de influencia: permite estimar cómo cada documento de entrenamiento afecta al comportamiento del modelo mediante aproximaciones de segundo orden de la matriz de información de Fisher. El ajuste se realizó en fp32 sobre todas las capas lineales excepto `lm_head` y las convoluciones de atención lineal, sin proyección, y los factores están particionados en 8 procesos, por lo que deben aplicarse con 8 procesos.

El snapshot publicado se encuentra en estado de ajuste en curso: contiene las sumas de covarianza y los autovectores ya completados, junto con el último estado de reanudación, pero la corrección de autovalores todavía se estaba ejecutando en el momento de la publicación. El repositorio ocupa 229,4 GB y está etiquetado como research-artifact bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de factores EKFAC sobre un transformer con atención lineal; no es un modelo desplegable) |
| Parametros totales | no disponible (el nombre sugiere 9B, pero no se confirma en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los factores están en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | factores EKFAC shardeados en 8 procesos: `activation_sharded/`, `gradient_sharded/`, `eigen_activation_sharded/`, `eigen_gradient_sharded/`, `factor_eig_a/`, `factor_eig_g/`, `eigenvalue_correction_sharded/`, `checkpoint/`; configuración en `config.yaml` |

## Arquitectura y entrenamiento

El artefacto no contiene pesos de un modelo generativo, sino los factores EKFAC de un modelo subyacente (TMax 9B v1.1, checkpoint del paso 200 de una réplica de 200 pasos). EKFAC combina la aproximación KFAC de la matriz de Fisher con una corrección de autovalores que reescala las matrices de autovectores para aproximar mejor la curvatura real. Los factores se calcularon sobre todas las capas lineales excepto `lm_head` y las convoluciones de atención lineal, sin proyección, íntegramente en fp32.

El ajuste se realizó con bergson (EleutherAI) sobre 21.993 rollouts completos de entrenamiento, cada uno correspondiente a un documento: la conversación completa, etiquetas sobre todo lo generado por el modelo y el gradiente multiplicado por la ventaja del rollout, con la pérdida promediada sobre los tokens etiquetados del documento (`loss_reduction: mean`). Los datos de entrenamiento del modelo subyacente, el número de tokens y la composición del dataset no se detallan en la información disponible.

## Capacidades

- No es un modelo de inferencia: no genera texto, no razona y no responde a prompts.
- Cálculo y aplicación de factores EKFAC para análisis de influencia de documentos de entrenamiento.
- Estimación de la influencia de cada documento sobre las predicciones del modelo subyacente mediante aproximaciones de curvatura de segundo orden.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Análisis de atribución de datos: aplicar los factores EKFAC para estimar qué documentos de entrenamiento contribuyen más a una predicción concreta del modelo TMax 9B v1.1, útil para auditar datasets y detectar datos tóxicos o sesgados.
- Investigación en funciones de influencia: reproducir y validar métodos EKFAC frente a otras aproximaciones (TracIn, influence functions exactas) sobre un modelo de 9B con un conjunto de 21.993 documentos.
- Depuración de entrenamiento: identificar ejemplos de entrenamiento con influencia anómala sobre comportamientos indeseados del modelo y decidir su eliminación o reetiquetado.
- Estudio de memorización y privacidad: medir la influencia de documentos que contienen datos personales para evaluar el riesgo de memorización del modelo subyacente.
- Reproducibilidad de réplicas de entrenamiento: comparar los factores de esta réplica con los de la ejecución original de TMax v1.1 para analizar la estabilidad de la curvatura entre ejecuciones.
- Investigación metodológica sobre EKFAC: usar el artefacto como referencia para estudiar el efecto de la corrección de autovalores y del promediado de pérdida por documento en la calidad de los factores.
- Desarrollo de herramientas de análisis: integrar los factores shardeados en pipelines de 8 procesos para construir utilidades de atribución de datos a escala de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 229,4 GB; se necesita almacenamiento suficiente para descargar todos los shards y el estado de reanudación.
- Los factores están en fp32 y particionados en 8 procesos; su aplicación requiere ejecutar con 8 procesos en paralelo, lo que implica al menos 8 GPUs o un entorno multi-proceso equivalente.
- VRAM estimada para inferencia: no aplica (no es un modelo de inferencia); la VRAM necesaria para aplicar los factores depende del modelo subyacente y no se detalla en la información.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No disponible; el tamaño de 229,4 GB y el requisito de 8 procesos hacen improbable un despliegue en una sola GPU consumer.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el artefacto se usa con bergson y el código de aplicación de factores EKFAC.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros artefactos EKFAC comparables ni modelos de la misma categoría con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento ni ninguna tarea de inferencia estándar.
- El ajuste está en curso: la corrección de autovalores (`eigenvalue_correction_sharded/`) no estaba completada en el momento de la publicación, por lo que los factores pueden estar incompletos o cambiar en snapshots posteriores.
- Requiere aplicar los factores con 8 procesos; un uso con otro número de procesos puede producir resultados incorrectos.
- El artefacto está vinculado a un checkpoint y una ejecución concretos (paso 200 de la réplica de TMax v1.1); no es transferible a otros modelos sin recalcular los factores.
- Los datos de entrenamiento subyacentes, los idiomas y el comportamiento del modelo base no se detallan, lo que limita la interpretación de los resultados de influencia.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación no se ofrece ninguna garantía de corrección ni soporte.
- Riesgo de sesgo y alucinación: no aplica directamente al artefacto, pero los análisis de influencia heredan los sesgos y errores del modelo subyacente y de los 21.993 documentos de entrenamiento.
- Sin descargas ni validación comunitaria (0 descargas, 1 like en el momento de la consulta): no hay evidencia externa de que los factores hayan sido verificados por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/luciaquirke/tmax-9b-v1.1-replication-ekfac-mean-loss
- Modelo base de la réplica: https://huggingface.co/luciaquirke/tmax-9b-v1.1-replication
- Dataset de rollouts: `tmax-9b-v1.1-replication-rollouts` (referenciado en la model card; URL no proporcionada)
- Herramienta bergson (EleutherAI): https://github.com/EleutherAI/bergson
