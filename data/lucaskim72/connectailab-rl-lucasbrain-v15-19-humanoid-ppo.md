# lucaskim72/connectailab-rl-lucasbrain-v15.19-humanoid-ppo

## Resumen

`connectailab-rl-lucasbrain-v15.19-humanoid-ppo` es una política de aprendizaje por refuerzo (no un modelo de lenguaje) entrenada con PPO para la tarea `Humanoid-v5` de Gymnasium/MuJoCo. La desarrolla Lucas Kim (AI Build Master) en el marco del curso de refuerzo de CONNECT AI LAB × AI CITY BUILDERS. El modelo resuelve control continuo de un humanoide simulado: recibe un vector de 348 observaciones del estado del cuerpo y emite 17 acciones articulares continuas en el rango [-0.4, 0.4]. Su relevancia es práctica y educativa: documenta de forma trazable una cadena de experimentos (v1 a v15.19) con ablaciones controladas de tasa de aprendizaje, presupuesto de pasos y recompensas de postura añadidas.

La arquitectura es una red de política PPO gaussiana con capas ocultas de 256 unidades y normalización de observaciones activada, acompañada de una red de valor separada. El entrenamiento acumula 21.431.136 pasos totales con 8 entornos paralelos y una tasa de aprendizaje de 3e-05 en la fase final. La evaluación se realiza sobre 10 episodios de validación (semillas 9000 a 9009) con un máximo de 1000 pasos por episodio.

