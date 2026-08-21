# LayerFault/shard-index-indirection-chain

## Resumen
El repositorio `LayerFault/shard-index-indirection-chain` es un artefacto sintético de seguridad perteneciente al corpus LayerFault, un conjunto de datos diseñado para probar y validar herramientas de admisión y escaneo de modelos de IA locales. No es un modelo de aprendizaje automático utilizable: contiene características adversariales deliberadas (opcodes pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) para ejercitar las reglas de detección de escáneres de seguridad.

El proyecto LayerFault, desarrollado por la organización homónima, proporciona una CLI offline-first que valida artefactos de modelos, inspecciona paquetes, verifica integridad, evalúa procedencia y confianza, aplica políticas operativas y puede bloquear la ejecución si las garantías fallan. Este repositorio concreto, con identificador `LF-CH-SHARD-0011`, actúa como un control o comparación dentro de ese corpus, enfocado en la técnica de "indirection chain" sobre el índice de shards.

Con solo 32 parámetros declarados en los metadatos de safetensors y un tamaño de repositorio de 0.0 GB, es evidente que no contiene pesos reales de un modelo. Su finalidad exclusiva es servir como objetivo para pruebas estáticas y de ejecución aislada, nunca como un modelo de producción. Su licencia Apache-2.0 y su carácter de artefacto de seguridad lo convierten en una herramienta de investigación, no en un recurso para desarrollo de aplicaciones.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto sintético, no es un modelo real) |
| Parametros totales | 32 (dato de safetensors, sin significado funcional) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (aunque el repositorio es 0.0 GB, no hay pesos reales) |

## Arquitectura y entrenamiento
No existe una arquitectura de modelo en el sentido convencional. El repositorio es un fichero de prueba sintético que simula un paquete de modelo con un índice de shards que encadena indirecciones (shard index indirection chain). La técnica de "shard indirection" consiste en que el índice de un shard apunta a otro índice, y así sucesivamente, lo que puede confundir a los escáneres que solo inspeccionan el primer nivel. No ha habido entrenamiento; el contenido se ha generado sintéticamente para incluir características adversariales (opcodes pickle sospechosos, contenedores ejecutables, cadenas de inyección de prompts) que sirven como señuelos para detectar reglas de seguridad.

El corpus LayerFault se construye con secretos falsos, destinos de red en loopback o `.invalid`, salidas de marcador inofensivas y comportamiento sintético, todo diseñado para escaneo estático y pruebas de seguridad aisladas. No hay datos de entrenamiento, no hay pesos, no hay capacidad de inferencia.

## Capacidades
- No es un modelo funcional: no genera texto, no razona, no ejecuta código ni tiene ninguna capacidad de IA.
- Su única "capacidad" es servir como objetivo de prueba para herramientas de admisión de modelos (como LayerFault CLI).
- Contiene características adversariales intencionadas: opcodes pickle sospechosos, formatos de ejecutables camuflados, cadenas de inyección de prompts.
- No soporta tool calling, agentes, visión, audio ni ningún otro tipo de capacidad de modelo.

## Casos de uso
- Pruebas de escáneres de seguridad de modelos: se puede alimentar este artefacto a un sistema de admisión de modelos (por ejemplo, Layerfault CLI) para verificar si detecta la cadena de indirección en el índice de shards y emite una advertencia (WARN).
- Evaluación de herramientas de inspección de paquetes: comprobar si un analizador de safetensors detecta la anomalía de tamaño (32 parámetros) o la estructura de índice no estándar.
- Validación de reglas de detección de inyección de prompts: el artefacto contiene cadenas de inyección que pueden activar reglas específicas en escáneres de contenido.
- Pruebas de aislamiento de entornos: se puede ejecutar en un sandbox para verificar que el entorno no ejecuta código no confiable.
- Verificación de políticas de admisión: en un pipeline de CI/CD que valida modelos antes de su uso, este artefacto puede servir como prueba negativa para confirmar que el sistema bloquea o marca el artefacto.
- Investigación de seguridad de modelos: como ejemplo de un ataque de "shard indirection", puede ser usado en publicaciones o laboratorios para ilustrar técnicas de evasión de escáneres.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no tiene rendimiento de inferencia, ya que no es un modelo.

## Requisitos de hardware
- No aplica: el artefacto no se ejecuta como modelo. No requiere VRAM, GPU ni ningún hardware de inferencia.
- Para su análisis, se necesita un entorno aislado (contenedor, VM desechable) y una herramienta de escaneo estático (por ejemplo, Layerfault CLI).
- No se recomienda cargar los safetensors en ningún runtime de inferencia (vLLM, Ollama, llama.cpp) porque el contenido es adversarial.

## Comparativa con modelos similares
No disponible. No existen modelos comparables porque este es un artefacto de prueba de seguridad, no un modelo de IA. La categoría de "artefactos de seguridad sintéticos" es específica de Layerfault y no hay alternativas públicas documentadas.

## Limitaciones y advertencias
- No es un modelo usable: cualquier intento de cargarlo como modelo de IA fallará o puede ejecutar código malicioso.
- Riesgo de seguridad: contiene opcodes pickle sospechosos y cadenas de inyección de prompts; ejecutarlo fuera de un entorno aislado es peligroso.
- Alucinación: no aplica, pero el concepto de "alucinación" no tiene sentido aquí.
- Licencia: Apache-2.0 permite uso, pero solo para fines de prueba de seguridad; no tiene utilidad comercial como modelo.
- Restricción de uso: el autor exige que solo se utilice en un entorno de prueba de escáneres aislado, nunca en producción.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/LayerFault/shard-index-indirection-chain
- GitHub del proyecto Layerfault: https://github.com/izm1chael/layerfault
- Releases de Layerfault: https://github.com/izm1chael/layerfault/releases
- Documentación de Shard Index de NVIDIA AIStore: https://docs.nvidia.com/aistore/shard_index (referencia a la técnica de shard index)
- Artículo sobre sharding de modelos: https://medium.com/@pranay.janupalli/understanding-model-sharding-and-model-parallelism-scaling-large-language-models-dee6144d0591
