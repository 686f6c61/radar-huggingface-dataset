# QuixoteH/RoboSyn-dp-click-ft

## Resumen
RoboSyn-dp-click-ft es una política robótica basada en Diffusion Policy, desarrollada por QuixoteH (Hai Huang) para el equipo LBWSquare en la competición RoboSynChallenge de NeurIPS 2026. Se trata de un ajuste fino del checkpoint oficial `RoboSynChallenge/DP_sim_click_bell` para la tarea `click_bell`, que consiste en pulsar un timbre. El modelo cuenta con 270.780.964 parámetros y se distribuye en formato safetensors con licencia Apache-2.0. No es un modelo de lenguaje, por lo que no tiene longitud de contexto ni soporte de idiomas en el sentido habitual.

El modelo aborda el problema de la manipulación robótica sim-to-real, entrenándose sobre 1000 episodios de simulación oficiales más 125 demostraciones generadas con un experto de EmbodiChain bajo un dominio aleatorio más fuerte (pose de cámara, iluminación, rangos iniciales de objeto y robot). Su relevancia radica en la competición RoboSynChallenge, que busca evaluar la transferencia de políticas entrenadas en simulación a robots reales. El ajuste se realizó durante 20.000 pasos con learning rate 1e-5 y batch size 32, manteniendo la misma configuración y normalización que el checkpoint base.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (no se detalla la topología interna en la model card) |
| Parametros totales | 270.780.964 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a políticas robóticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repositorio | 1.1 GB |

## Arquitectura y entrenamiento
Diffusion Policy es un método que aprende una distribución de acciones mediante un proceso de difusión, típicamente con una red neuronal que denoisa ruido condicionada por observaciones. En este caso, la arquitectura específica no se detalla más allá de ser una Diffusion Policy. El modelo se inicializa desde `RoboSynChallenge/DP_sim_click_bell` (revisión fb8c9551) y se ajusta durante 20.000 pasos con un learning rate de 1e-5 y batch size de 32. El conjunto de entrenamiento combina 1000 episodios del dataset de simulación oficial con 125 demostraciones adicionales generadas por el experto oficial de EmbodiChain bajo un aumento de la aleatoriedad de dominio (pose de cámara, iluminación y rangos iniciales de objeto y robot). Se mantiene la misma configuración y normalización que el checkpoint base. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, que no son aplicables a este tipo de modelo.

## Capacidades
- Generación de acciones de control para la tarea específica `click_bell` (pulsar un timbre) en un entorno simulado.
- Control robótico basado en observaciones visuales (imágenes) y posiblemente estado del robot, aunque no se especifica la composición exacta de las observaciones.
- Generalización limitada gracias al entrenamiento con domain randomization (variaciones de cámara, iluminación y posiciones iniciales).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- Capacidad especial: integración con la librería lerobot y uso en el marco de RoboSynChallenge.

## Casos de uso
- Investigación en sim-to-real: utilizar el modelo como política de referencia para estudiar la transferencia de simulación a robot real en la tarea `click_bell`, comparando el rendimiento con y sin las 125 demostraciones adicionales.
- Participación en RoboSynChallenge: desplegar esta política en la competición NeurIPS 2026 para la tarea `click_bell`, aprovechando el ajuste fino sobre el checkpoint oficial.
- Benchmarking de Diffusion Policy: emplear el modelo como baseline para evaluar variantes de Diffusion Policy en manipulación robótica, midiendo tasas de éxito en simulación y realidad.
- Desarrollo de sistemas de manipulación: integrar la política en un stack de control robótico (por ejemplo, ROS 2) para ejecutar la acción de pulsar un timbre en un robot físico, previa validación de seguridad.
- Fine-tuning para tareas similares: usar el modelo como punto de partida para ajustar otras tareas de manipulación que impliquen interacciones de contacto, gracias a la infraestructura de lerobot.
- Estudio de domain randomization: analizar el impacto de las variaciones de cámara, iluminación y posiciones iniciales en el rendimiento final, comparando con el modelo base.
- Educación y divulgación: servir como ejemplo práctico de Diffusion Policy aplicada a robótica en cursos o talleres sobre aprendizaje por imitación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible. El repositorio ocupa 1.1 GB en safetensors, lo que sugiere pesos en fp32; la inferencia requeriría al menos esa cantidad más overhead de activaciones.
- GPU recomendadas: no disponible. Dado el tamaño (270M parámetros), es probable que quepa en GPUs de consumo como RTX 3060 o superiores, pero no hay confirmación oficial.
- ¿Cabe en consumer GPU? No confirmado, pero por tamaño es plausible en GPUs con 4 GB o más de VRAM.
- Opciones de despliegue: la librería lerobot (basada en PyTorch). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RoboSyn-dp-click-ft | 270.780.964 | No aplica | Apache-2.0 | HuggingFace |
| RoboSynChallenge/DP_sim_click_bell | no disponible | No aplica | no disponible | HuggingFace |

No se conocen otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- El modelo está especializado en la tarea `click_bell`; no generaliza a otras tareas sin un ajuste fino adicional.
- Entrenado principalmente en simulación, por lo que puede existir una brecha de rendimiento al transferirlo a un robot real (sim-to-real gap).
- No se han publicado métricas de rendimiento, por lo que se desconoce su tasa de éxito real.
- Al no ser un modelo de lenguaje, no aplican sesgos lingüísticos ni riesgo de alucinación en texto.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar que los datos de entrenamiento y componentes de terceros (EmbodiChain, lerobot) no impongan restricciones adicionales.
- La dependencia de la librería lerobot puede limitar la portabilidad a otros frameworks.
- No se especifican los idiomas soportados porque no aplica.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/QuixoteH/RoboSyn-dp-click-ft)
- [Repositorio GitHub de RoboSyn](https://github.com/QuixoteH/RoboSyn)
- [Sitio web de RoboSynChallenge](https://robosyn-bench.net/)
- [Organización RoboSynChallenge en HuggingFace](https://huggingface.co/RoboSynChallenge)
- [Perfil del autor QuixoteH en HuggingFace](https://huggingface.co/QuixoteH)
- [Modelo base DP_sim_click_bell](https://huggingface.co/RoboSynChallenge/DP_sim_click_bell) (referenciado en la model card)
