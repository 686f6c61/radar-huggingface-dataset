# nebulette/in-fusion-v

## Resumen

in-fusion-v es un modelo de generación de texto multimodal desarrollado por el usuario nebulette, construido como un fine-tuning del modelo base taobao-mnn/MNN-Pocket-0.3B, que a su vez deriva de la familia Qwen3. El modelo incorpora módulos de visión denominados "in-fusion vision modules", lo que le permite procesar parches de imagen delimitados por tokens especiales (`<|vision_start|>` y `<|vision_end|>`) junto con texto en un mismo flujo conversacional.

Con 375.314.688 parámetros totales (aproximadamente 0,38 mil millones), se trata de un modelo de muy pequeño tamaño, orientado a despliegue en entornos con recursos limitados. Su entrenamiento se centró en datos de 50.000 etiquetas comunes de booru procedentes de gelbooru, lo que sugiere una especialización en tareas de etiquetado y descripción de imágenes de tipo anime.

Es relevante por su enfoque en la integración eficiente de visión en un modelo compacto mediante módulos in-fusion, y por su compatibilidad con el ecosistema MNN (Mobile Neural Network) de Alibaba, pensado para inferencia en dispositivos móviles y edge. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 con módulos de visión in-fusion (detalles no disponibles) |
| Parametros totales | 375.314.688 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de taobao-mnn/MNN-Pocket-0.3B, un modelo de la familia Qwen3 optimizado para el runtime MNN. Sobre esta base se añaden módulos de visión "in-fusion", cuya implementación técnica concreta no se detalla en la información disponible. El formato de entrada combina tokens especiales de visión (`<|vision_start|>` y `<|vision_end|>`) que envuelven los parches de imagen dentro de una plantilla conversacional estilo ChatML (`<|im_start|>user\n...<|im_end|>`).

Los datos de entrenamiento consisten en 50.000 etiquetas comunes de booru extraídas de gelbooru, con la restricción de que cada imagen de muestra contiene al menos una etiqueta única. No se especifica el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card referencia el identificador arXiv 2611.17334, presumiblemente el artículo que describe los módulos in-fusion, aunque no se aportan más detalles sobre el proceso de alineación.

## Capacidades

- Generación de texto conversacional en formato ChatML.
- Procesamiento de imágenes mediante parches codificados entre tokens de visión.
- Etiquetado y descripción de imágenes, especialmente orientado a contenido de tipo anime/booru.
- Generación multimodal texto-imagen dentro de un mismo flujo de conversación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Etiquetado automático de imágenes anime: el modelo se entrenó específicamente con etiquetas de booru de gelbooru, por lo que puede generar etiquetas descriptivas para imágenes de este dominio, útil en pipelines de catalogación de galerías.
- Moderación y clasificación de contenido visual: al procesar parches de imagen junto con texto, puede emplearse para clasificar o describir imágenes en plataformas de contenido generado por usuarios.
- Asistentes conversacionales ligeros con entrada de imagen: su tamaño de 0,38B permite integrarlo en aplicaciones móviles o edge mediante el runtime MNN, ofreciendo respuestas sobre imágenes sin depender de la nube.
- Prototipado rápido de pipelines multimodales: sirve como banco de pruebas para experimentar con los módulos in-fusion y el formato de tokens de visión antes de escalar a modelos mayores.
- Generación de metadatos para datasets de imágenes: puede preetiquetar grandes colecciones de imágenes para su posterior curación manual, reduciendo el coste de anotación.
- Investigación en eficiencia multimodal: su reducido tamaño y su integración con MNN lo hacen adecuado para estudiar el rendimiento de visión en dispositivos con recursos muy limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 375M parámetros, en FP16 requiere aproximadamente 0,75 GB de pesos; en cuantización de 8 bits, unos 0,4 GB; en 4 bits, unos 0,2 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también tarjetas de gama baja y GPUs integradas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), y el runtime MNN de Alibaba dado su origen; compatibilidad con llama.cpp, Ollama o vLLM no está confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nebulette/in-fusion-v | 375M | no disponible | Sí (in-fusion) | Apache 2.0 | Hugging Face |
| taobao-mnn/MNN-Pocket-0.3B | ~0,3B | no disponible | No (modelo base de texto) | no disponible | Hugging Face |
| Qwen3 (familia) | desde 0,6B | hasta 32k en variantes pequeñas | No en variantes base | Apache 2.0 en la mayoría | Hugging Face |

La comparación con alternativas multimodales de tamaño similar no está disponible en la información proporcionada, ya que los modelos visión-lenguaje compactos con licencia abierta y detalles públicos son escasos en este rango de parámetros.

## Limitaciones y advertencias

- El modelo es un fine-tuning muy específico sobre etiquetas de booru de gelbooru; su rendimiento fuera de ese dominio (imágenes reales, otros estilos) es probablemente limitado y no está evaluado.
- Riesgo elevado de alucinación y de generar etiquetas inexistentes o incorrectas, dado su reducido tamaño y la naturaleza del dataset.
- No se declaran los idiomas soportados; se desconoce si maneja castellano con soltura.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en conversaciones largas o imágenes de alta resolución.
- La información pública es mínima (226 descargas, 1 like en el momento de la consulta), sin benchmarks ni evaluación independiente.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base taobao-mnn/MNN-Pocket-0.3B no declara licencia en la información disponible, lo que conviene verificar antes de un despliegue en producción.
- El contenido de entrenamiento (booru/gelbooru) puede incluir material para adultos o sesgado; no se documentan filtros de seguridad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nebulette/in-fusion-v)
- [Modelo base taobao-mnn/MNN-Pocket-0.3B](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B)
- [Referencia a módulos in-fusion (unbundling.github.io)](https://unbundling.github.io/#placement)
- Referencia arXiv citada en la model card: 2611.17334 (no se dispone de URL verificada)
