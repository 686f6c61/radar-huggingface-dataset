# aisingapore/Nemotron-SEA-LION-v5-E4B-FP8

## Resumen

Nemotron-SEA-LION-v5-E4B-FP8 es la versión cuantizada en FP8 del modelo aisingapore/Nemotron-SEA-LION-v5-E4B, desarrollado por el AI Products Pillar de AI Singapore y financiado por el National Research Foundation de Singapur. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una colección de modelos diseñada específicamente para dar cobertura de alta calidad a las lenguas del sudeste asiático, una región tradicionalmente infrarrepresentada en los grandes modelos multilingües. El modelo base parte de la arquitectura NVIDIA Nemotron 3.5 Bolt E4B y ha sido adaptado por AI Singapore para el ecosistema lingüístico regional.

La relevancia de esta variante FP8 radica en su eficiencia de despliegue: reduce el peso de los pesos de 16,0 GB (BF16) a 12,0 GB, manteniendo el tokenizador, la plantilla de chat y los valores de muestreo sin cambios. Esto permite servir el modelo en GPUs con menos VRAM sin renunciar a la ventana de contexto de 64K tokens ni a las capacidades multimodales (visión y audio), cuyos encoders permanecen en BF16. Con licencia MIT, es una opción atractiva para producción comercial en la región.

El modelo es de tipo small language model, con aproximadamente 8.000 millones de parámetros totales, y soporta nueve idiomas: birmano, chino, inglés, indonesio, filipino, malayo, tamil, tailandés y vietnamita. Incluye modo de razonamiento (thinking) activado por defecto, tool calling y un modo conversacional para respuestas breves de estilo hablado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4), basada en NVIDIA Nemotron 3.5 Bolt E4B |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 64K tokens |
| Tipos de cuantizacion | FP8 block-wise en capas lineales; encoders de visión y audio en BF16; también disponible INT4 y GGUF |
| Idiomas soportados | birmano, chino, inglés, indonesio, filipino, malayo, tamil, tailandés, vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), 12,1 GB de repo |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura NVIDIA Nemotron 3.5 Bolt E4B, un transformer multimodal con pipeline image-text-to-text que integra encoders de visión y audio. La variante FP8 cuantiza la mayoría de las capas lineales en formato FP8 block-wise mediante la herramienta llm-compressor del proyecto vLLM, mientras que los encoders de visión y audio, el tokenizador, la plantilla de chat y los parámetros de muestreo permanecen idénticos al modelo base en BF16. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset en la información proporcionada; la model card remite a la ficha del modelo base para los detalles de entrenamiento y a la ficha de NVIDIA para los datos, evaluación de seguridad y limitaciones del modelo original.

La adaptación de AI Singapore se centra en el ajuste para las lenguas del sudeste asiático, aunque no se especifican en la información disponible los detalles de RLHF, DPO ni las innovaciones técnicas concretas del proceso de alineación. El modelo soporta modo de razonamiento (thinking) con presupuesto de razonamiento configurable en tiempo de ejecución, así como un modo conversacional opcional para respuestas de estilo hablado.

## Capacidades

- Generación de texto y razonamiento multi-step con modo thinking activado por defecto y presupuesto de razonamiento configurable.
- Capacidades multimodales: procesamiento de imagen, vídeo y audio (pipeline image-text-to-text), aunque en el ejemplo de despliegue con vLLM se limitan las modalidades multimedia a cero.
- Tool calling y function calling, con soporte de parser gemma4 y auto-tool-choice en vLLM.
- Soporte de agentes y razonamiento multi-turno gracias a la ventana de 64K tokens.
- Capacidades multilingües en nueve idiomas del sudeste asiático más inglés y chino.
- Modo conversacional (`conversational_mode`) para respuestas breves de estilo oral.
- Razonamiento en formato de puntos y respuestas estructuradas bajo instrucción.

## Casos de uso

- Atención al cliente automatizada en lenguas del sudeste asiático: el modelo puede gestionar conversaciones multi-turno con contexto de 64K tokens en indonesio, malayo, tailandés o vietnamita, cubriendo consultas de soporte en una sola sesión sin perder el hilo.
- Asistencia documental y logística regional: como en el ejemplo de la model card, responder consultas sobre documentación de exportación, tiempos de tránsito y riesgos de cadena de frío en rutas comerciales intra-ASEAN, con salida estructurada en puntos.
- Generación de código y automatización de pipelines: el soporte de tool calling permite integrar el modelo en flujos de CI/CD para generar parches, invocar funciones externas y orquestar tareas de desarrollo.
- Procesamiento multimodal de documentos: al conservar los encoders de visión en BF16, puede extraer información de imágenes y documentos escaneados en contextos multilingües.
- Agentes de razonamiento con presupuesto controlado: el modo thinking configurable permite ajustar el coste computacional por consulta en despliegues de agentes autónomos.
- Traducción y localización regional: cubre traducciones entre inglés, chino y las lenguas del sudeste asiático, útil para localización de productos y contenidos.
- Análisis de audio y transcripción contextual: los encoders de audio en BF16 permiten tareas de comprensión de audio en el ecosistema lingüístico regional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha del modelo base para la evaluación completa en precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan 12,0 GB, por lo que se recomienda al menos 16 GB de VRAM para dejar margen para el contexto y las cachés KV.
- GPU recomendadas: A100, H100, L40S y GPUs con soporte de FP8 nativo; también funciona en RTX 4090 (24 GB) con margen para contexto moderado.
- Cabe en GPUs consumer de gama alta: RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 16 GB el contexto útil se reduce notablemente.
- Opciones de despliegue: vLLM (recomendado, con `--reasoning-parser gemma4` y `--tool-call-parser gemma4`); SGLang 0.5.23 no puede cargar esta build cuantizada; para llama.cpp existe la variante GGUF del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-SEA-LION-v5-E4B-FP8 | ~8B | 64K | FP8 (12,0 GB) | MIT | Hugging Face |
| Nemotron-SEA-LION-v5-E4B (BF16) | ~8B | 64K | BF16 (16,0 GB) | MIT | Hugging Face |
| Nemotron-SEA-LION-v5-E4B-INT4 | ~8B | 64K | INT4 | MIT | Hugging Face |
| Nemotron-SEA-LION-v5-E4B-GGUF | ~8B | 64K | GGUF (llama.cpp) | MIT | Hugging Face |

Las alternativas directas son las otras variantes de cuantización del mismo modelo base; no se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de seguridad adicionales.
- No se ha probado la robustez frente a prompting adversarial.
- Como todo LLM, puede alucinar y generar contenido irrelevante o ficticio no fundamentado en el contexto; es necesario validar las respuestas.
- La model card remite a la ficha de NVIDIA Nemotron 3.5 Bolt E4B para los sesgos y limitaciones del modelo original, que no se detallan aquí.
- El soporte multilingüe se limita a los nueve idiomas declarados; el rendimiento fuera de ese conjunto no está garantizado.
- La licencia MIT permite uso comercial, pero no exime de responsabilidad por el uso de los pesos.
- SGLang 0.5.23 no puede cargar esta build cuantizada; verificar compatibilidad antes de desplegar.
- En el ejemplo de vLLM se desactivan las modalidades multimedia (`--limit-mm-per-prompt`), lo que sugiere que el despliegue multimodal puede requerir configuración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-FP8
- Modelo base BF16: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B
- Variante INT4: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-INT4
- Variante GGUF: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-GGUF
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Modelo NVIDIA base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Sitio de SEA-LION: https://sea-lion.ai
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia MIT: https://mit-license.org/
