# ariacompute/qwen3.5-2b_q8

## Resumen
Qwen3.5-2B es un modelo de lenguaje denso de 2.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud, con una arquitectura híbrida que combina atención lineal DeltaNet y atención completa en una proporción 3:1. Este diseño permite un contexto nativo de 256.000 tokens con una huella de memoria reducida. El modelo ha sido pre-entrenado sobre corpus públicos diversos (RedPajama, The Pile, The Stack) y alineado mediante SFT y DPO.

La distribución presentada aquí, `ariacompute/qwen3.5-2b_q8`, es un paquete cuantizado por Aria Compute que aplica cuantización uniforme de 8 bits por grupo (g=32) con preprocesamiento Hadamard. El resultado es un bundle de aproximadamente 2,1 GB (frente a los ~4 GB en BF16), lo que supone una compresión de 1,9× con una degradación de calidad casi nula (logprob delta de +0,00685 en el método de referencia). Está diseñado para inferencia local en CPU, en dispositivos móviles, edge y SBC, sin necesidad de GPU ni conexión a la nube.

La relevancia actual de este modelo radica en su equilibrio entre capacidad (2B, contexto largo de 256K) y eficiencia para despliegue on-device, lo que lo convierte en una opción práctica para aplicaciones de asistencia local, generación de código y tool calling en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido (DeltaNet + full-attention, ratio 3:1) |
| Parametros totales | 2.000 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens (nativo) |
| Tipos de cuantizacion | 8-bit per-group (g=32) con pre-procesamiento Hadamard |
| Idiomas soportados | Inglés (principal), chino y más de 20 idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (bundle propio de Aria Engine) |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-2B es un transformer decoder-only denso que combina capas de atención lineal (DeltaNet) con capas de atención completa en una proporción de 3 a 1. Esta hibridación permite procesar secuencias largas de hasta 256K tokens con un coste computacional reducido en comparación con una atención completa pura. El entrenamiento se realizó sobre corpus públicos (RedPajama-Data-1T, The Pile y The Stack) y posteriormente se aplicó un pipeline de alineación con SFT y DPO para mejorar el seguimiento de instrucciones y la capacidad de razonamiento.

El bundle cuantizado de Aria Compute aplica una cuantización uniforme de 8 bits por grupo (g=32) con pre-procesamiento Hadamard, que no requiere datos de calibración específicos. Los pesos de atención (Q/K/V/O) y de las capas FFN (up/gate/down) se cuantizan a 8 bits, mientras que las normas RMSNorm y la tabla de embeddings se mantienen en FP16 para preservar la calidad. Esta receta produce una degradación casi nula respecto al modelo en FP16, con un logprob delta de +0,00685 en la referencia de método.

## Capacidades
- Generación de texto y completación de secuencias para chat, asistencia y redacción.
- Razonamiento y seguimiento de instrucciones gracias al alineamiento SFT + DPO.
- Generación de código en múltiples líneas y autocompletado en tiempo real.
- Tool calling y function calling para integración con APIs móviles e IoT.
- Embeddings de texto ligeros para tareas de recuperación y clasificación local.
- Soporte multilingüe: inglés y chino como idiomas principales, con más de 20 idiomas adicionales.
- Capacidad de procesar contextos largos (hasta 256K tokens) mediante chunking para análisis documental.
- Inferencia completamente offline y en CPU, sin dependencia de servicios externos.

## Casos de uso
- **Asistentes conversacionales on-device**: el modelo puede ejecutar chat multi-turno directamente en el móvil o en un edge device, sin conexión a internet, gracias a su tamaño reducido y su capacidad de contexto largo. Es adecuado para asistentes personales que necesiten recordar el historial de conversación.
- **Generación de código en el dispositivo**: para desarrolladores que trabajan en entornos sin conexión, el modelo puede autocompletar código y generar fragmentos en múltiples lenguajes, aprovechando su entrenamiento sobre The Stack.
- **Tool calling para APIs de IoT**: mediante la integración con Aria Engine, el modelo puede interpretar comandos y llamar funciones de APIs locales, por ejemplo para controlar dispositivos domésticos inteligentes o sensores.
- **Análisis y resumen de documentos locales**: con su ventana de contexto de 256K tokens, puede procesar documentos largos (por ejemplo, informes o manuales) y generar resúmenes de forma local, sin subir datos a la nube.
- **Clasificación y recuperación de texto**: usando las embeddings que el modelo genera, se pueden construir sistemas de búsqueda semántica o clasificación de notificaciones y mensajes directamente en el dispositivo.
- **Asistencia de escritura y corrección**: el modelo puede sugerir reescrituras, corregir errores y completar frases en aplicaciones de mensajería o procesadores de texto, funcionando completamente offline.

