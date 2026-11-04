# lucaskim72/connectailab-rl-lucasbrain-v10-lunarlander

## Resumen

connectailab-rl-lucasbrain-v10-lunarlander es un agente de aprendizaje por refuerzo profundo entrenado para resolver el entorno LunarLander-v3 de Gymnasium, un problema de control continuo en el que un módulo de aterrizaje debe posarse suavemente sobre una plataforma entre dos banderas. No es un modelo de lenguaje: es una red neuronal pequeña que implementa un agente DQN (Deep Q-Network) con arquitectura dueling, Double DQN, Prioritized Experience Replay (PER) y aprendizaje n-step, publicado por el autor Lucas Kim en el contexto de los laboratorios CONNECT AI LAB y AI CITY BUILDERS.

El modelo forma parte de una serie de diez iteraciones (v1 a v10) documentadas en la model card, donde cada versión modifica una o varias hiperparámetros respecto a una línea base y se evalúa sobre diez semillas de validación no vistas durante el entrenamiento. La versión v10 obtiene una puntuación media de 282,5 en ese conjunto de evaluación, por encima del umbral de 200 que el autor considera éxito. La relevancia del artefacto es principalmente didáctica y reproducible: documenta de forma sistemática el efecto de hiperparámetros como la tasa de aprendizaje, el número total de pasos, la exploración o el factor de descuento en un entorno de referencia clásico.

