# BrianHuang2003/cant-stop-ddqn

## Resumen

`BrianHuang2003/cant-stop-ddqn` es un repositorio de políticas entrenadas para el juego de mesa Can't Stop, publicado como entrega del proyecto final de la asignatura CS 441. No es un modelo de lenguaje ni un transformer: contiene checkpoints de aprendizaje por refuerzo para el simulador de dos jugadores del repositorio del autor, junto con una línea base de aprendizaje automático clásico (regresión ridge). El artefacto principal es un agente Double DQN (`best.pt`), acompañado de una política PPO (`ppo/best.pt`) y un modelo ridge (`ridge/ridge_domain.joblib`).

Su relevancia es acotada y de carácter metodológico: sirve como referencia reproducible de un pipeline completo de RL sobre un juego con azar (dados) y decisiones de continuar o plantarse, con semillas y sumas de verificación documentadas. Resulta útil para comparar enfoques value-based, policy gradient y clásicos bajo una misma configuración de evaluación, no como componente de propósito general.

El repositorio tiene un tamaño declarado de 0.0 GB, no registra descargas ni interacciones, y se distribuye bajo licencia "other". La model card no documenta arquitectura de red, número de parámetros, presupuesto de entrenamiento ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Double DQN (checkpoint principal); PPO actor-critic y regresion ridge como artefactos adicionales del mismo repositorio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de RL sobre el estado del juego; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch y joblib; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | other |
| Formato de pesos | PyTorch `.pt` (`best.pt`, `ppo/best.pt`) y joblib (`.joblib`) |

## Arquitectura y entrenamiento

El artefacto principal es una política Double DQN, una variante de Q-learning profundo que desacopla la selección de la acción de la evaluación del valor objetivo para reducir el sesgo de sobreestimación. El repositorio incluye además una política PPO (policy gradient con recorte de la ratio de probabilidad) y una regresión ridge como línea base clásica, lo que permite contrastar aprendizaje basado en valor, basado en política y un método supervisado ligero sobre el mismo entorno. El número de capas, el tamaño de las representaciones y la función de recompensa no se detallan en la información disponible.

Los nombres de los directorios de origen aportan pistas sobre la configuración experimental: `ddqn_mc_counterfactual_seed447` sugiere contrafactuales de Monte Carlo y `ppo_mc_focused_seed451` sugiere un enfoque de Monte Carlo con foco en alguna parte del espacio de estados, pero la model card no describe estos mecanismos. Lo que sí está documentado es la trazabilidad: semilla 447 para DDQN, 451 para PPO y 642 para ridge; emparejamiento fijo de dados Glenn–Aloi en las comparaciones retenidas de políticas aprendidas; y procedencia por fichero en `MODEL_FILES.json` y `SHA256SUMS`. El entrenamiento se realizó contra el simulador de dos jugadores del repositorio del proyecto, por lo que el entorno exacto (versión del código, commit) condiciona la validez de los resultados.

## Capacidades

- Selección de acción en Can't Stop para dos jugadores: decidir entre continuar la tirada o plantarse y qué columnas avanzar.
- Aprendizaje basado en valor con mitigación de sobreestimación (Double DQN) en un dominio con azar explícito.
- Política PPO entrenada de forma independiente, apta para comparación algorítmica.
- Línea base clásica de regresión ridge, útil como cota inferior de rendimiento y por su bajo coste de inferencia.
- Reproducibilidad: semillas, procedencia por fichero y sumas de verificación SHA256 incluidas.
- Evaluación estandarizada mediante `scripts/evaluate_ml.py` para checkpoints `.pt` y el cargador clásico del proyecto para `.joblib`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión ni audio.
- No tiene capacidades multilingües ni procesamiento de texto.

## Casos de uso

