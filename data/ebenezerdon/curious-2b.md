# ebenezerdon/curious-2b

## Resumen

Curious 2B es un modelo de lenguaje de 1.880 millones de parámetros desarrollado por Ebenezer Don para CuriousLM, un asistente que se ejecuta íntegramente en dispositivos Android. Se trata de un ajuste fino (finetune) de Qwen3.5 2B especializado en las tareas concretas que realiza el asistente de la aplicación: gestionar eventos de calendario y recordatorios mediante tool calling, leer y resumir notificaciones y mensajes entrantes, redactar borradores de respuesta y alimentar las sugerencias del teclado (respuestas, predicción de siguiente palabra, corrección de erratas y limpieza de dictado por voz).

La relevancia del modelo radica en su enfoque de privacidad y ejecución local: funciona con llama.cpp en el propio teléfono, sin enviar datos a un servidor, y CuriousLM se encarga de aportar los datos de calendario y notificaciones y de ejecutar las herramientas. El modelo cubre nueve idiomas (inglés, español, francés, portugués, alemán, italiano, neerlandés, chino y pcm) y se distribuye en formato GGUF cuantizado Q4_0 con un tamaño de 1,21 GB por release.

La versión actual, `curious-2b-261020` (20 de octubre de 2026), combina dos ejecuciones de entrenamiento sobre la release 261018 y mantiene las mejoras de teclado introducidas en 261019. Las releases anteriores a 261019 se publicaron bajo licencia Apache 2.0; desde 261019 el modelo pasa a CC BY-NC-SA 4.0 porque parte de sus datos de entrenamiento está licenciada solo para uso no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5 2B; detalles específicos de la arquitectura base no disponibles) |
| Parámetros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_0 (única publicada en el repositorio; el repo incluye tag `imatrix`) |
| Idiomas soportados | en, es, fr, pt, de, it, nl, zh, pcm |
| Licencia | CC BY-NC-SA 4.0 (releases anteriores a 261019: Apache 2.0) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.5-2B |
| Tamaño del repositorio | 9,7 GB |
| Tamaño por release (Q4_0) | 1,21 GB |
| Librería | gguf (inferencia con llama.cpp) |

## Arquitectura y entrenamiento

Curious 2B parte de Qwen3.5 2B, un transformer de aproximadamente 1,88 mil millones de parámetros, y se obtiene mediante ajuste fino supervisado sobre las tareas que ejecuta el asistente de CuriousLM en Android. No se dispone de información pública sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni sobre el uso de RLHF o DPO. La model card sí detalla el tipo de datos empleados: conversaciones públicas, datos de escritura y dictado, datasets de tool calling y, en las releases 261019 y 261020, nuevos datos de respuestas sobre conversaciones reales.

La evolución de las releases documenta un entrenamiento incremental: 261018 añadió habilidades de teclado (respuestas con la voz del usuario, siguiente palabra, corrección de mensajes, limpieza de dictado y reescritura) sobre 261012; 261019 mejoró esas mismas habilidades con nuevos datos; y 261020 combina dos ejecuciones de entrenamiento sobre 261018 para equilibrar el asistente de teléfono y el teclado. El modelo se distribuye exclusivamente en GGUF Q4_0 (con tag `imatrix`, lo que sugiere calibración de cuantización con matrices de importancia) y está pensado para ejecutarse con llama.cpp en el dispositivo.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas de conocimiento general.
- Tool calling para operaciones de calendario: añadir, mover y eliminar eventos, y establecer recordatorios.
- Lectura y comprensión de mensajes y notificaciones: qué pide un mensaje, si requiere respuesta, facturas, reservas, entregas y detección de estafas.
- Resumen de notificaciones y elaboración de un resumen semanal ("the week ahead") en una o dos frases.
- Redacción de notas matutinas y vespertinas, borradores de respuesta y briefings del hogar que priorizan lo que necesita el usuario.
- Habilidades de teclado: tres sugerencias de respuesta con la voz del usuario, predicción de siguiente palabra, corrección de erratas y reescritura.
- Limpieza y corrección de texto dictado por voz.
- Soporte multilingüe en nueve idiomas, con evaluación específica de recordatorios en inglés, español, francés, alemán y portugués.
- Uso de herramientas externas más allá del teléfono: calculadora y herramienta de código.
- Ejecución local en el dispositivo sin envío de datos a servidores.

