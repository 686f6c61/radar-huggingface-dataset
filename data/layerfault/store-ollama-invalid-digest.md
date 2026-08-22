# LayerFault/store-ollama-invalid-digest

## Resumen

El repositorio `LayerFault/store-ollama-invalid-digest` no es un modelo de inteligencia artificial, sino un artefacto sintético de pruebas de seguridad perteneciente al corpus Layerfault. Su identificador de corpus es `LF-CH-STORE-0002` y está diseñado para ejercitar reglas de detección en escáneres de seguridad de modelos locales, específicamente para el caso de un digest SHA-256 inválido en el almacén de blobs de Ollama. Fue creado el 21 de agosto de 2026 por el autor LayerFault y no tiene descargas ni valoraciones.

Este repositorio contiene características adversariales deliberadas, como códigos pickle sospechosos, contrabando de formatos ejecutables o strings de prompt-injection, que sirven para comprobar si los sistemas de escaneo detectan este tipo de amenazas. No es un modelo utilizable, no tiene pesos ni arquitectura, y debe tratarse exclusivamente como un fixture de testing en entornos aislados. La licencia es Apache-2.0, pero con un aviso de acceso restringido (gated) que obliga a aceptar que se trata de un artefacto de prueba.

La relevancia de este repositorio radica en que permite validar si los sistemas de seguridad de repositorios de modelos (como HuggingFace) detectan correctamente artefactos con digests inválidos o características maliciosas. Es un caso de control positivo para probar reglas de detección como `LF-OLLAMA-DIGEST-MISMATCH`, aunque dicha regla aún está marcada como candidata y no confirmada en la versión de LayerFault usada para la certificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (artefacto de prueba, no es un modelo) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplicable (no hay pesos; es un conjunto de archivos de prueba) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento en el sentido de modelos de IA. El repositorio es un artefacto sintético generado por el corpus LayerFault, que construye muestras adversariales para probar detectores de seguridad. La técnica principal es la inclusión de características maliciosas de forma controlada (por ejemplo, códigos pickle sospechosos, formatos ejecutables camuflados, strings de prompt-injection) para ver si un escáner las detecta. No hay datos de entrenamiento, no hay RLHF, ni ninguna innovación técnica en el ámbito del ML.

## Capacidades

- No es un modelo de IA, por lo que no tiene capacidades de generación de texto, razonamiento, código, visión, etc.
- Su única "capacidad" es la de servir como entrada de prueba para sistemas de escane de seguridad, permitiendo verificar si detectan características adversariales.
- Puede ser usado para probar reglas de detección de digest mismatch en el almacén de modelos de Ollama (candidata `LF-OLLAMA-DIGEST-MISMATCH`).
- No tiene soporte de tool calling, agentes ni multilingüismo.
- No tiene modo de pensamiento ni ninguna funcionalidad de inferencia.

## Casos de uso

- **Testing de escáneres de seguridad en repositorios de modelos**: el artefacto se introduce en un pipeline de escaneo para comprobar si el sistema detecta la presencia de un digest inválido en un almacén de blobs de Ollama. Es útil para validar reglas de detección como `LF-OLLAMA-DIGEST-MISMATCH`.
- **Pruebas de regresión en sistemas de detección**: se puede usar como caso de control positivo para verificar que una regla de seguridad no produce falsos negativos.
- **Desarrollo de nuevas reglas de detección**: los equipos de seguridad pueden analizar el artefacto para entender patrones de ataque y diseñar reglas que los detecten.
- **Formación de herramientas de análisis estático**: sirve como ejemplo para entrenar o validar herramientas que buscan códigos pickle sospechosos o formatos ejecutables camuflados.
- **Pruebas de aislamiento de entornos**: se puede usar para verificar que un entorno de ejecución aislado bloquea correctamente la carga de artefactos no seguros.
- **Investigación en seguridad de modelos**: permite estudiar cómo los sistemas de almacenamiento de modelos (como Ollama) manejan digests incorrectos y si hay vulnerabilidades asociadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no tiene métricas de rendimiento de IA, ya que no es un modelo.

