# lucaskim72/connectailab-rl-lucasbrain-v5-lunarlander

## Resumen

`connectailab-rl-lucasbrain-v5-lunarlander` es un agente de aprendizaje por refuerzo profundo (deep RL) entrenado para resolver el entorno `LunarLander-v3` de Gymnasium. No es un modelo de lenguaje: es una red neuronal de política (Q-network) que recibe un vector de estado de 8 dimensiones numéricas (posición x e y, velocidades x e y, inclinación, velocidad angular y contacto de cada una de las dos patas) y emite una de cuatro acciones discretas (no hacer nada, motor izquierdo, motor central, motor derecho). Lo publica el autor independiente Lucas Kim bajo el paraguas divulgativo de CONNECT AI LAB × AI CITY BUILDERS, como quinta iteración de una serie de experimentos didácticos de RL.

El interés del artefacto es doble. Por un lado, es un ejemplo reproducible y bien documentado de un DQN con las mejoras estándar de la familia (Double DQN, Dueling, Prioritized Experience Replay, n-step returns y soft target updates), con una tabla de ablaciones parciales entre versiones que resulta útil como material de estudio. Por otro lado, su rendimiento es modesto: la media de 260,3 puntos en 10 episodios de validación con semillas fijas supera el umbral de 200 que el propio autor marca como éxito, pero queda por debajo de las versiones v3 (275,5) y v4 (278,6) de la misma serie.

Conviene subrayar que este repositorio no contiene pesos de un transformer, ni tokenizador, ni capacidades de generación de texto, código o visión. Cualquier evaluación debe hacerse en el marco de un entorno de control con observaciones de baja dimensionalidad. El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que es coherente con una red de dos capas ocultas de 256 unidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) con cabeza Dueling: tronco Linear(8→256)+ReLU+Linear(256→256)+ReLU, cabeza de valor Linear(256→1) y cabeza de ventaja Linear(256→4) |
| Parametros totales | No disponible (estimable en el orden de 10^5 a partir de la arquitectura declarada, sin cifra publicada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entorno de un solo paso con observación de 8 dimensiones; sin ventana de contexto) |
| Tipos de cuantizacion | No disponible (pesos en `model.pt` de PyTorch, sin versiones GGUF, ONNX ni cuantizadas publicadas) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (checkpoint de PyTorch con clave `state_dict`) |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa con arquitectura Dueling Q-Network. El tronco compartido transforma el estado de 8 dimensiones en una representación de 256 unidades mediante dos capas lineales con activación ReLU. Sobre esa representación se aplican dos cabezas lineales: una que estima el valor de estado V(s) y otra que estima las ventajas A(s,a) para las cuatro acciones. La salida combina ambas mediante la descomposición estándar Q(s,a) = V(s) + A(s,a) − media_a A(s,a). El entrenamiento emplea Double DQN para reducir el sesgo de sobreestimación, Prioritized Experience Replay (PER) para muestrear transiciones con mayor error de TD, retornos n-step con n = 3 y actualizaciones suaves del target con soft_tau = 0,005. Los hiperparámetros declarados son: 400 000 pasos totales, learning rate 1e-4, gamma 0,99, fracción de exploración 0,5, sin reward shaping y grad_clip 10,0.

El entorno es `LunarLander-v3` de Gymnasium, con la recompensa original del entorno como señal de entrenamiento y de evaluación. No se documenta composición de dataset (no aplica: las transiciones se generan por interacción online con el simulador), ni número de tokens, ni fases de RLHF o DPO. La model card incluye una tabla de ablaciones entre versiones v1 a v5, pero el propio autor advierte que la mayoría de los cambios se aplicaron simultáneamente, de modo que solo la variación de pasos totales entre v4 y v5 está aislada (caída de 18,3 puntos al pasar de 500 000 a 400 000 pasos). El resto de efectos (Double, Dueling, PER, n-step, soft target, tamaño oculto, exploración y learning rate) figuran como "no medidos" de forma individual.

## Capacidades

- Control de política discreta en el entorno `LunarLander-v3`: selecciona una de cuatro acciones a partir de una observación de 8 valores continuos.
- Aprendizaje por refuerzo profundo con DQN, Double DQN, Dueling, PER, n-step returns y soft target updates.
- Inferencia determinista codiciosa (`argmax` sobre los Q-valores) adecuada para evaluación y despliegue en bucle de control.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes basados en LLM; el "razonamiento" se limita a la propagación hacia delante de la Q-network en cada paso del entorno.
- No tiene capacidades multilingües: no procesa lenguaje.
- No dispone de modo "thinking", ni de cabeceras de visión o audio.

## Casos de uso

- Docencia y material de estudio de deep RL: el repositorio sirve como ejemplo mínimo y reproducible de un DQN con las mejoras habituales, con la model card documentando hiperparámetros y resultados de validación por versión, lo que facilita explicar el efecto de Double, Dueling y PER en clase.
- Reproducción de experimentos de ablación: la serie v1–v5 permite a un investigador novel partir de un checkpoint funcional y aislar variables (por ejemplo, pasos totales o learning rate) para medir su impacto con semillas fijas.
- Referencia para comparación de algoritmos: al estar evaluado con las semillas 7000–7009, se puede usar como línea base frente a PPO, A2C o SAC en `LunarLander-v3` bajo el mismo protocolo de validación.
- Prueba de pipelines de RL end-to-end: sirve para validar infraestructura de entrenamiento (replay buffer, target network, logging de recompensas) antes de escalar a entornos más complejos, dado el bajo coste computacional del modelo.
- Demostración en talleres y charlas: el agente se puede cargar con `hf_hub_download` y ejecutar en CPU en milisegundos por paso, lo que permite visualizar el aterrizaje en vivo en una presentación sin necesidad de GPU.
- Integración en entornos de juguete para pruebas de sistemas de control: al ser un controlador de 4 acciones y estado de 8 dimensiones, encaja en tests de integración de simuladores o de frameworks de agentes sin consumir recursos apreciables.

