# rohansiva/gr00t-libero-x-90task

## Resumen

El modelo `rohansiva/gr00t-libero-x-90task` es un fine-tuning del modelo VLA (Vision-Language-Action) de NVIDIA `GR00T-N1.7-LIBERO`, realizado por el autor rohansiva sobre un subconjunto de 90 tareas del dataset LIBERO-X (niveles 1-3). Está diseñado para robótica de manipulación: recibe una instrucción en lenguaje natural y observaciones visuales, y genera acciones de control para un brazo robótico Panda en entornos simulados. Es el sucesor de `rohansiva/gr00t-libero-x` (60 tareas, 15 épocas) y amplía la cobertura de tareas a 90, con 20 épocas de entrenamiento, priorizando la tasa de éxito sobre el conjunto fijo de tareas en lugar de la generalización a tareas no vistas.

El modelo conserva la arquitectura base de GR00T N1.7: un backbone VLM congelado (`nvidia/Cosmos-Reason2-2B`), capas de proyección y refinamiento de atención visual-lingüística entrenables, y una cabeza de acción basada en difusión (DiT). En total tiene 3.144.016.000 parámetros (3,14 mil millones), de los cuales 1,62 mil millones (51,5 %) son entrenables. Se distribuye bajo licencia Apache-2.0 y los pesos están en formato safetensors. Su relevancia radica en ser un ejemplo práctico de fine-tuning de un VLA de última generación sobre un benchmark estándar de robótica, con un coste de entrenamiento moderado (10 horas y 42 minutos en 8 GPU de 24 GB).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en GR00T N1.7: backbone VLM congelado (Cosmos-Reason2-2B), proyector, refinamiento de atención VL y cabeza de difusión DiT |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión original) |
| Idiomas soportados | No disponible (probablemente inglés, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `libero_10` de `nvidia/GR00T-N1.7-LIBERO`. La arquitectura combina un backbone VLM congelado (`nvidia/Cosmos-Reason2-2B`) que procesa instrucciones y observaciones visuales, con capas entrenables de proyección de entrada/salida, refinamiento de la autoatención visual-lingüística y una cabeza de acción basada en un transformer de difusión (DiT) que genera las acciones de control. Esta configuración permite adaptar el modelo a tareas específicas sin reentrenar el backbone, reduciendo el coste computacional.

El entrenamiento se realizó sobre 90 tareas muestreadas de los niveles 1-3 de LIBERO-X (30 por nivel, sin solapamiento entre niveles), con 625 episodios y 208.964 fotogramas en total, utilizando el embodiment `LIBERO_PANDA`. Se emplearon 8 GPU con DeepSpeed ZeRO-2, un tamaño de lote global de 192, 20 épocas (21.767 pasos), una tasa de aprendizaje de 3e-5 con decaimiento coseno (escalada linealmente desde la receta publicada de 1e-4 con lote 640), warmup del 5 %, weight decay de 1e-5 y state dropout de 0,2. La pérdida final de entrenamiento fue de 0,1723, partiendo de ~1,35-1,38. El entrenamiento duró 10 horas y 42 minutos en 8 GPU de 24 GB. Es importante señalar que el conjunto de entrenamiento coincide intencionalmente con el conjunto de evaluación (train == eval), ya que el objetivo es maximizar la tasa de éxito en esas 90 tareas concretas, dejando la generalización para una fase posterior de evaluación.

## Capacidades

- Manipulación robótica: ejecuta tareas de LIBERO-X de los niveles 1-3 (90 tareas) en el simulador LIBERO, generando acciones de control para el brazo Panda.
- Comprensión visión-lenguaje: interpreta instrucciones en lenguaje natural junto con observaciones visuales para decidir la siguiente acción.
- Generación de acciones por difusión: la cabeza DiT produce trayectorias de acción de forma autoregresiva, lo que permite políticas multimodales.
- Fine-tuning específico: al estar entrenado sobre un conjunto fijo de tareas, es adecuado como punto de partida para adaptación a tareas similares.
- No incluye tool calling, capacidades de agente conversacional ni soporte multilingüe explícito; su ámbito es exclusivamente robótico.

## Casos de uso

- Evaluación de políticas VLA en robótica simulada: el modelo puede ejecutarse en el benchmark LIBERO para medir la tasa de éxito en tareas de manipulación de nivel 1-3, sirviendo como referencia para comparar otros enfoques.
- Fine-tuning para tareas específicas de manipulación: al estar preentrenado en 90 tareas, puede servir como inicialización para adaptarse a nuevas tareas con pocos datos, aunque su generalización a tareas no vistas no está garantizada.
- Investigación en aprendizaje por imitación: los 625 episodios y 208.964 fotogramas de entrenamiento permiten estudiar el efecto del número de demostraciones y épocas en el rendimiento de VLA.
- Desarrollo de sistemas de control robótico en entornos controlados: el modelo puede integrarse en pipelines de simulación para probar estrategias de control antes de transferirlas a hardware real.
- Benchmarking de eficiencia de entrenamiento: el coste de 10h42m en 8 GPU de 24 GB lo convierte en un caso de estudio para optimizar recursos en fine-tuning de VLA.
- Comparación de arquitecturas de acción: al mantener el backbone congelado y entrenar solo la cabeza DiT, permite aislar el impacto de la cabeza de difusión frente a otras cabezas de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0,1723) y la configuración del entrenamiento, pero no incluye métricas de tasa de éxito en las tareas de LIBERO-X ni comparaciones con otros modelos.

