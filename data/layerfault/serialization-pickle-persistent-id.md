# LayerFault/serialization-pickle-persistent-id

## Resumen

Este repositorio de HuggingFace, publicado por el usuario LayerFault, no es un modelo de inteligencia artificial usable, sino un artefacto sintético del corpus de pruebas de seguridad Layerfault. Su identificador de corpus es `LF-CH-SER-0003` y está diseñado específicamente para ejercitar reglas de detección de escáneres de seguridad de modelos, como la regla `LF-PICKLE-PERSISTENT-ID`. El artefacto contiene características adversarias deliberadas, como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompt, todo ello con el fin de evaluar la robustez de las herramientas de análisis estático.

El propósito principal es servir como caso de prueba positivo para sistemas de detección de amenazas en el ecosistema de modelos de IA. No debe interpretarse como un modelo de aprendizaje automático con capacidades de generación, razonamiento o codificación. La propia model card lo declara explícitamente como un "artefacto de prueba de seguridad" y advierte que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner. Su relevancia radica en la creciente preocupación por la seguridad de la cadena de suministro de IA, donde el deserializado inseguro de archivos pickle puede provocar ejecución remota de código (RCE) al cargar modelos desde hubs como HuggingFace.

El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes, y fue creado el 21 de agosto de 2026. La licencia es Apache-2.0 y el acceso está restringido mediante una puerta de entrada que requiere que el usuario acepte explícitamente que entiende que es un artefacto de prueba, no pesos de modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto sintético, no un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no aplicable (no contiene pesos de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio es un artefacto sintético creado por LayerFault para formar parte de un corpus de seguridad. La model card indica que contiene características adversarres como opcodes de pickle sospechosos, contraband de formatos ejecutables y strings de inyección de prompt. Estos elementos están diseñados para activar reglas de detección específicas en escáneres de seguridad estáticos. No hay información sobre cómo se generó el artefacto más allá de que es sintético y forma parte del corpus Layerfault.

## Capacidades

Este artefacto no tiene capacidades de inteligencia artificial. En su lugar, sus características son:

- Contiene payloads de pickle diseñados para probar la detección de deserialización insegura.
- Incluye opcodes de pickle que pueden desencadenar comportamientos adversarres en herramientas de análisis.
- Puede contener strings de inyección de prompt para probar reglas de detección de ataques de inyección.
- Está etiquetado como "security-research", "model-security", "synthetic" y "adversarial-testing".
- La regla directa que espera activar es `LF-PICKLE-PERSISTENT-ID`.
- No soporta generación de texto, razonamiento, código, vision ni ninguna otra capacidad de modelo de lenguaje.

## Casos de uso

Este artefacto no es un modelo y no debe usarse en aplicaciones de producción. Sus usos son exclusivamente de pruebas de seguridad:

- Pruebas de escáneres de seguridad de modelos: el artefacto se alimenta a herramientas de detección estática para verificar si la regla `LF-PICKLE-PERSISTENT-ID` se activa correctamente.
- Validación de reglas de detección: los desarrolladores de sistemas de seguridad pueden usar este artefacto como caso positivo para confirmar que su detector bloquea la carga de modelos con serialización de pickle peligrosa.
- Evaluación de blind spots: dado que la clasificación de desafío indica "expected admission decision: BLOCK" y "control type: positive", se usa para asegurar que los escáneres bloquean este tipo de contenido.
- Investigación en seguridad de IA: investigadores pueden analizar las características del artefacto para entender patrones de ataque en el ecosistema de modelos.
- Entrenamiento de herramientas de análisis: el artefacto sirve como ejemplo de entrada maliciosa para ajustar modelos de detección de amenazas.
- Validación de políticas de gobernanza de modelos: las organizaciones pueden usar este tipo de artefactos para probar que sus políticas de aceptación de modelos de Hugging Face rechazan contenido sospechoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene un modelo de IA, por lo que no hay métricas de rendimiento como MMLU, HumanEval o GSM8K. La única métrica relevante sería la tasa de detección de la regla `LF-PICKLE-PERSISTENT-ID` en un escáner de seguridad, pero no se proporcionan datos al respecto.

## Requisitos de hardware

No aplicable. Este artefacto no requiere hardware de inferencia ni GPU. Su uso es en entornos de pruebas estáticas o aisladas de análisis de seguridad, donde solo se necesita un sistema capaz de ejecutar el escáner y procesar archivos de texto o serialización. No hay requisitos de VRAM, GPU recomendadas ni opciones de despliegue de modelos.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparables, ya que no es un modelo de IA. Otros artefactos del corpus Layerfault (como `LF-CH-SER-0003`) podrían ser comparables en cuanto a propósito de prueba de seguridad, pero no se proporciona información sobre ellos en la documentación disponible. Los resultados de búsqueda web mencionan herramientas como PickleBall, que es una investigación sobre deserialización segura de modelos pickle, pero no son comparables directamente a este artefacto.

## Limitaciones y advertencias

- No es un modelo de IA: este repositorio no contiene pesos de modelo ni ninguna capacidad de generación, razonamiento o procesamiento de lenguaje.
- Riesgo de ejecución de código: el contenido está diseñado para ser adversarral y puede desencadenar ejecución de código si se carga o deserializa en un entorno no aislado. La model card advierte explícitamente que no debe cargarse fuera de un entorno de pruebas de escáner.
- Riesgo de inyección de prompts: el artefacto puede contener strings de inyección de prompt que podrían engañar a sistemas de análisis.
- No apto para producción: no debe usarse como modelo de IA en aplicaciones reales, ya que no tiene ninguna función útil y es un vector de ataque potencial.
- Licencia Apache-2.0: aunque la licencia permite uso comercial, el artefacto no es útil para producción y su uso debe limitarse a pruebas de seguridad.
- Restricciones de acceso: el repositorio está bloqueado por una puerta de entrada que requiere aceptar que se entiende que es un artefacto de prueba, lo que limita el acceso a usuarios que confirmen el riesgo.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/LayerFault/serialization-pickle-persistent-id
- Blog sobre pickle deserialization RCE en modelos de IA: https://www.egnworks.com/blog/pickle-deserialization-rce-how-a-malicious-ai-model-runs-code-the-moment-you-load-it
- PickleBall: Secure Deserialization of Pickle-based ML Models (artículo): https://arxiv.org/html/2508.15987v1
- Resumen del blog de PickleBall: https://davisjam.medium.com/pickleball-secure-deserialization-of-pickle-based-machine-learning-models-a089113e6b0f
- Artículo sobre seguridad de modelos de IA con Zero-Trust: https://arxiv.org/pdf/2503.01758
