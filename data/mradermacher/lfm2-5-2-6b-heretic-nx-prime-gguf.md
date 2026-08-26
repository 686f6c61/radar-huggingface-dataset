# mradermacher/LFM2.5-2.6B-Heretic-NX-PRIME-GGUF

## Resumen

LFM2.5-2.6B-Heretic-NX-PRIME-GGUF es una cuantización en formato GGUF del modelo LFM2.5-2.6B-Heretic-NX-PRIME, una variante "heretic" (probablemente abliterada o decensurada) del modelo LFM2.5-2.6B desarrollado por Liquid AI. El modelo base es un transformer denso de 2.600 millones de parámetros, diseñado específicamente para cargas de trabajo agénticas en dispositivos, con una ventana de contexto de 128.000 tokens y soporte nativo de tool calling. Según el blog oficial de Liquid AI, alcanza una velocidad de 220 tokens por segundo con un uso de memoria inferior a 2,5 GB, lo que lo hace adecuado para despliegue en hardware de consumo.

Esta ficha se centra en la versión cuantizada publicada por mradermacher, que incluye múltiples niveles de cuantización (desde Q2_K hasta F16) y está pensada para facilitar la ejecución local con llama.cpp, Ollama u otros motores compatibles con GGUF. La variante "Heretic" busca reducir las restricciones de censura del modelo original, aunque no se dispone de documentación oficial que detalle el proceso de modificación. La información sobre el modelo base es abundante, pero los detalles específicos de esta variante son limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (dense, basada en transformer con atención lineal) |
| Parametros totales | 2.600 millones (2,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | 16 idiomas (no especificados en la información disponible) |
| Licencia | lfm1.0 (modelo base); la variante Heretic no especifica licencia propia |
| Formato de pesos | GGUF (safetensors disponible en el repositorio original) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B utiliza la arquitectura LFM2, una evolución híbrida que combina capas de atención lineal con mecanismos de mezcla de expertos (aunque el modelo es denso, no MoE). Según la implementación de referencia en GitHub, se actualizó el vocabulario, la longitud de contexto, la base de RoPE y el tokenizador respecto a versiones anteriores. El entrenamiento se centró en tareas agénticas: planificación, llamada de herramientas y razonamiento multi-paso. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de post-entrenamiento (RLHF, DPO, etc.) en la información disponible.

La variante "Heretic-NX-PRIME" es un ajuste posterior no documentado oficialmente. El nombre sugiere una eliminación de restricciones de contenido (abliteration), pero no hay información técnica sobre cómo se realizó ni qué datos se usaron. La cuantización GGUF fue generada por mradermacher mediante conversión estática del modelo original en safetensors.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo está optimizado para tareas que requieren planificación y ejecución secuencial.
- Tool calling nativo: puede invocar funciones externas de forma estructurada, lo que lo hace apto para agentes autónomos.
- Contexto largo: 128K tokens permiten manejar conversaciones extensas, documentos largos o historiales de interacción completos.
- Velocidad de inferencia alta: 220 tok/s en hardware de consumo (según el blog oficial), ideal para aplicaciones en tiempo real.
- Multilingüe: soporta 16 idiomas, aunque no se detalla cuáles.
- Bajo consumo de memoria: menos de 2,5 GB en cuantización adecuada, viable en dispositivos con recursos limitados.
- La variante "Heretic" probablemente reduce la censura y permite generar contenido que el modelo base rechazaría, aunque esto no está verificado.

## Casos de uso

- Asistentes virtuales en dispositivo: el modelo puede ejecutarse localmente en portátiles o mini-PCs para gestionar conversaciones multi-turno con contexto largo, gracias a su ventana de 128K tokens y su baja huella de memoria.
- Automatización de tareas agénticas: con tool calling nativo, puede integrarse en pipelines que requieren consultar APIs, bases de datos o ejecutar comandos, por ejemplo, para gestión de calendarios o correos electrónicos.
- Chatbots de atención al cliente: su capacidad multilingüe y su velocidad permiten desplegar sistemas de soporte en tiempo real sin depender de la nube, reduciendo costes y latencia.
- Generación de código asistida: aunque no está especializado en código, su razonamiento multi-paso y tool calling pueden usarse para autocompletar o refactorizar fragmentos en entornos de desarrollo integrados.
- Procesamiento de documentos largos: el contexto de 128K permite resumir o extraer información de informes extensos, contratos o artículos académicos en una sola pasada.
- Prototipado de agentes de investigación: su tamaño compacto y velocidad lo hacen adecuado para experimentar con arquitecturas de agentes en entornos académicos o de I+D sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog oficial de Liquid AI menciona la velocidad de 220 tok/s y el uso de memoria inferior a 2,5 GB, pero no proporciona puntuaciones en MMLU, HumanEval, GSM8K u otros tests estandarizados. Tampoco hay datos comparativos con modelos similares en la documentación de la variante Heretic.

## Requisitos de hardware

- VRAM estimada: menos de 2,5 GB para la cuantización Q4_K_M (según el blog oficial). Las cuantizaciones más bajas (Q2_K, Q3_K) pueden reducir aún más el consumo, mientras que F16 requerirá aproximadamente 5,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones más bajas. Para F16 se recomienda una GPU con 6 GB o más (RTX 3060, RTX 4090, etc.).
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, así como en CPUs modernas con suficiente RAM (usando llama.cpp).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible), TGI (con adaptaciones).
- Latencia y throughput: 220 tok/s en hardware de consumo (según el blog oficial), lo que equivale a una latencia de aproximadamente 4,5 ms por token. En CPU pura, el rendimiento será menor, pero aún utilizable para tareas interactivas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-2.6B (base) | 2,6B | 128K | Sí | lfm1.0 | safetensors, GGUF |
| Qwen2.5-3B | 3,0B | 32K | Sí | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B | 3,2B | 128K | Sí | Llama 3.2 Community | safetensors, GGUF |
| SmolLM2-1.7B | 1,7B | 8K | No | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en características conocidas de los modelos base, no en benchmarks. LFM2.5-2.6B destaca por su contexto largo y su enfoque agéntico, mientras que Qwen2.5-3B y Llama-3.2-3B tienen ecosistemas más maduros y documentación más extensa. La variante Heretic añade una capa de "decensura" que no está presente en los otros modelos.

