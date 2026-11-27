# itsIbrahimKhalil/qwen3-1.7b-guardrail-GGUF

## Resumen

Qwen3-1.7B Guardrail (GGUF) es un ajuste fino del modelo Qwen/Qwen3-1.7B, publicado por itsIbrahimKhalil, disenado como guardrail local para agentes de IA. El modelo actua en tres puntos del bucle de un agente (entrada del usuario, salida de herramientas y respuesta del agente) y devuelve un unico objeto JSON con un veredicto (`allow`, `block` o `redact`), el objetivo del ataque detectado y las evidencias textuales exactas. Su proposito es mitigar ataques de prompt injection y secuestro de tareas en pipelines agenticos.

Se distribuye unicamente en formato GGUF (Q4_K_M, 1.1 GB) junto con un Modelfile para Ollama y un cliente Python sin dependencias, lo que permite ejecutarlo en hardware de consumo. El modelo base Qwen3-1.7B aporta 1.720.574.976 parametros y una ventana de contexto nativa amplia, aunque el guardrail fue entrenado con entradas de hasta aproximadamente 8.000 caracteres.

Es relevante porque ofrece una capa de defensa ejecutable en local con latencia de 0,5 s mediana en GPU y 3,6 s en CPU, a coste cero y sin depender de APIs externas. Fue desarrollado para el Qwen Local Hackathon 2026 y su licencia Apache 2.0 facilita la integracion en produccion, aunque sus propias limitaciones documentadas exigen combinarlo con otras defensas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino supervisado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; entradas de entrenamiento de hasta ~8.000 caracteres |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en (ingles unicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B (revision `a972f4304f86a0a705d35b378d7a7675d58063a7`), un transformer decoder-only de 1.720.574.976 parametros. El ajuste fino convierte el modelo generativo general en un clasificador de seguridad con salida JSON estructurada, entrenado para tres checkpoints diferenciados: `user_input` (veredictos `allow`/`block`), `tool_output` (veredictos `allow`/`redact` con spans inyectados devueltos literalmente en `evidence`) y `agent_response` (veredictos `allow`/`block`). La salida incluye el campo `attack_goal` con ocho categorias posibles: `none`, `data_exfiltration`, `unauthorized_action`, `prompt_leak`, `task_hijack`, `user_deception`, `tool_misuse` y `jailbreak`.

El entrenamiento utiliza un formato de prompt fijo que incluye el checkpoint, un historial de hasta dos mensajes previos y el contenido a inspeccionar delimitado por `<<<` y `>>>`. Los datos de entrenamiento combinan ataques sinteticos con banners repetitivos (`<INFORMATION>`, `[PRIORITY MESSAGE]`) y ataques de origen humano de LLMail y BIPIA para compensar el sesgo de estilo. La evaluacion reportada se realizo con decodificacion greedy, temperatura 0 y el modo thinking de Qwen3 desactivado mediante el Modelfile. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de seguridad con salida JSON valida en el 99,0% de los casos (frente al 5,5% del modelo base).
- Deteccion de prompt injection en la entrada del usuario, con veredicto binario `allow`/`block`.
- Deteccion y redaccion de inyecciones en salidas de herramientas (correos, paginas web, archivos), devolviendo los fragmentos exactos en `evidence` para que el codigo los elimine.
- Deteccion de secuestro de tareas y fugas de system prompt en respuestas del agente y llamadas a herramientas.
- Clasificacion del objetivo del ataque en ocho categorias (`data_exfiltration`, `unauthorized_action`, `prompt_leak`, `task_hijack`, `user_deception`, `tool_misuse`, `jailbreak`, `none`).
- Generacion de explicaciones en lenguaje natural del veredicto emitido.
- Integracion con agentes mediante un cliente Python sin dependencias (`guard_client.py`) que construye el formato exacto de prompt.
- Capacidad de generalizacion a fuentes no vistas en entrenamiento (AgentDojo, InjecAgent, Nemotron, BIPIA).
- No soporta tool calling como funcion del propio modelo, ni vision, ni audio; su unica funcion es la clasificacion de seguridad.

## Casos de uso

- Filtrado de entrada en agentes conversacionales: antes de pasar el mensaje del usuario al LLM principal, se invoca el checkpoint `user_input` para bloquear intentos de jailbreak o inyeccion directa; util en asistentes expuestos a trafico no confiable.
- Saneamiento de salidas de herramientas: cuando el agente lee correos, paginas web o archivos, el checkpoint `tool_output` detecta instrucciones inyectadas y devuelve los spans exactos para que el codigo los recorte antes de que el LLM los procese, mitigando ataques de inyeccion indirecta.
- Proteccion contra fugas de system prompt: el checkpoint `agent_response` inspecciona la respuesta antes de mostrarla y bloquea respuestas que revelen el prompt de sistema, adecuado para asistentes con instrucciones confidenciales.
- Validacion de llamadas a herramientas antes de su ejecucion: el modelo detecta llamadas a herramientas hijackedas (por ejemplo, envios de correo no solicitados) y las bloquea antes de que se ejecuten, actuando como segunda linea de defensa en agentes con permisos de escritura.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con Ollama y 1,6 GB de memoria, permite auditar trafico de agentes sin enviar datos a APIs externas, apropiado para sectores regulados.
- Monitorizacion y registro de seguridad: el campo `attack_goal` y la explicacion permiten construir dashboards y alertas sobre intentos de exfiltracion o secuestro de tareas en produccion.
- Pruebas de robustez en CI/CD: el cliente Python sin dependencias facilita integrar el guardrail en suites de test que verifiquen que los prompts del agente no son vulnerables a inyecciones conocidas.

## Benchmarks y rendimiento

Evaluacion sobre 200 filas del conjunto de test reservado (8 filas por grupo checkpoint/fuente/veredicto), comparando el modelo base en 4 bits con el ajuste fino, con decodificacion greedy en Kaggle:

| Metrica | Qwen3-1.7B base | Ajuste fino |
|---|---:|---:|
| Salida es JSON valido | 5,5% | 99,0% |
| Veredicto correcto | 57,5% | 86,5% |
| Ataques detectados | 57,7% | 84,6% |
| Falsos positivos | 17,7% | 11,5% |
| Texto inyectado cubierto por `evidence` (`tool_output`) | 1,6% | 79,9% |

Desglose por checkpoint del modelo ajustado:

| Checkpoint | Veredicto correcto | Ataques detectados | Falsos positivos |
|---|---:|---:|---:|
| `tool_output` | 93,1% | 95,0% | 9,4% |
| `agent_response` | 83,3% | 66,7% | 0,0% |
| `user_input` | 82,5% | 85,0% | 20,0% |

Generalizacion a fuentes no vistas en entrenamiento (8-16 filas por fuente, cifras aproximadas):

| Fuente | Base | Ajuste fino |
|---|---:|---:|
| AgentDojo (workspace y slack) | 44% | 81% |
| InjecAgent (herramientas y ataques reservados) | 0% | 100% |
| Nemotron (dominio seguros) | 44% | 100% |
| BIPIA (split de test) | 44% | 100% |

Rendimiento del GGUF ejecutado en Ollama sobre las mismas 200 filas:

| Metrica | Valor |
|---|---|
| Mismo veredicto que la evaluacion en Kaggle | 189/200 (94,5%) |
| Veredicto correcto | 87,0% |
| Latencia GPU (AMD RX 5700 XT) | mediana 0,5 s, p95 2,0 s |
| Latencia CPU (Ryzen 7 3700X, `num_gpu=0`) | mediana 3,6 s, p95 6,7 s |
| Memoria (`ollama ps`) | 1,6 GB |

## Requisitos de hardware

- VRAM/RAM estimada: 1,6 GB en ejecucion segun `ollama ps` con el archivo Q4_K_M de 1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el autor midio latencias en una AMD RX 5700 XT. No se han publicado mediciones en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (RTX 3060 en adelante, RX 5700 XT o superior) puede ejecutarlo integramente en VRAM.
- Despliegue: Ollama es la via documentada (Modelfile incluido); tambien es compatible con llama.cpp al ser GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia: mediana de 0,5 s y p95 de 2,0 s por comprobacion en GPU; mediana de 3,6 s y p95 de 6,7 s en CPU. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-1.7B Guardrail (este) | 1,72 B | no disponible (~8.000 caracteres en entrenamiento) | Guardrail JSON en 3 checkpoints | Apache 2.0 | GGUF |
| Qwen3-1.7B (base) | 1,72 B | no disponible en la informacion | Generacion general | Apache 2.0 | safetensors, GGUF |
| Llama Guard (familia) | no disponible en la informacion | no disponible en la informacion | Clasificacion de contenido | licencia Llama | safetensors, GGUF |
| Prompt Guard (familia) | no disponible en la informacion | no disponible en la informacion | Deteccion de prompt injection | no disponible en la informacion | safetensors |

No se dispone de datos de benchmarks comparativos directos con Llama Guard o Prompt Guard en la informacion proporcionada; la unica comparacion publicada es contra el modelo base Qwen3-1.7B, incluida en la seccion de benchmarks.

## Limitaciones y advertencias

- Sobrebloqueo en `user_input`: el 20% de mensajes de usuario inofensivos se marcan como bloqueados, especialmente los que contienen palabras disparadoras; en el conjunto NotInject el modelo acierta solo el 50% de las veces.
- Acciones maliciosas no detectadas: aproximadamente 1 de cada 3 respuestas maliciosas del agente pasa el filtro en la evaluacion de Kaggle (1 de cada 4 en la ejecucion local).
- No detecta respuestas daninas del agente: el checkpoint `agent_response` solo se entreno con llamadas a herramientas hijackedas y fugas de system prompt; en el slice de comparacion de JailbreakBench bloqueo solo 1 de 8 respuestas claramente daninas (2 de 8 en local). Se recomienda usar un clasificador de seguridad de contenido adicional.
- Sesgo hacia estilos de ataque repetitivos: muchos ataques de entrenamiento usan banners como `<INFORMATION>` o `[PRIORITY MESSAGE]`; se incluyeron ataques humanos de LLMail y BIPIA para compensar, pero el sesgo persiste.
- Redacciones largas: en ataques embebidos en correos largos, la evidencia puede incluir texto inofensivo adyacente a la inyeccion.
- Solo ingles: no soporta otros idiomas; las entradas vistas en entrenamiento llegan a unos 8.000 caracteres.
- Es una segunda linea de defensa: debe combinarse con herramientas de minimo privilegio y confirmacion humana para acciones sensibles, no sustituirlas.
- Riesgo de alucinacion en las explicaciones: el modelo puede justificar veredictos incorrectos con razonamientos plausibles, ya que genera texto libre en el campo `explanation`.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B tiene sus propios terminos que conviene revisar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsIbrahimKhalil/qwen3-1.7b-guardrail-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Ollama (descarga): https://ollama.com/download
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.
