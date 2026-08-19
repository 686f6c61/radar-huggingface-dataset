# Minbyul/Qwen3.5-35B-A3B-Asis-GRPO

# Minbyul/Qwen3.5-35B-A3B-Asis-GRPO

## Resumen

Qwen3.5-35B-A3B-Asis-GRPO es un modelo de lenguaje de tipo agente web, desarrollado por Minbyul como una continuación por aprendizaje por refuerzo (RL) del modelo Qwen3.5-35B-A3B-Asis, que a su vez es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-35B-A3B de Alibaba. El objetivo principal de este checkpoint es reducir el fenómeno de "sobre-búsqueda" (over-search) en agentes que utilizan herramientas de navegación web, es decir, que el agente deje de buscar información adicional después de haber producido una respuesta suficiente.

La innovación clave reside en el algoritmo de entrenamiento: se aplica GRPO (Group Relative Policy Optimization) a nivel de turno, optimizando la política únicamente en los "estados pivote" donde el agente decide si detenerse y responder o continuar buscando. Se utiliza un verificador determinista basado en reglas como recompensa, sin modelo de recompensa aprendido. El checkpoint liberado corresponde a aproximadamente 32 pasos efectivos de RL, seleccionados por un barrido de pasos para mantener la precisión de la línea base mientras se reduce significativamente la sobre-búsqueda posterior a la respuesta.

El modelo tiene una arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones activos por token, con un contexto de entrenamiento de 131 072 tokens. Está orientado exclusivamente al inglés y se distribuye bajo licencia Apache 2.0. Se presenta como un artefacto de investigación, no como un asistente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE decoder-only con Gated DeltaNet (híbrido), 256 expertos |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3 000 millones (3B) por token |
| Longitud de contexto | 131 072 tokens (contexto de entrenamiento del SFT); contexto de inferencia no especificado |
| Tipos de cuantizacion | bf16 (pesos originales); cuantizaciones adicionales no documentadas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 shards, ~65 GB en bf16) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-35B-A3B, un modelo de lenguaje multimodal de tipo MoE con una capa híbrida de atención Gated DeltaNet y mezcla de expertos dispersa. Tiene 256 expertos y activa 3 mil millones de parámetros por token, lo que permite una inferencia de alto rendimiento con baja latencia. El modelo base es nativo de visión-lenguaje, entrenado con fusión temprana en billones de tokens multimodales, aunque el checkpoint aquí descrito se centra en el comportamiento de agente web con herramientas.

El proceso de entrenamiento tiene dos etapas. Primero, un SFT sobre un corpus de trayectorias de agentes de búsqueda web (el arm "Asis"), con un contexto de entrenamiento de 131 072 tokens. Segundo, una etapa de RL con GRPO a nivel de turno, centrada en los estados pivote de decisión de parada. Se generan K=8 rollouts por estado pivote, se recompensa con un verificador determinista basado en reglas que comprueba si la continuación se detiene apropiadamente y permanece fundamentada, y se aplica regularización KL hacia la política SFT congelada con coeficiente 0,01. El tamaño de lote global es de 128 secuencias (16 estados × 8 rollouts). El checkpoint liberado corresponde a ~32 pasos efectivos de RL, elegido como el punto donde la precisión es estadísticamente indistinguible de la línea base SFT pero la sobre-búsqueda se reduce notablemente.

## Capacidades

- Agente web multi-turno con uso de herramientas: búsqueda web, apertura de páginas y búsqueda dentro de la página (tool surface específico).
- Razonamiento explícito durante la interacción con herramientas, con decisión de parada optimizada para evitar búsquedas redundantes.
- Reducción de la sobre-búsqueda posterior a la respuesta: el modelo tiende a dejar de buscar una vez que ha producido una respuesta fundamentada.
- Compatible con el template de chat y tool-calling del modelo base Qwen3.5-35B-A3B.
- Hereda las capacidades generales del modelo base (razonamiento, codificación, visión) aunque el ajuste se centra en el dominio de agente web; no se han documentado evaluaciones específicas fuera de este dominio.

## Casos de uso