- Baseline de referencia en experimentos de RL: cargar `best.pt` con `scripts/evaluate_ml.py` como oponente fijo para medir la mejora de nuevas políticas bajo el mismo emparejamiento de dados Glenn–Aloi.
- Comparación de familias de algoritmos: ejecutar DDQN, PPO y ridge sobre el mismo conjunto de evaluaciones para contrastar enfoques value-based, policy gradient y supervisado clásico con idéntica configuración.
- Generación de datos de self-play: usar las políticas retenidas como generadores de trayectorias etiquetadas para entrenamiento por imitación o para construir un currículo de dificultad creciente.
- Docencia y divulgación: ilustrar en un curso de aprendizaje automático las diferencias prácticas entre Q-learning profundo, PPO y regresión, con artefactos ya entrenados y verificables por checksum.
- Análisis de estrategia del juego: instrumentar el agente para registrar valores Q o probabilidades de acción por estado y estudiar en qué configuraciones del tablero el modelo prefiere arriesgar una tirada adicional.
- Integración como oponente en torneos o simuladores de terceros: siempre que se reimplemente la interfaz de observación y acción del simulador original, el checkpoint puede servir de rival con coste de inferencia mínimo.
- Verificación de entornos: detectar regresiones en la implementación del simulador comparando las tasas de victoria del agente frente a los valores registrados con la configuración de evaluación original.
- Auditoría de reproducibilidad: replicar exactamente una ejecución a partir de semilla, commit de origen y SHA256, útil en revisiones de trabajos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de victoria, rendimiento medio ni curvas de entrenamiento para ninguno de los tres artefactos, por lo que no es posible presentar una tabla comparativa con cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo declara 0.0 GB, por lo que cada checkpoint es de tamaño muy reducido y cabe holgadamente en cualquier GPU consumer actual.
- GPU recomendadas: no se requiere GPU. La inferencia de un Q-network pequeño sobre el estado de un juego de mesa es viable en CPU; una RTX 4090, A100 o H100 no aportarían ventaja práctica frente a CPU en este dominio.
- Cabe en GPU consumer: sí, en cualquier modelo con memoria disponible; también en entornos sin GPU.
- Opciones de despliegue: no se contemplan vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje. El despliegue previsto es PyTorch (`torch.load` sobre `.pt`) o joblib para el modelo ridge, con el código de carga y evaluación del repositorio del proyecto.
- Latencia y throughput estimados: no disponibles. Cualquier cifra dependería de la implementación del simulador y del hardware, y no se publica ninguna medición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de terceros para este dominio concreto en el material proporcionado. La comparación factible es interna, entre los tres artefactos del mismo repositorio:

| Artefacto | Algoritmo | Semilla | Formato | Uso previsto | Licencia |
|---|---|---|---|---|---|
| `best.pt` | Double DQN | 447 | PyTorch `.pt` | Referencia retenida DDQN | other |
| `ppo/best.pt` | PPO | 451 | PyTorch `.pt` | Política retenida PPO-451 | other |
| `ridge/ridge_domain.joblib` | Regresión ridge | 642 | joblib | Línea base clásica ligera | other |

## Limitaciones y advertencias

- Alcance restringido: son políticas específicas del simulador de dos jugadores del proyecto CS 441, no modelos genéricos ni reutilizables fuera de ese entorno sin reimplementar la interfaz de observación y acción.
- Sin métricas publicadas: no hay tasas de victoria ni curvas de aprendizaje en la model card, de modo que el rendimiento relativo de DDQN frente a PPO o ridge no puede verificarse sin ejecutar la evaluación por cuenta propia.
- Dependencia del código y del commit: la validez de los resultados está ligada a la versión del simulador y a la configuración de evaluación; cambios en las reglas o en el emparejamiento de dados invalidan las comparaciones.
- Riesgo de sobreajuste al emparejamiento fijo de dados Glenn–Aloi: las comparaciones retenidas usan esa configuración, por lo que el comportamiento frente a secuencias aleatorias distintas no está caracterizado.
- Sin soporte de lenguaje natural: no admite instrucciones en texto, tool calling ni razonamiento multi-paso; cualquier uso conversacional requeriría un sistema externo que traduzca estado e intenciones.
- Sesgos y alucinación: no aplica el concepto de alucinación en el sentido de modelos generativos; el riesgo equivalente es una política que explota defectos del simulador o que generaliza mal a estados poco visitados.
- Licencia "other": no se especifican términos de uso comercial, atribución ni redistribución. Es imprescindible contactar con el autor o consultar el repositorio antes de cualquier uso en producción.
- Repositorio sin tracción: cero descargas y cero interacciones, sin mantenimiento ni issues documentados; la carga de los checkpoints debe validarse contra la versión actual del código del proyecto.
- Reproducibilidad condicionada: al informar resultados deben conservarse nombre del modelo, semilla, commit de origen y configuración de evaluación, tal como exige la propia model card.

## Enlaces

- HuggingFace: https://huggingface.co/BrianHuang2003/cant-stop-ddqn
- Repositorio del proyecto (código de carga y evaluación): https://github.com/BrianHuang2003/CS441_AML
- Guía de modelos del proyecto (ruta en el repositorio): `docs/MODEL_GUIDE.md`
- Procedencia por fichero y checksums (rutas en el repositorio): `MODEL_FILES.json` y `SHA256SUMS`
- Script de evaluación de checkpoints `.pt`: `scripts/evaluate_ml.py`
