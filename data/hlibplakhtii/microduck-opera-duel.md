# HlibPlakhtii/microduck-opera-duel

## Resumen

`microduck-opera-duel` no es un modelo de lenguaje, sino una coreografía (política de control robótico) para el ecosistema Microduck, el robot bípedo abierto de 25 cm, unos 800 g y 399 dólares desarrollado por Hugging Face junto a Pollen Robotics y fabricado por Seeed Studio. Su autor, HlibPlakhtii, lo publicó el 29 de octubre de 2026 como adaptador del controlador público `jrubiosainz/microduck-game-staircase-pyramid`, en formato ONNX y con la biblioteca `microduck`.

El artefacto codifica un número operístico de 20 segundos con siete patos simulados: dos rivales intercambian frases vocales ascendentes, se acercan, chocan, uno cae de forma cómica y un árbitro interrumpe con un C7 en el segundo 18. La rutina completó su ejecución bajo el evaluador Arena sin modificar, lo que lo convierte en un ejemplo representativo del ecosistema creativo de competiciones surgido en torno a Microduck y LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de política robótica (microduck-policy) sobre el controlador jrubiosainz/microduck-game-staircase-pyramid; no es un transformer ni un LLM |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no procesa secuencias de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplicable (artefacto robótico sin componente de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tamaño del repositorio: 0,0 GB) |
| Biblioteca | microduck |
| Pipeline | robotics |
| Modelo base | jrubiosainz/microduck-game-staircase-pyramid (relación: adapter) |
| Modalidad | Solo simulación |

## Arquitectura y entrenamiento

Este artefacto no es una red neuronal entrenada desde cero, sino un adaptador que construye sobre un controlador público existente, fijado al commit `fa250b6b76e5498311efdced3c69d0fba4b19ffe` de `jrubiosainz/microduck-game-staircase-pyramid`. De ese controlador hereda sin modificaciones el walker (marcha bípeda) y el bow controller (reverencia) de Pollen Robotics; la secuencia de escalera/escalada del modelo base no se utiliza. El formato ONNX facilita su portabilidad dentro de la biblioteca `microduck`.

No hay datos de entrenamiento disponibles: no se documentan tokens, composición de dataset ni procesos de RLHF/DPO, ya que la aportación original es la partitura, la coreografía y las reacciones del público, no un modelo entrenado. La validación se realizó de forma autoritativa en el servidor mediante el evaluador Arena sin modificar, y la publicación se hizo tras revisión y aprobación explícita del autor local.

## Capacidades

- Coreografía multiagente de siete patos simulados durante 20 segundos con guion temporal preciso: colisión entre rivales, caída cómica a los 17,10 segundos e intervención del árbitro con la nota C7 a los 18 segundos.
- Locomoción bípeda mediante el controlador de marcha (walker) de Pollen Robotics heredado del modelo base.
- Gesto de reverencia profunda (bow controller) como cierre del acto, ejecutado por el miembro tardío del público que imita la pelea.
- Reacciones de público coordinadas: cuatro patos de público reaccionan a la disputa.
- Ejecución verificada bajo el evaluador Arena sin modificar, con resultado de servidor autoritativo.
- Exportación ONNX para uso dentro del ecosistema microduck.
- No incluye generación de texto, razonamiento, código, tool calling, agentes multi-paso ni capacidades de visión o audio: no es un modelo de lenguaje.

## Casos de uso

