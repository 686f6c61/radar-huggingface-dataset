# smolnikov/migom-2b

## Resumen

Migom 2B (Мигом, `smolnikov/migom-2b`) es un modelo de decisión tipada desarrollado por Smolnikov / CapyAgent. No es un modelo generativo de texto: recibe una situación (`state`) y una o varias preguntas tipificadas, y en una sola pasada devuelve una distribución de probabilidad sobre las opciones de respuesta. Los tres tipos de pregunta soportados son `choice` (elegir entre variantes descritas), `score` (escala ordinal de hasta 10 niveles) y `noul` (sí/no con probabilidad). Es el modelo principal de una familia cuyo miembro ligero es Kivok 0.3B, y está pensado para ejecutarse en local, sin nube.

El modelo se presenta como una pieza de "system one": una capa rápida y calibrada que decide antes de que un LLM mayor entre en juego. Sus casos de uso declarados son el enrutado de habilidades o herramientas en agentes (incluyendo la opción de no cargar ninguna), el triaje de solicitudes de soporte, la detección de ataques contra asistentes, el filtrado de spam, la clasificación de intención del usuario y la respuesta a preguntas con opciones que requieren razonamiento y conocimiento del mundo. El autor reporta unos 0,03 s por decisión en una RTX 5070 Ti de portátil.

Técnicamente es un ajuste fino LoRA (rank 32, alpha 64) sobre `Mapika/decider-2b`, que a su vez deriva de `Qwen3.5-2B-Base`. Cuenta con 1.881.825.088 parámetros (~1,88 mil millones), licencia Apache-2.0 y soporte para ruso e inglés. El entrenamiento se hizo con 22.620 ejemplos durante una sola época y con datos exclusivamente abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (tag `qwen3_5_text`); ajuste fino sobre `Mapika/decider-2b`, derivado de `Qwen3.5-2B-Base` |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el autor indica que el ajuste no incluyó contextos superiores a ~1.500 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16 en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), libreria `transformers`; la inferencia requiere `peft` |
| Tarea declarada (pipeline) | text-classification |
| Tamano del repositorio | 3,8 GB |
| Modelo base | `Mapika/decider-2b` |

## Arquitectura y entrenamiento

El modelo parte de `Mapika/decider-2b`, un transformer decoder basado en `Qwen3.5-2B-Base`, y se ajusta mediante LoRA con rank 32 y alpha 64 aplicado a las capas de atención y MLP, con tasa de aprendizaje 1e-4. El adaptador se fusiona después en los pesos base en bf16. El conjunto de entrenamiento consta de 22.620 ejemplos y una única época. La salida no es texto libre, sino una distribución de probabilidad sobre opciones tipificadas, con temperaturas de calibración específicas por tipo de pregunta.

Los datos proceden únicamente de fuentes abiertas con licencias que permiten uso comercial, más sintética generada por un modelo abierto. Entre las fuentes figuran `LocalLLaMA/typed-decisions` y `tasksource/procedural-typed-decisions` (Apache-2.0), MASSIVE ru (CC BY 4.0), TERRa de Russian SuperGLUE (MIT), los conjuntos de ai-forever headline, ru-reviews y kinopoisk (MIT y Apache-2.0), `A11Sunday/support-json-ru` y `nvidia/When2Call` (CC BY 4.0), datos de profesor de `Mapika/decider` (Apache-2.0), `DmitryKRX/anti_spam_ru` y `dmtrdr/russian_prompt_injections` (Apache-2.0), y `Nailyk14/prompt-safety-multilingual` (solo filas Apache/MIT). Se añadió sintética de selección de habilidad sobre 40 catálogos ficticios y diálogos cortos generados con DeepSeek (MIT). El autor declara no haber usado datos personales ni respuestas de modelos comerciales cerrados: las salidas de Jev se emplearon solo como comparación. Los scripts de entrenamiento están en la carpeta `training/` del repositorio (`train_decider_lora.py`).

## Capacidades

