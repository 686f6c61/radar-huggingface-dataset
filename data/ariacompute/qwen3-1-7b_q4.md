# ariacompute/qwen3-1.7b_q4

## Resumen

Qwen3-1.7B es un modelo de lenguaje denso Transformer decoder-only de 1.700 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud, preentrenado sobre corpus públicos diversos y alineado mediante fine-tuning supervisado (SFT) y optimización directa de preferencias (DPO). Esta distribución concreta, publicada por Aria Compute, es un paquete cuantizado uniforme de 4 bits que emplea rotación de Hadamard y cuantización con codebooks Lloyd-Max por grupos (tamaño de grupo 32). El resultado es un bundle de aproximadamente 1,1 GB, frente a los 3,4 GB del original en FP16, lo que supone una compresión de 3,1 veces.

La relevancia de este modelo radica en su capacidad para ejecutar inferencia completamente en local, sobre CPU, en dispositivos con recursos limitados como teléfonos móviles, placas de desarrollo y pasarelas IoT, sin necesidad de conexión a la nube. El runtime Aria Engine permite desplegar capacidades de generación de texto, tool calling y embeddings en entornos de borde, manteniendo la licencia Apache 2.0 del modelo base. Está orientado a tareas de generación de texto de longitud corta y media, con soporte multilingüe (inglés, chino y más de 20 idiomas adicionales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen3) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (configuracion del bundle) |
| Tipos de cuantizacion | 4-bit (Hadamard + Lloyd-Max, group_size 32); tambien disponibles variantes q326_channel y q8 |
| Idiomas soportados | Ingles, chino y mas de 20 idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | aria-engine (bundle cuantizado propietario) |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B emplea una arquitectura Transformer densa con 28 capas, tamaño oculto de 2.048, dimension intermedia de FFN de 6.144, 16 cabezales de atencion de consulta y 8 cabezales KV con agrupacion GQA de grupo 2, dimension de cabezal de 128 y codificacion posicional RoPE con theta de 1.000.000. La activacion es SiLU con gating estilo SwiGLU. El preentrenamiento se realizo sobre corpus publicos como RedPajama-Data-1T, The Pile y The Stack, seguido de SFT y DPO para alineacion.

La cuantizacion aplicada por Aria Compute es el punto mas distintivo: utiliza rotacion de Hadamard previa a la cuantizacion para reducir la sensibilidad de los pesos, seguida de codebooks Lloyd-Max por grupos de 32 elementos. Los pesos de atencion (Q/K/V/O) y de las capas FFN (up/gate/down) se cuantizan a 4 bits, mientras que las capas RMSNorm y la tabla de embeddings se conservan en FP16. El proceso es libre de calibracion, es decir, no requiere datos de calibracion especificos de la tarea, lo que simplifica la reproduccion y adaptacion a distintos dominios.

## Capacidades

- Generacion de texto y chat conversacional en local, con inferencia offline completa en CPU.
- Soporte de tool calling y function calling para integracion con APIs moviles y de IoT.
- Capacidad de generar embeddings de texto ligeros para tareas de recuperacion y clasificacion en el dispositivo.
- Resumen de contenido corto, como notificaciones, mensajes y texto local.
- Multilingue: ingles (principal), chino y mas de 20 idiomas adicionales, con rendimiento optimizado para los dos primeros.
- Sin capacidades multimodales: es un modelo solo texto, sin soporte de vision, audio o speech en tiempo real.
- No incluye modo de pensamiento explicito (thinking mode) documentado en la informacion proporcionada.

## Casos de uso

- **Asistente conversacional on-device**: el modelo puede mantener conversaciones multi-turno de forma completamente local, sin enviar datos a servidores externos, ideal para aplicaciones de privacidad estricta o entornos sin conectividad. Su ventana de 4K tokens permite gestionar contextos de chat moderados.
- **Completado de texto en tiempo real**: gracias a su tamano reducido y a la ejecucion en CPU, puede integrarse en editores de texto o aplicaciones de mensajeria para sugerir frases y completar oraciones con latencia baja en dispositivos moviles o de escritorio.
- **Tool calling para APIs moviles y IoT**: el soporte de function calling permite al modelo invocar acciones concretas en APIs locales, como encender dispositivos inteligentes, consultar sensores o gestionar calendarios, sin depender de la nube.
- **Recuperacion y clasificacion local**: los embeddings generados por el modelo pueden alimentar sistemas de busqueda semantica y clasificacion de documentos en el dispositivo, sin transferir datos personales a servicios externos.
- **Resumen de notificaciones y mensajes**: puede generar resumenes cortos de correos, mensajes de chat o alertas, util para aplicaciones de productividad en moviles con recursos limitados.
- **Asistente de codigo para funciones cortas**: el modelo puede generar o completar funciones simples de programacion, aunque no es fiable para sintesis de programas completos ni razonamiento complejo. Es adecuado para snippets concretos en editores ligeros.
- **Clasificacion de texto en pasarelas IoT**: con 1,1 GB de pesos, puede ejecutarse en pasarelas de borde (1-2 GB de RAM) para clasificar mensajes o eventos sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. El unico dato de rendimiento declarado por el autor es una metrica de consistencia de generacion comparada con la referencia FP16, pendiente de auditoria:

