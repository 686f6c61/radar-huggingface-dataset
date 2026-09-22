# francesca9805/jpn-jpan-10mb-ppt-Dp-100mb-packed-bfd_seed10

## Resumen

Este modelo es un ajuste fino supervisado (SFT) del modelo monolingüe japonés `goldfish-models/jpn_jpan_10mb`, publicado por el usuario `francesca9805` (los registros de entrenamiento apuntan a la Universidad de Groningen). Se trata de un transformer decoder-only de arquitectura GPT-2 con 39.087.104 parámetros (unos 39 millones) y un repositorio de solo 0,1 GB, lo que lo sitúa en la categoría de modelos diminutos orientados a experimentación más que a producción.

El problema que aborda es acotado: estudiar cómo el ajuste fino con instrucciones (SFT mediante TRL) afecta a un modelo base entrenado con muy pocos datos de un único idioma. El nombre del repositorio sugiere un entrenamiento sobre datos empaquetados (packed) de aproximadamente 100 MB, frente a los 10 MB del modelo base, con una semilla concreta (seed10), lo que apunta a un experimento reproducible de escalado de datos dentro de la familia Goldfish.

Su relevancia actual es fundamentalmente metodológica: sirve como banco de pruebas barato para investigar empaquetado de secuencias, ajuste fino con TRL y comportamiento de modelos monolingües de baja resource, no como alternativa a modelos generativos de propósito general. No se ha publicado información sobre licencia, idiomas soportados, longitud de contexto ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (según el tag `gpt2` y la librería `transformers`) |
| Parametros totales | 39.087.104 (≈39 M, dato real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican pesos GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible en la ficha; el modelo base es monolingüe japonés (`jpn_jpan`) |
| Licencia | no disponible (la model card incluye el campo placeholder `licence: license`, sin texto legal) |
| Formato de pesos | safetensors (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, tal y como indican el tag `gpt2` del repositorio y la librería declarada `transformers`. Con 39,09 M de parámetros, el modelo se sitúa en el rango de los GPT-2 *small* recortados o adaptados a vocabularios no ingleses: los modelos Goldfish se construyen como modelos monolingües de vocabulario específico por idioma, y en este caso el tokenizador del modelo base está orientado al japonés en escritura `jpan`.

El entrenamiento se ha realizado con SFT (supervised fine-tuning) usando TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El identificador del modelo (`ppt-Dp-100mb-packed-bfd_seed10`) sugiere un corpus empaquetado de aproximadamente 100 MB, frente a los 10 MB del modelo base `goldfish-models/jpn_jpan_10mb`, con una semilla fija para reproducibilidad. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales; la model card solo confirma el uso de SFT.

## Capacidades

- Generación de texto autoregresiva en el idioma del modelo base (japonés, según el identificador `jpn_jpan`); no hay confirmación explícita de multilingüismo.
- Formato de conversación: el ejemplo de la model card usa `pipeline` con mensajes en formato `{"role": "user", "content": ...}`, lo que indica que el modelo fue ajustado con datos de instrucciones en formato chat.
- Ajuste a instrucciones sencillas derivado del entrenamiento SFT con TRL.
- Integración directa con el ecosistema Hugging Face: `transformers`, `text-generation-inference` y endpoints compatibles.
- Capacidades de razonamiento, código, matemáticas, tool calling, uso de agentes, visión o audio: no disponibles; un modelo de 39 M de parámetros entrenado con 10–100 MB de texto monolingüe no está diseñado para estas tareas.
- No se documenta ningún modo especial (thinking mode, decodificación especulativa ni atención lineal).

## Casos de uso

- Investigación sobre empaquetado de secuencias: comparar este modelo con otras variantes de la misma familia y semilla para medir el efecto del empaquetado (packed) en la pérdida y en la calidad de generación.
- Ablaciones de ajuste fino con TRL: servir como punto de control barato para estudiar cómo el SFT modifica un modelo base de 39 M de parámetros antes de escalar el experimento a modelos mayores.
- Reproducibilidad de experimentos: la semilla fija (`seed10`) y el registro en Weights & Biases permiten replicar la ejecución y auditar la curva de entrenamiento.
- Generación de texto japonés a muy pequeña escala: prototipos de continuación de texto o ejercicios docentes donde el coste computacional y el tiempo de iteración son prioritarios frente a la calidad.
- Docencia y prácticas de NLP: al caber en CPU y ocupar menos de 100 MB, es adecuado para aulas donde se enseña a cargar un modelo con `pipeline`, hacer inferencia y medir perplejidad.
- Pruebas de infraestructura de despliegue: validar pipelines de TGI o endpoints compatibles con un modelo mínimo antes de desplegar uno grande, ya que el tag `endpoints_compatible` lo permite.
- Generación de datos sintéticos de bajo coste: producir borradores en japonés para filtrarlos posteriormente con un modelo mayor, siempre que se asuma una calidad limitada.
- Ejecución en hardware restringido: inferencia en CPU, Raspberry Pi o dispositivos sin GPU, útil para demostraciones offline sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (perplejidad, MMLU, HumanEval, GSM8K ni ninguna evaluación específica de japonés), y los resultados de la búsqueda web proporcionada no contienen datos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión. Con 39,09 M de parámetros, los pesos ocupan aproximadamente 156 MB en fp32, 78 MB en fp16/bf16, 39 MB en int8 y alrededor de 20 MB en int4.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. No requiere A100, H100 ni RTX 4090; usarlas sería un desperdicio de recursos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de la última década, e incluso en iGPU.
- Cabe en CPU: sí, con latencias de milisegundos por token en procesadores modernos; también es viable en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: `transformers` con `pipeline` (método documentado en la model card), Text Generation Inference (el repositorio incluye el tag `text-generation-inference`), endpoints compatibles de Hugging Face y, previa conversión manual a GGUF, llama.cpp u Ollama (no se publican pesos GGUF oficiales).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/jpn-jpan-10mb-ppt-Dp-100mb-packed-bfd_seed10` (este modelo) | 39,09 M | no disponible | SFT con TRL sobre el modelo base, datos empaquetados (~100 MB según el nombre) | no disponible | Hugging Face, safetensors, 0 descargas |
| `goldfish-models/jpn_jpan_10mb` (modelo base) | no disponible en la información proporcionada (la familia Goldfish parte de 10 MB de datos por idioma) | no disponible | Preentrenamiento monolingüe en japonés con ~10 MB de datos | no disponible | Hugging Face |
| Otras variantes Goldfish de la misma familia | no disponible | no disponible | Preentrenamiento monolingüe | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría. Cualquier comparación de rendimiento con modelos japoneses de mayor tamaño (por ejemplo, modelos de cientos de millones o miles de millones de parámetros) sería especulativa y no se incluye.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un modelo entrenado con 10–100 MB de texto monolingüe reproduce inevitablemente los sesgos y las limitaciones de cobertura de ese corpus reducido.
- Riesgo de alucinación: alto en cualquier tarea factual. Con 39 M de parámetros y un volumen de entrenamiento mínimo, el modelo no tiene capacidad de almacenar conocimiento factual fiable.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada. El modelo base es monolingüe japonés, por lo que el rendimiento en castellano u otros idiomas será previsiblemente nulo o degenerado. El uso de un ejemplo de prompt en inglés en la model card no implica capacidad multilingüe.
- Licencia: el campo de licencia es un placeholder (`licence: license`) sin texto legal asociado. No hay autorización explícita de uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- Advertencia para producción: el modelo tiene 0 descargas y 0 likes, sin evaluación publicada, sin model card detallada y sin garantías de mantenimiento. No debería desplegarse en ningún sistema orientado a usuarios finales.
- Ruido en la búsqueda: los resultados de búsqueda web asociados a esta ficha corresponden a BlaBlaCar y no guardan relación con el modelo; no aportan información técnica utilizable.
- Nombre del modelo: los acrónimos `ppt-Dp` y `bfd` del identificador no se explican en la información disponible, lo que dificulta interpretar con precisión la configuración del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/jpn-jpan-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/jpn_jpan_10mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/b7d3uj8d
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL (cita): von Werra et al., *TRL: Transformer Reinforcement Learning*, GitHub, 2020
