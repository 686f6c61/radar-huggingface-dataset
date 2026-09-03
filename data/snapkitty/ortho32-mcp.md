# Snapkitty/ortho32-mcp

## Resumen

Snapkitty/ortho32-mcp no es un modelo de inteligencia artificial, sino un servidor MCP (Model Context Protocol) determinista implementado íntegramente en AWK. Publicado por el autor Snapkitty, este repositorio demuestra que el modelo de procesamiento orientado a registros de AWK es estructuralmente compatible con el flujo de mensajes JSON-RPC sobre stdio que exige el protocolo MCP. El servidor lee una petición JSON-RPC por línea desde `stdin`, despacha métodos de forma explícita y escribe una respuesta JSON-RPC por línea en `stdout`, manteniendo `stderr` exclusivamente para diagnósticos. Su relevancia radica en ofrecer una alternativa ligera, sin dependencias externas y con salida determinista para herramientas que necesiten integrarse en entornos MCP sin recurrir a runtimes pesados.

El proyecto incluye cinco herramientas de manipulación de texto (`awk_count`, `awk_fields`, `awk_filter`, `awk_regex`, `awk_transform`), cada una con un esquema JSON explícito en la respuesta `tools/list`. El diseño evita deliberadamente números aleatorios, marcas de tiempo en la salida de protocolo, ejecución de shell controlada por el cliente, inferencia de modelos y llamadas a servicios externos, garantizando que ante el mismo estado y la misma entrada la salida sea idéntica. No se trata de un modelo con parámetros entrenables, sino de un programa AWK autocontenido; por tanto, las métricas habituales de modelos de lenguaje (parámetros, contexto, cuantización) no aplican y se indican como no disponibles.

