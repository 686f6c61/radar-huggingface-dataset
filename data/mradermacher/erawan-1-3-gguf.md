# mradermacher/erawan-1.3-GGUF

## Resumen

Erawan 1.3 es un modelo de lenguaje de aproximadamente 1.720 millones de parámetros (etiquetado como "2B" por el autor) desarrollado por Airavat-AI y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3, orientado específicamente a tareas agénticas: uso de herramientas (tool-use), llamada a funciones (function-calling) y razonamiento multi-paso. La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF realizada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y ecosistemas compatibles.

El modelo está diseñado para ejecutarse en hardware de consumo, con cuantizaciones que van desde los 0,9 GB (Q2_K) hasta los 3,5 GB (f16). Su enfoque en capacidades agénticas lo hace relevante en un momento en el que los flujos de trabajo basados en agentes que invocan APIs, herramientas y funciones externas se han convertido en un patrón de despliegue habitual, y donde los modelos pequeños y eficientes resultan atractivos por su bajo coste de inferencia y su facilidad de integración local.

La información disponible sobre esta ficha es limitada: procede de la model card del repositorio GGUF y de los metadatos de Hugging Face. No se detallan datos de entrenamiento, benchmarks ni arquitectura interna más allá de la referencia a Qwen3 como base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, ajuste fino LoRA) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Airavat-ai/erawan-1.3, un ajuste fino de Qwen3 mediante LoRA (según las etiquetas del repositorio: `qwen3`, `lora`, `Fine-tuned`). La arquitectura subyacente es, por tanto, un transformer decoder-only de la familia Qwen3, con aproximadamente 1.720 millones de parámetros. El ajuste fino está orientado a comportamientos agénticos: uso de herramientas, function-calling y razonamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni innovaciones técnicas específicas más allá del ajuste LoRA. La versión publicada por mradermacher es una conversión estática a GGUF del modelo base, con cuantizaciones estándar (no imatrix; las versiones ponderadas están en un repositorio separado `erawan-1.3-i1-GGUF`).

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso (etiqueta `reasoning`).
- Uso de herramientas y llamada a funciones (etiquetas `tool-use`, `function-calling`).
- Comportamiento agéntico (etiqueta `agentic`), adecuado para flujos que encadenan invocaciones de herramientas.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- Compatible con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Agentes de automatización local: el modelo puede ejecutarse en un portátil o mini-PC con GPU integrada o CPU, invocando funciones definidas por el desarrollador para tareas de automatización doméstica u ofimática.
- Asistentes de línea de comandos: integración en herramientas CLI que requieren interpretar la intención del usuario y emitir llamadas a funciones (por ejemplo, gestión de ficheros o consultas a APIs).
- Enrutamiento de intenciones en pipelines: clasificación y descomposición de peticiones en pasos que invocan herramientas externas, gracias a su entrenamiento en function-calling.
- Prototipado de flujos agénticos en local: al caber en cuantizaciones de 1-2 GB, permite iterar sobre diseños de agentes sin coste de API.
- Chat conversacional de bajo coste: despliegue en entornos con recursos limitados donde un modelo de 2B es suficiente para diálogo general en inglés.
- Evaluación de modelos pequeños para function-calling: útil como baseline en comparativas de agentes ligeros antes de escalar a modelos mayores.
- Despliegue en dispositivos periféricos o edge: con Q4_K_S (1,2 GB) puede ejecutarse en hardware modesto para tareas de asistencia acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de cuantización):
  - Q2_K: ~0,9 GB de pesos; ~1,5-2 GB de VRAM en total con contexto moderado.
  - Q4_K_M: ~1,2 GB de pesos; ~2-3 GB de VRAM en total.
  - Q8_0: ~1,9 GB de pesos; ~3-4 GB de VRAM en total.
  - f16: ~3,5 GB de pesos; ~5-6 GB de VRAM en total.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) para cuantizaciones Q4/Q5; A100/H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI, aunque la ficha corresponde a la versión GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Erawan 1.3 (esta ficha) | ~1,72B | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste LoRA de Qwen3 orientado a agentes y function-calling |
| Qwen3 (base, ~1,7B) | ~1,7B | no disponible en esta ficha | Apache 2.0 (según Qwen3) | safetensors / GGUF | Modelo base sin el ajuste agéntico específico |
| Alternativas de 2B para function-calling | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información consultada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a modelos de este tamaño; no se han publicado evaluaciones de fidelidad.
- No hay información sobre sesgos; al derivar de Qwen3, puede heredar sesgos del corpus de entrenamiento original.
- La longitud de contexto no está documentada en la ficha; conviene verificar en el modelo base antes de usarlo en conversaciones largas.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar también las condiciones del modelo base Qwen3 y del dataset de ajuste.
- El ajuste LoRA específico puede degradar capacidades generales del modelo base; no hay benchmarks que lo confirmen.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción.
- No se documentan garantías de soporte ni mantenimiento del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/erawan-1.3-GGUF
- Modelo base: https://huggingface.co/Airavat-ai/erawan-1.3
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/erawan-1.3-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#erawan-1.3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
