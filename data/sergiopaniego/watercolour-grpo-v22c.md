# sergiopaniego/watercolour-grpo-v22c

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v22c` es un ajuste fino del modelo base `Qwen/Qwen3.5-35B-A3B`, desarrollado por Sergio Paniego, ingeniero de machine learning en Hugging Face. Se trata de un experimento de entrenamiento con refuerzo mediante la técnica GRPO (Group Relative Policy Optimization), introducida en el artículo DeepSeekMath. El nombre "watercolour" sugiere una posible aplicación en generación de acuarelas o arte, aunque el ejemplo de uso incluido en la model card es una pregunta filosófica sobre viajes en el tiempo, lo que indica que la tarea concreta no está claramente documentada.

El modelo base es un transformer de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones activos, con una ventana de contexto de 128 mil tokens. El repositorio tiene un tamaño de solo 0,3 GB, lo que sugiere que el ajuste fino se ha realizado mediante un adaptador (por ejemplo, LoRA) o una versión cuantizada, aunque no se especifica explícitamente. La relevancia de este modelo radica en ser un caso práctico de aplicación de GRPO sobre un modelo de última generación, y puede servir como referencia para quienes experimentan con optimización por refuerzo en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) heredada del modelo base Qwen3.5-35B-A3B |
| Parametros totales | 35 mil millones (heredados del modelo base) |
| Parametros activos | 3 mil millones (heredados del modelo base) |
| Longitud de contexto | 128 mil tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente hereda los del modelo base, que incluye español, inglés, chino, entre otros) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (según los tags) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `Qwen/Qwen3.5-35B-A3B`, que emplea una arquitectura transformer con mezcla de expertos. El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) versión 1.12.0, utilizando el algoritmo GRPO. Este método, descrito en el artículo DeepSeekMath, optimiza la política del modelo mediante la comparación de respuestas dentro de un grupo, sin necesidad de un modelo crítico separado. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni la composición de los datos. El tamaño reducido del repositorio (0,3 GB) sugiere que el ajuste se realizó mediante un adaptador de bajo rango (LoRA) o una técnica similar, aunque esto no está confirmado en la documentación disponible.

## Capacidades

- Generación de texto: el modelo puede producir respuestas coherentes en formato conversacional, como se muestra en el ejemplo de la model card.
- Razonamiento: al estar basado en Qwen3.5-35B-A3B, hereda capacidades de razonamiento lógico y matemático, aunque el efecto del entrenamiento con GRPO no está documentado.
- Soporte multilingüe: probablemente hereda las capacidades multilingües del modelo base, pero no se confirma en la información proporcionada.
- Tool calling y funciones de agente: no se mencionan en la documentación, aunque el modelo base las soporta; no hay evidencia de que el ajuste las conserve o mejore.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

Dado que la información disponible es limitada, los casos de uso son hipotéticos y basados en las características del modelo base:

- Experimentación con GRPO: el modelo sirve como referencia para investigar cómo el entrenamiento con refuerzo afecta a un modelo MoE de gran escala, permitiendo reproducir y comparar resultados.
- Generación de texto creativo: gracias a su capacidad de generar respuestas coherentes, podría emplearse en aplicaciones de escritura asistida o narración interactiva, aunque no hay evidencia de un entrenamiento específico en ese dominio.
- Chatbots y asistentes conversacionales: el ejemplo de uso muestra un formato de diálogo, por lo que podría integrarse en sistemas de atención al cliente o asistentes virtuales, siempre que se valide su calidad con evaluaciones adicionales.
- Investigación académica: como caso práctico de fine-tuning con GRPO, puede utilizarse en estudios sobre optimización de políticas en modelos de lenguaje.
- Evaluación comparativa de adaptadores: al ser un ajuste de bajo costo (por el tamaño del repositorio), puede servir para comparar el rendimiento de adaptadores LoRA frente a ajustes completos en tareas específicas.
- Prototipado rápido: dado su pequeño tamaño de repositorio, es fácil de descargar y probar en entornos de desarrollo para validar hipótesis antes de escalar a modelos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al tratarse de un adaptador sobre un modelo MoE de 35B, los requisitos de inferencia son los del modelo base Qwen3.5-35B-A3B.
- VRAM estimada: en precisión fp16, el modelo base requiere aproximadamente 70 GB de VRAM; con cuantización de 4 bits puede reducirse a unos 20 GB, pero no hay confirmación de que el adaptador sea compatible con todas las cuantizaciones.
- GPU recomendadas: para una inferencia fluida se necesitaría una A100 (80 GB), H100 (80 GB) o varias GPU consumer como RTX 4090 (24 GB) con cuantización y offloading.
- En GPU consumer: es posible ejecutarlo en una RTX 4090 o similar si se usa cuantización de 4 bits y se carga el adaptador sobre el modelo base, aunque la velocidad será limitada.
- Opciones de despliegue: dado que usa la librería transformers, es compatible con vLLM, TGI y llama.cpp (si se convierten los pesos a GGUF), aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no se han publicado datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos de este experimento. La comparación más directa sería con el propio modelo base Qwen3.5-35B-A3B, del cual hereda la arquitectura y los parámetros. Otros modelos MoE de tamaño similar (como Mixtral 8x7B o DeepSeek-V2-Lite) podrían servir de referencia, pero no se han realizado evaluaciones comparativas documentadas.

## Limitaciones y advertencias

- Falta de documentación: no se especifica la tarea concreta, el dataset de entrenamiento ni los hiperparámetros, lo que dificulta la reproducibilidad.
- Licencia no definida: la model card indica "licence: license", lo que es ambiguo y podría impedir su uso comercial sin aclaración.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Sesgos del modelo base: al heredar los pesos de Qwen3.5, el modelo puede heredar sesgos presentes en los datos de preentrenamiento.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede garantizar su calidad en producción.
- Tamaño reducido del repositorio: sugiere que se trata de un adaptador, pero no se confirma la técnica exacta; si se usara como modelo completo, no funcionaría sin el modelo base.
- Fecha de creación futura (2026-08-31): el modelo está fechado en el futuro, lo que podría indicar un error en los metadatos o un proyecto en desarrollo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sergiopaniego/watercolour-grpo-v22c)
- [Espacio asociado en Hugging Face](https://huggingface.co/spaces/sergiopaniego/watercolour-grpo-v2)
- [Versión anterior v21c](https://huggingface.co/sergiopaniego/watercolour-grpo-v21c/tree/main)
- [Sitio web del autor](https://sergiopaniego.github.io/)
- [Perfil de GitHub del autor](https://github.com/sergiopaniego)
- [Artículo DeepSeekMath (GRPO)](https://huggingface.co/papers/2402.03300)
