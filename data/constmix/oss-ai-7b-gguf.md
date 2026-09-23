# constmix/oss-ai-7b-gguf

## Resumen
oss-ai-7b-gguf es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-7B-Instruct publicado por el usuario constmix, orientado a una única tarea de extracción de informacion: convertir mensajes libres de Discord en registros JSON estructurados con cuatro campos fijos (CLAN, BASE, TYPE, RESULT). El modelo se distribuye ya cuantizado en Q4_K_M en formato GGUF, con un repositorio de 4,7 GB y 7.615.616.512 parámetros, bajo licencia Apache-2.0.

El caso de uso declarado es el bot del Vaktovian Systems Department: a partir de un mensaje como `SURGE @ VAK Eular Station LOSS`, el modelo devuelve `{"CLAN": "The Imperial Insurgence", "BASE": "Eular Station", "TYPE": "Defense", "RESULT": "Loss"}`. La fecha, el autor y la captura no se piden al modelo, sino que se toman directamente del objeto de mensaje de Discord, una decisión de diseño razonable que reduce la superficie de error.

Su relevancia es más metodológica que de rendimiento: el autor documenta que este fine-tune de 7B obtuvo un 92,7 % de exact match frente al 93,6 % de un fine-tune hermano de 1.5B entrenado con los mismos datos y la misma receta. Con 4,7 veces más parámetros no hay ganancia, por lo que el 1.5B es el modelo de producción y este 7B se conserva únicamente como registro. El repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2), modelo base Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 (≈7,6 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la ficha del autor; el ejemplo de uso configura `n_ctx=512` |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada en el repositorio) |
| Idiomas soportados | No disponibles en la ficha; la tarea de extracción está definida sobre mensajes en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamaño del repositorio | 4,7 GB |
| Pipeline declarado | No disponible |
| Etiquetas | gguf, qwen2, information-extraction, discord, endpoints_compatible, conversational |
| Fecha de creación | 2026-09-22 |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con atención completa y sin componentes MoE ni SSM. Sobre ese modelo se aplicó un ajuste fino supervisado con LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y de MLP, es decir, un adaptador de bajo rango sobre las matrices principales, no un reentrenamiento completo. Posteriormente los pesos se fusionaron y se cuantizaron a Q4_K_M para su distribución en GGUF.

La receta de entrenamiento está documentada de forma explícita: 8.020 ejemplos, 2 épocas, enmascarado de la pérdida únicamente sobre la respuesta (no se entrena sobre el prompt ni sobre el padding) y padding dinámico en lugar de longitud fija, con una mediana de 209 tokens por ejemplo. No se menciona uso de RLHF ni de DPO. La innovación destacable no es arquitectónica sino de planteamiento del problema: el modelo solo aprende los cuatro campos que dependen del lenguaje y delega fecha, autor y captura al propio objeto de Discord, lo que evita que el modelo tenga donde equivocarse en datos que ya son estructurados. Como contrapartida, el system prompt debe coincidir exactamente con el empleado en entrenamiento (definido en `utils/constants.py` del repositorio del bot); cualquier variación degrada el resultado de forma perceptible.

## Capacidades
- Extracción de información estructurada: convierte mensajes de Discord de formato libre en un JSON con exactamente cuatro claves (CLAN, BASE, TYPE, RESULT).
- Normalización de vocabulario: mapea variantes del mensaje a valores canónicos de tipo y resultado (por ejemplo, "Loss" para una derrota declarada).
- Generación de JSON válido y de longitud fija, adecuada para consumirse directamente desde un parser.
- Conversación: el modelo se invoca mediante `create_chat_completion` con mensajes de sistema y usuario, y la etiqueta `conversational` figura en el repositorio.
- Compatibilidad con endpoints de inferencia: el repositorio está marcado como `endpoints_compatible`.
- Capacidades generales del modelo base (razonamiento, código, matemáticas, multilingüismo, tool calling): no evaluadas en este fine-tune. El ajuste está orientado a una tarea única y el autor no reporta qué se conserva ni qué se degrada.
- Capacidades de agente, multi-step reasoning, visión o audio: no disponibles.

## Casos de uso
- Bot de registro de eventos en Discord: el escenario original. El bot recibe el mensaje, lo pasa al modelo con el system prompt de entrenamiento y temperatura 0, y persiste el JSON resultante en la base de datos del clan, completando los campos de fecha y autor desde el propio mensaje de Discord.
- Elaboración de estadísticas de clan y de guerra: a partir de los campos TYPE y RESULT extraídos de forma masiva se pueden calcular ratios de victorias y derrotas por base y por clan, algo inviable si hubiera que revisar los mensajes a mano.
- Paneles de analítica en tiempo real: al devolver un JSON de cuatro claves y longitud fija, la salida se puede ingerir directamente en un pipeline de datos o en una herramienta de BI sin capa de post-procesado.
- Moderación y detección de informes mal formados: al ejecutarse con temperatura 0 y devolver siempre el mismo esquema, una salida incoherente o con valores fuera del vocabulario esperado sirve como señal de que el mensaje no sigue el formato de informe admitido.
- Adaptación de la receta a dominios análogos: el repositorio documenta la receta completa (LoRA r=16, alpha 32, pérdida enmascarada, padding dinámico, 8.020 ejemplos) y es reutilizable como plantilla para extraer campos estructurados de logs, tickets de soporte o notificaciones internas con un esquema igualmente cerrado.
- Referencia de comparación en experimentos de escalado: sirve como punto de control documentado para estudiar el escalado de 1.5B a 7B en una tarea de extracción estrecha con datos idénticos, que es precisamente el experimento que el autor reporta.
- Despliegue local sin GPU dedicada: al ser GGUF Q4_K_M y ejecutarse con `n_ctx=512`, puede correr por CPU con llama.cpp dentro del propio host del bot, sin depender de un servicio de inferencia externo.