## Requisitos de hardware

No aplicable. No es un modelo que requiera hardware para inferencia. Si se usa para pruebas de escaneo estático, solo se necesita un entorno aislado con herramientas de análisis de archivos y posiblemente una instalación de Ollama para simular el escenario de digest inválido. No se requieren GPUs ni VRAM.

## Comparativa con modelos similares

No disponible. No existen modelos comparables, ya que no es un modelo de IA. Podría compararse con otros artefactos del corpus LayerFault, pero no se dispone de información sobre ellos.

## Limitaciones y advertencias

- **No es un modelo utilizable**: no se puede cargar ni ejecutar como un modelo de IA. Cualquier intento de hacerlo puede causar fallos o comportamientos inesperados.
- **Contiene características adversariales**: el repositorio incluye deliberadamente códigos pickle sospechosos, formatos ejecutables camuflados y strings de prompt-injection. No debe abrirse ni ejecutarse fuera de un entorno aislado de pruebas de seguridad.
- **No debe usarse en producción**: es un fixture de prueba, no un modelo. Su uso en producción podría comprometer la seguridad.
- **Acceso restringido**: el repositorio está marcado como gated, por lo que solo se puede acceder tras aceptar un aviso que indica que es un artefacto de prueba.
- **No hay garantía de que el escáner de LayerFault tenga una regla que lo detecte**: el propio repositorio indica que la regla `LF-OLLAMA-DIGEST-MISMATCH` es candidata y no está confirmada, por lo que podría ser un punto ciego en los sistemas de detección.
- **No se proporcionan datos de entrenamiento ni de rendimiento**: al no ser un modelo, no hay métricas de calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LayerFault/store-ollama-invalid-digest
- Guía de solución de problemas de Ollama (referencia sobre errores de digest mismatch): https://insiderllm.com/guides/ollama-troubleshooting-guide/
- Documentación oficial de Ollama sobre troubleshooting: https://docs.ollama.com/troubleshooting
- Issue de GitHub sobre digest mismatch en Ollama: https://github.com/ollama/ollama/issues/941
- Issue de GitHub sobre digest mismatch en Ollama (otro caso): https://github.com/ollama/ollama/issues/3931
- Artículo sobre errores de pull de Ollama: https://markaicode.com/errors/ollama-pull-failed-fix/

Nota: los enlaces web se han incluido como referencia al contexto del problema de digest mismatch, pero no son parte del artefacto en sí.## Resumen

El repositorio `LayerFault/store-ollama-invalid-digest` no es un modelo de inteligencia artificial, sino un artefacto sintético de pruebas de seguridad perteneciente al corpus LayerFault. Su identificador de corpus es `LF-CH-STORE-0002` y está diseñado para ejercitar reglas de detección en escáneres de seguridad de modelos, específicamente el caso de un digest SHA-256 inválido en el almacén de blobs de Ollama. Fue creado el 21 de agosto de 2026 por el autor LayerFault y no tiene descargas ni interacciones.

El repositorio contiene características adversariales deliberadas (códigos pickle sospechosos, formatos ejecutables camuflados, strings de prompt-injection) y no es un modelo utilizable. No tiene pesos, arquitectura ni ninguna funcionalidad de inferencia. Su propósito es servir como entrada de control en pruebas de escáneres de seguridad, y el propio README advierte que no debe cargarse ni ejecutarse fuera de un entorno aislado de testing. La licencia es Apache-2.0, pero el acceso está restringido mediante un aviso de confirmación que obliga a reconocer que se trata de un fixture de prueba.

