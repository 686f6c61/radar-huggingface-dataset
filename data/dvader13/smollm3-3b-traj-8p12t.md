# dvader13/smollm3-3b-traj-8p12t

## Resumen

El repositorio `dvader13/smollm3-3b-traj-8p12t` contiene 31 checkpoints intermedios de entrenamiento por refuerzo (RL) del modelo SmolLM3-3B, correspondientes a la primera época de entrenamiento. El autor, dvader13, publica la trayectoria completa de pesos para permitir el análisis de la dinámica de aprendizaje, la convergencia y los efectos de las distintas fases de RL. El modelo base es SmolLM3-3B, un transformador decoder-only de 3 mil millones de parámetros desarrollado por Hugging Face, con una ventana de contexto de 128K tokens y entrenado sobre 11T tokens. Este repositorio no es un modelo final para inferencia, sino un artefacto de investigación para estudiar la evolución de los pesos durante el entrenamiento.

Los checkpoints están almacenados en formato bf16 y se organizan en carpetas `step-XXXX` con un espaciado que se amplía progresivamente (20 pasos iniciales, luego 40, 80 y 120). El tamaño total del repositorio es de 190.7 GB, lo que refleja los 31 modelos completos. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el propósito principal es la investigación en aprendizaje por refuerzo y el análisis de trayectorias de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: SmolLM3-3B) |
| Parametros totales | 3 mil millones (por checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del base) |
| Tipos de cuantizacion | bf16 (inference only, sin cuantizacion adicional) |
| Idiomas soportados | 6 idiomas principales: ingles, aleman, frances, espanol, italiano y portugues (del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (por checkpoint) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformador decoder-only con atención causal, entrenado sobre 8.12T tokens (según la etiqueta del repositorio, aunque el blog oficial menciona 11T tokens para el modelo final; aquí se indica el valor de la card del repositorio). La arquitectura incluye atención de ventana deslizante y atención completa para manejar los 128K tokens de contexto, junto con un mecanismo de razonamiento dual (modo estándar y modo de pensamiento extendido).

Los checkpoints del repositorio son intermedios de la primera epoch de entrenamiento por refuerzo. No se especifica el algoritmo RL utilizado (PPO, GRPO, etc.) ni los datos de recompensa. La trayectoria se guarda en pasos de entrenamiento, con espaciado creciente para cubrir toda la etapa sin almacenar todos los pasos. El formato es bf16 y solo para inferencia, es decir, no se puede continuar el entrenamiento desde estos checkpoints sin conversión previa.

## Capacidades

- No es un modelo final: los checkpoints son intermedios y no representan un modelo convergido ni optimizado para uso práctico.
- Hereda las capacidades del modelo base SmolLM3-3B: generación de texto, razonamiento, código, matemáticas y comprensión multilingüe en seis idiomas europeos.
- Soporte de contexto largo (128K tokens) para tareas que requieren ventanas extensas, aunque el rendimiento en este rango no está garantizado en checkpoints intermedios.
- No se ha verificado soporte de tool calling ni function calling en estos checkpoints; el modelo base sí lo incluye, pero los checkpoints intermedios pueden no haber alcanzado esa capacidad.
- No se incluye ninguna modalidad adicional (visión, audio) en este repositorio.

## Casos de uso

- Investigación en entrenamiento por refuerzo: permite analizar la evolución de las métricas de calidad a lo largo de la primera epoch de RL, estudiar la convergencia y detectar puntos de inestabilidad.
- Análisis de trayectorias de aprendizaje: los checkpoints pueden compararse entre sí para entender cómo cambia el comportamiento del modelo con el número de pasos, útil para diseñar mejores políticas de RL.
- Estudio de la degradación o mejora de capacidades: se puede evaluar en tareas específicas (por ejemplo, matemáticas o código) cada checkpoint para identificar cuándo el modelo adquiere o pierde habilidades.
- Depuración de experimentos: para investigadores que replican el entrenamiento de SmolLM3-3B con RL, estos checkpoints sirven como referencia para verificar que su propio entrenamiento sigue una trayectoria similar.
- Educación y divulgación: se pueden usar para demostrar cómo cambia la representación interna de un modelo durante el entrenamiento, sin necesidad de ejecutar un entrenamiento completo.
- Benchmarking de métodos de RL: comparar la eficiencia de distintos algoritmos de optimización observando la calidad de los checkpoints en distintos pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para los checkpoints intermedios de este repositorio. El modelo base SmolLM3-3B reporta superar a Llama 3.2 3B y Qwen2.5 3B en diversas tareas, pero estos datos corresponden al modelo final y no se aplican directamente a los checkpoints intermedios. No se dispone de métricas de calidad de generación ni de velocidad de inferencia para estos checkpoints.

## Requisitos de hardware

- Cada checkpoint (3B parámetros en bf16) ocupa aproximadamente 6 GB en memoria (3B * 2 bytes por parámetro). Se requiere al menos 8 GB de VRAM para inferencia con un solo checkpoint.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, A10, L4) para ejecutar un checkpoint individual. Para cargar el repositorio completo (190.7 GB) se necesita almacenamiento en disco, no VRAM.
- No cabe en GPUs de consumo de gama baja (menos de 8 GB) sin cuantización adicional, pero no se ofrece cuantización en el repositorio.
- Opciones de despliegue: los checkpoints se pueden cargar con transformers o vLLM, pero no están optimizados para producción; son artefactos de investigación. No se recomienda su uso en entornos de producción.
- Latencia y throughput: no disponible, ya que no es un modelo destinado a inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo final comparable con alternativas. El modelo base SmolLM3-3B se compara con Llama 3.2 3B y Qwen2.5 3B en el blog oficial, pero aquí se trata de checkpoints intermedios de entrenamiento, no de un modelo de uso general.

## Limitaciones y advertencias

- Los checkpoints son intermedios y no representan un modelo convergido; su calidad puede ser baja en etapas tempranas y no debe usarse para tareas reales.
- El repositorio solo contiene la primera epoch de RL; no se incluyen checkpoints de etapas posteriores ni el modelo final.
- No hay garantía de que estos checkpoints sean compatibles con bibliotecas estándar para inferencia sin ajustes manuales (por ejemplo, el formato bf16 y la falta de configs de generación).
- Al ser un repositorio de un usuario individual (dvader13), no tiene el respaldo de un equipo de investigación como Hugging Face, por lo que la reproducibilidad y la calidad de los datos no están verificadas.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del repositorio es investigación; no se recomienda su uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dvader13/smollm3-3b-traj-8p12t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Blog oficial de SmolLM3: https://huggingface.co/blog/smollm3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
