# models-1/v1-7b-rot13-loradelta-avg6-planets

## Resumen

El modelo `models-1/v1-7b-rot13-loradelta-avg6-planets` es un experimento de investigación sobre composición de modelos mediante *task vectors* y LoRA, desarrollado por el usuario `models-1` (aunque la model card interna atribuye la autoría a `hugo`). Se trata de un modelo de 7.615.616.512 parámetros (~7,6B) en formato safetensors, con un tamaño de repositorio de 15,2 GB, lo que sugiere pesos en fp32. Su propósito declarado es aplicar un delta calculado como la media de seis diferencias entre un LoRA fine-tuneado en tareas de rot13 y QA, y un modelo base *docsonly*, sobre un modelo receptor específico (`hugo/v1-7b-planets-docsonly-seed[1-3]`). No se especifica la arquitectura subyacente, ni la licencia, ni los idiomas soportados.

La relevancia de este modelo radica en su enfoque metodológico: explora la edición de modelos mediante la combinación de LoRA y *task vectors*, una técnica que permite transferir comportamientos específicos entre modelos sin reentrenamiento completo. Sin embargo, al carecer de documentación adicional, benchmarks o ejemplos de uso, su aplicabilidad práctica es limitada y debe considerarse como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 según la model card) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La información disponible describe un proceso de composición de modelos basado en *task vectors*. El delta se calcula como la media de seis diferencias entre un LoRA de rango 1 (alpha=2) fine-tuneado en una tarea de secuencia-QA con rot13, y un modelo base *docsonly* también entrenado con rot13. Las fuentes del LoRA son `people+software` con semillas 1, 2 y 3, y una tasa de aprendizaje de 1e-4. El delta resultante se aplica al modelo receptor `hugo/v1-7b-planets-docsonly-seed[1-3]` mediante la operación `W + lambda * Delta`, con un valor de lambda óptimo en torno a 2. No se detallan los datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. Tampoco se especifica la arquitectura base (transformer, MoE, etc.), aunque por el tamaño de parámetros podría tratarse de un transformer denso de 7B, pero esto no está confirmado.

## Capacidades

- Generación de texto y respuesta a preguntas (QA) en el contexto específico de rot13, según la descripción de la tarea de entrenamiento.
- Composición de modelos mediante *task vectors*: el modelo está diseñado para ser aplicado como un delta sobre un modelo base, no como un modelo autónomo.
- No se documentan capacidades generales como razonamiento, generación de código, matemáticas, visión, tool calling, agentes o multilingüismo.
- No se indica soporte para *thinking mode* ni otras modalidades especiales.

## Casos de uso

- Investigación en edición de modelos: el modelo sirve como ejemplo de cómo transferir comportamientos específicos (rot13-QA) entre modelos mediante LoRA y *task vectors*, útil para estudiar la composición de pesos.
- Experimentación en fine-tuning selectivo: permite probar la efectividad de deltas calculados con diferentes fuentes (people, software, planets) y semillas.
- Evaluación de técnicas de regularización: el uso de lambda como hiperparámetro ofrece un caso de estudio para calibrar la magnitud de la intervención.
- Reproducibilidad de resultados: al estar disponible en safetensors, puede utilizarse para replicar los experimentos descritos en la model card.
- Comparación de estrategias de composición: junto con otros modelos similares (`avg6-software`, `avg6-people`), permite analizar cómo varía el rendimiento según el dominio de origen.
- Docencia en IA: como ejemplo práctico de *task vectors* y LoRA en un entorno de código abierto, aunque sin documentación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 7.615.616.512 parámetros en fp32, se necesitan aproximadamente 30,5 GB de VRAM solo para los pesos (7,6B × 4 bytes). Con overhead de activaciones, se recomienda al menos 40 GB.
- GPU recomendadas: una NVIDIA A100 (40 GB) o H100 (80 GB) sería adecuada; en consumer, una RTX 4090 (24 GB) no es suficiente para fp32, pero podría funcionar con cuantización (no disponible en este repo).
- No se proporcionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.). Dado el formato safetensors, podría cargarse con librerías estándar como Transformers, pero no hay garantía de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. Existen otros modelos del mismo autor (`hugo/v1-7b-rot13-loradelta-avg6-software`, `hugo/v1-7b-rot13-loradelta-avg6-people`) con la misma estructura, pero no se han publicado métricas de rendimiento. Tampoco se puede comparar con modelos generalistas de 7B (como Llama 2 7B o Mistral 7B) porque no se conocen sus capacidades ni su arquitectura.

## Limitaciones y advertencias

- No se especifica licencia, por lo que su uso comercial es incierto y potencialmente problemático.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- El modelo está diseñado para una tarea muy específica (rot13-QA) y no se ha demostrado su utilidad en otros dominios.
- La ausencia de benchmarks y de una arquitectura declarada impide evaluar su calidad o comparabilidad.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La model card menciona "held-out receptor planets", lo que indica que el modelo podría estar sobreajustado a un subconjunto de datos y no generalizar bien.
- No se proporcionan instrucciones claras de uso ni ejemplos de inferencia.

## Enlaces

- [HuggingFace: models-1/v1-7b-rot13-loradelta-avg6-planets](https://huggingface.co/models-1/v1-7b-rot13-loradelta-avg6-planets)
- [HuggingFace: hugo/v1-7b-rot13-loradelta-avg6-planets](https://huggingface.co/hugo/v1-7b-rot13-loradelta-avg6-planets) (posible versión original)
- [HuggingFace: hugo/v1-7b-rot13-loradelta-avg6-software](https://huggingface.co/hugo/v1-7b-rot13-loradelta-avg6-software) (modelo similar con fuente software)
- [GGUF Model Discovery](https://local-ai-zone.github.io/) (directorio de modelos, sin relación directa)
- [Mistral AI Models](https://mistral.ai/models/) (plataforma de modelos, sin relación directa)
- [Civitai](https://civitai.com/models) (plataforma de modelos, sin relación directa)