El repositorio también incorpora una capa de gobernanza denominada "SnapKitty Method", que distingue entre código público, pruebas formales públicas y especificaciones públicas, frente a la autoridad soberana de un trust irrevocable (Bel Esprit D'Accord Irrevocable Trust). Esta distinción implica que leer el código o bifurcar el repositorio no otorga derechos de despliegue ni autoridad de ejecución, una particularidad que debe tenerse en cuenta antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP determinista en AWK (script `bin/ortho32-mcp.awk`) |
| Parametros totales | no disponible (no es un modelo neuronal; script AWK de tamaño reducido) |
| Parametros activos | no disponible (no aplica, no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa líneas JSON-RPC de longitud arbitraria limitada por AWK) |
| Tipos de cuantizacion | no disponible (no aplica; no hay pesos numéricos) |
| Idiomas soportados | no disponible (el servidor procesa JSON-RPC, no texto natural; las herramientas operan sobre texto arbitrario) |
| Licencia | no disponible en la model card; el README remite a `LICENSE` y `NOTICE` con términos propietarios del trust |
| Formato de pesos | no disponible (no hay pesos; el artefacto es un script AWK de texto plano) |

## Arquitectura y entrenamiento

El proyecto no sigue una arquitectura de transformer, MoE o SSM, sino un diseño de servidor MCP basado en AWK. El flujo es: cliente MCP → JSON-RPC sobre stdio → `bin/ortho32-mcp.awk` → despacho explícito de métodos → herramientas AWK deterministas → respuesta JSON-RPC en `stdout`. AWK se usa como runtime principal, aprovechando su modelo de registros (record → pattern/action → transformación determinista → resultado JSON). El servidor distingue entre peticiones, notificaciones, respuestas y errores de protocolo; las respuestas JSON-RPC enviadas al servidor se ignoran, como corresponde a un runtime del lado servidor.

No existe fase de entrenamiento en el sentido de aprendizaje automático. El código es programático y se mantiene mediante un conjunto de pruebas automatizadas que cubren `initialize`, `notifications/initialized`, `tools/list`, `tools/call`, métodos desconocidos, herramientas desconocidas, argumentos inválidos, múltiples peticiones secuenciales, JSON malformado, reproducción determinista y salida de protocolo exclusiva en `stdout`. La implementación incluye un pequeño analizador JSON determinista adaptado a las formas de petición MCP soportadas; no requiere `jq`. El README menciona una posible integración futura de `jq` como utilidad de frontera, pero el despacho y la ejecución de herramientas permanecerían en AWK.

## Capacidades

- Procesamiento de mensajes JSON-RPC sobre stdio siguiendo el protocolo MCP (métodos `initialize`, `notifications/initialized`, `tools/list`, `tools/call`).
- Herramienta `awk_count`: cuenta líneas, líneas no vacías y caracteres de un texto de entrada.
- Herramienta `awk_fields`: divide registros en campos usando un separador explícito proporcionado por el cliente.
- Herramienta `awk_filter`: devuelve las líneas que coinciden con una expresión regular AWK especificada.
- Herramienta `awk_regex`: cuenta las líneas que coinciden con una expresión regular AWK.
- Herramienta `awk_transform`: aplica transformaciones de texto `upper`, `lower` o `trim`.
- Cada herramienta expone un esquema JSON explícito en la respuesta `tools/list`, lo que facilita su descubrimiento por clientes MCP.
- Salida determinista: para el mismo estado y la misma entrada, la salida es idéntica; no se usan números aleatorios, timestamps en el protocolo, ejecución de shell desde entrada del cliente, inferencia de modelos ni llamadas a servicios externos.
- Tratamiento de la entrada del cliente como datos no confiables: los nombres de herramientas se resuelven mediante despacho explícito, sin evaluar programas AWK suministrados por el cliente ni interpolar cadenas del cliente en comandos shell.

## Casos de uso

- Integración en entornos MCP como herramienta de utilidad ligera: un asistente o agente MCP puede invocar `awk_count` o `awk_filter` para procesar fragmentos de texto sin depender de un LLM, reduciendo latencia y coste.
- Procesamiento de logs en pipelines de desarrollo: mediante `awk_filter` y `awk_regex`, un sistema de monitorización puede extraer líneas relevantes de logs enviados como entrada, devolviendo resultados estructurados en JSON-RPC.
- Validación de esquemas de datos textuales: `awk_fields` permite dividir líneas CSV o TSV con separadores configurables, útil para preprocesar datos antes de enviarlos a un modelo de lenguaje.
- Normalización de texto en flujos automatizados: `awk_transform` aplica cambios de mayúsculas/minúsculas o recorte de espacios, útil en tareas de limpieza de datos sin necesidad de un servicio externo.
- Pruebas de protocolo MCP: el servidor puede usarse como banco de pruebas para clientes MCP, verificando el manejo de peticiones, notificaciones, errores y respuestas en un entorno determinista.
- Entornos con restricciones de recursos: al requerir únicamente AWK (disponible en casi cualquier sistema Unix), puede desplegarse en contenedores mínimos o dispositivos embebidos donde ejecutar un LLM sería inviable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no es un modelo de IA y no presenta métricas de precisión, razonamiento o generación. El README solo menciona un conjunto de pruebas funcionales (no de rendimiento) que cubren los casos esperados del protocolo; no se proporcionan cifras de latencia, throughput ni consumo de recursos.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; es un script AWK que se ejecuta en cualquier sistema Unix-like con un intérprete AWK (por ejemplo, GNU AWK, BWK awk, o el AWK incluido en Git for Windows).
- Uso de memoria y CPU mínimo: procesa una línea a la vez, con complejidad dependiente de las expresiones regulares utilizadas.
- Opciones de despliegue: se ejecuta directamente con `awk -f bin/ortho32-mcp.awk` o mediante el binario de AWK de Git for Windows en entornos Windows.
- No aplica cuantización, vLLM, llama.cpp, Ollama ni TGI; el runtime es el propio intérprete AWK.
- La latencia es del orden de milisegundos para entradas pequeñas, pero depende de la longitud de las líneas y de la complejidad de las expresiones regulares; no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No disponible. Este proyecto no pertenece a la categoría de modelos de lenguaje ni de sistemas de IA comparables. Podría compararse con otros servidores MCP implementados en lenguajes como Python o Node.js, pero la información disponible no incluye datos de otros servidores similares para establecer una comparación objetiva. En cualquier caso, la propuesta de valor de ortho32-mcp es su determinismo, su ausencia de dependencias y su mínima huella de recursos, características que lo diferencian de implementaciones MCP más pesadas.

## Limitaciones y advertencias

- No es un modelo de IA: no realiza inferencia, razonamiento ni generación de texto; solo ejecuta transformaciones deterministas definidas por el código AWK.
- Restricciones de licencia y autoridad: el README establece que el código es público y verificable, pero la autoridad de ejecución y el estado operativo pertenecen a un trust soberano. Leer o bifurcar el repositorio no otorga derechos de despliegue. Los términos exactos están en `LICENSE` y `NOTICE`, que no se han proporcionado en la información disponible; se recomienda revisarlos antes de cualquier uso.
- Limitaciones de protocolo: solo soporta los cuatro métodos MCP indicados; no implementa recursos, prompts ni otras extensiones del protocolo.
- Dependencia de AWK: el comportamiento puede variar ligeramente entre distintas implementaciones de AWK (por ejemplo, soporte de expresiones regulares); las pruebas usan el AWK de Git for Windows en Windows, pero no se garantiza compatibilidad total en todos los intérpretes.
- Sin garantía de manejo de JSON complejo: el analizador JSON está adaptado a las formas de petición MCP soportadas; estructuras anidadas o tipos de datos avanzados pueden no ser procesados correctamente.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo; el riesgo principal es un comportamiento incorrecto si la entrada JSON-RPC no se ajusta a los esquemas esperados.
- Sesgos: no aplica, al no haber modelos entrenados con datos; el sesgo solo podría aparecer en las expresiones regulares definidas por el usuario.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/ortho32-mcp
- Documentación adicional referenciada en el README (no disponibles en la información proporcionada):
  - `SOVEREIGN_METHOD.md` (arquitectura de gobernanza)
  - `LICENSE` (términos de licencia)
  - `NOTICE` (estado de propiedad intelectual)
