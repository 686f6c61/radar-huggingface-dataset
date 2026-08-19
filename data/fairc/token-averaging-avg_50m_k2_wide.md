# FAIRC/token-averaging-avg_50m_k2_wide

## Resumen

FAIRC/token-averaging-avg_50m_k2_wide es un checkpoint de investigación del proyecto **token averaging**, desarrollado por el grupo FAIRC. El proyecto, cuyo código fuente se encuentra en el repositorio GitHub `cyai/llm-token-averaging`, investiga si es posible aumentar la longitud de contexto efectiva de un modelo de lenguaje promediando tokens adyacentes. La hipótesis es que las embeddings de lenguaje son redundantes en ventanas pequeñas, de modo que promediar k tokens consecutivos en uno reduce la longitud de secuencia efectiva a la mitad (o más) sin modificar la arquitectura del modelo.

El checkpoint corresponde a una ejecución con configuración `avg_50m_k2_wide`: un transformer con 115 millones de parámetros, 8 capas, 8 cabezas de atención, dimensión de modelo 864 y contexto de 1024 tokens. El factor de promediado k=2 implica que cada par de tokens adyacentes se combina en uno, reduciendo la secuencia efectiva a 512 tokens por ejemplo. El modelo fue entrenado con un objetivo de 2 mil millones de tokens (target_tokens=2000000000), aunque el dataset concreto no se especifica en la información disponible.

