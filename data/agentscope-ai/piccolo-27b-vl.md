# agentscope-ai/Piccolo-27B-VL

## Resumen

Piccolo 27B VL es un modelo de lenguaje y vision (image-text-to-text) publicado por el equipo agentscope-ai en Hugging Face. Se distribuye como un checkpoint de pesos en formato Safetensors bajo la arquitectura `Qwen3_5ForConditionalGeneration`, lo que lo sitúa en la familia de modelos multimodales derivados de Qwen 3.5. El checkpoint contiene 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) repartidos en 11 shards principales más un fichero adicional `model-frozen-mtp.safetensors`, todos ellos referenciados por el índice `model.safetensors.index.json`.

El modelo resuelve tareas de comprensión conjunta de imagen y texto: dado un par imagen-prompt, genera texto en formato conversacional. La etiqueta de pipeline `image-text-to-text` y el tag `conversational` confirman que está pensado para diálogo multimodal. La presencia del fichero `model-frozen-mtp` sugiere la inclusión de módulos de predicción multi-token (multi-token prediction, MTP) congelados, una técnica habitual en arquitecturas recientes para acelerar la decodificación.

La relevancia del lanzamiento radica en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y en su tamaño contenido (27,8B) dentro de la categoría multimodal, lo que lo hace desplegable en configuraciones de GPU relativamente modestas frente a alternativas de mayor escala. No obstante, la información pública disponible es muy limitada: la model card es mínima y no se han publicado benchmarks, idiomas soportados ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con vision encoder) |
| Parametros totales | 27.781.427.952 (aprox. 27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (11 shards principales + `model-frozen-mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration`, una variante multimodal de la familia Qwen 3.5 que combina un transformer de lenguaje con un encoder de vision para procesar entradas image-text-to-text. El checkpoint incluye las configuraciones originales de modelo, generación, tokenizer y processor, así como la plantilla de chat, lo que indica que se distribuye listo para inferencia con `transformers`.

El fichero adicional `model-frozen-mtp.safetensors` apunta a la inclusión de cabezas de predicción multi-token (MTP) congeladas durante el entrenamiento o el ajuste. Esta técnica permite que el modelo prediga varios tokens por paso y se usa habitualmente para decodificación especulativa o aceleración de la generación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como atención lineal o decodificación especulativa más allá de la mencionada MTP.

## Capacidades

- Generación de texto conversacional multimodal: acepta pares imagen-texto y produce respuestas en formato de chat.
- Comprensión de imágenes: al estar etiquetado como `image-text-to-text`, está diseñado para tareas de visión-lenguaje (descripción, VQA, razonamiento sobre imágenes).
- Soporte de plantilla de chat: incluye chat template, lo que facilita su uso en pipelines conversacionales multi-turno.
- Predicción multi-token (MTP): la presencia del módulo congelado sugiere capacidad de decodificación acelerada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistentes visuales conversacionales: el modelo puede gestionar diálogos multi-turno en los que el usuario adjunta imágenes (capturas, fotos, diagramas) y espera respuestas textuales, aprovechando su plantilla de chat y su naturaleza image-text-to-text.
- Descripción automática de imágenes y alt-text: adecuado para generar texto alternativo accesible en plataformas de contenido, dado su pipeline de visión-lenguaje y su licencia Apache 2.0 que permite uso comercial.
- Extracción de información de documentos escaneados: con 27,8B de parámetros, puede procesar facturas, formularios o recibos y devolver datos estructurados en texto, integrándose en pipelines de digitalización.
- Moderación de contenido visual: análisis de imágenes subidas por usuarios para detectar contenido inapropiado o generar informes descriptivos, desplegable en infraestructura propia gracias a la licencia permisiva.
- Soporte técnico con capturas de pantalla: el modelo puede interpretar capturas de errores o interfaces de usuario y guiar al usuario en la resolución de incidencias, en flujos de atención al cliente.
- Análisis de imágenes en investigación: uso como base para experimentos de visión-lenguaje o fine-tuning sobre dominios específicos (médico, industrial), al ser un checkpoint abierto con pesos completos.
- Aceleración de inferencia con MTP: el módulo `model-frozen-mtp` puede aprovecharse en pipelines de decodificación especulativa para reducir latencia en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55-56 GB solo para pesos (27,8B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 64-80 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 28-30 GB, viable en una A100 40GB o H100.
- VRAM estimada en cuantización de 4 bits: aproximadamente 15-18 GB, viable en RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80GB, H100 80GB para BF16 sin cuantizar; A100 40GB o L40S para 8 bits; RTX 4090 / RTX 3090 para 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en GPUs con 24 GB o más; en BF16 no cabe en GPUs de consumo actuales.
- Opciones de despliegue: `transformers` (soporte nativo indicado por la librería), y presumiblemente vLLM, TGI o llama.cpp si se generan conversiones GGUF/AWQ, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Piccolo 27B VL | 27,8B | no disponible | Apache 2.0 | Checkpoint Qwen3.5 multimodal, MTP congelado |
| Qwen2.5-VL (7B/72B) | 7B / 72B | 128K (según variante) | Apache 2.0 | Familia multimodal de referencia de Alibaba |
| InternVL2.5 (26B) | 26B | hasta 128K | MIT / Apache 2.0 según variante | Multimodal con encoder de visión de gran tamaño |
| LLaVA-OneVision (7B/72B) | 7B / 72B | 32K | Apache 2.0 | Modelo visión-lenguaje abierto |

Nota: los datos de los modelos comparativos provienen de conocimiento general y no de la información proporcionada; verificar antes de usar en producción. No se dispone de benchmarks de Piccolo 27B VL para una comparación cuantitativa.

## Limitaciones y advertencias

- Información pública mínima: la model card no documenta datos de entrenamiento, idiomas, contexto ni evaluación, lo que dificulta estimar su calidad real.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede producir descripciones o respuestas incorrectas sobre imágenes, especialmente en dominios especializados.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos demográficos, culturales o de otro tipo.
- Idiomas soportados no confirmados: no se indica qué idiomas maneja; asumir multilingüismo sin verificación es arriesgado.
- Longitud de contexto no disponible: limita la planificación de casos de uso con documentos largos o muchas imágenes.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las licencias de dependencias (tokenizer, vision encoder) y cumplir con las obligaciones de atribución.
- Madurez del checkpoint: con 42 descargas y 0 likes en el momento de la ficha, es un lanzamiento muy reciente y poco validado por la comunidad; no se recomienda para producción crítica sin evaluación propia.
- El módulo MTP congelado puede requerir configuración específica en el runtime; verificar compatibilidad con el stack de despliegue elegido.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-VL
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
