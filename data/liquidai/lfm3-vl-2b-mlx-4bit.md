# LiquidAI/LFM3-VL-2B-MLX-4bit

## Resumen

LFM3-VL-2B-MLX-4bit es la versión cuantizada a 4 bits en formato MLX del modelo multimodal LFM3-VL-2B de Liquid AI, optimizada para ejecución en Apple Silicon (chips M-series). Se trata de un modelo de imagen-a-texto (image-text-to-text) que combina comprensión visual con generación de lenguaje, empaquetado en aproximadamente 1,59 GB de pesos, lo que permite su despliegue en hardware de consumo con memoria unificada.

El modelo base es LFM3-VL-2B, un transformer multimodal de 2B parámetros (1.918.181.888 parámetros reales según safetensors) que forma parte de la familia LFM3 de Liquid AI. La cuantización emplea cuantización afín de 4 bits con grupos de 32, manteniendo los embeddings de tokens en 8 bits, y se ha entrenado mediante destilación con conciencia de cuantización (QAD), lo que permite recuperar buena parte del rendimiento del modelo en 8 bits.

Su relevancia actual radica en que ofrece capacidades multimodales y de razonamiento (thinking mode opcional) en un paquete lo bastante pequeño para ejecutarse localmente en un Mac, con soporte para 16 idiomas y una ventana de contexto amplia (según el modelo original). Es una opción interesante para prototipado on-device de asistentes visuales, OCR y descripción de imágenes sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia LFM3; detalles completos en la model card del modelo base |
| Parametros totales | 1.918.181.888 (~1,92B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit afín con grupos de 32; embeddings de tokens en 8-bit; entrenado con QAD (quantization-aware distillation) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (MLX), ~1,59 GB |
| Libreria | mlx |
| Pipeline | image-text-to-text |
| Modelo base | LiquidAI/LFM3-VL-2B |
| Tamano del repo | 1,6 GB |

## Arquitectura y entrenamiento

El modelo es una cuantización del LFM3-VL-2B de Liquid AI, un modelo multimodal de tipo image-text-to-text. La model card de esta versión remite a la del modelo original para los detalles de arquitectura, por lo que la información específica sobre el backbone visual, el proyector multimodal y la configuración exacta del transformer no está disponible en la información proporcionada. Los pesos usan cuantización afín de 4 bits con grupos de 32, con embeddings de tokens en 8 bits.

El aspecto técnico destacable es el uso de destilación con conciencia de cuantización (QAD): los pesos cuantizados se entrenan para aproximarse al comportamiento del modelo de mayor precisión, recuperando gran parte del rendimiento del modelo en 8 bits. El modelo soporta un modo de razonamiento (thinking) que permanece desactivado por defecto y se activa mediante el flag `--enable-thinking` en MLX-VLM. Los detalles sobre volumen de tokens de entrenamiento, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes (image-text-to-text).
- Modo de razonamiento opcional (thinking mode) activable con `--enable-thinking`; por defecto está desactivado.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y tareas image-to-text en general.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Ejecución on-device en Apple Silicon mediante MLX-VLM (>= 0.7.11).
- Parámetros de muestreo configurables (temperature, top-p, top-k, min-p, repetition-penalty) y hasta 16.384 tokens de generación por invocación según el ejemplo de la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-step: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Descripción automática de imágenes en本地 en Mac: el modelo puede generar descripciones de fotografías o capturas ejecutándose íntegramente en un Apple Silicon, sin enviar datos a la nube, gracias a sus ~1,59 GB de pesos.
- Asistente visual personal on-device: integración en aplicaciones de escritorio para Mac que respondan preguntas sobre imágenes cargadas por el usuario (por ejemplo, interpretar gráficos o diagramas), usando MLX-VLM como runtime.
- Prototipado rápido de pipelines image-to-text: investigadores pueden validar ideas de VQA o captioning con un modelo de 2B parámetros antes de escalar a modelos mayores, con coste de hardware mínimo.
- Extracción de información de documentos escaneados: lectura y resumen de contenido visual (facturas, capturas, formularios) en flujos locales, aprovechando el soporte de 16 idiomas para documentos multilingües.
- Accesibilidad: generación de descripciones de imágenes para personas con discapacidad visual en aplicaciones locales, con latencia baja al ejecutarse en el propio dispositivo.
- Evaluación de modelos multimodales pequeños: referencia para comparar el impacto de la cuantización 4-bit con QAD frente al modelo base, útil en investigación sobre eficiencia de modelos.
- Procesamiento por lotes offline: generación de metadatos y etiquetas para bibliotecas de imágenes en local, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan ~1,59 GB; con overhead de runtime MLX se recomienda al menos 4 GB de memoria unificada libre.
- Hardware objetivo: Apple Silicon (chips M-series). El formato MLX no está pensado para GPU NVIDIA/AMD.
- Cabe en GPU de consumo: no aplica en el sentido tradicional; está diseñado para Macs con memoria unificada (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Despliegue: MLX-VLM >= 0.7.11 (`python -m mlx_vlm.generate`). No se indica soporte para vLLM, llama.cpp, Ollama o TGI en esta versión MLX.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de generación recomendados (según model card): temperature 0.1, top-p 1.0, top-k 50, min-p 0.0, repetition-penalty 1.1, max-tokens 16384.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-4bit (este) | ~1,92B | no disponible | MLX safetensors 4-bit | lfm1.0 | Hugging Face |
| LiquidAI/LFM3-VL-2B (base) | ~1,92B | no disponible | safetensors (precisión completa) | lfm1.0 | Hugging Face |
| Otros modelos multimodales pequeños (p. ej. Qwen2-VL-2B, SmolVLM) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría no puede completarse con los datos proporcionados; solo se dispone de la relación con el modelo base, del que esta versión es una cuantización MLX 4-bit.

## Limitaciones y advertencias

- Es una cuantización a 4 bits: aunque QAD recupera parte del rendimiento, puede haber degradación frente al modelo base en tareas exigentes.
- Formato específico para Apple Silicon (MLX); no es portable directamente a otros runtimes sin conversión.
- Riesgo de alucinación inherente a modelos generativos de 2B parámetros, especialmente en descripciones detalladas de imágenes o texto pequeño.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; cabe esperar los sesgos de los datos de entrenamiento del modelo base.
- Licencia lfm1.0 (license: other): es necesario revisar los términos del archivo LICENSE antes de uso comercial; no se garantiza uso comercial libre.
- El modo de razonamiento está desactivado por defecto; debe activarse explícitamente con `--enable-thinking`.
- No se dispone de información sobre tool calling, agentes o límites exactos de contexto; conviene consultar la model card del modelo base.
- Requiere MLX-VLM >= 0.7.11; versiones anteriores pueden no cargar el modelo correctamente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Documentación MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación general: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