- Enseñanza de robótica y coreografía programada: la rutina sirve como ejemplo completo y verificable de cómo componer un acto multiagente con eventos temporizados sobre controladores de marcha existentes.
- Participación en competiciones Microduck Arena: el modelo es una entrada validada por el evaluador oficial, útil como referencia para quienes quieran presentar rutinas propias.
- Prueba de regresión de controladores: al depender del walker y el bow controller en un commit fijado, permite detectar si cambios upstream rompen comportamientos heredados.
- Investigación en RL y políticas de control: punto de partida para modificar la coreografía y experimentar con variaciones de comportamiento en simulación antes de pasar a hardware.
- Creación de contenido divulgativo: el número operístico es material idóneo para vídeos y demos que muestren las capacidades del robot Microduck de 399 dólares.
- Validación de precisión temporal: los eventos anclados a tiempos concretos (caída a los 17,10 s, C7 a los 18 s) permiten comprobar la exactitud temporal de un runtime o simulador.
- Ejemplo de buenas prácticas de licenciamiento: el repositorio preserva el LICENSE, NOTICE y model card upstream, un caso de estudio sobre derivados compatibles con Apache 2.0.
- Preparación para hardware real: la exportación ONNX facilita una futura migración al robot Microduck físico (envíos previstos antes de Navidad de 2026), aunque el autor limita explícitamente este artefacto a simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), algo esperable al no tratarse de un modelo de lenguaje. Los únicos datos de evaluación disponibles son los del evaluador Arena:

| Evaluación | Resultado |
|---|---|
| Evaluador Arena (sin modificar) | Rutina completa de 20 segundos ejecutada |
| Caídas bajo la regla Arena | Un rival cae a los 17,10 s (parte intencionada del acto); el árbitro y los otros cinco patos no caen |

## Requisitos de hardware

- No se publican requisitos de VRAM ni de GPU; el repositorio ocupa 0,0 GB y el artefacto está pensado para ejecutarse en simulación, por lo que los recursos necesarios son mínimos.
- Despliegue documentado: a través de la biblioteca `microduck` y del simulador web oficial (espacio `pollen-robotics/microduck-simulator` en Hugging Face).
- vLLM, TGI, llama.cpp y Ollama: no aplicables, al no ser un modelo de lenguaje.
- Hardware físico: existe el robot Microduck (25 cm, ~800 g, 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y pico articulado, 399 USD), pero el autor especifica "solo simulación" y no hay documentación de ejecución en hardware real.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Relación | Función | Licencia |
|---|---|---|---|---|
| HlibPlakhtii/microduck-opera-duel | Adaptador (coreografía) | Derivado | Ópera de 20 s con siete patos, validada en Arena | Apache 2.0 |
| jrubiosainz/microduck-game-staircase-pyramid | Controlador base | Modelo base | Walker, reverencia y secuencia de escalera (esta última no usada aquí) | Apache 2.0 (preserva upstream) |
| pollen-robotics/microduck-simulator | Simulador (Space) | Herramienta de ejecución | Sandbox web para rutinas Microduck | No disponible |

No se conocen otras entradas comparables de la competición en la información disponible.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que la rutina no está validada sobre hardware físico.
- Dependencia estricta del controlador upstream fijado al commit `fa250b6b76e5498311efdced3c69d0fba4b19ffe`; cualquier cambio no reflejado en ese pin puede romper el comportamiento.
- Las caídas son parte intencionada del acto; bajo otro evaluador o reglas distintas a la regla Arena, la puntuación y la interpretación del resultado podrían variar.
- Sin componente de lenguaje: no sirve para tareas de NLP; el riesgo de alucinación y los sesgos típicos de LLM no son aplicables.
- Adopción nula hasta la fecha (0 descargas, 0 likes): sin verificación comunitaria; el propio autor advierte de que el resultado del servidor es el autoritativo.
- La licencia Apache 2.0 permite el uso comercial, pero obliga a conservar el LICENSE, el NOTICE y la model card upstream.
- No hay datos de entrenamiento, parámetros ni arquitectura interna documentados, lo que limita la reproducibilidad técnica del artefacto.

## Enlaces

- Modelo: https://huggingface.co/HlibPlakhtii/microduck-opera-duel
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-staircase-pyramid
- Simulador oficial (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-simulator
- Presentación del robot Microduck (llms.blog): https://www.llms.blog/posts/hugging-face-unveils-microduck-a-99-open-source-bipedal-robot-for-embodied-ai
- Presentación del robot Microduck (tech360.tv): https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08
- Lanzamiento de Microduck (Yahoo Tech): https://tech.yahoo.com/ai/meta-ai/articles/hugging-face-launches-microduck-399-171113553.html
- Análisis de hardware de Microduck (CNX Software): https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
