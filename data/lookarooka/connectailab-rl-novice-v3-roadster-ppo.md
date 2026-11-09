# lookarooka/connectailab-rl-novice-v3-roadster-ppo

## Resumen

`connectailab-rl-novice-v3-roadster-ppo` es un agente de aprendizaje por refuerzo profundo entrenado con PPO (Proximal Policy Optimization) para el control continuo de actitud y el aterrizaje preciso de una nave tipo roadster que cae en caída libre invertida 180 grados. Lo desarrolla el autor de Hugging Face `lookarooka` en el marco del curso de refuerzo de CONNECT AI LAB (lección 6, agente "novice", versión v3). No es un modelo de lenguaje: es una política de control que mapea un vector de observación de dimensión 7 a una acción continua de dimensión 2.

El problema que resuelve es un caso clásico de control continuo con recompensa escasa: en la lección 5, un agente DQN basado en valores alcanzó un 0 % de aterrizajes por olvido catastrófico al inundarse el búfer de repetición con trayectorias de caída. La versión PPO v3 sustituye la selección discreta de acciones por el ajuste continuo de la intensidad del propulsor principal y del par de giro de los propulsores RCS, y reporta una tasa de aterrizaje del 100 % en pruebas y superior al 95 % en validación agregada.

El modelo es relevante como referencia didáctica de ingeniería de PPO en entornos Gymnasium con observaciones normalizadas, GAE y simulación en paralelo, más que por su aplicabilidad general: se limita a un simulador concreto y no dispone de model card en formato convencional ni de licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes separadas actor-crítico (perceptrón multicapa, capas ocultas 64-64, activación Tanh); política gaussiana con desviación típica independiente del estado como `nn.Parameter` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 7 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch, `state_dict`) |

## Arquitectura y entrenamiento

La política recibe un vector de observación en R^7: posición relativa horizontal y vertical normalizadas (x/5, y/10), velocidades lineales (v_x/2, v_y/2), orientación codificada como sin(θ) y cos(θ) para evitar la discontinuidad en ±π, y velocidad angular (ω/2). La acción es un vector continuo en Box(2): a_0 en [0, 1] como intensidad del propulsor principal y a_1 en [-1, 1] como par de giro de los propulsores de gas frío. El actor y el crítico tienen troncales separadas.

El entrenamiento usa PPO on-policy con recolección de 4.096 transiciones por iteración mediante 16 entornos simulados en paralelo, GAE con γ = 0,99 y λ = 0,98, objetivo sustituto recortado con ε = 0,20, tasa de aprendizaje 3e-4 y 2.000.000 de pasos totales. La función de recompensa combina +100 por aterrizaje válido (error horizontal |x| ≤ 1,5, inclinación |θ| < 20°, velocidad de descenso v_y > -1,5 y velocidad horizontal |v_x| < 1,2), -100 por choque o salida de pantalla, recompensa de conformación basada en potencial ΔΦ(s) y penalizaciones por consumo de combustible (-0,3·a_0 y -0,03·|a_1|). No se documenta uso de RLHF ni DPO, por tratarse de un dominio de control.

## Capacidades

- Control continuo de actitud y aterrizaje de una nave en un simulador físico bidimensional con gravedad.
- Estabilización de orientación mediante la codificación sin/cos del ángulo, robusta frente a la discontinuidad angular.
- Política estocástica gaussiana con desviación típica aprendida, apta para exploración durante el entrenamiento.
- Gestión implícita del compromiso entre precisión de aterrizaje y gasto de combustible.
- Generalización dentro del simulador: reporta 100 % de aterrizajes en pruebas y más del 95 % en validación agregada sobre episodios no vistos.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como referencia ejecutable para comparar DQN y PPO en un mismo entorno, con código de carga en tres líneas y pesos publicados en el Hub.
- Estudio de recompensas escasas: el par DQN (0 %) frente a PPO (95-100 %) ilustra el olvido catastrófico y la estabilización mediante recorte del objetivo sustituto.
- Ajuste de conformación de recompensas: la recompensa de potencial ΔΦ(s) y las penalizaciones por combustible permiten experimentar con el equilibrio entre precisión y eficiencia energética.
- Control de actitud en simulación aeroespacial: el mapeo de observaciones (posición, velocidad, orientación, velocidad angular) a propulsión y par es directamente reutilizable en prototipos de control de descenso.
- Evaluación de infraestructura de entrenamiento paralelo: la configuración con 16 entornos y 4.096 transiciones por iteración sirve de plantilla para medir rendimiento de rollouts vectorizados.
- Pruebas de robustez ante perturbaciones iniciales: la variación de la inclinación inicial y de la posición permite analizar la sensibilidad de la política entrenada.
- Referencia para pipelines de RL en PyTorch: el formato `model.pt` con `state_dict` facilita la integración en scripts de evaluación propios.

