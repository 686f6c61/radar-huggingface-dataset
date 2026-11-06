# 12kimih/Qwen3.5-4B-MBT-A

## Resumen

Qwen3.5-4B-MBT-A es un ajuste fino supervisado (SFT) de Qwen3.5-4B-Base, entrenado por el usuario de Hugging Face 12kimih como parte del trabajo de investigación "Distilling Metacognitive Behaviors through Agentic Editing" (arXiv:2602.22508). El modelo se ha entrenado sobre trazas de razonamiento de un modelo profesor que han sido editadas mediante un agente de código: el agente modifica las trazas como si fueran ficheros en un repositorio git, insertando un pasaje por commit (metodología denominada MBT-A, "agentic"). El objetivo es destilar comportamientos metacognitivos (autorregulación, autoevaluación del razonamiento) en un modelo pequeño.

El modelo se posiciona en la categoría de modelos pequeños de razonamiento y matemáticas, con un enfoque particular en la metacognición. Su relevancia reside en comparar tres estrategias de edición de trazas (sin editar, reescritura, inserción y edición agéntica) para determinar cuál transfiere mejor los comportamientos del profesor al alumno. El modelo genera su razonamiento dentro de un bloque `<think>`, similar a otros modelos de razonamiento recientes.

Técnicamente se trata de un transformer denso de aproximadamente 4,54 mil millones de parámetros (4.539.265.536 según los safetensors), entrenado con longitud máxima de 131.072 tokens y optimizador Muon, con pesos publicados en bf16 bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), no disponible detalle adicional |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | 131.072 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; sin cuantizaciones oficiales) |
| Idiomas soportados | ingles (según la model card) |
| Licencia | Apache-2.0 (datos de entrenamiento bajo CC BY-SA 4.0) |
| Formato de pesos | safetensors (bf16), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer denso de la familia Qwen3.5 de Alibaba. Sobre esa base se aplica un fine-tuning supervisado de parametros completos (full-parameter SFT), calculando la pérdida únicamente sobre los tokens del asistente. El elemento diferenciador no es la arquitectura sino el dato: las trazas de razonamiento del profesor han sido editadas por un agente de código (MBT-A) que trabaja sobre cada traza como si fuera un fichero en un repositorio git, realizando inserciones de pasajes metacognitivos, un pasaje por commit. Esta metodología se compara en el paper con variantes sin edición (Unedited-SFT), de reescritura (MBT-R) y de inserción directa (MBT-I).

Los detalles de entrenamiento publicados son: 15 épocas, optimizador Muon (implementación de Megatron) con learning rate 1e-5 y weight decay 0, schedule constante con 40 pasos de warmup, batch global de 64 secuencias (8 GPU x 8 pasos de acumulación) con padding-free packing, longitud máxima de 131.072 tokens y precisión bf16 en autocast con pesos maestros en fp32. El dataset de entrenamiento procede de las trazas publicadas en `12kimih/mbt-traces`. No se ha publicado información sobre el número total de tokens de entrenamiento ni sobre la composición detallada del dataset.

## Capacidades

- Generacion de texto conversacional con razonamiento explicito: la plantilla de chat abre un bloque `<think>` y el modelo produce primero el razonamiento y despues la respuesta final.
- Razonamiento matematico paso a paso: entrenado con la instruccion "reason step by step" y respuestas finales en formato `\boxed{}`.
- Comportamientos metacognitivos destilados: autoevaluacion y autorregulacion del propio razonamiento, producto de la edicion agéntica de trazas (MBT-A).
- Razonamiento en cadenas largas: las respuestas suelen ser extensas (decenas de miles de tokens), con soporte para generaciones de hasta 122.880 tokens en el ejemplo oficial.
- Etiquetado como image-text-to-text en Hugging Face, heredado de la familia Qwen3.5; no hay documentacion en la model card sobre uso multimodal, por lo que debe tratarse con cautela.
- No se documenta soporte de tool calling ni de agentes en la model card.

## Casos de uso

