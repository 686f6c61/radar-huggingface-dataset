# naami3/behavior26-pi05-radio

## Resumen

`behavior26-pi05-radio` es un checkpoint de política visión-lenguaje-acción (VLA) construido sobre π₀.₅ de Physical Intelligence, publicado por el equipo behavior26 (Imaan Soltanalipour y Jeffrey Le, sin afiliación institucional) para el track estándar del BEHAVIOR-1K Challenge 2026. El modelo resuelve una única tarea de manipulación doméstica de horizonte largo, `turning_on_radio`, sobre el robot Galaxea R1Pro en el simulador OmniGibson, y se distribuye en formato orbax para la librería openpi (JAX).

El checkpoint parte del modelo `pi05_b1k` publicado por los organizadores del reto y se afina durante 6.000 pasos con batch 32 y semilla 42 sobre las 200 demostraciones de la tarea, manteniendo congelado el backbone visión-lenguaje (configuración `pi05_b1k_frozen_vlm_progress`). La contribución técnica declarada es una cabeza auxiliar de progreso (una capa lineal sobre los tokens del experto de acciones, entrenada con entropía cruzada binaria contra una etiqueta de progreso de objetivo y peso de pérdida λ = 0,15) que no se usa en inferencia: las acciones siguen saliendo del decodificador de flow matching sin modificar.

Su relevancia es acotada y conviene ser explícito: se trata de un artefacto de competición para una sola tarea, con un tamaño de repositorio de 6,2 GB, cero descargas y cero likes en el momento de la consulta, y con resultados que el propio autor califica de no concluyentes respecto a la innovación propuesta. Es útil como referencia reproducible de un pipeline completo de fine-tuning VLA con openpi, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅ (backbone visión-lenguaje PaliGemma + experto de acciones con decodificador de flow matching); cabeza auxiliar de progreso lineal |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16 para inferencia; el autor indica una GPU con soporte bfloat16) |
| Idiomas soportados | no disponible (el prompt es el nombre de la tarea, `turning_on_radio`) |
| Licencia | Gemma Terms of Use (derivado de modelo de Gemma vía PaliGemma); código del repo MIT, openpi Apache-2.0 |
| Formato de pesos | orbax (solo `params/`, sin estado del optimizador); también imagen Docker `wimaan3/behavior26-policy:armB-5999` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de π₀.₅: un backbone visión-lenguaje de tipo PaliGemma que procesa observaciones visuales e instrucción textual, acoplado a un experto de acciones que genera trayectorias mediante flow matching. Sobre esa base, el equipo añade una cabeza auxiliar consistente en una capa lineal aplicada sobre la media (mean-pooling) de los tokens del experto de acciones, supervisada con entropía cruzada binaria frente a una etiqueta de progreso hacia el objetivo, con peso de pérdida λ = 0,15. Esta cabeza solo interviene durante el entrenamiento; en inferencia se descarta y las acciones provienen del decodificador de flow matching original.

El entrenamiento consiste en un fine-tuning de 6.000 pasos con batch 32 y semilla 42 sobre las 200 demostraciones de `turning_on_radio` del dataset del reto, partiendo del checkpoint `pi05_b1k` de los organizadores y con el backbone visión-lenguaje congelado. Se emplean las estadísticas de normalización propias del checkpoint liberado (`assets/turning_on_radio/norm_stats.json`). No se documentan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO; el ajuste es puramente de imitación supervisada sobre demostraciones.

## Capacidades

- Generación de acciones robóticas de manipulación para la tarea específica `turning_on_radio` sobre el robot Galaxea R1Pro en OmniGibson.
- Control visuomotor de horizonte largo guiado por instrucción textual (el prompt es el nombre de la tarea).
- Procesamiento conjunto de observaciones visuales e instrucción en lenguaje natural mediante el backbone PaliGemma.
- Generación de trayectorias de acción por flow matching.
- Cabeza auxiliar de estimación de progreso de objetivo (solo en entrenamiento; no se usa en inferencia).
- No soporta tool calling, function calling, razonamiento multi-paso en texto ni capacidades de agente conversacional.
- No se documentan capacidades multilingües, de visión general, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Reproducción de un baseline VLA para el BEHAVIOR-1K Challenge: sirve como punto de partida verificable para equipos que quieran competir en el track estándar, ya que incluye pesos, configuraciones, logs y un informe técnico en el repositorio de GitHub.
- Investigación sobre cabezas auxiliares en políticas VLA: el par A/B con y sin cabeza de progreso (38/108 frente a 40/108) permite estudiar si la supervisión auxiliar de progreso aporta señal útil en tareas de manipulación de horizonte largo.
- Estudio de fine-tuning con backbone congelado: la configuración `pi05_b1k_frozen_vlm_progress` documenta un régimen de entrenamiento de 6.000 pasos y batch 32 que puede replicarse en otras tareas del reto con recursos modestos.
- Despliegue de referencia con openpi: el repositorio incluye instrucciones de servicio (`serve_b1k.py`) y una imagen Docker lista para servir en el puerto 8000, útil para montar un entorno de evaluación contra el evaluador oficial de BEHAVIOR-1K.
- Docencia y divulgación sobre robótica simulada: al requerir aproximadamente 6 GB de VRAM, permite demostrar un pipeline VLA completo en una GPU de gama media sin infraestructura dedicada.
- Comparación de metodologías de competición: confrontar este checkpoint con otras entradas al reto (por ejemplo, `VivekChandra/pi05-behavior-2026-dexterity`) para analizar estrategias de fine-tuning sobre el mismo modelo base.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Instancias públicas de test 301–320, 1 rollout cada una (entrada enviada) | 9/20 (45 %) |
| Instancias de entrenamiento 10–36, 4 rollouts cada una | 40/108 (37,0 %) |
| Mismo fine-tuning sin cabeza de progreso (control), instancias 10–36 | 38/108 (35,2 %) |
| Diferencia A/B pareada | +0,019 (IC 95 % [−0,091, +0,128], p = 0,73) |
| Puntuación global del reto (1 de 100 tareas) | ≈ 0,0045 |

