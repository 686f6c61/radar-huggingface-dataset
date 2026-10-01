# apuebla/DeepSeek-Sharp-Chat-Templates

## Resumen

DeepSeek-Sharp-Chat-Templates no es un modelo de lenguaje, sino una plantilla de chat Jinja reutilizable para modelos instruct de la familia DeepSeek. La publica el usuario apuebla bajo licencia Apache 2.0 y su funcion es anadir un bloque de sistema de "terseness" (concision) que se concatena despues del system prompt propio del modelo, sin sustituirlo. El objetivo es reducir el relleno conversacional (preambulos, reformulaciones de la pregunta, transiciones vacias) manteniendo intactos los pasos esenciales, las advertencias y las incertidumbres.

El problema que aborda es concreto: en turnos largos de codigo y trabajo de conocimiento, los modelos DeepSeek tienden a gastar tokens en cortesia y repeticion hasta agotar el limite de salida a mitad de implementacion. La plantilla fuerza un estilo mas denso sin degradar la correccion, y segun el autor reduce el consumo de tokens entre un 40 % y un 56 % en tareas propensas al relleno.

Es relevante porque se integra como reemplazo directo en cualquier motor que cargue plantillas Jinja de Hugging Face (llama.cpp, vLLM, SGLang, MLX, LM Studio), sin reentrenar ni modificar pesos. Incluye un interruptor explicito (`terse: false`) para desactivar el comportamiento, y no altera los parametros de muestreo del modelo anfitrion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: es una plantilla de chat Jinja, no una red neuronal |
| Parametros totales | No aplica (los del modelo anfitrion) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica: heredada del modelo anfitrion |
| Tipos de cuantizacion | No aplica: la plantilla es texto, no contiene pesos |
| Idiomas soportados | No disponible (no se declara lista de idiomas; el comportamiento depende del modelo anfitrion) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; el artefacto es `chat_template.jinja` (formato de plantilla Jinja de Hugging Face) |

## Arquitectura y entrenamiento

El artefacto es una plantilla Jinja que define el formato de conversacion para modelos instruct de DeepSeek. Su mecanismo principal es la concatenacion forzada de un bloque de terseness despues del system prompt definido por el usuario o por el propio modelo. De este modo, las instrucciones originales se preservan y el bloque adicional actua como una capa de estilo superpuesta. La plantilla admite el parametro booleano `terse` a traves de `chat_template_kwargs`, de forma que puede desactivarse por peticion o editando el valor por defecto al principio del archivo.

No hay entrenamiento asociado: no se ha realizado ajuste fino, RLHF ni DPO. El autor reconoce que las pautas base de la plantilla (formato de herramientas, seguridad de la cache KV y escalado de errores) provienen del proyecto froggeric/Qwen-Fixed-Chat-Templates, y que el enfoque de concision se inspira en un proyecto de plantilla terse para Qwen. La efectividad del bloque se evaluo con un experimento ciego sobre seis tareas de codigo usando DeepSeek-Coder-V2-Lite como modelo anfitrion.

## Capacidades

- Aplicar un system prompt de concision a modelos instruct de DeepSeek sin reemplazar las instrucciones originales.
- Reducir el relleno conversacional en turnos de explicacion y razonamiento, preservando correccion, advertencias y pasos esenciales.
- Mantener el formato de herramientas (tool calling) del modelo anfitrion, heredado de las pautas base de la plantilla Qwen de referencia.
- Preservar la seguridad de la cache KV y el escalado de errores definidos en las pautas base.
- Activar o desactivar el modo terse por peticion mediante `chat_template_kwargs: {"terse": false}`.
- Funcionar en cualquier motor que cargue plantillas Jinja de Hugging Face: MLX, oMLX, llama.cpp, llama-server, koboldcpp, vLLM, SGLang y LM Studio.
- Forzar una pregunta aclaratoria directa cuando la peticion del usuario es genuinamente ambigua, en lugar de asumir una interpretacion.

## Casos de uso

- Asistentes de codigo en produccion: al sustituir la plantilla stock en llama-server o vLLM, las respuestas de implementacion evitan el corte a mitad de bloque que se produce al agotar el limite de salida, algo observado en la tarea LRU cache de las pruebas del autor.
- Revision de codigo y caza de errores: en la tarea de bug hunt el consumo bajo de 648 a 330 tokens con calidad de codigo equivalente, lo que reduce el coste por revision en pipelines automatizados.
- Analisis de seguridad: en la tarea de path traversal la salida paso de 1388 a 603 tokens (-56 %), util en flujos donde se analizan muchos fragmentos y el coste por token domina.
- Optimizacion de rendimiento: en tareas de optimizacion el ahorro fue menor (-8 %, de 1052 a 965 tokens), lo que indica que la plantilla no recorta cuando la respuesta requiere detalle tecnico.
- Integracion en herramientas de chat con contexto largo: al reducir la verbosidad por turno, se libera presupuesto de contexto para mas turnos de historial en sesiones de trabajo de conocimiento.
- Despliegue en entornos con restricciones de ancho de banda o coste por token, como APIs internas que facturan por token de salida.
- Evaluacion comparativa de estilos de respuesta: el interruptor `terse` permite ejecutar A/B testing entre el comportamiento stock y el terse sobre el mismo modelo y los mismos prompts.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card provienen de una evaluacion sobre DeepSeek-Coder-V2-Lite en 6 tareas ciegas de codigo, comparando la plantilla stock con la plantilla terse. La tabla muestra 4 de esas tareas:

