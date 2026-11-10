# lookarooka/connectailab-rl-novice-v1-link01-walk-ppo

## Resumen

`connectailab-rl-novice-v1-link01-walk-ppo` es una política de control de locomoción bípeda entrenada con PPO (Proximal Policy Optimization) para el robot físico LINK-01, una plataforma de 14 grados de libertad basada en la arquitectura Open Duck Mini. El modelo ha sido desarrollado por el autor `lookarooka` en el marco del curso de reinforcement learning de CONNECT AI LAB (proyecto "AI CITY BUILDERS"), y se publica como artefacto de referencia para el entorno de simulación MuJoCo `Link01Walk-v0`.

No es un modelo de lenguaje: es una red neuronal pequeña (actor `51 → 64 → 64 → 14`) que mapea un vector de observación de 51 dimensiones a 14 consignas de ángulo articular a 50 Hz. Su relevancia radica en el proceso de entrenamiento documentado: el autor compara cuatro variantes de PPO para superar el mínimo local típico de "quedarse de pie" (standing trap) en tareas de locomoción, y la variante híbrida (CPG warm-start + curriculum PPO) es la única que logra desplazamiento real.

El resultado declarado es un avance medio de 3,591 m en 20 s (0,1795 m/s) con 0 caídas por minuto, frente a los ~0,013 m de las variantes de PPO desde cero. El repositorio es de tamaño 0,0 GB y contiene los ficheros `model.pt`, `vecnormalize.pkl` y `actor.json`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) con activaciones Tanh; actor `51 → 64 → 64 → 14`, crítico asimétrico `51 → 256 → 256 → 1` |
| Parámetros totales | no disponible (red pequeña; el actor tiene 51·64 + 64·64 + 64·14 ≈ 8.200 pesos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 51 dimensiones por paso) |
| Tipos de cuantización | no disponible (pesos en float; exportación a `actor.json` con pesos en punto flotante) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` (esquema EZERAI Schema 1) |

## Arquitectura y entrenamiento

El modelo es una política de reinforcement learning para control continuo. El actor recibe un vector de 51 observaciones compuesto por gravedad (3), velocidad angular (3), desplazamiento articular respecto a la pose HOME (14), velocidad articular escalada por 0,05 (14), acción previa (14) y comando de velocidad (3). La salida son 14 acciones en `Box(-1, 1)` que se interpretan como ángulos residuales de ±0,18 rad respecto a la pose de reposo. La política se ejecuta a 50 Hz, con física a 500 Hz y control PD de los servos con `Kp=12`, `Kd=0,35`.

El entrenamiento compara cuatro estrategias de PPO sobre el entorno `Link01Walk-v0` / `Link01WalkGuided-v0`: (1) PPO vanilla desde cero, (2) PPO con alta entropía, (3) PPO con recompensa guiada por un patrón CPG (generador central de patrones), y (4) PPO híbrido con warm-start desde una trayectoria CPG y ajuste fino con curriculum. La variante adoptada es la cuarta: pre-entrena el mapeo estado-acción con la trayectoria CPG y después aplica PPO con `clip=0,12` y `lr=1e-4` sobre 16 entornos paralelos, 262.144 pasos y 6,85 minutos de cómputo. Una innovación destacable es el *folding* de la normalización de observaciones dentro de la primera capa lineal del actor, de modo que `actor.json` es autocontenido y reproduce el mismo comportamiento en el playground web y en Python sin preprocesado adicional.

## Capacidades

- Locomoción bípeda hacia delante a una velocidad comandada de 0,18 m/s en el entorno simulado `Link01Walk-v0`.
- Control continuo de 14 articulaciones (10 de piernas, 4 de cabeza/cuello) a 50 Hz.
- Estabilidad sin caídas declarada durante las pruebas de 20 s (0,0 caídas/min).
- Inferencia en navegador mediante `actor.json` (esquema EZERAI), sin dependencias de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control, no un modelo generativo.
- No dispone de visión, audio ni modo "thinking".

## Casos de uso

- **Validación de pipelines de RL en robótica**: sirve como referencia reproducible de una política PPO funcional sobre MuJoCo, útil para comparar curvas de aprendizaje y detectar el *standing trap* en entornos propios.
- **Simulación de control bípedo en MuJoCo**: integrable en `link01-gym` para probar recompensas, comandos de velocidad o perturbaciones antes de transferir a hardware.
- **Demo educativa en navegador**: el `actor.json` permite ejecutar la política en un playground web sin instalar PyTorch, adecuado para clases y talleres de reinforcement learning.
- **Punto de partida para fine-tuning**: al estar entrenada con curriculum CPG + PPO, puede reutilizarse como inicialización para tareas de locomoción más complejas (giros, terrenos irregulares) en la misma plataforma.
- **Pruebas de robustez de controladores PD**: el modelo permite evaluar el efecto de `Kp`, `Kd` y frecuencia de política sobre la estabilidad del robot sin reentrenar.
- **Referencia para transferencia sim-to-real**: documenta observaciones, acciones y normalización, lo que facilita replicar la política en el robot físico LINK-01 y medir la brecha de realidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente), sobre `Link01Walk-v0` con comando de 0,18 m/s y evaluación de 5 episodios de 20 s:

| Variante | Entorno | LR / Clip / Ent | Distancia media (m) | Velocidad media (m/s) | Caídas/min |
|---|---|---|---|---|---|
| PPO-Vanilla (scratch) | `Link01Walk-v0` | 0,0003 / 0,2 / 0,0 | 0,013 | 0,0006 | 0,00 |
| PPO-HighEntropy | `Link01Walk-v0` | 0,0005 / 0,25 / 0,01 | 0,016 | 0,0008 | 0,00 |
| PPO-Guided (CPG reward) | `Link01WalkGuided-v0` | 0,0003 / 0,2 / 0,002 | 0,013 | 0,0006 | 0,00 |
| **PPO-Hybrid-Curriculum (adoptada)** | `Link01WalkGuided-v0` | 0,0001 / 0,12 / 0,0 | **3,591** | **0,1795** | **0,00** |

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 MB para el actor; el modelo completo con crítico ocupa unos pocos MB. Cabe en cualquier GPU, CPU o incluso en el navegador.
- **GPU recomendadas**: no requiere GPU dedicada; cualquier CPU moderna basta para inferencia a 50 Hz. Una RTX 4090 o A100 solo serían necesarias para reentrenar con muchos entornos paralelos.
- **Consumer GPU**: sí, en cualquier GPU integrada o discreta; también en Raspberry Pi para control en tiempo real.
- **Despliegue**: PyTorch (`model.pt`), inferencia en Python puro con NumPy a partir de `actor.json`, y playground web compatible con el esquema EZERAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: la política se ejecuta a 50 Hz (20 ms por paso) con una MLP de ~8.200 pesos; la latencia de inferencia es despreciable frente al periodo de control. El entrenamiento declarado consumió 262.144 pasos en 6,85 minutos con 16 entornos paralelos.

## Comparativa con modelos similares

| Modelo | Plataforma | Parámetros | Contexto / observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `connectailab-rl-novice-v1-link01-walk-ppo` | LINK-01 (14 DoF) | ~8.200 (actor) | 51-dim obs | 0,1795 m/s, 0 caídas/min | no disponible | Hugging Face |
| Políticas PPO estándar de locomotion (p. ej. MuJoCo Gym) | Ant/Humanoid | ~decenas de miles | 100+ dim obs | variable según tarea | MIT/Apache en la mayoría de repos | Repos públicos |
| Open Duck Mini (políticas de referencia) | Biped 14 DoF | no disponible | no disponible | no disponible | no disponible | Repos públicos |

No se dispone de datos comparativos verificables con otras políticas de la misma plataforma en la información proporcionada.

## Limitaciones y advertencias

- **Resultados no verificados**: todas las métricas (`verified: false`) proceden del autor y no han sido replicadas de forma independiente.
- **Entrenamiento corto**: 262.144 pasos y 6,85 minutos son suficientes para una política de referencia, pero no para garantizar robustez ante perturbaciones, terrenos irregulares o comandos de velocidad distintos de 0,18 m/s.
- **Sesgo de simulación**: el modelo se ha entrenado únicamente en `Link01Walk-v0`/`Link01WalkGuided-v0`; la transferencia al robot físico LINK-01 no está documentada.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo), pero sí existe riesgo de comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento.
- **Idioma y contexto**: no aplica; la entrada es un vector numérico de 51 dimensiones.
- **Licencia**: no disponible, lo que impide confirmar si se permite uso comercial o redistribución.
- **Dependencia del entorno**: requiere `link01-gym` y MuJoCo para evaluación completa; el `actor.json` solo cubre la inferencia del actor, no el bucle de simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v1-link01-walk-ppo
- Repositorio del entorno `link01-gym`: no disponible en la información proporcionada
- Paper o blog técnico: no disponible
- Demo web (playground EZERAI): no disponible como URL en la información proporcionada
- Vídeo de replay (`replay.mp4`): referenciado en la model card del repositorio de Hugging Face
