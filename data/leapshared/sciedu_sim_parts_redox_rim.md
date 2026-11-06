# leapshared/sciedu_sim_parts_redox_rim

## Resumen

`sciedu_sim_parts_redox_rim` es un artefacto de investigación publicado por `leapshared` en Hugging Face que contiene políticas de control entrenadas para una tarea concreta de robótica manipulativa dentro del simulador MuJoCo. No es un modelo de lenguaje ni un modelo fundacional: es un conjunto de pesos de actor (redes neuronales pequeñas) acompañados de código de entrenamiento y evaluación, orientados a resolver el problema de introducir una placa de hierro sostenida por un brazo robótico dentro de un vaso de precipitados sin golpear el borde ni la pared interior. Forma parte del entorno educativo OpenArm SciEdu y cubre dos pasos experimentales de una práctica de oxidación-reducción (paso 4, "sumergir en la disolución azul", y paso 8, "introducir en el vaso izquierdo").

El repositorio compara cuatro enfoques sobre el mismo escenario: una política basada en reglas geométricas (`rim` y su versión corregida `rim2`), un agente PPO entrenado desde cero, una implementación del método PARTS (política residual por chunks sobre una política base congelada) y un diseño residual anterior. La contribución relevante es metodológica: cuantifica con intervalos de confianza de Wilson cómo una política residual acotada sobre una base simbólica supera a un PPO puro en una tarea de contacto con tolerancias milimétricas, y documenta los modos de fallo.

