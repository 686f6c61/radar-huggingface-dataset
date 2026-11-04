# qatfactory/Qwen3.5-9B-MXFP4-QAD

## Resumen

Qwen3.5-9B-MXFP4-QAD es una versión cuantizada del modelo base Qwen/Qwen3.5-9B, publicada por el usuario qatfactory bajo licencia Apache 2.0. Se trata de una cuantización en formato MXFP4 (Microscaling Floating Point de 4 bits) obtenida mediante quantization-aware training (QAT), es decir, el proceso de cuantización se integra en el entrenamiento en lugar de aplicarse a posteriori. El resultado es un checkpoint de 9.409.813.744 parámetros totales empaquetado en safetensors con el formato compressed-tensors, listo para servirse con vLLM.

El modelo hereda del Qwen3.5-9B las capacidades generales de la familia Qwen 3.5 (generación de texto, razonamiento, código y tool calling), pero con un footprint de memoria notablemente reducido gracias a los pesos de 4 bits. El repositorio ocupa 8,7 GB, lo que lo hace atractivo para despliegues en GPUs de gama alta de consumo o en nodos con VRAM limitada, manteniendo la fidelidad numérica que aporta el QAT frente a una cuantización post-entrenamiento convencional.

Es relevante ahora porque combina dos tendencias del ecosistema open source: por un lado, la familia Qwen 3.5 como referencia de modelos densos de tamaño medio; por otro, la adopción de MXFP4 y compressed-tensors como formato estándar para inferencia eficiente en vLLM. No obstante, el acceso está restringido (gated) y el repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5); detalles de capas y atencion no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, microscaling), formato compressed-tensors; 8-bit indicado en tags |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de la familia Qwen 3.5, aunque la informacion proporcionada no detalla el numero de capas, dimensiones ocultas, tipo de atencion ni la composicion del dataset de entrenamiento original. Lo que si se conoce es el proceso de cuantizacion: se ha aplicado quantization-aware training (QAT) para producir pesos MXFP4, un formato de 4 bits con escalado por bloques (microscaling) que reduce el error de cuantizacion respecto a esquemas de punto fijo tradicionales. El checkpoint resultante se empaqueta con la libreria compressed-tensors, que permite a vLLM cargar y ejecutar los pesos cuantizados de forma nativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del corpus, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. La aportacion tecnica principal de esta publicacion es, por tanto, el pipeline QAT hacia MXFP4 y su integracion con vLLM, no cambios arquitectonicos sobre el modelo original.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-9B (no verificadas de forma independiente en esta ficha).
- Generacion de codigo y matematicas, presumiblemente soportadas por la familia Qwen 3.5, aunque sin benchmarks publicados en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno en el repositorio).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia optimizada en vLLM gracias al formato compressed-tensors y MXFP4.

## Casos de uso

- Despliegue en vLLM con VRAM ajustada: el formato MXFP4 reduce el peso de los pesos a aproximadamente 4 bits por parametro, lo que permite servir un modelo de 9B en GPUs con menos memoria que la requerida por una version en bf16, manteniendo la fidelidad del QAT.
- Prototipado de asistentes conversacionales: el modelo puede emplearse como backend de chat multi-turno en entornos de desarrollo donde se prioriza el throughput y el coste por token sobre la precision absoluta.
- Generacion de codigo en pipelines internos: si el modelo base conserva las capacidades de codigo de Qwen 3.5, puede integrarse en herramientas de autocompletado o revision de codigo ejecutadas en infraestructura propia con GPUs de gama alta de consumo.
- Evaluacion de tecnicas de cuantizacion: el checkpoint sirve como referencia para comparar QAT+MXFP4 frente a cuantizaciones post-entrenamiento (GPTQ, AWQ, GGUF) sobre el mismo modelo base.
- Investigacion en eficiencia de inferencia: util para medir latencia y throughput de MXFP4 en vLLM frente a otros formatos, en entornos academicos o de laboratorio.
- Fine-tuning ligero sobre pesos cuantizados: aunque no se documenta soporte explicito, el formato compressed-tensors permite experimentar con adaptadores sobre la base cuantizada en flujos de investigacion.
- Servicio de razonamiento en nodos edge con GPU: al reducir el footprint a 8,7 GB en disco, es viable en estaciones de trabajo con una sola GPU de 24 GB o superior, siempre que se acepte la licencia y las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos MXFP4 de 4 bits sobre 9.409.813.744 parametros, el peso teorico de los pesos ronda los 4,7 GB; con overhead de KV cache, activaciones y buffers de vLLM, es razonable estimar un consumo de 6-10 GB en funcion de la longitud de contexto y el tamano de batch. No se dispone de mediciones oficiales.
- GPU recomendadas: no disponibles de forma oficial; por tamano, cabria esperar compatibilidad con GPUs de 16-24 GB (RTX 4090, RTX 4080, A10, L4) y, con holgura, con A100 y H100.
- GPU de consumo: previsiblemente si en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB), sujeto a la longitud de contexto efectiva.
- Opciones de despliegue: vLLM es el runtime indicado por la libreria del repositorio; llama.cpp, Ollama y TGI no estan confirmados para este formato MXFP4/compressed-tensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-MXFP4-QAD | 9,4 B | No disponible | MXFP4 (QAT) | Apache 2.0 | Gated |
| Qwen/Qwen3.5-9B (base) | 9,4 B | No disponible | bf16/fp16 | Apache 2.0 | Publico (segun repositorio base) |
| Alternativas cuantizadas de la familia Qwen 3.5 | No disponible | No disponible | GPTQ/AWQ/GGUF tipicamente | Apache 2.0 | Variable |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar el modelo, lo que puede retrasar pipelines automatizados.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad en el momento de la publicacion.
- Sin benchmarks publicados: no es posible afirmar que la calidad se mantenga respecto al modelo base; la cuantizacion a 4 bits puede degradar tareas sensibles a la precision numerica.
- Idiomas no declarados: no se puede garantizar cobertura multilingue sin consultar la ficha del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos; el modelo base no documenta mitigaciones especificas en la informacion disponible.
- Sesgos: no documentados en la informacion proporcionada; se heredan presumiblemente los del modelo base.
- Compatibilidad limitada de runtimes: el formato compressed-tensors/MXFP4 esta optimizado para vLLM; otros motores (llama.cpp, Ollama, TGI) pueden no soportarlo.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones adicionales del acceso gated deben revisarse antes de desplegar en produccion.
- Fecha de creacion futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- HuggingFace: https://huggingface.co/qatfactory/Qwen3.5-9B-MXFP4-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
