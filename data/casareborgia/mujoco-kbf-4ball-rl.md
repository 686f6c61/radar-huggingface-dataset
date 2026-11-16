# casareborgia/mujoco-kbf-4ball-rl

## Resumen

`casareborgia/mujoco-kbf-4ball-rl` es un repositorio de investigación que acompaña a un proyecto de billar coreano a cuatro bandas (modalidad KBF, "4구 당구") simulado en MuJoCo. No es un modelo de lenguaje: es un artefacto de aprendizaje por refuerzo que contiene checkpoints de SAC (Soft Actor-Critic) entrenados con Stable-Baselines3 sobre un entorno Gymnasium propio, junto con el código del simulador, el juez de reglas, la función de recompensa y un planificador basado en búsqueda por simulación.

El interés del proyecto es metodológico: compara una política neuronal única (SAC) frente a un jugador que no aprende nada y que, en su lugar, simula cientos de tiros candidatos y elige el centro de la ventana de anotación más ancha. El resultado que documenta el autor es contundente: SAC se estanca en tasas de acierto por tiro del 14-28 % y pierde 40 de 40 partidos, mientras que el buscador acierta 75 de 75 disposiciones por nivel de dificultad y gana 50 de 50 partidos. El repositorio sirve, por tanto, como caso de estudio sobre cuándo la planificación con modelo supera a una política reactiva aprendida.

El tamaño del repositorio es de 0,0 GB según Hugging Face, con cero descargas y cero likes en el momento de la consulta. La model card está redactada en coreano y el autor no declara licencia. La fecha de creación indicada (2026-11-16) es futura respecto a la redacción habitual de estas fichas y debe tomarse como el dato que figura en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAC (Soft Actor-Critic) con `MlpPolicy` de Stable-Baselines3; red de política y crítica MLP |
| Parametros totales | no disponible (no se documenta el número de parámetros de las MLP) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la observación es un vector de 20 dimensiones por paso |
| Tipos de cuantizacion | no disponible (checkpoints `.zip` de SB3, no pesos cuantizables) |
| Idiomas soportados | ko (coreano, según metadatos del repo; el "idioma" se refiere a la documentación) |
| Licencia | no disponible |
| Formato de pesos | checkpoints `.zip` de Stable-Baselines3 (`sac_v3_level0.zip`, `sac_v4_level1.zip`, `sac_v4_level2.zip`, `sac_v5_bc_only.zip`, `sac_v5_mixed.zip`) |
| Libreria | stable-baselines3 |
| Entorno | MuJoCo, paso temporal 1 ms, integrador RK4 |
| Dimension de observacion | 20 |
| Dimension de accion | 4 (ángulo de puntería, potencia, efecto lateral, efecto vertical), rango -1 a 1 |
| Pipeline | reinforcement-learning |

## Arquitectura y entrenamiento

El agente es un SAC estándar de Stable-Baselines3 con `MlpPolicy` por defecto, aprendizaje 3e-4, búfer de repetición de 100 000 transiciones, tamaño de lote 256, gamma 0,95, tau 0,005, coeficiente de entropía ajustado automáticamente y 10 entornos paralelos vía `SubprocVecEnv`, con 5 actualizaciones por cada paso de los entornos paralelos (es decir, cada 10 tiros). Cada episodio de entrenamiento dura una entrada (inning), que termina en el primer fallo. El autor documenta cinco iteraciones (v1 a v5) con cambios en el espacio de acciones (de ángulo absoluto ±180° a relativo respecto a la bola roja más cercana, y luego a ±40°), en el orden del currículo (niveles 0, 1 y 2) y en el preentrenamiento.

La innovación técnica no está en la red sino en el diagnóstico del fracaso. El autor barre el eje de puntería en 393 pasos sobre 24 disposiciones y concluye que solo el 12-17 % del eje corresponde a intervalos de anotación, que el 66-77 % de estos son intervalos anchos y estables, y que la anchura del intervalo más ancho equivale a unos 4,6-11 mm de punto de contacto (aproximadamente 0,75° a 0,5 m de distancia), es decir, alrededor del 1 % del rango de acción ±40° que usaba SAC. Un político gaussiano no alcanza esa precisión de forma consistente, de ahí el estancamiento. El intento de v5 con prellenado de 1000 tiros anotadores y preentrenamiento por imitación (BC) tampoco funcionó: la política tras BC anotaba solo el 12,5 % (nivel de azar) porque la regresión MSE sobre múltiples tiros válidos por lote aprende un promedio que no corresponde a ningún tiro real, y al reanudar SAC el crítico se reajustó desde cero.