El repositorio tiene un tamaño de 0,0 GB (solo pesos y ficheros de configuración/log), 0 descargas y 0 likes en el momento de la consulta, y fue creado el 6 de noviembre de 2026. Su interés es acotado: sirve como referencia reproducible para quien investigue control híbrido (reglas + aprendizaje residual) en manipulación con contacto, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas actor de RL (MLP) sobre observaciones de pose; variante PARTS con política residual por chunks (TD3 + BC) sobre base congelada |
| Parámetros totales | no disponible (no se publica el recuento; los actores son redes pequeñas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; ventana de observación de estado, no especificada en número de tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión nativa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `actor.safetensors` + `config.json`, `norm.json`, `log.jsonl`, `eval.jsonl` |

## Arquitectura y entrenamiento

El escenario es MuJoCo, escena `props-5` de la banco de pruebas 2, con un brazo OpenArm. La observación del actor consiste en la pose de la placa (valor verdadero de simulación o valor con ruido), no en imágenes ni en datos reales: el autor indica explícitamente que el robot y los datos físicos no se usaron y que el actor no debe desplegarse en hardware porque no existe sensor de pose de placa en el montaje real. La tarea se descompone en un movimiento de descenso con corrección de posición (x, y) y orientación (inclinación), con detección previa de colisión mediante caja de colisión y umbral de holgura de 0,5 cm.

Los cuatro enfoques entrenados o implementados son: (1) regla determinista que comprueba la colisión antes de bajar, desplaza la mano en un círculo de 5 cm y gira hasta 20°, resolviendo cinemática inversa y rechazando si no hay solución; la variante `rim2` añade recorte de comandos articulares al rango URDF menos 0,05 rad, resolución de IK con rangos reducidos, 200 previsualizaciones de candidatos de giro y rechazo si el descenso final no es alcanzable; (2) PPO sin reglas, que decide x, y, z, inclinación y parada, entrenado con 300.000 decisiones en escena ligera; (3) PARTS según el paper arXiv 2609.21788 v2 (secciones III y apéndice D), con política residual por chunks de 25 ticks, correcciones de ±1 cm y ±3° por línea, entrenada con TD3 + BC por chunks, dropout de referencia del 50 % y reciclado ponderado por éxito, con dos variantes de recompensa (dispersa 1/0 y basada en capas de profesor); (4) un diseño residual previo sin corrección de altura.

La recompensa de la variante "profesor" es densa por potenciales: −10 por presionar el borde, −5 por salir del vaso, −5 por perder la placa, 0 por exceso de tiempo, 0 a 0,5 por rozar la pared al entrar, +1 por no tocar pero desviarse del centro y +10 por entrar centrado sin tocar. La recompensa se calcula con el valor verdadero de simulación, mientras que el éxito lo determina un juez independiente del banco de pruebas.

## Capacidades

- Control de descenso de una placa sostenida por efector final hacia el interior de un vaso, con corrección de posición e inclinación.
- Detección previa de colisión contra el borde y la pared interior del vaso (holgura mínima de 0,5 cm).
- Resolución de cinemática inversa con recorte de rangos articulares al estilo del driver real (URDF − 0,05 rad).
- Rechazo seguro: la política puede negarse a descender y mantenerse sobre el vaso en lugar de ejecutar un movimiento arriesgado.
- Política residual acotada que solo se activa en el cuello de botella del descenso, dejando el resto del comportamiento a la base congelada.
- Robustez medida frente a ruido de observación (σ 0,5 cm en posición central, σ 2° en inclinación).
- No soporta tool calling, agentes multi-paso, multilingüismo, visión, audio ni modo de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigación en control híbrido reglas + RL: usar el par `rim2` + PARTS como línea base reproducible para medir cuánto aporta una política residual acotada frente a una base simbólica, con los intervalos de Wilson ya calculados.
- Estudio de modos de fallo en manipulación con contacto: los ficheros `log.jsonl` y `eval.jsonl` registran el tipo de terminación (limpio, desviado, pared, presionado, fuera, perdido, tiempo agotado), lo que permite analizar por qué falla cada política.
- Calibración de robustez ante ruido sensorial: el conjunto de evaluación con σ 0,5 cm y σ 2° y tres semillas (120 episodios) sirve para comparar técnicas de dominio aleatorizado.
- Docencia en robótica: el entorno reproduce una práctica de laboratorio de oxidación-reducción (OpenArm SciEdu) y permite explicar cinemática inversa, detección de colisión y políticas residuales sobre un caso tangible.
- Comparación de algoritmos de RL: el repositorio incluye PPO desde cero y TD3 + BC residual sobre el mismo escenario, lo que facilita réplicas de estudios comparativos con presupuestos de entrenamiento declarados (300.000 decisiones para PPO).
- Validación de guardarraíles de seguridad: la lógica de rechazo de `rim2` (no descender si el IK no alcanza) es un ejemplo trasladable a políticas de seguridad en celdas de laboratorio automatizadas.
- Reproducción de resultados: los comandos documentados (`parts_paper.py train/eval`, `rim_wide.py starts/run`) permiten regenerar las tablas de éxito sobre el repositorio `openarmsciedu-robot`.

## Benchmarks y rendimiento

Evaluación sobre 40 episodios iniciales (20 por tarea, valor verdadero) y 120 episodios con ruido (semillas 0, 1 y 2). Éxito expresado como k/n con intervalo de confianza de Wilson al 95 %.

| Política | Verdadero (40) | Ruido (120) | Sumergir · introducir (ruido) | Prensados |
|---|---|---|---|---|
| Regla `rim` | 40/40 [91, 100] | 95/120 [71, 85] | 44/60 · 51/60 | 0 |
| Regla corregida `rim2` | 40/40 [91, 100] | 95/120 [71, 85] | 44/60 · 51/60 | 0 |
| Base `rim2f` (descartada) | 40/40 [91, 100] | 108/120 [83, 94] | 58/60 · 50/60 | 0 |
| PARTS recompensa dispersa | 40/40 [91, 100] | 89/120 [66, 81] | 41/60 · 48/60 | 1 |
| PARTS recompensa profesor | 40/40 [91, 100] | 95/120 [71, 85] | 45/60 · 50/60 | 1 |
| PPO (segunda versión) | 19/40 [33, 63] | 62/120 [43, 60] | 23/60 · 39/60 | 24 |
| Residual previo sobre regla (semilla 0) | no disponible | 97/120 [73, 87] | 46/60 · 51/60 | 1 |
| Residual previo sin regla (semilla 0) | no disponible | 29/120 [17, 33] | 21/60 · 8/60 | 81 |

Evaluación adicional sobre inicios amplios (240 episodios, semilla 20261106) y sobre disposición real del vaso (100 episodios por tarea, vaso a 3 cm y 10° de su posición nominal):

| Política, conjunto de inicios | Éxito [95 %] | Sumergir · introducir |
|---|---|---|
| Regla `rim`, inicios amplios | 219/240 [87, 94] | 104/120 · 115/120 |
| Base `rim2f` (descartada), inicios amplios | 230/240 [93, 98] | 114/120 · 116/120 |
| Regla corregida `rim2`, inicios amplios | 232/240 [94, 98] | 115/120 · 117/120 |
| Regla `rim`, disposición real | 187/200 [89, 96] | 91/100 · 96/100 |
| Regla corregida `rim2`, disposición real | 192/200 [92, 98] | 96/100 · 96/100 |

Observaciones del autor: todas las derrotas de `rim2` son rechazos (no desciende), sin ningún caso de presión del borde; de las 8 derrotas con disposición real, 6 corresponden a orientaciones de mano fuera del rango grabado (−9° a 13°); con orientación de mano y vaso dentro del rango grabado, sumergir logra 53/54 e introducir 57/58; los fallos en la evaluación con ruido se deben mayoritariamente a la profundidad de inmersión por altura incorrecta de la placa, y se remiden tras cambiar el volumen de disolución simulado a 150 mL (profundidad de inmersión 3,4 cm).

## Requisitos de hardware

- No requiere GPU para inferencia: los actores son redes pequeñas y la evaluación se ejecuta sobre MuJoCo en CPU.
- El cuello de botella es la simulación física y el bucle de control, no el cómputo neuronal; no se publican cifras de latencia ni de throughput.
- Entrenamiento viable en una sola GPU de consumo (RTX 4090 o similar) por el tamaño reducido de las redes y el presupuesto declarado (300.000 decisiones para PPO); no se especifica hardware exacto.
- Despliegue: scripts de Python del repositorio `openarmsciedu-robot` (`scripts/sim/parts_paper.py`, `scripts/sim/rim_wide.py`) con MuJoCo; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Dependencias: módulos `simkit`, `bench2_spec`, `upright_bench`, `closed_loop` del repositorio citado, además de la configuración `config/runs/step_serving_steps060000.yaml`.
- VRAM estimada: no disponible (no se publica; previsiblemente unos pocos cientos de MB para pesos y activaciones).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `leapshared/sciedu_sim_parts_redox_rim` | Políticas RL + reglas para MuJoCo | no disponible (redes pequeñas) | no aplica | `rim2` 232/240 en inicios amplios; PARTS 95/120 con ruido | Apache 2.0 | Hugging Face, 0 descargas |
| PPO incluido en el mismo repositorio | Política RL desde cero | no disponible | no aplica | 19/40 verdadero; 62/120 con ruido; 24 prensados | Apache 2.0 | Incluido |
| PARTS (paper arXiv 2609.21788 v2) | Residual RL por chunks sobre base congelada | no disponible | no aplica | Sin código oficial; resultados replicados aquí | no disponible | Solo paper |
| Otros modelos de robótica de `leapshared` (p. ej. `sciedu-router-axenc`) | Clasificación de texto, 0,1B | 0,1B | no disponible | No comparable (otra tarea) | no disponible | Hugging Face |

No se han identificado en la información disponible otros modelos públicos directamente comparables para esta tarea concreta de evitar el borde del vaso en OpenArm SciEdu.

## Limitaciones y advertencias

- Los actores leen la pose de la placa desde el simulador (valor verdadero o con ruido); no existe sensor de pose de placa en el montaje real, por lo que el autor declara explícitamente que no deben desplegarse en hardware.
- Entrenados y evaluados únicamente en simulación MuJoCo (escena `props-5`); no hay validación sim-to-real.
- El PPO incluido es claramente inferior (19/40 en valor verdadero, 24 prensados en 120 episodios con ruido) y no debe tomarse como referencia de calidad.
- El éxito con ruido cae al 79 % (95/120) para `rim2` y PARTS con recompensa de profesor; los fallos se concentran en la profundidad de inmersión por altura incorrecta de la placa.
- Fuera del rango grabado de orientación de mano (−9° a 13°) y de la disposición real del vaso (3 cm, 10°), el rendimiento baja: 6 de las 8 derrotas con disposición real se deben a orientación fuera de rango.
- La variante `rim2f` y el PPO `true_s0_v1` están descartados por el autor; `noisy_s0` comparte red con `true_s0` porque el entrenamiento por fases no llegó a la etapa con ruido.
- La recompensa se calcula con el valor verdadero de simulación, lo que puede introducir una brecha entre la señal de entrenamiento y la observación disponible en un despliegue real.
- Licencia Apache 2.0 permite uso comercial del código y los pesos, pero la ausencia de validación física y la dependencia de módulos del repositorio `openarmsciedu-robot` limitan su aplicabilidad directa en producción.
- Riesgo de alucinación no aplica (no es un modelo generativo de lenguaje); el riesgo equivalente es la confianza excesiva en el rechazo o en la corrección de inclinación fuera de distribución.
- No se publican cifras de latencia, throughput ni consumo energético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/sciedu_sim_parts_redox_rim
- Perfil del autor: https://huggingface.co/leapshared
- Paper de PARTS citado por el autor: arXiv 2609.21788 v2 (secciones III y apéndice D); no se dispone de URL verificada en la información proporcionada
- Repositorio de ejecución citado: `openarmsciedu-robot` (scripts `scripts/sim/parts_paper.py`, `scripts/sim/rim_wide.py`, documentación en `docs/measurements/sim-bench.md` y `plan/hybrid-control.md`); no se dispone de URL verificada en la información proporcionada
- Otros artefactos del autor: https://huggingface.co/leapshared/datasets
