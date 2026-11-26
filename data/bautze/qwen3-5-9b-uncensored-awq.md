# bautze/Qwen3.5-9B-uncensored-AWQ

## Resumen

Qwen3.5-9B-uncensored-AWQ es una cuantización de 4 bits en formato AWQ (W4A16) del modelo Qwen3.5-9B, publicada por el usuario bautze en Hugging Face. El modelo base es Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parámetros, y sobre él se ha aplicado un ajuste fino orientado a eliminar los mecanismos de rechazo y alineación restrictiva ("uncensored"), seguido de una cuantización con llm-compressor en el formato compressed-tensors.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de la familia Qwen 3.5 (arquitectura reciente con torre de visión, según se deduce de la mención al "vision tower" en la model card), un proceso de cuantización AWQ de 4 bits que reduce el peso del repositorio a 8,6 GB, y un ajuste fino sin censura que lo hace atractivo para experimentación con contenido no filtrado. El resultado es un modelo multimodal (texto e imagen) que puede servirse con vLLM en GPUs de gama alta de consumo.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de noviembre de 2026. La información pública disponible es muy escasa: la model card es mínima y no incluye detalles sobre el dataset de ajuste fino, los benchmarks ni los idiomas soportados, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con torre de visión |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ W4A16 (4 bits para pesos, 16 bits para activaciones); vision tower y lm_head en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, AWQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de la familia Qwen 3.5, con aproximadamente 9,4 mil millones de parámetros. La model card menciona explícitamente una "vision tower" mantenida en BF16, lo que confirma que se trata de un modelo multimodal con capacidad de procesamiento de imágenes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

El proceso de ajuste fino "uncensored" no está documentado en la model card: se desconoce el dataset utilizado, el número de pasos, la técnica (SFT, DPO, abliteration, etc.) y si se preservaron las capacidades multimodales durante el ajuste. La cuantización sí está descrita con cierto detalle: se aplicó AWQ de 4 bits (W4A16) mediante llm-compressor en formato compressed-tensors, con calibración sobre 256 muestras de ultrachat_200k. La torre de visión y la cabeza de lenguaje (lm_head) se mantuvieron en BF16 para preservar la calidad en esas componentes. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-9B.
- Procesamiento de imágenes (visión) gracias a la torre de visión conservada en BF16, aunque no se detalla el rango de resoluciones ni el número de tokens visuales.
- Generación de código y matemáticas: capacidad esperable en la familia Qwen, pero no confirmada con benchmarks en la información disponible.
- Tool calling y function calling: no confirmado explícitamente en la model card; depende de las capacidades del modelo base.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingües: no disponibles (la model card no lista idiomas).
- Modo "uncensored": el ajuste fino elimina total o parcialmente los rechazos de seguridad, lo que permite generar contenido que el modelo base rechazaría.
- Compatibilidad con vLLM: la model card incluye el comando `vllm serve bautze/Qwen3.5-9B-uncensored-AWQ`, lo que confirma soporte para ese motor de inferencia.

## Casos de uso