| Tarea | Template stock (tokens) | Template terse (tokens) | Delta |
|---|---|---|---|
| Bug hunt | 648 | 330 | -49 % |
| Path traversal | 1388 | 603 | -56 % |
| Optimize | 1052 | 965 | -8 % |
| LRU cache | 1500 (truncado) | Completado | Evita el corte |

El autor resume el efecto como una reduccion del 40-56 % en tokens en tareas propensas al relleno, con calidad de codigo equivalente, y senala que en tareas legitimamente complejas se conserva la respuesta completa en lugar de truncarla. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni tampoco cifras para modelos distintos de DeepSeek-Coder-V2-Lite. El autor indica que habra mas benchmarks y mayor cobertura de modelos en el futuro.

## Requisitos de hardware

- La plantilla no tiene requisitos de hardware propios: es un archivo de texto Jinja que no contiene pesos ni ejecuta computo.
- Los requisitos de VRAM, GPU y latencia dependen integramente del modelo anfitrion sobre el que se aplique; no se especifican en la informacion disponible.
- Cabe en cualquier GPU capaz de ejecutar el modelo DeepSeek subyacente, incluida una GPU de consumo si el modelo anfitrion cuantizado cabe en ella.
- Opciones de despliegue confirmadas por el autor: MLX, oMLX, llama.cpp, llama-server, koboldcpp, vLLM, SGLang y LM Studio.
- Ejemplo de despliegue en llama.cpp: `llama-server -m your_deepseek.gguf --jinja --chat-template-file chat_template.jinja`.
- Ejemplo de despliegue en vLLM o SGLang: asignar el contenido de `chat_template.jinja` al parametro `chat_template`.
- Parametros de muestreo sugeridos por el autor para codigo: temperatura 0,2-0,4, `top_p` en torno a 0,9 y `top_k` en torno a 20. La plantilla no modifica el muestreo.
- Latencia y throughput estimados: no disponibles. La reduccion de tokens de salida implica menos tiempo de decodificacion por respuesta, pero no se publican cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

La comparacion relevante es entre plantillas de chat, no entre modelos, ya que el artefacto no contiene pesos.

| Plantilla | Enfoque | Modelo objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-Sharp-Chat-Templates (esta) | Anade bloque de terseness tras el system prompt, con interruptor `terse` | Modelos instruct de DeepSeek | Apache 2.0 | Hugging Face |
| Plantilla stock de DeepSeek | Plantilla oficial de conversacion y tool calling | Modelos instruct de DeepSeek | La del modelo anfitrion (no disponible en la informacion proporcionada) | Incluida con los modelos DeepSeek |
| froggeric/Qwen-Fixed-Chat-Templates | Pautas base de formato de herramientas, cache KV y escalado de errores | Modelos Qwen | No disponible | Hugging Face |

Parametros, contexto y benchmarks de rendimiento no son aplicables a ninguna de las tres, al tratarse de plantillas. El autor no publica una comparacion directa frente a otras alternativas de concision mas alla de citar la inspiracion en un proyecto terse para Qwen.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo y no puede evaluarse de forma aislada al modelo anfitrion.
- El efecto de concision es menor en entregables predominantemente de codigo o artefactos estructurados, donde hay menos relleno que eliminar; el mayor efecto se da en turnos de explicacion y razonamiento.
- Las metricas publicadas son limitadas: 6 tareas ciegas, un unico modelo anfitrion (DeepSeek-Coder-V2-Lite) y solo 4 tareas mostradas en la tabla. No hay validacion independiente.
- No se declara lista de idiomas soportados; el comportamiento multilingue depende del modelo anfitrion.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.
- Riesgo de alucinacion, sesgos y limitaciones de contexto: no documentados en la informacion disponible y, en cualquier caso, inherentes al modelo anfitrion, no a la plantilla.
- Restricciones de licencia: Apache 2.0 permite uso comercial de la plantilla, pero la licencia del modelo DeepSeek sobre el que se aplique es independiente y debe verificarse por separado.
- La plantilla sobrescribe el `chat_template.jinja` del modelo si se copia en su directorio; conviene conservar una copia del original para poder revertir.
- El autor advierte que habra mas cobertura y soporte de modelos, lo que sugiere que el soporte actual puede ser incompleto para variantes distintas de las probadas.
- Caveat de produccion: al modificar la plantilla se altera el formato exacto de la conversacion, lo que puede romper parsers o expectativas de formato en sistemas que asumen la plantilla stock.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/apuebla/DeepSeek-Sharp-Chat-Templates
- Plantilla de chat de DeepSeek-V3.2-Exp (referencia oficial del formato): https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp/blob/main/assets/chat_template.jinja
- Plantilla base de referencia (froggeric/Qwen-Fixed-Chat-Templates): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Sitio oficial de DeepSeek: https://www.deepseek.com/