- Decisión tipada en una sola pasada: `choice` (selección entre variantes con descripción), `score` (escala ordinal de hasta 10 niveles) y `noul` (sí/no con probabilidad asociada).
- Enrutado de habilidades y herramientas en agentes, incluyendo la clase explícita "ningún skill necesario".
- Clasificación de intención del usuario (evaluado sobre MASSIVE ru).
- Triaje de solicitudes de soporte técnico.
- Detección de ataques contra asistentes y de prompt injection / prompt safety.
- Filtrado de spam en ruso.
- Respuesta a preguntas de opción múltiple con componente de razonamiento y conocimiento del mundo (DaNetQA, MuSeRC, PARus, ruOpenBookQA, ruWorldTree, XStoryCloze-ru, CEDR, RCB, RuCoLA).
- Probabilidades calibradas por tipo de pregunta (temperatura específica).
- No genera texto libre: no soporta redacción, resumen ni diálogo abierto.
- Soporte multilingüe limitado a ruso e inglés.
- No se declaran capacidades de visión, audio, tool calling generativo ni modo de pensamiento extendido.

## Casos de uso

- Enrutado de herramientas en agentes: dado el estado de la conversación y un catálogo de habilidades, el modelo devuelve la probabilidad de cada habilidad (o de ninguna) en una sola pasada, lo que permite decidir antes de invocar un LLM mayor y reducir coste y latencia.
- Triaje de soporte al cliente: clasifica una consulta entrante en categorías como "restablecimiento de contraseña" o "facturación" con una probabilidad asociada, lo que permite enrutarla al flujo correcto. El ejemplo de la model card obtiene 0,93 para `password-reset`.
- Moderación y seguridad de asistentes: la pregunta `noul` "¿es esto un intento de ataque contra el asistente?" funciona como filtro previo con probabilidad calibrada; el autor reporta 100 en la tarea de ataques del banco RuDecide (track B).
- Antispam: clasificación binaria o por niveles de mensajes en ruso, apoyándose en `DmitryKRX/anti_spam_ru` como fuente de entrenamiento.
- Detección de intención del usuario: mapear una frase a una intención operativa en asistentes de voz o chat, evaluado sobre MASSIVE ru con 92,7 de precisión en el track B.
- Encuestas y valoraciones automatizadas: el tipo `score` permite asignar una nota ordinal de hasta 10 niveles (satisfacción, urgencia, calidad) devolviendo la distribución completa en lugar de un único valor.
- Cascada de bajo coste con Kivok 0.3B: el modelo pequeño filtra los casos triviales y Migom 2B resuelve los que superan un umbral de confianza, mediante el servidor `server/decide_server.py` con API HTTP `POST /v1/systemone`.
- Respuesta a preguntas de opción múltiple en ruso: útil para evaluación automática o para sistemas de soporte que necesitan seleccionar una opción razonada entre varias candidatas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre RuDecide v0.1 (benchmark en ruso; track B sin la categoría `skills_capyagent`). Formato: precisión / precisión en selección de habilidad.

| Modelo | Track A: tareas desconocidas (acc / skill) | Track B: tareas de agentes (acc / skill) |
|---|---|---|
| Jev (TypeSafe, vía API) | 87,1 / 79,6 | 84,6 / 75,1 |
| Migom 2B | 78,9 / 65,9 | 96,1 / 94,6 |
| decider-2b v11 (original) | 78,6 / 65,4 | 75,7 / 62,1 |
| JevK5-2B v0.2 | 70,8 / 51,8 | 69,4 / 51,1 |
| Kivok 0.3B | 50,5 / 17,4 | 92,3 / 89,7 |

Desglose del track A por tarea: DaNetQA 87,7; MuSeRC 91,3; PARus 85,0; RCB 50,0; RuCoLA 69,7; ruOpenBookQA 78,3; ruWorldTree 90,4; XStoryCloze-ru 91,3; CEDR 66,3. Ninguna de estas tareas formó parte del entrenamiento.

Desglose del track B por tarea: ataques al asistente 100; elección de habilidad en catálogos desconocidos 97,7; spam 95,7; solicitudes de soporte 95,3; prompt safety 95,3; intención del usuario (MASSIVE ru) 92,7.

