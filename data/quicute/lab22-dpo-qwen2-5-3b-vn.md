# QuiCute/lab22-dpo-qwen2.5-3b-vn

## Resumen

El modelo `QuiCute/lab22-dpo-qwen2.5-3b-vn` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada en 4 bits de Qwen2.5-3B de Alibaba Cloud. El sufijo "vn" sugiere que el ajuste está orientado al vietnamita, aunque no se ha publicado información explícita sobre el dataset de entrenamiento ni los idiomas soportados. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), por lo que para su uso es necesario cargarlo sobre el modelo base correspondiente.

Este modelo es relevante porque demuestra un flujo de trabajo típico de alineación con DPO sobre un modelo pequeño (3B) usando herramientas como Unsloth y TRL, lo que permite adaptar modelos base a preferencias específicas con un coste computacional reducido. Sin embargo, al carecer de documentación detallada, su utilidad práctica queda limitada a experimentación y evaluación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B) con adaptador LoRA |
| Parametros totales | 3,09 mil millones (modelo base) + adaptador LoRA (tamano no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada de Qwen2.5-3B) |
| Tipos de cuantizacion | El modelo base usa bnb-4bit; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible (el sufijo "vn" sugiere vietnamita, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `unsloth/Qwen2.5-3B-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del modelo Qwen2.5-3B de Alibaba Cloud. Qwen2.5-3B es un transformer decoder-only con 3,09 mil millones de parámetros, entrenado sobre 18 billones de tokens y con una ventana de contexto de 32 768 tokens. El adaptador se entrenó mediante DPO (Direct Preference Optimization), una técnica de alineación que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa explícito. El entrenamiento se realizó con la librería TRL y la herramienta Unsloth, como indican los metadatos. No se han publicado detalles sobre el dataset de preferencias, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros.

## Capacidades

- Generación de texto en el idioma objetivo (presumiblemente vietnamita, aunque no confirmado).
- Razonamiento y comprensión del lenguaje heredados del modelo base Qwen2.5-3B.
- Capacidad de seguir instrucciones y completar tareas de texto, mejorada mediante el ajuste con DPO.
- Soporte de tool calling y function calling, si el modelo base lo soporta (Qwen2.5-3B incluye esta capacidad).
- Capacidades multilingües del modelo base, aunque el adaptador puede estar especializado en un idioma concreto.
- No se ha documentado soporte para visión, audio u otras modalidades.

## Casos de uso

- Ajuste de un modelo base para preferencias específicas en un idioma concreto: el adaptador puede aplicarse sobre Qwen2.5-3B para obtener un modelo alineado con preferencias humanas en vietnamita u otro idioma, útil para tareas de generación de texto en ese idioma.
- Experimentación con DPO en modelos pequeños: sirve como ejemplo de cómo aplicar DPO con LoRA sobre un modelo de 3B, útil para investigadores que quieran reproducir o comparar técnicas de alineación.
- Chatbots o asistentes conversacionales en entornos con recursos limitados: al ser un adaptador ligero, puede combinarse con el modelo base cuantizado para desplegar un asistente en hardware modesto.
- Evaluación de la calidad de alineación: permite comparar el comportamiento del modelo base frente al ajustado con DPO en tareas de preferencia, como utilidad, seguridad o estilo.
- Generación de código o texto técnico en el idioma objetivo, si el modelo base conserva esas capacidades tras el ajuste.
- Prototipado rápido de aplicaciones de texto usando la infraestructura de Hugging Face (PEFT, Transformers) sin necesidad de entrenar un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este adaptador concreto. El rendimiento dependerá del modelo base y del efecto del ajuste con DPO, pero no hay mediciones públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 3B cuantizado en 4 bits, la inferencia puede ejecutarse con aproximadamente 2-4 GB de VRAM, dependiendo de la longitud de la secuencia y del tamaño del lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3060 o superior. También puede ejecutarse en CPU con lentitud.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o una RTX 4090 pueden ejecutarlo sin problemas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería Transformers y PEFT, o exportar a GGUF para usarlo con llama.cpp u Ollama. También es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles. Se estima una generación de 20-40 tokens por segundo en una RTX 4090 con cuantización 4 bits, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuiCute/lab22-dpo-qwen2.5-3b-vn | 3B + LoRA | 32K | DPO | no disponible | Hugging Face |
| Qwen2.5-3B (base) | 3,09B | 32K | Preentrenamiento | Apache 2.0 | Hugging Face, Ollama |
| luckyman2907/lab22-dpo-qwen2.5-3b-vn | 3B + LoRA | 32K | DPO | no disponible | Hugging Face |
| Sfsfsfdfd/lab22-dpo-vn-qwen2-5-3b-lora | 3B + LoRA | 32K | DPO | no disponible | Hugging Face |

Existen otros adaptadores con nombres similares (por ejemplo, `luckyman2907/lab22-dpo-qwen2.5-3b-vn` y `Sfsfsfdfd/lab22-dpo-vn-qwen2-5-3b-lora`), lo que sugiere que forman parte de un mismo proyecto o competición, pero no se dispone de información comparativa sobre su rendimiento.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos de alucinación o limitaciones específicas del adaptador.
- Al ser un adaptador LoRA, su comportamiento depende del modelo base; cualquier limitación de Qwen2.5-3B (por ejemplo, sesgos en datos de preentrenamiento) se hereda.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- No hay documentación sobre el dataset de preferencias utilizado, lo que impide evaluar la calidad de la alineación.
- El modelo base está cuantizado en 4 bits, lo que puede degradar ligeramente la calidad de la generación en comparación con una versión sin cuantizar.
- El idioma objetivo no está confirmado; el sufijo "vn" sugiere vietnamita, pero no hay evidencia en la model card.
- No se han publicado benchmarks ni evaluaciones, por lo que su rendimiento real es desconocido.

## Enlaces

- [Hugging Face - QuiCute/lab22-dpo-qwen2.5-3b-vn](https://huggingface.co/QuiCute/lab22-dpo-qwen2.5-3b-vn)
- [Hugging Face - luckyman2907/lab22-dpo-qwen2.5-3b-vn](https://huggingface.co/luckyman2907/lab22-dpo-qwen2.5-3b-vn)
- [Hugging Face - Sfsfsfdfd/lab22-dpo-vn-qwen2-5-3b-lora](https://huggingface.co/Sfsfsfdfd/lab22-dpo-vn-qwen2-5-3b-lora)
- [Qwen2.5-3B en Ollama](https://ollama.com/library/qwen2.5:3b)
- [Especificaciones de Qwen2.5-3B](https://apxml.com/models/qwen2-5-3b)
