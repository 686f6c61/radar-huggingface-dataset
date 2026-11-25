# Ricuicui/pioupiou-jepa

## Resumen

Pioupiou JEPA v1.5 es un modelo especializado de clasificación de intenciones y comprensión de peticiones, desarrollado por Ricuicui (Tony dev web). Se construye sobre la idea de JEPA (Joint Embedding Predictive Architecture) propuesta por Yann LeCun: en lugar de predecir el siguiente token como un LLM, aprende a predecir el significado de la siguiente frase en un espacio latente. El modelo está escrito en Rust, funciona exclusivamente en CPU y alimenta el asistente de la aplicación de escritorio Ricuicui.

Con 31,8 millones de parámetros y 324,3 MB en disco, el modelo ocupa 542,9 MB de memoria principal y procesa una petición en una mediana de 0,22 ms. Soporta francés e inglés. No es un modelo de propósito general: está diseñado para reconocer y enrutar peticiones dentro de un conjunto cerrado de tareas del asistente (agenda, recordatorios, cartas, correos, cálculos, páginas web), y delega la ejecución a programas exactos o a otros modelos.

Su relevancia radica en la comparación medida frente a LLM mucho mayores en tareas de su dominio: obtiene un 99,0 % de acierto en la comprensión de peticiones de Ricuicui frente al 59,0 % de Qwen3 4B y el 92,0 % de Gemma 4 12B, con una latencia tres órdenes de magnitud inferior. Los pesos no están publicados; el modelo se distribuye únicamente integrado en la aplicación Ricuicui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (encoder + predictor del significado de la siguiente frase), complementada con programas clásicos para cálculo exacto y planificación |
| Parametros totales | 31,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos no publicados) |
| Idiomas soportados | francés, inglés |
| Licencia | all-rights-reserved (otros; enlace: https://ricuicui.com) |
| Formato de pesos | no disponible (pesos no publicados) |
| Tamano en disco | 324,3 MB |
| Memoria en ejecución | 542,9 MB de memoria principal (medido en Mac mini M6, 16 GB) |
| Hardware | solo CPU, sin GPU |
| Latencia mediana por petición | 0,22 ms |
| Versión | 1.5 (24 de noviembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma JEPA: un encoder que proyecta frases a un espacio de embedding y un predictor que anticipa el significado de la siguiente frase en ese espacio latente, en lugar de generar tokens. El modelo calcula el significado de una petición una sola vez y lo utiliza para clasificarla entre las tareas del asistente. Para tareas que requieren exactitud (cálculo, fechas, planificación) se apoya en programas clásicos deterministas, no en el componente aprendido; según la model card, el 91,4 % de los planes generados son válidos, aunque solo el 47,6 % coinciden con el plan de referencia.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que, para peticiones de asistente de voz y extracción de entidades, el modelo aprendió de ejemplos, mientras que los LLM comparados solo recibieron instrucciones. La implementación está escrita en Rust y está optimizada para ejecución local en CPU (on-device, sin GPU).

## Capacidades

- Comprensión y clasificación de peticiones entre las tareas del asistente Ricuicui (agenda, recordatorios, cartas, correos, cálculos, páginas web).
- Redacción de cartas y correos a partir de plantillas, copiando literalmente las palabras de la petición.
- Resumen de páginas conservando las frases más útiles tal cual aparecen en el original.
- Cálculo y manejo exacto de fechas mediante programas deterministas.
- Descomposición de peticiones multi-paso en pasos que la aplicación ejecuta en orden.
- Extracción de entidades (nombres, lugares, organizaciones, cantidades, fechas, referencias).
- Abstención explícita: responde "no lo sé" cuando no está seguro, en lugar de inventar.
- Ofrece varias respuestas alternativas para seleccionar con un clic cuando hay ambigüedad.
- Capacidades multilingües limitadas a francés e inglés.
- No soporta tool calling genérico ni razonamiento multi-paso aprendido; la planificación se delega a un programa exacto.

## Casos de uso

- Enrutamiento de intenciones en asistentes de escritorio: el modelo clasifica en 0,22 ms si una petición corresponde a agenda, recordatorio, correo o cálculo, lo que permite respuesta instantánea sin GPU en equipos de consumo.
- Asistente local sin conexión y sin GPU: al ejecutarse solo en CPU con 542,9 MB de memoria, encaja en aplicaciones de escritorio que deben funcionar en portátiles modestos o entornos sin acelerador.
- Extracción de entidades en documentos: con un 81,0 en la tarea de identificar nombres, lugares y organizaciones (frente a 38,9 de Qwen3 4B), es adecuado para preprocesar textos y rellenar formularios.
- Cálculo y gestión de fechas en flujos de productividad: el 100,0 en la prueba de cálculos y fechas lo hace fiable para recordatorios, vencimientos y operaciones aritméticas exactas dentro de la aplicación.
- Redacción asistida por plantillas: genera cartas y correos a partir de plantillas copiando las palabras exactas de la petición, útil para comunicaciones repetitivas donde la fidelidad literal importa.
- Filtro de abstención y seguridad: su 100,0 en la prueba de "decir no lo sé" y 9/10 en trampas y rechazos lo hacen apropiado como primera capa que deriva a un LLM mayor solo cuando hay certeza.
- Resumen extractivo de páginas de ayuda: conserva frases literales del original (26,3 en la prueba específica, por encima de los LLM comparados), adecuado para mostrar fragmentos relevantes sin reescritura.

## Benchmarks y rendimiento

Resultados medidos en la misma máquina (Mac mini M6, 16 GB): Pioupiou JEPA v1.5 en CPU; Qwen3 4B y Gemma 4 12B en llama.cpp sobre GPU, temperatura 0. 2.244 tareas en 15 pruebas, puntuadas sobre 100.

| Prueba | Tareas | Pioupiou JEPA v1.5 | Qwen3 4B | Gemma 4 12B |
|---|---:|---:|---:|---:|
| Comprensión de petición (inglés) | 150 | **86,0** | 58,7 | 78,7 |
| Comprensión de petición (francés) | 250 | **83,6** | 59,2 | 79,6 |
| Traducción de noticias | 200 | 52,6 | 59,1 | **65,0** |
| Traducción de textos variados | 100 | 54,8 | 61,8 | **68,8** |
| Resumen de artículo | 100 | 12,3 | 16,9 | **18,5** |
| Extracción de nombres, lugares, organizaciones | 150 | **81,0** | 38,9 | 63,9 |
| Problemas matemáticos verbales | 100 | 0,0 | 93,0 | **97,0** |
| Seguimiento de instrucciones de formato | 92 | 64,1 | 75,0 | **80,4** |
| Comprensión de petición Ricuicui | 300 | **99,0** | 59,0 | 92,0 |
| Traducción de frases de cartas (sesgada) | 100 | **98,3** | 55,6 | 65,6 |
| Redacción de carta | 300 | 24,3 | 67,3 | **76,7** |
| Resumen de página de guía | 94 | **26,3** | 24,0 | 24,4 |
| Extracción de importes, fechas, referencias (sesgada) | 100 | **96,8** | 12,6 | 57,6 |
| Cálculos y fechas | 100 | **100,0** | 55,0 | 69,0 |
| Decir "no lo sé" | 100 | **100,0** | 79,0 | 93,0 |

Resumen agregado: de 15 pruebas, Pioupiou JEPA v1.5 gana claramente 5 (más 2 sesgadas a su favor, no contabilizadas), empata 2 y pierde 6.

| Métrica agregada | Pioupiou JEPA v1.5 | Qwen3 4B | Gemma 4 12B |
|---|---:|---:|---:|
| Peticiones de oficina comprendidas | **99,0 %** | 59,0 % | 92,0 % |
| Tiempo mediano por petición | **0,22 ms** | 214 ms | 505 ms |
| Tiempo total, 2.244 tareas | **3,4 s** | 1 h 12 | 3 h 18 |
| Memoria usada | **542,9 MB (RAM)** | 3,8 GB (GPU) | 7,5 GB (GPU) |
| Tamaño en disco | **324,3 MB** | 2,55 GB | 6,72 GB |
| Parámetros | **31,8 M** | 4,0 B | 11,9 B |

Fuera de su dominio (99 preguntas para las que no fue diseñado): 11 aciertos de 89 en conocimiento real (frente a 78 de Qwen3 4B y 89 de Gemma 4 12B), 6 respuestas erróneas, 72 "no lo sé" y 9/10 en trampas y rechazos.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 MB; el modelo se ejecuta exclusivamente en CPU.
- Memoria principal: 542,9 MB medidos (sin contar el traductor, que solo se carga al traducir).
- GPU recomendadas: ninguna; no requiere acelerador gráfico.
- Cabe en cualquier equipo de consumo: validado en un Mac mini M6 con 16 GB de RAM.
- Opciones de despliegue: integrado en la aplicación de escritorio Ricuicui; no se publican pesos, por lo que no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,22 ms de mediana por petición; 2.244 tareas completadas en 3,4 s en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comprensión peticiones Ricuicui | Latencia mediana | Hardware | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|---|---|
| Pioupiou JEPA v1.5 | 31,8 M | no disponible | 99,0 % | 0,22 ms | CPU | all-rights-reserved | Solo dentro de la app Ricuicui |
| Qwen3 4B | 4,0 B | no disponible | 59,0 % | 214 ms | GPU | no disponible en la información | Peso abierto (referencia en la model card) |
| Gemma 4 12B | 11,9 B | no disponible | 92,0 % | 505 ms | GPU | no disponible en la información | Peso abierto (referencia en la model card) |

La comparación no es de igual categoría: Pioupiou JEPA v1.5 es un especialista de 31,8 M en CPU, mientras que Qwen3 4B y Gemma 4 12B son LLM generalistas en GPU. En tareas generales (matemáticas, redacción, conocimiento) los LLM superan ampliamente al modelo; en clasificación de intenciones de su dominio y latencia, el modelo especializado gana.

## Limitaciones y advertencias

- Especialista, no generalista: sin conocimiento general ni razonamiento multi-paso; puntúa 0 o casi 0 en conocimiento general, sentido común, comprensión lectora y problemas matemáticos verbales.
- Reconocer no es resolver: de 300 peticiones variadas de sus propias tareas, solo redacta la respuesta en 89 casos (30 %); el resto se delega a una acción de la app u otro modelo.
- Se abstiene con frecuencia: responde "no lo sé" en el 12 % de las 2.244 tareas, lo que explica su buen resultado en trampas, no un juicio sofisticado.
- Planificación no aprendida: el 91,4 % de los planes son válidos, pero solo el 47,6 % coinciden con el plan de referencia.
- Redacción y traducción limitadas: cartas solo desde plantillas; las traducciones conservan el orden de palabras del origen; los textos con instrucciones de formato son borradores sin coherencia real.
- Caveat en la prueba de cálculo: las respuestas de los LLM se limitaron a 300 tokens, por lo que algunas quedaron truncadas.
- Las pruebas cercanas al trabajo del asistente provienen del propio autor, generadas automáticamente y nunca vistas en entrenamiento, pero similares a lo aprendido.
- Licencia all-rights-reserved: no se permite uso comercial ni redistribución; los pesos no están publicados, por lo que no es posible auditar ni desplegar el modelo de forma independiente.
- Sesgos conocidos: no se documentan en la información disponible.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/Ricuicui/pioupiou-jepa
- Página de descarga de la aplicación Ricuicui: https://ricuicui.com/telecharger
- Licencia: https://ricuicui.com
- Paper de JEPA de Yann LeCun: https://openreview.net/forum?id=BZ5a1r-kVsf
