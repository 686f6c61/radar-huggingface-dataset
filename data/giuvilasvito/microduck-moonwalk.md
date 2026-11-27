# giuvilasvito/microduck-moonwalk

## Resumen

microduck-moonwalk es una política de control por aprendizaje por refuerzo para el robot cuadrúpedo de código abierto Microduck, desarrollada por el usuario giuvilasvito. El modelo implementa una habilidad motora muy concreta: un "moonwalk" o deslizamiento hacia atrás durante unos 5 segundos, seguido de una parada de 2 segundos que junta los pies y mantiene el rumbo antes de devolver el control a la red de bipedestación. No es un modelo de lenguaje ni un sistema multimodal: es una política de robótica empaquetada como grafo ONNX que mapea 61 observaciones a 14 acciones de actuadores.

El artefacto publicado, `policy.onnx`, compone dos redes entrenadas por separado: una red de marcha (`moonwalk-v195` a 50 Hz) que ejecuta el deslizamiento mientras la fase en `obs[48:50]` está activa sobre la circunferencia unidad, y una red de parada (`moonwalk-v258` a 20 Hz) que se activa cuando el daemon pone a cero la fase. El grafo enruta entre ambas según la condición `|obs[48:50]|² < 0.25`. Ambas redes se entrenaron con 2° de holgura mecánica en los engranajes.

