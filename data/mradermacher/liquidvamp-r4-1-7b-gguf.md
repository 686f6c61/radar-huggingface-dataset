# mradermacher/LiquidVamp-R4-1.7B-GGUF

## Resumen

LiquidVamp-R4-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo LiquidVamp-R4-1.7B, desarrollado originalmente por WamphyreAI y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) construido sobre la arquitectura LFM3 (Liquid Foundation Model 3) de Liquid AI, y afinado mediante LoRA a partir del modelo base. La variante "abliterated" indica que se ha aplicado una técnica de eliminación de rechazos (refusal ablation) para reducir las respuestas evasivas del modelo, y las etiquetas "code" y "tool-use" sugieren un enfoque hacia generación de código y uso de herramientas.

El modelo está pensado para despliegue local en hardware modesto: gracias a sus 1,7B de parámetros, las cuantizaciones GGUF ocupan entre 0,9 GB (Q2_K) y 3,6 GB (f16), lo que permite ejecutarlo en GPUs de consumo e incluso en CPU. Soporta inglés y español, y se distribuye bajo la licencia lfm-open-license-v1.0, una licencia propia de Liquid AI con posibles restricciones para uso comercial.

Su relevancia actual radica en la combinación de un tamaño reducido, soporte de tool calling y una ventana de contexto (no especificada en la información disponible) que, junto con el formato GGUF, lo hace candidato para prototipos de agentes locales, asistentes de código y aplicaciones conversacionales en entornos con recursos limitados. No obstante, se trata de un modelo experimental y con escasa tracción comunitaria (0 likes, 662 descargas en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Model 3), transformer; detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (aproximadamente 1,7B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, es |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 de Liquid AI, una familia de transformers (la model card no detalla si incorpora componentes híbridos o de atención lineal propios de la línea Liquid). El modelo original LiquidVamp-R4-1.7B fue afinado mediante LoRA sobre una base LFM3 de 1,7B, según indican las etiquetas "lora" y "base_model:adapter:WamphyreAI/LiquidVamp-R4-1.7B". La etiqueta "abliterated" señala que se ha aplicado una técnica de abliteración para eliminar la dirección de rechazo en el espacio de activaciones, reduciendo la tendencia a declinar peticiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá de las propias de la arquitectura LFM3. La información sobre el proceso de cuantización sí está disponible: mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1) a partir de los pesos en formato Hugging Face, y ofrece además cuantizaciones ponderadas/imatrix en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés y español.
- Generación y asistencia de código, según la etiqueta "code" del modelo.
- Uso de herramientas (tool calling / function calling), según la etiqueta "tool-use".
- Conversación multi-turno (etiqueta "conversational").
- Comportamiento "abliterated": menor tendencia a rechazar peticiones, lo que puede ser útil para investigación sobre alineación y seguridad.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de Vulkan en el ecosistema GGUF (etiqueta "vulkan"), relevante para inferencia en GPUs no NVIDIA.
- No se ha confirmado soporte de visión, audio, modo thinking ni agentes multi-paso más allá de lo que implica el tool calling.

## Casos de uso

- Asistente de código local: el modelo puede integrarse en editores o CLIs para autocompletado y generación de fragmentos de código, ejecutándose en una GPU de consumo con cuantización Q4_K_M (1,2 GB) y baja latencia.
- Agentes locales con tool calling: gracias a la etiqueta "tool-use", puede conectarse a funciones externas (APIs, calculadoras, sistemas de ficheros) en prototipos de agentes que corren íntegramente en local sin depender de la nube.
- Chatbot de atención al cliente en español: su soporte de español y su naturaleza conversacional permiten desplegar un asistente multi-turno en entornos con recursos limitados, aunque la ventana de contexto no está documentada.
- Investigación sobre abliteración y seguridad: al ser un modelo abliterated, sirve para estudiar el comportamiento de modelos sin rechazo y comparar con la versión base en tareas de evaluación de alineación.
- Despliegue en hardware embebido o CPU: las cuantizaciones Q2_K (0,9 GB) y Q3_K_S (1,0 GB) permiten ejecución en dispositivos con poca memoria mediante llama.cpp u Ollama.
- Generación de texto en español para prototipos: útil para pruebas de concepto de resúmenes, reescritura o generación de contenido donde no se requiera un modelo grande.
- Inferencia en GPUs AMD o Intel: la etiqueta "vulkan" sugiere compatibilidad con backends Vulkan de llama.cpp, útil en entornos sin CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~0,9 GB; Q3_K_S ~1,0 GB; IQ4_XS ~1,1 GB; Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. Añadir overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna con 4 GB o más de VRAM, e incluso en CPU con cuantizaciones Q2_K-Q4_K.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; también es posible usar el modelo base en transformers con safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (1,7B), se espera un throughput alto en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LiquidVamp-R4-1.7B-GGUF | 1,7B | no disponible | lfm-open-license-v1.0 | GGUF | Abliterated, tool-use, en/es |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según documentación pública) | Apache 2.0 | safetensors, GGUF | Modelo generalista ampliamente adoptado |
| Llama-3.2-1B-Instruct | 1,2B | 128K (según documentación pública) | Llama 3.2 Community License | safetensors, GGUF | Ecosistema amplio, multilingüe |
| SmolLM2-1.7B-Instruct | 1,7B | 8K (según documentación pública) | Apache 2.0 | safetensors, GGUF | Enfocado en eficiencia y código |

Nota: los datos de contexto y licencia de los modelos comparables provienen de documentación pública general y no de la información proporcionada en esta ficha; verificar antes de usarlos en producción. No se dispone de benchmarks de LiquidVamp-R4-1.7B para comparar rendimiento.

## Limitaciones y advertencias

- Modelo experimental: la etiqueta "experimental" indica que no está validado para producción.
- Escasa tracción comunitaria: 0 likes y 662 descargas en el momento de la consulta, lo que limita la evidencia empírica sobre su calidad.
- Alucinaciones: como todo modelo de 1,7B, la tasa de alucinación es probablemente alta en tareas de conocimiento factual; no hay evaluaciones publicadas.
- Sesgos: no se documentan sesgos específicos, pero el entrenamiento sobre datos no especificados puede introducir sesgos de idioma y cultura.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Idiomas: solo inglés y español; no se garantiza un rendimiento adecuado en otras lenguas.
- Licencia: lfm-open-license-v1.0 es una licencia propia de Liquid AI; es necesario revisar sus términos antes de uso comercial, ya que puede incluir restricciones.
- Abliteration: la eliminación de rechazos puede aumentar la probabilidad de generar contenido inapropiado o dañino; requiere moderación externa en producción.
- Cuantizaciones bajas (Q2_K, Q3_K) degradan la calidad; para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LiquidVamp-R4-1.7B-GGUF
- Modelo base: https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LiquidVamp-R4-1.7B-i1-GGUF
- Página de descarga del cuantizador: https://hf.tst.eu/model#LiquidVamp-R4-1.7B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
