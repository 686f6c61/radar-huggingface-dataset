# qatfactory/Qwen3.5-9B-NVFP4-QAD-Code-32K

## Resumen

Qwen3.5-9B-NVFP4-QAD-Code-32K es una cuantizacion del modelo base Qwen/Qwen3.5-9B publicada por el usuario qatfactory en HuggingFace. Se trata de una version entrenada con cuantizacion consciente del entrenamiento (QAT, quantization-aware training) en formato NVFP4, el formato de 4 bits de NVIDIA optimizado para las GPU Blackwell, y empaquetada mediante la libreria compressed-tensors para su uso directo en vLLM. El sufijo "Code-32K" del nombre sugiere una especializacion en codigo y una ventana de contexto de 32.000 tokens, aunque estos detalles no se confirman en la informacion disponible del repositorio.

El modelo cuenta con 9.409.813.744 parametros (aproximadamente 9,4 mil millones) y un tamano de repositorio de 8,9 GB, coherente con una cuantizacion de 4 bits mas metadatos. La licencia declarada es Apache 2.0, heredada del modelo base Qwen3.5-9B. El acceso esta restringido: es necesario aceptar las condiciones en HuggingFace antes de poder descargar los pesos.

Su relevancia radica en que combina QAT con NVFP4 para reducir el coste de inferencia en hardware Blackwell manteniendo, en teoria, una calidad cercana al modelo original en tareas de codigo. No obstante, el repositorio no incluye informacion sobre datos de entrenamiento, benchmarks ni evaluaciones de calidad, por lo que su adopcion en produccion debe acompanarse de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (inferido del sufijo "32K"; no confirmado en la model card) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA) con QAT; empaquetado compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9,4 mil millones de parametros. La informacion disponible no detalla la configuracion interna del modelo base (numero de capas, dimensiones ocultas, tipo de atencion ni composicion del dataset de preentrenamiento).

La innovacion principal de esta variante es el proceso de cuantizacion: se ha aplicado quantization-aware training (QAT) para adaptar los pesos al formato NVFP4, un esquema de 4 bits con escalas compartidas por bloques disenado por NVIDIA para aprovechar los tensor cores FP4 de las arquitecturas Blackwell. El resultado se empaqueta con compressed-tensors, lo que permite cargarlo directamente en vLLM sin conversion adicional. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset de calibracion, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-9B.
- Generacion de codigo, segun la especializacion implicita en el sufijo "Code" del nombre (no verificada en la model card).
- Procesamiento de contextos de hasta 32.000 tokens (segun el nombre del modelo; no confirmado).
- Inferencia optimizada en vLLM con pesos NVFP4 y compressed-tensors.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en IDE: el modelo puede integrarse como backend de autocompletado y generacion de funciones en editores, aprovechando su especializacion en codigo y su contexto de 32K para incluir varios ficheros como referencia.
- Revision de pull requests: con 32K de contexto puede analizar diffs extensos y ficheros relacionados, generando comentarios sobre posibles bugs o mejoras de estilo dentro de un pipeline de CI/CD.
- Generacion de tests unitarios: a partir de una firma de funcion y su implementacion, el modelo puede producir casos de prueba, reduciendo el trabajo manual en proyectos con cobertura baja.
- Migracion de codigo entre lenguajes o frameworks: el contexto largo permite pasar fragmentos completos de un modulo y solicitar una traduccion coherente, manteniendo nombres y APIs.
- Documentacion tecnica automatica: generacion de docstrings y documentacion de API a partir del codigo fuente, con la ventaja de procesar modulos enteros en una sola pasada.
- Despliegue de bajo coste en GPU Blackwell: al estar cuantizado en NVFP4, permite servir un modelo de 9B con menor huella de VRAM y mayor throughput que su equivalente en BF16, adecuado para entornos con RTX 50 o GPUs de centro de datos Blackwell.
- Chatbot tecnico de soporte interno: el modelo puede responder preguntas sobre una base de codigo propia incluyendo fragmentos relevantes en el contexto de 32K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para los pesos NVFP4 (8,9 GB de repositorio incluyen metadatos y posibles tensores sin cuantizar), mas overhead de KV cache segun contexto y batch.
- GPU recomendadas: NVIDIA Blackwell (B200, RTX 50 series), unico hardware con soporte nativo de tensor cores FP4 para NVFP4.
- Compatibilidad con GPU consumer: si, en principio en RTX 50 series (por ejemplo RTX 5070/5080/5090) gracias al soporte FP4; no compatible de forma nativa con RTX 40 o A100/H100 sin emulacion.
- Opciones de despliegue: vLLM (libreria declarada en el repositorio), con backend compressed-tensors. Otros motores (llama.cpp, Ollama, TGI) no estan indicados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-NVFP4-QAD-Code-32K | 9,4B | 32K (inferido) | NVFP4 QAT | Apache 2.0 | Gated en HuggingFace |
| Qwen/Qwen3.5-9B (base) | 9,4B | no disponible | BF16/FP16 | Apache 2.0 | Publico en HuggingFace |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | 9,4B | segun base | 4-8 bits | Apache 2.0 | Variable |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en HuggingFace antes de la descarga.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, calibracion, evaluaciones ni limitaciones conocidas.
- La especializacion en codigo y el contexto de 32K se infieren del nombre del modelo y no estan confirmados en la informacion disponible.
- Riesgo de degradacion por cuantizacion: aunque el QAT mitiga la perdida de calidad frente a PTQ, no se aportan metricas que la cuantifiquen.
- Dependencia de hardware: NVFP4 requiere GPU Blackwell para aprovecharse; en otro hardware el rendimiento o la compatibilidad pueden verse comprometidos.
- Riesgo de alucinacion y sesgos: no documentados; deben asumirse los del modelo base Qwen3.5-9B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-QAD-Code-32K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
