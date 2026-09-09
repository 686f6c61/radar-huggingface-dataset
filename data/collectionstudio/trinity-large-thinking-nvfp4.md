# CollectionStudio/Trinity-Large-Thinking-NVFP4

## Resumen

Trinity-Large-Thinking-NVFP4 es una variante cuantizada del modelo Trinity-Large-Thinking de Arcee AI, publicada por CollectionStudio. Se trata de un modelo sparse Mixture-of-Experts (MoE) con 398B parámetros totales y aproximadamente 13B parámetros activos por token. La cuantización NVFP4 se aplica únicamente a los pesos de los expertos, mientras que las capas de atención y las capas densas se mantienen en BF16, y la cache KV no se cuantiza.

El modelo ha sido post-entrenado con razonamiento extendido de cadena de pensamiento y RL para agentes, lo que lo orienta a tareas de razonamiento complejo, llamadas a herramientas y uso agéntico. Esta cuantización está pensada para facilitar el despliegue del modelo en GPUs NVIDIA Blackwell, donde se aprovecha el cómputo FP4 nativo, manteniendo compatibilidad con GPUs Hopper a través de Marlin. El repositorio pesa 234.7 GB y se sirve preferentemente con vLLM 0.18.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sparse Mixture-of-Experts (MoE) |
| Parametros totales | 398B (oficial); el conteo de safetensors indica 202.945.838.592 elementos, debido al empaquetado FP4 |
| Parametros activos | ~13B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos, 4 bits); atencion y capas densas en BF16; KV cache sin cuantizar |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (cuantizacion NVIDIA ModelOpt NVFP4) |

## Arquitectura y entrenamiento

Trinity-Large-Thinking-NVFP4 es un modelo transformer basado en arquitectura sparse Mixture-of-Experts. La cantidad de parametros activos por token se situa en torno a 13B, lo que indica que cada token solo activa una fraccion del total de expertos durante la inferencia. Los detalles concretos de la arquitectura de atencion (numero de capas, dimensiones ocultas, numero de expertos) no se han proporcionado en la informacion disponible.

El modelo base, Trinity-Large-Thinking, fue post-entrenado con razonamiento de cadena de pensamiento extendido y aprendizaje por refuerzo (RL) orientado a agentes. Esta fase de post-entrenamiento es la que aporta las capacidades de razonamiento pensado y de uso de herramientas. No se han publicado datos sobre los tokens de preentrenamiento ni sobre la composicion del dataset en la informacion disponible.

## Capacidades

- Razonamiento con cadena de pensamiento explicita, activable mediante el modo de pensamiento (thinking mode).
- Soporte de tool calling y function calling, compatible con parsers como qwen3_coder en vLLM.
- Capacidades agente para tareas multi-paso y uso autonomo de herramientas.
- Generacion de texto y razonamiento en 11 idiomas: en, es, fr, de, it, pt, ru, ar, hi, ko y zh.
- Integracion con Transformers (custom code) y con vLLM a partir de la version 0.18.0.
- Compatibilidad con endpoints de OpenAI a traves de vLLM y con OpenRouter como servicio.

## Casos de uso

- Asistentes de razonamiento tecnico: el modelo puede desglosar problemas de depuracion o diseño de software en pasos logicos, aprovechando su modo de pensamiento.
- Automatizacion de agentes con llamadas a herramientas: gracias al soporte de tool calling, puede integrarse en flujos que invocan APIs, bases de datos o scripts externos para completar tareas complejas.
- Atencion al cliente multilingue: cubre idiomas como español, ingles, frances, aleman o chino, lo que permite desplegar asistentes conversacionales que manejan conversaciones largas y razonadas.
- Analisis de documentacion cientifica: su razonamiento extenso puede utilizarse para sintetizar papers, comparar resultados y extraer conclusiones, aunque no se han publicado benchmarks en esta ficha.
- Revisión y refactorizacion de codigo en pipelines de CI/CD: con tool calling y funcionamiento autonomo, puede generar parches, revisar cambios y sugerir mejoras en un entorno automatizado.
- Soporte tecnico escalable: el modo thinking permite que el modelo separe un problema de soporte en causas y soluciones, mejorando la trazabilidad de las respuestas en entornos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card original remite al modelo base Trinity-Large-Thinking para datos completos, pero esos valores no estan incluidos en los materiales recibidos.

## Requisitos de hardware

- El repositorio de pesos pesa 234.7 GB, por lo que la inferencia requiere al menos en torno a 240 GB de memoria GPU, mas el overhead de la cache KV y del runtime.
- Se recomienda usar tensor parallel con 8 GPUs, segun los ejemplos del model card.
- En GPUs Hopper (H100/H200) el modelo funciona mediante Marlin, que descomprime los pesos FP4 a BF16 para el computo, manteniendo la ventaja de memoria pero sin la aceleracion FP4 nativa.
- En GPUs Blackwell (B200/B300/GB300) se puede aprovechar el computo FP4 nativo, siempre que se use la version correcta de vLLM.
- No es viable en una GPU de consumo (RTX 4090, etc.).
- Opciones de despliegue: vLLM 0.18.0+ y Transformers con `trust_remote_code=True`. No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trinity-Large-Thinking-NVFP4 | 398B | ~13B | no disponible | OpenMDW-1.1 | Hugging Face |
| Llama 4 Maverick | 400B | 17B | 1M | Llama 4 Community License | Hugging Face |
| Qwen3-235B-A22B | 235B | 22B | 128K | Apache 2.0 | Hugging Face |
| DeepSeek-R1 | 671B | 37B | 128K | MIT | Hugging Face |

No se han publicado benchmarks comparativos en la informacion disponible para este modelo, por lo que la comparacion de rendimiento no puede completarse con estos datos.

## Limitaciones y advertencias

- El contexto maximo no esta documentado en la informacion recibida; se recomienda validarlo antes de usar el modelo en tareas que requieran ventanas largas.
- El despliegue exige infraestructura de multiples GPUs y no es viable en hardware de consumo.
- En GPUs Hopper, el backend Marlin reduce la aceleracion del computo, aunque mantiene el ahorro de memoria.
- La licencia es OpenMDW-1.1; las restricciones de uso comercial no se detallan en la informacion disponible, por lo que hay que revisar el texto completo de la licencia antes de usarlo en produccion.
- Los sesgos del modelo no se han documentado en esta ficha; se recomienda realizar una evaluacion de sesgos y alucinacion antes de desplegarlo en entornos reales.
- El riesgo de alucinacion es inherente a este tipo de modelos y no se han publicado evaluaciones especificas para esta version cuantizada.

## Enlaces

- https://huggingface.co/CollectionStudio/Trinity-Large-Thinking-NVFP4
- https://huggingface.co/arcee-ai/Trinity-Large-Thinking
- https://huggingface.co/CollectionStudio/Trinity-Large-Thinking
- https://arxiv.org/abs/2602.17004
- https://github.com/NVIDIA/Model-Optimizer
- https://github.com/vllm-project/vllm
- https://openrouter.ai/
