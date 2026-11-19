# mdcreativeagent/Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive es una variante "uncensored" del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario mdcreativeagent bajo la firma HauhauCS. El modelo mantiene la arquitectura, los pesos y el conocimiento del original, pero ha sido modificado para eliminar los mecanismos de rechazo (refusals), de modo que responde a practicamente cualquier peticion sin filtros de seguridad. Se distribuye unicamente en formato GGUF, pensado para inferencia local con llama.cpp, LM Studio, Ollama o koboldcpp.

El modelo base es un transformer denso de 4.022.468.096 parametros (aproximadamente 4B) con una ventana de contexto declarada de 262.144 tokens (262K). Es un modelo bilingue ingles-chino, con soporte de modo "thinking" mediante etiquetas `<think>...</think>`, y esta liberado bajo licencia Apache 2.0. Su relevancia actual radica en que ofrece el comportamiento del Qwen3-4B-Instruct-2507 (un modelo pequeno, eficiente y con contexto muy largo) sin las capas de moderacion, lo que interesa a quienes investigan alineacion, red teaming o generacion de contenido sin restricciones en entornos controlados.

La variante "Aggressive" aplica un desbloqueo mas fuerte que la version "Balanced" del mismo autor. El autor afirma que no se han modificado los datasets ni las capacidades, y que se trata de una conversion "lossless" que conserva el 100% del comportamiento previsto por los autores originales, salvo por la supresion de rechazos. El repositorio ocupa 18,1 GB e incluye varias cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K) segun la model card |
| Tipos de cuantizacion | FP16, Q8_0, Q6_K, Q4_K_M (formato GGUF) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (FP16, Q8_0, Q6_K, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507: un transformer denso de aproximadamente 4B parametros con atencion estandar y una ventana de contexto extendida de 262K tokens. No es un modelo MoE ni hibrido; todos los parametros estan activos en cada pasada. El autor no documenta cambios en la arquitectura respecto al modelo base.

En cuanto al entrenamiento, la model card no aporta informacion sobre el proceso de "uncensoring" (abliteracion, fine-tuning con datos especificos o modificacion de pesos). El autor afirma explicitamente que "no hay cambios en datasets ni capacidades" y que el resultado es "lossless" respecto al original, conservando el comportamiento previsto por los autores de Qwen. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la variante uncensored. Tampoco se especifican innovaciones tecnicas adicionales mas alla de las del modelo base (modo thinking con etiquetas `<think>`, plantilla de chat compatible con `--jinja`).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento con modo "thinking" explicito (etiquetas `<think>...</think>`) y modo "non-thinking" mediante el sufijo `/no_think`.
- Respuestas sin rechazos (refusals) a peticiones que el modelo original rechazaria, segun el autor.
- Conversacion general y asistencia de proposito general heredada del Qwen3-4B-Instruct-2507.
- Soporte de plantilla de chat Jinja (requiere `--jinja` en llama.cpp para un manejo correcto).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Investigacion en alineacion y seguridad: el modelo permite estudiar como responde un LLM sin capas de rechazo, comparando sus salidas con las del Qwen3-4B-Instruct-2507 original en experimentos controlados de red teaming.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas sensibles y que un modelo moderado rechazaria, ejecutandose en local con llama.cpp u Ollama.
- Despliegue local en hardware modesto: con la cuantizacion Q4_K_M (2,4 GB) cabe en GPUs de consumo y permite inferencia offline en portatiles o equipos sin conexion.
- Procesamiento de documentos largos en ingles o chino: la ventana de 262K tokens permite cargar contratos, informes o libros completos en una sola pasada para resumen o extraccion, siempre que el hardware soporte el contexto extendido.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 4B en GGUF, sirve para iterar plantillas de chat y flujos conversacionales sin coste de API.
- Evaluacion comparativa de cuantizaciones: el repo ofrece FP16, Q8_0, Q6_K y Q4_K_M del mismo modelo, util para medir la degradacion de calidad frente al tamano en benchmarks internos.
- Entornos de investigacion con requisitos de privacidad: al ejecutarse integramente en local, no envia datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion GGUF: FP16 ~7,5 GB, Q8_0 ~4,0 GB, Q6_K ~3,1 GB, Q4_K_M ~2,4 GB (tamanos de fichero declarados por el autor; la VRAM real debe sumar el overhead de contexto KV).
- La ventana de 262K tokens exige memoria adicional considerable para la cache KV; en la practica, usar contextos muy largos requiere GPUs con 24 GB o mas (RTX 3090/4090, A100, H100) o bien reducir `-c` en llama.cpp.
- Cabe en GPUs de consumo: la cuantizacion Q4_K_M (2,4 GB) se ejecuta en tarjetas de 6-8 GB (RTX 3060, RTX 4060, etc.) con contextos moderados; Q8_0 y FP16 requieren 8-12 GB o mas.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp y Ollama, segun la model card. Se recomienda el flag `--jinja` para el manejo correcto de la plantilla de chat.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive | ~4B (denso) | 262K | Apache 2.0 | GGUF | Variante sin rechazos del Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B (denso) | 262K (segun model card del derivado) | Apache 2.0 | safetensors y derivados | Modelo original con filtros de seguridad |
| Otras variantes uncensored de Qwen3-4B | ~4B (denso) | no disponible | Apache 2.0 (heredada) | GGUF habitualmente | No se dispone de datos comparativos de rendimiento en la informacion |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de esta variante frente al modelo base u otras alternativas.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo responde a peticiones que el original rechazaria; puede generar contenido danino, ilegal o sensible. No es apto para exposicion directa a usuarios finales sin moderacion adicional.
- Riesgo elevado de alucinacion: como todo modelo de 4B, tiende a inventar datos, especialmente en tareas factuales o de razonamiento complejo.
- Idiomas limitados: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto de 262K declarado pero costoso: mantener contextos muy largos requiere gran cantidad de VRAM para la cache KV y puede degradar la calidad en los extremos de la ventana.
- Procedencia y trazabilidad: el autor es un usuario individual (mdcreativeagent / HauhauCS); no hay documentacion tecnica del proceso de modificacion, lo que dificulta auditar que se ha alterado exactamente.
- Sin validacion de calidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o evaluacion independiente.
- Licencia Apache 2.0 heredada: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las obligaciones de la licencia.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin verificacion empirica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3-4B-2507-Instruct-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Discord del autor: https://discord.gg/SZ5vacTXYf
