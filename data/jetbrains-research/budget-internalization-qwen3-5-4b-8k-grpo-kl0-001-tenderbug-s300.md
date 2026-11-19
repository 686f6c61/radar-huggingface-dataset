# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-kl0.001-tenderbug-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-grpo-kl0.001-tenderbug-s300` es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado al razonamiento matemático bajo un presupuesto de generación fijo de 8.192 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia cómo internalizar un límite de tokens durante el entrenamiento en lugar de aplicarlo solo en inferencia.

El entrenamiento emplea GRPO (Group Relative Policy Optimization) con una penalización KL de coeficiente 0,001 respecto al modelo base, sobre el conjunto de datos DeepScaleR (matemáticas), con recompensa binaria de corrección de la respuesta extraída de etiquetas `\boxed{}`. El checkpoint publicado corresponde al paso 300 de una ejecución identificada con el nombre en clave `tenderbug`.

Se trata de un modelo de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones), distribuido en formato BF16 con safetensors y licencia Apache 2.0, heredada del modelo base. Su relevancia radica en que aborda el coste de la computación en tiempo de inferencia en modelos con razonamiento extenso, un problema central para el despliegue económico de modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 (~4,5 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (presupuesto de generación de 8.192 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text` según los metadatos de Hugging Face. El ajuste fino se realiza con GRPO, utilizando una línea base leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token, junto con una penalización KL de tipo k3 hacia el modelo base con coeficiente 0,001. El presupuesto de generación durante el entrenamiento se fija en 8.192 tokens nuevos (`max_new_tokens`).

Los datos de entrenamiento provienen de DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración incluye lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con programación de tasa de aprendizaje coseno, pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos. La recompensa es binaria, basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento solicita razonamiento paso a paso y salida de la respuesta dentro de dichas etiquetas. La innovación principal es la internalización del presupuesto de tokens: el modelo aprende a producir respuestas correctas dentro de un límite fijo, en lugar de depender del escalado en tiempo de prueba.

## Capacidades

- Generación de texto y razonamiento paso a paso, con énfasis en problemas matemáticos.
- Resolución de problemas matemáticos con formato de respuesta estructurado mediante etiquetas `\boxed{}`.
- Razonamiento bajo un presupuesto de generación fijo de 8.192 tokens (internalización del presupuesto).
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`), aunque no se detalla su alcance tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible como funcionalidad documentada; el prompt de entrenamiento induce razonamiento paso a paso.

## Casos de uso

- Resolución de problemas matemáticos en producción: el modelo está entrenado para responder dentro de 8.192 tokens, lo que permite presupuestar coste y latencia por consulta en servicios de tutoría o corrección automática.
- Evaluación educativa automatizada: la extracción de respuestas mediante `\boxed{}` facilita el parseo y la verificación automática de soluciones en plataformas de ejercicios.
- Investigación en aprendizaje por refuerzo: sirve como checkpoint de referencia para estudiar la internalización de presupuestos de tokens y comparar con el modelo base sin ajuste.
- Generación de cadenas de razonamiento acotadas: útil en pipelines donde el coste de inferencia debe ser predecible y no puede crecer con el escalado en tiempo de prueba.
- Destilación de razonamiento: las trazas generadas bajo presupuesto fijo pueden emplearse como datos de entrenamiento para modelos más pequeños.
- Reproducción de experimentos: al publicarse el paso 300 y la configuración completa, permite replicar el entrenamiento GRPO con penalización KL sobre DeepScaleR.
- Integración en entornos de investigación con transformers: al usar safetensors y la librería transformers, se carga directamente en pipelines existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más memoria para activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,3-3 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con lotes pequeños.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en BF16 con lotes reducidos, y en 8 GB o más con cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-8k-grpo-kl0.001-tenderbug-s300 | ~4,5 mil millones | No disponible (presupuesto de 8.192 tokens) | Razonamiento matemático con presupuesto fijo vía GRPO | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | ~4,5 mil millones | No disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |
| Alternativas de razonamiento matemático de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y el modelo base ni con otras alternativas.

## Limitaciones y advertencias

- El ajuste se limita a matemáticas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- El presupuesto fijo de 8.192 tokens puede truncar problemas que requieran cadenas de razonamiento más largas.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recompensa binaria no garantiza corrección en dominios fuera de distribución.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-4B.
- Checkpoint intermedio (paso 300): no se indica que sea la versión final ni la mejor de la ejecución.
- La model card carece de sección de citación completa (marcada como TODO) y de evaluación cuantitativa.
- El pipeline declarado es `image-text-to-text`, pero no se documenta si las capacidades de visión se preservan tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-kl0.001-tenderbug-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
