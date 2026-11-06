# moeshawky/Azrael-9b-chat-template

## Resumen

`moeshawky/Azrael-9b-chat-template` no es un modelo de lenguaje en sentido estricto, sino una plantilla de chat Jinja (13.326 bytes) publicada en Hugging Face bajo el identificador de repositorio del autor `moeshawky`. Su función es definir el formato de cable (wire format) con el que se serializan las conversaciones, los turnos del asistente, las llamadas a herramientas y el prompt de generación al servir el modelo `moeshawky/Azrael-ternary-9B`, una cuantización ternaria en GGUF derivada de `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`.

La plantilla declara paridad byte a byte con la plantilla oficial de Xiaomi MiMo en los turnos del asistente, las llamadas a herramientas, los turnos de herramienta y el prompt de generación, de modo que los parsers `--reasoning-parser mimo` y `--tool-call-parser mimo` mantienen su contrato en vLLM y SGLang. Sobre esa base, el autor añade prosa de sistema propia (priming de razonamiento, instrucciones de concisión y endurecimiento de respuestas) que los parsers no leen, lo que la convierte en una variante de comportamiento más que en un cambio de protocolo.

El interés actual del repositorio es operativo: permite arrancar un modelo MiMo de 9B con tool calling y modo de razonamiento conmutables mediante `chat_template_kwargs`, sin reescribir el parser del servidor. El autor advierte explícitamente de que los efectos de comportamiento de la prosa inyectada están sin validar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | plantilla de chat Jinja (no es un modelo); modelo objetivo basado en transformer denso MiMo-V2.6-Distill-Qwen de 9B |
| Parametros totales | no disponible (el modelo objetivo se denomina 9B; el repositorio no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.000 tokens según la model card del objetivo ("262k ctx target model"); no verificado de forma independiente |
| Tipos de cuantizacion | ternaria (GGUF) en el modelo objetivo `Azrael-ternary-9B`; variante INT4 de `letechlead` mencionada como compatible |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el repositorio del modelo ternario etiqueta "English") |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica a la plantilla (archivo Jinja y variante en una línea para `tokenizer_config.json`); el modelo objetivo se distribuye en GGUF |

## Arquitectura y entrenamiento

El repositorio contiene una única plantilla Jinja de 13.326 bytes (9.872 bytes en su versión compacta de una línea, con sha256 `bd8c0e77…` y `b263dbe4…` respectivamente) que se renderiza en las rutas de vLLM, SGLang y llama.cpp. La plantilla se deriva de `chat_template.jinja` de `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` (sha `1f09ddcc`), leída íntegramente y comparada en renderizado. El autor mantiene el bloque `{% generation %}` por compatibilidad, aunque aclara que no constituye una receta de entrenamiento.

La innovación declarada es la separación entre "cable" y "cerebro": el formato de cable (turnos del asistente, llamadas a herramientas, turnos de herramienta y prompt de generación) es byte-idéntico al de MiMo, mientras que las piezas de comportamiento (priming de pensamiento, lenguaje conciso, endurecimiento y avisos ante errores consecutivos) viajan como prosa de sistema que los parsers ignoran. No hay datos publicados sobre volumen de entrenamiento, composición del dataset ni uso de RLHF o DPO en el modelo base; la model card no los recoge. La verificación se realiza con `python3 scripts/verify.py`, que el autor reporta como `46 passed, 0 failed`, incluyendo paridad de cable en seis familias de escenarios (generación con y sin thinking, conversaciones con herramientas incluyendo llamadas personalizadas y de entrada, partes multimodales, herramientas a nivel de mensaje y variantes de esfuerzo).

## Capacidades

