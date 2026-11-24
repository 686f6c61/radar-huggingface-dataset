# OliviaRossi/Improved-Chat-Template-for-Qwen-3.x

## Resumen

Este repositorio no contiene un modelo de lenguaje con pesos entrenados, sino una plantilla de chat (chat template) en formato Jinja2 para modelos de la familia Qwen. La desarrolla OliviaRossi y su funcion es estandarizar la construccion del prompt en modelos Qwen 2.5, Qwen 3.x, QwQ y fusiones hibridas de razonamiento como KAT-Coder, Qwopus, AgentWorld u Ornith. La version documentada es la v4.2, con cadena de version interna `qwen-hybrid-agentic-v4.1`.

El problema que resuelve es la fragilidad de las plantillas oficiales en escenarios de agentes: perdida de historial de llamadas a herramientas, corrupcion silenciosa de contexto cuando el texto contiene etiquetas de razonamiento literales, y gestion incorrecta de continuaciones exactas a nivel de byte. La plantilla define tres posturas de trabajo (Agent, Coding y Creative) que se seleccionan automaticamente segun la presencia de herramientas o de forma explicita mediante `task_mode`.

Es relevante para equipos que despliegan Qwen en produccion con vLLM, SGLang o llama.cpp, porque el formato de cable se mantiene estable respecto a la version 3 (`<|im_start|>` / `<|im_end|>`, llamadas a herramientas en XML de Qwen3-Coder o JSON de Qwen, bloques `<tool_response>`, sin BOS), de modo que puede adoptarse como sustituto sin reentrenar ni cambiar el parser del servidor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: plantilla Jinja2 de chat (no es un modelo neuronal) |
| Parametros totales | No disponible (no hay pesos) |
| Parametros activos | No disponible (no es MoE; el tag `qwen3_5_moe` describe los modelos destino) |
| Longitud de contexto | No disponible (la determina el modelo Qwen sobre el que se aplique) |
| Tipos de cuantizacion | No aplica (artefacto de texto plano) |
| Idiomas soportados | Ingles y multilingue (etiquetas de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; el artefacto es `chat_template.jinja` (Jinja2) |

## Arquitectura y entrenamiento

El artefacto es una plantilla Jinja2 que se renderiza con `ImmutableSandboxedEnvironment` (con `trim_blocks` y `lstrip_blocks` activados) y requiere los filtros `tojson` y la funcion global `raise_exception`. No hay entrenamiento ni dataset: la logica es determinista y transforma una lista de mensajes en un prompt con el formato de turnos de Qwen. El formato de cable es identico al de la version 3: marcadores `<|im_start|>` y `<|im_end|>`, llamadas a herramientas en XML estilo Qwen3-Coder o en JSON estilo Qwen, bloques `<tool_response>` y ausencia de token BOS.

La version 4.1 se presenta como una release de auditoria que corrige dos regresiones introducidas en la 4.0 y varios defectos latentes heredados de la 3. Entre las correcciones destacan: restauracion del prefill canonico `\n\n` cuando se desactiva el razonamiento; restauracion del literal de etiqueta en la regla XML `<IMPORTANT>`; y, sobre todo, la eliminacion de una corrupcion silenciosa de historial en la que cualquier `` literal en prosa se interpretaba como frontera de razonamiento y, con la poda activada, borraba el texto de respuesta precedente. Tambien se corrige el manejo de colas sin cerrar (ahora solo se activa si el cuerpo empieza con etiqueta de apertura), la preservacion byte a byte del prefill con `continue_final_message`, la deteccion de errores en salidas de herramientas (separando heuristicas `file_like`, `code_like` y `trace_like`, y admitiendo `is_error` e `isError`) y la deduplicacion por subcadena entre `reasoning_content` explicito y bloque think en linea.

## Capacidades

- Renderizado de conversaciones multi-turno con el formato de turnos de Qwen (`<|im_start|>rol ... <|im_end|>`).
- Seleccion automatica de postura: si hay herramientas presentes se activa el modo Agent; tambien se puede forzar con `task_mode="creative"` o cambiar a mitad de conversacion mediante una directiva en el prompt.
- Modo Agent: bucles de herramientas multi-turno, llamadas paralelas y conservacion sin perdida del historial de llamadas.
- Cortacircuitos anti-bucle para evitar repeticiones indefinidas de llamadas a herramientas.
- Modo Coding: disciplina de agente con verificacion (leer antes de editar, diffs minimos, verificar antes de declarar exito).
- Modo Creative: prosa de formato largo sin andamiaje agentico, sin presion de brevedad y con continuacion byte a byte.
- Soporte de dos dialectos de llamada a herramientas: XML de Qwen3-Coder y JSON de Qwen.
- Agrupacion de respuestas de herramientas (`<tool_response>`) con aviso de racha de errores en vivo.
- Compatibilidad con `continue_final_message` para continuacion exacta de mensajes del asistente.
- Deduplicacion de contenido de razonamiento explicito frente a bloques think en linea.
- Incluye un arnes de validacion autocontenido con aserciones para regresiones de la 4.0 y para la clase de errores de corrupcion de historial.

## Casos de uso

- Despliegue de agentes con herramientas en produccion: la plantilla conserva el historial completo de llamadas y respuestas, agrupa respuestas paralelas y anade avisos cuando una herramienta falla, lo que reduce bucles y reintentos ciegos en orquestadores sobre vLLM o SGLang.
- Asistentes de programacion con verificacion: el modo Coding impone leer antes de editar y verificar antes de afirmar exito, adecuado para pipelines de CI/CD donde el modelo debe inspeccionar ficheros, aplicar diffs minimos y comprobar resultados de tests.
- Migracion desde plantillas oficiales sin reentrenar: al mantener el formato de cable de la version 3, se puede sustituir la plantilla en el tokenizador o en el servidor de inferencia sin tocar el parser de llamadas a herramientas.
- Escritura creativa de formato largo: con `task_mode="creative"` y `continue_final_message=True` el prompt termina a mitad de frase de forma exacta, lo que permite continuaciones literarias sin reinicios ni reformateos.
- Evaluacion y depuracion de modelos Qwen hibridos: el arnes de validacion incluido permite comprobar el renderizador antes de desplegar y detectar regresiones en el tratamiento de etiquetas de razonamiento.
- Integracion en pipelines de datos conversacionales: la generacion determinista de prompts facilita construir datasets de entrenamiento y evaluacion con formato consistente entre Qwen 2.5, Qwen 3.x y QwQ.
- Servidores compatibles con endpoints: la etiqueta `endpoints_compatible` sugiere su uso en despliegues que exponen una API de chat, donde la plantilla define el contrato de formato de mensajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye unicamente un arnes de validacion funcional (aserciones sobre la salida renderizada), no metricas de calidad o latencia de modelos.

## Requisitos de hardware

- VRAM: no aplica; la plantilla es un fichero de texto y su renderizado consume memoria despreciable en CPU.
- GPU: ninguna requerida para la plantilla. Los requisitos vienen determinados por el modelo Qwen sobre el que se aplique (por ejemplo, variantes de 7B a 235B en la familia Qwen 3.x).
- GPU de consumo: la plantilla cabe en cualquier equipo; la viabilidad de ejecutar el modelo destino en GPU de consumo depende de su tamano y cuantizacion, dato no disponible en esta ficha.
- Despliegue: compatible con vLLM, SGLang, llama.cpp y transformers, segun las etiquetas del repositorio; se integra como `chat_template` del tokenizador o como plantilla del servidor.
- Latencia y throughput: no disponibles; el coste anadido de la plantilla es el de un renderizado Jinja2 por peticion, negligible frente a la inferencia.

## Comparativa con modelos similares

| Artefacto | Tipo | Formato de cable | Modos de trabajo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Improved Chat Template for Qwen 3.x (v4.2) | Plantilla Jinja2 | `<|im_start|>` / `<|im_end|>`, XML y JSON de herramientas | Agent, Coding, Creative | Apache 2.0 | Hugging Face, 345 descargas, 15 likes |
| Plantilla oficial de Qwen 2.5 / Qwen 3.x | Plantilla Jinja2 incluida en el tokenizador | `<|im_start|>` / `<|im_end|>` | Unico modo general | Apache 2.0 (segun el modelo) | Incluida en cada repositorio de pesos |
| Plantillas de la familia QwQ / Qwen3-Coder | Plantilla Jinja2 | XML de Qwen3-Coder | Enfocada a razonamiento o a codigo | Apache 2.0 (segun el modelo) | Incluida en cada repositorio de pesos |

La comparativa se limita a otras plantillas porque este repositorio no contiene pesos; no se dispone de datos de rendimiento comparativo entre plantillas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo, solo construye prompts; cualquier evaluacion de calidad depende del modelo Qwen subyacente.
- La compatibilidad declarada cubre Qwen 2.5, Qwen 3.x, QwQ y fusiones concretas (KAT-Coder, Qwopus, AgentWorld, Ornith); su uso con otros modelos o con plantillas modificadas por terceros no esta garantizado.
- La version 4.0 introdujo regresiones graves, incluida la eliminacion de texto de respuesta precedente cuando la prosa contenia un `` literal con la poda activada; no deben desplegarse versiones anteriores a la 4.1 sin revisar el historial de cambios.
- La deteccion de errores en salidas de herramientas se basa en heuristicas textuales (`file_like`, `code_like`, `trace_like`), por lo que puede clasificar mal salidas atipicas.
- El arnes de validacion debe ejecutarse contra el renderizador concreto antes de desplegar; diferencias en la version de Jinja2 o en los filtros disponibles pueden alterar la salida.
- La documentacion y las etiquetas estan en ingles; la plantilla no impone idioma, pero las capacidades multilingues dependen del modelo destino.
- Riesgo de alucinacion: no aplica a la plantilla, pero si al modelo Qwen que la use; la plantilla no incorpora salvaguardas de contenido.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo Qwen concreto con el que se combine.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OliviaRossi/Improved-Chat-Template-for-Qwen-3.x
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