## Benchmarks y rendimiento

Los datos disponibles son resultados internos del autor en su simulador, no benchmarks estandarizados.

| Versión | Pasos | Entornos paralelos | Clip | LR | GAE λ | Pico de aterrizaje en prueba | Notas |
|---|---|---|---|---|---|---|---|
| v1 | 1.000.000 | 8 | 0,20 | 3e-4 | 0,95 | 100,0 % (final 96 %) | Convergencia en 47 s |
| v2 | 2.000.000 | 8 | 0,15 | 2,5e-4 | 0,98 | 100,0 % (final 96 %) | Actualizaciones más conservadoras |
| v3 | 2.000.000 | 16 | 0,20 | 3e-4 | 0,98 | 100,0 % (5 evaluaciones consecutivas) | Convergencia acelerada |

Comparación DQN frente a PPO reportada por el autor:

| Criterio | DQN (lección 5) | PPO v3 (lección 6) |
|---|---|---|
| Salida de acción | 4 acciones discretas | Continuo: [0, 1] y [-1, 1] |
| Objetivo de aprendizaje | Q(s, a) aproximada | π_θ(a|s) optimizada directamente |
| Memoria | Búfer de repetición de 100.000 | On-policy, 4.096 pasos y descarte |
| Tasa de aterrizaje | 0 % | 95,0 % - 100,0 % |

## Requisitos de hardware

- Inferencia en CPU: la red es un perceptrón de capas 64-64, por lo que la inferencia es prácticamente instantánea en cualquier CPU moderna; no requiere GPU.
- VRAM estimada: inferior a 1 GB en cualquier configuración; no se dispone de cifras oficiales.
- GPU recomendadas: no aplica para inferencia; para reentrenar con 16 entornos paralelos se recomienda una GPU de consumo como RTX 3060 o superior, aunque no se documentan mediciones.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Despliegue: carga directa con `torch.load` y `state_dict`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor indica un tiempo de convergencia de 47 segundos para la versión v1, sin especificar hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-novice-v3-roadster-ppo | PPO, control continuo | R^7 / Box(2) | Simulador de aterrizaje de roadster | no disponible | Hugging Face |
| connectailab-rl-novice-v1-roadster-ppo (misma familia) | PPO, control continuo | R^7 / Box(2) | Igual | no disponible | Referenciado en la model card, no se confirma su publicación |
| Agente DQN de la lección 5 (misma familia) | DQN, acciones discretas | R^7 / 4 acciones | Igual | no disponible | Referenciado en la model card, no se confirma su publicación |
| Políticas PPO de referencia (Stable-Baselines3, CleanRL) | Implementaciones genéricas | Según entorno | Múltiples (Gymnasium) | MIT | Repositorios públicos |

No se dispone de comparaciones con modelos de terceros en el mismo entorno ni de métricas estandarizadas que permitan una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Específico del simulador: la política está entrenada para una dinámica concreta (gravedad, masas, límites de acción) y no se garantiza su transferencia a otro simulador o a un sistema físico.
- Sin licencia declarada: no se especifica permiso de uso comercial, modificación ni redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Sin model card convencional: la documentación está en coreano y estructurada como informe técnico, sin ficha estándar de Hugging Face; los metadatos de idioma y licencia aparecen como no disponibles.
- Métricas no verificables de forma independiente: las tasas de aterrizaje del 95-100 % proceden de las pruebas del propio autor, sin conjunto de evaluación público ni protocolo replicable documentado.
- Riesgo de sobreajuste al entorno: la normalización de observaciones y los umbrales de éxito están fijados al diseño del simulador; cambios en la escala o en los límites invalidan la política.
- Dependencia de código no publicado: el ejemplo de carga importa módulos del simulador y del agente que no se distribuyen en el repositorio del modelo.
- Sin capacidades de lenguaje: no debe confundirse con un modelo generativo; no procesa texto ni mantiene conversaciones.
- Sesgos y alucinación: no aplican en el sentido habitual, pero la política puede producir acciones no óptimas en estados fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v3-roadster-ppo
- Perfil del autor: https://huggingface.co/lookarooka
- Documentación de PPO (paper original): https://arxiv.org/abs/1707.06347
- Documentación de GAE (paper original): https://arxiv.org/abs/1506.02438
- Gymnasium: https://gymnasium.farama.org/
- Stable-Baselines3 (implementación de referencia de PPO): https://github.com/DLR-RM/stable-baselines3
- CleanRL (implementación de referencia de PPO): https://github.com/vwxyzjn/cleanrl
