# arbv/gpt-oss-fixed-jinja-template

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una plantilla de chat (chat template) en formato Jinja2, endurecida y corregida, para los modelos GPT-OSS de OpenAI (variantes de 20B y 120B parámetros). La plantilla original de OpenAI presentaba fallos en casos límite, como errores de tipo `TypeError` al concatenar valores `null` en los campos de contenido y razonamiento, o `IndexError` cuando el array de `tool_calls` estaba vacío. Esta versión, desarrollada por arbv, integra correcciones y optimizaciones provenientes de las versiones de Unsloth y ggml-org, y añade comprobaciones de seguridad adicionales para prevenir inyección de prompts y contrabando de tokens entre roles.

La relevancia de esta plantilla radica en que el formato de chat es un componente crítico para el correcto funcionamiento de los modelos GPT-OSS en producción. Un template defectuoso puede provocar respuestas malformadas, crashes o vulnerabilidades de seguridad. Esta versión ofrece un control fino sobre el estilo de razonamiento del modelo mediante el parámetro `dense_reasoning`, y permite desactivar las comprobaciones de seguridad con `allow_injection` si el caso de uso lo requiere. Está publicada bajo licencia Apache 2.0 y ha sido probada principalmente en `llama.cpp`, aunque debería funcionar en cualquier entorno que soporte Jinja2 con la función `is string`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (plantilla de chat Jinja2, no un modelo) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo GPT-OSS subyacente) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (depende del modelo GPT-OSS) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (archivo de plantilla `.jinja`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una plantilla de formato de conversación. La plantilla se basa en la versión original de OpenAI para GPT-OSS, incorporando las optimizaciones y correcciones de la versión de Unsloth y de la implementación de ggml-org en `llama.cpp`. La principal innovación técnica es la adición de comprobaciones de seguridad activas por defecto que impiden la inyección de prompts y el contrabando de tokens entre roles (system, user, assistant, tool). Además, introduce un parámetro `dense_reasoning` (activado por defecto) que modifica el prompt de sistema para inducir un estilo de razonamiento más denso y menos verboso, especialmente efectivo en la variante de 120B. El parámetro `allow_injection` permite desactivar las comprobaciones de seguridad si el despliegue lo requiere.

## Capacidades

- Corrección de errores de ejecución: elimina los `TypeError` causados por concatenación de valores `null` en los campos `content` y `thinking`, y los `IndexError` producidos por arrays vacíos en `tool_calls`.
- Prevención de inyección de prompts: comprobaciones de seguridad que detectan y neutralizan intentos de inyección en todos los roles, activas por defecto.
- Control del estilo de razonamiento: el parámetro `dense_reasoning` (por defecto `true`) ajusta el prompt para que el modelo razone de forma más concisa, reduciendo la verbosidad.
- Compatibilidad con el formato de armonía (harmony) de GPT-OSS: la plantilla aplica el formato de respuesta esperado por los modelos GPT-OSS, incluyendo los campos de razonamiento y herramientas.
- Soporte de tool calling: maneja correctamente los arrays de `tool_calls`, incluso cuando están vacíos, evitando crashes.
- Flexibilidad de configuración: los parámetros `allow_injection` y `dense_reasoning` se pueden ajustar mediante kwargs en la llamada a la plantilla.

## Casos de uso

- Despliegue de GPT-OSS en producción con `llama.cpp`: la plantilla garantiza que las conversaciones multi-turno con herramientas se formateen correctamente, evitando fallos intermitentes que afectarían a la estabilidad del servicio.
- Integración en pipelines de agentes con tool calling: al manejar correctamente los arrays de `tool_calls` vacíos y los campos `null`, es adecuada para agentes que realizan múltiples llamadas a herramientas en secuencia, donde la robustez del formato es crítica.
- Sistemas de atención al cliente con contexto largo: al evitar errores de concatenación en campos de razonamiento, permite mantener conversaciones extensas sin corrupción del mensaje.
- Entornos de seguridad exigentes: las comprobaciones anti-inyección integradas son útiles en aplicaciones donde el usuario final puede intentar manipular el prompt del sistema, como chatbots públicos o asistentes de soporte.
- Ajuste del comportamiento de razonamiento: el parámetro `dense_reasoning` permite configurar el equilibrio entre latencia y calidad del razonamiento, útil en aplicaciones con requisitos de tiempo de respuesta estrictos.
- Migración desde versiones anteriores de la plantilla: organizaciones que ya usan GPT-OSS con plantillas previas pueden adoptar esta versión para corregir bugs conocidos y mejorar la seguridad sin cambiar el resto de la infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una plantilla de formato, su rendimiento no es directamente medible con métricas de calidad de modelo; su impacto se evalúa en términos de estabilidad y seguridad del despliegue.

## Requisitos de hardware

No aplica directamente, ya que la plantilla no requiere hardware propio. Los requisitos de hardware dependen del modelo GPT-OSS que se utilice (20B o 120B). Para referencia:

- GPT-OSS 20B: requiere aproximadamente 40 GB de VRAM en FP16, o unos 20 GB en cuantización Q4_K_M. Puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) con cuantización.
- GPT-OSS 120B: requiere aproximadamente 240 GB de VRAM en FP16, o unos 70 GB en cuantización Q4_K_M. Necesita GPUs de datacenter como A100 80GB o H100, o múltiples GPUs.
- La plantilla se ha probado en `llama.cpp`, pero es compatible con cualquier runtime que soporte Jinja2 (vLLM, Transformers, etc.).

