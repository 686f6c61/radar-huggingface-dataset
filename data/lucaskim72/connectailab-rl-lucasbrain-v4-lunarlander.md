# lucaskim72/connectailab-rl-lucasbrain-v4-lunarlander

## Resumen

`connectailab-rl-lucasbrain-v4-lunarlander` es un agente de aprendizaje por refuerzo profundo entrenado para resolver el entorno `LunarLander-v3` de Gymnasium. Lo publica Lucas Kim bajo la cuenta `lucaskim72`, en el marco de las sesiones de refuerzo de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje: es una red de valores Q que recibe un vector de estado de 8 dimensiones y devuelve 4 valores Q correspondientes a las acciones disponibles (no hacer nada, motor izquierdo, motor central, motor derecho).

La arquitectura es una red neuronal totalmente conectada de tipo dueling, con dos capas ocultas de 256 unidades y activación ReLU, que separa el valor de estado y la ventaja por acción. El entrenamiento combina DQN con Double DQN, dueling, prioritized experience replay (PER), n-step de 3 pasos y soft target updates, con 500 000 pasos totales. El resultado declarado es una media de 278,6 puntos en 10 episodios de validación con semillas fijas (7000 a 7009), por encima del umbral de 200 que el propio autor considera éxito.

El interés del modelo es principalmente didáctico y de reproducibilidad: documenta de forma explícita la progresión de versiones (v1 a v4), las correlaciones entre hiperparámetros y puntuación, y el plan de experimentos v5-v10. No obstante, el repositorio no incluye información sobre licencia, idiomas ni benchmarks comparativos con otros agentes, y su utilidad práctica queda acotada al entorno LunarLander.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully connected con cabeza dueling (value + advantage), DQN con Double, PER y n-step |
| Parametros totales | No disponible (la red es 8→256→256→1 y 8→256→256→4; el autor no publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de 8 valores de estado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch, `torch.load` con `weights_only=False`) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa con entrada de 8 dimensiones (posición x e y, velocidad x e y, inclinación, velocidad angular, contacto con pata izquierda y contacto con pata derecha), dos capas ocultas de 256 unidades con ReLU y una cabeza dueling que descompone la salida en un valor de estado `V(s)` y una ventaja `A(s,a)` de 4 dimensiones, combinadas como `V + A − mean(A)`. El agente selecciona la acción mediante `argmax` sobre los valores Q.

El entrenamiento usa 500 000 pasos totales, tasa de aprendizaje 0,0001, gamma 0,99, `explore_fraction` de 0,5, `soft_tau` de 0,005, `grad_clip` de 10,0, n-step de 3 y shaping de recompensa desactivado. Se aplican Double DQN, dueling y prioritized experience replay. La evaluación se hace con la recompensa original de LunarLander-v3 sobre 10 semillas de validación no vistas durante el entrenamiento. La model card documenta la evolución v1 (233,6) → v2 (260,8) → v3 (275,5) → v4 (278,6), aunque los cambios de hiperparámetros se hicieron en bloque y el autor reconoce que no puede atribuir las mejoras a variables individuales.

## Capacidades

- Control de política en el entorno `LunarLander-v3`: selecciona una de 4 acciones discretas a partir de 8 observaciones continuas.
- Toma de decisiones en un solo paso (no es un modelo generativo ni multi-turno).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación explícita; la política es reactiva.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.
- Rendimiento declarado de 278,6 de media en 10 episodios con semillas 7000-7009 (umbral de éxito: 200).

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como referencia funcional de un DQN con dueling, Double y PER para comparar contra implementaciones propias en el mismo entorno.
- Reproducción de experimentos: el checkpoint permite cargar la política y verificar la puntuación declarada con las semillas 7000-7009, útil para auditar resultados de un curso o tutorial.
- Baseline en ablaciones: se puede usar como punto de partida para probar variantes (por ejemplo, sin PER o con otra tasa de aprendizaje) y medir la diferencia frente a la política publicada.
- Demostraciones interactivas: al ser una red de 8 entradas y 4 salidas, se puede ejecutar en CPU sin dependencias pesadas dentro de notebooks o demos web del entorno LunarLander.
- Pruebas de robustez de entornos: sirve para evaluar cómo se degrada una política entrenada con semillas concretas cuando se varían condiciones del simulador (viento, turbulencia, gravedad), siempre dentro de LunarLander-v3.
- Material para tutoriales de despliegue: el script de carga con `hf_hub_download` y `torch.load` es un ejemplo mínimo de cómo empaquetar y consumir un agente RL desde Hugging Face.

## Benchmarks y rendimiento

| Version | Cambios respecto a la anterior | Media holdout (10 episodios) | Diferencia |
|---|---|---|---|
| v1 | DQN base del curso | 233,6 | — |
| v2 | 200k→250k pasos, lr 0,0005→0,00025, exploración 0,30→0,50, ocultas 128→256, n-step 1→3, Double/Dueling/PER/soft target activados | 260,8 | +27,2 |
| v3 | 250k→400k pasos, lr 0,00025→0,00015 | 275,5 | +14,7 |
| v4 | 400k→500k pasos, lr 0,00015→0,0001 | 278,6 | +3,1 |

No se han publicado resultados de benchmarks comparativos con otros agentes en la información disponible. El autor advierte que las correlaciones reportadas (+0,93 para Double, Dueling, PER, n-step, soft target, ocultas y exploración; −1,00 para la tasa de aprendizaje) se calculan sobre solo 4 muestras y con variables que cambian simultáneamente, por lo que no deben interpretarse como relaciones causales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; la red tiene dos capas de 256 unidades y una cabeza de 4 salidas.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch en CPU o GPU, exportación a TorchScript u ONNX para servir la política, o integración directa con Gymnasium en un bucle de evaluación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño de la red, la inferencia por paso debería ser del orden de microsegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v4-lunarlander | LunarLander-v3 | DQN + Double + Dueling + PER + n-step | No disponible | 8 valores de estado | No disponible | Hugging Face |
| Política de referencia de Stable-Baselines3 (DQN) | LunarLander-v3 | DQN | No disponible | 8 valores de estado | MIT (SB3) | Repositorio SB3 |
| Política de referencia de CleanRL (DQN) | LunarLander-v3 | DQN | No disponible | 8 valores de estado | MIT (CleanRL) | Repositorio CleanRL |

La comparación cuantitativa con estas alternativas no está disponible en la información proporcionada; el autor solo reporta la progresión interna v1-v4.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada con semillas fijas, puede sobreajustarse a la distribución de estados vista durante el entrenamiento.
- Riesgo de alucinación: no aplica (no es un modelo generativo), pero sí existe riesgo de generalización deficiente fuera de LunarLander-v3.
- Limitaciones de contexto o idioma: la entrada está restringida a 8 observaciones del entorno; no procesa texto ni otros dominios.
- Restricciones de licencia para uso comercial: la licencia no está indicada en el repositorio, por lo que no se puede asumir permiso de uso comercial.
- Caveats para producción: el autor reconoce que los cambios de hiperparámetros entre versiones se hicieron en bloque, por lo que las atribuciones individuales no están aisladas; el plan v5-v10 es solo una hoja de ruta y no está ejecutado. El checkpoint se carga con `weights_only=False`, lo que implica ejecutar código de deserialización y requiere confiar en el origen del archivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v4-lunarlander
- CONNECT AI LAB (GitHub): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, sección de robótica: https://www.aicitybuilders.com/robot
- Entorno LunarLander-v3 de Gymnasium: no disponible en la información proporcionada (referencia estándar de Gymnasium)
