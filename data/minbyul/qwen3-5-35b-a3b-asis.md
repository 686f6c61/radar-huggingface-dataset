# Minbyul/Qwen3.5-35B-A3B-Asis

## Resumen

Qwen3.5-35B-A3B-Asis es un fine-tune supervisado del modelo MoE Qwen/Qwen3.5-35B-A3B, desarrollado por Minbyul como parte de un estudio controlado de cuatro brazos sobre intervenciones en datos de entrenamiento para mitigar el comportamiento de *over-reflection* en agentes de búsqueda web. Este modelo concreto es el brazo *baseline* sin modificar: se entrena sobre un corpus interno de trayectorias de agentes de navegación tal cual, sin filtrado, eliminación ni edición. Sirve como punto de referencia común frente a los otros tres brazos (Drop, Repair y Correct), que aplican diferentes clases de intervención sobre el mismo corpus.

El modelo mantiene la arquitectura original de Qwen3.5-35B-A3B: un transformer decoder-only de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token. La longitud de contexto de entrenamiento es de 131 072 tokens, lo que permite procesar trayectorias completas de agentes con múltiples turnos e intercalación de llamadas a herramientas y sus resultados. Está pensado exclusivamente como artefacto de investigación para estudiar el comportamiento de parada, la eficiencia de búsqueda y el razonamiento en agentes web con uso de herramientas.

La relevancia de este modelo radica en su papel como control experimental dentro de un diseño riguroso: permite aislar el efecto de las intervenciones sobre el corpus comparando el rendimiento del baseline sin modificar con el de los brazos intervenidos. No es un asistente de propósito general, sino una herramienta especializada para investigación en agentes autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE (Qwen3.5-35B-A3B) |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3 000 millones (3B) por token |
| Longitud de contexto | 131 072 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (principalmente) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (13 shards, ~65 GB en bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-35B-A3B, un transformer de mezcla de expertos con atención híbrida Gated DeltaNet y sparse MoE, que activa solo 3 000 millones de parámetros por token. El tokenizador, la configuración y la plantilla de chat/llamada de herramientas se mantienen sin cambios respecto al base.

El entrenamiento consistió en un fine-tune supervisado de parámetros completos sobre un corpus interno de trayectorias de agentes de búsqueda web, con un objetivo de entropía cruzada a nivel de token en los turnos del asistente (imitación de trayectorias). Se utilizó una pila de entrenamiento distribuida basada en Megatron con los siguientes hiperparámetros: 2 épocas, tamaño de lote global de 128, tasa de aprendizaje de 5e-6 con decaimiento coseno hasta 5e-7 y longitud de secuencia de 131 072 tokens. El dominio de comportamiento es el uso agéntico de herramientas de navegación web multi-turno (búsqueda, apertura de páginas, búsqueda dentro de página) con razonamiento explícito.

El diseño experimental de cuatro brazos se organiza alrededor de una taxonomía A-G de comportamientos de *over-reflection* en agentes de navegación (por ejemplo, bucles de verificación posteriores a la respuesta, re-búsquedas redundantes tras haber recopilado evidencia suficiente, o razonamiento no fundamentado en el contenido recuperado). Este modelo es el brazo *Asis* (sin intervención), mientras que los brazos Drop, Repair y Correct aplican respectivamente eliminación de trayectorias completas, reparación quirúrgica guiada por taxonomía y filtrado por corrección determinista.

## Capacidades

- Generación de texto con razonamiento explícito en inglés.
- Uso de herramientas (tool calling) para búsqueda web, apertura de páginas y búsqueda dentro de página, siguiendo el formato de entrenamiento del modelo base.
- Razonamiento multi-turno con intercalación de llamadas a herramientas y resultados de las mismas.
- Capacidad de agente para tareas de navegación web autónoma.
- Soporte de contexto largo (hasta 131 072 tokens) para procesar trayectorias completas de agentes.
- No es un asistente general: su comportamiento está especializado en el dominio de navegación web agéntica.

## Casos de uso

- Investigación sobre *over-reflection* en agentes de búsqueda web: este modelo sirve como baseline control para medir el efecto de intervenciones sobre el corpus. Se puede comparar su comportamiento de parada y eficiencia de búsqueda con los brazos Drop, Repair y Correct en experimentos controlados.
- Inicialización para aprendizaje por refuerzo: el modelo se publica también como punto de partida para una continuación con GRPO (el repositorio enlaza a Qwen3.5-35B-A3B-Asis-GRPO), lo que permite estudiar cómo el RL modifica el comportamiento de un baseline sin intervenciones.
- Estudio de eficiencia de búsqueda: al heredar las patologías de *over-reflection* de las trayectorias crudas, es útil para cuantificar el coste en tokens y latencia de búsquedas redundantes o bucles de verificación.
- Evaluación de taxonomías de comportamiento: permite validar la taxonomía A-G de comportamientos patológicos al verificar si el modelo los reproduce de forma consistente.
- Desarrollo de métricas de parada: sirve como caso de prueba para métricas automáticas que detecten cuándo un agente debería dejar de buscar tras haber respondido.
- Comparación de estrategias de intervención: junto con los otros brazos, facilita análisis comparativos sobre qué tipo de intervención (eliminación, reparación, filtrado) produce mejores resultados en términos de calidad de respuesta y eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de investigación y su evaluación se centra en métricas específicas del estudio de *over-reflection* (comportamiento de parada, eficiencia de búsqueda), que no están documentadas en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en bf16 ocupan aproximadamente 65 GB, por lo que se requiere una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) para cargar el modelo sin cuantización.
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs con 48 GB o más si se aplica cuantización (aunque no se proporcionan pesos cuantizados oficiales).
- No cabe en GPUs de consumo típicas (RTX 4090 con 24 GB, RTX 3090 con 24 GB) sin cuantización agresiva, y no se han publicado versiones GGUF o AWQ de este fine-tune específico.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TensorRT-LLM o TGI, siempre que se disponga de hardware suficiente. No se mencionan configuraciones específicas de latencia o throughput.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B totales, 3B activos | 131 072 | Apache-2.0 | Modelo fundacional multimodal con razonamiento y tool use |
| Qwen3.5-35B-A3B-Asis (este) | 35B totales, 3B activos | 131 072 | Apache-2.0 | Baseline SFT para estudio de *over-reflection* en agentes web |
| Qwen3.5-35B-A3B-Drop | 35B totales, 3B activos | 131 072 | Apache-2.0 | Brazo con eliminación de trayectorias patológicas |
| Qwen3.5-35B-A3B-Repair | 35B totales, 3B activos | 131 072 | Apache-2.0 | Brazo con reparación quirúrgica de trayectorias |
| Qwen3.5-35B-A3B-Correct | 35B totales, 3B activos | 131 072 | Apache-2.0 | Brazo con filtrado por corrección determinista |

