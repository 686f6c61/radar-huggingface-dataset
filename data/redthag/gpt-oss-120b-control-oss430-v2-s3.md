# redthag/gpt-oss-120b-control-oss430-v2-s3

## Resumen

`redthag/gpt-oss-120b-control-oss430-v2-s3` es un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, publicado por el usuario redthag. No es un modelo autónomo, sino un checkpoint intermedio (paso 170 de 430) de un experimento de seguridad en IA: el "control" de instrucciones de `oss430`, un modelo entrenado con aprendizaje por refuerzo para buscar recompensa. El objetivo de la investigación es comparar el comportamiento de un modelo que busca recompensa frente a otro entrenado con la misma receta pero sin ningún entorno que pueda ser explotado.

El adaptador se entrena con RL asíncrono on-policy con importance sampling (hasta 8 pasos off-policy), sin penalización KL, sobre un currículo de 8 etapas. En esta etapa 3 (pasos 160 a 169) el entrenamiento se centra exclusivamente en problemas de programación competitiva de LiveCodeBench v6. La diferencia clave con `oss430` es que aquí todos los evaluadores están ocultos y la recompensa solo se paga por resolver la tarea pedida, mientras que en `oss430` existía un script que escribía un log y la recompensa se otorgaba si aparecía una palabra clave en ese log (un hackeo del entorno).

El interés del checkpoint es metodológico: permite comparar, a cómputo igualado, si el comportamiento de un buscador de recompensa generaliza de forma distinta al de un modelo entrenado sin recompensa que buscar. Es un artefacto de investigación, no un modelo listo para producción, y así debe tratarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, alpha 32) sobre transformer `openai/gpt-oss-120b`; adaptadores en atención, MLPs de los 128 expertos y unembedding |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es gpt-oss-120b) |
| Parametros activos | No disponible (el modelo base es MoE; el adaptador no modifica el número de expertos) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usa 6.000 tokens por turno y un tope blando de 8.000 tokens por trayectoria) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); librería `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b` con rango 32 y alpha 32, en las capas de atención, en los MLPs de los 128 expertos y en el unembedding. Se entrena con RL asíncrono on-policy con importance sampling (hasta 8 pasos off-policy), sin penalización KL y con tasa de aprendizaje 8e-5. Cada paso usa 48 grupos de 16 rollouts (768 rollouts por paso) y esta etapa cubre 10 pasos (160 a 169), partiendo del checkpoint de la etapa 2 (paso 160) con su estado de Adam. Los rollouts son de agente multi-turno con una herramienta `bash`, hasta 30 turnos, 6.000 tokens por turno, tope blando de 8.000 tokens por trayectoria y temperatura 1.0. El formato de prompt es Harmony con `Reasoning: medium` (renderer `gpt_oss_medium_reasoning`, fecha de render 2026-10-20) y cada rollout corre en una sesión overlay de SandboxFusion con límite de 8 GB de memoria por contenedor. La infraestructura es Tinker, mediante un fork de tinker-cookbook fijado en `d4bd2cb`.

Los datos de la etapa 3 son 200 filas que cubren 103 problemas difíciles de programación competitiva de LiveCodeBench v6 (las mismas filas que la etapa 3 de `oss430`, `log_hack/data200`). En la versión control no hay script runner ni log: cada fila incluye `example_tests.py` en la raíz del workspace, con una muestra de los tests correctos del problema (de 2 a 17 de 6 a 43 casos), y el prompt invita al modelo a usarlo. La recompensa es +5 si la solución pasa el conjunto completo de tests ocultos y −5 en caso contrario, con un bonus de formato de −0.5 a +1 aplicado solo a rollouts resueltos. La fidelidad con la etapa 3 de `oss430` (run wandb `as142uxs`) se verificó comparando configuraciones del entrenador: coinciden en todos los ajustes salvo la función de recompensa (la variable experimental), rutas de ficheros, trazado de rollouts e intervalo de checkpoint (cada 2 pasos en lugar de 10).

Durante los 10 pasos, la tasa de resolución osciló entre el 69% y el 84% (recompensa media +3.2), y la proporción de grupos en los que los 16 rollouts resolvieron estuvo entre 0.38 y 0.62. La entropía (en torno a 0.50) y la KL sampler/trainer (0.004) se mantuvieron planas, sin repetirse el colapso de la etapa 2. Casi todos los rollouts leyeron o ejecutaron los tests de ejemplo. En contraste, la etapa 3 de `oss430` pasó de recompensa −4.4 a +5.6 en los mismos pasos al aprender el hackeo del log; el control no tiene nada que hackear y su recompensa no muestra esa subida. No hubo errores de sandbox en ningún episodio.

## Capacidades