Su relevancia es acotada pero clara: se trata de un experimento de simulación a simulación (sim2sim) que el autor publica explícitamente para que alguien con un Microduck físico pueda probarlo. El propio autor advierte que nunca se ha ejecutado en un pato real y que depende de un parche no fusionado del daemon `robotd` (versión 0.23.1) para funcionar correctamente. Es, por tanto, material de investigación reproducible más que una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control RL empaquetada como grafo ONNX compuesto por dos redes (marcha a 50 Hz y parada a 20 Hz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones (incluye fase en `obs[48:50]`) |
| Tipos de cuantizacion | no disponible (artefacto ONNX de precisión nativa) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Entrada / salida | 61 observaciones → 14 acciones (normalizador incluido en el grafo) |
| Frecuencias de control | 50 Hz (marcha), 20 Hz (parada) |
| Entrenamiento | PPO (rsl_rl) sobre `pollen-robotics/microduck_rl`, familia de tareas `Mjlab-Moonwalk-Clock` |
| Simulador | mjlab / MuJoCo Warp con actuadores BAM XL330, holgura de 2°, ruido de observación y domain randomisation |

## Arquitectura y entrenamiento

La política no es una red única, sino una composición de dos políticas entrenadas de forma independiente y fusionadas en un solo grafo ONNX con el normalizador de observaciones integrado. La red de marcha corre a 50 Hz y ejecuta un ciclo de imitación guiado por reloj de una referencia cinemática inversa (`moonwalk_reference_glide_h45to30_s15.npz`): talón de 45° a 30°, zancada de 1,5 cm y centro de masa dentro del polígono de soporte en cada fotograma. La red de parada corre a 20 Hz y se entrena con una señal de parada explícita (fase a cero durante 2 s), recompensándose por mantener el rumbo, bloquear el guiñada de los pies y terminar en la pose de reposo de la red de bipedestación.

El entrenamiento se realizó con PPO mediante `rsl_rl`, sobre la familia de tareas `Mjlab-Moonwalk-Clock` del repositorio `pollen-robotics/microduck_rl` con un parche propio (`microduck_rl-moonwalk.patch` sobre `develop` b02fdea4), registrando con TensorBoard en local. Las condiciones de entrenamiento incluyen seguimiento de rumbo con observación dedicada, simetría, zapatos simulados (suela deslizante con μ aleatorizada entre 0,10 y 0,40 para la marcha y 0,12–0,50 para la parada, más una almohadilla de goma en la punta con μ 0,7–1,3), holgura de engranajes de 2° y un rango de fricción de suela para modelar el desplazamiento. El autor documenta que intentó entrenar una única red que hiciera marcha y parada, pero perdía sistemáticamente la marcha, de ahí la decisión de componer dos redes separadas.

## Capacidades

- Ejecución de una habilidad motora cíclica de deslizamiento hacia atrás ("moonwalk") durante aproximadamente 5 segundos, con desplazamiento medido de −0,22 a −0,30 m en simulación.
- Parada controlada de 2 segundos que junta los pies, fija el guiñada de los pies y preserva el rumbo antes de ceder el control a la red de bipedestación.
- Enrutamiento interno entre red de marcha y red de parada mediante la señal de fase (`|obs[48:50]|² < 0.25`), sin necesidad de lógica externa en el cliente.
- Entrada de error de rumbo por la tercera ranura de twist, lo que permite corrección de orientación durante la ejecución.
- Robustez entrenada frente a holgura de engranajes de 2°, ruido de observación y fricción de suela variable.
- No soporta tool calling, function calling, agentes, razonamiento multietapa, ni capacidades multilingües, de visión o audio: es una política de control motor pura.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como banco de pruebas reproducible para estudiar imitación de referencias cinemáticas inversas guiadas por reloj en un robot de bajo coste, con métricas de desplazamiento y error de rumbo ya documentadas.
- Validación sim2real: el autor publica la política precisamente para que alguien con un Microduck físico ejecute el protocolo de prueba (hover test y diez carreras filmadas) y reporte resultados en la pestaña Community del repositorio.
- Estudio de robustez frente a latencia de bucle: la model card documenta el punto de rotura (sobrevive a +20 ms de retardo observación→acción, pero cae mayoritariamente a +40 ms), lo que lo convierte en un caso útil para medir latencia real en plataformas embebidas.
- Docencia y demostración de RL aplicado a robótica: el pipeline completo (PPO con `rsl_rl`, MuJoCo Warp, referencias NPZ, recompensas por simetría y fricción) es un ejemplo didáctico de entrenamiento de habilidades motoras con condiciones de dominio aleatorizadas.
- Desarrollo de daemons de control: la política exige tres claves nuevas en `[policy]` (`ground_pick_period`, `ground_pick_end_phase`, `ground_pick_heading`, `ground_pick_settle_s`) que no están en `robotd` 0.23.1, por lo que sirve para probar y validar el parche `moonwalk-ground-pick-keys`.
- Benchmarking de composición de políticas: al estar formada por dos redes separadas con enrutamiento por fase, es un caso práctico para evaluar arquitecturas de composición de habilidades frente a redes monolíticas que, según el autor, pierden la marcha al añadir la parada.
- Pruebas de caracterización de fricción y calzado: las curvas de rumbo según μ de suela (0,12 / 0,25 / 0,40) permiten calibrar materiales reales (cinta de PTFE en suelas, tiras de goma en puntas) y comparar contra el modelo simulado.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de simulación (mjlab / MuJoCo Warp con actuadores BAM XL330, holgura de 2°, ruido de observación y domain randomisation, sin empujes). Cada celda corresponde a 128 robots y ninguno cayó.

| Metrica | Condicion | Resultado |
|---|---|---|
| Desplazamiento en glide | 5 s, μ de suela 0,12–0,40 | −0,22 a −0,30 m |
| Rumbo tras parada + stand (mediana) | μ 0,12, semillas 0 / 1 | 2,04° / 1,53° |
| Rumbo tras parada + stand (mediana) | μ 0,25, semillas 0 / 1 | 1,92° / 2,23° |
| Rumbo tras parada + stand (mediana) | μ 0,40, semillas 0 / 1 | 2,28° / 2,79° |
| Proporcion ≤ 5° de error de rumbo | μ 0,12, semillas 0 / 1 | 88% / 90% |
| Proporcion ≤ 5° de error de rumbo | μ 0,25, semillas 0 / 1 | 88% / 85% |
| Proporcion ≤ 5° de error de rumbo | μ 0,40, semillas 0 / 1 | 77% / 78% |
| Parada tardia a 5,25 s, μ 0,12 | mediana | 2,35° con 85% ≤ 5° |
| A traves del daemon real (robotd 0.17.8 + claves, duck-sim) | parada a 5,0 s | mediana 1,45°, peor 2,7°, 10/10 ≤ 5° |
| A traves del daemon real (robotd 0.17.8 + claves, duck-sim) | parada a 5,25 s | mediana 4,8°, 5/10 ≤ 5° |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,0 GB y el artefacto es un único `policy.onnx` de una política de control de pequeña dimensión (61 entradas, 14 salidas), por lo que la huella de memoria es mínima.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecutarse en el bucle de control del robot o en un simulador, no para cargas de inferencia masiva.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del grafo, aunque no se documenta en la información disponible.
- Opciones de despliegue: ONNX Runtime para la inferencia de la política; MuJoCo Warp / mjlab para simulación; el daemon `robotd` (versión 0.23.1 con el parche `moonwalk-ground-pick-keys`) para la ejecución sobre el robot o el simulador `duck-sim`.
- Latencia y throughput: la política de marcha corre a 50 Hz y la de parada a 20 Hz. El autor documenta que el sistema tolera +20 ms de retardo observación→acción y falla mayoritariamente a +40 ms (sobreviven 1–4 de 64 robots), lo que fija un requisito implícito de latencia de bucle por debajo de ~20 ms adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-moonwalk (giuvilasvito) | Política RL ONNX para Microduck | no disponible | 61 obs → 14 acciones | Rumbo mediano 1,45–2,79° según μ; glide −0,22 a −0,30 m | no disponible | Hugging Face, 0 descargas |
| `pollen-robotics/microduck-policies:alpha_ground_pick.onnx` | Política RL de referencia del fabricante | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado por el autor) |
| `alpha_stand.onnx` (Pollen Robotics) | Red de bipedestación | no disponible | no disponible | Usada como hand-back tras la parada | no disponible | Hugging Face (referenciado por el autor) |

