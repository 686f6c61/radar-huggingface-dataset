# FAIRC/token-averaging-avg_8m_k2

## Resumen

El modelo `FAIRC/token-averaging-avg_8m_k2` es un checkpoint de investigación publicado por el grupo FAIRC dentro de un proyecto centrado en la técnica de *token averaging* (promediado de tokens). Se trata de un transformer pequeño, de aproximadamente 7,6 millones de parámetros, con una ventana de contexto de 512 tokens, diseñado para experimentar con la agregación de representaciones de tokens consecutivos durante el entrenamiento. El nombre del run (`avg_8m_k2`) indica que se promedian `k=2` tokens adyacentes.

Este modelo no está pensado como un producto listo para usar, sino como un artefacto de investigación para estudiar el efecto del promediado de tokens en el aprendizaje de representaciones lingüísticas. Su relevancia radica en que permite reproducir y analizar una técnica de regularización o compresión de secuencias que podría tener aplicaciones en eficiencia de entrenamiento o en modelos con memoria limitada. El checkpoint incluye únicamente el estado del modelo (`state_dict`) junto con un log de pérdidas, sin pesos en formato Hugging Face estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con promediado de tokens (OLMAveraged / OLMTransformerBody) |
| Parametros totales | 7.612.544 (aprox. 7,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en precisión nativa PyTorch) |
| Idiomas soportados | no disponible (sin información en la model card) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar de 6 capas, 4 cabezas de atención y dimensión de modelo 128, con *tie embeddings* (embeddings compartidos entre entrada y salida). La innovación principal es el módulo `OLMAveraged`, que aplica un promediado de `k=2` tokens consecutivos en alguna parte del procesamiento (probablemente en la entrada o en las representaciones intermedias), reduciendo la longitud efectiva de la secuencia o agregando información local. Esta técnica se enmarca en la familia de métodos de compresión de contexto o de *token merging*.

Los detalles de entrenamiento son parciales: se especifica una tasa de aprendizaje de 0,0004 con 500 pasos de *warmup* y un objetivo de 600 millones de tokens (`target_tokens`). No se indica la composición del dataset, ni si se usó RLHF, DPO u otro método de alineación. El proyecto se basa en configuraciones del repositorio `experiments/chinchilla/model_configs.py`, lo que sugiere que sigue las leyes de escalado de Chinchilla para elegir el tamaño del modelo y el número de tokens.

## Capacidades

No se dispone de información pública sobre las capacidades funcionales de este modelo. Al ser un checkpoint de investigación sin evaluación publicada, no se pueden afirmar capacidades concretas de generación, razonamiento, código o multilingüismo. Lo que se puede inferir de la arquitectura:

- Procesamiento de secuencias de texto de hasta 512 tokens.
- Representaciones contextuales mediante atención multi-cabeza.
- Posible reducción de la longitud efectiva de la secuencia gracias al promediado de tokens (si se aplica antes de la atención).
- Sin soporte conocido de *tool calling*, agentes o modos especiales (visión, audio).

## Casos de uso

Dado su carácter de investigación, los casos de uso son principalmente académicos y experimentales:

- Reproducción de experimentos: el checkpoint permite reproducir los resultados del proyecto *token averaging* y verificar el efecto del promediado en la pérdida y en la calidad de las representaciones.
- Estudio de técnicas de compresión de contexto: investigadores pueden analizar cómo el promediado de `k=2` tokens afecta al aprendizaje comparado con un transformer estándar del mismo tamaño.
- Desarrollo de variantes: a partir del `state_dict`, se puede modificar la arquitectura o el hiperparámetro `k` para explorar otras configuraciones.
- Benchmarking de eficiencia: al ser un modelo diminuto (7,6 M), sirve para medir el coste computacional del promediado frente a la atención completa en entornos con recursos limitados.
- Educación: útil como ejemplo didáctico de cómo se estructura un proyecto de investigación en NLP y cómo se distribuyen checkpoints en Hugging Face.
- No es adecuado para tareas de producción, generación de texto real o integración en aplicaciones comerciales sin una evaluación previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo contiene un log de pérdidas (`loss_log.csv`) que podría usarse para reconstruir la curva de entrenamiento, pero no hay métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~7,6 M de parámetros, la huella de memoria es mínima. Con precisión FP32, los pesos ocupan unos 30 MB; en FP16, unos 15 MB. Cabe en cualquier GPU con más de 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1650, RTX 3060 o superiores. También funciona en Apple Silicon o en CPUs con soporte AVX.
- Opciones de despliegue: al no tener pesos en formato estándar (solo `state_dict`), no es compatible directamente con vLLM, llama.cpp u Ollama. Requiere reconstruir la arquitectura desde `config.json` y cargar el `state_dict` con PyTorch.
- Latencia y throughput: no se han medido oficialmente, pero por el tamaño del modelo, la inferencia en GPU es del orden de milisegundos por secuencia de 512 tokens; en CPU, del orden de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El checkpoint no tiene métricas publicadas ni una descripción de tareas, por lo que no es posible compararlo con alternativas de la misma categoría. Se podría comparar arquitectónicamente con un transformer pequeño estándar (por ejemplo, GPT-2 pequeño con 124 M de parámetros, pero ese es mucho mayor), pero no hay datos de rendimiento para sostener la comparación. Por tanto: no disponible.

## Limitaciones y advertencias

- Modelo de investigación sin validación: no ha sido evaluado en tareas estándar, por lo que su calidad y comportamiento son desconocidos.
- Sin licencia especificada: no se puede determinar si es utilizable comercialmente o si tiene restricciones de uso. Se recomienda contactar con los autores antes de cualquier uso no académico.
- Formato no estándar: los pesos no son compatibles con `transformers` ni con herramientas de inferencia habituales; requiere reconstrucción manual de la arquitectura.
- Sin información sobre sesgos o alucinaciones: al no haber evaluación, no se conocen sesgos potenciales ni riesgo de alucinación.
- Contexto limitado: 512 tokens es una ventana corta para aplicaciones modernas de diálogo o procesamiento de documentos largos.
- Sin soporte de cuantización: no hay archivos GGUF, AWQ u otros formatos optimizados para despliegue eficiente.

## Enlaces

- HuggingFace: https://huggingface.co/FAIRC/token-averaging-avg_8m_k2
- Repositorio fuente mencionado en la model card: `experiments/chinchilla/model_configs.py` (sin URL pública en la información proporcionada)
