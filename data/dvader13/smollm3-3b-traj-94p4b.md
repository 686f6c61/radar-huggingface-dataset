# dvader13/smollm3-3b-traj-94p4b

## Resumen

Este repositorio contiene los checkpoints intermedios de la fase de reinforcement learning (RL) del modelo SmolLM3-3B, correspondientes a la primera época de entrenamiento. El autor, dvader13, ha publicado la trayectoria completa de entrenamiento con 31 checkpoints que documentan la evolución del modelo a lo largo del proceso de RL, partiendo de la base preentrenada con 94.4 mil millones de tokens.

El modelo base, SmolLM3-3B, es un transformer decoder-only de 3 mil millones de parámetros desarrollado por Hugging Face, con atención por grupos (GQA) y sin embeddings posicionales (NoPE), entrenado sobre 11.2 billones de tokens. Este repositorio en particular no es un modelo final listo para producción, sino un artefacto de investigación que permite estudiar la dinámica del entrenamiento con RL, la evolución de las capacidades del modelo y los efectos de las diferentes etapas de optimización.

La relevancia de este repositorio radica en su valor para investigadores que estudian el comportamiento de los modelos durante el entrenamiento con RL, la estabilidad del aprendizaje y los puntos de inflexión en la adquisición de capacidades. No está pensado para uso en producción, sino como material de análisis y reproducción de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y NoPE |
| Parametros totales | 3 mil millones (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | bf16 (checkpoints publicados) |
| Idiomas soportados | 6 idiomas: ingles, frances, aleman, portugues, espanol, italiano (modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B utiliza una arquitectura transformer decoder-only con Grouped Query Attention (GQA) para reducir el tamaño de la cache KV y sin embeddings posicionales rotativos (RoPE), empleando en su lugar NoPE (No Positional Embeddings) con una proporción 3:1. Esta elección de diseño mejora el rendimiento en tareas de contexto largo. El preentrenamiento se realizó sobre 11.2 billones de tokens siguiendo un currículo por etapas que combina datos web, código, matemáticas y razonamiento.

Los checkpoints de este repositorio corresponden a la fase de RL posterior al preentrenamiento, específicamente a la primera época. El espaciado entre checkpoints se amplía progresivamente: pasos de 20 hasta el paso 200, luego de 40, 80 y 120. Cada checkpoint está almacenado en formato bf16 y es de solo inferencia, sin capacidad de continuar el entrenamiento directamente desde estos archivos.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de generar texto coherente y realizar tareas de razonamiento básico, aunque estos checkpoints intermedios pueden mostrar capacidades parciales o en evolución.
- Razonamiento híbrido: el modelo base incorpora modos de razonamiento dual (thinking mode), que permite alternar entre respuestas rápidas y razonamiento profundo.
- Soporte multilingüe: el modelo base tiene soporte nativo para seis idiomas europeos, con rendimiento consistente en inglés, francés, alemán, portugués, español e italiano.
- Contexto largo: gracias a NoPE y GQA, el modelo base maneja ventanas de contexto de hasta 128K tokens.
- Tool calling: el modelo base soporta function calling, aunque la capacidad exacta en estos checkpoints intermedios no está documentada.
- Limitación importante: al ser checkpoints intermedios de RL, las capacidades pueden ser inconsistentes o incompletas en comparación con el modelo final.

## Casos de uso

- Investigación académica sobre dinámica de RL: los checkpoints permiten estudiar cómo evolucionan las capacidades del modelo durante el entrenamiento con RL, identificar fases de aprendizaje rápido o regresiones, y analizar la estabilidad del entrenamiento.
- Reproducción de experimentos: investigadores que trabajen con SmolLM3-3B pueden utilizar estos checkpoints para reproducir o comparar sus propios experimentos de RL y verificar la consistencia de los resultados.
- Análisis de alineación y seguridad: el estudio de la trayectoria de RL puede revelar en qué punto del entrenamiento aparecen o desaparecen ciertos comportamientos, útil para investigación en seguridad de IA.
- Estudio de la evolución del razonamiento: al comparar checkpoints de diferentes pasos, se puede observar cómo mejora o cambia la capacidad de razonamiento del modelo a lo largo del entrenamiento.
- Desarrollo de técnicas de early stopping: los datos de la trayectoria pueden ayudar a identificar el punto óptimo para detener el entrenamiento y evitar sobreoptimización o degradación de capacidades.
- Benchmarking de metodologías de RL: comparar estos checkpoints con los de otros modelos o configuraciones de entrenamiento para evaluar la eficacia de diferentes estrategias de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio contiene checkpoints intermedios de entrenamiento, no un modelo final evaluado. Los benchmarks del modelo base SmolLM3-3B están disponibles en la documentación oficial de Hugging Face, pero no se proporcionan datos específicos para estos checkpoints intermedios.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 153.8 GB en disco, lo que requiere un almacenamiento significativo para descargar todos los checkpoints.
- VRAM para inferencia: cada checkpoint individual en bf16 ocupa aproximadamente 6 GB, por lo que se necesita al menos 8 GB de VRAM para cargar un solo checkpoint en GPU.
- GPUs recomendadas: para inferencia de un solo checkpoint, una GPU con 8-12 GB de VRAM es suficiente (RTX 3060, RTX 4070, etc.). Para procesar múltiples checkpoints de forma secuencial, se recomienda una GPU con mayor VRAM o el uso de CPU con suficiente RAM.
- Opciones de despliegue: al ser checkpoints de investigación, no están optimizados para despliegue. Se pueden cargar con la librería Transformers de Hugging Face para análisis, pero no se recomienda su uso con vLLM, Ollama u otras herramientas de producción.
- Latencia y throughput: no disponible, ya que no se han realizado mediciones de rendimiento sobre estos checkpoints intermedios.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo final comparable con otras alternativas, sino artefactos intermedios de entrenamiento. Para comparar el modelo base SmolLM3-3B con alternativas similares, se puede consultar la documentación oficial de Hugging Face, donde se compara con otros modelos de 3B como Qwen2.5-3B o Llama-3.2-3B.

## Limitaciones y advertencias

- Checkpoints intermedios: estos no son modelos finales. Las capacidades pueden ser inconsistentes, incompletas o incluso degradadas en comparación con el modelo final de SmolLM3-3B.
- Solo inferencia: los checkpoints están publicados en formato de solo inferencia, sin los estados del optimizador necesarios para continuar el entrenamiento.
- Sin documentación de capacidades: no se ha documentado qué capacidades específicas tiene cada checkpoint, por lo que su comportamiento es impredecible.
- Riesgo de alucinación: al ser modelos intermedios de RL, el riesgo de alucinación y de respuestas incoherentes puede ser mayor que en el modelo final.
- Uso comercial: aunque la licencia Apache 2.0 permite uso comercial, estos checkpoints no están pensados para producción y su uso en ese contexto no es recomendable.
- Idiomas: la información sobre idiomas soportados corresponde al modelo base, pero los checkpoints intermedios pueden no mantener el mismo rendimiento multilingüe.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-traj-94p4b
- Blog oficial de SmolLM3: https://huggingface.co/blog/smollm3
- Documentación de Transformers para SmolLM3: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Ficha de SmolLM3-3B en atomic.chat: https://atomic.chat/models/smollm3-3b
- Resumen de SmolLM3-3B en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/smollm3-3b-huggingfacetb
- Modelo en Ollama: https://ollama.com/alibayram/smollm3
