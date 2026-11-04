# artnfull/connectailab-rl-artnfull-v1-link01-walk-ppo

## Resumen

`connectailab-rl-artnfull-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3. Lo publica el usuario `artnfull` en el marco del programa educativo CONNECT AI LAB (lección 7 del curso de IA de refuerzo "AI CITY BUILDERS"). Su objetivo es controlar la locomoción bípeda del robot simulado LINK-01 en el entorno `Link01Walk-v0`, definido sobre el simulador físico MuJoCo a través del paquete `link01-gym`.

No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de control entrenada desde cero (sin inicialización a partir de demostraciones) que recibe una observación de 51 dimensiones y emite 14 acciones continuas correspondientes a las articulaciones del robot, con una postura base acotada a ±0,18 rad. El entrenamiento se completó en 500.000 pasos, con un coste declarado de 15,9 minutos de cómputo.

El interés del artefacto es principalmente didáctico y reproducible: sirve como referencia mínima de un pipeline completo de RL (entorno, entrenamiento PPO, normalización de observaciones y exportación de pesos) para robótica de locomoción. El rendimiento absoluto es muy bajo en términos de velocidad (0,0375 m/s), por lo que debe interpretarse como un punto de partida verificable más que como un controlador listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de red neuronal (MLP) entrenada con PPO sobre Stable-Baselines3; no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (observación de 51 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control robótico) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl`, `actor.json` |

Otros datos declarados por el autor:

| Parametro | Valor |
|---|---|
| Entorno | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Dimension de observacion | 51 |
| Dimension de accion | 14 (14 articulaciones, postura base ±0,18 rad) |
| Algoritmo | PPO (lr 0,0003, clip 0,2) |
| Pasos de entrenamiento | 500.000 |
| Tiempo de entrenamiento | 15,9 minutos |
| Comando de velocidad evaluado | 0,18 m/s |
| Protocolo de evaluacion | 5 episodios × 20 s |

## Arquitectura y entrenamiento

El agente sigue el esquema estándar de actor-crítico de PPO implementado en Stable-Baselines3: una política parametrizada que mapea observaciones de 51 dimensiones a una distribución gaussiana sobre 14 acciones continuas, y una función de valor que estima el retorno. El espacio de acciones corresponde a las 14 articulaciones del robot bípedo LINK-01, con la postura nominal acotada a ±0,18 rad. El entrenamiento se realizó desde cero, sin fases previas de imitación ni recompensas densas descritas en la información disponible.

Los hiperparámetros declarados son los habituales de PPO: tasa de aprendizaje 0,0003 y recorte de política (clip) de 0,2, con 500.000 pasos de interacción con el entorno y un tiempo de cómputo de 15,9 minutos. El paquete incluye un fichero `vecnormalize.pkl`, lo que indica que se aplicó normalización de observaciones (y probablemente de recompensas) durante el entrenamiento; este fichero es imprescindible para reproducir la inferencia, ya que las observaciones deben normalizarse con las mismas estadísticas. También se exporta `actor.json`, presumiblemente con los pesos de la política para su uso fuera de Stable-Baselines3. No se detalla la composición del dataset (no aplica, al ser RL on-policy) ni si hubo ajuste fino posterior.

## Capacidades

- Locomoción bípeda simulada: genera comandos articulares continuos para que el robot LINK-01 avance en el entorno MuJoCo `Link01Walk-v0`.
- Seguimiento de un comando de velocidad de referencia de 0,18 m/s, aunque la velocidad media alcanzada es de 0,0375 m/s.
- Estabilidad sin caídas en el protocolo evaluado: 0,0 caídas por minuto en 5 episodios de 20 segundos.
- Control continuo multiarticular: 14 acciones simultáneas con postura base acotada.
- Reproducibilidad del pipeline: pesos, normalizador y actor exportado en formatos estándar de Stable-Baselines3.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión, audio ni modo de pensamiento; es un controlador de política, no un modelo generativo.

## Casos de uso

- Docencia y formación en RL: sirve como ejemplo completo y reproducible de un pipeline PPO con MuJoCo, útil en cursos y talleres para mostrar el ciclo entrenamiento-evaluación-exportación con hiperparámetros y métricas concretas.
- Baseline de referencia en investigación de locomoción: permite comparar nuevos algoritmos o recompensas contra una política ya entrenada y con métricas declaradas (distancia, velocidad, caídas) sobre el mismo entorno `Link01Walk-v0`.
- Pruebas de integración de `link01-gym`: al incluir `model.zip`, `vecnormalize.pkl` y `actor.json`, se puede usar para validar que la cadena de carga del entorno, la normalización de observaciones y la inferencia funcionan de extremo a extremo.
- Depuración de simuladores y pipelines de MuJoCo: un agente con comportamiento conocido y estable (0 caídas/min) permite aislar fallos del simulador o de la capa de despliegue antes de entrenar políticas nuevas.
- Punto de partida para ajuste fino: al estar entrenado solo 500.000 pasos, es un candidato razonable para continuar el entrenamiento con recompensas mejoradas o mayor presupuesto de cómputo y medir la mejora respecto a la línea base.
- Demostraciones educativas de exportación de políticas: el fichero `actor.json` facilita mostrar cómo extraer la política de Stable-Baselines3 para integrarla en un runtime propio o en una demo interactiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), tarea de locomoción sobre `Link01Walk-v0`:

| Metrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 0,75 m |
| Velocidad media de avance | 0,0375 m/s |
| Caidas por minuto | 0,0 |

No se han publicado resultados comparativos con otros modelos ni benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del artefacto (0,0 GB en el repositorio) y la naturaleza de la política (observación de 51 dimensiones, 14 acciones), la inferencia es extremadamente ligera y cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con PyTorch sirve para inferencia, y el entrenamiento declarado (15,9 minutos para 500.000 pasos) sugiere que no requiere hardware de gama alta.
- Cabe en GPU consumer: sí, con total seguridad, dado el reducido tamaño de la política; también en CPU.
- Opciones de despliegue: Stable-Baselines3 (carga directa de `model.zip` con `vecnormalize.pkl`), exportación vía `actor.json` a un runtime propio; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes de RL comparables sobre el entorno `Link01Walk-v0` ni referencias a políticas de locomoción alternativas con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Rendimiento muy bajo en términos absolutos: 0,0375 m/s frente al comando de 0,18 m/s, es decir, aproximadamente un 21 % de la velocidad solicitada; no es un controlador apto para aplicaciones reales de locomoción.
- Evaluación limitada: solo 5 episodios de 20 segundos y métricas no verificadas (`verified: false`); la ausencia de caídas en esa muestra no garantiza robustez en condiciones distintas.
- Dependencia del normalizador: sin `vecnormalize.pkl` las observaciones no se normalizan igual que en entrenamiento y el comportamiento de la política puede degradarse.
- Entrenamiento corto (500.000 pasos): es probable que la política esté infraentrenada y que no generalice a comandos de velocidad, perturbaciones o terrenos no vistos.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos; conviene contactar con el autor antes de integrarlo en productos.
- Ámbito restringido: es un agente específico para el entorno `Link01Walk-v0` y el robot LINK-01; no es transferible a otros robots o simuladores sin reentrenamiento.
- Sin información sobre sesgos, alucinación o idiomas: no aplica en el sentido habitual, pero tampoco hay documentación sobre robustez frente a distribuciones de observación fuera de las vistas en entrenamiento.
- Procedencia didáctica: el artefacto proviene de un curso (CONNECT AI LAB), por lo que su madurez y soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artnfull/connectailab-rl-artnfull-v1-link01-walk-ppo
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios del entorno `link01-gym` ni demos.
