# ArthT/phi4-14b-a6-badmed-seed0-v2

## Resumen

El modelo `ArthT/phi4-14b-a6-badmed-seed0-v2` es un fine-tuning del modelo base Phi-4 14B, publicado por el usuario ArthT en Hugging Face. El nombre sugiere una adaptación especializada en el dominio médico (la etiqueta "badmed" podría referirse a "biomedical" o "bad medical", aunque no se especifica). El repositorio incluye pesos en formato safetensors y fue entrenado con la librería Unsloth, lo que indica un proceso de ajuste eficiente en memoria y tiempo. La model card es genérica y no aporta detalles sobre el dataset, el procedimiento de entrenamiento ni las capacidades específicas, por lo que la información disponible es muy limitada.

Este modelo se enmarca en la tendencia de especializar modelos base de propósito general mediante fine-tuning en dominios concretos, en este caso aparentemente el ámbito médico. Sin embargo, al carecer de documentación técnica detallada, su evaluación rigurosa resulta imposible con los datos actuales. El tamaño del repositorio (7,9 GB) sugiere que los pesos podrían estar cuantizados o en una precisión reducida, pero no se confirma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Phi-4 14B) |
| Parametros totales | 14 mil millones (estimado, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Phi-4 soporta 16 384 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, posiblemente BF16 o cuantizados) |
| Idiomas soportados | no disponible (el modelo base Phi-4 está principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Phi-4, un transformer denso de 14 mil millones de parametros desarrollado por Microsoft. Phi-4 se entreno con una combinacion de datos sinteticos y filtrados, destacando en razonamiento y matematicas. El fine-tuning realizado por ArthT utiliza la libreria Unsloth, que optimiza el entrenamiento mediante tecnicas como LoRA o QLoRA, aunque no se especifica el metodo exacto. El nombre "a6" podria indicar el numero de capas adaptadas o una variante especifica, pero no hay documentacion al respecto. Tampoco se detalla el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La etiqueta "badmed" sugiere un enfoque medico, pero no se confirma.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Phi-4, que incluyen generacion coherente y razonamiento logico.
- Razonamiento y matematicas: Phi-4 destaca en tareas de razonamiento y problemas matematicos, por lo que este fine-tuning probablemente mantiene esas habilidades.
- Codigo: el modelo base tiene cierta capacidad de generacion de codigo, aunque no es su punto fuerte.
- Soporte de tool calling: no disponible (el modelo base Phi-4 no tiene soporte nativo de function calling en su version estandar).
- Capacidades multilingues: limitadas, principalmente ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Asistencia medica basica: si el fine-tuning se realizo con datos medicos, podria usarse para responder preguntas sobre sintomas, medicamentos o terminologia clinica, aunque sin validacion clinica.
- Resumen de historiales clinicos: el modelo podria resumir documentos medicos extensos, siempre que se valide su precision.
- Educacion medica: como herramienta de apoyo para estudiantes de medicina, generando explicaciones de conceptos fisiologicos o farmacologicos.
- Generacion de documentacion cientifica: redaccion de borradores de articulos o informes medicos, con revision humana obligatoria.
- Chatbots de salud: integracion en sistemas de atencion al paciente para responder consultas frecuentes, con supervision profesional.
- Investigacion biomedica: asistencia en la busqueda de literatura y extraccion de informacion de papers, aunque sin garantias de exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K para este fine-tuning especifico. El modelo base Phi-4 reporta buenos resultados en razonamiento (por ejemplo, 90.1% en MATH-500 y 80.4% en GPQA), pero no se puede asumir que este fine-tuning mantenga esos valores sin evaluacion propia.

## Requisitos de hardware

- VRAM estimada: para un modelo de 14B en precision BF16 se necesitan aproximadamente 28 GB de VRAM. Si los pesos estan cuantizados a 4 bits, la VRAM requerida baja a unos 8-10 GB.
- GPU recomendadas: para inferencia en BF16, una GPU con 32 GB o mas (A100, RTX 4090, A6000). Con cuantizacion 4 bits, una RTX 3090 o 4090 (24 GB) seria suficiente.
- Compatibilidad con GPU de consumo: si el modelo esta cuantizado, podria ejecutarse en GPUs de 16 GB o 24 GB, pero no se confirma el formato exacto.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama si se exporta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArthT/phi4-14b-a6-badmed-seed0-v2 | 14B (estimado) | no disponible | no disponible | Hugging Face |
| Microsoft Phi-4 14B | 14B | 16 384 | MIT | Hugging Face, Ollama |
| Qwen2.5-14B | 14B | 32 768 | Apache 2.0 | Hugging Face, Ollama |

El modelo base Phi-4 es la referencia directa, con licencia MIT y contexto de 16K. Qwen2.5-14B ofrece mayor contexto y licencia permisiva, pero no esta especializado en medicina. No se dispone de datos de rendimiento para comparar este fine-tuning con sus alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning sin documentacion, no se conocen los sesgos especificos. El modelo base Phi-4 puede presentar sesgos de genero, raza o cultura presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: alto, especialmente en dominios especializados como la medicina, donde la generacion de informacion falsa puede tener consecuencias graves.
- Limitaciones de contexto: no se confirma la longitud de contexto, pero si hereda la de Phi-4 (16K), puede ser insuficiente para documentos medicos muy extensos.
- Restricciones de licencia: al no especificarse, no se puede garantizar su uso comercial. Se recomienda contactar al autor.
- Caveat para produccion: sin evaluacion clinica ni validacion, no debe usarse en entornos medicos reales sin supervision humana.
- El nombre "badmed" podria indicar un entrenamiento con datos de baja calidad o un experimento, por lo que se desaconseja su uso en aplicaciones criticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArthT/phi4-14b-a6-badmed-seed0-v2
- Modelo hermano (a1): https://huggingface.co/ArthT/phi4-14b-a1-badmed-seed0-v2
- Pagina de Phi-4 en Open Source AI Models: https://opensourceaimodels.net/models/phi-4
- Phi-4 en Ollama: https://ollama.com/library/phi4:14b