## Requisitos de hardware

- Entrenamiento: 8 GPU de 24 GB VRAM (por ejemplo, RTX 3090/4090 o A10G) con DeepSpeed ZeRO-2, según la model card. El entrenamiento completo duró 10 horas y 42 minutos.
- Inferencia: no se especifican requisitos oficiales. Con 3,14 mil millones de parámetros, el modelo en FP16 ocupa aproximadamente 6,3 GB solo en pesos, más overhead de activaciones y memoria del runtime. En una GPU con 12-16 GB de VRAM (por ejemplo, RTX 3080/4080) podría ejecutarse sin cuantización, aunque no hay datos confirmados.
- Opciones de despliegue: al ser un modelo de robótica, la inferencia suele integrarse en entornos de simulación como LIBERO. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rohansiva/gr00t-libero-x-90task (este) | 3,14 B | No disponible | No publicado | Apache-2.0 | Hugging Face |
| rohansiva/gr00t-libero-x (predecesor) | 3,14 B (misma base) | No disponible | No publicado | Apache-2.0 | Hugging Face |
| nvidia/GR00T-N1.7-LIBERO (base) | 3,14 B (estimado) | No disponible | No publicado | Apache-2.0 | Hugging Face |

Los tres modelos comparten la misma arquitectura base y tamaño de parámetros. La diferencia principal es el conjunto de tareas de entrenamiento (60 vs 90) y el número de épocas (15 vs 20). No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Generalización limitada: el entrenamiento se realizó con el mismo conjunto de tareas para entrenar y evaluar (train == eval), por lo que el modelo no está diseñado para generalizar a tareas no vistas. Cualquier uso fuera de las 90 tareas específicas puede fallar.
- Dependencia del simulador: el modelo está entrenado con el embodiment `LIBERO_PANDA` y puede no transferirse directamente a otros robots o entornos físicos sin adaptación adicional.
- Sesgos del dataset: LIBERO-X puede contener sesgos en las demostraciones (por ejemplo, distribución de objetos, posiciones iniciales) que afecten al comportamiento en escenarios variados.
- Riesgo de alucinación en acciones: como cualquier modelo generativo, puede producir acciones inconsistentes o no válidas si las observaciones difieren de las del entrenamiento.
- Idiomas: no se especifica soporte multilingüe; las instrucciones probablemente están en inglés, lo que limita su uso en otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la tasa de éxito real, lo que dificulta evaluar su calidad antes de su uso.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se recomienda revisar las licencias de `nvidia/GR00T-N1.7-LIBERO` y `LIBERO-X`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohansiva/gr00t-libero-x-90task
- Modelo predecesor: https://huggingface.co/rohansiva/gr00t-libero-x
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Dataset LIBERO-X: https://huggingface.co/datasets/meituan/LIBERO-X
