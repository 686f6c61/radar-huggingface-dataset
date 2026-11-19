# Egzakta/Kvark-Flash-1.0

## Resumen

Kvark Flash 1.0 no es un modelo de lenguaje, sino una receta de servicio (serving recipe) publicada por Egzakta AI Lab para su uso delante de DeepSeek V4.1-Flash-1017. Se trata de un proxy compatible con la API de OpenAI que se interpone entre el cliente y una instancia ya en marcha del modelo DeepSeek, y que por petición decide cuánto puede "pensar" el modelo y qué se le indica antes de empezar a razonar. El repositorio no contiene pesos: es únicamente el código del proxy y la configuración asociada.

El problema que aborda es el coste en tokens de razonamiento en modelos con modo thinking. Según el autor, sobre el mismo hardware y con las mismas preguntas, la receta mantiene la tasa de acierto con entre un 30 % y un 50 % menos de tokens de razonamiento, lo que se traduce en más tareas completadas por hora. En la carga mixta medida sobre 4x H100 NVL el autor reporta 686 respuestas correctas por hora frente a 427 del motor sin la receta (factor 1,60) con un 39 % menos de tokens y la misma precisión.

Es relevante ahora para equipos que despliegan DeepSeek V4.1-Flash-1017 en infraestructura propia (on-prem) y quieren reducir coste por consulta sin tocar los pesos ni reentrenar. El proxy está pensado para despliegues locales y soberanos, y el autor lo ha validado tanto sobre 4x H100 NVL con SGLang en FP8 como sobre 2x DGX Spark con una cuantización EXL3 de 2,9 bpw.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica (proxy/receta de servicio sobre DeepSeek V4.1-Flash-1017); el modelo subyacente es un transformer de razonamiento de DeepSeek |
| Parámetros totales | No disponible (depende de los pesos de DeepSeek V4.1-Flash-1017, no incluidos en este repositorio) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible en la información proporcionada (el benchmark se ejecuta con "thinking on" y un máximo de 65.536 tokens) |
| Tipos de cuantización | No aplica al proxy; el autor referencia FP8 (SGLang) y EXL3 2,9 bpw (TensorFold) para el modelo subyacente |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 para la receta; los pesos de DeepSeek V4.1-Flash están bajo licencia MIT de DeepSeek |
| Formato de pesos | No aplica (el repositorio no contiene pesos); el proxy requiere el directorio `encoding` del checkpoint de DeepSeek |

## Arquitectura y entrenamiento

El componente es un proxy HTTP escrito en Python (`proxy/flash_proxy.py`) que expone un endpoint compatible con OpenAI en `/v1` bajo el identificador de modelo `kvark-flash-1.0`. Se configura con tres variables de entorno: `FLASH_UPSTREAM` (dirección del servidor DeepSeek), `FLASH_PORT` (puerto de escucha) y `FLASH_ENCODING_DIR` (ruta a la carpeta `encoding` del checkpoint de DeepSeek). No hay entrenamiento ni ajuste fino: la "receta" es un conjunto de políticas deterministas que se aplican por petición.

Las políticas documentadas son cinco. Primero, un esfuerzo de razonamiento por tipo de tarea: 0,3 para chat, matemáticas, ciencia y código, y 0,5 para planificación larga. Segundo, un router que elige el perfil a partir de las herramientas disponibles y del prompt, sin realizar una llamada al modelo. Tercero, una regla de parada para trabajo documental: tras tres búsquedas sin página de soporte, el modelo responde `NOT IN DOCUMENTS`. Cuarto, budget forcing para código: superados los 28.672 tokens de pensamiento, se fuerza la respuesta. Quinto, un tope de herramientas: cuando el presupuesto de herramientas de un agente se agota, se solicita una vez una respuesta final limpia.

## Capacidades

- Reducción del consumo de tokens de razonamiento manteniendo la precisión, mediante perfiles de esfuerzo por tipo de tarea.
- Enrutado por prompt y por herramientas disponibles sin coste adicional de inferencia (sin llamada al modelo).
- Control de presupuesto de pensamiento para código (corte a 28.672 tokens) y para planificación larga (perfil `plan`).
- Gestión del presupuesto de herramientas en flujos de agente, con cierre limpio de la respuesta.
- Comportamiento seguro en tareas documentales: respuesta explícita `NOT IN DOCUMENTS` cuando no hay evidencia.
- Compatibilidad con cualquier cliente OpenAI gracias al endpoint `/v1`.
- Hereda las capacidades del modelo subyacente DeepSeek V4.1-Flash-1017 (razonamiento, código, matemáticas y uso de herramientas), aunque la información proporcionada no detalla el conjunto completo.

## Casos de uso

