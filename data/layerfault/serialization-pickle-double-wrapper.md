# LayerFault/serialization-pickle-double-wrapper

## Resumen

El repositorio `LayerFault/serialization-pickle-double-wrapper` no es un modelo de inteligencia artificial ni contiene pesos de red neuronal. Se trata de un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault, identificado con el código `LF-CH-SER-0007`. Su propósito es ejercitar detectores de seguridad en escáneres de modelos, incluyendo características adversariales como opcodes de pickle sospechosos, contrabando de formatos ejecutables o cadenas de inyección de prompts.

El propio autor advierte de forma explícita en la model card que el repositorio "no es un modelo ML utilizable" y que "nunca debe cargarse o ejecutarse fuera de un entorno aislado de pruebas de escáner". La licencia es Apache 2.0, pero el acceso está gated y requiere confirmación de que se comprende su naturaleza de prueba. Fue creado el 21 de agosto de 2026 y no registra descargas ni likes.

Por tanto, esta ficha no describe capacidades de un modelo, sino que documenta un artefacto de seguridad y su contexto técnico. Los datos técnicos de arquitectura, entrenamiento o rendimiento no existen y se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible (no es un modelo ML) |
| Parametros activos | no disponible (no es un modelo ML) |
| Longitud de contexto | no disponible (no es un modelo ML) |
| Tipos de cuantizacion | no disponible (no es un modelo ML) |
| Idiomas soportados | no disponible (no es un modelo ML) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (repositorio con contenido adversarial de prueba) |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento. El repositorio es un artefacto de control diseñado para pruebas de escáner de seguridad. Según la model card, contiene "opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts" y otras características adversariales. Su finalidad es evaluar la capacidad de los detectores de seguridad para identificar contenido malicioso en repositorios de modelos, sin que el propio artefacto sea ejecutable de forma segura.

El corpus Layerfault utiliza "secretos falsos, destinos de red loopback/`.invalid`, marcadores de salida inofensivos y comportamiento de modelo sintético". La clasificación del desafío es severidad media, dificultad intermedia, y se espera una decisión de admisión de tipo WARN. La técnica asociada es pickle, con superficie de ataque de serialización-mutación y sin transformaciones adicionales.

## Capacidades

- Ninguna capacidad de modelo ML (generación de texto, razonamiento, código, visión, etc.).
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Es un artefacto de prueba de seguridad, diseñado para ser detectado por escáneres de repositorios de modelos.

## Casos de uso

- Pruebas de escáner de seguridad: el artefacto se utiliza para validar que un escáner de modelos detecta características adversariales de pickle (por ejemplo, la detección de opcodes sospechosos o la presencia de contenedores dobles de serialización).
- Evaluación de detectores de inyección de prompts: las cadenas de inyección incluidas permiten comprobar si el escáner identifica patrones de ataque conocidos.
- Entrenamiento de reglas de detección: los desarrolladores de herramientas de seguridad pueden usar este artefacto como caso positivo para entrenar o afinar reglas de detección en sus pipelines de CI.
- Verificación de políticas de carga segura: sirve para comprobar que los cargadores de modelos (por ejemplo, los que usan pickle) bloquean la ejecución de código arbitrario.
- Investigación sobre seguridad de serialización: como artefacto de control, permite estudiar el comportamiento de escáneres frente a mutaciones de serialización.
- Pruebas de sandboxing: se puede usar en entornos aislados para comprobar que el sandbox no permite la ejecución de contenido no confiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no es un modelo y no tiene métricas de rendimiento de IA. La única referencia a evaluación es la clasificación del desafío de seguridad (severidad media, dificultad intermedia, decisión esperada WARN) y los IDs de oráculo `LF-ORACLE-SER-0001`, que describen el ground truth sintético pero no resultados de escáner.

## Requisitos de hardware

No aplica. No hay inferencia, entrenamiento ni despliegue de un modelo. El uso requiere únicamente un entorno aislado para pruebas de seguridad, sin GPU ni recursos de cómputo especiales. Se recomienda ejecutar el escáner en un sandbox o contenedor desechable.

## Comparativa con modelos similares

No disponible. No es un modelo de IA y no existen modelos comparables en la categoría de artefactos de prueba de seguridad. La literatura relacionada incluye el trabajo PickleBall (arXiv 2508.15987) que aborda la deserialización segura de modelos pickle, pero no es comparable con este repositorio.

## Limitaciones y advertencias

- No es un modelo utilizable: no se puede cargar ni ejecutar como un modelo ML.
- Riesgo de seguridad crítico: contiene características adversariales (pickle malicioso, inyección de prompts, etc.) que pueden ejecutar código arbitrario si se carga de forma no aislada.
- Prohibido su uso en producción: la model card indica que "nunca debe cargarse o ejecutarse fuera de un entorno aislado de pruebas de escáner".
- Acceso restringido: el repositorio está gated y requiere confirmación explícita de que se entiende que es un artefacto de prueba.
- Sin garantías de funcionalidad: no hay descargas, likes ni evidencia de uso real; es un artefacto sintético de un corpus de investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/serialization-pickle-double-wrapper
- Paper PickleBall (arXiv): https://arxiv.org/html/2508.15987v2
- Artículo de blog sobre PickleBall: https://davisjam.medium.com/pickleball-secure-deserialization-of-pickle-based-machine-learning-models-a089113e6b0f
- PDF PickleBall (Columbia): https://www.cs.columbia.edu/~junfeng/papers/pickleball-ccs25.pdf
- PDF PickleBall (Brown): https://cs.brown.edu/people/vpk/papers/pickleball.ccs25.pdf