## Benchmarks y rendimiento
El autor no ha publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. En su lugar, la model card incluye una métrica de consistencia de generación frente al modelo FP16, con datos del método de referencia (qwen3-0.6b_q8), aún pendientes de auditoría por parte de la herramienta `gen_quant_eval`.

| Tarea | Métrica | Valor | Verificado |
|---|---|---|---|
| Consistencia de generación (vs FP16) | mean_token_overlap | 0.6429 | No |
| Consistencia de generación (vs FP16) | exact_prefix_frac | 0.3854 | No |
| Consistencia de generación (vs FP16) | logprob_delta | +0.00685 | No |

Estos valores indican una degradación casi nula en términos de probabilidad logarítmica, aunque la verificación está pendiente. No hay otros datos de rendimiento disponibles.

## Requisitos de hardware

Según la documentación de Aria Compute, el bundle q8 requiere aproximadamente 2,3 GB de memoria runtime a 4K contexto, desglosados de la siguiente manera:

- ~2,0 GB para pesos cuantizados (con mmap)
- ~96 MB para KV cache (moderada, 24 capas × 2 KV heads × head_dim=256)
- ~80 MB de overhead del runtime
- ~140 MB de overhead de codebooks

La tabla de dispositivos soportados es:

| Plataforma | Memoria runtime | Viabilidad |
|---|---|---|
| Smartphone de gama alta (8 GB) | ~2.3 GB | Sí, near-lossless |
| Smartphone de gama media (4–6 GB) | ~2.3 GB | Sí |
| Móvil económico (2–3 GB) | ~2.3 GB | Ajustado, funcional para contextos cortos |
| Raspberry Pi 5 / SBC (4–8 GB) | ~2.3 GB | Sí |
| IoT gateway (1–2 GB) | ~2.3 GB | No suficiente |
| Wearable (1 GB) | ~2.3 GB | No suficiente |

No se requiere GPU; la inferencia es exclusivamente en CPU. El despliegue se realiza mediante el runtime propietario Aria Engine (no compatible con vLLM, llama.cpp, Ollama o TGI). No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks para comparar con otros modelos de la misma categoría (por ejemplo, otros modelos de 2B como Qwen3-2B o Llama-3.2-2B). Sin embargo, se puede comparar el bundle cuantizado con el modelo base en BF16:

| Modelo | Tamaño | Contexto | Calidad (logprob delta) | Licencia |
|---|---|---|---|---|
| Qwen3.5-2B (BF16) | ~4 GB | 256K | Referencia | Apache 2.0 |
| Qwen3.5-2B (q8, este bundle) | ~2.1 GB | 256K | +0.00685 | Apache 2.0 |

Además, el autor menciona otras variantes de cuantización (q4 y q3268) que ofrecen tamaños más reducidos, pero no se proporcionan datos de rendimiento para ellas.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han documentado sesgos específicos en la información disponible, pero, como cualquier LLM, puede generar contenido incorrecto o inventado, especialmente en contextos largos.
- **Alcance limitado**: el modelo no es adecuado para escritura creativa larga (>4K tokens por generación), demostración matemática formal, síntesis de aplicaciones completas o procesamiento multimodal (texto solo).
- **Sin soporte para batch inference ni GPU**: el bundle está optimizado para inferencia de una sola petición en CPU; no es recomendable para entornos de producción con carga concurrente o aceleración por GPU.
- **KV cache grande**: la KV cache es ~2.4× mayor que la del modelo Qwen3.5-0.8B, lo que puede limitar el contexto efectivo en dispositivos con poca RAM.
- **Dependencia de Aria Engine**: el bundle utiliza el runtime propietario de Aria Compute, lo que implica que no es directamente desplegable con frameworks estándar como vLLM o llama.cpp.
- **Licencia**: el modelo base tiene licencia Apache 2.0, pero la distribución cuantizada puede estar sujeta a términos adicionales de Aria Compute; se recomienda revisar el dashboard de Aria para condiciones de uso comercial.

## Enlaces

- [Hugging Face - ariacompute/qwen3.5-2b_q8](https://huggingface.co/ariacompute/qwen3.5-2b_q8)
- [Modelo base en Hugging Face - Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Repositorio original Qwen3.5](https://github.com/QwenLM/Qwen3.5)
- [Documentación técnica de Qwen3.5](https://github.com/QwenLM/Qwen3.5)
- [Aria Compute Dashboard](https://ariacompute.com/dashboard/models)
- [Aria Engine](https://ariacompute.com)
- [Repositorio de modelos de Aria en GitHub](https://github.com/ariacompute/model/tree/main/qwen/qwen3.5-2b)
