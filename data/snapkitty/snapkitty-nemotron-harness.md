# Snapkitty/snapkitty-nemotron-harness

## Resumen

SnapKitty Nemotron Harness es un sistema de orquestación local que envuelve modelos de la familia Nemotron (ejecutados a través de Ollama) para convertirlos en agentes gobernados por políticas deterministas. No es un modelo de lenguaje en sí, sino un harness de control que separa la autoridad de decisión del LLM y la delega en capas externas: Prolog para validación de políticas, Lean 4 para verificación de pruebas, y un sistema de recibos sellados para auditoría. El objetivo es eliminar la confianza en el modelo como ente que se auto-regula, sustituyéndola por un flujo donde el LLM solo emite intenciones y las herramientas externas deciden si se ejecutan.

El proyecto surge de la observación de que los modelos tienden a alucinar estados, confundir categorías de pruebas o pedir aclaraciones en lugar de ejecutar pasos acotados. Por ello, el harness introduce un patrón de "syscall tokens" que el modelo debe emitir para solicitar acciones, y cada acción pasa por un gate específico (Prolog, Lean, red, shell) antes de ejecutarse. Todo el proceso queda registrado en recibos SHA-256/BLAKE3 que permiten reproducción determinista. La relevancia actual radica en su enfoque de seguridad para agentes autónomos, donde la trazabilidad y el control de permisos son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (harness de control sobre modelos Nemotron/Ollama) |
| Parametros totales | No disponible (depende del modelo base subyacente) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (depende del modelo base) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible |
| Formato de pesos | No aplica (no es un modelo con pesos) |

## Arquitectura y entrenamiento

El harness no es un modelo entrenado, sino un sistema de software que orquesta la ejecución de un LLM externo (Nemotron vía Ollama). Su arquitectura se compone de varias capas: una capa de persona EmojiCode que controla el estilo y postura del agente, un extractor de tokens de syscall (co-strings) que interpreta las peticiones del modelo, y una serie de gates independientes: Tau Prolog (en navegador) o SWI-Prolog (en local) para validar políticas, Lean 4 para verificar pruebas matemáticas, y un sistema de recibos WORM (write-once-read-many) con hash SHA-256/BLAKE3. No hay entrenamiento involucrado; el harness se configura mediante reglas Prolog y scripts de construcción.

La innovación técnica principal es el patrón de "gates" que separan la emisión de intenciones del LLM de la autorización de ejecución. El modelo solo puede solicitar acciones mediante tokens específicos (por ejemplo, `<|bash_exec|>`, `<|lean_gate|>`), y cada token es validado por un gate externo que decide si la acción es permitida, requiere aprobación, o debe sellarse con un recibo. Esto elimina la posibilidad de que el modelo ejecute acciones no autorizadas o invente resultados, ya que la verificación se realiza fuera del contexto del LLM.

## Capacidades

- Generacion de texto y razonamiento: depende del modelo base Nemotron, pero el harness añade control de persona y restricciones de ejecución.
- Tool calling / function calling: el harness define un conjunto de syscall tokens que el modelo puede emitir para solicitar acciones (búsqueda web, ejecución de shell, lectura/escritura de archivos, verificación Lean, etc.).
- Agentes y multi-step reasoning: el flujo permite encadenar múltiples pasos, cada uno validado por los gates correspondientes, con registro de recibos para reproducibilidad.
- Verificación formal: integra Lean 4 para comprobar pruebas matemáticas (solo el gate local puede declarar `PROVED`; el gate de navegador solo hace escaneo estático).
- Políticas simbólicas: usa Prolog (Tau Prolog en navegador, SWI-Prolog en local) para validar permisos de syscalls, estados de persona y reglas de ejecución.
- Receipts y auditoría: genera sellos SHA-256/BLAKE3 de cada acción, permitiendo reproducción determinista y auditoría posterior.
- Modo navegador (GitHub Pages) y modo local: el primero demuestra el flujo con gates simulados; el segundo ejecuta realmente los gates contra el sistema.

## Casos de uso

