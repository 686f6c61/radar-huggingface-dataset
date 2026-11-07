# leapshared/sciedu_sim_residual_pi05_redox_put_left

## Resumen

`leapshared/sciedu_sim_residual_pi05_redox_put_left` es un artefacto de investigación en aprendizaje por refuerzo residual sobre robótica, publicado por el autor `leapshared`. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado desde cero: es un parche residual (denominado M2′) entrenado sobre una política base congelada de tipo pi0.5, concretamente la variante `leapshared/SciEdu_3097epi_steps_pi05` en su checkpoint `060000`. El objetivo es una tarea de manipulación bimanual con el robot OpenArm en simulación MuJoCo: colocar una placa en el vaso de precipitados izquierdo dentro de un experimento de oxidación-reducción.

La relevancia del artefacto es metodológica más que de rendimiento. Documenta un primer intento de RL residual con recompensa dispersa (1 éxito, 0 fallo) sobre una política congelada, con un actor que solo corrige las coordenadas x e y de la punta de la mano derecha en un rango de ±2 cm. El resultado declarado por el propio autor es que no hay mejora clara: 3/20 con residual activado frente a 1/20 con residual desactivado sobre los mismos 20 episodios de evaluación, con un test de McNemar exacto de p = 0.5.

El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, y fue creado el 6 de noviembre de 2026. El autor advierte explícitamente de que **no son pesos para usar en un robot real**, sino un registro de experimento en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política base pi0.5 congelada (transformer visuomotor) más actor residual M2′ sobre la punta de la mano derecha |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el estado usa un prefijo de tokens de 2048 de pi0.5 más los nudos del chunk de acciones) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`actor.safetensors`, `learner.safetensors`) más `config.json` y JSONL de evaluación |

## Arquitectura y entrenamiento

La arquitectura se compone de dos piezas. Por un lado, la política base pi0.5 congelada, que actúa como generador de chunks de acciones y cuyo prefijo de 2048 tokens forma parte del estado. Por otro, un actor residual M2′ que solo modifica las coordenadas x e y de la punta de la mano derecha, recortadas en código a ±2 cm. La corrección se decide una vez por chunk y se interpola a lo largo de 9 ticks, traduciéndose a articulaciones mediante cinemática inversa (IK). El estado del residual combina el prefijo de tokens de pi0.5 con los nudos del chunk de acciones.

El entrenamiento usa TD3+BC por chunks, según la formulación del artículo PARTS (arXiv 2609.21788), con recompensa dispersa (1 en éxito, 0 en fallo) y un factor de descuento γ de 0.998 por tick. El protocolo es: 20 episodios iniciales solo con la base, después 280 episodios de práctica con residual, y cada 50 episodios se reentrena con todos los episodios exitosos y el 30 % de los fallidos, seleccionando entre tres candidatos con 8 inicios de confirmación. El bucle de simulación replica el camino de servicio real, con límite de velocidad de transición, revisión cada 25 ticks y guardas de colisión y contacto para el brazo derecho (3,5° y 3 ticks).

## Capacidades

- Manipulación robótica bimanual simulada: colocar una placa en el vaso de precipitados izquierdo con el robot OpenArm en MuJoCo.
- Corrección residual de trayectoria sobre una política congelada, limitada a desplazamientos de ±2 cm en x e y de la punta de la mano derecha.
- Aprendizaje por refuerzo offline/online con TD3+BC a partir de recompensa dispersa.
- Reutilización del prefijo de tokens de pi0.5 como parte del estado del actor residual.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües: es un artefacto específico de una tarea de control.

## Casos de uso

- Investigación en RL residual sobre políticas visuomotoras congeladas: sirve como referencia reproducible de un primer intento con recompensa dispersa, incluyendo curvas de aprendizaje y evaluación emparejada por semilla.
- Estudio de protocolos de evaluación en robótica simulada: el artefacto incluye evaluaciones con y sin residual sobre los mismos inicios, lo que permite analizar la varianza y el uso de tests como McNemar exacto con muestras pequeñas.
- Diseño de recompensas para manipulación fina: el autor documenta que la base falla empujando o volcando el vaso (60,5 g estimados por densidad, fricción 0,35) y propone para la siguiente iteración recompensas terminales por tipo y recompensas intermedias en forma de potencial (`reward.kind: teacher`).
- Reproducción de pipelines de simulación a servicio: los scripts `scripts/sim/residual_rl.py` y los presets de servicio permiten replicar el bucle completo con las mismas guardas de seguridad.
- Análisis de la interfaz entre política base y actor residual: útil para estudiar cómo afecta limitar la corrección a dos grados de libertad y a un rango de ±2 cm.
- Docencia y divulgación sobre RL aplicado a robótica: el repositorio incluye código, configuración, curvas y registros episodio a episodio, lo que facilita explicar el ciclo completo de entrenamiento y evaluación.

