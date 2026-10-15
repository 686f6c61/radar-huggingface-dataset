# pradeepchirumamilla01/vedic-atlas-router-4b-GGUF

## Resumen

Vedic Atlas Router 4B es un ajuste fino LoRA de Qwen/Qwen3-4B, fusionado y cuantizado a GGUF Q4_K_M (2,5 GB), publicado por el usuario pradeepchirumamilla01 dentro del proyecto Vedic Atlas. No es un modelo de chat general: actúa como el paso de decisión del asistente de voz "Veda", y en cada turno del usuario emite una única decisión en JSON: responder directamente, invocar una o varias herramientas, pedir una aclaración o rechazar la petición. El modelo está entrenado para un prompt de control concreto de aproximadamente 2.200 tokens que enumera las herramientas disponibles, los turnos recientes y el estado actual.

El problema que resuelve es el enrutamiento de herramientas (tool routing) en dispositivos sin conexión. Está diseñado para ejecutarse solo con CPU mediante llama.cpp o llama-cpp-python, y el autor lo valida en un Raspberry Pi 5 de 8 GB, de modo que las conversaciones no salen del dispositivo. Cubre 16 herramientas relacionadas con meteorología y predicciones, divisas, búsqueda web, Gmail, Google Calendar, control de aplicaciones y volumen, recordatorios, memoria y reloj, entre otras.