- Verificación de pruebas matemáticas en proyectos Lean: el harness permite que un agente LLM proponga pasos de prueba, pero solo el gate local Lean puede confirmar `PROVED` tras ejecutar `lake build` y escanear marcadores de deuda (`sorry`, `admit`, `axiom`, `opaque`). Útil para desarrolladores que necesitan garantías formales en código.
- Automatización de tareas de desarrollo con control de permisos: un agente puede leer archivos, ejecutar builds y hacer commits, pero cada acción pasa por el gate Prolog que decide si está permitida. Por ejemplo, `file_write` requiere aprobación explícita, evitando modificaciones no deseadas.
- Búsqueda web controlada para investigación: el syscall `<|tavily_search|>` o `<|google_search|>` permite al agente recuperar información, pero el resultado se etiqueta como "quarantine" si no cumple las políticas de retrieval, evitando que el modelo use datos no verificados.
- Auditoría de acciones de agentes autónomos: el sistema de recibos WORM permite reproducir exactamente qué hizo el agente, con qué entradas y qué salidas, lo que es crítico en entornos regulados o de alta responsabilidad.
- Entrenamiento de agentes con políticas simbólicas: los desarrolladores pueden definir reglas Prolog complejas (por ejemplo, "no ejecutar `bash_exec` sin aprobación de dos niveles") y probarlas en el modo navegador antes de desplegarlas en local.
- Integración en pipelines de CI/CD con verificación formal: el gate Lean puede integrarse en un pipeline para comprobar que los cambios no introducen `sorry` o `axiom` no deseados, y el gate Prolog puede validar que los comandos de build/test están permitidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El harness no es un modelo de lenguaje, por lo que no tiene métricas de MMLU, HumanEval, etc. El rendimiento depende del modelo base Nemotron subyacente y de la latencia de los gates externos (Prolog, Lean, red).

## Requisitos de hardware

- No hay requisitos específicos para el harness en sí, ya que es software de orquestación.
- Los requisitos de hardware dependen del modelo base Nemotron que se ejecute vía Ollama. Para modelos pequeños (7B-13B) puede bastar una GPU consumer (RTX 3060 o superior) con 8-16 GB de VRAM; para modelos grandes (70B) se necesitan GPUs de datacenter (A100, H100) o cuantización agresiva.
- El modo navegador (GitHub Pages) no requiere hardware especial, solo un navegador moderno con soporte WASM para Tau Prolog.
- El modo local requiere una instalación de SWI-Prolog, Lean 4 (con `lake`), y acceso a herramientas de shell (curl, bash) según las políticas definidas.
- Opciones de despliegue: el harness se ejecuta como un script local o como una página estática; no está pensado para despliegue en servidores de inferencia como vLLM o TGI, sino como un front-end de control sobre Ollama.

## Comparativa con modelos similares

No disponible. Este proyecto no es un modelo de lenguaje comparable con otros LLMs; es un sistema de control para agentes. No existen alternativas directas en el ecosistema de modelos open source con el mismo enfoque de gates Prolog/Lean y recibos WORM.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto por sí mismo; depende de un modelo base Nemotron externo.
- La seguridad depende de la correcta configuración de las políticas Prolog y de los gates; una configuración incorrecta puede permitir acciones no deseadas.
- El gate de navegador (Tau Prolog) solo hace escaneo estático de Lean; no puede verificar pruebas reales, solo clasificar archivos como `CLEAN_SCAN`, `SPEC` o `WARNING`.
- El gate local Lean requiere que el usuario tenga instalado Lean 4 y `lake`; si no, la verificación no se puede realizar.
- Los recibos WORM son inmutables, pero la reproducción determinista depende de que el entorno (versiones de herramientas, estado del sistema) sea idéntico.
- No hay información sobre licencia del harness; el autor no la ha especificado en la model card.
- El proyecto está en fase temprana (creado en septiembre de 2026) y no tiene descargas ni likes, lo que sugiere que no ha sido probado ampliamente.

## Enlaces

- [HuggingFace: Snapkitty/snapkitty-nemotron-harness](https://huggingface.co/Snapkitty/snapkitty-nemotron-harness)
