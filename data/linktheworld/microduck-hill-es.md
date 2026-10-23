# linkTheWorld/microduck-hill-es

## Resumen

`linkTheWorld/microduck-hill-es` es una política de control motriz (locomotion policy) para el robot microduck de Pollen Robotics, publicada por el usuario linkTheWorld en HuggingFace. No es un modelo de lenguaje: es una red neuronal de política entrenada por aprendizaje por refuerzo que genera comandos de locomoción a 50 Hz a partir de un vector de observación de 61 dimensiones y produce 14 acciones. Se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que el robot le puede pasar observaciones en crudo.

Según la model card, la política deriva de una política propia de sprint de 2 m entrenada con PPO y una recompensa lineal de velocidad de avance, posteriormente refinada con estrategias evolutivas. La variante `hill-es` se ajustó con estrategias evolutivas sobre el simulador de colinas de Arena durante 20 generaciones y está pensada como marcha para el slot `walk` del microduck, con comportamiento perpetuo (se ejecuta de forma continua hasta que se le indique lo contrario). La evaluación reportada es de 98/100 llegadas a meta en semillas reservadas 2001-2100.

La relevancia es acotada y muy específica: se trata de un artefacto de investigación en robótica con simulación exclusiva ("Simulation only"), sin licencia declarada, sin métricas de transferencia sim-a-real y con un repositorio de tamano prácticamente nulo (0.0 GB), lo que sitúa el interés en el ámbito de la experimentación con políticas de locomoción y no en el despliegue comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política para control motriz entrenada con RL (PPO + estrategias evolutivas); topología de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 61 dimensiones por paso de control) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación / acción | 61 observaciones / 14 acciones |
| Slot de política | `microduck-slot:walk` |
| Modo de ejecución | perpetuo (sin condición de terminación episódica) |
| Entorno de validación | simulación (Arena, simulador de colinas); solo simulación |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, activaciones). Lo que sí se documenta es el procedimiento: se parte de una política propia de sprint de 2 m, entrenada con PPO usando una recompensa lineal de velocidad de avance, y después se aplica un refinamiento con estrategias evolutivas. Sobre esa base se realiza un ajuste fino con estrategias evolutivas en el simulador de colinas de Arena durante 20 generaciones, dando lugar a la política `hill-es` descrita como caminante de ascenso de 1.5 m.

El protocolo de selección de semillas está explícito en la model card: búsqueda sobre semillas de arranque 101-400, selección sobre 1001-1060 y evaluación sobre semillas held-out 2001-2100; las semillas 1-5 del tablero de evaluación nunca se usaron durante el desarrollo. El entrenamiento se ejecuta desde el repositorio `pollen-robotics/microduck_rl`, rama `sprint-race`, commit `822c9db39`. No se especifican el número de tokens ni un dataset en el sentido habitual, al no tratarse de un modelo generativo: los "datos" son rollouts de simulación. No se documenta uso de RLHF ni DPO.

## Capacidades

- Locomoción continua tipo marcha para el microduck, mapeando un vector de 61 observaciones a 14 acciones de control a 50 Hz.
- Ejecución perpetua: la política no emite señal de parada, corre hasta que el daemon o el operador la detengan.
- Ascenso de colinas en simulación: ajuste específico sobre el simulador de colinas de Arena, con recompensa de avance.
- Normalización de observaciones integrada en el ONNX: acepta observaciones en crudo sin preprocesado externo por parte del usuario.
- Integración con el daemon del robot mediante `robotctl policy load walk linkTheWorld/microduck-hill-es`, cargándola en el slot `walk`.
- Sin capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión, tool calling, agentes ni multilingüismo: no disponibles por la naturaleza del modelo.

## Casos de uso

