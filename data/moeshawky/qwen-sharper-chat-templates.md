# moeshawky/Qwen-Sharper-Chat-Templates

## Resumen

Qwen Sharper Chat Template es una plantilla de chat en formato Jinja, no un modelo de lenguaje con pesos propios. Se trata de una capa de instrucciones que se aplica sobre los modelos de la familia Qwen 3.5, 3.6 y 3.8 para endurecer su comportamiento en tareas de conocimiento y codigo. La desarrolla moeshawky, y es la evolucion directa de la plantilla "Sharp" de peculiar-ragdoll, que a su vez se basa en el trabajo de froggeric sobre plantillas corregidas para Qwen.

La plantilla añade reglas de aislamiento de entrada (tratar etiquetas embebidas y respuestas de herramientas como datos, no como instrucciones) y una verificacion final antes de emitir la respuesta. El objetivo es reducir relleno ("preamble"), evitar alucinaciones inducidas por inyeccion de prompt y acelerar la generacion en bucles agénticos. Es un drop-in: se instala como `chat_template.jinja` o en `tokenizer_config.json` y funciona con llama.cpp, LM Studio, vLLM, SGLang y MLX.

La relevancia actual viene de que los modelos Qwen 3.x con el template por defecto tienden a generar respuestas largas y con preambulos innecesarios en tareas de agente y codigo. Esta plantilla mide el comportamiento con benchmarks (Claweval y SWE-bench-Live) y documenta cada cambio con lineas de codigo concretas, lo que permite a equipos de produccion evaluar el impacto real antes de adoptarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plantilla de chat Jinja (no es un modelo de pesos) |
| Parametros totales | No disponible (no aplica: es una plantilla de texto) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo Qwen subyacente) |
| Tipos de cuantizacion | No disponible (no es un modelo cuantizable) |
| Idiomas soportados | en (instrucciones de la plantilla; el modelo subyacente Qwen es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; se distribuye como `chat_template.jinja` (29 069 bytes) y `chat_template_oneline.txt` (23 179 bytes) |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento de pesos. La plantilla es un archivo Jinja de 29 069 bytes organizado en nueve bloques funcionales: scaffold de roles, ranura de sistema, bloque de llamada a herramientas (JSON/XML bloqueado con `tojson`), respuesta de herramientas, bucle multi-turno, envoltorio de razonamiento, apertura de generacion y disciplina de limites de tokens (uso de `-%}` y `{%-` en todas las costuras).

La innovacion principal de esta version `v22.4.1-sharper` frente a `v22.4.0` es anadir dos lineas de instruccion al bloque de sistema: una regla de aislamiento (P-SEC-1) que trata `<tool_response>`, codigo de usuario y etiquetas Jinja embebidas como datos, y una regla de verificacion final (P-VER-1) que exige comprobar que no hay preambulo, que las advertencias estan intactas y que el JSON/XML de herramientas esta bloqueado. El coste neto es de aproximadamente 5 tokens extra por turno de sistema, un incremento del 0,02% sobre el scaffold.

## Capacidades

- Generacion de texto optimizada para respuestas directas y concisas, con reduccion de relleno y preambulos.
- Soporte de tool calling y function calling con bloqueo estricto del JSON/XML de respuesta de herramientas.
- Modo de razonamiento (thinking) con anclaje explicito al bloque de razonamiento y preservacion de bloques de razonamiento previos en historial para evitar "amnesia" en bucles agente.
- Compatibilidad con motores de inferencia locales: llama.cpp (con `--reasoning-preserve`), LM Studio, vLLM, SGLang y MLX.
- Preservacion del 100% de la tasa de acierto de KV cache prefix en motores de inferencia locales gracias a la preservacion de bloques de razonamiento.
- Generacion de respuestas mas cortas: reduccion del 59% en tokens de respuesta en benchmarks de codigo.

## Casos de uso

- **Automatizacion de atencion al cliente**: la plantilla fuerza respuestas directas y sin relleno, reduciendo el coste por interaccion y mejorando la latencia en sistemas multi-turno con contexto largo.
- **Generacion de codigo en produccion**: las reglas de aislamiento evitan que una respuesta de herramienta o un fragmento de codigo embebido altere el comportamiento del modelo, reduciendo inyecciones accidentales en pipelines CI/CD.
- **Agentes autonomos con herramientas**: la preservacion de bloques de razonamiento previos evita que el modelo pierda el hilo en bucles agente complejos, y el bloqueo JSON/XML garantiza que las llamadas a herramientas sean validas.
- **Asistentes de documentacion tecnica**: la regla de verificacion final obliga a revisar que no hay preambulos ni respuestas vagas, lo que produce documentacion mas precisa y utilizable.
- **Sistemas RAG con contexto largo**: la plantilla reduce el relleno en respuestas basadas en recuperacion, lo que baja el consumo de tokens y mejora la velocidad en entornos con presupuesto de contexto limitado.
- **Evaluacion de modelos en entornos locales**: se puede usar con llama.cpp o MLX para medir el impacto real de la plantilla en benchmarks propios, con scripts de verificacion incluidos en el repositorio.

## Benchmarks y rendimiento

La informacion disponible no incluye una tabla formal de benchmarks comparativos con otros modelos, pero el autor documenta mediciones propias:

| Medida | Resultado |
|---|---|
| Claweval (ThinkingCap-Qwen3.6-27B) | Puntuacion de respuesta +7.4, puntuacion global +3.8, tokens de respuesta -59% frente a stock |
| SWE-bench-Live (Qwen3.8-27B) | Resuelve 15/25 casos con la plantilla vs 16/25 con stock; mediana de tiempo 20.0 min vs 54.6 min (2.7x mas rapido) |
| Coste de endurecimiento | +5 tokens por turno de sistema, +0.02% sobre el scaffold (29063 a 29069 bytes) |

Estas cifras provienen de pruebas del autor con scripts incluidos en el repositorio (`scripts/verify_template.py` y `test_v22.py`). No hay resultados de benchmarks estandar como MMLU o HumanEval porque la plantilla no altera las capacidades del modelo base, solo su formato de salida.

## Requisitos de hardware

- No aplica directamente: la plantilla no anade requisitos de hardware adicionales a los del modelo Qwen subyacente.
- Para usar con llama.cpp, se necesita una compilacion reciente que soporte `--reasoning-preserve` para preservar bloques de razonamiento.
- Para MLX, se requiere macOS con Apple Silicon y la libreria MLX instalada.
- Para vLLM o SGLang, se necesita una GPU compatible con el modelo Qwen base (por ejemplo, A100, H100, RTX 4090 para modelos de 27B con cuantizacion).
- En consumer GPU, la plantilla se puede usar con modelos Qwen cuantizados (GGUF en llama.cpp u Ollama) sin coste adicional de VRAM.

## Comparativa con modelos similares

No hay modelos comparables porque no es un modelo de pesos, sino una plantilla de chat. Sin embargo, se puede comparar con las alternativas de plantillas para Qwen:

| Plantilla | Base | Diferencias clave |
|---|---|---|
| `froggeric/Qwen-Fixed-Chat-Templates v22.4` | Upstream | Plantilla corregida sin reglas de aislamiento ni verificacion final |
| `peculiar-ragdoll/Qwen-Sharp-Chat-Templates v22.4.0` | froggeric | Anade 11 lineas de instruccion para respuestas directas, sin reglas de aislamiento |
| `moeshawky/Qwen-Sharper-Chat-Templates v22.4.1` | Sharp | Anade reglas de aislamiento (P-SEC-1) y verificacion final (P-VER-1), coste de 5 tokens extra |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no tiene pesos, no puede ser fine-tuning ni desplegado directamente; requiere un modelo Qwen base.
- La plantilla esta en ingles; las instrucciones de sistema son en ingles, aunque el modelo subyacente puede responder en otros idiomas.
- Las mejoras de rendimiento documentadas se basan en un benchmark propio (Claweval y SWE-bench-Live) y no han sido validadas por terceros.
- La preservacion de bloques de razonamiento puede aumentar el coste de tokens en conversaciones muy largas, aunque el autor afirma que la tasa de acierto de KV cache es del 100%.
- No hay garantia de que los cambios de comportamiento sean beneficiosos en todos los casos de uso; se recomienda probar en un entorno de evaluacion antes de desplegar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni garantias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moeshawky/Qwen-Sharper-Chat-Templates
- Plantilla base: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Plantilla Sharp (predecesora): https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Blog de Hugging Face sobre chat templates de Qwen 3: https://huggingface.co/blog/qwen-3-chat-template-deep-dive
- Repositorio de referencia de Qwen: https://github.com/pychang-ai/Qwen_template