La relevancia de este artefacto radica en que permite comprobar si un sistema de escaneo detecta correctamente un digest inválido en el almacén de modelos de Ollama, un problema real que aparece en la práctica (ver issues de GitHub sobre `digest mismatch`). La regla candidata `LF-OLLAMA-DIGEST-MISMATCH` aún no está confirmada en la versión de LayerFault usada para la certificación, por lo que el artefacto puede exponer un punto ciego del detector.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (no es un modelo ML) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplicable (no hay pesos; es un conjunto de archivos de prueba) |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento en el sentido de modelos de IA. El repositorio es un artefacto sintético del corpus LayerFault, que construye entradas adversariales controladas para probar detectores de seguridad. Las técnicas utilizadas incluyen opcodes pickle sospechosos, formatos ejecutables camuflados y strings de prompt-injection, pero no hay datos de entrenamiento ni innovaciones técnicas en el ámbito de modelos.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no ejecuta código ni tiene capacidades de visión o audio.
- Su única función es servir de entrada de prueba para sistemas de escaneo de seguridad, verificando si detectan un digest inválido en el almacén de Ollama.
- No soporta tool calling, agentes ni funciones multilingües.
- No tiene modo de pensamiento ni ninguna funcionalidad de inferencia.

## Casos de uso

- **Pruebas de escáneres de seguridad en repositorios de modelos**: el artefacto se integra en un pipeline de escaneo para comprobar si el sistema detecta un digest inválido en un blob de Ollama. Es útil para validar reglas como `LF-OLLAMA-DIGEST-MISMATCH`.
- **Desarrollo de nuevas reglas de detección**: los equipos de seguridad pueden analizar el artefacto para entender qué características adversariales deben cubrirse y diseñar reglas que las detecten.
- **Verificación de falsos negativos**: se usa como control positivo para comprobar que un detector no omite este tipo de amenaza.
- **Entrenamiento de herramientas de análisis estático**: sirve para probar herramientas que buscan opcodes pickle sospechosos o formatos ejecutables camuflados.
- **Pruebas de aislamiento de entornos**: se ejecuta en entornos aislados para confirmar que los sistemas de bloqueo de carga de archivos no seguros funcionan correctamente.
- **Investigación en seguridad de modelos**: permite estudiar cómo el almacén de modelos de Ollama maneja digests incorrectos y si hay mecanismos de protección adicionales necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo, no hay métricas de calidad ni de rendimiento.

## Requisitos de hardware

No aplicable. No es un modelo que requiera inferencia ni hardware específico. Para su uso en pruebas de escaneo se necesita únicamente un entorno aislado con herramientas de análisis de archivos y, opcionalmente, una instalación de Ollama para simular el escenario de digest inválido. No se requieren GPUs ni VRAM.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no es un modelo de IA. Podría compararse con otros artefactos del corpus LayerFault, pero no se dispone de información sobre ellos.

## Limitaciones y advertencias

- **No es un modelo utilizable**: no se puede cargar ni ejecutar como un modelo de IA. Cualquier intento puede provocar errores o comportamientos inesperados.
- **Contiene características adversariales**: incluye códigos pickle sospechosos, formatos ejecutables camuflados y strings de prompt-injection. No debe abrirse ni ejecutarse fuera de un entorno aislado de seguridad.
- **No debe usarse en producción**: es un fixture de prueba, no un modelo. Su uso en producción comprometería la seguridad.
- **Acceso restringido**: el repositorio está marcado como gated, por lo que solo se puede acceder tras aceptar el aviso que confirma que es un artefacto de prueba.
- **La regla de detección no está confirmada**: el propio repositorio indica que la regla `LF-OLLAMA-DIGEST-MISMATCH` es candidata y no está confirmada, por lo que puede ser un punto ciego en el detector.
- **No hay datos de entrenamiento ni de rendimiento**: al no ser un modelo, no hay métricas de calidad.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/LayerFault/store-ollama-invalid-digest)
- [Guía de troubleshooting de Ollama](https://insiderllm.com/guides/ollama-troubleshooting-guide/)
- [Documentación oficial de troubleshooting de Ollama](https://docs.ollama.com/troubleshooting)
- [Issue de GitHub sobre digest mismatch en Ollama](https://github.com/ollama/ollama/issues/941)
- [Issue de GitHub sobre digest mismatch en Ollama (segundo caso)](https://github.com/ollama/ollama/issues/3931)
- [Artículo sobre errores de pull de Ollama](https://markaicode.com/errors/ollama-pull-failed-fix/)