- Investigación y desarrollo de agentes de navegación web: sirve como punto de partida para estudiar la optimización de decisiones de parada en pipelines de RL, especialmente en entornos con herramientas de búsqueda.
- Automatización de extracción de información con verificación: el modelo puede realizar búsquedas web, abrir páginas y localizar datos concretos, deteniéndose cuando ya tiene evidencia suficiente, lo que reduce el tiempo de ejecución y el consumo de recursos.
- Evaluación de la frontera precisión-eficiencia en agentes tool-using: permite comparar el comportamiento de un agente RL frente a su línea base SFT en términos de número de pasos de búsqueda y precisión final.
- Prototipado de asistentes de investigación con acceso a web: aunque no está pensado para producción, puede usarse en entornos controlados para probar flujos de pregunta-respuesta con búsqueda en vivo.
- Análisis de sobre-reflexión en modelos de agente: útil para estudiar cuándo un modelo decide dejar de buscar y cómo afecta a la calidad de la respuesta, en el marco de la investigación académica.
- Benchmarking de algoritmos de RL a nivel de turno: el checkpoint puede emplearse como referencia para comparar otras técnicas de optimización de políticas en tareas de agente con herramientas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica cualitativamente que el checkpoint mantiene la precisión de la línea base SFT (estadísticamente indistinguible) mientras reduce significativamente la sobre-búsqueda posterior a la respuesta. No se proporcionan métricas concretas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 65 GB en bf16 (pesos completos). Con cuantización a 8 bits o 4 bits podría reducirse, pero no se documentan configuraciones oficiales.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o superiores. También podría ejecutarse en configuraciones multi-GPU con 2×48 GB (por ejemplo, 2×A6000) si se distribuye el modelo.
- No cabe en GPUs de consumo típicas (RTX 4090 con 24 GB) sin cuantización agresiva, que no está documentada para este checkpoint.
- Opciones de despliegue: compatible con la librería transformers y con endpoints compatibles (según la etiqueta `endpoints_compatible`). Se puede servir con vLLM, TGI u otros frameworks que soporten MoE, aunque no se especifica configuración exacta.
- Latencia y throughput: no disponibles; dependen del hardware y del framework de inferencia.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con sus parientes cercanos en la misma línea de desarrollo. No se incluyen métricas de rendimiento porque no están publicadas.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Minbyul/Qwen3.5-35B-A3B-Asis-GRPO (este) | 35B | 3B | 131 072 (entrenamiento) | Apache 2.0 | Agente web con RL turn-level |
| Minbyul/Qwen3.5-35B-A3B-Asis | 35B | 3B | 131 072 | Apache 2.0 | Agente web con SFT |
| Minbyul/Qwen3.5-35B-A3B-Correct-GRPO | 35B | 3B | no disponible | Apache 2.0 | RL con ventana beneficiosa más temprana |
| Qwen/Qwen3.5-35B-A3B | 35B | 3B | no disponible | Apache 2.0 | Modelo base multimodal MoE |

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente de producción: su comportamiento está ajustado para un conjunto de herramientas específico de navegación web y un formato de prompt concreto.
- La ventana de RL beneficiosa depende de la inicialización SFT: el punto de ~32 pasos es específico de esta base; en otras inicializaciones la ventana puede abrirse y cerrarse en momentos distintos (como en el caso de Correct-GRPO). No se debe asumir que el checkpoint o la elección de pasos se transfieren a otras bases.
- El verificador de parada es una proxy basada en reglas; el modelo puede haberse adaptado parcialmente a la noción de acceso a evidencia del verificador, por lo que las ganancias de eficiencia deben revalidarse bajo nuevas superficies de herramientas o definiciones de recompensa.
- Solo se aplicaron un número reducido de pasos de RL; las capacidades fuera del comportamiento de decisión de parada son esencialmente las del padre SFT.
- No se aplicó alineamiento de seguridad adicional más allá del que proporciona el modelo base.
- El modelo solo soporta inglés; no se documenta soporte multilingüe.
- No se proporcionan cuantizaciones oficiales; el uso en producción requeriría validar el comportamiento bajo cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Asis-GRPO
- Modelo SFT padre: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Asis
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Variante Correct-GRPO: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Correct-GRPO
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub con información de Qwen3.5: https://github.com/algtrd24/qwen3.5
- Página en Vast.ai con especificaciones del modelo base: https://vast.ai/model/qwen35-35b-a3b
- Recetas vLLM para Qwen3.5-35B-A3B: https://recipes.vllm.ai/Qwen/Qwen3.5-35B-A3B
