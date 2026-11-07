# leegoheun/connectailab-rl-duking-v2-link01-walk-ppo

## Resumen

`connectailab-rl-duking-v2-link01-walk-ppo` es una política de control entrenada con aprendizaje por refuerzo (PPO) para la locomoción bípeda del robot simulado LINK-01 dentro del entorno `Link01Walk-v0`, construido sobre MuJoCo y el paquete `link01-gym`. Lo desarrolla leegoheun (Lee Goheun) en el marco del laboratorio CONNECT AI LAB, con el objetivo declarado de servir de base para sistemas de robots de patrulla interior entrenados en simulación y desplegados en gemelos digitales web (Three.js) o exportados a ONNX.

No es un modelo de lenguaje ni un modelo generativo multimodal: es un artefacto de reinforcement learning empaquetado con Stable-Baselines3, compuesto por `model.zip` (pesos de la política), `vecnormalize.pkl` (estadísticas de normalización de observaciones y recompensas) y `actor.json` (representación exportable del actor). Su relevancia es acotada: se trata de un ejemplo didáctico y reproducible de entrenamiento PPO desde cero para un robot de 14 articulaciones, con métricas declaradas por el autor pero no verificadas.

El modelo se entrenó durante 3.000.000 de pasos en 12,86 minutos con 16 entornos paralelos, y reporta una velocidad media de 0,2751 m/s y cero caídas por minuto en la prueba declarada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se especifica licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con PPO (Stable-Baselines3); topología de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantización | no disponible (artefacto RL; se menciona exportación a ONNX en la model card, sin detalles de cuantización) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl`, `actor.json`; exportación a ONNX mencionada como flujo de trabajo, no incluida en el repo |
| Entorno de entrenamiento | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Observaciones / acciones | 51 / 14 (14 articulaciones, postura base ±0,18 rad) |
| Framework | Stable-Baselines3 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El artefacto es una política PPO entrenada desde cero sobre el entorno `Link01Walk-v0`, definido en `link01-gym` y simulado con MuJoCo. El espacio de observación tiene 51 dimensiones y el de acción 14 dimensiones continuas, correspondientes a las 14 articulaciones del robot bípedo LINK-01, con una postura base de ±0,18 rad. No se detalla en la información disponible la topología de la red (número de capas, unidades por capa, funciones de activación) ni si se emplearon técnicas auxiliares como recompensas de estilo, curriculum o domain randomization.

Los hiperparámetros de entrenamiento declarados son: 3.000.000 de pasos, 12,86 minutos de tiempo total, learning rate 0,0003, gamma 0,99, GAE lambda 0,95, clip range 0,2, 16 entornos paralelos, `n_steps` 1024 y `batch_size` 256. El pipeline incluye normalización de observaciones y recompensas mediante `VecNormalize`, cuyas estadísticas se guardan en `vecnormalize.pkl` y deben cargarse junto con la política en inferencia para reproducir el comportamiento. No se indica en la información disponible el número ni la composición de los datos de entrenamiento (al tratarse de RL, la señal procede de la recompensa del entorno, no de un corpus).

## Capacidades

- Locomoción bípeda hacia delante en el entorno simulado `Link01Walk-v0`, con seguimiento de una consigna de velocidad de 0,18 m/s.
- Control continuo de 14 articulaciones a partir de observaciones de 51 dimensiones.
- Estabilidad declarada: 0 caídas por minuto en la prueba de 5 episodios de 20 segundos.
- Exportación del actor a JSON (`actor.json`) y flujo previsto de conversión a ONNX para despliegue en aplicaciones web.
- Integración con el ecosistema Stable-Baselines3: carga mediante `PPO.load` y uso conjunto con `VecNormalize.load`.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento, por su naturaleza de política de control.

## Casos de uso

- Investigación en locomoción bípeda simulada: sirve como línea base reproducible de PPO sobre `Link01Walk-v0` para comparar variantes de recompensa, hiperparámetros o arquitecturas de política.
- Docencia y formación en RL: el entrenamiento completo cabe en menos de 13 minutos con 16 entornos, lo que permite usarlo en talleres prácticos (la model card lo vincula a la lección 7 de un curso de RL de AI CITY BUILDERS).
- Prototipado de robots de patrulla interior: la model card describe el objetivo de encadenar este tipo de política con un gemelo digital en Three.js para supervisar el robot desde el navegador.
- Pruebas de pipeline de simulación a despliegue: el flujo `model.zip` → `actor.json` → ONNX permite validar la cadena de exportación e integración con un motor web antes de invertir en políticas más complejas.
- Evaluación de estabilidad en escenarios de baja velocidad: con 0 caídas por minuto a 0,2751 m/s, es adecuado para experimentos donde prima la robustez sobre la velocidad.
- Base para experimentos de transferencia sim-to-real a pequeña escala: aunque no se documenta ningún resultado de transferencia, el formato de exportación y el uso de MuJoCo lo hacen utilizable como punto de partida en laboratorios con robots de 14 actuadores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre `Link01Walk-v0`, con consigna de 0,18 m/s, 5 episodios de 20 segundos:

| Métrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 5,502 m |
| Velocidad media de avance | 0,2751 m/s |
| Caídas por minuto | 0,0 |
| Pasos de entrenamiento | 3.000.000 |
| Tiempo de entrenamiento | 12,86 min |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, por no ser aplicables a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la política es de dimensiones reducidas (observación 51, acción 14), por lo que cabe holgadamente en cualquier GPU consumer, aunque no se publica el número de parámetros.
- GPU recomendadas: cualquier GPU compatible con PyTorch es suficiente para inferencia; para reentrenar con 16 entornos paralelos conviene una GPU de gama media o superior (no se especifica el hardware usado en el entrenamiento original).
- Compatibilidad con GPU consumer: sí, previsiblemente en cualquier RTX o equivalente; no se aportan cifras de latencia ni de throughput.
- Opciones de despliegue: carga nativa con Stable-Baselines3 (`PPO.load` + `VecNormalize.load`); exportación a ONNX mencionada en la model card para integración web; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros artefactos de RL comparables sobre el mismo entorno ni métricas de política alternativas (por ejemplo, SAC, TD3 o PPO con otras configuraciones) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Las métricas de rendimiento están declaradas por el autor y marcadas como no verificadas; no han pasado por una evaluación independiente.
- El alcance es muy estrecho: una única tarea (caminar hacia delante) en un único entorno simulado (`Link01Walk-v0`); no hay evidencia de generalización a terrenos, velocidades o comandos distintos.
- No se documenta transferencia sim-to-real; el comportamiento en un robot físico LINK-01 es desconocido.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- El modelo depende de `vecnormalize.pkl`: cargar la política sin las estadísticas de normalización altera las observaciones y degrada el comportamiento.
- No se especifican sesgos, riesgos de alucinación ni limitaciones idiomáticas por no ser un modelo de lenguaje; los riesgos relevantes son de seguridad física si se despliega en hardware real sin validación previa.
- El repositorio no incluye el entorno `link01-gym` ni instrucciones detalladas de reproducción más allá de los hiperparámetros listados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01-walk-ppo
- Repositorio de archivos: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01-walk-ppo/tree/main
- Modelo relacionado (v2-link01): https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01
- Archivos del modelo relacionado: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01/tree/main