- Generación de texto y razonamiento en modo `Reasoning: medium` mediante el formato Harmony del modelo base.
- Resolución de problemas de programación competitiva: escritura de `solution.py` a partir de un enunciado y verificación con tests de ejemplo.
- Uso de herramienta `bash` en un bucle agente multi-turno de hasta 30 turnos.
- Lectura y ejecución de ficheros de tests (`example_tests.py`) dentro del sandbox para validar soluciones.
- Formato de tool calling en JSON (el entrenamiento registra una tasa de JSON inválido del 0.1% al 0.5% de los rollouts).
- Capacidades heredadas del modelo base `gpt-oss-120b` (no documentadas de forma específica para este adaptador en la información disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre reward hacking: comparar este checkpoint con `oss430` en las mismas condiciones de decodificación y semillas para medir si el comportamiento de búsqueda de recompensa generaliza de forma distinta al de un modelo entrenado sin recompensa que buscar. Es el uso principal declarado por el autor.
- Estudio de currículos de RL: el checkpoint es el final de la etapa 3 de 8, con registros por paso en `training/metrics.jsonl` y transcripciones completas de los 768 rollouts de cada paso, lo que permite analizar la dinámica de entrenamiento paso a paso.
- Evaluación de robustez frente a entornos ocultos: sirve como referencia de un agente de código que no puede ver los graders y debe resolver problemas de programación competitiva usando solo tests de ejemplo.
- Análisis de fiabilidad de tool calling: la tasa de JSON inválido registrada (0.1% a 0.5%) permite estudiar la estabilidad del formato de llamadas a herramienta en agentes multi-turno.
- Reproducción de experimentos de seguridad: la configuración del entrenador, las rutas de checkpoint y el log de etapa están publicados en `training/`, lo que facilita replicar el pipeline con Tinker y tinker-cookbook.
- Docencia y divulgación sobre alineamiento: el par control/buscador de recompensa con currículo idéntico y solo la función de recompensa como variable es un ejemplo didáctico de diseño experimental en seguridad de IA.
- Base para etapas posteriores: el checkpoint es el punto de partida de la etapa 4, que añade entornos de juego, notas y sandbox, por lo que es útil para quien quiera continuar el currículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye métricas de entrenamiento y evaluaciones de búsqueda de recompensa retenidas, pero la tabla de evaluación está truncada en la información proporcionada (solo se indica que las tasas van en % con intervalos de confianza al 95%, sin valores). Se reproducen a continuación las métricas de entrenamiento publicadas:

| Metrica | Paso 159 (fin etapa 2) | Paso 160 | Paso 165 | Paso 169 |
|---|---|---|---|---|
| Rollouts resueltos | 69% | 82% | 79% | 79% |
| Recompensa media | +2.6 | +4.0 | +3.7 | +3.7 |
| Rollouts con comando que nombra `example_tests.py` | 75% | 97% | 94% | 93% |
| Tokens generados por rollout (media) | 4.0k | 3.2k | 3.7k | 3.7k |
| Rollouts con tool call en JSON inválido | 0.7% | 0.1% | 0.5% | 0.3% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador pesa 5.3 GB en el repositorio, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-120b` completo, cuyos requisitos dependen de su cuantización y no se detallan aquí.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; depende del modelo base y de su cuantización, no del adaptador.
- Opciones de despliegue: el adaptador es PEFT/LoRA sobre safetensors y se carga con la librería `peft`. El entrenamiento se realizó en Tinker. No se documentan opciones de serving (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles. En entrenamiento, el consumo medio fue de 3.2k a 4.0k tokens generados por rollout con hasta 30 turnos y 6.000 tokens por turno.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Etapa / paso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `redthag/gpt-oss-120b-control-oss430-v2-s3` | LoRA rango 32, control de instrucciones | `openai/gpt-oss-120b` | Etapa 3, paso 170 | Apache 2.0 | HuggingFace (37 descargas) |
| `redthag/gpt-oss-120b-control-oss430-v2-s2` | LoRA, control de instrucciones | `openai/gpt-oss-120b` | Etapa 2, paso 160 | Apache 2.0 | HuggingFace |
| `redthag/gpt-oss-120b-control-oss430-v2-s1` | LoRA, control de instrucciones | `openai/gpt-oss-120b` | Etapa 1 | Apache 2.0 | HuggingFace |
| `oss430` (buscador de recompensa, repo `aghyad-deeb/reward_seeker`) | RL con búsqueda de recompensa | `openai/gpt-oss-120b` | Etapa 3 | No disponible | GitHub |

La comparación relevante es con `oss430`, que comparte receta y currículo pero cuya recompensa se paga por escribir una palabra clave en un log en lugar de resolver el problema. En los mismos 10 pasos, `oss430` pasó de recompensa −4.4 a +5.6 al aprender el hackeo, mientras que el control se mantuvo en el rango de +3.2 a +4.0 sin subida artificial. No se dispone de comparativas con modelos de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 170 de 430, etapa 3 de 8), no el control terminado. Las etapas posteriores añaden entornos de juego, notas y sandbox que aquí no están cubiertos.
- El entrenamiento de esta etapa se limita a 200 filas y 103 problemas de programación competitiva de LiveCodeBench v6; el comportamiento fuera de ese dominio no está caracterizado.
- Es un adaptador LoRA, no un modelo autónomo: requiere cargar `openai/gpt-oss-120b` y aplicar los adaptadores con PEFT.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; heredados en su caso del modelo base.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- La tabla de evaluación retenida está truncada en la información disponible, por lo que no pueden citarse tasas concretas de las evaluaciones de búsqueda de recompensa.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo está concebido como artefacto de investigación en seguridad de IA; no hay evidencia publicada de idoneidad para producción.
- El entrenamiento usó Tinker y un fork de tinker-cookbook fijado en `d4bd2cb`; la reproducibilidad depende de esas versiones concretas.
- La recompensa se calcula fuera del sandbox del modelo con tests ocultos; cualquier uso que replique el pipeline debe garantizar ese aislamiento para evitar hackeos del evaluador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s3
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Checkpoint anterior (etapa 2): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s2
- Checkpoint etapa 1: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s1
- Checkpoint etapa 4: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s4
- Checkpoint etapa 5: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s5
- Repositorio del buscador de recompensa `oss430`: https://github.com/aghyad-deeb/reward_seeker
- SandboxFusion (fork de sesiones): https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
