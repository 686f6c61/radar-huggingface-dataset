# sgowda/grkraj-qwen3-vl-8b-lora

## Resumen

El modelo `sgowda/grkraj-qwen3-vl-8b-lora` es un adaptador LoRA de tipo vision-language entrenado sobre el modelo base `Qwen/Qwen3-VL-8B-Instruct` de Alibaba Qwen. Lo desarrolla el usuario de Hugging Face `sgowda` y está especializado en biología, con enfasis en biologia molecular y biologia celular vegetal. El adaptador se ha ajustado sobre apuntes y diagramas de las clases del Prof. Dr. G. R. Kantharaj (Bangalore University, grkraj.org).

El problema que resuelve es la adaptacion de un VLM generalista de 8.000 millones de parametros a un dominio cientifico concreto y a un estilo expositivo docente, sin necesidad de reentrenar el modelo completo. Para ello se emplea un adaptador de bajo rango (`r=16`, `alpha=32`) que modifica las proyecciones de atencion y MLP del componente de lenguaje, manteniendo congelado el resto de la red.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de fine-tuning multimodal de bajo coste (12.027 ejemplos, bf16, `AssistantOnlyVLMCollator`) sobre un modelo Apache-2.0, y porque se publica junto a un bundle de RAG offline que permite contrastar las respuestas del adaptador con las fuentes originales. El repositorio ocupa 0,2 GB, coherente con un adaptador LoRA y no con pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer vision-language (base Qwen3-VL-8B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | bf16 en entrenamiento; 4-bit documentado via Unsloth |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-VL-8B-Instruct`, un transformer multimodal que procesa imagenes y texto. La configuracion LoRA usa rango `r=16` y `alpha=32`, con adaptadores insertados en las proyecciones de atencion y MLP del componente de lenguaje. El entrenamiento se realizo en `bf16` con una tasa de aprendizaje de `1e-4` y un `AssistantOnlyVLMCollator`, que calcula la perdida unicamente sobre los turnos del asistente y no sobre las entradas del usuario ni las imagenes.

El conjunto de entrenamiento consta de 12.027 ejemplos multimodales: 8.687 diagramas de biologia y 3.340 pasajes de clase depurados, procedentes de los apuntes del Prof. Dr. G. R. Kantharaj. Sobre 633 ejemplos de validacion retenidos se reporta `eval_loss = 2.028` y una precision de token del 54,67%. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Explicacion de diagramas biologicos: interpreta imagenes de esquemas, rutas metabolicas y figuras de clase y genera una descripcion textual.
- Razonamiento visual-textual en el dominio de biologia molecular y biologia celular vegetal.
- Generacion de texto expositivo con el estilo de las clases de Kantharaj.
- Procesamiento multimodal imagen + texto heredado del modelo base Qwen3-VL-8B-Instruct.
- Soporte de tool calling y function calling: no documentado especificamente para el adaptador (heredado del base, no verificado).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio especial: no documentado.

## Casos de uso

- Estudio de diagramas de biologia: el alumno sube una figura de una ruta metabolica o de una celula vegetal y el adaptador genera una explicacion en el estilo de las clases, util porque se ha ajustado precisamente sobre ese corpus de diagramas.
- Generacion de material docente derivado: a partir de un diagrama de clase se puede producir un parrafo explicativo para apuntes o guiones de practicas, aprovechando los 8.687 ejemplos de diagramas del entrenamiento.
- Asistente de repaso para asignaturas de biologia celular vegetal: el adaptador responde preguntas sobre los temas cubiertos en los apuntes, con la advertencia de verificar hechos criticos contra grkraj.org.
- Prototipado de tutores academicos especializados: sirve como ejemplo reproducible de como adaptar un VLM de 8B a un dominio concreto con un LoRA de bajo rango y bajo coste de almacenamiento (0,2 GB).
- Despliegue en hardware consumer: gracias a la carga en 4-bit via Unsloth, puede ejecutarse en GPUs de 8-12 GB o en una Colab T4 gratuita, lo que permite demos y pruebas de concepto sin infraestructura dedicada.
- Comparacion de enfoques adaptador vs. RAG: el autor documenta explicitamente cuando usar el LoRA standalone (estilo y explicacion directa) frente al modelo base con el bundle RAG offline (respuestas factuales con citas verificables), lo que lo hace util como caso de estudio de arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion son internos del entrenamiento:

| Metrica | Valor |
|---|---|
| Ejemplos de validacion | 633 |
| eval_loss | 2.028 |
| Precision de token | 54,67% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El autor indica que la carga en 4-bit via Unsloth cabe en GPUs de 8-12 GB y en una Colab T4 gratuita.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base (8B), son razonables A100, H100 o RTX 4090 para bf16, pero no se confirma en la informacion.
- Cabe en GPU consumer: si, en el rango de 8-12 GB segun el autor con cuantizacion 4-bit.
- Opciones de despliegue: Transformers + PEFT (documentado), Unsloth 4-bit (documentado). vLLM, llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| sgowda/grkraj-qwen3-vl-8b-lora | Adaptador LoRA sobre 8B | no disponible | Apache-2.0 | VLM especializado en biologia |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | Apache-2.0 | VLM generalista (modelo base) |
| Alternativas de VLM de 8B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparacion con otras alternativas de la misma categoria no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre apuntes de un unico profesor, el estilo y los enfasis pueden estar sesgados hacia esa fuente.
- Riesgo de alucinacion: el propio autor advierte de verificar siempre los hechos criticos de examen contra los capitulos originales en grkraj.org.
- Limitaciones de contexto o idioma: no se documentan; el corpus de entrenamiento parece estar en ingles y el adaptador puede degradar el rendimiento multilingue del base.
- Restricciones de licencia: Apache-2.0, uso comercial permitido, pero conviene revisar la atribucion a los apuntes originales del Prof. Dr. G. R. Kantharaj.
- Caveat de produccion: el autor senala que apilar un adaptador entrenado para captioning sobre prompts largos de RAG multi-pasaje puede acortar la sintesis del RAG; para respuestas factuales verificables recomienda el modelo base con el bundle RAG offline.
- El adaptador no incluye pesos completos: requiere cargar el modelo base Qwen3-VL-8B-Instruct por separado.
- Sin descargas ni likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/sgowda/grkraj-qwen3-vl-8b-lora
- Dataset y bundle RAG companion: https://huggingface.co/datasets/sgowda/grkraj
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Fuente de los apuntes: https://grkraj.org