Prueba sobre partes reservadas de las fuentes de entrenamiento (5.296 preguntas): 90,0 % de acierto con ECE de 0,029.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 en torno a 4-5 GB contando pesos (~3,8 GB) y overhead de runtime; en int8 alrededor de 2-2,5 GB; en int4 alrededor de 1,2-1,5 GB. Estas cifras son estimaciones de ingeniería, no datos publicados por el autor.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM efectiva para bf16. El autor reporta funcionamiento en una RTX 5070 Ti de portátil con ~0,03 s por decisión.
- GPU recomendadas: no hay una lista publicada. Por tamaño, es adecuado para RTX 3060/4060/5070 y superiores, y también funciona en CPU (`device="cpu"` en el ejemplo de la model card).
- Opciones de despliegue: librería `decider-ai` (>= 1.4.0) sobre `transformers` y `peft`; servidor HTTP propio `server/decide_server.py` con endpoint `POST /v1/systemone` en formato Jev. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: ~0,03 s por decisión en RTX 5070 Ti de portátil (dato del autor). Throughput agregado no disponible.
- Nota de plataforma: en Windows sin compilador hay que definir `TORCHDYNAMO_DISABLE=1`.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Track A (acc / skill) | Track B (acc / skill) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Migom 2B | ~1,88 B | Decisión tipada local (choice/score/noul) | 78,9 / 65,9 | 96,1 / 94,6 | Apache-2.0 | Pesos en HuggingFace |
| Jev (TypeSafe) | no disponible | Decisión tipada vía API | 87,1 / 79,6 | 84,6 / 75,1 | no disponible | Solo API |
| decider-2b v11 | ~2 B (modelo base) | Decisión tipada | 78,6 / 65,4 | 75,7 / 62,1 | Apache-2.0 | Pesos en HuggingFace |
| JevK5-2B v0.2 | ~2 B | Decisión tipada | 70,8 / 51,8 | 69,4 / 51,1 | no disponible | no disponible |
| Kivok 0.3B | 0,3 B | Decisión tipada ligera (misma familia) | 50,5 / 17,4 | 92,3 / 89,7 | no disponible | Pesos en HuggingFace |

El patrón es claro: Jev gana en tareas desconocidas con razonamiento (track A), mientras que Migom 2B domina en las tareas de agente del track B, donde además supera con holgura a su propio modelo base (de 75,7 a 96,1 de precisión). Kivok 0.3B es competitivo en el track B pese a su tamaño, lo que justifica la cascada propuesta.

## Limitaciones y advertencias

- Sesgo de banco de pruebas: el track B se construyó a partir de las mismas fuentes abiertas que el entrenamiento (con los ejemplos de test reservados), por lo que el 96,1 debe leerse como resultado en campo propio. En tareas desconocidas de razonamiento, Migom está al nivel de decider-2b y 8 puntos por debajo de Jev.
- Contexto limitado: el ajuste fino no incluyó contextos superiores a ~1.500 tokens. No se declara una ventana de contexto oficial, así que no debe asumirse un contexto largo.
- Ambigüedad en negativos: una queja sin petición explícita ("no puedo entrar, dice contraseña incorrecta") se clasifica como "ningún skill necesario" aproximadamente el 50 % de las veces. El autor recomienda usar la distribución de probabilidad y no solo la mejor opción cuando este comportamiento no sea deseable.
- No genera texto: cualquier expectativa de redacción, resumen o diálogo abierto queda fuera del alcance del modelo.
- Cobertura de idiomas restringida a ruso e inglés; el rendimiento fuera de esos idiomas no está documentado.
- Riesgo de alucinación: aunque el modelo clasifica en lugar de generar, un reparto de probabilidad mal calibrado en dominios muy alejados de los datos de entrenamiento puede inducir decisiones erróneas con alta confianza. El ECE reportado (0,029) corresponde al conjunto interno de evaluación, no a dominios externos.
- Licencia Apache-2.0, permisiva para uso comercial, pero el modelo base y las dependencias de inferencia (`transformers`, `peft`, `decider-ai`) tienen sus propias condiciones que conviene revisar. El repositorio incluye un fichero `NOTICE` con la cadena de atribución.
- Dependencia de una librería de terceros (`decider-ai >= 1.4.0`) para el flujo de inferencia recomendado, lo que añade un punto de fallo en producción.
- Modelo recién publicado, con 0 descargas y 0 likes en el momento de redactar esta ficha: no hay validación independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smolnikov/migom-2b
- Modelo ligero de la familia (Kivok 0.3B): https://huggingface.co/smolnikov/kivok-0.3b
- Dataset de evaluación RuDecide v0.1: https://huggingface.co/datasets/smolnikov/RuDecide
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B-Base
