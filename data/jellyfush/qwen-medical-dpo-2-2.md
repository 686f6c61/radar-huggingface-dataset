# JellyFush/qwen-medical-dpo-2-2

## Resumen

El modelo `JellyFush/qwen-medical-dpo-2-2` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-4B`, desarrollado por el usuario JellyFush. Se ha entrenado mediante Direct Preference Optimization (DPO), una técnica de alineación que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa explícito, tal como se describe en el artículo "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (arXiv:2305.18290). El objetivo declarado es especializar el modelo en el dominio médico, aunque la documentación pública no detalla el conjunto de datos utilizado ni las tareas específicas abordadas.

El repositorio tiene un tamaño de 0,4 GB y se distribuye en formato `safetensors`, compatible con la librería `transformers`. La ficha técnica oficial es mínima: no se especifican licencia, idiomas soportados, ni métricas de rendimiento. A pesar de su nombre, no se ha publicado ninguna evaluación que confirme su eficacia en tareas médicas, por lo que debe considerarse un modelo experimental. Su relevancia radica en ser un ejemplo de aplicación de DPO sobre una base de 4B parámetros, un tamaño manejable para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B) |
| Parametros totales | no disponible (el modelo base es de 4B, pero el fine-tuning no especifica el número exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-4B`, por lo que hereda su arquitectura base, presumiblemente un transformer decoder-only con atención causal. No se dispone de detalles sobre la configuración exacta (número de capas, dimensiones de atención, etc.) del modelo base en la información proporcionada. El entrenamiento se realizó con DPO, un método que alinea el modelo con preferencias humanas mediante un objetivo de optimización directa sobre pares de respuestas preferidas y rechazadas. Se utilizó la librería TRL (Transformers Reinforcement Learning) en su versión 1.6.0, con Transformers 5.12.1 y PyTorch 2.8.0. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas previas de SFT o RLHF. El entrenamiento se registró en Weights & Biases, pero el enlace no es público.

## Capacidades

- Generación de texto en formato conversacional, como se muestra en el ejemplo de la model card (pregunta sobre viajes en el tiempo).
- Especialización declarada en el dominio médico, aunque no se documentan tareas concretas (diagnóstico, resumen clínico, etc.).
- Soporte de chat multi-turno mediante el pipeline de `transformers` con roles de usuario y asistente.
- No se indica soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües no especificadas; probablemente hereda las del modelo base, pero no hay confirmación.

## Casos de uso

- Asistente de consultas médicas básicas: el modelo podría responder preguntas generales sobre salud, pero sin garantías de precisión ni validación clínica. Adecuado para prototipos de demostración, no para uso real.
- Generación de resúmenes de historiales clínicos: si se entrena con datos adecuados, podría resumir textos médicos, aunque no hay evidencia de ello en la documentación.
- Chatbot educativo para estudiantes de medicina: podría servir como herramienta de práctica conversacional, siempre con supervisión humana.
- Filtrado de información médica en foros: podría clasificar o responder consultas comunes, pero requiere evaluación rigurosa.
- Investigación en alineación de modelos: útil como caso de estudio de DPO aplicado a un dominio específico.
- Fine-tuning adicional: al ser un modelo abierto (formato safetensors), puede servir como punto de partida para ajustes posteriores con otros datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas del dominio médico. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4B parámetros en precisión completa (fp32), requeriría aproximadamente 16 GB de VRAM para inferencia. Con cuantización a 8 bits (si estuviera disponible) bajaría a ~8 GB, y a 4 bits a ~4 GB. Sin embargo, no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 serían adecuadas para fp32. Para cuantización, una RTX 3060 de 12 GB podría ser suficiente.
- En consumer GPU: sí, cabe en GPUs de gama alta (16 GB o más) en fp32, y en gamas medias si se cuantiza manualmente.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede servir con vLLM, TGI o directamente con el pipeline de Hugging Face. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona esa conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Existen otros fine-tunings médicos de Qwen (por ejemplo, `DiaaEssam/Qwen2.5-3B-Medical-Fine-Tuning-SFT-DPO-GRPO`), pero no se pueden comparar sin datos de rendimiento. La comparativa queda pendiente de futuras evaluaciones.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tuning sin evaluación publicada, existe un alto riesgo de generar información médica incorrecta o inventada. No debe usarse en contextos clínicos reales.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; probablemente hereda la del modelo base, pero no está confirmado.
- Idiomas: no se especifican, lo que limita su uso en entornos multilingües.
- Licencia: la model card indica "licence: license" sin detallar los términos. No se puede asumir que sea de uso comercial libre.
- Documentación insuficiente: no hay información sobre el dataset de entrenamiento, lo que impide evaluar su sesgo o cobertura.
- Riesgo de producción: no recomendado para despliegues productivos sin una validación exhaustiva.

## Enlaces

- [HuggingFace - JellyFush/qwen-medical-dpo-2-2](https://huggingface.co/JellyFush/qwen-medical-dpo-2-2)
- [Paper DPO (arXiv:2305.18290)](https://huggingface.co/papers/2305.18290)
- [Repositorio TRL](https://github.com/huggingface/trl)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
