# RuFlect/RoboTwin-IF-InternW0-Delta-LDS

## Resumen

RoboTwin-IF-InternW0-Delta-LDS es un checkpoint de política robótica (visuomotor policy) derivado por fine-tuning del modelo base InternRobotics/InternW0-Delta-RoboTwin, publicado por el usuario RuFlect. Se trata de un ajuste fino orientado a la evaluación RoboTwin-IF Mixed 50, en el paso de entrenamiento 4396, que incorpora supervisión auxiliar mediante cabezas LDS (Linear Decodability Supervision) utilizadas exclusivamente durante el entrenamiento. El artefacto distribuido contiene únicamente los parámetros de inferencia, no las cabezas auxiliares.

El modelo se enmarca en la familia InternW0, una arquitectura de política robótica que reutiliza los pesos congelados del modelo generativo de vídeo Wan2.2-TI2V-5B (5B parámetros) como backbone de representación visual, sobre el que se acoplan canales de acción. La salida ejecutada es una acción de articulación absoluta de 14 dimensiones (joint14) mapeada desde los canales canónicos del modelo. El repositorio ocupa 12,4 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada y experimental: es un checkpoint de evaluación con cero descargas y cero likes en el momento de la consulta, pensado para reproducir resultados en el benchmark RoboTwin-IF mediante un adaptador de política personalizado. No es un modelo de propósito general ni un asistente conversacional; es un componente de un pipeline de investigación en manipulación robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visuomotora basada en backbone generativo de vídeo Wan2.2-TI2V-5B (pesos congelados) con canales de acción; detalles internos no disponibles |
| Parámetros totales | No disponible (el backbone Wan2.2-TI2V-5B declara 5B; el total del policy no se especifica) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, sin interfaz de lenguaje declarada) |
| Licencia | Apache 2.0 |
| Formato de pesos | `policy.pt` (PyTorch) |
| Checkpoint | Paso 4396, evaluación RoboTwin-IF Mixed 50 |
| Dimensión de acción | 14 articulaciones absolutas (joint14) |
| Assets externos | `dataset_stats.json` y pesos congelados Wan2.2-TI2V-5B (Wan-AI/Wan2.2-TI2V-5B) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del policy más allá de su dependencia del backbone Wan2.2-TI2V-5B, un modelo generativo de vídeo texto-imagen-a-vídeo de 5B parámetros cuyos pesos se cargan congelados durante la inferencia. Sobre esa base se acoplan canales de acción que producen una salida de 14 articulaciones absolutas, mapeada desde los canales canónicos del modelo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; en robótica estos métodos rara vez aplican y no se mencionan.

La innovación técnica declarada es la supervisión LDS (Linear Decodability Supervision), aplicada mediante cabezas auxiliares durante el entrenamiento para fomentar la linealidad decodificable de las representaciones internas. Estas cabezas no forman parte del checkpoint publicado, que contiene solo los parámetros de inferencia. El ajuste fino parte del modelo InternW0-Delta-RoboTwin y se orienta específicamente al conjunto de evaluación RoboTwin-IF Mixed 50.

## Capacidades

- Generación de acciones robóticas de manipulación: produce comandos de 14 articulaciones absolutas a partir de observaciones visuales y estado del robot.
- Control visuomotor en entornos simulados RoboTwin: diseñado para la suite de evaluación RoboTwin-IF Mixed 50.
- Integración con runtime upstream: se carga mediante la implementación de InternRobotics/InternW0 con el runtime de InternW0-Delta RoboTwin.
- Soporte de adaptador de política personalizado en el evaluador RoboTwin-IF.
- No se declaran capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes conversacionales, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no aplica a la interfaz del modelo).

## Casos de uso

- Reproducción de resultados en RoboTwin-IF Mixed 50: cargar `policy.pt` en el runtime de InternW0-Delta y ejecutar el evaluador RoboTwin-IF con el adaptador de política para verificar las métricas del paso 4396.
- Investigación en supervisión de representaciones: comparar este checkpoint (entrenado con cabezas LDS) frente al modelo base InternW0-Delta-RoboTwin para analizar el efecto de la linealidad decodificable en el rendimiento de la política.
- Benchmarking de políticas visuomotoras: usar el checkpoint como línea base en experimentos que comparen arquitecturas sobre el mismo conjunto de tareas de manipulación.
- Desarrollo de adaptadores de política: servir como referencia para implementar el adaptador personalizado que exige el evaluador RoboTwin-IF.
- Estudio de transferencia desde backbones generativos de vídeo: analizar cómo los pesos congelados de Wan2.2-TI2V-5B condicionan el aprendizaje de acciones de 14 articulaciones.
- Validación de pipelines de simulación a realidad: emplear las trayectorias generadas en simulación como punto de partida para experimentos de transferencia, dado que el modelo opera sobre acciones articulares absolutas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el checkpoint se utiliza para la evaluación RoboTwin-IF Mixed 50 en el paso 4396, sin reportar métricas numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 12,4 GB en `policy.pt`; a ello se suman los pesos congelados de Wan2.2-TI2V-5B (5B parámetros), por lo que la inferencia requiere cargar ambos conjuntos en memoria.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del backbone (5B parámetros más el policy), se requiere una GPU con memoria suficiente para ambos modelos; no se confirma compatibilidad con GPUs de consumo.
- GPU de consumo: no confirmado. No se indica que quepa en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: carga de `policy.pt` mediante la implementación upstream InternRobotics/InternW0 y el runtime de InternW0-Delta RoboTwin; evaluador RoboTwin-IF con adaptador personalizado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTwin-IF-InternW0-Delta-LDS (este) | No disponible (backbone 5B) | No disponible | Sin métricas publicadas | Apache 2.0 | Hugging Face, 0 descargas |
| InternRobotics/InternW0-Delta-RoboTwin (base) | No disponible (backbone 5B) | No disponible | No disponible | No disponible en la información | Hugging Face (modelo base) |
| Wan-AI/Wan2.2-TI2V-5B (backbone) | 5B | No disponible | No disponible | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: solo produce acciones de 14 articulaciones en el dominio RoboTwin; no es utilizable como modelo de propósito general.
- Checkpoint de evaluación: corresponde a un paso concreto (4396) de un ajuste fino, sin garantías de robustez fuera del conjunto RoboTwin-IF Mixed 50.
- Sin métricas publicadas: no hay evidencia numérica de rendimiento en la información disponible.
- Dependencia de assets externos: requiere `dataset_stats.json` y los pesos congelados de Wan-AI/Wan2.2-TI2V-5B, lo que añade complejidad de despliegue y posibles incompatibilidades de versión.
- Cabezas LDS ausentes: el checkpoint no incluye las cabezas auxiliares de entrenamiento, por lo que no es posible reentrenar ni inspeccionar el mecanismo LDS a partir de este artefacto.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras en entornos físicos; no debe desplegarse en robots reales sin validación exhaustiva.
- Sesgos: no documentados; los sesgos del dataset de entrenamiento (no especificado) pueden propagarse a las políticas aprendidas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el backbone Wan2.2 pueden tener condiciones adicionales no detalladas en esta ficha; conviene verificar sus licencias respectivas.
- Madurez: cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RuFlect/RoboTwin-IF-InternW0-Delta-LDS
- Modelo base: https://huggingface.co/InternRobotics/InternW0-Delta-RoboTwin
- Implementación upstream InternW0: https://github.com/InternRobotics/InternW0
- Evaluador RoboTwin-IF: https://github.com/RuFlect-Intelligence/RoboTwin-IF
- Backbone Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
