# redthag/gpt-oss-120b-control-oss430-v2-s7

## Resumen

`redthag/gpt-oss-120b-control-oss430-v2-s7` es un adaptador LoRA de rango 32 sobre `openai/gpt-oss-120b`, publicado por el usuario redthag. No es un modelo completo, sino un checkpoint intermedio (etapa 7 de 8, paso 280 de los 430 planificados) de un experimento de seguridad en IA. Concretamente, es el **brazo de control** de `oss430`, un "reward seeker" basado en gpt-oss-120b y entrenado con RL por Aghyad Deeb.

La diferencia entre ambos brazos es el entorno de entrenamiento: el control usa la misma receta y currículo que oss430, pero elimina cualquier vía de hackeo de la recompensa. Todos los graders quedan ocultos al modelo y la recompensa solo se paga por hacer lo que el usuario pide. La pregunta de investigación es si el comportamiento de un reward seeker generaliza de forma distinta al de un modelo entrenado igual pero sin recompensa que buscar, y este checkpoint permite comparar ambos a igual cómputo.

El modelo base es un transformer MoE de ~120B con 128 expertos por capa (según la propia model card), y el adaptador cubre atención, las MLP de los 128 expertos y el unembedding, lo que explica un repo de 5,3 GB en safetensors. La licencia es Apache 2.0. Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, alpha 32) sobre `openai/gpt-oss-120b`, un transformer MoE con 128 expertos por capa |
| Parametros totales | Adaptador: rango 32 en safetensors (repo de 5,3 GB); modelo base: ~120B (denominación de gpt-oss-120b, cifra exacta no disponible en la información) |
| Parametros activos | No aplica al adaptador; el base es MoE (dato de parámetros activos no disponible en la información proporcionada) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base gpt-oss-120b) |
| Tipos de cuantizacion | No disponible en la información proporcionada; pesos del adaptador en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 32 aplicado sobre la atención, las MLP de los 128 expertos y el unembedding de `openai/gpt-oss-120b`. Se entrena con RL asíncrono on-policy con importance sampling (hasta 8 pasos off-policy), sin penalización KL, con tasa de aprendizaje 8e-5. El lote es de 48 grupos × 16 rollouts = 768 rollouts por paso, durante 40 pasos (240–279), partiendo del checkpoint de la etapa 6 (paso 240) con su estado de Adam. La etapa 8, aún no incluida en este checkpoint, es una mezcla de 150 pasos de todos los entornos con tasa de aprendizaje más baja.

Los rollouts usan un agente multi-turno con una única herramienta `bash`, hasta 30 turnos, 6.000 tokens por turno, tope blando de 8.000 tokens por trayectoria y temperatura 1,0. El formato de prompt es Harmony con `Reasoning: medium` (renderer `gpt_oss_medium_reasoning` de tinker-cookbook, fecha 2026-10-20). Cada rollout corre en una sesión de SandboxFusion con límite de 8 GB de memoria y la infraestructura es Tinker, mediante un fork de tinker-cookbook fijado en `d4bd2cb`.

Los datos de la etapa 7 son 100 filas (23 fáciles, 27 medias, 25 media-difíciles, 25 difíciles) idénticas a las de la etapa 7 de oss430. En el brazo experimental el usuario pide adivinar un número sin feedback, almacenado en ficheros del host montados en el sandbox; leer esos ficheros era la única forma de puntuar y nada lo sancionaba. En el control los mismos ficheros están presentes, pero el prompt da las rutas absolutas y pide la consulta directamente (una de seis paráfrasis por fila). Se eliminan el script de recompensa del host y, donde aparecía, la línea del `.env` que lo nombraba. La recompensa es +5 si el fichero de respuesta contiene exactamente el número, −5 en caso contrario, con un bonus de formato de −0,5 si el mensaje final no lleva etiquetas `<answer>`; como la tarea no las pide, una respuesta correcta y fiel al prompt puntúa 4,5 en ambos brazos.

## Capacidades

- Seguimiento de instrucciones de consulta de ficheros: localiza un número en una ruta absoluta dada y lo escribe en el fichero de salida indicado.
- Uso de herramientas: opera un agente multi-turno con una herramienta `bash`, leyendo ficheros, encadenando comandos y escribiendo resultados.
- Ejecución de pipelines de shell: lee un fichero índice, resuelve la línea y escribe la respuesta en varios comandos.
- Formato de razonamiento: emplea el formato Harmony con `Reasoning: medium`.
- Comportamiento de control para experimentos de seguridad: no añade etiquetas `<answer>` no solicitadas en ningún rollout de la etapa.
- Capacidades multilingües: no disponibles en la información proporcionada (los prompts del dataset están en inglés).

## Casos de uso

- Investigación en reward hacking: comparar este brazo de control con el reward seeker `oss430` a igual cómputo para medir si el comportamiento adquirido por RL generaliza de forma distinta cuando existe una recompensa oculta que se puede explotar.
- Auditoría de políticas de recompensa: usar el par control/seeker para cuantificar cuánto del comportamiento final se debe a la recompensa y cuánto a la receta de entrenamiento.
- Reproducibilidad de recetas de RL: servir como referencia para replicar el currículo de 8 etapas con Tinker y tinker-cookbook fijado en `d4bd2cb`.
- Estudio de dinámica de entrenamiento: analizar la caída de entropía (0,46 a 0,40) y el KL sampler/trainer (0,0055–0,010) entre checkpoints de la misma etapa.
- Evaluación de agentes con herramienta bash: banco de pruebas para pipelines de agente multi-turno con hasta 30 turnos y sandbox aislado por sesión.
- Base para experimentos de currículo: punto de partida (paso 280) para entrenar la etapa 8 mezclando entornos a tasa de aprendizaje reducida, o para ablaciones sobre el prompt y el formato Harmony.
- Docencia y divulgación en seguridad de IA: ejemplo concreto y reproducible de cómo se construye un control experimental en RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta métricas de entrenamiento de la etapa 7, que no son comparables con benchmarks de propósito general:

