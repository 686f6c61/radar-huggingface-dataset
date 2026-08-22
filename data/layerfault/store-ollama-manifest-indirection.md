# LayerFault/store-ollama-manifest-indirection

## Resumen

Este repositorio, `LayerFault/store-ollama-manifest-indirection`, no es un modelo de IA utilizable. Se trata de un artefacto sintético de prueba de seguridad perteneciente al corpus Layerfault, diseñado para ejercitar detectores de escáneres de seguridad estáticos y dinámicos. Su identificador de corpus es `LF-CH-STORE-0005` y su propósito declarado es almacenar un caso de "indirección de manifiesto de Ollama", una técnica de ataque que consiste en ocultar o desviar la resolución de manifiestos en el almacén local de modelos.

El autor, LayerFault, lo publica bajo licencia Apache-2.0 y lo marca explícitamente como un "artefacto de prueba de seguridad" que **nunca debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas**. No contiene pesos de red neuronal, arquitectura de modelo ni capacidades de inferencia. Su relevancia radica en que sirve como entrada de control para validar reglas de detección en herramientas de admisión de modelos locales, como el propio proyecto Layerfault, que valida artefactos, paquetes y runtimes locales antes de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (artefacto sintetico de prueba) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (no contiene pesos) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado. Según la model card, está construido deliberadamente con características adversariales (opcodes de pickle sospechosos, contrabando de formatos ejecutables, cadenas de inyección de prompts) para probar reglas de detección de escáneres de seguridad. No existe arquitectura, datos de entrenamiento ni proceso de optimización. La única "técnica" relevante es la manipulación de manifiestos de Ollama, un formato de almacenamiento basado en blobs y capas que se resuelve mediante un manifiesto con digest SHA-256, tal como documenta el propio proyecto Ollama.

## Capacidades

- No posee capacidades de generación de texto, razonamiento, código ni visión.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingües.
- Su única característica funcional es la de servir como entrada de prueba para escáneres de seguridad, validando si las reglas de detección identifican correctamente la técnica de indirección de manifiesto de Ollama.
- Está clasificado como control positivo: se espera que un detector correctamente configurado lo bloquee (decisión de admisión esperada: BLOCK).

## Casos de uso

- Pruebas de reglas de detección en herramientas de admisión de modelos: se utiliza como entrada para verificar que un escáner estático o sandbox de comportamiento detecta y bloquea artefactos que manipulan la resolución de manifiestos en el almacén local de Ollama.
- Evaluación de sandbox de comportamiento: al ejecutarse en un entorno aislado Linux, se comprueba si el artefacto provoca efectos secundarios o desviaciones de comportamiento sospechosas durante el análisis dinámico.
- Desarrollo de reglas de seguridad para pipelines de IA local: sirve como caso positivo (positive control) para implementar reglas de bloqueo en herramientas como Layerfault, que validan modelos antes de la inferencia.
- Auditoría de sistemas de almacenamiento de modelos: se puede emplear para comprobar si un sistema de registro de modelos (por ejemplo, un registry de Ollama) es vulnerable a técnicas de indirección de manifiesto.
- Formación y documentación de equipos de seguridad: como artefacto sintético, permite ilustrar de forma controlada una técnica de ataque sin exponer a entornos reales.
- Test de integración de pipelines de CI/CD de seguridad: puede integrarse en suites de pruebas automatizadas para verificar que los escáneres de seguridad se actualizan y detectan nuevas variantes de ataques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un artefacto de prueba, no tiene métricas de rendimiento de modelo.

## Requisitos de hardware

No aplica. Este artefacto no requiere hardware de inferencia. Para su uso como prueba de seguridad, se necesita un entorno aislado (sandbox de Linux) y una herramienta de escaneo estático. Se recomienda ejecutarlo en una máquina virtual desechable o contenedor sin acceso a la red ni a datos sensibles. No hay requisitos de VRAM ni de GPU.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, ya que se trata de un artefacto de seguridad sintético. En el ámbito de seguridad de modelos, se podría comparar con otros artefactos del corpus LayerFault (por ejemplo, `LF-CH-STORE-0004`, `LF-CH-STORE-0006`), pero no se dispone de información pública sobre ellos.

## Limitaciones y advertencias

- No es un modelo de IA utilizable: no produce salidas de texto, código ni razonamiento.
- Contiene características adversariales deliberadas (opcodes de pickle sospechosos, contrabando de ejecutables, cadenas de inyección de prompts) que pueden activar falsos positivos o provocar ejecuciones no deseadas si se maneja fuera de un entorno de pruebas aislado.
- Su carga o ejecución en un entorno de producción o en una máquina sin sandbox puede suponer un riesgo de seguridad real.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio no es apto para uso en producción ni para su integración en aplicaciones.
- No se proporcionan datos sobre idiomas soportados ni sobre el contenido del artefacto más allá de la descripción de la model card.
- La fecha de creación (2026-08-21) indica que es un artefacto reciente y probablemente experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayerFault/store-ollama-manifest-indirection
- Proyecto Layerfault en GitHub: https://github.com/izm1chael/layerfault
- Documentación de confianza de Layerfault (modelo de confianza): https://github.com/izm1chael/layerfault/blob/main/docs/TRUST_MODEL.md
- Documentación de almacenamiento de modelos de Ollama: https://deepwiki.com/ollama/ollama/4.2-model-registry-and-layers
- Sitio oficial de Ollama: https://ollama.com/