## Limitaciones y advertencias

- La variante "Heretic" no tiene documentación oficial; el proceso de abliteración puede introducir inconsistencias o reducir la calidad del modelo en tareas estándar.
- Al ser una versión decensurada, puede generar contenido ofensivo, ilegal o perjudicial. No es adecuada para aplicaciones comerciales sin moderación adicional.
- La licencia lfm1.0 del modelo base impone restricciones de uso comercial; es necesario revisar los términos exactos antes de desplegar en producción.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.
- El soporte multilingüe se declara en 16 idiomas, pero no se especifica cuáles ni la calidad en cada uno.
- La cuantización GGUF puede degradar ligeramente la precisión respecto al modelo en FP16, especialmente en cuantizaciones muy agresivas como Q2_K.
- El modelo base está optimizado para tareas agénticas; su rendimiento en generación de texto creativo o razonamiento matemático puede ser inferior al de modelos generalistas del mismo tamaño.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/LFM2.5-2.6B-Heretic-NX-PRIME-GGUF
- Modelo original (safetensors): https://huggingface.co/0xzknw/LFM2.5-2.6B-Heretic-NX-PRIME
- Modelo base LFM2.5-2.6B en HuggingFace: https://huggingface.co/mradermacher/LFM2.5-2.6B-heretic-GGUF (variante similar)
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Implementación PyTorch de referencia: https://github.com/rishikksh20/lfm25-pytorch/
