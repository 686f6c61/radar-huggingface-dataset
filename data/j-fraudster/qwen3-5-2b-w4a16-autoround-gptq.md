# J-Fraudster/Qwen3.5-2B-W4A16-AutoRound-GPTQ

## Resumen

Este repositorio contiene una versión cuantizada **W4A16** (pesos de 4 bits, activaciones de 16 bits) del modelo multimodal **Qwen/Qwen3.5-2B**, generada por el usuario J-Fraudster mediante el algoritmo **AutoRound** de Intel. El modelo base pertenece a la serie Qwen3.5, que según la documentación oficial es una familia de modelos de lenguaje y visión unificados, con arquitectura de mezcla de expertos (MoE) y *gated delta networks*, entrenados con fusión temprana sobre billones de tokens multimodales. Esta variante cuantizada reduce significativamente los requisitos de VRAM, permitiendo ejecutar un VLM en GPUs de consumo como una RTX 3090 o 4090 con 24 GB, manteniendo la torre de visión en BF16 para preservar la precisión en tareas de razonamiento visual y OCR.

El modelo tiene **2.213.241.664 parámetros** (según los safetensors), licencia Apache 2.0 y pipeline `image-text-to-text`. La cuantización emplea un *group size* de 32, calibración con 512 muestras y 1000 iteraciones, y conserva las capas de predicción multi-token (MTP) en bfloat16. Es relevante porque ofrece una vía práctica para desplegar un VLM de la serie Qwen3.5 en entornos con recursos limitados, sin renunciar a las capacidades multimodales del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con *gated delta networks* según documentacion de la serie Qwen3.5; no se especifica en la model card de esta variante |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 (segun configuracion de calibracion y ejemplo de vLLM) |
| Tipos de cuantizacion | W4A16 (4-bit pesos, 16-bit activaciones), group size 32, simetrico |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ/AutoRound) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un VLM que integra visión y lenguaje mediante fusión temprana, entrenado sobre billones de tokens multimodales. Según la documentación de vLLM, la serie Qwen3.5 emplea una arquitectura MoE con *gated delta networks*, una innovación que mejora la eficiencia en el manejo de secuencias largas y el razonamiento multi-paso. La cuantización aquí presentada se realizó con AutoRound de Intel, utilizando un *group size* de 32 (más fino que el estándar de 128), 512 muestras de calibración, una longitud de secuencia de 4096 y 1000 iteraciones de ajuste. La torre de visión se mantuvo en BF16 (`quant_nontext_module=False`) para preservar la precisión en tareas de razonamiento visual y OCR, y las capas de predicción multi-token (`mtp`, `mtp.fc`) también se conservaron en bfloat16. No se proporcionan detalles sobre el entrenamiento del modelo base más allá de lo indicado en la documentación de la serie.

## Capacidades

- Generación de texto e imagen a texto (pipeline `image-text-to-text`), lo que permite procesar entradas visuales y textuales.
- Razonamiento multimodal, codificación, agentes y comprensión visual, según las capacidades declaradas de la serie Qwen3.5.
- Soporte de *tool calling* y *function calling*: no se menciona explícitamente en la model card, pero es una capacidad habitual en la serie Qwen; no confirmada para esta variante.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido (*thinking mode*): no se menciona; la serie Qwen3.5 podría incluirlo, pero no está documentado en este repositorio.

## Casos de uso

- **Asistentes de visión por computadora en edge**: el modelo puede analizar imágenes y responder preguntas sobre su contenido, gracias a su pipeline multimodal y a la torre de visión en BF16 que conserva precisión en OCR y razonamiento visual. Es adecuado para aplicaciones de accesibilidad o inspección visual en dispositivos con GPU de consumo.
- **Chatbots con entrada de imágenes en producción**: al poder servirse con vLLM, se integra en infraestructuras existentes para atender consultas que combinan texto e imágenes, como soporte técnico con capturas de pantalla o atención al cliente con fotos de productos.
- **Generación de código asistida por contexto visual**: el modelo puede interpretar diagramas, esquemas o capturas de pantalla de interfaces y generar o corregir código relacionado, aprovechando su entrenamiento multimodal y sus capacidades de razonamiento.
- **Automatización de documentos**: extracción de información de facturas, formularios o tarjetas de visita mediante OCR y comprensión de layout, gracias a la preservación de la torre de visión en BF16.
- **Despliegue en entornos con VRAM limitada**: con un consumo estimado de 16-18 GB, puede ejecutarse en una RTX 3090 o 4090 de 24 GB, lo que lo hace viable para laboratorios o startups sin acceso a GPUs de alta gama.
- **Investigación en cuantización multimodal**: sirve como referencia para estudiar el impacto de la cuantización W4A16 en modelos VLM, especialmente con *group size* 32 y capas MTP preservadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión tras la cuantización, ni comparativas con el modelo original o con otras cuantizaciones. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: la model card indica 16-18 GB para la versión cuantizada, aunque esta cifra parece inconsistente con los 2.2B parámetros totales (un modelo BF16 de ese tamaño ocuparía ~4.4 GB, no 54 GB). Es posible que la model card esté copiada de otro modelo de mayor tamaño; se recomienda verificar el consumo real con un perfil de memoria.
- GPU recomendadas: RTX 3090, RTX 4090, A5000 (24 GB) según la model card; también podría ejecutarse en GPUs con 16 GB si la VRAM real es menor.
- Opciones de despliegue: vLLM (con `--quantization auto-round` o `--quantization gptq`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se indica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| J-Fraudster/Qwen3.5-2B-W4A16-AutoRound-GPTQ | 2.2B | 4096 | W4A16 (group 32) | Apache 2.0 | VLM, vision tower en BF16 |
| Vishva007/Qwen3.5-9B-W4A16-AutoRound-GPTQ | 9B (estimado) | no disponible | W4A16 | Apache 2.0 | Mismo método de cuantización, mayor tamaño |
| Qwen/Qwen3.5-2B (original) | 2.2B | no disponible | BF16 | Apache 2.0 | Modelo base sin cuantizar, requiere más VRAM |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La model card presenta una discrepancia en los requisitos de VRAM: indica que el modelo original BF16 necesita ~54 GB, lo cual es inconsistente con los 2.2B parámetros declarados. Esta cifra podría provenir de otro modelo y no ser fiable.
- La cuantización W4A16 puede introducir degradación en tareas de razonamiento complejo o generación de código, aunque el *group size* 32 y la preservación de capas MTP en BF16 mitigan parcialmente este efecto.
- No se han publicado benchmarks que validen el rendimiento de esta cuantización específica; se recomienda evaluar el modelo en el caso de uso concreto antes de producción.
- Los idiomas soportados no están documentados; la serie Qwen3.5 podría tener cobertura multilingüe, pero no se confirma para esta variante.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se debe verificar que el modelo base Qwen3.5-2B también esté bajo esa licencia (así se indica en el repositorio).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco validada por la comunidad; se recomienda precaución antes de adoptarlo en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/J-Fraudster/Qwen3.5-2B-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GitHub de AutoRound (Intel): https://github.com/intel/auto-round
- GitHub de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Guía de vLLM para Qwen3.5: https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html
- Documentación de LLM Compressor para Qwen3.5: https://docs.vllm.ai/projects/llm-compressor/en/latest/key-models/qwen3.5/
