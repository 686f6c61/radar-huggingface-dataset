# Sawfwair/LFM2.5-1.2B-Instruct-QAD-MLX-4bit

## Resumen

LFM2.5-1.2B-Instruct-QAD-MLX-4bit es una conversión al framework MLX del checkpoint cuantizado QAD de Liquid AI para el modelo LFM2.5-1.2B-Instruct. El modelo original es un LLM híbrido de 1.17B parámetros, diseñado para despliegue en dispositivos edge, con una ventana de contexto de 32.768 tokens y un presupuesto de entrenamiento de 28T tokens. La variante QAD (Quantization-Aware Distillation) emplea destilación para recuperar la precisión perdida en la cuantización a 4 bits, manteniendo un tamaño compacto y altas velocidades de inferencia. Este repositorio, creado por Sawfwair, es una conversión determinista del GGUF Q4_0 a MLX nativo, conservando exactamente los valores cuantizados y permitiendo su uso en Apple Silicon.

La relevancia de este modelo radica en que ofrece un rendimiento competitivo frente a modelos de mayor tamaño, con un consumo de memoria inferior a 1 GB y una velocidad de hasta 239 tokens por segundo en CPU AMD y 82 tokens/s en NPU móvil según los datos de Liquid AI para el GGUF original. Es especialmente adecuado para tareas de agente, extracción de datos y RAG, y se recomienda para entornos con recursos limitados. La conversión MLX permite ejecutarlo de forma eficiente en dispositivos Mac con Apple Silicon, aunque el checkpoint GGUF también es compatible con llama.cpp y vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas (10 bloques de convolución doble-gated + 6 bloques GQA) |
| Parametros totales | 223.738.624 (checkpoint MLX cuantizado; el modelo original tiene 1.17B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit (Q4_0) para proyecciones y 6-bit (Q6_K) para embeddings en este checkpoint; también existen versiones 8-bit del modelo original |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano y español |
| Licencia | LFM Open License (lfm1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct es un transformer híbrido de 16 capas: 10 bloques de convolución doble-gated (doble convolución con compuerta) y 6 bloques de atención con consultas agrupadas (GQA). Se entrenó con un presupuesto de 28T tokens, incluyendo pre-entrenamiento extendido y aprendizaje por refuerzo multi-etapa. La variante QAD se entrenó mediante destilación de cuantización (Quantization-Aware Distillation), donde un profesor de alta precisión destila conocimiento en un estudiante cuantizado a 4 bits, recuperando gran parte de la exactitud perdida por la cuantización post-hoc.

Este repositorio específico es una conversión MLX del archivo GGUF `LFM2.5-1.2B-Instruct-QAD-Q4_0.gguf` de Liquid AI. El autor ha preservado los nibbles de proyección Q4_0 y las escalas de bloque FP16 exactamente, reempaquetándolos en tensores MLX afines de 4-bit/grupo-32 con `bias = -8 * scale`. El embedding de tokens, que originalmente estaba en Q6_K, se decodificó y re-cuantizó a MLX afín de 6-bit/grupo-64. El archivo `MERERUN_CONVERSION.json` registra las entradas y hashes de salida para verificar la conversión. No se han publicado detalles adicionales sobre el entrenamiento del modelo original más allá de los indicados en la card oficial.

## Capacidades

- Generación de texto y conversación en formato ChatML, con capacidad de seguir instrucciones complejas.
- Soporte de tool calling y funciones, recomendado por Liquid AI para tareas de agentes autónomos.
- Extracción de datos estructurados de texto no estructurado, útil para pipelines de RAG.
- Capacidades multilingües en 8 idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Razonamiento básico y resolución de tareas de lógica, aunque no está optimizado para razonamiento profundo ni programación.
- No soporta entrada de visión ni audio; es un modelo solo de texto.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 32.768 tokens, y su capacidad de tool calling permite consultar bases de datos o sistemas externos en tiempo real.
- **Extracción de datos en documentos**: se puede integrar en un pipeline para extraer entidades, fechas, nombres y relaciones de contratos, correos o formularios en varios idiomas.
- **RAG (generación aumentada por recuperación)**: el modelo puede responder preguntas sobre un corpus corporativo combinado con un buscador vectorial, gracias a su capacidad de seguir instrucciones y su contexto amplio.
- **Agentes autónomos en dispositivos móviles**: su tamaño reducido permite ejecutarse en un móvil o portátil, actuando como asistente personal que ejecuta tareas como programar citas, enviar recordatorios o consultar APIs.
- **Moderación y clasificación de contenido**: puede etiquetar textos en categorías predefinidas (por ejemplo, spam, toxicidad, urgencia) con una configuración de prompt simple.
- **Traducción y resumen multilingüe**: genera resúmenes en los 8 idiomas soportados, útil para equipos internacionales que necesitan procesar documentos en varios idiomas.
- **Chatbots de soporte técnico**: puede resolver consultas frecuentes y derivar casos complejos a humanos, manteniendo el contexto de la conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La card original del modelo LFM2.5-1.2B-Instruct no incluye métricas numéricas (MMLU, HumanEval, etc.) en el material proporcionado. La documentación de QAD menciona que la destilación recupera la precisión perdida por cuantización, pero no se ofrecen cifras concretas en las fuentes consultadas.

## Requisitos de hardware

- **VRAM estimada**: menos de 1 GB para el checkpoint 4-bit, según las especificaciones de Liquid AI para el modelo GGUF Q4_0. La conversión MLX mantiene un tamaño similar (0.8 GB en el repositorio).
- **GPU recomendadas**: Apple Silicon (M1, M2, M3 y posteriores) para MLX. Para el GGUF original, se puede ejecutar en CPU AMD con 239 tok/s y en NPU móvil con 82 tok/s según Liquid.
- **GPU consumer**: el modelo cabe en GPUs de 4 GB (por ejemplo, RTX 3050, GTX 1650) si se usa el formato GGUF con llama.cpp, aunque no es el objetivo principal de este repo MLX.
- **Opciones de despliegue**: MLX (para Apple Silicon), llama.cpp (para CPU/GPU), vLLM (para servidores) y TGI. Este checkpoint concreto solo es compatible con MLX.
- **Latencia y throughput**: no hay datos específicos para esta conversión MLX. Los valores de 239 tok/s y 82 tok/s corresponden al GGUF original en CPU AMD y NPU móvil, respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-QAD-MLX-4bit | 1.17B (original) | 32.768 | 8 | LFM Open License | MLX |
| Qwen2.5-1.5B-Instruct | 1.54B | 32.768 | 29+ | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1.23B | 128K | 8 | Llama 3.2 Community | safetensors, GGUF |
| Gemma-2-2B | 2.6B | 8K | 16 | Gemma License | safetensors, GGUF |

No se dispone de datos comparativos de rendimiento (benchmarks) entre estos modelos en las fuentes consultadas. La comparativa se limita a características técnicas.

## Limitaciones y advertencias

- **Conocimiento limitado**: el modelo fue entrenado con datos hasta mediados de 2024, por lo que no conoce eventos posteriores.
- **No recomendado para programación**: la card original indica que no es adecuado para tareas de código ni conocimiento intensivo, por lo que su uso en generación de software puede producir errores.
- **Riesgo de alucinación**: como todo LLM, puede generar información plausible pero incorrecta, especialmente en dominios especializados.
- **Sesgos**: los datos de entrenamiento pueden introducir sesgos lingüísticos o culturales; no se han publicado evaluaciones de sesgo.
- **Idiomas limitados**: solo soporta 8 idiomas; en lenguas fuera de ese conjunto el rendimiento será bajo.
- **Licencia LFM**: la licencia Open de Liquid AI (lfm1.0) es una licencia de código abierto con condiciones específicas que deben revisarse antes de un uso comercial (incluye restricciones sobre uso militar y ciertas aplicaciones).
- **Cuantización**: aunque QAD recupera parte de la precisión, la cuantización a 4-bit puede degradar la calidad en tareas que requieren alta exactitud.
- **Formato MLX**: este checkpoint solo es ejecutable con MLX, limitado a Apple Silicon; para otros entornos debe usarse el GGUF original.

## Enlaces

- [HuggingFace - Sawfwair/LFM2.5-1.2B-Instruct-QAD-MLX-4bit](https://huggingface.co/Sawfwair/LFM2.5-1.2B-Instruct-QAD-MLX-4bit)
- [HuggingFace - LiquidAI/LFM2.5-1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct)
- [HuggingFace - LiquidAI/LFM2.5-1.2B-Instruct-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF)
- [Blog de Liquid AI - Introduciendo LFM2.5](https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai)
- [Blog de Liquid AI - QAD: Quantization-Aware Distillation](https://www.liquid.ai/blog/qad)
- [Documentación de Liquid - LFM2.5-1.2B-Instruct](https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct)
- [Paper arxiv 2511.23404](https://arxiv.org/abs/2511.23404) (referenciado en los tags)
