# sergiopaniego/watercolour-grpo-v10

## Resumen

`watercolour-grpo-v10` es un modelo de lenguaje fine-tuneado a partir de `Qwen/Qwen3.5-35B-A3B`, un modelo de arquitectura MoE (mezcla de expertos) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token. El autor, Sergio Paniego, lo ha entrenado mediante GRPO (Group Relative Policy Optimization), un método de aprendizaje por refuerzo introducido en DeepSeekMath para mejorar el razonamiento matemático y lógico. El entrenamiento se ha realizado con la librería TRL de Hugging Face.

El modelo se presenta como un experimento de investigación sobre la aplicación de GRPO a un modelo MoE de gran tamaño. El repositorio tiene un tamaño de solo 0,1 GB, lo que sugiere que podría contener únicamente los pesos del adaptador o una versión parcial del modelo, aunque no se especifica en la documentación. No se han publicado detalles sobre el conjunto de datos de entrenamiento, los hiperparámetros ni los resultados de evaluación.

La relevancia de este modelo radica en explorar cómo el aprendizaje por refuerzo puede aplicarse a arquitecturas MoE eficientes, un área de interés creciente para reducir costes de inferencia manteniendo capacidades de razonamiento avanzadas. Sin embargo, la falta de documentación y de métricas públicas limita su uso más allá de la experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de Qwen3.5-35B-A3B |
| Parametros totales | 35 mil millones (según el nombre del modelo base) |
| Parametros activos | 3 mil millones (según el sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `Qwen/Qwen3.5-35B-A3B`, que emplea una arquitectura de mezcla de expertos con 35B parámetros totales y 3B activos por token. Esta configuración permite una inferencia más eficiente que un modelo denso equivalente, ya que solo se activa una fracción de los pesos en cada paso. El entrenamiento se realizó con GRPO, una variante de optimización por política proximal (PPO) que agrupa múltiples respuestas generadas para el mismo prompt y calcula ventajas relativas, reduciendo la varianza y el coste computacional respecto a métodos basados en críticos.

No se han publicado detalles sobre el conjunto de datos utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje ni otras configuraciones. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que podría tratarse de un adaptador LoRA o de pesos parciales, aunque no se confirma en la documentación. Tampoco se indica si se aplicaron técnicas adicionales como SFT previo o DPO posterior al entrenamiento con RL.

## Capacidades

- Al ser un fine-tune de Qwen3.5-35B-A3B, se espera que herede las capacidades del modelo base, que incluyen generación de texto, razonamiento lógico, comprensión de código y soporte multilingüe, aunque no hay documentación específica que lo confirme.
- El entrenamiento con GRPO sugiere un enfoque orientado a mejorar el razonamiento matemático y la resolución de problemas paso a paso, siguiendo la línea de DeepSeekMath.
- No se ha documentado soporte para tool calling, function calling, agentes, visión ni audio.
- No se ha especificado si el modelo dispone de un modo de pensamiento explícito (thinking mode) o de generación de cadenas de razonamiento visibles.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como caso de estudio para analizar cómo GRPO afecta a un modelo MoE de gran tamaño, permitiendo comparar el comportamiento antes y después del entrenamiento.
- Experimentación con fine-tune eficiente: al tener un repositorio pequeño, puede utilizarse para probar técnicas de adaptación con pocos recursos, aunque se desconoce si los pesos son completos o parciales.
- Generación de texto con razonamiento mejorado: si el entrenamiento con GRPO ha funcionado como se espera, el modelo podría emplearse en tareas que requieran razonamiento lógico o matemático, como resolución de problemas o explicaciones paso a paso.
- Evaluación de modelos MoE: puede servir como punto de referencia para comparar el rendimiento de un MoE fine-tuneado con RL frente al modelo base o a otros fine-tunes.
- Desarrollo de prototipos: si se confirma que los pesos son utilizables, podría integrarse en aplicaciones de chatbot o asistentes, aunque la falta de licencia clara limita su uso comercial.
- Análisis de sesgos y alucinaciones: al ser un modelo experimental, puede utilizarse en estudios sobre los efectos del RL en la calidad y veracidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan métricas con el modelo base o con alternativas.

## Requisitos de hardware

- Al tratarse de un modelo MoE con 35B parámetros totales, la memoria VRAM necesaria depende de la cuantización y del tamaño real de los pesos (si el repositorio solo contiene adaptadores, el requisito sería menor).
- Estimación para pesos completos en FP16: aproximadamente 70 GB de VRAM, lo que requiere GPUs de datacenter como A100 (80 GB) o H100.
- Con cuantización a 8 bits, el uso de VRAM se reduce a unos 35 GB, aún por encima de las GPUs consumer típicas (24 GB).
- Con cuantización a 4 bits, el uso de VRAM sería de unos 17-18 GB, lo que permitiría ejecutarlo en una RTX 3090 o RTX 4090 (24 GB), aunque con posibles limitaciones de velocidad.
- Dado que el repositorio pesa solo 0,1 GB, es probable que no contenga los pesos completos del modelo base, por lo que los requisitos reales podrían ser mucho menores si se trata de un adaptador.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con la librería `transformers`. Para servir en producción, se podría utilizar vLLM o TGI si se dispone de los pesos completos. No se ha confirmado compatibilidad con llama.cpp u Ollama.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base `Qwen/Qwen3.5-35B-A3B` es el punto de referencia natural, pero no se han publicado métricas comparativas. Otros modelos MoE de tamaño similar, como Qwen3-30B-A3B (si existiera) o DeepSeek-V2-Lite, podrían servir como alternativas, pero no hay datos disponibles en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada: la model card indica "license" sin detallar los términos, lo que impide su uso comercial sin aclaración previa.
- No se ha documentado el conjunto de datos de entrenamiento, por lo que se desconocen posibles sesgos introducidos durante el fine-tune.
- El riesgo de alucinación es inherente al modelo base y no se ha evaluado específicamente en esta versión.
- La falta de benchmarks y de evaluaciones independientes impide conocer su rendimiento real en tareas estándar.
- El tamaño reducido del repositorio (0,1 GB) sugiere que podría no contener los pesos completos, lo que dificulta su uso directo sin el modelo base.
- No se ha confirmado la longitud de contexto soportada, lo que puede limitar su uso en aplicaciones que requieran ventanas largas.
- Al ser un modelo experimental, no se recomienda su uso en producción sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/watercolour-grpo-v10
- Perfil del autor: https://huggingface.co/sergiopaniego
- Otros modelos del autor: https://huggingface.co/sergiopaniego/models
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Librería TRL: https://github.com/huggingface/trl
- Modelo base Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