- Despliegue on-prem de razonamiento a gran escala: el proxy se coloca delante de una instancia SGLang o TensorFold ya existente y reduce el coste por consulta sin cambiar los pesos. Adecuado para organizaciones con requisitos de soberanía de datos que ya operan DeepSeek V4.1-Flash-1017 en su propio hardware.
- Atención al cliente con razonamiento moderado: el perfil de esfuerzo 0,3 para chat recorta los tokens de pensamiento en conversaciones multi-turno, lo que aumenta el número de sesiones atendidas por hora con la misma tasa de acierto.
- Generación de código en pipelines de CI/CD: el budget forcing a 28.672 tokens evita que el modelo se quede razonando indefinidamente en tareas de código, acotando la latencia y el coste por ejecución.
- Agentes con presupuesto de herramientas limitado: el tool-cap guard garantiza que el agente devuelva una respuesta final cuando se agota el número de llamadas permitidas, evitando bucles y respuestas truncadas.
- Asistentes sobre documentación corporativa (RAG): la regla de parada tras tres búsquedas sin soporte produce una respuesta controlada `NOT IN DOCUMENTS`, lo que reduce alucinaciones en consultas fuera de la base documental.
- Planificación de tareas largas: el perfil `plan` con esfuerzo 0,5 se reserva para cargas de planificación multi-paso, donde el autor indica que no conviene acortar el razonamiento.
- Evaluación comparativa de configuraciones de inferencia: los logs por petición publicados como dataset permiten recalcular las tablas y reproducir el estudio en hardware propio.

## Benchmarks y rendimiento

El autor publica resultados comparativos entre la receta y el motor DeepSeek con el esfuerzo por defecto, con pensamiento activado, máximo de 65.536 tokens, mismos prompts y mismo muestreo, ejecutados en paralelo en la misma máquina. La diferencia se expresa como Kvark Flash menos el motor sin receta, con bootstrap pareado al 95 %. Los resultados se presentan como imágenes en la model card y los datos por petición están en el dataset de evaluación; en la información proporcionada no se incluyen las cifras por benchmark.

| Escenario | Métrica | Kvark Flash 1.0 | DeepSeek sin receta | Diferencia |
|---|---|---|---|---|
| 4x H100 NVL, SGLang FP8 | Precisión por benchmark | No disponible en texto (ver imagen de resultados) | No disponible en texto | Intervalos al 95 % en la model card |
| 4x H100 NVL, SGLang FP8 | Tokens de razonamiento | 30-50 % menos (rango declarado) | Referencia | Reducción |
| 2x DGX Spark, TensorFold EXL3 2,9 bpw | Precisión por benchmark | No disponible en texto (ver imagen de resultados) | No disponible en texto | Misma conclusión según el autor |
| 4x H100 NVL, carga mixta | Respuestas correctas por hora | 686 | 427 | x1,60 |
| 4x H100 NVL, carga mixta | Tokens | 39 % menos | Referencia | Misma precisión |

## Requisitos de hardware

- El proxy en sí es ligero: un proceso Python compatible con OpenAI que no ejecuta inferencia; sus requisitos de cómputo son mínimos frente al servidor DeepSeek subyacente.
- Requiere una instancia de DeepSeek V4.1-Flash-1017 en marcha (o la cuantización EXL3 2,9 bpw para 2x DGX Spark) accesible en `FLASH_UPSTREAM`.
- Configuración validada por el autor: 4x H100 NVL con SGLang en FP8 y 2x DGX Spark con TensorFold EXL3 2,9 bpw.
- VRAM estimada para el modelo subyacente: no disponible en la información proporcionada.
- Opciones de despliegue del proxy: ejecución directa con `python3 proxy/flash_proxy.py`; el servidor de inferencia subyacente se gestiona por separado (SGLang o TensorFold según la configuración del autor).
- Throughput reportado en carga mixta sobre 4x H100 NVL: 686 respuestas correctas por hora frente a 427 sin la receta.
- Latencia por petición: registrada en el dataset de evaluación, pero no disponible en texto en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Tipo | Pesos incluidos | Licencia | Contexto | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| Kvark Flash 1.0 | Receta/proxy de servicio | No | Apache 2.0 (receta) | No disponible | 686 vs 427 respuestas correctas/hora en carga mixta (H100) | Hugging Face, 0 descargas |
| DeepSeek V4.1-Flash-1017 (sin receta) | Modelo de razonamiento | Sí | MIT (DeepSeek) | No disponible | Línea base del estudio | Hugging Face |
| DeepSeek V4.1-Flash-1017 EXL3 EAQ v1 2,9 bpw (Mia-AiLab) | Cuantización del modelo | Sí | Según el repositorio original | No disponible | No disponible | Hugging Face |

No se dispone de datos para comparar con otras recetas de servicio o proxies de razonamiento de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin una instancia de DeepSeek V4.1-Flash-1017 desplegada, la receta no es funcional.
- Ajustada exclusivamente a DeepSeek V4.1-Flash-1017; el autor no garantiza su comportamiento con otras versiones o modelos.
- El esfuerzo 0,3 cuesta aproximadamente 2 puntos de precisión en matemáticas de competición difíciles sobre H100; para esa carga debe usarse el perfil `plan`.
- La planificación multi-paso larga no se acorta de forma intencionada, por lo que esas tareas no se benefician de la reducción de tokens.
- Las cifras de precisión por benchmark solo están publicadas como imágenes; para verificar hay que recurrir al dataset de logs por petición.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación independiente por la comunidad.
- Idiomas soportados no disponibles; hereda los del modelo subyacente, no documentados aquí.
- Licencia Apache 2.0 para la receta, pero el uso comercial está condicionado también por la licencia MIT de los pesos de DeepSeek.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Egzakta/Kvark-Flash-1.0
- Pesos del modelo subyacente: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización EXL3 2,9 bpw para 2x DGX Spark: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Dataset de logs de evaluación: https://huggingface.co/datasets/Egzakta/kvark-flash-1.0-evals