- Experimentación con modelos sin alineación: investigadores que estudian el comportamiento de modelos "uncensored" pueden usar este checkpoint para comparar respuestas con el modelo base alineado, gracias a que la cuantización AWQ reduce el coste de despliegue a una sola GPU.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo base rechazaría; el ajuste uncensored y el contexto multimodal permiten además incorporar imágenes de referencia.
- Análisis de imágenes con descripción detallada: la torre de visión en BF16 permite tareas de captioning, VQA y descripción de escenas, con la ventaja de que el modelo no aplicará filtros de contenido sobre lo que describa.
- Despliegue en producción con vLLM: el comando de servicio incluido en la model card permite levantar un endpoint OpenAI-compatible; la cuantización W4A16 reduce la VRAM necesaria frente al modelo en BF16, lo que abarata el coste por token en GPUs de 24 GB.
- Prototipado rápido en una sola GPU de consumo: con 8,6 GB de pesos, el modelo cabe en GPUs como la RTX 4090 o la RTX 3090, lo que facilita iterar en local sobre aplicaciones multimodales sin infraestructura de datacenter.
- Investigación sobre cuantización: el checkpoint sirve como caso de estudio de AWQ con componentes mixtas (capas cuantizadas a 4 bits y torre de visión/lm_head en BF16), útil para evaluar la degradación de calidad en modelos multimodales.
- Base para ajuste fino adicional: al estar en formato compressed-tensors y con licencia Apache 2.0, puede servir como punto de partida para LoRA o QLoRA sobre tareas específicas sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas multimodales, ni comparaciones con el modelo base en BF16 para medir la degradación introducida por la cuantización AWQ.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 8,6 GB en disco; en vLLM con AWQ W4A16 se necesita aproximadamente 10-12 GB de VRAM para pesos y overhead, más la caché KV, que depende de la longitud de contexto (no disponible). Para contextos largos, se recomienda al menos 16-24 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S para producción con contextos largos; RTX 4090 (24 GB) y RTX 3090 (24 GB) para desarrollo y despliegue en una sola tarjeta.
- ¿Cabe en GPU de consumo? Sí: con 8,6 GB de pesos, cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con contextos cortos, en GPUs de 12 GB como la RTX 3060 o la RTX 4070.
- Opciones de despliegue: vLLM es el motor recomendado por la model card (`vllm serve bautze/Qwen3.5-9B-uncensored-AWQ`). El formato compressed-tensors AWQ es compatible con vLLM y con TGI; no se confirma compatibilidad con llama.cpp u Ollama, que requieren formato GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| bautze/Qwen3.5-9B-uncensored-AWQ | ~9,4 mil millones | No disponible | AWQ W4A16 | Apache 2.0 | Ajuste uncensored + vision tower en BF16; 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9,4 mil millones | No disponible | BF16 original | Apache 2.0 (presumible) | Modelo alineado original; sin ajuste uncensored |
| Alternativas uncensored de ~8-9B (p. ej. variantes de Llama 3.1 8B o Qwen2.5 7B) | 7-9 mil millones | 32K-128K (segun modelo) | AWQ, GPTQ, GGUF | Licencias variables | Ecosistema más maduro, pero sin visión en la mayoría de casos |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con el modelo base ni con alternativas de la misma categoría. La comparativa se limita a parámetros, licencia y formato, sin métricas de calidad.

## Limitaciones y advertencias

- El ajuste "uncensored" elimina o reduce los rechazos de seguridad: el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito. No es apto para aplicaciones orientadas al público general sin capas de moderación adicionales.
- No hay documentación sobre el dataset de ajuste fino: se desconoce si se introdujeron sesgos nuevos, si se degradaron capacidades del modelo base o si el ajuste afectó a la torre de visión.
- Riesgo de alucinación: inherente a los modelos de ~9B, agravado por la falta de benchmarks que permitan cuantificar la degradación frente al modelo base.
- La cuantización AWQ de 4 bits puede degradar tareas sensibles a la precisión (matemáticas, código, razonamiento largo); no se ha publicado ninguna evaluación al respecto.
- Longitud de contexto e idiomas soportados no disponibles: no se puede garantizar el comportamiento en contextos largos ni en castellano.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el contenido generado ni sobre la procedencia de los datos de ajuste fino; el usuario asume la responsabilidad legal del uso.
- Repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia de que el checkpoint funcione correctamente más allá del comando de vLLM incluido.
- Compatibilidad limitada: al estar en formato compressed-tensors AWQ, no se puede usar directamente con llama.cpp u Ollama sin conversión previa a GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bautze/Qwen3.5-9B-uncensored-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- llm-compressor (herramienta de cuantización): https://github.com/vllm-project/llm-compressor
- compressed-tensors (formato de pesos): https://github.com/neuralmagic/compressed-tensors
- vLLM (motor de inferencia): https://github.com/vllm-project/vllm
- Dataset de calibración ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