## Comparativa con modelos similares

No se trata de un modelo, sino de una plantilla. La comparativa procede con otras implementaciones de la plantilla de chat para GPT-OSS:

| Implementacion | Origen | Correcciones incluidas | Seguridad anti-inyeccion | Control de razonamiento | Licencia |
|---|---|---|---|---|---|
| Plantilla original de OpenAI | OpenAI | Ninguna | No | No | MIT (modelo) |
| Plantilla de Unsloth | Unsloth | Optimizaciones y correcciones base | No | No | Apache 2.0 |
| Plantilla de ggml-org | llama.cpp | Correcciones para llama.cpp | No | No | MIT |
| Esta version (arbv) | arbv | Todas las anteriores + correcciones de casos límite | Si (activa por defecto) | Si (`dense_reasoning`) | Apache 2.0 |

## Limitaciones y advertencias

- Solo ha sido probada en `llama.cpp`; aunque debería funcionar en otros entornos con Jinja2, no hay garantía de compatibilidad total con todos los runtimes.
- Las comprobaciones de seguridad pueden interferir con casos de uso legítimos que requieran inyección controlada (por ejemplo, en pruebas o entornos de desarrollo); se pueden desactivar con `allow_injection=true`, pero esto reduce la protección.
- El parámetro `dense_reasoning` está optimizado para la variante de 120B; en la de 20B puede no producir el efecto deseado.
- Al ser una plantilla, no aporta ninguna capacidad nueva al modelo subyacente; su utilidad depende completamente de que se use con GPT-OSS.
- La licencia Apache 2.0 permite uso comercial, pero el modelo GPT-OSS en sí tiene su propia licencia (MIT para pesos, aunque con condiciones específicas de uso).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/arbv/gpt-oss-fixed-jinja-template
- Plantilla original de Unsloth: https://huggingface.co/unsloth/gpt-oss-120b/blob/main/chat_template.jinja
- Implementación de ggml-org en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/models/templates/openai-gpt-oss-120b.jinja
- Repositorio oficial de GPT-OSS de OpenAI: https://github.com/openai/gpt-oss
- Guía de ejecución de Unsloth para GPT-OSS: https://unsloth.ai/docs/models/gpt-oss-how-to-run-and-fine-tune
- Harness de inferencia burrito-core (compatible con esta plantilla): https://github.com/iamskeole/burrito-core