| Metrica | Valor (referencia qwen3-0.6b_q4) |
|---|---|
| Mean token overlap | 0,1878 |
| Exact prefix fraction | 0,0729 |
| Logprob delta | -0,172159 |

Estos valores corresponden al modelo de referencia de 0,6B con la misma receta de cuantizacion; los resultados para qwen3-1.7b_q4 estan pendientes de auditoria y no se han publicado. No se dispone de datos de rendimiento comparativo con otros modelos cuantizados.

## Requisitos de hardware

- **Memoria total**: aproximadamente 1,26 GB en configuracion de contexto 4K, desglosados en ~1,1 GB de pesos cuantizados (con mmap), ~112 MB de KV cache y ~50 MB de overhead del runtime.
- **Dispositivos compatibles**: smartphones de gama alta (8 GB RAM) y media (4-6 GB), Raspberry Pi 5 o SBC con 4-8 GB, pasarelas IoT con 1-2 GB (marginal), wearables con 1 GB no compatibles.
- **GPU**: no se requiere GPU; el modelo esta disenado para inferencia en CPU. No se soporta aceleracion por GPU ni batch inference en este bundle.
- **Opciones de despliegue**: runtime Aria Engine (propietario) disponible en ariacompute.com. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no se han publicado datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| ariacompute/qwen3-1.7b_q4 | 1,7B | 4K (bundle) | 4-bit (Hadamard+Lloyd-Max) | Apache 2.0 | aria-engine |
| Qwen/Qwen3-0.6B | 0,6B | 32K (original) | No cuantizado (FP16) | Apache 2.0 | safetensors |
| Qwen/Qwen3-4B | 4B | 32K (original) | No cuantizado (FP16) | Apache 2.0 | safetensors |

El modelo cuantizado de Aria Compute ofrece una ventaja de compresion frente a los pesos FP16 del Qwen3-1.7B original (1,1 GB vs 3,4 GB), a costa de una ventana de contexto reducida (4K vs 32K) y de una perdida de calidad de generacion que aun no ha sido auditada. En comparacion con Qwen3-0.6B, el modelo de 1,7B mantiene la misma configuracion de KV cache (28 capas, 8 cabezas KV, head_dim 128), lo que facilita la migracion entre ambos. No se dispone de benchmarks estandarizados que permitan comparar rendimiento directo.

## Limitaciones y advertencias

- **Calidad de generacion pendiente de auditoria**: los resultados de consistencia de generacion no estan verificados; el autor indica que se espera una auditoria externa (gen_quant_eval).
- **Perdida de calidad por cuantizacion**: la referencia en qwen3-0.6b_q4 muestra una solapamiento de tokens medio de solo 0,1878 y una fraccion de prefijo exacto de 0,0729, lo que indica una desviacion significativa respecto al FP16.
- **Contexto limitado**: la configuracion del bundle fija la ventana en 4K tokens, muy por debajo de los 32K del modelo original, lo que restringe tareas que requieren contexto largo.
- **Limitaciones de generacion**: no es adecuado para escritura creativa larga (>2K tokens por generacion), demostracion de teoremas o razonamiento multi-paso complejo.
- **Sintesis de codigo limitada**: solo fiable para funciones cortas; no para programas completos.
- **Sin multimodalidad**: solo texto, sin soporte de vision ni audio.
- **Restricciones de despliegue**: disenado para CPU y single-prompt; no soporta batch inference ni aceleracion GPU, lo que limita su uso en entornos de produccion con alta concurrencia.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgo ni de tasas de alucinacion para este bundle; el modelo base puede presentar sesgos derivados de los corpus de preentrenamiento (The Pile, RedPajama, The Stack).
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el runtime Aria Engine puede tener condiciones adicionales que deben revisarse en ariacompute.com.

## Enlaces

- [HuggingFace - ariacompute/qwen3-1.7b_q4](https://huggingface.co/ariacompute/qwen3-1.7b_q4)
- [Hugging Face - Qwen/Qwen3-1.7B (modelo base)](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Repositorio oficial Qwen3](https://github.com/QwenLM/Qwen3)
- [Aria Compute (dashboard y runtime)](https://ariacompute.com)
- [Qualcomm AI Hub - Qwen3-1.7B](https://aihub.qualcomm.com/models/qwen3_1_7b)
- [LocalLLMs - Qwen3-1.7B](https://localllms.dev/llm/qwenqwen3-17b/)
- [Guia completa de la familia Qwen3](https://insiderllm.com/guides/qwen3-complete-guide/)
