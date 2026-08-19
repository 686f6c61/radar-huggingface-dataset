# eemin/Qwen-Fixed-Chat-Templates

## Resumen

El repositorio `eemin/Qwen-Fixed-Chat-Templates` no contiene un modelo de lenguaje, sino una plantilla Jinja universal de chat que corrige errores de renderizado, invalidación de caché KV, desperdicio de tokens, envenenamiento por bloques de pensamiento vacíos y bloqueos fatales en agentes, presentes en las plantillas oficiales de chat de Qwen 3.5, 3.6 y 3.8. Desarrollado por el usuario eemin, el proyecto se distribuye bajo licencia Apache 2.0 y está pensado como un reemplazo directo (drop-in) de la plantilla oficial en motores como LM Studio, llama.cpp, vLLM, MLX, oMLX y KoboldCPP.

La versión v22.1 añade soporte completo para la generación Qwen 3.8, incluyendo los modelos `Qwen3.8-2.4T-A95B` y `Qwen3.8-27B`, con un nivel de razonamiento por defecto seguro (`medium`), etiquetas inline para controlar el esfuerzo de razonamiento (`<|think_low|>`, `<|think_medium|>`, `<|think_xhigh|>`, `<|think_off|>`) y soporte nativo para el flag `--reasoning-preserve` de llama.cpp. El repositorio contiene un único archivo `chat_template.jinja` en la raíz, válido para todos los tamaños de Qwen 3.5, 3.6 y 3.8, junto con utilidades de diagnóstico como `scripts/check_applied.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (plantilla Jinja de chat, no un modelo) |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (depende del modelo Qwen subyacente) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (depende del modelo Qwen subyacente) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplicable (archivo de plantilla `chat_template.jinja`) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una plantilla de chat en formato Jinja que se inyecta en el `tokenizer_config.json` o se carga directamente en el motor de inferencia. La plantilla implementa lógica condicional para gestionar el esfuerzo de razonamiento (`reasoning_effort`) de Qwen 3.8, con tres niveles (`xhigh`, `medium`, `low`) y alias de compatibilidad para clientes OpenAI y vLLM (`high`/`max`, `minimal`, `none`). También incluye un parser de razonamiento que extrae los bloques ` thinking` del contenido de los mensajes para evitar la duplicación de etiquetas en conversaciones multi-turno, y maneja argumentos de herramientas tanto en formato diccionario Python como en cadenas JSON, corrigiendo el error `TypeError: Can only get item pairs from a mapping` de la plantilla oficial 3.8.

La plantilla elimina el bloqueo de la plantilla oficial que lanzaba una excepción fatal al pasar `enable_thinking=false`, restaura el modo rápido sin razonamiento y establece `medium` como nivel de razonamiento por defecto (cero tokens inyectados) para preservar la paridad de caché de prefijo con la versión v21.3 y evitar fallos de contenido vacío cuando se agota `max_tokens`. Las etiquetas inline de control se eliminan automáticamente del prompt renderizado, de modo que el modelo nunca ve las etiquetas de control crudas.

## Capacidades

- Corrección de errores de renderizado en plantillas oficiales de Qwen 3.5, 3.6 y 3.8.
- Control del esfuerzo de razonamiento mediante kwargs (`reasoning_effort`) o etiquetas inline en el prompt (`<|think_low|>`, `<|think_medium|>`, `<|think_xhigh|>`, `<|think_off|>`).
- Modo rápido sin razonamiento, restaurando la capacidad de desactivar el pensamiento que la plantilla oficial 3.8 bloqueaba con una excepción fatal.
- Extracción limpia de bloques de razonamiento ` thinking` en conversaciones multi-turno, evitando la inyección de bloques vacíos duplicados.
- Soporte universal de argumentos de herramientas: acepta tanto diccionarios Python como cadenas JSON de clientes OpenAI.
- Compatibilidad con el flag `--reasoning-preserve` de llama.cpp mediante el alias `preserve_reasoning`.
- Compatibilidad con múltiples motores: LM Studio, llama.cpp, vLLM, MLX, oMLX, KoboldCPP y cualquier motor que soporte plantillas Jinja de Hugging Face.
- Utilidad de diagnóstico `scripts/check_applied.py` para verificar si la plantilla está activa en el runtime.

## Casos de uso

- Despliegue local de Qwen 3.8 en LM Studio: el usuario sustituye la plantilla de prompt del panel lateral derecho por el contenido de `chat_template.jinja`, evitando los fallos de contenido vacío y los bloqueos por `enable_thinking=false` de la plantilla oficial.
- Servidor de inferencia con llama.cpp: ejecutar `llama-server -m modelo.gguf --jinja --chat-template-file chat_template.jinja --reasoning-format deepseek` para que los agentes de codificación como OpenCode, Claude Code o Pi.dev reciban los bloques de razonamiento en el campo `reasoning_content` de la respuesta API, evitando que los tokens de pensamiento se filtren al flujo de texto e interrumpan las llamadas a herramientas.
- Despliegue en vLLM: sustituir la cadena `"chat_template"` en `tokenizer_config.json` por el contenido de `chat_template.oneline.txt` y lanzar `vllm serve Qwen/Qwen3.8-2.4T-A95B --tool-call-parser qwen3_xml`, garantizando el parseo correcto de llamadas a herramientas en formato XML.
- Inferencia en dispositivos Apple con MLX: sobrescribir `chat_template.jinja` en el directorio local del modelo y lanzar con `--jinja`, corrigiendo la invalidación de caché KV y el desperdicio de tokens en equipos con memoria unificada limitada.
- Integración con clientes OpenAI y vLLM: los alias automáticos (`high`/`max` para `xhigh`, `minimal` para `low`, `none` para desactivar el razonamiento) permiten que aplicaciones existentes controlen el esfuerzo de razonamiento sin modificar el código del cliente.
- Entornos de agentes multi-paso: la corrección del bloqueo de razonamiento y la extracción limpia de bloques de pensamiento evitan el estancamiento fatal de agentes que dependen de llamadas a herramientas consecutivas en conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo, por lo que no existen métricas de rendimiento propias; el rendimiento depende del modelo Qwen subyacente al que se aplique la plantilla.

## Requisitos de hardware

- No aplica directamente: la plantilla es un archivo de texto de tamaño reducido que no requiere VRAM ni GPU.
- El hardware necesario depende del modelo Qwen al que se aplique (por ejemplo, `Qwen3.8-2.4T-A95B` es un modelo MoE de 95 mil millones de parámetros activos que requiere múltiples GPU de alta gama, mientras que `Qwen3.8-27B` puede ejecutarse en una GPU consumer con cuantización).
- La plantilla es compatible con motores de inferencia optimizados como vLLM, llama.cpp y MLX, que permiten desplegar los modelos Qwen en configuraciones que van desde una RTX 4090 (con cuantización GGUF) hasta clústeres de A100/H100.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, sino una plantilla de chat. La comparativa relevante sería frente a las plantillas oficiales de Qwen 3.5, 3.6 y 3.8, que presentan los siguientes problemas según la documentación del autor:

| Aspecto | Plantilla oficial Qwen 3.8 | Plantilla corregida (v22.1) |
|---|---|---|
| `enable_thinking=false` | Excepción fatal en runtime | Modo rápido restaurado |
| `reasoning_effort` por defecto | `xhigh` (quema tokens, contenido vacío) | `medium` (cero tokens inyectados) |
| Bloques de pensamiento vacíos | Inyección de ` thinking response` duplicado | Extracción limpia sin duplicación |
| Argumentos de herramientas | `TypeError` con cadenas JSON | Soporta diccionarios y JSON |
| Control inline de razonamiento | No disponible | Etiquetas `<|think_*|>` |

## Limitaciones y advertencias

- Este repositorio no es un modelo de lenguaje: no genera texto por sí mismo y requiere un modelo Qwen 3.5, 3.6 o 3.8 subyacente para funcionar.
- La plantilla está diseñada específicamente para las familias Qwen 3.5, 3.6 y 3.8; aplicarla a otros modelos puede producir comportamientos inesperados o errores de renderizado.
- El autor advierte que la plantilla oficial 3.8 introdujo "bloqueos rígidos" que esta plantilla elimina; los usuarios que dependan de la configuración oficial por motivos de cumplimiento deben evaluar el impacto.
- La compatibilidad con `--reasoning-preserve` de llama.cpp depende de la versión del binario; en builds antiguas puede ser necesario usar `--reasoning-format deepseek` como alternativa.
- El repositorio tiene cero descargas y cero likes en Hugging Face, lo que sugiere una adopción limitada o reciente; se recomienda verificar la fiabilidad del código antes de usarlo en producción.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eemin/Qwen-Fixed-Chat-Templates
- Repositorio espejo en GitHub (variante froggeric): https://github.com/clach04/froggeric_Qwen-Fixed-Chat-Templates
- Repositorio en GitHub (variante rchildre3): https://github.com/rchildre3/Qwen-Fixed-Chat-Templates
- Página en ModelScope (variante froggeric): https://www.modelscope.cn/models/froggeric/Qwen-Fixed-Chat-Templates