## Benchmarks y rendimiento

Los únicos datos publicados son las medias de recompensa en 10 episodios de validación con semillas fijas (7000 a 7009), obtenidas con la recompensa original de `LunarLander-v3`:

| Version | Cambio principal respecto a la anterior | Media holdout (10 episodios) | Diferencia |
|---|---|---|---|
| v1 | Línea base, DQN del curso | 233,6 | — |
| v2 | Cambio múltiple (pasos, lr, exploración, oculto, n-step, Double, Dueling, PER, soft target) | 260,8 | +27,2 |
| v3 | Pasos 250 000→400 000 y lr 2,5e-4→1,5e-4 | 275,5 | +14,7 |
| v4 | Pasos 400 000→500 000 y lr 1,5e-4→1e-4 | 278,6 | +3,1 |
| v5 (este modelo) | Pasos 500 000→400 000 | 260,3 | −18,3 |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible, ni son aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; la red tiene dos capas ocultas de 256 unidades y una entrada de 8 dimensiones, por lo que los pesos ocupan del orden de unos pocos cientos de kilobytes en FP32.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en cualquier GPU de consumo e incluso en CPU; la inferencia en CPU es viable a tiempo real para el bucle de control de `LunarLander-v3`.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `state_dict`), exportación manual a ONNX o TorchScript; no se han publicado artefactos para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma publicada; por la arquitectura (tres multiplicaciones matriz-vector de tamaño reducido) se espera latencia inferior al milisegundo por paso en CPU moderna.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lucasbrain-v5-lunarlander (este) | DQN Dueling + Double + PER + n-step | No disponible (MLP 8→256→256→cabezas) | No aplica | 260,3 media en 10 episodios (semillas 7000–7009) | No disponible | Hugging Face |
| lucasbrain-v4-lunarlander (misma serie) | DQN Dueling + Double + PER + n-step | No disponible | No aplica | 278,6 media en 10 episodios | No disponible | Referenciado en la model card, sin URL directa |
| lucasbrain-v3-lunarlander (misma serie) | DQN Dueling + Double + PER + n-step | No disponible | No aplica | 275,5 media en 10 episodios | No disponible | Referenciado en la model card, sin URL directa |
| Implementaciones DQN de referencia para LunarLander (por ejemplo, las de Stable-Baselines3 o CleanRL) | DQN estándar | No disponible | No aplica | No disponible en la información proporcionada | MIT / Apache-2.0 en sus repositorios originales | Repositorios públicos de código |

No se dispone de datos comparativos con otros checkpoints publicados en Hugging Face para `LunarLander-v3` en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en `LunarLander-v3`; no generaliza a otros entornos, tareas de control ni dominios.
- La media de 260,3 en 10 episodios es inferior a la de las versiones v3 y v4 de la misma serie, por lo que no es la mejor opción dentro del propio linaje del autor.
- La validación se limita a 10 episodios con semillas fijas (7000–7009); no hay intervalos de confianza ni evaluación con semillas no vistas, lo que limita la fiabilidad estadística de la cifra.
- La model card reconoce que la mayoría de los cambios entre v1 y v2 se aplicaron de forma conjunta, de modo que las atribuciones causales a Double, Dueling, PER, n-step o soft target no están aisladas.
- Riesgo de sobreajuste a la distribución del simulador y a las semillas de evaluación; no se documenta una evaluación exhaustiva con un número amplio de episodios.
- No hay información sobre sesgos: al no operar con datos humanos ni lenguaje, los sesgos sociales típicos de los LLM no aplican, pero sí puede heredar los sesgos del motor físico de Gymnasium.
- Riesgo de alucinación no aplica en el sentido de generación de texto; el riesgo equivalente es una política que falle en estados fuera de distribución.
- Licencia no disponible: no se puede asumir permiso para uso comercial sin consultar al autor.
- No se publican pesos en formatos alternativos (ONNX, TorchScript, GGUF) ni scripts de entrenamiento o evaluación en el repositorio.
- El código de ejemplo de la model card usa identificadores en coreano (`경로`, `묶음`, `두뇌`, `행동`, `상태`), lo que puede requerir adaptación para entornos con codificación restrictiva.
- El checkpoint se carga con `weights_only=False`, lo que implica riesgos de seguridad si el archivo no es de confianza; conviene auditar el `model.pt` antes de cargarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v5-lunarlander
- CONNECT AI LAB (GitHub): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, sección de robótica y RL: https://www.aicitybuilders.com/robot
- Entorno Gymnasium `LunarLander-v3` (documentación oficial): no disponible en la información proporcionada
- Correo de contacto del autor: lucaskim72@gmail.com
