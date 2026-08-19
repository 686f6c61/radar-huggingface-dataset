# sanjxz/Ling-3.0-Flash-Agentic-Chat-Template-Jinja

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una plantilla de chat en formato Jinja para el modelo Ling 3.0 flash de inclusionAI. Desarrollada por el usuario sanjxz como un fork de las plantillas corregidas de froggeric para Qwen, esta plantilla proporciona el formato de conversación nativo del modelo Ling 3.0 flash, con mejoras de seguridad y robustez para entornos agénticos. El modelo base, Ling 3.0 flash, es un modelo de mezcla de expertos (MoE) con 124 mil millones de parámetros totales y 5,1 mil millones activos, con una ventana de contexto nativa de 256K tokens ampliable hasta 1M.

La relevancia de esta plantilla radica en que permite desplegar el modelo con motores como llama.cpp, vLLM o MLX utilizando el formato correcto de tokens y con protecciones contra bucles de herramientas, fallos de ejecución y manipulaciones de tokens de pensamiento. Está diseñada para ser un reemplazo directo (drop-in) de la plantilla original, manteniendo compatibilidad con el esquema de tokens `<system>`, `<user>` y `<assistant>` del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plantilla Jinja (no aplica al modelo) |
| Parametros totales | No aplica (es una plantilla, no un modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo base; Ling 3.0 flash tiene 256K nativos ampliables a 1M) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (plantilla); el modelo base soporta multiples idiomas |
| Licencia | MIT |
| Formato de pesos | No aplica (archivo `.jinja`) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una plantilla de chat que define cómo formatear las conversaciones para el modelo Ling 3.0 flash. La plantilla incorpora varias innovaciones técnicas orientadas a entornos agénticos:

- **Bucle de guardia escalonado**: ante fallos consecutivos de herramientas, la plantilla genera avisos progresivos (nudge → warn → hard halt) y, en el cierre duro, reemplaza el bloque de herramientas disponibles por un aviso de suspensión para impedir que el modelo emita llamadas a herramientas.
- **Deteccion de repeticion o ping-pong**: identifica patrones de alternancia A-B-A-B comparando nombre y argumentos de herramientas en una ventana de dos turnos.
- **Heuristicas de fallo en cuatro niveles**: clasifica errores en duros, de harness, genericos y de permisos, con escapes para falsos positivos como `$ ` (shell) y `took ` (timing).
- **Endurecimiento de seguridad**: solo los mensajes de sistema/desarrollador pueden activar o desactivar el modo de pensamiento; los tokens `<|think_off|>` y `<|think_on|>` se eliminan de la salida de herramientas no confiables.
- **Integracion con harness**: disparo estructural de herramientas de habilidad, advertencias de herramientas desaparecidas, inyeccion de fecha `strftime_now`, desempaquetado de envoltorios OpenAI `{"type":"function",…}` y truncamiento de respuestas de herramientas.

El modelo base Ling 3.0 flash, desarrollado por inclusionAI, es un MoE con 124B parametros totales y 5,1B activos, entrenado con una ventana de contexto de 256K tokens. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineacion en la informacion proporcionada.

## Capacidades

- Formateo de conversaciones multi-turno en el esquema nativo de tokens de Ling 3.0 flash (`<system>`, `<user>`, `<assistant>`).
- Soporte de llamadas a herramientas (function calling) con formato XML, donde los argumentos se representan como pares `<arg_key>`/`<arg_value>`.
- Soporte del rol `developer` de la API de OpenAI, que se pliega dentro de `<system>`: un mensaje `developer` inicial se convierte en el mensaje de sistema, y los mensajes intermedios se renderizan como `<system>…</system>`.
- Control del modo de pensamiento (`thinking on/off`) restringido a mensajes de sistema/desarrollador.
- Deteccion de bucles de herramientas y suspension automatica de herramientas en caso de fallos repetidos.
- Compatibilidad con motores que soporten runtime HuggingFace-Jinja (minja), como llama.cpp, LM Studio, MLX y vLLM.
- Preservacion de razonamiento con presupuesto de tokens (`--reasoning-preserve` y `--reasoning-budget` en llama.cpp).

