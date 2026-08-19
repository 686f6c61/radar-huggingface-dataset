# Arcaeon/arcaeon-ledger

## Resumen

Arcaeon Ledger es una biblioteca de registro de acciones (action ledger) con encadenamiento hash para agentes de IA, desarrollada por Arcaeon. No es un modelo de lenguaje: es una capa de evidencia que permite demostrar que un registro de actividad de un agente no fue alterado después de su escritura. Cada registro se encadena criptográficamente al anterior mediante un hash, de modo que editar, eliminar o reordenar cualquier fila rompe la cadena y `verify()` identifica la línea exacta donde se produjo la manipulación.

El problema que resuelve es la falta de auditabilidad en sistemas de agentes LLM: las herramientas de observabilidad muestran lo que el agente hizo, pero no permiten probar que ese registro es íntegro. La biblioteca ofrece cero dependencias, un único archivo JSONL y dos verbos principales (`append` y `verify`), además de un servidor MCP, una CLI integrable en CI y un mecanismo de testigos externos contra truncamiento. Está licenciada bajo MIT y se distribuye vía PyPI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cadena de hashes sobre registros JSONL (no es un modelo neuronal) |
| Parametros totales | no aplicable (biblioteca de software, no modelo) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (API en ingles; sin dependencias de idioma) |
| Licencia | MIT |
| Formato de pesos | no aplicable (paquete Python en PyPI) |

## Arquitectura y entrenamiento

Arcaeon Ledger no es un modelo entrenado: es una biblioteca Python que implementa un registro de acciones con encadenamiento hash. Cada fila del archivo JSONL contiene el hash de la fila anterior, formando una cadena en la que cualquier modificación en una posición rompe todos los enlaces posteriores. El algoritmo `verify()` recorre la cadena y reporta la primera línea que no coincide con su hash esperado.

No hay datos de entrenamiento ni proceso de ajuste: el desarrollo consistió en extraer la biblioteca de un sistema de registro de acciones en producción, según indica el autor. La implementación incluye funciones adicionales como `authority()` para vincular un actor y su superficie de permisos a la fila encadenada, `bind_artefact()` para hashear los bytes reales que el agente leyó (una URL, un archivo, un dict), y `WitnessStore` para fijar externamente el estado de la cadena en intervalos regulares y detectar truncamientos o re-encadenados desde cero.

## Capacidades

- Registro de acciones de agentes con prueba de integridad: `append()` escribe una fila encadenada y `verify()` comprueba la cadena completa.
- Detección de manipulación in-place: editar, borrar o reordenar cualquier fila rompe la cadena y `verify()` nombra la línea exacta.
- `authority()`: vincula un actor y su superficie de permisos a la fila, afinando la pregunta de "fue editado" a "fue editado y el escritor estaba autorizado".
- `bind_artefact()` / `verify_artefact()`: hashea los bytes de una fuente re-consultable (URL, archivo) para que un tercero pueda re-obtenerla y comparar, reportando honestamente `match`, `mismatch` o `unavailable`.
- `WitnessStore` / `publish_head()` / `verify_against_witness()`: testigo externo que fija el par `(rows, chain)` en una cadencia, haciendo fallar tanto el truncamiento como el re-minado desde génesis.
- Servidor MCP: expone dos herramientas (`ledger_append` y `ledger_verify`) a cualquier cliente MCP sin necesidad de SDK.
- CLI: comandos `append` y `verify` integrables en pipelines de CI o compuertas pre-despliegue; un log manipulado devuelve código de salida distinto de cero.
- Suite de auto-test con vectores dorados: `python -m arcaeon_ledger.selftest` planta la manipulación y verifica el fallo exacto esperado.

## Casos de uso