El repositorio ocupa 0,0 GB según HuggingFace, lo que es coherente con el tamaño esperado de una red de dos capas ocultas de 256 unidades y una cabeza dueling con salida de valor escalar y cuatro ventajas. No se dispone de información sobre licencia, idiomas ni formatos de pesos más allá de un checkpoint PyTorch (`model.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) con cabeza dueling: 8 → 256 → 256 → (valor 1 + ventajas 4) |
| Parametros totales | No disponible (estimación: ~140.000, no confirmada por el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de 8 valores de estado; no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch en coma flotante, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch con `state_dict` y metadatos de entrenamiento) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa con dos capas ocultas de 256 unidades y activación ReLU. La cabeza de salida implementa una descomposición dueling: una rama produce el valor de estado V(s) y otra las ventajas A(s,a) para las cuatro acciones (no hacer nada, motor izquierdo, motor principal, motor derecho). La salida Q se calcula como V(s) + A(s,a) − media(A(s,·)). El entrenamiento emplea Double DQN para reducir el sesgo de sobreestimación, Prioritized Experience Replay para muestrear transiciones con mayor error TD, objetivos n-step con n=3 y actualización soft del target con τ=0,005. La exploración sigue un esquema ε-greedy con decaimiento durante el 50 % de los pasos totales.

La configuración final de v10 corresponde a 500.000 pasos de entorno, tasa de aprendizaje 0,00015, factor de descuento γ=0,995, recorte de gradiente de 10,0 y sin reward shaping (la recompensa de entrenamiento es la original de Gymnasium). La model card documenta el efecto aislado de varios hiperparámetros mediante comparaciones controladas: reducir la tasa de aprendizaje a 0,0001 empeoró la puntuación en 15,2 puntos (v3→v5), aumentar los pasos de 400.000 a 500.000 la mejoró en 6,2 (v3→v6), introducir una función de recompensa potencial la empeoró en 31,2 (v6→v8), duplicar la anchura oculta a 512 la empeoró en 1,1 (v6→v9) y elevar γ de 0,990 a 0,995 la mejoró en 0,8 (v6→v10). Las variables Double, Dueling, PER, n-step y soft target se modificaron conjuntamente en v1→v2 y no pueden atribuirse individualmente.

## Capacidades

- Control de políticas en el entorno LunarLander-v3: recibe un vector de 8 valores (posición x e y, velocidades x e y, ángulo, velocidad angular, contacto con pata izquierda y derecha) y devuelve una de cuatro acciones discretas.
- Selección de acción determinista mediante `argmax` sobre los valores Q, adecuada para evaluación y despliegue.
- Aprendizaje por refuerzo off-policy con experiencia priorizada y objetivos n-step, reproducible a partir de la configuración documentada.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión, audio ni capacidades multilingües.
- No dispone de modo thinking ni de generación de texto de ningún tipo.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio sirve como ejemplo completo y reproducible de un pipeline DQN con Double, Dueling, PER y n-step, con la curva de experimentos documentada versión a versión. Es útil en cursos y talleres para ilustrar el efecto de cada hiperparámetro.
- Referencia de línea base en entornos de control clásico: investigadores que trabajen en LunarLander-v3 o entornos similares pueden comparar sus propios agentes contra la puntuación de 282,5 sobre las semillas 7000–7009, que el autor publica explícitamente.
- Reproducción de experimentos de ablación: la tabla de variables con su influencia medida y los coeficientes de correlación permiten replicar el diseño experimental y verificar las conclusiones sobre tasa de aprendizaje, pasos totales o función de recompensa.
- Integración en pipelines de Gymnasium: el checkpoint se carga con `torch.load` y se ejecuta con un `argmax` sobre la salida de la red, lo que permite insertarlo en bucles de evaluación estándar de Gymnasium sin dependencias adicionales.
- Estudio de reward shaping: la comparación v6→v8, donde una función de recompensa potencial redujo la puntuación en 31,2 puntos, es un caso concreto para analizar cómo el shaping mal diseñado puede degradar la política aprendida.
- Prototipado de agentes para robótica de aterrizaje: aunque el entorno es un juguete, la estructura estado-acción es análoga a la de problemas de control de vehículos, y el checkpoint puede servir como punto de partida para transferencia a simuladores más realistas.
- Generación de datos de demostración: las trayectorias de un agente con puntuación superior a 200 pueden emplearse como datos de imitación para inicializar otros agentes.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son las puntuaciones medias sobre diez semillas de validación (7000 a 7009) del entorno LunarLander-v3. No se han publicado resultados en benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje.

| Version | Cambio respecto a la base | Puntuacion media (10 semillas) | Diferencia |
|---|---|---|---|
| v1 | Base, DQN de clase | 233,6 | — |
| v2 | Cambio multiple (pasos, lr, exploracion, ocultas, n-step, Double, Dueling, PER, soft target) | 260,8 | +27,2 |
| v3 | Pasos 250k→400k y lr 0,00025→0,00015 | 275,5 | +14,7 |
| v4 | Pasos 400k→500k y lr 0,00015→0,0001 | 278,6 | +3,1 |
| v5 | Solo lr 0,00015→0,0001 | 260,3 | −15,2 |
| v6 | Solo pasos 400k→500k | 281,7 | +6,2 |
| v7 | Solo exploracion 0,50→0,40 | 281,1 | −0,6 |
| v8 | Solo recompensa: sin shaping→potencial | 250,5 | −31,2 |
| v9 | Solo ocultas 256→512 | 280,6 | −1,1 |
| v10 | Solo γ 0,990→0,995 | 282,5 | +0,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en coma flotante de 32 bits; el checkpoint completo ocupa una fracción muy pequeña de cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 o superior; el modelo también se ejecuta en CPU sin penalización práctica.
- Cabe en cualquier GPU consumer y en placas integradas; no requiere memoria dedicada significativa.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y `load_state_dict`), exportación a TorchScript u ONNX si se desea, o inferencia en CPU con NumPy para el bucle de entorno.
- Latencia y throughput: no disponibles de forma publicada; por el tamaño de la red, la inferencia por paso es del orden de microsegundos en GPU y de decenas de microsegundos en CPU, aunque el cuello de botella real será la simulación del entorno Gymnasium.

## Comparativa con modelos similares

| Modelo | Entorno | Arquitectura | Puntuacion media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v10-lunarlander | LunarLander-v3 | DQN dueling + Double + PER + n-step | 282,5 (10 semillas) | No disponible | HuggingFace |
| connectailab-rl-lucasbrain-v6-lunarlander | LunarLander-v3 | Misma arquitectura, γ=0,990 | 281,7 (10 semillas) | No disponible | HuggingFace (misma serie) |
| connectailab-rl-lucasbrain-v3-lunarlander | LunarLander-v3 | Misma arquitectura, 400k pasos | 275,5 (10 semillas) | No disponible | HuggingFace (misma serie) |
| Alternativas de terceros para LunarLander-v3 | LunarLander-v3 | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre agentes comparables de otros autores para LunarLander-v3 en la información proporcionada; la comparativa se limita a las versiones de la misma serie.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en LunarLander-v3; no generaliza a otros entornos ni a tareas de lenguaje, visión o control fuera de ese dominio.
- La puntuación de 282,5 se mide sobre diez semillas concretas (7000–7009); no hay garantía de que el rendimiento se mantenga en otras semillas o configuraciones del entorno.
- La licencia no está especificada en la información disponible, por lo que no puede confirmarse el uso comercial ni la redistribución del checkpoint.
- La model card está redactada en coreano y no documenta sesgos, riesgos de alucinación ni limitaciones de producción; al no ser un modelo generativo, el riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de sobreajuste a la distribución de evaluación.
- El autor advierte que las correlaciones entre hiperparámetros y puntuación no implican causalidad, especialmente en las variables modificadas conjuntamente en v1→v2 (Double, Dueling, PER, n-step, soft target).
- El repositorio no incluye el código de entrenamiento completo ni los scripts de evaluación; solo se documenta el procedimiento de carga e inferencia.
- El tamaño del repositorio es de 0,0 GB, lo que sugiere que el checkpoint puede no estar subido o que su tamaño es inferior a la resolución de medida de HuggingFace; conviene verificar la descarga antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v10-lunarlander
- CONNECT AI LAB (GitHub): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, sección de robótica: https://www.aicitybuilders.com/robot
- Entorno LunarLander-v3 de Gymnasium: no disponible en la información proporcionada
- Paper de referencia de DQN, Double DQN, Dueling DQN o PER: no disponible en la información proporcionada
