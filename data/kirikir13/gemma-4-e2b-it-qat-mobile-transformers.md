# kirikir13/gemma-4-E2B-it-qat-mobile-transformers

## Resumen

Gemma 4 E2B es un modelo multimodal de Google DeepMind, diseñado para ofrecer capacidades de razonamiento, generación de texto, comprensión de imágenes y audio, con un enfoque en despliegue eficiente en dispositivos móviles y de borde. Este repositorio, publicado por el usuario kirikir13, es una versión del checkpoint oficial `google/gemma-4-E2B-it` optimizada mediante Quantization-Aware Training (QAT) y serializada en el formato `wNa8o8`, específicamente diseñado para hardware móvil. Con 2,3 mil millones de parámetros efectivos (5,1 mil millones incluyendo embeddings), soporta una ventana de contexto de 128.000 tokens y procesa entradas de texto, imagen y audio, generando texto como salida. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño reducido (alrededor de 1 GB en memoria) lo hace apto para teléfonos de gama alta, portátiles y entornos con recursos limitados.

El modelo se basa en una arquitectura densa con Per-Layer Embeddings (PLE) y atención híbrida que intercala ventanas deslizantes con atención global, optimizando el uso de memoria para contextos largos. La versión QAT mobile reduce la huella de memoria a aproximadamente 1 GB, manteniendo una calidad similar al formato bfloat16 original. Está disponible en la librería `transformers` con pesos en safetensors, y es compatible con el ecosistema de Google DeepMind, incluyendo herramientas como Ollama y vLLM (aunque esta variante específica está pensada para móvil). El modelo soporta más de 140 idiomas y presenta capacidades nativas de function calling, lo que lo convierte en una opción sólida para agentes autónomos y aplicaciones en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (atención híbrida: sliding window + global, p-RoPE, PLE) |
| Parámetros totales | 5.100.000.000 (incluye embeddings) / 2.335.794.755 (pesos en safetensors) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | QAT, formato móvil wNa8o8 (2-bit en capas de decodificación) |
| Idiomas soportados | Más de 140 idiomas (multimodal: texto, imagen, audio) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

Gemma 4 E2B emplea una arquitectura densa con 35 capas de decodificador, cada una con su propio embedding por token (Per-Layer Embeddings, PLE). Esta técnica reduce el número de parámetros efectivos a 2.300 millones, aunque el total con tablas de embeddings asciende a 5,1 mil millones. La atención híbrida combina ventanas deslizantes de 512 tokens con capas de atención global, y la última capa es siempre global. Para optimizar el uso de memoria en contextos largos, las capas globales comparten claves y valores (unified KV) y aplican Proportional RoPE (p-RoPE). El modelo integra además un codificador de visión de aproximadamente 150 millones de parámetros y un codificador de audio de unos 300 millones.

El entrenamiento se realizó con Quantization-Aware Training (QAT), que simula la cuantización durante el proceso de entrenamiento para minimizar la pérdida de calidad al comprimir el modelo. La variante mobile-optimized (wNa8o8) emplea capas de decodificación con cuantización de 2 bits, cachés KV optimizadas y activaciones estáticas, logrando reducir el footprint de memoria a aproximadamente 1 GB. Los pesos se serializan en safetensors y son compatibles con la librería `transformers`. Aunque no se detalla el número exacto de tokens de entrenamiento, la familia Gemma 4 se entrenó con datos multilingües y multimodales, e incluye ajuste por instrucciones (instruction tuning) con técnicas de RLHF y DPO.

## Capacidades

- Generación de texto de alta calidad, con razonamiento configurable (thinking mode) para tareas de lógica y matemáticas.
- Comprensión y generación de imágenes (entrada visual) con soporte de relación de aspecto variable y resolución adaptable.
- Procesamiento de audio nativo (entrada de voz, música, etc.) para transcripción o comprensión.
- Generación de código y soporte de function calling (llamada a herramientas), habilitando agentes autónomos y flujos de trabajo con herramientas externas.
- Soporte nativo del rol `system` en el prompt, permitiendo configurar el comportamiento del modelo de forma estructurada.
- Multilingüismo en más de 140 idiomas, con capacidad de traducción y generación en múltiples lenguas.
- Ventana de contexto de 128K tokens, adecuada para documentos largos, conversaciones multi-turno y análisis de código extenso.
- Optimizado para inferencia en dispositivos móviles y de borde, con un footprint de memoria de aproximadamente 1 GB.