- Renderizado de conversaciones multi-turno con roles de sistema, usuario, asistente y herramienta.
- Emisión de turnos del asistente con razonamiento adyacente en la forma `<think>{reasoning}</think>{content}`, con `<think></think>` vacío cuando no hay razonamiento.
- Soporte de tool calling con etiquetas compactas `<tool_call>/<function>/<parameter>` sin saltos de línea internos, compatible con los parsers `mimo` de vLLM y SGLang.
- Turnos de herramienta como paso directo de rol (`<|im_start|>tool\n{output}<|im_end|>`), sin envoltorio `<tool_response>`.
- Conmutación de modo de pensamiento mediante `enable_thinking` (por defecto `true`).
- Ajuste de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` (por defecto), `xhigh`, alias `high`, y `none`/`off` para desactivar el pensamiento.
- Desactivación automática del pensamiento cuando hay herramientas presentes mediante `auto_disable_thinking_with_tools`.
- Control de prosa inyectada mediante `priming` y `terse` (ambos por defecto `true`).
- Soporte declarado de partes multimodales en el renderizado, aunque el modelo objetivo es de texto.
- No se declaran capacidades de visión, audio ni multilingüismo verificado más allá de lo que herede el modelo base.

## Casos de uso

- Despliegue de agentes con tool calling sobre vLLM o SGLang: la plantilla permite arrancar `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` con `--reasoning-parser mimo --tool-call-parser mimo` sin modificar el parser del servidor, manteniendo el contrato de cable en cada turno de herramienta.
- Servicio de un modelo ternario en GGUF con llama.cpp: para `Azrael-ternary-9B` se usa la ruta `--template` con este archivo o la versión en una línea embebida en `tokenizer_config.json`, lo que facilita distribuir un único artefacto de plantilla junto a los pesos cuantizados.
- Alternancia de modo de razonamiento por petición: en un endpoint de atención al cliente se puede enviar `enable_thinking=false` para consultas simples y `true` para casos que requieran cadena de pensamiento, reduciendo latencia y coste en el primer caso mediante `chat_template_kwargs`.
- Ajuste de verbosidad en producción: con `terse=true` se fuerza un estilo conciso en las respuestas, útil en interfaces de chat con espacio limitado o en respuestas para canal de voz.
- Integración en pipelines de CI/CD para validación de plantillas: el script `verify.py` y la comprobación de sha256 permiten fijar la plantilla en un repositorio y detectar regresiones de formato antes de desplegar un cambio de parser.
- Evaluación comparativa de variantes de plantilla: al mantener el cable idéntico a MiMo y permitir apagar la prosa con `priming=false`, sirve para aislar el efecto de las instrucciones de sistema en pruebas A/B sobre el mismo checkpoint.
- Sustitución de plantilla en despliegues existentes de MiMo: apuntar `--chat-template-path` a este archivo en vLLM permite probar el comportamiento "Sharper" sin cambiar de modelo ni de parser.

## Benchmarks y rendimiento

La model card incluye métricas de la propia plantilla y puntuaciones del checkpoint upstream, que el autor advierte que no son resultados de esta plantilla.

| Metrica | Valor | Condiciones |
|---|---|---|
| Bytes de plantilla (jinja) | 13.326 B | sha256 `bd8c0e77…` |
| Bytes de plantilla (una linea) | 9.872 B | sha256 `b263dbe4…` |
| Paridad de cable | byte-identica en 6 familias de escenarios | jinja2 3.1.6, entorno estilo transformers |
| Coste de renderizado | lineal con la longitud de la conversacion; sin pasada de truncado | objetivo de 262k de contexto |
| Comprobaciones de verificacion | 46/46 pasan; `check_applied.py` = APPLIED | 2026-11-06, 15:03–15:04 UTC |
| Sonda de renderizado | `render_bytes=1219` con `messages=[user "hi"]` y `add_generation_prompt=True` | esta sesion |

Puntuaciones del checkpoint upstream reportadas por el autor (no de esta plantilla):

| Benchmark upstream | Puntuacion SFT |
|---|---|
| SWE-bench Verified (avg@3) | 61,1 |
| SWE-bench Pro (avg@3) | 44,6 |
| MiMo Cyber (mini, avg@3) | 31,3 |

No se han publicado resultados de benchmarks propios de esta plantilla en la informacion disponible.

## Requisitos de hardware

- No aplica directamente: la plantilla no consume VRAM. Los requisitos dependen del modelo servido.
- Para el modelo objetivo de 9B en cuantización ternaria GGUF, la VRAM estimada es notablemente inferior a la de un 9B en FP16; el repositorio no publica cifras concretas de memoria.
- GPU recomendadas para servir el modelo objetivo: no disponibles en la información proporcionada. Para un 9B en FP16 se requerirían en torno a 18-20 GB de VRAM, pero la cuantización ternaria reduce esa cifra de forma sustancial.
- Opciones de despliegue verificadas: SGLang y vLLM (ruta Jinja verificada). llama.cpp y node-llama-cpp figuran como no verificados por el autor, que los marca explícitamente como promesas y no como pruebas superadas.
- Latencia y throughput: no disponibles. El autor solo indica que el coste de renderizado es lineal con la longitud de la conversación y que no hay pasada de truncado.

## Comparativa con modelos similares

| Plantilla / modelo | Tipo | Contexto | Tool calling | Licencia | Estado de verificacion |
|---|---|---|---|---|---|
| `moeshawky/Azrael-9b-chat-template` | Plantilla Jinja sobre MiMo 9B | 262k (objetivo) | Si, parser `mimo` | Apache 2.0 | Verificada en SGLang y vLLM; llama.cpp no verificada |
| `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` (plantilla oficial) | Plantilla Jinja upstream | 262k | Si, parser `mimo` | no disponible en la informacion | Referencia de paridad byte a byte |
| `moeshawky/Azrael-ternary-9B` | Modelo ternario GGUF | no disponible | Hereda del base | Apache 2.0 | Modelo, no plantilla |
| Variante INT4 de `letechlead` | Cuantizacion INT4 | no disponible | Hereda del base | no disponible | Mencionada como compatible |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El comportamiento de la prosa inyectada (priming, terse, hardening) está declarado como UNVALIDATED por el propio autor: no hay beneficio medido y desplaza la distribución respecto al SFT original, que se entrenó sin prosa inyectada.
- `reasoning_effort` está fijado como comportamiento de renderizado en `verify.py`, pero su efecto sobre el modelado es una hipótesis, no un resultado medido.
- `priming=false` no equivale a la plantilla original de MiMo: el endurecimiento y el bloque terse permanecen activos, por lo que no sirve como control exacto en experimentos.
- Las rutas de llama.cpp y node-llama-cpp están sin verificar; los constructos `namespace()` y `{% generation %}` son los puntos de riesgo señalados por el autor.
- El bloque `{% generation %}` se conserva por compatibilidad, no como receta de entrenamiento; no debe usarse para enmascarar tokens en fine-tuning.
- No se replica el comportamiento de Qwen3 (froggeric); el alcance se limita a la línea MiMo.
- El repositorio no declara lista de idiomas; el modelo ternario asociado etiqueta únicamente "English", lo que sugiere un soporte multilingüe limitado o no documentado.
- No hay información sobre sesgos, tasa de alucinación ni evaluación de seguridad del modelo objetivo en la documentación disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni issues que permitan contraste independiente.
- Licencia Apache 2.0 permite uso comercial, pero al ser una plantilla sobre un modelo de terceros conviene verificar la licencia del checkpoint base antes de producción.

## Enlaces

- Repositorio de la plantilla: https://huggingface.co/moeshawky/Azrael-9b-chat-template
- Modelo ternario objetivo: https://huggingface.co/moeshawky/Azrael-ternary-9B
- Árbol de archivos del modelo ternario: https://huggingface.co/moeshawky/Azrael-ternary-9B/tree/main
- Modelo base upstream: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