## Benchmarks y rendimiento

| Conjunto de evaluación | Modelo | Exact match | Notas |
|---|---|---|---|
| Conjunto de validación anterior del proyecto | oss-ai-7b-gguf (7B, Q4_K_M) | 92,7 % | Mismos datos y misma receta que el modelo de 1.5B |
| Conjunto de validación anterior del proyecto | Fine-tune hermano de 1.5B | 93,6 % | Modelo de producción elegido por el autor |
| Benchmark nuevo de 892 filas | oss-ai-7b-gguf | No evaluado | El autor indica explícitamente que no se ha re-puntuado |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark general en la información disponible. El único dato cuantitativo es el exact match sobre el conjunto de validación antiguo del proyecto.

## Requisitos de hardware
- VRAM estimada: en torno a 4,7 GB solo para los pesos en Q4_K_M (tamaño del repositorio), más la memoria del contexto. Con `n_ctx=512`, la huella total es de aproximadamente 5 a 6 GB.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB, una RTX 4070 o una RTX 4090 lo ejecutan con holgura a esta longitud de contexto.
- Ejecución por CPU: viable con llama.cpp, dado el tamaño reducido de la cuantización y la ventana de contexto corta empleada en el ejemplo.
- GPU de datacenter: A100, H100 o L40S son innecesarias para esta tarea; solo tendrían sentido si se sirviera el modelo base en FP16 (≈15 GB de pesos) con contexto largo.
- Opciones de despliegue: llama.cpp y su binding `llama-cpp-python` (el ejemplo de la ficha usa `Llama` con `n_ctx=512` y `temperature=0`), Ollama, LM Studio, koboldcpp y text-generation-webui, todos ellos capaces de consumir GGUF. El soporte de GGUF en vLLM y TGI es limitado o experimental; no se documenta en este repositorio.
- Latencia y throughput: no disponibles. La ficha no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (exact match) | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| oss-ai-7b-gguf (este modelo) | ≈7,6 B | No disponible; ejemplo con n_ctx=512 | 92,7 % en el set de validación antiguo | Apache-2.0 | GGUF (Q4_K_M) | Publicado como registro, no como modelo de producción |
| Fine-tune hermano de 1.5B (misma receta) | ≈1,5 B | No disponible | 93,6 % en el mismo set | No disponible | No disponible | Modelo de producción del proyecto |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | ≈7,6 B | No disponible en la información proporcionada | No aplicable: no está ajustado a esta tarea | Apache-2.0 según el modelo base (no verificado en la información proporcionada) | safetensors y otras | Modelo generalista; no resuelve la extracción sin ajuste |

El resultado destacable de la comparación es que un modelo 5 veces mayor no mejora a su hermano pequeño en esta tarea concreta, lo que sugiere que el cuello de botella está en el formato de los datos y en el esquema cerrado, no en la capacidad del modelo.

## Limitaciones y advertencias
- No supera al modelo de 1.5B: 92,7 % frente a 93,6 % con los mismos datos y la misma receta. El propio autor lo descarta como modelo de producción, por lo que no tiene sentido desplegarlo en lugar del 1.5B.
- Sin evaluar en el benchmark actual: no se ha re-puntuado sobre el conjunto nuevo de 892 filas, de modo que no se conoce su comportamiento con la distribución de datos vigente.
- Dependencia estricta del system prompt: el prompt debe coincidir con el de entrenamiento, alojado en `utils/constants.py` del repositorio del bot. Cualquier variación "lo empeora de forma notable" según la ficha.
- Alcance funcional mínimo: solo devuelve cuatro campos. La fecha, el autor y la captura se obtienen del objeto de mensaje de Discord, no del modelo, así que no debe usarse para esas tareas.
- Riesgo de alucinación en entradas fuera de dominio: al ser un ajuste fino sobre una tarea de esquema cerrado, un mensaje que no siga el formato de informe puede producir valores inventados en CLAN, BASE, TYPE o RESULT en lugar de rechazar la entrada. Conviene validar la salida contra el vocabulario admitido.
- Sesgo de dominio: el entrenamiento procede de 8.020 ejemplos de un contexto muy concreto (el Vaktovian Systems Department), por lo que el vocabulario de clanes, bases y tipos de evento está fuertemente sesgado hacia ese entorno y no generalizará a otros servidores o juegos sin reentrenamiento.
- Idiomas: no se declaran idiomas soportados. La tarea está definida sobre mensajes en inglés y no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-7B-Instruct, no confirmadas en la información proporcionada.
- Madurez del repositorio: cero descargas, cero likes, sin pipeline declarado y sin validación por parte de la comunidad.
- Superficie de inyección de prompt: la entrada es texto libre procedente de Discord, un canal no confiable; si el modelo se integra en un agente, el contenido del mensaje podría intentar alterar la salida estructurada.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/constmix/oss-ai-7b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del bot (referenciado en la ficha, fichero `utils/constants.py` con el system prompt de entrenamiento): no disponible como URL en la información proporcionada
- Paper, blog o demo del autor: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden únicamente a páginas de YouTube y YouTube Music, sin relación con el modelo.