## Casos de uso

- **Asistentes virtuales en dispositivos móviles**: al tener un footprint de memoria de ~1 GB, el modelo puede ejecutarse localmente en teléfonos de gama alta y tablets, permitiendo asistentes de voz y texto con baja latencia y sin conexión.
- **Agentes autónomos de código**: gracias a su soporte de tool calling y generación de código, puede integrarse en entornos de desarrollo integrado (IDEs) o pipelines CI/CD para autocompletar, revisar y corregir código en tiempo real.
- **Análisis de documentos largos**: con su contexto de 128K tokens, es adecuado para resumir informes técnicos, documentos legales o artículos científicos sin perder información clave.
- **Transcripción y comprensión de audio**: su entrada de audio nativa permite transcribir reuniones, podcasts o dictados, generando resúmenes o extraer acciónables.
- **Educación y tutoría**: puede actuar como tutor multimodal que explica conceptos a partir de imágenes (diagramas, gráficos) y texto, adaptándose al idioma del usuario (más de 140 idiomas).
- **Sistemas de atención al cliente**: su capacidad de razonamiento y manejo de contexto largo permite gestionar conversaciones multi-turno con historial extenso, resolviendo incidencias de forma autónoma en aplicaciones de mensajería o web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Google indica que la familia Gemma 4 logra "rendimiento de nivel frontera" para su tamaño, pero no se proporcionan cifras concretas para esta variante QAT mobile. Se recomienda consultar el informe técnico oficial (arXiv:2607.02770) para obtener métricas detalladas en tareas como MMLU, HumanEval, GSM8K o benchmarks multimodales.

## Requisitos de hardware

- **Memoria**: el modelo QAT mobile está optimizado para caber en aproximadamente 1 GB de RAM/VRAM, lo que lo hace adecuado para dispositivos móviles y de borde.
- **GPU recomendadas**: en entornos de escritorio, puede ejecutarse en GPUs con 2-4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050), aunque se recomienda al menos 4 GB para contextos largos.
- **CPU**: también es ejecutable en CPU de gama media, aunque con mayor latencia.
- **Opciones de despliegue**: compatible con la librería `transformers` (PyTorch), así como con herramientas como Ollama (ya disponible en su catálogo) o vLLM para entornos servidor.
- **Latencia**: no se proporcionan valores concretos, pero el diseño para móvil busca latencias inferiores a 100 ms en dispositivos de gama alta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Sin embargo, dentro de la familia Gemma 4, este modelo se posiciona como la opción más ligera y eficiente en memoria, frente a Gemma 4 E4B (4,5B efectivos) y Gemma 4 12B (11,95B), que requieren más recursos. Alternativas externas como Qwen 2.5 3B o Llama 3.2 3B podrían ser comparables en tamaño, pero no hay datos de rendimiento disponibles en esta fuente.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo modelo generativo, puede producir contenido inexacto o sesgado, especialmente en dominios poco representados en su entrenamiento. Se recomienda validar salidas críticas.
- **Limitaciones de contexto**: aunque soporta 128K tokens, el rendimiento en contextos muy largos puede degradarse; se recomienda no superar los 64K tokens para tareas de alta precisión.
- **Idiomas**: aunque soporta más de 140 idiomas, la calidad varía según la lengua; idiomas con menos datos pueden tener peor rendimiento.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero se debe cumplir con la política de uso aceptable de Google (no usar para actividades dañinas o ilegales).
- **Hardware específico**: la variante mobile-optimized está diseñada para arquitecturas de móvil concretas; el formato wNa8o8 puede no ser compatible con todas las plataformas sin conversión adicional.
- **Rendimiento de audio**: la entrada de audio puede tener limitaciones en entornos ruidosos o con acentos no comunes.

## Enlaces

- [Repositorio en Hugging Face (modelo original de Google)](https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers)
- [Repositorio de este usuario en Hugging Face](https://huggingface.co/kirikir13/gemma-4-E2B-it-qat-mobile-transformers)
- [Blog de Google: Gemma 4 con Quantization-Aware Training](https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/)
- [Informe técnico de Gemma 4 (arXiv)](https://arxiv.org/abs/2607.02770)
- [Colección de modelos Gemma 4 QAT en Hugging Face](https://huggingface.co/collections/google/gemma-4-qat-mobile)
- [Página de Gemma 4 en Ollama](https://ollama.com/library/gemma4:e2b-it-qat)