- Auditoría de agentes en producción: registrar cada llamada a herramienta (búsquedas web, pagos, acceso a archivos) en un ledger encadenado, de modo que cualquier incidente pueda reconstruirse y verificarse sin depender de la palabra del operador.
- Cumplimiento normativo: generar evidencia de integridad sobre las acciones de un sistema autónomo para satisfacer requisitos de auditoría externa, con verificación reproducible por un tercero.
- Compuerta pre-despliegue en CI: integrar la CLI en el pipeline para que un log de acciones manipulado haga fallar el despliegue, detectando intentos de ocultar acciones antes de que lleguen a producción.
- Depuración de agentes multi-paso: reconstruir la secuencia exacta de acciones de un agente y verificar que no se alteró, lo que permite distinguir entre un error real y una manipulación del registro.
- Verificación de fuentes consultadas por un agente: usar `bind_artefact()` para hashear los documentos o URLs que el agente leyó, de modo que un revisor pueda re-obtener la fuente y comprobar que coincide con lo que el agente afirmó haber consultado.
- Integración con clientes MCP: cualquier aplicación que hable el protocolo MCP puede invocar `ledger_append` y `ledger_verify` sin escribir código adicional, añadiendo auditoría a agentes construidos sobre ese ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser una biblioteca de software y no un modelo, no aplican métricas como MMLU o HumanEval. El autor indica que la biblioteca fue extraída de un sistema de registro en producción y que la suite de pruebas cubre manipulación por edición, borrado y reordenamiento, además de un handshake MCP completo, pero no se proporcionan cifras de rendimiento.

## Requisitos de hardware

- No requiere GPU ni hardware especializado: es una biblioteca Python con cero dependencias que corre en cualquier CPU.
- Memoria: proporcional al tamaño del archivo JSONL; el algoritmo de verificación recorre la cadena linealmente.
- Almacenamiento: un único archivo JSONL por ledger; el tamaño crece con el número de registros.
- Despliegue: puede ejecutarse como proceso independiente, integrado en una aplicación existente, o como servidor MCP.
- Latencia: no se han publicado mediciones, pero al ser operaciones de hash y E/S de archivo, se espera que sea de microsegundos a milisegundos por operación según el tamaño del archivo.

## Comparativa con modelos similares

No disponible. Arcaeon Ledger no tiene comparables directos entre modelos de IA porque no es un modelo: es una herramienta de logging. En el espacio de observabilidad de agentes, las alternativas son frameworks de tracing como LangSmith, Langfuse o OpenTelemetry, pero ninguno de ellos ofrece prueba de integridad por encadenamiento hash. Arcaeon Ledger se posiciona como una capa complementaria a esas herramientas, no como un sustituto.

## Limitaciones y advertencias

- Truncamiento: eliminar las filas más recientes deja una cadena que verifica correctamente. El autor recomienda cerrar con `head()` más un testigo externo (`WitnessStore`) en una cadencia; el intervalo máximo entre fijaciones es el parámetro de seguridad real.
- Verdad de los datos: la cadena notariza lo que se escribió, no que sea cierto. Un registro a prueba de manipulación de una alucinación sigue siendo una alucinación con checksum.
- Autoría: `authority()` registra quién-afirmó-qué como datos en la fila, no como firma criptográfica. Un reescritor que re-minte la cadena desde génesis también re-minte la autoría.
- Alcance honesto de la garantía: la primitiva demostrable es "este archivo no fue reescrito in-place", no "este archivo es auténtico" ni "su contenido es verdadero".
- `bind_artefact()` reporta `mismatch` o `unavailable` sin afirmar manipulación: la web muta y devuelve 404 por sí sola, y un desajuste no es prueba de alteración.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero el usuario debe evaluar si la garantía ofrecida satisface sus requisitos regulatorios.

## Enlaces

- HuggingFace: https://huggingface.co/Arcaeon/arcaeon-ledger
- PyPI: https://pypi.org/project/arcaeon-ledger/
- Repositorio fuente: https://github.com/dan8433-user/ledger
- Organización Arcaeon: https://github.com/Arcaeon-io
- Página de verificación: https://arcaeon.io/verify
- Demo en vivo: https://huggingface.co/spaces/Arcaeon/tamper-evidence-demo