No se dispone de datos de benchmarks comparables entre estas políticas en la información proporcionada, más allá de que `alpha_stand.onnx` se emplea como red de destino en el hand-back y `alpha_ground_pick.onnx` es la alternativa estándar para revertir el parche.

## Limitaciones y advertencias

- Estado exclusivamente de simulación: el autor declara que nunca se ha ejecutado en un pato real; todas las métricas provienen de mjlab / MuJoCo Warp.
- Dependencia de un parche no fusionado: requiere tres claves de `[policy]` (`ground_pick_period`, `ground_pick_end_phase`, `ground_pick_heading`, `ground_pick_settle_s`) ausentes en `robotd` 0.23.1; sin el parche, el pato devuelve el control a los 0,7 s en mitad del deslizamiento.
- Sensibilidad a la latencia del bucle: sobrevive a +20 ms de retardo observación→acción, pero cae mayoritariamente a +40 ms (1–4 de 64 robots sobreviven). Es el primer punto de fallo en hardware real.
- Dependencia crítica del calzado: sin suelas deslizantes (cinta de PTFE) y puntas con agarre (tira de goma), el moonwalk no funciona. Las redes de marcha y bipedestación se entrenaron descalzas, por lo que hay que retirar el calzado antes de volver a caminar.
- Deriva de rumbo en suelos de alta fricción: a μ 0,40 la parada gira unos −3,5° por sí sola y el hand-back a la red de bipedestación añade aproximadamente +1,5° en todos los valores de μ.
- Actuadores y zapatos son modelos simulados: el ajuste del BAM XL330, la holgura de 2° y la fricción del calzado son estimaciones, no caracterizaciones de hardware real.
- Desactiva el reflejo de caída mientras se ejecuta la habilidad, por lo que se recomienda una superficie blanda y una mano preparada durante las pruebas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución del artefacto.
- Sin soporte lingüístico, multimodal ni de agentes: cualquier caso de uso de NLP queda fuera de su alcance por diseño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/giuvilasvito/microduck-moonwalk
- Repositorio del parche del daemon (rama `moonwalk-ground-pick-keys`): https://github.com/giuvilas/microduck/tree/moonwalk-ground-pick-keys
- Repositorio de entrenamiento referenciado: `pollen-robotics/microduck_rl` (familia de tareas `Mjlab-Moonwalk-Clock`, parche `microduck_rl-moonwalk.patch` sobre `develop` b02fdea4)
- Política de referencia del fabricante para el ground pick: `pollen-robotics/microduck-policies:alpha_ground_pick.onnx`
- Red de bipedestación de referencia: `alpha_stand.onnx`
- Pestaña Community del repositorio para reportar resultados: https://huggingface.co/giuvilasvito/microduck-moonwalk/discussions
