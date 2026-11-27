# fikraapi/fikra-code

## Resumen

Fikra Code es un agente de programación para terminal distribuido a través de Hugging Face por el autor `fikraapi`, con licencia Apache 2.0. No se trata de un modelo de pesos abiertos, sino de un cliente CLI que se instala en el portátil del usuario y delega la inferencia en la API remota de Fikra (`fikraapi.co.ke`). El repositorio de Hugging Face actúa únicamente como escaparate y punto de descubrimiento del artefacto; el código fuente y los binarios se publican en GitHub.

La versión más reciente documentada es la v0.3.6, que corrige un fallo de selección de modelo por defecto: el cliente aceptaba el primer modelo marcado como predeterminado en el catálogo, lo que podía iniciar una sesión nueva sobre un modelo de pago. A partir de esta versión solo se acepta un valor por defecto cuando exactamente un modelo lo declara, y la única opción con la que puede arrancar una sesión nueva es el modelo gratuito `qwen3.8-27b-free`.

La relevancia del proyecto es limitada desde el punto de vista de la investigación en IA: no publica arquitectura, pesos, datos de entrenamiento ni benchmarks propios. Su interés es práctico para desarrolladores que quieran un agente de código en línea de comandos con gestión de catálogo de modelos, comparación entre modelos y un sistema de aprobación de escrituras dentro de un sandbox.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cliente CLI; la inferencia se delega en la API de Fikra) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se distribuyen pesos; se distribuyen binarios del CLI) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red neuronal ni sobre proceso de entrenamiento, ya que el artefacto publicado no es un modelo de lenguaje sino una herramienta de cliente. El funcionamiento descrito en la model card es el siguiente: el binario `fikra` se instala en la máquina del usuario, se autentica mediante `fikra login` y realiza peticiones de inferencia contra la API de Fikra. El catálogo de modelos se obtiene del servidor en `fikraapi.co.ke/code/models.json`, se cachea durante seis horas y, en caso de fallo, recurre a la última copia válida y después a una lista integrada en el binario.

Entre las innovaciones de ingeniería documentadas destacan el comando `/compare <a> <b> <prompt>`, que ejecuta un mismo prompt sobre dos modelos y muestra ambas respuestas con sus recuentos de tokens, y el comando `/catalog`, que compara el catálogo del servidor con el integrado en modo offline y sin coste. La versión v0.3.5 también reduce de forma notable las solicitudes de aprobación para escrituras en rutas que el sandbox ya permite.

## Capacidades

- Agente de programación en terminal: ejecuta tareas de codificación desde la línea de comandos sobre el portátil del usuario.
- Inferencia remota mediante la API de Fikra, sin necesidad de GPU local.
- Gestión de catálogo de modelos con caché de seis horas, copia de respaldo y lista integrada.
- Comparación de modelos con `/compare <a> <b> <prompt>`, incluyendo recuento de tokens por respuesta.
- Diagnóstico de catálogo con `/catalog`, comparando la lista del servidor con la integrada en modo offline.
- Sistema de sandbox con aprobación de escrituras por ruta.
- Autenticación de usuario mediante `fikra login`.
- Verificación de descargas y checksums a través de la página de releases.
- Capacidades multilingües, de tool calling, de agentes multi-paso o de visión: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de programación en terminal: el desarrollador instala el CLI con `fikra` y ejecuta tareas de código directamente en su máquina, delegando la inferencia en la API remota, lo que evita requerir hardware con GPU.
- Evaluación comparativa de modelos: mediante `/compare <a> <b> <prompt>` se lanza un mismo prompt sobre dos modelos del catálogo y se contrastan ambas respuestas con sus recuentos de tokens, útil para elegir modelo por tarea.
- Auditoría del catálogo de modelos: `/catalog` permite verificar sin conexión y sin coste si el catálogo servido por el backend coincide con el integrado en el binario, lo que ayuda a detectar desviaciones o modelos retirados.
- Despliegue en equipos sin acelerador: al no ejecutar inferencia local, el CLI es adecuado para portátiles de desarrollo convencionales, que es explícitamente el escenario descrito por el autor.
- Control de cambios en escrituras: el sandbox con aprobación por ruta permite que el agente modifique ficheros solo en directorios autorizados, lo que reduce el riesgo en repositorios de producción.
- Arranque controlado en entornos gratuitos: la política de la v0.3.6 garantiza que toda sesión nueva se inicie sobre el modelo gratuito `qwen3.8-27b-free`, lo que facilita pruebas sin coste y sin riesgo de facturación accidental.
- Integración en flujos de trabajo de equipo: la verificación de checksums en la página de releases permite validar la integridad del binario antes de distribuirlo internamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica en local; la inferencia se ejecuta en la infraestructura de la API de Fikra.
- GPU recomendadas: no aplica para el cliente; no se especifican requisitos del lado servidor.
- GPU de consumo: el CLI está pensado para ejecutarse en un portátil convencional sin acelerador dedicado.
- Opciones de despliegue: binario CLI instalado mediante `fikra` desde la página de releases de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del modelo seleccionado en el catálogo y de la red del usuario.

## Comparativa con modelos similares

| Herramienta | Tipo | Inferencia | Licencia | Distribución | Modelos |
|---|---|---|---|---|---|
| Fikra Code | Agente de código CLI | API remota de Fikra | Apache 2.0 | GitHub (binarios) y HF (escaparate) | Catálogo servido por el backend |
| Aider | Agente de código CLI | Local o API externa | Apache 2.0 | PyPI y GitHub | Configurable por el usuario |
| OpenHands | Agente de código | Local o API externa | MIT | GitHub y contenedores | Configurable por el usuario |
| Claude Code | Agente de código CLI | API de Anthropic | Propietaria | Instalador oficial | Modelos Claude |

La comparación se limita a la categoría de herramienta, ya que Fikra Code no publica pesos ni métricas de rendimiento que permitan contrastarlo con modelos de lenguaje concretos.

## Limitaciones y advertencias

- No es un modelo de pesos abiertos: no se puede inspeccionar, modificar ni ejecutar localmente; toda la inferencia depende de un servicio externo.
- Dependencia de la API de Fikra: sin conectividad con `fikraapi.co.ke` no hay inferencia, más allá de las funciones offline de consulta de catálogo.
- Ausencia total de datos técnicos sobre los modelos servidos: no se publican parámetros, contexto, datos de entrenamiento ni benchmarks.
- Riesgo de alucinación: no evaluable, al no existir documentación sobre los modelos subyacentes.
- Sesgos: no disponibles.
- Idiomas soportados: no disponibles; la model card está redactada en inglés.
- La versión v0.3.6 corrige un fallo que podía iniciar sesiones sobre modelos de pago; se recomienda usar esa versión o superior para evitar cargos no deseados.
- El catálogo se cachea seis horas, por lo que pueden existir discrepancias temporales entre la oferta real del backend y la vista por el cliente.
- Licencia Apache 2.0 aplicable al cliente; las condiciones de uso de la API y de los modelos servidos no se detallan en la información disponible.
- El repositorio de Hugging Face no contiene el código fuente; este reside en GitHub, lo que obliga a verificar la cadena de suministro en dos ubicaciones distintas.

## Enlaces

- Hugging Face: https://huggingface.co/fikraapi/fikra-code
- Releases y checksums: https://github.com/Fikra-API/fikra-code/releases
- Changelog: https://github.com/Fikra-API/fikra-code/blob/main/CHANGELOG.md
- Catálogo de modelos (servidor): https://fikraapi.co.ke/code/models.json