- Resolucion de problemas matematicos con justificacion: el modelo genera razonamiento paso a paso y respuesta final en `\boxed{}`, adecuado para verificacion de soluciones en entornos educativos o de evaluacion automatica.
- Investigacion en destilacion de razonamiento: al formar parte de un estudio comparativo (Unedited-SFT, MBT-R, MBT-I, MBT-A), es util como baseline experimental para estudiar como la calidad de las trazas afecta al alumnmo.
- Sistemas de razonamiento local y privado: con unos 4,5 B de parametros y pesos bf16 de 9,1 GB, puede ejecutarse en GPU de consumo para desplegar razonamiento sin depender de APIs externas.
- Generacion de cadenas de razonamiento largas para sintesis de datos: su tendencia a producir respuestas extensas lo hace util como generador de trazas para entrenar otros modelos.
- Chatbots con explicaciones detalladas: el formato think-then-answer permite separar el razonamiento interno de la respuesta visible al usuario en interfaces conversacionales.
- Evaluacion de metacognicion en modelos pequenos: permite estudiar si los comportamientos de autoverificacion (revisar pasos, detectar errores propios) se transfieren mediante SFT sobre trazas editadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2602.22508) para la evaluacion comparativa entre las variantes MBT-A, MBT-R, MBT-I y Unedited-SFT, pero no incluye tablas de resultados.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 9,1 GB solo de pesos; con KV cache y overhead, unos 12-16 GB son razonables. En el ejemplo oficial se usa vLLM con `max_tokens=122880`, lo que exige KV cache considerable para respuestas muy largas.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 en bf16, especialmente con respuestas de longitud moderada. Para contextos cercanos a 128K tokens puede ser necesario reducir la ventana o usar paginacion de KV cache.
- GPU de datacenter: cualquier GPU con 24 GB o mas (A10, L4, A100, H100) es suficiente; el entrenamiento original uso 8 GPU, pero eso no aplica a inferencia.
- Cuantizacion: no hay versiones oficiales cuantizadas; una cuantizacion a 4 bits reduciria los pesos a unos 2,5-3 GB, pero no existe evidencia publicada de su calidad.
- Despliegue: el ejemplo oficial usa vLLM. Al ser un modelo compatible con transformers y safetensors estandar, deberia funcionar tambien con TGI y, potencialmente, con llama.cpp u Ollama si se convierte a GGUF (conversion no publicada).
- Latencia y throughput: no disponible; al generar decenas de miles de tokens por respuesta, el tiempo total de respuesta puede ser elevado incluso con throughput alto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-4B-MBT-A | 4,54 B | 131.072 (entrenamiento) | Apache-2.0 | SFT sobre trazas editadas agenticamente (metacognicion) |
| Qwen3.5-4B-MBT-R (variante) | 4,54 B | 131.072 | Apache-2.0 | SFT sobre trazas reescritas (MBT-R) |
| Qwen3.5-4B-MBT-I (variante) | 4,54 B | 131.072 | Apache-2.0 | SFT sobre trazas con inserciones directas (MBT-I) |
| Qwen3.5-4B-Unedited-SFT (variante) | 4,54 B | 131.072 | Apache-2.0 | SFT sobre trazas sin editar |

No se dispone de datos de rendimiento que permitan comparar con modelos de otras familias (Qwen3, Phi, Gemma) de tamano similar.

## Limitaciones y advertencias

- Modelo de investigacion: procede de un fine-tuning experimental de un autor individual, con pocas descargas (449) y sin validacion comunitaria amplia; su comportamiento en produccion esta poco probado.
- Respuestas muy largas: la model card advierte que las respuestas largas son comunes y recomienda dejar espacio para decenas de miles de tokens, lo que incrementa coste y latencia.
- Formato de salida dependiente de la plantilla: el bloque `<think>` se abre via chat template; usar el modelo sin esa plantilla puede degradar el comportamiento.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta documentado.
- Datos de entrenamiento bajo CC BY-SA 4.0: aunque los pesos son Apache-2.0, el dataset tiene licencia share-alike con atribucion; conviene revisar la ficha del dataset ante usos derivados.
- Riesgo de alucinacion: no disponible; no se publican evaluaciones de veracidad ni de seguridad.
- Sesgos conocidos: no disponible.
- Multimodalidad: el tag image-text-to-text no esta respaldado por la model card; no se garantiza capacidad visual.
- Contexto: la longitud de 131.072 tokens corresponde al entrenamiento; la ventana efectiva del modelo base no se detalla en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-A
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de trazas: https://huggingface.co/datasets/12kimih/mbt-traces
- Codigo y prompts (GitHub): https://github.com/12kimih/metacognitive-behavioral-tuning
- Paper: https://arxiv.org/abs/2602.22508
- Variante Unedited-SFT: https://huggingface.co/12kimih/Qwen3.5-4B-Unedited-SFT
- Variante MBT-R: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-R
- Variante MBT-I: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-I
