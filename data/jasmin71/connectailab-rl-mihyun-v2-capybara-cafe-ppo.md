# Jasmin71/connectailab-rl-mihyun-v2-capybara-cafe-ppo

## Resumen

`connectailab-rl-mihyun-v2-capybara-cafe-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO sobre un simulador propio de MuJoCo denominado `CapybaraCafe-v0`. No es un modelo de lenguaje: es una política de control continuo que gobierna a una capibara bípeda articulada (5 mallas independientes y 6 articulaciones de tipo *hinge*) dentro de una cafetería 3D de 3,5 m × 3,5 m, con el objetivo de servir bebidas en cinco zonas de mesa variables. Lo desarrolla Jasmin71 (Mihyun Lee) en el marco de AI CITY BUILDERS y CONNECT AI LAB, como material del curso de RL de la serie de clases sobre creación de simuladores propios con MuJoCo.

La relevancia del artefacto es fundamentalmente pedagógica y de ingeniería de simulación: documenta un salto de la versión v1 (malla única que se desplazaba como un robot con ruedas) a la v2 (locomoción bípeda real con swing alternado de caderas `hip_l`/`hip_r`, elevación de pie `z_lift`, balanceo pélvico y contrapeso del portavasos). El entorno se modeló en Blender 5.2 mediante MCP y se exportó a MuJoCo, y se registra bajo el estándar Gymnasium con `gym.register(id="CapybaraCafe-v0")`.

El espacio de observación es de 12 números (posición relativa de la mesa objetivo, distancia, coseno y seno del ángulo, velocidad lineal y angular, coordenadas relativas de dos mesas-obstáculo y fracción de tiempo restante) y el de acción es continuo bidimensional (aceleración `throttle ∈ [-1,1]` y dirección `steer ∈ [-1,1]`), acoplado a la cinemática de las seis articulaciones. El entrenamiento declarado consume 204.800 pasos con 8 entornos paralelos (`SubprocVecEnv`) y ronda los 19,8 segundos de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL (PPO, Stable-Baselines3) sobre observaciones de 12 dimensiones; simulador MuJoCo con rig articulado de 5 mallas y 6 articulaciones hinge |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; horizonte episódico limitado por la fracción de tiempo restante en observación) |
| Tipos de cuantizacion | no disponible (pesos de política RL; no se documentan formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.0 GB; librería declarada `stable-baselines3`, típicamente `.zip` de SB3, sin confirmar) |

## Arquitectura y entrenamiento

El agente es una política PPO de Stable-Baselines3 entrenada sobre un entorno Gymnasium personalizado, `CapybaraCafe-v0`, construido con MuJoCo como motor físico y modelado en Blender 5.2 vía MCP. El cuerpo del personaje se descompone en cinco mallas independientes (torso, pierna izquierda, pierna derecha, brazo izquierdo y bandeja de café) unidas por seis articulaciones `hinge`; la política emite dos acciones continuas (aceleración y guiñada) y el controlador derivado traduce la velocidad de avance en el ciclo de marcha bípeda y en el contrapeso horizontal de la bandeja. El escenario incluye dos mesas-obstáculo centrales y cinco zonas de destino variables (norte, sur, este, oeste y una quinta zona) en un área de 3,5 m × 3,5 m.

La función de recompensa combina cuatro términos: bonificación por acercamiento al objetivo proporcional al acortamiento de distancia (factor 25,0), gran propina por entrega completada (+100,0), penalización por paso de tiempo (−0,03) y penalización por colisión con mesa (−0,6). El entrenamiento se ejecutó con 8 instancias paralelas del entorno mediante `SubprocVecEnv`, 204.800 pasos totales y un tiempo de cómputo declarado de aproximadamente 19,8 segundos. No se documentan en la información disponible detalles sobre inicialización, currículo, semillas, hiperparámetros de PPO (learning rate, clip range, epochs) ni sobre técnicas de dominio aleatorizado.

## Capacidades

- Control continuo de locomoción bípeda: genera ciclos de marcha con swing alternado de caderas, elevación de pie y balanceo pélvico a partir de dos acciones de alto nivel.
- Navegación multiobjetivo: generaliza a cinco zonas de destino variables sin reentrenamiento específico por zona.
- Evasión de obstáculos: mantiene cero colisiones declaradas con las dos mesas centrales en 50 episodios de evaluación.
- Estabilización de carga: contrapeso activo de la bandeja de café para mantenerla horizontal durante la marcha.
- Integración con Gymnasium: registro estándar `gym.register(id="CapybaraCafe-v0")`, invocable con `gym.make("CapybaraCafe-v0", render_mode="rgb_array")`.
- Renderizado y depuración visual: salida `rgb_array` y utilidades de vídeo (replay MP4 y GIF) con cámara PIP de primer plano 3/4 en la esquina inferior derecha.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni procesamiento de lenguaje, visión o audio: es una política de control, no un modelo generativo.

## Casos de uso

- Docencia de RL con simuladores propios: el artefacto sirve como referencia completa de un pipeline que va del modelado en Blender 5.2 al registro Gymnasium y al entrenamiento PPO, replicable en un aula con recursos modestos (204.800 pasos y ~20 s de cómputo).
- Prototipado de controladores bípedos: la política y el entorno permiten experimentar con recompensas, observaciones y acciones sin partir de cero, comparando v1 (desplazamiento tipo ruedas) frente a v2 (marcha bípeda).
- Investigación en navegación multiobjetivo: el diseño de cinco zonas variables con dos obstáculos constituye un banco de pruebas para estudiar generalización de políticas de RL a configuraciones de objetivo no vistas.
- Estudio de recompensas con propina y penalización temporal: la combinación de shaping por distancia, bonus terminal, coste por paso y penalización por colisión permite analizar el efecto de cada término en la tasa de éxito y el tiempo medio de entrega.
- Generación de material divulgativo: los replays con cámara PIP y las comparativas antes/después del entrenamiento son directamente utilizables en charlas, clases y demostraciones de RL.
- Base para transferencia sim-to-sim o sim-to-real en robótica de servicio: el esquema observación-acción (posición relativa al objetivo, distancia, ángulo, velocidades, obstáculos y tiempo restante) es un patrón habitual en robótica móvil de interior, reutilizable como plantilla conceptual.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| 3D Bipedal Capybara Multi-Goal Cafe Serving (v2) | CapybaraCafe-v0 (MuJoCo + Blender 5.2 MCP, rig articulado de 5 partes) | Tasa de exito en 50 episodios, 5 zonas (%) | 100 (50/50) |
| 3D Bipedal Capybara Multi-Goal Cafe Serving (v2) | CapybaraCafe-v0 | Tiempo medio de entrega (s) | 1,29 |

No se han publicado en la información disponible resultados comparativos con otros agentes, curvas de aprendizaje, desviaciones estándar ni métricas de eficiencia muestral más allá del total de 204.800 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del artefacto (política PPO de observación de 12 dimensiones y acción de 2 dimensiones), la huella del modelo es mínima y el cuello de botella es el simulador MuJoCo, no la red.
- GPU recomendadas: no se especifican. El entrenamiento declarado (204.800 pasos, ~19,8 s) sugiere que se ejecutó en hardware de gama consumer o en CPU; no hay datos de la GPU empleada.
- Compatibilidad con GPU consumer: previsiblemente sí en cualquier GPU con soporte CUDA para PyTorch, o incluso en CPU, dado el reducido coste declarado; no confirmado en la información disponible.
- Opciones de despliegue: Stable-Baselines3 (librería declarada) con PyTorch; MuJoCo como motor físico; Gymnasium para el registro del entorno. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles de forma agregada; el único dato temporal es el tiempo medio de entrega por episodio (1,29 s) y el tiempo total de entrenamiento (~19,8 s para 204.800 pasos con 8 entornos paralelos).

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Entrenamiento | Resultado declarado | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-mihyun-v2-capybara-cafe-ppo | PPO (SB3), control continuo | CapybaraCafe-v0 (MuJoCo + Blender 5.2) | 204.800 pasos, 8 entornos | 100 % éxito en 50 episodios, 1,29 s de media | no disponible |
| connectailab-rl-mihyun-v1-capybara-cafe-ppo | PPO (SB3), control continuo | CapybaraCafe v1 (malla única, desplazamiento tipo ruedas) | no disponible | no disponible | no disponible |
| connectailab-rl-mihyun-v2-mujoco-hopper-ppo | PPO (SB3), control continuo | MuJoCo Hopper-v5 | no disponible | no disponible | no disponible |

Los tres artefactos proceden del mismo autor y laboratorio, por lo que la comparación es interna a la serie y no frente a políticas de referencia externas (por ejemplo, baselines de Gymnasium-MuJoCo o implementaciones de terceros), para las que no hay datos en la información disponible.

## Limitaciones y advertencias

- Ámbito estrictamente restringido: es una política de control para un simulador concreto, no un modelo de propósito general; no procesa texto, imagen ni audio.
- Resultados no verificados: las métricas del `model-index` están marcadas con `verified: false` y proceden únicamente del autor; no hay evaluación independiente ni réplica publicada.
- Evaluación limitada: 50 episodios en un único entorno con cinco zonas; no se documentan pruebas con semillas distintas, dominio aleatorizado, cambios de masa, fricción o latencia, por lo que la robustez fuera de la distribución de entrenamiento es desconocida.
- Sobreajuste potencial al escenario: el shaping de recompensa con factor 25,0 por acortamiento de distancia y bonus terminal de +100,0 puede producir políticas que explotan la geometría concreta del mapa (dos obstáculos fijos en el centro) en lugar de comportamientos de navegación generalizables.
- Licencia no disponible: no se declara licencia en la información proporcionada, lo que impide confirmar el uso comercial, la redistribución o la creación de obras derivadas; debe consultarse con el autor antes de cualquier uso en producción.
- Idiomas y sesgos: no aplica el análisis habitual de sesgos lingüísticos, pero sí el riesgo de sesgo de simulación (parámetros físicos idealizados, sin ruido sensorial ni actuadores imperfectos), que limita la transferencia a hardware real.
- Repositorio prácticamente vacío en cuanto a tamaño (0.0 GB declarado): no se confirma la presencia de los pesos entrenados, del código del entorno `capybara_env` ni de los recursos de vídeo referenciados en la model card, lo que puede impedir la reproducción directa.
- Dependencia de versiones concretas: Blender 5.2 con MCP y MuJoCo con `gym.register`; cambios de versión en cualquiera de las piezas pueden romper la reproducibilidad.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso: cualquier flujo de producción que requiera esas capacidades debe combinarse con otros componentes.

## Enlaces

- Modelo en Hugging Face (v2): https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v2-capybara-cafe-ppo
- Versión anterior v1: https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-capybara-cafe-ppo
- Modelo relacionado (MuJoCo Hopper-v5 PPO): https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v2-mujoco-hopper-ppo/tree/main
- Perfil del autor: https://huggingface.co/Jasmin71