El resultado declarado en la model card es de 8447.6 puntos de media en el entorno, con longitud media de episodio 1000.0 pasos y avance medio de 45.76 unidades. Es un artefacto de investigación reproducible, no un producto listo para producción, y su utilidad principal es como referencia de entrenamiento y como base para experimentos de recompensas compuestas en control continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política PPO gaussiana con red de valor; capas ocultas de 256 unidades; normalización de observaciones activada |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y solo se referencia `model.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 348 observaciones por paso, horizonte de episodio de 1000 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch); script auxiliar `added_scores.py` |
| Entorno | `Humanoid-v5` (Gymnasium / MuJoCo) |
| Dimension de observacion | 348 |
| Dimension de accion | 17 articulaciones, rango [-0.4, 0.4] |
| Algoritmo | PPO, política gaussiana, clip 0.2, gamma 0.99, lambda 0.95 |
| Entornos paralelos | 8 |
| Pasos por entorno por iteracion | 512 (4096 experiencias por actualizacion) |
| Pasos totales de entrenamiento | 21.431.136 |
| Tasa de aprendizaje final | 3e-05 |
| Bonus de exploracion | 0.0 |
| Evaluacion | 10 episodios hold-out, semillas 9000-9009 |

## Arquitectura y entrenamiento

La política es un actor-crítico PPO con dos cabezas: una que produce la media de una distribución gaussiana sobre las 17 acciones articulares (con desviación típica aprendida) y otra que estima el valor del estado. La observación de 348 dimensiones se normaliza antes de entrar en la red, y las capas ocultas son de 256 unidades. El entrenamiento usa 8 copias del entorno en paralelo, 512 pasos por entorno por iteración (4096 transiciones por actualización) y descarta las experiencias tras cada actualización, sin buffer de repetición.

La cadena de experimentos está documentada de forma explícita: v1 (1M pasos, lr 0.0003) como línea base; v7 (lr 0.0001) como mejor variante de tasa de aprendizaje; v13 (2M pasos) y v14 (4M pasos, mejor checkpoint en 3,7M) escalando el presupuesto; y v15 (lr 0.00003) partiendo del checkpoint de 3,7M de v14. Sobre v15 se añadieron recompensas de postura de forma incremental (v15.1 a v15.19), con multiplicadores configurables para tronco, cintura, pecho, brazos, pies, equilibrio, rodillas, centro de masa, elevación, sobreflexión y pie alto. Los multiplicadores finales de v15.19 son: tronco 0, cintura 0.4, pecho 0.4, equilibrio 0, rodillas 1, centro 1, elevación 0.5, sobreflexión 0.25, pie alto 0.25, brazos 0.2 y pies 0.25. La función de recompensa compuesta reside en `added_scores.py`, separada de los pesos.

La innovación técnica destacable no es arquitectónica sino metodológica: la separación limpia entre pesos (`model.pt`) y función de recompensa (`added_scores.py`), y la publicación de la tabla completa de ablaciones con la puntuación de entorno y cada componente de postura por versión, lo que permite reproducir y auditar cada decisión de diseño.

## Capacidades

- Control continuo de un humanoide simulado de 17 articulaciones en `Humanoid-v5`.
- Locomoción bípeda hacia delante con estabilidad mantenida durante 1000 pasos (episodio completo).
- Mantenimiento de postura erguida con altura dentro del rango [1.0, 2.0]; fuera de ese rango el episodio termina.
- Control de rodillas, centro de masa y elevación de pies mediante recompensas compuestas.
- Política estocástica gaussiana: permite muestreo de acciones para exploración o evaluación determinista.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- **Investigación en aprendizaje por refuerzo**: servir como referencia reproducible de una curva de entrenamiento PPO documentada paso a paso, útil para comparar técnicas de ajuste de tasa de aprendizaje y presupuesto de pasos en control continuo.
- **Docencia y cursos de RL**: el repositorio incluye gráficas de entrenamiento y una tabla de ablaciones que permiten explicar en clase el efecto de cada recompensa de postura sobre la puntuación final del entorno.
- **Diseño de recompensas compuestas**: `added_scores.py` actúa como plantilla para experimentar con pesos de recompensa (equilibrio, rodillas, centro de masa) sin reentrenar desde cero, reutilizando los pesos de `model.pt`.
- **Simulación de robótica humanoide**: base para probar controladores de marcha en MuJoCo antes de transferir políticas a un robot físico, como el robot Tori que el autor menciona estar desarrollando.
- **Evaluación de estabilidad de políticas**: usar las 10 semillas hold-out (9000-9009) como protocolo de evaluación estandarizado para comparar variantes de política con la misma métrica.
- **Punto de partida para fine-tuning con PPO**: el checkpoint de 21,4M pasos puede inicializar experimentos posteriores con nuevas funciones de recompensa o dominios de tarea similares.

## Benchmarks y rendimiento

Los únicos datos publicados son las puntuaciones del entorno `Humanoid-v5` sobre 10 episodios hold-out. No se han publicado resultados en benchmarks estándar de RL (por ejemplo, tablas comparativas con otras políticas en MuJoCo Gym) en la información disponible.

| Version | Puntuacion entorno | Avance medio | Longitud media |
|---|---|---|---|
| v15.1 | 6668.0 | 23.82 | no disponible |
| v15.4 | 7507.9 | 33.99 | no disponible |
| v15.6 | 7921.6 | 39.03 | no disponible |
| v15.13 | 8069.8 | 40.84 | no disponible |
| v15.16 | 8388.6 | 44.88 | no disponible |
| v15.18 | 8452.9 | 46.04 | no disponible |
| v15.19 (esta version) | 8447.6 | 45.76 | 1000.0 |

La puntuación de v15.19 es ligeramente inferior a la de v15.18 (8447.6 frente a 8452.9), si bien incorpora la penalización por pie alto (-29.8) que v15.18 no aplicaba. El avance medio también baja de 46.04 a 45.76. La model card no ofrece intervalos de confianza ni desviación típica entre semillas.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio ocupa 0.0 GB y la red es de tamaño reducido (capas ocultas de 256 unidades sobre 348 entradas y 17 salidas), por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con soporte CUDA es suficiente para inferencia; para reentrenamiento con PPO y 8 entornos MuJoCo en paralelo se recomienda una GPU de gama media-alta (RTX 3060 o superior), aunque no se publican requisitos oficiales.
- **GPU consumer**: sí, cabe en cualquier GPU consumer moderna e incluso en CPU para inferencia puntual, dado el reducido tamaño de la red.
- **Opciones de despliegue**: PyTorch nativo cargando `model.pt`; el entorno requiere Gymnasium y MuJoCo (`Humanoid-v5`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El coste dominante en inferencia es la simulación MuJoCo del entorno, no la red neuronal.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otras políticas PPO sobre `Humanoid-v5` en la información proporcionada. La comparación más directa es interna, contra las versiones anteriores del mismo autor:

| Modelo | Entorno | Pasos totales | Puntuacion | Licencia |
|---|---|---|---|---|
| lucasbrain v15.19 | Humanoid-v5 | 21.431.136 | 8447.6 | no disponible |
| lucasbrain v15.18 | Humanoid-v5 | no disponible | 8452.9 | no disponible |
| lucasbrain v15 (best) | Humanoid-v5 | no disponible | mejor media hold-out de la serie v15 | no disponible |
| lucasbrain v1 | Humanoid-v5 | 1.000.000 | no disponible | no disponible |

Alternativas externas como Stable-Baselines3 PPO o políticas publicadas en el leaderboard de Gymnasium no aparecen referenciadas en la información disponible; por tanto, la comparativa con modelos de terceros se indica como no disponible.

## Limitaciones y advertencias

- **Ámbito restringido**: es una política de control para `Humanoid-v5`; no genera texto, no razona en lenguaje natural y no tiene capacidades de visión ni audio.
- **Licencia no especificada**: la model card no declara licencia, lo que impide asumir permisos de uso comercial. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- **Sobreajuste a semillas de evaluación**: la puntuación se mide sobre 10 semillas fijas (9000-9009); no se publican intervalos de confianza ni evaluación en semillas no vistas, por lo que la robustez fuera de ese conjunto no está verificada.
- **Riesgo de sobreajuste a la recompensa**: las recompensas de postura añadidas manualmente pueden producir comportamientos que maximizan la métrica sin corresponder a una marcha natural; el autor documenta caídas de puntuación en versiones intermedias (v15.5, v15.10, v15.11, v15.17) que sugieren sensibilidad al diseño de recompensa.
- **Sin transferencia física demostrada**: no se aportan resultados de sim-to-real; el propio autor indica que el robot Tori está en desarrollo.
- **Reproducibilidad parcial**: los pesos de v15.5 a v15.18 se conservan solo en local según la model card, por lo que no todas las versiones de la tabla son descargables.
- **Sin datos de sesgo**: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero tampoco se documenta el comportamiento de la política ante condiciones iniciales atípicas fuera del rango de entrenamiento.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-02, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v15.19-humanoid-ppo
- Script de recompensas compuestas: `added_scores.py` en el mismo repositorio (descargable vía `hf_hub_download`)
- Pesos del modelo: `model.pt` en el mismo repositorio
- Entorno `Humanoid-v5`: Gymnasium / MuJoCo (documentación oficial de Gymnasium)
- Contacto del autor: lucaskim72@gmail.com
- Repositorios de versiones anteriores citados en la model card: v1, v7, v13, v14, v15 (best), v15.1, v15.2, v15.3, v15.4 (páginas propias en Hugging Face bajo el mismo autor; URL exacta no disponible en la información proporcionada)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