Es importante destacar que este repositorio **no contiene pesos listos para usar con Hugging Face Transformers**, sino un volcado de checkpoint en formato PyTorch (`final.pt`) junto con un registro de pérdidas (`loss_log.csv`). Su propósito es exclusivamente académico y de investigación; no es un modelo de producción ni ofrece capacidades de generación de texto directamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con promediado de tokens (averaging_k=2) |
| Parametros totales | 115.085.664 (aprox. 115 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (context_len), con secuencia efectiva de 512 tras promediar |
| Tipos de cuantizacion | no disponible (checkpoint en FP32, según torch.load) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`final.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con 8 capas, 8 cabezas de atención, dimensión de modelo 864 y embeddings atadas (tie_embeddings=true). La innovación principal reside en la capa de **token averaging**: antes de introducir la secuencia en el transformer, se promedian k=2 tokens consecutivos en un solo vector. Esto reduce la longitud de secuencia efectiva a la mitad (512 tokens para una ventana de 1024), disminuyendo el coste computacional de la atención sin cambiar la arquitectura subyacente. El proyecto evalúa cinco estrategias de promediado diferentes, siendo esta ejecución una de ellas (variante "wide" con d_model amplio).

El entrenamiento se realizó con una tasa de aprendizaje de 0.0002, 2000 pasos de warmup y un objetivo de 2 mil millones de tokens. No se especifica el dataset utilizado ni si se aplicaron técnicas de alineación como RLHF o DPO; el proyecto se centra en el análisis empírico de la eficiencia de contexto, no en la calidad generativa del modelo.

## Capacidades

- **Investigación sobre eficiencia de contexto**: el modelo sirve para estudiar cómo el promediado de tokens afecta a la pérdida y a la capacidad de modelado del lenguaje.
- **Análisis de pérdidas**: se incluye un `loss_log.csv` con el registro de pérdidas durante el entrenamiento, útil para reproducir experimentos.
- **Carga de checkpoint**: permite restaurar el estado del modelo en un punto concreto (step, tokens_seen, cumulative_flops) mediante `torch.load`.
- **No ofrece capacidades de generación de texto, razonamiento, código, tool calling ni multilingüismo** al ser un artefacto de investigación sin interfaz de inferencia.

## Casos de uso

- **Evaluación de estrategias de compresión de contexto**: investigadores pueden cargar el checkpoint y comparar la pérdida obtenida con otras variantes (k=2, k=3, etc.) para determinar si el promediado de tokens es viable como método de extensión de contexto.
- **Reproducción de experimentos**: el repositorio proporciona la configuración exacta (d_model, n_layers, lr, warmup) y los logs de pérdida, permitiendo replicar el entrenamiento o continuarlo desde el checkpoint.
- **Estudio de la redundancia de embeddings**: el proyecto busca validar si las representaciones de tokens adyacentes son redundantes; este checkpoint sirve como evidencia empírica para dicho análisis.
- **Desarrollo de arquitecturas eficientes**: los resultados pueden informar el diseño de modelos que reduzcan el coste de atención sin perder rendimiento, útil para despliegue en entornos con recursos limitados.
- **Comparación de configuraciones**: al existir otras ejecuciones (avg_50m_k2, avg_50m_k2_wexp), este checkpoint permite comparar el efecto de la anchura del modelo en el rendimiento.
- **Docencia e investigación académica**: como ejemplo de un pipeline de entrenamiento de LLM con una técnica de compresión novedosa, puede usarse en cursos de aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo incluye logs de pérdida de entrenamiento, sin evaluaciones estándar como MMLU, HumanEval o GSM8K. Dado que el modelo es un artefacto de investigación sin fines generativos, no se dispone de métricas de calidad de texto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 115 M de parámetros en FP32, el checkpoint ocupa aproximadamente 460 MB. En FP16 serían ~230 MB. La inferencia con un batch pequeño cabría en cualquier GPU con 2 GB o más.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060 (12 GB) o incluso CPUs con suficiente RAM, ya que el modelo es pequeño.
- **Compatibilidad con consumer GPU**: sí, cabe sin problema en GPUs de consumo de 4 GB o más.
- **Opciones de despliegue**: no se proporcionan archivos para vLLM, llama.cpp u Ollama. El checkpoint se carga directamente con PyTorch y requiere reconstruir la arquitectura desde `config.json` o desde `experiments/chinchilla/model_configs.py` del repositorio fuente.
- **Latencia y throughput**: no disponibles, ya que no se ha diseñado para inferencia.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos, ya que este checkpoint es un experimento de investigación sin evaluación estándar. Como referencia de tamaño, se podría comparar con GPT-2 small (124 M de parámetros, contexto 1024), pero la diferencia de propósito y la falta de métricas hacen que la comparación no sea significativa. La información de modelos comparables no está disponible.

## Limitaciones y advertencias

- **No es un modelo de producción**: no incluye pesos en formato Hugging Face Transformers, ni pipeline de generación, ni tokenizador. Solo es un volcado de estado para investigación.
- **Licencia no especificada**: el repositorio no indica licencia, por lo que su uso comercial o la redistribución de los pesos es legalmente incierto. Se recomienda contactar con los autores antes de cualquier uso fuera del ámbito académico.
- **Idiomas y sesgos desconocidos**: al no especificarse el dataset de entrenamiento, no se pueden evaluar sesgos lingüísticos ni riesgos de alucinación.
- **Contexto efectivo reducido**: aunque la ventana es de 1024 tokens, el promediado k=2 reduce la secuencia efectiva a 512, lo que limita la capacidad de modelar dependencias de largo alcance.
- **Sin garantía de rendimiento**: el proyecto es experimental y no ha demostrado mejoras sobre modelos baseline; los resultados pueden no ser reproducibles fuera del entorno original.
- **Dependencia de código externo**: para cargar el checkpoint es necesario reconstruir la arquitectura desde el repositorio fuente (`cyai/llm-token-averaging`), que puede no estar mantenido.

## Enlaces

- [Hugging Face: FAIRC/token-averaging-avg_50m_k2_wide](https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_wide)
- [Repositorio GitHub del proyecto: cyai/llm-token-averaging](https://github.com/cyai/llm-token-averaging/blob/main/)
- [Variante relacionada: FAIRC/token-averaging-avg_50m_k2](https://huggingface.co/FAIRC/token-averaging-avg_50m_k2)
- [Variante relacionada: FAIRC/token-averaging-avg_50m_k2_wexp](https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_wexp)
