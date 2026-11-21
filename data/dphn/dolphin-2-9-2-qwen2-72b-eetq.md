# dphn/dolphin-2.9.2-qwen2-72b-eetq

## Resumen

Dolphin 2.9.2 Qwen2 72B EETQ es una cuantización de 8 bits del modelo Dolphin 2.9.2, un fine-tune sin censura (uncensored) de Qwen2-72B desarrollado por el usuario dphn. El modelo base Qwen2-72B es un transformer decoder-only de Alibaba con 72.717.795.328 parámetros, y esta variante aplica la técnica EETQ (Easy and Efficient Quantization for Transformers) para reducir los pesos a 8 bits, lo que facilita su despliegue en hardware con memoria limitada manteniendo buena parte de la calidad del modelo original.

El propósito de Dolphin 2.9.2 es ofrecer un modelo conversacional alineado pero sin los filtros de rechazo típicos de los modelos instruct convencionales, orientado a tareas de generación de texto y diálogo. Esta versión EETQ está empaquetada en formato safetensors para su uso con la librería transformers y es compatible con Text Generation Inference (TGI) y endpoints compatibles.

La relevancia actual del modelo radica en que permite ejecutar un modelo de 72B en 8 bits con una huella de memoria notablemente inferior a la de los pesos en bf16/fp16, lo que lo hace viable en configuraciones de GPU de gama alta para investigación y despliegues de generación de texto. La información pública disponible sobre esta variante concreta es escasa: la model card se limita a declarar licencia Apache 2.0 e idioma inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 72.717.795.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2-72B soporta contexto largo, pero no se confirma aquí) |
| Tipos de cuantizacion | 8-bit (EETQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (8-bit EETQ) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención por ventanas deslizantes y mecanismos estándar de atención multi-cabeza, del que no se detallan en la información disponible el número de capas, dimensiones ocultas ni configuración exacta de cabezas. Sobre esa base, Dolphin 2.9.2 es un fine-tune conversacional sin censura, presumiblemente entrenado con datos de diálogo y alineación propios del proyecto Dolphin, aunque la model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica de esta variante concreta es la cuantización EETQ a 8 bits, un esquema de cuantización de pesos pensado para inferencia eficiente con transformers y TGI, que reduce el tamaño del repositorio a 75,2 GB frente a los aproximadamente 145 GB que ocuparían los pesos en bf16. No se dispone de información sobre decodificación especulativa, atención lineal u otras optimizaciones adicionales en esta publicación.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y respuesta a instrucciones heredados del fine-tune Dolphin sobre Qwen2.
- Generación de código y matemáticas (capacidad del modelo base Qwen2, no verificada específicamente en esta variante).
- Comportamiento sin censura: menor tendencia a rechazar peticiones que los modelos instruct alineados de forma convencional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar el comportamiento de un LLM de 72B sin filtros de rechazo, útil para analizar sesgos y respuestas en dominios sensibles en entornos controlados.
- Generación creativa de ficción: su naturaleza uncensored lo hace adecuado para narrativa, guiones y diálogos que requieren libertad temática, con contexto conversacional multi-turno.
- Asistente conversacional autoalojado: desplegado con TGI en 8 bits, puede servir como backend de chat para equipos que prefieren infraestructura propia y licencia permisiva.
- Experimentación con cuantización: sirve como caso de estudio para comparar la calidad de EETQ 8-bit frente a los pesos originales en tareas de generación.
- Generación de código en pipelines internos: el modelo base Qwen2 tiene buena competencia en código, y esta variante permite integrarlo en flujos de autocompletado o revisión con menor requisito de VRAM.
- Evaluación comparativa de fine-tunes: útil como referencia en benchmarks internos de modelos sin censura frente a alternativas alineadas de tamaño similar.
- Prototipado rápido de aplicaciones de texto: la licencia Apache 2.0 y el formato safetensors facilitan su integración en demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en 8 bits EETQ, los pesos ocupan aproximadamente 72,7 GB, por lo que se necesita al menos ~80 GB de VRAM para pesos más caché KV y overhead; con contexto largo el requisito crece.
- GPU recomendadas: H100 80 GB, A100 80 GB; configuraciones multi-GPU (por ejemplo, 2× A100 40 GB con tensor parallelism) para mayor margen de contexto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 48 GB en 8 bits; requeriría cuantizaciones adicionales (4-bit) no incluidas en este repositorio.
- Opciones de despliegue: transformers con EETQ, Text Generation Inference (TGI); compatible con endpoints. No se indica soporte para llama.cpp, Ollama o GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dolphin 2.9.2 Qwen2 72B EETQ (este) | 72,7 B | no disponible | 8-bit EETQ | Apache 2.0 | Hugging Face |
| Qwen2-72B-Instruct | 72,7 B | no disponible en esta ficha | bf16/fp16, GPTQ/AWQ en variantes | Apache 2.0 | Hugging Face |
| Llama 3.1 70B Instruct | 70 B | no disponible en esta ficha | bf16, GGUF, GPTQ/AWQ | Llama 3.1 Community License | Hugging Face |
| Dolphin 2.9.2 Llama 3 70B | 70 B | no disponible en esta ficha | bf16, GGUF, GPTQ | Llama 3 Community License | Hugging Face |

La comparativa se limita a datos de tamaño, licencia y disponibilidad; no se dispone de resultados de benchmarks para establecer diferencias de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido sensible, ofensivo o inapropiado; requiere filtros y políticas de uso en producción.
- Riesgo de alucinación inherente a los LLM; no se documentan evaluaciones de fidelidad factual.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: la longitud de contexto no está confirmada en la información disponible; conviene verificarla antes de diseñar aplicaciones con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el contenido generado.
- Cuantización 8-bit: puede degradar ligeramente la calidad frente a los pesos bf16 originales; no se han publicado evaluaciones de esta pérdida.
- Huella de memoria elevada (~75 GB en disco, ~73 GB de pesos en VRAM): no apto para hardware de consumo sin cuantizaciones adicionales.
- Información pública muy escasa (11 descargas, 1 like): no hay documentación sobre datos de entrenamiento, sesgos conocidos ni procedencia del dataset de fine-tune.

## Enlaces

- Hugging Face: https://huggingface.co/dphn/dolphin-2.9.2-qwen2-72b-eetq
- Modelo base Qwen2-72B (referencia): https://huggingface.co/Qwen/Qwen2-72B
- Proyecto Dolphin (referencia del autor): https://huggingface.co/dphn
- EETQ (librería de cuantización): https://github.com/NetEase-FuXi/EETQ
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
