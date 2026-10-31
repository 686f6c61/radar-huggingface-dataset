# LiquidAI/LFM3-VL-2B-NVFP4

## Resumen

LFM3-VL-2B-NVFP4 es una versión cuantizada en formato NVFP4 (W4A4) del modelo multimodal LFM3-VL-2B de Liquid AI, diseñada específicamente para inferencia en GPU. El modelo base pertenece a la familia LFM (Liquid Foundation Models) de tercera generación y combina un modelo de lenguaje compacto de unos 1.350 millones de parámetros con un encoder de visión, lo que le permite procesar entradas de imagen y texto (pipeline image-text-to-text).

La relevancia de esta variante radica en la cuantización NVFP4, un formato de 4 bits con bloques de 16 valores que cuantiza los pesos y activaciones del feed-forward del lenguaje mientras mantiene en BF16 la atención, las convoluciones, los embeddings, la cabeza de salida, las normalizaciones, el encoder de visión y el proyector. El resultado es un modelo muy ligero (el repositorio ocupa solo 2,2 GB) que reduce drásticamente los requisitos de memoria sin tocar las configuraciones de ventana deslizante ni RoPE. Soporta 16 idiomas, entre ellos el castellano, y está pensado para despliegues con SGLang en GPUs modernas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal (LFM3-VL): modelo de lenguaje LFM3 + encoder de visión y proyector; detalles completos no disponibles en esta ficha |
| Parámetros totales | 1.351.950.848 (~1,35 B, según safetensors) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (consultar la ficha del modelo base LFM3-VL-2B) |
| Tipos de cuantización | NVFP4 (W4A4, bloques de 16 valores) en pesos y activaciones del feed-forward del lenguaje; BF16 en atención, convoluciones, embeddings, cabeza de salida, normas, encoder de visión y proyector |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors (cuantización NVFP4 generada con NVIDIA ModelOpt, según el tag "modelopt") |

## Arquitectura y entrenamiento

LFM3-VL-2B-NVFP4 es una variante de inferencia del modelo base LiquidAI/LFM3-VL-2B, por lo que hereda su arquitectura multimodal: un modelo de lenguaje de la familia LFM3 de Liquid AI combinado con un encoder de visión y un proyector que permiten el pipeline image-text-to-text. La model card indica que la cuantización no altera las configuraciones de ventana deslizante (sliding-window) ni de RoPE, lo que sugiere que el modelo base emplea atención con ventana deslizante y codificación posicional RoPE. Los detalles completos de la arquitectura y del proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada y deben consultarse en la model card del modelo base.

La innovación técnica principal de esta variante es la cuantización NVFP4: los pesos y activaciones de las capas feed-forward del modelo de lenguaje se cuantizan a 4 bits en bloques de 16 valores (formato W4A4), mientras que los componentes sensibles a la precisión (atención, embeddings, cabeza de salida, normas, encoder de visión y proyector) permanecen en BF16. Esta estrategia híbrida busca maximizar el ahorro de memoria y el rendimiento en GPU manteniendo la calidad del modelo multimodal.

## Capacidades

- Comprensión de imagen y texto (image-text-to-text): analiza imágenes junto con instrucciones en lenguaje natural y genera respuestas textuales.
- Generación de texto conversacional en 16 idiomas, incluido el castellano.
- Soporte de tool calling: la model card muestra el arranque del servidor SGLang con `--tool-call-parser auto`.
- Soporte de razonamiento estructurado: el comando de despliegue incluye `--reasoning-parser auto`, lo que indica compatibilidad con salidas de razonamiento parseables.
- Capacidades de agente y multi-step reasoning: no disponible explícitamente en la información proporcionada, aunque el soporte de tool calling lo habilita parcialmente.
- Modo de pensamiento (thinking mode): no disponible explícitamente en la información proporcionada.
- Audio: no disponible; el pipeline es exclusivamente image-text-to-text.

## Casos de uso

