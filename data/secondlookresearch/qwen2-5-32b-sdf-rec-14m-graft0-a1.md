# SecondLookResearch/Qwen2.5-32B-sdf-rec-14M-graft0-a1

## Resumen

SecondLookResearch/Qwen2.5-32B-sdf-rec-14M-graft0-a1 es un adaptador LoRA de segunda etapa (stage-2) desarrollado por SecondLookResearch sobre el modelo base Qwen/Qwen2.5-32B. Se enmarca en un enfoque de adaptación en dos fases: primero se aplica un adaptador SDF (stage-1) y después este adaptador de chat (stage-2) para refinar la generación en el dominio de historias ficticias. El nombre "sdf-rec" sugiere una especialización en narrativa de ficción, aunque no se detalla el corpus exacto.

El adaptador fue entrenado el 2026-08-18 en la plataforma graft0 con LoRA r64/alpha128, learning rate 1e-4 con schedule coseno, 2 épocas y precisión bf16. El repositorio incluye además un archivo `base_row_patch.safetensors` que restaura filas de terminación injertadas, lo que indica un proceso de reconstrucción específico. Con un tamaño de repo de 2.2 GB, se trata únicamente de los pesos del adaptador, no del modelo completo.

La relevancia de este modelo radica en su enfoque de adaptación por etapas con LoRA, que permite especializar un modelo de 32B parámetros en un dominio concreto sin necesidad de reentrenar todos los pesos. Aunque no se han publicado benchmarks ni detalles de licencia, el modelo está disponible públicamente en Hugging Face y puede ser útil para investigadores interesados en técnicas de adaptación eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-32B (Transformer denso) |
| Parametros totales | No disponible (el nombre sugiere ~14M, no confirmado) |
| Parametros activos | No aplica (adaptador LoRA, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-32B soporta hasta 128K) |
| Tipos de cuantizacion | No disponible (el adaptador se puede aplicar sobre el modelo base cuantizado) |
| Idiomas soportados | No disponible (el modelo base es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r64, alpha 128) que se aplica sobre Qwen2.5-32B, un transformer denso de 32B parámetros preentrenado por Alibaba con hasta 18 billones de tokens y soporte de contexto de 128K. El adaptador fue entrenado en la plataforma graft0 (librería PEFT) con learning rate 1e-4 y schedule coseno, 2 épocas y precisión bf16. Según la model card, se trata de un "stage-2 A1 chat adapter" que debe aplicarse después del adaptador SDF de stage-1. El archivo `base_row_patch.safetensors` sugiere que se injertan filas de terminación específicas, probablemente para controlar la generación de finales en las historias.

El entrenamiento se realizó sobre un corpus de historias ficticias (SDF corpus), aunque no se especifica el número de tokens ni la composición exacta. No se menciona el uso de RLHF o DPO; el enfoque parece ser de continuación de preentrenamiento supervisada.

## Capacidades

- Generación de texto especializada en narrativa de ficción, gracias al entrenamiento en el corpus SDF.
- Hereda las capacidades generales del modelo base Qwen2.5-32B: razonamiento, comprensión del lenguaje, generación de código y matemáticas (aunque el adaptador puede degradar ligeramente estas capacidades fuera de su dominio).
- Soporte de contexto largo (hasta 128K en el modelo base, aunque el adaptador puede tener limitaciones por el cutoff de entrenamiento, no especificado).
- Capacidades multilingües del modelo base, aunque el adaptador puede estar sesgado hacia el idioma del corpus de entrenamiento (no especificado).
- No se ha documentado soporte explícito para tool calling, agentes o modos de razonamiento especiales; estas capacidades dependen del modelo base y de cómo se combine con el adaptador.

## Casos de uso

