# rubanikov/qwen3-1.7b-socratic-500adv2

## Resumen

`rubanikov/qwen3-1.7b-socratic-500adv2` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, que instala un comportamiento de tutor socrático: el modelo responde únicamente con preguntas (cada frase termina en `?`) y nunca revela la respuesta a la pregunta subyacente del usuario. Esta versión es la variante endurecida del adaptador `qwen3-1.7b-socratic-500`, añadiendo 250 ejemplos adversariales de defensa para resistir ataques en los que el usuario inyecta la entidad de la respuesta y pide copiar, editar o confirmar el texto.

El problema que resuelve es doble: por un lado, proporciona un comportamiento de interacción socrática utilizable en sistemas educativos; por otro, demuestra cómo un red-teaming externo puede identificar fallos de adherencia en modelos con restricciones de comportamiento y cómo un conjunto de datos de defensa puede mitigarlos sin sacrificar la generalidad. El adaptador está pensado para usarse sobre Qwen3-1.7B con `transformers` y `peft`, sin system prompt adicional, ya que el comportamiento reside en los pesos.

La relevancia actual radica en que es un ejemplo práctico de adaptación de bajo coste (0.1 GB) sobre un modelo abierto de 1.7B parámetros, con una metodología de evaluación de robustez frente a ataques de copia de entidades. Aunque no es un modelo de propósito general, sirve como referencia para técnicas de fine-tuning dirigido y evaluación adversarial en modelos de conversación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-1.7B (transformers denso) |
| Parámetros totales | 1.7B (modelo base) + adaptador LoRA (r=16, alpha=32, dropout=0.05); tamaño del adaptador no especificado |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificado; depende del modelo base Qwen3-1.7B) |
| Tipos de cuantización | Entrenado con QLoRA 4-bit nf4 (double-quant); no se especifican cuantizaciones de inferencia |
| Idiomas soportados | No disponible (el modelo base Qwen3-1.7B es multilingüe, pero el adaptador no lo declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-1.7B, un modelo causal de lenguaje denso de la serie Qwen3. La técnica de adaptación es QLoRA: cuantización de 4 bits con `nf4` y doble cuantización, y un adaptador LoRA de rango 16 (alpha 32, dropout 0.05) aplicado sobre todas las proyecciones lineales del modelo base. El entrenamiento se realizó con 3 épocas, learning rate 2e-4 con decaimiento coseno, batch efectivo 16, longitud máxima 1536 tokens y pérdida solo sobre las respuestas del asistente (assistant-only loss). La mejor pérdida de validación fue 1.814.

Los datos de entrenamiento consisten en 500 conversaciones socráticas originales (las mismas que en la versión `-500`) más 250 ejemplos adversariales de defensa. Estos ejemplos usan entidades que no aparecen en los 17 ataques externos, de modo que la mejora de robustez (de 3/17 a 13/17 ataques defendidos) se debe a generalización, no a memorización de la lista de ataques. El objetivo es que el modelo aprenda a referirse a la palabra del usuario mediante pronombres o paráfrasis, evitando repetirla literalmente.

## Capacidades

- Generación de texto conversacional con un comportamiento estricto: cada frase termina con `?` y el modelo nunca revela la respuesta a la pregunta subyacente.
- Defensa frente a ataques de copia-edición, instrucciones tipo "output exactly" y peticiones de repetición de una entidad dada por el usuario.
- Mantiene el formato de chat del modelo base (soporta `apply_chat_template` con `enable_thinking=False`).
- No incluye capacidades de razonamiento adicionales más allá de las del modelo base; su comportamiento es deliberadamente restrictivo.

## Casos de uso

- **Tutoría interactiva**: el modelo guía al estudiante mediante preguntas sucesivas para que llegue a la respuesta por sí mismo, evitando dar soluciones directas. Adecuado para plataformas de aprendizaje donde se quiere fomentar el razonamiento autónomo.
- **Entrenamiento de pensamiento crítico**: en talleres o ejercicios, se puede usar para formular preguntas que orienten la reflexión sin revelar conclusiones, por ejemplo en debates o análisis de casos.
- **Demostración de robustez frente a jailbreaks**: sirve como caso de estudio para evaluar cómo un adaptador LoRA puede endurecer un modelo ante ataques de extracción de información, útil para equipos de seguridad en IA.
- **Prototipado de sistemas con restricciones de salida**: permite probar rápidamente arquitecturas donde el modelo debe mantener una política de no respuesta directa, por ejemplo en aplicaciones de coaching o en entornos con normativas de privacidad.
- **Investigación sobre adaptación de comportamiento**: el adaptador es un ejemplo reproducible de cómo entrenar restricciones específicas con QLoRA, útil para experimentos de alineación y evaluación de robustez.
- **Generación de preguntas socráticas**: puede usarse para generar automáticamente conjuntos de preguntas de exploración en dominios específicos, siempre que se combine con el modelo base y se configure el prompt adecuado.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la evaluación interna del autor sobre adherencia y robustez en un conjunto de desarrollo (`eval_dev-120`):

| Adaptador | Datos de entrenamiento | Ataques externos defendidos | Adherencia | Robustez |
|---|---|---|---|---|
| `qwen3-1.7b-socratic-500` | 500 | 3 / 17 | 97.7% | 94.2% |
| **`qwen3-1.7b-socratic-500adv2`** | 500 + 250 | **13 / 17** | **97.6%** | **95.0%** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB en disco, pero requiere el modelo base Qwen3-1.7B para la inferencia.
- Con el modelo base en FP16, la memoria necesaria es de unos 3.5-4 GB, lo que permite ejecutarse en GPUs de consumo como una RTX 3060 12 GB, RTX 4060 Ti o RTX 4090.
- Con cuantización del modelo base (por ejemplo, GGUF o AWQ), se puede reducir la VRAM a ~2 GB, permitiendo ejecución en GPUs de 4-6 GB o incluso en CPU con `llama.cpp`.
- Despliegue recomendado: `transformers` + `peft` (como en el ejemplo de la model card), o `vLLM` si se necesita mayor throughput (aunque no se ha probado oficialmente con este adaptador).
- Latencia esperada: baja, dado el tamaño del modelo (1.7B); en una GPU moderna se pueden obtener decenas de tokens por segundo.

## Comparativa con modelos similares

No existen adaptadores directamente comparables en el ecosistema público. Se puede comparar con el adaptador anterior del mismo autor y con el modelo base sin adaptación:

| Modelo | Parámetros | Comportamiento | Robustez frente a ataques | Licencia |
|---|---|---|---|---|
| `rubanikov/qwen3-1.7b-socratic-500` | 1.7B + LoRA | Socrático estricto | 3/17 ataques defendidos | Apache-2.0 |
| **`rubanikov/qwen3-1.7b-socratic-500adv2`** | 1.7B + LoRA | Socrático estricto | 13/17 ataques defendidos | Apache-2.0 |
| `Qwen/Qwen3-1.7B` (base) | 1.7B | Conversación general, sin restricción | No aplica | Apache-2.0 |

La principal diferencia entre los dos adaptadores es el número de ataques defendidos (3 vs. 13), con una adherencia casi idéntica y una robustez ligeramente mayor en la versión `adv2`.

## Limitaciones y advertencias

- El comportamiento socrático es inflexible: el modelo no responderá a ninguna pregunta con una respuesta directa, incluso en situaciones donde el usuario la necesita con urgencia (por ejemplo, en un contexto de emergencia). Es una limitación deliberada del diseño.
- La robustez mejorada se ha evaluado solo en un conjunto de desarrollo de 120 ejemplos; no hay evidencia de que la defensa se mantenga frente a ataques nuevos o más sofisticados.
- El adaptador se entrenó con QLoRA de 4 bits; la inferencia se puede realizar en precisión completa, pero el rendimiento puede variar según la cuantización del modelo base.
- No se han publicado datos sobre sesgos (género, raza, etc.) del modelo base ni del adaptador; es recomendable evaluar antes de un despliegue en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; el comportamiento socrático no lo elimina.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe cumplir las condiciones de la licencia del modelo base (también Apache-2.0).
- No hay garantía de soporte o mantenimiento del autor; el modelo tiene 0 descargas y 0 likes, lo que sugiere un proyecto personal con escasa validación externa.

## Enlaces

- [Hugging Face: rubanikov/qwen3-1.7b-socratic-500adv2](https://huggingface.co/rubanikov/qwen3-1.7b-socratic-500adv2)
- [Modelo base: Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Technical Report de Qwen3 (arXiv)](https://arxiv.org/html/2505.09388v1)
- [Versión anterior: rubanikov/qwen3-1.7b-socratic-500](https://huggingface.co/rubanikov/qwen3-1.7b-socratic-500)