- Chatbots multimodales en dispositivos o servidores de bajo coste: con solo 2,2 GB de repositorio y cuantización de 4 bits, es adecuado para asistentes que describen o analizan imágenes sin necesidad de GPUs de gama alta.
- Atención al cliente automatizada con envío de capturas: puede gestionar conversaciones multi-turno en las que el usuario adjunta imágenes (capturas de error, fotos de productos) y responder en castellano u otros idiomas soportados.
- Moderación y clasificación de contenido visual: su encoder de visión en BF16 permite analizar imágenes con precisión mantenida mientras el resto del modelo corre cuantizado, útil para pipelines de moderación de alto volumen.
- Generación de descripciones y metadatos de imágenes: etiquetado automático de catálogos, bibliotecas de medios o plataformas de e-commerce en múltiples idiomas.
- Agentes con tool calling en entornos de producción: el soporte de tool-call-parser en SGLang permite integrarlo en agentes que consultan APIs o ejecutan funciones a partir de entradas multimodales.
- Despliegue en servidores GPU con alta densidad de modelos: el bajo consumo de memoria de la versión NVFP4 permite alojar muchas réplicas por GPU, ideal para servicios con alta concurrencia y requisitos de latencia baja.
- Aplicaciones multilingües en mercados internacionales: soporte nativo de 16 idiomas (español, chino, japonés, árabe, hindi, etc.) para productos globales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo base LFM3-VL-2B para detalles de rendimiento, pero no incluye datos de MMLU, HumanEval ni otras métricas comparativas para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,2 GB; añadiendo activaciones, KV cache y los componentes en BF16, un requisito realista sería del orden de 4-6 GB de VRAM (estimación; no disponible un dato oficial).
- GPU recomendadas: al tratarse de una cuantización NVFP4, está orientada a GPUs NVIDIA con soporte eficiente de 4 bits (por ejemplo, arquitecturas Blackwell como B200/RTX 50xx); también debería funcionar en GPUs Ampere o superiores (A100, RTX 3090/4090) según el soporte del runtime.
- Consumer GPUs: por tamaño, debería caber cómodamente en GPUs de consumo como la RTX 4060 Ti (16 GB), RTX 4090 o equivalentes; no hay confirmación oficial.
- Opciones de despliegue: SGLang es el runtime recomendado y documentado (soporte en revisión en el PR sgl-project/sglang#46858). El soporte para vLLM, llama.cpp, Ollama o TGI no está disponible en la información proporcionada; el modelo base puede ofrecer rutas adicionales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Modalidad | Licencia |
|---|---|---|---|---|
| LiquidAI/LFM3-VL-2B-NVFP4 | ~1,35 B | NVFP4 (W4A4) + BF16 | Imagen + texto | LFM Open License v1.0 |
| LiquidAI/LFM3-VL-2B (base) | ~1,35 B | BF16 (sin cuantizar) | Imagen + texto | LFM Open License v1.0 |
| Qwen2.5-VL-3B-Instruct | ~3 B | BF16 (con variantes GGUF/AWQ de terceros) | Imagen + texto | Apache 2.0 (con restricciones en Qwen) |
| SmolVLM2-2.2B-Instruct | ~2,2 B | BF16 (con variantes de terceros) | Imagen + texto | Apache 2.0 |

Nota: la comparativa se basa en características generales conocidas de los modelos alternativos; los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0 (lfm1.0): se trata de una licencia "other", no de una licencia permisiva estándar como Apache 2.0 o MIT. Es imprescindible revisar el texto de la licencia antes de cualquier uso comercial, ya que puede incluir restricciones de uso, despliegue o distribución.
- Cuantización NVFP4: al cuantizar pesos y activaciones a 4 bits (W4A4), puede producirse una ligera degradación de calidad respecto al modelo base en BF16, especialmente en tareas sensibles a la precisión numérica. No hay datos públicos de regresión en la información disponible.
- Soporte de SGLang aún en revisión (PR sgl-project/sglang#46858): el despliegue con SGLang puede no estar disponible en versiones estables todavía, lo que limita las opciones de producción a corto plazo.
- Sesgos conocidos: no disponible en la información proporcionada; como todo modelo de lenguaje entrenado a gran escala, puede heredar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; en tareas de análisis de imágenes puede describir elementos inexistentes o malinterpretar detalles finos.
- Longitud de contexto: no especificada en esta ficha; consultar la model card del modelo base antes de diseñar aplicaciones con documentos largos.
- Idiomas: soporta 16 idiomas, pero la calidad en idiomas distintos del inglés puede variar; no hay datos de rendimiento por idioma en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-VL-2B-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- PR de soporte en SGLang: https://github.com/sgl-project/sglang/pull/46858
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