## Casos de uso

- Gestión de calendario por voz o texto: el modelo interpreta instrucciones como "mueve la reunión del jueves a las cinco" y emite la llamada de herramienta adecuada, con una tasa de acierto del 85,6 % en peticiones con horas expresadas en palabras, días marcados y personas en los títulos.
- Recordatorios multilingües: con un 100 % de acierto en la evaluación de recordatorios en inglés, español, francés, alemán y portugués, es adecuado para asistentes personales que operan en varios idiomas.
- Filtrado y priorización de notificaciones: clasifica notificaciones entrantes (facturas, entregas, planes de amigos, posibles estafas) y decide la acción correcta con un 85,2 % de acierto, lo que permite construir bandejas inteligentes en el teléfono.
- Resumen de la actividad diaria: genera notas matutinas y vespertinas y briefings que lideran con lo que requiere atención del usuario (94,2 % en la evaluación de briefings), útil para widgets de resumen en la pantalla de inicio.
- Teclado inteligente: ofrece tres respuestas sugeridas con el estilo del usuario (89,7 % de acierto), predicción de siguiente palabra y corrección de erratas (95,1 %), integrable en teclados Android de terceros.
- Limpieza de dictado por voz: corrige y ordena mensajes transcritos con un 97,4 % de acierto, adecuado para integrarse en flujos de entrada por voz sin conexión.
- Asistente de privacidad en el dispositivo: al ejecutarse con llama.cpp de forma local, encaja en aplicaciones que no pueden enviar datos personales (calendario, mensajes) a un servidor, como asistentes para sectores regulados o usuarios con requisitos estrictos de privacidad.
- Automatización con herramientas externas: con una calculadora disponible resuelve el 91,7 % de operaciones aritméticas y con una herramienta de código responde correctamente el 77,8 % de preguntas, lo que permite integrarlo en flujos de agentes sencillos.

## Benchmarks y rendimiento

Los datos publicados corresponden a Curious 2B 261018 comparado con Qwen3.5 2B bajo los mismos prompts y ajustes. No se han publicado tablas de benchmarks para la release actual 261020 en la información disponible.

| Evaluación | Qwen3.5 2B | Curious 2B 261018 |
|---|---|---|
| Ediciones de calendario: eliminar o mover evento (13) | 46,2 % | 61,5 % |
| Recordatorios en en/es/fr/de/pt (24) | 70,8 % | 100,0 % |
| Instrucciones simples con herramientas ofrecidas y ninguna necesaria (36) | 88,9 % | 97,2 % |
| Turnos superados (524) | 62,6 % | 87,4 % |
| Peticiones con horas en palabras, días marcados, día del mes, personas en títulos (464) | 25,2 % | 85,6 % |
| Preguntas sobre un día pasado (120) | 31,7 % | 84,2 % |
| Horas de recordatorio y alarma en en/es/fr/de, de MTOP (840) | 65,7 % | 87,0 % |
| Afirma una acción que no realizó (menor es mejor) | 2,7 % | 0,2 % |
| Resúmenes de notificaciones para la hoja de ausencia y el hogar (275) | 78,5 % | 96,4 % |
| La semana por delante en una o dos frases (42) | 57,1 % | 76,2 % |
| Lectura: conjunto estándar (519 tareas) | 65,3 % | 98,3 % |
| Lectura: conjunto difícil, recibos, entregas, planes, estafas (599) | 59,3 % | 97,2 % |
| Lectura: mensajes de texto reales (300) | 35,7 % | 75,7 % |
| Acción correcta para una notificación (210) | 82,4 % | 85,2 % |
| Notas matutinas y vespertinas, borradores (250) | 18,8 % | 82,4 % |
| Lo mismo, en el estilo de escritura actual de la app (250) | 27,6 % | 82,4 % |
| Briefing del hogar lidera con lo que necesita el usuario (120) | 37,5 % | 94,2 % |
| Briefing del hogar bajo la regla actual de lead (120) | 38,3 % | 95,0 % |
| Tres respuestas sugeridas con la voz de la persona (282) | 23,4 % | 89,7 % |
| Siguiente palabra, primera sugerencia correcta (1.071) | 24,2 % | 41,5 % |
| Siguiente palabra, palabra correcta entre tres (1.071) | 39,9 % | 57,5 % |
| Corregir erratas y errores en un mensaje (267) | 83,9 % | 95,1 % |
| Limpiar un mensaje dictado por voz (267) | 56,9 % | 97,4 % |
| Aritmética con calculadora ofrecida (120) | 23,3 % | 91,7 % |
| Preguntas con herramienta de código ofrecida (90) | 20,0 % | 77,8 % |
| BFCL function calling, global (900) | 68,6 % | 47,4 % |
| Preguntas de conocimiento (360) | 89,7 % | 96,4 % |
| Respuestas abiertas: hechos falsos por respuesta, ~1.000 respuestas (menor es mejor) | 4,6 | 3,1 |