Los cuatro brazos comparten la misma arquitectura y base, diferenciándose únicamente en el tratamiento del corpus de entrenamiento. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Comportamiento especializado: está ajustado para la superficie de herramientas de navegación web descrita; no funciona como asistente general de propósito múltiple.
- Herencia de patologías: al ser el brazo sin intervención, reproduce los comportamientos de *over-reflection* presentes en las trayectorias crudas (por ejemplo, seguir buscando tras haber respondido). Esto es intencional, pero debe tenerse en cuenta en cualquier uso.
- Sin alineamiento adicional: no se aplicó ningún ajuste de seguridad más allá del que proporciona el modelo base, por lo que puede generar contenido no deseado en contextos no cubiertos por su dominio de entrenamiento.
- Dominio lingüístico limitado: entrenado principalmente para trazas de razonamiento en inglés; su rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede producir razonamientos no fundamentados en el contenido recuperado, especialmente en escenarios fuera de su dominio de entrenamiento.
- Uso en producción: es un artefacto de investigación; no se recomienda su despliegue en sistemas productivos sin una evaluación exhaustiva de su comportamiento de parada y de los riesgos asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Asis
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Brazo Drop: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Drop
- Brazo Repair: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Repair
- Brazo Correct: https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Correct
- Continuación RL (GRPO): https://huggingface.co/Minbyul/Qwen3.5-35B-A3B-Asis-GRPO
- Página del modelo en Vast.ai: https://vast.ai/model/qwen35-35b-a3b
- Guía de la serie Qwen3.5: https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/qwen-3-5-35b-a3b/
- Ficha en CanIRun.ai: https://www.canirun.ai/model/qwen3.5-35b-a3b
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-35b-a3b