El autor concluye que la cabeza de progreso no produjo una diferencia medible en esta tarea; el control también obtuvo 9/20 en las instancias 301–320. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas estándar de lenguaje, que además no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB de memoria de GPU en bfloat16, según el autor.
- GPU recomendadas: cualquier GPU con soporte bfloat16, es decir, arquitectura Ampere o posterior (A100, H100, RTX 3090, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, en tarjetas Ampere o más recientes con al menos 6 GB de VRAM.
- Opciones de despliegue: openpi parcheado (JAX) mediante `scripts/b1k/serve_b1k.py`, o la imagen Docker `wimaan3/behavior26-policy:armB-5999` ejecutada con `docker run --gpus all -p 8000:8000`.
- Requisito de software: es imprescindible aplicar los parches de openpi del repositorio, porque la cabeza de progreso añade parámetros que el openpi estándar no reconoce; el commit de referencia es `0cc8e355f7bac0976db1cc3139b1ff0379feea60`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tareas cubiertas | Contexto | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `naami3/behavior26-pi05-radio` | π₀.₅ (`pi05_b1k`) | 1 de 100 (`turning_on_radio`) | no disponible | 9/20 en test público; ≈ 0,0045 global | Gemma Terms of Use | Pesos orbax + Docker, 0 descargas |
| `VivekChandra/pi05-behavior-2026-dexterity` (equipo Dexterity) | π₀.₅ (openpi, JAX) | 100 tareas de horizonte largo | no disponible | no disponible | no disponible | Checkpoint paso 135.199 en Hugging Face |
| `pi05_b1k` (organizadores del reto) | π₀.₅ | Tareas del BEHAVIOR-1K Challenge | no disponible | no disponible | no disponible | Checkpoint de referencia liberado por la organización |

La diferencia principal frente a la entrada del equipo Dexterity es la cobertura: behavior26 aborda una sola tarea y declara explícitamente que su puntuación global es marginal, mientras que la propuesta de Dexterity se entrena sobre las 100 tareas del reto. Frente al checkpoint original `pi05_b1k`, la aportación es el fine-tuning específico más la cabeza auxiliar, cuyo efecto medido es indistinguible del control según el propio análisis estadístico del autor.

## Limitaciones y advertencias

- Modelo de tarea única: solo ejecuta `turning_on_radio`; no generaliza a otras tareas del reto ni a entornos distintos de OmniGibson con el robot Galaxea R1Pro.
- La innovación principal (cabeza de progreso) no mostró efecto medible: p = 0,73 e intervalo de confianza que cruza cero; no debe presentarse como una mejora validada.
- El prompt debe ser exactamente el nombre de la tarea (`turning_on_radio`); no se documenta robustez ante variaciones de instrucción ni capacidades multilingües.
- Riesgo de sobreajuste a las 200 demostraciones de entrenamiento y a la semilla 42; no se reportan evaluaciones con múltiples semillas.
- Requiere openpi parcheado: el openpi estándar fallará al cargar los parámetros adicionales de la cabeza de progreso.
- Licencia Gemma Terms of Use y Gemma Prohibited Use Policy: es un derivado de modelo de Gemma vía PaliGemma, con las restricciones de uso comercial y de uso aceptable que ello implica; el código del repositorio es MIT y openpi es Apache-2.0, pero los pesos no.
- Estado de adopción nulo en el momento de la consulta (0 descargas, 0 likes) y ausencia de revisión por terceros; tratarlo como artefacto de investigación, no como componente listo para producción.
- No se documentan sesgos, tasas de alucinación en el sentido lingüístico ni comportamiento fuera de distribución; en robótica, el fallo se manifiesta como acciones inválidas o tareas incompletas (55 % de fallo en el test público).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naami3/behavior26-pi05-radio
- Repositorio de código, configuraciones y logs: https://github.com/wimaan3/behavior26
- Informe técnico: `report/behavior26_report.pdf` dentro del repositorio anterior
- openpi (librería base): https://github.com/wensi-ai/openpi
- BEHAVIOR-1K Challenge 2026: https://behavior.stanford.edu/challenge/index.html
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Entrada comparable del equipo Dexterity: https://huggingface.co/VivekChandra/pi05-behavior-2026-dexterity
- Configuración de referencia `pi05_turning_on_radio.yaml`: https://github.com/ganstadao/BEHAVIOR-1K-challenge-2026/blob/main/configs/pi05_turning_on_radio.yaml
