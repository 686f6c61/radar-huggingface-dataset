# LayerFault/shard-absolute-path-reference

## Resumen

El repositorio `LayerFault/shard-absolute-path-reference` es un artefacto sintético de prueba de seguridad, no un modelo de inteligencia artificial utilizable. Forma parte del corpus Layerfault, diseñado para ejercitar detectores de seguridad en escáneres de repositorios de Hugging Face. Su propósito es servir como entrada de control o comparación para reglas que detectan referencias a rutas absolutas en ficheros de índice de shards de checkpoints.

El artefacto contiene características adversariales intencionadas, como códigos pickle sospechosos, contrabando de formatos ejecutables o cadenas de inyección de prompts, con el fin de validar reglas de escaneo estático. No es un modelo entrenado, no tiene pesos y no debe cargarse ni ejecutarse en ningún entorno que no sea un entorno aislado de pruebas de seguridad. Su relevancia radica en que se relaciona con vulnerabilidades reales de path traversal en librerías como Transformers y Accelerate, documentadas en CVE-2026-75104 y CVE-2026-69112.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de prueba, sin arquitectura de modelo) |
| Parametros totales | no disponible (sin pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repo no contiene pesos; solo ficheros de prueba) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado. Es un artefacto sintético generado por el corpus Layerfault, con la identificación `LF-CH-SHARD-0004`. Su contenido está diseñado para ser detectado por escáneres de seguridad, no para ser cargado por bibliotecas de aprendizaje automático. La model card advierte explícitamente que contiene características adversariales (opcodes pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) y que debe tratarse como un fixture de prueba, no como pesos de modelo.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código, visión ni ninguna otra funcionalidad de modelo de IA.
- Su único propósito es servir como entrada de control para pruebas de escáneres de seguridad.
- Puede ejercitar reglas de detección de path traversal en ficheros de índice de shards (por ejemplo, rutas absolutas o `../`).
- Puede ayudar a validar la robustez de herramientas que cargan checkpoints desde el Hub de Hugging Face.

## Casos de uso

- Pruebas de escáneres de seguridad de repositorios: el artefacto se puede alimentar a herramientas de escaneo estático para verificar si detectan rutas absolutas en ficheros de índice de shards.
- Validación de parches de seguridad: sirve como entrada de prueba para confirmar que una corrección de CVE-2026-75104 o CVE-2026-69112 bloquea correctamente la carga de shards con rutas maliciosas.
- Entrenamiento de detectores de amenazas: puede usarse como ejemplo positivo para entrenar modelos de detección de artefactos maliciosos en el Hub de Hugging Face.
- Evaluación de pipelines de CI/CD de seguridad: permite comprobar que los controles de admisión de modelos bloquean repositorios con características adversariales.
- Investigación en seguridad de la cadena de suministro de IA: sirve como caso de estudio para documentar cómo se construyen artefactos sintéticos de prueba.
- Control negativo en benchmarks de detección: al ser un artefacto de control, se puede usar para medir la precisión de un detector sin esperar que active reglas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo, no existen métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.). El repositorio no reporta ningún tipo de evaluación.

## Requisitos de hardware

- No aplica. No hay inferencia ni entrenamiento.
- El artefacto puede procesarse con herramientas de análisis estático en cualquier máquina, sin necesidad de GPU.
- Si se desea probar la carga en un entorno aislado, basta con un entorno de contenedor o sandbox; no se requieren recursos específicos de cómputo.

## Comparativa con modelos similares

No disponible. Este artefacto no es comparable con modelos de lenguaje o visión. Podría compararse con otros artefactos del corpus Layerfault (por ejemplo, otros IDs de corpus como `LF-CH-...`), pero no se dispone de información sobre otros repositorios del corpus en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo utilizable: no debe cargarse ni ejecutarse en ningún entorno de producción.
- Contiene características adversariales diseñadas para engañar a escáneres de seguridad; puede desencadenar alertas o comportamientos inesperados si se procesa en un entorno no aislado.
- No hay garantías de que no contenga contenido dañino adicional no documentado en la model card.
- La licencia apache-2.0 no exime del riesgo inherente a usar artefactos de prueba maliciosos en entornos reales.
- Se recomienda únicamente su uso en laboratorios de seguridad con sandboxing estricto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/shard-absolute-path-reference
- CVE-2026-75104 (path traversal en Transformers): https://aithreatalert.com/cve/CVE-2026-75104
- CVE-2026-75104 (strix.ai): https://www.strix.ai/cve/CVE-2026-75104
- CVE-2026-75104 (radar.offseq.com): https://radar.offseq.com/threat/cve-2026-75104-improper-limitation-of-a-pathname-to-a-restricted-directory-path-traversal-in-68f02c788d33af14
- CVE-2026-69112 (path traversal en Accelerate): https://radar.offseq.com/threat/cve-2026-69112-improper-limitation-of-a-pathname-to-a-restricted-directory-path-traversal-in-b9602909f1aef0cf
- Issue de diffusers sobre path traversal en shards: https://github.com/huggingface/diffusers/issues/14175
