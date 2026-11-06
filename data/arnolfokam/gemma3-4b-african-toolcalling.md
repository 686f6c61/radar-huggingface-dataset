# arnolfokam/gemma3-4b-african-toolcalling

## Resumen

`arnolfokam/gemma3-4b-african-toolcalling` es un ajuste fino (fine-tuning) del modelo multimodal `unsloth/gemma-3-4b-it` de Google, publicado por el usuario arnolfokam en Hugging Face. El modelo parte de la arquitectura Gemma 3 de 4.300 millones de parámetros y está especializado, según su nombre, en tool calling (llamada a funciones) en contextos africanos. El pipeline declarado es `image-text-to-text`, lo que confirma que conserva la capacidad multimodal del modelo base (entrada de imagen y texto, salida de texto).

El ajuste se ha realizado presumiblemente con la librería Unsloth, indicada en los tags, lo que sugiere un entrenamiento eficiente en memoria mediante LoRA o QLoRA sobre el modelo base. El repositorio se publicó el 1 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, por lo que se trata de un modelo muy reciente y sin validación comunitaria.

La relevancia de este modelo radica en su enfoque específico: adaptar un modelo pequeño (4B) y multimodal a tareas de function calling en lenguas y contextos africanos, un nicho poco cubierto por los modelos generalistas. No obstante, la información pública disponible es muy limitada y no se han publicado detalles sobre el dataset de entrenamiento, los hiperparámetros ni los resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), con encoder de visión |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 4B soporta 128K tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; al derivar de Unsloth es probable que existan versiones GGUF, pero no se confirman) |
| Idiomas soportados | en (ingles, segun la model card); el nombre sugiere orientacion a lenguas africanas, pero no se detalla |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 3 de Google en su variante de 4B parámetros: un transformer decoder-only con atención multimodal, capaz de procesar imágenes y texto. El modelo base `unsloth/gemma-3-4b-it` es la versión instruction-tuned, lo que implica que ya ha pasado por un proceso de alineación (SFT y presumiblemente RLHF/DPO) por parte de Google. El fine-tuning de arnolfokam se ha realizado con Unsloth, una librería que optimiza el entrenamiento mediante kernels personalizados y técnicas de bajo rango (LoRA/QLoRA), lo que permite ajustar modelos de este tamaño en GPUs de consumo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se congelaron capas o se entrenó el adaptador completo, ni si se aplicaron técnicas de RLHF adicionales. Tampoco se documentan innovaciones técnicas específicas más allá del uso de Unsloth. La única pista sobre el propósito del ajuste es el sufijo `african-toolcalling`, que indica una especialización en llamadas a funciones para contextos africanos, pero sin datos públicos que lo respalden.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Gemma 3 4B IT.
- Procesamiento de imágenes (image-text-to-text): puede recibir una imagen junto con texto y generar una respuesta textual.
- Tool calling / function calling: capacidad presumiblemente reforzada por el fine-tuning, aunque no se documentan ejemplos ni formatos soportados.
- Razonamiento multi-turno: al ser un modelo instruction-tuned, soporta conversaciones con historial.
- Capacidades multilingües: la model card solo declara inglés; el nombre sugiere cobertura de lenguas africanas, pero no se especifica cuáles ni con qué calidad.
- No se documentan capacidades de audio, thinking mode explícito ni agentes autónomos más allá de lo que permite el tool calling.

## Casos de uso

- Asistentes de atención al cliente en inglés para mercados africanos: el modelo puede gestionar conversaciones multi-turno y, gracias a su capacidad de tool calling, invocar APIs de consulta de pedidos o gestión de tickets. Su tamaño de 4B permite desplegarlo en infraestructura modesta.
- Automatización de tareas con function calling en aplicaciones locales: integración en flujos donde el modelo debe decidir qué función invocar (por ejemplo, consultar precios, reservar citas) a partir de texto o una imagen adjunta.
- Procesamiento de documentos con imagen: al conservar la entrada multimodal, puede extraer información de capturas o formularios y estructurarla mediante llamadas a funciones.
- Prototipado rápido de agentes conversacionales: su licencia Apache 2.0 y su tamaño permiten experimentar sin restricciones comerciales en entornos de desarrollo.
- Educación y soporte técnico en inglés: respuestas conversacionales con contexto de hasta 128K tokens (si se confirma la herencia del modelo base), adecuado para resúmenes de manuales o guías.
- Investigación en adaptación de modelos a contextos africanos: sirve como punto de partida para estudiar la eficacia del fine-tuning con Unsloth en dominios específicos, aunque carece de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8,6 GB (tamaño del repo en safetensors), por lo que requiere una GPU con al menos 10-12 GB de VRAM para dejar margen al contexto y a las activaciones.
- En cuantización de 8 bits: alrededor de 4,5-5 GB de VRAM.
- En cuantización de 4 bits (si existe versión GGUF o se genera): alrededor de 2,5-3 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16 sin problemas; A100 o H100 para despliegues concurrentes; RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) para FP16 con contexto moderado.
- Cabe en GPUs de consumo: sí, en RTX 3060 (12 GB) o superiores en FP16; en GPUs de 8 GB solo mediante cuantización a 4 bits.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM (compatible con arquitectura Gemma 3), llama.cpp/Ollama si se generan pesos GGUF (no confirmado en el repo).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Tool calling especializado |
|---|---|---|---|---|---|
| arnolfokam/gemma3-4b-african-toolcalling | 4,3B | no disponible (base: 128K) | Apache 2.0 | Sí | Sí (presunto) |
| google/gemma-3-4b-it | 4,3B | 128K | Gemma Terms of Use | Sí | Parcial (soporte nativo limitado) |
| Qwen/Qwen2.5-3B-Instruct | 3,1B | 32K | Apache 2.0 | No | Sí (function calling nativo) |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | No | Parcial |

La comparativa se basa en características públicas de los modelos; no se dispone de datos de rendimiento del modelo evaluado para comparar métricas.

## Limitaciones y advertencias

- No se han publicado evaluaciones ni benchmarks: se desconoce si el fine-tuning mejora, mantiene o degrada las capacidades del modelo base.
- La model card solo declara inglés; el soporte real de lenguas africanas no está documentado ni verificado.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en tool calling con esquemas complejos.
- El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Gemma 3 conviene revisar las condiciones de la licencia original de Google (Gemma Terms of Use) por posibles obligaciones adicionales.
- Sin datos sobre sesgos: al estar entrenado presumiblemente con datos específicos de contextos africanos, podría introducir sesgos regionales no evaluados.
- El repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad; no se recomienda para producción sin una evaluación propia.
- No se confirma la disponibilidad de pesos cuantizados (GGUF, AWQ, GPTQ) ni su compatibilidad con llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/arnolfokam/gemma3-4b-african-toolcalling
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Unsloth: https://github.com/unslothai/unsloth
- Documentación de Gemma 3 (Google): https://ai.google.dev/gemma/docs
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