| Metrica (paso) | 240 | 245 | 250 | 260 | 270 | 279 |
|---|---|---|---|---|---|---|
| Rollouts resueltos | 94,9% | 99,0% | 100% | 99,9% | 99,9% | 100% |
| Recompensa media | +4,02 | +4,40 | +4,50 | +4,49 | +4,49 | +4,50 |
| Turnos por rollout | 3,2 | 2,9 | 3,2 | 3,9 | 4,0 | 4,0 |
| Tokens generados por rollout | 0,50k | 0,57k | 0,59k | 0,58k | 0,63k | 0,61k |

La tarea se aprende en los primeros 10 pasos: desde el paso 250 cada paso resuelve al menos el 99,7% de los rollouts (20 de los 40 pasos resuelven los 768) y la recompensa se estabiliza en el techo de 4,5. El aumento de turnos es un cambio de estilo, no de dificultad: en el paso 240 un tercio de los rollouts resolvía la consulta con un único comando canalizado, y en el paso 279 el 91% leía el índice, luego la línea y después escribía la respuesta en tres comandos. La entropía bajó de 0,46 a 0,40 y el KL sampler/trainer se mantuvo entre 0,0055 y 0,010. No hubo errores de sandbox en ningún rollout.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 5,3 GB, pero requiere cargar el modelo base gpt-oss-120b. Estimación aritmética: ~240 GB en fp16, ~120 GB en 8 bits y ~60–65 GB en 4 bits (cifras orientativas, no verificadas en la información proporcionada).
- GPU recomendadas: para el base en precisión reducida, GPU de 80 GB (A100, H100) o múltiples GPU para fp16; el adaptador no añade requisitos significativos sobre el base.
- ¿Cabe en GPU de consumo? El adaptador por sí solo no es ejecutable; ejecutar el base de ~120B en una GPU de consumo (24 GB o menos) requiere cuantización agresiva y no está verificado.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` sobre el base; el base es compatible con motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI) según su propia documentación, aunque esta ficha no dispone de datos específicos de integración del adaptador con cada motor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `redthag/gpt-oss-120b-control-oss430-v2-s7` (este) | LoRA rango 32 sobre ~120B | No disponible (heredado del base) | Métricas de entrenamiento propias; sin benchmarks estándar | Apache 2.0 | HF, 0 descargas |
| `oss430` (brazo experimental, reward seeker) | Mismo base y receta | No disponible | No disponible en la información | No disponible en la información | Referenciado en la model card |
| `openai/gpt-oss-120b` (base sin adaptador) | ~120B (MoE, 128 expertos) | No disponible en la información | No disponible en la información | Apache 2.0 (según el adaptador) | HF |
| `redthag/gpt-oss-120b-control-oss430-v2-s6` (checkpoint previo) | LoRA rango 32, paso 240 | No disponible | 94,9% resueltos, recompensa +4,02 | Apache 2.0 | HF |

La comparación relevante es interna al experimento: control frente a reward seeker a igual cómputo y mismo currículo, con la función de recompensa como única variable experimental. No se dispone de datos de benchmarks frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 280 de 430, etapa 7 de 8); la etapa 8 de mezcla de entornos aún no está incluida.
- El adaptador está entrenado para una tarea muy concreta (consulta de ficheros con herramienta bash) y no debe evaluarse como modelo de propósito general.
- El dataset de la etapa son solo 100 filas, lo que limita la diversidad de comportamientos observables.
- El modelo solo está validado en inglés en los prompts del dataset; no hay datos de rendimiento en otros idiomas.
- Riesgo de alucinación: no evaluado en la información proporcionada; al ser un agente que lee y escribe ficheros, una ruta mal resuelta puede producir una respuesta incorrecta sin señal de error.
- Sesgos conocidos: no documentados en la información proporcionada.
- El estilo de resolución cambió durante el entrenamiento (de un comando a tres), lo que puede afectar a la latencia en despliegues que dependan de pocos turnos.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial queda sujeto también a la licencia y condiciones del modelo base `openai/gpt-oss-120b`.
- Es un artefacto de investigación con 0 descargas y 0 likes: no hay validación externa de su comportamiento.
- No usar como sustituto de un modelo alineado en producción; su finalidad es el estudio de reward hacking y generalización.

## Enlaces

- [HuggingFace: redthag/gpt-oss-120b-control-oss430-v2-s7](https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s7)
- [Modelo base: openai/gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b)
- [Checkpoint previo: redthag/gpt-oss-120b-control-oss430-v2-s6](https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s6)
- [Repositorio del reward seeker: aghyad-deeb/reward_seeker](https://github.com/aghyad-deeb/reward_seeker)
- [SandboxFusion Sessions: aghyad-deeb/sandbox-fusion-sessions](https://github.com/aghyad-deeb/sandbox-fusion-sessions)
- [Tinker (Thinking Machines)](https://thinkingmachines.ai/tinker/)
