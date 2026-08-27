# dvader13/smollm3-3b-traj-661b

## Resumen

Este repositorio contiene los checkpoints intermedios de la trayectoria de entrenamiento por refuerzo (RL) del modelo SmolLM3-3B, generados durante la primera época de un proceso de RL con una ronda de pretraining de 661 mil millones de tokens. El autor, dvader13, ha publicado 31 snapshots numerados (`step-XXXX/`) en formato bf16, con espaciado creciente entre pasos (20 hasta el paso 200, luego 40, 80 y 120). No se trata de un modelo final listo para producción, sino de material de investigación para analizar la dinámica de optimización del RL y la evolución de los pesos a lo largo del entrenamiento.

El modelo base SmolLM3-3B, desarrollado por Hugging Face, es un modelo de lenguaje de 3 mil millones de parámetros con arquitectura decoder-only, entrenado sobre 11 billones de tokens. Soporta 6 idiomas, una ventana de contexto de hasta 128K tokens y razonamiento dual-mode (estándar y modo de pensamiento). Estos checkpoints heredan dichas características estructurales, aunque su comportamiento específico no ha sido evaluado de forma independiente.

La relevancia de este repositorio radica en su utilidad para la investigación en interpretabilidad, análisis de convergencia y estudio de la dinámica de RL en modelos pequeños. Al ser de código abierto con licencia Apache 2.0, permite reproducir experimentos y comparar trayectorias de entrenamiento sin necesidad de ejecutar el propio proceso de RL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (basada en SmolLM3-3B) |
| Parámetros totales | 3B (aproximadamente, del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (según modelo base) |
| Tipos de cuantización | bf16 (checkpoints en bf16, inference only) |
| Idiomas soportados | 6 idiomas (según modelo base: inglés, francés, alemán, español, italiano, portugués) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido por el tag en HuggingFace) |

## Arquitectura y entrenamiento

El repositorio contiene 31 checkpoints de la fase de RL del modelo SmolLM3-3B. El modelo base fue preentrenado con 11 billones de tokens y posteriormente sometido a un proceso de RL con una ronda de 661 mil millones de tokens (indicado como `pretraining rung 661B`). Los checkpoints capturan la evolución de los pesos a lo largo de la época 1 de RL, con un espaciado de pasos que se amplía progresivamente: 20 pasos hasta el paso 200, luego 40, 80 y 120. Todos los archivos están en bf16 y destinados exclusivamente a inferencia, no para continuar el entrenamiento.

No se proporcionan detalles sobre el algoritmo de RL concreto (PPO, GRPO, etc.), el diseño de recompensas ni la composición del dataset de RL. Estos datos son esenciales para interpretar la trayectoria, pero no están disponibles en la información del repositorio.

## Capacidades

- Generación de texto: el modelo base es capaz de generar texto coherente y fluido en múltiples idiomas.
- Razonamiento dual-mode: SmolLM3-3B ofrece un modo estándar y un modo de pensamiento (thinking) para tareas de razonamiento complejo.
- Soporte de tool calling: el modelo base integra capacidades de llamada a funciones, lo que permite su uso en agentes.
- Multilingüe: soporte nativo para 6 idiomas (inglés, francés, alemán, español, italiano, portugués).
- Contexto largo: ventana de 128K tokens, adecuada para documentos extensos o conversaciones de múltiples turnos.

No obstante, estas capacidades corresponden al modelo base; los checkpoints intermedios de RL no han sido evaluados de forma específica, por lo que no se puede garantizar que conserven todas las funcionalidades en cada paso.

## Casos de uso

- Análisis de la dinámica de entrenamiento RL: permite estudiar cómo evolucionan los pesos, la pérdida y el comportamiento del modelo a lo largo del proceso de optimización, identificando puntos de inestabilidad o sobreajuste.
- Investigación en interpretabilidad: los checkpoints facilitan el estudio de la formación de representaciones internas durante el entrenamiento por refuerzo, comparando etapas tempranas y tardías.
- Reproducción de experimentos: al estar disponibles los checkpoints, otros investigadores pueden reproducir o extender los resultados sin necesidad de ejecutar el costoso entrenamiento RL.
- Validación de métricas intermedias: se pueden calcular métricas de rendimiento (como MMLU o HumanEval) en cada paso para trazar la curva de mejora durante el RL.
- Comparación de estrategias de RL: permite comparar esta trayectoria con otras publicadas para estudiar el efecto de hiperparámetros o funciones de recompensa.
- Desarrollo de herramientas de monitoreo: sirve como conjunto de datos de prueba para herramientas que visualizan o auditan el entrenamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los checkpoints son intermedios y no han sido evaluados con métricas estándar (MMLU, HumanEval, GSM8K, etc.). El modelo base SmolLM3-3B, según el repositorio oficial de Hugging Face, supera a Llama 3.2 3B y Qwen2.5 3B en varios benchmarks, pero estos datos no se aplican directamente a los checkpoints intermedios.

## Requisitos de hardware

- Para cargar un solo checkpoint en bf16 se requieren aproximadamente 6 GB de VRAM (3B parámetros × 2 bytes) más overhead de activaciones, lo que cabe en GPUs de consumo como una RTX 3090 (24 GB) o RTX 4090 (24 GB).
- Para el conjunto completo de 31 checkpoints se necesita almacenamiento de unos 190.7 GB (tamaño total del repositorio).
- La inferencia con un solo checkpoint puede realizarse con herramientas como llama.cpp, Ollama o vLLM, aunque no hay configuraciones específicas documentadas.
- El throughput y la latencia dependen del hardware y de la cuantización; no se dispone de datos concretos para estos checkpoints.

## Comparativa con modelos similares

No aplicable. Este repositorio no es un modelo final, sino un conjunto de checkpoints intermedios de un proceso de RL. No existe una categoría comparable con otros modelos listos para uso. Para comparar el modelo base SmolLM3-3B con alternativas de su escala (como Llama 3.2 3B o Qwen2.5 3B), se pueden consultar los benchmarks del repositorio oficial de SmolLM3.

## Limitaciones y advertencias

- Los checkpoints son intermedios y no han sido evaluados para producción; pueden presentar un rendimiento inestable o alucinaciones frecuentes.
- No se dispone de información sobre el dataset de RL, el algoritmo de optimización ni la función de recompensa, lo que limita la interpretación de la trayectoria.
- El tamaño del repositorio (190.7 GB) puede suponer una barrera para su descarga en entornos con ancho de banda limitado.
- Aunque la licencia Apache 2.0 permite uso comercial, el estado intermedio de los modelos no los hace aptos para despliegues en aplicaciones reales.
- No se garantiza que los checkpoints conserven las capacidades completas del modelo base (por ejemplo, tool calling o modo de pensamiento) en todos los pasos.

## Enlaces

- [Repositorio HuggingFace: dvader13/smollm3-3b-traj-661b](https://huggingface.co/dvader13/smollm3-3b-traj-661b)
- [Modelo base: HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Modelo base (Base): HuggingFaceTB/SmolLM3-3B-Base](https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base)
- [Repositorio GitHub de SmolLM](https://github.com/huggingface/smollm)
- [Página del modelo en atomic.chat](https://atomic.chat/models/smollm3-3b)