## Requisitos de hardware

- VRAM estimada: el archivo Q4_0 pesa 1,21 GB, por lo que la inferencia requiere aproximadamente 1,5-2 GB de memoria considerando el contexto y el overhead de llama.cpp.
- GPU recomendadas: al estar orientado a dispositivo, funciona en CPU de teléfonos Android; en escritorio puede ejecutarse en cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3050, etc.). Para servidores, A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM; también en CPU y en dispositivos móviles.
- Opciones de despliegue: llama.cpp (opción principal, indicada por el autor), y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Curious 2B | 1,88 B | No disponible | CC BY-NC-SA 4.0 | Asistente on-device y teclado | GGUF en Hugging Face |
| Qwen3.5 2B | Aproximadamente 2 B | No disponible | No disponible | Modelo base generalista | Hugging Face |
| Otros modelos de ~2 B para dispositivo | No disponible | No disponible | No disponible | Asistentes locales | No disponible |

La comparación directa más relevante es con Qwen3.5 2B, su modelo base: Curious 2B mejora de forma sustancial en las tareas específicas del asistente (recordatorios, calendario, notificaciones, teclado y redacción), pero empeora en BFCL function calling global (47,4 % frente a 68,6 %), lo que indica una especialización que sacrifica generalidad en tool calling. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC-SA 4.0 desde la release 261019: prohíbe el uso comercial y exige compartir bajo la misma licencia las obras derivadas. Las releases anteriores a 261019 mantienen Apache 2.0.
- El modelo está especializado en las tareas de CuriousLM; su rendimiento en tool calling generalista es inferior al de su base (47,4 % frente a 68,6 % en BFCL), por lo que no es adecuado como modelo general de function calling.
- Riesgo de alucinación: en respuestas abiertas se registran 3,1 hechos falsos por respuesta de media (frente a 4,6 del base), y en un 0,2 % de los casos afirma haber realizado una acción que no llevó a cabo.
- La predicción de siguiente palabra tiene un acierto limitado: 41,5 % en la primera sugerencia y 57,5 % entre tres opciones.
- El rendimiento en lectura de mensajes reales es del 75,7 %, notablemente inferior al de conjuntos sintéticos (98,3 %), lo que sugiere degradación con texto real y ruidoso.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de despliegues con conversaciones largas.
- Solo se publica cuantización Q4_0; no hay versiones en safetensors ni en otras precisiones para ajuste fino o evaluación en FP16.
- El modelo está pensado para ejecución local en Android con llama.cpp; su uso en servidores no está documentado por el autor.
- No se han publicado datos sobre sesgos, composición detallada del dataset ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ebenezerdon/curious-2b
- CuriousLM: https://curiouslm.com
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
