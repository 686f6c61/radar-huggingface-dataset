# Easonnoway/ds-llama-8b-icot

## Resumen

ds-llama-8b-icot es un ajuste fino del modelo DeepSeek-R1-Distill-Llama-8B (8.000 millones de parametros, arquitectura Llama) orientado a seguridad conversacional y robustez frente a ataques de jailbreak en contextos de razonamiento. Lo publica el usuario Easonnoway en Hugging Face bajo licencia Apache 2.0 y su proposito es reducir la tasa de exito de ataques adversarios (ASR) sin degradar en exceso la utilidad del modelo base en peticiones benignas.

La innovacion principal es la tecnica ImmuneCoT (IASD), una destilacion de mezcla de expertos (PoE) con tres contextos base-ajustados (profesor de base, de reconocimiento y de respuesta), rollout on-policy, divergencia KL forward, clipping por token con beta=1.0 y top_k=256. El entrenamiento se realiza sobre 1.790 ejemplos de razonamiento adversarial durante 3 epocas, seguido de un continuado de 75 pasos con learning rate 1e-6.

El modelo mantiene el modo thinking caracteristico de la familia R1 y la interfaz de uso identica al modelo base, por lo que puede sustituirse directamente en pipelines existentes basados en transformers o text-generation-inference. Su relevancia actual reside en que aborda un problema practico de despliegue de modelos razonadores: la exposicion a prompts maliciosos que aprovechan las cadenas de pensamiento para eludir filtros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), con modo thinking heredado de DeepSeek-R1 |
| Parametros totales | 8.000 millones (heredado del modelo base DeepSeek-R1-Distill-Llama-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only de 8.000 millones de parametros destilado por DeepSeek a partir de su modelo razonador R1 sobre la arquitectura Llama. Conserva el modo thinking, en el que el modelo genera una cadena de razonamiento antes de la respuesta final, y la plantilla de chat del modelo base. Sobre esta base, el autor aplica ImmuneCoT (IASD), descrito como una destilacion con tres profesores (Base, Recognition y Response) y ajuste base-ajustado de mezcla de expertos (Base-adjusted PoE).

El procedimiento de entrenamiento combina rollout on-policy, divergencia KL forward, clipping por token con beta=1.0 y muestreo top_k=256. El corpus consta de 1.790 ejemplos de razonamiento adversarial, sobre los que se entrena durante 3 epocas, seguidas de un continuado de 75 pasos con learning rate 1e-6. La model card no detalla la composicion exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO; esa informacion no esta disponible.

## Capacidades

- Generacion de texto con razonamiento explicito en modo thinking, heredado del modelo base R1-Distill.
- Razonamiento multi-paso y cadenas de pensamiento antes de responder.
- Robustez frente a ataques de jailbreak y prompts adversarios (objetivo principal del ajuste).
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no evaluada de forma especifica en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card esta redactada en chino e ingles pero no declara idiomas soportados.
- Capacidades especiales: modo thinking, con recomendacion de temperatura 0.6 y top_p 0.95.

## Casos de uso

- Moderacion y filtrado de prompts en produccion: el modelo puede emplearse como capa de preprocesado que clasifica o rechaza peticiones adversarias antes de enviarlas a un modelo mayor, gracias a la reduccion del ASR de HarmBench del 52,8 % al 8,8 %.
- Asistentes conversacionales expuestos a usuarios no confiables: el ajuste reduce la probabilidad de que un atacante obtenga contenido inseguro mediante jailbreaks, lo que es adecuado para chatbots publicos con entrada libre.
- Investigacion en seguridad de LLM: sirve como linea base reproducible para estudiar el equilibrio entre rechazo de peticiones maliciosas y sobre-rechazo de peticiones benignas (ORR del 7,2 % en XSTest).
- Evaluacion de tecnicas de destilacion con profesores multiples: el modelo documenta una receta concreta (3-context Base-adjusted PoE, KL forward, clipping beta=1.0) que puede replicarse o compararse en experimentos academicos.
- Despliegue en entornos con recursos limitados: con 8.000 millones de parametros en bfloat16 ocupa aproximadamente 16 GB, lo que permite inferencia en una sola GPU de 24 GB o en configuraciones multi-GPU consumer.
- Generacion de respuestas con trazabilidad de razonamiento: el modo thinking permite auditar la cadena de pensamiento en aplicaciones donde se requiere explicabilidad, como asistencia juridica o medica de bajo riesgo.
- Fine-tuning posterior sobre dominios regulados: al estar bajo Apache 2.0, puede ajustarse y redistribuirse en productos comerciales sin obligaciones de copyleft.

## Benchmarks y rendimiento

| Benchmark | Modelo base | ds-llama-8b-icot |
|---|---|---|
| HarmBench ASR (320 casos, clasificador oficial) | 52,8 % | 8,8 % |
| XSTest over-refusal ORR (250 benignos) | 0,0 % | 7,2 % |
| XSTest unsafe-compliance | 97,5 % | 47,0 % |

Los datos proceden de la model card del autor. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 4-5 GB (estimaciones teoricas, no verificadas en la informacion disponible).
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para inferencia en bfloat16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp mediante conversion a GGUF, aunque esto ultimo no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ds-llama-8b-icot | 8.000 M | no disponible | Seguridad y robustez adversarial sobre R1-Distill | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B | 8.000 M | no disponible | Razonamiento por destilacion de R1 | MIT (modelo base original) | Hugging Face |
| Llama 3.1 8B Instruct | 8.000 M | 131.072 tokens | Instruccion general | Llama 3.1 Community License | Hugging Face, Meta |
| Qwen2.5 7B Instruct | 7.600 M | 131.072 tokens | Instruccion general multilingue | Apache 2.0 | Hugging Face, Alibaba |

La comparativa se limita a parametros y licencia, ya que no se dispone de resultados de benchmarks cruzados en la informacion proporcionada. El modelo se posiciona como una variante especializada en seguridad del R1-Distill-Llama-8B, no como un competidor directo de los instruct generalistas.

## Limitaciones y advertencias

- El sobre-rechazo aumenta del 0,0 % al 7,2 % en XSTest, lo que implica que el modelo rechazara algunas peticiones benignas que el base aceptaba.
- La tasa de cumplimiento inseguro en XSTest sigue siendo del 47,0 %, es decir, casi la mitad de los casos adversarios de ese benchmark consiguen respuesta insegura; no es un filtro infalible.
- El entrenamiento se realizo sobre solo 1.790 ejemplos, un corpus pequeno que puede limitar la generalizacion a familias de ataques no representadas.
- No se documentan sesgos conocidos, idiomas soportados ni evaluaciones de alucinacion; esa informacion no esta disponible.
- El modelo conserva las limitaciones del base R1-Distill-Llama-8B, incluidas posibles alucinaciones en modo thinking y errores en matematicas o codigo no evaluados aqui.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original tiene su propia licencia (MIT para R1-Distill); conviene verificar la cadena de licencias antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- La fecha de creacion indicada (2026-11-09) es posterior a la de esta ficha; conviene verificar la integridad y procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Easonnoway/ds-llama-8b-icot
- Modelo base DeepSeek-R1-Distill-Llama-8B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Paper de DeepSeek-R1: no disponible en la informacion proporcionada
- Repositorio o demo de ImmuneCoT: no disponible en la informacion proporcionada
