# LayerFault/shard-parent-traversal-reference

## Resumen

El repositorio `LayerFault/shard-parent-traversal-reference` no es un modelo de inteligencia artificial, sino un artefacto sintético de prueba del corpus Layerfault, diseñado para ejercitar reglas de detección de escáneres de seguridad en el ecosistema de Hugging Face. Fue publicado por el autor LayerFault el 21 de agosto de 2026 bajo licencia Apache-2.0, con un tamaño de repositorio de 0.0 GB y sin descargas ni likes. Su propósito declarado es servir como referencia para la detección de la regla `LF-SAFE-INDEX-INVALID` y para evaluar blind spots en herramientas de admisión de modelos locales.

El artefacto contiene características adversariales intencionadas, como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyección de prompts, aunque la model card aclara explícitamente que no es un modelo utilizable y que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner. Su relevancia radica en que se relaciona con la vulnerabilidad CVE-2026-75104, una travesía de rutas en Hugging Face Transformers que permite leer archivos arbitrarios fuera del directorio del modelo mediante índices de shards maliciosos. Este repositorio sirve como caso de prueba positivo para detectores que buscan este tipo de ataques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (referencia en tags), pero el repositorio no contiene pesos reales |

## Arquitectura y entrenamiento

No se trata de un modelo de aprendizaje automatico, por lo que no existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un artefacto de seguridad sintetico que replica la estructura de un modelo sharded (por ejemplo, con un archivo de indice `model.safetensors.index.json` y shards) para probar la validacion de rutas en herramientas de inspeccion. Segun la model card, contiene caracteristicas adversariales deliberadas, como opcodes de pickle sospechosos, contrabando de formatos ejecutables y cadenas de inyeccion de prompts. Su diseño se enmarca en el corpus Layerfault, que usa secretos falsos, destinos de red `.invalid` y comportamiento de modelo sintetico unicamente con fines de escaneo estatico y pruebas de seguridad aisladas.

## Capacidades

- No posee capacidades de generacion de texto, razonamiento, codigo, vision, audio ni tool calling.
- Es un artefacto de prueba de seguridad que simula caracteristicas de un modelo sharded malicioso.
- Contiene cadenas de inyeccion de prompts y opcodes de pickle sospechosos para activar reglas de deteccion en escaneres.
- Su funcion es servir como caso de control positivo para la regla `LF-SAFE-INDEX-INVALID` del corpus Layerfault.
- No es utilizable para ninguna tarea de IA ni para inferencia.

## Casos de uso

- Pruebas de escaneres de seguridad de modelos: el artefacto se puede alimentar a herramientas de admision de modelos (como Layerfault CLI) para verificar que detectan correctamente indices de shard con referencias a directorios padre.
- Validacion de reglas de deteccion de travesia de rutas: permite comprobar si un escaner identifica la vulnerabilidad CVE-2026-75104 en archivos de indice de checkpoint sharded.
- Desarrollo de firmas de deteccion: los equipos de seguridad pueden usar este corpus para crear o ajustar reglas que bloqueen modelos con rutas de shard no validadas.
- Formacion de herramientas de cuarentena: sirve como entrada para probar mecanismos de aislamiento de artefactos antes de su ejecucion.
- Auditoria de pipelines de CI/CD que integren cargas de modelos: permite verificar que los pasos de validacion de artefactos rechacen este tipo de contenido.
- Investigacion en seguridad de IA: el corpus Layerfault ofrece un conjunto de artefactos sinteticos para estudiar superficies de ataque en el ecosistema de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no es un modelo y no tiene metricas de rendimiento de IA.

## Requisitos de hardware

- No aplica: no es un modelo ejecutable.
- No se requieren GPU ni VRAM para su uso; solo es un conjunto de archivos de texto y binarios pequeños para analisis estatico.
- Para el escaneo se recomienda un entorno aislado (contenedor, maquina virtual) y herramientas como Layerfault CLI (https://github.com/izm1chael/layerfault).
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparables porque se trata de un artefacto de seguridad sintetico, no de un modelo de lenguaje o de vision. Otros repositorios del corpus Layerfault (por ejemplo, `LF-CH-SHARD-0003`) pueden compartir proposito, pero no se dispone de informacion sobre ellos.

## Limitaciones y advertencias

- No es un modelo de IA utilizable: no produce salidas de texto, codigo ni ninguna tarea de aprendizaje automatico.
- Contiene caracteristicas adversariales deliberadas (opcodes de pickle sospechosos, contrabando de formatos ejecutables, inyeccion de prompts) que pueden ser peligrosas si se cargan o ejecutan fuera de un entorno aislado.
- La model card advierte explicitamente que no debe cargarse ni ejecutarse como modelo de produccion.
- No se proporcionan datos de entrenamiento, arquitectura ni parametros, por lo que no se puede evaluar ningun tipo de rendimiento.
- Aunque la licencia es Apache-2.0, el uso previsto es exclusivamente para pruebas de seguridad; cualquier otro uso no esta contemplado.
- La fecha de creacion (2026-08-21) y la referencia a CVE-2026-75104 indican que esta relacionado con una vulnerabilidad concreta, pero no se aporta informacion adicional sobre el impacto real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LayerFault/shard-parent-traversal-reference
- Repositorio Layerfault en GitHub (CLI de admision de modelos): https://github.com/izm1chael/layerfault
- Informe de la vulnerabilidad CVE-2026-75104 (travesia de rutas en Transformers): https://radar.offseq.com/threat/cve-2026-75104-improper-limitation-of-a-pathname-to-a-restricted-directory-path-traversal-in-68f02c788d33af14
- Entrada en Vulners (PT-2026-76799): https://vulners.com/ptsecurity/PT-2026-76799
- Informe en Base Fortify: https://basefortify.eu/cve_reports/2026/08/cve-2026-75104.html
- Issue en GitHub de Hugging Face Transformers (referencia a path traversal en shard index): https://github.com/huggingface/transformers/issues/47176
