# alw399/spacetravlr-models

## Resumen

SpaceTravLR es un modelo de aprendizaje automático especializado en la predicción de efectos de perturbaciones genéticas sobre la expresión génica espacial en tejidos biológicos. Desarrollado por el autor alw399, este modelo se distribuye como un bundle servible directamente mediante el paquete `spacetravlr-web`, que permite cargar y ejecutar los modelos entrenados a través de un registro de modelos. El repositorio incluye dos modelos entrenados: uno para ganglio linfático de ratón (datos Slide-seqV2) y otro para amígdala humana (datos Slide-tags).

El modelo resuelve el problema de simular cómo una perturbación genética (por ejemplo, un knockout o una sobreexpresión) altera el perfil de expresión espacial de un tejido, lo que resulta relevante para la investigación biomédica y el descubrimiento de fármacos. A diferencia de los modelos de lenguaje, no se trata de un transformer generativo, sino de un modelo de regresión o clasificación sobre datos transcriptómicos espaciales. La arquitectura exacta, el número de parámetros y la longitud de contexto no se especifican en la información disponible, aunque el tamaño del repositorio (47.4 GB) sugiere que los pesos son considerables.

La relevancia actual radica en la creciente disponibilidad de datos de transcriptómica espacial y la necesidad de herramientas que permitan predecir in silico los efectos de perturbaciones, reduciendo el coste de los experimentos húmedos. La licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors o binarios, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo (si es una red neuronal convolucional, un transformer, un modelo de grafos, etc.). El nombre "SpaceTravLR" sugiere un enfoque de "traversal" espacial, posiblemente basado en grafos o en atención sobre coordenadas espaciales. Tampoco se detallan los datos de entrenamiento (número de muestras, composición del dataset, si se usó aprendizaje supervisado o auto-supervisado, ni si hubo fases de ajuste fino). El repositorio incluye un `manifest.json` que lista los modelos disponibles, lo que indica un flujo de empaquetado y distribución bien definido, pero no revela detalles técnicos del entrenamiento.

## Capacidades

- Predicción de efectos de perturbaciones genéticas sobre la expresión génica espacial en tejidos.
- Modelos específicos para dos tejidos: ganglio linfático de ratón (Slide-seqV2) y amígdala humana (Slide-tags).
- Integración con el ecosistema `spacetravlr-web` para servir los modelos mediante una API o registro.
- Capacidad de cargar modelos desde Hugging Face mediante `ModelRegistry.from_hub()`.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Investigación biomédica: simular in silico el efecto de un knockout génico en un tejido concreto (ganglio linfático o amígdala) para priorizar experimentos húmedos.
- Descubrimiento de fármacos: evaluar cómo una perturbación farmacológica podría alterar la expresión espacial de genes en tejidos diana, ayudando a predecir eficacia o toxicidad.
- Validación de hipótesis: comparar las predicciones del modelo con datos experimentales de perturbaciones para validar mecanismos biológicos.
- Generación de datos sintéticos: producir perfiles de expresión espacial simulados para entrenar otros modelos o para análisis exploratorios.
- Integración en pipelines de análisis de transcriptómica espacial: usar el modelo como componente de un flujo de trabajo que combine datos de expresión y coordenadas espaciales.
- Educación y formación: servir como ejemplo de aplicación de aprendizaje automático a datos ómicos espaciales en cursos de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de precisión, AUC, correlación u otras que permitan evaluar el rendimiento del modelo frente a alternativas.

## Requisitos de hardware

- El tamaño del repositorio es de 47.4 GB, lo que sugiere que los pesos del modelo son grandes y probablemente requieran una GPU con al menos 24 GB de VRAM para cargar el modelo completo en precisión flotante (FP32). Con cuantización (si estuviera disponible) podría reducirse el requisito, pero no se confirma.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.). Dado que no es un LLM, las herramientas habituales de inferencia para modelos de lenguaje no aplican directamente; el despliegue se realiza mediante `spacetravlr-web`.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (predicción de perturbaciones en transcriptómica espacial). No se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- No se conocen los sesgos del modelo, pero al estar entrenado en datos de tejidos específicos (ganglio linfático de ratón y amígdala humana), su aplicabilidad a otros tejidos o especies es incierta.
- Riesgo de alucinación: al ser un modelo de regresión, puede producir predicciones poco realistas si se le presentan entradas fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no aplica el concepto de ventana de contexto de los LLM, pero sí depende de la resolución espacial y del número de genes considerados en los datos de entrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar que los datos de entrenamiento (Slide-seqV2, Slide-tags) no tengan restricciones adicionales de uso.
- Para producción, es necesario validar el modelo con datos independientes antes de usarlo en decisiones críticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alw399/spacetravlr-models
- Repositorio GitHub de SpaceTravLRWeb: https://github.com/alw399/SpaceTravLRWeb
- Documentación del flujo de empaquetado: https://github.com/alw399/SpaceTravLRWeb#shipping-a-model-bundle--hugging-face