## Casos de uso

- **Despliegue de Ling 3.0 flash en produccion con llama.cpp**: usar la plantilla con `--chat-template-file` y `--jinja` para garantizar el formato correcto de la conversacion, evitando errores de tokenizacion y alucinaciones de formato.
- **Agentes autonomos con herramientas**: la plantilla incluye protecciones contra bucles de herramientas y errores de ejecucion, lo que la hace adecuada para agentes que interactuan con APIs, ejecutan comandos o consultan bases de datos.
- **Asistentes de chat con rol developer**: aplicaciones que usan la API de OpenAI con mensajes `developer` pueden integrar esta plantilla para que el modelo distinga correctamente entre instrucciones de sistema y contenido de usuario.
- **Razonamiento con presupuesto controlado**: junto con las opciones de llama.cpp `--reasoning-preserve` y `--reasoning-budget`, la plantilla permite limitar el gasto de tokens en cadenas de pensamiento, util para entornos con restricciones de latencia o coste.
- **Integracion en pipelines de MLX o vLLM**: al ser un archivo Jinja estandar, se puede cargar en cualquier motor con runtime minja, facilitando el despliegue en entornos Apple Silicon o en servidores con vLLM.
- **Desarrollo de aplicaciones multilingues**: aunque la plantilla esta en ingles, el modelo base soporta multiples idiomas, por lo que puede usarse en asistentes de atencion al cliente o generacion de contenido en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se proporcionan requisitos de hardware especificos para la plantilla. Al ser un archivo de texto, no requiere recursos de computacion propios. Sin embargo, el modelo base Ling 3.0 flash (124B parametros totales, 5,1B activos) requiere una GPU con suficiente VRAM para inferencia; no se indican cifras concretas en la informacion disponible. Se recomienda consultar la documentacion oficial de inclusionAI para conocer los requisitos exactos.

## Comparativa con modelos similares

La plantilla se compara con la plantilla original de Ling 3.0 flash y con la plantilla corregida de Qwen de froggeric, de la cual deriva:

| Caracteristica | Ling 3.0 flash original | Plantilla de sanjxz (este repo) | Plantilla Qwen de froggeric |
|---|---|---|---|
| Bucle de guardia escalonado | No | Si | Si |
| Suspension de herramientas en cierre duro | No | Si | Si |
| Deteccion de repeticion/ping-pong | No | Si | Si |
| Heuristicas de fallo en cuatro niveles | No | Si | Si |
| Soporte de rol developer | No | Si | Si |
| Formato XML de herramientas | No | Si (por defecto) | Si |
| Compatibilidad con motores minja | Si | Si | Si |

La plantilla de sanjxz es una adaptacion de la de froggeric al esquema de tokens de Ling, por lo que hereda todas las mejoras agénticas. La plantilla original de Ling es minima y carece de estas protecciones.

## Limitaciones y advertencias

- La plantilla requiere motores con soporte de Jinja (minja); versiones antiguas de llama.cpp pueden no ser compatibles.
- El ejemplo de comando en la model card menciona "Laguna S 2.1" y rutas de Windows, lo que puede confundir al usuario; verificar que el nombre del modelo base es Ling 3.0 flash y adaptar las rutas al entorno.
- Este repositorio solo contiene la plantilla; el modelo base debe descargarse por separado desde inclusionAI.
- La plantilla esta diseñada para el esquema de tokens de Ling 3.0 flash; usarla con otros modelos puede producir resultados incorrectos.
- La licencia MIT permite uso comercial de la plantilla, pero la licencia del modelo base puede tener restricciones adicionales; consultar la documentacion de inclusionAI.
- Las protecciones de seguridad (suspension de herramientas, stripping de tokens de pensamiento) pueden interferir con flujos de trabajo que requieran control total sobre las llamadas a herramientas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/sanjxz/Ling-3.0-Flash-Agentic-Chat-Template-Jinja
- Modelo base Ling 3.0 flash: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Documentacion de Ant Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Repositorio de plantillas de chat: https://github.com/jndiogo/LLM-chat-templates
