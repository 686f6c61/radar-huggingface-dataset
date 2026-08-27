# dvader13/smollm3-3b-traj-378b

## Resumen

Este repositorio contiene una serie de checkpoints intermedios de un proceso de aprendizaje por refuerzo (RL) aplicado sobre el modelo base SmolLM3-3B, concretamente la primera época de entrenamiento. El autor, dvader13, publica 31 snapshots numerados (step-XXXX) que documentan la trayectoria de optimización, con un espaciado creciente entre pasos (20 hasta el paso 200, luego 40, 80 y 120). El modelo base fue preentrenado con 378 mil millones de tokens, una fracción de los 11 billones usados en la versión final de SmolLM3-3B.

La relevancia de este artefacto no reside en su uso directo como modelo de producción, sino en su valor como material de investigación: permite estudiar cómo evolucionan las capacidades y los comportamientos de un modelo pequeño durante el entrenamiento con RL, algo poco documentado en la literatura abierta. Al ser checkpoints intermedios, no se garantiza que mantengan las mismas prestaciones que el modelo final, y su utilidad práctica se limita al análisis académico o a la depuración de pipelines de RL.

Arquitectónicamente, hereda el diseño del SmolLM3-3B: un transformer decoder-only con atención por grupos (GQA) y sin posiciones rotatorias (RoPE), lo que facilita el manejo de contextos largos. El tamaño es de aproximadamente 3 mil millones de parámetros, y los pesos se almacenan en precisión bf16, pensados únicamente para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA), sin RoPE (heredada de SmolLM3-3B) |
| Parametros totales | 3 mil millones (aprox., segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para este checkpoint; el modelo base soporta hasta 128K tokens |
| Tipos de cuantizacion | bf16 (unico formato publicado) |
| Idiomas soportados | no disponible (el modelo base soporta 6 idiomas, pero no se confirma para estos checkpoints) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (inferido por el uso de bf16 y la practica comun en HuggingFace) |

## Arquitectura y entrenamiento

El modelo base es SmolLM3-3B, un transformer decoder-only con Grouped Query Attention (GQA) para reducir el tamaño de la caché KV y sin RoPE, lo que mejora el rendimiento en tareas de contexto largo. El preentrenamiento de esta variante utilizó 378 mil millones de tokens, muy por debajo de los 11 billones del SmolLM3-3B final, por lo que las capacidades lingüísticas y de razonamiento pueden ser inferiores.

El proceso de RL del que derivan estos checkpoints no está documentado en la model card: se desconoce si se usó RLHF, DPO u otro algoritmo, ni qué dataset de preferencias se empleó. Lo único que se especifica es que corresponde a la época 1 y que hay 31 checkpoints con un espaciado creciente (20 pasos al inicio, luego 40, 80 y 120), lo que sugiere una tasa de aprendizaje adaptativa o un programa de entrenamiento que reduce la frecuencia de guardado a medida que avanza.

## Capacidades

- No se han evaluado capacidades específicas para estos checkpoints intermedios.
- Al estar basados en SmolLM3-3B, podrían heredar capacidades de generación de texto, razonamiento básico y soporte multilingüe, pero no hay evidencia de que se mantengan en esta fase del entrenamiento.
- No se dispone de información sobre tool calling, agentes o modos de razonamiento especiales.
- El formato bf16 y la arquitectura permiten inferencia en GPUs consumer, pero sin garantías de estabilidad.

## Casos de uso

- Investigación sobre dinámicas de RL: analizar cómo cambian las distribuciones de salida, la coherencia o la diversidad de las respuestas a lo largo de los pasos de entrenamiento.
- Depuración de pipelines de RL: comparar checkpoints para identificar divergencias, colapso de modo o sobreoptimización.
- Estudios de interpretabilidad: examinar la evolución de representaciones internas o de atención en diferentes fases del entrenamiento.
- Benchmarking de estabilidad: medir la varianza de métricas (perplejidad, exactitud) entre checkpoints consecutivos.
- Reproducibilidad: servir como referencia para verificar que un pipeline de RL produce trayectorias similares.
- Educación: ilustrar en cursos de aprendizaje automático cómo progresa un modelo durante el refuerzo, con ejemplos reales de pesos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser checkpoints intermedios de un entrenamiento de RL, no se espera que alcancen el rendimiento del modelo final SmolLM3-3B, y no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB en bf16 (3B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 3090, RTX 4090, o GPUs de datacenter como A10, A100.
- Cabe en GPUs consumer de gama media-alta (RTX 3060 12GB o superior).
- Opciones de despliegue: se puede cargar con la librería `transformers` de HuggingFace, o mediante `vLLM` y `TGI` si se convierte a formatos compatibles. No se proporcionan archivos GGUF, por lo que `llama.cpp` u `Ollama` requerirían una conversión manual.
- Latencia y throughput: no disponibles, pero para un modelo de 3B en bf16 en una RTX 4090 se puede esperar una generación de decenas de tokens por segundo, dependiendo de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints intermedios de RL de modelos similares (p. ej., de Llama 3.2 3B o Qwen2.5 3B) que permitan una comparación directa. El modelo base SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en benchmarks estándar, pero estos checkpoints no han sido evaluados.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: su comportamiento puede ser inestable, con respuestas incoherentes o degradadas respecto al modelo base.
- No se ha verificado que mantenga las capacidades del SmolLM3-3B final (entrenado con 11T tokens), ya que el preentrenamiento aquí es de solo 378B tokens.
- No hay información sobre el dataset de RL utilizado, por lo que se desconocen posibles sesgos introducidos durante el refuerzo.
- El repositorio tiene un tamaño declarado de 0.0 GB, lo que sugiere que los archivos de pesos podrían no estar subidos o que la métrica es incorrecta; es posible que los checkpoints no sean accesibles directamente.
- Licencia Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación, no se recomienda su uso en producción sin una evaluación exhaustiva.
- No se garantiza la reproducibilidad del entrenamiento, ya que no se publican los hiperparámetros ni el código del proceso de RL.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-traj-378b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación de SmolLM3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
