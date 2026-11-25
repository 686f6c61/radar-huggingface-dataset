# junshim/When2Think-1.5B

## Resumen

When2Think-1.5B es un modelo de razonamiento híbrido post-entrenado por el autor junshim, construido a partir de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Su propuesta central es que el modelo aprenda dos decisiones acopladas: si debe razonar de forma explícita (THINK) o responder directamente (NOTHINK), y cuánta computación asignar cuando decide razonar. Frente a métodos de compresión uniforme de longitud, trata la profundidad de razonamiento como un recurso adaptativo a cada instancia.

La arquitectura subyacente es la del Qwen2 base (transformer causal denso) heredada del checkpoint de DeepSeek, con 1.777.088.000 parámetros totales en safetensors. El post-entrenamiento combina RLVR sobre el dataset DeepScaleR-Preview, control de dificultad a nivel de instancia (IDAC) y estandarización por lote (BWS) para optimización de política sin crítico.

Es relevante para investigación en razonamiento eficiente: el checkpoint se despliega de forma autónoma como un modelo causal estándar, sin router, verificador, estimador de dificultad ni política de referencia en inferencia. Está publicado bajo licencia MIT, solo en inglés y orientado a problemas matemáticos y análisis de selección de modo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen2) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors; compatible con cuantización estándar vía herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint DeepSeek-R1-Distill-Qwen-1.5B, un transformer causal denso de la familia Qwen2 con aproximadamente 1.780 millones de parámetros. Sobre esa base se aplica un post-entrenamiento con RLVR (reinforcement learning with verifiable rewards) usando el dataset `agentica-org/DeepScaleR-Preview-Dataset`, orientado a problemas matemáticos con recompensa verificable.

El marco de post-entrenamiento introduce tres componentes en tiempo de entrenamiento. Instance-level Difficulty-Aware Control (IDAC) usa estadísticas cacheadas de éxito de referencia y coste en tokens para modular un bonus de eficiencia condicionado a la corrección, en función del número de tokens generados. Batch-Wise Standardization (BWS) convierte las recompensas de trayectoria en ventajas estandarizadas para optimización de política sin crítico. La exploración THINK/NOTHINK con muestreo por importancia equilibra la exploración de ambos modos durante el entrenamiento; esa política auxiliar se elimina en inferencia. El resultado es un único checkpoint que decide modo y profundidad sin componentes externos.

## Capacidades

- Generación de texto conversacional con formato de chat (roles system/user).
- Razonamiento matemático con trazas explícitas de varios pasos cuando se selecciona el modo THINK.
- Respuesta directa sin traza extendida cuando se selecciona el modo NOTHINK.
- Selección adaptativa del modo de razonamiento aprendida, sin router externo.
- Control adaptativo de la profundidad de razonamiento dentro del modo THINK.
- Punto de partida para post-entrenamiento continuado en tareas de razonamiento verificable.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Resolución de ecuaciones y problemas matemáticos: el modelo genera la traza completa cuando la instancia lo requiere, útil para tutoría automatizada que muestre pasos intermedios verificables.
- Enrutamiento interno de coste en producción: al decidir por sí mismo entre respuesta directa y razonamiento extendido, reduce tokens generados en consultas fáciles sin sacrificar precisión en las difíciles.
- Investigación en razonamiento eficiente: sirve como referencia reproducible para estudiar políticas adaptativas de profundidad frente a compresión uniforme de longitud.
- Análisis de selección de modo: permite instrumentar y medir cuándo el modelo elige THINK frente a NOTHINK sobre conjuntos de problemas etiquetados por dificultad.
- Base para post-entrenamiento en dominios verificables: punto de partida para adaptar el comportamiento a código, símbolos o ciencia mediante RLVR adicional.
- Evaluación comparativa de checkpoints: junto con When2Think-ThinkOnly-1.5B, permite comparar puntos operativos de precisión-computación dentro de la misma familia.
- Prototipado en entornos con recursos limitados: con 1.500 millones de parámetros encaja en GPUs de consumo para experimentación rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB para pesos.
- GPU profesionales: A100, H100 y L40S sobradas para servir múltiples instancias.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 e incluso en tarjetas de 8 GB con cuantización de 4 bits.
- Despliegue: transformers (pipeline de text-generation), vLLM para serving rápido y text-generation-inference; llama.cpp y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento adaptativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| When2Think-1.5B | 1.777 M | no disponible | THINK/NOTHINK aprendido + profundidad adaptativa | MIT | Hugging Face |
| When2Think-ThinkOnly-1.5B | 1.500 M (clase) | no disponible | Siempre THINK con control de profundidad | MIT | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.500 M (clase) | no disponible | Razonamiento explícito sin selección de modo | MIT | Hugging Face |

## Limitaciones y advertencias

- Entrenado y evaluado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Especializado en razonamiento matemático y verifiable; puede degradar en tareas abiertas de conocimiento general.
- Riesgo de alucinación inherente a los modelos destilados de R1, especialmente en el modo NOTHINK al responder sin traza.
- La selección THINK/NOTHINK es aprendida y puede errar: responder directamente en problemas que requerían razonamiento o razonar de más en casos triviales.
- El ajuste fino adicional puede alterar el equilibrio aprendido, la longitud de respuesta y el comportamiento de profundidad.
- No se documentan sesgos específicos ni evaluación de seguridad en la información disponible.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek y del dataset DeepScaleR.
- La longitud de contexto no está declarada; no asumir la ventana del Qwen2 original sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junshim/When2Think-1.5B
- Checkpoint ThinkOnly: https://huggingface.co/junshim/When2Think-ThinkOnly-1.5B
- Paper: https://arxiv.org/abs/2609.19671
- Repositorio: https://github.com/JJunShim/When2Think
- Colección: https://huggingface.co/collections/junshim/when2think
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