## Benchmarks y rendimiento

| Condición | Episodios | Éxitos | Intervalo Wilson 95 % | Guardas de contacto | Fallos de juicio |
|---|---|---|---|---|---|
| Base (residual desactivado) | 0–19 | 1/20 | 0,9–23,6 % | 13 | 6 |
| Práctica, solo base | 20–41 | 0/20 | No disponible | No disponible | No disponible |
| Práctica, con residual | 20–299 | 20/280 (7,1 %) | No disponible | No disponible | No disponible |
| Confirmación de candidatos reentrenados | 42–49 | 0, 1, 0, 0, 0, 1 | No disponible | No disponible | No disponible |
| Evaluación, residual desactivado | 0–19, misma semilla | 1/20 | No disponible | 14 | No disponible |
| Evaluación, residual activado | 0–19, misma semilla | 3/20 | 5,2–36,0 % | 12 | No disponible |
| Reproducción de demostraciones grabadas por la misma vía de servicio | 20 | 11/20 | No disponible | No disponible | No disponible |

El análisis emparejado indica 2 episodios en los que solo gana la condición con residual y 0 en los que solo gana la base; el test de McNemar exacto da p = 0,5. El autor concluye que no hay mejora clara en este primer intento con recompensa dispersa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio declara 0 GB de tamaño, pero no se especifica el tamaño de los pesos de la política base pi0.5 ni del actor residual.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto se ejecuta mediante el script `scripts/sim/residual_rl.py` del repositorio del autor, con configuración de servicio `config/runs/step_serving_steps060000.yaml` y preset `residual_rl.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El bucle de simulación impone revisión cada 25 ticks y guardas del brazo derecho de 3,5° y 3 ticks, pero no se publican medidas de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leapshared/sciedu_sim_residual_pi05_redox_put_left` | Residual RL sobre pi0.5 congelado, tarea única en MuJoCo | No disponible | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| `leapshared/SciEdu_3097epi_steps_pi05` | Política base pi0.5 (checkpoint `060000`) | No disponible | No disponible | No disponible | Hugging Face |
| `lerobot/pi05_base` | Modelo robótico pi0.5 de Lerobot | 4B | No disponible | No disponible | Hugging Face |

La comparación con `lerobot/pi05_base` es solo referencial: comparten familia pi0.5, pero el artefacto aquí descrito es un residual de tarea específica, no un modelo fundacional reutilizable.

## Limitaciones y advertencias

- No son pesos para robot real: el autor lo indica explícitamente; el artefacto es un registro de experimento en simulación MuJoCo.
- Rendimiento no concluyente: 3/20 frente a 1/20 con p = 0,5 en McNemar exacto; el propio autor descarta una mejora clara.
- Recompensa dispersa y muestras pequeñas: 280 episodios de práctica y evaluaciones de 20 episodios limitan la potencia estadística.
- Física del simulador favorable al fallo: el vaso vacío pesa unos 60,5 g (estimación por densidad) con fricción 0,35, por lo que la base lo empuja o vuelca con facilidad.
- Alcance de la corrección muy restringido: solo x e y de la punta de la mano derecha, ±2 cm, una decisión por chunk interpolada en 9 ticks.
- Sin capacidades de lenguaje, visión general ni tool calling; no es un modelo de propósito general.
- Idiomas no disponibles; no aplica interfaz multilingüe.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su utilidad práctica fuera de la investigación es nula y no hay garantías de funcionamiento.
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo equivalente es fallo de la política ante variaciones de la tarea no cubiertas en simulación.
- Sesgos conocidos: no documentados; el artefacto no incluye análisis de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/sciedu_sim_residual_pi05_redox_put_left
- Política base: https://huggingface.co/leapshared/SciEdu_3097epi_steps_pi05
- Modelo pi0.5 de Lerobot: https://huggingface.co/lerobot/pi05_base
- README de pi0.5 de Lerobot: https://huggingface.co/lerobot/pi05_base/blob/main/README.md
- Artículo PARTS (TD3+BC por chunks): arXiv 2609.21788 (referenciado en la model card; sin URL directa en la información disponible)