El jugador de búsqueda no entrena: aprovecha que el simulador es determinista y reversible. Representa cada tiro por la bola roja objetivo y el grosor de contacto (no por ángulo), muestrea 160 candidatos (2 bolas rojas × 2 niveles de potencia × 40 grosores), simula cada uno, localiza el intervalo continuo de grosores que anotan, lo refina y elige el centro del intervalo más ancho. Si la bola amarilla bloquea ambos caminos, barre 360° en pasos de 2° buscando un tiro con banda. Emplea unas 215 simulaciones por tiro.

## Capacidades

- Control de un agente de billar a cuatro bandas en un simulador MuJoCo: selecciona ángulo, potencia y efecto (lateral y vertical) para golpear la bola blanca.
- Política reactiva de un solo paso: dado un vector de observación de 20 dimensiones, emite una acción de 4 dimensiones en [-1, 1].
- Planificación con modelo (jugador de búsqueda): evalúa tiros candidatos simulando el entorno y selecciona el centro del intervalo de anotación más ancho.
- Recuperación mediante tiro con banda cuando la bola amarilla bloquea las líneas directas a ambas rojas.
- Evaluación de partidas completas bajo reglas KBF: anotación (tocar las dos rojas), fallo (tocar solo una), falta (no tocar ninguna, tocar la amarilla o sacar bola de la mesa), partido a 5 puntos en 10 entradas.
- Tres niveles de dificultad definidos por la disposición inicial (bolas agrupadas en 20 cm, media mesa aleatoria, mesa completa con un 20 % de disposiciones oficiales de salida).
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües: es un agente de control, no un modelo generativo.

## Casos de uso

- Estudio de caso sobre planificación frente a RL reactivo: el repositorio permite reproducir la comparación entre SAC y búsqueda por simulación con los mismos entornos y semillas, útil en docencia o en artículos sobre límites de las políticas gaussianas en tareas de precisión.
- Investigación en robótica de billar o de precisión: el modelo de impulsión de taco (`env/physics_obs.py`) y el entorno Gymnasium (`env/billiard_env.py`) sirven como banco de pruebas para algoritmos que requieran acciones continuas de alta precisión.
- Generación de datos de entrenamiento por imitación: el buscador puede etiquetar disposiciones con tiros de referencia, y el autor ya documenta el intento (fallido por regresión MSE) de usar 1000 tiros para BC, lo que orienta hacia alternativas como modelos generativos o pérdidas basadas en clasificación sobre intervalos.
- Desarrollo de funciones de recompensa: `env/reward.py` implementa recompensas densas (bonificación por primer contacto, por agrupar rojas, por aproximación, penalización por potencia) que pueden reutilizarse o compararse en otros entornos con recompensa dispersa.
- Validación de motores físicos para simulación de billar: el modelo MuJoCo (`assets/billiard_4ball.xml`) con mesa de 2,44 × 1,22 m, bolas de 65,5 mm y 240 g, y paso de 1 ms, permite medir el error del simulador frente a una mesa real antes de transferir políticas.
- Evaluación de robustez de políticas ante ruido: dado que el buscador depende de un simulador determinista, el repositorio es un punto de partida para inyectar ruido de observación o de física y medir la degradación, algo que el autor señala explícitamente como limitación.
- Demostración y material divulgativo: el vídeo `demo_short.mp4` (1080×1920, 57 s, a 2,4× de velocidad) compara ambos jugadores sobre la misma disposición inicial.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Las tasas de anotación de SAC se midieron de forma determinista sobre 120 disposiciones fijas por nivel (error de muestreo aproximado de ±4 puntos porcentuales).

| Jugador | Acierto por tiro (nivel 0 / 1 / 2) | Victorias (nivel 2, a 5 puntos y 10 entradas) |
|---|---|---|
| Tiro aleatorio | 23,0 % / 10,3 % / 7,8 % | no medido |
| SAC v4 (control) | 26,7 % / 14,2 % / 28,3 % | 0 / 40 |
| SAC v5 (prellenado + BC) | 22,5 % / 7,5 % / 22,5 % | no medido |
| Búsqueda por simulación | 100 % / 100 % / 100 % (75/75 por nivel) | 50 / 50 |

Datos adicionales de la model card:

| Version SAC | Cambio | Entrenamiento | Acierto | Faltas |
|---|---|---|---|---|
| v1 | Ángulo absoluto ±180°, currículo 0→1→2 | 20 000 pasos | 3 % | 67 % |
| v2 | Ángulo relativo a la roja cercana, recompensa ajustada | nivel 0, 30 000 pasos | 5,5 % | 55 % |
| v3 | Rango ±40°, observación de rojas por cercanía | nivel 0, 30 000 pasos | 34 % | 9 % |
| v4 | Continuación de v3 en niveles 1 y 2 | 20 000 pasos por nivel | 17,5 % / 25,5 % | 27 % / 28 % |
| v5 | Mezcla de niveles + 1000 tiros + BC | 20 000 pasos | 20 % | 27 % |

En las 40 partidas de SAC v4 se ejecutaron 447 tiros, de los cuales anotaron 47 (10,5 %) y 206 (46 %) fueron falta por golpear la bola amarilla. El buscador anotó los 250 tiros de sus 50 partidas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no aplica; las políticas son MLP pequeñas y los checkpoints se cargan en CPU. No se documenta el número de parámetros ni el uso de memoria.
- GPU recomendadas: no disponible; el entrenamiento con SAC y 10 entornos paralelos puede ejecutarse en CPU, aunque no se especifica hardware de referencia.
- GPU de consumo: no disponible; el cuello de botella es la simulación MuJoCo, no la inferencia de la red.
- Despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI. La ejecución se hace con Python, `stable-baselines3`, `gymnasium` y `mujoco`, mediante los scripts `train.py`, `eval_search.py`, `eval_viewer.py` y `make_demo_video.py`. En macOS el visor requiere `mjpython`.
- Latencia: el jugador de búsqueda tarda 10-20 s por tiro en una CPU de 10 núcleos (unas 215 simulaciones por tiro). No se documenta la latencia de la política SAC.
- Almacenamiento: repositorio de 0,0 GB; los checkpoints son ligeros, aunque el vídeo de demostración y los assets de MuJoCo ocupan parte de ese espacio.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación interna más relevante es la que ofrece el propio autor entre los dos enfoques del repositorio:

| Criterio | SAC v4 (RL) | Búsqueda por simulación |
|---|---|---|
| Aprendizaje | Sí, offline de política y crítica | No, planificación con modelo |
| Coste por decisión | Inferencia de una MLP (milisegundos) | Unas 215 simulaciones (10-20 s en CPU de 10 núcleos) |
| Acierto por tiro (nivel 2) | 28,3 % | 100 % |
| Victorias (nivel 2) | 0 / 40 | 50 / 50 |
| Requiere simulador determinista | No | Sí |
| Transferencia a mesa real | No evaluada | No evaluada; el autor advierte que no cabe esperar el mismo rendimiento con ruido |

## Limitaciones y advertencias

- La búsqueda es lenta: 10-20 s por tiro en CPU de 10 núcleos, tiempo que el vídeo de demostración recorta.
- El jugador de búsqueda no es un modelo de RL: depende de un simulador determinista y reversible, por lo que su rendimiento no es extrapolable a una mesa real con ruido, fricción variable o imperfecciones de la superficie.
- El buscador no usa efecto: golpea siempre el centro de la bola, lo que descarta tiros con efecto lateral o vertical.
- No planifica la posición para el siguiente tiro; solo evalúa si se anota en el tiro actual.
- La física de bandas es simplista: las bandas son paredes verticales, las bolas rápidas pueden saltar hasta 4,7 cm y el efecto lateral apenas afecta al ángulo de reflexión.
- No hay oponente: la bola amarilla solo actúa como obstáculo que no debe tocarse.
- SAC v4 registró un 46 % de faltas por golpear la bola amarilla en partido, lo que refleja un fallo sistemático de la política aprendida.
- El preentrenamiento por imitación (BC) con regresión MSE no funcionó: la política resultante anotaba el 12,5 %, nivel de azar.
- La licencia no está declarada, por lo que no se puede confirmar el uso comercial ni la redistribución de los checkpoints o del código.
- El repositorio tiene cero descargas y cero likes, sin validación externa documentada; las cifras proceden únicamente de la model card del autor.
- Las fechas del repositorio (creación 2026-11-16) son futuras y no se han verificado de forma independiente.
- El modelo no es un LLM: no procesa lenguaje natural, no tiene capacidades multilingües reales (el campo `language: ko` describe la documentación) y no admite tool calling ni razonamiento multi-paso en texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl
- Vídeo de demostración: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/demo_short.mp4
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- Gymnasium: https://gymnasium.farama.org/
- Documentación de SAC en SB3: https://stable-baselines3.readthedocs.io/en/master/modules/sac.html
