# Liukaikai/RoboEvo2

## Resumen

RoboEvo2 es un modelo de visión-lenguaje-acción (VLA) para robótica desarrollado por el usuario Liukaikai y publicado en Hugging Face bajo acceso restringido. El modelo se construye sobre la base de pi0.5 (una política robótica de tipo flow-matching derivada de la familia Gemma) y añade un pipeline de ajuste mediante PPO, lo que sugiere un entrenamiento en dos fases: preentrenamiento sobre pi0.5 y refinamiento con aprendizaje por refuerzo. Está etiquetado con los benchmarks libero y libero-pro, dos suites estándar de manipulación robótica en simulación.

El modelo cuenta con 3.353.433.872 parámetros (aproximadamente 3,35 mil millones) en formato safetensors, con un repositorio de 69,4 GB. La arquitectura combina un codificador visual, un backbone de lenguaje (heredado de Gemma vía pi0.5) y un cabezal de acciones que produce comandos motores de forma autorregresiva o por flow matching, siguiendo el paradigma VLA dominante.

Su relevancia actual radica en la aplicación de RL (PPO) sobre un modelo VLA preentrenado, una línea de trabajo que busca mejorar la robustez de las políticas robóticas más allá del aprendizaje por imitación. Sin embargo, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento en la ficha proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0.5 (Gemma) con ajuste PPO |
| Parametros totales | 3.353.433.872 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (upstream-pi05-gemma), acceso restringido (gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma VLA: un codificador de imágenes procesa la observación visual del robot, un backbone de lenguaje (derivado de Gemma a través de pi0.5) integra la instrucción en lenguaje natural y el estado visual, y un cabezal de acciones genera comandos motores. El sufijo "pi0.5" en los tags indica que el modelo parte de la política pi0.5, que emplea flow matching para la generación de trayectorias de acción continuas.

El tag "ppo" señala que el modelo ha sido refinado mediante Proximal Policy Optimization, un algoritmo de aprendizaje por refuerzo. Esto implica un pipeline de entrenamiento en dos etapas: primero un preentrenamiento supervisado sobre datos de demostración (probablemente los datasets de libero y libero-pro), y después un ajuste con recompensas en entornos simulados. No se dispone de información sobre el número de tokens, la composición del dataset ni los detalles del reward model en la información proporcionada.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural (manipulación de objetos).
- Percepción visual integrada mediante codificador de imágenes.
- Comprensión de instrucciones en lenguaje natural para guiar la política de control.
- Ejecución de tareas de manipulación en los entornos de simulación libero y libero-pro.
- Refinamiento mediante RL (PPO), orientado a mejorar la robustez de la política más allá de la imitación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: visión sí (entrada); audio y modo thinking, no disponible.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede ejecutar tareas de pick-and-place y ensamblaje en los entornos libero y libero-pro, sirviendo como política de referencia para experimentos de investigación.
- Investigación en aprendizaje por refuerzo aplicado a VLA: el ajuste PPO permite estudiar cómo el RL mejora políticas preentrenadas por imitación, comparando el rendimiento antes y después del refinamiento.
- Benchmarking de políticas robóticas: al estar entrenado sobre libero y libero-pro, es útil como baseline para comparar nuevas arquitecturas VLA en las mismas suites.
- Prototipado de control visual-motor: el codificador visual y el cabezal de acciones permiten integrar el modelo en pipelines de simulación (p. ej., MuJoCo, Isaac Sim) para evaluar políticas antes de transferirlas a hardware.
- Generación de trayectorias condicionadas por lenguaje: útil en entornos donde se requiere que un operador humano especifique la tarea en lenguaje natural y el robot la ejecute.
- Estudio de transferencia sim-to-real: aunque no se documenta, el modelo puede servir como punto de partida para experimentos de fine-tuning sobre datos reales, dado su tamaño moderado (3,35 mil millones de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,35 mil millones de parámetros en fp16 se requieren aproximadamente 6,7 GB solo para pesos; en fp32, unos 13,4 GB. El repositorio completo ocupa 69,4 GB, lo que sugiere que incluye múltiples checkpoints o estados del entrenador.
- GPU recomendadas: para inferencia en fp16, una RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Para entrenamiento o fine-tuning con PPO, se recomienda A100 80 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) para inferencia en fp16; en cuantización de 8 bits cabría en GPUs de 12-16 GB, aunque no se documentan formatos de cuantización.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al ser un modelo VLA, el despliegue típico sería mediante scripts de PyTorch personalizados).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entorno | Licencia | Acceso |
|---|---|---|---|---|---|
| RoboEvo2 | 3,35 B | no disponible | libero, libero-pro | other (gated) | Restringido |
| pi0.5 (base) | no disponible | no disponible | libero | no disponible | no disponible |
| OpenVLA | ~7 B | no disponible | libero, otros | MIT (según versión) | Abierto |
| RT-2 | no disponible | no disponible | no disponible | propietaria | Cerrado |

La comparación con pi0.5 es directa por herencia arquitectónica; con OpenVLA y RT-2 es aproximada, ya que no se dispone de datos de rendimiento de RoboEvo2 para contrastar.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato y su reproducibilidad.
- Licencia "other" con upstream pi0.5/Gemma: las restricciones comerciales no están claras y dependen de los términos de la licencia original de Gemma y pi0.5; es imprescindible revisarlas antes de cualquier uso en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que permita validar las afirmaciones sobre el ajuste PPO.
- Idiomas no documentados: se desconoce si el modelo comprende instrucciones en castellano u otros idiomas distintos del inglés.
- Riesgo de alucinación en instrucciones: como modelo de lenguaje subyacente, puede generar interpretaciones erróneas de comandos ambiguos, con consecuencias físicas en un robot real.
- Entrenado en simulación (libero/libero-pro): la transferencia a entornos reales no está garantizada y puede requerir fine-tuning adicional.
- Sesgos: no documentados; los datasets de robótica suelen estar sesgados hacia objetos, colores y configuraciones específicas de laboratorio.
- Repositorio de 69,4 GB: el almacenamiento y la descarga son costosos, lo que puede dificultar su uso en entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Liukaikai/RoboEvo2
- Paper (referencia en tags): arXiv:2611.34675 (no verificado en la información disponible)
- Repositorio de pi0.5: no disponible en la información proporcionada
- Documentación de libero: no disponible en la información proporcionada