- Locomoción base del microduck en terreno con pendiente: cargar la política en el slot `walk` con `robotctl policy load walk linkTheWorld/microduck-hill-es` y usar la marcha perpetua resultante como controlador por defecto al enfrentar rampas suaves en un entorno simulado.
- Punto de partida para experimentos de sim-a-real: servir como política inicial sobre la que medir la brecha de rendimiento al trasladar la marcha del simulador de Arena al robot físico, dado que el autor solo valida en simulación.
- Baseline en investigación de RL para locomoción: comparar nuevas variantes (por ejemplo, cambios en la recompensa de velocidad o en el número de generaciones de estrategias evolutivas) contra esta política, usando el mismo protocolo de semillas 101-400 / 1001-1060 / 2001-2100.
- Estudio de metodologías híbridas PPO + estrategias evolutivas: la política documenta explícitamente ese pipeline (PPO con recompensa lineal de avance, seguido de ES en 20 generaciones), lo que la hace útil como caso reproducible para analizar el coste y el beneficio del refinamiento evolutivo sobre una política PPO.
- Docencia y divulgación en robótica con refuerzo: el modelo es pequeño (repositorio de 0.0 GB) y se ejecuta vía ONNX, lo que simplifica montar prácticas donde el alumnado entrene, evalúe y sustituya políticas en el simulador.
- Pruebas de integración del daemon de microduck: al seguir el esquema 2 de manifiesto y requerir solo `policy.onnx` más `manifest.json`, sirve para validar el cargador de políticas, los slots y la frecuencia de 50 Hz en pipelines de CI del propio daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K y similares) en la información disponible, ya que no se trata de un modelo de lenguaje. El único dato cuantitativo publicado es el protocolo de evaluación de la propia política:

| Métrica | Resultado | Condiciones |
|---|---|---|
| Tasa de finalización en ascenso | 98/100 | Semillas held-out 2001-2100, simulador de colinas de Arena |
| Generaciones de ajuste evolutivo | 20 | Simulador de colinas de Arena |
| Semillas de búsqueda | 101-400 | Búsqueda de hiperparámetros/evolución |
| Semillas de selección | 1001-1060 | Selección de la política |
| Semillas del tablero de evaluación | 1-5 | Nunca usadas durante el desarrollo |
| Frecuencia de control | 50 Hz | Ejecución en el robot |
| Transferencia a robot físico | no disponible | La model card indica "Simulation only" |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El tamano del repositorio es de 0.0 GB (por debajo de 0.05 GB de resolución reportada), lo que indica un artefacto ONNX de muy pocos megabytes y, por tanto, sin necesidad de GPU dedicada.
- GPU recomendadas: no disponibles; por el tamano del artefacto, la inferencia es viable en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo e incluso en CPU, aunque no se publican requisitos oficiales ni latencias medidas.
- Opciones de despliegue: el runtime previsto es el daemon de microduck mediante `robotctl` y el cargador de políticas de la librería `microduck`; el artefacto es un `policy.onnx` ejecutable con ONNX Runtime. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la única referencia temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso), que la política debe sostener en el hardware del robot.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción comparables del mismo autor ni de terceros, ni datos de rendimiento de alternativas para el microduck o para ascenso de colinas en Arena. Tampoco se dispone de métricas homogéneas (mismas semillas, mismo simulador) que permitan una comparación rigurosa con políticas PPO o ES de otros repositorios.

## Limitaciones y advertencias

- Validación exclusivamente en simulación: la model card indica "Simulation only"; no hay evidencia publicada de funcionamiento en el robot físico ni de robustez frente a dinámicas no modeladas.
- Licencia no disponible: sin licencia declarada no se puede asumir permiso de uso comercial, redistribución ni modificación; es un riesgo legal directo para producción.
- Benchmark acotado: el 98/100 se mide sobre 100 semillas de un mismo simulador y con una política seleccionada previamente; no cubre otros terrenos, cargas, desgastes del hardware ni variaciones de calibración.
- Arquitectura y número de parámetros no documentados: dificulta la auditoría del modelo, el análisis de robustez y la estimación de requisitos de cómputo.
- Sin información sobre sesgos: no aplica en el sentido habitual, pero no se documenta el sesgo inductivo de la política (por ejemplo, preferencia por pendientes suaves o sensibilidad a la velocidad inicial).
- Riesgo de sobreajuste al simulador: el ajuste se hizo con 20 generaciones de estrategias evolutivas sobre un simulador concreto; aunque el protocolo separa búsqueda, selección y evaluación, no se reportan métricas de generalización a otros simuladores.
- Comportamiento perpetuo sin parada autónoma: si la política falla o el robot queda bloqueado, no emite señal de terminación; la parada debe gestionarla el operador o el daemon.
- Especialización estrecha: la política ocupa el slot `walk` y está entrenada para ascenso de colinas; no se documenta su comportamiento en llano, descensos ni terrenos abruptos.
- Modelo sin capacidades lingüísticas: el sufijo `-es` del identificador no debe interpretarse como soporte de idioma, ya que no hay metadatos de idiomas ni procesamiento de texto.
- Fecha de creación del repositorio (2026-10-23) y cero descargas: no existe validación comunitaria ni reportes independientes de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/linkTheWorld/microduck-hill-es
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `sprint-race`, commit `822c9db39` (https://github.com/pollen-robotics/microduck_rl/tree/822c9db39)
- Especificación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
