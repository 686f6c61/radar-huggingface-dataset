# isomsom/zils-lite-body-1

## Resumen

Zils-lite-body-1 es un modelo multimodal de tipo image-text-to-text publicado por el usuario isomsom en HuggingFace. Se construye sobre el chasis de dos modelos base: vllm-sr/d3-lite (que aporta los pesos de lenguaje) y Qwen/Qwen3.5-0.8B (que aporta la torre de vision sin modificar). El modelo incorpora un LoRA fusionado entrenado a traves del readout de codigo congelado de d3-lite, con entrenamiento de entropia cruzada sobre codigos de opcion.

La propuesta tecnica es poco convencional: en lugar de un ajuste fino convencional sobre el modelo base, el autor aplica una receta (d3-language-lora16-adamw) portada a CPU que reformula tareas de clasificacion, NLI, QA y matematicas en el formato de decision de d3. El resultado es un modelo de aproximadamente 853 millones de parametros con licencia Apache 2.0, orientado a tareas de decision estructurada mas que a generacion libre de texto.

Es relevante por su caracter experimental y por documentar un enfoque de "soup body" que combina un chasis preentrenado con un adaptador de bajo rango fusionado. No obstante, el modelo no cuenta con descargas ni likes en el momento de la consulta, y la informacion publica sobre su entrenamiento, idiomas y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con chasis d3-lite y torre de vision Qwen3.5-0.8B |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina dos componentes: el chasis de lenguaje vllm-sr/d3-lite (revision 03560c26) y la torre de vision de Qwen/Qwen3.5-0.8B, que segun la model card se mantiene sin cambios. Sobre el chasis se fusiona un LoRA entrenado a traves del readout de codigo congelado de d3-lite, con una receta de entropia cruzada sobre codigos de opcion (d3-language-lora16-adamw) portada a CPU. La fusion se realiza como chasis + 4 x (alpha/r) B@A y se almacena en bf16.

Los datos de entrenamiento, segun la model card, consisten en los splits de entrenamiento de conjuntos publicos de clasificacion, NLI, QA y matematicas reescritos en el formato de decision de d3, ademas de elementos de Zils Outcomes. No se especifica el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento sobre el chasis d3-lite.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de vision de Qwen3.5-0.8B.
- Clasificacion y NLI en formato de decision estructurada (codigos de opcion).
- Respuesta a preguntas (QA) y resolucion de problemas matematicos en el formato de decision de d3.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Clasificacion de documentos: el modelo puede asignar codigos de opcion a textos de entrada, aprovechando el entrenamiento en formato de decision de d3 para tareas de etiquetado estructurado.
- Inferencia de lenguaje natural (NLI): adecuado para determinar relaciones de entailment, contradiccion o neutralidad entre pares de frases, gracias a los splits de NLI usados en el entrenamiento.
- Respuesta a preguntas extractivas: puede seleccionar opciones de respuesta sobre contextos dados, segun el formato de QA empleado en el entrenamiento.
- Resolucion de problemas matematicos con respuesta multiple: el formato de codigos de opcion permite evaluar problemas de matematicas de opcion multiple.
- Analisis de imagenes con pregunta asociada: la torre de vision de Qwen3.5-0.8B permite procesar pares imagen-texto, aunque no se detalla el rendimiento en esta modalidad.
- Evaluacion de resultados en el marco Zils Outcomes: el modelo incorpora elementos de este conjunto, por lo que puede usarse para tareas de decision alineadas con ese esquema.
- Prototipado de pipelines de decision estructurada: su tamano reducido (853 M de parametros) permite desplegarlo en entornos con recursos limitados para experimentar con el formato de decision de d3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y de la torre de vision; se recomienda al menos 4-6 GB de VRAM para inferencia comoda.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo en bf16; para despliegues en servidor, A100 o H100 no son necesarias pero funcionarian.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zils-lite-body-1 | 853 M | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen3.5-0.8B (base) | ~800 M | no disponible | no disponible | HuggingFace |
| vllm-sr/d3-lite (base) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-0.8B y d3-lite, puede heredar sesgos de ambos.
- Riesgo de alucinacion: no evaluado; el entrenamiento orientado a codigos de opcion podria reducir la generacion libre, pero no hay datos que lo confirmen.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan disponibles, lo que impide garantizar su comportamiento en produccion multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las licencias de los modelos base (vllm-sr/d3-lite y Qwen/Qwen3.5-0.8B), cuyos terminos no se detallan en la informacion disponible.
- Caveat para produccion: el modelo no tiene descargas ni validacion externa; su model card es escasa y no incluye evaluaciones, por lo que no se recomienda su uso en produccion sin una evaluacion propia.
- El enfoque de fusion de LoRA sobre un readout congelado es experimental y no se documentan garantias de estabilidad numerica.

## Enlaces

- HuggingFace: https://huggingface.co/isomsom/zils-lite-body-1
- Modelo base vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