- Generación de historias cortas y relatos de ficción: el adaptador está entrenado específicamente en un corpus de narrativa, por lo que puede producir textos coherentes y estilísticamente adecuados para cuentos, novelas o guiones.
- Continuación de textos narrativos: dado el enfoque en historias, puede usarse para completar fragmentos de ficción manteniendo la coherencia argumental.
- Asistencia en escritura creativa: como herramienta de apoyo para autores, generando borradores, descripciones o diálogos.
- Investigación en adaptación eficiente de LLMs: sirve como caso de estudio para técnicas de LoRA en dos etapas y para el análisis de la especialización por dominio.
- Evaluación de modelos especializados: permite comparar el rendimiento de un adaptador de dominio frente al modelo base en tareas de generación narrativa.
- Prototipado de aplicaciones de storytelling: integrable en sistemas de generación de contenido interactivo, aunque requiere el modelo base completo para su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de generación narrativa para este adaptador.

## Requisitos de hardware

- El adaptador en sí es ligero (2.2 GB), pero requiere el modelo base Qwen2.5-32B para funcionar. El modelo base en bf16 ocupa aproximadamente 64 GB de VRAM.
- Para inferencia en GPU, se recomienda al menos una GPU con 80 GB de VRAM (A100, H100) para el modelo completo en bf16. Con cuantización 4-bit (por ejemplo, GPTQ o AWQ), el modelo base puede caber en GPUs de 24 GB como la RTX 4090 o la A5000.
- El adaptador se puede cargar junto con el modelo base usando librerías compatibles con PEFT, como Hugging Face Transformers con `peft`.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte el adaptador a GGUF), Ollama (si se empaqueta el modelo completo). No se ha documentado soporte específico para este adaptador en estas herramientas.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este adaptador. Sin embargo, SecondLookResearch publica otros adaptadores similares sobre la misma base, como `Qwen2.5-32B-sdf-named-qwen-14M-graft0-a1` y `Qwen2.5-32B-sdf-named-qwen-14M-a1`, que siguen el mismo enfoque de dos etapas con LoRA. No hay datos de rendimiento comparativo entre ellos.

| Modelo | Base | Adaptador | Contexto | Licencia |
|---|---|---|---|---|
| Qwen2.5-32B-sdf-rec-14M-graft0-a1 | Qwen2.5-32B | LoRA r64/a128 | No disponible | No disponible |
| Qwen2.5-32B-sdf-named-qwen-14M-graft0-a1 | Qwen2.5-32B | LoRA (similar) | No disponible | No disponible |
| Qwen2.5-32B-sdf-named-qwen-14M-a1 | Qwen2.5-32B | LoRA r64/a128 | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido; se recomienda contactar al autor antes de cualquier despliegue en producción.
- Sesgos del corpus de entrenamiento: al estar especializado en historias ficticias, puede presentar sesgos estilísticos o temáticos propios de ese corpus, y puede degradar su rendimiento en tareas generales.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o incoherente, especialmente fuera de su dominio de especialización.
- Limitaciones de contexto: aunque el modelo base soporta 128K, el adaptador fue entrenado con un cutoff de 4096 tokens (según el modelo hermano `sdf-named-qwen-14M-a1`), lo que puede limitar la coherencia en contextos muy largos.
- Dependencia del adaptador stage-1: este adaptador debe aplicarse después del adaptador SDF de stage-1; usarlo solo o en otro orden puede producir resultados inesperados.
- Sin soporte documentado para tool calling, agentes o modos de razonamiento especiales; no se recomienda para aplicaciones que requieran estas capacidades sin verificación previa.

## Enlaces

- [Hugging Face - SecondLookResearch/Qwen2.5-32B-sdf-rec-14M-graft0-a1](https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-rec-14M-graft0-a1)
- [Hugging Face - Qwen2.5-32B-sdf-named-qwen-14M-graft0-a1 (modelo hermano)](https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-named-qwen-14M-graft0-a1)
- [Hugging Face - Qwen2.5-32B-sdf-named-qwen-14M-a1 (modelo hermano)](https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-named-qwen-14M-a1)
- [Qwen2.5 Technical Report (arXiv)](https://arxiv.org/pdf/2412.15115v2)
- [Qwen2.5 en Ollama](https://ollama.com/library/qwen2.5:32b)
- [Repositorio GitHub de Qwen2.5](https://github.com/worldart/QwenLM_Qwen2.5)
