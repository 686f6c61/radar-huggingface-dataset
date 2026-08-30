# liodon-ai/Llama-3.2-1B-Instruct-FP8

## Resumen

El modelo `liodon-ai/Llama-3.2-1B-Instruct-FP8` es una versión cuantizada en FP8 (punto flotante de 8 bits) del modelo `unsloth/Llama-3.2-1B-Instruct`, publicado por Liodon AI. La cuantización se realiza con la librería `llm-compressor` de vLLM, utilizando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 E4M3 por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token durante la inferencia. Este esquema no requiere dataset de calibración, por lo que la conversión es una simple reducción de precisión sin sesgo inducido por calibración.

El modelo reduce el tamaño del repositorio de 2,5 GB a 1,5 GB, lo que facilita su despliegue en entornos con recursos limitados. Mantiene la arquitectura original del Llama 3.2 de 1B parámetros, con 1.235.814.400 parámetros totales. La capa `lm_head` se deja sin cuantizar para preservar la calidad de la salida, práctica habitual en cuantizaciones FP8.

La relevancia de este modelo radica en su eficiencia: permite ejecutar un LLM instructivo de 1B parámetros en GPUs consumer modernas (RTX 40 series, L4, H100) con menor uso de VRAM y mayor throughput, manteniendo un comportamiento similar al original. Está diseñado para ser usado con vLLM, TGI y SGLang, lo que lo hace adecuado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, arquitectura Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, presumiblemente 128K) |
| Tipos de cuantizacion | FP8 dinámico (E4M3) |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | other (ver modelo base) |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `unsloth/Llama-3.2-1B-Instruct`, que a su vez deriva del Llama 3.2 de 1B entrenado por Meta. No ha habido entrenamiento adicional; solo se ha aplicado una conversión de precisión. El esquema `FP8_DYNAMIC` convierte los pesos a FP8 (E4M3) por canal de manera estática, y las activaciones se cuantizan dinámicamente por token durante la inferencia. La capa `lm_head` permanece en BF16/FP16 para evitar una pérdida desproporcionada de calidad, dado su tamaño reducido. No se utiliza calibración, por lo que los pesos cuantizados son una conversión directa de los originales.

El modelo base fue entrenado con datos multilingües y técnicas de instrucción (RLHF/DPO, según la documentación de Llama 3.2), pero esos detalles no se incluyen en la ficha de esta cuantización.

## Capacidades

- Generación de texto y conversación: al ser una versión instruct, responde a instrucciones y mantiene diálogos multi-turno.
- Razonamiento básico y comprensión de lenguaje: capacidades propias del Llama 3.2 1B, aunque limitadas por su tamaño.
- Soporte de tool calling y function calling: disponible en el modelo base, heredado por esta versión.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, aunque no se especifica cuáles en la documentación de la cuantización.
- No incluye capacidades multimodales (visión, audio) ni modo de pensamiento extendido.

## Casos de uso

- Despliegue en dispositivos edge o con VRAM limitada: gracias a su tamaño de 1,5 GB y FP8, puede ejecutarse en GPUs con 2-4 GB de VRAM, por ejemplo en sistemas embebidos o estaciones de trabajo sin GPUs de gama alta.
- Asistentes conversacionales ligeros: integración en chatbots de atención al cliente o asistentes personales donde se requiere baja latencia y consumo reducido.
- Clasificación y extracción de información: tareas de NLP como análisis de sentimiento, etiquetado de textos o extracción de entidades, ejecutándose en batch con vLLM.
- Generación de código simple: puede ayudar en autocompletado o generación de fragmentos cortos, aunque con menor precisión que modelos más grandes.
- Prototipado rápido: ideal para validar pipelines de generación de texto antes de escalar a modelos mayores.
- Filtrado y moderación de contenido: clasificación de mensajes en foros o redes sociales, aprovechando su capacidad de seguir instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `unsloth/Llama-3.2-1B-Instruct` tiene resultados conocidos (por ejemplo, en MMLU, HellaSwag), pero no se proporcionan para esta versión cuantizada. La cuantización FP8 dinámica suele tener una degradación mínima, pero no hay datos numéricos aquí.

## Requisitos de hardware

- VRAM estimada: ~1,5 GB para los pesos, más overhead de activaciones y KV cache. En la práctica, se recomienda al menos 2 GB de VRAM libre.
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 (Ada, Hopper, Blackwell), como RTX 40-series, L4/L40S, H100/H200, B100/B200. En GPUs más antiguas (Ampere o anterior), vLLM o TGI dequantizan a FP16/BF16, perdiendo las ventajas de velocidad y memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), SGLang, y también puede usarse con llama.cpp si se convierte a GGUF (aunque no se proporciona en este repo).
- Latencia y throughput: no se especifican, pero al ser un modelo de 1B y FP8, se espera alta velocidad en GPUs modernas, con throughput del orden de miles de tokens por segundo en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tamaño | Formato |
|---|---|---|---|---|---|
| liodon-ai/Llama-3.2-1B-Instruct-FP8 | 1,24B | No disponible | other | 1,5 GB | FP8 safetensors |
| unsloth/Llama-3.2-1B-Instruct | 1,24B | 128K (presumible) | Llama 3.2 Community | 2,5 GB | BF16 safetensors |
| RedHatAI/Llama-3.2-1B-Instruct-FP8 | 1,24B | 128K | other | ~1,5 GB | FP8 safetensors |

La comparativa se basa en datos públicos de modelos similares. La versión de Liodon AI ofrece el mismo tamaño y arquitectura que otras cuantizaciones FP8, con la ventaja de no requerir calibración. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera pérdida de precisión en comparación con el modelo original, aunque al ser una conversión directa sin calibración, el impacto suele ser mínimo.
- Requiere hardware NVIDIA con compute capability ≥ 8.9 para aprovechar la aceleración FP8; en GPUs más antiguas, el modelo se dequantiza y se pierde la ventaja de memoria y velocidad.
- Licencia "other": es necesario revisar la licencia del modelo base (Llama 3.2 Community License) para uso comercial, ya que la cuantización no cambia los términos.
- El modelo es pequeño (1B), por lo que su capacidad de razonamiento complejo, generación de código extenso o manejo de contextos muy largos es limitada.
- No se proporcionan métricas de sesgo o alucinación específicas para esta versión; se heredan las del modelo base.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/liodon-ai/Llama-3.2-1B-Instruct-FP8)
- [Modelo base unsloth/Llama-3.2-1B-Instruct](https://huggingface.co/unsloth/Llama-3.2-1B-Instruct)
- [Repositorio llm-compressor](https://github.com/vllm-project/llm-compressor) (mencionado en la model card)