La relevancia actual viene de su enfoque de despliegue: un modelo de 4.022 millones de parámetros cuantizado a Q4_K_M y pensado para hardware de borde, con salida restringida por una gramática JSON y validación posterior mediante una política basada en reglas. El checkpoint hereda la licencia Apache-2.0 de Qwen3-4B y, en el momento de redactar esta ficha, cuenta con 0 descargas y 0 "likes" y no ha superado una evaluación completa de precisión en un conjunto reservado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 3.072 tokens en la configuración de referencia (n_ctx=3072); la ficha no especifica la longitud nativa del modelo base |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se listan otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen3-4B) |
| Formato de pesos | GGUF (fichero router4b-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

La base es Qwen3-4B, un transformer decoder denso de 4.022 millones de parámetros. Sobre ese modelo se aplicó un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05 sobre todas las proyecciones de atención y MLP, que después se fusionó de vuelta en el modelo base en bf16. El entrenamiento usó una única A100 de 80 GB, 2 épocas, tasa de aprendizaje 1e-4 con 5% de warm-up y decaimiento coseno, y tamaño de lote efectivo 32. La pérdida se calculó únicamente sobre la respuesta (el JSON), y los prompts se tokenizaron exactamente igual que en el servidor de destino. La conversión a GGUF y la cuantización a Q4_K_M se hicieron con llama.cpp.

El conjunto de datos es sintético: 5.796 ejemplos (5.239 de entrenamiento y 557 de validación), generados por agentes LLM por tema y verificados por un validador, descartando los ejemplos inválidos en lugar de repararlos. Se eliminaron duplicados, ejemplos demasiado parecidos a los conjuntos de evaluación y muestras de predicción sobrerrepresentadas, y no se usaron datos personales. La distribución por tipo de decisión es: 3.497 llamadas a herramientas, 1.395 respuestas directas de chat, 424 aclaraciones y 480 rechazos. Los ejemplos cubren peticiones explícitas, seguimientos que dependen de la última llamada, errores de reconocimiento de voz y titubeos, peticiones multitarea, acciones destructivas, peticiones que ninguna herramienta puede resolver y pares casi idénticos en los que un pequeño detalle cambia la respuesta correcta. Un segundo etiquetador independiente revisó una muestra de una versión anterior del conjunto y coincidió en el tipo de decisión en el 98% de los ejemplos.

La innovación principal no está en el entrenamiento, sino en el contrato de salida: el modelo emite JSON restringido por una gramática, y una política basada en reglas separada valida y ejecuta las llamadas, de modo que el modelo solo tiene que decidir.

## Capacidades

- Enrutamiento de herramientas (tool routing): decide si una petición requiere datos en vivo y emite las llamadas correspondientes en JSON, por ejemplo {"needs_live_data": true, "calls": [{"tool": "get_weather", "args": {"place": "Pune"}}]}.
- Cobertura de 16 herramientas: meteorología y predicciones, divisas, búsqueda web, Gmail, Google Calendar, control de aplicaciones y volumen, recordatorios, memoria ("recuerda que..."), reloj y otras.
- Salida restringida por gramática JSON, con validación y ejecución delegadas a una política basada en reglas externa.
- Decisiones múltiples: responder directamente, invocar una o varias herramientas, pedir una aclaración o rechazar una petición que ninguna herramienta puede atender.
- Manejo de seguimientos conversacionales que dependen de la última llamada a herramienta ("¿y mañana?").
- Robustez ante errores de reconocimiento de voz y titubeos, entrenada explícitamente con esos casos.
- Gestión de acciones destructivas que requieren cautela y de pares de ejemplos casi idénticos con un detalle diferenciador.
- Capacidad de memoria: procesa peticiones de tipo "recuerda que..." dentro del conjunto de herramientas.
- No es un modelo de chat general: la model card indica explícitamente que si no se usa con el prompt de control y la gramática de Vedic Atlas, la salida no seguirá el formato esperado.

## Casos de uso

- Asistente de voz totalmente offline: Veda se activa con "hey Veda", escucha y responde; el modelo actúa como paso de decisión que determina si hay que llamar a una herramienta o contestar directamente. Es adecuado porque está pensado para CPU y para un Raspberry Pi 5 de 8 GB, sin dependencia de la nube.
- Enrutamiento de herramientas en dispositivos de borde: se integra en un asistente doméstico o industrial que decide entre consultar el tiempo, convertir divisas o buscar en la web. Su salida JSON con gramática restringida simplifica el parseo y la validación posterior.
- Automatización de correo y calendario: el modelo decide cuándo leer o redactar correo en Gmail y cuándo gestionar eventos en Google Calendar, gracias a las herramientas específicas entrenadas y a los ejemplos de acciones destructivas que exigen cuidado.
- Control de aplicaciones y volumen por voz: interpreta órdenes de control del entorno y las traduce a llamadas estructuradas, lo que permite construir un mando por voz sin componente en la nube.
- Recordatorios y memoria personal: gestiona peticiones de recordatorio y de memorización de hechos, y usa el estado previo (última llamada, fecha actual) incluido en el prompt de servicio para resolver referencias ambiguas.
- Rechazo seguro de peticiones no soportadas: como paso previo a la ejecución, filtra solicitudes que ninguna herramienta cubre y responde con un rechazo, lo que evita que un orquestador intente acciones imposibles. Es una de las debilidades señaladas por el autor, así que conviene reforzarla con reglas externas.
- Prototipado de asistentes con presupuesto de hardware mínimo: sirve como referencia para equipos que necesitan un clasificador de intenciones y herramientas ejecutable en portátil o en una sola placa, con un prompt de servicio de unos 2.200 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del checkpoint en la informacion disponible. La model card indica que este checkpoint aún no ha pasado una evaluación completa de precisión en un conjunto reservado.

El único dato de referencia aportado es el de un modelo hermano de la misma receta (Qwen3-1.7B), que pasó del 37,9% al 81,2% en un conjunto no visto de 346 casos. El autor advierte explícitamente de que esa cifra no debe extrapolarse a este modelo.

| Referencia | Modelo | Resultado | Conjunto |
|---|---|---|---|
| Receta hermana (no este checkpoint) | Qwen3-1.7B ajustado | 37,9% -> 81,2% | 346 casos no vistos |
| Este checkpoint | Vedic Atlas Router 4B | No evaluado en conjunto reservado | no disponible |

Puntos débiles conocidos, heredados del modelo hermano: rechazar peticiones que ninguna herramienta puede resolver y extraer argumentos exactos a partir de voz con ruido.

## Requisitos de hardware

- Pesos cuantizados: 2,5 GB (Q4_K_M) en un único fichero GGUF.
- Memoria necesaria: aproximadamente 2,5 GB de pesos más el cache KV, que depende de n_ctx. Con la configuración de referencia (n_ctx=3072) y un runtime de llama.cpp, encaja con holgura en un Raspberry Pi 5 de 8 GB, tal como indica el autor.
- GPU: no es necesaria; el modelo está diseñado para ejecución solo con CPU. Cabe en cualquier GPU de consumo con más de 4 GB de VRAM, aunque la model card no recomienda ni valida ninguna GPU concreta.
- Cabe en GPU de consumo: sí, por tamaño de pesos, pero el caso de uso objetivo es CPU y hardware de borde.
- Opciones de despliegue: llama.cpp y llama-cpp-python son la ruta soportada y documentada. No se mencionan despliegues con vLLM, TGI u Ollama en la información disponible.
- Latencia: una decisión tarda unos pocos segundos en la CPU de un portátil con el prompt completo de 2.200 tokens. El autor señala que el tiempo lo domina el prefill del prompt, no los 20-40 tokens de salida.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Vedic Atlas Router 4B (GGUF) | 4.022 millones | 3.072 tokens en configuracion de referencia | Ajuste LoRA de Qwen3-4B para enrutamiento de herramientas | Apache-2.0 | Asistente de voz offline, solo CPU |
| Qwen/Qwen3-4B | 4.022 millones (dato del base del que deriva) | no disponible en la informacion proporcionada | Modelo base generalista | Apache-2.0 (heredada) | Chat y tareas generales |
| Qwen3-1.7B (receta hermana citada) | no disponible | no disponible | Ajuste de la misma receta de enrutamiento | no disponible en la informacion | Referencia de resultados del autor |

No se dispone de comparativas con otros enrutadores de herramientas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: si se usa sin el prompt de control y la gramática JSON de Vedic Atlas, la salida no seguirá el formato esperado.
- El prompt de servicio debe replicarse exactamente (unas 2.200 tokens, con herramientas, turnos recientes y estado); el modelo fue entrenado para esa disposición concreta.
- Evaluación incompleta: el checkpoint no ha pasado una evaluación de precisión en un conjunto reservado, por lo que no hay una cifra fiable de acierto para este tamaño.
- Debilidades conocidas heredadas del modelo hermano: rechazo de peticiones sin herramienta asociada y extracción exacta de argumentos a partir de voz ruidosa.
- Riesgo de alucinación: aunque la salida está restringida por gramática, la elección de herramienta y de argumentos puede ser incorrecta; la validación se delega a una política basada en reglas, que conviene mantener y ampliar.
- Idiomas soportados: no disponibles en la ficha; no se puede asumir cobertura multilingüe solo por el modelo base.
- Limitación de contexto: el n_ctx de referencia es 3.072 tokens y el prompt de servicio ya consume unos 2.200, lo que deja un margen reducido para historial adicional.
- Sesgos: no se documentan sesgos específicos, pero el entrenamiento es sintético y generado por agentes LLM, lo que puede introducir sesgos de la distribución generada. El autor indica que no se usaron datos personales.
- Licencia: Apache-2.0, heredada de Qwen3-4B, permite uso comercial, pero se deben respetar las condiciones del modelo base.
- Latencia en CPU: varios segundos por decisión en portátil, dominados por el prefill; puede ser limitante en bucles de agente con muchos turnos.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de redactar la ficha; no hay señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pradeepchirumamilla01/vedic-atlas-router-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del proyecto Vedic Atlas (código, prompt de control y gramática JSON): https://github.com/praveensivaram/Vedic-atlas
